/* NP.Fishing — rods, the cast-and-bite, the Fish Pocket, the Fishing Log and the Hemline Lake fishing contest.
 *
 *  Use a rod from the Bag (or press Select) while facing water. The line goes out, you wait, a "!" pops up, and you press A
 *  quickly to hook what bit (press too early and you scare it off). A hooked Kigu starts a wild battle; a hooked fish is
 *  measured, logged in the Fishing Log and put in the Fish Pocket (cook it at a Tea House, sell it at a shop, or trade it
 *  at the contest grounds).
 *
 *  Maps say what bites with def.fishing (set through the map builder's M.fishing):
 *    { water: 'fresh'|'salt', kigu: { 1: [[sp, min, max, w], ...], 2: [...], 3: [...] }, extra: [{ item, chance, rod }],
 *      zones: [{ x, y, w, h, water, kigu?, extra? }],   // part of the map is different water (a river mouth, the cave pool)
 *      legend: { rod, sp, lv, chance, flag, needs, kigu },   // a legendary bite until `flag` is set (the gold Ryukoi, Super Rod)
 *      river: true (ayu bite here), only: [fish ids] (nothing else bites: the oasis pupfish) }
 *  Rods only hook fish-based Tide Kigu, and only in water their fish lives in (the map tables do that). The kigu table used
 *  is the one for the best rod tier you have that the map lists.
 *  Real fish come from NP.data.fish: same water, rod tier high enough, and `only` (if set) naming this map.
 *
 *  Save data: NP.state.fish = { pocket: [{ id, cm, contest? }], log: { id: { n, best, where } } }. */
