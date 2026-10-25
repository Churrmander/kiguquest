// Door alignment (owner's rule): wherever a building's door opens onto a lane, the lane must be centred on the door tile
// (an odd width: 1 or 3), never a 2-wide lane half a tile off. A wide street running across under the door is fine.
import assert from 'node:assert/strict';
import { loadNP } from '../tools/load.mjs';

const { NP } = loadNP({ quiet: true });
const isPath = (id) => !!id && /cobble|path|dirt|road|bridge|plank|sand|boardwalk|track/.test(id);
const bad = [];
for (const [mid, def] of Object.entries(NP.maps)) {
  if (def.indoor) continue;
  const tm = new NP.TileMap(def);
  for (const s of def.stamps || []) {
    if (!s.to) continue;
    const p = tm.placements.find((q) => q.x === s.x && q.y === s.y && q.id === s.id);
    const door = Object.values(tm.doors).find((d) => d.x >= p.x && d.x < p.x + p.w && d.y >= p.y && d.y < p.y + p.h);
    if (!door) continue;
    for (let y = door.y + 1; y < door.y + 7 && y < tm.h; y++) {
      if (!isPath(tm.idAt(door.x, y))) { if (y === door.y + 1) bad.push(`${mid} ${s.id}: no path under the door at ${door.x},${y}`); break; }
      let l = door.x, r = door.x;
      while (isPath(tm.idAt(l - 1, y))) l--;
      while (isPath(tm.idAt(r + 1, y))) r++;
      if (r - l + 1 > 5) break;
      if (door.x - l !== r - door.x) { bad.push(`${mid} ${s.id}: lane x${l}-${r} at row ${y} is not centred on the door (x${door.x})`); break; }
    }
  }
}
assert.deepEqual(bad, [], 'doors and lanes out of line:\n' + bad.join('\n'));
console.log('doors ok');
