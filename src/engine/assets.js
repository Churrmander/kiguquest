/* NP.assets — the single place the game asks for pictures. Wraps NP.art.* (built by the art teams, possibly still incomplete)
 * and falls back to simple generated placeholders so the game always runs and stays playable.
 * Results are cached; callers must not mutate returned bitmaps (clone() first). */
(function (root) {
  'use strict';
  const NP = (root.NP = root.NP || {});
  const { Bitmap, Color } = NP;
  const A = (NP.assets = {});
  const cache = new Map();
  const memo = (key, fn) => {
    let v = cache.get(key);
    if (v === undefined) { v = fn(); cache.set(key, v); }
    return v;
  };
  const tryit = (fn, dflt) => { try { const v = fn(); return v === undefined ? dflt : v; } catch (e) { return dflt; } };
  const art = () => NP.art || {};
  const hashColor = (s, sat, val) => {
    const h = (NP.hash(s) % 360);
    return Color.fromHSL ? Color.fromHSL(h, sat === undefined ? 0.45 : sat, val === undefined ? 0.55 : val) : '#888888';
  };

  // ------------------------------------------------------------------ terrain
  const T = (color, o) => Object.assign({ color, solid: false, encounter: null, ledge: null, water: false }, o || {});
  const FALLBACK_TERRAIN = {
    grass: T('#6cc04a'), tallgrass: T('#3f9b38', { encounter: 'grass' }), flowers: T('#7ed05a'), path: T('#d6b87a'), cobble: T('#b8b4b0'), sand: T('#ecd594'),
    dirt: T('#b08a5a'), rock_path: T('#a89880'), water: T('#4f8fe8', { water: true, encounter: 'water' }), sea: T('#3a6fc8', { water: true, encounter: 'water' }),
    treeline: T('#1e6a2e', { solid: true }), fence: T('#a8783c', { solid: true }), hedge: T('#2e8a3a', { solid: true }),
    ledge_d: T('#5fae42', { ledge: 'down' }), ledge_l: T('#5fae42', { ledge: 'left' }), ledge_r: T('#5fae42', { ledge: 'right' }),
    cliff: T('#8a7a6a', { solid: true }), bridge_h: T('#b8884a'), bridge_v: T('#b8884a'),
    cave_floor: T('#7a6a5a', { encounter: 'cave' }), cave_wall: T('#3a3030', { solid: true }),
    floor_wood: T('#c89858'), floor_tile: T('#e0dccc'), floor_stone: T('#9a98a0'), carpet_red: T('#b83838'), carpet_blue: T('#4860b8'), carpet_green: T('#3c9860'),
    wall_wood: T('#8a5a30', { solid: true }), wall_plaster: T('#e8dcc0', { solid: true }), wall_stone: T('#6a6870', { solid: true }),
    mat: T('#c86060'), void: T('#000000', { solid: true }), stairs_up: T('#a09080'), stairs_down: T('#706050'),
  };
  A.terrainDef = function (id) {
    const t = NP.terrain && NP.terrain[id];
    if (t) return t;
    const f = FALLBACK_TERRAIN[id];
    return f ? Object.assign({ id, group: id, autotile: false, variants: 1, frames: 1, hasOverlay: false, step: 'step' }, f) : { id, group: id, solid: false, encounter: null, ledge: null, water: false, frames: 1, variants: 1 };
  };
  A.hasTerrainArt = (id) => !!(NP.terrain && NP.terrain[id] && art().tiles && art().tiles.terrain);
  A.terrain = function (id, mask, frame, variant) {
    if (A.hasTerrainArt(id)) {
      const b = tryit(() => art().tiles.terrain(id, mask, frame, variant), null);
      if (b) return b;
    }
    return memo('ft|' + id, () => {
      const d = FALLBACK_TERRAIN[id];
      const col = d ? d.color : hashColor(id);
      const b = new Bitmap(16, 16);
      b.clear(col);
      const dark = Color.shade ? Color.shade(col, -0.12) : col;
      for (let i = 0; i < 6; i++) b.set((i * 7 + 3) % 16, (i * 5 + 2) % 16, dark);
      if (id === 'tallgrass') for (let x = 1; x < 16; x += 4) b.fillRect(x, 4 + (x % 3) * 3, 2, 6, '#2a7a2c');
      if (d && d.solid) b.strokeRect(0, 0, 16, 16, dark);
      return b;
    });
  };
  A.overlay = function (id, frame) {
    if (!(NP.terrain && NP.terrain[id] && NP.terrain[id].hasOverlay)) return null;
    return tryit(() => art().tiles.overlay(id, frame), null);
  };
  A.variantAt = (id, x, y) => tryit(() => (A.hasTerrainArt(id) ? art().tiles.variantAt(id, x, y) : 0), 0);
  A.computeMask = (idAt, x, y) => tryit(() => (art().tiles && art().tiles.computeMask ? art().tiles.computeMask(idAt, x, y) : 255), 255);
  A.frameAt = (def, tick) => tryit(() => (art().tiles && art().tiles.frameAt ? art().tiles.frameAt(def, tick) : 0), 0);

  // ------------------------------------------------------------------ stamps
  const S = (w, h, o) => {
    o = o || {};
    const solid = [];
    for (let y = 0; y < h; y++) solid.push((o.walk ? '.' : '#').repeat(w));
    if (o.door) solid[o.door[1]] = solid[o.door[1]].slice(0, o.door[0]) + 'D' + solid[o.door[1]].slice(o.door[0] + 1);
    return Object.assign({ w, h, solid, over: 0, layer: 'obj', variants: ['default'], frames: 1, color: '#a06040' }, o);
  };
  const FALLBACK_STAMPS = {
    house_s: S(4, 3, { color: '#c8583c', door: [1, 2] }), house_m: S(5, 4, { color: '#c8583c', door: [2, 3] }), house_l: S(6, 4, { color: '#c8583c', door: [2, 3] }),
    lab: S(7, 5, { color: '#7aa0c8', door: [3, 4] }), tea_house: S(5, 4, { color: '#e888a8', door: [2, 3] }), general_store: S(5, 4, { color: '#58a868', door: [2, 3] }),
    salon: S(7, 5, { color: '#d0a040', door: [3, 4] }), tree: S(1, 2, { color: '#2a7a2c', over: 1 }), tree_big: S(2, 3, { color: '#2a7a2c', over: 2 }), pine: S(1, 2, { color: '#206a34', over: 1 }),
    bush: S(1, 1, { color: '#3a8a3a' }), boulder: S(1, 1, { color: '#8a8a90' }), sign: S(1, 1, { color: '#b08040' }), mailbox: S(1, 1, { color: '#c04040' }), lamp: S(1, 2, { color: '#e0d080' }),
    bench: S(2, 1, { color: '#a07040' }), flowerbed: S(2, 1, { color: '#e070a0', walk: true, layer: 'floor' }), well: S(2, 2, { color: '#8a8a98' }), windmill: S(3, 4, { color: '#d8c8a0' }),
    crate: S(1, 1, { color: '#b08040' }), barrel: S(1, 1, { color: '#8a5a30' }), haystack: S(1, 1, { color: '#e0c060' }), rock: S(1, 1, { color: '#8a8a90' }), stump: S(1, 1, { color: '#8a6a40' }),
    cloth_line: S(2, 1, { color: '#e8e8f0' }),
    table_s: S(2, 1, { color: '#a07040' }), table_l: S(3, 2, { color: '#a07040' }), chair: S(1, 1, { color: '#b08040' }), bed: S(1, 2, { color: '#e8a0b0' }), bookshelf: S(2, 2, { color: '#7a5030' }),
    cloth_shelf: S(2, 2, { color: '#c08ad0' }), tv: S(1, 1, { color: '#404050' }), plant: S(1, 1, { color: '#3a8a3a' }), rug_a: S(2, 2, { color: '#c05050', walk: true, layer: 'floor' }),
    rug_b: S(2, 2, { color: '#5050c0', walk: true, layer: 'floor' }), counter_l: S(1, 1, { color: '#b08048' }), counter_m: S(1, 1, { color: '#b08048' }), counter_r: S(1, 1, { color: '#b08048' }),
    counter_c: S(1, 1, { color: '#b08048' }), pc_terminal: S(1, 2, { color: '#6080c0' }), tea_healer: S(2, 1, { color: '#e888a8' }), shop_shelf: S(1, 2, { color: '#7a5030' }),
    window: S(1, 1, { color: '#a0d0f0' }), poster: S(1, 1, { color: '#e0c060' }), clock: S(1, 1, { color: '#e0e0e0' }), mannequin: S(1, 2, { color: '#d0a0c0' }), sewing_machine: S(1, 1, { color: '#606070' }),
    fridge: S(1, 2, { color: '#d8e0e8' }), stove: S(1, 1, { color: '#808080' }), sink: S(1, 1, { color: '#a0b0c0' }), display_case: S(2, 1, { color: '#c0e0f0' }), pillar: S(1, 2, { color: '#d0c8b8' }),
    ladder: S(1, 1, { color: '#a07040' }),
  };
  A.stampDef = function (id) {
    const s = NP.stamps && NP.stamps[id];
    if (s) return s;
    return FALLBACK_STAMPS[id] || S(1, 1, { color: hashColor(id) });
  };
  A.hasStampArt = (id) => !!(NP.stamps && NP.stamps[id] && art().tiles && art().tiles.stamp);
  A.stamp = function (id, variant, frame) {
    if (A.hasStampArt(id)) {
      const b = tryit(() => art().tiles.stamp(id, variant, frame), null);
      if (b) return b;
    }
    const d = A.stampDef(id);
    return memo('fs|' + id + '|' + variant, () => {
      const b = new Bitmap(d.w * 16, d.h * 16);
      const col = variant && /^#/.test(variant) ? variant : d.color;
      const dark = Color.shade ? Color.shade(col, -0.35) : '#000000';
      b.fillRect(1, 1, b.w - 2, b.h - 2, col);
      b.strokeRect(0, 0, b.w, b.h, dark);
      if (d.door) b.fillRect(d.door[0] * 16 + 3, d.door[1] * 16 + 3, 10, 13, '#402818');
      NP.Font.draw(b, id.slice(0, Math.max(2, d.w * 3)), 3, 3, { color: '#ffffff', shadow: dark });
      return b;
    });
  };

  // ------------------------------------------------------------------ people
  const DIRS = ['down', 'up', 'left', 'right'];
  function fallbackHuman(look) {
    return memo('fh|' + look, () => {
      const col = Color.parse(hashColor(look, 0.5, 0.5));
      const frames = {};
      for (const d of DIRS) {
        frames[d] = [0, 1, 2].map((f) => {
          const b = new Bitmap(16, 24);
          b.fillRect(4, 8, 8, 10, col);                       // body
          b.fillRect(4, 2, 8, 7, '#f0d0b0');                  // head
          b.fillRect(3, 1, 10, 3, '#5a3a20');                 // hair
          if (d === 'down') { b.set(6, 5, '#202020'); b.set(9, 5, '#202020'); }
          if (d === 'left') b.set(5, 5, '#202020');
          if (d === 'right') b.set(10, 5, '#202020');
          const step = f === 1 ? 1 : 0, step2 = f === 2 ? 1 : 0;
          b.fillRect(5, 18, 2, 5 - step, '#303040');
          b.fillRect(9, 18, 2, 5 - step2, '#303040');
          return b.outline ? b.outline('#20202a') : b;
        });
      }
      return { w: 16, h: 24, frames };
    });
  }
  A.human = function (look) {
    const h = art().human;
    if (h && h.has && h.overworld) {
      const v = tryit(() => (h.has(look) ? memo('ho|' + look, () => h.overworld(look)) : null), null);
      if (v) return v;
    }
    return fallbackHuman(look || 'npc');
  };
  function portrait(kind, look) {
    const h = art().human;
    if (h && h.has && h[kind]) {
      const v = tryit(() => (h.has(look) ? memo('hp|' + kind + '|' + look, () => h[kind](look)) : null), null);
      if (v) return v;
    }
    return memo('fp|' + kind + '|' + look, () => {
      const col = hashColor(look, 0.5, 0.5);
      const b = new Bitmap(64, 64);
      b.ellipse(32, 26, 14, 14, '#f0d0b0', true);
      b.fillRect(14, 40, 36, 22, col);
      b.ellipse(32, 14, 15, 9, '#5a3a20', true);
      return b.outline ? b.outline('#20202a') : b;
    });
  }
  A.humanFront = (look) => portrait('front', look);
  A.humanBack = (look) => portrait('back', look);

  // ------------------------------------------------------------------ kigu
  function blob(id, back) {
    return memo('fk|' + id + '|' + !!back, () => {
      const sp = NP.data.species[id];
      const t = sp && NP.data.types[sp.types[0]];
      const col = t ? t.color : '#c0c0c0';
      const dark = Color.shade ? Color.shade(col, -0.4) : '#202020';
      const b = new Bitmap(64, 64);
      const tall = sp ? 40 + (sp.stage || 1) * 6 : 44;
      b.ellipse(32, 62 - tall / 4, 14, tall / 4, col, true);            // costume body
      b.ellipse(32, 62 - tall / 2 - 4, 13, 12, '#f4d8c0', true);        // head
      b.ellipse(32, 62 - tall / 2 - 10, 14, 8, col, true);              // hood
      b.ellipse(22, 62 - tall / 2 - 16, 4, 6, col, true);               // ears
      b.ellipse(42, 62 - tall / 2 - 16, 4, 6, col, true);
      if (!back) { b.fillRect(26, 62 - tall / 2 - 5, 3, 4, '#202838'); b.fillRect(35, 62 - tall / 2 - 5, 3, 4, '#202838'); }
      return b.outline ? b.outline(dark) : b;
    });
  }
  A.kiguHas = (id) => !!(art().kigu && art().kigu.has && tryit(() => art().kigu.has(id), false));
  A.kiguFront = function (id, alt) {
    if (A.kiguHas(id)) { const b = tryit(() => art().kigu.front(id, alt ? { alt: true } : undefined), null); if (b) return b; }
    return blob(id, false);
  };
  A.kiguBack = function (id, alt) {
    if (A.kiguHas(id)) { const b = tryit(() => art().kigu.back(id, alt ? { alt: true } : undefined), null); if (b) return b; }
    return blob(id, true);
  };
  A.kiguIcon = function (id, frame) {
    if (A.kiguHas(id)) { const b = tryit(() => art().kigu.icon(id, frame & 1), null); if (b) return b; }
    return memo('fi|' + id + '|' + (frame & 1), () => {
      const big = blob(id, false);
      const b = new Bitmap(32, 32);
      b.blit(big.crop(16, 14, 32, 48), 0, (frame & 1) ? -15 : -14);
      return b;
    });
  };

  // ------------------------------------------------------------------ icons & misc
  A.icon = function (kind, id, a, b) {
    const I = art().icons;
    if (I && I[kind] && (!I.has || tryit(() => I.has(kind, id), true))) {
      const v = tryit(() => I[kind](id, a, b), null);
      if (v) return v;
    }
    return null;
  };
  A.typePill = function (typeId) {
    const v = A.icon('type', typeId);
    if (v) return v;
    return memo('tp|' + typeId, () => {
      const t = NP.data.types[typeId];
      const b = new Bitmap(32, 12);
      b.fillRect(0, 0, 32, 12, t ? t.color : '#888888');
      b.strokeRect(0, 0, 32, 12, '#20202a');
      NP.Font.draw(b, t ? t.name : '???', 16, 2, { color: '#ffffff', shadow: '#00000080', align: 'center' });
      return b;
    });
  };
  A.statusTag = function (id) {
    const v = A.icon('status', id);
    if (v) return v;
    return memo('st|' + id, () => {
      const col = { brn: '#e8603c', psn: '#a055b0', tox: '#8a3fa0', par: '#e8c83a', slp: '#8090a8', frz: '#70c8e0', fnt: '#606060' }[id] || '#808080';
      const b = new Bitmap(24, 12);
      b.fillRect(0, 0, 24, 12, col);
      b.strokeRect(0, 0, 24, 12, '#20202a');
      NP.Font.draw(b, id.toUpperCase(), 12, 2, { color: '#ffffff', align: 'center', shadow: '#00000080' });
      return b;
    });
  };
  A.itemIcon = function (id) {
    const v = A.icon('item', id);
    if (v) return v;
    return memo('ii|' + id, () => {
      const b = new Bitmap(24, 24);
      const d = NP.data.items[id];
      const col = d && d.pocket === 'spools' ? '#e8b850' : d && d.pocket === 'key' ? '#6090d0' : hashColor(id);
      b.ellipse(12, 12, 8, 8, col, true);
      b.ellipse(12, 12, 8, 8, '#20202a', false);
      return b;
    });
  };
  A.emote = function (name) {
    const v = A.icon('emote', name);
    if (v) return v;
    return memo('em|' + name, () => {
      const b = new Bitmap(16, 16);
      b.ellipse(8, 8, 7, 7, '#ffffff', true);
      b.ellipse(8, 8, 7, 7, '#20202a', false);
      NP.Font.draw(b, { exclaim: '!', question: '?', heart: '♥', note: '♪' }[name] || '!', 8, 3, { color: '#d83838', align: 'center', shadow: null });
      return b;
    });
  };
  A.spool = function (kind, frame) {
    const v = A.icon('spool', kind, frame & 3);
    if (v) return v;
    return memo('sp|' + kind + '|' + (frame & 3), () => {
      const b = new Bitmap(16, 16);
      const col = { bond: '#e85a5a', silk: '#58a8e8', gold: '#e8c83a', master: '#b060e0' }[kind] || '#e85a5a';
      b.ellipse(8, 8, 6, 6, col, true);
      b.ellipse(8, 8, 6, 6, '#20202a', false);
      b.hline(3, 5 + (frame & 3), 10, '#ffffff');
      return b;
    });
  };
  A.battleBg = function (id) {
    const r = tryit(() => art().tiles.battleBg(id || 'grass'), null);
    if (r) return r;
    return memo('bg|' + id, () => {
      const bg = new Bitmap(240, 112);
      bg.fillRect(0, 0, 240, 62, '#9ad4f0');
      bg.fillRect(0, 62, 240, 50, '#78c058');
      bg.ellipse(172, 62, 40, 9, '#5aa040', true);
      bg.ellipse(58, 108, 52, 10, '#5aa040', true);
      return { bg, enemyBase: { x: 172, y: 62 }, playerBase: { x: 58, y: 108 } };
    });
  };
  const hasIcon = (k) => tryit(() => !art().icons.has || art().icons.has(k), false);
  A.logo = () => (hasIcon('logo') ? tryit(() => art().icons.logo(), null) : null);
  A.titleScene = () => (hasIcon('titleScene') ? tryit(() => art().icons.titleScene(), null) : null);
  A.fx = (name, frame) => tryit(() => (art().icons && art().icons.fx ? art().icons.fx(name, frame) : null), null);
  A.fxFrames = (name) => tryit(() => (art().icons && art().icons.fxFrames ? art().icons.fxFrames(name) : 1), 1);
  A.badge = (n, big) => A.icon('badge', n, big);

  A.clearCache = () => cache.clear();
})(typeof globalThis !== 'undefined' ? globalThis : window);
