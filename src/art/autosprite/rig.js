/* NP.art.autospriteRig — paper-doll idle animation for the AutoSprite battle sprites (the owner's standard for every AutoSprite
 * Kigu since 2026-10-26). A rig (src/art/autosprite/rigs.js) cuts the approved sprite into parts with polygons (tails, ears,
 * flame tips, floating wisps, upper body vs legs). Every idle frame moves those parts with integer offsets and small
 * RotSprite-style rotations (Scale2x three times, then nearest sampling) and stacks them back to front. No pixel is drawn:
 * where a moving part uncovers something, the layer underneath was grown there from its own nearest pixel, and new pinholes
 * take their nearest neighbour's colour. Frame 0 is exactly the approved sprite and only the sprite's own colours appear.
 *
 *   player(rig, bmp, place)  -> { N, frame(i) -> Bitmap place.w x place.h } (frames are made when first asked for)
 *   frames(rig, bmp, place)  -> all N frames as Bitmap[]
 *        rig   = one view of NP.art.autospriteRigs[id] ({ parts, anim })
 *        bmp   = the cropped battle sprite (any colourway: rigs only look at alpha)
 *        place = { w, h, dx, dy } the cell and where the crop's top-left sits in it
 *   cut(rig, bmp)            -> [{ def, mask, layer }] the parts (for previews and tests)
 *   N = 24 frames, played at 12 fps (one breath every 2 s)
 *
 * Part fields (coordinates are crop pixels):
 *   name, polys [[x, y], ...] list | null (null = every pixel no earlier part claimed), z (draw order, back to front),
 *   pivot [x, y], parent (moves and turns with that part), comp 'main' (only the biggest 4-connected piece) | 'floater'
 *   (only pieces that are not it) | absent (anything), extend polys (grow the part under its neighbours, so a seam never opens),
 *   fill [[target, polys], ...] (grow `target` under this part, so moving it uncovers that layer, not a hole)
 * anim: { part: { ang: track, dx: track, dy: track } }, track = ['tab', name, scale, lag] | ['twitch', amp, start] |
 *   ['float', phase, amp, upOnly]; tables below. Parts claim pixels in list order. */
