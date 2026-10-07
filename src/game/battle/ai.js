/* Battle AI for non-player sides + replacement choice. side.ai: 0 random, 1 greedy (with mistakes), 2+ greedy. */
(function (root) {
  'use strict';
  const NP = (root.NP = root.NP || {});
  const B = (NP.Battle = NP.Battle || {});

  function scoreMove(battle, mon, foe, m) {
    const mv = NP.data.moves[m.id];
    if (!mv) return 1;
    if (mv.category === 'status') {
      if (mv.status) return foe && !foe.status ? 18 : 0;
      if (mv.heal) return mon.hp < mon.maxhp * 0.5 ? 40 : 0;
      if (mv.boosts && mv.target === 'self') {
        const k = Object.keys(mv.boosts)[0];
        return mon.boosts[k] < 1 ? 14 : 0;
      }
      if (mv.boosts && foe) return foe.boosts[Object.keys(mv.boosts)[0]] > -1 ? 10 : 0;
      return 6;
    }
    if (!foe) return 1;
    const eff = B.effectiveness(mv.type, foe);
    const stab = mon.types.indexOf(mv.type) >= 0 ? 1.5 : 1;
    let p = mv.fixed ? mon.level : mv.power || 0;
    if (mv.multi) p *= 3;
    const acc = mv.acc === null ? 1 : mv.acc / 100;
    let s = p * eff * stab * acc;
    // finishing blow
    const est = (((2 * mon.level) / 5 + 2) * p * eff * stab) / 50 * (mon.stats.atk / Math.max(1, foe.stats.def));
    if (est >= foe.hp) s *= 1.6;
    return s;
  }

  B.AI = {
    choose(battle, mon, slot) {
      const legal = battle.legalMoves(mon).filter((m) => m.usable);
      const foe = mon.foes[0];
      if (!legal.length) return null;
      const lvl = mon.side.ai;
      let pick;
      if (lvl <= 0 || (lvl === 1 && battle.rand(100) < 25)) pick = legal[battle.rand(legal.length)];
      else {
        let best = -1;
        for (const m of legal) {
          const s = scoreMove(battle, mon, foe, m) * (0.85 + battle.rng.next() * 0.3);
          if (s > best) { best = s; pick = m; }
        }
      }
      return { type: 'move', move: pick.idx, target: foe ? { side: foe.side.index, slot: foe.slot } : null };
    },

    pickReplacement(battle, side, slot) {
      const cand = side.benched();
      const foe = battle.sides[1 - side.index].activeMons()[0];
      if (!foe || side.ai < 1) return cand[0];
      let best = cand[0], bs = -1;
      for (const m of cand) {
        let s = 0;
        for (const mm of m.moves) {
          const mv = NP.data.moves[mm.id];
          if (mv && mv.power) s = Math.max(s, mv.power * B.effectiveness(mv.type, foe));
        }
        if (s > bs) { bs = s; best = m; }
      }
      return best;
    },
  };
})(typeof globalThis !== 'undefined' ? globalThis : window);
