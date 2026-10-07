// Level-design overview renderer: draws a whole map with the real tile renderer (placeholders where art is missing) plus a designer
// overlay: trainer sight lines, warps, spawns, triggers, pickups, hidden items, gates, NPC ids, and a tile ruler.
//
//   node tools/levels-overview.mjs route2 gingham            # one PNG per map in $LEVELS_OUT (default .preview/levels)
//   node tools/levels-overview.mjs designer                  # every map built with NP.levels
//   node tools/levels-overview.mjs route2 --scale 2 --rect 0,30,30,24
//   node tools/levels-overview.mjs salon_hemline --flags gate_salon_hemline_a,badge1 --plain
//   options: --out DIR  --scale N  --rect x,y,w,h (tiles)  --flags a,b,c (story flags set)  --plain (no overlay)  --hidden (draw hidden npcs)
import path from 'node:path';
import { loadNP, ROOT } from './load.mjs';
import { writePNG } from './png.mjs';

const args = process.argv.slice(2);
function opt(name, dflt) { const i = args.indexOf('--' + name); if (i < 0) return dflt; const v = args[i + 1]; args.splice(i, 2); return v; }
function has(name) { const i = args.indexOf('--' + name); if (i < 0) return false; args.splice(i, 1); return true; }
const outDir = opt('out', process.env.LEVELS_OUT || path.join(ROOT, '.preview', 'levels'));
const scale = +opt('scale', 1);
const rectArg = opt('rect', null);
const flagList = (opt('flags', '') || '').split(',').filter(Boolean);
const plain = has('plain');
const showHidden = has('hidden');

const { NP } = loadNP({ quiet: true });
const flags = {};
for (const f of flagList) flags[f] = true;
NP.state = { flags, bag: {}, badges: [], party: [], box: [], dex: { seen: {}, caught: {} }, name: 'Ren', gender: 'f' };

const T = 16, MARGIN = 14;
const DIRV = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };

function drawWorld(tm, actors) {
  const W = tm.w * T, H = tm.h * T;
  const big = new NP.Bitmap(W, H);
  const chunk = new NP.Bitmap(240, 160);
  for (let cy = 0; cy < H; cy += 144) for (let cx = 0; cx < W; cx += 224) {
    chunk.clear('#000000');
    tm.draw(chunk, cx, cy, 0, actors);
    big.blit(chunk, cx, cy, { sx: 0, sy: 0, sw: Math.min(224, W - cx), sh: Math.min(144, H - cy) });
  }
  return big;
}

function visible(n) {
  if (n.hidden && !showHidden) return false;
  const h = n.hideIf;
  if (typeof h === 'string' && flags[h]) return false;
  return true;
}

function makeActors(def) {
  const A = NP.assets, list = [];
  for (const n of def.npcs || []) {
    if (!visible(n)) continue;
    list.push({ sortY: n.y * T + T, draw(fb, cx, cy) {
      const spr = A.human(n.look), set = spr.frames[n.dir || 'down'] || spr.frames.down;
      fb.blendRect(n.x * T - cx + 3, n.y * T - cy + 12, 10, 3, '#000000', 0.22);
      fb.blit(set[0], n.x * T - cx, n.y * T - 8 - cy);
    } });
  }
  for (const p of def.props || []) {
    if (!visible(p)) continue;
    list.push({ sortY: p.y * T + T, draw(fb, cx, cy) {
      let bmp = null, dx = 0, dy = -5;
      if (p.icon === 'spool') bmp = A.spool('bond', 0);
      else if (p.icon && p.icon.indexOf('item:') === 0) { bmp = A.itemIcon(p.icon.slice(5)); dx = -4; dy = -6; }
      if (bmp) fb.blit(bmp, p.x * T - cx + dx, p.y * T - cy + dy);
    } });
  }
  return list;
}

function tint(big, x, y, w, h, color, a) { big.blendRect(x * T, y * T, w * T, h * T, color, a); }
function label(big, s, px, py, color) { NP.Font.draw(big, s, px, py, { color: color || '#ffffff', outline: '#000000' }); }

