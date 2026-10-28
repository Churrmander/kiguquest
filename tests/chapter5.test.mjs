// Chapter 5, played end to end by a headless bot from the chapter-4 end state:
// the Dust Bowl's north road (open after the Terra Button) -> Route 5 -> Shibuyarn (the brownout, Mimi and Mrs. Kasuri, the rival at
// the claw machine, the station master) -> the Spark Cellar (walk Tuck out, two magnet-stone puzzles, Pleat Calender) -> the lights
// come on and the level crossing lifts -> Route 6 -> Kite Hill. Also checks the gates are shut until earned.
import assert from 'node:assert/strict';
import { boot } from './harness.mjs';

const t = boot(5055);
const { NP } = t;
const ow = NP.quickStart('Ren', 'f');
const st = NP.state;
Object.assign(st.flags, { intro_done: true, has_starter: true, tomo_left_lab: true, rival1_done: true, rival2_done: true, badge1: true, presser1_done: true,
  route2_open: true, route2_insp_done: true, shrine1_done: true, badge2: true, rival3_done: true, crisp_done: true, badge3: true, zip_lights: true,
  east_gate_open: true, mimi_camp_done: true, cart_pushed: true, quarry_reached: true, rival4_done: true, herd_done: true, gusset_back: true, badge4: true });
st.starter = 'konko'; st.rivalStarter = 'sprubun';
st.badges = [true, true, true, true];
st.party.push(NP.Kigu.create('konko', 70, { ot: 'Ren' }), NP.Kigu.create('ottopi', 70, { ot: 'Ren' }), NP.Kigu.create('sprubun', 70, { ot: 'Ren' }));
st.bag.bond_spool = 5; st.bag.snack_cake = 5; st.bag.dust_scarf = 1; st.bag.disc_shove = 1;
st.healPoint = { map: 'quarry_tea', spawn: 'door' };
ow.msg.close(); ow.tasks = [];
const at = (map) => assert.equal(t.ow.map.id, map, 'expected ' + map + ', at ' + t.pos());
const press = (key, ms) => assert.ok(t.mash(() => t.idle() && (typeof key === 'function' ? key() : st.flags[key]), ms || 60000), 'timeout ' + key + ' at ' + t.pos());
const face = (d) => { t.tap(t.keyFor(d)); t.tick(6); };
const DIRS = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
function use(x, y) {
  const m = t.ow.map;
  for (const [d, [dx, dy]] of Object.entries(DIRS)) {
    const sx = x - dx, sy = y - dy;
    if (m.solid(sx, sy) || (t.ow.actorAt(sx, sy, t.ow.player) && !(t.ow.player.x === sx && t.ow.player.y === sy))) continue;
    if (!t.travel(sx, sy, 400)) continue;
    face(d); t.tap('a');
    return true;
  }
  return false;
}
const heal = () => NP.State.healAll();
const exit = (dir) => { t.go(dir); t.mash(() => t.idle(), 3000); };
/** lean on a magnet stone: stand at (x,y) and hold towards it */
const shove = (x, y, d) => { assert.ok(t.travel(x, y, 600), 'to push from ' + x + ',' + y + '; ' + t.pos()); t.hold(t.keyFor(d), 30); t.mash(() => t.idle(), 3000); };

for (const id of ['route5', 'shibuyarn', 'shibuyarn_station', 'shibuyarn_konbini', 'shibuyarn_fabric', 'shibuyarn_toys', 'shibuyarn_ramen', 'shibuyarn_tea',
  'shibuyarn_house', 'spark_cellar', 'spark_cellar_2', 'spark_cellar_3', 'route6', 'ridge_cave']) assert.ok(NP.maps[id], 'map ' + id);
for (const id of ['glowgrub', 'boingo', 'batnap', 'dripstone', 'kachunk', 'gachapop', 'blinkeon', 'cabriolet', 'obento', 'foldling', 'whirligig', 'flumble'])
  assert.ok(NP.data.species[id] && NP.art.kigu.looks[id], 'species and look ' + id);

// ---- the Dust Bowl's north road -> Route 5 -> Shibuyarn
ow.loadMap('dust_bowl', 27, 4, 'up', { noEnter: true }); t.tick(5);
assert.ok(!t.ow.find('north1').visible, 'the Pressers have left the north road');
assert.ok(t.travel(27, 0, 400), 'up the north road; ' + t.pos());
t.mash(() => t.idle(), 3000);
at('route5');
heal();
assert.ok(t.travel(13, 0, 3000), 'up the Pylon Road; ' + t.pos());
t.mash(() => t.idle(), 3000);
at('shibuyarn');
heal();
t.go('up');
press('shibuyarn_arrived', 30000);
assert.ok(t.ow.map.solid(34, 18), 'the level crossing is down in the brownout');

// ---- Mrs. Kasuri's fabric shop (Mimi's first shop window, the rinse salts)
assert.ok(t.travel(9, 17, 600), 'to the fabric shop; ' + t.pos());
exit('up');
at('shibuyarn_fabric');
press('kasuri_done', 30000);
assert.ok(st.bag.rinse_salts, 'Mrs. Kasuri gives the rinse salts');
t.travel(3, 6, 200); exit('down');
at('shibuyarn');

