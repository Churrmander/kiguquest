/* Spindle Shrine — the clearing where the Everspool lives. The Society shrine incident (Pleat Crease, two Pressers, a Pressed Cocoona)
 * and Mimi's first Soft Rinse. The shrine stamp looks "pressed" until `shrine1_done`. Exit east to Hemline. */
(function (root) {
  'use strict';
  const NP = root.NP, L = NP.levels;

  // exits walk off concurrently so the scene does not crawl
  function* walkAndHide(c, id, steps, spd) { yield* c.walk(id, steps, spd); c.hideNpc(id); }

  function* incident(c) {
    const crease = c.npc('crease'), pin = c.npc('pin'), welt = c.npc('welt'), coco = c.npc('cocoona');
    const k = (s) => 'spindle_shrine.' + s;
    const px = c.player.x;
    yield* c.face('player', 'up');
    yield* c.emote('player', 'exclaim');
    yield* c.jingleWait('j_encounter_society');
    c.music('society_theme');
    crease.dir = 'down';
    yield* c.sayT(k('inc.1'), 'Crease: Not one crease out of place!\\p...Hm? Visitors? This shrine is under inspection, you know.');
    yield* c.sayT(k('inc.2'), 'Pin: Flat is fair! Please stay behind the line, Tailor.');
    yield* c.sayT(k('inc.3'), 'Crease: I\'m Pleat Crease, of the Starch Society for Tidy Living.\\pI\'m here to measure the Everspool, a silk spool that never runs out.\\pIt\'s the straightest thread in the world. Do you know how rare that is?');
    yield* c.sayT(k('inc.4'), 'Crease: The guardian kept fussing at us, so we pressed her.\\pSee how calm she is now? Aren\'t you, dear?');
    yield* c.sayT(k('inc.5'), 'Cocoona: ...Yes, Tailor.');
    yield* c.sayT(k('inc.6'), '{player} stared. The Cocoona had been bleached white, with neat blue piping.\\pShe didn\'t even blink.');
    yield* c.sayT(k('inc.7'), 'Crease: A shrine can\'t be kept tidy with its guardian fussing at every visitor.\\pSo really, we\'re helping.\\pYou, though, are a little crooked at the hem. Pin! Welt! Iron this one out.');
    // the two Pressers step up to the player
    const tp = c.ow.spawn(c.walk(pin, ['down', 3], 2), 'walk');
    yield* c.walk(welt, ['down', 3], 2);
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
      yield* c.trainerBattle({ cls: 'Presser', name: 'Welt', look: 'grunt_f', ai: 1, reward: 8, music: 'battle_society', team: L.team([['chirpadee', 10], ['silkie', 11]]) });
      c.set('shrine_welt');
      c.music('society_theme');
      yield* c.sayT(k('welt.win'), 'Welt: I keep folding things, and I can\'t stop. Is that normal?');
    }

    // Crease comes round the Everspool to see to the problem herself. Three story fights in a row with no Tea House near:
    // a breather first, so the Pleat is a fair test, not a war of attrition
    NP.State.healAll();
    yield* c.sayT(k('breather'), '{player}\'s Kigu shook out their costumes and took a deep breath.');
    yield* c.walk(crease, ['left', 1, 'down', 3, 'right', 1], 2);
    crease.dir = 'down';
    yield* c.sayT(k('crease.intro'), 'Crease: You beat both of my Pressers? Hm. It was messy, but it was brisk,\\pand I do like brisk. I\'ll measure you myself, then.');
    yield* c.trainerBattle({ cls: 'Pleat', name: 'Crease', look: 'pleat', ai: 2, reward: 14, music: 'battle_admin', team: L.team([['chirpadee', 12], ['silkie', 13], ['spinnet', 14]]) });
    c.music('society_theme');
    yield* c.sayT(k('crease.win.1'), 'Crease: A crease. ...One single crease, right on my own sleeve.\\pI hate that.');
    yield* c.walk(crease, ['left', 1, 'up', 2], 2);
    crease.dir = 'right';
    NP.snd.sfx('leaf');
    yield* c.sayT(k('crease.win.2'), 'Crease unfolded her ruler and snipped a bit of the Everspool.\\pThe spool kept on spinning.');
    yield* c.sayT(k('crease.win.3'), 'Crease: A little sample will do. We only need the measurements, after all.\\pThe Society is patient, Tailor. We\'ll be in touch.');
    yield* c.sayT(k('crease.win.4'), 'Crease: Fall in, Pin. Fall in, Welt. ...Welt, put that shirt back.');
    // out along the east path towards Hemline
    const t1 = c.ow.spawn(walkAndHide(c, 'pin', ['up', 1, 'right', 11], 2), 'walk');
    const t2 = c.ow.spawn(walkAndHide(c, 'welt', ['up', 1, 'right', 9], 2), 'walk');
    yield* c.walk(crease, ['down', 2, 'right', 11], 2);
    c.hideNpc('crease');
    while (!t1.done || !t2.done) yield;

    // Mimi arrives with her invention
    c.music('forest_gingham');
    const mimi = c.npc('mimi_s');
    const mx = px === 9 ? 10 : 9, endY = mx === 9 ? 10 : 9;
    c.placeNpc(mimi, mx, 16, 'up');
    c.showNpc('mimi_s');
    yield* c.walk(mimi, ['up', 16 - endY], 2);
    mimi.dir = mx === 9 ? 'up' : 'left';
    yield* c.face('player', 'up');
    yield* c.sayT(k('rinse.1'), 'Mimi: {player}! Wait up! I followed you all the way from Thimble!');
    yield* c.sayT(k('rinse.2'), 'Mimi: Seeing those white collars on the bridge got me thinking!\\pStarch is just a stiff coating, right? So the opposite of starch must be...\\p...water, lavender, and a little bit of nerve!');
    yield* c.sayT(k('rinse.3'), 'Mimi: I call it Soft Rinse. I\'ve only ever tried it on a handkerchief!\\pHold her steady, {player}.');
    yield* c.sayT(k('rinse.4'), 'Mimi dabbed the Cocoona gently with the Soft Rinse.');
    yield* c.ow.fadeOut(10, '#ffffff');
    yield* c.jingleWait('j_heal');
    coco.look = 'cocoona';
    yield* c.ow.fadeIn(10);
    yield* c.sayT(k('rinse.5'), 'The blue piping washed right out of her costume.\\pThen her colour came back, a little at a time.');
    yield* c.emote(coco, 'exclaim');
    yield* c.sayT(k('rinse.6'), 'Cocoona: Coco!');
    yield* c.sayT(k('rinse.7'), 'Mimi: It WORKED! Soft Rinse really works!\\p...I need to write all of this down. Every single bit of it, right now.');
    yield* c.sayT(k('rinse.8'), 'The Cocoona bowed to {player}, and then to the Everspool.\\pIt looked very much like a thank-you.');
    yield* c.sayT(k('rinse.9'), 'Mimi: Hemline\'s just up the road, and Bryn runs the Salon there.\\pShe\'s the Warden of these woods too, so I\'ll run ahead and tell her.\\pMeet me there!');
    yield* c.walk(mimi, ['right', 19 - mimi.x], 2);
    c.hideNpc('mimi_s');
    coco.dir = 'left';
    c.set('shrine1_done');
    c.set('rinse_done');
    L.syncStamps(c);
  }

  const M = L.map({
    id: 'spindle_shrine', name: 'Spindle Shrine', music: 'forest_gingham', battleBg: 'forest', border: 'treeline', w: 20, h: 18, fill: 'T',
    view: 'town',   // 3D camera preset (street | town | flat-ish), see src/engine/persp.js
    legend: { '.': 'grass', T: 'treeline', p: 'path', d: 'dirt', f: 'flowers' },
    onEnter: function* (c) { L.syncStamps(c); },
  });

  M.rect(3, 2, 14, 12, '.').rect(8, 14, 4, 4, '.').rect(17, 9, 3, 2, 'p');
  M.blob(9.5, 8.5, 4, 3, 'd');
  M.rect(9, 6, 2, 12, 'p').rect(11, 9, 9, 2, 'p');
  M.rect(4, 8, 3, 1, 'f').rect(13, 3, 2, 1, 'f').rect(12, 11, 3, 1, 'f').rect(5, 11, 2, 1, 'f');

  M.stamp('shrine', 7, 2, 'pressed');
  L.variantByFlag(M.def.stamps[M.def.stamps.length - 1], 'shrine1_done', 'pressed', 'default');
  M.stamp('lamp', 6, 4).stamp('lamp', 12, 4);
  M.stamp('stump', 9, 8); // the Everspool's stand; the spool itself is the prop below
  M.sign(11, 12, 'SPINDLE SHRINE\\nPlease don\'t pull on the thread. Thank you!', 'shrine sign');
  M.trees([[3, 3], [4, 5], [15, 3], [14, 5], [3, 10], [15, 10]]);
  M.trees([[5, 2], [13, 2]], 'pine');
  M.stamp('bench', 14, 7).stamp('flowerbed', 5, 6).stamp('bush', 3, 7).stamp('bush', 16, 7).stamp('boulder', 3, 12).stamp('boulder', 16, 12);

  M.spawn('south', 9, 16, 'up').spawn('east', 18, 9, 'left');
  M.edge('s', 9, 10, 'gingham_woods', 'north').edge('e', 9, 10, 'hemline', 'west');

  // the cast stands around the Everspool from the start: the incident fires when you step into the clearing
  M.npc('crease', 9, 7, 'pleat', 'down', ['Crease: Not one crease out of place!'], { hideIf: 'shrine1_done' });
  M.npc('pin', 8, 8, 'grunt_m', 'right', ['Pin: Flat is fair!'], { hideIf: 'shrine1_done' });
  M.npc('welt', 10, 8, 'grunt_f', 'left', ['Welt: Stay in line, please.'], { hideIf: 'shrine1_done' });
  const coco = { id: 'cocoona', x: 9, y: 9, dir: 'up', say: null, script: function* (c) {
    if (!c.flag('shrine1_done')) { yield* c.sayT('spindle_shrine.cocoona.1', 'Cocoona: ...Yes, Tailor.'); return; }
    yield* c.sayT('spindle_shrine.cocoona.2', 'Cocoona: Coco! Coco!\\pShe wrapped {player}\'s Kigu in warm silk for a moment.');
    NP.snd.sfx('save');
    NP.State.healAll();
    yield* c.sayT('spindle_shrine.cocoona.3', 'Your Kigu feel rested and snug.');
  } };
  L.lookByFlag(coco, 'shrine1_done', 'cocoona_pressed', 'cocoona');
  M.def.npcs.push(coco);
  M.npc('mimi_s', 9, 16, 'mimi', 'up', ['Mimi: Soft Rinse! Patent pending!'], { hidden: true });
  M.def.props.push({ id: 'everspool', x: 9, y: 8, icon: 'item:silk_spool', note: 'the Everspool', script: function* (c) {
    if (!c.flag('shrine1_done')) return;
    yield* c.sayT('spindle_shrine.everspool.1', 'The Everspool turns slowly on its stand.\\pIt\'s a single golden-green thread, perfectly straight, and it never runs out.');
    yield* c.sayT('spindle_shrine.everspool.2', 'There\'s a neat little cut where Crease snipped it.\\pThe thread is already growing back.');
  } });

  M.trigger({ x: 3, y: 12, w: 14, h: 1, id: 'spindle_shrine', when: (c) => !c.flag('shrine1_done'), script: incident });
  M.reg();
})(typeof globalThis !== 'undefined' ? globalThis : window);
