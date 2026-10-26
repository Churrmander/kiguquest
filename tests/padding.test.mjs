// The Chapter 1 padding beats, played by a headless bot: the first morning at home (sheets, kite, tree house promise), Prof. Bobbin's
// parcel errand (a sleepy wild Chirpadee, the Town Map), Basting Green's Tidy Day parade, Ribbon Loop's Tailors and leaf-munching Silkie, and
// Poppy's pre-Salon quest (her yarn basket and both apprentices). Each gate is checked to be a nudge with a reason, never a dead end.
import assert from 'node:assert/strict';
import { boot } from './harness.mjs';

const t = boot(5150);
const { NP, G } = t;
const said = [];
const at = (map) => assert.equal(t.ow.map.id, map, 'expected ' + map + ', at ' + t.pos());
const settle = (max = 6000) => assert.ok(t.mash(() => t.idle(), max), 'scene settles; at ' + t.pos());

// ---- a new game wakes up at home
NP.state = NP.State.fresh('Ren', 'f');
const ow = new NP.Overworld();
G.reset(ow);
const p0 = NP.state.pos;
ow.loadMap(p0.map, p0.x, p0.y, p0.dir);
const st = NP.state;
const begin = ow.msg.begin.bind(ow.msg);
ow.msg.begin = (txt, o) => { said.push(txt); return begin(txt, o); };
at('player_house');
settle();
assert.ok(st.flags.woke, 'Mom woke us up');
assert.ok(said.some((s) => /peg the sheets/.test(s)), 'Mom asks for help with the sheets');

// out of the door: someone calls from behind the house
assert.ok(t.travel(4, 8), 'out of the house');
settle();
at('button_town');
assert.ok(st.flags.kite_call && said.some((s) => /Round the back/.test(s)), 'the rival calls from the washing line');

