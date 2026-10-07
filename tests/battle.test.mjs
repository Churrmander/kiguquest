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
const bt = fight(3, ['konko', 8], ['peepi', 4], true);
assert.equal(bt.winner, 0);
assert.ok(bt.sides[0].party[0].exp > 0);
const bt2 = fight(5, ['nibbi', 3], ['konko', 9]);
assert.equal(bt2.winner, 1);

// status moves, stat stages, crit-free damage sanity
{
  const k1 = mk('konko', 10), k2 = mk('mittsy', 10);
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
  const foe = mk('peepi', 4);
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
