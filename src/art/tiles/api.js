/* src/art/tiles/api.js — public cached wrappers: NP.art.tiles.terrain / stamp / overlay / battleBg (+ small map helpers). */
(function (root) {
  'use strict';
  const NP = root.NP;
  const tiles = NP.art.tiles;
  const K = tiles.kit;

  const mod = (a, n) => ((((a | 0) % n) + n) % n);
  const tCache = new Map(), sCache = new Map(), oCache = new Map(), bgCache = new Map();

  function terrainDef(id) {
    const t = NP.terrain[id];
    if (!t) throw new Error('NP.art.tiles: unknown terrain "' + id + '"');
    return t;
  }
  function stampDef(id) {
    const s = NP.stamps[id];
    if (!s) throw new Error('NP.art.tiles: unknown stamp "' + id + '"');
    return s;
  }
  /** normalise a mask the way the terrain's draw() will (so the cache hits for equivalent masks) */
  function normMask(t, mask) {
    if (!t.autotile) return 0;
    const m = (mask === undefined || mask === null ? 255 : mask) & 255;
    return t.maskMode === 'ortho' ? K.ortho(m) : K.reduce(m);
  }

  /** Cached 16x16 terrain tile. Do not mutate the result (clone() first). */
  tiles.terrain = function (id, mask, frame, variant) {
    const t = terrainDef(id);
    const m = normMask(t, mask), f = mod(frame, t.frames), v = mod(variant, t.variants);
    const key = id + '|' + m + '|' + f + '|' + v;
    let b = tCache.get(key);
    if (!b) { b = t.draw(m, f, v); tCache.set(key, b); }
    return b;
  };

  /** Cached overlay (drawn over actors standing on the tile) or null. */
  tiles.overlay = function (id, frame) {
    const t = terrainDef(id);
    if (!t.hasOverlay) return null;
    const f = mod(frame, t.frames);
    const key = id + '|' + f;
    if (!oCache.has(key)) oCache.set(key, t.drawOverlay(f));
    return oCache.get(key);
  };

  /** Cached stamp bitmap (w*16 x h*16). variant: name or index (default first). Do not mutate. */
  tiles.stamp = function (id, variant, frame) {
    const s = stampDef(id);
    let v = variant;
    if (typeof v === 'number') v = s.variants[mod(v, s.variants.length)];
    if (v === undefined || v === null || s.variants.indexOf(v) < 0) v = s.variants[0];
    const f = mod(frame, s.frames);
    const key = id + '|' + v + '|' + f;
    let b = sCache.get(key);
    if (!b) { b = s.draw(v, f); sCache.set(key, b); }
    return b;
  };

  /** Battle background: { bg: Bitmap 240x112, enemyBase:{x,y}, playerBase:{x,y} } (cached; do not mutate bg). */
  tiles.battleBg = function (id) {
    let r = bgCache.get(id);
    if (r) return r;
    const def = K.battleBgs[id] || K.battleBgs.grass;
    if (!def) throw new Error('NP.art.tiles: no battle backgrounds registered');
    const bg = def.paint().quantize15();
    r = { id: def.id, bg, enemyBase: { x: def.enemyBase.x, y: def.enemyBase.y }, playerBase: { x: def.playerBase.x, y: def.playerBase.y } };
    bgCache.set(id, r);
    return r;
  };

  // ---------------------------------------------------------------------------------------------- helpers for engines/tools
  const DIRS = [[0, -1, 1], [1, -1, 2], [1, 0, 4], [1, 1, 8], [0, 1, 16], [-1, 1, 32], [-1, 0, 64], [-1, -1, 128]];

  /** group of a terrain id ('' for unknown) */
  tiles.groupOf = (id) => (NP.terrain[id] ? NP.terrain[id].group : '');

  /**
   * 8-neighbour mask for the terrain at (x,y). idAt(x,y) -> terrain id, or null/undefined when outside the map
   * (outside counts as the same group, per the contract).
   */
  tiles.computeMask = function (idAt, x, y) {
    const g = tiles.groupOf(idAt(x, y));
    let m = 0;
    for (const [dx, dy, bit] of DIRS) {
      const n = idAt(x + dx, y + dy);
      if (n === null || n === undefined || tiles.groupOf(n) === g) m |= bit;
    }
    return m;
  };

  /** Deterministic variant for a terrain at a map position (position hash). */
  tiles.variantAt = function (id, x, y) {
    const t = NP.terrain[id];
    if (!t || t.variants <= 1) return 0;
    return K.h32(x * 7 + 3, y * 13 + 1, NP.hash(t.group)) % t.variants;
  };

  /** Animation frame of a terrain/stamp for a global tick counter. */
  tiles.frameAt = function (def, tick) {
    const d = typeof def === 'string' ? NP.terrain[def] || NP.stamps[def] : def;
    if (!d || !(d.frames > 1)) return 0;
    return Math.floor((tick | 0) / (d.animSpeed || 16)) % d.frames;
  };

  tiles.terrainIds = () => Object.keys(NP.terrain);
  tiles.stampIds = () => Object.keys(NP.stamps);
  tiles.battleBgIds = () => Object.keys(K.battleBgs);
  tiles.clearCache = () => { tCache.clear(); sCache.clear(); oCache.clear(); bgCache.clear(); };
})(typeof globalThis !== 'undefined' ? globalThis : window);
