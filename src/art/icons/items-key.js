/* src/art/icons/items-key.js — key items that were still missing icons (24x24): sketchbook, tailor licence, button case, town map,
 * Poppy's cream thread, the 'D' handkerchief, Everspool silk, the Crisp & Co. staff pass and Zip's cable.
 * (disc_snip / disc_paddle live in items-pins.js with the other discs.) Same toolkit and look as the other item icons:
 * 3/4 view, light from the top-left, hue-shifted ramps, 1px ink outline, <= 16 colours.
 */
(function (root) {
  'use strict';
  const NP = (root.NP = root.NP || {});
  const I = NP.art.icons;
  const K = I._kit;
  const H = I._items;
  const { P, layer } = K;
  const R = H.R;
  const art = (b, x, y, rows, map) => H.art(b, x, y, rows, map);

  // ================================================================== sketchbook: the Kigu encyclopedia
  H.add('sketchbook', 'key', true, (b) => {
    const Cv = R('#3f86d8'), Pg = R('cream'), Sp = R('#2b58b0'), Rd = R('#e8485e');
    // page block peeking out at the right and bottom
    H.rect(b, 6, 3, 15, 19, Pg, { mode: 'cel', sh: 1, hi: 0 });
    for (let y = 6; y <= 19; y += 2) b.hline(19, y, 2, P(Pg.d1));
    b.hline(8, 21, 12, P(Pg.d1));
    // cloth cover, thread-bound spine, elastic band
    H.rect(b, 3, 2, 15, 19, Cv, { mode: 'cel', sh: 1, hi: 1 });
    H.rect(b, 3, 2, 3, 19, Sp, { mode: 'cel', sh: 0, hi: 1 });
    for (const y of [4, 9, 14, 19]) b.vline(4, y, 2, P('#fff1cc'));
    H.rect(b, 15, 2, 2, 19, Rd, { mode: 'cel', sh: 1, hi: 0 });
    // embroidered patch: a fox-hooded Kigu face
    H.ell(b, 10.5, 11.2, 4.9, 5.1, R('cream'), { mode: 'dome', r: 5.1 });
    art(b, 7, 8, ['o.....o', 'oo...oo', 'ooooooo', 'oEoooEo', 'oowwwoo', '.owNwo.', '..ooo..'], { o: '#f08a38', E: '#3a2020', N: '#3a2020', w: '#fff6e4' });
    // bookmark ribbon
    H.rect(b, 12, 21, 2, 3, R('pink'), { mode: 'cel', sh: 1, hi: 0 });
    H.twinkle(b, 21, 3, '#ffffff');
    return H.done(b, '#17224f', 'sketchbook');
  });

  // ================================================================== tailor licence: an apprentice's card
  H.add('tailor_license', 'key', true, (b) => {
    const Cd = R('#fff0cc'), Rd = R('#d94a62'), Go = R('gold');
    H.rrect(b, 2, 4, 20, 16, 2, Cd, { mode: 'cel', sh: 1, hi: 1 });
    // header band: crossed scissors crest + a line of "text"
    H.rect(b, 4, 6, 16, 3, Rd, { mode: 'flat' });
    art(b, 5, 6, ['#.#', '.#.', '#.#'], { '#': Cd.m });
    b.hline(10, 7, 8, P(Cd.d1));
    // photo window with a little bust (brown hair, rose top)
    H.rect(b, 4, 10, 7, 8, R('#bfe4f8'), { mode: 'flat' });
    b.ellipse(7.5, 13.2, 2, 2.2, P('#f6c8a0'));
    art(b, 5, 10, ['.hhhhh.', 'h.....h'], { h: '#8a5a38' });
    b.hline(5, 12, 5, P('#8a5a38'));
    b.set(7, 14, P('#3a2020')); b.set(9, 14, P('#3a2020'));
    b.ellipse(7.5, 17.6, 3.3, 1.5, P(Rd.m));
    b.hline(4, 18, 7, P(Cd.m));
    // lines of text + a gold seal with ribbon tails
    b.hline(13, 11, 7, P('#9a7a5a')); b.hline(13, 13, 5, P(Cd.d2)); b.hline(13, 15, 4, P(Cd.d2));
    H.ell(b, 17.5, 15.8, 2.7, 2.7, Go, { mode: 'dome' });
    b.set(16, 15, P(Go.l2));
    // gold border last, so the bust and seal sit inside it
    b.hline(3, 5, 18, P(Go.m)); b.hline(3, 18, 18, P(Go.d1)); b.vline(3, 5, 14, P(Go.l1)); b.vline(20, 5, 14, P(Go.d1));
    b.set(16, 18, P(Rd.m)); b.set(19, 18, P(Rd.d1));
    H.twinkle(b, 21, 3, '#ffffff');
    return H.done(b, '#4a1830', 'tailor_license');
  });

  // ================================================================== button case: a hinged tin that holds the Buttons
  H.add('button_case', 'key', true, (b) => {
    const Lt = R('#9a2e58'), Ln = R('#f8dfd6'), Go = R('gold');
    // open lid standing at the back, cream lining facing us
    H.rrect(b, 3, 1, 18, 8, 2, Lt, { mode: 'cel', sh: 1, hi: 1 });
    H.rect(b, 5, 3, 14, 4, Ln, { mode: 'flat' });
    art(b, 10, 4, ['#.#.#', '#####', '.###.'], { '#': Lt.l1 });
    // gold hinge tabs
    H.rect(b, 2, 8, 3, 2, Go, { mode: 'flat' }); H.rect(b, 19, 8, 3, 2, Go, { mode: 'flat' });
    // tray: velvet inside with three Buttons on show
    H.rect(b, 2, 9, 20, 9, Lt, { mode: 'flat' });
    b.fillRect(2, 9, 20, 9, P(Lt.d2));
    [['#ffd54a', 7], ['#58b0f4', 12.5], ['#ff7aa8', 18]].forEach(([c, x]) => {
      const rr = R(c);
      H.ell(b, x, 13.2, 3.4, 3.4, rr, { mode: 'cel', sh: 1, hi: 1, r: 3.5 });
      for (const [dx, dy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) b.set(Math.round(x + dx * 1.1 - 0.4), 13 + dy, P(rr.d2));
    });
    // leather front wall with a gold clasp
    H.rect(b, 2, 17, 20, 5, Lt, { mode: 'cel', sh: 1, hi: 1 });
    H.rect(b, 10, 16, 4, 5, Go, { mode: 'cel', sh: 1, hi: 1 });
    b.set(11, 18, P(Go.d2)); b.set(12, 18, P(Go.d2)); b.set(11, 19, P(Go.d2));
    H.twinkle(b, 21, 2, '#ffffff');
    return H.done(b, '#3a0e24', 'button_case');
  });

  // ================================================================== town map of Tsumugi: a folded paper map
  H.add('town_map', 'key', true, (b) => {
    const Pa = R('#f8ecc8'), Pb = R('#efdcae');
    // three accordion panels with a zig-zag top and bottom
    const panel = (i, top, bot, pal) => H.part(b, (x, y) => x >= 2 + i * 6.7 && x < 2 + (i + 1) * 6.7 + 0.3 && y >= top && y <= bot, pal, { mode: 'cel', sh: 1, hi: 1 });
    panel(0, 4, 20, Pa); panel(1, 3, 21, Pb); panel(2, 4, 20, Pa);
    // a lake, a patchwork meadow, hills and a little town
    b.ellipse(6, 16, 3.4, 2.3, P('#7fc6e8')); b.ellipse(5, 15, 1.6, 0.9, P('#bfe8f8'));
    art(b, 9, 5, ['gggg.', 'gGGg.', 'gGGgG', '.gggG'], { g: '#8fd06a', G: '#c4ea86' });
    art(b, 16, 5, ['hhhh', 'hHHh'], { h: '#d8b06a', H: '#efd08a' });
    b.ellipse(18.5, 16.2, 3, 1.8, P('#d8b06a')); b.ellipse(18, 15.4, 1.8, 0.8, P('#efd08a'));
    art(b, 11, 13, ['.r.', 'rrr', 'WWW', 'WdW'], { r: '#d94a62', W: '#fff6e0', d: '#8a5a38' });
    // the stitched route, ending in an X
    H.dash(b, 4, 12, 8, 10, '#d94a62', 2, 1); H.dash(b, 9, 10, 13, 11, '#d94a62', 2, 1); H.dash(b, 14, 11, 17, 8, '#d94a62', 2, 1);
    art(b, 18, 5, ['#.#', '.#.', '#.#'], { '#': '#d94a62' });
    // fold shading
    b.vline(8, 5, 15, P(Pb.d1)); b.vline(15, 5, 15, P(Pa.d1));
    H.twinkle(b, 2, 2, '#ffffff');
    return H.done(b, '#4a3624', 'town_map');
  });

  // ================================================================== cream thread: Poppy's cream cotton on a wooden spool
  H.add('cream_thread', 'key', false, (b) => {
    const Cr = R('#fff2d0'), Wd = R('#d99a58');
    const cx = 10.5;
    // lower flange
    b.ellipse(cx, 19.4, 7.2, 2.6, P(Wd.d1)); b.ellipse(cx, 18.4, 7.2, 2.6, P(Wd.m));
    // thread body: a cylinder with wound rows (as on the Bond Spool icons)
    for (let y = 6; y <= 18; y++) for (let x = 5; x <= 16; x++) b.set(x, y, P(x <= 6 ? Cr.l1 : x === 7 ? Cr.l2 : x >= 15 ? Cr.d2 : x >= 13 ? Cr.d1 : Cr.m));
    for (let y = 7; y <= 18; y += 2) for (let x = 5; x <= 16; x++) {
      const yy = y + (x <= 6 || x >= 15 ? 1 : 0);
      if ((x + y) % 5 !== 0 && yy <= 18) b.set(x, yy, P(x >= 13 ? Cr.d2 : x <= 6 ? Cr.m : Cr.d1));
    }
    // upper flange with a centre hole
    b.ellipse(cx, 6.4, 7.2, 2.6, P(Wd.d1)); b.ellipse(cx, 5.4, 7.2, 2.6, P(Wd.m));
    H.ell(b, cx, 5.4, 5.6, 1.7, Wd, { mode: 'dome', r: 5.8 });
    b.set(cx, 5, P('#5a3418')); b.set(cx + 1, 5, P('#5a3418')); b.set(cx, 6, P('#5a3418'));
    // a needle stuck through the thread, trailing a loose tail
    H.cap(b, 15, 13, 21, 5.5, 0.55, R('steel'), { mode: 'flat' });
    b.set(21, 4, P('#ffffff')); b.set(15, 14, P('#3a3a5a'));
    H.pline(b, [[15, 14], [13, 16], [15, 19], [19, 20], [21, 18]], '#fff2d0');
    H.twinkle(b, 3, 3, '#ffffff');
    return H.done(b, '#5a3418', 'cream_thread');
  });

  // ================================================================== 'D' handkerchief: hand-stitched, hems knotted twice
  H.add('d_handkerchief', 'key', false, (b) => {
    const Cl = R('#fffaf0'), Lv = R('#b9a4ec');
    const dia = (x, y) => Math.abs(x - 11.5) + Math.abs(y - 12.5) <= 10.4;
    H.part(b, dia, Cl, { mode: 'cel', sh: 1, hi: 1 });
    // lavender hem band with knotted stitches
    for (let y = 0; y < 24; y++) for (let x = 0; x < 24; x++) {
      if (!b.isOpaque(x, y)) continue;
      const d = Math.abs(x - 11.5) + Math.abs(y - 12.5);
      if (d >= 8.2 && d <= 9.4) b.set(x, y, P(Lv.m));
      else if (d >= 6.6 && d < 7.6 && (x + y) % 3 === 0) b.set(x, y, P(Lv.d1));
    }
    // folded corner flap at the top
    H.poly(b, [[11.5, 2.4], [16.5, 7.4], [6.5, 7.4]], Cl, { mode: 'cel', sh: 1, hi: 1 });
    b.hline(7, 7, 9, P(Cl.d1));
    // the tidy stitched D
    art(b, 9, 10, ['####.', '#...#', '#...#', '#...#', '#...#', '#...#', '####.'], { '#': '#3d4aa8' });
    H.twinkle(b, 20, 4, '#ffffff');
    return H.done(b, '#2a2a6a', 'd_handkerchief');
  });

  // ================================================================== Everspool silk: a skein of golden-green silk that never runs out
  H.add('everspool_silk', 'key', false, (b) => {
    const Gr = R('#7cc43a'), Go = R('#f6d44a');
    // an endless ribbon of silk: a lemniscate, one lobe golden and one green, tilted like it is floating
    const pts = [];
    for (let t = 0; t < Math.PI * 2; t += 0.04) {
      const d = 1 + Math.sin(t) ** 2, x0 = (10.4 * Math.cos(t)) / d, y0 = (12.6 * Math.sin(t) * Math.cos(t)) / d;
      const rot = -0.3;
      pts.push([11.5 + x0 * Math.cos(rot) - y0 * Math.sin(rot), 12 + x0 * Math.sin(rot) + y0 * Math.cos(rot), x0]);
    }
    const near = (x, y) => { let best = 99, side = 0; for (const p of pts) { const d = Math.hypot(p[0] - x, p[1] - y); if (d < best) { best = d; side = p[2]; } } return [best, side]; };
    const inG = (x, y) => { const [d, s0] = near(x, y); return d <= 1.75 && s0 <= 0.6; };
    const inY = (x, y) => { const [d, s0] = near(x, y); return d <= 1.75 && s0 >= -0.6; };
    const lG = H.part(b, inG, Gr, { mode: 'dome', r: 2, detached: true }), lY = H.part(b, inY, Go, { mode: 'dome', r: 2, detached: true });
    for (let y = 0; y < 24; y++) for (let x = 0; x < 24; x++) {
      const g = lG.isOpaque(x, y), yy = lY.isOpaque(x, y);
      if (!g && !yy) continue;
      const side = near(x, y)[1];
      const gold = g && yy ? (side > 0.15 || (Math.abs(side) <= 0.15 && (x + y) % 2 === 0)) : yy;
      b.set(x, y, (gold ? lY : lG).get(x, y));
    }
    // silky sheen along the top of each lobe, and a little paper band at the crossing
    for (const p of pts) { const x = Math.round(p[0]), y = Math.round(p[1] - 1.4); if (b.isOpaque(x, y) && (Math.round(p[0] * 2) % 3 === 0)) b.set(x, y, P(p[2] > 0 ? Go.l2 : Gr.l2)); }
    H.rect(b, 10, 10, 3, 4, R('cream'), { mode: 'cel', sh: 1, hi: 1 });
    b.set(11, 12, P('#5aa84a'));
    H.twinkle(b, 3, 4, '#ffffff', true); H.twinkle(b, 20, 19, '#fffbd0'); H.twinkle(b, 20, 3, '#ffffff');
    return H.done(b, '#27501c', 'everspool_silk');
  });

  // ================================================================== staff pass: Crisp & Co. staff card on a lanyard
  H.add('staff_pass', 'key', false, (b) => {
    const Wh = R('#f4f8ff'), Bl = R('#3e6cc8'), St = R('steel');
    // lanyard straps and clip
    H.pline(b, [[8, 0], [11, 6]], Bl.m); H.pline(b, [[9, 0], [12, 6]], Bl.l1);
    H.pline(b, [[16, 0], [13, 6]], Bl.m); H.pline(b, [[15, 0], [12, 6]], Bl.l1);
    H.rect(b, 10, 5, 4, 3, St, { mode: 'cel', sh: 1, hi: 1 });
    b.set(11, 6, P(St.d2)); b.set(12, 6, P(St.d2));
    // the white card with a blue header and the flat-iron crest
    H.rrect(b, 3, 8, 18, 14, 2, Wh, { mode: 'cel', sh: 1, hi: 1 });
    H.rect(b, 4, 9, 16, 5, Bl, { mode: 'cel', sh: 1, hi: 1 });
    art(b, 5, 9, ['..###..', '.#...#.', '#######', '.######'], { '#': Wh.m });
    b.hline(14, 10, 5, P(Wh.d1)); b.hline(14, 12, 4, P(Wh.d1));
    // photo + text lines
    H.rect(b, 5, 15, 5, 5, R('#d4e2f8'), { mode: 'cel', sh: 1, hi: 1 });
    b.ellipse(7.5, 16.6, 1.3, 1.4, P('#f2c8a0')); b.hline(6, 19, 3, P(Bl.m));
    b.hline(12, 16, 7, P(Bl.l1)); b.hline(12, 18, 5, P(Wh.d1)); b.hline(12, 20, 6, P(Wh.d1));
    H.twinkle(b, 21, 4, '#ffffff');
    return H.done(b, '#1c2c64', 'staff_pass');
  });

  // ================================================================== zip cable: a coil of yellow cable with a plug
  H.add('zip_cable', 'key', false, (b) => {
    const Y = R('#f8d838'), Pl = R('#5a6aa0'), St = R('steel');
    const ring = (cx, cy, rx, ry, t) => (x, y) => { const dx = (x - cx) / rx, dy = (y - cy) / ry, k = dx * dx + dy * dy; return k <= 1 && k >= 1 - t; };
    H.part(b, ring(10, 15.5, 8.4, 6.4, 0.42), Y, { mode: 'dome', r: 2.4 });
    H.part(b, ring(11.5, 14, 6, 4.2, 0.58), Y, { mode: 'dome', r: 2.2 });
    // cable running up to the plug
    H.cap(b, 17, 11, 19, 6.5, 1.2, Y, { mode: 'flat' });
    H.pline(b, [[17, 10], [18, 7]], Y.l2);
    H.rect(b, 16, 3, 6, 4, Pl, { mode: 'cel', sh: 1, hi: 1 });
    b.vline(17, 1, 2, P(St.l1)); b.vline(20, 1, 2, P(St.m));
    // a bright zap
    art(b, 2, 3, ['...##', '..##.', '.##..', '#####', '..##.', '.##..', '##...'], { '#': '#fff6a0' });
    H.pxs(b, [[3, 5], [4, 5]], '#ffffff');
    H.twinkle(b, 4, 21, '#ffffff'); H.twinkle(b, 21, 18, '#fff3a0');
    return H.done(b, '#4a3a08', 'zip_cable');
  });

  // ================================================================== exp share: two spools sharing one golden thread
  H.add('exp_share', 'key', true, (b) => {
    const Wd = R('#d89a5a'), Ra = R('#e2424e'), Bu = R('#3f7ae2'), Go = R('gold');
    // a spool = wooden flanges top and bottom, wound thread between
    const spool = (x, y, w, h, th) => {
      H.rect(b, x + 1, y + 2, w - 2, h - 4, th, { mode: 'cyl' });
      for (let k = y + 3; k < y + h - 2; k += 2) b.hline(x + 1, k, w - 2, P(th.d1));
      H.rrect(b, x, y, w, 3, 1, Wd, { mode: 'cel', sh: 1, hi: 1 });
      H.rrect(b, x, y + h - 3, w, 3, 1, Wd, { mode: 'cel', sh: 1, hi: 1 });
    };
    spool(2, 7, 9, 14, Ra);
    spool(14, 9, 8, 12, Bu);
    // the shared thread: one golden loop running from the red spool over to the blue one
    H.pline(b, [[9, 10], [11, 5], [13, 4], [15, 5], [17, 9]], Go.m);
    H.pline(b, [[9, 9], [11, 4], [13, 3], [15, 4]], Go.l2);
    H.pline(b, [[10, 10], [12, 6], [13, 5], [15, 6], [17, 10]], Go.d1);   // darker underside so the thread holds up at 1x
    H.twinkle(b, 20, 3, '#ffffff');
    return H.done(b, '#4a2a18', 'exp_share');
  });
})(typeof globalThis !== 'undefined' ? globalThis : window);
