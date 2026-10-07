/* Abilities (Phase 1 subset). Hooks are called by the battle rules as fn.call(def, ctx, value):
 *   modPower(ctx, power)      ctx.move, ctx.target — attacker's ability adjusts base power
 *   levitates:true            ignores grounded hazards; run_away etc. are flags checked by the rules.  */
(function (root) {
  'use strict';
  const NP = (root.NP = root.NP || {});
  const ab = (NP.data.abilities = NP.data.abilities || {});

  function pinch(id, name, type, desc) {
    NP.reg(ab, id, {
      name, desc,
      modPower(c, p) {
        const m = c.holder;
        return c.move && c.move.type === type && m.hp * 3 <= m.maxhp ? Math.floor(p * 1.5) : undefined;
      },
    });
  }
  pinch('blaze', 'Blaze', 'ember', 'Boosts Ember moves when HP is low.');
  pinch('torrent', 'Torrent', 'tide', 'Boosts Tide moves when HP is low.');
  pinch('overgrow', 'Overgrow', 'sprout', 'Boosts Sprout moves when HP is low.');
  pinch('swarm', 'Swarm', 'buzz', 'Boosts Buzz moves when HP is low.');
  NP.reg(ab, 'run_away', { name: 'Run Away', desc: 'Can always flee from wild Kigu.', alwaysRun: true });
  NP.reg(ab, 'keen_eye', { name: 'Keen Eye', desc: 'Accuracy cannot be lowered.', onTryBoost(c, b) { if (b && b.acc < 0 && c.source !== c.holder) { b = Object.assign({}, b); delete b.acc; return b; } } });
  NP.reg(ab, 'cuddly', { name: 'Cuddly', desc: 'Sometimes makes attackers relent.' });
  NP.reg(ab, 'early_bird', { name: 'Early Bird', desc: 'Wakes from sleep quickly.' });
  NP.reg(ab, 'sweet_tooth', { name: 'Sweet Tooth', desc: 'Loves snacks.' });
  NP.reg(ab, 'pickup', { name: 'Pickup', desc: 'May pick up items.' });
  NP.reg(ab, 'sturdy_soul', { name: 'Sturdy Soul', desc: 'Stubborn and tough.' });
  NP.reg(ab, 'shed_skin', {
    name: 'Shed Skin', desc: 'May shed a status condition each turn.',
    onResidual(c) { const m = c.holder; if (m.status && c.battle.rand(3) === 0) c.battle.cureStatus(m); },
  });
  NP.reg(ab, 'compound_eyes', { name: 'Compound Eyes', desc: 'Raises accuracy.', modAccuracy(c, a) { return Math.floor(a * 1.3); } });
  NP.reg(ab, 'tinted_glass', { name: 'Tinted Glass', desc: 'Tough to spot.' });
  NP.reg(ab, 'chlorophyll', { name: 'Chlorophyll', desc: 'Bright in the sun.' });
})(typeof globalThis !== 'undefined' ? globalThis : window);
