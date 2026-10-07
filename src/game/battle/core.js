/* Battle core — sides, battle-mons, turn loop, switching, hooks, end-of-turn.
 *
 * The engine is LOGIC ONLY: it never draws. It appends plain event objects to `battle.log`; the battle scene plays them back
 * (text, HP-bar tweens, animations). It is driven like a coroutine:
 *
 *   const b = new NP.Battle.Battle({ format:'single'|'double', wild:true, sides:[{player:true, party:[kigu...]}, {party:[foe]}] });
 *   let s = b.begin();                       // -> { events:[...], request:null|{need:...}, done:bool }
 *   while (!s.done) { show(s.events); s = b.step(answerToRequest); }
 *
 * Requests (player input needed):
 *   {need:'actions', side, slots:[0,1]}  answer: array (aligned with slots) of choices:
 *        {type:'move', move:<index into mon.moves>, target:{side,slot}|null}  | {type:'switch', to:<party idx>}
 *        | {type:'item', item:'snack_cake', party:<idx>} | {type:'spool', item:'bond_spool'} | {type:'run'}
 *   {need:'replace', side, slot}         answer: party index to send out
 *   {need:'switch', side, slot, why}     (U-turn / Baton Pass ...)  answer: party index (or null to decline)
 *   {need:'shift', foe}                  answer: party index to switch to, or null to stay (only in "shift" style)
 *
 * Hooks: abilities (NP.data.abilities), held items (NP.data.items[id].held), statuses/volatiles/weather("moods")/side/field
 * conditions (B.COND) are objects whose methods the engine calls as  fn.call(def, ctx, value).
 * The full hook list and the order things happen in is documented in docs/battle-engine.md; new content is added through
 * NP.battleFx (registry.js) without touching this file.
 */
