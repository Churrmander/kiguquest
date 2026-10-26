/* Crisp & Co. — the Society's department-store front. Four floors: 1 Linens (shop + exit), 2 Uniforms, 3 Hats (Staff Pass + locked door),
 * B1 Pressing Floor (rows of pressed white Kigu, the rival's dad, Pleat Serge, then Madame Damask's first appearance; she has the dad
 *  "transferred" north, so he stays pressed until the Starch Works).
 * Mechanic: keyDoor (Staff Pass) + stairs between floors. Raid flag: crisp_done. */
(function (root) {
  'use strict';
  const NP = root.NP, L = NP.levels;
  const T = (a) => L.team(a);

  /** one department-store floor. o: { id, name, w, h, up:'crisp_2', down:'crisp_1' } stairs: down at (1,2), up at (w-2,2). */
  function floor(o) {
    const w = o.w || 16, h = o.h || 12;
    const M = L.room({ id: o.id, name: o.name, w, h, doorX: (w >> 1) - 1, floor: 'floor_tile', wall: 'wall_plaster', music: 'society_theme', battleBg: 'society', recLevel: 18, exit: o.exit, carpet: o.carpet, carpetTerrain: 'carpet_red', legend: o.legend });
    if (!o.exit) M.rect(M.doorX, h - 1, 2, 1, 'W');
    if (o.down) { L.stairs(M, 1, 2, 'down', o.down, 'up'); }
    if (o.up) { L.stairs(M, w - 2, 2, 'up', o.up, o.upSpawn || 'down'); }
    M.spawn('down', 1, 3, 'down').spawn('up', w - 2, 3, 'down');
    return M;
  }
  // Every floor is laid out so the fixtures funnel you through a Presser's line of sight on the way to the next stairs (no sneaking
  // round the edge of the shop floor): tests/chapter3.test.mjs checks each one with a flood fill that avoids their sight lines.

  // ------------------------------------------------------------------------------------------ 1F Linens
  // A long run of linen display cases splits the floor. Its one gap is at the east wall, and Fold stands guard over the way to it.
  const f1 = floor({ id: 'crisp_1', name: 'Crisp & Co.  Linens', up: 'crisp_2', exit: { to: 'seamstead', door: 'crisp' }, carpet: [7, 8, 2, 3] });
  f1.stamp('display_case', 1, 7).stamp('display_case', 3, 7).stamp('display_case', 5, 7).stamp('display_case', 7, 7).stamp('display_case', 9, 7).stamp('display_case', 11, 7)
    .stamp('counter_l', 13, 7);
  f1.stamp('cloth_shelf', 3, 0, 'uniforms').stamp('cloth_shelf', 6, 0, 'uniforms').stamp('cloth_shelf', 9, 0, 'uniforms').stamp('counter_l', 3, 4).stamp('counter_m', 4, 4).stamp('counter_r', 5, 4)
    .stamp('mannequin', 9, 4, 'uniform').stamp('mannequin', 11, 4, 'uniform').stamp('plant', 1, 10).stamp('plant', 14, 10);
  f1.npc('clerk1', 4, 3, 'shopkeeper', 'down', null, { script: 'shopx', note: 'Crisp & Co. clerk (shared shop)' });
  f1.def.interact.push({ x: 3, y: 4, script: 'shopx' }, { x: 4, y: 4, script: 'shopx' }, { x: 5, y: 4, script: 'shopx' });
  f1.def.shopStock = ['snack_cake', 'fancy_cake', 'aloe_balm', 'mint_tea', 'numb_away'];
  f1.npc('greeter', 6, 9, 'tea_maid', 'right', ['Welcome to Crisp & Co.! Everything here is flat, and everything is fair!\\pZip says we\'re the most respectable store in town.\\pMay I just smooth your collar? ...There! Doesn\'t that look better?']);
  f1.trainer('c1_t1', 11, 8, 'grunt_f', 'right', { cls: 'Presser', name: 'Fold', sight: 3, reward: 9, ai: 1, music: 'battle_society', team: [['acolarva', 16], ['kittabra', 16]],
    intro: 'Customers must walk in straight lines. Yours is a squiggle, and we shall fix it.', win: 'The squiggle... won.', after: 'The stairs are up on the right. Walk straight, please.' });
  f1.reg();

  // ------------------------------------------------------------------------------------------ 2F Uniforms
  // Two rails of identical uniforms make a zig-zag: down the west aisle, up the middle past Pinch, then along the back wall past Lint.
  const f2 = floor({ id: 'crisp_2', name: 'Crisp & Co.  Uniforms', up: 'crisp_3', down: 'crisp_1' });
  for (let y = 2; y <= 8; y += 2) f2.stamp('mannequin', 4, y, 'uniform');                        // rail A: x4, y2-9 (gap at the bottom)
  for (let y = 3; y <= 9; y += 2) f2.stamp('mannequin', 8, y, 'uniform');                        // rail B: x8, y3-10 (gap at the top)
  f2.stamp('display_case', 9, 4).stamp('display_case', 11, 4).stamp('counter_l', 13, 4);   // the back-wall aisle (rows 2-3)
  f2.stamp('fold_table', 9, 6).stamp('fold_table', 12, 6).stamp('cloth_shelf', 9, 8, 'uniforms').stamp('cloth_shelf', 12, 8, 'uniforms').stamp('plant', 11, 9).stamp('plant', 14, 10);
  f2.stamp('cloth_shelf', 1, 0, 'uniforms').stamp('cloth_shelf', 6, 0, 'uniforms').stamp('cloth_shelf', 10, 0, 'uniforms');
  f2.trainer('c2_t1', 7, 9, 'grunt_m', 'left', { cls: 'Presser', name: 'Pinch', sight: 2, reward: 10, ai: 1, music: 'battle_society', team: [['kittabra', 17], ['acolarva', 17]],
    intro: 'Our uniforms only come in one size, and we call it Fine.\\pYou aren\'t Fine yet. Please try to be Fine.', win: 'I\'m not feeling Fine either.', after: 'There\'s a hat department up top. It\'s very... flat.' });
  f2.trainer('c2_t2', 14, 4, 'pleat', 'up', { cls: 'Presser', name: 'Lint', sight: 2, reward: 10, ai: 1, music: 'battle_society', team: [['acolarva', 17], ['scurrent|kittabra', 17]],
    intro: 'Staff only beyond this rack! ...Well, you can see that. Staff only anyway!', win: 'This is Staff Only, and you won anyway? Nobody trained me for this.', after: 'The Hats floor has the Staff Pass. Don\'t tell Serge I said so.' });
  f2.npc('shopper2', 2, 6, 'lady', 'right', ['They gave me a uniform. It fits. It fits perfectly.\\p...I didn\'t choose it. It fits perfectly.']);
  f2.reg();

  // ------------------------------------------------------------------------------------------ 3F Hats (Staff Pass; Staff Only door to B1)
  // Hat stands split the floor; Brim watches the only way round them. A partition wall closes off the stockroom at the back, and its
  // one way in is a real pair of steel STAFF ONLY doors (they swing open for the Staff Pass); the stairs down to B1 are behind them.
  const f3 = floor({ id: 'crisp_3', name: 'Crisp & Co.  Hats', down: 'crisp_2', carpet: [2, 3, 12, 1], legend: { D: 'floor_tile', X: 'wall_plaster' } });
  f3.rect(1, 7, 14, 2, 'W');                                                         // the stockroom partition
  f3.stamp('display_case', 1, 5).stamp('mannequin', 3, 4, 'uniform').stamp('display_case', 4, 5).stamp('display_case', 6, 5).stamp('mannequin', 9, 4, 'uniform').stamp('display_case', 10, 5);   // hat stands, row 5 (x8 is Brim's post; x12-14 is the way round)
  f3.stamp('cloth_shelf', 4, 0, 'uniforms').stamp('cloth_shelf', 9, 0, 'uniforms').stamp('plant', 14, 6).stamp('plant', 1, 6);
  for (const x of [1, 2, 3, 4, 9, 10, 11, 12]) f3.stamp('crate', x, 9);   // stockroom boxes along the partition (row 10 stays clear to the stairs)
  f3.gate('lock', { cells: [[6, 7], [7, 7], [6, 8], [7, 8]], closed: 'X', open: 'D', note: 'Staff Only door (needs staff_pass)', flag: 'crisp_lock_open' });
  f3.stamp('staff_door', 6, 7, 'closed');
  L.variantByFlag(f3.def.stamps[f3.def.stamps.length - 1], 'crisp_lock_open', 'closed', 'open');
  f3.def.onEnter = function* (c) { L.syncStamps(c); };
  f3.def.interact.push({ x: 6, y: 7, script: L.keyDoor('lock', 'staff_pass'), note: 'locked' }, { x: 7, y: 7, script: L.keyDoor('lock', 'staff_pass'), note: 'locked' });
  L.stairs(f3, 14, 10, 'down', 'crisp_b1', 'up'); f3.spawn('bstairs', 13, 10, 'left');   // stairs to the basement, in the stockroom
  f3.trainer('c3_t1', 8, 5, 'grunt_f', 'up', { cls: 'Presser', name: 'Brim', sight: 3, reward: 11, ai: 1, music: 'battle_society', team: [['kittabra', 18], ['acolarva', 18]],
    intro: 'Hats must sit level, and yours does not. I\'ll level it with a battle.', win: 'The hat is still not level. Neither am I.', after: 'Serge is in the basement. He smiles at everyone. It\'s... a lot.' });
  f3.npc('manager', 13, 6, 'gentleman', 'left', null, { script: function* (c) {
    if (NP.state.bag.staff_pass) { yield* c.sayT('crisp_3.manager.2', ['Manager: You have the pass. Please don\'t go downstairs.\\pI\'d stop you if I could. I just can\'t.\\pI haven\'t been able to stop anything in weeks.']); return; }
    yield* c.sayT('crisp_3.manager.1', ['Manager: ...You aren\'t wearing a Crisp & Co. uniform. Good.\\pThe basement is the Pressing Floor. I can\'t go down. I won\'t go down.\\pPlease, take my pass and bring them back up.']);
    yield* c.giveItem('staff_pass', 1);
  } });
  f3.reg();

  // ------------------------------------------------------------------------------------------ B1 Pressing Floor
  function* serge(c) {
    c.set('crisp_b1_seen');
    c.music('society_theme');
    yield* c.sayT('crisp_b1.serge.1', ['Rows of white Kigu stand in the dark, perfectly still.', 'Their costumes are pressed flat as paper. They\'re all smiling.']);
    yield* c.walk(c.npc('serge'), ['down', 2]);
    yield* c.sayT('crisp_b1.serge.2', ['Serge: Welcome to the Pressing Floor! Quality is consistency.\\pPlease mind your step. We don\'t walk here. We glide.', 'Serge: You\'re the Tailor who "rinsed" the shrine. We heard all about it.\\pDon\'t worry, nobody\'s hurt down here. They\'re simply resting.']);
    const won = yield* c.trainerBattle({ cls: 'Presser', name: 'Serge', look: 'pleat', ai: 2, reward: 20, music: 'battle_admin', team: T([['acolarva', 20], ['kittabra', 20], ['scurrent|kittabra', 21], ['spindra|acolarva', 21]]) });
    if (!won) { yield* c.sayT('crisp_b1.serge.lose', ['Serge: Oh, dear. Please go and rest upstairs.\\pI\'ll keep smiling until you come back.']); return; }
    c.set('crisp_serge_done');
    yield* c.sayT('crisp_b1.serge.win', ['Serge: ...Oh. I seem to have creased.\\pThat\'s a very strange feeling. I don\'t like it. I... don\'t mind it.']);
    c.music('city_seamstead');
    yield* c.sayT('crisp_b1.father.1', ['A man in a crisp uniform looks up. He\'s very pleasant, but his eyes look empty.', '{rival}\'s Dad: Good afternoon. Is it afternoon? ...I was folding sleeves.\\pI was thinking of my kid. What was their name? They had such a loud laugh.']);
    c.showNpc('damask');
    c.music('society_theme');
    yield* c.sayT('crisp_b1.damask.1', ['Damask: Splendid. A child who can crease a Pleat. How very rare.', 'Damask: I\'m Madame Damask. I don\'t fight children.\\pI press them flat with kindness, and it leaves no marks.']);
    yield* c.sayT('crisp_b1.damask.2', ['Damask: I should like you to come to tea, dear. Not today, but soon.\\pIt will be in the old harbour city, so bring your friend, and your stitches.\\pIt will be very quiet.', 'Damask: Serge, our floor manager is wanted up north. See that he\'s transferred.\\pAnd tidy this up. Gently.']);
    yield* c.walk(c.npc('damask'), ['right', 4]);
    c.hideNpc('damask');
    c.set('damask_tea');
    yield* c.sayT('crisp_b1.father.2', ['{rival}\'s Dad: Up north. Yes, that sounds very restful.', 'He folds his last sleeve, smooths his collar, and follows her out.']);
    c.hideNpc('father');
    c.music('city_seamstead');
    yield* c.sayT('crisp_b1.after.1', ['The pressed Kigu stand in their rows, eyes dim.\\pBut one by one, they turn to look at you.', 'Serge: ...Take them upstairs. Your friend with the rinse will know what to do.\\pI won\'t stop you. I think I\'ll go and make some tea.']);
    c.set('crisp_done');
    yield* c.sayT('crisp_b1.after.2', ['A name tag lies on the floor where {rival}\'s Dad stood.', 'It\'s perfectly straight. {player} keeps it safe for {rival}.']);
  }
  const b1 = floor({ id: 'crisp_b1', name: 'Crisp & Co.  Pressing Floor', w: 16, h: 12, up: 'crisp_3', upSpawn: 'bstairs' });
  // the one stairs cell is warped from crisp_3's side; this floor's own stairs go back up
  b1.def.triggers.push({ x: 7, y: 6, w: 2, h: 1, id: 'serge', when: (c) => !c.flag('crisp_serge_done'), script: serge });
  for (let i = 0; i < 4; i++) for (const y of [3, 9]) b1.npc('press_' + i + '_' + y, 3 + i * 3, y, 'cocoona_pressed', 'down', ['She\'s smiling at nothing, and she doesn\'t blink.'], { move: 'none' });
  b1.npc('serge', 7, 4, 'pleat', 'down', ['Serge: Everything is so calm down here. ...Isn\'t it?']);
  b1.npc('father', 12, 6, 'tailor_m', 'down', ['{rival}\'s Dad: I should go home soon, when the folding is done.']);
  b1.npc('damask', 14, 5, 'madame_damask', 'left', null, { hidden: true });
  b1.def.onEnter = function* (c) { if (c.flag('crisp_done')) c.hideNpc('father'); };   // he went north with Damask (freed at the Starch Works, Ch. 8)
  b1.reg();
})(typeof globalThis !== 'undefined' ? globalThis : window);
