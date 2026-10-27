// Paper-doll idle preview (src/art/autosprite/rig.js + rigs.js) for the AutoSprite Kigu.
//   node tools/preview-idle.mjs outDir id ...            per id and view: 1x frames <id>-<view>-fNN.png, a 3x sheet of all frames,
//                                                        and a parts map (<id>-<view>-parts.png, each part its own colour, 6x)
//   --view front|back   only that view (default both)
//   --center            centre the crop in the cell instead of the battle placement (body axis on the centre column)
//   --gif               also <id>-<view>-idle.gif: the old 1px bob on the left, the rig on the right, 4x, 12 fps (needs ffmpeg)
import { loadNP } from './load.mjs';
import { writePNG, sheet } from './png.mjs';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const CORE = ['src/core/color.js', 'src/core/rng.js', 'src/core/bitmap.js', 'src/core/font.js', 'src/core/ns.js'];
const files = JSON.parse(fs.readFileSync('src/art/autosprite/files.json', 'utf8'));
const { NP } = loadNP({ files: [...CORE, ...files] });
const args = process.argv.slice(2), flag = (f) => args.includes(f);
const vi = args.indexOf('--view'), only = vi >= 0 ? args[vi + 1] : null;
const pos = args.filter((a, i) => !a.startsWith('--') && (vi < 0 || i !== vi + 1));
const out = pos[0] || '/tmp/idle-preview', ids = pos.slice(1);
fs.mkdirSync(out, { recursive: true });
const AS = NP.art.autosprite, RIG = NP.art.autospriteRig, RIGS = NP.art.autospriteRigs, DATA = NP.art.autospriteData;
const BG = '#d6e8ce', COLS = ['#ff5050', '#50c850', '#5050ff', '#e6c800', '#c800c8', '#00c8c8', '#ff8c00', '#783c00', '#000000', '#969696', '#ff96c8', '#96ff96'];

for (const id of ids.length ? ids : Object.keys(RIGS)) {
  for (const view of ['front', 'back']) {
    if ((only && only !== view) || !RIGS[id] || !RIGS[id][view]) continue;
    const rig = RIGS[id][view], C = view === 'back' ? 128 : 96, s = DATA[id][view];
    const crop = decode(s);
    const place = { w: C, h: C, dx: flag('--center') ? (C - s.w) >> 1 : Math.max(0, Math.min(C - s.w, Math.round(C / 2 - s.cx))), dy: C - 2 - s.h };
    const fr = RIG.frames(rig, crop, place), name = id + '-' + view;
    fr.forEach((b, i) => writePNG(path.join(out, `${name}-f${String(i).padStart(2, '0')}.png`), b, 1));
    writePNG(path.join(out, name + '-sheet.png'), sheet(NP, fr.map((bmp, i) => ({ bmp, label: String(i) })), { cols: 8 }), 3, BG);
    // parts map: which part owns each pixel
    const pm = new NP.Bitmap(crop.w, crop.h);
    RIG.cut(rig, crop).forEach((p, k) => p.mask.forEach((v, i) => { if (v) pm.u32[i] = NP.Color.parse(COLS[k % COLS.length]); }));
    writePNG(path.join(out, name + '-parts.png'), pm, 6, BG);
    if (flag('--gif')) {
      const tmp = fs.mkdtempSync(path.join(out, '.gif-'));
      fr.forEach((b, i) => {
        const pair = new NP.Bitmap(C * 2 + 8, C);
        pair.blit(oldBob(crop, place, C, i), 0, 0);
        pair.blit(b, C + 8, 0);
        writePNG(path.join(tmp, `f${String(i).padStart(2, '0')}.png`), pair, 4, BG);
      });
      execFileSync('ffmpeg', ['-v', 'error', '-y', '-framerate', '12', '-i', path.join(tmp, 'f%02d.png'), '-vf',
        'split[a][b];[a]palettegen=reserve_transparent=0[p];[b][p]paletteuse=dither=none', '-loop', '0', path.join(out, name + '-idle.gif')]);
      fs.rmSync(tmp, { recursive: true });
    }
    console.log(name, fr.length, 'frames');
  }
}

/** data.js entry -> cropped Bitmap (normal colours). */
function decode(s) {
  const B64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/', runs = [];
  let acc = 0, bits = 0;
  for (const ch of s.rle) { const v = B64.indexOf(ch); if (v < 0) continue; acc = (acc << 6) | v; bits += 6; if (bits >= 8) { bits -= 8; runs.push((acc >> bits) & 255); } }
  const b = new NP.Bitmap(s.w, s.h);
  let p = 0;
  for (let i = 0; i < runs.length; i += 2) {
    const c = runs[i], n = runs[i + 1];
    if (c) for (let k = 0; k < n; k++) b.set((p + k) % s.w, ((p + k) / s.w) | 0, '#' + s.pal.slice((c - 1) * 6, c * 6));
    p += n;
  }
  return b;
}
/** The 6-frame 1px bob the rig replaces (frame i of 24 shows bob frame i/4), for the side-by-side GIF. */
function oldBob(crop, place, C, i) {
  const BOB = [0, 0, 1, 1, 1, 0], bob = BOB[Math.floor(i / 4) % 6], b = new NP.Bitmap(C, C), seam = Math.round(crop.h * 0.55);
  b.blit(crop, place.dx, place.dy + seam, { sy: seam, sh: crop.h - seam });
  b.blit(crop, place.dx, place.dy - bob, { sh: seam });
  for (let k = 0; k < bob; k++) b.blit(crop, place.dx, place.dy + seam - bob + k, { sy: seam, sh: 1 });
  return b;
}
