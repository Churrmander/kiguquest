/* src/art/icons/items-spools.js — Bond Spool family (item icons 24x24) + the thrown-spool sprite (16x16 x4). */
(function (root) {
  'use strict';
  const NP = (root.NP = root.NP || {});
  const I = NP.art.icons;
  const K = I._kit;
  const { P, tone, ramp, rampOf, layer, fillFn, finish, rows } = K;

  // flange / thread palettes per spool kind
  const SPOOLS = {
    bond: { thread: '#e23c4a', flange: '#f3e3c3', ink: '#3a1224', pattern: 'lines', p1: true },
    silk: { thread: '#3d7fe6', flange: '#e6eef8', ink: '#141c48', pattern: 'sheen', p1: true },
    gold: { thread: '#34304c', flange: '#f2bf3a', ink: '#2a1a14', pattern: 'band', band: '#f2bf3a', p1: true },
    master: { thread: '#8a4ad8', flange: '#a45ce0', ink: '#200c3c', pattern: 'rainbow', deco: 'star' },
    quick: { thread: '#38b8e8', flange: '#f6d84a', ink: '#142a44', pattern: 'zigzag', band: '#f6d84a' },
    dusk: { thread: '#2e8a70', flange: '#35305a', ink: '#120c24', pattern: 'lines', deco: 'moon' },
    net: { thread: '#5cc8c0', flange: '#dff0ec', ink: '#10303a', pattern: 'net' },
    heal: { thread: '#f07aa8', flange: '#fbf1f4', ink: '#3c1430', pattern: 'lines', deco: 'heart' },
  };

  /** A thread spool in 3/4 view. */
  function spoolIcon(kind) {
    const s = SPOOLS[kind];
    const T = ramp(s.thread), F = ramp(s.flange);
    const b = layer();
    const cx = 11.5;
    // bottom flange: rim band + top face
    b.ellipse(cx, 18.5, 8, 2.6, F.d1);
    b.ellipse(cx, 17.2, 8, 2.6, F.m);
    // bottom flange rim shading: right part darker
    fillFn(b, (x, y) => b.get(x, y) === P(F.d1) && x > cx + 3, F.d2);
    fillFn(b, (x, y) => b.get(x, y) === P(F.m) && y >= 17 && x < cx - 5, F.l1);
    // thread body (cylinder)
    const x0 = 6, x1 = 17, y0 = 6, y1 = 17;
    const body = layer();
    body.fillRect(x0, y0, x1 - x0 + 1, y1 - y0 + 1, T.m);
    body.ellipse(cx, y1, (x1 - x0) / 2, 1.6, T.m);
    // cylinder shading by column
    fillFn(body, (x, y) => body.isOpaque(x, y) && x <= x0 + 1, T.l1);
    fillFn(body, (x, y) => body.isOpaque(x, y) && x === x0 + 2, T.l2);
    fillFn(body, (x, y) => body.isOpaque(x, y) && x >= x1 - 2, T.d1);
    fillFn(body, (x, y) => body.isOpaque(x, y) && x === x1, T.d2);
    // winding texture / patterns
    const onBody = (x, y) => body.isOpaque(x, y);
    const shadeFor = (x) => (x >= x1 - 2 ? T.d2 : T.d1);
    if (s.pattern === 'lines' || s.pattern === 'sheen' || s.pattern === 'band' || s.pattern === 'zigzag') {
      for (let y = y0 + 3; y <= y1; y += 2) for (let x = x0 + 1; x <= x1 - 1; x++) {
        const yy = y + (x <= x0 + 1 || x >= x1 - 1 ? 1 : 0);
        if (onBody(x, yy) && (x + y) % 5 !== 0) body.set(x, yy, shadeFor(x));
      }
    }
    if (s.pattern === 'sheen') {
      // silky diagonal sheen streaks
      for (let i = 0; i < 6; i++) { body.set(x0 + 3 + i, y0 + 7 - i, T.l2); body.set(x0 + 4 + i, y0 + 7 - i, T.l1); }
      for (let i = 0; i < 4; i++) body.set(x0 + 7 + i, y0 + 11 - i, T.l1);
    }
    if (s.pattern === 'band' || s.pattern === 'zigzag') {
      const B = ramp(s.band);
      const yb = 11;
      for (let x = x0; x <= x1; x++) {
        const c = x <= x0 + 1 ? B.l1 : x >= x1 - 1 ? B.d1 : B.m;
        if (s.pattern === 'band') { body.set(x, yb, c); body.set(x, yb + 1, c); }
        else { const zz = (x % 4 < 2 ? 0 : 1); body.set(x, yb + zz, c); body.set(x, yb + zz + 1, x >= x1 - 1 ? B.d1 : B.l1); }
      }
    }
    if (s.pattern === 'rainbow') {
      const bands = ['#f04a5a', '#f6a23a', '#f6e04a', '#58c85a', '#4a9af0'];
      for (let y = y0; y <= y1 + 2; y++) {
        const R = ramp(bands[Math.min(bands.length - 1, Math.max(0, Math.floor((y - y0) / 2.4)))]);
        for (let x = x0; x <= x1; x++) if (onBody(x, y)) body.set(x, y, x <= x0 + 1 ? R.l1 : x >= x1 - 1 ? R.d1 : R.m);
      }
    }
    if (s.pattern === 'net') {
      for (let y = y0; y <= y1 + 2; y++) for (let x = x0; x <= x1; x++) {
        if (!onBody(x, y)) continue;
        if ((x + y) % 4 === 0 || (x - y + 40) % 4 === 0) body.set(x, y, x >= x1 - 2 ? T.d2 : T.d1);
      }
    }
    b.blit(body, 0, 0);
    // top flange: rim + face + hole
    b.ellipse(cx, 6.6, 8, 2.6, F.d1);
    fillFn(b, (x, y) => b.get(x, y) === P(F.d1) && y >= 6 && x > cx + 3, F.d2);
    b.ellipse(cx, 5.2, 8, 2.6, F.m);
    fillFn(b, (x, y) => b.get(x, y) === P(F.m) && y <= 4 && x < cx + 2, F.l1);
    b.set(6, 3, F.l2); b.set(7, 3, F.l2); b.set(5, 4, F.l2);
    if (s.deco === 'star') {
      rows(b, 9, 2, ['..#..', '.###.', '#####', '.###.', '.#.#.'].map((r) => r), { '#': '#fff6b0' });
      b.set(11, 4, '#f6c83a');
    } else if (s.deco === 'moon') {
      rows(b, 10, 3, ['.##', '#..', '#..', '.##'], { '#': '#f6e08a' });
    } else if (s.deco === 'heart') {
      rows(b, 9, 3, ['##.##', '#####', '.###.', '..#..'], { '#': '#f04a7a' });
    } else {
      b.ellipse(cx, 5.2, 1.6, 0.8, F.d2);
      b.set(12, 5, T.d2);
    }
    // loose thread end curling out to the right
    finish(b, s.ink, 12, 'item ' + kind + '_spool');
    const tail = [[18, 13], [19, 13], [20, 14], [21, 15], [21, 16], [20, 17], [19, 17]];
    for (const [x, y] of tail) if (!b.isOpaque(x, y) || b.get(x, y) === P(s.ink)) b.set(x, y, P(s.ink));
    for (const [x, y] of tail.slice(1, -1)) b.set(x, y + 0, NP.Color.q15(P(T.m)));
    return b;
  }

  for (const k of Object.keys(SPOOLS)) K.addItem(k + '_spool', 'spools', () => spoolIcon(k), SPOOLS[k].p1);

  // ------------------------------------------------------------------ thrown spool 16x16, 4 spin frames
  // Analytic spool in local coords (u across, v along the axis), rotated per frame and point-sampled.
  function thrown(kind, frame) {
    const s = SPOOLS[kind];
    const T = ramp(s.thread), F = ramp(s.flange);
    const b = layer(16, 16);
    const ang = [0, Math.PI / 4, Math.PI / 2, (3 * Math.PI) / 4][frame];
    const ca = Math.cos(ang), sa = Math.sin(ang);
    const cx = 7.5, cy = 7.5;
    for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) {
      const dx = x - cx, dy = y - cy;
      const u = dx * ca + dy * sa;     // across the spool
      const v = -dx * sa + dy * ca;    // along the axis
      let c = 0;
      const au = Math.abs(u), av = Math.abs(v);
      if (av <= 5.2 && av >= 3.4 && au <= 5.6) c = F.m;          // flanges
      else if (av < 3.4 && au <= 3.9) c = T.m;                    // thread
      if (!c) continue;
      if (c === F.m) {
        if (u < -3.4) c = F.l1; else if (u > 3.6) c = F.d1;
        if (av > 4.6 && v > 0) c = F.d1;
      } else {
        if (u < -2.2) c = T.l1; else if (u > 2.2) c = T.d1;
        if (s.pattern === 'rainbow') {
          const bands = ['#f04a5a', '#f6e04a', '#58c85a', '#4a9af0'];
          const R = ramp(bands[Math.min(3, Math.max(0, Math.floor((v + 3.4) / 1.7)))]);
          c = u < -2.2 ? R.l1 : u > 2.2 ? R.d1 : R.m;
        } else if ((s.pattern === 'band' || s.pattern === 'zigzag') && av < 0.9) c = ramp(s.band).m;
        else if (Math.round(v + 10) % 2 === 0 && au < 2.9) c = u > 1 ? T.d2 : T.d1;
      }
      b.set(x, y, c);
    }
    finish(b, s.ink, 16);
    // glint on the upper-left flange edge
    return b;
  }
  K.reg.spool = thrown;
  K.SPOOLS = SPOOLS;
})(typeof globalThis !== 'undefined' ? globalThis : window);
