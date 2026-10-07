// Tile art: every stamp / terrain draws at the right size, is deterministic, has well-formed collision rows, and every
// map in NP.maps resolves all of its stamps (id + variant) and terrains against the real registries.
import assert from 'node:assert/strict';
import { loadNP } from '../tools/load.mjs';

const { NP } = loadNP({ quiet: true });
const T = 16;
let checks = 0;
const ok = (c, msg) => { checks++; assert.ok(c, msg); };

// ------------------------------------------------------------------------------------------------ required ids
const STAMPS_P1 = `house_s house_m house_l lab tea_house general_store salon tree tree_big pine bush boulder rock stump sign mailbox
  flowerbed bench lamp well cloth_line windmill barrel crate haystack
  bookshelf window clock poster table_s table_l chair plant sewing_machine bed tv rug_a rug_b cloth_shelf tea_healer pc_terminal
  counter_l counter_m counter_r counter_c shop_shelf mannequin fridge stove sink display_case pillar ladder`.split(/\s+/);
const TERRAINS_INDOOR = 'floor_wood floor_tile floor_stone carpet_red carpet_blue carpet_green wall_wood wall_plaster wall_stone mat void stairs_up stairs_down'.split(' ');
const TYPES = 'fluff ember tide volt sprout frost brawl nettle terra gale dream buzz pebble spook drake shade iron'.split(' ');
const ROOFS = ['red', 'blue', 'green', 'yellow', 'pink', 'gray'];

for (const id of STAMPS_P1) ok(NP.stamps[id], 'missing stamp ' + id);
for (const id of TERRAINS_INDOOR) ok(NP.terrain[id], 'missing terrain ' + id);
assert.deepEqual(Array.from(NP.stamps.salon.variants), TYPES, 'salon needs one variant per type, in BIBLE order');
for (const id of ['house_s', 'house_m', 'house_l']) for (const r of ROOFS) ok(NP.stamps[id].variants.includes(r), id + ' roof ' + r);
for (const d of ['up', 'down', 'left', 'right']) ok(NP.stamps.chair.variants.includes(d), 'chair ' + d);

