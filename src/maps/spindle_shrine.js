/* Spindle Shrine — a grand Japanese temple deep in Gingham Woods (owner's art direction, STORY Ch2, 2026-10-26). Two maps:
 *   spindle_shrine       the grounds: a red torii on the stone approach, stone lanterns, raked gravel, a koi pond and water basin, a
 *                        sacred tree, and the great hall at the top. The road east goes to Hemline, the approach south to Gingham Woods.
 *   spindle_shrine_hall  inside: a tall wooden hall with pillars, the woven ward across the inner doorway, and the Everspool high on its
 *                        pedestal above the altar steps.
 * The Society incident (owner-approved order, 2026-11-05 plan):
 *   outside  Pin and Welt guard the hall steps; Pin's Wyvrant lounges beside them and ignores him. Two battles.      flag shrine_outside
 *   inside   Pleat Crease at the altar with the Pressed Vowspun (the ward holder) and the Pressed head Mikoga; the ward hangs slack.
 *            Breather, the Crease battle, the snip. Mimi's first Soft Rinse wakes the Vowspun (the ward rises again), then the
 *            Mikoga. Crease sets Pin's Wyvrant on you: a set-piece battle (src/game/battle/setpiece.js) where the Mikoga heal you
 *            and she gives up at 10% HP and stomps off to sulk. The shrine's Mikoga line up between you and the Pressers, who leave.
 *                                                                                                                         flag shrine1_done
 * The temple looks "pressed" until shrine1_done. Downstream maps (Hemline, Route 2's checkpoint, Bryn) only read shrine1_done/rinse_done. */
