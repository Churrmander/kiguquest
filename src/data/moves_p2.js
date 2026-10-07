/* Moves (Phase 2 additions).
 * { id, name, type, category:'physical'|'special'|'status', power, acc (null = never misses), pp, priority, target:'foe'|'self',
 *   crit (extra crit stages), multi:[min,max], drain (fraction of damage healed), recoil (fraction of damage),
 *   status:{id,chance}, boosts:{stat:n}, boostsSelf:bool, boostChance, flinch (chance %), heal (fraction of max HP),
 *   fixed:'level', leech:true, desc }
 * Damage-dealing effects live in src/game/battle/rules.js. */
(function (root) {
  'use strict';
  const NP = (root.NP = root.NP || {});
  const mv = (NP.data.moves = NP.data.moves || {});
  const P = 'physical', S = 'special', T = 'status';

  function M(id, name, type, cat, power, acc, pp, x, desc) {
    NP.reg(mv, id, Object.assign({ name, type, category: cat, power, acc, pp, priority: 0, target: cat === T ? 'foe' : 'foe', desc: desc || '' }, x || {}));
  }

  // --- Volt
  M('volt_surge', 'Volt Surge', 'volt', S, 80, 100, 15, null, 'A surge of electric energy.');
})(typeof globalThis !== 'undefined' ? globalThis : window);
