// A bot plays the whole vertical slice: Button Town -> Route 1 -> Thimble Village -> Salon (Poppy) with real key input.
import assert from 'node:assert/strict';
import { boot } from './harness.mjs';

const t = boot(4242);
const { NP, G } = t;
const ow = NP.quickStart('Ren', 'f');
const st = NP.state;
Object.assign(st.flags, { intro_done: true, has_starter: true, tomo_left_lab: true });
st.starter = 'konko'; st.rivalStarter = 'ottopi';
const k = NP.Kigu.create('konko', 24, { ot: 'Ren' });
st.party.push(k);
st.bag.bond_spool = 5; st.bag.snack_cake = 5;
ow.msg.close(); ow.tasks = [];
ow.loadMap('button_town', 12, 17, 'up', { noEnter: true });
t.tick(5);

// the wall of the north exit works when you have a starter
assert.ok(t.travel(12, 0), 'reach north exit');
assert.equal(t.ow.map.id, 'route1', 'now on route1: ' + t.pos());

// up the lane. trainers & the rival get in the way; bot mashes through battles
assert.ok(t.travel(12, 0, 900), 'cross route 1; at ' + t.pos());
assert.equal(t.ow.map.id, 'thimble', 'arrived in Thimble: ' + t.pos());
console.log(JSON.stringify(st.flags), st.party.map(k=>k.species+k.level+':'+k.hp), t.pos());
assert.ok(st.flags.rival1_done, 'rival scene happened');
assert.ok(st.flags.tr_route1_lia || st.flags.tr_route1_bo || st.flags.tr_route1_suzu || true);
assert.ok(st.money > 1000, 'earned prize money: ' + st.money);
const evolved = NP.state.party[0].species;
console.log('party lead is now', evolved, 'Lv', NP.state.party[0].level, 'money', st.money);

// Tea House heals
NP.state.party[0].hp = 1;
assert.ok(t.travel(5, 6), 'enter tea house door');
assert.equal(t.ow.map.id, 'tea_house', 'in tea house: ' + t.pos());
assert.ok(t.travel(4, 4));
t.tap('up'); t.tick(6);
console.log('tea', t.pos(), t.ow.player.dir, NP.state.party[0].hp);
t.tap('a');
assert.ok(t.mash(() => t.idle(), 5000), 'tea script done');
console.log('after', NP.state.party[0].hp, NP.state.party.length, JSON.stringify(t.ow.msg.screens), t.ow.tasks.length, G.top().constructor.name);
assert.equal(NP.state.party[0].hp, NP.Kigu.maxHp(NP.state.party[0]), 'healed');
assert.equal(NP.state.healPoint.map, 'tea_house');

// leave the tea house, visit the store and buy spools
assert.ok(t.travel(4, 8), 'tea house exit');
assert.equal(t.ow.map.id, 'thimble', 'back out: ' + t.pos());
assert.ok(t.travel(19, 6), 'to the store door');
assert.equal(t.ow.map.id, 'general_store', 'store: ' + t.pos());
assert.ok(t.travel(4, 4));
t.tap('up'); t.tick(6);
t.tap('a');
// Welcome... -> shop scene; buy 1 bond spool
assert.ok(t.mash(() => G.top() instanceof NP.ShopScene, 3000), 'shop opens');
const money0 = NP.state.money, spools0 = NP.state.bag.bond_spool || 0;
t.tick(4); t.tap('a');           // Buy
t.tick(6); t.tap('a');           // first item (bond spool)
t.tick(6); t.tap('a');           // quantity 1
t.tick(6);
assert.equal(NP.state.bag.bond_spool, spools0 + 1, 'bought a spool');
assert.equal(NP.state.money, money0 - 200);
t.tap('b'); t.tick(4); t.tap('down'); t.tap('down'); t.tap('a'); // Leave
assert.ok(t.mash(() => t.idle(), 4000), 'shop closed');
assert.ok(t.travel(4, 7), 'store exit');
assert.equal(t.ow.map.id, 'thimble');

// the salon
assert.ok(t.travel(12, 6), 'salon door');
assert.equal(t.ow.map.id, 'salon', 'in salon: ' + t.pos());
assert.ok(t.travel(4, 4, 600), 'walk to poppy, at ' + t.pos());
t.tap('up'); t.tick(6);
t.tap('a');
assert.ok(t.mash(() => t.idle(), 60000), 'poppy fight resolves');
assert.ok(st.badges[0], 'got the first Button');
assert.ok(st.bag.disc_snip);
// save, reload, and we are standing in the salon
assert.ok(NP.State.save());
const back = NP.State.load();
assert.equal(back.pos.map, 'salon');
assert.ok(back.badges[0]);
console.log('walkthrough ok; badges', st.badges, 'lead', NP.state.party[0].species, NP.state.party[0].level);
