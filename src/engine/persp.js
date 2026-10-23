/* src/engine/persp.js — NP.view3d: the pseudo-3D overworld view (tilted ground plane, solid 3D buildings, upright 2D billboards for
 * people, trees and props), in the manner of a 5th-generation DS RPG town. On by default; NP.view3d.on = false falls back to the flat
 * renderer in tilemap.js (V toggles it in the browser).
 *
 * The camera is a real pinhole camera: it hovers `hh` = pivotRow − hz map pixels above the ground, `f` map pixels behind the pivot,
 * looking level along the heading, with the horizon on screen row `hz` (above the top of the screen, so the view looks down at the
 * ground). A map point (x, y) at height z lands on screen at
 *     sx = W/2 + u·s,   sy = hz + (hh − z)·s,   s = f / (f + v)
 * where u / v are the point's offsets right of / ahead of the pivot. The pivot itself lands on row `pivotRow` at scale exactly 1.
 *
 * How a frame is drawn (all CPU, into a Bitmap, so it runs headless):
 *  1. Ground: the terrain (plus floor-layer stamps) is rendered flat once into an off-screen bitmap with a margin of border tiles;
 *     each screen row samples it in perspective (mode-7 style), fading to the fog colour with distance. Depth buffer = +inf.
 *  2. Buildings (stamps listed in V.BOX): solid boxes. The stamp art is split at its eave: the facade becomes the front wall, the
 *     roof art the front slope of a hip roof, anything above the roof (flags, antennas) an upright card on the ridge. Side and back
 *     walls, the back slope and the hip ends are generated from sampled facade / roof colours. Faces are texture-mapped with exact
 *     perspective (a 2×2 solve per pixel), back-face culled against the camera position and written to the depth buffer.
 *  3. Billboards: other stamps (trees, lamps, signs...) and actors, upright sprites scaled by the depth of their base point, sorted
 *     far-to-near and depth-tested against the buildings, so people really walk behind and beside houses.
 *
 * Camera direction is NOT a player setting: each map (def.camera = quarter turns, 0 = looking north, 1 = east, 2 = south, 3 = west)
 * and each area inside a map (def.cameraZones = [{x,y,w,h,camera}]) says where the camera looks, and it eases round by itself as the
 * player walks in (V.aim). Controls and sprite facings are remapped by quarter turn (V.screenToMap / V.viewDir).
 *
 * Tuning: NP.view3d.cfg = { f, hz, pivotRow, fogStart, fogEnd, fog }.   Presets: NP.view3d.preset('street'|'town'|'flat-ish').
 * API: on, toggle(), draw(tm, fb, camX, camY, tick, actors), project(mapX, mapY, z?) -> {x, y, scale, v} | null, BOX (building table).
 */
