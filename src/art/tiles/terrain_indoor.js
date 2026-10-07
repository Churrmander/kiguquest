/* src/art/tiles/terrain_indoor.js — indoor terrains: wooden/tile/stone floors, three carpets, three wall faces, door mat,
 * void, stairs. Walls are autotiles (group 'wall'): the tile whose south neighbour is floor shows the wall base (skirting),
 * wall tiles that border floor on N/E/W (or sit in an inside corner) show the flat wall *top* instead of the face. */
(function (root) {
  'use strict';
  const NP = root.NP;
  const K = NP.art.tiles.kit;
  const { P, col } = K;
  const T = 16;
  const D = K.DIR;

  // ============================================================================================ floors
  K.terrain('floor_wood', {
    variants: 3, step: 'wood',
    paint: (m, f, v) => {
      const b = K.B(T, T);
      const joints = [[5, 12], [11, 3], [8, 1]][v];
      const grain = [[2, 3], [9, 5], [12, 2]];
      for (let r = 0; r < 2; r++) {
        const y0 = r * 8, jx = joints[r];
        b.fillRect(0, y0, T, 8, P.o2);
        b.fillRect(0, y0, T, 1, P.o1);            // lit top edge of the board
        b.fillRect(0, y0 + 7, T, 1, P.o3);        // seam
        b.fillRect(jx, y0, 1, 7, P.o3);           // butt joint
        b.set(jx + 1, y0 + 1, P.o0);
        for (const [gx, gy] of grain) {
          const x = (gx + v * 3 + r * 5) % 12;
          b.hline(x, y0 + 2 + (gy + r) % 4, 3, P.o3);
        }
      }
      return b;
    },
  });

  K.terrain('floor_tile', {
    variants: 2, step: 'stone',
    paint: (m, f, v) => {
      const b = K.B(T, T);
      for (let ty = 0; ty < 2; ty++) for (let tx = 0; tx < 2; tx++) {
        const alt = (tx + ty + v) & 1;
        const x0 = tx * 8, y0 = ty * 8;
        b.fillRect(x0, y0, 8, 8, alt ? P.c2 : P.c1);
        b.fillRect(x0, y0 + 7, 8, 1, P.c3);       // grout (south)
        b.fillRect(x0 + 7, y0, 1, 8, P.c3);       // grout (east)
        b.fillRect(x0, y0, 7, 1, alt ? P.c1 : P.c0); // lit top edge
        b.fillRect(x0, y0, 1, 7, alt ? P.c1 : P.c0); // lit left edge
      }
      return b;
    },
  });

  // flagstones: a 16-periodic layout of [x, y, w, h] blocks (so every tile joins every other one)
  const FLAGS = [
    [0, 0, 6, 5], [6, 0, 5, 5], [11, 0, 5, 5],
    [0, 5, 4, 6], [4, 5, 6, 6], [10, 5, 6, 6],
    [0, 11, 8, 5], [8, 11, 8, 5],
  ];
  K.terrain('floor_stone', {
    variants: 2, step: 'stone',
    paint: (m, f, v) => {
      const b = K.B(T, T);
      b.fillRect(0, 0, T, T, P.c4);
      FLAGS.forEach(([x, y, w, h], i) => {
        const tone = K.h32(i, v, 5) % 3 === 0 ? P.c1 : P.c2;
        b.fillRect(x, y, w - 1, h - 1, tone);
        b.fillRect(x, y, w - 1, 1, P.c0);
        b.fillRect(x, y, 1, h - 1, P.c0);
        b.fillRect(x + 1, y + h - 2, w - 2, 1, P.c3);
        if (K.h32(i, v, 9) % 2) b.set(x + 2 + (i % 2), y + 2, P.c3);
      });
      return b;
    },
  });

  // ============================================================================================ carpets
  // Woven rug floor: dotted lattice inside, a pale trim + deep border on every side that does not touch the same carpet.
  function carpet(id, ramp, trim, dot) {
    K.terrain(id, {
      autotile: true, step: 'step',
      paint: (m) => {
        const b = K.B(T, T);
        const [hi, lt, base, mid, dk, out] = ramp;
        const open = { N: !(m & D.N), E: !(m & D.E), S: !(m & D.S), W: !(m & D.W) };
        const notch = { NE: (m & D.N) && (m & D.E) && !(m & D.NE), SE: (m & D.S) && (m & D.E) && !(m & D.SE), SW: (m & D.S) && (m & D.W) && !(m & D.SW), NW: (m & D.N) && (m & D.W) && !(m & D.NW) };
        for (let y = 0; y < T; y++) for (let x = 0; x < T; x++) {
          let d = 99;
          if (open.N) d = Math.min(d, y);
          if (open.S) d = Math.min(d, 15 - y);
          if (open.W) d = Math.min(d, x);
          if (open.E) d = Math.min(d, 15 - x);
          if (notch.NE) d = Math.min(d, Math.max(15 - x, y));
          if (notch.SE) d = Math.min(d, Math.max(15 - x, 15 - y));
          if (notch.SW) d = Math.min(d, Math.max(x, 15 - y));
          if (notch.NW) d = Math.min(d, Math.max(x, y));
          let c;
          if (d === 0) c = out;
          else if (d === 1) c = trim;
          else if (d === 2) c = dk;
          else {
            c = base;
            if (x % 4 === 2 && y % 4 === 2) c = dot;
            else if (x % 4 === 0 && y % 4 === 0) c = mid;
            else if ((x + y) % 8 === 4 && (x % 4 === 1 || x % 4 === 3)) c = lt;
          }
          b.set(x, y, c);
        }
        return b;
      },
    });
  }
  carpet('carpet_red', K.ramp('red'), P.yl2, P.red0);
  carpet('carpet_blue', K.ramp('blue'), P.p1, P.bl0);
  carpet('carpet_green', K.ramp('green'), P.yl1, P.f0);

  // ============================================================================================ door mat
  K.terrain('mat', {
    autotile: true, step: 'step',
    paint: (m) => {
      const b = K.B(T, T);
      const open = { N: !(m & D.N), E: !(m & D.E), S: !(m & D.S), W: !(m & D.W) };
      for (let y = 0; y < T; y++) for (let x = 0; x < T; x++) {
        let d = 99;
        if (open.N) d = Math.min(d, y);
        if (open.S) d = Math.min(d, 15 - y);
        if (open.W) d = Math.min(d, x);
        if (open.E) d = Math.min(d, 15 - x);
        let c;
        if (d === 0) c = P.red4;
        else if (d <= 2) c = P.red2;
        else if (d === 3) c = P.red3;
        else c = (((x >> 1) + (y >> 1)) & 1) ? P.d2 : P.d3;      // coir basket-weave
        if (d > 3 && y % 4 === 3) c = P.d4;
        b.set(x, y, c);
      }
      return b;
    },
  });

  // ============================================================================================ void
  K.terrain('void', { solid: true, paint: () => { const b = K.B(T, T); b.fillRect(0, 0, T, T, P.black); return b; } });

  // ============================================================================================ stairs
  // 'up' climbs away from the viewer: lit treads alternate with darker risers. 'down' descends into shade.
  K.terrain('stairs_up', {
    step: 'wood',
    paint: () => {
      const b = K.B(T, T);
      b.fillRect(0, 0, T, T, P.o3);
      for (let i = 0; i < 4; i++) {
        const y = i * 4;
        b.fillRect(2, y, 12, 2, i === 0 ? P.o0 : P.o1);        // tread
        b.fillRect(2, y + 2, 12, 2, P.o3);                     // riser
        b.fillRect(2, y + 3, 12, 1, P.o4);
        b.set(2, y, P.o0);
      }
      b.fillRect(0, 0, 2, T, P.o4); b.fillRect(14, 0, 2, T, P.o4);   // stringers
      b.fillRect(0, 0, 1, T, P.o2); b.fillRect(14, 0, 1, T, P.o3);
      b.fillRect(0, 0, T, 1, P.o5);
      return b;
    },
  });
  K.terrain('stairs_down', {
    step: 'wood',
    paint: () => {
      const b = K.B(T, T);
      b.fillRect(0, 0, T, T, P.o5);
      const tread = [P.o2, P.o3, P.o4, P.o5];
      for (let i = 0; i < 4; i++) {
        const y = i * 4;
        b.fillRect(2, y, 12, 3, tread[i]);
        b.fillRect(2, y, 12, 1, i === 0 ? P.o1 : tread[Math.max(0, i - 1)]);
        b.fillRect(2, y + 3, 12, 1, P.o6);
      }
      b.fillRect(0, 0, 2, T, P.o4); b.fillRect(14, 0, 2, T, P.o5);
      b.fillRect(0, 0, 1, T, P.o3);
      b.fillRect(0, 15, T, 1, P.black);
      return b;
    },
  });

  // ============================================================================================ walls
  /**
   * spec: { face(b, v), base(b), topSurf(b, open) } — face = vertical wall face, base = skirting painted over the bottom rows
   * of a face tile that has floor to its south, topSurf = flat wall top for inside/edge tiles.
   */
  function wall(id, spec) {
    K.terrain(id, {
      solid: true, autotile: true, group: 'wall', variants: 2,
      paint: (m, f, v) => {
        const hasN = m & D.N, hasE = m & D.E, hasS = m & D.S, hasW = m & D.W;
        const open = { N: !hasN, E: !hasE, W: !hasW };
        const notch = (hasN && hasE && !(m & D.NE)) || (hasN && hasW && !(m & D.NW));
        const b = K.B(T, T);
        if (hasS && (open.N || open.E || open.W || notch)) {
          spec.topSurf(b, open, v);
        } else {
          spec.face(b, v);
          if (!hasS) spec.base(b);
        }
        return b;
      },
    });
  }
  const topSurface = (cap, hi, dk, speck) => (b, open, v) => {
    b.fillRect(0, 0, T, T, cap);
    for (let i = 0; i < 9; i++) b.set((K.h32(i, v, 3) % 14) + 1, (K.h32(i, v, 4) % 14) + 1, speck);
    if (open.N) { b.fillRect(0, 0, T, 1, hi); b.fillRect(0, 1, T, 1, speck); }
    if (open.W) b.fillRect(0, 0, 1, T, hi);
    if (open.E) { b.fillRect(15, 0, 1, T, dk); b.fillRect(14, 0, 1, T, speck); }
    b.fillRect(0, 15, T, 1, dk);
  };

  wall('wall_wood', {
    face: (b, v) => {
      for (let x = 0; x < T; x++) {
        const plank = x >> 2, lx = x & 3;
        const tone = ((plank + v * 2) % 4 === 2) ? P.o2 : P.o3;
        const c = lx === 3 ? P.o4 : lx === 0 ? (tone === P.o3 ? P.o2 : P.o1) : tone;
        b.fillRect(x, 0, 1, T, c);
      }
      b.set(6 + v * 4, 5, P.o4); b.set(7 + v * 4, 5, P.o4); b.set(2 + v * 8, 10, P.o4);
    },
    base: (b) => {
      b.fillRect(0, 10, T, 1, P.o2);
      b.fillRect(0, 11, T, 1, P.o4);
      b.fillRect(0, 12, T, 1, P.o1);
      b.fillRect(0, 13, T, 2, P.o4);
      b.fillRect(0, 15, T, 1, P.o6);
    },
    topSurf: topSurface(P.o4, P.o2, P.o6, P.o3),
  });

  wall('wall_plaster', {
    face: (b, v) => {
      b.fillRect(0, 0, T, T, P.p1);
      for (let i = 0; i < 7; i++) b.set((K.h32(i, v, 1) % 15), (K.h32(i, v, 2) % 14), P.p2);
      b.fillRect(0, 0, 1, T, P.p0);
    },
    base: (b) => {
      b.fillRect(0, 7, T, 1, P.p0);            // dado rail
      b.fillRect(0, 8, T, 1, P.p3);
      b.fillRect(0, 9, T, 5, P.p2);            // wainscot panel
      b.fillRect(7, 9, 1, 5, P.p3);
      b.fillRect(0, 9, 1, 5, P.p1);
      b.fillRect(0, 14, T, 1, P.o4);           // skirting
      b.fillRect(0, 15, T, 1, P.o6);
    },
    topSurf: topSurface(P.p3, P.p1, P.p5, P.p2),
  });

  wall('wall_stone', {
    face: (b, v) => {
      b.fillRect(0, 0, T, T, P.n3);
      for (let row = 0; row < 4; row++) {
        const y = row * 4, off = (row & 1) * 4 + (v ? 2 : 0);
        for (let k = -1; k < 3; k++) {
          const x = k * 8 + off;
          const tone = K.h32(row, k + v * 7, 6) % 4 === 0 ? P.n1 : P.n2;
          b.fillRect(x, y, 7, 3, tone);
          b.fillRect(x, y, 7, 1, P.n1);
        }
      }
    },
    base: (b) => {
      b.fillRect(0, 12, T, 3, P.n4);
      b.fillRect(0, 12, T, 1, P.n3);
      b.fillRect(0, 15, T, 1, P.n6);
    },
    topSurf: topSurface(P.n4, P.n2, P.n6, P.n3),
  });
})(typeof globalThis !== 'undefined' ? globalThis : window);
