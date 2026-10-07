/* src/art/tiles/kit.js — shared world palette, pixel helpers, autotile geometry and registries for the tile artist.
 *
 * Everything here hangs off NP.art.tiles.kit (internal toolkit for src/art/tiles/*.js). Public API lives in api.js.
 *
 * Autotile geometry ("field"): every 16x16 tile is split into four 8x8 quadrants. Each quadrant looks only at its
 * horizontal neighbour (W/E), vertical neighbour (N/S) and diagonal. From those it gets a per-pixel distance `d` to the
 * region boundary (interior = 99) and the outward boundary normal (nx, ny). Terrains colour pixels from d and the normal,
 * so every one of the 256 masks produces a seamless tile, and all autotile terrains share the same corner shapes.
 */
(function (root) {
  'use strict';
  const NP = (root.NP = root.NP || {});
  const { Bitmap, Color } = NP;
  const art = (NP.art = NP.art || {});
  const tiles = (art.tiles = art.tiles || {});
  const K = (tiles.kit = tiles.kit || {});
  const T = 16;

  // ------------------------------------------------------------------------------------------------ palette
  // One shared world palette so every town, route and room looks designed together.
  // Light comes from the top-left; shadows drift cool (blue/violet), highlights warm (yellow).
  const HEX = {
    // grass (plain ground)
    g0: '#c8f890', g1: '#a0e878', g2: '#80d060', g3: '#60b448', g4: '#44943c', g5: '#2e6c38', g6: '#1e4a30',
    // tall (encounter) grass: darker, bluer, denser
    t0: '#a8e070', t1: '#70c050', t2: '#4c9c40', t3: '#347c3a', t4: '#245c34', t5: '#183e2c',
    // dirt path
    d0: '#fcecc0', d1: '#f0d8a0', d2: '#e0c088', d3: '#c8a070', d4: '#a07c58', d5: '#745840',
    // cobble / pale town stone (warm grey)
    c0: '#fcf8ec', c1: '#e4e0d4', c2: '#c8c4bc', c3: '#a8a4a4', c4: '#84808c', c5: '#5c5868',
    // water
    w0: '#ffffff', w1: '#c0f0ff', w2: '#88d4fc', w3: '#60b4f4', w4: '#4490e0', w5: '#326cc0', w6: '#244c98',
    // foliage (trees, hedges, bushes)
    f0: '#c0f080', f1: '#88d860', f2: '#5cb44c', f3: '#3e9044', f4: '#2c6e40', f5: '#1e5038', f6: '#14342c',
    // bark
    b0: '#dca474', b1: '#b47c4c', b2: '#8c5a3c', b3: '#643e30', b4: '#44282c',
    // wood (planks, furniture, fences)
    o0: '#ffe0a8', o1: '#ecb878', o2: '#d09458', o3: '#aa7044', o4: '#80503a', o5: '#56342e', o6: '#3a2228',
    // plaster / cream walls
    p0: '#fffff4', p1: '#f8f0dc', p2: '#e8dcc0', p3: '#ccbc9c', p4: '#a08c78', p5: '#6c5854', p6: '#44363c',
    // sand
    s0: '#fff8d8', s1: '#fcecb4', s2: '#f0d898', s3: '#dcbc7c', s4: '#bc9864', s5: '#8c6c4c',
    // rock (cliffs, boulders) warm brown-grey
    r0: '#f0e4c8', r1: '#d4c0a0', r2: '#b49c80', r3: '#907864', r4: '#6c584c', r5: '#4a3c3c', r6: '#2e2430',
    // cave (cooler, darker earth)
    v0: '#d8b894', v1: '#bc9874', v2: '#9c7a5c', v3: '#7c5e4c', v4: '#5a4440', v5: '#3c2e34', v6: '#241c24',
    // grey stone (walls, statues, metal)
    n0: '#f4f4f8', n1: '#d4d8e0', n2: '#b0b4c4', n3: '#8c90a4', n4: '#6a6c84', n5: '#4a4a62', n6: '#2c2c40',
    // lantern / warm light
    l0: '#fffcd8', l1: '#fff080', l2: '#ffc848', l3: '#f89030', l4: '#c86028',
    // accent reds / pinks / blues / yellows (cloth, curtains, flowers)
    red0: '#ffb0a0', red1: '#f87868', red2: '#e04848', red3: '#b02c40', red4: '#781c34',
    pk0: '#ffe0f0', pk1: '#ffb4d4', pk2: '#f080b0', pk3: '#c85890', pk4: '#8c3868',
    bl0: '#d8f0ff', bl1: '#98c8ff', bl2: '#6090f0', bl3: '#4068c8', bl4: '#2c4494',
    yl0: '#fffce0', yl1: '#fff098', yl2: '#f8d050', yl3: '#e0a030', yl4: '#a86c24',
    pu0: '#f0e0ff', pu1: '#c8a8f8', pu2: '#9c78e0', pu3: '#7454b8', pu4: '#4c3480',
    ink: '#1c1824', black: '#000000', white: '#ffffff',
  };

  const P = {};
  for (const k in HEX) P[k] = Color.q15(Color.parse(HEX[k]));
  K.HEX = HEX;
  K.P = P;

  /** colour lookup: palette name | '#hex' | packed | [r,g,b] -> packed 15-bit colour */
  function col(c) {
    if (c === null || c === undefined || c === false || c === 0) return 0;
    if (typeof c === 'string' && P[c] !== undefined) return P[c];
    return Color.q15(Color.parse(c));
  }
  K.col = col;
  /** transparent-ish colour (alpha 0..255) */
  K.alpha = (c, a) => Color.withAlpha(col(c), a);

  // Roof / accent ramps [hi, lt, base, mid, dk, outline] — shared by all buildings.
  const ROOFS = {
    red: ['#ffb49c', '#f88070', '#e05450', '#b83848', '#88283c', '#521828'],
    blue: ['#b0d8ff', '#78acf8', '#5484e4', '#3c60c0', '#2c4490', '#1a2658'],
    green: ['#b8f098', '#80d078', '#54ac5c', '#3a8850', '#28643e', '#163c2c'],
    yellow: ['#fff4a8', '#fcd868', '#ecb040', '#c8842c', '#945824', '#5a3418'],
    pink: ['#ffd8ec', '#fcacd0', '#ec80b0', '#c85c90', '#94406c', '#5a2844'],
    gray: ['#eceef4', '#c4c8d4', '#9ca0b4', '#787c94', '#565a70', '#323448'],
    teal: ['#b0f8f0', '#70dcd8', '#40b4bc', '#2c8c9c', '#1e6478', '#123c4c'],
    purple: ['#e8d0ff', '#bc9cf4', '#9474dc', '#7054b8', '#503888', '#2e2054'],
    orange: ['#ffdca8', '#ffb468', '#f48c40', '#cc6430', '#944424', '#5a2818'],
    brown: ['#f0cc9c', '#d4a070', '#b07c50', '#8a5c3c', '#643e30', '#3e2426'],
    navy: ['#a8b8f0', '#7888d8', '#5060b8', '#3a4494', '#2a306c', '#181c40'],
    white: ['#ffffff', '#f4f4f8', '#dcdce8', '#b8bccc', '#8c90a8', '#4c4c64'],
    black: ['#9098b0', '#6c7088', '#50526a', '#3a3a50', '#2a2a3c', '#16141e'],
    mint: ['#e0fff0', '#b0f0d0', '#80d8b0', '#58b490', '#3c8c70', '#205444'],
    lilac: ['#f8e8ff', '#e0c4f8', '#c4a0ec', '#9c7ccc', '#74589c', '#443460'],
    sky: ['#e8f8ff', '#b8e4fc', '#88c8f4', '#5ca4e0', '#3c7cbc', '#224c78'],
    gold: ['#fff8c0', '#fce078', '#ecbc3c', '#c89028', '#946420', '#583a14'],
  };
  K.ROOFS = {};
  for (const k in ROOFS) K.ROOFS[k] = ROOFS[k].map(col);
  /** ramp for a named roof/accent colour: [hi, lt, base, mid, dk, out] */
  K.ramp = (name) => K.ROOFS[name] || K.ROOFS.red;

  // ------------------------------------------------------------------------------------------------ hashing / noise
  /** 32-bit integer hash of up to 3 ints (deterministic, platform independent). */
  function h32(a, b, c) {
    let h = Math.imul((a | 0) ^ 0x9e3779b9, 0x85ebca6b);
    h ^= h >>> 13;
    h = Math.imul(h ^ (b | 0), 0xc2b2ae35);
    h ^= h >>> 16;
    h = Math.imul(h ^ ((c | 0) + 0x27d4eb2f), 0x165667b1);
    h ^= h >>> 15;
    return h >>> 0;
  }
  K.h32 = h32;
  /** hash -> [0,1) */
  K.hf = (a, b, c) => h32(a, b, c) / 4294967296;
  /** seeded RNG (NP.RNG) */
  K.rng = (seed) => new NP.RNG(typeof seed === 'string' ? NP.hash(seed) : seed);
  /** 4x4 Bayer threshold 0..15 */
  const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
  K.bayer = (x, y) => BAYER[(y & 3) * 4 + (x & 3)];
  /** ordered-dither test: true on ~t (0..1) of pixels in a regular pattern */
  K.dith = (x, y, t) => BAYER[(y & 3) * 4 + (x & 3)] < t * 16;

  // ------------------------------------------------------------------------------------------------ bitmap helpers
  K.B = (w, h) => new Bitmap(w, h);
  K.T = T;

  /**
   * ASCII sprite: rows of chars, map char -> colour (palette name / hex / packed). Unmapped chars (and '.' ' ') transparent.
   */
  K.spr = function (rows, map) {
    const pal = {};
    for (const ch in map) pal[ch] = col(map[ch]);
    return Bitmap.fromRows(rows, pal);
  };

  /** Fill a 16x16 (or w x h) bitmap per pixel: fn(x, y) -> colour (packed or name). */
  K.paint = function (w, h, fn) {
    const b = new Bitmap(w, h);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const c = fn(x, y);
      if (c) b.u32[y * w + x] = typeof c === 'number' ? c : col(c);
    }
    return b;
  };

  /** Recolour the edge pixels of the opaque shape (4-neighbour; out of bounds counts as outside). */
  K.edge = function (bmp, color, o) {
    const c = col(color);
    const W = bmp.w, H = bmp.h, src = bmp.u32.slice();
    const op = (x, y) => x >= 0 && y >= 0 && x < W && y < H && src[y * W + x] >>> 24 > 0;
    const skipBottom = o && o.noBottom, skipTop = o && o.noTop;
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      if (!(src[y * W + x] >>> 24)) continue;
      const l = !op(x - 1, y), r = !op(x + 1, y), t = !op(x, y - 1) && !(skipTop && y === 0), b = !op(x, y + 1) && !(skipBottom && y === H - 1);
      if (l || r || t || b) bmp.u32[y * W + x] = c;
    }
    return bmp;
  };

  /** Selective outline: edge pixels become colorMap(originalColour) (keeps material-specific outlines). */
  K.selout = function (bmp, fn) {
    const W = bmp.w, H = bmp.h, src = bmp.u32.slice();
    const op = (x, y) => x >= 0 && y >= 0 && x < W && y < H && src[y * W + x] >>> 24 > 0;
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const c = src[y * W + x];
      if (!(c >>> 24)) continue;
      if (!op(x - 1, y) || !op(x + 1, y) || !op(x, y - 1) || !op(x, y + 1)) {
        const n = fn(c, x, y);
        if (n) bmp.u32[y * W + x] = col(n);
      }
    }
    return bmp;
  };

  /** Soft ground shadow (translucent cool dark) — drawn first, objects on top. */
  const SHADOW = Color.q15(Color.parse('#102438'));
  K.SHADOW_A = 88;
  K.shadow = function (bmp, cx, cy, rx, ry, a) {
    const c = Color.withAlpha(SHADOW, a === undefined ? K.SHADOW_A : a);
    const tmp = new Bitmap(bmp.w, bmp.h);
    tmp.ellipse(cx, cy, rx, ry, c);
    for (let i = 0; i < tmp.u32.length; i++) if (tmp.u32[i] && !(bmp.u32[i] >>> 24)) bmp.u32[i] = tmp.u32[i];
    return bmp;
  };
  /** rectangular translucent shadow (under buildings etc.) */
  K.shadowRect = function (bmp, x, y, w, h, a) {
    const c = Color.withAlpha(SHADOW, a === undefined ? K.SHADOW_A : a);
    for (let yy = y; yy < y + h; yy++) for (let xx = x; xx < x + w; xx++) {
      if (!bmp.inBounds(xx, yy)) continue;
      const i = yy * bmp.w + xx;
      if (!(bmp.u32[i] >>> 24)) bmp.u32[i] = c;
    }
    return bmp;
  };

  /** Blit only where destination is transparent. */
  K.under = function (dst, src, dx, dy) {
    for (let y = 0; y < src.h; y++) for (let x = 0; x < src.w; x++) {
      const c = src.u32[y * src.w + x];
      if (!(c >>> 24)) continue;
      const X = dx + x, Y = dy + y;
      if (X < 0 || Y < 0 || X >= dst.w || Y >= dst.h) continue;
      const i = Y * dst.w + X;
      if (!(dst.u32[i] >>> 24)) dst.u32[i] = c;
    }
    return dst;
  };

  /** Horizontal mirror of an ASCII sprite rows array. */
  K.mirrorRows = (rows) => rows.map((r) => r.split('').reverse().join(''));

  /** Flip bitmap horizontally (new). */
  K.flipX = (b) => b.flippedX();

  // ------------------------------------------------------------------------------------------------ autotile geometry
  const N = 1, NE = 2, E = 4, SE = 8, S = 16, SW = 32, W = 64, NW = 128;
  K.DIR = { N, NE, E, SE, S, SW, W, NW };

  /** Canonical 47-blob reduction: a diagonal only matters when both adjacent orthogonals are the same group. */
  function reduce(m) {
    m &= 255;
    if (!(m & N) || !(m & E)) m &= ~NE;
    if (!(m & S) || !(m & E)) m &= ~SE;
    if (!(m & S) || !(m & W)) m &= ~SW;
    if (!(m & N) || !(m & W)) m &= ~NW;
    return m & 255;
  }
  K.reduce = reduce;
  /** Only the 4 orthogonal bits. */
  K.ortho = (m) => m & (N | E | S | W);
  const ALL47 = [];
  {
    const seen = new Set();
    for (let m = 0; m < 256; m++) {
      const r = reduce(m);
      if (!seen.has(r)) { seen.add(r); ALL47.push(r); }
    }
  }
  K.ALL47 = ALL47;

  const INF = 99;
  const fieldCache = new Map();
  /**
   * Per-pixel distance-to-boundary field for a mask.
   * R = outer corner radius (<= 8). Returns { d, nx, ny } Float32Array(256) each; d = 99 in the interior.
   * nx/ny = outward normal of the nearest boundary (towards the OTHER terrain).
   */
  function field(mask, R) {
    mask = reduce(mask);
    R = R === undefined ? 8 : R;
    const key = mask * 100 + R;
    let f = fieldCache.get(key);
    if (f) return f;
    const d = new Float32Array(256), nx = new Float32Array(256), ny = new Float32Array(256);
    for (let y = 0; y < T; y++) for (let x = 0; x < T; x++) {
      const qx = x < 8 ? 0 : 1, qy = y < 8 ? 0 : 1;
      const u = qx ? T - (x + 0.5) : x + 0.5;
      const v = qy ? T - (y + 0.5) : y + 0.5;
      const sx = qx ? 1 : -1, sy = qy ? 1 : -1;
      const hb = qx ? E : W, vb = qy ? S : N, db = qy ? (qx ? SE : SW) : (qx ? NE : NW);
      const hs = !!(mask & hb), vs = !!(mask & vb), ds = !!(mask & db);
      let dd = INF, ax = 0, ay = 0;
      if (hs && vs) {
        if (!ds) {
          const r = Math.hypot(u, v);
          dd = r;
          ax = (sx * u) / r;
          ay = (sy * v) / r;
        }
      } else if (!hs && !vs) {
        if (u < R && v < R) {
          const du = R - u, dv = R - v, r = Math.hypot(du, dv) || 1e-6;
          dd = R - r;
          ax = (sx * du) / r;
          ay = (sy * dv) / r;
        } else if (u < v) { dd = u; ax = sx; } else { dd = v; ay = sy; }
      } else if (!hs) { dd = u; ax = sx; } else { dd = v; ay = sy; }
      const i = y * T + x;
      d[i] = dd; nx[i] = ax; ny[i] = ay;
    }
    f = { d, nx, ny, mask };
    fieldCache.set(key, f);
    return f;
  }
  K.field = field;
  K.INF = INF;

  /** 16-periodic smooth-ish wobble profile from a seed (values in [-amp, amp]); used to roughen autotile edges. */
  K.profile = function (seed, amp, harmonics) {
    const out = new Float32Array(T);
    const r = K.rng(seed);
    const hs = harmonics || [1, 2, 3];
    const ph = hs.map(() => r.next() * Math.PI * 2), am = hs.map((h, i) => (i === 0 ? 1 : 0.6 / i) * (0.6 + r.next() * 0.4));
    let mx = 0;
    for (let x = 0; x < T; x++) {
      let v = 0;
      hs.forEach((h, i) => { v += am[i] * Math.sin(((x + 0.5) / T) * Math.PI * 2 * h + ph[i]); });
      out[x] = v;
      mx = Math.max(mx, Math.abs(v));
    }
    for (let x = 0; x < T; x++) out[x] = (out[x] / (mx || 1)) * amp;
    return out;
  };

  /** wobbled distance at pixel i using x/y profiles (blend by normal direction) */
  K.wob = function (f, i, px, py) {
    const x = i & 15, y = i >> 4;
    const ny2 = f.ny[i] * f.ny[i], nx2 = f.nx[i] * f.nx[i];
    return f.d[i] + (px ? px[x] * ny2 : 0) + (py ? py[y] * nx2 : 0);
  };

  // ------------------------------------------------------------------------------------------------ registries
  const TERRAIN_DEFAULTS = {
    solid: false, encounter: null, ledge: null, water: false, autotile: false, variants: 1, frames: 1, animSpeed: 16,
    step: 'step', hasOverlay: false,
  };

  /**
   * Register a terrain. def.paint(mask, frame, variant) -> Bitmap 16x16 (mask already reduced for autotiles, 0 otherwise).
   * Optional def.paintOverlay(frame) -> Bitmap|null. Wraps with modulo, quantize and validation.
   */
  K.terrain = function (id, def) {
    const t = Object.assign({}, TERRAIN_DEFAULTS, def);
    if (!t.group) t.group = id;
    const paint = def.paint;
    const reduceFn = def.maskMode === 'ortho' ? K.ortho : reduce;
    delete t.paint;
    delete t.paintOverlay;
    t.draw = function (mask, frame, variant) {
      const m = t.autotile ? reduceFn((mask === undefined ? 255 : mask) & 255) : 0;
      const f = (((frame | 0) % t.frames) + t.frames) % t.frames;
      const v = (((variant | 0) % t.variants) + t.variants) % t.variants;
      const b = paint(m, f, v);
      if (b.w !== T || b.h !== T) throw new Error('terrain ' + id + ' drew ' + b.w + 'x' + b.h);
      return b.quantize15();
    };
    if (def.paintOverlay) {
      t.hasOverlay = true;
      t.drawOverlay = function (frame) {
        const f = (((frame | 0) % t.frames) + t.frames) % t.frames;
        const b = def.paintOverlay(f);
        return b ? b.quantize15() : null;
      };
    } else {
      t.drawOverlay = () => null;
    }
    return NP.reg(NP.terrain, id, t);
  };

  /**
   * Register a stamp. def.paint(variantName, frame) -> Bitmap (w*16 x h*16).
   * variants: array of names. draw(variant, frame) accepts a name or an index.
   */
  K.stamp = function (id, def) {
    const s = Object.assign({ over: 0, layer: 'obj', variants: ['default'], frames: 1, animSpeed: 16 }, def);
    if (!s.solid) {
      s.solid = [];
      for (let y = 0; y < s.h; y++) s.solid.push('#'.repeat(s.w));
    }
    const paint = def.paint;
    delete s.paint;
    s.draw = function (variant, frame) {
      let v = variant;
      if (typeof v === 'number') v = s.variants[((v % s.variants.length) + s.variants.length) % s.variants.length];
      if (v === undefined || v === null || s.variants.indexOf(v) < 0) v = s.variants[0];
      const f = (((frame | 0) % s.frames) + s.frames) % s.frames;
      const b = paint(v, f);
      if (b.w !== s.w * T || b.h !== s.h * T) throw new Error('stamp ' + id + ' drew ' + b.w + 'x' + b.h);
      return b.quantize15();
    };
    return NP.reg(NP.stamps, id, s);
  };

  // Battle backgrounds registry (internal; exposed through NP.art.tiles.battleBg)
  K.battleBgs = K.battleBgs || {};
  K.battleBg = function (id, def) {
    if (K.battleBgs[id]) throw new Error('battleBg duplicate ' + id);
    K.battleBgs[id] = def;
    def.id = id;
    return def;
  };
})(typeof globalThis !== 'undefined' ? globalThis : window);