(function (root) {
  'use strict';
  const NP = root.NP, L = NP.levels;

  function* walkAndHide(c, id, steps, spd) { yield* c.walk(id, steps, spd); c.hideNpc(id); }
  const k = (s) => 'spindle_shrine.' + s;

  // ======================================================================================== the grounds
  function* outside(c) {
    yield* c.face('player', 'up');
    yield* c.emote('player', 'exclaim');
    yield* c.jingleWait('j_encounter_society');
    c.music('society_theme');
    yield* c.sayT(k('out.1'), 'Pin: Halt, please! This shrine is under inspection by the Starch Society for Tidy Living.');
    yield* c.sayT(k('out.2'), 'Welt: Visitors have to wait behind the line until the Pleat is finished. Flat is fair!');
    yield* c.sayT(k('out.3'), 'Pin: Wyvrant! Get up and look scary, would you? You\'re supposed to be guarding the steps.');
    yield* c.emote('wyvrant_o', 'note');
    yield* c.sayT(k('out.4'), 'The Wyvrant yawned, rolled over, and went on sunning herself on the warm stone.');
    yield* c.sayT(k('out.5'), 'Pin: ...She\'s been like this all morning. Fine. I\'ll do it myself.');
    const tp = c.ow.spawn(c.walk('pin', ['down', 2], 2), 'walk');
    yield* c.walk('welt', ['down', 2], 2);
    while (!tp.done) yield;

    if (!c.flag('shrine_pin')) {
      yield* c.sayT(k('pin.intro'), 'Pin: Flat is fair! I\'ll be quick about it. I\'d like to be home for supper.');
      yield* c.trainerBattle({ cls: 'Presser', name: 'Pin', look: 'grunt_m', ai: 1, reward: 8, music: 'battle_society', team: L.team([['kittabra', 10], ['nibblit', 10]]) });
      c.set('shrine_pin');
      c.music('society_theme');
      yield* c.sayT(k('pin.win'), 'Pin: ...Flat is fair. Flat is... Do you think there\'s bread at supper?');
    }
    if (!c.flag('shrine_welt')) {
      yield* c.sayT(k('welt.intro'), 'Welt: Excuse me, your collar is a little untidy. May I? ...There.\\pNow, where were we? Right. Battle!');
      yield* c.trainerBattle({ cls: 'Presser', name: 'Welt', look: 'grunt_f', ai: 1, reward: 8, music: 'battle_society', team: L.team([['chirpadee', 10], ['acolarva', 11]]) });
      c.set('shrine_welt');
      c.music('society_theme');
      yield* c.sayT(k('welt.win'), 'Welt: I keep folding things, and I can\'t stop. Is that normal?');
    }
    yield* c.sayT(k('out.6'), 'Pin: The Pleat is going to hear about this. Welt, inside! Quickly!');
    const t1 = c.ow.spawn(walkAndHide(c, 'pin', ['up', 2, 'right', 1, 'up', 1], 2), 'walk');
    yield* walkAndHide(c, 'welt', ['up', 2, 'left', 1, 'up', 1], 2);
    while (!t1.done) yield;
    NP.snd.sfx('door');
    c.set('shrine_outside');
    c.music('forest_gingham');
  }

  const M = L.map({
    id: 'spindle_shrine', name: 'Spindle Shrine', music: 'forest_gingham', battleBg: 'forest', border: 'treeline', w: 26, h: 24, fill: 'T', town: true,
    view: 'town',   // 3D camera preset (street | town | flat-ish), see src/engine/persp.js
    legend: { '.': 'grass', T: 'treeline', g: 'gravel', s: 'sando', w: 'water', f: 'flowers' },
    onEnter: function* (c) { L.syncStamps(c); },
  });

  M.rect(3, 2, 20, 20, '.');
  M.rect(9, 8, 8, 12, 'g');                 // the raked gravel courtyard round the approach
  M.rect(5, 8, 16, 2, 'g');                 // ...and the gravel apron along the front of the hall
  M.rect(12, 8, 2, 16, 's');                // the stone approach from the woods to the hall steps
  M.rect(9, 8, 8, 1, 's');                  // a paved forecourt along the foot of the hall steps
  M.rect(16, 11, 10, 2, 's');               // the road east to Hemline
  M.rect(4, 15, 4, 3, 'w');                 // koi pond
  M.rect(4, 10, 3, 1, 'f').rect(19, 9, 3, 1, 'f').rect(18, 18, 3, 1, 'f').rect(4, 19, 3, 1, 'f');

  M.building('temple', 7, 2, 'pressed', 'hall', 'spindle_shrine_hall');
  L.variantByFlag(M.def.stamps[M.def.stamps.length - 1], 'shrine1_done', 'pressed', 'default');
  M.stamp('torii', 11, 15);
  for (const [x, y] of [[10, 9], [15, 9], [10, 13], [15, 13]]) M.stamp('stone_lantern', x, y);
  M.stamp('basin', 4, 12);
  M.stamp('sacred_tree', 19, 14);
  M.trees([[3, 3], [21, 3], [3, 6], [22, 6], [20, 19], [8, 19], [16, 19], [3, 20]]);
  M.trees([[5, 3], [19, 3], [22, 15]], 'pine');
  M.stamp('bench', 17, 15).stamp('bush', 8, 13).stamp('bush', 17, 9).stamp('boulder', 9, 17).stamp('boulder', 16, 17);
  M.sign(14, 21, 'SPINDLE SHRINE\\nPlease keep your voices down, and please don\'t pull on the thread.', 'shrine sign');

  M.spawn('south', 12, 22, 'up').spawn('east', 24, 11, 'left');
  M.edge('s', 12, 13, 'gingham_woods', 'north').edge('e', 11, 12, 'hemline', 'west');

  // the Pressers guard the steps; Pin's Wyvrant sprawls on the warm stone beside them
  M.npc('pin', 12, 8, 'grunt_m', 'down', ['Pin: Flat is fair!'], { hideIf: 'shrine_outside' });
  M.npc('welt', 13, 8, 'grunt_f', 'down', ['Welt: Stay behind the line, please.'], { hideIf: 'shrine_outside' });
  M.npc('wyvrant_o', 15, 8, 'kigu:wyvrant', 'left', ['The Wyvrant opens one eye, looks at you, and closes it again.'], { hideIf: 'shrine1_done', note: 'Pin\'s Wyvrant, lounging' });
  // after the incident: two Acolarva initiates sweep the gravel
  M.npc('acolarva_1', 17, 10, 'kigu:acolarva', 'left', ['Acolarva: Sii!\\pShe\'s sweeping the gravel into neat little rows, one wave at a time.'], { showIf: 'shrine1_done', move: 'turn' });
  M.npc('acolarva_2', 6, 9, 'kigu:acolarva', 'right', ['Acolarva: Sii, sii!\\pShe bows to you, then gets straight back to her raking.'], { showIf: 'shrine1_done' });

  // the incident starts under the torii; the approach is two tiles wide here, so nobody slips past to Hemline first
  M.trigger({ x: 12, y: 18, w: 2, h: 1, id: 'spindle_shrine', when: (c) => !c.flag('shrine_outside'), script: outside });
  M.reg();

  // ======================================================================================== the hall
  function* incident(c) {
    const crease = c.npc('crease'), coco = c.npc('vowspun'), miko = c.npc('mikoga');
    // into the hall, face the altar
    yield* c.walk('player', c.player.x < 7 ? ['right', 7 - c.player.x, 'up', 1] : c.player.x > 7 ? ['left', c.player.x - 7, 'up', 1] : ['up', 1]);
    yield* c.face('player', 'up');
    c.music('society_theme');
    yield* c.sayT(k('in.1'), 'The air in the hall felt flat and still. The ward across the inner doorway hung slack and dull.');
    crease.dir = 'down';
    yield* c.emote(crease, 'exclaim');
    yield* c.sayT(k('in.2'), 'Crease: Not one crease out of place! ...Hm? You got past Pin and Welt?\\pI\'m Pleat Crease, of the Starch Society for Tidy Living. This shrine is under inspection.');
    yield* c.sayT(k('in.3'), 'Crease: We came to measure the Everspool, the straightest thread in the world.\\pSo we pressed the head shrine maiden, and nothing happened. That woven ward stayed up.');
    yield* c.sayT(k('in.4'), 'Crease: It took me a whole morning to work out that the ward lives in the little Vowspun\'s cocoon.\\pSo we pressed her too. See how calm she is now? Aren\'t you, dear?');
    yield* c.sayT(k('in.5'), 'Vowspun: ...Yes, Tailor.');
    yield* c.sayT(k('in.6'), '{player} stared. The Vowspun and the Mikoga beside her had been bleached white, with neat blue piping.\\pNeither of them blinked.');
    yield* c.sayT(k('in.7'), 'Crease: You, though, are a little crooked at the hem. I\'ll measure you myself.');
    // a breather first: three story fights in a row with no Tea House near
    NP.State.healAll();
    yield* c.sayT(k('breather'), '{player}\'s Kigu shook out their costumes and took a deep breath.');
    yield* c.walk(crease, ['down', 2], 2);
    crease.dir = 'down';
    yield* c.trainerBattle({ cls: 'Pleat', name: 'Crease', look: 'pleat', ai: 2, reward: 14, music: 'battle_admin', team: L.team([['chirpadee', 12], ['acolarva', 13], ['spinnet', 14]]) });
    c.music('society_theme');
    yield* c.sayT(k('crease.win.1'), 'Crease: A crease. ...One single crease, right on my own sleeve.\\pI hate that.');
    // the snip
    yield* c.walk(crease, ['up', 2], 2);
    crease.dir = 'up';
    NP.snd.sfx('leaf');
    yield* c.sayT(k('crease.win.2'), 'Crease unfolded her ruler and snipped a bit of the Everspool\'s thread.\\pThe spool kept on turning.');
    yield* c.walk(crease, ['down', 2], 2);
    crease.dir = 'down';
    yield* c.sayT(k('crease.win.3'), 'Crease: A little sample will do. We only need the measurements, after all.');

    // Mimi runs in with her invention, up through the slack ward to the altar
    c.music('forest_gingham');
    const mimi = c.npc('mimi_s');
    c.placeNpc(mimi, 8, 13, 'up');
    c.showNpc('mimi_s');
    NP.snd.sfx('door');
    yield* c.walk(mimi, ['up', 2], 2);
    yield* c.sayT(k('rinse.1'), 'Mimi: {player}! Wait up! I followed you all the way from Thimble!');
    yield* c.sayT(k('rinse.2'), 'Mimi: Seeing those white collars on the bridge got me thinking!\\pStarch is just a stiff coating, right? So the opposite of starch must be...\\p...water, lavender, and a little bit of nerve!');
    yield* c.sayT(k('rinse.3'), 'Mimi: I call it Soft Rinse. I\'ve only ever tried it on a handkerchief, so here goes!');
    yield* c.walk(mimi, ['up', 5], 2);   // up the middle of the steps, between the two maidens
    mimi.dir = 'left';
    yield* c.sayT(k('rinse.4'), 'Mimi dabbed the Vowspun gently with the Soft Rinse.');
    yield* c.ow.fadeOut(10, '#ffffff');
    yield* c.jingleWait('j_heal');
    c.set('shrine_rinsed');
    coco.look = 'kigu:vowspun';
    yield* c.ow.fadeIn(10);
    yield* c.sayT(k('rinse.5'), 'The blue piping washed right out of her costume.\\pThen her colour came back, a little at a time.');
    yield* c.emote(coco, 'exclaim');
    yield* c.sayT(k('rinse.6'), 'Vowspun: Coco!');
    // the ward rises again
    c.set('shrine_ward');
    L.syncStamps(c);
    NP.snd.sfx('save');
    yield* c.sayT(k('rinse.7'), 'The slack threads across the inner doorway pulled tight and began to shimmer. The woven ward was back up.');
    mimi.dir = 'right';
    yield* c.sayT(k('rinse.8'), 'Mimi: It WORKED! Okay, okay. One more. I know the trick now.');
    yield* c.ow.fadeOut(8, '#ffffff');
    yield* c.jingleWait('j_heal');
    c.set('shrine_miko_rinsed');
    miko.look = 'kigu:mikoga';
    yield* c.ow.fadeIn(8);
    yield* c.emote(miko, 'exclaim');
    yield* c.sayT(k('rinse.9'), 'The head Mikoga shook out her great white-and-red wings and looked around her hall.\\pShe didn\'t look pleased with what she saw.');
    yield* c.walk(mimi, ['down', 5], 2);
    mimi.dir = 'up';

    // Crease is shut out of the sanctum, and sets Pin's Wyvrant on you
    c.music('society_theme');
    yield* c.sayT(k('wyv.1'), 'Crease: How tiresome. Pin! Your Wyvrant. Deal with this, please.');
    const pin = c.npc('pin');
    yield* c.emote(pin, 'sweat');
    yield* c.sayT(k('wyv.2'), 'Pin: Wyvrant! In here, now! ...Please?');
    const wy = c.npc('wyvrant');
    c.placeNpc(wy, 7, 13, 'up');
    c.showNpc('wyvrant');
    NP.snd.sfx('door');
    yield* c.wait(6);
    yield* c.face('player', 'down');
    yield* c.walk(wy, ['up', 1], 2);
    yield* c.sayT(k('wyv.3'), 'The Wyvrant kicked the doors open and stomped in, smoke curling from her nose.\\pShe glared at Pin, then at you.');
    yield* c.sayT(k('wyv.4'), 'Pin: Get them! ...No, not me! Them!');
    yield* c.sayT(k('wyv.5'), 'The Wyvrant clearly wasn\'t doing this because Pin said so. She just wanted a fight.\\pThe shrine\'s Mikoga scattered behind the pillars. Moths with paper wings don\'t like fire.');
    yield* c.wildBattle('wyvrant', 30, {
      music: 'battle_master', noCatch: { first: 'The Wyvrant swatted the spool away. She\'s far too angry to listen!', again: 'She won\'t even look at the spool.' },
      kigu: { moves: ['cinder', 'scorch_tail', 'wyrm_breath', 'hissy_fit'], nature: 'naughty' },
      intro: 'Pin\'s Wyvrant wants a fight!',
      setPiece: {
        helper: 'The Mikoga', heal: 0.5, chip: 1 / 9, enrage: 0.35, endAt: 0.1,
        lines: {
          join: 'Watching you stand up to her, the shrine\'s Mikoga found their nerve and came out from behind the pillars!',
          heal: 'The Mikoga wrapped {mon} in warm silk!',
          chip: 'The Mikoga beat their wings together and sent a Gust at {foe}!',
          enrage: '{foe} is furious that they\'re helping! She can hardly aim!',
          end: '{foe} has had enough. She\'s sulking!',
        },
      },
    });
    c.set('shrine_wyvrant');
    c.music('society_theme');
    yield* c.sayT(k('wyv.6'), 'The Wyvrant folded her arms, turned her back on everyone, and stomped out of the hall.\\pShe flew off over the trees to sulk somewhere.');
    yield* walkAndHide(c, 'wyvrant', ['down', 1], 2);
    yield* c.face('player', 'up');

    // the Mikoga fly in from every side and form a line between the Pressers and you and Mimi
    NP.snd.sfx('leaf');
    for (let i = 0; i < 5; i++) {
      const id = 'mikoga_' + i, x = [5, 6, 7, 8, 10][i];
      c.placeNpc(c.npc(id), x, 10, 'up');
      c.showNpc(id);
      yield* c.wait(6);
    }
    yield* c.walk(miko, ['down', 4], 2);   // the head maiden comes down through her own ward and takes her place in the line
    miko.dir = 'up';
    yield* c.sayT(k('line.1'), 'The Mikoga fluttered down from the rafters and the corners of the hall,\\pand formed a line between the Pressers and {player} and Mimi.');
    yield* c.sayT(k('line.2'), 'Crease: ...Very well. We have what we came for.\\pThe Society is patient, Tailor. We\'ll be in touch.');
    yield* c.sayT(k('line.3'), 'Crease: Fall in, Pin. Fall in, Welt. ...Welt, put that streamer back.');
    // out along the north side of the line to the side door, one after another
    yield* walkAndHide(c, 'welt', ['right', 4], 2);
    yield* walkAndHide(c, 'crease', ['right', 7], 2);
    yield* walkAndHide(c, 'pin', ['right', 9], 2);
    NP.snd.sfx('door');
    c.music('forest_gingham');
    yield* c.sayT(k('line.4'), 'The Pressers slipped out through the side door.');
    for (let i = 0; i < 5; i++) c.hideNpc('mikoga_' + i);
    yield* c.sayT(k('line.5'), 'The Mikoga bowed to {player} one by one, then flew back up into the rafters.');
    yield* c.walk(miko, ['up', 4], 2);
    miko.dir = 'down';

    yield* c.face('player', 'right');
    mimi.dir = 'left';
    yield* c.sayT(k('end.1'), 'Mimi: Soft Rinse really works! Twice! And we didn\'t even get set on fire!\\p...I need to write all of this down. Every single bit of it, right now.');
    yield* c.sayT(k('end.2'), 'Mimi: Hemline\'s just up the road, and Bryn runs the Salon there.\\pShe\'s the Warden of these woods too, so I\'ll run ahead and tell her.\\pMeet me there!');
    yield* walkAndHide(c, 'mimi_s', ['down', 3], 2);
    NP.snd.sfx('door');
    c.set('shrine1_done');
    c.set('rinse_done');
    L.syncStamps(c);
  }

  const H = L.room({
    id: 'spindle_shrine_hall', name: 'Spindle Shrine', w: 16, h: 15, doorX: 7, floor: 'floor_temple', wall: 'wall_temple', music: 'forest_gingham', battleBg: 'forest',
    exit: { to: 'spindle_shrine', door: 'hall' }, carpet: [7, 9, 2, 5], carpetTerrain: 'shrine_runner',
  });
  H.def.onEnter = function* (c) { L.syncStamps(c); };
  // the partition with the inner doorway, and the ward hanging across it
  H.rect(1, 8, 3, 1, 'W').rect(12, 8, 3, 1, 'W');
  H.stamp('temple_pillar', 3, 7).stamp('temple_pillar', 12, 7);   // posts cap the partition either side of the doorway
  for (let x = 4; x <= 11; x++) { H.stamp('ward', x, 8, 'down'); L.variantByFlag(H.def.stamps[H.def.stamps.length - 1], 'shrine_ward', 'down', 'up'); }
  // the sanctum: the Everspool high on its pedestal above the altar steps
  H.stamp('everspool', 7, 2);
  H.stamp('altar_steps', 4, 5);
  for (const x of [2, 5, 10, 13]) H.stamp('shide', x, 1);
  for (const [x, y] of [[3, 10], [12, 10], [3, 12], [12, 12]]) H.stamp('temple_pillar', x, y);
  H.stamp('stone_lantern', 2, 3, 'dark').stamp('stone_lantern', 13, 3, 'dark');

  H.npc('crease', 7, 7, 'pleat', 'up', ['Crease: Not one crease out of place!'], { hideIf: 'shrine1_done' });
  H.npc('pin', 5, 9, 'grunt_m', 'up', ['Pin: Flat is fair!'], { hideIf: 'shrine1_done' });
  H.npc('welt', 10, 9, 'grunt_f', 'up', ['Welt: Stay in line, please.'], { hideIf: 'shrine1_done' });
  // the ward holder: Pressed until Mimi's rinse; afterwards her warm silk heals your team, as the old shrine's did
  const coco = { id: 'vowspun', x: 7, y: 6, dir: 'down', say: null, script: function* (c) {
    if (!c.flag('shrine1_done')) { yield* c.sayT('spindle_shrine.vowspun.1', 'Vowspun: ...Yes, Tailor.'); return; }
    yield* c.sayT('spindle_shrine.vowspun.2', 'Vowspun: Coco! Coco!\\pShe wrapped {player}\'s Kigu in warm silk for a moment.');
    NP.snd.sfx('save');
    NP.State.healAll();
    yield* c.sayT('spindle_shrine.vowspun.3', 'Your Kigu feel rested and snug.');
  } };
  L.lookByFlag(coco, 'shrine_rinsed', 'cocoona_pressed', 'kigu:vowspun');
  H.def.npcs.push(coco);
  const miko = { id: 'mikoga', x: 9, y: 6, dir: 'down', say: null, script: function* (c) {
    if (!c.flag('shrine1_done')) { yield* c.sayT('spindle_shrine.mikoga.1', 'Mikoga: ...Yes, Tailor.'); return; }
    yield* c.sayT('spindle_shrine.mikoga.2', 'Mikoga: Mii-ko.\\pThe head shrine maiden bows low, wings folded. Behind her, the ward parts a little to let your Kigu through.');
  } };
  L.lookByFlag(miko, 'shrine_miko_rinsed', 'kigu:mikoga~pressed', 'kigu:mikoga');
  H.def.npcs.push(miko);
  for (let i = 0; i < 5; i++) H.npc('mikoga_' + i, 1, 13 - i, 'kigu:mikoga', 'up', null, { hidden: true });
  H.npc('mimi_s', 8, 13, 'mimi', 'up', ['Mimi: Soft Rinse! Patent pending!'], { hidden: true });
  H.npc('wyvrant', 7, 13, 'kigu:wyvrant', 'up', null, { hidden: true });
  function* everspool(c) {
    if (!c.flag('shrine1_done')) return;
    yield* c.sayT('spindle_shrine.everspool.1', 'The Everspool turns slowly on its pedestal.\\pIt\'s a single golden-green thread, perfectly straight, and it never runs out.');
    yield* c.sayT('spindle_shrine.everspool.2', 'There\'s a neat little cut where Crease snipped it.\\pThe thread is already growing back.');
  }
  H.interact(7, 4, everspool, 'the Everspool').interact(8, 4, everspool, 'the Everspool');

  H.trigger({ x: 4, y: 12, w: 8, h: 1, id: 'spindle_shrine_hall', when: (c) => c.flag('shrine_outside') && !c.flag('shrine1_done'), script: incident });
  H.reg();
})(typeof globalThis !== 'undefined' ? globalThis : window);
