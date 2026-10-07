/* src/art/kigu/canvas.js — KCanvas: the layered "material canvas" every Kigu sprite is painted on.
 *
 * Parts never pick final colours. They paint MATERIALS (named palette ramps: 'main', 'sub', 'hair',
 * 'skin', 'eye', ...) into GROUPS (physical pieces: hood, face, bangs, body, arm, tail ...). Every group
 * is its own layer; groups stack in the order they are begun (later = in front). resolve() then does the
 * pixel-art chores automatically:
 *
 *   1. cel shading per group, computed from the group's OWN full mask (so a body stays correctly shaded
 *      behind an arm): light from the top-left -> shadow rim on the bottom-right, optional highlight band
 *      on the top-left, and cast shadows under groups in front that `cast` (bangs on the forehead, head on
 *      the collar...). Pixels painted with an explicit tone are left alone (eyes, hand-placed shines).
 *   2. de-speckle: an auto-shaded pixel whose tone no 4-neighbour of its group shares is absorbed.
 *   3. internal lines: where a group in front meets a group behind, the behind side gets a 1px line
 *      (exactly like an outer outline of the front piece), unless the pair is excluded.
 *   4. colour lookup through the palette ramps (tone -2..2).
 *   5. outer 1px outline around the whole silhouette in the sprite's hue-shifted dark line colour.
 *   6. quantize to 15-bit, then merge nearest colours until the sprite fits its colour budget.
 *
 *   const cv = new KCanvas(64, 64);
 *   cv.begin('body', { shade: 2 });  cv.ell(31.5, 50, 8, 6, 'main');
 *   cv.decal('body', () => cv.ell(31.5, 51, 4, 4, 'sub'));   // belly patch clipped to the body layer
 *   const bmp = cv.resolve(pal, { maxColors: 16 });
 */
