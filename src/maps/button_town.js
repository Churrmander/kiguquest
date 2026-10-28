/* Button Town (start) + Prof. Bobbin's lab + the two houses + the tree house clearing.
 * Layout: plan "Button Town v13" (approved 2026-10-27), 32 x 24. Row letters are y (A = 0), column numbers are x + 1. */
(function (root) {
  'use strict';
  const NP = root.NP, K = NP.mapkit, L = NP.levels;

  // ------------------------------------------------------------------------------------------ town
  // plan rows verbatim. p path, c cobbles, f the flower strip (column 12), m park mulch, d shipyard boards, B pier / jetty,
  // w the sea (and the pond, repainted below), e worn grass, h the hidden path (looks like trees), k the pond grotto
  const ROWS = [
    'TTTTTTTTTTTTppTTTTTTTTTTTTTTTTTT',
    'TTTTTTTTTTTTppTTTTTTTTTTTTTTTTTT',
    'TTTT.......fpp................TT',
    'TTTT.......fppmmmmmmm.........TT',
    'TTTT.......fppmmmmmmm.........TT',
    'TTTT.......fppmmmmmmm.........TT',
    'TTTT.......fppmmmmmmm.........TT',
    'TTTT.......fppmmmmmmm.........TT',
    'TTTT........ppmmmmmmm...ppp...TT',
    'TTTT..ppppppppppppppppppppp...TT',
    'hhhhee.....fpp..........p.....TT',
    'TTTT.......fpp..........p.wwwwTT',
    'TTTT.......fpp..........p.wwwwTT',
    'TTTT.......fpp..........p.wwwkkT',
    'TTTT.......fpp..........p.wwwkkT',
    'TTTT.......fpp..........p.wwwwTT',
    'TTTT........pp..........p.wwwwTT',
    'TTTT..ppppppppppppppppppp.wwwwTT',
    'TTTT........ccdddddddddd......TT',
    'TTTT........ccdddddddddd......TT',
    'wwwwwwwwwwwwBBwwwwBwwwwwwwwwwwww',
    'wwwwwwwwwwwwBBwwwwBwwwwwwwwwwwww',
    'wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwww',
    'wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwww',
  ];

  // dir from actor a to the player (so the rival turns to whichever side you came up on)
  const toward = (a, p) => (p.y < a.y ? 'up' : p.y > a.y ? 'down' : p.x < a.x ? 'left' : 'right');

  // ---- the first morning (padding beat 1): Mom asks you to peg out the sheets; {rival}'s kite is tangled in the washing line out back.
  //      Untangling it brings back the tree house promise, then the race to the lab. Nothing is locked: the lab just "is not open yet".
  function* morning(c) {
    if (c.flag('morning_done')) { yield* c.sayT('button_town.sheets.after', 'The sheets are flapping in the sea breeze. They\'re nearly dry already.'); return; }
    let t = c.npc('tomo_bt');
    yield* c.face(t, toward(t, c.player));
    yield* c.sayT('button_town.morning.1', '{rival}: {player}! Thank goodness. My kite went straight into your washing line.\\pIt\'s all tangled up in the pegs. I only touched the sheets a little.');
    yield* c.ow.fadeOut(10);
    c.placeNpc('player', 7, 2, 'down');   // the row behind the washing line (the taller house fills the old spot at 7,4)
    c.placeNpc(t, 7, 3, 'up');
    yield* c.wait(10);
    yield* c.ow.fadeIn(10);
    yield* c.sayT('button_town.morning.2', '{player} and {rival} pegged up the sheets and teased the kite string free.');
    yield* c.sayT('button_town.morning.3', '{rival}: Look, it\'s our old kite, the one with the wonky tail.\\pWe made it in the tree house, remember?');
    yield* treehouseMemory(c);
    t = c.npc('tomo_bt');   // the town was reloaded behind the memory, so this is a fresh actor
    yield* c.sayT('button_town.morning.7', '{rival}: It still counts, you know. Every single Salon.\\pNow come on! Professor Bobbin said nine sharp. ...It IS nine.');
    // the hint for the hidden path at K1-K4 (plan v13, exact sentence)
    yield* c.sayT('button_town.morning.hint', '{rival}: Our old shortcut\'s still there, you know. Through the trees, west of your house.');
    yield* c.sayT('button_town.morning.8', '{rival}: Race you to the lab!');
    // (7,3) east along row D past the tree and the flower strip, down the main road, along row J, up the lab's lane to its door (25,7)
    yield* c.walk(t, ['right', 5, 'down', 6, 'right', 13, 'up', 2]);
    c.hideNpc('tomo_bt');
    NP.snd.sfx('door');
    c.set('morning_done');
  }

  // ---- the tree house memory (round 4: this used to be text on a plain cream screen). A warm fade into the old tree house,
  //      drawn in sepia (def.memory), with the two of you as little kids; then the same fade back to the washing line.
  function* treehouseMemory(c) {
    yield* c.ow.fadeOut(24, '#fff4e0');
    c.ow.loadMap('treehouse_memory', 1, 6, 'up', { noEnter: true });   // the player is hidden here (def.hidePlayer)
    yield* c.wait(20);
    yield* c.ow.fadeIn(30);
    yield* c.sayT('button_town.morning.4', 'Years ago, in a tree house at the edge of the wood...');
    const me = c.npc('kid_player'), you = c.npc('kid_rival');
    yield* c.walk(you, ['left', 2, 'down', 1]);
    yield* c.face(you, 'left'); yield* c.face(me, 'right');
    yield* c.sayT('button_town.memory.1', 'Little {rival}: It flies! The tail is all wonky, but it FLIES!');
    yield* c.emote(me, 'note');
    yield* c.sayT('button_town.morning.5', 'Little {rival}: When we get our Kigu, we\'ll visit every Salon, the two of us.\\pPromise? Pinky promise?');
    yield* c.emote(me, 'heart');
    yield* c.sayT('button_town.morning.6', 'Two small pinkies hooked together, and that made it official.\\p"Every Salon, together."');
    yield* c.wait(30);
    yield* c.ow.fadeOut(30, '#fff4e0');
    c.ow.loadMap('button_town', 7, 2, 'down', { noEnter: true });
    c.placeNpc(c.npc('tomo_bt'), 7, 3, 'up');
    yield* c.wait(16);
    yield* c.ow.fadeIn(24);
  }

  // ---- Prof. Bobbin's parcel (padding beat 2): fetched from the pier after the starters. A sleepy wild Chirpadee is napping on it,
  //      so the first wild battle is a little story moment instead of a random one. Any ending (win, flee, befriend) frees the parcel.
  function* parcel(c) {
    if (!c.flag('has_starter')) { yield* c.sayT('button_town.crate.0', 'There\'s a crate on the pier where the morning boat drops off the post.'); return; }
    if (c.flag('parcel_got') || c.flag('errand_done')) { yield* c.sayT('button_town.crate.after', 'The crate is empty now, though it still smells a little of the sea.'); return; }
    yield* c.sayT('button_town.crate.1', 'There\'s a parcel tied up with string sitting on the crate.\\p...And something fluffy is asleep on top of it!');
    yield* c.emote('player', 'exclaim');
    yield* c.sayT('button_town.crate.2', 'It\'s a wild Chirpadee, and she won\'t budge from her warm spot.\\pWeaken her a little, or offer a Bond Spool if she looks curious.');
    const res = yield* c.wildBattle('chirpadee', 3);
    if (res && res.caught) yield* c.sayT('button_town.crate.3a', '{player} picked up the parcel, with a brand new friend along for the walk.');
    else yield* c.sayT('button_town.crate.3b', 'The Chirpadee fluttered off to find a sunnier spot.\\p{player} picked up the parcel. It\'s addressed to Prof. Bobbin.');
    c.set('parcel_got');
  }

  const M = L.map({
    id: 'button_town', name: 'Button Town', music: 'home_town', battleBg: 'grass', border: 'treeline', w: 32, h: 24,
    view: 'street',   // 3D camera preset (street | town | flat-ish), see src/engine/persp.js
    town: true,       // no tree shaking in town (src/game/treeshake.js)
    legend: { '.': 'grass', T: 'treeline', p: 'path', c: 'cobble', f: 'flowers', w: 'sea', o: 'water', '<': 'bridge_v_w', '>': 'bridge_v_e', B: 'bridge_v',
      d: 'boardwalk', m: 'mulch', e: 'worn_grass', h: 'treeline_secret', k: 'grotto_floor' },
    onEnter: function* (c) {
      // saves from before the morning and parcel beats existed carry on as if both had happened
      if (c.flag('has_starter')) c.set('morning_done');
      if (c.flag('rival1_done') || c.flag('badge1')) c.set('errand_done');
      if (c.flag('woke') && !c.flag('morning_done') && !c.flag('kite_call')) {
        c.set('kite_call');
        yield* c.wait(16);
        yield* c.sayT('button_town.kite_call', 'Someone is calling from behind the house...\\p"{player}! Round the back! Help!"');
      }
    },
  });
  M.ascii(0, 0, ROWS);
  // the sea (rows U-X) can't be paddled; the pond (L27-R30) can, and the grotto mouth (N30-O30) is only reached across it
  M.rect(26, 11, 4, 7, 'o').set(29, 13, 'k').set(29, 14, 'k');
  // the pier (U13-V14) is a 2-wide deck; the jetty at x18 stays a single plank walk
  M.rect(12, 20, 1, 2, '<').rect(13, 20, 1, 2, '>');

  // -- buildings
  M.building('house_home', 4, 4, 'red', 'home', 'player_house');        // A: two storeys, 2-tile front door I7-I8 (both cells warp)
  M.building('lab', 22, 3, null, 'lab', 'lab');                          // B: D23-H29, door H26
  M.building('house_tall', 4, 12, 'blue', 'tomo', 'tomo_house');         // C: the rival's house, door Q7
  M.stamp('rowhouse_shop', 14, 14, 'post');                              // R1 post office (closed, no interior)
  M.building('rowhouse', 16, 14, null, 'neighbor', 'neighbor_house');    // R2 the neighbour's house, door Q17
  M.stamp('rowhouse_shop', 18, 14, 'bakery');                            // R3
  M.stamp('rowhouse_shop', 20, 14, 'tackle');                            // R4
  M.stamp('rowhouse_shop', 22, 14, 'haberdashery');                      // R5

  // -- the west side: washing line, kite scrap, Mom's planters, picnic table, well, firewood
  M.stamp('cloth_line', 5, 3);
  M.stamp('kite_snag', 8, 1);                                            // a scrap of old kite string on the branch at C9 (walk-over)
  M.stamp('herb_planter', 9, 5, 'herbs').stamp('herb_planter', 9, 6, 'tomato');
  M.stamp('picnic_table', 7, 10).stamp('well', 9, 11).stamp('flowerbed', 6, 11).stamp('firewood', 9, 16);
  M.stamp('mailbox', 9, 8);

  // -- street furniture: lamps on the corners where the side roads meet the main road, the bench beside row J
  M.stamp('lamp', 11, 7).stamp('lamp', 11, 15).stamp('lamp', 14, 10);
  M.stamp('bench', 16, 10);
  M.sign(10, 10, 'BUTTON TOWN\\nA friendly harbour town. Please mind the washing lines!', 'town sign');
  M.sign(27, 8, "PROF. BOBBIN'S LAB\\nKigu research and tailoring.", 'lab sign');
  M.trees([[10, 3], [21, 10], [8, 17]]);

  // -- Kigu Park (D15-I21): no fence, mulch underfoot, a big shade tree in the middle
  M.stamp('swing_set', 14, 3).stamp('slide', 20, 3);
  M.stamp('spring_rider', 14, 7, 'konko').stamp('spring_rider', 16, 7, 'ottopi').stamp('spring_rider', 15, 8, 'sprubun');
  M.stamp('obstacle_course', 19, 7);
  M.tree(17, 5);

  // -- the harbour: the pier crate (Bobbin's parcel), a barrel, and the little shipyard on rows S-T with two boats moored below
  M.stamp('crate', 13, 21).stamp('barrel', 11, 18);
  M.stamp('crate', 14, 18).stamp('crate', 15, 18).stamp('winch', 17, 18).stamp('net_rack', 19, 18).stamp('barrel', 22, 18).stamp('barrel', 23, 18);
  M.stamp('mooring_post', 16, 19).stamp('lobster_pots', 21, 19);
  M.stamp('boat_fishing', 15, 20).stamp('boat_cargo', 19, 20);

  // -- story interactions
  M.interact(5, 3, morning, 'washing line: the first morning').interact(6, 3, morning, 'washing line: the first morning');
  M.interact(13, 21, parcel, 'pier crate: Bobbin\'s parcel');

  // -- people
  M.npc('tomo_bt', 7, 3, 'rival', 'left', null, { hideIf: 'morning_done', script: morning });
  M.npc('villager_a', 9, 13, 'villager_f1', 'up', 'Oh, good morning! The sea breeze dries sheets in ten minutes.\\pI have never once needed a clothes peg. Don\'t tell the peg.', { move: 'wander', range: 1 });
  M.npc('kid_a', 16, 13, 'child_m', 'left', 'Is that {player}? Are you getting a Kigu today?\\pI\'m going to have one someday. Mom says I must be taller first.', { move: 'turn' });
  M.npc('elder_a', 10, 15, 'elder_f', 'right', 'A Kigu chooses the people she trusts, you know.\\pYou can\'t force it, and you shouldn\'t try.');
  M.npc('park_kid_tag', 15, 4, 'child_f', 'down', 'Tag! You\'re it! ...Oh, you\'ve got a Kigu now? Okay, she can be it too.', { move: 'turn', showIf: 'has_starter' });
  M.npc('park_kid_beam', 19, 6, 'child_m', 'down', 'I did the balance beam without falling off! Well, I fell off once. Twice.', { move: 'turn' });
  M.npc('park_kid_shake', 16, 6, 'net_kid', 'right', 'I shook a tree on Meadow Lane once and a Chirpadee fell right on my head! I think she was even more surprised than I was.', { note: 'tree-shake hint' });
  M.npc('sailor_bt', 16, 18, 'sailor', 'down', 'We ship lanterns to Loomhaven every year for the Lantern Festival. This year\'s order is the biggest I\'ve ever seen.');
  M.npc('dockhand', 19, 19, 'builder_m', 'down', 'Half the crates on the cargo boat lately are white uniforms from Crisp & Co. in Seamstead. Who needs that many uniforms?');
  M.npc('pier_fisher', 12, 20, 'fisher', 'left', 'There\'s an old angler at Hemline Lake who swears a golden fish Kigu lives under the water there. Nobody believes him.');
  M.npc('old_sailor', 25, 12, 'elder_m', 'right', 'Something shines in that little cave across the pond. You\'d need a Kigu who can paddle to find out what.');
  // the shopkeepers wait in their own recessed doorways (row R is the only lane past the rowhouses, so they stay off it)
  M.npc('postmaster', 14, 16, 'courier', 'down', 'We\'re waiting on the morning boat like everyone else. Nothing to sort until it\'s unloaded.');
  M.npc('baker', 18, 16, 'cook', 'down', 'The oven\'s still heating up. Come back after your adventure and I\'ll have buns. Don\'t tell your mum I said mine are better.');
  M.npc('tackle_owner', 20, 16, 'shopkeeper', 'down', 'No rods until the new stock comes in. Gus on Route 2 has a spare, if you can beat him.');
  M.npc('haberdasher', 22, 16, 'lady', 'down', 'Nobody buys ribbon any more since Tidy Day started. Buttons, though? Buttons always sell.');

  // -- the secret: a Wish Candy glinting in the pond grotto, visible from the shore, reached only by paddling
  M.pickup('wish_candy', 30, 13, 'wish_candy', 1, 'glinting in the pond grotto, Paddle only');
  Object.assign(M.def.props[M.def.props.length - 1], { gate: 'paddle', glint: true });

  // -- ways in and out
  // the nudge sits on row B (inside the tree gap), not row C, so walking along row C past the road behind your house is never stopped
  M.trigger({
    x: 12, y: 1, w: 2, h: 1, id: 'north_block',
    when: (c) => !c.flag('errand_done'),
    script: function* (c) {
      if (!c.flag('has_starter')) yield* c.sayT('button_town.north.0', 'Wait, {player}!\\pProfessor Bobbin asked to see you at her lab first.');
      else if (!c.flag('parcel_got')) yield* c.sayT('button_town.north.1', 'Wait, {player}! Did you fetch the Professor\'s parcel?\\pIt\'s on the crate at the end of the pier, south of town.');
      else yield* c.sayT('button_town.north.2', 'That parcel looks heavy, {player}!\\pProfessor Bobbin will want it before you set off.');
      yield* c.walk('player', ['down', 2]);
    },
  });
  M.spawn('south', 12, 17, 'up').spawn('north', 12, 2, 'down').spawn('west', 4, 10, 'right');
  M.edge('n', 12, 13, 'route1', 'south');
  M.edge('w', 10, 10, 'treehouse_clearing', 'east');                    // the hidden path K1-K4
  M.reg();

  // ---------------------------------------------------------------------------- the tree house clearing
  // A small map of its own (plan "clear", 14 x 12), through the hidden path. You come in from the east. One change from the plan:
  // a dirt tile under the ladder (6,6), since every outdoor door needs a path tile under it.
  const C = L.map({
    id: 'treehouse_clearing', name: 'Tree House Clearing', music: 'home_town', battleBg: 'forest', border: 'treeline', w: 14, h: 12,
    view: 'street', town: true,
    legend: { T: 'treeline', '.': 'grass', f: 'flowers', h: 'treeline_secret', p: 'dirt' },
  });
  C.ascii(0, 0, [
    'TTTTTTTTTTTTTT',
    'TTTTTTTTTTTTTT',
    'TTTT......TTTT',
    'TTT......ffTTT',
    'TT..........TT',
    'TT..........hh',
    'TT....p.....TT',
    'TT..........TT',
    'TTTff......TTT',
    'TTTT......TTTT',
    'TTTTTTTTTTTTTT',
    'TTTTTTTTTTTTTT',
  ]);
  C.building('treehouse', 5, 3, null, 'treehouse', 'treehouse');        // D6-F8, ladder at F7
  C.stamp('tyre_swing', 9, 6);
  C.sign(8, 6, 'SECRET BASE. No grown-ups allowed (except Mom, if she brings snacks).', 'hand-painted sign');
  C.stamp('stump', 3, 5).stamp('stump', 3, 6);                           // the two stumps you used as chairs
  C.spawn('east', 11, 5, 'left');
  C.edge('e', 5, 5, 'button_town', 'west');                              // the way back to town (F13-F14)
  C.reg();

  // the tree house itself, the same room as the memory but in the present day (no sepia, no little kids): up the ladder and back down
  K.reg({
    id: 'treehouse', name: 'The Tree House', music: 'home_town', battleBg: 'indoor', border: 'treeline', indoor: true,
    legend: { T: 'treeline', W: 'wall_wood', b: 'floor_wood' },
    rows: [
      'TTTTTTTTTT',
      'TWWWWWWWWT',
      'TWWWWWWWWT',
      'TbbbbbbbbT',
      'TbbbbbbbbT',
      'TbbbbbbbbT',
      'TbbbbbbbbT',
      'TTTTTTTTTT',
    ],
    stamps: [{ id: 'window', x: 2, y: 1 }, { id: 'window', x: 4, y: 1 }, { id: 'window', x: 6, y: 1 }, { id: 'table_s', x: 7, y: 3 },
      { id: 'tree', x: 0, y: 4 }, { id: 'tree', x: 9, y: 5 }, { id: 'tree_big', x: 0, y: 0 }, { id: 'tree_big', x: 8, y: 0 },
      { id: 'plant', x: 1, y: 3 }, { id: 'ladder', x: 8, y: 4 }],
    npcs: [], props: [], triggers: [], interact: [],
    warps: [{ x: 8, y: 6, to: 'treehouse_clearing', door: 'treehouse', sound: 'door' }],   // the ladder hole
    spawns: { door: { x: 7, y: 6, dir: 'left' } },
  });

  // -------------------------------------------------------------------------------------- the lab
  const STARTERS = [
    { sp: 'konko', x: 4, name: 'Konko', type: 'Ember', blurb: 'the Ember fox Kigu' },
    { sp: 'ottopi', x: 5, name: 'Ottopi', type: 'Tide', blurb: 'the Tide otter Kigu' },
    { sp: 'sprubun', x: 6, name: 'Sprubun', type: 'Sprout', blurb: 'the Sprout bunny Kigu' },
  ];
  // owner's rule: the rival (a friend, not a bully) takes the starter that is weak to yours, so your first fights lean your way
  const WEAK = { konko: 'sprubun', ottopi: 'konko', sprubun: 'ottopi' };

  function* pick(c, s) {
    if (c.flag('has_starter')) return;
    yield* c.say('It\'s ' + s.name + ', ' + s.blurb + '.\\pShe\'s wearing ' + (/^[AEIOU]/i.test(s.type) ? 'an ' : 'a ') + s.type + ' costume and waiting quietly on her spool.');
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
    const rs = WEAK[s.sp];
    c.state.rivalStarter = rs;
    const tomo = c.npc('tomo_lab');
    yield* c.emote(tomo, 'exclaim');
    const rp = STARTERS.find((x) => x.sp === rs);
    yield* c.say('{rival}: Then I pick ' + rp.name + '! Yours has the edge on mine, I know.\\pThat just means I have to train twice as hard!');
    yield* c.walk(tomo, ['down', 1, 'left', 9 - rp.x, 'up', 1]);
    yield* c.face(tomo, 'up');
    c.hideProp('starter_' + rs);
    yield* c.say('{rival} took ' + rp.name + ' from the table.');
    yield* c.say('Now then, you two, take these.\\pEvery Tailor needs a few Bond Spools, and Kigu love snack cakes.');
    yield* c.giveItem('bond_spool', 5);
    yield* c.giveItem('snack_cake', 3);
    yield* c.giveItem('sketchbook', 1);
    yield* c.say('Bond Spools let you offer friendship to wild Kigu.\\pShe will only accept if she wants to, so be gentle.\\pMeadow Lane leads on to Thimble, where Master Poppy runs the first Salon.');
    yield* c.say('{rival}: Race you to Thimble! Last one there carries the snack cakes!');
    yield* c.walk(tomo, ['down', 1, 'right', 7 - rp.x, 'down', 3]);
    c.hideNpc('tomo_lab');
    c.set('tomo_left_lab');
    yield* c.sayT('lab.errand.1', 'Oh! {player}, before you go, I have one small favour to ask, dear.\\pA parcel came in on the morning boat, and it\'s sitting on the pier.\\pWould you fetch it for me? Your new partner can stretch her legs.');
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
          if (!c.flag('has_starter')) { yield* c.say('Take your time, {player}. Step up to the table and look at each spool.\\pThere\'s a Kigu waiting on every one.'); return; }
          if (!c.flag('errand_done')) {
            if (!c.flag('parcel_got')) { yield* c.sayT('lab.errand.2', 'The parcel is on the crate at the end of the pier, dear.\\pJust head straight down the main road, past the cobbles.'); return; }
            yield* c.sayT('lab.errand.3', 'My parcel! Thank you, {player}. Let\'s see...\\pOh, these are my new Town Maps! And they sent two, the dears.');
            yield* c.sayT('lab.errand.4', 'Keep this one. Every Tailor should know where the road goes.');
            yield* c.giveItem('town_map', 1);
            yield* c.sayT('lab.errand.share.1', 'Oh, one more thing! This is an Exp Share.\\pWith it, Kigu who wait on the bench still learn from every battle.\\pThey get half the Exp. Points, so nobody gets left behind.');
            yield* c.giveItem('exp_share', 1);
            yield* c.sayT('lab.errand.share.2', 'It\'s switched on already. If you\'d rather one Kigu did all the learning,\\pyou can switch it off in your Key Items.');
            yield* c.heal('And let me patch up your partner after her first adventure.\\pYour Kigu are feeling much better!');
            c.set('errand_done');
            yield* c.sayT('lab.errand.5', 'Meadow Lane is just north of town, and Thimble Village is past Basting Green.\\p{rival} has a head start, but I doubt that will last. Off you go!');
            return;
          }
          yield* c.say('Meadow Lane is full of wild Kigu. Offer a Bond Spool when one looks curious.\\pAnd do visit the Tea House in Thimble. Their cocoa is famous.\\pHave you seen my tape measure? ...Oh. Around my neck. Again.');
        } },
      { id: 'tomo_lab', x: 9, y: 6, look: 'rival', dir: 'left', hideIf: 'tomo_left_lab',
        script: function* (c) { yield* c.say('{rival}: Come on, {player}! I saved you the spot by the window.\\pBobbin\'s already tapping her pencil.'); } },
      { id: 'aide1', x: 2, y: 7, look: 'aide_f', dir: 'right', say: ['These are this year\'s apprentice spools.\\pThey\'ve been waiting for you two for weeks!'] },
      { id: 'aide2', x: 9, y: 9, look: 'aide_m', dir: 'up', say: ['The Sketchbook records every Kigu you meet.\\pThe Professor hopes you\'ll fill it.', 'See the photo on her desk? It\'s two girls, laughing their heads off.\\pOne of them is folding a napkin in thirds. Nobody ever asks who they are.'] },
    ],
    triggers: [
      { x: 5, y: 10, w: 2, h: 1, when: (c) => !c.flag('has_starter'),
        script: function* (c) { yield* c.say('Wait, {player}! Choose your partner first.'); yield* c.walk('player', ['up']); } },
    ],
    onEnter: function* (c) {
      if (c.flag('intro_done')) return;
      if (!c.flag('morning_done')) {
        // too early: the lab "is not open yet", which points you at the washing line without a locked door
        yield* c.wait(10);
        yield* c.sayT('lab.early', 'Prof. Bobbin: Oh! {player}, you\'re early, dear. I\'m still dusting the spools.\\pDid your mother not ask you to peg out the sheets? Go on, I\'ll be ready.');
        yield* c.warp('button_town', 25, 8, 'down');
        return;
      }
      c.set('intro_done');
      yield* c.wait(20);
      const prof = c.npc('bobbin');
      yield* c.say('Ah, {player}! There you are!');
      yield* c.walk('player', ['up', 3]);
      yield* c.say('I\'m Professor Bobbin, and I study Kigu.\\pThey\'re spirit-girls who wear living costumes.\\pLong ago, Kigu and the people who befriended them\\nstitched Tsumugi together.\\pWe call those people Tailors.');
      yield* c.say('Today you\'re going to become an apprentice Tailor.\\pThere are three Kigu waiting on the table, each on her own Bond Spool.\\pChoose whichever one you like best!');
      yield* c.say('{rival}: I should pick first! I was up before anyone this morning.\\pI was on the roof watching the sea before the sun was even out.');
      yield* c.say('Guests choose first, {rival}. Besides, {player} decides faster than you do.');
      yield* c.say('{rival}: Fine! Then I\'ll pick after you.\\pChoose a good one, {player}!');
      yield* c.face(c.npc('tomo_lab'), 'left');
    },
  });

  // the tree house, as a memory: only ever seen inside the morning scene (no way in or out on foot). A plank deck up in the
  // leaves with a wooden back wall, the ladder hole in the floor, the kite on the table.
  K.reg({
    id: 'treehouse_memory', name: 'The Tree House', music: 'home_town', battleBg: 'indoor', border: 'treeline', indoor: true,
    memory: true, hidePlayer: true,
    legend: { T: 'treeline', W: 'wall_wood', b: 'bridge_h', o: 'void' },
    rows: [
      'TTTTTTTTTT',
      'TWWWWWWWWT',
      'TWWWWWWWWT',
      'TbbbbbbbbT',
      'TbbbbbbbbT',
      'TbbbbbbbbT',
      'TbbbbbbboT',
      'TTTTTTTTTT',
    ],
    stamps: [{ id: 'window', x: 2, y: 1 }, { id: 'window', x: 4, y: 1 }, { id: 'window', x: 6, y: 1 }, { id: 'table_s', x: 7, y: 3 },
      { id: 'tree', x: 0, y: 4 }, { id: 'tree', x: 9, y: 5 }, { id: 'tree_big', x: 0, y: 0 }, { id: 'tree_big', x: 8, y: 0 },
      { id: 'plant', x: 1, y: 3 }, { id: 'ladder', x: 8, y: 4 }],
    npcs: [
      { id: 'kid_player', x: 4, y: 5, look: 'player_kid', dir: 'up' },
      { id: 'kid_rival', x: 7, y: 4, look: 'rival_kid', dir: 'left' },
    ],
    props: [], triggers: [], interact: [], warps: [], spawns: { door: { x: 1, y: 6, dir: 'up' } },
  });

  // --------------------------------------------------------------------------------- the houses
  K.room({
    id: 'player_house', name: 'Your House', w: 10, h: 9, doorX: 4, exit: { to: 'button_town', door: 'home' },
    stamps: [{ id: 'bed', x: 7, y: 2 }, { id: 'tv', x: 2, y: 2 }, { id: 'table_s', x: 4, y: 4 }, { id: 'window', x: 4, y: 1 }, { id: 'plant', x: 8, y: 6 }, { id: 'rug_a', x: 3, y: 6 }],
    npcs: [{
      id: 'mom', x: 3, y: 4, look: 'mom', dir: 'down',
      script: function* (c) {
        if (!c.flag('morning_done')) { yield* c.sayT('player_house.mom.sheets', 'Sheets first, love! The washing line is round the back of the house.'); return; }
        if (!c.flag('has_starter')) { yield* c.say('{player}! Professor Bobbin is expecting you.\\pHer lab is just up the road. Go on, shoo!'); return; }
        if (!c.flag('mom_gift')) {
          c.set('mom_gift');
          yield* c.say('{player}! I heard you have a Kigu now. I\'m so proud!\\pHere, I baked these for you. Make sure you share them!');
          yield* c.giveItem('fancy_cake', 2);
        }
        yield* c.say('Your Kigu look tired, love. Sit down and have some cocoa.');
        yield* c.heal('It was a warm cup of cocoa. Your Kigu feel refreshed!');
      },
    }],
    // a new game starts here, beside the bed, on the morning of the big day
    onEnter: function* (c) {
      if (c.flag('woke') || c.flag('has_starter')) return;
      c.set('woke');
      yield* c.wait(30);
      yield* c.face(c.npc('mom'), 'right');
      yield* c.sayT('player_house.wake.1', 'Mom: {player}! Up you get, sleepyhead. Today is your big day!\\pProfessor Bobbin is expecting you at nine.');
      yield* c.sayT('player_house.wake.2', 'Mom: Before you go, would you peg the sheets out for me?\\pThe washing line is round the back of the house. Thank you, love!');
      yield* c.face(c.npc('mom'), 'down');
    },
  });

  K.room({
    id: 'tomo_house', name: "{rival}'s House", w: 9, h: 8, doorX: 3, exit: { to: 'button_town', door: 'tomo' },
    stamps: [{ id: 'bookshelf', x: 1, y: 0 }, { id: 'table_s', x: 4, y: 4 }, { id: 'bed', x: 6, y: 2 }, { id: 'plant', x: 7, y: 5 }],
    npcs: [{ id: 'tomo_mom', x: 3, y: 3, look: 'elder_f', dir: 'down',
      say: ['Oh, {player}! Come in, come in. {rival} left for the lab before breakfast.\\pThey didn\'t even finish their toast. Tell them I said so!', 'Always welcome here, sweetheart. Dinner\'s at six, and your chair is ready.'] }],
  });

  K.room({
    id: 'neighbor_house', name: 'Neighbor', w: 8, h: 7, doorX: 3, exit: { to: 'button_town', door: 'neighbor' },
    stamps: [{ id: 'cloth_shelf', x: 1, y: 0 }, { id: 'table_s', x: 4, y: 3 }, { id: 'plant', x: 6, y: 4 }],
    npcs: [{ id: 'nb', x: 4, y: 4, look: 'villager_m1', dir: 'left',
      say: ['Wild Kigu in tall grass will surprise you. That\'s how they say hello.\\pIf one is sleepy or hurt, she may accept a Bond Spool more easily.'] }],
  });
})(typeof globalThis !== 'undefined' ? globalThis : window);
