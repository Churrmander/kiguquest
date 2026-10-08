/* Route 3 — Seam Road: Hemline -> Seamstead City. Wide, sunny, busy with delivery carts; first Volt Kigu. Levels 13-17. */
(function (root) {
  'use strict';
  const NP = root.NP, L = NP.levels;
  const W = 32, H = 22;

  const M = L.map({
    id: 'route3', name: 'Route 3  Seam Road', music: 'route_meadow', battleBg: 'grass', border: 'treeline', w: W, h: H,
    legend: { '.': 'grass', T: 'treeline', c: 'cobble', ',': 'tallgrass', f: 'flowers', F: 'fence', p: 'path' },
    camera: 1,   // 3D view looks east along the seam road
  });
  M.rect(0, 0, W, 2, 'T').rect(0, 20, W, 2, 'T').rect(0, 2, 2, 18, 'T').rect(W - 2, 2, 2, 18, 'T');
  M.rect(0, 10, W, 2, 'c');                                  // the seam road itself
  M.rect(4, 4, 7, 4, ',').rect(13, 14, 8, 4, ',').rect(22, 3, 6, 4, ',').rect(3, 14, 6, 3, ',');
  M.rect(11, 8, 2, 1, 'f').rect(24, 13, 4, 1, 'f').rect(16, 6, 3, 1, 'f');
  M.rect(14, 3, 6, 1, 'F');
  M.sign(3, 9, 'ROUTE 3  Seam Road\\nWest: Hemline\\nEast: Seamstead City', 'west sign');
  M.sign(28, 9, 'SEAMSTEAD CITY\\nThe city that never stops sewing.', 'east sign');
  M.trees([[2, 3], [12, 5], [20, 5], [29, 4], [10, 15], [22, 15], [29, 15], [6, 18], [16, 18], [26, 18]]);
  M.stamp('bench', 18, 9).stamp('barrel', 8, 8).stamp('crate', 24, 8).stamp('bush', 12, 13);
  M.spawn('west', 2, 10, 'right').spawn('east', 29, 11, 'left');
  M.edge('w', 10, 11, 'hemline', 'east').edge('e', 10, 11, 'seamstead', 'west');

  M.enc('grass', [['sparkin|mittsy', 13, 15, 25], ['kumi|nibbi', 13, 15, 20], ['peepi', 14, 16, 20], ['mittsy', 14, 16, 20], ['sparkin|mittsy', 15, 17, 10]]);

  M.trainer('r3_t1', 9, 6, 'schoolgirl', 'down', { cls: 'Student', name: 'Bea', sight: 3, reward: 8, ai: 1, team: [['mittsy', 14], ['peepi', 14]],
    intro: 'Pattern drafting class! Our teacher said to test everything. So: battle!', win: 'That was not on the syllabus.', after: 'Seamstead has a whole street for fabric. Whole. Street.' });
  M.trainer('r3_t2', 18, 15, 'camper', 'left', { cls: 'Hiker', name: 'Rolf', sight: 4, reward: 9, ai: 1, team: [['kumi|nibbi', 15], ['kumi|nibbi', 15]],
    intro: 'I walked from Hemline in a straight line. Mostly straight!', win: 'Crooked. I lost crooked.', after: 'The road bends once. Just once. I counted.' });
  M.trainer('r3_t3', 25, 5, 'rocker', 'down', { cls: 'Busker', name: 'Jax', sight: 3, reward: 10, ai: 1, team: [['sparkin|mittsy', 16], ['sparkin|mittsy', 16]],
    intro: 'Seamstead rocks and so do I! Check my amp... oh, it is a sewing machine.', win: 'My ears are still ringing. Nice.', after: 'Zip taught me that tune. Zip teaches everyone that tune.' });
  M.trainer('r3_t4', 6, 12, 'pleat', 'right', { cls: 'Presser', name: 'Hem', sight: 3, reward: 10, ai: 1, music: 'battle_society', team: [['mittsy', 15], ['silkie', 16]],
    intro: 'Seam road regulation: no dawdling, no wrinkles, no unauthorised skipping.', win: 'Skipping is... apparently unregulated. Noted.', after: 'I shall report the road is satisfactory. Barely.' });

  M.npc('baker', 24, 16, 'grunt_f', 'left', ['I wanted to be a baker. Warm bread, cold mornings.\\pThe Society says it is kinder than any bakery.\\pMadame Damask never raises her voice.\\pShe never has to. Everyone just gets... smoother.']);
  M.npc('rest', 15, 12, 'cook', 'down', null, { script: 'restfree', note: 'free tea stand' });
  M.npc('cart', 22, 11, 'villager_m2', 'left', ['This cart is full of buttons for Seamstead!\\pThe city eats three thousand buttons a day.\\pI do not know where they go.']);
  M.pickup('cake', 27, 6, 'fancy_cake', 1);
  M.pickup('spool', 5, 17, 'bond_spool', 3);
  M.hidden('stump', 20, 6, 'wish_candy', 1, 'hidden candy');
  M.reg();
})(typeof globalThis !== 'undefined' ? globalThis : window);
