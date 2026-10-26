/* Route 4 — the Slab Road: Seamstead City -> Canvas Rest. The meadow dries out as you go east: grass, then scrub, then open dune
 * under sandstone shelves. Levels 20-24. First wild Dunehop, Pricklepot, Chiseltail and Sandkit.
 * Story: a line of Pressers carries pale stone slabs east on poles (a running joke, never a wall). Five Tailors stand at three
 * pinches (a gap in the woods, the squeeze between a sandstone outcrop and the forest edge, a notch in a sandstone ridge). The hook for later: the slabs are going north "to the Works". */
(function (root) {
  'use strict';
  const NP = root.NP, L = NP.levels;
  const W = 46, H = 22;

  const M = L.map({
    id: 'route4', name: 'Route 4  Slab Road', music: 'route_desert', battleBg: 'desert', border: 'treeline', w: W, h: H,
    view: 'street', camera: 1,   // the camera looks east down the road, like Route 3
    legend: { '.': 'grass', T: 'treeline', ',': 'tallgrass', ';': 'dry_grass', s: 'sand', u: 'dune', d: 'path', t: 'track', C: 'cliff', f: 'flowers' },
  });
  // ground: a meadow (x < 16), a sand fringe, then dune all the way east
  M.rect(16, 0, 2, H, 's').rect(18, 0, W - 18, H, 'u');
  // borders: trees round the meadow, sandstone shelves round the desert
  M.rect(0, 0, 17, 2, 'T').rect(0, 20, 17, 2, 'T').rect(0, 2, 2, 18, 'T');
  M.rect(17, 0, W - 17, 2, 'C').rect(17, 20, W - 17, 2, 'C').rect(W - 2, 2, 2, 18, 'C');
  M.rect(0, 10, 2, 2, '.').rect(W - 2, 10, 2, 2, 'u');                      // the road in from Seamstead and out to the camp
  // the road: a dirt track in the meadow, a sand track in the desert
  M.rect(2, 10, 14, 2, 'd').rect(16, 10, W - 16, 2, 't');
  // The road is never fenced. Three natural pinches put a Tailor across it (owner's rule: route trainers can't be skipped):
  //  1. the Odo Woods: two tongues of forest reach in from the edges and nearly meet at x6, where Odo waits in the gap
  M.rect(3, 2, 6, 3, 'T').rect(4, 5, 4, 2, 'T').rect(5, 7, 3, 2, 'T');
  M.rect(5, 12, 3, 2, 'T').rect(4, 14, 5, 3, 'T').rect(3, 17, 7, 3, 'T');
  //  2. where the meadow meets the sand, a sandstone outcrop comes down from the north and the forest edge from the south; Lia
  //     and Pip wait where the road squeezes between them
  M.rect(16, 2, 3, 4, 'C').rect(16, 6, 2, 3, 'C').rect(16, 9, 1, 1, 'C');
  M.rect(15, 13, 2, 2, 'T').rect(14, 15, 3, 5, 'T');
  //  3. the Slab Cut: a sandstone ridge crosses the desert and the road goes through a notch in it, past the two Pressers
  M.rect(27, 2, 5, 3, 'C').rect(27, 5, 4, 2, 'C').rect(28, 7, 3, 3, 'C');
  M.rect(28, 12, 2, 1, 'C').rect(28, 13, 4, 3, 'C').rect(26, 16, 7, 4, 'C');
  // the other shelves: side pockets in the dunes
  M.rect(18, 2, 6, 3, 'C').rect(38, 15, 6, 5, 'C').rect(37, 2, 3, 2, 'C');
  // the desert edge: a wavy band of pale sand that runs into the dune
  for (let y = 2; y < 20; y++) {
    if (y >= 10 && y <= 11) continue;                                       // the road keeps its own surfaces
    const d = 18 + Math.round(1.1 * Math.sin(y * 0.8) + 0.6 * Math.sin(y * 2.1 + 1));
    for (let x = 17; x < 22; x++) if ('us'.includes(M.at(x, y))) M.set(x, y, x < d ? 's' : 'u');
  }
  // grass for encounters: meadow tallgrass, dry grass in the dunes
  M.rect(8, 3, 6, 4, ',').rect(9, 14, 6, 4, ',');
  M.rect(19, 13, 5, 5, ';').rect(33, 4, 4, 5, ';').rect(32, 13, 5, 2, ';').rect(23, 5, 4, 3, ';');
  // chip the corners off the grass patches so they read as growth, not carpets
  for (const [x, y, w, h] of [[8, 3, 6, 4], [9, 14, 6, 4], [19, 13, 5, 5], [33, 4, 4, 5], [32, 13, 5, 2], [23, 5, 4, 3]]) {
    for (const [cx, cy] of [[x, y], [x + w - 1, y + h - 1]]) M.set(cx, cy, x < 16 ? '.' : 'u');
  }
  M.rect(10, 8, 3, 1, 'f').rect(2, 13, 2, 1, 'f');

  M.sign(3, 9, 'ROUTE 4  Slab Road\\nWest: Seamstead City\\nEast: Canvas Rest', 'west sign');
  M.sign(41, 9, 'CANVAS REST\\nTents, tea, and shade. Mostly shade.', 'east sign');
  M.sign(19, 9, 'NOTICE: Slab deliveries in progress.\\nPlease keep to the side. Please stay flat.\\p...Someone has added "and have a nice day" in pencil.', 'Society notice');
  M.trees([[13, 7], [12, 17], [10, 1], [3, 15]]);
  M.trees([[22, 6], [26, 3], [35, 15], [41, 6], [20, 17], [42, 13], [35, 17]], 'cactus');
  M.stamp('cactus', 36, 7, 'plain').stamp('rock', 27, 14).stamp('boulder', 37, 14).stamp('rock', 24, 4).stamp('boulder', 12, 9).stamp('boulder', 32, 12);
  // the slab line: three Pressers resting by a stack of slabs, north of the road, with the cart they push
  M.stamp('slab_stack', 24, 8).stamp('slab_stack', 25, 8).stamp('slab_cart', 33, 8);
  M.spawn('west', 2, 10, 'right').spawn('east', 43, 10, 'left');
  M.edge('w', 10, 11, 'seamstead', 'east').edge('e', 10, 11, 'canvas_rest', 'west');

  M.enc('grass', [['dunehop|nibblit', 20, 22, 26], ['chiseltail|nibblit', 20, 22, 24], ['pricklepot|nibblit', 21, 23, 20], ['sandkit|kittabra', 20, 23, 18], ['stingle|chirpadee', 22, 24, 8], ['tumbleyarn|chirpadee', 22, 23, 4]]);

  // ---- the five Tailors
  M.trainer('r4_t1', 6, 9, 'hiker', 'down', { cls: 'Hiker', name: 'Odo', sight: 2, reward: 12, ai: 1, team: [['chiseltail|nibblit', 21], ['kumi|nibblit', 22]],
    intro: 'I\'m walking the whole Slab Road before the slabs do! Let\'s see if you can keep up.', win: 'You\'re faster than a slab, I\'ll give you that.', after: 'The sand gets in everything out east. I found some in a sandwich I hadn\'t even opened yet.' });
  M.trainer('r4_t2', 16, 12, 'picnicker', 'up', { cls: 'Picnicker', name: 'Lia', sight: 2, reward: 11, ai: 1, team: [['pricklepot|nibblit', 21], ['chirpadee', 21], ['kittabra', 22]],
    intro: 'This is the last shady spot before the desert, so it\'s my picnic spot. Battle for it!', win: 'Fine, you can share the shade.', after: 'Have a sandwich for the road. Oh, wait, I ate them all.' });
  M.trainer('r4_t3', 17, 9, 'net_kid', 'down', { cls: 'Net Kid', name: 'Pip', sight: 2, reward: 9, ai: 1, team: [['dunehop|nibblit', 21], ['dunehop|nibblit', 22]],
    intro: 'I\'ve been trying to net a Dunehop all morning! You look easier to net.', win: 'Okay, you were harder to net.', after: 'Dunehop jump right over my net, every single time. They do it on purpose, I swear.' });
  M.trainer('r4_t4', 30, 12, 'grunt_m', 'up', { cls: 'Presser', name: 'Crimp', sight: 2, reward: 12, ai: 1, music: 'battle_society', team: [['kittabra', 22], ['silkie', 22], ['chiseltail|nibblit', 23]],
    intro: 'Hold still. Your map is all creased, so I\'m folding it properly while we battle.', win: 'There! Your map is folded beautifully. ...I lost, though.', after: 'Hospital corners on a map. That\'s my one joy out here.' });
  M.trainer('r4_t5', 31, 9, 'grunt_f', 'down', { cls: 'Presser', name: 'Starch', sight: 2, reward: 12, ai: 1, music: 'battle_society', team: [['sandkit|kittabra', 23], ['pricklepot|nibblit', 23]],
    intro: 'Those slabs are for the Works, and the Works needs them flat. You look a little lumpy.', win: 'Lumpy, and strong. That\'s not in the handbook.', after: 'The slabs go north to the Works. I don\'t know what they press up there, and I\'m told not to wonder.' });

  // the resting slab carriers: three lines of a running gag, each a little more tired
  M.npc('slab1', 22, 8, 'villager_m2', 'down', ['We carry the slabs to Canvas Rest, then they go on by cart.\\pI\'ve carried slabs for three weeks now, and my arms are going flat. The Society would probably call that progress.']);
  M.npc('slab2', 27, 9, 'grunt_f', 'down', ['Each slab weighs as much as a Kigu. A big one.\\pI asked what they\'re for, and they said "pressing". I asked what we\'re pressing,\\pand they said "please lift with your knees".']);
  M.npc('slab3', 34, 7, 'camper', 'down', ['Our cart\'s wheel keeps getting stuck. The desert doesn\'t like carts.\\pHonestly, the desert doesn\'t seem to like anything.']);
  M.npc('mimi_r4', 39, 11, 'mimi', 'left', null, { hideIf: 'mimi_camp_done', script: function* (c) {
    yield* c.sayT('route4.mimi.1', 'Mimi: {player}! You came through the gate too!\\pI\'m heading for the tent camp. Everyone there sews their own tents,\\pand I want to see how they keep the sand out of the seams. Come find me!');
  } });
  M.pickup('cocoa', 35, 4, 'dune_cocoa', 1);
  M.pickup('spool', 11, 18, 'silk_spool', 2);
  M.hidden('boulder', 12, 9, 'sugar_cube', 1, 'hidden sugar cube in the boulder by the road');
  M.reg();
})(typeof globalThis !== 'undefined' ? globalThis : window);
