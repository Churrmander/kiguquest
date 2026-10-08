// Pseudo-3D overworld view: off by default and leaves the flat renderer untouched; when on, the pivot lands on pivotRow at scale 1,
// far things shrink, every map in the game renders without throwing, and frames are deterministic.
import assert from 'node:assert/strict';
import { boot } from './harness.mjs';

const t = boot(77);
const { NP } = t;
const ow = NP.quickStart('Ren', 'f');
ow.msg.close(); ow.tasks = [];
const V = NP.view3d;
assert.ok(V && V.on === false, 'view3d exists and is off by default');

ow.loadMap('seamstead', 17, 16, 'up', { noEnter: true }); t.tick(10);
const fbA = new NP.Bitmap(240, 160), fbB = new NP.Bitmap(240, 160);
ow.draw(fbA, 0);
const flat = Uint32Array.from(fbA.u32);
ow.draw(fbB, 0);
assert.ok(flat.every((v, i) => v === fbB.u32[i]), 'flat rendering is deterministic');

V.on = true;
ow.draw(fbA, 0); ow.draw(fbB, 0);
assert.ok(fbA.u32.every((v, i) => v === fbB.u32[i]), '3D rendering is deterministic');
assert.ok(fbA.u32.some((v, i) => v !== flat[i]), '3D differs from flat');
assert.ok(fbA.u32.every((v) => (v >>> 24) === 255), 'every 3D pixel is opaque');

// projection: the player pivot sits at screen centre column, on pivotRow, scale 1; points further north shrink and rise
const p = t.ow.player, q0 = V.project(p.px + 8, p.py + 8), q1 = V.project(p.px + 8, p.py + 8 - 160), q2 = V.project(p.px + 8 + 32, p.py + 8);
assert.ok(Math.abs(q0.x - 120) < 0.01 && Math.abs(q0.y - V.cfg.pivotRow) < 0.01 && Math.abs(q0.scale - 1) < 0.001, 'pivot projects to (120, pivotRow) at scale 1');
assert.ok(q1.scale < 1 && q1.y < q0.y, 'further north is smaller and higher on screen');
assert.ok(q2.x > q0.x, 'east is to the right');

// every map renders in 3D, at its spawn points, without throwing
let n = 0;
for (const id of Object.keys(NP.maps)) {
  const sp = Object.values(NP.maps[id].spawns || {})[0] || { x: 1, y: 1, dir: 'down' };
  ow.loadMap(id, sp.x, sp.y, sp.dir || 'down', { noEnter: true }); t.tick(2);
  ow.draw(fbA, 0); n++;
}
assert.ok(n >= 25, 'rendered ' + n + ' maps');

// presets and toggle
V.preset('town'); ow.draw(fbA, 0); V.preset('street');
assert.equal(V.toggle(), false);
ow.loadMap('seamstead', 17, 16, 'up', { noEnter: true }); t.tick(10);
ow.draw(fbB, 0);
assert.ok(flat.every((v, i) => v === fbB.u32[i]), 'turning 3D off restores the flat view exactly');
console.log('view3d OK,', n, 'maps');
