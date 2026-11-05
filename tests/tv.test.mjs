// TVs (owner, 2026-11-04): every TV in the world shows the same channel, and what's on moves on with the story, all game long.
import assert from 'node:assert/strict';
import { boot } from './harness.mjs';

const t = boot(4242);
const { NP } = t;
const L = NP.levels;
const ow = NP.quickStart('Ren', 'f');
ow.msg.close(); ow.tasks = [];

// what's on for a given save, as the text key the channel would say
const onAir = (flags, badges) => {
  NP.state.flags = Object.assign({}, flags);
  NP.state.badges = Array.from({ length: 8 }, (_, i) => i < badges);
  const f = NP.state.flags;
  return L.TV.find(([, when]) => when(f))[0];
};
const story = [
  [{}, 0, 'tidy'], [{}, 1, 'badge1'], [{ shrine1_done: true }, 1, 'shrine'], [{ shrine1_done: true }, 2, 'badge2'],
  [{ crisp_done: true }, 3, 'crisp'], [{ crisp_done: true }, 4, 'badge4'], [{ shibuyarn_lights: true }, 4, 'lights'],
  [{ shibuyarn_lights: true }, 5, 'badge5'],
];
for (const [flags, badges, want] of story) assert.equal(onAir(flags, badges), want, JSON.stringify(flags) + ' with ' + badges + ' Buttons');
assert.equal(new Set(L.TV.map((s) => s[0])).size, L.TV.length, 'every stage has its own text key');
for (const [, , line] of L.TV) assert.ok(!/\{player\}|\{rival\}/.test(line), 'the TV never talks about the player: ' + line);

// every TV in every map answers A with the channel (the game console upstairs is the one exception)
NP.state.flags = {}; NP.state.badges = [];
let checked = 0;
const run0 = ow.runScript;
for (const [mid, def] of Object.entries(NP.maps)) {
  const tm = new NP.TileMap(def);
  for (const p of tm.placements) {
    if (!(p.id === 'tv' || (p.id === 'tv_wide' && p.variant !== 'console'))) continue;
    const spots = [[p.x, p.y + p.h, 'up'], [p.x - 1, p.y, 'right'], [p.x + p.w, p.y, 'left'], [p.x, p.y - 1, 'down']];
    const spot = spots.find(([x, y]) => tm.inBounds(x, y) && !tm.solid(x, y));
    assert.ok(spot, mid + ': the TV at ' + p.x + ',' + p.y + ' cannot be faced from anywhere');
    ow.loadMap(mid, spot[0], spot[1], spot[2], { noEnter: true });
    let said = null;
    ow.runScript = function (fn) { const g = NP.levels && fn; said = g; };
    ow.interact();
    ow.runScript = run0;
    assert.equal(said, L.tvNews, mid + ': the TV at ' + p.x + ',' + p.y + ' does not show the channel');
    checked++;
  }
}
assert.ok(checked >= 6, 'expected TVs across the world, found ' + checked);
console.log('tv ok (' + checked + ' TVs, ' + L.TV.length + ' stages)');
