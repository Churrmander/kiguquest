// Kigu art preview.
//   node tools/preview-kigu.mjs [outDir] [id ...]          contact sheets (front / back / alt rows) + icon sheets, 6 ids per sheet
//   node tools/preview-kigu.mjs outDir --chains            one row per evolution line: fronts, backs, alts, icons (stage 1 -> 3)
//   node tools/preview-kigu.mjs outDir --overview          every front sprite on one sheet (judge silhouettes at small scale)
//   node tools/preview-kigu.mjs outDir --sleep id ...      normal vs opts.pose:'sleep'
// env SC = integer upscale (default 3).
import { loadNP } from './load.mjs';
import { writePNG, sheet } from './png.mjs';
import fs from 'node:fs';
import path from 'node:path';
const CORE = ['src/core/color.js', 'src/core/rng.js', 'src/core/bitmap.js', 'src/core/font.js', 'src/core/ns.js'];
const files = JSON.parse(fs.readFileSync('src/art/kigu/files.json', 'utf8'));
const { NP } = loadNP({ files: [...CORE, ...files] });
const args = process.argv.slice(2);
const flags = new Set(args.filter((a) => a.startsWith('--')));
const pos = args.filter((a) => !a.startsWith('--'));
const out = pos[0] || '/tmp/kigu-preview';
fs.mkdirSync(out, { recursive: true });
const K = NP.art.kigu;
const SC = +(process.env.SC || 3);
const BG = '#c9dcc4';
const ids = pos.length > 1 ? pos.slice(1) : K.ids();
const blank = (w, h) => new NP.Bitmap(w, h);

if (flags.has('--chains')) {
  const chains = [];
  for (const id of K.ids()) {
    if (K.looks[id].stage === 1 || !chains.length) chains.push([id]);
    else chains[chains.length - 1].push(id);
  }
  // pair up the single-stage legendaries on one row
  const rows = [];
  for (const c of chains) {
    if (c.length === 1 && rows.length && rows[rows.length - 1].length === 1 && K.looks[c[0]].stage === 1 && K.looks[rows[rows.length - 1][0]].stage === 1 && !K.looks[rows[rows.length - 1][0]].of) rows[rows.length - 1].push(c[0]);
    else rows.push(c);
  }
  const cell = (r, i, fn) => (r[i] ? fn(r[i]) : { bmp: blank(64, 64), label: '' });
  const up2 = (bmp) => { const b = blank(64, 64); b.blit(bmp.scaled(2), 0, 0); return b; };
  const PER = +(process.env.ROWS || 5);
  for (let p = 0, n = 0; p < rows.length; p += PER, n++) {
    const rs = rows.slice(p, p + PER);
    const A = [], B = [];
    for (const r of rs) {
      for (let i = 0; i < 3; i++) A.push(cell(r, i, (id) => ({ bmp: K.front(id), label: id })));
      for (let i = 0; i < 3; i++) A.push(cell(r, i, (id) => ({ bmp: K.back(id), label: '' })));
      for (let i = 0; i < 3; i++) B.push(cell(r, i, (id) => ({ bmp: K.front(id, { alt: true }), label: id + ' alt' })));
      for (let i = 0; i < 3; i++) B.push(cell(r, i, (id) => ({ bmp: up2(K.icon(id, 0)), label: '' })));
    }
    writePNG(path.join(out, `chains-${n}-fb.png`), sheet(NP, A, { cols: 6, bg: BG, labelColor: '#203040' }), SC);
    writePNG(path.join(out, `chains-${n}-ai.png`), sheet(NP, B, { cols: 6, bg: BG, labelColor: '#203040' }), SC);
  }
  console.log('chains', rows.length);
} else if (flags.has('--overview')) {
  const items = ids.map((id) => ({ bmp: K.front(id), label: '' }));
  writePNG(path.join(out, 'overview.png'), sheet(NP, items, { cols: 10, bg: BG, pad: 2 }), SC);
  const ic = ids.map((id) => ({ bmp: K.icon(id, 0), label: '' }));
  writePNG(path.join(out, 'overview-icons.png'), sheet(NP, ic, { cols: 10, bg: BG, pad: 2 }), SC);
  console.log('overview', ids.length);
} else if (flags.has('--sleep')) {
  const items = [];
  for (const id of ids) { items.push({ bmp: K.front(id), label: id }); items.push({ bmp: K.front(id, { pose: 'sleep' }), label: 'sleep' }); items.push({ bmp: K.icon(id, 0, { pose: 'sleep' }), label: '' }); }
  writePNG(path.join(out, 'sleep.png'), sheet(NP, items, { cols: 6, bg: BG, labelColor: '#203040' }), SC);
} else {
  const chunk = 6;
  for (let i = 0; i < ids.length; i += chunk) {
    const grp = ids.slice(i, i + chunk);
    const items = [];
    for (const id of grp) items.push({ bmp: K.front(id), label: id });
    for (const id of grp) items.push({ bmp: K.back(id), label: id + ' back' });
    for (const id of grp) items.push({ bmp: K.front(id, { alt: true }), label: id + ' alt' });
    writePNG(path.join(out, `sheet${String(i / chunk).padStart(2, '0')}.png`), sheet(NP, items, { cols: grp.length, bg: BG, labelColor: '#203040' }), SC);
    const ic = [];
    for (const id of grp) { ic.push({ bmp: K.icon(id, 0), label: id }); ic.push({ bmp: K.icon(id, 1), label: '' }); }
    for (const id of grp) { ic.push({ bmp: K.icon(id, 0, { alt: true }), label: 'alt' }); ic.push({ bmp: K.icon(id, 1, { alt: true }), label: '' }); }
    writePNG(path.join(out, `icons${String(i / chunk).padStart(2, '0')}.png`), sheet(NP, ic, { cols: grp.length * 2, bg: BG, labelColor: '#203040' }), 4);
  }
  console.log('done', ids.length);
}
