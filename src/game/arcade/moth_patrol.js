/* src/game/arcade/moth_patrol.js — cabinet 1, "Moth Patrol": a fixed shooter. A Kigu on a spool cart fires sewing needles at
 * rows of marching clothes moths before they reach the wardrobe. Fabric bolts give cover and fray when hit. Works during the
 * Shibuyarn brownout (it runs off its own battery, says the owner). */
(function (root) {
  'use strict';
  const NP = root.NP;
  const { Input } = NP;
  const AR = NP.arcade, K = AR.kit;

  const TOP = 14, GROUND = 178, PY = 162;

  // ------------------------------------------------------------------------------------------- sprites
  const PAL_KIGU = { k: '#2a1810', o: '#f08838', O: '#c05818', w: '#fff4e0', s: '#f8d0b0', e: '#302040', p: '#f8a0b0', r: '#d83848', R: '#982030', t: '#c89058', T: '#8a5a30', h: '#ffffff' };
  const KIGU = [
    '..k..........k..',
    '.kok........kok.',
    '.kOok.kkkk.kooOk',
    '.kOoookooookoOOk',
    '..kooooooooooOOk',
    '..kowssssssswOk.',
    '..kossesssesosk.',
    '..kosshsssheosk.',
    '...kspssssspsk..',
    '...kkwwwwwwwkk..',
    '..kTtttttttttTk.',
    '..kRrrrrrrrrrRk.',
    '..kRrrrrrrrrrRk.',
    '..kTtttttttttTk.',
    '...kk.....kkk...',
  ];
  const kigu = () => K.spr('mp.kigu', KIGU, PAL_KIGU);
  const lifeIcon = () => K.memo('mp.life', () => {
    const b = new NP.Bitmap(9, 8);
    b.blit(kigu(), -4, 0, { sw: 16, sh: 8 });
    return b.crop(0, 0, 9, 8);
  });

  // three moth kinds x two wing frames; 12x10
  const MOTHS = {
    dust: { pts: 10, pal: { k: '#2a2030', w: '#b8a890', W: '#887860', b: '#685848', e: '#ffffff', p: '#201828' } },
    tiger: { pts: 20, pal: { k: '#2a1810', w: '#f8b048', W: '#c86828', b: '#583020', e: '#ffffff', p: '#201010' } },
    luna: { pts: 30, pal: { k: '#183028', w: '#a8f0c8', W: '#58b890', b: '#e8f8f0', e: '#ffffff', p: '#183028' } },
  };
  const MOTH_ROWS = [
    ['.k........k.',
     '..k......k..',
     'kk.kbbbbk.kk',
     'kwwkbeebkwwk',
     'kwWkbpbpkWwk',
     'kwwwkbbkwwwk',
     '.kwWkbbkWwk.',
     '..kk.kk.kk..',
     '....k..k....',
     '............'],
    ['...k....k...',
     '....k..k....',
     '...kbbbbk...',
     '.kkkbeebkkk.',
     'kwwkbpbpkwwk',
     'kwWwkbbkwWwk',
     'kwwWkbbkWwwk',
     '.kwwkbbkwwk.',
     '..kk.kk.kk..',
     '....k..k....'],
  ];
  const moth = (kind, f) => K.spr('mp.' + kind + f, MOTH_ROWS[f], MOTHS[kind].pal);
  const BUNNY = K.spr.bind(null, 'mp.bunny', [
    '..kk......kk....',
    '.kwwk....kwwk...',
    '.kwpk....kpwk...',
    '..kwwkkkkwwk....',
    '.kwwwwwwwwwwk...',
    'kwwekwwwwkewwk..',
    'kwwkkwwwwkkwwkkk',
    'kwwwwwppwwwwwkwk',
    '.kwwwwwwwwwwwkk.',
    '..kkwwkkkwwkk...',
    '....kk...kk.....',
  ], { k: '#383048', w: '#e8e0f0', p: '#f898b8', e: '#ffffff' });
  const LINT = () => K.spr('mp.lint', ['.kk.', 'kwwk', 'kwwk', '.kk.', '..k.', '.k..'], { k: '#605870', w: '#c8c0d8' });
  const POP = () => K.spr('mp.pop', [
    'k...k...k',
    '.k..k..k.',
    '..k...k..',
    'kk.....kk',
    '..k...k..',
    '.k..k..k.',
    'k...k...k'], { k: '#f8f0a0' });

  function boltBmp() {
    // a bolt of gingham cloth lying on its side: 24x14, rolled end on the left
    const b = new NP.Bitmap(24, 14);
    for (let y = 1; y < 13; y++) for (let x = 3; x < 24; x++) {
      const cx = ((x >> 2) & 1), cy = ((y >> 2) & 1);
      b.set(x, y, cx && cy ? '#c83850' : cx || cy ? '#e88090' : '#fff0f0');
    }
    b.hline(3, 0, 21, '#5a1828'); b.hline(3, 13, 21, '#5a1828'); b.vline(23, 1, 12, '#5a1828');
    b.ellipse(3, 7, 3, 6, '#f8c8d0', true); b.ellipse(3, 7, 3, 6, '#5a1828', false); b.ellipse(3, 7, 1, 2, '#c83850', true);
    return b;
  }

  // ------------------------------------------------------------------------------------------- game
  function create() {
    const g = { score: 0, lives: 3, over: false, wave: 0, t: 0, px: 120, shots: [], lint: [], pops: [], bolts: [], bunny: null, dead: 0, clearT: 0 };
    newWave(g);
    g.update = () => update(g);
    g.draw = (fb, t) => draw(g, fb, t);
    return g;
  }

  function newWave(g) {
    g.wave++;
    // fresh cloth bolts every wave
    g.bolts = [28, 82, 150, 204].map((x) => ({ x, y: 136, bmp: boltBmp() }));
    g.bunny = null;
    g.moths = [];
    const kinds = ['luna', 'tiger', 'tiger', 'dust', 'dust'];
    const drop = Math.min(3, g.wave - 1) * 8;
    for (let r = 0; r < 5; r++) for (let c = 0; c < 9; c++) g.moths.push({ kind: kinds[r], x: 42 + c * 18, y: 26 + drop + r * 15, alive: true });
    g.dir = 1;
    g.step = 0;
    g.frame = 0;
  }

  function update(g) {
    g.t++;
    if (g.clearT > 0) { if (--g.clearT === 0) newWave(g); tickFx(g); return; }
    if (g.wave === 1 && g.t < 60) return; // GET READY!
    // player
    if (g.dead > 0) {
      if (--g.dead === 0) { if (g.lives <= 0) { g.over = true; } else { g.px = 120; g.lint = []; } }
      tickFx(g);
      return;
    }
    if (Input.held.left) g.px = Math.max(10, g.px - 2);
    if (Input.held.right) g.px = Math.min(NP.W - 10, g.px + 2);
    if (Input.pressed.a && g.shots.length < 2) { g.shots.push({ x: g.px, y: PY - 4 }); K.sfx('whoosh'); }

    // needles
    for (const s of g.shots) {
      s.y -= 5;
      for (const m of g.moths) {
        if (!m.alive) continue;
        if (K.hit({ x: s.x, y: s.y, w: 1, h: 6 }, { x: m.x, y: m.y, w: 12, h: 9 })) {
          m.alive = false; s.dead = true; g.score += MOTHS[m.kind].pts; g.pops.push({ x: m.x + 2, y: m.y + 1, t: 10 }); K.sfx('hit'); break;
        }
      }
      if (!s.dead && g.bunny && K.hit({ x: s.x, y: s.y, w: 1, h: 6 }, { x: g.bunny.x, y: 16, w: 16, h: 11 })) {
        const pts = [50, 100, 150][K.rand(3)];
        g.score += pts; g.pops.push({ x: g.bunny.x + 4, y: 18, t: 30, txt: String(pts) }); g.bunny = null; s.dead = true; K.sfx('sparkle');
      }
      if (!s.dead && chipBolt(g, s.x, s.y, -1)) s.dead = true;
      if (s.y < TOP) s.dead = true;
    }
    g.shots = g.shots.filter((s) => !s.dead);

    // formation march: fewer moths = faster
    const alive = g.moths.filter((m) => m.alive);
    if (!alive.length) { g.score += 100 * g.wave; g.clearT = 70; g.shots = []; g.lint = []; g.bunny = null; K.sfx('levelup'); return; }
    const period = Math.max(2, Math.floor(alive.length / 2.2) - (g.wave - 1) * 2);
    if (++g.step >= period) {
      g.step = 0;
      g.frame ^= 1;
      let minX = 999, maxX = -1;
      for (const m of alive) { minX = Math.min(minX, m.x); maxX = Math.max(maxX, m.x + 12); }
      if ((g.dir > 0 && maxX + 3 > NP.W - 4) || (g.dir < 0 && minX - 3 < 4)) { g.dir = -g.dir; for (const m of alive) m.y += 6; }
      else for (const m of alive) m.x += 3 * g.dir;
    }
    for (const m of alive) {
      if (m.y + 9 >= PY) { g.lives = 0; die(g); return; }
      // moths eat the cloth they fly into
      for (const b of g.bolts) if (K.hit({ x: m.x, y: m.y, w: 12, h: 9 }, { x: b.x, y: b.y, w: 24, h: 14 })) b.bmp.fillRect(m.x - b.x, m.y - b.y, 12, 9, 0);
    }

    // lint drops from the lowest moth of a column. The rate shrinks with the columns left, so the last few moths can't wall
    // the cart in, moths flying low over the cart hold their lint (too close to dodge), and one drop in three is aimed at
    // the cart so hiding in a corner doesn't work
    const cols = {};
    for (const m of alive) { const k = Math.round(m.x / 6); if (!cols[k] || cols[k].y < m.y) cols[k] = m; }
    const keys = Object.keys(cols).filter((k) => cols[k].y + 9 <= 140);
    const rate = (0.012 + g.wave * 0.006 + (45 - alive.length) * 0.0006) * Math.min(1, keys.length / 9);
    if (keys.length && g.lint.length < Math.min(3 + g.wave, 2 * keys.length) && K.chance(rate * 3)) {
      let m = cols[keys[K.rand(keys.length)]];
      if (K.rand(3) === 0) for (const k of keys) if (Math.abs(cols[k].x + 6 - g.px) < Math.abs(m.x + 6 - g.px)) m = cols[k];
      g.lint.push({ x: m.x + 4, y: m.y + 9, v: 1.2 + g.wave * 0.2 });
    }
    for (const l of g.lint) {
      l.y += l.v;
      if (chipBolt(g, l.x + 2, l.y + 4, 1)) l.dead = true;
      else if (K.hit({ x: l.x, y: l.y, w: 4, h: 5 }, { x: g.px - 6, y: PY, w: 12, h: 13 })) { l.dead = true; die(g); }
      else if (l.y > GROUND) l.dead = true;
    }
    g.lint = g.lint.filter((l) => !l.dead);

    // the dust bunny balloon drifts across now and then
    if (!g.bunny && g.t % 900 === 450) g.bunny = { x: g.t % 1800 < 900 ? -16 : NP.W, v: g.t % 1800 < 900 ? 1 : -1 };
    if (g.bunny) { g.bunny.x += g.bunny.v * 0.75; if (g.bunny.x < -20 || g.bunny.x > NP.W + 4) g.bunny = null; }
    tickFx(g);
  }

  function tickFx(g) { for (const p of g.pops) p.t--; g.pops = g.pops.filter((p) => p.t > 0); }

  function die(g) {
    g.lives = Math.max(0, g.lives - 1);
    g.dead = 80;
    g.shots = [];
    g.pops.push({ x: g.px - 4, y: PY + 2, t: 24 });
    K.sfx('faint');
  }

  /** Fray the cloth bolt at (x,y): clears a small ragged patch. dir -1 = from below (needle), 1 = from above (lint). */
  function chipBolt(g, x, y, dir) {
    for (const b of g.bolts) {
      const lx = Math.round(x - b.x), ly = Math.round(y - b.y);
      if (lx < 0 || lx >= 24 || ly < 0 || ly >= 14) continue;
      if (!b.bmp.isOpaque(lx, ly)) continue;
      for (let i = 0; i < 7; i++) {
        const ox = lx + K.rand(5) - 2, oy = ly + dir * K.rand(3) + K.rand(3) - 1;
        if (ox >= 0 && ox < 24 && oy >= 0 && oy < 14) b.bmp.set(ox, oy, 0);
      }
      b.bmp.set(lx, ly, 0);
      return true;
    }
    return false;
  }

  // ------------------------------------------------------------------------------------------- drawing
  function backdrop(fb, t, title) {
    fb.clear('#100c28');
    for (let y = 13; y < 120; y += 2) fb.hline(0, y, NP.W, y < 60 ? '#120e2c' : y < 90 ? '#18123a' : '#22164a');
    K.speckle(fb, 7, 60, ['#f8f8ff', '#a0a8e0', '#6870b0'], 14, 110, 0);
    // moon with a stitched seam across it
    // (a crescent drawn pixel by pixel so the sky stripes show through the cut, up in the corner clear of the moths)
    for (let y = -8; y <= 8; y++) for (let x = -8; x <= 8; x++) {
      if (x * x + y * y > 64 || (x - 4) * (x - 4) + (y + 3) * (y + 3) <= 44) continue;
      fb.set(240 + x, 24 + y, x * x + y * y > 49 ? '#d8c890' : '#f8f0c8');
    }
    // Shibuyarn rooftops
    const roofs = [[0, 132, 30], [28, 120, 22], [48, 128, 34], [80, 112, 18], [96, 124, 30], [124, 116, 26], [148, 130, 30], [176, 108, 20], [194, 122, 32], [224, 114, 32]];
    for (const [x, y, w] of roofs) {
      fb.fillRect(x, y, w, GROUND - y, '#1c1838');
      fb.hline(x, y, w, '#2c2850');
      for (let wy = y + 5; wy < GROUND - 6; wy += 8) for (let wx = x + 3; wx < x + w - 4; wx += 6) if (((wx * 7 + wy * 3) % 5) < 2) fb.fillRect(wx, wy, 2, 3, ((wx + wy + (t >> 6)) % 7) ? '#f8d070' : '#584870');
    }
    // neon sign standing on the low roof, under the moths' lanes (hidden behind the title text)
    if (!title) {
      const on = ((t >> 4) % 9) !== 0;
      fb.vline(153, 128, 2, '#2c2850'); fb.vline(172, 128, 2, '#2c2850');
      fb.fillRect(149, 116, 28, 12, '#1a1030');
      fb.strokeRect(149, 116, 28, 12, on ? '#f878c8' : '#583050');
      K.text(fb, 'YARN', 163, 118, on ? '#78f0f8' : '#285060', { align: 'center' });
    }
    // ground: the wardrobe shelf
    fb.fillRect(0, GROUND, NP.W, NP.H - GROUND, '#5a3820');
    fb.hline(0, GROUND, NP.W, '#a87040');
    for (let x = 4; x < NP.W; x += 24) fb.vline(x, GROUND + 3, 10, '#4a2c18');
  }

  function draw(g, fb, t) {
    backdrop(fb, t, g.over);
    for (const b of g.bolts) fb.blit(b.bmp, b.x, b.y);
    for (const m of g.moths) if (m.alive) fb.blit(moth(m.kind, g.frame), m.x, m.y);
    if (g.bunny) fb.blit(BUNNY(), Math.round(g.bunny.x), 16 + (((t >> 4) & 1) ? 1 : 0));
    for (const s of g.shots) { fb.vline(s.x, s.y, 6, '#e8f0f8'); fb.set(s.x, s.y, '#ffffff'); fb.set(s.x, s.y + 5, '#8890a8'); fb.set(s.x, s.y + 4, '#d83848'); }
    for (const l of g.lint) fb.blit(LINT(), Math.round(l.x), Math.round(l.y));
    if (g.dead === 0 || (g.dead > 0 && g.lives > 0 && g.dead < 40 && (g.dead & 4))) fb.blit(kigu(), g.px - 8, PY);
    for (const p of g.pops) {
      if (p.txt) K.text(fb, p.txt, p.x, p.y, '#f8d048');
      else fb.blit(POP(), p.x, p.y);
    }
    if (g.clearT > 0) K.center(fb, 'WAVE ' + g.wave + ' CLEAR!', 80, '#f8d048');
    else if (g.t < 60 && g.wave === 1) K.center(fb, 'GET READY!', 100, '#f8d048');
  }

  function drawTitle(fb, t) {
    backdrop(fb, t, true);
    fb.blendRect(0, 0, NP.W, NP.H, '#000010', 0.25);
    K.center(fb, 'MOTH PATROL', 26, '#a8f0c8');
    K.center(fb, 'Keep the moths out of the wardrobe!', 44, '#f8f8f8');
    const kinds = ['luna', 'tiger', 'dust'];
    kinds.forEach((k, i) => { fb.blit(moth(k, (t >> 4) & 1), 88, 64 + i * 15); K.text(fb, '= ' + MOTHS[k].pts + ' pts', 106, 65 + i * 15, '#f8f8f8'); });
    fb.blit(BUNNY(), 84, 108); K.text(fb, '= ???', 106, 110, '#f8f8f8');
    fb.blendRect(0, 122, NP.W, 11, '#08061a', 0.7);
    K.center(fb, 'Left/Right move   A fire   Start pause', 124, '#a8a0c8');
    fb.blit(kigu(), 120, 138 + (((t >> 3) & 1) ? 0 : 1));
  }

  AR.register('cab_1', {
    title: 'Moth Patrol', cost: 3, lights: false, create, drawTitle, lifeIcon,
    tickets: (score) => Math.floor(score / 60),
    bot(g, f) {
      // tests and previews: chase the nearest moth column, step out from under falling lint, fire when lined up
      const keys = [];
      const alive = (g.moths || []).filter((m) => m.alive);
      let tx = g.px;
      if (alive.length) tx = alive.reduce((b, m) => (Math.abs(m.x + 6 - g.px) < Math.abs(b.x + 6 - g.px) ? m : b)).x + 6;
      const threat = g.lint.find((l) => l.y > 110 && Math.abs(l.x + 2 - g.px) < 10);
      if (threat) tx = g.px + (threat.x + 2 < g.px ? 24 : -24);
      if (tx < g.px - 1) keys.push('left'); else if (tx > g.px + 1) keys.push('right');
      if (f % 8 < 2 && Math.abs(tx - g.px) < 5) keys.push('a');
      return keys;
    },
  });
  AR.mothPatrol = { kigu, moth, BUNNY };
})(typeof globalThis !== 'undefined' ? globalThis : window);
