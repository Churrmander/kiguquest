/* src/art/tiles/stamp_home.js — the player's house (Chapter 1 rebuild): kitchen, hall, living room and the upstairs bedroom.
 * Same toolkit and palette as stamp_indoor.js: warm wood (o0-o6) outlined in o6, cream plaster, light from the top left, a soft
 * contact shadow under anything that stands on the floor. Wall pieces (door_inner, window_edge, wall_map, calendar, kigu_poster) sit on
 * the wall rows on a transparent tile so the wall terrain shows round them. Walk-over clutter is layer 'floor'. */
(function (root) {
  'use strict';
  const NP = root.NP;
  const K = NP.art.tiles.kit;
  const S = K.S;
  const { P, col } = K;

  const WOOD = [P.o0, P.o1, P.o2, P.o3, P.o4, P.o5];
  const WOOD_OUT = S.omap([[WOOD, P.o6]], 'o6');
  const out = (b, groups, fb) => K.outer(b, S.omap([[WOOD, P.o6]].concat(groups || []), fb || 'o6'));
  const tn = (name) => S.tones(K.ramp(name));
  const SPINES = ['red', 'orange', 'yellow', 'brown', 'pink', 'teal', 'blue', 'green', 'lilac', 'sky'];

  /** small wooden shelving frame (back panel, side posts, boards at the given rows) */
  function shelfFrame(b, x0, w, h, back, boards) {
    b.fillRect(x0 + 1, 1, w - 2, h - 1, back);
    b.fillRect(x0 + 1, 1, 2, h - 1, P.o3); b.vline(x0 + 1, 1, h - 1, P.o2);
    b.fillRect(x0 + w - 3, 1, 2, h - 1, P.o4);
    b.fillRect(x0 + 1, 1, w - 2, 2, P.o3); b.hline(x0 + 1, 1, w - 2, P.o1);
    for (const y of boards) { b.fillRect(x0 + 1, y, w - 2, 2, P.o2); b.hline(x0 + 1, y, w - 2, P.o1); b.hline(x0 + 1, y + 1, w - 2, P.o4); }
  }
  /** a row of book spines standing on a shelf: bottom at y, from x to xEnd; palette = ramp names; thin = 1-2 px spines */
  function spines(b, x, xEnd, y, names, seed, thin) {
    let i = 0;
    while (x < xEnd) {
      const h = K.h32(seed, i++, 5), w = thin ? 1 + (h % 2) : 2 + (h % 2), tall = 5 + ((h >> 3) % 3);
      if (x + w > xEnd) break;
      const r = K.ramp(names[(h >> 5) % names.length]);
      b.fillRect(x, y - tall, w, tall, r[2]); b.vline(x, y - tall, tall, r[1]);
      if (w > 1) b.vline(x + w - 1, y - tall, tall, r[3]);
      b.hline(x, y - tall + 2, w, r[0]);
      x += w + (h % 7 === 0 ? 1 : 0);
    }
  }
  /** ceramic mug, 3x3 with a handle on the right */
  const mug = (b, x, y, c) => { b.fillRect(x, y, 3, 3, c); b.hline(x, y, 3, P.o5); b.set(x + 3, y + 1, c); b.set(x, y + 2, P.p3); };

  // ============================================================================================ kitchen
  // A base cabinet with a pale stone worktop; it tiles into a run like the shop counters (no side outlines).
  K.stamp('kitchen_counter', {
    w: 1, h: 1, variants: ['plain', 'cakes', 'crumbs'],
    paint: (v) => {
      const b = K.B(16, 16);
      b.fillRect(0, 3, 16, 6, P.c1); b.hline(0, 3, 16, P.c0); b.hline(0, 8, 16, P.c3);           // stone worktop
      for (const [x, y] of [[3, 5], [10, 6], [13, 4]]) b.set(x, y, P.c3);                          // flecks in the stone
      b.fillRect(0, 9, 16, 6, P.o3); b.hline(0, 9, 16, P.o4);                                      // cabinet
      b.strokeRect(2, 10, 12, 4, P.o4); b.hline(3, 11, 10, P.o2); b.fillRect(7, 12, 2, 1, P.gd2);  // door + brass pull
      b.hline(0, 2, 16, P.c5); b.hline(0, 15, 16, P.o6);
      if (v === 'plain') {
        // a jar of wooden spoons and a little herb pot
        b.fillRect(3, 1, 3, 4, P.p1); b.vline(3, 1, 4, P.p0); b.vline(5, 1, 4, P.p3);
        b.set(3, 0, P.o2); b.set(5, 0, P.o3); b.set(4, 0, P.o1);
        b.fillRect(10, 3, 3, 2, P.br2); b.fillRect(10, 1, 3, 2, P.f3); b.set(10, 1, P.f2); b.set(11, 0, P.f2);
      } else {
        // a baking tray: iced Fancy Cakes cooling, or just crumbs once Mom has given them away
        b.fillRect(1, 2, 14, 6, P.n2); b.hline(1, 2, 14, P.n1); b.hline(1, 7, 14, P.n3); b.vline(1, 2, 6, P.n1); b.vline(14, 2, 6, P.n3);
        if (v === 'cakes') {
          for (const [x, y, ic] of [[2, 1, P.pk1], [7, 2, P.p0], [11, 1, P.pk1]]) {
            b.fillRect(x, y + 2, 4, 3, P.o1); b.hline(x, y + 4, 4, P.o3);                          // sponge
            b.fillRect(x, y, 4, 3, ic); b.hline(x, y, 4, P.p0); b.set(x + 3, y + 2, P.pk1);         // icing dome
            b.set(x + 1, y - 1, P.red2);                                                            // a cherry on top
          }
        } else {
          for (const [x, y, c] of [[4, 4, P.o1], [6, 5, P.pk1], [9, 3, P.o2], [11, 5, P.o1], [3, 6, P.p0], [12, 4, P.pk2]]) b.set(x, y, c);
        }
      }
      b.hline(0, 2, 16, P.c5);
      return b;
    },
  });

  // Square family dining table with a gingham cloth: teapot and mugs of cocoa (2x2)
  K.stamp('table_sq', {
    w: 2, h: 2,
    paint: () => {
      const b = K.B(32, 32);
      for (const x of [3, 26]) { b.fillRect(x, 24, 3, 6, P.o4); b.vline(x, 24, 6, P.o3); }
      b.fillRect(1, 3, 30, 20, P.o2); b.hline(1, 3, 30, P.o0); b.vline(1, 3, 20, P.o1);            // table top
      b.fillRect(1, 23, 30, 2, P.o3); b.hline(1, 24, 30, P.o4);                                   // apron
      S.gingham(b, 3, 4, 26, 19, P.p0, P.red0, P.red1, 2);                                         // cloth
      for (let x = 3; x < 29; x++) { const hem = 23 + ((x & 3) === 1 || (x & 3) === 2 ? 1 : 0); for (let y = 23; y <= hem; y++) b.set(x, y, ((x >> 1) & 1) ? P.red0 : P.p0); b.set(x, hem, P.red2); }
      // teapot (cream with a blue band) in the middle, a mug of cocoa at each place
      K.blob(b, 15, 12, 5, 4, K.tn('p0', 'p1', 'p2', 'p3', 'p4'));
      b.hline(11, 13, 9, P.bl2); b.fillRect(13, 7, 5, 1, P.p3); b.set(15, 6, P.bl2);
      b.line(20, 11, 23, 9, P.p2); b.set(23, 8, P.p3);                                            // spout
      b.set(9, 11, P.p3); b.set(9, 12, P.p3); b.set(10, 13, P.p3);                                // handle
      for (const [x, y, c] of [[5, 6, P.pk2], [23, 15, P.bl2], [6, 17, P.yl2]]) { mug(b, x, y, c); b.set(x + 1, y + 1, P.b3); }   // cocoa inside
      b.set(25, 5, P.p0); b.set(26, 4, P.p0);                                                     // steam
      out(b, [[[P.p0, P.p1, P.p2, P.p3, P.p4, P.red0, P.red1, P.red2, P.bl2, P.pk2, P.yl2], P.o6]]);
      K.shadow(b, 16, 30, 14, 1);
      return b;
    },
  });

  // Nibblenna's round cushioned basket: flat on the floor, so she can stand in it
  K.stamp('pet_bed', {
    w: 1, h: 1, layer: 'floor', solid: ['.'],
    paint: () => {
      const b = K.B(16, 16);
      b.ellipse(8, 9, 7, 5, P.o4, true);
      b.ellipse(8, 9, 6, 4, P.o2, true);
      for (let x = 2; x < 15; x += 2) { b.set(x, 6, P.o1); b.set(x + 1, 13, P.o3); }                // wicker weave on the rim
      b.ellipse(8, 9, 4, 2, P.pk1, true); b.hline(6, 8, 4, P.pk0);                                  // cushion
      // a little blue gingham blanket folded over one side
      S.gingham(b, 9, 8, 5, 4, P.bl0, P.bl1, P.bl2, 1); b.hline(9, 8, 5, P.p0);
      K.outer(b, S.omap([[[P.o1, P.o2, P.o3, P.o4], P.o6]], 'o6'));
      return b;
    },
  });

  // ============================================================================================ walls
  // Mom's bedroom door, set into the wood wall face over both wall rows: brass knob, a little heart name plate
  K.stamp('door_inner', {
    w: 1, h: 2,
    paint: () => {
      const b = K.B(16, 32);
      b.fillRect(1, 3, 14, 29, P.o5); b.hline(1, 3, 14, P.o4);                                    // frame
      b.fillRect(3, 5, 10, 27, P.o2); b.vline(3, 5, 27, P.o1); b.vline(12, 5, 27, P.o3);           // door
      b.strokeRect(4, 7, 8, 9, P.o3); b.strokeRect(4, 19, 8, 10, P.o3);                            // panels
      b.hline(5, 8, 6, P.o1); b.hline(5, 20, 6, P.o1);
      b.fillRect(10, 17, 2, 2, P.gd2); b.set(10, 17, P.gd1); b.set(11, 18, P.gd4);                 // knob
      b.blit(K.spr(['.x.x.', 'xxxxx', '.xxx.', '..x..'], { x: P.pk2 }), 6, 10); b.set(7, 10, P.pk0);   // heart plate
      b.hline(1, 31, 14, P.o6);
      K.outer(b, WOOD_OUT);
      return b;
    },
  });

  // A window in a side wall (w = west wall, the glass on the room side of the tile; e = east) or the bottom wall (s; s_tincan has a
  // tin can on the sill with a string running out through the frame).
  K.stamp('window_edge', {
    w: 1, h: 1, variants: ['w', 'e', 's', 's_tincan'],
    paint: (v) => {
      let b = K.B(16, 16);
      if (v === 'w' || v === 'e') {
        b.fillRect(8, 1, 7, 14, P.p0);                       // white frame
        b.fillRect(9, 2, 4, 12, P.gl2); b.vline(9, 2, 12, P.gl1); b.set(10, 3, P.gl0); b.set(11, 4, P.gl1);
        b.hline(9, 8, 4, P.p0);                              // muntin
        b.fillRect(14, 1, 2, 14, P.p2); b.vline(15, 1, 14, P.p3);   // sill on the room side
        b.vline(7, 1, 14, P.o5); b.hline(7, 0, 9, P.o5); b.hline(7, 15, 9, P.o5);
        if (v === 'e') b = b.flippedX();
        return b;
      }
      b.fillRect(1, 1, 14, 7, P.p0);
      b.fillRect(2, 2, 12, 4, P.gl2); b.hline(2, 2, 12, P.gl1); b.set(3, 3, P.gl0); b.set(4, 3, P.gl1);
      b.vline(8, 2, 4, P.p0);
      b.fillRect(0, 6, 16, 2, P.p2); b.hline(0, 7, 16, P.p3);   // sill on the room (north) side
      b.hline(0, 0, 16, P.o5); b.vline(0, 0, 8, P.o5); b.vline(15, 0, 8, P.o5);
      if (v === 's_tincan') {
        b.fillRect(9, 4, 3, 4, P.n2); b.vline(9, 4, 4, P.n1); b.vline(11, 4, 4, P.n3); b.hline(9, 4, 3, P.n0);
        b.line(12, 5, 15, 2, P.p3); b.set(13, 4, P.p4);       // the string runs out through the frame
      }
      return b;
    },
  });

  // ============================================================================================ hall and living room
  // Small round hall table with a framed photo: two kids holding a kite with a wonky tail
  K.stamp('side_table', {
    w: 1, h: 1, variants: ['photo'],
    paint: () => {
      const b = K.B(16, 16);
      b.fillRect(7, 10, 2, 4, P.o4); b.vline(7, 10, 4, P.o3); b.fillRect(5, 13, 6, 1, P.o4);      // pedestal
      b.ellipse(8, 9, 7, 3, P.o2, true); b.ellipse(8, 8, 7, 2, P.o1, true); b.hline(3, 7, 6, P.o0);
      b.fillRect(4, 1, 8, 8, P.o5); b.fillRect(5, 2, 6, 6, P.sk1);                                 // frame + sky
      b.fillRect(5, 6, 6, 2, P.g2);                                                                 // grass
      b.set(6, 5, P.yl2); b.set(6, 6, P.red2); b.set(9, 5, P.b2); b.set(9, 6, P.bl2);               // two kids
      b.set(8, 2, P.red2); b.set(7, 3, P.yl2); b.set(8, 3, P.red1);                                 // the kite
      b.set(9, 3, P.n4); b.set(10, 4, P.n4); b.set(9, 4, P.pk2);                                    // its wonky tail
      b.vline(12, 4, 4, P.o4);                                                                       // stand
      K.outer(b, WOOD_OUT);
      K.shadow(b, 8, 14, 5, 1);
      return b;
    },
  });

  // Tall dark-wood grandfather clock: cream face, brass pendulum window. Its hood rises 12px above the tile.
  K.stamp('grandfather_clock', {
    w: 1, h: 1, rise: 12,
    paint: () => {
      const b = K.B(16, 28);
      b.fillRect(3, 3, 10, 23, P.o4); b.vline(3, 3, 23, P.o3); b.vline(12, 3, 23, P.o5);           // case
      b.fillRect(2, 2, 12, 3, P.o5); b.hline(3, 1, 10, P.o4); b.hline(5, 0, 6, P.o4); b.hline(2, 2, 12, P.o3);   // hood + crest
      b.circle(8, 8, 4, P.o5, true); b.circle(8, 8, 3, P.p0, true);                                 // face
      b.set(8, 5, P.ink2); b.set(11, 8, P.ink2); b.set(5, 8, P.ink2); b.set(8, 11, P.ink2);
      b.vline(8, 6, 3, P.ink2); b.hline(8, 8, 2, P.ink2); b.set(6, 6, P.p1);
      b.fillRect(5, 14, 6, 8, P.o6); b.fillRect(6, 15, 4, 6, P.gl5);                                 // pendulum window
      b.vline(8, 15, 4, P.gd3); b.circle(8, 19, 1, P.gd2, true); b.set(7, 18, P.gd1);
      b.fillRect(2, 23, 12, 4, P.o5); b.hline(2, 23, 12, P.o4);                                     // plinth
      K.outer(b, S.omap([[WOOD, P.o6]], 'ink'));
      K.shadow(b, 8, 27, 6, 1);
      return b;
    },
  });

  // Low TV cabinet with a wide flat screen (rises 6px). plain = living room; console = the bedroom, a game console and tangled cables.
  K.stamp('tv_wide', {
    w: 2, h: 1, rise: 6, variants: ['plain', 'console'],
    paint: (v) => {
      const b = K.B(32, 22);
      b.fillRect(1, 13, 30, 8, P.o3); b.hline(1, 13, 30, P.o1); b.hline(1, 20, 30, P.o5);          // cabinet
      b.strokeRect(3, 15, 12, 4, P.o4); b.strokeRect(17, 15, 12, 4, P.o4); b.set(9, 17, P.gd2); b.set(23, 17, P.gd2);
      b.fillRect(4, 1, 24, 11, P.n5); b.hline(4, 1, 24, P.n3);                                      // bezel
      b.fillRect(5, 2, 22, 9, P.gl5);                                                               // screen
      for (let k = 0; k < 5; k++) b.set(7 + k, 3 + (k >> 1), P.gl4);                                 // glare streak
      b.set(6, 3, P.gl3); b.fillRect(14, 11, 4, 2, P.n4);                                           // stand
      if (v === 'console') {
        b.fillRect(20, 10, 8, 3, P.n0); b.hline(20, 10, 8, P.white); b.hline(20, 12, 8, P.n2); b.set(26, 11, P.f1);   // the console
        b.line(21, 13, 18, 16, P.ink2); b.line(18, 16, 22, 17, P.ink2); b.line(22, 17, 19, 19, P.n5); b.line(25, 13, 27, 18, P.n5);   // cables
      } else {
        b.fillRect(2, 9, 3, 4, P.br2); K.lobe(b, 3, 7, 2, 2, K.TN.leaf);                              // a little plant
      }
      out(b, [[[P.n0, P.n2, P.n3, P.n4, P.n5, P.gl3, P.gl4, P.gl5, P.white], P.ink]]);
      K.shadow(b, 16, 21, 14, 1);
      return b;
    },
  });

  // One-wide tall bookshelf (1x2). cookbooks: warm spines and one festival programme; comics: bright thin spines.
  K.stamp('bookshelf_narrow', {
    w: 1, h: 2, variants: ['cookbooks', 'comics'],
    paint: (v) => {
      const b = K.B(16, 32);
      shelfFrame(b, 0, 16, 31, P.o5, [10, 20, 29]);
      const names = v === 'comics' ? ['red', 'sky', 'yellow', 'pink', 'mint', 'orange', 'lilac'] : ['red', 'orange', 'brown', 'yellow', 'gold'];
      spines(b, 3, 13, 10, names, v === 'comics' ? 7 : 3, v === 'comics');
      spines(b, 3, 13, 20, names, v === 'comics' ? 8 : 4, v === 'comics');
      spines(b, 3, 13, 29, names, v === 'comics' ? 9 : 5, v === 'comics');
      if (v === 'cookbooks') { b.fillRect(9, 13, 3, 7, P.pk1); b.vline(9, 13, 7, P.pk0); b.set(10, 15, P.l2); b.set(10, 16, P.l3); }   // festival programme: a lantern
      else { b.fillRect(8, 24, 5, 2, P.yl1); b.hline(8, 24, 5, P.yl0); }                              // a comic lying flat
      K.outer(b, WOOD_OUT);
      return b;
    },
  });

  // Four-seat sofa seen from behind, facing north at the TV: cushions on the seat, a knitted throw over the backrest
  K.stamp('sofa', {
    w: 4, h: 1,
    paint: () => {
      const b = K.B(64, 16);
      const r = tn('teal');
      b.fillRect(1, 1, 62, 14, r[3]);
      for (let i = 0; i < 4; i++) { const x = 6 + i * 13; b.fillRect(x, 2, 12, 5, r[1]); b.hline(x, 2, 12, r[0]); b.hline(x, 6, 12, r[2]); }   // seat cushions
      b.fillRect(1, 7, 62, 7, r[2]); b.hline(1, 7, 62, r[1]); b.hline(1, 13, 62, r[4]);             // backrest
      for (const x of [1, 57]) { b.fillRect(x, 1, 6, 13, r[2]); b.hline(x, 1, 6, r[0]); b.vline(x, 1, 13, r[1]); b.vline(x + 5, 2, 12, r[3]); }   // arms
      // a knitted throw: zigzag stripes of cream, mustard and rose draped over the back
      for (let x = 30; x < 50; x++) for (let y = 6; y <= 14 + ((x & 1) ? 1 : 0); y++) {
        const band = ((y + (x % 4 < 2 ? 0 : 1)) >> 1) % 3;
        b.set(x, y, band === 0 ? P.p0 : band === 1 ? P.yl2 : P.pk2);
      }
      for (let x = 30; x < 50; x += 2) b.set(x, 15, P.p2);                                          // fringe
      for (const x of [3, 59]) b.fillRect(x, 14, 2, 2, P.o5);                                        // feet
      K.outer(b, S.omap([[r, K.ramp('teal')[5]], [[P.p0, P.yl2, P.pk2, P.p2], P.o6]], 'ink'));
      return b;
    },
  });

  // Mom's wicker sewing basket, lid ajar: spools and a pincushion poking out
  K.stamp('sewing_basket', {
    w: 1, h: 1,
    paint: () => {
      const b = K.B(16, 16);
      b.fillRect(2, 8, 12, 6, P.o2); b.hline(2, 8, 12, P.o1); b.hline(2, 13, 12, P.o4);
      for (let y = 9; y < 13; y++) for (let x = 2 + (y & 1); x < 14; x += 2) b.set(x, y, P.o3);      // weave
      b.fillRect(4, 4, 2, 4, P.red2); b.hline(4, 4, 2, P.p0); b.hline(4, 7, 2, P.p0);               // spool
      b.fillRect(7, 5, 2, 3, P.bl2); b.hline(7, 5, 2, P.p0);                                        // spool
      b.circle(11, 6, 2, P.red1, true); b.set(10, 5, P.red0); b.set(11, 3, P.f3);                    // tomato pincushion
      b.set(12, 4, P.n1); b.set(13, 5, P.n1);                                                       // pins
      b.line(1, 7, 6, 3, P.o3); b.line(2, 7, 7, 3, P.o2);                                           // the lid, propped open
      K.outer(b, S.omap([[WOOD, P.o6], [[P.red0, P.red1, P.red2, P.bl2, P.p0, P.f3, P.n1], P.o6]], 'o6'));
      K.shadow(b, 8, 14, 6, 1);
      return b;
    },
  });

  // Mom's cosy floral armchair with a lace doily, angled towards the TV (seen from behind)
  K.stamp('armchair', {
    w: 1, h: 1,
    paint: () => {
      const b = K.B(16, 16);
      const r = tn('pink');
      b.fillRect(2, 2, 12, 12, r[2]);
      b.fillRect(4, 2, 8, 4, r[1]); b.hline(4, 2, 8, r[0]);                                          // seat
      b.fillRect(2, 6, 12, 7, r[2]); b.hline(2, 6, 12, r[1]); b.hline(2, 12, 12, r[4]);             // back
      b.fillRect(1, 2, 3, 11, r[3]); b.vline(1, 2, 11, r[1]); b.fillRect(12, 2, 3, 11, r[3]);        // arms
      for (const [x, y] of [[4, 9], [8, 8], [11, 10], [6, 11]]) { b.set(x, y, P.yl1); b.set(x + 1, y, P.p0); b.set(x, y + 1, P.f2); }   // flowers
      b.fillRect(5, 5, 6, 2, P.p0); for (let x = 5; x < 11; x += 2) b.set(x, 7, P.p0);                // doily
      b.fillRect(2, 13, 2, 2, P.o5); b.fillRect(12, 13, 2, 2, P.o5);
      K.outer(b, S.omap([[r, K.ramp('pink')[5]], [[P.yl1, P.p0, P.f2], K.ramp('pink')[5]]], 'o6'));
      return b;
    },
  });

  // Coat hooks on the wall with a shoe rack under them. satchel: the hero's satchel hangs on a hook; empty: it's gone.
  K.stamp('coat_rack', {
    w: 2, h: 1, variants: ['satchel', 'empty'],
    paint: (v) => {
      const b = K.B(32, 16);
      b.fillRect(2, 1, 28, 2, P.o3); b.hline(2, 1, 28, P.o1);                                       // hook rail
      for (const x of [6, 13, 20, 26]) { b.set(x, 3, P.gd3); b.set(x, 4, P.gd2); }
      // coats: Mom's red coat and a blue rain jacket
      b.fillRect(4, 4, 5, 7, P.red2); b.vline(4, 4, 7, P.red1); b.set(6, 5, P.red3); b.hline(4, 10, 5, P.red3);
      b.fillRect(18, 4, 5, 6, P.bl2); b.vline(18, 4, 6, P.bl1); b.hline(18, 9, 5, P.bl3);
      if (v === 'satchel') {
        b.line(12, 4, 15, 4, P.b3); b.line(12, 4, 11, 7, P.b3); b.line(15, 4, 16, 7, P.b3);          // strap
        b.fillRect(10, 7, 7, 5, P.b1); b.hline(10, 7, 7, P.b0); b.fillRect(10, 7, 7, 2, P.b2); b.set(13, 9, P.gd2);   // flap + buckle
      }
      b.fillRect(1, 12, 30, 1, P.o2); b.fillRect(1, 15, 30, 1, P.o4);                                // shoe rack
      for (const [x, c] of [[3, P.red2], [8, P.ink2], [13, P.bl2], [20, P.p1], [25, P.b2]]) { b.fillRect(x, 13, 4, 2, c); b.set(x, 13, P.p0); }
      K.outer(b, S.omap([[WOOD, P.o6], [[P.b0, P.b1, P.b2, P.b3], P.b4], [[P.red1, P.red2, P.red3], P.red4], [[P.bl1, P.bl2, P.bl3], P.bl4]], 'o6'));
      return b;
    },
  });

  // ============================================================================================ the bedroom
  // A kid's desk with a chunky monitor and keyboard (the storage terminal), stickers on the monitor (rises 10px)
  K.stamp('pc_desk', {
    w: 2, h: 1, rise: 10,
    paint: () => {
      const b = K.B(32, 26);
      const w = K.ramp('white');
      for (const x of [2, 27]) { b.fillRect(x, 19, 3, 6, P.o4); b.vline(x, 19, 6, P.o3); }
      b.fillRect(1, 14, 30, 5, P.o2); b.hline(1, 14, 30, P.o0); b.hline(1, 18, 30, P.o4);            // desk top
      b.fillRect(4, 1, 15, 12, w[2]); b.hline(4, 1, 15, w[0]); b.vline(4, 1, 12, w[1]); b.vline(18, 1, 12, w[3]); b.hline(4, 12, 15, w[3]);   // CRT
      b.fillRect(6, 3, 11, 8, P.gl5); b.hline(7, 5, 6, P.gl2); b.hline(7, 7, 4, P.gl2); b.set(14, 7, P.pk1); b.set(7, 4, P.gl3);   // screen
      b.fillRect(9, 13, 5, 1, w[3]);
      b.blit(K.spr(['.x.', 'xxx', '.x.'], { x: P.yl2 }), 15, 9);                                     // star sticker
      b.blit(K.spr(['x.x', 'xxx', '.x.'], { x: P.pk2 }), 5, 9);                                      // heart sticker
      b.fillRect(20, 15, 9, 3, w[2]); for (let x = 21; x < 28; x += 2) b.set(x, 16, w[4]);            // keyboard
      b.fillRect(2, 10, 2, 4, P.red2); b.hline(2, 10, 2, P.red1);                                    // a can of pencils
      b.set(2, 9, P.yl2); b.set(3, 8, P.bl2);
      K.outer(b, S.omap([[S.tones(w), w[5]], [WOOD, P.o6]], 'ink'));
      K.shadow(b, 16, 25, 14, 1);
      return b;
    },
  });

  // A pinned paper map of Tsumugi with 8 pin spots; pins0..pins8 fill the spots with coloured Buttons (one per Salon)
  const PINS = ['pins0', 'pins1', 'pins2', 'pins3', 'pins4', 'pins5', 'pins6', 'pins7', 'pins8'];
  const PIN_SPOTS = [[10, 11], [16, 8], [22, 10], [27, 5], [33, 9], [38, 4], [41, 11], [30, 12]];
  const PIN_COLS = ['red', 'blue', 'yellow', 'green', 'pink', 'purple', 'orange', 'teal'];
  K.stamp('wall_map', {
    w: 3, h: 1, variants: PINS,
    paint: (v) => {
      const b = K.B(48, 16);
      b.fillRect(2, 1, 44, 14, P.yl0); b.hline(2, 1, 44, P.p0); b.hline(2, 14, 44, P.p3);            // paper
      b.fillRect(3, 2, 42, 12, P.bl0);                                                              // the sea
      // the land: a long island with bays, a lake and a ridge
      for (let x = 5; x < 44; x++) {
        const top = 3 + Math.round(1.5 + Math.sin(x * 0.45) * 1.5), bot = 12 - Math.round(1 + Math.sin(x * 0.3 + 1) * 1.2);
        for (let y = top; y <= bot; y++) b.set(x, y, (x + y) % 9 === 0 ? P.g1 : P.g0);
        b.set(x, top, P.g2); b.set(x, bot, P.g3);
      }
      b.fillRect(19, 6, 3, 2, P.bl1); b.hline(35, 6, 4, P.r2);
      K.stitchH(b, 8, 10, 30, P.d3, 1, 1);                                                          // a dotted road
      const n = PINS.indexOf(v);
      PIN_SPOTS.forEach(([x, y], i) => {
        if (i < n) { const r = K.ramp(PIN_COLS[i]); b.fillRect(x - 1, y - 1, 3, 3, r[2]); b.set(x - 1, y - 1, r[0]); b.set(x, y, r[4]); }
        else { b.set(x, y - 1, P.n3); b.set(x - 1, y, P.n3); b.set(x + 1, y, P.n3); b.set(x, y + 1, P.n3); }
      });
      for (const [x, y] of [[3, 2], [44, 2], [3, 13], [44, 13]]) b.set(x, y, P.red2);              // corner pins
      K.outer(b, S.omap([], 'o5'));
      return b;
    },
  });

  // Wall calendar: one date circled in red and a tiny lantern doodle (the Lantern Festival)
  K.stamp('calendar', {
    w: 1, h: 1,
    paint: () => {
      const b = K.B(16, 16);
      b.set(8, 0, P.n4);                                                                            // nail
      b.fillRect(3, 1, 10, 3, P.red2); b.hline(3, 1, 10, P.red1);
      b.fillRect(3, 4, 10, 10, P.p0); b.hline(3, 13, 10, P.p2);
      for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) b.set(4 + c * 2 + (c > 1 ? 1 : 0), 5 + r * 2, P.n3);
      b.ellipse(10, 9, 2, 1, P.red2, false);                                                        // the circled date
      b.set(5, 11, P.l3); b.set(5, 12, P.l2); b.set(6, 12, P.l3); b.set(5, 10, P.ink2);             // lantern doodle
      K.outer(b, S.omap([], 'o5'));
      return b;
    },
  });

  // Two posters: teal with chibi Konko and Ottopi, sunny yellow with Sprubun, orange borders
  function chibi(b, cx, cy, hood, ear) {
    const r = K.ramp(hood);
    b.circle(cx, cy, 3, r[2], true); b.set(cx - 1, cy - 2, r[1]);
    if (ear === 'tri') { b.set(cx - 3, cy - 3, r[2]); b.set(cx + 3, cy - 3, r[2]); b.set(cx - 3, cy - 4, r[3]); b.set(cx + 3, cy - 4, r[3]); }
    if (ear === 'round') { b.set(cx - 3, cy - 3, r[3]); b.set(cx + 3, cy - 3, r[3]); }
    if (ear === 'long') { b.vline(cx - 2, cy - 6, 3, r[2]); b.vline(cx + 2, cy - 6, 3, r[2]); }
    b.fillRect(cx - 1, cy, 3, 2, P.p0); b.set(cx - 1, cy, P.ink); b.set(cx + 1, cy, P.ink);        // face + eyes
    b.fillRect(cx - 2, cy + 3, 5, 3, r[2]); b.hline(cx - 2, cy + 3, 5, r[1]);                       // body
  }
  K.stamp('kigu_poster', {
    w: 2, h: 1,
    paint: () => {
      const b = K.B(32, 16);
      const tl = K.ramp('teal'), yl = K.ramp('yellow'), or = K.ramp('orange');
      b.fillRect(1, 1, 14, 14, or[2]); b.fillRect(2, 2, 12, 12, tl[1]); b.hline(2, 2, 12, tl[0]);
      chibi(b, 5, 7, 'orange', 'tri'); chibi(b, 11, 7, 'blue', 'round');
      b.fillRect(17, 1, 14, 14, or[2]); b.fillRect(18, 2, 12, 12, yl[1]); b.hline(18, 2, 12, yl[0]);
      chibi(b, 24, 8, 'green', 'long');
      for (const [x, y] of [[20, 4], [28, 5], [19, 12]]) b.set(x, y, P.white);                      // sparkles
      for (const x of [1, 14, 17, 30]) b.set(x, 1, P.n1);                                            // tacks
      K.outer(b, S.omap([], 'o5'));
      return b;
    },
  });

  // Laundry basket. overflow: the bedroom's blue plastic basket, clothes heaped over the rim and a sock hanging off;
  // folded: a wicker basket of folded washing (outdoors under a washing line).
  K.stamp('laundry_basket', {
    w: 1, h: 1, variants: ['overflow', 'folded'],
    paint: (v) => {
      const b = K.B(16, 16);
      if (v === 'folded') {
        b.fillRect(2, 8, 12, 6, P.o2); b.hline(2, 8, 12, P.o1); b.hline(2, 13, 12, P.o4);
        for (let y = 9; y < 13; y++) for (let x = 2 + (y & 1); x < 14; x += 2) b.set(x, y, P.o3);
        b.fillRect(3, 5, 10, 3, P.p0); b.hline(3, 7, 10, P.p2);                                     // folded sheets
        b.fillRect(4, 3, 8, 2, P.pk1); b.hline(4, 4, 8, P.pk2); b.fillRect(5, 1, 6, 2, P.bl1); b.hline(5, 2, 6, P.bl2);
        K.outer(b, S.omap([[WOOD, P.o6]], 'o6'));
        K.shadow(b, 8, 14, 6, 1);
        return b;
      }
      const s = K.ramp('sky');
      b.fillRect(2, 7, 12, 7, s[2]); b.hline(2, 7, 12, s[1]); b.hline(2, 13, 12, s[4]); b.vline(13, 7, 7, s[3]);
      for (const x of [4, 7, 10]) b.fillRect(x, 9, 1, 3, s[4]);                                     // slots
      for (const [x, y, rx, ry, c] of [[5, 6, 3, 2, P.red1], [10, 5, 3, 2, P.yl1], [8, 4, 3, 2, P.f1], [6, 3, 2, 1, P.p0]]) b.ellipse(x, y, rx, ry, c, true);
      b.vline(13, 7, 5, P.pk1); b.set(14, 11, P.pk1); b.set(14, 12, P.pk2);                           // a sock over the rim
      K.outer(b, S.omap([[S.tones(s), s[5]]], 'ink'));
      K.shadow(b, 8, 14, 6, 1);
      return b;
    },
  });

  // An orange-and-cream beanbag shaped like a curled Konko tail, a grey hoodie flung over the back (2x2)
  K.stamp('beanbag', {
    w: 2, h: 2,
    paint: () => {
      const b = K.B(32, 32);
      const o = K.tn5('orange'), c = K.tn('p0', 'p1', 'p2', 'p3', 'p4');
      K.blob(b, 16, 18, 13, 11, o);
      K.blob(b, 22, 12, 7, 6, c);                                                                   // the cream tail tip curling over
      b.line(9, 14, 15, 19, o[3]); b.line(15, 19, 23, 22, o[3]);                                     // a dent where you sit
      // hoodie flung over the back: grey with a drawstring and a sleeve dangling
      for (let x = 4; x < 16; x++) { const t = 6 + Math.round(Math.sin(x * 0.5)); for (let y = t; y < t + 6; y++) b.set(x, y, y === t ? P.n1 : P.n2); }
      b.fillRect(3, 11, 3, 8, P.n2); b.vline(3, 11, 8, P.n1); b.hline(3, 18, 3, P.n3);
      b.set(9, 9, P.p0); b.set(10, 10, P.p0);
      K.outer(b, S.omap([[o, K.ramp('orange')[5]], [c, P.p5], [[P.n1, P.n2, P.n3], P.n5]], 'ink'));
      K.shadow(b, 16, 30, 13, 2);
      return b;
    },
  });

  // A section of wall shelving; what's on it follows story and side flags (empty, a plush, a framed card, a trophy)
  K.stamp('trophy_shelf', {
    w: 1, h: 1, variants: ['empty', 'plush', 'card', 'trophy'],
    paint: (v) => {
      const b = K.B(16, 16);
      b.fillRect(1, 2, 14, 12, P.o5); b.fillRect(1, 2, 2, 12, P.o3); b.fillRect(13, 2, 2, 12, P.o4);
      b.fillRect(1, 12, 14, 2, P.o2); b.hline(1, 12, 14, P.o1); b.hline(1, 1, 14, P.o3);
      if (v === 'plush') {
        b.circle(8, 8, 3, P.pk1, true); b.set(5, 5, P.pk1); b.set(11, 5, P.pk1); b.set(5, 4, P.pk2); b.set(11, 4, P.pk2);
        b.set(7, 8, P.ink); b.set(9, 8, P.ink); b.set(8, 9, P.pk3); b.set(7, 6, P.pk0);
      } else if (v === 'card') {
        b.fillRect(5, 4, 6, 8, P.gd3); b.fillRect(6, 5, 4, 6, P.p0); b.fillRect(6, 5, 4, 3, P.bl1); b.set(7, 6, P.yl2);
      } else if (v === 'trophy') {
        b.fillRect(5, 4, 6, 4, P.gd2); b.vline(5, 4, 4, P.gd1); b.vline(10, 4, 4, P.gd3);
        b.set(4, 5, P.gd3); b.set(11, 5, P.gd3); b.fillRect(7, 8, 2, 2, P.gd3); b.fillRect(5, 10, 6, 2, P.o3);
        b.set(6, 4, P.gd0);
      }
      K.outer(b, WOOD_OUT);
      return b;
    },
  });

  // Double bed, headboard and pillows at the SOUTH end (2x3). sleeping: just the sheet (the blanket is bed_blanket, drawn over the
  // sleeper); unmade: the patchwork blanket thrown back towards the foot; made: blanket pulled up neat.
  const QUILT = [[P.pk2, P.pk1], [P.yl2, P.yl1], [P.bl2, P.bl1], [P.f3, P.f1], [P.red1, P.red0]];
  function quilt(b, x0, y0, w, h, lump) {
    for (let y = y0; y < y0 + h; y++) for (let x = x0; x < x0 + w; x++) {
      const cx = Math.floor((x - x0) / 5), cy = Math.floor((y - y0) / 5), q = QUILT[(cx + cy * 2) % QUILT.length];
      let c = (y - y0) % 5 === 0 ? q[1] : q[0];
      if ((x - x0) % 5 === 4 || (y - y0) % 5 === 4) c = P.p1;                                         // stitched seams
      b.set(x, y, c);
    }
    if (lump) {   // the shape of someone curled up underneath: a lit ridge and a shadow along it
      for (let y = y0 + 2; y < y0 + h; y++) { const xx = x0 + (w >> 1) - 4 + Math.round(Math.sin((y - y0) * 0.25) * 1.5); b.set(xx, y, P.p0); b.set(xx + 8, y, P.n3); b.set(xx + 9, y, P.n3); }
    }
    b.hline(x0, y0 + h - 1, w, P.n3);
  }
  K.stamp('bed_double', {
    w: 2, h: 3, variants: ['sleeping', 'unmade', 'made'],
    paint: (v) => {
      const b = K.B(32, 48);
      b.fillRect(1, 1, 30, 46, P.o3); b.hline(1, 1, 30, P.o1);                                      // frame
      b.fillRect(1, 1, 30, 4, P.o2); b.hline(1, 4, 30, P.o4);                                       // footboard (north)
      b.fillRect(3, 5, 26, 36, P.p1); b.vline(3, 5, 36, P.p0); b.vline(28, 5, 36, P.p2);           // sheet
      for (const x of [5, 17]) { b.fillRect(x, 33, 10, 7, P.p0); b.hline(x, 39, 10, P.p2); b.vline(x + 9, 33, 7, P.p2); b.set(x, 33, 0); b.set(x + 9, 33, 0); }   // pillows
      if (v === 'unmade') { quilt(b, 3, 5, 26, 9); b.hline(3, 14, 26, P.p3); for (let x = 3; x < 29; x += 3) b.set(x, 13, P.p0); }
      if (v === 'made') { quilt(b, 3, 5, 26, 25); b.fillRect(3, 28, 26, 3, P.p0); b.hline(3, 30, 26, P.p2); }
      if (v === 'sleeping') { b.hline(9, 36, 6, P.p2); }                                            // a dent in the pillow
      b.fillRect(1, 41, 30, 6, P.o2); b.hline(1, 41, 30, P.o0); b.hline(1, 46, 30, P.o4);           // headboard (south)
      b.set(5, 43, P.o4); b.set(26, 43, P.o4);
      K.outer(b, S.omap([[WOOD, P.o6], [[P.p0, P.p1, P.p2, P.p3, P.n3], P.p5]], 'o6'));
      return b;
    },
  });

  // The patchwork blanket with a body-shaped lump, drawn ABOVE actors (over: 2) so the sleeping hero looks tucked in. goneIf woke.
  K.stamp('bed_blanket', {
    w: 2, h: 2, over: 2, solid: ['..', '..'],
    paint: () => {
      const b = K.B(32, 32);
      quilt(b, 3, 5, 26, 24, true);
      b.fillRect(3, 27, 26, 4, P.p0); b.hline(3, 30, 26, P.p2); b.hline(3, 27, 26, P.p1);           // the sheet folded over the top
      K.outer(b, S.omap([], 'p5'));
      return b;
    },
  });

  // A painted wooden toy chest whose lid won't quite close (a plush paw pokes out)
  K.stamp('toy_chest', {
    w: 1, h: 1,
    paint: () => {
      const b = K.B(16, 16);
      const r = K.ramp('red'), bl = K.ramp('blue');
      b.fillRect(1, 7, 14, 7, r[2]); b.hline(1, 7, 14, r[1]); b.hline(1, 13, 14, r[4]); b.vline(14, 7, 7, r[3]);
      b.blit(K.spr(['.x.', 'xxx', '.x.'], { x: P.yl2 }), 6, 9); b.set(3, 10, P.p0); b.set(12, 11, P.p0);   // painted star and dots
      b.fillRect(1, 3, 14, 3, bl[2]); b.hline(1, 3, 14, bl[1]); b.hline(1, 5, 14, bl[3]);            // the lid, propped on a toy
      b.fillRect(3, 6, 3, 1, P.pk1); b.set(4, 6, P.pk2);                                             // a plush paw in the gap
      b.fillRect(7, 6, 2, 1, P.o6); b.fillRect(10, 6, 3, 1, P.o6);
      K.outer(b, S.omap([[S.tones(r), r[5]], [S.tones(bl), bl[5]]], 'ink'));
      K.shadow(b, 8, 14, 7, 1);
      return b;
    },
  });

  // Small bedside table: lamp (it glows at night through def.nightGlow) or alarm (a round twin-bell alarm clock)
  K.stamp('nightstand', {
    w: 1, h: 1, variants: ['lamp', 'alarm'],
    paint: (v) => {
      const b = K.B(16, 16);
      b.fillRect(2, 8, 12, 6, P.o3); b.hline(2, 8, 12, P.o1); b.hline(2, 13, 12, P.o4);
      b.fillRect(2, 7, 12, 2, P.o2); b.strokeRect(4, 10, 8, 3, P.o4); b.set(8, 11, P.gd2);
      if (v === 'lamp') {
        b.fillRect(7, 4, 2, 3, P.o4);
        b.fillRect(4, 0, 8, 4, P.yl0); b.hline(5, 0, 6, P.p0); b.hline(4, 3, 8, P.yl1); b.set(4, 0, 0); b.set(11, 0, 0);
        b.fillRect(5, 6, 6, 1, P.o5);
      } else {
        b.circle(8, 4, 3, P.red2, true); b.circle(8, 4, 2, P.p0, true); b.vline(8, 3, 2, P.ink2); b.set(9, 4, P.ink2);
        b.set(5, 1, P.gd2); b.set(11, 1, P.gd2); b.set(6, 1, P.gd3); b.set(10, 1, P.gd3);           // twin bells
        b.set(5, 7, P.red3); b.set(11, 7, P.red3);
      }
      K.outer(b, S.omap([[WOOD, P.o6]], 'ink'));
      K.shadow(b, 8, 14, 6, 1);
      return b;
    },
  });

  // Walk-over floor clutter (layer 'floor'): the bedroom's teen mess, plus outdoor bits (pebbles, petals, a grass tuft)
  const CLUTTER = ['clothes', 'socks', 'controller', 'figures', 'plushies', 'comic', 'sneakers', 'pebbles', 'petals', 'tuft'];
  K.stamp('floor_clutter', {
    w: 1, h: 1, layer: 'floor', solid: ['.'], variants: CLUTTER,
    paint: (v) => {
      const b = K.B(16, 16);
      let outline = 'ink';
      if (v === 'clothes') {           // yesterday's outfit: a t-shirt and jeans in a heap
        b.fillRect(2, 5, 8, 6, P.red1); b.fillRect(1, 5, 2, 3, P.red1); b.fillRect(9, 5, 2, 3, P.red1); b.hline(2, 5, 8, P.red0);
        b.fillRect(7, 8, 7, 5, P.bl2); b.vline(10, 9, 4, P.bl3); b.hline(7, 8, 7, P.bl1);
      } else if (v === 'socks') {      // two odd socks
        b.fillRect(2, 4, 3, 6, P.yl1); b.fillRect(2, 9, 5, 2, P.yl1); b.hline(2, 4, 3, P.red1); b.set(3, 6, P.red1);
        b.fillRect(10, 6, 3, 5, P.pu1); b.fillRect(8, 10, 5, 2, P.pu1); b.hline(10, 6, 3, P.p0); b.set(11, 8, P.f1);
      } else if (v === 'controller') { // a game controller and snack cake wrappers
        b.fillRect(3, 6, 9, 4, P.n2); b.fillRect(2, 7, 2, 4, P.n2); b.fillRect(11, 7, 2, 4, P.n2); b.hline(3, 6, 9, P.n1);
        b.set(4, 8, P.ink2); b.set(10, 7, P.red2); b.set(11, 8, P.bl2); b.line(7, 6, 9, 2, P.n4);
        b.fillRect(11, 12, 4, 2, P.pk1); b.set(12, 12, P.p0); b.fillRect(1, 12, 3, 2, P.yl1); b.set(2, 13, P.red1);
      } else if (v === 'figures') {    // tiny Konko, Ottopi and Sprubun figures mid-fight
        for (const [x, y, c] of [[3, 6, 'orange'], [8, 4, 'blue'], [11, 9, 'green']]) { const r = K.ramp(c); b.fillRect(x, y, 3, 4, r[2]); b.hline(x, y, 3, r[1]); b.set(x + 1, y + 1, P.p0); b.fillRect(x, y + 4, 3, 1, P.n3); }
        b.set(7, 8, P.yl2); b.set(10, 7, P.yl2);                                                    // little action sparks
      } else if (v === 'plushies') {   // plushies spilling out, one a homemade Nibblenna
        b.circle(5, 8, 3, P.yl1, true); b.set(3, 5, P.yl2); b.set(7, 5, P.yl2); b.set(4, 8, P.ink); b.set(6, 8, P.ink);
        b.circle(11, 9, 3, P.b1, true); b.fillRect(9, 5, 5, 2, P.p0); b.set(10, 9, P.ink); b.set(12, 9, P.ink); b.set(11, 10, P.pk2);   // chef hat
        b.set(13, 12, P.pk2); b.set(12, 12, P.p0);                                                  // a wonky stitched seam
      } else if (v === 'comic') {      // an open comic, face down
        b.fillRect(2, 6, 6, 6, P.red1); b.fillRect(8, 6, 6, 6, P.red2); b.vline(8, 6, 6, P.red3); b.hline(2, 6, 12, P.red0);
        b.fillRect(9, 8, 3, 2, P.yl1); b.set(4, 9, P.p0);
      } else if (v === 'sneakers') {   // sneakers, one on its side
        b.fillRect(2, 5, 4, 7, P.p0); b.hline(2, 11, 4, P.bl2); b.set(3, 6, P.red2); b.set(4, 7, P.red2);
        b.fillRect(8, 9, 7, 3, P.p0); b.hline(8, 12, 7, P.bl2); b.set(10, 9, P.red2); b.set(9, 10, P.ink2);
      } else if (v === 'pebbles') {
        for (const [x, y] of [[4, 6], [10, 9], [6, 11], [12, 4]]) { b.fillRect(x, y, 2, 2, P.c2); b.set(x, y, P.c0); b.set(x + 1, y + 1, P.c4); }
        outline = null;
      } else if (v === 'petals') {
        for (const [x, y] of [[3, 4], [9, 6], [5, 10], [12, 11], [7, 2], [11, 2]]) { b.set(x, y, P.pk1); b.set(x + 1, y, P.pk2); b.set(x, y + 1, P.pk2); }
        outline = null;
      } else {                         // a small grass tuft
        for (const [x, h] of [[5, 4], [6, 6], [7, 5], [8, 7], [9, 4], [10, 5]]) b.vline(x, 12 - h, h, x & 1 ? P.g3 : P.g2);
        b.set(8, 5, P.g1); b.set(6, 6, P.g1); b.hline(5, 12, 6, P.g4);
        outline = null;
      }
      if (outline) K.outer(b, S.omap([], 'o6'));
      return b;
    },
  });
})(typeof globalThis !== 'undefined' ? globalThis : window);
