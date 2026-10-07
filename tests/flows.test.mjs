// Extra gameplay flows: ledges, fleeing, blackout, party/bag screens, levelling + evolution, trainers.
import assert from 'node:assert/strict';
import { boot } from './harness.mjs';

function fresh(seed) {
  const t = boot(seed);
  const { NP } = t;
  const ow = NP.quickStart('Ren', 'm');
  const st = NP.state;
  Object.assign(st.flags, { intro_done: true, has_starter: true, tomo_left_lab: true });
  st.party.push(NP.Kigu.create('konko', 10, { ot: 'Ren', nature: 'hardy' }));
  st.bag.bond_spool = 3; st.bag.snack_cake = 2;
  ow.msg.close(); ow.tasks = [];
  return { t, NP, ow, st, G: t.G };
}

console.log('>> ledges: hop down over a ledge, cant climb back up');
// ---- ledges: hop down over a ledge, can't climb back up
{
  const { t, NP, ow } = fresh(1);
  ow.loadMap('route1', 16, 27, 'down', { noEnter: true });
  t.tick(3);
  t.go('down', 1);
  t.tick(40);
  assert.deepEqual(t.pos(), ['route1', 16, 29], 'hopped over the ledge');
  t.go('up', 1);
  assert.deepEqual(t.pos(), ['route1', 16, 29], 'cannot climb a ledge');
}

console.log('>> running away from a wild battle');
// ---- running away from a wild battle
{
  const { t, NP, ow, G, st } = fresh(2);
  ow.loadMap('route1', 12, 36, 'up', { noEnter: true });
  ow.spawn((function* () { yield* ow.wildBattle('mittsy', 2); })(), 'w');
  const ok = t.mash(() => G.top() instanceof NP.BattleScene && G.top().menus.length > 0, 3000);
  assert.ok(ok, 'action menu');
  t.tap('right'); t.tap('down'); t.tap('a');
  assert.ok(t.mash(() => G.top() === ow && t.idle(), 4000), 'back on the map after fleeing');
  assert.ok(st.party[0].hp > 0);
}

console.log('>> losing: blackout to the last Tea House / bedroom, ');
// ---- losing: blackout to the last Tea House / bedroom, money halved, party healed
{
  const { t, NP, ow, G, st } = fresh(3);
  ow.loadMap('route1', 12, 36, 'up', { noEnter: true });
  st.party[0].hp = 1;
  st.money = 1000;
  ow.spawn((function* () { yield* ow.wildBattle('sprubun', 40); })(), 'w');
  assert.ok(t.mash(() => G.top() === ow && ow.map.id !== 'route1' && t.idle(), 20000), 'blacked out; at ' + t.pos());
  assert.equal(ow.map.id, 'player_house');
  assert.equal(st.money, 500);
  assert.equal(st.party[0].hp, NP.Kigu.maxHp(st.party[0]));
}

console.log('>> screens open and close without errors: party, summ');
// ---- screens open and close without errors: party, summary, bag, dex, card, options
{
  const { t, NP, ow, G, st } = fresh(4);
  ow.loadMap('button_town', 13, 12, 'up', { noEnter: true });
  t.tick(5);
  t.tap('start'); t.tick(5);
  assert.ok(ow.menus[0] && ow.menus[0].items[0].label === 'Kigu');
  for (const cls of ['PartyScene', 'DexScene', 'BagScene', 'CardScene']) {
    const m = () => ow.menus[0];
    const idx = m().items.findIndex((i) => ({ PartyScene: 'Kigu', DexScene: 'Sketchbook', BagScene: 'Bag', CardScene: st.name }[cls]) === i.label);
    for (let g = 0; m().cur < idx && g < 12; g++) { t.tap('down'); t.tick(2); }
    for (let g = 0; m().cur > idx && g < 12; g++) { t.tap('up'); t.tick(2); }
    t.tap('a'); t.tick(8);
    assert.ok(G.top() instanceof NP[cls], cls + ' opens, top=' + G.top().constructor.name);
    G.render();
    if (cls === 'PartyScene') { t.tap('a'); t.tick(6); t.tap('down'); t.tap('a'); t.tick(6); }
    t.tap('b'); t.tick(6);
    if (cls === 'PartyScene') { t.tap('b'); t.tick(6); }
    assert.ok(G.top() === ow, cls + ' closes');
    assert.ok(ow.menus.length === 1, 'start menu still open');
  }
  t.tap('b'); t.tick(6);
  assert.ok(ow.menus.length === 0);
  // use a snack cake from the bag on the lead
  st.party[0].hp = 3;
  t.tap('start'); t.tick(5);
  for (let g = 0; ow.menus[0].cur < 2 && g < 12; g++) { t.tap('down'); t.tick(2); }
  t.tap('a'); t.tick(8);
  assert.ok(G.top() instanceof NP.BagScene);
  t.tap('a'); t.tick(6); t.tap('a'); t.tick(10);       // item -> Use
  assert.ok(G.top() instanceof NP.PartyScene, 'pick target');
  t.tap('a'); t.tick(10);
  assert.equal(st.party[0].hp, 23);
  assert.equal(st.bag.snack_cake, 1);
}

