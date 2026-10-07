import assert from 'node:assert/strict';
import { boot } from './harness.mjs';

const t = boot(777);
const { NP, G } = t;
const ow0 = NP.quickStart('Ren', 'f');
NP.snd.logging = true;
t.tick(10);
assert.equal(t.ow.map.id, 'lab');
// intro: mash through the professor's talk
assert.ok(t.mash(() => t.idle(), 4000), 'intro finishes');
assert.deepEqual(t.pos(), ['lab', 5, 6]);

// choose Konko (x=4) : go left 1, face up at prop
assert.ok(t.go('left', 1));
assert.deepEqual(t.pos(), ['lab', 4, 6]);
t.tap('up'); // turn up
t.tick(10);
t.tap('a');
assert.ok(t.mash(() => t.idle(), 6000), 'starter scene finishes');
assert.equal(NP.state.party.length, 1);
assert.equal(NP.state.party[0].species, 'konko');
assert.equal(NP.state.starter, 'konko');
assert.equal(NP.state.rivalStarter, 'ottopi');
assert.equal(NP.state.bag.bond_spool, 5);
assert.ok(NP.state.flags.tomo_left_lab);

// leave the lab
t.go('right', 1);
t.go('down', 4);
assert.equal(t.pos()[0], 'lab');
t.go('down', 1);
assert.equal(t.pos()[0], 'button_town', 'exited lab: ' + t.pos());
console.log('slice part 1 ok', t.pos());

// ---- a wild battle played by mashing A (Fight -> first move)
{
  const ow = t.ow;
  const party = NP.state.party;
  const before = party[0].exp;
  ow.spawn((function* () { yield* ow.wildBattle('peepi', 3); })(), 'test');
  t.tick(2);
  assert.ok(t.mash(() => G.top() instanceof NP.BattleScene, 600), 'battle scene appears');
  const bs = G.top();
  assert.ok(t.mash(() => G.top() === ow && t.idle(), 12000), 'battle ends and control returns; top=' + G.top().constructor.name);
  assert.ok(party[0].exp > before || party[0].hp <= 0, 'exp or faint');
  assert.ok(NP.state.dex.seen.peepi, 'seen registered');
}

// ---- befriending: Bag -> Spools -> Bond Spool
{
  const ow = t.ow;
  NP.State.healAll();
  NP.state.party[0].hp = 30; // plenty
  NP.state.bag.master_spool = 1;
  NP.state.items_before = NP.state.bag.master_spool;
  ow.spawn((function* () { yield* ow.wildBattle('nibbi', 3); })(), 'test');
  assert.ok(t.mash(() => G.top() instanceof NP.BattleScene, 600));
  // wait for the action menu: the menu is shown when menus array non-empty
  const bs = G.top();
  assert.ok(t.mash(() => bs.menus.length > 0, 2000), 'action menu appears');
  t.tap('right'); // Bag
  t.tap('a');
  t.tick(5);
  assert.ok(G.top() instanceof NP.BagScene, 'bag opened in battle');
  t.tap('right'); // spools pocket
  t.tick(3);
  // move cursor to the master spool (last in list)
  const bag = G.top();
  const items = bag.list();
  const idx = items.findIndex((i) => i.id === 'master_spool');
  for (let i = 0; i < idx; i++) t.tap('down');
  t.tap('a'); t.tick(4); t.tap('a'); // Use
  assert.ok(t.mash(() => G.top() === ow && t.idle(), 12000), 'befriend flow ends');
  assert.ok(NP.state.party.some((k) => k.species === 'nibbi') || NP.state.box.some((k) => k.species === 'nibbi'), 'nibbi joined');
  assert.ok(NP.state.dex.caught.nibbi);
  assert.equal(NP.state.bag.master_spool || 0, 0);
}
console.log('battle flows ok');

// ---- save / load round trip
{
  assert.ok(NP.State.save());
  const st = NP.State.load();
  assert.equal(st.name, 'Ren');
  assert.equal(st.party.length, NP.state.party.length);
  assert.equal(st.party[0].species, 'konko');
  assert.ok(NP.State.peek().dex >= 2);
}
console.log('slice ok');