(function (root) {
  'use strict';
  const NP = (root.NP = root.NP || {});
  const { Bitmap, Color } = NP;
  NP.art = NP.art || {};
  const K = (NP.art.kigu = NP.art.kigu || {});
  const kit = (K._kit = K._kit || {});

  const FIXED = 1; // tone was set explicitly -> no auto shading
  const NOLINE = 2; // pixel never turns into an internal line (eye highlights, tiny decals)

  // Shadow kernels by depth: a pixel is in shadow when any offset (toward the bottom-right) leaves its group.
  const SHADOW_K = {
    1: [[1, 1]],
    2: [[1, 1], [2, 1], [2, 2]],
    3: [[1, 1], [2, 1], [2, 2], [3, 2], [3, 3]],
    4: [[1, 1], [2, 1], [2, 2], [3, 2], [3, 3], [4, 3]],
  };
  // Shadow that falls on the right side only (tall cylinders: legs, sleeves, hanging hair).
  const SHADOW_R = {
    1: [[1, 0]],
    2: [[1, 0], [2, 0]],
    3: [[1, 0], [2, 0], [3, 0]],
  };
  // Shadow on the bottom only (flat-topped things: brims, skirts' hems).
  const SHADOW_B = {
    1: [[0, 1]],
    2: [[0, 1], [0, 2]],
    3: [[0, 1], [0, 2], [0, 3]],
  };
  const HI_K = {
    1: [[-1, -1]], // rim band hugging the top-left edge
    2: [[-2, -2], [-1, -2], [-2, -1]], // band 1px inside the top-left edge
    3: [[0, -1], [-1, 0]], // full rim on top and left (small round things: bells, orbs)
    4: [[0, -1]], // top rim only (hair shine rows, brims)
  };
  const N4 = [[1, 0], [-1, 0], [0, 1], [0, -1]];

  class KCanvas {
    constructor(w, h) {
      this.w = w;
      this.h = h;
      this.n = w * h;
      this.groups = [];
      this.byName = Object.create(null);
      this.matNames = [];
      this.matIndex = new Map();
      this.cur = null;
      this.target = null; // decal target layer (a group) or null
      this.cutting = false;
      this.flagBits = 0;
      this.limit = null; // optional (x,y) => bool restricting all plotting
    }

    matId(name) {
      let i = this.matIndex.get(name);
      if (i === undefined) {
        i = this.matNames.length;
        this.matNames.push(name);
        this.matIndex.set(name, i);
      }
      return i;
    }

    /**
     * Start a new group/layer (drawn in front of everything so far) and make it current.
     * opts: shade (0..4 shadow depth, default 1), shadeDir ('diag'|'right'|'bottom'), hi (0..4 highlight kernel),
     *       cast (0..3: casts a shadow this many px onto groups behind/below it), recv (receives cast shadows),
     *       line (draw a line on groups behind where they meet, default true), lineMat/lineTone (its colour),
     *       noLineOn: [group names] that never get this group's line, family: groups of one family never
     *       line/shadow each other (e.g. all hood pieces).
     */
    begin(name, o) {
      o = o || {};
      const n = this.n;
      const grp = {
        id: this.groups.length,
        name,
        mat: new Int16Array(n).fill(-1),
        tone: new Int8Array(n),
        flags: new Uint8Array(n),
        shade: o.shade === undefined ? 1 : o.shade,
        shadeDir: o.shadeDir || 'diag',
        hi: o.hi || 0,
        cast: o.cast || 0,
        recv: o.recv !== false,
        line: o.line !== false,
        lineMat: o.lineMat || 'line',
        lineTone: o.lineTone || 0,
        noLineOn: o.noLineOn || null,
        family: o.family || name,
      };
      this.groups.push(grp);
      if (!this.byName[name]) this.byName[name] = grp;
      this.cur = grp;
      return grp;
    }

    group(name) {
      return typeof name === 'string' ? this.byName[name] || null : name;
    }

    // ------------------------------------------------------------------ pixel plumbing
    plot(x, y, mat, tone) {
      x = Math.round(x);
      y = Math.round(y);
      if (x < 0 || y < 0 || x >= this.w || y >= this.h) return;
      if (this.limit && !this.limit(x, y)) return;
      const i = y * this.w + x;
      const grp = this.target || this.cur;
      if (!grp) throw new Error('KCanvas: begin() a group before drawing');
      if (this.cutting) {
        grp.mat[i] = -1;
        grp.flags[i] = 0;
        grp.tone[i] = 0;
        return;
      }
      if (this.target && grp.mat[i] < 0) return; // decals only land on existing pixels
      grp.mat[i] = typeof mat === 'number' ? mat : this.matId(mat);
      if (tone === undefined || tone === null) {
        grp.tone[i] = 0;
        grp.flags[i] = this.flagBits;
      } else {
        grp.tone[i] = tone;
        grp.flags[i] = FIXED | this.flagBits;
      }
    }

    /** Recolour only existing pixels of group `g` (object or name) while fn runs. */
    decal(g, fn) {
      const prev = this.target;
      const grp = this.group(g);
      if (!grp) return;
      this.target = grp;
      try { fn(); } finally { this.target = prev; }
    }
    /** Remove pixels from the current group (or from `g`) while fn runs. */
    cut(fn, g) {
      const pc = this.cutting, pt = this.target;
      this.cutting = true;
      if (g) this.target = this.group(g);
      try { fn(); } finally { this.cutting = pc; this.target = pt; }
    }
    /** Pixels painted while fn runs never turn into internal lines. */
    noLine(fn) {
      const prev = this.flagBits;
      this.flagBits |= NOLINE;
      try { fn(); } finally { this.flagBits = prev; }
    }
    /** Restrict plotting to pixels where pred(x,y) is true while fn runs. */
    within(pred, fn) {
      const prev = this.limit;
      this.limit = prev ? (x, y) => prev(x, y) && pred(x, y) : pred;
      try { fn(); } finally { this.limit = prev; }
    }

    has(g, x, y) {
      const grp = this.group(g);
      if (!grp || x < 0 || y < 0 || x >= this.w || y >= this.h) return false;
      return grp.mat[y * this.w + x] >= 0;
    }
    /** Remove every pixel of group `a` that group `b` covers (used to hollow things out). */
    subtract(a, b) {
      const A = this.group(a), B = this.group(b);
      if (!A || !B) return;
      for (let i = 0; i < this.n; i++) if (B.mat[i] >= 0) A.mat[i] = -1;
    }
    /** Move a whole group layer by (dx,dy). */
    shiftGroup(g, dx, dy) {
      const grp = this.group(g);
      if (!grp) return;
      const W = this.w, H = this.h;
      const m = grp.mat.slice(), t = grp.tone.slice(), f = grp.flags.slice();
      grp.mat.fill(-1);
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
        const i = y * W + x;
        if (m[i] < 0) continue;
        const xx = x + dx, yy = y + dy;
        if (xx < 0 || yy < 0 || xx >= W || yy >= H) continue;
        const j = yy * W + xx;
        grp.mat[j] = m[i]; grp.tone[j] = t[i]; grp.flags[j] = f[i];
      }
    }

    // ------------------------------------------------------------------ primitives (all take mat, tone?)
    ell(cx, cy, rx, ry, mat, tone) {
      if (rx < 0 || ry < 0) return this;
      const arx = rx + 0.5, ary = ry + 0.5;
      const x0 = Math.floor(cx - arx), x1 = Math.ceil(cx + arx);
      const y0 = Math.floor(cy - ary), y1 = Math.ceil(cy + ary);
      for (let y = y0; y <= y1; y++) {
        for (let x = x0; x <= x1; x++) {
          const dx = x - cx, dy = y - cy;
          if ((dx * dx) / (arx * arx) + (dy * dy) / (ary * ary) <= 1.0001) this.plot(x, y, mat, tone);
        }
      }
      return this;
    }
    circ(cx, cy, r, mat, tone) {
      return this.ell(cx, cy, r, r, mat, tone);
    }
    /** Ellipse ring of thickness th (measured inward from the ellipse edge). */
    ring(cx, cy, rx, ry, th, mat, tone) {
      const arx = rx + 0.5, ary = ry + 0.5, brx = arx - th, bry = ary - th;
      for (let y = Math.floor(cy - ary); y <= Math.ceil(cy + ary); y++) {
        for (let x = Math.floor(cx - arx); x <= Math.ceil(cx + arx); x++) {
          const dx = x - cx, dy = y - cy;
          if ((dx * dx) / (arx * arx) + (dy * dy) / (ary * ary) > 1.0001) continue;
          if (brx > 0 && bry > 0 && (dx * dx) / (brx * brx) + (dy * dy) / (bry * bry) <= 1) continue;
          this.plot(x, y, mat, tone);
        }
      }
      return this;
    }
    rect(x, y, w, h, mat, tone) {
      const x0 = Math.round(x), y0 = Math.round(y), x1 = Math.round(x + w), y1 = Math.round(y + h);
      for (let yy = y0; yy < y1; yy++) for (let xx = x0; xx < x1; xx++) this.plot(xx, yy, mat, tone);
      return this;
    }
    /** Filled polygon, even-odd, sampled at pixel centres (same rule as Bitmap.polygon). */
    poly(pts, mat, tone) {
      let minY = Infinity, maxY = -Infinity;
      for (const p of pts) {
        if (p[1] < minY) minY = p[1];
        if (p[1] > maxY) maxY = p[1];
      }
      const n = pts.length;
      for (let y = Math.floor(minY); y <= Math.ceil(maxY); y++) {
        const xs = [];
        for (let i = 0; i < n; i++) {
          const a = pts[i], b = pts[(i + 1) % n];
          if ((a[1] <= y && b[1] > y) || (b[1] <= y && a[1] > y)) xs.push(a[0] + ((y - a[1]) / (b[1] - a[1])) * (b[0] - a[0]));
        }
        xs.sort((p, q) => p - q);
        for (let i = 0; i + 1 < xs.length; i += 2) {
          const xa = Math.ceil(xs[i] - 1e-6), xb = Math.floor(xs[i + 1] + 1e-6);
          for (let x = xa; x <= xb; x++) this.plot(x, y, mat, tone);
        }
      }
      return this;
    }
    line(x0, y0, x1, y1, mat, tone) {
      x0 = Math.round(x0); y0 = Math.round(y0); x1 = Math.round(x1); y1 = Math.round(y1);
      const dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0);
      const sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
      let err = dx + dy;
      for (;;) {
        this.plot(x0, y0, mat, tone);
        if (x0 === x1 && y0 === y1) break;
        const e2 = 2 * err;
        if (e2 >= dy) { err += dy; x0 += sx; }
        if (e2 <= dx) { err += dx; y0 += sy; }
      }
      return this;
    }
    /** Tapered capsule from (x0,y0,r0) to (x1,y1,r1): union of discs. */
    capsule(x0, y0, x1, y1, r0, r1, mat, tone) {
      const d = Math.hypot(x1 - x0, y1 - y0);
      const steps = Math.max(1, Math.ceil(d * 2));
      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const r = r0 + (r1 - r0) * t;
        const x = x0 + (x1 - x0) * t, y = y0 + (y1 - y0) * t;
        if (r < 0.35) this.plot(x, y, mat, tone);
        else this.circ(x, y, r, mat, tone);
      }
      return this;
    }
    /** Point on a 2/3/4-point Bézier. */
    static bez(pts, t) {
      const u = 1 - t;
      if (pts.length === 2) return [pts[0][0] + (pts[1][0] - pts[0][0]) * t, pts[0][1] + (pts[1][1] - pts[0][1]) * t];
      if (pts.length === 3) return [u * u * pts[0][0] + 2 * u * t * pts[1][0] + t * t * pts[2][0], u * u * pts[0][1] + 2 * u * t * pts[1][1] + t * t * pts[2][1]];
      return [
        u * u * u * pts[0][0] + 3 * u * u * t * pts[1][0] + 3 * u * t * t * pts[2][0] + t * t * t * pts[3][0],
        u * u * u * pts[0][1] + 3 * u * u * t * pts[1][1] + 3 * u * t * t * pts[2][1] + t * t * t * pts[3][1],
      ];
    }
    /** Stroke along a 2/3/4-point Bézier with radius r0 -> r1 (or rf(t) -> r). */
    stroke(pts, r0, r1, mat, tone, rf) {
      let len = 0;
      for (let i = 1; i < pts.length; i++) len += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
      const steps = Math.max(2, Math.ceil(len * 2.5));
      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const [x, y] = KCanvas.bez(pts, t);
        const r = rf ? rf(t) : r0 + (r1 - r0) * t;
        if (r < 0.35) this.plot(x, y, mat, tone);
        else this.circ(x, y, r, mat, tone);
      }
      return this;
    }
    /** ASCII stamp. map: char -> [mat, tone?] | 'cut'; other chars are skipped. flip mirrors horizontally. */
    stamp(x, y, rows, map, flip) {
      const w = rows.reduce((a, r) => Math.max(a, r.length), 0);
      for (let j = 0; j < rows.length; j++) {
        const row = rows[j];
        for (let i = 0; i < row.length; i++) {
          const e = map[row[i]];
          if (!e) continue;
          const xx = x + (flip ? w - 1 - i : i), yy = y + j;
          if (e === 'cut') {
            const prev = this.cutting;
            this.cutting = true;
            this.plot(xx, yy);
            this.cutting = prev;
          } else this.plot(xx, yy, e[0], e[1]);
        }
      }
      return this;
    }

    // ------------------------------------------------------------------ resolve to a Bitmap
    /** Index of the top-most group covering each pixel (-1 = empty). */
    composite() {
      const vis = new Int16Array(this.n).fill(-1);
      for (const grp of this.groups) {
        const m = grp.mat;
        for (let i = 0; i < this.n; i++) if (m[i] >= 0) vis[i] = grp.id;
      }
      return vis;
    }

    /**
     * pal: kit.Palette.  o: { maxColors=16, outline=true }
     */
    resolve(pal, o) {
      o = o || {};
      const W = this.w, H = this.h, N = this.n;
      const G = this.groups;
      const g = this.composite();
      const tone = new Int8Array(N);
      const auto = new Uint8Array(N);
      const matAt = (i) => G[g[i]].mat[i];

      // 1. shading
      for (let i = 0; i < N; i++) {
        const gi = g[i];
        if (gi < 0) continue;
        const grp = G[gi];
        if (grp.flags[i] & FIXED) {
          tone[i] = grp.tone[i];
          continue;
        }
        auto[i] = 1;
        const x = i % W, y = (i / W) | 0;
        const mk = grp.mat;
        const inside = (xx, yy) => xx >= 0 && yy >= 0 && xx < W && yy < H && mk[yy * W + xx] >= 0;
        let t = 0;
        if (grp.shade > 0) {
          const tab = grp.shadeDir === 'right' ? SHADOW_R : grp.shadeDir === 'bottom' ? SHADOW_B : SHADOW_K;
          const Kk = tab[Math.min(grp.shade, grp.shadeDir === 'diag' ? 4 : 3)];
          for (let k = 0; k < Kk.length; k++) if (!inside(x + Kk[k][0], y + Kk[k][1])) { t = -1; break; }
        }
        if (t === 0 && grp.hi) {
          const Kk = HI_K[grp.hi];
          if (grp.hi === 2) {
            if (inside(x - 1, y - 1) && inside(x - 1, y) && inside(x, y - 1)) {
              for (let k = 0; k < Kk.length; k++) if (!inside(x + Kk[k][0], y + Kk[k][1])) { t = 1; break; }
            }
          } else {
            for (let k = 0; k < Kk.length; k++) if (!inside(x + Kk[k][0], y + Kk[k][1])) { t = 1; break; }
          }
        }
        if (grp.recv) {
          // cast shadow from groups in front, falling down / down-right
          outer: for (let d = 1; d <= 3; d++) {
            for (const ox of [0, -1]) {
              const xx = x + ox, yy = y - d;
              if (xx < 0 || yy < 0) continue;
              const hj = g[yy * W + xx];
              if (hj > gi && G[hj].cast >= d && G[hj].family !== grp.family) { t = -1; break outer; }
            }
          }
        }
        tone[i] = t + grp.tone[i];
      }

      // 2. de-speckle auto tones
      for (let pass = 0; pass < 2; pass++) {
        for (let i = 0; i < N; i++) {
          if (!auto[i]) continue;
          const gi = g[i], x = i % W, y = (i / W) | 0, t = tone[i], mi = matAt(i);
          let same = 0, cnt = 0;
          const votes = new Map();
          for (const [ox, oy] of N4) {
            const xx = x + ox, yy = y + oy;
            if (xx < 0 || yy < 0 || xx >= W || yy >= H) continue;
            const j = yy * W + xx;
            if (g[j] !== gi || matAt(j) !== mi) continue;
            cnt++;
            if (tone[j] === t) same++;
            votes.set(tone[j], (votes.get(tone[j]) || 0) + 1);
          }
          if (cnt >= 2 && same === 0) {
            let best = t, bv = -1;
            for (const [k, v] of votes) if (v > bv) { bv = v; best = k; }
            tone[i] = best;
          }
        }
      }

      // 3. internal lines (painted on the BEHIND side of a front group's edge)
      const lineCol = new Uint32Array(N);
      for (let i = 0; i < N; i++) {
        const gi = g[i];
        if (gi < 0 || G[gi].flags[i] & NOLINE) continue;
        const x = i % W, y = (i / W) | 0;
        let best = -1;
        for (const [ox, oy] of N4) {
          const xx = x + ox, yy = y + oy;
          if (xx < 0 || yy < 0 || xx >= W || yy >= H) continue;
          const hj = g[yy * W + xx];
          if (hj <= gi || hj <= best) continue;
          const front = G[hj], back = G[gi];
          if (!front.line || front.family === back.family) continue;
          if (front.noLineOn && front.noLineOn.indexOf(back.name) >= 0) continue;
          best = hj;
        }
        if (best >= 0) lineCol[i] = pal.color(G[best].lineMat, G[best].lineTone);
      }

      // 4. colours
      const tmin = o.toneMin === undefined ? -2 : o.toneMin, tmax = o.toneMax === undefined ? 2 : o.toneMax;
      const out = new Bitmap(W, H);
      for (let i = 0; i < N; i++) {
        if (g[i] < 0) continue;
        out.u32[i] = lineCol[i] || pal.color(this.matNames[matAt(i)], tone[i] < tmin ? tmin : tone[i] > tmax ? tmax : tone[i]);
      }

      // 5. outer outline
      if (o.outline !== false) out.outline(pal.line);

      // 6. 15-bit + colour budget
      out.quantize15();
      const prot = [Color.q15(pal.line)];
      for (const pr of o.protect || []) if (pal.has(pr[0])) prot.push(Color.q15(pal.color(pr[0], pr[1] || 0)));
      limitColors(out, o.maxColors || 16, prot);
      return out;
    }
  }

  // ------------------------------------------------------------------ colour budget
  function lab(c) {
    const [r8, g8, b8] = Color.unpack(c);
    const lin = (v) => {
      v /= 255;
      return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    };
    const r = lin(r8), g = lin(g8), b = lin(b8);
    let X = (r * 0.4124 + g * 0.3576 + b * 0.1805) / 0.95047;
    let Y = r * 0.2126 + g * 0.7152 + b * 0.0722;
    let Z = (r * 0.0193 + g * 0.1192 + b * 0.9505) / 1.08883;
    const f = (t) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116);
    X = f(X); Y = f(Y); Z = f(Z);
    return [116 * Y - 16, 500 * (X - Y), 200 * (Y - Z)];
  }
  function labDist(a, b) {
    const A = lab(a), B = lab(b);
    return Math.hypot(A[0] - B[0], A[1] - B[1], A[2] - B[2]);
  }

  /** Merge the cheapest colour pairs (close AND rare) until bmp has <= max colours. */
  function limitColors(bmp, max, protect) {
    const prot = new Set((protect || []).map((c) => c >>> 0));
    let cols = bmp.colors();
    while (cols.size > max) {
      const arr = [...cols.entries()];
      let best = null, bestCost = Infinity;
      for (let i = 0; i < arr.length; i++) {
        for (let j = i + 1; j < arr.length; j++) {
          const [ca, na] = arr[i], [cb, nb] = arr[j];
          let cost = labDist(ca, cb) * Math.sqrt(Math.min(na, nb));
          if (prot.has(ca) || prot.has(cb)) cost *= 8;
          if (cost < bestCost) {
            bestCost = cost;
            let from = na < nb ? ca : cb, to = na < nb ? cb : ca;
            if (prot.has(from)) { const t = from; from = to; to = t; }
            best = [from, to];
          }
        }
      }
      bmp.replaceColor(best[0], best[1]);
      cols = bmp.colors();
    }
    return bmp;
  }

  // ------------------------------------------------------------------ palette
  /**
   * Palette: material name -> 5-tone ramp [-2,-1,0,1,2]. Entry forms:
   *   '#rrggbb'                       auto hue-shifted ramp (shadows cooler, highlights warmer)
   *   ['#shadow', '#base', '#light']  explicit (deep/extra tones derived)
   */
  class Palette {
    constructor(entries, line) {
      this.cache = Object.create(null);
      this.entries = Object.assign(Object.create(null), entries);
      this.line = Color.parse(line);
    }
    set(name, v) {
      this.entries[name] = v;
      delete this.cache[name];
    }
    has(name) {
      return name === 'line' || name in this.entries;
    }
    ramp(name) {
      let r = this.cache[name];
      if (r) return r;
      if (name === 'line') r = [this.line, this.line, this.line, this.line, this.line];
      else {
        const e = this.entries[name];
        if (e === undefined) throw new Error('Kigu palette: no material "' + name + '"');
        r = makeRamp(e);
      }
      this.cache[name] = r;
      return r;
    }
    color(name, tone) {
      const r = this.ramp(name);
      tone = tone < -2 ? -2 : tone > 2 ? 2 : tone | 0;
      return r[tone + 2];
    }
  }

  /** 5 tones [-2,-1,0,1,2] from a base colour or an explicit [shadow, base, light] list. */
  function makeRamp(e) {
    if (Array.isArray(e) && typeof e[0] !== 'number') {
      const s = Color.parse(e[0]), b = Color.parse(e[1]), l = Color.parse(e[2] || e[1]);
      const deep = e[3] ? Color.parse(e[3]) : Color.ramp(s, [-1.3])[0];
      const xl = e[4] ? Color.parse(e[4]) : Color.ramp(l, [0.7])[0];
      return [deep, s, b, l, xl];
    }
    const b = Color.parse(e);
    const l = Color.toHSL(b)[2];
    // very light colours need gentler steps up and firmer steps down; dark ones the reverse
    const dk = l > 0.82 ? 1.0 : l < 0.3 ? 0.75 : 1.25;
    const lk = l > 0.82 ? 0.5 : l < 0.3 ? 1.3 : 0.95;
    return Color.ramp(b, [-2.3 * dk, -dk, 0, lk, lk * 1.8]);
  }

  /** Hue-shifted very dark outline colour derived from a material colour. */
  function lineFrom(c, o) {
    o = o || {};
    const [h, s] = Color.toHSL(Color.parse(c));
    const d = ((250 - h + 540) % 360) - 180;
    const hh = h + Math.sign(d) * Math.min(Math.abs(d), o.shift === undefined ? 28 : o.shift);
    return Color.fromHSL(hh, Math.min(0.6, Math.max(0.3, s * 0.55 + 0.12)), o.l === undefined ? 0.14 : o.l);
  }

  kit.KCanvas = KCanvas;
  kit.Palette = Palette;
  kit.makeRamp = makeRamp;
  kit.lineFrom = lineFrom;
  kit.limitColors = limitColors;
  kit.labDist = labDist;
  kit.FIXED = FIXED;
})(typeof globalThis !== 'undefined' ? globalThis : window);
