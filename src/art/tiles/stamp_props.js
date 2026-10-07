/* src/art/tiles/stamp_props.js — outdoor props: sign, mailbox, bench, lamp, well, cloth_line (animated), barrel, crate. */
(function (root) {
  'use strict';
  const NP = root.NP;
  const K = NP.art.tiles.kit;
  const S = K.S;
  const { P } = K;

  const WOOD = [P.o0, P.o1, P.o2, P.o3, P.o4, P.o5];
  const WOOD_OUT = S.omap([[WOOD, P.o6]], 'o6');

  // ============================================================================================ sign
  K.stamp('sign', {
    w: 1, h: 1,
    paint: () => {
      const b = K.B(16, 16);
      b.fillRect(7, 9, 2, 5, P.o3); b.fillRect(7, 9, 1, 5, P.o2);
      b.fillRect(2, 2, 12, 8, P.o3);
      b.fillRect(2, 2, 12, 1, P.o1); b.fillRect(2, 2, 1, 8, P.o2); b.fillRect(2, 9, 12, 1, P.o4); b.fillRect(13, 2, 1, 8, P.o4);
      b.fillRect(3, 3, 10, 6, P.p1);
      b.fillRect(3, 3, 10, 1, P.p0); b.fillRect(3, 8, 10, 1, P.p2);
      S.button(b, 8, 6, P.pk2, P.pk3, P.pk4);
      b.set(4, 6, P.o4); b.set(11, 6, P.o4);
      K.outer(b, WOOD_OUT);
      K.shadow(b, 8, 14, 5, 1);
      return b;
    },
  });

  // ============================================================================================ mailbox
  K.stamp('mailbox', {
    w: 1, h: 1,
    paint: () => {
      const b = K.B(16, 16);
      const r = K.ramp('red');
      b.fillRect(7, 9, 2, 5, P.o3); b.fillRect(7, 9, 1, 5, P.o2);
      b.fillRect(3, 4, 10, 6, r[2]);
      b.fillRect(4, 3, 8, 1, r[1]); b.fillRect(5, 2, 6, 1, r[1]);
      b.fillRect(3, 4, 2, 6, r[1]); b.fillRect(11, 4, 2, 6, r[3]);
      b.fillRect(3, 9, 10, 1, r[4]);
      b.fillRect(5, 6, 5, 1, r[4]);              // mail slot
      b.set(10, 8, P.p0); b.set(10, 7, P.p1);    // little latch
      b.fillRect(13, 2, 1, 4, P.yl2); b.fillRect(14, 2, 1, 2, P.yl2); b.set(13, 2, P.yl1);   // raised flag
      K.outer(b, S.omap([[S.tones(r), r[5]], [WOOD, P.o6], [[P.yl1, P.yl2, P.p0, P.p1], P.o6]], 'o6'));
      K.shadow(b, 8, 14, 5, 1);
      return b;
    },
  });

  // ============================================================================================ bench (2x1)
  K.stamp('bench', {
    w: 2, h: 1,
    paint: () => {
      const b = K.B(32, 16);
      // legs and back posts
      for (const x of [3, 26]) { b.fillRect(x, 10, 3, 4, P.o4); b.fillRect(x, 10, 1, 4, P.o3); }
      for (const x of [3, 26]) { b.fillRect(x, 2, 3, 8, P.o3); b.fillRect(x, 2, 1, 8, P.o2); }
      // back slats
      b.fillRect(3, 3, 26, 2, P.o2); b.fillRect(3, 3, 26, 1, P.o1);
      b.fillRect(3, 6, 26, 2, P.o3); b.fillRect(3, 6, 26, 1, P.o2);
      // seat
      b.fillRect(1, 9, 30, 3, P.o2);
      b.fillRect(1, 9, 30, 1, P.o0);
      b.fillRect(1, 11, 30, 1, P.o4);
      b.fillRect(14, 9, 1, 2, P.o3);
      K.outer(b, WOOD_OUT);
      K.shadow(b, 16, 14, 14, 2);
      return b;
    },
  });

  // ============================================================================================ lamp (1x2)
  K.stamp('lamp', {
    w: 1, h: 2, over: 1, solid: ['#', '#'],
    paint: () => {
      const b = K.B(16, 32);
      // iron post + base
      b.fillRect(7, 11, 2, 18, P.n4); b.fillRect(7, 11, 1, 18, P.n2);
      b.fillRect(5, 27, 6, 3, P.n4); b.fillRect(5, 27, 6, 1, P.n2); b.fillRect(6, 24, 4, 3, P.n3);
      b.fillRect(6, 24, 1, 3, P.n1);
      // lantern head
      b.fillRect(3, 9, 10, 2, P.n5);
      b.fillRect(4, 3, 8, 6, P.l2);
      b.fillRect(5, 4, 4, 4, P.l1); b.fillRect(6, 5, 2, 2, P.l0);
      b.fillRect(11, 3, 1, 6, P.l3);
      b.fillRect(3, 2, 10, 2, P.n5); b.fillRect(5, 1, 6, 1, P.n5); b.set(7, 0, P.n4); b.set(8, 0, P.n4);
      b.vline(4, 3, 6, P.n4); b.vline(11, 3, 6, P.n4);
      // hanging cloth pennant
      b.fillRect(9, 12, 4, 5, P.red2); b.fillRect(9, 12, 4, 1, P.red1); b.set(10, 17, P.red2); b.set(12, 17, 0);
      K.outer(b, S.omap([[[P.n1, P.n2, P.n3, P.n4, P.n5, P.l0, P.l1, P.l2, P.l3], P.ink], [[P.red1, P.red2], P.red4]], 'ink'));
      K.shadow(b, 8, 30, 5, 1);
      return b;
    },
  });

  // ============================================================================================ well (2x2)
  K.stamp('well', {
    w: 2, h: 2,
    paint: () => {
      const b = K.B(32, 32);
      const r = K.ramp('red');
      // stone drum
      b.fillRect(3, 21, 26, 8, P.c2);
      b.ellipse(16, 28, 13, 3, P.c2, true);
      b.ellipse(16, 21, 13, 5, P.c1, true);
      b.ellipse(16, 21, 10, 3, P.c4, true);
      b.ellipse(16, 22, 9, 2, P.w3, true);
      b.hline(9, 21, 4, P.w1);
      for (let y = 25; y < 30; y += 3) b.hline(3, y, 26, P.c3);
      for (let y = 22; y < 30; y += 3) for (let x = 4 + ((y / 3) & 1) * 3; x < 28; x += 6) b.vline(x, y, 3, P.c3);
      b.fillRect(3, 22, 2, 6, P.c1);
      // posts, beam and roof
      b.fillRect(5, 9, 2, 14, P.o3); b.fillRect(5, 9, 1, 14, P.o2);
      b.fillRect(25, 9, 2, 14, P.o4);
      b.fillRect(4, 8, 24, 2, P.o4); b.fillRect(4, 8, 24, 1, P.o3);
      K.roof(b, 2, 1, 29, 8, r, { inset: 9, row: 4, alt: r[1] });
      // rope and bucket
      b.vline(16, 9, 8, P.p3);
      b.fillRect(13, 16, 6, 5, P.o3); b.fillRect(13, 16, 6, 1, P.o1); b.fillRect(13, 18, 6, 1, P.n4); b.fillRect(18, 16, 1, 5, P.o4);
      K.outer(b, S.omap([[S.tones(r), r[5]], [[P.c1, P.c2, P.c3, P.c4], P.c5], [WOOD, P.o6]], 'c5'));
      K.shadow(b, 16, 30, 14, 1);
      return b;
    },
  });

  // ============================================================================================ cloth_line (2x1, animated)
  const CLOTHS = [
    { x: 6, w: 6, h: 7, pal: 'pink', kind: 'shirt' },
    { x: 14, w: 6, h: 8, pal: 'sky', kind: 'towel' },
    { x: 22, w: 4, h: 4, pal: 'yellow', kind: 'flag' },
  ];
  const SWAY = [0, 1, 0, -1];
  K.stamp('cloth_line', {
    w: 2, h: 1, frames: 4, animSpeed: 14,
    paint: (variant, frame) => {
      const b = K.B(32, 16);
      // posts
      for (const x of [2, 28]) { b.fillRect(x, 3, 2, 11, P.o3); b.fillRect(x, 3, 1, 11, P.o2); b.fillRect(x - 1, 13, 4, 1, P.o4); }
      // rope with a gentle sag
      for (let x = 3; x <= 29; x++) {
        const t = (x - 3) / 26, y = 4 + Math.round(Math.sin(t * Math.PI) * 1);
        b.set(x, y, P.p3);
      }
      const sw = SWAY[frame];
      for (const c of CLOTHS) {
        const r = K.ramp(c.pal);
        for (let yy = 0; yy < c.h; yy++) {
          const off = Math.round((sw * yy) / (c.h - 1));
          const y0 = 5 + yy;
          for (let xx = 0; xx < c.w; xx++) {
            let col = r[2];
            if (xx === 0) col = r[1];
            else if (xx >= c.w - 2) col = r[3];
            if (c.kind === 'towel' && yy % 3 === 1) col = r[0];
            if (c.kind === 'shirt' && yy === 0) col = r[1];
            if (c.kind === 'flag' && yy >= c.h - 1 - (xx > 1 ? xx - 1 : 0) && xx > 1) continue;
            b.set(c.x + xx + off, y0, col);
          }
        }
        if (c.kind === 'shirt') { b.set(c.x - 1 + Math.round(sw * 0.5), 8, r[2]); b.set(c.x + c.w + Math.round(sw * 0.5), 8, r[2]); b.set(c.x + 2, 5, P.p0); b.set(c.x + 3, 5, P.p0); }
        b.set(c.x + 1, 4, P.o1); b.set(c.x + c.w - 2, 4, P.o1);       // clothes-pegs
      }
      K.outer(b, S.omap([[WOOD, P.o6], [[P.p3], P.p5]].concat(CLOTHS.map((c) => [S.tones(K.ramp(c.pal)), K.ramp(c.pal)[5]])), 'o6'));
      K.shadow(b, 16, 14, 14, 1, 70);
      return b;
    },
  });

  // ============================================================================================ barrel / crate
  K.stamp('barrel', {
    w: 1, h: 1,
    paint: () => {
      const b = K.B(16, 16);
      K.cyl(b, 3, 3, 10, 11, [P.o1, P.o2, P.o3, P.o4, P.o5]);
      b.fillRect(3, 4, 10, 1, P.o2); b.fillRect(3, 13, 10, 1, P.o5);
      b.vline(6, 4, 9, P.o4); b.vline(9, 4, 9, P.o4);
      b.fillRect(3, 5, 10, 2, P.n3); b.fillRect(3, 5, 10, 1, P.n1); b.fillRect(3, 6, 10, 1, P.n4);
      b.fillRect(3, 10, 10, 2, P.n3); b.fillRect(3, 10, 10, 1, P.n1); b.fillRect(3, 11, 10, 1, P.n4);
      b.ellipse(8, 3, 5, 2, P.o1, true);
      b.ellipse(8, 3, 3, 1, P.o2, true);
      b.hline(5, 2, 3, P.o0);
      K.outer(b, S.omap([[WOOD, P.o6], [[P.n1, P.n3, P.n4], P.ink]], 'o6'));
      K.shadow(b, 8, 14, 6, 2);
      return b;
    },
  });
  K.stamp('crate', {
    w: 1, h: 1,
    paint: () => {
      const b = K.B(16, 16);
      b.fillRect(2, 5, 12, 9, P.o2);                 // front
      b.fillRect(2, 2, 12, 3, P.o1);                 // lid (top face)
      b.fillRect(2, 2, 12, 1, P.o0);
      b.fillRect(2, 5, 12, 1, P.o4);
      b.strokeRect(2, 6, 12, 8, P.o4);
      b.line(3, 7, 12, 12, P.o3); b.line(12, 7, 3, 12, P.o3);
      b.fillRect(2, 6, 1, 8, P.o1);
      for (const [x, y] of [[3, 7], [12, 7], [3, 12], [12, 12]]) b.set(x, y, P.o0);
      K.outer(b, WOOD_OUT);
      K.shadow(b, 8, 14, 7, 2);
      return b;
    },
  });
})(typeof globalThis !== 'undefined' ? globalThis : window);
