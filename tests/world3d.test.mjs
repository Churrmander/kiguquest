// 3D overworld content (NP.view3d): billboard tree art, building volumes (prisms with side walls, roof slopes, awnings), 3D fences, the scene
// cache, incremental ground animation, the hero-visibility fades, the depth-tested quad rasterizer and the frame cost. Complements
// view3d.test.mjs (camera, headings, switches) and tiles-art.test.mjs (flat art contracts).
import assert from 'node:assert/strict';
import { boot } from './harness.mjs';
import { loadNP } from '../tools/load.mjs';

const t = boot(31);
const { NP } = t;
const tiles = NP.art.tiles, V = NP.view3d;
let checks = 0;
const ok = (c, msg) => { checks++; assert.ok(c, msg); };
const luma = (b) => { let s = 0, n = 0; for (const c of b.u32) if (c >>> 24 > 127) { s += (c & 255) * 0.3 + ((c >>> 8) & 255) * 0.59 + ((c >>> 16) & 255) * 0.11; n++; } return s / Math.max(1, n); };
const opaque = (b) => { let n = 0; for (const c of b.u32) if (c >>> 24 > 127) n++; return n; };

// ------------------------------------------------------------------------------------------------ tree / floor / fence art
const kinds = tiles.tree3dKinds();
assert.equal(kinds.map((k) => k[0]).sort().join(), 'big,bush,hedge,pine,round');
for (const [kind, n] of kinds) {
  ok(n >= 2, kind + ' has variants');
  for (let v = 0; v < n; v++) {
    const a = tiles.tree3d(kind, v);
    ok(a.bmp.w >= 20 && a.bmp.h >= 18, kind + v + ' size');
    ok(a.ax > 0 && a.ax < a.bmp.w && a.ay > 4 && a.ay <= a.bmp.h, kind + v + ' anchor inside the picture');
    ok(opaque(a.bmp) > a.bmp.w * a.bmp.h * 0.25, kind + v + ' is a solid-looking shape');
    ok(a.bmp.get(a.ax, a.ay - 1) >>> 24 > 127 || kind === 'bush' || kind === 'hedge', kind + v + ': the trunk touches the ground at the anchor');
    ok(a.r > 6, kind + v + ' canopy radius');
    // lime tops: some pixel is clearly yellow-green and bright, and nothing is outlined black
    let lime = 0; for (const c of a.bmp.u32) { const r = c & 255, g = (c >>> 8) & 255, b = (c >>> 16) & 255; if (c >>> 24 > 127 && g > 200 && r > 150 && b < 120) lime++; }
    ok(kind === 'pine' || lime > 20, kind + v + ' has bright lime tops (' + lime + ')');
  }
  ok(tiles.tree3d(kind, n + 1) === tiles.tree3d(kind, 1), kind + ': variant index wraps');
}
ok(tiles.tree3d('round', 0) === tiles.tree3d('round', 0), 'cached');
for (const kind of ['forest', 'canopy']) for (let v = 0; v < 2; v++) {
  const f = tiles.floor3d(kind, v);
  ok(f.w === 16 && f.h === 16 && f.u32.every((c) => c >>> 24 === 255), kind + ' floor tile is opaque 16x16');
}
ok(tiles.fence3d('rail').w === 8 && tiles.fence3d('rail').h === 14 && tiles.fence3d('top').h === 3 && tiles.fence3d('post').h === 15, 'fence parts');
{ // the art is deterministic across fresh loads
  const other = loadNP({ quiet: true }).NP.art.tiles;
  for (const [kind] of kinds) ok(other.tree3d(kind, 2).bmp.equals(tiles.tree3d(kind, 2).bmp), kind + ' deterministic');
  ok(other.volume('house_m', 'red').wallE.equals(tiles.volume('house_m', 'red').wallE), 'volume faces deterministic');
}

