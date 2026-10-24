// Converts the approved AutoSprite PNGs (art/autosprite/kigu/<id>-<view>.png, 1024x1024 on white, 8px grid) into
// src/art/autosprite/data.js: one palette-indexed, run-length-encoded sprite per view, cropped to its bounding box and scaled
// to battle size (front and pose to the look's `size`, the stage height in the 96px foe cell; back to size x 4/3, never up).
// Re-run after adding or fixing a PNG. --preview DIR also writes contact sheets (old generated art next to the new sprites).
//
//   node tools/import-autosprite.mjs [--preview DIR]
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { ROOT, loadNP } from './load.mjs';
import { writePNG, sheet } from './png.mjs';

const SRC = path.join(ROOT, 'art/autosprite/kigu');
const OUT = path.join(ROOT, 'src/art/autosprite/data.js');
const GRID = 8, WHITE = 240; // a pixel is background when every channel is >= WHITE and it touches the border

/** Minimal PNG reader: 8-bit RGB / RGBA, not interlaced (what AutoSprite and snap.py write). */
function readPNG(file) {
  const buf = fs.readFileSync(file);
  let p = 8, w = 0, h = 0, ct = 0;
  const idat = [];
  while (p < buf.length) {
    const len = buf.readUInt32BE(p), type = buf.toString('ascii', p + 4, p + 8), d = buf.subarray(p + 8, p + 8 + len);
    if (type === 'IHDR') {
      w = d.readUInt32BE(0); h = d.readUInt32BE(4); ct = d[9];
      if (d[8] !== 8 || d[12] !== 0 || (ct !== 2 && ct !== 6)) throw new Error(file + ': unsupported PNG (need 8-bit RGB/RGBA, no interlace)');
    } else if (type === 'IDAT') idat.push(d);
    p += 12 + len;
  }
  const raw = zlib.inflateSync(Buffer.concat(idat)), bpp = ct === 6 ? 4 : 3, stride = w * bpp;
  const px = Buffer.alloc(w * h * bpp);
  for (let y = 0; y < h; y++) {
    const f = raw[y * (stride + 1)], row = raw.subarray(y * (stride + 1) + 1, (y + 1) * (stride + 1)), o = y * stride;
    for (let x = 0; x < stride; x++) {
      const a = x >= bpp ? px[o + x - bpp] : 0, b = y ? px[o - stride + x] : 0, c = x >= bpp && y ? px[o - stride + x - bpp] : 0;
      let v = row[x];
      if (f === 1) v += a;
      else if (f === 2) v += b;
      else if (f === 3) v += (a + b) >> 1;
      else if (f === 4) { const q = a + b - c, pa = Math.abs(q - a), pb = Math.abs(q - b), pc = Math.abs(q - c); v += pa <= pb && pa <= pc ? a : pb <= pc ? b : c; }
      px[o + x] = v & 255;
    }
  }
  return { w, h, px, bpp };
}

/** Sample the centre of every grid cell, drop the white background (flood fill from the border), crop to the bounding box.
 *  -> { w, h, cx (frame centre x inside the crop), pal: ['rrggbb', ...], idx: Uint8Array (0 = transparent, else pal index + 1) } */
function convert(file, grid = GRID) {
  const im = readPNG(file);
  if (im.w !== 1024 || im.h !== 1024) throw new Error(file + ': expected 1024x1024');
  const N = Math.floor(1024 / grid), rgb = new Array(N * N);
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    const o = ((y * grid + (grid >> 1)) * im.w + x * grid + (grid >> 1)) * im.bpp;
    rgb[y * N + x] = [im.px[o], im.px[o + 1], im.px[o + 2]];
  }
  const bg = new Uint8Array(N * N), stack = [];
  const white = (i) => rgb[i].every((v) => v >= WHITE);
  for (let i = 0; i < N; i++) stack.push(i, (N - 1) * N + i, i * N, i * N + N - 1);
  while (stack.length) {
    const i = stack.pop();
    if (bg[i] || !white(i)) continue;
    bg[i] = 1;
    const x = i % N, y = (i / N) | 0;
    if (x > 0) stack.push(i - 1); if (x < N - 1) stack.push(i + 1); if (y > 0) stack.push(i - N); if (y < N - 1) stack.push(i + N);
  }
  let x0 = N, y0 = N, x1 = -1, y1 = -1;
  for (let i = 0; i < N * N; i++) if (!bg[i]) { const x = i % N, y = (i / N) | 0; x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
  const w = x1 - x0 + 1, h = y1 - y0 + 1, pal = [], key = new Map(), idx = new Uint8Array(w * h);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const i = (y + y0) * N + x + x0;
    if (bg[i]) continue;
    const hex = rgb[i].map((v) => v.toString(16).padStart(2, '0')).join('');
    if (!key.has(hex)) { pal.push(hex); key.set(hex, pal.length); }
    idx[y * w + x] = key.get(hex);
  }
  return { w, h, cx: N / 2 - x0, pal, idx };
}

