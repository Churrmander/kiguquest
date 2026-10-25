/* src/art/tiles/stamp_arcade.js — furniture for the Lucky Spool arcade in Shibuyarn (Chapter 5).
 *   arcade_cab   1x2  upright cabinet; variants = the game on it: moth button steam hop, plus off / <game>_off (dark during the brownout)
 *   claw_machine 2x2  glass case of plushes with a pink frame and a chasing light strip; variants default off
 *   prize_shelf  2x2  wall shelving full of prizes (plushes, boxed toys); stands on the two wall rows like cloth_shelf
 *   neon_sign    2x1  wall decor: a pink-and-blue neon spool sign; variants default off
 * and one terrain:
 *   arcade_carpet     classic arcade carpet: dark navy with neon confetti (pink zigzags, cyan rings, yellow stars); 4 variants
 * Cabinets and the claw machine animate (2 frames) so the room flickers like a real arcade. */
(function (root) {
  'use strict';
  const NP = root.NP;
  const K = NP.art.tiles.kit;
  const S = K.S;
  const { P } = K;

  const INK = P.ink;
  const GAMES = {
    moth: { body: 'navy', marquee: 'mint', screen: '#100c28' },
    button: { body: 'purple', marquee: 'orange', screen: '#141028' },
    steam: { body: 'teal', marquee: 'sky', screen: '#120c20' },
    hop: { body: 'red', marquee: 'yellow', screen: '#88c8f8' },
    off: { body: 'gray', marquee: 'gray', screen: '#202028' },
  };

  /** tiny 10x8 screen pictures, one per game, two frames */
  function screenArt(b, v, f, x, y) {
    const px = (xx, yy, c) => b.set(x + xx, y + yy, K.col(c));
    if (v === 'moth') {
      for (let i = 0; i < 3; i++) { const mx = 1 + i * 3 + f; px(mx, 1, '#f8b048'); px(mx + 1, 1, '#f8b048'); px(mx, 3, '#a8f0c8'); px(mx + 1, 3, '#a8f0c8'); }
      px(5, 7, '#f08838'); px(4, 7, '#f08838'); px(5, 5 - f, '#ffffff');
    } else if (v === 'button') {
      for (let xx = 0; xx < 10; xx++) { px(xx, 0, '#4868a8'); px(xx, 1, ((xx >> 1) & 1) ? '#e85870' : '#f8f0f0'); px(xx, 2, '#58c890'); }
      px(3 + f * 3, 5, '#f8b048'); px(3, 7, '#b8c0d0'); px(4, 7, '#b8c0d0'); px(5, 7, '#b8c0d0');
    } else if (v === 'steam') {
      for (let xx = 0; xx < 10; xx++) { px(xx, 0, '#5a2c78'); px(xx, 7, '#5a2c78'); }
      px(0, 3, '#5a2c78'); px(9, 3, '#5a2c78'); px(4, 3, '#5a2c78'); px(5, 3, '#5a2c78');
      for (let xx = 1; xx < 9; xx += 2) px(xx, 1, '#f8e0a0');
      px(2 + f * 2, 5, '#fffaf0'); px(3 + f * 2, 5, '#fffaf0'); px(7 - f, 5, '#78b8f8');
    } else if (v === 'hop') {
      for (let xx = 0; xx < 10; xx++) { px(xx, 6, '#e0d4c4'); px(xx, 7, '#a89888'); }
      px(5, 6, '#88c8f8'); px(6, 6, '#88c8f8'); px(5, 7, '#88c8f8'); px(6, 7, '#88c8f8');
      px(2 + f, 4 - f, '#f08838'); px(2 + f, 5 - f, '#f08838'); px(8, 2, '#f8c848');
    } else {
      px(1, 1, '#3a3a48'); px(2, 1, '#3a3a48');
    }
  }

  // classic arcade carpet; every motif stays inside its own tile so any variant sits next to any other
  const CONFETTI = [
    [['z', 2, 3], ['o', 11, 11]],
    [['s', 11, 3], ['z', 3, 11]],
    [['o', 4, 5], ['s', 12, 12]],
    [['z', 9, 6], ['o', 3, 12]],
  ];
  K.terrain('arcade_carpet', {
    variants: 4, step: 'step',
    paint: (m, f, v) => {
      const b = K.B(16, 16);
      b.fillRect(0, 0, 16, 16, K.col('#1c1838'));
      for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) if (((x * 5 + y * 3 + v) % 13) === 0) b.set(x, y, K.col('#262048'));
      for (const [k, x, y] of CONFETTI[v & 3]) {
        if (k === 'z') { const c = K.col('#b85098'); b.set(x, y, c); b.set(x + 1, y + 1, c); b.set(x + 2, y, c); b.set(x + 3, y + 1, c); }
        else if (k === 'o') { const c = K.col('#48a8c0'); b.set(x, y - 1, c); b.set(x - 1, y, c); b.set(x + 1, y, c); b.set(x, y + 1, c); }
        else { const c = K.col('#d8b048'); b.set(x, y - 1, c); b.set(x - 1, y, c); b.set(x, y, K.col('#f8e098')); b.set(x + 1, y, c); b.set(x, y + 1, c); }
      }
      return b;
    },
  });

  K.stamp('arcade_cab', {
    w: 1, h: 2, variants: ['moth', 'button', 'steam', 'hop', 'off', 'button_off', 'steam_off', 'hop_off'], frames: 2, animSpeed: 22,
    paint: (v, f) => {
      const b = K.B(16, 32);
      // '<game>_off' is that cabinet during the brownout: its own colours one shade darker, marquee and screen dead
      const lit = !/off$/.test(v), base = v.replace(/_off$/, '');
      const g = GAMES[base] || GAMES.off, m = K.ramp(lit ? g.marquee : 'gray');
      const r0 = K.ramp(g.body), r = lit ? r0 : r0.map((c, i) => r0[Math.min(r0.length - 1, i + 1)]);
      // side panels and body
      b.fillRect(1, 2, 14, 29, r[3]);
      b.fillRect(1, 2, 2, 29, r[2]); b.vline(1, 2, 29, r[1]);
      b.fillRect(13, 2, 2, 29, r[4]);
      // marquee
      b.fillRect(2, 1, 12, 6, lit ? m[1] : m[3]);
      b.hline(2, 1, 12, lit ? m[0] : m[2]); b.hline(2, 6, 12, r[5]);
      if (lit) { for (let x = 4; x < 12; x += 2) b.set(x, 3 + ((x >> 1) & 1), m[4]); b.hline(4, 4, 8, m[3]); }
      // screen bezel and screen
      b.fillRect(2, 8, 12, 11, P.black); b.fillRect(3, 9, 10, 9, K.col(lit ? g.screen : '#202028'));
      if (lit) { screenArt(b, v, f, 3, 10); b.set(3, 9, K.col('#ffffff')); b.set(4, 9, K.col('#9098b0')); }
      // control deck
      b.fillRect(1, 19, 14, 4, r[2]); b.hline(1, 19, 14, r[1]); b.hline(1, 22, 14, r[4]);
      b.fillRect(4, 18, 2, 2, P.red2); b.set(4, 18, P.red1); b.vline(5, 20, 1, P.n3);   // stick
      b.set(9, 20, P.yl2); b.set(11, 20, P.bl2);
      // coin door with two lit slots
      b.fillRect(4, 24, 8, 6, r[4]); b.strokeRect(4, 24, 8, 6, r[5]);
      b.fillRect(6, 25, 1, 3, lit ? P.yl2 : P.n4); b.fillRect(9, 25, 1, 3, lit ? P.yl2 : P.n4);
      b.hline(1, 30, 14, r[5]);
      K.outer(b, INK);
      return b;
    },
  });

  K.stamp('claw_machine', {
    w: 2, h: 2, variants: ['default', 'off'], frames: 2, animSpeed: 14,
    paint: (v, f) => {
      const b = K.B(32, 32);
      const pk = K.ramp('pink'), lit = v !== 'off';
      // frame
      b.fillRect(1, 1, 30, 30, pk[2]);
      b.fillRect(1, 1, 30, 5, pk[1]); b.hline(1, 1, 30, pk[0]);
      for (let i = 0; i < 7; i++) b.fillRect(3 + i * 4, 3, 2, 1, lit && ((i + f) & 1) ? P.yl1 : pk[3]);
      // glass with plushes
      b.fillRect(3, 7, 26, 15, K.col('#3a2858'));
      const pl = [['#f08838', '#fff4e0'], ['#80d8b0', '#e0fff0'], ['#78acf8', '#e8f8ff'], ['#fcd868', '#fffce0'], ['#c4a0ec', '#f8e8ff']];
      pl.forEach(([c1, c2], i) => {
        const x = 5 + i * 5, y = 16 + ((i & 1) ? -2 : 0);
        b.fillRect(x, y, 4, 4, K.col(c1)); b.fillRect(x + 1, y + 1, 2, 2, K.col(c2)); b.set(x, y - 1, K.col(c1)); b.set(x + 3, y - 1, K.col(c1));
      });
      b.fillRect(3, 20, 26, 2, K.col('#5a3a78'));
      // claw
      b.vline(17 - f * 2, 7, 3, P.n2); b.fillRect(15 - f * 2, 10, 5, 2, P.n2); b.set(15 - f * 2, 12, P.n3); b.set(19 - f * 2, 12, P.n3);
      // glass shine
      b.line(5, 8, 9, 8, K.alpha('#ffffff', 140)); b.line(24, 9, 27, 12, K.alpha('#ffffff', 110));
      // control panel + prize hatch
      b.fillRect(1, 22, 30, 9, pk[3]); b.hline(1, 22, 30, pk[1]);
      b.fillRect(4, 24, 9, 5, P.ink); b.fillRect(5, 25, 7, 3, K.col('#2a1838'));
      b.fillRect(18, 24, 3, 3, P.red2); b.set(18, 24, P.red1); b.fillRect(24, 25, 3, 2, P.yl2);
      b.hline(1, 30, 30, pk[4]);
      K.outer(b, INK);
      K.shadow(b, 16, 31, 13, 1);
      return b;
    },
  });

  K.stamp('prize_shelf', {
    w: 2, h: 2,
    paint: () => {
      const b = K.B(32, 32);
      // white shelving against the wall with three boards of prizes
      b.fillRect(1, 1, 30, 31, K.col('#f4eef8'));
      for (const x of [1, 29]) { b.fillRect(x, 1, 2, 31, K.col('#c8bcd8')); b.vline(x, 1, 31, K.col('#e8e0f0')); }
      b.fillRect(1, 1, 30, 2, K.col('#c8bcd8'));
      for (const y of [11, 21, 30]) { b.fillRect(1, y, 30, 2, K.col('#b8a8cc')); b.hline(1, y, 30, K.col('#ece4f4')); }
      // row 1: three plushes
      const heads = [['#f08838', '#fff4e0'], ['#78acf8', '#e8f8ff'], ['#80d8b0', '#e0fff0']];
      heads.forEach(([c1, c2], i) => {
        const x = 4 + i * 9;
        b.fillRect(x, 4, 7, 7, K.col(c1)); b.fillRect(x + 1, 6, 5, 4, K.col(c2)); b.set(x + 2, 7, P.ink); b.set(x + 4, 7, P.ink);
        b.set(x, 3, K.col(c1)); b.set(x + 6, 3, K.col(c1));
      });
      // row 2: boxed toys
      ['red', 'yellow', 'blue'].forEach((n, i) => { const r = K.ramp(n), x = 4 + i * 9; b.fillRect(x, 14, 7, 7, r[2]); b.hline(x, 14, 7, r[1]); b.fillRect(x + 2, 16, 3, 3, P.white); b.vline(x + 6, 14, 7, r[3]); });
      // row 3: spools of fancy thread and a trophy
      ['pink', 'mint', 'lilac'].forEach((n, i) => { const r = K.ramp(n), x = 4 + i * 6; b.fillRect(x, 24, 4, 6, r[2]); b.hline(x - 1, 23, 6, P.o2); b.hline(x - 1, 29, 6, P.o2); b.vline(x + 1, 24, 6, r[1]); });
      const gd = K.ramp('gold');
      b.fillRect(23, 23, 5, 4, gd[2]); b.hline(23, 23, 5, gd[1]); b.fillRect(25, 27, 1, 2, gd[3]); b.fillRect(24, 29, 3, 1, gd[3]);
      K.outer(b, S.omap([], 'ink'));
      return b;
    },
  });

  K.stamp('neon_sign', {
    w: 2, h: 1, variants: ['default', 'off'], frames: 2, animSpeed: 30,
    paint: (v, f) => {
      const b = K.B(32, 16);
      const on = v !== 'off';
      b.fillRect(1, 2, 30, 12, K.col('#1c1430'));
      b.strokeRect(1, 2, 30, 12, K.col(on ? '#f878c8' : '#4a3050'));
      // a spool (left) and a wavy thread running off it
      const c1 = K.col(on ? '#78e8f8' : '#284858'), c2 = K.col(on ? (f ? '#f8f0a0' : '#f878c8') : '#4a3050');
      b.strokeRect(5, 5, 6, 6, c1); b.hline(3, 5, 10, c1); b.hline(3, 10, 10, c1);
      for (let x = 12; x < 28; x++) b.set(x, 8 + Math.round(Math.sin(x / 2) * 2), c2);
      if (on) b.set(26, 4, K.col('#ffffff'));
      K.outer(b, INK);
      return b;
    },
  });
})(typeof globalThis !== 'undefined' ? globalThis : window);
