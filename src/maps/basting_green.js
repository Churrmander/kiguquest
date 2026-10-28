/* Basting Green: the village green between Meadow Lane and Thimble, now a park with no homes. A statue of Astara and Anwela
 * holding the Everspool stands dead centre on a paved plaza, with an outdoor tea house (NW: heal, cook, storage kiosk, the
 * blackout point), a market of three carts (NE) under the crooked bunting, a picnic lawn (SW) and a flower garden (SE).
 * On Tidy Day the Society's parade of folded sheets holds the north road until `thimble_reached`, so the way to Thimble is
 * round Ribbon Loop to the east. Secrets: a Snip bush (Revive Tea), a Shove rock (Gold Spool) and a hidden Silk Spool.
 * Plan: Basting Green v4 (24 x 22, rows A-V). */
(function (root) {
  'use strict';
  const NP = root.NP, L = NP.levels;
  const PARADE = ['march1', 'march2', 'march3', 'march4', 'tack', 'ply'];

  // ---- Tidy Day: two Pressers walk round the statue to greet you at the park entrance. No fight: the first Society battle
  // is still Tuck in Thimble.
  function* tidyDay(c) {
    c.set('tidy_seen');
    const p = c.player, a = c.npc('tack'), b = c.npc('ply');
    yield* c.emote('player', 'exclaim');
    c.music('society_theme');
    yield* c.approach(a);
    yield* c.walkTo(b, p.x === 11 ? 12 : 11, 18);
    yield* c.face(b, 'down');
    yield* c.face('player', 'up');
    yield* c.sayT('basting_green.tidy.1', 'Tack: Good morning, citizen! Happy Tidy Day!\\pThe Society for Tidy Living thanks you for your patience.');
    yield* c.sayT('basting_green.tidy.2', 'Ply: The parade of folded sheets is on the north road.\\pIt\'s very long, and very, very straight.');
    yield* c.sayT('basting_green.tidy.3', 'Tack: Nobody crosses the parade, because that would be untidy.\\pYou may stand in line and admire the folds.');
    yield* c.sayT('basting_green.tidy.4', 'Ply: Participation is optional. Mostly.\\pFlat is fair!');
    yield* c.walkTo(a, 11, 7);
    yield* c.walkTo(b, 12, 7);
    yield* c.face(a, 'down'); yield* c.face(b, 'down');
    c.music('town_thimble');
    const v = c.npc('vlb');
    yield* c.approach(v);
    yield* c.sayT('basting_green.tidy.5', 'Villager: Oh, those Pressers. They march right down the main road every year.\\pIf you want Thimble, dear, take the east road round by Ribbon Loop.');
    yield* c.walkTo(v, 18, 10);
    yield* c.face(v, 'left');
  }

  // ---- the crooked bunting over the market: pat it flat and it springs right back (the small joke from the padding list)
  function* bunting(c) {
    yield* c.sayT('basting_green.bunting.1', 'Someone has hung this string of bunting a little crooked.');
    if (!(yield* c.ask('Pat the bunting straight?'))) return;
    NP.snd.sfx('leaf');
    yield* c.sayT('basting_green.bunting.2', '{player} patted the bunting flat...\\p...and it sprang right back, crooked as ever.');
    if (!c.flag('bunting_pat') && !c.flag('thimble_reached')) {
      c.set('bunting_pat');
      yield* c.sayT('basting_green.bunting.3', 'Ply (from the parade): I saw that! ...Honestly? It looks nicer crooked.\\pDon\'t tell Tack I said so.');
    }
  }

  // ---- market carts: each vendor has her own small stock (shopx reads one map-wide list, so each cart gets its own script)
  // Greetings are drafts awaiting the owner's OK (the plan gives none).
  const HELLO = {
    cart_food: 'Fresh snacks for you and your Kigu! Have a look.',
    cart_spool: 'Need spools for befriending Kigu? Have a look.',
    cart_sundries: 'I\'ve got a bit of everything for the road. Have a look.',
  };
  const cart = (key, stock, gated) => function* (c) {
    yield* c.sayT('basting_green.' + key + '.1', HELLO[key]);
    const list = stock.filter((id) => NP.data.items[id]);
    if (gated && c.state.badges && c.state.badges[0]) for (const id of gated) if (NP.data.items[id]) list.push(id);
    yield* c.shop(list);
    yield* c.sayT('basting_green.' + key + '.2', 'Thanks! Come back any time.');
  };
  const cartFood = cart('cart_food', ['snack_cake', 'fancy_cake', 'sugar_cube']);            // plan: Snack Cakes, Sugar Cubes, other snacks
  const cartSpool = cart('cart_spool', ['bond_spool'], ['silk_spool']);                      // plan: Bond Spools now, Silk Spools after Salon 1
  const cartSundries = cart('cart_sundries', ['aloe_balm', 'mint_tea', 'wake_bell', 'thaw_pad', 'numb_away', 'scent_spray', 'thread_ball']);

  // ---- Gran Tansy on the picnic lawn: a cup of cocoa (no heal now that the tea house is here) and the garden hint.
  // gran.1 and gran.2 are drafts awaiting the owner's OK; gran.3 is today's line and gran.4 the plan's line, both exact.
  function* gran(c) {
    yield* c.sayT('basting_green.gran.1', 'Gran Tansy: Hello, dear! Sit down and have a cup of cocoa with me.\\pI always bring far too much in my thermos.');
    yield* c.sayT('basting_green.gran.2', 'Gran Tansy poured you a cup of warm cocoa from her thermos.');
    yield* c.sayT('basting_green.gran.3', 'Gran Tansy: I used to stitch all the ribbons for Ribbon Day, you know.\\pNow they want everything folded. Who folds a ribbon? Honestly!');
    if (!c.flag('got_basting_green_garden_silk')) yield* c.sayT('basting_green.gran.4', 'Gran Tansy: Someone\'s always dropping things in that flower garden. I find all sorts in there.');
  }

  // ---- the statue's plaque. While the parade is on, the Pressers have wrapped it in a folded sheet (the wrapped line is a draft).
  function* statue(c) {
    if (!c.flag('thimble_reached')) { yield* c.sayT('basting_green.statue.wrapped', 'The statue is wrapped up in a big folded sheet.\\pA little tag pinned to it says it\'s closed for cleaning.'); return; }
    yield* c.sayT('basting_green.statue', 'ASTARA AND ANWELA\\nThey wove the world together, and every spring Basting Green ties a ribbon on them to say thanks.');
  }

  const M = L.map({
    id: 'basting_green', name: 'Basting Green', music: 'town_thimble', battleBg: 'grass', border: 'treeline', view: 'street', w: 24, h: 22,
    teaHouse: true,   // the outdoor tea counter is a heal and blackout point (spawn 'door' in front of it)
    town: true,       // a park: no tree shaking here
    legend: { '.': 'grass', T: 'treeline', p: 'path', c: 'cobble', f: 'flowers' },
    onEnter: function* (c) {
      L.syncStamps(c);   // statue: wrapped on Tidy Day, ribbons once you've reached Thimble
      if (c.flag('thimble_reached')) for (const id of PARADE) c.hideNpc(id);
    },
  });

  // plan rows, verbatim
  M.ascii(0, 0, [
    'TTTTTTTTTTTppTTTTTTTTTTT', // A
    'TTTTTTTTTTTppTTTTTTTTTTT', // B
    'TTTTTTTTTTTppTTTTTTTTTTT', // C
    'TTTTTTT...TppTTTTTTTTTTT', // D  Snip nook (7..9,3..4)
    'TTTTTTT...TppTTTTTTTTTTT', // E
    'TTTTTTTT.TTppTTTTTTTTTTT', // F  Snip bush at (8,5)
    'TTccccc....pp...ccccccTT', // G  tea patio / market
    'TTccccc....pp...ccccccTT', // H
    'TTccccccccccccccccccccTT', // I  promenade
    'TTccccccccccccccccccccTT', // J
    'TTffffffcccccccc......TT', // K
    'TT......ccccccccpppppppp', // L  east road to Ribbon Loop
    'TT......ccccccccpppppppp', // M
    'TT......cccccccc......TT', // N
    'TT......ccccccccffffffTT', // O
    'TT......ccccccccff..ffTT', // P
    'TT.........pp...ff..ffTT', // Q
    'TT.........pp...ff..ffTT', // R
    'TT.........pp...ffffffTT', // S
    'TTfffffffffppfffffffffTT', // T  Tidy Day trigger (11..12,19)
    'TTTTTTTTTTTppT...TTTTTTT', // U  Shove nook (14..16,20)
    'TTTTTTTTTTTppT.TTTTTTTTT', // V
  ]);

  // ---- the statue (dead centre of the plaza, on the north-south road axis)
  M.stamp('statue', 10, 10, 'wrapped');
  L.variantByFlag(M.def.stamps[M.def.stamps.length - 1], 'thimble_reached', 'wrapped', 'ribbons');
  M.interact(11, 13, statue, 'statue plaque').interact(12, 13, statue, 'statue plaque');
  M.stamp('bench', 9, 15, 'back').stamp('bench', 13, 15, 'back');   // plaza benches facing the statue; the x11-12 lane stays clear
  // lamps beside the road mouths (posts on grass), symmetric about the statue's axis
  M.stamp('lamp', 10, 6).stamp('lamp', 13, 6).stamp('lamp', 10, 16).stamp('lamp', 13, 16);

  // ---- NW: outdoor tea house (counter, kiosk, tables with parasols)
  M.stamp('tea_stall', 3, 7).stamp('storage_kiosk', 6, 6).stamp('patio_table', 3, 9).stamp('patio_table', 5, 9);
  M.interact(3, 7, 'tea').interact(4, 7, 'tea').interact(5, 7, 'tea').interact(6, 6, 'pc');
  M.npc('maid', 4, 6, 'tea_maid', 'down', null, { script: 'tea', note: 'outdoor Tea House healer behind the counter (shared script "tea")' });
  M.npc('cook', 2, 6, 'cook', 'down', null, { script: 'tea_cook', note: 'Tea House cook: turns a fish into a dish (src/game/fishing.js)' });

  // ---- NE: market carts under the crooked bunting
  M.stamp('market_cart', 16, 7, 'food').stamp('market_cart', 18, 7, 'spool').stamp('market_cart', 20, 7, 'sundries');
  M.interact(16, 7, cartFood).interact(17, 7, cartFood).interact(18, 7, cartSpool).interact(19, 7, cartSpool).interact(20, 7, cartSundries).interact(21, 7, cartSundries);
  M.npc('cart_food', 16, 6, 'villager_m1', 'down', null, { script: cartFood, note: 'food cart vendor' });
  M.npc('cart_spool', 18, 6, 'shopkeeper', 'down', null, { script: cartSpool, note: 'spool cart vendor' });
  M.npc('cart_sundries', 20, 6, 'lady', 'down', null, { script: cartSundries, note: 'sundries cart vendor' });
  M.stamp('bunting', 17, 9).stamp('bunting', 19, 9);
  for (let x = 17; x <= 20; x++) M.interact(x, 9, bunting, 'crooked bunting');

  // ---- SW: picnic lawn
  M.stamp('picnic_blanket', 3, 13, 'red').stamp('picnic_blanket', 5, 17, 'blue');
  M.stamp('picnic_bench', 2, 16);
  M.stamp('kite', 7, 11);
  M.npc('gran', 3, 16, 'elder_f', 'down', null, { script: gran, note: 'Gran Tansy with her thermos (cocoa, no heal)' });
  M.npc('kidb', 7, 13, 'child_m', 'up',
    'There\'s an Acolarva on Ribbon Loop who sits by the hay munching leaves all day.\\pShe just snacks and sunbathes. I want to be her when I grow up.');

  // ---- SE: flower garden with a bench on its little lawn
  M.stamp('bench', 18, 16);

  // ---- visitors
  M.npc('vlb', 18, 10, 'villager_f1', 'left',
    'Tidy Day comes every year now. It used to be Ribbon Day.\\pWe tied ribbons on everything, and nobody folded anything.', { move: 'turn' });
  M.npc('flb', 14, 14, 'fisher', 'up',
    'Win a few on Ribbon Loop and Master Poppy will hear about it!');   // plan O15, the approved line verbatim

  // ---- the parade: folded-sheet bearers fill the north road until you have reached Thimble the long way round
  const parade = (id, x, y, look, dir, say) => M.npc(id, x, y, look, dir, say, { hideIf: 'thimble_reached' });
  parade('march1', 11, 3, 'grunt_m', 'right', 'Left, right, fold! Left, right, fold!\\pPlease don\'t cross the parade. You\'ll crease it.');
  parade('march2', 12, 3, 'grunt_f', 'left', 'These sheets were all folded in thirds by hand.\\pThen we folded the thirds in thirds, and then we ran out of thirds.');
  parade('march3', 11, 5, 'villager_m2', 'down', 'They asked me to carry a sheet. I couldn\'t think of a reason to say no.\\pThe parade goes all the way to Thimble. Try Ribbon Loop!');
  parade('march4', 12, 5, 'villager_f2', 'down', 'I\'ve been holding this sheet since breakfast, and I can\'t feel my arms.\\pIf you\'re off to Thimble, take the east road. It\'s lovely.');
  parade('tack', 11, 7, 'grunt_m', 'down', 'Tack: The parade has right of way, citizen. Everything in its place!\\pThimble is that way, but so is the parade. So, no.');
  parade('ply', 12, 7, 'grunt_f', 'down', 'Ply: Ribbon Loop is the scenic route. I\'d take it myself.\\p...Please don\'t tell Tack I said that either.');
  M.trigger({ x: 11, y: 19, w: 2, h: 1, id: 'tidy_day', when: (c) => !c.flag('tidy_seen') && !c.flag('thimble_reached'), script: tidyDay });

  // ---- trees and signs
  M.trees([[2, 11], [9, 17], [14, 17], [14, 6], [21, 13]]);
  M.sign(10, 18, 'BASTING GREEN\\nThe village green, now a park for everyone. Picnics welcome!', 'park sign');
  M.sign(20, 10, 'EAST: RIBBON LOOP\\nThe long way round to Thimble Village.', 'east sign');

  // ---- secrets
  // X1: Snip the bush at the north treeline to reach a little nook with a Revive Tea (Snip comes from Poppy in Thimble)
  M.stamp('bush', 8, 5);
  M.pickup('nook_tea', 8, 3, 'revive_tea', 1, 'Revive Tea in the Snip nook');
  M.def.props[M.def.props.length - 1].gate = 'snip';
  // X2: Shove the rock south (into 14,21) to open the nook with a Gold Spool (Shove comes from the Quarry Salon).
  // The flowerbed closes the nook from the flower strip above it.
  M.stamp('shove_rock', 14, 20, 'grass');
  M.stamp('flowerbed', 15, 19, 'pink');
  M.pickup('nook_gold', 16, 20, 'gold_spool', 1, 'Gold Spool in the Shove nook');
  M.def.props[M.def.props.length - 1].gate = 'shove';
  // X3: a Silk Spool hidden on the garden lawn; Gran drops the hint
  M.hidden('garden_silk', 18, 15, 'silk_spool', 1, 'hidden Silk Spool on the garden lawn');

  // ---- exits and spawns
  // arrivals land on the road's east lane (x12), the column Route 1's and Thimble's roads share, so crossing over never jumps sideways
  M.spawn('south', 12, 20, 'up').spawn('north', 12, 2, 'down').spawn('east', 22, 11, 'left');
  M.spawn('door', 4, 8, 'up');   // in front of the tea counter: where a blackout wakes you
  M.edge('s', 11, 12, 'route1', 'north').edge('n', 11, 12, 'thimble', 'south').edge('e', 11, 12, 'ribbon_loop', 'west');
  M.reg();
})(typeof globalThis !== 'undefined' ? globalThis : window);
