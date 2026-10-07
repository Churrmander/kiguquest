/* NP.Kigu — the persistent "party member" object (plain JSON so it saves trivially) and everything that
 * operates on one: creation, stats, PP, exp/levelling, learnsets, evolution.
 *
 * A Kigu object:
 *  { uid, species, nickname|null, level, exp, ivs{hp,atk,def,spa,spd,spe}, evs{...}, nature, abilitySlot (0|1|2=hidden),
 *    item|null, moves:[{id,pp,maxpp,ups}], hp, status|null, bond, ot, otId, metLevel, metMap, ball, alt (rare colourway) }
 */
(function (root) {
  'use strict';
  const NP = (root.NP = root.NP || {});

  const STATS = ['hp', 'atk', 'def', 'spa', 'spd', 'spe'];
  let uidSeq = 1;

  const Kigu = {
    STATS,

    sp(k) {
      const sp = NP.data.species[typeof k === 'string' ? k : k.species];
      if (!sp) throw new Error('Kigu: unknown species ' + (typeof k === 'string' ? k : k.species));
      return sp;
    },

    displayName(k) {
      return k.nickname || Kigu.sp(k).name;
    },

    makeMove(id) {
      const m = NP.data.moves[id];
      if (!m) throw new Error('Kigu: unknown move ' + id);
      return { id, pp: m.pp, maxpp: m.pp, ups: 0 };
    },

    /** Moves a fresh level-`lv` Kigu of this species would know: the last 4 distinct learnset entries <= lv. */
    initialMoves(speciesId, lv) {
      const sp = Kigu.sp(speciesId);
      const out = [];
      for (const [l, id] of sp.learnset) {
        if (l > lv) continue;
        if (l === 0) continue; // 0 = evolution-only moves
        const i = out.indexOf(id);
        if (i >= 0) out.splice(i, 1);
        out.push(id);
      }
      return out.slice(-4);
    },

    movesLearnedAt(speciesId, lv) {
      return Kigu.sp(speciesId).learnset.filter((e) => e[0] === lv).map((e) => e[1]);
    },

    /**
     * opts: { nature, ivs, evs, abilitySlot, item, nickname, ot, otId, bond, moves:[ids], hp, rng, alt, ball, metMap }
     */
    create(speciesId, level, opts) {
      opts = opts || {};
      const sp = Kigu.sp(speciesId);
      const rng = opts.rng || NP.rng;
      const ivs = {};
      const evs = {};
      for (const s of STATS) {
        ivs[s] = opts.ivs && opts.ivs[s] !== undefined ? opts.ivs[s] : rng.range(0, 31);
        evs[s] = opts.evs && opts.evs[s] !== undefined ? opts.evs[s] : 0;
      }
      const slot = opts.abilitySlot !== undefined ? opts.abilitySlot : sp.abilities && sp.abilities.length > 1 ? rng.int(2) : 0;
      const k = {
        uid: uidSeq++ + '-' + rng.int(1e6),
        species: speciesId,
        nickname: opts.nickname || null,
        level,
        exp: NP.expForLevel(sp.growth || 'mediumFast', level),
        ivs, evs,
        nature: opts.nature || rng.pick(NP.data.natureIds),
        abilitySlot: slot,
        item: opts.item || null,
        moves: (opts.moves || Kigu.initialMoves(speciesId, level)).map(Kigu.makeMove),
        hp: 1,
        status: null,
        bond: opts.bond !== undefined ? opts.bond : sp.baseBond !== undefined ? sp.baseBond : 70,
        ot: opts.ot || null,
        otId: opts.otId || 0,
        metLevel: level,
        metMap: opts.metMap || null,
        ball: opts.ball || 'bond_spool',
        alt: opts.alt !== undefined ? !!opts.alt : rng.int(1024) === 0,
      };
      k.hp = opts.hp !== undefined ? opts.hp : Kigu.maxHp(k);
      return k;
    },

    abilityId(k) {
      const sp = Kigu.sp(k);
      if (k.abilitySlot === 2 && sp.hiddenAbility) return sp.hiddenAbility;
      return sp.abilities[Math.min(k.abilitySlot, sp.abilities.length - 1)] || null;
    },

    /** Computed stats (Gen-5 formula). */
    stats(k) {
      const sp = Kigu.sp(k);
      const nat = NP.data.natures[k.nature] || NP.data.natures.hardy;
      const out = {};
      for (const s of STATS) {
        const base = sp.base[s];
        const core = Math.floor(((2 * base + k.ivs[s] + Math.floor(k.evs[s] / 4)) * k.level) / 100);
        if (s === 'hp') out.hp = sp.base.hp === 1 ? 1 : core + k.level + 10;
        else {
          let v = core + 5;
          if (nat.plus === s) v = Math.floor(v * 1.1);
          else if (nat.minus === s) v = Math.floor(v * 0.9);
          out[s] = v;
        }
      }
      return out;
    },

    maxHp(k) {
      return Kigu.stats(k).hp;
    },

    isFainted(k) {
      return k.hp <= 0;
    },

    healFull(k) {
      k.hp = Kigu.maxHp(k);
      k.status = null;
      for (const m of k.moves) m.pp = m.maxpp;
    },

    expToNext(k) {
      const g = Kigu.sp(k).growth || 'mediumFast';
      return k.level >= 100 ? 0 : NP.expForLevel(g, k.level + 1) - k.exp;
    },

    /** progress 0..1 through the current level */
    expProgress(k) {
      const g = Kigu.sp(k).growth || 'mediumFast';
      if (k.level >= 100) return 1;
      const lo = NP.expForLevel(g, k.level), hi = NP.expForLevel(g, k.level + 1);
      return hi > lo ? Math.max(0, Math.min(1, (k.exp - lo) / (hi - lo))) : 1;
    },

    addEVs(k, yieldObj) {
      if (!yieldObj) return;
      let total = 0;
      for (const s of STATS) total += k.evs[s];
      for (const s of STATS) {
        const add = yieldObj[s] || 0;
        if (!add) continue;
        const room = Math.min(255 - k.evs[s], 510 - total, add);
        if (room > 0) { k.evs[s] += room; total += room; }
      }
    },

    /**
     * Add exp. Returns [{level, before:{stats}, after:{stats}, learn:[moveIds]}...] one per level gained.
     * HP rises by the max-HP increase (fainted Kigu gain nothing).
     */
    gainExp(k, amount) {
      const g = Kigu.sp(k).growth || 'mediumFast';
      const res = [];
      k.exp += Math.max(0, Math.floor(amount));
      while (k.level < 100 && k.exp >= NP.expForLevel(g, k.level + 1)) {
        const before = Kigu.stats(k);
        k.level++;
        const after = Kigu.stats(k);
        if (k.hp > 0) k.hp = Math.min(after.hp, k.hp + (after.hp - before.hp));
        res.push({ level: k.level, before, after, learn: Kigu.movesLearnedAt(k.species, k.level) });
      }
      if (k.level >= 100) k.exp = Math.max(k.exp, NP.expForLevel(g, 100));
      return res;
    },

    knows(k, moveId) {
      return k.moves.some((m) => m.id === moveId);
    },

    /** Learn a move into a free slot; returns true, or false if the 4 slots are full. */
    learnMove(k, moveId) {
      if (Kigu.knows(k, moveId)) return true;
      if (k.moves.length >= 4) return false;
      k.moves.push(Kigu.makeMove(moveId));
      return true;
    },

    forgetAndLearn(k, idx, moveId) {
      k.moves[idx] = Kigu.makeMove(moveId);
    },

    /**
     * What would this Kigu evolve into right now? ctx: { item (charm used), trigger:'level'|'item', timeOfDay }
     * Returns {to, evo} or null.
     */
    evolutionFor(k, ctx) {
      ctx = ctx || {};
      const sp = Kigu.sp(k);
      if (!sp.evolutions) return null;
      if (k.item === 'stay_button') return null;
      for (const evo of sp.evolutions) {
        if (evo.item) {
          if (ctx.trigger === 'item' && ctx.item === evo.item) return { to: evo.to, evo };
          continue;
        }
        if (ctx.trigger !== 'level') continue;
        if (evo.level && k.level < evo.level) continue;
        if (evo.bond && k.bond < evo.bond) continue;
        if (evo.time && ctx.time && ctx.time !== evo.time) continue;
        if (evo.move && !Kigu.knows(k, evo.move)) continue;
        return { to: evo.to, evo };
      }
      return null;
    },

    /** Change species in place, keeping the HP deficit, ability slot, nickname (unless it was the default). */
    evolve(k, toId) {
      const from = Kigu.sp(k);
      const before = Kigu.stats(k);
      if (k.nickname && k.nickname === from.name) k.nickname = null;
      k.species = toId;
      const after = Kigu.stats(k);
      if (k.hp > 0) k.hp = Math.min(after.hp, k.hp + (after.hp - before.hp));
      const evoMoves = Kigu.movesLearnedAt(toId, 0);
      return { before, after, evoMoves };
    },

    // bond (friendship) changes: +1..+3 early, lower later (Gen-5 style tiers)
    changeBond(k, amount) {
      let a = amount;
      if (a > 0 && k.bond >= 100) a = Math.max(1, a - 1);
      if (a > 0 && k.bond >= 200) a = Math.max(1, a - 1);
      k.bond = Math.max(0, Math.min(255, k.bond + a));
    },

    /** a compact summary (handy for logs/tests) */
    brief(k) {
      return Kigu.displayName(k) + ' Lv' + k.level + ' ' + k.hp + '/' + Kigu.maxHp(k);
    },
  };

  NP.Kigu = Kigu;
})(typeof globalThis !== 'undefined' ? globalThis : window);
