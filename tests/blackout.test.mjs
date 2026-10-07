// Losing a battle takes you to the NEAREST unlocked Tea House (not just wherever you last rested), and can never strand the game.
import assert from 'node:assert/strict';
import { boot } from './harness.mjs';

// Lose a wild battle on `map` with one 1-HP Kigu. `visited` = the maps she has been to; `heal` = her saved heal point.
function lose(seed, map, visited, heal) {
  const t = boot(seed), { NP, G } = t;
  const ow = NP.quickStart('Ren', 'f'), st = NP.state;
  Object.assign(st.flags, { intro_done: true, has_starter: true, tomo_left_lab: true });
  st.party.length = 0;
  const k = NP.Kigu.create('konko', 3, { ot: 'Ren', nature: 'hardy' });
  k.hp = 1;
  st.party.push(k);
  st.money = 1000;
  st.healPoint = heal || { map: 'player_house', spawn: 'door' };
  ow.msg.close(); ow.tasks = [];
  const sp = Object.values(NP.maps[map].spawns)[0];
  ow.loadMap(map, sp.x, sp.y, sp.dir || 'down', { noEnter: true });
  st.visited = Object.fromEntries([...visited, map].map((m) => [m, 1])); // after loadMap, so only `visited` (+ here) counts
  const said = [];
  const say = ow.say.bind(ow);
  ow.say = function* (text, o) { said.push(String(text)); yield* say(text, o); };
  ow.spawn((function* () { yield* ow.wildBattle('sprubun', 40); })(), 'battle');
  assert.ok(t.mash(() => G.top() === ow && ow.map.id !== map && t.idle(), 30000), 'blacked out; at ' + t.pos());
  assert.equal(st.money, 500, 'money halved');
  assert.equal(st.party[0].hp, NP.Kigu.maxHp(st.party[0]), 'party healed');
  return { id: ow.map.id, said: said.join(' '), st, NP };
}

console.log('>> nothing unlocked yet: the old behaviour (the bedroom), so an early loss cannot skip ahead');
{
  const r = lose(1, 'route1', ['button_town']);
  assert.equal(r.id, 'player_house');
  assert.match(r.said, /last place you rested/);
}

console.log('>> Thimble visited: a loss on Route 1 wakes you in the Thimble Tea House even though you never rested there');
{
  const r = lose(2, 'route1', ['button_town', 'thimble']);
  assert.equal(r.id, 'tea_house');
  assert.match(r.said, /nearest Tea House/);
  assert.ok(r.st.visited.tea_house, 'the Tea House counts as visited from now on');
}

console.log('>> the nearest one wins over the one you last rested in');
{
  const r = lose(3, 'hemline', ['thimble', 'tea_house', 'hemline'], { map: 'tea_house', spawn: 'door' });
  assert.equal(r.id, 'hemline_tea');
}

console.log('>> a closer Tea House in a town she has not reached yet stays locked');
{
  // from the shrine, Hemline\'s Tea House is 2 hops away and Thimble\'s 4: only the latter is unlocked
  const r = lose(4, 'spindle_shrine', ['thimble', 'route2', 'gingham_woods']);
  assert.equal(r.id, 'tea_house');
  // once she has seen Hemline it is the nearest
  const r2 = lose(5, 'spindle_shrine', ['thimble', 'route2', 'gingham_woods', 'hemline']);
  assert.equal(r2.id, 'hemline_tea');
}

console.log('>> a missing / stale heal point can no longer strand the game');
{
  const r = lose(6, 'route1', ['button_town'], { map: 'no_such_map', spawn: 'door' });
  assert.equal(r.id, 'player_house');
  const r2 = lose(7, 'route1', ['button_town'], undefined);
  assert.equal(r2.id, 'player_house');
}

console.log('blackout ok');
