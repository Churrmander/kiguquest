/* Route 5 — the Pylon Road: the top of the Dust Bowl -> Shibuyarn. The desert gives way to scrub and then meadow as the road climbs
 * north beside a line of humming power pylons. Levels 27-30. First wild Coili and Glowli (Glowli mostly at the far end, near the city).
 * Story: a Presser is unspooling cable along the pylons "for maintenance" (it runs north to the city, and down into the cellar under
 * the station: the hook for the Spark Cellar). Five Tailors, the twins as two battles side by side. */
(function (root) {
  'use strict';
  const NP = root.NP, L = NP.levels;
  const W = 26, H = 50;

  const M = L.map({
    id: 'route5', name: 'Route 5  Pylon Road', music: 'route_meadow', battleBg: 'grass', border: 'treeline', w: W, h: H, view: 'street',
    legend: { '.': 'grass', T: 'treeline', ',': 'tallgrass', ';': 'dry_grass', s: 'sand', u: 'dune', d: 'path', C: 'cliff', l: 'ledge_d', f: 'flowers', w: 'water' },
  });
  // ground: dune at the south end (rows 36+), a sand fringe, then meadow up to the city
  M.rect(0, 38, W, 12, 'u').rect(0, 36, W, 2, 's');
  M.rect(0, 0, 2, H, 'T').rect(W - 2, 0, 2, H, 'T').rect(0, 0, W, 2, 'T');
  M.rect(0, 38, 2, 12, 'C').rect(W - 2, 38, 2, 12, 'C').rect(0, H - 1, W, 1, 'C');
  M.rect(12, 0, 3, 2, '.').rect(12, H - 1, 3, 1, 'u');                        // the road in from the Dust Bowl and out to the city
  // the road: one dirt track up the middle, with a bend round the pond
  M.rect(12, 2, 3, 14, 'd').rect(8, 15, 7, 3, 'd').rect(8, 17, 3, 14, 'd').rect(8, 30, 7, 3, 'd').rect(12, 32, 3, 17, 'd');
  // a pond on the east side of the bend, and a ledge run that drops you back to the road from the west meadow
  M.blob(18, 23, 3.5, 2.5, 'w');
  M.rect(2, 12, 6, 1, 'l');
  // grass for encounters: dry grass in the scrub, tallgrass in the meadow
  M.rect(3, 40, 6, 5, ';').rect(17, 39, 5, 6, ';').rect(16, 33, 5, 3, ';');
  M.rect(3, 19, 4, 9, ',').rect(15, 8, 7, 5, ',').rect(2, 4, 6, 7, ',').rect(15, 27, 6, 3, ',');
  M.rect(19, 3, 3, 1, 'f').rect(3, 30, 2, 1, 'f');
  // the pylons: a line up the east side of the road, every eight rows or so
  for (const [x, y] of [[16, 44], [16, 36], [22, 30], [15, 19], [16, 5]]) M.stamp('pylon', x, y);
  M.trees([[22, 16], [2, 33], [21, 6], [5, 14], [21, 17]]);
  M.trees([[6, 46], [20, 47], [3, 37]], 'cactus');
  M.stamp('rock', 9, 42).stamp('boulder', 22, 36).stamp('bush', 6, 29).stamp('bush', 21, 13);
  M.stamp('cable_reel', 11, 26);
  M.sign(15, 47, 'ROUTE 5  Pylon Road\\nSouth: The Dust Bowl\\nNorth: Shibuyarn', 'south sign');
  M.sign(15, 3, 'SHIBUYARN, CITY OF LIGHTS\\n(Lights may vary.)', 'north sign');
  M.spawn('south', 13, 48, 'up').spawn('north', 13, 2, 'down');
  M.edge('s', 12, 14, 'dust_bowl', 'north').edge('n', 12, 14, 'shibuyarn', 'south');

  M.enc('grass', [['coili', 27, 29, 26], ['peepi', 26, 28, 18], ['sparkin|mittsy', 27, 29, 16], ['jerbi|nibbi', 26, 28, 14], ['glowli', 27, 29, 10], ['skorpi|peepi', 27, 28, 6], ['chippi|nibbi', 26, 28, 10]]);

  // ---- the five Tailors
  M.trainer('r5_t1', 11, 40, 'scientist', 'right', { cls: 'Scientist', name: 'Volta', sight: 3, reward: 15, ai: 2, team: [['coili', 27], ['sparkin|mittsy', 28]],
    intro: 'The pylons are humming in B flat today. Usually it\'s C. Something is pulling on the line, and I want to know what!', win: 'You\'re a lot more charged up than the pylons.', after: 'The hum drops every time the city browns out. I\'ve written it all down. Nobody has asked to read it.' });
  M.trainer('r5_t2', 7, 33, 'courier', 'down', { cls: 'Courier', name: 'Zed', sight: 4, reward: 14, ai: 1, team: [['jerbix|nibbi', 28], ['peepi', 27]],
    intro: 'I deliver parcels to Shibuyarn faster than anyone! I also battle faster than anyone. Ready? Too slow!', win: 'Okay, you were faster. Please don\'t tell my boss.', after: 'The city\'s lifts stop when the lights go out. I\'ve carried a fridge up nine floors. Twice.' });
  M.trainer('r5_t3', 7, 22, 'twins_a', 'right', { cls: 'Twins', name: 'Ami', sight: 3, reward: 12, ai: 1, team: [['glowli', 27], ['peepi', 27]],
    intro: 'Ami: We\'re twins! I\'m the one who battles first, and Yumi battles second. That\'s the rule.', win: 'Ami: Yumi, it\'s your turn! Get them!', after: 'Ami: We tried battling at the same time once. It got very confusing.' });
  M.trainer('r5_t4', 11, 22, 'twins_b', 'left', { cls: 'Twins', name: 'Yumi', sight: 3, reward: 12, ai: 1, team: [['coili', 27], ['mittsy', 28]],
    intro: 'Yumi: Ami lost, so now it\'s me. I\'m the one who wins! ...Usually.', win: 'Yumi: Hmm. We both lost. That\'s also twins, I suppose.', after: 'Yumi: Ami gets the top bunk because she\'s three minutes older. Three minutes!' });
  M.trainer('r5_t5', 15, 12, 'picnicker', 'down', { cls: 'Picnicker', name: 'Hana', sight: 3, reward: 13, ai: 1, team: [['peepi', 28], ['cactli|nibbi', 28], ['glowli', 29]],
    intro: 'I came up here for the view of the city lights, but they keep going out! I\'ll battle you while I wait.', win: 'Okay, you can have my view. It\'s mostly dark anyway.', after: 'When the city lights up at night, it looks like someone spilled a jewellery box. I\'ve only seen it once.' });
  M.trainer('r5_t6', 14, 26, 'grunt_m', 'up', { cls: 'Presser', name: 'Spool', sight: 3, reward: 15, ai: 2, music: 'battle_society', team: [['coili', 28], ['silkie', 28], ['chippi|nibbi', 29]],
    intro: 'This cable is for maintenance. It\'s very boring maintenance, so there\'s nothing to see here. Please stop looking at it.', win: 'Fine, look at the cable all you like. It\'s just a cable.', after: 'It runs to the city, then down under the station. Why does it go under the station? That\'s classified. Also I don\'t know.' });

  M.npc('lineman', 21, 31, 'hiker', 'left', ['These pylons carry the power to Shibuyarn, and the city uses every bit of it.\\pLately, someone has been tapping into the line before it gets there.']);
  M.pickup('volt', 21, 27, 'thread_ball', 1);
  M.pickup('cake', 3, 5, 'fancy_cake', 1);
  M.pickup('spool', 18, 41, 'silk_spool', 3);
  M.hidden('bush', 21, 13, 'wish_candy', 1, 'a Wish Candy in the bush by the meadow');
  M.reg();
})(typeof globalThis !== 'undefined' ? globalThis : window);
