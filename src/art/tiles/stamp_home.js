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
    w: 1, h: 1,
    // content x ends: '' = a middle piece (no side outline, tiles seamlessly), _l / _r = the run's west / east end, _lr = a single counter
    variants: ['plain', 'cakes', 'crumbs'].flatMap((c) => [c, c + '_l', c + '_r', c + '_lr']),
    paint: (v) => {
      const b = K.B(16, 16);
      const [what, ends] = v.split('_');
      // tiled backsplash along the wall
      b.fillRect(0, 0, 16, 2, P.c0); for (const x of [3, 7, 11, 15]) b.vline(x, 0, 2, P.c2); b.hline(0, 1, 16, P.c2);
      b.hline(0, 2, 16, P.o6);                                                                      // the slab's back edge, inked
      b.fillRect(0, 3, 16, 5, P.c1); b.hline(0, 3, 16, P.c2);                                       // stone worktop, its back in shade
      b.set(4, 5, P.c2); b.set(12, 4, P.c2);
      b.hline(0, 7, 16, P.c0);                                                                      // the lit front edge of the slab
      b.hline(0, 8, 16, P.c2);                                                                      // the slab's front face
      b.hline(0, 9, 16, P.o6);                                                                      // dark lip where it meets the cabinet
      // cabinet: lit left column, shaded right column and bottom row, a recessed door with a brass pull
      b.fillRect(0, 10, 16, 5, P.o3); b.vline(0, 10, 5, P.o2); b.vline(15, 10, 5, P.o4); b.hline(0, 14, 16, P.o4); b.hline(0, 10, 16, P.o4);
      b.strokeRect(2, 11, 12, 3, P.o4); b.hline(3, 11, 10, P.o2); b.fillRect(7, 12, 2, 1, P.gd2);
      b.hline(0, 15, 16, P.o6);
      if (ends && ends.includes('l')) b.vline(0, 2, 14, P.o6);
      if (ends && ends.includes('r')) b.vline(15, 2, 14, P.o6);
      if (what === 'plain') {
        // a red kettle with a dark outline, its spout to the right, a white glint and a contact shadow on the stone
        b.hline(4, 7, 8, P.c3);
        K.stick(b, 3, 0, [
          '..kkk.....',
          '.k...k....',
          '.kwlllk...',
          'kwlrrrdk.k',
          'klrrrrdkk.',
          'krrrrrrdk.',
          '.kkkkkkk..',
        ], { k: P.red4, l: P.red1, w: P.white, r: P.red2, d: P.red3 });
      } else if (what === 'cakes') {
        // a glass cake dome on a stand: pale glass, a white glint top-left, two iced cakes inside
        b.hline(3, 7, 11, P.c3);                                                                    // its shadow on the stone
        b.hline(2, 6, 11, P.n3); b.hline(3, 5, 9, P.white);                                         // the stand
        for (let y = 0; y <= 5; y++) for (let x = 2; x <= 12; x++) {
          const d = ((x - 7) / 5.5) ** 2 + ((y - 5) / 5.2) ** 2;
          if (d <= 1 && y < 5) b.set(x, y, d > 0.7 ? P.n3 : P.gl1);
        }
        for (const [x, y] of [[4, 1], [3, 2], [3, 3]]) b.set(x, y, P.white);                        // the glint
        b.set(7, 0, P.n3);                                                                          // the knob
        for (const x of [4, 8]) {
          b.fillRect(x, 2, 3, 1, P.pk1); b.set(x, 2, P.white);                                      // icing
          b.fillRect(x, 3, 3, 2, P.o1); b.set(x + 2, 3, P.o2); b.set(x + 2, 4, P.o2);               // sponge, shaded right
          b.set(x + 1, 1, P.red2);                                                                  // cherry
        }
      } else {
        // Mom has given the cakes away: one plate left with a dab of icing, and a cluster of crumbs
        b.hline(3, 7, 8, P.c3);
        for (let y = 3; y <= 6; y++) for (let x = 2; x <= 10; x++) {
          const d = ((x - 6) / 4.2) ** 2 + ((y - 4.5) / 2) ** 2;
          if (d <= 1) b.set(x, y, d > 0.55 ? P.n3 : P.white);
        }
        b.set(4, 4, P.c0); b.set(6, 4, P.pk1); b.set(7, 4, P.o2);
        for (const [x, y, c] of [[12, 4, P.o1], [13, 4, P.o2], [12, 5, P.o2], [13, 5, P.o3], [14, 6, P.o2]]) b.set(x, y, c);
        b.set(12, 6, P.c3); b.set(13, 6, P.c3); b.set(14, 7, P.c3);                                 // the crumbs' shadow
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

  // Nibblenna's round padded bed (1x1). She stands in it all day, and her 32 px sprite covers most of the tile, so the bed is drawn
  // in two layers: pet_bed (floor layer, under everything) is the whole bed, and pet_bed_front (walk-over, drawn over actors) is
  // only the bed's front lip, the same pixels again. Placed on the same tile, the lip sits in front of her feet, so she reads as
  // standing in her bed with its blue rim showing round her sides and in front; with nobody in it the two layers add up to the bed.
  //  The bed: a plump oval rim of blue fabric (3 tones lit from the top left, a pale piping line along its top), a red cushion in the
  //  hollow with a chew bone on it, and a cream blanket corner folded over the south-east rim.
  function petBed(front) {
    const b = K.B(16, 16), cx = 8, cy = 10, BL = [P.bl0, P.bl1, P.bl2, P.bl3];
    const outer = (x, y) => ((x + 0.5 - cx) / 6.9) ** 2 + ((y + 0.5 - cy) / 5.1) ** 2;
    const inner = (x, y) => ((x + 0.5 - cx) / 4.4) ** 2 + ((y + 0.5 - cy + 0.6) / 2.8) ** 2;
    for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) {
      const o = outer(x, y); if (o > 1) continue;
      const i = inner(x, y);
      if (i <= 1) {                                                                                 // the cushion in the hollow
        const back = y + 0.5 < cy - 0.6 - 1.3;                                                        // the back rim's inner wall throws a shadow
        b.set(x, y, back ? P.red3 : (x + 0.5 - cx) + (y + 0.5 - cy) > 2.5 ? P.red2 : P.red1);
        continue;
      }
      const dx = (x + 0.5 - cx) / 6.9, dy = (y + 0.5 - cy) / 5.1, l = -(dx * 0.8 + dy) / Math.sqrt(dx * dx + dy * dy + 0.001);
      const inside = i < 1.6 && y + 0.5 < cy;                                                       // the back rim's inner face, in shade
      b.set(x, y, inside ? BL[2] : l > 0.5 ? BL[1] : l > -0.45 ? BL[2] : BL[3]);
    }
    // the piping along the top of the rim (lit side) and the cushion's soft highlight
    for (let x = 3; x <= 7; x++) b.set(x, x <= 4 ? 6 : 5, P.bl0);
    b.set(2, 7, P.bl0); b.set(6, 9, P.red0); b.set(7, 9, P.red0);
    // a chew bone on the cushion
    K.stick(b, 8, 9, ['w...w', '.www.', 'w...w'], { w: P.p0 });
    // a cream blanket corner folded over the south-east rim
    K.stick(b, 11, 11, ['CCc', 'Ccc', 'c..'], { C: P.p1, c: P.p3 });
    if (front) {                                                                                    // keep only the front lip (and its blanket corner)
      for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) if (y < 12 || inner(x, y) <= 1) b.set(x, y, 0);
    }
    K.outer(b, S.omap([[[P.bl0, P.bl1, P.bl2, P.bl3], P.bl4], [[P.red0, P.red1, P.red2, P.red3], P.red4], [[P.p0, P.p1, P.p3], P.p5]], 'bl4'));
    if (front) for (let x = 0; x < 16; x++) if (b.u32[11 * 16 + x] >>> 24) b.set(x, 11, 0);           // no outline along the cut
    if (!front) K.shadow(b, 8, 15, 7, 1);
    return b;
  }
  K.stamp('pet_bed', { w: 1, h: 1, layer: 'floor', solid: ['.'], paint: () => petBed(false) });
  K.stamp('pet_bed_front', { w: 1, h: 1, over: 1, solid: ['.'], paint: () => petBed(true) });

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
      const glass = (x, y, w, h) => {
        b.fillRect(x, y, w, h, P.gl2); b.vline(x, y, h, P.gl1); b.hline(x, y, w, P.gl1);
        b.vline(x + w - 1, y + 1, h - 1, P.gl3); b.set(x + 1, y + 1, P.gl0); b.set(x + 2, y + 2, P.gl0);
      };
      if (v === 'w' || v === 'e') {
        // seen from inside the room against the west wall: a 1 px wood frame round a 6 px pane (lighter in its top-left corner, a
        // 1 px diagonal glint, a muntin across the middle), a curtain gathered at the room-side edge and a lit sill pixel row
        b.fillRect(3, 0, 10, 16, P.o3); b.vline(3, 0, 16, P.o5); b.vline(4, 0, 16, P.o1);              // frame (dark against the wall)
        b.fillRect(5, 1, 6, 14, P.gl3);
        for (let y = 1; y < 15; y++) for (let x = 5; x < 11; x++) if ((x - 5) + (y - 1) < 6) b.set(x, y, P.gl2);
        b.set(5, 1, P.gl1); b.set(6, 1, P.gl1); b.set(5, 2, P.gl1);
        for (let i = 0; i < 4; i++) b.set(9 - i, 4 + i, P.gl0);                                        // the glint
        b.set(9, 10, P.gl1); b.set(8, 11, P.gl1);
        b.hline(5, 7, 6, P.o3); b.hline(5, 8, 6, P.o4);                                               // muntin
        b.vline(10, 1, 14, P.gl4);                                                                    // pane shaded at the curtain
        // the curtain: pink, gathered in two folds, hanging down the room side
        for (let y = 0; y < 16; y++) { b.set(11, y, P.pk1); b.set(12, y, (y & 3) === 1 ? P.pk3 : P.pk2); }
        b.set(11, 0, P.pk0); b.set(11, 1, P.pk0); b.set(12, 8, P.pk3); b.set(11, 9, P.pk0);
        b.fillRect(13, 0, 2, 16, P.p2); b.vline(13, 0, 16, P.p0); b.vline(14, 0, 16, P.p3);           // the sill on the room side
        b.vline(15, 0, 16, P.o6);
        if (v === 'e') b = b.flippedX();
        return b;
      }
      // bottom-wall window: a dark frame line top and bottom separates it from the planks
      b.fillRect(0, 0, 16, 10, P.o6);
      b.fillRect(1, 1, 14, 6, P.p0);
      glass(2, 2, 6, 4); glass(9, 2, 5, 4);
      b.fillRect(0, 7, 16, 2, P.p2); b.hline(0, 7, 16, P.p1); b.hline(0, 8, 16, P.p3);           // sill on the room (north) side
      if (v === 's_tincan') {
        // a tin can on the sill (3x4, lit left, a rim and a highlight) with its string running out through the frame to the east
        K.stick(b, 9, 4, ['nNn', 'hmd', 'hmd', 'mmd'], { n: P.n3, N: P.n4, h: P.n0, m: P.n2, d: P.n4 });
        b.line(10, 3, 12, 1, P.red2); b.hline(13, 1, 3, P.red2); b.set(15, 0, P.red2);
        b.set(10, 4, P.red3);
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
      b.ellipse(7.5, 7, 6.5, 3, P.o4, true);                                                         // the rim's thickness, in shade
      b.ellipse(7.5, 6, 6.5, 3, P.o2, true);                                                         // the round top
      b.ellipse(7, 5.6, 5.4, 2.2, P.o1, true);
      for (const [x, y] of [[3, 4], [4, 4], [5, 3], [6, 3], [7, 3], [2, 5], [2, 6]]) b.set(x, y, P.o0);   // lit NW rim
      for (const [x, y] of [[13, 7], [12, 8], [11, 8], [10, 9], [9, 9], [14, 6]]) b.set(x, y, P.o3);    // dark SE rim
      // a small photo frame with a dark outline: a red-and-yellow kite in a blue sky over green grass
      b.vline(11, 3, 5, P.o3);
      K.stick(b, 5, 0, [
        'kkkkkkk',
        'kssRsak',
        'ksRRYak',
        'kRRRYYk',
        'ksRRYak',
        'kssYsak',
        'kggggak',
        'kkkkkkk',
      ], { k: P.o6, s: P.sk1, a: P.sk2, R: P.red2, Y: P.yl2, g: P.g2 });
      b.hline(6, 8, 6, P.o3);                                                                        // its shadow on the top
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

  // Four-seat sofa seen from behind, facing north at the TV. Rows from the top: the seat cushions beyond the back (a thin strip), the
  // backrest's lit top roll, then its tall south face (9 px) split into four tufted back cushions by dark seams; arm rolls at both ends
  // stand 2 px above the back. A mustard throw is draped over the back edge and hangs down the south face.
  const SOFA_TOP = 3, SOFA_FACE = 6, SOFA_BASE = 13;      // shared with the armchair so both backs stand the same height
  K.stamp('sofa', {
    w: 4, h: 1,
    paint: () => {
      const b = K.B(64, 16);
      const r = K.ramp('teal');
      // seat cushions beyond the backrest: just their lit tops show, four of them with dark seams
      b.fillRect(7, 1, 50, 2, r[2]); b.hline(7, 1, 50, r[1]);
      for (const x of [19, 32, 44]) b.vline(x, 1, 2, r[4]);
      // the backrest: a rounded top roll (one lit line on top, mid body, a shadow line under it)
      b.fillRect(2, SOFA_TOP, 60, 3, r[2]); b.hline(3, SOFA_TOP, 58, r[1]); b.hline(3, SOFA_TOP + 2, 58, r[3]);
      // the tall south face: four tufted cushions, each lit down its left edge and shaded on its right, a dark seam between them
      b.fillRect(2, SOFA_FACE, 60, SOFA_BASE - SOFA_FACE, r[3]);
      for (let i = 0; i < 4; i++) {
        const x0 = 7 + i * 13, x1 = x0 + 11;
        b.vline(x0, SOFA_FACE, 6, r[2]); b.vline(x1, SOFA_FACE + 1, 6, r[4]);
        b.set(x0 + 5, SOFA_FACE + 3, r[4]); b.set(x0 + 6, SOFA_FACE + 3, r[2]);                     // a button tuft
        if (i < 3) b.vline(x1 + 1, SOFA_FACE, SOFA_BASE - SOFA_FACE, r[5]);                          // seam between cushions
      }
      b.hline(2, SOFA_BASE - 1, 60, r[4]);                                                            // shaded bottom row
      // arm rolls: 6 px wide, their rounded tops 2 px above the back roll, lit top-left, shaded down the east side
      for (const x of [1, 57]) {
        b.fillRect(x, SOFA_TOP - 2, 6, SOFA_BASE - SOFA_TOP + 2, r[3]);
        b.fillRect(x, SOFA_TOP - 2, 6, 3, r[2]); b.hline(x + 1, SOFA_TOP - 2, 4, r[1]); b.set(x, SOFA_TOP - 1, r[1]);
        b.hline(x, SOFA_TOP + 1, 6, r[4]);                                                            // under the roll
        b.vline(x, SOFA_TOP + 2, SOFA_BASE - SOFA_TOP - 3, r[2]); b.vline(x + 5, SOFA_TOP - 1, SOFA_BASE - SOFA_TOP, r[4]);
        b.set(x, SOFA_TOP - 2, 0); b.set(x + 5, SOFA_TOP - 2, 0);                                     // rounded corners
      }
      // the knitted throw over the back, left of the east arm: it lies over the top roll and falls down the face to a cream fringe,
      // its hem cut on a slant; a knit texture in two mustard tones, a shadow down its right edge
      const tx0 = 40, tx1 = 51;
      for (let y = SOFA_TOP; y <= SOFA_BASE; y++) for (let x = tx0; x <= tx1; x++) {
        const hem = SOFA_BASE - 1 - ((x - tx0) >> 2);
        if (y > hem) continue;
        let c = ((x + (y >> 1)) & 3) < 2 ? P.yl2 : P.yl1;
        if (y === SOFA_TOP) c = P.yl1;
        if (y === SOFA_TOP + 2) c = P.yl3;                                                            // the fold over the roll's edge
        if (x === tx1) c = P.yl3;
        b.set(x, y, c);
      }
      for (let x = tx0; x <= tx1; x += 2) b.set(x, SOFA_BASE - ((x - tx0) >> 2), P.p0);                // fringe
      for (const x of [3, 59]) b.fillRect(x, SOFA_BASE, 2, 2, P.o5);                                  // short dark feet
      for (const x of [22, 41]) b.fillRect(x, SOFA_BASE, 2, 1, P.o5);
      K.outer(b, S.omap([[r, r[5]], [[P.yl1, P.yl2, P.yl3, P.p0], P.yl4]], 'ink'));
      K.shadowRect(b, 2, 15, 60, 1);
      return b;
    },
  });

  // Mom's wicker sewing basket, lid ajar: spools and a pincushion poking out
  K.stamp('sewing_basket', {
    w: 1, h: 1,
    paint: () => {
      const b = K.B(16, 16);
      // a wicker basket in 3 tones: a light rolled rim, a mid weave, a dark base row
      b.fillRect(2, 9, 12, 5, P.o2);
      for (let y = 10; y < 13; y++) for (let x = 2 + (y & 1); x < 14; x += 2) b.set(x, y, P.o3);
      b.hline(2, 13, 12, P.o4); b.vline(13, 10, 3, P.o4);
      // a spool of blue thread peeking out at the back left
      b.fillRect(3, 5, 3, 3, P.bl2); b.vline(3, 5, 3, P.bl1); b.hline(2, 4, 5, P.o1); b.hline(2, 8, 5, P.o3);
      // a round red yarn ball: 2 tones, a highlight and a wrap line across it
      K.stick(b, 6, 3, [
        '.hrrr.',
        'hrrrrd',
        'wrrrdd',
        'rwwrdd',
        'rrrwwd',
        '.rddd.',
      ], { h: P.red0, r: P.red1, d: P.red2, w: P.red3 });
      b.fillRect(1, 8, 14, 2, P.o1); b.hline(2, 8, 12, P.o0); b.hline(1, 9, 14, P.o2);             // the rim band
      K.outer(b, S.omap([[WOOD, P.o6], [[P.red0, P.red1, P.red2, P.red3], P.o6], [[P.bl1, P.bl2], P.o6]], 'o6'));
      // two knitting needles poking up out of the yarn at an angle
      b.line(10, 5, 14, 1, P.n1); b.set(14, 1, P.n3); b.line(9, 4, 11, 0, P.n1); b.set(11, 0, P.n3);
      K.shadow(b, 8, 15, 7, 1);
      return b;
    },
  });

  // Mom's cosy floral armchair with a lace doily: a tall back along the north, two raised arms with rounded fronts, a lower seat cushion

  // back: the same chair seen from behind, facing north (like the sofa beside it): the seat cushion beyond the backrest, the tall
  // back face with a lace doily hanging over its top, the arm rolls standing up either side
  K.stamp('armchair', {
    w: 1, h: 1, variants: ['default', 'back'],
    paint: (v) => {
      const b = K.B(16, 16);
      const r = tn('pink');
      if (v === 'back') {
        // the same build and the same heights as the sofa beside it: seat strip, top roll, a tall back face, arm rolls 2 px higher
        b.fillRect(4, 1, 8, 2, r[2]); b.hline(4, 1, 8, r[1]);                                         // seat cushion, beyond the back
        b.fillRect(2, SOFA_TOP, 12, 3, r[2]); b.hline(3, SOFA_TOP, 10, r[1]); b.hline(3, SOFA_TOP + 2, 10, r[3]);   // top roll
        b.fillRect(2, SOFA_FACE, 12, SOFA_BASE - SOFA_FACE, r[3]);
        b.vline(4, SOFA_FACE, 6, r[2]); b.vline(11, SOFA_FACE + 1, 6, r[4]); b.set(7, SOFA_FACE + 3, r[4]); b.set(8, SOFA_FACE + 3, r[2]);
        b.hline(2, SOFA_BASE - 1, 12, r[4]);
        for (const x of [1, 12]) {                                                                   // arm rolls, 3 px, 2 px above the back
          b.fillRect(x, SOFA_TOP - 2, 3, SOFA_BASE - SOFA_TOP + 2, r[3]);
          b.fillRect(x, SOFA_TOP - 2, 3, 3, r[2]); b.set(x + 1, SOFA_TOP - 2, r[1]); b.set(x, SOFA_TOP - 1, r[1]);
          b.hline(x, SOFA_TOP + 1, 3, r[4]); b.vline(x + 2, SOFA_TOP - 1, SOFA_BASE - SOFA_TOP, r[4]);
        }
        // a lace doily over the top roll: a 6x2 cream strip with a scalloped lower edge
        b.hline(5, SOFA_TOP, 6, P.p0); b.hline(5, SOFA_TOP + 1, 6, P.p1);
        for (const x of [5, 7, 9]) b.set(x, SOFA_TOP + 2, P.p2);
        b.fillRect(2, SOFA_BASE, 2, 2, P.o5); b.fillRect(12, SOFA_BASE, 2, 2, P.o5);                    // short dark feet
        K.outer(b, S.omap([[r, K.ramp('pink')[5]], [[P.p0, P.p1, P.p2], P.p4]], 'o6'));
        K.shadowRect(b, 1, 15, 14, 1);
        return b;
      }
      // a tall darker back along the north, two rolled arms that rise above the seat, a plump seat cushion with a button,
      // a darker front face and stubby legs; lit from the top left, same build as the sofa
      b.fillRect(2, 1, 12, 5, r[3]); b.hline(2, 1, 12, r[1]); b.hline(2, 2, 12, r[2]); b.vline(2, 1, 5, r[2]);   // the back
      b.vline(13, 2, 4, r[4]);
      for (const x of [1, 12]) {                                                                     // arm rolls
        b.fillRect(x, 4, 3, 8, r[2]); b.hline(x, 4, 3, r[0]); b.vline(x, 5, 6, r[1]);
        b.vline(x + 2, 5, 6, x === 1 ? r[3] : r[2]);
      }
      b.fillRect(4, 6, 8, 5, r[1]); b.hline(4, 6, 8, r[0]); b.vline(4, 6, 4, r[0]); b.hline(4, 10, 8, r[2]);   // seat cushion
      b.set(8, 8, r[3]);                                                                             // a 1px button
      b.fillRect(1, 11, 14, 3, r[3]); b.hline(1, 11, 14, r[2]); b.hline(1, 13, 14, r[4]);           // front face
      b.fillRect(2, 14, 2, 1, P.o5); b.fillRect(12, 14, 2, 1, P.o5);                                  // legs
      K.outer(b, S.omap([[r, K.ramp('pink')[5]]], 'o6'));
      K.shadowRect(b, 1, 15, 14, 1);
      return b;
    },
  });

  // Coat hooks on the wall with a shoe rack under them. satchel: the hero's satchel hangs on a hook; empty: it's gone.
  K.stamp('coat_rack', {
    w: 2, h: 1, variants: ['satchel', 'empty'],
    paint: (v) => {
      const b = K.B(32, 16);
      // a wooden peg rail screwed straight onto the wall (no box), three brass pegs
      b.fillRect(1, 2, 30, 2, P.o2); b.hline(1, 2, 30, P.o1); b.hline(1, 3, 30, P.o3);
      b.set(2, 2, P.gd3); b.set(29, 2, P.gd3);                                                       // screws
      // coats hung by the collar from the outer pegs: narrow shoulders, wider hems, a darker fold line and buttons
      const coat = (x, c) => K.stick(b, x, 5, [
        '..abbc..',
        '.abbbbc.',
        '.ab3bbc.',
        'aab3bgcc',
        'abb3bbbc',
        'abb3bgbc',
        'ab33bbcc',
        'a33bbbcc',
        '44444444',
      ], { a: c[1], b: c[2], 3: c[3], 4: c[4], c: c[3], g: P.gd2 });
      coat(3, K.ramp('red'));
      coat(21, K.ramp('blue'));
      if (v === 'satchel') {
        // the hero's satchel hangs from the middle peg by its strap: a flap with a brass buckle
        b.line(16, 5, 13, 9, P.b2); b.line(16, 5, 19, 9, P.b2);
        K.stick(b, 12, 9, [
          'aaaaaaaa',
          'abbbbbbc',
          'abbbgbbc',
          'cccdcccc',
          'eeeeeeee',
        ], { a: P.b0, b: P.b1, c: P.b2, g: P.gd2, d: P.gd3, e: P.b3 });
      }
      K.outer(b, S.omap([[WOOD, P.o6], [[P.b0, P.b1, P.b2, P.b3, P.b4, P.gd2, P.gd3], P.b4], [S.tones(K.ramp('red')), P.red4], [S.tones(K.ramp('blue')), P.bl4]], 'o6'));
      for (const x of [7, 16, 25]) { b.set(x, 4, P.gd2); b.set(x, 5, P.gd3); b.set(x - 1, 4, P.gd1); }   // the pegs, over the collars
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
      b.fillRect(1, 1, 46, 14, P.o3); b.hline(1, 1, 46, P.o1); b.vline(1, 1, 14, P.o2); b.hline(1, 14, 46, P.o5);   // wooden frame
      b.fillRect(2, 2, 44, 12, P.o5);                                                               // dark inner bevel
      b.fillRect(3, 3, 42, 10, P.bl1);                                                              // the sea
      for (const [x, y] of [[5, 4], [43, 11], [33, 3]]) b.hline(x, y, 2, P.bl0);
      // the Tsumugi region: a sand coastline, green land, dark forest clumps, a river and the road between the towns
      const land = (cx, cy, rx, ry) => {
        for (let y = 3; y <= 12; y++) for (let x = 3; x <= 44; x++) {
          const d = ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2;
          if (d <= 1) b.set(x, y, d > 0.72 ? P.s2 : P.g2);
        }
      };
      land(21, 8, 18.5, 5); land(41, 8, 4, 4.4);
      for (let y = 3; y <= 12; y++) for (let x = 3; x <= 44; x++) {                                 // the coast's sea-side edge
        if (b.get(x, y) !== P.bl1) continue;
        if ([[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => b.get(x + dx, y + dy) === P.s2)) b.set(x, y, P.bl2);
      }
      for (const [x, y] of [[7, 7], [12, 9], [26, 5], [30, 9], [17, 6]]) {                          // forest clumps
        b.fillRect(x, y, 3, 2, P.g4); b.set(x, y, P.g3); b.set(x + 2, y + 1, P.f5);
      }
      for (const [x, y] of [[20, 4], [20, 5], [21, 6], [21, 7], [22, 8], [21, 9], [21, 10], [22, 11]]) b.set(x, y, P.bl2);   // river
      for (let i = 1; i < PIN_SPOTS.length; i++) b.line(PIN_SPOTS[i - 1][0], PIN_SPOTS[i - 1][1], PIN_SPOTS[i][0], PIN_SPOTS[i][1], P.d4);
      for (const [x, y] of PIN_SPOTS) b.set(x, y, P.white);                                          // the eight Salon towns
      // a red push pin (2x2 head, white highlight, dark under-side, a grey needle) in each town already won
      const n = PINS.indexOf(v);
      PIN_SPOTS.forEach(([x, y], i) => {
        if (i >= n) return;
        b.fillRect(x, y - 3, 2, 2, P.red2); b.set(x, y - 3, P.white); b.set(x + 1, y - 2, P.red4); b.set(x, y - 2, P.red3);
        b.set(x, y - 1, P.n3);
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
      // hangs from a nail on a 1px string; a red header, a cream page with a 4x3 grid of day cells, one Lantern Festival lantern
      b.line(8, 1, 4, 3, P.p4); b.line(8, 1, 11, 3, P.p4); b.set(8, 0, P.n2); b.set(8, 1, P.n4);
      b.fillRect(3, 4, 10, 3, P.red2); b.hline(3, 4, 10, P.red1); b.hline(3, 6, 10, P.red3);
      b.set(5, 4, P.n3); b.set(10, 4, P.n3);                                                         // binding rings
      b.fillRect(3, 7, 10, 7, P.p0); b.hline(3, 13, 10, P.p2);
      for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) b.set(5 + c * 2, 8 + r * 2, P.n3);
      // the lantern on the festival day: a 2x2 glyph, orange top and red bottom, in place of a day cell
      b.fillRect(10, 11, 2, 1, P.l3); b.fillRect(10, 12, 2, 1, P.red2);
      K.outer(b, S.omap([[[P.p4, P.n2, P.n4], 0]], 'o5'));
      b.set(8, 0, P.n2); b.set(8, 1, P.n4);
      K.shadowRect(b, 14, 5, 1, 10); K.shadowRect(b, 4, 15, 10, 1);
      return b;
    },
  });

  // Three posters side by side, each with a title band and one big chibi Kigu (a girl in her costume's hood): teal with Konko,
  // pink with Ottopi, sunny yellow with Sprubun. Taped at the corners.
  const SKIN = col('#ffdcc4');
  function chibi(b, cx, cy, r, ear) {
    if (ear === 'tri') { b.polygon([[cx - 4, cy - 3], [cx - 4, cy - 7], [cx - 1, cy - 5]], r[2]); b.polygon([[cx + 4, cy - 3], [cx + 4, cy - 7], [cx + 1, cy - 5]], r[3]); b.set(cx - 3, cy - 5, P.pk1); }
    if (ear === 'round') { b.circle(cx - 3, cy - 5, 1.5, r[2], true); b.circle(cx + 3, cy - 5, 1.5, r[3], true); b.set(cx - 3, cy - 5, P.pk1); }
    if (ear === 'long') { b.fillRect(cx - 3, cy - 9, 2, 6, r[1]); b.fillRect(cx + 2, cy - 9, 2, 6, r[2]); b.vline(cx - 2, cy - 8, 4, P.pk1); }
    b.circle(cx, cy - 2, 3.5, r[2], true); b.set(cx - 2, cy - 5, r[1]); b.set(cx - 3, cy - 4, r[1]); b.set(cx - 1, cy - 5, r[1]);   // hood
    b.fillRect(cx - 2, cy - 2, 5, 3, SKIN); b.set(cx - 1, cy - 1, P.ink); b.set(cx + 1, cy - 1, P.ink); b.set(cx - 2, cy, P.pk1); b.set(cx + 2, cy, P.pk1);
    b.fillRect(cx - 3, cy + 1, 7, 4, r[2]); b.hline(cx - 3, cy + 1, 7, r[1]); b.vline(cx + 3, cy + 2, 3, r[3]); b.fillRect(cx - 1, cy + 2, 3, 2, P.p0);
  }
  K.stamp('kigu_poster', {
    w: 2, h: 1,
    paint: () => {
      const b = K.B(32, 16);
      const tl = K.ramp('teal'), pk = K.ramp('pink'), yl = K.ramp('yellow'), or = K.ramp('orange'), mt = K.ramp('mint');
      // three narrow posters, each with a title band along the top and one chibi Kigu: a girl in her costume's hood
      const poster = (x0, bg, band, kigu, ear, dots) => {
        b.fillRect(x0, 1, 10, 14, bg[1]); b.hline(x0, 1, 10, bg[0]); b.fillRect(x0, 1, 10, 3, band); for (const x of dots) b.set(x0 + x, 2, P.p0);
        chibi(b, x0 + 5, 10, kigu, ear);
      };
      poster(0, tl, tl[4], or, 'tri', [2, 3, 5, 7]);
      poster(11, pk, pk[4], tl, 'round', [2, 4, 5, 7]);
      poster(22, yl, or[3], mt, 'long', [2, 3, 5, 6]);
      for (const [x, y] of [[23, 6], [30, 7], [24, 12]]) b.set(x, y, P.white);                      // sparkles
      K.outer(b, S.omap([], 'o5'));
      for (const x0 of [0, 11, 22]) for (const [x, y] of [[x0, 1], [x0 + 9, 1], [x0, 14], [x0 + 9, 14]]) b.set(x, y, P.p0);   // tape at each corner
      return b;
    },
  });

  // Laundry basket. overflow: the bedroom's blue plastic basket, clothes heaped over the rim and a sock hanging off;
  // folded: a wicker basket of folded washing (outdoors under a washing line).
  K.stamp('laundry_basket', {
    w: 1, h: 1, variants: ['overflow', 'folded'],
    paint: (v) => {
      const b = K.B(16, 16);
      // the wicker basket in 3 tones: a light rolled rim, a mid weave, a dark base row
      const basket = () => {
        b.fillRect(2, 9, 12, 5, P.o2);
        for (let y = 10; y < 13; y++) for (let x = 2 + (y & 1); x < 14; x += 2) b.set(x, y, P.o3);
        b.hline(2, 13, 12, P.o4); b.vline(13, 10, 3, P.o3);
        b.fillRect(1, 8, 14, 2, P.o1); b.hline(1, 9, 14, P.o2);
      };
      const layer = (rows, x, y, map, ink) => { const l = K.B(16, 16); K.stick(l, x, y, rows, map); K.outer(l, ink); b.blit(l, 0, 0); };
      if (v === 'folded') {
        basket();
        // folded laundry stacked on top: sheets, a pink top and a blue shirt, each with a fold line and a shaded underside
        layer(['cccccdcccc', 'eeeeeeeeee'], 3, 6, { c: P.p0, d: P.p2, e: P.p2 }, P.p4);
        layer(['pppppppp', 'pppqpppp', 'qqqqqqqq'], 4, 3, { p: P.pk1, q: P.pk2 }, P.pk3);
        layer(['bbbbbb', 'bbBbbb'], 5, 1, { b: P.bl1, B: P.bl2 }, P.bl3);
        K.outer(b, S.omap([[WOOD, P.o6]], 'o6'));
        K.shadow(b, 8, 15, 7, 1);
        return b;
      }
      // overflowing: a yellow towel and a red t-shirt heaped in it, the shirt's sleeve hanging over the right rim,
      // and a pink sock dangling over the left; dark lines between each piece
      layer(['.yyyy.', 'yyyyyy', 'yyTyyy', 'yTyyyy'], 3, 4, { y: P.yl1, T: P.yl3 }, P.o6);
      layer(['.rr..rr.', 'rrrrrrrR', 'rrrrrrRR', '.rrrrRR.', '.rrrRRR.'], 6, 3, { r: P.red1, R: P.red2 }, P.red4);
      basket();
      layer(['rr', 'rR', 'rR', 'R.'], 12, 8, { r: P.red1, R: P.red2 }, P.red4);
      layer(['pp', 'pq', 'pq', 'qq'], 2, 8, { p: P.pk1, q: P.pk2 }, P.o6);
      K.outer(b, S.omap([[WOOD, P.o6]], 'o6'));
      K.shadow(b, 8, 15, 7, 1);
      return b;
    },
  });

  // A purple beanbag (2x2), slumped: a teardrop that sags wide at its base and leans back to a soft peak, a sitting dent in the
  // top with a lit lip, wrinkle lines fanning out of the dent, and a flat base. Purple so it stands off the orange floorboards.
  K.stamp('beanbag', {
    w: 2, h: 2,
    paint: () => {
      const b = K.B(32, 32);
      const r = K.ramp('purple');
      // silhouette: half-width per row, a narrow rounded peak (leaning a little west) swelling to a wide sagging base, ~28x24
      const cxAt = (y) => 16 - (27 - y) * 0.06;
      for (let y = 4; y <= 28; y++) {
        const t = (y - 4) / 24;
        let hw = 5 + 9 * Math.sin(Math.min(1, t * 1.35) * Math.PI / 2);
        if (y >= 26) hw -= (y - 25) * 0.9;                                                            // the base tucks under
        const cx = cxAt(y);
        for (let x = 0; x < 32; x++) {
          const dx = x + 0.5 - cx;
          if (Math.abs(dx) > hw) continue;
          const l = dx / 13 + (y - 14) / 13;                                                          // lit from the top left
          b.set(x, y, l < -0.7 ? r[1] : l < 0.35 ? r[2] : l < 1.0 ? r[3] : r[4]);
        }
      }
      for (const [x, y] of [[12, 6], [13, 6], [11, 7], [12, 7], [10, 9]]) if (K.opaque(b, x, y)) b.set(x, y, r[0]);   // crown sheen
      // the sitting dent: a darker oval in the top centre, its north half deepest, with a lit lip along the south rim
      for (let y = 8; y <= 19; y++) for (let x = 8; x <= 24; x++) {
        const d = ((x + 0.5 - 16) / 5.8) ** 2 + ((y + 0.5 - 13) / 3.6) ** 2;
        const ds = ((x + 0.5 - 16) / 6.6) ** 2 + ((y + 0.5 - 13.7) / 4.2) ** 2;
        if (d <= 1) b.set(x, y, y < 13 ? r[4] : r[3]);
        else if (ds <= 1 && y > 14) b.set(x, y, r[1]);
      }
      // three wrinkles: dark folds with a lit edge, two fanning down-left and one down-right from the dent, one across the base
      for (const [x, y] of [[9, 17], [8, 18], [7, 19], [7, 20], [6, 21]]) { b.set(x, y, r[3]); b.set(x - 1, y, r[1]); }
      for (const [x, y] of [[23, 18], [24, 19], [25, 20], [25, 21], [26, 22]]) { b.set(x, y, r[4]); b.set(x - 1, y, r[2]); }
      for (const [x, y] of [[12, 24], [13, 25], [15, 25], [16, 24], [17, 25], [19, 25]]) b.set(x, y, r[4]);
      K.outer(b, r[5]);
      K.shadow(b, 16, 29, 14, 1, 110);
      return b;
    },
  });

  // A short plank shelf screwed to the east wall (tile column next to it): seen from above it is a thin board along the tile's east
  // edge on two brackets, so the tile is mostly floor. What stands on it follows story and side flags. The 'empty' shelves are
  // genuinely bare, waiting to be filled: just the board with a little dust on it, and on two of them a lone metal bookend (picked by
  // the tile's row, so a stack of empty shelves isn't five copies). plush: a pink kigurumi plush sitting up; card: a framed Tailor
  // card standing on a little easel; trophy: a gold cup with handles on a wooden base.
  const SKIN_T = col('#ffdcc4'), SKIN_S = col('#f4b8a4');
  K.stamp('trophy_shelf', {
    w: 1, h: 1, variants: ['empty', 'plush', 'card', 'trophy', 'empty1', 'empty2', 'empty3', 'empty4'],
    paint: (v) => {
      const b = K.B(16, 16);
      // brackets: two dark iron L-brackets running out from the wall under the board's north and south ends
      for (const y of [3, 12]) { b.hline(10, y, 5, P.n4); b.set(10, y - 1, P.n4); b.set(11, y + 1, P.n5); }
      // the board: 6 px deep, its lit top (west) edge, mid top, shaded east edge against the wall, a dark front lip at the south end
      b.fillRect(9, 1, 6, 14, P.o2); b.vline(9, 1, 13, P.o0); b.vline(10, 1, 13, P.o1); b.vline(14, 1, 14, P.o4);
      b.hline(9, 14, 6, P.o4); b.hline(9, 1, 6, P.o1);
      // grain: two faint lines along the board
      b.vline(12, 3, 4, P.o3); b.vline(11, 9, 3, P.o3);
      K.outer(b, S.omap([[WOOD, P.o6], [[P.n4, P.n5], P.o6]], 'o6'));
      const item = K.B(16, 16);
      if (v.indexOf('empty') === 0) {
        const k = +v.slice(5) || 0;
        // dust: a few pale specks on the bare board
        for (const [x, y] of [[11, 4 + k], [13, 7 + (k & 1)], [12, 11 - (k >> 1)]]) b.set(x, y, P.o0);
        if (k === 1) K.stick(item, 11, 2, ['nN', 'nN', 'nnN'], { n: P.n2, N: P.n3 });               // a lone bookend at the north end
        if (k === 3) K.stick(item, 11, 10, ['Nn', 'Nn', 'NNn'], { n: P.n2, N: P.n3 });              // and one at the south end of another
      } else if (v === 'plush') {
        K.stick(item, 9, 3, [
          '.p..p.',
          'pPPPPp',
          'Pkssks',
          'psSSsp',
          '.pPPp.',
          'pPPppq',
          '.ppqq.',
          '.p..q.',
        ], { p: P.pk2, P: P.pk1, q: P.pk3, s: SKIN_T, S: SKIN_S, k: P.ink });
      } else if (v === 'card') {
        K.stick(item, 9, 3, [
          'GGGGg',
          'Gwwwg',
          'Gwrwg',
          'Gwwwg',
          'Gbbbg',
          'Gwwwg',
          'gggggd',
          '.d..d.',
        ], { G: P.gd2, g: P.gd3, w: P.p0, r: P.red2, b: P.n3, d: P.o4 });
      } else if (v === 'trophy') {
        K.stick(item, 8, 3, [
          'hGggggh',
          'hGgggdh',
          '.Ggggd.',
          '..gdd..',
          '...d...',
          '..gdd..',
          '.OOOOO.',
          '.ooooo.',
        ], { g: P.gd2, G: P.gd0, d: P.gd3, h: P.gd3, O: P.o3, o: P.o4 });
      }
      K.outer(item, 'o6');
      b.blit(item, 0, 0);
      K.shadowRect(b, 6, 2, 2, 12, 50);                                                               // the board's shadow on the floor
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
      // frame: lit west rail, a darker 1px frame edge on the east, a footboard at the north end with a lit top and a 2px dark face
      b.fillRect(1, 1, 30, 43, P.o3); b.vline(1, 1, 43, P.o2); b.vline(2, 4, 40, P.o2);
      b.vline(29, 4, 40, P.o4); b.vline(30, 1, 43, P.o5);
      b.hline(1, 1, 30, P.o1); b.fillRect(1, 2, 30, 2, P.o4); b.hline(1, 3, 30, P.o5);
      // the mattress: a lit top-left edge, darker right edge
      b.fillRect(3, 4, 26, 33, P.p1); b.hline(3, 4, 26, P.p0); b.vline(3, 4, 33, P.p0); b.vline(28, 5, 32, P.p2); b.hline(3, 36, 26, P.p3);
      if (v === 'sleeping') madeQuilt(b);                                                         // the quilt is pulled up (bed_blanket lies over it)
      if (v === 'unmade') { quilt(b, 1, false); b.fillRect(3, 13, 25, 2, P.p0); b.hline(3, 15, 25, P.p3); }   // thrown back: a lit fold on a shadow line
      if (v === 'made') madeQuilt(b);
      // pillows: soft cream, one shadow tone along the lower right, rounded corners, no inner lines
      for (const x of [5, 17]) K.stick(b, x, 29, [
        '.wwwwwwww.',
        'wwwwwwwwws',
        'wwwwwwwwws',
        'wwwwwwwwss',
        '.sssssss..',
      ], { w: P.p0, s: P.p2 });
      // the tall headboard at the south (pillow) end, seen from behind: it stands up in front of the pillows' lower edge, a rounded
      // capped top rail lit along its top, a panelled back face, and two posts down to the floor
      K.stick(b, 1, 33, [
        '..aaaaaaaaaaaaaaaaaaaaaaaaaa..',
        '.abbbbbbbbbbbbbbbbbbbbbbbbbbc.',
        'accccccccccccccccccccccccccccd',
        'eeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
        'eLeeeeeeeeeeeeLLeeeeeeeeeeeeDe',
        'eLeeeeeeeeeeeeLLeeeeeeeeeeeeDe',
        'eLeeeeeeeeeeeeLLeeeeeeeeeeeeDe',
        'eLeeeeeeeeeeeeLLeeeeeeeeeeeeDe',
        'eLeeeeeeeeeeeeLLeeeeeeeeeeeeDe',
        'eDDDDDDDDDDDDDLDDDDDDDDDDDDDDe',
        'ffffffffffffffffffffffffffffff',
      ], { a: P.o0, b: P.o1, c: P.o2, d: P.o3, e: P.o3, L: P.o2, D: P.o4, f: P.o5 });
      for (const x of [2, 28]) b.fillRect(x, 44, 2, 2, P.o5);                                       // its feet
      K.outer(b, S.omap([[WOOD, P.o6], [[P.p0, P.p1, P.p2, P.p3], P.p5]], 'o6'));
      K.shadowRect(b, 4, 46, 24, 1);
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

  // A wooden toy chest painted sky blue, its lid not quite shut (a plush paw pokes out): a 2 px lid lip lit along its top edge, a
  // recessed front panel with a yellow star painted on it, a brass latch, corner straps, and an outline in the wood ramp
  K.stamp('toy_chest', {
    w: 1, h: 1,
    paint: () => {
      const b = K.B(16, 16);
      const s = K.ramp('sky');
      // the lid top seen from above, then its 2 px front lip (lit top edge), the gap with the paw, then the box front
      b.fillRect(1, 2, 14, 3, s[1]); b.hline(1, 2, 14, s[0]); b.vline(14, 3, 2, s[2]);
      b.hline(1, 5, 14, s[0]); b.hline(1, 6, 14, s[2]);                                              // the lid's 2 px lip
      b.hline(1, 7, 14, P.o5); b.set(4, 7, P.pk1); b.set(5, 7, P.pk2);                                // the gap, a pink paw poking out
      b.fillRect(1, 8, 14, 6, s[2]); b.vline(1, 8, 6, s[1]); b.vline(14, 8, 6, s[3]); b.hline(1, 13, 14, s[3]);
      // wooden corner straps (the chest is wood under the paint) and the recessed front panel
      for (const x of [1, 13]) { b.fillRect(x, 5, 2, 9, P.o2); b.vline(x, 5, 9, P.o1); }
      b.vline(14, 5, 9, P.o3);
      b.strokeRect(4, 9, 8, 4, s[3]); b.hline(5, 9, 6, s[1]);
      // the painted star on the panel (flat paint, two tones), and the latch at the lid's centre
      K.stick(b, 6, 9, ['.y..', 'yyyy', '.yd.'], { y: P.yl2, d: P.yl3 });
      b.set(7, 6, P.gd2); b.set(8, 6, P.gd3); b.set(7, 7, P.gd3);
      K.outer(b, S.omap([[WOOD, P.o6], [[s[0], s[1], s[2], s[3]], P.o5]], 'o6'));
      K.shadow(b, 8, 15, 7, 1);
      return b;
    },
  });

  // Small bedside table: lamp (it glows at night through def.nightGlow) or alarm (a round twin-bell alarm clock)
  K.stamp('nightstand', {
    w: 1, h: 1, variants: ['lamp', 'alarm'],
    paint: (v) => {
      const b = K.B(16, 16);
      // 12px wide 3/4 cabinet: a lit 2px top surface, then the front with one drawer and a brass knob
      b.fillRect(2, 7, 12, 2, P.o1); b.hline(2, 7, 12, P.o0);
      b.fillRect(2, 9, 12, 5, P.o3); b.hline(2, 9, 12, P.o4); b.vline(2, 10, 4, P.o2); b.vline(13, 10, 4, P.o4); b.hline(2, 13, 12, P.o4);
      b.strokeRect(4, 10, 8, 3, P.o4); b.hline(5, 10, 6, P.o2); b.set(7, 11, P.gd2); b.set(8, 11, P.gd3);
      if (v === 'lamp') {
        b.fillRect(6, 6, 4, 2, P.o5); b.hline(6, 6, 4, P.o4);                                       // base on the top
        b.fillRect(7, 4, 2, 2, P.o4); b.set(7, 4, P.o3);                                             // stem
        K.stick(b, 4, 1, ['.wwwwww.', 'wwwyyyyy', 'dddddddd'], { w: P.yl0, y: P.yl1, d: P.yl3 });     // shade, darker underside
      } else {
        K.stick(b, 4, 0, [
          '.g...g..',
          '.rrrrr..',
          'rrwwwrr.',
          'rwwkwwq.',
          'rwwkkwr.',
          'rrwwwrq.',
          '.rr.rq..',
        ], { g: P.gd2, r: P.red2, q: P.red3, w: P.p0, k: P.ink2 });
        b.hline(5, 7, 6, P.o2);
      }
      K.outer(b, S.omap([[WOOD, P.o6], [[P.yl0, P.yl1, P.yl3], P.yl4]], 'ink'));
      K.shadow(b, 8, 15, 7, 1);
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
      } else if (v === 'controller') { // a game controller: grey body with its grips, a d-pad, coloured buttons, and its cord in one curve
        K.stick(b, 2, 7, [
          '.hhhhhhhhhh.',
          'hnknnnnnnrnd',
          'kkknnnnnbnyd',
          'hnknnnnnngnd',
          'nnnd....nnnd',
          '.dd......dd.',
        ], { h: P.n1, n: P.n2, d: P.n3, k: P.ink2, r: P.red2, b: P.bl2, y: P.yl2, g: P.f2 });
        for (const [x, y] of [[7, 6], [7, 5], [8, 4], [9, 3], [10, 3], [11, 2], [12, 2]]) b.set(x, y, P.n4);
      } else if (v === 'figures') {    // tiny Konko, Ottopi and Sprubun figures mid-fight
        for (const [x, y, c] of [[3, 6, 'orange'], [8, 4, 'blue'], [11, 9, 'green']]) { const r = K.ramp(c); b.fillRect(x, y, 3, 4, r[2]); b.hline(x, y, 3, r[1]); b.set(x + 1, y + 1, P.p0); b.fillRect(x, y + 4, 3, 1, P.n3); }
        b.set(7, 8, P.yl2); b.set(10, 7, P.yl2);                                                    // little action sparks
      } else if (v === 'plushies') {   // plushies spilling out, one a homemade Nibblenna
        b.circle(5, 8, 3, P.yl1, true); b.fillRect(2, 4, 2, 2, P.yl2); b.fillRect(7, 4, 2, 2, P.yl2); b.set(4, 6, P.yl0);   // a yellow plush with round ears
        b.set(4, 8, P.ink); b.set(6, 8, P.ink); b.set(5, 9, P.pk2);
        b.circle(11, 10, 3, P.b1, true); b.set(8, 8, P.b2); b.set(14, 8, P.b2); b.fillRect(9, 5, 5, 2, P.p0); b.hline(9, 7, 5, P.p2);   // homemade Nibblenna: ears, chef hat
        b.set(10, 10, P.ink); b.set(12, 10, P.ink); b.set(11, 11, P.pk2);
        b.set(13, 12, P.pk2); b.set(12, 12, P.p0);                                                  // a wonky stitched seam
      } else if (v === 'comic') {      // an open comic, face down: a two-colour cover with a panel, a dark spine, white page edges
        K.stick(b, 2, 5, [
          'aaaaaakbbbbb',
          'ayyyaakbbbbb',
          'ayyyaakbyyyb',
          'aaaaaakbyyyb',
          'aaaaaakbbbbb',
          'wwwwwwkwwwww',
          'pppppp.ppppp',
        ], { a: P.red1, b: P.bl2, y: P.yl1, k: P.ink2, w: P.p0, p: P.p2 });
      } else if (v === 'sneakers') {   // sneakers, one on its side
        b.fillRect(2, 5, 4, 7, P.p0); b.hline(2, 11, 4, P.bl2); b.set(3, 6, P.red2); b.set(4, 7, P.red2);
        b.fillRect(8, 9, 7, 3, P.p0); b.hline(8, 12, 7, P.bl2); b.set(10, 9, P.red2); b.set(9, 10, P.ink2);
      } else if (v === 'pebbles') {    // one cluster of four pebbles, lit top-left
        for (const [x, y] of [[5, 7], [8, 6], [7, 9], [10, 9]]) { b.fillRect(x, y, 2, 2, P.c2); b.set(x, y, P.c0); b.set(x + 1, y + 1, P.c4); }
        outline = 'c5';
      } else if (v === 'petals') {     // a little drift of five petals in two pinks
        for (const [x, y, d] of [[5, 6, 0], [8, 5, 1], [6, 9, 1], [9, 8, 0], [11, 6, 1]]) { b.set(x, y, P.pk1); b.set(x + 1, y + d, P.pk1); b.set(x + 1, y + 1 - d, P.pk3); }
        outline = null;
      } else {                         // a dense grass tuft, lit tips
        for (const [x, h] of [[5, 4], [6, 6], [7, 5], [8, 7], [9, 4], [10, 5]]) b.vline(x, 12 - h, h, x & 1 ? P.g4 : P.g2);
        b.set(8, 5, P.g1); b.set(6, 6, P.g1); b.set(10, 7, P.g1); b.hline(5, 12, 6, P.g5);
        outline = null;
      }
      if (outline) K.outer(b, S.omap([], outline === 'ink' ? 'o6' : outline));
      // every variant gets the same soft contact shadow under its lowest row
      let x0 = 16, x1 = -1, y1 = -1;
      for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) if (K.opaque(b, x, y)) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y1 = Math.max(y1, y); }
      if (y1 >= 0 && y1 < 15) K.shadow(b, (x0 + x1) / 2, y1 + 1, (x1 - x0) / 2 + 1, 1, 70);
      return b;
    },
  });
})(typeof globalThis !== 'undefined' ? globalThis : window);
