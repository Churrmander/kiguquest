/* The Spark Cellar — the old static cellar under Shibuyarn Station (3 floors, dark). Wild Glowli spark down here, and their static
 * has fed the city's lights for a hundred years. Now the Pressers are siphoning it into jars for the Works.
 *  Floor 1: Tuck (the Presser from Thimble) is lost and scared, sitting in the passage to the stairs down. He follows you out to the
 *           stairs up (c.follow), with a few nervous echo jokes on the way, and tells you the static goes north in jars to the Works.
 *           Optional: a pressed Glowli, whom Mrs. Kasuri's rinse salts set right.
 *  Floor 2: magnet-stone puzzles. Push a charged stone (Disc: Shove) onto a snapped cable to join it; the cable powers down the
 *           Pressers' arc fence. Stones that get stuck roll back to their spots when you come back to the floor.
 *           Two Pressers, and a Volt Charm on a warm ledge.
 *  Floor 3: the siphon. One Presser, then Pleat Calender, the Works engineer ("Right on schedule"). Win, and he shuts it down;
 *           the Glowli are let out of the jars and the city's lights come back (flag shibuyarn_lights).
 * Levels 28-32. Flags: tuck_following, tuck_out, glowli_rinsed, cellar_arc1, cellar_arc2, calender_done, shibuyarn_lights. */
