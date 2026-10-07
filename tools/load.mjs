// Headless loader: runs the game's classic <script> files inside a Node vm context, exactly in the
// order index.html lists them (scripts tagged `data-browser` are skipped). Gives tools, tests and art
// previews the real `NP` namespace with no browser and no canvas.
//
//   import { loadNP } from './load.mjs';
//   const { NP } = loadNP();                         // everything
//   const { NP } = loadNP({ only: /src\/(core|art)\// });   // subset (regex on the script path)
//   const { NP } = loadNP({ files: ['src/core/color.js', 'src/core/bitmap.js'] });
import vm from 'node:vm';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

export function scriptList(html) {
  html = html || fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  const out = [];
  const re = /<script\b([^>]*)>\s*<\/script>/gi;
  let m;
  while ((m = re.exec(html))) {
    const attrs = m[1];
    const src = /\bsrc\s*=\s*"([^"]+)"/.exec(attrs);
    if (!src) continue;
    if (/\bdata-browser\b/.test(attrs)) continue;
    if (/^https?:/.test(src[1])) continue;
    out.push(src[1]);
  }
  return out;
}

export function makeStorage() {
  const m = new Map();
  return {
    getItem: (k) => (m.has(k) ? m.get(k) : null),
    setItem: (k, v) => void m.set(k, String(v)),
    removeItem: (k) => void m.delete(k),
    clear: () => m.clear(),
    key: (i) => [...m.keys()][i] ?? null,
    get length() { return m.size; },
  };
}

export function loadNP(opts = {}) {
  const { only, skip, files, extra = {}, quiet = false } = opts;
  let list = files || scriptList();
  if (only) list = list.filter((f) => only.test(f));
  if (skip) list = list.filter((f) => !skip.test(f));
  const sandbox = {
    console, setTimeout, clearTimeout, setInterval, clearInterval, queueMicrotask,
    performance: { now: () => performance.now() },
    localStorage: makeStorage(),
    navigator: { userAgent: 'node-headless' },
    ...extra,
  };
  sandbox.window = sandbox;
  const ctx = vm.createContext(sandbox);
  const loaded = [];
  for (const f of list) {
    const p = path.join(ROOT, f);
    if (!fs.existsSync(p)) {
      if (!quiet) console.warn('[load] missing script (skipped):', f);
      continue;
    }
    vm.runInContext(fs.readFileSync(p, 'utf8'), ctx, { filename: p });
    loaded.push(f);
  }
  return { NP: ctx.NP, ctx, files: loaded };
}
