// Import an AI-generated (or hand-drawn) character sheet into the game as a high-detail overworld sprite.
//   node tools/import-sprites.mjs tools/sprites/hero_m.json [previewDir]
// Spec: { id, src: "sheet.png", canvas:[20,32], figureH:30, colors:24, outlineColors:6, bg:{tol:45},
//         cells:{ down:[x,y,w,h], up:[..], left:[..], right:[..] }, walk:"synth" }
// Pipeline per cell: flood-fill the background away from the cell border -> crop -> area-average downscale (alpha threshold) -> bottom-centre
// on the canvas -> median-cut palette -> selective coloured outline -> (optional) synthesised walk frames. Writes src/art/human/hd/<id>.js.
// Needs an 8-bit non-interlaced PNG (convert other formats first). No dependencies.
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { loadNP } from './load.mjs';
import { writePNG, sheet } from './png.mjs';

// ---------------------------------------------------------------------------------------------------------------- PNG decode
function decodePNG(buf) {
  let p = 8, w = 0, h = 0, ct = 0, bd = 0; const idat = [];
  while (p < buf.length) {
    const len = buf.readUInt32BE(p), type = buf.toString('ascii', p + 4, p + 8), data = buf.subarray(p + 8, p + 8 + len);
    if (type === 'IHDR') { w = data.readUInt32BE(0); h = data.readUInt32BE(4); bd = data[8]; ct = data[9]; if (data[12]) throw new Error('interlaced PNG not supported'); }
    else if (type === 'IDAT') idat.push(data);
    p += 12 + len;
  }
  if (bd !== 8 || (ct !== 2 && ct !== 6)) throw new Error('need 8-bit RGB/RGBA PNG (got depth ' + bd + ' type ' + ct + ')');
  const bpp = ct === 6 ? 4 : 3, raw = zlib.inflateSync(Buffer.concat(idat)), stride = w * bpp, out = Buffer.alloc(w * h * 4);
  let prev = Buffer.alloc(stride);
  for (let y = 0; y < h; y++) {
    const f = raw[y * (stride + 1)], line = Buffer.from(raw.subarray(y * (stride + 1) + 1, (y + 1) * (stride + 1)));
    for (let i = 0; i < stride; i++) {
      const a = i >= bpp ? line[i - bpp] : 0, b = prev[i], c = i >= bpp ? prev[i - bpp] : 0;
      let v = line[i];
      if (f === 1) v += a; else if (f === 2) v += b; else if (f === 3) v += (a + b) >> 1;
      else if (f === 4) { const pp = a + b - c, pa = Math.abs(pp - a), pb = Math.abs(pp - b), pc = Math.abs(pp - c); v += pa <= pb && pa <= pc ? a : pb <= pc ? b : c; }
      line[i] = v & 255;
    }
    for (let x = 0; x < w; x++) { const o = (y * w + x) * 4; out[o] = line[x * bpp]; out[o + 1] = line[x * bpp + 1]; out[o + 2] = line[x * bpp + 2]; out[o + 3] = ct === 6 ? line[x * bpp + 3] : 255; }
    prev = line;
  }
  return { w, h, data: out };
}

// ---------------------------------------------------------------------------------------------------------------- helpers
const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
const hex = (c) => '#' + c.map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0')).join('');

/** cut one cell: remove the background (flood from the border), return {w,h,px:[[r,g,b]|null]} cropped to the figure */
function cutFigure(img, [cx, cy, cw, ch], tol) {
  const get = (x, y) => { const o = ((cy + y) * img.w + cx + x) * 4; return [img.data[o], img.data[o + 1], img.data[o + 2], img.data[o + 3]]; };
  const bgS = [];
  for (let x = 0; x < cw; x++) { bgS.push(get(x, 0)); bgS.push(get(x, ch - 1)); }
  for (let y = 0; y < ch; y++) { bgS.push(get(0, y)); bgS.push(get(cw - 1, y)); }
  const med = [0, 1, 2].map((k) => bgS.map((c) => c[k]).sort((a, b) => a - b)[bgS.length >> 1]);
  const isBg = (c) => c[3] < 128 || dist(c, med) < tol || (c[0] > 235 && c[1] < 30 && c[2] > 235);
  const bg = new Uint8Array(cw * ch), q = [];
  const push = (x, y) => { if (x < 0 || y < 0 || x >= cw || y >= ch || bg[y * cw + x] || !isBg(get(x, y))) return; bg[y * cw + x] = 1; q.push(x, y); };
  for (let x = 0; x < cw; x++) { push(x, 0); push(x, ch - 1); }
  for (let y = 0; y < ch; y++) { push(0, y); push(cw - 1, y); }
  while (q.length) { const y = q.pop(), x = q.pop(); push(x + 1, y); push(x - 1, y); push(x, y + 1); push(x, y - 1); }
  let x0 = cw, y0 = ch, x1 = -1, y1 = -1;
  for (let y = 0; y < ch; y++) for (let x = 0; x < cw; x++) if (!bg[y * cw + x]) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
  if (x1 < 0) throw new Error('nothing left after background removal in cell ' + cx + ',' + cy);
  const w = x1 - x0 + 1, h = y1 - y0 + 1, px = [];
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const c = get(x0 + x, y0 + y); px.push(bg[(y0 + y) * cw + x0 + x] ? null : [c[0], c[1], c[2]]); }
  return { w, h, px };
}

