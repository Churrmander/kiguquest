/* Button Town (start) + Prof. Bobbin's lab + the two houses. */
(function (root) {
  'use strict';
  const NP = root.NP, K = NP.mapkit;

  // ------------------------------------------------------------------------------------------ town
  const W = 26, H = 22;
  const g = K.grid(W, H, '.');
  K.rect(g, 0, 0, W, 2, 'T'); K.rect(g, 0, 0, 2, H, 'T'); K.rect(g, W - 2, 0, 2, H, 'T');
  K.rect(g, 0, 19, W, 3, 'w');                              // the sea to the south
  K.rect(g, 12, 0, 2, 2, 'p');                              // gap north to Route 1
  K.rect(g, 12, 0, 2, 19, 'p');                             // main road
  K.rect(g, 4, 9, 18, 1, 'p');                              // lane past the lab & player house
  K.rect(g, 4, 17, 19, 1, 'p');                             // lower lane
  K.rect(g, 19, 16, 4, 1, 'p');
  K.rect(g, 12, 18, 2, 1, 'c');
  K.rect(g, 9, 11, 3, 2, 'f'); K.rect(g, 15, 11, 3, 2, 'f'); K.rect(g, 3, 11, 2, 1, 'f');
  K.rect(g, 2, 2, 2, 17, 'T');                             // western wood
  K.rect(g, 22, 2, 2, 7, 'T');
  K.rect(g, 10, 14, 1, 3, 'F'); K.rect(g, 15, 14, 1, 3, 'F');

  K.reg({
    id: 'button_town', name: 'Button Town', music: 'home_town', battleBg: 'grass', border: 'treeline',
    legend: { '.': 'grass', T: 'treeline', p: 'path', c: 'cobble', w: 'water', f: 'flowers', F: 'fence' },
    rows: K.rows(g),
    stamps: [
      { id: 'house_m', x: 4, y: 5, variant: 'red', name: 'home', to: 'player_house' },
      { id: 'lab', x: 14, y: 4, name: 'lab', to: 'lab' },
      { id: 'house_m', x: 4, y: 13, variant: 'blue', name: 'tomo', to: 'tomo_house' },
      { id: 'house_s', x: 19, y: 13, variant: 'green', name: 'neighbor', to: 'neighbor_house' },
      { id: 'tree', x: 10, y: 3 }, { id: 'tree', x: 15, y: 2 }, { id: 'tree', x: 21, y: 10 }, { id: 'tree', x: 8, y: 17 }, { id: 'tree', x: 17, y: 14 },
      { id: 'sign', x: 11, y: 10, name: 'sign_town' }, { id: 'sign', x: 21, y: 8, name: 'sign_lab' },
      { id: 'mailbox', x: 9, y: 8 }, { id: 'flowerbed', x: 6, y: 11 }, { id: 'bench', x: 16, y: 10 }, { id: 'lamp', x: 14, y: 10 },
    ],
    interact: [
      { x: 11, y: 10, say: 'BUTTON TOWN\\nA town stitched together with new beginnings.' },
      { x: 21, y: 8, say: "PROF. BOBBIN'S LAB\\nKigu research and tailoring." },
    ],
    spawns: { south: { x: 12, y: 17, dir: 'up' }, north: { x: 12, y: 2, dir: 'down' } },
    warps: [{ xs: [12, 13], y: 0, to: 'route1', spawn: 'south', sound: 'none' }],
    npcs: [
      { id: 'villager_a', x: 9, y: 12, look: 'villager_f1', dir: 'down', move: 'wander', range: 2,
        say: ['Oh, good morning!\\pThe ocean breeze keeps the sheets dry in no time here.'] },
      { id: 'kid_a', x: 16, y: 13, look: 'child_m', dir: 'left', move: 'turn',
        say: ['I am going to have a Kigu of my own someday!\\pBut I am not allowed on Meadow Lane alone yet.'] },
      { id: 'elder_a', x: 11, y: 15, look: 'elder_f', dir: 'right',
        say: ['Kigu choose the people they trust.\\pIt is not a thing you can force.'] },
    ],
    triggers: [
      {
        x: 12, y: 2, w: 2, h: 1, id: 'north_block',
        when: (c) => !c.flag('has_starter'),
        script: function* (c) {
          yield* c.say('Wait, {player}!\\pProfessor Bobbin asked to see you at her lab first.');
          yield* c.walk('player', ['down', 2]);
        },
      },
    ],
  });

  // -------------------------------------------------------------------------------------- the lab
  const STARTERS = [
    { sp: 'konko', x: 4, name: 'Konko', type: 'Ember', blurb: 'the Ember fox Kigu' },
    { sp: 'ottopi', x: 5, name: 'Ottopi', type: 'Tide', blurb: 'the Tide otter Kigu' },
    { sp: 'sprubun', x: 6, name: 'Sprubun', type: 'Sprout', blurb: 'the Sprout bunny Kigu' },
  ];
  const BEATS = { konko: 'ottopi', ottopi: 'sprubun', sprubun: 'konko' }; // what the rival takes against yours

  function* pick(c, s) {
    if (c.flag('has_starter')) return;
    yield* c.say(s.name + ', ' + s.blurb + '.\\pIt wears a ' + s.type + ' costume and waits quietly on the spool.');
    if (!(yield* c.ask('Will you befriend ' + s.name + '?'))) return;
    c.hideProp('starter_' + s.sp);
    c.set('has_starter');
    c.state.starter = s.sp;
    yield* c.giveKigu(s.sp, 5, { silent: true });
    yield* c.jingleWait('j_caught');
    yield* c.say('{player} and ' + s.name + ' made a Stitch Bond!');
    const prof = c.npc('bobbin');
    yield* c.face(prof, 'down');
    yield* c.say('Wonderful! She chose you right back.\\pThe stitches between you and a Kigu are what make you a real Tailor.');
    // the rival takes the one that beats yours
    const rs = BEATS[s.sp];
    c.state.rivalStarter = rs;
    const tomo = c.npc('tomo_lab');
    yield* c.emote(tomo, 'exclaim');
    const rp = STARTERS.find((x) => x.sp === rs);
    yield* c.say('{rival}: Hmph. Then I choose this one.');
    yield* c.walk(tomo, ['down', 1, 'left', 9 - rp.x, 'up', 1]);
    yield* c.face(tomo, 'up');
    c.hideProp('starter_' + rs);
    yield* c.say('{rival} took ' + rp.name + ' from the table.');
    yield* c.say('Now then, you two.\\pTake these. A Tailor needs a few Bond Spools, and Kigu love snack cakes.');
    yield* c.giveItem('bond_spool', 5);
    yield* c.giveItem('snack_cake', 3);
    yield* c.giveItem('sketchbook', 1);
    yield* c.say('Bond Spools let you offer friendship to wild Kigu. She will only accept if she wants to, so be gentle.\\pMeadow Lane leads to Thimble Village, where Master Poppy runs the first Salon.');
    yield* c.say('{rival}: I will get there first, {player}! Do not get in my way!');
    yield* c.walk(tomo, ['down', 1, 'right', 7 - rp.x, 'down', 3]);
    c.hideNpc('tomo_lab');
    c.set('tomo_left_lab');
    yield* c.say('Off you go, dear! And visit your mother before you leave town.');
  }

  K.room({
    id: 'lab', name: "Prof. Bobbin's Lab", w: 12, h: 12, doorX: 5, music: 'intro', floor: 'floor_tile', wall: 'wall_plaster',
    exit: { to: 'button_town', door: 'lab' },
    stamps: [
      { id: 'bookshelf', x: 1, y: 0 }, { id: 'bookshelf', x: 3, y: 0 }, { id: 'bookshelf', x: 8, y: 0 }, { id: 'bookshelf', x: 10, y: 0 },
      { id: 'window', x: 6, y: 1 }, { id: 'clock', x: 5, y: 1 },
      { id: 'table_l', x: 4, y: 4 },
      { id: 'plant', x: 1, y: 9 }, { id: 'plant', x: 10, y: 9 }, { id: 'sewing_machine', x: 1, y: 5 },
    ],
    props: STARTERS.map((s) => ({
      id: 'starter_' + s.sp, x: s.x, y: 5, icon: 'spool', hideIf: 'has_starter',
      script: function* (c) { yield* pick(c, s); },
    })),
    npcs: [
      { id: 'bobbin', x: 5, y: 3, look: 'prof_bobbin', dir: 'down',
        script: function* (c, n) {
          if (!c.flag('has_starter')) yield* c.say('Take your time, {player}. Step up to the table and look at each spool.\\pA Kigu will be waiting on every one.');
          else yield* c.say('Meadow Lane is full of wild Kigu. Offer them a Bond Spool when they look curious.\\pAnd do visit the Tea House in Thimble Village. Their cocoa is famous.');
        } },
      { id: 'tomo_lab', x: 9, y: 6, look: 'tomo', dir: 'left', hideIf: 'tomo_left_lab',
        script: function* (c) { yield* c.say('{rival}: Do not dawdle. The Professor is watching.'); } },
      { id: 'aide1', x: 2, y: 7, look: 'aide_f', dir: 'right', say: ['These are this year\'s apprentice spools.\\pThey have been waiting for you two for weeks!'] },
      { id: 'aide2', x: 9, y: 9, look: 'aide_m', dir: 'up', say: ['The Sketchbook records every Kigu you meet.\\pThe Professor hopes you will fill it.'] },
    ],
    triggers: [
      { x: 5, y: 10, w: 2, h: 1, when: (c) => !c.flag('has_starter'),
        script: function* (c) { yield* c.say('Wait, {player}! Choose your partner first.'); yield* c.walk('player', ['up']); } },
    ],
    onEnter: function* (c) {
      if (c.flag('intro_done')) return;
      c.set('intro_done');
      yield* c.wait(20);
      const prof = c.npc('bobbin');
      yield* c.say('Ah, {player}! There you are!');
      yield* c.walk('player', ['up', 3]);
      yield* c.say('I am Professor Bobbin. I study Kigu, the spirit-girls who wear living costumes.\\pLong ago, the land of Tsumugi was stitched together by Kigu and the people who befriended them. We call those people Tailors.');
      yield* c.say('Today you become an apprentice Tailor.\\pThree Kigu are waiting on the table. Each sits on a Bond Spool. Choose the one you like best!');
      yield* c.face(c.npc('tomo_lab'), 'left');
    },
  });

  // --------------------------------------------------------------------------------- the houses
  K.room({
    id: 'player_house', name: 'Your House', w: 10, h: 9, doorX: 4, exit: { to: 'button_town', door: 'home' },
    stamps: [{ id: 'bed', x: 7, y: 2 }, { id: 'tv', x: 2, y: 2 }, { id: 'table_s', x: 4, y: 4 }, { id: 'window', x: 4, y: 1 }, { id: 'plant', x: 8, y: 6 }, { id: 'rug_a', x: 3, y: 6 }],
    npcs: [{
      id: 'mom', x: 3, y: 4, look: 'mom', dir: 'down',
      script: function* (c) {
        if (!c.flag('has_starter')) { yield* c.say('{player}! Professor Bobbin is expecting you at her lab, just up the road.'); return; }
        if (!c.flag('mom_gift')) {
          c.set('mom_gift');
          yield* c.say('{player}! I heard you have a Kigu now. I am so proud!\\pHere, I baked these. Share them.');
          yield* c.giveItem('fancy_cake', 2);
        }
        yield* c.say('Your Kigu look tired. Sit down and have some cocoa.');
        yield* c.heal('It was a warm cup of cocoa. Your Kigu feel refreshed!');
      },
    }],
  });

  K.room({
    id: 'tomo_house', name: "{rival}'s House", w: 9, h: 8, doorX: 3, exit: { to: 'button_town', door: 'tomo' },
    stamps: [{ id: 'bookshelf', x: 1, y: 0 }, { id: 'table_s', x: 4, y: 4 }, { id: 'bed', x: 6, y: 2 }, { id: 'plant', x: 7, y: 5 }],
    npcs: [{ id: 'tomo_mom', x: 3, y: 3, look: 'elder_f', dir: 'down',
      say: ['{rival} left for the lab before breakfast.\\pThat boy would sleep in the Professor\'s doorway if he could.'] }],
  });

  K.room({
    id: 'neighbor_house', name: 'Neighbor', w: 8, h: 7, doorX: 3, exit: { to: 'button_town', door: 'neighbor' },
    stamps: [{ id: 'cloth_shelf', x: 1, y: 0 }, { id: 'table_s', x: 4, y: 3 }, { id: 'plant', x: 6, y: 4 }],
    npcs: [{ id: 'nb', x: 4, y: 4, look: 'villager_m1', dir: 'left',
      say: ['Wild Kigu in tall grass will surprise you. That is how they say hello.\\pIf one is sleepy or hurt, she may accept a Bond Spool more easily.'] }],
  });
})(typeof globalThis !== 'undefined' ? globalThis : window);
