// Icon/FX/logo catalogue sheets for NP.art.icons -> PNGs at 1x, 3x and 4x.
//   node tools/preview-icons.mjs [outDir] [sectionFilter]
// sections: types, status, items-<group>, items-all, badges, emotes, spools, fx, fx-<name>, logo, title, title-logo, ui
import fs from 'node:fs';
import path from 'node:path';
import { loadNP, ROOT } from './load.mjs';
import { writePNG, sheet } from './png.mjs';

const CORE = ['src/core/color.js', 'src/core/rng.js', 'src/core/bitmap.js', 'src/core/font.js', 'src/core/ns.js'];
const MINE = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/art/icons/files.json'), 'utf8'));
const OUT = process.argv[2] && process.argv[2] !== '-' ? process.argv[2]
  : (process.env.PREVIEW_DIR || '/private/tmp/claude-502/-Users-christophercopus-Documents-Claude-Games-notpokemon/87c3b5f3-1384-4255-afc2-dfac4aa2b568/scratchpad/preview') + '/icons';
const FILTER = process.argv[3] || '';
const SCALES = (process.env.SCALES || '1,3,4').split(',').map(Number);

const { NP } = loadNP({ files: [...CORE, ...MINE] });
const I = NP.art.icons;
const { Bitmap, Font } = NP;
fs.mkdirSync(OUT, { recursive: true });

const want = (name) => !FILTER || name.startsWith(FILTER) || FILTER.split(',').some((f) => f && name.startsWith(f));
const written = [];
function out(name, bmp) {
  for (const s of SCALES) written.push(writePNG(path.join(OUT, `${name}_${s}x.png`), bmp, s));
}
function titled(title, body, bg = '#2b2b3a') {
  const w = Math.max(body.w, Font.width(title) + 8), h = body.h + 12;
  const b = new Bitmap(w, h).clear(bg);
  Font.draw(b, title, 4, 2, { color: '#ffe8a0' });
  b.blit(body, 0, 12);
  return b;
}
function stack(list, bg = '#2b2b3a', gap = 2) {
  const w = Math.max(...list.map((b) => b.w)), h = list.reduce((a, b) => a + b.h + gap, 0);
  const o = new Bitmap(w, h).clear(bg);
  let y = 0;
  for (const b of list) { o.blit(b, 0, y); y += b.h + gap; }
  return o;
}
const budgetWarn = [];
function checkBudget(tag, bmp, max) {
  const n = bmp.countColors();
  if (n > max) budgetWarn.push(`${tag}: ${n} colours > ${max}`);
  return n;
}

// ---------------------------------------------------------------- types + dots
if (want('types') && I.type) {
  const ids = I.TYPE_IDS;
  const pills = sheet(NP, ids.map((id) => ({ bmp: I.type(id), label: id })), { cols: 6, bg: '#2b2b3a' });
  const dots = sheet(NP, ids.map((id) => ({ bmp: I.typeDot(id), label: id })), { cols: 9 });
  // on a light UI panel as the summary screen would show them
  const panel = new Bitmap(4 + 3 * 36, 4 + 6 * 15).clear('#f8f0e0');
  ids.forEach((id, i) => {
    panel.blit(I.type(id), 4 + (i % 3) * 36, 4 + Math.floor(i / 3) * 15);
  });
  const dotsRow = new Bitmap(4 + 17 * 10, 12).clear('#f8f0e0');
  ids.forEach((id, i) => dotsRow.blit(I.typeDot(id), 4 + i * 10, 2));
  ids.forEach((id) => { checkBudget('type ' + id, I.type(id), 16); checkBudget('dot ' + id, I.typeDot(id), 16); });
  out('types', stack([titled('type pills', pills), titled('type dots', dots), titled('on UI panel', stack([panel, dotsRow], '#f8f0e0'))]));
}

// ---------------------------------------------------------------- status
if (want('status') && I.status) {
  const ids = I.STATUS_IDS;
  const s = sheet(NP, ids.map((id) => ({ bmp: I.status(id), label: id })), { cols: 7 });
  const panel = new Bitmap(4 + 7 * 28, 16).clear('#f8f0e0');
  ids.forEach((id, i) => panel.blit(I.status(id), 4 + i * 28, 2));
  ids.forEach((id) => checkBudget('status ' + id, I.status(id), 16));
  out('status', stack([titled('status tags', s), panel]));
}

