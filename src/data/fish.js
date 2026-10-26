/* Fishing data: the real, everyday fish of Tsumugi (they're animals, not Kigu, so they never battle), the rare fish the Fishing
 * Master pays for, the rods, the Fishing Log, the Gold Scale and the dishes the Tea House cooks make from a catch.
 *
 * NP.data.fish[id] = { name, water:'fresh'|'salt', rod (1 Old, 2 Good, 3 Super: the weakest rod that can hook it), min, max (cm),
 *   value ($ for a mid-sized one; size scales it), dish (item id it cooks into, or null), w (how often it bites, relative),
 *   only:[map ids] (it lives nowhere else), rare (shown to the Fishing Master, never cooked), icon:{...} (src/art/icons/items-fish.js) }
 * A lunker is any fish in the top 5% of its size range. NP.data.fishIds lists them in Fishing Log order. */
(function (root) {
  'use strict';
  const NP = (root.NP = root.NP || {});
  const fish = (NP.data.fish = NP.data.fish || {});
  const order = (NP.data.fishIds = NP.data.fishIds || []);
  function F(id, name, water, rod, min, max, value, dish, icon, x) {
    NP.reg(fish, id, Object.assign({ name, water, rod, min, max, value, dish, w: 10, only: null, rare: false, icon }, x || {}));
    order.push(id);
  }
  // icon: { shape, body, belly, fin, mark } (shape: slim|round|bass|cat|pike|sturgeon|flat|tuna|squid|oar|goby|pup|carp|trout)
  // ---- fresh water
  F('minnow', 'Minnow', 'fresh', 1, 4, 9, 20, 'grilled_minnow', { shape: 'slim', body: '#a8b8a0', belly: '#e8eee0', fin: '#7a8a70', mark: 'stripe' }, { w: 14 });
  F('bluegill', 'Bluegill', 'fresh', 1, 10, 25, 40, 'lake_fry', { shape: 'round', body: '#5a8ab0', belly: '#f0b050', fin: '#3a5a80', mark: 'bars' }, { w: 12 });
  F('perch', 'Perch', 'fresh', 1, 15, 35, 55, 'lake_fry', { shape: 'bass', body: '#b8b848', belly: '#f0e8b0', fin: '#e06030', mark: 'bars' }, { w: 10 });
  F('desert_pupfish', 'Desert Pupfish', 'fresh', 1, 3, 7, 300, null, { shape: 'pup', body: '#4a7ad8', belly: '#a8c8f0', fin: '#2a4aa0', mark: null }, { w: 8, only: ['dust_oasis', 'sun_flats'], tiny: true });
  F('rainbow_trout', 'Rainbow Trout', 'fresh', 2, 25, 60, 120, 'trout_supper', { shape: 'trout', body: '#a0a8a0', belly: '#f4f0e8', fin: '#7a8a7a', mark: 'rainbow' }, { w: 10 });
  F('largemouth_bass', 'Largemouth Bass', 'fresh', 2, 25, 65, 140, 'bass_stew', { shape: 'bass', body: '#6a8a40', belly: '#e8ecc8', fin: '#4a6a30', mark: 'stripe' }, { w: 10 });
  F('ayu', 'Ayu', 'fresh', 2, 15, 30, 110, 'trout_supper', { shape: 'slim', body: '#9aa890', belly: '#f4f4e8', fin: '#d8c040', mark: 'dot' }, { w: 8, river: true });
  F('catfish', 'Catfish', 'fresh', 2, 30, 90, 130, 'bass_stew', { shape: 'cat', body: '#6a6058', belly: '#d8ccb8', fin: '#4a4038', mark: null }, { w: 8 });
  F('pike', 'Pike', 'fresh', 3, 50, 120, 260, 'river_roast', { shape: 'pike', body: '#6a8a58', belly: '#e8eccc', fin: '#a85030', mark: 'dots' }, { w: 8 });
  F('sturgeon', 'Sturgeon', 'fresh', 3, 80, 200, 400, 'river_roast', { shape: 'sturgeon', body: '#7a8088', belly: '#d8dce0', fin: '#5a6068', mark: 'ridge' }, { w: 4 });
  // ---- salt water
  F('goby', 'Goby', 'salt', 1, 5, 12, 20, 'grilled_minnow', { shape: 'goby', body: '#b0a078', belly: '#ece0c0', fin: '#806848', mark: 'dots' }, { w: 14 });
  F('sardine', 'Sardine', 'salt', 1, 12, 22, 35, 'sardine_skewer', { shape: 'slim', body: '#5a7aa8', belly: '#e8eef4', fin: '#3a5a88', mark: 'dot' }, { w: 14 });
  F('mackerel', 'Mackerel', 'salt', 1, 25, 45, 60, 'mackerel_onigiri', { shape: 'tuna', body: '#3a7a88', belly: '#eef2f4', fin: '#2a5a68', mark: 'waves' }, { w: 10 });
  F('flounder', 'Flounder', 'salt', 2, 25, 60, 120, 'bream_feast', { shape: 'flat', body: '#9a8460', belly: '#e8dcc0', fin: '#7a6440', mark: 'dots' }, { w: 10 });
  F('sea_bream', 'Sea Bream', 'salt', 2, 25, 55, 150, 'bream_feast', { shape: 'round', body: '#e87a80', belly: '#fadce0', fin: '#c85060', mark: 'dot' }, { w: 10 });
  F('sea_bass', 'Sea Bass', 'salt', 2, 30, 80, 150, 'bream_feast', { shape: 'bass', body: '#8a9aa8', belly: '#eef0f2', fin: '#6a7a88', mark: null }, { w: 10 });
  F('squid', 'Squid', 'salt', 2, 20, 50, 90, 'squid_skewer', { shape: 'squid', body: '#f0d0d8', belly: '#fff0f4', fin: '#d890a8', mark: null }, { w: 8 });
  F('yellowtail', 'Yellowtail', 'salt', 3, 50, 110, 280, 'tuna_steak', { shape: 'tuna', body: '#7a9ab8', belly: '#eef2f4', fin: '#f0c830', mark: 'stripe' }, { w: 8 });
  F('bluefin_tuna', 'Bluefin Tuna', 'salt', 3, 100, 250, 600, 'tuna_steak', { shape: 'tuna', body: '#2a4a8a', belly: '#e0e8f0', fin: '#f0c830', mark: null }, { w: 5 });
  F('oarfish', 'Oarfish', 'salt', 3, 300, 600, 1500, null, { shape: 'oar', body: '#d8dce8', belly: '#ffffff', fin: '#e04050', mark: 'dots' }, { w: 1, trophy: true });
  // ---- rare fish: about 1 bite in 500 on the right water. Show one to the Fishing Master for a reward (and, the first time, a
  //      Fishing Master stamp on the Tailor Card).
  F('gold_carp', '24ct Gold Carp', 'fresh', 1, 40, 80, 3000, null, { shape: 'carp', body: '#f4c53c', belly: '#fff0a0', fin: '#e89a20', mark: 'scales' }, { rare: true, reward: 10000 });
  F('moonlight_trout', 'Moonlight Trout', 'fresh', 2, 40, 70, 3000, null, { shape: 'trout', body: '#c8d0f0', belly: '#ffffff', fin: '#8890d8', mark: 'stars' }, { rare: true, reward: 15000 });
  F('pearl_flounder', 'Pearl Flounder', 'salt', 2, 40, 70, 3000, null, { shape: 'flat', body: '#f0e8f0', belly: '#ffffff', fin: '#d0b8e0', mark: 'pearls' }, { rare: true, reward: 15000 });
  F('rainbow_tuna', 'Rainbow Tuna', 'salt', 3, 150, 280, 3000, null, { shape: 'tuna', body: '#e05a80', belly: '#f0f0ff', fin: '#5ad0a0', mark: 'rainbow' }, { rare: true, reward: 25000 });

  NP.data.fishRareChance = 1 / 500;
  if (NP.art && NP.art.icons && NP.art.icons._fishIcons) NP.art.icons._fishIcons();   // src/art/icons/items-fish.js

  // ------------------------------------------------------------------------------------------ items
  const it = (NP.data.items = NP.data.items || {});
  function I(id, name, pocket, price, desc, use, x) {
    NP.reg(it, id, Object.assign({ name, pocket, price, desc, use: use || null, inBattle: false, inField: false }, x || {}));
  }
  const F_ = { inField: true }, BF = { inBattle: true, inField: true };
  I('old_rod', 'Old Rod', 'key', 0, 'Gus\'s old rod. Face any water and use it to fish. You can also press Select.', { rod: 1 }, F_);
  I('good_rod', 'Good Rod', 'key', 0, 'A sturdy rod with a proper reel. Bigger fish and rarer Kigu bite on it.', { rod: 2 }, F_);
  I('super_rod', 'Super Rod', 'key', 0, 'The best rod there is. The biggest fish in Tsumugi bite on this.', { rod: 3 }, F_);
  I('fishing_log', 'Fishing Log', 'key', 0, 'Records every fish you reel in: how many, your biggest, and where you first landed it.', { fishlog: true }, F_);
  I('gold_scale', 'Gold Scale', 'items', 0, 'Held: a scale from the first Ryukoi. Gilfin evolves holding it at Lv30. Others get more critical hits with Tide moves.', null, {
    held: {
      onSwitchIn(c) { c.battle.msg(c.holder.label() + ' is inspired by the scale she\'s holding!'); },
      modCritStage(c, n) { return c.move && c.move.type === 'tide' ? n + 1 : undefined; },
    },
  });
  I('delicate_teacup', 'Delicate Teacup', 'items', 0, 'Held: a paper-thin teacup. A certain drifting seahorse Kigu loves it.');

  // ---- dishes: the Tea House cooks make these from a fish. `meal` boosts last until the start of her next battle.
  I('grilled_minnow', 'Grilled Minnow', 'items', 30, 'A little fish grilled on a stick. Restores 20 HP.', { hp: 20 }, BF);
  I('lake_fry', 'Lake Fish Fry', 'items', 50, 'Crispy pan-fried lake fish. Restores 40 HP.', { hp: 40 }, BF);
  I('sardine_skewer', 'Sardine Skewer', 'items', 60, 'Salty grilled sardines. Restores 30 HP and cures poison.', { hp: 30, cure: ['psn', 'tox'] }, BF);
  I('trout_supper', 'Trout Supper', 'items', 120, 'Trout baked with herbs. Restores 60 HP.', { hp: 60 }, BF);
  I('mackerel_onigiri', 'Mackerel Rice Ball', 'items', 100, 'Restores 50 HP. She\'ll start her next battle with +1 Attack.', { hp: 50, meal: { atk: 1 } }, F_);
  I('bass_stew', 'Bass Stew', 'items', 160, 'A hearty stew. Restores 80 HP and wakes a sleepy Kigu.', { hp: 80, cure: ['slp'] }, BF);
  I('squid_skewer', 'Squid Skewer', 'items', 100, 'Chewy and smoky. Restores 40 HP and cures paralysis.', { hp: 40, cure: ['par'] }, BF);
  I('bream_feast', 'Sea Bream Feast', 'items', 200, 'Restores 100 HP. She\'ll start her next battle with +1 Speed.', { hp: 100, meal: { spe: 1 } }, F_);
  I('river_roast', 'River Roast', 'items', 300, 'A whole fish roasted by the fire. Restores 120 HP. She\'ll start her next battle with +1 Defence.', { hp: 120, meal: { def: 1 } }, F_);
  I('tuna_steak', 'Tuna Steak', 'items', 450, 'Restores all HP. She\'ll start her next battle with +1 Attack and +1 Defence.', { hpPct: 1, meal: { atk: 1, def: 1 } }, F_);
})(typeof globalThis !== 'undefined' ? globalThis : window);
