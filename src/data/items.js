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
  I('sugar_cube', 'Sugar Cube', 'items', 0, 'Restores 10 PP to one move.', { pp: 10 }, BF);
  I('wish_candy', 'Wish Candy', 'items', 0, 'Raises a Kigu one level.', { level: 1 }, F);
  I('scent_spray', 'Scent Spray', 'items', 350, 'Keeps wild Kigu away for 100 steps.', { repel: 100 }, F);
  I('thread_ball', 'Thread Ball', 'items', 550, 'Escape from a cave or building.', { escape: true }, F);
  I('plum_treat', 'Plum Treat', 'items', 200, 'Held: restores 10 HP when low.', null, {
    held: { onUpdate(c) { const m = c.holder; if (m.hp > 0 && m.hp * 2 <= m.maxhp) { c.battle.msg(m.name + ' ate its Plum Treat!'); c.battle.heal(m, 10, { cause: 'item' }); c.battle.consumeItem(m); } } },
  });
  I('snack_bag', 'Snack Bag', 'items', 0, 'Held: restores a little HP every turn.', null, {
    held: { onResidual(c) { const m = c.holder; if (m.hp > 0 && m.hp < m.maxhp) { c.battle.msg(m.name + ' nibbled from its Snack Bag.'); c.battle.heal(m, Math.max(1, Math.floor(m.maxhp / 16)), { cause: 'item' }); } } },
  });

  I('sketchbook', 'Sketchbook', 'key', 0, 'Records the Kigu you meet.');
  I('tailor_license', 'Tailor License', 'key', 0, 'Proof that you are an apprentice Tailor.');
  I('button_case', 'Button Case', 'key', 0, 'Holds the Buttons you earn.');
  I('town_map', 'Town Map', 'key', 0, 'A map of Tsumugi.');
  I('cream_thread', 'Cream Thread', 'key', 0, "A spool of Poppy's cream cotton. A good seam begins with good thread.");
  I('d_handkerchief', "'D' Handkerchief", 'key', 0, "Hand-stitched, with a tidy 'D' in the corner. Every hem is knotted twice.");
  I('disc_snip', 'Disc: Snip', 'key', 0, 'Teaches a Kigu to snip small trees.');
  I('disc_paddle', 'Disc: Paddle', 'key', 0, 'Teaches a Kigu to paddle over water.');
})(typeof globalThis !== 'undefined' ? globalThis : window);
