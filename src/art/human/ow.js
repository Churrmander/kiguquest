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

  /** Asleep in bed: the down-facing head only (eyes closed), cropped at the chin, on a 32x32 cell with the head at the top
   *  (the bed's pillow row). The body is under the blanket, so nothing below the chin is drawn and there is no shadow. */
  OW.asleep = function (S) {
    const S2 = Object.assign({}, S, { face: Object.assign({}, S.face, { eyes: 'closed', mouth: 'flat' }) });
    const full = renderFrame(S2, 'down', 0);
    const R = L.rig(S2, 'ow', 'down', 0);
    const chin = Math.min(full.h, R.hy + R.hh + 1);
    const out = new NP.Bitmap(full.w, full.h);
    for (let y = 0; y < chin; y++) for (let x = 0; x < full.w; x++) out.u32[y * full.w + x] = full.u32[y * full.w + x];
    return out;
  };
})(typeof globalThis !== 'undefined' ? globalThis : window);
