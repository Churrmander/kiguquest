/* src/art/human/ow.js — 16×24 overworld sprite renderer (4 directions × 3 walk frames) for NP.art.human.
 *
 * Layout (every build): feet (shoes) on rows 21-22, outline on row 23, so the character stands in the bottom 16×16 tile
 * and the head overlaps the tile above. The head is the same size for every build (chibi); builds differ in body length
 * and width. Walk frames: 0 = stand, 1 = left-foot step, 2 = right-foot step; step frames lower the upper body by 1px
 * (hips drop when the legs are apart), swing the arms and lift the trailing foot.
 */
(function (root) {
  'use strict';
  const NP = (root.NP = root.NP || {});
  const HUM = (NP.art.human = NP.art.human || {});
  const L = HUM._;
  const W = 16, H = 24;
  const OW = (L.ow = L.ow || {});

  // top: first interior row of the head; tH: torso rows (incl. hem row); lH: rows between torso and shoes (hips+legs).
  // Invariant: top + 11 + tH + lH === 21 (shoes on rows 21-22). bw: half-width of the torso body; arm: arm width.
  const GEO = {
    teen: { top: 2, tH: 5, lH: 3, bw: 3, sh: 5, arm: 2, legW: 3, legGap: 2 },
    adult: { top: 2, tH: 5, lH: 3, bw: 3, sh: 5, arm: 2, legW: 3, legGap: 2, broad: true },
    tall: { top: 1, tH: 6, lH: 3, bw: 3, sh: 5, arm: 2, legW: 3, legGap: 2 },
    elder: { top: 3, tH: 5, lH: 2, bw: 3, sh: 5, arm: 2, legW: 3, legGap: 2 },
    stout: { top: 2, tH: 5, lH: 3, bw: 4, sh: 6, arm: 2, legW: 3, legGap: 2, broad: true },
    child: { top: 6, tH: 3, lH: 1, bw: 3, sh: 4, arm: 2, legW: 3, legGap: 2, small: true },
  };
  OW.GEO = GEO;

  const CX = 7.5; // horizontal centre of the sprite

  /** Register the look's material ramps on a paper (shared by both scales). */
  function setupInks(P, S) {
    P.addRamp('skin', S.skin);
    P.addRamp('hair', S.hair.ramp);
    P.addRamp('top', S.outfit.main);
    P.addRamp('trim', S.outfit.trim);
    P.addRamp('under', S.outfit.under);
    P.addRamp('bot', S.bottom.color);
    P.addRamp('shoe', S.shoes);
    P.addRamp('legs', S.legs ? L.ramp(S.legs) : S.skin);
    P.addRamp('eye', S.eyes);
    P.addRamp('facial', L.ramp(S.facialColor));
  }
  L.setupInks = setupInks;

  // ---------------------------------------------------------------------------------------------------------------
  // Context: per-frame positions
  // ---------------------------------------------------------------------------------------------------------------
  function makeCtx(P, S, dir, frame) {
    const g = GEO[S.build];
    const bob = frame ? 1 : 0;
    const top = g.top;
    const hy = top + bob; // head frame row 0
    const ty = top + 11 + bob; // torso row 0 (shoulders)
    const hipY = top + 11 + g.tH + bob; // first row below torso (hips)
    return {
      P, S, g, dir, frame, bob, hy, ty, hipY,
      tH: g.tH, lH: g.lH,
      footY: 21,
      // walk phase: which screen side leads (for down/up), 0 = none
      lead: frame === 0 ? 0 : frame === 1 ? 1 : -1,
    };
  }

  // ---------------------------------------------------------------------------------------------------------------
  // Shared garment helpers (DOWN / UP use the same silhouette; SIDE has its own)
  // ---------------------------------------------------------------------------------------------------------------

  /** Torso columns for front/back views: returns {x0,x1} of the body (inclusive). */
  function bodyX(c) {
    return { x0: Math.round(CX - c.g.bw - 0.5), x1: Math.round(CX + c.g.bw - 0.5) };
  }

  /**
   * Front/back torso + arms. mats: { body, sleeve, cuff (hand mat), shoulder } — hands are skin unless gloves.
   * sleeveLen: rows of sleeve (rest of the arm is bare skin); hem row (last torso row) is drawn narrower.
   */
  function frontTorso(c, o) {
    const { P, ty, tH } = c;
    const { x0, x1 } = bodyX(c);
    const arm = c.g.arm;
    const body = o.body, sleeve = o.sleeve || o.body;
    const sleeveRows = o.sleeveRows === undefined ? 99 : o.sleeveRows;
    const handMat = o.hand || 'skin';
    P.begin('torso');
    // shoulders (row 0) span body + inner arm columns
    P.rect(x0 - 1, ty, x1 - x0 + 3, 1, body, 2);
    // body rows
    P.rect(x0, ty + 1, x1 - x0 + 1, tH - 1, body, 2);
    // right-side shade column (light from top-left)
    P.rect(x1, ty + 1, 1, tH - 1, body, 1);
    // hem row a touch darker at the right
    // arms: rows ty..ty+tH-2 (hand on the last of those), outside the body with a line in between
    const armRows = tH - 1;
    const swing = (side) => (c.dir === 'down' ? side * c.lead : -side * c.lead); // +1 forward (longer), -1 back
    for (const side of [-1, 1]) {
      const sw = c.frame ? swing(side) : 0;
      const ax = side < 0 ? x0 - 1 - arm : x1 + 2; // arm's left column
      const len = armRows + (sw > 0 ? 1 : 0) - (sw < 0 ? 0 : 0);
      P.begin(side < 0 ? 'armL' : 'armR');
      for (let r = 0; r < len; r++) {
        const y = ty + r + (r > 0 && sw < 0 ? 0 : 0);
        const isHand = r === len - 1;
        const isSleeve = r < sleeveRows;
        const mat = isHand ? handMat : isSleeve ? sleeve : 'skin';
        for (let k = 0; k < arm; k++) {
          const x = ax + k;
          // outer column is lit on the left arm, shaded on the right arm
          const tone = side > 0 ? (k === arm - 1 ? 1 : 2) : k === 0 ? 2 : 2;
          P.px(x, y, mat, isHand && k === arm - 1 && side > 0 ? 1 : tone);
        }
      }
      // separation line between arm and body (below the shoulder row)
      const lx = side < 0 ? x0 - 1 : x1 + 1;
      P.begin('armline');
      for (let r = 1; r < len; r++) P.px(lx, ty + r, 0);
    }
    return { x0, x1 };
  }

  /** Hips + legs + shoes for front/back views. o: { hip, upper, lower, shoe } materials; skirt handled separately. */
  function frontLegs(c, o) {
    const { P, hipY } = c;
    const { x0, x1 } = bodyX(c);
    const lw = c.g.legW;
    const lx = [Math.round(CX - 1) - lw + 1 - 0, Math.round(CX) + 1]; // left leg x0, right leg x0
    // left leg: x = lx[0]..lx[0]+lw-1 ; right: lx[1]..
    lx[0] = Math.round(CX - c.g.legGap / 2 - lw + 0.5 - 0.5) ;
    lx[1] = Math.round(CX + c.g.legGap / 2 + 0.5 - 0.5) ;
    P.begin('hips');
    P.rect(x0, hipY, x1 - x0 + 1, 1, o.hip, 2);
    P.px(x1, hipY, o.hip, 1);
    const legRows = 21 - hipY - 1; // rows between hip row and shoes
    for (let i = 0; i < 2; i++) {
      const side = i === 0 ? -1 : 1;
      // which leg is lifted: frame 1 (left foot step) — facing down the character's left leg is on screen right
      let lift = 0;
      if (c.frame) {
        const leadSide = c.dir === 'down' ? c.lead : -c.lead; // screen side of the forward foot
        if (c.dir === 'down') lift = side === leadSide ? 0 : 1;
        else lift = side === leadSide ? 1 : 0;
      }
      P.begin(i === 0 ? 'legL' : 'legR');
      const x = lx[i];
      for (let r = 0; r < legRows - lift + 0; r++) {
        const y = hipY + 1 + r;
        const mat = r < (o.upperRows === undefined ? 99 : o.upperRows) ? o.upper : o.lower;
        for (let k = 0; k < lw; k++) P.px(x + k, y, mat, side > 0 && k === lw - 1 ? 1 : 2);
      }
      // shoes (2 rows), lifted foot sits 1px higher and is drawn in shadow
      const sy = 21 - lift;
      for (let k = 0; k < lw; k++) {
        P.px(x + k, sy, o.shoe || 'shoe', lift ? 1 : 2);
        P.px(x + k, sy + 1, o.shoe || 'shoe', 1);
      }
      if (!lift) P.px(side < 0 ? x : x + lw - 1, sy, o.shoe || 'shoe', side < 0 ? 3 : 1);
    }
  }

  // ---------------------------------------------------------------------------------------------------------------
  // Face / head
  // ---------------------------------------------------------------------------------------------------------------
  const SKULL_DOWN = [
    '....ssssssss....',
    '...ssssssssss...',
    '..ssssssssssss..',
    '..ssssssssssss..',
    '..ssssssssssss..',
    '..ssssssssssss..',
    '..sssssssssssS..',
    '..sssssssssssS..',
    '..sssssssssssS..',
    '...ssssssssSS...',
    '.....SSSSSS.....',
  ];
  const SKULL_UP = SKULL_DOWN.map((r, i) => (i === 10 ? '.....SSSSSS.....' : r));
  const SKULL_SIDE = [
    '....ssssssss....',
    '...ssssssssss...',
    '..ssssssssssss..',
    '..ssssssssssss..',
    '..ssssssssssss..',
    '..ssssssssssss..',
    '..ssssssssssss..',
    '..sssssssssss...',
    '..sssssssssss...',
    '...ssssssssS....',
    '......SSSSS.....',
  ];
  const SKIN_LEG = { s: ['skin', 2], S: ['skin', 1], L: ['skin', 3], o: 'line' };

  function drawHead(c) {
    const { P, S, hy, dir } = c;
    P.begin('head');
    const rows = dir === 'down' ? SKULL_DOWN : dir === 'up' ? SKULL_UP : SKULL_SIDE;
    P.mask(rows, 0, hy, SKIN_LEG);
    if (dir === 'down') drawFaceDown(c);
    if (dir === 'left') drawFaceSide(c);
  }

  function drawFaceDown(c) {
    const { P, S, hy } = c;
    P.begin('face');
    const ey = hy + 7;
    const e = S.face.eyes;
    if (e === 'closed' || e === 'happy') {
      P.px(4, ey + 1, 0); P.px(5, ey + 1, 0);
      P.px(10, ey + 1, 0); P.px(11, ey + 1, 0);
    } else {
      P.px(4, ey, 0); P.px(4, ey + 1, 0);
      P.px(11, ey, 0); P.px(11, ey + 1, 0);
    }
    if (S.face.blush && !L.hasAcc(S, 'glasses')) {
      // no blush at 16×24 (reads as noise)
    }
    if (S.facial === 'beard') {
      P.begin('beard');
      P.mask(['..h........h..', '..hhHHHHHHhh..', '...hHHHHHHh...', '....hhhhhh....'].map((r) => '.' + r + '.'), 0, hy + 7, { H: ['facial', 2], h: ['facial', 1] });
      P.px(4, ey, 0); P.px(4, ey + 1, 0); P.px(11, ey, 0); P.px(11, ey + 1, 0);
    } else if (S.facial === 'mustache') {
      P.begin('beard');
      P.mask(['......hHHh......'], 0, hy + 9, { H: ['facial', 2], h: ['facial', 1] });
    }
  }

  function drawFaceSide(c) {
    const { P, S, hy } = c;
    P.begin('face');
    const ey = hy + 7;
    const e = S.face.eyes;
    if (e === 'closed' || e === 'happy') { P.px(3, ey + 1, 0); P.px(4, ey + 1, 0); }
    else { P.px(3, ey, 0); P.px(3, ey + 1, 0); }
    if (S.facial === 'beard') {
      P.begin('beard');
      P.mask(['..........', '...hHHHh..', '...hHHHH..', '....hhhh..'], 0, hy + 7, { H: ['facial', 2], h: ['facial', 1] });
      P.px(3, ey, 0); P.px(3, ey + 1, 0);
    } else if (S.facial === 'mustache') {
      P.begin('beard');
      P.mask(['..hHh...'], 0, hy + 9, { H: ['facial', 2], h: ['facial', 1] });
    }
  }

  // ---------------------------------------------------------------------------------------------------------------
  // Hair: styles register masks in OW.HAIR[style] = { down:{front,back,oy}, up:{...}, left:{...} }
  // legend: H base, h shadow, d deep, L light, o line, s/S skin, x erase
  // ---------------------------------------------------------------------------------------------------------------
  OW.HAIR = OW.HAIR || {};
  const HAIR_LEG = { H: ['hair', 2], h: ['hair', 1], d: ['hair', 0], L: ['hair', 3], o: 'line', s: ['skin', 2], S: ['skin', 1], x: 'erase' };

  function drawHair(c, layer) {
    const { P, S, hy, dir } = c;
    const fn = OW.HAIR[S.hair.style] || OW.HAIR.short;
    fn(c, layer);
  }

  // ---------------------------------------------------------------------------------------------------------------
  // Outfits (front/back views). Each gets the ctx and paints torso + (optionally) legs.
  // ---------------------------------------------------------------------------------------------------------------
  function bottomFront(c) {
    const { S } = c;
    const b = S.bottom.type;
    const lower = S.legs ? 'legs' : 'skin';
    if (b === 'pants' || b === 'overall') frontLegs(c, { hip: 'bot', upper: 'bot', lower: 'bot' });
    else if (b === 'shorts') frontLegs(c, { hip: 'bot', upper: 'bot', lower, upperRows: 1 });
    else if (b === 'skirt') { frontLegs(c, { hip: 'bot', upper: lower, lower }); skirtFront(c, 'bot', 1); }
    else if (b === 'longskirt') { frontLegs(c, { hip: 'bot', upper: lower, lower }); skirtFront(c, 'bot', 9); }
    else if (b === 'none') { frontLegs(c, { hip: 'top', upper: lower, lower }); }
  }

  /** A flared skirt from the hip row down `len` rows (clipped above the shoes). */
  function skirtFront(c, mat, len) {
    const { P, hipY } = c;
    const { x0, x1 } = bodyX(c);
    P.begin('skirt');
    const maxY = 20;
    for (let r = 0; r <= len && hipY + r <= maxY; r++) {
      const flare = r === 0 ? 0 : 1;
      const y = hipY + r;
      for (let x = x0 - flare; x <= x1 + flare; x++) P.px(x, y, mat, x >= x1 ? 1 : 2);
      if (r > 0 && (r & 1) === 0) P.px(Math.round(CX), y, mat, 1);
    }
    // hem shading
    const last = Math.min(hipY + len, maxY);
    for (let x = x0 - 1; x <= x1 + 1; x++) P.px(x, last, mat, 1);
  }

  const OUTFIT = (OW.OUTFIT = OW.OUTFIT || {});

  OUTFIT.tee = (c) => {
    bottomFront(c);
    frontTorso(c, { body: 'top', sleeve: 'top', sleeveRows: 2 });
    if (c.dir === 'down') {
      const { P, ty } = c;
      P.begin('collar');
      P.px(7, ty, 'skin', 1); P.px(8, ty, 'skin', 1);
    }
  };

  OUTFIT.jacket = (c) => {
    bottomFront(c);
    const { x0, x1 } = frontTorso(c, { body: 'top', sleeve: 'top' });
    const { P, ty, tH } = c;
    if (c.dir === 'down') {
      P.begin('shirt');
      P.rect(7, ty, 2, tH - 1, 'under', 2);
      P.px(8, ty + tH - 2, 'under', 1);
      P.px(7, ty, 'skin', 1); P.px(8, ty, 'skin', 1);
      P.begin('trim');
      P.px(6, ty, 'trim', 2); P.px(9, ty, 'trim', 2);
      P.rect(x0, ty + tH - 1, x1 - x0 + 1, 1, 'trim', 2);
      P.px(x1, ty + tH - 1, 'trim', 1);
    } else {
      P.begin('trim');
      P.rect(x0, ty + tH - 1, x1 - x0 + 1, 1, 'trim', 1);
      P.rect(x0 - 1, ty, x1 - x0 + 3, 1, 'trim', 2);
    }
  };

  // ---------------------------------------------------------------------------------------------------------------
  // SIDE view (facing left). Near side = the character's left.
  // ---------------------------------------------------------------------------------------------------------------
  function sideBody(c, o) {
    const { P, ty, tH, hipY, frame } = c;
    const body = o.body, sleeve = o.sleeve || o.body;
    const sleeveRows = o.sleeveRows === undefined ? 99 : o.sleeveRows;
    // stride: frame 1 = near (left) leg forward, frame 2 = far leg forward
    const nearFwd = frame === 1 ? 1 : frame === 2 ? -1 : 0;
    const lower = S_lower(c);
    // far arm (behind body): visible only when swinging
    const armRows = tH - 1;
    const farSwing = -nearFwd; // arms swing opposite to the same-side leg; far arm follows near leg
    const nearSwing = -nearFwd;
    // ... far arm
    if (frame) {
      P.begin('farArm');
      const fx = 7 - (-farSwing) * 2; // far arm swings opposite of near arm
      const ax = nearSwing > 0 ? 9 : 5;
      for (let r = 1; r < armRows; r++) P.px(ax, ty + r, sleeve, 0);
      P.px(ax, ty + armRows - 1, 'skin', 1);
    }
    // legs
    const legs = [];
    const shoe = o.shoe || 'shoe';
    const legRows = 21 - hipY - 1;
    const drawLeg = (xFoot, xHip, near) => {
      P.begin(near ? 'legNear' : 'legFar');
      for (let r = 0; r < legRows; r++) {
        const t = legRows <= 1 ? 1 : r / (legRows - 1);
        const x = Math.round(xHip + (xFoot - xHip) * t);
        const mat = r < (o.upperRows === undefined ? 99 : o.upperRows) ? o.upper : o.lower;
        P.px(x, hipY + 1 + r, mat, near ? 2 : 1);
        P.px(x + 1, hipY + 1 + r, mat, near ? 1 : 0);
      }
      P.px(xFoot - 1, 21, shoe, near ? 2 : 1); P.px(xFoot, 21, shoe, near ? 2 : 1); P.px(xFoot + 1, 21, shoe, 1);
      P.px(xFoot - 1, 22, shoe, 1); P.px(xFoot, 22, shoe, 1); P.px(xFoot + 1, 22, shoe, 0);
    };
    if (!frame) {
      drawLeg(7, 7, false);
      drawLeg(6, 6, true);
    } else {
      const fwd = 4, back = 9;
      if (nearFwd > 0) { drawLeg(back, 7, false); drawLeg(fwd, 6, true); }
      else { drawLeg(fwd, 6, false); drawLeg(back, 7, true); }
    }
    // hips
    P.begin('hips');
    P.rect(5, hipY, 5, 1, o.hip, 2);
    P.px(9, hipY, o.hip, 1);
    // torso
    P.begin('torso');
    P.rect(5, ty, 5, tH, body, 2);
    P.rect(9, ty + 1, 1, tH - 1, body, 1);
    P.px(4, ty + 1, body, 2);
    // near arm
    P.begin('armNear');
    const ax = nearSwing > 0 ? 5 : nearSwing < 0 ? 7 : 6;
    for (let r = 0; r < armRows; r++) {
      const isHand = r === armRows - 1;
      const x = r === 0 ? 6 : ax + (r >= armRows - 2 && nearSwing ? -nearSwing * 0 : 0);
      const mat = isHand ? 'skin' : r < sleeveRows ? sleeve : 'skin';
      P.px(x, ty + r, mat, 2);
      P.px(x + 1, ty + r, mat, 1);
    }
    P.begin('armline');
    for (let r = 1; r < armRows; r++) P.px(ax + 2, ty + r, 0);
  }
  function S_lower(c) {
    return c.S.legs ? 'legs' : 'skin';
  }

  // ---------------------------------------------------------------------------------------------------------------
  // Frame composition
  // ---------------------------------------------------------------------------------------------------------------
  function accs(c, phase) {
    for (const a of c.S.acc) {
      const fn = OW.ACC && OW.ACC[a.type];
      if (fn) { c.P.begin('acc_' + a.type); fn(c, a, phase); }
    }
  }

  function renderFrame(S, dir, frame) {
    const P = new L.Paper(W, H);
    setupInks(P, S);
    const face = dir === 'right' ? 'left' : dir;
    const c = makeCtx(P, S, face, frame);
    if (face === 'down' || face === 'up') {
      if (face === 'down') drawHair(c, 'back');
      const fn = OUTFIT[S.outfit.type] || OUTFIT.tee;
      fn(c);
      accs(c, 'body3');
      drawHead(c);
      accs(c, 'body2');
      drawHair(c, 'front');
      if (face === 'up') drawHair(c, 'back');
      accs(c, 'head');
    } else {
      drawHair(c, 'back');
      sideBody(c, sideMats(S));
      const fx = OW.SIDEFX && OW.SIDEFX[S.outfit.type];
      if (fx) fx(c);
      if (S.bottom.type === 'skirt' || S.bottom.type === 'longskirt') OW.SIDEFX.skirtBottom(c, S.bottom.type === 'skirt' ? 1 : 9);
      accs(c, 'body3');
      drawHead(c);
      accs(c, 'body2');
      drawHair(c, 'front');
      accs(c, 'head');
    }
    const bmp = P.render({ maxColors: 26 });
    return dir === 'right' ? bmp.flippedX() : bmp;
  }

  function sideMats(S) {
    const b = S.bottom.type;
    const lower = S.legs ? 'legs' : 'skin';
    const o = { body: 'top', sleeve: 'top', hip: 'bot', upper: 'bot', lower: 'bot' };
    if (b === 'shorts') { o.lower = lower; o.upperRows = 1; }
    if (b === 'skirt' || b === 'longskirt') { o.upper = lower; o.lower = lower; }
    if (b === 'none') { o.hip = 'top'; o.upper = lower; o.lower = lower; }
    if (S.outfit.type === 'tee') o.sleeveRows = 2;
    return o;
  }

  /** Public-ish: build the full overworld object for a normalised spec. */
  OW.build = function (S) {
    const frames = {};
    for (const d of ['down', 'up', 'left']) frames[d] = [0, 1, 2].map((f) => renderFrame(S, d, f));
    frames.right = [frames.left[0].flippedX(), frames.left[2].flippedX(), frames.left[1].flippedX()];
    return { w: W, h: H, frames };
  };
  OW.renderFrame = renderFrame;
  OW.H = { bodyX, frontTorso, frontLegs, bottomFront, skirtFront, CX };
})(typeof globalThis !== 'undefined' ? globalThis : window);