(function (root) {
  'use strict';
  const NP = (root.NP = root.NP || {});
  const { Input, ui } = NP;
  const DIRV = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };

  const F = (NP.Fishing = {});
  F.POCKET_MAX = 40;
  F.KIGU_CHANCE = [0, 0.3, 0.45, 0.6];   // by rod tier: how often a bite is a Kigu rather than a fish (where the map has Kigu)
  F.NIBBLE = 0.25;                       // how often nothing bites at all
  F.HOOK_FRAMES = 48;                    // the window to press A after the "!"
  F.CONTEST_FRAMES = 90 * 60;
  F.RODS = ['', 'old_rod', 'good_rod', 'super_rod'];

  F.st = function () {
    const s = NP.state;
    if (!s.fish) s.fish = { pocket: [], log: {} };
    return s.fish;
  };
  F.rodTier = function () { for (let r = 3; r > 0; r--) if (NP.State.count(F.RODS[r])) return r; return 0; };

  // ------------------------------------------------------------------------------------------ where, and what bites
  /** the water tile the player is facing (or null) */
  F.target = function (ow) {
    const p = ow.player, m = ow.map, [dx, dy] = DIRV[p.dir];
    const x = p.x + dx, y = p.y + dy;
    if (!m.inBounds(x, y)) return null;
    const t = m.tdef(x, y);
    return t.water || t.fishable ? { x, y } : null;
  };
  /** the fishing table for a tile: the map's, with a zone's fields laid over it */
  F.spot = function (map, x, y) {
    const f = map.def.fishing;
    if (!f) return null;
    const z = (f.zones || []).find((q) => x >= q.x && y >= q.y && x < q.x + (q.w || 1) && y < q.y + (q.h || 1));
    const s = Object.assign({}, f, z || {});
    if (!s.water) s.water = map.tdef(x, y).id === 'sea' ? 'salt' : 'fresh';
    return s;
  };
  F.kiguTable = function (s, rod) {
    const k = s.kigu || {};
    for (let r = rod; r > 0; r--) if (k[r] && k[r].length) return k[r];
    return null;
  };
  F.fishFor = function (s, mapId, rod, rare) {
    return NP.data.fishIds.map((id) => Object.assign({ id }, NP.data.fish[id])).filter((f) =>
      f.water === s.water && f.rod <= rod && !!f.rare === !!rare && (!f.river || s.river) && (!f.only || f.only.indexOf(mapId) >= 0) && (!s.only || s.only.indexOf(f.id) >= 0));
  };
  /** size: small ones are common, big ones rare. The top 5% of the range is a lunker. */
  F.measure = function (id, rng) {
    const f = NP.data.fish[id], r = Math.pow(rng.next(), 1.7);
    return { id, cm: Math.round(f.min + (f.max - f.min) * r) };
  };
  F.ratio = (e) => { const f = NP.data.fish[e.id]; return f.max > f.min ? (e.cm - f.min) / (f.max - f.min) : 0; };
  F.isLunker = (e) => !NP.data.fish[e.id].rare && F.ratio(e) >= 0.95;
  F.price = (e) => { const f = NP.data.fish[e.id]; return Math.round(f.value * (0.6 + 0.8 * F.ratio(e)) * (F.isLunker(e) ? 2 : 1)); };
  F.label = (e) => NP.data.fish[e.id].name + ' ' + e.cm + 'cm';

  /** What bites this cast: { kind:'kigu', sp, lv } | { kind:'fish', fish:{id,cm} } | { kind:'item', item } | null */
  F.roll = function (map, s, rod, o) {
    const rng = NP.rng, contest = o && o.contest;
    const lg = s.legend;
    if (lg && !contest && rod >= lg.rod && !NP.state.flags[lg.flag] && (!lg.needs || NP.state.flags[lg.needs]) && rng.chance(lg.chance)) return { kind: 'kigu', sp: lg.sp, lv: lg.lv, legend: lg };
    for (const ex of s.extra || []) if (rod >= (ex.rod || 1) && rng.chance(ex.chance)) return { kind: 'item', item: ex.item };
    const kt = !contest && F.kiguTable(s, rod);
    if (kt && rng.chance(F.KIGU_CHANCE[rod])) {
      const e = rng.weighted(kt.map((q) => ({ sp: q[0], min: q[1], max: q[2], w: q[3] })));
      return { kind: 'kigu', sp: NP.levels && NP.levels.sp ? NP.levels.sp(e.sp) : e.sp, lv: rng.range(e.min, e.max) };
    }
    let pool = rng.chance(NP.data.fishRareChance) ? F.fishFor(s, map.id, rod, true) : [];
    if (!pool.length) pool = F.fishFor(s, map.id, rod, false);
    if (!pool.length) return null;
    return { kind: 'fish', fish: F.measure(rng.weighted(pool).id, rng) };
  };

  // ------------------------------------------------------------------------------------------ the pocket and the log
  F.log = function (e, mapId) {
    const L = F.st().log, r = L[e.id] || (L[e.id] = { n: 0, best: 0, where: mapId });
    r.n++;
    if (e.cm > r.best) r.best = e.cm;
  };
  F.add = function (e) {
    const P = F.st().pocket;
    if (P.length >= F.POCKET_MAX) return false;
    P.push(e);
    return true;
  };
  F.take = function (e) { const P = F.st().pocket, i = P.indexOf(e); if (i >= 0) P.splice(i, 1); };

  // ------------------------------------------------------------------------------------------ casting
  F.canFish = function (ow) { return !!F.target(ow); };

  /** a newly given rod takes over the Select slot if it's empty or holds a weaker rod (Gus, the Oasis fisher) */
  F.registerRod = function (id) {
    const st = NP.state, cur = st.registered && NP.data.items[st.registered];
    if (!cur || (cur.use && cur.use.rod && cur.use.rod < NP.data.items[id].use.rod)) st.registered = id;
  };

  F.cast = function* (c, rod) {
    const ow = c.ow, p = ow.player;
    yield* c.wait(4);
    const t = F.target(ow);
    if (!t) { yield* c.sayT('field.fish.nowater', 'There\'s no water here to fish in.'); return; }
    const s = F.spot(ow.map, t.x, t.y);
    if (!s) { yield* c.sayT('field.fish.empty', 'The water here is still and clear. Nothing seems to live in it.'); return; }
    const contest = ow.contest && !ow.contest.over ? ow.contest : null;
    NP.snd.sfx('splash');
    ow.bobber = { x: t.x, y: t.y, bite: false, t: 0 };
    let hooked = false, early = false;
    const nothing = NP.rng.chance(contest ? F.NIBBLE * 0.6 : F.NIBBLE);
    try {
      const wait = NP.rng.range(contest ? 40 : 60, contest ? 150 : 220);
      for (let i = 0; i < wait; i++) { yield; ow.bobber.t++; if (Input.pressed.a) { early = true; break; } }
      if (!early && !nothing) {
        ow.bobber.bite = true;
        p.emote = 'exclaim'; p.emoteT = F.HOOK_FRAMES;
        NP.snd.sfx('select');
        for (let i = 0; i < F.HOOK_FRAMES; i++) { yield; ow.bobber.t++; if (Input.pressed.a) { hooked = true; break; } }
        p.emoteT = 0;
      }
    } finally { ow.bobber = null; }
    if (early) { yield* c.sayT('field.fish.early', 'You reeled in too soon. Whatever was down there swam off.'); return; }
    if (nothing) { yield* c.sayT('field.fish.nothing', 'Not even a nibble...'); return; }
    if (!hooked) { yield* c.sayT('field.fish.missed', 'It got away...'); return; }
    const got = F.roll(ow.map, s, rod, { contest: !!contest });
    if (!got) { yield* c.sayT('field.fish.nothing', 'Not even a nibble...'); return; }
    if (got.kind === 'item') {
      yield* c.say('Something glittered on the end of the line!');
      yield* c.giveItem(got.item, 1, { found: true });
      return;
    }
    if (got.kind === 'kigu') {
      if (got.legend) { yield* F.legendBite(c, got); return; }
      yield* c.say('Whoa! A Kigu took the bait!');
      yield* c.wildBattle(got.sp, got.lv, { bg: 'water' });
      return;
    }
    yield* F.landed(c, got.fish, contest);
  };

  /** a fish on the bank: measure, fanfare, log, pocket */
  F.landed = function* (c, e, contest) {
    const d = NP.data.fish[e.id];
    if (contest) e.contest = true;
    F.log(e, c.map.id);
    if (d.rare) {
      yield* c.jingleWait('j_caught');
      yield* c.say('Whoa! It\'s a ' + d.name + '! It shines all over!\\pIt\'s ' + e.cm + ' cm long. The Fishing Master at Hemline Lake would love to see this.');
    } else if (F.isLunker(e)) {
      yield* c.jingleWait('j_key_item');
      yield* c.say('{player} reeled in a ' + d.name + '!\\pIt\'s a LUNKER! It\'s ' + e.cm + ' cm long!');
    } else {
      NP.snd.sfx('splash');
      yield* c.say('{player} reeled in a ' + d.name + '!\\pIt\'s ' + e.cm + ' cm long.');
    }
    if (contest) contest.catches.push(e.cm);
    if (!F.add(e)) yield* c.say('Your Fish Pocket is full, so you let the ' + d.name + ' go.');
  };

  /** the gold Ryukoi on a Super Rod in her cave pool */
  F.legendBite = function* (c, got) {
    const lg = got.legend;
    yield* c.say('The line pulls so hard it nearly drags you in!\\pA gold shape rises out of the deep...');
    const res = yield* c.wildBattle(got.sp, got.lv, { bg: 'water', music: lg.music, kigu: lg.kigu });
    if (res && res.caught) NP.state.flags[lg.flag] = true;
    else yield* c.say(lg.after || 'The gold shape sank back into the deep.');
  };

  // ------------------------------------------------------------------------------------------ the bobber and the contest clock
  F.draw = function (ow, fb, cx, cy) {
    const b = ow.bobber;
    if (b) {
      let X = b.x * 16 + 8 - cx, Y = b.y * 16 + 8 - cy;
      const V = NP.view3d;
      if (V && V.on) { const q = V.project(b.x * 16 + 8, b.y * 16 + 8); if (!q) return; X = q.x; Y = q.y; }
      const bob = b.bite ? ((b.t >> 2) & 1) * 2 : ((b.t >> 4) & 1);
      X = Math.round(X); Y = Math.round(Y) + bob;
      fb.fillRect(X - 2, Y - 3, 5, 6, '#202028');
      fb.fillRect(X - 1, Y - 2, 3, 2, '#e83838');
      fb.fillRect(X - 1, Y, 3, 2, '#f8f8f8');
      if (b.bite) { fb.fillRect(X - 5, Y + 3, 2, 1, '#e8f4ff'); fb.fillRect(X + 4, Y + 3, 2, 1, '#e8f4ff'); }
    }
    const k = ow.contest;
    if (k && !k.over) {
      const s = Math.ceil(k.t / 60), txt = Math.floor(s / 60) + ':' + NP.util.pad(s % 60, 2);
      const best = F.contestScore(k.catches);
      const line = 'Best 3: ' + best + ' cm';
      const w = Math.max(NP.Font.width(line), 40) + 14;
      ui.frame(fb, NP.W - w - 4, 4, w, 30, 'light');
      ui.text(fb, txt, NP.W - w + 3, 9, 'light', { color: k.t < 600 ? '#d83838' : undefined });
      ui.text(fb, line, NP.W - w + 3, 20, 'light', { color: '#505870', shadow: null });
    }
  };
  F.contestScore = (list) => list.slice().sort((a, b) => b - a).slice(0, 3).reduce((a, b) => a + b, 0);

  /** called every overworld frame: run the clock, and end the contest once nothing else is going on */
  F.tick = function (ow) {
    const k = ow.contest;
    if (!k || k.over) return;
    if (k.t > 0) k.t--;
    if (k.t <= 0 && !ow.busy && !ow.player.moving) { k.over = true; ow.runScript(k.end); }
  };

  /** the Fishing Master stamp on the Tailor Card: a round blue ink stamp with a leaping fish, 28x28 */
  F.drawStamp = function (fb, x, y) {
    const ink = '#2a5ab8', cx = x + 14, cy = y + 14;
    for (let j = 0; j < 28; j++) for (let i = 0; i < 28; i++) {
      const d = Math.hypot(i - 13.5, j - 13.5);
      if ((d <= 13.5 && d >= 11.5) || (d <= 10 && d >= 9.2)) fb.fillRect(x + i, y + j, 1, 1, ink);
    }
    fb.fillRect(cx - 5, cy - 2, 8, 4, ink); fb.fillRect(cx - 4, cy - 3, 6, 6, ink);   // the fish's body
    fb.fillRect(cx + 3, cy - 3, 2, 2, ink); fb.fillRect(cx + 3, cy + 1, 2, 2, ink);   // tail
    fb.fillRect(cx - 3, cy - 1, 1, 1, '#f4ecd8');                                      // eye
    fb.fillRect(cx - 6, cy + 5, 2, 1, ink); fb.fillRect(cx + 1, cy + 5, 3, 1, ink); fb.fillRect(cx - 2, cy - 6, 3, 1, ink);   // splashes
  };

  // ------------------------------------------------------------------------------------------ the Fishing Log
  class FishLogScene extends NP.Scene {
    constructor() { super('light'); this.cur = 0; }
    enter() {
      this.spawn((function* (s) {
        yield;
        for (;;) {
          const n = NP.data.fishIds.length, d = Input.menuDir();
          if (d === 'up') { s.cur = (s.cur + n - 1) % n; NP.snd.sfx('cursor'); }
          if (d === 'down') { s.cur = (s.cur + 1) % n; NP.snd.sfx('cursor'); }
          if (d === 'left') { s.cur = Math.max(0, s.cur - 9); NP.snd.sfx('cursor'); }
          if (d === 'right') { s.cur = Math.min(n - 1, s.cur + 9); NP.snd.sfx('cursor'); }
          if (Input.pressed.b || Input.pressed.a) { NP.snd.sfx('cancel'); NP.Game.pop(); return; }
          yield;
        }
      })(this), 'log');
    }
    draw(fb, frame) {
      fb.fillRect(0, 0, NP.W, NP.H, '#d8ecf4');
      const ids = NP.data.fishIds, L = F.st().log, A = NP.assets;
      const got = ids.filter((id) => L[id]).length;
      ui.frame(fb, 4, 4, NP.W - 8, 18, 'light');
      ui.text(fb, 'FISHING LOG', 12, 9, 'light', { color: '#2a6ab0' });
      ui.text(fb, got + '/' + ids.length, NP.W - 14, 9, 'light', { align: 'right', color: '#505870', shadow: null });
      ui.frame(fb, 4, 26, 132, NP.H - 30, 'light');
      const top = Math.max(0, Math.min(this.cur - 4, ids.length - 9));
      for (let i = 0; i < 9 && top + i < ids.length; i++) {
        const id = ids[top + i], y = 32 + i * 14, r = L[id];
        if (top + i === this.cur) ui.cursor(fb, 9, y, 'light');
        ui.text(fb, r ? NP.data.fish[id].name : '-----', 18, y, 'light', { color: r ? undefined : '#9098b0' });
      }
      ui.frame(fb, 140, 26, NP.W - 144, NP.H - 30, 'light');
      const id = ids[this.cur], r = L[id], f = NP.data.fish[id];
      if (r) {
        fb.blit(A.fishIcon ? A.fishIcon(id) : A.itemIcon(id), 140 + ((NP.W - 144 - 24) >> 1), 34);
        const where = NP.maps[r.where] ? NP.fmt(NP.maps[r.where].name || r.where) : '?';
        const rows = [f.name, 'Landed ' + r.n, 'Biggest ' + r.best + ' cm', (f.water === 'salt' ? 'Sea' : 'Fresh') + ' water', 'First: ' + where];
        rows.forEach((t, i) => ui.text(fb, t, 148, 64 + i * 13, 'light', { color: i ? '#505870' : undefined, shadow: i ? null : undefined }));
      } else ui.text(fb, 'Not landed yet.', 148, 64, 'light', { color: '#9098b0', shadow: null });
      this.drawUI(fb, frame);
    }
  }
  NP.FishLogScene = FishLogScene;

  // ------------------------------------------------------------------------------------------ shared NPC scripts
  NP.scripts = NP.scripts || {};

  /** pick a fish from the pocket (filter), or null */
  F.pickFish = function* (c, filter, prompt) {
    const list = F.st().pocket.filter(filter || (() => true));
    if (!list.length) return null;
    if (prompt) yield* c.say(prompt);
    const items = list.slice(0, 30).map((e) => ({ label: F.label(e) })).concat([{ label: 'Cancel' }]);
    const i = yield* c.choose(items.map((q) => q.label));
    return i >= 0 && i < list.length ? list[i] : null;
  };

  /** Tea House cook: turns a fish into a dish */
  NP.scripts.tea_cook = function* (c, npc) {
    const k = (s) => 'script.tea_cook.' + s;
    const P = F.st().pocket.filter((e) => NP.data.fish[e.id].dish);
    if (!NP.state.flags.fish_pocket || !P.length) {
      yield* c.sayT(k('none'), 'I\'m the cook here. Bring me a fresh fish and I\'ll make your Kigu something tasty!');
      return;
    }
    yield* c.sayT(k('hi'), 'Oh, you\'ve been fishing! Want me to cook one up for you? It\'s free for Tailors.');
    for (;;) {
      const e = yield* F.pickFish(c, (q) => NP.data.fish[q.id].dish, null);
      if (!e) break;
      const dish = NP.data.fish[e.id].dish, n = F.isLunker(e) ? 2 : 1;
      F.take(e);
      yield* c.say('Sizzle, sizzle...');
      yield* c.giveItem(dish, n);
      if (!F.st().pocket.some((q) => NP.data.fish[q.id].dish) || !(yield* c.ask('Want me to cook another one?'))) break;
    }
    yield* c.sayT(k('bye'), 'Feed it to your Kigu from the Bag. Enjoy!');
  };

  /** sell fish: bigger fish are worth more (used by shops and the fish buyer at the lake) */
  F.sellLoop = function* (c) {
    for (;;) {
      const e = yield* F.pickFish(c, null, null);
      if (!e) return;
      const $ = F.price(e);
      if (yield* c.ask('I\'ll give you $' + $ + ' for the ' + F.label(e) + '. Deal?')) {
        F.take(e); NP.state.money += $; NP.snd.sfx('save');
        yield* c.say('Sold the ' + NP.data.fish[e.id].name + ' for $' + $ + '.');
      }
      if (!F.st().pocket.length) return;
    }
  };
  NP.scripts.fish_buyer = function* (c) {
    if (!F.st().pocket.length) { yield* c.sayT('script.fish_buyer.none', 'I buy fresh fish. The bigger the fish, the more I pay!'); return; }
    yield* c.sayT('script.fish_buyer.hi', 'I buy fresh fish. The bigger the fish, the more I pay! Which one?');
    yield* F.sellLoop(c);
    yield* c.sayT('script.fish_buyer.bye', 'Pleasure doing business!');
  };
})(typeof globalThis !== 'undefined' ? globalThis : window);
