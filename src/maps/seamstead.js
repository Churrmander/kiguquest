/* Seamstead City — big, bright, jazzy. Salon 3 (Zip, Volt), Tea House, General Store, Crisp & Co. department store, two houses.
 * Story: Rival #3 on the plaza; the Salon is dark until the Crisp & Co. raid is over (crisp_done). East gate (Route 4) comes in Ch. 4. */
(function (root) {
  'use strict';
  const NP = root.NP, L = NP.levels;
  const W = 36, H = 28;

  function* rival3(c) {
    c.set('rival3_started');
    yield* c.emote('player', 'exclaim');
    c.music('battle_rival');
    yield* c.sayT('seamstead.rival3.1', '{rival}: {player}! Over here! Look at this place. Look at it!\\pAnd that big white shop? Crisp & Co. My dad works there.\\pHe says they are the future of tailoring. Nothing ever creases. Nothing ever frays.');
    yield* c.sayT('seamstead.rival3.2', '{rival}: Mimi says the Society is bad. I say Mimi has not seen the Linens floor.\\pIf you want in, you go through me. Not because I am mean! Because I am proud of him!');
    const team = L.team([[L.evoStarter(c.state.rivalStarter), 18], ['sparkin|peepi', 16], ['kumi|mittsy', 16], ['silkie', 17]]);
    const won = yield* c.trainerBattle({ cls: 'Rival', name: '{rival}', look: 'tomo', ai: 2, reward: 18, team });
    c.set('rival3_done'); c.music('city_seamstead');
    if (won) yield* c.sayT('seamstead.rival3.win', '{rival}: ...Okay. Okay! You are good.\\pBut Crisp & Co. is not bad. You will see. My dad is on the Pressing Floor, in the basement.\\pHe has been there three weeks. He says it is "very restful".');
    else yield* c.sayT('seamstead.rival3.lose', '{rival}: Ha! Told you! Crisp & Co. is going to be the best thing that ever happened to this city!\\pGo rest your Kigu. Then come back and say that to my face.');
    c.set('crisp_open');
  }

  const M = L.map({
    id: 'seamstead', name: 'Seamstead City', music: 'city_seamstead', battleBg: 'grass', border: 'treeline', w: W, h: H,
    legend: { '.': 'grass', T: 'treeline', c: 'cobble', f: 'flowers', F: 'fence', p: 'path' },
    onEnter: function* (c) { if (c.flag('crisp_done')) { c.hideNpc('dark1'); c.hideNpc('dark2'); } },
  });
  M.trigger({ x: 10, y: 14, w: 1, h: 2, id: 'rival3', when: (c) => !c.flag('rival3_done'), script: rival3 });
  M.rect(0, 0, W, 2, 'T').rect(0, 26, W, 2, 'T').rect(0, 2, 2, 24, 'T').rect(W - 2, 2, 2, 24, 'T');
  M.rect(0, 14, W, 2, 'c');                                   // avenue: west = Route 3, east = Route 4 (Ch. 4)
  M.rect(13, 11, 10, 8, 'c');                                 // the plaza
  M.rect(16, 7, 2, 4, 'c').rect(5, 10, 2, 4, 'c').rect(28, 10, 2, 4, 'c');      // lanes to Salon / Tea / Store doors
  M.rect(11, 19, 2, 5, 'c').rect(24, 19, 2, 5, 'c').rect(3, 23, 30, 2, 'c');    // south lanes + back street
  M.rect(14, 4, 1, 1, 'f').rect(21, 8, 3, 1, 'f').rect(8, 17, 3, 1, 'f').rect(26, 17, 4, 1, 'f');
  M.rect(34, 14, 2, 2, 'F');                                  // east gate: closed until Chapter 4

  M.building('salon', 14, 2, 'volt', 'salon', 'seamstead_salon');
  M.building('tea_house', 4, 6, null, 'tea', 'seamstead_tea');
  M.building('general_store', 27, 6, null, 'store', 'seamstead_store');
  M.building('house_l', 15, 19, 'gray', 'crisp', 'crisp_1', { note: 'Crisp & Co. (department store)' });
  M.building('house_m', 5, 19, 'yellow', 'house1', 'seamstead_house1');
  M.building('house_s', 28, 20, 'pink', 'house2', 'seamstead_house2');

  M.sign(15, 10, 'SEAMSTEAD CITY\\nSalon: north of the plaza.', 'plaza sign');
  M.sign(3, 13, 'SEAMSTEAD CITY\\nWest: Route 3, Hemline', 'west sign');
  M.sign(32, 13, 'EAST: ROUTE 4\\nClosed for resurfacing. By order of the Society.', 'east sign (Ch. 4 opens this)');
  M.sign(21, 22, 'CRISP & CO.\\nEverything flat. Everything fair.\\nStaff entrance: basement.', 'Crisp & Co. sign');
  M.stamp('lamp', 12, 12).stamp('lamp', 23, 12).stamp('lamp', 12, 17).stamp('lamp', 23, 17).stamp('lamp', 8, 13).stamp('lamp', 30, 13);
  M.stamp('bench', 14, 17).stamp('bench', 21, 17).stamp('flowerbed', 16, 12).stamp('flowerbed', 19, 12).stamp('well', 17, 15);
  M.trees([[2, 9], [9, 6], [24, 4], [33, 8], [2, 18], [10, 22], [33, 19], [21, 5]]);
  M.stamp('barrel', 26, 10).stamp('crate', 31, 10).stamp('bush', 3, 22).stamp('bush', 32, 22);
  M.spawn('west', 2, 14, 'right').spawn('east', 33, 14, 'left');
  M.edge('w', 14, 15, 'route3', 'east');

  // the Salon is dark: two Presser "electricians" in white collars stand on the lane until the raid is done
  M.npc('dark1', 16, 8, 'grunt_m', 'down', ['Salon closed. The power is "being balanced".\\pBy the Society. For your benefit.\\pPlease move along. Gently.']);
  M.npc('dark2', 17, 8, 'grunt_f', 'down', ['Zip has been very loud lately. Noise is a crease in the air.\\pWe are smoothing it out.']);
  M.npc('jazz', 20, 13, 'rocker', 'left', ['Zip plays the main stage every night at seven!\\pAt least, she did. Last week the stage lights went out.\\pNobody knows why. Everyone is "so sure it is fine".'], { move: 'turn' });
  M.npc('shopper', 9, 16, 'lady', 'down', ['Crisp & Co. has a sale on everything that is flat.\\pIt is a very big sale.']);
  M.npc('kid', 26, 15, 'child_f', 'up', ['I went in with my mum. The Linens floor is so quiet.\\pThey said I could not run. I did not even want to run!\\p...I wanted to a little.'], { move: 'wander', range: 1 });
  M.npc('old', 22, 21, 'elder_m', 'right', ['I used to sew in the basement of that store.\\pBack when it was the Seamstead Thimble Hall.\\pNow it is "storage". Nobody I know has come out of it.']);
  M.npc('mimi_s', 19, 17, 'mimi', 'down', ['Mimi: A whole city and not one quiet corner!\\pI love it. Also I am nervous.\\pCrisp & Co. smells like fresh paper and nothing else. That is not normal.'], { hidden: false });
  M.pickup('cake', 31, 18, 'fancy_cake', 1);
  M.hidden('barrel_spool', 26, 10, 'silk_spool', 1, 'silk spool in a barrel');
  M.reg();

  L.tea({ id: 'seamstead_tea', exit: { to: 'seamstead', door: 'tea' }, guests: [
    { id: 'g1', x: 7, y: 6, look: 'artist', dir: 'left', say: ['Seamstead tea comes with jazz.\\pThe jazz comes whether you like it or not.'] },
    { id: 'g2', x: 2, y: 5, look: 'gentleman', dir: 'right', say: ['I work at Crisp & Co. in the Uniforms department.\\pThe tea here tastes of something. At work, tea tastes of... nothing.'] },
  ] }).reg();
  L.store({ id: 'seamstead_store', exit: { to: 'seamstead', door: 'store' },
    stock: ['bond_spool', 'silk_spool', 'snack_cake', 'fancy_cake', 'aloe_balm', 'mint_tea', 'wake_bell', 'numb_away', 'scent_spray', 'thread_ball', 'revive_tea'],
    gated: [{ badges: 3, items: ['gold_spool'] }],
    guests: [{ id: 'shopper', x: 7, y: 5, look: 'villager_f1', dir: 'left', say: ['The Gold Spools are behind the counter.\\pThe clerk says: three Buttons. I say: that is a lot of Buttons.'] }] }).reg();
  L.room({ id: 'seamstead_house1', name: 'House', w: 9, h: 8, doorX: 3, exit: { to: 'seamstead', door: 'house1' } })
    .stamp('sewing_machine', 1, 2).stamp('table_l', 5, 3).stamp('bookshelf', 6, 0).stamp('plant', 1, 5)
    .npc('s1', 4, 5, 'tailor_f', 'left', ['I used to hem for Crisp & Co. Piece-rate. Then they switched to the Press.\\pThe Press does a hem in four seconds. I do one in four minutes.\\pBut mine has a story in it.']).reg();
  L.room({ id: 'seamstead_house2', name: 'House', w: 8, h: 7, doorX: 3, exit: { to: 'seamstead', door: 'house2' } })
    .stamp('bed', 6, 2).stamp('tv', 1, 2).stamp('rug_b', 3, 3)
    .npc('s2', 3, 2, 'villager_m1', 'down', ['Zip lives upstairs in the Salon. She plays through the wall.\\pI have never once complained.\\pNot once! ...Okay, twice.']).reg();
})(typeof globalThis !== 'undefined' ? globalThis : window);
