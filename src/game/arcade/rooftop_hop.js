/* src/game/arcade/rooftop_hop.js — the platformer cabinet, "Rooftop Hop": three short stages across the Shibuyarn rooftops
 * (morning, sunset, neon night). Konko runs and jumps from roof to roof, hops on lint bunnies, bonks spool crates for buttons and
 * reaches the neon GOAL sign before the clock runs out. Needs the city lights. */
(function (root) {
  'use strict';
  const NP = root.NP;
  const { Input, Bitmap } = NP;
  const AR = NP.arcade, K = AR.kit;

  const TS = 16, ROWS = 11, OY = 16, VIEW = 256;
  const GRAV = 0.25, JUMP = 4.7, WALK = 1.7, RUN = 2.5, MAXFALL = 5;

  // ------------------------------------------------------------------------------------------- stages
  // roofs: [x, width, top row]; plats (one-way awnings): [x, row, width]; boxes: [x, row]; coins: [x, row, count];
  // pins (pincushions, they hurt): [x, row, width]; foes: ['b'|'m', x, row]; tanks (solid water tanks, 2x2): [x, row]
  const STAGES = [
    {
      name: 'Morning Rooftops', sky: ['#88c8f8', '#b8e0f8', '#e0f0f8'], far: '#9ab8d8', near: '#7890b8', goal: 118,
      roofs: [[0, 16, 8], [19, 9, 8], [31, 7, 7], [41, 12, 8], [56, 6, 6], [64, 14, 8], [81, 5, 7], [89, 8, 8], [100, 22, 8]],
      plats: [[24, 5, 4], [45, 5, 3], [69, 4, 4], [93, 5, 3]],
      boxes: [[8, 4], [10, 4], [47, 2], [72, 1]],
      coins: [[16, 5, 3], [27, 3, 2], [36, 4, 3], [53, 4, 3], [60, 3, 3], [78, 4, 3], [86, 4, 2], [105, 5, 5]],
      pins: [[49, 7, 2], [74, 7, 1]],
      foes: [['b', 13, 7], ['b', 45, 7], ['b', 68, 7], ['b', 95, 7], ['b', 110, 7]],
      tanks: [[35, 5], [104, 6]],
    },
    {
      name: 'Sunset Wash Lines', sky: ['#f89868', '#f8b888', '#f8d8b0'], far: '#c8789a', near: '#985880', goal: 122,
      roofs: [[0, 12, 8], [15, 6, 7], [24, 6, 6], [33, 10, 8], [46, 4, 7], [53, 4, 6], [60, 12, 8], [75, 6, 6], [84, 10, 8], [97, 4, 7], [104, 22, 8]],
      plats: [[11, 5, 4], [36, 4, 3], [48, 3, 3], [63, 4, 4], [78, 3, 3], [88, 5, 3], [99, 4, 3]],
      boxes: [[5, 4], [38, 1], [66, 1], [90, 2]],
      coins: [[12, 3, 3], [20, 4, 2], [29, 3, 3], [44, 4, 2], [51, 3, 2], [57, 3, 3], [72, 4, 3], [82, 3, 2], [95, 4, 2], [110, 5, 5]],
      pins: [[39, 7, 2], [68, 7, 2], [90, 7, 2]],
      foes: [['b', 8, 7], ['m', 30, 3], ['b', 37, 7], ['m', 57, 2], ['b', 65, 7], ['b', 88, 7], ['m', 101, 3], ['b', 112, 7]],
      tanks: [[26, 4], [86, 6]],
    },
    {
      name: 'Neon Night', sky: ['#281848', '#382060', '#503070'], far: '#3a2a68', near: '#2a1c50', goal: 126, night: true,
      roofs: [[0, 10, 8], [13, 4, 7], [20, 4, 6], [27, 4, 5], [34, 9, 8], [47, 3, 7], [53, 3, 6], [59, 3, 7], [65, 12, 8], [80, 4, 6], [87, 4, 7], [94, 8, 8], [105, 3, 6], [111, 19, 8]],
      plats: [[37, 4, 3], [43, 3, 3], [68, 4, 4], [73, 3, 3], [97, 4, 3], [101, 3, 2]],
      boxes: [[6, 4], [40, 1], [70, 0], [99, 1]],
      coins: [[10, 4, 3], [17, 3, 2], [24, 2, 2], [31, 2, 3], [45, 2, 2], [50, 3, 2], [56, 3, 2], [62, 3, 2], [77, 3, 3], [84, 3, 2], [91, 4, 2], [103, 3, 2], [108, 3, 2], [116, 5, 5]],
      pins: [[38, 7, 2], [70, 7, 3], [96, 7, 2]],
      foes: [['b', 8, 7], ['m', 22, 2], ['b', 38, 7], ['m', 50, 2], ['b', 68, 7], ['b', 74, 7], ['m', 85, 2], ['b', 98, 7], ['m', 108, 2], ['b', 118, 7]],
      tanks: [[66, 6], [114, 6]],
    },
  ];

  function buildStage(def) {
    const w = def.goal + 8;
    const grid = [];
    for (let r = 0; r < ROWS; r++) grid.push(new Array(w).fill(' '));
    const put = (x, y, c) => { if (x >= 0 && x < w && y >= 0 && y < ROWS) grid[y][x] = c; };
    for (const [x, rw, top] of def.roofs) for (let i = 0; i < rw; i++) for (let y = top; y < ROWS; y++) put(x + i, y, y === top ? '=' : '#');
    for (const [x, y, rw] of def.plats) for (let i = 0; i < rw; i++) put(x + i, y, '-');
    for (const [x, y] of def.tanks) { put(x, y, 'T'); put(x + 1, y, 'T'); put(x, y + 1, 'T'); put(x + 1, y + 1, 'T'); }
    for (const [x, y] of def.boxes) put(x, y, '?');
    for (const [x, y, rw] of def.pins) for (let i = 0; i < rw; i++) put(x + i, y, '^');
    const coins = [];
    for (const [x, y, n] of def.coins) for (let i = 0; i < n; i++) coins.push({ x: (x + i) * TS + 4, y: OY + y * TS + 4 });
    const foes = def.foes.map(([k, x, y]) => ({ kind: k, x: x * TS, y: OY + y * TS + (k === 'b' ? 5 : 0), y0: OY + y * TS, vx: -0.5, alive: true, t: x * 7 }));
    return { def, w, grid, coins, foes, goalX: def.goal * TS };
  }

  const tileAt = (st, x, y) => {
    const c = Math.floor(x / TS), r = Math.floor((y - OY) / TS);
    if (c < 0 || c >= st.w) return '#';
    if (r < 0) return ' ';
    if (r >= ROWS) return ' ';
    return st.grid[r][c];
  };
  const solid = (c) => c === '#' || c === '=' || c === 'T' || c === '?' || c === 'x';

  // ------------------------------------------------------------------------------------------- sprites
  const HERO_PAL = { k: '#2a1810', o: '#f08838', O: '#c05818', h: '#5a3020', w: '#fff4e0', s: '#f8d0b0', e: '#302040', p: '#f8a0b0', y: '#f8d048' };
  const HEAD = [
    '...k........k...',
    '..kok......kok..',
    '..kOok.kk.koOk..',
    '..kOooooooooOk..',
    '..koohhhhhhoOk..',
    '..kohsssssshOk..',
    '..kosesssesoOk..',
    '..kosesssesoOk..',
    '...kpssssssspk..',
  ];
  const BODIES = {
    stand: [
      '....kkoooooOkk..',
      '...kooowwwwooOk.',
      '.kkksoowwwwoosk.',
      'kooOkkoowwwoOkk.',
      'kooook.ooooOk...',
      '.kkk..kooooOk...',
      '......kOk.kOk...',
      '.....kOOk.kOOk..',
      '.....kkk..kkkk..'],
    run1: [
      '....kkoooooOkk..',
      '...kooowwwwooOk.',
      '.kkksoowwwwoosk.',
      'kooOkkoowwwoOkk.',
      'kooook.oooooOk..',
      '.kkk..koooOkOk..',
      '.....kOOk..kOOk.',
      '....kOOk....kk..',
      '....kkk.........'],
    run2: [
      '....kkoooooOkk..',
      '...kooowwwwooOk.',
      '.kkksoowwwwoosk.',
      'kooOkkoowwwoOkk.',
      'kooook.ooooOk...',
      '.kkk...kOooOk...',
      '.......kOkOk....',
      '......kOOkOOk...',
      '......kkk.kkk...'],
    jump: [
      '..kkkkoooooOkkk.',
      '.ksoooowwwwooOsk',
      '.kk.koowwwwoOkk.',
      '.kkkkkoowwwoOk..',
      'kooOk.oooooOk...',
      'koooOkkOk.kOk...',
      '.kkk..kOOkkOOk..',
      '.......kk..kk...',
      '................'],
  };
  const hero = (pose) => K.memo('rh.hero.' + pose, () => {
    const b = new Bitmap(16, 18);
    b.blit(Bitmap.fromRows(BODIES[pose], HERO_PAL), 0, 9);
    b.blit(Bitmap.fromRows(HEAD, HERO_PAL), 0, pose === 'run1' ? 1 : 0);
    return b;
  });
  const BUNNY = () => AR.mothPatrol.BUNNY();
  const MOTH = (f) => AR.mothPatrol.moth('tiger', f);
  const BTN = (f) => K.spr('rh.btn' + f, f ? ['..kk..', '.kyyk.', '.kyyk.', '.kyyk.', '.kyyk.', '..kk..'] : ['.kkkk.', 'kyywyk', 'kykyky', 'ky+y+k', 'kyy++k', '.kkkk.'], { k: '#6a3810', y: '#f8c848', '+': '#c88820', w: '#fff8d0' });

  function tileBmp(c, night, variant) {
    return K.memo('rh.t' + c + (night ? 'n' : '') + variant, () => {
      const b = new Bitmap(TS, TS);
      const wall = night ? ['#3a3060', '#2e2650', '#4a4078'] : ['#c8b8a8', '#a89888', '#e0d4c4'];
      if (c === '#' || c === '=') {
        b.fillRect(0, 0, TS, TS, wall[0]);
        for (let y = 3; y < TS; y += 5) b.hline(0, y, TS, wall[1]);
        for (let y = 0; y < TS; y += 5) b.vline(((y / 5) & 1) ? 4 : 11, y, 3, wall[1]);
        if (c === '#' && variant % 3 === 1) { b.fillRect(4, 4, 8, 7, night ? '#f8d070' : '#78a0c8'); b.strokeRect(3, 3, 10, 9, night ? '#584070' : '#706050'); b.vline(8, 4, 7, night ? '#c89850' : '#5880a8'); }
        if (c === '=') {
          b.fillRect(0, 0, TS, 4, night ? '#68609a' : '#f0e8d8');
          b.hline(0, 0, TS, night ? '#9890c8' : '#ffffff');
          b.hline(0, 4, TS, night ? '#1c1638' : '#786858');
        }
      } else if (c === 'T') {
        b.fillRect(1, 0, 14, TS, '#5a7890'); b.vline(1, 0, TS, '#30485a'); b.vline(14, 0, TS, '#30485a');
        b.vline(4, 0, TS, '#7898b0'); b.hline(1, (variant & 1) ? 12 : 4, 14, '#30485a');
      } else if (c === '?' || c === 'x') {
        b.fillRect(0, 0, TS, TS, '#6a3a18'); b.fillRect(1, 1, 14, 14, c === 'x' ? '#8a6a48' : '#c88848');
        b.hline(1, 1, 14, c === 'x' ? '#a08060' : '#f0b870'); b.vline(1, 1, 14, c === 'x' ? '#a08060' : '#f0b870');
        b.hline(1, 14, 14, c === 'x' ? '#6a4a30' : '#a86830'); b.vline(14, 1, 14, c === 'x' ? '#6a4a30' : '#a86830');
        if (c === '?') {
          // a big sewing button stitched onto the crate: four holes and a cream thread cross
          b.circle(8, 8, 5, '#802030', true); b.circle(8, 8, 4, '#e84860', true);
          b.set(6, 5, '#f8a0b0'); b.set(5, 6, '#f8a0b0'); b.set(7, 5, '#f8a0b0');
          for (const [hx, hy] of [[6, 6], [9, 6], [6, 9], [9, 9]]) b.fillRect(hx, hy, 2, 2, '#501020');
          b.line(7, 7, 9, 9, '#fff4dc'); b.line(9, 7, 7, 9, '#fff4dc');
        }
      } else if (c === '-') {
        // shop awning: red and cream stripes with a scalloped hem
        for (let x = 0; x < TS; x++) b.vline(x, 0, 5, ((x >> 2) & 1) ? '#f8f0e0' : '#d83848');
        for (let x = 0; x < TS; x += 4) { b.set(x + 1, 5, '#d83848'); b.set(x + 2, 5, '#d83848'); }
        b.hline(0, 0, TS, '#781828');
      } else if (c === '^') {
        // a tomato pincushion bristling with pins
        b.ellipse(8, 12, 7, 4, '#c82838', true); b.ellipse(8, 12, 7, 4, '#601018', false); b.hline(4, 10, 8, '#f86878');
        for (const [x, h] of [[3, 6], [6, 9], [9, 8], [12, 6]]) { b.vline(x, 12 - h, h - 1, '#d0d8e8'); b.set(x, 12 - h, '#f8d048'); b.set(x, 11 - h, '#f8d048'); }
        b.fillRect(7, 6, 3, 2, '#48a048');
      }
      return b;
    });
  }

  function goalBmp(t) {
    const b = new Bitmap(24, 48);
    b.fillRect(11, 8, 2, 40, '#606878');
    const on = ((t >> 4) % 6) !== 0;
    b.fillRect(0, 0, 24, 12, '#201838'); b.strokeRect(0, 0, 24, 12, on ? '#f878c8' : '#583050');
    K.text(b, 'GOAL', 12, 1, on ? '#78f0f8' : '#285060', { align: 'center', outline: null });
    return b;
  }

  // ------------------------------------------------------------------------------------------- game
  function create() {
    const g = { score: 0, lives: 3, over: false, stageN: -1, t: 0, buttons: 0, pops: [] };
    nextStage(g);
    g.update = () => update(g);
    g.draw = (fb, t) => draw(g, fb, t);
    return g;
  }
  function nextStage(g) {
    g.stageN++;
    if (g.stageN >= STAGES.length) { g.over = true; g.endTitle = 'ALL ROOFS CLEAR!'; g.won = true; return; }
    g.st = buildStage(STAGES[g.stageN]);
    respawn(g);
    g.time = 200;
    g.banner = 120;
  }
  function respawn(g, died) {
    // a moment of blinking safety so a bunny patrolling the start can't knock you straight out again
    g.p = { x: 24, y: OY + 8 * TS - 18, vx: 0, vy: 0, ground: false, face: 1, hurt: died ? 90 : 0, anim: 0 };
    // after a time-out the clock gets some time back, or every life would drain away one second apart
    if (died && g.time <= 30) g.time = 100;
    g.cam = 0;
    g.dying = 0;
    g.goalT = 0;
  }

  function update(g) {
    g.t++;
    for (const p of g.pops) p.t--;
    g.pops = g.pops.filter((p) => p.t > 0);
    if (g.banner > 0) g.banner--;
    const st = g.st, p = g.p;
    if (g.dying > 0) {
      p.vy = Math.min(MAXFALL, p.vy + GRAV); p.y += p.vy;
      if (--g.dying === 0) { if (g.lives <= 0) g.over = true; else respawn(g, true); }
      return;
    }
    if (g.goalT > 0) {
      // slide down the sign pole, then count the clock into points
      if (g.time > 0) { const d = Math.min(g.time, 2); g.time -= d; g.score += d * 5; if ((g.t & 3) === 0) K.sfx('cursor'); }
      else if (--g.goalT === 0) nextStage(g);
      return;
    }
    if (g.t % 60 === 0 && g.banner === 0) { g.time--; if (g.time <= 0) return kill(g); }

    // run / walk
    const top = Input.held.b ? RUN : WALK;
    const acc = p.ground ? 0.18 : 0.1;
    if (Input.held.left) { p.vx = Math.max(-top, p.vx - acc); p.face = -1; }
    else if (Input.held.right) { p.vx = Math.min(top, p.vx + acc); p.face = 1; }
    else p.vx *= p.ground ? 0.78 : 0.95;
    if (Math.abs(p.vx) < 0.05) p.vx = 0;
    if (Input.pressed.a && p.ground) { p.vy = -JUMP - Math.abs(p.vx) * 0.25; p.ground = false; K.sfx('ledge'); }
    if (!Input.held.a && p.vy < -2) p.vy = -2; // short hop when A is let go early
    p.vy = Math.min(MAXFALL, p.vy + GRAV);

    // horizontal move + wall check
    p.x += p.vx;
    const bw = 10, ox = 3; // hit box 10x16 inside the 16x18 cell
    for (const yy of [p.y + 3, p.y + 10, p.y + 16]) {
      if (p.vx > 0 && solid(tileAt(st, p.x + ox + bw, yy))) { p.x = Math.floor((p.x + ox + bw) / TS) * TS - ox - bw - 0.01; p.vx = 0; }
      if (p.vx < 0 && solid(tileAt(st, p.x + ox, yy))) { p.x = Math.floor((p.x + ox) / TS + 1) * TS - ox; p.vx = 0; }
    }
    if (p.x < 0) p.x = 0;
    // vertical move
    const oldBottom = p.y + 17;
    p.y += p.vy;
    p.ground = false;
    if (p.vy >= 0) {
      for (const xx of [p.x + ox + 1, p.x + ox + bw - 1]) {
        const c = tileAt(st, xx, p.y + 17);
        const rowTop = Math.floor((p.y + 17 - OY) / TS) * TS + OY;
        if (solid(c) || (c === '-' && oldBottom <= rowTop + 1)) { p.y = rowTop - 17; p.vy = 0; p.ground = true; break; }
      }
    } else {
      for (const xx of [p.x + ox + 2, p.x + ox + bw - 2]) {
        const c = tileAt(st, xx, p.y);
        if (solid(c)) {
          const r = Math.floor((p.y - OY) / TS), col = Math.floor(xx / TS);
          p.y = (r + 1) * TS + OY; p.vy = 0.5;
          if (c === '?') { st.grid[r][col] = 'x'; g.buttons++; g.score += 50; g.pops.push({ x: col * TS + 5, y: r * TS + OY - 4, t: 24, btn: true }); K.sfx('pickup'); }
          else K.sfx('bump');
          break;
        }
      }
    }
    p.anim += Math.abs(p.vx);
    if (p.y > NP.H + 8) return kill(g, true);
    if (p.hurt > 0) p.hurt--;
    // pincushions
    if (tileAt(st, p.x + 8, p.y + 14) === '^') return kill(g);

    // buttons
    for (const c of st.coins) if (!c.got && K.hit({ x: p.x + ox, y: p.y, w: bw, h: 17 }, { x: c.x, y: c.y, w: 6, h: 6 })) { c.got = true; g.buttons++; g.score += 10; K.sfx('pickup'); }
    if (g.buttons >= 50) { g.buttons -= 50; g.lives++; K.sfx('levelup'); }

    // foes
    for (const f of st.foes) {
      if (!f.alive) { f.dy = (f.dy || 0) + 0.3; f.y += f.dy; continue; }
      if (Math.abs(f.x - p.x) > VIEW + 32) continue;
      f.t++;
      if (f.kind === 'b') {
        f.x += f.vx;
        const ahead = f.vx < 0 ? f.x : f.x + 16;
        if (solid(tileAt(st, ahead, f.y + 6)) || tileAt(st, ahead, f.y + 6) === '^' || !solid(tileAt(st, ahead, f.y + 14)) && tileAt(st, ahead, f.y + 14) !== '-') f.vx = -f.vx; // pincushions turn bunnies too
      } else {
        f.x -= 0.6;
        f.y = f.y0 + Math.sin(f.t / 18) * 14;
      }
      const fb = f.kind === 'b' ? { x: f.x + 2, y: f.y + 2, w: 12, h: 9 } : { x: f.x, y: f.y, w: 12, h: 9 };
      if (K.hit({ x: p.x + ox, y: p.y + 2, w: bw, h: 15 }, fb)) {
        if (p.vy > 0.5 && p.y + 12 < fb.y + 4) { f.alive = false; p.vy = Input.held.a ? -4.6 : -3; g.score += 100; g.pops.push({ x: f.x, y: f.y, t: 30, txt: '100' }); K.sfx('punch'); }
        else if (p.hurt === 0) return kill(g);
      }
    }
    // goal
    if (p.x + 8 >= st.goalX) { g.goalT = 50; g.score += 1000; K.sfx('levelup'); }
    // camera
    g.cam = Math.max(0, Math.min(st.w * TS - VIEW, Math.round(p.x - 100)));
  }

  function kill(g, fell) {
    g.lives--;
    g.dying = 90;
    g.p.vy = fell ? 0 : -4;
    K.sfx('faint');
  }

  // ------------------------------------------------------------------------------------------- drawing
  function skyline(fb, def, cam, t) {
    const [a, b, c] = def.sky;
    for (let y = 0; y < NP.H; y++) fb.hline(0, y, NP.W, y < 60 ? a : y < 110 ? b : c);
    if (def.night) K.speckle(fb, 11, 40, ['#f8f8ff', '#a8a0e0'], 14, 90, 0);
    else { fb.circle(206, 40, 12, def.name.startsWith('Sunset') ? '#f8e098' : '#fff8e0', true); }
    // far skyline (slow parallax), near skyline (faster)
    const farX = -((cam * 0.25) | 0), nearX = -((cam * 0.5) | 0);
    for (let i = -1; i < 22; i++) {
      const bx = farX % 40 + i * 20, h = 30 + ((i * 37 + 11) % 5) * 9 + (((i - Math.floor(farX / 40) * 2) * 13) % 3) * 4;
      fb.fillRect(bx, 150 - h, 18, h + 50, def.far);
      // a lighter roof cap and a sparse grid of windows one shade darker
      fb.blendRect(bx, 150 - h, 18, 1, '#ffffff', 0.25);
      for (let wy = 154 - h; wy < 150; wy += 6) for (let wx = bx + 3; wx < bx + 16; wx += 4) if (((wx - farX + wy * 5) % 3) !== 0) fb.blendRect(wx, wy, 1, 2, '#101030', 0.16);
    }
    for (let i = -1; i < 14; i++) {
      const k = i - Math.floor(nearX / 52) * 2;
      const bx = nearX % 52 + i * 26, h = 20 + ((k * 29 + 7) % 4) * 12;
      fb.fillRect(bx, 168 - h, 24, h + 40, def.near);
      if (def.night) for (let wy = 172 - h; wy < 186; wy += 7) for (let wx = bx + 3; wx < bx + 22; wx += 5) if (((wx + wy * 3 + k) % 4) === 0) fb.fillRect(wx, wy, 2, 3, '#f8d070');
    }
  }

  function draw(g, fb, t) {
    const st = g.st || buildStage(STAGES[STAGES.length - 1]);
    skyline(fb, st.def, g.cam || 0, t);
    const c0 = Math.floor(g.cam / TS), night = !!st.def.night;
    for (let r = 0; r < ROWS; r++) for (let c = c0; c <= c0 + 17 && c < st.w; c++) {
      const ch = st.grid[r][c];
      if (ch === ' ') continue;
      const x = c * TS - g.cam, y = OY + r * TS;
      fb.blit(tileBmp(ch, night, (c * 7 + r * 3) % 5), x, y);
      // the side walls where a roof ends at a gap: a dark edge and a strip of shade
      if (ch === '#' || ch === '=') {
        if (c + 1 < st.w && st.grid[r][c + 1] === ' ') { fb.fillRect(x + 13, y, 2, TS, night ? '#241c44' : '#8a7a6a'); fb.vline(x + 15, y, TS, '#201830'); }
        if (c > 0 && st.grid[r][c - 1] === ' ') fb.vline(x, y, TS, '#201830');
      }
    }
    fb.blit(goalBmp(t), st.goalX - g.cam - 4, OY + 8 * TS - 48);
    if (g.over) return; // the results card sits on a quiet scene: no pickups, foes or pops showing through
    for (const c of st.coins) if (!c.got) fb.blit(BTN(((t + c.x) >> 4) & 1 && ((t + c.x) & 15) < 4 ? 1 : 0), c.x - g.cam, c.y);
    for (const f of st.foes) {
      if (f.y > NP.H) continue;
      const x = Math.round(f.x - g.cam), y = Math.round(f.y);
      if (f.kind === 'b') fb.blit(BUNNY(), x, y + (f.alive ? ((f.t >> 3) & 1) : 0), { flipX: f.vx > 0, flipY: !f.alive });
      else fb.blit(MOTH((f.t >> 3) & 1), x, y, { flipY: !f.alive });
    }
    const p = g.p;
    if (p && !(g.dying === 0 && p.hurt > 0 && (t & 2))) {
      const pose = !p.ground || g.dying ? 'jump' : Math.abs(p.vx) > 0.2 ? ((p.anim >> 3) & 1 ? 'run1' : 'run2') : 'stand';
      fb.blit(hero(pose), Math.round(p.x - g.cam), Math.round(p.y), { flipX: p.face < 0 });
    }
    for (const q of g.pops) {
      if (q.btn) fb.blit(BTN(0), q.x - g.cam, q.y - (24 - q.t));
      else K.text(fb, q.txt, q.x - g.cam, q.y - (30 - q.t) / 2, '#f8f8f8');
    }
    // stage HUD under the shared strip
    fb.blit(BTN(0), 4, 15); K.text(fb, 'x' + K.pad(g.buttons, 2), 12, 14, '#f8f8f8');
    K.text(fb, 'TIME ' + K.pad(g.time, 3), NP.W - 4, 14, g.time < 40 && (t & 16) ? '#f87878' : '#f8f8f8', { align: 'right' });
    if (g.banner > 0) {
      K.center(fb, 'STAGE ' + (g.stageN + 1), 70, '#f8d048');
      K.center(fb, st.def.name, 84, '#f8f8f8');
    }
  }

  function drawTitle(fb, t) {
    const st = buildStage(STAGES[0]);
    skyline(fb, st.def, 0, t);
    for (let r = 0; r < ROWS; r++) for (let c = 0; c < 17; c++) { const ch = st.grid[r][c]; if (ch !== ' ') fb.blit(tileBmp(ch, false, (c * 7 + r * 3) % 5), c * TS, OY + r * TS); }
    fb.fillRect(0, 14, NP.W, 54, '#101028'); fb.hline(0, 67, NP.W, '#3a3a6a');
    K.center(fb, 'ROOFTOP HOP', 22, '#f8b048');
    K.center(fb, 'Run across Shibuyarn and reach the GOAL sign!', 38, '#f8f8f8');
    K.center(fb, 'A jump   B hold to run   hop on lint bunnies', 52, '#a8a0c8');
    fb.blit(hero((t >> 4) & 1 ? 'run1' : 'run2'), 60, OY + 8 * TS - 18);
    fb.blit(BUNNY(), 150, OY + 8 * TS - 11);
  }

  AR.register('platformer', {
    title: 'Rooftop Hop', cost: 3, lights: true, create, drawTitle,
    lifeIcon: () => K.memo('rh.life', () => hero('stand').crop(3, 0, 10, 8)),
    tickets: (score, g) => Math.floor(score / 200) + (g && g.won ? 10 : 0),
    bot(g, f) {
      // run right, jump at gaps, walls, pins and foes ahead
      const p = g.p, st = g.st;
      if (!p || !st) return [];
      // walk (no B) near pincushions: a running hop over them can carry you into the gap behind
      const nearPin = [16, 32, 48].some((dx) => tileAt(st, p.x + 8 + dx, p.y + 14) === '^');
      if (p.ground) g.botWalk = nearPin;
      const keys = g.botWalk ? ['right'] : ['right', 'b'];
      const ahead = (dx, dy) => tileAt(st, p.x + 8 + dx, p.y + 17 + dy);
      const gap = !solid(ahead(14, 2)) && ahead(14, 2) !== '-';
      const wall = solid(ahead(12, -4)) || solid(ahead(12, -14));
      const pin = ahead(20, -3) === '^' || ahead(28, -3) === '^';
      const foe = st.foes.some((q) => q.alive && q.x - p.x > 0 && q.x - p.x < 40 && Math.abs(q.y - p.y) < 30);
      if (p.ground && (gap || wall || pin || foe)) keys.push('a');
      if (!p.ground && p.vy < 0) keys.push('a');
      return keys;
    },
    botFrames: 9000,
    previewAt: [150, 500, 1500],
  });
})(typeof globalThis !== 'undefined' ? globalThis : window);
