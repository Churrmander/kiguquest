// Autosave (owner 2026-11-05: a browser reload on the playtest wiped everything since the last manual save).
// Entering a new area or healing saves once the player is free to move (owner picked always-on, no Options toggle).
import assert from 'node:assert/strict';
import { boot } from './harness.mjs';

const t = boot(5);
const { NP } = t;
const ow = NP.quickStart('Ren', 'f');
ow.msg.close(); ow.tasks = [];
NP.state.flags.has_starter = true; NP.state.flags.intro_done = true; NP.state.flags.tomo_left_lab = true;
NP.State.erase();
assert.ok(!NP.State.hasSave(), 'no save yet');

ow.loadMap('route1', 12, 30, 'up', { noEnter: true });
t.tick(5);
assert.ok(NP.State.hasSave(), 'entering an area autosaves');
assert.equal(NP.State.peek().map, 'route1');

// not in the middle of a scene: a map loaded while a script runs saves only once the scene is over
NP.State.erase();
let release = false;
ow.runScript(function* () { while (!release) yield; });
ow.loadMap('button_town', 12, 3, 'down', { noEnter: true });
t.tick(5);
assert.ok(!NP.State.hasSave(), 'no save while a scene is running');
release = true; t.tick(5);
assert.ok(NP.State.hasSave(), 'saved after the scene');

// healing saves too (the Tea House, Mom, your bed)
NP.State.erase();
ow.runScript(function* (c) { yield* c.heal(); });
t.tick(10);
assert.ok(NP.State.hasSave(), 'a heal autosaves');
console.log('autosave ok');
