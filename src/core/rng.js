/* NP.RNG / NP.rng / NP.hash / NP.util — deterministic randomness + tiny helpers. */
(function (root) {
  'use strict';
  const NP = (root.NP = root.NP || {});

  /** FNV-1a 32-bit string hash. */
  function hash(str) {
    let h = 0x811c9dc5;
    str = String(str);
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 0x01000193);
    }
    return h >>> 0;
  }

  /** mulberry32 — small, fast, good enough, fully deterministic from a seed (number or string). */
  class RNG {
    constructor(seed) {
      this.seed(seed === undefined ? 1 : seed);
    }
    seed(v) {
      this.s = (typeof v === 'string' ? hash(v) : v >>> 0) || 1;
      return this;
    }
    /** float in [0,1) */
    next() {
      let t = (this.s = (this.s + 0x6d2b79f5) >>> 0);
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    }
    /** integer in [0,n) */
    int(n) {
      return Math.floor(this.next() * n);
    }
    /** integer in [a,b] inclusive */
    range(a, b) {
      return a + Math.floor(this.next() * (b - a + 1));
    }
    /** true with probability p (0..1) */
    chance(p) {
      return this.next() < p;
    }
    /** true with probability num/den — the form the battle formulas use. */
    ratio(num, den) {
      return this.int(den) < num;
    }
    pick(arr) {
      return arr[this.int(arr.length)];
    }
    shuffle(arr) {
      for (let i = arr.length - 1; i > 0; i--) {
        const j = this.int(i + 1);
        const t = arr[i];
        arr[i] = arr[j];
        arr[j] = t;
      }
      return arr;
    }
    /** pick from items using weight function (or .w / .weight property). */
    weighted(items, wfn) {
      const w = wfn || ((it) => (it.w !== undefined ? it.w : it.weight !== undefined ? it.weight : 1));
      let total = 0;
      for (const it of items) total += w(it);
      let r = this.next() * total;
      for (const it of items) {
        r -= w(it);
        if (r < 0) return it;
      }
      return items[items.length - 1];
    }
    fork(label) {
      return new RNG((this.s ^ hash(label)) >>> 0);
    }
  }

  const util = {
    clamp: (v, lo, hi) => (v < lo ? lo : v > hi ? hi : v),
    lerp: (a, b, t) => a + (b - a) * t,
    sign: (v) => (v > 0 ? 1 : v < 0 ? -1 : 0),
    // deep clone for plain JSON-ish data
    clone: (o) => JSON.parse(JSON.stringify(o)),
    pad: (n, len, ch) => String(n).padStart(len, ch === undefined ? '0' : ch),
    cap: (s) => s.charAt(0).toUpperCase() + s.slice(1),
    noop: () => {},
  };

  NP.hash = hash;
  NP.RNG = RNG;
  NP.rng = new RNG(Date.now() >>> 0);
  NP.util = util;
})(typeof globalThis !== 'undefined' ? globalThis : window);
