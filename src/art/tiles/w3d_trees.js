/* src/art/tiles/w3d_trees.js — tree art for the pseudo-3D overworld (NP.view3d): chunky, faceted lime canopies on visible trunks.
 *
 * These are NOT stamps (collision, size and `over` contracts of the stamps tree / tree_big / pine / bush stay as they are for the flat
 * renderer); the 3D renderer asks for them by kind through NP.art.tiles.tree3d(kind, variant) -> { bmp, ax, ay, r }:
 *   bmp = the billboard, (ax, ay) = the trunk base inside it (where it stands on the ground), r = canopy radius (px, for shadows).
 * Kinds: 'round' (6 variants, ~44 px wide), 'big' (3 variants, ~64 px wide), 'pine' (3 variants), 'bush' (4 variants, ~22 px), 'hedge' (2).
 * Look (docs/ART-TARGET.md §1): bright lime tops lit from the top-left, mid greens on the sides, dark teal undersides, no dark
 * outlines (tonal separation only), a lit-left brown trunk that shows under the canopy, and 3-4 big overlapping lobes per tree.
 */
(function (root) {
  'use strict';
  const NP = root.NP;
  const tiles = NP.art.tiles;
  const K = tiles.kit;
  const { col } = K;

  K.addPal({
    // lime -> teal foliage ramp (high-key, saturated but soft)
    lm0: '#f8ffb0', lm1: '#dcf65c', lm2: '#b4e244', lm3: '#84c83e', lm4: '#56a63e', lm5: '#2f8446', lm6: '#1d5c4a', lm7: '#154438',
    // trunk
    tb0: '#e6b27c', tb1: '#be8650', tb2: '#8e5c3a', tb3: '#623e30', tb4: '#412a2c',
  });
  const P = K.P;
  const L = [P.lm0, P.lm1, P.lm2, P.lm3, P.lm4, P.lm5, P.lm6, P.lm7];

  // ------------------------------------------------------------------------------------------------ lobes
  /**
   * One faceted lobe: an octagon-ish silhouette split into angular facets that step from lit (top-left) to deep teal (bottom-right),
   * with a lighter plateau on top. (cx, cy) centre, (rx, ry) radii, o: { tone (shift the whole ramp), plateau (0/1), under (0..1 strength of the
   * dark underside) }. Draws into b with palette-index tones L[...].
   */
  function lobe(b, cx, cy, rx, ry, o) {
    o = o || {};
    const shift = o.tone || 0, plateau = o.plateau === undefined ? 1 : o.plateau, under = o.under === undefined ? 1 : o.under;
    const k = o.k || 1.3;
    // tone per 8 facets, clockwise from straight up: N NE E SE S SW W NW  (index into L)
    const FAC = [1, 2, 3, 4, 5, 3, 2, 1];
    const x0 = Math.floor(cx - rx - 1), x1 = Math.ceil(cx + rx + 1), y0 = Math.floor(cy - ry - 1), y1 = Math.ceil(cy + ry + 1);
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
      const dx = (x + 0.5 - cx) / rx, dy = (y + 0.5 - cy) / ry;
      const ax = Math.abs(dx), ay = Math.abs(dy);
      const d = Math.max(ax, ay, (ax + ay) / k);
      if (d > 1) continue;
      // facet by angle (0 = up, clockwise)
      let ang = Math.atan2(dx, -dy); if (ang < 0) ang += Math.PI * 2;
      const sec = Math.floor(((ang + Math.PI / 8) % (Math.PI * 2)) / (Math.PI / 4)) & 7;
      let t = FAC[sec];
      // underside: the lower part of the lobe drops into deep teal
      if (under && dy > 0.42) t = Math.max(t, dy > 0.74 ? 6 : 5);
      else if (dy > 0.16 && dx > -0.2) t = Math.max(t, 4);
      // lit plateau on the top-left of the lobe
      if (plateau) {
        const px = (dx + 0.18) / 0.62, py = (dy + 0.42) / 0.46, pd = Math.max(Math.abs(px), Math.abs(py), (Math.abs(px) + Math.abs(py)) / 1.25);
        if (pd <= 1 && dy < 0.3) { t = 1; const hx = (dx + 0.36) / 0.26, hy = (dy + 0.56) / 0.1; if (Math.abs(hx) < 1 && Math.abs(hy) < 1) t = 0; }
      }
      b.u32[y * b.w + x] = L[Math.max(0, Math.min(7, t + shift))];
    }
  }

  // ------------------------------------------------------------------------------------------------ trunk
  function trunk(b, cx, top, bot, w) {
    const x0 = cx - (w >> 1);
    for (let y = top; y <= bot; y++) {
      const flare = y > bot - 3 ? (bot - y < 1 ? 2 : 1) : 0;
      for (let i = -flare; i < w + flare; i++) {
        const t = (i + flare === 0 && flare) ? 0.25 : i / (w - 1);
        let c = i < 0 || i >= w ? P.tb3 : t < 0.25 ? P.tb0 : t < 0.55 ? P.tb1 : t < 0.8 ? P.tb2 : P.tb3;
        if (y === bot) c = P.tb4;
        b.u32[y * b.w + x0 + i] = col(c);
      }
    }
    // shade under the canopy
    for (let y = top; y < top + 3 && y <= bot; y++) for (let i = 0; i < w; i++) b.u32[y * b.w + x0 + i] = col(y === top ? P.tb4 : P.tb3);
  }

  // ------------------------------------------------------------------------------------------------ layouts [cx, cy, rx, ry, opts]
  // 'round': 48 x 56 canvas, trunk base at (24, 54). Lobes are drawn top-back first, front-low last.
  const ROUND = [
    [  // wide crown, three rows of lobes
      [24, 11, 11, 9], [12, 17, 10, 9], [36, 17, 10, 9], [24, 23, 14, 10], [14, 28, 9, 7], [34, 28, 9, 7],
    ],
    [
      [20, 10, 10, 9], [33, 14, 11, 10], [11, 20, 9, 8], [26, 22, 13, 10], [38, 26, 8, 7], [14, 29, 9, 7],
    ],
    [
      [27, 10, 11, 9], [14, 15, 11, 10], [37, 21, 10, 9], [22, 24, 13, 10], [10, 27, 8, 7], [33, 30, 9, 6],
    ],
    [
      [24, 9, 9, 8], [14, 15, 9, 8], [34, 15, 9, 8], [10, 24, 8, 8], [38, 24, 8, 8], [24, 22, 14, 11], [24, 31, 12, 6],
    ],
    [
      [16, 11, 10, 9], [32, 11, 10, 9], [24, 19, 13, 10], [10, 26, 9, 8], [38, 26, 9, 8], [24, 29, 12, 8],
    ],
    [
      [24, 8, 8, 7], [15, 13, 9, 8], [33, 12, 10, 9], [11, 22, 8, 7], [24, 20, 12, 10], [38, 23, 8, 8], [17, 30, 10, 7], [31, 31, 9, 6],
    ],
  ];
  const BIG = [
    [
      [32, 14, 14, 12], [16, 21, 13, 11], [48, 21, 13, 11], [32, 28, 18, 13], [14, 37, 11, 9], [50, 37, 11, 9], [32, 39, 15, 9],
    ],
    [
      [26, 13, 13, 11], [44, 17, 14, 12], [14, 26, 12, 10], [34, 29, 17, 13], [52, 34, 10, 9], [18, 39, 12, 9], [42, 41, 11, 8],
    ],
    [
      [36, 12, 12, 10], [18, 18, 14, 12], [52, 24, 12, 11], [32, 30, 18, 13], [12, 33, 10, 9], [54, 39, 9, 8], [28, 42, 14, 9],
    ],
  ];
  const TONES = [0, 0, 0, 0, 0, 0];

  function canopy(b, lobes, o) {
    o = o || {};
    // sort: back/top first (smaller cy + ry), so lower lobes overlap the ones above
    const order = lobes.map((l, i) => [l, i]).sort((p, q) => (p[0][1] + p[0][3] * 0.5) - (q[0][1] + q[0][3] * 0.5) || p[1] - q[1]);
    order.forEach(([l], i) => lobe(b, l[0], l[1], l[2], l[3], { tone: o.tone || 0, plateau: 1, under: 1, k: o.k }));
  }

  function mkRound(v) {
    const b = K.B(48, 48);
    trunk(b, 24, 31, 46, 7);
    canopy(b, ROUND[v % ROUND.length], { tone: v >= ROUND.length ? 1 : 0 });
    return { bmp: b, ax: 24, ay: 46, r: 18, cut: true };
  }
  function mkBig(v) {
    const b = K.B(64, 62);
    trunk(b, 32, 40, 60, 10);
    canopy(b, BIG[v % BIG.length], { tone: v >= BIG.length ? 1 : 0 });
    return { bmp: b, ax: 32, ay: 60, r: 26, cut: true };
  }

  // ------------------------------------------------------------------------------------------------ pine (stacked faceted tiers)
  function mkPine(v) {
    const W = 40, H = 62, b = K.B(W, H);
    const cx = 20;
    trunk(b, 20, 48, 60, 5);
    const wid = 1 + (v & 1), tip = (v >> 1) & 1;
    const tiers = [[28, 51, 16 + wid], [15, 40, 14 + wid], [2 + tip, 28, 11 + wid]];
    for (const [top, bot, hw] of tiers) {
      for (let y = top; y <= bot; y++) {
        const t = (y - top) / (bot - top);
        const w = Math.max(1, Math.round(hw * (0.12 + 0.88 * t)));
        // serrated hem: every other column of the last row is one pixel shorter
        for (let x = cx - w; x < cx + w; x++) {
          if (y === bot && (x & 1)) continue;
          const u = (x + 0.5 - cx) / w;                                // -1 .. 1 across the tier
          let tone = u < -0.6 ? 1 : u < -0.1 ? 2 : u < 0.4 ? 3 : 4;
          if (t > 0.55 && u > 0.15) tone += 1;
          if (y >= bot - 2) tone = Math.max(tone, y === bot ? 6 : 5);  // dark hem under each tier
          else if (t < 0.2 && u < 0.3) tone = Math.max(0, tone - 1);   // lit tip
          b.u32[y * W + x] = L[Math.min(7, tone)];
        }
      }
    }
    return { bmp: b, ax: 20, ay: 60, r: 13, cut: true };
  }

  // ------------------------------------------------------------------------------------------------ bush / hedge
  const BUSH = [
    [[11, 8, 7, 6], [6, 11, 6, 5], [16, 11, 6, 5]],
    [[10, 8, 6, 6], [17, 10, 6, 5], [5, 12, 5, 4]],
    [[8, 9, 7, 6], [15, 8, 6, 6], [12, 13, 7, 4]],
    [[12, 8, 7, 6], [5, 11, 5, 5], [18, 12, 5, 4], [12, 13, 6, 4]],
  ];
  function mkBush(v) {
    const b = K.B(24, 20);
    const lobes = BUSH[v % BUSH.length].map((l) => l.slice());
    const order = lobes.slice().sort((p, q) => p[1] - q[1]);
    for (const l of order) lobe(b, l[0], l[1], l[2], l[3], { plateau: 1, under: 1, k: 1.25 });
    return { bmp: b, ax: 12, ay: 17, r: 9 };
  }
  function mkHedge(v) {
    const b = K.B(28, 26);
    const lobes = v ? [[8, 11, 7, 7], [19, 9, 8, 8], [14, 17, 10, 7]] : [[9, 10, 8, 7], [20, 12, 7, 7], [14, 18, 10, 6]];
    for (const l of lobes.slice().sort((p, q) => p[1] - q[1])) lobe(b, l[0], l[1], l[2], l[3], { plateau: 1, under: 1, k: 1.25 });
    return { bmp: b, ax: 14, ay: 22, r: 11 };
  }

  // ------------------------------------------------------------------------------------------------ ground tiles under the trees
  // 'forest' = the shaded floor between trunks (dark teal-green with leaf litter); 'canopy' = deep forest seen from above (lobes of
  // foliage tops, period 16 so every tile joins every other); both fully opaque 16x16.
  function mkForest(v) {
    const b = K.B(16, 16);
    b.fillRect(0, 0, 16, 16, col('#2a7246'));
    for (let i = 0; i < 20; i++) {
      const x = K.h32(i, v, 71) & 15, y = K.h32(i, v, 72) & 15, k = K.h32(i, v, 73) % 5;
      b.set(x, y, col(k < 2 ? '#1f5c3c' : k < 4 ? '#348a4a' : '#4aa050'));
      if (k < 2) b.set((x + 1) & 15, y, col('#1f5c3c'));
    }
    return b;
  }
  const CAN = [[4, 4, 6, 5], [12, 3, 5, 4], [3, 12, 5, 5], [11, 12, 6, 5], [8, 8, 4, 4]];
  function mkCanopy(v) {
    const big = K.B(48, 48);
    big.fillRect(0, 0, 48, 48, col(P.lm6));
    const order = CAN.map((l) => l.slice()).sort((p, q) => p[1] - q[1]);
    for (let oy = 0; oy < 3; oy++) for (let ox = 0; ox < 3; ox++) for (const l of order) lobe(big, l[0] + ox * 16 + (v ? 1 : 0), l[1] + oy * 16, l[2], l[3], { plateau: 1, under: 1, k: 1.25, tone: 1 });
    return big.crop(16, 16, 16, 16);
  }
  const FLOORS = { forest: [mkForest, 2], canopy: [mkCanopy, 2] };
  const fcache = new Map();
  /** opaque 16x16 ground tile: kind 'forest' | 'canopy', variant index (wraps) */
  tiles.floor3d = function (kind, variant) {
    const k = FLOORS[kind];
    if (!k) throw new Error('NP.art.tiles.floor3d: unknown kind "' + kind + '"');
    const v = ((variant | 0) % k[1] + k[1]) % k[1];
    const key = kind + '|' + v;
    let b = fcache.get(key);
    if (!b) { b = k[0](v); for (let i = 0; i < b.u32.length; i++) b.u32[i] |= 0xff000000; b.quantize15(); fcache.set(key, b); }
    return b;
  };

  // ------------------------------------------------------------------------------------------------ fence parts
  // The wooden rail fence is built from geometry in 3D (persp_scene.js): 'rail' = a half-tile run (8 x 14, two rails, transparent between),
  // 'top' = the lit top of the upper rail seen from above, 'post' = the post billboard.
  function mkRail() {
    const b = K.B(8, 14);
    for (const [y0, tn] of [[3, [P.o0, P.o2, P.o4]], [8, [P.o1, P.o3, P.o5]]]) { b.fillRect(0, y0, 8, 1, tn[0]); b.fillRect(0, y0 + 1, 8, 1, tn[1]); b.fillRect(0, y0 + 2, 8, 1, tn[2]); }
    return b;
  }
  function mkTop() { const b = K.B(8, 3); b.fillRect(0, 0, 8, 3, P.o0); b.fillRect(0, 2, 8, 1, P.o1); return b; }
  function mkPost() {
    const b = K.B(6, 15);
    b.fillRect(1, 0, 4, 2, P.o0); b.set(1, 0, P.o1); b.set(4, 0, P.o2);                 // cap
    b.fillRect(1, 2, 4, 13, P.o2); b.vline(1, 2, 13, P.o1); b.vline(4, 2, 13, P.o4);   // post
    b.fillRect(1, 2, 4, 1, P.o3); b.fillRect(0, 14, 6, 1, P.o5);                        // cap shadow, foot
    return b;
  }
  const FENCE = { rail: mkRail, top: mkTop, post: mkPost };
  const fenceCache = new Map();
  /** fence part bitmap: 'rail' | 'top' | 'post' (cached, quantized, never mutate) */
  tiles.fence3d = function (part) {
    let b = fenceCache.get(part);
    if (!b) { b = FENCE[part](); b.quantize15(); fenceCache.set(part, b); }
    return b;
  };

  const KINDS = { round: [mkRound, ROUND.length * 2], big: [mkBig, BIG.length * 2], pine: [mkPine, 4], bush: [mkBush, BUSH.length], hedge: [mkHedge, 2] };
  const cache = new Map();
  /** { bmp, ax, ay, r } for a tree kind + variant index (wraps). Cached; do not mutate. */
  tiles.tree3d = function (kind, variant) {
    const k = KINDS[kind];
    if (!k) throw new Error('NP.art.tiles.tree3d: unknown kind "' + kind + '"');
    const v = ((variant | 0) % k[1] + k[1]) % k[1];
    const key = kind + '|' + v;
    let r = cache.get(key);
    if (!r) { r = k[0](v); r.bmp.quantize15(); cache.set(key, r); }
    return r;
  };
  tiles.tree3dKinds = () => Object.keys(KINDS).map((n) => [n, KINDS[n][1]]);
})(typeof globalThis !== 'undefined' ? globalThis : window);
