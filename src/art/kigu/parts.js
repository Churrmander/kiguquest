/* src/art/kigu/parts.js — layout + the part library (tails, wings, capes, outfit pieces, hats) for Kigu look specs.
 *
 * A part is { stage: fn(cv, L, o, view) }.  Stages run back-to-front:
 *   behind, legs, body | outfit, arms | head (core) | headgear, front
 * L is the layout (anchor points, radii); o the part's options from the spec; view is 'front' | 'back'.
 * Parts know three situations: a battle sprite seen from the front, from the back (tails/wings come forward, bows and
 * straps appear, ears lose their inner colour), and the 32x32 party icon (a head-and-shoulders crop: L.icon is true, the
 * bottom of the canvas is clipped at L.clipY, tails peek out beside the bust).
 * The `shapes` part is a tiny DSL so one-off props need no new code (coords are offsets from an anchor, in "44px units").
 */
(function (root) {
  'use strict';
  const NP = (root.NP = root.NP || {});
  const K = (NP.art.kigu = NP.art.kigu || {});
  const kit = K._kit;
  const KCanvas = kit.KCanvas;
  const PARTS = (K._parts = K._parts || {});
  const R = Math.round;
  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);

  // ------------------------------------------------------------------ layout
  /** o: { H (body height head-top..feet, in px), icon, hb (icon head-bottom row), clipY (icon visible bottom row) } */
  function layout(P, cw, ch, o) {
    o = o || {};
    const icon = !!o.icon;
    const H = o.H;
    const k = H / 44;
    const cx = cw / 2 - 0.5;
    const hry = R(H * 0.225), hrx = R(H * 0.275 * (P.headW || 1));
    let bot, hcy;
    if (icon) {
      hcy = o.hb - hry;
      bot = hcy - hry + R(H) - 1;
    } else {
      bot = ch - 4; // last row of the feet (the outline sits on row ch-2)
      hcy = R(bot + 1 - H) + hry;
    }
    const L = { cx, k, H, bot, hry, hrx, hcy, frx: hrx - 2, fry: hry - 2, fcy: hcy + 1, icon, cw, ch, clipY: icon ? o.clipY : ch };
    L.hb = hcy + hry;
    L.th = R(H * 0.4 * (P.bodyH || 1));
    L.tt = L.hb - 2;
    L.tb = Math.min(L.tt + L.th, bot - 4);
    L.bw = R(H * 0.19 * (P.bodyW || 1));
    L.hy = icon ? L.hb + R(3 * k) : L.tt + R((L.tb - L.tt) * 0.6 + 1);
    L.anc = {
      head: [cx, hcy - hry], face: [cx, L.fcy], neck: [cx, L.hb - 1], chest: [cx, L.tt + R(L.th * 0.45)],
      waist: [cx, L.tb - 3], hip: [cx, L.tb], feet: [cx, bot], back: [cx, L.tt + R(L.th * 0.4)],
      handL: [cx - L.bw - 1, L.hy], handR: [cx + L.bw + 1, L.hy],
      shL: [cx - L.bw + 2, L.tt + 6], shR: [cx + L.bw - 2, L.tt + 6],
      earL: [cx - R(hrx * 0.62), hcy - R(hry * 0.78)], earR: [cx + R(hrx * 0.62), hcy - R(hry * 0.78)],
      sideL: [cx - hrx, hcy], sideR: [cx + hrx, hcy], foot: [cx, bot - 1],
    };
    return L;
  }

  // ------------------------------------------------------------------ shape DSL
  function drawShapes(cv, L, list, anchor, mirror, scaled) {
    const a = L.anc[anchor || 'face'];
    const k = scaled === false ? 1 : L.k;
    const sides = mirror ? [1, -1] : [1];
    for (const s of sides) {
      const X = (x) => a[0] + s * x * k;
      const Y = (y) => a[1] + y * k;
      const W = (v) => Math.max(0, v * k);
      for (const sh of list) {
        const op = sh[0];
        if (op === 'e') cv.ell(X(sh[1]), Y(sh[2]), W(sh[3]), W(sh[4]), sh[5], sh[6]);
        else if (op === 'r') {
          const x0 = s > 0 ? X(sh[1]) : X(sh[1] + sh[3]);
          cv.rect(x0, Y(sh[2]), W(sh[3]), Math.max(1, W(sh[4])), sh[5], sh[6]);
        } else if (op === 'l') cv.line(X(sh[1]), Y(sh[2]), X(sh[3]), Y(sh[4]), sh[5], sh[6]);
        else if (op === 'p') cv.poly(sh[1].map((p) => [X(p[0]), Y(p[1])]), sh[2], sh[3]);
        else if (op === 'c') cv.capsule(X(sh[1]), Y(sh[2]), X(sh[3]), Y(sh[4]), W(sh[5]), W(sh[6]), sh[7], sh[8]);
        else if (op === 'd') cv.plot(X(sh[1]), Y(sh[2]), sh[3], sh[4]);
        else if (op === 's') cv.stroke(sh[1].map((p) => [X(p[0]), Y(p[1])]), W(sh[2]), W(sh[3]), sh[4], sh[5]);
        else if (op === 'o') cv.ring(X(sh[1]), Y(sh[2]), W(sh[3]), W(sh[4]), Math.max(1, W(sh[5])), sh[6], sh[7]);
      }
    }
  }
  const HEAD_ANCHORS = /^(head|face|earL|earR|sideL|sideR|neck)$/;

  /** shapes: { stage, at, m, list, g, shade, hi, cast, view:'front'|'back'|undefined, ic:true (also in icons) } */
  PARTS.shapes = {};
  for (const st of ['behind', 'outfit', 'headgear', 'front', 'arms', 'legs']) {
    PARTS.shapes[st] = function (cv, L, o, view) {
      if ((o.stage || 'front') !== st) return;
      if (o.view && o.view !== view) return;
      if (L.icon && !o.ic && !HEAD_ANCHORS.test(o.at || 'face')) return;
      cv.begin(o.g || 'deco', { shade: o.shade === undefined ? 1 : o.shade, hi: o.hi, cast: o.cast, line: o.line, noLineOn: o.noLineOn });
      drawShapes(cv, L, o.list, o.at, o.m, o.scaled);
      if (o.then) o.then(cv, L);
    };
  }

  // ------------------------------------------------------------------ path stroke helper
  function pathStroke(cv, pts, rf, mat, tone, t0, t1) {
    let len = 0;
    for (let i = 1; i < pts.length; i++) len += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
    const steps = Math.max(3, Math.ceil(len * 2));
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      if (t < (t0 || 0) || t > (t1 === undefined ? 1 : t1)) continue;
      const [x, y] = KCanvas.bez(pts, t);
      const r = rf(t);
      if (r < 0.4) cv.plot(x, y, mat, tone); else cv.circ(x, y, r, mat, tone);
    }
  }

  // ------------------------------------------------------------------ tails
  const TAIL_R = {
    fluff: (r) => (t) => r * (0.5 + 0.75 * Math.sin(Math.PI * (0.1 + 0.8 * t))),
    taper: (r) => (t) => r * (1 - 0.7 * t),
    paddle: (r) => (t) => r * (0.55 + 0.6 * Math.sin(Math.PI * (0.1 + 0.7 * t))),
    slim: (r) => () => r * 0.45,
    even: (r) => () => r * 0.8,
  };
  const DEG = Math.PI / 180;

  function tailPath(bx, by, ang, len, o, k) {
    const s = Math.sin(ang), c = Math.cos(ang);
    const curl = (o.curl === undefined ? 0.35 : o.curl) * len * (s >= 0 ? 1 : -1);
    const ex = bx + s * len, ey = by - c * len;
    const mx = bx + s * len * 0.35 + c * curl * 0.3, my = by - c * len * 0.35;
    return [[bx, by], [mx + (o.bend || 0) * s * k, my], [ex, ey]];
  }

  function drawTail(cv, L, o, view) {
    const k = L.k, mat = o.mat || 'main', kind = o.kind || 'fluff';
    const back = view === 'back' && !o.behind;
    const icon = L.icon;
    const name = o.g || 'tail';
    const n = o.n || 1;

    // ---- single round puff (bunny, hamster, bear)
    if (kind === 'puff') {
      cv.begin(name, { shade: 2, hi: 0, family: 'tail' });
      let x, y, r = (o.r || 4) * k;
      if (icon) { x = L.cx + L.bw + 1; y = L.clipY - 3; r *= 0.85; } else if (back) { x = L.cx + (o.backDx || 0) * k; y = L.tb - 1 * k + (o.dy || 0) * k; r *= 1.25; } else { x = L.cx + (o.dx || 0) * k; y = L.tb - 2 * k + (o.dy || 0) * k; }
      cv.circ(x, y, r, back && o.tip ? o.tip : mat);
      if (o.tip && !back) cv.decal(cv.cur, () => cv.circ(x + 1, y + 1, r * 0.55, o.tip));
      return;
    }
    // ---- zig-zag lightning tail
    if (kind === 'bolt') {
      cv.begin(name, { shade: 2, hi: 0, family: 'tail' });
      const s = (o.side || 1);
      let bx = L.anc.waist[0], by = L.anc.waist[1] + 2, sc = (o.sc || 0.8) * k;
      if (icon) { bx = L.cx + L.bw - 2; by = L.clipY + 2; sc *= 0.6; } else if (back) { bx = L.cx + s * 1; by = L.tb; }
      const pts = [[0, 0], [9, -4], [5, -6], [14, -12], [9, -14], [18, -22], [17, -15], [21, -17], [14, -4], [16, -3], [6, 4]];
      cv.poly(pts.map((p) => [bx + s * p[0] * sc, by + p[1] * sc]), mat);
      return;
    }

    // ---- path tails (fox, cat, otter, dragon, generic fluffy)
    const fan = ((o.fan === undefined ? (n > 1 ? 120 : 0) : o.fan) * DEG);
    const shape = o.shape || (kind === 'cat' ? 'slim' : kind === 'otter' ? 'paddle' : kind === 'dragon' ? 'taper' : 'fluff');
    const tipAt = o.tipAt === undefined ? 0.8 : o.tipAt;
    let bx, by, len = (o.len || 16) * k, rr = (o.r || 4) * k, angs = [];
    const side = o.side === undefined ? 1 : o.side;
    const a0 = (o.angle === undefined ? 38 : o.angle) * DEG;
    if (icon) {
      if (n >= 3) { bx = L.cx; by = L.hcy + 1; len = L.hrx + 4 + (o.iconReach || 0); rr = Math.max(1.6, rr * 0.55); for (let i = 0; i < n; i++) angs.push(-fan / 2 + (fan * i) / (n - 1)); } else {
        bx = L.cx + (n === 1 ? side * (L.bw - 2) : 0); by = L.clipY + 1 + (o.iconDy || 0);
        len = Math.min(len * 0.85, 13); rr = Math.max(1.8, rr * 0.8);
        if (n === 1) angs.push(side * clamp(a0, 28 * DEG, 50 * DEG)); else angs.push(-0.66, 0.66);
      }
    } else if (back) {
      bx = L.cx + (o.backDx || 0) * k; by = L.tb - 2 * k + (o.backDy || 0) * k;
      if (n === 1) angs.push(side * a0 * (o.backAngle === undefined ? 0.55 : o.backAngle));
      else if (n === 2) { angs.push(-(a0 * 0.6), a0 * 0.6); } else for (let i = 0; i < n; i++) angs.push(-fan / 2 + (fan * i) / (n - 1));
    } else {
      const b = L.anc[o.base || 'waist'];
      bx = b[0] + (o.dx || 0) * k; by = b[1] + (o.dy || 0) * k;
      if (n === 1) angs.push(side * a0);
      else if (n === 2 && !o.fan) angs.push(-0.6, 0.6);
      else for (let i = 0; i < n; i++) angs.push(-fan / 2 + (fan * i) / (n - 1));
    }
    const order = angs.map((a, i) => i).sort((p, q) => Math.abs(angs[q]) - Math.abs(angs[p])); // outermost first = furthest behind
    const rf = TAIL_R[shape](rr);
    let gi = 0;
    for (const i of order) {
      const ang = angs[i];
      const ln = o.lenJitter && n > 1 ? len * (1 - o.lenJitter * Math.abs(ang) / (fan / 2 || 1)) : len;
      const pts = tailPath(bx, by, ang, ln, o, k);
      cv.begin(name + (n > 1 ? gi++ : ''), { shade: 2, hi: o.hi || 0, cast: 0, family: 'tail' + (n > 1 ? i : '') });
      pathStroke(cv, pts, rf, mat);
      if (o.tip) pathStroke(cv, pts, rf, o.tip, 0, tipAt, 1);
      if (o.tip2) pathStroke(cv, pts, (t) => rf(t) * 0.45, o.tip2, 0, 0.3, 0.7); // inner stripe
      if (kind === 'dragon') {
        for (let j = 1; j <= 3; j++) {
          const [x, y] = KCanvas.bez(pts, 0.25 * j + 0.05);
          cv.poly([[x - 1, y], [x + 1, y], [x, y - 3 * k]], o.spike || 'sub');
        }
      }
      if (o.flame) {
        const [x, y] = pts[pts.length - 1];
        const f = icon ? 0.7 : 1;
        cv.begin('flame' + i, { shade: 0, hi: 0, line: true, lineMat: o.flame });
        cv.poly([[x - 3 * k * f, y], [x + 3 * k * f, y], [x + 2 * k * f, y - 4 * k * f], [x, y - 9 * k * f], [x - 1 * k * f, y - 5 * k * f], [x - 3 * k * f, y - 3 * k * f]], o.flame, 0);
        cv.poly([[x - 1.5 * k * f, y], [x + 1.5 * k * f, y], [x, y - 4 * k * f]], o.flameCore || 'sub', 0);
      }
    }
  }
  PARTS.tail = {
    behind(cv, L, o, view) { if (!L.icon && (o.behind || (view === 'front' && !o.over))) drawTail(cv, L, o, view); else if (L.icon) drawTail(cv, L, o, view); },
    outfit(cv, L, o, view) { if (!L.icon && !o.behind && (view === 'back' || o.over)) drawTail(cv, L, o, view); },
  };

  // ------------------------------------------------------------------ wings
  // half-width (in 44px units, measured from the shoulder) of each wing shape; the renderer scales wings to fit the canvas.
  const WING_W = { moth: 26, insect: 14, bat: 28, feather: 24, angel: 18 };
  function drawWing(cv, L, o, view) {
    cv.begin(o.g || 'wing', { shade: 2, hi: 0, family: 'wing' });
    const k = L.k, kind = o.kind || 'moth', mat = o.mat || 'main', m2 = o.mat2 || 'sub', m3 = o.mat3 || m2;
    const shoulder = L.bw - 2;
    const span = o.span || L.cw / 2 - (L.icon ? 2 : 4);
    const sz = o.sz || clamp((span - shoulder) / (WING_W[kind] * k), 0.3, 1.25);
    for (const s of [-1, 1]) {
      const sx = L.cx + s * shoulder, sy = L.tt + (o.dy === undefined ? 5 : o.dy) * k;
      const u = k * sz;
      const X = (x) => sx + s * x * u, Y = (y) => sy + y * u;
      const poly = (pts, m, t) => cv.poly(pts.map((p) => [X(p[0]), Y(p[1])]), m, t);
      if (kind === 'moth') {
        poly([[0, -2], [5, -14], [14, -25], [23, -23], [26, -13], [22, -3], [12, 3], [3, 4]], mat);
        poly([[2, 3], [14, 2], [22, 8], [21, 18], [14, 24], [7, 18], [3, 10]], mat);
        cv.decal(cv.cur, () => {
          cv.ell(X(19), Y(-14), 3.4 * u, 3.4 * u, m2);
          cv.ell(X(19), Y(-14), 1.6 * u, 1.6 * u, m3, 0);
          cv.ell(X(15), Y(13), 2.6 * u, 2.6 * u, m2);
          cv.line(X(5), Y(-4), X(14), Y(-16), m3);
        });
      } else if (kind === 'insect') {
        cv.ell(X(8), Y(-12), 5 * u, 11 * u, mat);
        cv.ell(X(7), Y(3), 4 * u, 7 * u, mat);
        cv.decal(cv.cur, () => cv.line(X(8), Y(-20), X(7), Y(-4), m2));
      } else if (kind === 'bat') {
        poly([[0, 0], [6, -14], [14, -24], [18, -14], [24, -18], [27, -8], [22, -2], [26, 6], [16, 6], [10, 12], [3, 8]], mat);
        cv.decal(cv.cur, () => { cv.line(X(2), Y(-2), X(14), Y(-22), m2); cv.line(X(3), Y(-1), X(23), Y(-16), m2); cv.line(X(3), Y(1), X(25), Y(3), m2); });
      } else if (kind === 'feather') {
        poly([[0, 0], [6, -10], [14, -19], [21, -25], [23, -19], [22, -13], [24, -12], [22, -5], [18, 1], [12, 5], [4, 6]], mat);
        cv.decal(cv.cur, () => {
          for (let j = 0; j < 4; j++) cv.line(X(8 + j * 3.5), Y(-4 - j * 3), X(21 + j * 0.8), Y(-22 + j * 5), m2, -1);
          cv.stroke([[X(18), Y(-14)], [X(23), Y(-19)], [X(23), Y(-12)]], 1.5 * u, 1 * u, m3);
        });
      } else if (kind === 'angel') {
        poly([[0, 0], [4, -12], [10, -22], [16, -20], [18, -10], [15, -2], [9, 2]], mat);
        cv.ell(X(8), Y(6), 5 * u, 7 * u, mat);
      }
    }
  }
  PARTS.wings = {
    behind(cv, L, o, view) { if (L.icon || (view === 'front' && !o.over)) drawWing(cv, L, o, view); },
    outfit(cv, L, o, view) { if (!L.icon && (view === 'back' || o.over)) drawWing(cv, L, o, view); },
  };

  // cape: trapezoid cloak behind the body (front view) / over the back (back view)
  function drawCape(cv, L, o, view) {
    const k = L.k, mat = o.mat || 'acc';
    cv.begin('cape', { shade: 2, hi: 0 });
    const y0 = L.hb - 1, y1 = Math.min(L.bot, L.tb + (o.drop === undefined ? 5 : o.drop) * k);
    const w0 = L.bw + 1, w1 = L.bw + (o.flare === undefined ? 6 : o.flare) * k;
    cv.poly([[L.cx - w0, y0], [L.cx + w0 + 1, y0], [L.cx + w1 + 1, y1], [L.cx - w1, y1]], mat);
    if (o.trim) cv.decal('cape', () => cv.rect(L.cx - w1 - 1, y1 - 2, w1 * 2 + 3, 2, o.trim));
    if (view === 'back' && o.emblem) cv.decal('cape', () => { cv.circ(L.cx - 0.5, L.tt + 8 * k, 3 * k, o.emblem); cv.circ(L.cx - 0.5, L.tt + 8 * k, 1.2 * k, mat, 0); });
  }
  PARTS.cape = {
    behind(cv, L, o, view) { if (L.icon || (view === 'front' && !o.over)) drawCape(cv, L, o, view); },
    outfit(cv, L, o, view) { if (!L.icon && (view === 'back' || o.over)) drawCape(cv, L, o, view); },
  };

  // ------------------------------------------------------------------ outfit pieces
  function bowAt(cv, x, y, k, mat, tails) {
    cv.poly([[x, y], [x - 5 * k, y - 3 * k], [x - 5 * k, y + 3 * k]], mat);
    cv.poly([[x + 1, y], [x + 6 * k, y - 3 * k], [x + 6 * k, y + 3 * k]], mat);
    cv.circ(x + 0.5, y, 1.3 * k, mat, -1);
    if (tails) { cv.line(x, y + 1, x - 2 * k, y + 6 * k, mat, -1); cv.line(x + 1, y + 1, x + 3 * k, y + 6 * k, mat, -1); }
  }
  /** dress / skirt flaring from the waist. o: { mat, len, flare, trim, scallop, up, pat, bow } */
  PARTS.skirt = {
    outfit(cv, L, o, view) {
      if (L.icon) return;
      const k = L.k, mat = o.mat || 'sub';
      cv.begin(o.g || 'skirt', { shade: 2, hi: 0, noLineOn: o.noLineOn });
      const y0 = L.tb - (o.up === undefined ? 7 : o.up) * k, y1 = Math.min(L.bot, L.tb + (o.len === undefined ? 4 : o.len) * k);
      const w0 = L.bw - 1, w1 = L.bw + (o.flare === undefined ? 4 : o.flare) * k;
      cv.poly([[L.cx - w0, y0], [L.cx + w0 + 1, y0], [L.cx + w1 + 1, y1], [L.cx - w1, y1]], mat);
      if (o.scallop) {
        const n = o.scallop;
        for (let i = 0; i < n; i++) { const rr = (w1 * 2 + 1) / n / 2; cv.circ(L.cx - w1 + ((i + 0.5) * (w1 * 2 + 1)) / n, y1 - rr + 1, rr, mat); }
      }
      if (o.trim) cv.decal(cv.cur, () => cv.rect(L.cx - w1 - 2, y1 - 1, w1 * 2 + 5, 2, o.trim));
      if (o.pat === 'stripe') cv.decal(cv.cur, () => { for (let x = L.cx - w1; x < L.cx + w1 + 2; x += 4) cv.rect(x, y0, 2, y1 - y0 + 3, o.mat2 || 'main'); });
      if (o.pat === 'petals') cv.decal(cv.cur, () => { for (let x = L.cx - w1 + 2; x < L.cx + w1; x += 5) cv.ell(x, y1 - 3, 1.4, 2.2, o.mat2 || 'main'); });
      if (view === 'back' && o.bow) { cv.begin((o.g || 'skirt') + 'bow', { shade: 1, hi: 0, cast: 0 }); bowAt(cv, L.cx - 0.5, y0 + 2, k, o.bow, true); }
    },
  };
  /** belly patch / apron / bib / jacket / poncho on the torso. o: { mat, kind, trim, pocket, straps, emblem, bow, len } */
  PARTS.belly = {
    outfit(cv, L, o, view) {
      const k = L.k, mat = o.mat || 'sub', kind = o.kind || 'oval';
      const back = view === 'back';
      if (back && (kind === 'oval' || kind === 'v')) return;
      cv.begin(o.g || 'belly', { shade: 1, hi: 0, cast: 0 });
      const cy = L.tt + R(L.th * 0.68);
      if (kind === 'oval') cv.ell(L.cx, cy, R((L.bw - 3) * (o.w || 1)), R(L.th * 0.3 * (o.h || 1)), mat);
      else if (kind === 'apron') {
        if (back) { // only the strap across the back and the sash bow show
          cv.rect(L.cx - L.bw + 1, L.tb - 6 * k, L.bw * 2, 2, mat);
          cv.begin('apronbow', { shade: 1, hi: 0, cast: 0 });
          bowAt(cv, L.cx - 0.5, L.tb - 5 * k, k, mat, true);
          return;
        }
        cv.poly([[L.cx - L.bw + 3, L.tt + 6], [L.cx + L.bw - 2, L.tt + 6], [L.cx + L.bw, L.tb + 2], [L.cx - L.bw + 1, L.tb + 2]], mat);
        if (o.pocket) cv.decal(cv.cur, () => cv.rect(L.cx - 3, L.tb - 6, 7, 4, o.pocket));
      } else if (kind === 'bib') {
        if (back) { // crossed straps
          cv.line(L.cx - 4, L.tt + 5, L.cx + 4, L.tb - 4, o.straps || mat); cv.line(L.cx + 4, L.tt + 5, L.cx - 4, L.tb - 4, o.straps || mat);
          cv.line(L.cx - 3, L.tt + 5, L.cx + 5, L.tb - 4, o.straps || mat); cv.line(L.cx + 5, L.tt + 5, L.cx - 3, L.tb - 4, o.straps || mat);
          return;
        }
        cv.rect(L.cx - 4, L.tt + 6, 8, L.th - 5, mat);
        cv.rect(L.cx - 5, L.tb - 5, 10, 6, mat);
        if (o.straps) cv.decal(cv.cur, () => { cv.rect(L.cx - 4, L.tt + 4, 2, 4, o.straps); cv.rect(L.cx + 2, L.tt + 4, 2, 4, o.straps); });
      } else if (kind === 'poncho') {
        const y1 = Math.min(L.bot, L.tb + (o.len === undefined ? 3 : o.len) * k), wb = L.bw + 4 * k;
        cv.poly([[L.cx - L.bw + 1, L.hb], [L.cx + L.bw, L.hb], [L.cx + wb + 1, y1], [L.cx - wb, y1]], mat);
        if (o.trim) cv.decal(cv.cur, () => cv.rect(L.cx - wb - 1, y1 - 1, wb * 2 + 3, 2, o.trim));
        if (o.front !== false && !back) cv.cut(() => cv.poly([[L.cx - 0.5, L.hb + 5], [L.cx + 1.5, L.hb + 5], [L.cx + 1, y1 - 1], [L.cx, y1 - 1]]), cv.cur);
        if (back) cv.decal(cv.cur, () => cv.line(L.cx - 0.5, L.hb + 2, L.cx - 0.5, y1 - 2, mat, -1));
      } else if (kind === 'jacket') {
        const y1 = Math.min(L.bot, L.tb + (o.len === undefined ? 1 : o.len) * k), wb = L.bw + 1;
        cv.poly([[L.cx - L.bw + 1, L.hb], [L.cx + L.bw, L.hb], [L.cx + wb + 1, y1], [L.cx - wb, y1]], mat);
        if (!back) cv.cut(() => cv.poly([[L.cx - 1.5, L.hb + 3], [L.cx + 2.5, L.hb + 3], [L.cx + 3, y1 + 1], [L.cx - 2, y1 + 1]]), cv.cur);
        if (o.trim) cv.decal(cv.cur, () => { cv.rect(L.cx - wb - 1, y1 - 1, wb * 2 + 3, 2, o.trim); if (!back) { cv.rect(L.cx - 3, L.hb + 3, 2, y1 - L.hb - 3, o.trim); cv.rect(L.cx + 2, L.hb + 3, 2, y1 - L.hb - 3, o.trim); } });
        if (back && o.emblem) cv.decal(cv.cur, () => { cv.circ(L.cx - 0.5, L.tt + 11 * k, 3.4 * k, o.emblem); cv.circ(L.cx - 0.5, L.tt + 11 * k, 1.4 * k, mat, 0); });
        if (back) cv.decal(cv.cur, () => cv.line(L.cx - 0.5, L.hb + 2, L.cx - 0.5, y1 - 2, mat, -1));
      } else if (kind === 'v') {
        cv.poly([[L.cx - 5, L.tt + 5], [L.cx + 6, L.tt + 5], [L.cx + 1, L.tb]], mat);
      }
    },
  };
  /** generic horizontal stripes on the body (bee, tiger...) */
  PARTS.stripes = {
    outfit(cv, L, o, view) {
      cv.decal('body', () => {
        for (let y = L.tt + (o.y0 || 8); y < L.tb; y += o.step || 5) cv.rect(L.cx - L.bw - 2, y, (L.bw + 2) * 2 + 2, o.th || 2, o.mat || 'acc');
      });
    },
  };
  /** spots on the body: o.pts offsets from chest */
  PARTS.spots = {
    outfit(cv, L, o, view) {
      if (view === 'back' && o.front) return;
      cv.decal('body', () => {
        for (const p of o.pts) cv.circ(L.cx + p[0] * L.k, L.anc.chest[1] + p[1] * L.k, (p[2] || 1) * L.k, o.mat || 'acc');
      });
    },
  };
  PARTS.scarf = {
    outfit(cv, L, o, view) {
      const k = L.k, mat = o.mat || 'acc';
      cv.begin('scarf', { shade: 2, hi: 0, cast: 0 });
      cv.ell(L.cx, L.hb + 0, L.bw - 1 + (o.thick || 0), 2.3 * k, mat);
      if (o.hang !== false) {
        const s = o.side || 1;
        cv.capsule(L.cx + s * (L.bw - 3), L.hb + 1, L.cx + s * (L.bw - 2), L.hb + (o.hang || 9) * k, 2 * k, 1.8 * k, mat);
        if (o.stripe) cv.decal('scarf', () => cv.rect(L.cx + s * (L.bw - 5), L.hb + (o.hang || 9) * k - 3, 6, 1, o.stripe));
      }
    },
  };
  /** collar: sailor / lace / ruff around the neck. */
  PARTS.collar = {
    outfit(cv, L, o, view) {
      const k = L.k, mat = o.mat || 'sub';
      cv.begin('collar', { shade: 1, hi: 0 });
      if (o.kind === 'sailor') {
        if (view === 'back') { // square sailor flap down the back
          cv.poly([[L.cx - L.bw + 1, L.hb], [L.cx + L.bw, L.hb], [L.cx + L.bw - 1, L.hb + 7 * k], [L.cx - L.bw + 2, L.hb + 7 * k]], mat);
          if (o.trim) cv.decal('collar', () => { cv.rect(L.cx - L.bw + 2, L.hb + 5 * k, L.bw * 2 - 2, 1, o.trim); });
          return;
        }
        cv.poly([[L.cx - L.bw + 1, L.hb], [L.cx + L.bw, L.hb], [L.cx + 3, L.hb + 8 * k], [L.cx - 2, L.hb + 8 * k]], mat);
        if (o.trim) cv.decal('collar', () => { cv.line(L.cx - L.bw + 2, L.hb + 2, L.cx - 2, L.hb + 7 * k, o.trim); cv.line(L.cx + L.bw - 1, L.hb + 2, L.cx + 3, L.hb + 7 * k, o.trim); });
      } else cv.ell(L.cx, L.hb, L.bw, 2.6 * k, mat);
    },
  };
  PARTS.bowtie = {
    outfit(cv, L, o, view) {
      const k = L.k, y = L.hb + 1;
      cv.begin('bow', { shade: 1, hi: 0, cast: 0 });
      cv.poly([[L.cx, y], [L.cx - 5 * k, y - 2 * k], [L.cx - 5 * k, y + 3 * k]], o.mat || 'acc');
      cv.poly([[L.cx + 1, y], [L.cx + 6 * k, y - 2 * k], [L.cx + 6 * k, y + 3 * k]], o.mat || 'acc');
      cv.circ(L.cx + 0.5, y + 0.5, 1.4 * k, o.mat2 || o.mat || 'acc', 1);
    },
  };
  PARTS.bell = {
    outfit(cv, L, o, view) {
      const k = L.k, a = L.anc[o.at || 'neck'];
      if (view === 'back' && !o.both) return;
      cv.begin('bell', { shade: 1, hi: 3, cast: 0 });
      cv.circ(a[0] + (o.dx || 0) * k, a[1] + (o.dy === undefined ? 4 : o.dy) * k, (o.r || 2) * k, o.mat || 'gold');
    },
  };

  /** ring (life ring / swim ring / hoop) at an anchor. */
  PARTS.ring = {
    front(cv, L, o, view) {
      if (L.icon || (view === 'back' && !o.both)) return;
      const a = L.anc[o.at || 'waist'], k = L.k;
      cv.begin('ring', { shade: 1, hi: 3, cast: 0 });
      cv.ring(a[0] + (o.dx || 0) * k, a[1] + (o.dy || 0) * k, (o.rx || 9) * k, (o.ry || 4) * k, (o.th || 2.4) * k, o.mat || 'sub');
      if (o.mat2) cv.decal('ring', () => { const n = o.n || 4; for (let i = 0; i < n; i++) { const a2 = (i / n) * Math.PI * 2; cv.circ(a[0] + (o.dx || 0) * k + Math.cos(a2) * (o.rx || 9) * k, a[1] + (o.dy || 0) * k + Math.sin(a2) * (o.ry || 4) * k, 1.3 * k, o.mat2); } });
    },
  };

  // ------------------------------------------------------------------ hats / headgear
  const HG = {};
  // each: (cv, L, o, hx, hy, k, view) where (hx,hy) = top-centre of head (hy = top of hood)
  HG.tophat = (cv, L, o, hx, hy, k) => {
    const dx = (o.dx || 0) * k;
    cv.begin('hat', { shade: 2, hi: 4, cast: 2 });
    cv.rect(hx - 6 * k + dx, hy - 10 * k + 2, 12 * k, 10 * k, o.mat || 'acc');
    cv.decal('hat', () => cv.rect(hx - 6 * k + dx, hy - 2 * k + 1, 12 * k, 2 * k, o.band || 'sub'));
    cv.ell(hx + dx, hy + 2, 9 * k, 1.8 * k, o.mat || 'acc');
    if (o.tilt) cv.shiftGroup('hat', R(o.tilt), 0);
  };
  HG.chef = (cv, L, o, hx, hy, k) => {
    cv.begin('hat', { shade: 2, hi: 0, cast: 2 });
    cv.rect(hx - 7 * k, hy - 2 * k + 1, 14 * k, 4 * k, o.mat || 'sub');
    cv.circ(hx - 5 * k, hy - 5 * k, 4 * k, o.mat || 'sub');
    cv.circ(hx + 5 * k, hy - 5 * k, 4 * k, o.mat || 'sub');
    cv.circ(hx, hy - 8 * k, 5 * k, o.mat || 'sub');
  };
  HG.hard = (cv, L, o, hx, hy, k) => {
    cv.begin('hat', { shade: 2, hi: 2, cast: 2 });
    cv.ell(hx, hy + 1, 9 * k, 6 * k, o.mat || 'acc');
    cv.cut(() => cv.rect(hx - 12 * k, hy + 1 + 4 * k, 26 * k, 8 * k), 'hat');
    cv.rect(hx - 11 * k, hy + 2, 22 * k, 2 * k, o.mat || 'acc');
    cv.decal('hat', () => cv.rect(hx - 1, hy - 6 * k, 2, 6 * k + 2, o.mat2 || 'sub'));
    cv.begin('lamp', { shade: 0, hi: 3 });
    cv.circ(hx, hy - 1, 2.2 * k, o.lamp || 'lamp');
  };
  HG.mortar = (cv, L, o, hx, hy, k) => {
    cv.begin('hat', { shade: 2, hi: 0, cast: 2 });
    cv.rect(hx - 6 * k, hy - 1, 12 * k, 4 * k, o.mat || 'acc');
    cv.poly([[hx - 12 * k, hy - 2 * k], [hx, hy - 6 * k], [hx + 12 * k + 1, hy - 2 * k], [hx, hy + 2 * k]], o.mat || 'acc');
    cv.decal('hat', () => cv.line(hx, hy - 2 * k, hx + 10 * k, hy + 3 * k, o.tassel || 'gold'));
    cv.circ(hx + 10 * k, hy + 4 * k, 1.3 * k, o.tassel || 'gold');
  };
  HG.nightcap = (cv, L, o, hx, hy, k) => {
    cv.begin('hat', { shade: 2, hi: 0, cast: 2 });
    cv.ell(hx, hy + 2, 10 * k, 4 * k, o.mat || 'acc');
    cv.stroke([[hx - 2 * k, hy], [hx + 8 * k, hy - 8 * k], [hx + 12 * k, hy + 2 * k]], 5 * k, 2 * k, o.mat || 'acc');
    cv.decal('hat', () => cv.ell(hx, hy + 4, 10 * k, 1.5 * k, o.band || 'sub'));
    cv.begin('pom', { shade: 1, hi: 3 });
    cv.circ(hx + 12 * k, hy + 3 * k, 2.2 * k, o.band || 'sub');
  };
  HG.crown = (cv, L, o, hx, hy, k) => {
    cv.begin('crown', { shade: 1, hi: 4, cast: 1 });
    const n = o.points || 3, w = (o.w || 11) * k;
    cv.rect(hx - w, hy - 1, w * 2 + 1, 3 * k, o.mat || 'gold');
    for (let i = 0; i < n; i++) {
      const x = hx - w + (i * (w * 2)) / (n - 1) + 0.5;
      cv.poly([[x - 2 * k, hy - 1], [x + 2 * k, hy - 1], [x, hy - (o.h || 6) * k - (i % 2 === 0 ? 0 : 1)]], o.mat || 'gold');
    }
    if (o.gem) cv.decal('crown', () => cv.circ(hx, hy + 1, 1, o.gem));
  };
  HG.flowers = (cv, L, o, hx, hy, k) => {
    cv.begin('flowers', { shade: 1, hi: 0 });
    const n = o.n || 5;
    for (let i = 0; i < n; i++) {
      const t = (i + 0.5) / n, ang = Math.PI * (1.08 - 1.16 * t);
      const x = L.cx + Math.cos(ang) * (L.hrx - 1), y = L.hcy - Math.sin(ang) * (L.hry - 1) + 1;
      const mat = i % 2 ? o.mat2 || 'acc2' : o.mat || 'acc';
      cv.circ(x, y, (o.r || 2.2) * k, mat);
      cv.plot(x, y, o.core || 'sub', 0);
    }
  };
  HG.thimble = (cv, L, o, hx, hy, k) => {
    cv.begin('hat', { shade: 2, hi: 2, cast: 2 });
    cv.ell(hx, hy + 3 * k, 12 * k, 6 * k, o.mat || 'metal');
    cv.cut(() => cv.rect(hx - 14 * k, hy + 6 * k, 30 * k, 12 * k), 'hat');
    cv.decal('hat', () => { for (let y = hy - 2 * k; y < hy + 6 * k; y += 3) for (let x = hx - 9 * k + (y % 2); x < hx + 10 * k; x += 3) cv.plot(x, y, o.dot || 'metal', -1); });
  };
  HG.beret = (cv, L, o, hx, hy, k) => {
    cv.begin('hat', { shade: 2, hi: 4, cast: 2 });
    cv.ell(hx + 1, hy + 1, 12 * k, 4 * k, o.mat || 'acc');
    cv.plot(hx + 3, hy - 4 * k, o.mat || 'acc');
  };
  HG.cap = HG.beret;
  HG.rainhat = (cv, L, o, hx, hy, k) => {
    cv.begin('hat', { shade: 2, hi: 4, cast: 2 });
    cv.ell(hx, hy + 2, 16 * k, 3 * k, o.mat || 'acc');
    cv.ell(hx, hy - 1, 9 * k, 5 * k, o.mat || 'acc');
    cv.decal('hat', () => cv.rect(hx - 9 * k, hy + 1, 18 * k, 2, o.band || 'sub'));
  };
  HG.witch = HG.nightcap;
  HG.halo = (cv, L, o, hx, hy, k) => {
    cv.begin('halo', { shade: 0, hi: 0 });
    cv.ring(hx, hy - 5 * k, 8 * k, 2.2 * k, 1.5, o.mat || 'gold', 0);
  };
  HG.goggles = (cv, L, o, hx, hy, k, view) => {
    cv.begin('goggles', { shade: 1, hi: 3, cast: 0 });
    const y = hy + 4 * k;
    cv.rect(L.cx - 9 * k, y + 1, 18 * k, 2, o.strap || 'acc');
    if (view === 'back') { cv.circ(L.cx - 0.5, y + 2, 1.6 * k, o.rim || 'metal'); return; }
    cv.circ(L.cx - 4 * k, y, 3 * k, o.rim || 'metal');
    cv.circ(L.cx + 5 * k, y, 3 * k, o.rim || 'metal');
    cv.decal('goggles', () => { cv.circ(L.cx - 4 * k, y, 1.6 * k, o.lens || 'lens'); cv.circ(L.cx + 5 * k, y, 1.6 * k, o.lens || 'lens'); });
  };
  HG.headband = (cv, L, o, hx, hy, k, view) => {
    cv.begin('hband', { shade: 1, hi: 0, cast: 1 });
    const y = L.fcy - L.fry + (o.dy === undefined ? 3 : o.dy) * k;
    for (let x = L.cx - L.frx - 1; x <= L.cx + L.frx + 2; x++) {
      const dx = (x - L.cx) / (L.frx + 1.5);
      const yy = y + (1 - Math.sqrt(Math.max(0, 1 - dx * dx))) * 3 * k;
      cv.rect(x, yy, 1, 2, o.mat || 'acc');
    }
    if (o.knot) {
      if (view === 'back') { cv.begin('hknot', { shade: 1, hi: 0, cast: 0 }); bowAt(cv, L.cx - 0.5, y + 4, k * 0.9, o.mat || 'acc', true); } else cv.circ(L.cx + L.frx, y + 3, 1.6 * k, o.mat || 'acc');
    }
  };
  HG.antennae = (cv, L, o, hx, hy, k) => {
    cv.begin('antenna', { shade: 1, hi: 0, cast: 0, line: true });
    for (const s of [-1, 1]) {
      const bx = L.cx + s * 4 * k, by = hy + 3;
      cv.stroke([[bx, by], [bx + s * 2 * k, by - 6 * k], [bx + s * (o.sp || 6) * k, by - (o.h || 10) * k]], 1, 1, o.mat || 'acc');
      cv.circ(bx + s * (o.sp || 6) * k, by - (o.h || 10) * k, (o.ball || 1.6) * k, o.tip || o.mat || 'acc');
    }
  };
  HG.domino = (cv, L, o, hx, hy, k, view) => { // eye mask: drawn by the face code (render.js) so the eyes stay on top
    if (view === 'back') { cv.begin('maskknot', { shade: 0, line: false }); cv.rect(L.cx - L.hrx + 1, L.hcy, L.hrx * 2, 2, o.mat || 'acc', 0); }
  };
  HG.tuft = (cv, L, o, hx, hy, k) => { // feather/hair tuft on top
    cv.begin('tuft', { shade: 1, hi: 4 });
    for (let i = 0; i < (o.n || 3); i++) {
      const a = (i - ((o.n || 3) - 1) / 2) * 0.55;
      cv.stroke([[hx, hy + 3], [hx + Math.sin(a) * 4 * k, hy - 3 * k], [hx + Math.sin(a) * 8 * k * (o.lean || 1), hy - (o.h || 8) * k]], 2 * k, 0.6, o.mat || 'hair');
    }
  };
  HG.sprout = (cv, L, o, hx, hy, k) => {
    cv.begin('sprout', { shade: 1, hi: 0 });
    cv.line(hx, hy + 2, hx, hy - 4 * k, o.stem || 'leaf', -1);
    cv.ell(hx - 3 * k, hy - 5 * k, 3 * k, 1.8 * k, o.mat || 'leaf');
    cv.ell(hx + 3.5 * k, hy - 6 * k, 3 * k, 1.8 * k, o.mat || 'leaf');
  };
  HG.bow = (cv, L, o, hx, hy, k) => {
    cv.begin('hbow', { shade: 1, hi: 0, cast: 1 });
    const bx = hx + (o.dx === undefined ? 8 : o.dx) * k, by = hy + (o.dy === undefined ? 3 : o.dy) * k;
    cv.poly([[bx, by], [bx - 5 * k, by - 3 * k], [bx - 5 * k, by + 3 * k]], o.mat || 'acc');
    cv.poly([[bx, by], [bx + 5 * k, by - 3 * k], [bx + 5 * k, by + 3 * k]], o.mat || 'acc');
    cv.circ(bx, by, 1.4 * k, o.mat || 'acc', -1);
  };
  HG.buns = (cv, L, o, hx, hy, k) => {
    cv.begin('buns', { shade: 1, hi: 3, cast: 0 });
    for (const s of [-1, 1]) cv.circ(L.cx + s * (L.hrx - 2 * k), hy + 2 * k, (o.r || 3.5) * k, o.mat || 'hair');
  };
  HG.bun = (cv, L, o, hx, hy, k) => {
    cv.begin('bun', { shade: 1, hi: 3, cast: 0 });
    cv.circ(hx, hy - 1 * k, (o.r || 4.5) * k, o.mat || 'hair');
  };
  HG.stars = (cv, L, o, hx, hy, k) => { // twinkles around the head
    cv.begin('twinkle', { shade: 0 });
    for (const p of o.pts) {
      const x = hx + p[0] * k, y = hy + p[1] * k;
      cv.plot(x, y, o.mat || 'gold', 0); cv.plot(x - 1, y, o.mat || 'gold', 0); cv.plot(x + 1, y, o.mat || 'gold', 0); cv.plot(x, y - 1, o.mat || 'gold', 0); cv.plot(x, y + 1, o.mat || 'gold', 0);
    }
  };
  /** loom-comb crown: a band with a row of long thin teeth (Warpa / Weftie) with a bead on each tooth. */
  HG.comb = (cv, L, o, hx, hy, k) => {
    cv.begin('crown', { shade: 1, hi: 4, cast: 1 });
    const n = o.points || 7, w = (o.w || 10) * k, mat = o.mat || 'gold';
    cv.rect(hx - w, hy - 1, w * 2 + 1, 2 * k, mat);
    for (let i = 0; i < n; i++) {
      const x = hx - w + 0.5 + (i * (w * 2)) / (n - 1);
      const h = (o.h || 7) * k * (1 - Math.abs(i - (n - 1) / 2) * 0.07);
      cv.rect(x - 0.5, hy - 1 - h, 1, h + 1, mat);
      cv.plot(x - 0.5, hy - 2 - h, o.bead || 'shine', 0);
    }
  };
  /** ring of white petals standing up around the crown of the head (daisy halo). */
  HG.petals = (cv, L, o, hx, hy, k) => {
    cv.begin('petals', { shade: 1, hi: 0, cast: 0 });
    const n = o.n || 7;
    for (let i = 0; i < n; i++) {
      const a = Math.PI * (1.0 - (i + 0.5) / n);
      const px = L.cx + Math.cos(a) * (L.hrx + 1 * k), py = L.hcy - Math.sin(a) * (L.hry + 1 * k);
      cv.ell(px, py, (o.r || 2.6) * k, (o.r || 2.6) * k, o.mat || 'sub');
    }
  };
  PARTS.hat = {
    headgear(cv, L, o, view) {
      const f = HG[o.kind];
      if (!f) throw new Error('kigu: unknown hat ' + o.kind);
      f(cv, L, o, L.cx, L.hcy - L.hry + (o.lift === undefined ? 1 : o.lift), L.k, view);
    },
  };

  // ------------------------------------------------------------------ helpers shared with render.js / props.js
  /** ring of petals around the head (goes in hood.pattern). */
  K.petalRing = (n, r, dist, mat, start) => (cv, L) => {
    for (let i = 0; i < n; i++) {
      const a = (start || 0) + (i / n) * Math.PI * 2;
      cv.ell(L.cx + Math.cos(a) * (L.hrx + dist * L.k - 1), L.hcy + Math.sin(a) * (L.hry + dist * L.k - 1), r * L.k, r * L.k, mat);
    }
  };
  K._layout = layout;
  K._pathStroke = pathStroke;
  K._drawShapes = drawShapes;
  K._bowAt = bowAt;
})(typeof globalThis !== 'undefined' ? globalThis : window);
