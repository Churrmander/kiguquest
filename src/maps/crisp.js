/* Crisp & Co. — the Society's department-store front. Four floors: 1 Linens (shop + exit), 2 Uniforms, 3 Hats (Staff Pass + locked door),
 * B1 Pressing Floor (rows of pressed white Kigu, Tomo's father, Pleat Serge, then Madame Damask's first appearance).
 * Mechanic: keyDoor (Staff Pass) + stairs between floors. Raid flag: crisp_done. */
(function (root) {
  'use strict';
  const NP = root.NP, L = NP.levels;
  const T = (a) => L.team(a);

  /** one department-store floor. o: { id, name, w, h, up:'crisp_2', down:'crisp_1' } stairs: down at (1,2), up at (w-2,2). */
  function floor(o) {
    const w = o.w || 12, h = o.h || 11;
    const M = L.room({ id: o.id, name: o.name, w, h, doorX: (w >> 1) - 1, floor: 'floor_tile', wall: 'wall_plaster', music: 'society_theme', recLevel: 18, exit: o.exit, carpet: o.carpet, carpetTerrain: 'carpet_red', legend: o.legend });
    if (!o.exit) M.rect(M.doorX, h - 1, 2, 1, 'W');
    if (o.down) { L.stairs(M, 1, 2, 'down', o.down, 'up'); }
    if (o.up) { L.stairs(M, w - 2, 2, 'up', o.up, o.upSpawn || 'down'); }
    M.spawn('down', 1, 3, 'down').spawn('up', w - 2, 3, 'down');
    return M;
  }

  // ------------------------------------------------------------------------------------------ 1F Linens
  const f1 = floor({ id: 'crisp_1', name: 'Crisp & Co.  Linens', w: 12, h: 10, up: 'crisp_2', exit: { to: 'seamstead', door: 'crisp' }, carpet: [4, 3, 2, 6] });
  f1.stamp('cloth_shelf', 3, 0).stamp('cloth_shelf', 6, 0).stamp('display_case', 7, 4).stamp('mannequin', 8, 6).stamp('plant', 1, 6).stamp('table_s', 2, 4);
  f1.npc('clerk1', 5, 4, 'shopkeeper', 'down', null, { script: 'shopx', note: 'Crisp & Co. clerk (shared shop)' });
  f1.def.shopStock = ['snack_cake', 'fancy_cake', 'aloe_balm', 'mint_tea', 'numb_away'];
  f1.npc('greeter', 4, 8, 'tea_maid', 'up', ['Welcome to Crisp & Co.! Everything is flat! Everything is fair!\\pZip says we are the most respectable store in town.\\pMay I just smooth your collar? You look so much better.']);
  f1.trainer('c1_t1', 9, 5, 'grunt_f', 'left', { cls: 'Presser', name: 'Fold', sight: 3, reward: 9, ai: 1, music: 'battle_society', team: [['silkie', 16], ['mittsy', 16]],
    intro: 'Customers must walk in straight lines. Yours is a squiggle. We shall fix it.', win: 'The squiggle... won.', after: 'The stairs are up on the right. Walk straight. Please.' });
  f1.reg();

  // ------------------------------------------------------------------------------------------ 2F Uniforms
  const f2 = floor({ id: 'crisp_2', name: 'Crisp & Co.  Uniforms', w: 14, h: 10, up: 'crisp_3', down: 'crisp_1' });
  f2.stamp('mannequin', 4, 2).stamp('mannequin', 6, 2).stamp('mannequin', 8, 2).stamp('cloth_shelf', 10, 0).stamp('cloth_shelf', 4, 0).stamp('table_l', 5, 5);
  f2.trainer('c2_t1', 4, 6, 'grunt_m', 'right', { cls: 'Presser', name: 'Pinch', sight: 4, reward: 10, ai: 1, music: 'battle_society', team: [['mittsy', 17], ['silkie', 17]],
    intro: 'Our uniforms come in one size. We call it Fine.\\pYou are not Fine. Be Fine.', win: 'I am not feeling Fine either.', after: 'There is a hat department. It is very... flat.' });
  f2.trainer('c2_t2', 10, 6, 'pleat', 'left', { cls: 'Presser', name: 'Lint', sight: 3, reward: 10, ai: 1, music: 'battle_society', team: [['silkie', 17], ['sparkin|mittsy', 17]],
    intro: 'Staff only beyond this rack! ...Well, you can see that. Staff only anyway!', win: 'Staff Only, but you won. Nobody trained me for this.', after: 'The Hats floor has the Staff Pass. Do not tell Serge I said so.' });
  f2.npc('shopper2', 11, 3, 'lady', 'down', ['They gave me a uniform. It fits. It fits perfectly.\\p...I did not choose it. It fits perfectly.']);
  f2.reg();

  // ------------------------------------------------------------------------------------------ 3F Hats (Staff Pass; locked door to B1)
  const f3 = floor({ id: 'crisp_3', name: 'Crisp & Co.  Hats', w: 14, h: 10, down: 'crisp_2', legend: { D: 'floor_tile', X: 'fence' } });
  f3.stamp('mannequin', 5, 2).stamp('mannequin', 8, 2).stamp('display_case', 10, 4).stamp('cloth_shelf', 4, 0).stamp('cloth_shelf', 9, 0).stamp('plant', 12, 6);
  f3.gate('lock', { cells: [[1, 7], [2, 7], [3, 7], [4, 7], [5, 7], [6, 7], [7, 7], [8, 7], [9, 7], [10, 7], [11, 7], [12, 7]], closed: 'X', open: 'D', note: 'Staff Only door (needs staff_pass)', flag: 'crisp_lock_open' });
  f3.def.interact.push({ x: 11, y: 7, script: L.keyDoor('lock', 'staff_pass'), note: 'locked' }, { x: 12, y: 7, script: L.keyDoor('lock', 'staff_pass'), note: 'locked' });
  L.stairs(f3, 12, 8, 'down', 'crisp_b1', 'up'); f3.spawn('bstairs', 11, 8, 'left');   // stairs to the basement sit behind the lock (row 8 below row 7)
  f3.trainer('c3_t1', 6, 5, 'grunt_f', 'down', { cls: 'Presser', name: 'Brim', sight: 3, reward: 11, ai: 1, music: 'battle_society', team: [['mittsy', 18], ['silkie', 18]],
    intro: 'Hats must sit level. Yours is not level. I must level it. With a battle.', win: 'The hat is still not level. Neither am I.', after: 'Serge is in the basement. He smiles at everyone. It is... a lot.' });
  f3.npc('manager', 3, 6, 'gentleman', 'right', null, { script: function* (c) {
    if (NP.state.bag.staff_pass) { yield* c.sayT('crisp_3.manager.2', ['Manager: You have the pass. Please do not go downstairs.\\pI would stop you. I am not able to stop you.\\pI have not been able to stop anything in weeks.']); return; }
    yield* c.sayT('crisp_3.manager.1', ['Manager: ...You are not wearing a Crisp & Co. uniform. Good.\\pThe basement is Pressing Floor. I cannot go down. I will not go down.\\pTake my pass. Please. Bring them back up.']);
    yield* c.giveItem('staff_pass', 1);
  } });
  f3.reg();

  // ------------------------------------------------------------------------------------------ B1 Pressing Floor
  function* serge(c) {
    c.set('crisp_b1_seen');
    c.music('society_theme');
    yield* c.sayT('crisp_b1.serge.1', ['Rows of white Kigu stand in the dark, perfectly still.', 'Their costumes are pressed flat as paper. They are smiling.']);
    yield* c.walk(c.npc('serge'), ['down', 2]);
    yield* c.sayT('crisp_b1.serge.2', ['Serge: Welcome to the Pressing Floor! Quality is consistency.\\pPlease mind your step. We do not walk here. We glide.', 'Serge: You are the Tailor who "rinsed" the shrine. We heard.\\pDo not worry. Nobody is hurt here. They are simply resting.']);
    const won = yield* c.trainerBattle({ cls: 'Presser', name: 'Serge', look: 'pleat', ai: 2, reward: 20, music: 'battle_admin', team: T([['silkie', 20], ['mittsy', 20], ['sparkin|mittsy', 21], ['webelle|silkie', 21]]) });
    if (!won) { yield* c.sayT('crisp_b1.serge.lose', ['Serge: Oh, dear. Please go and rest upstairs.\\pI will keep smiling until you come back.']); return; }
    c.set('crisp_serge_done');
    yield* c.sayT('crisp_b1.serge.win', ['Serge: ...Oh. I seem to have creased.\\pThat is a very strange feeling. I do not like it. I... do not mind it.']);
    c.music('city_seamstead');
    yield* c.sayT('crisp_b1.father.1', ['A man in a crisp uniform looks up. He is pleasant. He is empty.', 'Tomo\'s Father: Good afternoon. Is it afternoon? ...I was folding sleeves.\\pI was thinking of my son. What was his name? He had such a loud voice.']);
    c.showNpc('damask');
    c.music('society_theme');
    yield* c.sayT('crisp_b1.damask.1', ['Damask: Splendid. A child who creases a Pleat. How rare.', 'Damask: I am Madame Damask. I do not fight children.\\pI press them flat with kindness. It leaves no marks.']);
    yield* c.sayT('crisp_b1.damask.2', ['Damask: I should like you to come to tea. Not today.\\pSoon. In the old harbour city. Bring your friend, and your stitches.\\pIt will be very quiet.', 'Damask: Serge. Tidy this up. Gently.']);
    yield* c.walk(c.npc('damask'), ['right', 4]);
    c.hideNpc('damask');
    c.set('damask_tea');
    c.music('city_seamstead');
    yield* c.sayT('crisp_b1.after.1', ['The pressed Kigu blink. One by one, they sit down, surprised.', 'Serge: ...They can go home. I suppose. I will make some tea.']);
    c.set('crisp_done');
    yield* c.sayT('crisp_b1.after.2', ['Tomo\'s Father: {rival}. That is his name. I remember it now.\\pTell him I am coming home.']);
  }
  const b1 = floor({ id: 'crisp_b1', name: 'Crisp & Co.  Pressing Floor', w: 16, h: 12, up: 'crisp_3', upSpawn: 'bstairs' });
  // the one stairs cell is warped from crisp_3's side; this floor's own stairs go back up
  b1.def.triggers.push({ x: 7, y: 6, w: 2, h: 1, id: 'serge', when: (c) => !c.flag('crisp_serge_done'), script: serge });
  for (let i = 0; i < 4; i++) for (const y of [3, 9]) b1.npc('press_' + i + '_' + y, 3 + i * 3, y, 'cocoona_pressed', 'down', ['It smiles at nothing. It does not blink.'], { move: 'none' });
  b1.npc('serge', 7, 4, 'pleat', 'down', ['Serge: Everything is so calm down here. ...Isn\'t it?']);
  b1.npc('father', 12, 6, 'tailor_m', 'down', ['Tomo\'s Father: I should go home. Soon. When the folding is done.']);
  b1.npc('damask', 14, 5, 'madame_damask', 'left', null, { hidden: true });
  b1.reg();
})(typeof globalThis !== 'undefined' ? globalThis : window);
