// Records a scripted wild battle (real BattleScene, real battle core) to PNG frames for checking move animations.
// The player's turns are scripted (no menus); the foe's AI picks from the moves given below.
//
//   node tools/preview-battle.mjs OUTDIR [--every N] [--me ID] [--foe ID] [--alt] [--hero m|f] [--seed N]   // writes OUTDIR/f00000.png ... (every Nth tick, default 2) + keys.png
//   ffmpeg -framerate 30 -i OUTDIR/f%05d.png -vf scale=768:576:flags=neighbor -pix_fmt yuv420p battle.mp4
import fs from 'node:fs';
import path from 'node:path';
import { loadNP } from './load.mjs';
import { writePNG, sheet } from './png.mjs';

const out = process.argv[2];
if (!out) { console.error('usage: node tools/preview-battle.mjs OUTDIR [--every N]'); process.exit(1); }
const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const every = Number(arg('--every', 2)), alt = process.argv.includes('--alt');
fs.mkdirSync(out, { recursive: true });

const { NP } = loadNP({ quiet: true });
NP.rng.seed(Number(arg('--seed', 4)));
NP.state = arg('--hero', 'f') === 'm' ? NP.State.fresh('Draco', 'm') : NP.State.fresh('Dahlia', 'f');
NP.State.addItem('snack_cake', 3);
const me = NP.Kigu.create(arg('--me', 'kitsuri'), 30, { moves: ['paw_swipe', 'foxfire_blast', 'fluff_up', 'numb_dust'] });
const foe = NP.Kigu.create(arg('--foe', 'konko'), 30, { alt, moves: ['pounce', 'cinder', 'tail_wag', 'lullaby'] });
for (const k of [me, foe]) k.hp = NP.Kigu.stats ? NP.Kigu.stats(k).hp : k.hp;
me.hp = Math.max(1, Math.floor(me.hp * 0.55)); // so the snack visibly heals
NP.state.party = [me];

const plan = [{ type: 'move', move: 0 }, { type: 'move', move: 1 }, { type: 'move', move: 2 }, { type: 'move', move: 3 }, { type: 'item', item: 'snack_cake', party: 0 }, { type: 'move', move: 1 }];
const scene = new NP.BattleScene({ wild: true, foe: [foe], bg: 'grass' });
scene.actionMenu = function* () {
  const a = plan.shift();
  if (!a) { this.battle.fled = true; return [{ type: 'run' }]; }
  if (a.type === 'move') return [Object.assign({ target: this.battle.defaultTarget(this.battle.sides[0].active[0]) }, a)];
  return [a];
};
let cur = '';
const play = scene.playEvent;
scene.playEvent = function* (e) { cur = e.t + (e.move ? ':' + e.move : e.status ? ':' + e.status : ''); yield* play.call(this, e); cur = ''; };
NP.Game.push(scene);
const log = []; // per saved frame: the event playing and how busy the effects are (frames.json, for picking stills)

const keys = [];
let n = 0;
for (let t = 0; t < 9000 && !scene.finished; t++) {
  NP.Game.tick();
  const fb = NP.Game.render();
  if (t % every === 0) {
    log.push({ f: n, ev: cur, parts: scene.parts ? scene.parts.length : 0, fx: !!scene.fx, white: scene.disp.some((d) => d && d.white > 0), tint: scene.disp.some((d) => d && d.tint && d.tint.amt > 0.2) });
    writePNG(path.join(out, 'f' + String(n++).padStart(5, '0') + '.png'), fb);
  }
  if (t % 45 === 0 && keys.length < 48) keys.push({ bmp: fb.clone(), label: 't' + t });
  if (NP.Game.top() !== scene) { NP.Input.set('a', t % 6 === 0); } // any pushed screen (none expected): press on
}
fs.writeFileSync(path.join(out, 'frames.json'), JSON.stringify(log));
writePNG(path.join(out, 'keys.png'), sheet(NP, keys, { cols: 6 }), 1);
console.log(`${n} frames, ${plan.length} scripted actions left, finished=${!!scene.finished}`);