/** area-average downscale to (tw, th); a target pixel is opaque when >= half its source area is figure */
function downscale(f, tw, th) {
  const out = new Array(tw * th).fill(null);
  for (let ty = 0; ty < th; ty++) for (let tx = 0; tx < tw; tx++) {
    const sx0 = tx * f.w / tw, sx1 = (tx + 1) * f.w / tw, sy0 = ty * f.h / th, sy1 = (ty + 1) * f.h / th;
    let r = 0, g = 0, b = 0, n = 0, tot = 0;
    for (let sy = Math.floor(sy0); sy < Math.ceil(sy1); sy++) for (let sx = Math.floor(sx0); sx < Math.ceil(sx1); sx++) {
      const wgt = (Math.min(sx + 1, sx1) - Math.max(sx, sx0)) * (Math.min(sy + 1, sy1) - Math.max(sy, sy0));
      tot += wgt;
      const c = f.px[sy * f.w + sx];
      if (c) { r += c[0] * wgt; g += c[1] * wgt; b += c[2] * wgt; n += wgt; }
    }
    if (n / tot >= 0.5) out[ty * tw + tx] = [r / n, g / n, b / n].map((v, i, a) => { // averaging mutes colour: push saturation + contrast back up
      const gray = 0.3 * a[0] + 0.59 * a[1] + 0.11 * a[2], t = gray + (v - gray) * SAT;
      return Math.max(0, Math.min(255, (t - 110) * CON + 110));
    });
  }
  return out;
}

/** median cut: colours (array of [r,g,b]) -> k palette entries */
function medianCut(cols, k) {
  let boxes = [cols.slice()];
  while (boxes.length < k) {
    let bi = -1, best = 0;
    boxes.forEach((b, i) => { if (b.length < 2) return; const sp = [0, 1, 2].map((c) => Math.max(...b.map((v) => v[c])) - Math.min(...b.map((v) => v[c]))); const m = Math.max(...sp) * Math.sqrt(b.length); if (m > best) { best = m; bi = i; } });
    if (bi < 0) break;
    const b = boxes[bi], sp = [0, 1, 2].map((c) => Math.max(...b.map((v) => v[c])) - Math.min(...b.map((v) => v[c]))), ch = sp.indexOf(Math.max(...sp));
    b.sort((a, c) => a[ch] - c[ch]);
    const mid = b.length >> 1;
    boxes.splice(bi, 1, b.slice(0, mid), b.slice(mid));
  }
  return boxes.map((b) => [0, 1, 2].map((c) => b.reduce((s, v) => s + v[c], 0) / b.length));
}
const nearest = (pal, c) => { let bi = 0, bd = 1e9; pal.forEach((p, i) => { const d = dist(p, c); if (d < bd) { bd = d; bi = i; } }); return bi; };

// ---------------------------------------------------------------------------------------------------------------- main
const specPath = process.argv[2];
if (!specPath) { console.error('usage: node tools/import-sprites.mjs <spec.json> [previewDir]'); process.exit(1); }
const spec = JSON.parse(fs.readFileSync(specPath, 'utf8'));
const img = decodePNG(fs.readFileSync(path.resolve(path.dirname(specPath), spec.src)));
const [CW, CH] = spec.canvas, FH = spec.figureH, NC = spec.colors || 24, NO = spec.outlineColors || 6;
const tol = (spec.bg && spec.bg.tol) || 45;
const SAT = spec.saturation || 1.3, CON = spec.contrast || 1.15;

// 1) cut + scale each direction to the same scale (the front view's figure height defines it)
const cuts = {};
for (const d of ['down', 'up', 'left', 'right']) cuts[d] = cutFigure(img, spec.cells[d], tol);
const scale = FH / cuts.down.h;
const grids = {};
for (const d of Object.keys(cuts)) {
  const f = cuts[d], tw = Math.max(1, Math.round(f.w * scale)), th = Math.max(1, Math.round(f.h * scale));
  const g = downscale(f, tw, th);
  const canvas = new Array(CW * CH).fill(null), ox = Math.round((CW - tw) / 2), oy = CH - th;
  for (let y = 0; y < th; y++) for (let x = 0; x < tw; x++) { const X = x + ox, Y = y + oy; if (X >= 0 && Y >= 0 && X < CW && Y < CH) canvas[Y * CW + X] = g[y * tw + x]; }
  grids[d] = canvas;
}

// 2) one palette for the whole character, then snap
const all = []; for (const d in grids) for (const c of grids[d]) if (c) all.push(c);
const pal = medianCut(all, NC);
const idx = {};
for (const d in grids) idx[d] = grids[d].map((c) => (c ? nearest(pal, c) : -1));

