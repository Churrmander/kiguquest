/* Battle extras: experience awards, items used in battle, and throwing Bond Spools (befriending). */
(function (root) {
  'use strict';
  const NP = (root.NP = root.NP || {});
  const B = (NP.Battle = NP.Battle || {});

  B.expGain = function (foeLevel, foeYield, playerLevel, trainer, parts) {
    const base = Math.floor(((trainer ? 1.5 : 1) * foeYield * foeLevel) / (5 * Math.max(1, parts)));
    return Math.floor(base * Math.pow((2 * foeLevel + 10) / (foeLevel + playerLevel + 10), 2.5)) + 1;
  };

  B.awardExp = function (battle, foe) {
    const pl = battle.sides[0];
    const parts = Array.from(foe.participants).filter((m) => m.side === pl && !m.fainted);
    if (!parts.length) return;
    const sp = foe.species;
    let top = 'hp';
    for (const s of ['atk', 'def', 'spa', 'spd', 'spe', 'hp']) if (sp.base[s] > sp.base[top]) top = s;
    for (const m of parts) {
      const amount = B.expGain(foe.level, sp.expYield, m.level, !battle.wild, parts.length);
      NP.Kigu.addEVs(m.kigu, { [top]: 1 });
      NP.Kigu.changeBond(m.kigu, 1);
      const levels = NP.Kigu.gainExp(m.kigu, amount);
      battle.add({ t: 'exp', who: m, amount, levels });
      if (levels.length) m.refresh();
    }
  };

  B.useItemInBattle = function (battle, mon, ch) {
    const d = NP.data.items[ch.item];
    const target = mon.side.mons[ch.party === undefined ? mon.idx : ch.party];
    if (!d || !d.use || !target) { battle.msg('But it had no effect.'); return false; }
    const who = mon.side.isPlayer ? 'You' : mon.side.trainer ? mon.side.trainer.name : 'The foe';
    battle.msg(who + ' used ' + d.name + '!');
    if (battle.cfg.consume) battle.cfg.consume(ch.item);
    const u = d.use;
    if (u.revive) {
      if (!target.fainted) { battle.msg('But it had no effect.'); return false; }
      const hp = Math.max(1, Math.floor(target.maxhp * u.revive));
      target.kigu.hp = hp;
      target.faintHandled = false;
      battle.add({ t: 'hp', who: target, from: 0, to: hp, max: target.maxhp, cause: 'heal' });
      battle.msg(target.name + ' woke up!');
      return true;
    }
    if (target.fainted) { battle.msg('But it had no effect.'); return false; }
    if (u.hp) {
      if (battle.heal(target, u.hp, { cause: 'item' }) > 0) battle.msg(target.name + ' recovered HP!');
      else battle.msg('But it had no effect.');
      return true;
    }
    if (u.cure) {
      if (target.status && (u.cure === 'all' || u.cure.indexOf(target.status) >= 0)) battle.cureStatus(target);
      else battle.msg('But it had no effect.');
      return true;
    }
    if (u.pp) { for (const m of target.kigu.moves) m.pp = Math.min(m.maxpp, m.pp + u.pp); battle.msg(target.name + "'s PP was restored!"); return true; }
    battle.msg('But it had no effect.');
    return false;
  };

  /** catch maths (Gen-5 style). returns {shakes 0..3, caught} */
  B.spoolRoll = function (battle, k, hp, max, ball, status) {
    const sp = NP.Kigu.sp(k);
    const bonus = status === 'slp' || status === 'frz' ? 2 : status ? 1.5 : 1;
    const a = Math.max(1, (((3 * max - 2 * hp) * sp.catchRate * ball) / (3 * max)) * bonus);
    if (a >= 255) return { shakes: 3, caught: true, a };
    const b = Math.floor(1048560 / Math.floor(Math.sqrt(Math.sqrt(Math.floor(16711680 / a)))));
    let shakes = 0;
    for (let i = 0; i < 4; i++) {
      if (battle.rng.int(65536) < b) shakes++;
      else break;
    }
    return { shakes: Math.min(3, shakes), caught: shakes >= 4, a };
  };

  B.throwSpool = function (battle, mon, ch) {
    const d = NP.data.items[ch.item];
    if (battle.cfg.consume) battle.cfg.consume(ch.item);
    if (!battle.wild) {
      battle.msg("You can't take another Tailor's Kigu!");
      return;
    }
    const foe = mon.foes[0];
    if (!foe) return;
    const sp = d.use.spool;
    battle.msg('You offered a ' + d.name + ' to ' + foe.label() + '!');
    const r = B.spoolRoll(battle, foe.kigu, foe.hp, foe.maxhp, sp.ball, foe.status);
    battle.add({ t: 'spool', who: foe, kind: sp.kind, shakes: r.shakes, caught: r.caught });
    if (r.caught) {
      battle.msg('Gotcha! ' + foe.name + ' accepted the spool and joined you!');
      battle.caught = foe.kigu;
      foe.kigu.ball = ch.item;
      battle.end(null, 'caught');
    } else {
      battle.msg(['Oh no! She did not want it yet!', 'Aww! It looked like she might accept!', 'Almost! So close!', 'Argh! Almost had her!'][r.shakes]);
    }
  };
})(typeof globalThis !== 'undefined' ? globalThis : window);
