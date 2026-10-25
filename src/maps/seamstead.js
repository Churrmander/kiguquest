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
    yield* c.sayT('seamstead.rival3.1', '{rival}: {player}! Over here! Look at this place.\\pAnd that big white shop? Crisp & Co. My dad works there.\\pHe says they are the future of tailoring. Nothing ever creases.');
    yield* c.sayT('seamstead.rival3.2', '{rival}: Mimi says the Society is bad. She has never seen the Linens floor.\\pI have. It is so clean, and so quiet.\\pIf you want in, you will have to get past me first.\\pNot because I am mean! I am just proud of my dad.');
    // owner's rule: the rival's starter is weak to yours, but one teammate hits your starter hard, so switching pays off
    // without being forced (a Tide Kigu against Ember, Volt against Tide, Gale against Sprout)
    const counter = { konko: 'ribbi', ottopi: 'sparkin|ribbi', sprubun: 'larkette|peepi' }[c.state.starter] || 'sparkin|peepi';
    const team = L.team([[L.evoStarter(c.state.rivalStarter), 18], [counter, 17], ['kumi|mittsy', 16], ['silkie', 16]]);
    const won = yield* c.trainerBattle({ cls: 'Rival', name: '{rival}', look: 'rival', ai: 2, reward: 18, canLose: true, team });
    c.set('rival3_done'); c.music('city_seamstead');
    if (won) yield* c.sayT('seamstead.rival3.win', '{rival}: ...Okay, okay! You beat me fair and square.\\pYou are really good, {player}. Really good.\\pBut Crisp & Co. is not bad. You will see.\\pMy dad has been in the basement three weeks. He says it is "very restful".\\pHe sounds... far away, sometimes.\\pOh, and Dad says the whole city\'s power runs through that basement now.\\pEven the Salon lights. Funny, right? They have been off all week.');
    else yield* c.sayT('seamstead.rival3.lose', '{rival}: I won? I actually won! Go rest your Kigu, {player}.\\pCome with me to Crisp & Co. one day. Dad would love to meet you.');
    c.set('crisp_open');
  }

  // ---- after the Crisp & Co. raid: Serge comes out and tells {rival} about Dad himself, plainly. The hero hands over the name tag,
  //      Mimi brings snack cakes (and takes the pressed Kigu as her first big Soft Rinse job), and {rival} goes to watch the lights.
  function* aftermath(c) {
    c.set('crisp_after');
    const px = c.player.x, py = c.player.y;
    const r = c.npc('rival_s'), s = c.npc('serge_s'), m = c.npc('mimi_s');
    yield* c.wait(12);
    c.placeNpc(r, px - 4, py + 1, 'right');   // along the back street from the west
    c.showNpc('rival_s');
    yield* c.walk(r, ['right', 4]);
    yield* c.face(r, 'up');
    yield* c.sayT('seamstead.after.1', '{rival}: {player}! I heard the alarms from across the plaza.\\pIs everyone okay? Did you see my dad in there?');
    c.placeNpc(s, px + 1, py, 'down');
    NP.snd.sfx('door');
    c.showNpc('serge_s');
    yield* c.face('player', 'right');
    yield* c.sayT('seamstead.after.2', 'Serge: You must be {rival}. You have his laugh. He spoke of it, before.\\pYou deserve plain words, so here they are.');
    yield* c.face(s, 'down');
    yield* c.sayT('seamstead.after.3', 'Serge: Your father has been transferred north. Madame Damask took him.\\pHe is pressed, but he is not hurt. Pressing can be undone.');
    yield* c.sayT('seamstead.after.4', 'Serge: I filled in the forms myself. I am sorry.\\pI am finding out that sorry is a very creased word.');
    yield* c.walk(s, ['right', 4]);
    c.hideNpc('serge_s');
    yield* c.face('player', 'down');
    yield* c.sayT('seamstead.after.5', '{rival}: Transferred. North.\\p...He always hated the cold.');
    yield* c.sayT('seamstead.after.6', "{player} held out the name tag from the Pressing Floor.");
    yield* c.sayT('seamstead.after.7', '{rival}: His name tag. Thank you for keeping it safe.\\pHe always kept his tags straight. Even at home.');
    c.placeNpc(m, px - 1, py + 2, 'right');
    c.showNpc('mimi_s');
    yield* c.sayT('seamstead.after.8', 'Mimi: I brought snack cakes. Nobody has to talk.\\pYou can just eat one. That is allowed.');
    yield* c.sayT('seamstead.after.9', '{rival} took a cake. A very small smile.');
    yield* c.sayT('seamstead.after.10', 'Mimi: And those pressed Kigu downstairs? Leave them to me and my Soft Rinse.\\pMy first big job! I will sketch them a costume each while they dry.');
    yield* c.sayT('seamstead.after.11', '{rival}: You do not have to stay, {player}. I am okay. ...Okay enough to walk.\\pZip\'s Salon should be open now. Go on. I want to see the lights come on.');
    yield* c.walk(r, ['left', 5, 'up', 4]);
    c.hideNpc('rival_s');
    c.placeNpc(m, 19, 17, 'down');
  }

  const M = L.map({
    id: 'seamstead', name: 'Seamstead City', music: 'city_seamstead', battleBg: 'city', border: 'treeline', w: W, h: H,
    view: 'street',   // 3D camera preset (street | town | flat-ish), see src/engine/persp.js
    legend: { '.': 'grass', T: 'treeline', c: 'cobble', f: 'flowers', F: 'fence', p: 'path' },
    onEnter: function* (c) {
      if (c.flag('crisp_done')) { c.hideNpc('dark1'); c.hideNpc('dark2'); }
      if (c.flag('crisp_done') && !c.flag('crisp_after') && !c.flag('badge3') && c.player.y > 20) yield* aftermath(c);   // just out of Crisp & Co.
    },
  });
  M.trigger({ x: 10, y: 2, w: 1, h: 24, id: 'rival3',   // the whole column, so the rival can't be walked round on the grass
    when: (c) => !c.flag('rival3_done'), script: rival3 });
  M.def.cameraZones = [{ x: 26, y: 0, w: 10, h: H, camera: 1 }];   // 3D view swings east as you approach the Route 4 gate
  M.rect(0, 0, W, 2, 'T').rect(0, 26, W, 2, 'T').rect(0, 2, 2, 24, 'T').rect(W - 2, 2, 2, 24, 'T');
  M.rect(0, 14, W, 2, 'c');                                   // avenue: west = Route 3, east = Route 4 (Ch. 4)
  M.rect(13, 11, 10, 8, 'c');                                 // the plaza
  M.rect(16, 7, 2, 4, 'c').rect(5, 10, 2, 4, 'c').rect(28, 10, 2, 4, 'c');      // lanes to Salon / Tea / Store doors
  M.rect(11, 19, 2, 5, 'c').rect(24, 19, 2, 5, 'c').rect(3, 23, 30, 2, 'c');    // south lanes + back street
  M.rect(14, 4, 1, 1, 'f').rect(21, 8, 3, 1, 'f').rect(8, 17, 3, 1, 'f').rect(26, 17, 4, 1, 'f');
  M.rect(34, 14, 2, 2, 'F');                                  // east gate: closed until Chapter 4
  M.rect(15, 7, 1, 2, 'F').rect(18, 7, 1, 2, 'F');            // railings beside the Salon lane, so the two Pressers really do block it

  M.building('salon', 14, 2, 'volt', 'salon', 'seamstead_salon');
  M.building('tea_house', 4, 6, null, 'tea', 'seamstead_tea');
  M.building('general_store', 27, 6, null, 'store', 'seamstead_store');
  M.building('house_l', 15, 19, 'gray', 'crisp', 'crisp_1', { note: 'Crisp & Co. (department store)' });
  M.building('house_m', 5, 19, 'yellow', 'house1', 'seamstead_house1');
  M.building('house_s', 28, 20, 'pink', 'house2', 'seamstead_house2');

  M.sign(15, 10, 'SEAMSTEAD CITY\\nBursting at the seams!\\pSalon: north of the plaza.', 'plaza sign');
  M.sign(3, 13, 'SEAMSTEAD CITY\\nWest: Route 3, Hemline', 'west sign');
  M.stamp('sign', 32, 13);
  function* eastGate(c) {
    yield* c.sayT('seamstead.sign_east', 'EAST: ROUTE 4\\nClosed for resurfacing. By order of the Society.');
    if (c.flag('badge3')) yield* c.sayT('seamstead.sign_east.end', 'This is as far as the playtest build goes. Route 4 opens in Chapter 4.\\pThanks for playing!');
  }
  // the sign, and the gate itself when you bump into it; after the Volt Button they mark the end of the playtest build
  M.def.interact.push({ x: 32, y: 13, script: eastGate, note: 'east sign (Ch. 4 opens this)' }, { x: 34, y: 14, script: eastGate, note: 'east gate' }, { x: 34, y: 15, script: eastGate, note: 'east gate' });
  M.sign(21, 22, 'CRISP & CO.\\nEverything flat. Everything fair.\\pStaff only. Ask on the top floor.', 'Crisp & Co. sign');
  M.stamp('lamp', 12, 12).stamp('lamp', 23, 12).stamp('lamp', 12, 17).stamp('lamp', 23, 17).stamp('lamp', 8, 12).stamp('lamp', 30, 12);
  M.stamp('bench', 14, 17).stamp('bench', 21, 17).stamp('flowerbed', 16, 12).stamp('flowerbed', 19, 12).stamp('well', 17, 15);
  M.trees([[2, 9], [9, 6], [24, 4], [33, 8], [2, 18], [10, 22], [33, 19], [21, 5]]);
  M.stamp('barrel', 26, 10).stamp('crate', 31, 10).stamp('bush', 3, 22).stamp('bush', 32, 22);
  M.spawn('west', 2, 14, 'right').spawn('east', 33, 14, 'left');
  M.edge('w', 14, 15, 'route3', 'east');

  // the Salon is dark: two Presser "electricians" in white collars stand on the lane until the raid is done
  // round 4: they say plainly where the switch is, so the player knows Crisp & Co. is the way to the Salon (gatekeeping rule)
  M.npc('dark1', 16, 8, 'grunt_m', 'down', ['Salon closed. The power is "being balanced".\\pBy the Society. For your benefit.',
    'The switch? It is in the Crisp & Co. basement, Tailor.\\pStaff only. Customers never go down there.\\pSo the lights stay off. Flat is fair!']);
  M.npc('dark2', 17, 8, 'grunt_f', 'down', ['Zip has been very loud lately. Noise is a crease in the air.\\pWe are smoothing it out.',
    'You want to see Zip? You will not get past us.\\pNot unless head office at Crisp & Co. says so.\\pAnd head office never says so.']);
  M.npc('jazz', 20, 13, 'rocker', 'left', ['Zip plays the main stage every night at seven!\\pAt least, she did. Last week the stage lights went out.\\pThe same night Crisp & Co. ran a big white cable\\pfrom its basement to the Salon. Nobody thinks that is odd.'], { move: 'turn' });
  M.npc('shopper', 9, 16, 'lady', 'down', ['Crisp & Co. has a sale on everything that is flat.\\pIt is a very big sale.']);
  M.npc('kid', 26, 15, 'child_f', 'up', ['I went in with my mom. The Linens floor is so quiet.\\pThey said I could not run. I did not even want to run!\\p...I wanted to. A little.'], { move: 'wander', range: 1 });
  M.npc('old', 22, 21, 'elder_m', 'right', ['I used to sew in the basement of that store.\\pBack when it was the Seamstead Thimble Hall.\\pNow it is "storage". Nobody I know has come up sounding like themselves.']);
  M.npc('peddler', 6, 16, 'gentleman', 'right', ['Ahoy! Mr. Sharp, humble peddler. Nothing suspicious at all.\\pThis cap? A sailor gave it to me. Or I gave it to a sailor.\\pKeep your eyes sharp, friend!']);
  M.npc('mimi_s', 19, 17, 'mimi', 'down', null, { hidden: false, script: function* (c) {
    if (c.flag('crisp_done')) { yield* c.sayT('seamstead.mimi_s.after', 'Mimi: The lights are back! Zip will be warming up.\\pGo on, {player}. I will cheer from the plaza.'); return; }
    yield* c.sayT('seamstead.mimi_s.1', 'Mimi: A whole city and not one quiet corner!\\pI love it. Also I am nervous.\\pCrisp & Co. smells like fresh paper and nothing else. That is not normal.');
    yield* c.sayT('seamstead.mimi_s.2', 'Mimi: Did you see the Salon? Dark, with two Pressers on the door.\\pThey said the switch is down in the Crisp & Co. basement.\\pIf we want Zip\'s lights back, that is where we have to go.');
  } });
  // cast for the after-raid scene and Zip's lights (hidden until their scripts place them)
  M.npc('rival_s', 12, 24, 'rival', 'up', ['{rival}: ...'], { hidden: true });
  M.npc('serge_s', 13, 24, 'pleat', 'down', ['Serge: ...'], { hidden: true });
  M.npc('zip_s', 18, 12, 'zip|rocker', 'down', ['Zip: Lamp by lamp!'], { hidden: true });
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
    .npc('s1', 4, 5, 'tailor_f', 'left', ['I used to hem for Crisp & Co., by the piece.\\pThen they switched to the Press. It does a hem in four seconds.\\pI do one in four minutes. But mine has a story in it.']).reg();
  L.room({ id: 'seamstead_house2', name: 'House', w: 8, h: 7, doorX: 3, exit: { to: 'seamstead', door: 'house2' } })
    .stamp('bed', 6, 2).stamp('tv', 1, 2).stamp('rug_b', 3, 3)
    .npc('s2', 3, 2, 'villager_m1', 'down', ['Zip lives upstairs in the Salon. She plays through the wall.\\pI have never once complained.\\pNot once! ...Okay, twice.']).reg();
})(typeof globalThis !== 'undefined' ? globalThis : window);
