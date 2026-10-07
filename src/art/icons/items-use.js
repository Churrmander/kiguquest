/* src/art/icons/items-use.js — battle "pep" drinks, field sprays/thread, growth items (candy, vitamins, PP boosters). */
(function (root) {
  'use strict';
  const NP = (root.NP = root.NP || {});
  const I = NP.art.icons;
  const K = I._kit;
  const H = I._items;
  const G = I._glyphs;
  const { P, layer, fillFn } = K;
  const R = H.R;

  // ================================================================== BATTLE: pep drinks (X-items) + guard spec
  const PEP = {
    atk: { col: '#e8483c', txt: 'AT', ink: '#5a1420' },
    def: { col: '#f2b632', txt: 'DF', ink: '#5a3a08' },
    spe: { col: '#3fb4f0', txt: 'SP', ink: '#0e2c5a' },
    spa: { col: '#d45ad8', txt: 'SA', ink: '#4a1458' },
    spd: { col: '#46c070', txt: 'SD', ink: '#0e4028' },
    acc: { col: '#f28a3a', txt: 'AC', ink: '#5a2608' },
  };
  function pepBottle(key) {
    const s = PEP[key];
    return (b) => {
      const L = R(s.col), Cap = R(s.col);
      H.bottle(b, { cx: 10.5, y: 4, cork: R('cream'), corkH: 2, neckW: 4, neckH: 3, w: 14, h: 12, r: 4, glass: R('glass'), liquid: L, fill: 0.9 });
      // white label band with the stat letters
      H.rect(b, 5, 12, 11, 7, R('white'), { mode: 'cel' });
      G.pico.draw(b, s.txt, 7, 13, s.ink);
      // bow on the neck
      b.set(7, 9, P(Cap.l1)); b.set(14, 9, P(Cap.d1));
      // rising arrow
      H.art(b, 18, 3, ['..#..', '.###.', '#####', '..#..', '..#..'], { '#': L.m });
      H.art(b, 18, 3, ['.....', '..#..', '.#...', '.....', '.....'], { '#': L.l2 });
      return H.done(b, s.ink, 'pep_' + key);
    };
  }
  for (const k of Object.keys(PEP)) H.add('pep_' + k, 'battle', false, pepBottle(k));

  H.add('guard_spec', 'battle', false, (b) => {
    const Sh = R('#4a8cf0'), Go = R('gold'), Wh = R('white');
    const shield = (x, y) => {
      if (y < 2 || y > 21) return false;
      const hw = y <= 10 ? 8.5 : 8.5 * Math.pow(1 - (y - 10) / 12, 0.7);
      return Math.abs(x - 11.5) <= hw;
    };
    H.part(b, shield, Go, { mode: 'cel' });
    H.part(b, (x, y) => shield(x, y) && Math.abs(x - 11.5) <= 6.5 && y >= 4 && y <= (y <= 10 ? 99 : 18) && Math.abs(x - 11.5) <= 6.6 * Math.pow(Math.max(0, 1 - (y - 10) / 10), 0.7) + (y <= 10 ? 6.6 : 0), Sh, { mode: 'cel' });
    // star
    H.poly(b, K.starPts(11.5, 10.5, 4.6, 2, 5), Wh, { mode: 'cel', sh: 1, hi: 0 });
    H.dash(b, 6, 4, 17, 4, Go.l2, 2, 1);
    H.twinkle(b, 20, 4, '#ffffff');
    return H.done(b, '#1c2a5a', 'guard_spec');
  });

  // ================================================================== FIELD: scent sprays, thread ball, dowsing pin
  function sprayBottle(b, o) {
    const G0 = R('glass'), L = o.liquid, Hd = o.head, cx = o.cx || 11;
    // body
    const bx0 = cx - (o.w >> 1);
    H.bottle(b, { cx, y: o.y, cork: null, corkH: 0, neckW: 4, neckH: 2, w: o.w, h: o.h, r: o.r === undefined ? 3 : o.r, glass: G0, liquid: L, fill: 0.85 });
    // pump head + nozzle (nozzle faces left)
    const hy = o.y - 3;
    H.rrect(b, cx - 3, hy, 7, 4, 1, Hd, { mode: 'cyl' });
    H.rect(b, cx - 7, hy + 1, 5, 2, Hd, { mode: 'cel' });
    H.rect(b, cx - 1, hy - 2, 3, 2, R('white'), { mode: 'cel' });
    // label
    if (o.label) o.label(b, bx0, o.y + 6);
    // mist
    H.pxs(b, [[cx - 9, hy + 1], [cx - 10, hy - 1], [cx - 10, hy + 3], [cx - 12, hy + 1], [cx - 12, hy - 2], [cx - 12, hy + 4]], o.mist || '#ffffff');
  }

  H.add('scent_spray', 'field', true, (b) => {
    sprayBottle(b, { cx: 13, y: 8, w: 11, h: 13, liquid: R('#b98cf0'), head: R('pink'), mist: '#e8d4ff',
      label: (bb, x, y) => { H.heart(bb, x + 2, y + 1, '#ffffff'); } });
    H.twinkle(b, 4, 18, '#ffffff');
    return H.done(b, '#3a1e5c', 'scent_spray');
  });
  H.add('super_scent', 'field', false, (b) => {
    sprayBottle(b, { cx: 13, y: 6, w: 12, h: 15, liquid: R('#36c6b6'), head: R('#f2c23a'), mist: '#c8fff4',
      label: (bb, x, y) => { H.star(bb, x + 6, y + 3.5, 3.8, 1.6, '#ffffff', 5); } });
    H.twinkle(b, 4, 16, '#ffffff');
    return H.done(b, '#0e3c3c', 'super_scent');
  });
  H.add('max_scent', 'field', false, (b) => {
    // perfume flask with a gold cap and a squeeze-bulb tassel
    const Gl = R('#ff8fc4'), Go = R('gold'), Gs = R('glass');
    const t = layer();
    H.poly(t, [[7, 10], [16, 10], [20, 15], [16, 21], [7, 21], [3, 15]], Gs, { mode: 'cel', detached: true });
    // liquid
    H.poly(b, [[7, 10], [16, 10], [20, 15], [16, 21], [7, 21], [3, 15]], Gl, { mode: 'cel' });
    // facets
    H.pline(b, [[7, 10], [11, 15], [7, 21]], Gl.d1);
    H.pline(b, [[16, 10], [11, 15], [16, 21]], Gl.l2);
    b.set(11, 15, P('#ffffff'));
    // neck + gold cap
    H.rect(b, 9, 7, 5, 3, Gs, { mode: 'cyl' });
    H.rrect(b, 7, 3, 9, 5, 2, Go, { mode: 'cyl' });
    b.hline(8, 5, 7, P(Go.d1));
    // bulb + tassel
    H.ell(b, 19, 6, 2.6, 2.6, R('rose'));
    H.pxs(b, [[16, 5], [17, 5], [17, 6]], Go.m);
    H.pxs(b, [[19, 9], [19, 10], [18, 11], [20, 11]], Go.l1);
    H.twinkle(b, 4, 6, '#fff3a8', true); H.twinkle(b, 21, 19, '#ffffff');
    return H.done(b, '#5a1e48', 'max_scent');
  });

  H.add('thread_ball', 'field', true, (b) => {
    const Y = R('#ef5a7c');
    H.ell(b, 11, 12, 9, 9, Y, { mode: 'dome' });
    // wound strands: two crossing families of curved lines
    const pts = [];
    for (let y = 3; y <= 21; y++) for (let x = 2; x <= 20; x++) {
      if (!b.isOpaque(x, y)) continue;
      const u = x - 11, v = y - 12;
      const f1 = (u * 0.94 + v * 0.34) + Math.sin(v * 0.35) * 1.6;
      const f2 = (u * 0.6 - v * 0.8) + Math.sin(u * 0.4) * 1.4;
      const shade = u + v > 6 ? Y.d2 : u + v > 0 ? Y.d1 : Y.l1;
      if (Math.abs(((f1 % 4) + 4) % 4 - 2) < 0.6) pts.push([x, y, shade]);
      else if (Math.abs(((f2 % 5) + 5) % 5 - 2.5) < 0.5) pts.push([x, y, u + v > 2 ? Y.d1 : Y.m]);
    }
    for (const p of pts) b.set(p[0], p[1], P(p[2]));
    // specular
    H.pxs(b, [[6, 7], [7, 6], [6, 6]], '#ffd0dc');
    // trailing thread + needle tip
    H.pline(b, [[17, 19], [19, 20], [21, 19], [22, 17]], Y.m);
    return H.done(b, '#5a1230', 'thread_ball');
  });

  H.add('dowsing_pin', 'field', false, (b) => {
    const Go = R('gold'), Cr = R('#6fe0f0');
    // pin (head + shaft) across the top
    H.ell(b, 4.5, 4.5, 2.6, 2.6, R('rose'));
    H.cap(b, 6, 6, 13, 9.5, 0.6, R('steel'), { mode: 'flat' });
    H.pline(b, [[6, 5], [13, 8]], '#f4f8ff');
    // thread hanging from the pin tip
    H.pline(b, [[13, 9], [13, 13]], '#f6eedc');
    // crystal pendulum
    H.poly(b, [[13, 13], [16.5, 16.5], [13, 22], [9.5, 16.5]], Cr, { mode: 'cel' });
    b.set(12, 16, P('#ffffff')); b.set(12, 15, P('#d8faff'));
    H.pline(b, [[10, 16], [16, 16]], Cr.l2);
    // ping arcs
    H.pxs(b, [[19, 12], [20, 13], [20, 15], [19, 16], [21, 11], [22, 13], [22, 15], [21, 17]], '#ffe070');
    H.pxs(b, [[5, 12], [4, 13], [4, 15], [5, 16]], '#ffe070');
    return H.done(b, '#1c3a4a', 'dowsing_pin');
  });

  // ================================================================== GROWTH
  H.add('wish_candy', 'growth', true, (b) => {
    const C = R('#ff86b4'), W = R('#8ad6ff');
    // wrapper twists
    H.poly(b, [[1, 6], [7, 10], [7, 14], [1, 18], [3, 12]], W, { mode: 'cel' });
    H.poly(b, [[22, 6], [16, 10], [16, 14], [22, 18], [20, 12]], W, { mode: 'cel' });
    H.pline(b, [[2, 7], [6, 11]], W.l2); H.pline(b, [[21, 7], [17, 11]], W.l2);
    // candy body
    H.ell(b, 11.5, 12, 7.2, 6.4, C, { mode: 'dome' });
    // diagonal white stripes
    for (let y = 6; y <= 18; y++) for (let x = 4; x <= 19; x++) if (b.isOpaque(x, y) && ((x + y) % 7 === 0 || (x + y) % 7 === 1)) b.set(x, y, P((x + y) % 7 === 0 ? '#fff4f8' : '#ffd0e0'));
    // star emblem
    H.poly(b, K.starPts(11.5, 12, 3.6, 1.6, 5), R('gold'), { mode: 'cel' });
    H.twinkle(b, 20, 4, '#ffffff', true);
    return H.done(b, '#5a1a44', 'wish_candy');
  });

  const VIT = {
    hp: { col: '#ff6a9c', ink: '#5a1234', mark: 'heart' },
    atk: { col: '#ee4a3e', ink: '#5a1414', txt: 'AT' },
    def: { col: '#f4b632', ink: '#5a3a08', txt: 'DF' },
    spa: { col: '#d45ad8', ink: '#4a1458', txt: 'SA' },
    spd: { col: '#46c070', ink: '#0e4028', txt: 'SD' },
    spe: { col: '#3fb4f0', ink: '#0e2c5a', txt: 'SP' },
  };
  for (const k of Object.keys(VIT)) {
    H.add('vit_' + k, 'growth', false, (b) => {
      const v = VIT[k], L = R(v.col), Wh = R('white');
      // short round jar
      H.part(b, (x, y) => x >= 3 && x <= 19 && y >= 9 && y <= 21 && !(y >= 20 && (x < 5 || x > 17)) && !(y === 9 && (x < 4 || x > 18)), Wh, { mode: 'cyl' });
      // coloured lid
      H.rrect(b, 2, 4, 19, 6, 2, L, { mode: 'cyl' });
      b.hline(3, 8, 17, P(L.d1));
      // lid grip ridges
      for (let x = 4; x < 19; x += 2) b.set(x, 6, P(L.d1));
      // label window
      H.rect(b, 5, 12, 13, 7, L, { mode: 'cel' });
      if (v.mark === 'heart') H.heart(b, 8, 13, '#ffffff');
      else G.pico.draw(b, v.txt, 8, 13, '#ffffff', { shadow: v.ink });
      // plus mark
      H.art(b, 1, 0, ['.#.', '###', '.#.'], { '#': '#ffffff' });
      return H.done(b, v.ink, 'vit_' + k);
    });
  }

  function vial(b, o) {
    const L = R(o.col);
    H.bottle(b, { cx: 11.5, y: 3, cork: o.cap, corkH: 3, neckW: 4, neckH: 3, w: 12, h: 13, r: 3, glass: R('glass'), liquid: L, fill: 0.85 });
    H.rect(b, 6, 12, 11, 6, R('white'), { mode: 'cel' });
    G.pico.draw(b, 'PP', 8, 13, o.ink);
  }
  H.add('pp_boost', 'growth', false, (b) => {
    vial(b, { col: '#58a8f8', cap: R('#e8789c'), ink: '#143a7a' });
    H.art(b, 19, 2, ['..#..', '.###.', '#####', '..#..', '..#..'], { '#': '#58a8f8' });
    return H.done(b, '#143a7a', 'pp_boost');
  });
  H.add('pp_max', 'growth', false, (b) => {
    vial(b, { col: '#c864f0', cap: R('gold'), ink: '#3a1460' });
    H.art(b, 19, 1, ['..#..', '.###.', '#####', '..#..', '..#..'], { '#': '#ffd84a' });
    H.art(b, 19, 7, ['..#..', '.###.', '#####'], { '#': '#ffd84a' });
    H.twinkle(b, 3, 4, '#ffffff', true);
    return H.done(b, '#3a1460', 'pp_max');
  });
})(typeof globalThis !== 'undefined' ? globalThis : window);
