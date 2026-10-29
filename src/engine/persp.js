/* src/engine/persp.js — NP.view3d: the pseudo-3D overworld view (tilted ground plane + upright 2D billboards + real 3D volumes),
 * à la a late-era handheld RPG street scene (docs/ART-TARGET.md §1). All CPU, all in Bitmaps, so it runs headless. About 1 ms a frame.
 * Files: persp.js (this: camera, switches, sky, ground, sprites, actors, fades), persp_raster.js (depth-tested textured quads),
 * persp_scene.js (what stands in a map: tree billboards, building volumes, fences, shadows; one cached scene per TileMap).
 *
 * Pipeline per frame (V.draw):
 *  1. Sky: a wide pre-rendered gradient + cloud band, scrolled by the camera heading; its bottom colour is the fog colour.
 *  2. Ground: the map's terrain is rendered flat ONCE into a "ground" bitmap (margin of border tiles round it, shadows and a faint lawn
 *     dapple baked in, colour-graded, with a small mip chain); animated terrain (water, tall grass, flowers) is re-blitted tile by tile only
 *     when its own frame changes. Every screen row is a perspective slice of it (classic mode-7: per-row scale, fixed-point stepping, mip
 *     level by footprint) faded towards the fog colour with distance.
 *  3. Everything that stands up is drawn with a per-pixel depth test (V.zb holds 1/Z, 0 = nothing), in any order: billboard trees, stamps and
 *     actors (scaled sprites, one depth each) and the building volumes / fences (textured perspective quads). Sprites win depth ties against
 *     the world (a hero beside a trunk or on a door tile is never swallowed). Colours fade to the fog colour by depth.
 *  4. Keeping the hero in view (a tilted camera puts foreground things between the lens and the player):
 *     - cutaway: world things nearer than him get a keyhole (ellipse, dithered rim) round his sprite (V.cut);
 *     - trees and big stamps behind him in the middle of the screen, and buildings that block him or sit wholly behind him in the middle of the
 *       screen, fade out (V.behindFade / V.behindFadeBox / V.coverFade); the partly transparent ones go to a late queue that is blended after the
 *       opaque scene and the actors (far to near, depth-tested, not depth-written);
 *     - sprites right at the lens fade out too (cfg.nearFade).
 *  Camera: pivots on the map pixel at screen centre (camX+W/2, camY+H/2) — the overworld passes the player — and sits `f` map pixels
 *  behind it looking along the heading. The pivot lands on screen row `pivotRow`, where the scale is exactly 1. A point at map offset
 *  (u right, v forward) and height h projects to  x = W/2 + u*s,  y = hz + (hh - h)*s,  s = f / (f + v),  hh = pivotRow - hz
 *  (so hz is the horizon row, hh the eye height in map pixels; every line that runs away from the camera converges on (W/2, hz)).
 *  Heading is NOT a player setting: each map (def.camera = quarter turns, 0 = looking north, 1 = east, 2 = south, 3 = west) and each area
 *  inside a map (def.cameraZones = [{x,y,w,h,camera}]) says where the camera looks, and it eases round by itself as the player walks in
 *  (V.aim). Controls and sprite facings are remapped by quarter turn (V.screenToMap / V.viewDir).
 *
 *  Switches: V.mode = 'flat' (default for headless / tests: V.on is left alone) | 'auto' (3D outdoors, flat indoors; the browser shell uses this
 *  unless ?flat) | 'on' (3D everywhere). V.enter(def) (called by the overworld on every map load) turns V.on and the camera preset to match the
 *  map: def.view = 'street' | 'town' | 'flat-ish'. V.toggle() (the V key) flips between flat and auto.
 *  Tuning: NP.view3d.cfg = { f, hz, pivotRow, fogStart, fogEnd, fog, sky:[top, horizon], nearFade:[gone, solid] (x f), fadeBand, behindFrom,
 *  behindSpan, behindBand }.  NP.view3d.preset('street'|'town'|'flat-ish').
 *  API: on, mode, enter(def), toggle(), draw(tm, fb, camX, camY, tick, actors), project(mapX, mapY) -> {x, y, scale} | null (emotes, arrows),
 *  state() (current frame state), stats { bakes, bakeMs, animRefreshes }.
 */
