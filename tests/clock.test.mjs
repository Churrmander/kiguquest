// Day-night clock (2026-10-27): phases from the hour, the Options pin, night-only encounter entries, night evolutions,
// the night battle background, and the outdoor tint with lamps glowing (indoor and dark maps are left alone).
import assert from 'node:assert/strict';
import { boot } from './harness.mjs';

const t = boot(1);
const { NP } = t;
const C = NP.Clock;
const ow = NP.quickStart('Ren', 'f');
const st = NP.state;
ow.msg.close(); ow.tasks = [];

// ------------------------------------------------------------------ phases
assert.equal(C.fake, 12, 'headless runs are pinned to midday');
const at = (h) => { C.fake = h; return C.phase(); };
assert.equal(JSON.stringify([4, 5, 9, 10, 16, 17, 19, 20, 23, 0].map(at)),
  JSON.stringify(['night', 'morning', 'morning', 'day', 'day', 'evening', 'evening', 'night', 'night', 'night']));
C.fake = 21; assert.equal(C.text(), '9:00 PM');
C.fake = 0; assert.equal(C.text(), '12:00 AM');
// the Options pin wins over the device clock (but a test's fake wins over both)
C.fake = null;
for (const [v, ph] of [[1, 'morning'], [2, 'day'], [3, 'evening'], [4, 'night']]) { st.opts.clock = v; assert.equal(C.phase(), ph); }
st.opts.clock = 0;
assert.ok(C.PHASES.includes(C.phase()), 'Auto reads the device clock');
const rows = new NP.OptionsScene().rows();
const row = rows.find((r) => r.name === 'Time of day');
assert.ok(row, 'Options has a Time of day row');
row.set(4); assert.equal(st.opts.clock, 4); assert.equal(C.phase(), 'night'); row.set(0);

// ------------------------------------------------------------------ encounters and evolutions
C.fake = 12;
const list = [{ sp: 'a', w: 1 }, { sp: 'b', w: 1, time: 'night' }, { sp: 'c', w: 1, time: 'morning|evening' }];
assert.equal(C.filter(list).map((e) => e.sp).join(), 'a');
C.fake = 22; assert.equal(C.filter(list).map((e) => e.sp).join(), 'a,b');
C.fake = 18; assert.equal(C.filter(list).map((e) => e.sp).join(), 'a,c');
const plain = [{ sp: 'a', w: 1 }];
assert.equal(C.filter(plain), plain, 'lists with no times are passed through untouched');

const jelly = NP.Kigu.create('jellybob', 22, { ot: 'Ren' });
NP.Weather.dark = false;
C.fake = 12; assert.equal(NP.Kigu.evolutionFor(jelly, { trigger: 'level' }), null, 'Jellybob waits for night');
C.fake = 22; assert.equal(NP.Kigu.evolutionFor(jelly, { trigger: 'level' }).to, 'pompola', 'and evolves at night');
C.fake = 12; NP.Weather.dark = true;
assert.equal(NP.Kigu.evolutionFor(jelly, { trigger: 'level' }).to, 'pompola', 'a dark cave still counts as night');
NP.Weather.dark = false;

// ------------------------------------------------------------------ battle background
ow.loadMap('route1', 10, 10, 'down', { noEnter: true });
assert.equal(NP.maps.route1.battleBg || 'grass', 'grass');
C.fake = 12; assert.equal(ow.battleBg(), 'grass');
C.fake = 22; assert.equal(ow.battleBg(), 'night', 'grass battles outdoors at night');
ow.loadMap('hemline_river', 11, 3, 'down', { noEnter: true });
assert.equal(ow.battleBg(), 'water', 'other backgrounds stay as they are');

// ------------------------------------------------------------------ drawing
function shot(map, x, y, h) {
  C.fake = h;
  ow.loadMap(map, x, y, 'down', { noEnter: true });
  ow.popup = 0;
  const fb = new NP.Bitmap(NP.W, NP.H);
  ow.draw(fb, 0);
  let sum = 0;
  for (let i = 0; i < fb.data.length; i += 4) sum += fb.data[i] + fb.data[i + 1] + fb.data[i + 2];
  return { fb, lum: sum / (fb.data.length / 4) / 3 };
}
const day = shot('route1', 10, 10, 12), night = shot('route1', 10, 10, 22), eve = shot('route1', 10, 10, 18);
assert.ok(night.lum < day.lum * 0.75, 'night is darker: ' + day.lum.toFixed(1) + ' -> ' + night.lum.toFixed(1));
assert.ok(eve.lum < day.lum && eve.lum > night.lum, 'evening sits between');
const inDay = shot('hemline_tea', 5, 6, 12), inNight = shot('hemline_tea', 5, 6, 22);
assert.equal(inDay.lum.toFixed(3), inNight.lum.toFixed(3), 'indoors is never tinted');
// lamps glow at night: the pixels round a lamp head are brighter than the same spot without the glow
const lamp = NP.maps.shibuyarn.stamps.find((s) => s.id === 'lamp');
assert.ok(lamp, 'Shibuyarn has street lamps');
const lit = shot('shibuyarn', lamp.x, lamp.y + 2, 22);
const draw0 = C.draw;
const noLamps = (() => { C.draw = (fb, def, cx, cy) => draw0(fb, Object.assign({}, def, { stamps: [] }), cx, cy); try { return shot('shibuyarn', lamp.x, lamp.y + 2, 22); } finally { C.draw = draw0; } })();
assert.ok(lit.lum > noLamps.lum + 0.2, 'lamp glow brightens the night: ' + noLamps.lum.toFixed(2) + ' -> ' + lit.lum.toFixed(2));

// the start menu shows the time
C.fake = 21;
ow.loadMap('route1', 10, 10, 'down', { noEnter: true });
ow.showClock = true;
ow.draw(new NP.Bitmap(NP.W, NP.H), 0);
ow.showClock = false;
console.log('clock ok');
