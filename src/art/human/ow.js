/* src/art/human/ow.js — sprite composition (paint order, shading, outline) + the 32×32 overworld sprite set for NP.art.human.
 *
 * L.compose(S, target, view, frame) paints one figure back-to-front on a Paper using rig.js / head.js / body.js and returns
 * the Paper (target 'ow' 32×32 or 'tr' 80×80; view 'down' | 'up' | 'left'). The overworld set is 4 directions × 3 walk frames:
 * 0 = stand, 1 = left-foot step, 2 = right-foot step. Feet stand on the bottom row of the cell (outline on row 31), the figure
 * is centred, so the engine draws the cell at (tile x − 8, tile y − 16). Step frames lift one foot 2px, drop the body 1px and
 * swing the opposite arm.
 */
(function (root) {
  'use strict';
  const NP = (root.NP = root.NP || {});
  const HUM = (NP.art.human = NP.art.human || {});
  const L = HUM._;
  const OW = (L.ow = L.ow || {});
  const { Color } = NP;

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
    P.addRamp('white', ['#c8c8dc', '#e4e4f0', '#ffffff', '#ffffff']);
    P.addRamp('mouth', ['#7a2c3a', '#8a2a3a', '#c8505c', '#e07878']);
    P.addRamp('blush', L.ramp(Color.mix(S.skin[2], Color.parse('#f05a78'), 0.45)));
  }
  L.setupInks = setupInks;

  function accs(P, R, phase) {
    for (const a of R.S.acc) {
      const fn = L.ACC[a.type];
      if (fn) { P.begin('acc_' + a.type); fn(P, R, a, phase); }
    }
  }

  const named = (P, names) => P.partsNamed((n) => names.some((k) => n === k || n.startsWith(k + ':')));

  /** Paint one figure. pose: trainer back-view send-out pose ('windup' | 'throw' | 'follow'). Returns the Paper (call .render()). */
  function compose(S, target, view, frame, pose) {
    const T = L.TARGETS[target];
    const P = new L.Paper(T.W, T.H);
    setupInks(P, S);
    const R = L.rig(S, target, view, frame);
    R.pose = pose || null;
    const out = L.OUT[S.outfit.type] || L.OUT.tee;
    const H = L.head, B = L.body;
    // long loose hair hangs behind the body in the side view too, so the top and arm still show
    const hairFirst = view === 'down' || (view === 'left' && H.looseBack(S));
    if (hairFirst) H.hairBack(P, R);
    accs(P, R, 'back');
    B.legs(P, R);
    B.torso(P, R, out);
    B.bottom(P, R);
    out.deco(P, R);
    B.arms(P, R, out);
    accs(P, R, 'body');
    accs(P, R, 'hand');
    H.skull(P, R);
    H.face(P, R);
    H.hair(P, R);
    if (!hairFirst) H.hairBack(P, R);
    accs(P, R, 'face');
    accs(P, R, 'head');
    shade(P, R);
    return P;
  }
  L.compose = compose;

  function shade(P, R) {
    const ow = R.t === 'ow';
    const skull = P.partsNamed('skull');
    const torso = named(P, ['torso', 'neck']);
    const arms = named(P, ['armL', 'armR', 'armNear', 'armFar', 'handL', 'handR']);
    const legs = named(P, ['legL', 'legR', 'legNear', 'legFar']);
    const shoes = named(P, ['shoeL', 'shoeR', 'shoeNear', 'shoeFar']);
    const garments = P.partsNamed((n) => /^(skirt|robe|coat|apron|mapron|vest|cardi|bib|hood)/.test(n));
    // internal separation lines first (they read the untouched tones)
    P.edgeLine(torso.concat(garments), { against: arms, sides: 'lr', ink: 'deep' });
    if (!ow) P.edgeLine(arms, { against: torso, sides: 'lr', ink: 'shadow' });
    P.edgeLine(skull, { against: torso.concat(garments, P.partsNamed((n) => n.startsWith('acc_'))), sides: 'b', ink: 2 });
    // cel shading, light from the top-left
    P.cel(torso, { r: ow ? 1 : 3, b: 0, l: ow ? 0 : 1, under: skull, underD: ow ? 1 : 2 });
    P.cel(garments, { r: ow ? 1 : 3, b: ow ? 0 : 1, l: ow ? 0 : 1 });
    P.cel(arms, { r: ow ? 1 : 2, b: ow ? 0 : 1, l: ow ? 0 : 1 });
    P.cel(legs, { r: ow ? 1 : 2, l: ow ? 0 : 1 });
    P.cel(shoes, { r: ow ? 1 : 2, b: 1 });
    P.cel(skull, { r: 1, b: 0 });
    L.head.shade(P, R);
    const acc = P.partsNamed((n) => n.startsWith('acc_') || /^(cap|hat|beret|bow|satchel|backpack|belt|scarf|maidcap)/.test(n));
    for (const id of acc) P.cel([id], { r: 1, b: ow ? 0 : 1 });
  }

  OW.MAX_COLORS = 16;

  function renderFrame(S, dir, frame) {
    const view = dir === 'right' ? 'left' : dir;
    const bmp = compose(S, 'ow', view, frame).render({ outline: 'flat', maxColors: OW.MAX_COLORS });
    return dir === 'right' ? bmp.flippedX() : bmp;
  }
  OW.renderFrame = renderFrame;

  /** Build the full overworld object for a normalised spec. */
  OW.build = function (S) {
    const frames = {};
    for (const d of ['down', 'up', 'left']) frames[d] = [0, 1, 2].map((f) => renderFrame(S, d, f));
    // mirrored left: the character's left foot is on the other side, so frame 1 <-> frame 2
    frames.right = [frames.left[0].flippedX(), frames.left[2].flippedX(), frames.left[1].flippedX()];
    return { w: 32, h: 32, frames };
  };

  /** Asleep in bed, lying on her back with her head on a pillow at the SOUTH end of the bed (the player's bed has its headboard and
   *  pillows south). Built from the down-facing head (eyes closed, no hat or bag; a ponytail or pigtails let down for bed) turned upside
   *  down, so the chin points north under the sheet and the crown rests on the pillow; flipped top to bottom rather than rotated, so
   *  the light still comes from the left. Upside-down faces are read as upright, so the hair is re-shaped to say "head on a pillow":
   *  the turned-down sheet covers the neck right to the chin (no collar), the hair fans out two pixels each side from eye level so it
   *  frames the face, the crown is a rounded arc with a parting running up from it, and the fringe's dark edge (which would sit
   *  under the eyes like a moustache) is lit. A 32x16 cell, head centred, rows 0-1 empty (the sheet's hem covers them) and the face from row 2; the engine shows rows 0-12 (the
   *  rest is behind the headboard), so the crown is shaped on the last row that shows. */
  OW.asleep = function (S) {
    const down = /^(ponytail|pigtails)$/.test(S.hair.style) ? Object.assign({}, S.hair, { style: 'long' }) : S.hair;
    const S2 = Object.assign({}, S, { acc: [], hair: down, face: Object.assign({}, S.face, { eyes: 'closed', mouth: 'flat' }) });
    const full = renderFrame(S2, 'down', 0);
    // the same head with marker colours for the hair, to find which pixels are hair
    const MK = [0xff005000, 0xff008800, 0xff00c000, 0xff00f800];   // pure greens (they survive the 15-bit palette)
    const isMk = (c) => (c & 255) < 16 && ((c >> 16) & 255) < 16 && ((c >> 8) & 255) > 48;
    const marked = renderFrame(Object.assign({}, S2, { hair: Object.assign({}, S2.hair, { ramp: MK }) }), 'down', 0);
    const R = L.rig(S2, 'ow', 'down', 0);
    const chin = Math.min(full.h, R.hy + R.hh);
    let top = 0;
    while (top < chin && !full.u32.subarray(top * full.w, (top + 1) * full.w).some((c) => c >>> 24)) top++;
    // upside down into a tall scratch cell, then shifted so the face starts on row 2 (rows 0-1 take the sheet's hem); whatever
    // falls below row 12 is behind the headboard in the bed, so the crown is shaped on the last row that shows
    const W = full.w, T = 32, tmp = new Uint32Array(W * T), tmpHair = new Uint8Array(W * T);
    for (let y = top; y < chin; y++) {
      const oy = T - 1 - (y - top);
      for (let x = 0; x < W; x++) { const i = y * W + x; tmp[oy * W + x] = full.u32[i]; if (isMk(marked.u32[i])) tmpHair[oy * W + x] = 1; }
    }
    const skin0 = new Set(S.skin.map((c) => NP.Color.q15(c) >>> 0).concat(S.skin.map((c) => c >>> 0)));
    let ft = 0;
    for (let y = 0; y < T; y++) { let n = 0; for (let x = 0; x < W; x++) if (!tmpHair[y * W + x] && skin0.has(tmp[y * W + x] >>> 0)) n++; if (n >= 4) { ft = y; break; } }
    const H = 16, faceTop = 2, out = new NP.Bitmap(W, H), hair = new Uint8Array(W * H);
    for (let y = 0; y < H; y++) { const sy = ft - faceTop + y; if (sy < 0 || sy >= T) continue; for (let x = 0; x < W; x++) { out.u32[y * W + x] = tmp[sy * W + x]; hair[y * W + x] = tmpHair[sy * W + x]; } }
    let CROWN = 0;
    for (let y = 0; y < H; y++) if (out.u32.subarray(y * W, (y + 1) * W).some((c) => c >>> 24)) CROWN = y;
    CROWN = Math.min(12, CROWN);
    for (let y = CROWN + 1; y < H; y++) for (let x = 0; x < W; x++) out.u32[y * W + x] = 0;
    const lum = (c) => (c & 255) + ((c >> 8) & 255) + ((c >> 16) & 255);
    const ramp = S.hair.ramp.slice().sort((p, q) => lum(p) - lum(q));                                // dark to light
    const at = (x, y) => (x >= 0 && x < W && y >= 0 && y < H ? out.u32[y * W + x] : 0);
    const put = (x, y, c) => { if (x >= 0 && x < W && y >= 0 && y < H) out.u32[y * W + x] = c; };
    const isHair = (x, y) => x >= 0 && x < W && y >= 0 && y < H && hair[y * W + x];
    const ink = (() => { let d = 0, best = 1e9; for (const c of out.u32) if (c >>> 24 && lum(c) < best) { best = lum(c); d = c; } return d; })();
    const span = (y) => { let x0 = -1, x1 = -1; for (let x = 0; x < W; x++) if (at(x, y) >>> 24) { if (x0 < 0) x0 = x; x1 = x; } return [x0, x1]; };
    const eyeRow = faceTop + 2;
    // 1. the fringe's shaded lower edge (now just under the eyes) is lit instead
    for (let y = 1; y <= CROWN; y++) for (let x = 0; x < W; x++) if (isHair(x, y) && !isHair(x, y - 1) && at(x, y - 1) >>> 24) put(x, y, ramp[2]);
    // 2. hair fanned over the pillow: from the eye row down, two more pixels each side (one on the eye row itself), its old outline
    //    turned to hair, a new outline outside
    for (let y = eyeRow; y <= CROWN - 1; y++) {
      const [x0, x1] = span(y), d = y === eyeRow ? 1 : 2;
      if (x0 < 0) continue;
      for (let k = 0; k < d; k++) { put(x0 - k, y, ramp[2]); put(x1 + k, y, ramp[2]); }
      put(x0 - d, y, ink); put(x1 + d, y, ink);
      for (let k = 0; k <= d; k++) { hair[y * W + x0 - k] = 1; hair[y * W + x1 + k] = 1; }
    }
    // 3. a rounded crown: the last two rows pulled in (2 px, then 4 px each side) and re-inked
    const [fx0, fx1] = span(eyeRow + 1);
    for (const [y, inset] of [[CROWN - 1, 1], [CROWN, 3]]) {
      for (let x = 0; x < W; x++) if (x < fx0 + inset || x > fx1 - inset) put(x, y, 0);
      const [x0, x1] = span(y);
      if (x0 >= 0) { put(x0, y, ink); put(x1, y, ink); for (let x = x0 + 1; x < x1; x++) if (y === CROWN) put(x, y, ink); }
    }
    for (let y = CROWN - 1; y <= CROWN; y++) { const [x0, x1] = span(y); if (x0 >= 0) for (let x = x0 + 1; x < x1; x++) if (y < CROWN && !(at(x, y + 1) >>> 24)) put(x, y + 1, ink); }
    // 4. a parting running up from the crown towards the face (a darker line where the hair divides)
    const cx = (fx0 + fx1) >> 1;
    for (let y = CROWN - 1; y >= CROWN - 3; y--) if (isHair(cx, y)) put(cx, y, ramp[0]);
    // 5. nothing above the face: the neck and collar are under the sheet, whose turned-down hem (bed_blanket) the chin tucks under
    for (let y = 0; y < faceTop; y++) for (let x = 0; x < W; x++) put(x, y, 0);
    return out;
  };
})(typeof globalThis !== 'undefined' ? globalThis : window);
