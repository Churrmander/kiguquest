// Chapter 4, played end to end by a headless bot from the chapter-3 end state:
// Seamstead east gate (Zip's cable) -> Route 4 -> Canvas Rest (Mimi's Dust Scarf) -> Dust Bowl (push the stuck slab cart)
// -> Bobbin Quarry (Rival #4) -> Quarry Tunnels (settle the Pebbi herd, Gusset's hut) -> Terra Salon track switches (Gusset,
// Terra Button, Disc: Shove) -> Shove the loose rock into the geode alcove. Also checks the gates are closed until earned.
import assert from 'node:assert/strict';
import { boot } from './harness.mjs';

const t = boot(4044);
const { NP } = t;
const ow = NP.quickStart('Ren', 'f');
const st = NP.state;
Object.assign(st.flags, { intro_done: true, has_starter: true, tomo_left_lab: true, rival1_done: true, rival2_done: true, badge1: true, presser1_done: true,
  route2_open: true, route2_insp_done: true, shrine1_done: true, badge2: true, rival3_done: true, crisp_done: true, badge3: true, zip_lights: true });
st.starter = 'konko'; st.rivalStarter = 'sprubun';
st.badges = [true, true, true];
st.party.push(NP.Kigu.create('konko', 60, { ot: 'Ren' }), NP.Kigu.create('ottopi', 60, { ot: 'Ren' }), NP.Kigu.create('sprubun', 60, { ot: 'Ren' }));
st.bag.bond_spool = 5; st.bag.snack_cake = 5; st.bag.zip_cable = 1;
st.healPoint = { map: 'seamstead_tea', spawn: 'door' };
ow.msg.close(); ow.tasks = [];
const at = (map) => assert.equal(t.ow.map.id, map, 'expected ' + map + ', at ' + t.pos());
const press = (key, ms) => assert.ok(t.mash(() => t.idle() && (typeof key === 'function' ? key() : st.flags[key]), ms || 60000), 'timeout ' + key + ' at ' + t.pos());
const face = (d) => { t.tap(t.keyFor(d)); t.tick(6); };
const DIRS = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
/** walk next to (x,y), face it and press A */
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

// ---- every Chapter 4 map builds
for (const id of ['route4', 'canvas_rest', 'canvas_tea', 'canvas_store', 'dust_bowl', 'dust_oasis', 'bobbin_quarry', 'quarry_tea', 'quarry_store',
  'quarry_tunnels', 'quarry_tunnels_2', 'quarry_hut', 'quarry_salon']) assert.ok(NP.maps[id], 'map ' + id);
for (const id of ['jerbi', 'jerbix', 'tumbi', 'tumbora', 'skorpi', 'skorpika', 'cactli', 'cactara', 'sandkit', 'sandoa', 'slatli', 'slatina', 'geodie', 'geodrusa', 'geodora', 'chippi', 'chippona'])
  assert.ok(NP.data.species[id] && NP.art.kigu.looks[id], 'species and look ' + id);

// ---- Seamstead: an old save at the end of Chapter 3 gets Zip's gate scene on entry
ow.loadMap('seamstead', 30, 15, 'right', { noEnter: false });
press('east_gate_open', 30000);
assert.ok(!t.ow.map.solid(34, 14) && !t.ow.map.solid(35, 15), 'the east gate is open');
assert.ok(t.travel(35, 14, 400), 'to the east gate; ' + t.pos());
t.go('right'); t.mash(() => t.idle(), 3000);
at('route4');

// ---- Route 4 -> Canvas Rest (the road walk passes the Tailors; the bot fights whoever sees it)
assert.ok(t.travel(45, 10, 3000), 'cross Route 4; ' + t.pos());
t.go('right'); t.mash(() => t.idle(), 3000);
at('canvas_rest');
press(() => st.flags.mimi_camp_done && st.bag.dust_scarf, 30000);
assert.ok(st.bag.dust_scarf, 'Mimi sews the Dust Scarf');

