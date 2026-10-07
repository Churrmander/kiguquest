import assert from 'node:assert/strict';
import { boot } from './harness.mjs';

const t = boot(99);
const { NP, G } = t;
NP.boot();
t.tick(60);
assert.ok(G.top() instanceof NP.TitleScene);
assert.ok(!NP.State.hasSave(), 'fresh storage');
t.tap('start'); t.tick(10);           // PRESS START -> menu
t.tap('a'); t.tick(10);               // New Game
assert.ok(G.top() instanceof NP.NameEntryScene, 'name entry opens');
// skip the welcome text -> gender menu
t.mash(() => G.top().menus && G.top().menus.length > 0, 600);
t.tap('down'); t.tap('a');            // Girl
t.tick(10);
assert.equal(G.top().stage, 1);
// go to the bottom row, press "Default", then OK
t.tap('up'); t.tap('right'); t.tap('a'); t.tick(4);
assert.equal(G.top().name, 'Yuki');
t.tap('right'); t.tap('a'); t.tick(120);
assert.ok(G.top() instanceof NP.Overworld, 'game starts: ' + G.top().constructor.name);
assert.equal(NP.state.name, 'Yuki');
assert.equal(NP.state.gender, 'f');
assert.equal(t.pos()[0], 'lab');
// the opening cutscene plays to its end
assert.ok(t.mash(() => t.idle(), 4000));
assert.deepEqual(t.pos(), ['lab', 5, 6]);
// save from the start menu, then "Continue" on a new title screen restores it
t.tap('start'); t.tick(6);
assert.ok(t.ow.menus.length === 1, 'start menu open');
// Kigu, Sketchbook, Bag, Yuki, Save ... (no Kigu entry before the starter: Sketchbook first)
const labels = t.ow.menus[0].items.map((i) => i.label);
assert.ok(labels.includes('Save') && labels.includes('Bag') && labels.includes('Options'));
NP.State.save(NP.state);
const before = JSON.stringify(NP.state.pos);
NP.state = null;
G.reset(new NP.TitleScene()); t.tick(60);
t.tap('start'); t.tick(8);
assert.equal(G.top().menus[0].items[0].label, 'Continue');
t.tap('a'); t.tick(120);
assert.ok(G.top() instanceof NP.Overworld);
assert.equal(NP.state.name, 'Yuki');
assert.equal(JSON.stringify(NP.state.pos.map), '"lab"');
console.log('title ok');
