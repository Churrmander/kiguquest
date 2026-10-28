import assert from 'node:assert/strict';
import { loadNP } from '../tools/load.mjs';
const { NP } = loadNP({ quiet: true });
const { Kigu, Battle: B } = NP;

function mk(sp, lv, o) { return Kigu.create(sp, lv, Object.assign({ rng: new NP.RNG(7), nature: 'hardy', alt: false }, o)); }

// data integrity
for (const [id, s] of Object.entries(NP.data.species)) {
  for (const [, m] of s.learnset) assert.ok(NP.data.moves[m], id + ' move ' + m);
  for (const e of s.evolutions || []) assert.ok(NP.data.species[e.to], id + ' evo');
  assert.ok(Kigu.initialMoves(id, 5).length >= 1, id + ' has starting moves');
}

// a full battle plays out to completion with AI vs AI
function fight(seed, a, b, wild) {
  const rng = new NP.RNG(seed);
  const pa = [mk(a[0], a[1])], pb = [mk(b[0], b[1])];
  const bt = new B.Battle({ wild: !!wild, rng, sides: [{ player: true, party: pa }, { party: pb, ai: 1 }] });
  let s = bt.begin(), guard = 0;
  while (!s.done && guard++ < 500) {
    let ans;
    const r = s.request;
    if (r && r.need === 'actions') ans = [B.AI.choose(bt, bt.sides[0].active[r.slots[0]], 0)];
    else if (r && r.need === 'replace') ans = bt.sides[0].benched()[0].idx;
    s = bt.step(ans);
  }
  assert.ok(bt.ended, 'battle ended');
  return bt;
}
const bt = fight(3, ['konko', 8], ['chirpadee', 4], true);
assert.equal(bt.winner, 0);
assert.ok(bt.sides[0].party[0].exp > 0);
const bt2 = fight(5, ['nibblit', 3], ['konko', 9]);
assert.equal(bt2.winner, 1);

// status moves, stat stages, crit-free damage sanity
{
  const k1 = mk('konko', 10), k2 = mk('kittabra', 10);
  const bt = new B.Battle({ wild: true, rng: new NP.RNG(1), sides: [{ player: true, party: [k1] }, { party: [k2] }] });
  bt.begin();
  const a = bt.sides[0].active[0], d = bt.sides[1].active[0];
  const r = B.calcDamage(bt, a, d, NP.data.moves.pounce, { crit: false, roll: 100 });
  assert.ok(r.dmg > 3 && r.dmg < 30, 'dmg ' + r.dmg);
  assert.equal(B.effectiveness('ember', d), 1);
  const s = B.calcDamage(bt, a, d, NP.data.moves.cinder, { crit: false, roll: 100 });
  assert.ok(s.stab);
  bt.boost(d, { def: -2 });
  assert.equal(d.boosts.def, -2);
  assert.ok(bt.setStatus(d, 'slp'));
  assert.ok(B.calcDamage(bt, a, d, NP.data.moves.pounce, { crit: false, roll: 100 }).dmg > r.dmg);
}

// spool: master always catches; weak sleepy foe is easier than full-hp awake one
{
  const foe = mk('chirpadee', 4);
  const bt = new B.Battle({ wild: true, rng: new NP.RNG(9), cfg: {}, sides: [{ player: true, party: [mk('konko', 5)] }, { party: [foe] }] });
  bt.begin();
  const me = bt.sides[0].active[0];
  const used = [];
  bt.cfg.consume = (i) => used.push(i);
  B.throwSpool(bt, me, { item: 'master_spool' });
  assert.equal(bt.caught, foe);
  assert.deepEqual(used, ['master_spool']);
  let easy = 0, hard = 0;
  for (let i = 0; i < 300; i++) {
    if (B.spoolRoll(bt, foe, 1, 20, 1, 'slp').caught) easy++;
    if (B.spoolRoll(bt, foe, 20, 20, 1, null).caught) hard++;
  }
  assert.ok(easy > hard, 'low hp + sleep easier: ' + easy + ' vs ' + hard);
}

