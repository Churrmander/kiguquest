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
      // tiled backsplash along the wall, then its contact shadow on the worktop
      b.fillRect(0, 0, 16, 2, P.c0); for (const x of [3, 7, 11, 15]) b.vline(x, 0, 2, P.c2); b.hline(0, 1, 16, P.c2);
      b.fillRect(0, 2, 16, 6, P.c1); b.hline(0, 2, 16, P.c2);                                       // stone worktop
      b.set(4, 5, P.c2); b.set(12, 4, P.c2);
      b.hline(0, 8, 16, P.c0);                                                                      // the lit front lip of the slab
      b.hline(0, 9, 16, P.o6);                                                                      // its shadow on the cabinet
      b.fillRect(0, 10, 16, 5, P.o3); b.hline(0, 10, 16, P.o4);                                    // cabinet
      b.strokeRect(2, 11, 12, 3, P.o4); b.fillRect(7, 12, 2, 1, P.gd2);                           // door + brass pull
      b.hline(0, 15, 16, P.o6);
      if (v === 'plain') {
        // a red kettle with a dark outline, its spout to the right and a soft shadow on the stone
        b.hline(4, 7, 8, P.c2);
        K.stick(b, 3, 0, [
          '..kkk.....',
          '.k...k....',
          '.kllllk...',
          'klwrrrdk.k',
          'klrrrrdkk.',
          'krrrrrrdk.',
          '.kkkkkkk..',
        ], { k: P.red4, l: P.red1, w: P.white, r: P.red2, d: P.red3 });
      } else if (v === 'cakes') {
        // a glass cake dome on a stand: pale glass, a white glint top-left, two iced cakes inside
        b.hline(2, 7, 12, P.n3); b.hline(3, 6, 10, P.white);                                        // the stand
        for (let y = 0; y <= 5; y++) for (let x = 2; x <= 13; x++) {
          const d = ((x - 7.5) / 5.5) ** 2 + ((y - 6) / 6) ** 2;
          if (d <= 1) b.set(x, y, d > 0.72 ? P.n3 : P.gl1);
        }
        for (const [x, y] of [[4, 2], [5, 1], [3, 3], [3, 4]]) b.set(x, y, P.white);                // the glint
        b.set(7, 0, P.n3); b.set(8, 0, P.n3);                                                       // the knob
        for (const x of [4, 8]) {
          b.fillRect(x, 3, 3, 1, P.pk1); b.set(x, 3, P.white);                                        // icing
          b.fillRect(x, 4, 3, 2, P.o1); b.set(x + 2, 4, P.o2); b.set(x + 2, 5, P.o2);               // sponge, shaded right
          b.set(x + 1, 2, P.red2);                                                                  // cherry
        }
      } else {
        // Mom has given the cakes away: one plate left with a dab of icing, and a few tan crumb clusters
        for (let y = 3; y <= 7; y++) for (let x = 2; x <= 10; x++) {
          const d = ((x - 6) / 4.2) ** 2 + ((y - 5) / 2.2) ** 2;
          if (d <= 1) b.set(x, y, d > 0.6 ? P.n2 : P.p0);
        }
        b.hline(4, 7, 5, P.n3); b.set(4, 4, P.white);
        b.set(6, 5, P.pk1); b.set(7, 5, P.o2);
        for (const [x, y] of [[12, 4], [13, 4], [12, 5]]) b.set(x, y, P.o2);
        b.set(13, 5, P.o4);
        for (const [x, y] of [[13, 6], [14, 6]]) b.set(x, y, P.o2);
      }
      return b;
    },
  });

  // Square family dining table with a gingham cloth: a teapot in the middle, a plate at each place and two cups of cocoa (2x2)

  K.stamp('table_sq', {
    w: 2, h: 2,
    paint: () => {
      const b = K.B(32, 32);
      // legs at the four corners (the back two peek out under the cloth's sides)
      for (const x of [2, 27]) { b.fillRect(x, 23, 3, 7, P.o4); b.vline(x, 23, 7, P.o3); b.hline(x, 29, 3, P.o5); }
      // the cloth: a 4px red-and-white check over the top
      S.gingham(b, 1, 2, 30, 19, P.p0, P.red0, P.red1, 4);
      // where it hangs over the front: one step darker, a red shadow band along the hem, scalloped
      for (let x = 1; x < 31; x++) {
        const hem = 25 + ((x & 3) === 1 || (x & 3) === 2 ? 1 : 0);
        for (let y = 21; y <= hem; y++) b.set(x, y, ((x >> 2) & 1) ? P.red2 : P.red1);
        b.set(x, hem - 1, P.red3); b.set(x, hem, P.red3);
      }
      b.hline(1, 21, 30, P.red3);                                                                   // the table edge under the cloth
      // china, painted on its own layer and outlined so nothing on the cloth shows through it
      const o = K.B(32, 32);
      for (const [x, y] of [[4, 4], [22, 4], [4, 14], [22, 14]]) {                                 // a plate at each place
        K.stick(o, x, y, ['.wwww.', 'wwwwww', 'wwnnww', '.nnnn.'], { w: P.p0, n: P.n1 });
      }
      o.set(6, 5, P.o1); o.set(7, 5, P.o2); o.set(24, 15, P.o1);                                    // biscuits
      for (const [x, y] of [[11, 16], [18, 6]]) { o.fillRect(x, y, 3, 3, P.p0); o.hline(x, y, 3, P.b2); o.hline(x, y + 2, 3, P.n1); o.set(x + 3, y + 1, P.p0); }
      // the teapot: cream body with a blue band, lid and knob, spout to the right, handle to the left
      K.stick(o, 9, 6, [
        '......k......',
        '....wwwwn....',
        '...pwwwwwn...',
        '.h.pwwwwwnn.s',
        'h.pwwwwwwwnss',
        'h.bbbbbbbbbs.',
        '.hpwwwwwwwn..',
        '..pwwwwwwnn..',
        '...nnnnnnn...',
      ], { k: P.bl3, w: P.p0, p: P.p1, n: P.p3, h: P.p3, s: P.p2, b: P.bl2 });
      o.set(13, 8, P.white);
      K.outer(o, 'n3');
      b.blit(o, 0, 0);
      out(b, [[[P.p0, P.p1, P.red0, P.red1, P.red2, P.red3, P.n3], P.red4]]);
      K.shadow(b, 16, 29, 15, 2, 150);
      return b;
    },
  });

  // Nibblenna's round cushioned basket: flat on the floor, so she can stand in it

  K.stamp('pet_bed', {
    w: 1, h: 1, layer: 'floor', solid: ['.'],
    paint: () => {
      const b = K.B(16, 16);
      // an oval cushion bed: a soft rim (lit top, darker front), a dark hollow, a pink pillow and a folded blue blanket
      K.stick(b, 1, 2, [
        '....aaaaaa....',
        '..aaaaaaaaaa..',
        '.aaaHHHHHHaab.',
        'aaaHHHHHHHHHab',
        'aaHHppppPHHHbb',
        'aaHpppppppHHbb',
        'aaHPPPPPBBBlbb',
        'aaHHPPPBBlBLbb',
        'aabHHHBBBBLLbb',
        '.bbbbbbbbbbbb.',
        '..bbbbbbbbbb..',
        '....bbbbbb....',
      ], { a: P.o1, b: P.o3, H: P.o4, p: P.pk1, P: P.pk2, B: P.bl1, l: P.bl0, L: P.bl3 });
      b.hline(5, 2, 6, P.o0); b.set(3, 3, P.o0); b.set(4, 3, P.o0);
      K.outer(b, 'o6');
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
      b.hline(5, 14, 6, P.o3); b.set(5, 14, P.o2);                                                 // foot
      b.ellipse(7.5, 7, 6.5, 3, P.o3, true);                                                         // the rim's thickness
      b.ellipse(7.5, 6, 6.5, 3, P.o1, true); b.hline(3, 4, 5, P.o0); b.set(2, 5, P.o0);              // the lit round top
      // a small photo frame on its easel back: two kids holding a kite with a wonky tail, and its shadow on the top
      b.vline(11, 3, 5, P.o3); b.hline(6, 8, 5, P.o3);
      b.fillRect(6, 2, 5, 6, P.o5); b.fillRect(7, 3, 3, 4, P.sk1);
      b.hline(7, 6, 3, P.g2); b.set(7, 5, P.yl2); b.set(9, 5, P.bl2); b.set(8, 3, P.red2);
      K.outer(b, WOOD_OUT);
      b.vline(7, 11, 3, P.o2); b.vline(8, 11, 3, P.o4); b.vline(6, 12, 2, P.o6); b.vline(9, 12, 2, P.o6);   // pedestal leg
      K.shadow(b, 8, 15, 5, 1);
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
      b.fillRect(6, 1, 20, 11, P.n5); b.hline(6, 1, 20, P.n3);                                      // bezel
      // screen: mid blue, a darker band sweeping across the bottom-right, a bright glare top-left
      for (let y = 2; y < 11; y++) for (let x = 7; x < 25; x++) {
        const t = (x - 7) / 18 + (y - 2) / 9;
        b.set(x, y, t > 1.35 ? P.gl5 : t > 0.95 ? P.gl4 : P.gl4);
        if (t > 1.35) b.set(x, y, P.gl5); else if (t < 0.95 && (x - 7) + (y - 2) * 2 < 3) b.set(x, y, P.gl2);
      }
      for (let k = 0; k < 5; k++) b.set(9 + k, 3 + (k >> 1), P.gl3);                                 // glare streak
      b.set(8, 3, P.gl2);
      b.fillRect(14, 11, 4, 2, P.n4);                                                               // stand
      if (v === 'console') {
        // the console on the right of the top, its controller on the left, the cord tucked along the back edge
        b.fillRect(26, 9, 5, 4, P.n1); b.hline(26, 9, 5, P.white); b.vline(30, 10, 3, P.n3); b.set(27, 11, P.f1);
        b.hline(6, 12, 20, P.n5);
        K.stick(b, 1, 10, ['.nnn.', 'nwnrn', 'nnnnn'], { n: P.n3, w: P.n1, r: P.red2 });
      } else {
        b.fillRect(2, 10, 3, 3, P.br2); b.hline(2, 10, 3, P.br1);                                    // a little plant, fully on the top
        K.stick(b, 1, 6, ['.a.b.', 'abacb', '.cbc.', '..c..'], { a: P.f1, b: P.f2, c: P.f3 });
      }
      out(b, [[[P.n0, P.n1, P.n2, P.n3, P.n4, P.n5, P.gl2, P.gl3, P.gl4, P.gl5, P.white], P.ink], [[P.f1, P.f2, P.f3], P.f5], [[P.br1, P.br2], P.br4]]);
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
      b.fillRect(4, 4, 3, 4, P.bl2); b.vline(4, 4, 4, P.bl1); b.hline(3, 3, 5, P.o1); b.hline(3, 7, 5, P.o3);   // a spool of blue thread
      b.circle(10, 6, 2, P.red1, true); b.set(9, 5, P.red0); b.set(11, 7, P.red2);                   // tomato pincushion...
      b.hline(9, 3, 3, P.f3); b.set(10, 2, P.f2);                                                     // ...with its green cap
      b.line(1, 7, 4, 2, P.o3);                                                                       // the lid, propped open
      K.outer(b, S.omap([[WOOD, P.o6], [[P.red0, P.red1, P.red2, P.bl1, P.bl2, P.f2, P.f3], P.o6]], 'o6'));
      b.line(12, 5, 14, 2, P.n1); b.set(14, 1, P.n3); b.line(11, 4, 12, 1, P.n1);                    // two needles sticking out of it
      K.shadow(b, 8, 14, 6, 1);
      return b;
    },
  });

  // Mom's cosy floral armchair with a lace doily: a tall back along the north, two raised arms with rounded fronts, a lower seat cushion

  K.stamp('armchair', {
    w: 1, h: 1,
    paint: () => {
      const b = K.B(16, 16);
      const r = tn('pink');
      // a tall back with one embroidered flower, two raised arms, the seat sunk between them; lit from the top left
      K.stick(b, 1, 1, [
        '00000000000001',
        '01111111111112',
        '12222222222223',
        '1222222w222223',
        '001222wYw22002',
        '0113222w222013',
        '01132222222313',
        '01131111113013',
        '01131111113013',
        '01131111113013',
        '01131111113013',
        '22242222222443',
        '33343333333444',
        'ff..........ff',
      ], { 0: r[0], 1: r[1], 2: r[2], 3: r[3], 4: r[4], w: P.p0, Y: P.yl2, f: P.o5 });
      K.outer(b, S.omap([[r.concat([P.p0, P.yl2]), K.ramp('pink')[5]]], 'o6'));
      return b;
    },
  });

  // Coat hooks on the wall with a shoe rack under them. satchel: the hero's satchel hangs on a hook; empty: it's gone.
  K.stamp('coat_rack', {
    w: 2, h: 1, variants: ['satchel', 'empty'],
    paint: (v) => {
      const b = K.B(32, 16);
      // one piece of hall furniture: a planked back board joins the side posts, the peg rail and the shoe shelf
      b.fillRect(3, 3, 26, 10, P.o4); for (const x of [9, 16, 23]) b.vline(x, 3, 10, P.o5);
      for (const x of [1, 29]) { b.fillRect(x, 1, 2, 14, P.o3); b.vline(x, 1, 14, P.o2); }
      b.fillRect(1, 1, 30, 2, P.o3); b.hline(1, 1, 30, P.o1); b.hline(3, 3, 26, P.o5);            // peg rail and its shadow
      for (const x of [7, 15, 25]) { b.set(x, 3, P.gd3); b.set(x, 2, P.gd2); }
      // coats hung by the collar: a V collar notch, a button placket, sleeve seams, cuffs, a darker right side
      const coat = (x, c) => K.stick(b, x, 4, [
        '..abbc..',
        '.abb4bc.',
        'aab343cc',
        'a3bb4b4c',
        'a3bbgb4c',
        'a3bb4b4c',
        '33bbgb44',
        '..3344..',
      ], { a: c[1], b: c[2], 3: c[3], 4: c[4], c: c[3], g: P.gd2 });
      coat(4, K.ramp('red'));
      coat(21, K.ramp('blue'));
      if (v === 'satchel') {
        // the hero's satchel hangs in front on the middle peg: a thin strap, a flap with a brass buckle
        b.line(15, 3, 12, 6, P.b0); b.line(15, 3, 18, 6, P.b0);
        K.stick(b, 12, 6, [
          'aaaaaaa',
          'abbbbbc',
          'abbgbbc',
          'cccdccc',
          'eeeeeee',
        ], { a: P.b0, b: P.b1, c: P.b2, g: P.gd2, d: P.gd3, e: P.b3 });
      }
      // the shoe shelf between the posts, two pairs on it
      b.fillRect(3, 13, 26, 2, P.o2); b.hline(3, 13, 26, P.o1); b.hline(3, 14, 26, P.o4);
      for (const [x, c, cl] of [[6, P.red2, P.red0], [19, P.bl2, P.bl0]]) for (const dx of [0, 4]) {
        b.fillRect(x + dx, 11, 3, 2, c); b.set(x + dx, 11, cl); b.hline(x + dx, 12, 3, P.p1); b.set(x + dx + 2, 11, P.ink2);
      }
      K.outer(b, S.omap([[WOOD, P.o6], [[P.b0, P.b1, P.b2, P.b3, P.b4, P.gd2, P.gd3], P.b4], [S.tones(K.ramp('red')).concat([P.red0, P.red1, P.red2, P.red3]), P.red4], [S.tones(K.ramp('blue')).concat([P.bl0, P.bl1, P.bl2, P.bl3]), P.bl4], [[P.p0, P.p1, P.p2, P.p3], P.o6]], 'o6'));
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

  // A pinned paper map of Tsumugi (three islands in a blue sea, a dotted route) with 8 pin spots; pins0..pins8 fill them with
  // 2px coloured Button pins with a dark outline (one per Salon)
  const PINS = ['pins0', 'pins1', 'pins2', 'pins3', 'pins4', 'pins5', 'pins6', 'pins7', 'pins8'];
  const PIN_SPOTS = [[6, 10], [10, 6], [15, 11], [24, 6], [28, 11], [33, 7], [37, 10], [41, 6]];
  const PIN_COLS = ['red', 'blue', 'yellow', 'green', 'pink', 'purple', 'orange', 'teal'];
  K.stamp('wall_map', {
    w: 3, h: 1, variants: PINS,
    paint: (v) => {
      const b = K.B(48, 16);
      b.fillRect(1, 1, 46, 14, P.o3); b.hline(1, 1, 46, P.o1); b.hline(1, 14, 46, P.o5);           // wooden frame
      b.fillRect(2, 2, 44, 12, P.bl1);                                                              // the sea
      for (const [x, y] of [[4, 3], [44, 12], [33, 3]]) b.hline(x, y, 2, P.bl0);
      // the main island with a darker coast, a small one to the east, and a blue river down the middle
      const land = (cx, cy, rx, ry) => { b.ellipse(cx, cy, rx, ry, P.g3, true); b.ellipse(cx - 0.5, cy - 0.5, rx - 1, ry - 1, P.g1, true); };
      land(21, 8, 18.5, 4.8); land(41, 8, 4, 4);
      b.hline(1, 14, 46, P.o5); b.hline(1, 1, 46, P.o1); b.vline(1, 1, 14, P.o3); b.vline(46, 1, 14, P.o3);   // keep the land inside the frame
      for (const [x, y] of [[8, 6], [12, 10], [26, 6], [30, 11]]) { b.set(x, y, P.g2); b.set(x + 1, y, P.g2); }
      for (const [x, y] of [[19, 3], [19, 4], [20, 5], [20, 6], [21, 7], [21, 8], [20, 9], [20, 10], [21, 11], [21, 12]]) b.set(x, y, P.bl2);
      // the road (a tan line) joining the eight Salon towns (white dots)
      for (let i = 1; i < PIN_SPOTS.length; i++) b.line(PIN_SPOTS[i - 1][0], PIN_SPOTS[i - 1][1], PIN_SPOTS[i][0], PIN_SPOTS[i][1], P.d3);
      for (const [x, y] of PIN_SPOTS) b.set(x, y, P.white);
      // a round-headed pin in each town already won: coloured head with a highlight, a grey needle down to the town
      const n = PINS.indexOf(v);
      PIN_SPOTS.forEach(([x, y], i) => {
        if (i >= n) return;
        const r = K.ramp(PIN_COLS[i]);
        b.fillRect(x, y - 3, 2, 2, r[2]); b.set(x, y - 3, r[0]); b.set(x + 1, y - 2, r[4]); b.set(x, y - 1, P.n3);
      });
      for (const [x, y] of [[2, 2], [45, 2], [2, 13], [45, 13]]) b.set(x, y, P.gd2);                // brass tacks
      K.outer(b, S.omap([], 'o6'));
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

  // Two posters, each with a title band and one big chibi Kigu (a girl in her costume's hood): teal with Konko, sunny yellow with Sprubun.
  // Taped at the corners.
  const SKIN = col('#ffdcc4');
  function chibi(b, cx, cy, r, ear) {
    if (ear === 'tri') { b.polygon([[cx - 4, cy - 3], [cx - 4, cy - 7], [cx - 1, cy - 5]], r[2]); b.polygon([[cx + 4, cy - 3], [cx + 4, cy - 7], [cx + 1, cy - 5]], r[3]); b.set(cx - 3, cy - 5, P.pk1); }
    if (ear === 'long') { b.fillRect(cx - 3, cy - 9, 2, 6, r[1]); b.fillRect(cx + 2, cy - 9, 2, 6, r[2]); b.vline(cx - 2, cy - 8, 4, P.pk1); }
    b.circle(cx, cy - 2, 3.5, r[2], true); b.set(cx - 2, cy - 5, r[1]); b.set(cx - 3, cy - 4, r[1]); b.set(cx - 1, cy - 5, r[1]);   // hood
    b.fillRect(cx - 2, cy - 2, 5, 3, SKIN); b.set(cx - 1, cy - 1, P.ink); b.set(cx + 1, cy - 1, P.ink); b.set(cx - 2, cy, P.pk1); b.set(cx + 2, cy, P.pk1);
    b.fillRect(cx - 3, cy + 1, 7, 4, r[2]); b.hline(cx - 3, cy + 1, 7, r[1]); b.vline(cx + 3, cy + 2, 3, r[3]); b.fillRect(cx - 1, cy + 2, 3, 2, P.p0);
  }
  K.stamp('kigu_poster', {
    w: 2, h: 1,
    paint: () => {
      const b = K.B(32, 16);
      const tl = K.ramp('teal'), yl = K.ramp('yellow'), or = K.ramp('orange'), mt = K.ramp('mint');
      // two posters, each with a title band along the top and one big chibi Kigu: a girl in her costume's hood
      b.fillRect(1, 1, 14, 14, tl[1]); b.hline(1, 1, 14, tl[0]); b.fillRect(1, 1, 14, 3, tl[4]); for (const x of [3, 5, 6, 8, 10, 11]) b.set(x, 2, P.p0);
      chibi(b, 8, 10, or, 'tri');
      b.fillRect(17, 1, 14, 14, yl[1]); b.hline(17, 1, 14, yl[0]); b.fillRect(17, 1, 14, 3, or[3]); for (const x of [19, 20, 22, 24, 25, 27]) b.set(x, 2, P.p0);
      chibi(b, 24, 10, mt, 'long');
      for (const [x, y] of [[20, 6], [28, 7], [19, 12]]) b.set(x, y, P.white);                      // sparkles
      K.outer(b, S.omap([], 'o5'));
      for (const x0 of [0, 16]) for (const [x, y] of [[x0 + 1, 1], [x0 + 14, 1], [x0 + 1, 14], [x0 + 14, 14]]) { b.set(x, y, P.p0); b.set(x + (x > x0 + 7 ? 1 : -1), y, P.p2); }   // tape at each corner
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
      // the bedroom's wicker basket with clothes heaped in it: a yellow towel, a red t-shirt whose sleeve hangs over the rim,
      // and a pink sock dangling down the side
      b.fillRect(2, 8, 12, 6, P.o2); b.hline(2, 13, 12, P.o4); b.vline(13, 9, 4, P.o3);
      for (let y = 10; y < 13; y++) for (let x = 2 + (y & 1); x < 13; x += 2) b.set(x, y, P.o3);
      b.fillRect(1, 8, 14, 2, P.o1); b.hline(1, 9, 14, P.o3); b.hline(2, 8, 12, P.o0);              // rolled rim
      K.stick(b, 3, 3, [
        '...rrrr...',
        'yyrRrrrrd.',
        'yYyrrrrrd.',
        'yyyyyrrd..',
        'ddddd.....',
      ], { y: P.yl1, Y: P.yl0, d: P.yl3, r: P.red1, R: P.p0 });
      b.set(10, 6, P.red2); b.set(11, 5, P.red2); b.set(9, 7, P.red2);
      K.stick(b, 2, 7, ['rr', 'rR', 'rR', '.r'], { r: P.red1, R: P.red2 });                         // the sleeve over the rim
      K.stick(b, 12, 6, ['pp.', '.pP', '.pP', '.pP', '.qq'], { p: P.pk1, P: P.pk2, q: P.pk2 });    // the sock
      K.outer(b, S.omap([[WOOD, P.o6]], 'o6'));
      K.shadow(b, 8, 14, 6, 1);
      return b;
    },
  });

  // An orange beanbag (2x2): slumped and wider than tall, a dented seat, curved seams, a flat base

  K.stamp('beanbag', {
    w: 2, h: 2,
    paint: () => {
      const b = K.B(32, 32);
      const hi = col('#f6b67a'), mid = col('#f48c40'), dk = col('#c8642c'), sh = col('#a84c24');
      // one slumped teardrop: narrow rounded top, wide soft base, lit from the top left
      for (let y = 5; y <= 27; y++) {
        const t = (y - 5) / 22;
        const hw = Math.min(13.5 * Math.sqrt(Math.max(0, 1 - ((y - 19.5) / 8.6) ** 2)) * 1, 4 + 11 * Math.sqrt(t));
        for (let x = 0; x < 32; x++) {
          const dx = x + 0.5 - 16;
          if (Math.abs(dx) > hw) continue;
          const l = dx / 14 + (y - 16) / 13;
          b.set(x, y, l < -0.5 ? hi : l < 0.55 ? mid : dk);
        }
      }
      // the sitting dent: a darker oval in the upper middle with a lit lower lip
      for (let y = 9; y <= 17; y++) for (let x = 10; x <= 23; x++) {
        const d = ((x + 0.5 - 16.5) / 5.5) ** 2 + ((y + 0.5 - 13) / 3.4) ** 2;
        if (d <= 1) b.set(x, y, d < 0.55 ? sh : dk);
        else if (d <= 1.35 && y > 13) b.set(x, y, hi);
      }
      // one light crease from the top left towards the centre
      for (const [x, y] of [[9, 12], [10, 13], [11, 14], [12, 15], [13, 16], [14, 17]]) b.set(x, y, hi);
      for (const [x, y] of [[10, 14], [12, 16]]) b.set(x, y, dk);
      b.hline(8, 27, 17, sh);
      K.outer(b, K.ramp('orange')[5]);
      K.shadow(b, 16, 28, 12, 1, 56);
      return b;
    },
  });

  // A section of wall shelving; what's on it follows story and side flags (empty, a plush, a framed card, a trophy)
  K.stamp('trophy_shelf', {
    w: 1, h: 1, variants: ['empty', 'plush', 'card', 'trophy'],
    paint: (v) => {
      const b = K.B(16, 16);
      // the same cubby for every variant: posts, a top board, a mid-brown back wall lit along its top-left, a lit shelf lip
      b.fillRect(1, 1, 14, 14, P.o4);
      b.fillRect(3, 3, 10, 9, P.o4); b.hline(3, 3, 10, P.o3); b.vline(3, 3, 9, P.o3);
      b.fillRect(1, 1, 2, 12, P.o2); b.vline(1, 1, 12, P.o1); b.fillRect(13, 1, 2, 12, P.o3); b.vline(14, 1, 12, P.o4);
      b.fillRect(1, 1, 14, 2, P.o2); b.hline(1, 1, 14, P.o1);
      b.hline(3, 11, 10, P.o5);                                                                     // contact shadow on the shelf
      b.hline(1, 12, 14, P.o0); b.fillRect(1, 13, 14, 2, P.o2); b.hline(1, 14, 14, P.o4);          // shelf lip
      if (v === 'plush') {
        K.stick(b, 3, 3, [
          '.e......e.',
          '.eppppppe.',
          'ppPpppppqp',
          'ppPkppkpqp',
          'pppppppppq',
          '.pppmmppq.',
          '..pppppq..',
          '.pppppppq.',
          '.qq.qq.qq.',
        ], { e: P.pk3, p: P.pk1, P: P.pk0, q: P.pk2, k: P.ink, m: P.pk3 });
      } else if (v === 'card') {
        K.stick(b, 4, 3, [
          'gggggggg',
          'gssssssg',
          'gssyssgG',
          'gsssssGG'.replace(/G/g, 's'),
          'ghhhhhhg',
          'gffffffg',
          'gppppppg',
          'gppppppg',
          'gggggggg',
        ], { g: P.gd3, G: P.gd3, s: P.bl1, y: P.yl2, h: P.f2, f: P.f3, p: P.p0 });
      } else if (v === 'trophy') {
        K.stick(b, 3, 3, [
          '.gGgggggd.',
          'dgGggggggd',
          'd.gGggggd.d'.slice(0, 10),
          '.d.gggggd.',
          '...dgggd..',
          '....ggd...',
          '....gd....',
          '..wwwwww..',
          '..ooooOO..',
        ], { g: P.gd2, G: P.gd0, d: P.gd3, w: P.o1, o: P.o3, O: P.o5 });
      }
      K.outer(b, S.omap([[WOOD, P.o6]], 'o6'));
      return b;
    },
  });

  // Double bed, headboard and pillows at the SOUTH end (2x3). sleeping: just the sheet (the blanket is bed_blanket, drawn over the
  // sleeper); unmade: the patchwork blanket thrown back towards the foot; made: blanket pulled up neat. made and bed_blanket share
  // madeQuilt(), so the quilt is in exactly the same place when one swaps for the other.
  const QUILT = [[P.pk1, P.pk2], [P.yl1, P.yl2], [K.ramp('sky')[1], K.ramp('sky')[2]], [K.ramp('mint')[1], K.ramp('mint')[2]]];
  /** pastel patchwork quilt, x 3..27, from y 5: a cream binding, then `rows` rows of whole 5x6 patches (pink, butter, sky, mint repeating
   *  on a diagonal) with cream seams. Each fabric has two tones: the second shades the lower-right of each patch and, with `lump`,
   *  the right side of the sleeper's body under it (and its soft shadow). */
  function quilt(b, rows, lump) {
    const x0 = 3, y0 = 5, w = 25, h = 1 + rows * 7;
    const bx = 14, by = 15, body = (x, y) => ((x - bx) / 6.5) ** 2 + ((y - by) / 10) ** 2;
    b.fillRect(x0, y0, w, h, P.p1);
    for (let y = y0 + 1; y < y0 + h; y++) for (let x = x0 + 1; x < x0 + w - 1; x++) {
      const lx = x - x0 - 1, ly = y - y0 - 1;
      const q = QUILT[(((lx / 6) | 0) + ((ly / 7) | 0)) % QUILT.length];
      let dark = lx >= w - 4 || ly >= h - 2;                                                        // the quilt rolls away along its right and lower edges
      if (lump) { const d = body(x + 0.5, y + 0.5); if (d <= 1) dark = x > bx + 1; else if (d <= 1.55 && x > bx) dark = true; }
      b.set(x, y, dark ? q[1] : q[0]);
    }
  }
  /** the made-up quilt and the white sheet folded back over its pillow (south) edge, rows 5..29 */
  function sheetFold(b) { b.fillRect(2, 26, 27, 4, P.p0); b.hline(2, 28, 27, P.p1); b.hline(2, 29, 27, P.p2); b.set(2, 26, P.p1); }
  function madeQuilt(b, lump) { quilt(b, 3, lump); sheetFold(b); }
  K.stamp('bed_double', {
    w: 2, h: 3, variants: ['sleeping', 'unmade', 'made'],
    paint: (v) => {
      const b = K.B(32, 48);
      b.fillRect(1, 1, 30, 46, P.o3); b.hline(1, 1, 30, P.o1);                                      // frame
      b.fillRect(1, 1, 30, 3, P.o2); b.hline(1, 3, 30, P.o4);                                       // a low foot rail (north)
      // the mattress: a lit top-left edge, darker right edge
      b.fillRect(3, 4, 26, 33, P.p1); b.hline(3, 4, 26, P.p0); b.vline(3, 4, 33, P.p0); b.vline(28, 5, 32, P.p2); b.hline(3, 36, 26, P.p3);
      if (v === 'sleeping') {
        // the sheet turned down at the pillow end, with a few soft folds in it
        for (const [x0, y0, x1, y1] of [[7, 9, 11, 15], [20, 7, 23, 13], [12, 18, 18, 22]]) b.line(x0, y0, x1, y1, P.p2);
        sheetFold(b);
      }
      if (v === 'unmade') { quilt(b, 1, false); b.fillRect(3, 13, 25, 2, P.p0); b.hline(3, 15, 25, P.p3); }   // thrown back: a lit fold on a shadow line
      if (v === 'made') madeQuilt(b);
      b.hline(3, 30, 26, P.p3);                                                                     // the sheet's shadow at the pillows
      // pillows: rounded, a diagonal crease, the lower edge shaded in two tones, a shadow round them on the mattress
      for (const x of [5, 17]) K.stick(b, x, 31, [
        '.eeeeeeee.',
        'ewwwwwwwwf',
        'ewwwwwcwwf',
        'ewwwwwwcwf',
        'fppppppppf',
        '.nnnnnnnn.',
      ], { w: P.p0, c: P.p2, p: P.p1, n: P.n1, e: P.p2, f: P.p3 });
      // the headboard (south): tall with a rounded top and two panels
      K.stick(b, 1, 37, [
        '...oooooooooooooooooooooooo...',
        '.ooaaaaaaaaaaaaaaaaaaaaaaaaoo.',
      ], { o: P.o0, a: P.o1 });
      b.fillRect(1, 39, 30, 7, P.o2); b.hline(1, 46, 30, P.o4);
      for (const x of [4, 17]) { b.strokeRect(x, 40, 11, 5, P.o3); b.hline(x + 1, 41, 9, P.o1); }
      for (const [x, y] of [[1, 37], [2, 37], [3, 37], [1, 38], [30, 37], [29, 37], [28, 37], [30, 38]]) b.set(x, y, 0);
      K.outer(b, S.omap([[WOOD, P.o6], [[P.p0, P.p1, P.p2, P.p3, P.n1], P.p5]], 'o6'));
      return b;
    },
  });

  // The patchwork blanket with a body-shaped lump, drawn ABOVE actors (over: 2) so the sleeping hero looks tucked in. goneIf woke.
  K.stamp('bed_blanket', {
    w: 2, h: 2, over: 2, solid: ['..', '..'],
    paint: () => {
      const b = K.B(32, 32);
      madeQuilt(b, true);
      K.outer(b, 'o6');
      b.hline(3, 30, 25, P.p3);                                                                     // its soft shadow on the pillows' edge
      return b;
    },
  });

  // A painted wooden toy chest whose lid won't quite close (a plush paw pokes out)
  K.stamp('toy_chest', {
    w: 1, h: 1,
    paint: () => {
      const b = K.B(16, 16);
      const s = K.ramp('sky');
      // a sky-blue painted chest lit from the top left: a lighter lid top, a lid seam with a brass latch, a star on the front,
      // and a pink plush paw poking out of the gap
      K.stick(b, 1, 3, [
        '00000000000001',
        '01111111111112',
        '11111111111112',
        '22222222222223',
        'kkkpPkkkgkkkkk',
        '0111111d111123',
        '0111111y111123',
        '011111yyy11123',
        '01111yyyyyy123',
        '011111yyyy1123',
        '011111y11y1123',
        '33333333333334',
      ], { 0: s[0], 1: s[1], 2: s[2], 3: s[3], 4: s[4], k: P.o6, p: P.pk1, P: P.pk2, g: P.gd2, d: P.gd3, y: P.yl2 });
      K.outer(b, s[5]);
      K.shadow(b, 8, 15, 7, 1);
      return b;
    },
  });

  // Small bedside table: lamp (it glows at night through def.nightGlow) or alarm (a round twin-bell alarm clock)
  K.stamp('nightstand', {
    w: 1, h: 1, variants: ['lamp', 'alarm'],
    paint: (v) => {
      const b = K.B(16, 16);
      // 12px wide: a lit top surface, one drawer with a brass knob
      b.fillRect(2, 6, 12, 2, P.o1); b.hline(2, 6, 12, P.o0);
      b.fillRect(2, 8, 12, 6, P.o3); b.vline(2, 8, 6, P.o2); b.vline(13, 8, 6, P.o4); b.hline(2, 13, 12, P.o4);
      b.strokeRect(4, 9, 8, 3, P.o4); b.hline(5, 9, 6, P.o2); b.set(7, 10, P.gd2); b.set(8, 10, P.gd3);
      if (v === 'lamp') {
        b.fillRect(6, 6, 4, 1, P.o5); b.hline(6, 7, 4, P.o3);                                       // base on the top, its shadow
        b.fillRect(7, 3, 2, 3, P.o4); b.set(7, 3, P.o3);
        K.stick(b, 4, 0, ['.wwwwww.', 'wwwwwwyy', 'yyyyyyyy'], { w: P.yl0, y: P.yl1 });
        b.set(5, 0, P.p0);
      } else {
        K.stick(b, 4, 0, [
          '.g...g..',
          '.rrrrr..',
          'rrwwwrr.',
          'rwwkwwr.'.replace('.', 'R'),
          'rwwkkwr.',
          'rrwwwrR.',
          '.rr.rR..',
        ].map((r) => r.replace('R', 'q')), { g: P.gd2, r: P.red2, q: P.red3, w: P.p0, k: P.ink2 });
        b.hline(5, 7, 6, P.o3);
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
        b.fillRect(8, 7, 6, 6, P.bl2); b.vline(10, 8, 5, P.bl3); b.hline(8, 7, 6, P.bl1); b.vline(13, 8, 5, P.bl3);   // jeans, a fold down the leg
        b.fillRect(3, 4, 6, 7, P.red1); b.fillRect(1, 4, 2, 3, P.red1); b.fillRect(9, 4, 2, 3, P.red1);        // a t-shirt: body and two sleeves
        b.hline(1, 4, 10, P.red0); b.set(5, 4, P.red2); b.set(6, 4, P.red2); b.vline(8, 6, 5, P.red2); b.hline(3, 10, 6, P.red2);   // neckline, fold, hem
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
        b.circle(5, 8, 3, P.yl1, true); b.fillRect(2, 4, 2, 2, P.yl2); b.fillRect(7, 4, 2, 2, P.yl2); b.set(4, 6, P.yl0);   // a yellow plush with round ears
        b.set(4, 8, P.ink); b.set(6, 8, P.ink); b.set(5, 9, P.pk2);
        b.circle(11, 10, 3, P.b1, true); b.set(8, 8, P.b2); b.set(14, 8, P.b2); b.fillRect(9, 5, 5, 2, P.p0); b.hline(9, 7, 5, P.p2);   // homemade Nibblenna: ears, chef hat
        b.set(10, 10, P.ink); b.set(12, 10, P.ink); b.set(11, 11, P.pk2);
        b.set(13, 12, P.pk2); b.set(12, 12, P.p0);                                                  // a wonky stitched seam
      } else if (v === 'comic') {      // an open comic, face down
        b.fillRect(2, 6, 6, 6, P.red1); b.fillRect(8, 6, 6, 6, P.red2); b.vline(8, 6, 6, P.red3); b.hline(2, 6, 12, P.red0);
        b.fillRect(9, 8, 3, 2, P.yl1); b.set(4, 9, P.p0);
      } else if (v === 'sneakers') {   // sneakers, one on its side
        b.fillRect(2, 5, 4, 7, P.p0); b.hline(2, 11, 4, P.bl2); b.set(3, 6, P.red2); b.set(4, 7, P.red2);
        b.fillRect(8, 9, 7, 3, P.p0); b.hline(8, 12, 7, P.bl2); b.set(10, 9, P.red2); b.set(9, 10, P.ink2);
      } else if (v === 'pebbles') {
        for (const [x, y] of [[3, 5], [10, 8], [5, 11], [12, 3]]) { b.fillRect(x, y, 2, 2, P.c2); b.set(x, y, P.c0); b.set(x + 1, y + 1, P.c4); b.hline(x, y + 2, 2, P.d4); }   // stones, each with its shadow
        outline = null;
      } else if (v === 'petals') {
        for (const [x, y, d] of [[3, 4, 0], [9, 6, 1], [5, 10, 1], [12, 11, 0], [11, 2, 1]]) { b.set(x, y, P.pk1); b.set(x + 1, y + d, P.pk1); b.set(x + 1, y + 1 - d, P.pk3); b.set(x + 2, y + d, P.pk3); }   // petals in two pinks
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
