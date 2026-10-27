// Paper-doll idles (src/art/autosprite/rig.js + rigs.js): every rigged view, both colourways, in its real battle placement.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { loadNP } from '../tools/load.mjs';
const CORE = ['src/core/color.js', 'src/core/rng.js', 'src/core/bitmap.js', 'src/core/font.js', 'src/core/ns.js'];
const files = JSON.parse(fs.readFileSync('src/art/autosprite/files.json', 'utf8'));
const { NP } = loadNP({ files: [...CORE, ...files] });
const AS = NP.art.autosprite, RIG = NP.art.autospriteRig, RIGS = NP.art.autospriteRigs, DATA = NP.art.autospriteData;

// the polygon masks match Pillow's (the rigs were authored against them): a slanted edge and a bottom row
const m = RIG.polyMask(8, 8, [[[1, 1], [6, 1], [6, 6], [1, 6]]]);
assert.equal(m.reduce((a, v) => a + v, 0), 36, 'box 1..6 is 6x6 pixels');
const tri = RIG.polyMask(10, 10, [[[0, 0], [9, 3], [0, 9]]]);
assert.deepEqual([tri[1 * 10 + 3], tri[1 * 10 + 4], tri[9 * 10 + 0]], [1, 0, 1]);

const opaque = (b) => { let n = 0; for (const v of b.u32) if (v >>> 24) n++; return n; };
const palette = (b) => new Set(Array.from(b.u32).filter((v) => v >>> 24));
let views = 0;
for (const id in RIGS) {
  assert.ok(DATA[id], id + ': rig for a Kigu with no AutoSprite art');
  for (const view in RIGS[id]) {
    assert.ok(view === 'front' || view === 'back', id + ': unknown view ' + view);
    const rig = RIGS[id][view], names = new Set(rig.parts.map((p) => p.name));
    for (const p of rig.parts) {
      if (p.parent) assert.ok(names.has(p.parent), `${id} ${view}: ${p.name} has unknown parent ${p.parent}`);
      for (const [t] of p.fill || []) assert.ok(names.has(t), `${id} ${view}: ${p.name} fills unknown part ${t}`);
    }
    for (const k in rig.anim) assert.ok(names.has(k), `${id} ${view}: anim for unknown part ${k}`);
    // every part claims something (a typo'd box would silently do nothing)
    for (const p of RIG.cut(rig, decodeCrop(id, view))) assert.ok(p.mask.some((v) => v), `${id} ${view}: part ${p.def.name} is empty`);
    for (const alt of [false, true]) {
      const s = DATA[id][view], C = view === 'back' ? 128 : 96;
      // frame 0 is exactly the approved sprite in its cell (the static placement the old bob used for its rest frame)
      const f0 = AS[view](id, { alt, frame: 0 }), rest = staticCell(id, view, alt);
      assert.ok(f0.equals(rest), `${id} ${view} alt=${alt}: frame 0 is not the approved sprite`);
      const pal = palette(rest), n0 = opaque(rest);
      for (let i = 0; i < RIG.N; i++) {
        const b = AS[view](id, { alt, frame: i });
        assert.equal(b.w, C); assert.equal(b.h, C);
        for (const v of palette(b)) assert.ok(pal.has(v), `${id} ${view} alt=${alt} f${i}: colour not in the sprite`);
        // nothing leaves the cell: rendered into a bigger canvas, the same frame has no pixel outside it
        const n = opaque(b);
        assert.ok(Math.abs(n - n0) <= n0 * 0.05, `${id} ${view} f${i}: ${n} px vs ${n0} at rest`);
        const bb = b.bbox();
        assert.ok(bb.x > 0 && bb.y > 0 && bb.x + bb.w < C && bb.y + bb.h <= C - 1, `${id} ${view} f${i}: touches the cell edge`);
      }
      const big = RIG.frames(rig, decodeCrop(id, view, alt), { w: C + 40, h: C + 40, dx: 20 + place(s, C).dx, dy: 20 + place(s, C).dy });
      big.forEach((b, i) => {
        const bb = b.bbox();
        assert.ok(bb.x >= 20 && bb.y >= 20 && bb.x + bb.w <= C + 20 && bb.y + bb.h <= C + 20, `${id} ${view} f${i}: leaves the ${C}px cell`);
      });
    }
    views++;
  }
  assert.equal(AS.idleFrames(id), RIGS[id].front ? RIG.N : AS.IDLE);
}
assert.ok(views >= 6);

function place(s, C) { return { dx: Math.max(0, Math.min(C - s.w, Math.round(C / 2 - s.cx))), dy: C - 2 - s.h }; }
/** The crop as api.js decodes it, via a rig-less copy of the data (so the cell is the plain static placement). */
function decodeCrop(id, view, alt) {
  const s = DATA[id][view], b = new NP.Bitmap(s.w, s.h), C = view === 'back' ? 128 : 96, p = place(s, C);
  b.blit(staticCell(id, view, alt), -p.dx, -p.dy);
  return b;
}
function staticCell(id, view, alt) {
  const keep = RIGS[id];
  delete RIGS[id];
  AS.clearCache();
  const b = AS[view](id, { alt, frame: 0 }).clone();
  RIGS[id] = keep;
  AS.clearCache();
  return b;
}
console.log('kigu-idle: ' + views + ' rigged views ok');
