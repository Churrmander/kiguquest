// Chapter 6, played end to end by a headless bot from the chapter-5 end state:
// Kite Hill (arrival) -> the balloon post (three letters on foot; the last, from Woolen Peak, goes to the rival) -> Rival #5 and
// Dart in the hangar -> four patches for Dart's balloon, sewn on in the order she calls -> Mimi's flag -> the fan Salon (two fan
// levers, two Pilots, Dart, Gale Button, Disc: Glide) -> over the pass.
import assert from 'node:assert/strict';
import { boot } from './harness.mjs';

const t = boot(6066);
const { NP } = t;
const ow = NP.quickStart('Ren', 'm');
const st = NP.state;
Object.assign(st.flags, { intro_done: true, has_starter: true, tomo_left_lab: true, rival1_done: true, rival2_done: true, badge1: true, presser1_done: true,
  route2_open: true, route2_insp_done: true, shrine1_done: true, badge2: true, rival3_done: true, crisp_done: true, badge3: true, zip_lights: true,
  east_gate_open: true, mimi_camp_done: true, cart_pushed: true, quarry_reached: true, rival4_done: true, herd_done: true, gusset_back: true, badge4: true,
  shibuyarn_arrived: true, kasuri_done: true, rival_claw_done: true, cellar_open: true, tuck_following: true, tuck_out: true, cellar_arc1: true, cellar_arc2: true,
  calender_done: true, shibuyarn_lights: true, lights_scene: true });
st.starter = 'ottopi'; st.rivalStarter = 'konko';
st.badges = [true, true, true, true];
st.party.push(NP.Kigu.create('ottopi', 75, { ot: 'Ren' }), NP.Kigu.create('konko', 75, { ot: 'Ren' }), NP.Kigu.create('sprubun', 75, { ot: 'Ren' }));
st.bag.bond_spool = 5; st.bag.snack_cake = 5; st.bag.disc_shove = 1; st.bag.dune_cocoa = 1;
st.healPoint = { map: 'shibuyarn_tea', spawn: 'door' };
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
const door = (x, y, map) => { assert.ok(t.travel(x, y + 1, 800), 'to the door of ' + map + '; ' + t.pos()); exit('up'); at(map); };
const leave = (x, y) => { assert.ok(t.travel(x, y, 200), 'to the mat; ' + t.pos()); exit('down'); at('kite_hill'); };

for (const id of ['kite_hill', 'kite_hangar', 'kite_post', 'kite_ogi', 'kite_house', 'kite_tea', 'kite_store', 'kite_salon']) assert.ok(NP.maps[id], 'map ' + id);

// ---- arrival
ow.loadMap('kite_hill', 1, 23, 'right', { noEnter: false }); t.tick(5);
t.go('right');
press('kite_arrived', 30000);
assert.ok(t.ow.find('salon_guard').visible, 'the Salon is shut while the balloons are grounded');

// ---- the balloon post: three letters
door(26, 20, 'kite_post');
assert.ok(use(5, 2), 'talk to the postmistress; ' + t.pos());
press('post_started', 30000);
assert.ok(st.bag.post_letters, 'the letters');
leave(4, 6);
door(33, 20, 'kite_ogi');
assert.ok(use(4, 3), 'Mr. Ogi; ' + t.pos());
press('letter_1', 30000);
leave(3, 6);
assert.ok(use(30, 12), 'the knitter on the airfield; ' + t.pos());
press('letter_2', 30000);

// ---- Rival #5 and Dart in the hangar
heal();
door(8, 7, 'kite_hangar');
assert.ok(use(6, 3), 'give the rival the Woolen Peak letter; ' + t.pos());
press('rival5_done', 120000);
assert.ok(st.flags.letter_3 && !st.bag.post_letters, 'the last letter is delivered');
leave(6, 8);

// ---- four patches
heal();
assert.ok(use(15, 12), 'battle Skye; ' + t.pos());
press(() => NP.levels.done({ flag: (k) => !!st.flags[k] }, 'kite_hill', 'kh_pilot'), 60000);
assert.ok(use(15, 13), 'the co-pilot hands over the patch; ' + t.pos());
press('patch_pilot', 30000);
assert.ok(use(3, 11), 'find the goggles in the grass; ' + t.pos());
press('found_goggles', 20000);
assert.ok(use(36, 26), 'return the goggles; ' + t.pos());
press('patch_goggles', 30000);
assert.ok(use(13, 8), 'cheer up the nervous pilot; ' + t.pos());
press('patch_nerves', 30000);
assert.ok(use(20, 26), 'a cocoa for the cold kid; ' + t.pos());
press('patch_cocoa', 30000);

// ---- sew them on in Dart's order (the bot answers the four calls: sky-blue, star, goggles, cocoa), then Mimi's flag
door(8, 7, 'kite_hangar');
const answers = [0, 2, 1, 3];
const choose0 = t.ow.choose;
t.ow.choose = function* () { return answers.length ? answers.shift() : 0; };
assert.ok(use(9, 6), 'take the patches to Dart; ' + t.pos());
press('mimi_flag', 60000);
t.ow.choose = choose0;
assert.ok(st.flags.balloon_fixed && !st.bag.balloon_patches, 'the balloon is patched');
leave(6, 8);
assert.ok(!t.ow.find('salon_guard').visible, 'the Salon opens');
const balloon = t.ow.map.placements.find((p) => p.id === 'balloon' && p.x === 21);
assert.equal(balloon.variant, 'patched', 'Dart\'s balloon is patched on the airfield');

// ---- the fan Salon
heal();
door(29, 7, 'kite_salon');
const tm = () => t.ow.map;
assert.equal(tm().idAt(6, 12), 'fan_w', 'band 1 blows west');
assert.ok(use(3, 13), 'fan lever 1; ' + t.pos());
press('kite_fan1', 10000);
assert.equal(tm().idAt(6, 12), 'fan_e', 'band 1 now blows east');
assert.ok(t.travel(6, 13, 200), 'to the first band; ' + t.pos());
t.go('up'); t.mash(() => t.idle(), 3000);
assert.equal(t.ow.player.x, 13, 'the fans carried you to the east end; ' + t.pos());
t.go('up'); t.go('up'); t.go('up');
t.mash(() => t.idle(), 60000);
heal();
assert.ok(t.ow.player.y <= 9, 'through the gap; ' + t.pos());
assert.ok(use(8, 9), 'fan lever 2; ' + t.pos());
press('kite_fan2', 10000);
assert.equal(tm().idAt(6, 7), 'fan_w', 'band 2 now blows west');
assert.ok(t.travel(10, 8, 200), 'to the second band; ' + t.pos());
t.go('up'); t.mash(() => t.idle(), 3000);
assert.equal(t.ow.player.x, 1, 'the fans carried you to the west end; ' + t.pos());
t.go('up'); t.go('up'); t.go('up');
t.mash(() => t.idle(), 60000);
heal();
assert.ok(use(7, 2), 'to Dart; ' + t.pos());
press('badge5', 120000);
assert.ok(st.badges[4] && st.bag.disc_glide, 'Gale Button and Disc: Glide');

// ---- over the pass
ow.loadMap('kite_hill', 22, 9, 'up', { noEnter: false }); t.tick(5);
assert.ok(t.ow.find('dart_field').visible, 'Dart waits by her balloon');
assert.ok(use(22, 7), 'fly with Dart; ' + t.pos());
press('over_pass', 60000);
console.log('chapter 6 OK');
