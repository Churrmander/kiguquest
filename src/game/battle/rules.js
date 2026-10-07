/* Battle rules — move lookup, conditions (statuses/volatiles), accuracy, damage, move effects.
 * Extends NP.Battle (core.js). Logic only: everything the player should see becomes events on battle.log:
 *   {t:'move',who,move}  {t:'miss',who}  {t:'hit',who,eff,crit}  plus core's hp/boost/status/faint/msg. */
(function (root) {
  'use strict';
  const NP = (root.NP = root.NP || {});
  const B = (NP.Battle = NP.Battle || {});

  B.getMove = function (id) {
    const m = NP.data.moves[id];
    if (!m) throw new Error('unknown move ' + id);
    return m;
  };

  // -------------------------------------------------------------------------------------------------
  // Conditions
  // -------------------------------------------------------------------------------------------------
  const dmgStatus = (frac, text) => function (c) {
    const m = c.holder;
    c.battle.msg(m.label() + text);
    c.battle.damage(m, Math.max(1, Math.floor(m.maxhp * frac)), { cause: 'status' });
  };

  B.COND = {
    status: {
      brn: { start: (m) => m.label() + ' was burned!', cure: (m) => m.label() + "'s burn was healed!", onResidual: dmgStatus(1 / 8, ' is hurt by its burn!') },
      psn: { start: (m) => m.label() + ' was poisoned!', cure: (m) => m.label() + ' was cured of poison!', onResidual: dmgStatus(1 / 8, ' is hurt by poison!') },
      tox: {
        start: (m) => m.label() + ' was badly poisoned!', cure: (m) => m.label() + ' was cured of poison!',
        onResidual(c) {
          const m = c.holder, n = c.data.n || 1;
          c.battle.msg(m.label() + ' is hurt by poison!');
          c.battle.damage(m, Math.max(1, Math.floor((m.maxhp * n) / 16)), { cause: 'status' });
          c.data.n = Math.min(15, n + 1);
        },
      },
      par: {
        start: (m) => m.label() + " is paralyzed! It may be unable to move!", cure: (m) => m.label() + ' was cured of paralysis.',
        modSpeed: (c, v) => Math.floor(v / 4),
        onBeforeMove(c) {
          if (c.battle.rand(4) === 0) { c.battle.msg(c.holder.label() + " is fully paralyzed! It can't move!"); return false; }
        },
      },
      slp: {
        start: (m) => m.label() + ' fell asleep!', cure: (m) => m.label() + ' woke up!',
        onBeforeMove(c) {
          const m = c.holder;
          if (c.data.turns === undefined) c.data.turns = 2;
          c.data.turns--;
          if (c.data.turns <= 0) { c.battle.cureStatus(m); return true; }
          c.battle.msg(m.label() + ' is fast asleep.');
          return false;
        },
      },
      frz: {
        start: (m) => m.label() + ' was frozen solid!', cure: (m) => m.label() + ' thawed out!',
        onBeforeMove(c) {
          if (c.battle.rand(5) === 0) { c.battle.cureStatus(c.holder); return true; }
          c.battle.msg(c.holder.label() + ' is frozen solid!');
          return false;
        },
      },
    },
    volatile: {
      flinch: { onBeforeMove(c) { c.battle.msg(c.holder.label() + ' flinched and could not move!'); return false; } },
      leechseed: {
        endsWithSource: false,
        onResidual(c) {
          const m = c.holder, src = c.data.source;
          if (m.fainted) return;
          c.battle.msg(m.label() + "'s health is sapped by the seed!");
          const d = c.battle.damage(m, Math.max(1, Math.floor(m.maxhp / 8)), { cause: 'status' });
          if (src && !src.fainted && src.slot >= 0) c.battle.heal(src, d, { cause: 'drain' });
        },
      },
    },
    side: {}, weather: {}, field: {},
  };

  // -------------------------------------------------------------------------------------------------
  // Damage
  // -------------------------------------------------------------------------------------------------
  B.effectiveness = function (moveType, target) {
    if (moveType === '???') return 1;
    return NP.typeEffect(moveType, target.types);
  };

  /** deterministic-able damage calc. o: {crit, roll (85..100)} ; returns {dmg, eff, crit, stab} */
  B.calcDamage = function (battle, atk, def, move, o) {
    o = o || {};
    const eff = B.effectiveness(move.type, def);
    if (eff === 0) return { dmg: 0, eff: 0, crit: false, stab: false };
    if (move.fixed === 'level') return { dmg: atk.level, eff, crit: false, stab: false };
    const phys = move.category === 'physical';
    const crit = o.crit !== undefined ? o.crit : battle.rng.ratio(1, [16, 8, 4, 3, 2][Math.min(4, move.crit || 0)]);
    const aKey = phys ? 'atk' : 'spa', dKey = phys ? 'def' : 'spd';
    let power = battle.chain('modPower', atk, move.power, { move, target: def });
    const A = battle.getStat(atk, aKey, crit ? { ignoreNeg: true } : {});
    const D = battle.getStat(def, dKey, crit ? { ignorePos: true } : {});
    let dmg = Math.floor((Math.floor((2 * atk.level) / 5 + 2) * power * A) / D / 50) + 2;
    if (crit) dmg *= 2;
    const roll = o.roll !== undefined ? o.roll : battle.rng.range(85, 100);
    dmg = Math.floor((dmg * roll) / 100);
    const stab = atk.types.indexOf(move.type) >= 0;
    if (stab) dmg = Math.floor(dmg * 1.5);
    dmg = Math.floor(dmg * eff);
    if (phys && atk.status === 'brn') dmg = Math.floor(dmg / 2);
    dmg = battle.chain('modDamage', atk, dmg, { move, target: def });
    return { dmg: Math.max(1, dmg), eff, crit, stab };
  };

  function resolveTarget(battle, mon, move, ch) {
    if (move.target === 'self') return mon;
    const t = ch && ch.target ? battle.sides[ch.target.side].active[ch.target.slot] : null;
    if (t && !t.fainted) return t;
    const foes = mon.foes;
    return foes.length ? foes[0] : null;
  }

  function accuracyHit(battle, mon, target, move) {
    if (move.acc === null || move.acc === undefined) return true;
    if (move.target === 'self') return true;
    let a = move.acc;
    a = battle.chain('modAccuracy', mon, a, { move, target });
    const stage = Math.max(-6, Math.min(6, mon.boosts.acc - target.boosts.eva));
    a = Math.floor(a * (stage >= 0 ? (3 + stage) / 3 : 3 / (3 - stage)));
    return battle.rand(100) < a;
  }

  /** Execute a chosen move. (generator so the core can `yield*` it; it never asks the player anything) */
  B.doMove = function* (battle, mon, ch) {
    const move = ch.moveId ? B.getMove(ch.moveId) : B.getMove(mon.moves[ch.move].id);
    if (!battle.fire('onBeforeMove', mon, { move })) return;
    // flinch is a volatile so it is consulted through holders too
    if (mon.fainted) return;
    if (!ch.forced && ch.move !== undefined && mon.moves[ch.move]) mon.moves[ch.move].pp = Math.max(0, mon.moves[ch.move].pp - 1);
    mon.lastMove = move.id;
    mon.moveThisTurn = true;
    battle.moveUser = mon;
    battle.add({ t: 'move', who: mon, move: move.id });
    battle.msg(mon.label() + ' used ' + move.name + '!');
    const target = resolveTarget(battle, mon, move, ch);
    if (!target) { battle.msg('But there was no target...'); return; }
    if (move.category === 'status') {
      if (!accuracyHit(battle, mon, target, move)) { battle.add({ t: 'miss', who: mon }); battle.msg(mon.label() + "'s move missed!"); return; }
      B.statusMove(battle, mon, target, move);
      return;
    }
    if (!accuracyHit(battle, mon, target, move)) {
      battle.add({ t: 'miss', who: mon, target });
      battle.msg(mon.label() + "'s attack missed!");
      return;
    }
    let hits = 1;
    if (move.multi) {
      const [lo, hi] = move.multi;
      const r = battle.rand(8);
      hits = lo + (hi > lo ? (r < 3 ? 0 : r < 6 ? 1 : r < 7 ? 2 : 3) : 0);
      hits = Math.min(hi, hits);
    }
    let total = 0, n = 0;
    for (let i = 0; i < hits && !target.fainted && !mon.fainted; i++) {
      const r = B.calcDamage(battle, mon, target, move);
      n++;
      battle.add({ t: 'hit', who: target, from: mon, move: move.id, eff: r.eff, crit: r.crit });
      if (r.eff === 0) { battle.msg("It doesn't affect " + target.label() + '...'); return; }
      const dealt = battle.damage(target, r.dmg, { cause: 'hit', source: mon, move });
      total += dealt;
      target.lastHit = { amount: dealt, category: move.category, source: mon, move: move.id, turn: battle.turn };
      if (r.crit) battle.msg('A critical hit!');
      if (i === hits - 1 || target.fainted) {
        if (r.eff > 1) battle.msg("It's super effective!");
        else if (r.eff < 1) battle.msg("It's not very effective...");
      }
    }
    if (move.multi && n > 1) battle.msg('Hit ' + n + ' times!');
    // secondary effects
    if (move.drain && total > 0 && !mon.fainted) {
      battle.heal(mon, Math.max(1, Math.floor(total * move.drain)), { cause: 'drain' });
      battle.msg(target.label() + ' had its energy drained!');
    }
    if (!target.fainted) {
      if (move.status && battle.rand(100) < move.status.chance) battle.setStatus(target, move.status.id, mon, move);
      if (move.boosts && battle.rand(100) < (move.boostChance === undefined ? 100 : move.boostChance)) battle.boost(target, move.boosts, mon, move);
      if (move.flinch && !target.moveThisTurn && battle.rand(100) < move.flinch) target.volatiles.flinch = {};
    }
    if (total > 0 && move.recoil && !mon.fainted) {
      battle.msg(mon.label() + ' was hurt by recoil!');
      battle.damage(mon, Math.max(1, Math.floor(total * move.recoil)), { cause: 'recoil' });
    }
    if (move.recoilMax && !mon.fainted) {
      battle.msg(mon.label() + ' was hurt by recoil!');
      battle.damage(mon, Math.max(1, Math.floor(mon.maxhp * move.recoilMax)), { cause: 'recoil' });
    }
  };

  B.statusMove = function (battle, mon, target, move) {
    let did = false;
    if (move.status) {
      if (target.status) { battle.msg(target.label() + ' is already ' + ({ brn: 'burned', psn: 'poisoned', tox: 'poisoned', par: 'paralyzed', slp: 'asleep', frz: 'frozen' }[target.status] || 'affected') + '.'); return; }
      did = battle.setStatus(target, move.status.id, mon, move);
      if (!did) battle.msg("But it didn't work on " + target.label() + '!');
      return;
    }
    if (move.boosts) {
      did = battle.boost(target, move.boosts, mon, move);
      if (!did && move.target === 'self') return;
      return;
    }
    if (move.heal) {
      if (target.hp >= target.maxhp) { battle.msg(target.label() + "'s HP is full!"); return; }
      battle.heal(target, Math.floor(target.maxhp * move.heal), { cause: 'heal' });
      battle.msg(target.label() + ' regained health!');
      return;
    }
    if (move.leech) {
      if (target.hasType('sprout') || target.volatiles.leechseed) { battle.msg("It doesn't seem to affect " + target.label() + '...'); return; }
      target.volatiles.leechseed = { source: mon };
      battle.msg(target.label() + ' was seeded!');
      return;
    }
    battle.msg('But nothing happened!');
  };
})(typeof globalThis !== 'undefined' ? globalThis : window);
