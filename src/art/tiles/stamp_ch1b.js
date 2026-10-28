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
  const MB = [P.mb0, P.mb1, P.mb2, P.mb3, P.mb4, P.mb5];                                          // the marble ramp: hi, lit, mid, shade, deep, outline
  const HAIR = [P.mb2, P.mb3, P.mb3, P.mb4, P.mb4], FACE = [P.mb0, P.mb0, P.mb1, P.mb2, P.mb3];
  const SHEET = [col('#ffffff'), col('#d8dcea'), col('#aab0c8')], SHEET_OUT = SW[5];
  /** stone shading for one part's flat silhouette, lit from the top left: per row a lit band (west), the mid tone, a shade band and
   *  a deep core shadow down the east side; the lit half of a top edge catches the white highlight */
  function stone(l) {
    const W = l.w, H = l.h, src = l.u32.slice(), op = (x, y) => x >= 0 && y >= 0 && x < W && y < H && src[y * W + x] >>> 24;
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      if (!op(x, y)) continue;
      let x0 = x, x1 = x;
      while (op(x0 - 1, y)) x0--;
      while (op(x1 + 1, y)) x1++;
      const t = x1 === x0 ? 0.5 : (x - x0) / (x1 - x0);
      let c = t < 0.3 ? 1 : t < 0.66 ? 2 : t < 0.86 ? 3 : 4;
      if (x1 - x0 <= 2) c = x === x0 ? 1 : x === x1 ? 3 : 2;                                          // thin parts (arms): lit / shade
      if (!op(x, y - 1) && t < 0.55) c = 0;
      l.set(x, y, MB[c]);
    }
    return l;
  }
  /** a part on its own layer: draw(l) paints a flat silhouette, stone() shades it, after(l) adds carved detail, then a deep outline
   *  so the parts (head, hair, arms, body) read apart */
  function part(b, draw, after) { const l = K.B(64, 64); draw(l); stone(l); if (after) after(l); K.outer(l, MB[5]); b.blit(l, 0, 0); return l; }
  const rows = (l, y0, y1, cx, hw) => { for (let y = y0; y <= y1; y++) { const h = hw(y); if (h > 0) l.hline(Math.round(cx - h), y, Math.round(2 * h) + 1, MB[2]); } };
  /** a robed figure (hem at y 47): shoulders at y 20, a girdled waist at y 30, the skirt flaring to a hem; `flare` = how wide it gets */
  const robeHW = (flare) => (y) => y < 19 ? 0 : y === 19 ? 4 : y <= 22 ? 6 : y <= 30 ? 5.5 - (y - 22) * 1.5 / 8 : 4 + (y - 30) * flare / 17;
  /** one figure. side = +1 for Astara (west, faces east), -1 for Anwela (east, faces west). cx = her centre line. The raised inner
   *  arm reaches up to the Everspool at hand height y 10; the outer arm hangs at her side. */
  function figure(b, cx, side, o) {
    const inner = (dx) => cx + side * dx;
    // the body: robe, the hanging outer arm as a separate sleeve along her outer side, carved folds, the girdle and the hem
    part(b, (l) => rows(l, 19, 47, cx, robeHW(o.flare)), (l) => {
      for (const k of [-0.55, 0, 0.5]) {                                                              // skirt folds: a crease with a lit west lip
        const x0 = Math.round(cx + k * 4), x1 = Math.round(cx + k * (4 + o.flare));
        l.line(x0, 33, x1, 46, MB[3]); if (k <= 0) l.line(x0 - 1, 34, x1 - 1, 46, MB[1]);
      }
      l.hline(cx - 4, 30, 9, MB[4]); l.hline(cx - 3, 31, 7, MB[1]);                                   // girdle, cut in
      for (let x = Math.round(cx - 3 - o.flare); x <= cx + 4 + o.flare; x += 3) l.set(x, 47, MB[4]);   // hem scallops
      l.set(inner(0), 20, MB[3]); l.set(inner(1), 21, MB[3]);                                         // the neckline
      const ax = cx - side * 3;
      l.line(ax, 21, ax - side, 28, side > 0 ? MB[1] : MB[3]);                                        // the hanging arm's inner crease
      l.fillRect(Math.min(ax - side, ax - 2 * side), 29, 2, 2, MB[1]); l.set(ax - 2 * side, 31, MB[3]);   // the hand at her hip
    });
    // (the outer arm hangs inside the body silhouette: a sleeve crease down her outer side and the hand resting at the hip)
    // the head: turned toward the other figure, no eyes, just a brow line and the nose's shadow on the far side of the face
    // head and hair on one layer (no outline between them): the hair is a step darker than the face, so it reads as hair, not a hood
    part(b, (l) => {
      l.circle(cx, 13, 4, MB[2], true); l.fillRect(cx - 1, 17, 3, 2, MB[2]);
      for (let y = 0; y < 34; y++) for (let x = cx - 9; x <= cx + 9; x++) if (o.hair(x, y)) l.set(x, y, MB[2]);
    }, (l) => {
      for (let y = 0; y < 34; y++) for (let x = cx - 9; x <= cx + 9; x++) if (o.hair(x, y)) {
        const c = l.get(x, y); const i = MB.indexOf(c);
        l.set(x, y, i <= 0 ? MB[2] : i <= 2 ? MB[3] : MB[4]);                                        // hair: two steps darker than the face
      }
      if (o.hairAfter) o.hairAfter(l);
      l.hline(inner(1) - (side > 0 ? 0 : 1), 12, 2, MB[3]);                                           // brow
      l.set(inner(3), 14, MB[3]);                                                                     // the nose's shadow
      l.set(inner(1), 16, MB[3]);                                                                     // under the lip
    });
    // the raised inner arm: shoulder to the spool, a clear gap between it and the head
    part(b, (l) => {
      l.line(inner(5), 20, inner(8), 11, MB[2]); l.line(inner(6), 21, inner(9), 12, MB[2]); l.line(inner(6), 20, inner(9), 11, MB[2]);
      l.fillRect(Math.min(inner(8), inner(10)), 9, 3, 3, MB[2]);                                      // the hand round the spool's flange
    }, (l) => { l.set(inner(9), 10, MB[3]); });
  }
  /** the Everspool, held up between them: a real spool standing upright, a flared disc at the top and at the bottom, a band of gold
   *  thread wound between them, and a 1 px glint */
  function everspool(b) {
    const l = K.B(64, 64), cx = 32;
    l.fillRect(cx - 3, 5, 7, 7, P.gd2);                                                               // the thread band
    for (let y = 6; y < 11; y += 2) l.hline(cx - 2, y, 5, P.gd3);
    l.vline(cx - 3, 5, 7, P.gd1); l.vline(cx + 3, 5, 7, P.gd4);
    for (const y of [3, 12]) {                                                                        // the flared discs
      l.hline(cx - 5, y, 11, P.gd2); l.hline(cx - 4, y - 1, 9, P.gd1); l.hline(cx - 4, y + 1, 9, P.gd3);
      l.set(cx - 5, y, P.gd1); l.set(cx + 5, y, P.gd3);
    }
    l.set(cx - 2, 6, P.gd0); l.set(cx - 3, 2, P.gd0);                                                 // glints
    K.outer(l, P.gd5); b.blit(l, 0, 0);
  }
  /** a 1 px ribbon along a list of points, its two tones alternating light/dark along the length, and a knot: a 2x2 knot with two
   *  short loops and two trailing tails */
  function ribbon(b, pts, r) { for (let i = 1; i < pts.length; i++) b.line(pts[i - 1][0], pts[i - 1][1], pts[i][0], pts[i][1], r[2]); }
  function knot(b, x, y, r) {
    b.blit(K.spr(['a...a', 'aakaa', '.akb.', '.b.b.', 'b...b'], { a: r[1], k: r[3], b: r[2] }), x - 2, y - 1);
  }
  function wrapped(b) {
    const L = { cx: 21, cy: 12, r: 8, top: 4, h0: 8, k: 0.16 }, Rr = { cx: 44, cy: 21, r: 8, top: 14, h0: 8, k: 0.2 }, M = { cx: 32, cy: 24, r: 4.5, top: 20, h0: 4, k: 0.25 };
    const inLump = (o, x, y) => {
      if (y < o.top) return false;
      if (y <= o.cy) return ((x - o.cx) / (o.r + 0.5)) ** 2 + ((y - o.cy) / (o.cy - o.top + 0.5)) ** 2 <= 1;
      const hem = y > 39 ? (y - 39) * 1.6 : 0;                                                           // pooled on the plinth
      return Math.abs(x - o.cx) <= o.h0 + (y - o.cy) * o.k + hem;
    };
    const owner = new Int8Array(64 * 64).fill(-1);
    for (let y = 0; y <= 44; y++) for (let x = 6; x <= 57; x++) {
      const ins = [L, M, Rr].map((o) => inLump(o, x, y));
      if (!ins.some(Boolean)) continue;
      let best = -1, bd = 1e9;
      [L, M, Rr].forEach((o, i) => { if (ins[i]) { const d = Math.abs(x - o.cx) / (o.h0 + 1) + (i === 1 ? 0.6 : 0); if (d < bd) { bd = d; best = i; } } });
      owner[y * 64 + x] = best;
    }
    const lumps = [L, M, Rr];
    for (let y = 0; y <= 44; y++) for (let x = 6; x <= 57; x++) {
      const i = owner[y * 64 + x]; if (i < 0) continue;
      const o = lumps[i], hw = y <= o.cy ? o.r : o.h0 + (y - o.cy) * o.k, t = (x - o.cx) / hw;
      let c = t < -0.25 || (y < o.top + 3 && t < 0.3) ? 0 : t < 0.5 ? 1 : 2;
      if (y >= 41) c = c === 0 && y < 43 ? 1 : 2;
      if (x > 6 && owner[y * 64 + x - 1] >= 0 && owner[y * 64 + x - 1] !== i) c = 2;
      b.set(x, y, SHEET[c]);
    }
    for (let x = 8; x < 56; x += 4) if (owner[44 * 64 + x] >= 0) b.set(x, 45, SHEET[2]);
    // short folds where the sheet drapes off each shoulder, and one soft fold shadow down each lump
    const fold = (o, off, y0) => { for (let y = y0; y <= y0 + 6; y++) { const x = Math.round(o.cx + off + off * (y - y0) / 30); if (owner[y * 64 + x] >= 0) { b.set(x, y, SHEET[2]); if (owner[y * 64 + x - 1] >= 0) b.set(x - 1, y, SHEET[0]); } } };
    for (const off of [-4, 4]) fold(L, off, 16);
    for (const off of [-4, 4]) fold(Rr, off, 26);
    for (const o of [L, Rr]) for (let y = o.cy + 2; y <= 40; y++) {
      const x = Math.round(o.cx + 2 + (y - o.cy) * 0.12);
      if (owner[y * 64 + x] >= 0 && owner[y * 64 + x + 1] >= 0) { b.set(x, y, SHEET[1]); b.set(x + 1, y, SHEET[2]); }
    }
    const rope = (y0, xa, xb, sag) => { for (let x = xa; x <= xb; x++) { if (owner[y0 * 64 + x] < 0 && owner[(y0 + 2) * 64 + x] < 0) continue; const y = y0 + Math.round(sag * Math.sin(Math.PI * (x - xa) / (xb - xa))); b.set(x, y, P.hy3); b.set(x, y + 1, P.hy4); } };
    // drape creases: 1 px shadow folds falling straight down from under each rope line to the hem, each with a lit west lip
    for (const [x, y0] of [[15, 27], [19, 27], [24, 27], [38, 37], [42, 37], [48, 37], [52, 37], [12, 37]]) for (let y = y0; y <= 43; y++) {
      if (owner[y * 64 + x] < 0) continue;
      b.set(x, y, SHEET[2]); if (owner[y * 64 + x - 1] >= 0) b.set(x - 1, y, SHEET[0]);
    }
    rope(24, 12, 30, 2); rope(34, 9, 55, 3);
    // the rope crosses once on a diagonal over the east figure, so it reads as tied rather than two flat bands
    for (let x = 36; x <= 52; x++) { const y = 20 + Math.round((x - 36) * 13 / 16); if (owner[y * 64 + x] >= 0) { b.set(x, y, P.hy3); b.set(x, y + 1, P.hy4); } }
    b.set(51, 34, P.hy2); b.set(52, 35, P.hy4); b.set(50, 35, P.hy3);                                   // the knot where they cross
    b.line(29, 36, 28, 38, P.o6);                                                                       // the tag's string
    b.fillRect(25, 39, 7, 5, P.p0); b.hline(25, 39, 7, P.p1); b.hline(25, 43, 7, P.p3); b.set(26, 40, P.o3);
    b.hline(27, 41, 4, P.p3);
  }
  function bow(b, x, y, r) { b.blit(K.spr(['aa.aa', 'abcba', 'aa.aa'], { a: r[1], b: r[2], c: r[3] }), x - 2, y - 1); }
  K.stamp('statue', {
    w: 4, h: 4, over: 1, variants: ['wrapped', 'ribbons'],
    paint: (v) => {
      const b = K.B(64, 64), g = SG;
      // a two-step grey plinth (so the white marble stands out): a wide low base step, a raised upper step with a bronze plaque
      b.fillRect(2, 56, 60, 7, g[3]); b.fillRect(2, 56, 60, 2, g[1]); b.hline(2, 56, 60, g[0]); b.hline(2, 62, 60, g[4]); b.vline(2, 58, 4, g[2]);
      b.fillRect(7, 46, 50, 10, g[2]); b.fillRect(7, 46, 50, 3, g[1]); b.hline(7, 46, 50, g[0]); b.hline(7, 49, 50, g[3]);
      b.vline(7, 49, 7, g[1]); b.fillRect(55, 49, 2, 7, g[3]); b.hline(8, 55, 48, g[3]);
      for (let y = 50; y < 55; y++) for (let x = 9; x < 55; x++) { const h = K.h32(x, y, 31) % 13; if (h === 0) b.set(x, y, g[3]); else if (h === 1) b.set(x, y, g[0]); }   // stone grain
      b.strokeRect(10, 50, 44, 5, g[3]); b.hline(11, 50, 42, g[4]); b.vline(10, 50, 5, g[4]);                // a carved border, cut in (dark top-left inner edge)
      for (let x = 4; x < 60; x += 7) b.vline(x, 59, 3, g[4]);                                                // the base step's blocks
      b.fillRect(24, 49, 16, 7, P.gd3); b.fillRect(25, 50, 14, 5, P.gd2); b.hline(25, 50, 14, P.gd1); b.vline(25, 50, 5, P.gd1);
      for (const [x, y, w] of [[27, 51, 3], [31, 51, 2], [34, 51, 3], [26, 53, 2], [29, 53, 4], [34, 53, 3]]) b.hline(x, y, w, P.gd4);   // the inscription
      if (v === 'ribbons') {
        // Astara (west): hair up in a bun, a curl at the nape. Anwela (east): long hair falling down her back past the shoulders.
        figure(b, 19, 1, {
          flare: 3,
          hair: (x, y) => ((x - 19) ** 2 + (y - 13) ** 2 <= 22 && (y < 11 || x < 17 || (y === 11 && x < 21))) || (x - 17) ** 2 + (y - 7) ** 2 <= 5
            || (x === 15 && (y === 17 || y === 18)),
          hairAfter: (l) => { l.line(16, 10, 20, 9, MB[4]); l.set(16, 6, MB[1]); l.set(17, 6, MB[1]); },
        });
        figure(b, 45, -1, {
          flare: 5,
          hair: (x, y) => ((x - 45) ** 2 + (y - 13) ** 2 <= 22 && (y < 11 || x > 47 || (y === 11 && x > 42)))
            || (y >= 13 && y <= 27 && x >= 48 && x <= 49 + (y > 19 ? 1 : 0)),
          hairAfter: (l) => { l.vline(49, 15, 11, MB[4]); l.line(42, 10, 46, 9, MB[1]); },
        });
        everspool(b);
        // ribbons: Astara's crimson sash from her outer shoulder to the opposite hip with a knot; Anwela's blue girdle ribbon with a
        // knot and tails, and two small bows (a pink one in Astara's bun, a yellow one at Anwela's wrist)
        const red = R('red'), blue = R('blue');
        ribbon(b, [[14, 22], [17, 25], [21, 28], [23, 31]], red); knot(b, 23, 32, red);
        ribbon(b, [[41, 30], [49, 30]], blue); knot(b, 42, 31, blue);
        knot(b, 16, 5, R('pink')); knot(b, 37, 14, R('yellow'));
      }
      else {
        const l = K.B(64, 64); wrapped(l); b.blit(l, 0, 3);
      }
      K.outer(b, S.omap([[MB, MB[5]], [S.tones(SW), SW[5]], [S.tones(SG), SG[5]], [T5('red'), R('red')[5]], [T5('blue'), R('blue')[5]], [T5('yellow'), R('yellow')[5]], [T5('pink'), R('pink')[5]],
        [[P.gd0, P.gd1, P.gd2, P.gd3, P.gd4], P.gd5], [[P.hy2, P.hy3, P.hy4], P.o6], [[P.p0, P.p1, P.p3], P.gd4], [SHEET, SHEET_OUT]], SW[5]));
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
      // a 3D wooden kiosk: a light top strip, a lit front, a darker 2px east side face
      b.fillRect(2, 8, 10, 18, P.o2); b.vline(2, 8, 18, P.o1); b.hline(2, 25, 10, P.o4);
      b.fillRect(12, 7, 2, 19, P.o3); b.vline(13, 8, 18, P.o4);
      b.fillRect(2, 6, 12, 2, P.o0); b.hline(2, 7, 12, P.o1); b.set(13, 6, P.o1);
      // the glowing screen: a dark bezel, a cyan face lighter in the centre, a white glint
      b.fillRect(3, 9, 8, 6, P.ink2); b.fillRect(4, 10, 6, 4, t[2]); b.fillRect(5, 11, 4, 2, t[0]); b.set(4, 10, P.p0); b.hline(4, 13, 6, t[3]);
      for (let x = 4; x < 10; x += 2) b.set(x, 16, P.p0);                                            // keys
      b.fillRect(3, 19, 8, 5, P.o3); b.strokeRect(3, 19, 8, 5, P.o4); b.fillRect(6, 21, 2, 1, P.gd2); // drawer
      // a sign panel on top: a thread-spool icon so it reads as the storage PC
      b.vline(4, 4, 2, P.o4); b.vline(11, 4, 2, P.o4);
      b.fillRect(3, 0, 10, 4, t[3]); b.hline(3, 0, 10, t[2]);
      K.stick(b, 6, 0, ['wwww', '.pp.', '.pp.', 'wwww'].slice(0, 4), { w: P.p0, p: P.pk2 });
      out(b, [[S.tones(t), t[5]], [[P.ink2], P.ink], [[P.pk2, P.p0], P.o6]]);
      K.shadow(b, 8, 27, 7, 1);
      return b;
    },
  });

  // A round tea table under a striped parasol
  K.stamp('patio_table', {
    w: 1, h: 1, rise: 14,
    paint: () => {
      const b = K.B(16, 30), r = R('red');
      // parasol: alternating red and white gores, each with a darker underside row, and a finial on top
      for (let y = 2; y < 10; y++) {
        const half = Math.round(Math.sqrt(Math.max(0, 1 - ((9 - y) / 8) ** 2)) * 7);
        for (let x = 8 - half; x <= 7 + half; x++) {
          const red = ((x - 1) >> 2) & 1;
          b.set(x, y, y >= 8 ? (red ? r[4] : P.p3) : red ? (x < 8 && y < 6 ? r[1] : r[2]) : (y < 5 ? P.p0 : P.p2));
        }
      }
      b.set(7, 1, P.p3); b.set(8, 1, P.p3); b.set(7, 0, P.p0);                                        // finial
      // the pole runs down through the table to a round base foot
      b.vline(7, 10, 17, P.n3); b.vline(8, 10, 17, P.n4);
      b.ellipse(7.5, 21, 5.5, 2, P.p0, true); b.hline(4, 22, 8, P.p2); b.hline(5, 23, 6, P.p3);       // round white tabletop, shaded front
      b.set(7, 21, P.n3); b.set(8, 21, P.n4);
      b.hline(5, 27, 6, P.n3); b.hline(6, 28, 4, P.n4);                                             // the base foot
      b.fillRect(4, 20, 2, 2, P.pk1); b.set(10, 20, P.o3);                                            // cup and a biscuit
      out(b, [[S.tones(r), r[5]], [[P.p0, P.p2, P.p3], P.p5], [[P.n3, P.n4], P.n5], [[P.pk1], P.p5]]);
      K.shadow(b, 8, 26, 7, 2);
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
      // two 2px posts, lit on the west side, dark on the east, each with a lighter cap
      for (const [x, y0] of [[2, 3], [28, 7]]) { b.vline(x, y0, 28 - y0, P.o2); b.vline(x + 1, y0, 28 - y0, P.o4); b.set(x, y0 - 1, P.o1); b.set(x + 1, y0 - 1, P.o2); }
      // a cord sagging in a gentle curve between the posts, lower at the east end
      const at = (x) => Math.round(4 + (x - 4) * 0.16 + 4 * Math.sin(((x - 4) / 24) * Math.PI));
      const cols = [R('red'), R('yellow'), R('blue'), R('green'), R('pink'), R('orange')];
      for (let i = 0; i < 6; i++) {
        // 4x5 pennants across the whole span, lighter on the left; alternate ones flutter 1px each frame
        const x = 5 + i * 4, y = at(x + 1) + 1, c = cols[i], sway = ((i & 1) ? [1, 0, -1, 0] : [-1, 0, 1, 0])[f], len = 4 + (((i + f) & 1));
        b.polygon([[x, y], [x + 3, y], [x + 1.5 + sway, y + len]], c[2]);
        b.vline(x, y, 2, c[1]); b.set(x + 1, y + 2, c[1]); b.vline(x + 3, y, 2, c[3]);
      }
      out(b, [[T5('red'), R('red')[5]], [T5('yellow'), R('yellow')[5]], [T5('blue'), R('blue')[5]], [T5('green'), R('green')[5]], [T5('pink'), R('pink')[5]], [T5('orange'), R('orange')[5]]]);
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
      const b = K.B(16, 20);
      // a short backless bench in the bench:default woods: a seat of two planks with a lit top edge and a shaded front, two short legs
      for (const x of [3, 11]) { b.fillRect(x, 13, 2, 4, P.o4); b.vline(x, 13, 4, P.o3); }
      b.fillRect(1, 9, 14, 4, P.o2); b.hline(1, 9, 14, P.o0); b.hline(1, 10, 14, P.o1); b.hline(1, 11, 14, P.o4); b.hline(1, 12, 14, P.o3);
      b.hline(1, 13, 14, P.o4);
      // Gran's wicker picnic basket on it: a handle arch, a lit rim, a 2-tone weave
      K.stick(b, 8, 2, ['..hh..', '.h..h.', 'rrrrrr', 'wvwvwv', 'vwvwvw', 'vvvvvv'], { h: P.o3, r: P.o0, w: P.o1, v: P.o3 });
      b.set(9, 7, P.o4); b.set(12, 7, P.o4);
      out(b);
      b.set(10, 3, 0); b.set(11, 3, 0);                                                                 // see through the handle
      K.shadow(b, 8, 18, 7, 1);
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
      // the string: tied at the bridle point in the kite's centre, running down to the kid's hands clear of the tail; 1px, light with a
      // darker tone on alternate pixels so it reads on bright grass (drawn after the outline so it stays thin)
      for (let yy = M[1] + 1; yy < 32; yy++) { const x = Math.round(M[0] - 2 - (yy - M[1]) * 0.3); if (x >= 0 && !(b.u32[yy * 16 + x] >>> 24) || yy > Bm[1] + 1) b.set(Math.max(0, x), yy, yy & 1 ? P.n2 : P.p0); }
      return b;
    },
  });

  // ============================================================================================ Ribbon Loop maze
  // A small stone garden fountain: round basin, a centre spout splashing on 4 frames
  K.stamp('fountain_s', {
    w: 1, h: 1, rise: 10, frames: 4, animSpeed: 10,
    paint: (v, f) => {
      const b = K.B(16, 26);
      // the basin, the full tile wide: a 2-tone stone rim (lit NW, shaded SE), the water inside, and the rim's front wall in blocks
      b.ellipse(7.5, 18, 6.5, 3.5, P.n1, true);
      for (let y = 14; y <= 22; y++) for (let x = 1; x <= 14; x++) {
        const dx = (x + 0.5 - 8) / 6.5, dy = (y + 0.5 - 18) / 3.5;
        if (dx * dx + dy * dy <= 1 && dx + dy * 1.3 > 0.35) b.set(x, y, P.n3);
      }
      b.ellipse(7.5, 17.5, 4.6, 2, P.w3, true); b.hline(4, 16, 8, P.w4); b.hline(5, 19, 6, P.w2);
      b.ellipse(7.5, 17.5, 2 + (f & 1), 0.8, P.w2, false);                                             // a ripple ring, breathing
      b.fillRect(1, 19, 14, 4, P.n2); b.hline(1, 19, 14, P.n1); b.hline(1, 22, 14, P.n4); b.fillRect(11, 20, 4, 2, P.n3);
      for (const x of [5, 10]) b.vline(x, 20, 2, P.n4);                                                // blocks in the front wall
      // the pedestal and the upper bowl (the second tier), lit on the west
      b.fillRect(6, 11, 4, 7, P.n2); b.vline(6, 11, 7, P.n1); b.vline(9, 11, 7, P.n3);
      b.ellipse(7.5, 10, 4, 1.6, P.n1, true); b.hline(5, 9, 6, P.w2); b.hline(6, 10, 4, P.w3);
      b.hline(4, 11, 8, P.n3); b.hline(5, 12, 6, P.n4);                                                // the bowl's shaded underside
      b.fillRect(7, 6, 2, 3, P.n1); b.set(8, 7, P.n3); b.set(8, 8, P.n3);                             // the spout finial
      K.outer(b, S.omap([[STONE, P.n5], [[P.w1, P.w2, P.w3, P.w4], P.n5]], 'n5'));
      // the jet: up from the finial, opening into two short arcs falling to the bowl's lip, then drips from the lip into the basin
      b.vline(7, 1, 5, P.w1); b.vline(8, 2, 4, P.w2);
      for (const [x, y] of [[6, 1], [5, 2], [4, 3], [4, 4], [3, 5]]) { b.set(x, y, P.w1); b.set(15 - x, y, P.w2); }
      for (const k of [0, 1]) { const y = 13 + ((f + k * 2) & 3); b.set(3, y, P.w1); b.set(12, y, P.w1); }
      K.shadow(b, 8, 25, 7, 1);
      return b;
    },
  });

  // A heap of measured autumn leaves: one clean dome outlined dark, its top edge scalloped by leaf tips, shaded in three orange
  // tones lit from the top left. Rows of small overlapping leaf arcs (a shade arc under a lit tip, staggered like scales) give it a
  // leafy texture without noise; a red and a yellow leaf sit on the crown and two loose leaves lie on the ground beside it.
  K.stamp('leaf_heap', {
    w: 1, h: 1, rise: 4,
    paint: () => {
      const b = K.B(16, 20), o = R('orange'), L = K.B(16, 20);
      const cx = 7.5, rx = 7, ry = 10, base = 17, TONE = [o[1], o[2], o[3], o[4]];
      const tone = [];
      for (let x = 1; x <= 14; x++) {
        const t = (x + 0.5 - cx - 0.5) / rx, top = Math.round(base - ry * Math.sqrt(Math.max(0, 1 - t * t)) * 0.92) + [1, 0, 0, 1][(x + 1) & 3];
        for (let y = top; y <= base; y++) {
          const g = (x - cx) / rx * 0.8 + (y - 8) / 9;                                                  // 0 at the lit top left, ~1.6 at the foot right
          const k = g < 0.15 ? 0 : g < 0.85 ? 1 : 2;
          tone[y * 16 + x] = k; L.set(x, y, TONE[k]);
        }
      }
      // leaf arcs in staggered rows: a one-tone-darker smile under a lit tip
      for (const [y, x0] of [[9, 4], [9, 8], [12, 2], [12, 6], [12, 10], [15, 4], [15, 8]]) {
        const arc = [[0, 0], [1, 1], [2, 1], [3, 0]];
        if (arc.some(([dx, dy]) => tone[(y + dy) * 16 + x0 + dx] === undefined)) continue;
        for (const [dx, dy] of arc) { const k = tone[(y + dy) * 16 + x0 + dx]; L.set(x0 + dx, y + dy, TONE[Math.min(3, k + 1)]); }
        const kt = tone[(y - 1) * 16 + x0 + 1]; if (kt !== undefined) L.set(x0 + 1, y - 1, TONE[Math.max(0, kt - 1)]);
      }
      // a red and a yellow leaf on the crown
      K.stick(L, 5, 8, ['.Rr', 'rr.'], { r: P.red2, R: P.red1 });
      K.stick(L, 9, 10, ['Yy', '.y'], { y: P.yl2, Y: P.yl1 });
      K.outer(L, o[5]);
      // two loose leaves on the ground, clear of the heap
      K.stick(L, 0, 19, ['oO'], { o: o[2], O: o[3] });
      K.stick(L, 13, 19, ['rR'], { r: P.red2, R: P.red3 });
      K.shadow(b, 8, 18, 7, 1, 90);
      b.blit(L, 0, 0);
      return b;
    },
  });

  // ============================================================================================ Thimble
  // The Big Thimble (2x2, 4 frames): a giant brass thimble standing the way a thimble rests on a table, open end down: a wide rolled
  // rim at the foot, dimpled sides tapering a little as they rise, and a round dimpled dome on top. It stands in a low round stone
  // basin as a fountain: water bubbles up out of the top of the dome, runs down over the dimples in thin streams and splashes into
  // the basin.
  // brass, a step more ochre than the gold palette so it matches the plaque's metal: hi, lit, base, shade, deep, outline
  const BRASS = ['#fff0c0', '#f2cc6c', '#d8a444', '#b07c2c', '#7c5420'].map(col);
  K.stamp('big_thimble', {
    w: 2, h: 2, rise: 14, frames: 4, animSpeed: 10,
    paint: (v, f) => {
      const W = 32, H = 46, b = K.B(W, H), g = BRASS;
      // basin
      b.ellipse(16, 36, 15, 7, P.n2, true); b.ellipse(16, 36, 15, 7, P.n3, false);
      b.ellipse(16, 35, 12, 5, P.w3, true); b.hline(8, 32, 16, P.w2);
      b.fillRect(1, 37, 30, 5, P.n3); b.hline(1, 37, 30, P.n2); b.hline(2, 41, 28, P.n4);
      b.ellipse(16, 36, 15, 7, P.n1, false); b.fillRect(1, 36, 1, 5, P.n2); b.fillRect(30, 36, 1, 5, P.n4);
      b.fillRect(12, 38, 8, 4, P.gd4); b.fillRect(13, 39, 6, 2, P.gd3); b.hline(14, 39, 4, P.gd1);   // plaque, set into a darker inset
      // the thimble: dome top at y 6, the dome meets the sides at y 15, the sides widen down to the rolled rim (y 30-33)
      const DT = 8, DS = 16, RIM = 30, BOT = 33, cx = 16;
      const half = (y) => y < DS ? 8.2 * Math.sqrt(Math.max(0, 1 - ((DS - y) / (DS - DT + 0.6)) ** 2)) : y < RIM ? 8.2 + (y - DS) * 1.6 / (RIM - DS) : 10.6;
      const toneAt = [];
      for (let y = DT; y <= BOT; y++) {
        const hw = half(y), x0 = Math.round(cx - hw), x1 = Math.round(cx + hw) - 1;
        for (let x = x0; x <= x1; x++) {
          const l = (x - x0) / Math.max(1, x1 - x0);
          let k = l < 0.18 ? 0 : l < 0.42 ? 1 : l < 0.68 ? 2 : l < 0.86 ? 3 : 4;
          if (y < DS) { const dy = (DS - y) / (DS - DT); k = Math.max(0, Math.min(4, k - (dy > 0.55 && l < 0.6 ? 1 : 0))); }   // the dome's crown catches more light
          b.set(x, y, g[k]); toneAt[y * W + x] = k;
        }
      }
      // dimples: a staggered grid over the dome and the sides, each one tone darker than the brass round it, kept off the edges
      for (let y = DT + 2; y < RIM - 1; y += 2) for (let x = cx - 10 + ((y >> 1) & 1); x < cx + 10; x += 2) {
        const k = toneAt[y * W + x];
        if (k === undefined || k >= 4 || toneAt[y * W + x - 1] === undefined || toneAt[y * W + x + 1] === undefined || toneAt[(y - 1) * W + x] === undefined) continue;
        b.set(x, y, g[k + 1]);
      }
      // the rolled rim at the foot: a lit band with a groove above it and a dark underside
      const rx0 = Math.round(cx - 10.6), rx1 = Math.round(cx + 10.6) - 1;
      b.hline(rx0 + 1, RIM - 1, rx1 - rx0 - 1, g[3]);
      for (let x = rx0; x <= rx1; x++) { const l = (x - rx0) / (rx1 - rx0); b.set(x, RIM, l < 0.6 ? g[0] : g[1]); b.set(x, RIM + 1, l < 0.25 ? g[1] : l < 0.7 ? g[2] : g[3]); b.set(x, RIM + 2, l < 0.7 ? g[3] : g[4]); b.set(x, BOT, g[4]); }
      // a curved highlight on the dome's lit shoulder
      for (const [x, y] of [[12, 10], [11, 11], [10, 12], [10, 13]]) if (toneAt[y * W + x] !== undefined) b.set(x, y, g[0]);
      // the basin water in front of the foot, so the thimble stands down in the pool
      for (let y = 34; y <= 40; y++) for (let x = 4; x < 28; x++) {
        const dx = (x + 0.5 - 16) / 12.5, dy = (y + 0.5 - 35) / 5.5;
        if (dx * dx + dy * dy <= 1 && toneAt[y * W + x] !== undefined) b.set(x, y, P.w3);
      }
      K.outer(b, S.omap([[g, P.gd5], [STONE, P.n5], [[P.w0, P.w1, P.w2, P.w3], P.w4]], 'n5'));
      // (after the outline, so they stay crisp) the water: a little bubbling crown on top of the dome that rises and falls with the
      // frames, then thin streams running down over the dome and the sides into the basin, with droplets moving down them
      // the bubbling crown: a small mound of water welling out of the top of the dome, its outline rippling with the frames
      const cr = [6 + (f & 1), 5, 4, 3, 2];                                                          // half-widths from row DT-1 upwards
      for (let i = 0; i < cr.length; i++) { const y = DT - i, hw = cr[i] - (i === 4 && (f & 2) ? 1 : 0); for (let x = cx - hw; x < cx + hw; x++) b.set(x, y, i >= 3 ? P.w0 : x < cx - hw + 2 ? P.w1 : x >= cx + hw - 2 ? P.w3 : P.w2); }
      b.set(cx - 3 + f, DT - 6, P.w1); b.set(cx + 2 - (f >> 1), DT - 7 + (f & 1), P.w0);              // spray drops
      for (let x = cx - 6; x < cx + 6; x++) if (b.u32[(DT - 5) * W + x] >>> 24 === 0 && b.u32[(DT - 4) * W + x] >>> 24) b.set(x, DT - 5, P.w4);   // a dark rim on the crown
      // thin streams running down over the dimples on the lit and shaded sides, with droplets moving down them
      for (const [k, ph, c] of [[-0.62, 0, P.w1], [0.55, 2, P.w2], [-0.1, 1, P.w1]]) {
        for (let y = DT; y < RIM; y++) if ((y + f + ph) % 5 < (k === -0.1 ? 2 : 3)) b.set(Math.round(cx - 0.5 + k * half(y)), y, c);
        const dy = DT + 1 + ((f + ph) & 3) * 5;
        b.set(Math.round(cx - 0.5 + k * half(dy)), dy, P.w0);
      }
      b.set(6 + f, 34, P.w0); b.set(25 - f, 34, P.w0); b.set(9 + f, 33, P.w1); b.set(22 - f, 33, P.w1);   // splashes in the basin
      return b;
    },
  });

  // The yarn basket, with a curled-up tuxedo Kittabra fast asleep on top (napping, 2 frames: the "z" bobs)
  K.stamp('yarn_basket', {
    w: 1, h: 1, rise: 6, variants: ['napping'], frames: 2, animSpeed: 40,
    paint: (v, f) => {
      const b = K.B(16, 22);
      // the basket, 7px tall in 3 tones: a light rolled rim, a mid weave, a dark base row
      b.fillRect(1, 14, 14, 7, P.o2);
      for (let y = 16; y < 20; y++) for (let x = 1 + (y & 1); x < 15; x += 2) b.set(x, y, P.o3);
      b.hline(1, 14, 14, P.o0); b.hline(1, 15, 14, P.o1); b.hline(1, 20, 14, P.o4); b.vline(14, 16, 4, P.o3);
      // the Kittabra, a girl in a tuxedo-cat onesie, curled up asleep on the yarn: hood ears with pink insides, her face with one
      // closed-eye line each side, a big white bib, the black body curled behind, and the costume tail wrapped round the front with a
      // white tip. She breathes: up 1px on frame 1.
      const k = K.B(16, 22);
      K.stick(k, 3, 5 - f, [
        '.k..k......',
        'kpkkpk.....',
        'kKKKKkkkk..',
        'ksssskKKkk.',
        'kaasaakkkkk',
        'kssssskkkkk',
        'kwwwwwkkkkk',
        'kwwwwwkkkkk',
        '.wwwwkkkkkk',
        '...Wtttttttt'.slice(0, 11),
      ], { k: P.ink2, K: P.ink3, s: SKIN, a: P.ink, w: P.p0, W: P.p0, t: P.ink3, p: P.pk2 });
      K.outer(k, P.ink);
      b.blit(k, 0, 0);
      // balls of yarn at the rim's two sides, clear of her, each with a wrap line
      const yb = K.B(16, 22);
      for (const [x, y, c] of [[0, 11, [P.bl1, P.bl2]], [12, 11, [P.pk1, P.pk2]]]) K.stick(yb, x, y, ['.aa.', 'abaa', 'aaba', '.bb.'], { a: c[0], b: c[1] });
      K.outer(yb, 'o6');
      b.blit(yb, 0, 0);
      // a small sleep "z", offset up and to the right
      K.stick(b, 13, f ? 0 : 1, ['zzz', '..z', '.z.', 'zzz'], { z: P.p0 });
      K.shadow(b, 8, 21, 7, 1);
      return b;
    },
  });

  K.stamp('notice_board', {
    w: 1, h: 1, rise: 8,
    paint: () => {
      const b = K.B(16, 24), r = R('red');
      // two posts, lit on the west, shaded on the east
      for (const x of [3, 11]) { b.fillRect(x, 15, 2, 8, P.o3); b.vline(x, 15, 8, P.o2); b.set(x + 1, 22, P.o4); }
      // the board: a 3-tone frame (lit top-left, dark bottom-right) round a cork panel
      b.fillRect(1, 3, 14, 12, P.o2); b.hline(1, 3, 14, P.o1); b.vline(1, 3, 12, P.o1); b.hline(1, 14, 14, P.o4); b.vline(14, 4, 11, P.o4);
      b.fillRect(2, 4, 12, 10, P.o1); b.hline(2, 4, 12, P.o3); b.vline(2, 4, 10, P.o3);                // cork, in the frame's shadow at top-left
      for (const [x, y] of [[6, 12], [12, 11], [10, 4], [4, 13]]) b.set(x, y, P.o2);
      // a small roof over it: a lit red cap with a darker underside
      b.fillRect(0, 0, 16, 3, r[2]); b.hline(0, 0, 16, r[1]); b.hline(0, 2, 16, r[4]);
      // pinned sheets of different sizes at slight angles, each with 1px text lines and a coloured pin
      K.stick(b, 3, 5, ['wwwww', 'wtttw', 'wwwww', 'wttww', 'wwwww', 'wtttw', 'wwwww'], { w: P.p0, t: P.p3 });
      b.set(5, 5, r[2]);
      K.stick(b, 9, 5, ['.yyy', 'yyyy', 'yttyy'.slice(0, 4), 'yyyy', 'yyy.'], { y: P.yl1, t: P.o3 });     // tilted: corners clipped on a slant
      b.set(9, 6, P.yl1); b.set(10, 5, P.bl2);
      K.stick(b, 8, 11, ['.ppppp', 'ptttpp'.slice(0, 6), 'ppppp.'], { p: P.pk1, t: P.pk3 });
      b.set(11, 11, P.bl2);
      out(b, [[[r[1], r[2], r[4]], r[5]], [[P.p0, P.p3, P.yl1, P.pk1, P.pk3], P.o6]]);
      K.shadow(b, 8, 23, 7, 1);
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
    corn: (b, x, y) => {   // a 2px stalk 10px tall, long drooping leaves in two greens that reach over the next row, an outlined cob, a tassel
      const bb = b; b = { set: (px, py, c) => { if (px >= 2 && px <= 29 && py >= 2 && py <= 29) bb.set(px, py, c); }, fillRect: (...a) => bb.fillRect(...a), vline: (...a) => bb.vline(...a) };
      b.fillRect(x, y - 10, 2, 11, P.f3); b.vline(x, y - 10, 11, P.f2);
      for (const [ly, dir] of [[8, -1], [5, 1], [2, -1], [1, 1]]) {
        const sx = dir < 0 ? x - 1 : x + 2;
        b.set(sx, y - ly, P.f1); b.set(sx + dir, y - ly, P.f1); b.set(sx + dir * 2, y - ly + 1, P.f2); b.set(sx + dir * 3, y - ly + 2, P.f3); b.set(sx + dir * 3, y - ly + 3, P.f3);
      }
      K.stick(bb, x + 2, y - 8, ['.kk.', 'kYyk', 'kyyk', 'kyyk', '.kk.'], { k: P.o5, Y: P.yl1, y: P.yl2 });
      b.set(x, y - 11, P.hy1); b.set(x + 1, y - 12, P.hy1); b.set(x - 1, y - 12, P.hy2);
    },
    potato: (b, x, y) => {   // a leafy mid-green mound, lit top-left, with tiny pale-purple flowers
      b.ellipse(x, y - 1, 2.5, 2, P.f2, true); b.hline(x - 2, y + 1, 5, P.f4); b.set(x + 2, y, P.f3); b.set(x + 1, y + 1, P.f3);
      b.set(x - 1, y - 2, P.f1); b.set(x - 2, y - 1, P.f1); b.set(x, y - 1, P.f3);
      b.set(x - 1, y - 3, P.pu1); b.set(x + 1, y - 2, P.pu1);
    },
    carrot: (b, x, y) => { b.fillRect(x - 1, y - 1, 3, 2, R('orange')[2]); b.hline(x - 1, y - 1, 2, R('orange')[1]); b.set(x - 1, y - 1, R('orange')[0]); for (const dx of [-2, 0, 2]) b.line(x, y - 2, x + dx, y - 6, P.f2); b.set(x, y - 6, P.f1); },
    cabbage: (b, x, y) => {   // dark outer leaves, lighter inner leaves, a pale core with a little swirl
      b.ellipse(x, y - 2, 3, 2.5, P.f3, true); b.hline(x - 2, y, 5, P.f4); b.set(x + 3, y - 1, P.f4);
      b.ellipse(x - 0.5, y - 2.5, 2, 1.5, P.f0, true);
      b.set(x - 1, y - 3, P.g0); b.set(x, y - 3, P.g0); b.set(x, y - 2, P.f1); b.set(x + 1, y - 2, P.f1); b.set(x - 1, y - 2, P.g0);
    },
    tomato: (b, x, y) => {   // a clear 1px tan stake rising above the plant, lobed leaves kept inside the plot, three 2px tomatoes
      b.vline(x, y - 15, 16, P.o1); b.set(x, y - 15, P.o0);
      for (const [lx, ly, rx, ry] of [[-1, -9, 2, 1.5], [1, -6, 2, 1.5], [-1, -3, 2.5, 1.5], [1, -1, 2, 1]]) {
        b.ellipse(x + lx, y + ly, rx, ry, P.f3, true); b.set(x + lx - 1, y + ly - 1, P.f1); b.set(x + lx + 1, y + ly + 1, P.f4);
      }
      b.vline(x, y - 15, 5, P.o1);
      for (const [dx, dy] of [[-3, -7], [1, -4], [-2, -2]]) { b.fillRect(x + dx, y + dy, 2, 2, P.red2); b.set(x + dx, y + dy, P.red0); b.set(x + dx + 1, y + dy + 1, P.red3); }
    },
    onion: (b, x, y) => { b.fillRect(x - 1, y - 2, 3, 3, P.p0); b.set(x + 1, y, P.p2); for (const dx of [-1, 0, 1]) b.vline(x + dx, y - 7 + Math.abs(dx), 5 - Math.abs(dx), dx ? P.f3 : P.f2); },
  };
  const cropOutline = [[K.TN.leaf, P.f6], [K.TN.leafLight, P.f5], [[P.f1, P.f2, P.f3, P.f4], P.f6], [[P.hy0, P.hy1, P.hy2, P.hy3, P.yl1, P.yl2, P.yl3], P.o5],
    [S.tones(R('orange')), R('orange')[5]], [[P.red0, P.red1, P.red2, P.red3], P.red4], [[P.p0, P.p2, P.pu1], P.f6], [[P.d2, P.d3, P.d4, P.d5], P.d5], [[P.g0], P.f6]];
  K.stamp('crop_plot', {
    // ground3d: a tilled field lies flat, so the 3D view bakes it into the ground (like a floor-layer stamp) instead of standing it
    // up as a card; it stays solid, and the flat view draws it as usual
    w: 2, h: 2, ground3d: true, variants: ['wheat', 'corn', 'potato', 'carrot', 'cabbage'],
    paint: (v) => {
      const b = K.B(32, 32);
      const rows = v === 'corn' ? [13, 21, 29] : v === 'wheat' ? [9, 16, 23, 30] : v === 'potato' ? [9, 18, 27] : [8, 14, 20, 26, 30];
      soil(b, 32, 32, rows);
      if (v === 'wheat') {
        // dense golden tufts in four clear rows: darker stems, a lighter head on each, a small gap between tufts
        for (const y of rows) for (let x = 2; x < 30; x++) {
          if (x % 5 === 1) continue;
          const tall = (x % 5 === 3) ? 1 : 0;
          b.vline(x, y - 2, 3, P.hy3);
          b.fillRect(x, y - 5 - tall, 1, 3, x % 2 ? P.hy1 : P.hy2); b.set(x, y - 5 - tall, P.hy0);
        }
      } else if (v === 'corn') {
        for (const y of rows) for (let x = 4; x < 25; x += 6) CROP.corn(b, x + (rows.indexOf(y) & 1) * 2, y);
      } else {
        const dx = v === 'potato' ? 7 : 6;
        for (const y of rows) {
          const off = v === 'potato' ? (rows.indexOf(y) & 1) * 3 : (y >> 2) & 1;
          for (let x = 5; x + off < 28; x += dx) CROP[v](b, x + off, y);                                  // every plant stays inside the plot's frame
        }
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
      for (let x = v === 'tomato' ? 7 : 5; x < 29; x += v === 'tomato' ? 9 : 4) CROP[v](b, x, ROW_RISE + 12);
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
      const b = K.B(16, 16);
      // galvanised grey: lit west side and a white glint, mid body, darker east side and base
      b.fillRect(2, 6, 8, 7, P.n2); b.vline(2, 6, 7, P.n1); b.vline(8, 6, 7, P.n3); b.vline(9, 6, 7, P.n4); b.hline(2, 12, 8, P.n4);
      b.vline(3, 7, 3, P.white);
      b.hline(2, 6, 8, P.n1); b.hline(3, 5, 6, P.n3);                                                  // the rolled top rim
      for (const y of [8, 11]) b.hline(3, y, 5, P.n3);                                                  // two ribs
      // the long spout ending in a wider rose
      b.line(10, 11, 12, 5, P.n2); b.line(10, 12, 13, 6, P.n3);
      K.stick(b, 12, 2, ['.ab', 'abc', 'bcc'], { a: P.n0, b: P.n1, c: P.n3 });
      out(b, [[[P.n0, P.n1, P.n2, P.n3, P.n4, P.white], P.n6]], 'n6');
      // the open handle loop over the top (after the outline so the gap stays open)
      for (const [x, y] of [[3, 4], [3, 3], [4, 2], [5, 2], [6, 2], [7, 3], [7, 4]]) b.set(x, y, P.n6);
      b.set(4, 3, P.n2); b.set(5, 3, 0); b.set(6, 3, P.n3);
      K.shadow(b, 7, 14, 6, 1);
      return b;
    },
  });

  // Poppy's scarecrow: straw hat, a burlap face, and a patched pink cardigan on a crossbar
  K.stamp('scarecrow', {
    w: 1, h: 1, rise: 12,
    paint: () => {
      const b = K.B(16, 28), pk = R('pink');
      b.vline(8, 11, 16, P.o3); b.vline(7, 11, 16, P.o2);                                              // post, right down to the ground
      b.fillRect(1, 11, 14, 2, P.o2);                                                                   // crossbar
      // the cardigan: lit left, a darker fold down the right, a stitched blue patch, buttons
      b.fillRect(4, 11, 8, 8, pk[2]); b.vline(4, 11, 8, pk[1]); b.vline(11, 11, 8, pk[3]); b.vline(9, 13, 5, pk[3]);
      b.fillRect(1, 11, 3, 4, pk[2]); b.hline(1, 11, 3, pk[1]); b.fillRect(12, 11, 3, 4, pk[3]);        // sleeves
      b.fillRect(5, 14, 3, 3, R('blue')[2]); b.set(7, 16, P.o5);            // a patch with a stitch
      for (const y of [13, 15, 17]) b.set(8, y, P.p0);                                                  // buttons
      // straw tufts out of both cuffs and the collar
      for (const [x, y, c] of [[0, 15, P.hy1], [1, 15, P.hy2], [2, 16, P.hy1], [13, 15, P.hy2], [14, 16, P.hy1], [15, 15, P.hy2], [4, 10, P.hy1], [11, 10, P.hy2], [3, 11, P.hy1]]) b.set(x, y, c);
      // a round burlap sack head: two tones, two button eyes, a stitched 1px mouth, tied at the neck
      K.stick(b, 4, 3, [
        '..aaab..',
        '.aaaaabb',
        'aakaakbb',
        'aaaaaabb',
        'asasasbb',
        '.aaaabb.',
        '..tttt..',
      ], { a: P.hy2, b: P.hy3, k: P.ink, s: P.o5, t: P.o5 });
      // a straw hat whose brim is wider than the head, with a pink band
      b.fillRect(1, 2, 14, 2, P.hy1); b.hline(1, 3, 14, P.hy2); b.fillRect(5, 0, 6, 2, P.hy2); b.hline(5, 0, 6, P.hy1); b.hline(5, 1, 6, pk[3]);
      out(b, [[S.tones(pk), pk[5]], [[P.hy1, P.hy2, P.hy3], P.o5], [[P.p0], P.o6]]);
      K.shadow(b, 8, 27, 5, 1, 120);
      return b;
    },
  });

  K.stamp('wheelbarrow', {
    w: 1, h: 1, variants: ['carrots'],
    paint: () => {
      const b = K.B(16, 16), o = R('orange');
      // two clear handle lines running back west to dark grips, two legs, then a 12x6 tray: a lit rim, a darker inner tray, its side face
      b.vline(5, 12, 3, P.o4); b.vline(9, 12, 2, P.o4);
      b.fillRect(3, 5, 12, 6, P.o3);                                                                   // the tray's inside, in shade
      b.hline(3, 5, 12, P.o0); b.vline(3, 5, 6, P.o1); b.vline(14, 5, 6, P.o2); b.hline(3, 6, 11, P.o4);   // lit rim, its far inner wall dark
      b.fillRect(3, 11, 11, 2, P.o2); b.hline(3, 12, 11, P.o4);                                       // the side face below the rim
      // carrots in the tray: 2px orange cones (shaded right) with green tops, clearly apart
      for (const [x, y] of [[4, 6], [7, 5], [10, 6]]) {
        b.set(x, y + 1, o[2]); b.set(x + 1, y + 1, o[2]); b.set(x, y + 2, o[2]); b.set(x + 1, y + 2, o[3]); b.set(x, y + 3, o[3]);
        b.set(x, y, P.f2); b.set(x + 1, y - 1, P.f3);
      }
      // the wheel at the front: dark grey rubber, a lighter hub
      K.stick(b, 11, 10, ['.rrr.', 'rrhrr', 'rhhhr', 'rrhrr', '.rrr.'], { r: P.n4, h: P.n2 });
      out(b);
      b.line(0, 4, 2, 6, P.o2); b.line(0, 11, 2, 9, P.o2); b.set(0, 4, P.o5); b.set(0, 11, P.o5);         // handles out west, dark grips
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