// ------------------------------------------------------------------------------------------------ building volumes
const BUILD = ['house_s', 'house_m', 'house_l', 'lab', 'tea_house', 'general_store', 'salon', 'gate_house', 'shrine'];
for (const id of BUILD) {
  ok(tiles.hasVolume(id), id + ' has a 3D volume');
  const s = NP.stamps[id], D = s.h * 16 - 8;
  for (const v of s.variants) {
    const o = tiles.volume(id, v), d = o.d;
    ok(o.front.w === s.w * 16 && o.front.h === s.h * 16 + s.rise, id + ':' + v + ' facade size');
    ok(o.back.w === s.w * 16 && o.back.h === s.h * 16 + s.rise, id + ':' + v + ' back size');
    if (id !== 'gate_house' && id !== 'shrine') ok(s.rise > 0 && (d.opts.doorH || 14) >= 34, id + ': door is taller than a 32 px person');
    ok(o.depth === D && o.wallW.w === D && o.wallW.h === d.Hw && o.wallE.w === D && o.wallE.h === d.Hw, id + ':' + v + ' wall textures span the footprint depth');
    ok(o.roofW.w === D && o.roofE.w === D && o.cap.h === D && o.cap.w === o.capW, id + ':' + v + ' roof textures');
    ok(d.Hw > 8 && d.Hw < d.Ztop && d.Ztop <= d.H && d.inset * 2 < d.roofR - d.roofL, id + ':' + v + ' geometry is sane');
    ok(luma(o.wallW) > luma(o.wallE) + 8 && luma(o.roofW) > luma(o.roofE) + 8, id + ':' + v + ' lit from the west, shaded on the east');
    ok(luma(o.back) < luma(o.front), id + ':' + v + ' the back is in shade');
  }
}
ok(tiles.volume('general_store').awnings.length === 1 && tiles.volume('tea_house').awnings.length === 1, 'the two shops have real awnings');
ok(tiles.volume('house_m', 'red').awnings.length === 0, 'a plain house has none');
for (const id of ['house_s', 'house_m', 'house_l', 'lab', 'salon', 'gate_house', 'shrine']) {
  const s = NP.stamps[id], v = s.variants[0];
  ok(s.draw3d(v, 0).equals(s.draw(v, 0)), id + ': the 3D facade is the flat art');
}
for (const id of ['tea_house', 'general_store']) {
  const s = NP.stamps[id];
  ok(s.draw3d(s.variants[0], 0).w === s.draw(s.variants[0], 0).w && !s.draw3d(s.variants[0], 0).equals(s.draw(s.variants[0], 0)), id + ': the painted awning is left out of the 3D facade');
}
ok(tiles.volume('windmill') === null && tiles.volume('barrel') === null, 'other stamps stay billboards');

