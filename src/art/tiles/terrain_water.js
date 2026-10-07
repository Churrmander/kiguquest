/* src/art/tiles/terrain_water.js — water (grass banks), sea (sand banks), bridges. Animated, autotiled shores. */
(function (root) {
  'use strict';
  const NP = root.NP;
  const K = NP.art.tiles.kit;
  const { P, col } = K;
  const T = 16;
  const FR = 8;

  // ------------------------------------------------------------------------------------------ open-water texture
  // Wave crests: little light arcs that sway and breathe; white sparkles pop on a few frames.
  // Each mark: [x, y, phase]; drawn with a shape chosen by (frame + phase) % 8.
  const MARKS = [
    [2, 3, 0], [10, 1, 3], [6, 8, 5], [13, 10, 2], [1, 13, 6], [9, 14, 1],
  ];
  // shapes: rows of chars ('l' light, 'h' highlight); anchor top-left
  const SHAPES = [
    ['.ll.'],
    ['.lll.'],
    ['.lhl.', 'l...l'],
    ['lhhl', 'l..l'],
    ['.lll.'],
    ['.ll.'],
    ['..l.'],
    [],
  ];
  const SPARKS = [
    // [x, y, frames...] white sparkle (plus shape on the middle frame)
    [5, 5, 2, 3, 4],
    [12, 12, 6, 7, 0],
    [3, 10, 4, 5],
  ];
  function waterBase(frame, base) {
    const b = K.B(T, T);
    b.fillRect(0, 0, T, T, base || P.w3);
    // faint deeper ripples (static) for depth
    for (let y = 0; y < T; y++) for (let x = 0; x < T; x++) {
      if (((x + (y >> 2) * 5) & 7) === 0 && (y & 3) === 2) b.set(x, y, P.w4);
    }
    for (const [mx, my, ph] of MARKS) {
      const sh = SHAPES[(frame + ph) % 8];
      const sway = ((frame + ph) >> 1) % 4 === 1 ? 1 : ((frame + ph) >> 1) % 4 === 3 ? -1 : 0;
      for (let yy = 0; yy < sh.length; yy++) for (let xx = 0; xx < sh[yy].length; xx++) {
        const ch = sh[yy][xx];
        if (ch === '.') continue;
        const X = (mx + xx + sway + T) % T, Y = (my + yy) % T;
        b.set(X, Y, ch === 'h' ? P.w1 : P.w2);
      }
    }
    for (const s of SPARKS) {
      const [sx, sy] = s;
      const fr = s.slice(2);
      const k = fr.indexOf(frame);
      if (k < 0) continue;
      b.set(sx, sy, P.w0);
      if (k === 1) { b.set(sx - 1, sy, P.w1); b.set(sx + 1, sy, P.w1); b.set(sx, sy - 1, P.w1); b.set(sx, sy + 1, P.w1); }
    }
    return b;
  }
  K.waterBase = waterBase;

  // ------------------------------------------------------------------------------------------ banks
  const WPX = K.profile('water-x', 0.6, [2, 3]);
  const WPY = K.profile('water-y', 0.6, [2, 3]);

  /**
   * Shore painter. land: { c:[fill colour], line: outline colour, faceHi, face, faceDk } — the bank material.
   * In 3/4 view the north bank shows its earthen face; south/east/west banks just show the lip + a foam line.
   */
  function shore(mask, frame, land) {
    const f = K.field(mask, 8);
    const b = waterBase(frame, land.base);
    const foamOn = frame % 4 < 2;
    for (let i = 0; i < 256; i++) {
      const d = K.wob(f, i, WPX, WPY);
      if (d >= 7) continue;
      const x = i & 15, y = i >> 4;
      const ny = f.ny[i], nx = f.nx[i];
      const face = ny < -0.3 ? Math.round(-ny * 3.2) : 0; // bank face height in px (north side)
      const lip = land.lip;
      let c = 0;
      if (d < lip) c = land.fill(x, y);
      else if (d < lip + 1) c = land.line;
      else if (face > 0 && d < lip + 1 + face) {
        const k = d - lip - 1;
        c = k < 1 ? land.faceHi : k < face - 0.99 ? land.face : land.faceDk;
      } else if (face > 0 && d < lip + 2 + face) c = P.w5; // shade line on the water under the bank
      else if (d < lip + 2 + face) c = ny > 0.3 || nx !== 0 ? (foamOn ? P.w1 : P.w2) : P.w2;
      else if (d < lip + 3 + face && !foamOn && ny > 0.3) c = P.w2;
      if (c) b.u32[i] = c;
    }
    return b;
  }
  K.shore = shore;

  const GRASS_BANK = {
    lip: 2,
    fill: () => P.g2,
    line: P.g5,
    faceHi: P.d3,
    face: P.d4,
    faceDk: P.d5,
  };
  K.terrain('water', {
    water: true, encounter: 'water', autotile: true, frames: FR, animSpeed: 12, step: 'water',
    paint: (m, f) => shore(m, f, GRASS_BANK),
  });

  // sea: same water but beaches (sand banks). Shares the 'water' group so water/sea join without borders.
  const SAND_BANK = {
    lip: 2,
    fill: () => P.s1,
    line: P.s4,
    faceHi: P.s2,
    face: P.s3,
    faceDk: P.s4,
  };
  K.terrain('sea', {
    group: 'water', water: true, encounter: 'water', autotile: true, frames: FR, animSpeed: 12, step: 'water',
    paint: (m, f) => shore(m, f, SAND_BANK),
  });
})(typeof globalThis !== 'undefined' ? globalThis : window);
