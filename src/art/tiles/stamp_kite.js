/* src/art/tiles/stamp_kite.js — Route 5, Route 6 and Kite Hill (Chapters 5 and 6): pylons, windsocks, balloons and the hangar, plus the
 * wind terrains.
 *  - gust_e / gust_w / gust_n / gust_s: short grass with pale wind streaks blowing one way (the overworld blows you along them).
 *  - fan_e / fan_w / fan_n / fan_s: the Kite Salon's metal floor with yellow chevrons racing one way (they blow you too), and `deck`,
 *    the same floor with the fans off.
 *  - pylon (1x3, over 2): a lattice power pylon with humming insulators.
 *  - windsock (1x2, over 1): a striped windsock on a pole; it flaps (2 frames).
 *  - balloon (3x4, over 3): a hot-air balloon tied down by its basket. Variants red, blue, yellow (envelope colours), `down` (a
 *    torn envelope slumped over the basket) and `patched` (Dart's: a patchwork of four colours and a flag).
 *  - hangar (9x5): a corrugated-metal hangar with a big sliding door.
 *  - fan (1x1): a wall fan housing; variants `on` (spinning, 2 frames) and `off`.
 * Same rules as every stamp: lit from the top-left, 1px ink outline from S.omap. */
(function (root) {
  'use strict';
  const NP = root.NP;
  const K = NP.art.tiles.kit;
  const S = K.S;
  const { P, col } = K;
  const T = 16;
  const DIRS = { e: [1, 0], w: [-1, 0], n: [0, -1], s: [0, 1] };

  // ============================================================================================ wind terrains
  // A streak is a short pale line with a brighter head, drawn along the wind; four frames move it 4px a frame, so it loops.
  const STREAKS = [[1, 3, 7], [9, 9, 6], [4, 13, 5]];   // [start along, across, length]
  function streaks(b, dir, f, light, mid) {
    const [dx, dy] = DIRS[dir];
    for (const [a0, across, len] of STREAKS) {
      for (let i = 0; i < len; i++) {
        const along = (a0 + f * 4 + i) & 15;
        // "along" runs with the wind: for e/s it grows, for w/n it shrinks
        const a = dx + dy > 0 ? along : 15 - along;
        const x = dx ? a : across, y = dx ? across : a;
        b.set(x, y, i >= len - 2 ? light : mid);
      }
    }
  }
  for (const dir of Object.keys(DIRS)) {
    K.terrain('gust_' + dir, {
      variants: 2, frames: 4, animSpeed: 8, step: 'step', gust: { e: 'right', w: 'left', n: 'up', s: 'down' }[dir],
      paint: (m, f, v) => { const b = K.grassTile(v); streaks(b, dir, f, col('#f4fff0'), col('#c8eab0')); return b; },
    });
  }

  // the Salon's deck: riveted steel plates; the fan lanes carry yellow chevrons
  const DK = ['#9aa4b4', '#b8c2d0', '#7c8698', '#5c6678'].map(col);
  function deck(v) {
    const b = K.B(T, T);
    b.fillRect(0, 0, T, T, DK[0]);
    b.hline(0, 0, T, DK[1]); b.vline(0, 0, T, DK[1]); b.hline(0, 15, T, DK[3]); b.vline(15, 0, T, DK[3]);
    for (const [x, y] of [[2, 2], [13, 2], [2, 13], [13, 13]]) { b.set(x, y, DK[3]); b.set(x - 1, y - 1, DK[1]); }
    if (v) b.hline(4, 8, 8, DK[2]);
    return b;
  }
  K.terrain('deck', { variants: 2, step: 'stone', paint: (m, f, v) => deck(v) });
  const CHEV = ['#f4d040', '#c89a20'].map(col);
  for (const dir of Object.keys(DIRS)) {
    const [dx, dy] = DIRS[dir];
    K.terrain('fan_' + dir, {
      variants: 1, frames: 4, animSpeed: 6, step: 'stone', gust: { e: 'right', w: 'left', n: 'up', s: 'down' }[dir],
      paint: (m, f) => {
        const b = deck(0);
        // two chevrons, 8px apart, moving 2px a frame
        for (let k = 0; k < 2; k++) {
          const a0 = (k * 8 + f * 2) & 15;
          for (let t = -3; t <= 3; t++) {
            const along = (a0 - Math.abs(t) + 16) & 15;
            const a = dx + dy > 0 ? along : 15 - along;
            const x = dx ? a : 8 + t, y = dx ? 8 + t : a;
            b.set(x, y, CHEV[0]);
            const a2 = dx + dy > 0 ? (along - 1 + 16) & 15 : (16 - along) & 15;
            const x2 = dx ? a2 : 8 + t, y2 = dx ? 8 + t : a2;
            b.set(x2, y2, CHEV[1]);
          }
        }
        return b;
      },
    });
  }

  // ============================================================================================ pylon
  K.stamp('pylon', {
    w: 1, h: 3, over: 2, solid: ['.', '.', '#'],
    paint: () => {
      const b = K.B(T, 48);
      const st = [P.n2, P.n3, P.n4];
      // two legs that lean in towards the top, cross-braced
      for (let y = 6; y < 47; y++) {
        const spread = 2 + Math.floor((y - 6) * 5 / 41);
        b.set(7 - spread, y, st[1]); b.set(8 + spread, y, st[2]);
      }
      for (let y = 10; y < 44; y += 6) for (let i = 0; i < 6; i++) {
        const sp = 2 + Math.floor((y + i - 6) * 5 / 41);
        const t = i / 5;
        b.set(Math.round(7 - sp + (2 * sp + 1) * t), y + i, st[0]);
        b.set(Math.round(8 + sp - (2 * sp + 1) * t), y + i, st[1]);
      }
      // cross-arm and insulators, with the cables running off both sides
      b.fillRect(0, 6, 16, 2, st[1]); b.hline(0, 6, 16, st[0]);
      for (const x of [1, 14]) { b.fillRect(x, 8, 1, 3, col('#c8e8f0')); b.set(x, 11, col('#8ab0c0')); }
      b.fillRect(6, 2, 4, 4, st[1]); b.hline(6, 2, 4, st[0]);
      b.set(7, 1, col('#ff6a5a'));                                 // the little warning light on top
      b.fillRect(4, 46, 8, 2, P.c3);                               // footing
      K.outer(b, S.omap([], 'n6'));
      return b;
    },
  });

  // ============================================================================================ windsock
  K.stamp('windsock', {
    w: 1, h: 2, over: 1, solid: ['.', '#'], frames: 2,
    paint: (variant, frame) => {
      const b = K.B(T, 32);
      b.fillRect(2, 2, 2, 28, P.n3); b.vline(2, 2, 28, P.n1);
      b.fillRect(1, 29, 4, 2, P.n4);
      const lift = frame ? 1 : 0;
      for (let i = 0; i < 11; i++) {
        const x = 4 + i, h = 6 - Math.floor(i / 3), y0 = 3 + lift * Math.floor(i / 4) + ((6 - h) >> 1);
        const c = ((i >> 1) & 1) ? col('#f4f4ec') : col('#f06a3a');
        b.fillRect(x, y0, 1, h, c); b.set(x, y0 + h - 1, ((i >> 1) & 1) ? col('#c8c8c0') : col('#b04a2a'));
      }
      K.outer(b, S.omap([], 'n6'));
      return b;
    },
  });

  // ============================================================================================ balloon
  const ENV = { red: ['#f06a5a', '#ff9a80', '#c04a42', '#8a2c34'], blue: ['#5a9ae8', '#8ac0f8', '#3a6ab8', '#24447c'], yellow: ['#f4d050', '#fff090', '#d0a030', '#946c20'] };
  function basket(b, x, y) {
    b.fillRect(x, y, 14, 9, P.o3); b.hline(x, y, 14, P.o1); b.hline(x, y + 8, 14, P.o5);
    for (let yy = y + 2; yy < y + 8; yy += 2) for (let xx = x + ((yy >> 1) & 1); xx < x + 14; xx += 2) b.set(xx, yy, P.o4);
    b.fillRect(x - 1, y - 1, 16, 2, P.o4); b.hline(x - 1, y - 1, 16, P.o2);
  }
  K.stamp('balloon', {
    w: 3, h: 4, over: 3, solid: ['...', '...', '...', '.#.'], variants: ['red', 'blue', 'yellow', 'down', 'patched'],
    paint: (variant) => {
      const v = variant || 'red';
      const b = K.B(48, 64);
      // tie-down ropes to pegs either side (drawn after the outline, so they stay thin)
      const ropes = () => {
        for (let i = 0; i < 12; i++) { b.set(16 - Math.floor(i * 10 / 12), 54 + Math.floor(i * 8 / 12), P.o2); b.set(31 + Math.floor(i * 10 / 12), 54 + Math.floor(i * 8 / 12), P.o2); }
        b.fillRect(5, 61, 2, 3, P.o4); b.fillRect(41, 61, 2, 3, P.o4);
      };
      basket(b, 17, 52);
      if (v === 'down') {
        // the envelope has slumped over the basket like a dropped sheet, with a rip down the middle
        const c = ENV.red.map(col);
        for (let y = 36; y < 54; y++) {
          const half = Math.min(22, 8 + Math.floor((y - 36) * 1.1));
          for (let x = 24 - half; x < 24 + half; x++) {
            const fold = ((x + (y >> 1)) % 9) < 2;
            b.set(x, y, y === 36 + Math.floor((24 - Math.abs(x - 24)) / 6) ? c[1] : fold ? c[2] : c[0]);
          }
        }
        for (let y = 40; y < 52; y++) { b.set(24 + ((y >> 1) & 1), y, P.n6); b.set(25 + ((y >> 1) & 1), y, c[3]); }
        K.outer(b, S.omap([], 'n6'));
        ropes();
        return b;
      }
      const patches = v === 'patched' ? [ENV.red, ENV.blue, ENV.yellow, ['#7ad08a', '#a8f0b0', '#4aa060', '#2a6a40']].map((r) => r.map(col)) : null;
      const c = (ENV[v] || ENV.red).map(col);
      // the envelope: a round top narrowing to the mouth, in vertical gores with shading
      for (let y = 1; y < 44; y++) {
        const t = y / 43;
        const half = y < 24 ? Math.round(Math.sqrt(1 - Math.pow((24 - y) / 23, 2)) * 22) : Math.round(22 - (y - 24) * 0.8);
        for (let x = 24 - half; x < 24 + half; x++) {
          const gore = Math.floor((x - (24 - half)) / Math.max(1, (2 * half) / 6));
          const rr = patches ? patches[(gore + (y > 22 ? 1 : 0)) & 3] : c;
          let cc = (gore & 1) ? rr[2] : rr[0];
          if (x < 24 - half + 3 || (y < 8 && x < 22)) cc = rr[1];
          if (x > 24 + half - 4) cc = rr[3];
          if (patches && y === 22 && (x & 1)) cc = P.p0;               // a stitched seam round the middle
          b.set(x, y, cc);
        }
        if (t > 0.98) break;
      }
      // the gold band and the mouth ropes down to the basket
      b.fillRect(8, 30, 32, 2, P.gd2); b.hline(8, 30, 32, P.gd0);
      for (let y = 42; y < 52; y++) { b.set(16 + Math.floor((y - 42) / 3), y, P.o5); b.set(31 - Math.floor((y - 42) / 3), y, P.o5); }
      if (v === 'patched') {   // Mimi's flag on a little pole off the basket
        b.vline(32, 40, 13, P.n3);
        for (let y = 40; y < 46; y++) b.hline(33, y, 8 - Math.abs(y - 43), y < 43 ? col('#ff7ae0') : col('#6af0ff'));
      }
      K.outer(b, S.omap([], 'n6'));
      ropes();
      return b;
    },
  });

  // ============================================================================================ hangar
  const OPT_HANGAR = () => ({
    w: 9, h: 5, rise: 20, ramp: K.ramp('gray'), roofTop: 2, roofBottom: 34, inset: 6, doorCol: 4, doorW: 44, doorH: 46,
    wall: { base: '#b8c4d0', hi: '#d8e2ec', sh: '#98a4b4', dk: '#6c7888' },
    doorFn: (b, x, y, w, h) => {
      b.fillRect(x - 2, y - 2, w + 4, h + 2, P.n5);
      b.fillRect(x, y, w, h, col('#8a94a6'));
      for (let yy = y + 3; yy < y + h; yy += 5) { b.hline(x, yy, w, col('#6a7486')); b.hline(x, yy + 1, w, col('#a4aec0')); }
      b.vline(x + (w >> 1), y, h, P.n5);
      b.fillRect(x + (w >> 1) - 4, y + (h >> 1), 3, 6, P.n4); b.fillRect(x + (w >> 1) + 2, y + (h >> 1), 3, 6, P.n4);
    },
    windows: [],
    extras: (b, ctx) => {
      const { W, H, rb } = ctx;
      // corrugated walls: vertical ribs either side of the door
      for (let x = 5; x < W - 5; x += 3) if (x < 66 || x > 78 + 0) for (let y = rb + 4; y < H - 4; y++) if (b.get(x, y) === col('#b8c4d0')) b.set(x, y, col('#a0acbc'));
      // a big number on the front, and a windsock painted on the roof edge
      const NUM = ['###.', '...#', '.##.', '#...', '####'];
      NUM.forEach((row, yy) => { for (let xx = 0; xx < 4; xx++) if (row[xx] === '#') b.fillRect(12 + xx * 3, rb + 10 + yy * 3, 3, 3, col('#f06a3a')); });
      S.window(b, 112, rb + 10, 16, 10);
    },
    outlineExtra: [],
  });
  K.stamp('hangar', {
    w: 9, h: 5, rise: 20, solid: ['#########', '#########', '#########', '#########', '####D####'],
    paint: () => S.house(OPT_HANGAR()),
    vol: () => S.houseVol(OPT_HANGAR()),
  });

  // ============================================================================================ cable reel
  // a wooden cable drum lying on its side, wound with black cable (the Pressers' "maintenance" line on Route 5)
  K.stamp('cable_reel', {
    w: 1, h: 1, solid: ['#'],
    paint: () => {
      const b = K.B(T, T);
      b.fillRect(1, 3, 3, 12, P.o3); b.vline(1, 3, 12, P.o2); b.fillRect(12, 3, 3, 12, P.o4); b.vline(14, 3, 12, P.o5);
      b.fillRect(4, 5, 8, 8, col('#2a2a34'));
      for (let y = 6; y < 13; y += 2) b.hline(4, y, 8, col('#4a4a58'));
      b.hline(4, 5, 8, col('#5a5a6a'));
      b.fillRect(12, 10, 4, 1, col('#2a2a34'));                    // the loose end trailing off
      K.outer(b, S.omap([], 'n6'));
      return b;
    },
  });

  // ============================================================================================ wall fan
  K.stamp('fan', {
    w: 1, h: 1, solid: ['#'], variants: ['on', 'off'], frames: 2,
    paint: (variant, frame) => {
      const b = K.B(T, T);
      b.fillRect(1, 1, 14, 14, P.n4); b.fillRect(2, 2, 12, 12, P.n5);
      b.circle(8, 8, 5, P.n3, true);
      const on = variant !== 'off';
      const blades = on && frame ? [[0, -4], [4, 0], [0, 4], [-4, 0]] : [[-3, -3], [3, -3], [3, 3], [-3, 3]];
      for (const [dx, dy] of blades) { b.set(8 + dx, 8 + dy, P.n1); b.set(8 + (dx >> 1), 8 + (dy >> 1), P.n2); }
      b.set(8, 8, on ? col('#f4d040') : P.n4);
      b.hline(1, 1, 14, P.n2);
      K.outer(b, S.omap([], 'n6'));
      return b;
    },
  });
})(typeof globalThis !== 'undefined' ? globalThis : window);
