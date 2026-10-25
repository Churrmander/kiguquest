/* src/art/tiles/stamp_city.js — Shibuyarn (Chapter 5): city shops, the station, vending machines, the capsule-toy wall and neon
 * sign poles, plus the road terrains `asphalt` and `zebra` (a crossing; stripes run across a road that runs east-west) and
 * `zebra_v` (for a road running north-south).
 *  - city_shop (5x4): a narrow two-storey shop with a flat roof, a sign band and a striped awning. Variants are the shop types
 *    (konbini, arcade, fabric, ramen, toys, flats); each has an `_off` twin with the sign unlit, for the brownout (L.variantByFlag).
 *  - station (9x5): Shibuyarn Station, with a clock and wide glass doors.
 *  - vending (1x2, over 1): a drinks machine; variants red, blue, white (+ `_off`).
 *  - capsule_wall (2x2): a double row of capsule-toy machines.
 *  - neon_pole (1x2, over 1): a vertical neon sign; variants pink, cyan, yellow (+ `_off`).
 * Same rules as every stamp: lit from the top-left, 1px ink outline from S.omap, door 'D' tile in the bottom row of buildings. */
(function (root) {
  'use strict';
  const NP = root.NP;
  const K = NP.art.tiles.kit;
  const S = K.S;
  const { P, col } = K;
  const T = 16;

  // ---- a 3x5 sign font (2px strokes on the big signs, so they hold up in the 3D view)
  const F = {
    A: ['.#.', '#.#', '###', '#.#', '#.#'], B: ['##.', '#.#', '##.', '#.#', '##.'], C: ['.##', '#..', '#..', '#..', '.##'], D: ['##.', '#.#', '#.#', '#.#', '##.'],
    E: ['###', '#..', '##.', '#..', '###'], F: ['###', '#..', '##.', '#..', '#..'], G: ['.##', '#..', '#.#', '#.#', '.##'], H: ['#.#', '#.#', '###', '#.#', '#.#'],
    I: ['###', '.#.', '.#.', '.#.', '###'], K: ['#.#', '##.', '#..', '##.', '#.#'], L: ['#..', '#..', '#..', '#..', '###'], M: ['#...#', '##.##', '#.#.#', '#...#', '#...#'],
    N: ['#..#', '##.#', '#.##', '#..#', '#..#'], O: ['.#.', '#.#', '#.#', '#.#', '.#.'], P: ['##.', '#.#', '##.', '#..', '#..'], R: ['##.', '#.#', '##.', '#.#', '#.#'],
    S: ['.##', '#..', '.#.', '..#', '##.'], T: ['###', '.#.', '.#.', '.#.', '.#.'], U: ['#.#', '#.#', '#.#', '#.#', '###'], Y: ['#.#', '#.#', '.#.', '.#.', '.#.'],
    W: ['#.#', '#.#', '###', '###', '#.#'], ' ': ['..', '..', '..', '..', '..'],
  };
  const textW = (s, k) => s.split('').reduce((n, ch) => n + (F[ch][0].length + 1) * k, -k);
  function text(b, x, y, s, c, sh, k) {
    for (const ch of s) {
      const g = F[ch];
      for (let yy = 0; yy < 5; yy++) for (let xx = 0; xx < g[yy].length; xx++) if (g[yy][xx] === '#') {
        if (sh) b.fillRect(x + xx * k + 1, y + yy * k + 1, k, k, sh);
        b.fillRect(x + xx * k, y + yy * k, k, k, c);
      }
      x += (g[0].length + 1) * k;
    }
  }

  // ---- shop types: wall colours, the sign (text, band colour, lit colour), the awning colours
  const SHOPS = {
    konbini: { wall: ['#f8f8f4', '#ffffff', '#dcdce4', '#b8bccc'], sign: 'KONBINI', band: '#2a8a5a', lit: '#f4fff0', glow: '#8af0b0', awn: ['#ffffff', '#2a8a5a'] },
    arcade: { wall: ['#6a4a9a', '#8a6abc', '#4e3478', '#3a2458'], sign: 'ARCADE', band: '#1e1430', lit: '#ff7ae0', glow: '#ff7ae0', awn: ['#ff7ae0', '#3a2458'] },
    fabric: { wall: ['#f4e4c8', '#fff4dc', '#dcc8a4', '#b8a07c'], sign: 'FABRIC', band: '#b83848', lit: '#fff0e0', glow: '#ffb0a0', awn: ['#fff4e8', '#e05450'] },
    ramen: { wall: ['#d85a4a', '#f07a62', '#b0403a', '#88283c'], sign: 'RAMEN', band: '#2a1a1a', lit: '#ffd860', glow: '#ffd860', awn: ['#f4e4c8', '#2a1a1a'] },
    toys: { wall: ['#f8d870', '#fff0a0', '#e0b44a', '#b88a30'], sign: 'TOYS', band: '#3c60c0', lit: '#ffffff', glow: '#a0d0ff', awn: ['#ffffff', '#5484e4'] },
    flats: { wall: ['#c8d0dc', '#e0e6ee', '#a8b0c0', '#8890a4'], sign: null, band: '#787c94', lit: '#c4c8d4', glow: null, awn: ['#c4c8d4', '#787c94'] },
  };
  const SHOP_VARIANTS = Object.keys(SHOPS).flatMap((k) => [k, k + '_off']);
  const solidRows = (w, h, doorCol) => {
    const rows = [];
    for (let y = 0; y < h; y++) rows.push(y === h - 1 ? '#'.repeat(doorCol) + 'D' + '#'.repeat(w - doorCol - 1) : '#'.repeat(w));
    return rows;
  };

  /** glass shop window with a diagonal glint and a dark frame */
  function glass(b, x, y, w, h) {
    b.fillRect(x - 1, y - 1, w + 2, h + 2, P.n5);
    b.fillRect(x, y, w, h, P.gl3);
    b.fillRect(x, y, w, 1, P.gl1);
    for (let yy = 0; yy < h; yy++) { const xx = w - 6 - yy; if (xx >= 0) { b.set(x + xx, y + yy, P.gl2); if (xx + 1 < w) b.set(x + xx + 1, y + yy, P.gl2); } }
  }
  /** a sign band across the wall: dark band, rim, letters (lit or unlit), a soft glow line under it when lit */
  function signBand(b, x, y, w, h, s, lit, on) {
    const band = col(s.band), rim = col(s.wall[3]);
    b.fillRect(x, y, w, h, rim); b.fillRect(x + 1, y + 1, w - 2, h - 2, band);
    if (!s.sign) return;
    const k = textW(s.sign, 2) <= w - 6 ? 2 : 1;
    const tw = textW(s.sign, k);
    const ty = y + ((h - 5 * k) >> 1);
    text(b, x + ((w - tw) >> 1), ty, s.sign, on ? col(s.lit) : col('#6a6878'), on ? null : col('#2a2834'), k);
    if (on && s.glow) b.hline(x + 2, y + h, w - 4, col(s.glow));
  }

  const OPT_SHOP = (variant, mode) => {
    const name = String(variant || 'konbini').replace(/_off$/, '');
    const on = !/_off$/.test(variant || '');
    const s = SHOPS[name] || SHOPS.konbini;
    return {
      w: 5, h: 4, rise: 40, ramp: K.ramp('gray'), roofTop: 6, roofBottom: 11, inset: 1, doorCol: 2, doorW: 22, doorH: 34,
      wall: { base: s.wall[0], hi: s.wall[1], sh: s.wall[2], dk: s.wall[3] },
      doorFn: (b, x, y, w, h) => {
        b.fillRect(x - 2, y - 2, w + 4, h + 2, P.n5);
        b.fillRect(x, y, w, h, P.gl3);
        b.vline(x + (w >> 1), y, h, P.n4);
        b.fillRect(x, y, w, 1, P.gl1);
        for (let yy = 0; yy < h; yy++) { const xx = 8 - (yy >> 1); if (xx >= 0) b.set(x + xx, y + yy, P.gl2); }
      },
      windows: [],
      extras: (b, ctx) => {
        const { W, H, rb } = ctx;
        const wall = col(s.wall[0]), wsh = col(s.wall[2]);
        // flat, clean wall (no cottage speckle)
        b.fillRect(3, rb + 1, W - 6, H - rb - 4, wall);
        b.fillRect(3, rb + 1, W - 6, 2, col(s.wall[3])); b.hline(3, rb + 3, W - 6, wsh);
        b.vline(3, rb + 1, H - rb - 4, col(s.wall[1])); b.vline(W - 4, rb + 1, H - rb - 4, wsh);
        // rooftop: a water tank or an air-con box
        if (name === 'flats' || name === 'ramen') { b.fillRect(54, 0, 14, 7, P.n3); b.fillRect(54, 0, 14, 1, P.n1); b.fillRect(55, 7, 2, 2, P.n4); b.fillRect(65, 7, 2, 2, P.n4); }
        else { b.fillRect(10, 1, 12, 6, P.st2); b.fillRect(10, 1, 12, 1, P.st0); for (let x = 12; x < 20; x += 2) b.vline(x, 2, 4, P.st4); }
        // upper floor: two windows (flats: three, with balconies)
        const wins = name === 'flats' ? [8, 32, 56] : [10, 52];
        for (const wx of wins) {
          const ww = name === 'flats' ? 16 : 18;
          glass(b, wx, rb + 9, ww, 15);
          b.fillRect(wx - 2, rb + 25, ww + 4, 2, col(s.wall[3]));
          if (name === 'flats') { for (let x = wx - 1; x < wx + ww + 1; x += 3) b.vline(x, rb + 20, 6, P.n3); b.hline(wx - 2, rb + 20, ww + 4, P.n2); }
        }
        if (name === 'arcade' && on) {   // a neon heart between the arcade's windows
          const hc = col(s.glow);
          const heart = ['.##.##.', '#######', '#######', '.#####.', '..###..', '...#...'];
          heart.forEach((row, yy) => { for (let xx = 0; xx < row.length; xx++) if (row[xx] === '#') b.set(37 + xx, rb + 13 + yy, hc); });
        }
        // the sign band over the ground floor, then the awning and the shopfront
        signBand(b, 5, 52, W - 10, 14, s, s.glow, on);
        if (mode !== '3d') S.awning(b, 6, 67, W - 12, 3, col(s.awn[0]), col(s.awn[1]), [col(s.awn[0]), col(s.awn[1]), col(s.awn[1]), col(s.awn[0])]);
        glass(b, 6, 74, 22, 24); glass(b, W - 28, 74, 22, 24);
        // what's in the windows
        const goods = { konbini: ['#f06a5a', '#5ab4e8', '#f4d84a'], arcade: ['#ff7ae0', '#6af0ff', '#f4d84a'], fabric: ['#e05450', '#f4c8d8', '#5ab4e8'],
          ramen: ['#f4e4c8', '#c8784a', '#f4e4c8'], toys: ['#f4a8c8', '#8ad8e8', '#f4d84a'], flats: ['#dcdce4', '#c4c8d4', '#dcdce4'] }[name];
        for (const gx of [8, W - 26]) for (let q = 0; q < 3; q++) {
          const c = col(goods[q]);
          b.fillRect(gx + 1 + q * 6, 88, 5, 9, c); b.hline(gx + 1 + q * 6, 88, 5, P.p0); b.vline(gx + 5 + q * 6, 89, 8, wsh);
        }
        b.fillRect(4, 98, W - 8, 2, col(s.wall[3]));
      },
      outlineExtra: [[[P.gl1, P.gl2, P.gl3], P.gl5], [[P.n1, P.n2, P.n3, P.n4], P.n6]],
    };
  };
  K.stamp('city_shop', {
    w: 5, h: 4, rise: 40, solid: solidRows(5, 4, 2), variants: SHOP_VARIANTS,
    paint: (variant, f, mode) => S.house(OPT_SHOP(variant, mode)),
    vol: (variant) => Object.assign(S.houseVol(OPT_SHOP(variant, '3d')), {
      awnings: [{ x0: 6, x1: 74, y: 67, h: 3, c1: col((SHOPS[String(variant || 'konbini').replace(/_off$/, '')] || SHOPS.konbini).awn[0]),
        c2: col((SHOPS[String(variant || 'konbini').replace(/_off$/, '')] || SHOPS.konbini).awn[1]), edge: [P.p0, P.p3, P.p2, P.p1] }],
    }),
  });

  // ============================================================================================ station
  const OPT_STATION = (mode) => ({
    w: 9, h: 5, rise: 44, ramp: K.ramp('teal'), roofTop: 10, roofBottom: 24, inset: 4, doorCol: 4, doorW: 34, doorH: 38,
    wall: { base: '#ece4d4', hi: '#fff8ec', sh: '#d4c8b0', dk: '#a8987c' },
    doorFn: (b, x, y, w, h) => {
      b.fillRect(x - 2, y - 2, w + 4, h + 2, P.n5);
      for (const hx of [x, x + (w >> 1) + 1]) {
        const hw = (w >> 1) - 1;
        b.fillRect(hx, y, hw, h, P.gl3); b.fillRect(hx, y, hw, 1, P.gl1);
        for (let yy = 0; yy < h; yy++) { const d = 10 - (yy >> 1); if (d >= 0 && d < hw) b.set(hx + d, y + yy, P.gl2); }
      }
    },
    windows: [],
    extras: (b, ctx) => {
      const { W, H, rb } = ctx;
      // the clock in the gable
      const cx = W >> 1, cy = 16;
      b.circle(cx, cy, 8, P.n5, true); b.circle(cx, cy, 7, P.p0, true);
      b.vline(cx, cy - 5, 5, P.n5); b.hline(cx, cy, 4, P.n5);
      for (const [dx, dy] of [[0, -6], [6, 0], [0, 6], [-6, 0]]) b.set(cx + dx, cy + dy, P.n4);
      // arched windows along the front
      for (const wx of [10, 30, 102, 122]) {
        glass(b, wx, rb + 14, 14, 26);
        b.fillRect(wx, rb + 12, 14, 2, col('#a8987c'));
      }
      // the name board over the doors
      b.fillRect(36, rb + 12, 72, 16, col('#1e6478')); b.fillRect(37, rb + 13, 70, 14, col('#2c8c9c'));
      const name = 'SHIBUYARN';
      text(b, 36 + ((72 - textW(name, 2)) >> 1), rb + 15, name, P.p0, col('#123c4c'), 2);
      // platform canopy posts either side
      for (const px of [4, W - 8]) { b.fillRect(px, rb + 1, 4, H - rb - 4, col('#a8987c')); b.vline(px, rb + 1, H - rb - 4, col('#d4c8b0')); }
      if (mode !== '3d') S.awning(b, 8, rb + 44, W - 16, 3, col('#ffffff'), col('#40b4bc'), [P.p0, col('#2c8c9c'), col('#1e6478'), col('#ffffff')]);
    },
    outlineExtra: [[[P.gl1, P.gl2, P.gl3], P.gl5]],
  });
  K.stamp('station', {
    w: 9, h: 5, rise: 44, solid: solidRows(9, 5, 4),
    paint: (variant, f, mode) => S.house(OPT_STATION(mode)),
    vol: () => S.houseVol(OPT_STATION('3d')),
  });

  // ============================================================================================ vending machine
  const VEND = { red: ['#e8584a', '#ff8a70', '#b0403a', '#7a2a2a'], blue: ['#4a8ad8', '#7ab0f0', '#3060a8', '#1e3c70'], white: ['#f4f4f8', '#ffffff', '#c8ccd8', '#8c90a8'] };
  K.stamp('vending', {
    w: 1, h: 2, over: 1, solid: ['.', '#'], variants: Object.keys(VEND).flatMap((k) => [k, k + '_off']),
    paint: (variant) => {
      const name = String(variant || 'red').replace(/_off$/, ''), on = !/_off$/.test(variant || '');
      const c = VEND[name].map(col);
      const b = K.B(T, 32);
      b.fillRect(1, 4, 14, 27, c[0]); b.vline(1, 4, 27, c[1]); b.vline(14, 4, 27, c[2]); b.hline(1, 4, 14, c[1]);
      // the lit window of cans
      b.fillRect(3, 6, 10, 11, on ? col('#e8f8ff') : col('#5a6070'));
      const cans = ['#e05450', '#f4d84a', '#5ab4e8', '#54ac5c', '#f48c40'];
      for (let r = 0; r < 2; r++) for (let q = 0; q < 3; q++) {
        const cc = col(cans[(r * 3 + q) % 5]);
        b.fillRect(4 + q * 3, 7 + r * 5, 2, 4, on ? cc : col('#4a4e5c'));
        if (on) b.set(4 + q * 3, 7 + r * 5, P.p0);
      }
      b.fillRect(3, 18, 10, 2, c[3]);                          // buttons
      for (let q = 0; q < 3; q++) b.set(4 + q * 3, 18, on ? col('#8af0b0') : c[2]);
      b.fillRect(9, 21, 3, 3, c[3]); b.set(10, 22, P.n5);       // coin slot
      b.fillRect(3, 26, 10, 3, P.n5); b.hline(3, 26, 10, P.n3); // the tray
      b.fillRect(0, 31, 16, 1, col('#00000040'));
      K.outer(b, S.omap([[c.slice(0, 3), c[3]]], 'n6'));
      return b;
    },
  });

  // ============================================================================================ capsule-toy wall
  K.stamp('capsule_wall', {
    w: 2, h: 2, over: 1, solid: ['..', '##'],
    paint: () => {
      const b = K.B(32, 32);
      const tops = ['#f4a8c8', '#8ad8e8', '#f4d84a', '#b0f0d0'];
      for (let r = 0; r < 2; r++) for (let q = 0; q < 4; q++) {
        const x = 1 + q * 8, y = 2 + r * 14;
        const top = col(tops[(q + r) % 4]);
        b.fillRect(x, y, 7, 6, P.gl3); b.fillRect(x, y, 7, 1, P.gl1);       // the clear dome
        b.circle(x + 2, y + 3, 1, top, true); b.set(x + 5, y + 4, col(tops[(q + r + 1) % 4]));
        b.fillRect(x, y + 6, 7, 6, top); b.vline(x, y + 6, 6, P.p0); b.vline(x + 6, y + 6, 6, P.p3);
        b.circle(x + 3, y + 8, 1, P.p0, true); b.set(x + 3, y + 8, P.n4);    // the crank
        b.fillRect(x + 2, y + 10, 3, 2, P.n5);                              // the chute
      }
      b.fillRect(0, 30, 32, 2, col('#00000040'));
      K.outer(b, S.omap([[[P.gl1, P.gl2, P.gl3], P.gl5]], 'n6'));
      return b;
    },
  });

  // ============================================================================================ neon sign pole
  const NEON = { pink: '#ff7ae0', cyan: '#6af0ff', yellow: '#ffe060' };
  K.stamp('neon_pole', {
    w: 1, h: 2, over: 1, solid: ['.', '#'], variants: Object.keys(NEON).flatMap((k) => [k, k + '_off']),
    paint: (variant) => {
      const name = String(variant || 'pink').replace(/_off$/, ''), on = !/_off$/.test(variant || '');
      const b = K.B(T, 32);
      b.fillRect(7, 18, 2, 12, P.n4); b.vline(7, 18, 12, P.n2); b.fillRect(5, 29, 6, 2, P.n4);
      b.fillRect(2, 1, 12, 18, col('#1e1430')); b.fillRect(3, 2, 10, 16, col('#2a2040'));
      const c = on ? col(NEON[name]) : col('#5a5468');
      // a little vertical sign: three blocky glyphs, the way the city's signs read top to bottom
      const glyphs = [['###', '#.#', '###'], ['#.#', '.#.', '#.#'], ['##.', '.##', '##.']];
      glyphs.forEach((g, i) => g.forEach((row, yy) => { for (let xx = 0; xx < 3; xx++) if (row[xx] === '#') b.fillRect(5 + xx * 2, 3 + i * 5 + yy, 2, 1, c); }));
      if (on) { b.vline(2, 1, 18, c); b.vline(13, 1, 18, c); }
      K.outer(b, S.omap([], 'n6'));
      return b;
    },
  });

  // ============================================================================================ road terrains
  const AS = ['#5a5c6a', '#4e505c', '#666878', '#44464f'].map(col);
  const asphalt = (x, y, v) => { const n = K.hf(x, y, 301 + v); return n > 0.9 ? AS[2] : n < 0.12 ? AS[3] : n < 0.5 ? AS[0] : AS[1]; };
  // the road's edge where it meets the pavement: a pale kerb, its shadow, then a dark gutter line
  const KERB = ['#d4d4cc', '#9a9ca6', '#3c3e48'].map(col);
  const road = (inner) => (m, f, v) => {
    const fl = K.field(m, 3), b = K.B(T, T);
    for (let i = 0; i < 256; i++) { const d = fl.d[i]; b.u32[i] = d < 3 ? KERB[Math.floor(d)] : inner(i & 15, i >> 4, v); }
    return b;
  };
  K.terrain('asphalt', { autotile: true, group: 'road', variants: 2, step: 'stone', paint: road(asphalt) });
  const zebra = (vert) => (x, y, v) => {
    const a = vert ? y : x;
    return (a % 8) >= 1 && (a % 8) <= 4 ? (K.hf(x, y, 77) > 0.85 ? col('#d8d8d0') : col('#f4f4ec')) : asphalt(x, y, v);
  };
  K.terrain('zebra', { autotile: true, group: 'road', variants: 1, step: 'stone', paint: road(zebra(false)) });
  K.terrain('zebra_v', { autotile: true, group: 'road', variants: 1, step: 'stone', paint: road(zebra(true)) });

  // city pavement: big pale slabs in a staggered grid, a little speckle, and a lit top-left edge on each slab
  const PV = ['#d8d4cc', '#e4e0d8', '#c4c0b8', '#a8a49c'].map(col);
  K.terrain('pavement', {
    variants: 2, step: 'stone',
    paint: (m, f, v) => {
      const b = K.B(T, T);
      for (let i = 0; i < 256; i++) {
        const x = i & 15, y = i >> 4, xs = (x + (y >= 8 ? 8 : 0) + v * 4) & 15, ys = y & 7;
        let c = K.hf(x, y, 411 + v) > 0.9 ? PV[2] : PV[0];
        if (ys === 7 || xs === 15) c = PV[3];
        else if (ys === 0 || xs === 0) c = PV[1];
        b.u32[i] = c;
      }
      return b;
    },
  });
})(typeof globalThis !== 'undefined' ? globalThis : window);
