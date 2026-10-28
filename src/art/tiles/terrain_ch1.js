/* src/art/tiles/terrain_ch1.js — Chapter 1 rebuild terrains and engine art:
 *   treeline_secret  the treeline's twin you can walk through (hidden paths); drawn again above actors (`overActors`)
 *   worn_grass       plain grass with a faint trampled trail running east-west (a hint that people go this way)
 *   boardwalk        weathered outdoor dock boards (Button Town's shipyard)
 *   grotto_floor     dark damp rock floor of a little stone alcove
 *   mulch            wood-chip play-area ground (Kigu Park), soft grass edge
 * plus NP.art.tiles.edgeWall(kind, wallTerrain) (the thin partition walls of def.edgeWalls) and K.DECO.boxes (window flower boxes
 * painted onto a building placed with `boxes: true`). */
(function (root) {
  'use strict';
  const NP = root.NP;
  const tiles = NP.art.tiles;
  const K = tiles.kit;
  const { P, col } = K;
  const T = 16;
  const hf = K.hf;

  // ============================================================================================ treeline_secret
  const TL = NP.terrain.treeline;
  K.terrain('treeline_secret', {
    solid: false, autotile: true, variants: TL.variants, step: 'grass', group: 'treeline', overActors: true,
    paint: (m, f, v) => TL.draw(m, f, v).clone(),
  });

  // ============================================================================================ worn_grass
  K.terrain('worn_grass', {
    variants: 2, step: 'grass', group: 'grass',
    paint: (m, f, v) => {
      const b = NP.terrain.grass.draw(255, 0, v).clone();
      // a trodden band through the middle: blades pressed flat (paler), a few bare patches; it fades at the band's edges
      for (let x = 0; x < T; x++) {
        const wob = Math.round(Math.sin((x + v * 5) * 0.55) * 1.2);
        for (let y = 6 + wob; y <= 10 + wob; y++) {
          const edge = y === 6 + wob || y === 10 + wob;
          const r = hf(x, y, 77 + v);
          if (edge && r < 0.55) continue;
          b.set(x, y, r < 0.18 ? P.d2 : r < 0.5 ? P.g1 : P.g2);
        }
        if (hf(x, v, 79) < 0.25) b.set(x, 8 + wob, P.d1);
      }
      return b;
    },
  });

  // ============================================================================================ boardwalk
  K.terrain('boardwalk', {
    variants: 3, step: 'wood',
    paint: (m, f, v) => {
      const b = K.B(T, T);
      const BW = ['#d8c8a8', '#c0ac88', '#a08c6c', '#7c6a54', '#54483c'].map(col);
      // planks run east-west, 4 px each; each plank has its own grain, butt joints offset row to row
      for (let row = 0; row < 4; row++) {
        const y0 = row * 4, joint = (row * 7 + v * 5) % 16;
        for (let y = y0; y < y0 + 4; y++) for (let x = 0; x < T; x++) {
          let c = BW[1];
          if (y === y0) c = BW[0];
          else if (y === y0 + 3) c = BW[4];
          else if (hf(x >> 1, y, 31 + row + v * 4) < 0.22) c = BW[2];
          if (x === joint && y !== y0 + 3) c = BW[3];
          b.set(x, y, c);
        }
        b.set((joint + 2) & 15, y0 + 1, BW[4]); b.set((joint + 13) & 15, y0 + 2, BW[4]);    // nail heads
      }
      if (v === 2) { b.set(4, 6, BW[3]); b.set(5, 6, BW[3]); b.set(9, 10, BW[3]); }          // a knot or two
      return b;
    },
  });

  // ============================================================================================ grotto_floor
  K.terrain('grotto_floor', {
    variants: 2, step: 'stone',
    paint: (m, f, v) => {
      const b = K.B(T, T);
      for (let i = 0; i < 256; i++) {
        const x = i & 15, y = i >> 4;
        const n = hf(x >> 1, y >> 1, 141 + v) * 0.6 + hf(x, y, 143 + v) * 0.4;
        b.u32[i] = n > 0.88 ? P.v2 : n > 0.4 ? P.v4 : n > 0.12 ? P.v5 : P.v6;
      }
      // a damp sheen and a couple of pebbles
      b.hline(3 + v * 4, 5, 3, P.v3); b.set(4 + v * 4, 4, P.v2);
      for (const [x, y] of [[11 - v * 6, 11], [6, 13 - v * 3]]) { b.set(x, y, P.v1); b.set(x + 1, y, P.v2); b.set(x, y + 1, P.v6); b.set(x + 1, y + 1, P.v6); }
      return b;
    },
  });

  // ============================================================================================ mulch
  K.terrain('mulch', {
    autotile: true, variants: 2, step: 'grass',
    paint: (m, f, v) => {
      const fl = K.field(m, 5), b = K.B(T, T);
      const grass = NP.terrain.grass.draw(255, 0, v);
      for (let i = 0; i < 256; i++) {
        const x = i & 15, y = i >> 4, d = fl.d[i];
        if (d < 1) { b.u32[i] = grass.u32[i]; continue; }
        if (d < 2) { b.u32[i] = fl.ny[i] < -0.3 ? P.g4 : P.b3; continue; }   // a soft lip where the chips meet the grass
        const r = hf(x, y, 151 + v), r2 = hf(x >> 1, y, 153 + v);
        b.u32[i] = r < 0.12 ? P.o1 : r < 0.3 ? P.o2 : r2 < 0.5 ? P.o3 : r < 0.85 ? P.b2 : P.o4;
      }
      // chip flakes: short light dashes with a dark under-edge
      for (let k = 0; k < 6; k++) {
        const x = Math.floor(hf(k, v, 155) * 13) + 1, y = Math.floor(hf(k, v, 157) * 13) + 1;
        if (fl.d[y * T + x] < 3) continue;
        b.set(x, y, P.o0); b.set(x + 1, y, P.o1); b.set(x, y + 1, P.o5);
      }
      return b;
    },
  });

  // ============================================================================================ edge walls (thin partitions)
  // Matches wall_wood (wall plaster/stone take their own tones): a 3px wall-top cap with a lit edge and a 5px plank face below it.
  const EW = {
    wall_wood: { cap: P.o4, hi: P.o2, dk: P.o6, face: [P.o3, P.o2, P.o4], base: P.o6 },
    wall_plaster: { cap: P.p3, hi: P.p1, dk: P.p5, face: [P.p1, P.p0, P.p2], base: P.o4 },
    wall_stone: { cap: P.n4, hi: P.n2, dk: P.n6, face: [P.n3, P.n2, P.n4], base: P.n6 },
  };
  const ewCache = new Map();
  tiles.edgeWall = function (kind, wall) {
    const k = kind + '|' + wall;
    if (ewCache.has(k)) return ewCache.get(k);
    const c = EW[wall] || EW.wall_wood;
    let b;
    if (kind === 'v') {            // a vertical partition seen from above: just its 4px top cap
      b = K.B(4, T);
      b.fillRect(0, 0, 4, T, c.cap); b.vline(0, 0, T, c.hi); b.vline(3, 0, T, c.dk); b.vline(1, 0, T, c.hi);
    } else if (kind === 'vend') {  // the south end of a vertical partition: its face
      b = K.B(4, 5);
      b.fillRect(0, 0, 4, 5, c.face[0]); b.vline(0, 0, 5, c.face[1]); b.vline(3, 0, 5, c.face[2]); b.hline(0, 4, 4, c.base);
    } else {                       // horizontal: cap (rows 0-2) over the edge, face (rows 3-7) hanging over the south tile
      b = K.B(T, 8);
      b.fillRect(0, 0, T, 3, c.cap); b.hline(0, 0, T, c.hi); b.hline(0, 2, T, c.dk);
      for (let x = 0; x < T; x++) { const lx = x & 3; b.fillRect(x, 3, 1, 4, lx === 3 ? c.face[2] : lx === 0 ? c.face[1] : c.face[0]); }
      b.hline(0, 7, T, c.base);
      if (kind === 'hw') { b.vline(0, 0, 8, c.dk); }
      if (kind === 'he') { b.vline(15, 0, 8, c.dk); }
    }
    b = b.quantize15();
    ewCache.set(k, b);
    return b;
  };

  // ============================================================================================ deco: window flower boxes
  // Painted onto a building placed with `boxes: true`: a planter box either side of the door (door-1/door+1; door-2/door+2 on a
  // 7-wide building), on the bottom wall row above the plinth. 2D and the 3D facade both use it.
  K.DECO = K.DECO || {};
  const BLOOMS = [[P.pk2, P.yl2, P.pk1, P.yl1], [P.yl2, P.pk2, P.yl1, P.pk1]];
  K.DECO.boxes = function (b, def, variant) {
    let dcol = -1;
    const last = def.solid[def.h - 1];
    for (let x = 0; x < def.w; x++) if (last[x] === 'D') { dcol = x; break; }
    if (dcol < 0) dcol = def.w >> 1;
    const off = def.w >= 7 ? 2 : 1, y = b.h - 13;
    let i = 0;
    for (const cx of [dcol - off, dcol + off]) {
      if (cx < 0 || cx >= def.w) continue;
      const x = cx * T + 2;
      K.S.flowerBox(b, x, y, 12, BLOOMS[i++ & 1]);
      b.hline(x, y + 3, 12, P.o6);
      for (let k = 0; k < 12; k += 2) b.set(x + k, y - 2, b.get(x + k, y - 2) || P.f3);
    }
    return b;
  };
})(typeof globalThis !== 'undefined' ? globalThis : window);