(function (root) {
  'use strict';
  const NP = (root.NP = root.NP || {});
  const { Bitmap } = NP;
  const M = Math, INF = Infinity; // locals: global lookups are slow in Node's vm sandbox (tests, previews)
  const T = 16, SW = NP.W, SH = NP.H, CX = SW / 2, CY = SH / 2, MARGIN = 14;

  const PRESETS = {
    street: { f: 200, hz: -150, pivotRow: 112, fogStart: 170, fogEnd: 640, fog: '#bcd8f2' },
    town: { f: 250, hz: -170, pivotRow: 110, fogStart: 210, fogEnd: 780, fog: '#c4dcef' },
    'flat-ish': { f: 460, hz: -186, pivotRow: 108, fogStart: 340, fogEnd: 1400, fog: '#cfe3f3' },
  };

  /** Stamps drawn as solid boxes. wall = vertical stretch of the facade art (people are ~1.5 tiles tall, doors need to be taller
   *  than the old art drew them), depth = how far back the box goes in tiles (default: the stamp's height in tiles),
   *  pitch = roof rise per unit of run. */
  const BOX = {
    house_s: {}, house_m: {}, house_l: {}, lab: {}, tea_house: {}, general_store: {}, salon: {},
  };
  const BOX_DEFAULTS = { wall: 1.4, pitch: 0.6, recess: 2, overhang: 3 };

  const V = {
    on: true,
    cfg: Object.assign({}, PRESETS.street),
    BOX,
    _ground: null, _last: null,
    yaw: null,       // current camera heading in radians (null until the first frame: then it snaps, afterwards it eases)
    q: 0,            // target heading in quarter turns, 0..3
    DIRS: ['up', 'right', 'down', 'left'],
    /** quarter turns the camera should have at map tile (x, y): the first matching zone, else the map's own, else 0 */
    quarterFor(tm, x, y) {
      const d = tm && tm.def || {};
      for (const z of d.cameraZones || []) if (x >= z.x && x < z.x + (z.w || 1) && y >= z.y && y < z.y + (z.h || 1)) return z.camera & 3;
      return (d.camera || 0) & 3;
    },
    /** called once per drawn frame by the overworld: set the target heading and ease the camera towards it */
    aim(tm, x, y) {
      V.q = V.quarterFor(tm, x, y);
      const target = V.q * M.PI / 2;
      if (V.yaw === null) { V.yaw = target; return; }
      let diff = target - V.yaw;
      diff -= M.round(diff / (2 * M.PI)) * 2 * M.PI;
      if (M.abs(diff) < 0.004) { V.yaw = target; return; }
      V.yaw += M.sign(diff) * M.min(M.abs(diff), M.max(M.abs(diff) * 0.1, 0.014));
    },
    /** pressed screen direction -> map direction (screen-up walks the way the camera looks) */
    screenToMap(d) { if (!d || !V.on) return d; return V.DIRS[(V.DIRS.indexOf(d) + V.q) & 3]; },
    /** a map-space facing -> the facing the sprite should show from this camera */
    viewDir(d) { if (!V.on || !V.q) return d; return V.DIRS[(V.DIRS.indexOf(d) - V.q + 4) & 3]; },
    toggle() { V.on = !V.on; return V.on; },
    preset(name) { Object.assign(V.cfg, PRESETS[name] || PRESETS.street); },
  };

  const packFog = (c) => NP.Color.parse(c) >>> 0;

  // ------------------------------------------------------------------------------------------------ ground cache
  function groundFor(tm, tick) {
    const key = tick >> 4;
    let g = V._ground;
    const gw = (tm.w + MARGIN * 2) * T, gh = (tm.h + MARGIN * 2) * T;
    if (g && g.tm === tm && g.w === gw && g.key === key && sameGrid(g.grid, tm.grid)) return g;
    if (!g || g.w !== gw || g.h !== gh) g = { bmp: new Bitmap(gw, gh), w: gw, h: gh };
    g.tm = tm; g.key = key; g.grid = tm.grid.slice();
    tm.drawTerrain(g.bmp, -MARGIN * T, -MARGIN * T, tick, gw, gh);
    V._ground = g;
    return g;
  }
  function sameGrid(a, b) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
    return true;
  }

  // ------------------------------------------------------------------------------------------------ projection
  function frameState(camX, camY) {
    const c = V.cfg, hh = c.pivotRow - c.hz, yaw = V.yaw || 0, s = M.sin(yaw), co = M.cos(yaw);
    const px = camX + CX, py = camY + CY;
    // camera position in map space: f behind the pivot along the heading, hh above the ground
    return { f: c.f, hz: c.hz, hh, px, py, Rx: co, Ry: s, Fx: s, Fy: -co, cx: px - c.f * s, cy: py + c.f * co };
  }
  function project(st, x, y, z) {
    const dx = x - st.px, dy = y - st.py;
    const u = dx * st.Rx + dy * st.Ry, v = dx * st.Fx + dy * st.Fy, Z = st.f + v;
    if (Z < st.f * 0.25) return null;
    const scale = st.f / Z;
    return { x: CX + u * scale, y: st.hz + (st.hh - (z || 0)) * scale, scale, v };
  }
  V.project = (x, y, z) => (V._last ? project(V._last, x, y, z) : null);

  // ------------------------------------------------------------------------------------------------ depth buffer
  const zbuf = new Float32Array(SW * SH);

  // ------------------------------------------------------------------------------------------------ fog / shade helpers
  function shadeFog(c, k, fogT, fogC) {
    let r = c & 255, g = (c >>> 8) & 255, b = (c >>> 16) & 255;
    if (k !== 1) { r = M.min(255, r * k); g = M.min(255, g * k); b = M.min(255, b * k); }
    if (fogT > 0.02) {
      r += ((fogC & 255) - r) * fogT; g += (((fogC >>> 8) & 255) - g) * fogT; b += (((fogC >>> 16) & 255) - b) * fogT;
    }
    return (0xff000000 | ((b | 0) << 16) | ((g | 0) << 8) | (r | 0)) >>> 0;
  }
  const fogAt = (v) => { const c = V.cfg; return M.max(0, M.min(1, (v - c.fogStart) / (c.fogEnd - c.fogStart))); };

  // ------------------------------------------------------------------------------------------------ scaled sprite (billboard)
  /** nearest-neighbour scaled blit of src with its anchor (ax, ay) at screen (X, Y), depth-tested at depth v; fog t in 0..1. */
  function sprite(fb, src, ax, ay, X, Y, scale, v, fogT, fogC) {
    const dw = M.max(1, M.round(src.w * scale)), dh = M.max(1, M.round(src.h * scale));
    const x0 = M.round(X - ax * scale), y0 = M.round(Y - ay * scale);
    const du = fb.u32, su = src.u32, W = fb.w, H = fb.h;
    const ya = M.max(0, -y0), yb = M.min(dh, H - y0), xa = M.max(0, -x0), xb = M.min(dw, W - x0);
    const vt = v - 0.5;
    for (let y = ya; y < yb; y++) {
      const sy = M.min(src.h - 1, M.floor(y / scale + 0.0001)) * src.w;
      const di = (y0 + y) * W + x0;
      for (let x = xa; x < xb; x++) {
        if (zbuf[di + x] < vt) continue;
        const c = su[sy + M.min(src.w - 1, M.floor(x / scale + 0.0001))];
        if ((c >>> 24) < 128) continue;
        du[di + x] = shadeFog(c, 1, fogT, fogC);
      }
    }
  }

  // ------------------------------------------------------------------------------------------------ buildings
  /** Split a building stamp's art into facade / roof / topper and generate the hidden faces' textures. Cached per art bitmap. */
  const boxArt = new WeakMap();
  function analyse(img, p) {
    let a = boxArt.get(img);
    if (a) return a;
    const W = img.w, H = img.h, u = img.u32;
    const ext = [];
    for (let y = 0; y < H; y++) {
      let l = -1, r = -1;
      for (let x = 0; x < W; x++) if ((u[y * W + x] >>> 24) > 128) { if (l < 0) l = x; r = x; }
      ext.push([l, r]);
    }
    // eave = the lowest of the widest rows; the facade starts below it
    let eave = 0, best = -1;
    for (let y = 0; y < H; y++) { const w = ext[y][1] - ext[y][0]; if (w >= best) { best = w; eave = y; } }
    if (eave > H - 6) eave = M.floor(H / 2);
    // roof top = the first row of the roof's trapezoid (anything above it that is much narrower is a flag / antenna)
    let roofTop = 0;
    for (let y = 1; y < eave; y++) {
      const w0 = ext[y - 1][1] - ext[y - 1][0], w1 = ext[y][1] - ext[y][0];
      if (ext[y - 1][0] < 0 || w1 - w0 > 12) roofTop = y;
    }
    const bot = ext[H - 1][0] >= 0 ? ext[H - 1] : ext[H - 2];
    const wl = bot[0], wr = bot[1];
    const facade = img.crop(wl, eave + 1, wr - wl + 1, H - eave - 1);
    const roof = img.crop(0, roofTop, W, eave - roofTop + 1);
    const backRoof = plainRoof(roof, ext.slice(roofTop, eave + 1));
    const topper = roofTop > 0 ? img.crop(0, 0, W, roofTop + 2) : null;
    // colours: a plain wall column just inside the left edge, and the roof's body colour
    const col = M.min(facade.w - 1, 3);
    const roofBody = mode(roof, (x, y) => y > 2 && y < roof.h - 3 && x > roof.w * 0.3 && x < roof.w * 0.7);
    const outline = darkest(img);
    const rt = ext[roofTop][0] >= 0 ? ext[roofTop] : ext[eave];
    a = { W, H, wl, wr, eave, roofTop, rtl: rt[0], rtr: rt[1] + 1, facade, roof, backRoof, topper, col, roofBody, outline, sides: new Map() };
    boxArt.set(img, a);
    return a;
  }
  /** the roof art without its features (chimneys, attic windows): each row repeats a 16px strip of plain shingles from its left end */
  function plainRoof(roof, ext) {
    const t = roof.clone(), w = roof.w;
    for (let y = 0; y < roof.h; y++) {
      const [l, r] = ext[y];
      if (l < 0) continue;
      const s0 = l + 3;
      for (let x = s0 + 16; x <= r - 3; x++) t.u32[y * w + x] = roof.u32[y * w + s0 + ((x - s0) % 16)];
    }
    return t;
  }
  /** the most common opaque colour of bmp among pixels where pick(x, y) */
  function mode(bmp, pick) {
    const n = new Map();
    for (let y = 0; y < bmp.h; y++) for (let x = 0; x < bmp.w; x++) {
      const c = bmp.u32[y * bmp.w + x];
      if ((c >>> 24) < 128 || !pick(x, y)) continue;
      n.set(c, (n.get(c) || 0) + 1);
    }
    let best = 0xff808080, k = -1;
    for (const [c, m] of n) if (m > k) { k = m; best = c; }
    return best >>> 0;
  }
  function darkest(bmp) {
    let best = 0xff202020, lum = 1e9;
    for (const c of bmp.u32) {
      if ((c >>> 24) < 128) continue;
      const l = (c & 255) * 3 + ((c >>> 8) & 255) * 6 + ((c >>> 16) & 255);
      if (l < lum) { lum = l; best = c; }
    }
    return best >>> 0;
  }
  /** a side / back wall texture `len` px wide: the facade's plain edge column repeated, with the outline on both ends */
  function sideTex(a, len) {
    const key = len | 0;
    let t = a.sides.get(key);
    if (t) return t;
    const f = a.facade, w = M.max(2, key);
    t = new Bitmap(w, f.h);
    for (let y = 0; y < f.h; y++) {
      const c = f.u32[y * f.w + a.col], e = f.u32[y * f.w];
      for (let x = 0; x < w; x++) t.u32[y * w + x] = x === 0 || x === w - 1 ? e : c;
    }
    a.sides.set(key, t);
    return t;
  }

  /** world-space faces of the building placed at p (cached on the placement; textures from the current art frame) */
  function boxFaces(p, img) {
    const a = analyse(img, p);
    if (p._box && p._box.img === img) return p._box;
    const o = Object.assign({}, BOX_DEFAULTS, BOX[p.id]);
    const x0 = p.x * T + (p.w * T - a.W) / 2;          // the art's left edge in map pixels (stamps are bottom-centred)
    const xl = x0 + a.wl, xr = x0 + a.wr + 1, yF = (p.y + p.h) * T - o.recess;
    const D = (o.depth || p.h) * T - o.recess - 2, yB = yF - D;
    const Hw = a.facade.h * o.wall, yR = yF - D / 2, Hr = (D / 2 + o.overhang) * o.pitch;
    const eF = yF + o.overhang, eB = yB - o.overhang;
    const ex0 = x0, ex1 = x0 + a.W, rl = x0 + a.rtl, rr = x0 + a.rtr;
    const faces = [];
    const quad = (O, E1, E2, tex, shade) => faces.push({ O, E1, E2, tex, shade, tri: false });
    const tri = (O, E1, E2, fill, shade) => faces.push({ O, E1, E2, fill, shade, tri: true });
    quad([xl, yF, Hw], [xr - xl, 0, 0], [0, 0, -Hw], a.facade, 1);                         // front wall
    quad([xl, yB, Hw], [0, D, 0], [0, 0, -Hw], sideTex(a, D), 0.8);                         // west wall
    quad([xr, yF, Hw], [0, -D, 0], [0, 0, -Hw], sideTex(a, D), 0.8);                        // east wall
    quad([xr, yB, Hw], [xl - xr, 0, 0], [0, 0, -Hw], sideTex(a, xr - xl), 0.7);             // back wall
    quad([ex0, yR, Hw + Hr], [ex1 - ex0, 0, 0], [0, eF - yR, -Hr], a.roof, 1);             // front roof slope (the art)
    quad([ex1, yR, Hw + Hr], [ex0 - ex1, 0, 0], [0, eB - yR, -Hr], a.backRoof, 0.78);          // back roof slope
    tri([ex0, eF, Hw], [0, eB - eF, 0], [rl - ex0, yR - eF, Hr], a.roofBody, 0.86);        // west hip
    tri([ex1, eB, Hw], [0, eF - eB, 0], [rr - ex1, yR - eB, Hr], a.roofBody, 0.86);        // east hip
    if (a.topper) {                                                                          // flag / antenna card on the ridge
      const th = a.topper.h * o.wall * 0.8;
      quad([ex0, yR, Hw + Hr + th - 2], [ex1 - ex0, 0, 0], [0, 0, -th], a.topper, 1);
      faces[faces.length - 1].twoSided = true;
    }
    const cx = (xl + xr) / 2, cy = (yF + yB) / 2, cz = Hw / 2;
    for (const fc of faces) { // outward normal (pointing away from the box centre)
      const [ax, ay, az] = fc.E1, [bx, by, bz] = fc.E2;
      let nx = ay * bz - az * by, ny = az * bx - ax * bz, nz = ax * by - ay * bx;
      const mx = fc.O[0] + (ax + bx) / 3 - cx, my = fc.O[1] + (ay + by) / 3 - cy, mz = fc.O[2] + (az + bz) / 3 - cz;
      if (nx * mx + ny * my + nz * mz < 0) { nx = -nx; ny = -ny; nz = -nz; }
      fc.n = [nx, ny, nz];
    }
    p._box = { img, faces, outline: a.outline, near: yF };
    return p._box;
  }

  /** rasterise one face with perspective-correct texturing into fb + zbuf */
  function drawFace(fb, st, fc, fogC, outline, see) {
    const [Ox, Oy, Oz] = fc.O, [ax, ay, az] = fc.E1, [bx, by, bz] = fc.E2;
    // back-face cull against the camera position
    if (!fc.twoSided && fc.n[0] * (st.cx - Ox) + fc.n[1] * (st.cy - Oy) + fc.n[2] * (st.hh - Oz) <= 0) return;
    // camera-space coefficients: u, v, z of O, E1, E2
    const du = (x, y) => x * st.Rx + y * st.Ry, dv = (x, y) => x * st.Fx + y * st.Fy;
    const u0 = du(Ox - st.px, Oy - st.py), v0 = dv(Ox - st.px, Oy - st.py);
    const ua = du(ax, ay), va = dv(ax, ay), ub = du(bx, by), vb = dv(bx, by);
    const f = st.f, hh = st.hh, hz = st.hz;
    // screen bbox of the corners
    const corners = fc.tri ? [[0, 0], [1, 0], [0, 1]] : [[0, 0], [1, 0], [0, 1], [1, 1]];
    let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9, behind = false;
    for (const [s, t] of corners) {
      const u = u0 + s * ua + t * ub, v = v0 + s * va + t * vb, z = Oz + s * az + t * bz, Z = f + v;
      if (Z < 1) { behind = true; continue; }
      const k = f / Z, X = CX + u * k, Y = hz + (hh - z) * k;
      if (X < x0) x0 = X; if (X > x1) x1 = X; if (Y < y0) y0 = Y; if (Y > y1) y1 = Y;
    }
    if (behind) { x0 = 0; y0 = 0; x1 = SW; y1 = SH; }
    const sx0 = M.max(0, M.floor(x0)), sx1 = M.min(SW - 1, M.ceil(x1)), sy0 = M.max(0, M.floor(y0)), sy1 = M.min(SH - 1, M.ceil(y1));
    if (sx0 > sx1 || sy0 > sy1) return;
    const tex = fc.tex, tw = tex ? tex.w : 0, th = tex ? tex.h : 0, tu = tex ? tex.u32 : null;
    const out = fb.u32;
    // edge thickness in (a, b) units for the hip outlines: ~1 map pixel
    const la = M.hypot(ax, ay, az), lb = M.hypot(bx, by, bz), ea = 1 / la, eb = 1 / lb;
    for (let sy = sy0; sy <= sy1; sy++) {
      const Y = sy + 0.5 - hz;
      // row-constant parts of the 2x2 system:  [A1 B1; A2 B2] [a b]' = [C1 C2]'
      const A2 = -f * az - Y * va, B2 = -f * bz - Y * vb, C2 = Y * f - f * hh + f * Oz + Y * v0;
      const row = sy * SW;
      for (let sx = sx0; sx <= sx1; sx++) {
        const X = sx + 0.5 - CX;
        const A1 = f * ua - X * va, B1 = f * ub - X * vb, C1 = X * f - f * u0 + X * v0;
        const det = A1 * B2 - A2 * B1;
        if (det > -1e-9 && det < 1e-9) continue;
        const s = (C1 * B2 - C2 * B1) / det, t = (A1 * C2 - A2 * C1) / det;
        if (s < 0 || t < 0 || s >= 1 || t >= 1) continue;
        if (fc.tri && s + t > 1) continue;
        const v = v0 + s * va + t * vb;
        if (f + v < 1) continue;
        const i = row + sx;
        if (zbuf[i] <= v) continue;
        if (see && ((sx ^ sy) & 1) && sx > see.x0 && sx < see.x1 && sy > see.y0 && sy < see.y1) continue;
        let c;
        if (tu) {
          c = tu[M.floor(t * th) * tw + M.floor(s * tw)];
          if ((c >>> 24) < 128) continue;
        } else c = (s < ea * 1.2 || t < eb * 1.2 || s + t > 1 - M.min(ea, eb) * 1.5) ? outline : fc.fill;
        zbuf[i] = v;
        out[i] = shadeFog(c, fc.shade, fogAt(v), fogC);
      }
    }
  }

  // ------------------------------------------------------------------------------------------------ the frame
  const scratch = { bmp: null };
  V.draw = function (tm, fb, camX, camY, tick, actors) {
    const A = NP.assets, c = V.cfg, st = frameState(camX, camY);
    V._last = st;
    const fogC = packFog(c.fog), fogR = fogC & 255, fogG = (fogC >>> 8) & 255, fogB = (fogC >>> 16) & 255;
    const g = groundFor(tm, tick), gu = g.bmp.u32, gw = g.w, gh = g.h;
    const du = fb.u32;
    const offX = MARGIN * T, offY = MARGIN * T;
    zbuf.fill(INF);
    const seeBox = { x0: CX - 26, x1: CX + 26, y0: c.pivotRow - 52, y1: c.pivotRow + 10 };
    // ---- ground, one perspective slice per screen row
    for (let r = 0; r < SH; r++) {
      const d = r - c.hz, row = r * SW;
      if (d <= 0) { for (let x = 0; x < SW; x++) du[row + x] = fogC | 0xff000000; continue; }
      const scale = d / st.hh, Z = c.f / scale, v = Z - c.f;
      const fogT = fogAt(v);
      const inv = 1 / scale;
      for (let sx = 0; sx < SW; sx++) {
        const u = (sx - CX) * inv;
        const mx = M.floor(st.px + u * st.Rx + v * st.Fx) + offX, my = M.floor(st.py + u * st.Ry + v * st.Fy) + offY;
        let col;
        if (mx < 0 || my < 0 || mx >= gw || my >= gh) col = fogC | 0xff000000;
        else {
          col = gu[my * gw + mx];
          if (fogT > 0.02) {
            const rr = (col & 255) + (fogR - (col & 255)) * fogT, gg = ((col >>> 8) & 255) + (fogG - ((col >>> 8) & 255)) * fogT, bb = ((col >>> 16) & 255) + (fogB - ((col >>> 16) & 255)) * fogT;
            col = 0xff000000 | (bb << 16) | (gg << 8) | rr;
          }
        }
        du[row + sx] = col >>> 0;
      }
    }
    // ---- buildings (solid, depth-buffered) and the billboard list
    const items = [];
    const reach = c.fogEnd + 64;
    for (const p of tm.objs) {
      const q = project(st, (p.x + p.w / 2) * T, (p.y + p.h) * T);
      if (BOX[p.id]) {
        const cxm = (p.x + p.w / 2) * T - st.px, cym = (p.y + p.h / 2) * T - st.py;
        const v = cxm * st.Fx + cym * st.Fy, u = cxm * st.Rx + cym * st.Ry;
        const rad = (p.w + p.h) * T;
        if (v + rad < -c.f * 0.9 || v - rad > reach || M.abs(u) - rad > (c.f + v + rad) * (CX / c.f) + 32) continue;
        const bx = boxFaces(p, A.stamp(p.id, p.variant, A.frameAt(p.def, tick)));
        // a building standing between the camera and the player is drawn see-through (dithered) round the player
        const backV = ((p.x + p.w / 2) * T - st.px) * st.Fx + (p.y * T - st.py) * st.Fy;
        const see = backV < 4 && M.abs(u) < (p.w * T) / 2 + 24 ? seeBox : null;
        for (const fc of bx.faces) drawFace(fb, st, fc, fogC, bx.outline, see);
        continue;
      }
      if (!q) continue;
      items.push({ v: q.v, order: 0, q, p });
    }
    for (const a of actors || []) {
      const ax = a.x !== undefined ? a.x : camX + CX, q = project(st, ax, a.sortY);
      if (!q) continue;
      items.push({ v: q.v, order: 1, q, a, ax });
    }
    items.sort((a, b) => b.v - a.v || a.order - b.order);
    for (const e of items) {
      const q = e.q, fogT = fogAt(q.v);
      if (e.p) {
        const bmp = A.stamp(e.p.id, e.p.variant, A.frameAt(e.p.def, tick));
        if (q.x + bmp.w * q.scale / 2 < 0 || q.x - bmp.w * q.scale / 2 > SW || q.y - bmp.h * q.scale > SH || q.y < 0) continue;
        sprite(fb, bmp, bmp.w / 2, bmp.h, q.x, q.y, q.scale, q.v, fogT, fogC);
      } else {
        if (q.x < -40 || q.x > SW + 40 || q.y < 0 || q.y - 56 * q.scale > SH) continue;
        const s = scratch.bmp || (scratch.bmp = new Bitmap(64, 64));
        s.u32.fill(0);
        e.a.draw(s, e.ax - 32, e.a.sortY - 56);
        sprite(fb, s, 32, 56, q.x, q.y, q.scale, q.v, fogT, fogC);
      }
    }
  };

  NP.view3d = V;
})(typeof globalThis !== 'undefined' ? globalThis : window);
