/* src/maps/lib.js — NP.levels: the level designer's toolkit (owner: Level design).
 *
 *  L.map(o)      chainable builder: terrain grid + stamps / npcs / props / warps / triggers, registered through NP.mapkit.
 *  L.room(o)     indoor room with a door mat + exit warp;  L.tea(o) / L.store(o) the standard Tea House / General Store.
 *  trainers, pickups (visible + hidden), signs, gates and Snip trees (terrain that changes with story flags, persisted by flag).
 *  'want|fallback' picks: 'sparkin|nibbi' = Sparkin if that species exists yet, else Nibbi (logged in L.subs; tests report it),
 *  so maps keep working while the data/art teams are still adding species, items and looks.
 *
 * Text conventions (docs/text.md): one page = <= 2 lines (~75 chars); '\\p' = new page; '\\n' = line break; say Kigu / Tailor /
 * Salon / Button / Master Tailor / befriend (never monster, trainer, gym, badge, catch).
 */
(function (root) {
  'use strict';
  const NP = root.NP, K = NP.mapkit;
  const L = (NP.levels = NP.levels || {});
  NP.scripts = NP.scripts || {};
  L.subs = [];

  // ------------------------------------------------------------------------------------------ forward-compatible picks
  function pick(kind, table, spec, dflt) {
    const parts = String(spec).split('|');
    const want = parts[0];
    if (table && Object.prototype.hasOwnProperty.call(table, want)) return want;
    const fb = parts[1] || dflt;
    if (!L.subs.some((s) => s.kind === kind && s.want === want && s.used === fb)) L.subs.push({ kind, want, used: fb });
    return fb;
  }
  L.sp = (s, d) => pick('species', NP.data.species, s, d || 'nibbi');
  L.item = (s, d) => pick('item', NP.data.items, s, d || 'snack_cake');
  L.look = (s, d) => pick('look', NP.art && NP.art.human && NP.art.human.looks, s, d || 'villager_m1');
  L.hasItem = (id) => !!(NP.data.items && NP.data.items[id]);
  L.hasMove = (id) => !!(NP.data.moves && NP.data.moves[id]);

  /** team([['cocoona', 14, { moves:[..], item:'plum_treat', nature:'adamant' }], ['sparkin|nibbi', 12]]) */
  L.team = function (list) {
    return list.map((e) => {
      const o = e[2] || {};
      const t = { sp: L.sp(e[0]), lv: e[1] };
      if (o.moves) { const m = o.moves.filter(L.hasMove); if (m.length) t.moves = m; }
      if (o.item) { const id = String(o.item).split('|')[0]; if (L.hasItem(id)) t.item = id; }
      if (o.nature) t.nature = o.nature;
      if (o.note) t.note = o.note;
      return t;
    });
  };

  L.badges = () => (NP.state && NP.state.badges ? NP.state.badges.filter(Boolean).length : 0);
  L.hasBadge = (n) => !!(NP.state && NP.state.badges && NP.state.badges[n - 1]);
  L.done = (c, mapId, npcId) => c.flag('tr_' + mapId + '_' + npcId);

  // ------------------------------------------------------------------------------------------ actors and pickups
  L.trainerDef = function (id, x, y, look, dir, o) {
    const tr = { cls: o.cls, name: o.name, sight: o.sight || 3, reward: o.reward || 10, ai: o.ai === undefined ? 1 : o.ai, team: L.team(o.team) };
    for (const k of ['intro', 'win', 'lose', 'after', 'music', 'jingle', 'master', 'bg']) if (o[k] !== undefined) tr[k] = o[k];
    return { id, x, y, look: L.look(look, 'tailor_f'), dir: dir || 'down', trainer: tr, note: o.note };
  };

  /** Script factory: pages spoken in order, each through c.sayT('<mapId>.<npcId>.<n>') so the writer can override them. */
  L.talk = (lines) => function* (c, n) {
    for (let i = 0; i < lines.length; i++) yield* c.sayT(c.map.id + '.' + n.id + '.' + (i + 1), lines[i]);
  };

  /** NPC that gives `item` once, then repeats `again`. o: { give:[pages], got:[pages], again:[pages] } */
  L.giver = function (key, item, n, o) {
    const it = L.item(item, 'snack_cake');
    return function* (c, npc) {
      const flag = 'gift_' + c.map.id + '_' + key;
      const k = (s) => c.map.id + '.' + npc.id + '.' + s;
      if (c.flag(flag)) { yield* c.sayT(k('again'), o.again); return; }
      yield* c.sayT(k('give'), o.give);
      c.set(flag);
      yield* c.giveItem(it, n || 1);
      if (o.got) yield* c.sayT(k('got'), o.got);
    };
  };

  // ------------------------------------------------------------------------------------------ terrain that follows story flags
  /** Open/close a gate (or cut a Snip tree) in the LIVE TileMap and remember it in a flag. */
  L.setGate = function (c, key, open) {
    const tm = c.map, q = tm.def.gates[key];
    c.set(q.flag, !!open);
    for (const [x, y] of q.cells) {
      tm.grid[y * tm.w + x] = tm.def.legend[open ? q.open : q.closed];
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
        const nx = x + dx, ny = y + dy;
        if (nx >= 0 && ny >= 0 && nx < tm.w && ny < tm.h) tm.masks[ny * tm.w + nx] = undefined;
      }
    }
  };
  L.gateOpen = (c, key) => c.flag(c.map.def.gates[key].flag);

  /** The Snip script for a hedge tree registered with M.snip(key, x, y). Needs the Snip disc (Poppy gives it). */
  L.snipScript = (key) => function* (c) {
    const q = c.map.def.gates[key], id = c.map.id + '.snip.' + key;
    if (c.flag(q.flag)) return;
    if (!NP.state.bag.disc_snip) {
      yield* c.sayT(id + '.no', ['A little tree is growing right in the way.', 'Maybe a Kigu could Snip it down if she knew how.']);
      return;
    }
    yield* c.sayT(id + '.ask', ['A little tree is growing right in the way.']);
    if (!(yield* c.ask('Use Snip on the tree?'))) return;
    NP.snd.sfx('leaf');
    L.setGate(c, key, true);
    yield* c.sayT(id + '.done', ['{player} had a Kigu Snip the tree down!']);
  };

  // ------------------------------------------------------------------------------------------ things that change with story flags
  /** A stamp definition (an entry of def.stamps) whose variant follows a flag: `before` until the flag is set, `after` once it is.
   *  The getter is read when the TileMap is built; L.syncStamps(c) (call it from onEnter) refreshes an already-built map. */
  L.variantByFlag = function (stampDef, flag, before, after) {
    stampDef.dyn = true;
    Object.defineProperty(stampDef, 'variant', { enumerable: true, configurable: true, get() { return (NP.state && NP.state.flags[flag]) ? after : before; } });
    return stampDef;
  };
  L.syncStamps = function (c) {
    const tm = c.map;
    for (const s of tm.def.stamps || []) {
      if (!s.dyn) continue;
      const p = tm.placements.find((q) => q.id === s.id && q.x === s.x && q.y === s.y);
      if (p) p.variant = s.variant;
    }
  };
  /** An NPC definition whose look follows a flag. */
  L.lookByFlag = function (npcDef, flag, before, after) {
    Object.defineProperty(npcDef, 'look', { enumerable: true, configurable: true, get() { return (NP.state && NP.state.flags[flag]) ? after : before; } });
    return npcDef;
  };

  // ------------------------------------------------------------------------------------------ the builder
  L.map = function (o) {
    const W = o.w, H = o.h;
    const g = K.grid(W, H, o.fill || '.');
    const def = { id: o.id, name: o.name, music: null, battleBg: 'grass', border: 'treeline', designer: 'levels' };
    for (const k of Object.keys(o)) if (['w', 'h', 'fill', 'legend'].indexOf(k) < 0) def[k] = o[k];
    def.legend = Object.assign({}, o.legend);
    def.stamps = []; def.npcs = []; def.props = []; def.triggers = []; def.interact = []; def.warps = []; def.spawns = {};
    const gates = {};
    const M = { def, w: W, h: H, g, gates };
    const inb = (x, y) => x >= 0 && y >= 0 && x < W && y < H;

    // -- terrain
    M.legend = (ch, terrain) => { def.legend[ch] = terrain; return M; };
    M.set = (x, y, ch) => { if (inb(x, y)) g[y][x] = ch; return M; };
    M.at = (x, y) => (inb(x, y) ? g[y][x] : null);
    M.rect = (x, y, w, h, ch) => { K.rect(g, x, y, w, h, ch); return M; };
    M.path = (pts, t, ch) => { K.path(g, pts, t, ch); return M; };
    M.ring = (x, y, w, h, t, ch) => { M.rect(x, y, w, t, ch).rect(x, y + h - t, w, t, ch).rect(x, y, t, h, ch).rect(x + w - t, y, t, h, ch); return M; };
    M.border = (t, ch) => M.ring(0, 0, W, H, t, ch);
    M.blob = (cx, cy, rx, ry, ch) => {
      for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++) for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) {
        const dx = (x - cx) / (rx + 0.3), dy = (y - cy) / (ry + 0.3);
        if (dx * dx + dy * dy <= 1) M.set(x, y, ch);
      }
      return M;
    };
    /** overlay ASCII art (spaces are transparent unless `skip` says otherwise) */
    M.ascii = (x0, y0, lines, skip) => {
      const sk = skip === undefined ? ' ' : skip;
      lines.forEach((row, j) => { for (let i = 0; i < row.length; i++) if (row[i] !== sk) M.set(x0 + i, y0 + j, row[i]); });
      return M;
    };
    /** all cells matching `ch` inside a rect: [[x,y],...] (handy for scattering trees) */
    M.cells = (ch, x0, y0, w, h) => {
      const out = [];
      for (let y = y0; y < y0 + h; y++) for (let x = x0; x < x0 + w; x++) if (inb(x, y) && g[y][x] === ch) out.push([x, y]);
      return out;
    };

    // -- stamps
    M.stamp = (id, x, y, variant, extra) => {
      const s = { id, x, y };
      if (variant) s.variant = variant;
      def.stamps.push(Object.assign(s, extra || {}));
      return M;
    };
    M.tree = (x, y) => M.stamp('tree', x, y);
    M.trees = (list, id) => { for (const p of list) M.stamp(id || 'tree', p[0], p[1]); return M; };
    M.sign = (x, y, text, note) => { M.stamp('sign', x, y); def.interact.push({ x, y, say: text, note }); return M; };
    M.building = (id, x, y, variant, name, to, extra) => M.stamp(id, x, y, variant, Object.assign({ name, to }, extra || {}));
    M.interact = (x, y, sayOrScript, note) => {
      const e = { x, y, note };
      if (typeof sayOrScript === 'function' || (typeof sayOrScript === 'string' && NP.scripts[sayOrScript])) e.script = sayOrScript;
      else e.say = sayOrScript;
      def.interact.push(e);
      return M;
    };

    // -- people and things
    M.npc = (id, x, y, look, dir, say, extra) => {
      const n = { id, x, y, look: L.look(look), dir: dir || 'down' };
      if (say !== undefined && say !== null) n.say = Array.isArray(say) ? say : [say];
      def.npcs.push(Object.assign(n, extra || {}));
      return M;
    };
    M.trainer = (id, x, y, look, dir, o2) => { def.npcs.push(L.trainerDef(id, x, y, look, dir, o2)); return M; };
    M.pickup = (key, x, y, item, n, note) => {
      const it = L.item(item, 'snack_cake'), flag = 'got_' + def.id + '_' + key;
      def.props.push({ id: 'item_' + key, x, y, icon: 'item:' + it, hideIf: flag, item: it, n: n || 1, note, script: function* (c) { c.set(flag); yield* c.giveItem(it, n || 1, { found: true }); } });
      return M;
    };
    /** item found by pressing A on an object tile (stump, rock, bush...). */
    M.hidden = (key, x, y, item, n, note) => {
      const it = L.item(item, 'snack_cake'), flag = 'got_' + def.id + '_' + key;
      def.interact.push({ x, y, hidden: true, item: it, n: n || 1, note, script: function* (c) {
        if (c.flag(flag)) return;
        c.set(flag);
        NP.snd.sfx('pickup');
        yield* c.giveItem(it, n || 1, { found: true });
      } });
      return M;
    };

    // -- connections
    M.spawn = (name, x, y, dir) => { def.spawns[name] = { x, y, dir: dir || 'down' }; return M; };
    M.warp = (w) => { def.warps.push(w); return M; };
    /** edge exit: side 'n'|'s'|'e'|'w', a..b = tiles along that edge; fb = {tx,ty,dir} arrival fallback in the destination */
    M.edge = (side, a, b, to, spawn, fb) => {
      const r = []; for (let i = a; i <= b; i++) r.push(i);
      const w = { to, spawn, sound: 'none' };
      if (fb) Object.assign(w, fb);
      if (side === 'n') Object.assign(w, { xs: r, y: 0 });
      else if (side === 's') Object.assign(w, { xs: r, y: H - 1 });
      else if (side === 'w') Object.assign(w, { x: 0, ys: r });
      else Object.assign(w, { x: W - 1, ys: r });
      def.warps.push(w);
      return M;
    };
    M.trigger = (t) => { def.triggers.push(t); return M; };
    M.enc = (kind, list) => {
      def.encounters = def.encounters || {};
      def.encounters[kind] = list.map((e) => ({ sp: L.sp(e[0]), min: e[1], max: e[2], w: e[3] }));
      return M;
    };

    // -- terrain that follows flags: gates and Snip trees
    M.gate = (key, q) => {
      const gt = { key, flag: q.flag || 'gate_' + def.id + '_' + key, cells: q.cells, closed: q.closed, open: q.open, note: q.note };
      gates[key] = gt;
      for (const [x, y] of gt.cells) M.set(x, y, gt.closed);
      return M;
    };
    M.snip = (key, x, y, open, note) => {
      M.gate(key, { cells: [[x, y]], closed: 'h', open: open || '.', note: note || 'Snip tree (needs disc_snip)' });
      def.interact.push({ x, y, snip: key, note: note || 'Snip tree (needs disc_snip)', script: L.snipScript(key) });
      return M;
    };

    M.reg = () => {
      if (!def.legend.h && Object.keys(gates).some((k) => gates[k].closed === 'h')) def.legend.h = 'hedge';
      const keys = Object.keys(gates);
      if (keys.length) {
        def.gates = gates;
        let sig = null, cache = null;
        Object.defineProperty(def, 'rows', {
          enumerable: true, configurable: true,
          get() {
            const fl = (NP.state && NP.state.flags) || {};
            const s = keys.map((k) => (fl[gates[k].flag] ? 1 : 0)).join('');
            if (s !== sig) {
              const gg = g.map((r) => r.slice());
              for (const k of keys) for (const [x, y] of gates[k].cells) gg[y][x] = fl[gates[k].flag] ? gates[k].open : gates[k].closed;
              cache = K.rows(gg); sig = s;
            }
            return cache;
          },
        });
      } else def.rows = K.rows(g);
      K.reg(def);
      return def;
    };
    return M;
  };

  // ------------------------------------------------------------------------------------------ interiors
  /** Indoor room with a 2-wide door mat in the bottom wall and an exit warp to the outside door named o.exit.door. */
  L.room = function (o) {
    const w = o.w || 10, h = o.h || 9;
    const dx = o.doorX === undefined ? (w >> 1) - 1 : o.doorX;
    const skip = ['w', 'h', 'doorX', 'exit', 'floor', 'wall', 'carpet', 'carpetTerrain', 'legend'];
    const meta = {};
    for (const k of Object.keys(o)) if (skip.indexOf(k) < 0) meta[k] = o[k];
    const M = L.map(Object.assign({
      w, h, fill: 'f', indoor: true, border: 'void', battleBg: 'indoor',
      legend: Object.assign({ f: o.floor || 'floor_wood', W: o.wall || 'wall_wood', m: 'mat', c: o.carpetTerrain || 'carpet_red' }, o.legend),
    }, meta));
    M.rect(0, 0, w, 2, 'W').rect(0, h - 1, w, 1, 'W').rect(0, 2, 1, h - 2, 'W').rect(w - 1, 2, 1, h - 2, 'W').rect(dx, h - 1, 2, 1, 'm');
    if (o.carpet) M.rect(o.carpet[0], o.carpet[1], o.carpet[2], o.carpet[3], 'c');
    M.spawn('door', dx, h - 2, 'up');
    if (o.exit) M.warp({ xs: [dx, dx + 1], y: h - 1, to: o.exit.to, door: o.exit.door, sound: 'door' });
    M.doorX = dx;
    return M;
  };

  /** Standard Tea House (healer counter + storage terminal). o: { id, exit:{to,door}, guests:[{id,x,y,look,dir,say}] } */
  L.tea = function (o) {
    const M = L.room({ id: o.id, name: o.name || 'Tea House', w: 11, h: 9, doorX: 4, music: 'tea_house', exit: o.exit, carpet: [3, 3, 4, 1], recLevel: o.recLevel });
    M.stamp('tea_healer', 4, 3).stamp('pc_terminal', 9, 2).stamp('table_s', 6, 5).stamp('chair', 6, 6)
      .stamp('window', 2, 1).stamp('window', 7, 1).stamp('plant', 1, 3).stamp('plant', 9, 6);
    M.interact(4, 3, 'tea').interact(5, 3, 'tea').interact(9, 3, 'pc');
    M.npc('maid', 4, 2, 'tea_maid', 'down', null, { script: 'tea', note: 'Tea House healer (shared script "tea")' });
    for (const gst of o.guests || []) M.npc(gst.id, gst.x, gst.y, gst.look, gst.dir, gst.say, { note: gst.note });
    return M;
  };

  /** Standard General Store. o: { id, exit, stock:[ids], gated:[{badges:n, items:[..]}], clerk..., guests } */
  L.store = function (o) {
    const M = L.room({ id: o.id, name: o.name || 'General Store', w: 10, h: 8, doorX: 4, floor: 'floor_tile', wall: 'wall_plaster', exit: o.exit, shopStock: o.stock, shopGated: o.gated, recLevel: o.recLevel });
    M.stamp('counter_l', 3, 3).stamp('counter_m', 4, 3).stamp('counter_r', 5, 3)
      .stamp('shop_shelf', 1, 2).stamp('shop_shelf', 2, 2).stamp('shop_shelf', 7, 2).stamp('shop_shelf', 8, 2).stamp('plant', 8, 5);
    M.interact(3, 3, 'shopx').interact(4, 3, 'shopx').interact(5, 3, 'shopx');
    M.npc('clerk', 4, 2, 'shopkeeper', 'down', null, { script: 'shopx', note: 'Clerk (shared script "shopx": stock + Button-gated stock)' });
    for (const gst of o.guests || []) M.npc(gst.id, gst.x, gst.y, gst.look, gst.dir, gst.say, { note: gst.note });
    return M;
  };

  /** Shop script: def.shopStock (+ def.shopGated:[{badges,items}]); ids that do not exist (yet) in NP.data.items are skipped. */
  NP.scripts.shopx = function* (c) {
    const d = c.map.def;
    yield* c.sayT('script.shop.1', 'Welcome to the General Store! How can I help you?');
    const n = L.badges(), list = [];
    for (const id of d.shopStock || ['bond_spool', 'snack_cake']) if (L.hasItem(id) && list.indexOf(id) < 0) list.push(id);
    for (const gs of d.shopGated || []) if (n >= gs.badges) for (const id of gs.items) if (L.hasItem(id) && list.indexOf(id) < 0) list.push(id);
    yield* c.shop(list);
    yield* c.sayT('script.shop.2', 'Please come again!');
  };

  /** A plain free-rest spot for routes (does not move the blackout point). Usage: npc script: 'restfree'. */
  NP.scripts.restfree = function* (c, npc) {
    const k = (s) => c.map.id + '.' + npc.id + '.' + s;
    yield* c.sayT(k('1'), ['You look tired, dear. Have a warm cup of tea and a biscuit.']);
    NP.snd.sfx('save');
    NP.State.healAll();
    yield* c.sayT(k('2'), ['Your Kigu are feeling much better!']);
  };
})(typeof globalThis !== 'undefined' ? globalThis : window);