(function (root) {
  'use strict';
  const NP = (root.NP = root.NP || {});
  NP.art = NP.art || {};

  const N = 24;
  const TAB = {
    BOB: [0, 0, 0, 0, 0, 0, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 0, 0, 0, 0, 0, 0], // body up for half the loop
    SWAY: [0, 0, 1, 1, 2, 2, 2, 2, 1, 1, 0, 0, 0, 0, -1, -1, -2, -2, -2, -2, -1, -1, 0, 0], // tails: held steps, not a smooth churn
    OPEN: [0, 0, 0, 0, 1, 1, 2, 2, 2, 2, 2, 2, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // fans open on the in-breath
    FLICK: [0, 1, 2, 2, 1, 0, 0, -1, -2, -2, -1, 0, 0, 1, 2, 2, 1, 0, 0, -1, -2, -2, -1, 0], // quick tail, twice per loop
    BUZZ: [0, 1, 0, -1, 0, 1, 0, -1, 0, 1, 0, -1, 0, 1, 0, -1, 0, 1, 0, -1, 0, 1, 0, -1], // insect wings: a quick flutter
    NOD: [0, 0, 0, 0, 0, 0, 0, 0, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 0, 0, 0, 0], // BOB two frames late (follow-through)
  };
  const TWITCH = [1, 1, 0.5];

  function track(t, i) {
    if (!t) return 0;
    if (t[0] === 'tab') return t[2] * TAB[t[1]][(((i - (t[3] || 0)) % N) + N) % N];
    if (t[0] === 'twitch') { const k = (((i - t[2]) % N) + N) % N; return k < TWITCH.length ? t[1] * TWITCH[k] : 0; }
    if (t[0] === 'float') { // a sine shifted so frame 0 sits at rest
      const v = (j) => Math.round(t[2] * Math.sin((2 * Math.PI * j) / N + t[1]));
      const d = v(i) - v(0);
      return t[3] ? Math.min(0, d) : d;
    }
    return 0;
  }

  /** Polygon mask, the same pixels as Pillow's filled polygon (the rigs were authored against it): rows are scanned at integer
   *  y, an edge counts on [top, bottom) (and at its bottom on the polygon's last row), horizontal edges are drawn whole, and a
   *  span runs from round-half-up(left) to round-half-down(right). */
  function polyMask(w, h, polys) {
    const m = new Uint8Array(w * h);
    const put = (x, y) => { if (x >= 0 && y >= 0 && x < w && y < h) m[y * w + x] = 1; };
    for (const p of polys || []) {
      const n = p.length;
      let ymin = Infinity, ymax = -Infinity;
      for (const [, y] of p) { ymin = Math.min(ymin, y); ymax = Math.max(ymax, y); }
      for (let y = Math.max(0, Math.ceil(ymin)); y <= Math.min(h - 1, Math.floor(ymax)); y++) {
        const xs = [];
        for (let k = 0; k < n; k++) {
          const [ax, ay] = p[k], [bx, by] = p[(k + 1) % n];
          if (ay === by) { if (ay === y) for (let x = Math.min(ax, bx); x <= Math.max(ax, bx); x++) put(x, y); continue; }
          const lo = Math.min(ay, by), hi = Math.max(ay, by);
          if ((lo <= y && y < hi) || (y === hi && hi === ymax)) xs.push(ax + ((y - ay) * (bx - ax)) / (by - ay));
        }
        xs.sort((a, b) => a - b);
        for (let k = 0; k + 1 < xs.length; k += 2) {
          for (let x = Math.floor(xs[k] + 0.5); x <= Math.ceil(xs[k + 1] - 0.5); x++) put(x, y);
        }
      }
    }
    return m;
  }

  /** 4-connected pieces of the opaque pixels -> { lab: Int32Array, main: label of the biggest piece }. */
  function pieces(op, w, h) {
    const lab = new Int32Array(w * h), size = [0];
    let n = 0;
    for (let i = 0; i < w * h; i++) {
      if (!op[i] || lab[i]) continue;
      n++; lab[i] = n;
      const st = [i];
      let c = 0;
      while (st.length) {
        const j = st.pop(), x = j % w, y = (j / w) | 0;
        c++;
        const nb = [x > 0 ? j - 1 : -1, x < w - 1 ? j + 1 : -1, y > 0 ? j - w : -1, y < h - 1 ? j + w : -1];
        for (const k of nb) if (k >= 0 && op[k] && !lab[k]) { lab[k] = n; st.push(k); }
      }
      size.push(c);
    }
    let main = 0;
    for (let k = 1; k <= n; k++) if (!main || size[k] > size[main]) main = k;
    return { lab, main };
  }

  /** Grow `img` (packed u32, 0 = clear) into `region` from the pixels in `have`, one ring at a time (left, right, up, down). */
  function nearestFill(img, w, h, region, have, maxR) {
    have = have.slice();
    let todo = [];
    for (let i = 0; i < w * h; i++) if (region[i] && !have[i]) todo.push(i);
    for (let r = 0; r < (maxR || 6) && todo.length; r++) {
      const add = [], left = [];
      for (const i of todo) {
        const x = i % w;
        const k = x > 0 && have[i - 1] ? i - 1 : x < w - 1 && have[i + 1] ? i + 1 : i >= w && have[i - w] ? i - w : i + w < w * h && have[i + w] ? i + w : -1;
        if (k >= 0) add.push(i, img[k]); else left.push(i);
      }
      for (let k = 0; k < add.length; k += 2) { img[add[k]] = add[k + 1]; have[add[k]] = 1; }
      todo = left;
    }
  }

  /** Scale2x (EPX) on packed pixels (edges repeat). */
  function scale2x(src, w, h) {
    const o = new Uint32Array(w * h * 4), W = w * 2;
    for (let y = 0; y < h; y++) {
      const r = y * w, ru = (y > 0 ? y - 1 : 0) * w, rd = (y < h - 1 ? y + 1 : y) * w;
      for (let x = 0; x < w; x++) {
        const xl = x > 0 ? x - 1 : 0, xr = x < w - 1 ? x + 1 : x;
        const B = src[ru + x], D = src[r + xl], E = src[r + x], F = src[r + xr], H = src[rd + x];
        const c = B !== H && D !== F, i = y * 2 * W + x * 2;
        o[i] = c && D === B ? D : E;
        o[i + 1] = c && B === F ? F : E;
        o[i + W] = c && D === H ? D : E;
        o[i + W + 1] = c && H === F ? F : E;
      }
    }
    return o;
  }

  /** Clear pixels the cell border can't reach. */
  function holes(px, w, h) {
    const seen = new Uint8Array(w * h), st = [];
    for (let x = 0; x < w; x++) st.push(x, (h - 1) * w + x);
    for (let y = 0; y < h; y++) st.push(y * w, y * w + w - 1);
    while (st.length) {
      const i = st.pop();
      if (seen[i] || px[i] >>> 24) continue;
      seen[i] = 1;
      const x = i % w, y = (i / w) | 0;
      if (x > 0) st.push(i - 1); if (x < w - 1) st.push(i + 1); if (y > 0) st.push(i - w); if (y < h - 1) st.push(i + w);
    }
    const m = new Uint8Array(w * h);
    for (let i = 0; i < w * h; i++) m[i] = !(px[i] >>> 24) && !seen[i] ? 1 : 0;
    return m;
  }

  /** Cut the sprite into part layers (crop-sized packed u32 arrays). */
  function build(rig, bmp) {
    const w = bmp.w, h = bmp.h, src = bmp.u32, op = new Uint8Array(w * h);
    for (let i = 0; i < w * h; i++) op[i] = src[i] >>> 24 > 127 ? 1 : 0;
    const { lab, main } = pieces(op, w, h), free = op.slice(), parts = [];
    for (const def of rig.parts) {
      const m = def.polys ? polyMask(w, h, def.polys) : free.slice();
      for (let i = 0; i < w * h; i++) {
        if (def.comp === 'floater') m[i] = m[i] && op[i] && lab[i] !== main ? 1 : 0;
        else m[i] = m[i] && free[i] && (def.comp !== 'main' || lab[i] === main) ? 1 : 0;
        if (m[i]) free[i] = 0;
      }
      const layer = new Uint32Array(w * h);
      for (let i = 0; i < w * h; i++) if (m[i]) layer[i] = src[i] | 0xff000000;
      if (def.extend) {
        const ext = polyMask(w, h, def.extend);
        for (let i = 0; i < w * h; i++) ext[i] = ext[i] && op[i] && !m[i] ? 1 : 0;
        nearestFill(layer, w, h, ext, m);
      }
      parts.push({ def, mask: m, layer });
    }
    for (const p of parts) for (const [name, polys] of p.def.fill || []) {
      const t = parts.find((q) => q.def.name === name), region = polyMask(w, h, polys), have = new Uint8Array(w * h);
      for (let i = 0; i < w * h; i++) { region[i] = region[i] && p.mask[i] ? 1 : 0; have[i] = t.layer[i] ? 1 : 0; }
      nearestFill(t.layer, w, h, region, have);
    }
    return parts;
  }

  /** One frame: every part through its chain (own step, then each parent's), stacked by z. */
  function render(parts, pose, w, h, place) {
    const W = place.w, H = place.h, out = new Uint32Array(W * H);
    const chain = (p) => {
      const a = pose[p.def.name] || [0, 0, 0];
      const c = [[p.def.pivot ? p.def.pivot[0] + place.dx : place.dx, p.def.pivot ? p.def.pivot[1] + place.dy : place.dy, a[2], a[0], a[1]]];
      return p.def.parent ? c.concat(chain(parts.find((q) => q.def.name === p.def.parent))) : c;
    };
    const order = parts.map((p, k) => [p, k]).sort((a, b) => (a[0].def.z || 0) - (b[0].def.z || 0) || a[1] - b[1]);
    for (const [p] of order) {
      const c = chain(p);
      if (c.every((s) => Math.abs(s[2]) < 1e-6)) {
        let dx = place.dx, dy = place.dy;
        for (const s of c) { dx += s[3]; dy += s[4]; }
        for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
          const v = p.layer[y * w + x], X = x + dx, Y = y + dy;
          if (v && X >= 0 && Y >= 0 && X < W && Y < H) out[Y * W + X] = v;
        }
        continue;
      }
      if (!p.big) { // the part at 8x: its bounding box plus a clear 1px margin (the same as scaling the whole cell)
        let x0 = w, y0 = h, x1 = -1, y1 = -1;
        for (let i = 0; i < w * h; i++) if (p.layer[i]) { const x = i % w, y = (i / w) | 0; x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
        if (x1 < 0) { p.big = { b: new Uint32Array(0), w: 0, h: 0, x: 0, y: 0 }; continue; }
        x0--; y0--; x1++; y1++;
        const lw = x1 - x0 + 1, lh = y1 - y0 + 1, L = new Uint32Array(lw * lh);
        for (let y = Math.max(0, y0); y <= Math.min(h - 1, y1); y++) for (let x = Math.max(0, x0); x <= Math.min(w - 1, x1); x++) L[(y - y0) * lw + x - x0] = p.layer[y * w + x];
        let b = L, bw = lw, bh = lh;
        for (let k = 0; k < 3; k++) { b = scale2x(b, bw, bh); bw *= 2; bh *= 2; }
        p.big = { b, w: bw, h: bh, x: (x0 + place.dx) * 8, y: (y0 + place.dy) * 8 };
      }
      if (!p.big.w) continue;
      const big = p.big;
      const steps = c.map(([pvx, pvy, ang, dx, dy]) => [pvx, pvy, Math.cos((-ang * Math.PI) / 180), Math.sin((-ang * Math.PI) / 180), dx, dy]).reverse();
      // only scan where the part can land: its 8x box's corners pushed forward through the chain, plus a margin
      let X0 = W, Y0 = H, X1 = 0, Y1 = 0;
      for (const [qx, qy] of [[big.x, big.y], [big.x + big.w, big.y], [big.x, big.y + big.h], [big.x + big.w, big.y + big.h]]) {
        let px = qx / 8, py = qy / 8;
        for (let k = 0; k < c.length; k++) { // forward: own step first
          const [pvx, pvy, ang, dx, dy] = c[k], a = (ang * Math.PI) / 180, cx = px - pvx, cy = py - pvy;
          px = cx * Math.cos(a) - cy * Math.sin(a) + pvx + dx;
          py = cx * Math.sin(a) + cy * Math.cos(a) + pvy + dy;
        }
        X0 = Math.min(X0, px); X1 = Math.max(X1, px); Y0 = Math.min(Y0, py); Y1 = Math.max(Y1, py);
      }
      X0 = Math.max(0, Math.floor(X0) - 2); Y0 = Math.max(0, Math.floor(Y0) - 2); X1 = Math.min(W - 1, Math.ceil(X1) + 2); Y1 = Math.min(H - 1, Math.ceil(Y1) + 2);
      for (let Y = Y0; Y <= Y1; Y++) for (let X = X0; X <= X1; X++) {
        let px = X + 0.5, py = Y + 0.5;
        for (const [pvx, pvy, co, si, dx, dy] of steps) { // undo the outermost (parent) step first
          const cx = px - dx - pvx, cy = py - dy - pvy;
          px = cx * co - cy * si + pvx;
          py = cx * si + cy * co + pvy;
        }
        const ix = Math.floor(px * 8) - big.x, iy = Math.floor(py * 8) - big.y;
        if (ix < 0 || iy < 0 || ix >= big.w || iy >= big.h) continue;
        const v = big.b[iy * big.w + ix];
        if (v) out[Y * W + X] = v;
      }
    }
    return out;
  }

  /** Lazy player: frame(i) renders and caches frame i (the rest pose is worked out first, for its pinholes). */
  function player(rig, bmp, place) {
    const parts = build(rig, bmp), cache = [];
    let rest = null;
    const pose = (i) => {
      const o = {}; // offsets are whole pixels (a half twitch rounds to 0)
      for (const name in rig.anim || {}) { const t = rig.anim[name]; o[name] = [Math.round(track(t.dx, i)) || 0, Math.round(track(t.dy, i)) || 0, track(t.ang, i)]; }
      return o;
    };
    const make = (i) => {
      const px = render(parts, pose(i), bmp.w, bmp.h, place);
      if (!rest) rest = holes(px, place.w, place.h);
      else { // new pinholes (not next to one the sprite already has) take their nearest neighbour's colour
        const W = place.w, hm = holes(px, place.w, place.h), near = rest.slice(), have = new Uint8Array(px.length);
        for (let k = 0; k < rest.length; k++) if (rest[k]) {
          if (k % W > 0) near[k - 1] = 1; if (k % W < W - 1) near[k + 1] = 1; if (k >= W) near[k - W] = 1; if (k + W < rest.length) near[k + W] = 1;
        }
        for (let k = 0; k < px.length; k++) { hm[k] = hm[k] && !near[k] ? 1 : 0; have[k] = px[k] >>> 24 ? 1 : 0; }
        nearestFill(px, place.w, place.h, hm, have);
      }
      const b = new NP.Bitmap(place.w, place.h);
      b.u32.set(px);
      return b;
    };
    return {
      N,
      frame(i) {
        i = ((i % N) + N) % N;
        if (!rest) cache[0] = make(0);
        return cache[i] || (cache[i] = make(i));
      },
    };
  }

  const frames = (rig, bmp, place) => { const p = player(rig, bmp, place); return Array.from({ length: N }, (_, i) => p.frame(i)); };

  NP.art.autospriteRig = { N, TAB, frames, player, track, polyMask, cut: build };
})(typeof globalThis !== 'undefined' ? globalThis : window);
