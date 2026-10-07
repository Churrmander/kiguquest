// Dependency-free PNG writer for NP.Bitmap (RGBA). Used by every preview/screenshot tool.
//
//   import { writePNG, sheet } from './png.mjs';
//   writePNG('/tmp/x.png', bmp, 4);                 // 4x nearest-neighbour upscale
//   writePNG('/tmp/x.png', bmp, 4, 'checker');      // show transparency as a checkerboard
//   const s = sheet(NP, [{ bmp, label: 'konko' }, ...], { cols: 6, scale: 1 });  // contact sheet (Bitmap)
//   writePNG('/tmp/sheet.png', s, 2);
import zlib from 'node:zlib';
import fs from 'node:fs';
import path from 'node:path';

const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  crcTable[n] = c >>> 0;
}
function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = crcTable[(c ^ buf[i]) & 255] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(td));
  return Buffer.concat([len, td, crc]);
}

function parseBg(bg) {
  if (!bg) return null;
  if (bg === 'checker') return 'checker';
  let s = String(bg).replace('#', '');
  if (s.length === 3) s = s.split('').map((c) => c + c).join('');
  return [parseInt(s.slice(0, 2), 16), parseInt(s.slice(2, 4), 16), parseInt(s.slice(4, 6), 16)];
}

/** Encode an NP.Bitmap as a PNG Buffer. scale = integer upscale, bg = '#rrggbb' | 'checker' | null (keep alpha). */
export function encodePNG(bmp, scale = 1, bg = null) {
  const W = bmp.w * scale, H = bmp.h * scale;
  const stride = W * 4 + 1;
  const raw = Buffer.alloc(stride * H);
  const bgc = parseBg(bg);
  for (let y = 0; y < H; y++) {
    raw[y * stride] = 0;
    const sy = Math.floor(y / scale);
    for (let x = 0; x < W; x++) {
      const sx = Math.floor(x / scale);
      const c = bmp.u32[sy * bmp.w + sx];
      let r = c & 255, g = (c >>> 8) & 255, b = (c >>> 16) & 255, a = c >>> 24;
      if (bgc && a < 255) {
        let br, bgv, bb;
        if (bgc === 'checker') {
          const v = ((x >> 3) + (y >> 3)) & 1 ? 0x9a : 0xcc;
          br = bgv = bb = v;
        } else [br, bgv, bb] = bgc;
        const f = a / 255;
        r = Math.round(r * f + br * (1 - f));
        g = Math.round(g * f + bgv * (1 - f));
        b = Math.round(b * f + bb * (1 - f));
        a = 255;
      }
      const o = y * stride + 1 + x * 4;
      raw[o] = r; raw[o + 1] = g; raw[o + 2] = b; raw[o + 3] = a;
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(W, 0);
  ihdr.writeUInt32BE(H, 4);
  ihdr[8] = 8; ihdr[9] = 6; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(raw, { level: 6 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

export function writePNG(file, bmp, scale = 1, bg = null) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, encodePNG(bmp, scale, bg));
  return file;
}

/**
 * Lay bitmaps out on a contact sheet. entries: Bitmap | { bmp, label? }.
 * opts: { cols=6, pad=4, bg='#2b2b3a', cellW, cellH, labelColor='#ffffff', checker=false }
 * Returns an NP.Bitmap (write it with writePNG and a scale). Labels need NP.Font (loaded by loadNP()).
 */
export function sheet(NP, entries, opts = {}) {
  const { cols = 6, pad = 4, bg = '#2b2b3a', labelColor = '#ffffff' } = opts;
  const items = entries.map((e) => (e && e.bmp ? e : { bmp: e, label: '' }));
  const hasLabels = items.some((i) => i.label);
  const cw = opts.cellW || Math.max(...items.map((i) => i.bmp.w), 8);
  const ch = opts.cellH || Math.max(...items.map((i) => i.bmp.h), 8);
  const labelH = hasLabels ? 10 : 0;
  const rows = Math.ceil(items.length / cols);
  const cellWp = Math.max(cw, hasLabels ? Math.max(...items.map((i) => (i.label ? NP.Font.width(i.label) : 0))) : 0);
  const W = cols * (cellWp + pad) + pad, H = rows * (ch + labelH + pad) + pad;
  const out = new NP.Bitmap(W, H);
  out.clear(bg);
  items.forEach((it, i) => {
    const cx = pad + (i % cols) * (cellWp + pad), cy = pad + Math.floor(i / cols) * (ch + labelH + pad);
    if (opts.checker) {
      for (let y = 0; y < ch; y++) for (let x = 0; x < cellWp; x++) out.set(cx + x, cy + y, ((x >> 3) + (y >> 3)) & 1 ? '#4a4a5c' : '#3c3c4c');
    }
    out.blit(it.bmp, cx + Math.floor((cellWp - it.bmp.w) / 2), cy + (ch - it.bmp.h));
    if (it.label) NP.Font.draw(out, it.label, cx + Math.floor(cellWp / 2), cy + ch + 1, { color: labelColor, align: 'center' });
  });
  return out;
}
