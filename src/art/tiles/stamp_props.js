/* src/art/tiles/stamp_props.js — outdoor props: sign, mailbox, bench, lamp, well, cloth_line (animated), barrel, crate,
 * skep (straw beehive), honey_stall, buzzlet_fly (an animated wild Buzzlet buzzing about; not solid). */
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
    // `back`: the same bench seen from behind (backrest towards the camera), for benches that face away, e.g. towards a statue
    w: 2, h: 1, variants: ['default', 'back'],
    paint: (v) => {
      const b = K.B(32, 16);
      if (v === 'back') {
        // seen from behind: the backrest is the near (south) face, the seat only peeks out 2px above it
        b.fillRect(2, 3, 28, 2, P.o2); b.hline(2, 3, 28, P.o0); b.hline(2, 4, 28, P.o3);                // the seat's far edge
        b.fillRect(1, 5, 30, 3, P.o2); b.hline(1, 5, 30, P.o1); b.hline(1, 7, 30, P.o4);                // upper backrest slat
        b.fillRect(1, 9, 30, 3, P.o2); b.hline(1, 9, 30, P.o1); b.hline(1, 11, 30, P.o4);               // lower backrest slat
        b.hline(1, 8, 30, P.o5);                                                                         // the gap between the slats
        for (const x of [5, 25]) { b.fillRect(x, 5, 2, 10, P.o3); b.vline(x, 5, 10, P.o2); b.set(x + 1, 14, P.o4); }   // two vertical supports down to the ground
        K.outer(b, WOOD_OUT);
        K.shadow(b, 16, 14, 14, 2);
        return b;
      }
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

  K.stamp('bench_v', {
    // the same park bench turned side-on (1x2), for a path that runs north-south. default: seat facing west, backrest on the east;
    // east: the mirror image, seat facing east and backrest on the west (a pair of benches facing each other across a square)
    // ground3d: side-on it is a low seat, so the 3D view bakes it flat into the ground (as a 32 px billboard it stood up like a door)
    w: 1, h: 2, variants: ['default', 'east'], ground3d: true,
    paint: (v) => {
      const b = K.B(16, 32);
      // backrest (east): two rails with a dark gap, joined to the seat by a dark post at each end
      b.fillRect(12, 2, 3, 26, P.o3); b.hline(12, 2, 3, P.o1); b.vline(13, 3, 24, P.o5); b.vline(14, 3, 24, P.o4);
      b.set(11, 6, P.o5); b.set(11, 23, P.o5);
      // seat: two lengthwise slats with a dark gap, plain end caps top and bottom
      b.fillRect(5, 4, 6, 24, P.o2); b.vline(5, 4, 24, P.o1); b.vline(8, 4, 24, P.o4); b.vline(10, 4, 24, P.o3);
      for (const y of [3, 26]) { b.fillRect(5, y, 6, 2, P.o3); b.hline(5, y, 6, y === 3 ? P.o1 : P.o2); }
      // legs poking out under the west edge, near each end
      for (const y of [6, 22]) { b.fillRect(3, y, 2, 3, P.o4); b.vline(3, y, 3, P.o3); }
      K.outer(b, WOOD_OUT);
      K.shadowRect(b, 1, 5, 2, 23, 70);   // its shadow falls along the long west side
      return v === 'east' ? b.flippedX() : b;
    },
  });

  // ============================================================================================ lamp (1x2)
  K.stamp('lamp', {
    w: 1, h: 2, over: 1, solid: ['.', '#'], // only the base blocks: the lantern head hangs over the walkable tile above it
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

  // ============================================================================================ Hemline's bees
  const STRAW = [P.hy0, P.hy1, P.hy2, P.hy3, P.hy4];
  /** skep: a coiled-straw beehive dome on a little plank stand */
  K.stamp('skep', {
    w: 1, h: 1, rise: 8,
    paint: () => {
      const b = K.B(16, 24);
      // stand: plank on two stubby legs
      b.fillRect(3, 19, 2, 4, P.o4); b.fillRect(11, 19, 2, 4, P.o4);
      b.fillRect(1, 17, 14, 2, P.o2); b.hline(1, 17, 14, P.o1); b.hline(1, 18, 14, P.o3);
      // dome: coils of straw, lit from the top-left
      for (let y = 3; y <= 16; y++) {
        const t = (y - 3) / 13, hw = Math.round(2.5 + Math.sqrt(t) * 4.6);
        for (let x = 8 - hw; x < 8 + hw; x++) {
          const coil = (y - 3) % 3, u = (x - (8 - hw)) / (2 * hw);
          let c = coil === 2 ? STRAW[3] : u < 0.3 ? STRAW[1] : u > 0.72 ? STRAW[3] : STRAW[2];
          if (coil === 0 && u < 0.55) c = STRAW[0 + (u > 0.3 ? 1 : 0)];
          if (coil === 2 && ((x + y) & 3) === 0) c = STRAW[4];
          b.set(x, y, c);
        }
      }
      b.fillRect(7, 1, 2, 2, STRAW[2]); b.set(7, 1, STRAW[1]);   // the top knot
      // entrance: a dark little arch at the foot, a bee on the step
      b.fillRect(6, 14, 4, 3, P.b4); b.hline(7, 13, 2, P.b4); b.set(6, 14, STRAW[3]); b.set(9, 14, STRAW[3]);
      b.set(11, 11, P.yl2); b.set(12, 11, P.ink); b.set(11, 10, P.w1);
      K.outer(b, S.omap([[STRAW, P.b3], [WOOD, P.o6]], 'o6'));
      K.shadow(b, 8, 23, 7, 1);
      return b;
    },
  });

  /** honey stall: a trestle table of honey jars under a striped yellow awning */
  K.stamp('honey_stall', {
    w: 2, h: 1, rise: 16, solid: ['##'],
    paint: () => {
      const b = K.B(32, 32);
      // posts and awning
      for (const x of [2, 28]) { b.fillRect(x, 6, 2, 22, P.o3); b.vline(x, 6, 22, P.o2); }
      S.awning(b, 0, 2, 32, 4, P.yl2, P.p0, [P.yl1, P.yl0, P.yl3, P.yl4]);
      // a hanging honeycomb sign
      b.vline(15, 7, 1, P.o4); b.vline(17, 7, 1, P.o4);
      for (const [hx, hy] of [[13, 9], [17, 9], [15, 12]]) {
        b.fillRect(hx, hy, 3, 3, P.yl2); b.set(hx + 1, hy - 1, P.yl2); b.set(hx + 1, hy + 3, P.yl3); b.set(hx, hy, P.yl1);
      }
      // table and legs
      b.fillRect(1, 22, 30, 3, P.o2); b.hline(1, 22, 30, P.o1); b.hline(1, 24, 30, P.o4);
      b.fillRect(3, 25, 2, 6, P.o4); b.fillRect(27, 25, 2, 6, P.o4);
      b.fillRect(2, 25, 28, 4, P.red2); for (let x = 2; x < 30; x += 4) b.fillRect(x, 25, 2, 4, P.p0);   // gingham skirt
      b.hline(2, 28, 28, P.red3);
      // jars: golden honey, cloth lids tied with string
      for (const [jx, h] of [[5, 6], [11, 7], [18, 6], [24, 7]]) {
        const y0 = 22 - h;
        b.fillRect(jx, y0, 4, h, P.yl3); b.fillRect(jx + 1, y0 + 1, 2, h - 2, P.yl2); b.vline(jx, y0 + 1, h - 2, P.yl1); b.set(jx + 2, y0 + 1, P.white);
        b.fillRect(jx - 1, y0 - 2, 6, 2, P.p0); b.hline(jx - 1, y0 - 1, 6, P.red2);
      }
      K.outer(b, S.omap([[WOOD, P.o6], [[P.yl0, P.yl1, P.yl2, P.yl3], P.yl4], [[P.red2, P.red3, P.p0], P.red4]], 'o6'));
      K.shadow(b, 16, 31, 15, 1);
      return b;
    },
  });

  /** a wild Buzzlet (a bee onesie with stripes and tiny antennae) hovering about, wings a blur. 4 frames: bob + flap. */
  K.stamp('buzzlet_fly', {
    // a wild Buzzlet in its bee onesie: hood up with a rim round the face, spiky fringe, stubby mitts and feet. Only the wings and the bob move.
    w: 1, h: 1, rise: 8, solid: ['.'], frames: 4, animSpeed: 6,
    paint: (variant, f) => {
      const b = K.B(16, 24);
      const y = 6 + [0, -1, -2, -1][f];
      // wings behind the shoulders (spread on even frames, half-folded on odd)
      const wy = y + (f % 2 ? 3 : 0), wing = [[0, wy, 4, 6], [12, wy, 4, 6]];   // same wings every frame, flicked up and down
      for (const [wx, wy, ww, wh] of wing) { b.fillRect(wx, wy, ww, wh, P.w1); b.hline(wx, wy, ww, P.white); b.hline(wx, wy + wh - 1, ww, P.w2); }
      // striped body, arms with white mitts, little feet
      b.fillRect(4, y + 8, 8, 5, P.yl2); b.vline(4, y + 8, 4, P.yl1); b.vline(11, y + 8, 4, P.yl3); b.set(4, y + 12, 0); b.set(11, y + 12, 0); b.hline(5, y + 12, 6, P.yl3);   // rounded tum
      b.hline(4, y + 9, 8, P.ink); b.hline(4, y + 11, 8, P.ink);
      for (const ax of [2, 12]) { b.fillRect(ax, y + 8, 2, 2, P.yl2); b.fillRect(ax, y + 10, 2, 2, P.o3); b.set(ax, y + 10, P.o2); }   // honey-brown mitts
      b.fillRect(5, y + 13, 2, 1, P.yl4); b.fillRect(9, y + 13, 2, 1, P.yl4);
      // hood with a darker rim round the face opening
      b.fillRect(3, y, 10, 8, P.yl2); b.set(3, y, 0); b.set(12, y, 0); b.hline(4, y + 1, 3, P.yl1);
      b.hline(5, y + 1, 6, P.yl3); b.vline(4, y + 2, 5, P.yl3); b.vline(11, y + 2, 5, P.yl3); b.hline(5, y + 7, 6, P.yl3);
      // face: spiky brown fringe, eyes, blush, a small smile
      b.fillRect(5, y + 2, 6, 5, P.p1);
      b.hline(5, y + 2, 6, P.o3); b.set(5, y + 3, P.o3); b.set(7, y + 3, P.o3); b.set(10, y + 3, P.o3); b.set(6, y + 2, P.o2);
      b.set(6, y + 4, P.ink); b.set(9, y + 4, P.ink); b.set(5, y + 5, P.pk1); b.set(10, y + 5, P.pk1); b.hline(7, y + 6, 2, P.red2);
      // antennae with bobbles
      b.set(5, y - 1, P.ink); b.set(4, y - 2, P.ink); b.set(10, y - 1, P.ink); b.set(11, y - 2, P.ink);
      for (const kx of [2, 12]) { b.fillRect(kx, y - 4, 2, 2, P.yl4); b.set(kx, y - 4, P.yl2); }   // thin stalks, round honey knobs
      K.outer(b, S.omap([[[P.yl1, P.yl2, P.yl3, P.yl4, P.p1, P.o2, P.o3, P.pk1, P.red2], P.o5], [[P.w1, P.w2, P.white], P.bl3]], 'ink'));
      b.ellipse(8, 22, 3, 1, P.g4, true);   // little shadow on the grass below
      return b;
    },
  });
})(typeof globalThis !== 'undefined' ? globalThis : window);
