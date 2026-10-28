/* Thimble Village + Tea House, General Store and Salon #1 (Master Poppy, Fluff).
 * Plan: Thimble v12 (30 x 22, rows A-V), approved 2026-10-28. A paved village square with the Big Thimble fountain dead centre
 * (benches, planters, notice board, Mr. Sharp's cart), a little farm in the east corner, and window flower boxes on every door.
 * Poppy's yarn basket sits in the square with a Kittabra napping on it, and can only be taken once Poppy has asked for it.
 * Mimi is in the Salon on the first visit (scene 1), waits outside, and backs your Kigu after the Society's inspection (scene 2). */
(function (root) {
  'use strict';
  const NP = root.NP, K = NP.mapkit, L = NP.levels;

  /** the direction from actor a towards actor b (the one a should face to look at b) */
  const toward = (a, b) => {
    const dx = b.x - a.x, dy = b.y - a.y;
    return Math.abs(dx) >= Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up');
  };

  // ---- Rival #2: the rival has just lost to Poppy and is waiting outside the Salon door. Conversation only: Rival #1 (Route 1) is the only
  //      rival fight before the first Salon, so the player is never forced into two rival battles in a row on low HP.
  //      rival2.3 (the lab snack-cake bet paid off) and rival2.basket are drafts awaiting the owner's OK.
  function* rival2(c) {
    const t = c.npc('tomo_t');
    c.placeNpc(t, 12, 6, 'down'); // they stand in the doorway, so they block the way in
    c.showNpc('tomo_t');
    yield* c.face('player', 'up');
    yield* c.emote('player', 'exclaim');
    yield* c.sayT('thimble.rival2.1', '{rival}: {player}! You made it.\\pI just challenged Poppy. She beat me with cardigans. CARDIGANS!');
    yield* c.sayT('thimble.rival2.2', '{rival}: My Kigu are way too sleepy to battle now, and honestly, so am I.\\pBut I took notes!');
    yield* c.sayT('thimble.rival2.3', '{rival}: Her Fluff Kigu are a lot tougher than they look.\\pDon\'t let them tuck you in for a nap.\\pAnd I got here first, so you know the rule. Last one there carries the snack cakes!\\pMum packed far too many anyway.');
    yield* c.giveItem('snack_cake', 3);
    c.set('rival2_done');
    if (!c.flag('yarn_basket')) yield* c.sayT('thimble.rival2.basket', '{rival}: Oh! And there\'s a Kittabra fast asleep on a basket of yarn in the square.\\pI tried to say hello, and she didn\'t even open one eye.');
    yield* c.sayT('thimble.rival2.win', '{rival}: Next time we meet, I\'ll have a proper plan, and it\'ll be a great one.\\pGo on, {player}. Poppy\'s waiting, and you\'re going to be brilliant.');
    yield* c.face(t, 'up');
    yield* c.wait(12);
    c.hideNpc('tomo_t'); // steps back inside
  }

  // ---- the Starch Society's first appearance: an "inspection" of the village, right after the first Button. Tuck and Fold march in
  //      along the main street from the west (they used to come up the south road, which now runs through the Big Thimble), then Mimi
  //      runs over before Poppy steps out of the Salon.
  function* inspection(c) {
    yield* c.wait(24);
    const a = c.npc('presser_s1'), b = c.npc('presser_s2'), pop = c.npc('poppy_out');
    const px = c.player.x, py = c.player.y;
    c.placeNpc(a, px - 6, py, 'right');
    c.placeNpc(b, px - 6, py + 1, 'right');
    c.showNpc('presser_s1'); c.showNpc('presser_s2');
    yield* c.jingleWait('j_encounter_society');
    c.music('society_theme');
    yield* c.face('player', 'left');
    yield* c.emote('player', 'exclaim');
    yield* c.walk(a, ['right', 5]);
    yield* c.walk(b, ['right', 5]);
    yield* c.sayT('thimble.inspect.1', 'Tuck: Attention, Thimble Village!\\pBy order of the Society for Tidy Living, this is a routine inspection.');
    yield* c.sayT('thimble.inspect.2', 'Fold: Please remain in line. Flat is fair!');
    yield* c.sayT('thimble.inspect.3', 'Tuck: Item one: the Salon banner is hanging two degrees crooked.\\pItem two: this Tailor\'s Kigu has a loose thread on her sleeve.');
    yield* c.sayT('thimble.inspect.4', 'Fold: Loose threads become tangles, Tailor, and tangles become messes.\\pThe Society can press that right out, free of charge!');
    yield* c.sayT('thimble.inspect.5', '{player}\'s Kigu tugged her sleeve away from the Presser.');
    yield* c.sayT('thimble.inspect.6', 'Tuck: Resisting an inspection? That is... untidy.\\pStay in line, Tailor!');
    // levels are placeholders for the one-pass Chapter 1 retune ("apprentices and Tuck raised")
    const won = yield* c.trainerBattle({ cls: 'Presser', name: 'Tuck', look: 'grunt_m', ai: 1, reward: 8, music: 'battle_society', canLose: true, team: L.team([['kittabra', 12], ['acolarva', 11]]) });
    if (won) {
      yield* c.sayT('thimble.inspect.win.1', 'Tuck: Flat is fair... flat is fair... I was only supposed to count planks.');
      yield* c.sayT('thimble.inspect.win.2', 'Fold: Please don\'t tell the Inspector.\\pI\'d honestly rather be baking.');
    } else yield* c.sayT('thimble.inspect.lose', 'Tuck: Flat is fair! Move along, Tailor.');
    yield* c.sayT('thimble.inspect.4b', 'Tuck: Tidy Day went beautifully. Next year we\'ll fold the whole village.\\pFall in, Fold.');
    yield* c.walk(a, ['left', 8]); // Fold follows a step behind
    c.hideNpc('presser_s1');
    yield* c.walk(b, ['left', 8]);
    c.hideNpc('presser_s2');
    c.music('town_thimble');
    // Mimi scene 2: she has been waiting by the Salon door and runs over before Poppy comes out
    const mi = c.npc('mimi');
    const mimiHere = mi && mi.visible;
    if (mimiHere) {
      yield* c.approach(mi);
      yield* c.sayT('thimble.inspect.mimi', 'Mimi: Did you hear him? A loose thread just means she\'s been out having fun. I\'d never press that out of anyone.');
    }
    // Poppy steps out of the Salon doorway, just above the player
    c.placeNpc(pop, 12, 6, 'down');
    NP.snd.sfx('door');
    c.showNpc('poppy_out');
    yield* c.face('player', toward(c.player, pop));
    yield* c.sayT('thimble.inspect.poppy.1', 'Poppy: Oh my. So that was the Society for Tidy Living.\\pDid you know they started out as ribbon wardens?\\pThey used to tie lost children to their parents with matching ribbons.\\p...I wonder when the matching became the point.');
    yield* c.sayT('thimble.inspect.poppy.2', 'Poppy: Thank you, {player}.\\pKeep that handkerchief safe, and keep your seams loose enough to breathe!');
    c.hideNpc('poppy_out');
    NP.snd.sfx('door');
    // Mimi heads off east along the main street before the flag is set (her hideIf would make her vanish on the spot)
    if (mimiHere) {
      yield* c.walk(mi, ['right', 9]);
      c.hideNpc('mimi');
    }
    c.set('presser1_done');
  }

  // ---- Poppy's lost yarn basket: a Kittabra is napping on it in the square. Nothing to take until Poppy has asked for it; then the
  //      lead Kigu dances, the Kittabra leaps off to join in, and you scoop the basket up. No battle, no yes/no.
  function* yarn(c) {
    if (c.flag('yarn_basket')) return;
    if (!c.flag('poppy_asked')) {
      yield* c.sayT('thimble.yarn.nap', 'A Kittabra is lazily napping on a basket of yarn.\\pWatching her, you feel your eyelids start to get heavy.');
      return;
    }
    yield* c.sayT('thimble.yarn.take', 'You think of how to get Kittabra off of the basket.\\pBefore you can act, {kigu} starts dancing, causing the Kittabra to leap off the basket and join in the fun!');
    yield* L.leadDance(c);
    c.set('yarn_basket');
    L.refresh(c);   // the basket stamp (goneIf yarn_basket) goes now
    NP.snd.sfx('pickup');
    yield* c.sayT('thimble.yarn.take.2', 'You take the opportunity to scoop up the basket.');
  }

  // ---- Mimi scene 1 (Salon, first talk): she is showing Poppy the costume she drew for your starter. Poppy then asks you for her
  //      yarn basket, Mimi gives you a Silk Spool for luck and goes to wait outside. Called from Mimi's NPC and from S.poppy.
  NP.scripts.mimiSalon = function* (c) {
    const m = c.npc('mimi_salon'), pop = c.npc('poppy');
    yield* c.face(m, 'right'); yield* c.face(pop, 'left');
    yield* c.sayT('salon.mimi.1', 'Poppy: And you drew this from memory? Look at that little collar. You\'ve got a good eye, dear.');
    yield* c.face(m, toward(m, c.player));
    yield* c.emote(m, 'exclaim');
    yield* c.sayT('salon.mimi.2', 'Mimi: {player}! Perfect timing! I was just showing Poppy the costume I designed for {starter}.');
    yield* c.sayT('salon.mimi.3', 'Mimi: She says it\'d actually hold together if I lined it with flannel. Real tailor advice! I\'m going to frame it.');
    yield* c.sayT('salon.mimi.4', 'Poppy: Sew me a finished one someday, Mimi, and I\'ll put it in the Salon window.');
    yield* c.face(pop, toward(pop, c.player));   // then Poppy turns to you and asks about her yarn basket
    yield* NP.scripts.poppyBasket(c);
    yield* c.face(m, toward(m, c.player));
    yield* c.sayT('salon.mimi.5', 'Mimi: I\'ll wait outside and cheer really loudly. Here, take this for luck!');
    if (!c.flag('mimi_gift')) { c.set('mimi_gift'); yield* c.giveItem('silk_spool', 1); }
    yield* c.walkTo(m, 5, 10);   // path-finds round Noa (4,6), Ren (5,9) and the player
    NP.snd.sfx('door');
    c.hideNpc('mimi_salon');
    c.set('mimi_salon');         // shows the outdoor Mimi by the Salon door
  };

  // The Route 2 road leaves straight north off the main street, right beside the Salon, through a gap in the treeline with a lamp
  // on each side: you can see it (and the two Pressers holding it) from the main street, rather than hunting for it behind the shop.
  // The gateway lamps stand one row up (bases at 16,2 and 19,2) so nobody can slip past the guards over a lamp's walkable top cell.
  const ROWS = [
    'TTTTTTTTTTTTTTTTTppTTTTTTTTTTT',
    'TTTTTTTTTTTTTTTTTppTTTTTTTTTTT',
    'TT...............cc.........TT',
    'TT...............cc.........TT',
    'TT...............cc.........TT',
    'TT...............cc.........TT',
    'TT..........cc...cc.........TT',
    'TT.cccccccccccccccccccccccccTT',
    'TT.cccccccccccccccccccccccccTT',
    'TT.......cccccccc......mmmm.TT',
    'TT.......cccccccc......mmmm.TT',
    'TT.......cccccccc......pppp.TT',
    'TT.......cccccccc......mmmm.TT',
    'TT......fcccccccc......mmmm.TT',
    'TT.......cccccccc......mmmm.TT',
    'TT.ccccccccccc.........mmmm.TT',
    'TT.......fffcccccccccccccccccc',
    'TT.ffff..fffcccccccccccccccccc',
    'TT.ffff..fffcc.......ffff...TT',
    'TT..........cc.......ffff...TT',
    'TTTTTTTTTTTTccTTTTTTTTTTTTTTTT',
    'TTTTTTTTTTTTccTTTTTTTTTTTTTTTT',
  ];

  const M = L.map({
    id: 'thimble', name: 'Thimble Village', w: 30, h: 22, music: 'town_thimble', battleBg: 'grass', border: 'treeline',
    view: 'street',   // 3D camera preset (street | town | flat-ish), see src/engine/persp.js
    town: true,       // no tree shaking in towns; towns are safe, so no wild encounters either (owner's rule)
    legend: { '.': 'grass', T: 'treeline', c: 'cobble', p: 'path', f: 'flowers', m: 'dirt' },
    // stepping back out of the Salon with the Button starts the Society's first inspection
    onEnter: function* (c) {
      c.set('thimble_reached');   // the Tidy Day parade in Basting Green has moved on: the main road is open both ways
      L.syncStamps(c);
      if (c.flag('route2_open')) { c.hideNpc('guard1'); c.hideNpc('guard2'); }
      if (c.flag('badge1') && !c.flag('presser1_done')) yield* inspection(c);
    },
  });
  M.ascii(0, 0, ROWS);

  // -- buildings (window flower boxes either side of every door)
  M.building('tea_house', 3, 3, null, 'tea', 'tea_house', { boxes: true });
  M.building('salon', 9, 2, 'fluff', 'salon', 'salon', { boxes: true });
  M.building('general_store', 21, 3, null, 'store', 'general_store', { boxes: true });
  M.building('house_s', 3, 12, 'yellow', 'house1', 'thimble_house1', { boxes: true });
  M.building('house_m', 18, 12, 'pink', 'house2', 'thimble_house2', { boxes: true });

  // -- the village square (x9-16, y9-14): the Big Thimble dead centre, lined up with the south road
  M.stamp('big_thimble', 12, 11);
  for (const [x, y] of [[12, 11], [13, 11], [12, 12], [13, 12]]) M.interact(x, y, 'THIMBLE VILLAGE. Where every stitch counts.', 'Big Thimble plaque');
  M.stamp('yarn_basket', 11, 10, 'napping', { goneIf: 'yarn_basket' });
  M.def.interact.push({ x: 11, y: 10, script: yarn, when: (c) => !c.flag('yarn_basket'), note: 'Poppy\'s yarn basket (can be taken once Poppy asks)' });
  M.stamp('bench_v', 10, 12, 'east').stamp('bench_v', 15, 12);        // both facing the Big Thimble, parallel to the north-south approach
  M.stamp('herb_planter', 9, 14, 'flowers').stamp('herb_planter', 16, 9, 'flowers');
  // plan K17 (16,10) sits right behind Mr. Sharp's cart canopy and can't be seen, so it stands one tile up-left at J16 (owner sign-off pending)
  M.stamp('notice_board', 15, 9);
  M.interact(15, 9, 'VILLAGE NEWS\\nThe Tea House has a new cocoa, and the Salon is open to challengers.', 'notice board (draft text)');
  M.stamp('market_cart', 15, 11, 'peddler');                          // Mr. Sharp's cart (room to sell later)
  M.stamp('lamp', 8, 8).stamp('lamp', 17, 8);                          // on the grass corners where the square meets the main street

  // -- Route 2 gateway, signs
  M.stamp('lamp', 16, 1).stamp('lamp', 19, 1);
  M.stamp('sign', 19, 6).stamp('sign', 27, 15);
  M.interact(27, 15, 'EAST: RIBBON LOOP\\nThe long way round to Basting Green.');
  M.interact(19, 6, function* (c) {
    if (c.flag('route2_open')) yield* c.sayT('thimble.sign_r2.open', 'ROUTE 2  Licensed Tailors only.\\nPlanks uneven. Cross at your own risk.');
    else if (c.flag('presser1_done')) yield* c.sayT('thimble.sign_r2.ask', 'ROUTE 2  Closed\\nInspection in progress.\\pLicensed Tailors with a Button may ask the guards.');
    else yield* c.sayT('thimble.sign_r2.closed', 'ROUTE 2  Closed\\nInspection in progress. Please be patient.');
  });

  // -- the rest of the village
  M.stamp('well', 6, 9).stamp('birdbath', 4, 9);   // birdbath one row up, clear of the yellow roof
  M.stamp('cloth_line', 7, 13).stamp('laundry_basket', 8, 12, 'folded');
  M.stamp('mailbox', 7, 14).stamp('mailbox', 17, 15);
  M.stamp('firewood', 8, 4).stamp('barrel', 8, 6);
  M.stamp('crate', 26, 4).stamp('barrel', 26, 5).stamp('crate', 26, 6);  // the General Store's stock
  M.stamp('bench', 20, 9);
  M.stamp('windmill', 2, 16);
  M.trees([[2, 10], [8, 18], [17, 18], [27, 10]]);
  M.stamp('bush', 15, 19).stamp('bush', 26, 19).stamp('bush', 26, 18);  // snippable after Salon 1; they hide nothing
  for (const [x, y, v] of [[8, 2, 'tuft'], [20, 4, 'pebbles'], [27, 3, 'petals'], [14, 18, 'pebbles'], [20, 19, 'tuft'], [2, 8, 'pebbles'], [7, 19, 'petals'], [2, 2, 'tuft']]) {
    M.stamp('floor_clutter', x, y, v);   // walk-over pebbles, petals and grass tufts
  }

  // -- the farm (x23-27, y9-15): crop plots on tilled soil, a dirt path through the middle (row 11)
  M.stamp('crop_plot', 23, 9, 'wheat').stamp('crop_plot', 25, 9, 'corn');
  M.stamp('crop_plot', 23, 12, 'potato').stamp('crop_plot', 25, 12, 'carrot');
  M.stamp('crop_plot', 23, 14, 'cabbage').stamp('crop_row', 25, 14, 'tomato').stamp('crop_row', 25, 15, 'onion');
  M.stamp('hay_bale', 27, 9).stamp('hay_bale', 27, 14).stamp('watering_can', 27, 12).stamp('scarecrow', 27, 13);
  M.stamp('wheelbarrow', 22, 10, 'carrots');
  // the scarecrow (patched cardigan, Poppy made it) has no line: every tile around it is a crop, a prop or the farm tree's trunk

  // -- Rival #2 meets anyone who steps up to the Salon door (12,7 is the only tile the door can be entered from; 13,7 is the road beside it)
  M.trigger({ x: 12, y: 7, w: 2, h: 1, id: 'rival2', when: (c) => !c.flag('rival2_done') && !c.flag('badge1'), script: rival2 });

  // -- connections
  M.spawn('south', 12, 19, 'up').spawn('north', 17, 1, 'down').spawn('east', 28, 16, 'left');
  M.edge('s', 12, 13, 'basting_green', 'north');
  M.edge('e', 16, 17, 'ribbon_loop', 'north');
  M.edge('n', 17, 18, 'route2', 'south');

  // -- people
  M.npc('guard1', 17, 3, 'grunt_m', 'down', null, { hideIf: 'route2_open', script: guards });
  M.npc('guard2', 18, 3, 'grunt_f', 'down', null, { hideIf: 'route2_open', script: guards });
  // cast for the Rival #2 and first-inspection scenes (hidden until their scripts place them)
  M.npc('tomo_t', 12, 6, 'rival', 'down', '{rival}: ...', { hidden: true });
  M.npc('presser_s1', 6, 7, 'grunt_m', 'right', 'Flat is fair!', { hidden: true });
  M.npc('presser_s2', 6, 8, 'grunt_f', 'right', 'Stay in line, please.', { hidden: true });
  M.npc('poppy_out', 12, 6, 'poppy', 'down', 'Poppy: Every stitch counts!', { hidden: true });
  M.npc('peddler', 16, 12, 'gentleman', 'down', 'Good day! I\'m Mr. Sharp, humble peddler. Nothing suspicious at all.\\pThis moustache? Oh, it\'s a very ordinary moustache.\\pKeep your eyes sharp, friend!');
  M.npc('vf', 9, 11, 'villager_f2', 'down', 'Master Poppy sews her Fluff Kigu tiny cardigans.\\pHonestly, it\'s not fair how cute they are. How are you meant to battle that?', { move: 'turn' });
  M.npc('kidf', 14, 12, 'child_f', 'left', 'If your Kigu is sleepy, the Tea House will fix her right up!', { move: 'turn' });
  M.npc('eldm', 7, 11, 'elder_m', 'right', 'They say this well has been here since Tsumugi was first stitched together.\\pThe water practically tastes like tea already.');
  M.npc('farmer', 26, 11, 'villager_m1', 'left', 'The Society measured my rows last week and said the carrots were out of line.\\pI told them carrots don\'t care, and neither do I.');
  // Mimi waits by the Salon door after scene 1 and leaves after the inspection (scene 2)
  M.npc('mimi', 14, 7, 'mimi', 'left', 'Mimi: Good luck at the Salon! Poppy is super nice, but her Kigu are tough.\\pDo you think my bow got bigger? People keep saying it did.', { showIf: 'mimi_salon', hideIf: 'presser1_done' });
  M.reg();

  // ---- the Route 2 guards: before the first inspection they hold the road; after it, either one stands both down (once)
  function* guards(c, npc) {
    if (!c.flag('presser1_done')) {
      if (npc && npc.id === 'guard2') yield* c.sayT('thimble.guard2', 'Stay in line, please.\\p...Your collar is untidy. May I? There, that\'s much better. Flat is fair!');
      else yield* c.sayT('thimble.guard1.a', 'Halt! This bridge is under inspection.\\pThe planks are uneven, so nobody crosses until they\'re level.');
      return;
    }
    yield* c.sayT('thimble.guard1.b', ['...Hm. The village report says you\'re a licensed Tailor with a Button.\\pAnd a licensed Tailor with a Button may cross at their own risk.\\pThe planks are still uneven, mind you.']);
    yield* c.sayT('thimble.guard2.b', ['Please mind the third plank from the end, Tailor.\\pIt\'s... a little crooked. We haven\'t had the heart to press it.\\pFlat is fair!']);
    const a = c.npc('guard1'), b = c.npc('guard2');
    yield* c.walk(a, ['up', 3]);
    c.hideNpc('guard1');
    yield* c.walk(b, ['up', 3]);
    c.hideNpc('guard2');
    c.set('route2_open');
  }

  // ------------------------------------------------------------------------------------ Tea House
  K.room({
    id: 'tea_house', name: 'Tea House', teaHouse: true, w: 11, h: 9, doorX: 4, floor: 'floor_wood', wall: 'wall_wood', music: 'tea_house', exit: { to: 'thimble', door: 'tea' },
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
      { id: 'cook', x: 9, y: 4, look: 'cook', dir: 'left', script: 'tea_cook', note: 'Tea House cook: turns a fish into a dish (src/game/fishing.js)' },
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
  // Team levels are placeholders until the one-pass Chapter 1 retune (with sims); the shapes (species, moves, item, nature) are approved.
  K.room({
    id: 'salon', name: 'Thimble Salon', w: 10, h: 12, doorX: 4, floor: 'floor_wood', wall: 'wall_plaster', music: 'town_thimble', battleBg: 'gym',
    exit: { to: 'thimble', door: 'salon' },
    carpet: [4, 2, 2, 9], carpetTerrain: 'carpet_red',
    // saves from before the Mimi scene (basket already found, or Button already won) skip scene 1
    onEnter: function* (c) { if (c.flag('yarn_basket') || c.flag('badge1')) c.hideNpc('mimi_salon'); },
    stamps: [
      { id: 'mannequin', x: 1, y: 2 }, { id: 'mannequin', x: 8, y: 2 }, { id: 'cloth_shelf', x: 1, y: 0 }, { id: 'cloth_shelf', x: 7, y: 0 },
      { id: 'sewing_machine', x: 1, y: 6 }, { id: 'sewing_machine', x: 8, y: 6 }, { id: 'window', x: 4, y: 1 }, { id: 'window', x: 5, y: 1 },
    ],
    npcs: [
      { id: 'poppy', x: 4, y: 3, look: 'poppy', dir: 'down', script: 'poppy' },
      // Mimi, first visit only: showing Poppy her costume drawing (scene 1)
      { id: 'mimi_salon', x: 3, y: 3, look: 'mimi', dir: 'right', hideIf: 'mimi_salon', script: function* (c) { yield* NP.scripts.mimiSalon(c); } },
      { id: 'salon_t1', x: 5, y: 9, look: 'tailor_m', dir: 'left',
        trainer: { cls: 'Tailor', name: 'Ren', sight: 3, reward: 7, ai: 1, team: L.team([['nibblit', 10], ['kittabra', 10]]),
          intro: 'Poppy teaches us that every stitch counts. Show me yours!', win: 'Such neat work!', after: 'Poppy is at the back. Don\'t underestimate her Kigu.' } },
      { id: 'salon_t2', x: 4, y: 6, look: 'tailor_f', dir: 'right',
        trainer: { cls: 'Tailor', name: 'Noa', sight: 3, reward: 8, ai: 1, team: L.team([['chirpadee', 11], ['nibblit', 11]]),
          intro: 'Halt! Nobody gets to Poppy without getting past me first.', win: 'You got that one exactly right...', after: 'Go on, Poppy is waiting.' } },
    ],
  });
  // Poppy's ace (approved 2026-10-28): Wiskedabra, Jolly, holding the Lucky Thimble so Flurry Swipe lands 4 or 5 hits.
  // Her Chirpadee sticks to Fluff moves so the Gale ones don't flatten a Sprubun starter.
  NP.maps.salon.poppyTeam = L.team([
    ['nibblit', 12],
    ['chirpadee', 13, { moves: ['pounce', 'tail_wag', 'sweet_talk'] }],
    ['wiskedabra', 15, { moves: ['quick_dash', 'sweet_talk', 'flurry_swipe', 'snack_time'], nature: 'jolly', item: 'lucky_thimble' }],
  ]);

  // -------------------------------------------------------------------------------------- houses
  K.room({
    id: 'thimble_house1', name: 'House', w: 8, h: 7, doorX: 3, exit: { to: 'thimble', door: 'house1' },
    stamps: [{ id: 'bed', x: 6, y: 2 }, { id: 'tv', x: 1, y: 2 }, { id: 'rug_b', x: 3, y: 3 }],
    npcs: [{ id: 'h1', x: 3, y: 2, look: 'villager_f1', dir: 'down', say: ['My daughter\'s Sprubun droops her sprout whenever she skips breakfast!'] }],
  });
  K.room({
    id: 'thimble_house2', name: 'House', w: 9, h: 8, doorX: 3, exit: { to: 'thimble', door: 'house2' },
    stamps: [{ id: 'bookshelf', x: 1, y: 0 }, { id: 'table_l', x: 4, y: 3 }, { id: 'fridge', x: 7, y: 1 }],
    npcs: [{ id: 'h2', x: 2, y: 4, look: 'elder_f', dir: 'right', say: ['I sewed the flags for the Tea House myself.\\pThe heart one took three whole weekends.'] }],
  });
})(typeof globalThis !== 'undefined' ? globalThis : window);
