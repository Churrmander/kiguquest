/* src/art/tiles/stamp_buildings.js — outdoor buildings: house_s / house_m / house_l, lab, tea_house, general_store, salon, dept_store, windmill.
 * Every building is a patchwork-roofed cottage (K.roof) with a 'D' door tile in the bottom row; all other tiles are solid. */
(function (root) {
  'use strict';
  const NP = root.NP;
  const K = NP.art.tiles.kit;
  const S = K.S;
  const { P, col } = K;

  const ROOF_VARIANTS = ['red', 'blue', 'green', 'yellow', 'pink', 'gray'];
  const solidRows = (w, h, doorCol) => {
    const rows = [];
    for (let y = 0; y < h; y++) rows.push(y === h - 1 ? '#'.repeat(doorCol) + 'D' + '#'.repeat(w - doorCol - 1) : '#'.repeat(w));
    return rows;
  };
  const BLOOM = [P.pk2, P.yl2, P.red1, P.bl1];

  /** round attic window set into the roof */
  function atticWindow(b, cx, cy) {
    b.circle(cx, cy, 5, P.o5, true);
    b.circle(cx, cy, 4, P.p0, true);
    b.circle(cx, cy, 3, P.gl3, true);
    b.set(cx - 1, cy - 1, P.gl1); b.set(cx - 2, cy, P.gl2); b.set(cx, cy - 2, P.gl2);
    b.fillRect(cx, cy - 3, 1, 7, P.p0);
    b.fillRect(cx - 3, cy, 7, 1, P.p0);
  }

  // Buildings are drawn for the 32 px overworld characters: walls stand up past the footprint (`rise` px, drawn y-sorted with the base,
  // see K.stamp), and every door is taller than a person (34-40 px). Footprints, solid rows and door tiles are unchanged.

  /** big four-hole sewing button set into a roof (the Salon emblem): rim r[4], face r[1]/r[2], holes r[5] */
  function roofButton(b, cx, cy, r) {
    b.circle(cx, cy, 7, r[5], true);
    b.circle(cx, cy, 6, r[3], true);
    b.circle(cx, cy, 5, r[1], true);
    b.circle(cx + 1, cy + 1, 4, r[2], true);
    b.circle(cx, cy, 3, r[1], true);
    for (const [dx, dy] of [[-2, -2], [1, -2], [-2, 1], [1, 1]]) b.fillRect(cx + dx, cy + dy, 2, 2, r[5]);
    b.set(cx - 4, cy - 3, P.white); b.set(cx - 3, cy - 4, P.white);
  }

  // ============================================================================================ houses
  const OPT_S = (variant) => {
    const r = K.ramp(variant);
    return {
      w: 4, h: 3, rise: 24, ramp: r, roofTop: 1, roofBottom: 25, inset: 12, doorCol: 2, doorW: 18, doorH: 34,
      windows: [{ x: 11, y: 41, w: 12, h: 14, shutter: r }, { x: 53, y: 41, w: 6, h: 14, curtain: r }],
      extras: (b) => { S.flowerBox(b, 9, 59, 16, BLOOM); },
    };
  };
  K.stamp('house_s', {
    w: 4, h: 3, rise: 24, solid: solidRows(4, 3, 2), variants: ROOF_VARIANTS,
    paint: (variant) => S.house(OPT_S(variant)),
    vol: (variant) => S.houseVol(OPT_S(variant)),
  });

  const OPT_M = (variant) => {
    const r = K.ramp(variant);
    return {
      w: 5, h: 4, rise: 14, ramp: r, roofTop: 1, roofBottom: 28, inset: 12, doorCol: 2, doorW: 18, doorH: 35,
      windows: [{ x: 11, y: 45, w: 12, h: 15, shutter: r }, { x: 57, y: 45, w: 12, h: 15, shutter: r }],
      extras: (b) => {
        S.chimney(b, 56, 5, 11);
        atticWindow(b, 40, 15);
        S.flowerBox(b, 9, 64, 16, BLOOM); S.flowerBox(b, 55, 64, 16, BLOOM);
      },
    };
  };
  K.stamp('house_m', {
    w: 5, h: 4, rise: 14, solid: solidRows(5, 4, 2), variants: ROOF_VARIANTS,
    paint: (variant) => S.house(OPT_M(variant)),
    vol: (variant) => S.houseVol(OPT_M(variant)),
  });

  const OPT_L = (variant) => {
    const r = K.ramp(variant);
    return {
      w: 6, h: 4, rise: 18, ramp: r, roofTop: 1, roofBottom: 29, inset: 14, doorCol: 3, doorW: 20, doorH: 36,
      windows: [{ x: 10, y: 48, w: 10, h: 15, shutter: r }, { x: 29, y: 48, w: 10, h: 15, shutter: r }, { x: 72, y: 48, w: 13, h: 15, shutter: r }],
      extras: (b) => {
        S.chimney(b, 72, 5, 11);
        atticWindow(b, 48, 15);
        S.flowerBox(b, 8, 67, 14, BLOOM); S.flowerBox(b, 27, 67, 14, BLOOM); S.flowerBox(b, 70, 67, 17, BLOOM);
      },
    };
  };
  K.stamp('house_l', {
    w: 6, h: 4, rise: 18, solid: solidRows(6, 4, 3), variants: ROOF_VARIANTS,
    paint: (variant) => S.house(OPT_L(variant)),
    vol: (variant) => S.houseVol(OPT_L(variant)),
  });

  // ============================================================================================ lab
  const OPT_LAB = () => {
    const r = K.ramp('teal');
    return {
      w: 7, h: 5, rise: 12, ramp: r, roofTop: 8, roofBottom: 33, inset: 16, doorCol: 3, doorW: 22, doorH: 38,
      trimBand: P.st3,
      windows: [{ x: 9, y: 60, w: 14, h: 15 }, { x: 27, y: 60, w: 14, h: 15 }, { x: 71, y: 60, w: 14, h: 15 }, { x: 89, y: 60, w: 14, h: 15 }],
      doorFn: (b, x, y, w, h) => {
        // sliding glass doors under a steel lintel
        b.fillRect(x - 3, y - 4, w + 6, 3, P.st6); b.fillRect(x - 3, y - 4, w + 6, 1, P.st4);
        b.fillRect(x - 1, y - 1, w + 2, h + 1, P.st6);
        b.fillRect(x, y, w, h, P.st4);
        const lw = (w - 4) >> 1;
        for (const lx of [x + 1, x + w - 1 - lw]) {
          b.fillRect(lx, y + 1, lw, h - 2, P.gl3);
          b.fillRect(lx, y + 1, 1, h - 2, P.gl2);
          for (let k = 0; k < 6; k++) { b.set(lx + 1 + (k >> 1), y + 2 + k, P.gl1); }
          b.fillRect(lx, y + (h >> 1) + 4, lw, 1, P.st5);
        }
        b.fillRect(x + 1 + lw, y, w - 2 - 2 * lw, h, P.st5);
        // push rail across both leaves and a bar handle on each side of the seam
        b.fillRect(x, y + (h >> 1) - 1, w, 1, P.st6);
        b.fillRect(x + lw - 1, y + (h >> 1) - 4, 1, 6, P.n1); b.fillRect(x + w - lw, y + (h >> 1) - 4, 1, 6, P.n1);
      },
      extras: (b, c) => {
        // rooftop gear: lightning-rod with a red button-ball, and a vent box
        b.fillRect(82, 3, 2, 12, P.n3); b.set(82, 3, P.n1);
        b.circle(83, 3, 2, P.red2, true); b.set(82, 2, P.red0);
        b.fillRect(24, 11, 10, 7, P.n2); b.fillRect(24, 11, 10, 1, P.n0); b.fillRect(24, 17, 10, 1, P.n4);
        for (let x = 26; x < 33; x += 2) b.vline(x, 13, 3, P.n4);
        // upper storey: a row of small windows
        for (const wx of [11, 29, 73, 91]) S.window(b, wx, 39, 10, 9);
        // plaque over the door: teal panel with a big button and thread dashes
        b.fillRect(45, 37, 22, 11, r[5]);
        b.fillRect(46, 38, 20, 9, r[2]);
        b.fillRect(46, 38, 20, 1, r[1]); b.fillRect(46, 46, 20, 1, r[3]);
        S.button(b, 56, 42, P.p0, P.p2, r[4]);
        K.stitchH(b, 48, 42, 5, P.p0, 1, 1); K.stitchH(b, 60, 42, 5, P.p0, 1, 1);
        S.flowerBox(b, 8, 79, 16, BLOOM); S.flowerBox(b, 26, 79, 16, BLOOM); S.flowerBox(b, 70, 79, 16, BLOOM); S.flowerBox(b, 88, 79, 16, BLOOM);
      },
    };
  };
  K.stamp('lab', {
    w: 7, h: 5, rise: 12, solid: solidRows(7, 5, 3),
    paint: () => S.house(OPT_LAB()),
    vol: () => S.houseVol(OPT_LAB()),
  });

  // ============================================================================================ tea house
  const HEART = ['.xx.xx.', 'xxxxxxx', 'xxxxxxx', '.xxxxx.', '..xxx..', '...x...'];
  const OPT_TEA = (mode) => {
    const r = K.ramp('pink');
    return {
      w: 5, h: 4, rise: 17, ramp: r, roofTop: 8, roofBottom: 31, inset: 12, doorCol: 2, doorW: 18, doorH: 35, trimBand: P.pk1,
      windows: [{ x: 10, y: 49, w: 13, h: 14, curtain: r }],
      // striped awning over the door: painted on the flat facade, real geometry in 3D
      awnings: [{ x0: 27, x1: 53, y: 37, h: 3, c1: P.pk2, c2: P.p1, edge: [P.pk0, P.pk1, P.pk3, P.pk4] }],
      extras: (b) => {
        // heart flag on a pole at the ridge
        b.fillRect(40, 0, 2, 11, P.o4); b.set(40, 0, P.o2);
        b.fillRect(42, 1, 13, 9, P.red2);
        b.fillRect(42, 1, 13, 1, P.red1); b.fillRect(42, 9, 13, 1, P.red3);
        b.blit(K.spr(HEART, { x: P.p0 }), 45, 3);
        for (let i = 0; i < 3; i++) b.set(55, 2 + i * 3, P.red3);   // swallow-tail nicks
        atticWindow(b, 58, 20);
        S.flowerBox(b, 9, 67, 15, BLOOM);
        if (mode !== '3d') S.awning(b, 27, 37, 26, 3, P.pk2, P.p1, [P.pk0, P.pk1, P.pk3, P.pk4]);
        // hanging teapot sign on a bracket
        const sy = 46;
        b.fillRect(58, sy, 13, 1, P.o4); b.fillRect(58, sy, 1, 13, P.o4);
        b.fillRect(60, sy + 3, 11, 11, P.pk4); b.fillRect(61, sy + 4, 9, 9, P.p1);
        b.fillRect(62, sy + 8, 7, 3, P.pk2); b.fillRect(63, sy + 7, 5, 1, P.pk3); b.set(61, sy + 8, P.pk2); b.set(69, sy + 8, P.pk2);
        b.set(64, sy + 6, P.pk3); b.set(65, sy + 6, P.pk3); b.set(66, sy + 11, P.pk3); b.set(67, sy + 11, P.pk3);
      },
      outlineExtra: [[[P.red2, P.red1, P.red3, P.pk4, P.p1], P.red4]],
    };
  };
  K.stamp('tea_house', {
    w: 5, h: 4, rise: 17, solid: solidRows(5, 4, 2),
    boxSides: [false, true],   // `boxes: true` adds only the east box: the west window already has its own sill box
    paint: (variant, f, mode) => S.house(OPT_TEA(mode)),
    vol: () => S.houseVol(OPT_TEA('3d')),
  });

  // ============================================================================================ general store
  const OPT_STORE = (mode) => {
    const r = K.ramp('blue');
    return {
      w: 5, h: 4, rise: 12, ramp: r, roofTop: 1, roofBottom: 27, inset: 10, doorCol: 2, doorW: 20, doorH: 34,
      windows: [],
      awnings: [{ x0: 4, x1: 76, y: 28, h: 8, c1: P.red2, c2: P.p1, edge: [P.red0, P.red1, P.red3, P.red4] }],
      extras: (b) => {
        // two shop windows with three shelves of goods
        const shopWin = (x) => {
          S.window(b, x, 46, 21, 18);
          for (let i = 0; i < 3; i++) {
            const sy = 50 + i * 5;
            b.hline(x + 1, sy + 1, 19, P.o3);
            for (let k = 0; k < 6; k++) b.fillRect(x + 2 + k * 3 + (i & 1), sy - 2, 2, 3, [P.red1, P.yl2, P.bl2, P.pk2, P.f2, P.pu2][(k + i * 2) % 6]);
          }
        };
        shopWin(6); shopWin(53);
        // signboard on the roof: wooden board with a big button
        b.fillRect(27, 9, 26, 12, P.o5);
        b.fillRect(28, 10, 24, 10, P.o2);
        b.fillRect(28, 10, 24, 1, P.o1); b.fillRect(28, 19, 24, 1, P.o3);
        b.fillRect(31, 21, 2, 3, P.o5); b.fillRect(47, 21, 2, 3, P.o5);
        S.button(b, 40, 15, P.p1, P.p3, P.o5);
        K.stitchH(b, 30, 15, 5, P.p0, 1, 1); K.stitchH(b, 45, 15, 5, P.p0, 1, 1);
        // red-and-cream striped awning under the eaves (flat view only: the 3D view builds a real one)
        if (mode !== '3d') S.awning(b, 4, 28, 72, 8, P.red2, P.p1, [P.red0, P.red1, P.red3, P.red4]);
      },
      outlineExtra: [[[P.red2, P.red1, P.red3, P.p1], P.red4]],
    };
  };
  K.stamp('general_store', {
    w: 5, h: 4, rise: 12, solid: solidRows(5, 4, 2),
    paint: (variant, f, mode) => S.house(OPT_STORE(mode)),
    vol: () => S.houseVol(OPT_STORE('3d')),
  });

  // ============================================================================================ salon
  const SALON_TYPES = Object.keys(S.TYPE_COLORS);
  const SCISSORS = [
    '..x.....x..', '..xx...xx..', '...xx.xx...', '....xxx....', '.....o.....', '....xxx....', '..xx.x.xx..', '.x..x.x..x.', '.x..xxx..x.', '..xx...xx..',
  ];
  const SALON_RAMPS = {};
  for (const t of SALON_TYPES) SALON_RAMPS[t] = S.ramp6(S.TYPE_COLORS[t]);
  const OPT_SALON = (variant) => {
    const r = SALON_RAMPS[variant];
    return {
      w: 7, h: 5, rise: 12, ramp: r, roofTop: 1, roofBottom: 30, inset: 16, doorCol: 3, doorW: 22, doorH: 37, trimBand: r[2],
      windows: [{ x: 10, y: 60, w: 25, h: 19 }, { x: 77, y: 60, w: 25, h: 19 }],
      extras: (b) => {
        roofButton(b, 56, 16, r);
        // little dress forms in the display windows
        for (const wx of [10, 77]) for (let k = 0; k < 2; k++) {
          const cx = wx + 7 + k * 11;
          b.fillRect(cx - 2, 66, 5, 7, k ? r[3] : r[2]);
          b.fillRect(cx - 2, 66, 1, 7, r[1]);
          b.set(cx, 64, P.o1); b.set(cx, 65, P.o2);
          b.fillRect(cx, 73, 1, 3, P.o4); b.hline(cx - 1, 76, 3, P.o4);
        }
        // upper storey windows
        S.window(b, 16, 38, 12, 10); S.window(b, 84, 38, 12, 10);
        // hanging banner with scissors over the door
        b.fillRect(44, 32, 24, 2, P.o4); b.fillRect(44, 32, 24, 1, P.o2);
        b.set(43, 32, P.gd2); b.set(68, 32, P.gd2); b.set(43, 33, P.gd4); b.set(68, 33, P.gd4);
        b.fillRect(47, 34, 18, 15, r[2]);
        b.fillRect(47, 34, 2, 15, r[1]); b.fillRect(63, 34, 2, 15, r[3]);
        b.fillRect(47, 34, 18, 1, r[4]);
        for (let yy = 46; yy <= 48; yy++) for (let xx = 47; xx < 65; xx++) if (Math.abs(xx - 55.5) < (yy - 45) * 2.4) b.set(xx, yy, 0);
        b.blit(K.spr(SCISSORS, { x: r[4], o: r[4] }), 51, 36);
        b.blit(K.spr(SCISSORS, { x: P.p0, o: P.gd2 }), 50, 35);
      },
      outlineExtra: [[[P.p0, P.gd2, P.gd4], r[5]]],
    };
  };
  K.stamp('salon', {
    w: 7, h: 5, rise: 12, solid: solidRows(7, 5, 3), variants: SALON_TYPES,
    paint: (variant) => S.house(OPT_SALON(variant)),
    vol: (variant) => S.houseVol(OPT_SALON(variant)),
  });

  // ============================================================================================ dept_store (Crisp & Co.)
  // The Society's department store: three tall storeys of starch-white stone that loom over the plaza. A rooftop sign spells the name,
  // a Society banner hangs down the middle, and the display windows hold rows of identical white uniforms. Glass double doors.
  const LETTERS = {
    C: ['.###', '#...', '#...', '#...', '#...', '#...', '.###'],
    R: ['###.', '#..#', '#..#', '###.', '#.#.', '#..#', '#..#'],
    I: ['###', '.#.', '.#.', '.#.', '.#.', '.#.', '###'],
    S: ['.###', '#...', '#...', '.##.', '...#', '...#', '###.'],
    P: ['###.', '#..#', '#..#', '###.', '#...', '#...', '#...'],
    O: ['.##.', '#..#', '#..#', '#..#', '#..#', '#..#', '.##.'],
    '&': ['.#..', '#.#.', '#.#.', '.#..', '#.##', '#..#', '.##.'],
    '.': ['.', '.', '.', '.', '.', '.', '#'],
    ' ': ['..', '..', '..', '..', '..', '..', '..'],
  };
  const textW = (str) => str.split('').reduce((n, ch) => n + LETTERS[ch][0].length + 1, -1);
  /** k = pixel scale (2 = 2 px strokes, for signs that must survive the 3D view's resampling) */
  function letters(b, x, y, str, c, sh, k) {
    k = k || 1;
    for (const ch of str) {
      const g = LETTERS[ch];
      for (let yy = 0; yy < g.length; yy++) for (let xx = 0; xx < g[yy].length; xx++) if (g[yy][xx] === '#') {
        if (sh) b.fillRect(x + (xx + 1) * k - (k - 1), y + (yy + 1) * k - (k - 1), k, k, sh);
        b.fillRect(x + xx * k, y + yy * k, k, k, c);
      }
      x += (g[0].length + 1) * k;
    }
  }
  const STORE_MARK = ['..xxxxxxxx..', '.xxxxxxxxxx.', 'xxx..xx..xxx', 'xxx..xx..xxx', 'xxxxxxxxxxxx', 'xxx..xx..xxx', 'xxx..xx..xxx', '.xxxxxxxxxx.', '..xxxxxxxx..'];   // a four-hole button
  /** a uniform on a stand in a display window: identical white tunic, blue collar */
  function uniform(b, cx, y) {
    b.fillRect(cx - 3, y + 2, 7, 9, P.st0); b.fillRect(cx - 3, y + 2, 1, 9, P.st2); b.fillRect(cx + 3, y + 2, 1, 9, P.st3);
    b.fillRect(cx - 2, y + 2, 5, 1, P.st4); b.set(cx, y + 3, P.st4);
    b.fillRect(cx - 1, y, 3, 2, P.n2); b.set(cx, y - 1, P.n3);
    b.vline(cx, y + 11, 4, P.n4); b.hline(cx - 2, y + 15, 5, P.n4);
  }
  const OPT_DEPT = (mode) => {
    const n = K.ramp('navy'), r = [n[1], n[2], n[3], n[4], n[5], P.ink];   // slate one step darker than the navy roofs
    return {
      w: 9, h: 6, rise: 56, ramp: r, roofTop: 18, roofBottom: 32, inset: 6, doorCol: 4, doorW: 30, doorH: 38,
      wall: { base: 'st1', hi: 'st0', sh: 'st2', dk: 'st3' }, trimBand: 'st4',
      doorFn: (b, x, y, w, h) => {
        // steel-framed glass double doors with push bars
        b.fillRect(x - 2, y - 2, w + 4, h + 2, P.n5);
        b.fillRect(x - 1, y - 1, w + 2, h + 1, P.n2);
        for (const hx of [x, x + (w >> 1) + 1]) {
          const hw = (w >> 1) - 1;
          b.fillRect(hx, y, hw, h, P.gl3);
          for (let yy = 0; yy < h; yy++) for (let xx = 0; xx < hw; xx++) { const d = xx - (yy >> 1); if (d === 1 || d === 2) b.set(hx + xx, y + yy, P.gl2); }
          b.fillRect(hx, y, hw, 1, P.gl1); b.fillRect(hx, y, 1, h, P.gl2);
          b.fillRect(hx + 1, y + 20, hw - 2, 2, P.n1); b.hline(hx + 1, y + 22, hw - 2, P.n4);
        }
        b.fillRect(x + (w >> 1) - 1, y, 2, h, P.n3);
      },
      windows: [],
      extras: (b, ctx) => {
        const { W, H, rb } = ctx;
        // ---- clean flat stone: repaint the wall (the cottage builder speckles it) everywhere but the doorway
        b.fillRect(3, rb + 1, W - 6, 93 - rb, P.st1);
        b.fillRect(3, 94, 52, H - 97, P.st1); b.fillRect(89, 94, W - 92, H - 97, P.st1);
        // ---- storey cornices (with a shadow line under each) and steel-blue pilasters
        for (const cy of [rb + 1, 64]) { b.fillRect(3, cy, W - 6, 3, P.st2); b.hline(3, cy, W - 6, P.st0); b.hline(3, cy + 3, W - 6, P.st4); }
        for (const px of [3, 33, 107, 137]) {
          const y1 = px === 3 || px === 137 ? H - 4 : 92;   // the corner piers run to the plinth (no cottage timber posts on this one)
          b.fillRect(px, rb + 1, 4, y1 - rb, P.st3); b.vline(px, rb + 1, y1 - rb, P.st2); b.vline(px + 3, rb + 1, y1 - rb, P.st4);
        }
        // ---- upper floors: two rows of steel-framed windows either side of the banner, blinds drawn to regulation heights
        let k = 0;
        for (const wy of [42, 70]) for (const wx of [12, 40, 92, 120]) {
          b.fillRect(wx - 1, wy - 1, 15, 18, P.n4); b.fillRect(wx, wy, 13, 16, P.gl3);
          for (let yy = 0; yy < 16; yy++) { const xx = 9 - yy; if (xx >= 0 && xx < 13) { b.set(wx + xx, wy + yy, P.gl2); if (xx + 1 < 13) b.set(wx + xx + 1, wy + yy, P.gl2); } }
          b.vline(wx + 6, wy, 16, P.n3); b.hline(wx, wy + 8, 13, P.n3);
          const blind = k++ % 2 ? 7 : 4;
          b.fillRect(wx, wy, 13, blind, P.st0); b.hline(wx, wy + blind, 13, P.st3);
          b.fillRect(wx - 2, wy + 17, 17, 1, P.n2); b.hline(wx - 2, wy + 18, 17, P.st4);   // sill + its shadow
        }
        // ---- the Society banner down the middle (white, flat blue stripes, a plain two-tone button crest that holds up in 3D)
        b.fillRect(56, rb + 2, 32, 2, P.n4); b.hline(56, rb + 2, 32, P.n2);
        b.fillRect(59, rb + 4, 26, 52, P.st5);
        b.fillRect(60, rb + 4, 24, 51, P.st0);
        for (let x = 62; x <= 82; x += 4) b.vline(x, rb + 4, 51, P.st2);
        b.fillRect(63, rb + 12, 18, 16, P.st0); b.strokeRect(63, rb + 12, 18, 16, P.st5);
        b.blit(K.spr(STORE_MARK, { x: P.st5 }), 65, rb + 15);
        for (let yy = 0; yy < 6; yy++) for (let xx = 0; xx < 6 - yy; xx++) { b.set(71 - xx, rb + 54 - yy, P.st1); b.set(72 + xx, rb + 54 - yy, P.st1); }   // swallow-tail hem
        b.hline(60, rb + 50, 24, P.st4);
        // ---- name band over the ground floor: near-navy with a light rim, the name in 2 px strokes so it reads in the 3D view
        b.fillRect(6, 92, W - 12, 20, P.st0); b.fillRect(7, 93, W - 14, 18, P.st6); b.hline(7, 93, W - 14, P.st5);
        const name = 'CRISP & CO.', tw = textW(name);
        letters(b, (W - tw * 2) >> 1, 95, name, P.st0, P.st4, 2);
        // ---- ground floor: display windows with rows of identical uniforms under starch-blue awnings
        if (mode !== '3d') {
          S.awning(b, 8, 112, 42, 3, P.st0, P.st4, [P.st0, P.st6, P.st5, P.st3]);
          S.awning(b, 94, 112, 42, 3, P.st0, P.st4, [P.st0, P.st6, P.st5, P.st3]);
        }
        for (const wx of [10, 96]) {
          b.fillRect(wx - 1, 118, 40, 29, P.n5);
          b.fillRect(wx, 119, 38, 27, P.gl3);
          b.fillRect(wx, 119, 38, 2, P.gl1);
          for (let q = 0; q < 4; q++) uniform(b, wx + 6 + q * 9, 126);
          for (let yy = 0; yy < 27; yy++) { const xx = 30 - yy; if (xx >= 0) b.set(wx + xx, 119 + yy, P.gl2); }
          b.fillRect(wx - 2, 146, 42, 2, P.n2);
        }
        // ---- rooftop sign on steel legs, and stiff pennants on the corners
        const sw = tw + 14, sx = (W - sw) >> 1;
        for (const lx of [sx + 4, sx + sw - 6]) { b.fillRect(lx, 12, 2, 8, P.n4); b.set(lx, 12, P.n2); }
        b.hline(sx + 4, 15, sw - 8, P.n4);
        b.fillRect(sx, 0, sw, 13, P.st6); b.fillRect(sx + 1, 1, sw - 2, 11, P.st0); b.hline(sx + 1, 11, sw - 2, P.st2);
        letters(b, sx + 7, 3, name, P.st5, P.st2);
        for (const fx of [8, W - 10]) {
          b.vline(fx, 4, 15, P.n4); b.set(fx, 4, P.n1);
          for (let i = 0; i < 5; i++) b.hline(fx + 1, 5 + i, 8 - i, i % 2 ? P.st4 : P.st0);
        }
      },
      outlineExtra: [[[P.st0, P.st1, P.st2, P.st3, P.st4], P.st6], [[P.n1, P.n2, P.n3, P.n4], P.n6], [[P.gl1, P.gl2, P.gl3], P.gl5]],
    };
  };
  K.stamp('dept_store', {
    w: 9, h: 6, rise: 56, solid: solidRows(9, 6, 4),
    paint: (variant, f, mode) => S.house(OPT_DEPT(mode)),
    vol: () => Object.assign(S.houseVol(OPT_DEPT('3d')), {
      awnings: [8, 94].map((x0) => ({ x0, x1: x0 + 42, y: 112, h: 3, c1: P.st0, c2: P.st4, edge: [P.st0, P.st6, P.st5, P.st3] })),
    }),
  });

  // ============================================================================================ windmill (animated)
  const SAIL_COLORS = ['pink', 'sky', 'yellow', 'mint'];
  K.stamp('windmill', {
    w: 3, h: 4, frames: 4, animSpeed: 10,
    paint: (variant, frame) => {
      const W = 48, H = 64, cx = 24, hubY = 21;
      const b = K.B(W, H);
      const rr = K.ramp('red');
      // tower
      for (let y = 25; y < H; y++) {
        const hw = 9 + Math.round(((y - 25) * 5) / 38);
        for (let x = cx - hw; x < cx + hw; x++) {
          const lx = x - (cx - hw), rx = cx + hw - 1 - x;
          b.set(x, y, lx < 3 ? P.p0 : rx < 4 ? P.p3 : rx < 6 ? P.p2 : P.p1);
        }
        if (y >= 56) for (let x = cx - hw; x < cx + hw; x++) b.set(x, y, ((x + (y >> 2)) & 3) === 0 ? P.c3 : (x - (cx - hw) < 3 ? P.c1 : P.c2));
        else if (y % 8 === 4) for (let x = cx - hw + 3; x < cx + hw - 4; x += 4) b.set(x, y, P.p2);
      }
      for (let x = 14; x < 34; x++) b.set(x, 63, P.c4);
      // conical cap
      for (let y = 13; y <= 25; y++) {
        const hw = 1 + Math.round(((y - 13) * 12) / 12);
        for (let x = cx - hw; x <= cx + hw; x++) {
          const t = (x - (cx - hw)) / Math.max(1, 2 * hw);
          let c = t < 0.28 ? rr[1] : t < 0.65 ? rr[2] : rr[3];
          if (y === 25) c = rr[4];
          else if ((y - 13) % 4 === 3) c = t < 0.65 ? rr[3] : rr[4];
          b.set(x, y, c);
        }
      }
      S.door(b, 20, 51, 8, 12);
      S.window(b, 21, 36, 6, 6);
      // sails: four cloth blades on timber arms, rotating 22.5deg per frame
      for (let k = 0; k < 4; k++) {
        const a = (-90 + k * 90 + frame * 22.5) * Math.PI / 180;
        const dx = Math.cos(a), dy = Math.sin(a), nx = -dy, ny = dx;
        const sr = K.ramp(SAIL_COLORS[k]);
        const P0 = [cx + dx * 4, hubY + dy * 4], P1 = [cx + dx * 20, hubY + dy * 20];
        const pts = [P0, P1, [P1[0] + nx * 6, P1[1] + ny * 6], [P0[0] + nx * 6, P0[1] + ny * 6]];
        b.polygon(pts, sr[2]);
        // lattice lines across the blade + dark border
        for (let t = 0.2; t < 1; t += 0.2) {
          const ax = P0[0] + (P1[0] - P0[0]) * t, ay = P0[1] + (P1[1] - P0[1]) * t;
          b.line(Math.round(ax), Math.round(ay), Math.round(ax + nx * 6), Math.round(ay + ny * 6), sr[3]);
        }
        const edge = (p, q, c) => b.line(Math.round(p[0]), Math.round(p[1]), Math.round(q[0]), Math.round(q[1]), c);
        edge(pts[0], pts[1], P.o4); edge(pts[1], pts[2], sr[4]); edge(pts[2], pts[3], sr[4]); edge(pts[3], pts[0], sr[4]);
        edge([cx, hubY], P1, P.o3);
      }
      b.circle(cx, hubY, 3, P.o4, true); b.circle(cx, hubY, 2, P.o2, true); b.set(cx - 1, hubY - 1, P.o0);
      const sails = SAIL_COLORS.flatMap((n) => K.ramp(n).slice(0, 5));
      K.outer(b, S.omap([[rr.slice(0, 5), rr[5]], [sails, P.ink2]], 'p6'));
      return b;
    },
  });
})(typeof globalThis !== 'undefined' ? globalThis : window);
