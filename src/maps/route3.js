/* Route 3 — Seam Road: Hemline -> Seamstead City. Wide, sunny, busy with delivery carts; first Volt Kigu. Levels 13-17. */
(function (root) {
  'use strict';
  const NP = root.NP, L = NP.levels;
  const W = 32, H = 22;

  const M = L.map({
    id: 'route3', name: 'Route 3  Seam Road', music: 'route_meadow', battleBg: 'grass', border: 'treeline', w: W, h: H,
    view: 'street',   // 3D camera preset (street | town | flat-ish), see src/engine/persp.js
    legend: { '.': 'grass', T: 'treeline', c: 'cobble', ',': 'tallgrass', f: 'flowers', F: 'fence', p: 'path' },
    camera: 1,   // 3D view looks east along the seam road
  });
  M.rect(0, 0, W, 2, 'T').rect(0, 20, W, 2, 'T').rect(0, 2, 2, 18, 'T').rect(W - 2, 2, 2, 18, 'T');
  M.rect(0, 10, W, 2, 'c');                                  // the seam road itself
  M.rect(4, 4, 7, 4, ',').rect(13, 14, 8, 4, ',').rect(22, 3, 6, 4, ',').rect(3, 14, 6, 3, ',');
  M.rect(11, 8, 2, 1, 'f').rect(24, 13, 4, 1, 'f').rect(16, 6, 3, 1, 'f');
  // the seam road is fenced from x12 east (the meadows open only at the Hemline end), so the walk to Seamstead passes every
  // trainer's line of sight (owner's rule: no skipping); the gaps under the four trainers, the tea stand and the sign stay grass
  M.rect(12, 9, 18, 1, 'F').rect(12, 12, 18, 1, 'F');
  for (const [x, y] of [[13, 9], [18, 12], [25, 9], [27, 12], [15, 12], [28, 9]]) M.rect(x, y, 1, 1, '.');
  M.sign(3, 9, 'ROUTE 3  Seam Road\\nWest: Hemline\\nEast: Seamstead City', 'west sign');
  M.sign(28, 9, 'SEAMSTEAD CITY\\nThe city that never stops sewing.', 'east sign');
  M.trees([[2, 3], [12, 5], [20, 5], [29, 4], [10, 15], [22, 15], [29, 15], [6, 18], [16, 18], [26, 18]]);
  // a bench in the meadow behind the fence (it used to sit in a gap in the fence, half on the road)
  M.stamp('bench', 17, 7).stamp('barrel', 8, 8).stamp('crate', 7, 8).stamp('bush', 12, 13);
  M.spawn('west', 2, 10, 'right').spawn('east', 29, 11, 'left');
  M.edge('w', 10, 11, 'hemline', 'east').edge('e', 10, 11, 'seamstead', 'west');

  M.enc('grass', [['scurrent|kittabra', 13, 15, 25], ['kumi|nibblit', 13, 15, 20], ['chirpadee', 14, 16, 20], ['kittabra', 14, 16, 20], ['scurrent|kittabra', 15, 17, 10]]);

  M.trainer('r3_t1', 13, 9, 'schoolgirl', 'down', { cls: 'Student', name: 'Bea', sight: 2, reward: 8, ai: 1, team: [['kittabra', 14], ['chirpadee', 14]],
    intro: 'Pattern drafting class! Our teacher said to test everything, so let\'s battle!', win: 'That wasn\'t on the syllabus!', after: 'Seamstead has a whole street just for fabric. I mean a whole street!' });
  M.trainer('r3_t2', 18, 12, 'camper', 'up', { cls: 'Hiker', name: 'Rolf', sight: 2, reward: 9, ai: 1, team: [['kumi|nibblit', 15], ['kumi|nibblit', 15]],
    intro: 'I walked from Hemline in a straight line. Mostly straight!', win: 'Huh. I walked here straight and lost crooked.', after: 'The road only bends once. I counted.' });
  M.trainer('r3_t3', 25, 9, 'rocker', 'down', { cls: 'Busker', name: 'Jax', sight: 2, reward: 10, ai: 1, team: [['scurrent|kittabra', 16], ['scurrent|kittabra', 16]],
    intro: 'Seamstead rocks and so do I! Check my amp... oh, it\'s a sewing machine.', win: 'My ears are still ringing! Nice one.', after: 'Zip taught me that tune. Zip teaches everyone that tune.' });
  M.trainer('r3_t4', 27, 12, 'pleat', 'up', { cls: 'Presser', name: 'Hem', sight: 2, reward: 10, ai: 1, music: 'battle_society', team: [['kittabra', 15], ['silkie', 16]],
    intro: 'Seam Road rules: no dawdling, no wrinkles, and no unauthorised skipping.', win: 'Skipping is... apparently unregulated. I\'ll make a note of that.', after: 'I shall report that the road is satisfactory. ...Barely.' });

  M.npc('baker', 24, 16, 'grunt_f', 'left', ['I always wanted to be a baker. Warm bread on a cold morning, you know?\\pBut the Society told me it does more good than any bakery could.\\pMadame Damask never raises her voice. She never has to.\\pEveryone just gets... smoother.']);
  M.npc('rest', 15, 12, 'cook', 'down', null, { script: 'restfree', note: 'free tea stand' });
  // the button carter rests by his load at the Hemline end, off the road
  M.npc('cart', 9, 8, 'villager_m2', 'down', ['This cart\'s full of buttons for Seamstead!\\pThe city eats three thousand buttons a day, and I\'ve no idea where they all go.']);
  M.pickup('cake', 27, 6, 'fancy_cake', 1);
  M.pickup('spool', 5, 17, 'bond_spool', 3);
  M.hidden('stump', 20, 6, 'wish_candy', 1, 'hidden candy');
  M.reg();
})(typeof globalThis !== 'undefined' ? globalThis : window);
