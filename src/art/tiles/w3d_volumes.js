/* src/art/tiles/w3d_volumes.js — textures for the 3D view's building volumes (NP.view3d, persp_scene.js).
 *
 * A building stamp with a `vol(variant)` option set (stamp_lib S.houseVol) is drawn in 3D as a prism: the stamp's facade art on the
 * front face (painted without its flat-view awning), and behind it the side walls (plaster with a row of windows and timber posts), two
 * roof slopes (the same patchwork shingles as the facade roof), a flat roof cap and a plain back. This file paints those faces.
 *
 *   NP.art.tiles.stamp3d(id, variant, frame) -> the facade bitmap for the 3D view (cached)
 *   NP.art.tiles.volume(id, variant) -> { d, depth, front, back, wallW, wallE, roofW, roofE, cap, awnings:[{ bmp, x0, x1, z, out, drop }] } | null
 *     d = the geometry description (S.houseVol), depth = footprint depth in px. Faces are lit from the west: W faces are bright, E faces
 *     shaded (cool), the back darker. Everything is cached; never mutate.
 */
(function (root) {
  'use strict';
  const NP = root.NP;
  const tiles = NP.art.tiles;
  const K = tiles.kit;
  const S = K.S;
  const { P, col } = K;
  const T = 16;

  const norm = (def, variant) => {
    if (typeof variant === 'number') variant = def.variants[((variant % def.variants.length) + def.variants.length) % def.variants.length];
    return variant === undefined || variant === null || def.variants.indexOf(variant) < 0 ? def.variants[0] : variant;
  };

  const c3 = new Map();
  tiles.stamp3d = function (id, variant, frame) {
    const def = NP.stamps[id];
    if (!def) throw new Error('NP.art.tiles.stamp3d: unknown stamp "' + id + '"');
    const v = norm(def, variant), f = def.frames > 1 ? ((frame | 0) % def.frames + def.frames) % def.frames : 0;
    const key = id + '|' + v + '|' + f;
    let b = c3.get(key);
    if (!b) { b = def.draw3d(v, f); c3.set(key, b); }
    return b;
  };

  // ------------------------------------------------------------------------------------------------ shading
  /** darken (k < 1) towards a cool blue-grey or brighten (k > 1) a copy of src; alpha kept */
  function shadeBmp(src, k) {
    const b = src.clone(), u = b.u32;
    for (let i = 0; i < u.length; i++) {
      const c = u[i], a = c >>> 24;
      if (!a) continue;
      let r = c & 255, g = (c >>> 8) & 255, bl = (c >>> 16) & 255;
      if (k < 1) { r = r * k + 24 * (1 - k); g = g * k + 44 * (1 - k); bl = bl * k + 120 * (1 - k); }
      else { r = Math.min(255, r * k + 3); g = Math.min(255, g * k + 3); bl = Math.min(255, bl * k + 1); }
      u[i] = ((a << 24) | ((bl | 0) << 16) | ((g | 0) << 8) | (r | 0)) >>> 0;
    }
    return b.quantize15();
  }

  // ------------------------------------------------------------------------------------------------ pieces
  /** patchwork shingles, w x h, ridge row 0 at the top, eave at the bottom (same pattern as K.roof's body) */
  function shingles(w, h, r) {
    const [hi, lt, base, mid, dk] = r, alt = lt, rowH = 5, b = K.B(w, h);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      let c;
      if (y === 0) c = lt;
      else if (y === 1) c = hi;
      else if (y === 2) c = mid;
      else if (y >= h - 2) c = y === h - 1 ? dk : lt;
      else {
        const cy = y - 3, course = Math.floor(cy / rowH), lr = cy % rowH, off = (course & 1) * 4, lx = (x + off + 64) % 8, patch = (Math.floor((x + off + 64) / 8) + course) & 1;
        if (lr === rowH - 1) c = (lx & 3) < 2 ? dk : mid;
        else if (lr === rowH - 2) c = patch ? mid : base;
        else if (lx === 0) c = mid;
        else c = patch ? alt : base;
        if (lr === 0 && lx !== 0 && course > 0) c = patch ? hi : lt;
      }
      b.u32[y * w + x] = c;
    }
    return b;
  }

  /** side wall, D wide x Hw tall: plaster, eave shadow, timber posts at both ends, stone plinth, a row of windows */
  function sideWall(d, D) {
    const Hw = d.Hw, b = K.B(D, Hw), cw = (k) => col(d.wall[k]);
    b.fillRect(0, 0, D, Hw, cw('base'));
    b.fillRect(0, 0, D, 2, cw('dk')); b.fillRect(0, 2, D, 1, cw('sh'));
    for (let i = 0; i < ((D * Hw) >> 6); i++) b.set(2 + (K.h32(i, D, 11) % Math.max(1, D - 4)), 5 + (K.h32(i, Hw, 12) % Math.max(1, Hw - 8)), cw('sh'));
    if (d.trimBand) b.fillRect(2, Hw - 12, D - 4, 2, col(d.trimBand));
    const pl = d.plinth || 3;
    b.fillRect(2, Hw - pl, D - 4, pl, P.c2);
    for (let yy = Hw - pl; yy < Hw - 1; yy += 4) for (let x = 2 + (((yy - Hw + pl) >> 2) & 1) * 3; x < D - 3; x += 6) b.fillRect(x, yy, 1, Math.min(3, Hw - 1 - yy), P.c3);
    b.fillRect(2, Hw - 1, D - 4, 1, P.c4);
    if (pl > 5) b.fillRect(2, Hw - pl, D - 4, 1, P.c1);
    b.fillRect(0, 0, 2, Hw, P.o3); b.fillRect(0, 0, 1, Hw, P.o2);
    b.fillRect(D - 2, 0, 2, Hw, P.o4); b.fillRect(D - 2, 0, 1, Hw, P.o3);
    if (d.windows === null) return b;
    const wm = d.windows[0] || { w: 9, h: 9, y: d.rb + 1 + Math.round(Hw * 0.25) };
    const ww = wm.w, wh = wm.h, wy = Math.max(4, Math.min(Hw - wh - 7, wm.y - (d.rb + 1)));
    const n = Math.max(1, Math.floor((D - 8) / (ww + 15)));
    for (let i = 0; i < n; i++) S.window(b, Math.round(((i + 1) * D) / (n + 1) - ww / 2), wy, ww, wh, { shutter: wm.shutter ? d.ramp : null, curtain: wm.curtain ? d.ramp : null });
    return b;
  }

  function capTex(d, w, D) {
    const r = d.ramp, b = K.B(w, D);
    b.fillRect(0, 0, w, D, r[1]);
    b.fillRect(0, 0, w, 1, r[0]); b.fillRect(0, D - 1, w, 1, r[2]);
    b.fillRect(0, 0, 1, D, r[0]); b.fillRect(w - 1, 0, 1, D, r[2]);
    return b;
  }

  function backTex(d) {
    const o = Object.assign({}, d.opts, { doorFn: () => {}, extras: null, awnings: null });
    return S.house(o).quantize15();
  }

  // ------------------------------------------------------------------------------------------------ the two non-cottage volumes
  /** gatehouse: stone wings under a brown hip roof; the arch is just a hole in the facade art (the passage is not modelled) */
  function gateSide(D) {
    const Hw = 29, b = K.B(D, Hw);
    S.stoneWall(b, 0, 3, D - 1, Hw - 1);
    b.fillRect(0, 0, D, 3, P.o3); b.hline(0, 0, D, P.o1); b.hline(0, 1, D, P.o2); b.hline(0, 2, D, P.o4);
    for (let x = 4; x < D - 2; x += 10) b.set(x, 1, P.o5);
    b.fillRect(0, 3, 2, Hw - 3, P.o3); b.vline(0, 3, Hw - 3, P.o2);
    b.fillRect(D - 2, 3, 2, Hw - 3, P.o4); b.vline(D - 2, 3, Hw - 3, P.o3);
    b.fillRect(0, Hw - 2, D, 2, P.c4);
    return b;
  }
  const PALE = ['#ffffff', '#eef2f8', '#d4dcea', '#aab6cc', '#8492ac', '#4c5470'].map(col);
  const EXTRA = {
    gate_house: () => ({
      w: 5, h: 3, W: 80, H: 48, ramp: K.ramp('brown'), wall: { base: 'c2', hi: 'c1', sh: 'c3', dk: 'c4' }, wl: 2, wr: 77, roofL: 1, roofR: 78,
      rt: 6, rb: 18, inset: 18, Hw: 29, Ztop: 42, windows: null, awnings: [], backFlip: true, sideFn: gateSide,
    }),
    shrine: (variant) => {
      const pressed = variant === 'pressed';
      return {
        w: 5, h: 4, W: 80, H: 64, ramp: pressed ? PALE : K.ramp('red'), wall: pressed ? { base: 'st1', hi: 'st0', sh: 'n1', dk: 'n2' } : { base: 'p1', hi: 'p0', sh: 'p2', dk: 'p3' },
        wl: 4, wr: 75, roofL: 1, roofR: 78, rt: 6, rb: 27, inset: 17, Hw: 36, Ztop: 58, windows: null, plinth: 14, awnings: [], backFlip: true,
      };
    },
  };
  tiles.hasVolume = (id) => !!(NP.stamps[id] && (NP.stamps[id].vol || EXTRA[id]));

  const cache = new Map();
  tiles.volume = function (id, variant) {
    const def = NP.stamps[id];
    if (!def || !(def.vol || EXTRA[id])) return null;
    const v = norm(def, variant), key = id + '|' + v;
    let o = cache.get(key);
    if (o) return o;
    const d = def.vol ? def.vol(v) : EXTRA[id](v), depth = d.h * T - 8, Hw = d.Hw, slope = Math.max(2, Math.round(Math.hypot(d.inset, d.Ztop - Hw)));
    const sw = (d.sideFn ? d.sideFn(depth) : sideWall(d, depth)).quantize15(), rf = shingles(depth, slope, d.ramp).quantize15();
    const capW = Math.max(2, d.roofR - d.roofL - 2 * d.inset);
    const awnings = d.awnings.map((a) => {
      const w = a.x1 - a.x0, bmp = K.B(w, a.h + 3);
      S.awning(bmp, 0, 0, w, a.h, a.c1, a.c2, a.edge);
      const out = a.h + 5;
      return { bmp: bmp.quantize15(), x0: a.x0, x1: a.x1, z: d.H - a.y, out, drop: Math.round(out * 0.6) };
    });
    o = {
      d, depth, slope, capW,
      front: tiles.stamp3d(id, v, 0),
      back: shadeBmp(d.backFlip ? tiles.stamp3d(id, v, 0).flippedX() : backTex(d), 0.64),
      wallW: shadeBmp(sw, 1.04), wallE: shadeBmp(sw, 0.72),
      roofW: shadeBmp(rf, 1.08), roofE: shadeBmp(rf, 0.74),
      cap: shadeBmp(capTex(d, capW, depth).quantize15(), 1.1),
      awnings,
    };
    cache.set(key, o);
    return o;
  };
})(typeof globalThis !== 'undefined' ? globalThis : window);
