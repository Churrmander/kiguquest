// Tile-art previews: catalogue sheets, autotile blob tests, animation strips and composed sample scenes.
//
//   node tools/preview-tiles.mjs [all|blobs|terrain|stamps|bg|scenes] [outDir]
//
// Writes PNGs to the scratch preview dir (see DESIGN §1). Uses its own tiny grid+stamp placement code (the real map
// format belongs to the engine) — see renderMap() below.
import fs from 'node:fs';
import path from 'node:path';
import { loadNP, ROOT } from './load.mjs';
import { writePNG, sheet } from './png.mjs';

const CORE = ['src/core/color.js', 'src/core/rng.js', 'src/core/bitmap.js', 'src/core/font.js', 'src/core/ns.js'];
const MINE = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/art/tiles/files.json'), 'utf8'));
const what = process.argv[2] || 'all';
const OUT = process.argv[3] || '/private/tmp/claude-502/-Users-christophercopus-Documents-Claude-Games-notpokemon/17c0c823-4492-46f1-8ca7-7a6b9279228f/scratchpad/preview/tiles';
const { NP } = loadNP({ files: [...CORE, ...MINE] });
const { Bitmap, Font } = NP;
const tiles = NP.art.tiles;
fs.mkdirSync(OUT, { recursive: true });
const out = (name) => path.join(OUT, name);
const want = (k) => what === 'all' || what === k || what.split(',').includes(k);

// ------------------------------------------------------------------------------------------------ tiny map renderer
/**
 * rows: array of strings; legend: char -> terrain id; stamps: [{ id, x, y, variant }]; actors: [{ x, y, bmp }]
 * (actor = 16x24 bitmap standing with feet in tile (x,y)). tick drives animation.
 */
export function renderMap({ rows, legend, stamps = [], actors = [], tick = 0 }) {
  const H = rows.length, W = rows[0].length;
  const bmp = new Bitmap(W * 16, H * 16);
  bmp.clear('#000000');
  const idAt = (x, y) => (x < 0 || y < 0 || x >= W || y >= H ? null : legend[rows[y][x]] || legend['.']);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const id = idAt(x, y);
    const t = NP.terrain[id];
    if (!t) throw new Error('no terrain ' + id + ' for ' + rows[y][x]);
    const mask = tiles.computeMask(idAt, x, y);
    const fr = tiles.frameAt(t, tick);
    bmp.blit(tiles.terrain(id, mask, fr, tiles.variantAt(id, x, y)), x * 16, y * 16);
  }
  const defs = stamps.map((s) => ({ ...s, def: NP.stamps[s.id] }));
  for (const s of defs) if (!s.def) throw new Error('no stamp ' + s.id);
  // floor layer
  for (const s of defs.filter((s) => s.def.layer === 'floor')) bmp.blit(tiles.stamp(s.id, s.variant, tiles.frameAt(s.def, tick)), s.x * 16, s.y * 16);
  // objects + actors sorted by bottom row
  const objs = [];
  for (const s of defs.filter((s) => s.def.layer !== 'floor')) objs.push({ bottom: s.y + s.def.h, kind: 's', s });
  for (const a of actors) objs.push({ bottom: a.y + 1, kind: 'a', a });
  objs.sort((p, q) => p.bottom - q.bottom || (p.kind === 's' ? -1 : 1));
  for (const o of objs) {
    if (o.kind === 's') {
      const b = tiles.stamp(o.s.id, o.s.variant, tiles.frameAt(o.s.def, tick));
      const over = o.s.def.over * 16;
      bmp.blit(b, o.s.x * 16, o.s.y * 16 + over, { sy: over, sh: b.h - over });
    } else {
      const a = o.a;
      bmp.blit(a.bmp, a.x * 16, a.y * 16 - 8);
      const id = idAt(a.x, a.y);
      const ov = tiles.overlay(id, tiles.frameAt(id, tick));
      if (ov) bmp.blit(ov, a.x * 16, a.y * 16);
    }
  }
  // "over" rows above everything
  for (const s of defs.filter((s) => s.def.layer !== 'floor' && s.def.over > 0)) {
    const b = tiles.stamp(s.id, s.variant, tiles.frameAt(s.def, tick));
    bmp.blit(b, s.x * 16, s.y * 16, { sh: s.def.over * 16 });
  }
  return bmp;
}

