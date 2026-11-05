/* src/art/tiles/stamp_ch1.js — Chapter 1 rebuild, outdoor stamps (part 1): Button Town's houses and rowhouses, the tree house,
 * the shipyard and boats, Kigu Park, and the Route 1 grotto. Part 2 (stamp_ch1b.js) has Basting Green and Thimble.
 * Same toolkit as stamp_buildings.js / stamp_props.js: light from the top left, a dark outline of each material's darkest tone,
 * a soft contact shadow under free-standing props. Walk-over stamps (boats, kite_snag) keep their solid rows all '.'. */
(function (root) {
  'use strict';
  const NP = root.NP;
  const K = NP.art.tiles.kit;
  const S = K.S;
  const { P, col } = K;

  const ROOF_VARIANTS = ['red', 'blue', 'green', 'yellow', 'pink', 'gray'];
  const BLOOM = [P.pk2, P.yl2, P.red1, P.bl1];
  const WOOD = [P.o0, P.o1, P.o2, P.o3, P.o4, P.o5];
  const STONE = [P.n0, P.n1, P.n2, P.n3, P.n4];
  const out = (b, groups, fb) => K.outer(b, S.omap([[WOOD, P.o6]].concat(groups || []), fb || 'o6'));
  const R = (name) => K.ramp(name);
  const SKIN = col('#ffdcc4');

  /** a double front door (two leaves meeting in the middle, knobs at the centre), x,y = top-left of the left leaf */
  function doubleDoor(b, x, y, leafW, h) {
    S.door(b, x, y, leafW, h);
    const t = K.B(leafW + 6, h + 4);
    S.door(t, 3, 4, leafW, h);
    b.blit(t.flippedX(), x + leafW + 2 - 3, y - 4);
    b.fillRect(x + leafW, y, 2, h, P.o6);
  }
  /** horizontal timber belt between two storeys */
  function belt(b, x0, x1, y) {
    b.fillRect(x0, y, x1 - x0 + 1, 3, P.o3); b.hline(x0, y, x1 - x0 + 1, P.o2); b.hline(x0, y + 2, x1 - x0 + 1, P.o4);
  }

  // ============================================================================================ the hero's house (two storeys)
  const OPT_HOME = (variant) => {
    const r = R(variant);
    return {
      w: 5, h: 5, rise: 16, ramp: r, roofTop: 1, roofBottom: 29, inset: 12, doorCol: 2.5, doorW: 24, doorH: 34,
      windows: [{ x: 11, y: 38, w: 12, h: 12, shutter: r }, { x: 35, y: 38, w: 10, h: 12, curtain: r }, { x: 57, y: 38, w: 12, h: 12, shutter: r },
        { x: 11, y: 67, w: 13, h: 13, curtain: r }, { x: 62, y: 67, w: 11, h: 13, curtain: r }],
      doorFn: (b, dx, dy, dw, dh) => doubleDoor(b, dx, dy, 11, dh),
      extras: (b) => {
        belt(b, 5, 74, 55);
        S.chimney(b, 58, 4, 12);
        S.flowerBox(b, 9, 84, 17, BLOOM); S.flowerBox(b, 60, 84, 15, BLOOM);
        // a little round house-number plaque over the door
        b.circle(40, 57, 2, P.gd2, true); b.set(39, 56, P.gd1);
      },
    };
  };
  K.stamp('house_home', {
    w: 5, h: 5, rise: 16, solid: ['#####', '#####', '#####', '#####', '##DD#'], variants: ROOF_VARIANTS,
    paint: (variant) => S.house(OPT_HOME(variant)),
    vol: (variant) => S.houseVol(OPT_HOME(variant)),
  });

  // ============================================================================================ the rival's tall house
  // Narrower-looking than house_home: a steep roof with a dormer, three rows of windows and a single door in the middle.
  const OPT_TALL = (variant) => {
    const r = R(variant);
    return {
      w: 5, h: 5, rise: 24, ramp: r, roofTop: 1, roofBottom: 37, inset: 22, doorCol: 2, doorW: 18, doorH: 35,
      windows: [{ x: 12, y: 46, w: 10, h: 12, curtain: r }, { x: 58, y: 46, w: 10, h: 12, curtain: r },
        { x: 12, y: 72, w: 10, h: 14, shutter: r }, { x: 58, y: 72, w: 10, h: 14, shutter: r }],
      extras: (b) => {
        belt(b, 5, 74, 63);
        // dormer window in the roof
        b.fillRect(33, 14, 14, 14, P.p1); b.hline(33, 14, 14, P.p0); b.vline(46, 14, 14, P.p3);
        K.roof(b, 31, 8, 48, 15, r, { inset: 8, row: 3 });
        S.window(b, 36, 17, 8, 9, {});
        S.chimney(b, 14, 10, 12);
        S.flowerBox(b, 10, 91, 14, BLOOM); S.flowerBox(b, 56, 91, 14, BLOOM);
      },
    };
  };
  K.stamp('house_tall', {
    w: 5, h: 5, rise: 24, solid: ['#####', '#####', '#####', '#####', '##D##'], variants: ['blue', 'red', 'green', 'yellow', 'pink', 'gray'],
    paint: (variant) => S.house(OPT_TALL(variant)),
    vol: (variant) => S.houseVol(OPT_TALL(variant)),
  });

  // ============================================================================================ rowhouses (2x3, flush side walls)
  // Rowhouses stand shoulder to shoulder, so their side walls and roof run right to the stamp edge (no side outline) and a terrace of
  // them reads as one long building. The door is in the west column. rowhouse_shop has a shopfront with an awning and a sign, and its
  // doorway is recessed into the bottom-left cell (walkable), where the shopkeeper stands.
  const SHOPS = {
    post: { roof: 'red', awn: 'red', sign: 'post', top: 4, wall: { base: 'p1', hi: 'p0', sh: 'p2', dk: 'p3' } },
    bakery: { roof: 'brown', awn: 'yellow', sign: 'bread', top: 20, wall: { base: 'p1', hi: 'p0', sh: 'p2', dk: 'p3' } },
    tackle: { roof: 'navy', awn: 'teal', sign: 'fish', top: 'dormer', wall: { base: 'p1', hi: 'p0', sh: 'p2', dk: 'p3' } },
    haberdashery: { roof: 'purple', awn: 'pink', sign: 'spool', top: 11, wall: { base: 'p1', hi: 'p0', sh: 'p2', dk: 'p3' } },
  };
  const ROW_RISE = 24, ROW_RB = 21, ROW_RT = 4;
  function rowBody(b, r, W, H, rb, top) {
    // plaster wall from edge to edge, eave shadow, stone plinth
    b.fillRect(0, rb + 1, W, H - rb - 1, P.p1);
    b.hline(0, rb + 1, W, P.p4); b.hline(0, rb + 2, W, P.p3); b.hline(0, rb + 3, W, P.p2);
    for (let i = 0; i < 10; i++) b.set(1 + (K.h32(i, W, 11) % (W - 2)), rb + 6 + (K.h32(i, H, 12) % (H - rb - 12)), P.p2);
    b.fillRect(0, H - 3, W, 3, P.c2); for (let x = 1; x < W; x += 4) b.set(x, H - 2, P.c3); b.hline(0, H - 1, W, P.c4);
    // party-wall posts at both edges, so neighbours read as separate houses
    b.fillRect(0, rb + 1, 2, H - rb - 1, P.o3); b.vline(0, rb + 1, H - rb - 1, P.o2);
    b.fillRect(W - 2, rb + 1, 2, H - rb - 1, P.o4);
    // roof: shingles edge to edge, a dark ridge line on top, shingles catching more light towards the ridge, a 2px dark eave band at the
    // bottom (its shadow falls on the wall), and the dark outline down both sides like house_home
    K.roof(b, 0, ROW_RT, W - 1, rb, r, { inset: 0, row: 5, alt: r[1] });
    for (let y = ROW_RT + 3; y < ROW_RT + 8; y++) for (let x = 0; x < W; x++) { const c = b.u32[y * W + x]; if (c === r[2]) b.set(x, y, r[1]); else if (c === r[3]) b.set(x, y, r[2]); }
    for (let y = rb - 5; y < rb - 2; y++) for (let x = 0; x < W; x++) { const c = b.u32[y * W + x]; if (c === r[1]) b.set(x, y, r[2]); }
    b.hline(0, ROW_RT, W, r[4]);
    b.hline(0, rb - 2, W, r[1]); b.hline(0, rb - 1, W, r[4]); b.hline(0, rb, W, r[5]);
    b.vline(0, ROW_RT, rb - ROW_RT + 1, r[5]); b.vline(W - 1, ROW_RT, rb - ROW_RT + 1, r[5]);
    // what breaks the skyline differs from house to house: a chimney left, middle or right, or a little dormer
    if (top === 'dormer') {
      for (let i = 0; i < 5; i++) b.hline(16 - 1 - i, i, 2 + i * 2, i === 0 ? r[1] : i < 3 ? r[2] : r[3]);
      b.hline(11, 4, 10, r[4]);
      b.fillRect(12, 5, 8, 7, P.p1); b.vline(19, 5, 7, P.p3); S.window(b, 14, 6, 4, 4, {}); b.hline(12, 11, 8, r[4]);
    } else if (top !== undefined) S.chimney(b, top, 2, 8);
  }
  /** Volume for a rowhouse: flush walls; setback moves the 3D front plane back so whoever stands in a recessed doorway stays visible. */
  const rowVol = (o, setback) => Object.assign(S.houseVol(o), { wl: 0, wr: o.w * 16 - 1, roofL: 0, roofR: o.w * 16 - 1, inset: 6, setback: setback || 0 });

  const OPT_ROW = () => ({ w: 2, h: 3, rise: ROW_RISE, ramp: R('green'), roofTop: ROW_RT, roofBottom: ROW_RB, inset: 6, doorCol: 0, windows: [{ x: 18, y: 44, w: 11, h: 12, curtain: true }] });
  K.stamp('rowhouse', {
    w: 2, h: 3, rise: ROW_RISE, solid: ['##', '##', 'D#'],
    paint: () => {
      const W = 32, H = 48 + ROW_RISE, r = R('green'), b = K.B(W, H);
      rowBody(b, r, W, H, ROW_RB, 21);
      S.window(b, 9, 28, 14, 8, { curtain: r });                                    // upstairs window under the eave
      S.door(b, 3, H - 31, 11, 31);
      b.fillRect(1, H - 3, 15, 3, P.c1); b.hline(1, H - 3, 15, P.c0);               // doorstep
      S.window(b, 18, 44, 11, 12, { curtain: r });
      S.flowerBox(b, 17, 60, 13, BLOOM);
      K.outer(b, S.omap([[S.tones(r), r[5]], [[P.o2, P.o3, P.o4], P.o6]], 'p6'));
      return b;
    },
    vol: () => rowVol(OPT_ROW()),
  });

  /** little hanging trade sign: post office envelope, loaf, fish, spool */
  function tradeSign(b, x, y, kind) {
    b.hline(x - 1, y - 2, 12, P.o4); b.set(x, y - 1, P.n3); b.set(x + 9, y - 1, P.n3);
    b.fillRect(x, y, 10, 8, P.p0); b.strokeRect(x, y, 10, 8, P.o4);
    if (kind === 'post') { b.fillRect(x + 2, y + 2, 6, 4, P.p1); b.line(x + 2, y + 2, x + 4, y + 4, P.red2); b.line(x + 7, y + 2, x + 5, y + 4, P.red2); b.hline(x + 2, y + 5, 6, P.red2); }
    else if (kind === 'bread') { b.fillRect(x + 2, y + 3, 6, 3, P.o1); b.hline(x + 3, y + 2, 4, P.o1); b.set(x + 4, y + 3, P.o3); b.set(x + 6, y + 3, P.o3); b.hline(x + 2, y + 5, 6, P.o3); }
    else if (kind === 'fish') { b.fillRect(x + 3, y + 3, 4, 2, P.bl1); b.set(x + 2, y + 4, P.bl1); b.set(x + 7, y + 2, P.bl2); b.set(x + 7, y + 5, P.bl2); b.set(x + 8, y + 3, P.bl2); b.set(x + 8, y + 4, P.bl2); b.set(x + 3, y + 3, P.ink); }
    else {   // a cotton reel: two wooden flanges, pink thread wound between them, a loose end
      b.hline(x + 2, y + 1, 6, P.o1); b.hline(x + 2, y + 6, 6, P.o3); b.set(x + 7, y + 1, P.o3); b.set(x + 2, y + 6, P.o2);
      b.fillRect(x + 3, y + 2, 4, 4, P.pk2); b.vline(x + 3, y + 2, 4, P.pk1); b.vline(x + 6, y + 2, 4, P.pk3); b.set(x + 4, y + 3, P.pk0);
      b.set(x + 7, y + 4, P.pk2); b.set(x + 8, y + 5, P.pk2);
    }
  }
  const OPT_SHOP = (v) => ({ w: 2, h: 3, rise: ROW_RISE, ramp: R(SHOPS[v].roof), roofTop: ROW_RT, roofBottom: ROW_RB, inset: 6, doorCol: 0, windows: [{ x: 19, y: 30, w: 9, h: 9 }] });
  K.stamp('rowhouse_shop', {
    w: 2, h: 3, rise: ROW_RISE, solid: ['##', '##', '.#'], variants: Object.keys(SHOPS),
    paint: (v, f, mode) => {
      const W = 32, H = 48 + ROW_RISE, sh = SHOPS[v], r = R(sh.roof), a = R(sh.awn), b = K.B(W, H);
      rowBody(b, r, W, H, ROW_RB, sh.top);
      S.window(b, 19, 28, 9, 9, { curtain: a });                                          // upstairs
      // the recessed doorway (bottom-left cell): dark side walls, a tiled step, and the door set back
      const ry = H - 32;
      b.fillRect(2, ry, 14, 32, P.p5); b.fillRect(2, ry, 14, 3, P.p6);
      b.fillRect(3, ry + 3, 2, 26, P.p4); b.vline(3, ry + 3, 26, P.p3); b.fillRect(13, ry + 3, 2, 26, P.p6);
      S.door(b, 6, ry + 6, 7, 21);
      b.fillRect(1, ry - 2, 16, 2, P.o4); b.hline(1, ry - 2, 16, P.o3);                                  // lintel over the recess
      b.fillRect(2, ry, 14, 2, P.ink2); b.fillRect(3, ry + 2, 12, 2, P.p6); b.hline(5, ry + 4, 9, P.p5); // its shadow falling into the set-back
      b.fillRect(2, H - 5, 14, 5, P.c1); for (let x = 3; x < 16; x += 3) b.set(x, H - 4, P.c2); b.hline(2, H - 5, 14, P.c0); b.hline(2, H - 1, 14, P.c3);
      // shop window full of wares, with a striped awning over it (the awning is real geometry in 3D)
      b.fillRect(17, H - 26, 13, 20, P.o5); b.fillRect(18, H - 25, 11, 18, P.gl3); b.set(19, H - 24, P.gl1); b.line(20, H - 24, 23, H - 21, P.gl2);
      const wy = H - 12;
      if (v === 'post') { for (const [x, c] of [[19, P.p0], [23, P.yl2], [26, P.p0]]) { b.fillRect(x, wy, 3, 4, c); b.set(x, wy, P.red2); } }
      else if (v === 'bakery') { for (const x of [19, 23, 26]) { b.fillRect(x, wy + 1, 3, 3, P.o1); b.hline(x, wy + 1, 3, P.o0); b.set(x + 1, wy + 2, P.o3); } }
      else if (v === 'tackle') { b.line(20, wy - 6, 22, wy + 3, P.o3); b.line(25, wy - 6, 27, wy + 3, P.o3); b.fillRect(23, wy + 1, 3, 2, P.red2); b.set(24, wy + 1, P.p0); }
      else { for (const [x, c] of [[19, P.pk1], [22, P.bl1], [25, P.yl2]]) { b.fillRect(x, wy, 3, 4, c); b.hline(x - 0, wy - 1, 3, P.o2); b.hline(x, wy + 4, 3, P.o2); } }
      b.hline(17, H - 6, 13, P.p0);                                                         // sill
      if (mode !== '3d') S.awning(b, 16, H - 32, 15, 4, a[1], P.p0, [a[0], a[3], a[4], P.p2]);
      tradeSign(b, 4, 29, sh.sign);
      K.outer(b, S.omap([[S.tones(r), r[5]], [S.tones(a), a[5]], [[P.o2, P.o3, P.o4], P.o6]], 'p6'));
      return b;
    },
    vol: (v) => Object.assign(rowVol(OPT_SHOP(v), 8), { awnings: [{ x0: 16, x1: 31, y: 48 + ROW_RISE - 32, h: 4, c1: R(SHOPS[v].awn)[1], c2: P.p0, edge: [R(SHOPS[v].awn)[0], R(SHOPS[v].awn)[3], R(SHOPS[v].awn)[4], P.p2] }] }),
  });

  // ============================================================================================ the tree house (3x3)
  // A plank hut with a patchwork roof, built on a platform in a big oak. The ladder in the middle of the bottom row is the door.
  // Seen in the present day, a few years after the kids built it (the childhood room is the sepia memory map): the planks have
  // weathered to silver-brown with two newer honey boards nailed over the worst spots, the red roof has faded to dusty rose with
  // one bright replacement shingle patch, moss creeps along the eaves and the foot of the walls, ivy climbs the trunk and a post,
  // the bunting under the eave and the pennant have bleached pale (one flag gone), and the painted flower by the door has faded.
  const TH_ROOF = ['#f4cab8', '#e0a49a', '#c4807c', '#a0646a', '#7a4c58', '#4a2c38'].map(col);   // the sun-faded red
  const TH_OLD = [P.r0, P.r1, P.r2, P.r3, P.r4];                                                   // weathered planks
  const TH_MOSS = [P.t1, P.t2];   // eave and platform moss
  const TH_FLAGS = ['#e48c9c', '#8cacdc', '#e4c470', '#9cc884'].map(col);                          // bleached bunting
  K.stamp('treehouse', {
    w: 3, h: 3, rise: 16, solid: ['###', '###', '#D#'],
    paint: () => {
      const W = 48, H = 64, b = K.B(W, H);
      const moss = (x, y, n, seed) => { for (let i = 0; i < n; i++) { const hx = K.h32(seed, i, 3); b.set(x + i, y - (hx % 3 === 0 ? 1 : 0), hx % 4 === 0 ? P.f1 : (hx % 4 === 1 ? P.t2 : P.t1)); } };
      // the oak's canopy behind the hut: chunky lobes, lime highlights on their top-left, dark green undersides (a little fuller now)
      for (const [x, y, rx, ry] of [[7, 19, 6, 5], [41, 18, 6, 5], [12, 12, 9, 8], [36, 11, 9, 8], [24, 7, 10, 7], [16, 4, 6, 4], [32, 4, 6, 4], [3, 14, 3, 4]]) K.lobe(b, x, y, rx, ry, K.TN.leaf);
      for (const [x, y] of [[8, 7], [21, 2], [29, 1], [33, 6], [4, 15], [13, 1], [39, 13]]) { b.hline(x, y, 3, P.f0); b.set(x, y + 1, P.f1); b.set(x + 1, y + 1, P.f0); }
      // trunk and roots behind the ladder
      K.cyl(b, 30, 30, 10, 32, K.TN.bark);
      b.fillRect(27, H - 4, 16, 3, P.b3); b.set(26, H - 3, P.b3); b.set(43, H - 2, P.b3);
      // hut: weathered silver-brown plank walls (alternate planks a shade apart), knots and a few dark weather streaks
      b.fillRect(8, 22, 30, 16, P.r2);
      for (let y = 22, i = 0; y < 38; y += 3, i++) if (i & 1) b.fillRect(8, y + 1, 30, 2, P.v1);
      for (let y = 24; y < 38; y += 3) b.hline(8, y, 30, P.r3);
      for (const [x, y] of [[11, 26], [24, 23], [35, 29], [15, 35]]) { b.set(x, y, P.r4); b.set(x + 1, y, P.r3); }
      for (const x of [10, 17, 33]) { b.set(x, 25, P.r3); b.set(x, 28, P.r3); }                     // rain streaks under the eave
      b.vline(8, 22, 16, P.r1); b.vline(37, 22, 16, P.r4);
      // a newer honey board nailed over the lower right, and the faded painted flower above it
      b.fillRect(29, 34, 8, 2, P.o2); b.hline(29, 34, 8, P.o1); b.hline(29, 36, 8, P.o3);
      b.set(30, 35, P.n3); b.set(35, 35, P.n3);
      K.stick(b, 30, 28, [
        '..pp..',
        '.pPPp.',
        'pPyyPp',
        '.pyyp.',
        '..pp..',
        '...s..',
      ], { p: TH_ROOF[0], P: TH_FLAGS[0], y: TH_FLAGS[2], s: P.t2 });
      // the roof: faded to dusty rose, one patch of bright new shingles, moss along the eave
      K.roof(b, 5, 11, 41, 23, TH_ROOF, { inset: 7, row: 4 });
      const RR = R('red');
      // the replacement patch: two shingles of the old bright red, one course, with their own seams and catch-light
      const RP = RR.map((c) => NP.Color.mix(c, TH_ROOF[2], 0.3));                  // newer, but already toned by a summer
      for (let y = 18; y <= 21; y++) for (let x = 26; x <= 33; x++) b.set(x, y, y === 21 || x === 26 || x === 30 || y === 20 ? RP[3] : y === 18 ? RP[1] : RP[2]);
      // moss in three clumps along the eave: a dark foot row, a lit cushion above, one lime tip
      for (const [x, w] of [[7, 5], [20, 4], [33, 5]]) { b.hline(x, 22, w, P.t2); b.hline(x + 1, 21, w - 2, P.t1); b.set(x + 1, 21, P.f1); }
      // the round window (glass gone a little dull) in a greyed frame
      b.circle(13, 30, 3, P.r4, true); b.circle(13, 30, 2, P.gl3, true); b.set(13, 31, P.gl2); b.set(14, 30, P.gl2); b.set(12, 29, P.gl1); b.set(13, 28, P.gl1);
      // the doorway, right over the ladder: a weathered frame, the dark inside and a glimpse of the floor
      b.fillRect(19, 26, 10, 12, P.r1); b.vline(28, 26, 12, P.r3); b.hline(19, 26, 10, P.r0);
      b.fillRect(20, 27, 8, 11, P.ink2); b.fillRect(20, 35, 8, 3, P.o5); b.hline(20, 35, 8, P.o4); b.hline(20, 27, 8, P.o6);
      // bleached bunting under the eave, sagging from corner to corner; one flag has blown away (a gap on the string)
      // (flags fill rows 24-26 only, so they clear the round window and the painted flower; the gap is over the door)
      const sag = (x) => 23 + Math.round(Math.sin(Math.PI * (x - 7) / 32));
      for (let x = 7; x <= 39; x++) b.set(x, sag(x), P.r4);
      [[9, 0], [15, 1], [27, 2], [33, 3]].forEach(([x, c]) => {
        const y = 24, f = TH_FLAGS[c];
        b.hline(x, y, 5, f); b.hline(x + 1, y + 1, 3, f); b.set(x + 2, y + 2, f); b.set(x + 4, y, P.r0); b.set(x + 3, y + 1, P.r0);   // bleached paler on the east
      });
      // the pennant on its pole: bleached pale, its tail frayed into a notch
      b.vline(40, 3, 9, P.r3); b.vline(40, 3, 1, P.r1);
      b.fillRect(41, 3, 5, 2, TH_FLAGS[2]); b.fillRect(41, 5, 3, 1, TH_FLAGS[2]); b.set(45, 4, 0); b.set(44, 3, P.r0);
      // platform: grey old boards with one new honey board at the east end, moss tufts on its lip
      b.fillRect(3, 38, 42, 4, P.r3); b.hline(3, 38, 42, P.r1); b.hline(3, 39, 42, P.r2); b.hline(3, 41, 42, P.r4);
      for (let x = 6; x < 44; x += 6) b.set(x, 39, P.r4);
      b.fillRect(34, 38, 10, 4, P.o2); b.hline(34, 38, 10, P.o1); b.hline(34, 41, 10, P.o4); b.set(35, 39, P.n3); b.set(42, 39, P.n3);
      moss(4, 38, 5, 4); moss(13, 38, 3, 5); moss(9, 37, 4, 6);
      // posts holding the platform, ivy winding up the west one
      b.fillRect(6, 42, 3, H - 44, P.r3); b.vline(6, 42, H - 44, P.r2); b.vline(8, 42, H - 44, P.r4);
      // the ladder (the door tile, x 16-31): grey rails, worn rungs, the second rung a fresh replacement
      for (const x of [18, 28]) { b.fillRect(x, 42, 2, H - 43, P.r2); b.vline(x, 42, H - 43, P.r1); b.vline(x + 1, 42, H - 43, P.r3); }
      for (let y = 45, i = 0; y < H - 1; y += 4, i++) b.hline(20, y, 8, i === 1 ? P.o1 : P.r1);
      // ivy: a stem wandering up the trunk east of the ladder and up the west post, leaves in pairs, a lit tip on each
      // (painted on its own layer after the outline: a broken f3 stem, f2/f1 leaves, and an f5 edge only where it hangs past the wood)
      const vine = K.B(W, H);
      const ivy = (x0, y0, y1, ph) => {
        for (let y = y0, i = 0; y >= y1; y--, i++) {
          const x = x0 + Math.round(1.3 * Math.sin((y + ph) / 3));
          if (i % 3 !== 2) vine.set(x, y, P.f3);
          if ((y + ph) % 3 === 0) { const sd = ((y + ph) / 3) & 1 ? 1 : -1; vine.set(x + sd, y, P.f2); vine.set(x + sd * 2, y, P.f2); vine.set(x + sd, y - 1, P.f1); }
        }
      };
      ivy(34, 62, 43, 0); ivy(7, 62, 46, 1);
      // a rope with an old bucket on the side, rust on its rim
      b.vline(42, 42, 10, P.r3); b.fillRect(40, 52, 5, 4, P.n3); b.hline(40, 52, 5, P.n1); b.hline(41, 53, 3, P.n5); b.set(40, 55, 0); b.set(44, 55, 0); b.set(41, 54, P.o3);
      // moss and fern at the roots
      moss(27, H - 5, 4, 7); moss(37, H - 4, 5, 8);
      K.outer(b, S.omap([[K.TN.leaf, P.f6], [K.TN.bark, P.b4], [S.tones(TH_ROOF), TH_ROOF[5]], [S.tones(RP), RR[5]], [TH_OLD, P.r5], [TH_MOSS, P.f5],
        [TH_FLAGS, P.r4], [STONE, P.n5]], 'o6'));
      const before = b.u32.slice();
      b.blit(vine, 0, 0);
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
        if (!(vine.u32[y * W + x] >>> 24)) continue;
        for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
          const xx = x + dx, yy = y + dy;
          if (xx >= 0 && yy >= 0 && xx < W && yy < H && !(before[yy * W + xx] >>> 24) && !(vine.u32[yy * W + xx] >>> 24)) b.set(xx, yy, P.f5);
        }
      }
      K.shadow(b, 24, H - 2, 18, 2);
      return b;
    },
  });

  // ============================================================================================ shipyard
  K.stamp('winch', {
    w: 1, h: 1, rise: 4,
    paint: () => {
      const b = K.B(16, 20);
      // a darker steel base plate bolted to the deck
      b.fillRect(1, 15, 14, 3, P.n4); b.hline(1, 15, 14, P.n3); b.hline(1, 17, 14, P.n5);
      for (const x of [2, 13]) b.set(x, 16, P.n2);
      // two grey side plates, rounded on top, lit on their west edges, an axle bolt in each
      for (const x of [2, 12]) {
        b.fillRect(x, 5, 2, 10, P.n3); b.vline(x, 5, 10, P.n2); b.vline(x + 1, 6, 9, P.n4);
        b.set(x, 5, P.n2); b.set(x + 1, 5, P.n3); b.set(x, 9, P.n1);
      }
      // the horizontal drum between them: an 8px coil of rope, lit along the top, dark underneath, a darker band between turns
      const ROW = [P.hy0, P.hy1, P.hy1, P.hy2, P.hy2, P.hy3, P.hy4];
      for (let x = 4; x <= 11; x++) for (let y = 6; y <= 12; y++) {
        const t = y - 6, band = (x - 4) % 2 === 1;
        b.set(x, y, band ? ROW[Math.min(6, t + 2)] : ROW[t]);
      }
      b.set(4, 6, P.hy1); b.set(11, 6, P.hy1); b.hline(4, 13, 8, P.o5);                            // rounded ends, its shadow below
      // a crank out of the east plate: an arm and a round wooden handle knob
      b.set(14, 9, P.n2); b.set(15, 9, P.n3); b.vline(15, 6, 3, P.n2);
      b.fillRect(14, 4, 2, 2, P.o2); b.set(14, 4, P.o0);
      // the rope's loose end running off the drum onto the plate
      b.set(9, 14, P.hy2); b.set(10, 15, P.hy2); b.set(11, 15, P.hy3);
      out(b, [[[P.hy0, P.hy1, P.hy2, P.hy3, P.hy4], P.o6], [[P.n1, P.n2, P.n3, P.n4, P.n5], P.n6]]);
      K.shadow(b, 8, 18, 8, 1, 120);
      return b;
    },
  });

  K.stamp('net_rack', {
    w: 2, h: 1, rise: 10,
    paint: () => {
      const b = K.B(32, 26);
      for (const x of [2, 28]) { b.fillRect(x, 3, 2, 21, P.o3); b.vline(x, 3, 21, P.o2); }
      b.fillRect(1, 2, 30, 3, P.o2); b.hline(1, 2, 30, P.o0); b.hline(1, 4, 30, P.o4);              // crossbar, lit top edge
      out(b);
      // the net: a blue-grey rope lattice in 1px diamonds, open so the planks show through, sagging in a curve between the posts
      const bottom = (x) => 13 + Math.round(6 * Math.sin(Math.PI * (x - 4) / 23));
      const net = K.B(32, 26);
      for (let x = 4; x < 28; x++) {
        const bt = bottom(x);
        for (let y = 5; y <= bt; y++) {
          const sag = Math.round((y - 5) / (bt - 5 || 1) * (bt - 13) * 0.6);                         // the diamonds stretch down the sag
          const u = (x + y - sag + 600) % 5, w = (x - y + sag + 600) % 5;
          if (u === 0 || w === 0) net.set(x, y, u === 0 && w === 0 ? P.n5 : y < 9 ? P.n3 : P.n4);
        }
        net.set(x, bt, P.n4); net.set(x, bt + 1, P.n5);                                                // the foot rope
      }
      b.blit(net, 0, 0);
      // orange floats spaced along the foot rope
      for (const x of [9, 16, 23]) {
        const y = bottom(x) + 1;
        K.stick(b, x - 2, y, ['.kkk.', 'kaabk', '.kkk.'], { k: P.red4, a: P.l2, b: P.l3 });
      }
      K.shadow(b, 16, 24, 14, 1);
      return b;
    },
  });

  K.stamp('lobster_pots', {
    w: 1, h: 1, rise: 6,
    paint: () => {
      const b = K.B(16, 22);
      // two domed creels (round-topped net traps on a flat wooden base): a dark inside seen through a 1 px twine cross-hatch, two
      // wooden hoops arching over the dome, lit on the top left. The back one is a little higher; a coil of rope and a small buoy.
      // m = the net over the dark inside: a 1 px twine cross-hatch (alternate pixels, staggered row to row)
      const CREEL = [
        '...OOOh...',
        '..OmmmmH..',
        '.OmmmmmmH.',
        'OmmmmmmmmH',
        'OmmmmmmmmH',
        'BBBBBBBBBB',
        'bbbbbbbbbb',
      ];
      for (const [x0, y0] of [[4, 6], [0, 12]]) {                                                       // the back creel, then the front one
        const l = K.B(16, 22);
        CREEL.forEach((row, j) => { for (let i = 0; i < row.length; i++) {
          const ch = row[i], x = x0 + 1 + i, y = y0 + 1 + j;
          const c = ch === 'm' ? ((x + y) & 1 ? P.v5 : (i < 5 ? P.hy0 : P.hy2)) : { O: P.o1, h: P.o2, H: P.o3, B: P.o2, b: P.o4 }[ch];
          if (c) l.set(x, y, c);
        } });
        K.outer(l, P.o6); b.blit(l, 0, 0);
      }
      // a coil of rope on the ground at the front right
      K.stick(b, 11, 17, ['.ccc.', 'cCddc', 'cd.Cc', '.cCc.'], { c: P.hy2, C: P.hy1, d: P.hy4 });
      // a small red-and-white buoy hanging off the back creel on a short line
      b.set(14, 6, P.o6); b.set(15, 7, P.o6);
      K.stick(b, 13, 8, ['hr', 'ww', 'rR'], { h: P.red1, r: P.red2, R: P.red3, w: P.p0 });
      K.outer(b, S.omap([[[P.hy1, P.hy2, P.hy4], P.o6], [[P.red1, P.red2, P.red3, P.p0], P.red4]], 'o6'));
      K.shadow(b, 8, 21, 8, 1);
      return b;
    },
  });

  K.stamp('mooring_post', {
    w: 1, h: 1, rise: 4,
    paint: () => {
      const b = K.B(16, 20);
      // a cast-iron bollard: a round neck in 3 tones (a light NW column, a mid face, a dark east column), a wider mushroom cap
      // with a lip, a foot flange
      const NECK = [P.n1, P.n2, P.n2, P.n2, P.n4, P.n4];
      for (let y = 7; y <= 14; y++) for (let i = 0; i < 6; i++) b.set(5 + i, y, NECK[i]);
      for (let i = 0; i < 8; i++) { b.set(4 + i, 15, i < 1 ? P.n1 : i < 6 ? P.n2 : P.n4); b.set(4 + i, 16, P.n4); }
      for (let i = 0; i < 12; i++) { const c = i < 3 ? P.n1 : i < 9 ? P.n2 : P.n3; b.set(2 + i, 3, c); b.set(2 + i, 4, c); b.set(2 + i, 5, P.n4); b.set(2 + i, 6, P.n5); }
      b.set(2, 3, 0); b.set(13, 3, 0); b.hline(4, 2, 8, P.n2); b.set(4, 2, P.n1); b.set(5, 2, P.n1);
      // two turns of rope coiled round the neck (a 1px dark rope with lit twists) and a loop trailing off east towards the water
      for (const y of [9, 11]) { b.hline(5, y, 6, P.o4); for (let x = 5; x <= 10; x += 2) b.set(x, y, P.o2); }
      for (const [x, y] of [[11, 10], [12, 10], [13, 11], [14, 12], [14, 13], [13, 14], [12, 14], [12, 13], [13, 16], [14, 17], [15, 17]]) b.set(x, y, P.o3);
      out(b, [[[P.n1, P.n2, P.n3, P.n4, P.n5], P.n6]], 'o5');
      K.shadow(b, 8, 18, 6, 1, 110);
      return b;
    },
  });

  // ---- boats: walk-over stamps drawn on the sea, bobbing on 2 frames
  K.stamp('boat_fishing', {
    w: 2, h: 2, solid: ['..', '..'], frames: 2, animSpeed: 32,
    paint: (v, f) => {
      // 3/4 view like boat_cargo: the deck seen from above, bow north (a rounded bow, not a point), and the hull's south face (the
      // transom) showing as a band under the deck. It bobs 1px between the frames and the foam moves.
      const b = K.B(32, 32), dy = f, bl = R('blue'), rd = R('red');
      const CX = 15.5, TOP = 1 + dy, DECK_B = 24 + dy;
      const half = (y) => {                                          // half-width of the hull at row y
        const t = y - TOP;
        if (t < 0) return -1;
        if (t < 14) return 0.4 + 12 * Math.pow(t / 14, 0.72);            // an ogive bow: pointed tip, full curved shoulders
        return 12.4;                                                     // straight sides back to a squared stern
      };
      for (let y = TOP; y <= DECK_B + 4; y++) {
        const yy = Math.min(y, DECK_B), hw = half(yy);
        if (hw < 0.5) continue;
        const x0 = Math.round(CX - hw), x1 = Math.round(CX + hw);
        for (let x = x0; x <= x1; x++) {
          let c;
          if (y > DECK_B) c = y === DECK_B + 1 ? bl[2] : y === DECK_B + 2 ? P.p0 : y === DECK_B + 4 ? bl[4] : bl[3];   // transom with a white stripe
          else {
            const h2 = half(y - 2), inner = h2 > 0 && y < DECK_B - 1 && x >= Math.round(CX - hw) + 2 && x <= Math.round(CX + hw) - 2 && x >= Math.round(CX - h2) + 1 && x <= Math.round(CX + h2) - 1;
            const edge = !inner && (x === x0 || x === x1 || y === TOP || h2 <= 0 || y === DECK_B || x < Math.round(CX - h2) || x > Math.round(CX + h2));
            if (inner) c = ((x - 3) & 3) === 0 ? P.o3 : P.o2;                                     // deck planks running fore and aft
            else if (x < CX && y < DECK_B - 1) c = edge ? bl[0] : bl[1];                           // gunwale: lit on the top-left
            else c = edge ? bl[4] : bl[3];                                                         // and shaded on the bottom-right
          }
          if (y > DECK_B && x === x0) c = y === DECK_B + 2 ? P.p0 : bl[2];
          if (y > DECK_B && x === x1) c = y === DECK_B + 2 ? P.p2 : bl[4];
          b.set(x, y, c);
        }
      }
      b.hline(Math.round(CX - half(DECK_B)) + 1, DECK_B, Math.round(2 * half(DECK_B)) - 1, bl[4]);   // the stern rail's dark edge
      // the wheelhouse aft of midships: a low cabin with a flat white roof seen from above (lit NW edge, a dark eave), then its south
      // face with a band of three windows under a red trim stripe
      const wx = 14, wy = 12 + dy;
      b.fillRect(wx, wy, 11, 5, P.p1); b.hline(wx, wy, 11, P.p0); b.vline(wx, wy, 5, P.p0); b.vline(wx + 10, wy + 1, 4, P.p2);
      b.hline(wx, wy + 5, 11, P.p3);                                                                 // the roof's eave
      b.hline(wx, wy + 6, 11, rd[2]);                                                                // red trim
      b.fillRect(wx, wy + 7, 11, 4, P.p2); b.vline(wx + 10, wy + 7, 4, P.p3); b.hline(wx, wy + 10, 11, P.p3);
      b.hline(wx + 1, wy + 7, 9, P.gl3); b.hline(wx + 1, wy + 8, 9, P.gl2);                          // the window band
      for (const x of [wx + 1, wx + 4, wx + 7]) b.set(x, wy + 7, P.gl1);
      for (const x of [wx + 3, wx + 6]) { b.set(x, wy + 7, P.p3); b.set(x, wy + 8, P.p3); }           // mullions
      b.set(wx + 5, wy + 1, P.n3); b.set(wx + 5, wy + 2, P.n4);                                      // a little horn on the roof
      // a plain wooden mast forward of it with an outrigger pole swung out to port
      const mx = 10;
      b.fillRect(mx, 4 + dy, 2, 2, P.o2); b.set(mx, 4 + dy, P.o1);
      b.vline(mx + 1, 6 + dy, 7, P.o3); b.vline(mx, 6 + dy, 7, P.o1);
      b.line(mx - 1, 8 + dy, 3, 13 + dy, P.o2); b.set(3, 14 + dy, P.o4);
      // a pile of green net on the after deck
      K.stick(b, 4, 18 + dy, ['.nNn.', 'nmnmn', 'mnmnm'], { n: P.f2, N: P.f1, m: P.f4 });
      // two orange floats and a coil of rope on the deck
      for (const [x, y] of [[9, 20]]) { b.fillRect(x, y + dy, 2, 2, P.l2); b.set(x + 1, y + 1 + dy, P.l3); }
      b.fillRect(18, 22 + dy, 3, 1, P.hy2); b.set(18, 22 + dy, P.hy1); b.set(20, 22 + dy, P.hy3);
      // the bow wave: a white line peeling off each side of the pointed bow, longer on one frame
      for (let i = 0; i < 5 + f; i++) { const y = TOP + 1 + i, hw = half(y) + 1 + (i >> 1); b.set(Math.round(CX - hw), y, P.w0); b.set(Math.round(CX + hw), y, P.w0); }
      // foam round the stern: it moves with the frame
      const foam = f ? [[0, 22], [29, 19], [3, 30], [22, 30]] : [[0, 18], [29, 24], [7, 30], [19, 30]];
      for (const [x, y] of foam) { b.hline(x, y, 2, P.w0); b.set(x + 2, y, P.w1); }
      K.outer(b, S.omap([[S.tones(bl), bl[5]], [S.tones(rd), rd[5]], [[P.l2, P.l3], P.l4], [[P.p0, P.p1, P.p2, P.p3], P.p6], [[P.hy1, P.hy2, P.hy3], P.o6], [[P.w0, P.w1], P.w2], [[P.f1, P.f2, P.f4], P.f6], [[P.gl1, P.gl2, P.gl3], P.p6]], 'o6'));
      return b;
    },
  });

  K.stamp('boat_cargo', {
    w: 5, h: 3, solid: ['.....', '.....', '.....'], frames: 2, animSpeed: 32,
    paint: (v, f) => {
      const W = 80, H = 48, b = K.B(W, H), dy = f, r = R('red'), n = R('navy');
      // hull, bow to the east, the bow drawn as a smooth curve in clean 1-2-3 px steps
      const T = 10 + dy, B = 40 + dy, MID = 25 + dy;
      const bowX = (y) => { const t = Math.min(1, Math.abs(y - MID) / 15.5); return 64 + Math.round(13 * Math.pow(1 - t, 0.55)); };
      for (let y = T; y <= B; y++) {
        const xr = bowX(y);
        for (let x = 3; x <= xr; x++) {
          let c;
          if (y >= 34 + dy) c = y === 34 + dy ? r[1] : y >= 38 + dy ? r[4] : r[2];                 // red bottom: lit top, mid, dark at the waterline
          else if (y === 33 + dy) c = P.p0;
          else c = y <= T + 1 ? n[1] : y >= 30 + dy ? n[3] : n[2];
          if (x >= xr - 1 && y < 33 + dy) c = y < MID ? n[1] : n[3];
          b.set(x, y, c);
        }
      }
      // deck, following the same curve two px in
      for (let y = 12 + dy; y <= 31 + dy; y++) { const xr = bowX(y) - 3; for (let x = 5; x <= xr; x++) b.set(x, y, ((x - 3) % 5) === 0 ? P.o3 : P.o2); }
      b.hline(5, 12 + dy, 58, P.o1);
      // wheelhouse at the stern: a cream front, a darker east side face, a red roof slab with a dark front edge
      b.fillRect(7, 8 + dy, 13, 17, P.p1); b.vline(7, 8 + dy, 17, P.p0); b.hline(7, 24 + dy, 13, P.p2);
      b.fillRect(20, 7 + dy, 3, 17, P.p3); b.vline(22, 7 + dy, 17, P.p4); b.set(20, 7 + dy, P.p2);   // side face, going back
      b.fillRect(6, 4 + dy, 18, 3, r[1]); b.hline(6, 4 + dy, 18, r[0]); b.hline(6, 7 + dy, 15, r[4]); b.fillRect(21, 6 + dy, 3, 2, r[3]);
      for (const x of [9, 15]) { b.strokeRect(x - 1, 10 + dy, 6, 5, P.p4); b.fillRect(x, 11 + dy, 4, 3, P.gl3); b.hline(x, 11 + dy, 4, P.gl2); b.set(x, 11 + dy, P.gl0); b.set(x + 3, 13 + dy, P.gl4); }
      b.fillRect(10, 17 + dy, 6, 8, P.o4); b.vline(10, 17 + dy, 8, P.o3); b.set(14, 21 + dy, P.gd2);
      b.fillRect(17, 1 + dy, 3, 4, P.n2); b.hline(17, 1 + dy, 3, P.n1); b.vline(19, 2 + dy, 3, P.n3);  // funnel
      // cargo crates and sacks
      const crate = (x, y, c) => { b.fillRect(x, y, 9, 8, c); b.hline(x, y, 9, P.o1); b.strokeRect(x, y, 9, 8, P.o4); b.line(x, y, x + 8, y + 7, P.o4); };
      crate(30, 16 + dy, P.o2); crate(40, 16 + dy, P.o3); crate(35, 9 + dy, P.o2);
      for (const [x, y] of [[52, 18], [57, 21], [52, 23]]) { b.fillRect(x, y + dy, 5, 4, P.hy2); b.hline(x, y + dy, 5, P.hy1); b.set(x + 2, y + dy, P.hy3); }
      // a lifebuoy on the wheelhouse side and a coil of rope at the bow
      b.circle(26, 22 + dy, 2, r[1], true); b.set(26, 22 + dy, P.o2); b.set(24, 22 + dy, P.p0); b.set(28, 22 + dy, P.p0);
      b.circle(67, 24 + dy, 2, P.hy2, false);
      // a soft wake: foam trailing off the stern and along the waterline, moving between the frames
      const wake = f ? [[0, 37, 2], [0, 41, 3], [10, 43, 5], [30, 43, 4], [52, 42, 3], [74, 34, 2]] : [[0, 35, 3], [1, 40, 2], [16, 43, 4], [38, 43, 5], [58, 42, 3], [73, 37, 2]];
      for (const [x, y, w] of wake) { b.hline(x, y + dy, w, P.w0); b.set(x + w, y + dy, P.w1); }
      K.outer(b, S.omap([[S.tones(n), n[5]], [S.tones(r), r[5]], [[P.p0, P.p1, P.p2, P.p3, P.p4], P.p6], [[P.hy1, P.hy2, P.hy3], P.o6], [[P.w0, P.w1], P.w2]], 'o6'));
      return b;
    },
  });

  // ============================================================================================ Kigu Park
  K.stamp('swing_set', {
    w: 2, h: 1, rise: 16,
    paint: () => {
      const b = K.B(32, 32), r = R('red'), y = R('yellow');
      // A-frame legs at both ends and the top bar
      for (const x of [3, 27]) { b.line(x - 2, 30, x, 3, r[2]); b.line(x + 2, 30, x + 1, 3, r[3]); }
      b.fillRect(1, 2, 30, 3, r[2]); b.hline(1, 2, 30, r[1]); b.hline(1, 4, 30, r[4]);
      // two swing seats (outlined), then their thin chains drawn over the outline
      for (const x of [9, 19]) { b.fillRect(x - 1, 24, 7, 2, y[2]); b.hline(x - 1, 24, 7, y[1]); b.hline(x - 1, 25, 7, y[4]); }
      K.outer(b, S.omap([[S.tones(r), r[5]], [S.tones(y), y[5]]], 'o6'));
      for (const x of [9, 19]) for (let yy = 5; yy < 24; yy++) { const c = yy & 1 ? P.n2 : P.n4; b.set(x, yy, c); b.set(x + 4, yy, c); }
      K.shadow(b, 16, 30, 13, 1);
      return b;
    },
  });

  K.stamp('slide', {
    w: 1, h: 2, rise: 8,
    paint: () => {
      const b = K.B(16, 40), r = R('red'), y = R('yellow'), bl = R('blue');
      // the ladder rising behind the platform at the north end: two steel rails and rungs, each rung with a shadow under it
      for (const x of [4, 11]) { b.vline(x, 1, 11, P.n1); b.set(x, 1, P.n0); b.vline(x + (x === 4 ? 1 : -1), 2, 10, P.n3); }
      for (let yy = 3; yy < 10; yy += 3) { b.hline(5, yy, 6, P.n1); b.hline(6, yy + 1, 4, P.n4); }
      // the platform: a blue deck with side rails standing up either side (posts and a top rail, lit on the west)
      b.fillRect(2, 10, 12, 4, bl[2]); b.hline(2, 10, 12, bl[1]); b.hline(3, 11, 10, bl[1]); b.hline(2, 13, 12, bl[4]);
      for (const x of [2, 13]) { b.vline(x, 5, 6, x === 2 ? bl[1] : bl[3]); b.set(x, 5, bl[0]); }
      b.hline(2, 5, 2, bl[1]); b.hline(12, 5, 2, bl[2]);
      // the chute: a yellow bed, lighter down its centre, 1 px red side rails, widening slightly towards the bottom
      for (let yy = 14; yy <= 35; yy++) {
        const t = (yy - 14) / 21, w = t > 0.66 ? 1 : 0;
        const x0 = 3 - w, x1 = 12 + w;
        b.hline(x0 + 1, yy, x1 - x0 - 1, t < 0.5 ? y[1] : y[2]);
        b.hline(6, yy, 3, t < 0.5 ? y[0] : y[1]);                                                      // the polished centre strip
        b.set(x0 + 1, yy, y[3]);
        b.set(x0, yy, r[2]); b.set(x1, yy, r[3]);
      }
      b.hline(3, 14, 10, y[3]);                                                                       // where the chute leaves the deck
      // the run-out: a flat lip at the bottom, a step wider, lit on top, dark on its front edge
      b.fillRect(1, 36, 14, 2, y[2]); b.hline(1, 36, 14, y[1]); b.hline(1, 37, 14, y[3]);
      b.set(1, 36, r[2]); b.set(14, 36, r[3]); b.set(1, 37, r[3]); b.set(14, 37, r[4]);
      K.outer(b, S.omap([[S.tones(r), r[5]], [S.tones(y), y[5]], [S.tones(bl), bl[5]], [STONE, P.n5]], 'o6'));
      K.shadowRect(b, 14, 16, 1, 20, 70);                                                             // its shadow, cast east
      K.shadow(b, 8, 39, 7, 1);
      return b;
    },
  });

  // Spring riders: ride-on toys shaped like the three starter Kigu's costumes (Konko's fox ears and flame tail, Ottopi's round ears and
  // paddle tail, Sprubun's long ears and a sprout), in two-tone toy plastic with a saddle, a handle and simple dot eyes, on a big coil spring
  const RIDERS = { konko: 'orange', ottopi: 'teal', sprubun: 'mint' };

  K.stamp('spring_rider', {
    w: 1, h: 1, rise: 6, variants: Object.keys(RIDERS),
    paint: (v) => {
      const b = K.B(16, 22), r = R(RIDERS[v]), lt = r[1], base = r[2], dk = r[3];
      const fill = (cx, cy, rx, ry) => { for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++) for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) { const d = ((x - cx) / (rx + 0.5)) ** 2 + ((y - cy) / (ry + 0.5)) ** 2; if (d <= 1) b.set(x, y, (x - cx) + (y - cy) * 1.3 < -1.2 ? lt : (y - cy) > ry * 0.55 ? dk : base); } };
      // the coil spring and its base plate
      b.ellipse(8, 19.5, 4.5, 1.5, P.n3, true); b.hline(5, 19, 6, P.n2); b.hline(5, 21, 6, P.n4);        // the base disc
      for (let k = 0; k < 3; k++) {                                                                       // a coil spring: 3 turns, each a lit row over a dark row
        const yy = 13 + k * 2;
        b.hline(6, yy, 4, P.n1); b.set(5, yy, P.n2); b.set(10, yy, P.n2);
        b.hline(5, yy + 1, 6, P.n4); b.set(5, yy + 1, P.n3);
      }
      // tail first (behind the body)
      if (v === 'konko') { fill(13, 7, 1.5, 3); b.set(13, 3, P.yl1); b.set(12, 4, P.yl1); b.set(14, 5, P.red2); b.set(13, 4, P.yl1); }   // flame tail
      else if (v === 'ottopi') { fill(13, 12, 2, 1); b.set(14, 13, dk); }                                                                       // paddle tail
      else { b.fillRect(13, 9, 2, 2, P.p0); }                                                                             // cotton tail
      // body (a rounded shell) and the saddle on its back
      fill(9, 11, 4.5, 2.5);
      b.fillRect(5, 13, 3, 1, v === 'sprubun' ? P.pk1 : P.p0);                                          // a pale tummy patch
      // head with the costume's ears, and a toy face: one dot eye and a cheek
      if (v === 'konko') {                                                                                 // tall fox ears with dark tips
        b.fillRect(2, 1, 2, 4, base); b.set(2, 2, lt); b.fillRect(6, 1, 2, 4, dk); b.set(3, 3, P.pk1); b.set(6, 3, P.pk1);
        b.hline(2, 0, 2, r[4]); b.hline(6, 0, 2, r[4]); b.set(2, 1, r[4]); b.set(7, 1, r[4]);
      } else if (v === 'ottopi') {                                                                         // round ears and a big back fin
        b.fillRect(3, 3, 2, 2, base); b.fillRect(6, 3, 2, 2, dk); b.set(3, 3, lt);
        K.stick(b, 9, 4, ['..f', '.ff', 'fFF', 'fFF'], { f: lt, F: base });
      } else {                                                                                             // long bunny ears, pink inside
        b.fillRect(3, 0, 2, 5, lt); b.fillRect(6, 0, 2, 5, base); b.vline(4, 1, 3, P.pk1); b.vline(7, 1, 3, P.pk1);
      }
      fill(5, 7, 3, 3);
      if (v === 'konko') { b.fillRect(1, 7, 2, 2, P.p0); b.set(1, 8, P.ink); }                          // pointed muzzle
      else if (v === 'ottopi') { b.fillRect(1, 7, 2, 2, P.p0); b.set(1, 7, P.ink); }                    // round snout and nose
      else { b.set(2, 8, P.pk1); b.set(9, 4, P.f3); b.set(10, 3, P.f2); b.set(9, 3, P.f2); }            // pink nose, a sprout
      b.set(4, 6, P.ink); b.set(4, 5, P.p0); b.set(4, 8, P.pk1);
      // handle pegs sticking out of both sides of the head, and a foot peg on the body, so she reads as a ride
      b.set(0, 6, P.n1); b.set(1, 6, P.n2); b.set(8, 6, P.n2); b.set(9, 6, P.n3);
      b.set(6, 14 - 1, P.n2); b.set(5, 13, P.n1);
      // a red saddle with a lit top
      b.fillRect(8, 8, 4, 2, P.red2); b.hline(8, 8, 4, P.red1);
      const ol = v === 'sprubun' ? R('teal')[5] : r[5];
      K.outer(b, ol);
      K.shadow(b, 8, 21, 6, 1);
      return b;
    },
  });

  // The obstacle course, laid out on the park's mulch and drawn from above (owner, playtest 1: it stood up like a billboard in 3D and
  // its sand pad read as a sandbox). A row of five painted tyres lying flat across the top to hop through, a blue balance beam on two
  // red blocks, three stepping stumps, and a hollow log on its side to crawl through (open end west). No pad under it: the mulch
  // shows between the pieces, and nothing is painted in the mulch's own browns (critic, round 1), so every piece stands off it.
  //  3D (prism3d, like the side-on bench): each piece is a low box of a few px (tyres 4, stumps 4, beam 5, log 7) with its top
  //  painted by the same code as the flat art, so the course still lies on the ground but keeps enough height to read at the
  //  street camera's foreshortening.
  const OC = (() => {
    const red = R('red'), blue = R('blue'), PAINT = ['red', 'yellow', 'blue', 'red', 'yellow'].map(R);
    const TYRES = [[4.5, 5], [13.5, 5], [22.5, 5], [31.5, 5], [40.5, 5]];
    const STUMPS = [[4.5, 27, 3.4], [12.5, 28.2, 3.2], [20.5, 27, 3.4]];
    const LOG = { x0: 28, x1: 43, y: 23.5, r: 4.5 };
    const BEAM = { x0: 3, x1: 23, y: 13, blocks: [5, 19] };
    const ell = (bm, cx, cy, rx, ry, fn) => {
      for (let y = Math.floor(cy - ry - 1); y <= Math.ceil(cy + ry + 1); y++) for (let x = Math.floor(cx - rx - 1); x <= Math.ceil(cx + rx + 1); x++) {
        const dx = (x + 0.5 - cx) / rx, dy = (y + 0.5 - cy) / ry, d = dx * dx + dy * dy;
        if (d <= 1) fn(x, y, dx, dy, d);
      }
    };
    const outline = (L) => K.outer(L, S.omap([[[P.n3, P.n4, P.n5, P.n6], P.n6], ...PAINT.map((r) => [[r[1], r[2], r[3]], r[5]]),
      [[blue[1], blue[2], blue[3], blue[4], P.n0], blue[5]], [[red[2], red[3], red[4]], red[5]],
      [[P.o0, P.o1, P.o3, P.o5], P.o6], [[P.b0, P.b1, P.b2, P.b3, P.b4], P.o6], [[P.v6], P.o6]], 'o6'));
    // the pieces, each painted onto L (side: also its 3/4-view side, which the flat view shows and the 3D tops leave to quads)
    const tyre = (L, k, side) => {
      const [cx, cy] = TYRES[k], r = PAINT[k];
      if (side) ell(L, cx, cy + 1, 4.2, 3.2, (x, y) => L.set(x, y, P.n5));                         // the black tread below the top
      ell(L, cx, cy, 4.2, 3.2, (x, y, dx, dy) => L.set(x, y, dx + dy < -0.7 ? r[1] : dx + dy < 0.5 ? r[2] : r[3]));
      ell(L, cx, cy, 2.8, 1.9, (x, y) => L.set(x, y, P.n5));                                       // the hole's bare rubber wall
    };
    const tyreHoles = (b) => { for (const [cx, cy] of TYRES) ell(b, cx, cy - 0.3, 2.2, 1.2, (x, y) => b.set(x, y, 0)); };
    const stump = (L, k, side) => {
      const [cx, cy, r] = STUMPS[k];
      if (side) ell(L, cx, cy + 1.2, r, r * 0.7, (x, y) => L.set(x, y, P.b3));
      // the cut top: pale wood in a bark rim, its heart a darker dot with one lit pixel of ring beside it
      ell(L, cx, cy, r, r * 0.7, (x, y, dx, dy, d) => L.set(x, y, d > 0.72 ? (dx + dy < 0 ? P.b2 : P.b3) : P.o1));
      L.set(Math.floor(cx), Math.floor(cy), P.o3); L.set(Math.floor(cx) - 1, Math.floor(cy) - 1, P.o0);
    };
    const log = (L) => {
      const { x0, x1, y: ly, r: lr } = LOG;
      for (let x = x0; x <= x1; x++) for (let y = Math.ceil(ly - lr); y <= Math.floor(ly + lr); y++) {
        const t = (y + 0.5 - ly) / lr;
        let c = t < -0.6 ? P.b0 : t < -0.2 ? P.b1 : t < 0.3 ? P.b2 : t < 0.7 ? P.b3 : P.b4;          // a lit crown, a dark underside
        if ((x + (y >> 1) * 3) % 6 === 0 && t > -0.7 && t < 0.3) c = P.b3;                         // bark seams
        if ((x * 7 + y * 3) % 11 === 0 && t < -0.2) c = P.b2;                                       // lit bark flecks
        L.set(x, y, c);
      }
      L.set(37, 21, P.b4); L.set(38, 21, P.b4);                                                     // a knot
      ell(L, x1 + 0.5, ly, 1.6, lr, (x, y, dx, dy, d) => L.set(x, y, d > 0.5 ? P.o3 : P.o1));        // the east cut face
      ell(L, x0, ly, 2.2, lr, (x, y, dx, dy, d) => L.set(x, y, d > 0.45 ? P.o1 : P.o0));             // the west cut face, a pale ring...
      ell(L, x0, ly + 0.3, 1.2, lr - 1.5, (x, y) => L.set(x, y, P.v6));                             // ...round the dark hollow
    };
    const beam = (L, side) => {
      const { x0, x1, y: by, blocks } = BEAM, w = x1 - x0 + 1;
      if (side) for (const x of blocks) { L.fillRect(x, by + 3, 3, 4, red[2]); L.vline(x, by + 3, 4, red[2]); L.vline(x + 2, by + 3, 4, red[4]); L.hline(x, by + 6, 3, red[3]); }
      L.fillRect(x0, by, w, 3, blue[2]); L.hline(x0, by, w, blue[1]);
      if (side) { L.fillRect(x0, by + 3, w, 2, blue[3]); L.hline(x0, by + 4, w, blue[4]); }
      for (const x of [10, 16]) L.set(x, by + 1, blue[3]);                                          // plank joints
      L.fillRect(x0 + 1, by, 1, side ? 5 : 3, P.n0); L.fillRect(x1 - 1, by, 1, side ? 5 : 3, P.n0); // white tape at the start and end
    };
    // ---- flat: all of it, outlined, a soft v5 shadow 1 right and 2 down on the mulch, then the tyre holes opened
    const flat = () => {
      const b = K.B(48, 32), L = K.B(48, 32);
      for (let k = 0; k < TYRES.length; k++) tyre(L, k, true);
      for (let k = 0; k < STUMPS.length; k++) stump(L, k, true);
      log(L); beam(L, true);
      outline(L);
      for (let y = 0; y < 30; y++) for (let x = 0; x < 47; x++) if ((L.u32[y * 48 + x] >>> 24) && !(L.u32[(y + 2) * 48 + x + 1] >>> 24)) b.set(x + 1, y + 2, P.v5);
      b.blit(L, 0, 0);
      tyreHoles(b);
      return b;
    };
    // ---- 3D: the low boxes. top(x0, y0, w, h, z, paintFn) crops a piece's top, painted and outlined on its own; front(...) is a
    //      south-facing wall from z0 to z1 in flat bands of colour (top row lit, bottom row darkest)
    const prism = () => {
      const faces = [];
      const top = (x0, y0, w, h, z, fn) => {
        const L = K.B(48, 32); fn(L); outline(L);
        const t = K.B(w, h); t.blit(L, -x0, -y0);
        faces.push({ tex: t, pts: [[x0, y0 + h, z], [x0 + w, y0 + h, z], [x0 + w, y0, z], [x0, y0, z]], n: [0, 0, 1] });
        return t;
      };
      const wall = (w, h, bands) => { const t = K.B(w, h); for (let y = 0; y < h; y++) t.hline(0, y, w, bands[Math.min(bands.length - 1, Math.floor(y * bands.length / h))]); return t; };
      const front = (x0, x1, y, z0, z1, bands) => faces.push({ tex: wall(x1 - x0, Math.max(1, z1 - z0), bands), pts: [[x0, y, z0], [x1, y, z0], [x1, y, z1], [x0, y, z1]], n: [0, 1, 0] });
      const side = (x, y0, y1, z0, z1, bands, west) => faces.push({ tex: wall(y1 - y0, Math.max(1, z1 - z0), bands),
        pts: west ? [[x, y0, z0], [x, y1, z0], [x, y1, z1], [x, y0, z1]] : [[x, y1, z0], [x, y0, z0], [x, y0, z1], [x, y1, z1]], n: [west ? -1 : 1, 0, 0] });
      for (let k = 0; k < TYRES.length; k++) {
        const [cx, cy] = TYRES[k], x0 = Math.floor(cx - 5), y0 = Math.floor(cy - 4);
        const t = top(x0, y0, 10, 8, 4, (L) => tyre(L, k, false));
        // the holes, in the cropped top's own coordinates
        ell(t, cx - x0, cy - 0.3 - y0, 2.2, 1.2, (x, y) => t.set(x, y, 0));
        front(x0 + 1, x0 + 9, cy + 3.2, 0, 4, [PAINT[k][2], PAINT[k][3], PAINT[k][4], P.n6]);   // painted side, rubber at the foot
      }
      for (let k = 0; k < STUMPS.length; k++) {
        const [cx, cy, r] = STUMPS[k], x0 = Math.floor(cx - r - 1), y0 = Math.floor(cy - r);
        top(x0, y0, Math.ceil(2 * r + 2), Math.ceil(2 * r), 4, (L) => stump(L, k, false));
        front(x0 + 2, x0 + Math.ceil(2 * r), cy + r * 0.7, 0, 4, [P.b1, P.b3, P.b3, P.b4]);
      }
      const { x0: bx0, x1: bx1, y: by, blocks } = BEAM;
      top(bx0 - 1, by - 1, bx1 - bx0 + 3, 5, 5, (L) => beam(L, false));
      front(bx0 - 1, bx1 + 2, by + 3.5, 3, 5, [blue[3], blue[4]]);
      for (const x of blocks) { front(x, x + 3, by + 3, 0, 3, [red[2], red[3], red[4]]); side(x, by, by + 3, 0, 3, [red[2], red[3]], true); }
      const { x0: lx0, x1: lx1, y: ly, r: lr } = LOG;
      top(lx0 - 3, Math.floor(ly - lr - 1), lx1 - lx0 + 6, Math.ceil(2 * lr + 2), 7, (L) => log(L));
      front(lx0, lx1 + 1, ly + lr, 0, 7, [P.b1, P.b2, P.b2, P.b3, P.b3, P.b4, P.o6]);   // the log's round flank, lit on top
      // the west end standing up: a cut face with the dark hollow, so you see into the tunnel
      const end = K.B(10, 7);
      for (let y = 0; y < 7; y++) for (let x = 0; x < 10; x++) {
        const dx = (x + 0.5 - 5) / 5, dy = (y + 0.5 - 3.5) / 3.5, d = dx * dx + dy * dy;
        if (d <= 1) end.set(x, y, d > 0.75 ? P.o6 : d > 0.3 ? P.o1 : P.v6);
      }
      faces.push({ tex: end, pts: [[lx0 - 2, ly - 5, 0], [lx0 - 2, ly + 5, 0], [lx0 - 2, ly + 5, 7], [lx0 - 2, ly - 5, 7]], n: [-1, 0, 0] });
      return faces;
    };
    return { flat, prism };
  })();
  K.stamp('obstacle_course', {
    w: 3, h: 2, prism3d: () => OC.prism(),
    paint: () => OC.flat(),
  });

  // Mom's wooden herb planters: herbs (mint and basil), tomato (a staked plant with ripe tomatoes), flowers (pink and yellow)

  K.stamp('picnic_table', {
    w: 2, h: 1, rise: 2,
    paint: () => {
      const b = K.B(32, 18);
      // three separate strips with grass between them: the north bench, the tabletop, the south bench
      b.fillRect(3, 1, 26, 2, P.o2); b.hline(3, 1, 26, P.o1);                                           // north bench
      b.fillRect(1, 6, 30, 5, P.o2); b.hline(1, 6, 30, P.o1); b.hline(1, 8, 30, P.o3); b.hline(1, 10, 30, P.o4);   // tabletop: planks, front edge
      b.fillRect(3, 14, 26, 2, P.o2); b.hline(3, 14, 26, P.o1); b.hline(3, 15, 26, P.o4);               // south bench
      // a gingham cloth over the west end of the table, and a cup of cocoa on the east
      for (let y = 6; y <= 10; y++) for (let x = 1; x <= 11 - (y - 6); x++) b.set(x, y, ((x >> 1) + (y >> 1)) & 1 ? P.red1 : P.p0);
      b.fillRect(22, 6, 3, 3, P.p0); b.set(25, 7, P.p0); b.hline(22, 6, 3, P.o4); b.set(24, 8, P.p2);
      out(b, [[[P.red1, P.p0, P.p2], P.red3]]);
      for (let x = 0; x < 32; x++) { b.set(x, 4, 0); b.set(x, 12, 0); }                                 // the grass gaps stay open
      // A-frame legs showing under the south bench
      for (const x of [6, 24]) { b.set(x, 16, P.o5); b.set(x + 2, 16, P.o5); b.set(x - 1, 17, P.o5); b.set(x + 3, 17, P.o5); }
      K.shadow(b, 16, 17, 13, 1);
      return b;
    },
  });

  K.stamp('herb_planter', {
    w: 1, h: 1, rise: 2, variants: ['herbs', 'tomato', 'flowers'],
    paint: (v) => {
      const b = K.B(16, 18);
      if (v === 'herbs') {
        K.lobe(b, 5, 7, 3, 3, K.TN.leafLight); K.lobe(b, 10, 6, 4, 4, K.TN.leaf);
        b.set(4, 5, P.f0); b.set(11, 4, P.f1); b.set(9, 6, P.f0);
      } else if (v === 'tomato') {
        b.vline(11, 0, 10, P.o3); b.set(11, 0, P.o1);                                                    // the stake
        K.lobe(b, 6, 6, 4, 4, K.TN.leaf); K.lobe(b, 10, 5, 3, 3, K.TN.leaf);
        b.vline(11, 3, 3, P.o3);
        for (const [x, y] of [[3, 4], [7, 2], [8, 6], [4, 7]]) { b.fillRect(x, y, 2, 2, P.red2); b.set(x, y, P.red0); }
      } else {
        K.lobe(b, 8, 7, 6, 3, K.TN.leaf);
        for (const [x, y, c] of [[4, 5, P.pk1], [7, 4, P.yl1], [10, 5, P.pk1], [12, 7, P.yl1], [6, 7, P.yl1], [9, 7, P.pk1]]) { b.set(x, y, c); b.set(x + 1, y, c); b.set(x, y - 1, P.p0); }
      }
      // the planter box, with a dark line of soil at the top
      b.fillRect(2, 9, 12, 7, P.o2); b.hline(2, 9, 12, P.o1); b.hline(2, 15, 12, P.o4);
      b.hline(2, 12, 12, P.o3); b.vline(13, 10, 6, P.o3);
      b.hline(3, 10, 10, P.d5);
      out(b, [[K.TN.leaf, P.f6], [K.TN.leafLight, P.f5], [[P.pk1, P.yl1, P.p0], P.f6], [[P.red0, P.red2], P.red4]]);
      K.shadow(b, 8, 17, 6, 1);
      return b;
    },
  });

  K.stamp('firewood', {
    w: 1, h: 1, rise: 2,
    paint: () => {
      const b = K.B(16, 18);
      // logs stacked end on in a brick pattern (2, then 2 offset by half a log, then 1): each end a round of pale wood, a lighter
      // growth ring and a dark 1 px heart, rimmed in bark
      const LOG = ['.bbb.', 'b011b', 'b1c2b', 'b122b', '.bbb.'];
      const map = { b: P.b2, 0: P.o0, 1: P.o1, 2: P.o2, c: P.o5 };
      for (const [x, y] of [[0, 12], [5, 12], [2, 8], [7, 8], [4, 4]]) K.stick(b, x, y, LOG, map);
      // a chopping stump in front at the right, the axe head buried in its top and the handle angled up and out
      b.fillRect(10, 12, 6, 5, P.b2); b.vline(10, 12, 5, P.b1); b.vline(15, 12, 5, P.b3); b.hline(10, 16, 6, P.b3);
      K.stick(b, 10, 10, ['.0000.', '012221'], { 0: P.o0, 1: P.o1, 2: P.o2 });
      b.set(13, 11, P.o4);
      K.stick(b, 11, 8, ['.ss.', 'sSSs', '.nn.'], { s: P.n2, S: P.n0, n: P.n4 });                    // the axe head, its blade in the wood
      b.line(13, 7, 15, 3, P.o3); b.line(12, 7, 14, 3, P.o2); b.set(15, 2, P.o4);                      // the handle
      out(b, [[K.TN.bark, P.b4], [STONE, P.n5], [[P.n2, P.n0, P.n4], P.n5], [[P.o0, P.o1, P.o2, P.o4, P.o5], P.b4]]);
      K.shadow(b, 8, 17, 8, 1);
      return b;
    },
  });

  K.stamp('tyre_swing', {
    w: 1, h: 1, rise: 12,
    paint: () => {
      const b = K.B(16, 28);
      // a wooden A-frame: a top beam on two splayed legs
      for (let y = 3; y <= 26; y++) {
        const t = (y - 3) / 23, xl = Math.round(3 - t * 2), xr = Math.round(12 + t * 2);
        b.set(xl, y, P.o2); b.set(xr, y, P.o4);
      }
      b.fillRect(2, 1, 12, 2, P.o2); b.hline(2, 1, 12, P.o1); b.hline(3, 3, 10, P.o5);                // the top beam and its shadow
      out(b);
      // two 1px ropes from the beam down to the tyre, slightly offset
      b.vline(6, 4, 12, P.o1); b.vline(10, 4, 11, P.o3); b.set(6, 9, P.o3); b.set(10, 8, P.o1);
      // the tyre hanging, tilted a little: dark grey rubber, a lighter top arc, and a darker inner hole
      const t = K.B(16, 28);
      K.stick(t, 4, 15, [
        '..hhhhh..',
        '.hhrrrrr.',
        'hrrkkkrrd',
        'rrkkkkkrd',
        '.rrrrrdd.',
        '...dddd..',
      ], { h: P.n3, r: P.n4, d: P.n5, k: P.ink2 });
      K.outer(t, 'ink');
      b.blit(t, 0, 0);
      K.shadow(b, 8, 26, 5, 1);
      return b;
    },
  });

  // ============================================================================================ Route 1 grotto
  // A mossy rock mound with a cave mouth in its bottom-left cell (walkable, 'west'); the rest is solid rock.
  K.stamp('grotto', {
    w: 2, h: 2, solid: ['##', '.#'], variants: ['west'],
    paint: () => {
      const b = K.B(32, 32);
      K.lobe(b, 17, 15, 14, 13, K.TN.rock);
      K.lobe(b, 9, 10, 7, 6, K.TN.rock); K.lobe(b, 24, 9, 7, 7, K.TN.rock);
      // moss on the top
      for (let x = 4; x < 29; x++) { const t = 3 + Math.round(2 * Math.sin(x * 0.7)); for (let y = t; y < t + 3; y++) if (b.u32[y * 32 + x] >>> 24) b.set(x, y, y === t ? P.g2 : P.g3); }
      // crack lines in the rock, each a dark line with a lit lip on its upper-left
      for (const pts of [[[20, 12], [22, 15], [21, 18], [23, 21]], [[27, 14], [26, 17], [28, 20]], [[13, 9], [15, 12], [14, 14]]]) {
        for (let i = 1; i < pts.length; i++) b.line(pts[i - 1][0], pts[i - 1][1], pts[i][0], pts[i][1], P.r4);
        for (const [x, y] of pts) b.set(x - 1, y, P.r1);
      }
      // the cave mouth (bottom-left cell): an irregular dark arch, wider at the bottom, rimmed in the rock's own darkest tone,
      // with two rock teeth hanging from its roof
      const hw = (y) => { const t = (y - 17) / 14; return t < 0 ? -1 : 6.2 * Math.sqrt(Math.min(1, t * 2.4)) + t * 1.3 + (y % 3 === 0 ? 0.4 : 0); };
      for (let y = 16; y <= 31; y++) {
        const w = hw(y);
        for (let x = 0; x < 16; x++) {
          const d = Math.abs(x + 0.5 - 8.5);
          if (d <= w) b.set(x, y, y >= 30 ? P.v5 : P.v6);
          else if (d <= w + 1.2 || (w < 0 && y === 16 && d < 3)) b.set(x, y, P.r5);
        }
      }
      b.vline(6, 19, 2, P.r5); b.set(6, 21, P.r4); b.vline(11, 19, 1, P.r5); b.set(11, 20, P.r4);
      // a few ferns at the foot, inside the bounds
      b.line(18, 30, 19, 26, P.f3); b.line(20, 30, 21, 27, P.f2); b.line(27, 30, 28, 26, P.f3);
      K.outer(b, S.omap([[K.TN.rock, P.r6], [[P.r4, P.r5], P.r6], [[P.g2, P.g3], P.g6], [[P.v5, P.v6], P.v6], [[P.f2, P.f3], P.f6]], 'r6'));
      return b;
    },
  });

  // ============================================================================================ the pond grotto's mouth
  // Button Town's grotto is a hollow in a low outcrop of mossy boulders (terrain `grotto_rock`) on the pond's east bank. The mouth
  // opens WEST onto the pond: you paddle in over `grotto_water` (darkening into shadow) to a rock ledge with the Wish Candy at the back.
  // This walk-over 2x1 sits on the mouth row (the terrain does the blocking); its footprint is the cave's top row, its 3D roof covers
  // the 2x2 cave.
  //  Flat: the overhang's dark lip along the north wall's foot, with moss and a fern hanging from it and drips below; nothing on
  //  the water itself, so whoever paddles in is drawn over it.
  //  3D (prism3d): the cave's roof as quads: a mossy top level with the outcrop, a west face of boulders with a ragged arch cut
  //  out of it (transparent texels, so you look into the cave), and dark inner walls (back, north and south) so the inside reads as
  //  shadow, not as the lit rock of the blocks around it.
  const GH = 30, LINTEL = 7;
  function grottoMouthFaces() {
    const tl = NP.art.tiles, ink = P.r5;
    // the roof: the outcrop's mossy top, two tiles wide
    const top = K.B(32, 32);
    for (let y = 0; y < 32; y++) for (let x = 0; x < 32; x++) top.set(x, y, tl.grottoTop(x & 15, y & 15, ((x >> 4) + (y >> 4)) & 1));
    // a face with its opening cut out: open(x) = the first open row (row 0 is the top), GH = solid. The lintel's lower edge is
    // ragged, inked, and hung with moss strands.
    const cut = (tex, open, moss) => {
      for (let x = 0; x < tex.w; x++) { const y0 = open(x); for (let y = y0; y < GH; y++) tex.set(x, y, 0); }
      for (let y = 0; y < GH; y++) for (let x = 0; x < tex.w; x++) {
        if (!tex.get(x, y)) continue;
        if (!tex.get(x, y + 1 < GH ? y + 1 : y) || (x > 0 && !tex.get(x - 1, y)) || (x < tex.w - 1 && !tex.get(x + 1, y))) tex.set(x, y, ink);
      }
      for (const [x, n] of moss) { const y0 = open(x); if (y0 >= GH) continue; for (let k = 0; k < n; k++) tex.set(x, y0 + k, k === n - 1 ? P.f4 : k & 1 ? P.f2 : P.f3); }
      return tex;
    };
    const jag = (x, s) => (K.h32(x, s, 91) % 4 === 0 ? 1 : K.h32(x, s, 92) % 5 === 0 ? -1 : 0);
    // west face (texture x runs north to south): the rock comes down to the water at the north end, then a wide low opening that
    // runs out round the south-west corner
    const west = cut(tl.grottoFace3d(32, 0, 0, GH), (x) => {
      if (x < 3) return GH;
      const t = Math.min(1, (x - 3) / 8);
      return Math.round(GH - (GH - LINTEL) * Math.sqrt(t * (2 - t))) + jag(x, 3);
    }, [[8, 3], [12, 5], [13, 2], [18, 4], [22, 6], [23, 3], [27, 4], [30, 2]]);
    // south face of the west half (texture x runs west to east): open from the corner to the outcrop's south spur
    const south = cut(tl.grottoFace3d(16, 1, 0, GH), (x) => (x > 13 ? GH : x > 11 ? LINTEL + 6 + (x - 12) * 6 : LINTEL + jag(x, 5)), [[2, 4], [5, 2], [9, 5]]);
    // the inside: deep shade, a little light near the openings, wet glints on the back wall, a dark band at the waterline
    // the inside, up to the ceiling (CZ): deep shade, a little light near the openings, wet glints on the back wall, a dark band
    // at the waterline
    const CZ = GH - LINTEL;
    const dark = (w, lightFrom) => {
      const b = K.B(w, CZ);
      for (let y = 0; y < CZ; y++) for (let x = 0; x < w; x++) {
        const lt = lightFrom === 'w' ? x : lightFrom === 'e' ? w - 1 - x : 99;
        const n = K.hf(x >> 1, y >> 1, 93);
        let c = lt < 3 ? P.r4 : lt < 7 ? (n > 0.5 ? P.r5 : P.v5) : n > 0.78 ? P.v5 : P.v6;
        if (y >= CZ - 2) c = y === CZ - 1 ? P.w6 : P.v6;
        b.set(x, y, c);
      }
      if (lightFrom === undefined) for (const [x, y] of [[6, 5], [13, 10], [22, 4], [27, 13], [18, 16]]) { b.set(x, y, P.w5); b.set(x, y + 1, P.v5); }
      return b;
    };
    return [
      { tex: top, pts: [[0, 32, GH], [32, 32, GH], [32, 0, GH], [0, 0, GH]], n: [0, 0, 1] },
      { tex: west, pts: [[0, 0, 0], [0, 32, 0], [0, 32, GH], [0, 0, GH]], n: [-1, 0, 0] },
      { tex: south, pts: [[0, 32, 0], [16, 32, 0], [16, 32, GH], [0, 32, GH]], n: [0, 1, 0] },
      // the roof's south edge over the east half (the outcrop's own blocks south of it may stand lower than the roof)
      { tex: tl.grottoFace3d(16, 0, 0, GH), pts: [[16, 32, 0], [32, 32, 0], [32, 32, GH], [16, 32, GH]], n: [0, 1, 0] },
      { tex: dark(32), pts: [[31, 0, 0], [31, 32, 0], [31, 32, CZ], [31, 0, CZ]], n: [-1, 0, 0], noCull: true, shade: 210 },
      { tex: dark(32, 'w'), pts: [[0, 0.5, 0], [31, 0.5, 0], [31, 0.5, CZ], [0, 0.5, CZ]], n: [0, 1, 0], noCull: true, shade: 220 },
      { tex: dark(16, 'e'), pts: [[31, 31.5, 0], [16, 31.5, 0], [16, 31.5, CZ], [31, 31.5, CZ]], n: [0, -1, 0], noCull: true, shade: 200 },
      // the ceiling, so looking up under the overhang never shows the sky
      { tex: dark(32), pts: [[0.5, 0, CZ], [0.5, 32, CZ], [31, 32, CZ], [31, 0, CZ]], n: [0, 0, -1], noCull: true, shade: 180 },
    ];
  }
  K.stamp('grotto_mouth', {
    // clear3d: the forest tiles just south of the outcrop (in front of the camera) get no billboard trees, so the mouth stays in view
    w: 2, h: 1, solid: ['..'], clear3d: [1, 4, 2, 2], prism3d: () => grottoMouthFaces(),
    paint: () => {
      // the brow: the rock face of the overhang hanging 6-9 px down over the mouth (deeper toward the back), a boulder face lit from
      // the top left with a dark underside, its shadow dithered over the water below, and moss and a fern hanging off it
      const b = K.B(32, 16);
      const depth = (x) => 6 + (x > 6 ? 1 : 0) + (x > 18 ? 1 : 0) + (K.h32(x, 1, 95) % 3 === 0 ? 1 : 0);
      for (let x = 0; x < 32; x++) {
        const d = depth(x), seam = (x % 6 === 0) || (x % 6 === 5 && K.h32(x, 2, 96) & 1);
        for (let y = 0; y < d; y++) {
          let c = y === d - 1 ? P.r6 : y === d - 2 ? P.r5 : seam ? P.r4 : y < 2 ? P.r2 : P.r3;
          if (!seam && y < d - 2 && (x % 6 === 1 || x % 6 === 2) && y < 3) c = P.r2;            // each boulder's lit upper left
          if (y === 0 && K.h32(x, 0, 97) % 3 !== 0) c = P.f3;                                     // moss on the brow's top edge
          b.set(x, y, c);
        }
        for (let y = d; y < d + 2 && y < 16; y++) if ((x + y) & 1) b.set(x, y, P.v6);           // its shadow on the water
      }
      for (const [x, n] of [[2, 3], [3, 5], [8, 4], [12, 6], [13, 3], [19, 5], [24, 3], [28, 4], [29, 6]]) {
        const y0 = depth(x) - 1;
        for (let k = 0; k < n && y0 + k < 16; k++) b.set(x, y0 + k, k === n - 1 ? P.f4 : k & 1 ? P.f2 : P.f3);
        if (x % 3 === 0 && y0 + n + 2 < 16) b.set(x, y0 + n + 2, P.w4);                         // a drip
      }
      K.stick(b, 4, 4, ['g.g', '.f.', 'f.f'], { g: P.g2, f: P.f3 });
      return b;
    },
  });

  // ============================================================================================ the kite in the treeline
  // Walk-over (over: 2): a diamond kite tangled in the canopy, its string hanging down into the tile below.
  K.stamp('kite_snag', {
    w: 1, h: 2, over: 2, solid: ['.', '.'],
    paint: () => {
      const b = K.B(16, 32), r = R('pink'), y = R('yellow');
      // the diamond tipped over about 32 degrees where it caught in the branches
      const a = 0.56, ca = Math.cos(a), sa = Math.sin(a), C = [8, 8.5];
      const rot = ([x, yy]) => [Math.round(C[0] + x * ca - yy * sa), Math.round(C[1] + x * sa + yy * ca)];
      const T = rot([0, -7]), Rt = rot([5.5, -1]), Bm = rot([0, 7]), L = rot([-5.5, -1]), M = rot([0, -1]);
      b.polygon([T, Rt, Bm, L], r[2]);
      b.polygon([T, Rt, M], y[2]); b.polygon([L, Bm, M], y[3]);
      b.line(L[0] + 1, L[1] + 1, M[0], Bm[1] - 2, y[4]);                                                // the crumpled quadrant's fold
      b.line(T[0], T[1], Bm[0], Bm[1], P.o5); b.line(L[0], L[1], Rt[0], Rt[1], P.o5);                 // the cross spars
      b.set(T[0] - 1, T[1] + 2, r[0]); b.set(L[0] + 2, L[1], y[0]);
      K.outer(b, 'ink');                                                                              // ink-dark so it reads over the leaves
      // the string: a single 1 px dark line from the kite's bottom tip, sagging in a gentle curve down into the tile below, with
      // small red and yellow tail bows tied along it; a 1 px snag where the frame caught the canopy edge
      const X = Bm[0], Y = Bm[1];
      b.set(T[0] + 1, T[1] - 1, P.o5); b.set(T[0] + 2, T[1] - 2, P.f4);                                // the snag on a twig
      let px = X, py = Y + 1;
      for (let i = 1; i <= 20; i++) {
        const t = i / 20, x = Math.round(X - 4 * Math.sin(Math.PI * t * 0.8) + t * 2), yy = Y + 1 + i;
        if (yy > 31) break;
        b.line(px, py, x, yy, P.o5); px = x; py = yy;
      }
      const tb = (x, yy, c1, c2) => { b.set(x - 1, yy, c1); b.set(x + 1, yy, c1); b.set(x - 1, yy + 1, c2); b.set(x + 1, yy + 1, c2); };
      const at = (i) => [Math.round(X - 4 * Math.sin(Math.PI * (i / 20) * 0.8) + (i / 20) * 2), Y + 1 + i];
      for (const [i, c1, c2] of [[6, P.red1, P.red2], [12, y[1], y[2]], [17, P.red1, P.red2]]) { const [x, yy] = at(i); if (yy < 31) tb(x, yy, c1, c2); }
      return b;
    },
  });
})(typeof globalThis !== 'undefined' ? globalThis : window);
