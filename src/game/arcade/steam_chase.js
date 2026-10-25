/* src/game/arcade/steam_chase.js — cabinet 3, "Steam Chase": a maze chase. Woolly the Kigu gobbles thread beads round a
 * sewing-box maze while four Starch Society steam irons hunt her. A Soft Rinse bottle in each corner cools the irons down for a
 * few seconds, and while they're cool she can bump them back to the ironing board. Needs the city lights. */
(function (root) {
  'use strict';
  const NP = root.NP;
  const { Input, Bitmap } = NP;
  const AR = NP.arcade, K = AR.kit;

  // left half of the maze; the right half is its mirror. # wall, . bead, o Soft Rinse, - the ironing-board gate (irons only),
  // H the ironing board (iron home), T tunnel (wraps to the other side), space = open floor with no bead.
  const HALF = [
    '##############',
    '#.....#.......',
    '#o###.#.#####.',
    '#.###.#.#####.',
    '#.............',
    '#.##.####.#.##',
    '#....#....#...',
    '####.#.####.##',
    '   #.#........',
    '####.#.#.####-',
    'T....#...#HHHH',
    '####.#.#.#####',
    '   #.#........',
    '####.#.###.###',
    '#......#......',
    '#.####.#.###.#',
    '#o..#.........',
    '###.#.##.#.###',
    '#.....##.#....',
    '#.######.###.#',
    '#.............',
    '##############',
  ];
  const MAZE = HALF.map((h) => h + h.split('').reverse().join(''));
  const W = 28, H = MAZE.length, T = 8, OX = 16, OY = 14;
  const DIRS = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
  const REV = { up: 'down', down: 'up', left: 'right', right: 'left' };
  const ORDER = ['up', 'left', 'down', 'right'];
  const GATE = { x: 13, y: 9 };      // the left gate tile; irons leave upward through (13|14, 9)
  const HOME = { x: 13, y: 10 };
  const START = { x: 13, y: 16 };

  // ------------------------------------------------------------------------------------------- sprites
  // Woolly: a round Kigu girl in a fleecy sheep hood, mouth open / shut, drawn facing right (flipped / turned for the others)
  const WOOL = { k: '#3a2c3a', w: '#fffaf0', W: '#d8d0d8', s: '#f8d0b0', e: '#302040', p: '#f898a8', m: '#a02840', h: '#8a6a50' };
  const WOOLLY = [
    ['...kkkkkk...',
     '..kwWwwWwk..',
     '.kwwwwwwwwk.',
     'kwWkhhhhkwWk',
     'kwkssssssskw',
     'kwksesssesk.',
     'kwkssssssskw',
     'kwkpsmmmspkw',
     'kwWkssmsskWk',
     '.kwwkkkkkwk.',
     '..kwWwwWwk..',
     '...kkkkkk...'],
    ['...kkkkkk...',
     '..kwWwwWwk..',
     '.kwwwwwwwwk.',
     'kwWkhhhhkwWk',
     'kwkssssssskw',
     'kwksesssesk.',
     'kwksssssskk.',
     'kwkpssmm....',
     'kwWkssmmm...',
     '.kwwkkkkkk..',
     '..kwWwwWwk..',
     '...kkkkkk...'],
  ];
  const woolly = (f) => K.spr('sc.w' + f, WOOLLY[f], WOOL);
  // steam iron, 12x12, facing right; the four irons share it in four colourways
  const IRON_ROWS = [
    '....kkkk....',
    '...khhhhk...',
    '..kh....hk..',
    '..kkkkkkkk..',
    '.kbbbbbbbbk.',
    'kbbwekbwekbk',
    'kbbwkkbwkkbk',
    'kbbbbbbbbbbk',
    'kBBBBBBBBBBk',
    'kssssssssssk',
    '.kssssssssk.',
    '..kkkkkkkk..',
  ];
  const IRONS = [
    { name: 'Crease', b: '#e8f0ff', B: '#98a8d8' },
    { name: 'Pleat', b: '#78b8f8', B: '#3878c8' },
    { name: 'Calla', b: '#c8a8f8', B: '#8868c8' },
    { name: 'Serge', b: '#f8c0d0', B: '#c87890' },
  ];
  const ironBmp = (i, cool, flash) => K.spr('sc.i' + i + (cool ? (flash ? 'f' : 'c') : ''), IRON_ROWS, {
    k: '#1c2038', h: '#506080', s: '#d8e0f0', w: '#ffffff', e: '#202848',
    b: cool ? (flash ? '#ffffff' : '#78d8c8') : IRONS[i].b, B: cool ? (flash ? '#f8c8c8' : '#38a090') : IRONS[i].B,
  });
  const EYES = () => K.spr('sc.eyes', ['.ww..ww.', 'wwkwwwkw', '.ww..ww.'], { w: '#ffffff', k: '#202848' });
  const RINSE = () => K.spr('sc.rinse', ['..kk..', '.kwwk.', '.kbbk.', 'kbbbbk', 'kbwbbk', 'kbbbbk', '.kkkk.'], { k: '#1c3048', w: '#ffffff', b: '#78c8f8' });
  const MACARON = () => K.spr('sc.mac', ['..kkkk..', '.kppppk.', 'kppppppk', 'kcccccck', 'kppppppk', '.kkkkkk.'], { k: '#6a2840', p: '#f8a8c8', c: '#fff4e0' });

  const mazeBmp = () => K.memo('sc.maze', () => {
    const b = new Bitmap(W * T, H * T);
    const wall = (x, y) => x >= 0 && x < W && y >= 0 && y < H && MAZE[y][x] === '#';
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      if (!wall(x, y)) continue;
      // felt walls with a stitched edge where they meet the floor
      b.fillRect(x * T, y * T, T, T, '#5a2c78');
      for (let i = 0; i < T; i++) {
        if (!wall(x, y - 1)) { b.set(x * T + i, y * T, '#b070e0'); if (i % 3 === 1) b.set(x * T + i, y * T + 2, '#f8d8ff'); }
        if (!wall(x, y + 1)) { b.set(x * T + i, y * T + T - 1, '#2a1240'); if (i % 3 === 1) b.set(x * T + i, y * T + T - 3, '#f8d8ff'); }
        if (!wall(x - 1, y)) { b.set(x * T, y * T + i, '#9858c8'); if (i % 3 === 1) b.set(x * T + 2, y * T + i, '#f8d8ff'); }
        if (!wall(x + 1, y)) { b.set(x * T + T - 1, y * T + i, '#3a1858'); if (i % 3 === 1) b.set(x * T + T - 3, y * T + i, '#f8d8ff'); }
      }
    }
    // the ironing board (iron home) and its gate
    for (let x = 10; x < 18; x++) { b.fillRect(x * T, 10 * T + 1, T, T - 2, '#38406a'); }
    for (let x = 10; x < 18; x += 2) b.fillRect(x * T + 2, 10 * T + 3, 3, 2, '#5a6898');
    for (let x = 13; x < 15; x++) b.fillRect(x * T, 9 * T + 3, T, 2, '#f8c0d0');
    return b;
  });

  // ------------------------------------------------------------------------------------------- game
  const at = (x, y) => (y < 0 || y >= H ? '#' : MAZE[y][((x % W) + W) % W]);
  const open = (x, y, iron) => { const c = at(x, y); return c !== '#' && (iron || (c !== '-' && c !== 'H')); };

  function create() {
    const g = { score: 0, lives: 3, over: false, level: 0, t: 0, chain: 0, pops: [] };
    nextLevel(g);
    g.update = () => update(g);
    g.draw = (fb, t) => draw(g, fb, t);
    return g;
  }
  function nextLevel(g) {
    g.level++;
    g.beads = MAZE.map((r) => r.split('').map((c) => (c === '.' ? 1 : c === 'o' ? 2 : 0)));
    g.left = g.beads.reduce((n, r) => n + r.filter(Boolean).length, 0);
    g.eaten = 0;
    g.macaron = null;
    reset(g);
  }
  function reset(g) {
    g.p = { x: START.x, y: START.y, dir: 'left', want: 'left', prog: 0, mouth: 0 };
    g.irons = IRONS.map((d, i) => ({ i, x: i === 0 ? 13 : 11 + i * 1.5 | 0, y: i === 0 ? 8 : 10, dir: i === 0 ? 'left' : 'up', prog: 0, mode: i === 0 ? 'out' : 'home', release: [0, 90, 300, 520][i], eyes: false }));
    g.cool = 0;
    g.ready = 90;
    g.dying = 0;
    g.mode = 'scatter';
    g.modeT = 0;
  }

  const levelSpeed = (g) => Math.min(1.45, 1.0 + (g.level - 1) * 0.08);

  function update(g) {
    g.t++;
    for (const p of g.pops) p.t--;
    g.pops = g.pops.filter((p) => p.t > 0);
    if (g.clearT > 0) { if (--g.clearT === 0) nextLevel(g); return; }
    if (g.ready > 0) { g.ready--; return; }
    if (g.dying > 0) {
      if (--g.dying === 0) { if (g.lives <= 0) g.over = true; else reset(g); }
      return;
    }
    if (g.freeze > 0) { g.freeze--; return; }
    // scatter / chase rhythm
    g.modeT++;
    const span = g.mode === 'scatter' ? 7 * 60 : 20 * 60;
    if (g.modeT > span) { g.mode = g.mode === 'scatter' ? 'chase' : 'scatter'; g.modeT = 0; for (const r of g.irons) if (r.mode === 'run') r.flip = true; }
    if (g.cool > 0 && --g.cool === 0) g.chain = 0;

    // Woolly
    const d = Input.dir();
    if (d) g.p.want = d;
    movePlayer(g, levelSpeed(g) * (g.cool > 0 ? 1.1 : 1));

    // irons
    for (const r of g.irons) moveIron(g, r);

    // bonus macaron
    if (!g.macaron && (g.eaten === 70 || g.eaten === 170)) { g.macaron = { t: 600 }; g.eaten++; }
    if (g.macaron && --g.macaron.t <= 0) g.macaron = null;
    if (g.macaron && g.p.x === 13 && g.p.y === 12) { const v = 100 * g.level; g.score += v; g.pops.push({ x: OX + 13 * T, y: OY + 12 * T, t: 60, txt: String(v) }); g.macaron = null; K.sfx('pickup'); }

    // touch
    for (const r of g.irons) {
      if (r.eyes || r.mode === 'home') continue;
      const [px, py] = pos(g.p), [rx, ry] = pos(r);
      if (Math.abs(px - rx) < 6 && Math.abs(py - ry) < 6) {
        if (g.cool > 0 && r.cooled) {
          g.chain = Math.min(4, g.chain + 1);
          const v = 100 * (1 << g.chain);
          g.score += v; g.pops.push({ x: rx, y: ry, t: 50, txt: String(v) });
          r.eyes = true; r.cooled = false; g.freeze = 30;
          K.sfx('splash');
        } else {
          g.lives--; g.dying = 100; K.sfx('faint');
          return;
        }
      }
    }
    if (g.left <= 0) { g.clearT = 120; g.score += 300; K.sfx('levelup'); }
  }

  /** pixel centre of an entity */
  function pos(e) {
    const [dx, dy] = DIRS[e.dir];
    return [OX + e.x * T + 4 + dx * e.prog, OY + e.y * T + 4 + dy * e.prog];
  }

  function movePlayer(g, speed) {
    const p = g.p;
    // reverse at once, like on any arcade stick
    if (p.want === REV[p.dir] && p.prog > 0) { const [dx, dy] = DIRS[p.dir]; p.x += dx; p.y += dy; p.x = (p.x + W) % W; p.prog = T - p.prog; p.dir = p.want; }
    if (p.prog === 0) {
      const [wx, wy] = DIRS[p.want];
      if (open(p.x + wx, p.y + wy)) p.dir = p.want;
      const [dx, dy] = DIRS[p.dir];
      if (!open(p.x + dx, p.y + dy)) return;
    }
    p.prog += speed;
    p.mouth++;
    if (p.prog >= T) {
      const [dx, dy] = DIRS[p.dir];
      p.x = (p.x + dx + W) % W; p.y += dy; p.prog = 0;
      const b = g.beads[p.y][p.x];
      if (b) {
        g.beads[p.y][p.x] = 0; g.left--; g.eaten++;
        if (b === 1) { g.score += 10; if ((g.eaten & 1) === 0) K.sfx('text'); }
        else { g.score += 50; g.cool = Math.max(180, 420 - g.level * 40); g.chain = 0; for (const r of g.irons) if (!r.eyes && r.mode !== 'home') { r.cooled = true; r.flip = true; } K.sfx('splash'); }
      }
    }
  }

  function targetOf(g, r) {
    if (r.eyes) return GATE;
    if (r.mode === 'out') return { x: 13, y: 8 };
    const p = g.p;
    if (g.mode === 'scatter') return [{ x: 25, y: -2 }, { x: 2, y: -2 }, { x: 27, y: 23 }, { x: 0, y: 23 }][r.i];
    if (r.i === 0) return p;
    if (r.i === 1) { const [dx, dy] = DIRS[p.dir]; return { x: p.x + dx * 4, y: p.y + dy * 4 }; }
    if (r.i === 2) { const a = g.irons[0]; const [dx, dy] = DIRS[p.dir]; return { x: 2 * (p.x + dx * 2) - a.x, y: 2 * (p.y + dy * 2) - a.y }; }
    return Math.abs(r.x - p.x) + Math.abs(r.y - p.y) > 8 ? p : { x: 0, y: 23 };
  }

  function moveIron(g, r) {
    if (r.mode === 'home') {
      if (g.t > r.release + 90 || g.eaten > r.i * 30) { r.mode = 'out'; r.x = 13; r.y = 10; r.dir = 'up'; r.prog = 0; }
      else { r.bob = (r.bob || 0) + 1; return; }
    }
    let speed = levelSpeed(g) * 0.92;
    if (r.eyes) speed = 2;
    else if (r.cooled && g.cool > 0) speed *= 0.55;
    else if (at(r.x, r.y) === 'T' || (r.y === 10 && (r.x < 5 || r.x > 22))) speed *= 0.6;
    if (r.cooled && g.cool <= 0) r.cooled = false;
    r.prog += speed;
    if (r.prog < T) return;
    const [dx, dy] = DIRS[r.dir];
    r.x = (r.x + dx + W) % W; r.y += dy; r.prog = 0;
    if (r.eyes && r.y === 9 && (r.x === 13 || r.x === 14)) { r.y = 10; r.eyes = false; r.mode = 'out'; r.dir = 'up'; return; }
    if (r.mode === 'out' && r.y <= 8) r.mode = 'run';
    // pick a direction at this tile: never straight back unless told to flip
    if (r.flip) { r.flip = false; r.dir = REV[r.dir]; if (open(r.x + DIRS[r.dir][0], r.y + DIRS[r.dir][1], true)) return; }
    const via = r.mode === 'out' || r.eyes;
    const opts = ORDER.filter((d) => d !== REV[r.dir] && open(r.x + DIRS[d][0], r.y + DIRS[d][1], via) && !(at(r.x + DIRS[d][0], r.y + DIRS[d][1]) === '-' && !via && d === 'down'));
    const legal = opts.filter((d) => via || (at(r.x + DIRS[d][0], r.y + DIRS[d][1]) !== '-' && at(r.x + DIRS[d][0], r.y + DIRS[d][1]) !== 'H'));
    const list = legal.length ? legal : opts.length ? opts : [REV[r.dir]];
    if (r.cooled && g.cool > 0) { r.dir = list[K.rand(list.length)]; return; }
    const tg = targetOf(g, r);
    let best = list[0], bd = 1e9;
    for (const d of list) {
      const nx = r.x + DIRS[d][0], ny = r.y + DIRS[d][1];
      const dd = (nx - tg.x) * (nx - tg.x) + (ny - tg.y) * (ny - tg.y);
      if (dd < bd) { bd = dd; best = d; }
    }
    r.dir = best;
  }

  // ------------------------------------------------------------------------------------------- drawing
  function draw(g, fb, t) {
    fb.clear('#120c20');
    fb.blit(mazeBmp(), OX, OY);
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const b = g.beads[y][x];
      if (b === 1) { fb.fillRect(OX + x * T + 3, OY + y * T + 3, 2, 2, '#f8e0a0'); fb.set(OX + x * T + 3, OY + y * T + 3, '#fffaf0'); }
      else if (b === 2 && ((t >> 3) & 1)) fb.blit(RINSE(), OX + x * T + 1, OY + y * T);
    }
    if (g.macaron) fb.blit(MACARON(), OX + 13 * T + 4, OY + 12 * T + 1);
    for (const r of g.irons) {
      const [x, y] = r.mode === 'home' ? [OX + (11 + r.i * 2) * T, OY + 10 * T + 4 + (((r.bob || 0) >> 4) & 1)] : pos(r);
      if (r.eyes) { fb.blit(EYES(), x - 4, y - 2); continue; }
      const cool = r.cooled && g.cool > 0, flash = cool && g.cool < 120 && ((t >> 3) & 1);
      const bmp = ironBmp(r.i, cool, flash);
      fb.blit(bmp, x - 6, y - 6, { flipX: r.dir === 'left' });
      // a puff of steam now and then
      if (!cool && ((t + r.i * 13) % 40) < 8) fb.set(x - 1 + ((t >> 2) & 1), y - 9, '#d8e0f0');
    }
    if (g.dying === 0 || g.dying > 60 || (g.dying & 4)) {
      const p = g.p, [x, y] = pos(p);
      const f = g.dying ? 0 : (p.mouth >> 3) & 1;
      const b = woolly(f);
      if (p.dir === 'left') fb.blit(b, x - 6, y - 6, { flipX: true });
      else if (p.dir === 'up' || p.dir === 'down') fb.blit(b, x - 6, y - 6, { flipX: p.dir === 'up' });
      else fb.blit(b, x - 6, y - 6);
    }
    for (const p of g.pops) K.text(fb, p.txt, p.x, p.y - 6, '#78f0f8', { align: 'center' });
    if (g.ready > 0) K.text(fb, 'READY!', OX + 14 * T, OY + 12 * T - 2, '#f8d048', { align: 'center' });
    if (g.clearT > 0) K.text(fb, 'ALL TIDY!', OX + 14 * T, OY + 12 * T - 2, '#f8d048', { align: 'center' });
  }

  function drawTitle(fb, t) {
    fb.clear('#120c20');
    fb.blit(mazeBmp(), OX, OY);
    fb.blendRect(0, 0, NP.W, NP.H, '#120c20', 0.7);
    K.center(fb, 'STEAM CHASE', 24, '#78d8f8');
    K.center(fb, 'Gobble every thread bead. Dodge the irons!', 40, '#f8f8f8');
    IRONS.forEach((d, i) => { fb.blit(ironBmp(i), 74, 58 + i * 15); K.text(fb, d.name, 92, 59 + i * 15, d.b); });
    fb.blit(RINSE(), 146, 60); K.text(fb, 'Soft Rinse', 156, 59, '#78c8f8');
    fb.blit(ironBmp(0, true), 147, 74); K.text(fb, '= cool, bump it!', 162, 74, '#78d8c8');
    fb.blit(woolly((t >> 3) & 1), 122, 124);
    K.center(fb, 'D-pad steer   Start pause', 144, '#a8a0c8');
  }

  AR.register('cab_3', {
    title: 'Steam Chase', cost: 3, lights: true, create, drawTitle,
    lifeIcon: () => K.memo('sc.life', () => woolly(0).crop(1, 1, 10, 10)),
    tickets: (score) => Math.floor(score / 80),
    bot(g, f) {
      // greedy: walk to the nearest bead, away from close hot irons (BFS on the tile grid)
      const p = g.p;
      if (p.prog !== 0 && f % 4) return [p.want];
      const danger = new Set();
      for (const r of g.irons) if (!r.eyes && !(r.cooled && g.cool > 0) && r.mode !== 'home') for (let dx = -2; dx <= 2; dx++) for (let dy = -2; dy <= 2; dy++) if (Math.abs(dx) + Math.abs(dy) <= 2) danger.add((r.x + dx) + ',' + (r.y + dy));
      const q = [[p.x, p.y, null]], seen = new Set([p.x + ',' + p.y]);
      while (q.length) {
        const [x, y, first] = q.shift();
        if (first && g.beads[y][x]) return [first];
        for (const d of ORDER) {
          const nx = (x + DIRS[d][0] + W) % W, ny = y + DIRS[d][1], k = nx + ',' + ny;
          if (seen.has(k) || !open(nx, ny) || danger.has(k)) continue;
          seen.add(k); q.push([nx, ny, first || d]);
        }
      }
      return [p.dir];
    },
    previewAt: [100, 700, 1600],
  });
  AR.steamChase = { MAZE, woolly, ironBmp };
})(typeof globalThis !== 'undefined' ? globalThis : window);