function overlay(tm, def) {
  const big = tm.big;
  const occupied = (x, y) => (def.npcs || []).some((n) => visible(n) && n.x === x && n.y === y);
  // trainer sight lines (same rule as the engine: stops at solid tiles and at other actors)
  for (const n of def.npcs || []) {
    if (!n.trainer || !visible(n)) continue;
    const [dx, dy] = DIRV[n.dir || 'down'];
    for (let i = 1; i <= (n.trainer.sight || 3); i++) {
      const x = n.x + dx * i, y = n.y + dy * i;
      if (tm.solid(x, y) || occupied(x, y)) break;
      tint(big, x, y, 1, 1, '#ff2020', 0.32);
    }
  }
  // gates
  for (const k of Object.keys(def.gates || {})) for (const [x, y] of def.gates[k].cells) big.strokeRect(x * T, y * T, T, T, '#ff9020');
  // warps
  for (const w of tm.warps.values()) {
    tint(big, w.x, w.y, 1, 1, w.door_ ? '#ffd040' : '#3070ff', 0.45);
  }
  const seen = new Set();
  for (const w of tm.warps.values()) {
    const key = w.to + ':' + (w.spawn || w.door || '');
    const cell = Math.floor(w.x / 4) + ',' + Math.floor(w.y / 4) + key;
    if (seen.has(cell)) continue; seen.add(cell);
    label(big, '>' + w.to, w.x * T + 1, w.y * T + 4, '#bfe0ff');
  }
  // spawns
  for (const [k, s] of Object.entries(def.spawns || {})) {
    big.strokeRect(s.x * T + 1, s.y * T + 1, T - 2, T - 2, '#40ff60');
    label(big, k, s.x * T + 2, s.y * T + 12, '#a0ffb0');
  }
  // triggers
  for (const t of def.triggers || []) {
    tint(big, t.x, t.y, t.w || 1, t.h || 1, '#ffee30', 0.22);
    big.strokeRect(t.x * T, t.y * T, (t.w || 1) * T, (t.h || 1) * T, '#ffee30');
    label(big, t.id || 'trg', t.x * T + 2, t.y * T + 2, '#ffee90');
  }
  // interact spots
  for (const e of def.interact || []) {
    const c = e.hidden ? '#30ffff' : e.snip ? '#ff9020' : '#ff70ff';
    big.fillRect(e.x * T + 6, e.y * T + 6, 4, 4, c);
    if (e.hidden) label(big, 'H', e.x * T + 12, e.y * T + 2, '#30ffff');
  }
  // items (visible props)
  for (const p of def.props || []) if (visible(p)) big.strokeRect(p.x * T, p.y * T, T, T, '#ffe040');
  // npc labels
  for (const n of def.npcs || []) {
    if (!visible(n)) continue;
    label(big, n.id, n.x * T - 2, n.y * T - 14, n.trainer ? '#ff9090' : '#ffffff');
  }
  for (const n of def.npcs || []) if (n.hidden && !showHidden) { big.strokeRect(n.x * T, n.y * T, T, T, '#ffffff'); label(big, n.id + '?', n.x * T - 2, n.y * T - 6, '#c0c0c0'); }
}

function ruler(big, w, h, x0, y0, tw, th) {
  const out = new NP.Bitmap(tw * T + MARGIN * 2, th * T + MARGIN * 2);
  out.clear('#202028');
  out.blit(big, MARGIN, MARGIN, { sx: x0 * T, sy: y0 * T, sw: tw * T, sh: th * T });
  for (let x = 0; x < tw; x++) {
    const gx = x0 + x;
    if (gx % 5 === 0) {
      NP.Font.draw(out, String(gx), MARGIN + x * T + 1, 3, { color: '#c8c8e0' });
      out.vline(MARGIN + x * T, MARGIN, th * T, '#ffffff30');
    }
  }
  for (let y = 0; y < th; y++) {
    const gy = y0 + y;
    if (gy % 5 === 0) {
      NP.Font.draw(out, String(gy), 1, MARGIN + y * T + 4, { color: '#c8c8e0' });
      out.hline(MARGIN, MARGIN + y * T, tw * T, '#ffffff30');
    }
  }
  return out;
}

function render(id) {
  const def = NP.maps[id];
  if (!def) { console.error('no such map', id); return; }
  const tm = new NP.TileMap(def);
  const actors = makeActors(def);
  tm.big = drawWorld(tm, actors);
  if (!plain) overlay(tm, def);
  let [x0, y0, tw, th] = [0, 0, tm.w, tm.h];
  if (rectArg) [x0, y0, tw, th] = rectArg.split(',').map(Number);
  tw = Math.min(tw, tm.w - x0); th = Math.min(th, tm.h - y0);
  const out = ruler(tm.big, tm.w, tm.h, x0, y0, tw, th);
  const file = path.join(outDir, id + (rectArg ? '_' + rectArg.replace(/,/g, '-') : '') + '.png');
  writePNG(file, out, scale);
  console.log(file, `${tm.w}x${tm.h}`);
}

let ids = args.slice();
if (ids.length === 0 || ids[0] === 'designer') ids = Object.keys(NP.maps).filter((k) => NP.maps[k].designer === 'levels');
if (ids[0] === 'all') ids = Object.keys(NP.maps);
for (const id of ids) render(id);