(function (root) {
  'use strict';
  const NP = (root.NP = root.NP || {});
  const B = (NP.Battle = NP.Battle || {});
  B.COND = B.COND || { status: {}, volatile: {}, side: {}, weather: {}, field: {} };
  const Kigu = () => NP.Kigu;
  const T = (k, f, v) => NP.T(k, f, v);

  const BOOSTS = ['atk', 'def', 'spa', 'spd', 'spe', 'acc', 'eva'];
  const BOOST_NAME = { atk: 'Attack', def: 'Defense', spa: 'Sp. Atk', spd: 'Sp. Def', spe: 'Speed', acc: 'accuracy', eva: 'evasiveness' };
  const stageMult = (s) => (s >= 0 ? (2 + s) / 2 : 2 / (2 - s));
  const clamp = (v, lo, hi) => (v < lo ? lo : v > hi ? hi : v);
  B.stageMult = stageMult;
  B.BOOSTS = BOOSTS;
  B.BOOST_NAME = BOOST_NAME;
  B.statName = (k) => T('system.stat.' + k, BOOST_NAME[k] || k);

  // -------------------------------------------------------------------------------------------
  class BMon {
    constructor(battle, side, kigu, idx) {
      this.battle = battle;
      this.side = side;
      this.kigu = kigu;
      this.idx = idx; // index in side.party
      this.slot = -1; // active slot, -1 = benched
      this.abilityData = {};
      this.participants = new Set();
      this.faintHandled = false;
      this.refresh();
      this.ability = Kigu().abilityId(kigu);
      this.baseAbility = this.ability;
      this.resetVolatile();
      this.statusData = {};
      if (kigu.status === 'slp') this.statusData.turns = 2;
      if (kigu.status === 'tox') this.statusData.n = 1;
    }

    // persistent state lives on the kigu object so nothing ever needs syncing
    get hp() { return this.kigu.hp; }
    set hp(v) { this.kigu.hp = v; }
    get status() { return this.kigu.status || null; }
    set status(v) { this.kigu.status = v || null; }
    get item() { return this.kigu.item || null; }
    set item(v) { this.kigu.item = v || null; }
    get moves() { return this.kigu.moves; }
    get fainted() { return this.kigu.hp <= 0; }

    /** re-derive stats/name/types from the kigu (creation, level-up, evolution) */
    refresh() {
      const k = this.kigu, sp = Kigu().sp(k);
      this.species = sp;
      this.name = Kigu().displayName(k);
      this.level = k.level;
      const st = Kigu().stats(k);
      this.maxhp = st.hp;
      this.stats = { atk: st.atk, def: st.def, spa: st.spa, spd: st.spd, spe: st.spe };
      this.baseTypes = sp.types.slice();
      if (!this.types || !this.volatiles || !this.volatiles.typechange) this.types = this.baseTypes.slice();
    }

    resetVolatile() {
      this.boosts = { atk: 0, def: 0, spa: 0, spd: 0, spe: 0, acc: 0, eva: 0 };
      this.volatiles = {};
      this.types = this.baseTypes.slice();
      this.ability = this.baseAbility;
      this.abilityData = {};
      this.lastMove = null;
      this.lastMoveTurn = -1;
      this.moveThisTurn = false;
      this.activeTurns = 0;
      this.lastHit = null; // {amount, category, source, move, turn}
      this.choiceLock = null; // move id locked by a Choice item
      this.protectCount = 0;
      this.faintHandled = false;
    }

    label() {
      if (this.side.index === 0) return this.name;
      return this.battle.wild ? T('system.battle.label.wild', 'Wild {name}', { name: this.name }) : T('system.battle.label.foe', 'Foe {name}', { name: this.name });
    }

    hasType(t) { return this.types.indexOf(t) >= 0; }
    get hpFrac() { return this.maxhp ? this.hp / this.maxhp : 0; }
    get isActive() { return this.slot >= 0; }
    get ally() {
      const s = this.side;
      if (this.battle.slots < 2) return null;
      const o = s.active[1 - this.slot];
      return o && !o.fainted ? o : null;
    }
    get foes() { return this.battle.sides[1 - this.side.index].active.filter((m) => m && !m.fainted); }
    ref() { return { side: this.side.index, slot: this.slot }; }
    toString() { return 'BMon(' + this.name + ')'; }
  }

  // -------------------------------------------------------------------------------------------
  class Side {
    constructor(battle, index, cfg) {
      this.battle = battle;
      this.index = index;
      this.name = cfg.name || (index === 0 ? 'You' : 'Foe');
      this.isPlayer = !!cfg.player;
      this.trainer = cfg.trainer || null; // {name, class, ...} for trainer battles
      this.ai = cfg.ai === undefined ? 1 : cfg.ai; // 0 random ... 3 sharp
      this.party = cfg.party;
      this.mons = cfg.party.map((k, i) => new BMon(battle, this, k, i));
      this.active = new Array(battle.slots).fill(null);
      this.conds = {};
      this.bag = (cfg.bag || []).map((x) => ({ item: x.item, n: x.n === undefined ? 1 : x.n })); // AI-usable items
      this.usedItems = 0;
    }
    alive() { return this.mons.filter((m) => !m.fainted); }
    benched() { return this.mons.filter((m) => !m.fainted && m.slot < 0); }
    activeMons() { return this.active.filter((m) => m && !m.fainted); }
    trainerName() { return this.trainer ? this.trainer.name : T('system.battle.foe_trainer', 'The foe'); }
  }

  // -------------------------------------------------------------------------------------------
  class Battle {
    constructor(cfg) {
      this.cfg = cfg;
      this.format = cfg.format === 'double' ? 'double' : 'single';
      this.slots = this.format === 'double' ? 2 : 1;
      this.rng = cfg.rng || NP.rng;
      this.wild = !!cfg.wild;
      this.canRun = cfg.canRun !== undefined ? cfg.canRun : this.wild;
      this.style = cfg.style || 'set';
      this.log = [];
      this.turn = 0;
      this.weather = null;   // a "mood": {id, turns, source}
      this.field = {};
      this.ended = false;
      this.winner = null; // 0 = player side, 1 = foe side, null = none (fled/caught)
      this.endReason = null;
      this.caught = null;
      this.fled = false;
      this.runAttempts = 0;
      this.sides = cfg.sides.map((c, i) => new Side(this, i, c));
      this.data = cfg.data || {}; // free-form (badge count for obedience, etc.)
      this.moveUser = null;
      this.moldBreaker = false;
      this.lastMoveUsed = null;
      this._gen = null;
    }

    // ---- event log ------------------------------------------------------------------------
    add(e) { this.log.push(e); return e; }
    msg(text) { return this.add({ t: 'msg', text }); }
    /** a message looked up through NP.text (key 'system.battle.*') with an English fallback */
    tmsg(key, fallback, vars) { return this.msg(T(key, fallback, vars)); }
    drain() { const l = this.log; this.log = []; return l; }

    begin() {
      this._gen = this.run();
      return this.step();
    }
    step(answer) {
      const r = this._gen.next(answer);
      return { events: this.drain(), request: r.done ? null : r.value, done: !!r.done };
    }

    // ---- random helpers ---------------------------------------------------------------------
    rand(n) { return this.rng.int(n); }
    randChance(pct) { return this.rng.int(100) < pct; }

    // ---- hooks --------------------------------------------------------------------------------
    holdersOf(mon) {
      const hs = [];
      const suppressAbility = this.moldBreaker && this.moveUser && mon !== this.moveUser;
      const ab = mon.ability && !suppressAbility && !mon.volatiles.gastro ? NP.data.abilities[mon.ability] : null;
      if (ab) hs.push({ d: ab, data: mon.abilityData, kind: 'ability' });
      const it = mon.item ? NP.data.items[mon.item] : null;
      if (it && it.held && !mon.volatiles.embargo) hs.push({ d: it.held, data: mon.itemData || (mon.itemData = {}), kind: 'item' });
      if (mon.status && B.COND.status[mon.status]) hs.push({ d: B.COND.status[mon.status], data: mon.statusData, kind: 'status' });
      for (const id in mon.volatiles) {
        const d = B.COND.volatile[id];
        if (d) hs.push({ d, data: mon.volatiles[id], kind: 'volatile' });
      }
      for (const id in mon.side.conds) {
        const d = B.COND.side[id];
        if (d) hs.push({ d, data: mon.side.conds[id], kind: 'side' });
      }
      if (this.weather && B.COND.weather[this.weather.id]) hs.push({ d: B.COND.weather[this.weather.id], data: this.weather, kind: 'weather' });
      for (const id in this.field) {
        const d = B.COND.field[id];
        if (d) hs.push({ d, data: this.field[id], kind: 'field' });
      }
      return hs;
    }

    /** pass `value` through every `evt` handler on mon's holders (handler returns the new value, or undefined to leave it) */
    chain(evt, mon, value, ctx) {
      if (!mon) return value;
      for (const h of this.holdersOf(mon)) {
        const fn = h.d[evt];
        if (!fn) continue;
        const c = Object.assign({ battle: this, holder: mon, data: h.data, kind: h.kind, def: h.d }, ctx);
        const r = fn.call(h.d, c, value);
        if (r !== undefined) value = r;
      }
      return value;
    }

    /** call every `evt` handler; returns false if any returned false */
    fire(evt, mon, ctx) {
      if (!mon) return true;
      let ok = true;
      for (const h of this.holdersOf(mon)) {
        const fn = h.d[evt];
        if (!fn) continue;
        const c = Object.assign({ battle: this, holder: mon, data: h.data, kind: h.kind, def: h.d }, ctx);
        if (fn.call(h.d, c) === false) ok = false;
      }
      return ok;
    }

    /** like fire(), but handlers run sorted by def[orderKey] (default 50, ascending); stopOnFalse ends at the first false */
    fireOrdered(evt, mon, ctx, orderKey, stopOnFalse) {
      if (!mon) return true;
      const hs = this.holdersOf(mon).filter((h) => h.d[evt]);
      hs.sort((a, b) => (a.d[orderKey] === undefined ? 50 : a.d[orderKey]) - (b.d[orderKey] === undefined ? 50 : b.d[orderKey]));
      let ok = true;
      for (const h of hs) {
        const c = Object.assign({ battle: this, holder: mon, data: h.data, kind: h.kind, def: h.d }, ctx);
        if (h.d[evt].call(h.d, c) === false) {
          ok = false;
          if (stopOnFalse) break;
        }
      }
      return ok;
    }

    /** fire `evt` on every active mon (both sides), fastest first */
    fireAll(evt, ctx) {
      for (const m of this.activeBySpeed()) if (!m.fainted) this.fire(evt, m, ctx);
    }

    allActive() {
      const out = [];
      for (const s of this.sides) for (const m of s.active) if (m && !m.fainted) out.push(m);
      return out;
    }

    activeBySpeed() {
      const all = this.allActive().map((m) => ({ m, sp: this.getSpeed(m), r: this.rng.next() }));
      const tr = this.field.trickroom;
      all.sort((a, b) => (b.sp === a.sp ? a.r - b.r : tr ? a.sp - b.sp : b.sp - a.sp));
      return all.map((x) => x.m);
    }

    // ---- stats ---------------------------------------------------------------------------------
    getStat(mon, key, o) {
      o = o || {};
      let b = mon.boosts[key];
      if (o.ignoreBoost) b = 0;
      if (o.ignoreNeg && b < 0) b = 0;
      if (o.ignorePos && b > 0) b = 0;
      return Math.max(1, Math.floor(mon.stats[key] * stageMult(b)));
    }

    getSpeed(mon) {
      let v = Math.floor(mon.stats.spe * stageMult(mon.boosts.spe));
      v = this.chain('modSpeed', mon, v, {});
      return Math.max(1, Math.floor(v));
    }

    // ---- damage / heal -------------------------------------------------------------------------
    /**
     * Apply damage. info: {cause:'hit'|'status'|'hazard'|'recoil'|'weather'|'self'|..., source:BMon, move, crit}.
     * Goes through the holder's `onDamage` chain first (Sturdy / Endure / Focus Sash / substitutes).
     */
    damage(mon, amount, info) {
      info = info || {};
      if (mon.fainted) return 0;
      amount = Math.floor(amount);
      if (amount < 1) amount = 1;
      amount = Math.floor(this.chain('onDamage', mon, amount, info));
      if (amount <= 0) return 0;
      amount = Math.min(amount, mon.hp);
      const from = mon.hp;
      mon.hp = from - amount;
      this.add({ t: 'hp', who: mon, from, to: mon.hp, max: mon.maxhp, cause: info.cause || 'hit' });
      if (mon.hp <= 0) this.faint(mon, info);
      else this.checkItems(mon);
      return amount;
    }

    heal(mon, amount, info) {
      info = info || {};
      if (mon.fainted) return 0;
      amount = Math.floor(amount);
      amount = Math.min(amount, mon.maxhp - mon.hp);
      if (amount <= 0) return 0;
      const from = mon.hp;
      mon.hp = from + amount;
      this.add({ t: 'hp', who: mon, from, to: mon.hp, max: mon.maxhp, cause: info.cause || 'heal' });
      this.checkItems(mon);
      return amount;
    }

    faint(mon, info) {
      if (mon.faintHandled) return;
      mon.faintHandled = true;
      mon.hp = 0;
      this.add({ t: 'faint', who: mon });
      this.tmsg('system.battle.faint', '{mon} is too sleepy to go on!', { mon: mon.label() });
      const src = info && info.source;
      this.fire('onFaint', mon, { source: src, move: info && info.move });
      if (src && src !== mon && !src.fainted) this.fire('onSourceKO', src, { target: mon, move: info && info.move });
      // clear volatiles that point at this mon
      for (const m of this.allActive()) {
        for (const id in m.volatiles) if (m.volatiles[id] && m.volatiles[id].source === mon && B.COND.volatile[id] && B.COND.volatile[id].endsWithSource) delete m.volatiles[id];
      }
      if (mon.side.index === 1 && !this.ended) B.awardExp(this, mon);
    }

    /** berries & friends that trigger on HP/status change */
    checkItems(mon) {
      if (mon.fainted || !mon.item) return;
      const it = NP.data.items[mon.item];
      if (it && it.held && it.held.onUpdate) {
        const c = { battle: this, holder: mon, data: mon.itemData || (mon.itemData = {}), kind: 'item', def: it.held };
        it.held.onUpdate.call(it.held, c);
      }
    }

    consumeItem(mon, msg) {
      const it = mon.item;
      if (!it) return;
      mon.item = null;
      mon.itemData = {};
      mon.lastConsumed = it;
      this.add({ t: 'item', who: mon, item: it, consumed: true });
      if (msg) this.msg(msg);
    }

    // ---- stat boosts ------------------------------------------------------------------------------
    /** boosts: {atk:1, spe:-2, ...}. Returns true if anything changed. */
    boost(mon, boosts, source, effect, silent) {
      if (mon.fainted) return false;
      let b = Object.assign({}, boosts);
      b = this.chain('onTryBoost', mon, b, { source, effect });
      let changed = false;
      for (const k of BOOSTS) {
        const amt = b[k];
        if (!amt) continue;
        const cur = mon.boosts[k];
        const nxt = clamp(cur + amt, -6, 6);
        const real = nxt - cur;
        const vars = { mon: mon.label(), stat: B.statName(k) };
        if (!real) {
          if (!silent) this.tmsg(amt > 0 ? 'system.battle.boost.max' : 'system.battle.boost.min', amt > 0 ? "{mon}'s {stat} won't go any higher!" : "{mon}'s {stat} won't go any lower!", vars);
          continue;
        }
        mon.boosts[k] = nxt;
        changed = true;
        const mag = Math.abs(real);
        this.add({ t: 'boost', who: mon, stat: k, amt: real });
        if (!silent) {
          if (real > 0) this.tmsg('system.battle.boost.up' + Math.min(3, mag), mag >= 3 ? "{mon}'s {stat} rose drastically!" : mag === 2 ? "{mon}'s {stat} rose sharply!" : "{mon}'s {stat} rose!", vars);
          else this.tmsg('system.battle.boost.down' + Math.min(3, mag), mag >= 3 ? "{mon}'s {stat} severely fell!" : mag === 2 ? "{mon}'s {stat} harshly fell!" : "{mon}'s {stat} fell!", vars);
        }
      }
      if (changed) this.fire('onAfterBoost', mon, { boosts: b, source, effect });
      return changed;
    }

    // ---- status -------------------------------------------------------------------------------------
    canSetStatus(mon, status, source, effect, silent) {
      if (mon.fainted || mon.status) return false;
      const t = mon.types;
      if (status === 'brn' && t.indexOf('ember') >= 0) return false;
      if ((status === 'psn' || status === 'tox') && (t.indexOf('nettle') >= 0 || t.indexOf('iron') >= 0)) return false;
      if (status === 'frz' && t.indexOf('frost') >= 0) return false;
      const mood = this.weather && B.COND.weather[this.weather.id];
      if (mood && mood.blocksStatus && mood.blocksStatus.indexOf(status) >= 0) return false;
      if (mon.side.conds.safeguard && (!source || source.side !== mon.side)) return false;
      if (!this.fire('onSetStatus', mon, { status, source, effect, silent })) return false;
      return true;
    }

    setStatus(mon, status, source, effect, silent) {
      if (!this.canSetStatus(mon, status, source, effect, silent)) return false;
      mon.status = status;
      mon.statusData = {};
      const def = B.COND.status[status];
      if (status === 'slp') mon.statusData.turns = this.rng.range(2, 4); // 1-3 turns lost (Gen 5)
      if (status === 'tox') mon.statusData.n = 1;
      this.add({ t: 'status', who: mon, status });
      if (def && def.start && !silent) this.msg(def.start(mon));
      this.fire('onAfterSetStatus', mon, { status, source, effect });
      this.checkItems(mon);
      return true;
    }

    cureStatus(mon, silent) {
      if (!mon.status) return false;
      const old = mon.status;
      mon.status = null;
      mon.statusData = {};
      this.add({ t: 'status', who: mon, status: null });
      const def = B.COND.status[old];
      if (!silent && def && def.cure) this.msg(def.cure(mon));
      return true;
    }

    // ---- volatiles ----------------------------------------------------------------------------------------
    addVolatile(mon, id, source, effect, data) {
      if (mon.fainted) return false;
      const def = B.COND.volatile[id];
      if (!def) throw new Error('unknown volatile ' + id);
      if (mon.volatiles[id]) {
        if (def.onRestart) return def.onRestart({ battle: this, holder: mon, data: mon.volatiles[id], source, effect });
        return false;
      }
      if (def.canAdd && !def.canAdd({ battle: this, holder: mon, source, effect })) return false;
      if (!this.fire('onTryAddVolatile', mon, { id, source, effect })) return false;
      const d = Object.assign({ source: source || null, turnAdded: this.turn }, data || {});
      mon.volatiles[id] = d;
      if (def.duration) d.turns = typeof def.duration === 'function' ? def.duration(this) : def.duration;
      this.add({ t: 'volatile', who: mon, id, on: true });
      if (def.onStart) def.onStart({ battle: this, holder: mon, data: d, source, effect });
      return true;
    }

    removeVolatile(mon, id, silent) {
      const d = mon.volatiles[id];
      if (!d) return false;
      const def = B.COND.volatile[id];
      if (def && def.onEnd && !silent) def.onEnd({ battle: this, holder: mon, data: d });
      delete mon.volatiles[id];
      this.add({ t: 'volatile', who: mon, id, on: false });
      return true;
    }

    // ---- weather ("moods") / field / side conditions ----------------------------------------------------------------
    setWeather(id, source, turns) {
      if (this.weather && this.weather.id === id) return false;
      const def = B.COND.weather[id];
      if (!def) throw new Error('unknown mood ' + id);
      if (turns === undefined) {
        turns = def.duration === undefined ? 5 : def.duration;
        if (source && source.item && def.extendItem && source.item === def.extendItem) turns += 3;
      }
      this.weather = { id, turns, source: source || null };
      this.add({ t: 'weather', w: id });
      const s = typeof def.start === 'function' ? def.start({ battle: this, source }) : def.start;
      if (s) this.msg(s);
      if (def.onStart) def.onStart({ battle: this, source, data: this.weather });
      return true;
    }
    clearWeather() {
      if (!this.weather) return;
      const def = B.COND.weather[this.weather.id];
      this.weather = null;
      this.add({ t: 'weather', w: null });
      const s = def && (typeof def.end === 'function' ? def.end({ battle: this }) : def.end);
      if (s) this.msg(s);
    }

    addSideCond(side, id, source, data) {
      const def = B.COND.side[id];
      if (!def) throw new Error('unknown side condition ' + id);
      const cur = side.conds[id];
      if (cur) {
        if (def.layers && cur.layers < def.layers) {
          cur.layers++;
          this.add({ t: 'side', side: side.index, id, on: true, layers: cur.layers });
          if (def.onStart) def.onStart({ battle: this, side, data: cur, source, layers: cur.layers });
          return true;
        }
        return false;
      }
      const d = Object.assign({ source: source || null, turns: def.duration || 0, layers: 1 }, data || {});
      if (def.duration && source && source.item && def.extendItem && source.item === def.extendItem) d.turns += 3;
      side.conds[id] = d;
      this.add({ t: 'side', side: side.index, id, on: true, layers: 1 });
      if (def.onStart) def.onStart({ battle: this, side, data: d, source, layers: 1 });
      return true;
    }
    removeSideCond(side, id) {
      const d = side.conds[id];
      if (!d) return false;
      const def = B.COND.side[id];
      delete side.conds[id];
      this.add({ t: 'side', side: side.index, id, on: false });
      if (def && def.onEnd) def.onEnd({ battle: this, side, data: d });
      return true;
    }

    setField(id, source, turns) {
      const def = B.COND.field[id];
      if (!def) throw new Error('unknown field condition ' + id);
      if (this.field[id]) {
        // re-using a toggle field move ends it (Trick Room)
        if (def.toggle) { delete this.field[id]; this.add({ t: 'field', id, on: false }); if (def.onEnd) def.onEnd({ battle: this }); return true; }
        return false;
      }
      this.field[id] = { source: source || null, turns: turns === undefined ? def.duration || 5 : turns };
      this.add({ t: 'field', id, on: true });
      if (def.onStart) def.onStart({ battle: this, source });
      return true;
    }

    // ---- legality --------------------------------------------------------------------------------------------
    isTrapped(mon) {
      const it = mon.item ? NP.data.items[mon.item] : null;
      if (it && it.held && it.held.escapeTrap) return false;
      if (mon.volatiles.trapped || mon.volatiles.ingrain || mon.volatiles.bound) return true;
      for (const f of mon.foes) {
        const ab = f.ability ? NP.data.abilities[f.ability] : null;
        if (ab && ab.trapsFoes && ab.trapsFoes(f, mon, this)) return true;
      }
      return false;
    }

    /** moves the mon may choose this turn: [{idx, id, usable, reason}] */
    legalMoves(mon) {
      const out = [];
      mon.moves.forEach((m, idx) => {
        const def = NP.data.moves[m.id];
        let usable = m.pp > 0, reason = m.pp > 0 ? '' : 'no pp';
        if (usable && mon.volatiles.disable && mon.volatiles.disable.move === m.id) { usable = false; reason = 'disabled'; }
        if (usable && mon.volatiles.taunt && def.category === 'status') { usable = false; reason = 'taunted'; }
        if (usable && mon.choiceLock && mon.choiceLock !== m.id && mon.moves.some((x) => x.id === mon.choiceLock && x.pp > 0)) { usable = false; reason = 'locked'; }
        if (usable && mon.volatiles.encore && mon.volatiles.encore.move !== m.id) { usable = false; reason = 'encore'; }
        out.push({ idx, id: m.id, usable, reason });
      });
      return out;
    }

    canSwitchOut(mon) {
      return !this.isTrapped(mon) && mon.side.benched().length > 0;
    }

    /** choice forced by a multi-turn effect (charging, rampage, recharge) or null */
    forcedAction(mon) {
      const v = mon.volatiles;
      if (v.recharge) return { type: 'recharge' };
      if (v.twoturn) return { type: 'move', forced: true, moveId: v.twoturn.move, target: v.twoturn.target };
      if (v.lockedmove) return { type: 'move', forced: true, moveId: v.lockedmove.move, target: v.lockedmove.target };
      if (!this.legalMoves(mon).some((m) => m.usable)) return { type: 'move', forced: true, moveId: 'struggle', target: null };
      return null;
    }

    // ---- main loop ---------------------------------------------------------------------------------------------------
    *run() {
      this.add({ t: 'start', format: this.format, wild: this.wild });
      yield* this.sendLeads();
      while (!this.ended) {
        const choices = yield* this.collectChoices();
        if (this.ended) break;
        yield* this.doTurn(choices);
      }
      this.add({ t: 'end', winner: this.winner, reason: this.endReason, caught: this.caught, fled: this.fled });
    }

    *sendLeads() {
      for (const side of this.sides) {
        let slot = 0;
        for (const m of side.mons) {
          if (slot >= this.slots) break;
          if (m.fainted) continue;
          this.placeMon(side, slot, m, { initial: true });
          slot++;
        }
      }
      // entry effects for everyone, fastest first
      for (const m of this.activeBySpeed()) this.enterEffects(m, { initial: true });
    }

    placeMon(side, slot, mon, o) {
      o = o || {};
      side.active[slot] = mon;
      mon.slot = slot;
      mon.resetVolatile();
      mon.activeTurns = 0;
      mon.participants = new Set();
      // track who faced whom (for exp)
      for (const f of this.sides[1 - side.index].active) {
        if (f && !f.fainted) { f.participants.add(mon); mon.participants.add(f); }
      }
      this.add({ t: 'in', who: mon, slot, initial: !!o.initial, forced: !!o.forced });
    }

    enterEffects(mon, o) {
      if (mon.fainted) return;
      // hazards first (not at battle start)
      if (!(o && o.initial)) this.runHazards(mon);
      if (mon.fainted) return;
      this.fire('onSwitchIn', mon, { initial: !!(o && o.initial) });
      this.checkItems(mon);
      for (const f of mon.foes) this.fire('onFoeSwitchIn', f, { foe: mon });
    }

    runHazards(mon) {
      const conds = mon.side.conds;
      const vars = { mon: mon.label() };
      if (conds.stealthrock) {
        const mult = NP.typeEffect('pebble', mon.types);
        if (this.fire('onHazard', mon, { kind: 'stealthrock' })) {
          this.tmsg('system.battle.hazard.stealthrock', 'Pointed stones dug into {mon}!', vars);
          this.damage(mon, (mon.maxhp * mult) / 8, { cause: 'hazard' });
        }
      }
      if (mon.fainted) return;
      const grounded = this.isGrounded(mon);
      if (conds.spikes && grounded) {
        if (this.fire('onHazard', mon, { kind: 'spikes' })) {
          const l = conds.spikes.layers;
          this.tmsg('system.battle.hazard.spikes', '{mon} was hurt by the scattered pins!', vars);
          this.damage(mon, mon.maxhp / (l === 1 ? 8 : l === 2 ? 6 : 4), { cause: 'hazard' });
        }
      }
      if (mon.fainted) return;
      if (conds.toxicspikes && grounded) {
        if (mon.hasType('nettle')) {
          this.removeSideCond(mon.side, 'toxicspikes');
          this.tmsg('system.battle.hazard.toxicspikes_absorbed', '{mon} absorbed the toxic spikes!', vars);
        } else if (this.fire('onHazard', mon, { kind: 'toxicspikes' })) {
          this.setStatus(mon, conds.toxicspikes.layers >= 2 ? 'tox' : 'psn', null, { id: 'toxicspikes' });
        }
      }
    }

    isGrounded(mon) {
      if (mon.volatiles.ingrain || this.field.gravity) return true;
      if (mon.hasType('gale')) return false;
      const it = mon.item ? NP.data.items[mon.item] : null;
      if (mon.item === 'float_balloon' || (it && it.held && it.held.levitates) || mon.volatiles.magnetrise || mon.volatiles.telekinesis) return false;
      const ab = mon.ability ? NP.data.abilities[mon.ability] : null;
      if (ab && ab.levitates && !mon.volatiles.gastro) return false;
      return true;
    }

    *collectChoices() {
      const choices = [new Array(this.slots).fill(null), new Array(this.slots).fill(null)];
      for (const side of this.sides) {
        const need = [];
        for (let s = 0; s < this.slots; s++) {
          const mon = side.active[s];
          if (!mon || mon.fainted) continue;
          const forced = this.forcedAction(mon);
          if (forced) { choices[side.index][s] = forced; continue; }
          need.push(s);
        }
        if (!need.length) continue;
        if (side.isPlayer) {
          const ans = yield { need: 'actions', side: side.index, slots: need };
          need.forEach((s, i) => { choices[side.index][s] = this.sanitize(side.active[s], ans && ans[i]); });
        } else {
          for (const s of need) choices[side.index][s] = this.sanitize(side.active[s], B.AI.choose(this, side.active[s], s));
        }
      }
      return choices;
    }

    /** make sure a choice is legal; fall back to the first usable move */
    sanitize(mon, ch) {
      const fallback = () => {
        const lm = this.legalMoves(mon).find((m) => m.usable);
        return lm ? { type: 'move', move: lm.idx, target: this.defaultTarget(mon) } : { type: 'move', forced: true, moveId: 'struggle', target: this.defaultTarget(mon) };
      };
      if (!ch) return fallback();
      if (ch.type === 'move') {
        if (ch.forced) return ch;
        const lm = this.legalMoves(mon)[ch.move];
        if (!lm || !lm.usable) return fallback();
        return { type: 'move', move: ch.move, target: ch.target || this.defaultTarget(mon) };
      }
      if (ch.type === 'switch') {
        const to = mon.side.mons[ch.to];
        if (!to || to.fainted || to.slot >= 0 || !this.canSwitchOut(mon)) return fallback();
        return ch;
      }
      if (ch.type === 'run') return this.canRun ? ch : fallback();
      if (ch.type === 'item' || ch.type === 'spool') return ch;
      return fallback();
    }

    defaultTarget(mon) {
      const foes = mon.foes;
      if (!foes.length) return null;
      const f = foes[this.rand(foes.length)];
      return { side: f.side.index, slot: f.slot };
    }

    getMoveOf(mon, ch) {
      if (ch.moveId) return B.getMove(ch.moveId);
      return B.getMove(mon.moves[ch.move].id);
    }

    *doTurn(choices) {
      this.turn++;
      for (const m of this.allActive()) { m.moveThisTurn = false; m.hurtThisTurn = false; m.lastHit = m.lastHit && m.lastHit.turn === this.turn ? m.lastHit : null; }
      const q = [];
      for (const side of this.sides) {
        for (let s = 0; s < this.slots; s++) {
          const mon = side.active[s], ch = choices[side.index][s];
          if (!mon || !ch || mon.fainted) continue;
          const a = { mon, ch, type: ch.type, rand: this.rng.next(), bracket: 0 };
          if (ch.type === 'move') {
            const mv = this.getMoveOf(mon, ch);
            a.priority = this.chain('modPriority', mon, mv.priority || 0, { move: mv });
            a.bracket = this.chain('modBracket', mon, 0, { move: mv });
            a.speed = this.getSpeed(mon);
          } else if (ch.type === 'recharge') { a.priority = 0; a.speed = this.getSpeed(mon); }
          else if (ch.type === 'switch') { a.priority = 7; a.speed = this.getSpeed(mon); }
          else if (ch.type === 'run') { a.priority = 8; a.speed = this.getSpeed(mon); }
          else { a.priority = 6; a.speed = this.getSpeed(mon); }
          q.push(a);
        }
      }
      const tr = !!this.field.trickroom;
      q.sort((a, b) => (b.priority !== a.priority ? b.priority - a.priority : b.bracket !== a.bracket ? b.bracket - a.bracket : a.speed !== b.speed ? (tr ? a.speed - b.speed : b.speed - a.speed) : a.rand - b.rand));
      this.queue = q;
      while (this.queue.length) {
        const a = this.queue.shift();
        yield* this.runAction(a);
        if (this.ended) return;
        this.checkEnd();
        if (this.ended) return;
      }
      yield* this.endOfTurn();
      if (this.ended) return;
      yield* this.replaceFainted();
    }

    *runAction(a) {
      const mon = a.mon;
      if (mon.slot < 0) return; // switched out / gone
      switch (a.type) {
        case 'switch': return yield* this.doSwitch(mon, a.ch.to);
        case 'run': return this.attemptRun(mon);
        case 'item': return yield* this.doItem(a);
        case 'spool': return this.doSpool(a);
        case 'recharge':
          delete mon.volatiles.recharge;
          this.tmsg('system.battle.recharge', '{mon} must recharge!', { mon: mon.label() });
          return;
        case 'move':
          if (mon.fainted) return;
          return yield* B.doMove(this, mon, a.ch);
      }
    }

    // ---- switching ----------------------------------------------------------------------------------------------
    /** o: {forced, silent, baton:{boosts,volatiles}} */
    *doSwitch(mon, toIdx, o) {
      o = o || {};
      const side = mon.side;
      const to = side.mons[toIdx];
      if (!to || to.fainted || to.slot >= 0) return;
      if (!o.forced && this.isTrapped(mon)) { this.tmsg('system.battle.cant_withdraw', "{mon} can't be withdrawn!", { mon: mon.label() }); return; }
      const slot = mon.slot;
      this.withdraw(mon, o);
      this.placeMon(side, slot, to, { forced: o.forced });
      if (o.baton) {
        to.boosts = Object.assign({}, o.baton.boosts);
        for (const id in o.baton.volatiles) to.volatiles[id] = o.baton.volatiles[id];
      }
      if (side.index === 0) this.tmsg('system.battle.go', 'Go! {mon}!', { mon: to.name });
      else this.tmsg('system.battle.sent_out', '{trainer} sent out {mon}!', { trainer: side.trainerName(), mon: to.name });
      this.enterEffects(to);
    }

    withdraw(mon, o) {
      o = o || {};
      if (mon.slot < 0) return;
      this.fire('onSwitchOut', mon, {});
      if (!o.silent) {
        if (mon.side.index === 0) this.tmsg('system.battle.come_back', '{mon}, come back!', { mon: mon.name });
        else this.tmsg('system.battle.withdrew', '{trainer} withdrew {mon}!', { trainer: mon.side.trainerName(), mon: mon.name });
      }
      this.add({ t: 'out', who: mon, slot: mon.slot });
      mon.side.active[mon.slot] = null;
      const slot = mon.slot;
      mon.slot = -1;
      if (mon.status === 'tox') mon.statusData.n = 1; // the toxic counter resets on switching (Gen 5)
      // trapping effects end when their source leaves
      for (const m of this.allActive()) {
        for (const id in m.volatiles) if (m.volatiles[id] && m.volatiles[id].source === mon && B.COND.volatile[id] && B.COND.volatile[id].endsWithSource) delete m.volatiles[id];
      }
      mon.resetVolatile();
      mon.prevSlot = slot;
      for (const f of this.sides[1 - mon.side.index].active) if (f) f.participants.delete(mon);
    }

    // ---- items / spool / run -----------------------------------------------------------------------------------
    *doItem(a) {
      B.useItemInBattle(this, a.mon, a.ch);
    }

    doSpool(a) {
      B.throwSpool(this, a.mon, a.ch);
    }

    attemptRun(mon) {
      if (!this.canRun) { this.tmsg('system.battle.no_run', "No! There's no running from this battle!"); return; }
      this.runAttempts++;
      const foe = mon.foes[0];
      const a = this.getSpeed(mon), b = foe ? Math.max(1, Math.floor(this.getSpeed(foe) / 4) % 256) : 1;
      let ok = false;
      const ab = mon.ability && NP.data.abilities[mon.ability];
      const it = mon.item && NP.data.items[mon.item];
      if ((it && it.held && it.held.alwaysRun) || (ab && ab.alwaysRun)) ok = true;
      else if (!foe || a >= this.getSpeed(foe)) ok = true;
      else {
        const f = Math.floor((a * 128) / b) + 30 * (this.runAttempts - 1);
        ok = f > 255 || this.rand(256) < f;
      }
      if (this.isTrapped(mon)) ok = false;
      if (ok) {
        this.tmsg('system.battle.got_away', 'Got away safely!');
        this.fled = true;
        this.end(null, 'fled');
      } else this.tmsg('system.battle.cant_escape', "Can't escape!");
    }

    // ---- turn end (order documented in docs/battle-engine.md) ----------------------------------------------------------
    *endOfTurn() {
      // 1. mood ("weather"): per-Kigu residual, continuing message, countdown
      if (this.weather) {
        const def = B.COND.weather[this.weather.id];
        if (def && def.continueMsg) {
          const s = typeof def.continueMsg === 'function' ? def.continueMsg({ battle: this }) : def.continueMsg;
          if (s) this.msg(s);
        }
        if (def && def.residual) for (const m of this.activeBySpeed()) { if (!m.fainted && this.weather) def.residual({ battle: this, holder: m, data: this.weather, mood: this.weather.id }); }
        if (this.weather && this.weather.turns > 0) {
          this.weather.turns--;
          if (this.weather.turns === 0) this.clearWeather();
        }
      }
      // 2. per-Kigu residuals in speed order: item, status, volatiles, ability ... sorted by def.residualOrder
      for (const m of this.activeBySpeed()) {
        if (m.fainted) continue;
        m.activeTurns++;
        this.fireOrdered('onResidual', m, {}, 'residualOrder', false);
        this.checkItems(m);
        // duration-bound volatiles
        for (const id of Object.keys(m.volatiles)) {
          const v = m.volatiles[id];
          if (!v) continue;
          const def = B.COND.volatile[id];
          if (def && def.duration && v.turns !== undefined && !def.manualTurns) {
            v.turns--;
            if (v.turns <= 0) this.removeVolatile(m, id);
          }
        }
        // one-turn volatiles
        for (const id of ['flinch', 'protect', 'endure', 'roost', 'helpinghand']) if (m.volatiles[id]) delete m.volatiles[id];
        if (!m.volatiles.protectedNow) m.protectCount = 0; // a protect-style move was NOT used this turn
        delete m.volatiles.protectedNow;
      }
      // 3. side conditions
      for (const side of this.sides) {
        for (const id of Object.keys(side.conds)) {
          const c = side.conds[id], def = B.COND.side[id];
          if (def && def.residual) def.residual({ battle: this, side, data: c });
          if (def && def.duration) {
            c.turns--;
            if (c.turns <= 0) this.removeSideCond(side, id);
          }
        }
      }
      // 4. field conditions
      for (const id of Object.keys(this.field)) {
        const f = this.field[id], def = B.COND.field[id];
        if (def && def.residual) def.residual({ battle: this });
        f.turns--;
        if (f.turns <= 0) { delete this.field[id]; this.add({ t: 'field', id, on: false }); if (def && def.onEnd) def.onEnd({ battle: this }); }
      }
      this.checkEnd();
    }

    *replaceFainted() {
      // "about to send out" prompt for trainer battles in shift style
      for (const side of this.sides) {
        for (let s = 0; s < this.slots; s++) {
          const mon = side.active[s];
          if (mon && !mon.fainted) continue;
          if (mon) { side.active[s] = null; mon.slot = -1; this.add({ t: 'out', who: mon, slot: s, fainted: true }); }
          if (side.benched().length === 0) continue;
          let pick;
          if (side.isPlayer) {
            pick = yield { need: 'replace', side: side.index, slot: s };
            const cand = side.mons[pick];
            if (!cand || cand.fainted || cand.slot >= 0) pick = side.benched()[0].idx;
          } else {
            // shift style: offer the player a free switch before the foe's next mon arrives
            const pl = this.sides[0];
            if (!this.wild && this.style === 'shift' && pl.activeMons().length && pl.benched().length && this.slots === 1) {
              const next = B.AI.pickReplacement(this, side, s);
              this.tmsg('system.battle.about_to', '{trainer} is about to send out {mon}.', { trainer: side.trainerName(), mon: next.name });
              const ans = yield { need: 'shift', foe: next.idx };
              if (ans !== null && ans !== undefined) {
                const cur = pl.active[0];
                if (cur && !cur.fainted) yield* this.doSwitch(cur, ans, { forced: true });
              }
              pick = next.idx;
            } else pick = B.AI.pickReplacement(this, side, s).idx;
          }
          const m = side.mons[pick];
          this.placeMon(side, s, m, {});
          if (side.index === 0) this.tmsg('system.battle.go', 'Go! {mon}!', { mon: m.name });
          else this.tmsg('system.battle.sent_out', '{trainer} sent out {mon}!', { trainer: side.trainerName(), mon: m.name });
          this.enterEffects(m);
          this.checkEnd();
          if (this.ended) return;
        }
      }
    }

    checkEnd() {
      if (this.ended) return;
      const a0 = this.sides[0].alive().length, a1 = this.sides[1].alive().length;
      if (a0 === 0 && a1 === 0) this.end(1, 'draw');
      else if (a1 === 0) this.end(0, 'win');
      else if (a0 === 0) this.end(1, 'lose');
    }

    end(winner, reason) {
      if (this.ended) return;
      this.ended = true;
      this.winner = winner;
      this.endReason = reason;
      this.allActive().forEach((m) => this.fire('onBattleEnd', m, {}));
    }
  }

  B.BMon = BMon;
  B.Side = Side;
  B.Battle = Battle;
})(typeof globalThis !== 'undefined' ? globalThis : window);
