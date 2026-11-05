/* Set-piece battles: story fights against a Kigu far above the player's level that can't be lost and can't drag on.
 * First used by the Spindle Shrine's Wyvrant (Ch2). Turned on by a `setPiece` object in the battle config, which starts the
 * `set_piece` field condition for the whole battle:
 *
 *   setPiece: {
 *     floor: true,              // nothing on the player's side drops below 1 HP, from any cause, so the fight can't be lost
 *     helper: 'The Mikoga',     // who steps in to help once the foe has landed a hit (text only)
 *     heal: 0.5,                // at the end of every turn after that, the helpers heal the player's Kigu by this much max HP
 *     chip: 1 / 6,              // ...and hit the foe for this much of her max HP
 *     enrage: 0.35,             // once the helpers join, the foe's accuracy is multiplied by this (she's too angry to aim)
 *     endAt: 0.1,               // the foe gives up at this fraction of her HP and the battle ends as a win (no faint, no exp)
 *     lines: { join, heal, chip, enrage, end }   // optional text, {foe} and {mon} are filled in
 *   }
 *
 * The foe never faints: her HP stops at the end threshold, so no exp is awarded. */
(function (root) {
  'use strict';
  const NP = (root.NP = root.NP || {});
  const B = (NP.Battle = NP.Battle || {});
  B.COND = B.COND || { status: {}, volatile: {}, side: {}, weather: {}, field: {} };

  const DEF = {
    floor: true, helper: 'Your friends', heal: 0.5, chip: 1 / 6, enrage: 0.35, endAt: 0.1,
    lines: {
      join: '{helper} rushed in to help!',
      heal: '{helper} wrapped {mon} in warm silk!',
      chip: '{helper} beat their wings and sent a Gust at {foe}!',
      enrage: '{foe} is furious! She can hardly aim!',
      end: '{foe} has had enough!',
    },
  };
  const cfgOf = (battle) => {
    const c = battle.cfg.setPiece;
    if (!c) return null;
    if (!c._merged) { c._merged = Object.assign({}, DEF, c, { lines: Object.assign({}, DEF.lines, c.lines || {}) }); }
    return c._merged;
  };
  const state = (battle) => battle.field.set_piece || {};
  const foeOf = (battle) => battle.sides[1].active[0];
  const fill = (s, vars) => NP.fmt ? NP.fmt(s.replace(/\{(\w+)\}/g, (m, k) => (vars[k] !== undefined ? vars[k] : m))) : s;
  const line = (battle, key, vars) => { const c = cfgOf(battle); battle.msg(fill(c.lines[key], Object.assign({ helper: c.helper }, vars))); };
  const floorHp = (battle, mon) => Math.max(1, Math.ceil(mon.maxhp * cfgOf(battle).endAt));

  function finish(battle, foe) {
    const st = state(battle);
    if (st.over) return;
    st.over = true;
    line(battle, 'end', { foe: foe.label() });
    battle.end(0, 'setpiece');
  }

  B.COND.field.set_piece = {
    id: 'set_piece', name: 'Set piece',
    // the player's Kigu are never knocked out; the foe never drops below her give-up threshold.
    // The foe's first hit on the player brings the helpers in from the end of that turn.
    onDamage(c, amt) {
      const b = c.battle, cfg = cfgOf(b), m = c.holder;
      if (!cfg) return undefined;
      if (m.side.index === 0) {
        const st = state(b);
        if (c.source && c.source.side && c.source.side.index === 1 && !st.joined) { st.joined = true; st.joinNow = true; }
        return cfg.floor && amt >= m.hp ? m.hp - 1 : undefined;
      }
      const lo = floorHp(b, m);
      return m.hp - amt < lo ? Math.max(0, m.hp - lo) : undefined;
    },
    onAfterDamage(c) {
      const b = c.battle, m = c.holder, st = state(b);
      if (!cfgOf(b)) return;
      if (st.joinNow) { st.joinNow = false; line(b, 'join', {}); }
      if (m.side.index === 1 && m.hp <= floorHp(b, m)) finish(b, m);
    },
    modAccuracy(c, acc) {
      const cfg = cfgOf(c.battle);
      if (!cfg || c.holder.side.index !== 1 || !state(c.battle).angry || acc === null || acc === undefined || acc === true) return undefined;
      return Math.floor(acc * cfg.enrage);
    },
    residual(ctx) {
      const b = ctx.battle, cfg = cfgOf(b), st = state(b);
      if (!cfg || !st.joined || st.over || b.ended) return;
      if (st.joinNow) { st.joinNow = false; line(b, 'join', {}); }
      const foe = foeOf(b), mon = b.sides[0].active[0];
      if (mon && !mon.fainted && mon.hp < mon.maxhp) {
        line(b, 'heal', { mon: mon.label() });
        b.heal(mon, Math.ceil(mon.maxhp * cfg.heal), { cause: 'heal' });
      }
      if (foe && !foe.fainted) {
        line(b, 'chip', { foe: foe.label() });
        b.damage(foe, Math.max(1, Math.floor(foe.maxhp * cfg.chip)), { cause: 'setpiece' });
        if (!st.angry) { st.angry = true; line(b, 'enrage', { foe: foe.label() }); }
        if (foe.hp <= floorHp(b, foe)) finish(b, foe);
      }
    },
  };
})(typeof globalThis !== 'undefined' ? globalThis : window);
