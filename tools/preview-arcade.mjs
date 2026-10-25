// Arcade previews: plays each cabinet headless with its built-in bot and saves screenshots (title, mid-game, results).
//   node tools/preview-arcade.mjs OUTDIR [id ...]        ids: cab_1 cab_2 cab_3 platformer claw (default: all)
// Writes OUTDIR/<id>.png (a 2x sheet of the shots) and OUTDIR/<id>-<n>.png (each shot at 3x).
//   node tools/preview-arcade.mjs OUTDIR room             the arcade room in the overworld, dark (brownout) and lit, at 3x
import fs from 'node:fs';
import path from 'node:path';
import { loadNP } from './load.mjs';
import { writePNG, sheet } from './png.mjs';

const out = process.argv[2] || '.preview/arcade';
const want = process.argv.slice(3);
fs.mkdirSync(out, { recursive: true });
const { NP } = loadNP({ quiet: true });
const AR = NP.arcade;
const ids = want.length ? want : Object.keys(AR.games);

if (ids[0] === 'room') {
  const G = NP.Game;
  const ow = NP.quickStart('Dahlia', 'f');
  ow.msg.close(); ow.tasks = [];
  const shots = [];
  for (const litOn of [false, true]) {
    NP.state.flags[AR.LIGHTS_FLAG] = litOn;
    ow.loadMap('shibuyarn_arcade', 7, 6, 'up', { noEnter: false });
    for (let i = 0; i < 30; i++) G.tick();
    const b = G.render().clone();
    shots.push({ bmp: b, label: litOn ? 'lit' : 'brownout' });
    writePNG(path.join(out, 'room-' + (litOn ? 'lit' : 'dark') + '.png'), b, 3);
  }
  writePNG(path.join(out, 'room.png'), sheet(NP, shots, { cols: 2 }), 2);
  process.exit(0);
}

for (const id of ids) {
  NP.rng.seed(7);
  NP.state = NP.State.fresh('Dahlia', 'f');
  NP.state.flags[AR.LIGHTS_FLAG] = true;
  AR.st().coins = 30;
  const G = NP.Game;
  while (G.scenes.length) G.pop();
  const s = new AR.CabinetScene(id);
  G.push(s);
  const shots = [];
  const snap = (label) => shots.push({ bmp: G.render().clone(), label });
  const tick = (n = 1) => { for (let i = 0; i < n; i++) { G.tick(); } };
  tick(40); snap('title');
  NP.Input.set('a', true); tick(2); NP.Input.set('a', false); tick(2);
  const def = AR.games[id];
  const marks = def.previewAt || [90, 400, 900];
  let f = 0;
  const held = new Set();
  while (s.phase === 'play' && f < 20000) {
    const want = def.bot && f < (def.botFrames || 6000) ? def.bot(s.game, f) : [];
    for (const b of NP.Input.BUTTONS) {
      const on = want.indexOf(b) >= 0;
      if (on !== held.has(b)) { NP.Input.set(b, on); if (on) held.add(b); else held.delete(b); }
    }
    tick(1); f++;
    if (marks.indexOf(f) >= 0) snap('f' + f);
  }
  for (const b of held) NP.Input.set(b, false);
  tick(60); snap('results');
  shots.forEach((sh, i) => writePNG(path.join(out, id + '-' + i + '.png'), sh.bmp, 3));
  writePNG(path.join(out, id + '.png'), sheet(NP, shots, { cols: 3 }), 2);
  console.log(id, 'frames', f, 'score', s.game && s.game.score, 'tickets', AR.st().tickets, 'phase', s.phase);
}
