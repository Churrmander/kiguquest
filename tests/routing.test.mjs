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
  tm.syncSnips(NP.state.flags);   // story stamps (a pushed cart) follow the flags
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
    for (const [d, [dx, dy]] of Object.entries(DIRV)) {
      let nx = x + dx, ny = y + dy;
      if (nx < 0 || ny < 0 || nx >= tm.w || ny >= tm.h) continue;
      const ledge = tm.ledge(nx, ny);   // a one-way ledge: you only cross it in its own direction, hopping over it
      if (ledge) { if (ledge !== d) continue; nx += dx; ny += dy; }
      const k = nx + ',' + ny;
      if (vis.has(k)) continue;
      if (tm.solid(nx, ny) || people.has(k) || (avoidSight && seen.has(k))) continue;
      vis.add(k); q.push([nx, ny]);
    }
  }
  return false;
}
/** every trainer on the map (each one on their own) must see you on the way from `from` to any of `goals` */
const forced = (id, from, goals, why, only) => {
  assert.ok(reach(id, from, goals, false), id + ': ' + why + ' is not reachable at all');
  for (const n of NP.maps[id].npcs.filter((q) => q.trainer && (!only || only.includes(q.id)))) {
    assert.ok(!reach(id, from, goals, true, n.id), id + ': ' + why + ' can be reached without passing ' + n.trainer.name);
  }
};

// Crisp & Co. (owner's note: "the battles are easy to avoid if you know where to go")
forced('crisp_1', [7, 10], [[14, 2]], 'the stairs up (past Fold)');
forced('crisp_2', [1, 3], [[14, 2]], 'the stairs up (past Pinch and Lint)');
forced('crisp_3', [1, 3], [[6, 6], [7, 6], [12, 6]], 'the Staff door and the manager (past Brim)');

// Route 1 (Meadow Lane): the ledge rows funnel the walk north past Lia, Bo and Suzu
forced('route1', [12, 38], [[12, 0], [13, 0]], 'Basting Green (the north exit)');

// Route 3 (the Seam Road): the river can only be crossed by paddling until Zip's Button mends the bridge; from wherever you land
// on the far bank, the road to Seamstead still passes every Tailor
NP.state.flags = {};
assert.ok(!reach('route3', [2, 10], [[12, 10]], false), 'route3: the broken bridge can be walked across');
forced('route3', [12, 10], [[39, 10], [39, 11]], 'Seamstead (the Seam Road)');
NP.state.flags = { badge3: true };
assert.ok(reach('route3', [2, 10], [[12, 10]], false), 'route3: the mended bridge cannot be walked across');

// Chapters 4-6 (owner's rule: route trainers can't be skipped; a trainer in an optional side nook may be)
NP.state.flags = { badge4: true, qt_rockfall: true };
forced('route4', [2, 10], [[43, 10], [43, 11]], 'Canvas Rest (the Slab Road)');
forced('route5', [13, 48], [[13, 2], [12, 2], [14, 2]], 'Shibuyarn (the Pylon Road)');
forced('route6', [2, 12], [[47, 11], [47, 12], [47, 13]], 'Kite Hill (the ridge road)');
forced('quarry_tunnels', [3, 18], [[4, 5]], 'the way down (past Rivet and Twill)', ['qt_t1', 'qt_t2']);
forced('quarry_tunnels_2', [4, 4], [[19, 6], [20, 7], [21, 7]], 'the herd');
NP.state.flags = { badge4: true, cellar_arc1: true, cellar_arc2: true, cellar_arc3: true, cellar_arc4: true };
forced('spark_cellar_2', [4, 3], [[7, 9]], 'the stairs down (past Fuse and Volta)');
forced('spark_cellar_3', [4, 3], [[15, 8], [16, 8], [17, 8]], 'the siphon (past Ohm)');
// Hemline Riverside (fishing, 2026-10-26): every Tide Tailor on the bank watches a gap in a copse; the river is too fast to paddle
NP.state.flags = {};
forced('hemline_river', [11, 1], [[10, 45], [11, 45], [12, 45]], 'Hemline Lake (the riverside path)');
NP.state.flags = { sal4_a1: true, sal4_a2: true };
forced('quarry_salon', [5, 14], [[10, 5], [11, 6]], 'lever 3 (past Mica)', ['sal4_t2']);
console.log('routing ok');
