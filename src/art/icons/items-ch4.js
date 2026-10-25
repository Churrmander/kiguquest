/* src/art/icons/items-ch4.js — Chapter 4 item icons (24x24): Dune Cocoa, Starlit Thread, Mimi's Dust Scarf, the Society's slab
 * order, Bobbin's spare tape measure and Gusset's hand-drawn quarry maps. Same toolkit and look as the other item icons:
 * 3/4 view, light from the top-left, hue-shifted ramps, 1px ink outline. */
(function (root) {
  'use strict';
  const NP = (root.NP = root.NP || {});
  const I = NP.art.icons;
  const K = I._kit;
  const H = I._items;
  const { P } = K;
  const R = H.R;
  const art = (b, x, y, rows, map) => H.art(b, x, y, rows, map);

  // ================================================================== dune cocoa: a clay mug of cocoa with a cinnamon stick
  H.add('dune_cocoa', 'healing', false, (b) => {
    const Cl = R('#d0784a'), Co = R('#7a4426'), Cn = R('#b0642e');
    H.rrect(b, 4, 8, 13, 13, 3, Cl, { mode: 'cyl' });
    H.ring(b, 18.5, 14, 3.6, 2.0, P(Cl.d1));                          // handle
    b.ellipse(10.5, 9.2, 5.6, 1.7, P(Co.m)); b.hline(7, 9, 6, P(Co.l1));
    art(b, 6, 14, ['.ww.ww.ww'], { w: '#f4e0c0' });                    // a painted zig-zag band
    art(b, 6, 15, ['w.ww.ww.w'], { w: '#f4e0c0' });
    H.cap(b, 13, 9, 16, 2.5, 0.9, Cn, { mode: 'flat' });               // cinnamon stick
    H.pline(b, [[14, 8], [16, 3]], Cn.l1);
    H.pxs(b, [[7, 5, '#ffffff'], [8, 3, '#ffffff'], [10, 4, '#ffffff'], [9, 6, '#f0f0f0']]);   // steam
    return H.done(b, '#40200e', 'dune_cocoa');
  });

  // ================================================================== starlit thread: a spool of violet thread that glitters
  H.add('starlit_thread', 'held', false, (b) => {
    const Wd = R('#d89a5a'), Vi = R('#9a6ae2');
    H.rect(b, 5, 3, 14, 3, Wd, { mode: 'cel', sh: 1, hi: 1 });
    H.rect(b, 5, 18, 14, 3, Wd, { mode: 'cel', sh: 1, hi: 1 });
    H.rect(b, 7, 6, 10, 12, Vi, { mode: 'cyl' });
    for (let y = 7; y < 18; y += 2) b.hline(8, y, 8, P(Vi.d1));
    H.pline(b, [[16, 12], [20, 15], [19, 20]], Vi.l1);
    H.twinkle(b, 10, 9, '#ffffff', true); H.twinkle(b, 14, 15, '#f4e8ff'); H.twinkle(b, 20, 6, '#ffffff');
    return H.done(b, '#3a2060', 'starlit_thread');
  });

  // ================================================================== dust scarf: Mimi's folded tent-cloth scarf with a pink stitch
  H.add('dust_scarf', 'key', false, (b) => {
    const Sa = R('#e8c890'), St = R('#e05a6a');
    H.poly(b, [[3, 7], [20, 4], [21, 11], [4, 14]], Sa, { mode: 'cel', sh: 1, hi: 1 });
    H.poly(b, [[5, 13], [19, 11], [18, 19], [6, 21]], Sa, { mode: 'cel', sh: 1, hi: 0 });
    for (let x = 5; x < 20; x += 3) b.set(x, Math.round(9.6 - (x - 5) * 0.17), P(St.m));   // running stitch
    for (let x = 7; x < 18; x += 3) b.set(x, Math.round(16.5 - (x - 7) * 0.12), P(St.m));
    art(b, 5, 20, ['f.f.f'], { f: '#c8a066' }); art(b, 16, 18, ['f.f'], { f: '#c8a066' });   // fringe
    H.twinkle(b, 21, 2, '#ffffff');
    return H.done(b, '#5a3e1c', 'dust_scarf');
  });

  // ================================================================== slab order: a clipboard form stamped with the flat iron
  H.add('slab_order', 'key', false, (b) => {
    const Bd = R('#b8884a'), Pp = R('#f8f6f0'), Bl = R('#3e6cc8');
    H.rrect(b, 4, 3, 16, 19, 2, Bd, { mode: 'cel', sh: 1, hi: 1 });
    H.rect(b, 6, 5, 12, 15, Pp, { mode: 'cel', sh: 1, hi: 0 });
    H.rect(b, 9, 2, 6, 3, R('steel'), { mode: 'cel', sh: 1, hi: 1 });
    for (const y of [8, 10, 12]) b.hline(7, y, 9, P(Pp.d2));
    H.rect(b, 8, 14, 7, 4, Bl, { mode: 'cel', sh: 0, hi: 0 });         // the blue stamp: a little flat iron
    art(b, 9, 15, ['.###.', '#####'], { '#': '#f4f8ff' });
    return H.done(b, '#3a2a14', 'slab_order');
  });

  // ================================================================== spare tape measure: a rolled-up tape with a brass end
  H.add('spare_tape', 'key', false, (b) => {
    const Tp = R('#f4d84a'), Br = R('gold');
    H.ell(b, 10, 11, 7.5, 7.5, Tp, { mode: 'dome' });
    for (let r = 2; r < 7; r += 2) H.ring(b, 10, 11, r + 0.5, r - 0.2, P(Tp.d1));
    H.cap(b, 15, 15, 21, 20, 1.6, Tp, { mode: 'flat' });
    for (let i = 0; i < 3; i++) b.set(16 + i * 2, 16 + i * 2, P('#3a3020'));   // tick marks
    H.rect(b, 20, 19, 3, 3, Br, { mode: 'cel', sh: 1, hi: 1 });
    H.twinkle(b, 4, 3, '#ffffff');
    return H.done(b, '#4a3a08', 'spare_tape');
  });

  // ================================================================== quarry maps: a rolled map tied with string, one corner open
  H.add('quarry_maps', 'key', false, (b) => {
    const Pa = R('#efdcae'), Ln = R('#7a5a3a');
    H.rect(b, 3, 6, 15, 14, Pa, { mode: 'cel', sh: 1, hi: 1 });
    H.cap(b, 17, 5, 17, 20, 2.6, Pa, { mode: 'cyl' });
    // tunnels drawn in pencil, a cart track and an X
    H.pline(b, [[5, 9], [9, 9], [11, 13], [15, 13]], Ln.m);
    H.pline(b, [[6, 17], [10, 16], [12, 13]], Ln.m);
    H.dash(b, 5, 11, 14, 18, '#5a5a6a', 1, 1);
    art(b, 12, 7, ['#.#', '.#.', '#.#'], { '#': '#d94a62' });
    b.hline(15, 12, 5, P('#c03a3a'));                                   // the string
    H.twinkle(b, 21, 3, '#ffffff');
    return H.done(b, '#4a3624', 'quarry_maps');
  });
})(typeof globalThis !== 'undefined' ? globalThis : window);
