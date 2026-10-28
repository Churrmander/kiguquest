// NP.art.human contract (DESIGN §4B): 32x32 overworld cells (4 dirs x 3 walk frames, feet on the bottom row, centred),
// 80x80 trainer front/back (bottom-centre anchor (40, 78)), send-out poses, colour budgets, determinism, every part renders.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { loadNP } from '../tools/load.mjs';
const CORE = ['src/core/color.js', 'src/core/rng.js', 'src/core/bitmap.js', 'src/core/font.js', 'src/core/ns.js'];
const mine = JSON.parse(fs.readFileSync('src/art/human/files.json', 'utf8'));
const load = () => loadNP({ files: [...CORE, ...mine] }).NP;
const NP = load();
const H = NP.art.human;
const OW_COLORS = 16, TR_COLORS = 32;

const REQUIRED = ['hero_m', 'hero_f', 'mimi', 'prof_bobbin', 'mom', 'aide_f', 'aide_m', 'villager_f1', 'villager_f2', 'villager_m1', 'villager_m2',
  'elder_m', 'elder_f', 'child_m', 'child_f', 'shopkeeper', 'tea_maid', 'tailor_f', 'tailor_m', 'net_kid', 'picnicker', 'hiker', 'grunt_m', 'grunt_f', 'poppy',
  'pleat', 'madame_damask', 'bryn', 'sailor', 'camper', 'schoolgirl', 'scientist', 'nurse_aide', 'rocker', 'cook', 'fisher', 'pilot', 'skier', 'artist',
  'gentleman', 'lady', 'twins_a', 'twins_b', 'old_tailor'];
for (const id of REQUIRED) assert.ok(H.has(id), 'missing look ' + id);
assert.deepEqual(Array.from(H.ids()).sort(), Array.from(new Set([...H.ids()])).sort());
assert.ok(!H.has('nope'));

const opaque = (b) => { let n = 0; for (let i = 0; i < b.u32.length; i++) if (b.u32[i] >>> 24) n++; return n; };
const solidAlpha = (b) => b.u32.every((c) => !(c >>> 24) || (c >>> 24) === 255);
const check = (b, w, h, label, maxc) => {
  assert.equal(b.w, w, label); assert.equal(b.h, h, label);
  assert.ok(opaque(b) > (w > 40 ? 600 : 120), label + ' looks empty: ' + opaque(b));
  assert.ok(b.countColors() <= maxc, `${label}: ${b.countColors()} colours > ${maxc}`);
  assert.ok(solidAlpha(b), label + ': no partial alpha');
};
/** overworld cell: feet on the bottom row (outline on row 31), figure 20..31px tall, centred */
const checkOw = (b, label) => {
  check(b, 32, 32, label, OW_COLORS);
  const bb = b.bbox();
  assert.equal(bb.y + bb.h, 32, label + ': feet must touch the bottom row');
  assert.ok(bb.h >= 20 && bb.y >= 1, label + ': figure height ' + bb.h + ' (nothing may be clipped at the top)');
  assert.ok(Math.abs(bb.x + bb.w / 2 - 16) <= 4.5, label + ': centred (bbox ' + bb.x + '+' + bb.w + ')');
  return bb;
};
/** trainer sprite: bottom-centre anchor (40, 78) */
const checkTr = (b, label) => {
  check(b, 80, 80, label, TR_COLORS);
  const bb = b.bbox();
  assert.equal(bb.y + bb.h, 79, label + ': feet outline on row 78');
  assert.ok(bb.h >= 50 && bb.y >= 1, label + ': height ' + bb.h + ' (nothing may be clipped at the top)');
  // the legs/feet are centred on x = 40 (accessories like canes or rods may stick out on one side)
  let a = 80, z = -1; for (let x = 0; x < 80; x++) if (b.u32[77 * 80 + x] >>> 24) { a = Math.min(a, x); z = Math.max(z, x); }
  assert.ok(Math.abs((a + z + 1) / 2 - 40) <= 1.5, label + ': feet centred on x=40 (' + a + '..' + z + ')');
  return bb;
};

