/* Route 3 — Seam Road: Hemline -> Seamstead City. Wide, sunny, busy with delivery carts; first Volt Kigu. Levels 13-17.
 * A river cuts the road a few steps out of Hemline. The bridge is missing its middle planks, and the crew can't fix it, because
 * two Pressers are measuring every one of their tools and folding the blueprints smaller and smaller. Mimi waves from the far
 * bank, and the player paddles over with Bryn's Paddle Disc (the game's first required paddle). After Zip's Button the Pressers
 * are gone and the bridge is mended. The river runs on south, out of the map, to Hemline Lake. */
(function (root) {
  'use strict';
  const NP = root.NP, L = NP.levels;
  const W = 40, H = 22;
  const MENDED = 'badge3';   // the Pressers are called back to the city after the raid, so the crew finally gets to work

  // ---- the broken bridge: the crew, the Pressers on the planks, and Mimi on the far bank with the hint
  function* bridgeScene(c) {
    const m = c.npc('mimi_r3');
    yield* c.face('player', 'right');
    yield* c.emote('player', 'exclaim');
    yield* c.sayT('route3.bridge.1', 'Plumb: Hammer number two. The head is four inches long, and the handle is eleven and a quarter.\\pMargin, put that quarter in the report.');
    yield* c.sayT('route3.bridge.2', 'Margin: I can\'t yet. I\'m still folding the blueprints into sixteenths so they\'ll fit the regulation folder.');
    yield* c.face(c.npc('foreman'), 'down');
    yield* c.sayT('route3.bridge.3', 'Foreman: Sorry, Tailor, you\'re stuck on this side for now.\\pWe\'ve had the new planks sitting here for three days, but they won\'t let us touch them until every tool\'s been measured.\\pThey\'re on the second hammer, and we brought forty-one tools.');
    c.showNpc('mimi_r3');
    yield* c.sayT('route3.bridge.4', 'Mimi: {player}! Over here, on the other side!\\pI came across on the crew\'s supply raft this morning, before the Pressers got to it. Now the raft\'s under inspection too.');
    yield* c.sayT('route3.bridge.5', 'Mimi: Didn\'t Bryn give you a Paddle Disc? Face the water and press A, and your Kigu can paddle you over!\\pI\'ll see you in Seamstead. Don\'t let them measure you on the way!');
    yield* c.face(m, 'right');
    yield* c.walk(m, ['right', 7]);
    c.hideNpc('mimi_r3');
    c.set('r3_bridge_seen');
  }

  // ---- Plumb: an optional battle, for anyone who stops to watch him measure
  function* plumb(c) {
    if (c.flag(MENDED)) return;
    if (c.flag('r3_plumb_beaten')) { yield* c.sayT('route3.plumb.after', 'Plumb: Hammer number three. ...No, wait, that\'s the same hammer. I\'ll have to start the count over.'); return; }
    yield* c.sayT('route3.plumb.1', 'Plumb: You\'ve been watching me measure for a while now, haven\'t you?\\pIt\'s only fair that I measure your Kigu too. Let\'s see if they\'re up to standard!');
    const won = yield* c.trainerBattle({ cls: 'Presser', name: 'Plumb', look: 'grunt_m', ai: 1, reward: 9, music: 'battle_society', canLose: true, team: L.team([['scurrent|kittabra', 14], ['acolarva', 15]]) });
    if (won) {
      c.set('r3_plumb_beaten');
      yield* c.sayT('route3.plumb.win', 'Plumb: Your Kigu are well over standard. I don\'t have a form for that.\\pI\'ll just go back to the hammers, then.');
    }
  }

  const M = L.map({
    id: 'route3', name: 'Route 3  Seam Road', music: 'route_meadow', battleBg: 'grass', border: 'treeline', w: W, h: H,
    view: 'street',   // 3D camera preset (street | town | flat-ish), see src/engine/persp.js
    legend: { '.': 'grass', T: 'treeline', c: 'cobble', ',': 'tallgrass', f: 'flowers', w: 'water', N: 'bridge_h_n', S: 'bridge_h_s', n: 'bridge_h_n_cut_e', s: 'bridge_h_s_cut_e', m: 'bridge_h_n_cut_w', o: 'bridge_h_s_cut_w', C: 'cliff_grass' },
    camera: 1,   // 3D view looks east along the seam road
  });
  M.rect(0, 0, W, 2, 'T').rect(0, 20, W, 2, 'T').rect(0, 2, 2, 18, 'T').rect(W - 2, 2, 2, 18, 'T');
  M.rect(0, 10, W, 2, 'c');                                  // the seam road itself

  // ---- the river: in from the north, under the bridge, round a reedy islet and away south towards Hemline Lake
  M.rect(9, 0, 3, H, 'w').rect(8, 0, 1, 5, 'w').rect(12, 17, 1, 5, 'w');
  M.blob(10, 15, 2.4, 1.4, 'w').set(10, 15, '.');
  M.rect(9, 10, 3, 1, 'N').rect(9, 11, 3, 1, 'S');
  M.gate('bridge_n', { cells: [[10, 10]], closed: 'w', open: 'N', flag: MENDED, note: 'missing planks (mended after badge3)' });
  M.gate('bridge_s', { cells: [[10, 11]], closed: 'w', open: 'S', flag: MENDED, note: 'missing planks (mended after badge3)' });
  // the broken plank ends either side of the gap, squared off again once it's mended
  M.gate('end_wn', { cells: [[9, 10]], closed: 'n', open: 'N', flag: MENDED }).gate('end_ws', { cells: [[9, 11]], closed: 's', open: 'S', flag: MENDED });
  M.gate('end_en', { cells: [[11, 10]], closed: 'm', open: 'N', flag: MENDED }).gate('end_es', { cells: [[11, 11]], closed: 'o', open: 'S', flag: MENDED });

  // ---- grass: the Hemline bank, the near meadows past the river, and the wide meadows in the middle
  M.rect(3, 3, 5, 4, ',').rect(3, 15, 5, 3, ',').rect(13, 3, 4, 4, ',').rect(14, 14, 3, 4, ',').rect(22, 3, 6, 4, ',').rect(22, 14, 6, 4, ',');
  M.rect(13, 8, 2, 1, 'f').rect(24, 13, 4, 1, 'f').rect(33, 6, 3, 1, 'f').rect(5, 8, 2, 1, 'f');

  // The road is never fenced. Two natural pinches put a Tailor across it (owner's rule: route trainers can't be skipped):
  //  1. a belt of woods comes down from the north edge and up from the south one, and leaves just the road; Bea and Rolf stand in it
  M.rect(18, 2, 2, 7, 'T').rect(17, 2, 1, 3, 'T').rect(20, 5, 1, 3, 'T').set(19, 9, 'T');
  M.rect(18, 13, 2, 7, 'T').rect(20, 13, 1, 3, 'T').rect(17, 16, 1, 4, 'T').set(18, 12, 'T');
  //  2. a grassy rock ridge near the city, cut through for the road, with Jax and Hem at the cutting
  M.rect(30, 2, 2, 7, 'C').rect(32, 2, 1, 4, 'C').set(31, 9, 'C');
  M.rect(30, 13, 2, 7, 'C').rect(29, 17, 1, 3, 'C').set(31, 12, 'C');

  M.sign(3, 9, 'ROUTE 3  Seam Road\\nWest: Hemline\\nEast: Seamstead City', 'west sign');
  M.sign(8, 9, 'SEAM ROAD BRIDGE\\nClosed for inspection.\\pSomebody has added underneath: "And for repairs, eventually."', 'bridge sign');
  M.sign(36, 9, 'SEAMSTEAD CITY\\nThe city that never stops sewing.', 'east sign');
  M.trees([[2, 3], [7, 3], [6, 17], [13, 6], [15, 17], [24, 5], [27, 16], [34, 3], [35, 15], [37, 6]]);
  M.trees([[21, 2], [33, 17]], 'pine');
  // the crew's camp on the Hemline bank: the new planks, still stacked, and the blueprint table
  M.stamp('crate', 2, 13).stamp('crate', 3, 13).stamp('fold_table', 4, 13).stamp('barrel', 7, 13);
  M.stamp('bench', 25, 8).stamp('barrel', 3, 7).stamp('crate', 2, 7).stamp('bush', 13, 13).stamp('rock', 28, 3).stamp('bush', 36, 13);
  M.spawn('west', 2, 10, 'right').spawn('east', 37, 11, 'left');
  M.edge('w', 10, 11, 'hemline', 'east').edge('e', 10, 11, 'seamstead', 'west');

  M.enc('grass', [['scurrent|kittabra', 13, 15, 25], ['kumi|nibblit', 13, 15, 20], ['chirpadee', 14, 16, 20], ['kittabra', 14, 16, 20], ['scurrent|kittabra', 15, 17, 10]]);
  // paddling: non-fish Tide Kigu only (fishing thread's rule). The rod tables for this river live with the fishing code.
  M.enc('water', [['kerochapu', 13, 16, 100]]);

  M.trainer('r3_t1', 18, 9, 'schoolgirl', 'down', { cls: 'Student', name: 'Bea', sight: 2, reward: 8, ai: 1, team: [['kittabra', 14], ['chirpadee', 14]],
    intro: 'Pattern drafting class! Our teacher said to test everything, so let\'s battle!', win: 'That wasn\'t on the syllabus!', after: 'Seamstead has a whole street just for fabric. I mean a whole street!' });
  M.trainer('r3_t2', 19, 12, 'camper', 'up', { cls: 'Hiker', name: 'Rolf', sight: 2, reward: 9, ai: 1, team: [['kumi|nibblit', 15], ['kumi|nibblit', 15]],
    intro: 'I walked from Hemline in a straight line. Mostly straight!', win: 'Huh. I walked here straight and lost crooked.', after: 'I didn\'t paddle, by the way. I waded. Don\'t tell anyone.' });
  M.trainer('r3_t3', 30, 9, 'rocker', 'down', { cls: 'Busker', name: 'Jax', sight: 2, reward: 10, ai: 1, team: [['scurrent|kittabra', 16], ['scurrent|kittabra', 16]],
    intro: 'Seamstead rocks and so do I! Check my amp... oh, it\'s a sewing machine.', win: 'My ears are still ringing! Nice one.', after: 'Zip taught me that tune. Zip teaches everyone that tune.' });
  M.trainer('r3_t4', 30, 12, 'pleat', 'up', { cls: 'Presser', name: 'Hem', sight: 2, reward: 10, ai: 1, music: 'battle_society', team: [['kittabra', 15], ['acolarva', 16]],
    intro: 'Seam Road rules: no dawdling, no wrinkles, and no unauthorised skipping.', win: 'Skipping is... apparently unregulated. I\'ll make a note of that.', after: 'I shall report that the road is satisfactory. ...Barely.' });

  // ---- the bridge: two Pressers on the planks until the raid is over, the crew on the Hemline bank, Mimi waiting on the far side
  M.npc('plumb', 9, 10, 'grunt_m', 'left', null, { hideIf: MENDED, script: plumb, note: 'Presser Plumb (optional battle)' });
  M.npc('margin', 9, 11, 'grunt_f', 'left', ['Margin: Sixteenths... and now thirty-seconds. It\'s getting very hard to fold.\\pIt\'s getting very hard to read, too, but reading it isn\'t my job.'], { hideIf: MENDED });
  M.npc('foreman', 6, 9, 'builder_m', 'right', null, { script: function* (c) {
    if (c.flag(MENDED)) { yield* c.sayT('route3.foreman.mended', 'Foreman: The Pressers got called back to the city in a hurry, so we finally got to use our tools.\\pThe bridge took us one afternoon. The waiting took three days.'); return; }
    yield* c.sayT('route3.foreman.1', 'Foreman: We could have this bridge fixed by lunch if they\'d let us.\\pIf you\'re in a hurry, the river\'s calm enough to paddle. That\'s what the girl with the lavender said, anyway.');
  } });
  M.npc('crew', 4, 12, 'builder_f', 'up', null, { script: function* (c) {
    if (c.flag(MENDED)) { yield* c.sayT('route3.crew.mended', 'They gave us our blueprints back before they left. They\'re folded so small, I need a magnifying glass to read them.\\pWe built the bridge from memory in the end.'); return; }
    yield* c.sayT('route3.crew.1', 'They\'ve folded our blueprints so small that I can\'t read them anymore.\\pI\'m pretty sure the bridge is supposed to go across the river, though.');
  } });
  M.npc('mimi_r3', 13, 11, 'mimi', 'left', null, { hidden: true, hideIf: 'r3_bridge_seen' });
  M.trigger({ x: 7, y: 2, w: 1, h: 18, id: 'route3_bridge', when: (c) => !c.flag('r3_bridge_seen') && !c.flag(MENDED), script: bridgeScene });

  M.npc('baker', 26, 16, 'grunt_f', 'left', ['I always wanted to be a baker. Warm bread on a cold morning, you know?\\pBut the Society told me it does more good than any bakery could.\\pMadame Damask never raises her voice. She never has to.\\pEveryone just gets... smoother.']);
  M.npc('rest', 24, 12, 'cook', 'up', null, { script: 'restfree', note: 'free tea stand' });
  // the button carter waits by his load on the Hemline bank, off the road
  M.npc('cart', 4, 8, 'villager_m2', 'down', ['This cart\'s full of buttons for Seamstead, and the city goes through three thousand a day!\\pI\'d paddle them over, but buttons sink. I checked. I lost eleven.']);
  M.pickup('islet', 10, 15, 'silk_spool', 2, 'on the reedy islet (paddle out to it)');
  M.def.props[M.def.props.length - 1].gate = 'paddle';
  M.pickup('cake', 27, 6, 'fancy_cake', 1);
  M.pickup('spool', 34, 18, 'bond_spool', 3);
  M.hidden('stump', 24, 6, 'wish_candy', 1, 'hidden candy');
  M.reg();
})(typeof globalThis !== 'undefined' ? globalThis : window);
