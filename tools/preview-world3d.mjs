// Headless previews of the pseudo-3D overworld (NP.view3d): renders real game frames to PNG.
//
//   node tools/preview-world3d.mjs <mapId> <x> <y> [dir] [outName] [--flat] [--preset=town] [--cfg=f:150,hz:4] [--scale=3] [--time]
//   ... [--q=2] camera quarter turns for the map, [--yaw=0.8] fixed heading in radians
//   node tools/preview-world3d.mjs set            # a fixed set of views (street, plaza, route, woods, ...) side by side
//
// Writes PNGs to the scratch preview dir (PV3D env var overrides). `--time` prints ms/frame for the view.
import fs from 'node:fs';
import path from 'node:path';
import { loadNP } from './load.mjs';
import { writePNG, sheet } from './png.mjs';

const OUT = process.env.PV3D || '/private/tmp/claude-502/-Users-christophercopus-Documents-Claude-Games-notpokemon/87c3b5f3-1384-4255-afc2-dfac4aa2b568/scratchpad/pv3d';
fs.mkdirSync(OUT, { recursive: true });
const args = process.argv.slice(2);
const flags = Object.fromEntries(args.filter((a) => a.startsWith('--')).map((a) => { const [k, v] = a.slice(2).split('='); return [k, v === undefined ? true : v]; }));
const pos = args.filter((a) => !a.startsWith('--'));

const { NP } = loadNP({ quiet: true });
NP.rng.seed(77);
const ow = NP.quickStart('Ren', 'f');
ow.msg.close(); ow.tasks = [];
const G = NP.Game;
const V = NP.view3d;
const fb = new NP.Bitmap(NP.W, NP.H);

function tick(n) { for (let i = 0; i < n; i++) { G.tick(); G.render(); } }

/** render one frame at a map position. opts: { flat, preset, q, frames } */
export function shot(map, x, y, dir, o = {}) {
  V.on = !o.flat;
  ow.loadMap(map, x, y, dir || 'down', { noEnter: true });   // (V.enter picks the map's own preset)
  if (o.preset) V.preset(o.preset);
  if (o.cfg) for (const kv of String(o.cfg).split(',')) { const [k, v] = kv.split(':'); V.cfg[k] = isNaN(+v) ? v : +v; }
  if (o.q !== undefined) { ow.map.def.camera = +o.q; }
  ow.popup = 0;
  if (o.hero === false) ow.player.hidden = true; else ow.player.hidden = false;
  V.yaw = null;
  if (o.yaw !== undefined) { V.yaw = +o.yaw; }
  tick(3);
  const n = o.settle === undefined ? (o.yaw !== undefined ? 0 : 130) : o.settle;
  if (o.yaw !== undefined) { const aim = V.aim; V.aim = () => {}; ow.draw(fb, 1000); V.aim = aim; } else {
  for (let i = 0; i < n; i++) ow.draw(fb, 1000 + i);   // let the camera ease to the map heading
  ow.draw(fb, 1000 + n); }
  return fb.clone();
}

if (pos[0] === 'set') {
  const views = [
    ['seamstead', 17, 17, 'up', 'street'],
    ['seamstead', 8, 14, 'right', 'avenue-w'],
    ['seamstead', 28, 14, 'right', 'gate-e'],
    ['seamstead', 16, 8, 'up', 'salon'],
    ['route1', 12, 26, 'up', 'route1'],
    ['gingham_woods', 10, 12, 'up', 'woods'],
    ['button_town', 12, 10, 'down', 'button'],
    ['thimble', 12, 12, 'down', 'thimble'],
  ];
  const items = [];
  for (const [m, x, y, d, label] of views) {
    try {
      const b = shot(m, x, y, d, { flat: !!flags.flat, preset: flags.preset, cfg: flags.cfg });
      writePNG(path.join(OUT, `set_${label}${flags.flat ? '_flat' : ''}.png`), b, 3);
      items.push({ bmp: b, label });
    } catch (e) { console.log('FAIL', label, e.message); }
  }
  const s = sheet(NP, items, { cols: 2, scale: 1 });
  writePNG(path.join(OUT, `sheet${flags.flat ? '_flat' : ''}.png`), s, 2);
  console.log('wrote set to', OUT);
} else if (pos[0] === 'maps') {
  // every map at its first spawn (outdoor ones in 3D); indoor maps only with --indoor
  const items = [];
  for (const id of Object.keys(NP.maps)) {
    const d = NP.maps[id];
    if (d.indoor && !flags.indoor) continue;
    const sp = Object.values(d.spawns || {})[0] || { x: 3, y: 3, dir: 'down' };
    try {
      const b = shot(id, sp.x, sp.y, sp.dir || 'down', { flat: !!flags.flat, preset: flags.preset, cfg: flags.cfg, mapView: true });
      items.push({ bmp: b, label: id + ' (' + V.presetName + ')' });
    } catch (e) { console.log('FAIL', id, e.message); }
  }
  writePNG(path.join(OUT, `maps${flags.flat ? '_flat' : ''}.png`), sheet(NP, items, { cols: 3, scale: 1 }), 2);
  console.log('wrote maps sheet,', items.length, 'maps');
} else {
  const [map, x, y, dir, name] = pos;
  if (!map) { console.log('usage: preview-world3d.mjs <map> <x> <y> [dir] [name] [--flat] [--preset=] [--scale=] [--time]'); process.exit(1); }
  const b = shot(map, +x, +y, dir || 'down', { flat: !!flags.flat, preset: flags.preset, cfg: flags.cfg, q: flags.q, yaw: flags.yaw });
  const file = path.join(OUT, (name || `${map}_${x}_${y}`) + '.png');
  writePNG(file, b, +(flags.scale || 3));
  console.log('wrote', file);
  if (flags.time) {
    const N = 300;
    const t0 = performance.now();
    for (let i = 0; i < N; i++) ow.draw(fb, 2000 + i);
    console.log('draw ms/frame:', ((performance.now() - t0) / N).toFixed(3));
  }
}
