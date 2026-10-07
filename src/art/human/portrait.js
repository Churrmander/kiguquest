/* src/art/human/portrait.js — 64×64 front / back portrait renderer (trainer battle sprite, dialogue portrait).
 *
 * Chibi proportions like the Kigu: head + hair is ~half the height, big eyes with highlights, tiny mouth, blush.
 * Feet stand on row 61 (anchor bottom-centre ≈ (32, 62)). The figure is built back-to-front on a Paper
 * (hair-back, legs/shoes, bottom, torso+outfit, neck, body accessories, head, face, hair-front, head accessories).
 */
(function (root) {
  'use strict';
  const NP = (root.NP = root.NP || {});
  const HUM = NP.art.human;
  const L = HUM._;
  const PT = (L.portrait = L.portrait || {});
  const W = 64;

  // build -> visible leg length, torso length, torso half-width
  const GEO = {
    child: { leg: 7, torso: 10, sw: 6 },
    teen: { leg: 9, torso: 12, sw: 8 },
    adult: { leg: 10, torso: 12, sw: 9 },
    tall: { leg: 10, torso: 13, sw: 9 },
    elder: { leg: 8, torso: 12, sw: 8 },
    stout: { leg: 8, torso: 13, sw: 11 },
  };

  const mx = (x) => 63 - x;
  /** paint a pixel and its mirror */
  function sym(P, x, y, mat, tone) { P.px(x, y, mat, tone); P.px(mx(x), y, mat, tone); }
  function rowSpan(P, y, x0, x1, mat, tone) { for (let x = x0; x <= x1; x++) P.px(x, y, mat, typeof tone === 'function' ? tone(x, y) : tone); }
  /** filled vertical band [y0..y1] with per-row half-width hw(y) about the centre (31.5) */
  function band(P, y0, y1, hw, mat, tone) {
    for (let y = y0; y <= y1; y++) { const h = hw(y); for (let x = 32 - h; x <= 31 + h; x++) P.px(x, y, mat, typeof tone === 'function' ? tone(x, y) : tone); }
  }
  const lightR = (x) => (x >= 38 ? 1 : x <= 25 ? 3 : 2);

  function ctx(P, S, view) {
    const g = GEO[S.build];
    const legTop = 59 - g.leg;
    const tT = legTop - g.torso;
    return { P, S, view, front: view === 'front', g, sw: g.sw, legTop, tT, tB: tT + g.torso, cy: tT - 10, big: S.build === 'stout' };
  }

  // ---------------------------------------------------------------------------------------------------------------
  // Legs, shoes, bottoms
  // ---------------------------------------------------------------------------------------------------------------
  function legsAndShoes(c) {
    const { P, S, legTop } = c;
    const b = S.bottom.type;
    const lower = S.legs ? 'legs' : 'skin';
    P.begin('legs');
    for (const x0 of [26, 33]) {
      for (let y = legTop; y <= 58; y++) {
        let mat = lower;
        if (b === 'pants' || b === 'overall') mat = 'bot';
        else if (b === 'shorts' && y < legTop + 5) mat = 'bot';
        for (let k = 0; k < 5; k++) P.px(x0 + k, y, mat, k === 4 ? 1 : k === 0 ? 3 : 2);
      }
    }
    // tuck line between the legs
    P.begin('shoes');
    for (const x0 of [24, 33]) {
      for (let y = 59; y <= 61; y++) {
        const w = y === 59 ? 6 : 7;
        for (let k = 0; k < w; k++) {
          const xx = x0 === 24 ? 24 + k + (y === 59 ? 1 : 0) : 33 + k;
          P.px(xx, y, 'shoe', y === 61 ? 1 : k === 1 && y === 60 ? 3 : 2);
        }
      }
    }
    P.px(31, 61, 'shoe', 1); P.px(32, 61, 'shoe', 1);
  }

  function bottom(c) {
    const { P, S, tB, legTop, sw } = c;
    const b = S.bottom.type;
    if (b === 'skirt' || b === 'longskirt') {
      const len = b === 'skirt' ? 7 : Math.min(56 - (tB - 3), 17);
      P.begin('skirt');
      for (let r = 0; r <= len; r++) {
        const y = tB - 3 + r;
        const hw = sw + 1 + Math.floor((r * (b === 'skirt' ? 5 : 7)) / Math.max(1, len));
        for (let x = 32 - hw; x <= 31 + hw; x++) {
          const fold = (x + 2) % 4 === 0 && r > 1;
          P.px(x, y, 'bot', fold ? 1 : x >= 32 + hw - 3 ? 1 : x <= 32 - hw + 1 ? 3 : 2);
        }
      }
      const y = tB - 3 + len;
      for (let x = 32 - sw - 6; x <= 31 + sw + 6; x++) if (P.getRaw(x, y) >= 0) P.px(x, y, 'bot', 1);
    }
  }

  // ---------------------------------------------------------------------------------------------------------------
  // Torso / arms / neck
  // ---------------------------------------------------------------------------------------------------------------
  /**
   * body: material of the torso; o.sleeve: sleeve material; o.sleeveLen: px of sleeve (default all),
   * o.cuff: material for the last 2 sleeve rows; o.hem: extra rows under the torso.
   */
  function torso(c, body, o) {
    o = o || {};
    const { P, sw, tT, tB } = c;
    const tl = tB - tT;
    const id = P.begin('torso');
    const hem = o.hem || 0;
    for (let y = tT; y < tB + hem; y++) {
      const r = y - tT;
      let hw = sw - (r === 0 ? 2 : r === 1 ? 1 : 0);
      if (y >= tB - 1 && !hem) hw = sw - 1;
      if (o.flare && y >= tB) hw = sw + Math.floor((y - tB + 1) * o.flare);
      for (let x = 32 - hw; x <= 31 + hw; x++) P.px(x, y, body, x >= 31 + hw - 2 ? 1 : x <= 32 - hw + 1 && r > 1 ? 3 : 2);
    }
    c.torsoId = id;
    // arms
    const sleeve = o.sleeve || body;
    const slen = o.sleeveLen === undefined ? 99 : o.sleeveLen;
    const armLen = tl - 3;
    for (const side of [-1, 1]) {
      const aid = P.begin(side < 0 ? 'armL' : 'armR');
      const ax = side < 0 ? 32 - sw - 4 : 32 + sw; // left column
      for (let r = 0; r < armLen; r++) {
        const y = tT + 1 + r;
        const isSleeve = r < slen;
        const cuff = isSleeve && o.cuff && (r >= slen - 2 || r >= armLen - 2);
        const mat = cuff ? o.cuff : isSleeve ? sleeve : 'skin';
        const inset = r === 0 ? 1 : 0;
        for (let k = inset; k < 4 - (r === 0 ? 0 : 0); k++) {
          const xx = ax + (side < 0 ? k : k - inset);
          P.px(xx, y, mat, side > 0 ? (k >= 2 ? 1 : 2) : (k === 0 ? 3 : 2));
        }
      }
      // hand
      const hy = tT + 1 + armLen;
      for (let r = 0; r < 3; r++) for (let k = r === 2 ? 1 : 0; k < (r === 2 ? 3 : 4); k++) P.px(ax + k, hy + r, o.hand || 'skin', side > 0 && k >= 2 ? 1 : 2);
      P.px(ax + (side < 0 ? 1 : 2), hy + 1, o.hand || 'skin', 3);
      c['arm' + (side < 0 ? 'L' : 'R')] = aid;
    }
    // neck
    P.begin('neck');
    return { tl, armLen };
  }
  function armLines(c) {
    const { P } = c;
    P.edgeLine(c.armL, { against: [c.torsoId], sides: 'r' });
    P.edgeLine(c.armR, { against: [c.torsoId], sides: 'l' });
  }
  function neck(c, open) {
    const { P, tT } = c;
    P.begin('neck');
    for (let y = tT - 2; y <= tT + 1; y++) for (let x = 30; x <= 33; x++) P.px(x, y, 'skin', x >= 32 ? 1 : 2);
    if (open) { for (let x = 29; x <= 34; x++) P.px(x, tT + 1, 'skin', 1); P.px(30, tT + 2, 'skin', 1); P.px(31, tT + 2, 'skin', 1); P.px(32, tT + 2, 'skin', 1); P.px(33, tT + 2, 'skin', 1); }
  }

  // ---------------------------------------------------------------------------------------------------------------
  // Outfits
  // ---------------------------------------------------------------------------------------------------------------
  const OUT = (PT.OUT = {});
  const line = (P, x, y) => P.px(x, y, 0);

  OUT.tee = (c) => {
    const { P, tT, tB } = c;
    torso(c, 'top', { sleeveLen: 6 });
    armLines(c);
    neck(c, true);
    if (c.front) { P.begin('collar'); for (let x = 29; x <= 34; x++) P.px(x, tT, 'top', 3); }
  };

  OUT.jacket = (c) => {
    const { P, sw, tT, tB } = c;
    torso(c, 'top', { cuff: 'trim' });
    if (c.front) {
      P.begin('shirt');
      for (let y = tT; y < tB; y++) { const hw = y < tT + 3 ? 3 : 2; for (let x = 32 - hw; x <= 31 + hw; x++) P.px(x, y, 'under', x >= 31 + hw ? 1 : 2); }
      P.begin('zip'); for (let y = tT + 3; y < tB; y++) P.px(31, y, 'trim', 3);
      // lapels / collar
      P.begin('collar');
      for (let k = 0; k < 4; k++) { P.px(27 + k, tT + k, 'top', 3); P.px(36 - k, tT + k, 'top', 2); P.px(28 + k, tT + k, 'top', 3); P.px(35 - k, tT + k, 'top', 2); }
      P.begin('hemtrim'); for (let x = 32 - sw + 1; x <= 30 + sw; x++) { P.px(x, tB - 1, 'trim', x > 34 ? 1 : 2); P.px(x, tB - 2, 'trim', x > 34 ? 1 : 2); }
      for (const y of [tT + 6]) { P.px(32 - sw + 1, y, 'trim', 2); }
      // edge lines either side of the open front
      P.edgeLine(P.cur, { sides: 'lr' });
    } else {
      P.begin('collar'); for (let x = 27; x <= 36; x++) P.px(x, tT, 'trim', 2);
      P.begin('hemtrim'); for (let x = 32 - sw + 1; x <= 30 + sw; x++) { P.px(x, tB - 1, 'trim', x > 34 ? 1 : 2); P.px(x, tB - 2, 'trim', x > 34 ? 1 : 2); }
    }
    armLines(c);
    neck(c);
  };

  OUT.hoodie = (c) => {
    const { P, tT, tB, sw } = c;
    // hood behind the neck
    P.begin('hood');
    P.ellipse(31.5, tT, 10, 4, 'top', 1);
    torso(c, 'top', { cuff: 'top' });
    armLines(c);
    neck(c, c.front);
    P.begin('hood2');
    if (c.front) {
      for (let k = 0; k < 5; k++) { P.px(27 + k, tT - 1 + (k > 2 ? 4 - k : k) * 0, 'top', 3); }
      for (let x = 26; x <= 37; x++) P.px(x, tT, 'top', x > 33 ? 1 : 3);
      for (let y = tT + 2; y <= tT + 7; y++) { P.px(29, y, 'trim', 2); P.px(34, y, 'trim', 1); }
      P.px(29, tT + 8, 'trim', 1); P.px(34, tT + 8, 'trim', 1);
      P.begin('pocket'); rowSpan(P, tB - 5, 26, 37, 'top', 1); for (let y = tB - 4; y < tB - 1; y++) { P.px(26, y, 'top', 1); P.px(37, y, 'top', 1); }
    } else { for (let x = 26; x <= 37; x++) P.px(x, tT + 1, 'top', 3); ; for (let x = 28; x <= 35; x++) P.px(x, tT + 2, 'top', 1); }
  };

  OUT.vest = (c) => {
    const { P, tT, tB, sw } = c;
    torso(c, 'under', { sleeve: 'under', cuff: 'under' });
    armLines(c);
    neck(c, true);
    P.begin('vest');
    for (let y = tT; y < tB; y++) {
      const a = y < tT + 2 ? 1 : 0;
      for (let x = 32 - sw + a; x <= 29; x++) P.px(x, y, 'top', x <= 33 - sw + 1 ? 3 : 2);
      for (let x = 34; x <= 31 + sw - a; x++) P.px(x, y, 'top', x >= 30 + sw - 1 ? 1 : 2);
    }
    if (c.front) {
      P.edgeLine(P.cur, { sides: 'lr' });
      for (const y of [tT + 4, tT + 8]) { P.px(33, y, 'trim', 2); }
      P.begin('vcol'); for (let k = 0; k < 4; k++) { P.px(28 + k, tT + k, 'top', 3); P.px(35 - k, tT + k, 'top', 2); }
    }
  };

  function skirtOn(c, mat, y0, len, grow, o) {
    const { P, sw } = c;
    P.begin('skirt');
    for (let r = 0; r <= len; r++) {
      const y = y0 + r;
      if (y > 58) break;
      const hw = sw + 1 + Math.floor((r * grow) / Math.max(1, len));
      for (let x = 32 - hw; x <= 31 + hw; x++) P.px(x, y, mat, (x + 1) % 5 === 0 && r > 2 ? 1 : x >= 31 + hw - 2 ? 1 : x <= 32 - hw + 1 ? 3 : 2);
    }
    const last = Math.min(58, y0 + len);
    for (let x = 32 - sw - 1 - grow; x <= 31 + sw + 1 + grow; x++) if (P.getRaw(x, last) >= 0) P.px(x, last, (o && o.trimHem) || mat, o && o.trimHem ? 2 : 1);
  }

  OUT.dress = (c) => {
    const { P, tT, tB, sw } = c;
    torso(c, 'top', { sleeveLen: 6 });
    skirtOn(c, 'top', tB - 2, 10, 5);
    armLines(c);
    neck(c, true);
    P.begin('waist'); for (let x = 32 - sw + 1; x <= 30 + sw; x++) P.px(x, tB - 2, 'trim', x > 34 ? 1 : 2);
    if (c.front) { P.begin('collar'); for (let x = 28; x <= 35; x++) P.px(x, tT, 'trim', 2); P.px(29, tT + 1, 'trim', 2); P.px(34, tT + 1, 'trim', 1); P.px(31, tT + 1, 'trim', 2); P.px(32, tT + 1, 'trim', 2); }
  };

  OUT.gown = (c) => {
    const { P, tT, tB, sw } = c;
    torso(c, 'top', { sleeveLen: 7, cuff: 'trim' });
    skirtOn(c, 'top', tB - 2, 59 - (tB - 2), 7, { trimHem: 'trim' });
    armLines(c);
    neck(c, true);
    P.begin('waist'); for (let x = 32 - sw + 1; x <= 30 + sw; x++) { P.px(x, tB - 2, 'trim', x > 34 ? 1 : 2); P.px(x, tB - 3, 'top', 3); }
    if (c.front) { P.begin('collar'); for (let x = 27; x <= 36; x++) P.px(x, tT, 'trim', 2); for (let k = 0; k < 4; k++) { P.px(28 + k, tT + 1 + k, 'trim', 2); P.px(35 - k, tT + 1 + k, 'trim', 1); } }
  };

  OUT.apron = (c) => {
    const { P, tT, tB, sw } = c;
    torso(c, 'under', { sleeveLen: 6 });
    armLines(c);
    neck(c, true);
    P.begin('apron');
    if (c.front) {
      for (let y = tT + 2; y < tB - 1; y++) for (let x = 26; x <= 37; x++) P.px(x, y, 'top', x >= 36 ? 1 : x <= 27 ? 3 : 2);
      // straps
      for (let y = tT; y <= tT + 2; y++) { P.px(27, y, 'top', 3); P.px(28, y, 'top', 2); P.px(35, y, 'top', 2); P.px(36, y, 'top', 1); }
      skirtOn(c, 'top', tB - 2, Math.min(10, 58 - tB), 3);
      P.begin('pocket');
      const py = tB + 1; for (let x = 27; x <= 36; x++) { P.px(x, py, 'trim', 2); P.px(x, py + 4, 'trim', 1); } for (let y = py + 1; y < py + 4; y++) { P.px(27, y, 'trim', 2); P.px(36, y, 'trim', 1); P.px(31, y, 'trim', 1); }
      P.begin('bibtrim'); for (let x = 27; x <= 36; x++) P.px(x, tT + 2, 'trim', 2);
    } else {
      for (let y = tB - 4; y <= tB - 3; y++) for (let x = 32 - sw; x <= 31 + sw; x++) P.px(x, y, 'top', 2);
      P.px(31, tB - 2, 'top', 1); P.px(32, tB - 2, 'top', 1); P.px(30, tB - 1, 'top', 1); P.px(33, tB - 1, 'top', 1);
      for (let x = 26; x <= 37; x++) P.px(x, tT + 1, 'top', 1);
    }
  };

  function longCoat(c, body, len, o) {
    const { P, tT, tB, sw } = c;
    o = o || {};
    torso(c, body, { hem: len, flare: 0.25, cuff: o.cuff, sleeveLen: 99 });
    armLines(c);
    neck(c, true);
    const endY = tB + len - 1;
    P.begin('coatdet');
    if (c.front) {
      // under-shirt wedge + lapels
      P.begin('shirt');
      for (let y = tT; y < tT + 6; y++) { const hw = 3 - Math.floor((y - tT) / 2); for (let x = 32 - hw; x <= 31 + hw; x++) P.px(x, y, 'under', x >= 31 + hw ? 1 : 2); }
      P.begin('opening'); for (let y = tT + 6; y <= endY; y++) { P.px(31, y, body, 1); P.px(32, y, body, 1); }
      P.begin('lapel');
      for (let k = 0; k < 6; k++) { P.px(27 + k, tT + k, body, 3); P.px(28 + k, tT + k, body, 3); P.px(36 - k, tT + k, body, 2); P.px(35 - k, tT + k, body, 2); }
      for (const y of [tT + 7, tT + 10]) { P.px(30, y, o.button || 'trim', 3); P.px(33, y, o.button || 'trim', 3); }
      P.begin('pockets'); for (const sx of [27, 35]) { for (let x = sx; x < sx + 4; x++) P.px(x, tB + 2, body, 1); for (let y = tB + 3; y < tB + 5; y++) P.px(sx, y, body, 1); }
      P.px(28, tT + 3, o.button || 'trim', 3);
      if (o.trimHem) { P.begin('hemtrim'); for (let x = 20; x <= 43; x++) if (P.getRaw(x, endY) >= 0) P.px(x, endY, 'trim', 2); }
      if (o.collar) { P.begin('coll'); for (let x = 26; x <= 37; x++) P.px(x, tT, o.collar, 2); for (let k = 0; k < 3; k++) { P.px(27 + k, tT + 1 + k, o.collar, 2); P.px(36 - k, tT + 1 + k, o.collar, 1); } }
    } else {
      for (let y = tB + 1; y <= endY; y++) P.px(31, y, body, 1);
      if (o.trimHem) { P.begin('hemtrim'); for (let x = 20; x <= 43; x++) if (P.getRaw(x, endY) >= 0) P.px(x, endY, 'trim', 2); }
      P.begin('coll'); for (let x = 26; x <= 37; x++) P.px(x, tT, o.collar || body, 3);
    }
    for (let x = 18; x <= 45; x++) if (P.getRaw(x, endY) >= 0 && !o.trimHem) P.px(x, endY, body, 1);
  };
  OUT.labcoat = (c) => longCoat(c, 'top', Math.min(14, 57 - c.tB), { cuff: null });
  OUT.coat = (c) => longCoat(c, 'top', Math.min(11, 57 - c.tB), { trimHem: true, collar: 'trim', cuff: 'trim' });

  OUT.robe = (c) => {
    const { P, tT, tB, sw } = c;
    const len = 58 - tB;
    torso(c, 'top', { hem: len, flare: 0.35, cuff: 'trim' });
    armLines(c);
    neck(c, true);
    P.begin('robedet');
    if (c.front) {
      for (let y = tT; y <= tT + len + (tB - tT) - 1; y++) { P.px(31, y, 'trim', 2); P.px(32, y, 'trim', 1); }
      for (let k = 0; k < 4; k++) { P.px(28 + k, tT + k, 'trim', 2); P.px(35 - k, tT + k, 'trim', 1); }
    }
    for (let x = 32 - sw; x <= 31 + sw; x++) { P.px(x, tB - 2, 'trim', x > 34 ? 1 : 2); P.px(x, tB - 1, 'trim', x > 34 ? 1 : 2); }
    for (let x = 14; x <= 49; x++) if (P.getRaw(x, 58) >= 0) P.px(x, 58, 'trim', 2);
  };

  OUT.maid = (c) => {
    const { P, tT, tB, sw } = c;
    torso(c, 'top', { sleeveLen: 5 });
    skirtOn(c, 'top', tB - 2, 11, 5);
    armLines(c);
    neck(c, true);
    P.begin('sleevefrill'); for (const sx of [32 - sw - 4, 32 + sw]) for (let k = 0; k < 4; k++) P.px(sx + k, tT + 6, 'trim', 2);
    if (c.front) {
      P.begin('mapron');
      for (let y = tT + 2; y < tB - 1; y++) for (let x = 27; x <= 36; x++) P.px(x, y, 'trim', x >= 35 ? 1 : 2);
      for (let r = 0; r <= 9; r++) { const y = tB - 1 + r; if (y > 57) break; const hw = 5 + Math.floor(r / 2); for (let x = 32 - hw; x <= 31 + hw; x++) P.px(x, y, 'trim', x >= 31 + hw - 1 ? 1 : (r === 9 && x % 2 ? 3 : 2)); }
      P.begin('straps'); for (let y = tT; y < tT + 2; y++) { P.px(27, y, 'trim', 2); P.px(28, y, 'trim', 2); P.px(35, y, 'trim', 2); P.px(36, y, 'trim', 1); }
      P.begin('mbow'); rowSpan(P, tT + 3, 29, 34, 'under', 2); P.px(28, tT + 4, 'under', 2); P.px(35, tT + 4, 'under', 1); P.px(31, tT + 4, 'under', 1); P.px(32, tT + 4, 'under', 1); P.px(30, tT + 5, 'under', 1); P.px(33, tT + 5, 'under', 1);
      P.begin('mcol'); for (let x = 29; x <= 34; x++) P.px(x, tT, 'trim', 2);
    } else {
      P.begin('mbow'); rowSpan(P, tB - 3, 28, 35, 'trim', 2); P.px(30, tB - 2, 'trim', 1); P.px(33, tB - 2, 'trim', 1); P.px(29, tB - 1, 'trim', 1); P.px(34, tB - 1, 'trim', 1);
    }
  };

  OUT.uniform = (c) => {
    const { P, tT, tB, sw } = c;
    torso(c, 'top', { cuff: 'trim' });
    armLines(c);
    neck(c, true);
    P.begin('ucol');
    if (c.front) {
      // stiff starch collar: two tall flaps
      for (let k = 0; k < 5; k++) { for (let x = 26 + k * 0; x <= 29 + 0; x++) if (x - 26 >= k - 0 && x - 26 <= k + 1) P.px(x + 0, tT + k - 1, 'trim', 3); }
      for (let y = tT - 1; y <= tT + 4; y++) { const d = y - (tT - 1); for (let x = 27 + d; x <= 29 + d && x <= 31; x++) P.px(x, y, 'trim', 2); for (let x = 36 - d; x >= 34 - d && x >= 32; x--) P.px(x, y, 'trim', 1); }
      P.begin('ubuttons'); for (let y = tT + 5; y < tB; y += 3) { P.px(31, y, 'trim', 3); P.px(32, y, 'trim', 1); }
      P.begin('ushoulder'); for (const sx of [32 - sw, 31 + sw - 2]) for (let k = 0; k < 3; k++) P.px(sx + k, tT + 1, 'trim', sx > 30 ? 1 : 2);
      P.begin('ubelt'); rowSpan(P, tB - 2, 32 - sw + 1, 30 + sw, 'bot', 1); rowSpan(P, tB - 1, 32 - sw + 1, 30 + sw, 'bot', 1); P.px(31, tB - 2, 'trim', 3); P.px(32, tB - 2, 'trim', 2);
    } else { P.begin('ucol2'); rowSpan(P, tT - 1, 27, 36, 'trim', 2); rowSpan(P, tT, 26, 37, 'trim', 1); P.begin('ubelt'); rowSpan(P, tB - 2, 32 - sw + 1, 30 + sw, 'bot', 1); rowSpan(P, tB - 1, 32 - sw + 1, 30 + sw, 'bot', 1); }
  };

  OUT.cardigan = (c) => {
    const { P, tT, tB, sw } = c;
    torso(c, 'under', { sleeve: 'top', cuff: 'trim' });
    armLines(c);
    neck(c, true);
    P.begin('cardi');
    for (let y = tT; y < tB; y++) {
      for (let x = 32 - sw; x <= 28; x++) P.px(x, y, 'top', x <= 33 - sw ? 3 : 2);
      for (let x = 35; x <= 31 + sw; x++) P.px(x, y, 'top', x >= 30 + sw ? 1 : 2);
    }
    if (c.front) {
      for (let y = tT + 4; y < tB; y += 3) { P.px(29, y, 'trim', 3); P.px(34, y, 'trim', 2); }
      P.edgeLine(P.cur, { sides: 'lr' });
      P.begin('ccol'); for (let k = 0; k < 4; k++) { P.px(28 + k, tT + k, 'top', 3); P.px(35 - k, tT + k, 'top', 2); }
      P.begin('ctrim'); for (let y = tB - 2; y < tB; y++) for (let x = 32 - sw + 1; x <= 30 + sw; x++) P.px(x, y, 'top', 1);
    }
  };

  OUT.overalls = (c) => {
    const { P, tT, tB, sw } = c;
    torso(c, 'under', { sleeve: 'under', cuff: 'under' });
    armLines(c);
    neck(c, true);
    P.begin('bib');
    for (let y = tT + 3; y < tB; y++) for (let x = 26; x <= 37; x++) P.px(x, y, 'bot', x >= 36 ? 1 : x <= 27 ? 3 : 2);
    for (let y = tT; y <= tT + 3; y++) { P.px(27, y, 'bot', 2); P.px(28, y, 'bot', 3); P.px(35, y, 'bot', 2); P.px(36, y, 'bot', 1); }
    if (c.front) { P.px(27, tT + 4, 'trim', 3); P.px(36, tT + 4, 'trim', 2); P.begin('bpocket'); for (let x = 29; x <= 34; x++) { P.px(x, tT + 6, 'bot', 1); P.px(x, tT + 9, 'bot', 1); } for (let y = tT + 7; y <= tT + 8; y++) { P.px(29, y, 'bot', 1); P.px(34, y, 'bot', 1); } }
    P.begin('obelt'); rowSpan(P, tB - 1, 32 - sw + 1, 30 + sw, 'bot', 1);
  };

  OUT.suit = (c) => {
    const { P, tT, tB, sw } = c;
    torso(c, 'top', { cuff: 'under' });
    armLines(c);
    neck(c, true);
    if (c.front) {
      P.begin('shirt'); for (let y = tT; y < tB; y++) { const hw = y < tT + 5 ? 3 - (y > tT + 2 ? 1 : 0) : 1; for (let x = 32 - hw; x <= 31 + hw; x++) P.px(x, y, 'under', x >= 31 + hw ? 1 : 2); }
      P.begin('tie'); for (let y = tT + 1; y < tB - 1; y++) { const w = y < tT + 3 ? 1 : 2; P.px(31, y, 'trim', 2); if (w > 1) P.px(32, y, 'trim', 1); }
      P.begin('lapel'); for (let k = 0; k < 7; k++) { P.px(27 + k, tT + k, 'top', 3); P.px(36 - k, tT + k, 'top', 2); P.px(28 + k, tT + k, 'top', 3); P.px(35 - k, tT + k, 'top', 2); }
      P.begin('open'); for (let y = tT + 8; y < tB; y++) { P.px(30, y, 'top', 1); P.px(33, y, 'top', 1); }
      P.begin('hank'); P.px(35, tT + 4, 'under', 3); P.px(36, tT + 4, 'under', 2);
      P.edgeLine(P.cur, { sides: 'lr' });
    } else { P.begin('scol'); rowSpan(P, tT, 27, 36, 'top', 3); for (let y = tB - 4; y < tB; y++) P.px(31, y, 'top', 1); }
  };

  OUT.sailor = (c) => {
    const { P, tT, tB, sw } = c;
    torso(c, 'top', { sleeveLen: 8, cuff: 'trim' });
    armLines(c);
    neck(c, true);
    P.begin('scollar');
    if (c.front) {
      for (let k = 0; k < 6; k++) { P.px(25 + k, tT + k, 'trim', 2); P.px(26 + k, tT + k, 'trim', 2); P.px(38 - k, tT + k, 'trim', 1); P.px(37 - k, tT + k, 'trim', 1); }
      rowSpan(P, tT, 25, 38, 'trim', 2);
      P.begin('stripe'); for (let k = 0; k < 6; k++) { P.px(27 + k, tT + k, 'top', 1); P.px(36 - k, tT + k, 'top', 1); }
      P.begin('scarf'); for (let k = 0; k < 3; k++) { rowSpan(P, tT + 6 + k, 30 - k, 33 + k, 'under', k === 2 ? 1 : 2); }
      P.px(31, tT + 5, 'under', 2); P.px(32, tT + 5, 'under', 1);
    } else { rowSpan(P, tT, 24, 39, 'trim', 2); for (let y = tT + 1; y <= tT + 7; y++) rowSpan(P, y, 26 + (y - tT) / 2 | 0, 37 - ((y - tT) / 2 | 0), 'trim', y > tT + 5 ? 1 : 2); for (let x = 26; x <= 37; x++) P.px(x, tT + 3, 'top', 1); }
  };

  // ---------------------------------------------------------------------------------------------------------------
  // Head, face
  // ---------------------------------------------------------------------------------------------------------------
  function head(c) {
    const { P, S, cy } = c;
    const skull = P.begin('head');
    P.ellipse(31.5, cy, 13.5, 12, 'skin', 2);
    P.ellipse(31.5, cy + 3.5, 12, 9, 'skin', 2);
    // ears
    if (c.front) { for (const x of [18, 45]) for (let y = cy + 1; y <= cy + 4; y++) P.px(x + (x > 40 ? 0 : -0), y, 'skin', x > 40 ? 1 : 2); }
    // cel shading: right side + under the chin, light forehead
    P.shadePart(skull, { dx: 1, dy: 0, depth: 2, tone: 1 });
    P.shadePart(skull, { dx: 0, dy: 1, depth: 1, tone: 1 });
    c.skullId = skull;
  }

  const EYE_NORMAL = ['LLLLLL', 'EwwEEE', 'EwwpEE', 'EEppEE', 'eEppEe', 'eeeeee', '.eeee.'];
  const EYE_SERIOUS = ['LLLLLL', 'LLLLLL', 'EwwEEE', 'EEppEE', 'eEppEe', '.eeee.'];
  const EYE_SHARP = ['.LLLLL', 'LLLLLL', 'EwwEEE', 'EEppEE', 'eEppEe', '.eeee.'];
  const EYE_WIDE = ['.LLLL.', 'LwwEEL', 'EwwwEE', 'EEppEE', 'EEppEE', 'eEppEe', '.eeee.'];
  const EYE_SLEEPY = ['LLLLLL', 'LLLLLL', 'LLLLLL', 'EEppEE', '.eeee.'];
  const EYE_HAPPY = ['......', '.LLLL.', 'LL..LL'];
  const EYE_CLOSED = ['......', 'LLLLLL'];
  const EYES = { normal: EYE_NORMAL, serious: EYE_SERIOUS, sharp: EYE_SHARP, wide: EYE_WIDE, sleepy: EYE_SLEEPY, happy: EYE_HAPPY, closed: EYE_CLOSED };

  function face(c) {
    const { P, S, cy } = c;
    P.begin('face');
    const pat = EYES[S.face.eyes] || EYE_NORMAL;
    const ey = cy + (S.face.eyes === 'happy' || S.face.eyes === 'closed' ? 2 : 0);
    for (const ex of [22, 36]) {
      for (let r = 0; r < pat.length; r++) {
        for (let k = 0; k < 6; k++) {
          const ch = pat[r][k];
          if (ch === '.') continue;
          const xx = ex + k, y = ey + r;
          if (ch === 'L' || ch === 'p') P.px(xx, y, 0);
          else if (ch === 'w') P.px(xx, y, 'skin', 3);
          else if (ch === 'E') P.px(xx, y, 'eye', r <= 2 ? 1 : 2);
          else if (ch === 'e') P.px(xx, y, 'eye', 3);
        }
      }
      if (S.face.lashes) { const ox = ex === 22 ? ex - 1 : ex + 6; P.px(ox, ey, 0); P.px(ox, ey + 1, 0); P.px(ox, ey - 1, 0); }
    }
    // blush
    if (S.face.blush) for (const bx of [21, 23]) { }
    if (S.face.blush) {
      P.begin('blush');
      for (let k = 0; k < 4; k++) { sym(P, 21 + k, cy + 8, 'skin', 0); if (k > 0 && k < 3) sym(P, 21 + k, cy + 9, 'skin', 0); }
    }
    // nose shadow for older builds
    if (S.build !== 'child' && S.build !== 'teen' && S.sex === 'm') { P.px(31, cy + 6, 'skin', 1); P.px(32, cy + 6, 'skin', 1); }
    if (S.build === 'elder') { P.px(24, cy - 1, 'skin', 1); P.px(39, cy - 1, 'skin', 1); }
    // facial hair
    if (S.facial === 'beard') {
      P.begin('beard');
      for (let y = cy + 7; y <= cy + 14; y++) {
        const hw = y <= cy + 10 ? 11 : y <= cy + 12 ? 9 : y === cy + 13 ? 7 : 4;
        for (let x = 32 - hw; x <= 31 + hw; x++) {
          if (y <= cy + 9 && x >= 26 && x <= 37) continue;
          if (y >= cy + 10 && y <= cy + 10 && x >= 29 && x <= 34) continue;
          P.px(x, y, 'facial', x >= 31 + hw - 2 ? 1 : 2);
        }
      }
      rowSpan(P, cy + 8, 27, 36, 'facial', 2);
    } else if (S.facial === 'mustache') {
      P.begin('must'); rowSpan(P, cy + 8, 27, 36, 'facial', 2); rowSpan(P, cy + 9, 26, 28, 'facial', 1); rowSpan(P, cy + 9, 35, 37, 'facial', 1);
    } else if (S.facial === 'stubble') {
      P.begin('stub'); for (let y = cy + 8; y <= cy + 13; y++) for (let x = 24; x <= 39; x++) if ((x + y) % 3 === 0 && P.matAt(x, y) === P.names.skin) P.px(x, y, 'facial', 1);
    }
    // mouth
    P.begin('mouth');
    const my = cy + 9;
    const m = S.face.mouth;
    if (m === 'smile') { P.px(30, my, 0); P.px(33, my, 0); rowSpan(P, my + 1, 31, 32, 0, 2); }
    else if (m === 'grin') { P.px(29, my, 0); P.px(34, my, 0); rowSpan(P, my + 1, 30, 33, 0, 2); rowSpan(P, my + 2, 31, 32, 'skin', 0); }
    else if (m === 'flat') rowSpan(P, my + 1, 29, 34, 0, 2);
    else if (m === 'o') { P.px(31, my, 0); P.px(32, my, 0); P.px(30, my + 1, 0); P.px(33, my + 1, 0); P.px(31, my + 1, 'skin', 0); P.px(32, my + 1, 'skin', 0); P.px(31, my + 2, 0); P.px(32, my + 2, 0); }
    else if (m === 'smirk') { rowSpan(P, my + 1, 29, 32, 0, 2); P.px(33, my, 0); P.px(34, my - 1, 0); }
    else if (m === 'frown') { P.px(29, my + 2, 0); rowSpan(P, my + 1, 30, 33, 0, 2); P.px(34, my + 2, 0); }
    else if (m === 'cat') { P.px(29, my, 0); P.px(30, my + 1, 0); P.px(31, my, 0); P.px(32, my, 0); P.px(33, my + 1, 0); P.px(34, my, 0); }
    else { P.px(30, my, 0); P.px(33, my, 0); rowSpan(P, my + 1, 31, 32, 0, 2); }
  }

  function brows(c) {
    const { P, S, cy } = c;
    const b = S.face.brows;
    if (b === 'normal' && S.sex === 'f') return;
    P.begin('brows');
    const put = (x, y) => { if (P.matAt(x, y) === P.names.skin || P.matAt(x, y) === -1) { P.px(x, y, 'hair', b === 'normal' ? 1 : 0); } };
    const y0 = cy - 2;
    const set = {
      normal: [[22, 0], [23, 0], [24, 0], [25, -1]],
      stern: [[22, -1], [23, -1], [24, 0], [25, 0], [26, 1]],
      worried: [[21, 1], [22, 0], [23, 0], [24, -1], [25, -1]],
      raised: [[22, -2], [23, -3], [24, -3], [25, -3]],
    }[b] || [[22, 0], [23, 0], [24, 0]];
    for (const [x, dy] of set) { put(x, y0 + dy); put(mx(x), y0 + dy); }
  }

  // ---------------------------------------------------------------------------------------------------------------
  // Hair
  // ---------------------------------------------------------------------------------------------------------------
  // bang: fringe shape; by: fringe base (rel cy), side: sideburn end (rel cy), vol: extra half-width, back: rear hair, top: extras
  const HS = {
    short: { bang: 'jag', by: -3, side: 3, vol: 0 },
    spiky: { bang: 'spike', by: -3, side: 1, vol: 1, top: 'spikes' },
    messy: { bang: 'jag', by: -3, side: 4, vol: 1, top: 'tuft' },
    bob: { bang: 'flat', by: -3, side: 12, vol: 1, back: 'bob' },
    long: { bang: 'part', by: -4, side: 13, vol: 1, back: 'long' },
    ponytail: { bang: 'side', by: -2, side: 3, vol: 0, back: 'pony' },
    pigtails: { bang: 'flat', by: -3, side: 4, vol: 0, back: 'pig' },
    bun: { bang: 'part', by: -4, side: 3, vol: 0, top: 'bun' },
    twinbun: { bang: 'flat', by: -3, side: 6, vol: 1, top: 'twinbun' },
    fluff: { bang: 'jag', by: -3, side: 6, vol: 2, top: 'puff' },
    sidepart: { bang: 'side', by: -2, side: 2, vol: 0 },
    curly: { bang: 'jag', by: -4, side: 9, vol: 3, top: 'puff', back: 'bob' },
    bald: { bald: true },
    cropped: { bang: 'flat', by: -6, side: -1, vol: 0 },
    wavy: { bang: 'part', by: -4, side: 13, vol: 1, back: 'wave' },
  };
  PT.HS = HS;

  function bangY(st, x, cy) {
    const t = x - 31.5;
    switch (st.bang) {
      case 'flat': return cy + st.by + (Math.abs(t) > 9 ? 0 : 0) + ((x % 7 === 0) ? 1 : 0);
      case 'jag': return cy + st.by + [0, 2, 1, 2, 0, 1, 2][x % 7] - 1;
      case 'spike': return cy + st.by + [2, 0, -1, 0, 2][x % 5];
      case 'side': return cy + st.by - 1 - (x - 20) * 0.22 + 2 + (x % 4 === 0 ? 1 : 0);
      case 'part': return cy + st.by - 1 + Math.abs(t) * 0.28 + (x % 5 === 0 ? 1 : 0);
      default: return cy + st.by;
    }
  }

  function hairShape(c, st) {
    // returns predicate for the hair volume ellipse
    const { cy } = c;
    const rx = 14.5 + st.vol, ry = 12.8 + (st.vol ? 0.7 : 0);
    const hc = cy - 2.7;
    return (x, y) => { const dx = (x - 31.5) / rx, dy = (y - hc) / ry; return dx * dx + dy * dy <= 1; };
  }

  function hairBack(c) {
    const { P, S, cy } = c;
    const st = HS[S.hair.style] || HS.short;
    if (st.bald) return;
    P.begin('hairBack');
    const b = st.back;
    if (b === 'bob') P.ellipse(31.5, cy + 4, 16 + st.vol, 12, 'hair', 1);
    if (b === 'long' || b === 'wave') { P.ellipse(31.5, cy + 9, 16.5, 17, 'hair', 1); }
    if (b === 'pony') {
      P.ellipse(31.5, cy - 2, 14, 12, 'hair', 1);
      P.poly([[44, cy - 9], [50, cy - 7], [54, cy + 2], [53, cy + 13], [50, cy + 9], [48, cy + 4], [45, cy - 2]], 'hair', 2);
      P.px(53, cy + 12, 'hair', 0); P.px(52, cy + 10, 'hair', 1);
    }
    if (b === 'pig') {
      for (const s of [-1, 1]) { const x0 = s < 0 ? 12 : 44; P.poly([[x0 + 3, cy - 3], [x0 + 8, cy - 3], [x0 + 9, cy + 6], [x0 + 7, cy + 14], [x0 + 3, cy + 12], [x0 + 1, cy + 5]], 'hair', 2); }
    }
    if (b === 'pony' || b === 'pig') return;
  }
  function hairBackAccent(c) {
    const { P, S, cy } = c;
    const st = HS[S.hair.style] || HS.short;
    const b = st.back;
    if (b === 'pony') { P.begin('tie'); for (let k = 0; k < 3; k++) { P.px(44 + k, cy - 8 + k, 'trim', 2); P.px(45 + k, cy - 8 + k, 'trim', 1); } }
    if (b === 'pig') { P.begin('tie'); for (const x0 of [15, 47]) { rowSpan(P, cy - 3, x0, x0 + 3, 'trim', 2); rowSpan(P, cy - 2, x0, x0 + 3, 'trim', 1); } }
  }

  function hairFront(c) {
    const { P, S, cy, front } = c;
    const st = HS[S.hair.style] || HS.short;
    if (st.bald) return;
    const inside = hairShape(c, st);
    const id = P.begin('hair');
    const top = cy - 16;
    const faceHalf = 11.6;
    for (let y = top - 1; y <= cy + 14; y++) {
      for (let x = 12; x <= 52; x++) {
        if (!inside(x, y) && !(y <= cy + 14 && false)) continue;
        let on;
        if (!front) on = y <= cy + 9 + (st.back ? 2 : 0) - (st.side < 4 ? 3 : 0);
        else {
          const ax = Math.abs(x - 31.5);
          on = y < bangY(st, x, cy) || (ax > faceHalf && y <= cy + st.side + 1);
          // long side locks frame the face
          if (ax > faceHalf - 1.5 && y <= cy + st.side + 1 && st.side >= 9) on = true;
        }
        if (on) P.px(x, y, 'hair', 2);
      }
    }
    // top extras
    const t = st.top;
    if (t === 'spikes') for (const [sx, h] of [[22, 6], [28, 8], [35, 8], [41, 6]]) P.poly([[sx - 3, top + 2], [sx + 0.5, top - h + 2], [sx + 4, top + 2]], 'hair', 2);
    if (t === 'tuft') { P.poly([[27, top + 1], [31, top - 5], [36, top + 1]], 'hair', 2); P.poly([[34, top + 1], [40, top - 3], [41, top + 3]], 'hair', 2); }
    if (t === 'bun') { P.ellipse(31.5, top - 1, 5.5, 4.5, 'hair', 2); }
    if (t === 'twinbun') { P.ellipse(20, top + 4, 4.2, 4.2, 'hair', 2); P.ellipse(43, top + 4, 4.2, 4.2, 'hair', 2); }
    if (t === 'puff') { for (const [px, r] of [[20, 5], [27, 5.5], [36, 5.5], [43, 5]]) P.ellipse(px + 0.5, top + 3, r, r - 0.5, 'hair', 2); }
    c.hairId = id;
    // shading: darker at bottom/right edges, highlight arc on the crown
    P.shadePart(id, { dx: 1, dy: 0, depth: 2, tone: 1 });
    P.shadePart(id, { dx: 0, dy: 1, depth: 1, tone: 1 });
    // strand lines in the bangs
    if (front && st.bang !== 'flat' || front) {
      for (let x = 22; x <= 41; x += 3) {
        const y = Math.floor(bangY(st, x, cy));
        if (P.partRaw(x, y - 1) === id) P.px(x, y - 1, 'hair', 1);
      }
    }
    // highlight
    const hc = cy - 2.7, rx = 14.5 + st.vol, ry = 12.8;
    for (let a = 118; a <= 168; a += 4) {
      const r = (a * Math.PI) / 180;
      for (const k of [0.8, 0.72]) {
        const x = Math.round(31.5 + Math.cos(r) * rx * k), y = Math.round(hc - Math.sin(r) * ry * k);
        if (P.partRaw(x, y) === id && P.getRaw(x, y) >= 0) P.px(x, y, 'hair', 3);
      }
    }
    // back view: a parting swirl
    if (!front) { for (let k = 0; k < 7; k++) P.px(31 + (k % 2), top + 2 + k, 'hair', 1); }
  }

  function hairLocks(c) { // long hair falling in front of the shoulders (after the torso)
    const { P, S, cy } = c;
    const st = HS[S.hair.style] || HS.short;
    if (st.bald) return;
    const b = st.back;
    if (b !== 'long' && b !== 'wave' && b !== 'bob') return;
    P.begin('locks');
    const y1 = b === 'bob' ? cy + 12 : cy + 20;
    for (let y = cy + 4; y <= y1; y++) {
      const wv = b === 'wave' ? Math.round(Math.sin((y - cy) * 0.7)) : 0;
      const grow = b === 'bob' ? 0 : y > cy + 12 ? 1 : 0;
      for (const s of [-1, 1]) {
        for (let k = 0; k < 4 + grow; k++) {
          const x = s < 0 ? 16 + k - grow + wv : 43 + k + wv;
          if (b === 'bob' && k < 1) continue;
          P.px(x, y, 'hair', s < 0 ? (k === 0 ? 3 : 2) : k > 2 ? 1 : 2);
        }
      }
    }
    if (!c.front) { P.begin('backhair'); for (let y = cy + 4; y <= y1; y++) for (let x = 20; x <= 43; x++) if (P.getRaw(x, y) < 0 || (P.partRaw(x, y) !== P.names.hair && y > c.tT - 1 && P.partRaw(x,y) !== 0)) P.px(x, y, 'hair', x > 37 ? 1 : x < 25 ? 3 : 2); }
  }

  // ---------------------------------------------------------------------------------------------------------------
  // Accessories: fn(c, acc, phase) — phases: 'back' (before body), 'body' (after the outfit), 'head' (after hair)
  // ---------------------------------------------------------------------------------------------------------------
  const ACC = (PT.ACC = {});
  const Mc = (c, a, d) => c.P.m(a.color !== undefined && a.color !== null ? a.color : d);
  const M2c = (c, a, d) => c.P.m(a.color2 !== undefined && a.color2 !== null ? a.color2 : d);

  ACC.glasses = (c, a, ph) => {
    if (ph !== 'head' || !c.front) return;
    const { P, cy } = c; const m = Mc(c, a, '#4a3a58');
    P.begin('glasses');
    for (const x0 of [20, 35]) { rowSpan(P, cy - 1, x0, x0 + 8, m, 1); rowSpan(P, cy + 7, x0, x0 + 8, m, 1); P.px(x0, cy, m, 1); P.px(x0, cy + 6, m, 1); for (let y = cy; y <= cy + 6; y++) { P.px(x0, y, m, 1); P.px(x0 + 8, y, m, 1); } }
    rowSpan(P, cy + 2, 29, 34, m, 1);
    P.px(19, cy + 1, m, 1); P.px(44, cy + 1, m, 1);
    P.px(21, cy, 'skin', 3); // lens glint handled by skin light px
    P.px(22, cy, 'skin', 3); P.px(36, cy, 'skin', 3); P.px(37, cy, 'skin', 3);
  };
  ACC.roundglasses = (c, a, ph) => {
    if (ph !== 'head' || !c.front) return;
    const { P, cy } = c; const m = Mc(c, a, '#c8a020');
    P.begin('glasses');
    for (const cx of [25, 38]) for (let y = cy - 3; y <= cy + 9; y++) for (let x = cx - 6; x <= cx + 6; x++) {
      const d = Math.hypot(x - cx + 0.5, (y - cy - 3) * 0.95); if (d <= 5.6 && d > 4.3) P.px(x, y, m, 2);
    }
    rowSpan(P, cy + 2, 30, 33, m, 2);
  };
  ACC.goggles = (c, a, ph) => {
    if (ph !== 'head') return;
    const { P, cy } = c; const m = Mc(c, a, '#d8a030');
    P.begin('goggles');
    const y = cy - 9;
    if (c.front) { rowSpan(P, y + 4, 17, 46, '#5a4a6a', 1); for (const cx of [25, 38]) { P.ellipse(cx, y, 5, 4, m, 2); P.ellipse(cx, y, 3, 2.4, '#9ad8f0', 2); P.px(cx - 2, y - 1, '#ffffff', 3); } }
    else { rowSpan(P, y + 1, 15, 48, '#5a4a6a', 1); rowSpan(P, y + 2, 15, 48, '#5a4a6a', 1); }
  };
  ACC.scarf = (c, a, ph) => {
    if (ph !== 'body') return;
    const { P, tT } = c; const m = Mc(c, a, '#4c7ee0');
    P.begin('scarf');
    for (let y = tT - 1; y <= tT + 3; y++) for (let x = 25; x <= 38; x++) { const hw = y === tT - 1 ? 5 : y === tT + 3 ? 6 : 7; if (Math.abs(x - 31.5) <= hw) P.px(x, y, m, y === tT - 1 ? 3 : y >= tT + 2 ? 1 : x > 35 ? 1 : 2); }
    if (c.front) { for (let y = tT + 3; y <= tT + 11; y++) for (let x = 35; x <= 39; x++) P.px(x, y, m, x >= 38 ? 1 : 2); rowSpan(P, tT + 11, 35, 39, M2c(c, a, m), 1); rowSpan(P, tT + 7, 35, 39, m, 3); }
    else for (let y = tT + 3; y <= tT + 7; y++) rowSpan(P, y, 28, 35, m, 1);
    P.edgeLine(P.cur, { sides: 'b' });
  };
  ACC.tape = (c, a, ph) => {
    if (ph !== 'body') return;
    const { P, tT } = c; const m = P.m('#f2d84a');
    P.begin('tape');
    for (let y = tT - 1; y <= tT + 2; y++) for (let x = 25; x <= 38; x++) P.px(x, y, m, y === tT - 1 ? 3 : y === tT + 2 ? 1 : 2);
    if (c.front) { for (let y = tT + 2; y <= tT + 14; y++) { P.px(26, y, m, 2); P.px(27, y, m, 2); P.px(36, y, m, 1); P.px(37, y, m, 1); } for (let y = tT + 4; y <= tT + 14; y += 2) { P.px(26, y, 0); P.px(36, y, 0); } }
    for (let x = 26; x <= 37; x += 2) P.px(x, tT, 0);
  };
  ACC.satchel = (c, a, ph) => {
    if (ph !== 'body') return;
    const { P, tT, tB, sw } = c; const m = Mc(c, a, '#a0642e');
    P.begin('satchel');
    const n = tB - tT;
    if (c.front) {
      for (let i = 0; i < n; i++) { P.px(27 + i, tT + i, m, 1); P.px(28 + i, tT + i, m, 2); }
      const bx = 32 + sw - 3, by = tB - 6;
      for (let y = by; y < by + 9; y++) for (let x = bx; x < bx + 10; x++) P.px(x, y, m, x >= bx + 8 ? 1 : y === by ? 3 : 2);
      rowSpan(P, by + 3, bx, bx + 9, m, 1); P.px(bx + 4, by + 4, '#f0d070', 3); P.px(bx + 5, by + 4, '#f0d070', 2); P.px(bx + 4, by + 5, '#f0d070', 1);
      P.edgeLine(P.cur, { sides: 'lrtb', against: [c.torsoId, c.armR, c.armL] });
    } else {
      for (let i = 0; i < n; i++) { P.px(36 - i, tT + i, m, 1); P.px(35 - i, tT + i, m, 2); }
      const bx = 32 - sw - 4, by = tB - 6;
      for (let y = by; y < by + 9; y++) for (let x = bx; x < bx + 10; x++) P.px(x, y, m, x >= bx + 8 ? 1 : y === by ? 3 : 2);
      rowSpan(P, by + 3, bx, bx + 9, m, 1);
    }
  };
  ACC.backpack = (c, a, ph) => {
    const { P, tT, tB, sw } = c; const m = Mc(c, a, '#d06a2a');
    if (ph === 'back' && c.front) { P.begin('pack'); for (let y = tT - 2; y <= tB + 2; y++) for (let x = 32 - sw - 3; x <= 31 + sw + 3; x++) P.px(x, y, m, x >= 31 + sw ? 1 : y < tT ? 3 : 2); return; }
    if (ph !== 'body') return;
    P.begin('pack');
    if (c.front) { for (let y = tT; y < tB; y++) { P.px(27, y, m, 2); P.px(28, y, m, 2); P.px(35, y, m, 1); P.px(36, y, m, 1); } P.px(27, tT + 6, '#f0d070', 3); P.px(36, tT + 6, '#f0d070', 2); }
    else { for (let y = tT - 3; y <= tB + 2; y++) for (let x = 32 - sw - 3; x <= 31 + sw + 3; x++) P.px(x, y, m, x >= 31 + sw ? 1 : y < tT ? 3 : 2); rowSpan(P, tT + 5, 26, 37, m, 1); for (let y = tT + 7; y < tT + 12; y++) for (let x = 27; x <= 36; x++) P.px(x, y, m, x > 34 ? 1 : 3); }
  };
  function bowAt(P, m, cx, cy, big) {
    const s = big ? 2 : 0;
    for (const d of [-1, 1]) {
      P.poly([[cx + d * 1, cy], [cx + d * (8 + s), cy - 5 - s], [cx + d * (9 + s), cy + 1], [cx + d * (8 + s), cy + 6 + s]], m, d < 0 ? 3 : 2);
      P.line(cx + d * 2, cy, cx + d * (7 + s), cy + 1, m, 1);
    }
    P.rect(cx - 2, cy - 2, 4, 5, m, 1); P.px(cx - 2, cy - 2, m, 3);
    P.px(cx - 1, cy + 4, m, 1); P.px(cx, cy + 5, m, 1);
  }
  ACC.bow = (c, a, ph) => {
    if (ph !== 'head') return;
    const { P, cy } = c; const m = Mc(c, a, '#f06a9c');
    P.begin('bow');
    const st = HS[c.S.hair.style] || HS.short;
    if (c.front) bowAt(P, m, 41, cy - 13, false); else bowAt(P, m, 31.5, cy - 12, true);
  };
  ACC.ribbon = ACC.bow;
  ACC.cap = (c, a, ph) => {
    if (ph !== 'head') return;
    const { P, cy } = c; const m = Mc(c, a, '#d8363a');
    P.begin('cap');
    const top = cy - 17;
    for (let y = top; y <= cy - 6; y++) for (let x = 15; x <= 48; x++) { const dx = (x - 31.5) / 15.5, dy = (y - (cy - 4)) / 13; if (dx * dx + dy * dy <= 1) P.px(x, y, m, y < top + 3 && x < 31 ? 3 : x > 40 ? 1 : 2); }
    if (c.front) {
      for (let y = cy - 7; y <= cy - 4; y++) for (let x = 18 - (y - cy + 7) * 0; x <= 45; x++) P.px(x, y, m, y >= cy - 5 ? 1 : 2);
      rowSpan(P, cy - 4, 20, 43, m, 0);
      // logo patch
      P.ellipse(31.5, cy - 11, 3, 3, M2c(c, a, '#f6f4f0'), 2); P.px(31, cy - 12, M2c(c, a, '#f6f4f0'), 3);
    } else { for (let x = 17; x <= 46; x++) P.px(x, cy - 5, m, 1); P.px(31, top + 1, m, 3); }
    P.edgeLine(P.cur, { sides: 'b', against: [c.hairId, c.skullId] });
  };
  ACC.flatcap = (c, a, ph) => {
    if (ph !== 'head') return;
    const { P, cy } = c; const m = Mc(c, a, '#3e4050');
    P.begin('cap');
    const top = cy - 15;
    for (let y = top; y <= cy - 7; y++) for (let x = 14; x <= 49; x++) { const dx = (x - 31.5) / 17.5, dy = (y - (cy - 5)) / 10.5; if (dx * dx + dy * dy <= 1) P.px(x, y, m, y < top + 2 && x < 31 ? 3 : x > 42 ? 1 : 2); }
    if (c.front) {
      rowSpan(P, cy - 6, 15, 48, m, 1); rowSpan(P, cy - 5, 18, 45, m, 1); rowSpan(P, cy - 4, 22, 41, m, 0);
      rowSpan(P, cy - 7, 17, 46, M2c(c, a, '#e8e8f0'), 2);
      P.ellipse(31.5, cy - 12, 2.5, 2.5, M2c(c, a, '#e8e8f0'), 3);
    } else { rowSpan(P, cy - 6, 15, 48, m, 1); rowSpan(P, cy - 7, 17, 46, M2c(c, a, '#e8e8f0'), 2); }
  };
  ACC.hat = (c, a, ph) => {
    if (ph !== 'head') return;
    const { P, cy } = c; const m = Mc(c, a, '#e8c870');
    P.begin('hat');
    P.ellipse(31.5, cy - 11, 11, 7, m, 2);
    P.ellipse(31.5, cy - 7, 20, 4.2, m, 2);
    // brim underside / crown band
    for (let x = 12; x <= 51; x++) if (P.getRaw(x, cy - 4) >= 0) P.px(x, cy - 4, m, 1);
    rowSpan(P, cy - 9, 21, 42, M2c(c, a, '#d8363a'), 2); rowSpan(P, cy - 8, 21, 42, M2c(c, a, '#d8363a'), 1);
    for (let k = 0; k < 6; k++) P.px(24 + k * 3, cy - 13 + (k % 2), m, 3);
  };
  ACC.headband = (c, a, ph) => {
    if (ph !== 'head') return;
    const { P, cy } = c; const m = Mc(c, a, '#d8363a');
    P.begin('band');
    for (let x = 16; x <= 47; x++) { const dx = (x - 31.5) / 16; const yy = Math.round(cy - 8 + Math.sqrt(Math.max(0, 1 - dx * dx)) * 0 + dx * dx * 4); P.px(x, yy, m, 2); P.px(x, yy + 1, m, 1); }
    if (c.front) { for (let k = 0; k < 4; k++) { P.px(46 + k, cy - 3 + k, m, 2); P.px(47 + k, cy - 3 + k, m, 1); } }
  };
  ACC.bandana = ACC.headband;
  ACC.maidcap = (c, a, ph) => {
    if (ph !== 'head') return;
    const { P, cy } = c; const m = P.m('#fbf8f2');
    P.begin('maidcap');
    if (c.front) {
      P.ellipse(31.5, cy - 11, 12, 4, m, 2);
      rowSpan(P, cy - 13, 22, 41, m, 3); rowSpan(P, cy - 8, 18, 45, m, 1);
      for (let k = 0; k < 8; k++) { P.px(19 + k * 3, cy - 7, m, 2); }
      rowSpan(P, cy - 11, 28, 35, Mc(c, a, '#f06a9c'), 2);
      P.px(18, cy - 7, Mc(c, a, '#f06a9c'), 2); P.px(45, cy - 7, Mc(c, a, '#f06a9c'), 1);
    } else { P.ellipse(31.5, cy - 9, 13, 6, m, 2); rowSpan(P, cy - 12, 22, 41, m, 3); rowSpan(P, cy - 4, 20, 43, m, 1); bowAt(P, Mc(c, a, '#f06a9c'), 31.5, cy - 6, false); }
  };
  ACC.belt = (c, a, ph) => {
    if (ph !== 'body') return;
    const { P, tB, sw } = c; const m = Mc(c, a, '#7c4e30');
    P.begin('belt');
    rowSpan(P, tB - 2, 32 - sw + 1, 30 + sw, m, 1); rowSpan(P, tB - 3, 32 - sw + 1, 30 + sw, m, 2);
    if (c.front) { rowSpan(P, tB - 3, 30, 33, '#f2cc40', 2); rowSpan(P, tB - 2, 30, 33, '#f2cc40', 1); P.px(31, tB - 3, '#fff4b0', 3);
      // tape measure / scissors hanging
      for (let y = tB - 1; y < tB + 4; y++) { P.px(36, y, '#d8d8e8', 2); P.px(37, y, '#8a8aa0', 1); }
      P.px(36, tB + 4, '#7c4e30', 2); P.px(37, tB + 4, '#7c4e30', 1); }
  };
  ACC.spools = (c, a, ph) => {
    if (ph !== 'body' || !c.front) return;
    const { P, tB } = c;
    P.begin('spools');
    const cols = ['#d8363a', '#f2cc40', '#3e6ad0'];
    for (let i = 0; i < 3; i++) { const x = 27 + i * 4; rowSpan(P, tB + 1, x, x + 2, '#f6f4f0', 2); rowSpan(P, tB + 2, x, x + 2, cols[i], 2); rowSpan(P, tB + 3, x, x + 2, cols[i], 1); rowSpan(P, tB + 4, x, x + 2, '#f6f4f0', 1); P.px(x, tB + 2, cols[i], 3); }
  };
  ACC.brooch = (c, a, ph) => {
    if (ph !== 'body' || !c.front) return;
    const { P, tT } = c; const m = Mc(c, a, '#c8d0e8');
    P.begin('brooch');
    P.ellipse(35, tT + 6, 2.5, 2.5, m, 2); P.px(34, tT + 5, m, 3); P.px(36, tT + 7, m, 1); P.px(35, tT + 6, '#e8483a', 2); P.px(35, tT + 8, m, 1); P.px(35, tT + 9, m, 1);
  };
  ACC.badge = (c, a, ph) => { if (ph === 'body' && c.front) { c.P.begin('badge'); const m = Mc(c, a, '#f2cc40'); c.P.ellipse(37, c.tT + 6, 1.8, 1.8, m, 2); c.P.px(36, c.tT + 5, m, 3); } };
  ACC.sash = (c, a, ph) => {
    if (ph !== 'body') return;
    const { P, tT, tB } = c; const m = Mc(c, a, '#d8363a');
    P.begin('sash');
    const n = tB - tT;
    for (let i = 0; i < n; i++) for (let k = 0; k < 4; k++) P.px((c.front ? 38 - i : 25 + i) + (c.front ? -k : k), tT + i, m, k === 3 ? 1 : 2);
  };
  ACC.necktie = (c, a, ph) => {
    if (ph !== 'body' || !c.front) return;
    const { P, tT } = c; const m = Mc(c, a, '#d8363a');
    P.begin('tie'); P.px(31, tT, m, 2); P.px(32, tT, m, 2); for (let y = tT + 1; y < tT + 8; y++) { P.px(31, y, m, 2); P.px(32, y, m, 1); }
  };
  ACC.earmuffs = (c, a, ph) => {
    if (ph !== 'head') return;
    const { P, cy } = c; const m = Mc(c, a, '#f06a9c');
    P.begin('muffs');
    if (c.front) {
      for (const x of [16, 47]) P.ellipse(x, cy + 1, 3.6, 5, m, x < 30 ? 3 : 2);
      for (let x = 17; x <= 46; x++) { const dx = (x - 31.5) / 15; P.px(x, Math.round(cy - 14 + dx * dx * 9), '#c8c8d8', 2); P.px(x, Math.round(cy - 14 + dx * dx * 9) + 1, '#9a9ab0', 1); }
    } else for (const x of [16, 47]) P.ellipse(x, cy + 1, 3.6, 5, m, 2);
  };
  ACC.flower = (c, a, ph) => {
    if (ph !== 'head' || !c.front) return;
    const { P, cy } = c; const m = Mc(c, a, '#f06a9c');
    P.begin('flower');
    for (const [dx, dy] of [[0, -2], [2, 0], [0, 2], [-2, 0]]) P.ellipse(24 + dx, cy - 11 + dy, 1.6, 1.6, m, 2);
    P.px(24, cy - 11, '#f6e060', 3); P.px(23, cy - 12, m, 3);
  };
  ACC.cane = (c, a, ph) => {
    if (ph !== 'body') return;
    const { P, tT, tB, sw } = c;
    P.begin('cane');
    const x = c.front ? 32 - sw - 5 : 32 + sw + 4;
    for (let y = tB + 2; y <= 60; y++) { P.px(x, y, '#9a6a3a', 2); P.px(x + 1, y, '#6a4020', 1); }
    rowSpan(P, tB + 1, x - 1, x + 2, '#9a6a3a', 3);
  };
  ACC.bag = (c, a, ph) => {
    if (ph !== 'body' || !c.front) return;
    const { P, tB, sw } = c; const m = Mc(c, a, '#7c4e30');
    P.begin('bag'); for (let y = tB - 4; y < tB + 4; y++) for (let x = 32 + sw - 2; x < 32 + sw + 6; x++) P.px(x, y, m, x > 32 + sw + 3 ? 1 : y === tB - 4 ? 3 : 2);
  };
  ACC.pince = (c, a, ph) => {
    if (ph !== 'body') return;
    const { P, tT, tB } = c; const m = Mc(c, a, '#8a9ac8');
    P.begin('stripes');
    for (let x = 22; x <= 41; x += 3) for (let y = tT + 2; y < tB + 12; y++) if (P.matAt(x, y) === P.names.top) P.px(x, y, m, 1);
  };
  ACC.fishingrod = (c, a, ph) => {
    if (ph !== 'body') return;
    const { P, tT, tB, sw } = c;
    P.begin('rod');
    const x0 = c.front ? 32 + sw + 4 : 32 - sw - 4;
    for (let i = 0; i < 40; i++) { P.px(x0 + (c.front ? i * 0.25 : -i * 0.25), tB + 6 - i, '#c89a64', 2); }
  };
  ACC.whiskers = () => {};
  ACC.easel = () => {};

  // ---------------------------------------------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------------------------------------------
  PT.render = function (S, view) {
    const P = new L.Paper(W, W);
    L.setupInks(P, S);
    const c = ctx(P, S, view);
    const accs = (phase) => {
      for (const a of S.acc) { const fn = ACC[a.type]; if (fn) { P.begin('acc_' + a.type); fn(c, a, phase); } }
    };
    hairBack(c);
    accs('back');
    hairBackAccent(c);
    legsAndShoes(c);
    bottom(c);
    const out = OUT[S.outfit.type] || OUT.tee;
    out(c);
    head(c);
    if (c.front) face(c);
    hairFront(c);
    if (c.front) brows(c);
    accs('body');
    hairLocks(c);
    accs('head');
    const bmp = P.render({ maxColors: 16 });
    return bmp;
  };
})(typeof globalThis !== 'undefined' ? globalThis : window);
