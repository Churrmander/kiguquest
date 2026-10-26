/* src/game/arcade/plush_catcher.js — the claw machine, "Plush Catcher". Steer the claw with Left/Right, press A to drop it, and
 * if it holds on all the way to the chute the plush is yours. Plushes go on the shelf page of the Tailor Card. Works during the
 * brownout (the owner keeps it on a spare battery because "the kids would riot"). One go is one game. */
(function (root) {
  'use strict';
  const NP = root.NP;
  const { Input, Bitmap } = NP;
  const AR = NP.arcade, K = AR.kit;

  const RAIL = 22, FLOOR = 170, CHUTE = { x: 14, w: 34 }, X0 = 56, X1 = 236;
  // the plushes in the machine (Kigu who are in the game; any that aren't loaded are skipped)
  AR.PLUSHES = ['konko', 'ottopi', 'sprubun', 'kittabra', 'nibblit', 'chirpadee', 'buzzlet', 'scurrent', 'kumi', 'molli', 'lapinlily', 'daisip', 'acolarva', 'kerochapu'];
  const plushIds = () => AR.PLUSHES.filter((id) => NP.data.species[id]);

  // the golden plush ramp: dark outline and eyes stay, everything else is re-dyed by how light it was
  const GOLD = [0xff10508a, 0xff1878b0, 0xff30a8d8, 0xff70e0f8]; // packed 0xAABBGGRR: #8a5010 #b07818 #d8a830 #f8e070
  const goldDye = (c) => {
    if ((c >>> 24) < 128) return c;
    const l = (c & 255) * 0.3 + ((c >> 8) & 255) * 0.59 + ((c >> 16) & 255) * 0.11;
    return l < 48 ? c : GOLD[Math.min(3, Math.floor((l - 48) / 40) + (l > 70 ? 1 : 0))];
  };

  /** A plush: the Kigu's party icon with a sewn-on tag (and a gold dye job and a bow for the rare golden ones). */
  AR.plushBmp = (id, gold) => K.memo('pc.plush.' + id + (gold ? 'g' : ''), () => {
    const ic = K.kiguIcon(id, 0);
    const b = new Bitmap(32, 32);
    if (ic) b.blit(ic, 0, 0);
    if (gold) b.mapPixels(goldDye);
    // tag
    b.fillRect(24, 22, 6, 5, '#fff8f0'); b.strokeRect(24, 22, 6, 5, '#a04868'); b.set(26, 24, '#e85888'); b.set(27, 24, '#e85888');
    if (gold) {
      // a little red hair bow up on the right: two loops and a gold knot
      const bow = ['kk...kk', 'krkkkrk', 'krRyRrk', 'krkkkrk', 'kk...kk'];
      const pal = { k: '#581020', r: '#e83848', R: '#a02030', y: '#f8e070' };
      // pinned where the head starts, so it sits on the hair whatever the icon's height
      const bb = b.bbox() || { x: 0, y: 0, w: 32 };
      const bx = Math.min(24, bb.x + bb.w - 10);
      let top = 0;
      while (top < 31 && !(b.get(bx + 3, top) >>> 24)) top++;
      const by = Math.max(0, top - 1);
      bow.forEach((row, y) => [...row].forEach((ch, x) => { if (ch !== '.') b.set(bx + x, by + y, pal[ch]); }));
    }
    return b;
  });

  function newPile() {
    const ids = plushIds();
    const pile = [];
    const spots = [];
    // loosely stacked so most faces show: about a third of each plush tucks behind its neighbours
    for (let x = X0 + 2; x < X1 - 28; x += 24) spots.push([x, FLOOR - 30]);
    for (let x = X0 + 14; x < X1 - 40; x += 26) spots.push([x, FLOOR - 50]);
    for (let x = X0 + 34; x < X1 - 62; x += 30) spots.push([x, FLOOR - 69]);
    for (const [x, y] of spots) {
      const id = ids[K.rand(ids.length)];
      pile.push({ id, x: x + K.rand(5) - 2, y, gold: K.chance(0.06) });
    }
    return pile;
  }

  function create() {
    const st = AR.st();
    if (!AR.pile || !AR.pile.length) AR.pile = newPile();
    const g = { score: 0, over: false, t: 0, phase: 'aim', cx: 64, cy: RAIL, open: 1, timer: 15 * 60, held: null, pile: AR.pile, msg: '' };
    g.st = st;
    g.update = () => update(g);
    g.draw = (fb, t) => draw(g, fb, t);
    return g;
  }

  function topPlushAt(g, x) {
    let best = null;
    for (const p of g.pile) if (x >= p.x + 3 && x <= p.x + 29 && (!best || p.y <= best.y)) best = p; // ties: the one drawn in front
    return best;
  }

  function update(g) {
    g.t++;
    if (g.phase === 'aim') {
      if (Input.held.left) g.cx = Math.max(CHUTE.x + 18, g.cx - 1.5);
      if (Input.held.right) g.cx = Math.min(X1 - 10, g.cx + 1.5);
      if (--g.timer <= 0 || Input.pressed.a) { g.phase = 'drop'; K.sfx('swing'); }
    } else if (g.phase === 'drop') {
      g.cy += 1.6;
      const p = topPlushAt(g, g.cx);
      const stop = p ? p.y + 4 : FLOOR - 16;
      if (g.cy >= stop) { g.cy = stop; g.phase = 'close'; g.wait = 24; }
    } else if (g.phase === 'close') {
      g.open = Math.max(0, g.open - 0.06);
      if (--g.wait <= 0) {
        const p = topPlushAt(g, g.cx);
        if (p) {
          const off = Math.abs(g.cx - (p.x + 16));
          // well centred grabs nearly always hold; the edges of a plush slip
          const grip = off < 4 ? 0.85 : off < 8 ? 0.5 : off < 12 ? 0.25 : 0.05;
          if (K.chance(grip * (p.gold ? 0.7 : 1))) { g.held = p; g.pile.splice(g.pile.indexOf(p), 1); g.grip = grip; K.sfx('select'); }
        }
        g.phase = 'lift';
      }
    } else if (g.phase === 'lift') {
      g.cy -= 1.2;
      if (g.held) { g.held.x = g.cx - 16; g.held.y = g.cy + 2; }
      if (g.cy <= RAIL) { g.cy = RAIL; g.phase = 'home'; }
      // a loose grip can still lose it on the way up
      if (g.held && g.cy < 110 && !g.slipChecked) {
        g.slipChecked = true;
        if (K.chance(0.1 + (1 - g.grip) * 0.6)) { dropHeld(g); K.sfx('cancel'); }
      }
    } else if (g.phase === 'home') {
      g.cx -= 1.5;
      if (g.held) g.held.x = g.cx - 16;
      if (g.cx <= CHUTE.x + 18) { g.cx = CHUTE.x + 18; g.phase = 'release'; g.wait = 30; g.open = 0; }
    } else if (g.phase === 'release') {
      g.open = Math.min(1, g.open + 0.08);
      if (g.held) { g.held.y += 3; if (g.held.y > NP.H) win(g); }
      if (--g.wait <= 0 && !g.held) finish(g);
    } else if (g.phase === 'fall') {
      for (const p of g.falling || []) { p.y = Math.min(p.floor, p.y + 3); }
      if (--g.wait <= 0) { g.phase = g.after; }
    }
  }

  function dropHeld(g) {
    const p = g.held;
    g.held = null;
    // it lands back on the pile below the claw
    const under = topPlushAt(g, p.x + 16);
    p.floor = Math.max(p.y, under ? under.y - 16 : FLOOR - 30); // never jumps upward
    p.x = Math.max(X0, Math.min(X1 - 32, p.x));
    g.pile.push(p);
    g.falling = [p];
    g.after = 'lift';
    g.phase = 'fall';
    g.wait = 30;
  }

  function win(g) {
    const p = g.held;
    g.held = null;
    g.prize = { id: p.id, gold: p.gold };
    const name = NP.data.species[p.id] ? NP.data.species[p.id].name : p.id;
    g.prizeText = 'You won a ' + (p.gold ? 'golden ' : '') + name + ' plush!';
    g.endTitle = 'WINNER!';
    g.score = p.gold ? 3 : 1;
    K.sfx('levelup');
    if (g.pile.length < 8) {
      // the attendant restocks with a fresh three-row heap, keeping any golden plush still in the machine
      const golds = g.pile.filter((q) => q.gold).map((q) => q.id), fresh = newPile();
      golds.forEach((id, i) => { const q = fresh[fresh.length - 1 - i]; if (q) { q.id = id; q.gold = true; } });
      AR.pile = g.pile = fresh;
    }
  }
  function finish(g) {
    if (!g.prize) { g.endTitle = 'SO CLOSE!'; g.prizeText = 'The claw came up empty.'; }
    g.over = true;
  }

  // ------------------------------------------------------------------------------------------- drawing
  function cabinet(fb, t) {
    // the glass case: pink frame, a soft lavender back panel with light glancing off the glass, a light strip that chases round the top
    fb.clear('#2a1838');
    fb.fillRect(6, 14, NP.W - 12, NP.H - 14, '#f088b8');
    fb.fillRect(10, 18, NP.W - 20, NP.H - 18, '#b8a0d8');
    fb.fillRect(10, 18, NP.W - 20, 6, '#a088c8');
    for (let y = 120; y < FLOOR; y++) if (y & 1) fb.hline(10, y, NP.W - 20, '#a890d0');
    for (const [gx, gw] of [[150, 6], [160, 3], [190, 4]]) for (let i = 0; i < 70; i++) fb.hline(gx + i, 30 + i, Math.min(gw, NP.W - 10 - gx - i), '#d0c0e8');
    for (let i = 0; i < 30; i++) { const x = 12 + i * 8; fb.fillRect(x, 15, 4, 2, ((i + (t >> 3)) % 4) === 0 ? '#fff8a0' : '#c05888'); }
    // the top rail
    fb.fillRect(10, RAIL - 4, NP.W - 20, 3, '#a8b0c8'); fb.hline(10, RAIL - 4, NP.W - 20, '#e8ecf8');
    // the chute: a clear acrylic box over the hole, bottom left
    fb.fillRect(CHUTE.x - 4, 110, CHUTE.w + 8, 4, '#c8e8f8');
    fb.fillRect(CHUTE.x - 4, 110, 3, FLOOR - 110 + 22, '#c8e8f8'); fb.fillRect(CHUTE.x + CHUTE.w + 1, 110, 3, FLOOR - 110 + 22, '#c8e8f8');
    fb.blendRect(CHUTE.x - 1, 114, CHUTE.w + 2, FLOOR - 114 + 22, '#a8d8f8', 0.18);
    K.text(fb, 'PRIZE', CHUTE.x + CHUTE.w / 2, 98, '#fff8a0', { align: 'center' });
    // the floor of the case
    fb.fillRect(CHUTE.x + CHUTE.w + 4, FLOOR, NP.W - CHUTE.x - CHUTE.w - 14, NP.H - FLOOR, '#5a3a78');
    fb.hline(CHUTE.x + CHUTE.w + 4, FLOOR, NP.W - CHUTE.x - CHUTE.w - 14, '#8a68b0');
    fb.fillRect(CHUTE.x - 1, FLOOR + 6, CHUTE.w + 2, NP.H - FLOOR, '#140c20');
  }

  function claw(fb, x, y, open) {
    x = Math.round(x); y = Math.round(y);
    fb.vline(x, RAIL - 1, y - RAIL - 6, '#d0d4e0'); fb.vline(x + 1, RAIL - 1, y - RAIL - 6, '#8890a8');
    fb.fillRect(x - 9, RAIL - 2, 20, 5, '#707890'); fb.hline(x - 9, RAIL - 2, 20, '#b0b8c8');
    // hub, 20 wide
    fb.fillRect(x - 9, y - 8, 20, 10, '#383c48'); fb.fillRect(x - 8, y - 7, 18, 8, '#c8ccd8'); fb.hline(x - 7, y - 6, 16, '#f0f4ff');
    fb.hline(x - 8, y, 18, '#8890a8');
    fb.fillRect(x - 1, y - 5, 4, 3, '#e85888'); fb.set(x - 1, y - 5, '#f8a8c8');
    // three prongs: two outer arms that open and close (two joints, 8px segments), a short middle one
    const spread = Math.round(5 + open * 10);
    for (const s of [-1, 1]) {
      const bx = x + (s < 0 ? -6 : 7), kx = x + (s < 0 ? -spread : spread + 1), ky = y + 10;
      const tx = x + (s < 0 ? -Math.max(2, spread - 8) : Math.max(3, spread - 7)), ty = y + 20;
      for (const [ax, ay, cx, cy] of [[bx, y + 2, kx, ky], [kx, ky, tx, ty]]) { fb.line(ax, ay, cx, cy, '#383c48'); fb.line(ax + 1, ay, cx + 1, cy, '#383c48'); fb.line(ax - s, ay, cx - s, cy, '#383c48'); }
      fb.line(bx, y + 1, kx, ky - 1, '#e0e4f0'); fb.line(kx, ky - 1, tx, ty - 1, '#b8c0d0');
      fb.fillRect(kx - 1, ky - 1, 3, 3, '#808898'); fb.set(kx, ky - 1, '#c8ccd8');
      // a little hooked tip
      fb.set(tx + (s < 0 ? 1 : 0), ty + 1, '#383c48'); fb.set(tx + (s < 0 ? 2 : -1), ty + 1, '#383c48');
    }
    fb.fillRect(x, y + 2, 2, 8, '#808898'); fb.vline(x, y + 2, 8, '#c8ccd8');
  }

  function draw(g, fb, t) {
    cabinet(fb, t);
    const pile = g.pile.slice().sort((a, b) => a.y - b.y);
    for (const p of pile) fb.blit(AR.plushBmp(p.id, p.gold), Math.round(p.x), Math.round(p.y));
    if (g.held) fb.blit(AR.plushBmp(g.held.id, g.held.gold), Math.round(g.held.x), Math.round(g.held.y));
    claw(fb, g.cx, g.cy, g.open);
    // control strip
    fb.fillRect(0, 0, NP.W, 13, '#0c0c1c'); fb.hline(0, 13, NP.W, '#3a3a6a');
    if (g.phase !== 'aim') K.text(fb, 'PLUSH CATCHER', 4, 2, '#f8a8d0');
    if (g.phase === 'aim') {
      K.text(fb, 'Left/Right aim   A drop', NP.W >> 1, 2, '#f8f8f8', { align: 'center' });
      K.text(fb, K.pad(Math.ceil(g.timer / 60), 2), NP.W - 4, 2, g.timer < 300 && (t & 8) ? '#f87878' : '#f8d048', { align: 'right' });
    }
    const n = Object.values(g.st.plush).reduce((a, b) => a + b, 0);
    K.text(fb, 'Plushes won: ' + n, NP.W - 14, NP.H - 14, '#f8d8f0', { align: 'right' });
  }

  function drawTitle(fb, t) {
    if (!AR.pile || !AR.pile.length) AR.pile = newPile();
    cabinet(fb, t);
    for (const p of AR.pile.slice().sort((a, b) => a.y - b.y)) fb.blit(AR.plushBmp(p.id, p.gold), Math.round(p.x), Math.round(p.y));
    claw(fb, X1 - 22, RAIL + 14, 1);
    fb.blendRect(40, 40, 176, 50, '#100820', 0.75);
    K.center(fb, 'PLUSH CATCHER', 46, '#f8a8d0');
    K.center(fb, 'Win a plush for your Tailor Card shelf!', 62, '#f8f8f8');
    K.center(fb, 'Golden ones are rare.', 76, '#f8d048');
  }

  AR.register('claw', {
    title: 'Plush Catcher', cost: 2, lights: false, create, drawTitle, noHud: true, noScore: true,
    tickets: (score) => (score >= 3 ? 25 : score >= 1 ? 10 : 2),
    onPrize(prize) {
      const a = AR.st();
      const key = prize.gold ? prize.id + '_gold' : prize.id;
      a.plush[key] = (a.plush[key] || 0) + 1;
    },
    bot(g) {
      if (g.phase !== 'aim') return [];
      const target = g.pile.slice().sort((a, b) => a.y - b.y)[0];
      const tx = target ? target.x + 16 : 120;
      if (g.cx < tx - 1) return ['right'];
      if (g.cx > tx + 1) return ['left'];
      return ['a'];
    },
    previewAt: [20, 150, 260],
  });
})(typeof globalThis !== 'undefined' ? globalThis : window);
