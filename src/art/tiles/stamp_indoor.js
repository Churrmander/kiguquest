/* src/art/tiles/stamp_indoor.js — indoor furniture & wall decor stamps (every id in BIBLE §5 "Indoor" except the P2 ones).
 * Wall decor (window, clock, poster) is drawn on a transparent tile so the wall terrain shows through. Tall pieces are 1x2 / 2x2
 * and stand flush against the wall rows. */
(function (root) {
  'use strict';
  const NP = root.NP;
  const K = NP.art.tiles.kit;
  const S = K.S;
  const { P } = K;

  const WOOD = [P.o0, P.o1, P.o2, P.o3, P.o4, P.o5];
  const WOOD_OUT = S.omap([[WOOD, P.o6]], 'o6');
  const INK_OUT = S.omap([], 'ink');
  const LEAF = K.TN.leaf;
  const BOOK_COLORS = ['red', 'blue', 'green', 'yellow', 'pink', 'lilac', 'orange', 'teal'];
  const HEART = ['.xx.xx.', 'xxxxxxx', 'xxxxxxx', '.xxxxx.', '..xxx..', '...x...'];

  /** carve rounded corners of a rect (sets the 4 corner pixels transparent) */
  const round = (b, x, y, w, h) => { b.set(x, y, 0); b.set(x + w - 1, y, 0); b.set(x, y + h - 1, 0); b.set(x + w - 1, y + h - 1, 0); };
  /** wooden shelving frame with back panel, returns the interior rows [y0..] for each shelf */
  function shelfFrame(b, w, h, back, boards) {
    b.fillRect(1, 1, w - 2, h - 1, back);
    b.fillRect(1, 1, 2, h - 1, P.o3); b.fillRect(1, 1, 1, h - 1, P.o2);
    b.fillRect(w - 3, 1, 2, h - 1, P.o4);
    b.fillRect(1, 1, w - 2, 2, P.o3); b.fillRect(1, 1, w - 2, 1, P.o1);
    for (const y of boards) { b.fillRect(1, y, w - 2, 2, P.o2); b.fillRect(1, y, w - 2, 1, P.o1); b.fillRect(1, y + 1, w - 2, 1, P.o4); }
  }

  // ============================================================================================ walls decor
  K.stamp('window', {
    w: 1, h: 1,
    paint: () => {
      const b = K.B(16, 16);
      S.window(b, 4, 3, 8, 7, { curtain: K.ramp('pink') });
      K.outer(b, S.omap([], 'o6'));
      return b;
    },
  });

  K.stamp('clock', {
    w: 1, h: 1,
    paint: () => {
      const b = K.B(16, 16);
      b.circle(8, 8, 6, P.o3, true);
      b.circle(8, 8, 5, P.p0, true);
      b.set(7, 4, P.o4); b.set(8, 4, P.o4); b.set(11, 8, P.o4); b.set(5, 8, P.o4); b.set(7, 12, P.o4); b.set(8, 12, P.o4);
      b.vline(8, 5, 4, P.ink2); b.hline(8, 8, 3, P.ink2);
      b.set(8, 8, P.red2);
      b.set(4, 5, P.o1); b.set(5, 4, P.o1);
      b.fillRect(7, 14, 2, 1, P.gd2);
      K.outer(b, S.omap([], 'o6'));
      return b;
    },
  });

  K.stamp('poster', {
    w: 1, h: 1,
    paint: () => {
      const b = K.B(16, 16);
      b.fillRect(3, 2, 10, 12, P.p1);
      b.fillRect(3, 2, 10, 1, P.p0); b.fillRect(3, 13, 10, 1, P.p3);
      b.fillRect(4, 3, 8, 10, P.bl1);
      b.fillRect(4, 3, 8, 2, P.bl0);
      b.circle(8, 9, 3, P.pk0, true);
      b.fillRect(5, 5, 2, 3, P.yl2); b.fillRect(10, 5, 2, 3, P.yl2); b.set(5, 5, 0); b.set(11, 5, 0);   // animal-hood ears
      b.set(7, 9, P.ink2); b.set(9, 9, P.ink2); b.set(6, 10, P.pk2); b.set(10, 10, P.pk2);
      b.set(3, 2, P.red2); b.set(12, 2, P.red2);
      K.outer(b, S.omap([], 'o6'));
      return b;
    },
  });

  // ============================================================================================ shelves
  K.stamp('bookshelf', {
    w: 2, h: 2,
    paint: () => {
      const b = K.B(32, 32);
      shelfFrame(b, 32, 32, P.o5, [11, 21, 30]);
      const rows = [3, 13, 23];
      rows.forEach((y0, si) => {
        let x = 4;
        let i = 0;
        const end = 27 - (si === 0 ? 5 : 0);
        while (x < end) {
          const hsh = K.h32(si, i++, 21);
          if (hsh % 9 === 0) { x += 1; continue; }
          const w = 2 + (hsh % 2), h = 5 + ((hsh >> 3) % 3), r = K.ramp(BOOK_COLORS[(hsh >> 5) % BOOK_COLORS.length]);
          const lean = hsh % 11 === 0;
          b.fillRect(x, y0 + 7 - h, w, h, r[2]);
          b.fillRect(x, y0 + 7 - h, 1, h, r[1]);
          b.fillRect(x + w - 1, y0 + 7 - h, 1, h, r[3]);
          b.hline(x, y0 + 9 - h, w, P.p1);
          b.hline(x, y0 + 5, w, r[4]);
          if (lean) b.set(x + w, y0 + 7 - h, r[3]);
          x += w;
        }
      });
      // a little potted plant at the end of the top shelf
      b.fillRect(24, 8, 4, 2, P.br2); b.fillRect(24, 8, 1, 2, P.br1);
      K.lobe(b, 26, 6, 2, 2, LEAF);
      K.outer(b, S.omap([[WOOD, P.o6]], 'o6'));
      return b;
    },
  });

  K.stamp('cloth_shelf', {
    w: 2, h: 2,
    paint: () => {
      const b = K.B(32, 32);
      shelfFrame(b, 32, 32, P.p4, [11, 21, 30]);
      const names = ['red', 'pink', 'sky', 'yellow', 'mint', 'lilac', 'orange', 'blue', 'green'];
      for (let row = 0; row < 3; row++) for (let k = 0; k < 3; k++) {
        const i = row * 3 + k, r = K.ramp(names[i]);
        const x = 4 + k * 9, y = 3 + row * 10 + (row === 2 ? 0 : 0);
        const h = row === 2 ? 7 : 8;
        b.fillRect(x, y + (8 - h), 8, h, r[2]);
        b.fillRect(x, y + (8 - h), 8, 2, r[1]);
        b.fillRect(x, y + 6, 8, 2, r[3]);
        b.fillRect(x, y + 7, 8, 1, r[4]);
        // the bolt's coiled end + a pattern band
        b.fillRect(x, y + (8 - h), 2, h, P.p1); b.fillRect(x + 1, y + (8 - h), 1, h, P.p2);
        if (i % 3 === 0) for (let sx = x + 3; sx < x + 8; sx += 2) b.vline(sx, y + 8 - h + 2, h - 3, r[3]);
        else if (i % 3 === 1) for (let sx = x + 3; sx < x + 8; sx += 2) b.set(sx, y + 3 + (sx & 1), P.p0);
      }
      K.outer(b, S.omap([[WOOD, P.o6]], 'o6'));
      return b;
    },
  });

  K.stamp('shop_shelf', {
    w: 1, h: 2,
    paint: () => {
      const b = K.B(16, 32);
      shelfFrame(b, 16, 32, P.o5, [10, 20, 30]);
      const jars = ['pink', 'yellow', 'mint'], boxes = ['blue', 'red', 'orange'], tins = ['lilac', 'teal', 'green'];
      for (let k = 0; k < 3; k++) {
        const x = 3 + k * 4;
        let r = K.ramp(jars[k]);
        b.fillRect(x, 4, 3, 5, r[2]); b.fillRect(x, 4, 1, 5, r[1]); b.fillRect(x + 2, 4, 1, 5, r[3]); b.fillRect(x, 3, 3, 1, P.p1);
        r = K.ramp(boxes[k]);
        b.fillRect(x, 14, 3, 5, r[2]); b.fillRect(x, 14, 3, 1, r[1]); b.fillRect(x + 2, 14, 1, 5, r[3]); b.set(x + 1, 16, P.p0);
        r = K.ramp(tins[k]);
        b.fillRect(x, 24, 3, 5, r[2]); b.fillRect(x, 24, 1, 5, r[1]); b.hline(x, 26, 3, P.p0); b.fillRect(x + 2, 24, 1, 5, r[3]);
      }
      K.outer(b, S.omap([[WOOD, P.o6]], 'o6'));
      return b;
    },
  });

  // ============================================================================================ tables, chairs
  function cloth(b, x, y, w, h, flapY, c1, c2, c3) {
    S.gingham(b, x, y, w, h, c1, c2, c3, 2);
    // hanging front flap with scalloped hem
    for (let xx = 0; xx < w; xx++) {
      const hem = flapY + 2 + (((xx & 3) === 1 || (xx & 3) === 2) ? 1 : 0);
      for (let yy = flapY; yy < hem; yy++) b.set(x + xx, yy, yy === flapY ? c3 : ((((xx >> 1) + yy) & 1) ? c2 : c1));
      b.set(x + xx, hem - 1, c3);
    }
  }
  const teacup = (b, x, y) => {
    b.fillRect(x, y + 1, 4, 3, P.p0); b.hline(x, y + 3, 4, P.p3); b.fillRect(x, y, 4, 1, P.pk2);
    b.set(x + 4, y + 1, P.p2); b.set(x + 4, y + 2, P.p2);
  };

  K.stamp('table_s', {
    w: 2, h: 1, solid: ['##'],
    paint: () => {
      const b = K.B(32, 16);
      for (const x of [2, 28]) b.fillRect(x, 12, 2, 3, P.o4);
      b.fillRect(1, 3, 30, 8, P.o2);                      // table top
      b.fillRect(1, 3, 30, 1, P.o0); b.fillRect(1, 3, 1, 8, P.o1);
      b.fillRect(1, 11, 30, 2, P.o3); b.fillRect(1, 12, 30, 1, P.o4);
      cloth(b, 6, 3, 20, 8, 11, P.p1, P.red0, P.red1);
      teacup(b, 14, 4);
      K.outer(b, WOOD_OUT);
      K.shadow(b, 16, 15, 14, 1);
      return b;
    },
  });

  K.stamp('table_l', {
    w: 3, h: 2, solid: ['###', '###'],
    paint: () => {
      const b = K.B(48, 32);
      for (const x of [2, 44]) { b.fillRect(x, 25, 3, 5, P.o4); b.fillRect(x, 25, 1, 5, P.o3); }
      b.fillRect(1, 3, 46, 21, P.o2);
      b.fillRect(1, 3, 46, 1, P.o0); b.fillRect(1, 3, 1, 21, P.o1);
      b.fillRect(1, 24, 46, 3, P.o3); b.fillRect(1, 26, 46, 1, P.o4);
      cloth(b, 5, 3, 38, 21, 24, P.p0, P.pk1, P.pk2);
      // teapot, cups and a little vase of flowers
      K.blob(b, 17, 12, 5, 4, K.tn5('pink'));
      b.fillRect(14, 7, 6, 1, P.pk3); b.set(16, 6, P.p0); b.set(17, 6, P.p0);
      b.line(22, 10, 25, 8, P.pk2); b.set(25, 7, P.pk3);
      b.set(11, 11, P.pk3); b.set(11, 12, P.pk3); b.set(12, 13, P.pk3);
      teacup(b, 26, 14); teacup(b, 8, 15);
      b.fillRect(35, 11, 4, 5, P.bl1); b.fillRect(35, 11, 1, 5, P.bl0); b.fillRect(38, 11, 1, 5, P.bl2);
      b.vline(36, 6, 5, P.f3); b.vline(37, 7, 4, P.f3);
      for (const [x, y, c] of [[36, 5, P.red1], [34, 7, P.yl2], [38, 6, P.pk2]]) { b.set(x, y, c); b.set(x - 1, y, c); b.set(x, y - 1, c); b.set(x + 1, y, c); }
      b.set(36, 5, P.yl1);
      K.outer(b, S.omap([[WOOD, P.o6], [[P.red1, P.yl2, P.yl1, P.pk2, P.f3], P.f6]], 'o6'));
      K.shadow(b, 24, 30, 22, 1);
      return b;
    },
  });

  const CUSHION = K.ramp('red');
  function chairSprite(dir) {
    const b = K.B(16, 16);
    const c = CUSHION;
    if (dir === 'down') {
      b.fillRect(4, 1, 8, 7, P.o3); b.fillRect(4, 1, 8, 1, P.o1); b.fillRect(4, 1, 1, 7, P.o2);
      b.fillRect(6, 3, 1, 5, P.o4); b.fillRect(9, 3, 1, 5, P.o4);
      b.fillRect(3, 8, 10, 4, c[2]); b.fillRect(3, 8, 10, 1, c[1]); b.fillRect(3, 11, 10, 1, c[3]);
      b.fillRect(3, 12, 10, 1, P.o3);
      for (const x of [3, 11]) b.fillRect(x, 13, 2, 2, P.o4);
    } else if (dir === 'up') {
      b.fillRect(4, 1, 8, 3, c[2]); b.fillRect(4, 1, 8, 1, c[1]);
      b.fillRect(3, 4, 10, 8, P.o2); b.fillRect(3, 4, 10, 1, P.o1); b.fillRect(3, 4, 1, 8, P.o1);
      b.vline(6, 5, 6, P.o3); b.vline(9, 5, 6, P.o3);
      b.fillRect(3, 11, 10, 1, P.o4);
      for (const x of [3, 11]) b.fillRect(x, 12, 2, 3, P.o4);
    } else {
      // facing left: backrest on the right
      b.fillRect(10, 1, 3, 11, P.o3); b.fillRect(10, 1, 1, 11, P.o2); b.fillRect(12, 1, 1, 11, P.o4);
      b.fillRect(3, 8, 8, 4, c[2]); b.fillRect(3, 8, 8, 1, c[1]); b.fillRect(3, 11, 8, 1, c[3]);
      b.fillRect(3, 12, 10, 1, P.o3);
      for (const x of [3, 11]) b.fillRect(x, 13, 2, 2, P.o4);
    }
    K.outer(b, S.omap([[WOOD, P.o6], [S.tones(c), c[5]]], 'o6'));
    K.shadow(b, 8, 15, 6, 1);
    return dir === 'right' ? b.flippedX() : b;
  }
  const CHAIRS = {};
  K.stamp('chair', {
    w: 1, h: 1, variants: ['up', 'down', 'left', 'right'],
    paint: (v) => {
      if (!CHAIRS[v]) CHAIRS[v] = chairSprite(v === 'right' ? 'left' : v);
      return v === 'right' ? CHAIRS[v].flippedX() : CHAIRS[v].clone();
    },
  });

  // ============================================================================================ bed, tv, plant, sewing machine
  K.stamp('bed', {
    w: 1, h: 2,
    paint: () => {
      const b = K.B(16, 32);
      b.fillRect(1, 1, 14, 8, P.o3); b.fillRect(1, 1, 14, 2, P.o2); b.fillRect(1, 1, 14, 1, P.o1);
      round(b, 1, 1, 14, 8);
      b.fillRect(1, 9, 2, 21, P.o3); b.fillRect(13, 9, 2, 21, P.o4);
      b.fillRect(3, 9, 10, 20, P.p1);
      b.fillRect(3, 5, 10, 6, P.p0); b.fillRect(3, 9, 10, 2, P.p1); b.hline(4, 10, 8, P.p2);       // pillow
      round(b, 3, 5, 10, 6);
      // patchwork quilt
      const cols = [[P.pk2, P.pk1], [P.yl2, P.yl1], [P.bl2, P.bl1], [P.f3, P.f1]];
      for (let cy = 0; cy < 4; cy++) for (let cx = 0; cx < 3; cx++) {
        const c = cols[(cx + cy * 2) % cols.length];
        const x = 3 + cx * 3 + (cx ? 1 : 0), w = cx === 1 ? 4 : 3, y = 13 + cy * 4;
        b.fillRect(x, y, w, 4, c[0]); b.fillRect(x, y, w, 1, c[1]);
      }
      b.fillRect(3, 12, 10, 1, P.p0); b.fillRect(3, 29, 10, 1, P.red3);
      b.fillRect(1, 28, 14, 4, P.o3); b.fillRect(1, 28, 14, 1, P.o1); b.fillRect(1, 31, 14, 1, P.o5);
      K.outer(b, WOOD_OUT);
      return b;
    },
  });

  K.stamp('tv', {
    w: 1, h: 1,
    paint: () => {
      const b = K.B(16, 16);
      b.line(8, 3, 5, 0, P.n3); b.line(8, 3, 11, 1, P.n3);
      b.fillRect(2, 3, 12, 10, P.n4);
      b.fillRect(2, 3, 12, 1, P.n2); b.fillRect(2, 3, 1, 10, P.n2);
      b.fillRect(3, 4, 7, 7, P.gl5);
      b.set(4, 5, P.gl3); b.set(5, 5, P.gl3); b.set(4, 6, P.gl3);
      b.blit(K.spr(['.x.x.', 'xxxxx', '.xxx.', '..x..'], { x: P.pk2 }), 4, 6);
      b.set(11, 5, P.n1); b.set(12, 5, P.n1); b.set(11, 8, P.red1); b.set(12, 8, P.red1);
      b.fillRect(2, 12, 12, 1, P.n5);
      for (const x of [3, 11]) b.fillRect(x, 13, 2, 2, P.n5);
      K.outer(b, INK_OUT);
      K.shadow(b, 8, 15, 6, 1);
      return b;
    },
  });

  K.stamp('plant', {
    w: 1, h: 1,
    paint: () => {
      const b = K.B(16, 16);
      for (const [cx, cy, rx, ry] of [[8, 4, 3, 3], [4, 7, 3, 3], [12, 7, 3, 3], [8, 7, 3, 3]]) K.lobe(b, cx, cy, rx, ry, LEAF);
      b.fillRect(4, 10, 8, 2, P.br2); b.fillRect(4, 10, 8, 1, P.br1); b.fillRect(10, 10, 2, 2, P.br3);
      b.fillRect(5, 12, 6, 3, P.br2); b.fillRect(5, 12, 1, 3, P.br1); b.fillRect(9, 12, 2, 3, P.br3);
      b.fillRect(5, 14, 6, 1, P.br4);
      K.outer(b, S.omap([[LEAF, P.f6], [K.tn('br0', 'br1', 'br2', 'br3', 'br4'), P.br5]], 'br5'));
      return b;
    },
  });

  K.stamp('sewing_machine', {
    w: 1, h: 1,
    paint: () => {
      const b = K.B(16, 16);
      const t = K.ramp('teal');
      b.fillRect(1, 10, 14, 2, P.o1); b.fillRect(1, 10, 14, 1, P.o0);
      b.fillRect(2, 12, 12, 2, P.o3); for (const x of [2, 12]) b.fillRect(x, 14, 2, 1, P.o4);
      b.fillRect(3, 8, 11, 2, t[3]);                       // bed plate
      b.fillRect(3, 3, 10, 3, t[2]); b.fillRect(3, 3, 10, 1, t[1]);   // overarm
      b.fillRect(10, 3, 3, 7, t[2]); b.fillRect(10, 3, 1, 7, t[1]); b.fillRect(12, 3, 1, 7, t[3]);
      b.fillRect(4, 6, 2, 3, P.n3); b.set(4, 9, P.n3);     // needle bar + needle
      b.fillRect(6, 0, 3, 3, P.red2); b.hline(6, 0, 3, P.p0); b.hline(6, 2, 3, P.p0);   // thread spool
      b.fillRect(2, 9, 5, 1, P.pk2);                       // cloth under the needle
      b.circle(14, 6, 1, P.n3, true);
      K.outer(b, S.omap([[S.tones(t), t[5]], [WOOD, P.o6], [[P.red2, P.p0, P.n3, P.pk2], P.ink]], 'o6'));
      K.shadow(b, 8, 15, 7, 1);
      return b;
    },
  });

  // ============================================================================================ rugs (floor layer)
  K.stamp('rug_a', {
    w: 3, h: 2, layer: 'floor', solid: ['...', '...'],
    paint: () => {
      const b = K.B(48, 32);
      const r = K.ramp('red');
      b.fillRect(1, 1, 46, 30, r[5]);
      b.fillRect(2, 2, 44, 28, r[2]);
      b.strokeRect(3, 3, 42, 26, P.yl2);
      b.fillRect(4, 4, 40, 24, r[3]);
      const cols = [P.bl1, P.p1, P.pk1, P.yl1];
      for (let cy = 0; cy < 5; cy++) for (let cx = 0; cx < 9; cx++) {
        const x = 6 + cx * 4, y = 6 + cy * 4;
        b.fillRect(x, y, 4, 4, cols[(cx + cy) % 4]);
        b.set(x + 1, y + 1, P.p3);
      }
      for (let y = 3; y < 29; y += 2) { b.set(0, y, P.p1); b.set(47, y, P.p1); }
      return b;
    },
  });

  K.stamp('rug_b', {
    w: 2, h: 2, layer: 'floor', solid: ['..', '..'],
    paint: () => {
      const b = K.B(32, 32);
      b.circle(16, 16, 15, P.pk4, true);
      b.circle(16, 16, 14, P.pk3, true);
      b.circle(16, 16, 12, P.p1, true);
      b.circle(16, 16, 11, P.pk2, true);
      b.circle(16, 16, 8, P.yl1, true);
      for (let a = 0; a < 8; a++) {
        const t = (a * Math.PI) / 4 + 0.39, x = 16 + Math.round(Math.cos(t) * 9.5), y = 16 + Math.round(Math.sin(t) * 9.5);
        b.set(x, y, P.p0); b.set(x + 1, y, P.p0);
      }
      b.circle(16, 16, 6, P.p3, true);
      b.circle(16, 16, 5, P.p0, true);
      for (const [dx, dy] of [[-2, -2], [2, -2], [-2, 2], [2, 2]]) { b.set(16 + dx, 16 + dy, P.pk3); b.set(16 + dx + 1, 16 + dy, P.pk3); }
      b.line(14, 14, 18, 18, P.p2); b.line(18, 14, 14, 18, P.p2);
      return b;
    },
  });

  // ============================================================================================ counters
  function counterBase(end, extra) {
    const b = K.B(16, 16);
    b.fillRect(0, 3, 16, 6, P.o1);                  // top surface
    b.fillRect(0, 3, 16, 1, P.o0);
    b.fillRect(0, 8, 16, 1, P.o2);
    b.fillRect(0, 9, 16, 6, P.o3);                  // front
    b.fillRect(0, 9, 16, 1, P.o4);
    b.fillRect(2, 10, 12, 4, P.o2); b.strokeRect(2, 10, 12, 4, P.o4); b.hline(3, 11, 10, P.o1);
    b.fillRect(0, 14, 16, 1, P.o4);
    if (end === 'l') { b.fillRect(0, 3, 2, 12, P.o2); b.fillRect(0, 3, 1, 12, P.o1); b.fillRect(0, 3, 2, 1, P.o0); }
    if (end === 'r') { b.fillRect(14, 3, 2, 12, P.o4); b.fillRect(15, 3, 1, 12, P.o5); }
    // outline the top edge, the foot and the open ends only (counters tile into one long bar)
    const x0 = end === 'l' ? 1 : 0, x1 = end === 'r' ? 15 : 16;
    b.hline(x0, 2, x1 - x0, P.o6);
    b.hline(0, 15, 16, P.o6);
    if (end === 'l') b.vline(0, 3, 12, P.o6);
    if (end === 'r') b.vline(15, 3, 12, P.o6);
    if (extra) extra(b);
    return b;
  }
  for (const [id, end] of [['counter_l', 'l'], ['counter_m', 'm'], ['counter_r', 'r']]) {
    K.stamp(id, { w: 1, h: 1, paint: () => counterBase(end) });
  }
  K.stamp('counter_c', {
    w: 1, h: 1,
    paint: () => {
      const b = counterBase('m', (c) => {
        c.fillRect(3, 0, 9, 7, P.n3);                  // cash register
        c.fillRect(3, 0, 9, 1, P.n1); c.fillRect(3, 0, 1, 7, P.n1); c.fillRect(11, 0, 1, 7, P.n4);
        c.fillRect(4, 1, 7, 3, P.gl5); c.hline(7, 2, 3, P.gl3);
        c.hline(4, 5, 7, P.n5); for (let x = 4; x < 11; x += 2) c.set(x, 5, P.p1);
        c.vline(2, 0, 8, P.ink); c.vline(12, 0, 8, P.ink); c.hline(3, 7, 9, P.ink);
        c.fillRect(13, 5, 2, 3, P.gd3); c.set(13, 5, P.gd2);   // bell
      });
      return b;
    },
  });

  // ============================================================================================ tea healer, pc terminal
  K.stamp('tea_healer', {
    w: 2, h: 1, solid: ['##'],
    paint: () => {
      const b = K.B(32, 16);
      b.fillRect(1, 8, 30, 7, P.o3);                 // counter front
      b.fillRect(1, 7, 30, 2, P.o1); b.fillRect(1, 7, 30, 1, P.o0);
      b.fillRect(1, 14, 30, 1, P.o4); b.fillRect(2, 9, 28, 1, P.o4);
      b.blit(K.spr(HEART, { x: P.pk2 }), 12, 10); b.fillRect(20, 11, 1, 1, P.pk3);
      // big pink teapot with a white lid knob, two cups and steam
      K.blob(b, 16, 4, 5, 4, K.tn5('pink'));
      b.fillRect(13, 0, 7, 1, P.pk3); b.set(16, 0, P.p0); b.set(17, 0, P.p0);
      b.line(21, 3, 24, 1, P.pk2); b.set(24, 0, P.pk3);
      b.set(10, 3, P.pk3); b.set(10, 4, P.pk3); b.set(11, 5, P.pk3);
      b.set(25, 0, P.p0); b.set(6, 2, P.p0); b.set(7, 1, P.p0); b.set(27, 1, P.p0);
      teacup(b, 3, 3); teacup(b, 25, 3);
      K.outer(b, S.omap([[WOOD, P.o6], [[P.pk0, P.pk1, P.pk2, P.pk3, P.pk4, P.p0, P.p1, P.p3, P.p2], P.pk4]], 'o6'));
      K.shadow(b, 16, 15, 14, 1);
      return b;
    },
  });

  K.stamp('pc_terminal', {
    w: 1, h: 2,
    paint: () => {
      const b = K.B(16, 32);
      const w = K.ramp('white');
      b.fillRect(2, 1, 12, 13, w[2]);                // monitor case
      b.fillRect(2, 1, 12, 1, w[0]); b.fillRect(2, 1, 1, 13, w[1]); b.fillRect(13, 1, 1, 13, w[3]); b.fillRect(2, 13, 12, 1, w[3]);
      b.fillRect(4, 3, 8, 8, P.gl5);                 // screen
      b.set(5, 4, P.gl3); b.set(6, 4, P.gl3);
      b.hline(5, 6, 5, P.gl2); b.hline(5, 8, 3, P.gl2); b.set(9, 8, P.pk1);
      b.set(11, 12, P.f1);
      b.fillRect(6, 14, 4, 2, w[3]);                 // stand
      b.fillRect(1, 16, 14, 5, P.o2); b.fillRect(1, 16, 14, 1, P.o0);   // desk top
      b.fillRect(3, 17, 10, 3, w[2]); for (let x = 4; x < 12; x += 2) { b.set(x, 18, w[4]); b.set(x + 1, 19, w[4]); }
      b.fillRect(1, 21, 14, 8, P.o3); b.fillRect(1, 21, 14, 1, P.o4);
      b.strokeRect(3, 23, 10, 5, P.o4); b.fillRect(7, 25, 2, 1, P.gd2);
      b.fillRect(1, 29, 14, 2, P.o4);
      K.outer(b, S.omap([[S.tones(w), w[5]], [WOOD, P.o6]], 'ink'));
      return b;
    },
  });

  // ============================================================================================ mannequin, fridge, stove, sink
  K.stamp('mannequin', {
    w: 1, h: 2,
    paint: () => {
      const b = K.B(16, 32);
      const pk = K.ramp('pink');
      b.circle(8, 4, 2, P.o1, true); b.set(7, 3, P.o0);
      // dress: shoulders, nipped waist, flared skirt
      for (let y = 7; y <= 27; y++) {
        const hw = y < 9 ? 3 + (y - 7) : y < 15 ? 5 : y < 21 ? 5 - Math.round((y - 15) * 0.5) : 3 + Math.round((y - 21) * 1.3);
        for (let x = 8 - hw; x < 8 + hw; x++) {
          const lx = x - (8 - hw), rx = 8 + hw - 1 - x;
          let c = (((x >> 1) + (y >> 1)) & 1) ? pk[2] : pk[1];
          if (lx === 0) c = pk[0]; else if (rx <= 1) c = pk[3];
          if (y === 27) c = pk[4];
          b.set(x, y, c);
        }
      }
      b.hline(6, 7, 4, P.p0);
      for (let i = 0; i < 12; i++) b.set(5 + ((i * 3) % 7) + (i < 6 ? 0 : 0), 10 + i, i % 3 === 0 ? P.yl2 : P.yl1);   // measuring tape
      b.fillRect(7, 28, 2, 2, P.o3); b.hline(5, 30, 6, P.o4); b.hline(6, 29, 4, P.o3);
      K.outer(b, S.omap([[S.tones(pk), pk[5]], [[P.o0, P.o1, P.o3, P.o4, P.yl1, P.yl2, P.p0], P.o6]], 'o6'));
      K.shadow(b, 8, 31, 5, 1);
      return b;
    },
  });

  K.stamp('fridge', {
    w: 1, h: 2,
    paint: () => {
      const b = K.B(16, 32);
      const m = K.ramp('mint');
      b.fillRect(2, 1, 12, 29, m[2]);
      b.fillRect(2, 1, 12, 1, m[0]); b.fillRect(2, 1, 2, 29, m[1]); b.fillRect(12, 1, 2, 29, m[3]); b.fillRect(2, 29, 12, 1, m[4]);
      b.fillRect(2, 12, 12, 1, m[4]); b.fillRect(2, 13, 12, 1, m[1]);
      b.fillRect(11, 4, 2, 6, P.n3); b.fillRect(11, 4, 1, 6, P.n1);
      b.fillRect(11, 16, 2, 8, P.n3); b.fillRect(11, 16, 1, 8, P.n1);
      b.blit(K.spr(['.x.x.', 'xxxxx', '.xxx.', '..x..'], { x: P.red2 }), 5, 4);
      b.fillRect(5, 17, 4, 4, P.p0); b.fillRect(6, 18, 2, 2, P.bl1);
      b.set(5, 10, P.yl2); b.set(8, 9, P.pk2);
      b.fillRect(3, 30, 2, 1, P.n5); b.fillRect(11, 30, 2, 1, P.n5);
      K.outer(b, S.omap([[S.tones(m), m[5]]], 'ink'));
      K.shadow(b, 8, 31, 7, 1);
      return b;
    },
  });

  K.stamp('stove', {
    w: 1, h: 1,
    paint: () => {
      const b = K.B(16, 16);
      const w = K.ramp('white');
      b.fillRect(1, 2, 14, 12, w[2]);
      b.fillRect(1, 2, 14, 5, P.n5);                 // hob
      b.fillRect(1, 2, 14, 1, P.n3);
      b.ellipse(5, 4, 3, 1, P.n3, false); b.ellipse(11, 4, 3, 1, P.n3, false);
      b.fillRect(9, 1, 4, 3, P.bl2); b.fillRect(9, 1, 4, 1, P.bl1); b.fillRect(13, 2, 1, 1, P.bl3);   // kettle
      b.fillRect(1, 7, 14, 1, w[0]);
      for (const x of [3, 6, 9, 12]) b.set(x, 8, P.n4);
      b.fillRect(3, 9, 10, 4, P.n5); b.fillRect(4, 10, 5, 2, P.gl5); b.set(4, 10, P.gl3);
      b.fillRect(1, 7, 1, 7, w[1]); b.fillRect(14, 7, 1, 7, w[3]);
      b.fillRect(1, 13, 14, 1, w[4]);
      K.outer(b, S.omap([[S.tones(w), w[5]]], 'ink'));
      K.shadow(b, 8, 15, 7, 1);
      return b;
    },
  });

  K.stamp('sink', {
    w: 1, h: 1,
    paint: () => {
      const b = K.B(16, 16);
      b.fillRect(1, 9, 14, 5, P.o3); b.fillRect(1, 9, 14, 1, P.o4);
      b.strokeRect(2, 10, 5, 3, P.o4); b.strokeRect(9, 10, 5, 3, P.o4);
      b.set(6, 11, P.gd2); b.set(9, 11, P.gd2);
      b.fillRect(1, 13, 14, 1, P.o4);
      b.fillRect(0, 5, 16, 4, P.p1); b.fillRect(0, 5, 16, 1, P.p0); b.fillRect(0, 8, 16, 1, P.p3);
      b.ellipse(8, 6, 5, 1, P.n3, true); b.ellipse(8, 6, 4, 1, P.w2, true); b.set(5, 6, P.w1);
      b.fillRect(7, 1, 2, 4, P.n2); b.fillRect(7, 1, 1, 4, P.n1); b.fillRect(5, 1, 4, 1, P.n2); b.set(5, 2, P.n3);
      b.set(4, 3, P.n3); b.set(11, 3, P.n3); b.set(11, 4, P.red2); b.set(4, 4, P.bl2);
      K.outer(b, S.omap([[[P.o3, P.o4], P.o6]], 'ink'));
      K.shadow(b, 8, 15, 7, 1);
      return b;
    },
  });

  K.stamp('display_case', {
    w: 2, h: 1, solid: ['##'],
    paint: () => {
      const b = K.B(32, 16);
      b.fillRect(1, 9, 30, 6, P.o3); b.fillRect(1, 9, 30, 1, P.o4);
      b.fillRect(3, 11, 26, 3, P.o2); b.strokeRect(3, 11, 26, 3, P.o4);
      b.fillRect(1, 2, 30, 7, P.gl1);                 // glass box
      b.fillRect(2, 3, 28, 5, P.gl2);
      b.fillRect(1, 1, 30, 2, P.o2); b.fillRect(1, 1, 30, 1, P.o1);
      b.hline(1, 8, 30, P.o4);
      for (let i = 0; i < 6; i++) {
        const x = 4 + i * 4, c = [P.red1, P.yl2, P.bl2, P.pk2, P.f2, P.pu2][i];
        b.fillRect(x, 5, 3, 3, c); b.set(x, 5, P.p0);
        b.set(x + 1, 6, i % 2 ? P.o4 : P.p0);
      }
      b.set(3, 4, P.white); b.set(4, 4, P.white); b.set(5, 3, P.white);
      K.outer(b, WOOD_OUT);
      K.shadow(b, 16, 15, 14, 1);
      return b;
    },
  });

  K.stamp('pillar', {
    w: 1, h: 2,
    paint: () => {
      const b = K.B(16, 32);
      b.fillRect(4, 5, 8, 22, P.mb2);
      b.fillRect(4, 5, 2, 22, P.mb1); b.fillRect(10, 5, 2, 22, P.mb3);
      b.vline(7, 5, 22, P.mb3); b.vline(8, 5, 22, P.mb1);
      b.fillRect(2, 1, 12, 4, P.mb1); b.fillRect(2, 1, 12, 1, P.mb0); b.fillRect(2, 4, 12, 1, P.mb3); round(b, 2, 1, 12, 4);
      b.fillRect(3, 5, 10, 1, P.mb3);
      b.fillRect(2, 27, 12, 4, P.mb2); b.fillRect(2, 27, 12, 1, P.mb0); b.fillRect(2, 30, 12, 1, P.mb4); b.fillRect(3, 26, 10, 1, P.mb3);
      K.outer(b, S.omap([[[P.mb0, P.mb1, P.mb2, P.mb3, P.mb4], P.mb5]], 'mb5'));
      K.shadow(b, 8, 31, 7, 1);
      return b;
    },
  });

  K.stamp('ladder', {
    w: 1, h: 2,
    paint: () => {
      const b = K.B(16, 32);
      for (const x of [4, 10]) { b.fillRect(x, 0, 2, 32, P.o3); b.fillRect(x, 0, 1, 32, P.o2); b.fillRect(x + 1, 0, 1, 32, P.o4); }
      for (let y = 3; y < 32; y += 6) { b.fillRect(6, y, 4, 2, P.o2); b.fillRect(6, y, 4, 1, P.o1); b.fillRect(6, y + 1, 4, 1, P.o4); }
      K.outer(b, WOOD_OUT);
      K.shadowRect(b, 12, 0, 3, 32, 70);
      return b;
    },
  });
})(typeof globalThis !== 'undefined' ? globalThis : window);