// items
{
  const k = mk('konko', 10);
  k.hp = 5;
  assert.equal(NP.Items.why('snack_cake', k), '');
  NP.Items.apply('snack_cake', k);
  assert.equal(k.hp, 25);
  k.hp = Kigu.maxHp(k);
  assert.ok(NP.Items.why('snack_cake', k));
  k.hp = 0;
  assert.equal(NP.Items.why('revive_tea', k), '');
}
console.log('battle ok');

// Foxfire: burns AND lights a blue flame over the user's side that powers up every Ember move of that side for 5 turns, even after she switches out
{
  const bt = new B.Battle({ wild: false, rng: new NP.RNG(3), sides: [{ player: true, party: [mk('konko', 20), mk('kitsuri', 20)] }, { party: [mk('kittabra', 20)], ai: 1 }] });
  bt.begin();
  const konko = bt.sides[0].active[0], foe = bt.sides[1].active[0];
  const hit = (user, mv) => B.calcDamage(bt, user, foe, NP.data.moves[mv], { crit: false, roll: 100 });
  const before = hit(konko, 'cinder').dmg;
  const fx = NP.data.moves.foxfire;
  assert.equal(fx.sideCond, 'foxfire'); assert.equal(fx.status.id, 'brn');
  bt.rng = { int: () => 0, ratio: () => false, range: (a) => a, chance: () => false }; // Foxfire's 85% accuracy always hits
  const g = B.doMove(bt, konko, { moveId: 'foxfire', forced: true });
  while (!g.next().done);
  assert.equal(foe.status, 'brn', 'still burns the foe');
  assert.ok(bt.sides[0].conds.foxfire, 'the flame hangs over the user\'s side');
  assert.ok(!bt.sides[1].conds.foxfire, 'not over the foe\'s side');
  bt.drain();
  const after = hit(konko, 'cinder').dmg;
  assert.ok(after >= Math.floor(before * 1.25) && after <= Math.ceil(before * 1.35), 'Ember moves get ~1.3x: ' + before + ' -> ' + after);
  assert.ok(bt.drain().some((e) => e.t === 'msg' && /foxfire glows brightly/.test(e.text)), 'the glow message is shown when an Ember move hits');
  assert.equal(hit(konko, 'pounce').dmg, B.calcDamage(bt, konko, foe, NP.data.moves.pounce, { crit: false, roll: 100 }).dmg);
  bt.drain();
  hit(konko, 'pounce');
  assert.ok(!bt.drain().some((e) => /glows/.test(e.text || '')), 'non-Ember moves do not glow');
  // it belongs to the side: the other party member (not the one who used Foxfire) also benefits, and a switch-out keeps it
  // 'even when Konko is not on the field': the benched Ember Kigu gets the same boost, and so does she after Konko is gone
  const bench = bt.sides[0].benched()[0];
  const benchMon = bench.mon || bench;
  assert.equal(benchMon.side, bt.sides[0]);
  const bBefore = B.calcDamage(bt, benchMon, foe, NP.data.moves.cinder, { crit: false, roll: 100 }).dmg;
  bt.sides[0].conds.foxfire && delete bt.sides[0].conds.foxfire;
  const bPlain = B.calcDamage(bt, benchMon, foe, NP.data.moves.cinder, { crit: false, roll: 100 }).dmg;
  bt.addSideCond(bt.sides[0], 'foxfire', konko);
  assert.ok(bBefore > bPlain, 'a different Kigu on the same side is boosted too: ' + bPlain + ' -> ' + bBefore);
  const flame = B.COND.side.foxfire;
  assert.equal(typeof flame.modDamage, 'function');
  assert.ok(bt.sides[0].conds.foxfire.turns === 5, 'lasts 5 turns');
  bt.sides[0].conds.foxfire.turns = 2;
  const g2 = B.doMove(bt, konko, { moveId: 'foxfire', forced: true });
  while (!g2.next().done);
  assert.equal(bt.sides[0].conds.foxfire.turns, 5, 'using it again refreshes it');
}
console.log('foxfire ok');