// ------------------------------------------------------------------------------------------------ stamps
const colourBudget = (tilesArea) => (tilesArea <= 1 ? 16 : tilesArea <= 2 ? 36 : 48);
const BUILDINGS = ['house_s', 'house_m', 'house_l', 'lab', 'tea_house', 'general_store', 'salon'];
let drawn = 0;
for (const [id, s] of Object.entries(NP.stamps)) {
  ok(Number.isInteger(s.w) && Number.isInteger(s.h) && s.w >= 1 && s.h >= 1, id + ' size');
  ok(Array.isArray(s.solid) || (s.solid && typeof s.solid.length === 'number'), id + ' solid');
  assert.equal(s.solid.length, s.h, id + ': solid needs exactly h rows');
  for (const row of s.solid) { ok(typeof row === 'string' && row.length === s.w && /^[#.D]+$/.test(row), id + ': bad solid row "' + row + '"'); }
  ok(Number.isInteger(s.over) && s.over >= 0 && s.over <= s.h, id + ': over must be 0..h');
  ok(s.layer === 'obj' || s.layer === 'floor', id + ': layer');
  ok(Array.isArray(s.variants) && s.variants.length > 0 && s.variants.every((v) => typeof v === 'string'), id + ': variants');
  ok(Number.isInteger(s.frames) && s.frames >= 1, id + ': frames');
  if (s.layer === 'floor') ok(s.solid.every((r) => !r.includes('#')), id + ': floor-layer decor must be walkable');
  if (BUILDINGS.includes(id)) {
    const bottom = s.solid[s.h - 1];
    assert.equal((bottom.match(/D/g) || []).length, 1, id + ': exactly one door in the bottom row');
    ok(s.solid.slice(0, s.h - 1).every((r) => !r.includes('D')), id + ': door only on the bottom row');
    ok(s.solid.slice(0, s.h - 1).every((r) => /^#+$/.test(r)), id + ': upper rows solid');
  }
  if (s.over > 0 && s.solid.some((r, y) => y >= s.over && /^\.+$/.test(r))) ok(false, id + ': walkable rows below the over rows');
  for (const v of s.variants) for (let f = 0; f < s.frames; f++) {
    const a = s.draw(v, f), b = s.draw(v, f);
    assert.equal(a.w, s.w * T, id + ' width');
    assert.equal(a.h, s.h * T, id + ' height');
    ok(a.equals(b), id + ':' + v + ':' + f + ' not deterministic');
    ok(a.countColors() <= colourBudget(s.w * s.h), id + ':' + v + ' uses ' + a.countColors() + ' colours');
    let opaque = 0;
    for (let i = 0; i < a.u32.length; i++) if (a.u32[i] >>> 24) opaque++;
    ok(opaque > a.u32.length * 0.04, id + ':' + v + ' is nearly empty');
    drawn++;
  }
  if (s.frames > 1) ok(!s.draw(s.variants[0], 0).equals(s.draw(s.variants[0], 1)), id + ': animation frames identical');
  // public cached wrapper agrees with the registry
  ok(NP.art.tiles.stamp(id, s.variants[0], 0).w === s.w * T, id + ' wrapper');
}
// variants of a stamp must actually differ
for (const id of ['salon', 'house_m', 'house_s', 'house_l', 'flowerbed', 'chair', 'shrine', 'gate_house']) {
  const s = NP.stamps[id];
  const seen = new Set();
  for (const v of s.variants) { const b = s.draw(v, 0); seen.add(Array.from(b.u32).join(',')); }
  assert.equal(seen.size, s.variants.length, id + ': every variant must look different');
}
// trees: canopy rows are over + walkable, trunk row is solid
for (const id of ['tree', 'pine']) { assert.equal(NP.stamps[id].over, 1); assert.deepEqual(Array.from(NP.stamps[id].solid), ['.', '#']); }
assert.equal(NP.stamps.tree_big.over, 2);
assert.equal(NP.stamps.rug_a.layer, 'floor');
assert.equal(NP.stamps.rug_b.layer, 'floor');

// ------------------------------------------------------------------------------------------------ terrains
for (const id of TERRAINS_INDOOR) {
  const t = NP.terrain[id];
  for (let v = 0; v < t.variants; v++) for (let f = 0; f < t.frames; f++) for (const m of t.autotile ? [0, 1, 4, 16, 64, 85, 170, 255, 0x7f, 0xdf] : [0]) {
    const a = t.draw(m, f, v), b = t.draw(m, f, v);
    assert.equal(a.w, T); assert.equal(a.h, T);
    ok(a.equals(b), id + ' not deterministic');
    ok(a.countColors() <= 16, id + ' uses ' + a.countColors() + ' colours');
    for (let i = 0; i < a.u32.length; i++) assert.equal(a.u32[i] >>> 24, 255, id + ': terrain tiles must be fully opaque');
  }
}
for (const id of ['wall_wood', 'wall_plaster', 'wall_stone', 'void']) ok(NP.terrain[id].solid, id + ' must be solid');
for (const id of ['floor_wood', 'floor_tile', 'floor_stone', 'carpet_red', 'carpet_blue', 'carpet_green', 'mat', 'stairs_up', 'stairs_down']) ok(!NP.terrain[id].solid, id + ' must be walkable');
ok(NP.terrain.wall_wood.group === 'wall' && NP.terrain.wall_stone.group === 'wall', 'walls share a group');
ok(NP.terrain.wall_plaster.draw(255, 0, 0).equals(NP.terrain.wall_plaster.draw(255, 0, 0)), 'wall draw stable');
ok(!NP.terrain.wall_wood.draw(0xff, 0, 0).equals(NP.terrain.wall_wood.draw(0xff & ~16, 0, 0)), 'wall base differs when floor is to the south');

// ------------------------------------------------------------------------------------------------ chapter-2 additions
// bridges: walkable, not water, wooden step, animated in sync with `water`, <=16 colours, opaque, identical left/right and top/bottom
// seams (they must repeat end to end).
for (const id of ['bridge_h', 'bridge_v']) {
  const t = NP.terrain[id];
  ok(t, 'missing terrain ' + id);
  ok(!t.solid && !t.water && !t.encounter, id + ': walkable, not water, no encounters');
  assert.equal(t.step, 'wood', id + ' step sound');
  assert.equal(t.frames, NP.terrain.water.frames, id + ' frames match water');
  assert.equal(t.animSpeed, NP.terrain.water.animSpeed, id + ' animSpeed matches water');
  ok(t.group === NP.terrain.water.group, id + ' shares the water group so shores do not draw against it');
  for (let v = 0; v < t.variants; v++) for (let f = 0; f < t.frames; f++) {
    const a = t.draw(0, f, v);
    ok(a.equals(t.draw(0, f, v)), id + ' not deterministic');
    ok(a.countColors() <= 16, id + ' uses ' + a.countColors() + ' colours');
    for (let i = 0; i < a.u32.length; i++) assert.equal(a.u32[i] >>> 24, 255, id + ': opaque');
    // seamless along the span: the far edge (last column for h, last row for v) is the same in every variant, so any two
    // variants can sit next to each other, and the tile repeats on itself
    const base = t.draw(0, f, 0);
    for (let k = 0; k < 16; k++) {
      const i = id === 'bridge_h' ? k * 16 + 15 : 15 * 16 + k;
      ok(a.u32[i] === base.u32[i], id + ' v' + v + ' f' + f + ': far edge differs from variant 0 at ' + k);
    }
  }
}
ok(!NP.terrain.bridge_h.draw(0, 0, 0).equals(NP.terrain.bridge_v.draw(0, 0, 0)), 'bridge_h and bridge_v differ');
// the shrine and the gatehouse
assert.deepEqual(Array.from(NP.stamps.shrine.variants), ['default', 'pressed']);
assert.deepEqual([NP.stamps.shrine.w, NP.stamps.shrine.h, NP.stamps.shrine.over], [5, 4, 1]);
assert.deepEqual(Array.from(NP.stamps.shrine.solid), ['#####', '#####', '#####', '..D..']);
assert.deepEqual(Array.from(NP.stamps.gate_house.variants), ['default', 'pressed']);
assert.deepEqual([NP.stamps.gate_house.w, NP.stamps.gate_house.h, NP.stamps.gate_house.over], [5, 3, 2]);
assert.deepEqual(Array.from(NP.stamps.gate_house.solid), ['##.##', '##.##', '##.##']);

// ------------------------------------------------------------------------------------------------ map coverage
const mapIds = Object.keys(NP.maps);
ok(mapIds.length >= 12, 'expected the 12 slice maps, got ' + mapIds.length);
const usedStamps = new Map();
for (const [mid, m] of Object.entries(NP.maps)) {
  const terr = new Set(Object.values(m.legend || {}));
  for (const k of ['border', 'floor', 'wall']) if (typeof m[k] === 'string') terr.add(m[k]);
  for (const t of terr) ok(NP.terrain[t], `map ${mid}: unknown terrain "${t}"`);
  for (const ch of new Set(m.rows.join(''))) ok(m.legend[ch], `map ${mid}: char "${ch}" has no legend entry`);
  for (const s of m.stamps || []) {
    const def = NP.stamps[s.id];
    ok(def, `map ${mid}: unknown stamp "${s.id}"`);
    if (s.variant !== undefined && s.variant !== null) ok(def.variants.includes(s.variant), `map ${mid}: stamp ${s.id} has no variant "${s.variant}"`);
    ok(s.x >= 0 && s.y >= 0 && s.x + def.w <= m.rows[0].length && s.y + def.h <= m.rows.length, `map ${mid}: stamp ${s.id}@${s.x},${s.y} leaves the map`);
    (usedStamps.get(s.id) || usedStamps.set(s.id, new Set()).get(s.id)).add(s.variant || def.variants[0]);
    if (s.to) {
      // doors: the tile in front of the door must be walkable
      const dy = def.solid.findIndex((r) => r.includes('D'));
      const door = dy >= 0 ? { x: s.x + def.solid[dy].indexOf('D'), y: s.y + dy } : { x: s.x + (def.w >> 1), y: s.y + def.h - 1 };
      ok(dy >= 0, `map ${mid}: ${s.id} is a door stamp without a D tile`);
      const below = m.legend[(m.rows[door.y + 1] || '')[door.x]];
      ok(below && !NP.terrain[below].solid && !NP.terrain[below].water, `map ${mid}: door of ${s.id}@${s.x},${s.y} opens onto ${below}`);
    }
  }
  // the real engine accepts the map (placements resolve, collision grid builds)
  if (NP.TileMap) {
    const tm = new NP.TileMap(m);
    ok(tm.placements.length === (m.stamps || []).length, `map ${mid}: placements`);
    for (const p of tm.placements) ok(NP.stamps[p.id] === p.def, `map ${mid}: engine fell back to a placeholder for ${p.id}`);
  }
}
ok(usedStamps.size >= 40, 'maps should use the full stamp set');

console.log(`tiles-art: ${Object.keys(NP.stamps).length} stamps (${drawn} variant/frame draws), ${Object.keys(NP.terrain).length} terrains, ${usedStamps.size} stamp ids used by ${mapIds.length} maps, ${checks} checks OK`);
