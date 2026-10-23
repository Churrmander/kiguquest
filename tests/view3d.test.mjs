// Pseudo-3D overworld view: on by default; turning it off restores the flat renderer exactly; buildings are solid boxes; when on, the pivot lands on pivotRow at scale 1,
// far things shrink, every map in the game renders without throwing, and frames are deterministic.
import assert from 'node:assert/strict';
import { boot } from './harness.mjs';

const t = boot(77);
const { NP } = t;
const ow = NP.quickStart('Ren', 'f');
ow.msg.close(); ow.tasks = [];
const V = NP.view3d;
assert.ok(V && V.on === true, 'view3d exists and is on by default');
V.on = false;

ow.loadMap('seamstead', 17, 16, 'up', { noEnter: true }); t.tick(10);
const fbA = new NP.Bitmap(NP.W, NP.H), fbB = new NP.Bitmap(NP.W, NP.H);
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
assert.ok(Math.abs(q0.x - NP.W / 2) < 0.01 && Math.abs(q0.y - V.cfg.pivotRow) < 0.01 && Math.abs(q0.scale - 1) < 0.001, 'pivot projects to (W/2, pivotRow) at scale 1');
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

// camera heading is set by the area, not by the player: map default, zones, easing, remapped controls and facings
V.on = true;
assert.equal(V.quarterFor(NP.maps.route3 && new NP.TileMap(NP.maps.route3), 5, 5), 1, 'Route 3 looks east');
const sm = new NP.TileMap(NP.maps.seamstead);
assert.equal(V.quarterFor(sm, 5, 5), 0, 'Seamstead looks north in town');
assert.equal(V.quarterFor(sm, 30, 14), 1, 'Seamstead swings east at the Route 4 gate');
ow.loadMap('seamstead', 17, 16, 'up', { noEnter: true }); t.tick(3);
for (let i = 0; i < 5; i++) ow.draw(fbA, i);
assert.equal(V.yaw, 0);
ow.loadMap('route3', 10, 10, 'down', { noEnter: true }); t.tick(3);
ow.draw(fbA, 0);
assert.ok(V.yaw > 0 && V.yaw < Math.PI / 2, 'camera is easing round, not snapping: ' + V.yaw);
for (let i = 0; i < 120; i++) ow.draw(fbA, i);
assert.ok(Math.abs(V.yaw - Math.PI / 2) < 1e-6, 'camera arrived at the east heading');
assert.equal(V.screenToMap('up'), 'right'); assert.equal(V.screenToMap('right'), 'down');
assert.equal(V.screenToMap('down'), 'left'); assert.equal(V.screenToMap('left'), 'up');
assert.equal(V.viewDir('right'), 'up'); assert.equal(V.viewDir('up'), 'left');
const x0 = t.ow.player.x;
NP.Input.set('up', true); t.tick(14); NP.Input.set('up', false); t.tick(30); // raw screen-up, not map-up
assert.ok(t.ow.player.x > x0, 'pressing screen-up walks east when the camera looks east');
assert.ok(!('rotate' in V) && !('setYaw' in V) && !('yaw' in V.cfg), 'no player-facing camera rotation setting');

// presets and toggle
V.preset('town'); ow.draw(fbA, 0); V.preset('street');
ow.loadMap('seamstead', 17, 16, 'up', { noEnter: true }); t.tick(10);
V.on = false; ow.draw(fbB, 0); const ref = Uint32Array.from(fbB.u32);
V.on = true; ow.draw(fbA, 0);
assert.equal(V.toggle(), false);
ow.draw(fbB, 0);
assert.ok(ref.every((v, i) => v === fbB.u32[i]), 'turning 3D off restores the flat view exactly');
// buildings are solid boxes: a ground point just behind a house is hidden by it, and the house's front wall is in the frame
{
  V.on = true; V.preset('street');
  ow.loadMap('button_town', 12, 12, 'down', { noEnter: true }); t.tick(3);
  for (let i = 0; i < 150; i++) ow.draw(fbA, i);
  const m = t.ow.map, house = m.objs.find((p) => V.BOX[p.id]);
  assert.ok(house, 'Button Town has a box building');
  const saved = V.BOX[house.id];
  const behind = V.project((house.x + house.w / 2) * 16, house.y * 16 + 6, 0);
  ow.draw(fbA, 0); const withBox = Uint32Array.from(fbA.u32);
  delete V.BOX[house.id]; ow.draw(fbB, 0); V.BOX[house.id] = saved;
  assert.ok(withBox.some((v, i) => v !== fbB.u32[i]), 'box buildings render differently from billboards');
  assert.ok(behind && behind.x >= 0 && behind.x < NP.W && behind.y >= 0 && behind.y < NP.H, 'test point is on screen');
  if (behind && behind.x >= 0 && behind.x < NP.W && behind.y >= 0 && behind.y < NP.H) {
    const i = Math.floor(behind.y) * NP.W + Math.floor(behind.x);
    assert.notEqual(withBox[i], fbB.u32[i], 'the ground behind the house is covered by the house');
  }
}
console.log('view3d OK,', n, 'maps');
