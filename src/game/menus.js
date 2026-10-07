/* Menu screens: party, summary, bag, shop, PC box. Each is a Scene pushed on NP.Game; when done it pops itself and leaves
 * `result` for the caller (callers wait on scene.finished). */
(function (root) {
  'use strict';
  const NP = (root.NP = root.NP || {});
  const { Input, ui, Scene, Font } = NP;
  const A = () => NP.assets;
  const K = () => NP.Kigu;

  function bgFill(fb, a, b) {
    fb.clear(a || '#d8e6f6');
    for (let y = 0; y < 160; y += 8) fb.fillRect(0, y, 240, 4, b || '#cddcf0');
  }
  const STAT_NAMES = { hp: 'HP', atk: 'Attack', def: 'Defense', spa: 'Sp. Atk', spd: 'Sp. Def', spe: 'Speed' };

  function drawStatus(fb, k, x, y) {
    if (k.hp <= 0) fb.blit(A().statusTag('fnt'), x, y);
    else if (k.status) fb.blit(A().statusTag(k.status), x, y);
  }

  // ===================================================================================== PartyScene
  class PartyScene extends Scene {
    constructor(o) {
      super('light');
      this.o = Object.assign({ mode: 'menu' }, o || {});
      this.cur = 0;
      this.swap = -1;
      this.hint = this.o.prompt || (this.o.mode === 'menu' ? 'Choose a Kigu.' : 'Choose a Kigu.');
      this.result = null;
    }
    get party() { return NP.state.party; }
    enter() { this.spawn(this.run(), 'party'); }
    close(result) { this.result = result; NP.Game.pop(); }

    *run() {
      const o = this.o, party = this.party;
      yield;
      for (;;) {
        const d = Input.menuDir();
        if (d === 'up') { this.cur = (this.cur + party.length - 1) % party.length; NP.snd.sfx('cursor'); }
        else if (d === 'down') { this.cur = (this.cur + 1) % party.length; NP.snd.sfx('cursor'); }
        if (Input.pressed.b) {
          if (this.swap >= 0) { this.swap = -1; this.hint = 'Choose a Kigu.'; NP.snd.sfx('cancel'); }
          else if (!o.forced) { NP.snd.sfx('cancel'); return this.close(o.mode === 'menu' ? null : -1); }
        }
        if (Input.pressed.a) {
          const k = party[this.cur];
          if (this.swap >= 0) {
            const t = party[this.swap]; party[this.swap] = party[this.cur]; party[this.cur] = t;
            this.swap = -1; this.hint = 'Choose a Kigu.'; NP.snd.sfx('select');
          } else if (o.mode === 'pick') {
            const why = o.canPick ? o.canPick(k, this.cur) : '';
            if (why) { NP.snd.sfx('error'); this.hint = why === true ? 'It cannot be used on that Kigu.' : why; }
            else { NP.snd.sfx('select'); return this.close(this.cur); }
          } else {
            NP.snd.sfx('select');
            const battle = o.mode === 'battle';
            const items = [battle ? 'Send Out' : 'Summary', battle ? 'Summary' : 'Switch', 'Cancel'];
            const m = new ui.Menu({ items, theme: 'light', x: 160, y: 88, cursor: 0 });
            m.x = 240 - m.w - 4; m.y = 146 - m.h;
            const r = yield* this.menu(m);
            if (r.type === 'select') {
              const pick = items[r.index];
              if (pick === 'Send Out') {
                const mon = o.battle && o.battle.sides[0].mons.find((x) => x.kigu === k);
                if (k.hp <= 0) { this.hint = NP.Kigu.displayName(k) + ' is too sleepy to fight!'; NP.snd.sfx('error'); }
                else if (mon && mon.slot >= 0) { this.hint = NP.Kigu.displayName(k) + ' is already in battle!'; NP.snd.sfx('error'); }
                else return this.close(this.cur);
              } else if (pick === 'Summary') {
                const s = new SummaryScene(this.cur); NP.Game.push(s); yield* this.waitFor(() => s.finished);
                this.cur = s.idx;
              } else if (pick === 'Switch') {
                this.swap = this.cur; this.hint = 'Move to where?';
              }
            }
          }
        }
        yield;
      }
    }

    draw(fb, frame) {
      bgFill(fb);
      const party = this.party;
      const tick = NP.Game.frame;
      for (let i = 0; i < 6; i++) {
        const y = 4 + i * 23;
        const k = party[i];
        const sel = i === this.cur, sw = i === this.swap;
        fb.fillRect(4, y, 232, 21, sw ? '#f0d8a0' : sel ? '#fff4c8' : '#f4f8ff');
        fb.strokeRect(4, y, 232, 21, sel ? '#d84040' : '#6f86c0');
        if (!k) { ui.text(fb, '-', 12, y + 6, 'light', { color: '#b0b8d0' }); continue; }
        const ic = A().kiguIcon(k.species, sel ? (tick >> 4) & 1 : 0);
        fb.blit(ic, 6, y - 6, { sy: 0, sh: 30 });
        ui.text(fb, K().displayName(k), 42, y + 3, 'light');
        ui.text(fb, 'Lv' + k.level, 42, y + 12, 'light', { color: '#707890', shadow: null });
        const max = K().maxHp(k);
        ui.hpBar(fb, 100, y + 9, 70, k.hp, max);
        ui.text(fb, k.hp + '/' + max, 174, y + 7, 'light', { shadow: null });
        drawStatus(fb, k, 208, y + 4);
        if (k.item) fb.fillRect(36, y + 14, 4, 4, '#e8c030');
      }
      ui.frame(fb, 0, 142, 240, 18, 'light');
      ui.text(fb, this.hint, 8, 147, 'light');
      this.drawUI(fb, frame);
    }
  }

  // ===================================================================================== SummaryScene
  class SummaryScene extends Scene {
    constructor(idx) {
      super('light');
      this.idx = idx || 0;
      this.page = 0;
    }
    enter() { this.spawn(this.run(), 'summary'); }
    *run() {
      const party = NP.state.party;
      yield;
      for (;;) {
        const d = Input.menuDir();
        if (d === 'left' || d === 'right') { this.page = (this.page + 1) % 2; NP.snd.sfx('cursor'); }
        if (d === 'up') { this.idx = (this.idx + party.length - 1) % party.length; NP.snd.sfx('cursor'); }
        if (d === 'down') { this.idx = (this.idx + 1) % party.length; NP.snd.sfx('cursor'); }
        if (Input.pressed.a) { this.page = (this.page + 1) % 2; NP.snd.sfx('select'); }
        if (Input.pressed.b) { NP.snd.sfx('cancel'); NP.Game.pop(); return; }
        yield;
      }
    }
    draw(fb) {
      const k = NP.state.party[this.idx];
      bgFill(fb, '#e6e0f4', '#ddd6ee');
      const sp = K().sp(k);
      ui.frame(fb, 4, 4, 88, 152, 'light');
      fb.blit(A().kiguFront(k.species, k.alt), 16, 14);
      ui.text(fb, K().displayName(k), 12, 82, 'light');
      ui.text(fb, 'Lv' + k.level, 12, 94, 'light', { color: '#707890' });
      sp.types.forEach((t, i) => fb.blit(A().typePill(t), 12 + i * 36, 108));
      if (k.alt) ui.text(fb, '★ Limited', 12, 136, 'light', { color: '#d09020' });
      ui.frame(fb, 96, 4, 140, 152, 'light');
      const st = K().stats(k);
      if (this.page === 0) {
        let y = 10;
        for (const s of K().STATS) {
          ui.text(fb, STAT_NAMES[s], 106, y, 'light');
          const v = s === 'hp' ? k.hp + '/' + st.hp : String(st[s]);
          ui.text(fb, v, 226 - Font.width(v), y, 'light');
          y += 11;
        }
        const nat = NP.data.natures[k.nature];
        ui.text(fb, 'Nature ' + (nat ? nat.name : '-'), 106, 79, 'light', { color: '#707890' });
        const ab = NP.data.abilities[K().abilityId(k)];
        ui.text(fb, 'Ability ' + (ab ? ab.name : '-'), 106, 90, 'light', { color: '#707890' });
        ui.text(fb, 'Exp ' + k.exp + '  Next ' + K().expToNext(k), 106, 101, 'light', { color: '#707890' });
        ui.expBar(fb, 106, 112, 120, K().expProgress(k));
        ui.text(fb, 'Met: ' + (k.ot || '?') + ' Lv' + k.metLevel, 106, 120, 'light', { color: '#707890', shadow: null });
        ui.text(fb, 'Bond ' + k.bond, 106, 130, 'light', { color: '#707890', shadow: null });
      } else {
        k.moves.forEach((m, i) => {
          const mv = NP.data.moves[m.id];
          const y = 10 + i * 35;
          fb.fillRect(102, y, 128, 31, '#f4f8ff'); fb.strokeRect(102, y, 128, 31, '#6f86c0');
          ui.text(fb, mv.name, 108, y + 3, 'light');
          fb.blit(A().typePill(mv.type), 108, y + 16);
          ui.text(fb, 'PP ' + m.pp + '/' + m.maxpp, 150, y + 18, 'light', { shadow: null });
          const pw = mv.category === 'status' ? '-' : mv.fixed ? 'Lv' : String(mv.power);
          ui.text(fb, 'Pow ' + pw, 172, y + 3, 'light', { color: '#707890', shadow: null });
          ui.text(fb, mv.category === 'status' ? 'Status' : mv.category === 'physical' ? 'Phys' : 'Spec', 204, y + 3, 'light', { color: '#707890', shadow: null });
        });
        for (let i = k.moves.length; i < 4; i++) ui.text(fb, '-', 108, 10 + i * 35 + 8, 'light', { color: '#b0b8d0' });
      }
      ui.text(fb, this.page === 0 ? 'Stats' : 'Moves', 104, 143, 'light', { color: '#d84040', shadow: null });
      ui.text(fb, '<> page  ^v Kigu', 232, 143, 'light', { color: '#9098b0', shadow: null, align: 'right' });
    }
  }

  // ===================================================================================== BagScene
  const POCKETS = [['items', 'Items'], ['spools', 'Spools'], ['key', 'Key Items']];
  class BagScene extends Scene {
    constructor(o) {
      super('light');
      this.o = Object.assign({ mode: 'field' }, o || {});
      this.pocket = 0;
      this.cur = [0, 0, 0];
      this.result = null;
      this.note = '';
    }
    enter() { this.spawn(this.run(), 'bag'); }
    list() {
      const id = POCKETS[this.pocket][0];
      return Object.keys(NP.state.bag).filter((k) => NP.data.items[k] && NP.data.items[k].pocket === id).map((k) => ({ id: k, n: NP.state.bag[k], d: NP.data.items[k] }));
    }
    *run() {
      yield;
      for (;;) {
        const items = this.list();
        const p = this.pocket;
        const d = Input.menuDir();
        if (d === 'left' || Input.pressed.l) { this.pocket = (this.pocket + 2) % 3; NP.snd.sfx('cursor'); }
        else if (d === 'right' || Input.pressed.r) { this.pocket = (this.pocket + 1) % 3; NP.snd.sfx('cursor'); }
        else if (d === 'up' && items.length) { this.cur[p] = (this.cur[p] + items.length - 1) % items.length; NP.snd.sfx('cursor'); }
        else if (d === 'down' && items.length) { this.cur[p] = (this.cur[p] + 1) % items.length; NP.snd.sfx('cursor'); }
        if (this.cur[p] >= items.length) this.cur[p] = Math.max(0, items.length - 1);
        if (Input.pressed.b) { NP.snd.sfx('cancel'); this.result = null; NP.Game.pop(); return; }
        if (Input.pressed.a && items.length) {
          const it = items[this.cur[p]];
          NP.snd.sfx('select');
          const done = yield* this.useItem(it);
          if (done) { NP.Game.pop(); return; }
        }
        yield;
      }
    }

    *useItem(it) {
      const o = this.o, u = it.d.use;
      const battle = o.mode === 'battle';
      this.note = '';
      const m = new ui.Menu({ items: ['Use', 'Cancel'], theme: 'light', x: 160, y: 70 });
      m.x = 240 - m.w - 4; m.y = 100;
      const r = yield* this.menu(m);
      if (r.type !== 'select' || r.index !== 0) return false;
      if (!u) { this.note = 'It cannot be used now.'; NP.snd.sfx('error'); return false; }
      if (u.spool) {
        if (!battle) { this.note = 'Not now. Spools are for wild Kigu.'; NP.snd.sfx('error'); return false; }
        if (!o.wild) { this.note = "You can't take another Tailor's Kigu!"; NP.snd.sfx('error'); return false; }
        this.result = { kind: 'spool', item: it.id };
        return true;
      }
      if (battle && !it.d.inBattle) { this.note = 'It cannot be used in battle.'; NP.snd.sfx('error'); return false; }
      if (!battle && !it.d.inField) { this.note = 'It cannot be used here.'; NP.snd.sfx('error'); return false; }
      if (u.escape) { NP.State.removeItem(it.id, 0); this.result = { escape: true }; return true; }
      if (u.repel) {
        NP.state.repel = u.repel; NP.State.removeItem(it.id, 1);
        this.note = 'Wild Kigu will stay away for a while.'; NP.snd.sfx('select');
        return false;
      }
      // needs a target Kigu
      const s = new PartyScene({ mode: 'pick', prompt: 'Use on which Kigu?', battle: o.battle, canPick: (k) => NP.Items.why(it.id, k) });
      NP.Game.push(s);
      yield* this.waitFor(() => s.finished);
      const idx = s.result;
      if (idx === null || idx === undefined || idx < 0) return false;
      if (battle) { this.result = { kind: 'item', item: it.id, party: idx }; return true; }
      const k = NP.state.party[idx];
      let moveIdx;
      if (u.pp) {
        const ch = yield* this.choose(k.moves.map((mm) => NP.data.moves[mm.id].name + ' ' + mm.pp + '/' + mm.maxpp), { x: 70, y: 40 });
        if (ch < 0) return false;
        if (NP.Items.why(it.id, k, ch)) { this.note = 'Its PP is already full.'; return false; }
        moveIdx = ch;
      }
      const res = NP.Items.apply(it.id, k, moveIdx);
      NP.State.removeItem(it.id, 1);
      NP.snd.sfx('heal_tick');
      this.note = res.text;
      if (res.levels && res.levels.length) {
        for (const lv of res.levels) for (const mid of lv.learn) K().learnMove(k, mid);
        const ev = K().evolutionFor(k, { trigger: 'level' });
        if (ev) { const es = new NP.EvolutionScene(k, ev.to); NP.Game.push(es); yield* this.waitFor(() => es.finished); }
      }
      return false;
    }

    draw(fb, frame) {
      bgFill(fb, '#f4ecd8', '#ece2c8');
      ui.frame(fb, 4, 4, 232, 18, 'light');
      const p = this.pocket;
      POCKETS.forEach((pk, i) => {
        const x = 12 + i * 70;
        ui.text(fb, pk[1], x + 4, 9, 'light', { color: i === p ? '#d83838' : '#9098b0', shadow: i === p ? undefined : null });
      });
      ui.text(fb, '<', 8, 9, 'light', { color: '#9098b0' }); ui.text(fb, '>', 228, 9, 'light', { color: '#9098b0' });
      ui.frame(fb, 4, 26, 150, 96, 'light');
      const items = this.list();
      const cur = this.cur[p];
      const top = Math.max(0, Math.min(cur - 3, items.length - 7));
      if (!items.length) ui.text(fb, 'Nothing here.', 16, 40, 'light', { color: '#9098b0' });
      for (let i = 0; i < 7 && top + i < items.length; i++) {
        const it = items[top + i], y = 32 + i * 12;
        if (top + i === cur) ui.cursor(fb, 10, y, 'light');
        ui.text(fb, it.d.name, 20, y, 'light');
        if (it.d.pocket !== 'key') ui.text(fb, 'x' + it.n, 148 - Font.width('x' + it.n), y, 'light');
      }
      ui.frame(fb, 158, 26, 78, 96, 'light');
      if (items[cur]) {
        fb.blit(A().itemIcon(items[cur].id), 185, 32);
        const lines = Font.wrap(items[cur].d.desc, 66);
        lines.slice(0, 6).forEach((l, i) => ui.text(fb, l, 164, 62 + i * 10, 'light', { color: '#505870', shadow: null }));
      }
      ui.frame(fb, 0, 126, 240, 34, 'light');
      const money = '$' + NP.state.money;
      ui.text(fb, this.note || (items[cur] ? '' : ''), 8, 134, 'light');
      ui.text(fb, money, 232 - Font.width(money), 146, 'light', { color: '#707890', shadow: null });
      this.drawUI(fb, frame);
    }
  }

  // ===================================================================================== ShopScene
  class ShopScene extends Scene {
    constructor(list) {
      super('light');
      this.list = list;
      this.note = 'Welcome!';
      this.cur = 0;
      this.mode = 'buy';
    }
    enter() { this.spawn(this.run(), 'shop'); }
    *run() {
      yield;
      for (;;) {
        const m = new ui.Menu({ items: ['Buy', 'Sell', 'Leave'], theme: 'light', x: 4, y: 4 });
        const r = yield* this.menu(m);
        if (r.type === 'cancel' || r.index === 2) { NP.Game.pop(); return; }
        if (r.index === 0) yield* this.buy(); else yield* this.sell();
      }
    }
    *qty(max, unit, verb) {
      let n = 1;
      this.qtyBox = { n, unit };
      yield;
      for (;;) {
        const d = Input.menuDir();
        if (d === 'up') n = Math.min(max, n + 1);
        if (d === 'down') n = Math.max(1, n - 1);
        if (d === 'right') n = Math.min(max, n + 10);
        if (d === 'left') n = Math.max(1, n - 10);
        this.qtyBox = { n, unit };
        if (Input.pressed.a) { this.qtyBox = null; NP.snd.sfx('select'); return n; }
        if (Input.pressed.b) { this.qtyBox = null; NP.snd.sfx('cancel'); return 0; }
        yield;
      }
    }
    *buy() {
      for (;;) {
        const items = this.list.map((id) => ({ label: NP.data.items[id].name, right: '$' + NP.data.items[id].price, id }));
        const m = new ui.Menu({ items, theme: 'light', x: 40, y: 10, visible: 7, cursor: this.cur });
        m.x = 4 + 60; m.y = 6;
        this.shown = m;
        const r = yield* this.menu(m);
        this.shown = null;
        if (r.type === 'cancel') return;
        this.cur = r.index;
        const d = NP.data.items[r.item.id];
        const max = Math.max(1, Math.min(99, Math.floor(NP.state.money / d.price)));
        if (NP.state.money < d.price) { this.note = "You don't have enough money."; NP.snd.sfx('error'); continue; }
        const n = yield* this.qty(max, d.price);
        if (n > 0) {
          NP.state.money -= n * d.price;
          NP.State.addItem(r.item.id, n);
          NP.snd.sfx('select');
          this.note = 'Bought ' + n + ' ' + d.name + '. Thank you!';
        }
      }
    }
    *sell() {
      for (;;) {
        const ids = Object.keys(NP.state.bag).filter((k) => NP.data.items[k].pocket !== 'key' && NP.data.items[k].price > 0);
        if (!ids.length) { this.note = 'You have nothing to sell.'; return; }
        const items = ids.map((id) => ({ label: NP.data.items[id].name, right: 'x' + NP.state.bag[id], id }));
        const m = new ui.Menu({ items, theme: 'light', x: 64, y: 6, visible: 7 });
        this.shown = m;
        const r = yield* this.menu(m);
        this.shown = null;
        if (r.type === 'cancel') return;
        const d = NP.data.items[r.item.id];
        const unit = Math.floor(d.price / 2);
        const n = yield* this.qty(NP.state.bag[r.item.id], unit);
        if (n > 0) {
          NP.state.money += n * unit;
          NP.State.removeItem(r.item.id, n);
          this.note = 'Sold ' + n + ' ' + d.name + ' for $' + n * unit + '.';
        }
      }
    }
    draw(fb, frame) {
      bgFill(fb, '#e4f0e0', '#d8e8d4');
      ui.frame(fb, 160, 100, 76, 20, 'light');
      ui.text(fb, '$' + NP.state.money, 168, 106, 'light');
      ui.frame(fb, 0, 124, 240, 36, 'light');
      const cur = this.shown && this.shown.items[this.shown.cur];
      if (cur && cur.id) {
        ui.text(fb, NP.data.items[cur.id].desc, 8, 132, 'light');
        fb.blit(A().itemIcon(cur.id), 200, 126);
      } else ui.text(fb, this.note, 8, 132, 'light');
      if (this.note && cur && cur.id && this.note !== 'Welcome!') ui.text(fb, this.note, 8, 146, 'light', { color: '#707890', shadow: null });
      if (this.qtyBox) {
        ui.frame(fb, 130, 74, 106, 24, 'light');
        ui.text(fb, 'x' + NP.util.pad(this.qtyBox.n, 2, ' ') + '   $' + this.qtyBox.n * this.qtyBox.unit, 140, 82, 'light');
      }
      this.drawUI(fb, frame);
    }
  }

  // ===================================================================================== BoxScene (PC)
  class BoxScene extends Scene {
    constructor() { super('light'); this.note = 'Storage terminal'; this.preview = null; }
    enter() { this.spawn(this.run(), 'box'); }
    *run() {
      yield;
      for (;;) {
        const m = new ui.Menu({ items: ['Withdraw', 'Deposit', 'Log off'], theme: 'light', x: 4, y: 4 });
        const r = yield* this.menu(m);
        if (r.type === 'cancel' || r.index === 2) { NP.Game.pop(); return; }
        const st = NP.state;
        if (r.index === 0) {
          if (!st.box.length) { this.note = 'Nobody is in storage.'; continue; }
          const items = st.box.map((k, i) => ({ label: K().displayName(k), right: 'Lv' + k.level, i }));
          const mm = new ui.Menu({ items, theme: 'light', x: 70, y: 6, visible: 8 });
          this.boxMenu = mm;
          const rr = yield* this.menu(mm);
          this.boxMenu = null;
          if (rr.type === 'select') {
            if (st.party.length >= 6) { this.note = 'Your party is full.'; NP.snd.sfx('error'); continue; }
            const [k] = st.box.splice(rr.item.i, 1);
            st.party.push(k);
            this.note = K().displayName(k) + ' joined your party.';
          }
        } else {
          if (st.party.length <= 1) { this.note = "You can't deposit your last Kigu."; NP.snd.sfx('error'); continue; }
          const items = st.party.map((k, i) => ({ label: K().displayName(k), right: 'Lv' + k.level, i }));
          const mm = new ui.Menu({ items, theme: 'light', x: 70, y: 6 });
          const rr = yield* this.menu(mm);
          if (rr.type === 'select') {
            const k = st.party[rr.item.i];
            if (st.party.filter((x) => x.hp > 0).length <= 1 && k.hp > 0) { this.note = 'That is your last able Kigu!'; NP.snd.sfx('error'); continue; }
            st.party.splice(rr.item.i, 1);
            st.box.push(k);
            this.note = K().displayName(k) + ' was sent to storage.';
          }
        }
      }
    }
    draw(fb, frame) {
      bgFill(fb, '#dcd8f0', '#d0cce8');
      ui.frame(fb, 0, 124, 240, 36, 'light');
      ui.text(fb, this.note, 8, 134, 'light');
      ui.text(fb, 'Party ' + NP.state.party.length + '/6   Storage ' + NP.state.box.length, 8, 146, 'light', { color: '#707890', shadow: null });
      if (this.boxMenu) {
        const it = this.boxMenu.items[this.boxMenu.cur];
        const k = NP.state.box[it.i];
        if (k) fb.blit(A().kiguIcon(k.species, 0), 28, 30);
      }
      this.drawUI(fb, frame);
    }
  }

  NP.PartyScene = PartyScene;
  NP.SummaryScene = SummaryScene;
  NP.BagScene = BagScene;
  NP.ShopScene = ShopScene;
  NP.BoxScene = BoxScene;
  NP.uiutil = { bgFill };
})(typeof globalThis !== 'undefined' ? globalThis : window);
