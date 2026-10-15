// Lore: the protagonists are Dahlia (girl) and Draco (boy), childhood friends; the rival is the other one, drawn with the other hero's look.
import assert from 'node:assert/strict';
import { boot } from './harness.mjs';

const t = boot(11);
const { NP } = t;
const S = NP.State, A = NP.assets;

assert.equal(S.defaultName('f'), 'Dahlia'); assert.equal(S.defaultName('m'), 'Draco');
for (const [g, me, rival, myLook, rivalLook] of [['f', 'Dahlia', 'Draco', 'hero_f', 'hero_m'], ['m', 'Draco', 'Dahlia', 'hero_m', 'hero_f']]) {
  const st = S.fresh(undefined, g);
  assert.equal(st.name, me, 'default name for ' + g);
  assert.equal(st.rival, rival, 'rival is the other protagonist');
  NP.state = st;
  assert.equal(S.lookId(st), myLook); assert.equal(S.rivalLookId(st), rivalLook);
  assert.equal(NP.fmt('{rival} and {player}'), rival + ' and ' + me);
  assert.ok(A.human('rival').frames.down[0].equals(A.human(rivalLook).frames.down[0]), 'overworld rival sprite is the other hero');
  assert.ok(A.humanFront('rival').equals(A.humanFront(rivalLook)) && A.humanBack('rival').equals(A.humanBack(rivalLook)), 'battle portraits too');
}
// custom names still work, and a clash with the rival's default name gets a near-twin
assert.equal(S.fresh('Ren', 'f').rival, 'Draco');
assert.equal(S.fresh('draco', 'f').rival, 'Drake');
assert.equal(S.fresh('Dahlia', 'm').rival, 'Dalia');
// old saves that still say Tomo are migrated on load
NP.state = S.fresh('Ren', 'f'); NP.state.rival = 'Tomo';
const store = {}; NP.root = NP.root || globalThis;
globalThis.localStorage = { getItem: (k) => store[k] ?? null, setItem: (k, v) => { store[k] = v; }, removeItem: (k) => { delete store[k]; } };
assert.ok(S.save(NP.state));
assert.equal(S.load().rival, 'Draco', 'a Tomo save becomes Draco for a girl player');
console.log('rival OK');
