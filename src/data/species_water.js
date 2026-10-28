/* Species for fishing and Paddling (docs: the fishing design, 2026-10-26). Same shape as species.js.
 *  Rods catch only fish-based Tide Kigu, and only in the water their fish lives in: Kiskat (catfish, fresh), Zeel (electric eel,
 *  fresh), Gilfin (koi, fresh: our "weak until she evolves" Kigu), Fugubun (pufferfish, salt), Kelpony (seahorse, salt).
 *  Paddling finds the non-fish water Kigu: Waddlecoat (duck), Jellybob (jellyfish), Clawdet (crab), Alligrunt (crocodile).
 *  Gilfin only becomes Ryukoi while holding a Gold Scale at Lv30+ (the legend of the first Ryukoi; see src/game/fishing.js).
 *  Names approved by the owner (Kiskat, Slickish and Zeel on 2026-10-26; the rest are roster names from round 2). */
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

  // ---- fishing (rods)
  sp('kiskat', 'Kiskat', ['tide'], [62, 60, 56, 42, 50, 38], { catch: 190, exp: 58, ab: ['torrent'], cry: 'Mwah-mwah!', evo: [{ to: 'slickish', level: 20 }],
    ls: [[1, 'pounce'], [1, 'whisker_kiss'], [5, 'bubble_pop'], [9, 'dust_up'], [13, 'aqua_dash'], [17, 'mud_shot']],
    dex: 'A catfish onesie with long feelers on the hood. She presses her big lips to everything so her feelers can touch it, which makes it look like she\'s kissing.' });
  sp('slickish', 'Slickish', ['tide', 'terra'], [98, 90, 86, 60, 72, 46], { catch: 75, exp: 162, ab: ['torrent'], cry: 'MWAH!', stage: 2, family: 'kiskat',
    ls: [[1, 'whisker_kiss'], [1, 'aqua_dash'], [1, 'mud_shot'], [20, 'mud_wallow'], [26, 'paddle_slap'], [32, 'earth_thump'], [38, 'tide_wave']],
    dex: 'A big, glossy catfish with whisker-ribbons down to her knees. She naps on the riverbed and nothing in the river bothers her.' });
  sp('zeel', 'Zeel', ['tide', 'volt'], [72, 78, 60, 92, 64, 78], { catch: 75, exp: 150, ab: ['keen_eye'], cry: 'Zzz-eel!',
    ls: [[1, 'spark_jolt'], [1, 'bubble_pop'], [6, 'static_snap'], [11, 'aqua_dash'], [16, 'eel_coil'], [22, 'bubble_beam'], [28, 'live_wire'], [36, 'tide_wave']],
    dex: 'An electric eel in a dark-green onesie with yellow spark-stripes. She hides under bridges and buzzes anyone who steps on her tail.' });
  sp('gilfin', 'Gilfin', ['tide'], [25, 15, 50, 15, 22, 80], { growth: 'slow', catch: 255, exp: 40, ab: ['run_away'], cry: 'Gu-pu!',
    evo: [{ to: 'ryukoi', level: 30, held: 'gold_scale' }],
    ls: [[1, 'fin_flap'], [15, 'pounce'], [25, 'aqua_dash']],
    dex: 'A koi in an orange-and-white onesie. She flops about with great pride and almost no effect. Legend says she dreams of a golden scale.' });
  sp('ryukoi', 'Ryukoi', ['tide', 'drake'], [95, 120, 80, 60, 100, 82], { growth: 'slow', catch: 45, exp: 214, ab: ['torrent'], cry: 'Gu-RYOO!', stage: 2, family: 'gilfin',
    ls: [[1, 'fin_flap'], [1, 'koi_rush'], [1, 'pounce'], [30, 'koi_rush'], [34, 'waterfall_climb'], [40, 'paddle_slap'], [46, 'tide_wave']],
    dex: 'A dragon-koi in a cape of gold-thread scales. The first Ryukoi swam up a waterfall for months to reach a golden scale.' });
  sp('fugubun', 'Fugubun', ['tide'], [55, 48, 62, 50, 55, 35], { catch: 190, exp: 58, ab: ['shed_skin'], cry: 'Pffup!', evo: [{ to: 'swellegant', level: 18 }],
    ls: [[1, 'pounce'], [1, 'puff_up'], [5, 'bubble_pop'], [10, 'spine_jab'], [15, 'aqua_dash']],
    dex: 'A round pufferfish onesie with a fringed hood. When she\'s startled she puffs up so much that she rolls away.' });
  sp('swellegant', 'Swellegant', ['tide', 'nettle'], [85, 72, 92, 70, 80, 45], { catch: 75, exp: 155, ab: ['shed_skin'], cry: 'Pfff-PAH!', stage: 2, family: 'fugubun',
    ls: [[1, 'puff_up'], [1, 'spine_jab'], [1, 'aqua_dash'], [18, 'tail_sting'], [24, 'bubble_beam'], [32, 'tide_wave']],
    dex: 'A very proper lady in a bubble-lace gown trimmed with soft spine-frills. The moment anything flusters her, she swells up to twice her size.' });
  sp('kelpony', 'Kelpony', ['tide', 'dream'], [50, 40, 55, 65, 65, 55], { catch: 120, exp: 64, ab: ['keen_eye'], cry: 'Bloop-hm.',
    evo: [{ to: 'kelpuda', level: 1, held: 'delicate_teacup' }],
    ls: [[1, 'bubble_pop'], [1, 'daydream'], [8, 'kelp_drift'], [14, 'bubble_beam'], [20, 'dream_wave']],
    dex: 'A seahorse hood with a kelp-frond mane. She drifts with the tide and is usually somewhere else by the time you look again.' });
  sp('kelpuda', 'Kelpuda', ['tide', 'dream'], [80, 55, 75, 100, 95, 75], { catch: 45, exp: 168, ab: ['keen_eye'], cry: 'Bloo-ooo.', stage: 2, family: 'kelpony',
    ls: [[1, 'kelp_drift'], [1, 'bubble_beam'], [1, 'daydream'], [24, 'dream_wave'], [30, 'tide_wave']],
    dex: 'She wears a sea-lantern crest and a teacup-saucer hat, and she takes her tea very slowly.' });

  // ---- Paddling
  sp('waddlecoat', 'Waddlecoat', ['gale', 'tide'], [64, 62, 55, 52, 58, 70], { catch: 190, exp: 62, ab: ['keen_eye'], cry: 'Quack-quack!',
    ls: [[1, 'pip_peck'], [1, 'bubble_pop'], [6, 'gust_puff'], [11, 'duck_dive'], [17, 'wing_flutter'], [24, 'bubble_beam']],
    dex: 'A duck onesie with a flat yellow rain-cape. Her wing-sleeves flap when she\'s pleased, which is most of the time.' });
  sp('jellybob', 'Jellybob', ['tide', 'spook'], [50, 30, 45, 60, 70, 45], { catch: 150, exp: 60, ab: ['run_away'], cry: 'Pom-pom!', evo: [{ to: 'pompola', level: 22, time: 'night' }],
    ls: [[1, 'bubble_pop'], [1, 'drift_sting'], [7, 'shadow_lick'], [13, 'lantern_glow'], [19, 'bubble_beam']],
    dex: 'A jellyfish hat with pom-pom tentacles and a soft glow. She drifts calmly from place to place and never seems to be in a hurry.' });
  sp('pompola', 'Pompola', ['tide', 'spook'], [80, 45, 70, 95, 105, 60], { catch: 60, exp: 165, ab: ['run_away'], cry: 'Pom-OOO.', stage: 2, family: 'jellybob',
    ls: [[1, 'drift_sting'], [1, 'lantern_glow'], [22, 'wisp_drift'], [28, 'tide_wave'], [36, 'moon_wail']],
    dex: 'A lantern-jellyfish gown of pom-pom tassels. On dark nights she lights the way for boats coming home.' });
  sp('clawdet', 'Clawdet', ['tide', 'brawl'], [52, 70, 68, 30, 40, 48], { catch: 190, exp: 62, ab: ['sturdy_soul'], cry: 'Clack-clack!', evo: [{ to: 'crabmiral', level: 24 }],
    ls: [[1, 'pounce'], [1, 'pinch_clamp'], [6, 'bubble_pop'], [12, 'shell_guard'], [18, 'aqua_dash']],
    dex: 'A navy cadet in a crab onesie and a sailor cap a size too big. She salutes with her big pincer and bonks her own head every time.' });
  sp('crabmiral', 'Crabmiral', ['tide', 'brawl'], [80, 105, 100, 45, 60, 55], { catch: 75, exp: 166, ab: ['sturdy_soul'], cry: 'CLACK-clack!', stage: 2, family: 'clawdet',
    ls: [[1, 'pinch_clamp'], [1, 'shell_guard'], [24, 'mitt_punch'], [30, 'paddle_slap'], [38, 'tide_wave']],
    dex: 'A sailor-crab coat with an anchor-shaped shield and a whistle on a cord. She runs the rock pools like a ship.' });

  // ---- crocodile (Paddling, rivers and lakes): the army line, recruit to captain to the river's tyrant-general (owner, 2026-10-28)
  sp('alligrunt', 'Alligrunt', ['tide', 'pebble'], [55, 66, 62, 34, 42, 41], { growth: 'mediumSlow', catch: 120, exp: 64, ab: ['torrent'], cry: 'Hup-hup!', evo: [{ to: 'snaptain', level: 18 }],
    ls: [[1, 'pounce'], [1, 'bubble_pop'], [5, 'pebble_toss'], [9, 'aqua_dash'], [13, 'rock_roll'], [17, 'mud_shot']],
    dex: 'A little alligator recruit in an army helmet a size too big. She marches everywhere and repeats every order at the top of her voice.' });
  sp('snaptain', 'Snaptain', ['tide', 'pebble'], [70, 88, 82, 44, 56, 55], { growth: 'mediumSlow', catch: 45, exp: 150, ab: ['torrent'], cry: 'Ten-HUT!', stage: 2, family: 'alligrunt', evo: [{ to: 'tyranodile', level: 36 }],
    ls: [[1, 'pounce'], [1, 'pebble_toss'], [1, 'aqua_dash'], [18, 'stone_wall'], [22, 'paddle_slap'], [27, 'shade_bite'], [32, 'slab_slam']],
    dex: 'An army captain with bars on her helmet and the strap done up tight. She gives orders with a snap of her jaw-hood, and the whole riverbank listens.' });
  sp('tyranodile', 'Tyranodile', ['tide', 'pebble'], [92, 120, 102, 58, 70, 68], { growth: 'mediumSlow', catch: 45, exp: 236, ab: ['torrent'], cry: 'HRRAAH!', stage: 3, family: 'alligrunt',
    ls: [[1, 'shade_bite'], [1, 'stone_wall'], [1, 'slab_slam'], [36, 'mitt_punch'], [42, 'tide_wave']],
    dex: 'The tyrant-general of the river, in a crocodile greatcoat covered in medals. Nobody crosses her river without saluting first.' });
})(typeof globalThis !== 'undefined' ? globalThis : window);
