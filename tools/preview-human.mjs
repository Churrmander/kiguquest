// Human art preview: node tools/preview-human.mjs [ow|walk|portrait|all] <outdir> [idRegex]
//   ow.png        every look, 4 directions (32x32 standing frames), 4x
//   ow-walk.png   3-frame walk cycles (down / up / left / right) of the first looks, 6x
//   front.png / back.png   80x80 trainer sprites, 3x
import { loadNP } from './load.mjs';
import { writePNG, sheet } from './png.mjs';
import fs from 'node:fs';
const CORE = ['src/core/color.js', 'src/core/rng.js', 'src/core/bitmap.js', 'src/core/font.js', 'src/core/ns.js'];
const mine = JSON.parse(fs.readFileSync('src/art/human/files.json', 'utf8'));
const { NP } = loadNP({ files: [...CORE, ...mine] });
const mode = process.argv[2] || 'all';
const out = process.argv[3];
if (!out) { console.error('usage: node tools/preview-human.mjs [ow|walk|portrait|all] <outdir> [idRegex]'); process.exit(1); }
const filt = process.argv[4] ? new RegExp(process.argv[4]) : null;
fs.mkdirSync(out, { recursive: true });
const H = NP.art.human;
const ids = H.ids().filter((i) => !filt || filt.test(i));
const BG = '#8fa0b8';
if (mode === 'ow' || mode === 'all') {
  const items = [];
  for (const id of ids) {
    const o = H.overworld(id);
    for (const d of ['down', 'up', 'left', 'right']) items.push({ bmp: o.frames[d][0], label: d === 'down' ? id.slice(0, 10) : '' });
  }
  writePNG(out + '/ow.png', sheet(NP, items, { cols: 12, pad: 1 }), 4, BG);
}
if (mode === 'walk' || mode === 'ow' || mode === 'all') {
  const w = [];
  for (const id of ids.slice(0, 6)) for (const d of ['down', 'up', 'left', 'right']) for (let f = 0; f < 3; f++) w.push({ bmp: H.overworld(id).frames[d][f] });
  writePNG(out + '/ow-walk.png', sheet(NP, w, { cols: 12, pad: 1 }), 5, BG);
}
if (mode === 'portrait' || mode === 'all') {
  const sc = process.env.SC ? +process.env.SC : 3;
  writePNG(out + '/front.png', sheet(NP, ids.map((id) => ({ bmp: H.front(id), label: id.slice(0, 13) })), { cols: 8, pad: 2 }), sc, BG);
  writePNG(out + '/back.png', sheet(NP, ids.map((id) => ({ bmp: H.back(id), label: id.slice(0, 13) })), { cols: 8, pad: 2 }), sc, BG);
}
console.log('ok', ids.length);
