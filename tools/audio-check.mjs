// node tools/audio-check.mjs  — validates every song/jingle and prints length info
import fs from 'node:fs';
import path from 'node:path';
import { loadNP, ROOT } from './load.mjs';
const core = ['src/core/color.js', 'src/core/rng.js', 'src/core/bitmap.js', 'src/core/font.js', 'src/core/ns.js'];
const { NP } = loadNP({ files: [...core, ...JSON.parse(fs.readFileSync(path.join(ROOT, 'src/audio/files.json'), 'utf8'))] });
const A = NP.audio;
let bad = 0;
for (const id of [...A.songs(), ...A.jingles()]) {
  const p = A.validate(id);
  const c = A.compile(id);
  console.log(id.padEnd(20), c.seconds.toFixed(1).padStart(6) + 's', 'loop@' + c.loopStart.toFixed(1), p.length ? 'PROBLEMS' : 'ok');
  for (const x of p) { console.log('   ', x); bad++; }
}
process.exit(bad ? 1 : 0);
