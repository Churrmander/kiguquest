// Smoke test for the foundation: draws a few primitives + font specimen and writes PNGs.
// usage: node tools/smoke-core.mjs <outdir>
import { loadNP } from './load.mjs';
import { writePNG, sheet } from './png.mjs';
import assert from 'node:assert/strict';
import path from 'node:path';

const out = process.argv[2] || '/tmp/np-smoke';
const { NP } = loadNP();
const { Bitmap, Color, Font } = NP;

// colour round trips
assert.equal(Color.parse('#ff8000'), Color.pack(255, 128, 0));
assert.equal(Color.hex(Color.pack(1, 2, 3)), '#010203');
assert.equal(Color.parse('#f00'), Color.pack(255, 0, 0));
assert.deepEqual(Array.from(Color.unpack(Color.parse([10, 20, 30, 40]))), [10, 20, 30, 40]); // vm-realm arrays need Array.from
assert.equal(Color.q15(Color.pack(255, 255, 255)), Color.pack(255, 255, 255));

// primitives
const b = new Bitmap(64, 40);
b.clear('#203040');
b.ellipse(16, 20, 12, 9, '#f0a060');
b.ellipse(16, 20, 12, 9, '#ffffff', false);
b.polygon([[36, 6], [60, 6], [48, 30]], '#60c0f0');
b.line(2, 38, 62, 2, '#ff4060');
b.fillRect(40, 30, 10, 6, '#80e080');
b.strokeRect(40, 30, 10, 6, '#000000');
assert.equal(b.get(16, 20), Color.parse('#f0a060'));
assert.equal(b.countColors() >= 6, true);

// sprite from rows + outline + flip + blit
const s = Bitmap.fromRows(['.aa.', 'abba', 'abba', '.aa.'], { a: '#e04060', b: '#ffffff' });
const so = s.padded(2, 2, 2, 2).outline('#000000');
assert.equal(so.get(0, 0), 0);
assert.ok(so.bbox().w >= 6);
b.blit(so, 2, 2);
b.blit(so, 52, 2, { flipX: true, alpha: 0.5 });

// font specimen
const f = new Bitmap(240, 80);
f.clear('#f8f8f0');
Font.draw(f, 'The quick brown fox jumps over the lazy dog.', 4, 4, { color: '#383838', shadow: '#c8c8c0' });
Font.draw(f, 'THE QUICK BROWN FOX 0123456789 !?,.:;\'"', 4, 18, { color: '#383838', shadow: '#c8c8c0' });
Font.draw(f, 'Konko used Ember Wink! It’s super effective!', 4, 32, { color: '#ffffff', shadow: '#606060', outline: '#000000' });
Font.draw(f, '▶FIGHT  ▼  ♥ ★ ♪  HP 34/34', 4, 48, { color: '#383838' });
const wrapped = Font.wrap('Hello there! Welcome to the world of Kigu. My name is Professor Bobbin!', 120);
assert.ok(wrapped.length >= 2);
assert.ok(Font.width('Hello') > 20);

writePNG(path.join(out, 'primitives.png'), b, 6, 'checker');
writePNG(path.join(out, 'font.png'), f, 4);
writePNG(path.join(out, 'sheet.png'), sheet(NP, [{ bmp: s, label: 'a' }, { bmp: so, label: 'outlined' }, { bmp: b, label: 'prims' }]), 3);
console.log('ok ->', out);
