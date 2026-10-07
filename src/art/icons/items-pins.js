/* src/art/icons/items-pins.js — the pin_<type> family (17 type-boost sewing pins) and the disc_<type> family
 * (17 move discs) plus the five field discs (snip, glide, paddle, shove, climb). Colour-coded by type (BIBLE §2).
 */
(function (root) {
  'use strict';
  const NP = (root.NP = root.NP || {});
  const I = NP.art.icons;
  const K = I._kit;
  const H = I._items;
  const G = I._glyphs;
  const { P, layer, fillFn, tone, ink, ramp } = K;
  const R = H.R;
  const luma = (c) => NP.Color.luma(P(c));

  // ------------------------------------------------------------------ pins
  function pinIcon(id) {
    return (b) => {
      const base = K.TYPE[id].color, r = ramp(base), light = luma(base) > 150;
      const St = R('steel');
      // needle (2px wide near the head, 1px toward the point)
      b.line(12, 12, 2, 22, P(St.m));
      b.line(13, 12, 3, 22, P(St.d1));
      b.line(11, 12, 3, 20, P(St.l1));
      b.set(1, 23, P(St.l2));
      // thread wrapped once around the shaft
      H.pxs(b, [[8, 15], [7, 16], [9, 16]], r.m);
      // pearl head
      H.ell(b, 15.5, 8.5, 6.7, 6.7, r, { mode: 'dome', r: 6.9 });
      // emblem (light types get a dark emblem, the rest a white one)
      const c1 = light ? r.d2 : '#fffdf4', c2 = light ? ink(base, 0.16) : r.d2, c3 = light ? '#ffffff' : r.l2;
      const rows9 = G.E9[id];
      H.art(b, 11, 4, rows9, { '#': c1, o: c2, w: c3 });
      b.set(11, 5, P('#ffffff')); b.set(12, 4, P('#ffffff'));
      H.twinkle(b, 21, 19, '#ffffff');
      return H.done(b, ink(base, 0.12), 'pin_' + id);
    };
  }
  for (const id of K.TYPE_IDS) H.add('pin_' + id, 'pins', false, pinIcon(id));

  // ------------------------------------------------------------------ discs
  function discBase(b, rimBase, labelRamp) {
    const r = ramp(rimBase);
    const cx = 11.5, cy = 11.5;
    H.ell(b, cx, cy, 9.5, 9.5, r, { mode: 'dome', r: 9.7 });
    // data tracks
    H.ring(b, cx - 0.5, cy - 0.5, 7.7, 7.0, P(r.d1));
    // gloss arc (upper-left)
    for (let a = 3.3; a <= 4.4; a += 0.12) b.set(Math.round(cx - 0.5 + Math.cos(a) * 8.6), Math.round(cy - 0.5 + Math.sin(a) * 8.6), P(r.l2));
    // paper label
    H.ell(b, cx, cy, 5.7, 5.7, labelRamp, { mode: 'cel', hi: 1, sh: 1 });
    return r;
  }
  function discIcon(id) {
    return (b) => {
      const base = K.TYPE[id].color;
      discBase(b, base, R('cream'));
      // emblem with a dark outline so every type reads on the cream label
      const e = K.emblem(id, 'E9');
      const pad = e.padded(1, 1, 1, 1);
      pad.outline(P(ink(base, 0.16)), { diag: false });
      b.blit(pad, 6, 6);
      H.twinkle(b, 21, 3, '#ffffff');
      return H.done(b, ink(base, 0.12), 'disc_' + id);
    };
  }
  for (const id of K.TYPE_IDS) H.add('disc_' + id, 'discs', false, discIcon(id));

  // field discs (HM-style): silver disc, coloured label
  const FIELD = {
    snip: { col: '#46b85c', rows: ['#.......#', '.#.....#.', '..#...#..', '...#.#...', '....#....', '...#.#...', '.##...##.', '#..#.#..#', '.##...##.'] },
    glide: { col: '#4ea8f2', rows: ['......###', '....#####', '..#######', '.########', '#########', '.#.#.#.#.', '..#.#.#..', '...#.#...', '....#....'] },
    paddle: { col: '#3f7ae2', rows: ['.....###.', '....#####', '....#####', '...######', '...#####.', '..#.###..', '.#.......', '#........', '.........'] },
    shove: { col: '#b4733c', rows: ['.........', '..#####..', '.#######.', '#########', '#########', '#########', '.#######.', '.........', '.........'] },
    climb: { col: '#f28c38', rows: ['.#.....#.', '.#######.', '.#.....#.', '.#.....#.', '.#######.', '.#.....#.', '.#.....#.', '.#######.', '.#.....#.'] },
  };
  for (const k of Object.keys(FIELD)) {
    H.add('disc_' + k, 'discs', k === 'snip' || k === 'paddle', (b) => {
      const f = FIELD[k], r = R(f.col);
      discBase(b, '#b8c4dc', R('cream'));
      // colour ring between the silver rim and the label
      H.ring(b, 11, 11, 6.9, 6.0, P(r.m));
      const e = layer(11, 11);
      H.art(e, 1, 1, f.rows, { '#': r.m });
      e.outline(P(r.d2), { diag: false });
      // inner shade pixels (bottom-right of every stroke)
      for (let y = 0; y < 11; y++) for (let x = 0; x < 11; x++) if (e.get(x, y) === P(r.m) && (e.get(x + 1, y + 1) >>> 24) === 0) e.set(x, y, P(r.d1));
      b.blit(e, 6, 6);
      if (k === 'shove') H.pxs(b, [[8, 10, '#ffffff'], [9, 9, '#ffffff']], '#ffffff');
      H.twinkle(b, 21, 3, '#ffffff');
      return H.done(b, '#2a3450', 'disc_' + k);
    });
  }
})(typeof globalThis !== 'undefined' ? globalThis : window);
