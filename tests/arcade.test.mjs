// The Shibuyarn prize arcade (src/game/arcade/): every cabinet plays headless with its bot and ends, coins and tickets move the
// right way, the brownout keeps the powered cabinets dark, the counters sell what they should, the new held items work in battle,
// and the arcade room links up and every cabinet can be reached.
import assert from 'node:assert/strict';
import { boot } from './harness.mjs';

const t = boot(4242);
const { NP } = t;
const AR = NP.arcade;
const G = NP.Game;

// ---- every cabinet plays to the end with its bot (bots stop pressing after botFrames, so even a perfect run ends)
NP.state = NP.State.fresh('Ren', 'f');
for (const id of ['cab_1', 'cab_2', 'cab_3', 'platformer', 'claw']) {
  const def = AR.games[id];
  assert.ok(def && def.title, 'cabinet ' + id);
  NP.rng.seed(99);
  const g = def.create();
  let f = 0;
  while (!g.over && f < 30000) {
    const keys = f < (def.botFrames || 6000) ? def.bot(g, f) : [];
    for (const b of NP.Input.BUTTONS) NP.Input.set(b, keys.indexOf(b) >= 0);
    NP.Input.update();
    g.update();
    if (f % 97 === 0) g.draw(G.fb, f);
    f++;
  }
  for (const b of NP.Input.BUTTONS) NP.Input.set(b, false);
  assert.ok(g.over, id + ' ended (frames ' + f + ')');
  if (id !== 'claw') assert.ok(g.score > 0, id + ' scored');
  assert.ok(def.tickets(g.score, g) >= 0, id + ' tickets');
  console.log('  ' + id + ': ' + f + ' frames, score ' + g.score + ', tickets ' + def.tickets(g.score, g));
}

// ---- the claw: a centred grab wins a fair share of the time, a sloppy one rarely does
{
  const def = AR.games.claw;
  let wins = 0;
  for (let s = 1; s <= 60; s++) {
    NP.rng.seed(s); AR.pile = null;
    const g = def.create();
    for (let f = 0; f < 3000 && !g.over; f++) { const k = def.bot(g, f); for (const b of NP.Input.BUTTONS) NP.Input.set(b, k.indexOf(b) >= 0); NP.Input.update(); g.update(); }
    if (g.prize) { wins++; def.onPrize(g.prize); }
  }
  for (const b of NP.Input.BUTTONS) NP.Input.set(b, false);
  assert.ok(wins > 10 && wins < 45, 'well-aimed claw wins ' + wins + '/60');
  assert.ok(AR.plushList().length > 0, 'plushes are counted for the shelf');
}

// ---- in the room, through the real overworld: coins, gating, the counters
const ow = NP.quickStart('Ren', 'f');
const st = NP.state;
st.party.push(NP.Kigu.create('konko', 40, { ot: 'Ren' }));
ow.msg.close(); ow.tasks = [];
ow.loadMap('shibuyarn_arcade', 7, 10, 'up', { noEnter: true });
t.tick(5);
const def = NP.maps.shibuyarn_arcade;
assert.ok(def.spawns.door, 'door spawn');
assert.ok(def.warps.some((w) => w.to === (NP.maps.shibuyarn ? 'shibuyarn' : 'seamstead')), 'exit to Shibuyarn (Seamstead until the city is merged in)');

// every cabinet / counter interact tile is reachable from the tile in front of it
const tm = ow.map;
const reach = new Set(['7,10']), q = [[7, 10]];
while (q.length) {
  const [x, y] = q.shift();
  for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
    const nx = x + dx, ny = y + dy, k = nx + ',' + ny;
    if (reach.has(k) || tm.solid(nx, ny) || ow.actorAt(nx, ny, ow.player)) continue;
    reach.add(k); q.push([nx, ny]);
  }
}
for (const e of def.interact) assert.ok(reach.has(e.x + ',' + (e.y + 1)), 'stand in front of ' + e.note + ' at ' + e.x + ',' + e.y);

// drive c.arcade() through an interact entry so the real script context is used
function useTile(x, y) {
  const e = def.interact.find((i) => i.x === x && i.y === y);
  ow.runScript(e.script, null);
}

// brownout: cab_2 is dark and does not take coins
st.flags[AR.LIGHTS_FLAG] = false;
AR.st().coins = 10;
useTile(2, 2);
t.tick(5);
assert.ok(!(G.top() instanceof AR.CabinetScene), 'cab_2 is dark during the brownout');
t.mash(() => t.idle(), 2000);
assert.equal(AR.st().coins, 10, 'a dark cabinet takes no coins');

// Moth Patrol runs during the brownout: insert coins, play, step away
useTile(1, 2);
t.tick(3);
const cab = G.top();
assert.ok(cab instanceof AR.CabinetScene && cab.id === 'cab_1', 'Moth Patrol opens');
t.tap('a');
assert.equal(cab.phase, 'play', 'playing after a coin');
assert.equal(AR.st().coins, 7, 'three coins went in');
cab.game.lives = 0; cab.game.score = 600; cab.game.over = true;
t.tick(60);
assert.equal(cab.phase, 'results');
t.tick(80); t.tap('a');
assert.equal(AR.st().tickets, 20, 'score 600 pays 20 tickets');
assert.equal(AR.st().best.cab_1, 600, 'best score saved');
t.tap('b');
t.mash(() => t.idle(), 2000);
assert.ok(!(G.top() instanceof AR.CabinetScene), 'stepped away');

