/* src/art/tiles/terrain_ch1.js — Chapter 1 rebuild terrains and engine art:
 *   treeline_secret  the treeline's twin you can walk through (hidden paths); drawn again above actors (`overActors`)
 *   worn_grass       plain grass with a faint trampled trail running east-west (a hint that people go this way)
 *   boardwalk        weathered outdoor dock boards (Button Town's shipyard)
 *   grotto_floor     the damp rock shelf at the back of Button Town's pond grotto (water group: it draws its own wet edge)
 *   grotto_rock      the low outcrop of mossy boulders round that grotto (a cliff: blocks 28-32 px tall in 3D, see tiles.cliffHeight)
 *   grotto_water(_deep)  the pond running into the cave, darkening into shadow (paddle)
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
  // The rock shelf at the back of Button Town's grotto (the Wish Candy's ledge): a damp, rounded shelf in shade that meets the
  // rock wall on its north and east sides and slopes into the dark cave water on its west and south. It is in the water autotile
  // group, so the cave water beside it draws no bank against it: the shelf draws its own wet edge.
  K.terrain('grotto_floor', {
    group: 'water', variants: 1, step: 'stone',
    paint: () => {
      const b = K.B(T, T);
      for (let i = 0; i < 256; i++) {
        const x = i & 15, y = i >> 4;
        // the shelf: the tile minus a rounded bite out of its south-west corner; edge = distance in from the water
        const ex = x + 0.5 - 1.5, ey = 14.5 - (y + 0.5), r = Math.hypot(Math.max(0, 6 - ex), Math.max(0, 6 - ey));
        if (ex < 0 || ey < 0 || r > 6) { b.u32[i] = ((x * 3 + y * 5) & 7) === 0 ? P.w5 : P.w6; continue; }
        const edge = Math.min(ex, ey, 6 - r);
        const n = hf(x >> 1, y >> 1, 241) * 0.7 + hf(x, y, 243) * 0.3;
        let c = edge < 1 ? P.r6 : edge < 2 ? P.r5 : n > 0.62 ? P.r3 : n > 0.3 ? P.r4 : P.v4;
        if (y < 2) c = y === 0 ? P.r6 : P.r5;                        // the foot of the rock wall behind it
        if (x > 13) c = x === 15 ? P.r6 : P.r5;
        b.u32[i] = c;
      }
      // the wet rim catching the light from the mouth, and a drip or two
      for (let x = 2; x < 9; x++) b.set(x, 13 - (x > 6 ? x - 6 : 0), P.w4);
      for (let y = 6; y < 11; y++) b.set(1, y, P.w5);
      b.set(9, 4, P.r2); b.set(10, 5, P.r6); b.set(5, 8, P.r2); b.set(6, 9, P.r6);   // pebbles
      return b;
    },
  });

  // ============================================================================================ the pond grotto's outcrop
  // grotto_rock: a low cliff of stacked, mossy boulders (Button Town, on the pond's east bank). A solid autotile like `cliff`: the
  // flat view shows a mossy top with bare rock lumps, a lit rim on the north and west, and on every south edge a 9 px face of
  // boulders with moss hanging over the lip. In 3D (cliff3d 'grotto') each tile stands up as a block 26-35 px tall (picked per
  // tile, so the skyline steps like piled boulders); the cave's roof and its west-facing mouth are the stamp `grotto_mouth`.
  // grotto_water / grotto_water_deep: the pond running into the cave (water group, paddle). The mouth tile darkens from pond blue
  // at its west edge into shadow; the deep tile is in full shade. Both have a wet rock bank where they meet the rock.
  const GR = { rim: P.r0, lit: P.r1, mid: P.r2, dk: P.r3, rimDk: P.r4, ink: P.r5, moss: [P.g2, P.f2, P.f3, P.f4] };
  const GR_FACE = 9, GR_H3 = 36;   // GR_H3: the 3D face texture's height (the tallest block)
  // Rounded boulders packed together: seeds [cx, cy, r] in a cell that repeats every px/py pixels (so a tile meets itself and
  // every variant seamlessly). Each pixel belongs to the boulder it is deepest inside; it is shaded like a ball lit from the top
  // left, with a dark crevice where two boulders meet. Moss sits on the upward-facing caps (variant-dependent, inside the tile).
  function boulder(x, y, seeds, px, py, v, mossy) {
    let best = 9, b2 = 9, bx = 0, by = 0, br = 1;
    for (const [cx, cy, r] of seeds) for (const ox of px ? [-px, 0, px] : [0]) for (const oy of py ? [-py, 0, py] : [0]) {
      const dx = x + 0.5 - cx - ox, dy = y + 0.5 - cy - oy, d = Math.hypot(dx, dy) / r;
      if (d < best) { b2 = best; best = d; bx = dx / r; by = dy / r; br = r; } else if (d < b2) b2 = d;
    }
    if (best > 1.05 || b2 - best < 0.16 * (4 / br)) return GR.ink;             // gaps and crevices
    if (b2 - best < 0.3 * (4 / br) || best > 0.9) return by > -0.2 ? GR.rimDk : GR.dk;   // the rolled-under edge
    const l = -bx * 0.55 - by * 0.75;
    if (mossy && by < -0.3 && hf(x >> 1, y, 231 + v) > 0.32) return by < -0.62 && hf(x, y, 233 + v) > 0.6 ? GR.moss[0] : l > 0.35 ? GR.moss[1] : GR.moss[2];
    return l > 0.42 ? GR.rim : l > 0.05 ? GR.lit : l > -0.35 ? GR.mid : GR.dk;
  }
  // the top, seen from above: boulder tops, mostly furred with moss
  const TOP_SEEDS = [[4, 4, 4.6], [12, 3, 4.2], [8, 10.5, 4.8], [15.5, 11, 3.6], [2, 13.5, 3.4]];
  // a second layout for variants 2-3, so the 16 px repeat breaks up (variants are picked per tile by position)
  const TOP_SEEDS2 = [[3, 3, 4.2], [11, 5, 4.8], [6, 12, 4.4], [14, 13, 3.8], [0, 8, 3.2]];
  function grottoTop(x, y, v) {
    const c = boulder(x, y, v & 2 ? TOP_SEEDS2 : TOP_SEEDS, 16, 16, v & 1, false);
    if (c === GR.ink) return GR.moss[3];                                        // moss fills the gaps between them
    // moss in soft clumps of a few px (a coarse blob field, roughened at 1 px), not per-pixel static
    const n = hf(x >> 2, y >> 2, 211 + v) * 0.65 + hf(x >> 1, y >> 1, 212 + v) * 0.2 + hf(x, y, 214 + v) * 0.15;
    if (c !== GR.rim && n > 0.46) return n > 0.8 ? GR.moss[0] : c === GR.dk || c === GR.rimDk ? GR.moss[2] : GR.moss[1];
    return c;
  }
  // the faces: the flat view's 9 px south face (one course of small boulders), the 3D block's 30 px face (two courses and a
  // few pebbles; repeats every 16 px across)
  const FACE_SEEDS = [[3, 5, 4.4], [10, 4.5, 4], [15.5, 6, 3.6]];
  const FACE3_SEEDS = [[4, 6, 5.6], [12, 5, 5.2], [0, 16.5, 6], [8.5, 17.5, 5.8], [16, 17, 5], [4, 28, 6.2], [12.5, 29, 5.6], [8, 35, 3]];
  function grottoFace(x, y, h, v, tall) {
    return tall ? boulder(x, y, FACE3_SEEDS, 16, 0, v, true) : boulder(x, y, FACE_SEEDS, 16, 0, v, true);
  }
  K.terrain('grotto_rock', {
    solid: true, autotile: true, variants: 4, step: 'stone', cliff3d: 'grotto',
    paint: (mask, f, v) => {
      const fl = K.field(mask, 4), b = K.B(T, T);
      for (let i = 0; i < 256; i++) {
        const x = i & 15, y = i >> 4, d = fl.d[i], nx = fl.nx[i], ny = fl.ny[i];
        let c;
        if (d < 99 && ny > 0.35 && Math.abs(nx) < 0.8 && d < GR_FACE) {
          const fy = Math.floor(GR_FACE - d);
          c = d < 1 ? GR.ink : grottoFace(x, fy, GR_FACE, v & 1, false);
          if (fy === 0) c = hf(x, 3, 225 + v) > 0.5 ? GR.moss[1] : GR.moss[2];   // moss spilling over the lip
        } else if (d < 1 + (hf(x >> 1, y >> 1, 229 + v) > 0.6 ? 1 : 0)) c = GR.ink;   // a ragged ink edge, like rounded boulders
        else if (d < 2 && (nx < -0.35 || ny < -0.35)) c = hf(x, y, 227 + v) > 0.8 ? GR.rim : hf(x, y, 228 + v) > 0.45 ? GR.lit : GR.mid;   // a broken lit rim, not a kerb
        else if (d < 2) c = GR.dk;
        else c = grottoTop(x, y, v);
        b.u32[i] = c;
      }
      return b;
    },
  });
  // 3D: textures for the cliff blocks (persp_scene.js builds them); other kinds fall through to terrain_rock.js
  const cliffBase = tiles.cliff3d, cliffHBase = tiles.cliffHeight;
  const g3 = new Map();
  tiles.cliff3d = function (kind, part, v) {
    if (kind !== 'grotto') return cliffBase(kind, part, v);
    const key = part + v;
    let b = g3.get(key);
    if (b) return b;
    if (part === 'top') { b = K.B(T, T); for (let i = 0; i < 256; i++) b.u32[i] = grottoTop(i & 15, i >> 4, v & 1); }
    else b = tiles.grottoFace3d(T, v & 1, 0, GR_H3);
    b.quantize15();
    g3.set(key, b);
    return b;
  };
  // a jumble of heights, so the outcrop's skyline steps up and down like piled boulders, never a wall
  tiles.cliffHeight = (kind, x, y) => (kind === 'grotto' ? [28, 30, 32, 31, 29][K.h32(x, y, 47) % 5] : cliffHBase ? cliffHBase(kind, x, y) : tiles.CLIFF_H);
  /** a w x 30 boulder face for the 3D blocks (and the grotto mouth's west face): two courses of boulders, a dark wet band at the
   *  waterline. x0 shifts the pattern so a wide face lines up with the blocks beside it. */
  tiles.grottoFace3d = function (w, v, x0, h) {
    const H = h || GR_H3, b = K.B(w, H);
    for (let y = 0; y < H; y++) for (let x = 0; x < w; x++) {
      const tx = (x + x0) & 15, vv = (v + (((x + x0) >> 4) & 1)) & 1;
      let c = grottoFace(tx, y + GR_H3 - H, GR_H3, vv, true);   // a shorter face is the bottom of the tall one
      if (y >= H - 3 && c !== GR.ink) c = y === H - 1 ? GR.ink : GR.rimDk;   // the wet line where the rock meets the water
      if (y === 0 && c !== GR.ink) c = GR.moss[1];                                     // the moss of the top, seen over the edge
      b.set(x, y, c);
    }
    return b;
  };
  tiles.grottoTop = grottoTop;
  tiles.GROTTO_H3 = GR_H3;

  // the cave water: pond water with its light marks pushed down into shadow; a wet rock bank against the rock
  const ROCK_BANK = { lip: 2, fill: () => P.r4, line: P.r5, faceHi: P.r3, face: P.r4, faceDk: P.r5 };
  const DARK_BANK = { lip: 1, fill: () => P.r5, line: P.r6, faceHi: P.r4, face: P.r5, faceDk: P.r6 };
  const DARKER = new Map([[P.w0, P.w3], [P.w1, P.w4], [P.w2, P.w4], [P.w3, P.w5], [P.w4, P.w6], [P.w5, P.w6]]);
  const DARKEST = new Map([[P.w0, P.w4], [P.w1, P.w5], [P.w2, P.w5], [P.w3, P.w6], [P.w4, P.w5], [P.w5, P.w6]]);   // ripples stay a step lighter than the base
  const shadeWater = (b, from) => {
    for (let i = 0; i < 256; i++) {
      const x = i & 15, y = i >> 4, c = b.u32[i];
      // from: column where the shade begins (mouth: a dithered ramp from the pond side; deep: everywhere)
      const k = (x - from) / 6 + ((x + y) & 1) * 0.35;
      const m = k >= 1 ? DARKEST : k >= 0 ? DARKER : null;
      if (m && m.has(c)) b.u32[i] = m.get(c);
    }
    return b;
  };
  K.terrain('grotto_water', {
    group: 'water', water: true, paddle: true, autotile: true, frames: 8, animSpeed: 12, step: 'water',
    paint: (m, f) => shadeWater(K.shore(m, f, ROCK_BANK), 2),
  });
  // grotto_shore: plain pond water where it laps the outcrop, so the rock meets the water with a wet rock bank (no grass strip)
  K.terrain('grotto_shore', {
    group: 'water', water: true, paddle: true, encounter: 'water', autotile: true, frames: 8, animSpeed: 12, step: 'water',
    paint: (m, f) => K.shore(m, f, ROCK_BANK),
  });
  K.terrain('grotto_water_deep', {
    group: 'water', water: true, paddle: true, autotile: true, frames: 8, animSpeed: 12, step: 'water',
    paint: (m, f) => shadeWater(K.shore(m, f, DARK_BANK), -8),
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
    const sides = def.boxSides || [true, true];   // a stamp whose facade already has a sill box on one side skips that side
    for (const [k, cx] of [dcol - off, dcol + off].entries()) {
      if (cx < 0 || cx >= def.w || !sides[k]) continue;
      const x = cx * T + 2;
      K.S.flowerBox(b, x, y, 12, BLOOMS[i++ & 1]);
      b.hline(x, y + 3, 12, P.o6);
      for (let k = 0; k < 12; k += 2) b.set(x + k, y - 2, b.get(x + k, y - 2) || P.f3);
    }
    return b;
  };
})(typeof globalThis !== 'undefined' ? globalThis : window);