// 3) selective outline: silhouette pixels take a darkened, slightly warmed version of their own colour
const dark = (c) => [c[0] * 0.38 + 8, c[1] * 0.34 + 4, c[2] * 0.42 + 12];
const edgeCols = [];
for (const d in idx) for (let y = 0; y < CH; y++) for (let x = 0; x < CW; x++) {
  if (idx[d][y * CW + x] < 0) continue;
  const open = [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => { const X = x + dx, Y = y + dy; return X < 0 || Y < 0 || X >= CW || Y >= CH || idx[d][Y * CW + X] < 0; });
  if (open) edgeCols.push(dark(pal[idx[d][y * CW + x]]));
}
const outPal = medianCut(edgeCols, NO);
const full = pal.concat(outPal);
for (const d in idx) for (let y = 0; y < CH; y++) for (let x = 0; x < CW; x++) {
  const i = idx[d][y * CW + x];
  if (i < 0) continue;
  const open = [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => { const X = x + dx, Y = y + dy; return X < 0 || Y < 0 || X >= CW || Y >= CH || idx[d][Y * CW + X] < 0; });
  if (open) idx[d][y * CW + x] = pal.length + nearest(outPal, dark(pal[i]));
}

// 4) walk frames: stand, then two stride frames (lower body shuffled: halves lifted for front/back, a 1px stride for the sides)
const LEG = Math.max(4, Math.round(CH * 0.24));
const frames = {};
for (const d in idx) {
  const base = idx[d], mk = (fn) => { const o = new Array(CW * CH).fill(-1); for (let y = 0; y < CH; y++) for (let x = 0; x < CW; x++) { const v = base[y * CW + x]; if (v < 0) continue; const [X, Y] = fn(x, y); if (X >= 0 && Y >= 0 && X < CW && Y < CH) o[Y * CW + X] = v; } return o; };
  const lower = (y) => y >= CH - LEG;
  let a, b;
  if (spec.walk === 'synth') {
    if (d === 'down' || d === 'up') { a = mk((x, y) => [x, lower(y) && x < CW / 2 ? y - 1 : y]); b = mk((x, y) => [x, lower(y) && x >= CW / 2 ? y - 1 : y]); }
    else { a = mk((x, y) => [lower(y) ? x - 1 : x, y]); b = mk((x, y) => [lower(y) ? x + 1 : x, y]); }
  } else { a = b = base; }
  frames[d] = [base, a, b];
}

// 5) write the data file
const ALPHA = '0123456789abcdefghijklmnopqrstuv';
if (full.length > ALPHA.length) throw new Error('too many colours: ' + full.length);
const rowsOf = (g) => { const rows = []; for (let y = 0; y < CH; y++) { let s = ''; for (let x = 0; x < CW; x++) { const v = g[y * CW + x]; s += v < 0 ? '.' : ALPHA[v]; } rows.push(s); } return rows; };
const dirs = Object.keys(frames).map((d) => '      ' + d + ': [\n' + frames[d].map((g) => '        ' + JSON.stringify(rowsOf(g))).join(',\n') + '\n      ]').join(',\n');
const js = `/* src/art/human/hd/${spec.id}.js — GENERATED by tools/import-sprites.mjs from ${spec.src} (${path.basename(specPath)}); do not hand-edit. */
(function (root) {
  'use strict';
  root.NP.art.human.hd.add(${JSON.stringify(spec.id)}, {
    w: ${CW}, h: ${CH},
    palette: ${JSON.stringify(full.map(hex))},
    frames: {
${dirs}
    },
  });
})(typeof globalThis !== 'undefined' ? globalThis : window);
`;
const outFile = path.join('src/art/human/hd', spec.id + '.js');
fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, js);
const mf = 'src/art/human/files.json', list = JSON.parse(fs.readFileSync(mf, 'utf8'));
if (!list.includes(outFile)) { list.push(outFile); fs.writeFileSync(mf, JSON.stringify(list)); }
console.log('wrote', outFile, '-', full.length, 'colours,', CW + 'x' + CH, 'scale', scale.toFixed(3));

// 6) optional preview sheet
if (process.argv[3]) {
  fs.mkdirSync(process.argv[3], { recursive: true });
  const CORE = ['src/core/color.js', 'src/core/rng.js', 'src/core/bitmap.js', 'src/core/font.js', 'src/core/ns.js'];
  const { NP } = loadNP({ files: [...CORE, ...JSON.parse(fs.readFileSync(mf, 'utf8'))] });
  const o = NP.art.human.overworld(spec.id), items = [];
  for (const d of ['down', 'up', 'left', 'right']) for (let f = 0; f < 3; f++) items.push({ bmp: o.frames[d][f] });
  writePNG(path.join(process.argv[3], spec.id + '_hd.png'), sheet(NP, items, { cols: 6, pad: 3 }), 6, '#6c7f56');
}