// not enough coins: the cabinet says so and stays on its title screen
AR.st().coins = 1;
useTile(1, 2);
t.tick(3);
t.tap('a');
assert.equal(G.top().phase, 'attract', 'no game without coins');
assert.ok(/coins/.test(G.top().note), 'tells you to buy coins');
t.tap('b');
t.mash(() => t.idle(), 2000);

// the rival's free go (Chapter 5 hook): c.arcade('claw', { free: 1 }) needs no coins
ow.runScript(function* (c) { yield* c.arcade('claw', { free: 1 }); }, null);
t.tick(4);
t.tap('a');
assert.equal(G.top().phase, 'play', 'free go starts');
assert.equal(AR.st().coins, 1, 'free go cost nothing');
while (G.top() instanceof AR.CabinetScene && G.top().phase === 'play') t.tick(1);
t.tick(80); t.tap('a'); t.tap('b');
t.mash(() => t.idle(), 2000);

// lights on: the powered cabinets work
st.flags[AR.LIGHTS_FLAG] = true;
assert.ok(AR.working('cab_2') && AR.working('cab_3') && AR.working('platformer'), 'cabinets powered');

// coin counter: 10 coins for $200
st.money = 1000;
useTile(11, 4);
t.mash(() => ow.menus && ow.menus.length > 0, 3000);
t.tap('a'); // first bundle: 10 coins
t.mash(() => ow.menus && ow.menus.length > 0, 3000);
t.tap('down'); t.tap('down'); t.tap('down'); t.tap('a'); // No thanks
t.mash(() => t.idle(), 3000);
assert.equal(st.money, 800, 'paid $200');
assert.equal(AR.st().coins, 11, 'got 10 coins');

// prize counter: tickets for an Expert Belt and a card design
AR.st().tickets = 1000;
useTile(13, 4);
t.mash(() => G.top() instanceof AR.PrizeScene, 3000);
const ps = G.top();
const tabs = AR.catalogue();
assert.ok(tabs.find((x) => x.name === 'Type Pins').list.length === 17, '17 type pins');
assert.equal(!!tabs.find((x) => x.name === 'Kigu'), !!NP.data.species[AR.CABBI], 'Cabbi listed only when the species exists');
const belt = tabs[0].list.findIndex((p) => p.id === 'expert_belt');
for (let i = 0; i < belt; i++) t.tap('down');
t.tap('a'); t.tick(2); t.tap('a'); // Yes
assert.equal(st.bag.expert_belt, 1, 'Expert Belt bought');
assert.equal(AR.st().tickets, 300, '700 tickets spent');
const cardTab = tabs.findIndex((x) => x.name === 'Card designs');
for (let i = 0; i < cardTab; i++) t.tap('right');
t.tap('a'); t.tick(2); t.tap('a'); // gingham, 150
assert.ok(AR.st().cards.gingham && AR.st().card === 'gingham', 'gingham card bought and worn');
t.tap('a'); t.tick(2);
assert.match(ps.note, /already/, 'a card design is only sold once');
t.tap('b');
t.mash(() => t.idle(), 3000);

// the Tailor Card draws with the new design and the plush shelf page
{
  const s = new NP.CardScene(); G.push(s); t.tick(3);
  t.tap('right'); t.tick(2);
  assert.equal(s.page, 1, 'plush shelf page');
  t.tap('b'); t.tick(3);
}

// ---- held items in battle
{
  // type pin: Ember moves 20% stronger
  const pin = NP.data.items.pin_ember;
  assert.ok(pin && pin.held.modPower, 'pin_ember exists');
  assert.equal(pin.held.modPower({ move: { type: 'ember' } }, 50), 60, 'Ember Pin +20%');
  assert.equal(pin.held.modPower({ move: { type: 'tide' } }, 50), undefined, 'other types unchanged');
  // expert belt: only super-effective hits
  const belt2 = NP.data.items.expert_belt.held;
  assert.equal(belt2.modDamage({ move: { type: 'tide' }, target: { types: ['ember'] } }, 100), 120, 'super effective +20%');
  assert.equal(belt2.modDamage({ move: { type: 'tide' }, target: { types: ['sprout'] } }, 100), undefined, 'not very effective unchanged');
  // sturdy sash: survive a one-hit knock-out at full HP, then it is gone
  const msgs = [];
  let consumed = false;
  const holder = { hp: 50, maxhp: 50, label: () => 'Konko' };
  const c = { holder, cause: 'hit', battle: { msg: (m) => msgs.push(m), consumeItem: () => { consumed = true; } } };
  assert.equal(NP.data.items.sturdy_sash.held.onDamage(c, 999), 49, 'hangs on with 1 HP');
  assert.ok(consumed && msgs.length, 'sash used up with a message');
  holder.hp = 30;
  assert.equal(NP.data.items.sturdy_sash.held.onDamage(c, 999), undefined, 'no effect below full HP');
  // coin charm doubles Tailor prize money
  st.party[0].item = 'coin_charm';
  assert.equal(AR.moneyBonus(300), 600, 'Coin Charm doubles prize money');
  st.party[0].item = null;
  assert.equal(AR.moneyBonus(300), 300);
}

// ---- dialogue in the room follows the house style: no banned words (text.test covers maps too) and no stub chains
for (const n of def.npcs) assert.ok(n.script || n.say, n.id + ' talks');
console.log('arcade ok');
