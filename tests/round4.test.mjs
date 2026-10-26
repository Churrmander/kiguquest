// Playtest round 4: the tree house memory is a real scene, Bobbin's Exp Share, the bridge inspectors walk off in view,
// a fair Hiker Brock, evolutions that wait for the scene to end (and can be stopped with B), and Seamstead's Crisp & Co. hint.
import assert from 'node:assert/strict';
import { boot } from './harness.mjs';

function fresh(seed, lv) {
  const t = boot(seed);
  const { NP } = t;
  const ow = NP.quickStart('Ren', 'm');
  const st = NP.state;
  Object.assign(st.flags, { intro_done: true, has_starter: true, tomo_left_lab: true, morning_done: true, errand_done: true });
  st.party.push(NP.Kigu.create('konko', lv || 10, { ot: 'Ren', nature: 'hardy' }));
  ow.msg.close(); ow.tasks = [];
  return { t, NP, ow, st, G: t.G };
}
const toLevel = (NP, k, lv) => { k.level = lv - 1; k.exp = NP.expForLevel('mediumSlow', lv - 1); NP.Kigu.gainExp(k, NP.expForLevel('mediumSlow', lv) - k.exp); k.hp = NP.Kigu.maxHp(k); };

console.log('>> the tree house memory is a sepia room with the two of you as kids, then back to the washing line');
{
  const t = boot(41);
  const { NP, G } = t;
  NP.state = NP.State.fresh('Ren', 'f');
  const st = NP.state;
  Object.assign(st.flags, { woke: true, kite_call: true });
  const ow = new NP.Overworld(); G.reset(ow);
  ow.loadMap('button_town', 7, 4, 'up', { noEnter: true });
  t.tick(3); t.tap('a');
  let inMemory = false, kids = null, toned = false;
  for (let i = 0; i < 6000 && !st.flags.morning_done; i++) {
    NP.Input.set('a', i % 8 === 0); t.tick(1);
    if (ow.map.id === 'treehouse_memory' && !inMemory) {
      inMemory = true;
      kids = [NP.assets.human(ow.find('kid_player').look), NP.assets.human(ow.find('kid_rival').look)];
      // sepia: a mid-screen pixel has red >= green >= blue
      const c = G.fb.get(NP.W >> 1, 40); toned = (c & 255) >= ((c >> 8) & 255) && ((c >> 8) & 255) >= ((c >> 16) & 255);
    }
  }
  NP.Input.set('a', false);
  assert.ok(inMemory, 'the memory plays in the tree house room');
  assert.ok(NP.maps.treehouse_memory.hidePlayer && NP.maps.treehouse_memory.memory, 'teen hero hidden, sepia on');
  assert.ok(toned, 'the memory is drawn in sepia');
  assert.ok(NP.art.human.has('hero_f_kid') && NP.art.human.has('hero_m_kid'), 'little versions of both heroes exist');
  assert.notEqual(kids[0], kids[1], 'the two kids look different');
  assert.ok(st.flags.morning_done && ow.map.id === 'button_town', 'back in Button Town afterwards');
  assert.ok(!ow.find('tomo_bt').visible, 'and the rival still races off to the lab');
}

console.log('>> Exp Share: benched Kigu get half, and only while it is switched on');
{
  const { NP, st } = fresh(42, 10);
  st.party.unshift(NP.Kigu.create('sprubun', 10, { ot: 'Ren', nature: 'hardy' }));
  const run = (share) => {
    const party = st.party.map((k) => Object.assign(NP.Kigu.create(k.species, 10, { ot: 'Ren', nature: 'hardy' })));
    const foe = NP.Kigu.create('nibblit', 8);
    const b = new NP.Battle.Battle({ wild: true, sides: [{ player: true, party }, { party: [foe] }], expShare: share });
    const fm = b.sides[1].mons[0], lead = b.sides[0].mons[0], bench = b.sides[0].mons[1];
    fm.participants = new Set([lead]);
    const e0 = lead.kigu.exp, b0 = bench.kigu.exp;
    NP.Battle.awardExp(b, fm);
    return [lead.kigu.exp - e0, bench.kigu.exp - b0];
  };
  const [lead1, bench1] = run(true), [lead0, bench0] = run(false);
  assert.ok(lead1 > 0 && lead1 === lead0, 'the battler keeps her full share');
  assert.ok(bench1 > 0 && Math.abs(bench1 - Math.floor(lead1 / 2)) <= 1, 'the bench gets half (' + bench1 + ' of ' + lead1 + ')');
  assert.equal(bench0, 0, 'switched off: the bench gets nothing');
  assert.equal(NP.data.items.exp_share.pocket, 'key');
}

