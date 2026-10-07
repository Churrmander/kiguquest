/* Title, name entry, sketchbook (dex), tailor card, options and evolution screens. */
(function (root) {
  'use strict';
  const NP = (root.NP = root.NP || {});
  const { Input, ui, Scene, Font, Bitmap } = NP;
  const A = () => NP.assets;
  const K = () => NP.Kigu;
  const bgFill = (fb, a, b) => NP.uiutil.bgFill(fb, a, b);

  // ===================================================================================== Title
  class TitleScene extends Scene {
    constructor() { super('light'); this.t = 0; this.stage = 0; }
    enter() {
      NP.snd.play('title');
      this.scene = A().titleScene();
      this.logo = A().logo();
      this.spawn(this.run(), 'title');
    }
    *run() {
      NP.Game.fadeTo(0, 20);
      // press start
      yield* this.wait(20);
      while (!(Input.pressed.start || Input.pressed.a)) yield;
      NP.snd.sfx('select');
      this.stage = 1;
      for (;;) {
        const has = NP.State.hasSave();
        const items = [];
        if (has) items.push({ label: 'Continue', k: 'continue' });
        items.push({ label: 'New Game', k: 'new' });
        const pk = has ? NP.State.peek() : null;
        this.peek = pk;
        const m = new ui.Menu({ items, theme: 'light', x: 0, y: 0, cancelable: false });
        m.x = 120 - (m.w >> 1); m.y = 104;
        const r = yield* this.menu(m);
        const k = r.item.k;
        if (k === 'continue') {
          const st = NP.State.load();
          if (!st) { yield* this.say('The save file could not be read.'); continue; }
          yield* this.start(st, false);
          return;
        }
        if (k === 'new') {
          if (has) {
            this.msg.begin('Start over? Your old save file will be replaced when you save.', { keep: true });
            while (this.msg.active) { this.msg.update(); yield; }
            const yes = yield* this.yesno(true);
            this.msg.close();
            if (!yes) continue;
          }
          const s = new NameEntryScene(); NP.Game.push(s);
          yield* this.waitFor(() => s.finished);
          if (!s.result) continue;
          yield* this.start(NP.State.fresh(s.result.name, s.result.gender), true);
          return;
        }
      }
    }
    *start(st, isNew) {
      NP.state = st;
      NP.snd.stop(400);
      NP.Game.fadeTo(1, 20, '#000000');
      yield* this.wait(24);
      const ow = new NP.Overworld();
      NP.Game.reset(ow);
      const p = st.pos;
      if (isNew) ow.loadMap('lab', 5, 9, 'up');
      else ow.loadMap(p.map, p.x, p.y, p.dir, { noEnter: true });
      NP.Game.fadeTo(0, 20);
    }
    draw(fb) {
      const f = NP.Game.frame;
      if (this.scene) fb.blit(this.scene, 0, 0);
      else {
        for (let y = 0; y < 160; y++) fb.fillRect(0, y, 240, 1, y < 100 ? NP.Color.mix('#ffb8d0', '#9ad4f0', y / 100) : '#78c058');
      }
      if (this.logo) fb.blit(this.logo, 120 - (this.logo.w >> 1), 14);
      else {
        Font.draw(fb, 'KIGU QUEST', 120, 34, { color: '#ffffff', shadow: '#c04878', outline: '#602040', align: 'center' });
      }
      if (this.stage === 0 && (f >> 5) % 2 === 0) Font.draw(fb, 'PRESS START', 120, 120, { color: '#ffffff', shadow: '#00000080', outline: '#302040', align: 'center' });
      if (this.stage === 1 && this.peek) {
        const p = this.peek;
        ui.frame(fb, 50, 70, 140, 30, 'light');
        ui.text(fb, p.name + '   Buttons ' + p.badges, 60, 76, 'light');
        ui.text(fb, 'Sketchbook ' + p.dex + '   ' + NP.util.pad(Math.floor(p.frames / 216000), 1) + 'h ' + NP.util.pad(Math.floor(p.frames / 3600) % 60, 2) + 'm', 60, 87, 'light', { color: '#707890', shadow: null });
      }
      Font.draw(fb, 'Befriend Kigu. Stitch your story.', 120, 150, { color: '#ffffffb0', shadow: '#00000060', align: 'center' });
      this.drawUI(fb, f);
    }
  }

  // ===================================================================================== Name entry
  const ROWS = ['ABCDEFGHIJKLM', 'NOPQRSTUVWXYZ', 'abcdefghijklm', 'nopqrstuvwxyz', '0123456789 -.!'];
  class NameEntryScene extends Scene {
    constructor() { super('light'); this.name = ''; this.gender = 'm'; this.cx = 0; this.cy = 0; this.stage = 0; this.result = null; }
    enter() { this.spawn(this.run(), 'name'); }
    *run() {
      yield;
      yield* this.say('Welcome to the land of Tsumugi, where Kigu and people stitch their lives together.');
      const g = yield* this.choose(['Boy', 'Girl'], { x: 160, y: 50 });
      if (g < 0) { NP.Game.pop(); return; }
      this.gender = g === 0 ? 'm' : 'f';
      this.stage = 1;
      yield;
      for (;;) {
        const d = Input.menuDir();
        const rows = ROWS.length + 1; // last row = buttons
        if (d === 'up') this.cy = (this.cy + rows - 1) % rows;
        else if (d === 'down') this.cy = (this.cy + 1) % rows;
        else if (d === 'left') this.cx = this.cy === ROWS.length ? (this.cx + 2) % 3 : (this.cx + 12) % 13;
        else if (d === 'right') this.cx = this.cy === ROWS.length ? (this.cx + 1) % 3 : (this.cx + 1) % 13;
        if (d) NP.snd.sfx('cursor');
        if (Input.pressed.a) {
          if (this.cy < ROWS.length) {
            if (this.name.length < 8) { this.name += ROWS[this.cy][this.cx]; NP.snd.sfx('select'); } else NP.snd.sfx('error');
          } else if (this.cx === 0) { this.name = this.name.slice(0, -1); NP.snd.sfx('cancel'); }
          else if (this.cx === 1) { this.name = this.gender === 'm' ? 'Ren' : 'Yuki'; NP.snd.sfx('select'); }
          else {
            if (!this.name.trim()) { NP.snd.sfx('error'); } else { NP.snd.sfx('select'); this.result = { name: this.name.trim(), gender: this.gender }; NP.Game.pop(); return; }
          }
        }
        if (Input.pressed.b) { if (this.name.length) { this.name = this.name.slice(0, -1); NP.snd.sfx('cancel'); } else { NP.Game.pop(); return; } }
        yield;
      }
    }
    draw(fb) {
      bgFill(fb, '#fbe4ec', '#f6d8e4');
      if (this.stage === 0) { this.drawUI(fb); return; }
      ui.text(fb, 'What is your name?', 120, 6, 'light', { align: 'center' });
      const look = this.gender === 'm' ? 'hero_m' : 'hero_f';
      const s = A().human(look).frames.down[0];
      fb.blit(s, 8, 8);
      ui.frame(fb, 50, 18, 120, 20, 'light');
      for (let i = 0; i < 8; i++) {
        const ch = this.name[i];
        fb.hline(62 + i * 12, 33, 9, '#8090b0');
        if (ch) ui.text(fb, ch, 64 + i * 12, 23, 'light', { shadow: null });
      }
      ui.frame(fb, 6, 44, 228, 88, 'light');
      for (let y = 0; y < ROWS.length; y++) {
        for (let x = 0; x < 13; x++) {
          const sel = this.cy === y && this.cx === x;
          const px = 14 + x * 17, py = 50 + y * 14;
          if (sel) fb.fillRect(px - 3, py - 3, 15, 13, '#ffe8a0');
          ui.text(fb, ROWS[y][x], px + Math.floor((8 - Font.width(ROWS[y][x])) / 2) - 1, py, 'light', { shadow: null });
        }
      }
      ['Delete', 'Default', 'OK'].forEach((t, i) => {
        const sel = this.cy === ROWS.length && this.cx === i;
        const px = 30 + i * 70;
        if (sel) fb.fillRect(px - 4, 122 - 4 + 0, 60, 14, '#ffe8a0');
        ui.text(fb, t, px, 120, 'light', { shadow: null });
      });
      ui.text(fb, 'A: pick    B: delete', 120, 142, 'light', { align: 'center', color: '#9098b0', shadow: null });
    }
  }

  // ===================================================================================== Sketchbook (dex)
  class DexScene extends Scene {
    constructor() { super('light'); this.cur = 0; this.detail = false; }
    enter() { this.spawn(this.run(), 'dex'); }
    *run() {
      const ids = NP.data.speciesIds;
      yield;
      for (;;) {
        const d = Input.menuDir();
        if (d === 'up') this.cur = (this.cur + ids.length - 1) % ids.length;
        else if (d === 'down') this.cur = (this.cur + 1) % ids.length;
        else if (d === 'left') this.cur = (this.cur + ids.length - 6) % ids.length;
        else if (d === 'right') this.cur = (this.cur + 6) % ids.length;
        if (d) NP.snd.sfx('cursor');
        if (Input.pressed.a && NP.state.dex.seen[ids[this.cur]]) { this.detail = !this.detail; NP.snd.sfx('select'); }
        if (Input.pressed.b) { if (this.detail) this.detail = false; else { NP.snd.sfx('cancel'); NP.Game.pop(); return; } }
        yield;
      }
    }
    draw(fb) {
      bgFill(fb, '#f4ecd8', '#ece2c8');
      const ids = NP.data.speciesIds, dex = NP.state.dex;
      const seen = Object.keys(dex.seen).length, caught = Object.keys(dex.caught).length;
      ui.frame(fb, 4, 4, 100, 152, 'light');
      const top = Math.max(0, Math.min(this.cur - 5, ids.length - 11));
      for (let i = 0; i < 11 && top + i < ids.length; i++) {
        const id = ids[top + i], y = 10 + i * 13;
        if (top + i === this.cur) ui.cursor(fb, 8, y, 'light');
        const sp = NP.data.species[id];
        ui.text(fb, NP.util.pad(sp.num, 3), 16, y, 'light', { color: '#9098b0', shadow: null });
        ui.text(fb, dex.seen[id] ? sp.name : '-----', 38, y, 'light');
        if (dex.caught[id]) fb.fillRect(92, y + 2, 5, 5, '#e85a5a');
      }
      ui.frame(fb, 108, 4, 128, 152, 'light');
      const id = ids[this.cur], sp = NP.data.species[id];
      if (dex.seen[id]) {
        fb.blit(A().kiguFront(id), 140, 10);
        ui.text(fb, sp.name, 114, 78, 'light');
        sp.types.forEach((t, i) => fb.blit(A().typePill(t), 114 + i * 36, 90));
        Font.wrap(sp.dex, 116).slice(0, 4).forEach((l, i) => ui.text(fb, l, 114, 106 + i * 10, 'light', { color: '#505870', shadow: null }));
      } else {
        fb.blit(A().kiguFront(id).silhouette('#40485a'), 140, 10);
        ui.text(fb, '?????', 114, 78, 'light');
      }
      ui.text(fb, 'Seen ' + seen + '  Friends ' + caught, 114, 146, 'light', { color: '#9098b0', shadow: null });
    }
  }

  // ===================================================================================== Tailor card
  class CardScene extends Scene {
    constructor() { super('light'); }
    enter() { this.spawn((function* (s) { yield; while (!Input.pressed.b && !Input.pressed.a) yield; NP.snd.sfx('cancel'); NP.Game.pop(); })(this)); }
    draw(fb) {
      bgFill(fb, '#e0e8f8', '#d4def2');
      const st = NP.state;
      ui.frame(fb, 8, 8, 224, 144, 'light');
      ui.text(fb, 'TAILOR CARD', 20, 16, 'light', { color: '#d83838' });
      fb.blit(A().human(NP.State.lookId()).frames.down[0], 24, 44);
      ui.text(fb, 'Name   ' + st.name, 70, 32, 'light');
      ui.text(fb, 'Money  $' + st.money, 70, 46, 'light');
      ui.text(fb, 'Friends ' + Object.keys(st.dex.caught).length + ' (seen ' + Object.keys(st.dex.seen).length + ')', 70, 60, 'light');
      ui.text(fb, 'Time   ' + NP.State.timeString(), 70, 74, 'light');
      ui.text(fb, 'Buttons', 20, 100, 'light', { color: '#707890' });
      for (let i = 0; i < 8; i++) {
        const x = 20 + i * 26, y = 114;
        const b = A().badge(st.badges[i] ? i + 1 : 0, false);
        if (b) fb.blit(b, x, y);
        else { fb.ellipse(x + 8, y + 8, 8, 8, st.badges[i] ? '#f0c030' : '#c8d0e0', true); fb.ellipse(x + 8, y + 8, 8, 8, '#606880', false); }
      }
    }
  }

  // ===================================================================================== Options
  class OptionsScene extends Scene {
    constructor() { super('light'); this.cur = 0; }
    enter() { this.spawn(this.run(), 'opts'); }
    rows() {
      const o = NP.state ? NP.state.opts : NP.Game.opts;
      return [
        { name: 'Text speed', vals: ['Slow', 'Mid', 'Fast'], get: () => o.textSpeed, set: (v) => { o.textSpeed = v; NP.Game.opts.textSpeed = v; } },
        { name: 'Battle anims', vals: ['On', 'Off'], get: () => (o.battleAnim ? 0 : 1), set: (v) => { o.battleAnim = v === 0; NP.Game.opts.battleAnim = v === 0; } },
        { name: 'Battle style', vals: ['Shift', 'Set'], get: () => (o.battleStyle === 'set' ? 1 : 0), set: (v) => { o.battleStyle = v ? 'set' : 'shift'; NP.Game.opts.battleStyle = o.battleStyle; } },
        { name: 'Music', vals: ['Off', 'Low', 'Med', 'High'], get: () => (o.music === undefined ? 2 : o.music), set: (v) => { o.music = v; this.vol(); } },
        { name: 'Sound fx', vals: ['Off', 'Low', 'Med', 'High'], get: () => (o.sfx === undefined ? 2 : o.sfx), set: (v) => { o.sfx = v; this.vol(); } },
        { name: 'Done', vals: [], get: () => 0, set: () => {} },
      ];
    }
    vol() {
      const o = NP.state ? NP.state.opts : NP.Game.opts;
      const f = (v) => [0, 0.25, 0.55, 0.85][v === undefined ? 2 : v];
      try { if (NP.audio && NP.audio.setVolume) NP.audio.setVolume({ music: f(o.music), sfx: f(o.sfx) }); } catch (e) { /* */ }
    }
    *run() {
      yield;
      for (;;) {
        const rows = this.rows();
        const d = Input.menuDir();
        if (d === 'up') this.cur = (this.cur + rows.length - 1) % rows.length;
        else if (d === 'down') this.cur = (this.cur + 1) % rows.length;
        else if ((d === 'left' || d === 'right') && rows[this.cur].vals.length) {
          const n = rows[this.cur].vals.length;
          rows[this.cur].set((rows[this.cur].get() + (d === 'right' ? 1 : n - 1)) % n);
        }
        if (d) NP.snd.sfx('cursor');
        if (Input.pressed.b || (Input.pressed.a && this.cur === rows.length - 1)) { NP.snd.sfx('cancel'); NP.Game.pop(); return; }
        yield;
      }
    }
    draw(fb) {
      bgFill(fb, '#e8e4f4', '#dcd8ee');
      ui.frame(fb, 12, 10, 216, 132, 'light');
      ui.text(fb, 'OPTIONS', 24, 18, 'light', { color: '#d83838' });
      this.rows().forEach((r, i) => {
        const y = 36 + i * 17;
        if (i === this.cur) ui.cursor(fb, 20, y, 'light');
        ui.text(fb, r.name, 30, y, 'light');
        r.vals.forEach((v, j) => ui.text(fb, v, 120 + j * 28, y, 'light', { color: r.get() === j ? '#d83838' : '#a0a8c0', shadow: r.get() === j ? undefined : null }));
      });
    }
  }

  // ===================================================================================== Evolution
  class EvolutionScene extends Scene {
    constructor(k, to) { super('dark'); this.k = k; this.to = to; this.form = k.species; this.sil = 0; this.sparkle = 0; }
    enter() { this.spawn(this.run(), 'evolve'); }
    *run() {
      const k = this.k, from = K().sp(k), name = K().displayName(k);
      NP.Game.fadeTo(0, 10);
      this.msg.begin('What? ' + name + ' is changing!', { auto: 40, box: { x: 0, y: 112, w: 240, h: 48 } });
      while (this.msg.active) { this.msg.update(); yield; }
      NP.snd.sfx('evolve');
      for (let i = 0; i < 120; i++) {
        this.sil = Math.min(1, i / 30);
        if (i > 30) this.form = Math.floor(i / Math.max(4, 14 - i / 10)) % 2 ? this.to : k.species;
        if (i >= 110) this.form = this.to;
        this.sparkle = i > 60 ? (i - 60) : 0;
        yield;
      }
      this.sil = 0; this.form = this.to;
      const res = K().evolve(k, this.to);
      NP.State.caught(this.to);
      const toName = NP.data.species[this.to].name;
      NP.snd.jingle('j_evolve');
      this.msg.begin('Congratulations! ' + (k.nickname || from.name) + ' evolved into ' + toName + '!', { auto: 60, box: { x: 0, y: 112, w: 240, h: 48 } });
      while (this.msg.active) { this.msg.update(); yield; }
      for (const id of res.evoMoves) {
        if (K().knows(k, id)) continue;
        if (K().learnMove(k, id)) {
          this.msg.begin(K().displayName(k) + ' learned ' + NP.data.moves[id].name + '!', { auto: 40, box: { x: 0, y: 112, w: 240, h: 48 } });
          while (this.msg.active) { this.msg.update(); yield; }
        }
      }
      NP.Game.pop();
    }
    draw(fb) {
      fb.clear('#181828');
      const bg = A().battleBg('indoor');
      fb.blit(bg.bg, 0, 0, { alpha: 0.35 });
      const spr = A().kiguFront(this.form, this.k.alt);
      const x = 88, y = 26;
      if (this.sil > 0 && this.sil < 1) { fb.blit(spr, x, y); fb.blit(spr, x, y, { fill: '#ffffff', alpha: this.sil }); }
      else if (this.sparkle > 0) { fb.blit(spr, x, y, { fill: '#ffffff', alpha: Math.max(0, 1 - this.sparkle / 50) * 0.9 + 0.1 }); }
      else fb.blit(spr, x, y);
      if (this.sparkle > 0) {
        for (let i = 0; i < 12; i++) {
          const a = i * 0.52 + this.sparkle * 0.08, r = this.sparkle * 1.2 % 70;
          fb.fillRect(Math.round(120 + Math.cos(a) * r), Math.round(58 + Math.sin(a) * r * 0.8), 2, 2, '#fff8c0');
        }
      }
      this.drawUI(fb);
    }
  }

  NP.TitleScene = TitleScene;
  NP.NameEntryScene = NameEntryScene;
  NP.DexScene = DexScene;
  NP.CardScene = CardScene;
  NP.OptionsScene = OptionsScene;
  NP.EvolutionScene = EvolutionScene;
})(typeof globalThis !== 'undefined' ? globalThis : window);
