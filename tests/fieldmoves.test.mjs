// Field moves, played with real key input: Paddle (Disc from Bryn) crosses calm water, Snip (Disc from Poppy) clears bushes.
import assert from 'node:assert/strict';
import { boot } from './harness.mjs';

function fresh(seed) {
  const t = boot(seed);
  const { NP } = t;
  const ow = NP.quickStart('Ren', 'f');
  const st = NP.state;
  Object.assign(st.flags, { intro_done: true, has_starter: true, tomo_left_lab: true, route2_open: true, route2_insp_done: true });
  st.party.push(NP.Kigu.create('konko', 20, { ot: 'Ren' }));
  ow.msg.close(); ow.tasks = [];
  return { t, NP, ow, st };
}
const face = (t, dir) => { t.tap(dir); t.tick(8); };
const settle = (t) => assert.ok(t.mash(() => t.idle(), 900), 'script finished');

// ------------------------------------------------------------------ Paddle
{
  console.log('>> paddle');
  const { t, NP, ow, st } = fresh(21);
  ow.loadMap('route2', 10, 17, 'down', { noEnter: true });
  t.tick(3);
  assert.ok(t.travel(10, 22, 300), 'walk onto the bridge');
  assert.deepEqual(t.pos(), ['route2', 10, 22]);
  assert.equal(ow.paddling(), false, 'on planks, not paddling');

  // without the Disc the river is a wall
  face(t, 'left');
  t.go('left', 1);
  t.tap('a'); t.tick(10);
  assert.deepEqual(t.pos(), ['route2', 10, 22], 'no Disc: the water blocks you');
  assert.ok(t.idle(), 'no Disc: no prompt either');

  // with the Disc, A on the water offers to paddle and steps onto it
  st.bag.disc_paddle = 1;
  face(t, 'left');
  t.tap('a');
  settle(t);
  assert.deepEqual(t.pos(), ['route2', 9, 22], 'stepped onto the water');
  assert.equal(ow.paddling(), true, 'paddling derives from standing on water');

  // free movement over water, and the floating item is picked up by facing it
  t.go('left', 3);
  assert.deepEqual(t.pos(), ['route2', 6, 22]);
  face(t, 'left');
  t.tap('a');
  settle(t);
  assert.equal(st.bag.revive_tea, 1, 'picked up the drifting Revive Tea');
  assert.ok(st.flags.got_route2_drift1);

  // the far bank ends the paddle; the open sea never opens up (only `water` is paddleable)
  t.go('right', 4);
  assert.deepEqual(t.pos(), ['route2', 10, 22], 'back on the bridge');
  assert.equal(ow.paddling(), false, 'stepping onto planks ends the paddle');
  assert.equal(NP.terrain.sea.paddle, undefined, 'sea is not paddleable');
  assert.equal(NP.terrain.water.paddle, true);
}

// ------------------------------------------------------------------ Snip
{
  console.log('>> snip');
  const { t, NP, ow, st } = fresh(22);
  ow.loadMap('gingham_woods', 10, 10, 'down', { noEnter: true });
  t.tick(3);
  const bush = () => ow.map.placements.find((p) => p.id === 'bush' && p.x === 10 && p.y === 11);
  assert.ok(bush() && ow.map.solid(10, 11), 'a bush seals the alcove');

  // no Disc: a hint, and the bush stays
  face(t, 'down');
  t.tap('a');
  settle(t);
  assert.ok(bush(), 'no Disc: the bush stays');

  // with the Disc: A asks, Yes snips it, the flag is stored, the way is open
  st.bag.disc_snip = 1;
  face(t, 'down');
  t.tap('a');
  settle(t);
  assert.ok(!bush(), 'the bush is gone');
  assert.ok(st.flags['snip:gingham_woods:10,11'], 'the cut is remembered');
  assert.equal(ow.map.solid(10, 11), false, 'the alcove is open');
  t.go('down', 1);
  assert.deepEqual(t.pos(), ['gingham_woods', 10, 11]);
  face(t, 'down');
  t.tap('a');
  settle(t);
  assert.equal(st.bag.sugar_cube, 1, 'the item behind the bush');

  // it stays cut when you leave and come back...
  ow.loadMap('route2', 10, 17, 'down', { noEnter: true });
  ow.loadMap('gingham_woods', 10, 10, 'down', { noEnter: true });
  assert.ok(!bush(), 'still gone after re-entering the map');
  // ...and a game that never cut it gets the bush back from the cached map
  delete st.flags['snip:gingham_woods:10,11'];
  ow.loadMap('gingham_woods', 10, 10, 'down', { noEnter: true });
  assert.ok(bush() && ow.map.solid(10, 11), 'flag cleared: the bush is back and solid again');
}

console.log('field moves ok');
