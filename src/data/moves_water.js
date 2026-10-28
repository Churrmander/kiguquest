/* Moves for the fishing and Paddling Kigu (Kiskat, Zeel, Gilfin, Ryukoi, Fugubun, Kelpony, Waddlecoat, Jellybob, Clawdet lines).
 * Same shape as moves.js. Fin Flap is Gilfin's do-nothing move (she flops about until she's strong enough to learn a real one). */
(function (root) {
  'use strict';
  const NP = (root.NP = root.NP || {});
  const mv = (NP.data.moves = NP.data.moves || {});
  const P = 'physical', S = 'special', T = 'status';
  function M(id, name, type, cat, power, acc, pp, x, desc) {
    NP.reg(mv, id, Object.assign({ name, type, category: cat, power, acc, pp, priority: 0, target: 'foe', desc: desc || '' }, x || {}));
  }
  const st = (id, chance) => ({ id, chance: chance === undefined ? 100 : chance });

  M('fin_flap', 'Fin Flap', 'tide', T, null, null, 40, { target: 'self' }, 'Flaps her fins with great energy. Nothing happens.');
  M('whisker_kiss', 'Whisker Kiss', 'tide', P, 40, 100, 30, { boosts: { acc: -1 }, boostChance: 20 }, 'A wet smooch with tickly feelers. May lower accuracy.');
  M('mud_wallow', 'Mud Wallow', 'terra', S, 65, 100, 15, { boosts: { acc: -1 }, boostChance: 30 }, 'Kicks up a cloud of riverbed mud.');
  M('eel_coil', 'Eel Coil', 'volt', P, 70, 100, 15, { status: st('par', 30) }, 'Wraps round the foe and zaps. May paralyse.');
  M('koi_rush', 'Koi Rush', 'drake', P, 80, 100, 15, null, 'A proud, scaly charge.');
  M('waterfall_climb', 'Waterfall Climb', 'tide', P, 80, 100, 15, { flinch: 20 }, 'Leaps up like a fish climbing a waterfall. May make the foe flinch.');
  M('puff_up', 'Puff Up', 'tide', T, null, null, 20, { target: 'self', boosts: { def: 2 } }, 'Gulps water and puffs up round. Sharply raises Defence.');
  M('spine_jab', 'Spine Jab', 'nettle', P, 50, 100, 20, { status: st('psn', 30) }, 'A jab with soft spines. May poison.');
  M('kelp_drift', 'Kelp Drift', 'dream', S, 55, 100, 20, { boosts: { spe: -1 }, boostChance: 30 }, 'Sways like kelp in the tide. May lower Speed.');
  M('duck_dive', 'Duck Dive', 'tide', P, 60, 100, 20, null, 'Ducks under and pops up somewhere unexpected.');
  M('drift_sting', 'Drift Sting', 'spook', S, 45, 100, 25, { status: st('par', 10) }, 'A ghostly brush of tentacles. May paralyse.');
  M('pinch_clamp', 'Pinch Clamp', 'brawl', P, 55, 100, 25, { crit: 1 }, 'A big pincer squeeze. Lands a critical hit more often.');
})(typeof globalThis !== 'undefined' ? globalThis : window);
