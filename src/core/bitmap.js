/* NP.Bitmap — the one pixel surface used by everything (sprites, tiles, the 240x160 framebuffer).
 *
 * RGBA, 8 bits per channel, stored in a Uint8ClampedArray with a Uint32Array view
 * (`u32`, packed 0xAABBGGRR — see NP.Color). Works identically in the browser and in Node,
 * so art can be rendered headlessly to PNG and the whole game can run without a canvas.
 *
 * Coordinates: pixel (x,y) has its centre at integer coordinates; (0,0) is top-left.
 * Every drawing call clips silently. Colors: anything NP.Color.parse accepts.
 * Methods named `xxxed()`/returning a Bitmap make a NEW bitmap; drawing methods mutate `this`.
 */
(function (root) {
  'use strict';
  const NP = (root.NP = root.NP || {});
  const C = NP.Color;
  const pc = (c) => (typeof c === 'number' ? c >>> 0 : C.parse(c));

  /** src-over compositing of packed colors; aMul (0..1) scales the source alpha. */
  function over(d, s, aMul) {
    let sa = s >>> 24;
    if (aMul !== undefined && aMul !== 1) sa *= aMul;
    if (sa <= 0) return d;
    if (sa >= 255) return s >>> 0;
    const da = d >>> 24;
    if (da === 0) return (((Math.round(sa) & 255) << 24) | (s & 0x00ffffff)) >>> 0;
    const a = sa / 255, dA = da / 255, outA = a + dA * (1 - a), k = dA * (1 - a);
    const r = ((s & 255) * a + (d & 255) * k) / outA;
    const g = (((s >>> 8) & 255) * a + ((d >>> 8) & 255) * k) / outA;
    const b = (((s >>> 16) & 255) * a + ((d >>> 16) & 255) * k) / outA;
    return (((Math.round(outA * 255) & 255) << 24) | ((Math.round(b) & 255) << 16) | ((Math.round(g) & 255) << 8) | (Math.round(r) & 255)) >>> 0;
  }

  class Bitmap {
    constructor(w, h) {
      this.w = w | 0;
      this.h = h | 0;
      this.data = new Uint8ClampedArray(this.w * this.h * 4);
      this.u32 = new Uint32Array(this.data.buffer);
    }

    /**
     * Build from ASCII rows. `pal` maps a character to a color (or null = transparent).
     * Characters not in `pal` are transparent. Example:
     *   Bitmap.fromRows(['.aa.', 'abba', '.aa.'], { a: '#f00', b: '#fff' })
     */
    static fromRows(rows, pal) {
      const h = rows.length;
      let w = 0;
      for (const r of rows) w = Math.max(w, r.length);
      const b = new Bitmap(w, h);
      const map = Object.create(null);
      for (const k in pal) map[k] = pc(pal[k]);
      for (let y = 0; y < h; y++) {
        const row = rows[y];
        for (let x = 0; x < row.length; x++) {
          const v = map[row[x]];
          if (v !== undefined) b.u32[y * w + x] = v;
        }
      }
      return b;
    }

    static fromImageData(id) {
      const b = new Bitmap(id.width, id.height);
      b.data.set(id.data);
      return b;
    }

    clone() {
      const b = new Bitmap(this.w, this.h);
      b.u32.set(this.u32);
      return b;
    }

    clear(color) {
      this.u32.fill(color === undefined ? 0 : pc(color));
      return this;
    }

    inBounds(x, y) {
      return x >= 0 && y >= 0 && x < this.w && y < this.h;
    }

    /** packed color at (x,y), 0 when out of bounds */
    get(x, y) {
      return x < 0 || y < 0 || x >= this.w || y >= this.h ? 0 : this.u32[y * this.w + x];
    }

    /** raw set (no blending, replaces alpha too) */
    set(x, y, c) {
      if (x < 0 || y < 0 || x >= this.w || y >= this.h) return this;
      this.u32[y * this.w + x] = pc(c);
      return this;
    }

    /** alpha-blended set (src over dst) */
    px(x, y, c, aMul) {
      if (x < 0 || y < 0 || x >= this.w || y >= this.h) return this;
      const i = y * this.w + x;
      this.u32[i] = over(this.u32[i], pc(c), aMul);
      return this;
    }

    isOpaque(x, y) {
      return x >= 0 && y >= 0 && x < this.w && y < this.h && this.u32[y * this.w + x] >>> 24 > 0;
    }

    fillRect(x, y, w, h, c) {
      c = pc(c);
      const x0 = Math.max(0, x | 0), y0 = Math.max(0, y | 0);
      const x1 = Math.min(this.w, (x | 0) + (w | 0)), y1 = Math.min(this.h, (y | 0) + (h | 0));
      for (let yy = y0; yy < y1; yy++) this.u32.fill(c, yy * this.w + x0, yy * this.w + x1);
      return this;
    }

    /** alpha-blended rect (for fades / shadows) */
    blendRect(x, y, w, h, c, aMul) {
      c = pc(c);
      const x0 = Math.max(0, x | 0), y0 = Math.max(0, y | 0);
      const x1 = Math.min(this.w, (x | 0) + (w | 0)), y1 = Math.min(this.h, (y | 0) + (h | 0));
      for (let yy = y0; yy < y1; yy++) {
        for (let xx = x0; xx < x1; xx++) {
          const i = yy * this.w + xx;
          this.u32[i] = over(this.u32[i], c, aMul);
        }
      }
      return this;
    }

    strokeRect(x, y, w, h, c) {
      if (w <= 0 || h <= 0) return this;
      this.hline(x, y, w, c);
      this.hline(x, y + h - 1, w, c);
      this.vline(x, y, h, c);
      this.vline(x + w - 1, y, h, c);
      return this;
    }

    hline(x, y, w, c) {
      return this.fillRect(x, y, w, 1, c);
    }
    vline(x, y, h, c) {
      return this.fillRect(x, y, 1, h, c);
    }

    line(x0, y0, x1, y1, c) {
      c = pc(c);
      x0 |= 0; y0 |= 0; x1 |= 0; y1 |= 0;
      const dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0);
      const sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
      let err = dx + dy;
      for (;;) {
        this.set(x0, y0, c);
        if (x0 === x1 && y0 === y1) break;
        const e2 = 2 * err;
        if (e2 >= dy) { err += dy; x0 += sx; }
        if (e2 <= dx) { err += dx; y0 += sy; }
      }
      return this;
    }

    /**
     * Ellipse centred on (cx,cy) — centres may be fractional (e.g. 31.5 for an even-width shape).
     * rx/ry are radii in pixels: rx=3 at an integer centre covers 7 pixels.
     */
    ellipse(cx, cy, rx, ry, c, filled) {
      c = pc(c);
      filled = filled !== false;
      const arx = rx + 0.5, ary = ry + 0.5;
      const brx = arx - 1, bry = ary - 1;
      const ring = !filled && brx > 0 && bry > 0;
      const x0 = Math.max(0, Math.floor(cx - arx)), x1 = Math.min(this.w - 1, Math.ceil(cx + arx));
      const y0 = Math.max(0, Math.floor(cy - ary)), y1 = Math.min(this.h - 1, Math.ceil(cy + ary));
      for (let y = y0; y <= y1; y++) {
        for (let x = x0; x <= x1; x++) {
          const dx = x - cx, dy = y - cy;
          if ((dx * dx) / (arx * arx) + (dy * dy) / (ary * ary) > 1) continue;
          if (ring && (dx * dx) / (brx * brx) + (dy * dy) / (bry * bry) <= 1) continue;
          this.u32[y * this.w + x] = c;
        }
      }
      return this;
    }

    circle(cx, cy, r, c, filled) {
      return this.ellipse(cx, cy, r, r, c, filled);
    }

    /** Filled polygon, points = [[x,y],...], even-odd rule sampled at pixel centres. */
    polygon(pts, c) {
      c = pc(c);
      let minY = Infinity, maxY = -Infinity;
      for (const p of pts) { if (p[1] < minY) minY = p[1]; if (p[1] > maxY) maxY = p[1]; }
      const n = pts.length;
      for (let y = Math.max(0, Math.floor(minY)); y <= Math.min(this.h - 1, Math.ceil(maxY)); y++) {
        const xs = [];
        for (let i = 0; i < n; i++) {
          const a = pts[i], b = pts[(i + 1) % n];
          if ((a[1] <= y && b[1] > y) || (b[1] <= y && a[1] > y)) xs.push(a[0] + ((y - a[1]) / (b[1] - a[1])) * (b[0] - a[0]));
        }
        xs.sort((p, q) => p - q);
        for (let i = 0; i + 1 < xs.length; i += 2) {
          const xa = Math.max(0, Math.ceil(xs[i] - 1e-9)), xb = Math.min(this.w - 1, Math.floor(xs[i + 1] + 1e-9));
          for (let x = xa; x <= xb; x++) this.u32[y * this.w + x] = c;
        }
      }
      return this;
    }

    /** 4-connected flood fill from (x,y) over pixels equal to the start pixel. */
    flood(x, y, c) {
      c = pc(c);
      if (!this.inBounds(x, y)) return this;
      const target = this.u32[y * this.w + x];
      if (target === c) return this;
      const stack = [x, y];
      while (stack.length) {
        const yy = stack.pop(), xx = stack.pop();
        if (xx < 0 || yy < 0 || xx >= this.w || yy >= this.h) continue;
        const i = yy * this.w + xx;
        if (this.u32[i] !== target) continue;
        this.u32[i] = c;
        stack.push(xx + 1, yy, xx - 1, yy, xx, yy + 1, xx, yy - 1);
      }
      return this;
    }

    /**
     * Draw `src` onto this at (dx,dy), skipping transparent pixels and alpha-blending translucent ones.
     * opts: { flipX, flipY, sx,sy,sw,sh (source rect), alpha (0..1 multiplier),
     *         fill (draw every opaque pixel in this solid color — silhouettes/flashes),
     *         tint + tintAmt (mix each pixel toward a color) }
     */
    blit(src, dx, dy, o) {
      dx |= 0; dy |= 0;
      const sx0 = o && o.sx ? o.sx | 0 : 0, sy0 = o && o.sy ? o.sy | 0 : 0;
      const sw = o && o.sw !== undefined ? o.sw : src.w - sx0;
      const sh = o && o.sh !== undefined ? o.sh : src.h - sy0;
      const fx = !!(o && o.flipX), fy = !!(o && o.flipY);
      const am = o && o.alpha !== undefined ? o.alpha : 1;
      const fill = o && o.fill !== undefined ? pc(o.fill) : null;
      const tint = o && o.tint !== undefined ? pc(o.tint) : null;
      const tintAmt = o && o.tintAmt !== undefined ? o.tintAmt : 1;
      const simple = am === 1 && fill === null && tint === null;
      const dw = this.w, sW = src.w, du = this.u32, su = src.u32;
      const yA = Math.max(0, -dy), yB = Math.min(sh, this.h - dy);
      const xA = Math.max(0, -dx), xB = Math.min(sw, this.w - dx);
      for (let y = yA; y < yB; y++) {
        const sy = (fy ? sy0 + sh - 1 - y : sy0 + y) * sW;
        const di = (dy + y) * dw + dx;
        for (let x = xA; x < xB; x++) {
          let c = su[sy + (fx ? sx0 + sw - 1 - x : sx0 + x)];
          const a = c >>> 24;
          if (a === 0) continue;
          if (simple) {
            du[di + x] = a === 255 ? c : over(du[di + x], c);
          } else {
            if (fill !== null) c = ((c & 0xff000000) | (fill & 0x00ffffff)) >>> 0;
            if (tint !== null) c = (C.mix(c, tint, tintAmt) & 0x00ffffff | (c & 0xff000000)) >>> 0;
            du[di + x] = over(du[di + x], c, am);
          }
        }
      }
      return this;
    }

    crop(x, y, w, h) {
      const b = new Bitmap(w, h);
      b.blit(this, -x, -y);
      // blit skips transparent pixels which is right for a fresh (transparent) target
      return b;
    }

    /** New bitmap mirrored horizontally. */
    flippedX() {
      const b = new Bitmap(this.w, this.h);
      for (let y = 0; y < this.h; y++) for (let x = 0; x < this.w; x++) b.u32[y * this.w + x] = this.u32[y * this.w + (this.w - 1 - x)];
      return b;
    }
    flippedY() {
      const b = new Bitmap(this.w, this.h);
      for (let y = 0; y < this.h; y++) b.u32.set(this.u32.subarray((this.h - 1 - y) * this.w, (this.h - y) * this.w), y * this.w);
      return b;
    }

    /** New bitmap shifted by (dx,dy), same size, vacated area transparent. */
    shifted(dx, dy) {
      const b = new Bitmap(this.w, this.h);
      b.blit(this, dx, dy);
      return b;
    }

    /** New bitmap with transparent padding added. */
    padded(l, t, r, bt) {
      const b = new Bitmap(this.w + l + r, this.h + t + bt);
      b.blit(this, l, t);
      return b;
    }

    /** Nearest-neighbour integer upscale (for previews). */
    scaled(n) {
      const b = new Bitmap(this.w * n, this.h * n);
      for (let y = 0; y < b.h; y++) {
        const sy = Math.floor(y / n) * this.w;
        for (let x = 0; x < b.w; x++) b.u32[y * b.w + x] = this.u32[sy + Math.floor(x / n)];
      }
      return b;
    }

    /** Bounding box of non-transparent pixels: {x,y,w,h} or null when empty. */
    bbox() {
      let x0 = this.w, y0 = this.h, x1 = -1, y1 = -1;
      for (let y = 0; y < this.h; y++) {
        for (let x = 0; x < this.w; x++) {
          if (this.u32[y * this.w + x] >>> 24) {
            if (x < x0) x0 = x;
            if (x > x1) x1 = x;
            if (y < y0) y0 = y;
            if (y > y1) y1 = y;
          }
        }
      }
      return x1 < 0 ? null : { x: x0, y: y0, w: x1 - x0 + 1, h: y1 - y0 + 1 };
    }

    /**
     * 1px outline. mode 'outer' (default) paints TRANSPARENT pixels touching an opaque pixel
     * (leave a margin in your canvas!); mode 'inner' recolours the edge pixels of the shape itself.
     * opts: { mode, diag (include diagonal neighbours, default false) }
     */
    outline(color, o) {
      const c = pc(color);
      const inner = o && o.mode === 'inner';
      const diag = !!(o && o.diag);
      const src = this.u32.slice();
      const W = this.w, H = this.h;
      const opaque = (x, y) => x >= 0 && y >= 0 && x < W && y < H && src[y * W + x] >>> 24 > 0;
      for (let y = 0; y < H; y++) {
        for (let x = 0; x < W; x++) {
          const here = src[y * W + x] >>> 24 > 0;
          if (inner ? !here : here) continue;
          let hit;
          if (inner) {
            hit = !opaque(x - 1, y) || !opaque(x + 1, y) || !opaque(x, y - 1) || !opaque(x, y + 1) ||
              (diag && (!opaque(x - 1, y - 1) || !opaque(x + 1, y - 1) || !opaque(x - 1, y + 1) || !opaque(x + 1, y + 1)));
          } else {
            hit = opaque(x - 1, y) || opaque(x + 1, y) || opaque(x, y - 1) || opaque(x, y + 1) ||
              (diag && (opaque(x - 1, y - 1) || opaque(x + 1, y - 1) || opaque(x - 1, y + 1) || opaque(x + 1, y + 1)));
          }
          if (hit) this.u32[y * W + x] = c;
        }
      }
      return this;
    }

    /** New bitmap: every opaque pixel replaced by `color` (alpha of the original kept). */
    silhouette(color) {
      const c = pc(color) & 0x00ffffff;
      const b = this.clone();
      for (let i = 0; i < b.u32.length; i++) {
        const a = b.u32[i] >>> 24;
        if (a) b.u32[i] = ((a << 24) | c) >>> 0;
      }
      return b;
    }

    /** Replace every pixel equal to `from` with `to`. */
    replaceColor(from, to) {
      const f = pc(from), t = pc(to);
      for (let i = 0; i < this.u32.length; i++) if (this.u32[i] === f) this.u32[i] = t;
      return this;
    }

    /** fn(packedColor, x, y) -> packed color. Mutates. Skips nothing (transparent pixels included). */
    mapPixels(fn) {
      for (let y = 0; y < this.h; y++) for (let x = 0; x < this.w; x++) {
        const i = y * this.w + x;
        this.u32[i] = pc(fn(this.u32[i], x, y));
      }
      return this;
    }

    /** Snap every pixel to the GBA's 15-bit colour space. */
    quantize15() {
      for (let i = 0; i < this.u32.length; i++) if (this.u32[i] >>> 24) this.u32[i] = C.q15(this.u32[i]);
      return this;
    }

    /** Map of packed opaque colour -> pixel count. */
    colors() {
      const m = new Map();
      for (let i = 0; i < this.u32.length; i++) {
        const c = this.u32[i];
        if (c >>> 24) m.set(c, (m.get(c) || 0) + 1);
      }
      return m;
    }
    countColors() {
      return this.colors().size;
    }

    equals(o) {
      if (!o || o.w !== this.w || o.h !== this.h) return false;
      for (let i = 0; i < this.u32.length; i++) if (this.u32[i] !== o.u32[i]) return false;
      return true;
    }

    // ----- browser-only helpers -----
    toImageData() {
      return new ImageData(new Uint8ClampedArray(this.data), this.w, this.h);
    }
    toCanvas() {
      const cv = document.createElement('canvas');
      cv.width = this.w;
      cv.height = this.h;
      cv.getContext('2d').putImageData(this.toImageData(), 0, 0);
      return cv;
    }
  }

  Bitmap.over = over;
  NP.Bitmap = Bitmap;
})(typeof globalThis !== 'undefined' ? globalThis : window);
