/* src/game/arcade/button_breaker.js — cabinet 2, "Button Breaker": bounce a button off a thimble and knock out the rows of
 * fabric patches. A Kigu's picture is hidden behind every quilt, and it shows through as the patches come away. Denim patches
 * take two hits, and a few patches drop a power-up when they break. Needs the city lights. */
(function (root) {
  'use strict';
  const NP = root.NP;
  const { Input, Bitmap } = NP;
  const AR = NP.arcade, K = AR.kit;

  const L = 16, R = 240, TOP = 16, PADY = 176, BW = 16, BH = 8, COLS = 14, ROWS = 12, BY = 24;
  const PICS = ['konko', 'ottopi', 'sprubun', 'kittabra', 'lapinlily', 'scurrent', 'kumi', 'hunnibloom', 'molluna', 'kyuubelle'];

  // fabric patches: base, alt (pattern), dark edge
  const FABRICS = [
    { id: 'gingham', a: '#f8f0f0', b: '#e85870', e: '#8a2038' },
    { id: 'felt', a: '#f8c040', b: '#e09820', e: '#8a5810' },
    { id: 'mint', a: '#a8f0c8', b: '#58c890', e: '#206848' },
    { id: 'polka', a: '#a8c8f8', b: '#ffffff', e: '#3a5898' },
    { id: 'lilac', a: '#d8b0f0', b: '#b080d8', e: '#583088' },
    { id: 'denim', a: '#4868a8', b: '#7898d0', e: '#1c2850', hp: 2 },
  ];
  function patchBmp(f, cracked) {
    return K.memo('bb.' + f.id + (cracked ? 'x' : ''), () => {
      const b = new Bitmap(BW, BH);
      for (let y = 0; y < BH; y++) for (let x = 0; x < BW; x++) {
        let c = f.a;
        if (f.id === 'gingham') c = ((x >> 2) + (y >> 2)) & 1 ? f.b : f.a;
        else if (f.id === 'polka') c = (x % 5 === 2 && y % 4 === 2) ? f.b : f.a;
        else if (f.id === 'felt' || f.id === 'mint' || f.id === 'lilac') c = (x + y * 3) % 7 === 0 ? f.b : f.a;
        else if (f.id === 'denim') c = (x + y) % 3 === 0 ? f.b : f.a;
        b.set(x, y, c);
      }
      b.strokeRect(0, 0, BW, BH, f.e);
      // running stitch round the inside
      for (let x = 2; x < BW - 2; x += 3) { b.set(x, 1, '#fff8e8'); b.set(x, BH - 2, '#fff8e8'); }
      if (f.id === 'denim') { b.set(BW - 4, 3, '#e8c060'); b.set(BW - 4, 4, '#a07820'); }
      if (cracked) { b.line(3, 1, 7, 6, f.e); b.line(7, 6, 11, 2, f.e); }
      return b;
    });
  }
  const thimble = (w) => K.memo('bb.th' + w, () => {
    const b = new Bitmap(w, 9);
    b.fillRect(1, 0, w - 2, 9, '#5a6070');
    b.fillRect(2, 1, w - 4, 7, '#b8c0d0');
    b.hline(3, 1, w - 6, '#f0f4ff');
    b.hline(2, 7, w - 4, '#808898');
    for (let x = 4; x < w - 4; x += 3) for (let y = 3; y < 7; y += 2) b.set(x + ((y >> 1) & 1), y, '#8890a0');
    b.fillRect(0, 2, 1, 5, '#5a6070'); b.fillRect(w - 1, 2, 1, 5, '#5a6070');
    b.hline(1, 8, w - 2, '#383c48');
    return b;
  });
  const BUTTON = () => K.spr('bb.ball', ['.kkkk.', 'kyywyk', 'kkyyky', 'kyyy+k', 'ky+k+k', '.kkkk.'], { k: '#6a2810', y: '#f8b048', '+': '#c87020', w: '#fff0c0' });
  const PWR = {
    wide: { color: '#78d0f8', letter: 'W' },
    multi: { color: '#f8d048', letter: 'M' },
    slow: { color: '#a8f0a8', letter: 'S' },
  };
  // 5x5 letters for the power-up pills (the UI font is too tall for a 7px pill)
  const GLYPH = {
    W: ['k...k', 'k...k', 'k.k.k', 'kk.kk', 'k...k'],
    M: ['k...k', 'kk.kk', 'k.k.k', 'k...k', 'k...k'],
    S: ['.kkkk', 'k....', '.kkk.', '....k', 'kkkk.'],
  };
  const pill = (kind) => K.memo('bb.pill.' + kind, () => {
    const P = PWR[kind], b = new Bitmap(11, 9);
    b.fillRect(0, 0, 11, 9, '#202038'); b.fillRect(1, 1, 9, 7, P.color); b.hline(2, 1, 7, '#ffffff');
    GLYPH[P.letter].forEach((row, y) => [...row].forEach((ch, x) => { if (ch === 'k') b.set(3 + x, 2 + y, '#202038'); }));
    return b;
  });
  // a go is three quilts; clearing all three pays a bonus and ends the go
  const QUILTS = 3;

  function quiltBacking() {
    return K.memo('bb.quilt', () => {
      const b = new Bitmap(R - L, ROWS * BH);
      for (let y = 0; y < b.h; y++) for (let x = 0; x < b.w; x++) b.set(x, y, ((x >> 3) + (y >> 3)) & 1 ? '#2a2448' : '#241e3e');
      return b;
    });
  }

  function layout(stage) {
    const rows = [];
    for (let r = 0; r < ROWS; r++) {
      const row = [];
      for (let c = 0; c < COLS; c++) {
        let on = true;
        if (stage % 3 === 1) on = ((c + r) & 1) === 0 || r < 2;               // checkerboard with a solid top
        else if (stage % 3 === 2) on = Math.abs(c - 6.5) + Math.abs(r - 5.5) < 8; // diamond
        const f = r < 2 ? FABRICS[5] : FABRICS[(r >> 1) % 5];
        row.push(on ? { f, hp: f.hp || 1, x: L + c * BW, y: BY + r * BH } : null);
      }
      rows.push(row);
    }
    return rows;
  }

  function create() {
    const g = { score: 0, lives: 3, over: false, stage: 0, t: 0, px: 128, pw: 28, balls: [], drops: [], wideT: 0, slowT: 0, clearT: 0, sparks: [] };
    nextStage(g);
    g.update = () => update(g);
    g.draw = (fb, t) => draw(g, fb, t);
    return g;
  }
  function nextStage(g) {
    g.stage++;
    g.pic = PICS[(g.stage - 1) % PICS.length];
    g.grid = layout(g.stage - 1);
    g.mask = g.grid.map((row) => row.map(Boolean)); // where patches started: gaps in the pattern stay covered until the reveal
    g.left = g.grid.reduce((n, r) => n + r.filter(Boolean).length, 0);
    g.total = g.left;
    serve(g);
  }
  function serve(g) {
    g.balls = [{ x: g.px, y: PADY - 6, vx: 0, vy: 0, stuck: true }];
    g.drops = [];
    g.wideT = 0;
  }
  const speedOf = (g) => Math.min(3.6, 2.0 + g.stage * 0.2 + g.t / 6000) * (g.slowT > 0 ? 0.7 : 1);

  function update(g) {
    g.t++;
    for (const s of g.sparks) s.t--;
    g.sparks = g.sparks.filter((s) => s.t > 0);
    if (g.clearT > 0) {
      if (--g.clearT === 0) { if (g.stage >= QUILTS) { g.won = true; g.over = true; } else nextStage(g); }
      return;
    }
    if (g.wideT > 0) g.wideT--;
    if (g.slowT > 0) g.slowT--;
    g.pw = g.wideT > 0 ? 44 : 28;
    const sp = Input.held.b ? 4.5 : 3;
    if (Input.held.left) g.px = Math.max(L + g.pw / 2, g.px - sp);
    if (Input.held.right) g.px = Math.min(R - g.pw / 2, g.px + sp);

    for (const b of g.balls) {
      if (b.stuck) {
        b.x = g.px; b.y = PADY - 6;
        b.wait = (b.wait || 0) + 1;
        if (Input.pressed.a || b.wait > 300) { b.stuck = false; const v = speedOf(g); b.vx = v * 0.45 * (K.chance(0.5) ? 1 : -1); b.vy = -v; K.sfx('swing'); }
        continue;
      }
      // move in small sub-steps so a fast button never skips a patch
      const n = 3;
      for (let i = 0; i < n && !b.dead; i++) stepBall(g, b, b.vx / n, b.vy / n);
    }
    const before = g.balls.length;
    g.balls = g.balls.filter((b) => !b.dead);
    if (!g.balls.length && before) {
      g.lives--;
      K.sfx('faint');
      if (g.lives <= 0) { g.over = true; return; }
      serve(g);
    }

    for (const d of g.drops) {
      d.y += 1.1;
      if (K.hit({ x: d.x - 5, y: d.y, w: 11, h: 9 }, { x: g.px - g.pw / 2, y: PADY, w: g.pw, h: 9 })) {
        d.dead = true; g.score += 50; K.sfx('stat_up');
        if (d.kind === 'wide') g.wideT = 900;
        else if (d.kind === 'slow') g.slowT = 600;
        else if (d.kind === 'multi') {
          const src = g.balls.find((b) => !b.stuck) || g.balls[0];
          if (src) for (const a of [-0.6, 0.6]) { const v = speedOf(g); g.balls.push({ x: src.x, y: src.y, vx: v * a, vy: -v * 0.8, stuck: false }); }
        }
      }
      if (d.y > NP.H) d.dead = true;
    }
    g.drops = g.drops.filter((d) => !d.dead);
    if (g.left <= 0) { g.score += g.stage >= QUILTS ? 2000 : 500; g.clearT = 120; g.balls = []; g.drops = []; K.sfx('levelup'); }
  }

  function stepBall(g, b, dx, dy) {
    b.x += dx; b.y += dy;
    if (b.x < L + 3) { b.x = L + 3; b.vx = Math.abs(b.vx); wall(g, b); }
    if (b.x > R - 3) { b.x = R - 3; b.vx = -Math.abs(b.vx); wall(g, b); }
    if (b.y < TOP + 3) { b.y = TOP + 3; b.vy = Math.abs(b.vy); wall(g, b); }
    if (b.y > NP.H + 4) { b.dead = true; return; }
    // thimble
    if (b.vy > 0 && b.y + 3 >= PADY && b.y + 3 <= PADY + 5 && Math.abs(b.x - g.px) <= g.pw / 2 + 2) {
      const off = Math.max(-1, Math.min(1, (b.x - g.px) / (g.pw / 2)));
      const v = speedOf(g);
      const ang = off * 1.05; // radians from straight up
      b.vx = v * Math.sin(ang); b.vy = -v * Math.cos(ang);
      if (Math.abs(b.vy) < 0.8) b.vy = -0.8;
      if (Math.abs(b.vx) < 0.25) b.vx = b.vx < 0 ? -0.25 : 0.25; // never dead straight, or it can skim a patch seam forever
      b.y = PADY - 3;
      K.sfx('text');
      return;
    }
    // patches: test the button's leading edges (it is 6px round), not just its centre, so it never sinks into a patch
    const sx = Math.sign(b.vx), sy = Math.sign(b.vy);
    for (const [ox, oy, axis] of [[0, sy * 3, 'y'], [sx * 3, 0, 'x'], [0, 0, 'c']]) {
      const c = Math.floor((b.x + ox - L) / BW), r = Math.floor((b.y + oy - BY) / BH);
      if (r < 0 || r >= ROWS || c < 0 || c >= COLS || !g.grid[r][c]) continue;
      if (axis === 'y') b.vy = -b.vy;
      else if (axis === 'x') b.vx = -b.vx;
      else {
        // centre inside: bounce off the face we came through
        const pc = Math.floor((b.x - dx - L) / BW), pr = Math.floor((b.y - dy - BY) / BH);
        if (pr !== r) b.vy = -b.vy; else if (pc !== c) b.vx = -b.vx; else b.vy = -b.vy;
      }
      b.x -= dx; b.y -= dy;
      hitPatch(g, r, c);
      return;
    }
  }

  /** Wall bounce. If nothing has been hit for a while the button is probably stuck in a loop, so nudge its angle; near the
   * end of a quilt it waits less and the nudge leans toward one of the last patches, so the final few don't drag on. */
  function wall(g, b) {
    K.sfx('bump');
    const few = g.left <= 5;
    if (g.t - (g.lastHit || 0) < (few ? 180 : 480)) return;
    g.lastHit = g.t;
    const v = Math.hypot(b.vx, b.vy);
    let a = Math.atan2(b.vy, b.vx) + (K.rand(2) ? 0.25 : -0.25);
    if (few && b.vy < 0) {
      const left = [];
      for (const row of g.grid) for (const p of row) if (p) left.push(p);
      const p = left[K.rand(left.length)];
      if (p) a = Math.atan2(p.y + 4 - b.y, p.x + 8 - b.x);
    }
    b.vx = v * Math.cos(a); b.vy = v * Math.sin(a);
    if (Math.abs(b.vy) < 0.8) b.vy = b.vy < 0 ? -0.8 : 0.8;
  }

  function hitPatch(g, r, c) {
    g.lastHit = g.t;
    const p = g.grid[r][c];
    p.hp--;
    if (p.hp > 0) { K.sfx('rock'); g.score += 5; return; }
    g.grid[r][c] = null;
    g.left--;
    g.score += 10 + (ROWS - r) * 2;
    g.sparks.push({ x: p.x + 8, y: p.y + 4, t: 8 });
    K.sfx('hit');
    if (K.chance(0.09) && g.drops.length < 2) {
      const kinds = Object.keys(PWR);
      g.drops.push({ x: p.x + 8, y: p.y + 4, kind: kinds[K.rand(kinds.length)] });
    }
  }

  // ------------------------------------------------------------------------------------------- drawing
  function frameBorder(fb) {
    fb.clear('#141028');
    // stitched felt border round the playfield
    fb.fillRect(L - 8, TOP - 3, 8, NP.H, '#7a3a68'); fb.fillRect(R, TOP - 3, 8, NP.H, '#7a3a68'); fb.fillRect(L - 8, TOP - 3, R - L + 16, 3, '#7a3a68');
    for (let y = TOP; y < NP.H; y += 4) { fb.vline(L - 4, y, 2, '#f8c8e0'); fb.vline(R + 3, y, 2, '#f8c8e0'); }
    for (let x = L - 4; x < R + 4; x += 4) fb.hline(x, TOP - 2, 2, '#f8c8e0');
    fb.vline(L - 1, TOP, NP.H, '#4a1c40'); fb.vline(R, TOP, NP.H, '#4a1c40');
  }

  function draw(g, fb, t) {
    frameBorder(fb);
    fb.blit(quiltBacking(), L, BY);
    // the hidden Kigu, drawn under the patches
    const pic = NP.assets.kiguFront(g.pic, false, 0);
    if (pic) fb.blit(pic, 128 - (pic.w >> 1), BY + ROWS * BH - pic.h + 2);
    if (!g.clearT) for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) if (!g.mask[r][c]) fb.blit(K.memo('bb.gap' + (r & 1), () => quiltBacking().crop(0, (r & 1) * BH, BW, BH)), L + c * BW, BY + r * BH);
    for (const row of g.grid) for (const p of row) if (p) fb.blit(patchBmp(p.f, p.hp < (p.f.hp || 1)), p.x, p.y);
    for (const s of g.sparks) { const k = 8 - s.t; fb.set(s.x - k, s.y - k, '#fff8c8'); fb.set(s.x + k, s.y - k, '#fff8c8'); fb.set(s.x - k, s.y + k, '#fff8c8'); fb.set(s.x + k, s.y + k, '#fff8c8'); }
    for (const d of g.drops) {
      fb.blit(pill(d.kind), Math.round(d.x) - 5, Math.round(d.y));
    }
    if (!g.over || g.balls.length) fb.blit(thimble(g.pw), Math.round(g.px - g.pw / 2), PADY);
    for (const b of g.balls) fb.blit(BUTTON(), Math.round(b.x - 3), Math.round(b.y - 3));
    if (g.balls.length && g.balls[0].stuck && (t >> 4) & 1) K.center(fb, 'A: launch', 140, '#f8d048');
    if (g.clearT > 0) {
      K.center(fb, g.stage >= QUILTS ? 'ALL QUILTS CLEAR!' : 'QUILT CLEAR!', 132, '#f8d048');
      K.center(fb, 'It was ' + NP.data.species[g.pic].name + '!', 146, '#f8f8f8');
    }
  }

  function drawTitle(fb, t) {
    frameBorder(fb);
    fb.blit(quiltBacking(), L, BY);
    const pic = NP.assets.kiguFront('konko', false, 0);
    for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
      const hide = r >= 4 && r < 12 && c >= 4 && c < 10;
      if (!hide) fb.blit(patchBmp(r < 2 ? FABRICS[5] : FABRICS[(r >> 1) % 5]), L + c * BW, BY + r * BH);
    }
    if (pic) {
      const peek = pic.crop(16, 30, 64, 64);
      fb.blit(peek, L + 4 * BW + 0, BY + 4 * BH);
    }
    fb.fillRect(40, 122, 176, 34, '#141028');
    K.center(fb, 'BUTTON BREAKER', 124, '#f8b048');
    K.center(fb, 'Who is hiding behind the quilt?', 140, '#f8f8f8');
  }

  AR.register('cab_2', {
    title: 'Button Breaker', cost: 3, lights: true, create, drawTitle,
    lifeIcon: () => K.memo('bb.life', () => BUTTON().clone()),
    tickets: (score) => Math.floor(score / 100),
    bot(g) {
      const keys = [];
      const live = g.balls.filter((b) => !b.stuck);
      if (g.balls.some((b) => b.stuck)) keys.push('a');
      const b = live.sort((p, q) => q.y - p.y)[0];
      const drop = g.drops[0];
      const tx = b ? b.x + (b.vx > 0 ? 3 : -3) : drop ? drop.x : 128;
      if (tx < g.px - 3) keys.push('left'); else if (tx > g.px + 3) keys.push('right');
      return keys;
    },
  });
})(typeof globalThis !== 'undefined' ? globalThis : window);
