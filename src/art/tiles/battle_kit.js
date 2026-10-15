/* src/art/tiles/battle_kit.js — painter toolkit for the 240x112 battle backgrounds (NP.art.tiles.kit.bb).
 *
 * The backgrounds follow the "late-DS stage" look: a high-key sky gradient with soft cloud bands, a bright haze band at the
 * horizon, a smooth softly lit ground plane, and ONE big oval platform per side (far/upper-right for the foe, near/lower-left for
 * the player). Everything is painted in float RGB with soft alpha blends and finished with a 4x4 ordered dither into the 15-bit
 * palette, so gradients stay smooth without banding. Painters are written as separate layers (sky / ground / platforms) and
 * BB.define() composites them into the registry entry, returning the optional extras { layers, enemyDisc, playerDisc } so the
 * engine can sway / pan the layers later. Light comes from the top-left; no outlines, no pixel noise.
 */
(function (root) {
  'use strict';
  const NP = (root.NP = root.NP || {});
  const { Bitmap, Color } = NP;
  const K = NP.art.tiles.kit;
  const BB = (K.bb = {});
  const W = 240, H = 112;
  BB.W = W; BB.H = H;

  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  const sstep = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
  const lerp = (a, b, t) => a + (b - a) * t;
  BB.clamp = clamp; BB.sstep = sstep; BB.lerp = lerp;
  BB.hf = K.hf;

  // ------------------------------------------------------------------------------------------------ colour ([r,g,b] floats)
  const rgb = (c) => {
    if (Array.isArray(c)) return c;
    const p = Color.parse(c);
    return [p & 255, (p >>> 8) & 255, (p >>> 16) & 255];
  };
  const mix = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
  const COOL = [28, 40, 92], WARM = [255, 246, 214];
  /** hue-shifted tone: k<0 darker + cooler, k>0 lighter + warmer (k in -1..1) */
  const tone = (c, k) => (k < 0 ? mix(rgb(c), COOL, -k) : mix(rgb(c), WARM, k));
  BB.rgb = rgb; BB.mix = mix; BB.tone = tone;

  /** multi-stop gradient: [[t,'#hex'],...] -> fn(t) -> [r,g,b] (shared LUT entries: do not mutate) */
  BB.ramp = function (stops) {
    const S = stops.map((s) => [s[0], rgb(s[1])]);
    const N = 512, lut = new Array(N + 1);
    for (let i = 0; i <= N; i++) {
      const t = i / N;
      let k = 0;
      while (k < S.length - 2 && t > S[k + 1][0]) k++;
      const a = S[k], b = S[k + 1];
      lut[i] = mix(a[1], b[1], clamp((t - a[0]) / (b[0] - a[0] || 1), 0, 1));
    }
    return (t) => lut[Math.round(clamp(t, 0, 1) * N)];
  };

  // ------------------------------------------------------------------------------------------------ noise
  function noise(x, seed) {
    const i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f);
    return K.hf(i, seed | 0, 11) * (1 - u) + K.hf(i + 1, seed | 0, 11) * u;
  }
  /** smooth 1-D noise in [0,1) */
  BB.noise = noise;
  BB.fbm = function (x, seed, oct) {
    let s = 0, a = 1, n = 0, f = 1;
    for (let k = 0; k < (oct || 3); k++) { s += a * noise(x * f, seed + k * 17); n += a; a *= 0.5; f *= 2.03; }
    return s / n;
  };

  /** smooth 2-D value noise in [0,1) */
  BB.noise2 = function (x, y, seed) {
    const ix = Math.floor(x), iy = Math.floor(y), fx = x - ix, fy = y - iy, ux = fx * fx * (3 - 2 * fx), uy = fy * fy * (3 - 2 * fy);
    const a = K.hf(ix, iy, seed), b = K.hf(ix + 1, iy, seed), c = K.hf(ix, iy + 1, seed), d = K.hf(ix + 1, iy + 1, seed);
    return lerp(lerp(a, b, ux), lerp(c, d, ux), uy);
  };

  // ------------------------------------------------------------------------------------------------ pixels
  /** src-over blend of colour c (alpha a 0..1) onto the bitmap (works on transparent and opaque pixels) */
  function px(b, x, y, c, a) {
    x |= 0; y |= 0;
    if (x < 0 || y < 0 || x >= b.w || y >= b.h || !(a > 0)) return;
    const d = b.data, i = (y * b.w + x) << 2;
    if (a >= 0.999) { d[i] = c[0]; d[i + 1] = c[1]; d[i + 2] = c[2]; d[i + 3] = 255; return; }
    const da = d[i + 3];
    if (da === 255) { d[i] += (c[0] - d[i]) * a; d[i + 1] += (c[1] - d[i + 1]) * a; d[i + 2] += (c[2] - d[i + 2]) * a; return; }
    if (da === 0) { d[i] = c[0]; d[i + 1] = c[1]; d[i + 2] = c[2]; d[i + 3] = a * 255; return; }
    const dA = da / 255, oA = a + dA * (1 - a), k = dA * (1 - a);
    d[i] = (c[0] * a + d[i] * k) / oA; d[i + 1] = (c[1] * a + d[i + 1] * k) / oA; d[i + 2] = (c[2] * a + d[i + 2] * k) / oA;
    d[i + 3] = oA * 255;
  }
  BB.px = px;

  /** vertical gradient rows y0..y1-1: fn(y) -> [r,g,b]; soft>0 fades the alpha in over the first `soft` rows (for the ground layer) */
  BB.vgrad = function (b, y0, y1, fn, soft) {
    const d = b.data;
    for (let y = y0; y < y1; y++) {
      const c = fn(y), a = soft ? sstep(0, soft, y - y0 + 0.5) * 255 : 255;
      for (let x = 0; x < b.w; x++) { const i = (y * b.w + x) << 2; d[i] = c[0]; d[i + 1] = c[1]; d[i + 2] = c[2]; d[i + 3] = a; }
    }
  };

  /** per-pixel fill: fn(x,y) -> [r,g,b] | [r,g,b,a] | null (blended) */
  BB.paint = function (b, x0, y0, x1, y1, fn) {
    for (let y = Math.max(0, y0); y < Math.min(b.h, y1); y++) for (let x = Math.max(0, x0); x < Math.min(b.w, x1); x++) {
      const c = fn(x, y);
      if (c) px(b, x, y, c, c.length > 3 ? c[3] : 1);
    }
  };

  /** soft elliptical glow / shadow: alpha falls off smoothly from the centre (pow = falloff sharpness) */
  BB.glow = function (b, cx, cy, rx, ry, c, a, pw) {
    pw = pw === undefined ? 1.5 : pw;
    c = rgb(c);
    const x0 = Math.max(0, Math.floor(cx - rx)), x1 = Math.min(b.w - 1, Math.ceil(cx + rx));
    const y0 = Math.max(0, Math.floor(cy - ry)), y1 = Math.min(b.h - 1, Math.ceil(cy + ry));
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
      const dx = (x + 0.5 - cx) / rx, dy = (y + 0.5 - cy) / ry, q = dx * dx + dy * dy;
      if (q >= 1) continue;
      px(b, x, y, c, a * Math.pow(1 - q, pw));
    }
  };

  /** soft light shaft: a band from (x0,y0) to (x1,y1) whose half-width grows w0 -> w1, smooth across and along */
  BB.shaft = function (b, x0, y0, x1, y1, w0, w1, c, a, o) {
    o = o || {};
    c = rgb(c);
    const len = Math.hypot(x1 - x0, y1 - y0), ux = (x1 - x0) / len, uy = (y1 - y0) / len;
    const xa = Math.max(0, Math.floor(Math.min(x0, x1) - Math.max(w0, w1))), xb = Math.min(b.w - 1, Math.ceil(Math.max(x0, x1) + Math.max(w0, w1)));
    const ya = Math.max(0, Math.floor(Math.min(y0, y1) - 2)), yb = Math.min(b.h - 1, Math.ceil(Math.max(y0, y1) + 2));
    for (let y = ya; y <= yb; y++) for (let x = xa; x <= xb; x++) {
      const px0 = x + 0.5 - x0, py0 = y + 0.5 - y0;
      const t = (px0 * ux + py0 * uy) / len;
      if (t < 0 || t > 1) continue;
      const dist = Math.abs(px0 * -uy + py0 * ux), hw = lerp(w0, w1, t);
      if (dist >= hw) continue;
      const across = Math.pow(1 - dist / hw, o.edge || 1.2);
      const along = (o.fadeIn === undefined ? 0.1 : o.fadeIn) > 0 ? sstep(0, o.fadeIn === undefined ? 0.1 : o.fadeIn, t) : 1;
      const out = sstep(1, o.fadeOut === undefined ? 0.45 : o.fadeOut, t);
      px(b, x, y, c, a * across * along * out);
    }
  };

  /** a soft cloud streak (stratus): a few overlapping flat glows along a line, deterministic from `seed` */
  BB.streak = function (b, cx, cy, rx, ry, seed, c, a) {
    const n = 4 + ((K.hf(seed, 1, 2) * 3) | 0);
    for (let k = 0; k < n; k++) {
      const t = (k + 0.5) / n, jx = (K.hf(seed, k, 3) - 0.5) * rx * 0.25, jy = (K.hf(seed, k, 4) - 0.5) * ry * 0.9;
      const w = rx * (0.28 + 0.2 * K.hf(seed, k, 5)), h = ry * (0.7 + 0.5 * K.hf(seed, k, 6));
      BB.glow(b, cx + (t - 0.5) * rx * 1.7 + jx, cy + jy, w, h, c, a * (0.6 + 0.4 * K.hf(seed, k, 7)), 1.1);
    }
  };

  /** soft cumulus puff: flat-bottomed, each lobe lit from the top-left with a cool shaded underside */
  BB.puff = function (b, cx, cy, w, h, seed, o) {
    o = o || {};
    const light = rgb(o.light || '#ffffff'), shade = rgb(o.shade || '#aebfe8'), A = o.a === undefined ? 0.95 : o.a;
    const n = Math.max(4, Math.round(w / (h * 0.62)));
    const lobes = [];
    for (let k = 0; k < n; k++) {
      const t = (k + 0.5) / n, hh = Math.pow(Math.sin(Math.PI * t), 0.8);
      const r = h * (0.26 + 0.5 * hh) * (0.78 + 0.44 * K.hf(k, seed, 5));
      lobes.push([cx + (t - 0.5) * w * 0.8 + (K.hf(k, seed, 6) - 0.5) * 3, cy + h * 0.5 - r * 0.88, r * 1.1, r]);
    }
    const x0 = Math.floor(cx - w / 2 - 3), x1 = Math.ceil(cx + w / 2 + 3), y0 = Math.floor(cy - h * 0.8), y1 = Math.ceil(cy + h * 0.6);
    const flat = cy + h * 0.5;                                  // the flat underside
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
      let best = 0, bi = -1;
      for (let i = 0; i < lobes.length; i++) {
        const L = lobes[i], dx = (x + 0.5 - L[0]) / L[2], dy = (y + 0.5 - L[1]) / L[3], q = dx * dx + dy * dy;
        if (q < 1 && 1 - q > best) { best = 1 - q; bi = i; }
      }
      if (bi < 0) continue;
      const L = lobes[bi], lx = (x + 0.5 - L[0]) / L[2], ly = (y + 0.5 - L[1]) / L[3];
      const under = sstep(flat - h * 0.55, flat + 0.5, y + 0.5);   // 0 high in the cloud .. 1 at the flat base
      const Lt = clamp(0.7 - 0.26 * lx - 0.42 * ly + 0.22 * best - 0.42 * under, 0, 1);
      const al = sstep(0, o.soft || 0.18, best) * sstep(flat + 1.2, flat - 0.6, y + 0.5) * A;
      px(b, x, y, mix(shade, light, sstep(0.16, 0.8, Lt)), al);
    }
  };

  /** filled polygon (even-odd, no anti-aliasing); c = [r,g,b] or fn(x,y) -> [r,g,b]; a = alpha */
  BB.poly = function (b, pts, c, a) {
    const fn = typeof c === 'function' ? c : null, col = fn ? null : rgb(c), n = pts.length;
    let y0 = 1e9, y1 = -1e9;
    for (const p of pts) { if (p[1] < y0) y0 = p[1]; if (p[1] > y1) y1 = p[1]; }
    for (let y = Math.floor(y0); y <= Math.ceil(y1); y++) {
      const yy = y + 0.5, xs = [];
      for (let i = 0; i < n; i++) {
        const A = pts[i], B = pts[(i + 1) % n];
        if ((A[1] <= yy && B[1] > yy) || (B[1] <= yy && A[1] > yy)) xs.push(A[0] + ((yy - A[1]) / (B[1] - A[1])) * (B[0] - A[0]));
      }
      xs.sort((p, q) => p - q);
      for (let k = 0; k + 1 < xs.length; k += 2) for (let x = Math.ceil(xs[k] - 0.5); x <= Math.floor(xs[k + 1] - 0.5); x++) px(b, x, y, fn ? fn(x, y) : col, a === undefined ? 1 : a);
    }
  };

  /** hazy ridge silhouette. o: { base, h(x), color(x,y,depth) -> rgb, yMax } -> returns the top y of every column */
  BB.ridge = function (b, o) {
    const tops = new Array(b.w);
    const ym = o.yMax === undefined ? b.h - 1 : o.yMax;
    for (let x = 0; x < b.w; x++) {
      const top = o.base - o.h(x), ti = Math.floor(top), fr = top - ti;
      tops[x] = top;
      for (let y = Math.max(0, ti); y <= ym; y++) px(b, x, y, o.color(x, y, y - top), y === ti ? 1 - fr : 1);
    }
    return tops;
  };

  /** smooth rolling height function: base amplitude with two octaves of value noise */
  BB.hills = function (seed, amp, freq, off) {
    return (x) => (off || 0) + amp * (0.62 * noise(x * freq + seed, seed) + 0.38 * noise(x * freq * 2.4 + seed * 3.1, seed + 5));
  };

  /** one sphere-shaded foliage lobe (lit from the top-left): hi/mid/lo are rgb arrays */
  BB.lobe = function (b, lx, ly, rx, ry, hi, mid, lo, a) {
    for (let y = Math.floor(ly - ry - 1); y <= Math.ceil(ly + ry + 1); y++) for (let x = Math.floor(lx - rx - 1); x <= Math.ceil(lx + rx + 1); x++) {
      const nx = (x + 0.5 - lx) / (rx + 0.4), ny = (y + 0.5 - ly) / (ry + 0.4), q = nx * nx + ny * ny;
      if (q > 1) continue;
      const nz = Math.sqrt(1 - q);
      const Lt = clamp(0.32 + 0.48 * nz - 0.3 * nx - 0.4 * ny, 0, 1);
      px(b, x, y, Lt > 0.62 ? mix(mid, hi, sstep(0.62, 0.95, Lt)) : mix(lo, mid, sstep(0.18, 0.62, Lt)), a === undefined ? 1 : a);
    }
  };

  /** chunky lobed tree (lime canopy, darker undersides), lit from the top-left. o: { hi, mid, lo, trunk, haze:[rgb,amt] } */
  BB.tree = function (b, x, baseY, h, o) {
    const hz = o.haze, f = (c) => (hz ? mix(rgb(c), rgb(hz[0]), hz[1]) : rgb(c));
    const hi = f(o.hi || '#d8f070'), mid = f(o.mid || '#8cc84c'), lo = f(o.lo || '#3c8a48'), trunk = f(o.trunk || '#7a5a48');
    const tw = Math.max(1, Math.round(h / 8)), th = Math.max(2, Math.round(h * 0.4));
    for (let yy = 0; yy < th; yy++) for (let xx = 0; xx < tw; xx++) px(b, Math.round(x - tw / 2) + xx, baseY - yy, xx === 0 ? mix(trunk, WARM, 0.2) : trunk, 1);
    const cy = baseY - th - h * 0.33;
    const lobes = [
      [x - h * 0.2, cy + h * 0.14, h * 0.27, h * 0.24], [x + h * 0.22, cy + h * 0.15, h * 0.26, h * 0.23], [x + h * 0.02, cy + h * 0.2, h * 0.3, h * 0.22],
      [x - h * 0.1, cy - h * 0.06, h * 0.27, h * 0.25], [x + h * 0.14, cy - h * 0.1, h * 0.25, h * 0.24],
    ];
    for (const L of lobes) BB.lobe(b, L[0], L[1], L[2], L[3], hi, mid, lo, 1);
  };

  // ------------------------------------------------------------------------------------------------ floor / wall grids
  /**
   * Ground-plane cell painter. Pixels below the horizon `yh` map to plane coordinates u (lateral, converging on vx) and v (depth);
   * cell(b, x, y, iu, iv, fu, fv, du, dv) is called for every pixel (fu/fv = position inside the cell 0..1, du/dv = how many
   * cell fractions one screen pixel spans, so joints can be anti-aliased).
   */
  BB.plane = function (b, o) {
    const yh = o.yh, vx = o.vx === undefined ? W / 2 : o.vx, kx = o.kx, kz = o.kz;
    for (let y = o.y0 === undefined ? Math.ceil(yh + 1) : o.y0; y < (o.y1 === undefined ? b.h : o.y1); y++) {
      const dy = y + 0.5 - yh, v = kz / dy, dv = kz / (dy * dy), du = kx / dy;
      const iv = Math.floor(v), fv = v - iv;
      for (let x = o.x0 || 0; x < (o.x1 === undefined ? b.w : o.x1); x++) {
        const u = ((x + 0.5 - vx) / dy) * kx, iu = Math.floor(u);
        o.cell(b, x, y, iu, iv, u - iu, fv, du, dv);
      }
    }
  };
  /** AA joint strength (0..1) of a cell border of half-width `hw` px: distance (px) from the nearest edge */
  BB.joint = (f, d, hw) => clamp(hw + 0.5 - Math.min(f, 1 - f) / d, 0, 1);

  // ------------------------------------------------------------------------------------------------ platforms
  /**
   * Oval stage platform with a soft halo. (cx,cy) = ellipse centre in bg coordinates, rx/ry radii, o = {
   *   rim:[light,shade], edge:[inner edge colour, centre colour], halo:'#..', haloA, rimT:[sideThickness, topThickness],
   *   feet:{x,y,rx,ry} contact shadow (bg coordinates) }
   * -> { bmp, x, y } (x,y = top-left in bg coordinates).
   */
  BB.platform = function (cx, cy, rx, ry, o) {
    const mx = Math.ceil(rx * 0.2) + 6, my = Math.ceil(ry * 0.8) + 6;
    const bw = 2 * (rx + mx) + 1, bh = 2 * (ry + my) + 1, ox = rx + mx, oy = ry + my;
    const b = new Bitmap(bw, bh);
    const rim = [rgb(o.rim[0]), rgb(o.rim[1])], edge = rgb(o.edge[0]), ctr = rgb(o.edge[1]);
    const rt = o.rimT || [2.6, 1.9];
    // halo (soft shadow towards the bottom-right, plus a faint lift all round)
    BB.glow(b, ox + 2, oy + 3, rx + mx - 1, ry + my - 1, o.halo || '#1c3050', o.haloA === undefined ? 0.34 : o.haloA, 1.7);
    BB.glow(b, ox - 1, oy - 1, rx + 4, ry + 3, o.lift || rim[0], o.liftA === undefined ? 0.12 : o.liftA, 1.4);
    const A = rx + 0.5, B = ry + 0.5, Ai = A - rt[0], Bi = B - rt[1];
    const cover = (dx, dy, a, bb) => {
      const q = (dx * dx) / (a * a) + (dy * dy) / (bb * bb);
      if (q < 1e-9) return 1;
      const sq = Math.sqrt(q), g = Math.sqrt((dx / (a * a)) ** 2 + (dy / (bb * bb)) ** 2) / sq;
      return clamp(0.5 - (sq - 1) / g, 0, 1);
    };
    for (let y = 0; y < bh; y++) for (let x = 0; x < bw; x++) {
      const dx = x - ox, dy = y - oy;
      const c1 = cover(dx, dy, A, B);
      if (c1 <= 0) continue;
      // outward normal -> top-left light on the rim
      const nx = dx / (A * A), ny = dy / (B * B), nl = Math.hypot(nx, ny) || 1;
      const lit = clamp(0.5 - 0.5 * ((nx / nl) * 0.62 + (ny / nl) * 0.78), 0, 1);
      px(b, x, y, mix(rim[1], rim[0], sstep(0.05, 0.95, lit)), c1);
      const c2 = cover(dx, dy, Ai, Bi);
      if (c2 <= 0) continue;
      const qd = Math.sqrt((dx * dx) / (Ai * Ai) + (dy * dy) / (Bi * Bi));
      let c = mix(ctr, edge, Math.pow(clamp(qd, 0, 1), 2.1));
      c = mix(c, rim[0], 0.2 * lit * Math.pow(clamp(qd, 0, 1), 2.4));   // top-left sheen near the edge
      c = mix(c, COOL, 0.16 * clamp(dy / Bi, 0, 1) * (1 - qd));            // slightly deeper toward the front
      px(b, x, y, c, c2);
    }
    if (o.foam) {
      // foam / ripple ring just outside the rim (water stages)
      for (let y = 0; y < bh; y++) for (let x = 0; x < bw; x++) {
        const dx = x - ox, dy = y - oy, sq = Math.sqrt((dx * dx) / (A * A) + (dy * dy) / (B * B));
        const a1 = o.foam * Math.max(0, 1 - Math.abs(sq - 1.09) / 0.085), a2 = o.foam * 0.45 * Math.max(0, 1 - Math.abs(sq - 1.24) / 0.07);
        if (a1 > 0 || a2 > 0) px(b, x, y, [250, 254, 255], Math.max(a1, a2));
      }
    }
    if (o.feet) BB.glow(b, o.feet.x - (cx - ox), o.feet.y - (cy - oy), o.feet.rx, o.feet.ry, o.feetCol || '#0e1c36', o.feetA === undefined ? 0.38 : o.feetA, 1.2);
    return { bmp: b, x: Math.round(cx) - ox, y: Math.round(cy) - oy };
  };

  // ------------------------------------------------------------------------------------------------ finishing
  const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
  /** ordered-dither + snap to the 15-bit palette; (ox,oy) = bitmap origin in bg space so layers share one dither phase */
  BB.finish = function (b, ox, oy) {
    ox = ox | 0; oy = oy | 0;
    const d = b.data;
    for (let y = 0; y < b.h; y++) for (let x = 0; x < b.w; x++) {
      const i = (y * b.w + x) << 2;
      if (!d[i + 3]) continue;
      const t = (BAYER[((y + oy) & 3) * 4 + ((x + ox) & 3)] + 0.5) * 0.5;
      for (let k = 0; k < 3; k++) { const v5 = Math.min(31, (d[i + k] + t) >> 3); d[i + k] = (v5 << 3) | (v5 >> 2); }
    }
    return b;
  };

  /** true where nothing important sits (outside the HP boxes, both sprite columns and both platforms, with margin m): safe for sparse decor */
  BB.free = function (x, y, m) {
    m = m || 0;
    const inE = (cx, cy, rx, ry) => ((x - cx) / (rx + m)) ** 2 + ((y - cy) / (ry + m)) ** 2 <= 1;
    if (inE(172, 56, 52, 10) || inE(58, 104, 75, 14)) return false;
    if (x > 6 - m && x < 114 + m && y > 8 - m && y < 38 + m) return false;     // foe HP box
    if (x > 124 - m && y > 66 - m && y < 106 + m) return false;                 // player HP box
    if (x > 138 - m && x < 206 + m && y < 62 + m) return false;                 // foe sprite column
    if (x > 24 - m && x < 92 + m && y > 44 - m) return false;                   // player sprite column
    return true;
  };
  /** deterministic sparse scatter: draw(x, y, r) for up to n hashed positions inside (x0,y0)-(x1,y1) where ok(x,y) holds */
  BB.scatter = function (seed, n, x0, y0, x1, y1, ok, draw) {
    for (let k = 0, t = 0; k < n && t < n * 14; t++) {
      const x = x0 + K.hf(t, seed, 1) * (x1 - x0), y = y0 + K.hf(t, seed, 2) * (y1 - y0);
      if (ok && !ok(x, y)) continue;
      draw(x, y, K.hf(t, seed, 3), k++);
    }
  };

  /** composite src over a copy of dst */
  const stack = (base, list) => { const o = base.clone(); for (const [bm, x, y] of list) o.blit(bm, x, y); return o; };

  /**
   * Shared stage geometry (every background uses it so platforms and sprites read the same everywhere):
   *   horizon y = 38; foe feet (172,60) on a 104x20 oval centred (172,56) — it ends at y 66, just above the player's HP box (the tallest
   *   Kigu sprites lose one row of hood tip at the screen top);
   *   player feet (58,106) on a 150x28 oval centred (58,104), cut off by the text box at y 112 (hero feet sit at (58,104)).
   */
  BB.HY = 38;
  BB.stage = (tint) => ({
    enemy: { x: 172, y: 60, cx: 172, cy: 56, rx: 52, ry: 10, tint },
    player: { x: 58, y: 106, cx: 58, cy: 104, rx: 75, ry: 14, tint: Object.assign({}, tint, { rimT: [3.4, 2.5] }) },
  });

  /**
   * Register a background. spec = {
   *   sky(b)    paints the opaque sky layer (sky + distant scenery),
   *   ground(b) paints the ground layer (transparent above the horizon: fade the top in with BB.vgrad(..., soft)),
   *   enemy / player = { x, y (feet anchor), cx, cy, rx, ry (ellipse), tint: platform options (see BB.platform) } }
   * paint() returns { bg, layers:{sky,ground}, enemyDisc:{bmp,x,y}, playerDisc:{bmp,x,y} }; the registry wrapper quantizes.
   */
  BB.define = function (id, spec) {
    const E = spec.enemy, P = spec.player;
    return K.battleBg(id, {
      enemyBase: { x: E.x, y: E.y },
      playerBase: { x: P.x, y: P.y },
      paint() {
        const sky = new Bitmap(W, H), ground = new Bitmap(W, H);
        spec.sky(sky);
        spec.ground(ground);
        // the sky layer must be opaque everywhere (the ground layer fades in over it): rows the painter left empty or glow-only
        // inherit the row above (blended by their own alpha)
        for (let y = 1; y < H; y++) for (let x = 0; x < W; x++) {
          const d = sky.data, i = (y * W + x) << 2, a = d[i + 3];
          if (a === 255) continue;
          const j = ((y - 1) * W + x) << 2, k = a / 255;
          d[i] = d[j] + (d[i] - d[j]) * k; d[i + 1] = d[j + 1] + (d[i + 1] - d[j + 1]) * k; d[i + 2] = d[j + 2] + (d[i + 2] - d[j + 2]) * k; d[i + 3] = 255;
        }
        const mk = (S) => BB.platform(S.cx === undefined ? S.x : S.cx, S.cy, S.rx, S.ry, Object.assign({ feet: { x: S.x, y: S.y - 1, rx: Math.max(13, S.rx * 0.2), ry: Math.max(3.5, S.ry * 0.28) } }, S.tint));
        const ed = mk(E), pd = mk(P);
        const bg = stack(sky, [[ground, 0, 0], [ed.bmp, ed.x, ed.y], [pd.bmp, pd.x, pd.y]]);
        BB.finish(bg, 0, 0);
        BB.finish(sky, 0, 0);
        BB.finish(ground, 0, 0);
        BB.finish(ed.bmp, ed.x, ed.y);
        BB.finish(pd.bmp, pd.x, pd.y);
        return { bg, layers: { sky, ground }, enemyDisc: ed, playerDisc: pd };
      },
    });
  };
})(typeof globalThis !== 'undefined' ? globalThis : window);
