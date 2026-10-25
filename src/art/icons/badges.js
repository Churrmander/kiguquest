/* src/art/icons/badges.js — the eight Salon Buttons (badges) for the Tailor Card, 16x16 and 32x32, plus #0 = an empty stitched slot.
 * Every Button is a real sewing button in its Salon's type colour, cut to a shape that names the Salon:
 *   1 Fluff  cotton-puff (scalloped)     2 Buzz  honeycomb hexagon     3 Volt  spark (toothed disc, bolt engraved)
 *   4 Terra  cut gem (faceted octagon)   5 Gale  kite (diamond, spars)  6 Frost snowflake (six points)
 *   7 Drake  scale (shield, point down)  8 Shade crescent moon
 * #0 is drawn for the Tailor Card's maroon felt case. Shapes are written as functions of (u, v) in -1..1 so the same Button draws at both sizes. Dome-shaded from the top-left, a raised
 * lip, four thread holes (two on the crescent), a glint and a dark ink outline; <= 16 colours. Order = SALON_TYPES in game/screens.js.
 */
(function (root) {
  'use strict';
  const NP = (root.NP = root.NP || {});
  const I = NP.art.icons;
  const K = I._kit;
  const { P, layer, ramp, dome, finish } = K;

  const TYPES = ['fluff', 'buzz', 'volt', 'terra', 'gale', 'frost', 'drake', 'shade'];
  const hexIn = (u, v, r) => { const a = Math.abs(u), b = Math.abs(v); return b <= r * 0.866 && a * 0.866 + b * 0.5 <= r * 0.866; };
  const SHAPES = {
    // scalloped puff: radius wobbles with 8 lobes
    fluff: (u, v) => { const a = Math.atan2(v, u), r = Math.hypot(u, v); return r <= 0.7 + 0.26 * Math.abs(Math.cos(4 * a)) ** 0.35; },
    buzz: (u, v) => hexIn(v, u, 0.98),
    // spark: a disc with four sharp points (N, E, S, W)
    volt: (u, v) => Math.hypot(u, v) <= 0.66 + 0.34 * Math.abs(Math.cos(2 * Math.atan2(v, u))) ** 5,
    terra: (u, v) => Math.abs(u) <= 0.9 && Math.abs(v) <= 0.9 && Math.abs(u) + Math.abs(v) <= 1.2,
    gale: (u, v) => Math.abs(u) / 0.86 + Math.abs(v + 0.08) / 1.02 <= 1,
    // six-pointed star (snowflake)
    frost: (u, v) => { const a = Math.atan2(v, u) + Math.PI / 2, r = Math.hypot(u, v), t = ((a / (Math.PI / 3)) % 1 + 1) % 1; return r <= 0.56 + 0.46 * Math.max(0, 1 - Math.abs(t - 0.5) * 2) ** 1.6; },
    // shield / scale: round top, point at the bottom
    drake: (u, v) => (v <= 0.1 ? Math.hypot(u, v + 0.05) <= 0.9 : Math.abs(u) <= 0.88 * (1 - (v - 0.1) / 0.92)),
    // crescent: big disc minus an offset disc
    shade: (u, v) => Math.hypot(u, v) <= 0.95 && Math.hypot(u - 0.48, v + 0.34) > 0.66,
  };
  // where the holes sit (in u, v) and how many
  const HOLES = {
    shade: [[-0.52, -0.02], [-0.28, 0.48]],
    gale: [[-0.18, -0.2], [0.18, -0.2], [-0.18, 0.12], [0.18, 0.12]],
    drake: [[-0.2, -0.24], [0.2, -0.24], [-0.2, 0.12], [0.2, 0.12]],
  };
  const HOLES4 = [[-0.22, -0.22], [0.22, -0.22], [-0.22, 0.22], [0.22, 0.22]];

  function shapeMask(S, fn) {
    const b = layer(S, S), h = S / 2 - 2;   // 1 px for the ink outline + 1 px clear margin on every side
    for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) if (fn((x + 0.5 - S / 2) / h, (y + 0.5 - S / 2) / h)) b.set(x, y, P('#ffffff'));
    return b;
  }

  /** engraved detail per Salon (big Buttons only; small ones are too tiny to carry it) */
  function engrave(b, type, S, r) {
    const c = S / 2, at = (u, v, col) => {   // only on the Button itself, never outside its silhouette
      const x = Math.round(c - 0.5 + u * (S / 2 - 2)), y = Math.round(c - 0.5 + v * (S / 2 - 2));
      if (b.get(x, y) >>> 24) b.set(x, y, P(col));
    };
    if (type === 'buzz') {   // inner hex rim
      for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
        const u = (x + 0.5 - c) / (c - 1), v = (y + 0.5 - c) / (c - 1);
        if (hexIn(v, u, 0.74) && !hexIn(v, u, 0.64)) b.set(x, y, P(r.d1));
      }
    } else if (type === 'volt') {   // little bolt between the holes
      for (const [u, v] of [[0.05, -0.62], [0.0, -0.52], [-0.05, -0.44], [0.05, 0.44], [0.0, 0.52], [-0.05, 0.62]]) at(u, v, r.d2);
    } else if (type === 'terra') {   // facet lines
      for (let k = -0.62; k <= 0.62; k += 0.06) { at(k, -0.62, r.l1); at(-0.62, k, r.l1); at(k, 0.62, r.d1); at(0.62, k, r.d1); }
    } else if (type === 'gale') {   // kite spars
      for (let k = -0.85; k <= 0.9; k += 0.05) at(0, k, r.d1);
      for (let k = -0.7; k <= 0.7; k += 0.05) at(k, -0.08, r.d1);
    } else if (type === 'frost') {   // six spokes
      for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3 - Math.PI / 2; for (let t = S > 16 ? 0.42 : 0.5; t <= 0.8; t += 0.05) at(Math.cos(a) * t, Math.sin(a) * t, r.l2); }
    } else if (type === 'drake') {   // overlapping scale arcs
      for (let k = -0.6; k <= 0.6; k += 0.04) { at(k, 0.42 + 0.35 * k * k, r.d1); }
    } else if (type === 'fluff') {   // stitched ring
      for (let i = 0; i < 16; i += 2) { const a = i * Math.PI / 8; at(Math.cos(a) * 0.58, Math.sin(a) * 0.58, r.l2); }
    }
  }

  function button(n, big) {
    const S = big ? 32 : 16;
    if (n === 0) {   // empty slot in the felt Button case: a darker felt dimple, light lip bottom-right, dashed stitch ring
      const b = layer(S, S), c = (S - 1) / 2, R = S / 2 - 2, k = big ? 32 : 16;
      b.ellipse(c + 0.6, c + 0.6, R, R, P('#a4466e'));
      b.ellipse(c, c, R, R, P('#6c2246'));
      for (let i = 0; i < k; i++) {
        if ((i >> (big ? 1 : 0)) & 1) continue;
        const a = (i / k) * Math.PI * 2, rr = R - (big ? 2.5 : 1.5);
        b.set(Math.round(c + Math.cos(a) * rr), Math.round(c + Math.sin(a) * rr), P('#94385e'));
      }
      return finish(b, null, 16, 'badge 0');
    }
    const type = TYPES[n - 1], r = ramp(type === 'fluff' ? '#e6d8bc' : I.typeColor(type));   // Fluff's grey-beige reads as dirty at 16 px: cotton cream
    if (type === 'shade') { Object.assign(r, ramp('#7c6a5e')); r.l2 = P('#e0d0c4'); r.l1 = P('#b09c90'); }   // lifted off the ink so it reads on dark UI
    const grow = !big && (type === 'frost' || type === 'terra') ? 0.88 : 1;   // these two read small at 16 px: let them fill the 14 px box
    const b = shapeMask(S, (u, v) => SHAPES[type](u * grow, v * grow));
    b.replaceColor(P('#ffffff'), P(r.m));
    dome(b, r, { r: big ? 6 : 3 });
    // raised lip: the outermost ring a shade lighter at the top-left, darker at the bottom-right
    if (big) {
      const m = b.u32.slice(), W = S;
      const ins = (x, y) => x >= 0 && y >= 0 && x < W && y < W && (m[y * W + x] >>> 24) !== 0;
      for (let y = 0; y < W; y++) for (let x = 0; x < W; x++) {
        if (!ins(x, y)) continue;
        const edge = !ins(x - 2, y) || !ins(x + 2, y) || !ins(x, y - 2) || !ins(x, y + 2);
        const inner = !ins(x - 3, y) || !ins(x + 3, y) || !ins(x, y - 3) || !ins(x, y + 3);
        if (!edge && inner) b.set(x, y, P(x + y < W ? r.d1 : r.m));
      }
      engrave(b, type, S, r);
    } else if (type === 'frost') engrave(b, type, S, r);
    // thread holes
    const c = S / 2, h = S / 2 - 2;
    for (const [u, v] of HOLES[type] || HOLES4) {
      const x = Math.round(c - 0.5 + u * h), y = Math.round(c - 0.5 + v * h);
      if (big) { b.fillRect(x - 1, y - 1, 2, 2, P(r.ink)); b.set(x, y, P(r.d2)); } else b.set(x, y, P(r.ink));
    }
    // glint at the top-left
    const g = big ? [9, 8] : [4, 4];
    for (let k = 0; k < 6 && !(b.get(g[0], g[1]) >>> 24); k++) { g[0]++; g[1]++; }
    if (b.get(g[0], g[1]) >>> 24) {   // a short white arc with an l2 tail, so the Buttons look glossy at both sizes
      const pts = big ? [[0, 2, '#ffffff'], [0, 1, '#ffffff'], [0, 0, '#ffffff'], [1, 0, '#ffffff'], [2, 0, '#ffffff'], [0, 3, r.l2], [3, 0, r.l2]] : [[0, 1, '#ffffff'], [0, 0, '#ffffff'], [1, 0, '#ffffff'], [2, 0, r.l2], [0, 2, r.l2]];
      for (const [dx, dy, cc] of pts) if (b.get(g[0] + dx, g[1] + dy) >>> 24) b.set(g[0] + dx, g[1] + dy, P(cc));
    }
    return finish(b, r.ink, 16, 'badge ' + n);
  }

  K.reg.badge = button;
  I.BADGE_TYPES = TYPES.slice();
})(typeof globalThis !== 'undefined' ? globalThis : window);
