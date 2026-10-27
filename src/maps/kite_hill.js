/* Kite Hill — an airfield town on a slope (Chapter 6, Salon 5: Dart, Gale). The town sits low on the hill (Tea House, store, the
 * balloon post office, houses); a ramp climbs to the airfield on top, with the hangar, the Salon and the tied-down balloons.
 * Story: every balloon is grounded by a Society "safety notice" ("Unscheduled flight is untidy").
 *  6.1 arrival; 6.2 Mr. Sharp in a pilot's helmet; 6.3 the balloon post: deliver three letters on foot, the last one is postmarked
 *  Woolen Peak, to the rival's mum, in very tidy handwriting; 6.4 Rival #5 in the hangar, Dart teases them until they laugh;
 *  6.5 Dart's balloon: four patches from townsfolk, sewn on in the order Dart calls (a patch shaped like you goes on last);
 *  6.6 Mimi's balloon flag; 6.7 the Salon (kite_salon.js); 6.8 the Kite Tail Race (optional); 6.9 over the pass.
 * Flags: kite_arrived, post_started, letter_1/2/3, rival5_done, patch_pilot/goggles/nerves/cocoa, balloon_fixed, mimi_flag,
 *        badge5, race_1..3, over_pass. */
(function (root) {
  'use strict';
  const NP = root.NP, L = NP.levels;
  const W = 40, H = 34;
  const PATCHES = [
    { flag: 'patch_pilot', name: 'a sky-blue patch' }, { flag: 'patch_goggles', name: 'a red patch with a goggle print' },
    { flag: 'patch_nerves', name: 'a yellow star patch' }, { flag: 'patch_cocoa', name: 'a brown patch that smells of cocoa' },
  ];
  const patchCount = (c) => PATCHES.filter((p) => c.flag(p.flag)).length;
  function* gotPatch(c, flag) {
    c.set(flag);
    if (!c.state.bag.balloon_patches) c.state.bag.balloon_patches = 1;
    const n = patchCount(c);
    yield* c.sayT('kite_hill.patch.got', '{player} got ' + PATCHES.find((p) => p.flag === flag).name + ' for Dart\'s balloon!');
    if (n >= 4) yield* c.sayT('kite_hill.patch.all', 'That\'s all four patches! Time to take them to Dart in the hangar.');
    else yield* c.say('(' + n + ' of 4 patches)');
  }

  // ---- 6.1: arrival
  function* arrival(c) {
    c.set('kite_arrived');
    yield* c.sayT('kite_hill.arrive.1', 'The wind tugs at your sleeves as you come over the ridge. Up on the hill, a dozen hot-air balloons\\pare tied down to pegs, tugging at their ropes like dogs that want to go for a walk.');
    yield* c.sayT('kite_hill.arrive.2', 'A pilot: Lovely, aren\'t they? Shame none of them can fly.\\pThe Society nailed a notice to the hangar: every balloon is grounded, "for safety".');
    yield* c.sayT('kite_hill.arrive.3', 'A pilot: The post office is in a right state, too. Every letter in the region comes through here by balloon.\\pNow they\'re all stuck in sacks. If you\'ve got legs, they could use you.');
  }

  // ---- 6.3: the balloon post (the postmistress)
  function* postmistress(c) {
    if (c.flag('letter_3')) { yield* c.sayT('kite_post.after', 'Postmistress: Every letter delivered, and on foot! I\'ve put a gold star next to your name in the book.'); return; }
    if (c.flag('post_started')) {
      if (c.flag('letter_1') && c.flag('letter_2')) { yield* c.sayT('kite_post.last', 'Postmistress: Just the one letter left. It\'s for a bakery in Button Town, so your friend in the hangar should have it.'); return; }
      yield* c.sayT('kite_post.again', 'Postmistress: One for Mr. Ogi at the blue house, upside down, and one for the knitter by the windsocks.\\pThe last one is for your friend in the hangar.');
      return;
    }
    c.set('post_started');
    yield* c.sayT('kite_post.1', 'Postmistress: A volunteer? Oh, bless you. Three letters, and they\'re all for people right here on the hill.');
    yield* c.giveItem('post_letters', 1);
    yield* c.sayT('kite_post.2', 'Postmistress: The first is for Mr. Ogi in the blue house. He reads his post upside down, so hand it over upside down.\\pThe second is for the knitter by the windsocks on the airfield.');
    yield* c.sayT('kite_post.3', 'Postmistress: And this last one is addressed to a bakery in Button Town. It came in on the last balloon from the north.\\pIt\'s postmarked Woolen Peak, and the handwriting is ever so tidy. Isn\'t your friend from Button Town?');
    yield* c.sayT('kite_post.4', 'Postmistress: I saw them stomping off towards the hangar. Give it to them, would you?');
  }
  const letter = (n, key, line) => function* (c) {
    if (c.flag('letter_' + n)) { yield* c.sayT(key + '.after', line.after); return; }
    if (!c.flag('post_started')) { yield* c.sayT(key + '.before', line.before); return; }
    c.set('letter_' + n);
    NP.snd.sfx('pickup');
    yield* c.sayT(key + '.give', line.give);
  };

  // ---- 6.4: Rival #5 in the hangar, with Dart
  function* rival5(c) {
    if (!c.flag('letter_1') || !c.flag('letter_2')) { yield* c.sayT('kite_hangar.rival.wait', '{rival}: Oh, hey. I\'m just... looking at balloons. Don\'t mind me.'); return; }
    c.set('letter_3');
    delete c.state.bag.post_letters;
    const r = c.npc('rival_h'), dt = c.npc('dart_h');
    yield* c.sayT('kite_hangar.rival5.1', 'You hand {rival} the letter from Woolen Peak. They go very still when they see the handwriting.');
    yield* c.sayT('kite_hangar.rival5.2', '{rival}: That\'s Dad\'s writing. He always made his letters perfectly straight, like he was icing a cake.\\p...It\'s for Mum. It says he\'s "working at the Works for now" and "very busy, but well".');
    yield* c.sayT('kite_hangar.rival5.3', '{rival}: Dad never says "very busy". He says "run off my feet, love". This doesn\'t sound like him at all.\\pI\'m going north. Right now. On my own, if I have to.');
    c.showNpc('dart_h');
    yield* c.walk(dt, ['left', 2]);
    yield* c.sayT('kite_hangar.rival5.4', 'Dart: You\'d walk to Woolen Peak? In those shoes? Through a mountain pass? You\'d be there by spring.\\pThen you\'d need new shoes. Then you\'d need a hot bath and a lie-down.');
    yield* c.emote(r, 'sweat');
    yield* c.sayT('kite_hangar.rival5.5', '{rival}: ...Okay, maybe not in these shoes.');
    yield* c.sayT('kite_hangar.rival5.6', 'Dart: I\'m Dart. I run the Salon, and I fly the fastest balloon on the hill, when I\'m allowed to fly it.\\pGet my balloon patched up, and I\'ll fly you both over the pass myself. That\'s a promise.');
    yield* c.sayT('kite_hangar.rival5.7', '{rival}: ...Thanks. I think I needed someone to tell me I was being silly.\\p{player}, battle me? I need to let off some steam before I do anything else.');
    c.music('battle_rival');
    const counter = { konko: 'lilyrana|kerochapu', ottopi: 'arcorn|scurrent', sprubun: 'lyripip|chirpadee' }[c.state.starter] || 'scurrent|chirpadee';
    const team = L.team([[L.evoStarter(c.state.rivalStarter), 35], [counter, 33], ['aviatrix|whirligig', 33], ['mossgable|tortile', 34], ['kumara|acolarva', 33]]);
    const won = yield* c.trainerBattle({ cls: 'Rival', name: '{rival}', look: 'rival', ai: 2, reward: 30, canLose: true, team });
    c.music(c.map.def.music);
    if (won) yield* c.sayT('kite_hangar.rival5.win', '{rival}: Ha! You\'re still ahead. Somehow that makes me feel better, like things are how they should be.');
    else yield* c.sayT('kite_hangar.rival5.lose', '{rival}: I won! I\'m going to remember this the next time you beat me, which will be soon.');
    yield* c.sayT('kite_hangar.rival5.8', 'Dart: Right, you two. My balloon is torn in four places, and I\'ve no patches left.\\pThe folks around the hill have scraps. Bring me four, and I\'ll sew her up.');
    yield* c.sayT('kite_hangar.rival5.9', '{rival}: Race you to the Salon after! Don\'t think I won\'t.');
    yield* c.walk(r, ['down', 3]);
    c.set('rival5_done');   // set at the end, so the NPC (hideIf this flag) stays on screen for the whole scene
    c.hideNpc('rival_h');
  }

  // ---- 6.5 and 6.6: sewing the patches on, then Mimi's flag
  function* dartBalloon(c) {
    const k = (s) => 'kite_hangar.dart.' + s;
    if (c.flag('over_pass')) { yield* c.sayT(k('end'), 'Dart: I checked this morning, and the pass is still there. I\'d take you over again, but she\'s earned a rest first.'); return; }
    if (c.flag('badge5')) { yield* overThePass(c); return; }
    if (c.flag('balloon_fixed')) { yield* c.sayT(k('salon'), 'Dart: She\'s ready to fly, and so am I. But first, you owe me a battle at the Salon!\\pThe door\'s open. Mind the fans.'); return; }
    if (!c.flag('rival5_done')) { yield* c.sayT(k('busy'), 'Dart: Can\'t chat, I\'m glaring at a safety notice. Come back in a bit.'); return; }
    const n = patchCount(c);
    if (n < 4) { yield* c.sayT(k('need'), 'Dart: ' + n + ' patches so far. Folks round the hill have the rest: a pilot who wants a battle, someone who lost their goggles,\\pa nervous flyer, and the kid who\'s always hungry for cocoa.'); return; }
    yield* c.sayT(k('sew.1'), 'Dart: Four patches! Right, hand them over as I call them. Order matters, or she\'ll fly in circles.\\pFirst the one that matches the sky!');
    const order = [0, 2, 1, 3];
    const calls = ['', 'Dart: Lovely. Now the one that twinkles!', 'Dart: Good. Next, the one with the goggle print!', 'Dart: And last, the one that smells of cocoa!'];
    for (let i = 0; i < order.length; i++) {
      if (i) yield* c.say(calls[i]);
      for (;;) {
        const r = yield* c.choose(PATCHES.map((p) => p.name.replace(/^a /, '')), { cancel: -1 });
        if (r === order[i]) break;
        yield* c.sayT(k('sew.wrong'), 'Dart: Not that one! Try again. The balloon is giving you a very patient look.');
      }
    }
    yield* c.sayT(k('sew.2'), 'Dart stitches each patch on with big, fast, sure stitches. Then she pulls one more patch out of her pocket.\\pIt\'s shaped exactly like you.');
    yield* c.sayT(k('sew.3'), 'Dart: This one\'s my favourite. Every balloon needs one patch for luck, and that\'s you.');
    c.set('balloon_fixed');
    delete c.state.bag.balloon_patches;
    L.syncStamps(c);
    // 6.6: Mimi's flag
    const m = c.npc('mimi_h');
    c.showNpc('mimi_h');
    yield* c.walk(m, ['up', 2]);
    c.set('mimi_flag');
    yield* c.sayT(k('mimi.1'), 'Mimi: {player}! I took the cart from Shibuyarn. I heard there was a balloon that needed... oh!\\pIt\'s beautiful. It just needs... wait right there.');
    yield* c.sayT(k('mimi.2'), 'Mimi gathers up the leftover scraps, sews for a minute without looking up, and holds out a little flag:\\npink and blue, with a spool stitched in the middle.');
    yield* c.sayT(k('mimi.3'), 'Dart: That\'s... That\'s perfect. Is this yours? You made this just now?\\pIt\'s going on the basket. Everyone in the sky will see it!');
    yield* c.sayT(k('mimi.4'), 'Mimi: A famous pilot flying my design. I\'m not going to cry. I\'m absolutely going to cry.');
    yield* c.sayT(k('mimi.5'), 'Dart: The Salon\'s open. Come and battle me, {player}, and then we fly. Over the pass, to Woolen Peak.');
  }

  // ---- 6.9: over the pass (after the Gale Button). There's no Woolen Peak map yet, so the chapter ends on the hill.
  function* overThePass(c) {
    yield* c.sayT('kite_hill.pass.1', 'Dart: Everyone in! {rival}, Mimi, hold on to something. {player}, you\'re on the flag.');
    yield* c.ow.fadeOut(20);
    // the balloon (and everyone in it) is gone from the airfield; the flight is told over the empty field, so the text stays readable
    c.set('over_pass');
    L.hideStamps(c);
    c.player.hidden = true;
    yield* c.wait(10);
    yield* c.ow.fadeIn(20);
    yield* c.sayT('kite_hill.pass.2', 'The ropes come off, the burner roars, and the balloon lifts. Kite Hill drops away under you,\\pthen the ridge, then the whole green country you\'ve walked across.');
    yield* c.sayT('kite_hill.pass.3', 'Over the pass, the snow begins. Far below, a line of white carts crawls up the road north,\\peach one loaded with pale stone slabs.');
    yield* c.sayT('kite_hill.pass.4', 'Beyond them, in the valley, there\'s a huge mill. Every single window is lit,\\pand a tall chimney breathes white steam into the snow.');
    yield* c.sayT('kite_hill.pass.5', '{rival} doesn\'t say anything. They just hold the edge of the basket and watch the mill until it\'s out of sight.');
    yield* c.sayT('kite_hill.pass.6', 'Dart: Hold tight, everyone. Landing in the snow is mostly like landing on a pillow.\\pMostly.');
    yield* c.sayT('kite_hill.pass.7', 'END OF CHAPTER 6\\pThis is as far as the playtest goes for now. Woolen Peak is waiting in the next update.');
    yield* c.ow.fadeOut(20);
    c.player.hidden = false;
    yield* c.ow.fadeIn(20);
  }

  // ---- 6.8: the Kite Tail Race (three battles with Kip, the race pilot)
  function* racer(c, n) {
    const done = [1, 2, 3].filter((i) => c.flag('race_' + i)).length;
    if (done >= 3) { yield* c.sayT('kite_hill.race.done', 'Racer Fen: Three wins out of three! The kite tails are yours. Well, the trophy is. The tails are still on the kites.'); return; }
    if (!c.flag('balloon_fixed')) { yield* c.sayT('kite_hill.race.wait', 'Racer Fen: No racing while the balloons are grounded. I\'m practising my winning face instead.'); return; }
    yield* c.sayT('kite_hill.race.ask', 'Racer Fen: The Kite Tail Race! Three heats, first to the top of the airfield wins. Our Kigu race on the wind.\\pWe settle it with a battle, though, because it\'s quicker. Heat ' + (done + 1) + ', ready?');
    const lv = 33 + done;
    const won = yield* c.trainerBattle({ cls: 'Racer', name: 'Fen', look: 'pilot', ai: 2, reward: 15, team: L.team([['foldling', lv], ['whirligig', lv], ['chirpadee', lv]]) });
    if (!won) return;
    c.set('race_' + (done + 1));
    if (done + 1 >= 3) {
      yield* c.sayT('kite_hill.race.prize', 'Racer Fen: That\'s three! You\'re the fastest flyer on the hill. Here, every Kite Tail winner gets one of these.');
      yield* c.giveItem('float_balloon', 1);
    } else yield* c.sayT('kite_hill.race.next', 'Racer Fen: You win the heat! Come back for the next one. I need to re-tie my kite.');
  }

  const M = L.map({
    id: 'kite_hill', name: 'Kite Hill', music: 'town_kite', battleBg: 'grass', border: 'treeline', w: W, h: H, view: 'town',
    legend: { '.': 'grass', T: 'treeline', d: 'path', C: 'cliff_grass', f: 'flowers', F: 'fence', r: 'track', ',': 'tallgrass' },
    onEnter: function* (c) { L.syncStamps(c); },
  });
  M.rect(0, 0, W, 2, 'T').rect(0, H - 2, W, 2, 'T').rect(0, 0, 2, H, 'T').rect(W - 2, 0, 2, H, 'T');
  M.rect(0, 22, 2, 3, 'd');                                                  // the road in from the ridge
  // the slope: a cliff band splits the airfield (top) from the town (below), with a path ramp up the middle
  M.rect(2, 14, 36, 2, 'C').rect(18, 14, 3, 2, 'd');
  // the airfield: a long grass field with a sand-coloured runway strip
  M.rect(7, 9, 25, 2, 'r');                                                  // it runs from the hangar to the Salon
  M.building('hangar', 4, 3, null, 'hangar', 'kite_hangar');
  M.building('salon', 26, 3, 'gale', 'salon', 'kite_salon');
  M.rect(7, 8, 3, 1, 'd').rect(28, 8, 3, 1, 'd').rect(18, 11, 3, 3, 'd');
  // the tied-down balloons (Dart's is the torn one by the hangar until it's patched)
  M.stamp('balloon', 14, 3, 'red').stamp('balloon', 18, 2, 'yellow').stamp('balloon', 34, 9, 'blue');
  M.def.stamps.push(L.variantByFlag({ id: 'balloon', x: 21, y: 3, goneIf: 'over_pass' }, 'balloon_fixed', 'down', 'patched'));
  M.stamp('windsock', 13, 11).stamp('windsock', 24, 11).stamp('windsock', 33, 3);
  M.rect(2, 10, 4, 3, ',');
  // the town: the road in from the west, the Tea House, the store, the post office and two houses
  M.rect(2, 22, 36, 3, 'd');
  M.building('tea_house', 4, 17, null, 'tea', 'kite_tea');
  M.building('general_store', 11, 17, null, 'store', 'kite_store');
  M.building('house_l', 23, 17, 'green', 'post', 'kite_post', { note: 'the balloon post office' });
  M.building('house_m', 31, 17, 'blue', 'ogi', 'kite_ogi');
  M.building('house_s', 8, 27, 'red', 'house', 'kite_house');
  M.rect(18, 16, 3, 6, 'd');                                                 // the lane from the ramp down to the road
  M.rect(5, 21, 3, 1, 'd').rect(12, 21, 3, 1, 'd').rect(25, 21, 3, 1, 'd').rect(32, 21, 3, 1, 'd').rect(9, 30, 3, 1, 'd');
  M.rect(14, 27, 8, 4, 'f').rect(26, 26, 10, 5, '.');
  M.stamp('well', 17, 28).stamp('bench', 23, 27).stamp('lamp', 17, 20).stamp('lamp', 21, 20);
  M.trees([[2, 26], [33, 27], [36, 29], [24, 30]]);
  M.sign(3, 21, 'KITE HILL\\nHold on to your hat.', 'town sign');
  M.sign(21, 12, 'AIRFIELD\\nBy order of the Society: ALL FLIGHTS GROUNDED.\\nUnscheduled flight is untidy.', 'Society notice');
  M.spawn('west', 2, 23, 'right');
  M.edge('w', 22, 24, 'route6', 'east');
  M.trigger({ x: 2, y: 22, w: 1, h: 3, id: 'arrive', when: (c) => !c.flag('kite_arrived'), script: arrival });
  M.enc('grass', [['foldling', 31, 33, 40], ['whirligig', 31, 33, 34], ['chirpadee', 31, 33, 26]]);

  // 6.2: Mr. Sharp at the airfield gate, in a leather flying helmet
  M.npc('sharp', 27, 27, 'gentleman', 'left', null, { script: L.giver('sharp_kite', 'snack_cake', 1, {
    give: ['Mr. Sharp: Pilot? No, no. Just a humble map-seller, selling humble maps of the sky.\\pThis one shows where the clouds will be. Roughly. Clouds move, you see.', 'Mr. Sharp: No sale? Then have a Snack Cake. A pilot needs a snack. I mean a map-seller does.'],
    got: ['Mr. Sharp: Off you go. And if anyone asks, you never saw a man in goggles. You saw a humble map.'],
    again: ['Mr. Sharp: Humble maps! Get your humble maps! ...Nobody ever wants the humble maps.'],
  }) });
  // the letters (6.3)
  M.npc('knitter', 30, 12, 'villager_f2', 'down', null, { script: letter(2, 'kite_hill.knitter', {
    before: 'Knitter: I knit the windsocks for the airfield, and they wear out so fast. The wind is very hard on socks.',
    give: 'Knitter: A letter! From my sister! She\'s been knitting a scarf for me since spring.\\pShe says it\'s nearly done, but she said that last spring, too. Thank you, dear.',
    after: 'Knitter: My sister says the scarf is nearly done. I\'ve started knitting her a reply. It might take a while.',
  }) });
  // the patch quest (6.5): four favours
  M.trainer('kh_pilot', 15, 12, 'pilot', 'down', { cls: 'Pilot', name: 'Skye', sight: 0, reward: 16, ai: 2, team: [['foldling', 33], ['whirligig', 33], ['flumble', 34]],
    intro: 'A patch? Sure, if you can beat me. Grounded pilots get very bored, you know.', win: 'Okay, okay! The patch is yours.', after: 'Tell Dart I want a go in her balloon when it flies.' });
  M.npc('pilot_patch', 17, 12, 'skier', 'down', null, { hideIf: 'patch_pilot', note: 'gives the sky-blue patch once Skye is beaten', script: function* (c) {
    if (!c.flag('rival5_done')) { yield* c.sayT('kite_hill.skye.wait', 'Skye\'s co-pilot: We\'re just standing about until the balloons fly again.'); return; }
    if (!L.done(c, 'kite_hill', 'kh_pilot')) { yield* c.sayT('kite_hill.skye.first', 'Skye\'s co-pilot: Skye has a spare patch. Battle her and she\'ll hand it over. She loves a battle.'); return; }
    yield* c.sayT('kite_hill.skye.give', 'Skye\'s co-pilot: Skye said you won it fair and square. Here\'s the patch.');
    yield* gotPatch(c, 'patch_pilot');
  } });
  M.npc('goggles', 36, 26, 'hiker', 'left', null, { script: function* (c) {
    if (c.flag('patch_goggles')) { yield* c.sayT('kite_hill.goggles.after', 'Thanks again for my goggles. I can see the clouds properly now.'); return; }
    if (!c.flag('found_goggles')) { yield* c.sayT('kite_hill.goggles.ask', 'Have you seen my goggles? The wind snatched them right off my head.\\pThey blew up the hill, over by the hangar on the airfield. If you find them, I\'ll give you a patch.'); return; }
    delete c.state.bag.flying_goggles;
    yield* c.sayT('kite_hill.goggles.give', 'My goggles! You found them! Here, take this patch. It\'s got a goggle print on it, so that seems right.');
    yield* gotPatch(c, 'patch_goggles');
  } });
  // the lost goggles lie in plain sight at the edge of the long grass by the hangar (owner's playtest: they used to be an invisible
  // spot in the tall grass, so nobody could find them)
  M.def.props.push({ id: 'goggles_lost', x: 6, y: 12, icon: 'item:flying_goggles', hideIf: 'found_goggles', note: 'the lost goggles (airfield, by the long grass)', script: function* (c) {
    c.set('found_goggles');
    yield* c.sayT('kite_hill.goggles.found', 'Tangled in a tuft of grass, there\'s a pair of flying goggles. Someone must have lost them in the wind.');
    yield* c.giveItem('flying_goggles', 1, { found: true });
  } });
  M.npc('nervous', 13, 8, 'schoolgirl', 'down', null, { script: function* (c) {
    if (c.flag('patch_nerves')) { yield* c.sayT('kite_hill.nervous.after', 'I\'m going to fly as soon as the balloons are free. Probably. Definitely! Probably.'); return; }
    yield* c.sayT('kite_hill.nervous.1', 'I passed my pilot\'s test last week, and now I\'m scared to go up. What if the wind doesn\'t like me?');
    const r = yield* c.choose(['You\'ll be great!', 'The wind likes everyone', 'Maybe walk instead'], { cancel: 2 });
    if (r === 2 || r < 0) { yield* c.sayT('kite_hill.nervous.walk', 'Walk? I suppose I could walk. ...No! I want to fly. I just need a minute.'); return; }
    yield* c.sayT('kite_hill.nervous.2', 'You really think so? ...You\'re right. I trained for this. Thank you!\\pHere, I sewed this star patch for my first flight. Dart\'s balloon should have it.');
    yield* gotPatch(c, 'patch_nerves');
  } });
  M.npc('cocoa_kid', 20, 26, 'child_m', 'up', null, { script: function* (c) {
    if (c.flag('patch_cocoa')) { yield* c.sayT('kite_hill.cocoa.after', 'That was the best cocoa I\'ve ever had. I might save the mug forever.'); return; }
    yield* c.sayT('kite_hill.cocoa.1', 'I\'m so cold. The wind goes right through my coat. If I had a cocoa, I\'d give you anything.\\pI\'ve got a patch my gran gave me. It smells like cocoa already.');
    if (!c.state.bag.dune_cocoa) { yield* c.sayT('kite_hill.cocoa.none', 'The store sells Dune Cocoa. Could you get me one? Please.'); return; }
    if (!(yield* c.ask('Give a Dune Cocoa?'))) return;
    c.state.bag.dune_cocoa--;
    if (c.state.bag.dune_cocoa <= 0) delete c.state.bag.dune_cocoa;
    yield* c.sayT('kite_hill.cocoa.2', 'The kid wraps both hands round the cocoa and closes their eyes. Then they hand you the patch.');
    yield* gotPatch(c, 'patch_cocoa');
  } });
  M.npc('racer', 33, 7, 'rocker', 'down', null, { script: racer, note: 'Kite Tail Race (3 battles, float_balloon)' });
  M.npc('salon_guard', 29, 8, 'pilot', 'down', ['Sorry, the Salon\'s shut while Dart\'s balloon is grounded. She says she can\'t think straight without it.'], { hideIf: 'balloon_fixed', note: 'blocks the Salon door until balloon_fixed' });
  M.npc('dart_field', 22, 7, 'dart', 'down', null, { hideIf: 'over_pass', script: dartBalloon, note: 'Dart by her balloon (after badge5: over the pass)' });
  M.npc('elder', 28, 25, 'elder_f', 'up', ['When I was young, the whole sky over this hill was full of balloons every evening.\\pIt\'s been very quiet since the notice went up. Too quiet for a windy place.']);
  M.pickup('field', 36, 4, 'gold_spool', 1);
  M.pickup('town', 35, 30, 'fancy_cake', 2);
  M.hidden('well', 17, 28, 'wish_candy', 1, 'something shiny at the bottom of the well');
  M.reg();
  // Dart only waits by her balloon once it's patched and the Salon's done; before that she's in the hangar
  Object.defineProperty(NP.maps.kite_hill.npcs.find((n) => n.id === 'dart_field'), 'hidden', { get() { return !(NP.state && NP.state.flags.badge5); }, set() {} });

  // ---- the hangar: Dart's torn balloon, Rival #5, the patch quest
  L.room({ id: 'kite_hangar', name: 'Hangar', w: 15, h: 10, doorX: 6, floor: 'floor_stone', wall: 'wall_stone', music: 'town_kite', exit: { to: 'kite_hill', door: 'hangar' } })
    .stamp('crate', 1, 2).stamp('crate', 2, 2).stamp('barrel', 13, 2).stamp('sewing_machine', 12, 6).stamp('table_l', 9, 3)
    .npc('dart_h', 9, 6, 'dart', 'left', null, { script: dartBalloon, note: 'Dart in the hangar (patches, Mimi\'s flag)' })
    .npc('rival_h', 6, 3, 'rival', 'down', null, { script: rival5, hideIf: 'rival5_done', note: 'Rival #5 (give the Woolen Peak letter)' })
    .npc('mimi_h', 6, 8, 'mimi', 'up', null, { hidden: true })
    .npc('mech', 2, 6, 'hiker', 'right', ['Dart\'s balloon tore on a tree when the Society made everyone land in a hurry.\\pShe flew it down so gently, it barely bruised the tree. The balloon came off worse.'])
    .reg();
  // Mimi stays in the hangar once she's made the flag
  NP.maps.kite_hangar.npcs.find((n) => n.id === 'mimi_h').script = function* (c) {
    yield* c.sayT('kite_hangar.mimi.again', 'Mimi: I\'m adding a tassel. Every good flag needs a tassel. Dart says the tassel is "aerodynamically brave".');
  };
  Object.defineProperty(NP.maps.kite_hangar.npcs.find((n) => n.id === 'mimi_h'), 'hidden', { get() { return !(NP.state && NP.state.flags.mimi_flag); }, set() {} });

  // ---- the balloon post office
  L.room({ id: 'kite_post', name: 'Balloon Post', w: 11, h: 8, doorX: 4, floor: 'floor_wood', exit: { to: 'kite_hill', door: 'post' } })
    .stamp('counter_c', 4, 3).stamp('counter_c', 5, 3).stamp('counter_c', 6, 3).stamp('crate', 1, 2).stamp('crate', 1, 3).stamp('crate', 9, 2).stamp('bookshelf', 8, 0)
    .npc('postmistress', 5, 2, 'lady', 'down', null, { script: postmistress, note: 'the postmistress (letters quest)' })
    .npc('sorter', 8, 5, 'aide_m', 'left', ['We sort the letters by town, then by street, then by how nice the handwriting is.\\pThat last one isn\'t official. It\'s just more fun.'])
    .reg();
  L.room({ id: 'kite_ogi', name: 'Mr. Ogi\'s House', w: 9, h: 8, doorX: 3, exit: { to: 'kite_hill', door: 'ogi' } })
    .stamp('bookshelf', 1, 0).stamp('table_s', 4, 4).stamp('chair', 6, 4).stamp('plant', 7, 2)
    .npc('ogi', 4, 3, 'elder_m', 'down', null, { script: letter(1, 'kite_ogi', {
      before: 'Mr. Ogi: I read my post upside down. Bad news looks a lot less serious that way, and I\'d rather not be upset before breakfast.',
      give: 'You hand Mr. Ogi the letter, upside down. He beams.\\pMr. Ogi: Someone who knows the rules! It\'s from my nephew. Upside down, it says he\'s "doing well". The right way up, it says "doing well" too. Lovely.',
      after: 'Mr. Ogi: I\'ve hung my nephew\'s letter on the wall, upside down. It\'s the only proper way.',
    }) })
    .reg();
  L.room({ id: 'kite_house', name: 'House', w: 9, h: 8, doorX: 3, exit: { to: 'kite_hill', door: 'house' } })
    .stamp('bed', 1, 2).stamp('tv', 6, 1).stamp('table_s', 4, 4)
    .npc('gran', 4, 3, 'elder_f', 'down', ['My grandson loves cocoa more than he loves me. I\'ve made my peace with it.'])
    .reg();
  L.tea({ id: 'kite_tea', name: 'Tea House', exit: { to: 'kite_hill', door: 'tea' }, guests: [
    { id: 'g1', x: 7, y: 6, look: 'pilot', dir: 'left', say: ['Dart could fly before she could walk. Well, that\'s what she says. Her mum says she could walk first, but grumpily.'] },
  ] }).reg();
  L.store({ id: 'kite_store', exit: { to: 'kite_hill', door: 'store' },
    stock: ['bond_spool', 'silk_spool', 'gold_spool', 'snack_cake', 'fancy_cake', 'dune_cocoa', 'aloe_balm', 'mint_tea', 'wake_bell', 'numb_away', 'revive_tea', 'scent_spray', 'thread_ball'],
    guests: [{ id: 'shopper', x: 7, y: 5, look: 'skier', dir: 'left', say: ['I always stock up on Dune Cocoa before a flight. It\'s cold up there, even in summer.'] }] }).reg();
})(typeof globalThis !== 'undefined' ? globalThis : window);
