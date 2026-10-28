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
    post: { roof: 'red', awn: 'red', sign: 'post', wall: { base: 'p1', hi: 'p0', sh: 'p2', dk: 'p3' } },
    bakery: { roof: 'brown', awn: 'yellow', sign: 'bread', wall: { base: 'p1', hi: 'p0', sh: 'p2', dk: 'p3' } },
    tackle: { roof: 'navy', awn: 'teal', sign: 'fish', wall: { base: 'p1', hi: 'p0', sh: 'p2', dk: 'p3' } },
    haberdashery: { roof: 'purple', awn: 'pink', sign: 'spool', wall: { base: 'p1', hi: 'p0', sh: 'p2', dk: 'p3' } },
  };
  const ROW_RISE = 24, ROW_RB = 21;
  function rowBody(b, r, W, H, rb) {
    // plaster wall from edge to edge, eave shadow, stone plinth
    b.fillRect(0, rb + 1, W, H - rb - 1, P.p1);
    b.fillRect(0, rb + 1, W, 2, P.p3); b.hline(0, rb + 3, W, P.p2);
    for (let i = 0; i < 10; i++) b.set(1 + (K.h32(i, W, 11) % (W - 2)), rb + 6 + (K.h32(i, H, 12) % (H - rb - 12)), P.p2);
    b.fillRect(0, H - 3, W, 3, P.c2); for (let x = 1; x < W; x += 4) b.set(x, H - 2, P.c3); b.hline(0, H - 1, W, P.c4);
    // party-wall posts at both edges, so neighbours read as separate houses
    b.fillRect(0, rb + 1, 2, H - rb - 1, P.o3); b.vline(0, rb + 1, H - rb - 1, P.o2);
    b.fillRect(W - 2, rb + 1, 2, H - rb - 1, P.o4);
    // roof: shingles edge to edge with a ridge at the top
    K.roof(b, 0, 1, W - 1, rb, r, { inset: 0, row: 5, alt: r[1] });
  }
  /** Volume for a rowhouse: flush walls; setback moves the 3D front plane back so whoever stands in a recessed doorway stays visible. */
  const rowVol = (o, setback) => Object.assign(S.houseVol(o), { wl: 0, wr: o.w * 16 - 1, roofL: 0, roofR: o.w * 16 - 1, inset: 6, setback: setback || 0 });

  const OPT_ROW = () => ({ w: 2, h: 3, rise: ROW_RISE, ramp: R('green'), roofTop: 1, roofBottom: ROW_RB, inset: 6, doorCol: 0, windows: [{ x: 18, y: 44, w: 11, h: 12, curtain: true }] });
  K.stamp('rowhouse', {
    w: 2, h: 3, rise: ROW_RISE, solid: ['##', '##', 'D#'],
    paint: () => {
      const W = 32, H = 48 + ROW_RISE, r = R('green'), b = K.B(W, H);
      rowBody(b, r, W, H, ROW_RB);
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
    else { b.fillRect(x + 3, y + 2, 4, 4, P.pk1); b.hline(x + 2, y + 1, 6, P.o2); b.hline(x + 2, y + 6, 6, P.o2); b.set(x + 4, y + 3, P.pk2); b.line(x + 6, y + 4, x + 8, y + 6, P.pk1); }
  }
  const OPT_SHOP = (v) => ({ w: 2, h: 3, rise: ROW_RISE, ramp: R(SHOPS[v].roof), roofTop: 1, roofBottom: ROW_RB, inset: 6, doorCol: 0, windows: [{ x: 19, y: 30, w: 9, h: 9 }] });
  K.stamp('rowhouse_shop', {
    w: 2, h: 3, rise: ROW_RISE, solid: ['##', '##', '.#'], variants: Object.keys(SHOPS),
    paint: (v, f, mode) => {
      const W = 32, H = 48 + ROW_RISE, sh = SHOPS[v], r = R(sh.roof), a = R(sh.awn), b = K.B(W, H);
      rowBody(b, r, W, H, ROW_RB);
      S.window(b, 19, 28, 9, 9, { curtain: a });                                          // upstairs
      // the recessed doorway (bottom-left cell): dark side walls, a tiled step, and the door set back
      const ry = H - 32;
      b.fillRect(2, ry, 14, 32, P.p5); b.fillRect(2, ry, 14, 3, P.p6);
      b.fillRect(3, ry + 3, 2, 26, P.p4); b.vline(3, ry + 3, 26, P.p3); b.fillRect(13, ry + 3, 2, 26, P.p6);
      S.door(b, 6, ry + 6, 7, 21);
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
      // the oak's canopy behind the hut
      K.lobe(b, 12, 14, 11, 10, K.TN.leaf); K.lobe(b, 35, 13, 11, 10, K.TN.leaf); K.lobe(b, 24, 9, 13, 8, K.TN.leaf);
      // trunk and roots behind the ladder
      K.cyl(b, 30, 30, 10, 32, K.TN.bark);
      b.fillRect(27, H - 4, 16, 3, P.b3); b.set(26, H - 3, P.b3); b.set(43, H - 2, P.b3);
      // hut: plank walls, a red patchwork roof, a round window and a pennant
      b.fillRect(8, 22, 30, 16, P.o2);
      for (let y = 24; y < 38; y += 3) b.hline(8, y, 30, P.o3);
      b.vline(8, 22, 16, P.o1); b.vline(37, 22, 16, P.o4);
      K.roof(b, 5, 11, 41, 23, R('red'), { inset: 7, row: 4 });
      b.circle(18, 30, 3, P.o5, true); b.circle(18, 30, 2, P.gl3, true); b.set(17, 29, P.gl1);
      b.fillRect(27, 27, 7, 11, P.o5); b.fillRect(28, 28, 5, 10, P.o6);                       // open hatch
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
      b.fillRect(2, 6, 2, 12, P.o3); b.vline(2, 6, 12, P.o2); b.fillRect(12, 6, 2, 12, P.o4);          // side frames
      b.fillRect(4, 7, 8, 8, P.o2);                                                                   // drum
      for (let y = 7; y < 15; y++) b.hline(4, y, 8, y & 1 ? P.hy2 : P.hy3);                            // rope wound on it
      b.hline(4, 7, 8, P.hy1);
      b.fillRect(1, 17, 14, 2, P.o4); b.hline(1, 17, 14, P.o3);                                       // base
      b.line(14, 10, 14, 5, P.n3); b.hline(14, 4, 2, P.n2); b.set(15, 5, P.n3);                      // crank
      b.line(9, 15, 7, 18, P.hy2);                                                                     // rope end
      out(b, [[[P.hy1, P.hy2, P.hy3], P.o6], [STONE, P.n5]]);
      K.shadow(b, 8, 19, 7, 1);
      return b;
    },
  });

  K.stamp('net_rack', {
    w: 2, h: 1, rise: 10,
    paint: () => {
      const b = K.B(32, 26);
      for (const x of [2, 28]) { b.fillRect(x, 3, 2, 21, P.o3); b.vline(x, 3, 21, P.o2); }
      b.fillRect(1, 3, 30, 2, P.o2); b.hline(1, 3, 30, P.o1);                                        // crossbar
      // the green net drooping between the posts, with cork floats on its edge
      for (let x = 4; x < 28; x++) {
        const sag = Math.round(3 * Math.sin(((x - 4) / 24) * Math.PI));
        const bottom = 16 + sag;
        for (let y = 5; y <= bottom; y++) if (((x + y) & 1) === 0 || (x % 4 === 0)) b.set(x, y, (y + x) % 3 ? P.f3 : P.f4);
        if (x % 5 === 2) { b.set(x, bottom + 1, P.o1); b.set(x + 1, bottom + 1, P.o1); b.set(x, bottom + 2, P.o3); }
      }
      out(b, [[[P.f3, P.f4], P.f6]]);
      K.shadow(b, 16, 24, 14, 1);
      return b;
    },
  });

  K.stamp('lobster_pots', {
    w: 1, h: 1, rise: 6,
    paint: () => {
      const b = K.B(16, 22);
      const pot = (x, y, w, h) => {
        b.fillRect(x, y, w, h, P.o2);
        for (let xx = x + 1; xx < x + w; xx += 2) b.vline(xx, y + 1, h - 2, P.o4);
        b.hline(x, y, w, P.o1); b.hline(x, y + h - 1, w, P.o4); b.hline(x, y + (h >> 1), w, P.hy2);
        b.fillRect(x + (w >> 1) - 1, y + 2, 3, 2, P.o6);
      };
      pot(1, 11, 9, 9); pot(7, 13, 8, 7); pot(4, 3, 9, 8);
      b.line(13, 5, 15, 9, P.red2); b.set(14, 4, P.red1);                                              // a red buoy on a rope
      out(b, [[[P.hy2], P.o6], [[P.red1, P.red2], P.red4]]);
      K.shadow(b, 8, 21, 7, 1);
      return b;
    },
  });

  K.stamp('mooring_post', {
    w: 1, h: 1, rise: 4,
    paint: () => {
      const b = K.B(16, 20);
      K.cyl(b, 4, 4, 8, 14, K.TN.woodDark);
      b.fillRect(4, 3, 8, 2, P.o2); b.hline(5, 2, 6, P.o1);
      for (const y of [8, 10]) { b.hline(3, y, 10, P.hy2); b.set(3, y + 1, P.hy3); b.set(12, y + 1, P.hy3); }   // rope loops
      b.line(12, 11, 15, 16, P.hy2);                                                                       // the line to the boat
      out(b, [[[P.hy2, P.hy3], P.o6]]);
      K.shadow(b, 8, 19, 6, 1);
      return b;
    },
  });

  // ---- boats: walk-over stamps drawn on the sea, bobbing on 2 frames
  K.stamp('boat_fishing', {
    w: 2, h: 2, solid: ['..', '..'], frames: 2, animSpeed: 32,
    paint: (v, f) => {
      const b = K.B(32, 32), dy = f;
      // hull, bow to the north
      const hull = [[16, 1 + dy], [27, 9 + dy], [28, 25 + dy], [25, 29 + dy], [7, 29 + dy], [4, 25 + dy], [5, 9 + dy]];
      b.polygon(hull, R('blue')[2]);
      b.polygon([[16, 3 + dy], [25, 10 + dy], [26, 24 + dy], [24, 27 + dy], [8, 27 + dy], [6, 24 + dy], [7, 10 + dy]], P.o2);   // deck
      for (let y = 12 + dy; y < 27 + dy; y += 3) b.hline(7, y, 19, P.o3);
      b.line(16, 1 + dy, 5, 9 + dy, R('blue')[1]); b.vline(5, 9 + dy, 16, R('blue')[1]);
      b.hline(7, 28 + dy, 19, R('blue')[4]); b.vline(27, 10 + dy, 15, R('blue')[3]);
      b.fillRect(7, 18 + dy, 19, 2, P.o4); b.hline(7, 18 + dy, 19, P.o1);                                  // thwart (seat)
      b.fillRect(9, 21 + dy, 9, 4, P.f3); for (let x = 9; x < 18; x += 2) b.set(x, 22 + dy, P.f4);         // a heap of net
      b.fillRect(19, 21 + dy, 5, 4, P.o1); b.strokeRect(19, 21 + dy, 5, 4, P.o4); b.set(20, 22 + dy, P.bl1); b.set(22, 23 + dy, P.bl1);   // fish box
      b.fillRect(10, 11 + dy, 4, 4, P.hy2); b.hline(10, 11 + dy, 4, P.hy1);                                 // coiled rope
      b.set(11, 12 + dy, P.hy3); b.set(12, 13 + dy, P.hy3);
      b.vline(16, 3 + dy, 7, P.o4); b.fillRect(19, 12 + dy, 2, 2, P.red2);                                  // bow post, a red float
      // ripples round the waterline
      b.hline(1, 28 + (f ? 0 : 1), 3, P.w1); b.hline(28, 27 + (f ? 1 : 0), 3, P.w1);
      K.outer(b, S.omap([[S.tones(R('blue')), R('blue')[5]], [[P.f3, P.f4], P.f6], [[P.hy1, P.hy2, P.hy3], P.o6], [[P.w1], P.w1]], 'o6'));
      return b;
    },
  });

  K.stamp('boat_cargo', {
    w: 5, h: 3, solid: ['.....', '.....', '.....'], frames: 2, animSpeed: 32,
    paint: (v, f) => {
      const W = 80, H = 48, b = K.B(W, H), dy = f, r = R('red'), n = R('navy');
      // hull, bow to the east: navy topsides over a red bottom stripe
      b.polygon([[3, 10 + dy], [64, 10 + dy], [77, 24 + dy], [64, 40 + dy], [3, 40 + dy]], n[2]);
      b.polygon([[3, 34 + dy], [69, 34 + dy], [64, 40 + dy], [3, 40 + dy]], r[2]);
      b.hline(3, 33 + dy, 67, P.p0);
      b.hline(3, 10 + dy, 61, n[1]); b.line(64, 10 + dy, 77, 24 + dy, n[1]); b.hline(3, 39 + dy, 61, r[4]);
      // deck
      b.polygon([[5, 12 + dy], [63, 12 + dy], [74, 24 + dy], [63, 31 + dy], [5, 31 + dy]], P.o2);
      for (let x = 8; x < 63; x += 5) b.vline(x, 13 + dy, 18, P.o3);
      // wheelhouse at the stern
      b.fillRect(7, 6 + dy, 16, 20, P.p1); b.hline(7, 6 + dy, 16, P.p0); b.vline(22, 6 + dy, 20, P.p3);
      b.fillRect(6, 4 + dy, 18, 3, r[2]); b.hline(6, 4 + dy, 18, r[1]);
      for (const x of [9, 16]) { b.fillRect(x, 10 + dy, 5, 5, P.gl3); b.set(x, 10 + dy, P.gl1); }
      b.fillRect(10, 18 + dy, 6, 8, P.o4);
      b.fillRect(18, 1 + dy, 3, 4, P.n2); b.hline(18, 1 + dy, 3, P.n1);                                    // funnel
      // cargo crates and sacks
      const crate = (x, y, c) => { b.fillRect(x, y, 9, 8, c); b.hline(x, y, 9, P.o1); b.strokeRect(x, y, 9, 8, P.o4); b.line(x, y, x + 8, y + 7, P.o4); };
      crate(30, 16 + dy, P.o2); crate(40, 16 + dy, P.o3); crate(35, 9 + dy, P.o2);
      for (const [x, y] of [[52, 18], [57, 21], [52, 23]]) { b.fillRect(x, y + dy, 5, 4, P.hy2); b.hline(x, y + dy, 5, P.hy1); b.set(x + 2, y + dy, P.hy3); }
      // a lifebuoy on the wheelhouse and a coil of rope at the bow
      b.circle(26, 22 + dy, 2, r[1], true); b.set(26, 22 + dy, P.o2); b.set(24, 22 + dy, P.p0); b.set(28, 22 + dy, P.p0);
      b.circle(67, 24 + dy, 2, P.hy2, false);
      // ripples
      for (const [x, y] of [[0, 38], [74, 31], [40, 43], [20, 43]]) b.hline(x + (f ? 1 : 0), y + (f ? 0 : 1), 4, P.w1);
      K.outer(b, S.omap([[S.tones(n), n[5]], [S.tones(r), r[5]], [[P.p0, P.p1, P.p3], P.p6], [[P.hy1, P.hy2, P.hy3], P.o6], [[P.w1], P.w1]], 'o6'));
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
      // ladder at the north end, a platform, and the chute running south
      for (const x of [2, 12]) { b.fillRect(x, 1, 2, 16, y[3]); b.vline(x, 1, 16, y[2]); }
      for (let yy = 3; yy < 16; yy += 3) b.hline(4, yy, 8, y[2]);
      b.fillRect(2, 14, 12, 5, r[2]); b.hline(2, 14, 12, r[1]); b.hline(2, 18, 12, r[4]);              // platform
      b.vline(3, 10, 4, y[1]); b.vline(12, 10, 4, y[1]);                                                // hand rails
      for (let yy = 19; yy < 37; yy++) {                                                                // chute
        b.fillRect(3, yy, 10, 1, yy & 2 ? y[1] : y[2]);
        b.set(3, yy, r[2]); b.set(12, yy, r[3]);
      }
      b.fillRect(2, 36, 12, 2, r[2]); b.hline(2, 37, 12, r[4]);
      K.outer(b, S.omap([[S.tones(r), r[5]], [S.tones(y), y[5]]], 'o6'));
      K.shadow(b, 8, 39, 6, 1);
      return b;
    },
  });

  // Spring riders shaped like the three starter Kigu (hood, face and colours), each on a big coil spring
  const RIDERS = {
    konko: { body: 'orange', ear: 'orange', trim: P.p0, extra: 'fox' },
    ottopi: { body: 'teal', ear: 'teal', trim: P.p0, extra: 'otter' },
    sprubun: { body: 'mint', ear: 'mint', trim: P.pk1, extra: 'bunny' },
  };
  K.stamp('spring_rider', {
    w: 1, h: 1, rise: 6, variants: Object.keys(RIDERS),
    paint: (v) => {
      const b = K.B(16, 22), o = RIDERS[v], r = R(o.body);
      // the coil spring and its base plate
      b.fillRect(4, 19, 8, 2, P.n3); b.hline(4, 19, 8, P.n2);
      for (let yy = 13; yy < 19; yy += 2) { b.hline(6, yy, 4, P.n1); b.set(9, yy + 1, P.n3); b.set(6, yy + 1, P.n3); }
      // seat body
      b.fillRect(3, 9, 10, 5, r[2]); b.hline(3, 9, 10, r[1]); b.hline(3, 13, 10, r[4]);
      b.fillRect(6, 10, 4, 3, o.trim);                                                                 // tummy patch
      // hooded head with a face, and the ears of her costume
      b.fillRect(3, 2, 10, 7, r[2]); b.hline(4, 1, 8, r[1]); b.vline(3, 2, 7, r[1]); b.vline(12, 3, 6, r[3]);
      b.fillRect(5, 4, 6, 4, SKIN);
      b.set(6, 5, P.ink); b.set(9, 5, P.ink); b.set(5, 6, P.pk1); b.set(10, 6, P.pk1);
      if (o.extra === 'fox') { b.set(3, 0, r[2]); b.set(4, 0, r[1]); b.set(12, 0, r[2]); b.set(11, 0, r[3]); b.set(3, 1, r[2]); b.set(12, 1, r[3]); b.set(4, 0, P.p0); b.set(11, 0, P.p0); }   // pointed ears, worn shiny
      else if (o.extra === 'otter') { b.set(3, 1, r[3]); b.set(12, 1, r[3]); b.set(2, 2, r[3]); b.set(13, 2, r[3]); b.fillRect(7, 11, 2, 2, P.pk1); }                                         // round ears, a pink shell
      else { b.fillRect(4, 0, 2, 2, r[1]); b.fillRect(10, 0, 2, 2, r[1]); b.set(1, 2, r[2]); b.set(2, 1, r[2]); b.set(14, 2, r[2]); b.set(13, 1, r[2]); b.set(7, 0, P.f3); b.set(8, 0, P.f3); }  // floppy ears and a sprout
      b.fillRect(1, 10, 2, 2, P.n2); b.fillRect(13, 10, 2, 2, P.n2);                                   // handles
      K.outer(b, S.omap([[S.tones(r), r[5]], [[P.n1, P.n2, P.n3], P.n5], [[SKIN], R(o.body)[5]]], 'o6'));
      K.shadow(b, 8, 21, 6, 1);
      return b;
    },
  });

  // Stepping stumps, a balance beam, and a crawl tunnel shaped like a Nibblit (round ears, caramel and cream)
  K.stamp('obstacle_course', {
    w: 2, h: 2,
    paint: () => {
      const b = K.B(32, 32), t = R('orange');
      // crawl tunnel across the north half: a caramel tube with a face, ears and twin tails at the far end
      b.fillRect(5, 4, 22, 9, t[2]); b.hline(5, 4, 22, t[1]); b.hline(5, 12, 22, t[4]);
      for (let x = 9; x < 26; x += 4) b.vline(x, 5, 7, t[3]);
      b.fillRect(2, 3, 6, 11, P.p1); b.vline(2, 3, 11, P.p0); b.fillRect(3, 5, 4, 7, P.o6);           // the cream face ring and the dark opening
      b.set(3, 2, t[2]); b.set(4, 1, t[2]); b.set(4, 2, t[1]); b.set(7, 2, t[2]); b.set(7, 1, t[2]);   // little round ears
      b.set(1, 7, P.pk1); b.set(8, 8, P.pk1);
      b.fillRect(27, 6, 3, 2, P.red2); b.fillRect(27, 10, 3, 2, P.red2);                               // rust twin tails
      // three stepping stumps
      for (const [x, y] of [[4, 20], [12, 24], [6, 27]]) { b.fillRect(x, y, 6, 3, P.b2); b.fillRect(x, y - 2, 6, 3, P.o1); b.hline(x + 1, y - 1, 4, P.o2); b.set(x + 2, y - 1, P.o3); }
      // balance beam on two trestles
      b.fillRect(17, 19, 13, 3, P.o2); b.hline(17, 19, 13, P.o1); b.hline(17, 21, 13, P.o4);
      for (const x of [18, 27]) b.fillRect(x, 22, 2, 5, P.o4);
      out(b, [[S.tones(t), t[5]], [[P.p0, P.p1], P.o6], [[P.b2], P.b4], [[P.red2], P.red4]]);
      K.shadow(b, 15, 30, 13, 1);
      return b;
    },
  });

  K.stamp('picnic_table', {
    w: 2, h: 1, rise: 2,
    paint: () => {
      const b = K.B(32, 18);
      b.fillRect(2, 1, 28, 3, P.o2); b.hline(2, 1, 28, P.o1); b.hline(2, 3, 28, P.o4);                 // north bench
      b.fillRect(1, 5, 30, 7, P.o2); for (let y = 7; y < 12; y += 2) b.hline(1, y, 30, P.o3);          // table top
      b.hline(1, 5, 30, P.o1); b.hline(1, 11, 30, P.o4);
      b.fillRect(2, 13, 28, 3, P.o2); b.hline(2, 13, 28, P.o1); b.hline(2, 15, 28, P.o4);              // south bench
      for (const x of [4, 26]) b.fillRect(x, 16, 2, 2, P.o5);
      b.fillRect(12, 6, 6, 3, R('red')[2]); b.set(12, 6, R('red')[1]); b.set(14, 7, P.p0); b.set(16, 6, P.p0);   // a checked napkin
      out(b, [[S.tones(R('red')), R('red')[5]]]);
      K.shadow(b, 16, 17, 14, 1);
      return b;
    },
  });

  // Mom's wooden herb planters: herbs (mint and basil), tomato (a plant that never fruits), flowers (pink and yellow)
  K.stamp('herb_planter', {
    w: 1, h: 1, rise: 2, variants: ['herbs', 'tomato', 'flowers'],
    paint: (v) => {
      const b = K.B(16, 18);
      if (v === 'herbs') {
        K.lobe(b, 5, 7, 3, 3, K.TN.leafLight); K.lobe(b, 10, 6, 4, 4, K.TN.leaf);
        b.set(4, 5, P.f0); b.set(11, 4, P.f1); b.set(9, 6, P.f0);
      } else if (v === 'tomato') {
        b.vline(8, 1, 9, P.o3); b.hline(7, 1, 3, P.o2);                                                 // a cane
        K.lobe(b, 6, 6, 3, 3, K.TN.leaf); K.lobe(b, 10, 8, 3, 3, K.TN.leaf); b.set(8, 3, P.f2); b.set(7, 2, P.f3);
        b.set(9, 5, P.yl1);                                                                             // one hopeful yellow flower
      } else {
        K.lobe(b, 8, 7, 6, 3, K.TN.leaf);
        for (const [x, y, c] of [[4, 5, P.pk1], [7, 4, P.yl1], [10, 5, P.pk1], [12, 7, P.yl1], [6, 7, P.yl1], [9, 7, P.pk1]]) { b.set(x, y, c); b.set(x + 1, y, c); b.set(x, y - 1, P.p0); }
      }
      // the planter box
      b.fillRect(2, 9, 12, 7, P.o2); b.hline(2, 9, 12, P.o1); b.hline(2, 15, 12, P.o4);
      b.hline(2, 12, 12, P.o3); b.vline(13, 10, 6, P.o3); b.fillRect(3, 10, 10, 1, P.d3);
      out(b, [[K.TN.leaf, P.f6], [K.TN.leafLight, P.f5], [[P.pk1, P.yl1, P.p0], P.f6]]);
      K.shadow(b, 8, 17, 6, 1);
      return b;
    },
  });

  K.stamp('firewood', {
    w: 1, h: 1, rise: 2,
    paint: () => {
      const b = K.B(16, 18);
      const log = (x, y) => { b.fillRect(x, y, 4, 4, P.b2); b.fillRect(x + 1, y + 1, 2, 2, P.o1); b.set(x + 1, y + 1, P.o0); b.set(x + 2, y + 2, P.o2); b.hline(x, y, 4, P.b1); };
      for (const [x, y] of [[2, 12], [6, 12], [10, 12], [4, 8], [8, 8], [6, 4]]) log(x, y);
      b.vline(1, 6, 10, P.o3); b.vline(14, 6, 10, P.o3);                                               // stakes holding the stack
      b.line(11, 5, 14, 2, P.b2); b.set(15, 2, P.o4);                                                  // a hatchet resting on it
      b.fillRect(12, 1, 3, 2, P.n2); b.set(12, 1, P.n1);
      out(b, [[K.TN.bark, P.b4], [STONE, P.n5]]);
      K.shadow(b, 8, 17, 7, 1);
      return b;
    },
  });

  K.stamp('tyre_swing', {
    w: 1, h: 1, rise: 12,
    paint: () => {
      const b = K.B(16, 28);
      b.line(1, 4, 14, 1, P.b2); b.line(1, 5, 14, 2, P.b3);             // the branch it hangs from
      K.lobe(b, 3, 2, 2, 1, K.TN.leaf); K.lobe(b, 13, 1, 2, 1, K.TN.leaf);
      b.vline(8, 4, 11, P.hy2); b.vline(7, 4, 11, P.hy3);                                              // rope
      b.ellipse(8, 19, 6, 4, P.ink2, true); b.ellipse(8, 19, 3, 2, 0, true);                           // tyre (hole is see-through)
      b.ellipse(8, 19, 6, 4, P.n4, false); b.hline(4, 15, 8, P.n3); b.set(5, 16, P.n3);
      for (let y = 16; y < 23; y++) for (let x = 2; x < 15; x++) if (((x - 8) ** 2) / 4 + ((y - 19) ** 2) / 1.5 < 4.2) b.set(x, y, 0);
      out(b, [[K.TN.bark, P.b4], [K.TN.leaf, P.f6], [[P.hy2, P.hy3], P.o6], [[P.ink2, P.n3, P.n4], P.ink]]);
      K.shadow(b, 8, 27, 6, 1);
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
      // the dark cave mouth (bottom-left cell) with a stone sill
      b.fillRect(2, 17, 14, 14, P.v5);
      b.ellipse(9, 18, 7, 4, P.v5, true);
      b.fillRect(3, 18, 12, 12, P.v6);
      b.hline(2, 30, 14, P.v3); b.hline(3, 29, 12, P.v4);
      b.set(5, 20, P.v4); b.set(12, 22, P.v4);
      // a few ferns at the foot
      b.line(17, 30, 19, 26, P.f3); b.line(19, 30, 21, 27, P.f2); b.line(28, 30, 29, 26, P.f3);
      K.outer(b, S.omap([[K.TN.rock, P.r6], [[P.g2, P.g3], P.g6], [[P.v3, P.v4, P.v5, P.v6], P.v6], [[P.f2, P.f3], P.f6]], 'r6'));
      return b;
    },
  });

  // ============================================================================================ the kite in the treeline
  // Walk-over (over: 2): a diamond kite tangled in the canopy, its string hanging down into the tile below.
  K.stamp('kite_snag', {
    w: 1, h: 2, over: 2, solid: ['.', '.'],
    paint: () => {
      const b = K.B(16, 32), r = R('pink'), y = R('yellow');
      b.polygon([[8, 2], [14, 8], [8, 15], [2, 8]], r[2]);
      b.polygon([[8, 2], [14, 8], [8, 8]], y[2]); b.polygon([[2, 8], [8, 15], [8, 8]], y[2]);
      b.line(8, 2, 8, 15, P.o3); b.line(2, 8, 14, 8, P.o3);
      b.set(7, 4, r[0]); b.set(5, 7, y[0]);
      // tail bows trailing to the side, and the string drooping down
      for (const [x, yy] of [[10, 17], [12, 19], [11, 22]]) { b.set(x, yy, P.bl1); b.set(x + 1, yy, P.bl2); }
      b.line(8, 15, 10, 17, P.p2); b.line(11, 18, 12, 19, P.p2);
      for (let yy = 15; yy < 30; yy++) b.set(7 - ((yy - 15) >> 3), yy, P.p0);
      K.outer(b, S.omap([[S.tones(r), r[5]], [S.tones(y), y[5]], [[P.bl1, P.bl2], P.bl4], [[P.p0, P.p2], P.p4]], 'o6'));
      return b;
    },
  });
})(typeof globalThis !== 'undefined' ? globalThis : window);
