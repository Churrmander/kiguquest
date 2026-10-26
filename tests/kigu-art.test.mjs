import assert from 'node:assert/strict';
import fs from 'node:fs';
import { loadNP } from '../tools/load.mjs';
const CORE = ['src/core/color.js', 'src/core/rng.js', 'src/core/bitmap.js', 'src/core/font.js', 'src/core/ns.js'];
const files = JSON.parse(fs.readFileSync('src/art/kigu/files.json', 'utf8'));
for (const f of files) assert.ok(fs.existsSync(f), 'manifest file missing: ' + f);
const { NP } = loadNP({ files: [...CORE, ...files] });
const K = NP.art.kigu;
const ids = K.ids();
const PHASE1 = 'konko kitsuri kyuubelle ottopi ottelia ottomarine sprubun lapinlily lapinade kittabra wiskedabra nibblit nibblenna chirpadee lyripip larkestra acolarva vowspun mikoga buzzlet hunnibloom spinnet spindra daisip daisia kerochapu lilyrana molli molluna'.split(' ');
for (const id of PHASE1) assert.ok(K.has(id), 'missing phase 1 kigu ' + id);
assert.ok(ids.length >= 58, 'expected full roster, got ' + ids.length);
assert.equal(K.has('nope'), false);
assert.equal(K.looks.konko.name, 'Konko');

// Contract: front 96x96 anchor (48,94); back 128x128 anchor (64,126) (drawn natively 4/3 larger); icon 32x32.
// Colour budget: <= 20 colours per battle sprite (all idle frames share frame 0's palette), <= 12 per icon.
const MAXC = 20;
const STAGE_H = { 1: [56, 68], 2: [68, 80], 3: [78, 92] };
const touches = (b) => { // silhouette hugging the canvas border means clipping
  for (let i = 0; i < b.w; i++) if ((b.u32[i] >>> 24) || (b.u32[(b.h - 1) * b.w + i] >>> 24)) return true;
  for (let j = 0; j < b.h; j++) if ((b.u32[j * b.w] >>> 24) || (b.u32[j * b.w + b.w - 1] >>> 24)) return true;
  return false;
};
const t0 = Date.now();
for (const id of ids) {
  const P = K.looks[id];
  const [lo, hi] = P.legend ? STAGE_H[3] : STAGE_H[P.stage];
  const n = K.idleFrames(id);
  assert.ok(n >= 4 && n <= 8, id + ' idle frames ' + n);
  for (const alt of [false, true]) {
    for (const view of ['front', 'back']) {
      const b = K[view](id, { alt });
      const S = view === 'front' ? 96 : 128;
      assert.equal(b.w, S); assert.equal(b.h, S);
      assert.ok(b.countColors() <= MAXC, `${id} ${view} alt=${alt}: ${b.countColors()} colours`);
      assert.ok(!touches(b), `${id} ${view} alt=${alt} touches the canvas edge`);
      const bb = b.bbox();
      assert.equal(bb.y + bb.h - 1, S - 2, `${id} ${view} feet not on the anchor row`);
      const h = view === 'front' ? bb.h : bb.h * 3 / 4;
      assert.ok(h >= lo - 2 && h <= hi + 2, `${id} ${view} height ${bb.h} (stage ${P.stage}: ${lo}-${hi})`);
      assert.ok(Math.abs(bb.x + bb.w / 2 - S / 2) < S * 0.2, `${id} ${view} not centred`);
    }
    for (const fr of [0, 1]) {
      const ic = K.icon(id, fr, { alt });
      assert.equal(ic.w, 32); assert.equal(ic.h, 32);
      assert.ok(ic.countColors() <= 12, `${id} icon ${ic.countColors()} colours`);
      assert.ok(!touches(ic), `${id} icon touches edge`);
    }
  }
  assert.ok(!K.front(id).equals(K.front(id, { alt: true })), id + ' alt identical');
  assert.ok(!K.icon(id, 0).equals(K.icon(id, 1)), id + ' icon frames identical');
  assert.ok(K.front(id, { frame: 0 }) === K.front(id), id + ' frame 0 is the rest pose');
}
console.log('roster checked in', Date.now() - t0, 'ms');

// idle animation: frames loop, differ from the rest pose, stay inside the cell and keep frame 0's palette
for (const id of ['konko', 'kyuubelle', 'mikoga', 'hushroud', 'astara', 'nibblit']) {
  const n = K.idleFrames(id);
  for (const view of ['front', 'back']) {
    const f0 = K[view](id), pal = new Set(f0.colors().keys());
    let moving = 0;
    for (let f = 1; f < n; f++) {
      const b = K[view](id, { frame: f });
      assert.equal(b.w, f0.w);
      assert.ok(!touches(b), `${id} ${view} frame ${f} touches the edge`);
      for (const c of b.colors().keys()) assert.ok(pal.has(c), `${id} ${view} frame ${f} uses a colour frame 0 lacks`);
      const bb = b.bbox();
      assert.equal(bb.y + bb.h - 1, f0.h - 2, `${id} ${view} frame ${f}: feet left the ground`);
      if (!b.equals(f0)) moving++;
    }
    assert.ok(moving >= n - 2, `${id} ${view}: only ${moving} idle frames move`);
  }
  assert.ok(K.front(id, { frame: n }) === K.front(id), id + ' frames wrap');
}
// determinism: a fresh context renders identical pixels
const { NP: NP2 } = loadNP({ files: [...CORE, ...files] });
for (const id of ['konko', 'kyuubelle', 'mikoga']) {
  assert.ok(NP2.art.kigu.front(id).equals(K.front(id)), id + ' not deterministic');
  assert.ok(NP2.art.kigu.back(id, { frame: 2 }).equals(K.back(id, { frame: 2 })), id + ' back frame not deterministic');
}
// distinct species
const seen = new Set();
for (const id of ids) { const k = Buffer.from(K.front(id).data).toString('base64'); assert.ok(!seen.has(k), id + ' duplicates another'); seen.add(k); }
console.log('kigu-art: ok,', ids.length, 'species');
