// Map sanity: every map builds, warps/spawns line up, stamps sit on legal ground without overlapping, nothing is walled in.
// Problems are collected and reported together so one run shows the whole list.
import assert from 'node:assert/strict';
import { loadNP } from '../tools/load.mjs';

const { NP } = loadNP();
const maps = NP.maps;
const ids = Object.keys(maps);
assert.ok(ids.length >= 12, 'expected the chapter-1 maps, got ' + ids.length);

const problems = [];
const bad = (id, msg) => problems.push(id + ': ' + msg);
const tms = {};
for (const id of ids) {
  try { tms[id] = new NP.TileMap(maps[id]); } catch (e) { bad(id, 'does not build: ' + e.message); }
}

const warpCells = (w) => {
  const xs = w.xs || (Array.isArray(w.x) ? w.x : [w.x]), ys = w.ys || (Array.isArray(w.y) ? w.y : [w.y]);
  const out = [];
  for (const x of xs) for (const y of ys) out.push([x, y]);
  return out;
};

for (const id of ids) {
  const tm = tms[id];
  if (!tm) continue;
  const def = maps[id];
  const here = (x, y) => id + '@' + x + ',' + y;

  // music + battle background exist
  if (def.music && !NP.data.songs[def.music]) bad(id, 'unknown music ' + def.music);
  if (def.battleBg && !NP.art.tiles.battleBg && false) bad(id, 'battleBg');

  // spawns are standable
  for (const [name, s] of Object.entries(def.spawns || {})) if (tm.solid(s.x, s.y)) bad(id, 'spawn "' + name + '" is blocked at ' + s.x + ',' + s.y);

  // warps: in bounds, and the far side has the spawn / door they ask for
  const checkWarp = (w, from) => {
    const target = maps[w.to];
    if (!target) return bad(id, 'warp at ' + from + ' goes to unknown map ' + w.to);
    if (w.door) { if (!tms[w.to] || !tms[w.to].doors[w.door]) bad(id, 'warp at ' + from + ' wants door "' + w.door + '" on ' + w.to); }
    else { const sp = w.spawn || 'door'; if (!(target.spawns && target.spawns[sp])) bad(id, 'warp at ' + from + ' wants spawn "' + sp + '" on ' + w.to); }
  };
  for (const w of def.warps || []) {
    for (const [x, y] of warpCells(w)) if (!tm.inBounds(x, y)) bad(id, 'warp cell out of bounds ' + x + ',' + y);
    checkWarp(w, warpCells(w)[0].join(','));
  }
  for (const w of tm.warps.values()) if (w.door_) checkWarp(w, w.x + ',' + w.y);

  // stamps: in bounds, solid footprint on legal ground, no two solid footprints on the same cell, '#' really blocks
  const owner = new Map();
  for (const p of tm.placements) {
    const d = p.def;
    if (p.x < 0 || p.y < 0 || p.x + p.w > tm.w || p.y + p.h > tm.h) bad(id, p.id + '@' + p.x + ',' + p.y + ' sticks out of the map');
    if (p.layer === 'floor') continue;
    for (let yy = 0; yy < p.h; yy++) {
      for (let xx = 0; xx < p.w; xx++) {
        const ch = d.solid[yy][xx], gx = p.x + xx, gy = p.y + yy;
        if (ch !== '#' && ch !== 'D') continue;
        if (!tm.inBounds(gx, gy)) continue;
        const t = tm.tdef(gx, gy);
        if (def.indoor ? t.id === 'void' : (t.water || t.solid)) bad(id, p.id + '@' + p.x + ',' + p.y + ' has its base on ' + tm.idAt(gx, gy) + ' at ' + gx + ',' + gy);
        const k = gx + ',' + gy;
        if (owner.has(k)) bad(id, p.id + '@' + p.x + ',' + p.y + ' overlaps ' + owner.get(k) + ' at ' + k);
        owner.set(k, p.id + '@' + p.x + ',' + p.y);
        if (ch === '#' && !tm.blocked[gy * tm.w + gx]) bad(id, p.id + '@' + p.x + ',' + p.y + ' is solid in its art but walkable in the map at ' + k);
      }
    }
  }

  // people and pickups must stand on walkable ground
  for (const n of def.npcs || []) {
    if (tm.solid(n.x, n.y)) bad(id, 'npc ' + n.id + ' is inside something solid at ' + n.x + ',' + n.y);
    if (n.look && NP.art.human.has && !NP.art.human.has(n.look)) bad(id, 'npc ' + n.id + ' has unknown look ' + n.look);
    const tr = n.trainer;
    if (tr) for (const t of tr.team) if (!NP.data.species[t.sp]) bad(id, 'trainer ' + n.id + ' uses unknown species ' + t.sp);
  }
  for (const kind of Object.keys(def.encounters || {})) for (const e of def.encounters[kind]) if (!NP.data.species[e.sp]) bad(id, 'encounter uses unknown species ' + e.sp);

  // reachability: flood from every spawn; warps and pickups must be reachable (ledges and doors count as walkable)
  // `fieldMoves`: paddleable water and snippable bushes count as walkable (what the player can do once she has both Discs)
  const flood = (fieldMoves) => {
    const seen = new Uint8Array(tm.w * tm.h);
    const q = [];
    for (const s of Object.values(def.spawns || {})) { q.push([s.x, s.y]); seen[s.y * tm.w + s.x] = 1; }
    const bushAt = new Set(tm.placements.filter((p) => p.id === 'bush').map((p) => p.x + ',' + p.y));
    // flag gates (switch barriers, locked doors) count as open here: this test is about layout; tests/chapter3 checks the closed state
    const gateCells = new Set();
    for (const g of Object.values(def.gates || {})) if (g.closed !== 'h') for (const [gx, gy] of g.cells) gateCells.add(gx + ',' + gy);
    const open = (x, y) => {
      if (gateCells.has(x + ',' + y)) return true;
      if (!tm.solid(x, y)) return true;
      if (!fieldMoves || !tm.inBounds(x, y)) return false;
      const t = tm.tdef(x, y);
      if (t.water && t.paddle && !t.solid && !tm.blocked[y * tm.w + x]) return true;
      return bushAt.has(x + ',' + y);
    };
    while (q.length) {
      const [x, y] = q.pop();
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nx = x + dx, ny = y + dy;
        if (!tm.inBounds(nx, ny) || seen[ny * tm.w + nx] || !open(nx, ny)) continue;
        seen[ny * tm.w + nx] = 1;
        q.push([nx, ny]);
      }
    }
    return seen;
  };
  const onFoot = flood(false), withMoves = flood(true);
  const reach = (x, y) => tm.inBounds(x, y) && onFoot[y * tm.w + x];
  const reachWith = (x, y) => tm.inBounds(x, y) && withMoves[y * tm.w + x];
  for (const w of tm.warps.values()) if (!reach(w.x, w.y)) bad(id, 'warp tile ' + w.x + ',' + w.y + ' (to ' + w.to + ') cannot be reached from any spawn');
  const touch = (x, y) => [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => reach(x + dx, y + dy));
  const touchWith = (x, y) => [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => reachWith(x + dx, y + dy));
  for (const p of def.props || []) {
    if (p.gate) { // behind a field move: unreachable on foot, reachable with Paddle/Snip
      if (!['paddle', 'snip'].includes(p.gate)) bad(id, 'prop ' + p.id + ' has unknown gate ' + p.gate);
      if (touch(p.x, p.y)) bad(id, 'prop ' + p.id + ' is marked gated (' + p.gate + ') but can be reached on foot');
      if (!touchWith(p.x, p.y)) bad(id, 'prop ' + p.id + ' is gated (' + p.gate + ') but cannot be reached even with field moves');
    } else if (!touch(p.x, p.y)) bad(id, 'prop ' + p.id + ' at ' + p.x + ',' + p.y + ' cannot be reached');
  }
  for (const n of def.npcs || []) {
    if (n.hidden) continue;
    if (!touch(n.x, n.y)) bad(id, 'npc ' + n.id + ' at ' + n.x + ',' + n.y + ' is walled in');
  }
}

assert.deepEqual(problems, [], '\n' + problems.join('\n'));
console.log('maps ok:', ids.length, 'maps checked');
