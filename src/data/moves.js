/* Moves (Phase 1 subset).
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
  const st = (id, chance) => ({ id, chance: chance === undefined ? 100 : chance });

  // --- Fluff
  M('pounce', 'Pounce', 'fluff', P, 40, 100, 35, null, 'A springy tackle.');
  M('paw_swipe', 'Paw Swipe', 'fluff', P, 40, 100, 35, null, 'Swipes with soft paws.');
  M('quick_dash', 'Quick Dash', 'fluff', P, 40, 100, 30, { priority: 1 }, 'Zips in first.');
  M('pillow_slam', 'Pillow Slam', 'fluff', P, 85, 100, 15, { status: st('par', 30) }, 'A big fluffy wallop.');
  M('cheek_crunch', 'Cheek Crunch', 'fluff', P, 80, 90, 15, { flinch: 10 }, 'Chomps with puffed cheeks.');
  M('flurry_swipe', 'Flurry Swipe', 'fluff', P, 18, 80, 15, { multi: [2, 5] }, 'A flurry of quick swipes.');
  M('sweet_talk', 'Sweet Talk', 'fluff', T, null, 100, 30, { boosts: { atk: -1 } }, 'Sweet words lower Attack.');
  M('tail_wag', 'Tail Wag', 'fluff', T, null, 100, 30, { boosts: { def: -1 } }, 'A distracting wag lowers Defense.');
  M('fluff_up', 'Fluff Up', 'fluff', T, null, null, 40, { target: 'self', boosts: { def: 1 } }, 'Puffs up to raise Defense.');
  M('pep_talk', 'Pep Talk', 'fluff', T, null, null, 20, { target: 'self', boosts: { atk: 2 } }, 'Sharply raises Attack.');
  M('lullaby', 'Lullaby', 'fluff', T, null, 55, 15, { status: st('slp') }, 'A song that may cause sleep.');
  M('snack_time', 'Snack Time', 'fluff', T, null, null, 10, { target: 'self', heal: 0.5 }, 'Restores half HP.');
  M('sprint', 'Sprint', 'fluff', T, null, null, 30, { target: 'self', boosts: { spe: 2 } }, 'Sharply raises Speed.');
  // --- Ember
  M('cinder', 'Cinder', 'ember', S, 40, 100, 25, { status: st('brn', 10) }, 'A small shower of sparks.');
  M('scorch_tail', 'Scorch Tail', 'ember', P, 70, 100, 15, { status: st('brn', 10) }, 'Whips a burning tail.');
  M('foxfire', 'Fox Fire', 'ember', T, null, 85, 15, { status: st('brn') }, 'A weird blue flame burns the foe.');
  M('foxfire_blast', 'Foxfire Blast', 'ember', S, 90, 100, 15, { status: st('brn', 10) }, 'A sweeping wave of fox-fire.');
  // --- Tide
  M('bubble_pop', 'Bubble Pop', 'tide', S, 40, 100, 30, null, 'Pops bubbles on the foe.');
  M('bubble_beam', 'Bubble Beam', 'tide', S, 65, 100, 20, { boosts: { spe: -1 }, boostChance: 10 }, 'May lower Speed.');
  M('aqua_dash', 'Aqua Dash', 'tide', P, 40, 100, 20, { priority: 1 }, 'A watery rush that strikes first.');
  M('shell_guard', 'Shell Guard', 'tide', T, null, null, 40, { target: 'self', boosts: { def: 1 } }, 'Hides behind the shell.');
  M('paddle_slap', 'Paddle Slap', 'tide', P, 60, 100, 25, null, 'Slaps with a big paddle.');
  M('tide_wave', 'Tide Wave', 'tide', S, 90, 100, 15, null, 'A crashing wave.');
  // --- Sprout
  M('vine_snip', 'Vine Snip', 'sprout', P, 45, 100, 25, null, 'Lashes with vines.');
  M('leaf_flick', 'Leaf Flick', 'sprout', P, 55, 95, 25, { crit: 1 }, 'Flicks sharp leaves. Crits often.');
  M('seed_sow', 'Seed Sow', 'sprout', T, null, 90, 10, { leech: true }, 'Plants a seed that saps HP.');
  M('nap_dust', 'Nap Dust', 'sprout', T, null, 75, 15, { status: st('slp') }, 'Sleepy dust.');
  M('numb_dust', 'Numb Dust', 'sprout', T, null, 75, 30, { status: st('par') }, 'Numbing dust.');
  M('spore_puff', 'Spore Puff', 'sprout', T, null, 75, 35, { status: st('psn') }, 'Poisonous spores.');
  M('sip_sap', 'Sip Sap', 'sprout', S, 20, 100, 25, { drain: 0.5 }, 'Drains a little HP.');
  M('sap_drain', 'Sap Drain', 'sprout', S, 40, 100, 15, { drain: 0.5 }, 'Drains HP.');
  M('sun_nap', 'Sun Nap', 'sprout', T, null, null, 5, { target: 'self', heal: 0.5 }, 'Basks to restore HP.');
  M('grow_up', 'Grow Up', 'sprout', T, null, null, 20, { target: 'self', boosts: { atk: 1, spa: 1 } }, 'Raises Attack and Sp. Atk.');
  M('petal_storm', 'Petal Storm', 'sprout', S, 90, 100, 15, null, 'A swirl of petals.');
  // --- Gale
  M('pip_peck', 'Pip Peck', 'gale', P, 35, 100, 35, null, 'A quick peck.');
  M('gust_puff', 'Gust Puff', 'gale', S, 40, 100, 35, null, 'A puff of wind.');
  M('wing_flutter', 'Wing Flutter', 'gale', P, 60, 100, 35, null, 'Beats its wings.');
  M('feather_dance', 'Feather Dance', 'gale', T, null, 100, 15, { boosts: { atk: -2 } }, 'Sharply lowers Attack.');
  M('glide_strike', 'Glide Strike', 'gale', P, 70, 100, 20, null, 'Glides in for a strike.');
  // --- Buzz
  M('thread_shot', 'Thread Shot', 'buzz', T, null, 95, 40, { boosts: { spe: -1 } }, 'Sticky thread slows the foe.');
  M('stinger', 'Stinger', 'buzz', P, 35, 100, 35, null, 'A tiny sting.');
  M('nibble', 'Nibble', 'buzz', P, 60, 100, 20, null, 'Nibbles hard.');
  M('cocoon_up', 'Cocoon Up', 'buzz', T, null, null, 30, { target: 'self', boosts: { def: 1 } }, 'Raises Defense.');
  M('buzz_song', 'Buzz Song', 'buzz', S, 90, 100, 10, { boosts: { spd: -1 }, boostChance: 10 }, 'A droning tune.');
  M('sap_bite', 'Sap Bite', 'buzz', P, 80, 100, 10, { drain: 0.5 }, 'Bites and drains HP.');
  M('snip_cutter', 'Snip Cutter', 'buzz', P, 40, 95, 20, null, 'Snips with sharp scissors.');
  // --- Terra / Pebble / Iron
  M('dust_up', 'Dust Up', 'terra', T, null, 100, 15, { boosts: { acc: -1 } }, 'Kicks dust in the eyes.');
  M('mud_shot', 'Mud Shot', 'terra', S, 55, 95, 15, { boosts: { spe: -1 }, boostChance: 100 }, 'Slows the foe.');
  M('earth_thump', 'Earth Thump', 'terra', P, 60, 100, 20, { boosts: { spe: -1 }, boostChance: 100 }, 'A heavy stomp.');
  M('pebble_toss', 'Pebble Toss', 'pebble', P, 50, 90, 15, null, 'Tosses a pebble.');
  M('thimble_tap', 'Thimble Tap', 'iron', P, 50, 95, 30, null, 'Taps with a metal thimble.');
  M('drill_pick', 'Drill Pick', 'iron', P, 80, 100, 10, null, 'A drilling pick strike.');
  // --- misc types
  M('shadow_lick', 'Shadow Lick', 'spook', P, 30, 100, 30, { flinch: 30 }, 'A chilly lick.');
  M('phantom_tuck', 'Phantom Tuck', 'spook', S, null, 100, 15, { fixed: 'level' }, 'Damage equals the user\'s level.');
  M('sly_nip', 'Sly Nip', 'shade', P, 60, 100, 25, { flinch: 30 }, 'A sneaky nip.');
  M('mitt_punch', 'Mitt Punch', 'brawl', P, 40, 100, 30, null, 'A mittened punch.');
  M('daydream', 'Daydream', 'dream', S, 50, 100, 25, null, 'A drifting wave of thought.');
  M('dream_wave', 'Dream Wave', 'dream', S, 90, 100, 10, null, 'A strong psychic wave.');

  NP.reg(mv, 'struggle', { name: 'Struggle', type: '???', category: P, power: 50, acc: null, pp: 1, priority: 0, target: 'foe', recoilMax: 0.25, desc: 'Used when out of PP.' });
})(typeof globalThis !== 'undefined' ? globalThis : window);
