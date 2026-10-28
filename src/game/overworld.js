/* NP.Overworld — the walking-around scene: map loading, actors (player/NPCs/props), collision, warps, triggers,
 * trainer sight lines, wild encounters, scripted events (generator scripts through NP.ScriptCtx), start menu. */
(function (root) {
  'use strict';
  const NP = (root.NP = root.NP || {});
  const { Input, ui, Scene, Bitmap } = NP;
  const A = () => NP.assets;
  const DIRV = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
  const OPP = { up: 'down', down: 'up', left: 'right', right: 'left' };
  // anything a shopkeeper can stand behind: A at the front of one talks to whoever is on the other side (owner's rule)
  const COUNTERS = new Set(['counter_l', 'counter_m', 'counter_r', 'counter_c', 'tea_healer', 'display_case', 'honey_stall']);
  const ABORT = { abort: true };
  /** Writing-team hook: NP.text.get(key) -> array of page strings | null. Safe when NP.text does not exist. */
  function textOverride(key) {
    try {
      const L = NP.text && NP.text.get && NP.text.get(key);
      return L && L.length ? Array.from(L) : null;
    } catch (e) { return null; }
  }
  NP.textOverride = textOverride;

  // ------------------------------------------------------------------------------------------ actors
  class Actor {
    constructor(o) {
      Object.assign(this, { id: '', kind: 'npc', x: 0, y: 0, dir: 'down', look: null, ox: 0, oy: 0, moving: false, spd: 1, parity: 0, hidden: false, solid: true, hop: 0, def: null, homeX: 0, homeY: 0, wait: 0, emote: null, emoteT: 0 }, o);
      this.homeX = this.x; this.homeY = this.y;
    }
    get visible() {
      if (this.hidden) return false;
      const h = this.def && this.def.hideIf, sh = this.def && this.def.showIf;   // showIf: only there once a story flag is set
      return !(h && NP.state.flags[h]) && !(sh && !NP.state.flags[sh]);
    }
    get px() { return this.x * 16 + this.ox; }
    get py() { return this.y * 16 + this.oy; }
    step(dir, spd, scripted) {
      const [dx, dy] = DIRV[dir];
      this.dir = dir;
      this.x += dx; this.y += dy;
      this.ox = -dx * 16; this.oy = -dy * 16;
      this.moving = true; this.spd = spd || 1; this.parity ^= 1; this.scripted = !!scripted; this.mdx = dx; this.mdy = dy;
    }
    hopStep(dir, tiles) {
      const [dx, dy] = DIRV[dir];
      this.dir = dir;
      this.x += dx * tiles; this.y += dy * tiles;
      this.ox = -dx * 16 * tiles; this.oy = -dy * 16 * tiles;
      this.moving = true; this.spd = 1.5; this.mdx = dx; this.mdy = dy; this.hopping = true; this.hopTotal = 16 * tiles;
    }
    update() {
      if (this.emoteT > 0) this.emoteT--;
      if (!this.moving) return false;
      const s = this.spd;
      this.ox -= Math.sign(this.ox) * Math.min(Math.abs(this.ox), s);
      this.oy -= Math.sign(this.oy) * Math.min(Math.abs(this.oy), s);
      if (this.hopping) {
        const left = Math.abs(this.ox) + Math.abs(this.oy);
        const p = 1 - left / this.hopTotal;
        this.hop = Math.sin(p * Math.PI) * 6;
      }
      if (this.ox === 0 && this.oy === 0) {
        this.moving = false; this.hopping = false; this.hop = 0;
        return true; // step finished
      }
      return false;
    }
    draw(fb, camX, camY, frame) {
      if (!this.visible) return;
      const X = Math.round(this.px - camX), Y = Math.round(this.py - camY);
      if (this.kind === 'prop') {
        const d = this.def;
        let bmp = null, dy = -5, dx = 0;
        if (d.icon === 'spool') bmp = A().spool('bond', (frame >> 3) & 3);
        else if (d.icon && d.icon.indexOf('item:') === 0) { bmp = A().itemIcon(d.icon.slice(5)); dx = -4; dy = -6; }
        if (bmp) fb.blit(bmp, X + dx, Y + dy);
        return;
      }
      const spr = A().human(this.look);
      const vd = NP.view3d ? NP.view3d.viewDir(this.dir) : this.dir;
      const set = spr.frames[vd] || spr.frames.down;
      // 5th-gen walk: the stride frame for the first half of each step, standing for the second half, so the legs visibly open
      // and close (side views used to hold one stride the whole way, which read as sliding)
      const f = this.moving && Math.abs(this.ox) + Math.abs(this.oy) > 8 ? (this.parity ? 1 : 2) : 0;
      const bmp = set[Math.min(f, set.length - 1)];
      // the sprite cell (32x32) is centred on the tile with the feet on the tile's bottom row: (X - 8, Y - 16)
      const sx = X + ((16 - bmp.w) >> 1), sy = Y + 16 - bmp.h;
      if (this.swim) { // paddling: a ripple ring instead of a shadow; she sits lower and the water hides her legs
        const bob = (frame >> 4) & 1, wl = Y + 13, top = sy + 6 + bob;
        fb.blendRect(X, Y + 12, 16, 4, '#7fc8ff', 0.55);
        fb.blendRect(X + 2, Y + 16, 12, 1, '#2a6fb0', 0.45);
        fb.blit(bmp, sx, top, { sh: Math.max(0, wl - top) });
        fb.blendRect(X + 2, wl - 1, 12, 1, '#ffffff', 0.35);
        return;
      }
      // soft oval shadow under the feet
      fb.blendRect(X + 4, Y + 13, 8, 1, '#000000', 0.2);
      fb.blendRect(X + 2, Y + 14, 12, 1, '#000000', 0.22);
      fb.blendRect(X + 4, Y + 15, 8, 1, '#000000', 0.2);
      fb.blit(bmp, sx, sy - Math.round(this.hop));
    }
  }

  // ----------------------------------------------------------------------------------------- scripts
  class Ctx {
    constructor(ow) { this.ow = ow; }
    get state() { return NP.state; }
    get map() { return this.ow.map; }
    get player() { return this.ow.player; }
    flag(k) { return !!NP.state.flags[k]; }
    set(k, v) { NP.state.flags[k] = v === undefined ? true : v; }
    who(w) { return w === 'player' ? this.ow.player : typeof w === 'string' ? this.ow.find(w) : w; }
    npc(id) { return this.who(id); }
    *say(text, o) { yield* this.ow.say(text, o); }
    /** say the writer's text for `key` if there is any, else `dflt` (string or array of pages) */
    *sayT(key, dflt) {
      const L = textOverride(key) || (Array.isArray(dflt) ? dflt : [dflt]);
      for (const page of L) yield* this.ow.say(page);
    }
    *ask(text) { return yield* this.ow.ask(text); }
    *choose(items, o) { return yield* this.ow.choose(items, o); }
    *wait(n) { yield* this.ow.wait(n); }
    *face(w, dir) { const a = this.who(w); if (a) a.dir = dir; yield* this.ow.wait(4); }
    *emote(w, name) {
      const a = this.who(w);
      a.emote = name; a.emoteT = 36;
      if (name === 'exclaim') NP.snd.sfx('select');
      yield* this.ow.wait(34);
    }
    placeNpc(w, x, y, dir) { const a = this.who(w); a.x = x; a.y = y; a.ox = a.oy = 0; if (dir) a.dir = dir; }
    showNpc(id) { const a = this.who(id); if (a) a.hidden = false; }
    hideNpc(id) { const a = this.who(id); if (a) a.hidden = true; }
    /** an NPC walks behind the player, one tile back, until unfollow (Tuck in the Spark Cellar). Lasts until the map changes. */
    follow(w) { const a = this.who(w); if (!a) return; a.solid = false; a.hidden = false; this.ow.follower = a; }
    unfollow() { const a = this.ow.follower; if (a) a.solid = true; this.ow.follower = null; }
    hideProp(id) { this.hideNpc(id); const a = this.who(id); if (a && a.def && a.def.hideIf) NP.state.flags[a.def.hideIf] = true; }
    music(id) { NP.snd.play(id); }
    *jingleWait(id) {
      let done = false;
      NP.snd.jingle(id, () => (done = true));
      let guard = 0;
      while (!done && guard++ < 300) yield;
      if (!done) yield* this.ow.wait(40);
    }
    *giveItem(id, n, o) {
      n = n || 1;
      const d = NP.data.items[id];
      NP.State.addItem(id, n);
      const key = d.pocket === 'key';
      yield* this.jingleWait(key ? 'j_key_item' : 'j_item');
      const txt = (o && o.found ? '{player} found ' : '{player} received ') + (n > 1 ? n + ' ' + d.name + 's' : d.name) + '!';
      yield* this.say(txt + '\\p' + 'It was put in the ' + (d.pocket === 'spools' ? 'Spools' : d.pocket === 'key' ? 'Key Items' : 'Items') + ' pocket.');
    }
    *giveKigu(sp, lv, o) {
      const k = NP.Kigu.create(sp, lv, { ot: NP.state.name, metMap: this.ow.map.id });
      const where = NP.State.addKigu(k);
      if (!(o && o.silent)) {
        yield* this.jingleWait('j_caught');
        yield* this.say('{player} received ' + NP.Kigu.displayName(k) + '!' + (where === 'box' ? '\\pShe was sent to storage.' : ''));
      }
      return k;
    }
    setHealPoint() { NP.state.healPoint = { map: this.ow.map.id, spawn: 'door' }; (NP.state.visited = NP.state.visited || {})[this.ow.map.id] = 1; }
    *healAnim() {
      NP.snd.stop(200);
      yield* this.ow.fadeOut(10, '#ffe8f0');
      yield* this.ow.wait(20);
      NP.State.healAll();
      yield* this.jingleWait('j_heal');
      yield* this.ow.fadeIn(10);
      NP.snd.play(this.ow.musicId, { fadeMs: 300 });
    }
    *heal(text) { NP.State.healAll(); NP.snd.sfx('save'); if (text) yield* this.say(text); this.setHealPoint(); }
    *shop(list) { const s = new NP.ShopScene(list); NP.Game.push(s); yield* this.ow.waitFor(() => s.finished); }
    /** the Shibuyarn arcade: a cabinet ('cab_1'..), 'coins' or 'prizes' (src/game/arcade/core.js) */
    *arcade(id, o) { return yield* NP.arcade.run(this, id, o); }
    *pc() { const s = new NP.BoxScene(); NP.Game.push(s); yield* this.ow.waitFor(() => s.finished); }
    *warp(map, x, y, dir) { yield* this.ow.teleport(map, x, y, dir); }
    *trainerBattle(def) { return yield* this.ow.trainerBattle(def); }
    *wildBattle(sp, lv, o) { return yield* this.ow.wildBattle(sp, lv, o); }
    /** Field move Paddle: offer to step off the shore onto calm water (needs Disc: Paddle). */
    *paddle(dir) {
      if (yield* this.ask('The water looks calm.\\nPaddle across it?')) { NP.snd.sfx('splash'); yield* this.walk('player', [dir, 1]); }
    }
    /** Field move Snip: clear a bush (needs Disc: Snip). The cut is remembered in a flag and re-applied whenever the map loads. */
    *snip(pl) {
      if (!NP.state.bag.disc_snip) { yield* this.sayT('field.snip.no', 'A small bush is in the way.\\pA pair of snips could clear it.'); return; }
      if (yield* this.ask('A small bush is in the way.\\nSnip it?')) {
        NP.snd.sfx('leaf');
        this.map.removeStamp(pl);
        NP.state.flags['snip:' + this.map.id + ':' + pl.x + ',' + pl.y] = true;
        yield* this.wait(10);
        yield* this.say('{player} snipped the bush away!');
      }
    }
  }
  // clean walk() implementation
  Ctx.prototype.walk = function* (w, steps, spd) {
    const a = this.who(w);
    const list = [];
    for (let i = 0; i < steps.length; i++) {
      const d = steps[i];
      const n = typeof steps[i + 1] === 'number' ? steps[i + 1] : 1;
      if (typeof steps[i + 1] === 'number') i++;
      for (let k = 0; k < n; k++) list.push(d);
    }
    for (const d of list) {
      while (a.moving) yield;
      a.step(d, spd || 1, true);
      while (a.moving) yield;
    }
  };

  /** shortest open path (map directions) from actor a to any tile in `goals` ('x,y' strings), round walls, ledges and people */
  function pathTo(ow, a, goals) {
    const m = ow.map, D = [['up', 0, -1], ['down', 0, 1], ['left', -1, 0], ['right', 1, 0]];
    const start = a.x + ',' + a.y;
    if (goals.has(start)) return [];
    const prev = new Map([[start, null]]), q = [[a.x, a.y]];
    while (q.length && prev.size < 6000) {
      const [x, y] = q.shift();
      for (const [d, dx, dy] of D) {
        const nx = x + dx, ny = y + dy, k = nx + ',' + ny;
        if (prev.has(k) || !m.inBounds(nx, ny) || m.solid(nx, ny) || m.ledge(nx, ny) || ow.actorAt(nx, ny, a)) continue;
        prev.set(k, [x + ',' + y, d]);
        if (goals.has(k)) { const out = []; for (let c = k; prev.get(c); c = prev.get(c)[0]) out.unshift(prev.get(c)[1]); return out; }
        q.push([nx, ny]);
      }
    }
    return null;
  }
  const FACE = { up: 'down', down: 'up', left: 'right', right: 'left' };
  /** walk w to (x, y) by the shortest open path. False if there is no way. */
  Ctx.prototype.walkTo = function* (w, x, y) {
    const a = this.who(w), path = pathTo(this.ow, a, new Set([x + ',' + y]));
    if (!path) return false;
    yield* this.walk(a, path);
    return true;
  };
  /** w comes over to stand next to the player (or `to`), and the two turn to face each other, so a scene's speaker is always
   *  on screen beside you (owner's note: "Mimi is talking to me, but is nowhere to be found"). */
  Ctx.prototype.approach = function* (w, to) {
    const a = this.who(w), t = this.who(to || 'player');
    const goals = new Set([[0, -1], [0, 1], [-1, 0], [1, 0]].map(([dx, dy]) => (t.x + dx) + ',' + (t.y + dy)));
    const path = pathTo(this.ow, a, goals);
    if (path && path.length) yield* this.walk(a, path);
    const dx = t.x - a.x, dy = t.y - a.y;
    const d = Math.abs(dx) >= Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up');
    a.dir = d; t.dir = FACE[d];
    yield* this.ow.wait(4);
  };
  /** a hidden NPC walks in from `o.dist` tiles away (first open spot in the `o.from` directions) and comes over to the player */
  Ctx.prototype.enter = function* (w, o) {
    o = o || {};
    const a = this.who(w), p = this.ow.player, m = this.ow.map, dist = o.dist || 5;
    const V = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
    let spot = null;
    for (const d of o.from || ['right', 'left', 'down', 'up']) {
      for (let r = dist; r >= 2 && !spot; r--) {
        const x = p.x + V[d][0] * r, y = p.y + V[d][1] * r;
        if (!m.inBounds(x, y) || m.solid(x, y) || m.ledge(x, y) || this.ow.actorAt(x, y, a)) continue;
        a.x = x; a.y = y;
        if (pathTo(this.ow, a, new Set([(p.x - V[d][0]) + ',' + (p.y - V[d][1]), (p.x + 1) + ',' + p.y, (p.x - 1) + ',' + p.y, p.x + ',' + (p.y + 1), p.x + ',' + (p.y - 1)]))) spot = [x, y];
      }
      if (spot) break;
    }
    if (!spot) { a.x = p.x + 1; a.y = p.y; }
    a.ox = a.oy = 0; a.hidden = false;
    yield* this.approach(a);
  };

  /** w walks off `dist` tiles from the player (the nearest open spot that far) and is hidden: the end of a walk-on scene */
  Ctx.prototype.leave = function* (w, dist) {
    const a = this.who(w), p = this.ow.player, m = this.ow.map, far = dist || 5;
    const goals = new Set();
    for (let y = 0; y < m.h; y++) for (let x = 0; x < m.w; x++) if (Math.abs(x - p.x) + Math.abs(y - p.y) === far && !m.solid(x, y)) goals.add(x + ',' + y);
    const path = pathTo(this.ow, a, goals);
    if (path) yield* this.walk(a, path);
    a.hidden = true;
  };

  /** A pushed ore cart rolls along the rails until something stops it: the end of the line, a person, another cart, a rock.
   *  At points (a rail tile joined three or four ways) a cart coming from the trunk takes the branch its lever is set to; from a
   *  branch it always runs on to the trunk. Points: def.railPoints = [{x, y, trunk, a, b, flag}] (flag set = branch b).
   *  def.onCartStop(c, cart, hit) runs when it stops; `hit` is the solid tile it ran into ({x, y}) or null. */
  Ctx.prototype.rollCart = function* (p, d) {
    const ow = this.ow, m = ow.map, V = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
    let dir = d, hit = null, n = 0;
    NP.snd.sfx('ledge');
    while (n++ < 200) {
      const nx = p.x + V[dir][0], ny = p.y + V[dir][1];
      if (!m.isRail(nx, ny)) break;                                            // the end of the line
      if (m.solid(nx, ny) || ow.actorAt(nx, ny)) { hit = { x: nx, y: ny }; break; }
      m.moveStamp(p, nx, ny);
      if (n % 2) NP.snd.sfx('step');
      yield* this.wait(3);
      const exits = m.railDirs(nx, ny).filter((e) => e !== OPP[dir]);
      if (!exits.length) break;
      const pt = (m.def.railPoints || []).find((q) => q.x === nx && q.y === ny);
      if (pt && OPP[dir] === pt.trunk) dir = NP.state.flags[pt.flag] ? pt.b : pt.a;   // facing the points: the lever decides
      else if (pt) dir = pt.trunk;                                                    // trailing through them
      else if (!exits.includes(dir)) dir = exits[0];                                  // round a bend
    }
    NP.snd.sfx(hit ? 'bump' : 'door');
    if (p.homeX === undefined) { p.homeX = p.x; p.homeY = p.y; }
    NP.state.flags['shove:' + m.id + ':' + p.homeX + ',' + p.homeY] = p.x + ',' + p.y;
    if (m.def.onCartStop) yield* m.def.onCartStop(this, p, hit);
  };

  /** A remembered scene (def.memory): warm sepia with a soft vignette, so it reads as the past. The message box is drawn after. */
  function memoryTone(fb, vigH) {
    const d = fb.data, W = fb.w, H = fb.h, cx = W / 2, cy = vigH / 2, rr = Math.hypot(cx, cy);
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const i = (y * W + x) * 4;
      const l = d[i] * 0.3 + d[i + 1] * 0.59 + d[i + 2] * 0.11;
      // the text box keeps half its own colour (cream, not butter-yellow) and no vignette; the scene keeps a quarter, so leaves
      // stay a little green against the wood
      const box = y >= vigH, keep = box ? 0.5 : 0.15;
      // warm light from the middle of the scene, falling off to dark corners
      const v = box ? 1 : 1.14 - 0.86 * Math.pow(Math.min(1, Math.hypot(x - cx, y - cy) / rr), 1.3);
      const r = Math.min(255, l * 0.95 + 44), g = Math.min(255, l * 0.82 + 26), bl = Math.min(255, l * 0.6 + 10);
      d[i] = Math.min(255, (r * (1 - keep) + d[i] * keep) * v); d[i + 1] = Math.min(255, (g * (1 - keep) + d[i + 1] * keep) * v);
      d[i + 2] = Math.min(255, (bl * (1 - keep) + d[i + 2] * keep) * v);
    }
  }

  // --------------------------------------------------------------------------------------- the scene
  class Overworld extends Scene {
    constructor() {
      super('light');
      this.maps = {};
      this.map = null;
      this.player = null;
      this.actors = [];
      this.ctx = new Ctx(this);
      this.musicId = null;
      this.turnT = 0;
      this.bumpT = 0;
      this.popup = 0;
      this.lastBattleStep = 0;
      this.stepsSinceMap = 0;
      this.dustEmote = null;
    }

    // ---- loading
    tileMap(id) {
      if (!this.maps[id]) {
        if (!NP.maps[id]) throw new Error('no such map: ' + id);
        this.maps[id] = new NP.TileMap(NP.maps[id]);
      }
      return this.maps[id];
    }

    loadMap(id, x, y, dir, o) {
      o = o || {};
      this.map = this.tileMap(id);
      this.map.syncSnips(NP.state.flags);
      this.map.syncShoves(NP.state.flags);
      (NP.state.visited = NP.state.visited || {})[id] = 1;
      const def = this.map.def;
      if (NP.view3d && NP.view3d.enter) NP.view3d.enter(def);   // 3D or flat, and the camera preset, for this map
      this.actors = [];
      for (const n of def.npcs || []) this.actors.push(new Actor({ id: n.id, kind: 'npc', x: n.x, y: n.y, dir: n.dir || 'down', look: n.look, def: n, hidden: !!n.hidden }));
      for (const p of def.props || []) this.actors.push(new Actor({ id: p.id, kind: 'prop', x: p.x, y: p.y, def: p }));
      if (!this.player) this.player = new Actor({ id: 'player', kind: 'player', look: NP.State.lookId() });
      this.player.look = NP.State.lookId();
      Object.assign(this.player, { x, y, dir: dir || 'down', ox: 0, oy: 0, moving: false });
      NP.state.pos = { map: id, x, y, dir: this.player.dir };
      const want = def.music || this.musicId || NP.state.lastMusic;
      if (want && want !== this.musicId) { this.musicId = want; NP.state.lastMusic = want; NP.snd.play(want); }
      else if (want && !NP.snd.song) NP.snd.play(want);
      this.popup = def.indoor ? 0 : 110;
      this.stepsSinceMap = 0;
      this.shoveHint = false;
      this.weather = NP.Weather.now = NP.Weather ? NP.Weather.roll(def) : null;
      NP.Weather.dark = !!def.dark;   // caves count as night for evolutions   // rolled each time you enter (src/game/weather.js)
      if (def.onEnter && !o.noEnter) this.runScript(def.onEnter);
    }

    find(id) { return this.actors.find((a) => a.id === id) || null; }

    // ---- script plumbing
    resolveScript(s) {
      if (typeof s === 'string') {
        if (!NP.scripts[s]) throw new Error('unknown script ' + s);
        return NP.scripts[s];
      }
      return s;
    }

    runScript(fn, npc) {
      const f = this.resolveScript(fn);
      const self = this;
      const gen = (function* () {
        try { yield* f(self.ctx, npc); } catch (e) { if (e !== ABORT) throw e; }
        if (self.restAfterScene) { self.restAfterScene = false; yield* self.toTeaHouse(false); }
      })();
      return this.spawn(gen, 'script');
    }

    spawn(gen, name) {
      const guarded = (function* () {
        try { yield* gen; } catch (e) { if (e !== ABORT) throw e; }
      })();
      return super.spawn(guarded, name);
    }

    get busy() { return this.tasks.length > 0 || this.msg.active || this.transition; }

    *say(text, o) {
      this.msg.begin(text, o);
      while (this.msg.active) { this.msg.update(); yield; }
    }
    *ask(text) {
      this.msg.begin(text, { keep: true });
      while (this.msg.active) { this.msg.update(); yield; }
      const r = yield* this.yesno();
      this.msg.close();
      return r;
    }
    *choose(items, o) {
      const r = yield* super.choose(items, o);
      return r;
    }

    *fadeOut(n, color) { NP.Game.fadeTo(1, n || 12, color || '#000000'); yield* this.wait(n || 12); }
    *fadeIn(n) { NP.Game.fadeTo(0, n || 12); yield* this.wait(n || 12); }

    *teleport(mapId, x, y, dir, o) {
      o = o || {};
      yield* this.fadeOut(o.fast ? 6 : 10);
      this.loadMap(mapId, x, y, dir, { noEnter: true });
      const def = this.map.def;
      yield* this.wait(4);
      yield* this.fadeIn(o.fast ? 6 : 10);
      if (def.onEnter) { try { yield* def.onEnter(this.ctx); } catch (e) { if (e !== ABORT) throw e; } }
    }

    *doWarp(w) {
      const dst = NP.maps[w.to];
      if (!dst) throw new Error('warp to unknown map ' + w.to);
      const tm = this.tileMap(w.to);
      let x, y, dir;
      if (w.door && tm.doors[w.door]) { x = tm.doors[w.door].x; y = tm.doors[w.door].y + 1; dir = 'down'; }
      else if (w.spawn && dst.spawns && dst.spawns[w.spawn]) { ({ x, y, dir } = dst.spawns[w.spawn]); }
      else { x = w.tx; y = w.ty; dir = w.dir || 'down'; }
      if (w.sound !== 'none') NP.snd.sfx('door');
      yield* this.teleport(w.to, x, y, dir);
    }

    // ---- battles
    *transitionToBattle(music) {
      NP.snd.stop(100);
      NP.snd.sfx('battle_start');
      for (let i = 0; i < 3; i++) { NP.Game.flash = 8; yield* this.wait(9); }
      NP.Game.fadeTo(1, 14, '#000000');
      yield* this.wait(16);
      NP.snd.play(music);
    }

    *runBattle(cfg) {
      const scene = new NP.BattleScene(cfg);
      NP.Game.push(scene);
      yield* this.waitFor(() => scene.finished);
      const res = scene.result || { winner: 1 };
      yield* this.wait(2);
      if (res.winner === 1 && cfg.canLose) {
        // a story fight that is allowed to go either way (rivals, Society scenes): no blackout and no lost money. The scene carries
        // on, and when it ends you're taken to the Tea House to rest (runScript). Healed now too, so nothing can strand a fainted team.
        NP.State.healAll();
        this.restAfterScene = true;
      } else if (res.winner === 1) {
        NP.snd.stop(0);
        yield* this.blackout(cfg);
        throw ABORT;
      }
      // coming back to the map
      NP.snd.play(this.musicId, { restart: true });
      NP.Game.fadeTo(0, 14);
      yield* this.wait(14);
      return res;
    }

    /** The closest Tea House by doors and roads (fewest map hops) among those she has unlocked: been inside, or visited the town in
     *  front of it. "Unlocked" keeps an early blackout from skipping ahead (losing to Rival #1 must not wake you up in Thimble). */
    nearestTeaHouse() {
      const vis = NP.state.visited || {};
      const next = (id) => Array.from(this.tileMap(id).warps.values()).map((w) => w.to).filter((t) => NP.maps[t]);
      const unlocked = (id) => !!vis[id] || next(id).some((n) => vis[n]);
      const seen = new Set([this.map.id]);
      for (let ring = [this.map.id]; ring.length;) {
        const nxt = [];
        for (const id of ring) {
          if (NP.maps[id].teaHouse && unlocked(id)) return id;
          for (const n of next(id)) if (!seen.has(n)) { seen.add(n); nxt.push(n); }
        }
        ring = nxt;
      }
      return null;
    }

    *blackout(cfg) {
      const st = NP.state;
      // the battle scene leaves the screen faded to black: clear the fade and draw a plain black backdrop, or the message is hidden under it
      this.blackBg = true;
      NP.Game.fadeTo(0, 0);
      yield* this.say('{player} is out of usable Kigu!\\p{player} blacked out...');
      st.money = Math.floor(st.money / 2);
      yield* this.toTeaHouse(true);
    }

    /** Take the player (and her tired Kigu) to the nearest Tea House and rest them: after a blackout, and after a story fight she
     *  lost once its scene has played out (owner's note: losing to the rival used to leave you standing there with a fainted team). */
    *toTeaHouse(blackedOut) {
      const st = NP.state;
      if (!blackedOut) { this.msg.close(); NP.Game.fadeTo(1, 14); yield* this.wait(16); }
      NP.State.healAll();
      // the nearest unlocked Tea House; else the last place she rested (her bedroom at the start); else anywhere that exists,
      // so a bad or missing heal point can never leave the game stuck
      const tea = this.nearestTeaHouse(), hp = st.healPoint;
      const id = tea || (hp && NP.maps[hp.map] ? hp.map : null) || (NP.maps.player_house ? 'player_house' : Object.keys(NP.maps)[0]);
      const spawns = NP.maps[id].spawns || {};
      const sp = spawns[tea ? 'door' : (hp && hp.spawn)] || spawns.door || { x: 1, y: 1, dir: 'down' };
      this.msg.close();
      if (blackedOut) NP.Game.fadeTo(1, 0);
      this.blackBg = false;
      this.loadMap(id, sp.x, sp.y, sp.dir, { noEnter: true });
      NP.snd.play(this.musicId, { restart: true });
      NP.Game.fadeTo(0, 14);
      yield* this.wait(14);
      yield* this.say(tea ? 'You hurried to the nearest Tea House.\\pYour Kigu were tucked in and had a good nap.' : 'You hurried back to the last place you rested.\\pYour Kigu were tucked in and had a good nap.');
    }

    *wildBattle(sp, lv, o) {
      o = o || {};
      const foe = NP.Kigu.create(sp, lv, o.kigu);   // o.kigu: Kigu.create options (the gold Ryukoi's colourway and IVs)
      const music = o.music || 'battle_wild';
      yield* this.transitionToBattle(music);
      // noCatch: true, or { first, again } lines for a Kigu who won't take a spool yet; canLose: no blackout (the scene carries on)
      const res = yield* this.runBattle({ wild: true, foe: [foe], bg: o.bg || this.battleBg(), music, mood: this.weather, noCatch: o.noCatch || false, canLose: !!o.canLose });
      return res;
    }

    *trainerBattle(def) {
      const party = def.team.map((t) => NP.Kigu.create(t.sp, t.lv, { ot: def.name, moves: t.moves, item: t.item, nature: t.nature }));   // L.team's moves/item/nature options
      yield* this.transitionToBattle(def.music || (def.cls === 'Rival' ? 'battle_rival' : 'battle_tailor'));
      let res;
      try {
        res = yield* this.runBattle({ wild: false, foe: party, trainer: { name: NP.fmt(def.name), cls: def.cls, look: def.look || 'tailor_f', ai: def.ai === undefined ? 1 : def.ai, reward: def.reward || 5, master: !!def.master, lose: def.lose }, bg: this.battleBg(), music: def.music, canLose: !!def.canLose, mood: this.weather });
      } catch (e) { throw e; }
      if (res.winner === 0) {
        let money = (def.reward || 5) * Math.max.apply(null, def.team.map((t) => t.lv));
        if (NP.arcade && NP.arcade.moneyBonus) money = NP.arcade.moneyBonus(money);
        NP.state.money += money;
        yield* this.say('{player} got $' + money + ' for winning!');
        return true;
      }
      return false;
    }

    /** Level-up evolutions owed from the last battle. Runs only when nothing else is going on (no script, no message), so a
     *  trainer's parting words and any cutscene after the fight finish first. A Kigu stopped with B waits for her next level. */
    *evolutions() {
      const due = NP.state.party.filter((k) => k.hp > 0 && k.evoStop !== k.level && NP.Kigu.evolutionFor(k, { trigger: 'level' }));
      if (!due.length) return;
      yield* this.wait(10);
      NP.snd.stop(300);
      yield* this.fadeOut(16);
      for (const k of due) {
        const ev = NP.Kigu.evolutionFor(k, { trigger: 'level' });
        if (!ev) continue;
        const s = new NP.EvolutionScene(k, ev.to);
        NP.Game.push(s);
        yield* this.waitFor(() => s.finished);
      }
      NP.Game.fadeTo(1, 0);
      NP.snd.play(this.musicId, { restart: true, fadeMs: 400 });
      yield* this.fadeIn(16);
    }

    // ---- collision / queries
    actorAt(x, y, except) {
      for (const a of this.actors) if (a !== except && a.solid && a.visible && a.x === x && a.y === y) return a;
      const p = this.player;
      if (p !== except && p.x === x && p.y === y) return p;
      return null;
    }

    /** the player is paddling exactly when the tile under her is water, so there is no extra state to save or lose */
    paddling() {
      const p = this.player, m = this.map;
      return !!(m && m.inBounds(p.x, p.y) && m.tdef(p.x, p.y).water);
    }

    canEnter(a, nx, ny, dir) {
      const swim = a === this.player && this.paddling();
      if (this.map.solid(nx, ny, swim)) return false;
      if (swim && this.map.tdef(nx, ny).water && !this.map.tdef(nx, ny).paddle) return false; // the open sea stays a coastline
      const o = this.actorAt(nx, ny, a);
      return !o;
    }

    // ---- player control
    update() {
      NP.state.frames++;
      if (NP.Fishing) NP.Fishing.tick(this);   // the contest clock at Hemline Lake
      this.stepTasks();
      if (this.popup > 0) this.popup--;
      const p = this.player;
      // advance actors
      for (const a of this.actors) { if (a.update() && false) { /* npc step done */ } }
      const finished = p.update();
      if (finished) this.onPlayerStep();
      if (this.busy || this.menus.length) return;
      if (NP.state.evoPending) { NP.state.evoPending = false; this.spawn(this.evolutions(), 'evolve'); return; }
      this.npcAI();
      if (p.moving) return;
      if (Input.pressed.start) { this.runMenu(); return; }
      if (Input.pressed.a) { this.interact(); return; }
      if (Input.pressed.select && this.useRegistered()) return;   // Select: the key item registered in the Bag (a rod; bikes later)
      const v3 = NP.view3d;
      if (v3 && v3.on) v3.q = v3.quarterFor(this.map, p.x, p.y);
      // a held key keeps its map direction while the camera swings (a camera zone turning mid-walk must not bend your path)
      const sd = Input.dir();
      if (sd !== this.heldScreen) { this.heldScreen = sd; this.heldMap = v3 ? v3.screenToMap(sd) : sd; }
      const d = this.heldMap;
      if (!d) { this.turnT = 0; this.shoveT = 0; return; }
      if (d !== p.dir && this.turnT === 0) { p.dir = d; this.turnT = 6; return; }
      if (this.turnT > 0) { this.turnT--; if (this.turnT > 0) return; }
      this.tryMove(d);
    }

    /** Select uses the key item registered to it in the Bag (NP.state.registered) */
    useRegistered() {
      const id = NP.state.registered, d = id && NP.data.items[id];
      if (!d || !NP.State.count(id)) {
        if (Object.keys(NP.state.bag).some((k) => NP.data.items[k] && NP.data.items[k].register)) {
          this.runScript(function* (c) { yield* c.sayT('field.select.none', 'You can register a key item to Select. Choose it in the Bag and pick "Register".'); });
          return true;
        }
        return false;
      }
      if (d.use && d.use.rod) { const rod = d.use.rod; this.runScript(function* (c) { yield* NP.Fishing.cast(c, rod); }); return true; }
      return false;
    }

    runMenu() { NP.snd.sfx('menu_open'); this.spawn(this.startMenu(), 'menu'); }

    tryMove(d) {
      const p = this.player;
      const [dx, dy] = DIRV[d];
      const nx = p.x + dx, ny = p.y + dy;
      const run = NP.Game.opts.run === 'hold' ? Input.held.b : true;
      const led = this.map.ledge(nx, ny);
      if (led) {
        if (led === d && !this.map.solid(nx + dx, ny + dy) && !this.actorAt(nx + dx, ny + dy)) { NP.snd.sfx('ledge'); p.hopStep(d, 2); this.followStep(nx, ny, 1); return; }
        this.bump();
        return;
      }
      // an ore cart on the rails: lean on it and it rolls off along the track (no Disc needed: it's on wheels)
      const cart = this.map.cartAt(nx, ny);
      if (cart) {
        const m = this.map, fx = nx + dx, fy = ny + dy;
        const free = m.isRail(fx, fy) && m.railDirs(nx, ny).includes(d) && !m.solid(fx, fy) && !this.actorAt(fx, fy);
        if (free && (this.shoveT = (this.shoveT || 0) + 1) > 8) {
          this.shoveT = 0;
          this.runScript(function* (c) { yield* c.rollCart(cart, d); });
          return;
        }
        if (!free) this.bump();
        return;
      }
      // field move Shove: walking into a loose rock pushes it one tile, if the far side is clear (needs Disc: Shove)
      const rock = this.map.shoveAt(nx, ny);
      if (rock && NP.state.bag.disc_shove) {
        const fx = nx + dx, fy = ny + dy, m = this.map;
        const clear = m.inBounds(fx, fy) && !m.solid(fx, fy) && !m.ledge(fx, fy) && !m.warpAt(fx, fy) && !this.actorAt(fx, fy) && !m.tdef(fx, fy).gust;
        if (clear && (this.shoveT = (this.shoveT || 0) + 1) > 8) {   // lean on it for a moment first, as in the old games
          this.shoveT = 0;
          NP.snd.sfx('ledge');
          m.moveStamp(rock, fx, fy);
          NP.state.flags['shove:' + m.id + ':' + rock.homeX + ',' + rock.homeY] = fx + ',' + fy;
          if (m.def.onShove) this.runScript(function* (c) { yield* m.def.onShove(c, rock); });
          return;
        }
        if (!clear) this.bump();
        return;
      }
      if (rock) {   // no Disc yet: a friendly hint, once per visit
        this.bump();
        if (!this.shoveHint) { this.shoveHint = true; this.runScript(function* (c) { yield* c.sayT('field.shove.no', 'It\'s a big loose rock. It wobbles a little when you lean on it.\\pA strong Kigu could probably Shove it out of the way.'); }); }
        return;
      }
      if (!this.canEnter(p, nx, ny, d)) {
        // walking into a doorway tile with a warp is fine; everything else bumps
        this.bump();
        return;
      }
      const px = p.x, py = p.y;
      p.step(d, run && !this.paddling() ? 2 : 1, false);
      this.followStep(px, py, p.spd);
    }

    /** the follower steps onto the tile the player just left (or pops there if it fell behind) */
    followStep(tx, ty, spd) {
      const f = this.follower;
      if (!f || !f.visible || this.actors.indexOf(f) < 0) { this.follower = null; return; }
      const dx = tx - f.x, dy = ty - f.y;
      if (Math.abs(dx) + Math.abs(dy) === 1) f.step(dx > 0 ? 'right' : dx < 0 ? 'left' : dy > 0 ? 'down' : 'up', spd, true);
      else if (dx || dy) { f.x = tx; f.y = ty; f.ox = f.oy = 0; }
    }

    bump() {
      if (this.bumpT <= 0) { NP.snd.sfx('bump'); this.bumpT = 14; }
    }

    onPlayerStep() {
      const p = this.player, m = this.map, st = NP.state;
      if (p.scripted) { p.scripted = false; return; }
      st.pos = { map: m.id, x: p.x, y: p.y, dir: p.dir };
      st.steps++; this.stepsSinceMap++;
      if (st.repel > 0) st.repel--;
      const kind = m.encounterKind(p.x, p.y);
      if (kind === 'grass') NP.snd.sfx('step_grass');
      // warps first
      const w = m.warpAt(p.x, p.y);
      if (w) { this.spawn(this.doWarpTask(w), 'warp'); return; }
      // triggers
      for (const t of m.def.triggers || []) {
        if (p.x >= t.x && p.x < t.x + (t.w || 1) && p.y >= t.y && p.y < t.y + (t.h || 1) && (!t.when || t.when(this.ctx))) {
          this.runScript(t.script);
          return;
        }
      }
      // wind: a gust tile blows you one tile on in its direction (chains across a run of gusts, like ice); the trainer check
      // and wild grass wait until you land
      const gust = m.tdef(p.x, p.y).gust;
      if (gust) {
        const [gx, gy] = DIRV[gust];
        if (this.canEnter(p, p.x + gx, p.y + gy, gust) && !m.ledge(p.x + gx, p.y + gy)) {
          if (!this.gustSfx) { NP.snd.sfx('leaf'); this.gustSfx = 20; }
          const face = p.dir;
          p.step(gust, 1.5, false); p.dir = face;
          return;
        }
      }
      // trainers who can see the player
      for (const a of this.actors) {
        const tr = a.def && a.def.trainer;
        if (!tr || !a.visible || a.hidden || NP.state.flags['tr_' + m.id + '_' + a.id]) continue;
        if (this.sees(a, tr.sight || 3)) { this.spawn(this.trainerEncounter(a, true), 'trainer'); return; }
      }
      // wild encounters
      let enc = m.def.encounters && m.def.encounters[kind];
      if (enc && m.def.encFilter) enc = m.def.encFilter(enc);   // e.g. Tumbleyarn only while the dust blows
      if (enc && NP.Clock) enc = NP.Clock.filter(enc);   // entries with time: 'night' etc.
      if (enc && !enc.length) enc = null;
      if (enc && st.repel <= 0 && this.stepsSinceMap > 2 && st.steps - this.lastBattleStep > 3 && NP.rng.chance(0.11)) {
        const pick = NP.rng.weighted(enc);
        const lv = NP.rng.range(pick.min, pick.max);
        if (NP.State.hasUsable()) {
          this.lastBattleStep = st.steps;
          this.spawn((function* (self) { yield* self.wildBattle(pick.sp, lv); })(this), 'wild');
        }
      }
    }

    *doWarpTaskGen(w) {
      try { yield* this.doWarp(w); } catch (e) { if (e !== ABORT) throw e; }
    }
    doWarpTask(w) { return this.doWarpTaskGen(w); }

    sees(a, range) {
      const p = this.player;
      const [dx, dy] = DIRV[a.dir];
      for (let i = 1; i <= range; i++) {
        const x = a.x + dx * i, y = a.y + dy * i;
        if (x === p.x && y === p.y) return true;
        if (this.map.solid(x, y) || this.actorAt(x, y, a)) return false;
      }
      return false;
    }

    *trainerEncounter(a, spotted) {
      const tr = a.def.trainer;
      const key = 'tr_' + this.map.id + '_' + a.id;
      try {
        if (spotted) {
          NP.snd.jingle('j_encounter_tailor');
          yield* this.ctx.emote(a, 'exclaim');
          // walk up to the player
          const p = this.player;
          let guard = 0;
          while (guard++ < 12) {
            const dist = Math.abs(a.x - p.x) + Math.abs(a.y - p.y);
            if (dist <= 1) break;
            a.step(a.dir, 1, true);
            while (a.moving) yield;
          }
          p.dir = OPP[a.dir];
        } else {
          a.dir = OPP[this.player.dir];
        }
        const tk = this.map.id + '.' + a.id;
        yield* this.ctx.sayT(tk + '.intro', tr.intro);
        const loseT = textOverride(tk + '.lose');
        const won = yield* this.trainerBattle({ cls: tr.cls, name: tr.name, look: a.look, ai: tr.ai, reward: tr.reward, team: tr.team, lose: loseT ? loseT.join(' ') : tr.lose });
        if (won) {
          NP.state.flags[key] = true;
          yield* this.ctx.sayT(tk + '.win', tr.win);
          if (tr.then) yield* this.resolveScript(tr.then)(this.ctx, a);   // a trainer with more to say once beaten (Gus gives you a rod)
        }
      } catch (e) { if (e !== ABORT) throw e; }
    }

    interact() {
      const p = this.player, m = this.map;
      const [dx, dy] = DIRV[p.dir];
      const x = p.x + dx, y = p.y + dy;
      let a = this.actors.find((q) => q.visible && q.x === x && q.y === y);
      // field move: facing calm water with Disc: Paddle in the bag, A offers to step onto it
      if (!a && m.inBounds(x, y) && m.tdef(x, y).paddle && !this.paddling() && NP.state.bag.disc_paddle) {
        const dir = p.dir;
        this.runScript(function* (c) { yield* c.paddle(dir); });
        return;
      }
      if (a) {
        if (a.kind === 'prop') { this.runScript(a.def.script, a); return; }
        if (a.kind === 'npc' && a.def) { this.talkTo(a); return; }
      }
      for (const e of m.def.interact || []) {
        if (e.x === x && e.y === y) {
          NP.snd.sfx('select');
          if (e.script) this.runScript(e.script);
          else this.runScript(function* (c) { yield* c.sayT(m.id + '@' + e.x + ',' + e.y, e.say); });
          return;
        }
      }
      // a counter in front of you: talk to whoever stands on the far side of it
      if (!a && this.counterAt(x, y)) {
        a = this.actors.find((q) => q.visible && q.kind === 'npc' && q.def && q.x === x + dx && q.y === y + dy);
        if (a) { this.talkTo(a); return; }
      }
      // field move: a bush in front of you can be snipped away
      const bush = m.placements.find((q) => q.id === 'bush' && q.x === x && q.y === y);
      if (bush) { NP.snd.sfx('select'); this.runScript(function* (c) { yield* c.snip(bush); }); }
    }

    counterAt(x, y) {
      return this.map.placements.some((q) => COUNTERS.has(q.id) && x >= q.x && x < q.x + q.w && y >= q.y && y < q.y + q.h);
    }

    /** A on an NPC (face to face, or across a counter) */
    talkTo(a) {
      const p = this.player, m = this.map, d = a.def;
      NP.snd.sfx('select');
      a.dir = OPP[p.dir];
      const tr = d.trainer;
      if (tr) {
        if (NP.state.flags['tr_' + m.id + '_' + a.id]) this.runScript(tr.then || function* (c) { yield* c.sayT(m.id + '.' + a.id + '.after', tr.after); }, a);
        else this.spawn(this.trainerEncounter(a, false), 'trainer');
        return;
      }
      if (d.script) this.runScript(d.script, a);
      else if (d.say) {
        const lines = textOverride(m.id + '.' + a.id) || (Array.isArray(d.say) ? d.say : [d.say]);
        this.runScript(function* (c) { for (const t of lines) yield* c.say(t); });
      }
    }

    npcAI() {
      for (const a of this.actors) {
        if (a.kind !== 'npc' || !a.visible || a.moving) continue;
        const d = a.def;
        if (!d || (d.move !== 'wander' && d.move !== 'turn')) continue;
        if (a.wait > 0) { a.wait--; continue; }
        a.wait = 40 + NP.rng.int(80);
        const dirs = ['up', 'down', 'left', 'right'];
        const dir = dirs[NP.rng.int(4)];
        if (d.move === 'turn') { a.dir = dir; continue; }
        const [dx, dy] = DIRV[dir];
        const nx = a.x + dx, ny = a.y + dy;
        const r = d.range || 2;
        if (Math.abs(nx - a.homeX) > r || Math.abs(ny - a.homeY) > r) { a.dir = dir; continue; }
        if (this.map.solid(nx, ny) || this.map.ledge(nx, ny) || this.map.warpAt(nx, ny) || this.actorAt(nx, ny, a)) { a.dir = dir; continue; }
        a.step(dir, 1, true);
      }
      if (this.bumpT > 0) this.bumpT--;
      if (this.gustSfx > 0) this.gustSfx--;
    }

    // grass battles outdoors at night get the night background
    battleBg() {
      const def = this.map.def, bg = def.battleBg || 'grass';
      return bg === 'grass' && NP.Clock && NP.Clock.outdoors(def) && NP.Clock.phase() === 'night' ? 'night' : bg;
    }

    // ---- start menu
    *startMenu() {
      this.showClock = true;
      try { yield* this.startMenuLoop(); } finally { this.showClock = false; }
    }
    *startMenuLoop() {
      const st = NP.state;
      let cur = 0;
      for (;;) {
        const items = [];
        if (NP.State.flag('has_starter') || st.party.length) items.push({ label: 'Kigu', k: 'party' });
        items.push({ label: 'Sketchbook', k: 'dex' }, { label: 'Bag', k: 'bag' }, { label: st.name, k: 'card' }, { label: 'Save', k: 'save' }, { label: 'Options', k: 'opts' }, { label: 'Close', k: 'close' });
        const m = new ui.Menu({ items, theme: 'light', x: 0, y: 4, visible: 8, cursor: cur });
        m.x = NP.W - m.w - 4;
        const r = yield* this.menu(m);
        if (r.type === 'cancel' || r.item.k === 'close') break;
        cur = r.index;
        const k = r.item.k;
        if (k === 'party') {
          const s = new NP.PartyScene({ mode: 'menu' }); NP.Game.push(s); yield* this.waitFor(() => s.finished);
        } else if (k === 'bag') {
          const s = new NP.BagScene({ mode: 'field' }); NP.Game.push(s); yield* this.waitFor(() => s.finished);
          if (s.result && s.result.escape) { yield* this.useEscape(); break; }
          if (s.result && s.result.rod) { const rod = s.result.rod; this.runScript(function* (c) { yield* NP.Fishing.cast(c, rod); }); break; }
        } else if (k === 'dex') {
          const s = new NP.DexScene(); NP.Game.push(s); yield* this.waitFor(() => s.finished);
        } else if (k === 'card') {
          const s = new NP.CardScene(); NP.Game.push(s); yield* this.waitFor(() => s.finished);
        } else if (k === 'opts') {
          const s = new NP.OptionsScene(); NP.Game.push(s); yield* this.waitFor(() => s.finished);
        } else if (k === 'save') {
          if (yield* this.ask('Save your progress?')) {
            const ok = NP.State.save();
            NP.snd.sfx(ok ? 'save' : 'error');
            yield* this.say(ok ? '{player} saved the game.' : 'Saving failed. (Storage is unavailable.)');
          }
        }
        if (this.player.moving) break;
      }
    }

    *useEscape() {
      const tm = this.map;
      if (!tm.def.indoor) { yield* this.say('It cannot be used here.'); return; }
      NP.State.removeItem('thread_ball', 1);
      const hp = NP.state.healPoint;
      yield* this.say('{player} pulled the Thread Ball!');
      const t = this.tileMap(hp.map);
      const d = t.doors && Object.keys(t.doors)[0];
      yield* this.teleport(hp.map, (t.def.spawns.door || { x: 1 }).x, (t.def.spawns.door || { y: 1 }).y, 'down');
    }

    // ---- drawing
    camera() {
      const p = this.player, m = this.map;
      let cx = Math.round(p.px + 8 - NP.W / 2), cy = Math.round(p.py + 8 - NP.H / 2);
      if (NP.view3d && NP.view3d.on) return [cx, cy]; // the 3D view pivots on the player and draws a border margin round the map
      const mw = m.w * 16, mh = m.h * 16;
      cx = mw <= NP.W ? -Math.floor((NP.W - mw) / 2) : Math.max(0, Math.min(mw - NP.W, cx));
      cy = mh <= NP.H ? -Math.floor((NP.H - mh) / 2) : Math.max(0, Math.min(mh - NP.H, cy));
      return [cx, cy];
    }

    draw(fb, frame) {
      if (this.blackBg) { fb.clear('#000000'); this.drawUI(fb, frame); return; }
      const [cx, cy] = this.camera();
      if (NP.view3d && NP.view3d.on) NP.view3d.aim(this.map, this.player.x, this.player.y);
      fb.clear('#000000');
      const list = [];
      const fr = NP.Game.frame;
      for (const a of this.actors) {
        if (!a.visible) continue;
        list.push({ sortY: a.py + 16, x: a.px + 8, draw: (f, X, Y) => a.draw(f, X, Y, fr) });
      }
      const p = this.player;
      p.swim = this.paddling();
      if (!this.map.def.hidePlayer) list.push({ sortY: p.py + 16.5, x: p.px + 8, hero: true, draw: (f, X, Y) => p.draw(f, X, Y, fr) });
      this.map.draw(fb, cx, cy, fr, list);
      if (NP.Fishing && (this.bobber || this.contest)) NP.Fishing.draw(this, fb, cx, cy);
      if (NP.Clock && !this.map.def.memory) NP.Clock.draw(fb, this.map.def, cx, cy);   // day-night tint + lamp glow (src/game/clock.js)
      if (this.weather) NP.Weather.draw(fb, this.weather, fr);
      // emotes
      for (const a of this.actors.concat([p])) {
        if (a.emoteT > 0 && a.visible) {
          const q = NP.view3d && NP.view3d.on ? NP.view3d.project(a.px + 8, a.py + 16) : null;
          if (NP.view3d && NP.view3d.on) { if (q) fb.blit(A().emote(a.emote), Math.round(q.x) - 8, Math.round(q.y - 36 * q.scale) - 8); }
          else fb.blit(A().emote(a.emote), Math.round(a.px - cx), Math.round(a.py - cy) - 28);
        }
      }
      if (this.popup > 0 && this.map.def.name) {
        const slide = Math.min(1, this.popup / 10, (110 - this.popup) / 10 + 0.0);
        const name = NP.fmt(this.map.def.name);
        const w = NP.Font.width(name) + 16;
        const y = Math.round(-20 + 24 * Math.min(1, this.popup / 10, (110 - this.popup) / 8));
        ui.frame(fb, 4, y, w, 18, 'light');
        ui.text(fb, name, 12, y + 5, 'light');
      }
      this.drawUI(fb, frame);
      if (this.showClock && NP.Clock) {   // the time, top left, while the start menu is open
        const t = NP.Clock.LABEL[NP.Clock.phase()] + '  ' + NP.Clock.text(), w = NP.Font.width(t) + 16;
        ui.frame(fb, 4, 4, w, 18, 'light');
        ui.text(fb, t, 12, 9, 'light');
      }
      if (this.map.def.memory) memoryTone(fb, this.msg.active ? NP.BOX_Y : fb.h);   // emotes and the text box go sepia too
    }
  }

  NP.Overworld = Overworld;
  NP.ABORT = ABORT;
  NP.Actor = Actor;
})(typeof globalThis !== 'undefined' ? globalThis : window);
