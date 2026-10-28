// Chapter 1 rebuild, shared pieces (2026-10-28): the Lucky Thimble held item, shaking trees for bird Kigu (NP.TreeShake), Kigu
// overworld looks ('kigu:<species>'), edge walls between tiles, and the map helpers L.variantBy / M.once.
import assert from 'node:assert/strict';
import { boot } from './harness.mjs';

// ------------------------------------------------------------------ Lucky Thimble
{
  const { NP } = boot(1);
  const it = NP.data.items.lucky_thimble;
  assert.ok(it, 'lucky_thimble item exists');
  assert.equal(it.name, 'Lucky Thimble');
  assert.ok(it.held && typeof it.held.modMultiHits === 'function', 'held hook');
  assert.ok(/\.$/.test(it.desc || it.description || ''), 'description is a whole sentence');
  assert.ok(NP.art.icons.item ? NP.art.icons.item('lucky_thimble') : true, 'has an icon');
  const { Kigu, Battle: B } = NP;
  const mk = (sp, lv, o) => Kigu.create(sp, lv, Object.assign({ rng: new NP.RNG(7), nature: 'hardy', alt: false }, o));
  const counts = { with: {}, without: {} };
  for (let trial = 0; trial < 120; trial++) {
    const held = trial % 2 === 0;
    const me = mk('konko', 30, { moves: ['flurry_swipe'] });
    if (held) me.item = 'lucky_thimble';
    const foe = mk('nibblit', 100);
    const bt = new B.Battle({ wild: true, rng: new NP.RNG(100 + trial), sides: [{ player: true, party: [me] }, { party: [foe] }] });
    bt.begin();
    const before = bt.log.length;
    const g = B.doMove(bt, bt.sides[0].active[0], { moveId: 'flurry_swipe', target: { side: 1, slot: 0 } });
    for (let s = g.next(); !s.done; s = g.next());
    const evts = bt.log.slice(before);
    if (evts.some((e) => e.t === 'miss')) continue;
    const n = evts.filter((e) => e.t === 'hit').length;
    const k = held ? 'with' : 'without';
    counts[k][n] = (counts[k][n] || 0) + 1;
  }
  assert.deepEqual(Object.keys(counts.with).map(Number).sort(), [4, 5], 'Lucky Thimble: a 2-5 hit move lands 4 or 5 times, ' + JSON.stringify(counts.with));
  assert.ok(counts.with[4] > 10 && counts.with[5] > 10, 'about half and half');
  assert.ok(counts.without[2] > 0, 'without it a 2-5 hit move can land twice');
}

// ------------------------------------------------------------------ tree shake
{
  const t = boot(7);
  const { NP } = t;
  const TS = NP.TreeShake;
  const ow = NP.quickStart('Ren', 'f');
  ow.msg.close(); ow.tasks = [];
  NP.state.party.push(NP.Kigu.create('konko', 30, { ot: 'Ren' }));
  assert.ok(NP.data.species.chirpadee && NP.data.species.lyripip, 'the Chapter 1 tree birds exist');
  // where trees can be shaken
  assert.equal(TS.wild({ id: 'x' }), true);
  assert.equal(TS.wild({ id: 'x', town: true }), false, 'never in towns');
  assert.equal(TS.wild({ id: 'x', indoor: true }), false, 'never indoors');
  assert.equal(TS.wild({ id: 'x', memory: true }), false, 'never in a memory');
  // the roll: 1 in 8, weighted by the table
  const def = { id: 'x', treeShake: [{ sp: 'chirpadee', min: 3, max: 5, w: 9 }, { sp: 'lyripip', min: 4, max: 4, w: 1 }] };
  const rng = new NP.RNG(42);
  let hits = 0; const by = {};
  for (let i = 0; i < 16000; i++) { const r = TS.roll(def, rng); if (r) { hits++; by[r.sp] = (by[r.sp] || 0) + 1; assert.ok(r.lv >= 3 && r.lv <= 5); } }
  assert.ok(hits / 16000 > 0.11 && hits / 16000 < 0.14, 'about 1 in 8: ' + hits / 16000);
  assert.ok(by.chirpadee > by.lyripip * 4 && by.lyripip > 0, 'Chirpadee common, Lyripip rare ' + JSON.stringify(by));
  assert.equal(TS.roll({ id: 'x' }, rng), null, 'no table, nothing falls');

  // in the game: Route 1, facing a treeline tile
  ow.loadMap('route1', 12, 30, 'down', { noEnter: true });
  const m = ow.map;
  let spot = null;
  for (let y = 1; y < m.h - 1 && !spot; y++) for (let x = 1; x < m.w - 1 && !spot; x++) {
    if (m.idAt(x - 1, y) === 'treeline' && !m.solid(x, y) && !m.warpAt(x, y) && !m.encounterKind(x, y) && !ow.actors.some((a) => a.x === x && a.y === y)) spot = { x, y };
  }
  assert.ok(spot, 'found a lane beside the trees');
  m.def.treeShake = def.treeShake;
  const lines = [];
  const say0 = NP.Overworld.prototype.say;
  NP.Overworld.prototype.say = function* (text, o) { lines.push(String(text)); yield* say0.call(this, text, o); };
  const press = () => {
    ow.loadMap('route1', spot.x, spot.y, 'left', { noEnter: true });
    ow.msg.close(); ow.tasks = [];
    lines.length = 0;
    t.tap('a');
    t.mash(() => t.idle() || t.G.top() !== ow, 3000);
  };
  NP.Clock.fakeDay = 1000;
  TS.RATE = 0;   // nothing falls: just the shake
  press();
  assert.ok(lines.some((l) => /good shake/.test(l)), 'shook the tree: ' + lines.join(' / '));
  assert.equal(NP.state.flags[TS.key('route1', { x: spot.x - 1, y: spot.y })], 1000, 'remembers the day');
  press();
  assert.ok(lines.some((l) => /already given this tree a shake today/.test(l)), 'once a day: ' + lines.join(' / '));
  NP.Clock.fakeDay = 1001;
  TS.RATE = 1;   // the next day, and a bird falls for sure
  press();
  assert.ok(lines.some((l) => /tumbled out/.test(l)), 'a Kigu fell out: ' + lines.join(' / '));
  assert.notEqual(t.G.top(), ow, 'and a wild battle started');
  TS.RATE = 1 / 8;
  // a town map never shakes
  m.def.town = true;
  assert.equal(TS.treeAt(m, spot.x - 1, spot.y), null, 'towns never');
  delete m.def.town;
  assert.ok(TS.treeAt(m, spot.x - 1, spot.y), 'wild maps do');
  NP.Overworld.prototype.say = say0;
}

