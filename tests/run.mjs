// Runs every tests/*.test.mjs in its own process. `node tests/run.mjs [filter]`
import { readdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = path.dirname(fileURLToPath(import.meta.url));
const filter = process.argv[2];
const files = readdirSync(dir).filter((f) => f.endsWith('.test.mjs') && (!filter || f.includes(filter))).sort();
let failed = 0;
for (const f of files) {
  const t0 = Date.now();
  const r = spawnSync(process.execPath, [path.join(dir, f)], { encoding: 'utf8' });
  const ok = r.status === 0;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${f}  (${Date.now() - t0}ms)`);
  if (!ok) {
    failed++;
    console.log((r.stdout || '').trim().split('\n').slice(-15).join('\n'));
    console.log((r.stderr || '').trim().split('\n').slice(-25).join('\n'));
  }
}
console.log(files.length ? `\n${files.length - failed}/${files.length} test files passed` : 'no tests found');
process.exit(failed ? 1 : 0);
