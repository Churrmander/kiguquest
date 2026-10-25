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
    assert.equal(a.h, s.h * T + s.rise, id + ' height');
    ok(Number.isInteger(s.rise) && s.rise >= 0 && (s.rise === 0 || s.over === 0), id + ': rise must be a whole px count, and not mixed with over');
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
assert.deepEqual([NP.stamps.gate_house.w, NP.stamps.gate_house.h, NP.stamps.gate_house.over], [6, 3, 2]);   // a 2-tile arch, as wide as the roads
assert.deepEqual(Array.from(NP.stamps.gate_house.solid), ['##..##', '##..##', '##..##']);

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

// ------------------------------------------------------------------------------------------------ battle backgrounds
// 9 stages (BIBLE 5): 256x144 (NP.W x NP.BOX_Y, painted natively), opaque, a platform under each anchor, deterministic, soft (no pixel noise), layers + discs for the camera.
const M = Math;
const BG_IDS = ['grass', 'forest', 'indoor', 'cave', 'city', 'gym', 'water', 'night', 'society'];
const K = NP.art.tiles.kit;
for (const id of BG_IDS) ok(NP.art.tiles.battleBgIds().includes(id), 'missing battle background ' + id);
const bgSeen = new Set();
for (const id of BG_IDS) {
  const r = NP.art.tiles.battleBg(id);
  assert.equal(r.id, id);
  assert.equal(r.bg.w, 256, id + ' bg width'); assert.equal(r.bg.h, 144, id + ' bg height');
  assert.equal(r.bg.w, NP.W, id + ': bg spans the screen width'); assert.equal(r.bg.h, NP.BOX_Y, id + ': bg reaches the command box');
  let seeThrough = 0;
  for (let i = 0; i < r.bg.u32.length; i++) if (r.bg.u32[i] >>> 24 !== 255) seeThrough++;
  assert.equal(seeThrough, 0, id + ': bg must be fully opaque (' + seeThrough + ' see-through pixels)');
  for (const [who, p] of [['enemyBase', r.enemyBase], ['playerBase', r.playerBase]]) ok(Number.isInteger(p.x) && Number.isInteger(p.y), id + ': ' + who + ' integer');
  ok(r.bg.inBounds(r.enemyBase.x, r.enemyBase.y), id + ': enemyBase inside the bitmap');
  ok(r.bg.inBounds(r.playerBase.x, 0) && r.playerBase.y >= r.bg.h - 4 && r.playerBase.y < r.bg.h + 10, id + ': playerBase just below the command box top (DS cut-off)');
  ok(r.enemyBase.x > 128 && r.enemyBase.y < 100, id + ': foe stands upper right');
  ok(r.playerBase.x < 128 && r.playerBase.y > 120, id + ': player stands lower left, partly behind the command box');
  // the platforms: opaque pixels of the disc bitmap sit under both anchors (so the feet are on the platform)
  for (const [who, d, p, minW] of [['enemyDisc', r.enemyDisc, r.enemyBase, 112], ['playerDisc', r.playerDisc, r.playerBase, 170]]) {
    ok(d && d.bmp && Number.isInteger(d.x) && Number.isInteger(d.y), id + ': ' + who + ' present');
    ok(d.bmp.w >= minW, id + ': ' + who + ' wide enough (' + d.bmp.w + ')');
    ok((d.bmp.get(p.x - d.x, p.y - d.y) >>> 24) >= 250, id + ': ' + who + ' is opaque under its anchor');
    ok(d.bmp.get(p.x - d.x, p.y - d.y - 1) >>> 24 > 0 && d.bmp.get(p.x - d.x - 20, p.y - d.y) >>> 24 > 0 && d.bmp.get(p.x - d.x + 20, p.y - d.y) >>> 24 > 0, id + ': ' + who + ' extends around the anchor');
    ok(d.bmp.countColors() > 16, id + ': ' + who + ' is shaded');
  }
  // layers for the camera: opaque sky; ground transparent at the top, opaque at the bottom
  ok(r.layers && r.layers.sky && r.layers.ground, id + ': layers');
  assert.equal(r.layers.sky.w, 256); assert.equal(r.layers.sky.h, 144); assert.equal(r.layers.ground.w, 256); assert.equal(r.layers.ground.h, 144);
  for (let x = 0; x < 256; x += 7) {
    assert.equal(r.layers.sky.get(x, 0) >>> 24, 255, id + ': sky opaque'); assert.equal(r.layers.sky.get(x, 143) >>> 24, 255, id + ': sky opaque');
    assert.equal(r.layers.ground.get(x, 143) >>> 24, 255, id + ': ground opaque at the bottom');
    if (x < 228) assert.equal(r.layers.ground.get(x, 10) >>> 24, 0, id + ': ground transparent above the horizon (only a framing trunk may stand there)');
  }
  // "high-key, soft": many tones (no flat fills, no palette crunch) yet bounded (no per-pixel noise)
  const n = r.bg.countColors();
  ok(n >= 150 && n <= 1800, id + ': ' + n + ' colours');
  // the whole image sits on the 15-bit grid
  for (let i = 0; i < r.bg.u32.length; i += 13) { const c = r.bg.u32[i]; ok(c === NP.Color.q15(c), id + ': 15-bit colour'); }
  // deterministic (fresh paint twice, bypassing the cache) and each stage differs from the others
  const d1 = K.battleBgs[id].paint(), d2 = K.battleBgs[id].paint();
  ok(d1.bg.equals(d2.bg) && d1.layers.sky.equals(d2.layers.sky) && d1.enemyDisc.bmp.equals(d2.enemyDisc.bmp), id + ' not deterministic');
  const key = Array.from(r.bg.u32.filter((_, i) => i % 211 === 0)).join(',');
  ok(!bgSeen.has(key), id + ' looks like another background'); bgSeen.add(key);
  // soft: neighbouring pixels rarely jump (a smooth stage, not a noisy texture)
  let jumps = 0;
  for (let y = 0; y < 143; y++) for (let x = 0; x < 255; x++) {
    const a = r.bg.u32[y * 256 + x], b2 = r.bg.u32[y * 256 + x + 1];
    const dr = Math.abs((a & 255) - (b2 & 255)) + Math.abs(((a >>> 8) & 255) - ((b2 >>> 8) & 255)) + Math.abs(((a >>> 16) & 255) - ((b2 >>> 16) & 255));
    if (dr > 150) jumps++;
  }
  ok(jumps < 256 * 144 * 0.06, id + ': too many hard pixel jumps (' + jumps + ')');
}
// the platforms sit under the battle scene's feet anchors (foe (188,92), player (66,148)): the foe platform clears the player's HP box (y >= 100);
// both ovals stay wide and flat (round-looking from a low camera, not stretched tall)
for (const id of BG_IDS) {
  const r = NP.art.tiles.battleBg(id), e = r.enemyDisc, f = e.bmp;
  let bottom = 0;
  for (let y = 0; y < f.h; y++) for (let x = 0; x < f.w; x++) if ((f.get(x, y) >>> 24) > 230) bottom = Math.max(bottom, y + e.y);
  ok(bottom <= 100, id + ': foe platform runs under the player HP box (ends at y ' + bottom + ')');
  ok(M.abs(r.enemyBase.x - 188) <= 4 && M.abs(r.enemyBase.y - 92) <= 3 && M.abs(r.playerBase.x - 66) <= 4 && M.abs(r.playerBase.y - 148) <= 3, id + ': anchors at the battle scene feet positions');
  for (const [who, d] of [['enemyDisc', e], ['playerDisc', r.playerDisc]]) {
    let x0 = 1e9, x1 = -1, y0 = 1e9, y1 = -1;
    for (let y = 0; y < d.bmp.h; y++) for (let x = 0; x < d.bmp.w; x++) if ((d.bmp.get(x, y) >>> 24) > 230) { x0 = M.min(x0, x); x1 = M.max(x1, x); y0 = M.min(y0, y); y1 = M.max(y1, y); }
    const ratio = (x1 - x0 + 1) / (y1 - y0 + 1);
    ok(ratio >= 4.4 && ratio <= 6.2, id + ': ' + who + ' oval proportions ' + ratio.toFixed(2));
  }
}
assert.equal(NP.art.tiles.battleBg('no_such_stage').id, 'grass', 'unknown ids fall back to grass');
if (NP.assets) for (const id of BG_IDS) assert.equal(NP.assets.battleBg(id).id, id, 'assets.battleBg(' + id + ') must reach the real art, not the fallback');
// maps only name stages that exist; the stages the story needs are wired
for (const [mid, m] of Object.entries(NP.maps)) ok(m.battleBg === undefined || BG_IDS.includes(m.battleBg), `map ${mid}: unknown battleBg "${m.battleBg}"`);
for (const [mid, want] of [['gingham_woods', 'forest'], ['spindle_shrine', 'forest'], ['seamstead', 'city'], ['salon', 'gym'], ['hemline_salon', 'gym'], ['seamstead_salon', 'gym'], ['crisp_1', 'society'], ['crisp_2', 'society'], ['crisp_3', 'society'], ['crisp_b1', 'society']]) assert.equal(NP.maps[mid].battleBg, want, mid + ' battleBg');

console.log(`tiles-art: ${BG_IDS.length} battle backgrounds, ${Object.keys(NP.stamps).length} stamps (${drawn} variant/frame draws), ${Object.keys(NP.terrain).length} terrains, ${usedStamps.size} stamp ids used by ${mapIds.length} maps, ${checks} checks OK`);
