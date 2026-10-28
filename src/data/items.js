/* Items (Phase 1 subset).
 * { id, name, pocket:'items'|'spools'|'key', price, desc, use:{ hp, hpPct, cure:[..]|'all', revive, pp, level, spool:{ball}, repel, escape },
 *   inBattle:bool, inField:bool, held:{...battle hooks} } */
(function (root) {
  'use strict';
  const NP = (root.NP = root.NP || {});
  const it = (NP.data.items = NP.data.items || {});

  function I(id, name, pocket, price, desc, use, x) {
    NP.reg(it, id, Object.assign({ name, pocket, price, desc, use: use || null, inBattle: false, inField: false }, x || {}));
  }
  const B = { inBattle: true }, F = { inField: true }, BF = { inBattle: true, inField: true };

  I('bond_spool', 'Bond Spool', 'spools', 200, 'Offer it to a wild Kigu. She may accept.', { spool: { ball: 1, kind: 'bond' } }, B);
  I('silk_spool', 'Silk Spool', 'spools', 600, 'A better spool. Higher chance.', { spool: { ball: 1.5, kind: 'silk' } }, B);
  I('gold_spool', 'Gold Spool', 'spools', 1200, 'A very good spool.', { spool: { ball: 2, kind: 'gold' } }, B);
  I('master_spool', 'Master Spool', 'spools', 0, 'Never fails.', { spool: { ball: 255, kind: 'master' } }, B);

  I('snack_cake', 'Snack Cake', 'items', 100, 'Restores 20 HP.', { hp: 20 }, BF);
  I('fancy_cake', 'Fancy Cake', 'items', 300, 'Restores 60 HP.', { hp: 60 }, BF);
  I('grand_cake', 'Grand Cake', 'items', 700, 'Restores 200 HP.', { hp: 200 }, BF);
  I('revive_tea', 'Revive Tea', 'items', 1500, 'Wakes a sleepy Kigu with half HP.', { revive: 0.5 }, BF);
  I('aloe_balm', 'Aloe Balm', 'items', 100, 'Heals a burn.', { cure: ['brn'] }, BF);
  I('mint_tea', 'Mint Tea', 'items', 100, 'Cures poison.', { cure: ['psn', 'tox'] }, BF);
  I('wake_bell', 'Wake Bell', 'items', 100, 'Wakes a sleeping Kigu.', { cure: ['slp'] }, BF);
  I('thaw_pad', 'Thaw Pad', 'items', 100, 'Thaws a frozen Kigu.', { cure: ['frz'] }, BF);
  I('numb_away', 'Numb Away', 'items', 200, 'Cures paralysis.', { cure: ['par'] }, BF);
  I('all_cure', 'All-Cure', 'items', 250, 'Cures any status.', { cure: 'all' }, BF);
  I('honey_jar', 'Hemline Honey', 'items', 250, 'Bryn\'s bees made it. Restores 50 HP.', { hp: 50 }, BF);
  I('sugar_cube', 'Sugar Cube', 'items', 500, 'Restores 10 PP to one move.', { pp: 10 }, BF);
  I('wish_candy', 'Wish Candy', 'items', 0, 'Raises a Kigu one level.', { level: 1 }, F);
  I('scent_spray', 'Scent Spray', 'items', 350, 'Keeps wild Kigu away for 100 steps.', { repel: 100 }, F);
  I('thread_ball', 'Thread Ball', 'items', 550, 'Escape from a cave or building.', { escape: true }, F);
  I('plum_treat', 'Plum Treat', 'items', 200, 'Held: restores 10 HP when low.', null, {
    held: { onUpdate(c) { const m = c.holder; if (m.hp > 0 && m.hp * 2 <= m.maxhp) { c.battle.msg(m.name + ' ate its Plum Treat!'); c.battle.heal(m, 10, { cause: 'item' }); c.battle.consumeItem(m); } } },
  });
  I('snack_bag', 'Snack Bag', 'items', 0, 'Held: restores a little HP every turn.', null, {
    held: { onResidual(c) { const m = c.holder; if (m.hp > 0 && m.hp < m.maxhp) { c.battle.msg(m.name + ' nibbled from its Snack Bag.'); c.battle.heal(m, Math.max(1, Math.floor(m.maxhp / 16)), { cause: 'item' }); } } },
  });

  // Poppy's ace holds it in Thimble (name approved by the owner 2026-10-28)
  I('lucky_thimble', 'Lucky Thimble', 'items', 0, 'Held: A lucky brass thimble. When its holder uses a move that hits two to five times, it always hits four or five times.', null, {
    held: { modMultiHits(c, n) { return c.move && c.move.multi && c.move.multi[0] <= 2 && c.move.multi[1] >= 5 ? (c.battle.rand(2) ? 5 : 4) : undefined; } },
  });

  I('sketchbook', 'Sketchbook', 'key', 0, 'Records the Kigu you meet.');
  I('tailor_license', 'Tailor License', 'key', 0, 'Proof that you are an apprentice Tailor.');
  I('button_case', 'Button Case', 'key', 0, 'Holds the Buttons you earn.');
  I('town_map', 'Town Map', 'key', 0, 'A map of Tsumugi.');
  I('exp_share', 'Exp Share', 'key', 0, 'Kigu who sit out a battle still get half its Exp. Points. Use it to switch it on or off.', { toggle: 'exp_share_off' }, F);
  I('flying_goggles', 'Flying Goggles', 'key', 0, 'A pair of flying goggles with brass rims. The wind snatched them off someone at Kite Hill.');
  I('cactus_needles', 'Cactus Needles', 'key', 0, 'Spines that wild Pricklepot shed in the Sun Flats. The weavers of Canvas Rest sew with them.');
  I('desert_herbs', 'Desert Herbs', 'key', 0, 'A bunch of silver-leaf herbs from the spring in the Sun Flats. They help a fever come down.');
  I('field_journal', 'Field Journal', 'key', 0, 'A researcher\'s notebook, full of sketches of desert Kigu. A Dunehop has nibbled one corner.');
  I('cream_thread', 'Cream Thread', 'key', 0, "A spool of Poppy's cream cotton. A good seam begins with good thread.");
  I('d_handkerchief', "'D' Handkerchief", 'key', 0, "Hand-stitched, with a tidy 'D' in the corner. Every hem is knotted twice.");
  I('disc_snip', 'Disc: Snip', 'key', 0, 'Lets your Kigu snip small bushes. Face one and press A.');
  I('disc_paddle', 'Disc: Paddle', 'key', 0, 'Lets your Kigu paddle across calm water. Face the water and press A.');
  I('everspool_silk', 'Everspool Silk', 'key', 0, 'A length of golden-green silk from the Everspool. It never frays and never runs out.');
  I('staff_pass', 'Staff Pass', 'key', 0, 'A white card stamped CRISP & CO. STAFF. Opens doors marked Staff Only.');
  // ---- Chapter 4 (Route 4, the Dust Bowl, Bobbin Quarry)
  I('dune_cocoa', 'Dune Cocoa', 'items', 300, 'Cocoa with cinnamon, from the tent camp. Restores 50 HP and wakes a sleepy Kigu.', { hp: 50, cure: ['slp'] }, BF);
  I('starlit_thread', 'Starlit Thread', 'items', 0, 'Held: a thread that glitters like a geode. A certain crystal Kigu loves it.');
  I('dust_scarf', 'Dust Scarf', 'key', 0, "Mimi sewed it from tent-cloth. It keeps the grit out of your eyes in a dust storm.");
  I('slab_order', 'Slab Order', 'key', 0, "A Society order form for forty flat slabs. 'Deliver north to the Works. Pressing stone. Grade A.'");
  I('spare_tape', "Bobbin's Tape Measure", 'key', 0, "Gusset's kept it for years. 'Tell her it's hers, and tell her I said so.'");
  I('quarry_maps', 'Quarry Maps', 'key', 0, 'Every cart tunnel in Bobbin Quarry, drawn by hand. The drawing is bad, but the map is good.');
  I('linen_thread', 'Linen Thread', 'key', 0, "A hank of Gusset's sand-coloured linen. It's rough, and it's very hard to break.");
  I('disc_shove', 'Disc: Shove', 'key', 0, 'Lets your Kigu shove big loose rocks. Walk into one and keep pushing.');
  // ---- Chapters 5 and 6 (Shibuyarn, the Spark Cellar, Kite Hill). Charms: held, +20% to one type's moves; Volt and Dusk Charms
  //      are also what Boingo and Blinkeon hold to evolve (kigu.js `held`).
  const charm = (type) => ({ held: { modPower(c, p) { return c.move && c.move.type === type ? Math.floor(p * 1.2) : undefined; } } });
  I('sun_charm', 'Sun Charm', 'items', 0, 'Held: a warm brass charm. Powers up Ember moves.', null, charm('ember'));
  I('volt_charm', 'Volt Charm', 'items', 0, 'Held: it crackles faintly. Powers up Volt moves, and a certain springy Kigu loves it.', null, charm('volt'));
  I('dusk_charm', 'Dusk Charm', 'items', 2000, 'Held: it glows violet at sundown. Powers up Shade moves, and a certain neon Kigu loves it.', null, charm('shade'));
  I('float_balloon', 'Float Balloon', 'items', 0, 'Held: a tiny patched balloon. The holder floats over Terra moves until hit.');
  I('onigiri', 'Onigiri', 'items', 150, 'A rice ball from the konbini. Restores 30 HP.', { hp: 30 }, BF);
  I('rinse_salts', 'Rinse Salts', 'key', 0, "Mrs. Kasuri's soap salts. Mimi says they make a Soft Rinse much stronger.");
  I('disc_glide', 'Disc: Glide', 'key', 0, 'Lets your Kigu glide on the wind. Dart says the rest is a surprise.');
  I('post_letters', 'Balloon Post Letters', 'key', 0, 'Letters stuck at the Kite Hill post office while the balloons are grounded.');
  I('balloon_patches', 'Balloon Patches', 'key', 0, "Mismatched patches for Dart's balloon, from all over Kite Hill.");
  I('zip_cable', 'Zip Cable', 'key', 0, "A coil of yellow cable Zip pressed into your hand. 'For a rainy day. Or a rainy Salon.'");
})(typeof globalThis !== 'undefined' ? globalThis : window);
