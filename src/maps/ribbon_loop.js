/* Ribbon Loop — the scenic way from Basting Green round to Thimble Village's east gate while the Tidy Day parade holds the main road
 * (padding beat 4). Built from the approved Ribbon Loop plan v3 (2026-10-28): the loop itself is the walk (east along the bottom,
 * north up the side, west along the top into Thimble), past four friendly Tailors who can't be walked around. The middle is the
 * Ribbon Maze (plans/maze.json), closed by two Society guards measuring every leaf until Poppy is beaten; after that it holds five
 * hidden items in blind corners, 3 Silk Spools by the fountain in the centre and a lost Kittabra whose Tailor waits by the south gate.
 * Also: the Acolarva snacking by the hay, and a Snip bush in front of a Wish Candy nook. Wild map: its trees can be shaken. */
(function (root) {
  'use strict';
  const NP = root.NP, L = NP.levels;
  const W = 30, H = 26;

  // The plan's rows, with the maze's trees as hedge (H), the fountain cell as grass under the fountain_s stamp, and four hedge
  // notches opened for things that would otherwise stand on a lane: the maze sign (15,6), the two leaf heaps (17,6) (19,19) and
  // the Worried Tailor's alcove (21,19). The plan's T at (27,12) (the tree behind Oki) is kept; maze.json has tall grass there.
  const ROWS = [
    'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTT', //  0 A
    'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTT', //  1 B
    'TTTT,,,,......T.........TTTTTT', //  2 C   Rio's tree (14,2)
    'TTTT,,,,................TT..TT', //  3 D   Wish Candy nook (26,3) (27,3)
    'pppppppppppppppppppppppppp..TT', //  4 E   Snip bush (26,4)
    'pppppppppppppppppppppppppp.TTT', //  5 F
    'TTTHHHHHHHHHHHH...HHHHHHpp..TT', //  6 G   maze sign (15,6); north gate (16,6); leaf heap (17,6)
    'TTTH.H.....H...........Hpp..TT', //  7 H
    'TTTH.HHH.H.HHHHHHH.HHH.Hpp..TT', //  8 I
    'TTTH...H.H.........H.H.Hpp..TT', //  9 J
    'TTTHHH.H.HHHHHHHHHHH.H.Hpp,,TT', // 10 K
    'TTTH.H...H.H...H.H...H.Hpp,,TT', // 11 L
    'TTTH.HHHHH.....H.H.H.H.Hpp,TTT', // 12 M   fountain (13,12); the clearing's only way in (11,12); Oki's tree (27,12)
    'TTTH.......H...H...H...Hpp,,TT', // 13 N
    'TTTH.HHHHH.HHHHH.HHHHHHHpp,,TT', // 14 O
    'TTTH.H...H.......H...H.Hpp,,TT', // 15 P
    'TTTH.HHH.HHHHHHHHH.H.H.Hpp..TT', // 16 Q
    'TTTH...............H...Hpp..TT', // 17 R
    'TTTHHHHHHHHHHHHHHHHH.HHHpp..TT', // 18 S
    'TTTHHHHHHHHHHHHHHHH...HHpp..TT', // 19 T   leaf heap (19,19); south gate (20,19); Worried Tailor's alcove (21,19)
    'ppppppppppppppppppppppppppTTTT', // 20 U
    'ppppppppppppppppppppppppppTTTT', // 21 V
    'TTTT..............ffff..TTTTTT', // 22 W
    'TTTT....fTf......T......TTTTTT', // 23 X   trees behind Tam (9,23) and Pim (17,23)
    'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTT', // 24 Y
    'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTT', // 25 Z
  ];

  // ---- the snacking Acolarva: a one-off chance to meet her by the hay (optional, once)
  function* acolarva(c) {
    if (c.flag('rl_silkie')) { yield* c.sayT('ribbon_loop.hay.after', 'There are a few nibbled leaves by the hay. Someone had a lovely lunch here.'); return; }
    yield* c.sayT('ribbon_loop.hay.1', 'A wild Acolarva is happily munching leaves beside the hay.\\pShe hums a little between bites.');
    if (!(yield* c.ask('Say hello to the Acolarva?'))) return;
    c.set('rl_silkie');
    yield* c.wildBattle('acolarva', 9);
  }

  // ---- the Worried Tailor by the south gate and her lost Kittabra (a small quest for after Poppy; reward: a Plum Treat)
  function* worried(c) {
    const k = (s) => 'ribbon_loop.rl_worried.' + s;
    if (c.flag('rl_kitty_reward')) {
      yield* c.sayT(k('after'), 'She hasn\'t left my side since you brought her back. I don\'t think she wants to see another hedge for a while.');
      return;
    }
    if (c.flag('rl_kitty_found')) {
      yield* c.sayT(k('thanks'), 'Kittabra! You found her! I was so worried she\'d be stuck in there forever.\\pThank you so much. Here, I promised you a reward!');
      c.set('rl_kitty_reward');
      yield* c.giveItem('plum_treat', 1);
      return;
    }
    if (c.flag('badge1')) {
      yield* c.sayT(k('open'), 'The Society finally packed up and left, but I still don\'t think I\'d find my way back out of there.\\pIf you can bring my Kittabra out, I\'d be sure to reward you!');
      return;
    }
    // the owner's line (plan), exact; the page breaks only split it into boxes
    yield* c.sayT(k('1'), 'What\'s with these Society dorks? My Kittabra ran into the maze and got lost.\\pThey won\'t let me in to get her, and even if I did I don\'t think I\'d make it back out.\\pIf only someone in there could bring her out, I\'d be sure to reward them!');
    if (NP.snd && NP.snd.cry) NP.snd.cry('kittabra');
    yield* c.sayT(k('meow'), 'You can hear a Kittabra meowing somewhere deep inside the maze.');
  }
  // the maze only opens after Poppy, so finding her needs no flag check
  function* kitty(c) {
    if (NP.snd && NP.snd.cry) NP.snd.cry('kittabra');
    yield* c.sayT('ribbon_loop.rl_kitty.1', 'The Kittabra gives a happy little meow when she sees you.\\pShe darts off between the hedges, heading straight for the south gate!');
    c.set('rl_kitty_found');
    c.hideNpc('rl_kitty');
  }
  // ---- the heaps of measured leaves beside each gate; after Poppy the Society's note is pinned on top (the quoted note is the plan's)
  function* heap(c) {
    if (!c.flag('badge1')) { yield* c.sayT('ribbon_loop.heap.0', 'It\'s a heap of leaves the Society has already measured.'); return; }
    yield* c.sayT('ribbon_loop.heap.1', 'There\'s a note pinned to the heap of measured leaves.\\p"Project paused. Leaves are not cooperating."');
  }

  const M = L.map({
    id: 'ribbon_loop', name: 'Ribbon Loop', music: 'route_meadow', battleBg: 'grass', border: 'treeline', w: W, h: H,
    // flat3d: in 3D the hedge maze turned into one sea of treeline canopy and its paths couldn't be read, so this map stays flat
    view: 'street', flat3d: true,
    legend: { '.': 'grass', T: 'treeline', H: 'hedge', p: 'path', ',': 'tallgrass', f: 'flowers' },
    // tree shake (approved 2026-10-28): Chirpadee common, Lyripip rare and under-levelled for the route
    // (Ch1 level retune: the Chirpadee match the grass, the Lyripip a level above; her level is still an open question for the owner).
    treeShake: [{ sp: 'chirpadee', min: 7, max: 9, w: 7 }, { sp: 'lyripip', min: 9, max: 10, w: 1 }],
  });
  M.ascii(0, 0, ROWS);

  // ---------------------------------------------------------------------------------------------------------- stamps
  M.sign(4, 22, 'RIBBON LOOP\\nThe long way round to Thimble Village.');
  M.sign(8, 3, 'RIBBON LOOP\\nWest: Thimble, South: Basting Green');
  M.sign(15, 6, 'THE RIBBON MAZE', 'maze sign beside the north gate');
  M.stamp('haystack', 5, 2);
  M.trees([[27, 7], [13, 22]]);
  M.stamp('bench', 21, 23).stamp('stump', 27, 18);
  M.stamp('bush', 26, 4);                          // Snip it to reach the Wish Candy nook (26,3) (27,3) (27,4)
  M.stamp('fountain_s', 13, 12);                   // the maze centre's little garden fountain
  M.stamp('leaf_heap', 17, 6).stamp('leaf_heap', 19, 19);
  for (const [x, y] of [[5, 2], [6, 2], [5, 3], [6, 3]]) M.interact(x, y, acolarva, 'the snacking Acolarva (one-time wild battle)');
  M.interact(17, 6, heap, 'heap of measured leaves (note after Poppy)');
  M.interact(19, 19, heap, 'heap of measured leaves (note after Poppy)');

  // ---------------------------------------------------------------------------------------------------------- spawns and exits
  M.spawn('west', 2, 20, 'right')    // Basting Green's east road lands here
    .spawn('north', 2, 4, 'right');  // Thimble's east gate lands here
  M.edge('w', 20, 21, 'basting_green', 'east').edge('w', 4, 5, 'thimble', 'east');

  M.enc('grass', [['chirpadee', 7, 9, 25], ['nibblit', 7, 9, 25], ['kittabra', 8, 10, 25], ['acolarva', 7, 9, 25]]);

  // ---------------------------------------------------------------------------------------------------------- the four Tailors
  // One on each lane, each with a tree (or Oki's tree) behind them so the verge is no way round.
  M.trainer('tam', 9, 22, 'hiker', 'up', { cls: 'Hiker', name: 'Tam', sight: 2, reward: 6, ai: 0, team: [['nibblit', 9], ['nibblit', 9]],
    intro: 'Taking the long way round? So am I, every year! Fancy a battle on the way?', win: 'Ha! You walk faster than I do, too.',
    after: 'The parade will be gone by tomorrow, but the loop is here every day.' });
  M.trainer('pim', 17, 22, 'picnicker', 'up', { cls: 'Picnicker', name: 'Pim', sight: 2, reward: 6, ai: 0, team: [['chirpadee', 7], ['kittabra', 10]],
    intro: 'I set my picnic up right where the parade would see it.\\pThen they went and folded my blanket! Battle me, I need to shake off the grumps.',
    win: 'Much better! I feel nicely crumpled again.', after: 'Have a sandwich crust. ...No? More for Chirpadee.' });
  M.trainer('oki', 26, 12, 'sailor', 'left', { cls: 'Sailor', name: 'Oki', sight: 2, reward: 7, ai: 1, team: [['kerochapu', 10]],
    intro: 'Ahoy! My ship is in Seamstead, but I like a good long walk on my day off.\\pShow me your sea legs!',
    win: 'Sunk! You sail a fine battle, matey.', after: 'Kerochapu misses the water, but she says the loop makes a nice change. Ribbit.' });
  M.trainer('rio', 14, 3, 'net_kid', 'down', { cls: 'Net Kid', name: 'Rio', sight: 2, reward: 5, ai: 0, team: [['acolarva', 10], ['kittabra', 11]],
    intro: 'I came all this way to befriend the leaf-munching Acolarva.\\pShe won\'t stop eating. Battle me while I wait!', win: 'Even my Kittabra wants a snack now.',
    after: 'I dropped a Sugar Cube somewhere in the Ribbon Maze and never found it.' });

  // ---------------------------------------------------------------------------------------------------------- other people
  M.npc('rl_gran', 23, 22, 'elder_m', 'left',
    ['I walk Ribbon Loop every morning, round and round.\\pThey can fold up the main road all they like, but nobody can fold a loop!']);
  // the Society guards stand in the two gates (the maze is closed in play and in routing.test); they leave once Poppy is beaten
  M.npc('rl_guard_n', 16, 6, 'grunt_m', 'up',
    ['We\'ve been asked to measure every leaf in this maze and pull out any that aren\'t perfectly symmetrical.\\pIt\'s a very big maze, so it\'s closed until we\'re done.'],
    { hideIf: 'badge1', note: 'Society guard, north gate (gone after Poppy)' });
  M.npc('rl_guard_s', 20, 19, 'grunt_f', 'down',
    ['Did you know most leaves aren\'t symmetrical at all? I didn\'t, until this morning.\\pWe might be here a while.'],
    { hideIf: 'badge1', note: 'Society guard, south gate (gone after Poppy)' });
  M.npc('rl_worried', 21, 19, 'tailor_f', 'down', null, { script: worried, note: 'Worried Tailor (no battle), her Kittabra is lost in the maze' });
  M.npc('rl_kitty', 4, 7, 'kigu:kittabra', 'down', null, { script: kitty, hideIf: 'rl_kitty_found', note: 'the lost Kittabra, far north-west blind corner' });
  // back home: once found she waits on the flowers across the road from her Tailor (spec 4.2; her line is PROPOSED, awaiting the owner)
  M.npc('rl_kitty_home', 21, 22, 'kigu:kittabra', 'up', null, { showIf: 'rl_kitty_found', note: 'the Kittabra, safely back with her Tailor',
    script: function* (c) { if (NP.snd && NP.snd.cry) NP.snd.cry('kittabra'); yield* c.sayT('ribbon_loop.rl_kitty_home', 'Kittabra purrs and won\'t leave her Tailor\'s side.'); } });

  // ---------------------------------------------------------------------------------------------------------- things to find
  M.pickup('maze_silk', 12, 13, 'silk_spool', 3, '3 Silk Spools by the fountain in the maze centre');
  M.def.props.push(
    { id: 'rl_spool', x: 22, y: 15, icon: 'item:bond_spool', hideIf: 'rl_spool', note: '2 Bond Spools, the first blind corner past the south gate',
      script: function* (c) { c.set('rl_spool'); yield* c.giveItem('bond_spool', 2, { found: true }); } },
    { id: 'rl_cake', x: 27, y: 19, icon: 'item:fancy_cake', hideIf: 'rl_cake', script: function* (c) { c.set('rl_cake'); yield* c.giveItem('fancy_cake', 1, { found: true }); } },
    { id: 'rl_balm', x: 22, y: 2, icon: 'item:aloe_balm', hideIf: 'rl_balm', script: function* (c) { c.set('rl_balm'); yield* c.giveItem('aloe_balm', 1, { found: true }); } },
    { id: 'rl_wish', x: 27, y: 3, icon: 'item:wish_candy', hideIf: 'rl_wish', gate: 'snip', note: 'Wish Candy in the nook behind the Snip bush',
      script: function* (c) { c.set('rl_wish'); yield* c.giveItem('wish_candy', 1, { found: true }); } },
  );
  M.hidden('maze_revive', 6, 7, 'revive_tea', 1, 'hidden Revive Tea in a blind corner of the maze');
  M.hidden('maze_allcure', 12, 7, 'all_cure', 1, 'hidden All-Cure in a blind corner of the maze');
  M.hidden('maze_sugar', 10, 11, 'sugar_cube', 1, 'hidden Sugar Cube in a blind corner of the maze (the one Rio dropped)');
  M.hidden('maze_thread', 20, 9, 'thread_ball', 1, 'hidden Thread Ball in a blind corner of the maze');
  M.hidden('maze_scent', 6, 15, 'scent_spray', 1, 'hidden Scent Spray in a blind corner of the maze');

  M.reg();
})(typeof globalThis !== 'undefined' ? globalThis : window);
