/* src/art/human/head.js — skull, face, hair and head accessories for NP.art.human, at both scales.
 *
 * Everything is drawn relative to a rig (rig.js): R.hy = first skull row, R.hh = skull rows, R.sx(r) = skull half-width
 * at skull row r, R.cx = centre, R.u = detail scale (1 overworld, ≈1.34 trainer). Views: 'down' (front), 'up' (back),
 * 'left' (side, overworld only). Hair styles are parametric (STY below), so one table serves 32×32 and 80×80.
 * Registers: L.head.{skull, face, hair, hairBack, shadeHead}, L.HAIRSTYLES, L.ACC_HEAD[type](P, R, acc, phase).
 */
(function (root) {
  'use strict';
  const NP = (root.NP = root.NP || {});
  const HUM = NP.art.human;
  const L = HUM._;
  const HD = (L.head = {});
  const ACC = (L.ACC = L.ACC || {});

  const rnd = Math.round;

  // ---------------------------------------------------------------------------------------------------------------
  // Skull
  // ---------------------------------------------------------------------------------------------------------------
  /** Side-view skull row r -> [x0, x1] (facing left). */
  function sideRow(R, r) {
    const k = R.skullSide[Math.max(0, Math.min(R.skullSide.length - 1, r))];
    return [rnd(R.cx + k[0]), rnd(R.cx + k[1]) - 1];
  }
  HD.sideRow = sideRow;

  /** Does this hair style leave the ears visible? */
  const earsShow = (R) => { const st = STY[R.S.hair.style] || STY.short; return !st.bald && st.side <= 0.62 && !st.back || st.back === 'pony' || st.back === 'pig' || st.bald; };

  HD.skull = function (P, R) {
    const { hy, hh } = R;
    P.begin('skull');
    if (R.view === 'left') {
      for (let r = 0; r < hh; r++) { const [a, b] = sideRow(R, r); P.run(hy + r, a, b, 'skin', 2); }
      return;
    }
    for (let r = 0; r < hh; r++) P.run(hy + r, R.L(R.sx(r)), R.Rt(R.sx(r)), 'skin', 2);
    if (earsShow(R)) {
      P.begin('ear');
      const er = rnd(hh * 0.48), x0 = R.L(R.sx(er)) - 1;
      // overworld: a 1x2 nub; trainer: a small rounded ear (1-2-2-1 px) tucked against the skull
      const shape = R.t === 'ow' ? [1, 1] : [1, 2, 2, 1];
      shape.forEach((w, r) => { for (let k = 0; k < w; k++) { P.px(x0 - k, hy + er + r, 'skin', R.view === 'up' ? 1 : k ? 2 : 1); P.px(R.mx(x0 - k), hy + er + r, 'skin', 1); } });
    }
  };

  // ---------------------------------------------------------------------------------------------------------------
  // Face
  // ---------------------------------------------------------------------------------------------------------------
  // trainer eye patterns, screen columns for the LEFT eye (mirrored for the right). o line, E iris, e iris dark,
  // l iris light, h white highlight, w white of the eye.
  const EYE = {
    normal: ['ooo', 'eEh', 'eEE', 'Eee', '.l.'],
    wide: ['.o.', 'oeh', 'eEE', 'EEe', 'Eee', '.l.'],
    serious: ['...', 'ooo', 'eEh', 'Eee', '.l.'],
    sharp: ['o..', 'ooo', 'eEh', 'Eee', '...'],
    sleepy: ['...', '...', 'ooo', 'eEh', '.l.'],
    happy: ['...', '.o.', 'o.o'],
    closed: ['...', '...', 'ooo'],
  };
  const EYE_INK = { o: [0, 2], E: ['eye', 2], e: ['eye', 0], l: ['eye', 3], h: ['white', 2], w: ['white', 1] };

  HD.face = function (P, R) {
    const S = R.S, f = S.face;
    const { hy, hh } = R;
    P.begin('face');
    if (R.view === 'up') return;
    const ey = hy + rnd(hh * 0.47);
    R.eyeY = ey;
    if (R.t === 'ow') return owFace(P, R, ey);
    // ---- trainer
    const pat = EYE[f.eyes] || EYE.normal;
    const ex = R.L(6); // left eye's leftmost column
    for (let r = 0; r < pat.length; r++) for (let k = 0; k < 3; k++) {
      const ch = pat[r][k], v = EYE_INK[ch];
      if (!v) continue;
      P.px(ex + k, ey + r, v[0], v[1]);
      P.px(R.mx(ex + k), ey + r, v[0], v[1]);
    }
    if (f.lashes && f.eyes !== 'closed') { for (const x of [ex - 1, R.mx(ex - 1)]) { P.px(x, ey + (f.eyes === 'happy' ? 2 : 0), 0); } }
    // brows (only where skin shows)
    const by = ey - 2 - (f.brows === 'raised' ? 1 : 0);
    const browCol = S.hair.style === 'bald' ? 'facial' : 'hair';
    for (let k = 0; k < 3; k++) {
      let dy = 0;
      if (f.brows === 'stern') dy = k === 2 ? 1 : 0;
      if (f.brows === 'worried') dy = k === 0 ? 1 : 0;
      for (const x of [ex + k, R.mx(ex + k)]) if (P.partRaw(x, by + dy) && P.matAt(x, by + dy) === P.names.skin) P.px(x, by + dy, browCol, 0);
    }
    // nose: a single shadow pixel right of centre; mouth
    const ny = ey + 4;
    P.px(rnd(R.cx + 0.5), ny, 'skin', 1);
    const my = Math.min(hy + hh - 2, ey + 6), c0 = rnd(R.cx - 0.5); // c0 = left of the two centre columns
    const M = (x, y, t) => P.px(x, y, 'mouth', t === 'm' ? 2 : 0); // 'l' = lip line (dark rose), 'm' = open mouth
    switch (f.mouth) {
      case 'grin': for (let x = c0 - 1; x <= c0 + 2; x++) M(x, my, 'l'); M(c0, my + 1, 'm'); M(c0 + 1, my + 1, 'm'); break;
      case 'o': M(c0, my, 'l'); M(c0 + 1, my, 'l'); M(c0, my + 1, 'm'); M(c0 + 1, my + 1, 'm'); break;
      case 'flat': M(c0, my, 'l'); M(c0 + 1, my, 'l'); break;
      case 'smirk': M(c0, my, 'l'); M(c0 + 1, my, 'l'); M(c0 + 2, my - 1, 'l'); break;
      case 'frown': M(c0 - 1, my + 1, 'l'); M(c0, my, 'l'); M(c0 + 1, my, 'l'); M(c0 + 2, my + 1, 'l'); break;
      case 'cat': M(c0 - 1, my, 'l'); M(c0, my + 1, 'l'); M(c0 + 1, my + 1, 'l'); M(c0 + 2, my, 'l'); break;
      default: M(c0, my, 'l'); M(c0 + 1, my, 'l'); P.px(c0 - 1, my - 1, 'skin', 1); P.px(c0 + 2, my - 1, 'skin', 1);
    }
    if (f.blush) { P.begin('blush'); for (let k = 0; k < 2; k++) { P.px(ex + k - 1, ey + 4, 'blush', 2); P.px(R.mx(ex + k - 1), ey + 4, 'blush', 2); } }
    if (S.build === 'elder') { P.px(ex - 1, ey + 5, 'skin', 1); P.px(R.mx(ex - 1), ey + 5, 'skin', 1); }
    facial(P, R, ey);
  };

  function owFace(P, R, ey) {
    const S = R.S, f = S.face;
    if (R.view === 'left') {
      const [x0] = sideRow(R, ey - R.hy);
      const ex = x0 + 2;
      if (f.eyes === 'happy' || f.eyes === 'closed' || f.eyes === 'sleepy') { P.px(ex, ey + 1, 0); P.px(ex + 1, ey + 1, 0); }
      else { P.px(ex, ey, 0); P.px(ex, ey + 1, 0); if (f.lashes) P.px(ex + 1, ey, 0); }
      if (f.blush) P.px(ex + 1, ey + 2, 'blush', 2);
      facial(P, R, ey);
      return;
    }
    const ex = R.L(2.5); // 13
    for (const [x, s] of [[ex, -1], [R.mx(ex), 1]]) {
      const e = f.eyes;
      if (e === 'happy') { P.px(x, ey, 0); P.px(x - 1, ey + 1, 0); P.px(x + 1, ey + 1, 0); }
      else if (e === 'closed' || e === 'sleepy') { P.px(x, ey + 1, 0); P.px(x - s, ey + 1, 0); }
      else {
        P.px(x, ey, 0); P.px(x, ey + 1, 'eye', 0);
        if (e === 'wide') P.px(x, ey - 1, 0);
        if (f.lashes) P.px(x + s, ey, 0);
        if (e === 'sharp' || e === 'serious') P.px(x - s, ey - 1, 'hair', 0);
      }
    }
    if (f.blush) { P.px(ex - 1, ey + 2, 'blush', 2); P.px(R.mx(ex - 1), ey + 2, 'blush', 2); }
    if (f.mouth === 'o' || f.mouth === 'grin') P.px(rnd(R.cx - 0.5), ey + 3, 'mouth', 2);
    facial(P, R, ey);
  }

  /** beard / mustache / stubble */
  function facial(P, R, ey) {
    const S = R.S;
    if (!S.facial) return;
    P.begin('beard');
    const { hy, hh } = R, ow = R.t === 'ow';
    const side = R.view === 'left';
    const c0 = rnd(R.cx - 0.5);
    if (S.facial === 'mustache') {
      const y = ow ? ey + 2 : ey + 5;
      if (side) { const [x0] = sideRow(R, y - hy); P.run(y, x0, x0 + (ow ? 2 : 4), 'facial', 2); return; }
      const w = ow ? 2 : 3;
      P.run(y, c0 - w + 1, c0 + w, 'facial', 2);
      if (!ow) { P.px(c0 - w, y + 1, 'facial', 1); P.px(c0 + w + 1, y + 1, 'facial', 1); }
      return;
    }
    if (S.facial === 'stubble') {
      if (ow) return;
      for (let y = ey + 5; y < hy + hh; y++) { const hw = R.sx(y - hy) - 1; for (let x = R.L(hw); x <= R.Rt(hw); x++) if ((x + y) & 1 && P.matAt(x, y) === P.names.skin) P.px(x, y, 'skin', 1); }
      return;
    }
    // beard: lower face below the cheeks, a mouth gap, 1 row below the chin
    const y0 = ow ? ey + 2 : ey + 4;
    for (let y = y0; y <= hy + hh; y++) {
      const r = Math.min(hh - 1, y - hy);
      if (side) {
        const [a, b] = sideRow(R, r);
        P.run(y, a + (y === y0 ? 1 : 0), Math.min(b, rnd(R.cx + 2)), 'facial', y === hy + hh ? 1 : 2);
        continue;
      }
      const hw = R.sx(r) + (y === hy + hh ? -1 : 0);
      for (let x = R.L(hw); x <= R.Rt(hw); x++) {
        const dx = Math.abs(x + 0.5 - R.cx);
        if (y === y0 && dx < hw - (ow ? 2 : 3)) continue; // cheeks stay clear on the top row
        if (!ow && y === ey + 6 && dx < 2) continue; // mouth
        P.px(x, y, 'facial', y >= hy + hh - 1 ? 1 : 2);
      }
    }
  }

  // ---------------------------------------------------------------------------------------------------------------
  // Hair
  // ---------------------------------------------------------------------------------------------------------------
  // rise: crown above the skull (× R.rise px), vol: side volume (× u px), fr: fringe shape, fd: fringe depth (× skull rows),
  // side: how far down the side locks reach (× skull rows, front view), nape: back hairline (× skull rows), back / top: extras.
  const STY = {
    short: { rise: 1, vol: 1, fr: 'jag', fd: 0.36, side: 0.55, nape: 0.75 },
    spiky: { rise: 1.3, vol: 1, fr: 'spike', fd: 0.38, side: 0.5, nape: 0.72, top: 'spikes' },
    messy: { rise: 1, vol: 1, fr: 'jag', fd: 0.42, side: 0.62, nape: 0.82, top: 'tuft' },
    bob: { rise: 1, vol: 1, fr: 'flat', fd: 0.4, side: 0.95, nape: 0.95, back: 'bob' },
    long: { rise: 1, vol: 1, fr: 'part', fd: 0.36, side: 1, nape: 1, back: 'long' },
    ponytail: { rise: 1, vol: 1, fr: 'jag', fd: 0.36, side: 0.6, nape: 0.72, back: 'pony' },
    pigtails: { rise: 1, vol: 1, fr: 'jag', fd: 0.36, side: 0.6, nape: 0.75, back: 'pig' },
    bun: { rise: 0.7, vol: 0.6, fr: 'part', fd: 0.3, side: 0.55, nape: 0.66, top: 'bun' },
    twinbun: { rise: 0.8, vol: 1, fr: 'flat', fd: 0.4, side: 0.66, nape: 0.8, top: 'twinbun' },
    fluff: { rise: 1.5, vol: 2, fr: 'curl', fd: 0.24, side: 0.6, nape: 0.75, top: 'fluff' },
    sidepart: { rise: 1, vol: 0.6, fr: 'side', fd: 0.36, side: 0.5, nape: 0.7 },
    curly: { rise: 1.5, vol: 2, fr: 'curl', fd: 0.34, side: 0.66, nape: 0.85, top: 'curly' },
    bald: { rise: 0, vol: 1, fr: 'none', fd: 0, side: 0.6, nape: 0.75, bald: true },
    cropped: { rise: 0.5, vol: 0, fr: 'flat', fd: 0.24, side: 0.45, nape: 0.6 },
    wavy: { rise: 1, vol: 1, fr: 'side', fd: 0.38, side: 1, nape: 1, back: 'wave' },
  };
  HD.STY = STY;
  for (const k of Object.keys(STY)) if (!L.HAIRSTYLES.includes(k)) L.HAIRSTYLES.push(k);

  function hp(R, st) {
    const u = R.u;
    // the crown never climbs into the top rows of the cell (room for puffs, buns and hats)
    const rise = Math.max(0, Math.min(rnd(st.rise * R.rise), R.hy - (R.t === 'ow' ? 2 : 5))), vol = rnd(st.vol * u);
    const top = R.hy - rise;
    const cyc = R.hy + R.hh * 0.45;
    return { rise, vol, top, cyc, ry: cyc - top + 0.5, rx: R.hw + vol, fdy: R.hy + rnd(st.fd * R.hh), sideY: R.hy + rnd(st.side * R.hh) - 1, napeY: R.hy + rnd(st.nape * R.hh) - 1 };
  }

  /** half-width of the hair cap at row y (front/back), or -1 */
  function capHW(R, h, y) {
    if (y < h.top) return -1;
    if (y < h.cyc) { const t = (h.cyc - y) / h.ry; return t >= 1 ? -1 : h.rx * Math.sqrt(1 - t * t); }
    const r = y - R.hy;
    return r < R.hh ? R.sx(r) + h.vol : R.sx(R.hh - 1) + h.vol;
  }

  /** fringe edge: first face row under the hair at column x (front view) */
  function fringeY(R, st, h, x) {
    const u = R.u, k = (x + 0.5 - R.cx) / u, a = Math.abs(k), hw = R.hw;
    const per = R.t === 'ow' ? 3 : 4;
    const ph = ((Math.floor(x - R.cx + 64 * per) % per) + per) % per;
    switch (st.fr) {
      case 'flat': return h.fdy + (a > hw * 0.75 ? 1 : 0);
      case 'jag': return h.fdy + (ph === 1 ? rnd(u) : 0) + (a > hw * 0.7 ? 1 : 0) - (a < 1.5 ? 0 : 0);
      case 'spike': return h.fdy + (ph === 1 ? rnd(2 * u) : ph === 0 ? rnd(u) : 0) - 1;
      case 'side': return h.fdy + rnd(((R.cx - x) / hw) * 1.6 * u) + (ph === 1 && k < 0 ? 1 : 0);
      case 'part': return h.fdy - rnd(1.4 * u) + rnd((a / hw) * 2.4 * u);
      case 'curl': return h.fdy + (ph === 1 ? 1 : 0);
      default: return R.hy - 99;
    }
  }

  /** Main hair mass. layer 'front' (over the face). */
  HD.hair = function (P, R) {
    const S = R.S, st = STY[S.hair.style] || STY.short;
    const h = hp(R, st);
    R.hairTop = h.top;
    R.hairInfo = h;
    const view = R.view;
    P.begin('hair');
    if (st.bald) { baldRing(P, R, st, h); return; }
    const sideW = R.t === 'ow' ? 1 : 2;
    if (view === 'down') {
      for (let y = h.top; y <= Math.max(h.sideY, h.fdy + 2); y++) {
        const hw = capHW(R, h, y);
        if (hw < 0) continue;
        const r = y - R.hy;
        for (let x = rnd(R.cx - hw); x <= rnd(R.cx + hw) - 1; x++) {
          const dx = Math.abs(x + 0.5 - R.cx);
          const inSkull = r >= 0 && r < R.hh && dx < R.sx(r);
          const below = y >= fringeY(R, st, h, x);
          if (below && y > h.sideY) continue;
          if (inSkull && below && dx < R.sx(r) - sideW) continue;
          if (!inSkull && r >= 0 && y > h.sideY) continue;
          P.px(x, y, 'hair', 2);
        }
      }
    } else if (view === 'up') {
      for (let y = h.top; y <= h.napeY; y++) {
        const hw = capHW(R, h, y);
        if (hw < 0) continue;
        for (let x = rnd(R.cx - hw); x <= rnd(R.cx + hw) - 1; x++) P.px(x, y, 'hair', 2);
      }
      // jagged nape for short cuts
      if (st.nape < 0.9) {
        const hw = R.sx(h.napeY + 1 - R.hy) - 1, per = R.t === 'ow' ? 3 : 4;
        for (let x = R.L(hw); x <= R.Rt(hw); x++) if (((x - R.L(hw)) % per) === 1) P.px(x, h.napeY + 1, 'hair', 2);
      }
    } else {
      // side view (facing left): face window at the front, hair over the crown and the back
      const fx = rnd(R.cx + 0.5 * R.u); // columns < fx are face (below the fringe)
      for (let y = h.top; y <= Math.max(h.napeY, h.fdy); y++) {
        const r = y - R.hy;
        let x0, x1;
        if (y < h.cyc) { const hw = capHW(R, h, y); if (hw < 0) continue; x0 = rnd(R.cx - hw) + (y < R.hy ? 1 : 0); x1 = rnd(R.cx + hw) - 1; }
        else { const [a, b] = sideRow(R, Math.min(r, R.hh - 1)); x0 = a - (h.vol > 0 && y <= h.fdy ? 1 : 0); x1 = b + h.vol; }
        for (let x = x0; x <= x1; x++) {
          const face = x < fx && y >= sideFringe(R, st, h, x);
          if (face) continue;
          if (y > h.napeY && x >= fx) continue;
          if (y > h.sideY + 1 && x < fx + 2) continue;
          P.px(x, y, 'hair', 2);
        }
      }
    }
    topExtras(P, R, st, h);
  };

  function sideFringe(R, st, h, x) {
    const per = R.t === 'ow' ? 3 : 4, ph = ((x % per) + per) % per;
    if (st.fr === 'none') return R.hy - 99;
    if (st.fr === 'spike' || st.fr === 'jag') return h.fdy + (ph === 1 ? 1 : 0);
    if (st.fr === 'part') return h.fdy + 1 - (x < R.cx - 3 ? 0 : 1);
    return h.fdy;
  }

  function baldRing(P, R, st, h) {
    // hair only around the back and sides, below the crown
    const y0 = R.hy + rnd(R.hh * 0.35), y1 = R.hy + rnd(R.hh * 0.7);
    for (let y = y0; y <= y1; y++) {
      const r = y - R.hy, hw = R.sx(r) + (R.t === 'ow' ? 0 : 1);
      if (R.view === 'up') { P.run(y, R.L(hw), R.Rt(hw), 'hair', 2); continue; }
      if (R.view === 'left') { const [, b] = sideRow(R, r); P.run(y, rnd(R.cx), b, 'hair', 2); continue; }
      const w = R.t === 'ow' ? 1 : 2;
      P.run(y, R.L(hw), R.L(hw) + w - 1, 'hair', 2); P.run(y, R.Rt(hw) - w + 1, R.Rt(hw), 'hair', 2);
    }
  }

  const HATS = ['cap', 'flatcap', 'hat', 'hardhat', 'beret', 'bandana'];
  function topExtras(P, R, st, h) {
    const u = R.u, U = R.U, view = R.view;
    const hatted = R.S.acc.some((a) => HATS.includes(a.type));
    if (hatted && (st.top === 'tuft' || st.top === 'spikes')) return;
    const blob = (x, y, rx, ry, t) => P.ellipse(x, y, rx, ry, 'hair', t === undefined ? 2 : t);
    if (st.top === 'spikes') {
      P.begin('hair:spikes');
      const xs = view === 'left' ? [-0.4, 0.1, 0.55] : [-0.55, 0, 0.55];
      xs.forEach((f, i) => {
        const bx = R.cx + f * h.rx, by = h.top + U(1.5) + Math.abs(f) * U(2), hgt = U(2.4) + (i === 1 ? U(0.8) : 0);
        const lean = view === 'left' ? U(1.5) : f * U(2);
        P.poly([[bx - U(2), by + 1], [bx + U(2), by + 1], [bx + lean, by - hgt]], 'hair', 2);
      });
    }
    if (st.top === 'tuft') {
      P.begin('hair:tuft');
      const bx = rnd(R.cx - (view === 'left' ? -1 : 1) * U(1));
      P.limb(bx, h.top + U(0.8), bx + (view === 'left' ? U(2) : U(1.6)), h.top - (R.t === 'ow' ? 1 : 2), U(0.9), 0.4, 'hair', 2);
    }
    if (st.top === 'bun') {
      P.begin('hair:bun');
      if (view === 'down') blob(R.cx, h.top + U(0.3), U(2.8), U(2.1));
      else if (view === 'up') blob(R.cx, R.hy + R.hh * 0.22, U(2.6), U(2.4));
      else blob(R.cx + h.rx - U(1.2), R.hy + U(0.6), U(2.4), U(2.4));
    }
    if (st.top === 'twinbun') {
      P.begin('hair:buns');
      if (view === 'left') { blob(R.cx + U(2.5), h.top + U(1), U(2.4), U(2.4)); }
      else for (const s of [-1, 1]) blob(R.cx + s * (h.rx - U(1.5)), h.top + U(1.2), U(2.5), U(2.4));
    }
    if (st.top === 'fluff' || st.top === 'curly') {
      P.begin('hair:puffs');
      const n = R.t === 'ow' ? 6 : 8, rr = st.top === 'fluff' ? U(1.6) : U(1.3);
      for (let i = 0; i < n; i++) {
        const a = Math.PI * (0.05 + (0.9 * i) / (n - 1));
        const x = R.cx - Math.cos(a) * (h.rx - rr * 0.4), y = h.cyc - Math.sin(a) * (h.ry - rr * 0.5);
        if (view === 'left' && x < R.cx - h.rx * 0.6 && y > R.hy) continue;
        blob(x, y, rr, rr);
      }
      if (st.top === 'curly' && view !== 'left') for (const s of [-1, 1]) blob(R.cx + s * (R.hw + h.vol - rr * 0.5), R.hy + R.hh * 0.62, rr, rr);
    }
  }

  /** True for loose hair that hangs down the back (bob, long, wavy), as opposed to tails, buns and short cuts. */
  HD.looseBack = (S) => { const st = STY[S.hair.style]; return !!st && ['bob', 'long', 'wave'].includes(st.back); };

  /** Hair behind the head/body (front view: draw before the body; back view: draw after the body). */
  HD.hairBack = function (P, R) {
    const S = R.S, st = STY[S.hair.style] || STY.short;
    if (st.bald) return;
    const h = hp(R, st);
    const U = R.U, view = R.view, u = R.u;
    P.begin('hairback');
    const b = st.back;
    const hw = R.hw + h.vol;
    if (b === 'bob' || b === 'long' || b === 'wave') {
      const y0 = R.hy + rnd(R.hh * 0.3);
      // overworld back view: stop a little higher so a band of the top still shows below the hair
      const y1 = b === 'bob' ? R.hy + R.hh + U(0.6) : R.shY + rnd(R.torso * (R.t === 'ow' ? (view === 'up' ? 0.3 : 0.5) : 0.45));
      for (let y = y0; y <= y1; y++) {
        const t = (y - y0) / Math.max(1, y1 - y0);
        let w = b === 'bob' ? hw - (y === y1 ? U(1) : 0) : hw - t * U(1.2);
        if (b === 'wave') w += ((Math.floor((y - y0) / U(2)) & 1) ? 0 : U(0.6));
        if (view === 'left') { const x0 = rnd(R.cx - (b === 'bob' ? 0 : U(1))), x1 = rnd(R.cx + w) - 1; P.run(y, x0, x1, 'hair', 2); continue; }
        P.run(y, rnd(R.cx - w), rnd(R.cx + w) - 1, 'hair', view === 'up' ? 2 : 1);
        // ragged ends: trim the two outer corners instead of a comb of single pixels
        if (b !== 'bob' && y === y1 && view === 'up') { P.clearPx(rnd(R.cx - w), y); P.clearPx(rnd(R.cx + w) - 1, y); }
      }
      if (view === 'up' && b !== 'bob') {
        // seen from behind: a few strand lines in the shadow tone and a soft highlight clump at the top left
        const sy0 = y0 + rnd((y1 - y0) * 0.35);
        for (const f of [-0.45, 0.05, 0.5]) { const x = rnd(R.cx + f * hw); for (let y = sy0 + (f > 0 ? 1 : 0); y < y1; y++) P.px(x, y, 'hair', 1); }
        const hx = rnd(R.cx - hw * 0.7), hy = y0 + 1;
        P.px(hx, hy, 'hair', 3); P.px(hx + 1, hy, 'hair', 3); P.px(hx, hy + 1, 'hair', 3);
      }
    }
    if (b === 'pony') {
      P.begin('hairback:pony');
      if (view === 'up') {
        const x = R.cx, y0 = R.hy + R.hh * 0.55;
        P.limb(x, y0, x + U(0.6), R.shY + U(3.5), U(2), U(1.1), 'hair', 2);
        P.begin('hair:tie'); P.run(rnd(y0 + U(0.3)), rnd(x - U(1.5)), rnd(x + U(1.5)) - 1, 'trim', 2);
      } else if (view === 'left') {
        const x0 = R.cx + R.hw - U(0.5), y0 = R.hy + R.hh * 0.35;
        P.limb(x0, y0, x0 + U(2.6), R.hy + R.hh + U(1.5), U(1.8), U(1), 'hair', 2);
      } else {
        const x0 = R.cx + R.hw + U(0.2), y0 = R.hy + R.hh * 0.32;
        P.limb(x0, y0, x0 + U(1.6), R.hy + R.hh + U(1.8), U(1.6), U(0.9), 'hair', 1);
      }
    }
    if (b === 'pig') {
      P.begin('hairback:pig');
      const sides = view === 'left' ? [1] : [-1, 1];
      for (const s of sides) {
        const x0 = view === 'left' ? R.cx + U(2) : R.cx + s * (R.hw + U(0.6)), y0 = R.hy + R.hh * 0.5;
        P.limb(x0, y0, x0 + (view === 'left' ? U(0.8) : s * U(1.2)), R.hy + R.hh + U(2.5), U(1.6), U(1.4), 'hair', view === 'up' ? 2 : 2);
        P.begin('hair:tie');
        P.run(rnd(y0), rnd(x0 - U(1.4)), rnd(x0 + U(1.4)) - 1, 'trim', 2);
        P.begin('hairback:pig');
      }
    }
  };

  /** Hair shading pass: shadow band right/bottom, a highlight arc, strand lines in the fringe; face shadow under the fringe. */
  HD.shade = function (P, R) {
    const h = R.hairInfo;
    const hair = P.partsNamed((n) => n === 'hair' || n.startsWith('hair:spikes') || n.startsWith('hair:tuft') || n.startsWith('hair:bun') || n.startsWith('hair:puffs'));
    const back = P.partsNamed((n) => n.startsWith('hairback'));
    const ow = R.t === 'ow';
    P.cel(hair, { r: ow ? 1 : 2, b: 1, deep: !ow });
    const loose = HD.looseBack(R.S);
    // loose hair: dark tips along the bottom as well as the right side (strands and highlight are drawn in hairBack)
    P.cel(back, loose ? { r: ow ? 1 : 2, b: 1 } : { r: ow ? 1 : 2, b: ow ? 0 : 1 });
    if (h && R.S.hair.style !== 'bald') {
      // highlight arc on the upper left of the crown
      const set = new Set(hair);
      const hy0 = h.top + Math.max(1, rnd((h.cyc - h.top) * (R.view === 'up' ? 0.45 : 0.42)));
      const th = ow ? 1 : 2;
      for (let x = rnd(R.cx - h.rx); x <= rnd(R.cx + h.rx * 0.25); x++) {
        const t = (x + 0.5 - R.cx) / h.rx;
        const y = hy0 + rnd(t * t * (ow ? 2 : 3));
        if (ow && ((x - rnd(R.cx)) % 4 === 0)) continue;
        for (let k = 0; k < th; k++) {
          const yy = y + k, v = P.getRaw(x, yy);
          if (v >= 0 && set.has(P.partRaw(x, yy)) && (v & 3) === 2) P.ink[yy * P.w + x] = (v & ~3) | 3;
        }
      }
    }
    // face shadow under the hair (a 1px band)
    const skin = P.partsNamed((n) => n === 'skull' || n === 'ear');
    P.cel(skin, { r: ow ? 0 : 1, b: 0, under: hair, underD: ow ? 1 : 2 });
  };

  // ---------------------------------------------------------------------------------------------------------------
  // Head accessories (phase 'head': after the hair). Each: (P, R, acc, phase)
  // ---------------------------------------------------------------------------------------------------------------
  const reg = (name, fn) => { ACC[name] = fn; if (!L.ACCS.includes(name)) L.ACCS.push(name); };
  const mc = (P, a, d) => P.m(a.color !== undefined ? a.color : L.col(d));
  const mc2 = (P, a, d) => P.m(a.color2 !== undefined ? a.color2 : L.col(d));
  HD.reg = reg;

  /** crown dome over the hair: rows from h.top-lift down to yEnd, cap half-width + extra. */
  function dome(P, R, mat, lift, yEnd, extra, flat) {
    const h = R.hairInfo || hp(R, STY.short);
    const top = Math.min(h.top, R.hy - R.U(1)) - lift;
    const cyc = h.cyc, ry = cyc - top + 0.5, rx = R.hw + Math.max(h.vol, R.U(1)) + extra;
    const ex = flat || 2;
    for (let y = top; y <= yEnd; y++) {
      const t = (cyc - y) / ry;
      const hw = y < cyc ? (t >= 1 ? -1 : rx * Math.pow(1 - Math.pow(t, ex), 1 / ex)) : rx;
      if (hw < 0) continue;
      if (R.view === 'left') P.run(y, rnd(R.cx - hw) + (y < R.hy ? 1 : 0), rnd(R.cx + hw) - 1, mat, 2);
      else P.run(y, rnd(R.cx - hw), rnd(R.cx + hw) - 1, mat, 2);
    }
    return { top, rx };
  }

  function glasses(round) {
    return (P, R, a, ph) => {
      if (ph !== 'face' || R.view === 'up') return;
      const m = mc(P, a, '#6a6a7c'), ey = R.eyeY;
      if (R.t === 'ow') {
        const ex = R.L(2.5);
        if (R.view === 'left') { const [x0] = sideRow(R, ey - R.hy); P.px(x0 + 1, ey, m, 3); P.px(x0 + 3, ey, m, 2); P.px(x0 + 2, ey - 1, m, 2); return; }
        for (const x of [ex, R.mx(ex)]) { P.px(x - 1, ey, m, 3); P.px(x + 1, ey, m, 3); if (round) { P.px(x - 1, ey + 1, m, 3); P.px(x + 1, ey + 1, m, 3); } else P.run(ey - 1, x - 1, x + 1, m, 3); }
        return;
      }
      const ex = R.L(6);
      for (const s of [0, 1]) {
        const x0 = s ? R.mx(ex + 2) - 1 : ex - 1, x1 = x0 + 4;
        for (let x = x0; x <= x1; x++) { P.px(x, ey - 1, m, 3); P.px(x, ey + 4, m, 1); }
        for (let y = ey; y <= ey + 3; y++) { P.px(x0, y, m, 2); P.px(x1, y, m, 2); }
        if (round) { P.clearPx(x0, ey - 1); P.clearPx(x1, ey - 1); P.clearPx(x0, ey + 4); P.clearPx(x1, ey + 4); for (const [x, y] of [[x0, ey - 1], [x1, ey - 1], [x0, ey + 4], [x1, ey + 4]]) if (P.partRaw(x, y) === 0) P.px(x, y, 'skin', 2); }
      }
      P.run(ey, R.L(6) + 4, R.mx(R.L(6) + 4), m, 2);
    };
  }
  reg('glasses', glasses(false));
  reg('roundglasses', glasses(true));

  reg('goggles', (P, R, a, ph) => {
    if (ph !== 'head') return;
    const m = mc(P, a, '#72b0ec'), band = P.m('#4a4452');
    const h = R.hairInfo, y = Math.max(R.hy - R.U(0.5), (h ? h.fdy : R.hy + 3) - R.U(2.2));
    if (R.view === 'up') { P.run(y + R.U(1), R.L(R.hw + R.U(1)), R.Rt(R.hw + R.U(1)), band, 2); return; }
    if (R.view === 'left') {
      P.run(y + R.U(1), rnd(R.cx - R.hw - R.U(0.5)), rnd(R.cx + R.hw), band, 2);
      P.ellipse(R.cx - R.hw + R.U(1.5), y + R.U(0.8), R.U(1.4), R.U(1.2), m, 2);
      return;
    }
    P.run(y + R.U(1), R.L(R.hw + R.U(1)), R.Rt(R.hw + R.U(1)), band, 2);
    const r = R.t === 'ow' ? 1.6 : 2.8;
    for (const s of [-1, 1]) {
      const cx = R.cx + s * R.U(2.6);
      P.ellipse(cx, y + R.U(0.8), r, r * 0.85, m, 2);
      P.px(rnd(cx - r * 0.5), rnd(y + R.U(0.8) - r * 0.4), m, 3);
    }
  });

  reg('headband', (P, R, a, ph) => {
    if (ph !== 'head') return;
    const m = mc(P, a, '#d8363a'), h = R.hairInfo;
    const y = Math.max(h ? h.top + R.U(1.5) : R.hy, (h ? h.fdy : R.hy + 3) - R.U(1.5));
    const t = R.t === 'ow' ? 1 : 2;
    for (let k = 0; k < t; k++) {
      const yy = y + k, w = (R.hairInfo ? capHW(R, h, yy) : R.hw + 1) + 0.6;
      if (R.view === 'left') P.run(yy, rnd(R.cx - w) + 1, rnd(R.cx + w) - 1, m, 2);
      else P.run(yy, rnd(R.cx - w), rnd(R.cx + w) - 1, m, 2);
    }
  });

  reg('bandana', (P, R, a, ph) => {
    if (ph !== 'head') return;
    const m = mc(P, a, '#f2cc40'), h = R.hairInfo;
    const yEnd = (h ? h.fdy : R.hy + 3) - (R.t === 'ow' ? 1 : 2);
    dome(P, R, m, 0, yEnd, 0);
    // knot + tails at the back
    if (R.view !== 'down') {
      const x = R.view === 'up' ? R.cx : R.cx + R.hw + R.U(0.5), y = yEnd;
      P.limb(x, y, x + R.U(1.5), y + R.U(3), R.U(0.8), R.U(0.5), m, 1);
      P.limb(x, y, x - R.U(0.8) * (R.view === 'up' ? 1 : -1), y + R.U(3.4), R.U(0.8), R.U(0.5), m, 1);
    }
    if (R.view === 'down' && R.t === 'tr') for (let x = R.L(R.hw - 2); x <= R.Rt(R.hw - 2); x += 4) P.px(x, yEnd - 3, P.m('#ffffff'), 2);
  });

  reg('cap', (P, R, a, ph) => {
    if (ph !== 'head') return;
    const m = mc(P, a, '#d8363a'), m2 = mc2(P, a, '#f6f4f0'), h = R.hairInfo;
    const yEnd = (h ? h.fdy : R.hy + 3) - (R.t === 'ow' ? 1 : 1);
    const d = dome(P, R, m, R.t === 'ow' ? -1 : 0, yEnd, 0, 2.6);
    const U = R.U;
    if (R.view === 'down') {
      // front panel logo + visor
      P.ellipse(R.cx, d.top + U(2.2), U(1.2), U(1), m2, 2);
      P.begin('cap:visor');
      P.run(yEnd, R.L(R.hw - U(1)), R.Rt(R.hw - U(1)), m, 1);
      P.run(yEnd + 1, R.L(R.hw - U(2)), R.Rt(R.hw - U(2)), m, 0);
      if (R.t === 'tr') P.run(yEnd + 2, R.L(R.hw - U(3)), R.Rt(R.hw - U(3)), m, 0);
    } else if (R.view === 'left') {
      P.begin('cap:visor');
      const x0 = rnd(R.cx - R.hw) - U(3);
      P.run(yEnd, x0, rnd(R.cx - R.hw) + 1, m, 1);
      P.run(yEnd - 1, x0 + 1, rnd(R.cx - R.hw), m, 2);
    } else {
      P.run(yEnd, R.L(U(2)), R.Rt(U(2)), m2, 2); // strap at the back
    }
  });

  reg('flatcap', (P, R, a, ph) => {
    if (ph !== 'head') return;
    const m = mc(P, a, '#4a4452'), m2 = mc2(P, a, '#c8a050'), h = R.hairInfo, U = R.U;
    const yEnd = (h ? h.fdy : R.hy + 3) - (R.t === 'ow' ? 2 : 2);
    const d = dome(P, R, m, R.t === 'ow' ? 0 : -1, yEnd, U(0.6), 3);
    if (R.view === 'down') {
      P.begin('cap:visor');
      P.run(yEnd + 1, R.L(R.hw - U(0.5)), R.Rt(R.hw - U(0.5)), m, 0);
      if (R.t === 'tr') P.run(yEnd + 2, R.L(R.hw - U(2)), R.Rt(R.hw - U(2)), m, 0);
      P.begin('cap:button');
      P.px(rnd(R.cx - 0.5), d.top, m2, 3); if (R.t === 'tr') { P.px(rnd(R.cx + 0.5), d.top, m2, 2); P.px(rnd(R.cx - 0.5), d.top + 1, m2, 2); P.px(rnd(R.cx + 0.5), d.top + 1, m2, 1); }
      if (R.t === 'tr') { P.begin('cap:band'); P.run(yEnd - 1, R.L(d.rx - 1), R.Rt(d.rx - 1), m2, 1); }
    } else if (R.view === 'left') {
      P.begin('cap:visor');
      P.run(yEnd + 1, rnd(R.cx - R.hw) - U(2), rnd(R.cx), m, 0);
      P.px(rnd(R.cx), d.top, m2, 3);
    } else {
      P.px(rnd(R.cx - 0.5), d.top, m2, 3);
    }
  });

  reg('beret', (P, R, a, ph) => {
    if (ph !== 'head') return;
    const m = mc(P, a, '#b8302e'), m2 = mc2(P, a, '#e8c870'), h = R.hairInfo, U = R.U;
    const top = (h ? h.top : R.hy - 2) - U(1);
    const tilt = R.view === 'up' ? -1 : 1;
    const rx = R.hw + U(1.6), ry = R.t === 'ow' ? 2.2 : 3.6;
    const cx = R.cx - tilt * U(1), cy = top + ry + (R.t === 'ow' ? 0.5 : 1);
    // slanted ellipse: higher on one side
    for (let y = rnd(cy - ry - U(1)); y <= rnd(cy + ry + U(1)); y++) for (let x = rnd(cx - rx - 1); x <= rnd(cx + rx + 1); x++) {
      const dx = (x + 0.5 - cx) / rx, yy = y + 0.5 - (cy + tilt * dx * U(1)), dy = yy / ry;
      if (dx * dx + dy * dy <= 1) P.px(x, y, m, 2);
    }
    if (R.view === 'down' || R.view === 'left') { P.begin('beret:stem'); P.px(rnd(cx + tilt * U(1)), rnd(cy - ry) - U(0.5), m2, 3); if (R.t === 'tr') P.ellipse(cx + U(3), cy - ry * 0.2, 1.3, 1.1, m2, 3); }
  });

  reg('hat', (P, R, a, ph) => {
    if (ph !== 'head') return;
    const m = mc(P, a, '#e8c870'), m2 = mc2(P, a, '#d8363a'), h = R.hairInfo, U = R.U;
    const brimY = (h ? h.fdy : R.hy + 3) - U(1.6);
    const top = (h ? h.top : R.hy - 2) - U(1.5);
    // crown
    P.begin('hat');
    const cw = R.hw - U(0.5);
    for (let y = top; y <= brimY; y++) {
      const t = (y - top) / Math.max(1, brimY - top), w = cw - (y === top ? U(1) : 0) + t * 0.5;
      if (R.view === 'left') P.run(y, rnd(R.cx - w) + 1, rnd(R.cx + w) - 1, m, 2); else P.run(y, rnd(R.cx - w), rnd(R.cx + w) - 1, m, 2);
    }
    P.begin('hat:band');
    for (let k = 0; k < (R.t === 'ow' ? 1 : 2); k++) P.run(brimY - 1 - k, rnd(R.cx - cw), rnd(R.cx + cw) - 1, m2, 2);
    P.begin('hat:brim');
    const bw = R.hw + (R.t === 'ow' ? 2.5 : U(3.5)), bh = R.t === 'ow' ? 1.5 : 2.6;
    if (R.view === 'left') { P.ellipse(R.cx - U(0.5), brimY + 0.5, bw - 1, bh * 0.7, m, 2); }
    else P.ellipse(R.cx, brimY + (R.view === 'down' ? 1 : 0), bw, bh, m, 2);
  });

  // a builder's hard hat: a rounded shell that sits snug on the head, a raised ridge down the middle, and a short peak at the
  // front only (no brim round the sides or back), so it can't be mistaken for a sun hat
  reg('hardhat', (P, R, a, ph) => {
    if (ph !== 'head') return;
    const m = mc(P, a, '#f2cc40'), m2 = mc2(P, a, '#fff3b0'), h = R.hairInfo, U = R.U;
    const yEnd = (h ? h.fdy : R.hy + 3) - (R.t === 'ow' ? 2 : 2);
    P.begin('hardhat');
    const d = dome(P, R, m, R.t === 'ow' ? 1 : 1, yEnd, 0, 2.2);
    P.begin('hardhat:ridge');
    if (R.view === 'left') P.run(d.top + 1, rnd(R.cx - U(1)), rnd(R.cx + U(1)), m2, 2);
    else for (let y = d.top + 1; y <= yEnd - 1; y++) P.px(rnd(R.cx - 0.5), y, m2, 2);
    if (R.view === 'down') {
      P.begin('hardhat:peak');
      P.run(yEnd + 1, R.L(R.hw - U(1.5)), R.Rt(R.hw - U(1.5)), m, 1);
    } else if (R.view === 'left') {
      P.begin('hardhat:peak');
      P.run(yEnd + 1, rnd(R.cx - R.hw) - U(1), rnd(R.cx - R.hw) + U(1), m, 1);
    }
  });

  reg('maidcap', (P, R, a, ph) => {
    if (ph !== 'head') return;
    const m = mc(P, a, '#f6f4f0'), h = R.hairInfo, U = R.U;
    const top = (h ? h.top : R.hy - 2);
    if (R.view === 'left') { P.ellipse(R.cx + U(0.5), top + U(1), R.hw * 0.6, U(1.4), m, 2); return; }
    P.ellipse(R.cx, top + U(1.2), R.hw * 0.75, U(1.6), m, 2);
    if (R.t === 'tr') { P.begin('maidcap:frill'); for (let x = R.L(R.hw * 0.75); x <= R.Rt(R.hw * 0.75); x += 2) P.px(x, top + U(1.2) + U(1.6), m, 1); }
  });

  reg('bow', (P, R, a, ph) => {
    if (ph !== 'head') return;
    const m = mc(P, a, '#f0508a'), h = R.hairInfo, U = R.U;
    const top = h ? h.top : R.hy - 2;
    const s = R.view === 'up' ? -1 : 1;
    const bx = R.view === 'left' ? R.cx + U(1.5) : R.cx + s * R.hw * 0.55, by = top + U(1);
    const lw = U(2.6), lh = U(2);
    P.begin('bow');
    P.poly([[bx, by], [bx - lw - U(0.8), by - lh], [bx - lw - U(0.8), by + lh], [bx, by]].map(([x, y]) => [x, y]), m, 2);
    P.poly([[bx, by], [bx - lw - U(0.8), by - lh], [bx - lw, by + lh]], m, 2);
    P.poly([[bx + 1, by], [bx + lw + U(1.5), by - lh], [bx + lw + U(1.5), by + lh]], m, 2);
    P.ellipse(bx + 0.5, by, U(0.9), U(0.9), m, 3);
  });
  reg('ribbon', (P, R, a, ph) => {
    if (ph !== 'head') return;
    const m = mc(P, a, '#f0508a'), h = R.hairInfo, U = R.U;
    const bx = R.cx + (R.view === 'up' ? -1 : 1) * R.hw * 0.6, by = (h ? h.top : R.hy) + U(1.5);
    P.begin('ribbon');
    P.ellipse(bx - U(1), by, U(1.1), U(0.9), m, 2); P.ellipse(bx + U(1), by, U(1.1), U(0.9), m, 2); P.px(rnd(bx), rnd(by), m, 1);
  });

  reg('earmuffs', (P, R, a, ph) => {
    if (ph !== 'head') return;
    const m = mc(P, a, '#f06a9c'), band = P.m('#b8bccc'), h = R.hairInfo, U = R.U;
    const ey = R.hy + R.hh * 0.5;
    const top = h ? h.top : R.hy - 2;
    // band over the crown
    if (R.view !== 'left') {
      for (let y = top; y <= ey; y++) { const w = capHW(R, h || hp(R, STY.short), y) + 0.3; if (w < 0) continue; P.px(rnd(R.cx - w), y, band, 2); P.px(rnd(R.cx + w) - 1, y, band, 1); }
      for (const s of [-1, 1]) P.ellipse(R.cx + s * (R.hw + U(0.8)), ey, U(1.8), U(2), m, 2);
    } else {
      P.run(top, rnd(R.cx - 1), rnd(R.cx + 1), band, 2);
      P.limb(R.cx, top, R.cx + U(0.5), ey, 0.5, 0.5, band, 2);
      P.ellipse(R.cx + U(0.5), ey, U(1.8), U(2), m, 2);
    }
  });

  // a Kigu onesie hood, worn up: covers the hair to the jaw, with two tall tapering desert ears (color = hood, color2 = inner
  // ear). Shaded like everything else: lit top-left, a darker right side and underside.
  reg('kiguhood', (P, R, a, ph) => {
    if (ph !== 'head') return;
    const m = mc(P, a, '#e0b070'), inner = mc2(P, a, '#f0a090'), h = R.hairInfo || hp(R, STY.short), U = R.U;
    const fr = Math.min(h.fdy || R.hy + 3, (R.eyeY || R.hy + 4) - 2), chin = R.hy + R.hh - 1;
    const top = Math.min(h.top, R.hy - U(1)) - 1, cyc = h.cyc, ry = cyc - top + 0.5, rx = R.hw + Math.max(h.vol, U(1));
    const hwAt = (y) => { const t = (cyc - y) / ry; return y < cyc ? (t >= 1 ? -1 : rx * Math.pow(1 - Math.pow(t, 2.4), 1 / 2.4)) : rx; };
    const tone = (x, y, x0, x1) => { const f = (x - x0) / Math.max(1, x1 - x0); return y <= top + 1 && f < 0.5 ? 3 : f > 0.72 || y >= chin - 1 ? 1 : 2; };
    const row = (y, x0, x1) => { for (let x = x0; x <= x1; x++) P.px(x, y, m, tone(x, y, x0, x1)); };
    P.begin('kiguhood');
    const yEnd = R.view === 'up' ? chin : fr;
    for (let y = top; y <= yEnd; y++) {
      const hw = hwAt(y); if (hw < 0) continue;
      const x0 = rnd(R.cx - hw) + (R.view === 'left' && y < R.hy ? 1 : 0), x1 = rnd(R.cx + hw) - 1;
      row(y, x0, x1);
    }
    if (R.view === 'down') {
      for (let y = fr + 1; y < chin; y++) { const x0 = rnd(R.cx - rx), x1 = rnd(R.cx + rx) - 1; P.run(y, x0, x0 + 1, m, 2); P.run(y, x1 - 1, x1, m, 1); }
    } else if (R.view === 'left') {
      for (let y = fr + 1; y <= chin; y++) row(y, rnd(R.cx), rnd(R.cx + rx) - 1);
    }
    P.begin('kiguhood:ears');
    const len = R.t === 'ow' ? 8 : Math.max(6, Math.round(U(8)));
    const ear = (x, lean, shade) => {
      for (let i = 0; i < len; i++) {
        const w = U(1.6) * (1 - i / len), xc = x + lean * i * 0.3, y = top + (R.t === 'ow' ? 6 : Math.round(U(7))) - i;   // (rooted lower in the overworld so the tips fit the cell); tapers to a 1-px point
        if (w < 0.6) P.px(rnd(xc), y, m, shade); else P.run(y, rnd(xc - w), rnd(xc + w), m, shade);
        if (w > 0.9 && i > 0 && i < len - 2 && R.view !== 'up') P.px(rnd(xc), y, inner, 2);
      }
    };
    if (R.view === 'left') ear(R.cx + U(1.5), 0.5, 2);
    else { ear(R.cx - rx * 0.5, -1, 3); ear(R.cx + rx * 0.5, 1, 1); }
  });

  reg('flower', (P, R, a, ph) => {
    if (ph !== 'head' || R.view === 'up') return;
    const m = mc(P, a, '#f06a9c'), h = R.hairInfo, U = R.U;
    const x = R.view === 'left' ? R.cx + U(1) : R.cx - R.hw * 0.6, y = (h ? h.top : R.hy) + U(2);
    P.begin('flower');
    for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) P.ellipse(x + dx * U(1.1), y + dy * U(1.1), U(0.7), U(0.7), m, 2);
    P.px(rnd(x), rnd(y), P.m('#f2cc40'), 3);
  });
  HD.capHW = capHW;
  HD.hp = hp;
})(typeof globalThis !== 'undefined' ? globalThis : window);