(function (root) {
  'use strict';
  const NP = root.NP, L = NP.levels;
  const LEG = { w: 'cave_wall', f: 'cave_floor', ';': 'dry_grass', c: 'cable', v: 'cable_v', s: 'socket', X: 'arc_gate' };
  const cave = (o) => L.map(Object.assign({ music: 'cave', battleBg: 'cave', border: 'cave_wall', indoor: true, dark: true, legend: LEG, fill: 'w' }, o));

  // ------------------------------------------------------------------------------------------ floor 1: Tuck
  function* tuck(c, n) {
    if (c.flag('tuck_following')) { yield* c.sayT('spark_cellar.tuck.again', 'Tuck: I\'m right behind you! Very, very close behind you.'); return; }
    yield* c.sayT('spark_cellar.tuck.1', 'A Presser in a crumpled white uniform is sitting on the floor, hugging his knees.\\pIt\'s Tuck, from the inspection in Thimble Village, all that time ago.');
    yield* c.emote(n, 'exclaim');
    yield* c.sayT('spark_cellar.tuck.2', 'Tuck: You! You\'re the one who beat me in Thimble! Please don\'t battle me.\\pI got separated from my unit, my lamp ran out, and something down here keeps going "glo".');
    yield* c.sayT('spark_cellar.tuck.3', 'Tuck: Could you walk me back to the stairs? I\'ll stay right behind you. I won\'t even talk.\\p...Much.');
    c.set('tuck_following');
    yield* c.walk(n, ['down', 1]);
    c.follow(n);
  }
  function* tuckOut(c) {
    c.set('tuck_out');
    const n = c.npc('tuck');
    c.unfollow();
    yield* c.face(n, 'up');
    yield* c.sayT('spark_cellar.tuckout.1', 'Tuck: The stairs! Oh, thank goodness. I\'d hug you, but it would crease us both.');
    yield* c.sayT('spark_cellar.tuckout.2', 'Tuck: Listen. You didn\'t hear this from me, but we\'re not doing a survey.\\pWe\'re filling jars with the static down here, and every jar goes north, to the Works.');
    yield* c.sayT('spark_cellar.tuckout.3', 'Tuck: Pleat Calender is running it, the engineer from the Works. He\'s right at the bottom, with the big machine.\\pHe checks his watch every thirty seconds. I timed it.');
    yield* c.sayT('spark_cellar.tuckout.4', 'Tuck: I\'m going to go home and iron something to calm down. Thank you. Really.');
    yield* c.walk(n, ['left', 1]);
    c.hideNpc('tuck');
  }
  // the echo jokes, once each, while Tuck is following
  const echo = (key, line) => ({ id: key, when: (c) => c.flag('tuck_following') && !c.flag('tuck_out') && !c.flag(key), script: function* (c) { c.set(key); yield* c.sayT('spark_cellar.' + key, line); } });

  const M = cave({
    id: 'spark_cellar', name: 'Spark Cellar', w: 28, h: 20,
    onEnter: function* (c) {
      // Tuck is lost if you leave the floor with him; he catches up as soon as you come back
      if (c.flag('tuck_following') && !c.flag('tuck_out')) { const n = c.npc('tuck'); c.placeNpc(n, c.player.x, c.player.y + 1, 'up'); c.follow(n); }
    },
  });
  M.rect(2, 2, 6, 4, 'f');                                         // the landing at the foot of the maintenance stair
  M.rect(7, 3, 15, 3, 'f').rect(8, 4, 12, 1, 'c');                 // the cable gallery east
  M.rect(19, 5, 3, 13, 'f').rect(20, 6, 1, 9, 'v');                // down the east tunnel
  M.rect(5, 15, 17, 3, 'f').rect(7, 16, 12, 1, 'c');               // the lower gallery west
  M.rect(10, 8, 7, 5, 'f').rect(11, 9, 5, 3, ';').rect(17, 10, 2, 1, 'f');   // a damp chamber where wild Glowli spark
  M.rect(6, 9, 1, 6, 'f').rect(4, 7, 4, 2, 'f');                   // the narrow passage up to the stairs down (Tuck sits in it)
  L.stairs(M, 3, 3, 'up', 'shibuyarn_station', 'stairs');
  L.stairs(M, 5, 7, 'down', 'spark_cellar_2', 'up');
  M.spawn('up', 4, 3, 'right').spawn('down', 5, 8, 'down');
  M.stamp('static_jar', 15, 3).stamp('static_jar', 16, 5).stamp('rock', 13, 12).stamp('lamp', 21, 14);
  M.sign(8, 2, 'SHIBUYARN STATIC CELLAR\\nEst. long ago. Please do not lick the cables.', 'cellar sign');
  M.enc('grass', [['glowli', 28, 30, 40], ['coili', 28, 30, 24], ['nocti', 28, 29, 14], ['stalli', 28, 30, 12], ['sparkin|mittsy', 28, 29, 10]]);
  M.npc('tuck', 6, 13, 'tuck', 'down', null, { script: tuck, hideIf: 'tuck_out', note: 'Tuck: sits in the passage to the stairs down; follows you to the stairs up' });
  M.trigger(Object.assign({ x: 2, y: 2, w: 6, h: 4, script: tuckOut }, { id: 'tuck_out', when: (c) => c.flag('tuck_following') && !c.flag('tuck_out') }));
  M.trigger(Object.assign({ x: 5, y: 15, w: 3, h: 3 }, echo('echo1', 'Tuck: Hello? ...Hello? ...hello?\\pOh, it\'s just the echo. I knew that. I was testing it.')));
  M.trigger(Object.assign({ x: 19, y: 11, w: 3, h: 2 }, echo('echo2', 'Tuck: Something just went "glo" again. Did you hear it? It went "glo".\\p...If that was you, please tell me it was you.')));
  M.trigger(Object.assign({ x: 12, y: 3, w: 2, h: 3 }, echo('echo3', 'Tuck: You know, back in Thimble, I really did think that banner was crooked.\\pIt wasn\'t, though. I measured it later. It was perfectly fine.')));
  M.trainer('sc1_t1', 14, 16, 'grunt_f', 'up', { cls: 'Presser', name: 'Static', sight: 3, reward: 16, ai: 2, music: 'battle_society', team: [['glowli', 29], ['coili', 29], ['silkie', 30]],
    intro: 'This cellar is closed for a tidiness survey. The survey says: you\'re untidy.', win: 'The survey has been... revised.', after: 'Please don\'t tell anyone about the jars. Especially not the jars.' });
  // the pressed Glowli: Mimi's rinse (with Mrs. Kasuri's salts) sets her right
  M.npc('pressed', 16, 8, 'glowli|cocoona_pressed', 'down', null, { hideIf: 'glowli_rinsed', note: 'a pressed Glowli (optional: rinse salts)', script: function* (c, n) {
    yield* c.sayT('spark_cellar.pressed.1', 'A Glowli is sitting perfectly still against the wall. She\'s been pressed flat and white,\\pand she doesn\'t glow at all.');
    if (!c.state.bag.rinse_salts) { yield* c.sayT('spark_cellar.pressed.2', 'If only there were some way to wash the starch out of her...'); return; }
    if (!(yield* c.ask('Use the rinse salts?'))) return;
    c.set('glowli_rinsed');
    NP.snd.sfx('save');
    yield* c.sayT('spark_cellar.pressed.3', 'You sprinkle a little of Mrs. Kasuri\'s rinse salts over her. The starch fizzes and lifts away,\\pand the Glowli blinks, wobbles, and starts to glow again.');
    yield* c.sayT('spark_cellar.pressed.4', 'Glo! The Glowli hums happily and nuzzles your hand. She doesn\'t seem to want to leave your side.');
    c.hideNpc(n.id);
    yield* c.giveKigu('glowli', 28);
  } });
  M.pickup('cake', 26, 16, 'fancy_cake', 1);
  M.rect(22, 16, 5, 1, 'f');
  M.pickup('tea', 12, 9, 'revive_tea', 1);
  M.reg();

  // ------------------------------------------------------------------------------------------ floor 2: the magnet stones
  // each puzzle: a magnet stone that starts at `home`, a snapped cable at `socket`, and the arc fence `gate` that it powers down
  const PUZ = [
    { key: 'arc1', home: [10, 5], socket: [10, 7] },
    { key: 'arc2', home: [19, 7], socket: [19, 10] },
  ];
  const at = (c, p) => NP.state.flags['shove:spark_cellar_2:' + p.home[0] + ',' + p.home[1]] === p.socket[0] + ',' + p.socket[1];
  const M2 = cave({
    id: 'spark_cellar_2', name: 'Spark Cellar B1', w: 26, h: 20,
    onEnter: function* (c) {
      // a stone that isn't on its socket rolls back home (so a stuck stone is never stuck for good)
      for (const p of PUZ) if (!c.flag('cellar_' + p.key)) delete NP.state.flags['shove:spark_cellar_2:' + p.home[0] + ',' + p.home[1]];
      c.map.syncShoves(NP.state.flags);
      for (const p of PUZ) if (c.flag('cellar_' + p.key)) L.setGate(c, p.key, true);
    },
    onShove: function* (c) {
      for (const p of PUZ) {
        if (c.flag('cellar_' + p.key) || !at(c, p)) continue;
        NP.snd.sfx('door');
        L.setGate(c, p.key, true);
        yield* c.sayT('spark_cellar_2.' + p.key, 'The magnet stone clunks onto the snapped cable. Bzzt! The two ends join with a spark,\\pthe cable starts to hum, and somewhere nearby an arc of static fizzles out.');
      }
    },
  });
  M2.rect(2, 2, 5, 4, 'f');                                        // landing
  M2.rect(6, 3, 9, 3, 'f');                                        // the first gallery, ending at an arc fence
  M2.rect(10, 6, 1, 2, 'f').set(10, 7, 's');                        // a narrow bay with the first snapped cable at the end
  M2.gate('arc1', { flag: 'cellar_arc1', cells: [[14, 3], [14, 4], [14, 5]], closed: 'X', open: 'f', note: 'arc fence 1 (magnet stone onto the socket at 10,7)' });
  M2.rect(15, 2, 9, 7, 'f');                                       // the jar store
  M2.rect(19, 9, 1, 2, 'f').set(19, 10, 's');                       // second bay and snapped cable
  M2.rect(22, 9, 2, 3, 'f');                                       // the way down to the lower hall
  M2.gate('arc2', { flag: 'cellar_arc2', cells: [[22, 9], [23, 9]], closed: 'X', open: 'f', note: 'arc fence 2 (magnet stone onto the socket at 19,10)' });
  M2.rect(4, 12, 20, 5, 'f').rect(16, 14, 5, 2, ';');               // the lower hall, with damp cave grass
  M2.rect(2, 8, 3, 3, 'f').rect(4, 11, 1, 1, 'f');                  // the warm ledge, where the old cables run hot
  M2.stamp('shove_rock', 10, 5, 'magnet').stamp('shove_rock', 19, 7, 'magnet');
  L.stairs(M2, 3, 3, 'up', 'spark_cellar', 'down');
  L.stairs(M2, 5, 14, 'down', 'spark_cellar_3', 'up');
  M2.spawn('up', 4, 3, 'right').spawn('down', 6, 14, 'right');
  for (const [x, y] of [[16, 2], [17, 2], [18, 2], [21, 2], [22, 2], [23, 2]]) M2.stamp('static_jar', x, y);
  M2.sign(7, 2, 'NOTICE: Magnet stones are charged. Push them onto a snapped cable to join it.\\pIf a stone gets stuck, go back up the stairs and it will roll home.', 'puzzle sign');
  M2.enc('grass', [['glowli', 29, 31, 34], ['coili', 29, 31, 20], ['stalli', 29, 31, 18], ['nocti', 29, 30, 16], ['chippi|nibbi', 29, 30, 12]]);
  M2.trainer('sc2_t1', 17, 5, 'grunt_m', 'left', { cls: 'Presser', name: 'Fuse', sight: 3, reward: 16, ai: 2, music: 'battle_society', team: [['coili', 30], ['vendi', 30]],
    intro: 'Each jar holds one Glowli\'s worth of sparks, and we label every single one of them neatly.', win: 'You\'ve unlabelled me.', after: 'Calender says the Works needs a thousand jars. We\'ve done about forty. He\'s not happy about the schedule.' });
  M2.trainer('sc2_t2', 14, 14, 'grunt_f', 'down', { cls: 'Presser', name: 'Volta', sight: 4, reward: 16, ai: 2, music: 'battle_society', team: [['glowli', 30], ['mittsy', 30], ['coili', 31]],
    intro: 'The fences are for your safety. Mostly for our safety. Okay, they\'re to keep you out.', win: 'Well, the fences didn\'t work, and neither did I.', after: 'If the boss asks, you came in through a door that was already open.' });
  M2.pickup('charm', 2, 8, 'volt_charm', 1, 'Volt Charm on the warm ledge');
  M2.pickup('spool', 23, 16, 'gold_spool', 1);
  M2.reg();

  // ------------------------------------------------------------------------------------------ floor 3: the siphon and Pleat Calender
  function* calender(c) {
    const p = c.npc('calender');
    if (c.flag('calender_done')) return;
    yield* c.face(p, 'down');
    yield* c.sayT('spark_cellar_3.cal.1', 'A tall man in a starched white suit snaps a pocket watch shut and looks you up and down.');
    yield* c.sayT('spark_cellar_3.cal.2', 'Pleat Calender: Two minutes and ten seconds behind the Presser I sent to stop you. Right on schedule.\\pI am Pleat Calender, engineer of the Works. And you are an interruption.');
    yield* c.sayT('spark_cellar_3.cal.3', 'Pleat Calender: Do you know what runs late in this world? Ferries. Letters. People.\\pThe Works will never run late, and to run on time, it needs every spark in this cellar.');
    yield* c.sayT('spark_cellar_3.cal.4', 'Pleat Calender: I have a timetable to keep. Let\'s make this quick.');
    const team = L.team([['coilika|coili', 31], ['glowmira|glowli', 31], ['vendox|vendi', 32], ['silkie', 30]]);
    const won = yield* c.trainerBattle({ cls: 'Pleat', name: 'Calender', look: 'pleat_calender', ai: 3, reward: 40, music: 'battle_admin', team });
    if (!won) { yield* c.sayT('spark_cellar_3.cal.lose', 'Pleat Calender: That took eleven seconds, which is very efficient. Now go and rest, and stay out of my timetable.'); return; }
    c.set('calender_done');
    yield* c.sayT('spark_cellar_3.cal.5', 'Pleat Calender: ...Nine minutes. That took nine minutes, and that was not in the schedule.');
    yield* c.sayT('spark_cellar_3.cal.6', 'Pleat Calender: Very well. A good engineer knows when a line has failed. I\'m shutting the siphon down.\\pThe Works has other sources. Slower ones, but it will manage.');
    NP.snd.sfx('door');
    c.set('shibuyarn_lights');
    L.syncStamps(c);
    yield* c.sayT('spark_cellar_3.cal.7', 'He pulls a lever on the side of the machine. The hum winds down, the red lamp goes dark,\\pand one by one the jars pop open. Little Glowli tumble out, blinking, and drift away into the tunnels.');
    yield* c.sayT('spark_cellar_3.cal.8', 'Pleat Calender: Someone once told me I\'d miss the important things if I kept looking at my watch.\\p...The ferry was late that day. It doesn\'t matter. Good day to you.');
    yield* c.walk(p, ['right', 3]);
    c.hideNpc('calender');
    yield* c.sayT('spark_cellar_3.cal.9', 'Behind the siphon there\'s an old service lift. It creaks, but it still goes up to the station.');
  }
  const M3 = cave({ id: 'spark_cellar_3', name: 'Spark Cellar B2', w: 24, h: 18 });
  M3.rect(2, 2, 5, 4, 'f');
  M3.rect(4, 6, 3, 8, 'f').rect(5, 7, 1, 6, 'v');
  M3.rect(4, 12, 16, 3, 'f').rect(6, 13, 12, 1, 'c');
  M3.rect(12, 3, 10, 9, 'f');                                       // the siphon hall
  L.stairs(M3, 3, 3, 'up', 'spark_cellar_2', 'down');
  M3.spawn('up', 4, 3, 'down');
  M3.def.stamps.push(L.variantByFlag({ id: 'siphon', x: 15, y: 3 }, 'shibuyarn_lights', 'on', 'off'));
  for (const [x, y] of [[13, 4], [13, 6], [19, 4], [19, 6], [13, 9], [20, 9]]) M3.def.stamps.push(L.variantByFlag({ id: 'static_jar', x, y }, 'shibuyarn_lights', 'full', 'empty'));
  M3.trainer('sc3_t1', 11, 13, 'grunt_m', 'left', { cls: 'Presser', name: 'Ohm', sight: 4, reward: 17, ai: 2, music: 'battle_society', team: [['vendi', 31], ['glowli', 31], ['coili', 31]],
    intro: 'Mr. Calender is not to be disturbed. He\'s exactly three minutes into his quiet time.', win: 'Now he\'s four minutes in, and very disturbed.', after: 'If you\'re going in, knock first. Twice. He likes things in pairs.' });
  M3.npc('calender', 16, 6, 'pleat_calender', 'down', null, { hideIf: 'calender_done', script: calender, note: 'Pleat Calender, the cellar boss' });
  M3.trigger({ x: 14, y: 8, w: 5, h: 1, id: 'calender', when: (c) => !c.flag('calender_done'), script: calender });
  // the old service lift behind the siphon: back up to the station
  M3.stamp('ladder', 20, 2);
  M3.interact(20, 3, function* (c) {
    if (!c.flag('calender_done')) { yield* c.sayT('spark_cellar_3.lift.no', 'An old service lift. A sign on it says OUT OF ORDER (SIPHON IN USE).'); return; }
    if (!(yield* c.ask('Ride the service lift up to the station?'))) return;
    yield* c.warp('shibuyarn_station', 11, 3, 'down');
  }, 'service lift back to the station (after Calender)');
  M3.enc('grass', [['stalli', 30, 32, 30], ['nocti', 30, 32, 26], ['glowli', 30, 32, 26], ['coili', 30, 31, 18]]);
  M3.rect(8, 7, 3, 3, ';').rect(7, 8, 1, 1, 'f');
  M3.pickup('candy', 9, 8, 'wish_candy', 1);
  M3.reg();
})(typeof globalThis !== 'undefined' ? globalThis : window);
