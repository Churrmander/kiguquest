/* src/art/icons/title.js — the title screen art.
 *
 *   NP.art.icons.logo()       -> Bitmap 200x56, transparent: "KIGU QUEST" in stitched-thread lettering (rope-shaded strokes with a running
 *                                stitch down the middle), a sewn-on button, a loop of thread and a needle.
 *   NP.art.icons.titleScene() -> Bitmap 256x192 (NP.W x NP.H), no text: a golden-hour patchwork valley (soft sky, hazy hills, windmill,
 *                                cottages, a road winding in, strung festival lanterns, floating thread ribbons) with the three starters
 *                                (their 96x96 front sprites) standing together bottom-right behind a grassy ridge. Calm zones: logo
 *                                (y 20-76), PRESS START (128,150), the menu box (centred, x 84-172, from y 128) and the tagline (y 180).
 * Same soft, high-key, hazy-depth look as the battle backgrounds: float colour, soft alpha blends, ordered dither into the 15-bit palette.
 * Self-contained (does not need the tile art), deterministic, DOM-free.
 */
(function (root) {
  'use strict';
  const NP = (root.NP = root.NP || {});
  const { Bitmap, Color } = NP;
  const M = Math;                                // local alias: global lookups are slow in the test sandbox's per-pixel loops
  const I = NP.art.icons;
  const K = I._kit;

  // ------------------------------------------------------------------------------------------------ tiny soft-paint helpers
  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  const sstep = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
  const lerp = (a, b, t) => a + (b - a) * t;
  const rgb = (c) => { if (Array.isArray(c)) return c; const p = Color.parse(c); return [p & 255, (p >>> 8) & 255, (p >>> 16) & 255]; };
  const mix = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
  function h32(a, b, c) {
    let h = M.imul((a | 0) ^ 0x9e3779b9, 0x85ebca6b);
    h ^= h >>> 13; h = M.imul(h ^ (b | 0), 0xc2b2ae35);
    h ^= h >>> 16; h = M.imul(h ^ ((c | 0) + 0x27d4eb2f), 0x165667b1);
    h ^= h >>> 15;
    return h >>> 0;
  }
  const hf = (a, b, c) => h32(a, b, c) / 4294967296;
  function noise(x, seed) { const i = M.floor(x), f = x - i, u = f * f * (3 - 2 * f); return hf(i, seed, 11) * (1 - u) + hf(i + 1, seed, 11) * u; }
  function ramp(stops) {
    const S = stops.map((s) => [s[0], rgb(s[1])]), N = 512, lut = [];
    for (let i = 0; i <= N; i++) {
      const t = i / N; let k = 0;
      while (k < S.length - 2 && t > S[k + 1][0]) k++;
      lut.push(mix(S[k][1], S[k + 1][1], clamp((t - S[k][0]) / (S[k + 1][0] - S[k][0] || 1), 0, 1)));
    }
    return (t) => lut[M.round(clamp(t, 0, 1) * N)];
  }
  /** src-over blend of colour c (alpha a) — works on transparent and opaque pixels */
  function px(b, x, y, c, a) {
    x = M.round(x); y = M.round(y);
    if (x < 0 || y < 0 || x >= b.w || y >= b.h || !(a > 0)) return;
    const d = b.data, i = (y * b.w + x) << 2;
    if (a >= 0.999) { d[i] = c[0]; d[i + 1] = c[1]; d[i + 2] = c[2]; d[i + 3] = 255; return; }
    const da = d[i + 3];
    if (da === 255) { d[i] += (c[0] - d[i]) * a; d[i + 1] += (c[1] - d[i + 1]) * a; d[i + 2] += (c[2] - d[i + 2]) * a; return; }
    if (da === 0) { d[i] = c[0]; d[i + 1] = c[1]; d[i + 2] = c[2]; d[i + 3] = a * 255; return; }
    const dA = da / 255, oA = a + dA * (1 - a), k = dA * (1 - a);
    d[i] = (c[0] * a + d[i] * k) / oA; d[i + 1] = (c[1] * a + d[i + 1] * k) / oA; d[i + 2] = (c[2] * a + d[i + 2] * k) / oA; d[i + 3] = oA * 255;
  }
  function glow(b, cx, cy, rx, ry, c, a, pw) {
    c = rgb(c); pw = pw === undefined ? 1.5 : pw;
    for (let y = M.max(0, M.floor(cy - ry)); y <= M.min(b.h - 1, M.ceil(cy + ry)); y++) for (let x = M.max(0, M.floor(cx - rx)); x <= M.min(b.w - 1, M.ceil(cx + rx)); x++) {
      const dx = (x + 0.5 - cx) / rx, dy = (y + 0.5 - cy) / ry, q = dx * dx + dy * dy;
      if (q < 1) px(b, x, y, c, a * M.pow(1 - q, pw));
    }
  }
  function poly(b, pts, c, a) {
    const fn = typeof c === 'function' ? c : null, col = fn ? null : rgb(c), n = pts.length;
    let y0 = 1e9, y1 = -1e9;
    for (const p of pts) { if (p[1] < y0) y0 = p[1]; if (p[1] > y1) y1 = p[1]; }
    for (let y = M.floor(y0); y <= M.ceil(y1); y++) {
      const yy = y + 0.5, xs = [];
      for (let i = 0; i < n; i++) { const A = pts[i], B = pts[(i + 1) % n]; if ((A[1] <= yy && B[1] > yy) || (B[1] <= yy && A[1] > yy)) xs.push(A[0] + ((yy - A[1]) / (B[1] - A[1])) * (B[0] - A[0])); }
      xs.sort((p, q) => p - q);
      for (let k = 0; k + 1 < xs.length; k += 2) for (let x = M.ceil(xs[k] - 0.5); x <= M.floor(xs[k + 1] - 0.5); x++) px(b, x, y, fn ? fn(x, y) : col, a === undefined ? 1 : a);
    }
  }
  const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
  /** ordered dither + snap to the 15-bit palette (alpha untouched) */
  function finish(b) {
    const d = b.data;
    for (let y = 0; y < b.h; y++) for (let x = 0; x < b.w; x++) {
      const i = (y * b.w + x) << 2;
      if (!d[i + 3]) continue;
      const t = (BAYER[(y & 3) * 4 + (x & 3)] + 0.5) * 0.5;
      for (let k = 0; k < 3; k++) { const v5 = M.min(31, (d[i + k] + t) >> 3); d[i + k] = (v5 << 3) | (v5 >> 2); }
    }
    return b;
  }

  // ================================================================================================ the logo
  const LH = 21, LR = 3.3, SLANT = 0.09;
  const arc = (cx, cy, rx, ry, a0, a1) => {
    const n = M.max(4, M.ceil(M.abs(a1 - a0) / 10)), pts = [];
    for (let i = 0; i <= n; i++) { const t = ((a0 + ((a1 - a0) * i) / n) * M.PI) / 180; pts.push([cx + rx * M.cos(t), cy + ry * M.sin(t)]); }
    return pts;
  };
  // stroke skeletons (centre lines) in a box x 0..w, y 0..21
  const GLYPH = {
    K: { w: 12, s: [[[0, 0], [0, 21]], [[0.5, 12.4], [12, 0]], [[3.8, 9.4], [12.8, 21]]] },
    I: { w: 0, s: [[[0, 0], [0, 21]]] },
    G: { w: 13, s: [arc(6.5, 10.5, 6.5, 10.5, -38, -322), [[12.4, 16.2], [12.4, 11.4], [7.4, 11.4]]] },
    U: { w: 12, s: [[[0, 0], [0, 14.5]], arc(6, 14.5, 6, 6.5, 180, 0), [[12, 14.5], [12, 0]]] },
    Q: { w: 13, s: [arc(6.5, 10.5, 6.5, 10.5, 0, 360), [[8.6, 15.4], [14, 22.6]]] },
    E: { w: 11, s: [[[0, 0], [0, 21]], [[0, 0], [11, 0]], [[0, 10.5], [9, 10.5]], [[0, 21], [11, 21]]] },
    S: { w: 11, s: [arc(5.5, 5.4, 5.5, 5.4, -28, -270), arc(5.5, 15.6, 5.5, 5.4, -90, 152)] },
    T: { w: 12, s: [[[0, 0], [12, 0]], [[6, 0], [6, 21]]] },
  };
  const WORDS = [
    { text: 'KIGU', dark: '#74163c', base: '#e8445e', light: '#ff8c7a', hi: '#ffe2c4', ink: '#3a0f2c' },
    { text: 'QUEST', dark: '#162f84', base: '#3e84ea', light: '#84c4ff', hi: '#e0f4ff', ink: '#0e1c56' },
  ];

  /** a sewn-on 4-hole button, dome-shaded, with crossed thread */
  function button(b, cx, cy, r, base, thread) {
    const R = [rgb(base[0]), rgb(base[1]), rgb(base[2])];   // dark, base, light
    for (let y = M.floor(cy - r - 2); y <= M.ceil(cy + r + 2); y++) for (let x = M.floor(cx - r - 2); x <= M.ceil(cx + r + 2); x++) {
      const dx = x + 0.5 - cx, dy = y + 0.5 - cy, q = M.hypot(dx, dy);
      if (q > r + 1.2) continue;
      if (q > r + 0.1) { px(b, x, y, [40, 18, 40], clamp(r + 1.2 - q, 0, 1) * 0.9); continue; }
      const nx = dx / r, ny = dy / r, nz = M.sqrt(M.max(0, 1 - nx * nx - ny * ny));
      let it = clamp(0.5 + 0.5 * (-0.55 * nx - 0.65 * ny) * (1 - nz * 0.4) + 0.2 * nz, 0, 1);
      const ring = M.abs(q - r * 0.66) < 0.55;
      if (ring) it = clamp(it - 0.28, 0, 1);
      let c = it > 0.62 ? mix(R[1], R[2], sstep(0.62, 1, it)) : mix(R[0], R[1], sstep(0.1, 0.62, it));
      px(b, x, y, c, clamp(r + 0.6 - q, 0, 1));
    }
    const o = r * 0.3;
    for (const [sx, sy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) px(b, cx + sx * o - 0.5, cy + sy * o - 0.5, [58, 24, 48], 1);
    const t = rgb(thread);
    for (let k = -1; k <= 1; k += 2) for (let s = -o; s <= o; s += 0.5) { px(b, cx + s * k - 0.5, cy + s - 0.5, t, 0.85); }
    for (const [sx, sy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) px(b, cx + sx * o - 0.5, cy + sy * o - 0.5, [88, 40, 64], 0.9);
  }

  /** 4-point sparkle */
  function sparkle(b, x, y, r, c) {
    c = rgb(c || '#fffbea');
    glow(b, x, y, r * 1.5, r * 1.5, c, 0.5, 1.4);
    for (let k = -r; k <= r; k += 0.5) { const a = 1 - M.abs(k) / (r + 0.5); px(b, x + k, y, c, a); px(b, x, y + k, c, a); }
    px(b, x, y, [255, 255, 255], 1);
  }

  function makeLogo() {
    const LW = 200, LHT = 56;
    const b = new Bitmap(LW, LHT);
    // ---- lay out the glyphs, build a distance field to all stroke centre lines
    const segs = []; // [x0,y0,x1,y1,s0,word,len]
    const topY = 7 + LR + 0.5;
    let penX = 0;
    const placed = [];
    WORDS.forEach((W, wi) => {
      for (const ch of W.text) { const g = GLYPH[ch]; placed.push({ ch, g, wi, x: penX }); penX += g.w + LR * 2 + 1.7; }
      penX += 6.5;
    });
    const total = penX - 6.5 - 1.7 - LR * 2 + LR * 2;
    const x0 = (LW - total) / 2 + LR + 0.5;
    for (const p of placed) {
      let s0 = 0;
      for (const st of p.g.s) {
        for (let i = 0; i + 1 < st.length; i++) {
          const A = st[i], B = st[i + 1];
          const ax = x0 + p.x + A[0] + (LH - A[1]) * SLANT, ay = topY + A[1], bx = x0 + p.x + B[0] + (LH - B[1]) * SLANT, by = topY + B[1];
          const len = M.hypot(bx - ax, by - ay);
          segs.push([ax, ay, bx, by, s0, p.wi, len, p.ch]);
          s0 += len;
        }
        s0 += 7;
      }
    }
    const N = LW * LHT, dist = new Float32Array(N).fill(99), sv = new Float32Array(N), vx = new Float32Array(N), vy = new Float32Array(N), wd = new Uint8Array(N);
    for (const sg of segs) {
      const [ax, ay, bx, by, s0, wi, len] = sg;
      const ex = bx - ax, ey = by - ay, L2 = ex * ex + ey * ey || 1;
      const xa = M.max(0, M.floor(M.min(ax, bx) - LR - 4)), xb = M.min(LW - 1, M.ceil(M.max(ax, bx) + LR + 4));
      const ya = M.max(0, M.floor(M.min(ay, by) - LR - 4)), yb = M.min(LHT - 1, M.ceil(M.max(ay, by) + LR + 4));
      for (let y = ya; y <= yb; y++) for (let x = xa; x <= xb; x++) {
        const qx = x + 0.5 - ax, qy = y + 0.5 - ay, t = clamp((qx * ex + qy * ey) / L2, 0, 1);
        const dx = qx - ex * t, dy = qy - ey * t, d = M.hypot(dx, dy), i = y * LW + x;
        if (d < dist[i]) { dist[i] = d; sv[i] = s0 + t * len; vx[i] = dx; vy[i] = dy; wd[i] = wi; }
      }
    }
    const cov = (i, r) => clamp(r + 0.5 - dist[i], 0, 1);
    // ---- soft drop shadow (blurred outline silhouette, offset down-right)
    const sh = new Float32Array(N);
    for (let y = 0; y < LHT; y++) for (let x = 0; x < LW; x++) sh[y * LW + x] = cov(y * LW + x, LR + 1.9);
    for (let y = 0; y < LHT; y++) for (let x = 0; x < LW; x++) {
      let a = 0, n = 0;
      for (let oy = -1; oy <= 1; oy++) for (let ox = -1; ox <= 1; ox++) { const X = x - 1 + ox, Y = y - 2 + oy; if (X >= 0 && Y >= 0 && X < LW && Y < LHT) a += sh[Y * LW + X]; n++; }
      px(b, x, y, [52, 22, 70], (a / n) * 0.42);
    }
    // ---- outline + body
    for (let y = 0; y < LHT; y++) for (let x = 0; x < LW; x++) {
      const i = y * LW + x, W = WORDS[wd[i]];
      const co = cov(i, LR + 1.8);
      if (co <= 0) continue;
      px(b, x, y, rgb(W.ink), co);
    }
    const body = {};
    WORDS.forEach((W, wi) => { body[wi] = ramp([[0, W.dark], [0.3, mix(rgb(W.dark), rgb(W.base), 0.5)], [0.55, W.base], [0.82, W.light], [1, W.hi]]); });
    for (let y = 0; y < LHT; y++) for (let x = 0; x < LW; x++) {
      const i = y * LW + x, W = WORDS[wd[i]];
      const c1 = cov(i, LR);
      if (c1 <= 0) continue;
      const d = dist[i], nx = vx[i] / LR, ny = vy[i] / LR, across = M.min(1, d / LR), h = M.sqrt(M.max(0, 1 - across * across));
      const it = clamp(0.46 + 0.44 * (-0.58 * nx - 0.68 * ny) + 0.2 * h - 0.06, 0, 1);
      let c = body[wd[i]](it);
      // twisted-thread banding across the stroke
      const tw = ((sv[i] * 0.62 + (nx * -ny > 0 ? across : -across) * 0.9) % 1 + 1) % 1;
      if (tw < 0.4) c = mix(c, rgb(W.dark), 0.1);
      // sheen on the upper part of the letters
      c = mix(c, [255, 250, 235], 0.13 * sstep(topY + 12, topY - 3, y));
      // running stitch down the middle
      if (d < 0.72) {
        const ph = sv[i] % 4.8;
        if (ph < 2.9) c = mix(c, [255, 244, 214], 0.94);
        else c = mix(c, rgb(W.dark), 0.25);
      }
      px(b, x, y, c, c1);
    }
    // ---- thread under the lettering: a running stitch from the button, a loop, then the pulled thread running into the needle's eye
    const baseY = 47.5;
    const wave = (x) => baseY + 2.4 * M.sin((x - 18) * 0.085) + 0.01 * (x - 18);
    const tcol = ramp([[0, '#c88a58'], [0.45, '#fff0cc'], [1, '#ffffff']]);
    /** a rope of thread along pts: dark outline, soft shadow, lit core */
    const tube = (pts, r) => {
      for (const p of pts) glow(b, p[0], p[1] + 1.6, r + 1.6, r + 1.2, [70, 26, 80], 0.2, 1);
      for (const p of pts) for (let dy = -r - 1; dy <= r + 1; dy += 0.5) for (let dx = -r - 1; dx <= r + 1; dx += 0.5) if (M.hypot(dx, dy) <= r + 0.95) px(b, p[0] + dx, p[1] + dy, [58, 22, 74], 0.55);
      for (const p of pts) for (let dy = -r; dy <= r; dy += 0.5) for (let dx = -r; dx <= r; dx += 0.5) {
        const q = M.hypot(dx, dy); if (q > r) continue;
        px(b, p[0] + dx, p[1] + dy, tcol(clamp(0.52 - (dx * 0.55 + dy * 0.75) / (r * 1.5), 0, 1)), 1);
      }
    };
    const dashes = [];
    for (let x0 = 21; x0 < 108; x0 += 9.2) { const pts = []; for (let x = x0; x <= M.min(x0 + 6.2, 112); x += 0.5) pts.push([x, wave(x)]); dashes.push(pts); }
    const loopPts = [];
    for (let t = 0; t <= 1.0001; t += 0.012) {
      const a = lerp(M.PI * 0.92, -M.PI * 1.5, t), r = lerp(9.2, 6.6, t);
      loopPts.push([125 + M.cos(a) * r * 1.22, baseY - 4.6 + M.sin(a) * r * 0.84]);
    }
    const eye = [169.2, 51.6];
    const tail = [];
    const t0 = loopPts[loopPts.length - 1];
    for (let t = 0; t <= 1.0001; t += 0.02) tail.push([lerp(t0[0], eye[0], t) + 0.0, lerp(t0[1], eye[1], t) + 3.4 * M.sin(t * M.PI) * (1 - t)]);
    const run = dashes.reduce((a2, d) => a2.concat(d), []);
    for (const d of dashes) tube(d, 1.05);
    tube(loopPts.concat(tail), 1.05);
    // needle: tapered capsule with an eye the thread passes through
    const nx0 = 164.4, ny0 = 54.2, nx1 = 199, ny1 = 36.6;
    const ndx = nx1 - nx0, ndy = ny1 - ny0, nl = M.hypot(ndx, ndy), ux = ndx / nl, uy = ndy / nl;
    const steel = ramp([[0, '#323a7c'], [0.3, '#7686bc'], [0.62, '#c8d6f8'], [1, '#ffffff']]);
    for (let y = M.floor(ny1 - 4); y <= M.ceil(ny0 + 4); y++) for (let x = M.floor(nx0 - 4); x <= M.ceil(nx1 + 4); x++) {
      const qx = x + 0.5 - nx0, qy = y + 0.5 - ny0, t = (qx * ux + qy * uy) / nl, off = qx * -uy + qy * ux;
      if (t < -0.02 || t > 1) continue;
      const r = lerp(3.1, 0.5, M.pow(M.max(0, t), 0.7)), dd = M.abs(off);
      if (dd > r + 1.4) continue;
      if (dd > r) { px(b, x, y, [40, 28, 90], clamp(r + 1.3 - dd, 0, 1)); continue; }
      if (t > 0.045 && t < 0.17 && dd < 1.05) { px(b, x, y, [48, 26, 78], 1); continue; }
      px(b, x, y, steel(clamp(0.58 + (off / r) * -0.5, 0, 1)), 1);
    }
    tube(tail.slice(-6), 1.05);
    // buttons: one sewn at the start of the thread, one tiny near the needle
    button(b, 12.5, baseY - 0.5, 5.3, ['#a8561c', '#f4c34c', '#fff2a8'], '#fff4d8');
    glow(b, 12.5, baseY - 0.5, 9, 7, '#ffe8a8', 0.16, 1);
    // a tiny button sewn into the Q's counter, as if the Q were a buttonhole
    const q = placed.find((p) => p.ch === 'Q');
    button(b, x0 + q.x + 6.5 + (LH - 10.5) * SLANT, topY + 10.4, 2.9, ['#a8561c', '#f4c34c', '#fff2a8'], '#fff4d8');
    // sparkles
    sparkle(b, x0 + placed[0].x - 3, topY - 3.2, 3.2);
    const last = placed[placed.length - 1];
    sparkle(b, x0 + last.x + 16, topY - 3, 2.6);
    sparkle(b, 190, 36.5, 2.2);
    return finish(b);
  }


  // ================================================================================================ the scene
  const jointA = (f, d, hw) => clamp(hw + 0.5 - M.min(f, 1 - f) / d, 0, 1);
  const HAZE = rgb('#ffdcb4'), SUN = { x: 192, y: 121 };

  /** soft stratus streak (overlapping flat glows along a line) */
  function streak(b, cx, cy, rx, ry, seed, c, a) {
    const n = 4 + ((hf(seed, 1, 2) * 3) | 0);
    for (let k = 0; k < n; k++) {
      const t = (k + 0.5) / n, jx = (hf(seed, k, 3) - 0.5) * rx * 0.25, jy = (hf(seed, k, 4) - 0.5) * ry * 0.9;
      glow(b, cx + (t - 0.5) * rx * 1.7 + jx, cy + jy, rx * (0.28 + 0.2 * hf(seed, k, 5)), ry * (0.7 + 0.5 * hf(seed, k, 6)), c, a * (0.6 + 0.4 * hf(seed, k, 7)), 1.1);
    }
  }
  /** flat-bottomed cumulus puff, lit from the sun side */
  function puff(b, cx, cy, w, h, seed, light, shade, a) {
    light = rgb(light); shade = rgb(shade);
    const n = M.max(4, M.round(w / (h * 0.62))), lobes = [];
    for (let k = 0; k < n; k++) {
      const t = (k + 0.5) / n, hh = M.pow(M.sin(M.PI * t), 0.8), r = h * (0.26 + 0.5 * hh) * (0.78 + 0.44 * hf(k, seed, 5));
      lobes.push([cx + (t - 0.5) * w * 0.8 + (hf(k, seed, 6) - 0.5) * 3, cy + h * 0.5 - r * 0.88, r * 1.1, r]);
    }
    const flat = cy + h * 0.5;
    for (let y = M.floor(cy - h * 0.8); y <= M.ceil(cy + h * 0.6); y++) for (let x = M.floor(cx - w / 2 - 3); x <= M.ceil(cx + w / 2 + 3); x++) {
      let best = 0, bi = -1;
      for (let i = 0; i < lobes.length; i++) { const L = lobes[i], dx = (x + 0.5 - L[0]) / L[2], dy = (y + 0.5 - L[1]) / L[3], q = dx * dx + dy * dy; if (q < 1 && 1 - q > best) { best = 1 - q; bi = i; } }
      if (bi < 0) continue;
      const L = lobes[bi], lx = (x + 0.5 - L[0]) / L[2], ly = (y + 0.5 - L[1]) / L[3], under = sstep(flat - h * 0.55, flat + 0.5, y + 0.5);
      const side = clamp((x + 0.5 - cx) / (w * 0.5), -1, 1) * (SUN.x > cx ? 1 : -1);
      const Lt = clamp(0.62 + 0.22 * side - 0.3 * lx * (SUN.x > cx ? -1 : 1) - 0.4 * ly + 0.22 * best - 0.4 * under, 0, 1);
      px(b, x, y, mix(shade, light, sstep(0.16, 0.8, Lt)), sstep(0, 0.18, best) * sstep(flat + 1.2, flat - 0.6, y + 0.5) * a);
    }
  }
  function ridge(b, base, hfn, colorFn, yMax) {
    const tops = [];
    for (let x = 0; x < b.w; x++) {
      const top = base - hfn(x), ti = M.floor(top), fr = top - ti;
      tops.push(top);
      for (let y = M.max(0, ti); y <= (yMax === undefined ? b.h - 1 : yMax); y++) px(b, x, y, colorFn(x, y, y - top), y === ti ? 1 - fr : 1);
    }
    return tops;
  }
  /** one patchwork field colour at a screen pixel of a receding plane (cells = fields; 2x2 supersampled so cell edges are soft; dashed cream stitches along the seams) */
  function fieldColor(x, y, o) {
    const dy0 = y + 0.5 - o.yh;
    if (dy0 < 0.6) return rgb(o.pal[0]);
    let r = 0, g = 0, bl = 0;
    for (let sy = 0; sy < 2; sy++) for (let sx = 0; sx < 2; sx++) {
      const dy = M.max(0.6, y + 0.25 + sy * 0.5 - o.yh), v = o.kz / dy, u = ((x + 0.25 + sx * 0.5 - o.vx) / dy) * o.kx;
      const iu = M.floor(u), iv = M.floor(v), fv = v - iv, hh = hf(iu, iv, o.seed);
      let c = rgb(o.pal[(hh * o.pal.length) | 0]);
      c = mix(c, hh > 0.5 ? [255, 244, 206] : [70, 110, 90], 0.14 * M.abs(hh - 0.5) * 2);
      c = mix(c, [255, 246, 214], 0.1 * (1 - fv));
      r += c[0]; g += c[1]; bl += c[2];
    }
    let c = [r / 4, g / 4, bl / 4];
    if (!o.avg) { const A = [0, 0, 0]; for (const p of o.pal) { const q = rgb(p); A[0] += q[0] / o.pal.length; A[1] += q[1] / o.pal.length; A[2] += q[2] / o.pal.length; } o.avg = A; }
    c = mix(c, o.avg, 0.28);                                                          // calmer patchwork: fields sit close to each other in tone
    c = mix(c, o.avg, M.max(sstep(0.2, 0.42, o.kx / dy0), sstep(0.25, 0.55, o.kz / (dy0 * dy0))));   // fields thinner than ~2px dissolve into their average (no distance noise)
    const v = o.kz / dy0, u = ((x + 0.5 - o.vx) / dy0) * o.kx, fu = u - M.floor(u), fv = v - M.floor(v), du = o.kx / dy0, dv = o.kz / (dy0 * dy0);
    const jf = M.max(jointA(fu, du, 0.5), jointA(fv, dv, 0.5)) * sstep(14, 36, dy0) * sstep(0.5, 0.22, du);
    if (jf > 0 && ((M.round(x) + M.round(y)) & 3) < 2) c = mix(c, [255, 246, 216], 0.55 * jf);
    return c;
  }
  const FIELDS = ['#f2d474', '#a8cc5e', '#7ab85a', '#eaa48e', '#c4acdc', '#88c8ac', '#f6e2a4', '#98c460'];

  function lantern(b, x, y, c, r) {
    glow(b, x, y + 1, r || 6, r || 6, c, 0.46, 1.3);
    poly(b, [[x - 1.5, y - 1.2], [x + 1.5, y - 1.2], [x + 2.1, y + 2], [x - 2.1, y + 2]], mix(rgb(c), [255, 120, 60], 0.35), 1);
    px(b, x - 0.6, y, [255, 246, 190], 1); px(b, x, y - 1.7, [110, 70, 70], 1);
  }
  /** a twisting thread ribbon along a cubic bezier (control points p0..p3): the band narrows and widens like a turning ribbon, fading at both ends */
  function ribbon(b, p, w, c1, c2, phase) {
    c1 = rgb(c1); c2 = rgb(c2);
    const N = 260;
    for (let i = 0; i <= N; i++) {
      const t = i / N, u = 1 - t;
      const x = u * u * u * p[0][0] + 3 * u * u * t * p[1][0] + 3 * u * t * t * p[2][0] + t * t * t * p[3][0];
      const y = u * u * u * p[0][1] + 3 * u * u * t * p[1][1] + 3 * u * t * t * p[2][1] + t * t * t * p[3][1];
      const a = sstep(0, 0.1, t) * sstep(1, 0.86, t), tw = M.sin(t * 17 + phase), ww = w * (0.45 + 0.55 * M.abs(tw));
      for (let dy = -ww; dy <= ww; dy += 0.5) { const k = dy / ww; px(b, x, y + dy, mix(c2, c1, clamp(0.5 - k * 0.45 + (tw > 0 ? 0.2 : -0.12), 0, 1)), a * 0.92); }
      px(b, x, y - ww - 0.3, [255, 250, 236], a * 0.45);
    }
  }

  function windmill(b, x, by, h, hz) {
    const f = (c) => mix(rgb(c), rgb(hz[0]), hz[1]);
    const wall = [f('#fffaee'), f('#f0dcc4'), f('#cfb2b4')], roof = [f('#f89a84'), f('#de6462'), f('#a64862')];
    const top = by - h, wb = h * 0.27, wt = h * 0.16;
    poly(b, [[x - wb, by], [x - wt, top], [x + wt, top], [x + wb, by]], (xx, yy) => { const hw = lerp(wt, wb, clamp((yy + 0.5 - top) / (by - top), 0, 1)), t = (xx + 0.5 - (x - hw)) / (2 * hw); return t < 0.3 ? wall[0] : t < 0.72 ? wall[1] : wall[2]; });
    poly(b, [[x - wt - 1.4, top + 0.5], [x, top - h * 0.3], [x + wt + 1.4, top + 0.5]], (xx) => (xx + 0.5 < x ? roof[0] : roof[2]));
    px(b, x, by - 1, f('#7a5460'), 1); px(b, x - 1, by - 1, f('#7a5460'), 1); px(b, x, by - 2, f('#7a5460'), 1);
    for (const yy of [0.4, 0.62]) { px(b, x, top + h * yy, f('#8ccaf0'), 1); px(b, x - 0.6, top + h * yy, f('#cfeaff'), 1); }
    const hx = x, hy = top - h * 0.02, L = h * 0.92, cloth = ['#fffaf0', '#f6a8bc', '#82d2cc', '#f8dc72'], rot = -0.5;
    for (let k = 0; k < 4; k++) {
      const a = rot + (k * M.PI) / 2, ux = M.cos(a), uy = M.sin(a), nx = -uy, ny = ux;
      const c0 = 0.26, c1 = 0.98, wd = 3.4;
      poly(b, [[hx + ux * L * c0, hy + uy * L * c0], [hx + ux * L * c1, hy + uy * L * c1], [hx + ux * L * c1 + nx * wd, hy + uy * L * c1 + ny * wd], [hx + ux * L * c0 + nx * wd, hy + uy * L * c0 + ny * wd]], f(cloth[k]), 1);
      for (let s = 0; s <= L; s += 0.5) { px(b, hx + ux * s, hy + uy * s, f('#8a6a5a'), 1); }
      for (let s = L * c0; s <= L * c1; s += 3) px(b, hx + ux * s + nx * wd * 0.5, hy + uy * s + ny * wd * 0.5, [255, 250, 236], 0.55);
    }
    glow(b, hx, hy, 2, 2, f('#f0cc98'), 1, 0.5);
  }
  function cottage(b, x, by, w, h, roofC, wallC, hz) {
    const f = (c) => mix(rgb(c), rgb(hz[0]), hz[1]), wall = f(wallC), roof = f(roofC);
    const wl = mix(wall, [255, 244, 214], 0.3), wd = mix(wall, [120, 80, 130], 0.22);
    for (let yy = by - h; yy < by; yy++) for (let xx = x - w / 2; xx < x + w / 2; xx++) px(b, xx, yy, xx < x - w * 0.18 ? wl : xx > x + w * 0.2 ? wd : wall, 1);
    const rh = h * 0.7;
    poly(b, [[x - w / 2 - 1.5, by - h + 0.5], [x, by - h - rh], [x + w / 2 + 1.5, by - h + 0.5]], (xx) => (xx + 0.5 < x ? mix(roof, [255, 220, 190], 0.25) : mix(roof, [90, 40, 90], 0.3)));
    px(b, x + w * 0.28, by - h - rh * 0.55 - 1.5, f('#8a5a60'), 1); px(b, x + w * 0.28, by - h - rh * 0.55 - 2.5, f('#8a5a60'), 1);
    glow(b, x - w * 0.18, by - h * 0.55, 2.2, 2.2, '#ffd478', 0.9, 0.6);
    px(b, x + w * 0.2, by - 1, f('#7a4a4c'), 1); px(b, x + w * 0.2, by - 2, f('#7a4a4c'), 1);
    glow(b, x + w * 0.3, by - h - rh * 0.55 - 6, 3, 4, '#fff4e0', 0.3, 1);
  }

  function makeScene() {
    const W = NP.W || 256, H = NP.H || 192, b = new Bitmap(W, H);
    const HZ = 122;                                                               // the hazy horizon line (sun sits on it)
    // ---- sky
    const sky = ramp([[0, '#566fd0'], [0.24, '#8690de'], [0.46, '#cf9ed2'], [0.64, '#f5b0ac'], [0.8, '#ffd4a4'], [1, '#ffeec0']]);
    for (let y = 0; y < HZ + 14; y++) { const c = sky(y / (HZ + 4)); for (let x = 0; x < W; x++) px(b, x, y, c, 1); }
    glow(b, SUN.x, SUN.y, 128, 88, '#fff0bc', 0.6, 1.5);
    glow(b, SUN.x, SUN.y, 32, 24, '#fffbe8', 0.7, 1.3);
    for (let y = 0; y < HZ; y++) for (let x = 0; x < W; x++) {                    // faint sun rays fanning up from the horizon
      const dx = x + 0.5 - SUN.x, dy = y + 0.5 - SUN.y, d = M.hypot(dx, dy), ang = M.atan2(dy, dx);
      const ray = M.pow(0.5 + 0.5 * M.sin(ang * 13 + 0.4), 2);
      px(b, x, y, [255, 240, 196], 0.085 * ray * sstep(176, 14, d));
    }
    streak(b, 62, 36, 86, 3.8, 31, '#ffdcc8', 0.38);
    streak(b, 200, 30, 74, 3.4, 32, '#ffdcc8', 0.34);
    streak(b, 128, 100, 104, 3.2, 33, '#ffd2b4', 0.5);
    streak(b, 40, 62, 54, 3.2, 34, '#b8a0dc', 0.26);
    streak(b, 214, 78, 58, 3, 35, '#ffd0c4', 0.3);
    puff(b, 40, 110, 60, 13, 41, '#fff0e0', '#c89ac4', 0.9);
    puff(b, 134, 114, 44, 9, 42, '#fff4e4', '#d0a0c4', 0.8);
    // ---- far mountains (lavender haze, warm rim toward the sun)
    const hazeM = rgb('#f6c4be');
    ridge(b, HZ + 4, (x) => 6 + 19 * (0.6 * noise(x * 0.026 + 3, 7) + 0.4 * noise(x * 0.066, 9)), (x, y, d) => mix(mix(rgb('#9b8ccc'), rgb('#c2a8d6'), sstep(0, 2.5, 2.5 - d)), hazeM, 0.34 + 0.4 * sstep(0, 15, d) - 0.1 * sstep(128, 32, M.abs(x - SUN.x))), HZ + 12);
    ridge(b, HZ + 6, (x) => 4 + 10 * (0.6 * noise(x * 0.047 + 11, 5) + 0.4 * noise(x * 0.1, 3)), (x, y, d) => mix(rgb('#b49ccc'), hazeM, 0.3 + 0.5 * sstep(0, 10, d)), HZ + 12);
    // ---- the big right hill with the windmill, and the village at the end of the road
    const hr = (x) => 27 * M.exp(-(((x - 232) / 52) ** 2)) + 10 * M.exp(-(((x - 150) / 46) ** 2)) + 2 * noise(x * 0.09, 17);
    const topsR = ridge(b, HZ + 14, hr, (x, y, d) => {
      let c = fieldColor(x, y, { yh: HZ - 20, vx: 220, kx: 3.8, kz: 116, pal: FIELDS, seed: 5 });
      c = mix(c, [255, 233, 168], 0.42 * sstep(2.4, 0, d));
      return mix(c, [255, 212, 166], 0.1 + 0.18 * sstep(0, 10, d));
    }, HZ + 26);
    windmill(b, 228, topsR[228] + 4, 20, [HAZE, 0.06]);
    for (const [cx, w, h, r, wl] of [[120, 12, 7, '#d8584e', '#fff0d4'], [132, 11, 7, '#4c78c8', '#ffe8cc'], [150, 13, 8, '#e0a040', '#fff2dc'], [163, 12, 7, '#d8584e', '#ffeed4']]) cottage(b, cx, topsR[cx] + 4, w, h, r, wl, [HAZE, 0.16]);
    // ---- the gentle left hill with golden-lime trees
    const hl = (x) => 19 * M.exp(-(((x - 30) / 70) ** 2)) + 2 * noise(x * 0.08, 21);
    const topsL = ridge(b, HZ + 18, hl, (x, y, d) => {
      let c = fieldColor(x, y, { yh: HZ - 16, vx: 64, kx: 3.4, kz: 106, pal: FIELDS, seed: 9 });
      c = mix(c, [255, 233, 168], 0.34 * sstep(2.4, 0, d));
      return mix(c, [255, 206, 170], 0.1 + 0.16 * sstep(0, 10, d));
    }, HZ + 26);
    for (const [tx, th] of [[70, 20], [86, 13], [12, 16]]) {
      const by = topsL[tx] + 5, cy = by - th * 0.62;
      poly(b, [[tx - 1.3, by], [tx - 1.3, by - th * 0.4], [tx + 1.3, by - th * 0.4], [tx + 1.3, by]], '#8a6048', 1);
      for (const [lx, ly, rx, ry] of [[tx - th * 0.2, cy + th * 0.1, th * 0.28, th * 0.24], [tx + th * 0.2, cy + th * 0.12, th * 0.27, th * 0.23], [tx, cy - th * 0.06, th * 0.32, th * 0.27]]) {
        for (let y = M.floor(ly - ry - 1); y <= M.ceil(ly + ry + 1); y++) for (let x = M.floor(lx - rx - 1); x <= M.ceil(lx + rx + 1); x++) {
          const nx = (x + 0.5 - lx) / (rx + 0.4), ny = (y + 0.5 - ly) / (ry + 0.4), q = nx * nx + ny * ny;
          if (q > 1) continue;
          const nz = M.sqrt(1 - q), Lt = clamp(0.34 + 0.46 * nz + 0.32 * nx - 0.4 * ny, 0, 1);
          px(b, x, y, Lt > 0.6 ? mix(rgb('#a8cc50'), rgb('#f4f09a'), sstep(0.6, 0.95, Lt)) : mix(rgb('#3c8452'), rgb('#a8cc50'), sstep(0.2, 0.6, Lt)), 1);
        }
      }
    }
    // ---- the valley floor: big patchwork fields in perspective, fading up into the hills
    const FIELDS2 = ['#f4d676', '#a4ca5c', '#76b458', '#ee9e90', '#c0a8dc', '#8ccaa8', '#f8e4a8', '#9ec662'];
    const VY = HZ - 2, RX = 152;                                                  // valley vanishing line, road's far end
    for (let y = VY + 10; y < H; y++) for (let x = 0; x < W; x++) {
      const c = fieldColor(x, y, { yh: VY, vx: RX, kx: 5.6, kz: 250, pal: FIELDS2, seed: 13 });
      const dy = y - VY;
      px(b, x, y, mix(c, [255, 210, 168], 0.34 * sstep(28, 4, dy)), sstep(VY + 10, VY + 20, y + 0.5));
    }
    // ---- the road winding in from the foreground to the village
    const R0 = VY + 3, RL = H - R0;
    const road = (t) => ({ x: RX - 50 * M.pow(t, 1.15) + 12 * M.sin(t * 3.3) * (1 - t * 0.15), hw: 1.6 + 32 * M.pow(t, 1.2) });
    for (let y = R0; y < H; y++) {
      const t = (y - R0) / RL, r = road(t);
      for (let x = M.floor(r.x - r.hw - 3); x <= M.ceil(r.x + r.hw + 3); x++) {
        const off = M.abs(x + 0.5 - r.x) - r.hw;
        if (off > 2) continue;
        const dy = y - VY, u = ((x + 0.5 - r.x) / dy) * 4.2, v = 400 / dy, iu = M.floor(u), iv = M.floor(v), fu = u - iu, fv = v - iv, du = 4.2 / dy, dv = 400 / (dy * dy);
        let c = mix(rgb('#f8e2b4'), rgb('#e9c690'), sstep(0, 1, t));
        c = mix(c, hf(iu, iv, 3) > 0.5 ? [255, 246, 220] : [196, 150, 120], 0.08 * sstep(3, 14, dy));
        const j = M.max(jointA(fu, du, 0.4), jointA(fv, dv, 0.4)) * sstep(8, 22, dy);
        c = mix(c, [176, 128, 112], 0.2 * j);
        c = mix(c, [255, 236, 190], 0.3 * sstep(0, 0.6, 1 - t) * (1 - sstep(0, 12, M.abs(x - RX))));
        if (off > -1.4 && off <= 0) c = mix(c, [178, 130, 110], 0.55);
        if (off > 0) c = mix(rgb('#9ec662'), [255, 246, 214], 0.45);
        px(b, x, y, c, off > 0 ? clamp(1 - off / 2, 0, 1) * 0.8 : 1);
      }
    }
    // soft haze where the valley meets the hills, and a calm lift behind PRESS START / the menu
    glow(b, RX, VY + 6, 76, 13, '#ffe6bc', 0.5, 1.3);
    glow(b, 128, 152, 84, 16, '#fff0cc', 0.36, 1.1);
    // ---- floating thread ribbons
    ribbon(b, [[-8, 112], [42, 78], [98, 126], [148, 96]], 1.6, '#ff82a6', '#b83a6e', 0);
    ribbon(b, [[-8, 160], [24, 136], [50, 170], [86, 142]], 1.5, '#64d8cc', '#1f7f96', 1.7);
    ribbon(b, [[242, -4], [228, 24], [262, 40], [250, 70]], 1.4, '#ffd866', '#c8841e', 3.1);
    // ---- strung festival lanterns across the top
    const sag = (x) => 3 + 13 * M.sin((clamp(x / W, 0, 1)) * M.PI);
    for (let x = -2; x <= W + 2; x += 0.5) px(b, x, sag(x), [108, 78, 86], 0.8);
    for (let x = 8, k = 0; x < W; x += 16.4, k++) lantern(b, x, sag(x) + 3, ['#ff7a4a', '#ffc24a', '#ff6a8a', '#ffd870'][k % 4], 7);
    for (const [x, y, c] of [[250, 74, '#ffc24a'], [6, 80, '#ff6a8a']]) lantern(b, x, y, c, 5);
    // ---- vignette that holds the tagline
    glow(b, 0, H, 100, 64, '#1c2a52', 0.34, 1.3);
    glow(b, W, H, 100, 64, '#1c2a52', 0.34, 1.3);
    glow(b, 0, 0, 86, 68, '#2a2a78', 0.22, 1.4);
    glow(b, W, 0, 86, 68, '#2a2a78', 0.22, 1.4);
    finish(b);
    // ---- the three starters flank the menu, behind a grassy foreground ridge that hides their feet: Konko on the left, Sprubun a step
    // back and Ottopi in front on the right. Their 96x96 battle sprites (feet at row 94) go on after the dither so their palettes stay exact.
    const crest = (x) => 171 + 2.6 * M.sin(x * 0.045 + 1) - 5 * M.exp(-(((x - 24) / 40) ** 2)) - 3 * M.exp(-(((x - 210) / 46) ** 2)) + 2.4 * noise(x * 0.12, 51);
    const kg = NP.art.kigu, STARTERS = [['konko', 38, 0], ['sprubun', 228, -6], ['ottopi', 196, 0]];   // [id, figure centre x, dy]
    const ok = kg && kg.has && kg.front && STARTERS.every((q) => kg.has(q[0]));
    if (ok) {
      for (const [id, cx, dy] of STARTERS) {
        const spr = kg.front(id);
        let x0 = spr.w, x1 = -1;                                                  // centre the visible figure (tails and ears are lopsided)
        for (let y = 0; y < spr.h; y++) for (let x = 0; x < spr.w; x++) if (spr.u32[y * spr.w + x] >>> 24) { if (x < x0) x0 = x; if (x > x1) x1 = x; }
        const fx = M.round(cx - (x0 + x1 + 1) / 2), fy = M.round(crest(cx) + 9 + dy) - 94;
        glow(b, cx, crest(cx) + 2 + dy, 22, 5, '#1c3a40', 0.3, 1.2);          // soft contact shade on the grass behind the crest
        b.blit(spr, M.max(-x0, M.min(W - x1 - 1, fx)), fy);
      }
    }
    const fg = new Bitmap(W, H);
    for (let x = 0; x < W; x++) {
      const top = crest(x), ti = M.floor(top);
      for (let y = M.max(0, ti); y < H; y++) {
        const d = y + 0.5 - top;
        const c = d < 1.2 ? rgb('#b8e47c') : d < 3.5 ? mix(rgb('#74b45c'), rgb('#46905a'), sstep(1.2, 3.5, d)) : mix(rgb('#38784f'), rgb('#203a56'), sstep(3.5, 15, d));
        px(fg, x, y, c, y === ti ? 1 - (top - ti) : 1);
      }
      if (hf(x, 4, 8) < 0.34) { const hh = 1.5 + hf(x, 5, 8) * 2.4; for (let k = 0; k < hh; k++) px(fg, x, top - 1 - k, k > hh - 1.2 ? rgb('#d0f088') : rgb('#7cc25c'), 1); }
    }
    finish(fg);
    b.blit(fg, 0, 0);
    return b;
  }

  K.reg.logo = makeLogo;
  K.reg.titleScene = makeScene;
})(typeof globalThis !== 'undefined' ? globalThis : window);