console.log('>> levelling up learns moves; evolution screen change');
// ---- levelling up learns moves; evolution screen changes species
{
  const { t, NP, ow, G, st } = fresh(5);
  const k = st.party[0];
  k.level = 15; k.exp = NP.expForLevel('mediumSlow', 15); k.hp = NP.Kigu.maxHp(k);
  // a big exp boost puts her at Lv16 = evolution level
  const res = NP.Kigu.gainExp(k, NP.expForLevel('mediumSlow', 16) - k.exp);
  assert.equal(k.level, 16);
  assert.ok(res[0].learn.includes('scorch_tail'));
  assert.ok(NP.Kigu.evolutionFor(k, { trigger: 'level' }));
  ow.loadMap('button_town', 13, 12, 'up', { noEnter: true });
  ow.spawn((function* () {
    const s = new NP.EvolutionScene(k, 'kitsuri'); G.push(s);
    yield* ow.waitFor(() => s.finished);
  })(), 'e');
  assert.ok(t.mash(() => G.top() === ow && t.idle(), 4000), 'evolution scene finishes');
  assert.equal(k.species, 'kitsuri');
  assert.ok(st.dex.caught.kitsuri);
}

console.log('>> a trainer spots you, walks up and fights (Lia on R');
// ---- a trainer spots you, walks up and fights (Lia on Route 1)
{
  const { t, NP, ow, G, st } = fresh(6);
  st.party[0].level = 20; st.party[0].exp = NP.expForLevel('mediumSlow', 20); st.party[0].hp = NP.Kigu.maxHp(st.party[0]);
  ow.loadMap('route1', 6, 31, 'up', { noEnter: true });
  t.tick(3);
  t.go('up', 2);                              // now (6,29) -> Lia at (6,25) looks down 4 tiles
  assert.ok(t.mash(() => st.flags.tr_route1_lia && t.idle(), 30000), 'lia beaten');
  assert.ok(st.money > 1000);
  // talking to her afterwards only chats
  const m0 = st.money;
}
console.log('>> text override hook');
{
  const { t, NP, ow, G, st } = fresh(7);
  ow.loadMap('button_town', 16, 14, 'up', { noEnter: true });     // kid_a stands at (16,13)
  t.tick(3);
  t.tap('a'); t.tick(4);
  assert.ok(ow.msg.screens.flat().join(' ').includes('someday'), 'inline dialogue without NP.text');
  t.mash(() => t.idle(), 2000);
  NP.text = { get: (k) => (k === 'button_town.kid_a' ? ['Hello from the writer, {player}!'] : k === 'button_town@11,10' ? ['SIGN TEXT'] : null) };
  t.tap('a'); t.tick(4);
  assert.equal(ow.msg.screens.flat().join(' '), 'Hello from the writer, Ren!');
  t.mash(() => t.idle(), 2000);
  ow.player.x = 11; ow.player.y = 11; ow.player.dir = 'up';
  t.tap('a'); t.tick(4);
  assert.equal(ow.msg.screens.flat().join(' '), 'SIGN TEXT');
  NP.text = { get() { throw new Error('boom'); } };
  t.mash(() => t.idle(), 2000);
  t.tap('a'); t.tick(4);
  assert.ok(ow.msg.screens.flat().join(' ').includes('BUTTON TOWN'), 'a throwing NP.text falls back to inline text');
}
console.log('flows ok');
