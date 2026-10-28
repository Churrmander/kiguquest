/* src/art/tiles/terrain_rock.js — Chapter 4+ rock ground: `cliff` (sandstone shelves of the desert and the quarry), `cave_wall`,
 * `cave_floor`, and the ore-cart rails `rail_h` / `rail_v`.
 *  - cliff / cave_wall are solid autotiles. Flat view: a rough top with a lit rim, and on every south edge the rock face drops
 *    6px in banded strata (the DS look for a ledge you can't climb). 3D view: persp_scene.js stands each cliff tile up as a block;
 *    tiles.cliff3d(kind, part, v) gives its 'top' (16x16) and 'face' (16x22) textures.
 *  - rails sit on packed dirt; walkable, no encounters. Light comes from the top-left like everything else. */
(function (root) {
  'use strict';
  const NP = root.NP;
  const K = NP.art.tiles.kit;
  const tiles = NP.art.tiles;
  const T = 16;
  K.addPal({
    // sandstone: top (warm, sunlit) and face (deeper, banded)
    ss0: '#fbe6b4', ss1: '#ecc98a', ss2: '#d9a868', ss3: '#bb844c', ss4: '#94603a', ss5: '#6a422c', ss6: '#4a2c20',
    // cave rock: cool violet-grey
    cv0: '#c8c2dc', cv1: '#a49cc0', cv2: '#837aa2', cv3: '#655c84', cv4: '#4a4266', cv5: '#332c4a', cv6: '#221c34',
    // cave floor: dusty umber with cool specks
    cf0: '#b8a088', cf1: '#a08670', cf2: '#87705c', cf3: '#6e5a4a', cf4: '#54443a',
    // rails: steel and sleepers
    rl0: '#e4ecf4', rl1: '#a8b4c4', rl2: '#6c788c', rl3: '#3c4454', sl1: '#9a6a44', sl2: '#7a4e32', sl3: '#583826',
  });
  const { P } = K;
  const ROCK = {
    // desert tops sit a step darker than the dune floor, so the walls read against the sand
    desert: { top: [P.ss1, P.ss2, P.ss2, P.ss3], face: [P.ss2, P.ss3, P.ss4, P.ss5], ink: P.ss6 },
    cave: { top: [P.cv0, P.cv1, P.cv2, P.cv3], face: [P.cv2, P.cv3, P.cv4, P.cv5], ink: P.cv6 },
    // grassy shelves (Kite Hill, Route 6): turf a step darker than the field, over an earth face
    grass: { top: [P.g1, P.g2, P.g3, P.g4], face: [P.ss2, P.ss3, P.ss4, P.ss5], ink: P.ss6, lip: P.g0, faceH: 10 },
  };
  const hf = K.hf;

  // rough top: soft light-to-dark blotches plus a few cracks, tiling seamlessly (hash on world-ish coords inside the tile)
  function topPx(x, y, v, pal) {
    const n = hf(x >> 2, y >> 2, 31 + v) * 0.75 + hf(x >> 1, y >> 1, 17 + v) * 0.25;   // broad blotches, not per-pixel grain
    let c = n > 0.45 ? pal.top[1] : pal.top[2];                                   // two tones only; cracks and rims add the rest
    // a crack: a short diagonal line per variant
    const cx = v ? 10 : 4, cy = v ? 4 : 9;
    if ((x - cx === y - cy && x >= cx && x < cx + 4) || (x - cx - 4 === cy + 3 - y && x >= cx + 4 && x < cx + 6)) c = pal.top[3];
    if ((x - cx === y - cy - 1 && x >= cx && x < cx + 4)) c = pal.top[0];
    return c;
  }
  // the cliff face: horizontal strata that wobble a little, darker towards the foot
  function facePx(x, y, h, pal) {
    const t = y / h, wob = (hf(x >> 2, 5, 9) > 0.5 ? 1 : 0);
    const band = ((y + wob) % 5);
    let k = t < 0.25 ? 0 : t < 0.55 ? 1 : t < 0.85 ? 2 : 3;
    if (band === 0 && k < 3) k++;                                   // a dark seam line between strata
    if (band === 1 && k > 0 && hf(x, y, 77) > 0.6) k--;             // light grains on top of each stratum
    if (x % 7 === 3 && hf(x, y >> 2, 51) > 0.7) k = Math.min(3, k + 1); // vertical fissures
    return pal.face[k];
  }

  function rockTile(kind) {
    const pal = ROCK[kind];
    return (mask, f, v) => {
      const fl = K.field(mask, 4);
      const b = K.B(T, T);
      const FACE = pal.faceH || 6;
      for (let i = 0; i < 256; i++) {
        const x = i & 15, y = i >> 4;
        const d = fl.d[i], nx = fl.nx[i], ny = fl.ny[i];
        let c;
        if (d < 99 && ny > 0.35 && Math.abs(nx) < 0.8 && d < FACE) {
          // south edge: the face drops away, with an ink line at the foot
          const fy = FACE - d;                                     // 0 at the lip .. FACE at the foot
          c = d < 1 ? pal.ink : facePx(x, fy, FACE, pal);
          if (fy < 1.2) c = pal.lip || pal.top[0];                 // sunlit lip
        } else if (d < 1) c = pal.ink;                             // outline on the other sides
        else if (d < 2 && (nx < -0.35 || ny < -0.35)) c = pal.top[0]; // lit rim on the north and west
        else if (d < 2) c = pal.top[3];                            // shaded rim on the east
        else c = topPx(x, y, v, pal);
        b.u32[i] = c;
      }
      return b;
    };
  }

  K.terrain('cliff', { solid: true, autotile: true, variants: 2, step: 'stone', cliff3d: 'desert', paint: rockTile('desert') });
  K.terrain('cave_wall', { solid: true, autotile: true, variants: 2, step: 'stone', cliff3d: 'cave', paint: rockTile('cave') });
  K.terrain('cliff_grass', { solid: true, autotile: true, variants: 2, step: 'step', cliff3d: 'grass', paint: rockTile('grass') });

  // ---- cave floor: packed earth with pebbles and the odd glint
  K.terrain('cave_floor', {
    variants: 3, step: 'stone',
    paint: (m, f, v) => {
      const b = K.B(T, T);
      for (let i = 0; i < 256; i++) {
        const x = i & 15, y = i >> 4;
        const n = hf(x >> 1, y >> 1, 101 + v) * 0.5 + hf(x, y, 103 + v) * 0.5;
        b.u32[i] = n > 0.86 ? P.cf0 : n > 0.3 ? P.cf1 : n > 0.1 ? P.cf2 : P.cf3;
      }
      // two pebbles with a shadow below each
      const peb = [[3 + v * 3, 4], [11 - v * 2, 11]];
      for (const [px, py] of peb) { b.set(px, py, P.cf0); b.set(px + 1, py, P.cf1); b.set(px, py + 1, P.cf4); b.set(px + 1, py + 1, P.cf4); }
      if (v === 2) b.set(8, 7, P.cv0);
      return b;
    },
  });

  // ---- puddles: the cave's tall grass (Ryukoi's cave under Hemline Lake). Shallow, so you walk through them, and wild Kigu
  //      splash out of them (encounter 'puddle'; no Paddle needed).
  K.terrain('puddle', {
    variants: 2, step: 'water', encounter: 'puddle', frames: 4, animSpeed: 16,
    paint: (m, f, v) => {
      const b = K.B(T, T);
      for (let i = 0; i < 256; i++) {
        const x = i & 15, y = i >> 4;
        const n = hf(x >> 1, y >> 1, 301 + v) * 0.5 + hf(x, y, 303 + v) * 0.5;
        b.u32[i] = n > 0.86 ? P.cf0 : n > 0.3 ? P.cf1 : P.cf2;
        const d = ((x - 7.5) / 7) ** 2 + ((y - 8.5 - v) / 5.2) ** 2;   // a wide oval of water, darker at its rim
        if (d < 1) b.u32[i] = d > 0.78 ? P.cf4 : d > 0.6 ? P.w4 : P.w3;
      }
      const r = (f + v) & 3;   // a ripple ring that comes and goes
      if (r < 3) for (let x = 5 - r; x <= 10 + r; x++) { b.set(x, 7 + v - (r >> 1), P.w2); }
      b.set(4 + v * 6, 8, P.w1);
      return b;
    },
  });
  // ---- the cave pool: deep water with rock banks. You can't paddle it, but you can fish it (fishable).
  const CAVE_BANK = { lip: 2, fill: () => P.cf1, line: P.cf4, faceHi: P.cv2, face: P.cv3, faceDk: P.cv4 };
  K.terrain('cave_pool', {
    water: true, fishable: true, autotile: true, frames: 8, animSpeed: 12, step: 'water',
    paint: (m, f) => K.shore(m, f, CAVE_BANK),
  });

  // ---- rails: two steel rails on wooden sleepers over packed dirt (rail_h runs east-west, rail_v north-south). Both are one
  //      autotiled group, so a run turns its corners with a curve and a crossing shows both ways (owner's note: the rails didn't
  //      join up). A lone tile keeps its own direction.
  function railGround(b) {
    for (let i = 0; i < 256; i++) {
      const x = i & 15, y = i >> 4;
      const n = hf(x >> 1, y >> 1, 211) * 0.5 + hf(x, y, 213) * 0.5;
      b.u32[i] = n > 0.8 ? P.cf0 : n > 0.25 ? P.cf1 : P.cf2;
    }
  }
  function straight(b, horiz, from, to) {
    const put = (a, c, col) => (horiz ? b.set(a, c, col) : b.set(c, a, col));
    // sleepers every 4px across the run
    for (let a = 1; a < 16; a += 4) if (a >= from && a + 1 <= to) for (let c = 2; c <= 13; c++) { put(a, c, c === 13 ? P.sl3 : P.sl1); put(a + 1, c, P.sl2); }
    // the two rails: lit top line, steel body, dark underside
    for (let a = from; a <= to; a++) for (const r of [4, 10]) { put(a, r, P.rl0); put(a, r + 1, P.rl1); put(a, r + 2, P.rl3); }
  }
  // a quarter turn joining two edges: arcs round the tile corner they share (rails at the same offsets as the straights)
  function curve(b, cx, cy) {
    for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) {
      const d = Math.hypot(x + 0.5 - cx, y + 0.5 - cy), ang = Math.atan2(y + 0.5 - cy, x + 0.5 - cx);
      const k = Math.round(Math.abs(ang) * 180 / Math.PI) % 22;
      if (d >= 2.5 && d <= 14 && (k === 3 || k === 4)) b.set(x, y, d > 13 ? P.sl3 : k === 3 ? P.sl1 : P.sl2);
    }
    for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) {
      const r = Math.round(Math.hypot(x + 0.5 - cx, y + 0.5 - cy));
      const col = { 12: P.rl0, 11: P.rl1, 10: P.rl3, 6: P.rl0, 5: P.rl1, 4: P.rl3 }[r];
      if (col) b.set(x, y, col);
    }
  }
  function rail(horiz) {
    return (m) => {
      const b = K.B(T, T);
      railGround(b);
      const N = !!(m & K.DIR.N), E = !!(m & K.DIR.E), S = !!(m & K.DIR.S), W = !!(m & K.DIR.W);
      const h = E || W, v = N || S;
      if (h && v && (E !== W) && (N !== S)) curve(b, E ? 16 : 0, S ? 16 : 0);   // a corner
      else if (N + E + S + W === 3) {                                         // points: the straight through, and a turnout curving off it
        if (E && W) { straight(b, true, 0, 15); curve(b, 16, N ? 0 : 16); }
        else { straight(b, false, 0, 15); curve(b, E ? 16 : 0, 0); }
      } else {
        if (v || (!h && !horiz)) straight(b, false, 0, 15);
        if (h || (!v && horiz)) straight(b, true, 0, 15);
      }
      return b;
    };
  }
  K.terrain('rail_h', { group: 'rail', autotile: true, maskMode: 'ortho', step: 'stone', paint: rail(true) });
  K.terrain('rail_v', { group: 'rail', autotile: true, maskMode: 'ortho', step: 'stone', paint: rail(false) });

  // ---- barrier: an indoor buffer beam for Salon puzzles (a timber rail on squat posts, banded yellow and black), on a stone
  //      floor. An autotile in its own group, so a run of it joins up, horizontal or vertical.
  // floor: what the fence stands on (stone in most Salons; planks in Gusset's tent, so no stone strip runs across the boards)
  const barrier = (floor, shade) => ({
    solid: true, autotile: true, maskMode: 'ortho', step: 'stone',
    paint: (m) => {
      const b = NP.terrain[floor] ? NP.terrain[floor].draw(0, 0, 0).clone() : K.B(T, T);
      const E = m & K.DIR.E, Wd = m & K.DIR.W, N = m & K.DIR.N, S = m & K.DIR.S;
      const yel = K.col('#f2c230'), yel2 = K.col('#c8941c'), blk = K.col('#2a2430'), ink = K.P.ink;
      const beamH = (x0, x1) => {
        for (let x = x0; x <= x1; x++) for (let y = 6; y <= 10; y++) b.set(x, y, y === 6 ? K.col('#fff0a0') : y === 10 ? ink : (((x + y) >> 2) & 1 ? blk : (y < 8 ? yel : yel2)));
      };
      const beamV = (y0, y1) => {
        for (let y = y0; y <= y1; y++) for (let x = 6; x <= 10; x++) b.set(x, y, x === 6 ? K.col('#fff0a0') : x === 10 ? ink : (((x + y) >> 2) & 1 ? blk : (x < 8 ? yel : yel2)));
      };
      const horiz = E || Wd || !(N || S);
      if (horiz) beamH(Wd ? 0 : 3, E ? 15 : 12);
      if (N || S) beamV(N ? 0 : 3, S ? 15 : 12);
      // a squat post with a shadow at the middle
      b.fillRect(5, 5, 6, 8, K.P.o3); b.fillRect(5, 5, 6, 1, K.P.o1); b.fillRect(5, 5, 1, 8, K.P.o2); b.fillRect(10, 5, 1, 8, K.P.o5);
      b.fillRect(5, 13, 6, 1, ink); b.fillRect(4, 14, 8, 1, K.col(shade));
      return b;
    },
  });
  K.terrain('barrier', barrier('floor_stone', '#7c7484'));
  K.terrain('barrier_wood', barrier('floor_wood', '#6a4a2a'));

  // ---- 3D: a cliff block's textures (persp_scene.js builds the geometry)
  const cache3 = new Map();
  tiles.cliff3d = function (kind, part, v) {
    const key = kind + part + v;
    let b = cache3.get(key);
    if (b) return b;
    const pal = ROCK[kind] || ROCK.desert;
    if (part === 'top') {
      b = K.B(T, T);
      for (let i = 0; i < 256; i++) b.u32[i] = topPx(i & 15, i >> 4, v & 1, pal);
    } else {
      const H = 22;
      b = K.B(T, H);
      for (let y = 0; y < H; y++) for (let x = 0; x < T; x++) b.set(x, y, y === 0 ? pal.top[0] : facePx(x + (v & 1) * 5, y, H, pal));
    }
    b.quantize15();
    cache3.set(key, b);
    return b;
  };
  tiles.CLIFF_H = 22;
})(typeof globalThis !== 'undefined' ? globalThis : window);
