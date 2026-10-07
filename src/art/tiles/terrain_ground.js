/* src/art/tiles/terrain_ground.js — outdoor ground terrains: grass, tallgrass, flowers, path, cobble, sand, dirt, rock_path */
(function (root) {
  'use strict';
  const NP = root.NP;
  const K = NP.art.tiles.kit;
  const { P, col } = K;
  const T = 16;

  // ============================================================================================ grass
  // Flat bright base with a few sparse blade marks kept away from the tile border (so every fringe drawn by
  // path/water/etc. in plain g2 meets grass seamlessly).
  const GRASS_MAP = { '.': 'g2', a: 'g1', h: 'g0', b: 'g3', c: 'g4' };
  const GRASS = [
    [
      '................',
      '................',
      '................',
      '...a............',
      '..b.b...........',
      '...b............',
      '................',
      '................',
      '................',
      '................',
      '..........a.....',
      '.........b.b....',
      '..........b.....',
      '................',
      '................',
      '................',
    ],
    [
      '................',
      '................',
      '.........a......',
      '........b.b.....',
      '.........b......',
      '................',
      '................',
      '................',
      '................',
      '..a.............',
      '.b.b............',
      '..b.............',
      '................',
      '................',
      '................',
      '................',
    ],
    [
      '................',
      '................',
      '................',
      '................',
      '................',
      '.....a...a......',
      '....b.b.b.b.....',
      '.....b...b......',
      '................',
      '................',
      '................',
      '................',
      '................',
      '................',
      '................',
      '................',
    ],
    [
      '................',
      '................',
      '................',
      '.............h..',
      '..............h.',
      '................',
      '................',
      '................',
      '.....a..........',
      '....b.b.........',
      '.....b..........',
      '................',
      '..h.............',
      '...h............',
      '................',
      '................',
    ],
  ];
  const grassCache = [];
  function grassTile(v) {
    if (!grassCache[v]) grassCache[v] = K.spr(GRASS[v % GRASS.length], GRASS_MAP);
    return grassCache[v].clone();
  }
  K.grassTile = grassTile;

  K.terrain('grass', {
    variants: 4, step: 'step',
    paint: (m, f, v) => grassTile(v),
  });

  // ============================================================================================ tall grass
  // Encounter grass: two staggered rows of dark, dense blade clumps. The front (lower) row is the overlay that hides
  // an actor's legs. Autotile only on N: at the top of a patch the gaps between tips show plain ground.
  // Clump 8x8: '.' gap, d deep, m dark, b base, l light, h tip highlight.
  const CLUMP = [
    '.h....h.',
    '.lh..hl.',
    'hbl.hlbh',
    'lbblbbbl',
    'bbmbbbmb',
    'bmbbbmbb',
    'mbbmbbbm',
    'dmmdmmmd',
  ];
  const TG = { d: 't5', m: 't3', b: 't2', l: 't1', h: 't0' };
  // sway: per frame x-offset for clump rows 0..2 (tips)
  const SWAY = [0, 1, 0, -1];
  function clumpPixels(frame) {
    const out = [];
    const sw = SWAY[frame % SWAY.length];
    for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) {
      const ch = CLUMP[y][x];
      if (ch === '.') continue;
      const dx = y < 2 ? sw : y < 3 ? (sw > 0 ? 1 : sw < 0 ? -1 : 0) * (x % 2) : 0;
      out.push([x + dx, y, col(TG[ch])]);
    }
    return out;
  }
  function tallRow(b, frame, y0, xoff, gapCol) {
    // fill the band with gap colour then stamp clumps (wrapping horizontally for seamless tiling)
    if (gapCol) b.fillRect(0, y0, T, 8, gapCol);
    const px = clumpPixels(frame);
    for (let k = -1; k < 3; k++) {
      const cx = xoff + k * 8;
      for (const [x, y, c] of px) {
        const X = (((cx + x) % T) + T) % T;
        b.set(X, y0 + y, c);
      }
    }
  }
  function tallTile(mask, frame) {
    const b = K.B(T, T);
    const topOpen = !(mask & K.DIR.N);
    // back row (y 0..7): gaps are plain ground when the patch starts here, dark grass otherwise
    tallRow(b, frame, 0, 0, topOpen ? P.g2 : P.t4);
    if (topOpen) {
      // a dark rim where the clump bases meet the ground so the patch edge reads crisply
      for (let x = 0; x < T; x++) if (b.get(x, 0) === P.g2 && b.get(x, 1) === P.g2 && b.get(x, 2) !== P.g2) { /* keep */ }
    }
    // front row (y 8..15), offset by 4 so the clumps interlock
    tallRow(b, frame, 8, 4, P.t4);
    return b;
  }
  function tallOverlay(frame) {
    const b = K.B(T, T);
    tallRow(b, frame, 8, 4, 0);
    // fill the gaps below the tips so legs are fully hidden from row 11 down
    for (let y = 11; y < T; y++) for (let x = 0; x < T; x++) if (!b.get(x, y)) b.set(x, y, P.t4);
    return b;
  }
  K.terrain('tallgrass', {
    encounter: 'grass', step: 'grass', autotile: true, frames: 4, animSpeed: 24,
    paint: (m, f) => tallTile(m, f),
    paintOverlay: (f) => tallOverlay(f),
  });

  // ============================================================================================ flowers
  // Grass with two small flowers that bob gently. Variants = colour schemes.
  const FLOWER_COLS = [
    { p: 'red1', q: 'red2', c: 'yl1' },
    { p: 'yl1', q: 'yl2', c: 'o2' },
    { p: 'p0', q: 'pk1', c: 'yl2' },
    { p: 'pk1', q: 'pk2', c: 'yl1' },
  ];
  const FLOWER_A = ['.p.', 'pcq', '.q.'];
  const FLOWER_B = ['p.p', '.c.', 'q.q'];
  function flower(b, x, y, fr, cs) {
    const shape = fr ? FLOWER_B : FLOWER_A;
    // leaves (stay put)
    b.set(x - 1, y + 3, P.g4); b.set(x + 3, y + 3, P.g4); b.set(x, y + 3, P.g3); b.set(x + 2, y + 3, P.g3);
    b.set(x + 1, y + 3, P.g4);
    const oy = fr === 2 ? 1 : 0;
    for (let yy = 0; yy < 3; yy++) for (let xx = 0; xx < 3; xx++) {
      const ch = shape[yy][xx];
      if (ch === '.') continue;
      b.set(x + xx, y + yy + oy, col(cs[ch]));
    }
    // tiny dark underside so the flower pops on grass
    if (!fr) b.set(x + 1, y + 3, P.g5);
  }
  K.terrain('flowers', {
    variants: 4, frames: 4, animSpeed: 20, step: 'grass',
    paint: (m, f, v) => {
      const b = grassTile(2);
      b.fillRect(0, 0, T, T, P.g2);
      const cs = FLOWER_COLS[v];
      const cs2 = FLOWER_COLS[(v + 1) % 4];
      // frames: 0 A, 1 B, 2 A (bob), 3 B
      const fa = [0, 1, 2, 1][f], fb = [1, 0, 1, 2][f];
      flower(b, 2, 2, fa, cs);
      flower(b, 10, 9, fb, v === 0 || v === 2 ? cs : cs2);
      // a couple of grass marks
      b.set(11, 3, P.g3); b.set(13, 3, P.g3); b.set(12, 4, P.g3);
      b.set(3, 11, P.g3); b.set(5, 11, P.g3); b.set(4, 12, P.g3);
      return b;
    },
  });

  // ============================================================================================ edged ground (autotile vs grass)
  // Generic "ground with a grass fringe" painter. The fringe is plain grass (g2) so it joins every grass tile seamlessly.
  //   interior(x, y, v) -> packed colour of the ground texture
  //   o.lip: fringe width (px); o.R corner radius; o.px/py wobble profiles; o.edgeDark: colour of the grass edge line
  //   o.shadow: colour cast on the ground below N/W edges; o.rim: lit rim colour along S/E edges
  function edgedGround(mask, v, interior, o) {
    const f = K.field(mask, o.R === undefined ? 7 : o.R);
    const b = K.B(T, T);
    for (let i = 0; i < 256; i++) {
      const x = i & 15, y = i >> 4;
      const d = K.wob(f, i, o.px, o.py);
      let c;
      if (d < o.lip) {
        c = P.g2;
        if (o.tuft && d > o.lip - 1.2 && K.hf(x, y, 77) < 0.0) c = P.g3;
      } else if (d < o.lip + 1) {
        c = o.edgeDark; // grass edge line
      } else if (o.shadow && d < o.lip + 2 && (f.ny[i] < -0.35 || f.nx[i] < -0.35)) {
        c = o.shadow; // shadow of the grass lip on N and W sides
      } else if (o.rim && d < o.lip + 2 && (f.ny[i] > 0.35 || f.nx[i] > 0.35)) {
        c = o.rim;
      } else {
        c = interior(x, y, v, d);
      }
      b.u32[i] = c;
    }
    return b;
  }
  K.edgedGround = edgedGround;

  // ---- path (dirt road)
  const PATH_PX = K.profile('path-x', 0.9, [2, 3]);
  const PATH_PY = K.profile('path-y', 0.9, [2, 3]);
  const PATH_TEX = [
    // 3 variants of speckle layout: 's' dark speck, 'l' light speck, 'p' pebble (2px), 'q' pebble shadow
    [
      '................',
      '................',
      '.....s..........',
      '..........l.....',
      '................',
      '...l............',
      '.............s..',
      '........pp......',
      '........qq......',
      '................',
      '..s.............',
      '...........l....',
      '................',
      '.....l..........',
      '..............s.',
      '................',
    ],
    [
      '................',
      '..l.............',
      '................',
      '.........s......',
      '................',
      '................',
      '....pp........l.',
      '....qq..........',
      '................',
      '..........s.....',
      '................',
      '..s.............',
      '...........l....',
      '................',
      '................',
      '................',
    ],
    [
      '................',
      '................',
      '..........s.....',
      '...l............',
      '................',
      '................',
      '............l...',
      '................',
      '..s.............',
      '................',
      '.........pp.....',
      '.........qq.....',
      '................',
      '...l........s...',
      '................',
      '................',
    ],
  ];
  function texFn(tex, map, base) {
    const cache = tex.map((rows) => {
      const arr = new Uint32Array(256);
      for (let y = 0; y < T; y++) for (let x = 0; x < T; x++) {
        const ch = rows[y][x];
        arr[y * T + x] = map[ch] !== undefined ? col(map[ch]) : col(base);
      }
      return arr;
    });
    return (x, y, v) => cache[v % cache.length][y * T + x];
  }
  const pathTex = texFn(PATH_TEX, { s: 'd3', l: 'd1', p: 'd1', q: 'd4' }, 'd2');
  K.terrain('path', {
    autotile: true, variants: 3, step: 'step',
    paint: (m, f, v) => edgedGround(m, v, pathTex, { lip: 1.6, R: 7, px: PATH_PX, py: PATH_PY, edgeDark: P.g3, shadow: P.d3, rim: P.d1 }),
  });

  // ---- dirt (bare darker earth, fields) — P2
  const DIRT_TEX = [
    [
      '................',
      '..s.......l.....',
      '................',
      '......l.........',
      '............s...',
      '...s............',
      '................',
      '.........l......',
      '..l.............',
      '.............s..',
      '.....s..........',
      '................',
      '..........l.....',
      '...l............',
      '.............s..',
      '................',
    ],
    [
      '................',
      '.......s........',
      '...l............',
      '.............l..',
      '................',
      '.....s....s.....',
      '................',
      '..l.............',
      '..........l.....',
      '................',
      '....s...........',
      '...........s....',
      '.l..............',
      '................',
      '.........l......',
      '................',
    ],
  ];
  const dirtTex = texFn(DIRT_TEX, { s: 'b3', l: 'b0' }, 'b1');
  K.terrain('dirt', {
    autotile: true, variants: 2, step: 'sand',
    paint: (m, f, v) => edgedGround(m, v, dirtTex, { lip: 1.6, R: 6, px: PATH_PY, py: PATH_PX, edgeDark: P.g4, shadow: P.b2, rim: P.b0 }),
  });

  // ---- sand — P2
  const SAND_TEX = [
    [
      '................',
      '.....l..........',
      '............s...',
      '..s.............',
      '................',
      '.........l......',
      '................',
      '...l.......s....',
      '................',
      '.......s........',
      '.............l..',
      '..l.............',
      '................',
      '..........s.....',
      '....s...........',
      '................',
    ],
    [
      '................',
      '..........s.....',
      '...l............',
      '................',
      '.............l..',
      '......s.........',
      '................',
      '..s.......l.....',
      '................',
      '................',
      '.....l......s...',
      '................',
      '...........l....',
      '..s.............',
      '........l.......',
      '................',
    ],
  ];
  const sandTex = texFn(SAND_TEX, { s: 's3', l: 's0' }, 's1');
  K.terrain('sand', {
    autotile: true, variants: 2, step: 'sand',
    paint: (m, f, v) => edgedGround(m, v, sandTex, { lip: 1.6, R: 8, px: PATH_PX, py: PATH_PY, edgeDark: P.g3, shadow: P.s2, rim: P.s0 }),
  });

  // ---- cobble (town paving): rounded stones with mortar, framed by a neat curb
  const COBBLE = [
    [
      '1122k3k112223k11',
      '1223k3k12233k122',
      '233kk3k2333kk233',
      'kkkk33kkkk3kkkkk',
      '3k11122k1122k111',
      '3k12223k1223k122',
      'kk2333kk2333kk23',
      'k1kkkkk3kkkkk13k',
      'k12k11222k1122kk',
      'k23k12233k1223k1',
      'kkk3k2333kk2333k',
      '11kkkkkkkk3kkkk1',
      '222k1112k11222k1',
      '233k1223k12233k1',
      '33kk2333k2333kk2',
      'kkkkkkkkkkkkkkkk',
    ],
  ];
  // 1 highlight, 2 base, 3 shade, k mortar
  const cobbleTex = texFn(COBBLE, { 1: 'c1', 2: 'c2', 3: 'c3', k: 'c4' }, 'c2');
  const COB_PX = K.profile('cob', 0.0, [1]);
  K.terrain('cobble', {
    autotile: true, variants: 1, step: 'stone',
    paint: (m, f, v) => {
      const fl = K.field(m, 5);
      const b = K.B(T, T);
      for (let i = 0; i < 256; i++) {
        const x = i & 15, y = i >> 4, d = fl.d[i];
        let c;
        if (d < 1) c = P.g2;
        else if (d < 2) c = fl.ny[i] < -0.35 || fl.nx[i] < -0.35 ? P.g4 : P.c5; // outer line: grass shadow top/left, curb outline bottom/right
        else if (d < 3) c = fl.ny[i] > 0.35 || fl.nx[i] > 0.35 ? P.c3 : P.c0; // curb: lit top/left, shaded bottom/right
        else if (d < 4) c = fl.ny[i] > 0.35 || fl.nx[i] > 0.35 ? P.c2 : P.c1;
        else if (d < 5) c = P.c4; // mortar ring inside the curb
        else c = cobbleTex(x, y, v);
        b.u32[i] = c;
      }
      return b;
    },
  });

  // ---- rock_path (mountain gravel) — P2
  const ROCK_TEX = [
    [
      '................',
      '..pq......s.....',
      '..qq............',
      '.......l.....s..',
      '............pq..',
      '...s........qq..',
      '................',
      '.......pq.......',
      '..l....qq....l..',
      '................',
      '.............s..',
      '...pq...........',
      '...qq.....l.....',
      '..........pq....',
      '......s...qq....',
      '................',
    ],
    [
      '................',
      '.......pq.......',
      '..s....qq....l..',
      '................',
      '..pq............',
      '..qq......s.....',
      '...........pq...',
      '.....l.....qq...',
      '................',
      '..s.............',
      '........pq......',
      '........qq...s..',
      '..pq............',
      '..qq......l.....',
      '................',
      '................',
    ],
  ];
  const rockTex = texFn(ROCK_TEX, { s: 'r3', l: 'r1', p: 'r1', q: 'r4' }, 'r2');
  K.terrain('rock_path', {
    autotile: true, variants: 2, step: 'stone',
    paint: (m, f, v) => edgedGround(m, v, rockTex, { lip: 1.6, R: 6, px: PATH_PX, py: PATH_PY, edgeDark: P.g4, shadow: P.r3, rim: P.r1 }),
  });
})(typeof globalThis !== 'undefined' ? globalThis : window);
