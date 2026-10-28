/* src/art/icons/items-fish.js — fishing icons (24x24): the three rods, the Fishing Log, the Gold Scale, the Delicate Teacup, the
 * Tea House dishes, and one icon per real fish in the Fishing Log (registered as items named 'fish_<id>', drawn from the
 * icon spec in src/data/fish.js). Same toolkit and look as the other item icons. Placeholder-grade (owner's call, 2026-10-26). */
(function (root) {
  'use strict';
  const NP = (root.NP = root.NP || {});
  const I = NP.art.icons;
  const K = I._kit;
  const H = I._items;
  const { P } = K;
  const R = H.R;

  // ================================================================== rods: a rod on the diagonal, a reel, a line and a float
  function rod(b, pole, reel, grip, o) {
    const Po = R(pole), Gr = R(grip);
    H.cap(b, 4, 20, 19, 3, 1.1, Po, { mode: 'flat' });
    H.cap(b, 3, 21, 7, 16, 1.6, Gr, { mode: 'flat' });
    if (reel) H.ell(b, 8.5, 17.5, 2.6, 2.6, R(reel));
    H.dash(b, 19, 3, 21, 14, '#f4f4f8', 1, 0);
    H.ell(b, 21, 16, 1.6, 2, R(o && o.float || '#e83838'));
    if (o && o.twinkle) H.twinkle(b, 14, 4, '#ffffff');
    return H.done(b, '#2a2018', 'rod');
  }
  H.add('old_rod', 'key', false, (b) => rod(b, '#b8884a', null, '#7a5030'));
  H.add('good_rod', 'key', false, (b) => rod(b, '#4a7ac8', '#c8ccd8', '#3a3a44', { float: '#f4c83a' }));
  H.add('super_rod', 'key', false, (b) => rod(b, '#e8b830', '#f4f0e8', '#a83a3a', { float: '#e83838', twinkle: true }));

  // ================================================================== fishing log: a blue notebook with a fish on the cover
  H.add('fishing_log', 'key', false, (b) => {
    const Cv = R('#3a7ac0'), Pp = R('#f8f4e8');
    H.rect(b, 6, 4, 14, 17, Pp, { mode: 'cel', sh: 1, hi: 0 });
    H.rrect(b, 4, 3, 14, 18, 2, Cv, { mode: 'cel', sh: 1, hi: 1 });
    H.ell(b, 11, 12, 4, 2.4, R('#f4f8ff'), { mode: 'flat' });
    H.poly(b, [[14, 12], [17, 9], [17, 15]], R('#f4f8ff'), { mode: 'flat' });
    b.set(9, 11, P('#3a7ac0'));
    for (let y = 5; y < 20; y += 3) b.set(4, y, P('#20406a'));
    return H.done(b, '#1a3058', 'fishing_log');
  });

  // ================================================================== gold scale: a shining round scale
  H.add('gold_scale', 'held', false, (b) => {
    const Go = R('#f4c542');
    H.poly(b, [[12, 3], [19, 8], [19, 15], [12, 21], [5, 15], [5, 8]], Go, { mode: 'cel', sh: 1, hi: 1 });
    H.pline(b, [[8, 9], [12, 6], [16, 9]], Go.l2);
    H.pline(b, [[8, 13], [12, 10], [16, 13]], Go.d1);
    H.pline(b, [[9, 17], [12, 14], [15, 17]], Go.d1);
    H.twinkle(b, 18, 4, '#ffffff', true); H.twinkle(b, 6, 19, '#fff8d0');
    return H.done(b, '#6a4a10', 'gold_scale');
  });

  // ================================================================== delicate teacup: a paper-thin cup on a saucer
  H.add('delicate_teacup', 'held', false, (b) => {
    const Cp = R('#f4f0f8'), Bl = R('#7a9ae0');
    H.ell(b, 12, 18, 9, 2.6, Cp, { mode: 'flat' });
    H.rrect(b, 6, 9, 12, 9, 3, Cp, { mode: 'cyl' });
    H.ring(b, 19, 13, 3, 1.8, P(Cp.d1));
    b.ellipse(12, 9, 6, 1.4, P('#c89a6a'));
    for (let x = 7; x < 18; x += 2) b.set(x, 12, P(Bl.m));
    H.pxs(b, [[9, 5, '#ffffff'], [11, 3, '#ffffff'], [13, 5, '#f0f0f0']]);
    return H.done(b, '#3a3a5a', 'delicate_teacup');
  });

  // ================================================================== dishes
  // a fish on a plate or stick: body colour, plate/stick, garnish
  function plate(b, rim) { H.ell(b, 12, 17, 10, 4, R(rim || '#f4f0e8'), { mode: 'flat' }); }
  function cooked(b, x, y, rx, ry, col, o) {
    const C = R(col);
    H.ell(b, x, y, rx, ry, C);
    H.poly(b, [[x + rx - 1, y], [x + rx + 3, y - ry], [x + rx + 3, y + ry]], C, { mode: 'flat' });
    b.set(Math.round(x - rx + 2), Math.round(y - 1), P('#2a1a10'));
    if (o && o.grill) for (let i = -1; i <= 1; i++) H.line(b, x + i * 2 - 1, y - ry + 1, x + i * 2 + 1, y + ry - 1, C.d2);
  }
  H.add('grilled_minnow', 'healing', false, (b) => {
    H.cap(b, 3, 21, 19, 5, 0.8, R('#c8a070'), { mode: 'flat' });
    cooked(b, 10, 13, 5, 2.5, '#c89a5a', { grill: true });
    return H.done(b, '#3a2410', 'grilled_minnow');
  });
  H.add('lake_fry', 'healing', false, (b) => {
    plate(b);
    cooked(b, 9, 14, 6, 3.4, '#e8b85a');
    H.ell(b, 18, 14, 2.4, 2, R('#f4e86a'));
    return H.done(b, '#4a3010', 'lake_fry');
  });
  H.add('sardine_skewer', 'healing', false, (b) => {
    H.cap(b, 3, 21, 20, 4, 0.8, R('#c8a070'), { mode: 'flat' });
    cooked(b, 8, 15, 3.6, 1.8, '#7a8ab0', { grill: true });
    cooked(b, 13, 10, 3.6, 1.8, '#7a8ab0', { grill: true });
    return H.done(b, '#20283a', 'sardine_skewer');
  });
  H.add('trout_supper', 'healing', false, (b) => {
    plate(b, '#e8f0f8');
    cooked(b, 11, 14, 7, 3.4, '#d8a080', { grill: true });
    H.pxs(b, [[6, 11, '#5aa84a'], [8, 10, '#5aa84a'], [16, 17, '#5aa84a']]);
    return H.done(b, '#3a2418', 'trout_supper');
  });
  H.add('mackerel_onigiri', 'healing', false, (b) => {
    H.poly(b, [[12, 3], [21, 19], [3, 19]], R('#fbfaf2'), { mode: 'cel', sh: 1, hi: 1 });
    H.rect(b, 7, 14, 10, 6, R('#2a3a2a'), { mode: 'flat' });
    H.ell(b, 12, 9, 2.4, 1.6, R('#e8906a'), { mode: 'flat' });
    return H.done(b, '#2a2a20', 'mackerel_onigiri');
  });
  H.add('bass_stew', 'healing', false, (b) => {
    const Bw = R('#b8603a');
    H.ell(b, 12, 16, 9, 5, Bw);
    b.ellipse(12, 12, 8, 2.4, P('#d8a050'));
    H.pxs(b, [[8, 12, '#f4e8c0'], [12, 11, '#e86a3a'], [15, 12, '#5aa84a'], [10, 13, '#f4e8c0']]);
    H.pxs(b, [[10, 6, '#ffffff'], [13, 4, '#ffffff'], [15, 7, '#f0f0f0']]);
    return H.done(b, '#3a1a0e', 'bass_stew');
  });
  H.add('squid_skewer', 'healing', false, (b) => {
    H.cap(b, 3, 21, 18, 6, 0.8, R('#c8a070'), { mode: 'flat' });
    const Sq = R('#e8b8a0');
    H.poly(b, [[10, 4], [16, 8], [14, 15], [8, 12]], Sq, { mode: 'cel', sh: 1, hi: 1 });
    for (let i = 0; i < 3; i++) H.line(b, 9 + i * 2, 13, 7 + i * 2, 18, Sq.d1);
    return H.done(b, '#4a2418', 'squid_skewer');
  });
  H.add('bream_feast', 'healing', false, (b) => {
    plate(b, '#f8e8c0');
    cooked(b, 11, 14, 7, 4, '#e8706a');
    H.pxs(b, [[5, 18, '#f4e86a'], [18, 18, '#5aa84a'], [19, 17, '#5aa84a']]);
    return H.done(b, '#4a1a18', 'bream_feast');
  });
  H.add('river_roast', 'healing', false, (b) => {
    H.rect(b, 3, 17, 18, 3, R('#7a4a2a'), { mode: 'flat' });
    cooked(b, 11, 12, 7, 3.4, '#a8683a', { grill: true });
    H.pxs(b, [[8, 19, '#f08030'], [12, 19, '#f4c830'], [16, 19, '#f08030']]);
    return H.done(b, '#2a1608', 'river_roast');
  });
  H.add('tuna_steak', 'healing', false, (b) => {
    plate(b);
    const T = R('#d85a5a');
    H.rrect(b, 6, 9, 12, 8, 3, T, { mode: 'cel', sh: 1, hi: 1 });
    for (let x = 8; x < 17; x += 3) H.line(b, x, 10, x + 2, 15, T.d1);
    return H.done(b, '#4a1414', 'tuna_steak');
  });

  // ================================================================== real fish: one painter, many specs (src/data/fish.js icon)
  const SHAPE = {
    slim: { rx: 8, ry: 2.6 }, round: { rx: 6, ry: 5 }, bass: { rx: 7.5, ry: 4 }, cat: { rx: 8, ry: 3.4, feelers: true }, pike: { rx: 9.5, ry: 2.4, snout: true },
    sturgeon: { rx: 9.5, ry: 3, snout: true }, flat: { rx: 7, ry: 5.5 }, tuna: { rx: 8, ry: 4 }, goby: { rx: 6.5, ry: 3 }, pup: { rx: 5, ry: 3.4 },
    carp: { rx: 7.5, ry: 4.4, feelers: true }, trout: { rx: 8, ry: 3.4 }, oar: { rx: 10, ry: 2.2 }, squid: { squid: true },
  };
  function fish(b, f) {
    const s = SHAPE[f.shape] || SHAPE.slim, Bd = R(f.body), Bl = R(f.belly), Fn = R(f.fin);
    if (s.squid) {
      H.poly(b, [[12, 2], [17, 9], [16, 15], [8, 15], [7, 9]], Bd, { mode: 'cel', sh: 1, hi: 1 });
      for (let i = 0; i < 4; i++) H.line(b, 9 + i * 2, 15, 8 + i * 2 + (i & 1), 21, Fn.m);
      b.set(10, 11, P('#202028')); b.set(14, 11, P('#202028'));
      return H.done(b, '#3a2030', 'fish');
    }
    const cx = 11, cy = 12;
    H.poly(b, [[cx + s.rx - 2, cy], [cx + s.rx + 4, cy - 4], [cx + s.rx + 3, cy], [cx + s.rx + 4, cy + 4]], Fn, { mode: 'flat' });   // tail
    H.poly(b, [[cx - 2, cy - s.ry + 1], [cx + 1, cy - s.ry - 3], [cx + 4, cy - s.ry + 1]], Fn, { mode: 'flat' });                       // back fin
    H.ell(b, cx, cy, s.rx, s.ry, Bd);
    H.part(b, (x, y) => y > cy + 0.5 && ((x - cx) / s.rx) ** 2 + ((y - cy) / s.ry) ** 2 <= 0.85, Bl, { mode: 'flat' });                // belly
    if (s.snout) H.poly(b, [[cx - s.rx + 1, cy - 1], [cx - s.rx - 2, cy], [cx - s.rx + 1, cy + 1]], Bd, { mode: 'flat' });
    const m = f.mark, x0 = Math.round(cx - s.rx), x1 = Math.round(cx + s.rx);
    if (m === 'stripe') b.hline(x0 + 3, cy, x1 - x0 - 5, P(Fn.d1));
    else if (m === 'bars') for (let x = x0 + 4; x < x1 - 2; x += 3) b.vline(x, cy - Math.round(s.ry) + 1, Math.round(s.ry), P(Bd.d2));
    else if (m === 'dots' || m === 'pearls' || m === 'stars') for (let x = x0 + 4; x < x1 - 2; x += 3) b.set(x, cy - 1 + ((x >> 1) & 1), P(m === 'dots' ? Fn.d1 : '#ffffff'));
    else if (m === 'dot') b.set(cx + 2, cy - 1, P(Fn.d1));
    else if (m === 'rainbow') b.hline(x0 + 3, cy, x1 - x0 - 5, P('#e86a9a'));
    else if (m === 'waves') for (let x = x0 + 4; x < x1 - 2; x += 2) b.set(x, cy - 2 + (x & 1), P(Bd.d2));
    else if (m === 'ridge') for (let x = x0 + 4; x < x1 - 2; x += 2) b.set(x, cy - Math.round(s.ry), P('#f4f4f4'));
    else if (m === 'scales') for (let x = x0 + 3; x < x1 - 1; x += 2) for (let y = cy - 2; y <= cy + 1; y += 2) b.set(x + (y & 1), y, P(Bd.l2));
    b.set(Math.round(cx - s.rx + 2), cy - 1, P('#202028'));                                                                             // eye
    if (s.feelers) H.pline(b, [[x0 + 1, cy + 1], [x0 - 1, cy + 4], [x0 - 2, cy + 6]], Fn.d1);
    if (f.shine) { H.twinkle(b, 20, 4, '#ffffff', true); H.twinkle(b, 4, 19, '#fff8d0'); }
    return H.done(b, '#1e2028', 'fish');
  }
  // the fish table loads after the art (src/data/fish.js calls this once it is defined)
  let done = false;
  I._fishIcons = function () {
    if (done || !NP.data || !NP.data.fishIds) return;
    done = true;
    for (const id of NP.data.fishIds) {
      const d = NP.data.fish[id];
      H.add('fish_' + id, 'fish', false, (b) => fish(b, Object.assign({ shine: d.rare }, d.icon)));
    }
  };
  I._fishIcons();
})(typeof globalThis !== 'undefined' ? globalThis : window);