// trying the lab first is a friendly bounce, not a wall
assert.ok(t.travel(17, 9, 400), 'to the lab door');
t.go('up');
settle();
at('button_town');
assert.ok(said.some((s) => /you('re| are) early/.test(s)), 'Bobbin is not ready yet');
assert.ok(!st.flags.intro_done, 'the lab intro waits for the morning');

// the washing line: the kite, the tree house promise, the race
assert.ok(t.travel(7, 4, 400), 'behind the house');
t.tap('up'); t.tick(4); t.tap('a');
settle(8000);
assert.ok(st.flags.morning_done, 'the morning scene finished');
assert.ok(said.some((s) => /Every Salon, together/.test(s)), 'the tree house promise');
assert.ok(!t.ow.find('tomo_bt').visible, 'the rival raced off to the lab');

// ---- the lab: the intro and the starters now play as before
assert.ok(t.travel(17, 8, 400), 'to the lab door');
settle();
at('lab');
assert.ok(st.flags.intro_done, 'lab intro');
assert.ok(t.travel(4, 6, 200), 'to the Konko spool');
t.tap('up'); t.tick(6); t.tap('a');
settle(8000);
assert.ok(st.flags.has_starter && st.party.length === 1);
assert.ok(said.some((s) => /parcel/.test(s)), 'Bobbin asks for her parcel');

// out of the lab: the north road waits for the parcel, with a pointer to the pier
assert.ok(t.travel(5, 11, 200));
settle();
at('button_town');
assert.ok(t.travel(12, 3, 400));
t.go('up');
settle();
assert.ok(t.ow.player.y > 2, 'turned back at the north road');
assert.ok(said.some((s) => /pier/.test(s)), 'the townsfolk point at the pier');

// the crate on the pier: a sleepy Chirpadee, a wild battle, the parcel
st.party[0].level = 12; st.party[0].hp = NP.Kigu.maxHp(st.party[0]);
assert.ok(t.travel(13, 19, 400), 'to the pier crate');
t.tap('down'); t.tick(4); t.tap('a');
assert.ok(t.mash(() => G.top() instanceof NP.BattleScene, 3000), 'the Chirpadee battle starts');
assert.ok(t.mash(() => G.top() === t.ow && t.idle() && st.flags.parcel_got, 20000), 'the battle ends and the parcel is ours');

// back to Bobbin: the Town Map, a heal, and the road north opens
assert.ok(t.travel(17, 8, 400));
settle();
at('lab');
st.party[0].hp = 1;
assert.ok(t.travel(6, 3, 200), 'up to Bobbin');
t.tap('left'); t.tick(4); t.tap('a');
settle(8000);
assert.ok(st.flags.errand_done && st.bag.town_map, 'got the Town Map');
assert.ok(st.bag.exp_share, 'Bobbin hands over the Exp Share with the Town Map');
assert.equal(st.party[0].hp, NP.Kigu.maxHp(st.party[0]), 'Bobbin patched up the partner');
assert.ok(t.travel(5, 11, 200));
settle();
assert.ok(t.travel(12, 0, 400), 'north exit');
settle();
at('route1');
console.log('morning + parcel ok');

// ---- Basting Green: Tidy Day holds the north road; Ribbon Loop is the way round
st.party[0].level = 30; st.party[0].hp = NP.Kigu.maxHp(st.party[0]);
t.ow.loadMap('basting_green', 11, 19, 'up');
t.tick(4);
assert.ok(t.travel(11, 12, 300));
settle();
assert.ok(st.flags.tidy_seen && said.some((s) => /Participation is optional/.test(s)), 'Tidy Day scene');
assert.ok(!t.travel(11, 0, 200), 'the parade fills the north road');
assert.ok(said.some((s) => /Ribbon Loop/.test(s)), 'and someone points at Ribbon Loop');

// Ribbon Loop: a Tailor on the lane spots you; the leaf-munching Silkie is a one-off meeting
t.ow.loadMap('ribbon_loop', 7, 20, 'right', { noEnter: true });
t.tick(4);
t.go('right', 2);   // returns false once Tam's battle takes over the screen
assert.ok(t.mash(() => t.idle() && st.flags.tr_ribbon_loop_tam, 30000), 'Hiker Tam battles');
t.ow.loadMap('ribbon_loop', 5, 4, 'up', { noEnter: true });
t.tick(4);
t.tap('a');
assert.ok(t.mash(() => G.top() instanceof NP.BattleScene, 3000), 'saying hello to the Silkie starts a battle');
assert.ok(t.mash(() => G.top() === t.ow && t.idle(), 20000));
assert.ok(st.flags.rl_silkie);

// into Thimble by the east gate: the parade moves on, and the main road is open both ways
assert.ok(t.travel(0, 4, 300));
settle();
at('thimble');
assert.ok(st.flags.thimble_reached);
assert.ok(t.travel(12, 21, 400), 'south road');
settle();
at('basting_green');
assert.ok(!t.ow.find('tack').visible && !t.ow.find('march1').visible, 'the parade has gone');
assert.ok(t.travel(11, 0, 300), 'north road open');
settle();
at('thimble');
console.log('basting green + ribbon loop ok');

// ---- Poppy: the yarn basket first, then Ren and Noa
st.flags.rival2_done = true;
t.ow.loadMap('salon', 4, 4, 'up', { noEnter: true });
t.tick(4);
t.tap('a');
settle();
assert.ok(st.flags.poppy_asked && !st.badges[0], 'Poppy asks for her basket instead of battling');
t.ow.loadMap('thimble', 10, 16, 'down', { noEnter: true });
t.tick(4);
t.tap('a');
settle();
assert.ok(st.flags.yarn_basket, 'found the yarn basket');
t.ow.loadMap('salon', 4, 4, 'up', { noEnter: true });
t.tick(4);
t.tap('a');
settle();
assert.ok(st.flags.poppy_basket_back && !st.badges[0], 'basket back, but the apprentices come first');
st.flags.tr_salon_salon_t1 = st.flags.tr_salon_salon_t2 = true;
t.tap('a');
assert.ok(t.mash(() => t.idle() && st.badges[0], 60000), 'and now Poppy battles');
console.log('padding ok');
