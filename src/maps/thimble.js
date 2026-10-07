/* Thimble Village + Tea House, General Store and Salon #1 (Master Poppy, Fluff). */
(function (root) {
  'use strict';
  const NP = root.NP, K = NP.mapkit;
  const team = (list) => list.map(([sp, lv]) => ({ sp, lv }));

  // ---- Rival #2: Tomo has just lost to Poppy and is waiting outside the Salon door
  function* rival2(c) {
    const t = c.npc('tomo_t');
    c.placeNpc(t, 12, 6, 'down'); // he stands in the doorway, so he blocks the way in
    c.showNpc('tomo_t');
    yield* c.face('player', 'up');
    yield* c.emote('player', 'exclaim');
    yield* c.sayT('thimble.rival2.1', '{rival}: {player}! You made it.\\pI just challenged Poppy. She beat me with cardigans. CARDIGANS!\\pBut I worked out her pattern, and now I am going to use it on you. Come on!');
    const won = yield* c.trainerBattle({ cls: 'Rival', name: '{rival}', look: 'tomo', ai: 2, reward: 14, team: team([[c.state.rivalStarter || 'ottopi', 9], ['peepi', 8], ['nibbi', 8]]) });
    c.set('rival2_done');
    if (won) yield* c.sayT('thimble.rival2.win', '{rival}: ...Fine. Poppy beat me, and you beat me. Two for two.\\pBut I am not done. I will train until my Kigu are as tough as a bridge plank!\\p...Speaking of bridges, the guards in the white collars are weirdly picky about planks. Whatever. Go on, Poppy is waiting.');
    else yield* c.sayT('thimble.rival2.lose', '{rival}: Ha! Poppy\'s cardigans were no match for me, and neither are you!\\pGo and rest your Kigu at the Tea House, then try again.');
    yield* c.face(t, 'up');
    yield* c.wait(12);
    c.hideNpc('tomo_t'); // steps back inside
  }

  // ---- the Starch Society's first appearance: an "inspection" of the village, right after the first Button
  function* inspection(c) {
    yield* c.wait(24);
    const a = c.npc('presser_s1'), b = c.npc('presser_s2'), pop = c.npc('poppy_out');
    const px = c.player.x, py = c.player.y;
    c.placeNpc(a, px, py + 7, 'up');
    c.placeNpc(b, px + 1, py + 7, 'up');
    c.showNpc('presser_s1'); c.showNpc('presser_s2');
    yield* c.jingleWait('j_encounter_society');
    c.music('society_theme');
    yield* c.face('player', 'down');
    yield* c.emote('player', 'exclaim');
    yield* c.walk(a, ['up', 6]);
    yield* c.walk(b, ['up', 6]);
    yield* c.sayT('thimble.inspect.1', 'Tuck: Attention, Thimble Village! By order of the Society for Tidy Living, this is a routine inspection.');
    yield* c.sayT('thimble.inspect.2', 'Fold: Please remain in line. Flat is fair!');
    yield* c.sayT('thimble.inspect.3', 'Tuck: Item one. The Salon banner hangs two degrees crooked.\\pItem two. This Tailor\'s Kigu has a loose thread on her sleeve.');
    yield* c.sayT('thimble.inspect.4', 'Fold: Loose threads become tangles, miss. Tangles become messes.\\pThe Society can press that right out. Free of charge!');
    yield* c.sayT('thimble.inspect.5', '{player}\'s Kigu tugged her sleeve away from the Presser.');
    yield* c.sayT('thimble.inspect.6', 'Tuck: Resisting an inspection? That is... untidy.\\pStay in line, Tailor!');
    const won = yield* c.trainerBattle({ cls: 'Presser', name: 'Tuck', look: 'grunt_m', ai: 1, reward: 8, music: 'battle_society', team: team([['mittsy', 8], ['silkie', 7]]) });
    if (won) {
      yield* c.sayT('thimble.inspect.win.1', 'Tuck: Flat is fair... flat is fair... I was only supposed to count planks.');
      yield* c.sayT('thimble.inspect.win.2', 'Fold: Please do not tell the Inspector. I would honestly rather be baking.');
    } else yield* c.sayT('thimble.inspect.lose', 'Tuck: Flat is fair! Move along, Tailor.');
    yield* c.sayT('thimble.inspect.4b', 'Tuck: Tidy Day is coming, Tailor. Everything in its place. Even you.\\pFall in, Fold.');
    yield* c.walk(a, ['down', 8]); // Fold follows a step behind
    c.hideNpc('presser_s1');
    yield* c.walk(b, ['down', 8]);
    c.hideNpc('presser_s2');
    c.music('town_thimble');
    // Poppy peeks out of the Salon
    c.placeNpc(pop, 12, 6, 'down');
    c.showNpc('poppy_out');
    yield* c.walk(pop, ['down', 1]);
    yield* c.sayT('thimble.inspect.poppy.1', 'Poppy: Oh my. The Society for Tidy Living.\\pThey used to be nothing but ribbon wardens, you know, tying lost children to their parents with matching ribbons.\\p...I wonder when matching became the point.');
    yield* c.sayT('thimble.inspect.poppy.2', 'Poppy: Thank you, {player}. Keep that handkerchief safe, and keep your seams loose enough to breathe!');
    yield* c.walk(pop, ['up', 1]);
    c.hideNpc('poppy_out');
    c.set('presser1_done');
  }

  const W = 26, H = 22;
  const g = K.grid(W, H, '.');
  K.rect(g, 0, 0, 2, H, 'T'); K.rect(g, W - 2, 0, 2, H, 'T'); K.rect(g, 0, 0, W, 2, 'T');
  K.rect(g, 0, 20, 10, 2, 'T'); K.rect(g, 16, 20, 10, 2, 'T');
  K.rect(g, 12, 6, 2, 16, 'c');                      // main road
  K.rect(g, 3, 7, 21, 2, 'c');                       // cross street
  K.rect(g, 22, 0, 2, 9, 'p');                       // road to Route 2 (closed until `route2_open`)
  K.rect(g, 21, 2, 1, 1, 'T');                       // seals the road beside the guards (the General Store walls the rest)
  K.rect(g, 3, 15, 6, 1, 'c'); K.rect(g, 17, 16, 7, 1, 'c');
  K.rect(g, 10, 10, 2, 2, 'c'); K.rect(g, 14, 10, 2, 2, 'c');
  K.rect(g, 3, 17, 4, 2, 'f'); K.rect(g, 19, 18, 4, 2, 'f'); K.rect(g, 8, 13, 3, 1, 'f');
  K.rect(g, 15, 13, 1, 4, 'F');

  K.reg({
    id: 'thimble', name: 'Thimble Village', music: 'town_thimble', battleBg: 'grass', border: 'treeline',
    legend: { '.': 'grass', T: 'treeline', c: 'cobble', p: 'path', f: 'flowers', F: 'fence' },
    rows: K.rows(g),
    stamps: [
      { id: 'tea_house', x: 3, y: 3, name: 'tea', to: 'tea_house' },
      { id: 'salon', x: 9, y: 2, variant: 'fluff', name: 'salon', to: 'salon' },
      { id: 'general_store', x: 17, y: 3, name: 'store', to: 'general_store' },
      { id: 'house_s', x: 3, y: 12, variant: 'yellow', name: 'house1', to: 'thimble_house1' },
      { id: 'house_m', x: 18, y: 12, variant: 'pink', name: 'house2', to: 'thimble_house2' },
      { id: 'sign', x: 11, y: 9, name: 'sign_v' }, { id: 'sign', x: 22, y: 5 },
      { id: 'lamp', x: 11, y: 7 }, { id: 'lamp', x: 15, y: 7 }, { id: 'well', x: 6, y: 9 }, { id: 'bench', x: 17, y: 9 },
      { id: 'cloth_line', x: 7, y: 13 }, { id: 'tree', x: 2, y: 10 }, { id: 'tree', x: 8, y: 18 }, { id: 'tree', x: 16, y: 18 }, { id: 'tree', x: 23, y: 10 },
      { id: 'flowerbed', x: 20, y: 9 }, { id: 'barrel', x: 8, y: 6 }, { id: 'crate', x: 16, y: 6 }, { id: 'windmill', x: 2, y: 16 },
    ],
    interact: [
      { x: 11, y: 9, say: 'THIMBLE VILLAGE\\nWhere every stitch counts.' },
      { x: 22, y: 5, script: function* (c) {
        if (c.flag('route2_open')) yield* c.sayT('thimble.sign_r2.open', 'ROUTE 2  Licensed Tailors only.\\nPlanks uneven. Cross at your own risk.');
        else yield* c.sayT('thimble.sign_r2.closed', 'ROUTE 2  Closed\\nInspection in progress.\\nBy order of the Society for Tidy Living.');
      } },
    ],
    // Rival #2 ambushes anyone who steps up to the Salon door (12,7 is the only tile the door can be entered from; 13,7 is the road beside it)
    triggers: [{ x: 12, y: 7, w: 2, h: 1, id: 'rival2', when: (c) => !c.flag('rival2_done') && !c.flag('badge1'), script: rival2 }],
    // stepping back out of the Salon with the Button starts the Society's first inspection
    onEnter: function* (c) {
      if (c.flag('route2_open')) { c.hideNpc('guard1'); c.hideNpc('guard2'); }
      if (c.flag('badge1') && !c.flag('presser1_done')) yield* inspection(c);
    },
    spawns: { south: { x: 12, y: 19, dir: 'up' }, north: { x: 22, y: 1, dir: 'down' } },
    warps: [
      { xs: [12, 13], y: 21, to: 'route1', spawn: 'north', sound: 'none' },
      { xs: [22, 23], y: 0, to: 'route2', spawn: 'south', sound: 'none' },
    ],
    npcs: [
      { id: 'guard1', x: 22, y: 3, look: 'grunt_m', dir: 'down', hideIf: 'route2_open',
        script: function* (c) {
          if (!c.flag('presser1_done')) {
            yield* c.sayT('thimble.guard1.a', 'Halt! This bridge is under inspection by the Society for Tidy Living.\\pThe planks are uneven. Uneven planks are a hazard. Nobody crosses until every one is level.');
            return;
          }
          // after the first inspection: the guards stand down (once) and the road to Route 2 opens
          yield* c.sayT('thimble.guard1.b', ['...Hm. The village report says you are a licensed Tailor with a Button.\\pA licensed Tailor with a Button may cross at their own risk.\\pThe planks are uneven.']);
          yield* c.sayT('thimble.guard2.b', ['Please mind the third plank from the end, Tailor. It is... a little crooked.\\pWe have not had the heart to press it.\\pFlat is fair!']);
          const a = c.npc('guard1'), b = c.npc('guard2');
          yield* c.walk(a, ['up', 3]);
          c.hideNpc('guard1');
          yield* c.walk(b, ['up', 3]);
          c.hideNpc('guard2');
          c.set('route2_open');
        } },
      { id: 'guard2', x: 23, y: 3, look: 'grunt_f', dir: 'down', hideIf: 'route2_open',
        script: function* (c) { yield* c.sayT('thimble.guard2', 'Stay in line, please.\\p...Your collar is a little untidy. May I? ...There. Much better. Flat is fair!'); } },
      // cast for the Rival #2 and first-inspection scenes (hidden until their scripts place them)
      { id: 'tomo_t', x: 12, y: 6, look: 'tomo', dir: 'down', hidden: true, say: ['{rival}: ...'] },
      { id: 'presser_s1', x: 12, y: 14, look: 'grunt_m', dir: 'up', hidden: true, say: ['Flat is fair!'] },
      { id: 'presser_s2', x: 13, y: 14, look: 'grunt_f', dir: 'up', hidden: true, say: ['Stay in line, please.'] },
      { id: 'poppy_out', x: 12, y: 6, look: 'poppy', dir: 'down', hidden: true, say: ['Poppy: Every stitch counts!'] },
      { id: 'vf', x: 9, y: 11, look: 'villager_f2', dir: 'down', move: 'wander', range: 2, say: ['Master Poppy sews her Fluff Kigu tiny cardigans.\\pIt is too cute to battle against!'] },
      { id: 'kidf', x: 14, y: 12, look: 'child_f', dir: 'left', move: 'turn', say: ['If your Kigu is sleepy, the Tea House will fix her right up!'] },
      { id: 'eldm', x: 7, y: 11, look: 'elder_m', dir: 'right', say: ['This well has been here since the first seam was sewn.\\pThe water tastes like tea already.'] },
      { id: 'mimi', x: 13, y: 18, look: 'mimi', dir: 'up',
        script: function* (c) {
          if (!c.flag('mimi_gift')) {
            c.set('mimi_gift');
            yield* c.say('Mimi: Oh, {player}! You got your Kigu! Yay!\\pI found this spare Silk Spool on the way over. Here, you have it!');
            yield* c.giveItem('silk_spool', 1);
            yield* c.say('Mimi: Try to befriend something cute on Meadow Lane. I am rooting for you!');
          } else yield* c.say('Mimi: Good luck at the Salon! Poppy is super nice, but her Kigu are tough.');
        } },
    ],
  });

  // ------------------------------------------------------------------------------------ Tea House
  K.room({
    id: 'tea_house', name: 'Tea House', w: 11, h: 9, doorX: 4, floor: 'floor_wood', wall: 'wall_wood', music: 'tea_house', exit: { to: 'thimble', door: 'tea' },
    carpet: [3, 3, 4, 1], carpetTerrain: 'carpet_red',
    stamps: [
      { id: 'tea_healer', x: 4, y: 3 }, { id: 'pc_terminal', x: 9, y: 2 }, { id: 'table_s', x: 6, y: 5 }, { id: 'chair', x: 6, y: 6 },
      { id: 'window', x: 2, y: 1 }, { id: 'window', x: 7, y: 1 }, { id: 'plant', x: 1, y: 3 }, { id: 'plant', x: 9, y: 6 },
    ],
    interact: [
      { x: 4, y: 3, script: 'tea' }, { x: 5, y: 3, script: 'tea' }, { x: 9, y: 3, script: 'pc' },
    ],
    npcs: [
      { id: 'maid', x: 4, y: 2, look: 'tea_maid', dir: 'down', script: 'tea' },
      { id: 'tea_guest', x: 7, y: 6, look: 'lady', dir: 'left', say: ['The cocoa here is the best in Tsumugi.\\pI only wish Kigu could try the macarons too.'] },
    ],
  });

  // ---------------------------------------------------------------------------------- General Store
  const STOCK = ['bond_spool', 'snack_cake', 'fancy_cake', 'aloe_balm', 'mint_tea', 'wake_bell', 'numb_away', 'scent_spray'];
  K.room({
    id: 'general_store', name: 'General Store', w: 10, h: 8, doorX: 4, floor: 'floor_tile', wall: 'wall_plaster', exit: { to: 'thimble', door: 'store' },
    stamps: [
      { id: 'counter_l', x: 3, y: 3 }, { id: 'counter_m', x: 4, y: 3 }, { id: 'counter_r', x: 5, y: 3 },
      { id: 'shop_shelf', x: 1, y: 2 }, { id: 'shop_shelf', x: 2, y: 2 }, { id: 'shop_shelf', x: 7, y: 2 }, { id: 'shop_shelf', x: 8, y: 2 },
      { id: 'plant', x: 8, y: 5 },
    ],
    interact: [
      { x: 3, y: 3, script: 'shop' }, { x: 4, y: 3, script: 'shop' }, { x: 5, y: 3, script: 'shop' },
    ],
    shopStock: STOCK,
    npcs: [
      { id: 'clerk', x: 4, y: 2, look: 'shopkeeper', dir: 'down', script: 'shop' },
      { id: 'shopper', x: 7, y: 5, look: 'villager_f1', dir: 'left', say: ['Bond Spools sell out fast before festival season.\\pStock up if you plan to befriend anyone new!'] },
    ],
  });

  // --------------------------------------------------------------------------------------- Salon
  K.room({
    id: 'salon', name: 'Thimble Salon', w: 10, h: 12, doorX: 4, floor: 'floor_wood', wall: 'wall_plaster', music: 'town_thimble', battleBg: 'indoor',
    exit: { to: 'thimble', door: 'salon' },
    carpet: [4, 2, 2, 9], carpetTerrain: 'carpet_red',
    stamps: [
      { id: 'mannequin', x: 1, y: 2 }, { id: 'mannequin', x: 8, y: 2 }, { id: 'cloth_shelf', x: 1, y: 0 }, { id: 'cloth_shelf', x: 7, y: 0 },
      { id: 'sewing_machine', x: 1, y: 6 }, { id: 'sewing_machine', x: 8, y: 6 }, { id: 'window', x: 4, y: 1 }, { id: 'window', x: 5, y: 1 },
    ],
    npcs: [
      { id: 'poppy', x: 4, y: 3, look: 'poppy', dir: 'down', script: 'poppy' },
      { id: 'salon_t1', x: 5, y: 9, look: 'tailor_m', dir: 'left',
        trainer: { cls: 'Tailor', name: 'Ren', sight: 3, reward: 7, ai: 1, team: team([['nibbi', 5], ['mittsy', 5]]),
          intro: 'Poppy teaches us that every stitch counts. Show me yours!', win: 'Such neat work!', after: 'Poppy is at the back. Do not underestimate her Kigu.' } },
      { id: 'salon_t2', x: 4, y: 6, look: 'tailor_f', dir: 'right',
        trainer: { cls: 'Tailor', name: 'Noa', sight: 3, reward: 8, ai: 1, team: team([['peepi', 6], ['nibbi', 6]]),
          intro: 'Halt! Nobody reaches Poppy without sewing a line past me.', win: 'You threaded that one perfectly...', after: 'Go on, Poppy is waiting.' } },
    ],
  });
  NP.maps.salon.poppyTeam = team([['nibbi', 7], ['peepi', 8], ['mittsy', 9]]);

  // -------------------------------------------------------------------------------------- houses
  K.room({
    id: 'thimble_house1', name: 'House', w: 8, h: 7, doorX: 3, exit: { to: 'thimble', door: 'house1' },
    stamps: [{ id: 'bed', x: 6, y: 2 }, { id: 'tv', x: 1, y: 2 }, { id: 'rug_b', x: 3, y: 3 }],
    npcs: [{ id: 'h1', x: 3, y: 2, look: 'villager_f1', dir: 'down', say: ['My daughter has a Sprubun. The sprout on her head wilts when she skips breakfast!'] }],
  });
  K.room({
    id: 'thimble_house2', name: 'House', w: 9, h: 8, doorX: 3, exit: { to: 'thimble', door: 'house2' },
    stamps: [{ id: 'bookshelf', x: 1, y: 0 }, { id: 'table_l', x: 4, y: 3 }, { id: 'fridge', x: 7, y: 1 }],
    npcs: [{ id: 'h2', x: 2, y: 4, look: 'elder_f', dir: 'right', say: ['I sewed the flags for the Tea House myself.\\pThe heart one took three whole weekends.'] }],
  });
})(typeof globalThis !== 'undefined' ? globalThis : window);
