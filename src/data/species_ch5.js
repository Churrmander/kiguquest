/* Species for Chapters 5 and 6, from the 151 roster notes: the Route 5/6 and Spark Cellar Kigu (#76-83), Shibuyarn's city Kigu
 * (#118-126) and the Kite Hill airfield Kigu (#84-89). Same shape as species.js. Special evolutions use the kigu.js conditions:
 * bond, time, move, weather, held, (the charm Kigu evolve on a level-up while holding their charm, which is used up). */
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
      baseBond: o.bond === undefined ? 70 : o.bond, stage: o.stage || 1, family: o.family || id,
    });
    order.push(id);
  }

  // ---- Route 5, Route 6 and the Spark Cellar
  sp('glowgrub', 'Glowgrub', ['volt'], [45, 35, 40, 60, 50, 60], { catch: 190, exp: 60, ab: ['keen_eye'], cry: 'Glo-glo!', evo: [{ to: 'glowmira', level: 20 }],
    ls: [[1, 'spark_jolt'], [1, 'fluff_up'], [5, 'neon_flash'], [10, 'lantern_glow'], [15, 'charge_up']],
    dex: 'A glowworm Kigu with a pale-green lantern tail. She is shy, and her lantern dims when she gets embarrassed.' });
  sp('glowmira', 'Glowmira', ['volt', 'spook'], [70, 50, 60, 100, 85, 85], { catch: 75, exp: 160, ab: ['keen_eye'], cry: 'Shimmer-hum.', stage: 2, family: 'glowgrub',
    ls: [[1, 'lantern_glow'], [1, 'neon_flash'], [24, 'live_wire'], [30, 'wisp_drift'], [38, 'moon_wail']],
    dex: 'She wears a glowing lantern-cape and a starry hem. Lost travellers in the Spark Cellar follow her light home.' });
  sp('boingo', 'Boingo', ['volt', 'iron'], [45, 55, 60, 50, 45, 55], { catch: 120, exp: 64, ab: ['sturdy_soul'], cry: 'Sprong-sprong!', evo: [{ to: 'teslaria', level: 1, held: 'volt_charm' }],
    ls: [[1, 'can_clank'], [1, 'spark_jolt'], [6, 'coil_spring'], [12, 'static_snap'], [18, 'tin_shield']],
    dex: 'Her copper-wire hair coils up in tight springs, so she bounces wherever she goes. The pylons on Route 5 are her favourite.' });
  sp('teslaria', 'Teslaria', ['volt', 'iron'], [70, 80, 90, 85, 70, 80], { catch: 60, exp: 165, ab: ['sturdy_soul'], cry: 'Ting-ting-ting.', stage: 2, family: 'boingo',
    ls: [[1, 'coil_spring'], [1, 'static_snap'], [1, 'live_wire'], [28, 'gear_grind'], [36, 'thunder_coil']],
    dex: 'Her copper-coil cape hums a single note. She tunes it with the fork in her hair before every battle.' });
  sp('batnap', 'Batnap', ['shade', 'gale'], [45, 45, 40, 50, 45, 70], { catch: 120, exp: 62, ab: ['keen_eye'], cry: 'Ki-ki!', evo: [{ to: 'noctura', level: 1, bond: 220 }],
    ls: [[1, 'gust_puff'], [1, 'night_drift'], [6, 'pip_peck'], [11, 'sly_nip'], [17, 'dusk_cloak']],
    dex: 'A bat Kigu with folded wing-sleeves and very sleepy eyes. She bumps into things in daylight, then says sorry to them.' });
  sp('noctura', 'Noctura', ['shade', 'spook'], [75, 70, 65, 90, 80, 100], { catch: 60, exp: 170, ab: ['keen_eye'], cry: 'Ki-ra-ra.', stage: 2, family: 'batnap',
    ls: [[1, 'night_drift'], [1, 'dusk_cloak'], [24, 'wisp_drift'], [30, 'shade_bite'], [38, 'moon_wail']],
    dex: 'A moon-wing cloak with star stitches and a lantern on one wrist. She only wakes properly once the moon is up.' });
  sp('dripstone', 'Dripstone', ['pebble', 'shade'], [55, 60, 75, 40, 55, 25], { catch: 120, exp: 66, ab: ['sturdy_soul'], cry: 'Ploop.', evo: [{ to: 'stalaghost', level: 27 }],
    ls: [[1, 'pebble_toss'], [1, 'night_drift'], [7, 'drip_drop'], [13, 'stone_wall'], [20, 'sly_nip']],
    dex: 'Her hood is a stalactite cap, and she hangs from the cave roof by her rope tail. She drips a little when she is happy.' });
  sp('stalaghost', 'Stalaghost', ['pebble', 'spook'], [80, 80, 105, 70, 85, 35], { catch: 60, exp: 170, ab: ['sturdy_soul'], cry: 'Ploo-oo...', stage: 2, family: 'dripstone',
    ls: [[1, 'drip_drop'], [1, 'stone_wall'], [30, 'wisp_drift'], [36, 'slab_slam']],
    dex: 'A pale calcite drape and a crown of hanging crystals. Every drop that falls from her glows for a moment.' });

  // ---- Shibuyarn
  sp('kachunk', 'Kachunk', ['volt', 'iron'], [55, 50, 65, 55, 55, 40], { catch: 190, exp: 62, ab: ['pickup'], cry: 'Ding-ding!', evo: [{ to: 'vendox', level: 24, time: 'night' }],
    ls: [[1, 'can_clank'], [1, 'pep_talk'], [5, 'spark_jolt'], [10, 'tin_shield'], [16, 'static_snap']],
    dex: 'A vending-machine Kigu with a glowing window hood. She is always open, always cheerful, and always out of the drink you want.' });
  sp('vendox', 'Vendox', ['volt', 'iron'], [85, 75, 100, 80, 80, 45], { catch: 60, exp: 170, ab: ['pickup'], cry: 'Clunk-HUM!', stage: 2, family: 'kachunk',
    ls: [[1, 'can_clank'], [1, 'static_snap'], [28, 'live_wire'], [34, 'gear_grind']],
    dex: 'Her cooler-cabinet cape has lit shelves, and chilled cans sit on her shoulders. She hums when the night is quiet.' });
  sp('gachapop', 'Gachapop', ['dream', 'fluff'], [50, 40, 55, 55, 60, 50], { catch: 190, exp: 60, ab: ['cuddly'], cry: 'Kapu!', evo: [{ to: 'capsuma', level: 22 }],
    ls: [[1, 'pounce'], [1, 'fluff_up'], [5, 'daydream'], [10, 'capsule_pop'], [16, 'sweet_talk']],
    dex: 'A round capsule-toy Kigu. Her shell hood opens like half a capsule, and she keeps every prize she has ever won.' });
  sp('capsuma', 'Capsuma', ['dream', 'fluff'], [80, 60, 80, 85, 90, 70], { catch: 75, exp: 160, ab: ['cuddly'], cry: 'Kapu-kapon.', stage: 2, family: 'gachapop',
    ls: [[1, 'capsule_pop'], [1, 'daydream'], [26, 'pillow_slam'], [32, 'dream_wave']],
    dex: 'A lacy shell-skirt and a row of tiny prize-pins. She trades pins with children and always lets them win.' });
  sp('blinkeon', 'Blinkeon', ['volt', 'shade'], [45, 45, 40, 65, 45, 75], { catch: 120, exp: 64, ab: ['early_bird'], cry: 'Bzz-bzzt!', evo: [{ to: 'neonova', level: 1, held: 'dusk_charm' }],
    ls: [[1, 'spark_jolt'], [1, 'sly_nip'], [6, 'neon_flash'], [12, 'night_drift'], [18, 'charge_up']],
    dex: 'A neon-sign Kigu with glowing outlines. Her lights flicker when she laughs, which is often, and usually at you.' });
  sp('neonova', 'Neonova', ['volt', 'shade'], [70, 65, 60, 105, 70, 110], { catch: 45, exp: 175, ab: ['early_bird'], cry: 'Bzzt-SHINE!', stage: 2, family: 'blinkeon',
    ls: [[1, 'neon_flash'], [1, 'night_drift'], [1, 'live_wire'], [30, 'shade_bite'], [38, 'thunder_coil']],
    dex: 'A neon-tube gown and a big sign crest. On a dark night you can read her name from three streets away.' });
  sp('cabriolet', 'Cabriolet', ['iron', 'gale'], [65, 85, 75, 55, 65, 105], { catch: 90, exp: 150, ab: ['run_away'], cry: 'Beep-beep!',
    ls: [[1, 'quick_dash'], [1, 'can_clank'], [8, 'gust_puff'], [14, 'coil_spring'], [20, 'glide_strike'], [27, 'gear_grind'], [34, 'propeller_cut']],
    dex: 'A taxi-cab Kigu with a chequered hat and a roof-lamp hood. She rushes everywhere, but she always stops to help.' });
  sp('obento', 'Obento', ['ember', 'fluff'], [55, 50, 50, 50, 50, 45], { catch: 190, exp: 60, ab: ['sweet_tooth'], cry: 'Bon-bon!', evo: [{ to: 'jubako', level: 20 }],
    ls: [[1, 'pounce'], [1, 'cinder'], [5, 'sweet_talk'], [10, 'share_bento'], [15, 'hot_lunch']],
    dex: 'A bento-box Kigu with rice-ball ears on her lid. She packs two lunches every day in case she meets somebody hungry.' });
  sp('jubako', 'Jubako', ['ember', 'fluff'], [85, 75, 75, 75, 75, 60], { catch: 75, exp: 160, ab: ['sweet_tooth'], cry: 'Bon-BON!', stage: 2, family: 'obento',
    ls: [[1, 'hot_lunch'], [1, 'share_bento'], [24, 'scorch_tail'], [30, 'cheek_crunch'], [36, 'foxfire_blast']],
    dex: 'Her lunch-box cape has a compartment for everything. She opens her folding fan to cool the rice before she shares it.' });

  // ---- Kite Hill
  sp('foldling', 'Foldling', ['gale'], [45, 50, 40, 45, 45, 75], { catch: 190, exp: 60, ab: ['keen_eye'], cry: 'Kami-kah!', evo: [{ to: 'tsurugami', level: 22, weather: 'sun' }],
    ls: [[1, 'gust_puff'], [1, 'tail_wag'], [5, 'pip_peck'], [10, 'paper_cut'], [16, 'feather_dance']],
    dex: 'A folded-paper crane Kigu with a kite-string tail. A good breeze lifts her right off the ground, and she loves it.' });
  sp('tsurugami', 'Tsurugami', ['gale', 'dream'], [70, 70, 60, 85, 75, 105], { catch: 60, exp: 165, ab: ['keen_eye'], cry: 'Kami-kaa~', stage: 2, family: 'foldling',
    ls: [[1, 'paper_cut'], [1, 'daydream'], [26, 'glide_strike'], [32, 'dream_wave']],
    dex: 'Fan-wings printed with paper patterns and a silver-foil crown. She folds a new crane for every friend she makes.' });
  sp('whirligig', 'Whirligig', ['iron', 'gale'], [50, 60, 55, 40, 45, 65], { catch: 190, exp: 62, ab: ['early_bird'], cry: 'Prrrop!', evo: [{ to: 'aviatrix', level: 24 }],
    ls: [[1, 'can_clank'], [1, 'gust_puff'], [6, 'quick_dash'], [11, 'coil_spring'], [17, 'prop_wash']],
    dex: 'A propeller cap, biplane goggles and a striped scarf. She is always ready to take off, even when there is nowhere to go.' });
  sp('aviatrix', 'Aviatrix', ['iron', 'gale'], [75, 90, 80, 60, 65, 95], { catch: 75, exp: 165, ab: ['early_bird'], cry: 'Vroom-vroom!', stage: 2, family: 'whirligig',
    ls: [[1, 'coil_spring'], [1, 'prop_wash'], [28, 'glide_strike'], [34, 'propeller_cut']],
    dex: 'A patched flight jacket and a twin-propeller headdress. She has flown over every hill in the region, twice.' });
  sp('flumble', 'Flumble', ['frost'], [55, 35, 50, 60, 65, 40], { catch: 120, exp: 64, ab: ['cuddly'], cry: 'Pit-pat.', evo: [{ to: 'cumulo', level: 24, weather: 'rain' }],
    ls: [[1, 'drizzle_chill'], [1, 'fluff_up'], [6, 'gust_puff'], [12, 'frost_puff'], [18, 'lullaby']],
    dex: 'A puffy cloud Kigu with raindrop tassels. She floats above the airfield on rainy days and hums along with the rain.' });
  sp('cumulo', 'Cumulo', ['frost', 'gale'], [85, 50, 75, 95, 95, 60], { catch: 60, exp: 165, ab: ['cuddly'], cry: 'Rumm-rumm.', stage: 2, family: 'flumble',
    ls: [[1, 'frost_puff'], [1, 'gust_puff'], [28, 'prop_wash'], [36, 'cloud_burst']],
    dex: 'A billowing cloud cape and a tiny rainbow on one shoulder. When she is sad it rains, so everyone tries to cheer her up.' });
})(typeof globalThis !== 'undefined' ? globalThis : window);
