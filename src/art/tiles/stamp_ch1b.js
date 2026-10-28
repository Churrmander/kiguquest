/* src/art/tiles/stamp_ch1b.js — Chapter 1 rebuild, outdoor stamps (part 2): Basting Green (the statue of Astara and Anwela, the
 * outdoor tea stall, market carts, bunting, picnic things, the kite) and Thimble (the Big Thimble fountain, the napping Kittabra's yarn
 * basket, the notice board and the farm), plus the Ribbon Loop maze's little fountain and the Society's measured leaf heaps.
 * Same toolkit as stamp_ch1.js: light from the top left, outlines in each material's darkest tone, contact shadows. */
(function (root) {
  'use strict';
  const NP = root.NP;
  const K = NP.art.tiles.kit;
  const S = K.S;
  const { P, col } = K;

  const WOOD = [P.o0, P.o1, P.o2, P.o3, P.o4, P.o5];
  const STONE = [P.n0, P.n1, P.n2, P.n3, P.n4];
  const out = (b, groups, fb) => K.outer(b, S.omap([[WOOD, P.o6]].concat(groups || []), fb || 'o6'));
  const R = (name) => K.ramp(name);
  const T5 = (name) => S.tones(R(name));
  const SKIN = col('#ffdcc4'), SKIN2 = col('#f4b8a4');

  // ============================================================================================ statue of Astara and Anwela (4x4)
  // Two robed women on a pale stone plinth, holding the Everspool between them at chest height. Astara (west) stands straight with a
  // crimson sash and thread lines down her sleeves; Anwela (east) leans in, blue ribbons crossing her robe. A bronze plaque on the plinth.
  //  ribbons: bright bows tied on the sleeves and robes, two tails fluttering. wrapped: both figures under one white sheet (two soft
  //  lumps with long folds), tied with string, with a paper tag; only the plinth and plaque show.
  const SW = R('white'), SG = R('gray');
  const SHEET = [col('#ffffff'), col('#d8dcea'), col('#aab0c8')], SHEET_OUT = SW[5];
  /** each figure is drawn on its own layer and outlined, so the two women and the spool read as separate shapes */
  function layer(fn) { const l = K.B(64, 64); fn(l, SW); K.outer(l, SW[4]); return l; }
  /** a robe from the shoulders (y0) to the hem (y1): sloped shoulders, a gentle flare, lit left third, shaded right quarter.
   *  cx(y) gives the centre line (so a figure can lean) */
  function robe(b, st, y0, y1, cx, hw0, hw1) {
    for (let y = y0; y <= y1; y++) {
      const hw = y < y0 + 3 ? hw0 - 3 + (y - y0) * 1.2 : hw0 + (y - y0 - 3) * (hw1 - hw0) / (y1 - y0 - 3);
      const x0 = Math.round(cx(y) - hw), x1 = Math.round(cx(y) + hw);
      for (let x = x0; x <= x1; x++) { const t = (x - x0) / Math.max(1, x1 - x0); b.set(x, y, t < 0.3 ? st[1] : t < 0.74 ? st[2] : st[3]); }
    }
  }
  /** a stone head facing south, lit from the top left: no eyes, just a brow shadow under the hair line, a nose and a chin shadow */
  function head(b, cx, cy, st) {
    b.circle(cx, cy, 4, st[1], true);
    b.fillRect(cx + 2, cy - 2, 2, 6, st[2]); b.set(cx + 4, cy, st[2]); b.set(cx + 4, cy + 1, st[3]);
    for (let y = cy - 4; y <= cy - 1; y++) for (let x = cx - 4; x <= cx + 4; x++) if (b.u32[y * 64 + x] >>> 24) b.set(x, y, (x - cx) + (y - cy) < -4 ? st[1] : x > cx + 1 ? st[3] : st[2]);   // hair cap
    b.hline(cx - 2, cy, 4, st[3]);                                                                 // brow shadow under the fringe
    b.set(cx, cy + 2, st[2]); b.hline(cx - 1, cy + 4, 3, st[3]);
  }
  function astara(b, st) {
    robe(b, st, 16, 44, () => 19.5, 8, 9);
    for (const x of [15, 19, 23]) { b.vline(x, 30, 13, st[3]); b.vline(x - 1, 32, 11, st[1]); }   // straight robe folds
    b.fillRect(18, 13, 4, 4, st[2]); b.vline(18, 13, 4, st[1]); b.hline(18, 13, 4, st[3]);       // neck, the chin's shadow on it
    head(b, 19, 9, st);
    b.circle(19, 4, 2, st[2], true); b.set(18, 3, st[1]); b.set(20, 5, st[3]);                    // bun
    b.polygon([[12, 17], [15, 16], [27, 32], [25, 34]], R('red')[2]); b.line(13, 17, 26, 33, R('red')[1]);   // crimson sash
    // her right arm reaching east to the spool: sleeve lit on top, shaded underneath, the hand on the flange
    b.polygon([[24, 17], [27, 17], [30, 23], [28, 25], [24, 21]], st[2]); b.line(25, 17, 29, 22, st[1]); b.line(24, 21, 27, 24, st[3]);
    b.fillRect(29, 22, 2, 3, st[1]);
  }
  function anwela(b, st) {
    const lean = (y) => 43 + (y - 19) * 0.12;
    // long hair falling down her back, behind the robe
    b.polygon([[42, 8], [46, 9], [49, 16], [50, 30], [46, 30], [45, 17]], st[2]); b.line(47, 12, 49, 29, st[3]); b.line(45, 10, 47, 20, st[1]);
    robe(b, st, 18, 44, lean, 8, 9.5);
    for (const x of [40, 45, 50]) { b.line(x, 31, x + 1, 43, st[3]); b.line(x - 1, 32, x, 43, st[1]); }
    for (const y of [27, 34]) { b.line(37, y, 53, y - 2, R('blue')[2]); b.line(37, y + 1, 53, y - 1, R('blue')[3]); }   // ribbons across her robe
    b.fillRect(40, 15, 4, 4, st[2]); b.vline(40, 15, 4, st[1]); b.hline(40, 15, 4, st[3]);
    head(b, 41, 11, st);
    b.line(38, 7, 44, 6, st[1]);                                                                     // a ribbon band in her hair
    // her left arm reaching west to the spool
    b.polygon([[40, 18], [37, 19], [34, 24], [36, 26], [41, 22]], st[2]); b.line(39, 18, 35, 23, st[1]); b.line(41, 22, 37, 26, st[3]);
    b.fillRect(34, 22, 2, 3, st[1]);
  }
  /** the Everspool between them: two flat light-grey flanges with dark rims, a gold thread core */
  function everspool(b) {
    b.fillRect(28, 20, 9, 9, P.gd2); b.vline(28, 20, 9, P.gd1); b.vline(29, 20, 9, P.gd1); b.vline(36, 20, 9, P.gd3);
    for (let y = 21; y < 28; y += 2) { b.hline(29, y, 7, P.gd1); b.set(35, y, P.gd2); b.hline(29, y + 1, 7, P.gd3); }
    for (const y of [17, 29]) { b.hline(27, y, 11, P.n0); b.hline(26, y + 1, 13, P.n1); b.hline(26, y + 2, 13, P.n3); b.set(38, y + 1, P.n2); }
  }
  /** wrapped for Tidy Day: two soft lumps under one white sheet (Astara taller on the left, Anwela lower on the right, a dip over the
   *  spool between them), long vertical folds from the shoulders, a darker hem pooled on the plinth, sagging string ties and a tag */
  function wrapped(b) {
    const L = { cx: 21, cy: 12, r: 8, top: 4, h0: 8, k: 0.16 }, Rr = { cx: 44, cy: 21, r: 8, top: 14, h0: 8, k: 0.2 }, M = { cx: 32, cy: 24, r: 4.5, top: 20, h0: 4, k: 0.25 };
    const inLump = (o, x, y) => {
      if (y < o.top) return false;
      if (y <= o.cy) return ((x - o.cx) / (o.r + 0.5)) ** 2 + ((y - o.cy) / (o.cy - o.top + 0.5)) ** 2 <= 1;
      const hem = y > 40 ? y - 40 : 0;
      return Math.abs(x - o.cx) <= o.h0 + (y - o.cy) * o.k + hem;
    };
    const owner = new Int8Array(64 * 64).fill(-1);
    for (let y = 0; y <= 44; y++) for (let x = 6; x <= 57; x++) {
      const ins = [L, M, Rr].map((o) => inLump(o, x, y));
      if (!ins.some(Boolean)) continue;
      // nearest centre among the lumps covering this pixel
      let best = -1, bd = 1e9;
      [L, M, Rr].forEach((o, i) => { if (ins[i]) { const d = Math.abs(x - o.cx) / (o.h0 + 1) + (i === 1 ? 0.6 : 0); if (d < bd) { bd = d; best = i; } } });
      owner[y * 64 + x] = best;
    }
    const lumps = [L, M, Rr];
    for (let y = 0; y <= 44; y++) for (let x = 6; x <= 57; x++) {
      const i = owner[y * 64 + x]; if (i < 0) continue;
      const o = lumps[i], hw = y <= o.cy ? o.r : o.h0 + (y - o.cy) * o.k, t = (x - o.cx) / hw;
      let c = t < -0.25 || (y < o.top + 3 && t < 0.3) ? 0 : t < 0.5 ? 1 : 2;
      if (y >= 41) c = c === 0 && y < 43 ? 1 : 2;                                                     // the darker hem pooled on the plinth
      if (x > 6 && owner[y * 64 + x - 1] >= 0 && owner[y * 64 + x - 1] !== i) c = 2;                   // the crease where two lumps meet
      b.set(x, y, SHEET[c]);
    }
    for (let x = 8; x < 56; x += 4) if (owner[44 * 64 + x] >= 0) b.set(x, 45, SHEET[2]);                // a scalloped hem
    // long vertical folds from the shoulders down, spreading a little as the cloth falls
    const fold = (o, off, y0) => { for (let y = y0; y <= 42; y++) { const x = Math.round(o.cx + off + off * (y - y0) / 50); if (owner[y * 64 + x] >= 0) { b.set(x, y, SHEET[2]); if (owner[y * 64 + x - 1] >= 0 && off < 3) b.set(x - 1, y, SHEET[0]); } } };
    for (const off of [-5, -2, 2, 5]) fold(L, off, 15 + Math.abs(off));
    for (const off of [-4, 0, 4]) fold(Rr, off, 24 + Math.abs(off));
    fold(M, 0, 26);
    // string ties sagging along the shape, a shadow under each
    const rope = (y0, xa, xb, sag) => { for (let x = xa; x <= xb; x++) { if (owner[y0 * 64 + x] < 0 && owner[(y0 + 2) * 64 + x] < 0) continue; const y = y0 + Math.round(sag * Math.sin(Math.PI * (x - xa) / (xb - xa))); b.set(x, y, P.hy3); b.set(x, y + 1, P.hy4); } };
    rope(24, 12, 30, 2); rope(34, 9, 55, 3);
    b.line(29, 37, 28, 39, P.hy3);                                                                    // the tag's loop
    b.fillRect(25, 39, 7, 5, P.p0); b.hline(25, 39, 7, P.p1); b.hline(25, 43, 7, P.p3); b.set(26, 40, P.o3);
    b.hline(27, 41, 4, P.p3);
  }
  function bow(b, x, y, r, tails, f) {
    b.blit(K.spr(['aa.aa', 'abcba', 'aa.aa'], { a: r[1], b: r[2], c: r[3] }), x - 2, y - 1);
    if (tails) { b.line(x - 1, y + 2, x - 2 - f, y + 6, r[2]); b.line(x + 1, y + 2, x + 3 + f, y + 5, r[2]); }
  }
  K.stamp('statue', {
    w: 4, h: 4, over: 1, variants: ['wrapped', 'ribbons'],
    paint: (v) => {
      const b = K.B(64, 64), g = SG, st = SW;
      // plinth (grey, so the pale figures stand out): a wide low step, the block, a lighter top, bronze plaque on the south face
      b.fillRect(3, 56, 58, 7, g[3]); b.hline(3, 56, 58, g[2]); b.hline(3, 62, 58, g[4]);
      b.fillRect(7, 42, 50, 15, g[2]); b.fillRect(7, 42, 50, 4, g[1]); b.hline(7, 42, 50, g[0]); b.hline(7, 46, 50, g[3]);
      b.vline(7, 46, 10, g[1]); b.fillRect(55, 46, 2, 10, g[3]);
      for (const [x, y] of [[12, 50], [47, 52], [20, 53], [44, 49]]) b.set(x, y, g[3]);
      b.fillRect(25, 48, 14, 7, P.gd3); b.fillRect(26, 49, 12, 5, P.gd2); b.hline(26, 49, 12, P.gd1);
      for (const y of [51, 53]) b.hline(28, y, 8, P.gd4);
      if (v === 'ribbons') {
        b.blit(layer(astara), 0, 0); b.blit(layer(anwela), 0, 0);
        b.hline(13, 44, 15, st[4]); b.hline(37, 44, 17, st[4]);                                      // where the robes meet the plinth
        b.line(33, 31, 30, 37, P.gd2); b.line(30, 37, 32, 43, P.gd2);                                // thread running down to the plinth
        b.blit(layer(everspool), 0, 0);
        bow(b, 24, 22, R('yellow'), false, 0); bow(b, 41, 23, R('blue'), false, 0);
        bow(b, 19, 33, R('pink'), true, 1); bow(b, 47, 40, R('yellow'), false, 0);
      } else wrapped(b);
      K.outer(b, S.omap([[S.tones(SW), SW[5]], [S.tones(SG), SG[5]], [T5('red'), R('red')[5]], [T5('blue'), R('blue')[5]], [T5('yellow'), R('yellow')[5]], [T5('pink'), R('pink')[5]],
        [[P.gd1, P.gd2, P.gd3, P.gd4], P.gd5], [[P.hy2, P.hy3, P.hy4], P.o6], [[P.p0, P.p1, P.p3], P.p6], [SHEET, SHEET_OUT]], SW[5]));
      return b;
    },
  });

  // ============================================================================================ Basting Green tea garden
  // The outdoor tea counter (3x1): a wooden counter under a striped canopy on two posts, a teapot, cups and a cake stand on top.
  K.stamp('tea_stall', {
    w: 3, h: 1, rise: 20,
    paint: () => {
      const W = 48, H = 36, b = K.B(W, H), t = R('teal');
      for (const x of [3, 43]) { b.fillRect(x, 6, 2, 18, P.o3); b.vline(x, 6, 18, P.o2); }            // canopy posts
      S.awning(b, 1, 2, 46, 5, t[1], P.p0, [t[0], t[3], t[4], P.p2]);
      // counter
      b.fillRect(1, 23, 46, 3, P.o1); b.hline(1, 23, 46, P.o0); b.hline(1, 25, 46, P.o3);
      b.fillRect(2, 26, 44, 9, P.o2); for (let x = 6; x < 46; x += 8) b.vline(x, 26, 9, P.o3); b.hline(2, 34, 44, P.o4);
      b.fillRect(18, 28, 12, 4, P.p0); b.strokeRect(18, 28, 12, 4, P.o4); b.hline(20, 30, 8, t[2]);  // a little TEA board
      // teapot (cream with a teal lid), two cups, a cake stand
      b.fillRect(6, 17, 7, 6, P.p0); b.hline(7, 16, 5, P.p0); b.fillRect(8, 15, 3, 1, t[2]); b.vline(12, 18, 4, P.p2);
      b.set(13, 18, P.p0); b.set(14, 17, P.p0); b.set(5, 19, P.p1); b.set(4, 18, P.p1);
      for (const x of [17, 22]) { b.fillRect(x, 20, 3, 3, P.p0); b.set(x + 3, 21, P.p0); b.set(x + 1, 20, P.o3); }
      b.hline(32, 22, 9, P.n1); b.vline(36, 14, 8, P.n2); b.hline(33, 18, 7, P.n1);                 // cake stand
      b.fillRect(33, 19, 3, 3, P.pk1); b.fillRect(37, 19, 3, 3, P.o1); b.fillRect(34, 15, 4, 3, P.yl1);
      out(b, [[S.tones(t), t[5]], [[P.p0, P.p1, P.p2], P.p5], [[P.n1, P.n2], P.n4], [[P.pk1, P.yl1], P.o5]]);
      K.shadow(b, 24, 35, 22, 1);
      return b;
    },
  });

  // The Tea House storage kiosk: a wooden cabinet with a little glowing screen and a spool badge on top
  K.stamp('storage_kiosk', {
    w: 1, h: 1, rise: 12,
    paint: () => {
      const b = K.B(16, 28), t = R('teal');
      b.fillRect(2, 6, 12, 20, P.o2); b.vline(2, 6, 20, P.o1); b.fillRect(12, 6, 2, 20, P.o4); b.hline(2, 25, 12, P.o5);
      b.fillRect(1, 4, 14, 3, P.o3); b.hline(1, 4, 14, P.o1);                                        // top
      b.fillRect(4, 8, 8, 6, P.ink2); b.fillRect(5, 9, 6, 4, t[1]); b.hline(5, 9, 6, t[0]); b.set(6, 11, t[3]); b.set(8, 11, t[3]);   // screen
      for (let x = 4; x < 12; x += 3) b.fillRect(x, 16, 2, 1, P.p0);                                 // keys
      b.fillRect(4, 19, 8, 5, P.o3); b.strokeRect(4, 19, 8, 5, P.o4); b.fillRect(7, 21, 2, 1, P.gd2); // drawer
      b.fillRect(6, 1, 4, 3, P.pk1); b.hline(5, 1, 6, P.o2); b.hline(5, 3, 6, P.o2);                // spool badge
      out(b, [[S.tones(t), t[5]], [[P.ink2], P.ink], [[P.pk1], P.o6]]);
      K.shadow(b, 8, 27, 7, 1);
      return b;
    },
  });

  // A round tea table under a striped parasol
  K.stamp('patio_table', {
    w: 1, h: 1, rise: 14,
    paint: () => {
      const b = K.B(16, 30), r = R('red');
      // parasol dome with alternating panels, a darker underside band and a finial on top
      for (let y = 2; y < 9; y++) {
        const half = Math.round(Math.sqrt(Math.max(0, 1 - ((8 - y) / 7) ** 2)) * 7);
        for (let x = 8 - half; x <= 7 + half; x++) b.set(x, y, ((x - 1) >> 2) & 1 ? (y === 8 ? P.p2 : P.p0) : (y === 8 ? r[3] : r[2]));
      }
      for (let x = 1; x < 15; x++) b.set(x, 9, x & 1 ? r[4] : 0);
      b.hline(5, 2, 6, r[1]); b.set(7, 1, P.o3); b.set(8, 1, P.o3); b.set(7, 0, P.o1);                 // finial
      b.vline(7, 9, 12, P.n3); b.vline(8, 9, 12, P.n4);                                              // pole, meeting the table's centre
      // the table top with a 2px edge and a cloth hanging over it
      b.ellipse(7.5, 21, 6, 2, P.p0, true); b.hline(3, 20, 6, P.p0);
      b.fillRect(2, 22, 12, 2, r[2]); for (let x = 2; x < 14; x += 2) b.set(x, 23, P.p0); b.hline(2, 24, 12, r[4]);
      b.set(7, 21, P.n3); b.set(8, 21, P.n4);
      b.fillRect(7, 25, 2, 3, P.n3); b.set(8, 26, P.n4);
      b.fillRect(4, 19, 2, 2, P.pk1); b.set(11, 20, P.o3);                                            // cup and a biscuit
      out(b, [[S.tones(r), r[5]], [[P.p0, P.p2], P.p5], [[P.n3, P.n4], P.n5], [[P.pk1], P.p5]]);
      K.shadow(b, 8, 28, 6, 1);
      return b;
    },
  });

  // Market carts (2x1): two wheels, a striped canopy, goods. food / spool / sundries / peddler (Mr. Sharp's travelling cart)
  const CARTS = { food: 'red', spool: 'pink', sundries: 'blue', peddler: 'purple' };
  K.stamp('market_cart', {
    w: 2, h: 1, rise: 18, variants: Object.keys(CARTS),
    paint: (v) => {
      const b = K.B(32, 34), c = R(CARTS[v]);
      for (const x of [4, 26]) { b.fillRect(x, 6, 2, 15, P.o3); b.vline(x, 6, 15, P.o2); }
      S.awning(b, 1, 2, 30, 4, c[1], P.p0, [c[0], c[3], c[4], P.p2]);
      // cart box
      b.fillRect(2, 20, 28, 8, P.o2); b.hline(2, 20, 28, P.o1); b.hline(2, 27, 28, P.o4);
      for (let x = 7; x < 30; x += 7) b.vline(x, 21, 6, P.o3);
      // goods on top
      if (v === 'food') {
        for (const [x, cc] of [[5, P.red2], [9, P.yl2], [13, P.red2], [18, P.f3], [22, P.o1], [26, P.yl2]]) { b.fillRect(x, 17, 3, 3, cc); b.set(x, 17, P.p0); }
      } else if (v === 'spool') {
        for (const [x, r2] of [[5, 'red'], [10, 'blue'], [15, 'yellow'], [20, 'green'], [25, 'pink']]) { const rr = R(r2); b.fillRect(x, 15, 3, 5, rr[2]); b.vline(x, 15, 5, rr[1]); b.hline(x - 1, 14, 5, P.o2); b.hline(x - 1, 19, 5, P.o2); }
      } else if (v === 'sundries') {
        b.fillRect(5, 15, 6, 5, P.hy2); b.hline(5, 15, 6, P.hy1); b.fillRect(13, 16, 4, 4, P.n1); b.set(13, 16, P.n0);
        b.fillRect(19, 14, 3, 6, P.gl3); b.set(19, 14, P.gl1); b.fillRect(24, 16, 5, 4, P.bl2); b.hline(24, 16, 5, P.bl1);
      } else {
        // a peddler's heap: crates, a lamp, rolled rugs and a hanging kettle
        b.fillRect(4, 13, 8, 7, P.o3); b.strokeRect(4, 13, 8, 7, P.o4); b.line(4, 13, 11, 19, P.o4);
        b.fillRect(13, 15, 8, 5, P.pu1); for (let x = 13; x < 21; x += 2) b.set(x, 17, P.yl1); b.hline(13, 15, 8, P.pu0);
        b.fillRect(22, 12, 4, 8, P.gd2); b.vline(22, 12, 8, P.gd1); b.set(24, 11, P.gd3);
        b.vline(15, 6, 4, P.n3); b.fillRect(13, 10, 5, 3, P.n2); b.hline(13, 10, 5, P.n1);
      }
      // wheels and handles
      for (const x of [8, 24]) { b.circle(x, 29, 3, P.o4, true); b.circle(x, 29, 2, P.o2, false); b.set(x, 29, P.o5); }
      b.hline(28, 23, 3, P.o3);
      out(b, [[S.tones(c), c[5]], [[P.red2, P.yl2, P.f3, P.p0], P.o6], [STONE, P.n5], [[P.pu0, P.pu1, P.yl1], P.pu4], [[P.gd1, P.gd2, P.gd3], P.gd5], [[P.gl1, P.gl3], P.gl5], [[P.bl1, P.bl2], P.bl4], [[P.hy1, P.hy2], P.o6]]);
      K.shadow(b, 16, 33, 14, 1);
      return b;
    },
  });

  // The crooked bunting (2x1): two posts with a string of pennants that sags lower at one end. 4 frames of flutter.
  K.stamp('bunting', {
    w: 2, h: 1, rise: 14, frames: 4, animSpeed: 12,
    paint: (v, f) => {
      const b = K.B(32, 30);
      b.fillRect(2, 3, 2, 25, P.o3); b.vline(2, 3, 25, P.o2); b.fillRect(28, 7, 2, 21, P.o3); b.vline(28, 7, 21, P.o2);
      b.set(2, 2, P.o1); b.set(28, 6, P.o1);
      // a thin cord sagging in a gentle curve between the posts, lower at the east end
      const at = (x) => Math.round(4 + (x - 4) * 0.16 + 4 * Math.sin(((x - 4) / 24) * Math.PI));
      const cols = [R('red'), R('yellow'), R('blue'), R('green'), R('pink')];
      for (let i = 0; i < 5; i++) {
        // 4px-tall pennants, lighter on the left half, every other one swaying by 1px a frame
        const x = 5 + i * 5, y = at(x + 1) + 1, c = cols[i], sway = ((i & 1) ? [0, 1, 0, -1] : [1, 0, -1, 0])[f];
        b.polygon([[x, y], [x + 3, y], [x + 1.5 + sway, y + 5]], c[2]);
        for (let yy = y; yy < y + 4; yy++) { b.set(x + (yy - y >> 1), yy, c[1]); if (yy - y < 2) b.set(x + 1, yy, c[1]); }
        b.set(x + 3, y, c[3]);
      }
      out(b, [[T5('red'), R('red')[5]], [T5('yellow'), R('yellow')[5]], [T5('blue'), R('blue')[5]], [T5('green'), R('green')[5]], [T5('pink'), R('pink')[5]]]);
      for (let x = 4; x < 28; x++) b.set(x, at(x), P.o4);                                                // the cord, 1px, over everything
      K.shadow(b, 16, 28, 14, 1);
      return b;
    },
  });

  // Picnic blanket (2x2, floor, walk-over): a gingham blanket with a fringe; red has a wicker basket, blue a plate of sandwiches
  K.stamp('picnic_blanket', {
    w: 2, h: 2, layer: 'floor', solid: ['..', '..'], variants: ['red', 'blue'],
    paint: (v) => {
      const b = K.B(32, 32), r = R(v);
      S.gingham(b, 2, 4, 28, 24, P.p0, r[1], r[2], 3);
      for (let x = 2; x < 30; x += 2) { b.set(x, 3, r[2]); b.set(x, 28, r[2]); }                    // fringe
      b.set(29, 27, r[3]); b.set(28, 27, r[3]);                                                       // a turned-up corner
      if (v === 'red') {
        b.fillRect(18, 8, 9, 6, P.o2); b.hline(18, 8, 9, P.o1); for (let x = 19; x < 27; x += 2) b.vline(x, 9, 4, P.o3);
        b.line(19, 8, 22, 5, P.o3); b.line(22, 5, 25, 8, P.o3);
      } else {
        b.ellipse(10, 14, 5, 3, P.p0, true); b.ellipse(10, 14, 5, 3, P.n2, false);
        b.fillRect(8, 12, 4, 3, P.o1); b.hline(8, 12, 4, P.p1); b.fillRect(12, 14, 3, 2, P.o1);
      }
      K.outer(b, S.omap([[S.tones(r), r[5]], [[P.p0, P.p1], r[4]], [[P.n2], P.n4]], r[4]));
      return b;
    },
  });

  // Gran's little backless picnic bench, with her flask
  K.stamp('picnic_bench', {
    w: 1, h: 1, rise: 4,
    paint: () => {
      const b = K.B(16, 20), g = R('green');
      // a plain backless picnic bench in the picnic_table's planks: two seat planks, legs splayed outward at each end
      for (const [x0, x1] of [[4, 2], [11, 13]]) { b.line(x0, 14, x1, 18, P.o4); b.line(x0 + (x1 > x0 ? -1 : 1), 14, x1 + (x1 > x0 ? -1 : 1), 18, P.o5); }
      b.hline(3, 16, 10, P.o5);                                                                         // a stretcher between the legs
      b.fillRect(1, 8, 14, 3, P.o2); b.hline(1, 8, 14, P.o1); b.hline(1, 10, 14, P.o3);                // back plank
      b.fillRect(1, 11, 14, 3, P.o2); b.hline(1, 11, 14, P.o1); b.hline(1, 13, 14, P.o4);              // front plank
      b.hline(1, 14, 14, P.o4);
      // Gran's little flask, off to one end
      b.fillRect(11, 4, 2, 4, g[2]); b.vline(11, 4, 4, g[1]); b.hline(11, 3, 2, P.n2); b.set(12, 7, g[3]);
      out(b, [[S.tones(g), g[5]], [[P.n2], P.n4]]);
      K.shadow(b, 8, 19, 7, 1);
      return b;
    },
  });

  // The kid's kite (walk-over, over 2): flying in the top tile, tail bows waving, the string running down to the bottom of the stamp
  K.stamp('kite', {
    w: 1, h: 2, over: 2, solid: ['.', '.'], frames: 4, animSpeed: 10,
    paint: (v, f) => {
      const b = K.B(16, 32), r = R('red'), y = R('yellow');
      const dx = [0, 1, 0, -1][f], dy = [0, 0, 1, 0][f], a = [0, 0.14, 0, -0.14][f];
      const C = [8 + dx, 7 + dy], ca = Math.cos(a), sa = Math.sin(a);
      const rot = ([x, yy]) => [Math.round(C[0] + x * ca - yy * sa), Math.round(C[1] + x * sa + yy * ca)];
      const T = rot([0, -6]), Rt = rot([5, -1]), Bm = rot([0, 6]), L = rot([-5, -1]), M = rot([0, -1]);
      b.polygon([T, Rt, Bm, L], r[2]);
      b.polygon([T, Rt, M], y[2]); b.polygon([L, Bm, M], y[2]);
      b.set(T[0] - 1, T[1] + 2, y[0]); b.set(L[0] + 2, L[1] + 1, y[0]);
      b.line(T[0], T[1] + 1, Bm[0], Bm[1] - 1, P.o5); b.line(L[0] + 1, L[1], Rt[0] - 1, Rt[1], P.o5);   // the cross spars
      // tail: three bows that sway 1-2px a frame, red and yellow with a light knot
      for (let i = 0; i < 3; i++) {
        const tx = Bm[0] + [1, 0, -1, 0][(f + i) & 3] * (i + 1), ty = Bm[1] + 2 + i * 3;
        b.set(tx - 1, ty, r[1]); b.set(tx, ty, P.p0); b.set(tx + 1, ty, y[1]); b.set(tx - 1, ty + 1, r[3]); b.set(tx + 1, ty + 1, y[3]);
      }
      K.outer(b, S.omap([[S.tones(r), r[5]], [S.tones(y), y[5]], [[P.p0], P.p4]], 'o6'));
      // the string: one 1px light line down to the kid's hands (drawn after the outline so it stays thin)
      for (let yy = Bm[1] + 1; yy < 32; yy++) { const x = Math.round(Bm[0] - (yy - Bm[1]) * 0.22); if (!(b.u32[yy * 16 + x] >>> 24)) b.set(x, yy, P.p0); }
      return b;
    },
  });

  // ============================================================================================ Ribbon Loop maze
  // A small stone garden fountain: round basin, a centre spout splashing on 4 frames
  K.stamp('fountain_s', {
    w: 1, h: 1, rise: 6, frames: 4, animSpeed: 10,
    paint: (v, f) => {
      const b = K.B(16, 22);
      b.ellipse(8, 15, 7, 4, P.n2, true); b.ellipse(8, 15, 7, 4, P.n3, false); b.hline(3, 11, 10, P.n1);
      b.ellipse(8, 15, 5, 2, P.w3, true); b.hline(5, 14, 6, P.w2);
      b.ellipse(8, 15, 3 + (f & 1), 1, P.w1, false);                                                   // a lighter ripple ring, breathing
      b.fillRect(1, 17, 14, 3, P.n3); b.hline(1, 17, 14, P.n2); b.hline(2, 19, 12, P.n4);
      b.fillRect(7, 8, 2, 7, P.n2); b.set(7, 8, P.n1); b.vline(8, 9, 6, P.n3); b.fillRect(6, 7, 4, 2, P.n1); b.set(9, 8, P.n3);   // spout pillar
      K.outer(b, S.omap([[STONE, P.n5], [[P.w1, P.w2, P.w3], P.n5]], 'n5'));
      // the jet: a 1px white-and-light-blue line up from the spout that opens into two falling arcs, droplets at their ends
      for (let y = 1; y < 7; y++) b.set(8, y, y & 1 ? P.w0 : P.w1);
      const arc = [[7, 1], [6, 1], [5, 2], [4, 3], [4, 4], [3, 6]];
      for (const [x, y] of arc) { b.set(x, y, y < 3 ? P.w0 : P.w1); b.set(16 - x, y, y < 3 ? P.w0 : P.w1); }
      const drop = [[3, 8], [3, 9], [4, 10], [2, 7]][f];
      b.set(drop[0], drop[1], P.w0); b.set(16 - drop[0], drop[1] + ((f + 1) & 1), P.w0);
      b.set(4 + ((f + 2) & 3), 14 + (f & 1), P.w0);                                                     // splash rings where they land
      K.shadow(b, 8, 21, 7, 1);
      return b;
    },
  });

  // A heap of measured autumn leaves with a rake leaning on it
  K.stamp('leaf_heap', {
    w: 1, h: 1, rise: 4,
    paint: () => {
      const b = K.B(16, 20), o = R('orange'), gold = P.yl2, rust = R('brown')[3];
      // a dome of leaves grouped into clusters: gold highlights on the top left, orange in the middle, rust in the shadow
      for (let y = 8; y < 19; y++) for (let x = 1; x < 15; x++) {
        const dx = (x - 7.5) / 6.8, dy = (y - 18) / 9.5;
        if (dx * dx + dy * dy > 1) continue;
        const l = dx * 0.7 + dy * 0.8 + (K.h32(x >> 1, y >> 1, 41) % 3 - 1) * 0.25;                     // cluster-sized lumps
        b.set(x, y, l < -0.75 ? gold : l < -0.15 ? o[2] : l < 0.35 ? o[3] : rust);
      }
      for (const [x, y] of [[4, 11], [9, 10], [6, 14], [11, 13], [3, 15]]) { b.set(x, y, rust); b.set(x + 1, y + 1, rust); }   // gaps between clusters
      for (const [x, y] of [[5, 10], [8, 12], [12, 15]]) b.set(x, y, R('red')[2]);                      // a few red accents
      // a rake leaning on the heap: thin brown handle, a fan of grey tines at the foot
      b.line(13, 0, 10, 12, P.o3); b.line(14, 1, 11, 12, P.o4);
      out(b, [[[gold, o[2], o[3], rust, R('red')[2]], o[5]]], o[5]);
      // the rake head, after the outline so the tines stay crisp
      for (let i = 0; i < 6; i++) { b.set(7 + i, 14, P.n3); b.set(7 + i, 15 + (i & 1), P.n2); }
      b.hline(7, 13, 6, P.n4);
      // a few loose leaves blown onto the ground
      for (const [x, y, c] of [[0, 18, o[2]], [15, 17, gold], [2, 19, o[3]]]) b.set(x, y, c);
      K.shadow(b, 8, 19, 7, 1);
      return b;
    },
  });

  // ============================================================================================ Thimble
  // The Big Thimble (2x2, 4 frames): a giant brass thimble upside down in a low round stone basin, water bubbling over its rim
  K.stamp('big_thimble', {
    w: 2, h: 2, rise: 14, frames: 4, animSpeed: 10,
    paint: (v, f) => {
      const W = 32, H = 46, b = K.B(W, H), g = [P.gd0, P.gd1, P.gd2, P.gd3, P.gd4];
      // basin
      b.ellipse(16, 36, 15, 7, P.n2, true); b.ellipse(16, 36, 15, 7, P.n3, false);
      b.ellipse(16, 35, 12, 5, P.w3, true); b.hline(8, 32, 16, P.w2);
      b.fillRect(1, 37, 30, 5, P.n3); b.hline(1, 37, 30, P.n2); b.hline(2, 41, 28, P.n4);
      b.ellipse(16, 36, 15, 7, P.n1, false); b.fillRect(1, 36, 1, 5, P.n2); b.fillRect(30, 36, 1, 5, P.n4);
      b.fillRect(13, 38, 6, 3, P.gd3); b.hline(14, 39, 4, P.gd1);                                     // plaque
      // the thimble standing in the basin: a domed, dimpled crown on top, the sides flaring out to a rolled rim at the waterline
      const half = (y) => y < 13 ? Math.sqrt(Math.max(0, 1 - ((13 - y) / 9.5) ** 2)) * 8 : 8 + (y - 13) * 0.14;
      for (let y = 4; y < 34; y++) {
        const hw = half(y), x0 = Math.round(16 - hw), x1 = Math.round(16 + hw) - 1;
        for (let x = x0; x <= x1; x++) {
          const l = (x - x0) / Math.max(1, x1 - x0), top = y < 13 ? (13 - y) / 9 : 0;
          b.set(x, y, l < 0.18 + top * 0.2 && y > 5 ? g[0] : l < 0.4 ? g[1] : l < 0.68 ? g[2] : l < 0.86 ? g[3] : g[4]);
        }
      }
      // dimples: dark and paired low in the middle, single and softer towards the crown and the edges, so the surface reads round
      for (let y = 7; y < 29; y += 3) for (let x = 9 + ((y / 3) & 1) * 2; x < 25; x += 3) {
        const hw = half(y), e = Math.abs(x - 16) / hw;
        if (e > 0.85) continue;
        const c = b.u32[y * W + x]; if (!(c >>> 24)) continue;
        const soft = e > 0.55 || y < 12;
        b.set(x, y, soft ? (x < 16 ? g[2] : g[4]) : (x < 13 ? g[2] : g[3]));
        if (!soft && y > 14) b.set(x, y + 1, x < 13 ? g[1] : g[4]);
      }
      b.fillRect(6, 30, 20, 3, g[1]); b.hline(6, 30, 20, g[0]); b.hline(6, 32, 20, g[3]); b.fillRect(23, 30, 3, 3, g[3]);   // rolled rim
      // water bubbling up from the crown and running down the sides in sheets, a different set each frame
      for (let i = 0; i < 3; i++) b.set(13 + i * 3 + (f & 1), 3 - ((f + i) % 2), P.w0);
      b.hline(13, 4, 6, P.w1); b.set(16, 4, P.w0);
      const sheets = [[[8, 7, 18], [21, 9, 22]], [[10, 6, 14], [22, 10, 24], [7, 18, 28]], [[9, 6, 20], [23, 12, 20]], [[11, 5, 12], [21, 8, 26], [8, 20, 29]]][f];
      for (const [x, y0, y1] of sheets) for (let y = y0; y <= y1; y++) {
        const xx = x + (x < 16 ? -Math.round((y - y0) * 0.12) : Math.round((y - y0) * 0.12));
        b.set(xx, y, (y + f) % 4 === 0 ? P.w0 : P.w2); b.set(xx + 1, y, P.w1);
      }
      b.set(5 + f * 2, 35, P.w1); b.set(26 - f * 2, 34, P.w1); b.set(9 + f, 33, P.w0); b.set(23 - f, 33, P.w0);   // ripples in the basin
      K.outer(b, S.omap([[g, P.gd5], [STONE, P.n5], [[P.w0, P.w1, P.w2, P.w3], P.w4]], 'n5'));
      return b;
    },
  });

  // The yarn basket, with a curled-up tuxedo Kittabra fast asleep on top (napping, 2 frames: the "z" bobs)
  K.stamp('yarn_basket', {
    w: 1, h: 1, rise: 6, variants: ['napping'], frames: 2, animSpeed: 40,
    paint: (v, f) => {
      const b = K.B(16, 22);
      // basket: weave, with a lighter rim band on top
      b.fillRect(2, 14, 12, 6, P.o2); b.hline(2, 19, 12, P.o3);
      for (let y = 16; y < 19; y++) for (let x = 2 + (y & 1); x < 14; x += 2) b.set(x, y, P.o3);
      b.hline(2, 14, 12, P.o1); b.hline(2, 15, 12, P.o2);
      // yarn balls peeking out round her: blue on the left, pink on the right, yellow in front, each with wrap lines
      b.circle(3, 12, 2, P.bl1, true); b.set(2, 11, P.p0); b.set(3, 13, P.bl2); b.set(4, 12, P.bl2);
      b.circle(13, 11, 2, P.pk1, true); b.set(12, 10, P.p0); b.set(13, 12, P.pk2); b.set(14, 11, P.pk2);
      // the Kittabra, a girl in a tuxedo cat onesie, curled up asleep: her hood (round, two triangle ears) on the left, the body curving
      // round to the right, the costume's tail wrapped round the front
      b.ellipse(9.5, 10, 4.5, 3, P.ink2, true);                                                         // curled back
      b.set(7, 7, P.ink3); b.hline(8, 7, 3, P.ink3); b.set(11, 8, P.ink3);                              // light along her back
      b.circle(5, 8, 3, P.ink2, true); b.set(3, 6, P.ink3); b.set(4, 5, P.ink3);                         // hood
      b.set(2, 5, P.ink2); b.set(2, 4, P.ink2); b.set(3, 4, P.ink2); b.set(7, 5, P.ink2); b.set(7, 4, P.ink2); b.set(6, 4, P.ink2);   // ears
      b.fillRect(3, 8, 5, 3, SKIN); b.set(3, 10, P.ink2); b.set(7, 10, P.ink2);                         // her face in the hood opening
      b.set(3, 9, P.ink2); b.set(4, 9, P.ink); b.set(6, 9, P.ink); b.set(7, 9, P.ink2);                 // eyes closed: two little curves
      b.set(5, 10, P.pk1);
      b.fillRect(8, 11, 3, 2, P.p0);                                                                     // white bib
      b.hline(4, 13, 9, P.ink2); b.hline(5, 12, 2, P.ink2); b.set(12, 12, P.ink2); b.set(3, 13, P.p0);  // tail wrapped round the front, white tip
      b.fillRect(8, 13, 2, 1, P.p0);                                                                     // a mitten paw over it
      b.set(10, 14, P.yl1); b.circle(9, 15, 1, P.yl1, true); b.set(10, 16, P.o1);                        // a yellow ball tucked in front
      out(b, [[[P.ink2, P.ink3, P.ink], P.ink], [[P.p0, SKIN, P.pk1, P.pk2, P.bl1, P.bl2, P.yl1], P.o6]]);
      b.line(13, 12, 14, 17, P.pk2);                                                                     // a loose strand over the rim
      // the sleep "z": small then large in turn, up and to the right, white with a dark outline
      const z = K.spr(f ? ['xxxx', '..x.', '.x..', 'x...', 'xxxx'] : ['xxx', '..x', '.x.', 'xxx'], { x: P.p0 }), zl = K.B(16, 8);
      zl.blit(z, f ? 11 : 10, f ? 1 : 3); K.outer(zl, P.ink); b.blit(zl, 0, 0);
      K.shadow(b, 8, 21, 7, 1);
      return b;
    },
  });

  K.stamp('notice_board', {
    w: 1, h: 1, rise: 8,
    paint: () => {
      const b = K.B(16, 24);
      b.fillRect(3, 14, 2, 9, P.o3); b.fillRect(11, 14, 2, 9, P.o4);                                 // legs
      b.fillRect(1, 3, 14, 12, P.o4); b.fillRect(2, 4, 12, 10, P.o1);                                 // frame + cork
      for (const [x, y] of [[4, 6], [9, 9], [11, 5], [6, 11]]) b.set(x, y, P.o2);
      b.fillRect(1, 1, 14, 2, R('red')[2]); b.hline(1, 1, 14, R('red')[1]);                           // little roof
      b.fillRect(3, 5, 4, 5, P.p0); b.hline(4, 7, 2, P.p3); b.hline(4, 8, 2, P.p3); b.set(5, 5, R('red')[2]);
      b.fillRect(8, 6, 5, 4, P.yl1); b.hline(9, 8, 3, P.o4); b.set(10, 6, R('blue')[2]);
      b.fillRect(6, 10, 4, 3, P.pk1); b.set(7, 10, P.ink2);
      out(b, [[T5('red'), R('red')[5]], [[P.p0, P.p3, P.yl1, P.pk1], P.o6]]);
      K.shadow(b, 8, 23, 6, 1);
      return b;
    },
  });

  // ---- the farm: tilled soil with crops (2x2, all solid) and crop rows (2x1)
  /** tilled soil; with `rows`, each crop row sits on its own darker ridge so the rows read */
  function soil(b, w, h, rows) {
    b.fillRect(1, 1, w - 2, h - 2, P.d3);
    if (rows) {
      for (let y = 2; y < h - 2; y++) for (let x = 2; x < w - 2; x++) if (K.h32(x, y, 9) % 11 === 0) b.set(x, y, P.d2);
      for (const y of rows) { b.hline(2, y - 1, w - 4, P.d4); b.hline(2, y, w - 4, P.d4); if (y + 1 < h - 1) b.hline(2, y + 1, w - 4, P.d5); }
    } else for (let y = 3; y < h - 2; y += 5) { b.hline(2, y, w - 4, P.d4); b.hline(2, y + 1, w - 4, P.d2); }
    b.hline(1, 1, w - 2, P.d2); b.hline(1, h - 2, w - 2, P.d4);
  }
  const CROP = {
    wheat: (b, x, y) => { for (let i = -2; i <= 2; i += 2) { b.vline(x + i, y - 5, 6, P.hy3); b.fillRect(x + i - 1, y - 8, 2, 4, P.hy1); b.set(x + i, y - 9, P.hy0); } },
    corn: (b, x, y) => {   // a 2px stalk, long drooping leaves in two greens, a cob in its green husk, a tassel
      b.fillRect(x, y - 10, 2, 11, P.f3); b.vline(x, y - 10, 11, P.f2);
      b.line(x - 1, y - 9, x - 3, y - 8, P.f2); b.set(x - 4, y - 7, P.f3);
      b.line(x - 1, y - 5, x - 4, y - 4, P.f2); b.set(x - 5, y - 3, P.f3); b.set(x - 5, y - 2, P.f3);
      b.line(x + 2, y - 8, x + 5, y - 6, P.f3); b.set(x + 5, y - 5, P.f4);
      b.fillRect(x + 2, y - 5, 2, 3, P.yl2); b.set(x + 2, y - 5, P.yl1); b.set(x + 3, y - 2, P.f3); b.set(x + 2, y - 2, P.f2); b.set(x + 4, y - 4, P.f3);
      b.set(x, y - 11, P.hy1); b.set(x + 1, y - 12, P.hy1);
    },
    potato: (b, x, y) => { K.lobe(b, x, y - 2, 3, 2, K.TN.leaf); b.set(x - 1, y - 4, P.p0); b.set(x + 1, y, P.o1); },
    carrot: (b, x, y) => { b.fillRect(x - 1, y - 1, 3, 2, R('orange')[2]); b.hline(x - 1, y - 1, 2, R('orange')[1]); b.set(x - 1, y - 1, R('orange')[0]); for (const dx of [-2, 0, 2]) b.line(x, y - 2, x + dx, y - 6, P.f2); b.set(x, y - 6, P.f1); },
    cabbage: (b, x, y) => {   // dark outer leaves, lighter inner leaves, a pale core with a little swirl
      b.ellipse(x, y - 2, 3, 2.5, P.f3, true); b.hline(x - 2, y, 5, P.f4); b.set(x + 3, y - 1, P.f4);
      b.ellipse(x - 0.5, y - 2.5, 2, 1.5, P.f1, true);
      b.set(x - 1, y - 3, P.g0); b.set(x, y - 3, P.g0); b.set(x, y - 2, P.f2); b.set(x + 1, y - 3, P.f2); b.set(x - 1, y - 2, P.f0);
    },
    tomato: (b, x, y) => { b.vline(x + 2, y - 12, 13, P.o3); K.lobe(b, x, y - 6, 3, 5, K.TN.leaf); for (const [dx, dy] of [[-1, -8], [1, -4], [-2, -3]]) { b.fillRect(x + dx, y + dy, 2, 2, P.red2); b.set(x + dx, y + dy, P.red1); } },
    onion: (b, x, y) => { b.fillRect(x - 1, y - 2, 3, 3, P.p0); b.set(x + 1, y, P.p2); for (const dx of [-1, 0, 1]) b.vline(x + dx, y - 7 + Math.abs(dx), 5 - Math.abs(dx), dx ? P.f3 : P.f2); },
  };
  const cropOutline = [[K.TN.leaf, P.f6], [K.TN.leafLight, P.f5], [[P.f1, P.f2, P.f3, P.f4], P.f6], [[P.hy0, P.hy1, P.hy2, P.hy3, P.yl1, P.yl2], P.o5],
    [S.tones(R('orange')), R('orange')[5]], [[P.red1, P.red2], P.red4], [[P.p0, P.p2], P.f6], [[P.d2, P.d3, P.d4, P.d5], P.d5], [[P.g0], P.f6]];
  K.stamp('crop_plot', {
    w: 2, h: 2, variants: ['wheat', 'corn', 'potato', 'carrot', 'cabbage'],
    paint: (v) => {
      const b = K.B(32, 32);
      const rows = v === 'corn' ? [12, 21, 30] : v === 'wheat' ? [9, 16, 23, 30] : [8, 14, 20, 26, 30].slice(0, 5);
      soil(b, 32, 32, rows);
      if (v === 'wheat') {
        // thin gold stalks with leaning ears, soil showing between the rows
        for (const y of rows) for (let x = 3; x < 29; x += 3) {
          const h = 5 + (K.h32(x, y, 3) % 2), lean = ((x >> 1) + (y >> 2)) & 1;
          b.vline(x, y - h, h, P.hy3);
          b.fillRect(x + lean - 1, y - h - 3, 2, 3, P.hy1); b.vline(x + lean, y - h - 2, 2, P.hy2); b.set(x + lean - 1, y - h - 3, P.hy0);
        }
      } else if (v === 'corn') {
        for (const y of rows) for (let x = 6; x < 27; x += 6) CROP.corn(b, x + ((y >> 3) & 1) * 2, y);
      } else {
        const dx = 6;
        for (const y of rows) for (let x = 5; x < 29; x += dx) CROP[v](b, x + ((y >> 2) & 1), y);
      }
      out(b, cropOutline, 'd5');
      return b;
    },
  });
  const ROW_RISE = 6;   // staked tomatoes and onion tops stand up past the soil
  K.stamp('crop_row', {
    w: 2, h: 1, rise: ROW_RISE, variants: ['tomato', 'onion'],
    paint: (v) => {
      const b = K.B(32, 16 + ROW_RISE), s = K.B(32, 16);
      soil(s, 32, 16); b.blit(s, 0, ROW_RISE);
      for (let x = 5; x < 29; x += v === 'tomato' ? 8 : 4) CROP[v](b, x, ROW_RISE + 12);
      out(b, cropOutline, 'd5');
      return b;
    },
  });

  K.stamp('hay_bale', {
    w: 1, h: 1, rise: 2,
    paint: () => {
      const b = K.B(16, 18);
      b.fillRect(2, 3, 12, 4, P.hy1); b.hline(2, 3, 12, P.hy0); b.set(2, 4, P.hy0);                   // lighter top face
      b.fillRect(2, 7, 12, 9, P.hy2); b.hline(2, 7, 12, P.hy1); b.hline(2, 15, 12, P.hy4); b.vline(13, 7, 9, P.hy3);   // darker front
      // straw running along the bale: short darker strokes, lighter ones on top
      for (const [x, y, n] of [[3, 9, 3], [8, 10, 4], [4, 12, 4], [9, 13, 3], [6, 8, 2], [3, 14, 2], [10, 9, 2]]) b.hline(x, y, n, P.hy3);
      for (const [x, y, n] of [[4, 4, 3], [9, 5, 3]]) b.hline(x, y, n, P.hy2);
      // twine: 1px dark brown, wrapping over the top face and down the front
      for (const x of [5, 10]) { b.vline(x, 3, 13, P.o5); b.set(x, 7, P.o4); }
      // stray straws poking out at the ends
      for (const [x, y] of [[1, 8], [1, 11], [0, 12], [14, 9], [14, 13], [15, 12], [3, 2]]) b.set(x, y, x === 0 || x === 15 ? P.hy3 : P.hy2);
      out(b, [[[P.hy0, P.hy1, P.hy2, P.hy3, P.hy4], P.o5], [[P.o4, P.o5], P.o6]]);
      K.shadow(b, 8, 17, 7, 1);
      return b;
    },
  });

  K.stamp('watering_can', {
    w: 1, h: 1,
    paint: () => {
      const b = K.B(16, 16), g = R('green');
      b.fillRect(3, 6, 7, 7, g[2]); b.vline(3, 6, 7, g[1]); b.vline(9, 6, 7, g[3]); b.hline(3, 12, 7, g[4]);
      b.ellipse(6, 6, 3, 1, g[1], true); b.set(5, 6, g[4]);
      b.line(10, 11, 13, 5, g[2]); b.line(10, 10, 13, 4, g[1]); b.fillRect(13, 3, 2, 2, g[3]);          // spout and rose
      b.line(4, 5, 6, 2, g[3]); b.line(6, 2, 8, 5, g[3]);                                              // handle
      out(b, [[S.tones(g), g[5]]], g[5]);
      K.shadow(b, 7, 14, 5, 1);
      return b;
    },
  });

  // Poppy's scarecrow: straw hat, a burlap face, and a patched pink cardigan on a crossbar
  K.stamp('scarecrow', {
    w: 1, h: 1, rise: 12,
    paint: () => {
      const b = K.B(16, 28), pk = R('pink');
      b.vline(8, 12, 15, P.o3); b.vline(7, 12, 15, P.o2);                                              // post
      b.fillRect(1, 12, 14, 2, P.o2);                                                                   // crossbar
      b.fillRect(4, 12, 8, 9, pk[2]); b.vline(4, 12, 9, pk[1]); b.vline(11, 12, 9, pk[3]);              // cardigan
      b.fillRect(1, 12, 3, 4, pk[2]); b.fillRect(12, 12, 3, 4, pk[3]);                                  // sleeves
      b.set(1, 16, P.hy1); b.set(14, 16, P.hy1); b.set(2, 16, P.hy2);                                   // straw cuffs
      b.fillRect(5, 15, 3, 3, R('blue')[2]); b.set(5, 15, R('blue')[1]);                                // a patch
      for (const y of [14, 16, 18]) b.set(8, y, P.p0);                                                  // buttons
      b.fillRect(5, 6, 6, 6, P.hy2); b.hline(5, 6, 6, P.hy1); b.set(6, 8, P.o5); b.set(9, 8, P.o5); b.hline(6, 10, 4, P.o4);   // burlap face
      b.fillRect(2, 5, 12, 2, P.hy1); b.fillRect(5, 2, 6, 3, P.hy2); b.hline(5, 2, 6, P.hy0); b.hline(5, 4, 6, pk[3]);  // straw hat with a band
      out(b, [[S.tones(pk), pk[5]], [[P.hy0, P.hy1, P.hy2], P.o5], [T5('blue'), R('blue')[5]], [[P.p0], P.o6]]);
      K.shadow(b, 8, 27, 4, 1);
      return b;
    },
  });

  K.stamp('wheelbarrow', {
    w: 1, h: 1, variants: ['carrots'],
    paint: () => {
      const b = K.B(16, 16), o = R('orange');
      // handles and legs at the back (west), the tray, and the single wheel at the front (east)
      b.line(0, 6, 4, 8, P.o3); b.line(0, 7, 3, 9, P.o4);                                              // handles
      b.line(4, 11, 3, 14, P.o4); b.line(6, 11, 6, 14, P.o4);                                           // legs
      b.polygon([[3, 6], [13, 6], [11, 11], [4, 11]], P.o2); b.hline(4, 11, 7, P.o4); b.line(13, 6, 11, 11, P.o3);
      // carrots standing up out of the tray: orange shoulders, a darker tip, leafy green tufts
      for (const [x, yy] of [[4, 2], [7, 1], [10, 2], [12, 3]]) {
        b.set(x, yy + 1, o[1]); b.set(x + 1, yy + 1, o[2]); b.set(x, yy + 2, o[1]); b.set(x + 1, yy + 2, o[2]); b.set(x, yy + 3, o[2]); b.set(x + 1, yy + 3, o[3]);
        b.set(x, yy, P.f2); b.set(x + 1, yy - 1, P.f3);
      }
      b.hline(3, 6, 11, P.o0); b.hline(4, 7, 9, P.o3);                                                 // the tray's lit rim and the inside wall below it
      b.circle(13, 12, 2, P.ink2, true); b.fillRect(12, 11, 3, 3, P.n4); b.set(13, 12, P.n2); b.set(12, 11, P.n2);   // the wheel: a dark tyre ring round a lighter hub
      b.set(12, 10, P.o4); b.set(13, 10, P.o4);
      out(b, [[S.tones(o), o[5]], [[P.f2, P.f3], P.ink], [[P.ink2, P.n2, P.n4], P.ink]]);
      K.shadow(b, 8, 15, 7, 1);
      return b;
    },
  });

  K.stamp('birdbath', {
    w: 1, h: 1, rise: 4,
    paint: () => {
      const b = K.B(16, 20);
      b.fillRect(6, 9, 4, 8, P.n2); b.vline(6, 9, 8, P.n1); b.vline(9, 9, 8, P.n3);                   // pedestal
      b.fillRect(4, 16, 8, 3, P.n2); b.hline(4, 16, 8, P.n1); b.hline(4, 18, 8, P.n4);                 // foot
      b.ellipse(8, 6, 7, 3, P.n1, true); b.ellipse(8, 6, 5, 2, P.w2, true); b.hline(5, 5, 4, P.w1);    // bowl and water
      b.fillRect(2, 7, 12, 2, P.n2); b.hline(2, 8, 12, P.n3);
      b.set(10, 6, P.w0);
      out(b, [[STONE, P.n5], [[P.w0, P.w1, P.w2], P.w4]], 'n5');
      K.shadow(b, 8, 19, 5, 1);
      return b;
    },
  });
})(typeof globalThis !== 'undefined' ? globalThis : window);