const rgbOf = (hex) => [0, 2, 4].map((k) => parseInt(hex.slice(k, k + 2), 16));
const luma = (hex) => { const [r, g, b] = rgbOf(hex); return (0.299 * r + 0.587 * g + 0.114 * b) / 255; };

/** Area-weighted downscale that keeps pixel-art colours: every output pixel takes the colour covering most of its footprint
 *  (dark colours count 1.7x so eyes and line work survive), it is transparent when the background covers over half of it,
 *  and the silhouette edge is redrawn in the source's own outline colour so the sprite keeps a closed 1px outline. */
function downscale(s, k) {
  if (k >= 0.999) return s;
  const W = Math.max(1, Math.round(s.w * k)), H = Math.max(1, Math.round(s.h * k)), kx = s.w / W, ky = s.h / H;
  const dark = s.pal.map((c) => luma(c) < 0.22), out = new Uint8Array(W * H), wt = new Float64Array(s.pal.length + 1);
  const t0 = (xx, yy) => xx < 0 || yy < 0 || xx >= s.w || yy >= s.h || !s.idx[yy * s.w + xx];
  const edge = new Float64Array(s.pal.length + 1); // the outline colour = the commonest colour on the source silhouette edge
  for (let y = 0; y < s.h; y++) for (let x = 0; x < s.w; x++) {
    const v = s.idx[y * s.w + x];
    if (v && (t0(x - 1, y) || t0(x + 1, y) || t0(x, y - 1) || t0(x, y + 1))) edge[v]++;
  }
  let ol = 1;
  for (let v = 1; v < edge.length; v++) if (edge[v] > edge[ol]) ol = v;
  for (let Y = 0; Y < H; Y++) for (let X = 0; X < W; X++) {
    wt.fill(0);
    const sx0 = X * kx, sx1 = sx0 + kx, sy0 = Y * ky, sy1 = sy0 + ky;
    for (let y = Math.floor(sy0); y < Math.ceil(sy1) && y < s.h; y++) {
      const fy = Math.min(sy1, y + 1) - Math.max(sy0, y);
      for (let x = Math.floor(sx0); x < Math.ceil(sx1) && x < s.w; x++) {
        const a = fy * (Math.min(sx1, x + 1) - Math.max(sx0, x)), v = s.idx[y * s.w + x];
        wt[v] += v && dark[v - 1] ? a * 1.7 : a;
      }
    }
    let opaque = 0, best = 0;
    for (let v = 1; v < wt.length; v++) { opaque += wt[v]; if (wt[v] > 0 && (!best || wt[v] > wt[best])) best = v; }
    out[Y * W + X] = wt[0] > opaque ? 0 : best;
  }
  const res = new Uint8Array(out);
  const t1 = (x, y) => x < 0 || y < 0 || x >= W || y >= H || !out[y * W + x];
  for (let Y = 0; Y < H; Y++) for (let X = 0; X < W; X++) {
    const v = out[Y * W + X];
    if (v && !dark[v - 1] && (t1(X - 1, Y) || t1(X + 1, Y) || t1(X, Y - 1) || t1(X, Y + 1))) res[Y * W + X] = ol;
  }
  return { w: W, h: H, cx: s.cx * (W / s.w), pal: s.pal, idx: res };
}

/** Drop unused palette entries, then [index, run] byte pairs as base64. */
function encode(s) {
  const used = new Map(), pal = [];
  for (const v of s.idx) if (v && !used.has(v)) { pal.push(s.pal[v - 1]); used.set(v, pal.length); }
  const runs = [];
  let last = -1, run = 0;
  for (const v0 of s.idx) {
    const v = v0 ? used.get(v0) : 0;
    if (v === last && run < 255) run++;
    else { if (run) runs.push(last, run); last = v; run = 1; }
  }
  if (run) runs.push(last, run);
  return { w: s.w, h: s.h, cx: Math.round(s.cx * 2) / 2, pal: pal.join(''), rle: Buffer.from(runs).toString('base64') };
}

