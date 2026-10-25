/* Moves added for Chapter 4 (Route 4, the Dust Bowl, Bobbin Quarry): mostly Pebble and Terra, plus a few for the desert Kigu.
 * Same shape as moves.js. */
(function (root) {
  'use strict';
  const NP = (root.NP = root.NP || {});
  const mv = (NP.data.moves = NP.data.moves || {});
  const P = 'physical', S = 'special', T = 'status';
  function M(id, name, type, cat, power, acc, pp, x, desc) {
    NP.reg(mv, id, Object.assign({ name, type, category: cat, power, acc, pp, priority: 0, target: 'foe', desc: desc || '' }, x || {}));
  }
  const st = (id, chance) => ({ id, chance: chance === undefined ? 100 : chance });

  // --- Pebble
  M('gravel_spray', 'Gravel Spray', 'pebble', S, 40, 100, 25, null, 'Flicks a spray of gravel.');
  M('rock_roll', 'Rock Roll', 'pebble', P, 65, 95, 20, null, 'Curls up and rolls into the foe.');
  M('stone_wall', 'Stone Wall', 'pebble', T, null, null, 15, { target: 'self', boosts: { def: 2 } }, 'Sharply raises Defense.');
  M('slab_slam', 'Slab Slam', 'pebble', P, 90, 85, 10, { flinch: 20 }, 'Brings a flat slab down hard.');
  M('crystal_glint', 'Crystal Glint', 'pebble', S, 75, 100, 15, { boosts: { acc: -1 }, boostChance: 20 }, 'A flash of crystal light.');
  // --- Terra
  M('sand_scoop', 'Sand Scoop', 'terra', S, 35, 100, 25, { boosts: { acc: -1 }, boostChance: 30 }, 'Scoops sand at the foe.');
  M('burrow_hop', 'Burrow Hop', 'terra', P, 55, 100, 20, { priority: 1 }, 'Pops up from a burrow first.');
  M('dig_in', 'Dig In', 'terra', T, null, null, 20, { target: 'self', boosts: { def: 1, spd: 1 } }, 'Digs in to raise both defenses.');
  M('quarry_quake', 'Quarry Quake', 'terra', P, 90, 100, 10, null, 'Shakes the ground hard.');
  // --- desert extras
  M('needle_hug', 'Needle Hug', 'nettle', P, 50, 100, 20, { status: st('psn', 20) }, 'A prickly hug that may poison.');
  M('tail_sting', 'Tail Sting', 'nettle', P, 70, 100, 15, { status: st('psn', 30) }, 'A tassel-tail jab that may poison.');
  M('tumble_rush', 'Tumble Rush', 'gale', P, 60, 100, 20, null, 'Rolls in on the wind.');
  M('heat_haze', 'Heat Haze', 'ember', S, 60, 100, 20, { status: st('brn', 10) }, 'Shimmering heat. May burn.');
  M('night_pinch', 'Night Pinch', 'shade', P, 65, 100, 15, { crit: 1 }, 'A sneaky pinch. Often a critical hit.');
})(typeof globalThis !== 'undefined' ? globalThis : window);