// ---- the rival at the claw machine (no battle)
assert.ok(t.travel(26, 18, 600) || st.flags.rival_claw_done, 'past the arcade; ' + t.pos());
press('rival_claw_done', 30000);

// ---- the station master opens the maintenance stair
heal();
assert.ok(t.travel(18, 7, 600), 'to the station; ' + t.pos());
exit('up');
at('shibuyarn_station');
assert.ok(use(6, 3), 'talk to the station master; ' + t.pos());
press('cellar_open', 30000);
assert.ok(t.travel(12, 2, 400) || t.ow.map.id === 'spark_cellar', 'down the maintenance stair; ' + t.pos());
t.mash(() => t.idle(), 3000);
at('spark_cellar');

// ---- floor 1: walk Tuck out to the stairs
heal();
assert.ok(t.ow.find('tuck').visible, 'Tuck sits in the passage');
assert.ok(use(6, 13), 'talk to Tuck; ' + t.pos());
press('tuck_following', 60000);
assert.equal(t.ow.follower && t.ow.follower.id, 'tuck', 'Tuck follows you');
assert.ok(t.travel(5, 4, 1200) || st.flags.tuck_out, 'walk Tuck to the landing; ' + t.pos());
press('tuck_out', 60000);
assert.ok(!t.ow.find('tuck').visible && !t.ow.follower, 'Tuck goes home');
heal();
assert.ok(t.travel(5, 7, 1200) || t.ow.map.id === 'spark_cellar_2', 'down to B1; ' + t.pos());
t.mash(() => t.idle(), 3000);
at('spark_cellar_2');

// ---- floor 2: four magnet-stone puzzles that get harder (the solver's push lists: stone x,y + the way it goes)
const tm = () => t.ow.map;
const V = { U: [0, -1], D: [0, 1], L: [-1, 0], R: [1, 0] }, KEY = { U: 'up', D: 'down', L: 'left', R: 'right' };
const pushes = (list) => { for (const p of list.split(' ')) { const [x, y] = p.slice(0, -1).split(',').map(Number), d = p.slice(-1); heal(); shove(x - V[d][0], y - V[d][1], KEY[d]); } };
assert.ok(tm().solid(14, 4), 'the first arc fence is up');
heal();
pushes('10,5D 10,6D');
press('cellar_arc1', 10000);
assert.ok(!tm().solid(14, 4), 'the first arc fence fizzled out');
heal();
assert.ok(t.travel(16, 4, 800), 'into the jar store; ' + t.pos());
t.mash(() => t.idle(), 60000);
pushes('16,7D 16,8R 17,8R 18,8R 19,8D 19,9D');
press('cellar_arc2', 10000);
assert.ok(!tm().solid(22, 9), 'the second arc fence fizzled out');
// the rock room: jam the stone first, and the demagnetiser calls it home
pushes('24,14D');
assert.ok(use(21, 10), 'the demagnetiser; ' + t.pos()); t.mash(() => t.idle(), 3000);
assert.ok(tm().shoveAt(24, 14), 'the stone rolled home');
pushes('24,14U 24,13L 23,13L 22,13L 21,13L 20,13L 19,13L 18,13L 17,13D 17,14D 17,15R 18,15D 18,16D 18,17D');
press('cellar_arc3', 10000);
assert.ok(!tm().solid(15, 17), 'the third arc fence fizzled out');
heal();
assert.ok(t.travel(14, 17, 800), 'past Volta; ' + t.pos());
t.mash(() => t.idle(), 60000);
pushes('8,13L 8,14U 7,13D 7,14D 8,13L 7,15D 7,16D 7,17R 7,13D 8,17R 9,17D 7,14D 7,15D 7,16D 7,17L 6,17L 5,17D');
press('cellar_arc4', 10000);
assert.ok(!tm().solid(7, 11), 'the last arc fence fizzled out');
heal();
assert.ok(t.travel(7, 8, 1500) || t.ow.map.id === 'spark_cellar_3', 'down to B2; ' + t.pos());
t.mash(() => t.idle(), 3000);
at('spark_cellar_3');

// ---- floor 3: Pleat Calender and the siphon
heal();
assert.ok(t.travel(16, 8, 1500) || st.flags.calender_done, 'to the siphon; ' + t.pos());
press('calender_done', 120000);
assert.ok(st.flags.shibuyarn_lights, 'the siphon is shut down');
assert.ok(use(20, 3), 'the service lift; ' + t.pos());
t.mash(() => t.ow.map.id === 'shibuyarn_station' && t.idle(), 6000);
at('shibuyarn_station');
assert.ok(t.travel(6, 7, 400), 'to the station door; ' + t.pos());
exit('down');
at('shibuyarn');
press('lights_scene', 30000);
assert.ok(!t.ow.map.solid(34, 18), 'the level crossing lifted');
const shop = t.ow.map.placements.find((p) => p.id === 'city_shop' && p.x === 2);
assert.equal(shop.variant, 'konbini', 'the shop signs are lit');

// ---- Route 6 -> Kite Hill
heal();
assert.ok(t.travel(39, 18, 1000), 'over the crossing; ' + t.pos());
t.mash(() => t.idle(), 3000);
at('route6');
heal();
assert.ok(t.travel(49, 12, 3000), 'along the Windy Ridge; ' + t.pos());
t.mash(() => t.idle(), 3000);
at('kite_hill');
console.log('chapter 5 OK');
