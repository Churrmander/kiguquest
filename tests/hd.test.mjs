// Imported high-detail overworld sprites (tools/import-sprites.mjs -> src/art/human/hd/*.js): off by default, same API shape when on,
// taller canvas, <=32 colours, feet on the bottom row of the sprite, and the overworld draws them with their feet on the tile.
import assert from 'node:assert/strict';
import { boot } from './harness.mjs';

const t = boot(5);
const { NP } = t;
const H = NP.art.human;
assert.equal(H.hd.enabled, false, 'HD sprites are opt-in');
assert.equal(H.overworld('hero_m').h, 24, 'default is the generated 16x24 sprite');

H.hd.enabled = true;
const o = H.overworld('hero_m');
assert.ok(o.h > 24 && o.w >= 16, 'HD canvas is taller: ' + o.w + 'x' + o.h);
for (const d of ['down', 'up', 'left', 'right']) {
  assert.equal(o.frames[d].length, 3, d + ' has 3 frames');
  for (const f of o.frames[d]) {
    assert.ok(f.w === o.w && f.h === o.h);
    assert.ok(f.countColors() <= 32, d + ' uses <= 32 colours: ' + f.countColors());
    const bb = f.bbox();
    assert.ok(bb && bb.y + bb.h >= o.h - 2, d + ': feet sit on the bottom rows of the sprite');
  }
}
assert.ok(H.overworld('hero_f').h === 24, 'looks without an import still use the generator');

// the overworld puts the feet of a tall sprite on the same line as a short one
const ow = NP.quickStart('Ren', 'm'); ow.msg.close(); ow.tasks = [];
const feet = (hd) => {
  H.hd.enabled = hd; NP.assets.reset && NP.assets.reset();
  const fb = new NP.Bitmap(48, 48);
  ow.player.draw(fb, ow.player.px - 16, ow.player.py - 16, 0);
  const bb = fb.bbox(); return bb.y + bb.h;
};
const a = feet(false), b = feet(true);
console.log('feet row generated', a, 'hd', b);
assert.ok(Math.abs(a - b) <= 2, 'feet line up between the generated and HD sprite');
H.hd.enabled = false;
console.log('hd OK', o.w + 'x' + o.h);