(function (root) {
  'use strict';
  const NP = (root.NP = root.NP || {});
  const { Bitmap } = NP;
  const T = 16, SW = NP.W, SH = NP.H, CX = SW / 2, CY = SH / 2, MARGIN = 14;

  /** maps the 3D view can't show faithfully stay flat: the player's house has thin partition walls on tile edges (def.edgeWalls) that
   *  only the flat renderer draws, and in 3D they'd be invisible walls; `def.flat3d` opts a map out (Ribbon Loop's hedge maze, whose
   *  paths can't be read as billboard foliage) */
  const flatOnly = (def) => !!(def && (def.flat3d || (def.edgeWalls && def.edgeWalls.length)));

  const PRESETS = {
    street: { f: 185, hz: 22, pivotRow: 124, fogStart: 110, fogEnd: 640, fog: '#d2e7f7', sky: ['#6eb4ec', '#d2e7f7'], nearFade: [0.52, 0.58], fadeBand: 10, behindFrom: 16, behindSpan: 5, behindBand: 58 },
    town: { f: 165, hz: -26, pivotRow: 122, fogStart: 130, fogEnd: 700, fog: '#d4e8f6', sky: ['#78b8ee', '#d4e8f6'], nearFade: [0.52, 0.58], fadeBand: 10, behindFrom: 16, behindSpan: 5, behindBand: 58 },
    'flat-ish': { f: 420, hz: -180, pivotRow: 113, fogStart: 300, fogEnd: 1200, fog: '#d8eaf6', sky: ['#78b8ee', '#d8eaf6'], nearFade: [0.52, 0.58], fadeBand: 10, behindFrom: 16, behindSpan: 5, behindBand: 58 },
  };

  const V = {
    on: false,
    mode: 'flat',    // 'flat' | 'auto' | 'on'
    cfg: Object.assign({}, PRESETS.street),
    presetName: 'street',
    zb: new Float32Array(SW * SH),
    _ground: null, _last: null,
    yaw: null,       // current camera heading in radians (null until the first frame: then it snaps, afterwards it eases)
    q: 0,            // target heading in quarter turns, 0..3
    DIRS: ['up', 'right', 'down', 'left'],
    PRESETS,
    /** quarter turns the camera should have at map tile (x, y): the first matching zone, else the map's own, else 0 */
    quarterFor(tm, x, y) {
      const d = tm && tm.def || {};
      for (const z of d.cameraZones || []) if (x >= z.x && x < z.x + (z.w || 1) && y >= z.y && y < z.y + (z.h || 1)) return z.camera & 3;
      return (d.camera || 0) & 3;
    },
    /** called once per drawn frame by the overworld: set the target heading and ease the camera towards it */
    aim(tm, x, y) {
      V.q = V.quarterFor(tm, x, y);
      const target = V.q * Math.PI / 2;
      if (V.yaw === null) { V.yaw = target; return; }
      let diff = target - V.yaw;
      diff -= Math.round(diff / (2 * Math.PI)) * 2 * Math.PI;
      if (Math.abs(diff) < 0.004) { V.yaw = target; return; }
      V.yaw += Math.sign(diff) * Math.min(Math.abs(diff), Math.max(Math.abs(diff) * 0.1, 0.014));
    },
    /** pressed screen direction -> map direction (screen-up walks the way the camera looks) */
    screenToMap(d) { if (!d || !V.on) return d; return V.DIRS[(V.DIRS.indexOf(d) + V.q) & 3]; },
    /** a map-space facing -> the facing the sprite should show from this camera */
    viewDir(d) { if (!V.on || !V.q) return d; return V.DIRS[(V.DIRS.indexOf(d) - V.q + 4) & 3]; },
    preset(name) {
      const p = PRESETS[name] || PRESETS.street;
      V.presetName = PRESETS[name] ? name : 'street';
      Object.assign(V.cfg, p);
    },
    /** called by the overworld on every map load: in 'auto' / 'on' mode pick 3D or flat for this map, and (when 3D shows) its camera
     *  preset from def.view. In 'flat' mode nothing changes, so a test or the console can still set V.on by hand. */
    enter(def) {
      V._lastDef = def;
      const indoor = !!(def && def.indoor);
      if (V.mode === 'on') V.on = true;
      else if (V.mode === 'auto') V.on = !indoor;
      if (flatOnly(def)) V.on = false;   // thin edge walls (def.edgeWalls) only exist in the flat renderer
      if (V.on) V.preset((def && def.view) || (indoor ? 'flat-ish' : 'street'));
    },
    /** the V key: 3D off -> on (automatic mode), 3D on -> flat. Returns whether 3D is showing now. */
    toggle() {
      if (V.on) { V.mode = 'flat'; V.on = false; }
      else { V.mode = 'auto'; V.on = !flatOnly(V._lastDef); if (V.on && V._lastDef) V.preset(V._lastDef.view || (V._lastDef.indoor ? 'flat-ish' : 'street')); }
      return V.on;
    },
  };

  // ------------------------------------------------------------------------------------------------ colour grading
  // One 15-bit LUT applied to every texture before it is drawn (ground bake, sprites, volume faces): a gentle high-key lift,
  // a touch more saturation, shadows drifting cool and highlights warm. Colours stay as the art made them otherwise.
  const GRADE = { lift: 7, gain: 0.965, sat: 1.07, warm: 3 };
  let gradeLut = null;
  function lut() {
    if (gradeLut) return gradeLut;
    gradeLut = new Uint32Array(32768);
    for (let i = 0; i < 32768; i++) {
      let r = ((i >> 10) & 31) * 8 + 4, g = ((i >> 5) & 31) * 8 + 4, b = (i & 31) * 8 + 4;
      const l = r * 0.3 + g * 0.59 + b * 0.11;
      r = l + (r - l) * GRADE.sat; g = l + (g - l) * GRADE.sat; b = l + (b - l) * GRADE.sat;
      const w = (l / 255 - 0.5) * 2 * GRADE.warm;                // +warm in the lights, -warm (cool) in the darks
      r = r * GRADE.gain + GRADE.lift + w; g = g * GRADE.gain + GRADE.lift + w * 0.4; b = b * GRADE.gain + GRADE.lift - w;
      const c = (v) => (v < 0 ? 0 : v > 255 ? 255 : v | 0);
      gradeLut[i] = ((c(b) << 16) | (c(g) << 8) | c(r)) >>> 0;
    }
    return gradeLut;
  }
  /** grade the colours of a bitmap in place (alpha kept); only the rect (x0,y0,x1,y1) when given */
  function gradeInPlace(bmp, x0, y0, x1, y1) {
    const L = lut(), u = bmp.u32, w = bmp.w;
    x0 = x0 || 0; y0 = y0 || 0; x1 = x1 === undefined ? w : x1; y1 = y1 === undefined ? bmp.h : y1;
    for (let y = y0; y < y1; y++) for (let i = y * w + x0, e = y * w + x1; i < e; i++) {
      const c = u[i];
      if (c >>> 24 === 0) continue;
      u[i] = ((c & 0xff000000) | L[((c & 255) >> 3 << 10) | (((c >>> 8) & 255) >> 3 << 5) | (((c >>> 16) & 255) >> 3)]) >>> 0;
    }
    return bmp;
  }
  const gradedCache = new WeakMap();
  /** cached graded copy of a (never mutated) art bitmap */
  function graded(bmp) {
    let g = gradedCache.get(bmp);
    if (!g) { g = bmp.clone(); gradeInPlace(g); gradedCache.set(bmp, g); }
    return g;
  }
  V.grade = { cfg: GRADE, bitmap: graded, inPlace: gradeInPlace, reset() { gradeLut = null; } };

  // ------------------------------------------------------------------------------------------------ mip chain for sprites / faces
  const mipCache = new WeakMap();
  /** 2x2 box filter of s into d (d.w = s.w >> 1, d.h = s.h >> 1): alpha-weighted colour average, alpha >= 128 stays opaque */
  function boxDown(s, d) {
    const w = d.w, h = d.h, su = s.u32, du = d.u32, sw = s.w, sh = s.h;
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      let r = 0, g = 0, b = 0, n = 0;
      const y0 = y * 2, x0 = x * 2;
      for (let j = 0; j < 2; j++) for (let i = 0; i < 2; i++) {
        const c = su[Math.min(sh - 1, y0 + j) * sw + Math.min(sw - 1, x0 + i)];
        if (c >>> 24 >= 128) { r += c & 255; g += (c >>> 8) & 255; b += (c >>> 16) & 255; n++; }
      }
      du[y * w + x] = n >= 2 ? (0xff000000 | ((b / n | 0) << 16) | ((g / n | 0) << 8) | (r / n | 0)) >>> 0 : 0;
    }
    return d;
  }
  /** pre-filtered half-size copies of a never-mutated art bitmap: level L = 1/2^L. Cached. (Per-frame bitmaps use boxDown directly.) */
  function mip(bmp, L) {
    if (L <= 0) return bmp;
    let chain = mipCache.get(bmp);
    if (!chain) { chain = [bmp]; mipCache.set(bmp, chain); }
    while (chain.length <= L) {
      const s = chain[chain.length - 1];
      chain.push(boxDown(s, new Bitmap(Math.max(1, s.w >> 1), Math.max(1, s.h >> 1))));
    }
    return chain[L];
  }
  V.mip = mip;

  // ------------------------------------------------------------------------------------------------ fog
  let fogC = 0, fogKey = null;
  function fogSetup() {
    const c = V.cfg, key = c.fog + '|' + c.fogStart + '|' + c.fogEnd;
    if (key === fogKey) return;
    fogKey = key;
    fogC = NP.Color.parse(c.fog) >>> 0;
    V._fogC = fogC;
  }
  /** fog amount 0..1 at forward distance v (map px past the pivot): smoothstep from fogStart to fogEnd */
  function fogAt(v) {
    const c = V.cfg;
    let t = (v - c.fogStart) / (c.fogEnd - c.fogStart);
    if (t <= 0) return 0;
    if (t >= 1) return 1;
    return t * t * (3 - 2 * t);
  }
  V.fogAt = fogAt;

  // ------------------------------------------------------------------------------------------------ projection
  const ST = { f: 0, hz: 0, hh: 0, px: 0, py: 0, Rx: 1, Ry: 0, Fx: 0, Fy: -1, yaw: 0 };
  function frameState(camX, camY) {
    const c = V.cfg, yaw = V.yaw || 0, s = Math.sin(yaw), co = Math.cos(yaw);
    ST.f = c.f; ST.hz = c.hz; ST.hh = c.pivotRow - c.hz; ST.px = camX + CX; ST.py = camY + CY;
    ST.Rx = co; ST.Ry = s; ST.Fx = s; ST.Fy = -co; ST.yaw = yaw;
    return ST;
  }
  function project(st, x, y) {
    const dx = x - st.px, dy = y - st.py;
    const u = dx * st.Rx + dy * st.Ry, v = dx * st.Fx + dy * st.Fy, Z = st.f + v;
    if (Z < st.f * 0.25) return null;
    const scale = st.f / Z;
    return { x: CX + u * scale, y: st.hz + st.hh * scale, scale, v };
  }
  V.project = (x, y) => (V._last ? project(V._last, x, y) : null);
  /** the inverse of project on the ground plane: screen (X, Y) -> the map point { x, y } (px) on the floor there, or null above the horizon */
  function unproject(st, X, Y) {
    const scale = (Y - st.hz) / st.hh;
    if (!(scale > 0)) return null;
    const u = (X - CX) / scale, v = st.f / scale - st.f;
    return { x: st.px + u * st.Rx + v * st.Fx, y: st.py + u * st.Ry + v * st.Fy };
  }
  V.unproject = (X, Y) => (V._last ? unproject(V._last, X, Y) : null);
  V.state = () => V._last;

  // ------------------------------------------------------------------------------------------------ sky
  let sky = null;
  function skyFor() {
    const c = V.cfg, h = Math.max(1, Math.min(SH, Math.ceil(c.hz) + 2));
    const key = c.sky[0] + c.sky[1] + h;
    if (sky && sky.key === key) return sky;
    const W = 1024, b = new Bitmap(W, h);
    const top = NP.Color.parse(c.sky[0]), bot = NP.Color.parse(c.sky[1]);
    for (let y = 0; y < h; y++) {
      const t = Math.pow(y / Math.max(1, h - 1), 0.85);
      b.fillRect(0, y, W, 1, NP.Color.mix(top, bot, t));
    }
    // a faint band of long, soft clouds low in the sky (hash-placed, tileable round the 1024 wrap): a pale lit top and a bluish belly
    const K = NP.art && NP.art.tiles && NP.art.tiles.kit;
    const hf = K ? K.hf : (a, b2, c2) => ((Math.sin(a * 12.9898 + b2 * 78.233 + c2 * 37.719) * 43758.5453) % 1 + 1) % 1;
    const n = 14;
    for (let i = 0; i < n; i++) {
      const cx = (i + hf(i, 3, 9) * 0.8) * (W / n), cy = h * (0.30 + hf(i, 5, 9) * 0.5), rx = 26 + hf(i, 7, 9) * 52, ry = 2.2 + hf(i, 11, 9) * Math.max(1.6, h * 0.11);
      const a0 = 0.45 + hf(i, 13, 9) * 0.3;
      for (let wrap = -1; wrap <= 1; wrap++) {
        const ox = cx + wrap * W;
        for (let y = Math.max(0, Math.floor(cy - ry - 1)); y <= Math.min(h - 1, Math.ceil(cy + ry + 1)); y++) {
          for (let x = Math.max(0, Math.floor(ox - rx)); x <= Math.min(W - 1, Math.ceil(ox + rx)); x++) {
            const dx = (x - ox) / rx, dy = (y - cy) / ry, d = dx * dx + dy * dy;
            if (d >= 1) continue;
            const a = (1 - d) * (1 - d * 0.4) * a0;
            b.px(x, y, dy > 0.25 ? 0xfff0dcd0 : 0xfffffbf6, a * (dy > 0.25 ? 0.75 : 1));
          }
        }
      }
    }
    gradeInPlace(b);
    sky = { key, bmp: b, h };
    return sky;
  }

  // ------------------------------------------------------------------------------------------------ ground cache
  function sameGrid(a, b) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
    return true;
  }
  /** 2x2 box filter of mip level L-1 into level L for the texel rect covering ground pixels (x, y, w, h) */
  function mipRect(g, x, y, w, h) {
    for (let L = 1; L < g.mips.length; L++) {
      const s = g.mips[L - 1], d = g.mips[L], su = s.u32, du = d.u32;
      const tx0 = x >> L, ty0 = y >> L, tx1 = Math.min(d.w - 1, (x + w - 1) >> L), ty1 = Math.min(d.h - 1, (y + h - 1) >> L);
      for (let ty = ty0; ty <= ty1; ty++) {
        for (let tx = tx0, i = ty * 2 * s.w + tx0 * 2, o = ty * d.w + tx0; tx <= tx1; tx++, i += 2, o++) {
          const a = su[i], b = su[i + 1], c = su[i + s.w], e = su[i + s.w + 1];
          const r = ((a & 255) + (b & 255) + (c & 255) + (e & 255)) >> 2, gg = (((a >>> 8) & 255) + ((b >>> 8) & 255) + ((c >>> 8) & 255) + ((e >>> 8) & 255)) >> 2, bb = (((a >>> 16) & 255) + ((b >>> 16) & 255) + ((c >>> 16) & 255) + ((e >>> 16) & 255)) >> 2;
          du[o] = (0xff000000 | (bb << 16) | (gg << 8) | r) >>> 0;
        }
      }
    }
  }
  V.stats = { bakes: 0, bakeMs: 0, animRefreshes: 0 };
  /**
   * The ground bitmap for a map: flat terrain + baked shadows, graded, with half/quarter/eighth-size mips. Baked once per map and grid;
   * animated terrain (water, tall grass, flowers) is then re-blitted tile by tile only when its own frame changes.
   */
  function groundFor(tm, tick, sc) {
    const A = NP.assets;
    let g = V._ground;
    const gw = (tm.w + MARGIN * 2) * T, gh = (tm.h + MARGIN * 2) * T;
    const fresh = !(g && g.tm === tm && g.w === gw && g.sc === sc && sameGrid(g.grid, tm.grid));
    if (fresh) {
      const t0 = performance.now();
      if (!g || g.w !== gw || g.h !== gh) g = { bmp: new Bitmap(gw, gh), w: gw, h: gh, mips: [] };
      g.tm = tm; g.sc = sc; g.grid = tm.grid.slice(); g.frames = {};
      const tileFn = V.scene ? V.scene.tileFn(tm, sc) : null;
      tm.drawTerrain(g.bmp, -MARGIN * T, -MARGIN * T, tick, gw, gh, tileFn);
      if (V.scene) V.scene.bakeGround(g.bmp, tm, sc, MARGIN * T, MARGIN * T);
      gradeInPlace(g.bmp);
      g.mips = [g.bmp];
      for (let L = 1; L <= 3; L++) g.mips.push(new Bitmap(g.mips[L - 1].w >> 1, g.mips[L - 1].h >> 1));
      mipRect(g, 0, 0, gw, gh);
      if (sc.anim) for (const gr of sc.anim) g.frames[gr.id] = A.frameAt(gr.def, tick);
      V._ground = g;
      V.stats.bakes++; V.stats.bakeMs += performance.now() - t0;
    }
    if (sc.anim) {
      for (const gr of sc.anim) {
        const f = A.frameAt(gr.def, tick);
        if (g.frames[gr.id] === f) continue;
        g.frames[gr.id] = f;
        V.stats.animRefreshes++;
        const gu = g.bmp.u32;
        for (const t of gr.tiles) {
          const src = V.grade.bitmap(A.terrain(gr.id, t.mask, f, t.variant)).u32, ox = (t.x + MARGIN) * T, oy = (t.y + MARGIN) * T;
          for (let yy = 0; yy < T; yy++) { const di = (oy + yy) * gw + ox, si = yy * T; for (let xx = 0; xx < T; xx++) gu[di + xx] = src[si + xx]; }
          mipRect(g, ox, oy, T, T);
        }
      }
    }
    return g;
  }

  // ------------------------------------------------------------------------------------------------ sprite (z-tested, fogged)
  const xmap = new Int32Array(1024);
  V.hero = { on: false, x: CX, y: 100, s: 1, v: 0 };
  /**
   * Behind-the-hero fade for a wide object (a building): like behindFade, but by how much of the hero's corridor on screen
   * (|x - 120| < behindBand) its screen x range [x0, x1] covers, and by its far edge vFar. A building wholly behind the hero that
   * blocks the middle of the view vanishes; one at the side of the screen, or one that still reaches level with him, stays.
   */
  V.behindFadeBox = function (vFar, x0, x1) {
    const c = V.cfg, t = (-vFar - c.behindFrom) / c.behindSpan;
    if (t <= 0) return 256;
    const cover = Math.min(x1, CX + c.behindBand) - Math.max(x0, CX - c.behindBand);
    if (cover <= 0) return 256;
    return Math.max(0, (256 * (1 - Math.min(1, t) * Math.min(1, cover / 30))) | 0);
  };
  /**
   * Hero-cover dissolve for a building volume: the hero's screen point (V.hero) against the volume's projected box. A volume that has
   * part of itself nearer than the hero (vNear < 0) and whose screen box reaches over him fades as one unit (opacity 0..256);
   * buildings at the screen edges, or ahead of him, stay solid. Feathered over `fadeBand` px outside the box.
   */
  V.coverFade = function (vNear, minX, minY, maxX, maxY) {
    const h = V.hero;
    if (!h.on || vNear > -4) return 256;
    const px = h.x, py = h.y - 10 * h.s;
    const dx = Math.max(minX - px, 0, px - maxX), dy = Math.max(minY - py, 0, py - maxY), d = Math.sqrt(dx * dx + dy * dy);
    return d >= V.cfg.fadeBand ? 256 : (256 * d / V.cfg.fadeBand) | 0;
  };
  /**
   * Behind-the-hero fade for trees and big stamps: a sprite more than `behindFrom` px behind the hero (between him and the camera) whose
   * centre is inside the hero's corridor on screen (|x - 120| < behindBand + 0.4 * half width) fades out over `behindSpan` px of depth
   * (and a 14 px lateral feather); sprites outside the corridor, or level with / ahead of him, stay solid. Returns opacity 0..256.
   * v = forward distance from the pivot, cx = sprite centre x on screen, hw = its half width.
   */
  V.behindFade = function (v, cx, hw) {
    const c = V.cfg, t = (-v - c.behindFrom) / c.behindSpan;
    if (t <= 0) return 256;
    const lat = (c.behindBand + hw * 0.4 - Math.abs(cx - CX)) / 14;
    if (lat <= 0) return 256;
    return Math.max(0, (256 * (1 - Math.min(1, t) * Math.min(1, lat))) | 0);
  };


  // Hero cutaway: anything nearer than the player that would cover him is dropped inside an ellipse round his sprite (a dithered rim
  // softens the edge), so foreground trees and buildings never hide the character. cutm: 0 draw, 1 hole, 2 checker; cutIz = his 1/Z.
  const cutm = new Uint8Array(SW * SH);
  let cutOn = false, cutIz = 0, cutBox = null;
  V.cut = { mask: cutm, get on() { return cutOn; }, get iz() { return cutIz; } };
  function setCut(q, c) {
    if (cutOn && cutBox) { for (let y = cutBox[1]; y <= cutBox[3]; y++) cutm.fill(0, y * SW + cutBox[0], y * SW + cutBox[2] + 1); }
    cutOn = false;
    if (!q) return;
    const s = q.scale, cx = q.x, cy = q.y - 11 * s, rx = 15 * s + 2, ry = 17 * s + 2;
    const x0 = Math.max(0, Math.floor(cx - rx)), x1 = Math.min(SW - 1, Math.ceil(cx + rx)), y0 = Math.max(0, Math.floor(cy - ry)), y1 = Math.min(SH - 1, Math.ceil(cy + ry));
    if (x0 > x1 || y0 > y1) return;
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
      const dx = (x + 0.5 - cx) / rx, dy = (y + 0.5 - cy) / ry, d = dx * dx + dy * dy;
      cutm[y * SW + x] = d < 0.72 ? 1 : d < 1 ? 2 : 0;
    }
    cutBox = [x0, y0, x1, y1]; cutOn = true; cutIz = 1 / (c.f + q.v);
  }

  // Late queue: partly transparent world things (fading trees, a dissolving house, anything right at the lens) are drawn after the
  // opaque scene and the actors, far to near, alpha-blended and depth-tested but not depth-written.
  const lateQ = [];
  let lateN = 0, inLate = false;
  function lateSlot() { return lateN < lateQ.length ? lateQ[lateN++] : (lateQ[lateN++] = {}); }
  /** queue a textured face for the late pass (see persp_raster R.face); key = 1/Z of the object (sort: far first) */
  V.lateFace = function (tex, pts, uv, n, shade, alpha, key) {
    const e = lateSlot();
    e.k = 1; e.key = key; e.tex = tex; e.pts = pts; e.uv = uv; e.n = n; e.shade = shade; e.alpha = alpha;
  };
  V.inLate = () => inLate;
  function flushLate(fb, st) {
    if (!lateN) return;
    const list = lateQ.slice(0, lateN).sort((a, b) => a.key - b.key);
    inLate = true;
    for (const e of list) {
      if (e.k === 0) sprite(fb, e.src, e.ax, e.ay, e.X, e.Y, e.scale, e.iz, e.fogW, e.flip, e.cut, false, e.alpha);
      else { LATE_OPT.shade = e.shade; LATE_OPT.alpha = e.alpha; V.raster.face(fb, st, e.tex, e.pts, e.uv, e.n, LATE_OPT); }
    }
    inLate = false; lateN = 0;
  }
  const LATE_OPT = { shade: 256, alpha: 256 };

  /**
   * Scaled nearest-neighbour blit of src (whole bitmap) with its anchor (ax, ay) placed at screen (X, Y), depth-tested against V.zb with
   * iz (= 1/Z; bigger = nearer). fogW 0..256 blends to the fog colour; flip mirrors; cut = may be drilled by the hero cutaway;
   * nearFade = fades out right at the lens; alpha 0..256 < 256 sends it to the late pass. Pixels with alpha < 128 are skipped.
   */
  function sprite(fb, src, ax, ay, X, Y, scale, iz, fogW, flip, cut, nearFade, alpha) {
    let a = alpha === undefined ? 256 : alpha;
    if (nearFade) { const nf = V.cfg.nearFade, f = V.cfg.f, t = (1 / iz - nf[0] * f) / ((nf[1] - nf[0]) * f); if (t <= 0) return; if (t < 1) a = Math.min(a, (t * 256) | 0); }
    if (a <= 6) return;
    if (a < 250 && !inLate) {
      const e = lateSlot();
      e.k = 0; e.key = iz; e.src = src; e.ax = ax; e.ay = ay; e.X = X; e.Y = Y; e.scale = scale; e.iz = iz; e.fogW = fogW; e.flip = flip; e.cut = cut; e.alpha = a;
      return;
    }
    let L = 0;
    while (scale < 0.62 && L < 4) { scale *= 2; L++; }          // use a pre-filtered smaller copy for far sprites
    if (L) { src = mip(src, L); ax = ax / (1 << L); ay = ay / (1 << L); }
    const dw = Math.max(1, Math.round(src.w * scale)), dh = Math.max(1, Math.round(src.h * scale));
    if (dw > 1000) return;
    const x0 = Math.round(X - ax * scale), y0 = Math.round(Y - ay * scale);
    const du = fb.u32, su = src.u32, zb = V.zb, sw = src.w, sh = src.h;
    const ya = Math.max(0, -y0), yb = Math.min(dh, SH - y0), xa = Math.max(0, -x0), xb = Math.min(dw, SW - x0);
    if (ya >= yb || xa >= xb) return;
    const inv = 1 / scale;
    for (let x = xa; x < xb; x++) { let sx = ((x + 0.5) * inv) | 0; if (sx >= sw) sx = sw - 1; xmap[x] = flip ? sw - 1 - sx : sx; }
    const fr = fogC & 255, fg = (fogC >>> 8) & 255, fbl = (fogC >>> 16) & 255;
    const cutting = cut && cutOn && iz > cutIz * 1.02;     // a world sprite nearer than the hero gets a hole round him (actors never do)
    for (let y = ya; y < yb; y++) {
      let sy = ((y + 0.5) * inv) | 0; if (sy >= sh) sy = sh - 1;
      const sRow = sy * sw, di = (y0 + y) * SW + x0;
      if (a < 256) {                                          // late pass: blend over what is there, no depth write
        for (let x = xa; x < xb; x++) {
          const c = su[sRow + xmap[x]];
          if ((c | 0) >= 0) continue;
          const i = di + x;
          if (zb[i] >= iz) continue;
          let aa = a;
          if (cutting) { const cm = cutm[i]; if (cm === 1) continue; if (cm === 2) aa = a >> 1; }
          let r = c & 255, g = (c >>> 8) & 255, b = (c >>> 16) & 255;
          if (fogW) { r += ((fr - r) * fogW) >> 8; g += ((fg - g) * fogW) >> 8; b += ((fbl - b) * fogW) >> 8; }
          const d = du[i], dr = d & 255, dg = (d >>> 8) & 255, db = (d >>> 16) & 255;
          du[i] = (0xff000000 | ((db + (((b - db) * aa) >> 8)) << 16) | ((dg + (((g - dg) * aa) >> 8)) << 8) | (dr + (((r - dr) * aa) >> 8))) >>> 0;
        }
      } else if (cutting) {
        for (let x = xa; x < xb; x++) {
          const c = su[sRow + xmap[x]];
          if ((c | 0) >= 0) continue;
          const i = di + x, cm = cutm[i];
          if (cm && (cm === 1 || ((x + y0 + y) & 1))) continue;
          if (zb[i] >= iz) continue;
          zb[i] = iz;
          const r = c & 255, g = (c >>> 8) & 255, b = (c >>> 16) & 255;
          du[i] = (0xff000000 | ((b + (((fbl - b) * fogW) >> 8)) << 16) | ((g + (((fg - g) * fogW) >> 8)) << 8) | (r + (((fr - r) * fogW) >> 8))) >>> 0;
        }
      } else if (fogW <= 0) {
        for (let x = xa; x < xb; x++) {
          const c = su[sRow + xmap[x]];
          if ((c | 0) >= 0) continue;                       // alpha < 128 (top bit clear)
          const i = di + x;
          if (zb[i] >= iz) continue;
          zb[i] = iz;
          du[i] = (c | 0xff000000) >>> 0;
        }
      } else {
        for (let x = xa; x < xb; x++) {
          const c = su[sRow + xmap[x]];
          if ((c | 0) >= 0) continue;
          const i = di + x;
          if (zb[i] >= iz) continue;
          zb[i] = iz;
          const r = c & 255, g = (c >>> 8) & 255, b = (c >>> 16) & 255;
          du[i] = (0xff000000 | ((b + (((fbl - b) * fogW) >> 8)) << 16) | ((g + (((fg - g) * fogW) >> 8)) << 8) | (r + (((fr - r) * fogW) >> 8))) >>> 0;
        }
      }
    }
  }
  V.sprite = sprite;

  // ------------------------------------------------------------------------------------------------ actors
  const scratch = { bmp: null, mips: [null, new Bitmap(32, 32), new Bitmap(16, 16), new Bitmap(8, 8), new Bitmap(4, 4)] }, NOSCENE = { anim: null };
  function drawActors(fb, st, actors, camX, camY, shadowsOnly) {
    const c = V.cfg;
    for (const a of actors || []) {
      const ax = a.x !== undefined ? a.x : camX + 128, q = project(st, ax, a.sortY);
      if (!q) continue;
      if (q.x < -40 || q.x > SW + 40 || q.y < 0 || q.y - 56 * q.scale > SH) continue;
      const fogT = fogAt(q.v);
      if (shadowsOnly) { if (!a.noShadow && fogT < 0.9) V.softShadow(fb, q.x, q.y - 0.5 * q.scale, 7 * q.scale, 2.7 * q.scale, 0.34 * (1 - fogT)); continue; }
      if (fogT >= 0.995) continue;
      let s = scratch.bmp || (scratch.bmp = new Bitmap(64, 64)), sc = q.scale, an = 32, ay = 56;
      s.u32.fill(0);
      a.draw(s, ax - 32, a.sortY - 56);
      gradeInPlace(s, 16, 18, 48, 60);
      // far actors: filter the fresh picture down (it changes every frame, so the art mip cache cannot be used)
      for (let L = 1; sc < 0.62 && L <= 4; L++) { s = boxDown(s, scratch.mips[L]); sc *= 2; an /= 2; ay /= 2; }
      sprite(fb, s, an, ay, q.x, q.y, sc, (1 / (c.f + q.v)) * 1.004, (fogT * 256) | 0, false);
    }
  }

  /** a soft dark ellipse on the ground (contact shadows): rx, ry radii in screen px, a = peak opacity 0..1 */
  V.softShadow = function (fb, cx, cy, rx, ry, a) {
    if (rx < 0.6 || a <= 0.01) return;
    const du = fb.u32, x0 = Math.max(0, Math.floor(cx - rx - 1)), x1 = Math.min(SW - 1, Math.ceil(cx + rx + 1)), y0 = Math.max(0, Math.floor(cy - ry - 1)), y1 = Math.min(SH - 1, Math.ceil(cy + ry + 1));
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
      const dx = (x + 0.5 - cx) / rx, dy = (y + 0.5 - cy) / ry, d = dx * dx + dy * dy;
      if (d >= 1) continue;
      const k = (d < 0.45 ? 1 : (1 - d) / 0.55) * a;         // flat core, soft rim
      const i = y * SW + x, p = du[i], ik = 1 - k;
      du[i] = (0xff000000 | ((((p >>> 16) & 255) * ik + 0x62 * k) << 16) | ((((p >>> 8) & 255) * ik + 0x4a * k) << 8) | ((p & 255) * ik + 0x28 * k)) >>> 0;
    }
  };

  // ------------------------------------------------------------------------------------------------ the frame
  V.draw = function (tm, fb, camX, camY, tick, actors) {
    const c = V.cfg, st = frameState(camX, camY);
    V._last = st;
    fogSetup();
    const sc = V.scene ? V.scene.get(tm) : NOSCENE;
    const g = groundFor(tm, tick, sc);
    const du = fb.u32, zb = V.zb;
    zb.fill(0);
    const hz = c.hz, f = c.f, hh = st.hh, fogOpaque = (fogC | 0xff000000) >>> 0;
    const fr = fogC & 255, fgc = (fogC >>> 8) & 255, fbc = (fogC >>> 16) & 255;
    // ---- sky (rows above the horizon)
    const horizon = Math.max(0, Math.min(SH, Math.floor(hz) + 1));
    if (horizon > 0) {
      const s = skyFor(), su = s.bmp.u32, off = (((st.yaw * 163) | 0) % 1024 + 1024) % 1024;
      for (let r = 0; r < horizon; r++) {
        const row = r * SW, sy = Math.min(s.h - 1, r) * 1024;
        for (let x = 0; x < SW; x++) du[row + x] = su[sy + ((x + off) & 1023)];
      }
    }
    // ---- ground, one perspective slice per screen row (fixed-point stepping, mip by footprint, fog by distance)
    const offX = MARGIN * T, offY = MARGIN * T, gm = g.mips;
    for (let r = horizon; r < SH; r++) {
      const d = r + 0.5 - hz, row = r * SW;
      if (d <= 0) { du.fill(fogOpaque, row, row + SW); continue; }
      const inv = hh / d, v = f * inv - f, fogT = fogAt(v);
      if (fogT >= 0.995) { du.fill(fogOpaque, row, row + SW); continue; }
      const fw = (fogT * 256) | 0;
      const L = inv < 1.5 ? 0 : inv < 3 ? 1 : inv < 6 ? 2 : 3, mp = gm[L], mu = mp.u32, mw = mp.w, mh = mp.h;
      const stepX = inv * st.Rx, stepY = inv * st.Ry, k = 1 / (1 << L);
      const x0 = (st.px + (0.5 - CX) * stepX + v * st.Fx + offX) * k, y0 = (st.py + (0.5 - CX) * stepY + v * st.Fy + offY) * k;
      let mx = Math.round(x0 * 65536), my = Math.round(y0 * 65536);
      const dx = Math.round(stepX * k * 65536), dy = Math.round(stepY * k * 65536);
      if (fw === 0) {
        for (let sx = 0; sx < SW; sx++, mx += dx, my += dy) {
          const ix = mx >> 16, iy = my >> 16;
          du[row + sx] = ((ix >>> 0) < mw && (iy >>> 0) < mh) ? mu[iy * mw + ix] : fogOpaque;
        }
      } else {
        for (let sx = 0; sx < SW; sx++, mx += dx, my += dy) {
          const ix = mx >> 16, iy = my >> 16;
          if ((ix >>> 0) >= mw || (iy >>> 0) >= mh) { du[row + sx] = fogOpaque; continue; }
          const col = mu[iy * mw + ix], rr = col & 255, gg = (col >>> 8) & 255, bb = (col >>> 16) & 255;
          du[row + sx] = (0xff000000 | ((bb + (((fbc - bb) * fw) >> 8)) << 16) | ((gg + (((fgc - gg) * fw) >> 8)) << 8) | (rr + (((fr - rr) * fw) >> 8))) >>> 0;
        }
      }
    }
    // ---- the hero's cutaway region (foreground things nearer than him get a hole there)
    let hero = null;
    for (const a of actors || []) if (a.hero) { hero = project(st, a.x !== undefined ? a.x : camX + 128, a.sortY); break; }
    setCut(hero, c);
    V.hero.on = !!hero;
    if (hero) { V.hero.x = hero.x; V.hero.y = hero.y; V.hero.s = hero.scale; V.hero.v = hero.v; }
    // ---- soft shadows under actors (drawn on the ground before anything stands up)
    drawActors(fb, st, actors, camX, camY, true);
    // ---- everything that stands up: trees, stamps, buildings
    if (V.scene) V.scene.draw(fb, st, sc, tick);
    // ---- actors, then the translucent foreground
    drawActors(fb, st, actors, camX, camY, false);
    flushLate(fb, st);
  };

  NP.view3d = V;
  V.consts = { T, SW, SH, MARGIN };
})(typeof globalThis !== 'undefined' ? globalThis : window);
