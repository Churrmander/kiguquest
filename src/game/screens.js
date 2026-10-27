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
        m.x = (NP.W - m.w) >> 1; m.y = 128;
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
      if (isNew) ow.loadMap('player_house', 6, 3, 'down');   // the first morning: Mom wakes you
      else ow.loadMap(p.map, p.x, p.y, p.dir);   // run onEnter: it syncs story NPCs (e.g. Seamstead's Salon lane) to the flags
      NP.Game.fadeTo(0, 20);
    }
    draw(fb) {
      const f = NP.Game.frame;
      if (this.scene) fb.blit(this.scene, 0, 0);
      else {
        for (let y = 0; y < NP.H; y++) fb.fillRect(0, y, NP.W, 1, y < 120 ? NP.Color.mix('#ffb8d0', '#9ad4f0', y / 120) : '#78c058');
      }
      if (this.logo) fb.blit(this.logo, (NP.W - this.logo.w) >> 1, 20);
      else {
        Font.draw(fb, 'KIGU QUEST', NP.W / 2, 40, { color: '#ffffff', shadow: '#c04878', outline: '#602040', align: 'center' });
      }
      if (this.stage === 0 && (f >> 5) % 2 === 0) Font.draw(fb, 'PRESS START', NP.W / 2, 150, { color: '#ffffff', shadow: '#00000080', outline: '#302040', align: 'center' });
      if (this.stage === 1 && this.peek) {
        const p = this.peek;
        ui.frame(fb, 58, 88, 140, 30, 'light');
        ui.text(fb, p.name + '   Buttons ' + p.badges, 68, 94, 'light');
        ui.text(fb, 'Sketchbook ' + p.dex + '   ' + NP.util.pad(Math.floor(p.frames / 216000), 1) + 'h ' + NP.util.pad(Math.floor(p.frames / 3600) % 60, 2) + 'm', 68, 105, 'light', { color: '#707890', shadow: null });
      }
      Font.draw(fb, 'Befriend Kigu. Stitch your story.', NP.W / 2, NP.H - 12, { color: '#ffffffb0', shadow: '#00000060', align: 'center' });
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
      const g = yield* this.choose(['Boy', 'Girl'], { x: 176, y: 60 });
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
          else if (this.cx === 1) { this.name = NP.State.defaultName(this.gender); NP.snd.sfx('select'); }
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
      ui.text(fb, 'What is your name?', NP.W / 2, 6, 'light', { align: 'center' });
      const look = this.gender === 'm' ? 'hero_m' : 'hero_f';
      const s = A().human(look).frames.down[0]; // 32x32 cell, feet on the bottom row
      fb.blit(s, 26, 46 - s.h);
      ui.frame(fb, 68, 22, 120, 20, 'light');
      for (let i = 0; i < 8; i++) {
        const ch = this.name[i];
        fb.hline(80 + i * 12, 37, 9, '#8090b0');
        if (ch) ui.text(fb, ch, 82 + i * 12, 27, 'light', { shadow: null });
      }
      ui.frame(fb, 6, 52, NP.W - 12, 108, 'light');
      for (let y = 0; y < ROWS.length; y++) {
        for (let x = 0; x < 13; x++) {
          const sel = this.cy === y && this.cx === x;
          const px = 18 + x * 18, py = 60 + y * 17;
          if (sel) fb.fillRect(px - 3, py - 3, 15, 13, '#ffe8a0');
          ui.text(fb, ROWS[y][x], px + Math.floor((8 - Font.width(ROWS[y][x])) / 2) - 1, py, 'light', { shadow: null });
        }
      }
      ['Delete', 'Default', 'OK'].forEach((t, i) => {
        const sel = this.cy === ROWS.length && this.cx === i;
        const px = 34 + i * 74;
        if (sel) fb.fillRect(px - 4, 145 - 4, 60, 14, '#ffe8a0');
        ui.text(fb, t, px, 145, 'light', { shadow: null });
      });
      ui.text(fb, 'A: pick    B: delete', NP.W / 2, NP.H - 18, 'light', { align: 'center', color: '#9098b0', shadow: null });
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
      ui.frame(fb, 4, 4, 100, NP.H - 8, 'light');
      const top = Math.max(0, Math.min(this.cur - 6, ids.length - 13));
      for (let i = 0; i < 13 && top + i < ids.length; i++) {
        const id = ids[top + i], y = 10 + i * 13;
        if (top + i === this.cur) ui.cursor(fb, 8, y, 'light');
        const sp = NP.data.species[id];
        ui.text(fb, NP.util.pad(sp.num, 3), 16, y, 'light', { color: '#9098b0', shadow: null });
        ui.text(fb, dex.seen[id] ? sp.name : '-----', 38, y, 'light');
        if (dex.caught[id]) fb.fillRect(92, y + 2, 5, 5, '#e85a5a');
      }
      ui.frame(fb, 108, 4, NP.W - 112, NP.H - 8, 'light');
      const id = ids[this.cur], sp = NP.data.species[id];
      if (dex.seen[id]) {
        { const f = A().kiguFront(id, false, (NP.Game.frame / 9) | 0); fb.blit(f, 182 - (f.w >> 1), 8); }
        ui.text(fb, sp.name, 114, 106, 'light');
        sp.types.forEach((t, i) => fb.blit(A().typePill(t), 114 + i * 36, 118));
        Font.wrap(sp.dex, NP.W - 128).slice(0, 4).forEach((l, i) => ui.text(fb, l, 114, 134 + i * 10, 'light', { color: '#505870', shadow: null }));
      } else {
        { const f = A().kiguFront(id).silhouette('#40485a'); fb.blit(f, 182 - (f.w >> 1), 8); }
        ui.text(fb, '?????', 114, 106, 'light');
      }
      ui.text(fb, 'Seen ' + seen + '  Friends ' + caught, 114, NP.H - 14, 'light', { color: '#9098b0', shadow: null });
    }
  }

  // ===================================================================================== Tailor card
  class CardScene extends Scene {
    constructor() { super('light'); this.page = 0; }
    enter() {
      this.spawn((function* (s) {
        yield;
        while (!Input.pressed.b && !Input.pressed.a) {
          // Left/Right turns to the plush shelf won at the Shibuyarn arcade (src/game/arcade/cards.js)
          const d = Input.menuDir();
          if (NP.arcade && NP.arcade.drawPlushShelf && (d === 'left' || d === 'right')) { s.page ^= 1; NP.snd.sfx('cursor'); }
          yield;
        }
        NP.snd.sfx('cancel'); NP.Game.pop();
      })(this));
    }
    draw(fb, frame) {
      bgFill(fb, '#e0e8f8', '#d4def2');
      const st = NP.state;
      if (NP.arcade && NP.arcade.drawCardFrame) NP.arcade.drawCardFrame(fb, 8, 8, NP.W - 16, NP.H - 16);
      else ui.frame(fb, 8, 8, NP.W - 16, NP.H - 16, 'light');
      if (this.page === 1) { NP.arcade.drawPlushShelf(fb, 8, 8, NP.W - 16, NP.H - 16, frame | 0); return; }
      ui.text(fb, 'TAILOR CARD', 20, 16, 'light', { color: '#d83838' });
      // the approved AutoSprite hero (same art as the battle send-out); the older generated portrait only as a fallback
      const as = NP.art.autosprite && NP.art.autosprite.trainer && NP.art.autosprite.trainer(NP.State.lookId());
      const tr = as && as.bmp ? as.bmp : A().humanFront(NP.State.lookId()); // bottom-centre anchor
      fb.blit(tr, 40 - (tr.w >> 1), 112 - tr.h);
      ui.text(fb, 'Name   ' + st.name, 70, 32, 'light');
      ui.text(fb, 'Money  $' + st.money, 70, 46, 'light');
      ui.text(fb, 'Friends ' + Object.keys(st.dex.caught).length + ' (seen ' + Object.keys(st.dex.seen).length + ')', 70, 60, 'light');
      ui.text(fb, 'Time   ' + NP.State.timeString(), 70, 74, 'light');
      if (st.flags.stamp_fishing_master && NP.Fishing) NP.Fishing.drawStamp(fb, 202, 12);   // shown a rare fish to the Fishing Master
      // Button case: two rows of four 32 px Buttons (NP.art.icons badges.js); an empty stitched slot until the Salon is won
      ui.text(fb, 'Buttons', 78, 88, 'light', { color: '#707890' });
      // recessed felt tray: dark lip top-left, light lip bottom-right
      fb.fillRect(74, 99, 166, 78, '#5a1e3a'); fb.fillRect(75, 100, 164, 76, '#8a3058');
      fb.fillRect(75, 100, 164, 2, '#6a2244'); fb.fillRect(75, 100, 2, 76, '#6a2244');
      fb.fillRect(75, 175, 164, 1, '#b85a80'); fb.fillRect(238, 100, 1, 76, '#b85a80');
      for (let i = 0; i < 8; i++) {
        const x = 80 + (i & 3) * 40, y = 102 + (i >> 2) * 38;
        const icon = A().badge(st.badges[i] ? i + 1 : 0, true);
        if (icon) fb.blit(icon, x, y);
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
        { name: 'Time of day', vals: ['Auto', 'Morning', 'Day', 'Evening', 'Night'], get: () => o.clock || 0, set: (v) => { o.clock = v; NP.Game.opts.clock = v; } },
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
      ui.frame(fb, 12, 10, NP.W - 24, NP.H - 20, 'light');
      ui.text(fb, 'OPTIONS', 24, 18, 'light', { color: '#d83838' });
      this.rows().forEach((r, i) => {
        const y = 36 + i * 17;
        if (i === this.cur) ui.cursor(fb, 20, y, 'light');
        ui.text(fb, r.name, 30, y, 'light');
        r.vals.forEach((v, j) => ui.text(fb, v, 128 + j * 30, y, 'light', { color: r.get() === j ? '#d83838' : '#a0a8c0', shadow: r.get() === j ? undefined : null }));
      });
    }
  }

  // ===================================================================================== Evolution
  const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
  /** Evolution, 5th-gen pacing (round 4: it used to be over in two seconds). About ten seconds from "is evolving!" to the
   *  reveal: she glows white, old and new shapes trade places faster and faster while sparkles rise, a white flash, then the new
   *  form with a burst. B during the change stops it (she will try again at her next level). */
  class EvolutionScene extends Scene {
    constructor(k, to) {
      super('dark');
      this.k = k; this.to = to; this.form = k.species;
      this.white = 0; this.flash = 0; this.glowP = 0; this.parts = []; this.burst = 0; this.t = 0;
    }
    enter() { this.spawn(this.run(), 'evolve'); }
    *say(text, auto) {
      this.msg.begin(text, { auto, box: { x: 0, y: NP.BOX_Y, w: NP.W, h: 48 } });
      while (this.msg.active) { this.msg.update(); yield; }
    }
    rise(n) {
      for (let i = 0; i < n; i++) this.parts.push({ x: NP.W / 2 + (Math.random() - 0.5) * 120, y: NP.BOX_Y + 4, vy: -0.6 - Math.random() * 1.2, life: 60 + Math.random() * 50 });
    }
    *run() {
      const k = this.k, from = K().sp(k), name = K().displayName(k);
      NP.Game.fadeTo(0, 16);
      yield* this.wait(20);
      NP.snd.cry(k.species);
      yield* this.say('What? ' + name + ' is evolving!');
      NP.snd.play('evolution', { restart: true });
      // 1) she fills with light (1.5 s)
      for (let i = 0; i < 90; i++) { this.white = i / 90; this.glowP = i / 90; if (i % 10 === 0) this.rise(1); yield; }
      this.white = 1;
      // 2) old and new shapes swap, slow at first, then faster and faster (about 7 s); B stops it
      let stopped = false, swap = 0, flip = false;
      const N = 430;
      for (let i = 0; i < N; i++) {
        const period = Math.max(3, Math.round(34 - 31 * Math.pow(i / N, 0.8)));
        if (++swap >= period) { swap = 0; flip = !flip; this.form = flip ? this.to : k.species; }
        if (i % Math.max(2, 9 - ((i / 60) | 0)) === 0) this.rise(1);
        if (i > 20 && Input.pressed.b) { stopped = true; break; }
        yield;
      }
      if (stopped) {
        NP.snd.stop(200);
        this.form = k.species;
        for (let i = 0; i < 30; i++) { this.white = 1 - i / 30; yield; }
        this.white = 0;
        k.evoStop = k.level;
        yield* this.say('Huh? ' + name + ' stopped evolving!');
        NP.snd.cry(k.species);
        yield* this.wait(20);
        NP.Game.fadeTo(1, 16, '#000000');
        yield* this.wait(18);
        NP.Game.pop();
        return;
      }
      // 3) a white flash, and she steps out in her new form
      NP.snd.sfx('evolve');
      for (let i = 0; i < 24; i++) { this.flash = i / 24; yield; }
      this.form = this.to; this.flash = 1;
      yield* this.wait(20);
      this.white = 0; this.glowP = 0;
      for (let i = 0; i < 40; i++) { this.flash = 1 - i / 40; this.burst = i; yield; }
      this.flash = 0;
      for (let i = 40; i < 70; i++) { this.burst = i; yield; }
      this.burst = 0;
      const res = K().evolve(k, this.to);
      NP.State.caught(this.to);
      const toName = NP.data.species[this.to].name;
      NP.snd.stop(0);
      NP.snd.cry(this.to);
      yield* this.wait(50);
      NP.snd.jingle('j_evolve');
      yield* this.say('Congratulations! ' + (k.nickname || from.name) + ' evolved into ' + toName + '!');
      for (const id of res.evoMoves) {
        if (K().knows(k, id)) continue;
        if (K().learnMove(k, id)) yield* this.say(K().displayName(k) + ' learned ' + NP.data.moves[id].name + '!');
      }
      NP.Game.fadeTo(1, 16, '#000000');
      yield* this.wait(18);
      NP.Game.pop();
    }
    update() {
      super.update();
      this.t++;
      for (const p of this.parts) { p.y += p.vy; p.life--; }
      this.parts = this.parts.filter((p) => p.life > 0 && p.y > -4);
    }
    draw(fb) {
      fb.clear('#181828');
      if (!this.glow) { // soft dithered glow behind her (built once)
        const g = (this.glow = new NP.Bitmap(NP.W, NP.BOX_Y)), cx = NP.W / 2, cy = NP.BOX_Y / 2 + 10;
        const c1 = NP.Color.parse('#3a3460'), c2 = NP.Color.parse('#28264a');
        for (let y = 0; y < NP.BOX_Y; y++) for (let x = 0; x < NP.W; x++) {
          const r = Math.hypot((x - cx) / 1.4, y - cy), b = BAYER[(y & 3) * 4 + (x & 3)];
          if (r < 38 + b * 0.8) g.u32[y * NP.W + x] = c1; else if (r < 62 + b * 0.9) g.u32[y * NP.W + x] = c2;
        }
      }
      fb.blit(this.glow, 0, 0);
      const spr = A().kiguFront(this.form, this.k.alt, this.white > 0 ? 0 : (NP.Game.frame / 9) | 0);
      const x = (NP.W - spr.w) >> 1, y = Math.max(4, NP.BOX_Y - 12 - spr.h);
      const cx = NP.W / 2, cy = y + spr.h / 2;
      // a pulsing ring of light while she changes
      if (this.glowP > 0) {
        const r = 30 + Math.sin(this.t / 8) * 4;
        for (let i = 0; i < 24; i++) {
          const a = i / 24 * Math.PI * 2 + this.t * 0.02;
          fb.fillRect(Math.round(cx + Math.cos(a) * r * 1.3), Math.round(cy + Math.sin(a) * r), 2, 2, this.glowP > 0.5 ? '#c8c0ff' : '#8078c8');
        }
      }
      fb.blit(spr, x, y);
      if (this.white > 0) fb.blit(spr, x, y, { fill: '#ffffff', alpha: this.white });
      for (const p of this.parts) fb.fillRect(Math.round(p.x), Math.round(p.y), 2, 2, p.life % 12 < 6 ? '#fff8c0' : '#c8e8ff');
      if (this.burst > 0) {
        for (let i = 0; i < 16; i++) {
          const a = i * 0.39 + this.burst * 0.03, r = this.burst * 1.6;
          fb.fillRect(Math.round(cx + Math.cos(a) * r * 1.2), Math.round(cy + Math.sin(a) * r * 0.9), 2, 2, '#fff8c0');
        }
      }
      if (this.flash > 0) fb.blendRect(0, 0, NP.W, NP.H, '#ffffff', this.flash);
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
