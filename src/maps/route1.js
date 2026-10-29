/* Route 1 — Meadow Lane: Button Town -> Basting Green (then Thimble Village).
 * Built from the approved Meadow Lane plan (2026-10-28): the old route plus Mimi sketching by the south flowers, a Snip tree with a
 * grotto behind it (3 Silk Spools) and a Paddle cove across the pond (3 Snack Cakes). Wild map: its trees can be shaken (treeShake). */
(function (root) {
  'use strict';
  const NP = root.NP, L = NP.levels;
  const W = 26, H = 40;

  // the plan's rows, verbatim. T treeline, . grass, p path, , tall grass, f flowers, w pond, d ledge (hop down only), s sand cove,
  // g grass under the grotto stamp (the stamp supplies the rock)
  const ROWS = [
    'TTTTTTT.....pp....TTTTTTTT',
    'TTTTTTT.....pp....TTTTTTTT',
    'TTT.........pp.........TTT',
    'TTT.........pp....wwwwwTTT',
    'TTT.........pp....wwwwwsTT',
    'TTT.........pp....wwwwwsTT',
    'TTTdddddddddppddddwwwwwTTT',   // Suzu's row: only the lane at x12-13 goes north
    'TTT.........pp.........TTT',
    'TTT.,,,,,,..pp.........TTT',
    'TTT.,,,,,,..pp.........TTT',
    'TTT.,,,,,,..pppp.......TTT',
    'TTT.,,,,,,..pppp.......TTT',
    'TTT.,,,,,,....pp,,,,,,.TTT',
    'TTT.,,,,fff...pp,,,,,,.TTT',
    'TTT.....fff...pp,,,,,,.TTT',
    'TTT...........pp,,,,,,.TTT',
    'TTT...........pp,,,,,,.TTT',
    'TTT...........pp,,,,,,.TTT',
    'TTTdddddddddddppdddddddTTT',   // Bo's row: only the lane at x14-15
    'TTT...........pp.......TTT',
    'TTT...pppppppppp.......TTT',
    'TTT...pppppppppp.......TTT',
    'TTT,,,pp.........,,,,,.TTT',
    'TTT,,,pp,,,,,,...,,,,,.TTT',
    'TTT,,,pp,,,,,,...,,,,,.TTT',
    'TTT,,,pp,,,,,,.ffff....TTT',
    'TTTdddppdddddddddddddd.TTT',   // Lia's row: only the lane at x6-7 (the bush at 22,26 plugs the east end)
    'TTT,,,pp,,,,,,.........TTT',
    'TTT...pp.......dddddd..TTT',
    'TTT...pp...............TTT',
    'TTT...pppppppp,,,,,,,..TTT',
    'TTT...pppppppp,,,,,,,..TTT',
    'TTT.........pp,,,,,,,..TTT',
    'TTT.....,,,.pp,,,,,,,..TTT',
    'TTT.....,,,.pp,,,,,,,..TTT',
    'TTT.....,,,.pp.........TTT',
    'TTT.....fff.pp.........TTT',
    'TTTTTTTTTTT.pp.TT.TTggTTTT',
    'TTTTTTTTTTT.pp.TT...ggTTTT',
    'TTTTTTTTTTT.pp.TTTTTTTTTTT',
  ];

  const M = L.map({
    id: 'route1', name: 'Route 1  Meadow Lane', music: 'route_meadow', battleBg: 'grass', border: 'treeline', w: W, h: H,
    view: 'street',   // 3D camera preset (street | town | flat-ish), see src/engine/persp.js
    legend: { '.': 'grass', T: 'treeline', p: 'path', ',': 'tallgrass', f: 'flowers', w: 'water', d: 'ledge_d', s: 'sand', g: 'grass' },
    // tree shake (approved 2026-10-28): Chirpadee common, Lyripip rare. The rare Lyripip is kept under-levelled to fit the route (open question for the owner: her level in the Ch1 balance pass).
    treeShake: [{ sp: 'chirpadee', min: 3, max: 5, w: 7 }, { sp: 'lyripip', min: 4, max: 5, w: 1 }],
  });
  M.ascii(0, 0, ROWS);

  // ---------------------------------------------------------------------------------------------------------- stamps
  M.sign(14, 37, 'MEADOW LANE\\nNorth: Basting Green, Thimble Village\\nSouth: Button Town');
  M.sign(11, 3, 'BASTING GREEN is just ahead!\\nThimble Village is a short walk past it.');
  M.trees([[4, 35], [9, 28], [17, 32], [20, 20], [10, 17], [3, 15], [19, 9], [8, 5], [16, 6], [4, 3]]);
  M.trees([[3, 30], [21, 35], [22, 26], [7, 7]], 'bush');
  M.stamp('boulder', 10, 11).stamp('rock', 18, 19).stamp('stump', 15, 3);
  // X1: the Snip tree in the south treeline (keeps stamp id 'bush' so c.snip / syncSnips / the maps.test field-move flood know it)
  M.stamp('bush', 17, 37, 'hedge_tree');
  // X2: the mossy grotto behind it, mouth on its west side at (20,38)
  M.stamp('grotto', 20, 37, 'west');

  // ---------------------------------------------------------------------------------------------------------- spawns and exits
  M.spawn('south', 12, 38, 'up')   // keep 'south' first (blackout.test); one row below the Mimi trigger so the first step fires it
    .spawn('north', 12, 2, 'down');
  M.warp({ xs: [12, 13], y: 39, to: 'button_town', spawn: 'north', sound: 'none' });
  M.warp({ xs: [12, 13], y: 0, to: 'basting_green', spawn: 'south', sound: 'none' });

  M.enc('grass', [
    ['chirpadee', 2, 4, 30], ['nibblit', 2, 4, 30],   // a Lv5 starter should win these comfortably
    ['kittabra', 3, 5, 25], ['acolarva', 3, 4, 10],
  ]);

  // ---------------------------------------------------------------------------------------------------------- items
  // raw props keep the old save flags (r1_cake r1_spool r1_sugar); M.pickup would rename them to got_route1_*
  const prop = (id, x, y, item, n, flag, gate) => {
    const p = { id, x, y, icon: 'item:' + item, hideIf: flag, script: function* (c) { c.set(flag); yield* c.giveItem(item, n, { found: true }); } };
    if (gate) p.gate = gate;
    M.def.props.push(p);
  };
  prop('item_cake', 4, 33, 'snack_cake', 1, 'r1_cake');
  prop('item_spool', 21, 15, 'bond_spool', 2, 'r1_spool');
  prop('item_sugar', 4, 12, 'sugar_cube', 1, 'r1_sugar');
  prop('item_grotto', 20, 38, 'silk_spool', 3, 'r1_grotto', 'snip');     // X2: just inside the grotto mouth, behind the Snip tree
  prop('item_cove', 23, 4, 'snack_cake', 3, 'r1_cove', 'paddle');        // X3: the sand cove across the pond
  M.def.props[M.def.props.length - 1].glint = true;                      // a sparkle so it's noticed from the west shore (plan X3)

  // X1: the Snip tree speaks for itself (the default bush text talks about a bush). Gone once it's cut.
  const SNIP_FLAG = 'snip:route1:17,37';
  M.def.interact.push({ x: 17, y: 37, note: 'Snip tree (needs disc_snip)', when: (c) => !c.flag(SNIP_FLAG), script: function* (c) {
    const b = c.map.placements.find((q) => q.id === 'bush' && q.x === 17 && q.y === 37);
    if (!b) return;
    if (!NP.state.bag.disc_snip) { yield* c.sayT('route1.sniptree.no', 'This tree looks like it could be snipped.'); return; }
    if (!(yield* c.ask('This tree looks like it could be snipped.\\nUse Snip?'))) return;
    NP.snd.sfx('leaf');
    c.map.removeStamp(b);
    NP.state.flags[SNIP_FLAG] = true;   // the same flag c.snip writes, so syncSnips re-applies the cut on every load
    yield* c.wait(10);
    yield* c.sayT('route1.sniptree.done', '{player}\'s Kigu used Snip and cut the tree down!');
  } });

  // ---------------------------------------------------------------------------------------------------------- people
  M.npc('hiker', 11, 36, 'elder_m', 'right', 'Tall grass is where wild Kigu nap in the sun.\\pWeaken one first, since a sleepy Kigu is much easier to befriend.');
  M.npc('kid', 9, 19, 'child_f', 'down', 'My Chirpadee learned Quick Dash!\\pNow she always gets to the snacks first.', { move: 'turn' });
  M.trainer('lia', 8, 25, 'tailor_f', 'left', { cls: 'Tailor', name: 'Lia', sight: 2, reward: 6, ai: 0, team: [['chirpadee', 3], ['nibblit', 3]],
    intro: 'You have a Kigu too? Let\'s compare stitches!', win: 'Oh! Your seams are tighter than mine.', after: 'My Chirpadee has forgiven you. I\'m still working on it.' });
  M.trainer('bo', 13, 17, 'net_kid', 'right', { cls: 'Net Kid', name: 'Bo', sight: 2, reward: 5, ai: 0, team: [['kittabra', 4]],
    intro: 'I befriended my Kittabra in this very grass!', win: 'She fell asleep on me...', after: 'Kittabra naps a lot, but she naps fiercely.' });
  M.trainer('suzu', 11, 5, 'picnicker', 'right', { cls: 'Picnicker', name: 'Suzu', sight: 2, reward: 6, ai: 1, team: [['sprubun', 4], ['chirpadee', 4]],
    intro: 'My picnic is over, so now it\'s battle time! Ready?', win: 'My sandwiches are going to get cold...', after: 'There\'s a Salon in Thimble with a real Master Tailor. Pack a snack first!' });

  // ---------------------------------------------------------------------------------------------------------- Mimi (plan MI)
  // Sketching a wild Chirpadee by the south flowers. The first time you walk in from Button Town (row 37) she spots you, comes over,
  // sketches your Kigu and gives you 3 Bond Spools. Then she's gone ahead to Thimble. Her lines are DRAFTS awaiting the owner's approval.
  const MIMI_FLAG = 'r1_mimi';
  function* mimiScene(c) {
    const m = c.npc('mimi_r1'), bird = c.npc('chirp_r1');
    const birdHere = !!(bird && bird.visible);   // read before the flag: the flag is the Chirpadee's hideIf
    c.set(MIMI_FLAG);
    if (!m || !m.visible) return;
    yield* c.emote(m, 'exclaim');
    if (birdHere) { if (NP.snd.cry) NP.snd.cry('chirpadee'); c.hideNpc('chirp_r1'); }   // the wild Chirpadee flies off
    yield* c.approach(m);   // she comes over first: from her spot the south treeline hides her in the 3D view
    yield* c.sayT('route1.mimi.1', 'Mimi: {player}! Oh no, the Chirpadee flew off. I\'d only drawn one of her wings!');
    yield* c.sayT('route1.mimi.2', 'Mimi: You got your very own Kigu! I\'ve been out here all morning drawing wild Kigu.\\pI\'m designing costumes for them, and this lane is full of good models.');
    const askT = NP.textOverride && NP.textOverride('route1.mimi.ask');
    if (yield* c.ask(askT ? askT.join(' ') : 'Mimi: Can I sketch {kigu}? I\'ll be really quick, I promise!')) {
      yield* c.sayT('route1.mimi.yes1', 'Mimi: Thank you! Just stay right there, {kigu}. You\'re doing great.');
      yield* c.emote(m, 'note');
      yield* c.wait(30);
      yield* c.sayT('route1.mimi.yes2', 'Mimi: Done! Look at that little collar. She\'d look so sweet in a costume with a hood.');
    } else {
      yield* c.sayT('route1.mimi.no', 'Mimi: That\'s okay! I\'ve got a good memory for faces, so I\'ll draw her later.');
    }
    yield* c.sayT('route1.mimi.4', 'Mimi: I\'m heading to Thimble Village next. There\'s a Master Tailor at the Salon there, and I\'m going to show her my designs!');
    yield* c.sayT('route1.mimi.5', 'Mimi: Oh, and take these. I packed far too many Bond Spools, and you\'ll need them more than I will.');
    yield* c.giveItem('bond_spool', 3);
    yield* c.sayT('route1.mimi.6', 'Mimi: Good luck in the tall grass, {player}! I\'ll see you in Thimble.');
    yield* c.walkTo(m, 7, 36);   // back to her sketchbook
    yield* c.face(m, 'right');
  }
  M.npc('mimi_r1', 7, 36, 'mimi', 'right', null, { hideIf: 'thimble_reached', note: 'Mimi sketching (Meadow Lane scene, then she goes ahead to Thimble)',
    script: function* (c) {
      if (!c.flag(MIMI_FLAG)) { yield* mimiScene(c); return; }   // you came from the north and walked straight up to her
      yield* c.sayT('route1.mimi.again', 'Mimi: I\'m just finishing this page, and then I\'m off to Thimble. Do you think the tailor will like my designs?');
    } });
  // the wild Chirpadee she's drawing, perched on the flowers; she flies off when Mimi spots you
  M.npc('chirp_r1', 8, 36, 'kigu:chirpadee', 'left', null, { hideIf: MIMI_FLAG, note: 'wild Chirpadee Mimi is sketching',
    script: function* (c, n) { if (NP.snd.cry) NP.snd.cry('chirpadee'); yield* c.emote(n, 'note'); } });
  // one-time scene trigger on the row you walk in on from Button Town (14,37 is the sign, so x11-13)
  M.trigger({ x: 11, y: 37, w: 3, h: 1, id: 'r1_mimi', when: (c) => !c.flag(MIMI_FLAG) && !c.flag('thimble_reached'), script: mimiScene });

  // ---------------------------------------------------------------------------------------------------------- Rival #1
  M.trigger({
    x: 3, y: 8, w: 20, h: 1, id: 'rival1', when: (c) => !c.flag('rival1_done'),
    script: function* (c) {
      const t = c.npc('tomo_r1');
      // he comes down the lane (x12-13, the only gap in Suzu's ledge row) and over to wherever you crossed the trigger row,
      // by an open path, so he never walks through water, trees or people
      c.placeNpc(t, c.player.x <= 12 ? 12 : 13, 4, 'down');
      c.showNpc('tomo_r1');
      yield* c.emote('player', 'exclaim');
      yield* c.say('{rival}: Hold it, {player}!');
      yield* c.approach(t);
      yield* c.say('{rival}: Thimble first, {player}? I\'ve been practising since the kite.\\pCome on, then. Show me your best, and I\'ll show you mine!');
      const rs = c.state.rivalStarter || 'ottopi';
      const won = yield* c.trainerBattle({ cls: 'Rival', name: '{rival}', look: 'rival', ai: 2, reward: 10, canLose: true, team: L.team([[rs, 5], ['chirpadee', 4]]) });
      c.set('rival1_done');
      if (won) yield* c.say('{rival}: Whoa! Okay, your Kigu are tougher than I thought.\\pNice one, {player}. I\'ll be right behind you in Thimble Village!');
      else yield* c.say('{rival}: Told you they were tough! But you were brilliant, {player}.\\pYou should rest up. Rematch at the Salon? Deal?');
      yield* c.leave(t, 4);
      c.hideNpc('tomo_r1');
    },
  });
  // the rival waits off-path until the trigger fires
  M.npc('tomo_r1', 13, 4, 'rival', 'down', '{rival}: ...', { hidden: true });

  M.reg();
})(typeof globalThis !== 'undefined' ? globalThis : window);
