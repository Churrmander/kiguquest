/* src/art/tiles/terrain_bridge.js — bridge_h / bridge_v: walkable wooden plank bridges laid over animated water.
 * Each tile is one bridge section that repeats seamlessly end to end (a 1-wide span of any length). The water underneath is the
 * very same animated texture as terrain `water` (same frames / speed, so the two stay in sync), seen through the rail gaps.
 *
 * Cross-section (distance `w` from the near edge): rail 0-2, water gap 3-4, deck 5-10 (two plank strips), water gap 11-12, rail 13-15.
 * Along the span (`u`, period 16): a newel post at u 0-1, butt joints at u 0 (strip A) and u 8 (strip B) — bricklaid like planks.
 * Variants (picked by map position): 0 plain, 1 red cloth patch stitched onto a plank, 2 ribbon bow on the post + a knot in the wood.
 * Registered in the 'water' group so neighbouring water tiles join up with the bridge instead of drawing a bank against it. */
(function (root) {
  'use strict';
  const NP = root.NP;
  const K = NP.art.tiles.kit;
  const { P } = K;

  // rails: [outline, top face, front face] for the near/back rail, [top face, front, outline] for the far/front rail
  const RAIL_A = [P.o5, P.o1, P.o3];
  const RAIL_B_H = [P.o0, P.o2, P.o5];
  const RAIL_B_V = [P.o1, P.o3, P.o5];
  const PLANK = [P.o1, P.o2, P.o4]; // lit top row, body, seam shadow

  function bridge(vertical, frame, variant) {
    const b = K.waterBase(frame);
    const px = (u, w, c) => (vertical ? b.set(w, u, c) : b.set(u, w, c));
    const railB = vertical ? RAIL_B_V : RAIL_B_H;

    // rails
    for (let u = 0; u < 16; u++) {
      for (let k = 0; k < 3; k++) { px(u, k, RAIL_A[k]); px(u, 13 + k, railB[k]); }
      // shade under the first rail and under the deck edge, onto the water
      px(u, 3, P.w4); px(u, 11, P.w4);
    }
    // newel posts across the rails and the water gaps
    for (const [w0, w1] of [[0, 4], [11, 15]]) {
      for (let w = w0; w <= w1; w++) {
        const cap = w === 1 || w === 13;
        const edge = w === 0 || w === 15;
        px(0, w, edge ? P.o5 : cap ? P.o0 : P.o2);
        px(1, w, edge ? P.o5 : cap ? P.o1 : P.o4);
      }
    }
    // deck: two plank strips of three rows, joints staggered
    for (let u = 0; u < 16; u++) {
      for (let k = 0; k < 3; k++) { px(u, 5 + k, PLANK[k]); px(u, 8 + k, PLANK[k]); }
    }
    const joint = (u0, w0) => {
      px(u0, w0, P.o4); px(u0, w0 + 1, P.o4);
      px(u0 + 1, w0, P.o0);                       // lit plank end
      px(u0 + 2, w0 + 1, P.o3);                   // nail
    };
    joint(0, 5); joint(8, 8);

    if (variant === 1) {
      // red cloth patch sewn over strip B
      for (let u = 10; u <= 14; u++) { px(u, 8, P.red1); px(u, 9, P.red2); px(u, 10, P.red3); }
      px(10, 8, P.p1); px(14, 8, P.p1); px(12, 9, P.p1);
    } else if (variant === 2) {
      // bow tied on the newel post, a knot in strip A
      px(0, 1, P.red1); px(1, 1, P.red2); px(0, 2, P.red2); px(1, 2, P.red3); px(1, 3, P.red3);
      px(5, 6, P.o3); px(6, 6, P.o3); px(5, 5, P.o4); px(6, 5, P.o4);
    }
    return b;
  }

  const common = { water: false, encounter: null, group: 'water', autotile: false, variants: 3, frames: 8, animSpeed: 12, step: 'wood' };
  K.terrain('bridge_h', Object.assign({ paint: (m, f, v) => bridge(false, f, v) }, common));
  K.terrain('bridge_v', Object.assign({ paint: (m, f, v) => bridge(true, f, v) }, common));
})(typeof globalThis !== 'undefined' ? globalThis : window);
