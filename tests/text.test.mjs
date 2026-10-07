// Player-facing text must never contain the words in docs/STORY.md section 14 (franchise terms, "trainer", "gym", "badge",
// "capture", crude words...). Scans every string literal in the game's source (maps, game, engine, data) for whole-word hits.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { ROOT } from '../tools/load.mjs';

const FORBIDDEN = [
  /\bpok[eé]mon\b/i, /\bpok[eé]\b/i, /\bpoke ?balls?\b/i, /\bpok[eé]dex\b/i, /\bpocket monsters?\b/i, /\bmonsters?\b/i, /\bcreatures?\b/i,
  /\btrainers?\b/i, /\bgyms?\b/i, /\bgym leaders?\b/i, /\bbadges?\b/i, /\belite four\b/i, /\bchampions?\b/i,
  /\bvictory road\b/i, /\bpallet\b/i, /\bviridian\b/i, /\bteam (rocket|plasma|galactic|aqua|magma|flare|skull|yell|star)\b/i,
  /\bghetsis\b/i, /\bpikachu\b/i, /\bcharizard\b/i, /\beevee\b/i,
  /\bcapture[ds]?\b/i, /\btamed?\b/i, /\bcaught\b/i,
  /\b(die|dies|dead|kill|kills|killed|blood|gore|damn|hell|crap|stupid|idiot)\b/i, /\bshut up\b/i,
];

const DIRS = ['src/maps', 'src/game', 'src/engine', 'src/data'];
// src/data/text/_api.js is the writers' developer documentation of the text variables, not player-facing text
const SKIP_FILES = new Set(['src/data/text/_api.js']);
const files = [];
const walk = (d) => {
  for (const f of fs.readdirSync(path.join(ROOT, d), { withFileTypes: true })) {
    const p = path.join(d, f.name);
    if (f.isDirectory()) walk(p);
    else if (f.name.endsWith('.js')) files.push(p);
  }
};
DIRS.forEach(walk);

// string literals only (single, double, template); comments are stripped first so notes to developers can say "gym"
const strip = (src) => src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:\\'"`])\/\/.*$/gm, '$1');
const LIT = /'((?:[^'\\\n]|\\.)*)'|"((?:[^"\\\n]|\\.)*)"|`((?:[^`\\]|\\.)*)`/g;

const hits = [];
let scanned = 0;
for (const f of files) {
  if (SKIP_FILES.has(f)) continue;
  const src = strip(fs.readFileSync(path.join(ROOT, f), 'utf8'));
  let m;
  while ((m = LIT.exec(src))) {
    const s = m[1] ?? m[2] ?? m[3];
    if (!s || s.length < 4 || /^[a-z_.:]+$/.test(s)) continue; // empty, or a bare lowercase identifier (event kind, asset kind...)
    scanned++;
    const shown = s.replace(/\{\w+\}/g, ''); // {trainer}-style placeholder NAMES are substituted before the player sees them
    for (const re of FORBIDDEN) if (re.test(shown)) hits.push(f + ': "' + s.slice(0, 90) + '"  <- ' + re.source);
  }
}
assert.ok(scanned > 500, 'scanned a plausible amount of text: ' + scanned);
assert.deepEqual(hits, [], '\nforbidden words in player-facing text:\n' + hits.join('\n'));
console.log('text ok:', scanned, 'string literals in', files.length, 'files');
