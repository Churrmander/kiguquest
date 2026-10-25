/* The Oasis — a shady pool in the south of the Dust Bowl (follow the green thread). Optional: a Hiker sheltering from the sun, a
 * palm with the Sun Charm in it, and Skorpi in the long grass. The storm never reaches the water, so it's clear here. */
(function (root) {
  'use strict';
  const NP = root.NP, L = NP.levels;
  const W = 24, H = 18;

  const M = L.map({
    id: 'dust_oasis', name: 'The Oasis', music: 'town_desert', battleBg: 'desert', border: 'cliff', w: W, h: H, view: 'town',
    legend: { u: 'dune', s: 'sand', C: 'cliff', w: 'water', '.': 'grass', ';': 'dry_grass', ',': 'tallgrass', f: 'flowers' },
    fill: 'u',
  });
  M.rect(0, 0, W, 2, 'C').rect(0, H - 2, W, 2, 'C').rect(0, 2, 2, H - 4, 'C').rect(W - 2, 2, 2, H - 4, 'C');
  M.rect(11, 0, 4, 2, 'u');                                       // the way back north, into the Dust Bowl
  // the green heart of it: grass round a pool, edged with sand where it meets the dunes
  M.blob(12, 9, 8, 5, 's');
  M.blob(12, 9, 7, 4, '.');
  M.blob(13, 9, 4, 2, 'w');
  M.rect(4, 12, 4, 2, ',').rect(17, 5, 3, 3, ',').rect(3, 3, 4, 3, ';').rect(18, 12, 3, 2, ';');
  M.rect(7, 7, 2, 1, 'f').rect(17, 11, 2, 1, 'f');
  M.stamp('palm', 6, 5).stamp('palm', 18, 7).stamp('palm', 9, 11).stamp('palm', 15, 3).stamp('cactus', 20, 3).stamp('rock', 3, 14);
  M.hidden('palm_charm', 19, 9, 'sun_charm', 1, 'the Sun Charm, tangled in the fronds of the east palm');
  M.sign(10, 2, 'THE OASIS\\nFresh water. Please don\'t wash your socks in it.', 'oasis sign');
  M.spawn('north', 12, 2, 'down');
  M.edge('n', 11, 14, 'dust_bowl', 'south');
  M.enc('grass', [['skorpi|peepi', 23, 25, 34], ['cactli|nibbi', 23, 25, 30], ['sandkit|mittsy', 22, 24, 24], ['peepi', 22, 24, 12]]);
  M.trainer('oa_t1', 8, 7, 'hiker', 'right', { cls: 'Hiker', name: 'Ansel', sight: 4, reward: 14, ai: 2, team: [['slatli|kumi', 24], ['sandkit|mittsy', 24], ['cactara|nibbi', 25]],
    intro: 'This is the only shade for miles, and I\'m not moving out of it. You\'ll have to battle me right here!', win: 'You were worth getting up for.', after: 'I lost my lucky charm up a palm tree. The one on the east side, if you\'re any good at climbing.' });
  M.npc('fisher', 15, 13, 'fisher', 'up', ['There aren\'t any fish in an oasis. I know that.\\pI just like sitting by water with a rod. It\'s very calming.'], { note: 'flavour' });
  M.pickup('cake', 4, 3, 'grand_cake|fancy_cake', 1);
  M.reg();
})(typeof globalThis !== 'undefined' ? globalThis : window);