console.log('>> evolution waits for the scene to finish, plays slowly, and B stops it');
{
  const { t, NP, ow, st, G } = fresh(43, 10);
  const k = st.party[0];
  toLevel(NP, k, 16);
  ow.loadMap('button_town', 13, 12, 'up', { noEnter: true });
  st.evoPending = true;
  ow.runScript(function* (c) { yield* c.say('Thanks for the battle!'); yield* c.wait(30); });
  for (let i = 0; i < 40; i++) t.tick(1);
  assert.ok(G.top() === ow, 'no evolution while the parting words are still up');
  let frames = 0;
  assert.ok(t.mash(() => G.top() instanceof NP.EvolutionScene, 600), 'evolution starts once the scene is over');
  assert.ok(t.mash(() => { frames++; return G.top() === ow && t.idle(); }, 4000), 'evolution finishes');
  assert.equal(k.species, 'kitsuri');
  assert.ok(frames > 600, 'it takes its time (' + frames + ' frames)');

  // stopped with B: stays as she is, and does not ask again until her next level
  const k2 = NP.Kigu.create('konko', 10, { ot: 'Ren', nature: 'hardy' });
  st.party = [k2];
  toLevel(NP, k2, 16);
  st.evoPending = true;
  t.tick(2);
  assert.ok(t.mash(() => G.top() instanceof NP.EvolutionScene && !G.top().msg.active && G.top().white >= 1, 1200), 'into the change');
  t.tick(30); t.tap('b');
  assert.ok(t.mash(() => G.top() === ow && t.idle(), 3000), 'back on the map');
  assert.equal(k2.species, 'konko', 'B stopped the evolution');
  assert.equal(k2.evoStop, 16);
  st.evoPending = true; t.tick(10);
  assert.ok(G.top() === ow, 'no second try at the same level');
}

console.log('>> the bridge inspectors are seen walking away before they disappear');
{
  const { t, NP, ow, st, G } = fresh(44, 30);
  ow.loadMap('route2', 10, 27, 'up', { noEnter: true });
  t.tick(3);
  let walkedInView = false;
  for (let i = 0; i < 30000 && !st.flags.route2_insp_done; i++) {
    NP.Input.set(i < 20 ? 'up' : 'a', i < 20 || i % 6 === 0); t.tick(1);
    const a = ow.find('insp_a');
    if (G.top() === ow && a && a.visible && a.moving && a.dir === 'up' && a.y < 24) walkedInView = true;
  }
  NP.Input.set('a', false); NP.Input.set('up', false);
  assert.ok(st.flags.route2_insp_done, 'the inspector scene finished');
  assert.ok(walkedInView, 'Tally is visible while walking off up the bridge');
  assert.ok(!ow.find('insp_a').visible && !ow.find('insp_b').visible, 'gone afterwards');
}

console.log('>> Hiker Brock is a fair fight one Button in');
{
  const { NP } = boot(45);
  const brock = NP.maps.route2.npcs.find((n) => n.id === 'brock');
  assert.ok(brock.trainer.team.length <= 2, 'two Kigu at most');
  assert.ok(Math.max.apply(null, brock.trainer.team.map((m) => m.lv)) <= 9, 'no higher than Lv 9');
}

console.log('>> Seamstead points at Crisp & Co. for the Salon');
{
  const { NP } = boot(46);
  const npcs = NP.maps.seamstead.npcs;
  const guard = npcs.find((n) => n.id === 'dark1');
  assert.ok(guard.say.join(' ').includes('Crisp & Co. basement'), 'the Salon guard names the basement switch');
  assert.ok(typeof npcs.find((n) => n.id === 'mimi_s').script === 'function', 'Mimi spells it out too');
}
console.log('round 4 OK');