for (const id of H.ids()) {
  const o = H.overworld(id);
  assert.equal(o.w, 32); assert.equal(o.h, 32);
  for (const d of ['down', 'up', 'left', 'right']) {
    assert.equal(o.frames[d].length, 3, id + ' ' + d);
    o.frames[d].forEach((b, f) => checkOw(b, `${id} ow ${d}${f}`));
    assert.ok(!o.frames[d][1].equals(o.frames[d][0]) && !o.frames[d][2].equals(o.frames[d][0]), id + ' ' + d + ': step frames differ from standing');
    assert.ok(!o.frames[d][1].equals(o.frames[d][2]), id + ' ' + d + ': the two steps differ (legs alternate)');
  }
  // right is the mirrored left, with the step frames swapped (the other foot leads)
  assert.ok(o.frames.right[0].equals(o.frames.left[0].flippedX()), id + ' right mirrors left');
  assert.ok(o.frames.right[1].equals(o.frames.left[2].flippedX()), id + ' right step mirrors left step');
  checkTr(H.front(id), id + ' front');
  checkTr(H.back(id), id + ' back');
  assert.ok(!H.front(id).equals(H.back(id)), id + ' front and back differ');
}

// builds: children are smaller than adults at both scales; the head is roughly a third of the overworld figure
const owH = (id) => H.overworld(id).frames.down[0].bbox().h, trH = (id) => H.front(id).bbox().h;
assert.ok(owH('child_m') < owH('hero_m') && owH('hero_m') <= owH('gentleman'), 'overworld heights: child < teen <= tall');
assert.ok(trH('child_m') + 8 < trH('hero_m'), 'trainer heights: child clearly shorter');
assert.ok(trH('hero_m') >= 64, 'trainer hero is a full-body figure (' + trH('hero_m') + 'px)');

// send-out poses: same size and anchor as back(), distinct arms, 'ready' is back()
for (const id of ['hero_m', 'hero_f']) {
  assert.ok(H.backPose(id, 'ready') === H.back(id), 'ready pose is the back sprite');
  const ps = ['windup', 'throw', 'follow'].map((p) => H.backPose(id, p));
  ps.forEach((b, i) => { check(b, 80, 80, id + ' pose ' + i, TR_COLORS); assert.equal(b.bbox().y + b.bbox().h, 79); assert.ok(!b.equals(H.back(id))); });
  assert.ok(!ps[0].equals(ps[1]) && !ps[1].equals(ps[2]), id + ' poses are distinct');
  assert.ok(ps[1].bbox().y < H.back(id).bbox().y + 2, id + ' throw raises the arm to head height');
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
assert.ok(!H.overworld('twins_a').frames.down[0].equals(H.overworld('twins_b').frames.down[0]));

// make(): ad-hoc looks
const q = H.make({ build: 'adult', sex: 'f', hair: { style: 'bob', color: 'mint' }, outfit: { type: 'dress', main: 'sky' }, acc: ['bow:#f06a9c'] });
checkTr(q.front(), 'make front');
checkTr(q.back(), 'make back');
assert.equal(q.overworld().frames.up.length, 3);
checkOw(q.overworld().frames.up[2], 'make ow');

// every hair style / build, outfit, bottom and accessory renders
const L = NP.art.human._;
assert.ok(L.HAIRSTYLES.length >= 15 && L.ACCS.length >= 25, 'part tables registered');
for (const style of L.HAIRSTYLES) for (const build of ['child', 'teen', 'tall', 'stout', 'elder']) {
  const s = H.make({ build, hair: { style, color: 'brown' } });
  checkTr(s.front(), style + build);
  for (const d of ['down', 'up', 'left']) checkOw(s.overworld().frames[d][1], style + build + d);
}
for (const type of Object.keys(L.OUTFITS)) for (const sex of ['m', 'f']) {
  const s = H.make({ sex, outfit: { type, main: 'teal', trim: 'white' } });
  checkTr(s.front(), type); checkTr(s.back(), type);
  for (const d of ['down', 'up', 'left']) checkOw(s.overworld().frames[d][2], type + d);
}
for (const type of L.BOTTOMS) checkOw(H.make({ bottom: { type, color: 'red' } }).overworld().frames.left[1], 'bottom ' + type);
for (const acc of L.ACCS) {
  const s = H.make({ acc: [acc] });
  checkTr(s.front(), 'acc ' + acc); checkTr(s.back(), 'acc ' + acc);
  for (const d of ['down', 'up', 'left']) checkOw(s.overworld().frames[d][0], 'acc ' + acc + d);
}
console.log('human-art: ok (' + H.ids().length + ' looks)');
