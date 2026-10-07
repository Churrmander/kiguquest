/* src/art/icons/labels.js — type pills (32x12), type dots (8x8), status tags (24x12) and the
 * shared type-emblem renderer used by pins / discs.
 */
(function (root) {
  'use strict';
  const NP = (root.NP = root.NP || {});
  const { Bitmap } = NP;
  const I = NP.art.icons;
  const K = I._kit;
  const G = I._glyphs;
  const { P, tone, ink, ramp, layer, fillFn, cel, finish } = K;

  /**
   * Render a type emblem (set 'E9' or 'E6') as a shaded bitmap of its own size (no outline).
   * cols: optional { body ramp, dark, light } overrides.
   */
  function emblem(id, set, o) {
    o = o || {};
    const rs = (G[set || 'E9'] || G.E9)[id] || G.E9.fluff;
    const base = o.base || K.TYPE[id].color;
    const r = o.ramp || ramp(base);
    const b = K.fromRows(rs, { '#': r.m, o: r.m, w: r.m });
    if (o.flat) b.replaceColor(P(r.m), P(o.flat));
    else cel(b, r, { sh: 1, hi: 1 });
    K.rows(b, 0, 0, rs, { o: o.dark || r.d2, w: o.light || r.l2 });
    return b;
  }

  // ------------------------------------------------------------------ type pill 32x12
  const pillMask = (w, h, rad) => {
    const b = new Bitmap(w, h);
    const cy = (h - 1) / 2;
    fillFn(b, (x, y) => K.segDist(x, y, rad - 0.5, cy, w - rad - 0.5, cy) <= rad - 0.1 + (Math.abs(y - cy) < 4 ? 0.35 : 0), '#fff');
    return b;
  };

  function typePill(id) {
    const t = K.TYPE[id];
    const base = P(t.color);
    const lum = NP.Color.luma(base);
    const border = ink(base, lum > 150 ? 0.2 : 0.14);
    const b = pillMask(32, 12, 6);
    b.replaceColor(P('#fff'), base);
    // inner bevel: light band top, dark band bottom
    const m = K.maskOf(b);
    const ins = (x, y) => x >= 0 && y >= 0 && x < 32 && y < 12 && m[y * 32 + x];
    const hiC = tone(base, 1.2), loC = tone(base, -1);
    for (let y = 0; y < 12; y++) for (let x = 0; x < 32; x++) {
      if (!ins(x, y)) continue;
      if (!ins(x, y - 2) && ins(x, y - 1)) b.set(x, y, hiC);
      if (!ins(x, y + 2) && ins(x, y + 1)) b.set(x, y, loC);
    }
    b.outline(border, { mode: 'inner' });
    const name = t.name.toUpperCase();
    const w = G.pico.width(name);
    const x = 16 - Math.ceil(w / 2);
    G.pico.draw(b, name, x, 3, '#ffffff', { shadow: border, shadowR: border, shadowB: border });
    return finish(b, null, 16);
  }

  // ------------------------------------------------------------------ type dot 8x8
  function typeDot(id) {
    const base = K.TYPE[id].color;
    const e = emblem(id, 'E6', { ramp: ramp(base) });
    const b = layer(8, 8);
    b.blit(e, 1, 1);
    return finish(b, ink(base, 0.14), 16);
  }

  // ------------------------------------------------------------------ status tag 24x12
  const STATUS = {
    brn: { label: 'BRN', color: '#e8663a', icon: ['.#...', '.##.#', '.####', '##w##', '.###.'] },
    psn: { label: 'PSN', color: '#b25ac6', icon: ['..#..', '..#..', '.###.', '#w###', '.###.'] },
    tox: { label: 'TOX', color: '#7c3aa0', icon: ['...##', '.#.##', '###..', '#w#..', '###..'] },
    par: { label: 'PAR', color: '#e0b820', icon: ['..###', '.###.', '#####', '.###.', '###..'] },
    slp: { label: 'SLP', color: '#8c8cb4', icon: ['####.', '..#..', '.#...', '####.', '.....'] },
    frz: { label: 'FRZ', color: '#5cc0e0', icon: ['#.#.#', '.###.', '##w##', '.###.', '#.#.#'] },
    fnt: { label: 'FNT', color: '#d2474e', icon: ['.###.', '##...', '#....', '##...', '.###.'] },
  };
  function statusTag(id) {
    const s = STATUS[id];
    const base = P(s.color);
    const border = ink(base, 0.15);
    const b = new Bitmap(24, 12);
    K.roundRect(b, 0, 0, 24, 12, 3, base);
    const m = K.maskOf(b);
    const ins = (x, y) => x >= 0 && y >= 0 && x < 24 && y < 12 && m[y * 24 + x];
    const hiC = tone(base, 1.2), loC = tone(base, -1);
    for (let y = 0; y < 12; y++) for (let x = 0; x < 24; x++) {
      if (!ins(x, y)) continue;
      if (!ins(x, y - 2) && ins(x, y - 1)) b.set(x, y, hiC);
      if (!ins(x, y + 2) && ins(x, y + 1)) b.set(x, y, loC);
    }
    b.outline(border, { mode: 'inner' });
    const w = G.pico.width(s.label);
    const iw = 5, gap = 2;
    const total = iw + gap + w;
    let x = 12 - Math.ceil(total / 2);
    // icon: white with shadow
    K.rows(b, x + 1, 4, s.icon, { '#': border, w: border });
    K.rows(b, x, 3, s.icon, { '#': '#ffffff', w: tone(base, 1.6) });
    G.pico.draw(b, s.label, x + iw + gap, 3, '#ffffff', { shadow: border });
    return finish(b, null, 16);
  }

  K.emblem = emblem;
  K.STATUS = STATUS;
  K.reg.type = typePill;
  K.reg.typeDot = typeDot;
  K.reg.status = statusTag;
})(typeof globalThis !== 'undefined' ? globalThis : window);
