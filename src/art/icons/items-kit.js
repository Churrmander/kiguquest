/* src/art/icons/items-kit.js — shared painter helpers for the 24x24 item icons (I._items).
 *
 * Icons are built part by part: every part is a flat silhouette that gets shaded from ITS OWN shape
 * (light from the top-left) and is then composited, so highlights/shadows sit on each part's rim.
 * Modes: 'cel' (bevel rim light/shadow, boxy things), 'dome' (pillow shading, round things),
 * 'cyl' (vertical cylinder: bottles, tins, cups), 'flat' (no shading).
 * The whole icon gets a 1px hue-shifted ink outline in finish() — keep shapes inside x,y = 1..22.
 */
(function (root) {
  'use strict';
  const NP = (root.NP = root.NP || {});
  const I = NP.art.icons;
  const K = I._kit;
  const { P, tone, ink, ramp, layer, fillFn, cel, dome, rows, segDist, starPts } = K;

  const H = {};

  // ---------------------------------------------------------------- named colours + cached ramps
  const BASE = {
    cream: '#f8ecd0', paper: '#f2dcae', pink: '#f592b8', rose: '#e8587e', red: '#e2424e', coral: '#f06a58', orange: '#f28c38',
    gold: '#f4c53c', yellow: '#f8df56', lime: '#a4cf3e', green: '#48ba5e', leaf: '#3aa556', mint: '#64d6ae', teal: '#2aa9a6',
    sky: '#5cb6f2', blue: '#3f7ae2', navy: '#37458c', violet: '#8c5ed8', lilac: '#b79cea', plum: '#7d3f8e', brown: '#b4733c',
    cocoa: '#7c4c33', steel: '#aab6ca', iron: '#7b869c', glass: '#d2eef6', white: '#fcf9f3', snow: '#e6f3fc', peach: '#f8c4a0',
    wine: '#9a2e58', night: '#2e2f66',
  };
  const rcache = {};
  /** Named (or '#hex') 5-tone ramp, cached. */
  H.R = function (name, k) {
    const key = name + '|' + (k || 1);
    return rcache[key] || (rcache[key] = ramp(BASE[name] || name, { k: k || 1 }));
  };
  H.BASE = BASE;
  H.ramp = H.R;

  // ---------------------------------------------------------------- parts
  /** cylinder shading by column of the part's own width */
  H.cyl = function (t, r, o) {
    o = o || {};
    const bb = t.bbox();
    if (!bb) return t;
    const x0 = o.x0 !== undefined ? o.x0 : bb.x, x1 = o.x1 !== undefined ? o.x1 : bb.x + bb.w - 1;
    const w = x1 - x0 + 1;
    const spec = Math.max(1, Math.round(w * (o.specAt || 0.24)));
    for (let y = 0; y < t.h; y++) for (let x = 0; x < t.w; x++) {
      if (!t.isOpaque(x, y)) continue;
      const k = x - x0;
      let c;
      if (k === spec && w >= 7 && o.spec !== false) c = r.l2;
      else if (k < spec) c = r.l1;
      else if (k >= w - 1 && w >= 8) c = r.d2;
      else if (k >= w - Math.max(2, Math.round(w * 0.3))) c = r.d1;
      else c = r.m;
      t.u32[y * t.w + x] = P(c);
    }
    return t;
  };

  /**
   * Shade + composite a part onto b. fill is (x,y)=>bool or (layer)=>void (paint flat r.m).
   * o: { mode:'cel'|'dome'|'cyl'|'flat', sh, hi, deep, keep, r (dome radius), ... } ; returns the part layer.
   */
  H.part = function (b, fill, r, o) {
    o = o || {};
    const t = layer(b.w, b.h);
    if (fill.length >= 2) fillFn(t, fill, r.m); else fill(t);
    const mode = o.mode || 'cel';
    if (mode === 'cel') cel(t, r, o);
    else if (mode === 'dome') dome(t, r, o);
    else if (mode === 'cyl') H.cyl(t, r, o);
    if (!o.detached) b.blit(t, 0, 0);
    return t;
  };
  H.rect = (b, x, y, w, h, r, o) => H.part(b, (px, py) => px >= x && py >= y && px < x + w && py < y + h, r, o);
  H.rrect = (b, x, y, w, h, rad, r, o) => H.part(b, (t) => K.roundRect(t, x, y, w, h, rad, r.m), r, o);
  H.ell = (b, cx, cy, rx, ry, r, o) => H.part(b, (t) => t.ellipse(cx, cy, rx, ry, r.m), r, Object.assign({ mode: 'dome', r: Math.max(rx, ry) + 0.5 }, o || {}));
  H.poly = (b, pts, r, o) => H.part(b, (t) => t.polygon(pts, r.m), r, o);
  H.cap = (b, x0, y0, x1, y1, rad, r, o) => H.part(b, (t) => K.capsule(t, x0, y0, x1, y1, rad, r.m), r, o);
  /** pixel ring (annulus) mask */
  H.ring = (b, cx, cy, ro, ri, c) => fillFn(b, (x, y) => { const d = Math.hypot(x - cx, y - cy); return d <= ro && d >= ri; }, c);
  H.ringPart = (b, cx, cy, ro, ri, r, o) => H.part(b, (x, y) => { const d = Math.hypot(x - cx, y - cy); return d <= ro && d >= ri; }, r, o);

  // ---------------------------------------------------------------- details
  H.px = (b, x, y, c) => { b.set(x, y, P(c)); return b; };
  /** list of [x,y] (+ optional colour override) pixels */
  H.pxs = (b, pts, c) => { for (const p of pts) b.set(p[0], p[1], P(p[2] || c)); return b; };
  /** small twinkle: plus-shaped with a bright centre */
  H.twinkle = function (b, x, y, c, big) {
    c = P(c || '#ffffff');
    b.set(x, y, c);
    b.set(x - 1, y, c); b.set(x + 1, y, c); b.set(x, y - 1, c); b.set(x, y + 1, c);
    if (big) { b.set(x - 2, y, c); b.set(x + 2, y, c); b.set(x, y - 2, c); b.set(x, y + 2, c); }
    return b;
  };
  /** dashed "stitch" line from (x0,y0) to (x1,y1) */
  H.dash = function (b, x0, y0, x1, y1, c, on, off) {
    on = on || 2; off = off === undefined ? 1 : off;
    const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0));
    c = P(c);
    for (let i = 0; i <= n; i++) {
      if (i % (on + off) >= on) continue;
      const t = n ? i / n : 0;
      b.set(Math.round(x0 + (x1 - x0) * t), Math.round(y0 + (y1 - y0) * t), c);
    }
    return b;
  };
  H.line = (b, x0, y0, x1, y1, c) => b.line(x0, y0, x1, y1, P(c));
  /** polyline through pts */
  H.pline = function (b, pts, c) { for (let i = 0; i + 1 < pts.length; i++) b.line(pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1], P(c)); return b; };
  /** paint ASCII rows with a legend (letter -> colour); '.' and unknown letters are skipped */
  H.art = (b, x, y, rs, map) => rows(b, x, y, rs, map);
  H.star = (b, cx, cy, ro, ri, c, n) => b.polygon(starPts(cx, cy, ro, ri, n || 5), P(c));
  H.heart = function (b, x, y, c) {
    return rows(b, x, y, ['.##.##.', '#######', '#######', '.#####.', '..###..', '...#...'], { '#': c });
  };

  /** finish with a per-icon ink (dark hue-shifted colour of the dominant material) */
  H.done = function (b, inkc, tag) { return K.finish(b, inkc, 16, tag); };

  /** register an item icon: draw receives a fresh 24x24 layer and returns it (or a replacement). */
  H.add = function (id, group, p1, draw) {
    K.addItem(id, group, () => { const b = layer(); const r = draw(b); return r || b; }, p1);
  };

  /** cream text on a tiny label: pico letters centred in a box */
  H.picoCenter = function (b, text, cx, y, c, o) {
    const G = I._glyphs;
    const w = G.pico.width(text);
    return G.pico.draw(b, text, cx - Math.floor(w / 2), y, c, o);
  };

  I._items = H;
})(typeof globalThis !== 'undefined' ? globalThis : window);
