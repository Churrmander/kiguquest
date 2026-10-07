/* src/art/icons/items-heal.js — healing foods/drinks, status cures, PP sugar (item icons, 24x24). */
(function (root) {
  'use strict';
  const NP = (root.NP = root.NP || {});
  const I = NP.art.icons;
  const K = I._kit;
  const H = I._items;
  const { P, layer, fillFn, tone } = K;
  const R = H.R;

  // ------------------------------------------------------------------ shared: corked glass bottle
  /**
   * o: { cx, y (top of cork), cork:'ramp', corkH, neckW, neckH, w (body width), h (body height), r (corner radius),
   *      glass:'ramp', liquid:'ramp', fill (0..1), round:true (flask) }
   * returns {x0,x1,top,bot} of the body.
   */
  function bottle(b, o) {
    const cx = o.cx, W = o.w, Hh = o.h;
    const glass = o.glass || R('glass');
    const bx0 = Math.round(cx - W / 2), by0 = o.y + (o.corkH || 2) + o.neckH, by1 = by0 + Hh - 1;
    const nx0 = Math.round(cx - o.neckW / 2);
    // glass silhouette: neck + body (round flask or rounded box)
    const t = layer();
    if (o.round) t.ellipse(cx - 0.5, by0 + Hh / 2 - 0.5, W / 2, Hh / 2, glass.m);
    else K.roundRect(t, bx0, by0, W, Hh, o.r === undefined ? 3 : o.r, glass.m);
    t.fillRect(nx0, o.y + (o.corkH || 2), o.neckW, o.neckH + 2, glass.m);
    // liquid inside (inset by 1px), lower part
    const mask = K.maskOf(t);
    const liq = o.liquid;
    const fillTop = by1 - Math.round((Hh - 1) * (o.fill === undefined ? 0.7 : o.fill));
    if (liq) {
      H.cyl(t, glass, { x0: bx0, x1: bx0 + W - 1 });
      for (let y = 0; y < 24; y++) for (let x = 0; x < 24; x++) {
        if (!mask[y * 24 + x] || y < fillTop) continue;
        const k = x - bx0, u = k / Math.max(1, W - 1);
        t.set(x, y, P(u < 0.22 ? liq.l1 : u > 0.72 ? liq.d1 : liq.m));
      }
      // surface line
      for (let x = 0; x < 24; x++) if (mask[fillTop * 24 + x]) t.set(x, fillTop, P(liq.l2));
      // bottom shade
      for (let x = 0; x < 24; x++) for (let y = 23; y >= 0; y--) if (mask[y * 24 + x]) { t.set(x, y, P(x - bx0 > W * 0.6 ? liq.d2 : liq.d1)); break; }
    } else H.cyl(t, glass, { x0: bx0, x1: bx0 + W - 1 });
    b.blit(t, 0, 0);
    // glass shine
    const sx = bx0 + 1 + (W > 9 ? 1 : 0);
    for (let y = by0 + 2; y < Math.min(by0 + 2 + Math.max(2, (Hh / 2) | 0), by1 - 1); y++) if (mask[y * 24 + sx]) b.set(sx, y, P('#ffffff'));
    // cork / cap
    if (o.cork) H.rrect(b, nx0 - 1, o.y, o.neckW + 2, (o.corkH || 2) + 1, 1, o.cork, { mode: 'cyl' });
    return { x0: bx0, x1: bx0 + W - 1, top: by0, bot: by1, fillTop };
  }
  H.bottle = bottle;

  /** cylinder-ish cup/mug body from an ellipse bottom: x0..x1 wide, y0..y1 tall. */
  function cupBody(b, x0, x1, y0, y1, r, o) {
    const cx = (x0 + x1) / 2, rx = (x1 - x0) / 2;
    return H.part(b, (x, y) => {
      if (x < x0 || x > x1 || y < y0) return false;
      if (y <= y1 - 2) return true;
      const k = (x - cx) / (rx + 0.3), drop = Math.sqrt(Math.max(0, 1 - k * k)) * 2.6;
      return y <= y1 - 2 + drop;
    }, r, Object.assign({ mode: 'cyl' }, o || {}));
  }

  // ================================================================== CAKES
  const CHERRY = R('red');
  function cherry(b, x, y) {
    H.ell(b, x, y, 1.9, 1.9, CHERRY);
    b.set(x - 1, y - 1, P('#ffd0d0'));
    b.set(x + 1, y - 2, P('#3c8a3c')); b.set(x + 2, y - 3, P('#3c8a3c'));
  }

  // snack cake: a pink-frosted cupcake
  H.add('snack_cake', 'healing', true, (b) => {
    const Wr = R('gold'), F = R('pink');
    H.part(b, (x, y) => y >= 14 && y <= 21 && x >= 5 + Math.floor((y - 14) * 0.28) && x <= 18 - Math.floor((y - 14) * 0.28), Wr, { mode: 'cyl' });
    for (const x of [8, 11, 14]) for (let y = 15; y <= 21; y++) if (b.isOpaque(x, y)) b.set(x, y, P(x > 11 ? Wr.d2 : Wr.d1));
    H.ell(b, 11.5, 13, 8.2, 3.3, F);
    H.ell(b, 11.5, 9.8, 6.3, 3, F);
    H.ell(b, 11.5, 7, 4.3, 2.6, F);
    H.ell(b, 11.5, 4.8, 2.3, 1.9, F);
    cherry(b, 11.5, 2.8);
    H.pxs(b, [[8, 12, '#fff3a8'], [14, 13, '#8ed8ff'], [10, 9, '#fff'], [14, 9, '#fff3a8'], [7, 14, '#8ed8ff'], [12, 6, '#fff'], [16, 12, '#fff']]);
    return H.done(b, '#6b2a48', 'snack_cake');
  });

  // fancy cake: two sponge layers, cream, strawberries
  function layerCake(b, o) {
    const x0 = o.x0, x1 = o.x1, cx = (x0 + x1) / 2, rx = (x1 - x0) / 2 + 0.4;
    const bands = o.bands; // [{y0,y1,ramp}]
    const last = bands.length - 1;
    bands.forEach((bd, i) => {
      H.part(b, (x, y) => {
        if (x < x0 || x > x1 || y < bd.y0 || y > bd.y1 + (i === last ? 2 : 0)) return false;
        if (i !== last || y <= bd.y1) return true;
        const k = (x - cx) / rx;
        return y - bd.y1 <= Math.sqrt(Math.max(0, 1 - k * k)) * 2.4;
      }, bd.ramp, { mode: 'cyl', x0, x1 });
    });
  }

  H.add('fancy_cake', 'healing', true, (b) => {
    const S = R('#d8903c'), Cr = R('cream'), F = R('pink'), St = R('red');
    layerCake(b, { x0: 3, x1: 20, bands: [{ y0: 11, y1: 13, ramp: S }, { y0: 14, y1: 15, ramp: Cr }, { y0: 16, y1: 19, ramp: S }] });
    // icing top + drips
    H.ell(b, 11.5, 11, 9, 3.6, F);
    for (const [x, len] of [[4, 2], [7, 1], [10, 3], [13, 1], [16, 2], [19, 1]]) for (let i = 0; i < len; i++) if (b.isOpaque(x, 12 + i)) b.set(x, 12 + i, P(F.m));
    for (const [x, len] of [[4, 2], [10, 3], [16, 2]]) { b.set(x, 12 + len - 1, P(F.l1)); }
    // strawberries on the rim
    for (const x of [6, 11.5, 17]) {
      H.ell(b, x, 7.6, 2.2, 2.2, St);
      b.set(x - 1, 6, P('#ffd0d0'));
      H.pxs(b, [[Math.round(x) - 1, 5, '#3c9a4c'], [Math.round(x), 5, '#3c9a4c'], [Math.round(x) + 1, 5, '#3c9a4c']]);
    }
    H.twinkle(b, 20, 4, '#ffffff');
    return H.done(b, '#5e2a2a', 'fancy_cake');
  });

  H.add('grand_cake', 'healing', true, (b) => {
    const S = R('#c8783c'), Cr = R('cream'), F = R('rose'), Bl = R('sky');
    layerCake(b, { x0: 1, x1: 22, bands: [{ y0: 14, y1: 15, ramp: Cr }, { y0: 16, y1: 19, ramp: F }] });
    H.ell(b, 11.5, 14, 11, 3.2, Cr);
    layerCake(b, { x0: 4, x1: 19, bands: [{ y0: 9, y1: 10, ramp: Cr }, { y0: 11, y1: 13, ramp: S }] });
    H.ell(b, 11.5, 9.4, 8, 2.6, F);
    layerCake(b, { x0: 7, x1: 16, bands: [{ y0: 5, y1: 6, ramp: Cr }, { y0: 7, y1: 8, ramp: Bl }] });
    H.ell(b, 11.5, 5.6, 5, 2, Cr);
    // candle + flame
    H.rect(b, 11, 1, 2, 4, R('yellow'), { mode: 'flat' });
    b.set(11, 1, P('#ffe070'));
    // pearls along the bottom tier
    for (let x = 3; x <= 20; x += 3) b.set(x, 17, P('#fff'));
    for (let x = 5; x <= 18; x += 3) b.set(x, 11, P('#fff'));
    H.twinkle(b, 21, 3, '#fff');
    return H.done(b, '#5a2444', 'grand_cake');
  });

  H.add('royal_cake', 'healing', false, (b) => {
    const G = R('gold'), Bl = R('blue'), Cr = R('cream'), Jw = R('rose');
    layerCake(b, { x0: 1, x1: 22, bands: [{ y0: 15, y1: 16, ramp: G }, { y0: 17, y1: 20, ramp: Bl }] });
    H.ell(b, 11.5, 15, 11, 3.2, Cr);
    layerCake(b, { x0: 5, x1: 18, bands: [{ y0: 10, y1: 10, ramp: G }, { y0: 11, y1: 14, ramp: Bl }] });
    H.ell(b, 11.5, 10.4, 7.6, 2.6, Cr);
    // gems on the tiers
    for (const x of [4, 8, 12, 16, 20]) H.ell(b, x - 0.5, 18.5, 1.3, 1.3, Jw, { mode: 'dome' });
    for (const x of [8, 11.5, 15]) b.set(Math.round(x), 12, P('#ffe070'));
    // crown
    const pts = [[7, 9], [7, 4], [9.5, 6.5], [11.5, 2], [13.5, 6.5], [16, 4], [16, 9]];
    H.poly(b, pts, G, { mode: 'cel' });
    b.hline(7, 8, 10, P(G.d1));
    H.pxs(b, [[11, 2, '#fff6c0'], [7, 4, '#fff6c0'], [16, 4, '#fff6c0']]);
    b.set(11, 6, P('#e0405a')); b.set(11, 5, P('#ff8aa0'));
    H.twinkle(b, 20, 3, '#fff');
    return H.done(b, '#3a2452', 'royal_cake');
  });

  // ================================================================== DRINKS
  H.add('full_tonic', 'healing', false, (b) => {
    const pk = R('#ff5fa6');
    bottle(b, { cx: 11.5, y: 2, cork: R('gold'), corkH: 2, neckW: 4, neckH: 4, w: 15, h: 13, round: true, glass: R('glass'), liquid: pk, fill: 0.72 });
    // heart label
    H.heart(b, 8, 12, '#fff3f6');
    b.set(9, 13, P('#ffc0d4'));
    H.twinkle(b, 19, 6, '#ffffff');
    H.twinkle(b, 4, 12, '#fff3a8');
    return H.done(b, '#5a1a44', 'full_tonic');
  });

  function steam(b, x, y, c) {
    H.pxs(b, [[x, y + 4], [x + 1, y + 3], [x + 1, y + 2], [x, y + 1], [x, y], [x + 1, y - 1]], c);
  }

  H.add('revive_tea', 'healing', true, (b) => {
    const Cp = R('white'), T = R('#f0a83c'), Pk = R('pink');
    // saucer
    H.ell(b, 11.5, 19.3, 9.5, 2.4, R('cream'));
    // cup body (bowl)
    cupBody(b, 4, 18, 11, 19, Cp);
    // handle
    H.ringPart(b, 19.5, 14.5, 3.4, 1.6, Cp, { mode: 'cel' });
    // rim + tea surface
    H.ell(b, 11, 11, 7.4, 2.4, Cp);
    b.ellipse(11, 11.2, 6, 1.6, P(T.m));
    b.hline(8, 11, 4, P(T.l1));
    // heart decal
    H.heart(b, 8, 14, Pk.m);
    // steam + sparkle
    steam(b, 7, 3, '#ffffff'); steam(b, 12, 2, '#ffffff');
    H.twinkle(b, 17, 5, '#ffe070');
    return H.done(b, '#4a3048', 'revive_tea');
  });

  H.add('max_revive', 'healing', false, (b) => {
    const Po = R('white'), Go = R('gold'), Pk = R('pink');
    // spout (left)
    H.poly(b, [[1, 8], [5, 11], [5, 15], [3, 13]], Po, { mode: 'cel' });
    // body
    H.ell(b, 11.5, 14.5, 7.8, 6.3, Po);
    // handle (right)
    H.ringPart(b, 19, 13, 4, 2, Po, { mode: 'cel' });
    // gold band + heart
    for (let x = 5; x <= 18; x++) { const c = x < 9 ? Go.l1 : x > 15 ? Go.d1 : Go.m; if (b.isOpaque(x, 17)) b.set(x, 17, P(c)); }
    H.heart(b, 9, 10, Pk.m);
    // lid + knob
    H.ell(b, 11.5, 8, 4.4, 1.8, Go);
    H.ell(b, 11.5, 5.6, 2, 1.8, Go);
    steam(b, 4, 2, '#ffffff');
    H.twinkle(b, 19, 4, '#ffe070', true);
    return H.done(b, '#4a2a4a', 'max_revive');
  });

  H.add('herbal_cocoa', 'healing', false, (b) => {
    const Mg = R('#e8d6b8'), Co = R('cocoa'), Lf = R('leaf');
    cupBody(b, 3, 16, 9, 20, Mg);
    H.ringPart(b, 18, 14.5, 3.6, 1.7, Mg, { mode: 'cel' });
    H.ell(b, 9.5, 9.4, 6.9, 2.2, Mg);
    b.ellipse(9.5, 9.6, 5.6, 1.5, P(Co.d1));
    b.hline(6, 9, 4, P(Co.m));
    // marshmallows
    H.ell(b, 7, 8, 2.2, 1.6, R('white')); H.ell(b, 12, 8.4, 2.4, 1.7, R('white'));
    // leaf motif on the mug
    H.poly(b, [[7, 17], [9, 13], [12, 13], [10, 17]], Lf, { mode: 'cel' });
    b.line(8, 16, 11, 13, P(Lf.d2));
    steam(b, 7, 1, '#ffffff'); steam(b, 11, 0, '#ffffff');
    return H.done(b, '#3e2a24', 'herbal_cocoa');
  });

  // ================================================================== STATUS CURES
  H.add('aloe_balm', 'status', true, (b) => {
    const Tn = R('#9fe0c8'), Lid = R('leaf');
    // tin body
    cupBody(b, 3, 20, 13, 21, Tn);
    // lid
    H.part(b, (x, y) => y >= 9 && y <= 13 && x >= 2 && x <= 21, Lid, { mode: 'cyl' });
    H.ell(b, 11.5, 9.5, 9.5, 2.6, Lid);
    // aloe leaf on the lid (3 spiky blades)
    const L = R('#b8f06c');
    H.poly(b, [[11, 9], [9, 4], [10, 8]], L, { mode: 'flat' });
    H.poly(b, [[12, 9], [14, 4], [13, 8]], L, { mode: 'flat' });
    H.poly(b, [[10, 9], [11, 2], [13, 9]], L, { mode: 'cel', hi: 1, sh: 1 });
    // gel dab on the front
    H.ell(b, 11.5, 17, 3.2, 2, R('#d8fff0'));
    b.set(10, 16, P('#fff'));
    return H.done(b, '#1c4a48', 'aloe_balm');
  });

  H.add('mint_tea', 'status', true, (b) => {
    const G = R('glass'), Tg = R('#6fd06a'), Mn = R('mint');
    // glass mug
    cupBody(b, 3, 16, 7, 20, G);
    H.ringPart(b, 18, 13.5, 3.6, 1.7, G, { mode: 'cel' });
    // tea inside
    H.part(b, (x, y) => x >= 4 && x <= 15 && y >= 10 && y <= 19 && !(y === 19 && (x < 6 || x > 13)), Tg, { mode: 'cyl' });
    b.hline(4, 10, 12, P(Tg.l2));
    // mint leaves floating on top
    H.poly(b, [[5, 10], [8, 5], [10, 6], [9, 10]], Mn, { mode: 'cel' });
    H.poly(b, [[9, 10], [12, 4], [15, 7], [12, 10]], Mn, { mode: 'cel' });
    b.line(6, 9, 9, 6, P(Mn.d2)); b.line(10, 9, 13, 6, P(Mn.d2));
    // shine
    b.vline(5, 12, 4, P('#ffffff'));
    H.twinkle(b, 20, 6, '#ffffff');
    return H.done(b, '#1e4a3a', 'mint_tea');
  });

  H.add('wake_bell', 'status', true, (b) => {
    const G = R('gold'), Rb = R('rose');
    // bell dome + flared lip
    H.part(b, (x, y) => {
      if (y < 6 || y > 17) return false;
      const t = (y - 6) / 11;
      const hw = y < 15 ? 3 + 6.2 * Math.sqrt(Math.min(1, t / 0.85)) : 9.6 + (y - 15) * 0.6;
      return Math.abs(x - 11.5) <= hw;
    }, G, { mode: 'dome', r: 9 });
    // lip band
    for (let x = 1; x <= 22; x++) if (b.isOpaque(x, 17)) b.set(x, 17, P(x > 14 ? G.d2 : G.d1));
    b.hline(2, 16, 6, P(G.l1));
    // clapper
    H.ell(b, 11.5, 19.6, 2, 1.7, G);
    // top loop + ribbon bow
    H.ringPart(b, 11.5, 4.4, 2.6, 1.3, G, { mode: 'flat' });
    H.poly(b, [[11, 6], [6, 3], [5, 8]], Rb, { mode: 'cel' });
    H.poly(b, [[12, 6], [17, 3], [18, 8]], Rb, { mode: 'cel' });
    H.ell(b, 11.5, 6, 1.6, 1.6, Rb);
    // ringing ticks
    H.pxs(b, [[1, 10], [0, 12], [22, 10], [23, 12]], '#ffe070');
    return H.done(b, '#5a3010', 'wake_bell');
  });

  H.add('thaw_pad', 'status', true, (b) => {
    const Pd = R('#f58a4a'), Fl = R('#ffd84a');
    // quilted pad
    H.rrect(b, 3, 5, 18, 16, 3, Pd, { mode: 'cel' });
    // quilting diagonals
    for (let i = -16; i < 24; i += 6) for (let t = 0; t < 18; t++) { const x = 3 + t, y = 5 + ((t + i + 100) % 18); if (b.isOpaque(x, y) && (t + i) % 6 === 0) b.set(x, y, P(Pd.d1)); }
    H.dash(b, 5, 7, 18, 7, Pd.l2, 2, 1); H.dash(b, 5, 19, 18, 19, Pd.d2, 2, 1);
    // flame badge
    H.poly(b, [[11.5, 8], [15, 13], [14, 17], [9, 17], [8, 13], [10, 11]], Fl, { mode: 'cel' });
    H.poly(b, [[11.5, 12], [13, 15], [12.5, 17], [10.5, 17], [10, 15]], R('#fff4b0'), { mode: 'flat' });
    // warm waves
    H.pxs(b, [[7, 3], [8, 2], [7, 1], [12, 3], [13, 2], [12, 1], [17, 3], [18, 2], [17, 1]], '#ffb070');
    return H.done(b, '#6a2a1a', 'thaw_pad');
  });

  H.add('numb_away', 'status', true, (b) => {
    const Bd = R('#ffd23c'), Pd = R('cream');
    // diagonal plaster
    H.cap(b, 4.5, 18.5, 18.5, 4.5, 4.4, Bd, { mode: 'cel' });
    // centre pad
    H.poly(b, [[8, 11], [12, 7], [16, 11], [12, 15]], Pd, { mode: 'cel' });
    // pad dots
    H.pxs(b, [[11, 11, Pd.d1], [13, 9, Pd.d1], [13, 12, Pd.d1], [10, 9, Pd.d1]], Pd.d1);
    // bolt on the pad
    H.pxs(b, [[13, 8], [12, 9], [12, 10], [13, 10], [12, 11], [11, 12]], '#e8901c');
    // little perforation dots on the wings
    H.pxs(b, [[5, 17], [7, 19], [17, 5], [19, 7]], Bd.d1);
    H.twinkle(b, 20, 18, '#fff3a0');
    return H.done(b, '#7a4a0a', 'numb_away');
  });

  H.add('all_cure', 'status', true, (b) => {
    const Pc = R('#fdf4f6'), Pk = R('#f25a8a');
    H.rrect(b, 2, 6, 20, 15, 4, Pc, { mode: 'cel' });
    // rainbow zipper on the top edge
    const rb = ['#f25a6a', '#f6a23a', '#f6e04a', '#58c85a', '#4a9af0', '#9a6ae0'];
    for (let i = 0; i < 18; i++) { b.set(3 + i, 8, P(rb[Math.floor(i / 3)])); }
    for (let i = 0; i < 18; i += 2) b.set(3 + i, 9, P(Pc.d1));
    // zip pull
    H.ell(b, 20, 8, 1.6, 1.6, R('gold'));
    // tab loop on top
    H.ringPart(b, 11.5, 4.6, 2.8, 1.3, R('gold'), { mode: 'flat' });
    // heart patch with cross-stitch
    H.heart(b, 8, 12, Pk.m);
    H.pxs(b, [[9, 13, Pk.l2], [10, 13, Pk.l1]], Pk.l1);
    H.dash(b, 4, 19, 19, 19, Pc.d2, 1, 1);
    return H.done(b, '#5a2a44', 'all_cure');
  });

  // ================================================================== PP SUGAR
  function cube(b, cx, cy, s, Wh, o) {
    // isometric cube: top face rhombus, left face, right face. s = half-width
    const top = [[cx, cy - s * 0.6], [cx + s, cy - s * 0.1], [cx, cy + s * 0.45], [cx - s, cy - s * 0.1]];
    const left = [[cx - s, cy - s * 0.1], [cx, cy + s * 0.45], [cx, cy + s * 1.35], [cx - s, cy + s * 0.8]];
    const right = [[cx + s, cy - s * 0.1], [cx, cy + s * 0.45], [cx, cy + s * 1.35], [cx + s, cy + s * 0.8]];
    H.poly(b, left, { m: Wh.m, d1: Wh.d1, d2: Wh.d2, l1: Wh.l1, l2: Wh.l2 }, { mode: 'flat' });
    H.poly(b, right, { m: Wh.d1, d1: Wh.d2, d2: Wh.d2, l1: Wh.d1, l2: Wh.d1 }, { mode: 'flat' });
    H.poly(b, top, { m: Wh.l2, d1: Wh.l1, d2: Wh.l1, l1: Wh.l2, l2: Wh.l2 }, { mode: 'flat' });
    // granules
    if (!o || !o.plain) {
      const g = [[-0.5, 0.2], [0.3, 0.5], [-0.2, 0.9], [-0.6, 0.7]];
      for (const [u, v] of g) b.set(Math.round(cx + u * s), Math.round(cy + v * s), P(Wh.l2));
    }
  }

  H.add('sugar_cube', 'pp', true, (b) => {
    const Wh = R('snow');
    cube(b, 11.5, 8, 8.5, Wh);
    H.dash(b, 4, 13, 10, 16, Wh.d2, 1, 1);
    H.twinkle(b, 19, 5, '#ffffff', true);
    H.twinkle(b, 4, 4, '#ffe8f0');
    return H.done(b, '#3e4a78', 'sugar_cube');
  });

  H.add('sugar_jar', 'pp', false, (b) => {
    const G = R('glass'), Lid = R('#e8a4c0'), Wh = R('snow');
    H.part(b, (x, y) => y >= 7 && y <= 21 && x >= 3 && x <= 20 && !(y > 18 && (x < 5 || x > 18)), G, { mode: 'cyl' });
    // neck + lid
    H.rrect(b, 5, 4, 14, 4, 1, Lid, { mode: 'cyl' });
    b.set(11, 2, P(Lid.d1)); H.ell(b, 11.5, 3, 2, 1.4, Lid);
    // sugar cubes inside
    const cs = [[6, 17], [10, 17], [14, 17], [8, 13], [12, 13], [16, 17], [10, 9], [14, 11]];
    for (const [x, y] of cs) { b.fillRect(x, y, 3, 3, P(Wh.l1)); b.hline(x, y + 2, 3, P(Wh.d1)); b.set(x + 2, y + 1, P(Wh.d1)); b.set(x, y, P('#fff')); }
    b.vline(4, 9, 7, P('#ffffff'));
    return H.done(b, '#3e4a78', 'sugar_jar');
  });

  H.add('sugar_box', 'pp', false, (b) => {
    const Bx = R('#f7a8c4'), Wh = R('snow');
    // cubes poking out of the open top
    cube(b, 7, 6, 4.5, Wh, { plain: true }); cube(b, 15, 6, 4.5, Wh, { plain: true }); cube(b, 11, 3.5, 4, Wh, { plain: true });
    // box body with stripes
    H.rect(b, 2, 10, 20, 11, Bx, { mode: 'cel' });
    for (let x = 4; x < 22; x += 4) b.fillRect(x, 11, 2, 9, P(Wh.m));
    for (let x = 4; x < 22; x += 4) b.vline(x + 1, 11, 9, P(Wh.d1));
    H.rect(b, 2, 9, 20, 3, R('#e8789c'), { mode: 'cel' });
    // ribbon
    H.twinkle(b, 20, 4, '#fff', true);
    return H.done(b, '#6a2a48', 'sugar_box');
  });

  H.add('sugar_feast', 'pp', false, (b) => {
    const Pl = R('gold'), Wh = R('snow');
    // cake stand
    H.ell(b, 11.5, 15, 10.5, 2.6, Pl);
    H.rect(b, 10, 16, 3, 4, Pl, { mode: 'cyl' });
    H.ell(b, 11.5, 20.5, 5, 1.4, Pl);
    // pyramid of cubes
    const rowsC = [[5, 10], [9, 10], [13, 10], [7, 6], [11, 6], [9, 2]];
    for (const [x, y] of rowsC) {
      b.fillRect(x, y + 1, 5, 4, P(Wh.m)); b.fillRect(x, y, 5, 1, P(Wh.l2)); b.vline(x + 4, y + 1, 4, P(Wh.d1)); b.hline(x, y + 4, 5, P(Wh.d1));
    }
    cherry(b, 11.5, 1.2);
    H.twinkle(b, 20, 6, '#fff3a8', true); H.twinkle(b, 3, 7, '#ffffff');
    return H.done(b, '#5a4010', 'sugar_feast');
  });

  H._cube = cube;
  H._cupBody = cupBody;
  H._cherry = cherry;
  H._steam = steam;
})(typeof globalThis !== 'undefined' ? globalThis : window);
