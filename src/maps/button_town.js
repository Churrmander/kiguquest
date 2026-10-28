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
  K.rect(g, 6, 9, 16, 1, 'p');                              // lane past the lab & player house (from the house door, not the trees)
  K.rect(g, 6, 17, 17, 1, 'p');                             // lower lane
  K.rect(g, 20, 16, 3, 1, 'p');                             // the neighbour's front walk, centred on the door
  K.rect(g, 12, 18, 2, 1, 'c');
  K.rect(g, 12, 19, 2, 2, 'B');                             // the pier, where the morning boat drops the post
  K.rect(g, 9, 11, 3, 2, 'f'); K.rect(g, 15, 11, 3, 2, 'f'); K.rect(g, 3, 11, 2, 1, 'f');
  K.rect(g, 2, 2, 2, 17, 'T');                             // western wood
  K.rect(g, 22, 2, 2, 7, 'T');

  // ---- the first morning (padding beat 1): Mom asks you to peg out the sheets; {rival}'s kite is tangled in the washing line out back.
  //      Untangling it brings back the tree house promise, then the race to the lab. Nothing is locked: the lab just "is not open yet".
  function* morning(c) {
    if (c.flag('morning_done')) { yield* c.sayT('button_town.sheets.after', 'The sheets are flapping in the sea breeze. They\'re nearly dry already.'); return; }
    let t = c.npc('tomo_bt');
    yield* c.face(t, 'down');
    yield* c.sayT('button_town.morning.1', '{rival}: {player}! Thank goodness. My kite went straight into your washing line.\\pIt\'s all tangled up in the pegs. I only touched the sheets a little.');
    yield* c.ow.fadeOut(10);
    c.placeNpc('player', 7, 4, 'up');
    c.placeNpc(t, 7, 3, 'down');
    yield* c.wait(10);
    yield* c.ow.fadeIn(10);
    yield* c.sayT('button_town.morning.2', '{player} and {rival} pegged up the sheets and teased the kite string free.');
    yield* c.sayT('button_town.morning.3', '{rival}: Look, it\'s our old kite, the one with the wonky tail.\\pWe made it in the tree house, remember?');
    yield* treehouseMemory(c);
    t = c.npc('tomo_bt');   // the town was reloaded behind the memory, so this is a fresh actor
    yield* c.sayT('button_town.morning.7', '{rival}: It still counts, you know. Every single Salon.\\pNow come on! Professor Bobbin said nine sharp. ...It IS nine.');
    yield* c.sayT('button_town.morning.8', '{rival}: Race you to the lab!');
    yield* c.walk(t, ['right', 2, 'down', 6, 'right', 8, 'up', 1]);
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
    c.ow.loadMap('button_town', 7, 4, 'up', { noEnter: true });
    c.placeNpc(c.npc('tomo_bt'), 7, 3, 'down');
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

  K.reg({
    id: 'button_town', name: 'Button Town', music: 'home_town', battleBg: 'grass', border: 'treeline',
    view: 'street',   // 3D camera preset (street | town | flat-ish), see src/engine/persp.js
    legend: { '.': 'grass', T: 'treeline', p: 'path', c: 'cobble', w: 'water', f: 'flowers', F: 'fence', B: 'bridge_v' },
    rows: K.rows(g),
    stamps: [
      { id: 'house_m', x: 4, y: 5, variant: 'red', name: 'home', to: 'player_house' },
      { id: 'lab', x: 14, y: 4, name: 'lab', to: 'lab' },
      { id: 'house_m', x: 4, y: 13, variant: 'blue', name: 'tomo', to: 'tomo_house' },
      { id: 'house_s', x: 19, y: 13, variant: 'green', name: 'neighbor', to: 'neighbor_house' },
      { id: 'tree', x: 10, y: 3 }, { id: 'tree', x: 15, y: 2 }, { id: 'tree', x: 21, y: 10 }, { id: 'tree', x: 8, y: 17 }, { id: 'tree', x: 17, y: 14 },
      { id: 'sign', x: 11, y: 10, name: 'sign_town' }, { id: 'sign', x: 21, y: 8, name: 'sign_lab' },
      { id: 'mailbox', x: 9, y: 8 }, { id: 'flowerbed', x: 6, y: 11 }, { id: 'bench', x: 16, y: 10 }, { id: 'lamp', x: 14, y: 10 },
      { id: 'cloth_line', x: 5, y: 3 }, { id: 'crate', x: 13, y: 20 }, { id: 'barrel', x: 11, y: 18 },
    ],
    interact: [
      { x: 11, y: 10, say: 'BUTTON TOWN\\nA friendly harbour town. Please mind the washing lines!' },
      { x: 21, y: 8, say: "PROF. BOBBIN'S LAB\\nKigu research and tailoring." },
      { x: 5, y: 3, script: morning }, { x: 6, y: 3, script: morning },
      { x: 13, y: 20, script: parcel },
    ],
    spawns: { south: { x: 12, y: 17, dir: 'up' }, north: { x: 12, y: 2, dir: 'down' } },
    warps: [{ xs: [12, 13], y: 0, to: 'route1', spawn: 'south', sound: 'none' }],
    npcs: [
      { id: 'villager_a', x: 9, y: 12, look: 'villager_f1', dir: 'down', move: 'wander', range: 2,
        say: ['Oh, good morning! The sea breeze dries sheets in ten minutes.\\pI have never once needed a clothes peg. Don\'t tell the peg.'] },
      { id: 'kid_a', x: 16, y: 13, look: 'child_m', dir: 'left', move: 'turn',
        say: ['Is that {player}? Are you getting a Kigu today?\\pI\'m going to have one someday. Mom says I must be taller first.'] },
      { id: 'elder_a', x: 11, y: 15, look: 'elder_f', dir: 'right',
        say: ['A Kigu chooses the people she trusts, you know.\\pYou can\'t force it, and you shouldn\'t try.'] },
      { id: 'tomo_bt', x: 7, y: 3, look: 'rival', dir: 'left', hideIf: 'morning_done', script: morning },
    ],
    triggers: [
      {
        x: 12, y: 2, w: 2, h: 1, id: 'north_block',
        when: (c) => !c.flag('errand_done'),
        script: function* (c) {
          if (!c.flag('has_starter')) yield* c.sayT('button_town.north.0', 'Wait, {player}!\\pProfessor Bobbin asked to see you at her lab first.');
          else if (!c.flag('parcel_got')) yield* c.sayT('button_town.north.1', 'Wait, {player}! Did you fetch the Professor\'s parcel?\\pIt\'s on the crate at the end of the pier, south of town.');
          else yield* c.sayT('button_town.north.2', 'That parcel looks heavy, {player}!\\pProfessor Bobbin will want it before you set off.');
          yield* c.walk('player', ['down', 2]);
        },
      },
    ],
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
        yield* c.warp('button_town', 17, 9, 'down');
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
