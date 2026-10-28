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
  /** shade one part's flat silhouette with a 4-tone ramp lit from the top left: each row runs light (west) to deep (east), the lit half
   *  of a top edge catches the white highlight, bottom edges go a step darker */
  function shade(l, ramp) {
    const W = l.w, H = l.h, src = l.u32.slice(), op = (x, y) => x >= 0 && y >= 0 && x < W && y < H && src[y * W + x] >>> 24;
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      if (!op(x, y)) continue;
      let x0 = x, x1 = x;
      while (op(x0 - 1, y)) x0--;
      while (op(x1 + 1, y)) x1++;
      const t = (x - x0) / Math.max(1, x1 - x0);
      let c = t < 0.3 ? 1 : t < 0.65 ? 2 : t < 0.88 ? 3 : 4;
      if (!op(x, y - 1) && t < 0.45) c = 0;
      else if (!op(x, y + 1) && c < 4) c++;
      l.set(x, y, ramp[c]);
    }
    return l;
  }
  /** a part on its own layer: draw(l) paints a flat silhouette, which is shaded and outlined in the deep tone, so the parts read apart */
  function part(b, draw, ramp, after) { const l = K.B(64, 64); draw(l); shade(l, ramp || MB); if (after) after(l); K.outer(l, MB[4]); b.blit(l, 0, 0); return l; }
  const fillRows = (l, y0, y1, cx, hw) => { for (let y = y0; y <= y1; y++) { const h = hw(y); l.hline(Math.round(cx - h), y, Math.round(2 * h) + 1, MB[2]); } };
  /** a robed figure standing on the plinth (hem at y 47): narrow sloped shoulders, a girdled waist at y 33, the skirt flaring to the hem */
  const bodyHW = (y) => y <= 22 ? 1.5 : y === 23 ? 4 : y <= 26 ? 6 : y <= 33 ? 6 - (y - 26) * 2 / 7 : 4 + (y - 33) * 6 / 14;
  /** skirt folds (a crease with a lit edge), the girdle, the hem, and the lowered arm as a crease down her side with the hand at the hip */
  function robeDetail(l, cx, offs, armSide) {
    for (const o of offs) {
      const x0 = cx + Math.round(o * 0.45), x1 = cx + o;
      l.line(x0, 36, x1, 46, MB[3]);
      if (o < 2) l.line(x0 - 1, 37, x1 - 1, 46, MB[1]);
    }
    l.hline(cx - 4, 33, 9, MB[3]);
    for (let x = cx - 10; x <= cx + 10; x += 3) l.set(x, 47, MB[4]);
    const ax = cx + armSide * 4;
    l.line(ax, 25, ax + armSide, 33, MB[3]);
    l.fillRect(Math.min(ax + armSide, ax + armSide * 2), 34, 2, 2, armSide < 0 ? MB[1] : MB[3]);
  }
  function headPart(b, cx, cy) {
    part(b, (l) => { l.circle(cx, cy, 5, MB[2], true); l.fillRect(cx - 1, cy + 4, 3, 3, MB[2]); }, FACE, (l) => {
      l.hline(cx - 3, cy, 2, MB[3]); l.hline(cx + 1, cy, 2, MB[3]);                                  // closed eyes, serene
      l.set(cx, cy + 2, MB[2]); l.hline(cx - 1, cy + 4, 2, MB[2]);                                     // nose and chin shadow
    });
  }
  /** Astara (west): her hair up in a bun, the near arm raised to hold the Everspool's west end, the other at her side */
  function astara(b, ribbons) {
    const cx = 19;
    part(b, (l) => fillRows(l, 22, 47, cx, bodyHW), MB, (l) => {
      robeDetail(l, cx, [-7, -3, 2, 6], -1);
      if (ribbons) for (let i = 0; i <= 12; i++) {                                                   // a crimson sash over the shoulder to the hip, following the body
        const t = i / 12, x = Math.round(cx - 4 + 9 * t - 1.2 * Math.sin(Math.PI * t)), y = Math.round(24 + 9 * t);
        l.set(x, y, R('red')[2]); l.set(x, y + 1, R('red')[3]);
      }
    });
    headPart(b, cx, 16);
    part(b, (l) => {                                                                                    // hair: a cap swept to one side, a bun on top
      for (let y = 10; y <= 16; y++) for (let x = cx - 6; x <= cx + 6; x++) if ((x - cx) ** 2 + (y - 16) ** 2 <= 38 && (y < 13 || Math.abs(x - cx) >= 5 || (y === 13 && x > cx - 2))) l.set(x, y, MB[2]);
      l.circle(cx - 1, 8, 3, MB[2], true);
    }, HAIR, (l) => { l.line(cx - 2, 8, cx, 10, MB[4]); l.set(cx - 2, 6, MB[2]); });
  }
  /** Anwela (east): long hair falling past her shoulders, the near arm raised to the Everspool's east end */
  function anwela(b, ribbons) {
    const cx = 45;
    part(b, (l) => {                                                                                    // her long hair, falling behind her shoulders
      for (let y = 15; y <= 31; y++) { const w = y < 20 ? 6.5 : 6.5 + (y - 20) * 0.08; l.hline(Math.round(cx - w), y, Math.round(2 * w) + 1, MB[2]); }
      for (const x of [cx - 7, cx + 7]) l.set(x, 31, 0);
    }, HAIR, (l) => { for (const x of [cx - 5, cx + 5]) l.line(x, 21, x + (x < cx ? -1 : 1), 30, MB[4]); });
    part(b, (l) => fillRows(l, 22, 47, cx, bodyHW), MB, (l) => {
      robeDetail(l, cx, [-6, -2, 3, 7], 1);
      if (ribbons) {
        const x0 = cx - 4, x1 = cx + 4;
        for (let x = x0; x <= x1; x++) { const y = 32 + Math.round(1.3 * Math.sin(Math.PI * (x - x0) / (x1 - x0))); l.set(x, y, R('blue')[2]); l.set(x, y + 1, R('blue')[3]); }
        for (let y = 35; y <= 45; y++) { const x = Math.round(cx + bodyHW(y) - 2); l.set(x, y, R('blue')[2]); l.set(x - 1, y, R('blue')[1]); }   // a tail falling along her skirt's edge
      }
    });
    headPart(b, cx, 17);
    part(b, (l) => {                                                                                    // hair cap with a centre parting
      for (let y = 11; y <= 17; y++) for (let x = cx - 6; x <= cx + 6; x++) if ((x - cx) ** 2 + (y - 17) ** 2 <= 38 && (y < 14 || Math.abs(x - cx) >= 5)) l.set(x, y, MB[2]);
    }, HAIR, (l) => { l.vline(cx, 11, 3, MB[4]); });
  }
  /** the Everspool, held up between them: two flanges seen edge-on (the spool's ends) and a gold thread core between them */
  function everspool(b) {
    const l = K.B(64, 64);
    l.fillRect(30, 8, 5, 7, P.p1); l.vline(30, 8, 7, P.p0); l.vline(34, 8, 7, P.p3);                 // the wound thread (pale cream)
    for (let y = 9; y < 14; y += 2) l.hline(31, y, 3, P.p3);
    for (const x of [28, 36]) { l.ellipse(x, 11, 1.5, 5.5, P.gd2, true); l.vline(x - 1, 8, 6, P.gd1); l.vline(x + 1, 8, 6, P.gd3); l.set(x, 6, P.gd0); }   // gilded flanges
    K.outer(l, P.gd4); b.blit(l, 0, 0);
  }
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
    rope(24, 12, 30, 2); rope(34, 9, 55, 3);
    b.line(29, 37, 28, 39, P.hy3);
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
      for (const [x, y] of [[12, 52], [48, 51], [19, 53], [44, 53]]) b.set(x, y, g[3]);
      b.fillRect(25, 50, 14, 5, P.gd3); b.fillRect(26, 51, 12, 3, P.gd2); b.hline(26, 51, 12, P.gd1); b.hline(28, 52, 8, P.gd4);
      if (v === 'ribbons') {
        anwela(b, true); astara(b, true);
        everspool(b);
        // the raised arms, drawn last so their hands hold the spool's ends; a red ribbon spirals up Astara's sleeve
        part(b, (l) => { l.polygon([[21, 24], [24, 24], [26, 13], [24, 13]], MB[2]); l.fillRect(24, 10, 3, 4, MB[2]); }, MB, (l) => {
          for (const y of [21, 17]) { l.set(22, y, R('red')[2]); l.set(23, y - 1, R('red')[2]); l.set(24, y - 2, R('red')[3]); }
        });
        part(b, (l) => { l.polygon([[40, 24], [43, 24], [40, 13], [38, 13]], MB[2]); l.fillRect(38, 10, 3, 4, MB[2]); });
        bow(b, 24, 33, R('pink')); bow(b, 41, 13, R('yellow')); bow(b, 14, 45, R('yellow')); bow(b, 50, 45, R('pink'));
      } else {
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
      // a low, wide backless bench: two trestle legs (splayed, with a foot rail), then a seat of three planks with dark gaps
      for (const x of [2, 11]) { K.stick(b, x, 13, ['.ab.', '.ab.', 'a..b', 'a..b', 'cc.cc'.slice(0, 4)], { a: P.o3, b: P.o4, c: P.o5 }); }
      b.hline(4, 15, 8, P.o4);
      b.fillRect(0, 8, 16, 6, P.o2);
      for (const y of [8, 10, 12]) b.hline(0, y, 16, P.o1);
      for (const y of [9, 11]) b.hline(0, y, 16, P.o2);
      b.hline(0, 10, 16, P.o5); b.hline(0, 12, 16, P.o5);                                               // the gaps between the planks
      b.hline(0, 8, 16, P.o0); b.hline(0, 11, 16, P.o1); b.hline(0, 13, 16, P.o1);
      b.hline(0, 14, 16, P.o4);                                                                         // the front edge in shade
      for (const x of [1, 14]) for (const y of [9, 11, 13]) b.set(x, y, P.o4);                          // nail heads
      // Gran's little wicker picnic basket at one end
      K.stick(b, 9, 3, ['.kkkk.', 'k....k', 'wwwwww', 'wvwvwv', 'vvvvvv'], { k: P.o4, w: P.o1, v: P.o3 });
      out(b);
      K.shadow(b, 8, 19, 8, 1);
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
      const b = K.B(16, 20), o = R('orange'), rust = R('brown')[3];
      // a lumpy heap: three rounded mounds on a flat base, filled with little 2px leaves in red, orange and yellow
      const inHeap = (x, y) => ((x - 4) / 4) ** 2 + ((y - 13) / 4) ** 2 <= 1 || ((x - 8.5) / 5) ** 2 + ((y - 11) / 5) ** 2 <= 1 || ((x - 12.5) / 3.5) ** 2 + ((y - 13.5) / 3.5) ** 2 <= 1 || (y >= 14 && y <= 17 && x >= 1 && x <= 15);
      for (let y = 5; y <= 17; y++) for (let x = 0; x < 16; x++) if (inHeap(x, y)) b.set(x, y, o[3]);
      const LEAF = [P.red2, o[2], P.yl2];
      for (let y = 6; y <= 15; y++) for (let x = 1; x < 15; x++) {
        if (!inHeap(x, y) || !inHeap(x + 1, y + 1)) continue;
        const h = K.h32(x, y, 77);
        if (h % 3) continue;
        const c = LEAF[(h >> 4) % 3], lit = x + y < 15;
        b.set(x, y, lit && c === o[2] ? P.yl2 : c); b.set(x + 1, y + 1, c === P.yl2 ? o[2] : c === o[2] ? P.red2 : R('red')[3]);
      }
      b.hline(1, 16, 15, rust); b.hline(1, 17, 15, rust); b.hline(2, 15, 13, o[3]);                    // a darker base band
      for (const [x, c] of [[3, P.red2], [8, P.yl2], [12, o[2]]]) b.set(x, 16, c);
      out(b, [[[P.yl2, o[2], o[3], rust, P.red2, R('red')[3]], o[5]]], o[5]);
      // the rake leaning on it: a tan handle, a bar, and six 1px dark tines with gaps
      // the rake leaning on its side, head up: a tan handle down to the ground, a bar, and six 1px dark tines against the sky
      b.line(11, 4, 14, 17, P.o2); b.line(12, 4, 15, 16, P.o3);
      b.hline(6, 3, 10, P.o1); b.hline(6, 4, 10, P.o3);
      for (let x = 6; x < 16; x += 2) { b.set(x, 1, P.ink); b.set(x, 2, P.ink); }
      b.set(15, 2, P.ink);
      K.shadow(b, 8, 19, 8, 1, 80);
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
      // the thimble: straight, slightly tapered sides, a rounded dome cap, and a rolled rim band at the base
      const half = (y) => y < 11 ? Math.sqrt(Math.max(0, 1 - ((11 - y) / 6.5) ** 2)) * 7.5 : 7.5 + (y - 11) * 0.05;
      for (let y = 5; y < 30; y++) {
        const hw = half(y), x0 = Math.round(16 - hw), x1 = Math.round(16 + hw) - 1;
        for (let x = x0; x <= x1; x++) {
          const l = (x - x0) / Math.max(1, x1 - x0), top = y < 11 ? (11 - y) / 6 : 0;
          b.set(x, y, l < 0.16 + top * 0.25 && y > 5 ? g[0] : l < 0.4 ? g[1] : l < 0.68 ? g[2] : l < 0.86 ? g[3] : g[4]);
        }
      }
      // dimples in rows, crisp on the lit side and fading out into the shadow side
      for (let y = 8; y < 28; y += 3) for (let x = 10 + ((y / 3) & 1) * 2; x < 23; x += 3) {
        const hw = half(y), e = (x - 16) / hw;
        if (Math.abs(e) > 0.8 || e > 0.45) continue;
        if (y < 10 && Math.abs(e) > 0.4) continue;
        b.set(x, y, e > 0.15 ? g[3] : g[2]); if (e < 0 && y > 11) b.set(x, y + 1, g[1]);
      }
      // the rolled rim band: 2px, lighter gold, wider than the sides
      b.fillRect(7, 30, 18, 2, g[1]); b.hline(7, 30, 18, g[0]); b.fillRect(21, 30, 4, 2, g[2]); b.set(24, 30, g[3]); b.set(24, 31, g[3]);
      b.hline(7, 32, 18, g[3]);
      // a little spout on the crown, with thin light-blue streams arching off it and falling into the basin; the droplets move each frame
      b.fillRect(15, 3, 2, 2, P.n2); b.set(15, 3, P.n1);
      K.outer(b, S.omap([[g, P.gd5], [STONE, P.n5], [[P.w0, P.w1, P.w2, P.w3], P.w4]], 'n5'));
      // (after the outline, so they stay 1px) streams arching off the spout and falling clear of the sides; the droplets move each frame
      const streams = [[[14, 2], [12, 1], [10, 1], [8, 2], [6, 3], [5, 5]], [[17, 2], [19, 1], [21, 1], [23, 2], [25, 3], [26, 5]]];
      for (const st of streams) for (let i = 0; i < st.length; i++) b.set(st[i][0], st[i][1], (i + f) % 3 === 0 ? P.w0 : P.w2);
      for (let y = 6; y < 30; y++) { b.set(4 + (y > 18 ? 0 : 1) - (y > 26 ? 1 : 0), y, (y + f) % 4 === 0 ? P.w0 : P.w2); b.set(27 - (y > 18 ? 0 : 1) + (y > 26 ? 1 : 0), y, (y + f + 2) % 4 === 0 ? P.w0 : P.w2); }
      b.set(5 + f, 34, P.w0); b.set(26 - f, 34, P.w0); b.set(9 + f, 33, P.w1); b.set(23 - f, 33, P.w1);   // splashes in the basin
      return b;
    },
  });

  // The yarn basket, with a curled-up tuxedo Kittabra fast asleep on top (napping, 2 frames: the "z" bobs)
  K.stamp('yarn_basket', {
    w: 1, h: 1, rise: 6, variants: ['napping'], frames: 2, animSpeed: 40,
    paint: (v, f) => {
      const b = K.B(16, 22);
      // basket: weave, with a lighter rim band on top
      b.fillRect(2, 15, 12, 5, P.o2); b.hline(2, 19, 12, P.o3);
      for (let y = 17; y < 19; y++) for (let x = 2 + (y & 1); x < 14; x += 2) b.set(x, y, P.o3);
      b.hline(1, 15, 14, P.o1); b.hline(1, 16, 14, P.o2);
      // the Kittabra, a girl in a tuxedo-cat onesie, curled up asleep on the yarn: hood ears up, her face tucked down on her white
      // mittens, closed eyes as two little lines, the costume tail wrapped round the front. She breathes: up 1px on frame 1.
      const k = K.B(16, 22);
      K.stick(k, 2, 7 - f, [
        '.k...k.......',
        'kKk.kKk......',
        'kKKKKKkkkkk..',
        'kKsssssKKKkkk',
        'kKaasaaKkkkkk',
        'kwsssssw.kkkt',
        '.kkkkkkkkkkkt',
        'ttttttttttttt',
      ], { k: P.ink2, K: P.ink3, s: SKIN, a: P.ink, w: P.p0, t: P.ink2 });
      k.set(2, 14 - f, P.p0);                                                                           // the tail's white tip
      K.outer(k, P.ink);
      b.blit(k, 0, 0);
      // three round balls of yarn sitting at the rim in front of her, each with a wrap line
      const yb = K.B(16, 22);
      for (const [x, y, c] of [[0, 13, [P.bl1, P.bl2]], [11, 13, [P.pk1, P.pk2]], [6, 15, [P.yl1, P.yl2]]]) {
        K.stick(yb, x, y, ['.aa.', 'abaa', 'aaba', '.bb.'], { a: c[0], b: c[1] });
      }
      K.outer(yb, 'o6');
      b.blit(yb, 0, 0);
      // a small sleep "z": a 3x3 white glyph up and to the right, clear of her ear
      K.stick(b, 12, f ? 1 : 2, ['zzz', '.z.', 'z..', 'zzz'], { z: P.p0 });
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
    corn: (b, x, y) => {   // a tall 2px stalk, two long drooping leaves each side in two greens, one cob in its husk, a tassel
      b.fillRect(x, y - 13, 2, 14, P.f3); b.vline(x, y - 13, 14, P.f2);
      for (const [ly, dir] of [[10, -1], [6, 1], [3, -1]]) {
        const sx = dir < 0 ? x - 1 : x + 2;
        b.set(sx, y - ly, P.f1); b.set(sx + dir, y - ly + 0, P.f1); b.set(sx + dir * 2, y - ly + 1, P.f2); b.set(sx + dir * 3, y - ly + 2, P.f3);
        b.set(sx + dir, y - ly + 1, P.f3);
      }
      b.fillRect(x + 2, y - 9, 2, 4, P.yl2); b.set(x + 2, y - 9, P.yl1); b.set(x + 3, y - 6, P.yl3); b.set(x + 3, y - 9, P.f2);   // the cob
      b.set(x, y - 14, P.hy1); b.set(x + 1, y - 15, P.hy1); b.set(x - 1, y - 15, P.hy2);
    },
    potato: (b, x, y) => {   // low, spreading dark leaves with small white flowers
      b.ellipse(x, y - 1, 2.5, 1.5, P.f4, true); b.hline(x - 1, y - 2, 2, P.f3); b.set(x + 1, y - 1, P.f3); b.hline(x - 2, y, 5, P.f5);
      b.set(x - 1, y - 3, P.p0); b.set(x + 1, y - 3, P.p0); b.set(x + 2, y - 2, P.p0); b.set(x + 1, y - 2, P.yl2);
    },
    carrot: (b, x, y) => { b.fillRect(x - 1, y - 1, 3, 2, R('orange')[2]); b.hline(x - 1, y - 1, 2, R('orange')[1]); b.set(x - 1, y - 1, R('orange')[0]); for (const dx of [-2, 0, 2]) b.line(x, y - 2, x + dx, y - 6, P.f2); b.set(x, y - 6, P.f1); },
    cabbage: (b, x, y) => {   // dark outer leaves, lighter inner leaves, a pale core with a little swirl
      b.ellipse(x, y - 2, 3, 2.5, P.f3, true); b.hline(x - 2, y, 5, P.f4); b.set(x + 3, y - 1, P.f4);
      b.ellipse(x - 0.5, y - 2.5, 2, 1.5, P.f0, true);
      b.set(x - 1, y - 3, P.g0); b.set(x, y - 3, P.g0); b.set(x, y - 2, P.f1); b.set(x + 1, y - 2, P.f1); b.set(x - 1, y - 2, P.g0);
    },
    tomato: (b, x, y) => {   // a tan stake, lobed leaves up it, clusters of 2px red fruit with a highlight
      for (const [lx, ly, rx, ry] of [[-1, -11, 2, 1.5], [2, -8, 2, 1.5], [-2, -6, 2, 1.5], [1, -3, 2.5, 1.5], [-2, -1, 2, 1]]) {
        b.ellipse(x + lx, y + ly, rx, ry, P.f3, true); b.set(x + lx - 1, y + ly - 1, P.f1); b.set(x + lx + 1, y + ly + 1, P.f4);
      }
      b.vline(x, y - 13, 14, P.o1); b.set(x, y - 13, P.o0);
      for (const [dx, dy] of [[-3, -8], [-1, -7], [2, -5], [3, -4], [-3, -3]]) { b.fillRect(x + dx, y + dy, 2, 2, P.red2); b.set(x + dx, y + dy, P.red0); }
    },
    onion: (b, x, y) => { b.fillRect(x - 1, y - 2, 3, 3, P.p0); b.set(x + 1, y, P.p2); for (const dx of [-1, 0, 1]) b.vline(x + dx, y - 7 + Math.abs(dx), 5 - Math.abs(dx), dx ? P.f3 : P.f2); },
  };
  const cropOutline = [[K.TN.leaf, P.f6], [K.TN.leafLight, P.f5], [[P.f1, P.f2, P.f3, P.f4], P.f6], [[P.hy0, P.hy1, P.hy2, P.hy3, P.yl1, P.yl2, P.yl3], P.o5],
    [S.tones(R('orange')), R('orange')[5]], [[P.red0, P.red1, P.red2], P.red4], [[P.p0, P.p2], P.f6], [[P.d2, P.d3, P.d4, P.d5], P.d5], [[P.g0], P.f6]];
  K.stamp('crop_plot', {
    w: 2, h: 2, variants: ['wheat', 'corn', 'potato', 'carrot', 'cabbage'],
    paint: (v) => {
      const b = K.B(32, 32);
      const rows = v === 'corn' ? [16, 30] : v === 'wheat' ? [9, 16, 23, 30] : [8, 14, 20, 26, 30].slice(0, 5);
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
        for (const y of rows) for (let x = 7; x < 27; x += 8) CROP.corn(b, x + ((y >> 3) & 1) * 2, y);
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
      b.vline(8, 10, 17, P.o3); b.vline(7, 10, 17, P.o2);                                              // post, right down to the ground
      b.fillRect(1, 10, 14, 2, P.o2);                                                                   // crossbar
      b.fillRect(4, 10, 8, 9, pk[2]); b.vline(4, 10, 9, pk[1]); b.vline(11, 10, 9, pk[3]);              // cardigan
      b.fillRect(1, 10, 3, 4, pk[2]); b.hline(1, 10, 3, pk[1]); b.fillRect(12, 10, 3, 4, pk[3]);        // sleeves
      for (const [x, y, c] of [[0, 14, P.hy1], [1, 14, P.hy2], [2, 15, P.hy1], [13, 14, P.hy2], [14, 15, P.hy1], [15, 14, P.hy2]]) b.set(x, y, c);   // straw out of the cuffs
      b.fillRect(5, 13, 3, 3, R('blue')[2]);                                                            // a patch
      for (const y of [12, 14, 16]) b.set(8, y, P.p0);                                                  // buttons
      // the burlap sack head: two tones, button eyes, a stitched smile, tied at the neck with straw poking out
      K.stick(b, 4, 3, [
        '.aaaab..',
        'aaaaabbb',
        'aekaakbb'.replace('e', 'a'),
        'aaaaaabb',
        'asasasbb'.replace(/s/g, 's'),
        '.aaaabb.',
        'h.tttt.h',
      ], { a: P.hy2, b: P.hy3, k: P.ink, s: P.o5, t: P.o4, h: P.hy1 });
      b.set(5, 5, P.ink);
      b.fillRect(2, 2, 12, 2, P.hy1); b.hline(2, 3, 12, P.hy2); b.fillRect(5, 0, 6, 2, P.hy2); b.hline(5, 0, 6, P.hy1); b.hline(5, 2, 6, pk[3]);   // straw hat with a band
      out(b, [[S.tones(pk), pk[5]], [[P.hy1, P.hy2, P.hy3], P.o5], [[P.p0], P.o6]]);
      K.shadow(b, 8, 27, 4, 1);
      return b;
    },
  });

  K.stamp('wheelbarrow', {
    w: 1, h: 1, variants: ['carrots'],
    paint: () => {
      const b = K.B(16, 16), o = R('orange');
      // two handle rails running back (west) to dark grips, two legs, then the tray: its open top a lighter trapezoid, its side a darker band
      b.line(1, 6, 4, 8, P.o3); b.line(1, 9, 4, 10, P.o3);
      b.fillRect(0, 5, 2, 2, P.o5); b.fillRect(0, 8, 2, 2, P.o5);
      b.line(5, 12, 5, 14, P.o4); b.line(8, 12, 8, 14, P.o4);
      b.polygon([[3, 6], [14, 6], [12, 9], [4, 9]], P.o1);
      b.hline(3, 6, 12, P.o0);
      b.polygon([[4, 10], [12, 10], [11, 12], [5, 12]], P.o3); b.hline(4, 10, 9, P.o4); b.hline(5, 12, 7, P.o4);
      // carrots heaped in the tray: orange shoulders, a darker tip, leafy tops
      for (const [x, yy] of [[5, 3], [8, 2], [11, 3]]) {
        b.set(x, yy + 1, o[2]); b.set(x + 1, yy + 1, o[2]); b.set(x, yy + 2, o[2]); b.set(x + 1, yy + 2, o[3]); b.set(x, yy + 3, o[2]); b.set(x + 1, yy + 3, o[3]);
        b.set(x, yy, P.f2); b.set(x + 1, yy - 1, P.f3);
      }
      for (const x of [6, 9]) { b.set(x, 7, o[2]); b.set(x + 1, 7, o[3]); }
      // the wheel at the front: a round dark tyre, a light hub
      K.stick(b, 11, 10, ['.rrr.', 'rhnrr', 'rnwnr', 'rrnrr', '.rrr.'], { r: P.ink2, h: P.n2, n: P.n2, w: P.n0 });
      out(b, [[[P.f2, P.f3], P.ink], [[P.ink2, P.n0, P.n2], P.ink]]);
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
