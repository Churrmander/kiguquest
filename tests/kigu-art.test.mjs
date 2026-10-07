import assert from 'node:assert/strict';
import fs from 'node:fs';
import { loadNP } from '../tools/load.mjs';
const CORE = ['src/core/color.js', 'src/core/rng.js', 'src/core/bitmap.js', 'src/core/font.js', 'src/core/ns.js'];
const files = JSON.parse(fs.readFileSync('src/art/kigu/files.json', 'utf8'));
for (const f of files) assert.ok(fs.existsSync(f), 'manifest file missing: ' + f);
const { NP } = loadNP({ files: [...CORE, ...files] });
const K = NP.art.kigu;
const ids = K.ids();
const PHASE1 = 'konko kitsuri kyuubelle ottopi ottelia ottomarine sprubun lapinlily lapinelle mittsy meowvelle nibbi nibblenna peepi larkette larkessa silkie cocoona mothelia buzzlet honeybelle webbi webelle daisip daisia ribbi ribbelle molli molluna'.split(' ');
for (const id of PHASE1) assert.ok(K.has(id), 'missing phase 1 kigu ' + id);
assert.ok(ids.length >= 58, 'expected full roster, got ' + ids.length);
assert.equal(K.has('nope'), false);
assert.equal(K.looks.konko.name, 'Konko');

const touches = (b) => { // silhouette hugging the canvas border means clipping
  for (let i = 0; i < b.w; i++) if ((b.u32[i] >>> 24) || (b.u32[(b.h - 1) * b.w + i] >>> 24)) return true;
  for (let j = 0; j < b.h; j++) if ((b.u32[j * b.w] >>> 24) || (b.u32[j * b.w + b.w - 1] >>> 24)) return true;
  return false;
};
for (const id of ids) {
  for (const alt of [false, true]) {
    for (const view of ['front', 'back']) {
      const b = K[view](id, { alt });
      assert.equal(b.w, 64); assert.equal(b.h, 64);
      assert.ok(b.countColors() <= 16, `${id} ${view} alt=${alt}: ${b.countColors()} colours`);
      assert.ok(!touches(b), `${id} ${view} alt=${alt} touches the canvas edge`);
      const bb = b.bbox();
      assert.ok(bb.h >= 34 && bb.h <= 62, `${id} ${view} height ${bb.h}`);
      assert.ok(bb.y + bb.h >= 60, `${id} ${view} feet not on the baseline`);
    }
    for (const fr of [0, 1]) {
      const ic = K.icon(id, fr, { alt });
      assert.equal(ic.w, 32); assert.equal(ic.h, 32);
      assert.ok(ic.countColors() <= 12, `${id} icon ${ic.countColors()} colours`);
      assert.ok(!touches(ic), `${id} icon touches edge`);
    }
  }
  assert.ok(!K.front(id).equals(K.front(id, { alt: true })), id + ' alt identical');
  assert.ok(!K.front(id).equals(K.back(id)), id + ' front==back');
  assert.ok(!K.icon(id, 0).equals(K.icon(id, 1)), id + ' icon frames identical');
}
// determinism: a fresh context renders identical pixels
const { NP: NP2 } = loadNP({ files: [...CORE, ...files] });
for (const id of ['konko', 'kyuubelle', 'mothelia']) assert.ok(NP2.art.kigu.front(id).equals(K.front(id)), id + ' not deterministic');
// distinct species
const seen = new Set();
for (const id of ids) { const k = Buffer.from(K.front(id).data).toString('base64'); assert.ok(!seen.has(k), id + ' duplicates another'); seen.add(k); }
console.log('kigu-art: ok,', ids.length, 'species');
