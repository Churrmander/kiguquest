import assert from 'node:assert/strict';
import fs from 'node:fs';
import { loadNP } from '../tools/load.mjs';
const CORE = ['src/core/color.js', 'src/core/rng.js', 'src/core/bitmap.js', 'src/core/font.js', 'src/core/ns.js'];
const mine = JSON.parse(fs.readFileSync('src/art/human/files.json', 'utf8'));
const load = () => loadNP({ files: [...CORE, ...mine] }).NP;
const NP = load();
const H = NP.art.human;

const REQUIRED = ['hero_m', 'hero_f', 'tomo', 'mimi', 'prof_bobbin', 'mom', 'aide_f', 'aide_m', 'villager_f1', 'villager_f2', 'villager_m1', 'villager_m2',
  'elder_m', 'elder_f', 'child_m', 'child_f', 'shopkeeper', 'tea_maid', 'tailor_f', 'tailor_m', 'net_kid', 'picnicker', 'hiker', 'grunt_m', 'grunt_f', 'poppy',
  'pleat', 'madame_damask', 'bryn', 'sailor', 'camper', 'schoolgirl', 'scientist', 'nurse_aide', 'rocker', 'cook', 'fisher', 'pilot', 'skier', 'artist',
  'gentleman', 'lady', 'twins_a', 'twins_b', 'old_tailor'];
for (const id of REQUIRED) assert.ok(H.has(id), 'missing look ' + id);
assert.deepEqual(Array.from(H.ids()).sort(), Array.from(new Set([...H.ids()])).sort());
assert.ok(!H.has('nope'));

const opaque = (b) => { let n = 0; for (let i = 0; i < b.u32.length; i++) if (b.u32[i] >>> 24) n++; return n; };
const check = (b, w, h, label, maxc) => {
  assert.equal(b.w, w, label); assert.equal(b.h, h, label);
  assert.ok(opaque(b) > 40, label + ' empty');
  assert.ok(b.countColors() <= maxc, `${label}: ${b.countColors()} colours`);
};
for (const id of H.ids()) {
  const o = H.overworld(id);
  assert.equal(o.w, 16); assert.equal(o.h, 24);
  for (const d of ['down', 'up', 'left', 'right']) {
    assert.equal(o.frames[d].length, 3, id + ' ' + d);
    o.frames[d].forEach((b, f) => {
      check(b, 16, 24, `${id} ow ${d}${f}`, 32);
      const bb = b.bbox();
      assert.ok(bb && bb.y + bb.h >= 23, `${id} ${d}${f} should reach row 23`);
    });
  }
  const f = H.front(id), b = H.back(id);
  check(f, 64, 64, id + ' front', 32);
  check(b, 64, 64, id + ' back', 32);
  const bb = f.bbox();
  assert.ok(bb.y + bb.h >= 61 && bb.y + bb.h <= 64, id + ' front feet anchor');
  assert.ok(bb.h >= 40 && bb.h <= 62, id + ' front height ' + bb.h);
  assert.ok(f.u32.every((c) => !(c >>> 24) || (c >>> 24) === 255), 'no partial alpha');
}
// determinism across fresh loads
const NP2 = load();
for (const id of ['hero_m', 'prof_bobbin', 'madame_damask', 'child_f']) {
  assert.ok(H.front(id).equals(NP2.art.human.front(id)), id + ' front deterministic');
  assert.ok(H.back(id).equals(NP2.art.human.back(id)), id + ' back deterministic');
  assert.ok(H.overworld(id).frames.down[1].equals(NP2.art.human.overworld(id).frames.down[1]), id + ' ow deterministic');
}
// distinct looks differ
assert.ok(!H.front('hero_m').equals(H.front('hero_f')));
// make(): ad-hoc looks
const q = H.make({ build: 'adult', sex: 'f', hair: { style: 'bob', color: 'mint' }, outfit: { type: 'dress', main: 'sky' }, acc: ['bow:#f06a9c'] });
check(q.front(), 64, 64, 'make front', 32);
check(q.back(), 64, 64, 'make back', 32);
assert.equal(q.overworld().frames.up.length, 3);
// every hair style / outfit / build renders
for (const style of NP.art.human._.HAIRSTYLES) for (const build of ['child', 'teen', 'tall', 'stout']) {
  const s = H.make({ build, hair: { style, color: 'brown' } });
  check(s.front(), 64, 64, style + build, 32);
  check(s.overworld().frames.left[1], 16, 24, style + build, 32);
}
for (const type of Object.keys(NP.art.human._.OUTFITS)) {
  const s = H.make({ outfit: { type, main: 'teal', trim: 'white' } });
  check(s.front(), 64, 64, type, 32); check(s.back(), 64, 64, type, 32);
  check(s.overworld().frames.down[2], 16, 24, type, 32);
}
console.log('human-art: ok (' + H.ids().length + ' looks)');

