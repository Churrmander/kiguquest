/* NP.Font — proportional bitmap font drawn straight into an NP.Bitmap.
 *
 *   NP.Font.draw(bmp, 'Hello', x, y, { color:'#383838', shadow:'#c8c8c0' })  -> x after last glyph
 *   NP.Font.width('Hello')              -> pixel width
 *   NP.Font.wrap(text, maxWidth)        -> array of lines ('\n' forces a break)
 *
 * Glyph cell is 9 rows tall: rows 0..6 = cap height (baseline at row 6), rows 7..8 = descenders.
 * Base glyphs are the classic 5x7 set, with hand-drawn descender letters; 1px letter spacing.
 * Extra symbols: ▶ (cursor), ▼ (more-arrow), ♥ heart, ★ star, ♪ note, … ellipsis.
 */
(function (root) {
  'use strict';
  const NP = (root.NP = root.NP || {});
  const C = NP.Color;

  // ASCII 32..126, 5 columns each (2 hex digits per column, bit0 = top row)
  const RAW = [
    '0000000000', '00005F0000', '0007000700', '147F147F14', '242A7F2A12', '2313086462', '3649552250', '0005030000',
    '001C224100', '0041221C00', '082A1C2A08', '08083E0808', '0050300000', '0808080808', '0060600000', '2010080402',
    '3E5149453E', '00427F4000', '4261514946', '2141454B31', '1814127F10', '2745454539', '3C4A494930', '0171090503',
    '3649494936', '064949291E', '0036360000', '0056360000', '0008142241', '1414141414', '4122140800', '0201510906',
    '324979413E', '7E1111117E', '7F49494936', '3E41414122', '7F4141221C', '7F49494941', '7F09090101', '3E41415132',
    '7F0808087F', '00417F4100', '2040413F01', '7F08142241', '7F40404040', '7F0204027F', '7F0408107F', '3E4141413E',
    '7F09090906', '3E4151215E', '7F09192946', '4649494931', '01017F0101', '3F4040403F', '1F2040201F', '7F2018207F',
    '6314081463', '0304780403', '6151494543', '007F414100', '0204081020', '0041417F00', '0402010204', '4040404040',
    '0001020400', '2054545478', '7F48444438', '3844444420', '384444487F', '3854545418', '087E090102', '081454543C',
    '7F08040478', '00447D4000', '2040443D00', '007F102844', '00417F4000', '7C04180478', '7C08040478', '3844444438',
    '7C14141408', '081414187C', '7C08040408', '4854545420', '043F444020', '3C4040207C', '1C2040201C', '3C4030403C',
    '4428102844', '0C5050503C', '4464544C44', '0008364100', '00007F0000', '0041360800', '0201020402',
  ];

  // Hand-drawn overrides as ASCII rows (row 0 = top). '#' = ink.
  const ROWS = {
    g: ['', '', '.###.', '#...#', '#...#', '.####', '....#', '#...#', '.###.'],
    j: ['...#.', '', '...#.', '...#.', '...#.', '...#.', '...#.', '#..#.', '.##..'],
    p: ['', '', '####.', '#...#', '#...#', '#...#', '####.', '#....', '#....'],
    q: ['', '', '.####', '#...#', '#...#', '#...#', '.####', '....#', '....#'],
    y: ['', '', '#...#', '#...#', '#...#', '.####', '....#', '#...#', '.###.'],
    ',': ['', '', '', '', '', '', '.#', '.#', '#.'],
    ';': ['', '', '', '.#', '', '', '.#', '.#', '#.'],
    ':': ['', '', '##', '##', '', '', '##', '##'],
    '.': ['', '', '', '', '', '', '##', '##'],
    "'": ['.#', '.#', '#.'],
    '"': ['#.#', '#.#'],
    '!': ['#', '#', '#', '#', '#', '', '#'],
    '▶': ['#', '##', '###', '####', '###', '##', '#'],
    '▼': ['#####', '.###.', '..#..'],
    '♥': ['.#.#.', '#####', '#####', '.###.', '..#..'],
    '★': ['..#..', '..#..', '#####', '.###.', '.#.#.'],
    '♪': ['..##', '..#.#', '..#', '..#', '##', '##'],
    '…': ['', '', '', '', '', '', '#.#.#', ],
    '×': ['', '', '#...#', '.#.#.', '..#..', '.#.#.', '#...#'],
  };

  const glyphs = Object.create(null);

  function fromRows(rows) {
    // trim leading/trailing empty columns
    let w = 0;
    for (const r of rows) w = Math.max(w, r.length);
    let x0 = w, x1 = -1;
    for (const r of rows) for (let x = 0; x < r.length; x++) if (r[x] === '#') { if (x < x0) x0 = x; if (x > x1) x1 = x; }
    if (x1 < 0) return { w: 3, px: [] };
    const px = [];
    rows.forEach((r, y) => { for (let x = x0; x <= x1; x++) if (r[x] === '#') px.push(x - x0, y); });
    return { w: x1 - x0 + 1, px };
  }

  function fromCols(hex) {
    const cols = [];
    for (let i = 0; i < 5; i++) cols.push(parseInt(hex.substr(i * 2, 2), 16));
    const rows = [];
    for (let y = 0; y < 7; y++) {
      let s = '';
      for (let x = 0; x < 5; x++) s += cols[x] & (1 << y) ? '#' : '.';
      rows.push(s);
    }
    return fromRows(rows);
  }

  RAW.forEach((hx, i) => { glyphs[String.fromCharCode(32 + i)] = fromCols(hx); });
  glyphs[' '] = { w: 3, px: [] };
  for (const k in ROWS) glyphs[k] = fromRows(ROWS[k]);
  // typographic quote aliases
  glyphs['‘'] = glyphs['’'] = glyphs["'"];
  glyphs['“'] = glyphs['”'] = glyphs['"'];
  glyphs['–'] = glyphs['—'] = glyphs['-'];

  const SPACING = 1;
  const FALLBACK = glyphs['?'];

  const Font = {
    lineHeight: 12,
    capHeight: 7,
    glyphHeight: 9,

    glyph(ch) {
      return glyphs[ch] || FALLBACK;
    },

    /** Register or replace a glyph. rows = array of ASCII rows ('#' = ink), row 0 at the top. */
    addGlyph(ch, rows) {
      glyphs[ch] = fromRows(rows);
    },

    width(str) {
      let best = 0;
      for (const line of String(str).split('\n')) {
        let w = 0;
        for (const ch of line) w += (glyphs[ch] || FALLBACK).w + SPACING;
        if (w > 0) w -= SPACING;
        if (w > best) best = w;
      }
      return best;
    },

    /**
     * Draw text. opts: { color, shadow (color; drawn +1,+1), outline (color), align:'left'|'center'|'right'
     * (relative to x), lineHeight }. Newlines supported. Returns the x after the last glyph of the last line.
     */
    draw(bmp, str, x, y, o) {
      o = o || {};
      const col = C.parse(o.color === undefined ? '#ffffff' : o.color);
      const sh = o.shadow ? C.parse(o.shadow) : 0;
      const ol = o.outline ? C.parse(o.outline) : 0;
      const lh = o.lineHeight || Font.lineHeight;
      const lines = String(str).split('\n');
      let endX = x;
      lines.forEach((line, li) => {
        let cx = x;
        if (o.align === 'center') cx = x - Math.floor(Font.width(line) / 2);
        else if (o.align === 'right') cx = x - Font.width(line);
        const cy = y + li * lh;
        // passes: outline (8 dirs), shadow, ink
        const passes = [];
        if (ol) for (let oy = -1; oy <= 1; oy++) for (let ox = -1; ox <= 1; ox++) if (ox || oy) passes.push([ox, oy, ol]);
        if (sh) passes.push([1, 1, sh]);
        passes.push([0, 0, col]);
        for (const [ox, oy, pcol] of passes) {
          let gx = cx;
          for (const ch of line) {
            const g = glyphs[ch] || FALLBACK;
            for (let i = 0; i < g.px.length; i += 2) bmp.set(gx + g.px[i] + ox, cy + g.px[i + 1] + oy, pcol);
            gx += g.w + SPACING;
          }
          if (ox === 0 && oy === 0) endX = gx - SPACING;
        }
      });
      return endX;
    },

    /** Greedy word-wrap to maxWidth pixels. Explicit '\n' starts a new line. */
    wrap(str, maxWidth) {
      const out = [];
      for (const para of String(str).split('\n')) {
        let line = '';
        for (const word of para.split(' ')) {
          const test = line ? line + ' ' + word : word;
          if (line && Font.width(test) > maxWidth) {
            out.push(line);
            line = word;
          } else line = test;
        }
        out.push(line);
      }
      return out;
    },
  };

  NP.Font = Font;
})(typeof globalThis !== 'undefined' ? globalThis : window);
