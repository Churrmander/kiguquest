/* Bobbin Quarry — a terraced quarry town (Salon 4, Gusset, Terra). Upper terrace: the tunnel mouth, the Salon and the foreman's hut.
 * Middle: the caravan road, the Tea House and the store. Below: the flooded old pit, slab stacks and the ore-cart line.
 * Story: the quarry is shut. Pressers dug too fast and spooked a Pebblump herd, which now fills the tunnels, and Gusset is stuck down
 * the pit. Rival #4 waits at the gate ("I just want to measure how far we've both come"). After the herd settles (quarry_tunnels),
 * Gusset has tea with you in his hut (quarry_hut) and the Salon opens. Flags: quarry_reached, rival4_done, herd_done, gusset_back. */
(function (root) {
  'use strict';
  const NP = root.NP, L = NP.levels;
  const W = 36, H = 30;

  function* rival4(c) {
    c.set('rival4_started');
    const r = c.npc('rival_q');
    c.placeNpc(r, c.player.x + 3, c.player.y, 'left');
    c.showNpc('rival_q');
    yield* c.emote(r, 'exclaim');
    yield* c.sayT('bobbin_quarry.rival4.1', '{rival}: You made it! I won the race, by the way. I\'ve been here for ages.\\p...Okay, twenty minutes. I got lost at a very proud post.');
    yield* c.face(r, 'down');
    yield* c.sayT('bobbin_quarry.rival4.2', '{rival}: Can we battle? Not to win, exactly.\\pI just want to measure how far we\'ve both come since Button Town.');
    yield* c.face(r, 'left');
    yield* c.sayT('bobbin_quarry.rival4.3', '{rival}: Dad always measured the flour twice before he baked anything.\\pI used to think that was boring. Now I sort of get it.');
    c.music('battle_rival');
    // owner's rule: the rival's starter is weak to yours, with one teammate that hits your starter hard (switching pays, never forced)
    const counter = { konko: 'ottelia|kerochapu', ottopi: 'arcorn|scurrent', sprubun: 'lyripip|chirpadee' }[c.state.starter] || 'scurrent|chirpadee';
    const team = L.team([[L.evoStarter(c.state.rivalStarter), 26], [counter, 24], ['kumara|acolarva', 24], ['tortile|kumi', 25]]);
    const won = yield* c.trainerBattle({ cls: 'Rival', name: '{rival}', look: 'rival', ai: 2, reward: 20, canLose: true, team });
    c.set('rival4_done');
    c.music(c.map.def.music);
    if (won) yield* c.sayT('bobbin_quarry.rival4.win', '{rival}: Yep, that\'s about what I measured. You\'re a long way ahead.\\pThat\'s okay. At least now I know how far I\'ve got to go.');
    else yield* c.sayT('bobbin_quarry.rival4.lose', '{rival}: Huh. I won? Don\'t tell anyone, but I didn\'t expect that.\\pGo and rest your Kigu. The Tea House here does a cocoa with cinnamon.');
    yield* c.sayT('bobbin_quarry.rival4.4', '{rival}: The quarry\'s shut, did you hear? There\'s a whole herd of Pebblump stuck down the tunnels,\\pand the foreman went in after them and hasn\'t come out.\\pI\'m going to ask around town. You should try the tunnel up on the top terrace.');
    yield* c.walk(r, ['right', 6]);
    c.hideNpc('rival_q');
  }

  const M = L.map({
    id: 'bobbin_quarry', name: 'Bobbin Quarry', music: 'town_quarry', battleBg: 'desert', border: 'cliff', w: W, h: H, view: 'town',
    legend: { q: 'quarry', C: 'cliff', t: 'track', v: 'track_v', w: 'water', b: 'bridge_h', h: 'rail_h', u: 'dune', ';': 'dry_grass' },
    fill: 'q',
    onEnter: function* (c) { c.set('quarry_reached'); },
  });
  M.rect(0, 0, W, 2, 'C').rect(0, 28, W, 2, 'C').rect(0, 2, 2, 26, 'C').rect(W - 2, 2, 2, 26, 'C');
  M.rect(0, 14, 2, 2, 't');                                                // in from the Dust Bowl
  // the terraces: a sandstone step between the top terrace and the town, one ramp up (centred on the Salon lane)
  M.rect(2, 8, 32, 2, 'C').rect(16, 8, 3, 2, 'v');
  M.rect(2, 2, 12, 1, 'C').rect(21, 2, 13, 1, 'C');                      // the back wall of the top terrace (the Salon stands in it)
  // roads: the caravan road through the middle, the top terrace street, lanes to every door (3 wide, centred)
  M.rect(2, 14, 32, 2, 't');
  M.rect(4, 7, 27, 1, 't');
  M.rect(16, 10, 3, 4, 'v');                                               // ramp down to the road
  M.rect(4, 5, 3, 2, 'v');                                                 // tunnel mouth lane
  M.rect(27, 6, 3, 1, 'v');                                                // foreman's hut lane
  // the old pit, flooded, with a plank bridge out to a slab island
  M.rect(6, 20, 20, 6, 'w').rect(13, 21, 6, 4, 'q').rect(6, 22, 20, 1, 'b').rect(13, 22, 6, 1, 'q');
  // the ore-cart line along the south side of the road, out to the quarry face in the east
  M.rect(20, 17, 14, 1, 'h');
  M.rect(28, 19, 5, 5, ';');

  M.building('cave_mouth', 4, 3, null, 'tunnel', 'quarry_tunnels', { toDoor: null, note: 'into the tunnels' });
  M.building('salon_tent', 14, 2, 'terra', 'salon', 'quarry_salon', { note: 'Gusset\'s Salon: a big striped tent (owner\'s sun-cloth quest idea)' });
  M.building('house_s', 26, 3, 'gray', 'hut', 'quarry_hut', { note: 'Gusset\'s hut' });
  M.building('tea_house', 5, 10, null, 'tea', 'quarry_tea');
  M.building('general_store', 23, 10, null, 'store', 'quarry_store');
  M.stamp('lamp', 15, 12).stamp('lamp', 19, 12);                          // where the ramp meets the road
  M.stamp('slab_stack', 9, 17).stamp('slab_stack', 10, 17).stamp('slab_stack', 11, 17).stamp('slab_stack', 15, 22).stamp('slab_stack', 16, 22);
  M.stamp('ore_cart', 22, 17, 'full').stamp('ore_cart', 26, 17, 'empty').stamp('buffer', 33, 17).stamp('buffer', 20, 17);   // buffers at both ends (owner's note: the line just stopped)
  M.stamp('cactus', 2, 17).stamp('cactus', 32, 11, 'plain').stamp('rock', 12, 4).stamp('boulder', 23, 5).stamp('barrel', 31, 4).stamp('crate', 3, 12);
  M.sign(12, 13, 'BOBBIN QUARRY\\nNamed for the family who dug the first slab.\\pSolid seams!', 'town sign');
  M.sign(21, 6, 'BOBBIN QUARRY SALON\\nMaster Tailor: Gusset\\p"Measure twice. Cut once. Talk less."', 'Salon sign');
  M.sign(3, 13, 'CLOSED UNTIL FURTHER NOTICE\\nToo much dust, and a herd in the tunnels.\\p-- The Foreman', 'closed notice');

  M.spawn('west', 1, 14, 'right');
  M.edge('w', 14, 15, 'dust_bowl', 'east');
  M.trigger({ x: 3, y: 14, w: 1, h: 2, id: 'rival4', when: (c) => !c.flag('rival4_done'), script: rival4 });

  // the Salon is shut while Gusset is down the pit: an apprentice minds the door
  M.npc('appr', 17, 7, 'hiker', 'down', ['The Salon\'s shut. Gusset\'s down in the tunnels after the Pebblump herd,\\pand nobody battles in his tent without him. The weavers at Canvas Rest sewed it from sun-cloth,\\pso it\'s the only place in the quarry that stays cool. He\'d notice if we sneaked in.'], { hideIf: 'gusset_back', note: 'blocks the Salon lane until gusset_back' });
  M.npc('rival_q', 8, 15, 'rival', 'left', ['{rival}: ...'], { hidden: true });
  M.npc('miner1', 13, 17, 'hiker', 'down', ['The Society bought every slab we cut this year. They want them flat as glass.\\pWe asked what for. They said "pressing", and then they smiled. I didn\'t like the smile.']);
  M.npc('miner2', 30, 15, 'camper', 'left', ['That cart line runs out to the quarry face. When the herd\'s back home,\\pwe can get digging again. Slowly, this time.'], { move: 'turn' });
  M.npc('elder', 8, 18, 'elder_f', 'right', ['The Bobbin family cut the first slab out of this hill, a long time ago.\\pTwo sisters grew up on the top terrace. One of them became a professor down south.\\pNobody here talks much about the other one.']);
  M.npc('kid', 21, 12, 'child_f', 'down', ['The Pebblump aren\'t scary. They\'re just stubborn, and so is Gusset.\\pThat\'s why he went down after them on his own.'], { move: 'wander', range: 1 });
  M.npc('sharp_q', 31, 13, 'gentleman', 'left', ['Mr. Sharp: Hello there! I\'m a humble miner. Look, I\'ve even got a pickaxe.\\p...It\'s a spoon. But a very determined spoon.']);
  M.pickup('island', 16, 23, 'starlit_thread', 1, 'on the slab island in the flooded pit');
  M.pickup('east', 32, 21, 'silk_spool', 2);
  M.hidden('cart', 26, 17, 'wish_candy', 1, 'something rattling in the empty ore cart');
  M.reg();

  // ---- interiors
  L.tea({ id: 'quarry_tea', name: 'Tea House', exit: { to: 'bobbin_quarry', door: 'tea' }, guests: [
    { id: 'g1', x: 7, y: 6, look: 'hiker', dir: 'left', say: ['Gusset doesn\'t say much. Last year he said "good" to me once,\\pand I still think about it.'] },
    { id: 'g2', x: 2, y: 5, look: 'villager_f2', dir: 'right', say: ['The slabs from this quarry used to build bridges and steps and schools.\\pNow they all go north, and nobody\'s told us what they\'re building.'] },
  ] }).reg();
  L.store({ id: 'quarry_store', exit: { to: 'bobbin_quarry', door: 'store' },
    stock: ['bond_spool', 'silk_spool', 'snack_cake', 'fancy_cake', 'dune_cocoa', 'aloe_balm', 'mint_tea', 'wake_bell', 'numb_away', 'all_cure', 'scent_spray', 'thread_ball', 'revive_tea'],
    gated: [{ badges: 3, items: ['gold_spool'] }],
    guests: [{ id: 'shopper', x: 7, y: 5, look: 'camper', dir: 'left', say: ['All-Cure sells out every week. Quarry work gives you every ache there is.'] }] }).reg();
})(typeof globalThis !== 'undefined' ? globalThis : window);
