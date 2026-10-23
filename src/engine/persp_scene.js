/* src/engine/persp_scene.js — what stands in the 3D world: billboard tree clusters (treeline / hedge / tree stamps), stamp billboards,
 * building volumes (via persp_raster.js), baked ground shadows and the tile swaps for the ground bake. Extends NP.view3d (persp.js).
 *
 * A "scene" is built once per TileMap (and again when its grid or its stamp list changes, e.g. a Snipped bush or a gate), cached in a
 * WeakMap, and holds plain arrays of draw items with their art already resolved, so a frame allocates nothing.
 * Light comes from the west-north-west: shadows fall towards +x (east) and +y (south), the same way in every camera heading.
 */
(function (root) {
  'use strict';
  const NP = root.NP, V = NP.view3d;
  const { Bitmap } = NP;
  const { T, SW, SH, MARGIN } = V.consts;
  const CX = SW / 2;
  const art = () => (NP.art && NP.art.tiles) || {};
  const S = {};
  V.scene = S;
  const scenes = new WeakMap();
  const LIGHT = { x: 0.62, y: 0.36 };
  S.LIGHT = LIGHT;
  const TREE_STAMPS = { tree: 'round', tree_big: 'big', pine: 'pine', bush: 'bush' };
  const DEPTH_TREES = 3;      // forest tiles up to this many tiles from open ground get billboard trees; deeper ones show canopy tops

  const h32 = (a, b, c) => { const K = art().kit; return K ? K.h32(a, b, c) : ((a * 73856093) ^ (b * 19349663) ^ (c * 83492791)) >>> 0; };
  function sameGrid(a, b) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
    return true;
  }

  // ------------------------------------------------------------------------------------------------ build
  S.get = function (tm) {
    let sc = scenes.get(tm);
    if (sc && sc.nPlace === tm.placements.length && sameGrid(sc.grid, tm.grid)) return sc;
    sc = build(tm);
    scenes.set(tm, sc);
    return sc;
  };

  function build(tm) {
    const A = NP.assets, tiles = art();
    const sc = { tm, grid: tm.grid.slice(), nPlace: tm.placements.length, trees: [], bills: [], vols: [], shadows: [], anim: null, R: 10, depth: null };
    const border = tm.def.border || 'void';
    // animated terrain (water, tall grass, flowers...): tile lists per terrain id, refreshed in place by persp.js when their frame changes
    const groups = new Map();
    for (let y = 0; y < tm.h; y++) for (let x = 0; x < tm.w; x++) {
      const id = tm.grid[y * tm.w + x], def = A.terrainDef(id);
      if (!(def.frames > 1)) continue;
      let gr = groups.get(id);
      if (!gr) groups.set(id, (gr = { id, def, tiles: [] }));
      gr.tiles.push({ x, y, mask: tm.maskAt(x, y), variant: def.variants > 1 ? A.variantAt(id, x, y) : 0 });
    }
    sc.anim = groups.size ? Array.from(groups.values()) : null;
    sc.animMask = null;
    if (sc.anim) {                                               // ground-tile mask of animated tiles: baked shadows keep off them
      const gw = tm.w + 2 * MARGIN;
      sc.animGW = gw;
      sc.animMask = new Uint8Array(gw * (tm.h + 2 * MARGIN));
      for (const gr of sc.anim) for (const t of gr.tiles) sc.animMask[(t.y + MARGIN) * gw + t.x + MARGIN] = 1;
    }
    // ---- forest depth: tiles of treeline (and the outside, if the border is treeline) by distance from open ground
    const R = sc.R, W = tm.w + 2 * R, H = tm.h + 2 * R, depth = new Uint8Array(W * H);
    const forest = (x, y) => {
      const id = tm.idAt(x, y);
      return id === null ? border === 'treeline' : id === 'treeline';
    };
    const q = [];
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      if (!forest(x - R, y - R)) { depth[y * W + x] = 0; q.push(y * W + x); } else depth[y * W + x] = 255;
    }
    for (let qi = 0; qi < q.length; qi++) {
      const i = q[qi], x = i % W, y = (i / W) | 0, d = depth[i];
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
        const nx = x + dx, ny = y + dy;
        if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
        const j = ny * W + nx;
        if (depth[j] === 255 && d < 250) { depth[j] = d + 1; q.push(j); }
      }
    }
    sc.depth = depth; sc.W = W; sc.H = H;
    sc.depthAt = (tx, ty) => {
      const x = tx + R, y = ty + R;
      if (x < 0 || y < 0 || x >= W || y >= H) return 255;
      return depth[y * W + x];
    };
    // ---- billboard trees on forest tiles near open ground (every tile: the canopies overlap into a wall of foliage)
    if (tiles.tree3d) {
      for (let y = -R; y < tm.h + R; y++) for (let x = -R; x < tm.w + R; x++) {
        const id = tm.idAt(x, y), d = sc.depthAt(x, y);
        if (id === 'hedge') { addTree(sc, tiles, x * T + 8, y * T + 14, 'hedge', h32(x, y, 5), h32(x, y, 6), 0); continue; }
        if (d < 1 || d > DEPTH_TREES) continue;
        if (!forest(x, y)) continue;
        const h = h32(x, y, 11), jx = (h & 15) - 8 >> 1, jy = ((h >>> 4) & 7) - 3;
        const k = (h >>> 8) % 100;
        const kind = d >= 2 && k < 16 ? 'big' : d >= 2 && k < 26 ? 'pine' : 'round';
        addTree(sc, tiles, x * T + 8 + jx, y * T + 13 + jy + (kind === 'big' ? 3 : 0), kind, h >>> 12, h >>> 3, d);
      }
    }
    // ---- fences: rails and tops as quads (half a tile per connected side), a post billboard in the middle
    sc.fences = [];
    if (tiles.fence3d) {
      for (let y = 0; y < tm.h; y++) for (let x = 0; x < tm.w; x++) {
        if (tm.grid[y * tm.w + x] !== 'fence') continue;
        const m = tm.maskAt(x, y), cx = x * T + 8, cy = y * T + 8, quads = [];
        const dirs = [[m & 4, 1, 0], [m & 64, -1, 0], [m & 1, 0, -1], [m & 16, 0, 1]];
        for (const [on, dx, dy] of dirs) {
          if (!on) continue;
          const x1 = cx + dx * 8, y1 = cy + dy * 8;
          quads.push({ part: 'rail', pts: [[cx, cy, 0], [x1, y1, 0], [x1, y1, 14], [cx, cy, 14]], uv: [[0, 14], [8, 14], [8, 0], [0, 0]], n: [0, 1, 0], noCull: true, shade: dy ? 236 : 256 });
          const px = -dy * 1.5, py = dx * 1.5;           // half-width perpendicular to the run
          quads.push({ part: 'top', pts: [[cx - px, cy - py, 11.5], [x1 - px, y1 - py, 11.5], [x1 + px, y1 + py, 11.5], [cx + px, cy + py, 11.5]], uv: [[0, 0], [8, 0], [8, 3], [0, 3]], n: [0, 0, 1], noCull: false, shade: 256 });
        }
        sc.fences.push({ x: cx, y: cy, quads });
      }
    }
    // ---- stamps: tree-like ones become billboard trees, everything else a billboard / volume
    for (const p of tm.objs) {
      const kind = TREE_STAMPS[p.id];
      if (kind && tiles.tree3d) { addTree(sc, tiles, (p.x + p.w / 2) * T, (p.y + p.h) * T - 2, kind, h32(p.x, p.y, 21), h32(p.x, p.y, 22), 0, true); continue; }
      if (S.addVolume && S.addVolume(sc, p)) continue;
      sc.bills.push({ p, x: (p.x + p.w / 2) * T, y: (p.y + p.h) * T - 1 });
      if (!p.def.over || p.def.layer === 'floor') sc.shadows.push({ k: 'e', x: (p.x + p.w / 2) * T + 2, y: (p.y + p.h) * T - 3, rx: Math.min(p.w * 7, 18), ry: 3.2, a: 0.2 });
    }
    return sc;
  }

  function addTree(sc, tiles, x, y, kind, vh, fh, d, stamp) {
    const t = tiles.tree3d(kind, vh), o = { x, y, kind, art: t, bmp: V.grade.bitmap(t.bmp), flip: (fh & 1) === 1, d };
    sc.trees.push(o);
    if (stamp || d <= 2) sc.shadows.push({ k: 'e', x: x + LIGHT.x * 26, y: y + LIGHT.y * 26 - 2, rx: t.r * 0.82, ry: t.r * 0.42, a: 0.2 });
  }

  // ------------------------------------------------------------------------------------------------ ground tile swaps
  const tinted = new WeakMap();
  /** cool blue-grey cobbles (the reference's street) without touching the green kerb lips */
  function coolCobble(bmp) {
    let o = tinted.get(bmp);
    if (o) return o;
    o = bmp.clone();
    const u = o.u32;
    for (let i = 0; i < u.length; i++) {
      const c = u[i], r = c & 255, g = (c >>> 8) & 255, b = (c >>> 16) & 255;
      if (g - r > 22) continue;                       // grass fringe
      const l = r * 0.3 + g * 0.59 + b * 0.11, k = 0.55;
      const nr = r * (1 - k) + l * 0.86 * k, ng = g * (1 - k) + l * 0.97 * k, nb = b * (1 - k) + Math.min(255, l * 1.16 + 6) * k;
      u[i] = (0xff000000 | ((nb > 255 ? 255 : nb | 0) << 16) | ((ng | 0) << 8) | (nr | 0)) >>> 0;
    }
    tinted.set(bmp, o);
    return o;
  }
  S.tileFn = function (tm, sc) {
    if (sc._tileFn) return sc._tileFn;
    const A = NP.assets, tiles = art();
    sc._tileFn = (id, tx, ty) => {
      if (id === 'treeline' && tiles.floor3d) {
        const d = sc.depthAt(tx, ty);
        return tiles.floor3d(d <= DEPTH_TREES + 1 ? 'forest' : 'canopy', h32(tx, ty, 3) & 1);
      }
      if (id === 'hedge' || id === 'fence') return A.terrain('grass', 255, 0, A.variantAt('grass', tx, ty));
      if (id === 'cobble' && tm.inBounds(tx, ty)) return coolCobble(A.terrain('cobble', tm.maskAt(tx, ty), 0, A.variantAt('cobble', tx, ty)));
      return null;
    };
    return sc._tileFn;
  };

  // ------------------------------------------------------------------------------------------------ baked shadows
  const SHADOW_RGB = 0x62 << 16 | 0x4a << 8 | 0x28;
  const SH_R = 0x28, SH_G = 0x4a, SH_B = 0x62;          // cool blue-green shadow colour (0xBBGGRR packing done in blend)
  let animMask = null, animGW = 0, bakeW = 0;            // while baking: tiles of animated terrain take no baked shadow
  function shadePx(u, i, a) {
    if (animMask && animMask[((i / bakeW | 0) >> 4) * animGW + ((i % bakeW) >> 4)]) return;
    const p = u[i], ik = 1 - a;
    u[i] = (0xff000000 | ((((p >>> 16) & 255) * ik + SH_B * a) << 16) | ((((p >>> 8) & 255) * ik + SH_G * a) << 8) | ((p & 255) * ik + SH_R * a)) >>> 0;
  }
  /** soft elliptical shadow: flat core + feathered rim */
  function blendEllipse(bmp, cx, cy, rx, ry, a) {
    const u = bmp.u32, w = bmp.w, x0 = Math.max(0, Math.floor(cx - rx - 2)), x1 = Math.min(w - 1, Math.ceil(cx + rx + 2)), y0 = Math.max(0, Math.floor(cy - ry - 2)), y1 = Math.min(bmp.h - 1, Math.ceil(cy + ry + 2));
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
      const dx = (x + 0.5 - cx) / rx, dy = (y + 0.5 - cy) / ry, d = dx * dx + dy * dy;
      if (d >= 1.12) continue;
      shadePx(u, y * w + x, d < 0.5 ? a : a * Math.max(0, (1.12 - d) / 0.62));
    }
  }
  /** convex polygon (map px) with a feathered edge: pts [[x,y]...] */
  function blendPoly(bmp, pts, a, feather) {
    const u = bmp.u32, w = bmp.w;
    let y0 = Infinity, y1 = -Infinity;
    for (const p of pts) { if (p[1] < y0) y0 = p[1]; if (p[1] > y1) y1 = p[1]; }
    const n = pts.length;
    for (let y = Math.max(0, Math.floor(y0)); y <= Math.min(bmp.h - 1, Math.ceil(y1)); y++) {
      let xl = Infinity, xr = -Infinity;
      for (let i = 0; i < n; i++) {
        const p = pts[i], q = pts[(i + 1) % n];
        const ya = Math.min(p[1], q[1]), yb = Math.max(p[1], q[1]);
        if (y + 0.5 < ya || y + 0.5 > yb || ya === yb) continue;
        const x = p[0] + (y + 0.5 - p[1]) / (q[1] - p[1]) * (q[0] - p[0]);
        if (x < xl) xl = x; if (x > xr) xr = x;
      }
      if (xl > xr) continue;
      for (let x = Math.max(0, Math.floor(xl)); x <= Math.min(w - 1, Math.ceil(xr)); x++) {
        const e = Math.min(x + 0.5 - xl, xr - x - 0.5) / feather;       // distance in from the left/right edge
        const k = e >= 1 ? 1 : e <= 0 ? 0 : e;
        if (k > 0) shadePx(u, y * w + x, a * k);
      }
    }
  }
  function hull(pts) {
    const p = pts.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]);
    const cr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
    const lo = [], up = [];
    for (const q of p) { while (lo.length >= 2 && cr(lo[lo.length - 2], lo[lo.length - 1], q) <= 0) lo.pop(); lo.push(q); }
    for (let i = p.length - 1; i >= 0; i--) { const q = p[i]; while (up.length >= 2 && cr(up[up.length - 2], up[up.length - 1], q) <= 0) up.pop(); up.push(q); }
    lo.pop(); up.pop();
    return lo.concat(up);
  }
  /** ground polygon (convex hull) of the shadow of an axis-aligned box [x0,x1]x[y0,y1] of height H (map px) */
  S.boxPoly = function (x0, y0, x1, y1, H) {
    const sx = LIGHT.x * H, sy = LIGHT.y * H;
    return hull([[x0, y0], [x1, y0], [x1, y1], [x0, y1], [x0 + sx, y0 + sy], [x1 + sx, y0 + sy], [x1 + sx, y1 + sy], [x0 + sx, y1 + sy]]);
  };
  /** soft large-scale light/dark patches over the whole ground (value noise, +-4%): keeps wide lawns from reading as a flat carpet */
  function dapple(bmp, sc) {
    const u = bmp.u32, w = bmp.w, h = bmp.h, K = art().kit, hf = (x, y, s2) => K.hf(x, y, s2);
    const cell = 26, gx = 64, gy = 64;                      // periodic lattice (wraps), so any map size works
    const grid = new Float32Array(gx * gy);
    for (let j = 0; j < gy; j++) for (let i = 0; i < gx; i++) grid[j * gx + i] = hf(i, j, 901) * 2 - 1;
    const noise = (x, y) => {
      const fx = x / cell, fy = y / cell, fi = Math.floor(fx), fj = Math.floor(fy), tx = fx - fi, ty = fy - fj, sx = tx * tx * (3 - 2 * tx), sy = ty * ty * (3 - 2 * ty);
      const i0 = fi % gx, j0 = fj % gy, i1 = (i0 + 1) % gx, j1 = (j0 + 1) % gy;
      const a = grid[j0 * gx + i0], b = grid[j0 * gx + i1], c = grid[j1 * gx + i0], d = grid[j1 * gx + i1];
      return a + (b - a) * sx + (c - a) * sy + (a - b - c + d) * sx * sy;
    };
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      if (animMask && animMask[(y >> 4) * animGW + (x >> 4)]) continue;
      const n = noise(x, y) * 0.7 + noise(x * 2.3 + 40, y * 2.3 + 17) * 0.3, k = 1 + 0.05 * n, i = y * w + x, c = u[i];
      let r = (c & 255) * k, g = ((c >>> 8) & 255) * k, b = ((c >>> 16) & 255) * k;
      u[i] = (0xff000000 | ((b > 255 ? 255 : b | 0) << 16) | ((g > 255 ? 255 : g | 0) << 8) | (r > 255 ? 255 : r | 0)) >>> 0;
    }
  }
  S.bakeGround = function (bmp, tm, sc, ox, oy) {
    animMask = sc.animMask; animGW = sc.animGW; bakeW = bmp.w;
    for (const s of sc.shadows) {
      if (s.k === 'e') {
        blendEllipse(bmp, s.x + ox, s.y + oy, s.rx * 1.12, s.ry * 1.12, s.a * 0.55);
        blendEllipse(bmp, s.x + ox, s.y + oy, s.rx * 0.8, s.ry * 0.8, s.a * 0.65);
      } else {
        const pts = s.pts.map((p) => [p[0] + ox, p[1] + oy]);
        blendPoly(bmp, pts, s.a, 4);
      }
    }
    dapple(bmp, sc);
    animMask = null;
  };

  // ------------------------------------------------------------------------------------------------ building volumes
  // A cottage = a prism: the facade art on the south face, behind it west / east walls, west / east roof slopes, a flat cap and a back.
  // The front plane sits half a tile inside the footprint's south edge (so a hero stepping onto the door tile stands level with it).
  // Faces: { key, pts[4] ([x,y,z] map px), uv[4], n, shade }.
  S.addVolume = function (sc, p) {
    const tiles = art();
    if (!tiles.hasVolume || !tiles.hasVolume(p.id)) return false;
    const tex = tiles.volume(p.id, p.variant), d = tex.d;
    const x0 = p.x * T, yF = (p.y + p.h) * T - 8, D = tex.depth, yB = yF - D;
    const W = d.W, H = d.H, wl = d.wl, wr = d.wr, Hw = d.Hw, Zt = d.Ztop, ins = d.inset, rL = d.roofL, rR = d.roofR, sl = tex.slope, cw = tex.capW;
    const rn = Math.hypot(Zt - Hw, ins);
    const faces = [
      { key: 'front', pts: [[x0, yF, 0], [x0 + W, yF, 0], [x0 + W, yF, H], [x0, yF, H]], uv: [[0, H], [W, H], [W, 0], [0, 0]], n: [0, 1, 0] },
      { key: 'back', pts: [[x0 + W, yB, 0], [x0, yB, 0], [x0, yB, H], [x0 + W, yB, H]], uv: [[0, H], [W, H], [W, 0], [0, 0]], n: [0, -1, 0] },
      { key: 'wallW', pts: [[x0 + wl, yB, 0], [x0 + wl, yF, 0], [x0 + wl, yF, Hw], [x0 + wl, yB, Hw]], uv: [[0, Hw], [D, Hw], [D, 0], [0, 0]], n: [-1, 0, 0] },
      { key: 'wallE', pts: [[x0 + wr + 1, yF, 0], [x0 + wr + 1, yB, 0], [x0 + wr + 1, yB, Hw], [x0 + wr + 1, yF, Hw]], uv: [[0, Hw], [D, Hw], [D, 0], [0, 0]], n: [1, 0, 0] },
      { key: 'roofW', pts: [[x0 + rL, yB, Hw], [x0 + rL, yF, Hw], [x0 + rL + ins, yF, Zt], [x0 + rL + ins, yB, Zt]], uv: [[0, sl], [D, sl], [D, 0], [0, 0]], n: [-(Zt - Hw) / rn, 0, ins / rn] },
      { key: 'roofE', pts: [[x0 + rR + 1, yF, Hw], [x0 + rR + 1, yB, Hw], [x0 + rR + 1 - ins, yB, Zt], [x0 + rR + 1 - ins, yF, Zt]], uv: [[0, sl], [D, sl], [D, 0], [0, 0]], n: [(Zt - Hw) / rn, 0, ins / rn] },
      { key: 'cap', pts: [[x0 + rL + ins, yF, Zt], [x0 + rR + 1 - ins, yF, Zt], [x0 + rR + 1 - ins, yB, Zt], [x0 + rL + ins, yB, Zt]], uv: [[0, D], [cw, D], [cw, 0], [0, 0]], n: [0, 0, 1] },
    ];
    const shades = { front: 256, back: 256, wallW: 256, wallE: 256, roofW: 256, roofE: 256, cap: 256 };
    tex.awnings.forEach((a, i) => {
      const len = Math.hypot(a.drop, a.out), h = a.bmp.h;
      faces.push({ key: 'awn' + i, pts: [[x0 + a.x0, yF + a.out, a.z - a.drop], [x0 + a.x1, yF + a.out, a.z - a.drop], [x0 + a.x1, yF, a.z], [x0 + a.x0, yF, a.z]], uv: [[0, h], [a.x1 - a.x0, h], [a.x1 - a.x0, 0], [0, 0]], n: [0, a.drop / len, a.out / len], awn: i });
    });
    const it = { p, x0, yF, yB, D, tex, variant: p.variant, faces, shades, cx: x0 + W / 2, cy: (yF + yB) / 2, graded: null };
    S.gradeVolume(it);
    sc.vols.push(it);
    it.shadow = S.boxPoly(x0 + 2, yB, x0 + W - 2, yF + 1, Zt * 0.9, 0);
    it.shadowSoft = S.boxPoly(x0 - 2, yB - 3, x0 + W + 2, yF + 4, Zt * 0.9 + 2, 0);
    return true;
  };
  /** colour-graded copies of the faces' textures (the grade is part of the look of everything that is drawn) */
  S.gradeVolume = function (it) {
    const t = it.tex, g = {};
    for (const k of ['front', 'back', 'wallW', 'wallE', 'roofW', 'roofE', 'cap']) g[k] = V.grade.bitmap(t[k]);
    t.awnings.forEach((a, i) => { g['awn' + i] = V.grade.bitmap(a.bmp); });
    it.graded = g;
  };
  const FADE_OPT = { shade: 256, alpha: 256 };
  S.drawVolumes = function (fb, st, sc, tick) {
    const R = V.raster, vols = sc.vols, c = V.cfg;
    for (let i = 0; i < vols.length; i++) {
      const it = vols[i];
      if (it.variant !== it.p.variant) {                           // a story flag re-coloured it (variantByFlag): fetch the new art
        const t = art().volume(it.p.id, it.p.variant);
        it.tex = t; it.variant = it.p.variant;
        S.gradeVolume(it);
        it.faces[0].uv = it.faces[0].uv;
      }
      // skip what is entirely in the haze or behind the camera
      const dx = it.cx - st.px, dy = it.cy - st.py, v = dx * st.Fx + dy * st.Fy;
      if (v > c.fogEnd + 200 || v < -st.f * 0.95 - 160) continue;
      const g = it.graded, faces = it.faces;
      // dissolve when the building reaches over the hero: its projected box (footprint + roof) against his screen point
      let vNear = 1e9, vFar = -1e9, sx0 = 1e9, sx1 = -1e9, sy0 = 1e9, sy1 = -1e9;
      for (let k = 0; k < 8; k++) {
        const px = k & 1 ? it.x0 + it.tex.d.W : it.x0, py = k & 2 ? it.yB : it.yF, hgt = k & 4 ? it.tex.d.Ztop : 0, ddx = px - st.px, ddy = py - st.py, vv = ddx * st.Fx + ddy * st.Fy, Z = Math.max(st.f + vv, 8), sc = st.f / Z;
        if (vv < vNear) vNear = vv;
        if (vv > vFar && !(k & 4)) vFar = vv;
        const sx = CX + (ddx * st.Rx + ddy * st.Ry) * sc, sy = st.hz + (st.hh - hgt) * sc;
        if (sx < sx0) sx0 = sx; if (sx > sx1) sx1 = sx; if (sy < sy0) sy0 = sy; if (sy > sy1) sy1 = sy;
      }
      let alpha = V.coverFade(vNear, sx0, sy0, sx1, sy1);
      const behind = V.behindFadeBox(vFar, sx0, sx1);
      if (behind < alpha) alpha = behind;
      if (alpha <= 6) continue;
      if (it.shadow) { const k = alpha / 256; R.groundPoly(fb, st, it.shadowSoft, 0.1 * k, SHADOW_RGB); R.groundPoly(fb, st, it.shadow, 0.17 * k, SHADOW_RGB); }
      const late = alpha < 250, key = 1 / (st.f + (it.cx - st.px) * st.Fx + (it.cy - st.py) * st.Fy);
      FADE_OPT.alpha = 256;
      for (let k = 0; k < faces.length; k++) {
        const f = faces[k];
        if (late) V.lateFace(g[f.key], f.pts, f.uv, f.n, it.shades[f.key], alpha, key);
        else { FADE_OPT.shade = it.shades[f.key]; R.face(fb, st, g[f.key], f.pts, f.uv, f.n, FADE_OPT); }
      }
    }
  };

  const FENCE_OPT = { shade: 256, noCull: false };
  S.drawFences = function (fb, st, sc) {
    const tiles = art(), R = V.raster, fences = sc.fences;
    if (!sc.fenceTex) sc.fenceTex = { rail: V.grade.bitmap(tiles.fence3d('rail')), top: V.grade.bitmap(tiles.fence3d('top')), post: V.grade.bitmap(tiles.fence3d('post')) };
    const tex = sc.fenceTex;
    for (let i = 0; i < fences.length; i++) {
      const fe = fences[i], dx = fe.x - st.px, dy = fe.y - st.py, v = dx * st.Fx + dy * st.Fy;
      if (v > V.cfg.fogEnd || v < -st.f * 0.9) continue;
      for (const q of fe.quads) {
        FENCE_OPT.shade = q.shade; FENCE_OPT.noCull = q.noCull;
        R.face(fb, st, tex[q.part], q.pts, q.uv, q.n, FENCE_OPT);
      }
      if (proj(st, fe.x, fe.y + 2)) {
        const fogT = V.fogAt(P3.v);
        if (fogT < 0.99) V.sprite(fb, tex.post, 3, 15, P3.X, P3.Y, P3.s, 1 / P3.Z, (fogT * 256) | 0, false, true, true);
      }
    }
  };

  // ------------------------------------------------------------------------------------------------ drawing
  /** project a map point into scratch [X, Y, Z]; returns false when behind the near plane */
  const P3 = { X: 0, Y: 0, Z: 0, s: 0, v: 0 };
  function proj(st, x, y) {
    const dx = x - st.px, dy = y - st.py, v = dx * st.Fx + dy * st.Fy, Z = st.f + v;
    if (Z < 8) return false;
    const s = st.f / Z;
    P3.X = CX + (dx * st.Rx + dy * st.Ry) * s; P3.Y = st.hz + st.hh * s; P3.Z = Z; P3.s = s; P3.v = v;
    return true;
  }
  S.proj = proj; S.P3 = P3;

  S.draw = function (fb, st, sc, tick) {
    const A = NP.assets;
    // ---- volumes (buildings) first or last does not matter: everything is depth-tested
    if (S.drawVolumes) S.drawVolumes(fb, st, sc, tick);
    // ---- fences
    if (sc.fences.length) S.drawFences(fb, st, sc);
    // ---- trees
    const trees = sc.trees;
    for (let i = 0; i < trees.length; i++) {
      const o = trees[i];
      if (!proj(st, o.x, o.y)) continue;
      const s = P3.s, bmp = o.bmp, art3 = o.art;
      const hw = bmp.w * s * 0.5;
      if (P3.X + hw < 0 || P3.X - hw > SW || P3.Y - art3.ay * s >= SH || P3.Y + (bmp.h - art3.ay) * s <= 0) continue;
      const fogT = V.fogAt(P3.v);
      if (fogT >= 0.99) continue;
      V.sprite(fb, bmp, art3.ax, art3.ay, P3.X, P3.Y, s, 1 / P3.Z, (fogT * 256) | 0, o.flip, art3.cut, true, P3.v < -V.cfg.behindFrom ? V.behindFade(P3.v, P3.X, hw) : 256);
    }
    // ---- stamp billboards
    const bills = sc.bills;
    for (let i = 0; i < bills.length; i++) {
      const o = bills[i], p = o.p;
      if (!proj(st, o.x, o.y)) continue;
      const bmp = A.stamp(p.id, p.variant, A.frameAt(p.def, tick)), s = P3.s;
      if (P3.X + bmp.w * s * 0.5 < 0 || P3.X - bmp.w * s * 0.5 > SW || P3.Y - bmp.h * s >= SH || P3.Y <= 0) continue;
      const fogT = V.fogAt(P3.v);
      if (fogT >= 0.99) continue;
      V.sprite(fb, V.grade.bitmap(bmp), bmp.w / 2, bmp.h, P3.X, P3.Y, s, 1 / P3.Z, (fogT * 256) | 0, false, true, true, P3.v < -V.cfg.behindFrom && bmp.w * bmp.h >= 1200 ? V.behindFade(P3.v, P3.X, bmp.w * s * 0.5) : 256);
    }
  };
})(typeof globalThis !== 'undefined' ? globalThis : window);