// ---- the Dust Bowl: the slab cart blocks the middle shelf until it's pushed
heal();
assert.ok(t.travel(31, 10, 600), 'to the camp exit; ' + t.pos());
t.go('right'); t.mash(() => t.idle(), 3000);
at('dust_bowl');
assert.ok(t.ow.map.solid(20, 10) && t.ow.map.solid(20, 11), 'the stuck cart blocks the shelf');
assert.ok(use(20, 12), 'talk to the carter; ' + t.pos());
press('cart_pushed', 30000);
assert.ok(!t.ow.map.solid(20, 10) && !t.ow.map.solid(20, 11), 'the cart rolled clear');
assert.ok(st.bag.bond_spool >= 8, 'the carter pays in bond spools');
heal();
assert.ok(t.travel(39, 4, 2000), 'follow the red thread to the Quarry road; ' + t.pos());
t.go('right'); t.mash(() => t.idle(), 3000);
at('bobbin_quarry');

// ---- Bobbin Quarry: Rival #4 at the gate; the Salon is shut while Gusset is down the pit
heal();
t.go('right');
press('rival4_done', 90000);
assert.ok(st.flags.quarry_reached);
assert.ok(t.ow.find('appr').visible, 'the apprentice minds the Salon door');

// ---- the tunnels: settle the herd, then tea in Gusset's hut
heal();
assert.ok(t.travel(5, 5, 600), 'to the tunnel mouth; ' + t.pos());
t.go('up'); t.mash(() => t.idle(), 3000);
at('quarry_tunnels');
assert.ok(t.travel(3, 5, 600) || t.ow.map.id === 'quarry_tunnels_2', 'down the stairs; ' + t.pos());
t.mash(() => t.idle(), 3000);
at('quarry_tunnels_2');
heal();
assert.ok(use(20, 6), 'face Boulderina; ' + t.pos());
press('gusset_back', 120000);
assert.ok(st.flags.herd_done && st.bag.spare_tape && st.party.some((k) => k.species === 'boulderina'), 'herd settled, Boulderina joins, the spare tape');

// ---- the Terra Salon: three track switches, two Miners, Gusset
heal();
ow.loadMap('bobbin_quarry', 17, 11, 'up', { noEnter: false }); t.tick(10);
assert.ok(!t.ow.find('appr').visible, 'the apprentice steps aside');
ow.loadMap('quarry_salon', 5, 14, 'up', { noEnter: true }); t.tick(5);
const tm = () => t.ow.map;
assert.ok(tm().solid(2, 12) && !tm().solid(10, 12), 'switch 1 points into the siding');
assert.ok(use(11, 14), 'lever 1; ' + t.pos());
press('sal4_a1', 6000);
assert.ok(!tm().solid(2, 12) && tm().solid(10, 12), 'switch 1 now points the way on');
assert.ok(t.travel(2, 11, 600), 'through switch 1; ' + t.pos());
heal();
assert.ok(use(1, 11), 'lever 2; ' + t.pos());
press('sal4_a2', 60000);
assert.ok(!tm().solid(7, 8), 'switch 2 points the way on');
assert.ok(t.travel(7, 7, 600), 'through switch 2; ' + t.pos());
heal();
assert.ok(use(11, 5), 'lever 3; ' + t.pos());
press('sal4_a3', 60000);
assert.ok(!tm().solid(4, 4), 'switch 3 points the way on');
heal();
assert.ok(use(4, 2), 'to Gusset; ' + t.pos());
press('badge4', 120000);
assert.ok(st.badges[3] && st.bag.disc_shove && st.bag.linen_thread, 'Terra Button, Disc: Shove, Linen Thread');

// ---- Shove: the loose rock in the chamber's north doorway slides into the geode alcove
ow.loadMap('quarry_tunnels_2', 12, 8, 'up', { noEnter: true }); t.tick(5);
assert.ok(tm().solid(12, 7), 'the loose rock blocks the doorway');
t.hold(t.keyFor('up'), 30); t.mash(() => t.idle(), 2000);
assert.ok(!tm().solid(12, 7), 'the rock moved; ' + t.pos());
assert.ok(Object.keys(st.flags).some((k) => k.startsWith('shove:quarry_tunnels_2:')), 'the shove is saved');
console.log('chapter 4 OK');