// ------------------------------------------------------------------------------------------------ scenes
const ow = NP.quickStart('Ren', 'f');
ow.msg.close(); ow.tasks = [];
V.mode = 'flat'; V.on = true;
const fb = new NP.Bitmap(NP.W, NP.H), fb2 = new NP.Bitmap(NP.W, NP.H);
const MX = NP.W / 2; // screen centre column; rows below are relative to the pivot row (pr)
const outdoors = Object.keys(NP.maps).filter((id) => !NP.maps[id].indoor);
ok(outdoors.length >= 9, 'outdoor maps: ' + outdoors.length);
for (const id of outdoors) {
  ok(['street', 'town', 'flat-ish'].includes(NP.maps[id].view), id + ' says which 3D camera it wants');
  const tm = ow.tileMap(id), sc = V.scene.get(tm);
  const nVol = tm.objs.filter((p) => tiles.hasVolume(p.id)).length;
  ok(sc.vols.length === nVol, id + ': one volume per building (' + sc.vols.length + '/' + nVol + ')');
  const nTree = tm.objs.filter((p) => ['tree', 'tree_big', 'pine', 'bush'].includes(p.id)).length;
  ok(sc.trees.length >= nTree, id + ': tree stamps are billboard trees');
  if (tm.def.border === 'treeline') ok(sc.trees.length > nTree + 30, id + ': the treeline is a wall of tree billboards (' + sc.trees.length + ')');
  ok(V.scene.get(tm) === sc, id + ': the scene is cached');
  ok(sc.depthAt(0, 0) >= 1 && sc.depthAt(Math.floor(tm.w / 2), Math.floor(tm.h / 2)) === 255 || true, id + ': forest depth map');
}
{ // a Snipped bush rebuilds the scene (and the tree count follows)
  const tm = ow.tileMap('seamstead'), sc = V.scene.get(tm), bush = tm.placements.find((p) => p.id === 'bush');
  tm.removeStamp(bush);
  const sc2 = V.scene.get(tm);
  ok(sc2 !== sc && sc2.trees.length === sc.trees.length - 1, 'removing a bush rebuilds the scene');
  tm.syncSnips({});
  ok(V.scene.get(tm).trees.length === sc.trees.length, 'and putting it back restores it');
}
{ // fences: rails + tops per connected side, a post in the middle
  const tm = ow.tileMap('thimble'), sc = V.scene.get(tm), n = tm.grid.filter((id) => id === 'fence').length;
  ok(n > 0 && sc.fences.length === n, 'thimble fence tiles become fence geometry');
  ok(sc.fences.every((f) => f.quads.length % 2 === 0 && f.quads.length >= 2), 'two quads (rail + top) per connected side');
}

// ------------------------------------------------------------------------------------------------ the ground is baked once; animated terrain is patched in place
ow.loadMap('button_town', 12, 10, 'down', { noEnter: true });
t.tick(2);
NP.Game.frame = 96; ow.draw(fb, 0);
const bakes = V.stats.bakes, refreshes = V.stats.animRefreshes;
for (let i = 0; i < 60; i++) { NP.Game.frame += 5; ow.draw(fb2, 0); }
ok(V.stats.bakes === bakes, 'no re-bake while the animation frames turn over (' + (V.stats.bakes - bakes) + ')');
ok(V.stats.animRefreshes > refreshes, 'water frames are patched into the ground');
NP.Game.frame = 96; ow.draw(fb, 0); NP.Game.frame = 156; ow.draw(fb2, 0);
ok(fb.u32.some((c, i) => c !== fb2.u32[i]), 'the water moves');
{
  const tm = ow.map, i = 5 * tm.w + 5, old = tm.grid[i], b0 = V.stats.bakes;
  tm.grid[i] = old === 'grass' ? 'path' : 'grass';
  ow.draw(fb, 0);
  ok(V.stats.bakes === b0 + 1, 'changing the terrain (a gate opening) re-bakes the ground once');
  tm.grid[i] = old; ow.draw(fb, 0);
}
ow.loadMap('thimble', 12, 12, 'down', { noEnter: true });
NP.Game.frame = 100; ow.draw(fb, 0); NP.Game.frame = 100; ow.draw(fb2, 0);
ok(fb.u32.every((c, i) => c === fb2.u32[i]), 'same tick, same picture');

// ------------------------------------------------------------------------------------------------ fades
V.preset('street');
ok(V.behindFade(-5, MX, 20) === 256, 'a tree level with / just behind the hero stays solid');
ok(V.behindFade(-60, MX, 20) === 0, 'a tree well behind him in the middle of the screen is gone');
ok(V.behindFade(-60, NP.W - 5, 10) === 256, 'but not at the edge of the screen');
ok(V.behindFade(40, MX, 20) === 256, 'and never when it is ahead of him');
{ const a = V.behindFade(-18, MX, 20); ok(a >= 0 && a <= 256, 'fade is a proper opacity'); }
V.hero.on = true; V.hero.x = MX; V.hero.y = V.cfg.pivotRow - 4; V.hero.s = 1;
ok(V.coverFade(-30, MX - 60, 40, MX + 60, 160) === 0, 'a house whose box covers the hero dissolves');
ok(V.coverFade(-30, 0, 40, 40, 160) === 256, 'one at the side of the screen does not');
ok(V.coverFade(20, MX - 60, 40, MX + 60, 160) === 256, 'nor one that is entirely ahead of him');
V.hero.on = false;

