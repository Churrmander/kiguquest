// Chapter 3, played end to end by a headless bot from the chapter-2 end state:
// Hemline -> Route 3 -> Seamstead (Rival #3) -> Crisp & Co. (Linens, Uniforms, Hats: Staff Pass + locked door) -> Pressing Floor
// (Serge, Damask) -> Volt Salon switch puzzle (Zip, Volt Button). Also checks the gates are closed until earned.
import assert from 'node:assert/strict';
import { boot } from './harness.mjs';

const t = boot(3033);
const { NP } = t;
const ow = NP.quickStart('Ren', 'f');
const st = NP.state;
Object.assign(st.flags, { intro_done: true, has_starter: true, tomo_left_lab: true, rival1_done: true, rival2_done: true, badge1: true, presser1_done: true, route2_open: true, route2_insp_done: true, shrine1_done: true, badge2: true });
st.starter = 'konko'; st.rivalStarter = 'ottopi';
st.badges = [true, true];
st.party.push(NP.Kigu.create('konko', 55, { ot: 'Ren' }), NP.Kigu.create('ottopi', 55, { ot: 'Ren' }), NP.Kigu.create('sprubun', 55, { ot: 'Ren' }));
st.bag.bond_spool = 5; st.bag.snack_cake = 5;
st.healPoint = { map: 'tea_house', spawn: 'door' };
ow.msg.close(); ow.tasks = [];
ow.loadMap('hemline', 25, 12, 'right', { noEnter: true });
t.tick(5);
const at = (map) => assert.equal(t.ow.map.id, map, 'expected ' + map + ', at ' + t.pos());
const faceUp = () => { t.tap('up'); t.tick(6); };

// ---- every Chapter 3 map builds and links up
for (const id of ['route3', 'seamstead', 'seamstead_tea', 'seamstead_store', 'seamstead_salon', 'crisp_1', 'crisp_2', 'crisp_3', 'crisp_b1']) assert.ok(NP.maps[id], 'map ' + id);

// ---- Route 3 -> Seamstead
assert.ok(t.travel(26, 11, 200), 'east edge of Hemline; ' + t.pos());
t.go('right'); t.go('right');
t.mash(() => t.idle(), 3000);
at('route3');
assert.ok(t.travel(30, 11, 1500), 'cross Route 3; ' + t.pos());
t.go('right'); t.mash(() => t.idle(), 4000);
at('seamstead');

// ---- Rival #3 on the plaza
t.travel(11, 14, 400);
assert.ok(t.mash(() => t.idle() && st.flags.rival3_done, 60000), 'rival 3 fight; flags ' + JSON.stringify(st.flags));

// ---- the Salon is dark: Pressers on the lane until the raid is done
assert.ok(!t.ow.find('dark1').hidden && !t.ow.find('dark2').hidden, 'salon lane is blocked before the raid');

// ---- Crisp & Co.: Linens -> Uniforms -> Hats
const press = (key, ms) => assert.ok(t.mash(() => t.idle() && (typeof key === 'function' ? key() : st.flags[key]), ms || 60000), 'timeout ' + key + ' at ' + t.pos());
assert.ok(t.travel(18, 23, 600), 'to the Crisp & Co. door; ' + t.pos());
t.go('up'); t.mash(() => t.idle(), 3000); at('crisp_1');
assert.ok(t.travel(10, 3, 300), 'cross Linens; ' + t.pos());
t.mash(() => t.idle(), 5000);
t.go('up'); t.mash(() => t.idle(), 3000);
at('crisp_2');
assert.ok(t.travel(12, 3, 300), 'cross Uniforms; ' + t.pos());
t.mash(() => t.idle(), 5000);
t.go('up'); t.mash(() => t.idle(), 3000);
at('crisp_3');

// the lock holds until the Staff Pass is in the bag
assert.ok(!st.bag.staff_pass);
assert.ok(t.travel(11, 6, 300), 'to the locked door; ' + t.pos());
t.mash(() => t.idle(), 5000);
t.tap('down'); t.tick(6); t.tap('a'); t.mash(() => t.idle(), 2000);
assert.ok(!st.flags.crisp_lock_open, 'the door stays shut without a pass');
assert.ok(t.ow.map.solid(11, 7), 'the lock is solid');
// the manager hands over the pass
assert.ok(t.travel(4, 6, 300), 'to the manager; ' + t.pos());
t.tap('left'); t.tick(6); t.tap('a');
t.mash(() => t.idle() && st.bag.staff_pass, 4000);
assert.ok(st.bag.staff_pass, 'got the Staff Pass');
assert.ok(t.travel(11, 6, 300), 'back to the door; ' + t.pos());
t.tap('down'); t.tick(6); t.tap('a'); t.mash(() => t.idle() && st.flags.crisp_lock_open, 3000);
assert.ok(st.flags.crisp_lock_open && !t.ow.map.solid(11, 7), 'the Staff Pass opens the door');
assert.ok(t.travel(11, 8, 100), 'through the door; ' + t.pos());
t.go('right'); t.mash(() => t.idle(), 3000);
at('crisp_b1');

// ---- the Pressing Floor
assert.ok(t.travel(7, 5, 300), 'down the aisle; ' + t.pos());
t.go('down');
press('crisp_done', 120000);
assert.ok(st.flags.crisp_serge_done && st.flags.damask_tea && st.flags.crisp_done);

// ---- the Volt Salon: the lane opens, the switch puzzle gates the stage
ow.loadMap('seamstead', 17, 9, 'up', { noEnter: false }); t.tick(10);
assert.ok(t.ow.find('dark1').hidden && t.ow.find('dark2').hidden, 'Pressers leave the Salon lane');
ow.loadMap('seamstead_salon', 5, 12, 'up', { noEnter: true }); t.tick(5);
const tm = t.ow.map;
assert.ok(tm.solid(5, 9) && tm.solid(5, 5), 'both barriers are up at first');
t.travel(2, 12, 100);
t.tap('left'); t.tick(6); t.tap('a'); t.mash(() => t.idle(), 4000);
t.mash(() => t.idle() && st.flags.sal3_g1, 3000);
assert.ok(st.flags.sal3_g1 && !tm.solid(5, 9), 'lever one opens the first barrier');
assert.ok(tm.solid(5, 5), 'second barrier still up');
ow.loadMap('seamstead_salon', 9, 7, 'right', { noEnter: true }); t.tick(5);
t.tap('right'); t.tick(6); t.tap('a'); t.mash(() => t.idle() && st.flags.sal3_g2, 4000);
assert.ok(st.flags.sal3_g2 && !t.ow.map.solid(5, 5), 'lever two opens the second barrier');

// ---- Zip
assert.ok(t.travel(5, 4, 300), 'to Zip; ' + t.pos());
t.tap('up'); t.tick(6); t.tap('a');
press('badge3', 120000);
assert.ok(st.badges[2] && st.bag.zip_cable, 'Volt Button + Zip Cable');
console.log('chapter 3 OK');
