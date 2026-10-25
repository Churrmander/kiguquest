/* src/art/tiles/stamp_gate.js — `gate_house`: a stone-and-timber village/route gatehouse (6x3 tiles, variants default | pressed).
 * The two centre columns are an open arched passage (2 tiles wide, like the roads it sits on) you walk straight through north-south; the roof, tie-beam and arch (rows 0-1)
 * are drawn above actors (over = 2) so the player ducks under them.
 *   default = a hanging sign on the left wing, a shuttered window with a flower box on the right, a red pennant on the roof;
 *   pressed = the Starch Society has hung its banner (white, flat blue stripes, blue piping, a starch-collar crest) over the
 *             window, and the pennant is a stiff white-and-blue one.
 * solid rows: wings blocked, the two centre columns walkable in all three rows. */
(function (root) {
  'use strict';
  const NP = root.NP;
  const K = NP.art.tiles.kit;
  const S = K.S;
  const { P } = K;

  const BLOOM = [P.pk2, P.yl2, P.red1, P.bl1];
  const ST = [P.c0, P.c1, P.c2, P.c3, P.c4];
  const COLLAR = [
    'ooo...ooo',
    'owwo.owwo',
    'owwwowwwo',
    '.owwbwwo.',
    '..owbwo..',
    '...obo...',
  ];

  /** staggered blocks of cobble stone, some blocks lighter */
  function stoneWall(b, x0, y0, x1, y1) {
    for (let y = y0; y <= y1; y++) {
      const row = Math.floor((y - y0) / 5), ry = (y - y0) % 5, off = (row & 1) * 4;
      for (let x = x0; x <= x1; x++) {
        const bx = x - x0 + off, lx = bx % 8, bi = Math.floor(bx / 8);
        const light = K.h32(row, bi, 7) % 4 === 0;
        let c = light ? ST[1] : ST[2];
        if (ry === 4 || lx === 7) c = ST[3];
        else if (ry === 0) c = light ? ST[0] : ST[1];
        else if (lx === 0) c = light ? ST[0] : ST[1];
        b.set(x, y, c);
      }
    }
  }

  S.stoneWall = stoneWall;          // (also used by the 3D view's gatehouse side walls, w3d_volumes.js)

  K.stamp('gate_house', {
    w: 6, h: 3, solid: ['##..##', '##..##', '##..##'], over: 2, variants: ['default', 'pressed'],
    paint: (variant) => {
      const pressed = variant === 'pressed';
      const b = K.B(96, 48);
      const r = K.ramp('brown');
      const cx = 47.5, AY = 35;   // arch spring line: the ring's crown sits just under the tie-beam, so it shows in 3D too

      // ---- stone wings with a timber tie-beam, corner posts and a stone footing
      stoneWall(b, 2, 22, 93, 47);
      b.fillRect(2, 46, 92, 2, ST[4]);
      // arch ring (semicircle on top, jambs below), then cut the passage out
      for (let y = 18; y < 48; y++) for (let x = 29; x <= 66; x++) {
        const inRing = y <= AY ? ((x - cx) / 18.5) ** 2 + ((y - AY) / 11.5) ** 2 <= 1 : true;
        if (!inRing) continue;
        const a = Math.atan2(y - AY, x - cx);
        const joint = y <= AY ? Math.abs(((a / Math.PI) * 8) % 1) < 0.12 : (y - AY) % 5 === 0;
        const edge = y <= AY && ((x - cx) / 17.5) ** 2 + ((y - AY) / 10.5) ** 2 > 1;   // a dark 1px line round the outside of the ring
        b.set(x, y, edge ? P.n5 : joint ? ST[4] : (x < cx - 6 ? ST[2] : ST[3]));
      }
      for (let y = 18; y < 48; y++) for (let x = 32; x <= 63; x++) {
        const open = y <= AY ? ((x - cx) / 15.5) ** 2 + ((y - AY) / 8.5) ** 2 <= 1 : true;
        if (open) b.u32[y * b.w + x] = y < AY ? P.n6 : 0;   // the passage vault in deep shadow, following the curve
      }
      // keystone, and the jambs' inner faces in shade
      for (let k = 0; k < 5; k++) { const x0 = 45 + (k >> 1), x1 = 50 - (k >> 1); b.hline(x0, 22 + k, x1 - x0 + 1, ST[1]); b.set(x0 - 1, 22 + k, P.n5); b.set(x1 + 1, 22 + k, P.n5); b.set(x0, 22 + k, ST[0]); b.set(x1, 22 + k, ST[3]); }   // wedge keystone
      b.hline(45, 22, 5, ST[0]); b.hline(47, 27, 2, P.n5);
      for (let y = AY; y < 46; y++) { b.set(32, y, ST[3]); b.set(33, y, ST[4]); b.set(63, y, ST[4]); b.set(62, y, ST[3]); }
      // roof (hip, brown shingles) over a timber tie-beam
      K.roof(b, 1, 6, 94, 18, r, { inset: 18, row: 4, alt: r[1] });
      b.fillRect(1, 19, 94, 3, P.o3); b.hline(1, 19, 94, P.o1); b.hline(1, 20, 94, P.o2); b.hline(1, 21, 94, P.o4);
      for (let x = 6; x < 92; x += 10) b.set(x, 20, P.o5);
      b.fillRect(2, 22, 2, 25, P.o3); b.vline(2, 22, 25, P.o2);
      b.fillRect(92, 22, 2, 25, P.o4); b.vline(92, 22, 25, P.o3);

      // ---- left wing: hanging sign on a bracket
      b.fillRect(4, 24, 16, 2, P.o3); b.hline(4, 24, 16, P.o2); b.hline(4, 26, 12, P.o5);
      b.vline(7, 26, 3, P.o5); b.vline(16, 26, 3, P.o5);
      b.fillRect(5, 29, 13, 12, P.o5);
      b.fillRect(6, 30, 11, 10, P.o2);
      b.hline(6, 30, 11, P.o1); b.hline(6, 39, 11, P.o3);
      S.button(b, 11, 35, P.p1, P.p3, P.o5);

      if (!pressed) {
        // ---- right wing: shuttered window with a flower box
        S.window(b, 73, 30, 11, 9, { shutter: r });
        S.flowerBox(b, 72, 42, 13, BLOOM);
      } else {
        // ---- the Starch Society banner: white, flat blue stripes, blue piping, a starch-collar crest
        b.fillRect(69, 22, 21, 2, P.o4); b.hline(69, 22, 21, P.o2); b.fillRect(68, 21, 1, 4, P.o3); b.fillRect(90, 21, 1, 4, P.o3);
        b.fillRect(72, 24, 15, 22, P.st5);
        b.fillRect(73, 25, 13, 20, P.st0);
        for (let x = 74; x <= 84; x += 3) b.vline(x, 25, 20, P.st3);
        b.fillRect(74, 27, 11, 9, P.st0);
        b.blit(K.spr(COLLAR, { o: P.st5, w: P.st0, b: P.st4 }), 75, 28);
        b.hline(73, 38, 13, P.st4);
        b.hline(73, 40, 13, P.st4);
      }

      // ---- pennant on the roof (swallow-tail red; stiff striped white-and-blue when pressed)
      b.vline(28, 1, 6, P.o4); b.set(28, 1, P.o2);
      const widths = [10, 8, 6, 4, 2];
      for (let i = 0; i < widths.length; i++) {
        const c = pressed ? (i % 2 ? P.st4 : P.st0) : i === 0 ? P.red1 : i < 3 ? P.red2 : P.red3;
        b.hline(29, 1 + i, widths[i], c);
      }

      K.outer(b, S.omap([[r.slice(0, 5), r[5]], [ST, P.c5], [[P.red1, P.red2, P.red3], P.red4], [[P.st0, P.st3, P.st4], P.st6]], P.o6));
      return b;
    },
  });
})(typeof globalThis !== 'undefined' ? globalThis : window);
