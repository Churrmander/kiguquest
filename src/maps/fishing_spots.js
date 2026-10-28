/* Fishing spots and Paddling encounters for the maps that already had water, plus the two people who hand out rods.
 * (Hemline Riverside, Hemline Lake and Ryukoi's cave set their own; see src/maps/hemline_river.js and hemline_lake.js.)
 *  - Rods only hook fish-based Tide Kigu, and only in the water their fish lives in: Kiskat, Zeel and Gilfin in fresh water,
 *    Fugubun and Kelpony in the sea at Button Town. Paddling finds the other water Kigu (Kerochapu, Waddlecoat, Jellybob,
 *    Clawdet). You can't paddle until Bryn's Disc in Hemline, so Paddling levels start at about 12.
 *  - The Old Rod comes from Gus on Route 2 (with the Fishing Log and the Fish Pocket); the Good Rod from the fisher at the
 *    Oasis, once you show him there are fish in an oasis after all (Desert Pupfish, Old Rod). The Super Rod is in Loomhaven
 *    (Chapter 8, not built yet). def.fishing format: src/game/fishing.js. */
(function (root) {
  'use strict';
  const NP = root.NP, L = NP.levels;

  const FRESH = (lo, mid, hi, extra) => Object.assign({
    water: 'fresh',
    kigu: { 1: [['gilfin', lo, lo + 3, 60], ['kiskat', lo, lo + 3, 40]], 2: [['kiskat', mid, mid + 4, 40], ['zeel', mid, mid + 4, 25], ['gilfin', mid, mid + 4, 35]], 3: [['slickish', hi, hi + 4, 40], ['zeel', hi, hi + 4, 30], ['gilfin', hi, hi + 4, 30]] },
  }, extra || {});
  const SPOTS = {
    button_town: { water: 'salt', kigu: { 1: [['fugubun', 5, 8, 100]], 2: [['fugubun', 18, 22, 60], ['kelpony', 18, 22, 40]], 3: [['bloppoo', 32, 36, 60], ['kelpony', 30, 34, 40]] } },
    route1: FRESH(4, 18, 30),
    ribbon_loop: FRESH(4, 18, 30),
    route2: FRESH(5, 18, 30, { river: true }),
    // the desert pools: only the little pupfish (and, with a better rod, a Kiskat in the mud at the bottom)
    sun_flats: { water: 'fresh', only: ['desert_pupfish'], kigu: { 2: [['kiskat', 22, 25, 100]] } },
    dust_oasis: { water: 'fresh', only: ['desert_pupfish'], kigu: { 2: [['kiskat', 22, 25, 100]] } },
    bobbin_quarry: FRESH(10, 24, 34, { kigu: { 1: [['gilfin', 10, 14, 100]], 2: [['zeel', 24, 27, 60], ['kiskat', 24, 27, 40]], 3: [['zeel', 34, 38, 50], ['slickish', 34, 38, 50]] } }),
    route5: FRESH(10, 26, 34, { kigu: { 1: [['gilfin', 10, 14, 100]], 2: [['zeel', 26, 29, 60], ['kiskat', 26, 29, 40]], 3: [['slickish', 34, 38, 50], ['zeel', 34, 38, 50]] } }),
  };
  const PADDLE = {
    button_town: [['clawdet', 12, 16, 50], ['jellybob', 12, 16, 25], ['waddlecoat', 12, 16, 25]],
    route1: [['kerochapu', 12, 15, 60], ['waddlecoat', 12, 15, 40]],
    ribbon_loop: [['kerochapu', 12, 15, 60], ['waddlecoat', 12, 15, 40]],
    route2: [['kerochapu', 13, 16, 50], ['waddlecoat', 13, 16, 30], ['jellybob', 13, 16, 20]],
    sun_flats: [['kerochapu', 21, 24, 100]],
    dust_oasis: [['kerochapu', 22, 25, 100]],
    bobbin_quarry: [['kerochapu', 24, 27, 50], ['lilyrana', 25, 28, 20], ['waddlecoat', 24, 27, 30]],
    route5: [['waddlecoat', 26, 29, 50], ['kerochapu', 26, 29, 30], ['jellybob', 26, 29, 20]],
  };
  for (const id of Object.keys(SPOTS)) {
    const def = NP.maps[id];
    if (!def) continue;
    def.fishing = SPOTS[id];
    def.encounters = def.encounters || {};
    if (PADDLE[id] && !def.encounters.water) def.encounters.water = PADDLE[id].map((e) => ({ sp: L.sp(e[0]), min: e[1], max: e[2], w: e[3] }));
  }

  // ---- Gus (Route 2): once you've beaten him he gives you his old rod and the Fishing Log, and sews a Fish Pocket on your bag
  NP.scripts.gus_rod = function* (c) {
    const k = (s) => 'route2.gus.' + s;
    if (c.flag('got_old_rod')) {
      yield* c.sayT(k('again'), 'Gus: Rods only hook Kigu that live like fish, you know. The rest you\'ll meet out on the water.\\pAnd there\'s a fishing contest down at Hemline Lake! South of Hemline, past the river.');
      return;
    }
    yield* c.sayT(k('1'), 'Gus: You battle like the river runs. Fast, and every which way!\\pHere, take my old rod. I\'ve got three more at home, and my wife says that\'s three too many.');
    c.set('got_old_rod');
    yield* c.giveItem('old_rod');
    NP.Fishing.registerRod('old_rod');   // ready on Select straight away
    yield* c.sayT(k('2'), 'Gus: And you\'ll want this. It\'s a Fishing Log. Every fish you land goes in it: how many, and how big.');
    yield* c.giveItem('fishing_log');
    yield* c.sayT(k('3'), 'Gus: Now hand me your bag a moment. ...There!\\pI sewed a Fish Pocket onto it. Your fish go in there and stay nice and fresh.');
    c.set('fish_pocket');
    yield* c.sayT(k('4'), '...Don\'t ask how that works.');
    yield* c.sayT(k('5'), 'Gus: Face the water and use the rod from your Bag, or just press Select.\\pWhen the float bobs and you see the "!", press A, quick as you can!\\pAny Tea House cook will make a dish out of a fish for you. Good for your Kigu, that is.');
  };

  // ---- the fisher at the Oasis: "There aren't any fish in an oasis." Show him a Desert Pupfish and he gives you his Good Rod.
  NP.scripts.oasis_fisher = function* (c) {
    const k = (s) => 'dust_oasis.fisher.' + s;
    const log = (NP.state.fish && NP.state.fish.log) || {};
    if (c.flag('got_good_rod')) {
      yield* c.sayT(k('after'), 'I come here every day now. Twelve pupfish so far!\\pI\'ve named every one of them, and then let them go. Pupfish number six is called Gus.');
      return;
    }
    if (log.desert_pupfish) {
      yield* c.sayT(k('1'), 'You landed a Desert Pupfish? Here?! Let me see...\\pThere ARE fish in an oasis! I\'ve been sitting here for years!');
      yield* c.sayT(k('2'), 'Here, take my Good Rod. Pupfish are tiny, so I\'m going to need a tiny rod.\\pYou\'ll catch far bigger things with this one than I ever did.');
      c.set('got_good_rod');
      yield* c.giveItem('good_rod');
      NP.Fishing.registerRod('good_rod');
      yield* c.sayT(k('3'), 'Bigger fish and rarer Kigu bite on a Good Rod. Go on, the whole world\'s full of water!');
      return;
    }
    if (NP.State.count('old_rod')) {
      yield* c.sayT(k('rod'), 'There aren\'t any fish in an oasis. I know that.\\p...You\'ve got a rod too? Go on, then. Try it. You won\'t land anything.');
      return;
    }
    yield* c.sayT(k('0'), 'There aren\'t any fish in an oasis. I know that.\\pI just like sitting by water with a rod. It\'s very calming.');
  };
})(typeof globalThis !== 'undefined' ? globalThis : window);
