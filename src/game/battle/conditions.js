/* Built-in battle conditions: the six statuses, common volatiles (confusion, flinch, protect, bound ...), side conditions
 * (screens, hazards, tailwind ...), field conditions (trick room, gravity) and field moods (sun, rain, dust, snow).
 * All registered through NP.battleFx so other files can override or add to them. See docs/battle-engine.md. */
(function (root) {
  'use strict';
  const NP = (root.NP = root.NP || {});
  const B = (NP.Battle = NP.Battle || {});
  const FX = NP.battleFx;
  const T = (k, f, v) => NP.T(k, f, v);
  const mon = (m) => m.label();

  // ================================================================================================ statuses
  const dmgStatus = (frac, key, text) => function (c) {
    const m = c.holder;
    c.battle.tmsg(key, text, { mon: mon(m) });
    c.battle.damage(m, Math.max(1, Math.floor(m.maxhp * frac)), { cause: 'status' });
  };

  FX.registerStatus('brn', {
    start: (m) => T('system.status.brn.start', '{mon} was burned!', { mon: mon(m) }),
    cure: (m) => T('system.status.brn.cure', "{mon}'s burn was healed!", { mon: mon(m) }),
    residualOrder: 30,
    onResidual: dmgStatus(1 / 8, 'system.status.brn.hurt', '{mon} is hurt by its burn!'),
  });
  FX.registerStatus('psn', {
    start: (m) => T('system.status.psn.start', '{mon} was poisoned!', { mon: mon(m) }),
    cure: (m) => T('system.status.psn.cure', '{mon} was cured of poison!', { mon: mon(m) }),
    residualOrder: 30,
    onResidual: dmgStatus(1 / 8, 'system.status.psn.hurt', '{mon} is hurt by poison!'),
  });
  FX.registerStatus('tox', {
    start: (m) => T('system.status.tox.start', '{mon} was badly poisoned!', { mon: mon(m) }),
    cure: (m) => T('system.status.tox.cure', '{mon} was cured of poison!', { mon: mon(m) }),
    residualOrder: 30,
    onResidual(c) {
      const m = c.holder, n = c.data.n || 1;
      c.battle.tmsg('system.status.psn.hurt', '{mon} is hurt by poison!', { mon: mon(m) });
      c.battle.damage(m, Math.max(1, Math.floor((m.maxhp * n) / 16)), { cause: 'status' });
      c.data.n = Math.min(15, n + 1);
    },
  });
  FX.registerStatus('par', {
    start: (m) => T('system.status.par.start', '{mon} is paralyzed! It may be unable to move!', { mon: mon(m) }),
    cure: (m) => T('system.status.par.cure', '{mon} was cured of paralysis.', { mon: mon(m) }),
    modSpeed: (c, v) => Math.floor(v / 4),
    beforeMoveOrder: 70,
    onBeforeMove(c) {
      if (c.battle.rand(4) === 0) { c.battle.tmsg('system.status.par.full', "{mon} is fully paralyzed! It can't move!", { mon: mon(c.holder) }); return false; }
    },
  });
  FX.registerStatus('slp', {
    start: (m) => T('system.status.slp.start', '{mon} fell asleep!', { mon: mon(m) }),
    cure: (m) => T('system.status.slp.cure', '{mon} woke up!', { mon: mon(m) }),
    beforeMoveOrder: 10,
    onBeforeMove(c) {
      const m = c.holder, b = c.battle;
      if (c.data.turns === undefined) c.data.turns = 2;
      c.data.turns -= b.chain('modSleepDecrement', m, 1, {});
      if (c.data.turns <= 0) { b.cureStatus(m); return true; }
      b.tmsg('system.status.slp.asleep', '{mon} is fast asleep.', { mon: mon(m) });
      if (c.move && c.move.usableAsleep) return true; // Sleep Talk / Snore style
      return false;
    },
  });
  FX.registerStatus('frz', {
    start: (m) => T('system.status.frz.start', '{mon} was frozen solid!', { mon: mon(m) }),
    cure: (m) => T('system.status.frz.cure', '{mon} thawed out!', { mon: mon(m) }),
    beforeMoveOrder: 20,
    onBeforeMove(c) {
      const b = c.battle;
      if ((c.move && c.move.thawsUser) || b.rand(5) === 0) { b.cureStatus(c.holder); return true; }
      b.tmsg('system.status.frz.frozen', '{mon} is frozen solid!', { mon: mon(c.holder) });
      return false;
    },
  });

  // ================================================================================================ volatiles
  FX.registerVolatile('flinch', {
    beforeMoveOrder: 40,
    onBeforeMove(c) { c.battle.tmsg('system.volatile.flinch', '{mon} flinched and could not move!', { mon: mon(c.holder) }); return false; },
  });

  FX.registerVolatile('confusion', {
    manualTurns: true, batonPass: true,
    duration: (b) => b.rng.range(2, 5), // 1-4 confused move attempts (Gen 5)
    beforeMoveOrder: 60,
    onStart(c) { c.battle.tmsg('system.volatile.confusion.start', '{mon} became confused!', { mon: mon(c.holder) }); },
    onEnd(c) { c.battle.tmsg('system.volatile.confusion.end', '{mon} snapped out of its confusion!', { mon: mon(c.holder) }); },
    onRestart: () => false,
    onBeforeMove(c) {
      const m = c.holder, b = c.battle;
      c.data.turns--;
      if (c.data.turns <= 0) { b.removeVolatile(m, 'confusion'); return true; }
      b.tmsg('system.volatile.confusion.is', '{mon} is confused!', { mon: mon(m) });
      if (b.rand(2) === 0) {
        b.tmsg('system.volatile.confusion.hurt', 'It hurt itself in its confusion!');
        b.add({ t: 'hit', who: m, from: m, move: null, eff: 1, crit: false, self: true });
        b.damage(m, B.confusionDamage(b, m), { cause: 'confusion', source: m });
        return false;
      }
    },
  });

  FX.registerVolatile('protect', {});
  FX.registerVolatile('protectedNow', {});
  FX.registerVolatile('endure', {
    onDamage(c, amt) {
      const m = c.holder;
      if (c.cause === 'hit' && amt >= m.hp) {
        c.battle.tmsg('system.volatile.endure', '{mon} endured the hit!', { mon: mon(m) });
        return m.hp - 1;
      }
    },
  });

  FX.registerVolatile('twoturn', {});
  FX.registerVolatile('lockedmove', {});
  FX.registerVolatile('recharge', {});
  FX.registerVolatile('focusenergy', {
    batonPass: true,
    onStart(c) { c.battle.tmsg('system.volatile.focusenergy', '{mon} is getting pumped!', { mon: mon(c.holder) }); },
    modCritStage: (c, n) => n + 2,
  });

  FX.registerVolatile('bound', {
    endsWithSource: true, residualOrder: 40,
    duration: (b) => b.rng.range(4, 5),
    onStart(c) {
      c.battle.tmsg('system.volatile.bound.start', "{mon} was trapped by {user}'s {move}!", { mon: mon(c.holder), user: c.source ? c.source.name : '', move: c.data.moveName || '' });
    },
    onEnd(c) { c.battle.tmsg('system.volatile.bound.end', '{mon} was freed from {move}!', { mon: mon(c.holder), move: c.data.moveName || '' }); },
    onResidual(c) {
      const m = c.holder;
      c.battle.tmsg('system.volatile.bound.hurt', '{mon} is hurt by {move}!', { mon: mon(m), move: c.data.moveName || '' });
      c.battle.damage(m, Math.max(1, Math.floor(m.maxhp / 16)), { cause: 'status' });
    },
  });
  FX.registerVolatile('trapped', {
    endsWithSource: true,
    onStart(c) { c.battle.tmsg('system.volatile.trapped.start', "{mon} can't escape now!", { mon: mon(c.holder) }); },
  });
  FX.registerVolatile('ingrain', {
    residualOrder: 15, batonPass: true,
    onStart(c) { c.battle.tmsg('system.volatile.ingrain.start', '{mon} planted its roots!', { mon: mon(c.holder) }); },
    onForceSwitch: () => false,
    onResidual(c) {
      const m = c.holder;
      if (c.battle.heal(m, Math.max(1, Math.floor(m.maxhp / 16)), { cause: 'heal' })) c.battle.tmsg('system.volatile.ingrain.heal', '{mon} absorbed nutrients with its roots!', { mon: mon(m) });
    },
  });
  FX.registerVolatile('leechseed', {
    residualOrder: 20, batonPass: true,
    onStart(c) { c.battle.tmsg('system.volatile.leechseed.start', '{mon} was seeded!', { mon: mon(c.holder) }); },
    onResidual(c) {
      const m = c.holder, src = c.data.source;
      if (m.fainted) return;
      c.battle.tmsg('system.volatile.leechseed.hurt', "{mon}'s health is sapped by the seed!", { mon: mon(m) });
      const d = c.battle.damage(m, Math.max(1, Math.floor(m.maxhp / 8)), { cause: 'status' });
      if (src && !src.fainted && src.slot >= 0) c.battle.heal(src, d, { cause: 'drain' });
    },
  });
  FX.registerVolatile('taunt', {
    duration: (b) => b.rng.range(3, 5), beforeMoveOrder: 35,
    onStart(c) { c.battle.tmsg('system.volatile.taunt.start', '{mon} fell for the taunt!', { mon: mon(c.holder) }); },
    onEnd(c) { c.battle.tmsg('system.volatile.taunt.end', "{mon}'s taunt wore off.", { mon: mon(c.holder) }); },
    onBeforeMove(c) {
      if (c.move && c.move.category === 'status') { c.battle.tmsg('system.volatile.taunt.blocked', "{mon} can't use {move} after the taunt!", { mon: mon(c.holder), move: c.move.name }); return false; }
    },
  });
  FX.registerVolatile('disable', {
    duration: (b) => b.rng.range(4, 7), beforeMoveOrder: 35,
    onStart(c) { c.battle.tmsg('system.volatile.disable.start', "{mon}'s {move} was disabled!", { mon: mon(c.holder), move: (NP.data.moves[c.data.move] || {}).name || '' }); },
    onEnd(c) { c.battle.tmsg('system.volatile.disable.end', "{mon}'s move is no longer disabled!", { mon: mon(c.holder) }); },
    onBeforeMove(c) {
      if (c.move && c.move.id === c.data.move) { c.battle.tmsg('system.volatile.disable.blocked', "{mon}'s {move} is disabled!", { mon: mon(c.holder), move: c.move.name }); return false; }
    },
  });
  FX.registerVolatile('encore', {
    duration: (b) => b.rng.range(3, 6),
    onStart(c) { c.battle.tmsg('system.volatile.encore.start', '{mon} got an encore!', { mon: mon(c.holder) }); },
    onEnd(c) { c.battle.tmsg('system.volatile.encore.end', "{mon}'s encore ended.", { mon: mon(c.holder) }); },
  });
  FX.registerVolatile('yawn', {
    duration: 2,
    onStart(c) { c.battle.tmsg('system.volatile.yawn.start', '{mon} grew drowsy!', { mon: mon(c.holder) }); },
    onEnd(c) { c.battle.setStatus(c.holder, 'slp', c.data.source, { id: 'yawn' }); },
  });
  FX.registerVolatile('destinybond', {
    onStart(c) { c.battle.tmsg('system.volatile.destinybond.start', '{mon} is trying to take its foe down with it!', { mon: mon(c.holder) }); },
    onFaint(c) {
      const s = c.source, b = c.battle;
      if (s && s !== c.holder && !s.fainted && s.side !== c.holder.side) {
        b.tmsg('system.volatile.destinybond.hit', '{mon} took {foe} down with it!', { mon: mon(c.holder), foe: mon(s) });
        b.damage(s, s.hp, { cause: 'self', source: c.holder });
      }
    },
  });
  FX.registerVolatile('substitute', {
    batonPass: true,
    onStart(c) { c.battle.tmsg('system.volatile.substitute.start', '{mon} put in a substitute!', { mon: mon(c.holder) }); },
    onEnd(c) { c.battle.tmsg('system.volatile.substitute.end', "{mon}'s substitute faded!", { mon: mon(c.holder) }); },
    onDamage(c, amt) {
      const m = c.holder;
      if (c.cause !== 'hit' || !c.source || c.source === m || (c.move && c.move.flags && c.move.flags.bypassSub)) return;
      const d = c.data;
      const take = Math.min(d.hp, amt);
      d.hp -= take;
      c.substituteHit = true;
      if (c.ctx) c.ctx.substituteHit = true;
      c.battle.tmsg('system.volatile.substitute.hit', "The substitute took damage for {mon}!", { mon: mon(m) });
      if (d.hp <= 0) c.battle.removeVolatile(m, 'substitute');
      return 0;
    },
  });
  FX.registerVolatile('roost', {
    onStart(c) { c.holder.types = c.holder.types.filter((t) => t !== 'gale'); if (!c.holder.types.length) c.holder.types = ['fluff']; },
    onEnd(c) { if (!c.holder.volatiles.typechange) c.holder.types = c.holder.baseTypes.slice(); },
  });
  FX.registerVolatile('helpinghand', { modBasePower: (c, bp) => Math.floor(bp * 1.5) });
  FX.registerVolatile('typechange', {});
  FX.registerVolatile('magnetrise', { duration: 5, onStart(c) { c.battle.tmsg('system.volatile.magnetrise.start', '{mon} floated up!', { mon: mon(c.holder) }); } });
  FX.registerVolatile('telekinesis', { duration: 3 });
  FX.registerVolatile('embargo', { duration: 5 });
  FX.registerVolatile('gastro', {});

  // ================================================================================================ side conditions
  const team = (side) => (side.index === 0 ? T('system.side.your_team', 'your team') : T('system.side.foe_team', 'the opposing team'));
  const screen = (id, cat, startKey, startText, endKey, endText) => FX.registerSideCondition(id, {
    duration: 5, extendItem: 'light_clay',
    onStart(c) { c.battle.tmsg(startKey, startText, { team: team(c.side) }); },
    onEnd(c) { c.battle.tmsg(endKey, endText, { team: team(c.side) }); },
    modIncomingDamage(c, d) {
      if (c.move && c.move.category === cat && !c.crit && c.user && c.user.side !== c.holder.side && !(c.move.breaksScreens)) return Math.floor(d * (c.battle.slots > 1 ? 2 / 3 : 1 / 2));
    },
  });
  screen('reflect', 'physical', 'system.side.reflect.start', 'A wall of light rose up around {team}, guarding against physical moves!', 'system.side.reflect.end', "{team}'s Reflect wore off!");
  screen('lightscreen', 'special', 'system.side.lightscreen.start', 'A veil of light rose up around {team}, guarding against special moves!', 'system.side.lightscreen.end', "{team}'s Light Screen wore off!");
  FX.registerSideCondition('safeguard', {
    duration: 5,
    onStart(c) { c.battle.tmsg('system.side.safeguard.start', '{team} became cloaked in a mystical veil!', { team: team(c.side) }); },
    onEnd(c) { c.battle.tmsg('system.side.safeguard.end', "{team}'s veil wore off!", { team: team(c.side) }); },
    onTryAddVolatile(c) { if (c.id === 'confusion' && c.source && c.source.side !== c.holder.side) return false; },
  });
  FX.registerSideCondition('mist', {
    duration: 5,
    onStart(c) { c.battle.tmsg('system.side.mist.start', '{team} became shrouded in mist!', { team: team(c.side) }); },
    onEnd(c) { c.battle.tmsg('system.side.mist.end', "{team}'s mist faded!", { team: team(c.side) }); },
    onTryBoost(c, b) {
      if (!c.source || c.source.side === c.holder.side) return;
      let hit = false;
      const out = Object.assign({}, b);
      for (const k in out) if (out[k] < 0) { delete out[k]; hit = true; }
      if (hit) c.battle.tmsg('system.side.mist.protected', "{mon} is protected by the mist!", { mon: mon(c.holder) });
      return out;
    },
  });
  FX.registerSideCondition('luckychant', {
    duration: 5, blocksCrit: () => true,
    onStart(c) { c.battle.tmsg('system.side.luckychant.start', 'The Lucky Chant shielded {team} from critical hits!', { team: team(c.side) }); },
    onEnd(c) { c.battle.tmsg('system.side.luckychant.end', "{team}'s Lucky Chant wore off!", { team: team(c.side) }); },
  });
  FX.registerSideCondition('tailwind', {
    duration: 3,
    modSpeed: (c, v) => v * 2,
    onStart(c) { c.battle.tmsg('system.side.tailwind.start', 'The tailwind blew from behind {team}!', { team: team(c.side) }); },
    onEnd(c) { c.battle.tmsg('system.side.tailwind.end', "{team}'s tailwind petered out!", { team: team(c.side) }); },
  });
  FX.registerSideCondition('spikes', {
    layers: 3,
    onStart(c) { c.battle.tmsg('system.side.spikes.start', 'Pins were scattered around the feet of {team}!', { team: team(c.side) }); },
  });
  FX.registerSideCondition('toxicspikes', {
    layers: 2,
    onStart(c) { c.battle.tmsg('system.side.toxicspikes.start', 'Poison pins were scattered around the feet of {team}!', { team: team(c.side) }); },
  });
  FX.registerSideCondition('stealthrock', {
    onStart(c) { c.battle.tmsg('system.side.stealthrock.start', 'Pointed stones float in the air around {team}!', { team: team(c.side) }); },
  });

  // ================================================================================================ field conditions
  FX.registerFieldCondition('trickroom', {
    duration: 5, toggle: true,
    onStart(c) { c.battle.tmsg('system.field.trickroom.start', 'The dimensions were twisted!'); },
    onEnd(c) { c.battle.tmsg('system.field.trickroom.end', 'The twisted dimensions returned to normal!'); },
  });
  FX.registerFieldCondition('gravity', {
    duration: 5,
    onStart(c) { c.battle.tmsg('system.field.gravity.start', 'Gravity grew stronger!'); },
    onEnd(c) { c.battle.tmsg('system.field.gravity.end', 'Gravity returned to normal!'); },
  });

  // ================================================================================================ moods (weather)
  const moodHurt = (key, text, immune) => function (c) {
    const m = c.holder;
    if (immune(m)) return;
    if (!c.battle.fire('onMoodDamage', m, { mood: c.mood })) return;
    c.battle.tmsg(key, text, { mon: mon(m) });
    c.battle.damage(m, Math.max(1, Math.floor(m.maxhp / 16)), { cause: 'weather' });
  };
  FX.registerMood('sun', {
    name: 'Sunshine', duration: 5, blocksStatus: ['frz'],
    start: () => T('system.mood.sun.start', 'The sunlight turned harsh!'),
    end: () => T('system.mood.sun.end', 'The sunlight faded.'),
    continueMsg: () => T('system.mood.sun.continue', 'The sunlight is strong.'),
    modDamage(c, d) { const t = c.move && c.move.type; return t === 'ember' ? Math.floor(d * 1.5) : t === 'tide' ? Math.floor(d / 2) : undefined; },
  });
  FX.registerMood('rain', {
    name: 'Drizzle', duration: 5,
    start: () => T('system.mood.rain.start', 'It started to rain!'),
    end: () => T('system.mood.rain.end', 'The rain stopped.'),
    continueMsg: () => T('system.mood.rain.continue', 'Rain continues to fall.'),
    modDamage(c, d) { const t = c.move && c.move.type; return t === 'tide' ? Math.floor(d * 1.5) : t === 'ember' ? Math.floor(d / 2) : undefined; },
  });
  FX.registerMood('dust', {
    name: 'Dust storm', duration: 5,
    start: () => T('system.mood.dust.start', 'A dust storm kicked up!'),
    end: () => T('system.mood.dust.end', 'The dust storm subsided.'),
    continueMsg: () => T('system.mood.dust.continue', 'The dust storm rages.'),
    residual: moodHurt('system.mood.dust.hurt', '{mon} is buffeted by the dust storm!', (m) => m.hasType('pebble') || m.hasType('terra') || m.hasType('iron')),
    modDefenseStat(c, v) { return c.stat === 'spd' && c.holder.hasType('pebble') ? Math.floor(v * 1.5) : undefined; },
  });
  FX.registerMood('snow', {
    name: 'Snow flurry', duration: 5,
    start: () => T('system.mood.snow.start', 'It started to snow!'),
    end: () => T('system.mood.snow.end', 'The snow stopped.'),
    continueMsg: () => T('system.mood.snow.continue', 'Snow keeps falling.'),
    residual: moodHurt('system.mood.snow.hurt', '{mon} is pelted by the snow!', (m) => m.hasType('frost')),
  });
})(typeof globalThis !== 'undefined' ? globalThis : window);
