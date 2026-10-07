// Human art preview: node tools/preview-human.mjs [ow|portrait|all] [outdir] [idfilter]
import { loadNP } from './load.mjs';
import { writePNG, sheet } from './png.mjs';
import fs from 'node:fs';
const CORE = ['src/core/color.js', 'src/core/rng.js', 'src/core/bitmap.js', 'src/core/font.js', 'src/core/ns.js'];
const mine = JSON.parse(fs.readFileSync('src/art/human/files.json', 'utf8'));
const { NP } = loadNP({ files: [...CORE, ...mine] });
const mode = process.argv[2] || 'all';
const out = process.argv[3] || '/private/tmp/claude-502/-Users-christophercopus-Documents-Claude-Games-notpokemon/87c3b5f3-1384-4255-afc2-dfac4aa2b568/scratchpad/pv';
const filt = process.argv[4] ? new RegExp(process.argv[4]) : null;
fs.mkdirSync(out, { recursive: true });
const H = NP.art.human;
const ids = H.ids().filter((i) => !filt || filt.test(i));
if (mode === 'ow' || mode === 'all') {
  const items = [];
  for (const id of ids) {
    const o = H.overworld(id);
    for (const d of ['down', 'up', 'left', 'right']) items.push({ bmp: o.frames[d][0], label: d === 'down' ? id.slice(0, 9) : '' });
  }
  writePNG(out + '/ow.png', sheet(NP, items, { cols: 12, pad: 2 }), 4, '#8fa0b8');
  // walk cycle strip for a few
  const w = [];
  for (const id of ids.slice(0, 4)) for (const d of ['down', 'left']) for (let f = 0; f < 3; f++) w.push({ bmp: H.overworld(id).frames[d][f] });
  writePNG(out + '/ow-walk.png', sheet(NP, w, { cols: 12, pad: 2 }), 4, '#8fa0b8');
}
if (mode === 'portrait' || mode === 'all') {
  const items = [];
  for (const id of ids) items.push({ bmp: H.front(id), label: id.slice(0, 12) });
  writePNG(out + '/front.png', sheet(NP, items, { cols: 6, pad: 2 }), process.env.SC ? +process.env.SC : 3, '#8fa0b8');
  const b = [];
  for (const id of ids) b.push({ bmp: H.back(id), label: id.slice(0, 12) });
  writePNG(out + '/back.png', sheet(NP, b, { cols: 6, pad: 2 }), process.env.SC ? +process.env.SC : 3, '#8fa0b8');
}
console.log('ok', ids.length);
