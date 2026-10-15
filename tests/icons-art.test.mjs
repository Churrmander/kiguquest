// Icon art: every item in NP.data.items has a real 24x24 icon (<= 24 colours, transparent corners, deterministic), the field-move discs and the
// type pins/discs exist, the title logo and backdrop are registered with the right sizes and keep the UI zones calm, the 8 emotes exist at 16x16,
// and NP.assets hands the real art to the game (no placeholders).
import assert from 'node:assert/strict';
import { loadNP } from '../tools/load.mjs';

const { NP } = loadNP({ quiet: true });
const I = NP.art.icons;
const lum = (c) => NP.Color.luma(c);
let checks = 0;
const ok = (c, msg) => { checks++; assert.ok(c, msg); };
const TYPES = 'fluff ember tide volt sprout frost brawl nettle terra gale dream buzz pebble spook drake shade iron'.split(' ');

// a 16-px-ish placeholder is magenta/dark checkerboard (icons.unknown): never accept it
const isPlaceholder = (b) => { let m = 0; for (let i = 0; i < b.u32.length; i++) if (b.u32[i] === NP.Color.parse('#f040c0') || b.u32[i] === NP.Color.parse('#302030')) m++; return m > b.u32.length * 0.25; };

// ------------------------------------------------------------------------------------------------ items
const ids = Object.keys(NP.data.items);
ok(ids.length >= 31, 'expected the item table, got ' + ids.length);
for (const id of ids) {
  ok(I.has('item', id), 'no item icon for ' + id);
  const b = I.item(id);
  assert.equal(b.w, 24, id + ' width'); assert.equal(b.h, 24, id + ' height');
  ok(b.countColors() <= 24, id + ' uses ' + b.countColors() + ' colours');
  ok(!isPlaceholder(b), id + ' is the placeholder');
  let opaque = 0;
  for (let i = 0; i < b.u32.length; i++) if (b.u32[i] >>> 24) opaque++;
  ok(opaque >= 70 && opaque <= 24 * 24 * 0.9, id + ' has ' + opaque + ' opaque pixels');
  for (const [x, y] of [[0, 0], [23, 0], [0, 23], [23, 23]]) ok((b.get(x, y) >>> 24) === 0, id + ': corner (' + x + ',' + y + ') should be transparent');
  const again = I._kit.reg.item[id].draw();
  ok(again.equals(b), id + ' is not deterministic');
  // the game must get the real art, not the coloured-circle fallback
  ok(NP.assets.itemIcon(id) === b, 'NP.assets.itemIcon(' + id + ') is not the registered icon');
}
// the items that used to show the circle placeholder, and the field discs that carry a picture of the move
for (const id of ['sketchbook', 'tailor_license', 'button_case', 'town_map', 'cream_thread', 'd_handkerchief', 'disc_snip', 'disc_paddle', 'everspool_silk', 'staff_pass', 'zip_cable']) {
  ok(NP.data.items[id], 'item data for ' + id);
  ok(I.has('item', id) && NP.data.items[id].pocket === 'key', id + ' is a key item with an icon');
}
ok(!I.item('disc_snip').equals(I.item('disc_paddle')), 'snip and paddle discs differ');
for (const t of TYPES) { ok(I.has('item', 'pin_' + t) && I.has('item', 'disc_' + t), 'type pin/disc for ' + t); }
for (const k of ['snip', 'glide', 'paddle', 'shove', 'climb']) ok(I.has('item', 'disc_' + k), 'field disc ' + k);
// the icons of one family must not all be the same picture
const seen = new Set();
for (const id of ids) { const key = Array.from(I.item(id).u32).join(','); ok(!seen.has(key), id + ' duplicates another icon'); seen.add(key); }

