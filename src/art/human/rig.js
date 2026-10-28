/* src/art/human/rig.js — body proportions ("rig") shared by the overworld (32×32) and trainer (80×80) renderers.
 *
 * A rig is the list of landmarks one frame is drawn from: skull box and per-row skull widths, shoulder / torso rows and
 * per-row torso half-widths, leg rows, shoe rows, arm sizes. Parts (head.js, body.js) only ever draw relative to a rig, so
 * the same hair style, outfit or accessory code serves both scales. Proportions follow the DS (5th-gen) look:
 * overworld ≈ 22–29px figures with a big head (raised camera, crown visible); trainer sprites ≈ 4 heads tall, full body.
 */
(function (root) {
  'use strict';
  const NP = (root.NP = root.NP || {});
  const HUM = (NP.art.human = NP.art.human || {});
  const L = HUM._;

  /** Sprite targets. foot = last row of the shoes (the outline sits one row below). u = detail scale (1 = overworld). */
  const TG = {
    ow: { W: 32, H: 32, cx: 15.5, foot: 30, u: 1, head: { w: 12, h: 10 }, neck: 0, shoe: 2, rise: 2 },
    tr: { W: 80, H: 80, cx: 39.5, foot: 77, u: 1.45, head: { w: 18, h: 17 }, neck: 2, shoe: 4, rise: 3 },
  };
  L.TARGETS = TG;

  /** Per build: torso rows, leg rows, shoulder / waist / hip half-widths, arm width, leg width (thigh), hip rows (bottom garment). */
  const BUILD = {
    ow: {
      child: { torso: 5, leg: 4, sh: 4, waist: 4, hip: 4, arm: 2, legW: 3, hipRows: 1 },
      teen: { torso: 7, leg: 6, sh: 5, waist: 4, hip: 4, arm: 2, legW: 3, hipRows: 1 },
      adult: { torso: 7, leg: 7, sh: 5, waist: 4, hip: 4, arm: 2, legW: 3, hipRows: 1 },
      tall: { torso: 7, leg: 8, sh: 5, waist: 4, hip: 4, arm: 2, legW: 3, hipRows: 1 },
      elder: { torso: 7, leg: 6, sh: 5, waist: 4, hip: 4, arm: 2, legW: 3, hipRows: 1, stoop: 1 },
      stout: { torso: 7, leg: 6, sh: 6, waist: 6, hip: 5, arm: 2, legW: 3, hipRows: 1, belly: 1 },
    },
    tr: {
      child: { torso: 15, leg: 18, sh: 8, waist: 7, hip: 7, arm: 4, legW: 6, hipRows: 3 },
      teen: { torso: 19, leg: 27, sh: 10, waist: 7, hip: 8, arm: 5, legW: 7, hipRows: 4 },
      adult: { torso: 19, leg: 28, sh: 11, waist: 8, hip: 9, arm: 5, legW: 8, hipRows: 4 },
      tall: { torso: 20, leg: 29, sh: 10, waist: 7, hip: 8, arm: 5, legW: 7, hipRows: 4 },
      elder: { torso: 19, leg: 24, sh: 10, waist: 8, hip: 9, arm: 5, legW: 7, hipRows: 4, stoop: 2 },
      stout: { torso: 20, leg: 25, sh: 13, waist: 12, hip: 11, arm: 6, legW: 9, hipRows: 4, belly: 3 },
    },
  };
  L.BUILD_GEO = BUILD;

  /** Skull half-widths per row (front/back view), top to chin. */
  const SKULL = {
    ow: [4, 5, 6, 6, 6, 6, 6, 5, 4, 3],
    tr: [5, 7, 8, 8, 9, 9, 9, 9, 9, 9, 9, 8, 8, 7, 6, 5, 3],
  };
  /** Side view (facing left): [left, right] offsets from the centre column per row. */
  const SKULL_SIDE = {
    ow: [[-4, 3], [-5, 5], [-6, 6], [-6, 6], [-6, 6], [-6, 6], [-6, 6], [-6, 5], [-5, 4], [-3, 2]],
  };

  /** Torso half-width per row r (0 = shoulder row), from the build's sh / waist / hip. */
  function torsoHW(t, g, sex, n) {
    const fem = sex === 'f';
    const sh = g.sh - (fem ? 1 : 0), waist = g.waist - (fem && t === 'tr' ? 1 : 0), hip = g.hip;
    const out = [];
    for (let r = 0; r < n; r++) {
      const f = r / Math.max(1, n - 1);
      let hw;
      if (t === 'ow') hw = r === 0 ? sh - 1 : f < 0.45 ? sh : f < 0.85 ? Math.max(waist, sh - 1) : hip;
      else {
        if (r === 0) hw = sh - 3;
        else if (r === 1) hw = sh - 1;
        else if (f < 0.4) hw = sh;
        else if (f < 0.72) hw = Math.round(sh + (waist - sh) * ((f - 0.4) / 0.32));
        else hw = Math.round(waist + (hip - waist) * ((f - 0.72) / 0.28));
      }
      if (g.belly && f > 0.3 && f < 0.95) hw += g.belly * (t === 'ow' ? (f > 0.4 && f < 0.9 ? 1 : 0) : Math.sin(((f - 0.3) / 0.65) * Math.PI) > 0.5 ? 1 : 0);
      out.push(hw);
    }
    return out;
  }

  /**
   * rig(S, target, view, frame) -> landmarks. view: 'down' | 'up' | 'left'. frame 0 stand, 1/2 step (overworld only):
   * step frames drop everything above the legs by 1px (hips drop while the legs are apart).
   */
  function rig(S, target, view, frame) {
    const T = TG[target];
    const g = BUILD[target][S.build] || BUILD[target].teen;
    const u = T.u;
    const bob = target === 'ow' && frame ? 1 : 0;
    const foot = T.foot;
    const shoeTop = foot - T.shoe + 1;
    const legTop = shoeTop - g.leg;
    const hipY = legTop - 1 + bob; // last torso row
    const shY = hipY - g.torso + 1;
    const stoop = g.stoop || 0;
    const hh = T.head.h;
    const hy = shY - T.neck - hh + 1 + stoop; // chin overlaps the shoulder row by one
    const R = {
      T, t: target, S, g, u, view, frame, bob, W: T.W, H: T.H, cx: T.cx,
      foot, shoeTop, legTop, hipY, shY, torso: g.torso, stoop,
      hy, hh, hw: T.head.w / 2, rise: T.rise,
      skull: SKULL[target], skullSide: SKULL_SIDE[target] || SKULL_SIDE.ow,
      tw: torsoHW(target, g, S.sex, g.torso),
      waistY: shY + Math.round(g.torso * 0.62),
      lead: frame === 0 ? 0 : frame === 1 ? 1 : -1, // which of the character's feet steps: 1 = left, -1 = right
    };
    R.U = (v) => Math.max(1, Math.round(v * u));
    R.mx = (x) => R.W - 1 - x; // mirror column
    R.sx = (r) => R.skull[Math.max(0, Math.min(R.skull.length - 1, r))]; // skull half-width at skull row r
    /** leftmost pixel of a centred span with half-width hw (spans are 2*hw wide) */
    R.L = (hw) => Math.round(R.cx - hw);
    R.Rt = (hw) => Math.round(R.cx + hw) - 1;
    return R;
  }
  L.rig = rig;
})(typeof globalThis !== 'undefined' ? globalThis : window);
