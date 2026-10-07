// Chapter 2, played end to end by a headless bot from the chapter-1 end state:
// Thimble bridge guards -> Route 2 (inspectors on the bridge) -> Gingham Woods -> Spindle Shrine incident (Crease, Soft Rinse)
// -> Hemline: Tea House heal, Salon 2, Bryn (Buzz Button + Everspool silk) -> save and load back in Hemline.
import assert from 'node:assert/strict';
import { boot } from './harness.mjs';

const t = boot(2024);
const { NP, G } = t;
const ow = NP.quickStart('Ren', 'f');
const st = NP.state;
Object.assign(st.flags, { intro_done: true, has_starter: true, tomo_left_lab: true, rival1_done: true, rival2_done: true, badge1: true, presser1_done: true });
st.starter = 'konko'; st.rivalStarter = 'ottopi';
st.badges = [true];
st.party.push(NP.Kigu.create('konko', 30, { ot: 'Ren' }), NP.Kigu.create('ottopi', 30, { ot: 'Ren' }));
st.bag.bond_spool = 5; st.bag.snack_cake = 5;
st.healPoint = { map: 'tea_house', spawn: 'door' };
ow.msg.close(); ow.tasks = [];
ow.loadMap('thimble', 12, 19, 'up', { noEnter: true });
t.tick(5);

const at = (map) => assert.equal(t.ow.map.id, map, 'expected to be in ' + map + ', at ' + t.pos());
const faceUp = () => { t.tap('up'); t.tick(6); };
const t0 = Date.now();

// ---- Thimble: the Presser guards stand down once, then the road to Route 2 is open
assert.ok(t.travel(22, 4), 'walk up to the guards; at ' + t.pos());
faceUp(); t.tap('a');
assert.ok(t.mash(() => t.idle() && st.flags.route2_open, 6000), 'guards stand down');
assert.ok(t.ow.find('guard1').hidden && t.ow.find('guard2').hidden, 'guards are gone from the road');
assert.ok(t.travel(22, 0, 200), 'walk the road north');
at('route2');

// ---- Route 2: south bank, then the inspectors on the bridge
assert.ok(t.travel(10, 27, 600), 'reach the bridge; at ' + t.pos());
assert.ok(!st.flags.route2_insp_done, 'inspectors have not fired yet');
t.go('up');
assert.ok(t.mash(() => t.idle() && st.flags.route2_insp_done, 30000), 'inspectors scene resolves');
assert.ok(t.travel(10, 0, 800), 'cross the bridge and the north bank; at ' + t.pos());
at('gingham_woods');
console.log('route 2 done', Date.now() - t0, 'ms; party', st.party.map((k) => k.species + k.level + ':' + k.hp).join(' '));

// ---- Gingham Woods: through the maze to the shrine
assert.ok(t.travel(14, 0, 1500), 'cross the woods; at ' + t.pos());
at('spindle_shrine');
assert.ok(!st.flags.shrine1_done);
assert.equal(t.ow.map.def.stamps.find((s) => s.id === 'shrine').variant, 'pressed', 'the shrine looks pressed before the incident');
assert.equal(t.ow.find('cocoona').look, 'cocoona_pressed');

// ---- the incident: Pin, Welt, then Pleat Crease; Mimi's Soft Rinse
assert.ok(t.travel(9, 13, 100), 'walk up to the clearing; at ' + t.pos());
t.go('up');
assert.ok(t.mash(() => t.idle() && st.flags.shrine1_done, 60000), 'shrine incident resolves; flags ' + JSON.stringify(st.flags));
assert.ok(st.flags.shrine_pin && st.flags.shrine_welt && st.flags.rinse_done);
assert.equal(t.ow.find('cocoona').look, 'cocoona', 'the Soft Rinse worked');
assert.ok(!t.ow.find('crease').visible, 'Crease has gone');
assert.equal(t.ow.map.placements.find((p) => p.id === 'shrine').variant, 'default', 'the shrine looks like itself again');
// the Cocoona now rests your Kigu
st.party[0].hp = 1;
assert.ok(t.travel(9, 10), 'step up to the Cocoona; at ' + t.pos());
faceUp(); t.tap('a');
assert.ok(t.mash(() => t.idle(), 5000));
assert.equal(st.party[0].hp, NP.Kigu.maxHp(st.party[0]), 'the Cocoona healed the party');
console.log('shrine done', Date.now() - t0, 'ms');

// ---- Hemline
assert.ok(t.travel(19, 9, 200), 'take the east road; at ' + t.pos());
at('hemline');
st.party[0].hp = 1;
assert.ok(t.travel(5, 7, 300), 'to the Tea House door; at ' + t.pos());
at('hemline_tea');
assert.ok(t.travel(4, 4));
faceUp(); t.tap('a');
assert.ok(t.mash(() => t.idle(), 5000), 'tea script done');
assert.equal(st.party[0].hp, NP.Kigu.maxHp(st.party[0]), 'healed at the Tea House');
assert.equal(st.healPoint.map, 'hemline_tea');
assert.ok(t.travel(4, 8), 'tea house exit');
at('hemline');

// ---- Salon 2: Wren, Dov, then Bryn
assert.ok(t.travel(13, 6, 300), 'to the Salon door; at ' + t.pos());
at('hemline_salon');
assert.ok(t.travel(4, 4, 800), 'walk to Bryn; at ' + t.pos());
faceUp(); t.tap('a');
assert.ok(t.mash(() => t.idle() && st.flags.badge2, 60000), 'Bryn fight resolves; flags ' + JSON.stringify(st.flags));
assert.ok(t.mash(() => t.idle(), 4000));
assert.ok(st.badges[1], 'got the Buzz Button');
assert.equal(st.bag.everspool_silk, 1, 'Bryn gave a length of Everspool silk');
assert.ok(st.flags.tr_hemline_salon_salon_t1 && st.flags.tr_hemline_salon_salon_t2, 'both Salon Tailors beaten');

// ---- out of the Salon, save, load: still in Hemline with everything kept
assert.ok(t.travel(4, 11, 300), 'salon exit');
at('hemline');
assert.ok(NP.State.save());
const back = NP.State.load();
assert.equal(back.pos.map, 'hemline');
assert.ok(back.badges[0] && back.badges[1]);
assert.ok(back.flags.route2_open && back.flags.shrine1_done && back.flags.route2_insp_done && back.flags.badge2);
assert.equal(back.bag.everspool_silk, 1);
// the way back: Thimble keeps its guards gone and the road to Route 2 stays open
t.ow.loadMap('thimble', 22, 1, 'down'); t.tick(40);
assert.ok(!t.ow.find('guard1').visible && !t.ow.find('guard2').visible, 'the bridge guards stay gone');
console.log('chapter2 ok in', Date.now() - t0, 'ms; badges', st.badges, 'party', st.party.map((k) => k.species + k.level).join(' '), 'money', st.money);
