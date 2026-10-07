/* src/art/icons/items-held.js — evolution charms and held items (item icons, 24x24). */
(function (root) {
  'use strict';
  const NP = (root.NP = root.NP || {});
  const I = NP.art.icons;
  const K = I._kit;
  const H = I._items;
  const G = I._glyphs;
  const { P, layer, fillFn } = K;
  const R = H.R;

  // ================================================================== CHARMS (evolution): medallion + bail + tassel
  /** medallion base; emblem(b, cx, cy, face ramp) draws the motif. */
  function charm(face, rim, emblem, o) {
    return (b) => {
      o = o || {};
      const F = R(face), Rm = R(rim || 'gold');
      const cx = 11.5, cy = 11.5;
      // tassel strands under the medallion
      const Ts = R(o.tassel || '#e8587e');
      H.pxs(b, [[10, 19], [10, 20], [10, 21], [11, 19], [11, 20], [11, 21], [12, 19], [12, 20], [12, 21], [13, 19], [13, 20], [13, 21]], Ts.m);
      H.pxs(b, [[10, 21], [13, 21], [10, 20]], Ts.d1);
      H.pxs(b, [[11, 19], [11, 20]], Ts.l1);
      H.rect(b, 10, 17, 4, 2, Ts, { mode: 'flat' });
      // bail ring
      H.ringPart(b, 11.5, 2.8, 2.6, 1.2, Rm, { mode: 'flat' });
      H.ell(b, cx, cy, 8.4, 8.4, Rm, { mode: 'dome' });
      H.ell(b, cx, cy, 6.4, 6.4, F, { mode: 'dome', r: 6.6 });
      // rim beads
      for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2; b.set(Math.round(cx - 0.5 + Math.cos(a) * 7.4), Math.round(cy - 0.5 + Math.sin(a) * 7.4), P(i % 2 ? Rm.l2 : Rm.d1)); }
      emblem(b, 11, 11, F);
      H.twinkle(b, 20, 3, '#ffffff');
      return H.done(b, o.ink || K.ink(face, 0.13), o.tag);
    };
  }
  /** draws a 9x9 type emblem in (light or dark) silhouette with its own details */
  function emb9(id, col, dark) {
    return (b, cx, cy, F) => {
      const rows9 = G.E9[id];
      H.art(b, cx - 4, cy - 4, rows9, { '#': col, o: dark || F.d2, w: F.l2 });
    };
  }
  const moon = (b, cx, cy, col, cut) => {
    fillFn(b, (x, y) => Math.hypot(x - cx, y - cy) <= 4.6 && Math.hypot(x - cx - (cut || 2.6), y - cy + 0.6) > 3.8, col);
  };
  const add = (id, face, rim, em, o) => H.add(id, 'charms', false, (b) => charm(face, rim, em, Object.assign({ tag: id }, o))(b));

  add('ember_charm', '#ef5a2a', 'gold', emb9('ember', '#ffe06a', '#c83a18'));
  add('tide_charm', '#3f86e8', 'gold', emb9('tide', '#e8f8ff', '#1c4aa8'));
  add('volt_charm', '#f2cf3a', 'gold', emb9('volt', '#fffbe0', '#b87a08'), { tassel: '#f2a020' });
  add('sprout_charm', '#3faa56', 'gold', emb9('sprout', '#d8ffb0', '#1c6a30'), { tassel: '#6cbf4a' });
  add('frost_charm', '#6cc8ec', 'steel', emb9('frost', '#ffffff', '#2a78b0'), { tassel: '#8fdcdc' });
  add('moon_charm', '#3f3c86', 'steel', (b, cx, cy) => { moon(b, cx - 1, cy, P('#f6f0b0')); H.pxs(b, [[15, 7], [14, 14]], '#ffffff'); }, { tassel: '#8c7ae0' });
  add('sun_charm', '#f2a82a', 'gold', (b, cx, cy) => {
    b.ellipse(cx, cy, 3, 3, P('#fff3a0'));
    for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2; b.set(Math.round(cx + Math.cos(a) * 5.2), Math.round(cy + Math.sin(a) * 5.2), P('#fffbd0')); }
    b.set(cx - 1, cy - 1, P('#ffffff'));
  }, { tassel: '#f27a2a' });
  add('dusk_charm', '#5a3a9a', 'steel', (b, cx, cy) => {
    moon(b, cx - 1, cy + 0.5, P('#e0a8ff'), 2.4); H.star(b, cx + 3, cy - 3, 2.4, 1, '#fff2a8', 4);
  }, { tassel: '#a060e8' });
  add('dawn_charm', '#f58aa0', 'gold', (b, cx, cy) => {
    // rising sun over a horizon
    fillFn(b, (x, y) => y <= cy + 2 && Math.hypot(x - cx, y - cy - 2) <= 4.4, P('#ffe070'));
    b.hline(cx - 5, cy + 3, 11, P('#fff0f4'));
    for (const [dx, dy] of [[-5, -1], [5, -1], [0, -6], [-3, -4], [3, -4]]) b.set(cx + dx, cy + dy, P('#fff8d0'));
  }, { tassel: '#ffb870' });
  add('shine_charm', '#fbeaff', 'gold', (b, cx, cy) => {
    H.poly(b, K.starPts(cx, cy, 5.4, 1.5, 4), R('#ff78d0'), { mode: 'cel' });
    H.twinkle(b, cx + 4, cy - 4, '#ffffff'); b.set(cx - 4, cy + 4, P('#8ad6ff'));
  }, { tassel: '#ff78d0', ink: '#5a2a78' });

  // ================================================================== HELD ITEMS
  H.add('snack_bag', 'held', false, (b) => {
    const Bg = R('#d8a866');
    // peeking cookie
    H.ell(b, 16.5, 6, 4.4, 4.4, R('#e8b050'));
    H.pxs(b, [[15, 5, '#6a3a20'], [18, 6, '#6a3a20'], [16, 8, '#6a3a20']], '#6a3a20');
    // bag body (slightly tapered) + folded top
    H.part(b, (x, y) => y >= 9 && y <= 21 && x >= 3 + (y < 11 ? 0 : 1) && x <= 19 - (y < 11 ? 0 : 1), Bg, { mode: 'cel' });
    H.part(b, (x, y) => y >= 6 && y <= 9 && x >= 3 && x <= 19 && ((x + y) % 4 < 3 || y >= 8), R('#ecc27e'), { mode: 'cel' });
    // zig-zag fold edge
    for (let x = 3; x <= 19; x++) b.set(x, 6 + ((x >> 1) & 1), P(R('#ecc27e').l2));
    b.vline(11, 10, 11, P(Bg.d1));
    // string tie + bow
    H.dash(b, 4, 11, 18, 11, '#e85a7c', 1, 0);
    H.pxs(b, [[8, 10], [7, 9], [9, 9], [8, 12], [7, 13], [9, 13]], '#e85a7c');
    // label heart
    H.heart(b, 9, 15, '#fff4d8');
    return H.done(b, '#5a3418', 'snack_bag');
  });

  H.add('plum_treat', 'held', false, (b) => {
    const Pl = R('#7a52d8'), Lf = R('#44b050');
    H.ell(b, 11.5, 13, 8.2, 7.8, Pl, { mode: 'dome' });
    // cleft
    H.pline(b, [[11, 8], [11, 12], [12, 16]], Pl.d1);
    // stem + leaf
    H.pline(b, [[11, 6], [12, 3]], '#6a4a2a');
    H.poly(b, [[12, 4], [16, 2], [19, 4], [16, 6]], Lf, { mode: 'cel' });
    b.line(13, 4, 17, 3, P(Lf.d2));
    // bloom shine
    H.pxs(b, [[6, 10], [7, 9], [6, 11]], '#d8c8ff');
    H.twinkle(b, 20, 12, '#ffffff');
    return H.done(b, '#2a1a5a', 'plum_treat');
  });

  H.add('honey_treat', 'held', false, (b) => {
    const Hn = R('#f2a220'), Cl = R('#f58ab0');
    // gingham cloth lid tied with string
    H.part(b, (x, y) => y >= 4 && y <= 10 && x >= 4 + (y < 7 ? 1 : 0) && x <= 19 - (y < 7 ? 1 : 0), R('#f8c8d8'), { mode: 'cel' });
    for (let y = 4; y <= 10; y++) for (let x = 4; x <= 19; x++) if (b.isOpaque(x, y) && ((x >> 1) + (y >> 1)) % 2 === 0) b.set(x, y, P(Cl.m));
    // ruffle edge
    for (let x = 4; x <= 19; x += 3) b.set(x, 10, P(Cl.d1));
    // jar body
    H.part(b, (x, y) => y >= 11 && y <= 21 && x >= 3 && x <= 20 && !(y >= 20 && (x < 5 || x > 18)), Hn, { mode: 'cyl' });
    b.hline(3, 11, 18, P(R('#8a5a18').m));
    H.dash(b, 4, 11, 19, 11, '#d6b25a', 1, 0);
    // honey drip over the lip
    H.pxs(b, [[8, 12], [8, 13], [8, 14], [9, 12], [9, 13], [14, 12], [14, 13]], Hn.l1);
    // label: hexagon
    H.poly(b, [[9, 16], [11.5, 14.5], [14, 16], [14, 19], [11.5, 20.5], [9, 19]], R('#fff0c0'), { mode: 'cel' });
    H.twinkle(b, 21, 6, '#ffffff');
    return H.done(b, '#5a340a', 'honey_treat');
  });

  H.add('lemon_treat', 'held', false, (b) => {
    const Rd = R('#f7d63a'), In = R('#fff3a0');
    H.ell(b, 11.5, 12.5, 9, 8.2, Rd, { mode: 'dome' });
    H.ell(b, 11.5, 12.5, 6.8, 6.2, In, { mode: 'cel', hi: 0, sh: 1 });
    // segments
    for (let i = 0; i < 6; i++) { const a = (i / 6) * Math.PI * 2 + 0.3; H.pline(b, [[11.5 + Math.cos(a) * 1.2, 12.5 + Math.sin(a) * 1.2], [11.5 + Math.cos(a) * 6, 12.5 + Math.sin(a) * 5.4]].map((p) => p.map(Math.round)), '#f2c22a'); }
    b.set(11, 12, P('#ffffff'));
    // leaf
    H.poly(b, [[15, 3], [20, 2], [21, 6], [17, 5]], R('#44b050'), { mode: 'cel' });
    H.pxs(b, [[5, 8], [4, 9]], '#ffffff');
    return H.done(b, '#6a5a08', 'lemon_treat');
  });

  H.add('sturdy_sash', 'held', false, (b) => {
    const Sh = R('#4a5ed8'), Wh = R('white');
    // hanging tails
    H.poly(b, [[8, 12], [11, 12], [9, 21], [5, 19]], Sh, { mode: 'cel' });
    H.poly(b, [[12, 12], [15, 12], [18, 19], [14, 21]], Sh, { mode: 'cel' });
    // band across
    H.rect(b, 1, 7, 22, 6, Sh, { mode: 'cel' });
    b.hline(1, 9, 22, P(Wh.m)); b.hline(1, 10, 22, P(Wh.d1));
    // bow loops
    H.ell(b, 6.5, 6, 4.4, 3.6, Sh, { mode: 'dome' });
    H.ell(b, 16.5, 6, 4.4, 3.6, Sh, { mode: 'dome' });
    H.ell(b, 11.5, 8.5, 2.4, 2.6, R('#7a8af0'), { mode: 'dome' });
    H.dash(b, 8, 18, 10, 14, Wh.l1, 1, 1); H.dash(b, 15, 14, 17, 18, Wh.l1, 1, 1);
    return H.done(b, '#1a2260', 'sturdy_sash');
  });

  H.add('sparkle_brooch', 'held', false, (b) => {
    const Go = R('gold'), Gm = R('#ff5a9c');
    H.poly(b, K.starPts(11.5, 12, 10.4, 5, 5), Go, { mode: 'cel' });
    H.ell(b, 11.5, 12, 3.8, 3.8, Gm, { mode: 'dome' });
    H.pxs(b, [[10, 10], [10, 11], [11, 10]], '#ffd0e4');
    for (const [dx, dy] of [[0, -8], [8, -2], [5, 7], [-5, 7], [-8, -2]]) b.set(Math.round(11.5 + dx * 0.78), Math.round(12 + dy * 0.78), P('#fff6c0'));
    H.twinkle(b, 20, 4, '#ffffff', true);
    return H.done(b, '#6a3a08', 'sparkle_brooch');
  });

  H.add('choice_band', 'held', false, (b) => {
    const Bn = R('#f0683a'), St = R('#ffd84a');
    // ring-shaped band seen in perspective
    H.part(b, (x, y) => { const u = (x - 11.5) / 10, v = (y - 11) / 6.4; const d = u * u + v * v; return d <= 1 && d >= 0.42; }, Bn, { mode: 'cel', hi: 1, sh: 1 });
    // back half of the ring is darker
    fillFn(b, (x, y) => b.isOpaque(x, y) && y < 11 - 1, Bn.d1);
    // stripe along the front
    for (let x = 3; x <= 20; x++) { const v = 4.2 * Math.sqrt(Math.max(0, 1 - Math.pow((x - 11.5) / 9, 2))); const y = Math.round(11 + v * 0.9); if (b.isOpaque(x, y) && y >= 11) b.set(x, y, P(St.m)); }
    // knot + tails at front-right
    H.poly(b, [[15, 14], [19, 18], [21, 22], [17, 21], [14, 17]], Bn, { mode: 'cel' });
    H.poly(b, [[13, 15], [14, 21], [10, 20], [11, 16]], Bn, { mode: 'cel' });
    H.ell(b, 14, 15, 2.4, 2.2, R('#ff8a58'), { mode: 'dome' });
    return H.done(b, '#6a1a08', 'choice_band');
  });

  H.add('choice_specs', 'held', false, (b) => {
    const Fr = R('#7a52e0'), Ln = R('glass');
    for (const cx of [6.5, 17.5]) {
      H.ell(b, cx, 12.5, 5.8, 5.8, Fr, { mode: 'dome' });
      H.ell(b, cx, 12.5, 4.1, 4.1, Ln, { mode: 'cel' });
      H.pxs(b, [[cx - 2, 11], [cx - 2, 10], [cx - 1, 10]].map((p) => [Math.round(p[0]), p[1]]), '#ffffff');
    }
    // bridge + temples
    H.rect(b, 11, 10, 3, 2, Fr, { mode: 'flat' });
    H.pline(b, [[1, 10], [0, 6]], Fr.d1);
    H.pline(b, [[22, 10], [23, 6]], Fr.d1);
    H.twinkle(b, 12, 4, '#ffffff');
    return H.done(b, '#24145a', 'choice_specs');
  });

  H.add('choice_scarf', 'held', false, (b) => {
    const Sc = R('#3ec6d8'), Wh = R('white');
    // loop around the neck (top), then a long tail hanging down with fringe
    H.part(b, (x, y) => y >= 3 && y <= 10 && Math.pow((x - 11.5) / 10.4, 2) + Math.pow((y - 7) / 4.6, 2) <= 1, Sc, { mode: 'cel' });
    fillFn(b, (x, y) => b.isOpaque(x, y) && Math.pow((x - 11.5) / 5.8, 2) + Math.pow((y - 6) / 2.2, 2) <= 1, Sc.d1);
    H.part(b, (x, y) => y >= 9 && y <= 19 && x >= 13 - (y - 9) * 0.25 && x <= 20 - (y - 9) * 0.25, Sc, { mode: 'cel' });
    H.part(b, (x, y) => y >= 8 && y <= 15 && x >= 5 && x <= 11 + (y - 8) * 0.3, R('#5ad4e4'), { mode: 'cel' });
    // stripes
    for (let y = 11; y <= 18; y += 4) for (let x = 10; x <= 20; x++) if (b.isOpaque(x, y) && x > 11 - (y - 9) * 0.25 + 2) b.set(x, y, P(Wh.m));
    // fringe
    for (let x = 12; x <= 18; x += 2) { b.set(x - ((x - 12) >> 2), 20, P(Sc.d1)); b.set(x - ((x - 12) >> 2), 21, P(Sc.m)); }
    H.twinkle(b, 4, 16, '#ffffff');
    return H.done(b, '#0e4a58', 'choice_scarf');
  });

  H.add('expert_belt', 'held', false, (b) => {
    const Lt = R('#6a4438'), Go = R('gold');
    H.rect(b, 1, 8, 22, 8, Lt, { mode: 'cel' });
    H.dash(b, 2, 10, 21, 10, '#c89a6a', 2, 1); H.dash(b, 2, 14, 21, 14, '#c89a6a', 2, 1);
    // belt holes (left)
    for (const x of [3, 6, 9]) b.set(x, 12, P(R('#2a1a16').m));
    // buckle
    H.rect(b, 12, 4, 10, 16, Go, { mode: 'cel' });
    H.rect(b, 14, 7, 6, 10, Lt, { mode: 'cel' });
    H.rect(b, 15, 8, 4, 8, R('#3a2a26'), { mode: 'flat' });
    H.pline(b, [[11, 12], [18, 12]], Go.l1);
    H.pxs(b, [[13, 5], [14, 5]], '#fff6c0');
    return H.done(b, '#2a1612', 'expert_belt');
  });

  H.add('cocoon_charm', 'held', false, (b) => {
    const Sk = R('#f6f0ea');
    // cord loop + hanging string
    H.ringPart(b, 11.5, 2.6, 2.4, 1.1, R('#b49ae8'), { mode: 'flat' });
    H.pline(b, [[11, 4], [11, 5]], '#b49ae8');
    // cocoon body
    H.ell(b, 11.5, 13, 6, 8.4, Sk, { mode: 'dome' });
    // wrapped silk strands
    for (let i = -8; i <= 8; i += 3) {
      for (let t = 0; t <= 12; t++) {
        const x = 5.5 + t, y = 13 + i + (t - 6) * 0.7 + Math.sin(t * 0.5) * 0.8;
        if (b.isOpaque(Math.round(x), Math.round(y))) b.set(Math.round(x), Math.round(y), P(t > 7 ? '#c9b8ea' : '#ddd0f4'));
      }
    }
    // pink tassel
    H.pxs(b, [[11, 21], [12, 21], [10, 20], [13, 20]], '#f58ab0');
    H.twinkle(b, 19, 6, '#ffffff');
    return H.done(b, '#4a3a6a', 'cocoon_charm');
  });

  H.add('thorn_helmet', 'held', false, (b) => {
    const Mt = R('#a8b2c8'), Th = R('#ef5a78');
    // thorns radiating from the dome
    for (const [x0, y0, x1, y1, w] of [[11.5, 8, 11.5, 1, 2], [6, 10, 2, 4, 2], [17, 10, 21, 4, 2], [3.5, 14, 0.5, 10, 2]]) {
      const dx = x1 - x0, dy = y1 - y0, L = Math.hypot(dx, dy), nx = -dy / L * w, ny = dx / L * w;
      H.poly(b, [[x0 + nx, y0 + ny], [x1, y1], [x0 - nx, y0 - ny]], Th, { mode: 'cel', hi: 1, sh: 1 });
    }
    // dome
    H.part(b, (x, y) => y >= 7 && y <= 20 && (y <= 15 ? Math.pow((x - 11.5) / 9.6, 2) + Math.pow((y - 15) / 8.4, 2) <= 1 : Math.abs(x - 11.5) <= 9.6), Mt, { mode: 'dome', r: 9 });
    // face opening + brim
    H.rect(b, 5, 17, 14, 4, R('#7a8498'), { mode: 'cel' });
    H.rect(b, 7, 15, 10, 3, R('#2a2c48'), { mode: 'flat' });
    H.pxs(b, [[7, 11], [8, 10], [6, 12]], '#ffffff');
    // thimble dimples
    for (const [x, y] of [[10, 9], [13, 9], [8, 12], [11, 12], [14, 12]]) b.set(x, y, P(Mt.d1));
    return H.done(b, '#3a2440', 'thorn_helmet');
  });

  H.add('bell_charm', 'held', false, (b) => {
    const Sh = R('#f8b6cc'), Go = R('gold');
    H.ringPart(b, 11.5, 2.8, 2.4, 1.1, Go, { mode: 'flat' });
    // scallop fan
    H.part(b, (x, y) => y >= 5 && y <= 19 && Math.pow((x - 11.5) / 10, 2) + Math.pow((y - 18) / 13.5, 2) <= 1 && y <= 19, Sh, { mode: 'dome', r: 10 });
    // radial ribs
    for (let i = -3; i <= 3; i++) {
      const a = -Math.PI / 2 + i * 0.36;
      for (let r = 3; r <= 13; r++) { const x = Math.round(11.5 + Math.cos(a) * r), y = Math.round(18 + Math.sin(a) * r); if (b.isOpaque(x, y) && y < 19) b.set(x, y, P(i < 0 ? Sh.l1 : Sh.d1)); }
    }
    // scalloped edge
    for (let i = -4; i <= 4; i++) H.px(b, Math.round(11.5 + i * 2.3), 5 + Math.round(Math.abs(i) * 1.1), Sh.l2);
    // hinge + bell clapper
    H.rect(b, 8, 19, 7, 2, Go, { mode: 'cel' });
    H.ell(b, 11.5, 21.3, 1.6, 1.3, Go, { mode: 'flat' });
    H.twinkle(b, 20, 6, '#ffffff');
    return H.done(b, '#6a2a48', 'bell_charm');
  });

  H.add('share_ribbon', 'held', false, (b) => {
    const Rb = R('#4ea8f2');
    // tails
    H.poly(b, [[7, 14], [11, 14], [9, 22], [6, 20], [3, 22]], Rb, { mode: 'cel' });
    H.poly(b, [[12, 14], [16, 14], [20, 22], [17, 20], [14, 22]], R('#f25a88'), { mode: 'cel' });
    // rosette ruffle
    const cx = 11.5, cy = 9;
    for (let i = 0; i < 10; i++) { const a = (i / 10) * Math.PI * 2; H.ell(b, cx + Math.cos(a) * 5.2, cy + Math.sin(a) * 5.2, 2.6, 2.6, Rb, { mode: 'dome' }); }
    H.ell(b, cx, cy, 5.2, 5.2, R('#e8f4ff'), { mode: 'dome' });
    H.heart(b, 8.5, 6.5, '#f25a88');
    H.twinkle(b, 21, 3, '#ffffff');
    return H.done(b, '#14306a', 'share_ribbon');
  });

  H.add('lucky_pin', 'held', false, (b) => {
    const Lf = R('#3fb84e'), Go = R('gold');
    // gold pin across the bottom-left
    H.cap(b, 3, 20, 13, 13, 0.6, Go, { mode: 'flat' });
    // four leaves
    for (const [dx, dy] of [[-3.6, -3.4], [3.6, -3.4], [-3.6, 3.4], [3.6, 3.4]]) H.ell(b, 12 + dx, 9.5 + dy, 3.7, 3.7, Lf, { mode: 'dome' });
    H.ell(b, 12, 9.5, 2.4, 2.4, R('#6fd06e'), { mode: 'dome' });
    H.pline(b, [[12, 9], [12, 4]], Lf.d1); H.pline(b, [[12, 10], [12, 15]], Lf.d1);
    H.pxs(b, [[8, 5], [9, 5], [7, 6]], '#d8ffc8');
    H.ell(b, 4, 20, 1.6, 1.6, R('rose'));
    H.twinkle(b, 20, 18, '#ffe070');
    return H.done(b, '#0e4a20', 'lucky_pin');
  });

  H.add('coin_charm', 'held', false, (b) => {
    const Go = R('gold'), Rd = R('#e8485e');
    // tassel
    H.pxs(b, [[11, 20], [12, 20], [10, 21], [13, 21], [11, 21], [12, 21]], Rd.m);
    H.rect(b, 10, 19, 4, 2, Rd, { mode: 'flat' });
    H.pline(b, [[11, 18], [11, 19]], Rd.d1);
    H.ell(b, 11.5, 10.5, 9, 9, Go, { mode: 'dome' });
    H.ring(b, 11, 10, 7, 6.2, P(Go.d1));
    // emblem: little spool star
    H.poly(b, K.starPts(11.5, 10.5, 4, 1.8, 5), R('#fff0a0'), { mode: 'flat' });
    H.pxs(b, [[5, 6], [6, 5], [5, 7]], '#fff6c8');
    H.twinkle(b, 20, 3, '#ffffff', true);
    return H.done(b, '#5a3a08', 'coin_charm');
  });

  H.add('stay_button', 'held', false, (b) => {
    const St = R('#9aa2b8'), Th = '#f4ecd8';
    H.ell(b, 11.5, 11.5, 9.4, 9.4, St, { mode: 'dome' });
    H.ring(b, 11, 11, 7.2, 6.4, P(St.d1));
    // four holes + crossed thread
    for (const [dx, dy] of [[-3, -3], [3, -3], [-3, 3], [3, 3]]) { b.fillRect(11 + dx, 11 + dy, 2, 2, P(St.d2)); }
    H.pline(b, [[8, 8], [14, 14]], Th); H.pline(b, [[14, 8], [8, 14]], Th);
    H.pline(b, [[9, 8], [15, 14]], St.d1);
    H.pxs(b, [[6, 6], [7, 5], [5, 7]], '#e8ecf8');
    // little anchor lock at the bottom
    H.ell(b, 18, 19, 3, 2.4, R('gold'));
    b.set(18, 19, P('#7a5a10'));
    return H.done(b, '#2a2e48', 'stay_button');
  });

  H.add('quick_claw', 'held', false, (b) => {
    const Iv = R('#f8ecc8'), Go = R('gold');
    // crescent claw: big circle minus shifted circle
    H.part(b, (x, y) => Math.hypot(x - 11, y - 12) <= 10 && Math.hypot(x - 15.5, y - 8.5) > 8.4 && !(y < 4), Iv, { mode: 'cel', hi: 1, sh: 1 });
    // gold cord + loop at the thick end and a bow
    H.pline(b, [[6, 18], [4, 20]], Go.m);
    H.ell(b, 4, 20.5, 2.3, 2, R('rose'));
    H.pxs(b, [[6, 9], [7, 7], [9, 5]], '#ffffff');
    H.pline(b, [[5, 13], [7, 17]], Iv.d1);
    // speed lines
    H.pxs(b, [[17, 17], [18, 17], [19, 17], [15, 20], [16, 20], [20, 14], [21, 14]], '#ffe070');
    return H.done(b, '#5a4418', 'quick_claw');
  });

  H.add('focus_band', 'held', false, (b) => {
    const Bn = R('#3c4cc0'), Gm = R('#ff4f6e'), Wh = R('white');
    H.poly(b, [[15, 14], [21, 21], [18, 22], [13, 17]], Bn, { mode: 'cel' });
    H.poly(b, [[13, 14], [16, 22], [12, 22], [10, 16]], Bn, { mode: 'cel' });
    H.rect(b, 1, 6, 17, 9, Bn, { mode: 'cel' });
    H.dash(b, 2, 8, 17, 8, Wh.m, 2, 1); H.dash(b, 2, 12, 17, 12, Wh.m, 2, 1);
    H.ell(b, 9.5, 10, 4.8, 4.8, R('gold'), { mode: 'dome' });
    H.ell(b, 9.5, 10, 3, 3, Gm, { mode: 'dome' });
    b.set(8, 9, P('#ffd0da'));
    H.twinkle(b, 20, 5, '#ffffff');
    return H.done(b, '#14185a', 'focus_band');
  });

  H.add('scope_lens', 'held', false, (b) => {
    const Go = R('gold'), Gl = R('glass');
    // chain
    H.dash(b, 17, 17, 21, 22, '#e8c050', 1, 1);
    H.ell(b, 11.5, 10.5, 9, 9, Go, { mode: 'dome' });
    H.ell(b, 11.5, 10.5, 7, 7, Gl, { mode: 'cel', hi: 1, sh: 1 });
    // cross hair
    b.hline(5, 10, 13, P('#e8405a')); b.vline(11, 4, 13, P('#e8405a'));
    H.ring(b, 11, 10, 3.4, 2.6, P('#e8405a'));
    H.pxs(b, [[6, 6], [7, 5], [6, 7]], '#ffffff');
    // clip
    H.rect(b, 10, 19, 3, 3, Go, { mode: 'cel' });
    return H.done(b, '#5a3a08', 'scope_lens');
  });

  H.add('lens_glass', 'held', false, (b) => {
    const Wd = R('#b4733c'), Gl = R('glass'), Go = R('#c8d0e0');
    // handle
    H.cap(b, 16, 16, 21, 21, 1.9, Wd, { mode: 'cel' });
    H.cap(b, 14, 14, 16, 16, 1.4, Go, { mode: 'cel' });
    // rim + lens
    H.ell(b, 9.5, 9.5, 8.6, 8.6, Go, { mode: 'dome' });
    H.ell(b, 9.5, 9.5, 6.6, 6.6, Gl, { mode: 'cel', hi: 1, sh: 1 });
    H.pline(b, [[5, 8], [7, 5]], '#ffffff'); H.pline(b, [[5, 10], [6, 8]], '#ffffff');
    // magnified sparkle
    H.twinkle(b, 12, 12, '#fff8b0');
    return H.done(b, '#2a3a5a', 'lens_glass');
  });

  H.add('float_balloon', 'held', false, (b) => {
    const Bl = R('#f25a78');
    H.ell(b, 11.5, 9, 7, 8, Bl, { mode: 'dome' });
    H.poly(b, [[10, 16.5], [13, 16.5], [11.5, 19]], Bl, { mode: 'cel' });
    H.pline(b, [[11, 19], [13, 20], [10, 21], [12, 22]], '#f4ecd8');
    H.pxs(b, [[7, 5], [8, 4], [7, 6], [9, 3]], '#ffd0da');
    H.twinkle(b, 20, 5, '#ffffff');
    return H.done(b, '#5a1230', 'float_balloon');
  });

  H.add('iron_ball', 'held', false, (b) => {
    const Ir = R('#5a6680');
    // chain links
    H.ringPart(b, 5, 4.5, 2.6, 1.2, R('steel'), { mode: 'cel' });
    H.ringPart(b, 9.5, 2.6, 2.6, 1.2, R('steel'), { mode: 'cel' });
    H.ell(b, 12, 13.5, 8.6, 8.4, Ir, { mode: 'dome' });
    // eyelet ring on top-left
    H.rect(b, 5, 7, 3, 3, R('steel'), { mode: 'cel' });
    H.pxs(b, [[8, 8], [9, 7], [8, 7]], '#e8ecf8');
    H.pxs(b, [[7, 10], [6, 11]], '#c8d0e0');
    H.twinkle(b, 20, 20, '#ffffff');
    return H.done(b, '#1a2036', 'iron_ball');
  });

  function orb(emblemId, col, tag, inkc) {
    return (b) => {
      const Ob = R(col), Gs = R('#ffffff');
      // little brass stand
      H.ell(b, 11.5, 20, 6.5, 2, R('gold'));
      H.ell(b, 11.5, 11, 9.4, 9.4, Ob, { mode: 'dome' });
      // glass rim highlight + inner glow
      fillFn(b, (x, y) => b.isOpaque(x, y) && Math.hypot(x - 11, y - 10) < 6.8 && Math.hypot(x - 11, y - 10) > 6, Ob.l1);
      const rows9 = G.E9[emblemId];
      H.art(b, 7, 7, rows9, { '#': Ob.l2, o: Ob.d2, w: '#ffffff' });
      H.pxs(b, [[5, 6], [6, 5], [5, 7], [7, 4]], '#ffffff');
      H.twinkle(b, 20, 5, '#ffffff');
      return H.done(b, inkc, tag);
    };
  }
  H.add('toxic_orb', 'held', false, orb('nettle', '#a055c8', 'toxic_orb', '#33104a'));
  H.add('flame_orb', 'held', false, orb('ember', '#ef6a2a', 'flame_orb', '#5a1a08'));
})(typeof globalThis !== 'undefined' ? globalThis : window);
