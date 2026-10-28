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
  //  ribbons: bright bows tied on the spool and sleeves, two tails fluttering. wrapped: the figures under a white sheet folded into flat
  //  panels, tied with string, with a paper tag; only the plinth and plaque show.
  const SW = R('white'), SG = R('gray');
  /** a stone head facing south: hair cap on top, face below with two tiny eye dots, a neck */
  function head(b, cx, cy, st) {
    b.circle(cx, cy, 4, st[2], true);
    b.fillRect(cx - 3, cy, 7, 4, st[1]); b.set(cx - 3, cy + 3, 0); b.set(cx + 3, cy + 3, 0);
    b.hline(cx - 2, cy - 4, 4, st[1]); b.set(cx - 2, cy - 3, st[0]);
    b.set(cx - 1, cy + 1, st[4]); b.set(cx + 1, cy + 1, st[4]);
    b.fillRect(cx - 1, cy + 4, 3, 2, st[3]);
  }
  /** each figure is drawn on its own layer and outlined, so the two women and the spool read as separate shapes */
  function layer(fn) { const l = K.B(64, 64); fn(l, SW); K.outer(l, SW[4]); return l; }
  function astara(b, st) {
    b.polygon([[14, 16], [24, 16], [27, 44], [11, 44]], st[2]);
    b.polygon([[14, 16], [17, 16], [14, 44], [11, 44]], st[1]);
    b.polygon([[22, 16], [24, 16], [27, 44], [24, 44]], st[3]);
    for (const x of [16, 19, 22]) b.vline(x, 34, 9, st[3]);                                       // straight robe folds
    head(b, 19, 9, st);
    b.circle(19, 4, 2, st[2], true); b.set(18, 3, st[1]);                                          // bun
    b.polygon([[14, 17], [16, 16], [26, 31], [24, 33]], R('red')[2]);                              // crimson sash
    b.line(15, 17, 25, 31, R('red')[1]);
    b.fillRect(22, 19, 7, 5, st[2]); b.hline(22, 19, 7, st[1]); b.hline(22, 23, 7, st[3]);          // arm to the spool
    for (const x of [23, 25, 27]) b.vline(x, 20, 3, st[4]);                                        // thread lines on the sleeve
    for (const x of [15, 22]) b.fillRect(x, 44, 3, 1, st[3]);
  }
  function anwela(b, st) {
    b.polygon([[39, 18], [49, 17], [54, 44], [37, 44]], st[2]);
    b.polygon([[39, 18], [42, 18], [40, 44], [37, 44]], st[1]);
    b.polygon([[47, 17], [49, 17], [54, 44], [51, 44]], st[3]);
    b.line(46, 12, 50, 19, st[3]); b.line(47, 11, 51, 18, st[3]); b.line(46, 10, 49, 13, st[2]);      // long hair falling back
    head(b, 43, 11, st);
    for (const y of [26, 32, 38]) { b.line(38, y, 52, y - 1, R('blue')[2]); b.line(38, y + 1, 52, y, R('blue')[3]); }   // ribbons across her robe
    b.fillRect(35, 20, 7, 5, st[2]); b.hline(35, 20, 7, st[1]); b.hline(35, 24, 7, st[3]);          // arm to the spool
    for (const x of [43, 49]) b.fillRect(x, 44, 3, 1, st[3]);
  }
  function everspool(b, st) {
    b.fillRect(28, 18, 9, 11, P.gd2); b.vline(28, 18, 11, P.gd1); b.vline(36, 18, 11, P.gd3);
    for (let y = 20; y < 28; y += 2) b.hline(29, y, 7, P.gd1);
    b.ellipse(32, 17, 6, 2, st[1], true); b.hline(28, 16, 9, st[0]);
    b.ellipse(32, 29, 6, 2, st[3], true); b.hline(28, 29, 9, st[2]);
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
        b.line(34, 31, 30, 38, P.gd2); b.line(30, 38, 33, 43, P.gd2);                                // thread running down to the plinth
        b.blit(layer(everspool), 0, 0);
        bow(b, 32, 23, R('red'), true, 0); bow(b, 25, 20, R('yellow'), false, 0); bow(b, 39, 21, R('blue'), false, 0);
        bow(b, 19, 34, R('pink'), true, 1); bow(b, 46, 41, R('yellow'), false, 0);
      } else {
        // one boxy shape under a white sheet folded into flat panels with crisp creases, tied with string, with a paper tag
        const m = K.B(64, 64);
        m.fillRect(11, 16, 44, 29, 0xff000000); m.fillRect(14, 4, 10, 13, 0xff000000); m.fillRect(38, 6, 10, 11, 0xff000000);
        m.fillRect(25, 14, 14, 4, 0xff000000);
        for (let y = 0; y < 45; y++) for (let x = 0; x < 64; x++) {
          if (!(m.u32[y * 64 + x] >>> 24)) continue;
          const px = (x - 3) >> 3, py = ((y - 4) / 7) | 0, lx = (x - 3) & 7, ly = (y - 4) % 7;
          let c = (px + py) & 1 ? st[1] : st[2];
          if (lx === 7) c = st[3]; else if (lx === 0) c = st[0];
          if (ly === 6) c = st[3];
          b.set(x, y, c);
        }
        b.line(14, 16, 24, 44, st[3]); b.line(48, 16, 40, 44, st[3]);                               // long diagonal folds
        for (const y of [21, 35]) { b.hline(11, y, 44, P.hy3); b.hline(11, y + 1, 44, P.hy4); }    // string ties
        b.line(31, 23, 30, 27, P.hy3);                                                              // the tag's loop
        b.fillRect(27, 27, 7, 6, P.p0); b.hline(27, 27, 7, P.p1); b.hline(27, 32, 7, P.p3); b.set(28, 28, P.o3);
        b.hline(29, 29, 4, P.p3); b.hline(29, 31, 3, P.p3);
      }
      K.outer(b, S.omap([[S.tones(SW), SW[5]], [S.tones(SG), SG[5]], [T5('red'), R('red')[5]], [T5('blue'), R('blue')[5]], [T5('yellow'), R('yellow')[5]], [T5('pink'), R('pink')[5]],
        [[P.gd1, P.gd2, P.gd3, P.gd4], P.gd5], [[P.hy3, P.hy4], P.o6], [[P.p0, P.p1, P.p3], P.p6]], SW[5]));
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
      // parasol dome with alternating panels and a scalloped edge
      for (let y = 2; y < 9; y++) {
        const half = Math.round(Math.sqrt(Math.max(0, 1 - ((8 - y) / 7) ** 2)) * 7);
        for (let x = 8 - half; x <= 7 + half; x++) b.set(x, y, ((x - 1) >> 2) & 1 ? P.p0 : r[2]);
      }
      for (let x = 1; x < 15; x++) b.set(x, 9, x & 1 ? r[3] : 0);
      b.hline(5, 2, 6, r[1]); b.set(8, 1, P.o3);
      b.vline(8, 9, 13, P.n3);                                                                       // pole
      b.ellipse(8, 22, 6, 2, P.p0, true); b.hline(3, 23, 11, P.p2); b.hline(4, 21, 5, P.p0);          // table top
      b.fillRect(7, 24, 2, 4, P.n3);
      b.fillRect(5, 20, 2, 2, P.pk1); b.set(10, 21, P.o3);                                            // cup and a biscuit
      out(b, [[S.tones(r), r[5]], [[P.p0, P.p2], P.p5], [[P.n3], P.n5], [[P.pk1], P.p5]]);
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
      const at = (x) => Math.round(5 + (x - 4) * 0.16 + 3 * Math.sin(((x - 4) / 24) * Math.PI));   // the sagging, crooked string
      for (let x = 4; x < 28; x++) b.set(x, at(x), P.p2);
      const cols = [R('red'), R('yellow'), R('blue'), R('green'), R('pink')];
      for (let i = 0; i < 5; i++) {
        const x = 5 + i * 5, y = at(x + 1) + 1, c = cols[i], sway = ((f + i) & 3) === 1 ? 1 : ((f + i) & 3) === 3 ? -1 : 0;
        b.polygon([[x, y], [x + 3, y], [x + 1 + sway, y + 5]], c[2]);
        b.set(x, y, c[1]); b.set(x + 1, y, c[1]);
      }
      out(b, [[T5('red'), R('red')[5]], [T5('yellow'), R('yellow')[5]], [T5('blue'), R('blue')[5]], [T5('green'), R('green')[5]], [T5('pink'), R('pink')[5]], [[P.p2], P.p4]]);
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

  // Gran's little picnic bench, with her thermos and a mug
  K.stamp('picnic_bench', {
    w: 1, h: 1, rise: 4,
    paint: () => {
      const b = K.B(16, 20), g = R('green');
      b.fillRect(1, 11, 14, 3, P.o2); b.hline(1, 11, 14, P.o1); b.hline(1, 13, 14, P.o4);           // seat
      b.fillRect(1, 7, 14, 2, P.o3); b.hline(1, 7, 14, P.o2);                                        // backrest
      b.vline(2, 7, 11, P.o4); b.vline(13, 7, 11, P.o4);
      b.fillRect(3, 4, 3, 7, g[2]); b.vline(3, 4, 7, g[1]); b.hline(3, 4, 3, P.n2); b.set(4, 3, P.n1);  // thermos
      b.fillRect(9, 9, 3, 2, P.p0); b.set(12, 9, P.p0); b.set(10, 8, P.o3);                          // mug of cocoa
      out(b, [[S.tones(g), g[5]], [[P.n1, P.n2, P.p0], P.p5]]);
      K.shadow(b, 8, 19, 7, 1);
      return b;
    },
  });

  // The kid's kite (walk-over, over 2): flying in the top tile, tail bows waving, the string running down to the bottom of the stamp
  K.stamp('kite', {
    w: 1, h: 2, over: 2, solid: ['.', '.'], frames: 4, animSpeed: 10,
    paint: (v, f) => {
      const b = K.B(16, 32), r = R('red'), y = R('yellow');
      const dx = [0, 1, 0, -1][f], dy = [0, 0, 1, 0][f];
      b.polygon([[8 + dx, 1 + dy], [13 + dx, 6 + dy], [8 + dx, 13 + dy], [3 + dx, 6 + dy]], r[2]);
      b.polygon([[8 + dx, 1 + dy], [13 + dx, 6 + dy], [8 + dx, 6 + dy]], y[2]);
      b.polygon([[3 + dx, 6 + dy], [8 + dx, 13 + dy], [8 + dx, 6 + dy]], y[2]);
      b.vline(8 + dx, 1 + dy, 13, P.o3); b.hline(3 + dx, 6 + dy, 11, P.o3);
      // tail: three bows swinging the other way
      for (let i = 0; i < 3; i++) { const tx = 8 + dx + [1, -1, 1, -1][(f + i) & 3] * (i + 1), ty = 15 + dy + i * 3; b.set(tx, ty, P.bl1); b.set(tx - 1, ty, P.bl2); b.set(tx + 1, ty, P.bl2); }
      // string, a long gentle line down to the kid's hands
      for (let yy = 14 + dy; yy < 31; yy++) b.set(Math.round(8 + dx - (yy - 14) * 0.25), yy, P.p0);
      K.outer(b, S.omap([[S.tones(r), r[5]], [S.tones(y), y[5]], [[P.bl1, P.bl2], P.bl4], [[P.p0], P.p4]], 'o6'));
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
      b.fillRect(1, 17, 14, 3, P.n3); b.hline(1, 17, 14, P.n2); b.hline(2, 19, 12, P.n4);
      b.fillRect(7, 6, 2, 8, P.n2); b.set(7, 6, P.n1); b.fillRect(6, 5, 4, 2, P.n1);                // spout pillar
      // the splash: drops arching out on both sides, stepping with the frame
      const arc = [[8, 2], [6, 3], [10, 3], [5, 5], [11, 5], [4, 8], [12, 8], [4, 11], [12, 11]];
      for (let i = 0; i < arc.length; i++) if ((i + f) % 4 !== 0) b.set(arc[i][0], arc[i][1], i < 3 ? P.w0 : P.w1);
      b.set(5 + f, 15, P.w1); b.set(11 - (f & 1), 14, P.w1);                                         // ripples
      K.outer(b, S.omap([[STONE, P.n5], [[P.w0, P.w1], P.w4]], 'n5'));
      K.shadow(b, 8, 21, 7, 1);
      return b;
    },
  });

  // A heap of autumn leaves with a yardstick standing in it (the Starch Society has been measuring it)
  K.stamp('leaf_heap', {
    w: 1, h: 1, rise: 4,
    paint: () => {
      const b = K.B(16, 20), o = R('orange'), br = R('brown');
      const tones = [o[1], o[2], o[2], o[3], br[2], br[3], R('red')[2], R('yellow')[1]];
      // a dome of loose leaves: each pixel a leaf colour, lighter towards the top left
      for (let y = 9; y < 19; y++) for (let x = 1; x < 15; x++) {
        const dx = (x - 8) / 7, dy = (y - 18) / 9;
        if (dx * dx + dy * dy > 1) continue;
        const h = K.h32(x, y, 77) % 8, lit = dx + dy < -0.9;
        b.set(x, y, lit && h < 5 ? o[1] : tones[h]);
      }
      for (const [x, y] of [[2, 18], [14, 17], [0, 15]]) b.set(x, y, o[2]);                          // a few blown loose
      b.fillRect(11, 1, 2, 14, P.yl2); b.vline(11, 1, 14, P.yl1);                                     // the yardstick
      for (let y = 2; y < 14; y += 2) b.set(12, y, P.ink2);
      out(b, [[[o[1], o[2], o[3], br[2], br[3], R('red')[2], R('yellow')[1]], o[5]], [[P.yl1, P.yl2], P.o6]], o[5]);
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
      // thimble body (open mouth up, the domed end sunk in the basin)
      for (let y = 10; y < 36; y++) {
        const half = Math.round(11 - (y - 10) * 0.1 - (y > 30 ? (y - 30) * 1.1 : 0));
        for (let x = 16 - half; x < 16 + half; x++) {
          const l = (x - (16 - half)) / (2 * half);
          b.set(x, y, l < 0.15 ? g[0] : l < 0.35 ? g[1] : l < 0.7 ? g[2] : l < 0.88 ? g[3] : g[4]);
        }
      }
      for (let y = 15; y < 33; y += 3) for (let x = 7 + ((y / 3) & 1) * 2; x < 26; x += 4) if (b.u32[y * W + x] >>> 24) b.set(x, y, (x < 12 ? g[2] : g[4]));   // dimples
      b.fillRect(5, 10, 22, 3, g[1]); b.hline(5, 10, 22, g[0]); b.hline(5, 12, 22, g[3]);              // rim band
      b.ellipse(16, 10, 10, 3, P.w2, true); b.ellipse(16, 10, 10, 3, g[3], false); b.hline(10, 9, 12, P.w1);   // water at the brim
      // bubbling top and water running down the sides, stepping with the frame
      for (let i = 0; i < 3; i++) b.set(12 + i * 4 + (f & 1), 7 - ((f + i) % 2), P.w0);
      for (const sx of [6, 25]) for (let k = 0; k < 4; k++) { const yy = 13 + ((k * 5 + f * 2) % 18); b.set(sx, yy, P.w1); b.set(sx, yy + 1, P.w0); }
      b.set(5 + f * 2, 35, P.w1); b.set(26 - f * 2, 34, P.w1);                                        // ripples in the basin
      K.outer(b, S.omap([[g, P.gd5], [STONE, P.n5], [[P.w0, P.w1, P.w2, P.w3], P.w4]], 'n5'));
      return b;
    },
  });

  // The yarn basket, with a curled-up tuxedo Kittabra fast asleep on top (napping, 2 frames: the "z" bobs)
  K.stamp('yarn_basket', {
    w: 1, h: 1, rise: 6, variants: ['napping'], frames: 2, animSpeed: 40,
    paint: (v, f) => {
      const b = K.B(16, 22);
      // basket
      b.fillRect(2, 14, 12, 6, P.o2); b.hline(2, 14, 12, P.o1); b.hline(2, 19, 12, P.o4);
      for (let y = 15; y < 19; y++) for (let x = 2 + (y & 1); x < 14; x += 2) b.set(x, y, P.o3);
      // yarn balls, cream and pink
      b.circle(4, 13, 2, P.p0, true); b.set(3, 12, P.p1); b.circle(12, 13, 2, P.pk1, true); b.set(11, 12, P.pk2);
      // the sleeping Kittabra: black hood with cat ears and a bell, white face, closed eyes, black body curled round, white mitten paws, black tail
      b.fillRect(5, 9, 8, 5, P.ink2); b.hline(6, 8, 6, P.ink2);                                       // curled body
      b.fillRect(8, 11, 3, 2, P.p0);                                                                   // white bib
      b.fillRect(2, 7, 6, 5, P.ink2); b.set(2, 6, P.ink2); b.set(7, 6, P.ink2); b.set(3, 6, P.ink3);   // hood with ears
      b.fillRect(3, 9, 4, 3, SKIN); b.set(3, 10, P.ink2); b.set(6, 10, P.ink2); b.set(4, 10, P.ink2); b.set(5, 11, SKIN2); b.set(3, 11, P.pk1); b.set(6, 11, P.pk1);   // face, closed eyes, blush
      b.set(4, 8, P.p0); b.set(5, 8, P.p0);                                                            // white blaze on the hood
      b.set(4, 12, P.yl2);                                                                             // bell
      b.fillRect(9, 13, 2, 1, P.p0); b.fillRect(12, 12, 2, 1, P.p0);                                   // mitten paws
      b.line(13, 11, 14, 8, P.ink2); b.set(13, 7, P.ink2);                                             // tail
      // z
      const zy = f ? 1 : 2;
      b.hline(10, zy, 3, P.p0); b.set(11, zy + 1, P.p0); b.hline(10, zy + 2, 3, P.p0);
      out(b, [[[P.ink2, P.ink3], P.ink], [[P.p0, P.p1, P.pk1, P.pk2, SKIN, SKIN2], P.o6], [[P.yl2], P.o6]]);
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
  function soil(b, w, h) {
    b.fillRect(1, 1, w - 2, h - 2, P.d3);
    for (let y = 3; y < h - 2; y += 5) { b.hline(2, y, w - 4, P.d4); b.hline(2, y + 1, w - 4, P.d2); }
    b.hline(1, 1, w - 2, P.d2); b.hline(1, h - 2, w - 2, P.d4);
  }
  const CROP = {
    wheat: (b, x, y) => { for (let i = -2; i <= 2; i += 2) { b.vline(x + i, y - 5, 6, P.hy3); b.fillRect(x + i - 1, y - 8, 2, 4, P.hy1); b.set(x + i, y - 9, P.hy0); } },
    corn: (b, x, y) => { b.fillRect(x, y - 11, 2, 12, P.f3); b.vline(x, y - 11, 12, P.f2); b.line(x - 3, y - 4, x, y - 7, P.f2); b.line(x + 4, y - 5, x + 1, y - 8, P.f4); b.fillRect(x + 2, y - 7, 2, 3, P.yl2); b.set(x, y - 12, P.hy1); b.set(x + 1, y - 13, P.hy1); },
    potato: (b, x, y) => { K.lobe(b, x, y - 2, 3, 2, K.TN.leaf); b.set(x - 1, y - 4, P.p0); b.set(x + 1, y, P.o1); },
    carrot: (b, x, y) => { b.fillRect(x - 1, y - 1, 3, 2, R('orange')[2]); b.set(x - 1, y - 1, R('orange')[1]); for (const dx of [-2, 0, 2]) b.line(x, y - 2, x + dx, y - 6, P.f2); b.set(x, y - 6, P.f1); },
    cabbage: (b, x, y) => { K.lobe(b, x, y - 2, 3, 3, K.TN.leafLight); b.set(x, y - 2, P.f0); b.set(x - 1, y - 3, P.f0); b.set(x + 2, y - 1, P.f3); },
    tomato: (b, x, y) => { b.vline(x + 2, y - 12, 13, P.o3); K.lobe(b, x, y - 6, 3, 5, K.TN.leaf); for (const [dx, dy] of [[-1, -8], [1, -4], [-2, -3]]) { b.fillRect(x + dx, y + dy, 2, 2, P.red2); b.set(x + dx, y + dy, P.red1); } },
    onion: (b, x, y) => { b.fillRect(x - 1, y - 2, 3, 3, P.p0); b.set(x + 1, y, P.p2); for (const dx of [-1, 0, 1]) b.vline(x + dx, y - 7 + Math.abs(dx), 5 - Math.abs(dx), dx ? P.f3 : P.f2); },
  };
  const cropOutline = [[K.TN.leaf, P.f6], [K.TN.leafLight, P.f5], [[P.f1, P.f2, P.f3, P.f4], P.f6], [[P.hy0, P.hy1, P.hy3, P.yl2], P.o5],
    [S.tones(R('orange')), R('orange')[5]], [[P.red1, P.red2], P.red4], [[P.p0, P.p2], P.f6], [[P.d2, P.d3, P.d4], P.d5]];
  K.stamp('crop_plot', {
    w: 2, h: 2, variants: ['wheat', 'corn', 'potato', 'carrot', 'cabbage'],
    paint: (v) => {
      const b = K.B(32, 32);
      soil(b, 32, 32);
      const dx = v === 'corn' ? 8 : v === 'wheat' ? 7 : 6, rows = v === 'corn' ? [14, 28] : [8, 14, 20, 26, 30].slice(0, v === 'wheat' ? 4 : 5);
      for (const y of rows) for (let x = 5; x < 29; x += dx) CROP[v](b, x + ((y >> 2) & 1), y);
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
      b.fillRect(2, 3, 12, 4, P.hy1); b.hline(2, 3, 12, P.hy0);                                       // top
      b.fillRect(2, 7, 12, 9, P.hy2); b.hline(2, 15, 12, P.hy4); b.vline(13, 7, 9, P.hy3);           // front
      for (const [x, y] of [[4, 9], [8, 11], [11, 9], [5, 13], [10, 14], [6, 4], [10, 5]]) b.set(x, y, P.hy3);
      for (const x of [5, 10]) { b.vline(x, 3, 13, P.o4); }                                           // twine
      b.set(1, 9, P.hy1); b.set(14, 12, P.hy2);                                                       // stray straws
      out(b, [[[P.hy0, P.hy1, P.hy2, P.hy3, P.hy4], P.o5]]);
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
      b.polygon([[1, 6], [12, 6], [10, 12], [3, 12]], P.o2); b.hline(1, 6, 12, P.o1); b.hline(3, 11, 8, P.o4);   // tray
      b.fillRect(2, 6, 10, 1, P.o4);
      // carrots heaped up, lying every which way, with their green tops sticking out
      for (const [x, y, d] of [[2, 5, 1], [5, 4, -1], [8, 5, 1], [6, 6, 1], [10, 4, -1]]) {
        b.set(x, y, o[1]); b.set(x + 1, y, o[2]); b.set(x + 2, y + (d > 0 ? 1 : 0), o[3]);
        b.set(x - 1, y - 1, P.f2); b.set(x - 1, y - 2, P.f3); b.set(x, y - 2, P.f2);
      }
      b.circle(12, 12, 2, P.ink2, true); b.set(12, 12, P.n2);                                           // wheel
      b.line(3, 12, 2, 15, P.o3); b.line(9, 12, 9, 14, P.o3);                                           // legs
      b.line(1, 7, 0, 9, P.o3);                                                                         // handle
      out(b, [[S.tones(o), o[5]], [[P.f2, P.f3], P.f6], [[P.ink2, P.n2], P.ink]]);
      K.shadow(b, 7, 14, 6, 1);
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
