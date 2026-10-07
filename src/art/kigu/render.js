/* src/art/kigu/render.js — the Kigu look-spec renderer and the public NP.art.kigu API.
 *
 * A look spec (see docs/art-kigu.md) describes one girl-in-a-costume; paint() draws it onto a KCanvas in back-to-front
 * stages, and canvas.js turns the layered materials into a shaded, outlined, colour-budgeted Bitmap.
 *
 *   front/back(id, {alt, pose})  64x64 battle sprite; `size` in the spec is the TARGET height of the whole sprite (ears, hats
 *                                and all): the renderer solves the body height so front AND back come out that tall, feet on
 *                                the same baseline (lowest outline row 62, x centre 31.5), so the two views share one scale.
 *   icon(id, frame, {alt, pose}) 32x32 party icon: a dedicated head-and-shoulders crop (big head, the signature costume parts,
 *                                a little bust), <= 12 colours, frame 1 = the head hops up one pixel.
 */
(function (root) {
  'use strict';
  const NP = (root.NP = root.NP || {});
  const { Bitmap, Color } = NP;
  const K = (NP.art.kigu = NP.art.kigu || {});
  const kit = K._kit, PARTS = K._parts, layout = K._layout;
  const { KCanvas, Palette, lineFrom } = kit;
  const R = Math.round;
  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);

  K.looks = K.looks || {};
  const order = [];
  const cache = new Map();
  const fitCache = new Map();

  const DEFAULT_PAL = {
    skin: '#ffe0c9', eye: '#7a4ea8', blush: '#ff9fae', shine: '#ffffff',
    gold: '#f4c542', metal: '#b9c6da', lens: '#bfe6ff', lamp: '#fff3a0', leaf: '#6cbf4a',
  };

  // ------------------------------------------------------------------ spec registration
  K.define = function (id, spec) {
    if (K.looks[id]) throw new Error('kigu: duplicate look ' + id);
    const P = Object.assign({ id, stage: 1, size: 44, rise: 0, parts: [] }, spec);
    P.pal = Object.assign({}, DEFAULT_PAL, spec.pal);
    P.hood = Object.assign({ type: 'up' }, spec.hood);
    P.hair = Object.assign({ style: 'bob', mat: 'hair' }, spec.hair);
    P.eyes = Object.assign({ style: 'round' }, spec.eyes);
    P.arms = Object.assign({ pose: 'down' }, spec.arms);
    P.face = spec.face || [];
    P.mouth = spec.mouth || 'smile';
    P.icon = spec.icon || {};
    K.looks[id] = P;
    order.push(id);
    return P;
  };
  K.has = (id) => Object.prototype.hasOwnProperty.call(K.looks, id);
  K.ids = () => order.slice();

  // ------------------------------------------------------------------ palette
  const KEEP = new Set(['skin', 'eye', 'blush', 'shine', 'metal', 'lens', 'lamp']);
  function rotate(v, deg) {
    if (Array.isArray(v)) return v.map((c) => Color.hex(Color.adjust(c, { h: deg })));
    return Color.hex(Color.adjust(v, { h: deg }));
  }
  function makePalette(P, alt) {
    const e = Object.assign({}, P.pal);
    if (alt) {
      const a = P.alt;
      if (a && typeof a === 'object') Object.assign(e, a);
      else {
        const deg = typeof a === 'number' ? a : 150;
        for (const k of Object.keys(e)) if (!KEEP.has(k) && k !== 'hair') e[k] = rotate(e[k], deg);
        if (e.hair) e.hair = rotate(e.hair, deg * 0.5);
      }
    }
    for (const alias of ['mitt', 'foot', 'hood', 'inner', 'acc', 'sub', 'hair']) if (e[alias] === undefined) e[alias] = alias === 'inner' ? '#ffadb8' : e.main;
    return new Palette(e, e.line || lineFrom(e.main));
  }

  // ------------------------------------------------------------------ body pieces
  function drawLegs(cv, L, P) {
    const k = L.k;
    if (P.cocoon || L.icon) return;
    cv.begin('legs', { shade: 2, shadeDir: 'right', hi: 0, family: 'legs' });
    const y0 = L.tb - 4, y1 = L.bot - 2;
    for (const s of [-1, 1]) cv.capsule(L.cx + s * 4 * k, y0, L.cx + s * 4.2 * k, y1, 2.6 * k, 2.4 * k, P.legMat || 'main');
    cv.begin('feet', { shade: 1, hi: 0, cast: 0 });
    const fm = P.footMat || 'foot';
    for (const s of [-1, 1]) cv.ell(L.cx + s * 4.6 * k, L.bot - 1, 3.4 * k, Math.min(2 * k, 2), fm);
    if (P.footToes) cv.decal('feet', () => { for (const s of [-1, 1]) for (const d of [-1, 1]) cv.plot(L.cx + s * 4.6 * k + d * 1.2, L.bot, P.footToes, 0); });
  }
  function drawBody(cv, L, P, view) {
    cv.begin('body', { shade: 2, hi: 0, cast: 0 });
    const mat = P.bodyMat || 'main';
    if (P.cocoon && !L.icon) {
      const top = L.tt + 1, bot = L.bot + 1;
      cv.ell(L.cx, (top + bot) / 2, L.bw + 5 * L.k, (bot - top) / 2, mat);
      if (view === 'back') cv.decal('body', () => cv.line(L.cx - 0.5, L.tt + 6, L.cx - 0.5, bot - 4, mat, -1));
      return;
    }
    const top = L.tt, h = L.tb - L.tt;
    cv.ell(L.cx, top + h * 0.42, L.bw - 1, h * 0.46, mat);
    cv.ell(L.cx, top + h * 0.66, L.bw, h * 0.34, mat);
    cv.rect(L.cx - L.bw + 0.5, top + h * 0.5, L.bw * 2, Math.ceil(h * 0.5), mat);
    if (!L.icon) cv.cut(() => { cv.plot(L.cx - L.bw - 0.5, L.tb); cv.plot(L.cx + L.bw + 0.5, L.tb); });
    if (view === 'back' && !L.icon && P.seam !== false) { // the onesie's back seam, with a tiny zip pull at the neck
      cv.decal('body', () => { cv.line(L.cx - 0.5, L.hb + 1, L.cx - 0.5, L.tb - 1, mat, -1); });
    }
  }
  function drawArms(cv, L, P, view) {
    const k = L.k, A = P.arms;
    const out = A.pose === 'out' ? 2 : A.pose === 'up' ? 3 : 0;
    for (const s of [-1, 1]) {
      cv.begin(s < 0 ? 'armL' : 'armR', { shade: 2, shadeDir: 'diag', hi: 0, family: 'arm' });
      const sx = L.cx + s * (L.bw - 1.5), sy = L.icon ? L.hy - 2 : L.tt + 6 * k;
      let hx = L.cx + s * (L.bw + 1.5 + out * k), hy = L.hy + (A.pose === 'up' ? -6 * k : 0);
      if (A.pose === 'front' && !L.icon) { hx = L.cx + s * 4 * k; hy = L.tt + R(L.th * 0.72); }
      const mat = A.mat || 'main';
      if (A.type === 'wing') {
        cv.capsule(sx, sy, hx + s * 2, hy + 1, 3.6 * k, 3 * k, mat);
        for (let i = 0; i < 3; i++) cv.circ(hx + s * (1.5 + (i === 1 ? 1 : 0)), hy + 3 * k - 0.5 + i * 0.0, 1.8 * k, A.tip || mat);
      } else {
        cv.capsule(sx, sy, hx, hy - 1, 2.6 * k, 2.3 * k, mat);
        if (A.mitt !== false) cv.ell(hx, hy + 1, (A.mittR || 2.8) * k, (A.mittR || 2.8) * k, A.mittMat || 'mitt');
      }
      if (A.extraArms && !L.icon) { // webbi: four sleeve arms
        cv.capsule(sx, sy + 5 * k, hx + s * 1, hy + 2 * k, 2 * k, 1.8 * k, mat);
        cv.ell(hx + s, hy + 3 * k, 2 * k, 2 * k, A.mittMat || 'mitt');
      }
    }
  }

  // ---- ears
  function drawEar(cv, L, E, s, view) {
    const k = L.k, a = L.anc[s < 0 ? 'earL' : 'earR'];
    const bx = a[0] + (E.dx || 0) * s * k, by = a[1] + 2 + (E.dy || 0) * k;
    const h = (E.h || 8) * k, w = (E.w || 4) * k, lean = (E.lean === undefined ? 2 : E.lean) * k * s;
    const mat = E.mat || 'main';
    const inner = E.inner === false || view === 'back' ? null : E.inner || 'inner'; // seen from behind there is no inner ear
    const kind = E.kind || 'tri';
    cv.begin(s < 0 ? 'earL' : 'earR', { shade: 2, hi: 0, family: 'ear' });
    if (kind === 'tri') {
      cv.poly([[bx - w, by + 3 * k], [bx + w, by + 3 * k], [bx + lean, by - h]], mat);
      if (inner) cv.decal(cv.cur, () => cv.poly([[bx - w * 0.45, by + 3 * k], [bx + w * 0.45, by + 3 * k], [bx + lean * 0.8, by - h * 0.55]], inner));
    } else if (kind === 'round') {
      cv.circ(bx + lean * 0.5, by - h * 0.25, w, mat);
      if (inner) cv.decal(cv.cur, () => cv.circ(bx + lean * 0.5, by - h * 0.15, w * 0.5, inner));
    } else if (kind === 'long') {
      cv.stroke([[bx, by + 2], [bx + lean * 0.5, by - h * 0.5], [bx + lean, by - h]], w, w * 0.8, mat);
      if (inner) cv.decal(cv.cur, () => cv.stroke([[bx, by + 1], [bx + lean * 0.5, by - h * 0.5], [bx + lean, by - h * 0.9]], w * 0.45, w * 0.35, inner));
    } else if (kind === 'floppy') {
      const d = (E.droop || 1) * k;
      cv.stroke([[bx, by + 2], [bx + s * 3 * k, by - h * 0.8], [bx + s * (w + 6 * k) * 1.2, by - h * 0.2 + d * 6]], w * 0.9, w * 1.0, mat);
      if (inner) cv.decal(cv.cur, () => cv.stroke([[bx + s, by], [bx + s * 3 * k, by - h * 0.6], [bx + s * (w + 5 * k) * 1.1, by - h * 0.1 + d * 5]], w * 0.4, w * 0.45, inner));
    } else if (kind === 'horn') {
      cv.poly([[bx - w, by + 3 * k], [bx + w, by + 3 * k], [bx + lean, by - h]], mat);
    } else if (kind === 'leaf') {
      cv.ell(bx + lean * 0.5, by - h * 0.4, w, h * 0.55, mat);
      if (inner) cv.decal(cv.cur, () => cv.line(bx + lean * 0.3, by + 1, bx + lean * 0.9, by - h * 0.8, inner));
    } else if (kind === 'ball') {
      cv.stroke([[bx, by + 2], [bx + lean * 0.6, by - h * 0.6], [bx + lean, by - h]], 1, 1, E.stem || mat);
      cv.circ(bx + lean, by - h, w, mat);
    }
  }
  function drawEars(cv, L, P, view) {
    const E = P.hood.ears;
    if (!E) return;
    for (const s of [-1, 1]) drawEar(cv, L, E, s, view);
  }

  // ---- hair
  function hairBack(cv, L, P, view) { // behind the body (front view) / over its back (back view)
    const H = P.hair, k = L.k, st = H.style;
    if (H.bare) return;
    const mat = H.mat || 'hair';
    if (st === 'long' || st === 'braidback') {
      cv.begin('hairLong', { shade: 2, shadeDir: 'diag', hi: 4, family: 'hairb' });
      const y1 = L.tb - 1 + (H.drop || 0) * k;
      cv.ell(L.cx, L.hcy + 3, L.hrx - 1, L.hry, mat);
      cv.rect(L.cx - L.hrx + 2, L.hcy + 2, (L.hrx - 2) * 2 + 2, y1 - L.hcy - 2, mat);
      cv.capsule(L.cx - L.hrx + 3, y1 - 2, L.cx + L.hrx - 2, y1 - 2, 2.5, 2.5, mat);
      if (view === 'back') cv.decal('hairLong', () => { for (const dx of [-5, -1, 3, 6]) cv.line(L.cx + dx * k - 0.5, L.hb, L.cx + dx * k * 1.2 - 0.5, y1 - 3, mat, -1); });
    } else if (st === 'twin' || st === 'pony' || st === 'side') {
      const sides = st === 'twin' ? [-1, 1] : [H.side || 1];
      cv.begin('hairTails', { shade: 2, hi: 4, family: 'hairb' });
      for (const s of sides) {
        const x0 = L.cx + s * (L.hrx - 2 * k), y0 = L.hcy + (st === 'twin' ? 0 : -2);
        cv.stroke([[x0, y0], [x0 + s * 7 * k, y0 + 6 * k], [x0 + s * (st === 'twin' ? 6 : 4) * k, y0 + (H.len || 15) * k]], (H.r || 3.2) * k, 1.4 * k, mat);
      }
    } else if (st === 'bob' || st === 'short') {
      cv.begin('hairBack', { shade: 2, hi: 4, family: 'hairb' });
      const d = st === 'bob' ? 4 : 1;
      cv.ell(L.cx, L.hcy + 2, L.hrx - 1, L.hry - 1 + d * 0.5, mat);
      cv.rect(L.cx - L.hrx + 1, L.hcy + 1, (L.hrx - 1) * 2 + 2, d + R(L.hry * 0.5), mat);
    }
  }

  function fringe(cv, L, P, y0) {
    const H = P.hair, mat = H.mat || 'hair', k = L.k;
    if (H.bare) return;
    cv.begin('fringe', { shade: 1, hi: 4, cast: 2, family: 'hair' });
    const top = L.fcy - L.fry;
    const base = top + R(L.fry * (H.bangs === 'long' ? 0.95 : H.bangs === 'short' ? 0.5 : 0.72));
    const fx = L.frx + 1;
    const pat = H.bangs === 'spiky' ? [0, 2, 0, 3, 1] : H.bangs === 'part' ? [0, 1, 2, 1, 0] : [0, 1, 0, 2, 1, 0];
    cv.within((x, y) => {
      const u = Math.abs(x - L.cx);
      let b = base + pat[Math.floor(u) % pat.length];
      if (H.bangs === 'part') b += x < L.cx ? 1 : -1;
      if (H.bangs === 'spiky') b += Math.floor(u) % 2;
      if (u > L.frx * 0.72) b += 2;
      return y <= Math.min(b, y0 - 1);
    }, () => cv.ell(L.cx, L.fcy, fx, L.fry + 1, mat));
    if (H.lock !== false) {
      for (const s of [-1, 1]) {
        const x = L.cx + s * (L.frx - 0.5) - (s > 0 ? 0 : 1);
        cv.rect(x - (s > 0 ? 1 : 0), L.fcy - 1, 2 + (H.side2 ? 1 : 0), R(L.fry * (H.lockLen || 0.75)), mat);
      }
    }
    if (H.ahoge) cv.stroke([[L.cx + 1, top + 1], [L.cx - 1, top - 3 * k], [L.cx + 3 * k, top - 4 * k]], 1, 0.5, mat);
  }

  function hairCapBack(cv, L, P, view) { // visible hair dome on the head when no hood covers it
    const H = P.hair, mat = H.mat || 'hair';
    if (H.bare) return;
    cv.begin('hairDome', { shade: 2, hi: 4, family: 'hair' });
    cv.ell(L.cx, L.hcy, L.hrx, L.hry, mat);
    if (view === 'back') {
      cv.rect(L.cx - L.hrx + 1, L.hcy, L.hrx * 2, R(L.hry * 0.75), mat);
      cv.decal('hairDome', () => { // crown whorl + a few strands so the back of a head is not a flat blob
        cv.plot(L.cx - 0.5, L.hcy - L.hry + 2, mat, -1); cv.plot(L.cx + 0.5, L.hcy - L.hry + 3, mat, -1); cv.plot(L.cx - 1.5, L.hcy - L.hry + 3, mat, -1);
        for (const dx of [-6, -3, 3, 6]) cv.line(L.cx + dx * L.k - 0.5, L.hcy - 2, L.cx + dx * L.k * 1.25 - 0.5, L.hcy + L.hry * 0.7, mat, -1);
      });
    }
  }

  // ---- face
  // Eye templates (left-eye orientation; the light comes from the top-left so both eyes keep their shine top-left).
  //  L lid line, p pupil (dark), d upper iris (darker), i lower iris (lighter), w shine
  const EYES = {
    '2x3': ['LL', 'wd', 'ii'],
    '2x4': ['LL', 'wd', 'dd', 'ii'],
    '3x3': ['LLL', 'wpd', 'iii'],
    '3x4': ['LLL', 'wdd', 'dpd', 'iii'],
    '3x5': ['LLL', 'wdd', 'dpd', 'ipi', 'iii'],
    '4x4': ['LLLL', 'wwdd', 'dppd', 'iiii'],
    '4x5': ['LLLL', 'wwdd', 'dppd', 'ippi', 'iiii'],
    '4x6': ['LLLL', 'wwdd', 'dppd', 'dppd', 'ippi', 'iiii'],
    '5x5': ['LLLLL', 'wwddd', 'dpppd', 'ippii', 'iiiii'],
    '5x6': ['LLLLL', 'wwddd', 'dppdd', 'dpppd', 'ippii', 'iiiii'],
  };
  function eyeRows(ew, eh) {
    const t = EYES[ew + 'x' + eh];
    if (t) return t;
    const rows = ['L'.repeat(ew), 'w' + 'd'.repeat(ew - 1)];
    for (let j = 2; j < eh - 1; j++) rows.push('d' + 'p'.repeat(Math.max(0, ew - 2)) + 'd');
    rows.push('i'.repeat(ew));
    return rows;
  }
  function putEye(cv, rows, x0, y0, side, mat) {
    for (let j = 0; j < rows.length; j++) for (let i = 0; i < rows[j].length; i++) {
      const c = rows[j][i];
      if (c === 'L' || c === 'p') cv.plot(x0 + i, y0 + j, 'line', 0);
      else if (c === 'd') cv.plot(x0 + i, y0 + j, mat, -1);
      else if (c === 'i') cv.plot(x0 + i, y0 + j, mat, 1);
      else if (c === 'w') cv.plot(x0 + i, y0 + j, 'shine', 0);
    }
  }
  function eyeBox(L, P) {
    const big = L.frx;
    const ew = P.eyes.w || clamp(R(big * 0.36), 2, 5);
    const eh = P.eyes.h || clamp(R(ew * 1.25), 3, 6);
    const g = P.eyes.gap !== undefined ? P.eyes.gap : Math.max(1, R(big * 0.22));
    const y0 = L.fcy + (P.eyes.dy === undefined ? 1 : P.eyes.dy);
    return { ew, eh, g, y0 };
  }
  function drawEye(cv, L, P, x0, y0, ew, eh, side, style, mat) {
    const lash = side < 0 ? x0 - 1 : x0 + ew;
    if (style === 'round' || style === 'big') {
      putEye(cv, eyeRows(ew, eh), x0, y0, side, mat);
      if (eh >= 4) cv.plot(lash, y0, 'line', 0); // lash flick
    } else if (style === 'sleepy') {
      for (let i = 0; i < ew; i++) cv.plot(x0 + i, y0 + 1, 'line', 0);
      cv.plot(lash, y0 + 1, 'line', 0);
      for (let j = 2; j < Math.min(eh - 1, 4); j++) for (let i = 0; i < ew; i++) cv.plot(x0 + i, y0 + j, mat, j === 2 ? -1 : 1);
      if (ew >= 3) cv.plot(x0 + (side < 0 ? 0 : ew - 1), y0 + 2, 'shine', 0);
    } else if (style === 'closed') { // peaceful arcs
      cv.plot(x0, y0 + 1, 'line', 0); cv.plot(x0 + ew - 1, y0 + 1, 'line', 0);
      for (let i = 1; i < ew - 1; i++) cv.plot(x0 + i, y0 + 2, 'line', 0);
      if (ew === 2) { cv.plot(x0, y0 + 2, 'line', 0); cv.plot(x0 + 1, y0 + 2, 'line', 0); }
    } else if (style === 'happy') { // ^ ^
      cv.plot(x0, y0 + 2, 'line', 0); cv.plot(x0 + ew - 1, y0 + 2, 'line', 0);
      for (let i = 1; i < ew - 1; i++) cv.plot(x0 + i, y0 + 1, 'line', 0);
      if (ew === 2) { cv.plot(x0, y0 + 1, 'line', 0); cv.plot(x0 + 1, y0 + 1, 'line', 0); }
    } else if (style === 'dot') {
      for (let j = 0; j < 2; j++) for (let i = 0; i < 2; i++) cv.plot(x0 + i, y0 + 1 + j, 'line', 0);
      cv.plot(x0 + (side < 0 ? 0 : 1), y0 + 1, 'shine', 0);
    } else if (style === 'slit') { // squinty
      for (let i = 0; i < ew; i++) cv.plot(x0 + i, y0 + 2, 'line', 0);
      cv.plot(lash, y0 + 1, 'line', 0);
    } else if (style === 'tall') { // serious tall oval
      const rows = eyeRows(Math.max(2, ew - 1), eh + 1);
      putEye(cv, rows, x0 + (side < 0 ? 1 : 0), y0, side, mat);
    }
  }
  function drawFace(cv, L, P, view) {
    const eyeMat = P.eyes.mat || 'eye';
    const { ew, eh, g, y0 } = eyeBox(L, P);
    const c0 = L.cx - 0.5;
    const xl = c0 - g - ew + 1, xr = c0 + 1 + g;
    const style = P.eyes.style;
    // mask / eye-holes go under the eyes
    if (P.face.includes('mask')) {
      cv.begin('maskband', { shade: 0, line: false });
      cv.decal('face', () => cv.rect(L.cx - L.frx - 1, y0 - 1, L.frx * 2 + 3, eh + 2, P.pal.mask ? 'mask' : 'acc', 0));
    }
    if (P.hood.faceless) {
      cv.begin('holes', { shade: 0, line: false });
      for (const x of [xl, xr]) cv.ell(x + (ew - 1) / 2, y0 + (eh - 1) / 2, ew / 2 + 1, eh / 2 + 0.8, 'line', 0);
    }
    cv.begin('eyes', { shade: 0, hi: 0, cast: 0, line: false });
    drawEye(cv, L, P, xl, y0, ew, eh, -1, style, eyeMat);
    drawEye(cv, L, P, xr, y0, ew, eh, 1, style, eyeMat);
    if (P.hood.faceless) return; // a sheet-ghost: only the eyes peek out
    // mouth
    const my = Math.min(L.fcy + L.fry - 1, y0 + (style === 'sleepy' || style === 'closed' ? 3 : eh) + 1 + (P.mouthDy || 0));
    const m = P.mouth;
    if (m === 'smile') { cv.plot(c0, my + 1, 'line', 0); cv.plot(c0 + 1, my + 1, 'line', 0); if (!L.icon) { cv.plot(c0 - 1, my, 'line', 0); cv.plot(c0 + 2, my, 'line', 0); } }
    else if (m === 'flat') { cv.plot(c0, my + 1, 'line', 0); cv.plot(c0 + 1, my + 1, 'line', 0); }
    else if (m === 'o') { cv.plot(c0, my, 'line', 0); cv.plot(c0 + 1, my, 'line', 0); cv.plot(c0, my + 1, 'line', 0); cv.plot(c0 + 1, my + 1, 'line', 0); }
    else if (m === 'cat') { cv.plot(c0 - 1, my + 1, 'line', 0); cv.plot(c0, my, 'line', 0); cv.plot(c0 + 1, my, 'line', 0); cv.plot(c0 + 2, my + 1, 'line', 0); }
    else if (m === 'fang') { cv.plot(c0, my + 1, 'line', 0); cv.plot(c0 + 1, my + 1, 'line', 0); cv.plot(c0 - 1, my, 'line', 0); cv.plot(c0 + 2, my, 'line', 0); cv.plot(c0 + 2, my + 1, 'shine', 0); }
    else if (m === 'pout') { cv.plot(c0, my + 1, 'line', 0); cv.plot(c0 + 1, my + 1, 'line', 0); cv.plot(c0 - 1, my + 2, 'line', 0); cv.plot(c0 + 2, my + 2, 'line', 0); }
    else if (m === 'yawn') { cv.rect(c0, my, 2, 2, 'line', 0); cv.plot(c0 + 1, my + 1, 'blush', 0); }
    else if (m === 'nom') { cv.plot(c0 - 1, my, 'line', 0); cv.plot(c0, my + 1, 'line', 0); cv.plot(c0 + 1, my + 1, 'line', 0); cv.plot(c0 + 2, my, 'line', 0); cv.plot(c0, my + 2, 'blush', 0); cv.plot(c0 + 1, my + 2, 'blush', 0); }
    // blush (on the face, just under the outer eye corner)
    cv.begin('blush', { shade: 0, hi: 0, cast: 0, line: false });
    if (P.blush !== false) {
      const by = y0 + eh;
      const bw = ew >= 4 ? 3 : 2;
      for (let i = 0; i < bw; i++) { cv.plot(xl - 1 + i, by, 'blush', 0); cv.plot(xr + ew - bw + 1 + i, by, 'blush', 0); }
    }
    for (const f of P.face) {
      if (f === 'freckles') {
        cv.begin('freckles', { shade: 0, line: false });
        for (const s of [-1, 1]) { const x = c0 + 0.5 + s * (g + ew + 1.5); cv.plot(x - 1, y0 + eh - 1, 'skin', -2); cv.plot(x + 1, y0 + eh, 'skin', -2); cv.plot(x, y0 + eh + 1, 'skin', -2); }
      } else if (f === 'glasses') {
        cv.begin('glasses', { shade: 0, line: false });
        const rm = P.pal.rim ? 'rim' : 'line';
        for (const s of [-1, 1]) {
          const x0 = s < 0 ? xl : xr;
          for (let i = -1; i <= ew; i++) { cv.plot(x0 + i, y0 - 1, rm, 0); cv.plot(x0 + i, y0 + eh, rm, 0); }
          for (let j = 0; j < eh; j++) { cv.plot(x0 - 1, y0 + j, rm, 0); cv.plot(x0 + ew, y0 + j, rm, 0); }
        }
        cv.plot(c0, y0 + 1, rm, 0); cv.plot(c0 + 1, y0 + 1, rm, 0);
      } else if (f === 'nose') {
        cv.begin('nose', { shade: 0, line: false }); cv.plot(c0, y0 + eh, 'line', 0); cv.plot(c0 + 1, y0 + eh, 'line', 0);
      } else if (f === 'whiskers') {
        cv.begin('whisk', { shade: 0, line: false });
        for (const s of [-1, 1]) { const x = c0 + 0.5 + s * (g + ew + 3); cv.plot(x, y0 + eh - 1, 'line', 0); cv.plot(x + s, y0 + eh, 'line', 0); }
      } else if (f === 'brow') {
        cv.begin('brow', { shade: 0, line: false });
        for (const s of [-1, 1]) { const x0 = s < 0 ? xl : xr; for (let i = 0; i < ew; i++) cv.plot(x0 + i, y0 - 2, 'line', 0); }
      } else if (f === 'eyespots') {
        cv.begin('espots', { shade: 0, line: false });
        for (const p of [[-5, -8], [-3, -9], [0, -10], [3, -9], [5, -8], [-7, -6], [7, -6], [-1, -7]]) cv.plot(L.cx + p[0] * L.k + 0.5, L.hcy + p[1] * L.k * 0.9 + 1, 'spot', 0);
      }
    }
    return { xl, xr, y0, ew, eh };
  }

  function drawHeadCore(cv, L, P, view) {
    const hd = P.hood;
    const earsOver = !!(hd.ears && hd.ears.over);
    const hooded = hd.type === 'up';
    if (hd.ears && !earsOver && hd.type !== 'none') drawEars(cv, L, P, view);
    if (hooded) {
      if (view === 'back' && P.hair.style !== 'long' && !P.hair.bare && hd.nape !== false) { // a little hair peeks out under the hood
        cv.begin('nape', { shade: 1, hi: 0, cast: 0, family: 'hair' });
        cv.ell(L.cx, L.hb - 0.5, L.hrx - 3, 2.2 * Math.max(1, L.k), P.hair.mat || 'hair');
      }
      cv.begin('hood', { shade: 2, hi: hd.hi === undefined ? 0 : hd.hi, cast: 0, family: 'hoodf', lineMat: hd.lineMat });
      const mat = hd.mat || 'hood';
      cv.ell(L.cx, L.hcy, L.hrx, L.hry, mat);
      if (hd.pattern) hd.pattern(cv, L, view);
    } else if (hd.type === 'band') {
      // hood pushed back: a bunched collar behind the neck
      cv.begin('hoodNeck', { shade: 2, hi: 0, family: 'hoodf' });
      cv.ell(L.cx, L.hb, L.bw, 3 * L.k, hd.mat || 'hood');
      hairCapBack(cv, L, P, view);
    } else if (hd.type === 'none') {
      hairCapBack(cv, L, P, view);
    }
    if (hd.ears && hd.type === 'band' && !earsOver) drawEars(cv, L, P, view);
    if (view === 'front') {
      const { y0 } = eyeBox(L, P);
      if (!hd.faceless) {
        cv.begin('face', { shade: 1, hi: 0, cast: 0 });
        cv.ell(L.cx, L.fcy, L.frx, L.fry, 'skin');
        if (hd.faceMark) hd.faceMark(cv, L);
        fringe(cv, L, P, y0);
      }
      drawFace(cv, L, P, view);
    } else {
      if (hooded && hd.seam !== false) {
        cv.begin('seam', { shade: 0, line: false });
        cv.decal('hood', () => cv.line(L.cx - 0.5, L.hcy - L.hry + 2, L.cx - 0.5, L.hcy + 3, hd.mat || 'hood', -1));
      }
      if (!hooded && !P.hair.bare) {
        cv.begin('hairBackTop', { shade: 1, hi: 4, cast: 0, family: 'hair' });
        cv.ell(L.cx, L.hcy - 1, L.hrx - 1, L.hry - 2, P.hair.mat || 'hair');
      }
    }
    if (hd.ears && earsOver) drawEars(cv, L, P, view);
  }

  // ------------------------------------------------------------------ hair parts that sit in front of the body
  function hairFront(cv, L, P, view) {
    const H = P.hair, mat = H.mat || 'hair', k = L.k;
    if (H.bare) return;
    if (view === 'back' && H.style === 'long') {
      cv.begin('hairBackLong', { shade: 2, hi: 4, family: 'hair' });
      const y1 = L.tb - 1 + (H.drop || 0) * k;
      cv.rect(L.cx - L.hrx + 2, L.hcy + 2, (L.hrx - 2) * 2 + 2, y1 - L.hcy - 2, mat);
      cv.capsule(L.cx - L.hrx + 3, y1 - 2, L.cx + L.hrx - 2, y1 - 2, 2.5, 2.5, mat);
      cv.decal('hairBackLong', () => { for (const dx of [-5, -1, 3, 6]) cv.line(L.cx + dx * k - 0.5, L.hb, L.cx + dx * k * 1.15 - 0.5, y1 - 3, mat, -1); });
    }
    if (H.style === 'braid') {
      cv.begin('braid', { shade: 2, hi: 4, family: 'hair' });
      const s = H.side || -1;
      const x0 = view === 'back' ? L.cx - 0.5 : L.cx + s * (L.hrx - 4 * k);
      const y0 = view === 'back' ? L.hb - 3 : L.hb - 4;
      cv.stroke([[x0, y0], [x0 + (view === 'back' ? 0 : s * 2), y0 + 8 * k], [x0 + (view === 'back' ? 0 : s), L.tb + 2]], 2.6 * k, 1.8 * k, mat);
      cv.decal('braid', () => { for (let y = y0 + 3; y < L.tb + 1; y += 3) cv.line(x0 - 3, y, x0 + 3, y, mat, -1); });
      if (H.tie !== false) cv.decal('braid', () => cv.circ(x0 + (view === 'back' ? 0 : s), L.tb + 1, 1.5, H.tie || 'acc'));
    }
  }

  // ------------------------------------------------------------------ main paint
  const ICON_SKIP = new Set(['skirt', 'ring', 'prop', 'spots', 'stripes']);
  function iconParts(P) {
    const I = P.icon || {};
    let list = I.parts ? I.parts.slice() : P.parts.filter((p) => !(I.drop && I.drop.indexOf(p[0]) >= 0) && !ICON_SKIP.has(p[0]) && !(p[1] && p[1].icon === false));
    if (I.add) list = list.concat(I.add);
    return list;
  }
  function sleepSpec(P) {
    if (P.eyes.style === 'closed') return P;
    const Q = Object.assign({}, P);
    Q.eyes = Object.assign({}, P.eyes, { style: 'closed' });
    Q.mouth = P.mouth === 'yawn' ? 'yawn' : 'flat';
    return Q;
  }

  /** o: { view, alt, pose, icon, H, hb } */
  function paint(P0, o) {
    const icon = !!o.icon, view = o.view || 'front';
    const P = o.pose === 'sleep' ? sleepSpec(P0) : P0;
    const cw = icon ? 32 : 64;
    const L = layout(P, cw, cw, icon ? { icon: true, H: o.H, hb: o.hb, clipY: o.clipY || 29 } : { H: o.H });
    L.view = view;
    const pal = makePalette(P, o.alt);
    const cv = new KCanvas(cw, cw);
    if (icon) cv.limit = (x, y) => y <= L.clipY;
    const parts = icon ? iconParts(P) : P.parts;
    const run = (stage) => {
      for (const p of parts) {
        const def = PARTS[p[0]];
        if (!def) throw new Error('kigu: unknown part ' + p[0] + ' in ' + P.id);
        if (def[stage]) def[stage](cv, L, p[1] || {}, view);
      }
    };
    run('behind');
    if (view === 'front') hairBack(cv, L, P, view);
    drawLegs(cv, L, P);
    drawBody(cv, L, P, view);
    run('legs');
    run('outfit');
    if (view === 'back') hairFront(cv, L, P, view);
    drawArms(cv, L, P, view);
    run('arms');
    if (view === 'front') hairFront(cv, L, P, view);
    if (view === 'back') hairBack(cv, L, P, view);
    drawHeadCore(cv, L, P, view);
    run('headgear');
    run('front');
    return cv.resolve(pal, icon
      ? { maxColors: 12, toneMin: -1, toneMax: 0, protect: [['eye', -1], ['eye', 0], ['shine', 0], ['blush', 0], ['skin', 0]] }
      : { maxColors: 16, protect: [['eye', -1], ['eye', 1], ['shine', 0], ['blush', 0], ['skin', 0], ['skin', -1]] });
  }

  // ------------------------------------------------------------------ fitting
  /** Solve the body height H so the front sprite's bounding box is exactly spec.size tall (and inside the canvas). */
  function fitBody(P) {
    if (fitCache.has(P.id)) return fitCache.get(P.id);
    let H = P.size - (P.rise || 0), best = null;
    for (let it = 0; it < 7; it++) {
      const bb = paint(P, { view: 'front', H }).bbox();
      const clipX = bb.x <= 0 || bb.x + bb.w >= 64, clipY = bb.y <= 0;
      const eff = bb.h + (clipY ? 3 : 0);
      const err = P.size - eff;
      const score = Math.abs(err) + (clipX || clipY ? 100 : 0);
      if (!best || score < best.score) best = { H, score };
      if (err === 0 && !clipX && !clipY) break;
      let Hn = (H * P.size) / Math.max(10, eff);
      if (clipX) Hn = Math.min(Hn, H * 0.94);
      if (Math.abs(Hn - H) < 0.2) Hn = H + (err > 0 ? 0.4 : -0.4);
      H = clamp(Hn, 18, 72);
    }
    fitCache.set(P.id, best.H);
    return best.H;
  }
  const ICON_HB = 25;
  /** Largest icon scale (head size) at which the whole crop fits inside the 32x32 canvas. */
  function fitIcon(P) {
    const key = 'icon:' + P.id;
    if (fitCache.has(key)) return fitCache.get(key);
    const I = P.icon || {};
    const ks = I.k ? [I.k] : [0.92, 0.86, 0.8, 0.74, 0.68, 0.62, 0.56];
    const hb = I.hb || ICON_HB;
    let pick = ks[ks.length - 1];
    for (const k of ks) {
      const bb = paint(P, { view: 'front', icon: true, H: 44 * k, hb: hb - 1 }).bbox(); // the hopped frame is the tallest
      if (bb.y >= 2 && bb.x >= 1 && bb.x + bb.w <= 30) { pick = k; break; }
    }
    fitCache.set(key, pick);
    return pick;
  }

  function get(id, view, alt, pose, frame) {
    const key = id + '|' + view + '|' + (alt ? 1 : 0) + '|' + (pose || '') + '|' + (frame === undefined ? '' : frame);
    let b = cache.get(key);
    if (b) return b;
    const P = K.looks[id];
    if (!P) throw new Error('kigu: unknown id ' + id);
    if (view === 'icon') {
      const k = fitIcon(P), hb = (P.icon && P.icon.hb) || ICON_HB;
      b = paint(P, { view: 'front', icon: true, H: 44 * k, hb: frame ? hb - 1 : hb, alt, pose });
    } else {
      b = paint(P, { view, H: fitBody(P), alt, pose: view === 'front' ? pose : undefined });
    }
    cache.set(key, b);
    return b;
  }

  K.front = (id, opts) => get(id, 'front', !!(opts && opts.alt), opts && opts.pose);
  K.back = (id, opts) => get(id, 'back', !!(opts && opts.alt), undefined);
  K.icon = (id, frame, opts) => get(id, 'icon', !!(opts && opts.alt), opts && opts.pose, frame ? 1 : 0);
  K.clearCache = () => { cache.clear(); fitCache.clear(); };
})(typeof globalThis !== 'undefined' ? globalThis : window);