// ---------------------------------------------------------------- items
if (I.items && I.items().length) {
  const groups = I.itemGroups();
  const allEntries = [];
  for (const g of Object.keys(groups)) {
    const ids = groups[g];
    ids.forEach((id) => checkBudget('item ' + id, I.item(id), 16));
    const entries = ids.map((id) => ({ bmp: I.item(id), label: id }));
    allEntries.push(...ids.map((id) => ({ bmp: I.item(id), label: '' })));
    if (want('items-' + g)) {
      const dark = sheet(NP, entries, { cols: 6 });
      const light = sheet(NP, ids.map((id) => ({ bmp: I.item(id) })), { cols: 12, bg: '#f0e8d8', pad: 3 });
      out('items-' + g, stack([titled('items: ' + g, dark), light]));
    }
  }
  if (want('items-all')) {
    out('items-all', stack([
      titled('all items (' + allEntries.length + ')', sheet(NP, allEntries, { cols: 16, pad: 2 })),
      sheet(NP, allEntries, { cols: 16, pad: 2, bg: '#f0e8d8' }),
    ]));
  }
  if (want('items-p1')) {
    const ids = I.p1Items();
    out('items-p1', titled('P1 items', sheet(NP, ids.map((id) => ({ bmp: I.item(id), label: id })), { cols: 6 })));
  }
}

// ---------------------------------------------------------------- badges
if (want('badges') && NP.art.icons.has('badge', 1)) {
  const small = sheet(NP, [0, 1, 2, 3, 4, 5, 6, 7, 8].map((n) => ({ bmp: I.badge(n), label: '#' + n })), { cols: 9 });
  const big = sheet(NP, [0, 1, 2, 3, 4, 5, 6, 7, 8].map((n) => ({ bmp: I.badge(n, true), label: '#' + n })), { cols: 9 });
  // case view: 8 buttons in two rows on a cloth panel
  const cas = new Bitmap(4 * 40 + 8, 2 * 40 + 8).clear('#8a3a4a');
  for (let n = 1; n <= 8; n++) cas.blit(I.badge(n <= 6 ? n : n, true), 8 + ((n - 1) % 4) * 40, 8 + Math.floor((n - 1) / 4) * 40);
  [0, 1, 2, 3, 4, 5, 6, 7, 8].forEach((n) => { checkBudget('badge ' + n, I.badge(n), 16); checkBudget('badge big ' + n, I.badge(n, true), 16); });
  out('badges', stack([titled('buttons 16x16', small), titled('buttons 32x32', big), titled('button case', cas)]));
}

// ---------------------------------------------------------------- emotes + spools
if (want('emotes') && I.emotes().length) {
  const ids = I.emotes();
  ids.forEach((id) => checkBudget('emote ' + id, I.emote(id), 16));
  const s = sheet(NP, ids.map((id) => ({ bmp: I.emote(id), label: id })), { cols: 8 });
  const grass = new Bitmap(8 + ids.length * 20, 24).clear('#78c050');
  ids.forEach((id, i) => grass.blit(I.emote(id), 4 + i * 20, 4));
  out('emotes', stack([titled('emotes', s), grass]));
}
if (want('spools') && I.has('spool', 'bond')) {
  const entries = [];
  for (const k of I.SPOOL_KINDS) for (let f = 0; f < 4; f++) {
    entries.push({ bmp: I.spool(k, f), label: k[0] + f });
    checkBudget('spool ' + k + f, I.spool(k, f), 16);
  }
  out('spools', titled('thrown spools (4 frames)', sheet(NP, entries, { cols: 8 })));
}

