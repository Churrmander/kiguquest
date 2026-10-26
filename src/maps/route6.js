/* Route 6 — the Windy Ridge: Shibuyarn -> Kite Hill. The road climbs out of the city along an open grassy ridge where the wind
 * never stops. Gust tiles (pale streaks) blow you along until you reach still ground, like slow ice: gentle, and a preview of
 * Dart's fan Salon. Levels 30-33. Wild Foldling and Whirligig, and Flumble in the rain. A hidden cave mouth behind the rocks on the
 * north side has a Batnap roosting in it.
 * Five Tailors. Signs for KITE HILL: "Hold on to your hat." */
(function (root) {
  'use strict';
  const NP = root.NP, L = NP.levels;
  const W = 50, H = 24;

  const M = L.map({
    id: 'route6', name: 'Route 6  Windy Ridge', music: 'route_meadow', battleBg: 'grass', border: 'treeline', w: W, h: H, view: 'street', camera: 1,
    weather: { rain: 25 },
    legend: { '.': 'grass', T: 'treeline', ',': 'tallgrass', d: 'path', C: 'cliff_grass', l: 'ledge_d', f: 'flowers', n: 'gust_n', s: 'gust_s', e: 'gust_e', w: 'gust_w' },
  });
  M.rect(0, 0, W, 2, 'T').rect(0, H - 2, W, 2, 'T').rect(0, 0, 2, H, 'T').rect(W - 2, 0, 2, H, 'T');
  M.rect(0, 11, 2, 3, 'd').rect(W - 2, 11, 2, 3, '.');                        // the road in from the city and out to Kite Hill
  // cliffs along the ridge's north and south shoulders
  M.rect(2, 2, 12, 3, 'C').rect(30, 2, 18, 2, 'C').rect(2, 19, 20, 3, 'C').rect(34, 19, 14, 3, 'C');
  // the road: a dirt track along the spine of the ridge
  // break up the shoulders' straight edges: a few bulges and bites
  M.rect(33, 4, 4, 1, 'C').rect(41, 3, 3, 1, '.').rect(6, 18, 5, 1, 'C').rect(16, 19, 3, 1, '.').rect(40, 18, 4, 1, 'C');
  M.rect(2, 11, W - 4, 3, 'd');
  // gusts: a band blowing south across the open top (step in from the north, and it carries you down to the road),
  // and another blowing north on the lower slope (it lifts you back up); a cross-wind blowing east at the far end
  M.rect(15, 5, 10, 4, 's').rect(28, 15, 8, 3, 'n').rect(41, 6, 4, 4, 'e');
  // grass for encounters
  M.rect(3, 6, 6, 4, ',').rect(31, 18, 3, 1, ',').rect(42, 15, 4, 3, ',').rect(15, 15, 6, 3, ',').rect(30, 5, 6, 3, ',');
  M.rect(5, 15, 3, 1, 'f').rect(45, 6, 3, 1, 'f');
  // the hidden cave mouth on the north shoulder, tucked behind boulders
  M.building('cave_mouth', 6, 2, null, 'cave', 'ridge_cave', { toDoor: null, note: 'hidden cave (Batnap)' });
  M.rect(6, 2, 3, 2, '.').rect(7, 4, 1, 2, 'd');
  M.stamp('boulder', 5, 5).stamp('boulder', 8, 6);
  M.stamp('windsock', 14, 10).stamp('windsock', 36, 10).stamp('windsock', 46, 14);
  M.trees([[3, 16], [14, 17], [21, 15], [45, 17], [17, 2]]);
  M.stamp('rock', 13, 8).stamp('boulder', 19, 9);
  // a lookout halfway along: a bench, a bed of flowers and a wind-bent tree
  M.rect(29, 9, 5, 1, 'f').stamp('bench', 31, 10);
  M.trees([[34, 9]]);
  M.stamp('rock', 23, 10).stamp('bush', 32, 14).stamp('bush', 12, 14);
  M.sign(4, 10, 'ROUTE 6  Windy Ridge\\nWest: Shibuyarn\\nEast: Kite Hill', 'west sign');
  M.sign(45, 10, 'KITE HILL\\nHold on to your hat.', 'east sign');
  M.spawn('west', 2, 12, 'right').spawn('east', 47, 12, 'left').spawn('cave', 7, 5, 'down');
  M.edge('w', 11, 13, 'shibuyarn', 'east').edge('e', 11, 13, 'kite_hill', 'west');

  // The road is never fenced. Three natural pinches put a Tailor across it (owner's rule: route trainers can't be skipped):
  //  1. rocky spurs run down from both shoulders and nearly meet; Gale and Ren wait in the gap
  M.rect(9, 5, 3, 2, 'C').rect(10, 7, 2, 3, 'C').rect(9, 15, 2, 2, 'C').rect(8, 17, 4, 2, 'C');
  //  2. a wind-bent copse crosses the ridge, with Suzu and Kip at the clearing where the road goes through
  M.rect(24, 2, 4, 3, 'T').rect(26, 5, 3, 2, 'T').rect(25, 7, 3, 3, 'T').rect(25, 14, 2, 2, 'T').rect(25, 16, 4, 2, 'T').rect(26, 18, 5, 4, 'T');
  //  3. a last rocky spine before Kite Hill, with Batten at its foot
  M.rect(38, 4, 4, 3, 'C').rect(38, 7, 3, 2, 'C').rect(39, 9, 2, 2, 'C').rect(39, 15, 3, 3, 'C');

  M.enc('grass', [['foldling', 30, 32, 26], ['whirligig', 30, 32, 24], ['chirpadee', 30, 31, 16], ['lyripip|chirpadee', 31, 33, 8], ['glowgrub', 30, 31, 10], ['flumble', 31, 33, 16]]);
  // Flumble only drift in on the rain: without it, her slot goes to Foldling
  M.def.encFilter = (list) => (NP.Weather.now === 'rain' ? list : list.map((e) => (e.sp === 'flumble' ? Object.assign({}, e, { sp: L.sp('foldling') }) : e)));

  M.trainer('r6_t1', 10, 10, 'hiker', 'down', { cls: 'Hiker', name: 'Gale', sight: 3, reward: 15, ai: 2, team: [['quarrel|chiseltail', 30], ['whirligig', 31]],
    intro: 'I\'ve lost two hats on this ridge already! I\'m not losing a battle too!', win: 'And there goes my third hat. Wait, no, that\'s my pride.', after: 'Tie your hat on with string. That\'s my top tip for the ridge.' });
  M.trainer('r6_t2', 11, 14, 'pilot', 'up', { cls: 'Pilot', name: 'Ren', sight: 3, reward: 16, ai: 2, team: [['foldling', 31], ['whirligig', 31], ['chirpadee', 30]],
    intro: 'My balloon\'s grounded, so I walk the ridge to feel the wind. Want to feel a battle?', win: 'You\'ve got a pilot\'s nerve. Have you ever flown?', after: 'Dart can read the wind just by licking her finger. I tried it, and now my finger\'s cold.' });
  M.trainer('r6_t3', 26, 10, 'schoolgirl', 'down', { cls: 'Kite Flyer', name: 'Suzu', sight: 3, reward: 13, ai: 1, team: [['foldling', 31], ['foldling', 31]],
    intro: 'My kite and I have been up here all day! Let\'s battle while the wind\'s good.', win: 'My kite lost too. It\'s in a tree now.', after: 'Foldling fold themselves up like paper kites. I\'ve seen one take off on her own!' });
  M.trainer('r6_t4', 27, 14, 'courier', 'up', { cls: 'Courier', name: 'Kip', sight: 3, reward: 15, ai: 2, team: [['jerbix|dunehop', 31], ['whirligig', 32]],
    intro: 'Balloon post is down, so I run the letters over the ridge! I\'ve got legs of steel. Battle me!', win: 'Legs of steel, and I\'m the one out of breath. Fair enough.', after: 'The post office on Kite Hill is drowning in letters. Somebody should help them.' });
  M.trainer('r6_t5', 40, 14, 'grunt_f', 'up', { cls: 'Presser', name: 'Batten', sight: 3, reward: 16, ai: 2, music: 'battle_society', team: [['whirligig', 31], ['boingo', 31], ['silkie', 32]],
    intro: 'Kite Hill\'s balloons are grounded for safety, because unscheduled flight is untidy. So is unscheduled walking, frankly.', win: 'Fine. Walk, then. But tidily.', after: 'The notice came straight from the Works. They don\'t want anyone flying over the pass and looking down.' });
  M.npc('flyer', 20, 3, 'child_m', 'down', ['Whoa! The wind up here blows you right back down to the road!\\pI\'ve been trying to get to the top of the ridge for an hour. It\'s the best ride ever.']);
  M.rect(20, 2, 5, 3, '.');
  M.pickup('top', 22, 2, 'gold_spool', 1, 'on the windy top (come in from the west and the gust carries you down)');
  M.pickup('slope', 32, 20, 'thread_ball', 2);
  M.hidden('bush', 32, 14, 'wish_candy', 1, 'a Wish Candy in the wind-bent bush');
  M.reg();

  // ---- the hidden cave: a Batnap roosts in the dark
  const C = L.map({ id: 'ridge_cave', name: 'Ridge Cave', music: 'cave', battleBg: 'cave', border: 'cave_wall', w: 12, h: 10, indoor: true, dark: true,
    legend: { w: 'cave_wall', f: 'cave_floor', ';': 'dry_grass' }, fill: 'w' });
  C.rect(2, 2, 8, 6, 'f').rect(4, 3, 4, 3, ';').rect(5, 8, 2, 1, 'f');
  C.spawn('door', 5, 7, 'up');
  C.warp({ xs: [5, 6], y: 8, to: 'route6', door: 'cave', sound: 'door' });
  C.enc('grass', [['batnap', 30, 32, 60], ['dripstone', 30, 32, 40]]);
  C.npc('roost', 8, 2, 'batnap|child_f', 'down', null, { hideIf: 'ridge_nocti', note: 'a roosting Batnap (static encounter)', script: function* (c, n) {
    yield* c.sayT('ridge_cave.batnap', 'A Batnap is hanging upside down from the roof, wrapped in her wings. One eye opens.\\pKi-ki!');
    c.set('ridge_nocti');
    yield* c.wildBattle('batnap', 32);
    c.hideNpc(n.id);
  } });
  C.pickup('charm', 2, 2, 'dusk_charm', 1, 'Dusk Charm in the back of the cave');
  C.reg();
})(typeof globalThis !== 'undefined' ? globalThis : window);
