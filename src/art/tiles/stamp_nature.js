/* src/art/tiles/stamp_nature.js — outdoor nature stamps: tree, tree_big, pine, bush, boulder, rock, stump, haystack, flowerbed.
 * Trees: the canopy rows are `over` (drawn above actors) and walkable underneath; only the trunk row is solid. */
(function (root) {
  'use strict';
  const NP = root.NP;
  const K = NP.art.tiles.kit;
  const S = K.S;
  const { P } = K;

  const LEAF = K.TN.leaf;       // f1..f5
  const BARK = K.TN.bark;       // b0..b4
  const LEAF_OUT = S.omap([[LEAF, P.f6], [BARK, P.b4], [[P.pk2, P.pk3, P.yl2, P.pk1], P.f6]], 'f6');

  function trunk(b, x, y, w, h) {
    K.cyl(b, x, y, w, h, [P.b0, P.b1, P.b2, P.b3, P.b4]);
    b.set(x + w - 1, y + h - 1, P.b4);
  }

  // ============================================================================================ tree (1x2)
  K.stamp('tree', {
    w: 1, h: 2, over: 1, solid: ['.', '#'],
    paint: () => {
      const b = K.B(16, 32);
      trunk(b, 6, 18, 4, 12);
      b.hline(5, 29, 6, P.b3); b.hline(5, 30, 6, P.b3); b.set(5, 30, P.b2);
      for (const [cx, cy, rx, ry] of [[8, 10, 6, 8], [4, 13, 3, 5], [12, 13, 3, 5], [8, 6, 4, 4]]) K.lobe(b, cx, cy, rx, ry, LEAF);
      K.outer(b, LEAF_OUT);
      K.shadow(b, 8, 30, 7, 2);
      return b;
    },
  });

  // ============================================================================================ tree_big (2x3)
  K.stamp('tree_big', {
    w: 2, h: 3, over: 2, solid: ['..', '..', '##'],
    paint: () => {
      const b = K.B(32, 48);
      trunk(b, 12, 30, 8, 16);
      b.fillRect(10, 44, 12, 3, P.b3); b.fillRect(11, 43, 10, 1, P.b2);
      b.vline(15, 33, 8, P.b3); b.vline(17, 36, 6, P.b4);
      for (const [cx, cy, rx, ry] of [[16, 13, 13, 12], [7, 21, 6, 7], [25, 21, 6, 7], [16, 23, 9, 7], [10, 9, 6, 6], [22, 8, 5, 5]]) K.lobe(b, cx, cy, rx, ry, LEAF);
      K.outer(b, LEAF_OUT);
      K.shadow(b, 16, 46, 14, 3);
      return b;
    },
  });

  // ============================================================================================ pine (1x2)
  K.stamp('pine', {
    w: 1, h: 2, over: 1, solid: ['.', '#'],
    paint: () => {
      const b = K.B(16, 32);
      const PT = K.TN.pine;     // f2 f3 f4 f5 f6
      trunk(b, 7, 25, 3, 5);
      const tier = (top, bot, hw) => {
        for (let y = top; y <= bot; y++) {
          const w = Math.max(0, Math.round((hw * (y - top)) / (bot - top)));
          const cut = (x) => (y >= bot - 1 && ((x + y) & 3) < 1) ? 1 : 0;   // ragged lower hem
          for (let x = 8 - w; x <= 7 + w; x++) {
            if (cut(x)) continue;
            const t = (x - (8 - w)) / Math.max(1, 2 * w);
            let c = t < 0.3 ? PT[1] : t < 0.62 ? PT[2] : PT[3];
            if (y >= bot - 1) c = t < 0.5 ? PT[3] : PT[4];
            else if (y === top) c = PT[0];
            b.set(x, y, c);
          }
        }
      };
      tier(14, 27, 7); tier(7, 19, 6); tier(1, 11, 4);
      for (let x = 2; x < 14; x += 4) b.set(x + 1, 22, PT[0]);
      K.outer(b, S.omap([[PT, P.f6], [BARK, P.b4]], 'f6'));
      K.shadow(b, 8, 30, 6, 2);
      return b;
    },
  });

  // ============================================================================================ bush (1x1)
  K.stamp('bush', {
    w: 1, h: 1,
    paint: () => {
      const b = K.B(16, 16);
      for (const [cx, cy, rx, ry] of [[5, 9, 4, 4], [11, 9, 4, 4], [8, 7, 5, 5]]) K.lobe(b, cx, cy, rx, ry, LEAF);
      for (const [x, y] of [[5, 8], [10, 6], [8, 10], [12, 10]]) { b.set(x, y, P.pk2); b.set(x, y + 1, P.pk3); }
      K.outer(b, LEAF_OUT);
      K.shadow(b, 8, 14, 7, 2);
      return b;
    },
  });

  // ============================================================================================ boulder / rock / stump
  const ROCK = K.TN.rock;
  const ROCK_OUT = S.omap([[ROCK, P.r6]], 'r6');
  K.stamp('boulder', {
    w: 1, h: 1,
    paint: () => {
      const b = K.B(16, 16);
      K.blob(b, 8, 8, 6, 5, ROCK);
      b.line(8, 5, 10, 8, P.r4); b.line(10, 8, 9, 11, P.r4); b.line(6, 9, 5, 11, P.r3);
      b.set(5, 6, P.r0); b.set(6, 6, P.r0);
      K.outer(b, ROCK_OUT);
      K.shadow(b, 8, 14, 7, 2);
      return b;
    },
  });
  K.stamp('rock', {
    w: 1, h: 1,
    paint: () => {
      const b = K.B(16, 16);
      K.blob(b, 5, 11, 3, 2, ROCK);
      K.blob(b, 10, 9, 4, 3, ROCK);
      b.set(9, 7, P.r0); b.set(10, 7, P.r0); b.set(10, 9, P.r4); b.set(11, 10, P.r4);
      K.outer(b, ROCK_OUT);
      K.shadow(b, 8, 14, 7, 2);
      return b;
    },
  });
  K.stamp('stump', {
    w: 1, h: 1,
    paint: () => {
      const b = K.B(16, 16);
      K.cyl(b, 3, 7, 10, 6, [P.b0, P.b1, P.b2, P.b3, P.b4]);
      b.fillRect(2, 12, 12, 2, P.b3); b.set(2, 13, P.b4); b.set(13, 13, P.b4);
      b.ellipse(8, 7, 5, 3, P.o1, true);
      b.ellipse(8, 7, 3, 2, P.o2, true);
      b.ellipse(8, 7, 1, 1, P.o3, true);
      b.hline(4, 7, 2, P.o0); b.set(6, 5, P.o0);
      K.outer(b, S.omap([[[P.b0, P.b1, P.b2, P.b3, P.b4, P.o0, P.o1, P.o2, P.o3], P.b4]], 'b4'));
      K.shadow(b, 8, 14, 7, 2);
      return b;
    },
  });

  // ============================================================================================ haystack (2x2)
  K.stamp('haystack', {
    w: 2, h: 2,
    paint: () => {
      const b = K.B(32, 32);
      K.blob(b, 16, 27, 13, 22, K.TN.hay, { skip: (x, y) => y > 28 });
      const r = K.rng('hay');
      for (let i = 0; i < 26; i++) {
        const x = 5 + r.int(22), y = 8 + r.int(20);
        if (K.opaque(b, x, y) && K.opaque(b, x + 2, y)) b.hline(x, y, 2, P.hy3);
      }
      // rope band with a little bow
      for (let x = 4; x < 28; x++) if (K.opaque(b, x, 19)) { b.set(x, 19, P.b2); b.set(x, 20, P.b3); }
      b.set(15, 18, P.b1); b.set(17, 18, P.b1); b.set(16, 19, P.b0);
      K.outer(b, S.omap([[K.TN.hay, P.b3], [[P.b0, P.b1, P.b2, P.b3], P.b4]], 'b4'));
      K.shadow(b, 16, 30, 13, 2);
      return b;
    },
  });

  // ============================================================================================ flowerbed (2x1, variants)
  const BEDS = {
    mixed: [P.pk2, P.yl2, P.red1, P.bl1],
    pink: [P.pk1, P.pk2, P.pk0, P.pk2],
    yellow: [P.yl1, P.yl2, P.yl1, P.l2],
    red: [P.red1, P.red2, P.red0, P.red2],
    blue: [P.bl1, P.bl2, P.pu1, P.bl0],
  };
  K.stamp('flowerbed', {
    w: 2, h: 1, solid: ['##'], variants: Object.keys(BEDS),
    paint: (variant) => {
      const b = K.B(32, 16);
      const pal = BEDS[variant];
      b.fillRect(2, 7, 28, 6, P.d5);                       // soil
      b.fillRect(2, 7, 28, 1, P.d4);
      b.fillRect(1, 10, 30, 4, P.c2);                      // stone front
      b.fillRect(1, 10, 30, 1, P.c1); b.fillRect(1, 13, 30, 1, P.c4);
      for (let x = 5; x < 30; x += 6) b.vline(x, 11, 2, P.c3);
      const heads = [[5, 4], [10, 3], [15, 5], [20, 3], [25, 4], [28, 6], [3, 6], [12, 6], [22, 6]];
      heads.forEach(([x, y], i) => {
        b.vline(x, y + 1, 7 - y + 1, P.f3);
        if (i % 2) b.set(x - 1, y + 3, P.f2); else b.set(x + 1, y + 3, P.f2);
        const c = pal[i % pal.length];
        b.set(x, y - 1, c); b.set(x - 1, y, c); b.set(x + 1, y, c); b.set(x, y + 1, c);
        b.set(x, y, P.yl1);
      });
      K.outer(b, S.omap([[[P.c1, P.c2, P.c3, P.c4], P.c5], [[P.d4, P.d5], P.d5]], 'f6'));
      K.shadow(b, 16, 14, 15, 2);
      return b;
    },
  });
})(typeof globalThis !== 'undefined' ? globalThis : window);
