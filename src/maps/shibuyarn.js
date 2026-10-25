/* Shibuyarn — the big city (Chapter 5, no Salon). North: the station and its plaza. Across the main road: the shotengai, a row of
 * shops (konbini, Mrs. Kasuri's fabric shop, the toy shop, the ramen bar and the arcade). South: the Tea House, a quiet shrine lane,
 * the capsule-toy wall and a vending alley where wild Vendi live. East: the railway, and the level crossing out to Route 6.
 * Story: the neon keeps browning out because Pressers are siphoning the Spark Cellar's static for the Works. Every shop sign is dark
 * (the `_off` variants) and the crossing gates are stuck down until the cellar is fixed (flag shibuyarn_lights).
 * Beats: arrival and brownout (5.2), Mimi and Mrs. Kasuri (5.4), the rival at the claw machine (5.6), the station master opens the
 * maintenance stair (5.7), the lights come on (5.10). The prize arcade is the map shibuyarn_arcade (door 'arcade').
 * Flags: shibuyarn_arrived, kasuri_done, rival_claw_done, cellar_open, shibuyarn_lights (set in the Spark Cellar), lights_scene. */
(function (root) {
  'use strict';
  const NP = root.NP, L = NP.levels;
  const W = 40, H = 36;
  const LIT = 'shibuyarn_lights';

  // ---- 5.2: arrival, and the brownout
  function* arrival(c) {
    c.set('shibuyarn_arrived');
    yield* c.sayT('shibuyarn.arrive.1', 'Ding-ding-ding! Somewhere past the shops, the crossing bells ring and a train rattles by.\\pShibuyarn is huge. There are vending machines on every corner, and every wall has a sign on it.');
    yield* c.ow.fadeOut(3); yield* c.ow.fadeIn(3); yield* c.ow.fadeOut(3); yield* c.wait(20); yield* c.ow.fadeIn(6);
    yield* c.sayT('shibuyarn.arrive.2', 'Then every light in the street flickers and goes out. A few seconds later the street lamps come back,\\pbut the shop signs stay dark.');
    yield* c.sayT('shibuyarn.arrive.3', 'A passer-by: Oh, not again. That\'s the third time today.\\pThe trains still run, but the signs and the crossing gates have given up.');
    const m = c.npc('mimi_s');
    c.placeNpc(m, c.player.x, c.player.y - 3, 'down');
    c.showNpc('mimi_s');
    yield* c.walk(m, ['down', 2]);
    yield* c.sayT('shibuyarn.arrive.4', 'Mimi: {player}! Isn\'t this place amazing, even in the dark?\\pI rode the slab cart up from Canvas Rest. I couldn\'t wait to see the fabric shops here.');
    yield* c.sayT('shibuyarn.arrive.5', 'Mimi: There\'s a tiny one on the shopping street, run by a lady called Mrs. Kasuri.\\pEveryone says she has the best eye in the city. Will you come in with me? I\'m too nervous to go alone!');
    yield* c.walk(m, ['up', 2]);
    c.hideNpc('mimi_s');
  }

  // ---- 5.6: the rival at the claw machine (no battle)
  function* rivalClaw(c) {
    const r = c.npc('rival_s');
    yield* c.face('player', 'right');
    yield* c.sayT('shibuyarn.claw.1', '{rival} is pressed right up against the claw machine, glaring at a plush Kigu in the corner.');
    yield* c.emote(r, 'exclaim');
    yield* c.face(r, 'left');
    yield* c.sayT('shibuyarn.claw.2', '{rival}: Oh, hi! Don\'t laugh. I\'m trying to win that one for Mum.\\pShe\'s been on her own at the bakery since Dad went, and I thought it might cheer her up.');
    yield* c.sayT('shibuyarn.claw.3', '{rival}: I\'ve had nine goes, and the claw keeps letting go at the last second.\\pHere, you have a go. It\'s on me. Your hands are steadier than mine.');
    let won = false;
    if (c.arcade) {
      const res = yield* c.arcade('claw', { free: 1 });
      won = !!(res && res.tickets >= 10);   // 2 tickets for a miss, 10+ for a plush (docs/arcade.md)
    } else {
      yield* c.sayT('shibuyarn.claw.4', 'You steer the claw over the plush and press the button. It drops, grabs, and lifts...');
      won = Math.random() < 0.5;
      yield* c.sayT(won ? 'shibuyarn.claw.win' : 'shibuyarn.claw.miss', won ? '...and the plush tumbles into the prize chute!' : '...and it slips out of the claw, just like it did for {rival}.');
    }
    if (won) yield* c.sayT('shibuyarn.claw.5', '{rival}: You did it! Mum is going to love this. She\'ll put it on the till and tell every customer about it.');
    else yield* c.sayT('shibuyarn.claw.6', '{rival}: Ha! See? The claw\'s got it in for both of us.');
    yield* c.sayT('shibuyarn.claw.7', '{rival}: You know what, Mum would say I spent too much on this thing, and she\'d be right.\\pThanks for having a go with me. I needed a laugh today.');
    yield* c.sayT('shibuyarn.claw.8', '{rival}: The station master keeps grumbling about the power. He might know what\'s going on with the lights.\\pI\'ll see you around, okay?');
    yield* c.walk(r, ['left', 1, 'down', 2, 'left', 8]);
    c.set('rival_claw_done');   // set at the end, so the NPC (hideIf this flag) stays on screen for the whole scene
    c.hideNpc('rival_s');
  }

  // ---- 5.10: the lights come on (plays the first time you step outside after the Spark Cellar)
  function* lightsOn(c) {
    c.set('lights_scene');
    yield* c.wait(20);
    yield* c.sayT('shibuyarn.lights.1', 'Pop! Pop-pop-pop! All along the street, the shop signs flicker and light up, one after another.\\pThe whole city glows pink and gold and green.');
    yield* c.sayT('shibuyarn.lights.2', 'Over by the railway, the crossing bells chime and the gates lift. At the station, a little jingle plays.');
    const m = c.npc('mimi_s');
    c.placeNpc(m, c.player.x - 2, c.player.y, 'right');
    c.showNpc('mimi_s');
    yield* c.face('player', 'left');
    yield* c.sayT('shibuyarn.lights.3', 'Mimi: {player}, it was you, wasn\'t it? Come and look at my window! The scarf is all lit up,\\pand someone has already asked to buy one. A real customer!');
    yield* c.sayT('shibuyarn.lights.4', 'Mimi: The arcade\'s open properly now, too. And {rival} said to tell you the road east is clear.\\pThe exact words were "Race you to Kite Hill!" Then they ran off before I could ask anything else.');
    yield* c.walk(m, ['left', 3]);
    c.hideNpc('mimi_s');
  }

  // ---- the capsule-toy wall: six figures to collect, then the toy shop owner trades you a Starlit Thread
  const FIGURES = ['a tiny Capsi', 'a little Vendi', 'a glittery Neonki', 'a Bentobi holding a rice ball', 'a Cabbi with a tiny hat', 'a very rare gold Capsi'];
  function* capsules(c) {
    const n = NP.state.flags.capsules || 0;
    if (n >= FIGURES.length) { yield* c.sayT('shibuyarn.capsule.done', 'You\'ve already got the whole set of capsule figures. The machines look a little sad about it.'); return; }
    yield* c.sayT('shibuyarn.capsule.1', 'A wall of capsule-toy machines. A sign says: KIGU FIGURES, COLLECT ALL 6! $200 a go.');
    if (NP.state.money < 200) { yield* c.sayT('shibuyarn.capsule.poor', 'You don\'t have enough money for a go.'); return; }
    if (!(yield* c.ask('Have a go for $200?'))) return;
    NP.state.money -= 200;
    NP.snd.sfx('pickup');
    c.set('capsules', n + 1);
    yield* c.say('Crank, crank, clunk! Out pops ' + FIGURES[n] + '!' + (n + 1 < FIGURES.length ? ' (' + (n + 1) + ' of 6)' : '\\pThat\'s the whole set! The toy shop owner might like to see this.'));
  }

  const M = L.map({
    id: 'shibuyarn', name: 'Shibuyarn', music: 'city_shibuyarn', battleBg: 'city', border: 'treeline', w: W, h: H, view: 'town',
    legend: { p: 'pavement', a: 'asphalt', z: 'zebra', T: 'treeline', A: 'alley', F: 'fence', r: 'rail_v', B: 'barrier', g: 'grass', f: 'flowers', ',': 'tallgrass' },
    fill: 'p',
    onEnter: function* (c) {
      L.syncStamps(c);
      if (c.flag(LIT)) L.setGate(c, 'crossing', true);
      if (c.flag(LIT) && !c.flag('lights_scene')) yield* lightsOn(c);
    },
  });
  M.rect(0, 0, W, 2, 'T').rect(0, H - 2, W, 2, 'T').rect(0, 0, 2, H, 'T').rect(W - 2, 0, 2, H, 'T');
  M.rect(17, H - 2, 3, 2, 'p').rect(W - 2, 17, 2, 3, 'p');                    // the road in from Route 5, and out east to Route 6
  // the railway down the east side, fenced, with the level crossing on the east road
  M.rect(35, 2, 1, H - 4, 'r').rect(34, 2, 1, H - 4, 'F').rect(36, 2, 1, H - 4, 'F');
  M.rect(34, 17, 3, 3, 'r').rect(34, 17, 1, 3, 'p').rect(36, 17, 1, 3, 'p');
  M.gate('crossing', { flag: LIT, cells: [[34, 17], [34, 18], [34, 19]], closed: 'B', open: 'p', note: 'level crossing gates: down until the lights come back on' });
  // the main road under the station plaza, with a zebra crossing to the station
  M.rect(2, 8, 32, 2, 'a').rect(17, 8, 3, 2, 'z');                         // rows 8-9, clear of the shop roofs
  // the station and its plaza (north)
  M.building('station', 14, 2, null, 'station', 'shibuyarn_station');
  M.rect(2, 2, 10, 3, 'g').rect(25, 2, 9, 3, 'g').rect(3, 3, 3, 1, 'f').rect(28, 3, 3, 1, 'f');
  M.trees([[2, 2], [10, 2], [25, 2], [32, 2]]);
  M.stamp('bench', 6, 6).stamp('bench', 26, 6).stamp('lamp', 16, 7).stamp('lamp', 20, 7);
  M.stamp('bush', 3, 6).stamp('bush', 11, 6).stamp('bush', 24, 6).stamp('bush', 32, 6);   // planters along the plaza
  // the shotengai: five shops along the south side of the road (signs dark until the lights come back)
  const shop = (variant, x, name, to, note) => {
    const s = { id: 'city_shop', x, y: 13, name };
    if (to) s.to = to;
    if (note) s.note = note;
    M.def.stamps.push(L.variantByFlag(s, LIT, variant + '_off', variant));
  };
  shop('konbini', 2, 'konbini', 'shibuyarn_konbini');
  shop('fabric', 7, 'fabric', 'shibuyarn_fabric', 'Mrs. Kasuri\'s fabric shop');
  shop('toys', 12, 'toys', 'shibuyarn_toys');
  shop('ramen', 20, 'ramen', 'shibuyarn_ramen');
  shop('arcade', 25, 'arcade', 'shibuyarn_arcade', 'the prize arcade (map shibuyarn_arcade)');
  M.def.stamps.push(L.variantByFlag({ id: 'claw_booth', x: 30, y: 15 }, LIT, 'off', 'on'));
  M.def.stamps.push(L.variantByFlag({ id: 'vending', x: 31, y: 15 }, LIT, 'red_off', 'red'));
  M.def.stamps.push(L.variantByFlag({ id: 'vending', x: 32, y: 15 }, LIT, 'blue_off', 'blue'));
  // the south ward: the Tea House and a house by the avenue, neon poles along the street
  M.building('tea_house', 22, 22, null, 'tea', 'shibuyarn_tea');
  M.building('house_m', 28, 22, 'blue', 'house', 'shibuyarn_house');
  for (const [x, colour] of [[11, 'pink'], [24, 'cyan'], [33, 'yellow']]) M.def.stamps.push(L.variantByFlag({ id: 'neon_pole', x, y: 20 }, LIT, colour + '_off', colour));
  // the capsule-toy wall
  M.stamp('capsule_wall', 13, 21);
  M.interact(13, 22, capsules, 'capsule-toy wall (6 figures)').interact(14, 22, capsules, 'capsule-toy wall (6 figures)');
  // the shrine lane: a quiet green corner in the south-west
  M.rect(2, 21, 8, 7, 'g').rect(3, 26, 6, 1, 'f');
  M.stamp('shrine', 3, 21).stamp('tree', 2, 26).stamp('tree', 8, 21);
  // the vending alley: wild Vendi live among the machines
  M.rect(10, 28, 6, 4, 'A');
  for (let x = 10; x < 18; x += 2) M.def.stamps.push(L.variantByFlag({ id: 'vending', x, y: 26 }, LIT, ['white', 'red', 'blue', 'white'][(x - 10) / 2] + '_off', ['white', 'red', 'blue', 'white'][(x - 10) / 2]));
  M.rect(22, 29, 11, 4, ',');                                               // a scrap of park by the south road (Capsi and Bentobi)
  M.rect(21, 28, 1, 5, 'F').rect(33, 28, 1, 5, 'F').rect(23, 28, 3, 1, 'F').rect(29, 28, 3, 1, 'F');   // a fenced park bed, open in the middle of the top
  M.trees([[22, 28], [32, 28], [27, 32]]);
  M.stamp('lamp', 16, 31).stamp('lamp', 20, 31);
  M.sign(16, 20, 'SHIBUYARN SHOTENGAI\\nEverything you need, and lots you don\'t!', 'street sign');
  M.sign(21, 33, 'SHIBUYARN\\nThe city that never sleeps. (It does nap during brownouts.)', 'south sign');
  M.sign(37, 16, 'EAST: ROUTE 6\\nto Kite Hill', 'east sign');
  M.spawn('south', 18, 33, 'up').spawn('east', 37, 18, 'left');
  M.edge('s', 17, 19, 'route5', 'north').edge('e', 17, 19, 'route6', 'west');
  M.enc('grass', [['vendi', 28, 31, 40], ['capsi', 28, 30, 22], ['bentobi', 28, 30, 22], ['glowli', 28, 30, 10], ['coili', 28, 30, 6]]);
  // Neonki come out on the rooftops at dusk, once the signs are lit
  M.def.encFilter = (list) => (NP.state.flags[LIT] ? list.concat([{ sp: 'neonki', min: 29, max: 31, w: 8 }]) : list);

  M.trigger({ x: 17, y: 30, w: 3, h: 4, id: 'arrive', when: (c) => !c.flag('shibuyarn_arrived'), script: arrival });
  M.trigger({ x: 25, y: 17, w: 7, h: 3, id: 'claw', when: (c) => c.flag('kasuri_done') && !c.flag('rival_claw_done'), script: rivalClaw });

  M.npc('mimi_s', 18, 24, 'mimi', 'down', null, { hidden: true });
  M.npc('rival_s', 30, 17, 'rival', 'up', null, { hideIf: 'rival_claw_done', note: 'the rival at the claw machine (scene once kasuri_done)' });
  M.npc('fortune', 8, 18, 'lady', 'down', null, { script: function* (c) {
    yield* c.sayT('shibuyarn.fortune.1', 'Fortune teller: Ah, a traveller! Let me read your threads.\\p...I see a long road north, a very windy hill, and a cup of cocoa you\'ll forget to drink.');
    if (c.flag(LIT)) yield* c.sayT('shibuyarn.fortune.2', 'Fortune teller: I also see that the lights are on, so the stall makes money again. That one wasn\'t magic.');
  } });
  M.npc('salary', 23, 7, 'gentleman', 'left', ['When the power goes, the lifts stop, the trains slow down, and everyone takes the stairs.\\pI\'ve never been so fit. I hate it.']);
  M.npc('girl', 12, 18, 'schoolgirl', 'up', null, { script: function* (c) {
    if (c.flag(LIT)) yield* c.sayT('shibuyarn.girl.lit', 'The signs are back! I missed the pink one over the arcade most. It looks like a big heart.');
    else yield* c.sayT('shibuyarn.girl.dark', 'The capsule machines still work in a brownout, because they\'re wind-up. Nothing stops a capsule machine!');
  } });
  M.npc('kid', 26, 26, 'child_m', 'up', ['There are wild Kigu in the vending alley! They hide between the machines and pretend to be machines.\\pOne of them gave me a can of juice once. I think.'], { move: 'wander', range: 2 });
  M.npc('rail', 37, 22, 'station_master', 'left', null, { script: function* (c) {
    if (c.flag(LIT)) yield* c.sayT('shibuyarn.rail.lit', 'Crossing keeper: The gates are working again, so the road east is open. Mind the trains, and hold on to your hat out on the ridge.');
    else yield* c.sayT('shibuyarn.rail.dark', 'Crossing keeper: Sorry, the gates are stuck down. They need power to lift, and the power keeps vanishing.\\pThe station master says it\'s something to do with the old cellar under the station.');
  } });
  M.npc('monk', 6, 25, 'elder_m', 'down', ['This little shrine has been here since before the station. The city grew up all round it.\\pPeople come here to sit quietly. Nobody has ever told me to tidy it.']);
  M.pickup('alley', 14, 30, 'onigiri', 2);
  M.pickup('shrine', 7, 27, 'wish_candy', 1);
  M.hidden('vend', 31, 15, 'mint_tea', 1, 'a drink stuck in the vending machine tray');
  M.reg();

  // ---- the station: the station master and the maintenance stair down to the Spark Cellar (5.7)
  NP.scripts.station_master = function* (c) {
    if (c.flag(LIT)) { yield* c.sayT('shibuyarn_station.master.lit', 'Station Master: Every train is on time, and every light is on. You have no idea how happy that makes me.\\pIf you ever need a job, the railway is hiring.'); return; }
    if (c.flag('cellar_open')) { yield* c.sayT('shibuyarn_station.master.again', 'Station Master: The maintenance stair is through that door at the back. Mind the sparks,\\pand if you find whoever is pulling on our cables, ask them nicely to stop.'); return; }
    c.set('cellar_open');
    yield* c.sayT('shibuyarn_station.master.1', 'Station Master: The brownouts? Don\'t get me started. The trains are fine, because they have their own line,\\pbut everything else in the city flickers like a candle.');
    yield* c.sayT('shibuyarn_station.master.2', 'Station Master: All the city\'s cables run down to the old static cellar under this station.\\pWild Kigu down there make sparks, and the sparks feed the city. It\'s worked for a hundred years.');
    yield* c.sayT('shibuyarn_station.master.3', 'Station Master: Last month, some people in very white uniforms went down with a lot of jars.\\pThey said it was a "tidiness survey". Since then, the lights have been browning out.');
    yield* c.sayT('shibuyarn_station.master.4', 'Station Master: You look like you can handle yourself. I\'ve unlocked the maintenance stair at the back.\\pIf you can find out what they\'re doing down there, the whole city will thank you.');
    c.hideNpc('porter');
  };
  const ST = L.room({ id: 'shibuyarn_station', name: 'Shibuyarn Station', w: 14, h: 9, doorX: 6, floor: 'floor_tile', wall: 'wall_plaster', music: 'city_shibuyarn', exit: { to: 'shibuyarn', door: 'station' } })
    .stamp('clock', 6, 0).stamp('bench', 2, 5).stamp('bench', 7, 5).stamp('poster', 3, 0).stamp('poster', 9, 0).stamp('plant', 1, 2)
    .npc('master', 6, 3, 'station_master', 'down', null, { script: 'station_master', note: 'station master: opens the maintenance stair (cellar_open)' })
    .npc('porter', 11, 5, 'aide_m', 'down', ['Sorry, staff only beyond this point. The stair goes down to the old cellar,\\pand the station master says nobody goes down without his say-so.'], { hideIf: 'cellar_open', note: 'blocks the maintenance stair until cellar_open' })
    .npc('traveller', 3, 6, 'hiker', 'up', ['I\'m waiting for the train to Kite Hill. Except there isn\'t one. There\'s a road over the ridge,\\pbut the crossing gates are stuck down. So I\'m just waiting, I suppose.'])
    ;
  ST.rect(10, 2, 1, 4, 'W').rect(12, 5, 1, 1, 'W');                          // the staff nook in the back corner
  L.stairs(ST, 12, 2, 'down', 'spark_cellar', 'up');
  ST.spawn('stairs', 11, 3, 'down');
  ST.reg();

  // ---- the konbini: cheap healing and onigiri
  L.store({ id: 'shibuyarn_konbini', name: 'Konbini', exit: { to: 'shibuyarn', door: 'konbini' },
    stock: ['onigiri', 'snack_cake', 'fancy_cake', 'mint_tea', 'aloe_balm', 'wake_bell', 'numb_away', 'revive_tea', 'scent_spray', 'bond_spool', 'silk_spool', 'gold_spool', 'thread_ball'],
    guests: [{ id: 'shopper', x: 7, y: 5, look: 'courier', dir: 'left', say: ['Onigiri are the perfect battle snack. You can eat them with one hand,\\pand cheer with the other.'] }] }).reg();

  // ---- Mrs. Kasuri's fabric shop (5.4)
  function* kasuri(c) {
    if (c.flag('kasuri_done')) return;
    c.set('kasuri_done');
    const m = c.npc('mimi_f'), k = c.npc('kasuri');
    yield* c.sayT('shibuyarn_fabric.1', 'The shop is tiny and packed to the ceiling with bolts of cloth. An old lady peers over her glasses at Mimi,\\pwho is holding out a sketchbook with both hands.');
    yield* c.sayT('shibuyarn_fabric.2', 'Mimi: H-hello! I\'m Mimi. I made a scarf for the dust storms, out of tent-cloth.\\pThe weavers at Canvas Rest are wearing them now. Would you, um, look at it?');
    yield* c.emote(k, 'question');
    yield* c.sayT('shibuyarn_fabric.3', 'Mrs. Kasuri: Hmm. Double seams, a tight weave, and a hem that won\'t fray in the wind.\\pYou didn\'t just make it pretty. You made it work.');
    yield* c.sayT('shibuyarn_fabric.4', 'Mrs. Kasuri: I have a corner of my window that nobody uses. Make me six of these,\\pand I\'ll put them in it with your name on a card.');
    yield* c.emote(m, 'exclaim');
    yield* c.sayT('shibuyarn_fabric.5', 'Mimi: My name? In a window? In SHIBUYARN?\\p...I need to sit down. Actually, no, I need to start sewing!');
    yield* c.sayT('shibuyarn_fabric.6', 'Mrs. Kasuri: Your friend looks like a traveller. Take these, dear. They\'re rinse salts,\\pmy own recipe. They lift starch out of anything.');
    yield* c.giveItem('rinse_salts', 1);
    yield* c.sayT('shibuyarn_fabric.7', 'Mimi: Rinse salts! With these, my Soft Rinse would be much stronger.\\pIf you meet anyone who\'s been pressed flat, a splash of that might bring them right back.');
    yield* c.sayT('shibuyarn_fabric.8', 'Mimi: I\'m staying here to sew. Oh, and I saw {rival} by the arcade, glaring at a claw machine.\\pYou should go and say hello.');
  }
  L.room({ id: 'shibuyarn_fabric', name: 'Kasuri Fabrics', w: 9, h: 8, doorX: 3, music: 'city_shibuyarn', exit: { to: 'shibuyarn', door: 'fabric' },
    onEnter: function* (c) { if (!c.flag('kasuri_done')) yield* kasuri(c); } })
    .stamp('cloth_shelf', 1, 1).stamp('cloth_shelf', 6, 1).stamp('sewing_machine', 6, 4).stamp('mannequin', 1, 4)
    .npc('kasuri', 4, 2, 'kasuri', 'down', null, { script: function* (c) {
      if (c.flag(LIT)) yield* c.sayT('shibuyarn_fabric.kasuri.lit', 'Mrs. Kasuri: With the window lit, people stop and look at Mimi\'s scarves all evening.\\pShe\'s sold four already. Don\'t tell her I counted.');
      else yield* c.sayT('shibuyarn_fabric.kasuri.again', 'Mrs. Kasuri: A good stitch doesn\'t care if the lights are on. A good shop window does, though.');
    } })
    .npc('mimi_f', 4, 4, 'mimi', 'up', null, { script: function* (c) {
      yield* c.sayT('shibuyarn_fabric.mimi.again', 'Mimi: Five scarves to go! Mrs. Kasuri says my hems are "acceptable". I think that\'s the nicest thing she\'s ever said to anyone.');
    } })
    .reg();

  // ---- the toy shop: the capsule figure set pays off here
  L.room({ id: 'shibuyarn_toys', name: 'Toy Shop', w: 9, h: 8, doorX: 3, floor: 'floor_tile', wall: 'wall_plaster', music: 'city_shibuyarn', exit: { to: 'shibuyarn', door: 'toys' } })
    .stamp('display_case', 1, 2).stamp('shop_shelf', 6, 2).stamp('shop_shelf', 7, 2).stamp('rug_b', 3, 4)
    .npc('owner', 4, 2, 'old_tailor', 'down', null, { script: function* (c) {
      if (c.flag('capsule_prize')) { yield* c.sayT('shibuyarn_toys.after', 'Toy shop owner: The full set sits on my counter now. Customers ask where I found the gold one. I tell them it\'s a secret.'); return; }
      if ((NP.state.flags.capsules || 0) >= 6) {
        yield* c.sayT('shibuyarn_toys.set', 'Toy shop owner: Is that... the whole set? With the gold Capsi? I\'ve been trying for that one for years!\\pLet me put them on the counter, and I\'ll give you something from the back in return.');
        c.set('capsule_prize');
        yield* c.giveItem('starlit_thread', 1);
        yield* c.sayT('shibuyarn_toys.set2', 'Toy shop owner: Starlit Thread. It glitters like the night sky, and some crystal Kigu are very fond of it.');
        return;
      }
      yield* c.sayT('shibuyarn_toys.hint', 'Toy shop owner: Have you tried the capsule machines outside? There are six figures to collect,\\pand the gold one is very rare. Bring me the full set and I\'ll make it worth your while.');
    } })
    .npc('kid', 6, 5, 'child_f', 'left', ['I got three Vendi figures in a row. Three! I wanted a Neonki.'])
    .reg();

  // ---- the ramen bar: a free bowl (onigiri) once, and gossip
  L.room({ id: 'shibuyarn_ramen', name: 'Ramen Bar', w: 9, h: 8, doorX: 3, music: 'city_shibuyarn', exit: { to: 'shibuyarn', door: 'ramen' } })
    .stamp('counter_c', 3, 3).stamp('counter_c', 4, 3).stamp('counter_c', 5, 3).stamp('stove', 7, 2).stamp('chair', 3, 5).stamp('chair', 5, 5).stamp('plant', 7, 5)
    .npc('cook', 4, 2, 'cook', 'down', null, { script: L.giver('ramen', 'onigiri', 3, {
      give: ['Cook: No power for the big pot, so it\'s rice balls today. On the house, because you look hungry.'],
      got: ['Cook: Come back when the lights are on and I\'ll do you a proper bowl.'],
      again: ['Cook: Broth\'s on! Well, it will be, as soon as the stove stops flickering.'],
    }) })
    .npc('diner', 2, 5, 'pilot', 'right', ['I fly balloons out of Kite Hill, over the ridge to the east. Or I did.\\pSomeone grounded every balloon on the hill with a "safety notice". So now I eat ramen.'])
    .reg();

  // ---- the Tea House and a house
  L.tea({ id: 'shibuyarn_tea', name: 'Tea House', exit: { to: 'shibuyarn', door: 'tea' }, guests: [
    { id: 'g1', x: 7, y: 6, look: 'scientist', dir: 'left', say: ['The static in the cellar comes from wild Kigu. Glowli, mostly. They glow, they spark, and the city runs on it.\\pIf someone were bottling it, the city would go dark. Hypothetically.'] },
  ] }).reg();
  L.room({ id: 'shibuyarn_house', name: 'Flat', w: 9, h: 8, doorX: 3, exit: { to: 'shibuyarn', door: 'house' } })
    .stamp('bed', 1, 2).stamp('tv', 6, 1).stamp('table_s', 4, 4).stamp('plant', 7, 5)
    .npc('mum', 4, 3, 'villager_f1', 'down', ['When the lights went out, my son made a fort out of blankets and refused to come out.\\pHonestly, it looked so cosy that I joined him.'])
    .reg();
})(typeof globalThis !== 'undefined' ? globalThis : window);
