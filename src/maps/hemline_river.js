/* Hemline Riverside — south out of Hemline to Hemline Lake and its fishing contest. Optional, and Tide's big moment: every Tailor
 * on the bank is a Tide Tailor, either hoping to win this year's contest or still sore about losing last year's.
 *  - First, a long strip of tall grass you can't avoid, with only Daisip and Scurrent in it, so a player who picked
 *    Konko meets a Sprout or Volt Kigu before the Tide Tailors (owner's call, 2026-10-26).
 *  - The river runs too fast to paddle (sea terrain: water you can fish but not cross), so it can't be used to skip anyone.
 *  - Natural pinches, never fences (owner's rule): copses reach from the trees to the river's edge, each with one 3-wide gap and
 *    a Tailor (or two, one either side) watching it. tests/routing.test.mjs checks that none of them can be skipped.
 *  - Every team has one Kigu that Ember hits normally, so a Konko team is never stuck. Levels 13-16, like Route 3. */
(function (root) {
  'use strict';
  const NP = root.NP, L = NP.levels;
  const W = 24, H = 46;

  const M = L.map({
    id: 'hemline_river', name: 'Hemline Riverside', music: 'route_meadow', battleBg: 'water', border: 'treeline', w: W, h: H,
    view: 'street',
    legend: { '.': 'grass', T: 'treeline', ',': 'tallgrass', p: 'path', s: 'sand', '~': 'sea', f: 'flowers' },
  });
  M.ascii(0, 0, [
    'TTTTTTTTTTpppTTTTTTTTTTT',   // 0  north: up to Hemline
    'TTTTTTTTTTpppTTTTTTTTTTT',
    'TTTTTTTT,,,,,,,TTTTTTTTT',   // 2  the counter grass: Daisip and Scurrent only
    'TTTTTTTT,,,,,,,TTTTTTTTT',
    'TTTTTTTT,,,,,,,TTTTTTTTT',
    'TTTTTTTT,,,,,,,TTTTTTTTT',
    'TTTTTTTT,,,,,,,TTTTTTTTT',
    'TTTTTTTT,,,,,,,TTTTTTTTT',
    'TTTTTTTT,,,,,,,TTTTTTTTT',
    'TTTTTTTT,,,,,,,TTTTTTTTT',
    'TTTTTTTT,,,,,,,TTTTTTTTT',   // 10
    'TTTTTTTT..ppp..TTTTTTTTT',
    'TTT.......ppp...sTTTTTTT',   // 12 the river springs out of the woods
    'TT..f.....ppp...s~~~~TTT',
    'TT........ppp...s~~~~TTT',
    'TTTTTTTTTTpppTTTT~~~~TTT',   // 15 pinch 1: gap x10-12
    'TT........ppp...s~~~~TTT',
    'TT..ppppppppp...s~~~~TTT',
    'TT..p...........s~~~~TTT',
    'TT..p.....f.....s~~~~TTT',
    'TT..p...........s~~~~TTT',   // 20
    'TTTTpppTTTTTTTTTT~~~~TTT',   // 21 pinch 2: gap x4-6
    'TT..ppp.........s~~~~TTT',
    'TT...pppppppp...s~~~~TTT',
    'TT..........p...s~~~~TTT',
    'TT..f.......p...s~~~~TTT',
    'TT..........p...s~~~~TTT',
    'TTTTTTTTTTTTpppTT~~~~TTT',   // 27 pinch 3: gap x12-14
    'TT..........ppp.s~~~~TTT',
    'TT....pppppppp..s~~~~TTT',
    'TT....p.........s~~~~TTT',   // 30
    'TT....p......f..s~~~~TTT',
    'TT....p.........s~~~~TTT',
    'TTTpppTTTTTTTTTTT~~~~TTT',   // 33 pinch 4: gap x3-5
    'TT.ppp..........s~~~~TTT',
    'TT..pppppppp....s~~~~TTT',
    'TT.........p....s~~~~TTT',
    'TT..f......p....s~~~~TTT',
    'TT.........p....s~~~~TTT',
    'TTTTTTTTTTpppTTTT~~~~TTT',   // 39 pinch 5: gap x10-12
    'TT........ppp...s~~~~TTT',   // 40
    'TT........ppp...s~~~~TTT',
    'TT..f.....ppp...s~~~~TTT',
    'TT........ppp...s~~~~TTT',
    'TTTTTTTTTTpppTTTT~~~~TTT',   // 44 south: down to Hemline Lake
    'TTTTTTTTTTpppTTTT~~~~TTT',
  ]);
  M.sign(9, 11, 'HEMLINE RIVERSIDE\\nNorth: Hemline\\nSouth: Hemline Lake', 'north sign');
  M.sign(15, 12, 'DANGER: FAST WATER\\nThe river runs too fast to paddle.\\pFishing is fine. Falling in is not.', 'river sign');
  M.sign(13, 43, 'HEMLINE LAKE FISHING CONTEST\\nThis way! All rods welcome!', 'contest sign');
  M.trees([[3, 12], [9, 24], [14, 30], [3, 36], [14, 40]]);
  M.stamp('rock', 8, 18).stamp('bush', 14, 24).stamp('rock', 9, 31).stamp('bush', 8, 37).stamp('stump', 4, 42);
  M.spawn('north', 11, 1, 'down').spawn('south', 11, 44, 'up');
  M.edge('n', 10, 12, 'hemline', 'south').edge('s', 10, 12, 'hemline_lake', 'north');

  // the counter grass: only a Sprout and a Volt Kigu (55 / 45), so a Konko team gets the chance of an answer to Tide
  M.enc('grass', [['daisip', 11, 14, 55], ['scurrent', 11, 14, 45]]);   // no starters in the wild (owner, 2026-10-27)
  M.def.fishing = {
    water: 'fresh', river: true,
    kigu: { 1: [['gilfin', 8, 12, 60], ['kiskat', 9, 12, 40]], 2: [['kiskat', 15, 20, 40], ['zeel', 15, 20, 30], ['gilfin', 15, 20, 30]], 3: [['slickish', 30, 35, 40], ['zeel', 30, 35, 40], ['gilfin', 30, 35, 20]] },
  };

  // ---- the Tide Tailors: contest hopefuls and sore losers. Each team has one Kigu Ember hits normally.
  M.trainer('rv_t1', 13, 16, 'fisher', 'left', { cls: 'Angler', name: 'Tam', sight: 3, reward: 8, ai: 1, team: [['gilfin', 13], ['kiskat', 14], ['chirpadee', 13]],
    intro: 'I\'m practising for the contest! Practising battling, that is. The fishing part is going badly.', win: 'My Gilfin flapped very bravely. It didn\'t help, but it was brave.',
    after: 'This year I\'m beating Old Wade. I\'m sure of it. ...Fairly sure.' });
  M.trainer('rv_t2', 7, 22, 'picnicker', 'left', { cls: 'Swimmer', name: 'Marisol', sight: 3, reward: 8, ai: 1, team: [['waddlecoat', 14], ['nibblit', 14]],
    intro: 'I came second-to-last in the contest. Second-to-last! I need to battle something.', win: 'And now I\'ve come last at this too.',
    after: 'Old Wade has won the contest every year since before I was born. Nobody even knows his secret.' });
  M.trainer('rv_t3', 3, 20, 'fisher', 'right', { cls: 'Angler', name: 'Ned', sight: 3, reward: 8, ai: 1, team: [['kiskat', 15], ['kittabra', 14]],
    intro: 'Shh! You\'re scaring the fish. ...Too late now. Battle me instead!', win: 'Well, the fish are definitely gone now.',
    after: 'My Kiskat kisses everything. The bait, the rod, my nose. Mostly my nose.' });
  M.trainer('rv_t4', 11, 28, 'camper', 'right', { cls: 'Paddler', name: 'Ollie', sight: 3, reward: 8, ai: 1, team: [['kerochapu', 14], ['jellybob', 14], ['molli', 14]],
    intro: 'I tried to paddle out to the island in the lake once. The water pulled me straight back to shore!', win: 'Straight back to shore again.',
    after: 'They say the best fish live round that island. Nobody\'s ever got close, though.' });
  M.trainer('rv_t5', 2, 32, 'schoolgirl', 'right', { cls: 'Angler', name: 'June', sight: 3, reward: 9, ai: 1, team: [['zeel', 15], ['kumi', 15]],
    intro: 'My Zeel gives everyone a little zap. It\'s her way of saying hello!', win: 'Bzzt. That\'s her way of saying "ow".',
    after: 'Zeel hides under bridges. If a bridge ever buzzes at you, say hi.' });
  M.trainer('rv_t6', 6, 34, 'sailor', 'left', { cls: 'Sailor', name: 'Bo', sight: 3, reward: 9, ai: 1, team: [['jellybob', 15], ['kerochapu', 16], ['chirpadee', 15]],
    intro: 'I\'m a sailor! A river sailor. It\'s a small boat. It\'s a very small boat.', win: 'My boat would have helped. If I had a boat.',
    after: 'The contest\'s just south. Go on, you might get lucky!' });
  M.trainer('rv_t7', 9, 40, 'fisher', 'right', { cls: 'Angler', name: 'Wendell', sight: 3, reward: 10, ai: 1, team: [['kiskat', 16], ['zeel', 16], ['nibblit', 15]],
    intro: 'I came second in last year\'s contest, and second the year before. You\'re not getting my second place!', win: 'Second place in this too. Of course.',
    after: 'Old Wade always wins with three enormous fish. I\'ve never seen him catch a single one.' });

  M.npc('hopeful', 6, 25, 'child_f', 'right', ['I\'m going to enter the contest when I\'m big enough to hold a rod by myself!\\pRight now my Gilfin holds it with me.']);
  M.pickup('spool', 5, 14, 'bond_spool', 3);
  M.pickup('cake', 14, 19, 'fancy_cake', 1);
  M.hidden('stump_candy', 4, 42, 'wish_candy', 1, 'a Wish Candy under the stump');
  M.reg();
})(typeof globalThis !== 'undefined' ? globalThis : window);
