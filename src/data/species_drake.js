/* Species: the Smolava line (BIBLE §3 #54-56), the Drake family. Same shape as species.js.
 * The art (AutoSprite fronts/backs, paper-doll rigs, looks-p2 fallbacks) has existed since round 2; this adds the battle data.
 * Names, types and evolution levels are the owner's (2026-10-26): Smolava -> Wyvrant at Lv30 -> Empyress at Lv55.
 * Dex lines are the bible's Sketchbook drafts. The Ch2 Spindle Shrine's sulking Wyvrant is the first one the player meets. */
(function (root) {
  'use strict';
  const NP = (root.NP = root.NP || {});
  const table = (NP.data.species = NP.data.species || {});
  const order = (NP.data.speciesIds = NP.data.speciesIds || []);
  const STAT = ['hp', 'atk', 'def', 'spa', 'spd', 'spe'];
  function sp(id, name, types, b, o) {
    const base = {};
    STAT.forEach((s, i) => (base[s] = b[i]));
    NP.reg(table, id, {
      name, num: order.length + 1, types, base,
      growth: o.growth || 'mediumFast', catchRate: o.catch || 45, expYield: o.exp || 60,
      abilities: o.ab || ['run_away'], hiddenAbility: o.hid || null,
      evolutions: o.evo || null, learnset: o.ls, dex: o.dex, cry: o.cry || name.slice(0, 3) + '!',
      baseBond: o.bond === undefined ? 70 : o.bond, stage: o.stage || 1, family: o.family || id, legend: !!o.legend,
    });
    order.push(id);
  }

  sp('smolava', 'Smolava', ['drake'], [52, 64, 45, 60, 45, 54], { growth: 'slow', catch: 45, exp: 60, ab: ['sturdy_soul'], cry: 'Mya!',
    evo: [{ to: 'wyvrant', level: 30 }],
    ls: [[1, 'pounce'], [1, 'tail_swat'], [6, 'cinder'], [11, 'scale_shield'], [16, 'wyrm_breath'], [22, 'scorch_tail'], [27, 'hissy_fit']],
    dex: 'A little dragon who follows people around asking for chores. She\'ll carry anything you hand her, even when it\'s bigger than she is.' });
  sp('wyvrant', 'Wyvrant', ['drake'], [72, 94, 65, 80, 60, 79], { growth: 'slow', catch: 45, exp: 147, ab: ['sturdy_soul'], cry: 'Rrah!', stage: 2, family: 'smolava',
    evo: [{ to: 'empyress', level: 55 }],
    ls: [[1, 'tail_swat'], [1, 'cinder'], [1, 'wyrm_breath'], [1, 'scorch_tail'], [30, 'hissy_fit'], [36, 'heat_haze'], [42, 'drake_dive'], [48, 'shade_bite']],
    dex: 'She hates being told what to do and loses her temper over almost anything. Tailors say the only way to work with one is to let her think it was her idea.' });
  sp('empyress', 'Empyress', ['drake', 'shade'], [92, 115, 85, 110, 85, 93], { growth: 'slow', catch: 45, exp: 270, ab: ['sturdy_soul'], cry: 'Kyaaah!', stage: 3, family: 'smolava',
    ls: [[0, 'royal_pyre'], [1, 'hissy_fit'], [1, 'wyrm_breath'], [1, 'shade_bite'], [55, 'royal_pyre'], [60, 'drake_dive'], [66, 'dusk_cloak']],
    dex: 'A proud dragon who only takes orders from a Tailor she judges to be the best. It\'s said that no Empyress has ever willingly chosen a Tailor.' });
})(typeof globalThis !== 'undefined' ? globalThis : window);
