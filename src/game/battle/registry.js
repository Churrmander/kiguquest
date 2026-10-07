/* NP.battleFx — the registry through which moves, abilities, held items, field moods, statuses, volatiles, side conditions and
 * field conditions attach battle behaviour WITHOUT editing the rules. Full reference: docs/battle-engine.md.
 *
 *   NP.battleFx.registerMove('uturn_like', { onTry(ctx) {...}, basePower(ctx, bp) {...}, onHit(ctx) {...}, ... })
 *   NP.battleFx.registerAbility('sturdy_soul', { name, desc, onDamage(ctx, amt) {...} })
 *   NP.battleFx.registerItem('sturdy_sash', { name, pocket:'items', price, desc, held: { onDamage(ctx, amt) {...} } })
 *   NP.battleFx.registerMood('sun', { name, start, end, duration: 5, modDamage(ctx, dmg) {...}, residual(ctx) {...} })
 *   NP.battleFx.registerVolatile / registerStatus / registerSideCondition / registerFieldCondition
 *
 * Every registration MERGES over what exists (same id -> later files win), so data files and effect files can both contribute.
 * Hook names are validated against NP.battleFx.hooks; a typo warns (or throws when NP.battleFx.strict is true, as in tests).
 */
(function (root) {
  'use strict';
  const NP = (root.NP = root.NP || {});
  const B = (NP.Battle = NP.Battle || {});
  B.COND = B.COND || { status: {}, volatile: {}, side: {}, weather: {}, field: {} };
  const FX = (NP.battleFx = NP.battleFx || {});

  FX.version = 2;
  FX.strict = false;
  FX.moves = FX.moves || {};

  /** Every recognised holder hook (abilities, held items, statuses, volatiles, side/field conditions, moods). */
  FX.hooks = {
    // --- entering / leaving / ending
    onSwitchIn: 'holder entered the field (ctx.initial = battle start)',
    onFoeSwitchIn: 'an opposing Kigu entered (ctx.foe)',
    onSwitchOut: 'holder is about to leave the field',
    onFaint: 'holder fainted (ctx.source, ctx.move)',
    onSourceKO: 'holder knocked out ctx.target',
    onBattleEnd: 'battle over',
    onResidual: 'end of turn (ordered by def.residualOrder)',
    onUpdate: 'after the holder\'s HP/status/item changed (berries)',
    onHazard: 'return false to ignore an entry hazard (ctx.kind)',
    onMoodDamage: 'return false to ignore mood residual damage (ctx.mood)',
    // --- choosing / ordering
    modPriority: 'chain: move priority (ctx.move)',
    modBracket: 'chain: order inside a priority bracket, higher first (ctx.move)',
    modSpeed: 'chain: effective speed',
    onBeforeMove: 'return false to stop the move (ctx.move); def.beforeMoveOrder sorts',
    // --- accuracy / crits
    modAccuracy: 'chain: accuracy of the holder\'s own move (ctx.move, ctx.target)',
    modAccuracyAgainst: 'chain: accuracy of a move aimed at the holder (ctx.move, ctx.user)',
    modCritStage: 'chain: crit stage of the holder\'s move',
    blocksCrit: 'return true: moves aimed at the holder cannot crit',
    // --- damage
    modBasePower: 'chain: base power of the holder\'s move (ctx.move, ctx.target)',
    modPower: 'alias of modBasePower (older name)',
    modMoveType: 'chain: change the type of the holder\'s move',
    modAttackStat: 'chain: attacker\'s stat (ctx.stat atk|spa)',
    modDefenseStat: 'chain: defender\'s stat (ctx.stat def|spd)',
    modStab: 'chain: STAB multiplier (1.5)',
    modDamage: 'chain: final damage dealt by the holder (ctx.eff, ctx.crit, ctx.move)',
    modIncomingDamage: 'chain: final damage taken by the holder (ctx.eff, ctx.crit, ctx.move)',
    onDamage: 'chain: any damage about to be applied to the holder (ctx.cause, ctx.source, ctx.move)',
    onTryHit: 'holder is targeted: return false to block/absorb (ctx.user, ctx.move, ctx.eff)',
    onDamagingHit: 'holder was damaged by a move (ctx.user, ctx.move, ctx.damage, ctx.contact)',
    onAfterMoveSelf: 'holder finished using a move (ctx.move, ctx.totalDamage, ctx.targets)',
    modMultiHits: 'chain: number of hits of a multi-hit move',
    modRecoil: 'chain: recoil the holder takes',
    modDrain: 'chain: HP the holder drains',
    modSecondaryChance: 'chain: % chance of the holder\'s secondary effects',
    blocksSecondary: 'return true: secondary effects of moves aimed at the holder are ignored',
    modPPCost: 'chain (on the target): PP the attacker spends (Pressure-like)',
    // --- statuses / boosts / volatiles
    onSetStatus: 'return false to refuse a status (ctx.status, ctx.source)',
    onAfterSetStatus: 'holder got a status',
    onTryAddVolatile: 'return false to refuse a volatile (ctx.id)',
    onTryBoost: 'chain: stat changes about to apply ({atk:-1,...}); return the new object',
    onAfterBoost: 'holder\'s stats changed',
    modSleepDecrement: 'chain: sleep counter decrement per attempt (Early Bird -> 2)',
    onForceSwitch: 'return false: holder cannot be forced out',
  };
  // allowed non-hook keys (data fields / flags) are not validated; only on*/mod*/blocks* functions are.
  const HOOKISH = /^(on|mod|blocks)[A-Z]/;
  const EXTRA_OK = {
    // move handler names
    onTry: 1, basePower: 1, onHit: 1, onAfterMove: 1, onMiss: 1, onPrepare: 1, onCharge: 1, damageCallback: 1, skipCharge: 1, onModifyMove: 1,
    healAmount: 1, onHitField: 1, onHitSide: 1, onFail: 1,
    // condition (mood/side/field/volatile) definition callbacks
    onStart: 1, onEnd: 1, onRestart: 1, onResidualAll: 1, canAdd: 1,
    // held item extras
    onEat: 1, onEatSelf: 1,
  };

  function check(kind, id, def) {
    if (!def || typeof def !== 'object') throw new Error('battleFx.' + kind + ' ' + id + ': definition must be an object');
    for (const k of Object.keys(def)) {
      if (typeof def[k] !== 'function' || !HOOKISH.test(k)) continue;
      if (FX.hooks[k] || EXTRA_OK[k]) continue;
      const msg = 'battleFx: ' + kind + ' "' + id + '" has unknown hook "' + k + '" (see NP.battleFx.hooks / docs/battle-engine.md)';
      if (FX.strict) throw new Error(msg);
      if (typeof console !== 'undefined') console.warn(msg);
    }
  }
  function merge(table, id, def, base) {
    table[id] = Object.assign(table[id] || Object.assign({ id }, base || {}), def, { id });
    return table[id];
  }
  const cond = (tbl) => (id, def) => { check(tbl, id, def); return merge(B.COND[tbl], id, def); };

  FX.registerMove = function (id, handlers) {
    if (!NP.data.moves[id]) throw new Error('battleFx.registerMove: unknown move "' + id + '" (define it in src/data/moves*.js first)');
    check('move', id, handlers);
    FX.moves[id] = Object.assign(FX.moves[id] || {}, handlers);
    return FX.moves[id];
  };
  FX.registerAbility = function (id, def) {
    check('ability', id, def);
    return merge(NP.data.abilities, id, def, { name: def.name || id, desc: '' });
  };
  FX.registerItem = function (id, def) {
    check('item.held', id, def.held || {});
    return merge(NP.data.items, id, def, { name: def.name || id, pocket: 'items', price: 0, desc: '', use: null, inBattle: false, inField: false });
  };
  FX.registerMood = cond('weather');            // "mood" == weather: B.COND.weather
  FX.registerStatus = cond('status');
  FX.registerVolatile = cond('volatile');
  FX.registerSideCondition = cond('side');
  FX.registerFieldCondition = cond('field');

  /** handlers registered for a move (never undefined) */
  FX.moveFx = (id) => FX.moves[id] || EMPTY;
  const EMPTY = Object.freeze({});
  B.moveFx = FX.moveFx;
})(typeof globalThis !== 'undefined' ? globalThis : window);
