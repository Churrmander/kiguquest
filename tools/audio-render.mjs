// Renders songs / jingles / sfx / cries to 16-bit mono WAV in Node (no browser) for sanity checks; prints duration, loudness and peak.
//   node tools/audio-render.mjs [--out dir] [--loops 1] [--raw] [id ...]     (no ids = every song, jingle and sfx)
//   node tools/audio-render.mjs cry:konko        (species cry)
// --raw renders without the stored level gains (src/audio/levels.js). Output goes through the same soft limiter as the game.
import path from 'node:path';
import { ROOT } from './load.mjs';
import { loadAudio, renderEvents, kWeight, integratedLufs, shortLufs, writeWav, RATE } from './audio-synth.mjs';

const args = process.argv.slice(2);
let out = path.join(ROOT, '.preview', 'audio'), loops = 1, raw = false;
const ids = [];
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--out') out = args[++i];
  else if (args[i] === '--loops') loops = +args[++i];
  else if (args[i] === '--raw') raw = true;
  else ids.push(args[i]);
}
const NP = loadAudio();
const A = NP.audio;
const all = ids.length ? ids : [...A.songs(), ...A.jingles(), ...A.sfxs()];
for (const id of all) {
  let events, seconds, short = false;
  if (id.startsWith('cry:')) { const c = A.cryEvents(id.slice(4)); events = c.events; seconds = c.seconds + 0.05; short = true; }
  else if (NP.data.songs[id]) {
    const c = A.compile(id, { levels: !raw });
    events = c.events.slice(); seconds = c.total;
    if (c.loops && loops > 1) {
      const span = c.total - c.loopStart;
      for (let k = 1; k < loops; k++) for (const e of c.events) if (e.t >= c.loopStart) events.push({ ...e, t: e.t + k * span });
      seconds += (loops - 1) * span;
    }
  } else if (NP.data.sfx[id] !== undefined) { const c = A.sfxEvents(id, { levels: !raw }); events = c.events; seconds = c.seconds + 0.05; short = true; }
  else { console.log('unknown id', id); continue; }
  const r = renderEvents(NP, events, seconds);
  let peak = 0;
  for (const v of r.mix) peak = Math.max(peak, Math.abs(v));
  const xk = kWeight(r.mix, RATE);
  const lufs = short ? shortLufs(xk, RATE, seconds - 0.05) : integratedLufs(xk, RATE);
  writeWav(path.join(out, id.replace(':', '_') + '.wav'), r.mix, RATE, true);
  console.log(id.padEnd(20), seconds.toFixed(1).padStart(6) + 's', 'LUFS', lufs.toFixed(1).padStart(6), 'peak', peak.toFixed(2), events.length + ' ev');
}
