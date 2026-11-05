/* Drake moves for the Smolava line (Smolava, Wyvrant, Empyress). Same shape as moves.js.
 * Until this file the game had one Drake move (Koi Rush), so the dragon line had nothing of her own to learn. */
(function (root) {
  'use strict';
  const NP = (root.NP = root.NP || {});
  const mv = (NP.data.moves = NP.data.moves || {});
  const P = 'physical', S = 'special', T = 'status';
  function M(id, name, type, cat, power, acc, pp, x, desc) {
    NP.reg(mv, id, Object.assign({ name, type, category: cat, power, acc, pp, priority: 0, target: 'foe', desc: desc || '' }, x || {}));
  }
  const st = (id, chance) => ({ id, chance: chance === undefined ? 100 : chance });

  M('tail_swat', 'Tail Swat', 'drake', P, 40, 100, 30, null, 'A swat with a stubby dragon tail.');
  M('scale_shield', 'Scale Shield', 'drake', T, null, null, 20, { target: 'self', boosts: { def: 1, spd: 1 } }, 'Tucks in behind her scales. Raises Defence and Sp. Def.');
  M('wyrm_breath', 'Wyrm Breath', 'drake', S, 60, 100, 20, { status: st('par', 20) }, 'A hot, rumbling breath. May paralyse.');
  M('temper_tantrum', 'Temper Tantrum', 'drake', P, 85, 90, 10, { recoil: 0.25 }, 'Flails about in a temper. She hurts herself a little too.');
  M('drake_dive', 'Drake Dive', 'drake', P, 100, 85, 10, { flinch: 20 }, 'Folds her wings and dives. May make the foe flinch.');
  M('pyre_blast', 'Pyre Blast', 'ember', S, 100, 90, 5, { status: st('brn', 20) }, 'A roaring blast of fire. May burn.');
})(typeof globalThis !== 'undefined' ? globalThis : window);
