/* The player's house in Button Town, two floors (plan: home-floor-plan, approved 2026-10-27).
 *  player_house = downstairs (kitchen, hall, stair room, living room), 15x15 with walls; plan tile (px, py) = game (px + 1, py + 2).
 *  player_room  = upstairs, your room, 15x12. A new game starts here, asleep in bed; Nibblenna comes up to wake you.
 * The plan draws the room walls on tile edges, so they are def.edgeWalls (thin partitions), not wall tiles.
 * Window light follows the clock (def.windowLight, opt-in); on the first morning, until you first step outside, it is always morning. */
(function (root) {
  'use strict';
  const NP = root.NP, L = NP.levels;

  const firstMorning = () => (NP.state && NP.state.flags && !NP.state.flags.kite_call ? 'morning' : null);
  const cry = (sp) => { if (NP.snd && NP.snd.cry) NP.snd.cry(sp); };
  /** the same line on every tile of a piece of furniture */
  const each = (M, cells, line) => { for (const [x, y] of cells) M.interact(x, y, line); };

  // ============================================================================================ downstairs
  const H = L.room({
    id: 'player_house', name: 'Your House', w: 15, h: 15, doorX: 4, exit: { to: 'button_town', door: 'home' },
    legend: { k: 'floor_tile', r: 'carpet_red', g: 'carpet_green', u: 'stairs_up' },
    edgeWalls: [
      { h: 6, x0: 1, x1: 3 },    // kitchen | hall, west of the doorway
      { h: 6, x0: 6, x1: 8 },    // kitchen | hall, east of the doorway
      { v: 9, y0: 2, y1: 5 },    // kitchen | stair room
      { h: 8, x0: 1, x1: 3 },    // hall | living room, west of the doorway
      { h: 8, x0: 6, x1: 13 },   // hall + stair room | living room
    ],
    windowLight: [
      { x: 6, y: 3, w: 1, h: 2, from: 'n' },     // kitchen window over the sink
      { x: 1, y: 6, w: 3, h: 2, from: 'w' },     // hall window
      { x: 10, y: 11, w: 2, h: 2, from: 's' },   // living-room window
    ],
    nightGlow: [{ x: 8, y: 8, w: 2 }],           // the TV
    lightPhase: firstMorning,
    onEnter: function* (c) {
      L.syncStamps(c);
      if (c.flag('woke') && NP.Clock.phase() === 'night') c.placeNpc('nibblenna', 6, 3, 'up');   // humming at the kitchen window
      // the first time downstairs on the first morning: Mom comes over from the oven
      if (!c.flag('woke') || c.flag('mom_sheets') || c.flag('kite_call') || c.flag('has_starter')) return;
      c.set('mom_sheets');
      yield* c.wait(16);
      yield* c.emote('mom', 'exclaim');
      yield* c.approach('mom');
      yield* c.sayT('player_house.wake.1', 'Mom: Morning, love! Did Nibblenna get you up?\\pToday\'s your big day! Professor Bobbin is expecting you at nine.');
      yield* c.sayT('player_house.wake.2', 'Mom: Before you go, would you peg the sheets out for me?\\pThe washing line is round the back of the house. Thank you, love!');
      yield* c.walkTo('mom', 4, 3);
      yield* c.face('mom', 'down');
    },
  });
  H.ascii(0, 2, [
    'WkkkkkkkkfffuuW',
    'WkkkkkkkkfffuuW',
    'WkkkkkkkkfffffW',
    'WkkkkkkkkfffffW',
    'WfffffffffffffW',
    'WfffffffffffffW',
    'WfffffffffffffW',
    'WfrrrffggggfffW',
    'WfrrrffggggfffW',
    'WfrrrffggggfffW',
    'WfrrrfffffffffW',
    'WfffffffffffffW',
  ]);
  H.warp({ xs: [12, 13], ys: [2, 3], to: 'player_room', spawn: 'stairs', sound: 'door' });
  H.spawn('stairs', 12, 4, 'down');

  // kitchen (plan row A, against the north wall)
  H.stamp('kitchen_counter', 1, 2, 'plain_lr');
  H.stamp('fridge', 2, 1, 'drawings');
  H.stamp('stove', 3, 2);
  H.stamp('kitchen_counter', 4, 2); L.variantByFlag(H.def.stamps[H.def.stamps.length - 1], 'mom_gift', 'cakes_l', 'crumbs_l');
  H.stamp('kitchen_counter', 5, 2); L.variantByFlag(H.def.stamps[H.def.stamps.length - 1], 'mom_gift', 'cakes_r', 'crumbs_r');
  H.stamp('sink', 6, 2).stamp('window', 6, 1);
  H.stamp('chair', 7, 3, 'down').stamp('chair', 8, 3, 'down').stamp('chair', 6, 4, 'right').stamp('chair', 6, 5, 'right');
  H.stamp('table_sq', 7, 4);
  H.stamp('pet_bed', 1, 5);
  // stair room: Mom's door in the north wall
  H.stamp('door_inner', 10, 0);
  // hall
  H.stamp('window_edge', 0, 6, 'w').stamp('side_table', 1, 7).stamp('plant', 13, 7);
  // living room
  H.stamp('grandfather_clock', 2, 8).stamp('tv_wide', 8, 8, 'plain').stamp('bookshelf_narrow', 13, 8, 'cookbooks');
  H.stamp('sofa', 7, 10).stamp('sewing_basket', 11, 10).stamp('armchair', 12, 10);
  H.stamp('coat_rack', 6, 13); L.variantByFlag(H.def.stamps[H.def.stamps.length - 1], 'kite_call', 'satchel', 'empty');
  H.stamp('window_edge', 10, 14, 's').stamp('window_edge', 11, 14, 's').stamp('plant', 13, 13);

  H.npc('mom', 4, 3, 'mom', 'down', null, {
    script: function* (c) {
      if (!c.flag('morning_done')) { yield* c.sayT('player_house.mom.sheets', 'Sheets first, love! The washing line is round the back of the house.'); return; }
      if (!c.flag('has_starter')) { yield* c.say('{player}! Professor Bobbin is expecting you.\\pHer lab is just up the road. Go on, shoo!'); return; }
      if (!c.flag('mom_gift')) {
        c.set('mom_gift');
        yield* c.say('{player}! I heard you have a Kigu now. I\'m so proud!\\pHere, I baked these for you. Make sure you share them!');
        yield* c.giveItem('fancy_cake', 2);
        L.syncStamps(c);   // the cake tray is down to crumbs
      }
      yield* c.say('Your Kigu look tired, love. Sit down and have some cocoa.');
      yield* c.heal('It was a warm cup of cocoa. Your Kigu feel refreshed!');
    },
  });
  H.npc('nibblenna', 1, 5, 'kigu:nibblenna', 'right', null, {
    showIf: 'woke', note: "Mom's Nibblenna, on her bed in the kitchen corner (at the kitchen window at night)",
    script: function* (c) {
      cry('nibblenna');
      if (NP.Clock.phase() === 'night') { yield* c.sayT('player_house.nibblenna.night', 'Nibblenna is humming softly at the kitchen window.'); return; }
      yield* c.sayT('player_house.nibblenna.1', ['Nibblenna: Nomnom!', 'Nibblenna wiggled happily, as if she hadn\'t seen you in years.']);
    },
  });

  // things to look at
  H.interact(10, 1, "This is mom's room. It would be rude to enter without asking.");
  H.interact(2, 2, 'The fridge is covered in drawings you made when you were little.');
  H.interact(3, 2, 'The oven is still warm from this morning\'s baking.');
  const cakes = function* (c) {
    if (c.flag('mom_gift')) yield* c.sayT('player_house.cakes.after', 'There are only crumbs left on the tray.');
    else yield* c.sayT('player_house.cakes', 'A tray of cakes is cooling on the counter. They smell amazing.');
  };
  H.interact(4, 2, cakes).interact(5, 2, cakes);
  H.interact(6, 2, 'Through the window over the sink you can see the washing line out back.');
  H.interact(1, 7, 'It\'s a photo of you and {rival} as little kids, holding up a kite with a wonky tail.');
  H.interact(2, 8, function* (c) { yield* c.say('The grandfather clock says it\'s ' + NP.Clock.text() + '.'); });
  const tv = function* (c) {
    const n = L.badges();
    if (n < 1) yield* c.sayT('player_house.tv.1', 'The news is all about Tidy Day. The roads to Thimble have never looked so neat.');
    else if (n < 3) yield* c.sayT('player_house.tv.2', 'An advert for Crisp & Co. is on. Every shirt in it looks exactly the same, and they\'re all on sale.');
    else yield* c.sayT('player_house.tv.3', 'The news says whole streets have woken up with their hedges trimmed flat, and nobody saw who did it.');
  };
  H.interact(8, 8, tv).interact(9, 8, tv);
  each(H, [[13, 8], [13, 9]], 'It\'s full of cookbooks. Tucked in at the end is an old festival programme from Loomhaven.');
  H.interact(11, 10, 'It\'s Mom\'s sewing basket. Every hem in it is finished with a neat double knot.');
  const coat = function* (c) {
    if (c.flag('kite_call')) yield* c.sayT('player_house.coats.after', 'Coats and shoes, and the hook where your satchel lives.');
    else yield* c.sayT('player_house.coats', '{player}\'s satchel is hanging on its hook, ready to go.');
  };
  H.interact(6, 13, coat).interact(7, 13, coat);
  H.reg();

  // ============================================================================================ upstairs
  const R = L.room({
    id: 'player_room', name: 'Your Room', w: 15, h: 12, doorX: 4, exit: null,
    legend: { b: 'carpet_blue', d: 'stairs_down' },
    windowLight: [
      { x: 5, y: 8, w: 2, h: 2, from: 's' },    // window over the bed
      { x: 2, y: 7, w: 2, h: 2, from: 'w' },    // west window, onto the beanbag
      { x: 11, y: 4, w: 2, h: 2, from: 'e' },   // east window
    ],
    nightGlow: [{ x: 4, y: 10, w: 1 }, { x: 3, y: 5, w: 2 }],   // the bedside lamp and the TV
    lightPhase: firstMorning,
    // the opening: asleep in bed until Nibblenna comes up and tugs the blanket
    onEnter: function* (c) {
      L.syncStamps(c);
      if (c.flag('woke') || c.flag('has_starter')) return;
      const p = c.ow.player;
      p.pose = 'asleep';
      yield* c.wait(40);
      yield* c.emote('player', 'zzz');
      const n = c.npc('nibblenna_up');
      c.placeNpc(n, 12, 2, 'down'); c.showNpc('nibblenna_up');
      NP.snd.sfx('step');
      yield* c.walkTo(n, 7, 9);
      yield* c.face(n, 'left');
      cry('nibblenna');
      yield* c.sayT('player_room.wake.1', 'Nibblenna: Nomnom!');
      yield* c.sayT('player_room.wake.2', 'Nibblenna grabbed the corner of the blanket and tugged until {player} gave up and got out of bed.');
      c.set('woke');
      yield* c.ow.fadeOut(8);
      L.refresh(c);                 // the blanket goes, the bed is unmade
      p.pose = null;
      c.placeNpc('player', 6, 7, 'down');
      yield* c.ow.fadeIn(8);
      yield* c.walkTo(n, 12, 3);    // she trots back downstairs ahead of you
      c.hideNpc('nibblenna_up');
    },
  });
  R.rect(R.doorX, 11, 2, 1, 'W');   // no front door upstairs
  R.ascii(0, 2, [
    'WfffffffffffddW',
    'WfffffffffffddW',
    'WfffffffffffffW',
    'WffffbbbbbffffW',
    'WffffbbbbbffffW',
    'WffffbbbbbffffW',
  ]);
  R.warp({ xs: [12, 13], ys: [2, 3], to: 'player_house', spawn: 'stairs', sound: 'door' });
  R.spawn('stairs', 12, 4, 'down');
  R.spawn('door', 6, 7, 'down');    // beside the bed: resting here makes this your heal point (c.heal saves spawn 'door')

  // north wall
  R.stamp('pc_desk', 1, 2);
  R.stamp('wall_map', 4, 1); L.variantBy(R.def.stamps[R.def.stamps.length - 1], () => 'pins' + Math.min(8, L.badges()));
  R.stamp('calendar', 8, 1).stamp('kigu_poster', 9, 1);
  // west side
  R.stamp('laundry_basket', 1, 4, 'overflow').stamp('bookshelf_narrow', 1, 5, 'comics').stamp('toy_chest', 1, 9);
  R.stamp('window_edge', 0, 7, 'w').stamp('window_edge', 0, 8, 'w');
  R.stamp('tv_wide', 3, 5, 'console').stamp('beanbag', 3, 6);
  // east side
  R.stamp('window_edge', 14, 4, 'e').stamp('window_edge', 14, 5, 'e');
  for (let y = 6; y <= 10; y++) R.stamp('trophy_shelf', 13, y, 'empty');
  // the bed against the south wall, pillows south
  R.stamp('bed_double', 5, 8); L.variantByFlag(R.def.stamps[R.def.stamps.length - 1], 'woke', 'sleeping', 'unmade');
  R.stamp('bed_blanket', 5, 8, null, { goneIf: 'woke' });
  R.stamp('nightstand', 4, 10, 'lamp').stamp('nightstand', 7, 10, 'alarm');
  R.stamp('window_edge', 5, 11, 's').stamp('window_edge', 6, 11, 's_tincan');
  // walk-over clutter
  const CLUTTER = [
    ['clothes', 7, 9, 'It\'s yesterday\'s outfit, kicked off and forgotten.'],
    ['socks', 8, 6, 'A pair of odd socks. Neither of them matches anything you own.'],
    ['controller', 5, 6, 'Your controller and a pile of snack cake wrappers, right where you left them.'],
    ['figures', 7, 5, 'Little Konko, Ottopi and Sprubun figures are set up mid-battle on the rug.'],
    ['plushies', 2, 9, 'Kigu plushies are spilling out of the toy chest. One of them is a homemade Nibblenna.'],
    ['comic', 2, 6, 'An open comic, face down to keep your page. It\'s issue 12 of The Wandering Tailor.'],
    ['sneakers', 10, 8, 'Your sneakers are lying by the bed. One of them has fallen on its side.'],
  ];
  for (const [v, x, y, line] of CLUTTER) R.stamp('floor_clutter', x, y, v).interact(x, y, line);

  R.npc('nibblenna_up', 12, 4, 'kigu:nibblenna', 'down', null, { hidden: true, note: 'only in the wake-up scene' });

  // things to look at
  R.interact(1, 2, 'pc').interact(2, 2, 'pc');
  const NUM = ['None', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'All eight'];
  const map = function* (c) {
    const n = Math.min(8, L.badges());
    yield* c.say('It\'s a map of Tsumugi with eight pins, one for every Salon\'s Button.\\p' + NUM[n] + (n === 1 ? ' of them is' : ' of them are') + ' filled in' + (n < 8 ? ' so far.' : '!'));
  };
  R.interact(4, 1, map).interact(5, 1, map).interact(6, 1, map);
  R.interact(8, 1, 'The Lantern Festival is circled in red. It\'s not far away now.');
  each(R, [[9, 1], [10, 1]], 'Posters of Konko, Ottopi and Sprubun. You\'ve had them up for years.');
  R.interact(1, 4, 'The laundry basket is overflowing. Mom has definitely asked about this.');
  each(R, [[1, 5], [1, 6]], 'A whole shelf of Kigu comics, read so many times the spines are cracked.');
  each(R, [[3, 5], [4, 5]], 'It\'s your game console. There\'s a save file called "Every Salon".');
  each(R, [[3, 6], [4, 6], [3, 7], [4, 7]], 'A beanbag shaped like a Konko tail, with a hoodie flung over the back.');
  R.interact(1, 9, 'It\'s your old toy chest. It hasn\'t closed properly in years.');
  R.interact(7, 10, 'An alarm clock that has never once beaten Nibblenna.');
  each(R, [[13, 6], [13, 7], [13, 8], [13, 9], [13, 10]], 'Nothing on this shelf yet.');
  const bed = function* (c) {
    if (!c.flag('woke')) return;
    if (!(yield* c.ask('It\'s your bed. Have a rest?'))) return;
    yield* c.ow.fadeOut(16); yield* c.wait(20); yield* c.ow.fadeIn(16);
    yield* c.heal('{player} had a good rest.\\pYour Kigu are feeling much better!');
  };
  for (let y = 8; y <= 10; y++) R.interact(5, y, bed).interact(6, y, bed);
  R.reg();
})(typeof globalThis !== 'undefined' ? globalThis : window);
