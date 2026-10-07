/* NP.BattleScene — plays an NP.Battle: backgrounds, sprites, HP boxes, menus, event playback, spool throwing, exp/levels. */
(function (root) {
  'use strict';
  const NP = (root.NP = root.NP || {});
  const { Input, ui, Scene, Font } = NP;
  const A = () => NP.assets;
  const B = NP.Battle;

  const FULL = { x: 0, y: 112, w: 240, h: 48 };
  const FX = { ember: 'flame', tide: 'drop', sprout: 'leaf', volt: 'bolt', frost: 'flake', pebble: 'rock', gale: 'gust', dream: 'star', spook: 'shadow', buzz: 'sparkle', fluff: 'hit_normal', brawl: 'punch', nettle: 'poison', terra: 'dust', shade: 'shadow', iron: 'slash', drake: 'glow' };

  class BattleScene extends Scene {
    constructor(cfg) {
      super('dark');
      this.cfg = cfg;
      this.result = null;
      this.disp = [null, null];
      this.fx = null;
      this.bgInfo = null;
      this.hero = null;       // hero back sprite state {x}
      this.foeTrainer = null; // trainer front sprite state {x}
      this.thrown = null;     // spool in flight
      this.menuInfo = null;
      this.expShown = null;
      this.levelBox = null;
      this.shake = 0;
      this.xpBars = {};
    }

    enter() {
      const st = NP.state, cfg = this.cfg;
      const self = this;
      this.bgInfo = A().battleBg(cfg.bg || 'grass');
      const foeSide = { party: cfg.foe, ai: cfg.trainer ? cfg.trainer.ai : 1 };
      if (cfg.trainer) foeSide.trainer = { name: cfg.trainer.cls + ' ' + cfg.trainer.name, class: cfg.trainer.cls };
      this.battle = new B.Battle({
        wild: !!cfg.wild, style: st.opts.battleStyle || 'shift', rng: NP.rng,
        sides: [{ player: true, name: st.name, party: st.party }, foeSide],
        consume: (id) => NP.State.removeItem(id, 1),
        data: { badges: st.badges.filter(Boolean).length },
      });
      if (cfg.trainer) this.foeTrainer = { x: 172 };
      this.hero = { x: 58 };
      this.spawn(this.run(), 'battle');
    }

    // ------------------------------------------------------------------------------------ helpers
    anchor(side) {
      const b = this.bgInfo;
      return side === 0 ? { x: b.playerBase.x, y: b.playerBase.y } : { x: b.enemyBase.x, y: b.enemyBase.y };
    }
    dsp(mon) { return this.disp[mon.side.index]; }

    setDisp(mon) {
      const k = mon.kigu;
      const a = this.anchor(mon.side.index);
      this.disp[mon.side.index] = {
        mon, k, hp: mon.hp, maxhp: mon.maxhp, name: mon.name, level: mon.level, status: mon.status, species: k.species, alt: k.alt,
        x: a.x, y: a.y, offx: 0, offy: 0, alpha: 0, flash: 0, vis: true, exp: NP.Kigu.expProgress(k), blink: 0,
      };
      NP.State.seen(k.species);
    }

    *msgWait(text, o) {
      this.msg.begin(text, Object.assign({ auto: 22, box: FULL }, o || {}));
      while (this.msg.active) { this.msg.update(); yield; }
    }

    *tween(obj, prop, to, frames) {
      const from = obj[prop];
      for (let i = 1; i <= frames; i++) { obj[prop] = from + (to - from) * (i / frames); yield; }
      obj[prop] = to;
    }

    // ------------------------------------------------------------------------------------ main loop
    *run() {
      const b = this.battle, cfg = this.cfg;
      NP.Game.fadeTo(0, 14);
      let s = b.begin();
      let first = true;
      let guard = 0;
      while (guard++ < 5000) {
        if (first) {
          // show the foe before our own Kigu
          const init = s.events.filter((e) => e.t === 'in' && e.initial);
          const rest = s.events.filter((e) => !(e.t === 'in' && e.initial));
          init.sort((a, c) => c.who.side.index - a.who.side.index);
          s.events = rest.filter((e) => e.t === 'start').concat(init, rest.filter((e) => e.t !== 'start'));
          first = false;
        }
        yield* this.play(s.events);
        if (s.done) break;
        let ans;
        const r = s.request;
        if (r) ans = yield* this.request(r);
        s = b.step(ans);
      }
      yield* this.finish();
    }

    // ------------------------------------------------------------------------------ event playback
    *play(events) {
      const list = events.slice();
      for (let i = 0; i < list.length; i++) {
        if (list[i].t === 'move' && list[i + 1] && list[i + 1].t === 'msg') { const t = list[i]; list[i] = list[i + 1]; list[i + 1] = t; }
      }
      for (const e of list) {
        if (this.pendingLunge && e.t !== 'hit' && e.t !== 'hp' && e.t !== 'msg') yield* this.unlunge();
        yield* this.playEvent(e);
      }
      yield* this.unlunge();
    }

    *playEvent(e) {
      const b = this.battle;
      switch (e.t) {
        case 'msg': yield* this.msgWait(e.text); break;
        case 'in': yield* this.evIn(e); break;
        case 'out': {
          const d = this.disp[e.who.side.index];
          if (d && d.mon === e.who && !e.fainted) { yield* this.tween(d, 'alpha', 0, 8); d.vis = false; }
          break;
        }
        case 'move': yield* this.evMove(e); break;
        case 'hit': yield* this.evHit(e); break;
        case 'hp': yield* this.evHp(e); break;
        case 'faint': {
          const d = this.dsp(e.who);
          NP.snd.cry(e.who.species && e.who.kigu.species);
          NP.snd.sfx('faint');
          if (d && d.mon === e.who) { const y0 = d.offy; for (let i = 1; i <= 16; i++) { d.offy = y0 + i * 2; d.alpha = 1 - i / 16; yield; } d.vis = false; }
          break;
        }
        case 'boost': {
          const d = this.dsp(e.who);
          NP.snd.sfx(e.amt > 0 ? 'stat_up' : 'stat_down');
          yield* this.playFx(e.amt > 0 ? 'stat_up' : 'stat_down', d);
          break;
        }
        case 'status': {
          const d = this.dsp(e.who);
          if (d && d.mon === e.who) d.status = e.status;
          if (e.status) { NP.snd.sfx('status'); yield* this.wait(8); }
          break;
        }
        case 'exp': yield* this.evExp(e); break;
        case 'spool': yield* this.evSpool(e); break;
        case 'miss': yield* this.wait(6); break;
        default: break;
      }
    }

    *evIn(e) {
      const mon = e.who;
      const side = mon.side.index;
      const tr = this.cfg.trainer;
      if (e.initial) {
        if (side === 1) {
          this.setDisp(mon);
          if (this.cfg.wild) {
            this.disp[1].alpha = 0; this.disp[1].offx = 60;
            NP.snd.cry(mon.kigu.species);
            for (let i = 1; i <= 18; i++) { this.disp[1].offx = 60 * (1 - i / 18); this.disp[1].alpha = Math.min(1, i / 8); yield; }
            yield* this.msgWait('A wild ' + mon.name + ' appeared!', { auto: 34 });
          } else {
            this.disp[1].vis = false;
            yield* this.msgWait(tr.cls + ' ' + tr.name + ' would like to battle!', { auto: 40 });
            yield* this.msgWait(tr.cls + ' ' + tr.name + ' sent out ' + mon.name + '!', { auto: 22 });
            if (this.foeTrainer) { const f = this.foeTrainer; for (let i = 0; i < 16; i++) { f.x += 6; yield; } this.foeTrainer = null; }
            const d = this.disp[1];
            d.vis = true; d.alpha = 0;
            NP.snd.cry(mon.kigu.species);
            for (let i = 1; i <= 14; i++) { d.alpha = i / 14; d.offy = -8 * (1 - i / 14); yield; }
            d.offy = 0;
          }
        } else {
          yield* this.msgWait('Go! ' + mon.name + '!', { auto: 14 });
          if (this.hero) { const h = this.hero; for (let i = 0; i < 18; i++) { h.x -= 4; yield; } this.hero = null; }
          this.setDisp(mon);
          const d = this.disp[0];
          NP.snd.cry(mon.kigu.species);
          for (let i = 1; i <= 14; i++) { d.alpha = i / 14; d.offy = -10 * (1 - i / 14); yield; }
          d.offy = 0;
        }
        return;
      }
      // mid-battle arrival (message already came from the core)
      this.setDisp(mon);
      const d = this.disp[side];
      NP.snd.cry(mon.kigu.species);
      for (let i = 1; i <= 14; i++) { d.alpha = i / 14; d.offy = -10 * (1 - i / 14); yield; }
      d.offy = 0;
    }

    *evMove(e) {
      const d = this.dsp(e.who);
      const mv = NP.data.moves[e.move];
      if (!d || !mv) return;
      const dir = e.who.side.index === 0 ? 1 : -1;
      if (NP.Game.opts.battleAnim === false) { yield* this.wait(4); return; }
      if (mv.category === 'physical') {
        for (let i = 0; i < 6; i++) { d.offx = dir * i * 3; yield; }
        d.offx = dir * 18;
        yield* this.wait(1);
        this.pendingLunge = d;
      } else if (mv.category === 'special' || mv.category === 'status') {
        for (let i = 0; i < 6; i++) { d.offy = -i; yield; }
        this.pendingLunge = d;
        const tgtSide = mv.target === 'self' ? e.who.side.index : 1 - e.who.side.index;
        const t = this.disp[tgtSide];
        if (mv.category === 'special') yield* this.playFx(FX[mv.type] || 'star', t);
        else if (mv.boosts || mv.heal) { /* boost event plays its own fx */ } else yield* this.playFx('sparkle', t);
      }
    }

    *unlunge() {
      const d = this.pendingLunge;
      if (!d) return;
      this.pendingLunge = null;
      const ox = d.offx, oy = d.offy;
      for (let i = 1; i <= 6; i++) { d.offx = ox * (1 - i / 6); d.offy = oy * (1 - i / 6); yield; }
      d.offx = 0; d.offy = 0;
    }

    *evHit(e) {
      const d = this.dsp(e.who);
      if (!d || d.mon !== e.who) return;
      NP.snd.sfx(e.eff > 1 ? 'hit_super' : e.eff < 1 && e.eff > 0 ? 'hit_weak' : 'hit');
      const mv = NP.data.moves[e.move];
      if (mv && mv.category === 'physical') yield* this.playFx(e.eff > 1 ? 'hit_super' : e.eff < 1 ? 'hit_weak' : 'hit_normal', d);
      if (NP.Game.opts.battleAnim !== false) {
        for (let i = 0; i < 12; i++) { d.blink = i % 4 < 2 ? 1 : 0; d.offx = (i % 2 ? 2 : -2) * (e.eff > 1 ? 1.5 : 1); yield; }
        d.blink = 0; d.offx = 0;
      }
      yield* this.unlunge();
    }

    *playFx(name, d) {
      if (!d || NP.Game.opts.battleAnim === false) return;
      const n = A().fxFrames(name);
      const f0 = A().fx(name, 0);
      if (!f0) { yield* this.wait(6); return; }
      for (let f = 0; f < n * 3; f++) {
        this.fx = { bmp: A().fx(name, Math.floor(f / 3) % n), x: d.x + d.offx, y: d.y - 28 };
        yield;
      }
      this.fx = null;
    }

    *evHp(e) {
      const d = this.dsp(e.who);
      if (!d || d.mon !== e.who) return;
      if (e.cause === 'heal' || e.cause === 'item' || e.cause === 'drain') NP.snd.sfx('heal_tick');
      const steps = Math.max(6, Math.min(40, Math.abs(e.to - e.from) / e.max * 60));
      d.maxhp = e.max;
      for (let i = 1; i <= steps; i++) {
        d.hp = e.from + (e.to - e.from) * (i / steps);
        yield;
      }
      d.hp = e.to;
      if (e.who.side.index === 0 && e.to > 0 && e.to / e.max < 0.2) NP.snd.sfx('low_hp');
      yield* this.wait(4);
    }

    *evExp(e) {
      const d = this.dsp(e.who);
      const k = e.who.kigu;
      yield* this.msgWait(e.who.name + ' gained ' + e.amount + ' Exp. Points!', { auto: 24 });
      const isActive = d && d.mon === e.who;
      const g = NP.Kigu.sp(k).growth || 'mediumFast';
      NP.snd.sfx('exp');
      for (const lv of e.levels) {
        if (isActive) { yield* this.tween(d, 'exp', 1, 14); }
        NP.snd.jingle('j_levelup');
        if (isActive) { d.level = lv.level; d.maxhp = e.who.maxhp; d.hp = k.hp; d.exp = 0; }
        yield* this.msgWait(e.who.name + ' grew to Lv' + lv.level + '!', { auto: 40 });
        yield* this.showLevelBox(lv);
        yield* this.learnMoves(k, e.who, lv.learn);
      }
      if (isActive) { yield* this.tween(d, 'exp', NP.Kigu.expProgress(k), 14); }
      if (isActive) { d.maxhp = e.who.maxhp; d.hp = k.hp; }
    }

    *showLevelBox(lv) {
      this.levelBox = lv;
      yield* this.wait(10);
      while (!Input.pressed.a && !Input.pressed.b) yield;
      this.levelBox = null;
      yield;
    }

    *learnMoves(k, mon, ids) {
      const name = NP.Kigu.displayName(k);
      for (const id of ids) {
        if (NP.Kigu.knows(k, id)) continue;
        const mv = NP.data.moves[id];
        if (NP.Kigu.learnMove(k, id)) { NP.snd.sfx('levelup'); yield* this.msgWait(name + ' learned ' + mv.name + '!', { auto: 36 }); continue; }
        this.msg.begin(name + ' wants to learn ' + mv.name + ', but already knows four moves. Forget a move?', { keep: true, box: FULL });
        while (this.msg.active) { this.msg.update(); yield; }
        if (yield* this.yesno()) {
          const idx = yield* this.choose(k.moves.map((m) => NP.data.moves[m.id].name).concat(['Keep old moves']), { x: 100, y: 20 });
          if (idx >= 0 && idx < 4) {
            const old = NP.data.moves[k.moves[idx].id].name;
            NP.Kigu.forgetAndLearn(k, idx, id);
            this.msg.close();
            yield* this.msgWait(name + ' forgot ' + old + ' and learned ' + mv.name + '!', { auto: 40 });
            continue;
          }
        }
        this.msg.close();
        yield* this.msgWait(name + ' did not learn ' + mv.name + '.', { auto: 30 });
      }
    }

    *evSpool(e) {
      const d = this.disp[1];
      if (!d) return;
      const kind = e.kind;
      const p0 = { x: 58, y: 70 }, p1 = { x: d.x, y: d.y - 30 };
      NP.snd.sfx('throw');
      for (let i = 0; i <= 26; i++) {
        const t = i / 26;
        this.thrown = { kind, f: i >> 1, x: p0.x + (p1.x - p0.x) * t, y: p0.y + (p1.y - p0.y) * t - Math.sin(t * Math.PI) * 40 };
        yield;
      }
      // the Kigu is drawn into the spool
      const x = p1.x, gy = d.y - 4;
      for (let i = 1; i <= 10; i++) { d.alpha = 1 - i / 10; this.thrown.f = 0; yield; }
      for (let i = 0; i < 12; i++) { this.thrown.y += (gy - this.thrown.y) * 0.4; yield; }
      this.thrown.y = gy;
      for (let s = 0; s < e.shakes; s++) {
        yield* this.wait(14);
        NP.snd.sfx('shake');
        for (let i = 0; i < 14; i++) { this.thrown.x = x + Math.sin(i / 14 * Math.PI * 2) * 4; this.thrown.f = i >> 2; yield; }
        this.thrown.x = x;
      }
      yield* this.wait(14);
      if (e.caught) {
        NP.snd.sfx('caught');
        this.sparkles = 28;
        yield* this.wait(30);
        this.caughtPos = { x, y: gy };
      } else {
        NP.snd.sfx('flee');
        this.thrown = null;
        for (let i = 1; i <= 10; i++) { d.alpha = i / 10; yield; }
      }
    }

    // -------------------------------------------------------------------------------- player input
    *request(r) {
      const b = this.battle;
      if (r.need === 'actions') return yield* this.actionMenu(r);
      if (r.need === 'replace') {
        for (;;) {
          const idx = yield* this.pickParty({ mode: 'battle', forced: true, prompt: 'Send out which Kigu?' });
          if (idx >= 0) return idx;
        }
      }
      if (r.need === 'shift') {
        const foe = b.sides[1].mons[r.foe];
        this.msg.begin('Will you change Kigu?', { keep: true, box: FULL });
        while (this.msg.active) { this.msg.update(); yield; }
        const yes = yield* this.yesno(true);
        this.msg.close();
        if (!yes) return null;
        const idx = yield* this.pickParty({ mode: 'battle', prompt: 'Send out which Kigu?' });
        return idx >= 0 ? idx : null;
      }
      return null;
    }

    *pickParty(o) {
      const s = new NP.PartyScene(Object.assign({ battle: this.battle }, o));
      NP.Game.push(s);
      yield* this.waitFor(() => s.finished);
      return s.result === undefined || s.result === null ? -1 : s.result;
    }

    *actionMenu(r) {
      const b = this.battle;
      const mon = b.sides[0].active[r.slots[0]];
      let cur = 0;
      for (;;) {
        this.msg.begin('What will ' + mon.name + ' do?', { keep: true, auto: 1e9, box: { x: 0, y: 112, w: 136, h: 48 }, speed: 999 });
        this.msg.update();
        const items = ['Fight', 'Bag', 'Kigu', 'Run'];
        const m = new ui.Menu({ items, theme: 'dark', x: 136, y: 112, w: 104, h: 48, cols: 2, colW: 46, cancelable: false, cursor: cur, pad: 8 });
        this.msg.opts.keep = true;
        const res = yield* this.menu(m);
        cur = res.index;
        const pick = items[res.index];
        this.msg.close();
        if (pick === 'Fight') {
          const forced = b.forcedAction(mon);
          const mv = yield* this.moveMenu(mon);
          if (mv < 0) continue;
          return [{ type: 'move', move: mv, target: b.defaultTarget(mon) }];
        }
        if (pick === 'Bag') {
          const s = new NP.BagScene({ mode: 'battle', wild: this.cfg.wild, battle: b });
          NP.Game.push(s);
          yield* this.waitFor(() => s.finished);
          const r2 = s.result;
          if (!r2) continue;
          if (r2.kind === 'spool') return [{ type: 'spool', item: r2.item }];
          return [{ type: 'item', item: r2.item, party: r2.party }];
        }
        if (pick === 'Kigu') {
          const idx = yield* this.pickParty({ mode: 'battle', prompt: 'Send out which Kigu?' });
          if (idx < 0) continue;
          if (idx === mon.idx) { yield* this.msgWait(mon.name + ' is already in battle!', { auto: 30 }); continue; }
          if (!b.canSwitchOut(mon)) { yield* this.msgWait(mon.name + " can't be withdrawn!", { auto: 30 }); continue; }
          return [{ type: 'switch', to: idx }];
        }
        if (pick === 'Run') {
          if (!b.canRun) { yield* this.msgWait("No! There's no running from a Tailor battle!", { auto: 40 }); continue; }
          return [{ type: 'run' }];
        }
      }
    }

    *moveMenu(mon) {
      const b = this.battle;
      const legal = b.legalMoves(mon);
      const items = mon.moves.map((m, i) => ({ label: NP.data.moves[m.id].name, disabled: !legal[i].usable, m }));
      const menu = new ui.Menu({ items, theme: 'dark', x: 0, y: 112, w: 160, h: 48, cols: 2, colW: 74, cancelable: true, pad: 8 });
      // a usable-moves guard: struggle is handled by the core when none is usable
      this.moveMenuRef = menu;
      this.menus.push(menu);
      yield;
      let res;
      while (!(res = menu.update())) yield;
      this.menus = this.menus.filter((x) => x !== menu);
      this.moveMenuRef = null;
      return res.type === 'select' ? res.index : -1;
    }

    // ------------------------------------------------------------------------------------ finish
    *finish() {
      const b = this.battle, cfg = this.cfg, st = NP.state;
      this.thrown = this.thrown;
      let outcome = { winner: b.winner, fled: b.fled, caught: !!b.caught, reason: b.endReason };
      if (b.caught) {
        yield* this.wait(10);
        this.thrown = null;
        yield* this.jingle('j_caught');
        const k = b.caught;
        k.hp = Math.max(1, k.hp);
        k.ot = st.name; k.metMap = NP.state.pos.map;
        const where = NP.State.addKigu(k);
        yield* this.msgWait(NP.Kigu.displayName(k) + ' was added to ' + (where === 'party' ? 'your team' : 'storage') + '!', { auto: 50 });
        // sketchbook entry
      } else if (b.winner === 0 && cfg.trainer) {
        const tr = cfg.trainer;
        NP.snd.jingle(tr.master ? 'j_win_master' : 'j_win_tailor');
        yield* this.msgWait('You defeated ' + tr.cls + ' ' + tr.name + '!', { auto: 40 });
      } else if (b.winner === 0 && cfg.wild) {
        NP.snd.jingle('j_win_wild');
        yield* this.wait(20);
      } else if (b.winner === 1 && cfg.trainer && cfg.trainer.lose) {
        yield* this.msgWait(NP.fmt(cfg.trainer.lose), { auto: 50 });
      }
      // evolutions
      if (b.winner === 0 || b.caught) {
        for (const k of st.party) {
          if (k.hp <= 0) continue;
          if (!k._lvl) continue;
        }
        yield* this.evolutions();
      }
      this.result = outcome;
      NP.Game.fadeTo(1, 14, '#000000');
      yield* this.wait(16);
      NP.Game.pop();
    }

    *jingle(id) {
      let done = false;
      NP.snd.jingle(id, () => (done = true));
      let g = 0;
      while (!done && g++ < 240) yield;
    }

    *evolutions() {
      const st = NP.state;
      for (const k of st.party) {
        if (k.hp <= 0) continue;
        const ev = NP.Kigu.evolutionFor(k, { trigger: 'level' });
        if (!ev) continue;
        const s = new NP.EvolutionScene(k, ev.to);
        NP.Game.push(s);
        yield* this.waitFor(() => s.finished);
      }
    }

    // -------------------------------------------------------------------------------------- drawing
    drawKigu(fb, side) {
      const d = this.disp[side];
      if (!d || !d.vis || d.alpha <= 0) return;
      const spr = side === 0 ? A().kiguBack(d.species, d.alt) : A().kiguFront(d.species, d.alt);
      const x = Math.round(d.x + d.offx - 32), y = Math.round(d.y + d.offy - 62);
      if (d.blink) return;
      fb.blit(spr, x, y, { alpha: d.alpha });
    }

    drawBox(fb, side) {
      const d = this.disp[side];
      if (!d || !d.vis) return;
      const player = side === 0;
      const x = player ? 124 : 6, y = player ? 66 : 8, w = player ? 112 : 108, h = player ? 40 : 30;
      ui.frame(fb, x, y, w, h, 'dark');
      ui.text(fb, d.name, x + 8, y + 6, 'dark');
      const lv = 'Lv' + d.level;
      ui.text(fb, lv, x + w - 8 - Font.width(lv), y + 6, 'dark');
      const hpY = y + 19;
      Font.draw(fb, 'HP', x + 8, hpY - 2, { color: '#f8d048', shadow: null });
      ui.hpBar(fb, x + 24, hpY, w - 34, d.hp, d.maxhp);
      if (d.status) fb.blit(A().statusTag(d.status), x + 8, y + h + 1);
      if (player) {
        const t = Math.ceil(d.hp) + '/' + d.maxhp;
        ui.text(fb, t, x + w - 8 - Font.width(t), y + 24, 'dark', { shadow: null });
        ui.expBar(fb, x + 8, y + h - 7, w - 16, d.exp);
      }
    }

    draw(fb, frame) {
      const bg = this.bgInfo;
      fb.clear('#101828');
      fb.blit(bg.bg, 0, 0);
      const sx = this.shake ? (NP.Game.frame % 2 ? 2 : -2) : 0;
      if (this.foeTrainer) {
        const f = this.foeTrainer;
        fb.blit(A().humanFront(this.cfg.trainer.look), Math.round(f.x - 32), 58 - 62);
      }
      this.drawKigu(fb, 1);
      if (this.hero) fb.blit(A().humanBack(NP.State.lookId()), Math.round(this.hero.x - 32), 104 - 62);
      this.drawKigu(fb, 0);
      if (this.fx) fb.blit(this.fx.bmp, Math.round(this.fx.x - this.fx.bmp.w / 2), Math.round(this.fx.y - this.fx.bmp.h / 2));
      if (this.thrown) {
        const t = this.thrown;
        fb.blit(A().spool(t.kind, t.f), Math.round(t.x - 8), Math.round(t.y - 8));
      }
      if (this.sparkles > 0) {
        this.sparkles--;
        const c = this.caughtPos || (this.thrown ? { x: this.thrown.x, y: this.thrown.y } : null);
        if (c) for (let i = 0; i < 6; i++) {
          const a = (NP.Game.frame * 0.15) + i * 1.05, r = 10 + (28 - this.sparkles) * 0.6;
          fb.fillRect(Math.round(c.x + Math.cos(a) * r), Math.round(c.y - 8 + Math.sin(a) * r), 2, 2, '#fff0a0');
        }
      }
      this.drawBox(fb, 1);
      this.drawBox(fb, 0);
      // bottom panel background for when no message is shown
      if (!this.msg.visible && !this.menus.length) { ui.frame(fb, 0, 112, 240, 48, 'dark'); }
      // move detail panel
      const mm = this.moveMenuRef;
      if (mm) {
        const it = mm.items[mm.cur];
        ui.frame(fb, 160, 112, 80, 48, 'dark');
        const mv = NP.data.moves[it.m.id];
        ui.text(fb, 'PP ' + it.m.pp + '/' + it.m.maxpp, 168, 120, 'dark');
        fb.blit(A().typePill(mv.type), 168, 134);
        ui.text(fb, mv.category === 'status' ? 'Status' : mv.category === 'physical' ? 'Phys' : 'Spec', 204, 136, 'dark', { color: '#a0a8c0' });
      }
      if (this.levelBox) this.drawLevelBox(fb, this.levelBox);
      this.drawUI(fb, frame);
    }

    drawLevelBox(fb, lv) {
      const x = 136, y = 6, w = 100, h = 82;
      ui.frame(fb, x, y, w, h, 'dark');
      const names = { hp: 'HP', atk: 'Attack', def: 'Defense', spa: 'Sp.Atk', spd: 'Sp.Def', spe: 'Speed' };
      let i = 0;
      for (const k of ['hp', 'atk', 'def', 'spa', 'spd', 'spe']) {
        const yy = y + 8 + i * 11;
        ui.text(fb, names[k], x + 8, yy, 'dark');
        const diff = lv.after[k] - lv.before[k];
        ui.text(fb, '+' + diff, x + 58, yy, 'dark', { color: '#f8d048' });
        const v = String(lv.after[k]);
        ui.text(fb, v, x + w - 8 - Font.width(v), yy, 'dark');
        i++;
      }
    }
  }

  NP.BattleScene = BattleScene;
})(typeof globalThis !== 'undefined' ? globalThis : window);
