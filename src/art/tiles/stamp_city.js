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
  function glass(b, x, y, w, h, off) {
    const [g1, g2, g3] = off ? [col('#5a6478'), col('#46506a'), col('#2e3446')] : [P.gl1, P.gl2, P.gl3];   // off: a shop with its power cut
    b.fillRect(x - 1, y - 1, w + 2, h + 2, P.n5);
    b.fillRect(x, y, w, h, g3);
    b.fillRect(x, y, w, 1, g1);
    for (let yy = 0; yy < h; yy++) { const xx = w - 6 - yy; if (xx >= 0) { b.set(x + xx, y + yy, g2); if (xx + 1 < w) b.set(x + xx + 1, y + yy, g2); } }
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
    /** sliding glass doors (dark when the power is off) */
    const shopDoor = (b, x, y, w, h) => {
      b.fillRect(x - 2, y - 2, w + 4, h + 2, P.n5);
      glass(b, x, y, w, h, !on);
      b.vline(x + (w >> 1), y, h, P.n4); b.vline(x + (w >> 1) + 1, y, h, P.n5);
      b.fillRect(x + (w >> 1) - 3, y + (h >> 1), 2, 4, P.n3); b.fillRect(x + (w >> 1) + 3, y + (h >> 1), 2, 4, P.n3);   // handles
    };
    return {
      w: 5, h: 4, rise: 40, ramp: K.ramp('gray'), roofTop: 6, roofBottom: 11, inset: 1, doorCol: 2, doorW: 22, doorH: 34,
      wall: { base: s.wall[0], hi: s.wall[1], sh: s.wall[2], dk: s.wall[3] },
      doorFn: shopDoor,
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
          glass(b, wx, rb + 9, ww, 15, !on);
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
        glass(b, 6, 74, 22, 24, !on); glass(b, W - 28, 74, 22, 24, !on);
        // what's in the windows
        const goods = { konbini: ['#f06a5a', '#5ab4e8', '#f4d84a'], arcade: ['#ff7ae0', '#6af0ff', '#f4d84a'], fabric: ['#e05450', '#f4c8d8', '#5ab4e8'],
          ramen: ['#f4e4c8', '#c8784a', '#f4e4c8'], toys: ['#f4a8c8', '#8ad8e8', '#f4d84a'], flats: ['#dcdce4', '#c4c8d4', '#dcdce4'] }[name];
        for (const gx of [8, W - 26]) for (let q = 0; q < 3; q++) {
          const c = on ? col(goods[q]) : col('#4c5266');
          b.fillRect(gx + 1 + q * 6, 88, 5, 9, c); b.hline(gx + 1 + q * 6, 88, 5, on ? P.p0 : col('#6a7088')); b.vline(gx + 5 + q * 6, 89, 8, wsh);
        }
        b.fillRect(4, 98, W - 8, 2, col(s.wall[3]));
        // the flat wall above covers the door S.house drew, so put the doors back on top (with the doorstep)
        const { dx, doorW, doorH } = ctx;
        shopDoor(b, dx, H - doorH, doorW, doorH);
        b.fillRect(dx - 2, H - 3, doorW + 4, 3, P.c1); b.fillRect(dx - 2, H - 3, doorW + 4, 1, P.c0); b.fillRect(dx - 2, H - 1, doorW + 4, 1, P.c4);
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

  // ============================================================================================ claw machine
  // a glass prize booth with a claw on a gantry and a heap of plushes; the frame lights up pink when the power is on
  K.stamp('claw_booth', {
    w: 1, h: 2, over: 1, solid: ['.', '#'], variants: ['on', 'off'],
    paint: (variant) => {
      const on = variant !== 'off';
      const b = K.B(T, 32);
      const fr = on ? col('#ff7ae0') : col('#8a6a98'), frd = on ? col('#c04aa8') : col('#5a4a68');
      b.fillRect(1, 2, 14, 29, frd); b.fillRect(1, 2, 14, 3, fr); b.vline(1, 2, 29, fr);
      b.fillRect(3, 6, 10, 13, on ? col('#d8f0ff') : col('#7a8494'));
      b.hline(3, 7, 10, P.n3); b.vline(8, 7, 4, P.n2); b.hline(7, 11, 3, P.n2); b.set(6, 12, P.n2); b.set(10, 12, P.n2);
      const plush = ['#f4a8c8', '#8ad8e8', '#f4d84a', '#a8e0a0'];
      for (let q = 0; q < 4; q++) { b.fillRect(3 + q * 2 + (q & 1), 15 - (q & 1), 3, 4, col(plush[q])); b.set(4 + q * 2 + (q & 1), 15 - (q & 1), P.n6); }
      b.fillRect(3, 21, 10, 5, P.n5); b.fillRect(5, 22, 2, 2, col('#e05450')); b.set(10, 22, P.n2); b.vline(10, 23, 2, P.n3);
      b.fillRect(9, 27, 4, 3, P.n6);
      K.outer(b, S.omap([], 'n6'));
      return b;
    },
  });

  // ============================================================================================ the Spark Cellar
  // `socket`: cave floor where an old cable has snapped; the two ends spit sparks across the gap (push a magnet stone onto it to
  // join them). `cable` / `cable_v`: cave floor with a fat black cable running east-west / north-south. `arc_gate`: a crackling
  // arc of static between two posts (solid), the Pressers' siphon fence; animated.
  const caveFloor = (v) => (NP.terrain && NP.terrain.cave_floor ? NP.terrain.cave_floor.draw(0, 0, v || 0).clone() : K.B(T, T));
  const CB = ['#2a2a34', '#4a4a58', '#141418'].map(col);
  const SPK = ['#fff8c0', '#f4d040'].map(col);
  function cableRun(b, vert) {
    for (let i = 0; i < 16; i++) {
      const a = vert ? [7, i] : [i, 7], c2 = vert ? [8, i] : [i, 8], d = vert ? [9, i] : [i, 9];
      b.set(a[0], a[1], CB[1]); b.set(c2[0], c2[1], CB[0]); b.set(d[0], d[1], CB[2]);
    }
  }
  K.terrain('cable', { variants: 1, step: 'stone', paint: () => { const b = caveFloor(1); cableRun(b, false); return b; } });
  K.terrain('cable_v', { variants: 1, step: 'stone', paint: () => { const b = caveFloor(1); cableRun(b, true); return b; } });
  K.terrain('socket', {
    variants: 1, frames: 2, animSpeed: 8, step: 'stone',
    paint: (m, f) => {
      const b = caveFloor(0);
      for (const [x0, x1] of [[0, 4], [12, 16]]) for (let x = x0; x < x1; x++) { b.set(x, 7, CB[1]); b.set(x, 8, CB[0]); b.set(x, 9, CB[2]); }
      b.fillRect(4, 6, 1, 5, col('#c87a40')); b.fillRect(11, 6, 1, 5, col('#c87a40'));     // bare copper ends
      const sp = f ? [[6, 6], [7, 8], [9, 7], [10, 9]] : [[5, 9], [7, 7], [8, 9], [10, 6]];
      for (const [x, y] of sp) { b.set(x, y, SPK[0]); b.set(x + 1, y, SPK[1]); }
      return b;
    },
  });
  K.terrain('arc_gate', {
    solid: true, variants: 1, frames: 2, animSpeed: 6, step: 'stone',
    paint: (m, f) => {
      const b = caveFloor(2);
      for (const x of [1, 13]) { b.fillRect(x, 2, 2, 13, P.n3); b.vline(x, 2, 13, P.n1); b.fillRect(x - 1, 1, 4, 2, col('#f4d040')); }
      let y = 4 + f;
      for (let x = 3; x < 13; x++) { y = Math.max(3, Math.min(12, y + ((K.h32(x, f, 5) % 3) - 1))); b.set(x, y, SPK[0]); b.set(x, y + 1, SPK[1]); }
      let y2 = 9 - f;
      for (let x = 3; x < 13; x++) { y2 = Math.max(3, Math.min(13, y2 + ((K.h32(x, f, 9) % 3) - 1))); b.set(x, y2, SPK[1]); }
      return b;
    },
  });

  // `static_jar` (1x1): a big glass jar of bottled static, stoppered and labelled with a Society tag. Variant `empty` once it's let go.
  K.stamp('static_jar', {
    w: 1, h: 1, solid: ['#'], variants: ['full', 'empty'], frames: 2, animSpeed: 10,
    paint: (variant, frame) => {
      const b = K.B(T, T);
      b.fillRect(3, 4, 10, 11, col('#a8d8e8')); b.vline(3, 4, 11, col('#e8f8ff')); b.vline(12, 4, 11, col('#6898b0'));
      b.fillRect(5, 1, 6, 3, P.o3); b.hline(5, 1, 6, P.o1);
      if (variant !== 'empty') {
        b.fillRect(4, 6, 8, 8, col('#f4e070'));
        const pts = frame ? [[5, 8], [6, 9], [8, 8], [9, 10], [10, 12]] : [[5, 11], [7, 10], [8, 12], [10, 8], [6, 7]];
        for (const [x, y] of pts) b.set(x, y, P.p0);
      }
      b.fillRect(6, 9, 4, 3, P.p0); b.hline(6, 10, 4, col('#3a60b0'));    // the Society tag
      K.outer(b, S.omap([], 'n6'));
      K.shadow(b, 8, 15, 6, 1);
      return b;
    },
  });
  // `siphon` (3x2): the Pressers' static siphon, a riveted tank on legs with pipes running off to the jars; a dial and a red lamp.
  // Variant `off` after it's shut down (lamp dark, gauge at zero).
  K.stamp('siphon', {
    w: 3, h: 2, solid: ['###', '###'], variants: ['on', 'off'], frames: 2, animSpeed: 12,
    paint: (variant, frame) => {
      const on = variant !== 'off';
      const b = K.B(48, 32);
      const st = ['#e8ecf4', '#c8d0e0', '#98a4bc', '#6c7890'].map(col);
      b.fillRect(8, 2, 32, 24, st[1]); b.vline(8, 2, 24, st[0]); b.vline(39, 2, 24, st[2]); b.hline(8, 2, 32, st[0]); b.hline(8, 25, 32, st[3]);
      for (let x = 11; x < 38; x += 6) { b.set(x, 4, st[3]); b.set(x, 23, st[3]); }
      b.fillRect(10, 26, 3, 6, st[3]); b.fillRect(35, 26, 3, 6, st[3]);
      // the gauge
      b.circle(18, 13, 5, P.n5, true); b.circle(18, 13, 4, P.p0, true);
      if (on) b.line(18, 13, 21, 10, col('#e05450')); else b.line(18, 13, 15, 15, col('#e05450'));
      // a window into the tank, glowing while it pulls
      b.fillRect(26, 8, 9, 10, P.n5); b.fillRect(27, 9, 7, 8, on ? col(frame ? '#fff090' : '#f4d040') : col('#4a5060'));
      b.fillRect(22, 4, 3, 3, on ? col('#ff5a4a') : P.n4);                  // the lamp
      // pipes off both sides
      b.fillRect(0, 12, 8, 4, st[2]); b.hline(0, 12, 8, st[0]); b.fillRect(40, 12, 8, 4, st[2]); b.hline(40, 12, 8, st[0]);
      // the Society's blue band
      b.fillRect(9, 20, 30, 2, col('#3a60b0'));
      K.outer(b, S.omap([], 'n6'));
      return b;
    },
  });

  // a back alley between buildings: dark, damp asphalt with cardboard and litter. Wild city Kigu live here (encounter 'grass').
  K.terrain('alley', {
    variants: 3, step: 'stone', encounter: 'grass',
    paint: (m, f, v) => {
      const b = K.B(T, T);
      // worn grey back-street paving: big square slabs, a few stains (lighter than the road, so it doesn't read as a hole)
      for (let i = 0; i < 256; i++) { const x = i & 15, y = i >> 4, n = K.hf(x, y, 911 + v); b.u32[i] = (x & 7) === 7 || (y & 7) === 7 ? col('#5c5e68') : (x & 7) === 0 || (y & 7) === 0 ? col('#8a8c96') : n < 0.12 ? col('#62646e') : col('#74767f'); }
      if (v === 0) { b.fillRect(3, 4, 7, 5, col('#b08a5a')); b.hline(3, 4, 7, col('#d0aa78')); b.vline(9, 4, 5, col('#80603c')); b.hline(4, 6, 5, col('#80603c')); }
      if (v === 1) { b.fillRect(9, 9, 3, 4, col('#e05450')); b.hline(9, 9, 3, col('#ff8a70')); b.set(4, 12, col('#f4d84a')); b.set(5, 12, col('#f4d84a')); }
      if (v === 2) { for (let x = 2; x < 14; x++) b.set(x, 7 + ((x >> 2) & 1), col('#2a6a8a')); }
      return b;
    },
  });
})(typeof globalThis !== 'undefined' ? globalThis : window);
