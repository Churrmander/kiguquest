/* NP.Items — applying item effects to a Kigu outside/inside battle (shared by bag, party and battle). */
(function (root) {
  'use strict';
  const NP = (root.NP = root.NP || {});

  const Items = {
    def(id) { return NP.data.items[id]; },

    /** Can `id` do anything to this Kigu right now? returns '' if yes, else a reason. */
    why(id, k, moveIdx) {
      const d = NP.data.items[id];
      if (!d || !d.use) return 'no use';
      const u = d.use, K = NP.Kigu;
      const max = K.maxHp(k);
      if (u.revive) return k.hp <= 0 ? '' : 'not sleepy';
      if (k.hp <= 0) return 'asleep';
      if (u.hp || u.hpPct) return k.hp >= max ? 'full' : '';
      if (u.cure) {
        if (!k.status) return 'no status';
        return u.cure === 'all' || u.cure.indexOf(k.status) >= 0 ? '' : 'wrong status';
      }
      if (u.pp) {
        if (moveIdx === undefined) return k.moves.some((m) => m.pp < m.maxpp) ? '' : 'full';
        return k.moves[moveIdx] && k.moves[moveIdx].pp < k.moves[moveIdx].maxpp ? '' : 'full';
      }
      if (u.level) return k.level >= 100 ? 'max' : '';
      return 'no use';
    },

    /** Apply to the Kigu object. Returns {text, levels?}. */
    apply(id, k, moveIdx) {
      const d = NP.data.items[id], u = d.use, K = NP.Kigu;
      const name = K.displayName(k);
      if (u.revive) { k.hp = Math.max(1, Math.floor(K.maxHp(k) * u.revive)); k.status = null; return { text: name + ' woke up!' }; }
      if (u.hp || u.hpPct) {
        const max = K.maxHp(k), before = k.hp;
        k.hp = Math.min(max, k.hp + (u.hp || Math.floor(max * u.hpPct)));
        return { text: name + ' recovered ' + (k.hp - before) + ' HP!' };
      }
      if (u.cure) { k.status = null; return { text: name + ' was cured!' }; }
      if (u.pp) {
        if (moveIdx === undefined) for (const m of k.moves) m.pp = Math.min(m.maxpp, m.pp + u.pp);
        else k.moves[moveIdx].pp = Math.min(k.moves[moveIdx].maxpp, k.moves[moveIdx].pp + u.pp);
        return { text: name + "'s PP was restored!" };
      }
      if (u.level) {
        const g = K.sp(k).growth || 'mediumFast';
        const levels = K.gainExp(k, NP.expForLevel(g, k.level + 1) - k.exp);
        return { text: name + ' grew to Lv' + k.level + '!', levels };
      }
      return { text: '' };
    },
  };
  NP.Items = Items;
})(typeof globalThis !== 'undefined' ? globalThis : window);
