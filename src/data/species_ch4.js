/* Species for Chapter 4: the Pebble line (BIBLE §3 #30-32) and the Route 4 / Dust Bowl / Bobbin Quarry Kigu from the 151 roster
 * notes (#59-75). Same shape as species.js. Special evolutions use the kigu.js conditions: bond, time, move, weather, held. */
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

  // ---- Pebble line: the quarry herd
  sp('pebblump', 'Pebblump', ['pebble'], [50, 60, 80, 30, 45, 25], { catch: 190, exp: 60, ab: ['sturdy_soul'], cry: 'Tok-tok!', evo: [{ to: 'bouldame', level: 25 }],
    ls: [[1, 'pounce'], [1, 'fluff_up'], [5, 'pebble_toss'], [9, 'dust_up'], [13, 'gravel_spray'], [17, 'rock_roll'], [22, 'stone_wall']],
    dex: 'A stoic little Kigu in a pebble-patterned onesie. Pebblump live in herds and follow the biggest one.' });
  sp('bouldame', 'Bouldame', ['pebble'], [75, 90, 110, 45, 65, 40], { catch: 90, exp: 140, ab: ['sturdy_soul'], cry: 'Bould-ah!', stage: 2, family: 'pebblump',
    evo: [{ to: 'craggoth', level: 40 }],
    ls: [[1, 'pounce'], [1, 'pebble_toss'], [1, 'rock_roll'], [17, 'rock_roll'], [22, 'stone_wall'], [28, 'earth_thump'], [34, 'slab_slam']],
    dex: 'Wild Pebblump herds always follow a Bouldame. She wears boulder shoulder-guards, and once she plants her feet, nobody gets past her.' });
  sp('craggoth', 'Craggoth', ['pebble', 'terra'], [95, 120, 135, 60, 80, 45], { catch: 45, exp: 240, ab: ['sturdy_soul'], cry: 'Craaag!', stage: 3, family: 'pebblump',
    ls: [[1, 'pebble_toss'], [1, 'rock_roll'], [1, 'slab_slam'], [40, 'quarry_quake'], [46, 'crystal_glint']],
    dex: 'A goth queen of the crags in an obsidian gown and a crown of black jet. She rules the quarry from its darkest ledge, and she doesn\'t smile for anyone.' });

  // ---- Route 4 and the Dust Bowl
  sp('dunehop', 'Dunehop', ['terra'], [40, 55, 40, 35, 40, 80], { catch: 200, exp: 56, ab: ['run_away'], cry: 'Jib-jib!', evo: [{ to: 'jerbix', level: 20 }],
    ls: [[1, 'pounce'], [1, 'tail_wag'], [5, 'sand_scoop'], [9, 'quick_dash'], [13, 'burrow_hop'], [17, 'dust_up']],
    dex: 'A jerboa Kigu with oversized hind-foot socks. She bounces so high that her goggles never stay on.' });
  sp('jerbix', 'Jerbix', ['terra'], [65, 80, 60, 50, 60, 105], { catch: 90, exp: 150, ab: ['run_away'], cry: 'Jib-ta-jib!', stage: 2, family: 'dunehop',
    ls: [[1, 'pounce'], [1, 'burrow_hop'], [1, 'sand_scoop'], [24, 'mud_shot'], [30, 'quarry_quake']],
    dex: 'She wears a fringed tent-canvas skirt and a tiny hand-drum, and she dances when she walks.' });
  sp('tumbleyarn', 'Tumbleyarn', ['gale'], [45, 50, 45, 55, 45, 70], { catch: 60, exp: 70, ab: ['keen_eye'], cry: 'Rrr-rrr!', evo: [{ to: 'tumbora', level: 18, weather: 'dust' }],
    ls: [[1, 'gust_puff'], [1, 'tail_wag'], [6, 'pip_peck'], [10, 'tumble_rush'], [15, 'feather_dance']],
    dex: 'A rolling tumbleweed made of yarn ends, one from every old scarf she has found. She only comes out in a dust storm.' });
  sp('tumbora', 'Tumbora', ['gale'], [70, 80, 65, 80, 65, 95], { catch: 60, exp: 165, ab: ['keen_eye'], cry: 'Rrr-HAA!', stage: 2, family: 'tumbleyarn',
    ls: [[1, 'gust_puff'], [1, 'tumble_rush'], [24, 'wing_flutter'], [32, 'glide_strike']],
    dex: 'She carries a striped parasol like a flag. It started as shade and became her whole personality.' });
  sp('stingle', 'Stingle', ['nettle'], [45, 65, 60, 30, 45, 55], { catch: 120, exp: 64, ab: ['shed_skin'], cry: 'Skit-skit!', evo: [{ to: 'lanternid', level: 24, time: 'night' }],
    ls: [[1, 'pounce'], [1, 'tail_wag'], [6, 'tail_sting'], [12, 'dust_up'], [18, 'night_pinch']],
    dex: 'Her scorpion tail ends in a soft tassel. She hides under rocks until she decides she likes you.' });
  sp('lanternid', 'Lanternid', ['nettle', 'shade'], [70, 95, 85, 45, 65, 80], { catch: 60, exp: 165, ab: ['shed_skin'], cry: 'Sshh-skit.', stage: 2, family: 'stingle',
    ls: [[1, 'tail_sting'], [1, 'night_pinch'], [28, 'sly_nip'], [34, 'drill_pick']],
    dex: 'She carries a little lantern on her tail so she can find her way home in the dark.' });
  sp('pricklepot', 'Pricklepot', ['sprout', 'nettle'], [55, 55, 60, 45, 55, 30], { catch: 190, exp: 60, ab: ['chlorophyll'], cry: 'Tsi-tsi!', evo: [{ to: 'saguarose', level: 1, move: 'needle_hug' }],
    ls: [[1, 'vine_snip'], [1, 'fluff_up'], [6, 'sip_sap'], [11, 'leaf_flick'], [17, 'needle_hug']],
    dex: 'A cactus Kigu with pot-shaped feet. She is gentle, and she always says sorry when somebody touches her spikes.' });
  sp('saguarose', 'Saguarose', ['sprout', 'nettle'], [80, 80, 85, 75, 80, 45], { catch: 75, exp: 160, ab: ['chlorophyll'], cry: 'Tsi-TSA!', stage: 2, family: 'pricklepot',
    ls: [[1, 'needle_hug'], [1, 'leaf_flick'], [24, 'sap_drain'], [32, 'petal_storm']],
    dex: 'Her blossom crown opens fully once she trusts you enough to hug you, spikes and all.' });
  sp('sandkit', 'Sandkit', ['ember'], [40, 45, 40, 60, 50, 70], { catch: 150, exp: 62, ab: ['early_bird'], cry: 'Kit-kit!', evo: [{ to: 'sandoa', level: 1, bond: 220 }],
    ls: [[1, 'pounce'], [1, 'sweet_talk'], [5, 'cinder'], [10, 'quick_dash'], [16, 'heat_haze']],
    dex: 'A fennec-fox Kigu with ears bigger than her head. She dozes in the heat of the day and wakes up at sunset.' });
  sp('sandoa', 'Sandoa', ['ember', 'fluff'], [70, 60, 65, 90, 80, 90], { catch: 60, exp: 170, ab: ['early_bird'], cry: 'Fwoo-ah~', stage: 2, family: 'sandkit',
    ls: [[1, 'cinder'], [1, 'heat_haze'], [24, 'snack_time'], [32, 'foxfire_blast']],
    dex: 'A well-travelled Kigu with a woven desert scarf. She carries dried herbs in case someone needs looking after.' });

  // ---- Bobbin Quarry
  sp('tortile', 'Tortile', ['pebble'], [55, 50, 85, 35, 55, 20], { catch: 190, exp: 62, ab: ['sturdy_soul'], cry: 'Klak!', evo: [{ to: 'mossgable', level: 26 }],
    ls: [[1, 'pounce'], [1, 'fluff_up'], [6, 'pebble_toss'], [11, 'dig_in'], [17, 'rock_roll']],
    dex: 'A tortoise Kigu whose shell is a patchwork of slate tiles. She is calm, steady and never in a hurry.' });
  sp('mossgable', 'Mossgable', ['pebble', 'terra'], [80, 75, 115, 50, 80, 30], { catch: 75, exp: 165, ab: ['sturdy_soul'], cry: 'Klak-KLANG!', stage: 2, family: 'tortile',
    ls: [[1, 'pebble_toss'], [1, 'dig_in'], [1, 'rock_roll'], [30, 'earth_thump'], [36, 'slab_slam']],
    dex: 'Moss grows on her slate-roof cape. She carries a chisel-brush and tidies up any loose stone she passes.' });
  sp('rockabye', 'Rockabye', ['pebble', 'dream'], [45, 40, 70, 60, 70, 30], { catch: 120, exp: 66, ab: ['sturdy_soul'], cry: 'Plink-plink!', evo: [{ to: 'geodrusa', level: 25 }],
    ls: [[1, 'pebble_toss'], [1, 'lullaby'], [7, 'daydream'], [13, 'gravel_spray'], [19, 'crystal_glint']],
    dex: 'Rough and grey on the outside, violet crystal on the inside. She lets you see the inside once she trusts you.' });
  sp('geodrusa', 'Geodrusa', ['pebble', 'dream'], [65, 55, 95, 85, 95, 40], { catch: 75, exp: 150, ab: ['sturdy_soul'], cry: 'Plin-pluu!', stage: 2, family: 'rockabye',
    evo: [{ to: 'amethystar', level: 32, held: 'starlit_thread' }],
    ls: [[1, 'crystal_glint'], [1, 'daydream'], [28, 'stone_wall'], [34, 'dream_wave']],
    dex: 'A crown of violet spikes and a glowing patch on her chest. She hums when she is thinking.' });
  sp('amethystar', 'Amethystar', ['pebble', 'dream'], [85, 65, 115, 110, 115, 50], { catch: 45, exp: 230, ab: ['sturdy_soul'], cry: 'Pluu-ra-ling!', stage: 3, family: 'rockabye',
    ls: [[1, 'crystal_glint'], [1, 'dream_wave'], [40, 'stone_wall']],
    dex: 'A full geode gown and a halo of crystal. Little glints follow her wherever she goes.' });
  sp('chiseltail', 'Chiseltail', ['terra'], [45, 60, 45, 30, 40, 65], { catch: 200, exp: 56, ab: ['pickup'], cry: 'Chip-chip!', evo: [{ to: 'quarrel', level: 1, bond: 220 }],
    ls: [[1, 'pounce'], [1, 'tail_wag'], [5, 'sand_scoop'], [9, 'pebble_toss'], [14, 'burrow_hop'], [19, 'cheek_crunch']],
    dex: 'Her cheek pads are always full of pebbles. She trades them for snacks and thinks it is a fair deal.' });
  sp('quarrel', 'Quarrel', ['terra', 'brawl'], [70, 95, 70, 40, 60, 85], { catch: 75, exp: 160, ab: ['pickup'], cry: 'CHIP-chip!', stage: 2, family: 'chiseltail',
    ls: [[1, 'burrow_hop'], [1, 'mitt_punch'], [24, 'cheek_crunch'], [30, 'quarry_quake']],
    dex: 'A quarry worker through and through: an apron full of pockets, knitted boxing mitts and a grin that never leaves.' });
})(typeof globalThis !== 'undefined' ? globalThis : window);
