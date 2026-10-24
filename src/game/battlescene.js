/* NP.BattleScene — plays an NP.Battle: backgrounds, sprites, HP boxes, menus, event playback, spool throwing, exp/levels. */
(function (root) {
  'use strict';
  const NP = (root.NP = root.NP || {});
  const { Input, ui, Scene, Font } = NP;
  const A = () => NP.assets;
  const B = NP.Battle;

  const FULL = { x: 0, y: NP.BOX_Y, w: NP.W, h: 48 };
  const C = NP.Color;
  const CMD_W = 148; // command buttons on the right of the bottom panel; the prompt sits to their left
  const CMD_COL = { Fight: '#e04848', Bag: '#e8a820', Kigu: '#40a848', Run: '#4878d8' };

  /** Big rounded 5th-gen-style button: bevelled colour slab, dark edge, white shadowed label(s). sel = white ring. */
  function button(fb, x, y, w, h, color, sel, dim) {
    const base = dim ? '#7c8090' : color;
    const edge = C.shade(base, -0.62), dark = C.shade(base, -0.28), light = C.shade(base, 0.32), glint = C.shade(base, 0.6);
    if (sel) { fb.fillRect(x, y - 1, w, h + 2, '#ffffff'); fb.fillRect(x - 1, y, w + 2, h, '#ffffff'); }
    fb.fillRect(x + 1, y, w - 2, h, edge); fb.fillRect(x, y + 1, w, h - 2, edge);
    fb.fillRect(x + 1, y + 1, w - 2, h - 2, base);
    fb.fillRect(x + 2, y + 1, w - 4, Math.round(h * 0.38), light);
    fb.fillRect(x + 3, y + 2, w - 6, 1, glint);
    fb.fillRect(x + 1, y + h - 3, w - 2, 2, dark);
    return edge;
  }

  /** Fight / Bag / Kigu / Run as four coloured buttons (2x2, same navigation as a 2-column ui.Menu). */
  class CommandMenu extends ui.Menu {
    draw(fb) {
      const bw = 70, bh = 21;
      this.items.forEach((it, i) => {
        const x = this.x + 4 + (i % 2) * (bw + 4), y = this.y + 3 + Math.floor(i / 2) * (bh + 2);
        const sel = i === this.cur, edge = button(fb, x, y + (sel ? 0 : 1), bw, bh, CMD_COL[it.label] || '#8088a0', sel);
        Font.draw(fb, it.label.toUpperCase(), x + (bw >> 1), y + 7 + (sel ? 0 : 1), { color: '#ffffff', shadow: edge, align: 'center' });
      });
    }
  }
  /** The move menu: four buttons in the move's type colour with name, type and PP. */
  class MoveMenu extends ui.Menu {
    draw(fb) {
      const bw = 124, bh = 22;
      for (let i = 0; i < 4; i++) {
        const x = this.x + 3 + (i % 2) * (bw + 3), y = this.y + 2 + Math.floor(i / 2) * (bh + 1);
        const it = this.items[i];
        if (!it) { button(fb, x, y + 1, bw, bh, '#5a6070', false, true); Font.draw(fb, '-', x + (bw >> 1), y + 8, { color: '#a0a8b8', shadow: null, align: 'center' }); continue; }
        const mv = NP.data.moves[it.m.id], t = NP.data.types[mv.type];
        const sel = i === this.cur, dy = sel ? 0 : 1;
        const edge = button(fb, x, y + dy, bw, bh, t ? t.color : '#8088a0', sel, it.disabled);
        Font.draw(fb, mv.name, x + 6, y + 3 + dy, { color: '#ffffff', shadow: edge });
        const tn = t ? t.name.toUpperCase() : '???';
        fb.fillRect(x + 5, y + 12 + dy, Font.width(tn) + 4, 8, C.shade(t ? t.color : '#8088a0', -0.45));
        Font.draw(fb, tn, x + 7, y + 13 + dy, { color: '#ffffff', shadow: null });
        const low = it.m.pp === 0 ? '#ff9a9a' : it.m.pp * 4 <= it.m.maxpp ? '#ffe070' : '#ffffff';
        Font.draw(fb, 'PP ' + it.m.pp + '/' + it.m.maxpp, x + bw - 6, y + 12 + dy, { color: low, shadow: edge, align: 'right' });
      }
    }
  }

  // ---- data boxes (charcoal slabs with a slanted inner end, as in 5th-gen battles)
  const BOX = { body: '#3a3e4c', top: '#5e6476', edge: '#14161e', rim: '#8a90a4' };
  function slab(fb, x, y, w, h, slantLeft) {
    for (let j = 0; j < h; j++) {
      const s = Math.floor((j * 10) / h); // the slanted end cuts 10px over the height
      const x0 = slantLeft ? x + (10 - s) : x, x1 = slantLeft ? x + w : x + w - s;
      fb.fillRect(x0, y + j, x1 - x0, 1, j === 0 ? BOX.edge : j === 1 ? BOX.rim : j < 4 ? BOX.top : j === h - 1 ? BOX.edge : BOX.body);
      fb.set(slantLeft ? x0 : x1 - 1, y + j, BOX.edge);
    }
  }
  function hpRow(fb, x, y, w, hp, max) {
    fb.fillRect(x, y, 13, 7, '#f0a030'); fb.fillRect(x, y + 6, 13, 1, '#b06818'); fb.fillRect(x, y, 13, 1, '#f8d070');
    const HP = ['101110', '101101', '111110', '101100', '101100']; // 3x5 mini letters
    for (let j = 0; j < 5; j++) for (let i = 0; i < 6; i++) if (HP[j][i] === '1') fb.set(x + 3 + i + (i > 2 ? 1 : 0), y + 1 + j, '#4a2408');
    const bx = x + 13;
    fb.fillRect(bx, y, w, 7, BOX.edge);
    fb.fillRect(bx + 1, y + 1, w - 2, 5, '#28302c');
    const pct = max > 0 ? Math.max(0, Math.min(1, hp / max)) : 0;
    let fw = Math.round((w - 2) * pct);
    if (hp > 0 && fw < 1) fw = 1;
    if (fw > 0) {
      const col = ui.hpColor(pct);
      fb.fillRect(bx + 1, y + 1, fw, 5, col);
      fb.fillRect(bx + 1, y + 1, fw, 2, C.shade(col, 0.4));
      fb.fillRect(bx + 1, y + 5, fw, 1, C.shade(col, -0.3));
    }
  }

  class BattleScene extends Scene {
    constructor(cfg) {
      super('battle');
      this.clock = 0;
      this.cfg = cfg;
      this.result = null;
      this.disp = [null, null];
      this.fx = null;
      this.bgInfo = null;
      this.hero = null;       // hero back sprite state {x}
      this.foeTrainer = null; // trainer front sprite state {x}
      this.thrown = null;     // spool in flight
      this.burst = null;      // send-out sparkle {x, y, t 0..1}
      this.menuInfo = null;
      this.expShown = null;
      this.levelBox = null;
      this.shake = 0;
      this.xpBars = {};
      this.parts = [];        // particles (battlefx.js)
      this.quake = null;      // stage shake {n, amp}
      this.scrFlash = null;   // stage flash {col, a}
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
      if (cfg.trainer) this.foeTrainer = { x: this.bgInfo.enemyBase.x };
      this.hero = { x: this.bgInfo.playerBase.x };
      this.spawn(this.run(), 'battle');
    }

    // ------------------------------------------------------------------------------------ helpers
    anchor(side) {
      const b = this.bgInfo;
      return side === 0 ? { x: b.playerBase.x, y: b.playerBase.y } : { x: b.enemyBase.x, y: b.enemyBase.y };
    }
    dsp(mon) { return this.disp[mon.side.index]; }
    /** Visual centre of a Kigu on screen (where effects play). */
    mid(d) { return { x: d.x + d.offx, y: d.y + d.offy - (d.mon.side.index === 0 ? 62 : 42) }; }

    update() {
      super.update();
      this.clock++;
      this.stepFx();
      for (const d of this.disp) if (d && d.vis && d.boxT < 1) d.boxT = Math.min(1, d.boxT + 0.1); // data boxes slide in
    }

    setDisp(mon) {
      const k = mon.kigu;
      const a = this.anchor(mon.side.index);
      this.disp[mon.side.index] = {
        mon, k, hp: mon.hp, maxhp: mon.maxhp, name: mon.name, level: mon.level, status: mon.status, species: k.species, alt: k.alt,
        x: a.x, y: a.y, offx: 0, offy: 0, sx: 1, sy: 1, pose: false, tint: null, white: 0, alpha: 0, flash: 0, vis: true, exp: NP.Kigu.expProgress(k), blink: 0, boxT: 0, sink: false,
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
          if (d && d.mon === e.who) { const y0 = d.offy; d.sink = true; for (let i = 1; i <= 18; i++) { d.offy = y0 + i * 5; d.alpha = Math.min(1, 1.6 - i / 12); yield; } d.vis = false; }
          break;
        }
        case 'boost': yield* this.evBoost(e); break;
        case 'status': yield* this.evStatus(e); break;
        case 'use': case 'item': yield* this.evUse(e); break;
        case 'exp': yield* this.evExp(e); break;
        case 'spool': yield* this.evSpool(e); break;
        case 'miss': yield* this.evMiss(e); break;
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
          if (this.hero && NP.Game.opts.battleAnim !== false) yield* this.heroThrow();
          if (this.hero) { const h = this.hero; for (let i = 0; i < 18; i++) { h.x -= 7; yield; } this.hero = null; }
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

    /** The send-out: the hero winds up, throws a Bond Spool in an arc, it bursts in a sparkle, then she steps aside (caller slides her off). */
    *heroThrow() {
      const h = this.hero;
      h.pose = 'windup';
      for (let i = 0; i < 10; i++) { h.lean = -Math.min(3, (i >> 1) + 1); yield; }
      h.pose = 'throw'; h.lean = 4;
      NP.snd.sfx('throw');
      const by = this.bgInfo.playerBase.y, p0 = { x: h.x + 20, y: by - 74 }, p1 = { x: this.bgInfo.playerBase.x + 30, y: by - 46 };
      for (let i = 0; i <= 18; i++) {
        const t = i / 18;
        if (i === 5) { h.pose = 'follow'; h.lean = 2; }
        this.thrown = { kind: 'bond', f: i >> 1, x: p0.x + (p1.x - p0.x) * t, y: p0.y + (p1.y - p0.y) * t - Math.sin(t * Math.PI) * 34 };
        yield;
      }
      this.thrown = null;
      for (let i = 0; i < 12; i++) { this.burst = { x: p1.x, y: p1.y - 4, t: i / 12 }; if (i === 0) NP.snd.sfx('save'); yield; }
      this.burst = null;
      h.pose = 'ready'; h.lean = 0;
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
      const p0 = { x: this.bgInfo.playerBase.x + 20, y: this.bgInfo.playerBase.y - 70 }, p1 = { x: d.x, y: d.y - 46 };
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
        this.msg.begin('What will ' + mon.name + ' do?', { keep: true, auto: 1e9, box: { x: 0, y: NP.BOX_Y, w: NP.W - CMD_W, h: 48 }, speed: 999 });
        this.msg.update();
        const items = ['Fight', 'Bag', 'Kigu', 'Run'];
        const m = new CommandMenu({ items, theme: 'battle', x: NP.W - CMD_W, y: NP.BOX_Y, w: CMD_W, h: 48, cols: 2, colW: 74, cancelable: false, cursor: cur, pad: 4 });
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
      const menu = new MoveMenu({ items, theme: 'battle', x: 0, y: NP.BOX_Y, w: NP.W, h: 48, cols: 2, colW: 127, cancelable: true, pad: 4 });
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
    /** Idle frame for a side: both Kigu breathe continuously (offset from each other); slower when asleep or low on HP,
     *  frozen solid when frozen. */
    idleFrame(d, side) {
      const n = A().kiguFrames(d.species);
      if (n <= 1 || d.status === 'frz') return 0;
      const rate = d.status === 'slp' ? 18 : d.hp / Math.max(1, d.maxhp) < 0.25 ? 13 : 9;
      return Math.floor((this.clock + side * 23) / rate) % n;
    }

    drawKigu(fb, side) {
      const d = this.disp[side];
      if (!d || !d.vis || d.alpha <= 0 || d.blink) return;
      const f = this.idleFrame(d, side);
      const [spr, o] = this.kiguSprite(d, side, f);
      const an = A().anchorOf(spr);
      const x = Math.round(d.x + d.offx - an.x), y = Math.round(d.y + d.offy - an.y);
      if (d.sink) o.sh = Math.max(0, Math.min(spr.h, d.y + 2 - y)); // fainting: she sinks below the platform's edge
      if (o.sh === 0) return;
      fb.blit(spr, x, y, o);
    }

    /** Foe box: top-left, slides in from the left. Player box: lower right above the panel, with HP numbers and EXP. */
    drawBox(fb, side) {
      const d = this.disp[side];
      if (!d || !d.vis) return;
      const player = side === 0;
      const ease = 1 - Math.pow(1 - (d.boxT === undefined ? 1 : d.boxT), 3);
      const w = player ? 124 : 118, h = player ? 40 : 28;
      const x = player ? NP.W - w + Math.round((1 - ease) * (w + 4)) : -Math.round((1 - ease) * (w + 4)), y = player ? NP.BOX_Y - h - 4 : 10;
      slab(fb, x, y, w, h, player);
      const tx = x + (player ? 16 : 6);
      Font.draw(fb, d.name, tx, y + 5, { color: '#ffffff', shadow: BOX.edge });
      const lvx = x + w - (player ? 8 : 18);
      Font.draw(fb, String(d.level), lvx, y + 5, { color: '#ffffff', shadow: BOX.edge, align: 'right' });
      Font.draw(fb, 'Lv', lvx - Font.width(String(d.level)) - 1, y + 5, { color: '#f8d048', shadow: BOX.edge, align: 'right' });
      const hw = 66, hx = x + w - hw - 13 - (player ? 6 : 16), hy = y + 16;
      hpRow(fb, hx, hy, hw, d.hp, d.maxhp);
      if (d.status) fb.blit(A().statusTag(d.status), tx, hy - 2);
      if (player) {
        const t = Math.ceil(d.hp) + '/' + d.maxhp;
        Font.draw(fb, t, x + w - 6, y + 25, { color: '#ffffff', shadow: BOX.edge, align: 'right' });
        const ex = x + 16, ew = w - 22, ey = y + h - 5;
        fb.fillRect(ex, ey, ew, 3, BOX.edge);
        const fw = Math.round((ew - 2) * Math.max(0, Math.min(1, d.exp)));
        fb.fillRect(ex + 1, ey + 1, ew - 2, 1, '#283040');
        if (fw > 0) fb.fillRect(ex + 1, ey + 1, fw, 1, '#48b0f8');
      }
    }

    draw(fb, frame) {
      const bg = this.bgInfo;
      fb.clear('#101828');
      fb.blit(bg.bg, 0, 0);
      if (this.foeTrainer) {
        const f = this.foeTrainer, t = A().humanFront(this.cfg.trainer.look);
        fb.blit(t, Math.round(f.x - (t.w >> 1)), bg.enemyBase.y - (t.h - 2));
      }
      this.drawKigu(fb, 1);
      if (this.hero) {
        const t = A().humanThrow(NP.State.lookId(), this.hero.pose || 'ready', this.hero.lean || 0);
        fb.blit(t, Math.round(this.hero.x - (t.w >> 1)), bg.playerBase.y - (t.h - 2));
      }
      if (this.burst) { // sparkle burst: eight rays that grow then fade out
        const f = this.burst, r = 3 + f.t * 20, r0 = f.t * 8;
        for (let k = 0; k < 8; k++) { const a = k * Math.PI / 4 + f.t * 0.8; fb.line(Math.round(f.x + Math.cos(a) * r0), Math.round(f.y + Math.sin(a) * r0), Math.round(f.x + Math.cos(a) * r), Math.round(f.y + Math.sin(a) * r), k & 1 ? '#fff4b0' : '#ffffff'); }
        if (f.t < 0.5) fb.circle(Math.round(f.x), Math.round(f.y), Math.round(7 - f.t * 12), '#ffffff', true);
      }
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
      this.drawParts(fb);
      this.drawScreenFlash(fb);
      this.applyQuake(fb);
      this.drawBox(fb, 1);
      this.drawBox(fb, 0);
      // bottom panel (the player's Kigu stands partly behind it, as on the DS)
      ui.frame(fb, 0, NP.BOX_Y, NP.W, 48, 'battle');
      if (this.levelBox) this.drawLevelBox(fb, this.levelBox);
      this.drawUI(fb, frame);
    }

    drawLevelBox(fb, lv) {
      const x = NP.W - 110, y = 6, w = 104, h = 82;
      ui.frame(fb, x, y, w, h, 'battle');
      const names = { hp: 'HP', atk: 'Attack', def: 'Defense', spa: 'Sp.Atk', spd: 'Sp.Def', spe: 'Speed' };
      let i = 0;
      for (const k of ['hp', 'atk', 'def', 'spa', 'spd', 'spe']) {
        const yy = y + 8 + i * 11;
        ui.text(fb, names[k], x + 8, yy, 'battle');
        const diff = lv.after[k] - lv.before[k];
        ui.text(fb, '+' + diff, x + 60, yy, 'battle', { color: '#f8d048' });
        const v = String(lv.after[k]);
        ui.text(fb, v, x + w - 8 - Font.width(v), yy, 'battle');
        i++;
      }
    }
  }
  NP.BattleScene = BattleScene;
})(typeof globalThis !== 'undefined' ? globalThis : window);
