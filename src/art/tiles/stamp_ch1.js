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
  K.stamp('treehouse', {
    w: 3, h: 3, rise: 16, solid: ['###', '###', '#D#'],
    paint: () => {
      const W = 48, H = 64, b = K.B(W, H);
      // the oak's canopy behind the hut: chunky lobes, lime highlights on their top-left, dark green undersides
      for (const [x, y, rx, ry] of [[7, 19, 6, 5], [41, 18, 6, 5], [12, 12, 9, 8], [36, 11, 9, 8], [24, 7, 10, 7], [16, 4, 6, 4], [32, 4, 6, 4]]) K.lobe(b, x, y, rx, ry, K.TN.leaf);
      for (const [x, y] of [[8, 7], [21, 2], [29, 1], [33, 6], [4, 15], [13, 1], [39, 13]]) { b.hline(x, y, 3, P.f0); b.set(x, y + 1, P.f1); b.set(x + 1, y + 1, P.f0); }
      // trunk and roots behind the ladder
      K.cyl(b, 30, 30, 10, 32, K.TN.bark);
      b.fillRect(27, H - 4, 16, 3, P.b3); b.set(26, H - 3, P.b3); b.set(43, H - 2, P.b3);
      // hut: plank walls, a red patchwork roof, a round window and a pennant
      b.fillRect(8, 22, 30, 16, P.o2);
      for (let y = 24; y < 38; y += 3) b.hline(8, y, 30, P.o3);
      b.vline(8, 22, 16, P.o1); b.vline(37, 22, 16, P.o4);
      K.roof(b, 5, 11, 41, 23, R('red'), { inset: 7, row: 4 });
      b.circle(13, 30, 3, P.o5, true); b.circle(13, 30, 2, P.gl3, true); b.set(12, 29, P.gl1);
      // the doorway, right over the ladder: a lit frame, the dark inside and a glimpse of the floor
      b.fillRect(19, 26, 10, 12, P.o1); b.vline(28, 26, 12, P.o3); b.hline(19, 26, 10, P.o0);
      b.fillRect(20, 27, 8, 11, P.ink2); b.fillRect(20, 35, 8, 3, P.o5); b.hline(20, 35, 8, P.o4); b.hline(20, 27, 8, P.ink);
      b.vline(40, 3, 9, P.o4); b.fillRect(41, 3, 5, 2, P.yl2); b.fillRect(41, 5, 3, 1, P.yl2);   // pennant
      // platform
      b.fillRect(3, 38, 42, 4, P.o3); b.hline(3, 38, 42, P.o1); b.hline(3, 41, 42, P.o4);
      for (let x = 6; x < 44; x += 6) b.set(x, 39, P.o4);
      // posts holding the platform
      b.fillRect(6, 42, 3, H - 44, P.o3); b.vline(6, 42, H - 44, P.o2);
      // the ladder (the door tile, x 16-31)
      for (const x of [18, 28]) { b.fillRect(x, 42, 2, H - 43, P.o2); b.vline(x + 1, 42, H - 43, P.o4); }
      for (let y = 45; y < H - 1; y += 4) b.hline(20, y, 8, P.o1);
      // a rope with a bucket on the side
      b.vline(42, 42, 10, P.hy2); b.fillRect(40, 52, 5, 4, P.n2); b.hline(40, 52, 5, P.n1);
      K.outer(b, S.omap([[K.TN.leaf, P.f6], [K.TN.bark, P.b4], [S.tones(R('red')), R('red')[5]], [[P.hy2], P.o6], [STONE, P.n5]], 'o6'));
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
      // slatted wooden cages: a brown slatted top with dark gaps between the slats, and a grey net mesh on the visible end;
      // two side by side at the bottom and one on top, each outlined so they read as three pots
      const POT = [
        'kkkkkkkk',
        'kabababk',
        'kcdcdcdk',
        'keeeeeek',
        'kfmnmnqk',
        'kfnmnmqk',
        'kfmnmnqk',
        'kkkkkkkk',
      ];
      const map = { k: P.o6, a: P.o1, b: P.o4, c: P.o2, d: P.o5, e: P.o3, f: P.o2, q: P.o4, m: P.n2, n: P.n4 };
      K.stick(b, 0, 13, POT, map);
      K.stick(b, 8, 13, POT, map);
      K.stick(b, 3, 6, POT, map);
      // a red-and-white buoy hanging from the top pot's corner on a 1px rope, with a highlight
      b.set(11, 7, P.hy3); b.set(12, 7, P.hy3); b.set(13, 8, P.hy3);
      K.stick(b, 12, 8, ['.k.', 'hrr', 'www', 'rrR', 'RRR'], { k: P.hy3, h: P.red1, r: P.red2, R: P.red3, w: P.p0 });
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
      // the wheelhouse aft of midships: a red roof seen from above (lit NW edges, a dark eave), then its darker cream south face
      // with two windows and a door
      const wx = 14, wy = 11 + dy;
      b.fillRect(wx, wy, 11, 6, rd[2]); b.hline(wx, wy, 11, rd[0]); b.vline(wx, wy, 6, rd[1]); b.set(wx + 1, wy + 1, rd[0]);
      b.vline(wx + 10, wy + 1, 5, rd[3]); b.hline(wx, wy + 6, 11, rd[4]);
      b.fillRect(wx, wy + 7, 11, 4, P.p2); b.vline(wx + 10, wy + 7, 4, P.p3); b.hline(wx, wy + 10, 11, P.p3);
      for (const x of [wx + 1, wx + 4]) { b.fillRect(x, wy + 7, 2, 2, P.gl3); b.set(x, wy + 7, P.gl1); }
      b.fillRect(wx + 7, wy + 7, 2, 4, P.o4); b.set(wx + 7, wy + 7, P.o3);
      // a plain wooden mast forward of it, the sail furled along a boom
      const mx = 10;
      b.fillRect(mx, 4 + dy, 2, 2, P.o2); b.set(mx, 4 + dy, P.o1);
      b.vline(mx + 1, 6 + dy, 7, P.o3); b.vline(mx, 6 + dy, 7, P.p1); b.vline(mx + 2, 6 + dy, 7, P.p3);
      b.set(mx, 9 + dy, P.o4); b.set(mx + 2, 9 + dy, P.o4);
      // two orange floats and a coil of rope on the deck
      for (const [x, y] of [[6, 18], [8, 20]]) { b.fillRect(x, y + dy, 2, 2, P.l2); b.set(x + 1, y + 1 + dy, P.l3); }
      b.fillRect(18, 22 + dy, 3, 1, P.hy2); b.set(18, 22 + dy, P.hy1); b.set(20, 22 + dy, P.hy3);
      // the bow wave: a white line peeling off each side of the pointed bow, longer on one frame
      for (let i = 0; i < 5 + f; i++) { const y = TOP + 1 + i, hw = half(y) + 1 + (i >> 1); b.set(Math.round(CX - hw), y, P.w0); b.set(Math.round(CX + hw), y, P.w0); }
      // foam round the stern: it moves with the frame
      const foam = f ? [[0, 22], [29, 19], [3, 30], [22, 30]] : [[0, 18], [29, 24], [7, 30], [19, 30]];
      for (const [x, y] of foam) { b.hline(x, y, 2, P.w0); b.set(x + 2, y, P.w1); }
      K.outer(b, S.omap([[S.tones(bl), bl[5]], [S.tones(rd), rd[5]], [[P.l2, P.l3], P.l4], [[P.p0, P.p1, P.p2, P.p3], P.p6], [[P.hy1, P.hy2, P.hy3], P.o6], [[P.w0, P.w1], P.w2]], 'o6'));
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
      const b = K.B(16, 40), r = R('red'), y = R('yellow');
      // steel legs under the platform (drawn first, the chute passes in front), each with a contact shadow
      for (const x of [3, 12]) { b.vline(x, 15, 7, P.n3); b.set(x, 15, P.n2); }
      // ladder at the north end: upright rails lit on the west, dark on the east, rungs with a shadow under each
      for (const x of [4, 10]) { b.vline(x, 1, 10, y[2]); b.vline(x + 1, 1, 10, y[4]); }
      for (let yy = 3; yy < 10; yy += 3) { b.hline(6, yy, 4, y[1]); b.hline(6, yy + 1, 4, y[4]); }
      // the platform at the top: a lit deck, two red side rails standing up from it, and its red front edge
      b.fillRect(3, 10, 10, 3, y[1]); b.hline(3, 10, 10, y[0]);
      for (const [x, c] of [[2, r[1]], [13, r[3]]]) { b.vline(x, 6, 9, c); b.set(x, 6, r[0]); }
      b.fillRect(2, 13, 12, 2, r[2]); b.hline(2, 13, 12, r[1]); b.hline(2, 14, 12, r[4]);
      // the chute: it widens towards the south, dark 1px side rails, a lighter stripe down the centre, light to dark down its length
      for (let yy = 15; yy <= 36; yy++) {
        const t = (yy - 15) / 21, w = Math.round(3 * t);
        const x0 = 5 - w, x1 = 10 + w;
        const bed = t < 0.3 ? y[1] : t < 0.65 ? y[2] : y[3];
        const strip = t < 0.3 ? y[0] : t < 0.65 ? y[1] : y[2];
        b.hline(x0 + 1, yy, x1 - x0 - 1, bed);
        b.set(7, yy, strip); b.set(8, yy, strip);
        b.set(x0, yy, r[3]); b.set(x1, yy, r[4]);
      }
      b.fillRect(1, 37, 14, 2, r[2]); b.hline(1, 37, 14, r[1]); b.hline(1, 38, 14, r[4]);             // the run-out lip
      K.outer(b, S.omap([[S.tones(r), r[5]], [S.tones(y), y[5]], [[P.n2, P.n3], P.n5]], 'o6'));
      for (const x of [3, 12]) K.shadow(b, x, 23, 2, 1);
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

  // Stepping stumps, a balance beam, a crawl tunnel and a set of tyres: four pieces with grass between them so it reads as a course

  K.stamp('obstacle_course', {
    w: 2, h: 2,
    paint: () => {
      const b = K.B(32, 32), t = R('orange');
      // one shared bark-chip pad with a darker border ties the pieces into a single course
      b.fillRect(1, 1, 30, 30, P.d2);
      for (let y = 2; y < 30; y++) for (let x = 2; x < 30; x++) { const h = K.h32(x, y, 77) % 9; if (h === 0) b.set(x, y, P.d3); else if (h === 1) b.set(x, y, P.d1); }
      b.strokeRect(1, 1, 30, 30, P.d4);
      const L = K.B(32, 32);
      // crawl tunnel across the north: three tones along its length, hoop ribs every 3px, its open mouth at the west end
      for (let y = 3; y <= 10; y++) for (let x = 8; x <= 28; x++) {
        if (x === 28 && (y === 3 || y === 10)) continue;
        L.set(x, y, y <= 4 ? t[1] : y >= 9 ? t[4] : y >= 8 ? t[3] : t[2]);
      }
      for (let x = 11; x < 28; x += 3) for (let y = 3; y <= 10; y++) L.set(x, y, y <= 4 ? t[0] : y >= 8 ? t[4] : t[3]);
      L.ellipse(7, 6.5, 3, 4, t[1], true); L.ellipse(7, 6.5, 2, 3, P.o5, true); L.hline(6, 4, 3, P.o6); L.set(4, 5, t[0]); L.set(4, 6, t[0]);
      // from the tunnel mouth the path runs south over three stepping stumps, east along the balance beam, then over two tyres
      const stump = (x, y, h) => {
        L.fillRect(x, y + 2, 6, h, P.b2); L.vline(x, y + 2, h, P.b1); L.vline(x + 5, y + 2, h, P.b3); L.hline(x + 1, y + 1 + h, 4, P.b3);
        K.stick(L, x, y, ['.0011.', '012221', '.1221.'], { 0: P.o0, 1: P.o1, 2: P.o2 });
        L.set(x + 3, y + 1, P.o4);                                                                  // the ring-grain heart
      };
      stump(4, 12, 3); stump(3, 18, 2); stump(6, 23, 2);
      L.fillRect(12, 22, 12, 3, P.o2); L.hline(12, 22, 12, P.o0); L.hline(12, 24, 12, P.o4);          // balance beam
      for (const x of [13, 21]) { L.fillRect(x, 25, 2, 3, P.o4); L.set(x, 25, P.o3); }
      // two tyres lying flat: dark grey rubber with a lighter top arc, the hole showing the chips
      for (const [x, y] of [[22, 12], [23, 17]]) K.stick(L, x, y, [
        '.hhhhh.',
        'hhrrrhr',
        'hr...rr',
        'rrrrrrd',
        '.ddddd.',
      ], { h: P.n3, r: P.n4, d: P.n5 });
      out(L, [[S.tones(t), t[5]], [K.TN.bark, P.b4], [[P.n3, P.n4, P.n5], P.n6]]);
      for (const [x, y] of [[22, 12], [23, 17]]) for (let i = 2; i <= 4; i++) L.set(x + i, y + 2, 0);       // the holes show the chips
      b.blit(L, 0, 0);
      return b;
    },
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
      // a stack of logs seen end on (2-2-1): each round end a lighter ring round a dark 1px heart, dark bark showing between rows
      b.fillRect(1, 7, 9, 9, P.b3); b.hline(1, 15, 9, P.b4);
      const LOG = ['.bbb.', 'b001b', 'b04 1b'.replace(' ', ''), 'b112b', '.bbb.'].map((r) => r.slice(0, 5));
      LOG[2] = 'b041b';
      const map = { b: P.b2, 0: P.o0, 1: P.o1, 2: P.o2, 4: P.o4 };
      for (const [x, y] of [[0, 12], [5, 12], [0, 7], [5, 7], [3, 3]]) K.stick(b, x, y, LOG, map);
      // a chopping stump beside the stack, the hatchet bedded in its top
      b.fillRect(11, 11, 5, 5, P.b2); b.vline(11, 11, 5, P.b1); b.vline(15, 11, 5, P.b3); b.hline(11, 15, 5, P.b3);
      K.stick(b, 11, 9, ['.000.', '01221'], { 0: P.o0, 1: P.o1, 2: P.o2 });
      b.fillRect(12, 7, 3, 3, P.n2); b.set(12, 7, P.n0); b.set(14, 9, P.n3); b.hline(12, 10, 3, P.o4);
      b.line(13, 6, 15, 1, P.o3); b.set(14, 4, P.o2); b.set(15, 1, P.o4);
      out(b, [[K.TN.bark, P.b4], [STONE, P.n5], [[P.o0, P.o1, P.o2, P.o4], P.b4]]);
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
      // tail bows: two-tone with a highlight, red on the left, yellow on the right, so they show against the leaves
      const bow = (x, yy) => { b.set(x - 1, yy, P.red1); b.set(x - 1, yy + 1, P.red2); b.set(x, yy, P.p0); b.set(x + 1, yy, y[1]); b.set(x + 1, yy + 1, y[2]); };
      b.line(Rt[0], Rt[1] + 1, Rt[0] + 1, Rt[1] + 4, P.p2);
      bow(Rt[0] + 1, Rt[1] + 5);                                                                       // the torn tail: one piece still tied on,
      b.line(Rt[0] - 1, Rt[1] + 9, Rt[0] - 2, Rt[1] + 11, P.p2); bow(Rt[0] - 2, Rt[1] + 12);           // the other caught a little lower
      K.outer(b, 'ink');                                                                              // ink-dark so it reads over the leaves
      // (drawn after the outline so it stays 1px) the string tangled in a loop and a zigzag before it hangs down into the tile below
      const X = Bm[0], Y = Bm[1];
      const s = [[X, Y + 1], [X - 3, Y + 3], [X - 1, Y + 5], [X + 1, Y + 3], [X - 1, Y + 2], [X - 2, Y + 7], [X + 1, Y + 9], [X + 3, Y + 8], [X + 2, Y + 6], [X, Y + 9], [X - 1, Y + 12], [X + 1, Y + 14], [X - 1, Y + 16], [X, Y + 18]];
      const str = K.B(16, 32);
      for (let i = 1; i < s.length; i++) str.line(s[i - 1][0], s[i - 1][1], s[i][0], s[i][1], P.p0);
      for (let yy = 0; yy < 32; yy++) for (let x = 0; x < 15; x++) if (str.u32[yy * 16 + x] >>> 24 && !(str.u32[yy * 16 + x + 1] >>> 24) && !(b.u32[yy * 16 + x + 1] >>> 24)) b.set(x + 1, yy, P.n3);   // its grey shadow
      b.blit(str, 0, 0);
      return b;
    },
  });
})(typeof globalThis !== 'undefined' ? globalThis : window);