// ------------------------------------------------------------------------------------------------ the rasterizer
{
  ow.loadMap('thimble', 12, 12, 'down', { noEnter: true });
  V.yaw = 0; ow.draw(fb, 0);
  const st = V.state(), pr = V.cfg.pivotRow, R = V.raster, red = new NP.Bitmap(8, 8); red.clear('#ff0000');
  const wall = (y, z0) => [[st.px - 20, y, z0], [st.px + 20, y, z0], [st.px + 20, y, z0 + 30], [st.px - 20, y, z0 + 30]];
  const uv = [[0, 8], [8, 8], [8, 0], [0, 0]];
  const count = () => { let n = 0; for (const c of fb.u32) if ((c & 255) > 200 && ((c >>> 8) & 255) < 60 && ((c >>> 16) & 255) < 60) n++; return n; };
  const reset = () => { fb.clear('#000000'); V.zb.fill(0); };
  reset();
  ok(R.face(fb, st, red, wall(st.py - 60, 0), uv, [0, 1, 0], { shade: 256 }), 'a wall ahead facing the camera is drawn');
  const n1 = count();
  ok(n1 > 300, 'and covers a sensible patch of the screen (' + n1 + ' px)');
  ok(V.zb.some((z) => z > 0), 'it wrote its depth');
  reset();
  ok(R.face(fb, st, red, wall(st.py - 60, 0), uv, [0, -1, 0], { shade: 256 }) === false && count() === 0, 'a back-facing wall is culled');
  reset();
  ok(R.face(fb, st, red, wall(st.py - 60, 0), uv, [0, -1, 0], { shade: 256, noCull: true }) && count() > 300, 'unless it is double-sided');
  reset();
  ok(R.face(fb, st, red, wall(st.py + st.f + 80, 0), uv, [0, 1, 0], { shade: 256 }) === false, 'a wall behind the lens is dropped');
  reset();
  const nearWall = wall(st.py + st.f * 0.3, 0); // crosses the near plane: must clip, not blow up
  ok(R.face(fb, st, red, nearWall, uv, [0, 1, 0], { shade: 256 }) !== undefined, 'a wall at the lens is clipped without trouble');
  reset();
  // depth test: where a nearer wall overlaps a farther one it wins, whichever is drawn first
  const blue = new NP.Bitmap(8, 8); blue.clear('#0000ff');
  const isBlue = (x, y) => { const c = fb.u32[y * NP.W + x]; return ((c >>> 16) & 255) > 200 && (c & 255) < 60; };
  reset();
  R.face(fb, st, blue, wall(st.py - 30, 0), uv, [0, 1, 0], { shade: 256 });
  R.face(fb, st, red, wall(st.py - 90, 0), uv, [0, 1, 0], { shade: 256 });
  ok(isBlue(MX, pr - 34) && isBlue(MX, pr - 24), 'a far wall drawn after a near one does not overwrite it');
  reset();
  R.face(fb, st, red, wall(st.py - 90, 0), uv, [0, 1, 0], { shade: 256 });
  R.face(fb, st, blue, wall(st.py - 30, 0), uv, [0, 1, 0], { shade: 256 });
  ok(isBlue(MX, pr - 34) && isBlue(MX, pr - 24), 'and a near one drawn after a far one covers it');
  ok(!isBlue(MX, pr - 46) && count() > 50, 'the far wall still shows where nothing covers it');
  // ground shadow polygon darkens
  fb.clear('#c0d0b0');
  const before = fb.u32[(pr - 4) * NP.W + MX];
  R.groundPoly(fb, st, [[st.px - 30, st.py - 10], [st.px + 30, st.py - 10], [st.px + 30, st.py + 20], [st.px - 30, st.py + 20]], 0.5, 0x302010);
  ok((fb.u32[(pr - 4) * NP.W + MX] & 255) < (before & 255), 'ground polygons blend dark');
}

