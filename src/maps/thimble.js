/* Thimble Village + Tea House, General Store and Salon #1 (Master Poppy, Fluff). */
(function (root) {
  'use strict';
  const NP = root.NP, K = NP.mapkit;
  const team = (list) => list.map(([sp, lv]) => ({ sp, lv }));

  const W = 26, H = 22;
  const g = K.grid(W, H, '.');
  K.rect(g, 0, 0, 2, H, 'T'); K.rect(g, W - 2, 0, 2, H, 'T'); K.rect(g, 0, 0, W, 2, 'T');
  K.rect(g, 0, 20, 10, 2, 'T'); K.rect(g, 16, 20, 10, 2, 'T');
  K.rect(g, 12, 6, 2, 16, 'c');                      // main road
  K.rect(g, 3, 7, 21, 2, 'c');                       // cross street
  K.rect(g, 22, 0, 2, 9, 'p');                       // closed road to Route 2
  K.rect(g, 3, 15, 6, 1, 'c'); K.rect(g, 17, 16, 7, 1, 'c');
  K.rect(g, 10, 10, 2, 2, 'c'); K.rect(g, 14, 10, 2, 2, 'c');
  K.rect(g, 3, 17, 4, 2, 'f'); K.rect(g, 19, 18, 4, 2, 'f'); K.rect(g, 8, 13, 3, 1, 'f');
  K.rect(g, 15, 13, 1, 4, 'F');

  K.reg({
    id: 'thimble', name: 'Thimble Village', music: 'town_thimble', battleBg: 'grass', border: 'treeline',
    legend: { '.': 'grass', T: 'treeline', c: 'cobble', p: 'path', f: 'flowers', F: 'fence' },
    rows: K.rows(g),
    stamps: [
      { id: 'tea_house', x: 3, y: 3, name: 'tea', to: 'tea_house' },
      { id: 'salon', x: 9, y: 2, variant: 'fluff', name: 'salon', to: 'salon' },
      { id: 'general_store', x: 17, y: 3, name: 'store', to: 'general_store' },
      { id: 'house_s', x: 3, y: 12, variant: 'yellow', name: 'house1', to: 'thimble_house1' },
      { id: 'house_m', x: 18, y: 12, variant: 'pink', name: 'house2', to: 'thimble_house2' },
      { id: 'sign', x: 11, y: 9, name: 'sign_v' }, { id: 'sign', x: 21, y: 4 },
      { id: 'lamp', x: 11, y: 7 }, { id: 'lamp', x: 15, y: 7 }, { id: 'well', x: 6, y: 9 }, { id: 'bench', x: 17, y: 9 },
      { id: 'cloth_line', x: 7, y: 13 }, { id: 'tree', x: 2, y: 10 }, { id: 'tree', x: 8, y: 18 }, { id: 'tree', x: 16, y: 18 }, { id: 'tree', x: 24, y: 10 },
      { id: 'flowerbed', x: 20, y: 9 }, { id: 'barrel', x: 8, y: 6 }, { id: 'crate', x: 16, y: 6 }, { id: 'windmill', x: 2, y: 16 },
    ],
    interact: [
      { x: 11, y: 9, say: 'THIMBLE VILLAGE\\nWhere every stitch counts.' },
      { x: 21, y: 4, say: 'ROUTE 2  Closed\\nThe bridge is being mended. Please wait.' },
    ],
    spawns: { south: { x: 12, y: 19, dir: 'up' } },
    warps: [{ xs: [12, 13], y: 21, to: 'route1', spawn: 'north', sound: 'none' }],
    npcs: [
      { id: 'guard1', x: 22, y: 3, look: 'villager_m2', dir: 'down', say: ['Sorry, Route 2 is closed while the crews mend the bridge.\\pCome back once you have a Button from the Salon. The word is they reopen it for Tailors.'] },
      { id: 'guard2', x: 23, y: 3, look: 'villager_m2', dir: 'down', say: ['The bridge planks are all in the wash... I mean, in repair.'] },
      { id: 'vf', x: 9, y: 11, look: 'villager_f2', dir: 'down', move: 'wander', range: 2, say: ['Master Poppy sews her Fluff Kigu tiny cardigans.\\pIt is too cute to battle against!'] },
      { id: 'kidf', x: 14, y: 12, look: 'child_f', dir: 'left', move: 'turn', say: ['If your Kigu is sleepy, the Tea House will fix her right up!'] },
      { id: 'eldm', x: 7, y: 11, look: 'elder_m', dir: 'right', say: ['This well has been here since the first seam was sewn.\\pThe water tastes like tea already.'] },
      { id: 'mimi', x: 13, y: 18, look: 'mimi', dir: 'up',
        script: function* (c) {
          if (!c.flag('mimi_gift')) {
            c.set('mimi_gift');
            yield* c.say('Mimi: Oh, {player}! You got your Kigu! Yay!\\pI found this spare Silk Spool on the way over. Here, you have it!');
            yield* c.giveItem('silk_spool', 1);
            yield* c.say('Mimi: Try to befriend something cute on Meadow Lane. I am rooting for you!');
          } else yield* c.say('Mimi: Good luck at the Salon! Poppy is super nice, but her Kigu are tough.');
        } },
    ],
  });

  // ------------------------------------------------------------------------------------ Tea House
  K.room({
    id: 'tea_house', name: 'Tea House', w: 11, h: 9, doorX: 4, floor: 'floor_wood', wall: 'wall_wood', music: 'tea_house', exit: { to: 'thimble', door: 'tea' },
    carpet: [3, 3, 4, 1], carpetTerrain: 'carpet_red',
    stamps: [
      { id: 'tea_healer', x: 4, y: 3 }, { id: 'pc_terminal', x: 9, y: 2 }, { id: 'table_s', x: 6, y: 5 }, { id: 'chair', x: 6, y: 6 },
      { id: 'window', x: 2, y: 1 }, { id: 'window', x: 7, y: 1 }, { id: 'plant', x: 1, y: 3 }, { id: 'plant', x: 9, y: 6 },
    ],
    interact: [
      { x: 4, y: 3, script: 'tea' }, { x: 5, y: 3, script: 'tea' }, { x: 9, y: 3, script: 'pc' },
    ],
    npcs: [
      { id: 'maid', x: 4, y: 2, look: 'tea_maid', dir: 'down', script: 'tea' },
      { id: 'tea_guest', x: 7, y: 6, look: 'lady', dir: 'left', say: ['The cocoa here is the best in Tsumugi.\\pI only wish Kigu could try the macarons too.'] },
    ],
  });

  // ---------------------------------------------------------------------------------- General Store
  const STOCK = ['bond_spool', 'snack_cake', 'fancy_cake', 'aloe_balm', 'mint_tea', 'wake_bell', 'numb_away', 'scent_spray'];
  K.room({
    id: 'general_store', name: 'General Store', w: 10, h: 8, doorX: 4, floor: 'floor_tile', wall: 'wall_plaster', exit: { to: 'thimble', door: 'store' },
    stamps: [
      { id: 'counter_l', x: 3, y: 3 }, { id: 'counter_m', x: 4, y: 3 }, { id: 'counter_r', x: 5, y: 3 },
      { id: 'shop_shelf', x: 1, y: 2 }, { id: 'shop_shelf', x: 2, y: 2 }, { id: 'shop_shelf', x: 7, y: 2 }, { id: 'shop_shelf', x: 8, y: 2 },
      { id: 'plant', x: 8, y: 5 },
    ],
    interact: [
      { x: 3, y: 3, script: 'shop' }, { x: 4, y: 3, script: 'shop' }, { x: 5, y: 3, script: 'shop' },
    ],
    shopStock: STOCK,
    npcs: [
      { id: 'clerk', x: 4, y: 2, look: 'shopkeeper', dir: 'down', script: 'shop' },
      { id: 'shopper', x: 7, y: 5, look: 'villager_f1', dir: 'left', say: ['Bond Spools sell out fast before festival season.\\pStock up if you plan to befriend anyone new!'] },
    ],
  });

  // --------------------------------------------------------------------------------------- Salon
  K.room({
    id: 'salon', name: 'Thimble Salon', w: 10, h: 12, doorX: 4, floor: 'floor_wood', wall: 'wall_plaster', music: 'town_thimble', battleBg: 'indoor',
    exit: { to: 'thimble', door: 'salon' },
    carpet: [4, 2, 2, 9], carpetTerrain: 'carpet_red',
    stamps: [
      { id: 'mannequin', x: 1, y: 2 }, { id: 'mannequin', x: 8, y: 2 }, { id: 'cloth_shelf', x: 1, y: 0 }, { id: 'cloth_shelf', x: 7, y: 0 },
      { id: 'sewing_machine', x: 1, y: 6 }, { id: 'sewing_machine', x: 8, y: 6 }, { id: 'window', x: 4, y: 1 }, { id: 'window', x: 5, y: 1 },
    ],
    npcs: [
      { id: 'poppy', x: 4, y: 3, look: 'poppy', dir: 'down', script: 'poppy' },
      { id: 'salon_t1', x: 5, y: 9, look: 'tailor_m', dir: 'left',
        trainer: { cls: 'Tailor', name: 'Ren', sight: 3, reward: 7, ai: 1, team: team([['nibbi', 5], ['mittsy', 5]]),
          intro: 'Poppy teaches us that every stitch counts. Show me yours!', win: 'Such neat work!', after: 'Poppy is at the back. Do not underestimate her Kigu.' } },
      { id: 'salon_t2', x: 4, y: 6, look: 'tailor_f', dir: 'right',
        trainer: { cls: 'Tailor', name: 'Noa', sight: 3, reward: 8, ai: 1, team: team([['peepi', 6], ['nibbi', 6]]),
          intro: 'Halt! Nobody reaches Poppy without sewing a line past me.', win: 'You threaded that one perfectly...', after: 'Go on, Poppy is waiting.' } },
    ],
  });
  NP.maps.salon.poppyTeam = team([['nibbi', 7], ['peepi', 8], ['mittsy', 9]]);

  // -------------------------------------------------------------------------------------- houses
  K.room({
    id: 'thimble_house1', name: 'House', w: 8, h: 7, doorX: 3, exit: { to: 'thimble', door: 'house1' },
    stamps: [{ id: 'bed', x: 6, y: 2 }, { id: 'tv', x: 1, y: 2 }, { id: 'rug_b', x: 3, y: 3 }],
    npcs: [{ id: 'h1', x: 3, y: 2, look: 'villager_f1', dir: 'down', say: ['My daughter has a Sprubun. The sprout on her head wilts when she skips breakfast!'] }],
  });
  K.room({
    id: 'thimble_house2', name: 'House', w: 9, h: 8, doorX: 3, exit: { to: 'thimble', door: 'house2' },
    stamps: [{ id: 'bookshelf', x: 1, y: 0 }, { id: 'table_l', x: 4, y: 3 }, { id: 'fridge', x: 7, y: 1 }],
    npcs: [{ id: 'h2', x: 2, y: 4, look: 'elder_f', dir: 'right', say: ['I sewed the flags for the Tea House myself.\\pThe heart one took three whole weekends.'] }],
  });
})(typeof globalThis !== 'undefined' ? globalThis : window);
