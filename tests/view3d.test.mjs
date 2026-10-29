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

// switches: the headless default leaves V.on alone ('flat'); 'auto' = 3D outdoors / flat indoors with the map's own camera preset;
// 'on' = 3D everywhere; the V key (toggle) flips between flat and auto
assert.equal(V.mode, 'flat', 'headless default mode is flat');
V.mode = 'auto'; V.on = false;
ow.loadMap('seamstead', 17, 16, 'up', { noEnter: true });
assert.equal(V.on, true, 'auto: outdoors is 3D');
assert.equal(V.presetName, NP.maps.seamstead.view, 'auto: the map picks its camera preset');
ow.loadMap('player_house', 3, 3, 'down', { noEnter: true });
assert.equal(V.on, false, 'auto: indoors stays flat');
ow.loadMap('gingham_woods', 14, 4, 'up', { noEnter: true });
assert.equal(V.on, true); assert.equal(V.presetName, NP.maps.gingham_woods.view);
V.mode = 'on';
ow.loadMap('tea_house', 4, 6, 'down', { noEnter: true });
assert.equal(V.on, true, 'on: 3D everywhere'); assert.equal(V.presetName, 'flat-ish', 'on: rooms use the gentle preset');
ow.loadMap('player_house', 3, 3, 'down', { noEnter: true });
assert.equal(V.on, false, 'on: a map with thin edge walls (def.edgeWalls) stays flat, since only the flat renderer draws them');
V.mode = 'flat'; V.on = false;
ow.loadMap('seamstead', 17, 16, 'up', { noEnter: true });
assert.equal(V.on, false, 'flat: the map load changes nothing');
V.mode = 'auto'; V.on = true;
assert.equal(V.toggle(), false); assert.equal(V.mode, 'flat'); assert.equal(V.on, false);
assert.equal(V.toggle(), true); assert.equal(V.mode, 'auto'); assert.equal(V.on, true);
V.mode = 'flat'; V.on = false;
ow.loadMap('seamstead', 17, 16, 'up', { noEnter: true });
ow.draw(fbA, 0);
console.log('view3d OK,', n, 'maps');
