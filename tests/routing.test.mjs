// Forced trainer routing: on maps where the owner wants every fight unskippable, a flood fill from where you arrive to where you
// must go, avoiding every trainer's line of sight, must NOT find a way. (With the sight lines allowed it must, or the floor is broken.)
import assert from 'node:assert/strict';
import { loadNP } from '../tools/load.mjs';

const { NP } = loadNP();
NP.state = { flags: {}, bag: {}, badges: [], party: [], box: [], dex: { seen: {}, caught: {} } };
const DIRV = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };

/** cells a trainer can see (stops at walls, solid stamps and other people), and cells people stand on */
function analyse(id, only) {
  const def = NP.maps[id], tm = new NP.TileMap(def);
  const people = new Set(), seen = new Set();
  const visible = (n) => !n.hidden && !(n.hideIf && NP.state.flags[n.hideIf]);
  for (const n of def.npcs || []) if (visible(n)) people.add(n.x + ',' + n.y);
  for (const n of def.npcs || []) {
    if (!n.trainer || !visible(n) || (only && n.id !== only)) continue;
    const [dx, dy] = DIRV[n.dir];
    for (let i = 1; i <= (n.trainer.sight || 3); i++) {
      const x = n.x + dx * i, y = n.y + dy * i;
      if (tm.solid(x, y) || people.has(x + ',' + y)) break;
      seen.add(x + ',' + y);
    }
  }
  return { tm, people, seen };
}
function reach(id, from, goals, avoidSight, only) {
  const { tm, people, seen } = analyse(id, only);
  const goal = new Set(goals.map(([x, y]) => x + ',' + y));
  const q = [from], vis = new Set([from.join(',')]);
  while (q.length) {
    const [x, y] = q.shift();
    if (goal.has(x + ',' + y)) return true;
    for (const [dx, dy] of Object.values(DIRV)) {
      const nx = x + dx, ny = y + dy, k = nx + ',' + ny;
      if (vis.has(k) || nx < 0 || ny < 0 || nx >= tm.w || ny >= tm.h) continue;
      if (tm.solid(nx, ny) || people.has(k) || (avoidSight && seen.has(k))) continue;
      vis.add(k); q.push([nx, ny]);
    }
  }
  return false;
}
/** every trainer on the map (each one on their own) must see you on the way from `from` to any of `goals` */
const forced = (id, from, goals, why) => {
  assert.ok(reach(id, from, goals, false), id + ': ' + why + ' is not reachable at all');
  for (const n of NP.maps[id].npcs.filter((q) => q.trainer)) {
    assert.ok(!reach(id, from, goals, true, n.id), id + ': ' + why + ' can be reached without passing ' + n.trainer.name);
  }
};

// Crisp & Co. (owner's note: "the battles are easy to avoid if you know where to go")
forced('crisp_1', [7, 10], [[14, 2]], 'the stairs up (past Fold)');
forced('crisp_2', [1, 3], [[14, 2]], 'the stairs up (past Pinch and Lint)');
forced('crisp_3', [1, 3], [[6, 6], [7, 6], [12, 6]], 'the Staff door and the manager (past Brim)');
console.log('routing ok');
