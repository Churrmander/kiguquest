// Human sprites inside the game: the overworld draws the 32x32 cell with the feet on the tile's bottom row, paddling hides the legs,
// and the battle send-out poses keep the trainer bitmap's size and bottom-centre anchor.
import assert from 'node:assert/strict';
import { boot } from './harness.mjs';

const t = boot(5);
const { NP } = t;
const ow = NP.quickStart('Ren', 'f'); ow.msg.close(); ow.tasks = [];
const p = ow.player;
assert.equal(NP.assets.human(p.look).w, 32, 'overworld cell is 32 wide');

// draw the player on a 64x64 scratch with its tile at (24..39, 24..39)
const drawAt = (swim) => {
  const fb = new NP.Bitmap(64, 64);
  p.swim = swim;
  p.draw(fb, p.px - 24, p.py - 24, 0);
  p.swim = false;
  return fb;
};
const fb = drawAt(false);
const bb = fb.bbox();
assert.equal(bb.y + bb.h, 40, 'feet (and shadow) end on the tile bottom row: ' + (bb.y + bb.h));
assert.ok(bb.y >= 24 - 18 && bb.y <= 24 - 8, 'figure rises about 1.5 tiles above the tile top (top row ' + bb.y + ')');
assert.ok(bb.x >= 16 && bb.x + bb.w <= 48, 'drawn within the centred 32px cell');
let shadow = 0; for (let x = 24; x < 40; x++) if (fb.u32[39 * 64 + x] >>> 24) shadow++;
assert.ok(shadow >= 8, 'soft shadow under the feet');

// paddling: sits lower, nothing below the waterline
const sw = drawAt(true).bbox();
assert.ok(sw.y > bb.y, 'paddling sits lower');
const opaque = (b) => { let n = 0; for (let i = 0; i < b.u32.length; i++) if (b.u32[i] >>> 24 === 255) n++; return n; };
assert.ok(opaque(drawAt(true)) < opaque(fb), 'the water hides the legs');

// battle send-out poses
{
  const A = NP.assets, base = A.humanBack('hero_f');
  assert.equal(base.w, 80); assert.equal(base.h, 80);
  assert.ok(A.humanThrow('hero_f', 'ready', 0) === base, 'ready is the plain back sprite');
  const w = A.humanThrow('hero_f', 'windup', -3), th = A.humanThrow('hero_f', 'throw', 4), fo = A.humanThrow('hero_f', 'follow', 0);
  for (const b of [w, th, fo]) {
    assert.ok(b.w === base.w && b.h === base.h, 'poses keep the back sprite size');
    assert.ok(Math.abs(b.bbox().y + b.bbox().h - (base.bbox().y + base.bbox().h)) <= 0, 'feet stay on the anchor row');
    assert.ok(!b.equals(base));
  }
  assert.ok(!w.equals(th) && !th.equals(fo), 'wind-up, throw and follow-through are distinct poses');
  assert.ok(A.humanThrow('rival', 'throw', 0).w === 80, 'rival pseudo-look resolves');
  assert.equal(A.humanFront('mimi').w, 80);
}
console.log('human-ingame OK');
