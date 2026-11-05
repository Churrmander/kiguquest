// Set-piece battles (src/game/battle/setpiece.js): the Spindle Shrine's Lv30 Wyvrant against a Lv12 team.
// The fight can't be lost, the helpers join after her first hit, and it ends with her giving up at 10% HP in a handful of turns.
import assert from 'node:assert/strict';
import { loadNP } from '../tools/load.mjs';
const { NP } = loadNP({ quiet: true });
const { Kigu, Battle: B } = NP;

// the Smolava line exists as real battle data now
for (const id of ['smolava', 'wyvrant', 'empyress']) assert.ok(NP.data.species[id], id + ' species');
assert.equal(JSON.stringify(NP.data.species.smolava.evolutions), JSON.stringify([{ to: 'wyvrant', level: 30 }]));
assert.equal(JSON.stringify(NP.data.species.wyvrant.evolutions), JSON.stringify([{ to: 'empyress', level: 55 }]));
assert.equal(NP.data.species.empyress.types.join('/'), 'drake/shade');

const SP = { helper: 'The Mikoga', heal: 0.5, chip: 1 / 9, enrage: 0.35, endAt: 0.1 };
let turnsTotal = 0;
for (let seed = 1; seed <= 25; seed++) {
  const rng = new NP.RNG(seed);
  const team = [Kigu.create('kitsuri', 13, { rng }), Kigu.create('chirpadee', 11, { rng })];
  const foe = Kigu.create('wyvrant', 30, { rng, moves: ['cinder', 'scorch_tail', 'wyrm_breath', 'temper_tantrum'] });
  const bt = new B.Battle({ wild: true, noCatch: true, canRun: false, setPiece: Object.assign({}, SP), rng, sides: [{ player: true, party: team }, { party: [foe], ai: 2 }] });
  const exp0 = team.map((k) => k.exp), fmax = bt.sides[1].mons[0].maxhp;
  let s = bt.begin(), guard = 0;
  const log = [];
  while (!s.done && guard++ < 200) {
    log.push(...s.events);
    const r = s.request;
    let ans;
    if (r && r.need === 'actions') ans = [B.AI.choose(bt, bt.sides[0].active[r.slots[0]], 0)];
    else if (r && r.need === 'replace') ans = bt.sides[0].benched()[0].idx;
    s = bt.step(ans);
  }
  log.push(...s.events);
  assert.ok(bt.ended, 'seed ' + seed + ': the battle ends');
  assert.equal(bt.winner, 0, 'seed ' + seed + ': it ends as a win for the player');
  assert.equal(bt.endReason, 'setpiece', 'seed ' + seed + ': she gives up');
  assert.ok(team.every((k) => k.hp >= 1), 'seed ' + seed + ': nobody on the team faints');
  assert.ok(!log.some((e) => e.t === 'faint'), 'seed ' + seed + ': no faint at all');
  assert.ok(foe.hp > 0 && foe.hp <= Math.ceil(fmax * 0.1), 'seed ' + seed + ': she stops at about 10% HP (' + foe.hp + '/' + fmax + ')');
  assert.deepEqual(team.map((k) => k.exp), exp0, 'seed ' + seed + ': no exp, since she never faints');
  assert.ok(log.some((e) => e.t === 'msg' && /The Mikoga rushed in/.test(e.text)), 'seed ' + seed + ': the Mikoga join');
  assert.ok(bt.turn <= 9, 'seed ' + seed + ': it takes ' + bt.turn + ' turns (should be about 5 or 6)');
  turnsTotal += bt.turn;
}
console.log('set piece: average', (turnsTotal / 25).toFixed(1), 'turns');
