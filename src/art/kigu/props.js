/* src/art/kigu/props.js — held props and floating effects for Kigu look specs.
 *
 *   ['prop',  { kind:'book', hand:'L', mat:'acc', ... }]   something held in (or at) a hand
 *   ['float', { kind:'flame', pts:[[x,y],...], mat:'fire' }] little effects floating around the head (fox-fire, petals, notes...)
 *
 * Coordinates are in "44px units" relative to the hand anchor (or the head anchor for floats) and scale with the sprite.
 * `hand` is the side on screen in the FRONT view ('R' = screen right); in the back view the same hand is on the other side.
 * Small props are hidden in the back view (the body covers them); long ones (wand, lance, cane...) stay.
 */
(function (root) {
  'use strict';
  const NP = (root.NP = root.NP || {});
  const K = (NP.art.kigu = NP.art.kigu || {});
  const PARTS = (K._parts = K._parts || {});
  const R = Math.round;

  const STAFF = new Set(['wand', 'lance', 'pick', 'cane', 'needles', 'brolly']);

  /** Shapes are drawn relative to (ax,ay) with x mirrored by s; u is the unit scale. */
  function frame(cv, L, o, view) {
    const hand = o.hand || 'R';
    let s = hand === 'R' ? 1 : -1;
    if (view === 'back') s = -s;
    const a = L.anc[s > 0 ? 'handR' : 'handL'];
    const u = L.k;
    return {
      s, u, x: a[0] + s * (o.dx || 0) * u, y: a[1] + (o.dy || 0) * u,
      X(v) { return this.x + s * v * u; }, Y(v) { return this.y + v * u; },
      e(cx, cy, rx, ry, m, t) { cv.ell(this.X(cx), this.Y(cy), rx * u, ry * u, m, t); },
      r(x0, y0, w, h, m, t) { const xa = this.X(x0), xb = this.X(x0 + w); cv.rect(Math.min(xa, xb), this.Y(y0), Math.max(1, Math.abs(xb - xa)), Math.max(1, h * u), m, t); },
      l(x0, y0, x1, y1, m, t) { cv.line(this.X(x0), this.Y(y0), this.X(x1), this.Y(y1), m, t); },
      c(x0, y0, x1, y1, r0, r1, m, t) { cv.capsule(this.X(x0), this.Y(y0), this.X(x1), this.Y(y1), r0 * u, r1 * u, m, t); },
      p(pts, m, t) { cv.poly(pts.map((q) => [this.X(q[0]), this.Y(q[1])]), m, t); },
      d(x0, y0, m, t) { cv.plot(this.X(x0), this.Y(y0), m, t); },
    };
  }

  const DRAW = {};

  DRAW.book = (cv, F, o) => {
    cv.begin('prop', { shade: 1, hi: 0, cast: 0 });
    F.r(-4, -5, 9, 7, o.mat || 'acc');
    cv.decal('prop', () => {
      F.r(-3, -4, 7, 5, o.page || 'page');
      F.r(-4, -5, 1, 7, o.mat || 'acc', -1); // spine
      F.d(-2, -3, o.mat || 'acc', -1); F.d(-1, -3, o.mat || 'acc', -1); F.d(0, -3, o.mat || 'acc', -1);
      F.d(-2, -1, o.mat || 'acc', -1); F.d(-1, -1, o.mat || 'acc', -1);
    });
    if (o.note) { F.d(2, -2, o.mark || 'note', 0); F.d(2, -3, o.mark || 'note', 0); F.d(3, -4, o.mark || 'note', 0); }
    if (o.ribbon) { F.r(3, 2, 1, 3, o.ribbon, 0); }
  };
  DRAW.scroll = (cv, F, o) => {
    cv.begin('prop', { shade: 1, hi: 0, cast: 0 });
    F.r(-3, -6, 6, 12, o.page || 'page');
    cv.decal('prop', () => { for (let y = -4; y <= 3; y += 2) F.r(-2, y, 4, 1, o.ink || 'acc', 0); });
    cv.begin('scrollroll', { shade: 1, hi: 3, cast: 0 });
    F.e(0, -6, 4, 1.8, o.mat || 'gold');
    F.e(0, 6, 4, 1.8, o.mat || 'gold');
  };
  DRAW.lantern = (cv, F, o) => {
    cv.begin('prop', { shade: 1, hi: 0, cast: 0 });
    F.l(0, -5, 0, -1, o.mat || 'acc', 0); // cord
    F.r(-3, 0, 7, 1, o.mat || 'acc'); // cap
    F.r(-3, 1, 7, 7, o.glass || 'lamp');
    F.r(-3, 8, 7, 1, o.mat || 'acc');
    cv.decal('prop', () => { F.r(-3, 1, 1, 7, o.mat || 'acc', 0); F.r(3, 1, 1, 7, o.mat || 'acc', 0); F.d(-1, 2, 'shine', 0); F.r(-1, 4, 3, 3, o.glow || 'lamp', 1); });
    cv.begin('propglow', { shade: 0, hi: 0, cast: 0, line: false });
    F.d(-5, 4, o.glow || 'lamp', 0); F.d(5, 5, o.glow || 'lamp', 0);
  };
  DRAW.basket = (cv, F, o) => {
    cv.begin('prop', { shade: 1, hi: 0, cast: 0 });
    F.e(0, 1, 6, 3.4, o.mat || 'bun');
    cv.decal('prop', () => { for (let x = -4; x <= 4; x += 2) { F.d(x, 0, o.mat || 'bun', -1); F.d(x + 1, 2, o.mat || 'bun', -1); } F.r(-6, -1, 13, 1, o.rim || 'bun', 1); });
    cv.begin('propbuns', { shade: 1, hi: 3, cast: 0 });
    F.e(-2.5, -3, 2.8, 2.4, o.food || 'crust'); F.e(2.5, -3, 2.8, 2.4, o.food || 'crust'); F.e(0, -5, 2.6, 2.2, o.food || 'crust');
  };
  DRAW.pillow = (cv, F, o) => {
    cv.begin('prop', { shade: 1, hi: 0, cast: 0 });
    cv.rect(F.X(0) - 8 * F.u, F.Y(0) - 3 * F.u, 16 * F.u, 9 * F.u, o.mat || 'pillow');
    cv.decal('prop', () => {
      cv.rect(F.X(0) - 8 * F.u, F.Y(0) - 3 * F.u, 16 * F.u, 1, o.mat || 'pillow', -1);
      cv.rect(F.X(0) - 8 * F.u, F.Y(0) + 5 * F.u, 16 * F.u, 1, o.mat || 'pillow', -1);
      if (o.star) { const cx = F.X(0) + 2, cy = F.Y(0) + 1; [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1]].forEach((d) => cv.plot(cx + d[0], cy + d[1], o.star, 0)); }
    });
    cv.begin('propmitts', { shade: 1, hi: 0, cast: 0 });
    cv.ell(F.X(0) - 7 * F.u, F.Y(0) + 1 * F.u, 2.6 * F.u, 2.6 * F.u, o.hand || 'mitt');
    cv.ell(F.X(0) + 7 * F.u, F.Y(0) + 1 * F.u, 2.6 * F.u, 2.6 * F.u, o.hand || 'mitt');
  };
  DRAW.teddy = (cv, F, o) => {
    cv.begin('prop', { shade: 1, hi: 3, cast: 0 });
    const m = o.mat || 'ted';
    F.e(0, 2, 3.4, 3.8, m);
    F.e(0, -3, 3, 2.8, m);
    F.e(-2.6, -5.4, 1.4, 1.4, m); F.e(2.6, -5.4, 1.4, 1.4, m);
    cv.decal('prop', () => { F.d(-1, -3, 'line', 0); F.d(1, -3, 'line', 0); F.e(0, 3, 1.6, 1.6, o.belly || 'sub'); });
  };
  DRAW.pot = (cv, F, o) => {
    cv.begin('prop', { shade: 1, hi: 0, cast: 0 });
    F.e(0, 1, 4, 3.6, o.mat || 'honey');
    F.r(-3, -3, 7, 2, o.rim || 'honey', -1);
    cv.decal('prop', () => { F.d(-2, -2, o.drip || 'gold', 1); F.r(-1, -3, 4, 1, o.drip || 'gold', 1); F.r(-2, 1, 4, 2, o.label || 'page', 0); });
  };
  DRAW.yarn = (cv, F, o) => {
    cv.begin('prop', { shade: 1, hi: 3, cast: 0 });
    F.e(0, 0, 3.6, 3.6, o.mat || 'yarn');
    cv.decal('prop', () => { F.l(-3, -1, 2, -3, o.mat || 'yarn', -1); F.l(-3, 1, 3, -1, o.mat || 'yarn', -1); F.l(-2, 3, 3, 1, o.mat || 'yarn', -1); });
    cv.begin('yarnthread', { shade: 0, hi: 0, cast: 0, line: false });
    F.l(3, 2, 6, 3, o.mat || 'yarn', 0); F.l(6, 3, 9, 2, o.mat || 'yarn', 0);
  };

  // ---- staffs: shaft from the hand upward, head on top
  function shaft(cv, F, o, len, m, r) {
    cv.begin('shaft', { shade: 1, shadeDir: 'right', hi: 0, cast: 0 });
    F.c(1, 4, 1, -len, r || 0.9, r || 0.9, m);
  }
  DRAW.wand = (cv, F, o) => {
    const len = o.len || 14, head = o.head || 'star';
    shaft(cv, F, o, len, o.stick || 'metal');
    cv.begin('wandhead', { shade: 1, hi: 3, cast: 0 });
    if (head === 'star') F.p([[1, -len - 6], [2.6, -len - 2], [6, -len - 2], [3.4, -len + 1], [4.4, -len + 5], [1, -len + 2.6], [-2.4, -len + 5], [-1.4, -len + 1], [-4, -len - 2], [-0.6, -len - 2]], o.mat || 'gold');
    else if (head === 'dipper') { F.e(1, -len - 1, 3, 4.2, o.mat || 'honey'); cv.decal('wandhead', () => { for (let y = -len - 4; y <= -len + 2; y += 2) F.r(-2, y, 6, 1, o.mat || 'honey', -1); }); } else if (head === 'icicle') { F.p([[1, -len - 9], [4, -len - 2], [1, -len + 3], [-2, -len - 2]], o.mat || 'ice'); cv.decal('wandhead', () => { F.d(0, -len - 4, 'shine', 0); F.d(0, -len - 3, 'shine', 0); }); } else if (head === 'can') {
      F.r(-3, -len - 5, 7, 5, o.mat || 'metal');
      F.l(4, -len - 4, 8, -len - 7, o.mat || 'metal', 0); F.l(4, -len - 3, 8, -len - 6, o.mat || 'metal', 0);
      F.l(-3, -len - 5, -5, -len - 2, o.mat || 'metal', -1);
      cv.decal('wandhead', () => F.r(-3, -len - 5, 7, 1, o.mat || 'metal', 1));
      cv.begin('drops', { shade: 0, hi: 0, cast: 0, line: false });
      F.d(9, -len - 4, o.drop || 'lens', 0); F.d(10, -len - 1, o.drop || 'lens', 0); F.d(8, -len - 1, o.drop || 'lens', 0);
    } else if (head === 'flower') {
      for (const d of [[0, -4], [4, -1], [2, 3], [-2, 3], [-4, -1]]) F.e(1 + d[0] * 0.8, -len + d[1] * 0.8 - 2, 2, 2, o.mat || 'flowerP');
      F.e(1, -len - 2, 1.6, 1.6, o.core || 'gold');
    } else if (head === 'bell') { F.e(1, -len - 1, 3, 3, o.mat || 'gold'); }
  };
  DRAW.lance = (cv, F, o) => { // a giant needle
    const len = o.len || 26;
    cv.begin('shaft', { shade: 1, shadeDir: 'right', hi: 0, cast: 0 });
    F.c(1, 5, 1, -len + 3, 0.9, 0.9, o.mat || 'pin');
    F.p([[-0.4, -len + 3], [2.4, -len + 3], [1, -len - 4]], o.mat || 'pin');
    cv.decal('shaft', () => { F.d(1, 2, 'line', 0); F.d(1, 3, 'line', 0); });
    cv.begin('thread', { shade: 0, hi: 0, cast: 0, line: false });
    F.l(1, 4, 5, 8, o.thread || 'thread', 0); F.l(5, 8, 3, 11, o.thread || 'thread', 0);
  };
  DRAW.pick = (cv, F, o) => { // miner's drill-pick
    const len = o.len || 13;
    shaft(cv, F, o, len, o.stick || 'boot', 1.0);
    cv.begin('drillbit', { shade: 1, hi: 3, cast: 0 });
    F.p([[-2.5, -len + 1], [4.5, -len + 1], [1, -len - 9]], o.mat || 'metal');
    cv.decal('drillbit', () => { F.l(-1.5, -len - 1, 3, -len - 4, 'line', 0); F.l(-2, -len + 1, 3.4, -len - 2, 'line', 0); });
  };
  DRAW.cane = (cv, F, o) => {
    const len = o.len || 12;
    shaft(cv, F, o, len, o.mat || 'metal', 0.8);
    cv.begin('canehook', { shade: 1, hi: 3, cast: 0 });
    cv.stroke([[F.X(1), F.Y(-len)], [F.X(1), F.Y(-len - 4)], [F.X(5), F.Y(-len - 4)]], 0.9 * F.u, 0.9 * F.u, o.knob || 'gold');
    F.e(5, -len - 4, 1.6, 1.6, o.knob || 'gold');
  };
  DRAW.needles = (cv, F, o) => { // knitting needles crossed, with a small knitted scrap and a yarn ball
    cv.begin('shaft', { shade: 0, hi: 0, cast: 0 });
    F.l(-1, 4, 5, -14, o.mat || 'needle', 0); F.l(3, 4, -3, -14, o.mat || 'needle', 0);
    F.d(5, -15, o.tip || 'gold', 0); F.d(-3, -15, o.tip || 'gold', 0);
    cv.begin('knit', { shade: 1, hi: 0, cast: 0 });
    F.r(-2, -4, 6, 4, o.cloth || 'yarn');
    cv.decal('knit', () => { for (let x = -2; x < 4; x += 2) F.r(x, -4, 1, 4, o.cloth || 'yarn', -1); });
  };
  DRAW.brolly = (cv, F, o) => { // lily-pad umbrella
    const len = o.len || 10;
    shaft(cv, F, o, len, o.stick || 'metal', 0.7);
    cv.begin('canopy', { shade: 1, hi: 3, cast: 0 });
    F.e(1, -len - 1, 8, 3, o.mat || 'pad');
    cv.cut(() => F.p([[1, -len - 1], [8, -len - 6], [9, -len + 3]]), 'canopy'); // the lily-pad notch
    cv.decal('canopy', () => { F.l(1, -len - 1, -4, -len - 3, o.mat || 'pad', -1); F.l(1, -len - 1, -3, -len + 1, o.mat || 'pad', -1); F.l(1, -len - 1, 4, -len + 1, o.mat || 'pad', -1); });
  };
  DRAW.flowerbunch = (cv, F, o) => { // a little bouquet held in front
    cv.begin('prop', { shade: 1, hi: 0, cast: 0 });
    F.l(0, 4, 0, -1, o.stem || 'leaf', -1); F.l(-2, 4, -3, -1, o.stem || 'leaf', -1); F.l(2, 4, 3, -1, o.stem || 'leaf', -1);
    for (const d of [[-4, -3], [0, -5], [4, -3], [-2, -1], [2, -1]]) { F.e(d[0], d[1], 2.3, 2.3, o.mat || 'sub'); F.d(d[0], d[1], o.core || 'gold', 0); }
  };

  PARTS.prop = {
    front(cv, L, o, view) {
      const kind = o.kind;
      if (!DRAW[kind]) throw new Error('kigu: unknown prop ' + kind);
      if (L.icon && !o.ic) return;
      if (view === 'back' && !(STAFF.has(kind) || o.back)) return;
      const F = frame(cv, L, o, view);
      DRAW[kind](cv, F, o);
    },
  };

  // ---- floating effects
  const FLOAT = {};
  FLOAT.flame = (cv, L, o, x, y, u, sz) => { // spirit fire
    const s = (sz || 1) * u;
    cv.poly([[x - 3 * s, y + 4 * s], [x + 3 * s, y + 4 * s], [x + 3 * s, y], [x + 1 * s, y - 3 * s], [x + 1.5 * s, y - 8 * s], [x - 1.5 * s, y - 4 * s], [x - 3 * s, y - 1 * s]], o.mat || 'fire', 0);
    cv.poly([[x - 1.4 * s, y + 4 * s], [x + 1.6 * s, y + 4 * s], [x + 0.6 * s, y], [x - 1 * s, y - 1 * s]], o.core || 'sub', 0);
  };
  FLOAT.orb = (cv, L, o, x, y, u, sz) => {
    const r = 2.6 * (sz || 1) * u;
    cv.circ(x, y, r, o.mat || 'lens', 0);
    cv.plot(x - r * 0.4, y - r * 0.4, o.core || 'shine', 0);
  };
  FLOAT.petal = (cv, L, o, x, y, u, sz) => { cv.ell(x, y, 1.6 * (sz || 1) * u, 1 * (sz || 1) * u, o.mat || 'flowerP', 0); };
  FLOAT.spore = (cv, L, o, x, y, u, sz) => { cv.circ(x, y, 0.8 * (sz || 1) * u, o.mat || 'spore', 0); };
  FLOAT.star = (cv, L, o, x, y, u, sz) => {
    const m = o.mat || 'gold';
    cv.plot(x, y, m, 0); cv.plot(x - 1, y, m, 0); cv.plot(x + 1, y, m, 0); cv.plot(x, y - 1, m, 0); cv.plot(x, y + 1, m, 0);
    if ((sz || 1) > 1.3) { cv.plot(x - 2, y, m, 0); cv.plot(x + 2, y, m, 0); cv.plot(x, y - 2, m, 0); cv.plot(x, y + 2, m, 0); }
  };
  FLOAT.note = (cv, L, o, x, y, u, sz) => {
    const m = o.mat || 'note';
    cv.plot(x, y, m, 0); cv.plot(x + 1, y, m, 0); cv.plot(x + 1, y - 1, m, 0); cv.plot(x + 1, y - 2, m, 0); cv.plot(x + 1, y - 3, m, 0); cv.plot(x + 2, y - 3, m, 0); cv.plot(x + 2, y - 2, m, 0);
  };
  FLOAT.bubble = (cv, L, o, x, y, u, sz) => {
    const r = 2.4 * (sz || 1) * u;
    cv.ring(x, y, r, r, 1, o.mat || 'bubble', 0);
    cv.plot(x - r * 0.4, y - r * 0.4, 'shine', 0);
  };
  FLOAT.heart = (cv, L, o, x, y, u) => {
    const m = o.mat || 'blush';
    cv.plot(x - 1, y - 1, m, 0); cv.plot(x + 1, y - 1, m, 0); cv.rect(x - 2, y, 5, 1, m, 0); cv.rect(x - 1, y + 1, 3, 1, m, 0); cv.plot(x, y + 2, m, 0);
  };
  PARTS.float = {
    front(cv, L, o, view) {
      const f = FLOAT[o.kind];
      if (!f) throw new Error('kigu: unknown float ' + o.kind);
      if (L.icon && !o.ic) return;
      if (view === 'back' && o.back === false) return;
      cv.begin(o.g || 'float', { shade: 0, hi: 0, cast: 0, line: o.line === true });
      const a = L.anc[o.at || 'head'];
      for (const p of o.pts) {
        const x = a[0] + (view === 'back' ? -1 : 1) * p[0] * L.k, y = a[1] + p[1] * L.k;
        f(cv, L, o, x, y, L.k, p[2]);
      }
    },
  };
})(typeof globalThis !== 'undefined' ? globalThis : window);