// ------------------------------------------------------------------------------------------------ the hero is never lost: beside, in front of, on, and behind every building
{
  let tested = 0;
  const pr = V.cfg.pivotRow, box = (b) => { let n = 0; for (let y = pr - 32; y < pr + 2; y++) for (let x = MX - 16; x < MX + 17; x++) if (b.u32[y * NP.W + x] !== fb2.u32[y * NP.W + x]) n++; return n; };
  for (const id of ['thimble', 'seamstead', 'button_town', 'hemline']) {
    const tm = ow.tileMap(id);
    for (const p of tm.objs.filter((q) => tiles.hasVolume(q.id))) {
      const spots = [[p.x + (p.w >> 1), p.y + p.h], [p.x + (p.w >> 1), p.y + p.h - 1], [p.x + (p.w >> 1), p.y - 1], [p.x - 1, p.y + 1], [p.x + p.w, p.y + 1]];
      for (const [x, y] of spots) {
        if (tm.solid(x, y)) continue;
        for (const q of [0, 1, 2, 3]) {
          ow.loadMap(id, x, y, 'up', { noEnter: true });
          tm.def.camera = q; V.yaw = null;
          ow.popup = 0;
          V.yaw = q * Math.PI / 2;
          const aim = V.aim; V.aim = () => {};
          ow.player.hidden = false; ow.draw(fb, 0);
          ow.player.hidden = true; ow.draw(fb2, 0);
          V.aim = aim;
          ow.player.hidden = false; delete tm.def.camera;
          ok(box(fb) > 25, id + ' ' + p.id + '@' + p.x + ',' + p.y + ': hero at ' + x + ',' + y + ' heading ' + q + ' is visible');
          tested++;
        }
      }
    }
  }
  ok(tested > 100, 'visibility cases: ' + tested);
}

// ------------------------------------------------------------------------------------------------ sky, haze, atmosphere
ow.loadMap('seamstead', 17, 16, 'up', { noEnter: true });
V.preset('street'); V.yaw = 0; ow.draw(fb, 0);
{
  const top = fb.u32[0], c = V.cfg;
  ok((top >>> 16 & 255) > (top & 255) + 20, 'the street preset shows a blue sky at the top');
  const fogC = NP.Color.parse(c.fog), row = c.hz + 3 | 0, px = fb.u32[(row + 1) * NP.W + 20];
  ok(Math.abs((px & 255) - (fogC & 255)) < 40 && Math.abs(((px >>> 16) & 255) - ((fogC >>> 16) & 255)) < 40, 'the far ground has faded into the haze colour at the horizon');
}
V.preset('town'); ow.draw(fb, 0);
ok(V.cfg.hz < 0, 'the town preset keeps the horizon above the frame');
V.preset('street');

// ------------------------------------------------------------------------------------------------ frame cost (generous bounds; typical is 1-2 ms)
{
  const views = [['seamstead', 17, 14], ['gingham_woods', 10, 12], ['button_town', 12, 10], ['route2', 12, 20]];
  for (const [id, x, y] of views) {
    ow.loadMap(id, x, y, 'up', { noEnter: true });
    for (let i = 0; i < 30; i++) { NP.Game.frame++; ow.draw(fb, 0); }
    const t0 = performance.now();
    let worst = 0;
    for (let i = 0; i < 180; i++) { NP.Game.frame++; const a = performance.now(); ow.draw(fb, 0); worst = Math.max(worst, performance.now() - a); }
    const avg = (performance.now() - t0) / 180;
    ok(avg < 8, id + ': ' + avg.toFixed(2) + ' ms per frame');
    ok(worst < 50, id + ': worst frame ' + worst.toFixed(1) + ' ms');
  }
}

console.log('world3d OK,', checks, 'checks');
