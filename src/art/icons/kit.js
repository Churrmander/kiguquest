/* src/art/icons/kit.js — NP.art.icons: shared drawing toolkit (ramps, cel/dome shading, outlines,
 * palette limiting, caching) + the public API skeleton. The other icon files register their
 * generators into the tables created here (I._reg.*). Everything is lazy + cached: callers must
 * clone() a returned Bitmap before mutating it.
 */
(function (root) {
  'use strict';
  const NP = (root.NP = root.NP || {});
  const { Bitmap, Color } = NP;
  NP.art = NP.art || {};
  const I = (NP.art.icons = NP.art.icons || {});

  const P = (c) => (typeof c === 'number' ? c >>> 0 : Color.parse(c));
  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);

  // ---------------------------------------------------------------- colour
  function towardHue(h, target, amt) {
    const d = ((target - h + 540) % 360) - 180;
    const m = Math.min(Math.abs(d), amt);
    return (h + Math.sign(d) * m + 360) % 360;
  }
  const hsl = (h, s, l) => Color.fromHSL(h, s, l);

  /** Hue-shifted tone: k<0 darker + cooler (toward violet), k>0 lighter + warmer (toward yellow). */
  function tone(base, k) {
    base = P(base);
    if (!k) return base;
    const [h, s, l] = Color.toHSL(base);
    const grey = s < 0.08;
    const hh = grey ? h : k < 0 ? towardHue(h, 255, 8 * -k) : towardHue(h, 50, 6 * k);
    const ss = grey ? s + (k < 0 ? 0.03 * -k : 0) : clamp(s + (k < 0 ? 0.05 * -k : -0.04 * k), 0, 1);
    const ll = clamp(l + (k < 0 ? 0.125 * k : 0.105 * k), 0.03, 0.97);
    return Color.fromHSL(grey && k < 0 ? 240 : hh, ss, ll);
  }
  /** Very dark hue-shifted outline colour of a material (never pure black). */
  function ink(base, l) {
    const [h, s] = Color.toHSL(P(base));
    const grey = s < 0.08;
    return Color.fromHSL(grey ? 250 : towardHue(h, 262, 28), grey ? 0.25 : clamp(s * 0.55 + 0.25, 0.3, 0.75), l === undefined ? 0.13 : l);
  }
  /** Standard 5-tone material ramp + its ink. */
  function ramp(base, o) {
    o = o || {};
    const k = o.k || 1;
    return {
      d2: tone(base, -2 * k), d1: tone(base, -1 * k), m: P(base), l1: tone(base, 1 * k), l2: tone(base, 2 * k),
      ink: o.ink !== undefined ? P(o.ink) : ink(base),
    };
  }
  /** Ramp from explicit colours (dark -> light). */
  function rampOf(d2, d1, m, l1, l2, inkc) {
    return { d2: P(d2), d1: P(d1), m: P(m), l1: P(l1), l2: P(l2 === undefined ? l1 : l2), ink: P(inkc === undefined ? ink(m) : inkc) };
  }

  // ---------------------------------------------------------------- masks / layers
  const layer = (w, h) => new Bitmap(w || 24, h || w || 24);
  function maskOf(b) {
    const m = new Uint8Array(b.w * b.h);
    for (let i = 0; i < m.length; i++) m[i] = b.u32[i] >>> 24 ? 1 : 0;
    return m;
  }
  /** Fill every pixel whose centre satisfies fn(x,y). */
  function fillFn(b, fn, c) {
    c = P(c);
    for (let y = 0; y < b.h; y++) for (let x = 0; x < b.w; x++) if (fn(x, y)) b.u32[y * b.w + x] = c;
    return b;
  }
  function segDist(px, py, ax, ay, bx, by) {
    const vx = bx - ax, vy = by - ay, wx = px - ax, wy = py - ay;
    const L = vx * vx + vy * vy;
    const t = L ? clamp((wx * vx + wy * vy) / L, 0, 1) : 0;
    const dx = px - (ax + vx * t), dy = py - (ay + vy * t);
    return Math.sqrt(dx * dx + dy * dy);
  }
  /** Thick line with round caps (all pixels within r of the segment). */
  function capsule(b, x0, y0, x1, y1, r, c) {
    return fillFn(b, (x, y) => segDist(x, y, x0, y0, x1, y1) <= r + 0.001, c);
  }
  function roundRect(b, x, y, w, h, r, c) {
    const x1 = x + w - 1, y1 = y + h - 1;
    return fillFn(b, (px, py) => {
      if (px < x || py < y || px > x1 || py > y1) return false;
      const cx = px < x + r ? x + r : px > x1 - r ? x1 - r : px;
      const cy = py < y + r ? y + r : py > y1 - r ? y1 - r : py;
      const dx = px - cx, dy = py - cy;
      return dx * dx + dy * dy <= r * r + r * 0.8;
    }, c);
  }
  /** Regular star polygon points. */
  function starPts(cx, cy, ro, ri, n, rot) {
    const pts = [];
    n = n || 5;
    rot = rot === undefined ? -Math.PI / 2 : rot;
    for (let i = 0; i < n * 2; i++) {
      const a = rot + (i * Math.PI) / n, r = i % 2 ? ri : ro;
      pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]);
    }
    return pts;
  }
  function heartFn(cx, cy, s) {
    // heart of half-width ~s centred at (cx, cy)
    return (x, y) => {
      const u = (x - cx) / s, v = (y - cy) / s;
      const a = u * u + v * v * 1.1 - 1;
      // classic implicit heart (flipped so the point is at the bottom)
      const vv = -v + 0.15;
      return Math.pow(u * u + vv * vv - 0.9, 3) - u * u * vv * vv * vv * 1.1 <= 0 || (a < -2);
    };
  }
  /** Draw ASCII rows at (x,y); map: char -> colour (missing chars skipped). */
  function rows(b, x, y, rs, map) {
    for (let j = 0; j < rs.length; j++) {
      const r = rs[j];
      for (let i = 0; i < r.length; i++) {
        const c = map[r[i]];
        if (c !== undefined && c !== null) b.set(x + i, y + j, P(c));
      }
    }
    return b;
  }
  /** Rows -> new Bitmap. */
  const fromRows = (rs, map) => rows(new Bitmap(Math.max(...rs.map((r) => r.length)), rs.length), 0, 0, rs, map);

  // ---------------------------------------------------------------- shading
  /**
   * Cel-shade a layer from its own silhouette (light from the top-left): pixels whose ray toward the
   * bottom-right leaves the shape within `sh` px become d1 (within `deep` px -> d2); pixels whose ray
   * toward the top-left leaves within `hi` px become l1. Everything else m.
   * o: { sh=1, hi=1, deep=0, sdir=[1,1], hdir=[-1,-1], keep: packed colour to leave untouched }
   */
  function cel(b, r, o) {
    o = o || {};
    const W = b.w, H = b.h, m = maskOf(b);
    const ins = (x, y) => x >= 0 && y >= 0 && x < W && y < H && m[y * W + x] === 1;
    const sd = o.sdir || [1, 1], hd = o.hdir || [-1, -1];
    const sh = o.sh === undefined ? 1 : o.sh, hi = o.hi === undefined ? 1 : o.hi, deep = o.deep || 0;
    const out = b.u32.slice();
    const ray = (x, y, d, n) => { for (let k = 1; k <= n; k++) if (!ins(x + d[0] * k, y + d[1] * k)) return true; return false; };
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      if (!ins(x, y)) continue;
      if (o.keep !== undefined && b.u32[y * W + x] === o.keep) continue;
      let c = r.m;
      if (deep && ray(x, y, sd, deep)) c = r.d2;
      else if (sh && ray(x, y, sd, sh)) c = r.d1;
      else if (hi && ray(x, y, hd, hi)) c = r.l1;
      out[y * W + x] = P(c);
    }
    b.u32.set(out);
    return b;
  }

  /** Chamfer distance (px) from each opaque pixel to the nearest transparent / out-of-bounds pixel. */
  function distField(m, W, H) {
    const d = new Float32Array(W * H);
    const INF = 1e6, D1 = 1, D2 = 1.4142;
    for (let i = 0; i < d.length; i++) d[i] = m[i] ? INF : 0;
    const g = (x, y) => (x < 0 || y < 0 || x >= W || y >= H ? 0 : d[y * W + x]);
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const i = y * W + x;
      if (!m[i]) continue;
      d[i] = Math.min(d[i], g(x - 1, y) + D1, g(x, y - 1) + D1, g(x - 1, y - 1) + D2, g(x + 1, y - 1) + D2);
    }
    for (let y = H - 1; y >= 0; y--) for (let x = W - 1; x >= 0; x--) {
      const i = y * W + x;
      if (!m[i]) continue;
      d[i] = Math.min(d[i], g(x + 1, y) + D1, g(x, y + 1) + D1, g(x + 1, y + 1) + D2, g(x - 1, y + 1) + D2);
    }
    return d;
  }

  const LIGHT = (() => { const v = [-0.62, -0.72, 0.62]; const n = Math.hypot(...v); return v.map((a) => a / n); })();
  /**
   * "Pillow/dome" shading from the silhouette's distance field: treats the shape as a rounded
   * surface of radius R, lights it from the top-left and bands it into the ramp.
   * o: { r (profile radius px; default = max inset), height (0..1 flatten, default 1),
   *      bands: [l2, l1, m, d1] thresholds on N·L, spec: false to skip l2, keep }
   */
  function dome(b, r, o) {
    o = o || {};
    const W = b.w, H = b.h, m = maskOf(b);
    const d = distField(m, W, H);
    let R = o.r;
    if (!R) { R = 1; for (let i = 0; i < d.length; i++) if (d[i] > R) R = d[i]; }
    const hk = o.height === undefined ? 1 : o.height;
    const z = (x, y) => {
      if (x < 0 || y < 0 || x >= W || y >= H) return 0;
      const v = d[y * W + x];
      if (!v) return 0;
      const t = Math.min(v, R) / R;
      return Math.sqrt(Math.max(0, 1 - (1 - t) * (1 - t))) * R * hk;
    };
    const L = o.light || LIGHT;
    const bands = o.bands || [0.93, 0.7, 0.3, -0.05];
    const out = b.u32.slice();
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const i = y * W + x;
      if (!m[i]) continue;
      if (o.keep !== undefined && b.u32[i] === o.keep) continue;
      const gx = (z(x + 1, y) - z(x - 1, y)) / 2, gy = (z(x, y + 1) - z(x, y - 1)) / 2;
      const nl = Math.hypot(gx, gy, 1);
      const it = (-gx * L[0] - gy * L[1] + L[2]) / nl;
      let c;
      if (it > bands[0] && o.spec !== false) c = r.l2;
      else if (it > bands[1]) c = r.l1;
      else if (it > bands[2]) c = r.m;
      else if (it > bands[3] || !r.d2 || o.noD2) c = r.d1;
      else c = r.d2;
      out[i] = P(c);
    }
    b.u32.set(out);
    return b;
  }

  /** Shaded ellipse (sphere-ish) drawn straight onto b. */
  function ball(b, cx, cy, rx, ry, r, o) {
    const t = layer(b.w, b.h);
    t.ellipse(cx, cy, rx, ry, r.m);
    dome(t, r, Object.assign({ r: Math.max(rx, ry) + 0.5 }, o || {}));
    b.blit(t, 0, 0);
    return b;
  }

  /** Paint a small specular glint (1 px or a 2x2 / plus). */
  function glint(b, x, y, c, kind) {
    c = P(c || '#ffffff');
    if (kind === 'plus') { b.set(x, y, c); b.set(x - 1, y, c); b.set(x + 1, y, c); b.set(x, y - 1, c); b.set(x, y + 1, c); }
    else if (kind === 2) { b.set(x, y, c); b.set(x + 1, y, c); b.set(x, y + 1, c); }
    else b.set(x, y, c);
    return b;
  }

  /** Recolour pixels of `src` colour inside bitmap to `dst`. */
  const swap = (b, from, to) => b.replaceColor(P(from), P(to));

  // ---------------------------------------------------------------- finishing
  /** Merge least-used colours into their nearest neighbour until <= max colours remain. */
  function limitColors(b, max) {
    let cols = b.colors();
    if (cols.size <= max) return 0;
    const before = cols.size;
    const dist = (a, c) => {
      const A = Color.unpack(a), B = Color.unpack(c);
      const dr = A[0] - B[0], dg = A[1] - B[1], db = A[2] - B[2];
      return 2 * dr * dr + 4 * dg * dg + 3 * db * db;
    };
    while (cols.size > max) {
      const list = [...cols.entries()];
      let best = null, bestScore = Infinity;
      for (const [c, n] of list) {
        for (const [c2, n2] of list) {
          if (c === c2 || n2 < n) continue;
          const s = dist(c, c2) * Math.sqrt(n);
          if (s < bestScore) { bestScore = s; best = [c, c2]; }
        }
      }
      if (!best) break;
      b.replaceColor(best[0], best[1]);
      cols = b.colors();
    }
    return before - cols.size;
  }

  const stats = { reduced: [] };
  /** Outline (outer, 4-neighbour) + 15-bit quantize + palette guard. */
  function finish(b, inkc, max, tag) {
    if (inkc !== null && inkc !== undefined) b.outline(P(inkc));
    b.quantize15();
    if (max) {
      const n = limitColors(b, max);
      if (n && tag) stats.reduced.push(tag + ' (-' + n + ')');
    }
    return b;
  }

  // ---------------------------------------------------------------- types (BIBLE §2)
  const TYPES = [
    ['fluff', 'Fluff', '#b8b09a'], ['ember', 'Ember', '#ef7d3c'], ['tide', 'Tide', '#4f8fe8'],
    ['volt', 'Volt', '#f2cf3a'], ['sprout', 'Sprout', '#6cbf4a'], ['frost', 'Frost', '#8fdcdc'],
    ['brawl', 'Brawl', '#c4453a'], ['nettle', 'Nettle', '#a055b0'], ['terra', 'Terra', '#d9b25f'],
    ['gale', 'Gale', '#9db3f0'], ['dream', 'Dream', '#f0609c'], ['buzz', 'Buzz', '#a6b92e'],
    ['pebble', 'Pebble', '#b09a4a'], ['spook', 'Spook', '#6a5a9e'], ['drake', 'Drake', '#5b3fd6'],
    ['shade', 'Shade', '#5a4a42'], ['iron', 'Iron', '#aab4c8'],
  ];
  const TYPE_IDS = TYPES.map((t) => t[0]);
  const TYPE = {};
  for (const [id, name, col] of TYPES) TYPE[id] = { id, name, color: col };

  // ---------------------------------------------------------------- registry + cache
  const cache = new Map();
  function cached(key, fn) {
    let v = cache.get(key);
    if (!v) { v = fn(); cache.set(key, v); }
    return v;
  }
  const reg = {
    item: Object.create(null),     // id -> { draw(), group, p1 }
    fx: Object.create(null),       // name -> { w, h, frames, draw(frame, base) , color }
    emote: Object.create(null),    // name -> draw()
    badge: null,                   // (n, big) -> Bitmap
    spool: null,                   // (kind, frame) -> Bitmap
    type: null, typeDot: null, status: null, logo: null, titleScene: null,
  };
  const itemOrder = [];
  function addItem(id, group, draw, p1) {
    if (reg.item[id]) throw new Error('icons: duplicate item ' + id);
    reg.item[id] = { id, group, draw, p1: !!p1 };
    itemOrder.push(id);
  }

  // ---------------------------------------------------------------- public API
  const STATUS_IDS = ['brn', 'psn', 'tox', 'par', 'slp', 'frz', 'fnt'];
  const EMOTE_IDS = ['exclaim', 'question', 'heart', 'sweat', 'note', 'anger', 'sparkle', 'zzz'];
  const SPOOL_KINDS = ['bond', 'silk', 'gold', 'master'];

  function unknown(w, h) {
    // magenta/black checker placeholder: obviously wrong, never crashes the game
    const b = new Bitmap(w, h);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) b.set(x, y, ((x >> 2) + (y >> 2)) & 1 ? '#f040c0' : '#302030');
    return b;
  }

  Object.assign(I, {
    TYPE_IDS: TYPE_IDS.slice(),
    TYPES: TYPE,
    STATUS_IDS: STATUS_IDS.slice(),
    EMOTE_IDS: EMOTE_IDS.slice(),
    SPOOL_KINDS: SPOOL_KINDS.slice(),
    typeColor: (id) => (TYPE[id] ? TYPE[id].color : '#b8b09a'),

    type(id) { return cached('type:' + id, () => (TYPE[id] && reg.type ? reg.type(id) : unknown(32, 12))); },
    typeDot(id) { return cached('dot:' + id, () => (TYPE[id] && reg.typeDot ? reg.typeDot(id) : unknown(8, 8))); },
    status(id) { return cached('status:' + id, () => (STATUS_IDS.includes(id) && reg.status ? reg.status(id) : unknown(24, 12))); },
    item(id) {
      return cached('item:' + id, () => {
        const e = reg.item[id];
        if (!e) return unknown(24, 24);
        const b = e.draw();
        if (b.w !== 24 || b.h !== 24) throw new Error('icons: item ' + id + ' is ' + b.w + 'x' + b.h);
        return b;
      });
    },
    badge(n, big) {
      n = n | 0;
      return cached('badge:' + n + ':' + (big ? 1 : 0), () => (n >= 0 && n <= 8 && reg.badge ? reg.badge(n, !!big) : unknown(big ? 32 : 16, big ? 32 : 16)));
    },
    emote(name) { return cached('emote:' + name, () => (reg.emote[name] ? reg.emote[name]() : unknown(16, 16))); },
    spool(kind, frame) {
      kind = SPOOL_KINDS.includes(kind) ? kind : 'bond';
      frame = ((frame | 0) % 4 + 4) % 4;
      return cached('spool:' + kind + ':' + frame, () => (reg.spool ? reg.spool(kind, frame) : unknown(16, 16)));
    },
    /** fx(name, frame, opts?) — opts.type (type id) or opts.color recolours type-tinted effects. */
    fx(name, frame, opts) {
      const e = reg.fx[name];
      if (!e) return cached('fx:?', () => unknown(16, 16));
      const n = e.frames;
      frame = ((frame | 0) % n + n) % n;
      let col = e.color;
      if (opts && opts.color) col = opts.color;
      else if (opts && opts.type && TYPE[opts.type]) col = TYPE[opts.type].color;
      return cached('fx:' + name + ':' + frame + ':' + col, () => e.draw(frame, col));
    },
    fxFrames(name) { return reg.fx[name] ? reg.fx[name].frames : 0; },
    /** { w, h, frames, color, loop, anchor:[x,y] } — anchor = the pixel to place on the target point. */
    fxInfo(name) {
      const e = reg.fx[name];
      return e ? { w: e.w, h: e.h, frames: e.frames, color: e.color, loop: !!e.loop, anchor: e.anchor || [e.w >> 1, e.h >> 1] } : null;
    },
    fxNames() { return Object.keys(reg.fx); },
    logo() { return cached('logo', () => (reg.logo ? reg.logo() : unknown(200, 56))); },
    titleScene() { return cached('title', () => (reg.titleScene ? reg.titleScene() : unknown(240, 160))); },

    items() { return itemOrder.slice(); },
    itemGroup(id) { return reg.item[id] ? reg.item[id].group : null; },
    itemGroups() {
      const g = {};
      for (const id of itemOrder) (g[reg.item[id].group] = g[reg.item[id].group] || []).push(id);
      return g;
    },
    p1Items() { return itemOrder.filter((id) => reg.item[id].p1); },
    emotes() { return Object.keys(reg.emote); },

    /** has(kind, id): kind in type|typeDot|status|item|badge|emote|spool|fx|logo|titleScene */
    has(kind, id) {
      switch (kind) {
        case 'type': case 'typeDot': return !!TYPE[id];
        case 'status': return STATUS_IDS.includes(id);
        case 'item': return !!reg.item[id];
        case 'badge': return Number.isInteger(id) && id >= 0 && id <= 8;
        case 'emote': return !!reg.emote[id];
        case 'spool': return SPOOL_KINDS.includes(id);
        case 'fx': return !!reg.fx[id];
        case 'logo': return !!reg.logo;
        case 'titleScene': return !!reg.titleScene;
        default: return false;
      }
    },
    /** list(kind) -> ids for that kind. */
    list(kind) {
      switch (kind) {
        case 'type': case 'typeDot': return TYPE_IDS.slice();
        case 'status': return STATUS_IDS.slice();
        case 'item': return itemOrder.slice();
        case 'badge': return [0, 1, 2, 3, 4, 5, 6, 7, 8];
        case 'emote': return Object.keys(reg.emote);
        case 'spool': return SPOOL_KINDS.slice();
        case 'fx': return Object.keys(reg.fx);
        default: return [];
      }
    },
    clearCache() { cache.clear(); },
  });

  I._kit = {
    P, clamp, hsl, tone, ink, ramp, rampOf, towardHue,
    layer, maskOf, fillFn, segDist, capsule, roundRect, starPts, heartFn, rows, fromRows,
    cel, dome, ball, glint, swap, distField, limitColors, finish, stats,
    TYPE, TYPE_IDS, reg, addItem, cached,
  };
})(typeof globalThis !== 'undefined' ? globalThis : window);
