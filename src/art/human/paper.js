/* src/art/human/paper.js — palettes, hue-shifted ramps and the layered "paper" canvas used by the human sprite generator.
 *
 * A Paper is a small canvas of *inks* rather than colours: every pixel stores (ramp, tone) plus the id of the part that
 * painted it. Parts are drawn back-to-front with simple primitives / ASCII masks; at the end the paper is resolved to an
 * NP.Bitmap with an automatic 1px outer outline, 15-bit colour and a hard colour budget (closest colours are merged if a
 * sprite would exceed it). The same material names ('skin', 'hair', 'top', ...) are used by the overworld (16×24) and the
 * portrait (64×64) renderers, so one look spec gives one consistent palette at both scales.
 */
(function (root) {
  'use strict';
  const NP = (root.NP = root.NP || {});
  const { Bitmap, Color } = NP;
  NP.art = NP.art || {};
  const HUM = (NP.art.human = NP.art.human || {});
  const L = (HUM._ = HUM._ || {}); // internal toolkit (not part of the public contract)

  // ---------------------------------------------------------------------------------------------------------------
  // Palettes
  // ---------------------------------------------------------------------------------------------------------------

  /** Line colour: a very dark, slightly warm plum. Hue-shifted (never pure black), shared by every human sprite. */
  L.LINE = '#2c1c30';

  /** Skin ramps [deep, shadow, base, light] (hand-tuned: warm, rosy shadows read better on skin than blue ones). */
  L.SKIN = {
    pale: ['#c98f86', '#efbfab', '#fde5d6', '#fff6ee'],
    fair: ['#c07c68', '#e8ac8c', '#f9d4b6', '#fff0de'],
    warm: ['#a86448', '#d6946a', '#efbb8e', '#fbd8b0'],
    tan: ['#8a4e36', '#b87650', '#d9a070', '#ecc294'],
    brown: ['#62341f', '#8a5236', '#ae744e', '#c99268'],
    deep: ['#46231a', '#633726', '#83513a', '#a06c50'],
  };
  L.SKIN_ORDER = ['pale', 'fair', 'warm', 'tan', 'brown', 'deep'];

  /** Named hair colours (base tone; ramps derived). */
  L.HAIR = {
    black: '#34304a', ink: '#282838', brown: '#6e4630', chestnut: '#8e4e2e', auburn: '#b0462e', ginger: '#e0782e',
    copper: '#c8642a', honey: '#e0a848', blonde: '#f2cf6a', platinum: '#f0e6c4', grey: '#9c9cac', iron: '#7c8090',
    silver: '#c4c8dc', white: '#ecebf2', pink: '#f08cb0', rose: '#d8587e', navy: '#34488e', blue: '#4a78d0',
    teal: '#2e9a9c', mint: '#72c8a4', green: '#4e8e46', purple: '#7a50b0', lavender: '#b09ae0', plum: '#6a3a6a',
  };

  /** Named cloth colours (anything else: pass a hex). */
  L.CLOTH = {
    red: '#d8363a', crimson: '#b02234', scarlet: '#e8483a', orange: '#ec7a2e', amber: '#eca232', yellow: '#f2cc40',
    cream: '#f4e6c4', ivory: '#f6f2e6', white: '#f6f4f0', grey: '#9a9aa8', slate: '#5c6478', charcoal: '#3e4050',
    black: '#2e2c3a', navy: '#2e3c74', blue: '#3e6ad0', sky: '#72b0ec', teal: '#2c9294', mint: '#7ccaa6',
    green: '#4a9a48', olive: '#7c8a3a', forest: '#2e6a3e', khaki: '#c4ac72', tan: '#c89a64', brown: '#7c4e30',
    chocolate: '#5a3424', pink: '#f28cb4', rose: '#e0587e', magenta: '#c43c8e', lilac: '#b494e0', purple: '#7648b4',
    plum: '#6a3066', denim: '#4a64a0', wine: '#8a2a44', gold: '#e8b830', silver: '#b8bccc', starch: '#4c7ee0',
  };

  /** Eye (iris) colours for the big sprites. */
  L.EYES = {
    brown: '#7a4a2e', dark: '#4a3040', hazel: '#8a6a2e', amber: '#d08a28', green: '#3e8e4a', teal: '#2a8a90',
    blue: '#3a6ad8', sky: '#4a9ae0', grey: '#6a7088', violet: '#7a4ac0', red: '#c03a3a', pink: '#d0508a', gold: '#c8a020',
  };

  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);

  function towardHue(h, target, amt) {
    const d = ((target - h + 540) % 360) - 180;
    const m = Math.min(Math.abs(d), amt);
    return (h + Math.sign(d) * m + 360) % 360;
  }

  /**
   * 4-tone pixel-art ramp [deep, shadow, base, light] around `base`: shadows cooler (toward violet) and a touch more
   * saturated, highlights warmer. Step sizes adapt to the base lightness so dark and pale materials still get
   * readable tones.
   */
  function ramp(base) {
    const c = Color.parse(base);
    const [h, s, l] = Color.toHSL(c);
    let d1, d2, u1;
    if (l < 0.22) { d1 = 0.06; d2 = 0.1; u1 = 0.13; }
    else if (l < 0.4) { d1 = 0.09; d2 = 0.16; u1 = 0.12; }
    else if (l > 0.86) { d1 = 0.14; d2 = 0.3; u1 = 0.05; }
    else if (l > 0.7) { d1 = 0.13; d2 = 0.27; u1 = 0.08; }
    else { d1 = 0.13; d2 = 0.25; u1 = 0.1; }
    const grey = s < 0.08;
    const sh = (k, dl, ds) => Color.fromHSL(grey ? (h + 250) / 2 : towardHue(h, 255, k), clamp(s + ds, 0, 1), clamp(l - dl, 0.05, 0.97));
    const deep = sh(16, d2, grey ? 0.06 : 0.06);
    const shadow = sh(9, d1, grey ? 0.05 : 0.04);
    const light = Color.fromHSL(grey ? h : towardHue(h, 55, 7), clamp(s - 0.02, 0, 1), clamp(l + u1, 0, 0.98));
    return [deep, shadow, c >>> 0, light];
  }
  L.ramp = ramp;

  /** Resolve a colour reference: a hex, a packed number, or a name from `table` (defaults to CLOTH). */
  function col(v, table) {
    if (v === undefined || v === null) return null;
    if (typeof v === 'number') return v >>> 0;
    if (Array.isArray(v)) return Color.parse(v);
    const s = String(v);
    const t = table || L.CLOTH;
    if (t[s] !== undefined) return Color.parse(t[s]);
    if (L.CLOTH[s] !== undefined) return Color.parse(L.CLOTH[s]);
    if (L.HAIR[s] !== undefined) return Color.parse(L.HAIR[s]);
    return Color.parse(s);
  }
  L.col = col;

  // ---------------------------------------------------------------------------------------------------------------
  // Paper
  // ---------------------------------------------------------------------------------------------------------------

  /**
   * Ink = ramp index * 4 + tone (tone 0 deep, 1 shadow, 2 base, 3 light). Ramp 0 is always the line colour.
   * part ids let later passes find a part's own pixels (edge lines, shading).
   */
  class Paper {
    constructor(w, h) {
      this.w = w;
      this.h = h;
      this.ink = new Int16Array(w * h).fill(-1);
      this.part = new Uint8Array(w * h);
      this.ramps = [];
      this.names = Object.create(null);
      this.partNames = ['none'];
      this.cur = 0;
      this.flip = false; // when true, x is mirrored (x -> w-1-x) for every draw call
      this.addRamp('line', [L.LINE, L.LINE, L.LINE, L.LINE]);
    }

    /** Register a named ramp (4 colours or a base colour to derive a ramp from). Returns the ramp index. */
    addRamp(name, colors) {
      if (!Array.isArray(colors)) colors = ramp(colors);
      const idx = this.ramps.length;
      this.ramps.push(colors.map((c) => Color.parse(c)));
      if (name) this.names[name] = idx;
      return idx;
    }

    /** Material index by name, or by colour (creating an anonymous ramp for new colours). */
    m(nameOrColor) {
      if (typeof nameOrColor === 'number' && nameOrColor < 256 && nameOrColor >= 0 && this.ramps[nameOrColor]) return nameOrColor;
      if (typeof nameOrColor === 'string' && this.names[nameOrColor] !== undefined) return this.names[nameOrColor];
      const c = col(nameOrColor);
      const key = '#' + (c >>> 0).toString(16);
      if (this.names[key] !== undefined) return this.names[key];
      return this.addRamp(key, c);
    }

    /** Start painting a new part; returns its id. */
    begin(name) {
      this.partNames.push(name || 'p' + this.partNames.length);
      this.cur = this.partNames.length - 1;
      return this.cur;
    }

    fx(x) {
      return this.flip ? this.w - 1 - x : x;
    }

    /** Paint one pixel with material `mat` (name/index) and tone (0..3). mat 'line' or tone<0 -> line colour. */
    px(x, y, mat, tone) {
      x = this.fx(x | 0);
      y |= 0;
      if (x < 0 || y < 0 || x >= this.w || y >= this.h) return this;
      const mi = mat === undefined || mat === null ? 0 : this.m(mat);
      const t = mi === 0 ? 2 : tone === undefined ? 2 : tone;
      const i = y * this.w + x;
      this.ink[i] = mi * 4 + t;
      this.part[i] = this.cur;
      return this;
    }

    /** Paint with an explicit ink value (already encoded). */
    pxInk(x, y, ink) {
      x = this.fx(x | 0);
      y |= 0;
      if (x < 0 || y < 0 || x >= this.w || y >= this.h) return this;
      const i = y * this.w + x;
      this.ink[i] = ink;
      this.part[i] = this.cur;
      return this;
    }

    clearPx(x, y) {
      x = this.fx(x | 0);
      y |= 0;
      if (x < 0 || y < 0 || x >= this.w || y >= this.h) return this;
      const i = y * this.w + x;
      this.ink[i] = -1;
      this.part[i] = 0;
      return this;
    }

    get(x, y) {
      x = this.fx(x | 0);
      y |= 0;
      if (x < 0 || y < 0 || x >= this.w || y >= this.h) return -1;
      return this.ink[y * this.w + x];
    }
    /** raw (unflipped) accessors */
    getRaw(x, y) {
      return x < 0 || y < 0 || x >= this.w || y >= this.h ? -1 : this.ink[y * this.w + x];
    }
    partRaw(x, y) {
      return x < 0 || y < 0 || x >= this.w || y >= this.h ? 0 : this.part[y * this.w + x];
    }
    matAt(x, y) {
      const v = this.get(x, y);
      return v < 0 ? -1 : v >> 2;
    }

    rect(x, y, w, h, mat, tone) {
      for (let yy = y; yy < y + h; yy++) for (let xx = x; xx < x + w; xx++) this.px(xx, yy, mat, tone);
      return this;
    }
    hline(x, y, w, mat, tone) {
      return this.rect(x, y, w, 1, mat, tone);
    }
    vline(x, y, h, mat, tone) {
      return this.rect(x, y, 1, h, mat, tone);
    }

    /** Filled ellipse, centre may be fractional (like Bitmap.ellipse). */
    ellipse(cx, cy, rx, ry, mat, tone) {
      const arx = rx + 0.5, ary = ry + 0.5;
      for (let y = Math.floor(cy - ary); y <= Math.ceil(cy + ary); y++) {
        for (let x = Math.floor(cx - arx); x <= Math.ceil(cx + arx); x++) {
          const dx = x - cx, dy = y - cy;
          if ((dx * dx) / (arx * arx) + (dy * dy) / (ary * ary) <= 1) this.px(x, y, mat, tone);
        }
      }
      return this;
    }

    /** Filled polygon [[x,y],...] sampled at pixel centres (even-odd). */
    poly(pts, mat, tone) {
      let minY = Infinity, maxY = -Infinity;
      for (const p of pts) { minY = Math.min(minY, p[1]); maxY = Math.max(maxY, p[1]); }
      const n = pts.length;
      for (let y = Math.floor(minY); y <= Math.ceil(maxY); y++) {
        const xs = [];
        for (let i = 0; i < n; i++) {
          const a = pts[i], b = pts[(i + 1) % n];
          if ((a[1] <= y && b[1] > y) || (b[1] <= y && a[1] > y)) xs.push(a[0] + ((y - a[1]) / (b[1] - a[1])) * (b[0] - a[0]));
        }
        xs.sort((p, q) => p - q);
        for (let i = 0; i + 1 < xs.length; i += 2) {
          const xa = Math.ceil(xs[i] - 1e-9), xb = Math.floor(xs[i + 1] + 1e-9);
          for (let x = xa; x <= xb; x++) this.px(x, y, mat, tone);
        }
      }
      return this;
    }

    /** Thick-ish line (Bresenham) of width 1. */
    line(x0, y0, x1, y1, mat, tone) {
      x0 = Math.round(x0); y0 = Math.round(y0); x1 = Math.round(x1); y1 = Math.round(y1);
      const dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0);
      const sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
      let err = dx + dy;
      for (;;) {
        this.px(x0, y0, mat, tone);
        if (x0 === x1 && y0 === y1) break;
        const e2 = 2 * err;
        if (e2 >= dy) { err += dy; x0 += sx; }
        if (e2 <= dx) { err += dx; y0 += sy; }
      }
      return this;
    }

    /**
     * Stamp an ASCII mask. `legend` maps a character to [mat, tone] | 'line' | 'erase' | null (skip).
     * ' ' and '.' are always skipped. (ox,oy) = where the mask's (0,0) lands. mirror: flip the mask horizontally
     * about its own width (in addition to the paper-wide flip).
     */
    mask(rows, ox, oy, legend, mirror) {
      let mw = 0;
      for (const r of rows) mw = Math.max(mw, r.length);
      for (let y = 0; y < rows.length; y++) {
        const r = rows[y];
        for (let x = 0; x < r.length; x++) {
          const ch = r[x];
          if (ch === ' ' || ch === '.') continue;
          const v = legend[ch];
          if (v === undefined || v === null) continue;
          const X = ox + (mirror ? mw - 1 - x : x), Y = oy + y;
          if (v === 'erase') this.clearPx(X, Y);
          else if (v === 'line') this.px(X, Y, 0);
          else this.px(X, Y, v[0], v[1]);
        }
      }
      return this;
    }

    /** Pixels (raw coords) of the given part id(s). */
    pixelsOf(parts) {
      const set = Array.isArray(parts) ? parts : [parts];
      const out = [];
      for (let i = 0; i < this.part.length; i++) if (this.ink[i] >= 0 && set.includes(this.part[i])) out.push(i);
      return out;
    }

    /**
     * Cel-shade a part: pixels whose neighbour (dx,dy)*k (k=1..depth) leaves the part get tone `tone`
     * (only pixels currently at tone >= `onlyAbove`). Default: light from top-left -> shadow on the bottom/right.
     */
    shadePart(part, o) {
      o = o || {};
      const dx = o.dx === undefined ? 1 : o.dx, dy = o.dy === undefined ? 1 : o.dy, depth = o.depth || 1;
      const tone = o.tone === undefined ? 1 : o.tone;
      const same = (x, y) => this.partRaw(x, y) === part && this.getRaw(x, y) >= 0;
      const idx = this.pixelsOf(part);
      const hits = [];
      for (const i of idx) {
        const x = i % this.w, y = (i / this.w) | 0;
        let edge = false;
        for (let k = 1; k <= depth && !edge; k++) if (!same(x + dx * k, y + dy * k)) edge = true;
        if (edge) hits.push(i);
      }
      for (const i of hits) {
        const ink = this.ink[i];
        if (ink >> 2 === 0) continue;
        if ((ink & 3) > tone || o.force) this.ink[i] = (ink & ~3) | tone;
      }
      return this;
    }

    /**
     * Internal lines: pixels of `part` that 4-touch an opaque pixel of another part become `ink` (default line).
     * opts.against: only against these part ids; opts.sides: subset of 'lrtb'.
     */
    edgeLine(part, o) {
      o = o || {};
      const sides = o.sides || 'lrtb';
      const ink = o.ink === undefined ? 2 : o.ink;
      const idx = this.pixelsOf(part);
      const hits = [];
      const dirs = [];
      if (sides.includes('l')) dirs.push([-1, 0]);
      if (sides.includes('r')) dirs.push([1, 0]);
      if (sides.includes('t')) dirs.push([0, -1]);
      if (sides.includes('b')) dirs.push([0, 1]);
      for (const i of idx) {
        const x = i % this.w, y = (i / this.w) | 0;
        for (const [ddx, ddy] of dirs) {
          const X = x + ddx, Y = y + ddy;
          const q = this.partRaw(X, Y);
          if (q && q !== part && this.getRaw(X, Y) >= 0 && (!o.against || o.against.includes(q))) { hits.push(i); break; }
        }
      }
      for (const i of hits) this.ink[i] = ink;
      return this;
    }

    /** Resolve to a Bitmap: inks -> colours, auto outer outline (4-neighbour), 15-bit, colour budget. */
    render(o) {
      o = o || {};
      const W = this.w, H = this.h;
      const out = new Bitmap(W, H);
      const lineC = Color.parse(L.LINE);
      for (let i = 0; i < this.ink.length; i++) {
        const v = this.ink[i];
        if (v < 0) continue;
        out.u32[i] = this.ramps[v >> 2][v & 3];
      }
      if (o.outline !== false) {
        const src = this.ink;
        for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
          const i = y * W + x;
          if (src[i] >= 0) continue;
          const n = (xx, yy) => xx >= 0 && yy >= 0 && xx < W && yy < H && src[yy * W + xx] >= 0;
          if (n(x - 1, y) || n(x + 1, y) || n(x, y - 1) || n(x, y + 1)) out.u32[i] = lineC;
        }
      }
      out.quantize15();
      if (o.maxColors) limitColors(out, o.maxColors, Color.q15(lineC));
      return out;
    }
  }
  L.Paper = Paper;

  // ---------------------------------------------------------------------------------------------------------------
  // Colour budget
  // ---------------------------------------------------------------------------------------------------------------

  function dist(a, b) {
    const A = Color.unpack(a), B = Color.unpack(b);
    const rm = (A[0] + B[0]) / 2;
    const dr = A[0] - B[0], dg = A[1] - B[1], db = A[2] - B[2];
    return (2 + rm / 256) * dr * dr + 4 * dg * dg + (2 + (255 - rm) / 256) * db * db;
  }
  L.colorDist = dist;

  /** Merge the closest colour pairs (rarer into more common) until the bitmap has <= max colours. `keep` is never replaced. */
  function limitColors(bmp, max, keep) {
    let cm = bmp.colors();
    let guard = 64;
    while (cm.size > max && guard-- > 0) {
      const cs = [...cm.keys()];
      let best = null, bd = Infinity;
      for (let i = 0; i < cs.length; i++) for (let j = i + 1; j < cs.length; j++) {
        const d = dist(cs[i], cs[j]) * Math.min(cm.get(cs[i]), cm.get(cs[j])) ** 0.25;
        if (d < bd) { bd = d; best = [cs[i], cs[j]]; }
      }
      let [a, b] = best;
      // replace the rarer one (never the protected line colour)
      if (a === keep || (b !== keep && cm.get(a) > cm.get(b))) [a, b] = [b, a];
      bmp.replaceColor(a, b);
      cm = bmp.colors();
    }
    return bmp;
  }
  L.limitColors = limitColors;
})(typeof globalThis !== 'undefined' ? globalThis : window);
