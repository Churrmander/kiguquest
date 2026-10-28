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

  // ================================================================== linen thread: a rough sand-coloured hank, twisted and tied
  H.add('linen_thread', 'key', false, (b) => {
    const Ln = R('#d8c08a'), Tie = R('#8a5a34');
    H.ell(b, 8, 12, 5, 8, Ln, { mode: 'dome' });
    H.ell(b, 15, 12, 5, 8, Ln, { mode: 'dome' });
    for (let y = 6; y < 19; y += 2) { b.set(6 + (y & 2 ? 1 : 0), y, P(Ln.d1)); b.set(16 - (y & 2 ? 1 : 0), y, P(Ln.d1)); }
    H.rect(b, 10, 9, 3, 7, Tie, { mode: 'cel', sh: 1, hi: 1 });          // the tie round the middle
    H.pline(b, [[12, 16], [15, 21], [18, 20]], Ln.d1);                    // a loose end
    H.twinkle(b, 21, 3, '#ffffff');
    return H.done(b, '#4a3818', 'linen_thread');
  });

  // ================================================================== onigiri: a rice triangle with a nori band
  H.add('onigiri', 'healing', false, (b) => {
    const Ri = R('#fbfaf2'), No = R('#2e4a3a');
    H.poly(b, [[12, 3], [21, 19], [3, 19]], Ri, { mode: 'cel', sh: 1, hi: 1 });
    H.rect(b, 8, 13, 8, 7, No, { mode: 'cel', sh: 1, hi: 0 });
    H.pxs(b, [[10, 8, '#e8e4d4'], [14, 10, '#e8e4d4'], [12, 6, '#ffffff']]);
    return H.done(b, '#3a3a34', 'onigiri');
  });

  // ================================================================== rinse salts: a corked jar of pale blue bath salts
  H.add('rinse_salts', 'key', false, (b) => {
    const Gl = R('#cfe8f4'), Sl = R('#8ac8e8'), Ck = R('#b0844e');
    H.rrect(b, 5, 7, 14, 15, 3, Gl, { mode: 'cyl' });
    H.rect(b, 6, 12, 12, 9, Sl, { mode: 'cel', sh: 1, hi: 1 });
    H.rect(b, 8, 3, 8, 4, Ck, { mode: 'cel', sh: 1, hi: 1 });
    H.pxs(b, [[8, 14, '#ffffff'], [12, 16, '#ffffff'], [15, 13, '#ffffff'], [10, 18, '#e8f8ff']]);
    H.twinkle(b, 20, 4, '#ffffff');
    return H.done(b, '#1e3a4a', 'rinse_salts');
  });

  // ================================================================== balloon post letters: a bundle of envelopes tied with string
  H.add('post_letters', 'key', false, (b) => {
    const En = R('#f6f0e0'), Sp = R('#d84a4a');
    H.rect(b, 4, 6, 15, 10, En, { mode: 'cel', sh: 1, hi: 1 });
    H.rect(b, 6, 9, 15, 10, En, { mode: 'cel', sh: 1, hi: 1 });
    H.pline(b, [[6, 9], [13, 14], [20, 9]], En.d2);                      // the flap
    H.rect(b, 17, 11, 3, 3, Sp, { mode: 'cel', sh: 0, hi: 1 });          // a stamp
    b.vline(12, 6, 13, P('#8a5a34'));                                     // string
    return H.done(b, '#3a3020', 'post_letters');
  });

  // ================================================================== balloon patches: three mismatched fabric squares, stacked
  H.add('balloon_patches', 'key', false, (b) => {
    H.rect(b, 3, 10, 9, 9, R('#5ab4e8'), { mode: 'cel', sh: 1, hi: 1 });
    H.rect(b, 9, 5, 9, 9, R('#f4c84a'), { mode: 'cel', sh: 1, hi: 1 });
    H.rect(b, 12, 12, 9, 9, R('#e86a8a'), { mode: 'cel', sh: 1, hi: 1 });
    art(b, 13, 13, ['#.#.#.#', '.......', '#.....#'], { '#': '#7a2a3a' });
    art(b, 10, 6, ['.#.#.#.'], { '#': '#8a6a1a' });
    return H.done(b, '#2a2a3a', 'balloon_patches');
  });

  // ================================================================== Canvas Rest's sun-cloth quest (owner's padding idea)
  // cactus needles: three long cactus spines, laid side by side like sewing needles, with red thread looped through the eye of
  // the middle one (the weavers sew sun-cloth with them). A sliver of green skin still clings to each root.
  H.add('cactus_needles', 'key', false, (b) => {
    const Th = R('#e0485a'), Gr = R('#6aa84a');
    // the scrap of cactus they came from: a little green pad with two pale areoles, the spines still run through it
    H.ell(b, 8, 15, 4.5, 3, Gr, { mode: 'dome' });
    H.pxs(b, [[6, 13], [10, 16]], '#f4f0c0');
    const needle = (x0, y0, len) => {
      for (let i = 0; i < len; i++) {
        const x = x0 + i, y = y0 - i, thick = i < len - 3;
        b.set(x, y, P('#fff4d0'));
        if (thick) b.set(x + 1, y, P('#e0c890'));
        if (thick) b.set(x, y + 1, P('#c8a868'));
      }
    };
    needle(2, 17, 15); needle(5, 20, 15); needle(10, 21, 11);
    // the eye of the middle needle, with red thread through it, looping out to the right
    b.set(6, 19, 0);
    H.pline(b, [[6, 19], [9, 21], [14, 22], [18, 21], [20, 18], [19, 15]], Th.m);
    H.pline(b, [[8, 20], [12, 21]], Th.l1);
    H.twinkle(b, 21, 3, '#ffffff');
    return H.done(b, '#3a2a14', 'cactus_needles');
  });

  // desert herbs: a tied bunch of silver-leaf, with lance leaves, little orange-eyed flowers and cut stems below the twine
  H.add('desert_herbs', 'key', false, (b) => {
    const St = R('#7a5a2a'), Tw = R('#e8d8b0'), LL = '#d4e0d4', LM = '#9cb4a4', LD = '#5f7a6a';
    // stems: three fanning up from the tie, three cut ends below it
    H.pline(b, [[11, 18], [6, 6]], St.m); H.pline(b, [[12, 18], [12, 4]], St.m); H.pline(b, [[13, 18], [18, 6]], St.m);
    H.pxs(b, [[10, 21], [11, 20], [12, 21], [12, 20], [14, 21], [13, 20]], St.d1);
    // lance leaves (2x4), light edge on the left, shadow on the right, with gaps so the stems show
    const leaf = (x, y, s) => {
      for (let i = 0; i < 4; i++) { b.set(x + s * Math.floor(i / 2), y + i, P(i === 0 ? LL : LM)); b.set(x + s * Math.floor(i / 2) + 1, y + i, P(i === 3 ? LD : LM)); }
    };
    leaf(4, 10, 1); leaf(8, 12, -1); leaf(13, 9, -1); leaf(16, 11, 1); leaf(9, 6, -1); leaf(14, 13, 1);
    // flowers: 3x3 plus shapes with orange eyes, poking above the leaves
    for (const [x, y] of [[6, 4], [12, 2], [18, 4]]) { H.pxs(b, [[x, y - 1], [x - 1, y], [x + 1, y], [x, y + 1]], '#f8d040'); b.set(x, y, P('#e87828')); }
    // twine
    H.rect(b, 9, 17, 6, 2, Tw, { mode: 'cel', sh: 1, hi: 1 });
    H.twinkle(b, 21, 18, '#ffffff');
    return H.done(b, '#24341a', 'desert_herbs');
  });

  // field journal: a sand-scuffed notebook, with a pencil tucked in its band and a little nibble out of one corner
  H.add('field_journal', 'key', false, (b) => {
    const Cv = R('#3a8a7a'), Pg = R('cream'), Bd = R('#c8603a'), Pc = R('#f0c040');
    H.rect(b, 6, 4, 14, 17, Pg, { mode: 'cel', sh: 1, hi: 0 });
    for (let y = 7; y <= 18; y += 2) b.hline(18, y, 2, P(Pg.d1));
    H.rrect(b, 3, 3, 15, 17, 1, Cv, { mode: 'cel', sh: 1, hi: 1 });
    H.rect(b, 3, 3, 2, 17, R('#2a6a5a'), { mode: 'flat' });                   // spine
    // a paw-print sticker on the cover (the researcher's), and the nibble out of the bottom corner
    H.pxs(b, [[9, 12], [10, 12], [11, 12], [9, 13], [10, 13], [11, 13], [7, 10], [9, 9], [11, 9], [13, 10]], Pg.l1);   // paw: a 3x2 pad, four toes in a flat arc
    // elastic band and a pencil
    H.rect(b, 14, 3, 2, 17, Bd, { mode: 'cel', sh: 1, hi: 0 });
    H.cap(b, 20, 2, 21, 13, 1, Pc, { mode: 'cyl' }); H.pxs(b, [[21, 14], [21, 15]], '#5a3a20');
    for (const [x, y] of [[19, 20], [18, 20], [19, 19]]) b.set(x, y, 0);                         // the nibble out of the page corner
    H.pxs(b, [[17, 20], [18, 19], [19, 18]], Pg.d1);
    H.twinkle(b, 22, 20, '#ffffff');
    return H.done(b, '#12302a', 'field_journal');
  });
})(typeof globalThis !== 'undefined' ? globalThis : window);