/** simple placeholder actor (16x24) so overlays / sorting can be judged */
function dummyActor() {
  const rows = [
    '................', '.....oooooo.....', '....orrrrrro....', '...orrrrrrrro...', '...oHHHHHHHHo...', '...oHsssssHHo...',
    '...osesssesso...', '...osssssssso...', '....osssssso....', '....oBBBBBBo....', '...oBBwBBwBBo...', '...osBBBBBBso...',
    '...osBBBBBBso...', '....oBBBBBBo....', '....obbbbbbo....', '....obbobbbo....', '....obbobbbo....', '....obbobbbo....',
    '....obbobbbo....', '....okkokkko....', '....okkokkko....', '.....oo..oo.....', '................', '................',
  ];
  return Bitmap.fromRows(rows, { o: '#2a1e2e', r: '#e04848', H: '#6a4030', s: '#f8d0b0', e: '#2a1e2e', B: '#e05050', w: '#ffffff', b: '#384890', k: '#503828' });
}

// ------------------------------------------------------------------------------------------------ blob test
const BLOB = [
  '..........................',
  '.####.......#.....###.....',
  '.#####.....###....#.#..#..',
  '.##.###...#####...###.....',
  '.######....###.........##.',
  '..####......#.....#.#..##.',
  '.................#.#.#....',
  '..#.#.#...######..#.#.....',
  '...........#....#.........',
  '.#######...#.##.#..####...',
  '.#.....#...#.##.#..#..#...',
  '.#.###.#...#....#..####...',
  '.#.....#...######..........',
  '.#######...........#......',
  '..........#######..###....',
  '...........................',
].map((r) => r.padEnd(26, '.').slice(0, 26));

function blobTest(id, ground = 'grass', tick = 0) {
  return renderMap({ rows: BLOB, legend: { '.': ground, '#': id }, tick });
}

if (want('blobs')) {
  const ids = Object.keys(NP.terrain).filter((id) => NP.terrain[id].autotile);
  for (const id of ids) {
    const ground = NP.terrain[id].blobGround || 'grass';
    writePNG(out(`blob_${id}.png`), blobTest(id, ground), 3);
  }
  console.log('blobs:', ids.join(' '));
}

// ------------------------------------------------------------------------------------------------ terrain catalogue
if (want('terrain')) {
  const entries = [];
  for (const id of Object.keys(NP.terrain)) {
    const t = NP.terrain[id];
    for (let v = 0; v < t.variants; v++) for (let f = 0; f < t.frames; f++) {
      entries.push({ bmp: tiles.terrain(id, 255, f, v).scaled(2), label: `${id} v${v}f${f}`.slice(0, 16) });
    }
  }
  writePNG(out('terrain_catalogue.png'), sheet(NP, entries, { cols: 12 }), 2);
  // all 47 masks for each autotile terrain
  for (const id of Object.keys(NP.terrain).filter((k) => NP.terrain[k].autotile)) {
    const ents = NP.art.tiles.kit.ALL47.map((m) => ({ bmp: tiles.terrain(id, m, 0, 0), label: String(m) }));
    writePNG(out(`masks_${id}.png`), sheet(NP, ents, { cols: 12, pad: 2 }), 3);
  }
  // overlays
  const ov = [];
  for (const id of Object.keys(NP.terrain).filter((k) => NP.terrain[k].hasOverlay)) {
    for (let f = 0; f < NP.terrain[id].frames; f++) ov.push({ bmp: tiles.overlay(id, f), label: `${id} f${f}` });
  }
  if (ov.length) writePNG(out('overlays.png'), sheet(NP, ov, { cols: 8, checker: true }), 4);
  console.log('terrain catalogue written');
}

// ------------------------------------------------------------------------------------------------ stamps
if (want('stamps')) {
  const entries = [];
  for (const id of Object.keys(NP.stamps)) {
    const s = NP.stamps[id];
    for (const v of s.variants) for (let f = 0; f < s.frames; f++) {
      entries.push({ bmp: tiles.stamp(id, v, f), label: `${id}${s.variants.length > 1 ? ':' + v : ''}${s.frames > 1 ? ' f' + f : ''}`.slice(0, 22) });
    }
  }
  if (entries.length) writePNG(out('stamps_catalogue.png'), sheet(NP, entries, { cols: 10, checker: true, cellW: 112, cellH: 80 }), 2);
  console.log('stamps:', entries.length);
}

// ------------------------------------------------------------------------------------------------ battle backgrounds
if (want('bg')) {
  const ids = tiles.battleBgIds();
  const entries = ids.map((id) => {
    const r = tiles.battleBg(id);
    const b = r.bg.clone();
    for (const p of [r.enemyBase, r.playerBase]) { b.set(p.x, p.y, '#ff00ff'); b.set(p.x - 1, p.y, '#ff00ff'); b.set(p.x + 1, p.y, '#ff00ff'); }
    return { bmp: b, label: id };
  });
  if (entries.length) writePNG(out('battle_bgs.png'), sheet(NP, entries, { cols: 2 }), 2);
  console.log('bgs:', ids.join(' '));
}

export { NP, dummyActor, blobTest };
