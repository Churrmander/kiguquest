/* Ribbon Loop — the scenic way from Basting Green round to Thimble Village's east gate while the Tidy Day parade holds the main road
 * (padding beat 4). Four friendly Tailors, a wild Silkie snacking on leaves by the hay, and a few things to find. The loop itself is the
 * walk: east along the bottom, north up the side, west along the top into Thimble. */
(function (root) {
  'use strict';
  const NP = root.NP, K = NP.mapkit;
  const team = (list) => list.map(([sp, lv]) => ({ sp, lv }));

  // ---- the snacking Silkie: a one-off chance to meet her by the hay (optional, once)
  function* silkie(c) {
    if (c.flag('rl_silkie')) { yield* c.sayT('ribbon_loop.hay.after', 'A few nibbled leaves by the hay. Someone had a lovely lunch here.'); return; }
    yield* c.sayT('ribbon_loop.hay.1', 'A wild Silkie is happily munching leaves beside the hay.\\pShe hums a little between bites.');
    if (!(yield* c.ask('Say hello to the Silkie?'))) return;
    c.set('rl_silkie');
    yield* c.wildBattle('silkie', 5);
  }

  const W = 30, H = 26;
  const g = K.grid(W, H, 'T');
  K.path(g, [[2, 20], [24, 20], [24, 4], [2, 4]], 2, 'p');      // the loop
  K.rect(g, 0, 20, 2, 2, 'p'); K.rect(g, 0, 4, 2, 2, 'p');      // west ends: Basting Green (bottom) and Thimble (top)
  K.rect(g, 4, 22, 20, 2, '.'); K.rect(g, 26, 6, 2, 14, '.'); K.rect(g, 4, 2, 20, 2, '.');   // verges outside the lanes
  K.rect(g, 4, 7, 19, 12, '.');                                // the meadow inside the loop
  K.rect(g, 6, 8, 6, 4, ','); K.rect(g, 14, 14, 8, 4, ','); K.rect(g, 6, 15, 5, 3, ','); K.rect(g, 26, 10, 2, 6, ',');
  K.rect(g, 16, 8, 5, 3, 'w');                                  // pond
  K.rect(g, 4, 2, 4, 2, ',');                                   // the Silkie's pocket at the top-left corner
  K.rect(g, 4, 6, 19, 1, 'T'); K.rect(g, 4, 19, 19, 1, 'T');    // hedges keep the meadow a meadow: in and out by its gaps
  K.rect(g, 12, 6, 2, 1, '.'); K.rect(g, 4, 19, 2, 1, '.'); K.rect(g, 22, 12, 2, 2, '.');
  K.rect(g, 8, 23, 3, 1, 'f'); K.rect(g, 18, 22, 4, 1, 'f');

  K.reg({
    id: 'ribbon_loop', name: 'Ribbon Loop', music: 'route_meadow', battleBg: 'grass', border: 'treeline',
    view: 'street',
    legend: { '.': 'grass', T: 'treeline', p: 'path', ',': 'tallgrass', f: 'flowers', w: 'water' },
    rows: K.rows(g),
    stamps: [
      { id: 'sign', x: 4, y: 22 }, { id: 'sign', x: 8, y: 3 }, { id: 'haystack', x: 5, y: 2 },
      { id: 'tree', x: 12, y: 16 }, { id: 'tree', x: 8, y: 13 }, { id: 'tree', x: 27, y: 7 }, { id: 'tree', x: 13, y: 22 },
      { id: 'bench', x: 21, y: 23 }, { id: 'stump', x: 27, y: 18 }, { id: 'rock', x: 14, y: 9 }, { id: 'bush', x: 4, y: 12 },
      { id: 'flowerbed', x: 19, y: 3 },
    ],
    interact: [
      { x: 4, y: 22, say: 'RIBBON LOOP\\nThe long way round to Thimble Village.' },
      { x: 8, y: 3, say: 'RIBBON LOOP\\nWest: Thimble  South: Basting Green' },
      { x: 5, y: 2, script: silkie }, { x: 6, y: 2, script: silkie }, { x: 5, y: 3, script: silkie }, { x: 6, y: 3, script: silkie },
    ],
    spawns: { west: { x: 2, y: 20, dir: 'right' }, north: { x: 2, y: 4, dir: 'right' } },
    warps: [
      { x: 0, ys: [20, 21], to: 'basting_green', spawn: 'east', sound: 'none' },
      { x: 0, ys: [4, 5], to: 'thimble', spawn: 'east', sound: 'none' },
    ],
    encounters: {
      grass: [
        { sp: 'peepi', min: 3, max: 5, w: 25 }, { sp: 'nibbi', min: 3, max: 5, w: 25 },
        { sp: 'mittsy', min: 4, max: 5, w: 25 }, { sp: 'silkie', min: 4, max: 5, w: 25 },
      ],
    },
    props: [
      { id: 'rl_cake', x: 27, y: 19, icon: 'item:fancy_cake', hideIf: 'rl_cake', script: function* (c) { c.set('rl_cake'); yield* c.giveItem('fancy_cake', 1, { found: true }); } },
      { id: 'rl_spool', x: 9, y: 17, icon: 'item:bond_spool', hideIf: 'rl_spool', script: function* (c) { c.set('rl_spool'); yield* c.giveItem('bond_spool', 2, { found: true }); } },
      { id: 'rl_balm', x: 22, y: 2, icon: 'item:aloe_balm', hideIf: 'rl_balm', script: function* (c) { c.set('rl_balm'); yield* c.giveItem('aloe_balm', 1, { found: true }); } },
    ],
    npcs: [
      { id: 'tam', x: 9, y: 22, look: 'hiker', dir: 'up',
        trainer: { cls: 'Hiker', name: 'Tam', sight: 2, reward: 6, ai: 0, team: team([['nibbi', 4], ['nibbi', 5]]),
          intro: 'Taking the long way round? Me too! Every year. Battle while we walk?', win: 'Ha! You walk faster than I do, too.', after: 'The parade will be gone by tomorrow. The loop is here every day.' } },
      { id: 'pim', x: 17, y: 22, look: 'picnicker', dir: 'up',
        trainer: { cls: 'Picnicker', name: 'Pim', sight: 2, reward: 6, ai: 0, team: team([['peepi', 5], ['mittsy', 4]]),
          intro: 'I set my picnic up right where the parade would see it.\\pThey folded my blanket. Let me battle the grump out!', win: 'Much better! I feel nicely crumpled again.', after: 'Have a sandwich crust. ...No? More for Peepi.' } },
      { id: 'oki', x: 26, y: 12, look: 'sailor', dir: 'left',
        trainer: { cls: 'Sailor', name: 'Oki', sight: 2, reward: 7, ai: 1, team: team([['ribbi', 6]]),
          intro: 'Ahoy! My ship is in Seamstead, but my heart is in this pond.\\pShow me your sea legs!', win: 'Sunk! You sail a fine battle, matey.', after: 'Ribbi loves this pond. She says hello. Ribbit.' } },
      { id: 'rio', x: 14, y: 3, look: 'net_kid', dir: 'down',
        trainer: { cls: 'Net Kid', name: 'Rio', sight: 2, reward: 5, ai: 0, team: team([['silkie', 4], ['mittsy', 5]]),
          intro: 'I came all this way to befriend the leaf-munching Silkie.\\pShe will not stop eating. Battle me while I wait!', win: 'Even my Mittsy wants a snack now.', after: 'The Silkie snacks by the hay at the corner. She loves leaves.' } },
      { id: 'rl_gran', x: 23, y: 22, look: 'elder_m', dir: 'left',
        say: ['I walk Ribbon Loop every morning. Round and round.\\pThe parade folds the main road. Nobody can fold a loop!'] },
    ],
  });
})(typeof globalThis !== 'undefined' ? globalThis : window);