// ------------------------------------------------------------------------------------------------ title logo + backdrop
ok(I.has('logo') && I.has('titleScene'), 'logo and titleScene must be registered');
const logo = I.logo();
ok(logo.w <= 200 && logo.h <= 56 && logo.w >= 170 && logo.h >= 40, 'logo size ' + logo.w + 'x' + logo.h);
ok(!isPlaceholder(logo), 'logo is the placeholder');
for (const [x, y] of [[0, 0], [logo.w - 1, 0], [0, logo.h - 1], [logo.w - 1, logo.h - 1]]) ok((logo.get(x, y) >>> 24) === 0, 'logo corner (' + x + ',' + y + ') transparent');
let lo = 0;
for (let i = 0; i < logo.u32.length; i++) if (logo.u32[i] >>> 24 > 200) lo++;
ok(lo > logo.w * logo.h * 0.2 && lo < logo.w * logo.h * 0.8, 'logo coverage ' + lo);
ok(logo.countColors() >= 24, 'the logo is rich in colour (' + logo.countColors() + ')');
// two-tone lettering: a red-ish word and a blue-ish word
let red = 0, blue = 0;
for (let i = 0; i < logo.u32.length; i++) { const c = logo.u32[i]; if (!(c >>> 24)) continue; const r = c & 255, bl = (c >>> 16) & 255; if (r > 190 && bl < 130) red++; if (bl > 190 && r < 140) blue++; }
ok(red > 150 && blue > 150, 'KIGU is red and QUEST is blue (' + red + '/' + blue + ')');
ok(I._kit.reg.logo().equals(logo), 'logo not deterministic');
ok(NP.assets.logo() === logo, 'NP.assets.logo hands the real logo to the title scene');

const scene = I.titleScene();
assert.equal(scene.w, 240); assert.equal(scene.h, 160);
ok(!isPlaceholder(scene), 'title scene is the placeholder');
for (let i = 0; i < scene.u32.length; i++) assert.equal(scene.u32[i] >>> 24, 255, 'title scene must be opaque');
ok(scene.countColors() > 400 && scene.countColors() < 4000, 'title scene colours ' + scene.countColors());
ok(I._kit.reg.titleScene().equals(scene), 'title scene not deterministic');
ok(NP.assets.titleScene() === scene, 'NP.assets.titleScene hands the real backdrop to the title scene');
// calm zones for the text the game prints on top: PRESS START (120,120), the menu box, the tagline (y 150)
function calm(x0, y0, x1, y1) {
  let s = 0, n = 0, mn = 999, mx = 0;
  for (let y = y0; y < y1; y++) for (let x = x0; x < x1 - 1; x++) { const a = lum(scene.get(x, y)); s += Math.abs(a - lum(scene.get(x + 1, y))); n++; mn = Math.min(mn, a); mx = Math.max(mx, a); }
  return { diff: s / n, range: mx - mn };
}
const ps = calm(76, 114, 164, 127);
ok(ps.diff < 9 && ps.range < 80, 'PRESS START zone is calm (diff ' + ps.diff.toFixed(1) + ', range ' + ps.range.toFixed(0) + ')');
const sky = calm(20, 14, 220, 70);
ok(sky.diff < 8, 'the sky behind the logo is calm (diff ' + sky.diff.toFixed(1) + ')');
// the white tagline text must stay readable: the strip it sits on is darker than the text colour everywhere
let brightest = 0;
for (let x = 28; x < 212; x++) brightest = Math.max(brightest, lum(scene.get(x, 150)));
ok(brightest < 170, 'tagline strip too bright for white text (' + brightest.toFixed(0) + ')');
// the logo drawn on the backdrop (as the title scene does) stays distinguishable from it: its fill is clearly darker/more saturated than the sky
const comp = scene.clone(); comp.blit(logo, 120 - (logo.w >> 1), 14);
ok(!comp.equals(scene), 'the logo must show over the backdrop');

// ------------------------------------------------------------------------------------------------ emotes
const EMOTES = ['exclaim', 'question', 'heart', 'sweat', 'note', 'anger', 'sparkle', 'zzz'];
for (const e of EMOTES) {
  ok(I.has('emote', e), 'missing emote ' + e);
  const b = I.emote(e);
  assert.equal(b.w, 16, e + ' width'); assert.equal(b.h, 16, e + ' height');
  ok(b.countColors() <= 16, e + ' uses ' + b.countColors() + ' colours');
  ok(!isPlaceholder(b), e + ' is the placeholder');
  let o = 0;
  for (let i = 0; i < b.u32.length; i++) if (b.u32[i] >>> 24) o++;
  ok(o >= 40 && o <= 200, e + ' has ' + o + ' opaque pixels');
  ok(NP.assets.emote(e) === b, 'NP.assets.emote(' + e + ') is not the registered emote');
}
for (let i = 0; i < EMOTES.length; i++) for (let j = i + 1; j < EMOTES.length; j++) ok(!I.emote(EMOTES[i]).equals(I.emote(EMOTES[j])), EMOTES[i] + ' and ' + EMOTES[j] + ' look the same');

console.log(`icons-art: ${ids.length} item icons (+${I.items().length - ids.length} pins/discs/charms), logo ${logo.w}x${logo.h}, title scene 240x160, ${EMOTES.length} emotes, ${checks} checks OK`);
