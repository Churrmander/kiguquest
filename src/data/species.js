/* Species (Phase 1 roster, BIBLE §3 #1-29). Adding a species = one sp(...) call.
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

  // ---- starters
  sp('konko', 'Konko', ['ember'], [45, 50, 43, 62, 50, 62], { growth: 'mediumSlow', catch: 45, exp: 62, ab: ['blaze'], cry: 'Kon!',
    evo: [{ to: 'kitsuri', level: 16 }], family: 'konko',
    ls: [[1, 'pounce'], [1, 'sweet_talk'], [4, 'cinder'], [8, 'quick_dash'], [12, 'foxfire'], [16, 'scorch_tail']],
    dex: 'A fox-costume girl whose tail tip burns like a candle. She glows warmer when she is happy.' });
  sp('kitsuri', 'Kitsuri', ['ember'], [65, 68, 58, 86, 68, 82], { growth: 'mediumSlow', catch: 45, exp: 142, ab: ['blaze'], cry: 'Kiin!', stage: 2, family: 'konko',
    evo: [{ to: 'kyuubelle', level: 36 }],
    ls: [[1, 'pounce'], [1, 'cinder'], [1, 'foxfire'], [8, 'quick_dash'], [16, 'scorch_tail'], [22, 'daydream'], [28, 'foxfire_blast'], [34, 'pillow_slam']],
    dex: 'Two flame-tipped tails and a tiny shrine bell. She rings it before she sets a fire.' });
  sp('kyuubelle', 'Kyuubelle', ['ember', 'dream'], [85, 85, 75, 115, 90, 100], { growth: 'mediumSlow', catch: 45, exp: 240, ab: ['blaze'], cry: 'Kyuu!', stage: 3, family: 'konko',
    ls: [[1, 'pounce'], [1, 'cinder'], [1, 'foxfire'], [16, 'scorch_tail'], [28, 'foxfire_blast'], [36, 'dream_wave'], [44, 'pillow_slam']],
    dex: 'Nine fanned tails and drifting blue fox-fire. Festival nights are her favourite.' });

  sp('ottopi', 'Ottopi', ['tide'], [55, 56, 50, 52, 48, 47], { growth: 'mediumSlow', catch: 45, exp: 62, ab: ['torrent'], cry: 'Pii!',
    evo: [{ to: 'ottelia', level: 17 }],
    ls: [[1, 'pounce'], [1, 'tail_wag'], [4, 'bubble_pop'], [8, 'shell_guard'], [12, 'aqua_dash'], [17, 'paddle_slap']],
    dex: 'A teal otter onesie with a pink shell hugged to her tummy. She cracks snacks on it.' });
  sp('ottelia', 'Ottelia', ['tide'], [75, 78, 68, 72, 66, 61], { growth: 'mediumSlow', catch: 45, exp: 142, ab: ['torrent'], cry: 'Piiru!', stage: 2, family: 'ottopi',
    evo: [{ to: 'ottomarine', level: 36 }],
    ls: [[1, 'pounce'], [1, 'bubble_pop'], [1, 'shell_guard'], [12, 'aqua_dash'], [17, 'paddle_slap'], [24, 'bubble_beam'], [32, 'tide_wave']],
    dex: 'Her yellow rain-poncho never gets wet, no matter how hard it pours.' });
  sp('ottomarine', 'Ottomarine', ['tide', 'brawl'], [95, 100, 88, 88, 80, 75], { growth: 'mediumSlow', catch: 45, exp: 240, ab: ['torrent'], cry: 'Piiraa!', stage: 3, family: 'ottopi',
    ls: [[1, 'pounce'], [1, 'bubble_pop'], [17, 'paddle_slap'], [32, 'tide_wave'], [36, 'mitt_punch'], [44, 'drill_pick']],
    dex: 'A captain in a big coat who commands the seas from her paddle tail.' });

  sp('sprubun', 'Sprubun', ['sprout'], [50, 48, 52, 60, 55, 45], { growth: 'mediumSlow', catch: 45, exp: 62, ab: ['overgrow'], cry: 'Pyu!',
    evo: [{ to: 'lapinlily', level: 17 }],
    ls: [[1, 'pounce'], [1, 'tail_wag'], [4, 'vine_snip'], [8, 'seed_sow'], [12, 'leaf_flick'], [17, 'sip_sap']],
    dex: 'A mint bunny onesie with a sprout growing between her ears. The sprout perks up in sunshine.' });
  sp('lapinlily', 'Lapinlily', ['sprout'], [70, 66, 68, 80, 72, 62], { growth: 'mediumSlow', catch: 45, exp: 142, ab: ['overgrow'], cry: 'Pyuri!', stage: 2, family: 'sprubun',
    evo: [{ to: 'lapinelle', level: 36 }],
    ls: [[1, 'pounce'], [1, 'vine_snip'], [1, 'seed_sow'], [12, 'leaf_flick'], [17, 'sip_sap'], [24, 'nap_dust'], [30, 'sap_drain'], [34, 'grow_up']],
    dex: 'A lily-petal hood and a pale-green braid. She hums to her garden every morning.' });
  sp('lapinelle', 'Lapinelle', ['sprout'], [90, 80, 86, 110, 92, 78], { growth: 'mediumSlow', catch: 45, exp: 240, ab: ['overgrow'], cry: 'Pyuraa!', stage: 3, family: 'sprubun',
    ls: [[1, 'vine_snip'], [1, 'seed_sow'], [17, 'sip_sap'], [30, 'sap_drain'], [36, 'petal_storm'], [44, 'sun_nap']],
    dex: 'Crowned in flowers, her ears flow like a blooming cape. Petals follow wherever she walks.' });

  // ---- Meadow Lane / Thimble
  sp('mittsy', 'Mittsy', ['fluff'], [48, 50, 40, 35, 40, 65], { catch: 190, exp: 55, ab: ['cuddly', 'run_away'], cry: 'Mya', evo: [{ to: 'meowvelle', level: 18 }],
    ls: [[1, 'paw_swipe'], [1, 'tail_wag'], [5, 'sweet_talk'], [9, 'quick_dash'], [13, 'flurry_swipe'], [18, 'pillow_slam']],
    dex: 'A sleepy kitten onesie with huge mitten paws. The bell on her hood rings when she naps.' });
  sp('meowvelle', 'Meowvelle', ['fluff'], [70, 74, 60, 58, 62, 100], { catch: 75, exp: 140, ab: ['cuddly', 'run_away'], cry: 'Meowl', stage: 2, family: 'mittsy',
    ls: [[1, 'paw_swipe'], [1, 'sweet_talk'], [9, 'quick_dash'], [13, 'flurry_swipe'], [18, 'pillow_slam'], [24, 'sly_nip'], [30, 'sprint']],
    dex: 'A dapper tuxedo cat with a little top hat. She tips it to everyone she meets.' });
  sp('nibbi', 'Nibbi', ['fluff'], [50, 48, 42, 30, 35, 60], { catch: 255, exp: 52, ab: ['run_away', 'pickup'], cry: 'Nom!', evo: [{ to: 'nibblenna', level: 15 }],
    ls: [[1, 'pounce'], [1, 'tail_wag'], [4, 'snack_time'], [7, 'quick_dash'], [11, 'cheek_crunch'], [15, 'flurry_swipe']],
    dex: 'Her cheeks are always puffed with seeds. Ask nicely and she might share.' });
  sp('nibblenna', 'Nibblenna', ['fluff'], [80, 75, 65, 50, 55, 90], { catch: 127, exp: 135, ab: ['run_away', 'pickup'], cry: 'Nomnom!', stage: 2, family: 'nibbi',
    ls: [[1, 'pounce'], [1, 'snack_time'], [7, 'quick_dash'], [11, 'cheek_crunch'], [15, 'flurry_swipe'], [22, 'pillow_slam'], [28, 'sprint']],
    dex: 'A baker hamster with a basket of warm buns. The buns are delicious, and so is the smell.' });
  sp('peepi', 'Peepi', ['fluff', 'gale'], [40, 45, 40, 35, 35, 56], { catch: 255, exp: 50, ab: ['keen_eye'], cry: 'Pip!', evo: [{ to: 'larkette', level: 14 }],
    ls: [[1, 'pip_peck'], [1, 'tail_wag'], [5, 'gust_puff'], [9, 'quick_dash'], [14, 'wing_flutter']],
    dex: 'A sparrow-chick onesie with wing sleeves. She practices flapping every sunrise.' });
  sp('larkette', 'Larkette', ['fluff', 'gale'], [62, 65, 55, 58, 55, 85], { catch: 120, exp: 122, ab: ['keen_eye'], cry: 'Lark!', stage: 2, family: 'peepi',
    evo: [{ to: 'larkessa', level: 32 }],
    ls: [[1, 'pip_peck'], [1, 'gust_puff'], [9, 'quick_dash'], [14, 'wing_flutter'], [20, 'feather_dance'], [26, 'glide_strike']],
    dex: 'A songbird with a feather-crest headband. Her songbook is full of tunes she wrote herself.' });
  sp('larkessa', 'Larkessa', ['fluff', 'gale'], [82, 90, 70, 78, 68, 100], { catch: 45, exp: 230, ab: ['keen_eye'], cry: 'Larkessa!', stage: 3, family: 'peepi',
    ls: [[1, 'pip_peck'], [14, 'wing_flutter'], [26, 'glide_strike'], [32, 'feather_dance'], [38, 'pillow_slam']],
    dex: 'An elegant lark with a long wing-cape. Her song can be heard across three towns.' });

  // ---- Gingham Woods / Seamstead
  sp('silkie', 'Silkie', ['buzz'], [40, 35, 45, 20, 30, 50], { catch: 255, exp: 40, ab: ['shed_skin'], cry: 'Sii', evo: [{ to: 'cocoona', level: 10 }],
    ls: [[1, 'thread_shot'], [1, 'stinger'], [5, 'cocoon_up']], dex: 'A fuzzy white silkworm onesie. She is almost always sleepy.' });
  sp('cocoona', 'Cocoona', ['buzz'], [55, 30, 75, 30, 55, 25], { catch: 120, exp: 72, ab: ['shed_skin'], cry: 'Coo', stage: 2, family: 'silkie', evo: [{ to: 'mothelia', level: 30 }],
    ls: [[1, 'cocoon_up'], [1, 'thread_shot'], [10, 'nibble'], [20, 'snip_cutter']], dex: 'Curled up in a pale-green cocoon bag with only her head and hands showing.' });
  sp('mothelia', 'Mothelia', ['buzz', 'gale'], [80, 70, 65, 100, 85, 75], { catch: 45, exp: 180, ab: ['compound_eyes'], cry: 'Moth', stage: 3, family: 'silkie',
    ls: [[1, 'gust_puff'], [1, 'nibble'], [30, 'buzz_song'], [36, 'daydream'], [42, 'glide_strike']], dex: 'Patterned moth wings shimmer with sparkling scales.' });
  sp('buzzlet', 'Buzzlet', ['buzz'], [45, 55, 40, 40, 45, 60], { catch: 255, exp: 52, ab: ['swarm'], cry: 'Bzz', evo: [{ to: 'honeybelle', level: 20 }],
    ls: [[1, 'stinger'], [1, 'tail_wag'], [6, 'thread_shot'], [10, 'nibble'], [16, 'sap_bite']], dex: 'A bee onesie with stripes and tiny antennae. Guards her honey pot fiercely.' });
  sp('honeybelle', 'Honeybelle', ['buzz', 'sprout'], [75, 90, 65, 75, 65, 95], { catch: 75, exp: 150, ab: ['swarm'], cry: 'Bzzbelle', stage: 2, family: 'buzzlet',
    ls: [[1, 'stinger'], [1, 'nibble'], [16, 'sap_bite'], [20, 'sap_drain'], [26, 'buzz_song']], dex: 'A honeycomb dress and a flower crown. She stirs honey with a dipper wand.' });
  sp('webbi', 'Webbi', ['buzz'], [45, 50, 42, 50, 42, 50], { catch: 190, exp: 55, ab: ['swarm'], cry: 'Wib', evo: [{ to: 'webelle', level: 22 }],
    ls: [[1, 'thread_shot'], [1, 'stinger'], [8, 'shadow_lick'], [14, 'nibble']], dex: 'A shy girl in a purple hoodie with four extra sleeves for knitting.' });
  sp('webelle', 'Webelle', ['buzz', 'spook'], [70, 75, 60, 90, 70, 65], { catch: 75, exp: 155, ab: ['swarm'], cry: 'Webelle', stage: 2, family: 'webbi',
    ls: [[1, 'thread_shot'], [1, 'shadow_lick'], [22, 'sap_bite'], [28, 'phantom_tuck']], dex: 'A lacy weaver with silver threads in her long black hair.' });
  sp('daisip', 'Daisip', ['sprout'], [45, 40, 48, 62, 55, 42], { catch: 255, exp: 50, ab: ['chlorophyll'], cry: 'Dai', evo: [{ to: 'daisia', level: 21 }],
    ls: [[1, 'vine_snip'], [1, 'sweet_talk'], [6, 'sip_sap'], [12, 'numb_dust'], [18, 'nap_dust']], dex: 'A white petal hood frames her sunny face.' });
  sp('daisia', 'Daisia', ['sprout'], [70, 60, 70, 95, 82, 60], { catch: 120, exp: 150, ab: ['chlorophyll'], cry: 'Daisia', stage: 2, family: 'daisip',
    ls: [[1, 'vine_snip'], [1, 'sip_sap'], [21, 'petal_storm'], [26, 'sun_nap']], dex: 'A bouquet dress and a halo of petals.' });
  sp('ribbi', 'Ribbi', ['tide'], [50, 52, 48, 52, 48, 58], { catch: 190, exp: 55, ab: ['torrent'], cry: 'Rib', evo: [{ to: 'ribbelle', level: 25 }],
    ls: [[1, 'pounce'], [1, 'bubble_pop'], [7, 'shell_guard'], [13, 'aqua_dash'], [19, 'bubble_beam']], dex: 'A green raincoat with big round eyes on the hood.' });
  sp('ribbelle', 'Ribbelle', ['tide', 'terra'], [80, 80, 78, 65, 75, 65], { catch: 75, exp: 160, ab: ['torrent'], cry: 'Ribelle', stage: 2, family: 'ribbi',
    ls: [[1, 'pounce'], [1, 'bubble_pop'], [25, 'mud_shot'], [31, 'tide_wave']], dex: 'Overalls, boots, and a wide rain hat. She loves puddles.' });
  sp('molli', 'Molli', ['terra'], [48, 60, 50, 30, 35, 45], { catch: 190, exp: 58, ab: ['sturdy_soul'], cry: 'Mol', evo: [{ to: 'molluna', level: 24 }],
    ls: [[1, 'pounce'], [1, 'dust_up'], [7, 'earth_thump'], [13, 'pebble_toss'], [19, 'mud_shot']], dex: 'A squinty mole onesie with giant digging mitts and goggles.' });
  sp('molluna', 'Molluna', ['terra', 'iron'], [78, 100, 80, 50, 60, 55], { catch: 75, exp: 165, ab: ['sturdy_soul'], cry: 'Molluna', stage: 2, family: 'molli',
    ls: [[1, 'pounce'], [1, 'earth_thump'], [24, 'thimble_tap'], [30, 'drill_pick']], dex: 'A miner with a lamp on her hard hat and a drill-pick in hand.' });

  // evolution "on-evolve" moves none; sanity: every evo target exists is checked in tests.
})(typeof globalThis !== 'undefined' ? globalThis : window);
