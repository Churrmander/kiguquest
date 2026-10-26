/* src/art/human/body.js — legs, shoes, torso, arms, outfits and body accessories for NP.art.human, at both scales.
 *
 * Drawn relative to a rig (rig.js). Front/back views share the silhouette; the side view (overworld only) has its own.
 * Outfits: L.OUT[type] = { body, sleeve, sleeveLen (0..1 of the arm), cuff, deco(P, R) } — the common code paints the torso
 * and arms from body/sleeve, then deco() adds the garment's own pieces (lapels, aprons, coat tails, collars...).
 * Body accessories register into L.ACC[type](P, R, acc, phase) with phase 'back' (behind the body) or 'body'.
 */
(function (root) {
  'use strict';
  const NP = (root.NP = root.NP || {});
  const HUM = NP.art.human;
  const L = HUM._;
  const BD = (L.body = {});
  const ACC = (L.ACC = L.ACC || {});
  const rnd = Math.round;

  // ---------------------------------------------------------------------------------------------------------------
  // Legs + shoes
  // ---------------------------------------------------------------------------------------------------------------
  /** materials of the legs from the bottom garment: { upper, lower, split (rows of upper from the leg top) } */
  function legMats(R) {
    const S = R.S, b = S.bottom.type, bare = S.legs ? 'legs' : 'skin';
    const n = R.foot - R.T.shoe - R.legTop + 1;
    if (b === 'pants' || b === 'overall') return { upper: 'bot', lower: 'bot', split: 99 };
    if (b === 'shorts') return { upper: 'bot', lower: bare, split: Math.max(1, rnd(n * 0.34)) };
    if (S.outfit.type === 'robe' || S.outfit.type === 'gown') return { upper: bare, lower: bare, split: 0 };
    return { upper: bare, lower: bare, split: 0 };
  }

  BD.legs = function (P, R) {
    const m = legMats(R), g = R.g;
    const ow = R.t === 'ow';
    if (R.view === 'left') return sideLegs(P, R, m);
    const hipHW = R.tw[R.tw.length - 1];
    for (const s of [-1, 1]) { // s = screen side
      // which character foot is on this screen side: front view -> char's left is screen right
      const charLeft = R.view === 'down' ? s > 0 : s < 0;
      const stepping = R.lead !== 0 && (R.lead > 0) === charLeft;
      const lift = stepping ? (ow ? 2 : 0) : 0;
      P.begin(s < 0 ? 'legL' : 'legR');
      const shoeBot = R.foot - lift, shoeTop = shoeBot - R.T.shoe + 1;
      const top = R.hipY + 1;
      if (ow) {
        const x0 = s < 0 ? R.L(hipHW) : R.Rt(hipHW) - g.legW + 1;
        for (let y = top; y < shoeTop; y++) {
          const mat = y - top < m.split ? m.upper : m.lower;
          for (let k = 0; k < g.legW; k++) P.px(x0 + k, y, mat, 2);
        }
        P.begin(s < 0 ? 'shoeL' : 'shoeR');
        const sx0 = s < 0 ? x0 - 1 : x0, sx1 = s < 0 ? x0 + g.legW - 1 : x0 + g.legW;
        for (let y = shoeTop; y <= shoeBot; y++) P.run(y, sx0 + (y === shoeTop && s < 0 ? 1 : 0), sx1 - (y === shoeTop && s > 0 ? 1 : 0), 'shoe', y === shoeBot ? 1 : 2);
        if (R.view === 'down' && !lift) P.px(s < 0 ? sx0 + 1 : sx0 + 1, shoeTop, 'shoe', 3);
      } else {
        const W = R.W;
        const hx = R.cx - hipHW + g.legW / 2, ax = hx - 0.6;
        const X = (x) => (s < 0 ? x : W - x);
        const kneeY = top + (shoeTop - top) * 0.48;
        const split = top + m.split;
        P.clip = { x0: 0, y0: 0, x1: W, y1: split - 1 };
        if (m.split > 0) P.limb(X(hx), top - 1, X(ax), shoeTop - 1, g.legW / 2, g.legW / 2 - 1.2, m.upper, 2, { caps: false });
        P.clip = { x0: 0, y0: split, x1: W, y1: shoeTop };
        P.limb(X(hx), top - 1, X(ax), shoeTop, g.legW / 2, g.legW / 2 - 1.2, m.lower, 2, { caps: false });
        P.clip = null;
        // knee crease
        if (m.lower !== 'skin' || m.split === 0) P.px(rnd(X(hx + (s < 0 ? 1 : -1) * 0)) - (s < 0 ? 0 : 1), rnd(kneeY), m.split > kneeY - top ? m.upper : m.lower, 1);
        P.begin(s < 0 ? 'shoeL' : 'shoeR');
        const scx = X(ax - 0.8), sw = g.legW / 2 + 1.2;
        for (let y = shoeTop; y <= shoeBot; y++) {
          const r = y - shoeTop, w = r === 0 ? sw - 1.2 : sw;
          P.run(y, rnd(scx - w), rnd(scx + w) - 1, 'shoe', r === R.T.shoe - 1 ? 1 : 2);
        }
        if (R.view === 'down') { P.px(rnd(scx - sw + 1.5), shoeTop + 1, 'shoe', 3); P.px(rnd(scx - sw + 2.5), shoeTop + 1, 'shoe', 3); }
      }
    }
  };

  function sideLegs(P, R, m) {
    const g = R.g;
    const top = R.hipY + 1, foot = R.foot, shoeTop = foot - R.T.shoe + 1;
    const hx = R.cx + 0.5; // hip centre (continuous)
    const stride = R.frame ? 3 : 0;
    // frame 1: the character's left (near) leg forward
    const near = R.frame === 1 ? -stride : R.frame === 2 ? stride : 0;
    const far = -near;
    const leg = (dx, isNear) => {
      P.begin(isNear ? 'legNear' : 'legFar');
      const ax = hx + dx, lift = dx > 0 && R.frame ? 1 : 0;
      const sb = foot - lift, st = sb - R.T.shoe + 1;
      for (let y = top; y < st; y++) {
        const t = (y - top) / Math.max(1, st - 1 - top);
        const cxl = hx + (ax - hx) * t;
        const mat = y - top < m.split ? m.upper : m.lower;
        for (let k = -1; k <= 1; k++) P.px(Math.floor(cxl - 0.5 + k), y, mat, isNear ? 2 : 1);
      }
      P.begin(isNear ? 'shoeNear' : 'shoeFar');
      const fx = Math.floor(ax - 0.5);
      for (let y = st; y <= sb; y++) P.run(y, fx - 2 + (y === st ? 1 : 0), fx + 1, 'shoe', y === sb ? 1 : isNear ? 2 : 1);
    };
    leg(far + (R.frame ? 0 : 1), false);
    leg(near, true);
  }

  // ---------------------------------------------------------------------------------------------------------------
  // Torso + arms
  // ---------------------------------------------------------------------------------------------------------------
  /** Row material of the torso: the bottom garment owns the hip rows. */
  function torsoMat(R, o, y) {
    const b = R.S.bottom.type;
    if (o.long) return o.body;
    if (y > R.hipY - R.g.hipRows && b !== 'none') return 'bot';
    return o.body;
  }

  BD.torso = function (P, R, o) {
    if (R.view === 'left') return sideTorso(P, R, o);
    const ow = R.t === 'ow';
    P.begin('torso');
    for (let r = 0; r < R.torso; r++) {
      const y = R.shY + r, hw = R.tw[r];
      P.run(y, R.L(hw), R.Rt(hw), torsoMat(R, o, y), 2);
    }
    if (!ow) { // neck
      P.begin('neck');
      const nh = R.T.neck + 1;
      for (let y = R.shY - nh; y < R.shY + 1; y++) P.run(y, R.L(3), R.Rt(3), 'skin', 1);
    }
  };

  /** Arms (front/back): sleeve material down to sleeveLen of the arm, cuff band, bare skin, hand. */
  function sideArm(P, R, o) {
    const sw = R.frame === 1 ? 1 : R.frame === 2 ? -1 : 0;
    P.begin('armNear');
    const len = R.torso - 1;
    const sleeveRows = o.sleeveLen >= 1 ? 99 : Math.round((len - 2) * o.sleeveLen);
    for (let r = 0; r < len; r++) {
      const y = R.shY + 1 + r, t = r / (len - 1);
      const x = Math.round(R.cx - 1 - sw * t * 2.2);
      const hand = r >= len - 2;
      const mat = hand ? (o.hand || 'skin') : r < sleeveRows ? o.sleeve : 'skin';
      P.px(x, y, mat, 2); P.px(x + 1, y, mat, 2);
    }
  }

  BD.arms = function (P, R, o) {
    if (R.view === 'left') return sideArm(P, R, o);
    const ow = R.t === 'ow', g = R.g;
    const sh = Math.max(...R.tw.slice(1, 4));
    for (const s of [-1, 1]) {
      const charLeft = R.view === 'down' ? s > 0 : s < 0;
      // the arm opposite the stepping leg swings forward
      const swing = R.lead === 0 ? 0 : (R.lead > 0) === charLeft ? -1 : 1; // +1 forward
      P.begin(s < 0 ? 'armL' : 'armR');
      if (ow) {
        const x0 = s < 0 ? R.L(sh) - g.arm : R.Rt(sh) + 1;
        const y0 = R.shY + 1, len = R.torso - 1 + (swing > 0 ? 1 : swing < 0 ? -1 : 0) + (R.S.build === 'child' ? 0 : 0);
        const sleeveRows = o.sleeveLen >= 1 ? 99 : rnd((len - 2) * o.sleeveLen);
        for (let r = 0; r < len; r++) {
          const y = y0 + r, hand = r >= len - 2;
          const mat = hand ? (o.hand || 'skin') : r < sleeveRows ? (o.cuff && r >= sleeveRows - 1 && sleeveRows < 99 ? o.cuff : o.sleeve) : 'skin';
          const cuff = o.cuff && sleeveRows === 99 && r === len - 3;
          for (let k = 0; k < g.arm; k++) {
            if (r === 0 && (s < 0 ? k === 0 : k === g.arm - 1)) continue; // rounded shoulder
            if (hand && r === len - 1 && (s < 0 ? k === 0 : k === g.arm - 1) && false) continue;
            P.px(x0 + k, y, cuff ? o.cuff : mat, 2);
          }
        }
        continue;
      }
      // trainer
      const W = R.W, X = (x) => (s < 0 ? x : W - x);
      const aw = g.arm / 2;
      const sx = R.cx - sh - aw + 1.8, sy = R.shY + aw + 0.8;
      let ex = sx - 1.2, ey = R.waistY - 1;
      let wx = sx - 0.2, wy = R.hipY + 1;
      // battle send-out poses (back view): the character's right arm (screen right) throws
      const pose = R.view === 'up' && s > 0 && R.pose && R.pose !== 'ready' ? R.pose : null;
      if (pose === 'windup') { ex = sx - 6; ey = sy - 1; wx = sx - 5; wy = sy - 10; }
      else if (pose === 'throw') { ex = sx - 1; ey = sy - 9; wx = sx + 1.5; wy = sy - 18; }
      else if (pose === 'follow') { ex = sx + 2; ey = sy + 7; wx = sx + 8; wy = sy + 10; }
      const sleeveY = o.sleeveLen >= 1 ? 999 : rnd(sy + (wy - sy) * o.sleeveLen);
      const drawArm = (mat, y0, y1) => {
        P.clip = { x0: 0, y0, x1: W, y1 };
        P.limb(X(sx), sy, X(ex), ey, aw, aw - 0.4, mat, 2);
        P.limb(X(ex), ey, X(wx), wy, aw - 0.4, aw - 1.1, mat, 2);
        P.clip = null;
      };
      drawArm('skin', 0, 999);
      drawArm(o.sleeve, 0, sleeveY);
      if (o.cuff) drawArm(o.cuff, Math.min(sleeveY, wy) - (sleeveY > wy ? 2 : 1), Math.min(sleeveY, wy));
      // hand
      P.begin(s < 0 ? 'handL' : 'handR');
      const hx = X(wx) - 0.5;
      if (pose) { // hand continues along the forearm
        const dx = wx - ex, dy = wy - ey, d = Math.hypot(dx, dy) || 1;
        P.ellipse(X(wx + (dx / d) * 2) - 0.5, wy + (dy / d) * 2, 2, 2, o.hand || 'skin', 2);
        continue;
      }
      P.ellipse(hx, wy + 2, 1.6, 2.3, o.hand || 'skin', 2);
      P.px(Math.round(hx + (s < 0 ? 1.5 : -1.5)) - (s < 0 ? 0 : 1), Math.round(wy + 1), o.hand || 'skin', 2); // thumb
    }
  };

  function sideTorso(P, R, o) {
    const ow = R.t === 'ow';
    const hw = ow ? 3 : 6;
    const x0 = rnd(R.cx - hw + 0.5), x1 = rnd(R.cx + hw - 0.5);
    // far arm peeks out behind when swinging
    const sw = R.frame === 1 ? 1 : R.frame === 2 ? -1 : 0; // near arm swing (+1 forward = to the left)
    if (sw) {
      P.begin('armFar');
      const fx = sw > 0 ? x1 : x0 - 1;
      for (let r = 1; r < R.torso - 1; r++) P.px(fx + (r > R.torso - 4 ? -sw : 0), R.shY + r, r >= R.torso - 3 ? 'skin' : o.sleeve, 1);
    }
    P.begin('torso');
    for (let r = 0; r < R.torso; r++) {
      const y = R.shY + r;
      const a = r === 0 ? 1 : 0, belly = R.g.belly && r > 1 && r < R.torso - 1 ? 1 : 0;
      P.run(y, x0 + a - belly, x1 - a, torsoMat(R, o, y), 2);
    }
  }

  // ---------------------------------------------------------------------------------------------------------------
  // Skirts and garment helpers
  // ---------------------------------------------------------------------------------------------------------------
  /** flared skirt from row y0 to y1 (front/back/side). hw0 at the waist, flare px wider at the hem. */
  function skirt(P, R, mat, y0, y1, flare, o) {
    o = o || {};
    P.begin(o.part || 'skirt');
    const hw0 = (o.hw0 !== undefined ? o.hw0 : R.tw[R.tw.length - 1]);
    const per = R.t === 'ow' ? 3 : 4;
    for (let y = y0; y <= y1; y++) {
      const t = (y - y0) / Math.max(1, y1 - y0);
      const hw = hw0 + t * flare;
      if (R.view === 'left') {
        const a = rnd(R.cx - (R.t === 'ow' ? 3 : 6) - t * flare * 0.8 + 0.5), b = rnd(R.cx + (R.t === 'ow' ? 3 : 6) + t * flare * 0.6 - 0.5);
        P.run(y, a, b, mat, 2);
        continue;
      }
      const a = rnd(R.cx - hw), b = rnd(R.cx + hw) - 1;
      P.run(y, a, b, mat, 2);
      if (o.pleats && y > y0 + 1) for (let x = a + 2; x < b; x++) if (((x - rnd(R.cx)) % per + per) % per === 0) P.px(x, y, mat, 1);
    }
    if (o.hemMat) P.run(y1, rnd(R.cx - hw0 - flare), rnd(R.cx + hw0 + flare) - 1, o.hemMat, 2);
  }
  BD.skirt = skirt;

  /** centred band [y0..y1] with half-width hw (may be a function of y). */
  function band(P, R, y0, y1, hw, mat, tone) {
    for (let y = y0; y <= y1; y++) { const w = typeof hw === 'function' ? hw(y) : hw; if (w > 0) P.run(y, R.L(w), R.Rt(w), mat, tone === undefined ? 2 : tone); }
  }

  /** V opening at the neck: depth rows, from half-width w0 to w1 */
  function vee(P, R, y0, depth, w0, w1, mat, tone) {
    for (let k = 0; k < depth; k++) { const w = w0 + (w1 - w0) * (k / Math.max(1, depth - 1)); if (w > 0.3) P.run(y0 + k, R.L(w), R.Rt(w), mat, tone === undefined ? 2 : tone); }
  }

  /** lower end of the leg area (above the shoes) */
  const kneeY = (R) => R.hipY + rnd((R.foot - R.T.shoe - R.hipY) * 0.5);
  const ankleY = (R) => R.foot - R.T.shoe - (R.t === 'ow' ? 0 : 1);

  // ---------------------------------------------------------------------------------------------------------------
  // Outfits
  // ---------------------------------------------------------------------------------------------------------------
  const OUT = (L.OUT = {});
  const ow = (R) => R.t === 'ow';

  OUT.tee = {
    body: 'top', sleeve: 'top', sleeveLen: 0.38,
    deco(P, R) {
      if (R.view !== 'down') return;
      P.begin('collar');
      if (ow(R)) { P.px(rnd(R.cx - 0.5), R.shY, 'skin', 1); P.px(rnd(R.cx + 0.5), R.shY, 'skin', 1); }
      else { vee(P, R, R.shY, 3, 3, 1, 'skin', 1); P.run(R.shY + 3, R.L(2), R.Rt(2), 'top', 3); }
    },
  };

  OUT.jacket = {
    body: 'top', sleeve: 'top', sleeveLen: 1, cuff: 'trim',
    deco(P, R) {
      const hemY = R.hipY - R.g.hipRows;
      if (R.view === 'down') {
        P.begin('shirt');
        const w = ow(R) ? 1 : 3;
        band(P, R, R.shY, hemY, (y) => (y < R.shY + (ow(R) ? 1 : 3) ? w + (ow(R) ? 0 : 1) : w), 'under', 2);
        P.begin('zip');
        if (!ow(R)) for (let y = R.shY + 2; y <= hemY; y++) { P.px(R.L(w) - 1, y, 'trim', 2); P.px(R.Rt(w) + 1, y, 'trim', 1); }
        else for (let y = R.shY + 1; y <= hemY; y++) { P.px(R.L(w) - 1, y, 'trim', 2); P.px(R.Rt(w) + 1, y, 'trim', 1); }
        vee(P, R, R.shY, ow(R) ? 1 : 3, ow(R) ? 1 : 3, 1, 'skin', 1);
      }
      P.begin('hem');
      P.run(hemY, R.L(R.tw[hemY - R.shY]), R.Rt(R.tw[hemY - R.shY]), 'trim', 2);
      if (R.view !== 'down') { P.begin('collar'); band(P, R, R.shY, R.shY + (ow(R) ? 0 : 2), ow(R) ? 3 : 6, 'trim', 2); }
    },
  };

  OUT.hoodie = {
    body: 'top', sleeve: 'top', sleeveLen: 1,
    deco(P, R) {
      P.begin('hood');
      if (R.view === 'down') {
        if (ow(R)) { P.px(R.L(3), R.shY, 'top', 3); P.px(R.Rt(3), R.shY, 'top', 1); P.px(rnd(R.cx - 1.5), R.shY + 1, 'trim', 2); P.px(rnd(R.cx + 1.5) - 1, R.shY + 1, 'trim', 1); P.px(rnd(R.cx - 1.5), R.shY + 2, 'trim', 2); P.px(rnd(R.cx + 1.5) - 1, R.shY + 2, 'trim', 1); }
        else {
          band(P, R, R.shY - 1, R.shY + 1, 7, 'top', 3);
          vee(P, R, R.shY, 2, 3, 2, 'skin', 1);
          for (let y = R.shY + 2; y <= R.shY + 7; y++) { P.px(R.L(2), y, 'trim', 2); P.px(R.Rt(2), y, 'trim', 1); }
          P.begin('pocket'); const py = R.waistY + 1; P.run(py, R.L(5), R.Rt(5), 'top', 1); for (let y = py + 1; y <= R.hipY - R.g.hipRows; y++) { P.px(R.L(5) - (y - py > 2 ? 1 : 0), y, 'top', 1); P.px(R.Rt(5) + (y - py > 2 ? 1 : 0), y, 'top', 1); }
        }
      } else if (R.view === 'up') {
        // hood lying on the back
        band(P, R, R.shY, R.shY + (ow(R) ? 2 : 6), (y) => (ow(R) ? 3 - (y - R.shY) * 0.5 : 7 - (y - R.shY) * 0.7), 'top', 1);
      } else {
        P.run(R.shY, rnd(R.cx), rnd(R.cx + 3), 'top', 1); P.run(R.shY + 1, rnd(R.cx + 1), rnd(R.cx + 3), 'top', 1);
      }
      const hemY = R.hipY - R.g.hipRows;
      if (R.view !== 'left') { P.begin('rib'); P.run(hemY, R.L(R.tw[hemY - R.shY]), R.Rt(R.tw[hemY - R.shY]), 'top', 1); }
    },
  };

  OUT.vest = {
    body: 'under', sleeve: 'under', sleeveLen: 1,
    deco(P, R) {
      const hemY = R.hipY - R.g.hipRows;
      P.begin('vest');
      for (let y = R.shY; y <= hemY; y++) {
        const r = y - R.shY, hw = R.tw[r];
        if (R.view === 'down') {
          const open = ow(R) ? (r < 3 ? 1 : 0.5) : Math.max(1, 4 - r * 0.4);
          P.run(y, R.L(hw), rnd(R.cx - open) - 1, 'top', 2); P.run(y, rnd(R.cx + open), R.Rt(hw), 'top', 2);
        } else if (R.view === 'up') P.run(y, R.L(hw), R.Rt(hw), 'top', 2);
        else P.run(y, rnd(R.cx - (ow(R) ? 1 : 3)), rnd(R.cx + (ow(R) ? 3 : 6) - 0.5), 'top', 2);
      }
      if (R.view === 'down') {
        P.begin('buttons');
        const xs = ow(R) ? [rnd(R.cx - 0.5) - 1] : [rnd(R.cx) - 3];
        for (let y = R.shY + (ow(R) ? 3 : 7); y < hemY; y += ow(R) ? 3 : 4) for (const x of xs) P.px(x, y, 'trim', 3);
      }
    },
  };

  function dressLike(P, R, len, flare, o) {
    const y0 = R.hipY - R.g.hipRows + 1, y1 = Math.min(ankleY(R), y0 + len);
    skirt(P, R, 'top', y0 - 1, y1, flare, { pleats: !ow(R), hemMat: o && o.hemMat, hw0: R.tw[R.tw.length - 1] });
    if (o && o.waist) { P.begin('waist'); const y = y0 - 1; P.run(y, R.L(R.tw[y - R.shY]), R.Rt(R.tw[y - R.shY]), o.waist, 2); }
  }

  OUT.dress = {
    body: 'top', sleeve: 'top', sleeveLen: 0.3, longTorso: true,
    deco(P, R) {
      dressLike(P, R, ow(R) ? 3 : 12, ow(R) ? 1.5 : 6, { waist: 'trim' });
      if (R.view === 'down') { P.begin('collar'); if (ow(R)) P.run(R.shY, rnd(R.cx - 1.5), rnd(R.cx + 1.5) - 1, 'trim', 2); else { vee(P, R, R.shY, 3, 4, 2, 'trim', 2); vee(P, R, R.shY, 2, 2, 1, 'skin', 1); } }
    },
  };

  OUT.gown = {
    body: 'top', sleeve: 'top', sleeveLen: 1, cuff: 'trim', longTorso: true,
    deco(P, R) {
      dressLike(P, R, 99, ow(R) ? 2.5 : 9, { waist: 'trim', hemMat: 'trim' });
      if (R.view === 'down') { P.begin('collar'); if (ow(R)) P.run(R.shY, rnd(R.cx - 2), rnd(R.cx + 2) - 1, 'trim', 2); else { vee(P, R, R.shY, 4, 5, 2, 'trim', 2); vee(P, R, R.shY, 3, 3, 1, 'skin', 1); } }
    },
  };

  OUT.maid = {
    body: 'top', sleeve: 'top', sleeveLen: 0.4, cuff: 'trim', longTorso: true,
    deco(P, R) {
      dressLike(P, R, ow(R) ? 3 : 13, ow(R) ? 1.5 : 7);
      const hemY = R.hipY - R.g.hipRows;
      P.begin('mapron');
      if (R.view === 'down') {
        const w = ow(R) ? 2 : 5;
        band(P, R, R.shY + (ow(R) ? 2 : 4), hemY, w, 'trim', 2);
        skirt(P, R, 'trim', hemY + 1, Math.min(ankleY(R), hemY + 1 + (ow(R) ? 3 : 12)), ow(R) ? 0.5 : 3, { hw0: w + (ow(R) ? 0 : 1), part: 'mapron' });
        P.begin('mbow');
        if (ow(R)) { P.px(rnd(R.cx - 0.5), R.shY, 'under', 2); P.px(rnd(R.cx + 0.5), R.shY, 'under', 1); }
        else { band(P, R, R.shY + 1, R.shY + 2, (y) => (y === R.shY + 1 ? 3 : 2), 'under', 2); P.px(rnd(R.cx - 0.5), R.shY + 3, 'under', 1); P.px(rnd(R.cx + 0.5), R.shY + 3, 'under', 1); }
      } else if (R.view === 'up') {
        band(P, R, hemY - (ow(R) ? 0 : 1), hemY, ow(R) ? 2 : 4, 'trim', 2);
        if (!ow(R)) { P.limb(R.cx, hemY, R.cx - 3, hemY + 7, 1.2, 0.8, 'trim', 2); P.limb(R.cx, hemY, R.cx + 3, hemY + 7, 1.2, 0.8, 'trim', 2); }
      } else { P.run(R.shY + 2, rnd(R.cx - 3), rnd(R.cx - 1), 'trim', 2); skirt(P, R, 'trim', hemY + 1, hemY + 3, 0, { hw0: 1, part: 'mapron' }); }
    },
  };

  OUT.apron = {
    body: 'under', sleeve: 'under', sleeveLen: 0.4,
    deco(P, R) {
      const hemY = R.hipY - R.g.hipRows;
      P.begin('apron');
      if (R.view === 'down') {
        const w = ow(R) ? 3 : 7;
        band(P, R, R.shY + (ow(R) ? 2 : 4), hemY, w, 'top', 2);
        skirt(P, R, 'top', hemY + 1, Math.min(ankleY(R) - (ow(R) ? 1 : 3), hemY + (ow(R) ? 4 : 16)), ow(R) ? 0.5 : 2, { hw0: w + (ow(R) ? 0.5 : 1), part: 'apron:skirt' });
        P.begin('apron:straps');
        const sx = ow(R) ? 2 : 5;
        for (let y = R.shY; y < R.shY + (ow(R) ? 2 : 4); y++) { P.px(rnd(R.cx - sx - 0.5), y, 'top', 2); P.px(rnd(R.cx + sx - 0.5), y, 'top', 2); }
        P.begin('apron:trim');
        P.run(R.shY + (ow(R) ? 2 : 4), R.L(w), R.Rt(w), 'trim', 2);
        if (!ow(R)) { const py = hemY + 3; P.run(py, R.L(5), R.Rt(5), 'trim', 2); for (let y = py + 1; y < py + 5; y++) { P.px(R.L(5), y, 'trim', 1); P.px(R.Rt(5), y, 'trim', 1); P.px(rnd(R.cx), y, 'trim', 1); } P.run(py + 5, R.L(5), R.Rt(5), 'trim', 1); }
      } else if (R.view === 'up') {
        // strings tied at the back
        P.run(hemY - (ow(R) ? 1 : 2), R.L(R.tw[hemY - R.shY - 1]), R.Rt(R.tw[hemY - R.shY - 1]), 'top', 1);
        if (!ow(R)) { P.limb(R.cx, hemY - 2, R.cx - 3, hemY + 5, 1, 0.6, 'top', 2); P.limb(R.cx, hemY - 2, R.cx + 3, hemY + 5, 1, 0.6, 'top', 2); }
        else { P.px(rnd(R.cx - 1), hemY, 'top', 2); P.px(rnd(R.cx), hemY + 1, 'top', 2); }
      } else {
        for (let y = R.shY + 2; y <= hemY; y++) P.run(y, rnd(R.cx - 3), rnd(R.cx - 1), 'top', 2);
        skirt(P, R, 'top', hemY + 1, hemY + 4, 0.5, { hw0: 2, part: 'apron:skirt' });
      }
    },
  };

  function longCoat(o) {
    return {
      body: 'top', sleeve: 'top', sleeveLen: 1, cuff: o.cuff,
      deco(P, R) {
        const hemY = R.hipY - R.g.hipRows;
        const endY = Math.min(ankleY(R) - (ow(R) ? 1 : 2), R.hipY + rnd((R.foot - R.hipY) * o.len));
        P.begin('coat');
        // tails over the legs / bottom
        for (let y = hemY; y <= endY; y++) {
          const t = (y - hemY) / Math.max(1, endY - hemY), hw = R.tw[R.tw.length - 1] + t * (ow(R) ? 1 : 3) + (ow(R) ? 0 : 1);
          if (R.view === 'left') { P.run(y, rnd(R.cx - (ow(R) ? 3 : 6)), rnd(R.cx + (ow(R) ? 3 : 6) + t) - 1, 'top', 2); continue; }
          P.run(y, rnd(R.cx - hw), rnd(R.cx + hw) - 1, 'top', 2);
          if (R.view === 'down' && !o.closed) { const gap = ow(R) ? 0.5 : 1 + t * 2; for (let x = rnd(R.cx - gap); x <= rnd(R.cx + gap) - 1; x++) P.clearPx(x, y); }
        }
        if (R.view === 'left') return;
        // re-paint the waist rows of the body in the coat colour (the coat covers the belt line)
        for (let y = hemY - R.g.hipRows; y <= Math.min(R.hipY, endY); y++) { const hw = R.tw[Math.min(R.tw.length - 1, y - R.shY)]; P.run(y, R.L(hw), R.Rt(hw), 'top', 2); }
        if (R.view === 'down') {
          P.begin('shirt');
          if (o.closed) {
            if (ow(R)) { P.px(rnd(R.cx - 0.5), R.shY, 'trim', 2); P.px(rnd(R.cx + 0.5), R.shY, 'trim', 1); }
            else { band(P, R, R.shY, R.shY + 2, (y) => 5 - (y - R.shY), 'trim', 2); }
            P.begin('buttons'); for (let y = R.shY + (ow(R) ? 2 : 5); y <= hemY; y += ow(R) ? 2 : 4) P.px(rnd(R.cx - 0.5), y, 'trim', 3);
            if (o.trimHem) { P.begin('hemtrim'); P.run(endY, 0, R.W, 'trim', 2); for (let x = 0; x < R.W; x++) if (P.partRaw(x, endY) === P.cur && P.getRaw(x, endY - 1) < 0) P.clearPx(x, endY); }
          } else {
            const w = ow(R) ? 1 : 3;
            band(P, R, R.shY, R.waistY - (ow(R) ? 1 : 2), (y) => (ow(R) ? 1 : Math.max(1, w - (y - R.shY) * 0.15)), 'under', 2);
            vee(P, R, R.shY, ow(R) ? 1 : 3, ow(R) ? 1 : 2, 1, 'skin', 1);
            P.begin('opening'); for (let y = R.waistY - (ow(R) ? 0 : 1); y <= hemY; y++) P.px(rnd(R.cx - 0.5), y, 'top', 0);
            if (!ow(R)) {
              P.begin('lapel'); for (let k = 0; k < 7; k++) { P.px(R.L(w) - 1 + 0 - (k < 4 ? 0 : 0), R.shY + k, 'top', 3); P.px(R.Rt(w) + 1, R.shY + k, 'top', 1); }
              P.begin('pockets'); for (const sx of [-1, 1]) { const px = rnd(R.cx + sx * 5) - (sx < 0 ? 3 : 0); P.run(hemY + 3, px, px + 3, 'trim', 2); }
              P.px(R.L(6), R.shY + 5, 'trim', 3); P.px(R.L(6) + 1, R.shY + 5, 'trim', 3);
            }
          }
        } else {
          P.begin('coatback');
          for (let y = hemY + 1; y <= endY; y++) P.px(rnd(R.cx - 0.5), y, 'top', 1);
          if (o.trimHem) for (let x = 0; x < R.W; x++) if (P.partRaw(x, endY) === P.partsNamed('coat')[0]) P.px(x, endY, 'trim', 2);
        }
      },
      long: true,
    };
  }
  OUT.labcoat = longCoat({ len: 0.55 });
  OUT.coat = longCoat({ len: 0.42, closed: true, trimHem: true, cuff: 'trim' });

  OUT.robe = {
    body: 'top', sleeve: 'top', sleeveLen: 1, cuff: 'trim', long: true,
    deco(P, R) {
      const y0 = R.hipY - R.g.hipRows;
      skirt(P, R, 'top', y0, ankleY(R), ow(R) ? 2 : 7, { part: 'robe' });
      P.begin('robebelt');
      const by = R.waistY + (ow(R) ? 0 : 1);
      for (let k = 0; k < (ow(R) ? 1 : 3); k++) P.run(by + k, R.L(R.tw[by + k - R.shY]), R.Rt(R.tw[by + k - R.shY]), 'trim', 2);
      if (R.view === 'down') {
        P.begin('robefront');
        for (let y = R.shY; y <= ankleY(R); y++) { if (y >= by && y < by + (ow(R) ? 1 : 3)) continue; P.px(rnd(R.cx - 0.5) - (y < R.shY + 3 ? rnd((R.shY + 3 - y) * 0.7) : 0), y, 'trim', 2); if (!ow(R)) P.px(rnd(R.cx + 0.5) - (y < R.shY + 3 ? rnd((R.shY + 3 - y) * 0.7) : 0), y, 'trim', 1); }
        P.run(ankleY(R), 0, R.W, 'trim', 2);
        for (let x = 0; x < R.W; x++) if (P.partRaw(x, ankleY(R)) === P.cur && P.getRaw(x, ankleY(R) - 1) < 0) P.clearPx(x, ankleY(R));
      }
    },
  };

  OUT.uniform = {
    body: 'top', sleeve: 'top', sleeveLen: 1, cuff: 'trim',
    deco(P, R) {
      const hemY = R.hipY - R.g.hipRows;
      P.begin('ucol');
      if (R.view === 'down') {
        if (ow(R)) { P.run(R.shY, rnd(R.cx - 2), rnd(R.cx + 2) - 1, 'trim', 2); P.px(rnd(R.cx - 0.5), R.shY + 2, 'trim', 3); P.px(rnd(R.cx - 0.5), R.shY + 4, 'trim', 3); }
        else {
          for (let k = 0; k < 5; k++) { P.run(R.shY - 1 + k, R.L(5 - k * 0.6), R.L(5 - k * 0.6) + 2, 'trim', 2); P.run(R.shY - 1 + k, R.Rt(5 - k * 0.6) - 2, R.Rt(5 - k * 0.6), 'trim', 1); }
          P.begin('ubuttons'); for (let y = R.shY + 5; y < hemY; y += 3) P.px(rnd(R.cx - 0.5), y, 'trim', 3);
          P.begin('ustripe'); P.run(R.shY + 1, R.L(R.tw[1]), R.L(R.tw[1]) + 2, 'trim', 2); P.run(R.shY + 1, R.Rt(R.tw[1]) - 2, R.Rt(R.tw[1]), 'trim', 1);
        }
      } else if (R.view === 'up') band(P, R, R.shY, R.shY + (ow(R) ? 0 : 2), ow(R) ? 3 : 6, 'trim', 2);
      P.begin('ubelt');
      const y = hemY;
      if (R.view !== 'left') P.run(y, R.L(R.tw[y - R.shY]), R.Rt(R.tw[y - R.shY]), 'trim', 1);
    },
  };

  OUT.cardigan = {
    body: 'under', sleeve: 'top', sleeveLen: 1, cuff: 'trim',
    deco(P, R) {
      const hemY = R.hipY - R.g.hipRows;
      P.begin('cardi');
      for (let y = R.shY; y <= hemY; y++) {
        const r = y - R.shY, hw = R.tw[r];
        if (R.view === 'down') { const open = ow(R) ? 1 : Math.max(2, 4 - r * 0.25); P.run(y, R.L(hw), rnd(R.cx - open) - 1, 'top', 2); P.run(y, rnd(R.cx + open), R.Rt(hw), 'top', 2); }
        else P.run(y, R.L(hw), R.Rt(hw), 'top', 2);
      }
      if (R.view === 'down') {
        P.begin('cbuttons');
        for (let y = R.shY + (ow(R) ? 2 : 5); y <= hemY; y += ow(R) ? 2 : 4) P.px(rnd(R.cx - (ow(R) ? 1.5 : 3)), y, 'trim', 3);
      }
      P.begin('crib'); P.run(hemY, R.L(R.tw[hemY - R.shY]), R.Rt(R.tw[hemY - R.shY]), 'top', 1);
    },
  };

  OUT.overalls = {
    body: 'under', sleeve: 'under', sleeveLen: 0.4,
    deco(P, R) {
      const hemY = R.hipY - R.g.hipRows;
      P.begin('bib');
      if (R.view === 'down') {
        const w = ow(R) ? 3 : 6;
        band(P, R, R.shY + (ow(R) ? 2 : 6), hemY + 1, w, 'bot', 2);
        P.begin('bib:straps');
        for (let y = R.shY; y < R.shY + (ow(R) ? 2 : 6); y++) { P.run(y, R.L(w), R.L(w) + (ow(R) ? 0 : 1), 'bot', 2); P.run(y, R.Rt(w) - (ow(R) ? 0 : 1), R.Rt(w), 'bot', 2); }
        P.begin('bib:buckles');
        P.px(R.L(w), R.shY + (ow(R) ? 2 : 6), 'trim', 3); P.px(R.Rt(w), R.shY + (ow(R) ? 2 : 6), 'trim', 3);
        if (!ow(R)) { const py = R.shY + 9; P.run(py, R.L(3), R.Rt(3), 'bot', 1); P.px(R.L(3), py + 1, 'bot', 1); P.px(R.L(3), py + 2, 'bot', 1); P.px(R.Rt(3), py + 1, 'bot', 1); P.px(R.Rt(3), py + 2, 'bot', 1); P.run(py + 3, R.L(3), R.Rt(3), 'bot', 1); }
      } else if (R.view === 'up') {
        const w = ow(R) ? 3 : 6;
        for (let y = R.shY; y <= hemY; y++) { const t = (y - R.shY) / (hemY - R.shY); const x = rnd(w * (1 - t)); P.run(y, R.L(x + 1), R.L(x + 1) + (ow(R) ? 0 : 1), 'bot', 2); P.run(y, R.Rt(x + 1) - (ow(R) ? 0 : 1), R.Rt(x + 1), 'bot', 2); }
        band(P, R, hemY - (ow(R) ? 0 : 3), hemY + 1, ow(R) ? 3 : 7, 'bot', 2);
      } else {
        for (let y = R.shY + 2; y <= hemY + 1; y++) P.run(y, rnd(R.cx - 3), rnd(R.cx + 1), 'bot', 2);
        P.px(rnd(R.cx), R.shY, 'bot', 2); P.px(rnd(R.cx), R.shY + 1, 'bot', 2);
      }
    },
  };

  OUT.suit = {
    body: 'top', sleeve: 'top', sleeveLen: 1, cuff: 'under',
    deco(P, R) {
      const hemY = R.hipY - R.g.hipRows;
      if (R.view !== 'down') { P.begin('scol'); band(P, R, R.shY, R.shY, ow(R) ? 2 : 4, 'under', 2); return; }
      P.begin('shirt');
      if (ow(R)) { vee(P, R, R.shY, 3, 1.5, 0.5, 'under', 2); P.begin('tie'); P.px(rnd(R.cx - 0.5), R.shY + 1, 'trim', 2); P.px(rnd(R.cx - 0.5), R.shY + 2, 'trim', 2); P.px(rnd(R.cx + 0.5), R.shY + 2, 'trim', 1); return; }
      vee(P, R, R.shY, 9, 4, 1, 'under', 2);
      P.begin('tie');
      for (let y = R.shY + 1; y <= R.shY + 10; y++) { P.px(rnd(R.cx - 0.5), y, 'trim', 2); if (y > R.shY + 2) P.px(rnd(R.cx + 0.5), y, 'trim', 1); }
      P.begin('lapel'); for (let k = 0; k < 9; k++) { const w = 4 - k * 0.38; P.px(R.L(w) - 1, R.shY + k, 'top', 3); P.px(R.Rt(w) + 1, R.shY + k, 'top', 1); }
      P.begin('sbuttons'); for (const y of [R.waistY - 1, R.waistY + 2]) P.px(rnd(R.cx - 1.5), y, 'top', 0);
      P.begin('hank'); P.run(R.shY + 5, R.Rt(R.tw[5]) - 4, R.Rt(R.tw[5]) - 2, 'under', 3);
      P.begin('sopen'); for (let y = R.waistY + 3; y <= hemY; y++) P.px(rnd(R.cx - 0.5), y, 'top', 0);
    },
  };

  OUT.sailor = {
    body: 'top', sleeve: 'top', sleeveLen: 0.45, cuff: 'trim',
    deco(P, R) {
      P.begin('scollar');
      if (R.view === 'down') {
        if (ow(R)) {
          P.run(R.shY, R.L(R.tw[0]), R.Rt(R.tw[0]), 'trim', 2);
          vee(P, R, R.shY, 3, 2, 0.5, 'trim', 2);
          vee(P, R, R.shY, 2, 1, 0.5, 'skin', 1);
          P.px(rnd(R.cx - 0.5), R.shY + 3, 'under', 2); P.px(rnd(R.cx + 0.5), R.shY + 3, 'under', 1);
        } else {
          vee(P, R, R.shY, 8, R.tw[1] - 1, 1, 'trim', 2);
          vee(P, R, R.shY, 7, R.tw[1] - 3, 0.5, 'top', 2);
          vee(P, R, R.shY, 6, 3, 0.5, 'skin', 1);
          P.begin('scarf'); for (let k = 0; k < 4; k++) P.run(R.shY + 7 + k, R.L(1 + k * 0.8), R.Rt(1 + k * 0.8), 'under', k === 3 ? 1 : 2);
        }
      } else if (R.view === 'up') {
        band(P, R, R.shY, R.shY + (ow(R) ? 2 : 7), (y) => (ow(R) ? 4 : R.tw[1] - 1 - (y - R.shY) * 0.3), 'trim', 2);
        if (!ow(R)) band(P, R, R.shY + 5, R.shY + 5, R.tw[1] - 3, 'top', 2);
      } else { P.run(R.shY, rnd(R.cx), rnd(R.cx + 3), 'trim', 2); P.run(R.shY + 1, rnd(R.cx + 1), rnd(R.cx + 3), 'trim', 2); }
    },
  };

  for (const k of Object.keys(OUT)) { const o = OUT[k]; o.sleeve = o.sleeve || o.body; }

  /** Bottom garment pieces drawn over the legs (skirts). */
  BD.bottom = function (P, R) {
    const b = R.S.bottom.type;
    if (b !== 'skirt' && b !== 'longskirt') return;
    const y0 = R.hipY - R.g.hipRows + 1;
    const y1 = b === 'skirt' ? Math.min(ankleY(R) - 1, y0 + (ow(R) ? 3 : 11)) : ankleY(R) - (ow(R) ? 1 : 2);
    skirt(P, R, 'bot', y0, y1, ow(R) ? (b === 'skirt' ? 1.5 : 2) : b === 'skirt' ? 6 : 7, { pleats: !ow(R) });
  };

  // ---------------------------------------------------------------------------------------------------------------
  // Body accessories. phase: 'back' (behind the body) | 'body' (over the outfit) | 'hand' (after the arms)
  // ---------------------------------------------------------------------------------------------------------------
  const reg = (name, fn) => { ACC[name] = fn; if (!L.ACCS.includes(name)) L.ACCS.push(name); };
  const mc = (P, a, d) => P.m(a.color !== undefined ? a.color : L.col(d));
  const handPos = (R, s) => { // screen side s -> {x, y} of the hand centre (approx.)
    const sh = Math.max(...R.tw.slice(1, 4));
    if (R.t === 'ow') return { x: s < 0 ? R.L(sh) - 1 : R.Rt(sh) + 1, y: R.shY + R.torso - 1 };
    return { x: s < 0 ? R.L(sh) - 2 : R.Rt(sh) + 2, y: R.hipY + 3 };
  };

  reg('belt', (P, R, a, ph) => {
    if (ph !== 'body' || R.S.outfit.type === 'labcoat' || R.S.outfit.type === 'coat') return;
    const m = mc(P, a, '#7c4e30'), y = R.hipY - R.g.hipRows + (R.t === 'ow' ? 1 : 1);
    P.begin('belt');
    for (let k = 0; k < (R.t === 'ow' ? 1 : 2); k++) {
      const yy = y + k, hw = R.tw[Math.min(R.tw.length - 1, yy - R.shY)];
      if (R.view === 'left') P.run(yy, rnd(R.cx - 3), rnd(R.cx + 2), m, 2); else P.run(yy, R.L(hw), R.Rt(hw), m, 2);
    }
    if (R.view === 'down') { const g = P.m('#e8c870'); P.px(rnd(R.cx - 0.5), y, g, 3); if (R.t === 'tr') { P.px(rnd(R.cx + 0.5), y, g, 2); P.px(rnd(R.cx - 0.5), y + 1, g, 2); P.px(rnd(R.cx + 0.5), y + 1, g, 1); } }
  });

  reg('spools', (P, R, a, ph) => {
    if (ph !== 'body' || R.view !== 'down') return;
    const y = R.hipY - R.g.hipRows + 1;
    P.begin('spools');
    const cols = ['#d8363a', '#f2cc40', '#3e6ad0'];
    if (R.t === 'ow') { P.px(R.L(R.tw[y - R.shY]) + 1, y, P.m(cols[0]), 2); return; }
    cols.forEach((c, i) => { const x = R.L(R.tw[y - R.shY]) + 1 + i * 3; P.run(y - 1, x, x + 1, P.m('#c89a64'), 3); P.run(y, x, x + 1, P.m(c), 2); P.run(y + 1, x, x + 1, P.m(c), 1); P.run(y + 2, x, x + 1, P.m('#c89a64'), 1); });
  });

  reg('satchel', (P, R, a, ph) => {
    const m = mc(P, a, '#a0642e');
    const s = R.view === 'up' ? -1 : 1; // bag hangs on the character's left hip
    if (R.view === 'left') { if (ph === 'body') { P.begin('satchel'); const y = R.hipY - (R.t === 'ow' ? 2 : 4); P.run(y, rnd(R.cx), rnd(R.cx + 3), m, 2); P.run(y + 1, rnd(R.cx), rnd(R.cx + 3), m, 1); } return; }
    if (ph !== 'body') return;
    P.begin('satchel:strap');
    const sh = R.tw[1];
    const x0 = s > 0 ? R.L(sh) + 1 : R.Rt(sh) - 1, y0 = R.shY;
    const bx = s > 0 ? R.Rt(R.tw[R.tw.length - 1]) + (R.t === 'ow' ? 1 : 2) : R.L(R.tw[R.tw.length - 1]) - (R.t === 'ow' ? 1 : 2), by = R.hipY - (R.t === 'ow' ? 1 : 3);
    P.line(x0, y0, bx - s * (R.t === 'ow' ? 1 : 2), by - (R.t === 'ow' ? 1 : 3), m, 1);
    if (R.t === 'tr') P.line(x0 + s, y0, bx - s * 1, by - 3, m, 2);
    P.begin('satchel');
    const w = R.t === 'ow' ? 2 : 5, h = R.t === 'ow' ? 2 : 6;
    for (let y = by - h + 1; y <= by; y++) P.run(y, s > 0 ? bx - w + 1 : bx, s > 0 ? bx : bx + w - 1, m, y === by - h + 1 ? 3 : 2);
    if (R.t === 'tr') { P.run(by - h + 2, s > 0 ? bx - w + 1 : bx, s > 0 ? bx : bx + w - 1, m, 1); P.px(s > 0 ? bx - 2 : bx + 2, by - h + 3, P.m('#e8c870'), 3); }
  });

  reg('bag', (P, R, a, ph) => {
    if (ph !== 'hand' || R.view === 'left') return;
    const m = mc(P, a, '#7c4e30'), hp = handPos(R, 1);
    P.begin('bag');
    const w = R.t === 'ow' ? 3 : 7, h = R.t === 'ow' ? 3 : 7;
    for (let y = hp.y + 1; y < hp.y + 1 + h; y++) P.run(y, hp.x - (R.t === 'ow' ? 1 : 3), hp.x - (R.t === 'ow' ? 1 : 3) + w - 1, m, 2);
  });

  reg('backpack', (P, R, a, ph) => {
    const m = mc(P, a, '#d8363a');
    const ow = R.t === 'ow';
    if (R.view === 'down') {
      if (ph === 'back') { P.begin('backpack'); band(P, R, R.shY - (ow ? 1 : 2), R.shY + (ow ? 3 : 8), R.tw[1] + (ow ? 1 : 2), m, 1); }
      if (ph === 'body') { P.begin('backpack:straps'); for (let y = R.shY; y <= R.shY + (ow ? 3 : 9); y++) { P.px(R.L(R.tw[1]) + (ow ? 1 : 2), y, m, 2); P.px(R.Rt(R.tw[1]) - (ow ? 1 : 2), y, m, 1); if (!ow) { P.px(R.L(R.tw[1]) + 3, y, m, 2); P.px(R.Rt(R.tw[1]) - 3, y, m, 1); } } }
      return;
    }
    if (ph !== 'body') return;
    P.begin('backpack');
    if (R.view === 'up') {
      const w = R.tw[1] - (ow ? 1 : 1), y0 = R.shY + (ow ? 0 : 1), y1 = R.hipY - (ow ? 1 : 3);
      band(P, R, y0, y1, (y) => (y === y0 ? w - 1 : w), m, 2);
      P.begin('backpack:flap'); band(P, R, y0, y0 + (ow ? 1 : 4), (y) => w - (y === y0 ? 1 : 0), m, 3);
      if (!ow) { P.begin('backpack:pocket'); band(P, R, y1 - 5, y1 - 1, w - 3, m, 1); }
    } else {
      const x1 = rnd(R.cx + (ow ? 3 : 6)), y0 = R.shY, y1 = R.hipY - (ow ? 1 : 3);
      for (let y = y0; y <= y1; y++) P.run(y, x1 - (ow ? 1 : 2), x1 + (ow ? 2 : 4), m, 2);
    }
  });

  reg('scarf', (P, R, a, ph) => {
    if (ph !== 'body') return;
    const m = mc(P, a, '#f6f4f0'), ow = R.t === 'ow';
    P.begin('scarf');
    if (R.view === 'left') { P.run(R.shY, rnd(R.cx - 3), rnd(R.cx + 2), m, 2); P.px(rnd(R.cx + 2), R.shY + 1, m, 1); P.px(rnd(R.cx + 3), R.shY + 2, m, 1); return; }
    if (ow && R.view === 'down') {
      // overworld front: a knot just under the chin (the shoulder row is hidden by it) with a short tail over one lapel
      P.run(R.shY + 1, rnd(R.cx - 2), rnd(R.cx + 2) - 1, m, 2); P.px(rnd(R.cx), R.shY + 1, m, 1);
      P.px(rnd(R.cx - 1), R.shY + 2, m, 2); P.px(rnd(R.cx - 1), R.shY + 3, m, 1);
      return;
    }
    band(P, R, R.shY - (ow ? 0 : 1), R.shY + (ow ? 0 : 2), (y) => (ow ? 3 : 6 - (y - R.shY + 1) * 0.5), m, 2);
    const s = R.view === 'up' ? -1 : 1;
    const x = rnd(R.cx + s * (ow ? 2 : 4)) - (s < 0 ? 1 : 0);
    for (let y = R.shY + 1; y <= R.shY + (ow ? 3 : 9); y++) { P.px(x, y, m, 2); if (!ow) P.px(x + 1, y, m, 1); }
  });

  reg('tape', (P, R, a, ph) => {
    if (ph !== 'body') return;
    const m = P.m('#f2d84a'), ow = R.t === 'ow';
    P.begin('tape');
    if (R.view === 'left') { P.run(R.shY, rnd(R.cx - 3), rnd(R.cx + 2), m, 2); for (let y = R.shY; y < R.shY + 4; y++) P.px(rnd(R.cx - 3), y, m, 2); return; }
    if (R.view === 'up') { band(P, R, R.shY, R.shY, ow ? 3 : 6, m, 2); return; }
    const w = ow ? 2.5 : 5;
    P.run(R.shY, R.L(w + 1), R.Rt(w + 1), m, 2);
    const n = ow ? 4 : 12;
    for (let y = R.shY + 1; y <= R.shY + n; y++) {
      for (const x of [R.L(w), R.Rt(w)]) { P.px(x, y, m, 2); if (!ow) P.px(x + (x < R.cx ? 1 : -1), y, m, 2); }
      if (!ow && (y - R.shY) % 3 === 0) { P.px(R.L(w), y, m, 0); P.px(R.Rt(w), y, m, 0); }
    }
  });

  reg('brooch', (P, R, a, ph) => {
    if (ph !== 'body' || R.view !== 'down') return;
    const m = mc(P, a, '#c8d0e8');
    P.begin('brooch');
    if (R.t === 'ow') { P.px(rnd(R.cx - 0.5), R.shY + 1, m, 3); return; }
    P.ellipse(R.cx, R.shY + 4, 1.6, 1.6, m, 2); P.px(rnd(R.cx - 0.5), R.shY + 4, P.m('#e8483a'), 2);
  });
  reg('badge', (P, R, a, ph) => {
    if (ph !== 'body' || R.view !== 'down') return;
    const m = mc(P, a, '#f2cc40');
    P.begin('badge');
    if (R.t === 'ow') { P.px(R.Rt(R.tw[2]) - 1, R.shY + 2, m, 3); return; }
    const x = R.Rt(R.tw[3]) - 4; P.run(R.shY + 5, x, x + 2, m, 3); P.run(R.shY + 6, x, x + 2, m, 1);
  });

  reg('sash', (P, R, a, ph) => {
    if (ph !== 'body' || R.view === 'left') return;
    const m = mc(P, a, '#d8363a');
    P.begin('sash');
    const s = R.view === 'up' ? -1 : 1, ow = R.t === 'ow';
    const y0 = R.shY, y1 = R.hipY - R.g.hipRows;
    for (let y = y0; y <= y1; y++) {
      const t = (y - y0) / (y1 - y0), hw = R.tw[y - R.shY];
      const x = rnd(R.cx - s * hw + s * t * hw * 2) - (s > 0 ? 0 : 1);
      for (let k = 0; k < (ow ? 2 : 3); k++) P.px(x + s * k - (s > 0 ? 0 : 0), y, m, k === 0 ? 3 : 2);
    }
  });

  reg('necktie', (P, R, a, ph) => {
    if (ph !== 'body' || R.view !== 'down') return;
    const m = mc(P, a, '#f2cc40');
    P.begin('necktie');
    const n = R.t === 'ow' ? 3 : 10;
    for (let y = R.shY; y < R.shY + n; y++) { P.px(rnd(R.cx - 0.5), y, m, 2); if (R.t === 'tr' && y > R.shY + 1) P.px(rnd(R.cx + 0.5), y, m, 1); }
  });

  reg('cane', (P, R, a, ph) => {
    if (ph !== 'hand') return;
    const m = mc(P, a, '#7c4e30');
    P.begin('cane');
    if (R.view === 'left') { const x = rnd(R.cx - 3); for (let y = R.hipY - 1; y <= R.foot; y++) P.px(x, y, m, 2); return; }
    const s = R.view === 'up' ? -1 : 1, hp = handPos(R, s);
    for (let y = hp.y - (R.t === 'ow' ? 1 : 2); y <= R.foot; y++) { P.px(hp.x, y, m, 2); if (R.t === 'tr') P.px(hp.x + 1, y, m, 1); }
    P.px(hp.x - s, hp.y - (R.t === 'ow' ? 1 : 2), m, 3);
  });

  reg('fishingrod', (P, R, a, ph) => {
    if (ph !== 'hand') return;
    const m = mc(P, a, '#a0642e');
    P.begin('rod');
    if (R.view === 'left') { P.line(rnd(R.cx - 1), R.hipY - 1, rnd(R.cx - 5), Math.max(1, R.shY - 8), m, 2); return; }
    const s = R.view === 'up' ? -1 : 1, hp = handPos(R, s);
    const tx = hp.x + s * (R.t === 'ow' ? 4 : 10), ty = R.t === 'ow' ? Math.max(1, R.hy - 4) : Math.max(3, R.hy - 8);
    P.line(hp.x, hp.y + 1, tx, ty, m, 2);
    if (R.t === 'tr') { P.line(hp.x + s, hp.y + 1, tx + s, ty, m, 1); P.run(hp.y - 3, hp.x - 1, hp.x + 2, P.m('#9a9aa8'), 2); }
    // line hanging from the tip
    const ln = P.m('#e8ecf4');
    for (let y = ty + 1; y <= ty + (R.t === 'ow' ? 5 : 14); y++) P.px(tx + s, y, ln, 3);
  });

  reg('pince', (P, R, a, ph) => {
    if (ph !== 'body' || R.t === 'ow') return;
    const m = mc(P, a, '#8a9ac8');
    P.begin('stripes');
    for (let x = 0; x < R.W; x += 3) for (let y = R.shY + 1; y < R.H; y++) if (P.matAt(x, y) === P.names.top && (P.getRaw(x, y) & 3) >= 2) P.px(x, y, m, 1);
  });
  reg('whiskers', () => {});
  reg('easel', () => {});

  BD.band = band;
  BD.vee = vee;
})(typeof globalThis !== 'undefined' ? globalThis : window);
