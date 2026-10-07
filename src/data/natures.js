/* Natures (25), experience growth curves, and level/exp helpers. */
(function (root) {
  'use strict';
  const NP = (root.NP = root.NP || {});

  // id: [name, plusStat, minusStat]   (same stat = neutral)
  const N = [
    ['hardy', 'Hardy', 'atk', 'atk'], ['lonely', 'Lonely', 'atk', 'def'], ['brave', 'Brave', 'atk', 'spe'], ['adamant', 'Adamant', 'atk', 'spa'], ['naughty', 'Naughty', 'atk', 'spd'],
    ['bold', 'Bold', 'def', 'atk'], ['docile', 'Docile', 'def', 'def'], ['relaxed', 'Relaxed', 'def', 'spe'], ['impish', 'Impish', 'def', 'spa'], ['lax', 'Lax', 'def', 'spd'],
    ['timid', 'Timid', 'spe', 'atk'], ['hasty', 'Hasty', 'spe', 'def'], ['serious', 'Serious', 'spe', 'spe'], ['jolly', 'Jolly', 'spe', 'spa'], ['naive', 'Naive', 'spe', 'spd'],
    ['modest', 'Modest', 'spa', 'atk'], ['mild', 'Mild', 'spa', 'def'], ['quiet', 'Quiet', 'spa', 'spe'], ['bashful', 'Bashful', 'spa', 'spa'], ['rash', 'Rash', 'spa', 'spd'],
    ['calm', 'Calm', 'spd', 'atk'], ['gentle', 'Gentle', 'spd', 'def'], ['sassy', 'Sassy', 'spd', 'spe'], ['careful', 'Careful', 'spd', 'spa'], ['quirky', 'Quirky', 'spd', 'spd'],
  ];
  const natures = {};
  for (const [id, name, plus, minus] of N) natures[id] = { id, name, plus: plus === minus ? null : plus, minus: plus === minus ? null : minus };
  NP.data.natures = natures;
  NP.data.natureIds = N.map((n) => n[0]);

  // total exp needed to REACH level n
  const GROWTH = {
    fast: (n) => Math.floor((4 * n * n * n) / 5),
    mediumFast: (n) => n * n * n,
    mediumSlow: (n) => Math.max(0, Math.floor((6 / 5) * n * n * n - 15 * n * n + 100 * n - 140)),
    slow: (n) => Math.floor((5 * n * n * n) / 4),
  };
  NP.data.growth = GROWTH;

  NP.expForLevel = function (growth, n) {
    const f = GROWTH[growth] || GROWTH.mediumFast;
    return n <= 1 ? 0 : f(n);
  };
  /** Highest level whose exp requirement is <= exp (1..100). */
  NP.levelForExp = function (growth, exp) {
    let lv = 1;
    while (lv < 100 && NP.expForLevel(growth, lv + 1) <= exp) lv++;
    return lv;
  };
})(typeof globalThis !== 'undefined' ? globalThis : window);
