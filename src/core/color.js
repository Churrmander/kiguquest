/* NP.Color — packed little-endian RGBA helpers.
 *
 * A "packed" color is a uint32 laid out as 0xAABBGGRR, which is exactly what a
 * Uint8ClampedArray RGBA pixel looks like when viewed through a Uint32Array on
 * a little-endian machine. 0 means fully transparent.
 *
 * Anything that takes a color accepts: a packed number, '#rgb', '#rrggbb',
 * '#rrggbbaa', [r,g,b] / [r,g,b,a], or null/undefined/false (= transparent).
 */
(function (root) {
  'use strict';
  const NP = (root.NP = root.NP || {});
  if (new Uint8Array(new Uint32Array([1]).buffer)[0] !== 1) throw new Error('NP requires a little-endian platform');

  const clamp = (v, lo, hi) => (v < lo ? lo : v > hi ? hi : v);
  const c255 = (v) => (v < 0 ? 0 : v > 255 ? 255 : Math.round(v));

  function pack(r, g, b, a) {
    if (a === undefined) a = 255;
    return ((c255(a) << 24) | (c255(b) << 16) | (c255(g) << 8) | c255(r)) >>> 0;
  }
  function unpack(c) {
    return [c & 255, (c >>> 8) & 255, (c >>> 16) & 255, (c >>> 24) & 255];
  }

  const NAMED = { transparent: 0, black: 0xff000000, white: 0xffffffff };

  function parse(v) {
    if (v === undefined || v === null || v === false) return 0;
    if (typeof v === 'number') return v >>> 0;
    if (Array.isArray(v)) return pack(v[0], v[1], v[2], v.length > 3 ? v[3] : 255);
    if (typeof v === 'string') {
      let s = v.trim().toLowerCase();
      if (s in NAMED) return NAMED[s] >>> 0;
      if (s[0] === '#') s = s.slice(1);
      if (s.length === 3 || s.length === 4) s = s.split('').map((ch) => ch + ch).join('');
      if (s.length === 6 && /^[0-9a-f]{6}$/.test(s)) return pack(parseInt(s.slice(0, 2), 16), parseInt(s.slice(2, 4), 16), parseInt(s.slice(4, 6), 16), 255);
      if (s.length === 8 && /^[0-9a-f]{8}$/.test(s)) return pack(parseInt(s.slice(0, 2), 16), parseInt(s.slice(2, 4), 16), parseInt(s.slice(4, 6), 16), parseInt(s.slice(6, 8), 16));
    }
    throw new Error('NP.Color.parse: bad color ' + String(v));
  }

  function hex(c) {
    const [r, g, b, a] = unpack(parse(c));
    const h = (n) => n.toString(16).padStart(2, '0');
    return '#' + h(r) + h(g) + h(b) + (a < 255 ? h(a) : '');
  }

  const alpha = (c) => parse(c) >>> 24;
  const withAlpha = (c, a) => ((parse(c) & 0x00ffffff) | (c255(a) << 24)) >>> 0;

  /** Linear RGBA mix, t=0 -> a, t=1 -> b. */
  function mix(a, b, t) {
    const A = unpack(parse(a)), B = unpack(parse(b));
    return pack(A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t, A[2] + (B[2] - A[2]) * t, A[3] + (B[3] - A[3]) * t);
  }

  /** amt in -1..1: negative darkens toward black, positive lightens toward white. Alpha preserved. */
  function shade(c, amt) {
    c = parse(c);
    const a = c >>> 24;
    const target = amt < 0 ? 0 : 255;
    const t = Math.abs(amt);
    const [r, g, b] = unpack(c);
    return pack(r + (target - r) * t, g + (target - g) * t, b + (target - b) * t, a);
  }

  function toHSL(c) {
    const [r8, g8, b8] = unpack(parse(c));
    const r = r8 / 255, g = g8 / 255, b = b8 / 255;
    const mx = Math.max(r, g, b), mn = Math.min(r, g, b);
    const l = (mx + mn) / 2;
    let h = 0, s = 0;
    const d = mx - mn;
    if (d > 1e-9) {
      s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn);
      if (mx === r) h = (g - b) / d + (g < b ? 6 : 0);
      else if (mx === g) h = (b - r) / d + 2;
      else h = (r - g) / d + 4;
      h *= 60;
    }
    return [h, s, l];
  }

  function fromHSL(h, s, l, a) {
    h = ((h % 360) + 360) % 360;
    s = clamp(s, 0, 1);
    l = clamp(l, 0, 1);
    const k = (n) => (n + h / 30) % 12;
    const f = (n) => l - s * Math.min(l, 1 - l) * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
    return pack(f(0) * 255, f(8) * 255, f(4) * 255, a === undefined ? 255 : a);
  }

  /** Relative HSL adjustment: hue shift in degrees, saturation/lightness deltas (-1..1). Alpha preserved. */
  function adjust(c, o) {
    c = parse(c);
    const [h, s, l] = toHSL(c);
    o = o || {};
    return fromHSL(h + (o.h || 0), s + (o.s || 0), l + (o.l || 0), c >>> 24);
  }

  function towardHue(h, target, amt) {
    const d = ((target - h + 540) % 360) - 180;
    const m = Math.min(Math.abs(d), amt);
    return (h + Math.sign(d) * m + 360) % 360;
  }

  /**
   * Pixel-art shading ramp around `base`. `steps` are integer levels (negative = shadow,
   * positive = highlight); default gives 4 tones dark -> light with base at index 2.
   * Shadows drift toward blue/violet and lose a little brightness-relative saturation
   * shift; highlights drift toward warm yellow — the classic hue-shifted ramp.
   */
  function ramp(base, steps) {
    steps = steps || [-2, -1, 0, 1];
    const [h, s, l] = toHSL(parse(base));
    return steps.map((k) => {
      if (k === 0) return parse(base);
      const hh = k < 0 ? towardHue(h, 250, 7 * -k) : towardHue(h, 55, 6 * k);
      const ss = clamp(s + (k < 0 ? 0.03 * -k : -0.04 * k), 0, 1);
      const ll = clamp(l + 0.1 * k, 0.04, 0.96);
      return fromHSL(hh, ss, ll);
    });
  }

  /** Quantize to the GBA's 15-bit palette (5 bits per channel). Alpha preserved. */
  function q15(c) {
    c = parse(c);
    const q = (v) => {
      const v5 = v >> 3;
      return (v5 << 3) | (v5 >> 2);
    };
    return pack(q(c & 255), q((c >>> 8) & 255), q((c >>> 16) & 255), c >>> 24);
  }

  const luma = (c) => {
    const [r, g, b] = unpack(parse(c));
    return 0.299 * r + 0.587 * g + 0.114 * b;
  };

  NP.Color = { pack, unpack, parse, hex, alpha, withAlpha, mix, shade, toHSL, fromHSL, adjust, ramp, q15, luma, clamp, c255 };
})(typeof globalThis !== 'undefined' ? globalThis : window);
