/* Moves added for Chapters 5 and 6 (Route 5, Shibuyarn, the Spark Cellar, Route 6, Kite Hill): mostly Volt, Iron, Spook, Shade,
 * Frost and Gale, for the city, cave and airfield Kigu. Same shape as moves.js. */
(function (root) {
  'use strict';
  const NP = (root.NP = root.NP || {});
  const mv = (NP.data.moves = NP.data.moves || {});
  const P = 'physical', S = 'special', T = 'status';
  function M(id, name, type, cat, power, acc, pp, x, desc) {
    NP.reg(mv, id, Object.assign({ name, type, category: cat, power, acc, pp, priority: 0, target: 'foe', desc: desc || '' }, x || {}));
  }
  const st = (id, chance) => ({ id, chance: chance === undefined ? 100 : chance });

  // --- Volt
  M('spark_jolt', 'Spark Jolt', 'volt', S, 40, 100, 30, { status: st('par', 10) }, 'A small jolt. May paralyze.');
  M('static_snap', 'Static Snap', 'volt', P, 55, 100, 25, { status: st('par', 20) }, 'A crackling tap. May paralyze.');
  M('neon_flash', 'Neon Flash', 'volt', S, 60, 100, 20, { boosts: { acc: -1 }, boostChance: 30 }, 'A dazzling flash. May lower accuracy.');
  M('charge_up', 'Charge Up', 'volt', T, null, null, 20, { target: 'self', boosts: { spa: 1, spd: 1 } }, 'Stores charge to raise Sp. Atk and Sp. Def.');
  M('live_wire', 'Live Wire', 'volt', S, 75, 100, 15, { status: st('par', 20) }, 'A humming wire of power. May paralyze.');
  M('thunder_coil', 'Thunder Coil', 'volt', S, 95, 85, 10, { status: st('par', 30) }, 'Unwinds a whole coil at once.');
  // --- Iron
  M('can_clank', 'Can Clank', 'iron', P, 40, 100, 30, null, 'Bonks the foe with a tin can.');
  M('coil_spring', 'Coil Spring', 'iron', P, 60, 100, 20, { priority: 1 }, 'Springs in before the foe can move.');
  M('gear_grind', 'Gear Grind', 'iron', P, 75, 95, 15, null, 'Grinds in with spinning gears.');
  M('tin_shield', 'Tin Shield', 'iron', T, null, null, 15, { target: 'self', boosts: { def: 2 } }, 'Sharply raises Defense.');
  M('propeller_cut', 'Propeller Cut', 'iron', P, 85, 90, 10, { crit: 1 }, 'A whirring cut. Often a critical hit.');
  // --- Spook
  M('lantern_glow', 'Lantern Glow', 'spook', S, 50, 100, 25, null, 'An eerie lantern light.');
  M('wisp_drift', 'Wisp Drift', 'spook', S, 70, 100, 15, { boosts: { spd: -1 }, boostChance: 20 }, 'Pale wisps drift through the foe.');
  M('moon_wail', 'Moon Wail', 'spook', S, 90, 90, 10, { flinch: 10 }, 'A long, chilling wail.');
  // --- Shade
  M('night_drift', 'Night Drift', 'shade', S, 45, 100, 25, null, 'Drifts in from the dark.');
  M('dusk_cloak', 'Dusk Cloak', 'shade', T, null, null, 15, { target: 'self', boosts: { eva: 1 } }, 'Wraps up in dusk to raise evasion.');
  M('shade_bite', 'Shade Bite', 'shade', P, 80, 100, 15, { flinch: 20 }, 'A bite from the shadows.');
  // --- Frost
  M('drizzle_chill', 'Drizzle Chill', 'frost', S, 40, 100, 30, null, 'A cold, misty drizzle.');
  M('frost_puff', 'Frost Puff', 'frost', S, 60, 100, 20, { status: st('frz', 10) }, 'A puff of frost. May freeze.');
  M('cloud_burst', 'Cloud Burst', 'frost', S, 85, 90, 10, { status: st('frz', 10) }, 'The whole cloud lets go at once.');
  // --- Gale
  M('paper_cut', 'Paper Cut', 'gale', P, 55, 100, 25, { crit: 1 }, 'A sharp paper edge. Often a critical hit.');
  M('prop_wash', 'Prop Wash', 'gale', S, 75, 100, 15, null, 'A blast of air from a propeller.');
  // --- city extras
  M('hot_lunch', 'Hot Lunch', 'ember', S, 65, 100, 15, { status: st('brn', 10) }, 'A steaming lunch, served hard. May burn.');
  M('share_bento', 'Share Bento', 'fluff', T, null, null, 10, { target: 'self', heal: 0.5 }, 'Shares a bento. Restores half HP.');
  M('capsule_pop', 'Capsule Pop', 'dream', S, 55, 100, 20, { boosts: { atk: -1 }, boostChance: 20 }, 'A capsule pops open with a surprise.');
  M('drip_drop', 'Drip Drop', 'pebble', S, 55, 100, 20, null, 'Drops a cold drip from above.');
})(typeof globalThis !== 'undefined' ? globalThis : window);
