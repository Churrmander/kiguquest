/* Gingham Woods — a hushed treeline maze of clearings between Route 2 and the Spindle Shrine. Buzz and Sprout Kigu live here. */
(function (root) {
  'use strict';
  const NP = root.NP, L = NP.levels;
  const W = 30, H = 40;

  const M = L.map({
    id: 'gingham_woods', name: 'Gingham Woods', music: 'forest_gingham', battleBg: 'forest', border: 'treeline', w: W, h: H, fill: 'T',
    view: 'town',   // 3D camera preset (street | town | flat-ish), see src/engine/persp.js
    legend: { '.': 'grass', T: 'treeline', p: 'path', ',': 'tallgrass', f: 'flowers', d: 'dirt' },
  });

  // ---- clearings (x, y, w, h) joined by narrow necks; the main road is the dirt/path line through them
  M.rect(10, 32, 10, 6, '.');                    // A: entry clearing
  M.rect(13, 38, 2, 2, 'p');
  M.rect(6, 33, 4, 2, '.').rect(3, 31, 5, 6, '.'); // A-west nook (a small dead end)
  M.rect(20, 34, 4, 2, '.').rect(23, 32, 5, 6, '.'); // A-east nook (a small dead end)
  M.rect(10, 28, 2, 4, '.');                     // neck A -> B
  M.rect(3, 21, 10, 7, '.');                     // B: west clearing
  M.rect(4, 19, 2, 2, '.').rect(3, 13, 6, 6, '.'); // B-north nook: a quiet glade
  M.rect(13, 22, 8, 2, '.');                     // corridor B -> C
  M.rect(20, 14, 8, 10, '.');                    // C: east clearing
  M.rect(20, 10, 2, 4, '.');                     // neck C -> D
  M.rect(6, 6, 16, 5, '.');                      // D: long north clearing
  M.rect(14, 0, 2, 6, '.');                      // neck D -> the shrine

  // ---- tall grass, flowers, the dirt road
  M.rect(11, 33, 4, 3, ',').rect(4, 22, 4, 4, ',').rect(8, 24, 2, 3, ',').rect(22, 17, 4, 4, ',').rect(9, 7, 5, 3, ',');
  M.rect(16, 36, 3, 1, 'f').rect(6, 26, 2, 1, 'f').rect(24, 22, 3, 1, 'f').rect(18, 7, 3, 1, 'f').rect(5, 14, 3, 1, 'f');
  M.path([[13, 39], [13, 34], [10, 34], [10, 22], [20, 22], [20, 8], [14, 8], [14, 0]], 2, 'd');   // the road: A, up the neck, across B and the corridor, up C and the neck, along D, out
  M.rect(13, 38, 2, 2, 'p');

  // ---- scenery
  M.sign(12, 37, 'GINGHAM WOODS\\nKeep to the dirt paths.', 'entry sign');
  M.sign(13, 6, 'SPINDLE SHRINE (north)\\nPlease keep your voices down near the shrine.', 'north sign');
  // trees are 1x2 (top y, base y+1)
  M.trees([[17, 33], [5, 32], [25, 34], [12, 24], [23, 14], [26, 19], [7, 8], [20, 6], [8, 14], [6, 15]]);
  M.trees([[3, 23], [9, 26], [27, 16], [16, 6], [7, 6]], 'pine');
  M.stamp('stump', 8, 21).stamp('stump', 26, 17).stamp('boulder', 18, 35).stamp('boulder', 4, 36).stamp('rock', 24, 35).stamp('bush', 12, 26).stamp('bush', 7, 10).stamp('bush', 7, 17);
  M.stamp('bush', 3, 17).stamp('bush', 26, 22);   // (wild bushes: a stone planter in the woods made no sense)

  // ---- people and pickups
  M.spawn('south', 13, 38, 'up').spawn('north', 14, 2, 'down');
  M.edge('s', 13, 14, 'route2', 'north').edge('n', 14, 15, 'spindle_shrine', 'south');

  M.trainer('pete', 7, 26, 'camper', 'right', { cls: 'Camper', name: 'Pete', sight: 4, reward: 7, ai: 1, team: [['sprubun', 10], ['buzzlet', 10], ['molli', 11]],
    intro: 'Shh! You\'ll wake the trees! ...Oh, you want to battle? All right, but quietly.', win: 'That was a very polite way to lose.', after: 'Stick to the dirt paths. There are Kigu napping all through that grass.' });
  M.trainer('tess', 25, 22, 'picnicker', 'left', { cls: 'Picnicker', name: 'Tess', sight: 5, reward: 8, ai: 1, team: [['daisip', 11], ['acolarva', 11]],
    intro: 'A picnic in the woods is the best picnic, and it\'s even better with a battle!', win: 'My sandwiches have gone all soft...', after: 'The Spindle Shrine is just past the north clearing. Everyone whispers up there.' });
  M.trainer('yuki', 17, 6, 'schoolgirl', 'down', { cls: 'Schoolgirl', name: 'Yuki', sight: 4, reward: 8, ai: 1, team: [['chirpadee', 11], ['sprubun', 11]],
    intro: 'We\'re not supposed to battle in the woods. ...But a quiet one is okay, right?', win: 'Teacher\'s going to ask why I\'m out of breath.', after: 'The Pressers came through here yesterday, measuring the paths. Rude!' });
  M.trainer('riku', 4, 16, 'net_kid', 'right', { cls: 'Net Kid', name: 'Riku', sight: 2, reward: 7, ai: 1, team: [['spinnet', 12], ['buzzlet', 11]],
    intro: 'You found my glade, so you have to battle me. That\'s the rule!', win: 'Okay, okay. You can use the glade too.', after: 'In the mornings the webs here get all dewy. They look like little lace doilies!' });

  M.npc('hush', 7, 16, 'old_tailor', 'left', ['Shh. Stand still for a moment and listen.\\pIf you\'re quiet, you can hear the whole wood humming.\\pThat\'s the Buzz Kigu, busy at work.'], { note: 'glade elder' });
  M.npc('artist', 25, 20, 'artist', 'down', ['I\'m painting the trees. They keep moving a little whenever I stop looking.\\pMaybe they\'re just shy.'], { note: 'painter in clearing C' });
  M.npc('hiker', 16, 34, 'hiker', 'left', ['Lost? Don\'t worry, everyone gets turned around here at least once.\\pJust follow the dirt paths and the trees will let you through.'], { note: 'near the entry' });

  M.pickup('spool', 4, 32, 'bond_spool', 3);
  M.pickup('cake', 26, 33, 'fancy_cake', 1);
  M.pickup('bell', 27, 15, 'wake_bell', 1);
  M.pickup('tea', 21, 9, 'mint_tea', 1);
  M.pickup('plum', 4, 14, 'plum_treat', 1);
  // gated: two one-tile alcoves in the treeline, each sealed by a bush. Needs Disc: Snip (Poppy gives it in Thimble).
  const gated = (kind) => { M.def.props[M.def.props.length - 1].gate = kind; };
  M.rect(10, 11, 1, 2, '.').rect(20, 24, 1, 2, '.');
  M.stamp('bush', 10, 11).stamp('bush', 20, 24);
  M.pickup('nook1', 10, 12, 'sugar_cube', 1); gated('snip');
  M.pickup('nook2', 20, 25, 'scent_spray', 1); gated('snip');
  M.hidden('stump_cube', 8, 21, 'sugar_cube', 1, 'hidden Sugar Cube under the stump');
  M.hidden('stump_numb', 26, 17, 'numb_away', 1, 'hidden Numb Away under the stump');

  M.enc('grass', [['buzzlet', 7, 9, 25], ['daisip', 7, 10, 35], ['acolarva', 8, 10, 15], ['spinnet', 8, 10, 15], ['vowspun', 9, 11, 5]]);   // no starters in the wild (owner, 2026-10-27)

  M.reg();
})(typeof globalThis !== 'undefined' ? globalThis : window);
