/* Route 4 — the Slab Road: Seamstead City -> Canvas Rest. The meadow dries out as you go east: grass, then scrub, then open dune
 * under sandstone shelves. Levels 20-24. First wild Jerbi, Cactli, Chippi and Sandkit.
 * Story: a line of Pressers carries pale stone slabs east on poles (a running joke, never a wall). Five Tailors, and a ledge run
 * that walks you past each of them. The hook for later: the slabs are going north "to the Works". */
(function (root) {
  'use strict';
  const NP = root.NP, L = NP.levels;
  const W = 46, H = 22;

  const M = L.map({
    id: 'route4', name: 'Route 4  Slab Road', music: 'route_desert', battleBg: 'desert', border: 'treeline', w: W, h: H,
    view: 'street', camera: 1,   // the camera looks east down the road, like Route 3
    legend: { '.': 'grass', T: 'treeline', ',': 'tallgrass', ';': 'dry_grass', s: 'sand', u: 'dune', d: 'path', t: 'track', C: 'cliff', l: 'ledge_d', f: 'flowers' },
  });
  // ground: meadow (x < 16), a sand fringe, then dune all the way east
  M.rect(16, 0, 2, H, 's').rect(18, 0, W - 18, H, 'u');
  // borders: trees round the meadow, sandstone shelves round the desert
  M.rect(0, 0, 18, 2, 'T').rect(0, 20, 18, 2, 'T').rect(0, 2, 2, 18, 'T');
  M.rect(18, 0, W - 18, 2, 'C').rect(18, 20, W - 18, 2, 'C').rect(W - 2, 2, 2, 18, 'C');
  M.rect(0, 10, 2, 2, '.').rect(W - 2, 10, 2, 2, 'u');                      // the road in from Seamstead and out to the camp
  // shelves that pinch the desert half into a road with side pockets
  M.rect(18, 2, 6, 3, 'C').rect(30, 2, 3, 5, 'C').rect(38, 15, 6, 5, 'C').rect(25, 16, 4, 4, 'C');
  // the road: a dirt track all the way
  M.rect(2, 10, 16, 2, 'd').rect(18, 10, W - 18, 2, 't');                // a dirt road in the meadow, a sand track in the desert
  // grass for encounters: meadow tallgrass in the west, dry grass in the scrub and dunes
  M.rect(4, 3, 7, 5, ',').rect(5, 14, 8, 4, ',');
  M.rect(20, 13, 5, 6, ';').rect(33, 3, 5, 5, ';').rect(29, 13, 8, 2, ';').rect(24, 5, 5, 3, ';');
  M.rect(12, 4, 3, 1, 'f').rect(2, 13, 2, 1, 'f');
  // a ledge run below the road in the meadow: you can hop down to the grass, not climb back, so the road walk passes Lia and Odo
  M.rect(3, 13, 12, 1, 'l');
  M.rect(8, 13, 1, 1, '.');                                                // a gap in the ledge to walk back up

  M.sign(3, 9, 'ROUTE 4  Slab Road\\nWest: Seamstead City\\nEast: Canvas Rest', 'west sign');
  M.sign(41, 9, 'CANVAS REST\\nTents, tea, and shade. Mostly shade.', 'east sign');
  M.sign(17, 9, 'NOTICE: Slab deliveries in progress.\\nPlease keep to the side. Please stay flat.\\p...Someone has added "and have a nice day" in pencil.', 'Society notice');
  M.trees([[2, 3], [12, 7], [14, 15], [3, 18], [10, 2]]);
  M.trees([[22, 9], [27, 8], [35, 12], [40, 6], [19, 15], [42, 13]], 'cactus');
  M.stamp('cactus', 36, 8, 'plain').stamp('rock', 28, 13).stamp('boulder', 37, 12).stamp('rock', 24, 4).stamp('boulder', 15, 8);
  // the slab line: three Pressers resting by a stack of slabs, north of the road, with the cart they push
  M.stamp('slab_stack', 24, 8).stamp('slab_stack', 25, 8).stamp('slab_cart', 32, 8);
  M.spawn('west', 2, 10, 'right').spawn('east', 43, 10, 'left');
  M.edge('w', 10, 11, 'seamstead', 'east').edge('e', 10, 11, 'canvas_rest', 'west');

  M.enc('grass', [['jerbi|nibbi', 20, 22, 26], ['chippi|nibbi', 20, 22, 24], ['cactli|nibbi', 21, 23, 20], ['sandkit|mittsy', 20, 23, 18], ['skorpi|peepi', 22, 24, 8], ['tumbi|peepi', 22, 23, 4]]);

  // ---- the five Tailors
  M.trainer('r4_t1', 6, 9, 'hiker', 'down', { cls: 'Hiker', name: 'Odo', sight: 2, reward: 12, ai: 1, team: [['chippi|nibbi', 21], ['kumi|nibbi', 22]],
    intro: 'I\'m walking the whole Slab Road before the slabs do! Let\'s see if you can keep up.', win: 'You\'re faster than a slab, I\'ll give you that.', after: 'The sand gets in everything out east. I found some in a sandwich I hadn\'t even opened yet.' });
  M.trainer('r4_t2', 13, 12, 'picnicker', 'up', { cls: 'Picnicker', name: 'Lia', sight: 2, reward: 11, ai: 1, team: [['cactli|nibbi', 21], ['peepi', 21], ['mittsy', 22]],
    intro: 'This is the last shady spot before the desert, so it\'s my picnic spot. Battle for it!', win: 'Fine, you can share the shade.', after: 'Have a sandwich for the road. Oh, wait, I ate them all.' });
  M.trainer('r4_t3', 21, 12, 'net_kid', 'up', { cls: 'Net Kid', name: 'Pip', sight: 3, reward: 9, ai: 1, team: [['jerbi|nibbi', 21], ['jerbi|nibbi', 22]],
    intro: 'I\'ve been trying to net a Jerbi all morning! You look easier to catch.', win: 'Okay, you were harder to catch.', after: 'Jerbi jump right over my net. Every time. They do it on purpose, I swear.' });
  M.trainer('r4_t4', 28, 9, 'grunt_m', 'down', { cls: 'Presser', name: 'Crimp', sight: 2, reward: 12, ai: 1, music: 'battle_society', team: [['mittsy', 22], ['silkie', 22], ['chippi|nibbi', 23]],
    intro: 'Hold still. Your map is all creased, so I\'m folding it properly while we battle.', win: 'There! Your map is folded beautifully. ...I lost, though.', after: 'Hospital corners on a map. That\'s my one joy out here.' });
  M.trainer('r4_t5', 34, 12, 'grunt_f', 'up', { cls: 'Presser', name: 'Starch', sight: 3, reward: 12, ai: 1, music: 'battle_society', team: [['sandkit|mittsy', 23], ['cactli|nibbi', 23]],
    intro: 'Those slabs are for the Works, and the Works needs them flat. You look a little lumpy.', win: 'Lumpy, and strong. That\'s not in the handbook.', after: 'The slabs go north to the Works. I don\'t know what they press up there, and I\'m told not to wonder.' });

  // the resting slab carriers: three lines of a running gag, each a little more tired
  M.npc('slab1', 23, 9, 'grunt_m', 'down', ['We carry the slabs to Canvas Rest, then they go on by cart.\\pI\'ve carried slabs for three weeks now. My arms are very flat.']);
  M.npc('slab2', 26, 9, 'grunt_f', 'down', ['Each slab weighs as much as a Kigu. A big one.\\pI asked what they\'re for, and they said "pressing". I asked what we\'re pressing,\\pand they said "please lift with your knees".']);
  M.npc('slab3', 31, 9, 'grunt_m', 'down', ['Our cart\'s wheel keeps getting stuck. The desert doesn\'t like carts.\\pHonestly, the desert doesn\'t seem to like anything.']);
  M.npc('mimi_r4', 39, 11, 'mimi', 'left', null, { hideIf: 'mimi_camp_done', script: function* (c) {
    yield* c.sayT('route4.mimi.1', 'Mimi: {player}! You came through the gate too!\\pI\'m heading for the tent camp. Everyone there sews their own tents,\\pand I want to see how they keep the sand out of the seams. Come find me!');
  } });
  M.pickup('cocoa', 35, 4, 'dune_cocoa', 1);
  M.pickup('spool', 6, 16, 'silk_spool', 2);
  M.hidden('boulder', 15, 8, 'sugar_cube', 1, 'hidden sugar cube in the boulder by the road');
  M.reg();
})(typeof globalThis !== 'undefined' ? globalThis : window);