// ------------------------------------------------------------------ Kigu overworld looks, edge walls, map helpers
{
  const { NP } = boot(3);
  const A = NP.assets;
  assert.ok(A.hasLook('kigu:konko'), 'kigu:<species> is a look');
  assert.ok(!A.hasLook('kigu:nobody'), 'an unknown species is not');
  const s = A.human('kigu:konko');
  for (const d of ['down', 'up', 'left', 'right']) { assert.equal(s.frames[d].length, 3, d + ' frames'); assert.equal(s.frames[d][0].w, 32); assert.equal(s.frames[d][0].h, 32); }
  assert.ok(A.humanAsleep('player') || A.humanAsleep('rival'), 'asleep pose');

  // edge walls: a partition between (2,1) and (2,2) blocks walking down from y1, and up from y2, but nowhere else
  const L = NP.levels;
  const M = L.map({ id: '_edge_t', name: 'Edge', w: 6, h: 5, fill: '.', legend: { '.': 'floor_wood' }, indoor: true, edgeWalls: [{ h: 2, x0: 1, x1: 3 }, { v: 4, y0: 0, y1: 1 }] });
  M.def.spawns.s = { x: 0, y: 0, dir: 'down' };
  M.reg();
  const tm = new NP.TileMap(NP.maps._edge_t);
  assert.ok(tm.edgeBlocked(2, 1, 'down') && tm.edgeBlocked(2, 2, 'up'), 'horizontal edge wall');
  assert.ok(!tm.edgeBlocked(0, 1, 'down') && !tm.edgeBlocked(2, 1, 'left'), 'only across the wall');
  assert.ok(tm.edgeBlocked(3, 0, 'right') && tm.edgeBlocked(4, 1, 'left') && !tm.edgeBlocked(3, 2, 'right'), 'vertical edge wall');

  // L.variantBy: a variant chosen from the game state; M.once: a step trigger that runs one time
  const st = { id: 'sofa', x: 0, y: 0 };
  L.variantBy(st, (S) => (S.flags.woke ? 'b' : 'a'));
  assert.ok(st.dyn || st.variantFn || typeof st.variant !== 'undefined', 'variantBy marks the stamp');
  const M2 = L.map({ id: '_once_t', name: 'Once', w: 4, h: 4, fill: '.', legend: { '.': 'grass' } });
  M2.once('seen_it', 1, 1, 2, 1, function* () {});
  const tr = M2.def.triggers[M2.def.triggers.length - 1];
  assert.ok(tr && tr.x === 1 && tr.y === 1, 'once adds a trigger');
}
console.log('ch1-shared: Lucky Thimble, tree shake, kigu looks, edge walls OK');

// ------------------------------------------------------------------ the lead Kigu dances beside the hero, then goes back
{
  const t = boot(5);
  const { NP } = t;
  const ow = NP.quickStart('Ren', 'f');
  ow.msg.close(); ow.tasks = [];
  NP.state.party.push(NP.Kigu.create('kittabra', 12, { ot: 'Ren' }));
  ow.loadMap('route1', 12, 30, 'down', { noEnter: true });
  let seen = null;
  ow.runScript(function* (c) { const a = yield* NP.levels.leadDance(c, { stay: true }); seen = a; });
  assert.ok(t.mash(() => t.idle(), 2000), 'dance finished');
  assert.ok(seen && seen.look === 'kigu:kittabra', 'the lead Kigu stepped out as an overworld sprite');
  assert.ok(NP.fmt('{kigu}').length > 0 && NP.fmt('{kigu}') !== '{kigu}', '{kigu} names the lead Kigu');
  const fb = new NP.Bitmap(NP.W, NP.H);
  ow.draw(fb, 10);   // draws without throwing
}
console.log('ch1-shared: lead dance OK');
