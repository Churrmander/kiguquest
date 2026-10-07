/* src/art/tiles/stamp_shrine.js — `shrine`: the Spindle Shrine (5x4 tiles, variants default | pressed).
 * A small red-roofed wooden hall with paper-screen windows, two paper lanterns, ribbons and thread swags hanging from the eaves, and a
 * giant silk spool standing on a stone plinth (with a little arched doorway and steps down to the approach row).
 *   default = warm reds / creams, curly bright threads, glowing lanterns, a candle in the doorway;
 *   pressed = the Starch Society's work: everything drained to white and pale blue-grey, threads pulled dead straight, ribbons
 *             ironed flat and square, lanterns dark, no candle.
 * solid rows: building mass blocked, approach row walkable with the 'D' door tile at bottom centre. over = 1 (the roof row). */
(function (root) {
  'use strict';
  const NP = root.NP;
  const K = NP.art.tiles.kit;
  const S = K.S;
  const { P, col } = K;

  const PALE = ['#ffffff', '#eef2f8', '#d4dcea', '#aab6cc', '#8492ac', '#4c5470'].map(col);
  const RED = K.ramp('red');

  const PALS = {
    default: {
      R: RED,
      wall: [P.p0, P.p1, P.p2, P.p3],
      W: [P.o0, P.o1, P.o2, P.o3, P.o4, P.o5, P.o6],
      ST: [P.c0, P.c1, P.c2, P.c3, P.c4, P.c5],
      spool: RED.slice(0, 5),
      paper: P.p0, lattice: RED[3],
      rib: [[P.yl1, P.yl2, P.yl3], [P.pk1, P.pk2, P.pk3]],
      swag: [P.yl2, P.pk2], bead: P.yl1,
      lbody: [RED[1], RED[2], RED[3]], glow: P.l1, tassel: [P.gd2, P.gd3],
      finial: [P.gd2, P.gd0, P.gd4],
      thread: [RED[1], RED[3]],
    },
    pressed: {
      R: PALE,
      wall: [P.st0, P.st1, P.n1, P.n2],
      W: [P.n0, P.n1, P.n2, P.n3, P.n4, P.n5, P.n5],
      ST: [P.st0, P.st1, P.n1, P.n2, P.n3, P.n5],
      spool: PALE.slice(0, 5),
      paper: P.st0, lattice: PALE[3],
      rib: [[PALE[1], PALE[2], PALE[3]], [PALE[1], PALE[2], PALE[3]]],
      swag: [PALE[3]], bead: PALE[1],
      lbody: [PALE[0], PALE[1], PALE[2]], glow: PALE[1], tassel: [PALE[3], PALE[4]],
      finial: [PALE[2], PALE[0], PALE[4]],
      thread: [PALE[3], PALE[4]],
    },
  };

  K.stamp('shrine', {
    w: 5, h: 4, solid: ['#####', '#####', '#####', '..D..'], over: 1, variants: ['default', 'pressed'],
    paint: (variant) => {
      const pressed = variant === 'pressed';
      const A = pressed ? PALS.pressed : PALS.default;
      const { R, W, ST, wall } = A;
      const b = K.B(80, 64);
      const cx = 40;

      // ---- roof + finial
      b.circle(cx, 3, 2, A.finial[0], true); b.set(cx - 1, 2, A.finial[1]); b.set(cx + 1, 4, A.finial[2]);
      K.roof(b, 1, 6, 78, 27, R, { inset: 17, row: 5, alt: R[1] });

      // ---- wall: plaster, timber posts, stone plinth
      const wl = 4, wr = 75, top = 28, bot = 49;
      b.fillRect(wl, top, wr - wl + 1, bot - top + 1, wall[1]);
      b.fillRect(wl, top, wr - wl + 1, 2, wall[3]);
      b.fillRect(wl, top + 2, wr - wl + 1, 1, wall[2]);
      for (let i = 0; i < 22; i++) b.set(wl + 3 + (K.h32(i, 5, 21) % (wr - wl - 5)), top + 5 + (K.h32(i, 6, 22) % (bot - top - 9)), wall[2]);
      b.fillRect(wl, top, 2, bot - top + 1, W[3]); b.vline(wl, top, bot - top + 1, W[2]);
      b.fillRect(wr - 1, top, 2, bot - top + 1, W[4]); b.vline(wr - 1, top, bot - top + 1, W[3]);
      b.fillRect(wl + 2, bot - 2, wr - wl - 3, 3, ST[2]);
      for (let x = wl + 2; x < wr - 1; x += 4) b.fillRect(x + (((x >> 2) & 1) ? 2 : 0), bot - 2, 1, 2, ST[3]);
      b.fillRect(wl + 2, bot, wr - wl - 3, 1, ST[4]);

      // ---- paper-screen windows
      const shoji = (x, y, w, h) => {
        b.fillRect(x - 1, y - 1, w + 2, h + 2, W[5]);
        b.fillRect(x, y, w, h, A.paper);
        for (let xx = x + 3; xx < x + w - 1; xx += 3) b.vline(xx, y, h, A.lattice);
        b.hline(x, y + (h >> 1), w, A.lattice);
        b.set(x, y, wall[0]);
        b.hline(x - 2, y + h + 1, w + 4, W[3]);
      };
      shoji(13, 34, 10, 10); shoji(57, 34, 10, 10);

      // ---- pedestal: stone plinth with a little arched doorway
      b.fillRect(29, 35, 22, 3, ST[1]); b.hline(29, 35, 22, ST[0]); b.hline(29, 37, 22, ST[3]);
      b.fillRect(30, 38, 20, 11, ST[2]); b.vline(30, 38, 11, ST[1]); b.fillRect(48, 38, 2, 11, ST[3]); b.hline(30, 48, 20, ST[3]);
      for (const [x, y] of [[33, 40], [45, 41], [34, 45], [47, 45], [31, 47]]) b.hline(x, y, 3, ST[3]);
      b.ellipse(39.5, 43, 4.5, 4.5, W[3]); b.fillRect(35, 43, 10, 6, W[3]);
      b.ellipse(39.5, 43, 3.5, 3.5, W[6]); b.fillRect(36, 43, 8, 6, W[6]);
      if (!pressed) { b.vline(40, 46, 3, P.p1); b.set(40, 45, P.l1); b.set(40, 44, P.l2); }
      // steps down to the approach row (the D tile)
      b.fillRect(31, 49, 18, 2, ST[1]); b.fillRect(31, 51, 18, 2, ST[2]); b.hline(31, 52, 18, ST[3]);
      b.fillRect(29, 53, 22, 2, ST[1]); b.fillRect(29, 55, 22, 2, ST[2]); b.hline(29, 56, 22, ST[3]);

      // ---- the giant spool
      const T5 = A.spool;
      b.ellipse(cx, 34, 10, 3, W[4]); b.ellipse(cx, 33, 10, 3, W[2]); b.ellipse(cx, 32, 9, 2, W[1]);
      for (let x = 32; x <= 48; x++) {
        const t = (x - 32) / 16;
        const k = t < 0.2 ? 1 : t < 0.5 ? 2 : t < 0.8 ? 3 : 4;
        const bottom = 31 + Math.round(2 * (1 - Math.pow((x - cx) / 8.5, 2)));
        for (let y = 18; y <= bottom; y++) {
          let kk = k;
          if (pressed) { if (y % 3 === 0) kk = Math.min(4, k + 1); } else {
            const band = (x + 2 * y) % 6;
            if (band === 0) kk = Math.min(4, k + 1); else if (band === 3) kk = Math.max(0, k - 1);
          }
          b.set(x, y, T5[kk]);
        }
      }
      b.ellipse(cx, 18, 10, 3, W[4]); b.ellipse(cx, 17, 10, 3, W[2]); b.ellipse(cx, 17, 9, 2, W[1]);
      b.ellipse(cx, 17, 2, 1, W[6]);
      b.hline(34, 15, 4, W[0]);

      // ---- lanterns
      const lantern = (lx) => {
        b.vline(lx, 28, 3, W[5]);
        b.hline(lx - 2, 31, 5, W[5]);
        b.ellipse(lx, 35, 3, 3, A.lbody[1]);
        b.vline(lx - 3, 34, 3, A.lbody[0]); b.vline(lx + 3, 34, 3, A.lbody[2]);
        b.hline(lx - 2, 33, 5, A.lbody[2]); b.hline(lx - 2, 37, 5, A.lbody[2]);
        b.ellipse(lx, 35, 1, 2, A.glow);
        b.hline(lx - 2, 39, 5, W[5]);
        b.vline(lx, 40, 3, A.tassel[0]); b.set(lx, 43, A.tassel[1]);
      };
      lantern(8); lantern(71);

      // ---- ribbons hanging from the eaves
      const SWAY = [0, 0, 1, 1, 1, 0, 0, -1, -1, 0, 0, 1, 1, 1, 0, 0];
      const ribbon = (x, pal) => {
        b.fillRect(x - 1, 28, 5, 2, pal[2]); b.hline(x - 1, 28, 5, pal[0]);
        for (let i = 0; i < 16; i++) {
          const xs = x + (pressed ? 0 : SWAY[i]), y = 30 + i;
          b.hline(xs, y, 3, pal[1]); b.set(xs, y, pal[0]); b.set(xs + 2, y, pal[2]);
          if (pressed && (i === 5 || i === 11)) b.hline(xs, y, 3, pal[2]);
          if (!pressed && i >= 13) b.set(xs + 1, y, i === 13 ? pal[2] : wall[1]);
        }
        if (!pressed) { b.set(x + SWAY[15] + 1, 45, wall[1]); }
      };
      ribbon(26, A.rib[0]); ribbon(53, A.rib[1]);

      // ---- thread swags from the lantern cords to the ribbon knots (dead straight when pressed)
      const swag = (x0, x1, y) => {
        const n = x1 - x0;
        for (let i = 0; i <= n; i++) {
          const sag = pressed ? 0 : Math.round(3 * Math.sin((Math.PI * i) / n));
          b.set(x0 + i, y + sag, A.swag[Math.floor(i / 3) % A.swag.length]);
          if (!pressed && i % 5 === 2) b.set(x0 + i, y + sag + 1, A.bead);
        }
      };
      swag(9, 24, 29); swag(56, 70, 29);

      // ---- outline, soft ground shadow, then the loose thread running down to the ground
      K.outer(b, S.omap([[R.slice(0, 5), R[5]], [ST, pressed ? P.n5 : P.c5]], pressed ? P.n5 : W[6]));
      K.shadowRect(b, wl, bot + 1, wr - wl + 1, 2);
      const path = pressed
        ? [[46, 30], [61, 62]]
        : [[46, 30], [48, 35], [51, 43], [53, 50], [56, 55], [60, 57], [63, 55], [62, 52], [59, 53], [58, 57], [61, 60], [66, 60]];
      for (let i = 0; i + 1 < path.length; i++) {
        const [x0, y0] = path[i], [x1, y1] = path[i + 1];
        if (y0 >= 49 || y1 >= 49) b.line(x0, y0 + 1, x1, y1 + 1, A.thread[1]);
      }
      for (let i = 0; i + 1 < path.length; i++) b.line(path[i][0], path[i][1], path[i + 1][0], path[i + 1][1], A.thread[0]);
      return b;
    },
  });
})(typeof globalThis !== 'undefined' ? globalThis : window);