// ---------------------------------------------------------------- fx
if (I.fxNames && I.fxNames().length) {
  const names = I.fxNames();
  const strips = [];
  for (const n of names) {
    const fr = I.fxFrames(n);
    const e = [];
    for (let f = 0; f < fr; f++) { e.push({ bmp: I.fx(n, f), label: String(f) }); checkBudget('fx ' + n + f, I.fx(n, f), 16); }
    const info = I.fxInfo(n);
    const st = titled(`${n}  ${info.w}x${info.h} x${fr}`, sheet(NP, e, { cols: fr, checker: true }));
    strips.push(st);
    if (want('fx-' + n)) out('fx-' + n, st);
  }
  if (want('fx') && !FILTER.startsWith('fx-')) {
    // pack strips into columns of roughly equal height
    const cols = 3, per = Math.ceil(strips.length / cols);
    const colBmps = [];
    for (let c = 0; c < cols; c++) colBmps.push(stack(strips.slice(c * per, (c + 1) * per)));
    const w = colBmps.reduce((a, b) => a + b.w + 6, 0), h = Math.max(...colBmps.map((b) => b.h));
    const all = new Bitmap(w, h).clear('#2b2b3a');
    let x = 0;
    for (const b of colBmps) { all.blit(b, x, 0); x += b.w + 6; }
    out('fx', all);
    // type-recolour demo
    const demo = [];
    for (const n of ['ring', 'glow', 'sparkle', 'hit_normal', 'slash', 'star']) if (I.has('fx', n)) for (const t of ['ember', 'tide', 'sprout', 'volt', 'dream', 'shade']) demo.push({ bmp: I.fx(n, 1, { type: t }), label: n.slice(0, 4) + ' ' + t.slice(0, 3) });
    if (demo.length) out('fx-recolour', titled('fx recoloured by type', sheet(NP, demo, { cols: 6, checker: true })));
  }
}

// ---------------------------------------------------------------- logo + title
if (want('logo') && I.has('logo')) {
  const L = I.logo();
  checkBudget('logo', L, 48);
  out('logo', titled(`logo ${L.w}x${L.h} (${L.countColors()} colours)`, L.padded(4, 4, 4, 4)));
  const onLight = new Bitmap(L.w + 8, L.h + 8).clear('#f0e8d8');
  onLight.blit(L, 4, 4);
  out('logo-light', onLight);
}
if (want('title') && I.has('titleScene')) {
  const T = I.titleScene();
  out('title', T);
  if (I.has('logo')) {
    const c = T.clone();
    const L = I.logo();
    c.blit(L, Math.floor((240 - L.w) / 2), 14);
    // "PRESS START" like the game would print it
    Font.draw(c, 'PRESS START', 120, 132, { color: '#fff8e0', outline: '#302040', align: 'center' });
    Font.draw(c, '© 2026 TSUMUGI WORKS', 120, 148, { color: '#d8c8f0', align: 'center' });
    out('title-logo', c);
  }
}

// ---------------------------------------------------------------- zoom:<id,id,...>  (items / emotes / fx:name) at 8x
if (FILTER.startsWith('zoom:')) {
  const ids = FILTER.slice(5).split(',').filter(Boolean);
  const bm = ids.map((id) => {
    if (id.startsWith('fx:')) { const [, n, f] = id.split(':'); return I.fx(n, +f || 0); }
    if (id.startsWith('emote:')) return I.emote(id.slice(6));
    if (id.startsWith('badge:')) { const [, n, big] = id.split(':'); return I.badge(+n, big === 'big'); }
    if (id.startsWith('type:')) return I.type(id.slice(5));
    if (id.startsWith('spool:')) { const [, k, f] = id.split(':'); return I.spool(k, +f || 0); }
    return I.item(id);
  });
  const w = bm.reduce((a, b) => a + b.w + 2, 2), h = Math.max(...bm.map((b) => b.h)) + 4;
  const z = new Bitmap(w, h).clear('#6a6a80');
  let x = 2;
  for (const b of bm) { z.blit(b, x, 2); x += b.w + 2; }
  written.push(writePNG(path.join(OUT, 'zoom.png'), z, 8));
  const zl = new Bitmap(w, h).clear('#f0e8d8');
  x = 2;
  for (const b of bm) { zl.blit(b, x, 2); x += b.w + 2; }
  written.push(writePNG(path.join(OUT, 'zoom-light.png'), zl, 8));
}

console.log(`wrote ${written.length} PNGs to ${OUT}`);
if (K().stats.reduced.length) console.log('palette-reduced (fix these designs):\n  ' + K().stats.reduced.join('\n  '));
if (budgetWarn.length) console.log('BUDGET WARNINGS:\n  ' + budgetWarn.join('\n  '));
function K() { return I._kit; }
