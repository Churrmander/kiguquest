/* src/game/arcade/cards.js — arcade cosmetics shown on the Tailor Card: the card design picked at the prize counter (a patterned
 * border round the card) and the plush shelf (a second page listing every plush won at Plush Catcher). */
(function (root) {
  'use strict';
  const NP = root.NP;
  const { Bitmap } = NP;
  const AR = NP.arcade, K = AR.kit;

  /** Pattern colour at (x, y) for a design; null = leave the card's own colour. */
  const PATTERNS = {
    plain: () => null,
    gingham: (x, y) => { const a = (x >> 2) & 1, b = (y >> 2) & 1; return a && b ? '#c83850' : a || b ? '#f08898' : '#fff4f4'; },
    denim: (x, y) => ((x + y) % 3 === 0 ? '#7898d0' : (x * 7 + y * 3) % 11 === 0 ? '#5878b8' : '#4868a8'),
    patchwork: (x, y) => {
      const cols = ['#f8c040', '#a8f0c8', '#d8b0f0', '#a8c8f8', '#f8a8b8', '#f8f0d8'];
      const cx = x >> 3, cy = y >> 3, c = cols[(cx * 5 + cy * 3) % cols.length];
      return (x & 7) === 0 || (y & 7) === 0 ? ((x + y) & 1 ? '#fff8f0' : '#806060') : c;
    },
    neon: (x, y, w, h) => {
      const edge = Math.min(x, y, w - 1 - x, h - 1 - y);
      if (edge === 2) return '#f878c8';
      if (edge === 5) return '#78e8f8';
      return (x * 13 + y * 7) % 41 === 0 ? '#f8f0ff' : '#2a1848';
    },
    starry: (x, y) => {
      const h = (x * 73856093) ^ (y * 19349663);
      if ((h & 255) === 7) return '#f8d048';
      if ((h & 511) === 300) return '#ffffff';
      return '#1c2858';
    },
    gold: (x, y, w, h) => {
      // a solid gold rim (dark line outside, bright line catching the light) round a fine gold lattice
      const edge = Math.min(x, y, w - 1 - x, h - 1 - y);
      if (edge === 0) return '#8a5a10';
      if (edge === 1) return '#f8e070';
      if (edge === 2) return '#d8a830';
      return (x + y) % 6 === 0 || (x - y + 600) % 6 === 0 ? '#d8a830' : '#fff4dc';
    },
  };
  /** Each design also tints the card's body a shade, so the whole card looks different, not only its edge. */
  const TINTS = { gingham: '#fff0f0', denim: '#eaf0fa', patchwork: '#fdf6e6', neon: '#f3ecfb', starry: '#e9edf8', gold: '#fff6dc' };

  /** Fill a rectangle with a card design (used for the swatch at the prize counter and the card border). */
  AR.drawCardSwatch = function (fb, id, x, y, w, h) {
    const f = PATTERNS[id] || PATTERNS.plain;
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) { const c = f(i, j, w, h); if (c) fb.set(x + i, y + j, c); }
    fb.strokeRect(x, y, w, h, '#383848');
  };

  /** The Tailor Card frame for the chosen design: called by CardScene in place of its plain frame. Returns the inner box
   * {x, y, w, h} where the card's own text goes. */
  AR.drawCardFrame = function (fb, x, y, w, h) {
    const id = AR.st().card;
    NP.ui.frame(fb, x, y, w, h, 'light');
    if (id === 'plain' || !PATTERNS[id]) return { x, y, w, h };
    const band = 4, f = PATTERNS[id];
    const bx = x + 3, by = y + 3, bw = w - 6, bh = h - 6;
    if (TINTS[id]) fb.fillRect(bx + band, by + band, bw - band * 2, bh - band * 2, TINTS[id]);
    const bmp = K.memo('card.' + id + bw + 'x' + bh, () => {
      const b = new Bitmap(bw, bh);
      for (let j = 0; j < bh; j++) for (let i = 0; i < bw; i++) {
        if (i >= band && i < bw - band && j >= band && j < bh - band) continue;
        const c = f(i, j, bw, bh);
        if (c) b.set(i, j, c);
      }
      b.strokeRect(band - 1, band - 1, bw - band * 2 + 2, bh - band * 2 + 2, '#6f86c0');
      return b;
    });
    fb.blit(bmp, bx, by);
    return { x: x + band, y: y + band, w: w - band * 2, h: h - band * 2 };
  };

  /** All plushes won, as [{id, gold, n}], in roster order. */
  AR.plushList = function () {
    const a = AR.st(), out = [];
    for (const key of Object.keys(a.plush)) {
      const gold = /_gold$/.test(key), id = key.replace(/_gold$/, '');
      if (NP.data.species[id] && a.plush[key] > 0) out.push({ id, gold, n: a.plush[key] });
    }
    const order = Object.keys(NP.data.species);
    out.sort((p, q) => order.indexOf(p.id) - order.indexOf(q.id) || (p.gold ? 1 : 0) - (q.gold ? 1 : 0));
    return out;
  };

  /** Second page of the Tailor Card: three wooden shelves with the plushes won at Plush Catcher. */
  AR.drawPlushShelf = function (fb, x, y, w, h, frame) {
    const list = AR.plushList();
    NP.ui.text(fb, 'PLUSH SHELF', x + 12, y + 8, 'light', { color: '#d83838' });
    NP.ui.text(fb, list.reduce((n, p) => n + p.n, 0) + ' won', x + w - 12, y + 8, 'light', { color: '#707890', align: 'right', shadow: null });
    const cols = 6, sx = x + 12, sw = w - 24;
    for (let r = 0; r < 3; r++) {
      const sy = y + 24 + r * 46;
      fb.fillRect(sx, sy + 34, sw, 5, '#a86838'); fb.hline(sx, sy + 34, sw, '#d89860'); fb.hline(sx, sy + 38, sw, '#6a3818');
    }
    if (!list.length) {
      NP.ui.text(fb, 'Win plushes at Plush Catcher', x + (w >> 1), y + 70, 'light', { color: '#9098b0', align: 'center', shadow: null });
      NP.ui.text(fb, 'in the Shibuyarn arcade.', x + (w >> 1), y + 84, 'light', { color: '#9098b0', align: 'center', shadow: null });
      return;
    }
    list.slice(0, 18).forEach((p, i) => {
      const c = i % cols, r = (i / cols) | 0;
      const px = sx + 4 + c * Math.floor((sw - 8) / cols), py = y + 24 + r * 46 + 4;
      fb.blit(AR.plushBmp(p.id, p.gold), px, py);
      if (p.n > 1) NP.ui.text(fb, 'x' + p.n, px + 16, py + 36, 'light', { color: '#8a5a30', align: 'center', shadow: null });
      if (p.gold && ((frame >> 3) & 3) === 0) fb.set(px + 6, py + 6, '#ffffff');
    });
  };
})(typeof globalThis !== 'undefined' ? globalThis : window);
