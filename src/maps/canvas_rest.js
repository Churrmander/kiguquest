/* Canvas Rest — the tent camp at the edge of the Dust Bowl. A Tea House (Dune Cocoa!), a General Store, and the weavers' tents.
 * Story: Mimi is here sketching desert costumes; she sews you a Dust Scarf from tent-cloth (her first design that people wear),
 * which is what gets you through the dust storm. Mr. Sharp is "just a humble rug". West: Route 4. East: the Dust Bowl. */
(function (root) {
  'use strict';
  const NP = root.NP, L = NP.levels;
  const W = 32, H = 22;

  // ---- Mimi and the dust scarves (plays the first time you walk into camp)
  function* mimiCamp(c) {
    c.set('mimi_camp_done');
    const m = c.npc('mimi_c');
    yield* c.emote(m, 'exclaim');
    yield* c.walk(m, ['left', 2]);
    yield* c.face('player', 'right');
    yield* c.sayT('canvas_rest.mimi.1', 'Mimi: {player}, look at this place! Every tent is sewn from sun-cloth,\\pand they double the seams so the sand can\'t creep in. I\'ve drawn twenty pages already!');
    yield* c.sayT('canvas_rest.mimi.2', 'Mimi: The weavers say a dust storm is blowing across the Dust Bowl.\\pYou can\'t see your own feet out there, never mind the road.');
    yield* c.sayT('canvas_rest.mimi.3', 'Mimi: So I made something! It\'s a scarf from tent-cloth, with a tight weave so the grit stays out.\\pThe weavers let me use their scraps. It\'s my first design that anyone has actually worn!');
    yield* c.giveItem('dust_scarf', 1);
    yield* c.sayT('canvas_rest.mimi.4', 'Mimi: {rival} came through like a whirlwind, so I tied one round their neck as they ran past.\\pThey shouted "thanks!" from about a mile away.');
    yield* c.sayT('canvas_rest.mimi.5', 'Mimi: The nomads tie red thread on posts to mark the safe way across.\\pFollow the red, and you\'ll come out at Bobbin Quarry. I\'m staying here to sketch some more!');
    yield* c.walk(m, ['right', 2]);
    yield* c.face(m, 'down');
  }

  const M = L.map({
    id: 'canvas_rest', name: 'Canvas Rest', music: 'town_desert', battleBg: 'desert', border: 'dune', w: W, h: H, view: 'town',
    legend: { u: 'dune', s: 'sand', C: 'cliff', d: 'track', v: 'track_v', ';': 'dry_grass' },
    fill: 'u',
  });
  M.rect(0, 0, W, 2, 'C').rect(0, 20, W, 2, 'C').rect(0, 2, 1, 18, 'C').rect(W - 1, 2, 1, 18, 'C');
  M.rect(0, 10, 1, 2, 'u').rect(W - 1, 10, 1, 2, 'u');
  M.rect(0, 10, W, 2, 'd');                                                  // the caravan road straight through camp
  M.building('tea_house', 6, 4, null, 'tea', 'canvas_tea');
  M.building('general_store', 21, 4, null, 'store', 'canvas_store');
  M.rect(7, 8, 3, 2, 'v').rect(22, 8, 3, 2, 'v');                           // lanes to the doors, 3 wide and centred
  M.rect(13, 12, 5, 3, 'v');                                                 // a little square by the well
  M.stamp('well', 14, 13);
  // the weavers' tents
  M.stamp('tent', 2, 14, 'red').stamp('tent', 8, 15, 'cream').stamp('tent', 19, 15, 'blue').stamp('tent', 25, 14, 'ochre').stamp('tent', 13, 3, 'green');
  M.stamp('cloth_line', 11, 8).stamp('cloth_line', 27, 8).stamp('cactus', 1, 3).stamp('cactus', 29, 3, 'plain').stamp('palm', 17, 5).stamp('barrel', 5, 9).stamp('crate', 19, 8);
  M.rect(28, 15, 3, 4, ';');
  // lamps on the corners where the lanes meet the road
  M.stamp('lamp', 6, 8).stamp('lamp', 25, 8);
  M.sign(12, 9, 'CANVAS REST\\nDUNE\'T FRAY!\\pWater at the well. Shade in every tent. Sand everywhere else.', 'camp sign');
  M.sign(29, 9, 'EAST: THE DUST BOWL\\nFollow the red thread.', 'east sign');
  M.spawn('west', 1, 10, 'right').spawn('east', 30, 10, 'left');
  M.edge('w', 10, 11, 'route4', 'east').edge('e', 10, 11, 'dust_bowl', 'west');
  M.trigger({ x: 2, y: 10, w: 1, h: 2, id: 'mimi_camp', when: (c) => !c.flag('mimi_camp_done'), script: mimiCamp });
  // nobody walks into the storm without a scarf (only a save made mid-scene can get here without one)
  M.trigger({ x: 29, y: 10, w: 1, h: 2, id: 'storm_gate', when: (c) => !c.state.bag.dust_scarf, script: function* (c) {
    yield* c.sayT('canvas_rest.storm_gate', 'A weaver: Whoa, there! You\'ll have sand in your eyes in two steps.\\pMimi\'s been making scarves by the well. Go and see her first.');
    yield* c.walk('player', ['left', 1]);
  } });

  M.npc('mimi_c', 16, 12, 'mimi', 'down', null, { script: function* (c) {
    if (c.flag('herd_done')) { yield* c.sayT('canvas_rest.mimi.later', 'Mimi: The weavers asked me to make ten more scarves! TEN! For money!\\pI\'m trying very hard to act normal about it.'); return; }
    yield* c.sayT('canvas_rest.mimi.again', 'Mimi: Keep your scarf up over your nose in the storm, and follow the red thread.\\pIf you see a very proud post, you\'ve gone the wrong way.');
  } });
  M.npc('weaver1', 4, 13, 'villager_f2', 'down', ['We sew every tent twice. Once for the shade, and once for the wind.\\pYour friend asked about our seams for an hour! I liked her.']);
  M.npc('weaver2', 23, 13, 'elder_m', 'left', ['The Society wants to buy our tents and press them flat for "neat storage".\\pA flat tent is just a very expensive blanket. I told them no.']);
  M.npc('kid', 18, 12, 'child_m', 'up', ['I saw a Tumbi roll past in the storm last week! It was all scarves and eyes.\\pThey only come out when the dust is blowing.'], { move: 'wander', range: 2 });
  M.npc('sharp', 28, 13, 'gentleman', 'left', null, { script: L.giver('rug', 'snack_cake', 1, {
    give: ['Mr. Sharp: Camel? No, no. I\'m a rug. Just a humble rug, minding my own business.\\pA rug that has a spare Snack Cake, as it happens. Rugs get peckish.'],
    got: ['Mr. Sharp: Off you go, and don\'t tell anyone you talked to a rug. They\'d never believe you.'],
    again: ['Mr. Sharp: I\'m still a rug. A very relaxed rug. Pay me no attention at all.'],
  }) });
  M.pickup('scent', 30, 17, 'scent_spray', 1);
  M.hidden('well', 15, 13, 'wish_candy', 1, 'something shiny at the bottom of the well');
  M.reg();

  L.tea({ id: 'canvas_tea', name: 'Tea House', exit: { to: 'canvas_rest', door: 'tea' }, guests: [
    { id: 'g1', x: 7, y: 6, look: 'hiker', dir: 'left', say: ['They serve Dune Cocoa here, with cinnamon. It\'s the best thing in the whole desert.\\pThe store sells it by the cup, if you want some for the road.'] },
    { id: 'g2', x: 2, y: 5, look: 'villager_m2', dir: 'right', say: ['I drove a slab cart for the Society once. The wheels sink, the slabs slide, and nobody says thank you.\\pNow I sell tea towels. People say thank you for tea towels.'] },
  ] }).reg();
  L.store({ id: 'canvas_store', exit: { to: 'canvas_rest', door: 'store' },
    stock: ['bond_spool', 'silk_spool', 'snack_cake', 'fancy_cake', 'dune_cocoa', 'aloe_balm', 'mint_tea', 'wake_bell', 'numb_away', 'scent_spray', 'thread_ball', 'revive_tea'],
    gated: [{ badges: 3, items: ['gold_spool'] }],
    guests: [{ id: 'shopper', x: 7, y: 5, look: 'villager_f1', dir: 'left', say: ['I always buy two Dune Cocoas. One to drink, and one to hold, because it\'s cold at night out here.'] }] }).reg();
})(typeof globalThis !== 'undefined' ? globalThis : window);
