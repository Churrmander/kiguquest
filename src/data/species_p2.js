/* Species (Phase 2, BIBLE §3 #33-37). Adding a species = one sp(...) call.
 * { id, name, num, types, base{hp..spe}, growth, catchRate, expYield, abilities[], hiddenAbility, evolutions[{to,level}],
 *   learnset[[level,move]...] (level 0 = on-evolution move), dex (sketchbook text), cry (sound-word), baseBond, stage, family }
 * NP.data.speciesIds lists ids in dex order. */
(function (root) {
  'use strict';
  const NP = (root.NP = root.NP || {});
  const table = (NP.data.species = NP.data.species || {});
  const order = (NP.data.speciesIds = NP.data.speciesIds || []);
  const STAT = ['hp', 'atk', 'def', 'spa', 'spd', 'spe'];

  function sp(id, name, types, b, o) {
    const base = {};
    STAT.forEach((s, i) => (base[s] = b[i]));
    const d = {
      name, num: order.length + 1, types, base,
      growth: o.growth || 'mediumFast', catchRate: o.catch || 45, expYield: o.exp || 60,
      abilities: o.ab || ['run_away'], hiddenAbility: o.hid || null,
      evolutions: o.evo || null, learnset: o.ls, dex: o.dex, cry: o.cry || name.slice(0, 3) + '!',
      baseBond: o.bond === undefined ? 70 : o.bond, stage: o.stage || 1, family: o.family || id,
    };
    NP.reg(table, id, d);
    order.push(id);
  }

  // ---- Volt line (Phase 2)
  sp('sparkin', 'Sparkin', ['volt'], [45, 50, 43, 70, 50, 65], { catch: 190, exp: 63, ab: ['run_away'], cry: 'Zip!',
    evo: [{ to: 'voltessa', level: 26 }],
    ls: [[1, 'pounce'], [1, 'quick_dash'], [5, 'volt_surge'], [10, 'gust_puff'], [15, 'lullaby'], [20, 'feather_dance']],
    dex: 'A squirrel onesie with zigzag-striped tail and static-fluffed hair. Lightning crackles around her.' });
  sp('voltessa', 'Voltessa', ['volt'], [65, 70, 58, 95, 68, 85], { catch: 75, exp: 161, ab: ['run_away'], cry: 'Zzzt!', stage: 2, family: 'sparkin',
    ls: [[1, 'pounce'], [1, 'quick_dash'], [1, 'volt_surge'], [8, 'gust_puff'], [16, 'daydream'], [24, 'feather_dance'], [32, 'buzz_song'], [38, 'pillow_slam']],
    dex: 'Tesla-coil hair buns and fingerless gloves spark with energy. Her bolt-shaped tail cape trails lightning.' });

  // ---- Brawl line (Phase 2)
  sp('kumi', 'Kumi', ['brawl'], [50, 75, 60, 30, 50, 40], { catch: 190, exp: 65, ab: ['sturdy_soul'], cry: 'Koff!',
    evo: [{ to: 'kumara', level: 25 }],
    ls: [[1, 'pounce'], [1, 'tail_wag'], [5, 'mitt_punch'], [10, 'earth_thump'], [15, 'sweet_talk'], [20, 'pep_talk']],
    dex: 'A determined bear cub in a brown onesie with bandage-wrapped mitt paws. She trains daily to get stronger.' });
  sp('kumara', 'Kumara', ['brawl'], [75, 100, 80, 45, 75, 60], { catch: 75, exp: 172, ab: ['sturdy_soul'], cry: 'Kumf!', stage: 2, family: 'kumi',
    evo: [{ to: 'kumazen', level: 40 }],
    ls: [[1, 'pounce'], [1, 'mitt_punch'], [1, 'earth_thump'], [12, 'sweet_talk'], [20, 'pillow_slam'], [28, 'fluff_up'], [34, 'sly_nip'], [40, 'pebble_toss']],
    dex: 'A young fighter with boxing gloves, a headband, and a determined braid. Her punches grow stronger every day.' });
  sp('kumazen', 'Kumazen', ['brawl'], [95, 125, 100, 55, 95, 75], { catch: 45, exp: 270, ab: ['sturdy_soul'], cry: 'Kuma!', stage: 3, family: 'kumi',
    ls: [[1, 'pounce'], [1, 'mitt_punch'], [1, 'earth_thump'], [20, 'pillow_slam'], [34, 'sly_nip'], [40, 'pebble_toss'], [46, 'feather_dance']],
    dex: 'A serene martial artist in monk robes with prayer beads and huge mitts. Her calm strength inspires respect.' });

  // evolution sanity: every evo target exists is checked in tests.
})(typeof globalThis !== 'undefined' ? globalThis : window);
