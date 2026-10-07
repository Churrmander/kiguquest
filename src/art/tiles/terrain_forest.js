/* src/art/tiles/terrain_forest.js — solid outdoor barriers: treeline (dense forest wall), hedge, fence, and the one-way ledges. */
(function (root) {
  'use strict';
  const NP = root.NP;
  const K = NP.art.tiles.kit;
  const { P, col } = K;
  const T = 16;

  // ============================================================================================ treeline
  // A periodic (torus) canopy texture made of leafy lobes, so every tile is seamless with every other one. Variants share
  // the same lobe layout (outlines line up) and differ only in highlights / specks.
  const CANOPY_TN = K.tn('f1', 'f2', 'f3', 'f4', 'f5');
  const CANOPY_LOBES = [[4, 3, 5, 4], [12, 4, 4, 4], [3, 11, 4, 5], [11, 12, 5, 4], [8, 8, 4, 4]];
  const canopyCache = [];
  function canopyTile(v) {
    if (canopyCache[v]) return canopyCache[v];
    const b = K.B(T, T);
    b.fillRect(0, 0, T, T, col('f6'));
    const order = CANOPY_LOBES.map((l, i) => [l, i]).sort((p, q) => p[0][1] - q[0][1]);
    for (const [l, i] of order) K.lobe(b, l[0], l[1], l[2], l[3], CANOPY_TN, { wrap: [T, T], hi: v === 0 ? i % 2 === 0 : i % 2 === 1 });
    // a few leaf specks
    const r = K.rng('canopy' + v);
    for (let n = 0; n < 7; n++) {
      const x = r.int(T), y = r.int(T);
      const c = b.get(x, y);
      if (c === col('f3')) b.set(x, y, col('f2'));
      else if (c === col('f2')) b.set(x, y, col('f1'));
    }
    canopyCache[v] = b;
    return b;
  }
  const TREE_BUMP = K.scallop(2, 2.2, 0);
  const TREE_BUMP_S = K.scallop(2, 2, 0);

  K.terrain('treeline', {
    solid: true, autotile: true, variants: 2, step: 'grass',
    paint: (mask, f, v) => {
      const fl = K.field(mask, 6);
      const can = canopyTile(v);
      const b = K.B(T, T);
      const green = col('g2');
      for (let i = 0; i < 256; i++) {
        const x = i & 15, y = i >> 4;
        let c = can.u32[i];
        if (fl.d[i] < 99) {
          const d = fl.d[i];
          const ny = fl.ny[i], nx = fl.nx[i];
          if (ny > 0.35 && Math.abs(nx) < 0.6) {
            // south edge: the canopy ends and trunks stand on shaded ground
            const bump = TREE_BUMP_S[x];
            const lim = 5.5 + (2 - bump);          // canopy bottom (distance from tile bottom), hangs lower in bump centres
            if (d < lim - 1) {
              // ground + trunks
              const tx = x % 8;
              const trunk = tx >= 2 && tx <= 4 && d > 0.9;
              if (trunk) {
                c = tx === 2 ? col('b1') : tx === 3 ? col('b2') : col('b3');
                if (d < 1.9) c = tx === 4 ? col('b4') : col('b3');            // root flare
                if (d > lim - 2.4) c = col('b4');                              // shaded under the canopy
              } else if (tx === 5 && d > 0.9 && d < lim - 2) c = col('g4');   // shadow right of the trunk
              else c = d < 1.6 ? col('g2') : d < 3.6 ? col('g3') : col('g4');
              if (tx === 1 && d > 0.9 && d < 3) c = col('g3');
            } else if (d < lim) c = col('f6');                                   // canopy outline
            // else canopy texture
          } else {
            const prof = Math.abs(ny) > Math.abs(nx) ? TREE_BUMP[x] : TREE_BUMP[y];
            const wd = d + prof - 2.2;
            if (wd < 0) c = green;
            else if (wd < 1) c = col('f6');
            else if (wd < 2 && (nx > 0.3 || ny > 0.3)) c = col('f5');                // shaded lower/right rim
            else if (wd < 2 && (ny < -0.5 || nx < -0.5)) c = K.band ? can.u32[i] : c;
          }
        }
        b.u32[i] = c;
      }
      return b;
    },
  });

  // ============================================================================================ hedge
  const HEDGE_TOP = [[3, 3, 3.5, 3], [11, 4, 3.5, 3.5], [7, 9, 4, 3.5], [14, 11, 3, 3.5], [2, 13, 3, 3]];
  const hedgeTopCache = [];
  function hedgeTop() {
    if (hedgeTopCache[0]) return hedgeTopCache[0];
    const b = K.B(T, T);
    b.fillRect(0, 0, T, T, col('f4'));
    const order = HEDGE_TOP.slice().sort((p, q) => p[1] - q[1]);
    for (const l of order) K.lobe(b, l[0], l[1], l[2], l[3], K.tn('f0', 'f1', 'f2', 'f3', 'f4'), { wrap: [T, T] });
    hedgeTopCache[0] = b;
    return b;
  }
  K.terrain('hedge', {
    solid: true, autotile: true, variants: 1, step: 'grass',
    paint: (mask) => {
      const fl = K.field(mask, 5);
      const top = hedgeTop();
      const b = K.B(T, T);
      for (let i = 0; i < 256; i++) {
        const x = i & 15, y = i >> 4;
        const d = fl.d[i], ny = fl.ny[i], nx = fl.nx[i];
        let c = top.u32[i];
        if (d < 99) {
          const southFace = ny > 0.4 && Math.abs(nx) < 0.75;
          if (southFace) {
            // clipped front face of the hedge: darker, vertical leaf strokes; ground shadow under it
            if (d < 1) c = col('f6');
            else if (d < 2) c = col('g4');
            else if (d < 6) {
              c = (x + (d < 4 ? 1 : 0)) % 4 < 2 ? col('f3') : col('f4');
              if (d > 5) c = col('f5');
              if ((x * 3 + Math.floor(d)) % 7 === 0 && d < 5) c = col('f2');
            } else c = col('f6');
            if (d < 2 && d >= 1 && (x % 4 === 1)) c = col('g3');
          } else if (d < 1) c = col('f6');
          else if (d < 2) c = nx < -0.3 || ny < -0.3 ? col('f1') : col('f5');
          if (d < 1 && (nx < -0.9 || nx > 0.9) && y > 12 && ny > 0) c = col('f6');
          // outside the rounded outline: grass
          if (d < 0.5 + 0 && false) c = col('g2');
        }
        b.u32[i] = c;
      }
      // rounded outer corners leave grass behind: paint grass where the field says we are outside
      for (let i = 0; i < 256; i++) {
        if (fl.d[i] < 0.001) b.u32[i] = col('g2');
      }
      return b;
    },
  });

  // ============================================================================================ fence
  // Wooden rail fence, connects N/E/S/W (ortho mask). Posts sit in the tile centre; rails run to connected sides.
  const FENCE_BG = (x, y) => col('g2');
  K.terrain('fence', {
    solid: true, autotile: true, maskMode: 'ortho', variants: 1, step: 'wood',
    paint: (m) => {
      const b = K.B(T, T);
      b.fillRect(0, 0, T, T, col('g2'));
      const N = !!(m & K.DIR.N), E = !!(m & K.DIR.E), S = !!(m & K.DIR.S), W = !!(m & K.DIR.W);
      const gr = (x, y, c) => b.set(x, y, col(c));
      // little grass tufts so the tile is not dead flat
      gr(2, 2, 'g1'); gr(3, 2, 'g1'); gr(12, 14, 'g3'); gr(13, 14, 'g3');
      // rails (drawn before the post)
      const rail = (x0, x1) => {
        for (let x = x0; x <= x1; x++) {
          // upper rail y 5..6, lower rail y 9..10
          b.set(x, 5, col('o0')); b.set(x, 6, col('o2')); b.set(x, 7, col('o4'));
          b.set(x, 9, col('o1')); b.set(x, 10, col('o3')); b.set(x, 11, col('o5'));
          b.set(x, 8, col('g3'));
          b.set(x, 12, col('g4')); b.set(x, 13, col('g3'));
        }
      };
      if (W) rail(0, 7);
      if (E) rail(8, 15);
      // vertical run: a beam seen end-on stacking away from the viewer
      const beam = (y0, y1) => {
        for (let y = y0; y <= y1; y++) {
          b.set(6, y, col('o1')); b.set(7, y, col('o2')); b.set(8, y, col('o3')); b.set(9, y, col('o5'));
          b.set(10, y, col('g4'));
          if (y % 8 === 3) { b.set(6, y, col('o0')); b.set(7, y, col('o1')); }
        }
      };
      if (N) beam(0, 6);
      if (S) beam(9, 15);
      // post
      const px = 6, py = 3;
      b.fillRect(px, py + 2, 4, 10, col('o2'));
      b.fillRect(px, py + 2, 1, 10, col('o1'));
      b.fillRect(px + 3, py + 2, 1, 10, col('o4'));
      b.fillRect(px - 0, py, 4, 2, col('o0'));        // cap
      b.set(px, py, col('o1')); b.set(px + 3, py, col('o2'));
      b.fillRect(px, py + 2, 4, 1, col('o3'));        // cap shadow
      b.hline(px - 1, py + 12, 6, col('g4'));          // ground shadow
      b.set(px + 4, py + 11, col('g4'));
      b.hline(px, py + 11, 4, col('o5'));              // post foot
      // post outline on the open sides
      b.vline(px - 1, py, 1, col('o5'));
      if (!W) { b.vline(px - 1, py + 2, 10, col('o5')); }
      if (!E) { b.vline(px + 4, py + 2, 10, col('o5')); }
      b.hline(px, py - 1, 4, col('o5'));
      b.set(px - 1, py, col('o5')); b.set(px + 4, py, col('o5'));
      return b;
    },
  });

  // ============================================================================================ ledges (one-way hops)
  // A grassy step with a shaded earthen lip. ortho mask rounds the free ends of a row of ledge tiles.
  const LEDGE_BASE = (x, y) => col('g2');
  function ledgeD(m) {
    const b = K.B(T, T);
    b.fillRect(0, 0, T, T, col('g2'));
    const g = K.grassTile(1);
    b.blit(g, 0, 0);
    const W = !!(m & K.DIR.W), E = !!(m & K.DIR.E);
    // lip: grass edge (y9), earth face (y10..13), ground shadow (y14..15)
    for (let x = 0; x < T; x++) {
      const wob = (x % 8 === 3 || x % 8 === 4) ? 1 : 0;
      b.set(x, 8 + wob, col('g3'));
      b.set(x, 9 + wob, col('g4'));
      if (wob) b.set(x, 8, col('g2'));
      b.set(x, 10, col('b0')); b.set(x, 11, col('b1'));
      b.set(x, 12, col('b2')); b.set(x, 13, col('b3'));
      b.set(x, 14, col('g4')); b.set(x, 15, col('g3'));
      if (x % 8 === 1) { b.set(x, 11, col('b2')); b.set(x, 12, col('b3')); }
      if (x % 8 === 5) { b.set(x, 11, col('b0')); }
      if (wob) { b.set(x, 9, col('b0')); b.set(x, 10, col('b1')); b.set(x, 13, col('b4')); }
    }
    if (!W) { b.set(0, 10, col('g2')); b.set(0, 11, col('g2')); b.set(0, 14, col('g2')); b.set(0, 15, col('g2')); b.set(0, 13, col('b4')); b.set(1, 10, col('b1')); }
    if (!E) { b.set(15, 10, col('g2')); b.set(15, 11, col('g2')); b.set(15, 14, col('g2')); b.set(15, 15, col('g2')); b.set(15, 13, col('b4')); }
    return b;
  }
  K.terrain('ledge_d', { ledge: 'down', autotile: true, maskMode: 'ortho', variants: 1, step: 'grass', paint: (m) => ledgeD(m) });

  function ledgeSide(m, dir) {
    // face runs down the left (ledge_l) or right (ledge_r) edge of the tile
    const b = K.B(T, T);
    b.fillRect(0, 0, T, T, col('g2'));
    b.blit(K.grassTile(dir === 'l' ? 2 : 3), 0, 0);
    const N = !!(m & K.DIR.N), S = !!(m & K.DIR.S);
    for (let y = 0; y < T; y++) {
      const wob = (y % 8 === 3 || y % 8 === 4) ? 1 : 0;
      let cols;
      if (dir === 'l') cols = [[0, 'g3'], [1, 'b2'], [2, 'b1'], [3, 'b0'], [4, 'g4'], [5, 'g3']];
      else cols = [[10, 'g3'], [11, 'g4'], [12, 'b0'], [13, 'b1'], [14, 'b2'], [15, 'g3']];
      // darker on the right-hand side for shading
      if (dir === 'l') cols = [[0, 'g3'], [1, 'b4'], [2, 'b3'], [3, 'b2'], [4, 'g4'], [5, 'g3']];
      else cols = [[10, 'g3'], [11, 'g4'], [12, 'b0'], [13, 'b1'], [14, 'b3'], [15, 'g3']];
      for (const [x, c] of cols) b.set(x + (dir === 'l' ? wob : -wob), y, col(c));
      if (dir === 'l' && y % 8 === 2) b.set(2, y, col('b4'));
      if (dir === 'r' && y % 8 === 2) b.set(13, y, col('b3'));
    }
    if (!N) { const xs = dir === 'l' ? [1, 2, 3] : [12, 13, 14]; for (const x of xs) b.set(x, 0, col('g2')); }
    if (!S) { const xs = dir === 'l' ? [1, 2, 3] : [12, 13, 14]; for (const x of xs) b.set(x, 15, col('g3')); }
    return b;
  }
  K.terrain('ledge_l', { ledge: 'left', autotile: true, maskMode: 'ortho', variants: 1, step: 'grass', paint: (m) => ledgeSide(m, 'l') });
  K.terrain('ledge_r', { ledge: 'right', autotile: true, maskMode: 'ortho', variants: 1, step: 'grass', paint: (m) => ledgeSide(m, 'r') });
})(typeof globalThis !== 'undefined' ? globalThis : window);