const { NP } = loadNP({ only: /src\/(core|art\/kigu)\//, quiet: true });
const looks = NP.art.kigu.looks;
const views = { base: 'front', pose: 'pose', back: 'back' };
const native = {};
for (const f of fs.readdirSync(SRC).sort()) {
  const m = /^([a-z]+)-(base|pose|back)\.png$/.exec(f);
  if (m) (native[m[1]] = native[m[1]] || {})[views[m[2]]] = convert(path.join(SRC, f));
}
const out = {}, scaled = {};
let count = 0;
for (const id of Object.keys(native)) {
  const v = native[id], look = looks[id];
  if (!look || !v.front) { console.warn('skip ' + id + ': no look spec or no base sprite'); continue; }
  const k = look.size / v.front.h; // front and pose share one scale so she stays the same size when she strikes
  scaled[id] = {};
  for (const view of Object.keys(v)) {
    // poses were often padded before posing (to keep effects in frame), so their figure is smaller in the 128 frame:
    // hold the pose between 85% and 100% of the standing height, and inside the 96px foe cell
    const kp = Math.min(Math.max(k, (look.size * 0.85) / v[view].h), look.size / v[view].h, 94 / v[view].w);
    scaled[id][view] = downscale(v[view], view === 'back' ? Math.min(1, (look.size * 4) / 3 / v.back.h) : view === 'pose' ? kp : k);
    count++;
  }
  out[id] = {};
  for (const view of Object.keys(scaled[id])) out[id][view] = encode(scaled[id][view]);
}
// Heroes: the approved battle-start throw, art/autosprite/heroes/throw/v2/<hero>-f1-idle, -f2-windup, -f3-follow (1 image px =
// 1 game px, transparent, cut at mid-thigh like the BW player sprite). Per frame: cap = x of the cap/beret centre (the frames are
// lined up on it, as in throw/v2/anim.py); follow also gets hand = the open hand, where the spool leaves.
const HEROES = { hero_m: 'draco', hero_f: 'dahlia' }, HERO_FRAMES = { idle: 'f1-idle', wind: 'f2-windup', follow: 'f3-follow' };
function readRGBA(file) {
  const im = readPNG(file), pal = [], key = new Map(), idx = new Uint8Array(im.w * im.h), px = [];
  for (let i = 0; i < im.w * im.h; i++) {
    const o = i * im.bpp, rgb = [im.px[o], im.px[o + 1], im.px[o + 2]];
    px.push(rgb);
    if (im.bpp === 4 && im.px[o + 3] < 128) continue;
    const hex = rgb.map((v) => v.toString(16).padStart(2, '0')).join('');
    if (!key.has(hex)) { pal.push(hex); key.set(hex, pal.length); }
    idx[i] = key.get(hex);
  }
  // white shirt pixels came out transparent in some frames (white was keyed out): transparent pixels that the border can't reach
  // are holes, so they get their stored colour back, as in the approved preview GIFs
  const out = new Uint8Array(im.w * im.h), stack = [];
  for (let x = 0; x < im.w; x++) stack.push(x, (im.h - 1) * im.w + x);
  for (let y = 0; y < im.h; y++) stack.push(y * im.w, y * im.w + im.w - 1);
  while (stack.length) {
    const i = stack.pop();
    if (out[i] || idx[i]) continue;
    out[i] = 1;
    const x = i % im.w, y = (i / im.w) | 0;
    if (x > 0) stack.push(i - 1); if (x < im.w - 1) stack.push(i + 1); if (y > 0) stack.push(i - im.w); if (y < im.h - 1) stack.push(i + im.w);
  }
  for (let i = 0; i < idx.length; i++) if (!idx[i] && !out[i]) {
    const hex = px[i].map((v) => v.toString(16).padStart(2, '0')).join('');
    if (!key.has(hex)) { pal.push(hex); key.set(hex, pal.length); }
    idx[i] = key.get(hex);
  }
  return { w: im.w, h: im.h, cx: im.w / 2, pal, idx, px };
}
const isCap = (hero, [r, g, b]) => hero === 'dahlia' ? r > 150 && g < 95 && b < 95 : Math.abs(r - g) < 20 && Math.abs(g - b) < 24 && r > 40 && r < 130;
function capX(s, hero) { // the cap's pixels in the top 35%: Dahlia's red beret, Draco's grey cap
  let sx = 0, n = 0;
  for (let y = 0; y < s.h * 0.35; y++) for (let x = 0; x < s.w; x++) if (s.idx[y * s.w + x] && isCap(hero, s.px[y * s.w + x])) { sx += x; n++; }
  return n ? sx / n : s.w / 2;
}
function capTop(s, hero) { // first row with 3+ cap pixels
  for (let y = 0; y < s.h; y++) { let n = 0; for (let x = 0; x < s.w; x++) if (s.idx[y * s.w + x] && isCap(hero, s.px[y * s.w + x])) n++; if (n >= 3) return y; }
  return 0;
}
/** Keep the top `h` rows. */
const cropTop = (s, h) => (h >= s.h ? s : Object.assign({}, s, { h, idx: s.idx.slice(0, s.w * h), px: s.px.slice(0, s.w * h) }));
const HERO_CUT = { dahlia: { wind: 0.76 } }; // Dahlia's wide wind-up stance is short enough that her feet would show
const heroes = {};
for (const [look, hero] of Object.entries(HEROES)) {
  const dir = path.join(ROOT, 'art/autosprite/heroes/throw/v2');
  if (!fs.existsSync(path.join(dir, `${hero}-f1-idle.png`))) continue;
  heroes[look] = {};
  // one cut for every pose, as in anim.py: from the cap top down the idle frame's length (the BW mid-thigh cut)
  const raw = {};
  for (const [k, f] of Object.entries(HERO_FRAMES)) raw[k] = readRGBA(path.join(dir, `${hero}-${f}.png`));
  const L = raw.idle.h - capTop(raw.idle, hero);
  for (const k of Object.keys(HERO_FRAMES)) {
    const s = cropTop(raw[k], capTop(raw[k], hero) + Math.round(L * ((HERO_CUT[hero] || {})[k] || 1))), e = encode(s);
    delete e.cx;
    e.cap = Math.round(capX(s, hero) * 2) / 2;
    if (k === 'follow') { // right-most opaque pixel in the top 40%
      let hx = -1, hy = 0;
      for (let y = 0; y < s.h * 0.4; y++) for (let x = 0; x < s.w; x++) if (s.idx[y * s.w + x] && x > hx) { hx = x; hy = y; }
      e.hand = { x: hx, y: hy };
    }
    heroes[look][k] = e;
    scaled['@' + look + '-' + k] = { front: s };
  }
}
const lines = Object.keys(out).map((id) => '    ' + id + ': ' + JSON.stringify(out[id]) + ',');
fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, `/* GENERATED by tools/import-autosprite.mjs from art/autosprite/kigu/*.png. Do not edit; re-run the tool.
 * Per Kigu and view (front = <id>-base, pose, back): battle-size sprite w x h cropped to the figure, cx = x of the original
 * frame centre (the body axis), feet on the last row. pal = concatenated rrggbb colours (index 1..n; 0 = transparent),
 * rle = base64 of [index, run] byte pairs, rows left to right, top to bottom. */
(function (root) {
  'use strict';
  const NP = (root.NP = root.NP || {});
  NP.art = NP.art || {};
  NP.art.autospriteData = {
${lines.join('\n')}
  };
  /* Hero battle-start throw frames per look id (art/autosprite/heroes/throw/v2): idle, wind, follow; cap = cap-centre x (the frames
   * line up on it), follow.hand = where the spool leaves. Feet are cut off at the bottom row, which sits on the command panel. */
  NP.art.autospriteHeroes = ${JSON.stringify(heroes)};
})(typeof globalThis !== 'undefined' ? globalThis : window);
`);
console.log(`${path.relative(ROOT, OUT)}: ${Object.keys(out).length} kigu, ${Object.keys(heroes).length} heroes, ${count} sprites, ${(fs.statSync(OUT).size / 1024).toFixed(0)} KB`);

// ---- preview: per Kigu, the old generated front next to the new front and pose, then the old and new back (game size)
const pi = process.argv.indexOf('--preview');
if (pi > 0) {
  const dir = process.argv[pi + 1];
  const bmp = (s) => {
    const b = new NP.Bitmap(s.w, s.h);
    for (let i = 0; i < s.idx.length; i++) if (s.idx[i]) b.set(i % s.w, (i / s.w) | 0, '#' + s.pal[s.idx[i] - 1]);
    return b;
  };
  const ids = Object.keys(scaled).filter((id) => id[0] !== '@'), per = 12, none = new NP.Bitmap(8, 8);
  const hs = Object.keys(scaled).filter((id) => id[0] === '@');
  writePNG(path.join(dir, 'autosprite-heroes.png'), sheet(NP, hs.map((h) => ({ bmp: bmp(scaled[h].front), label: h.slice(1) })), { cols: 3, checker: true }), 3);
  for (let p = 0; p * per < ids.length; p++) {
    const e = [];
    for (const id of ids.slice(p * per, (p + 1) * per)) {
      const s = scaled[id];
      e.push({ bmp: NP.art.kigu.front(id), label: id }, { bmp: bmp(s.front), label: 'new' }, { bmp: s.pose ? bmp(s.pose) : none, label: 'pose' });
      e.push({ bmp: NP.art.kigu.back(id), label: 'old back' }, { bmp: s.back ? bmp(s.back) : none, label: s.back ? 'new back' : '(none)' });
    }
    writePNG(path.join(dir, `autosprite-${p + 1}.png`), sheet(NP, e, { cols: 10, cellW: 128, cellH: 128, checker: true }), 2);
  }
  console.log('preview sheets in ' + dir);
}
