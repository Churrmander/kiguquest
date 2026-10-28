// Counters (owner's rule): every shopkeeper or NPC standing behind a counter of any kind answers A from the front of the
// counter. For each NPC with a counter tile beside them, the player stands on the far side of that counter, faces it, presses
// A, and that NPC's own talk has to start (no walking round the back to reach them).
import assert from 'node:assert/strict';
import { boot } from './harness.mjs';

const t = boot(777);
const { NP } = t;
const COUNTERS = /^(counter_[lmrc]|tea_healer|display_case|honey_stall)$/;
const DIRS = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
const OPP = { up: 'down', down: 'up', left: 'right', right: 'left' };

const ow = NP.quickStart('Ren', 'f');
ow.msg.close(); ow.tasks = [];
const run0 = ow.runScript, spawn0 = ow.spawn;
let hit = null;
ow.runScript = function (fn, npc) { hit = { fn, npc }; };
ow.spawn = function (gen, kind) { hit = { kind }; };

const bad = [];
let checked = 0;
for (const [mid, def] of Object.entries(NP.maps)) {
  if (!(def.npcs || []).length) continue;
  const tm = new NP.TileMap(def);
  const counterAt = (x, y) => tm.placements.some((p) => COUNTERS.test(p.id) && x >= p.x && x < p.x + p.w && y >= p.y && y < p.y + p.h);
  for (const n of def.npcs) {
    for (const [dir, [dx, dy]] of Object.entries(DIRS)) {
      const cx = n.x + dx, cy = n.y + dy, fx = cx + dx, fy = cy + dy;
      if (!counterAt(cx, cy) || !tm.inBounds(fx, fy) || tm.solid(fx, fy)) continue;
      ow.loadMap(mid, fx, fy, OPP[dir], { noEnter: true });
      const a = ow.actors.find((q) => q.kind === 'npc' && q.id === n.id);
      if (!a || !a.visible) continue;   // hidden at the start of the game (story NPCs who turn up later still use the same rule)
      hit = null;
      ow.interact();
      checked++;
      const viaTile = (def.interact || []).some((e) => e.x === cx && e.y === cy);
      const talked = hit && (hit.npc === a || hit.kind === 'trainer' || (viaTile && hit.fn));
      if (!talked) bad.push(`${mid}: ${n.id} at ${n.x},${n.y} does not answer from ${fx},${fy} across the counter at ${cx},${cy}`);
    }
  }
}
ow.runScript = run0; ow.spawn = spawn0;

assert.ok(checked >= 15, 'counter NPCs found: ' + checked);
assert.deepEqual(bad, [], 'NPCs you have to walk round the counter to talk to:\n' + bad.join('\n'));
console.log('counters ok (' + checked + ' counter NPCs answer from the front)');
