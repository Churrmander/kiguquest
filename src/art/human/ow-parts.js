/* src/art/human/ow-parts.js — hair styles, outfits, side-view extras and accessories for the 16×24 overworld renderer.
 *
 * Everything here registers into tables owned by ow.js: OW.HAIR[style] = fn(c, layer), OW.OUTFIT[type] = fn(c),
 * OW.SIDEFX[type] = fn(c) (extra garment pieces in the side view), OW.ACC[type] = fn(c, acc, phase).
 * c = per-frame context { P, S, g, dir ('down'|'up'|'left'), frame, hy, ty, tH, hipY }.
 */
(function (root) {
  'use strict';
  const NP = (root.NP = root.NP || {});
  const HUM = NP.art.human;
  const L = HUM._;
  const OW = L.ow;

  // skull horizontal extents per head row (down/up views)
  const SK = [[4, 11], [3, 12], [2, 13], [2, 13], [2, 13], [2, 13], [2, 13], [2, 13], [2, 13], [3, 12], [5, 10]];
  const CXI = 7.5;

  // -------------------------------------------------------------------------------------------------------------
  // Hair
  // -------------------------------------------------------------------------------------------------------------
  // fr: fringe rows, fringe: shape of the row below them, side: last row of the sideburns (down view),
  // nape: last hair row seen from behind/side, vol: extra px of volume, back: extra back hair, top: extra above head.
  const STY = {
    short: { fr: 2, fringe: 'jag', side: 5, nape: 6, vol: 0 },
    spiky: { fr: 2, fringe: 'spike', side: 4, nape: 5, vol: 1, top: 'spikes' },
    messy: { fr: 2, fringe: 'jag', side: 6, nape: 7, vol: 1, top: 'tuft' },
    bob: { fr: 2, fringe: 'flat', side: 9, nape: 9, vol: 1, back: 'bob' },
    long: { fr: 2, fringe: 'flat', side: 9, nape: 9, vol: 1, back: 'long' },
    ponytail: { fr: 2, fringe: 'jag', side: 6, nape: 7, vol: 0, back: 'pony' },
    pigtails: { fr: 2, fringe: 'jag', side: 6, nape: 7, vol: 0, back: 'pig' },
    bun: { fr: 2, fringe: 'jag', side: 6, nape: 7, vol: 0, top: 'bun' },
    twinbun: { fr: 2, fringe: 'flat', side: 7, nape: 8, vol: 1, top: 'twinbun' },
    fluff: { fr: 3, fringe: 'jag', side: 7, nape: 8, vol: 1, top: 'puff' },
    sidepart: { fr: 2, fringe: 'side', side: 5, nape: 6, vol: 0 },
    curly: { fr: 3, fringe: 'jag', side: 8, nape: 9, vol: 2, top: 'puff' },
    bald: { fr: 0, fringe: 'none', side: 0, nape: 0, vol: 0, bald: true },
    cropped: { fr: 1, fringe: 'flat', side: 3, nape: 4, vol: 0 },
    wavy: { fr: 2, fringe: 'flat', side: 9, nape: 10, vol: 1, back: 'wave' },
  };
  OW.STY = STY;
  for (const k of Object.keys(STY)) L.HAIRSTYLES.push(k);

  const FRINGE = {
    jag: 'HH.HH..HH.HH',
    flat: 'HHHHHHHHHHHH',
    spike: 'H.HH.HH.HH.H',
    side: 'HHHHHHH.....',
    none: '............',
  };

  function hpx(P, x, y, tone) { P.px(x, y, 'hair', tone === undefined ? 2 : tone); }

  function hairTop(P, st, hy, y0) {
    // extras above the skull (rows hy-1.. hy-2)
    const t = st.top;
    if (!t) return;
    if (t === 'tuft') { hpx(P, 6, hy - 1, 2); hpx(P, 7, hy - 1, 3); hpx(P, 8, hy - 1, 2); hpx(P, 9, hy - 1, 2); }
    if (t === 'spikes') { for (const x of [4, 7, 10]) { hpx(P, x, hy - 1, 3); hpx(P, x + 1, hy - 1, 2); } hpx(P, 7, hy - 2, 3); hpx(P, 8, hy - 2, 2); }
    if (t === 'puff') { for (let x = 4; x <= 11; x++) hpx(P, x, hy - 1, x < 8 ? 3 : 2); for (let x = 6; x <= 9; x++) hpx(P, x, hy - 2, 3); }
    if (t === 'bun') { for (let x = 6; x <= 9; x++) { hpx(P, x, hy - 1, x < 8 ? 3 : 2); } for (let x = 7; x <= 8; x++) hpx(P, x, hy - 2, 2); }
    if (t === 'twinbun') {
      for (const bx of [3, 11]) { hpx(P, bx, hy - 1, 3); hpx(P, bx + 1, hy - 1, 2); hpx(P, bx, hy, 2); hpx(P, bx + 1, hy, 2); hpx(P, bx + 1, hy - 2, 2); hpx(P, bx, hy - 2, 3); }
    }
  }

  function hairDown(c, st, layer) {
    const { P, hy, ty, tH } = c;
    if (st.bald) return;
    if (layer === 'back') {
      P.begin('hairBack');
      const b = st.back;
      if (b === 'bob' || b === 'wave') { for (let r = 5; r <= 10; r++) { P.px(1, hy + r, 'hair', 1); P.px(14, hy + r, 'hair', 1); for (let x = 2; x <= 13; x++) P.px(x, hy + r, 'hair', r > 8 ? 0 : 1); } }
      if (b === 'long') { for (let r = 4; r <= 10 + tH - 1; r++) { const x0 = r > 10 ? 2 : 1, x1 = r > 10 ? 13 : 14; for (let x = x0; x <= x1; x++) P.px(x, hy + r, 'hair', x > 11 ? 0 : 1); } }
      if (b === 'wave') { P.px(1, hy + 11, 'hair', 1); P.px(14, hy + 11, 'hair', 1); }
      if (b === 'pony') { for (let r = 2; r <= 7; r++) { P.px(14, hy + r, 'hair', r === 7 ? 0 : 2); P.px(15, hy + r, 'hair', 1); } }
      if (b === 'pig') { for (let r = 4; r <= 10; r++) for (const x of [0, 1, 14, 15]) if (r < 9 || (x === 1 || x === 14)) P.px(x, hy + r, 'hair', x === 15 || x === 14 ? 1 : 2); }
      return;
    }
    P.begin('hair');
    hairTop(P, st, hy);
    const v = st.vol;
    for (let r = 0; r < st.fr; r++) for (let x = SK[r][0] - (r >= 1 ? v : 0); x <= SK[r][1] + (r >= 1 ? v : 0); x++) P.px(x, hy + r, 'hair', r === 0 && x < 9 ? 3 : r === st.fr - 1 && x > 8 ? 1 : 2);
    const pat = FRINGE[st.fringe];
    if (st.fringe === 'side') {
      for (let i = 0; i < 12; i++) if (pat[i] === 'H') P.px(2 + i, hy + st.fr, 'hair', 1);
      for (let i = 0; i < 6; i++) P.px(2 + i, hy + st.fr + 1, 'hair', 1);
    } else if (st.fr) for (let i = 0; i < 12; i++) if (pat[i] === 'H') P.px(2 + i, hy + st.fr, 'hair', st.fringe === 'flat' ? 1 : 2);
    // sideburns
    const s0 = st.fr + 1;
    for (let r = s0; r <= st.side; r++) {
      for (const x of [2, 3]) P.px(x - (r < st.side ? v : 0) * (x === 2 ? 1 : 0), hy + r, 'hair', 2);
      for (const x of [12, 13]) P.px(x + (r < st.side ? v : 0) * (x === 13 ? 1 : 0), hy + r, 'hair', 1);
      if (st.back === 'bob' || st.back === 'long' || st.back === 'wave') { P.px(2, hy + r, 'hair', 2); P.px(13, hy + r, 'hair', 1); }
    }
    if (st.side >= 4) { P.px(3, hy + st.side, 'hair', 1); P.px(12, hy + st.side, 'hair', 0); }
  }

  function hairUp(c, st, layer) {
    const { P, hy, ty, tH } = c;
    if (st.bald) return;
    if (layer === 'back') {
      // long hair falls over the back of the torso (drawn after body + head)
      P.begin('hairBack');
      const b = st.back;
      if (b === 'long' || b === 'wave') { for (let r = 10; r <= 10 + tH - 1 + (b === 'wave' ? 1 : 0); r++) for (let x = 3; x <= 12; x++) P.px(x, hy + r, 'hair', x < 6 ? 2 : x > 10 ? 0 : 1); }
      if (b === 'bob') for (let x = 3; x <= 12; x++) P.px(x, hy + 10, 'hair', 1);
      if (b === 'pony') { for (let r = 6; r <= 10 + 2; r++) for (const x of [7, 8]) P.px(x, hy + r, 'hair', x === 7 ? 2 : 1); P.px(7, hy + 6, 'trim', 2); P.px(8, hy + 6, 'trim', 1); }
      if (b === 'pig') { for (let r = 4; r <= 10; r++) for (const x of [0, 1, 14, 15]) if (r < 9 || (x === 1 || x === 14)) P.px(x, hy + r, 'hair', x === 15 || x === 14 ? 1 : 2); }
      return;
    }
    P.begin('hair');
    hairTop(P, st, hy);
    const v = st.vol;
    for (let r = 0; r <= Math.min(10, st.nape); r++) {
      const x0 = SK[r][0] - (r >= 1 ? v : 0), x1 = SK[r][1] + (r >= 1 ? v : 0);
      for (let x = x0; x <= x1; x++) P.px(x, hy + r, 'hair', r === 0 && x < 9 ? 3 : r >= st.nape - 1 ? 1 : x > 10 ? 1 : 2);
    }
    if (st.nape < 8) for (let x = 4; x <= 11; x += 1) if (x % 3 === 1) P.px(x, hy + st.nape + 1, 'hair', 1);
    if (st.top === 'bun') { P.px(7, hy, 'hair', 3); }
  }

  function hairLeft(c, st, layer) {
    const { P, hy, tH } = c;
    if (st.bald) return;
    const v = st.vol;
    if (layer === 'back') {
      P.begin('hairBack');
      const b = st.back;
      if (b === 'bob' || b === 'wave') for (let r = 4; r <= 10; r++) for (let x = 8; x <= 14 + (v ? 0 : -1); x++) P.px(x, hy + r, 'hair', x > 11 ? 0 : 1);
      if (b === 'long') for (let r = 4; r <= 10 + tH - 1; r++) for (let x = r > 10 ? 8 : 9; x <= (r > 10 ? 13 : 14); x++) P.px(x, hy + r, 'hair', x > 11 ? 0 : 1);
      if (b === 'pony') { for (let r = 2; r <= 8; r++) { P.px(14, hy + r, 'hair', r > 6 ? 0 : 2); P.px(15, hy + r, 'hair', 1); } P.px(13, hy + 3, 'trim', 2); }
      if (b === 'pig') { for (let r = 4; r <= 10; r++) for (const x of [12, 13, 14]) if (r < 10 || x === 13) P.px(x, hy + r, 'hair', x === 14 ? 0 : 1); }
      return;
    }
    P.begin('hair');
    hairTop(P, st, hy);
    for (let r = 0; r < st.fr; r++) for (let x = SK[r][0] - (r >= 1 ? v : 0); x <= SK[r][1] + (r >= 1 ? v : 0); x++) P.px(x, hy + r, 'hair', r === 0 && x < 9 ? 3 : x > 10 ? 1 : 2);
    const pat = FRINGE[st.fringe];
    if (st.fr) for (let i = 0; i < 6; i++) if (st.fringe === 'none' ? false : (st.fringe === 'jag' ? i % 3 !== 2 : st.fringe === 'spike' ? i % 2 === 0 : true)) P.px(2 + i, hy + st.fr, 'hair', 1);
    // hair mass at the back of the head
    for (let r = st.fr; r <= Math.min(10, st.nape); r++) for (let x = 8; x <= 13 + (r > 2 ? v : 0); x++) P.px(x, hy + r, 'hair', x > 11 ? 1 : 2);
    for (let r = st.fr; r <= Math.min(4, st.side); r++) P.px(7, hy + r, 'hair', 2);
    if (st.nape >= 7) P.px(7, hy + 7, 'hair', 1);
  }

  for (const k of Object.keys(STY)) {
    OW.HAIR[k] = (c, layer) => {
      const st = STY[c.S.hair.style] || STY.short;
      if (c.dir === 'down') hairDown(c, st, layer);
      else if (c.dir === 'up') hairUp(c, st, layer);
      else hairLeft(c, st, layer);
    };
  }

  // -------------------------------------------------------------------------------------------------------------
  // Outfits (down / up). Helpers come from ow.js through OW.H
  // -------------------------------------------------------------------------------------------------------------
  const OUT = OW.OUTFIT;
  const H = OW.H;

  function coatTails(c, mat, len, o) {
    // long garment hanging from the hips down `len` rows, slightly flared, with a centre split
    const { P, hipY } = c;
    const { x0, x1 } = H.bodyX(c);
    P.begin('coattail');
    for (let r = 0; r <= len; r++) {
      const y = hipY + r;
      if (y > 20) break;
      const fl = r > 0 ? 1 : 0;
      for (let x = x0 - fl; x <= x1 + fl; x++) P.px(x, y, mat, x >= x1 ? 1 : 2);
      if (c.dir === 'down' && r > 0) P.px(8, y, mat, 1);
    }
    const last = Math.min(hipY + len, 20);
    for (let x = x0 - 1; x <= x1 + 1; x++) P.px(x, last, mat, 1);
    if (o && o.trimHem) for (let x = x0 - 1; x <= x1 + 1; x++) P.px(x, last, 'trim', 2);
  }

  OUT.hoodie = (c) => {
    H.bottomFront(c);
    H.frontTorso(c, { body: 'top', sleeve: 'top' });
    const { P, hy, ty } = c;
    P.begin('hood');
    if (c.dir === 'up') { for (let x = 4; x <= 11; x++) P.px(x, ty, 'top', 1); P.rect(5, ty - 1, 6, 1, 'top', 1); }
    else { P.rect(4, ty, 2, 1, 'top', 1); P.rect(10, ty, 2, 1, 'top', 1); P.px(5, ty - 1, 'top', 1); P.px(10, ty - 1, 'top', 1); P.px(7, ty, 'skin', 1); P.px(8, ty, 'skin', 1);
      P.px(6, ty + 1, 'trim', 2); P.px(9, ty + 1, 'trim', 2); P.px(6, ty + 2, 'trim', 1); P.px(9, ty + 2, 'trim', 1); }
    if (c.dir === 'down') { P.begin('pocket'); P.rect(6, ty + c.tH - 2, 4, 1, 'top', 1); }
  };

  OUT.vest = (c) => {
    H.bottomFront(c);
    const { x0, x1 } = H.frontTorso(c, { body: 'under', sleeve: 'under' });
    const { P, ty, tH } = c;
    P.begin('vest');
    P.rect(x0, ty, 3, tH, 'top', 2);
    P.rect(x1 - 2, ty, 3, tH, 'top', 1);
    if (c.dir === 'down') { P.px(7, ty, 'skin', 1); P.px(8, ty, 'skin', 1); P.px(8, ty + 2, 'trim', 2); P.px(8, ty + 4 <= ty + tH - 1 ? ty + 4 : ty + 3, 'trim', 2); }
    else P.rect(x0 + 3, ty, x1 - x0 - 5, tH, 'top', 2);
  };

  OUT.dress = (c) => {
    H.bottomFront(c);
    H.frontTorso(c, { body: 'top', sleeve: 'top', sleeveRows: 2 });
    H.skirtFront(c, 'top', 3);
    const { P, ty } = c;
    if (c.dir === 'down') { P.begin('collar'); P.px(7, ty, 'trim', 2); P.px(8, ty, 'trim', 2); P.px(7, ty + 1, 'trim', 1); P.px(8, ty + 1, 'trim', 1); }
    P.begin('waist'); P.rect(H.bodyX(c).x0, ty + c.tH - 1, H.bodyX(c).x1 - H.bodyX(c).x0 + 1, 1, 'trim', 2);
  };

  OUT.apron = (c) => {
    H.bottomFront(c);
    const { x0, x1 } = H.frontTorso(c, { body: 'under', sleeve: 'under', sleeveRows: 3 });
    const { P, ty, tH, hipY } = c;
    P.begin('apron');
    if (c.dir === 'down') {
      P.rect(x0 + 1, ty + 1, x1 - x0 - 1, tH, 'top', 2);
      P.rect(x1 - 1, ty + 1, 1, tH, 'top', 1);
      P.px(x0 + 1, ty, 'top', 2); P.px(x1 - 1, ty, 'top', 1);
      // skirt of apron over the hips/upper legs
      for (let r = 0; r <= 2; r++) if (hipY + r <= 20) for (let x = x0; x <= x1; x++) P.px(x, hipY + r, 'top', x === x1 ? 1 : 2);
      P.px(x0 + 2, ty + tH - 1, 'trim', 1); P.px(x1 - 2, ty + tH - 1, 'trim', 1); // pockets
    } else {
      P.rect(x0, ty + 1, x1 - x0 + 1, 1, 'top', 2); // tie
      P.px(8, ty + 1, 'top', 1); P.px(7, ty + 2, 'top', 1); P.px(8, ty + 2, 'top', 2);
    }
  };

  OUT.labcoat = (c) => {
    H.bottomFront(c);
    const { x0, x1 } = H.frontTorso(c, { body: 'top', sleeve: 'top' });
    const { P, ty, tH } = c;
    coatTails(c, 'top', 5);
    P.begin('lapel');
    if (c.dir === 'down') {
      P.rect(7, ty, 2, tH + 1, 'under', 2);
      P.px(6, ty, 'top', 3); P.px(9, ty, 'top', 1);
      P.vline(6, ty + 1, 1, 'top', 1);
      for (let r = 1; r < 6; r++) if (ty + tH + r <= 20) P.px(8, ty + tH + r, 'top', 1);
    }
  };

  OUT.uniform = (c) => {
    H.bottomFront(c);
    const { x0, x1 } = H.frontTorso(c, { body: 'top', sleeve: 'top' });
    const { P, ty, tH } = c;
    P.begin('collar');
    if (c.dir === 'down') {
      P.rect(5, ty, 6, 1, 'trim', 2); P.px(7, ty, 'skin', 1); P.px(8, ty, 'skin', 1);
      P.px(6, ty + 1, 'trim', 1); P.px(9, ty + 1, 'trim', 1);
      P.px(8, ty + 2, 'trim', 2); P.px(8, ty + 4, 'trim', 2);
      P.rect(x0, ty + tH - 1, x1 - x0 + 1, 1, 'trim', 1);
    } else { P.rect(4, ty, 8, 1, 'trim', 2); P.rect(x0, ty + tH - 1, x1 - x0 + 1, 1, 'trim', 1); }
    P.begin('cuffs'); P.px(x0 - 3, ty + 2, 'trim', 2); P.px(x0 - 2, ty + 2, 'trim', 2); P.px(x1 + 2, ty + 2, 'trim', 1); P.px(x1 + 3, ty + 2, 'trim', 1);
  };

  OUT.cardigan = (c) => {
    H.bottomFront(c);
    const { x0, x1 } = H.frontTorso(c, { body: 'under', sleeve: 'top' });
    const { P, ty, tH } = c;
    P.begin('cardi');
    if (c.dir === 'down') {
      P.rect(x0, ty, 2, tH, 'top', 2); P.rect(x1 - 1, ty, 2, tH, 'top', 1);
      P.px(7, ty, 'skin', 1); P.px(8, ty, 'skin', 1);
      P.px(x0 + 1, ty + 2, 'trim', 2); P.px(x1 - 1, ty + 2, 'trim', 1);
    } else P.rect(x0, ty, x1 - x0 + 1, tH, 'top', 2);
  };

  OUT.coat = (c) => {
    H.bottomFront(c);
    H.frontTorso(c, { body: 'top', sleeve: 'top' });
    coatTails(c, 'top', 4, { trimHem: true });
    const { P, ty, tH } = c;
    P.begin('coatdet');
    if (c.dir === 'down') {
      P.rect(6, ty, 4, 1, 'trim', 2); P.px(7, ty, 'skin', 1); P.px(8, ty, 'skin', 1);
      for (const y of [ty + 2, ty + 4]) P.px(8, y, 'trim', 1);
    } else P.rect(5, ty, 6, 1, 'trim', 2);
  };

  OUT.overalls = (c) => {
    H.bottomFront(c);
    const { x0, x1 } = H.frontTorso(c, { body: 'under', sleeve: 'under' });
    const { P, ty, tH } = c;
    P.begin('bib');
    if (c.dir === 'down') {
      P.rect(6, ty + 1, 4, tH - 1, 'bot', 2); P.px(9, ty + 1, 'bot', 1);
      P.px(5, ty, 'bot', 2); P.px(10, ty, 'bot', 1);
      P.px(7, ty + 2, 'trim', 2);
    } else { P.rect(x0 + 1, ty + tH - 2, x1 - x0 - 1, 2, 'bot', 2); P.px(5, ty, 'bot', 2); P.px(10, ty, 'bot', 1); }
  };

  OUT.robe = (c) => {
    H.bottomFront(c);
    H.frontTorso(c, { body: 'top', sleeve: 'top' });
    coatTails(c, 'top', 6);
    const { P, ty, tH } = c;
    P.begin('robedet');
    if (c.dir === 'down') { P.rect(7, ty, 2, tH + 2, 'trim', 2); P.px(7, ty, 'skin', 1); P.px(8, ty, 'skin', 1); }
    P.rect(H.bodyX(c).x0, ty + tH - 1, H.bodyX(c).x1 - H.bodyX(c).x0 + 1, 1, 'trim', 2);
  };

  OUT.gown = (c) => {
    OUT.dress(c);
    const { P, hipY } = c;
    H.skirtFront(c, 'top', 9);
    P.begin('gownhem');
    const { x0, x1 } = H.bodyX(c);
    for (let x = x0 - 1; x <= x1 + 1; x++) P.px(x, 20, 'trim', 2);
  };

  OUT.maid = (c) => {
    H.bottomFront(c);
    H.frontTorso(c, { body: 'top', sleeve: 'top', sleeveRows: 3 });
    H.skirtFront(c, 'top', 4);
    const { P, ty, tH, hipY } = c;
    const { x0, x1 } = H.bodyX(c);
    P.begin('maidapron');
    if (c.dir === 'down') {
      P.rect(6, ty + 1, 4, tH - 1, 'trim', 2); P.px(9, ty + 1, 'trim', 1);
      for (let r = 0; r <= 3; r++) if (hipY + r <= 20) P.rect(6 - (r > 1 ? 1 : 0), hipY + r, 4 + (r > 1 ? 2 : 0), 1, 'trim', 2);
      P.px(5, ty, 'trim', 2); P.px(10, ty, 'trim', 1);
      P.px(7, ty, 'trim', 2); P.px(8, ty, 'trim', 2);
      P.px(8, ty + 1, 'under', 2);
    } else { P.rect(x0, ty + tH - 1, x1 - x0 + 1, 1, 'trim', 2); P.px(7, ty + tH - 1, 'trim', 3); P.px(8, ty + tH, 'trim', 2); P.px(9, ty + tH, 'trim', 1); }
  };

  OUT.suit = (c) => {
    OUT.jacket(c);
    const { P, ty, tH } = c;
    if (c.dir === 'down') {
      P.begin('tie'); P.px(7, ty + 1, 'trim', 2); P.px(8, ty + 1, 'trim', 2); P.px(8, ty + 2, 'trim', 1); P.px(8, ty + 3, 'trim', 1);
      P.begin('lap'); P.px(6, ty + 1, 'top', 1); P.px(9, ty + 1, 'top', 1); P.px(6, ty + 2, 'top', 1); P.px(9, ty + 2, 'top', 1);
    }
  };

  OUT.sailor = (c) => {
    H.bottomFront(c);
    const { x0, x1 } = H.frontTorso(c, { body: 'top', sleeve: 'top', sleeveRows: 3 });
    const { P, ty, tH } = c;
    P.begin('sailorcollar');
    if (c.dir === 'down') {
      P.rect(5, ty, 6, 1, 'trim', 2); P.px(6, ty + 1, 'trim', 2); P.px(9, ty + 1, 'trim', 1); P.px(7, ty + 1, 'trim', 1); P.px(8, ty + 1, 'trim', 1); P.px(7, ty + 2, 'trim', 1);
      P.px(7, ty + 1, 'trim', 2); P.px(8, ty + 2, 'under', 2);
    } else { P.rect(4, ty, 8, 2, 'trim', 2); P.rect(5, ty + 2, 6, 1, 'trim', 1); }
    P.rect(x0 - 3, ty + 2, 2, 1, 'trim', 2); P.rect(x1 + 2, ty + 2, 2, 1, 'trim', 1);
  };

  // side-view extras (drawn after sideBody, before the head)
  const SIDEFX = (OW.SIDEFX = OW.SIDEFX || {});
  function sideSkirt(c, mat, len) {
    const { P, hipY } = c;
    P.begin('skirt');
    for (let r = 0; r <= len && hipY + r <= 20; r++) { const fl = r ? 1 : 0; for (let x = 4 - fl; x <= 10 + fl; x++) P.px(x, hipY + r, mat, x >= 9 ? 1 : 2); }
    const last = Math.min(hipY + len, 20);
    for (let x = 3; x <= 11; x++) P.px(x, last, mat, 1);
  }
  function sideCoat(c, mat, len, trimHem) {
    const { P, hipY } = c;
    P.begin('coattail');
    for (let r = 0; r <= len && hipY + r <= 20; r++) { const fl = r ? 1 : 0; for (let x = 4 - fl; x <= 10 + fl; x++) P.px(x, hipY + r, mat, x >= 9 ? 1 : 2); }
    const last = Math.min(hipY + len, 20);
    for (let x = 3; x <= 11; x++) P.px(x, last, trimHem ? 'trim' : mat, trimHem ? 2 : 1);
  }
  SIDEFX.dress = (c) => sideSkirt(c, 'top', 3);
  SIDEFX.gown = (c) => sideSkirt(c, 'top', 9);
  SIDEFX.maid = (c) => { sideSkirt(c, 'top', 4); c.P.begin('ap'); c.P.rect(4, c.hipY, 2, 5, 'trim', 2); };
  SIDEFX.apron = (c) => { c.P.begin('ap'); c.P.rect(4, c.ty + 1, 2, c.tH + 2, 'top', 2); };
  SIDEFX.labcoat = (c) => sideCoat(c, 'top', 5);
  SIDEFX.coat = (c) => sideCoat(c, 'top', 4, true);
  SIDEFX.robe = (c) => sideCoat(c, 'top', 6);
  SIDEFX.uniform = (c) => { c.P.begin('col'); c.P.rect(5, c.ty, 5, 1, 'trim', 2); c.P.rect(5, c.ty + c.tH - 1, 5, 1, 'trim', 1); };
  SIDEFX.sailor = (c) => { c.P.begin('col'); c.P.rect(5, c.ty, 5, 2, 'trim', 2); };
  SIDEFX.hoodie = (c) => { c.P.begin('hood'); c.P.rect(8, c.ty - 1, 3, 2, 'top', 1); };
  SIDEFX.vest = (c) => { c.P.begin('vest'); c.P.rect(5, c.ty, 5, c.tH, 'top', 2); c.P.rect(9, c.ty, 1, c.tH, 'top', 1); };
  SIDEFX.cardigan = (c) => { c.P.begin('cardi'); c.P.rect(5, c.ty, 5, c.tH, 'top', 2); };
  SIDEFX.overalls = (c) => { c.P.begin('bib'); c.P.rect(5, c.ty + c.tH - 2, 5, 2, 'bot', 2); c.P.px(6, c.ty, 'bot', 2); };
  SIDEFX.jacket = (c) => { c.P.begin('trim'); c.P.rect(5, c.ty + c.tH - 1, 5, 1, 'trim', 2); };
  SIDEFX.suit = SIDEFX.jacket;
  SIDEFX.skirtBottom = (c, len) => sideSkirt(c, 'bot', len);

  // -------------------------------------------------------------------------------------------------------------
  // Accessories. fn(c, acc, phase) — phase 'body' (before the head) or 'head' (after hair).
  // -------------------------------------------------------------------------------------------------------------
  const ACC = (OW.ACC = OW.ACC || {});
  const reg = (name, fn) => { ACC[name] = fn; L.ACCS.push(name); };
  const M = (c, a, dflt) => c.P.m(a.color !== undefined && a.color !== null ? a.color : dflt);
  const M2 = (c, a, dflt) => c.P.m(a.color2 !== undefined && a.color2 !== null ? a.color2 : dflt);

  reg('glasses', (c, a, ph) => {
    if (ph !== 'head' || c.dir === 'up') return;
    const { P, hy } = c;
    const m = M(c, a, '#4a3a58');
    P.begin('glasses');
    if (c.dir === 'down') {
      for (const x0 of [3, 10]) { P.hline(x0, hy + 6, 3, m, 1); P.hline(x0, hy + 9, 3, m, 1); P.px(x0, hy + 7, m, 1); P.px(x0, hy + 8, m, 1); P.px(x0 + 2, hy + 7, m, 1); P.px(x0 + 2, hy + 8, m, 1); }
      P.hline(6, hy + 7, 4, m, 1);
    } else { P.hline(2, hy + 6, 4, m, 1); P.hline(2, hy + 9, 4, m, 1); P.px(2, hy + 7, m, 1); P.px(2, hy + 8, m, 1); P.px(5, hy + 7, m, 1); P.px(5, hy + 8, m, 1); P.hline(6, hy + 7, 4, m, 1); }
  });
  ACC.roundglasses = ACC.glasses; L.ACCS.push('roundglasses');
  ACC.goggles = (c, a, ph) => {
    if (ph !== 'head') return;
    const { P, hy } = c; const m = M(c, a, '#d8a030');
    P.begin('goggles');
    if (c.dir === 'left') { P.hline(6, hy + 2, 7, m, 1); P.hline(6, hy + 3, 7, m, 2); return; }
    P.hline(2, hy + 2, 12, m, 1); P.hline(2, hy + 3, 12, m, 2);
    if (c.dir === 'down') { P.rect(4, hy + 3, 2, 1, '#9ad8f0', 3); P.rect(10, hy + 3, 2, 1, '#9ad8f0', 3); }
  };
  L.ACCS.push('goggles');

  reg('scarf', (c, a, ph) => {
    if (ph !== 'body2') return;
    const { P, ty, tH } = c; const m = M(c, a, '#4c7ee0');
    P.begin('scarf');
    if (c.dir === 'left') { P.rect(4, ty - 1, 6, 2, m, 2); P.rect(9, ty + 1, 2, 3, m, 1); return; }
    P.rect(4, ty - 1, 8, 2, m, 2); P.rect(4, ty + 1, 8, 1, m, 1);
    if (c.dir === 'down') { P.rect(9, ty + 1, 3, 4, m, 2); P.rect(11, ty + 1, 1, 4, m, 1); P.hline(9, ty + 4, 3, M2(c, a, m), 1); }
    else P.rect(9, ty + 1, 3, 3, m, 2);
  });
  reg('tape', (c, a, ph) => {
    if (ph !== 'body2') return;
    const { P, ty } = c;
    P.begin('tape');
    const y = c.dir === 'left' ? 5 : 4;
    const m = P.m('#f2d84a');
    if (c.dir === 'left') { P.rect(4, ty - 1, 6, 2, m, 2); P.rect(5, ty + 1, 2, 5, m, 2); for (const yy of [ty + 2, ty + 4]) P.px(5, yy, 0); return; }
    P.rect(4, ty - 1, 8, 2, m, 2);
    if (c.dir === 'down') { P.rect(4, ty + 1, 2, 6, m, 2); P.rect(10, ty + 1, 2, 6, m, 1); for (const yy of [ty + 2, ty + 4, ty + 6]) { P.px(4, yy, 0); P.px(10, yy, 0); } }
    for (const x of [5, 7, 9]) P.px(x, ty - 1, 0);
  });
  reg('satchel', (c, a, ph) => {
    if (ph !== 'body2') return;
    const { P, ty, tH, hipY } = c; const m = M(c, a, '#a0642e');
    P.begin('satchel');
    if (c.dir === 'down') { for (let i = 0; i < tH; i++) P.px(5 + i, ty + i, m, 1); P.rect(10, hipY - 2, 4, 3, m, 2); P.hline(10, hipY - 2, 4, m, 3); P.px(12, hipY - 1, '#f0d070', 2); }
    else if (c.dir === 'up') { for (let i = 0; i < tH; i++) P.px(5 + i, ty + i, m, 1); P.rect(3, hipY - 2, 5, 3, m, 2); P.hline(3, hipY - 2, 5, m, 3); }
    else { for (let i = 0; i < tH; i++) P.px(6 + (i >> 1), ty + i, m, 1); P.rect(8, hipY - 2, 3, 3, m, 2); P.hline(8, hipY - 2, 3, m, 3); }
  });
  reg('backpack', (c, a, ph) => {
    if (ph !== 'body2') return;
    const { P, ty, tH } = c; const m = M(c, a, '#d06a2a');
    P.begin('backpack');
    if (c.dir === 'up') { P.rect(4, ty, 8, tH, m, 2); P.rect(11, ty, 1, tH, m, 1); P.hline(4, ty, 8, m, 3); P.rect(6, ty + 2, 4, 2, m, 1); }
    else if (c.dir === 'down') { P.vline(5, ty + 1, tH - 1, m, 1); P.vline(10, ty + 1, tH - 1, m, 1); P.px(3, ty - 1 + 0, 0); }
    else { P.rect(8, ty, 4, tH, m, 2); P.rect(11, ty, 1, tH, m, 1); P.hline(8, ty, 4, m, 3); }
  });
  reg('bow', (c, a, ph) => {
    if (ph !== 'head') return;
    const { P, hy } = c; const m = M(c, a, '#f06a9c');
    P.begin('bow');
    if (c.dir === 'down') { P.rect(9, hy - 1, 3, 2, m, 2); P.px(12, hy - 1, m, 2); P.px(8, hy, m, 3); P.px(10, hy, m, 1); P.px(9, hy - 2, m, 3); P.px(11, hy - 2, m, 2); P.px(10, hy - 1, m, 1); }
    else if (c.dir === 'up') { P.rect(6, hy + 1, 4, 2, m, 2); P.px(5, hy + 1, m, 3); P.px(10, hy + 1, m, 1); P.px(7, hy + 1, m, 3); P.px(8, hy + 1, m, 1); }
    else { P.rect(10, hy, 3, 2, m, 2); P.px(9, hy - 1, m, 3); P.px(13, hy - 1, m, 2); P.px(11, hy, m, 1); }
  });
  reg('ribbon', (c, a, ph) => ACC.bow(c, a, ph));
  reg('cap', (c, a, ph) => {
    if (ph !== 'head') return;
    const { P, hy } = c; const m = M(c, a, '#d8363a');
    P.begin('cap');
    if (c.dir === 'down') { for (let r = 0; r < 3; r++) for (let x = SK[r][0] - (r ? 1 : 0); x <= SK[r][1] + (r ? 1 : 0); x++) P.px(x, hy + r - 0, m, r === 0 && x < 9 ? 3 : x > 10 ? 1 : 2); P.rect(3, hy + 3, 10, 1, m, 1); P.hline(2, hy + 3, 12, m, 1); P.px(8, hy + 1, M2(c, a, '#f6f4f0'), 3); }
    else if (c.dir === 'up') { for (let r = 0; r < 6; r++) for (let x = SK[r][0] - (r ? 1 : 0); x <= SK[r][1] + (r ? 1 : 0); x++) P.px(x, hy + r, m, r === 0 && x < 9 ? 3 : x > 10 ? 1 : 2); P.px(7, hy + 2, M2(c, a, '#f6f4f0'), 3); }
    else { for (let r = 0; r < 4; r++) for (let x = SK[r][0] - (r ? 1 : 0); x <= SK[r][1] + (r ? 1 : 0) + (r > 2 ? 0 : 0); x++) P.px(x, hy + r, m, r === 0 && x < 9 ? 3 : 2); P.hline(0, hy + 3, 8, m, 1); P.hline(1, hy + 4, 3, m, 0); }
  });
  reg('beret', (c, a, ph) => { // soft round beret, tipped to one side, with a little gold button (a:main/button)
    if (ph !== 'head') return;
    const { P, hy } = c; const m = M(c, a, '#b8302e'), g = M2(c, a, '#e8c870');
    P.begin('beret');
    const rows = c.dir === 'up' ? 4 : 3;
    for (let r = 0; r < rows; r++) for (let x = SK[r][0] - 1 + (r === 0 ? 1 : 0); x <= SK[r][1] + 1 + (r < 2 && c.dir === 'down' ? 1 : 0); x++) P.px(x, hy + r - 1, m, r === 0 && x < 9 ? 3 : x > 10 ? 1 : 2);
    if (c.dir === 'down') { P.hline(5, hy - 2, 5, m, 3); P.px(3, hy + rows - 1, m, 1); P.px(12, hy + rows - 1, m, 1); P.px(11, hy, g, 3); }
    else if (c.dir === 'up') { P.hline(5, hy - 2, 5, m, 3); P.px(10, hy, g, 2); }
    else { P.hline(4, hy - 2, 5, m, 3); P.hline(0, hy + 1, 3, m, 1); P.px(8, hy - 1, g, 3); }
  });
  reg('flatcap', (c, a, ph) => {
    if (ph !== 'head') return;
    const { P, hy } = c; const m = M(c, a, '#3e4050');
    P.begin('cap');
    const rows = c.dir === 'up' ? 4 : 3;
    for (let r = 0; r < rows; r++) for (let x = SK[r][0] - 1 + (r === 0 ? 1 : 0); x <= SK[r][1] + 1 - (r === 0 ? 1 : 0); x++) P.px(x, hy + r - (r === 0 ? 0 : 0), m, r === 0 && x < 9 ? 3 : x > 10 ? 1 : 2);
    if (c.dir === 'down') { P.hline(3, hy + rows, 10, m, 1); P.px(8, hy + 1, M2(c, a, '#e8e8f0'), 3); P.px(9, hy + 1, M2(c, a, '#e8e8f0'), 2); }
    if (c.dir === 'left') { P.hline(0, hy + 3, 6, m, 1); }
  });
  reg('hat', (c, a, ph) => { // wide-brim hat (straw/fishing)
    if (ph !== 'head') return;
    const { P, hy } = c; const m = M(c, a, '#e8c870');
    P.begin('hat');
    for (let r = 0; r < 3; r++) for (let x = 3 + (r ? 0 : 1); x <= 12 - (r ? 0 : 1); x++) P.px(x, hy + r - 1, m, r === 0 && x < 9 ? 3 : 2);
    P.hline(0, hy + 2, 16, m, 1); P.hline(1, hy + 3, 14, m, 1);
    P.hline(3, hy + 1, 10, M2(c, a, '#d8363a'), 2);
  });
  reg('headband', (c, a, ph) => {
    if (ph !== 'head') return;
    const { P, hy } = c; const m = M(c, a, '#d8363a');
    P.begin('band');
    if (c.dir === 'left') { P.hline(2, hy + 3, 12, m, 2); return; }
    P.hline(2, hy + 3, 12, m, 2); if (c.dir === 'up') P.hline(2, hy + 4, 12, m, 1);
  });
  reg('bandana', ACC.headband.bind(null)); ACC.bandana = ACC.headband;
  reg('maidcap', (c, a, ph) => {
    if (ph !== 'head') return;
    const { P, hy } = c; const m = P.m('#fbf8f2');
    P.begin('maidcap');
    if (c.dir === 'down') { P.hline(3, hy + 1, 10, m, 2); P.hline(4, hy, 8, m, 3); P.px(3, hy + 2, m, 1); P.px(12, hy + 2, m, 1); P.px(8, hy + 1, M(c, a, '#f06a9c'), 2); P.px(7, hy + 1, M(c, a, '#f06a9c'), 2); }
    else if (c.dir === 'up') { P.hline(3, hy, 10, m, 3); P.hline(3, hy + 1, 10, m, 2); P.hline(5, hy + 2, 6, m, 1); P.px(7, hy + 2, M(c, a, '#f06a9c'), 2); P.px(8, hy + 2, M(c, a, '#f06a9c'), 2); }
    else { P.hline(3, hy, 9, m, 3); P.hline(3, hy + 1, 10, m, 2); P.px(11, hy + 2, M(c, a, '#f06a9c'), 2); }
  });
  reg('belt', (c, a, ph) => {
    if (ph !== 'body2') return;
    const { P, ty, tH } = c; const m = M(c, a, '#7c4e30');
    P.begin('belt');
    const { x0, x1 } = H.bodyX(c);
    const y = ty + tH - 1;
    if (c.dir === 'left') { P.hline(5, y, 5, m, 1); P.px(6, y, '#f2cc40', 2); return; }
    P.hline(x0, y, x1 - x0 + 1, m, 1);
    if (c.dir === 'down') { P.px(7, y, '#f2cc40', 2); P.px(8, y, '#f2cc40', 2); P.px(x0 + 1, y + 1 <= 20 ? y : y, '#d8d8e8', 2); }
  });
  reg('spools', (c, a, ph) => { // pockets of thread spools
    if (ph !== 'body2' || c.dir === 'up') return;
    const { P, ty, tH } = c;
    P.begin('spools');
    const cols = ['#d8363a', '#f2cc40', '#3e6ad0'];
    if (c.dir === 'down') { for (let i = 0; i < 3; i++) { P.px(5 + i * 2, ty + tH - 2, cols[i], 2); P.px(5 + i * 2, ty + tH - 3, cols[i], 3); } }
    else { P.px(6, ty + tH - 2, cols[0], 2); P.px(7, ty + tH - 2, cols[1], 2); }
  });
  reg('brooch', (c, a, ph) => { if (ph === 'body2' && c.dir === 'down') { c.P.begin('brooch'); c.P.px(9, c.ty + 1, M(c, a, '#c8d0e8'), 3); c.P.px(9, c.ty + 2, M(c, a, '#c8d0e8'), 1); } });
  reg('badge', (c, a, ph) => { if (ph === 'body2' && c.dir === 'down') { c.P.begin('badge'); c.P.px(10, c.ty + 2, M(c, a, '#f2cc40'), 3); } });
  reg('sash', (c, a, ph) => { // diagonal sash/strap
    if (ph !== 'body2') return;
    const { P, ty, tH } = c; const m = M(c, a, '#d8363a');
    P.begin('sash');
    for (let i = 0; i < tH; i++) P.px(10 - i, ty + i, m, 2);
  });
  reg('necktie', (c, a, ph) => { if (ph === 'body2' && c.dir === 'down') { c.P.begin('tie'); const m = M(c, a, '#d8363a'); c.P.px(8, c.ty, m, 2); c.P.px(8, c.ty + 1, m, 2); c.P.px(8, c.ty + 2, m, 1); } });
  reg('earmuffs', (c, a, ph) => {
    if (ph !== 'head') return;
    const { P, hy } = c; const m = M(c, a, '#d8363a');
    P.begin('muffs');
    if (c.dir === 'left') { P.rect(6, hy + 6, 3, 3, m, 2); P.hline(3, hy, 8, m, 1); return; }
    P.rect(0, hy + 5, 2, 4, m, 2); P.rect(14, hy + 5, 2, 4, m, 1); P.hline(3, hy, 10, m, 1); P.px(2, hy + 2, m, 1); P.px(13, hy + 2, m, 1); P.vline(2, hy + 2, 3, m, 1); P.vline(13, hy + 2, 3, m, 1);
  });
  reg('pince', (c, a, ph) => { // pin-stripe marker: thin vertical lines across the main outfit
    if (ph !== 'body3' || c.dir === 'left') return;
    const { P, ty, tH } = c; const m = M(c, a, '#c8d0e8');
    P.begin('stripe');
    for (const x of [5, 7, 9, 11]) for (let r = 1; r < tH; r++) if (P.getRaw(x, ty + r) >= 0 && (P.getRaw(x, ty + r) >> 2) === P.names.top) P.px(x, ty + r, m, 2);
  });
  reg('whiskers', () => {});
  reg('flower', (c, a, ph) => { if (ph === 'head' && c.dir !== 'up') { c.P.begin('flower'); const m = M(c, a, '#f06a9c'); c.P.px(c.dir === 'left' ? 4 : 11, c.hy + 1, m, 3); c.P.px(c.dir === 'left' ? 5 : 12, c.hy + 1, m, 2); c.P.px(c.dir === 'left' ? 4 : 12, c.hy + 2, m, 1); } });
  reg('fishingrod', (c, a, ph) => { if (ph === 'body2') { const { P, ty } = c; P.begin('rod'); const x = c.dir === 'left' ? 2 : 14; for (let i = 0; i < 9; i++) P.px(x, ty + 5 - i, '#c89a64', 2); P.px(x, ty + 5, 0); } });
  reg('easel', () => {});
  reg('cane', (c, a, ph) => { if (ph === 'body2') { const { P, ty } = c; P.begin('cane'); const x = c.dir === 'left' ? 3 : 14; P.vline(x, ty + 3, 8, '#7c4e30', 2); P.px(x + 1, ty + 3, '#7c4e30', 2); P.px(x - 1, ty + 3, '#7c4e30', 3); } });
  reg('bag', (c, a, ph) => { if (ph === 'body2' && c.dir !== 'up') { const { P, hipY } = c; P.begin('bag'); const m = M(c, a, '#7c4e30'); P.rect(c.dir === 'left' ? 9 : 12, hipY - 1, 3, 3, m, 2); P.hline(c.dir === 'left' ? 9 : 12, hipY - 1, 3, m, 3); } });
})(typeof globalThis !== 'undefined' ? globalThis : window);
