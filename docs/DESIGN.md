# Kigu Quest — Design & Contracts

**What this is.** A monster-collecting RPG in the GBA pixel style (240×160, 16×16 tiles, 15-bit palette), structured and
played like a mainline 5th-generation creature-collecting game — 8 gym-style trials, rivals, an evil team with twin legendary
guardians, an Elite Four and a Champion, Gen-5 battle rules — but with an **original world, story, names, art and music**.
The "creatures" are **Kigu**: cute anime girls wearing living kigurumi-style costumes (animal / plant / object onesies).
The fiction and the fun are entirely our own. Read `docs/BIBLE.md` for the world, roster and lists.

**All-ages.** Everything is wholesome: chibi proportions, modest onesie/costume designs, no fanservice, no sexualised
poses, no gore. Fainting is "falls asleep / too sleepy to go on". Think family-friendly mascot game.

**Originality rule.** Mechanics and genre structure may mirror the classic formula. Names, characters, plot, dialogue, map
layouts, creature designs, sprites and music must be original. Never reproduce or approximate copyrighted creature designs,
names, melodies or text from any existing game.

---

## 1. Tech rules

* Plain JavaScript, **classic `<script>` files, no modules, no build step, no dependencies**. Works from `file://` and from the dev
  server. Every file is an IIFE that hangs things off the global `NP` namespace (template below).
* **Headless-first.** Everything draws into `NP.Bitmap` (RGBA pixel buffer, see `src/core/bitmap.js`). The game's 240×160 screen
  is itself a Bitmap that the browser shell blits to a `<canvas>`. So all art and the whole game can be rendered in Node to PNG
  with no browser. Never touch `document`/`canvas`/`window` from art, data or engine code (only `src/platform/browser.js` may).
* Deterministic: use `NP.RNG` (seeded) for procedural art; `NP.rng` (global game RNG) for gameplay.
* Colours: anything `NP.Color.parse` accepts (`'#rrggbb'`, packed uint32, `[r,g,b]`). Packed form is `0xAABBGGRR` (little-endian).
* Node tests/tools load the same scripts via `tools/load.mjs` → `loadNP({...})`. NOTE: arrays created inside the vm context have a
  different prototype than the test's — use `Array.from(x)` before `assert.deepEqual`.

File template:

```js
/* src/art/kigu/parts.js — one-line description */
(function (root) {
  'use strict';
  const NP = (root.NP = root.NP || {});
  const { Bitmap, Color } = NP;
  // ... your code; export by attaching to NP.art.xxx / NP.data.xxx ...
})(typeof globalThis !== 'undefined' ? globalThis : window);
```

### Script registration (IMPORTANT)
Do **not** edit `index.html`. Each area has a manifest `src/<area>/files.json` — a JSON array of script paths (project-root
relative, in load order) that you own. `node tools/build-index.mjs` regenerates index.html from all manifests. For headless previews
use `loadNP({ files: [...CORE, ...yourFiles] })` (see `tools/load.mjs`; `CORE` = `src/core/{color,rng,bitmap,font,ns}.js`).

### Previewing your work (you can't hear/see it live — render it)
```js
import { loadNP } from './load.mjs';            // from tools/
import { writePNG, sheet } from './png.mjs';
const { NP } = loadNP({ files: [...core, ...mine] });
writePNG('<preview dir>/x.png', bmp, 4, 'checker');           // 4x upscale, checkerboard behind transparency
writePNG('<preview dir>/sheet.png', sheet(NP, [{bmp, label:'konko'}, ...], { cols: 6 }), 3);
```
Then open the PNG with the **Read tool** (it displays images) and judge it like an art director. Iterate until it looks good.
Preview dir (scratch, not part of the repo):
`/private/tmp/claude-502/-Users-christophercopus-Documents-Claude-Games-notpokemon/17c0c823-4492-46f1-8ca7-7a6b9279228f/scratchpad/preview/<your-area>/`

### Tests
Put checks in `tests/<area>.test.mjs` (plain `node:assert`, exit non-zero on failure). `node tests/run.mjs` runs them all.

---

## 2. Constants

| thing | value |
|---|---|
| Screen | 240×160 (`NP.W`, `NP.H`) |
| Tile | 16×16 (`NP.TILE`) |
| Overworld character | 16×24 sprite, feet in the bottom 16×16 tile, head overlaps the tile above |
| Battle Kigu sprite | 64×64, anchored bottom-centre ≈ (32, 62) |
| Party icon | 32×32, 2 frames |
| Item icon | 24×24 |
| Battle background | 240×112 (the text/menu box covers the bottom 48px) |
| Screen layout in battle | foe Kigu anchor ≈ (172, 58); player Kigu anchor ≈ (58, 104) |

---

## 3. Art style guide (applies to ALL art)

Target: the look of a late-era 16-bit handheld RPG — bright, saturated, crisp, readable at 240×160.

* **Palette discipline.** 15-bit colour (call `bmp.quantize15()` on final output). Each *sprite* ≤ 16 colours including outline
  (enforce it in a test). Tiles: ≤ 16 colours per tile is ideal, never a smooth gradient.
* **Outlines.** 1px dark outline in a hue-shifted very dark colour of the material (not pure black) around characters, buildings
  and objects; terrain has soft or no outline. Use `Bitmap.outline()`.
* **Shading.** Flat cel shading, 2–3 tones per material (`Color.ramp(base)` gives a hue-shifted ramp: shadows cooler, highlights
  warmer). Light from the top-left. No anti-aliasing, no blur, no gradients; light ordered dithering only where it helps.
* **Readability first.** Silhouette must read at 1× scale. Eyes are the soul of the cute factor.
* **Consistency.** Everything in the game must look like it belongs to one game — same outline logic, same saturation,
  same light direction.

---

## 4. Contracts (who owns what)

### 4A. Kigu battle sprites — `NP.art.kigu` (owner: Kigu artist; dir `src/art/kigu/`, manifest `src/art/kigu/files.json`)
```js
NP.art.kigu.front(id, opts)  -> Bitmap 64×64   // facing the viewer, foe side. Transparent background.
NP.art.kigu.back(id, opts)   -> Bitmap 64×64   // seen from behind, player side. Same scale/anchor as front.
NP.art.kigu.icon(id, frame)  -> Bitmap 32×32   // party/box icon, frame 0|1 (1px bounce). Simplified, ≤ 12 colours.
NP.art.kigu.has(id) / .ids() / .looks   // looks[id] = the look spec that drives the generator
// opts: { alt: true }  -> alternate rare colourway ("limited edition" costume). Results are cached: callers clone() before mutating.
```
Kigu are **girls in living costumes**: chibi proportions (head ≈ 45–50% of height), big expressive eyes with highlights, tiny
mouth, blush, costume hood/ears/tail/accessories carrying the species' theme. Evolution = the costume gets more elaborate and
the girl a touch taller/older (still chibi). Size by stage: stage 1 ≈ 40–48px tall, stage 2 ≈ 48–56, stage 3 ≈ 54–62.
Must be generated **procedurally in code** from compact look specs (parametric parts + palettes + auto outline/shade), *not*
thousands of hand-placed pixels — the roster will grow, so adding a species should be a ~10-line spec.

### 4B. Humans — `NP.art.human` (owner: Human artist; dir `src/art/human/`)
```js
NP.art.human.overworld(lookId) -> { w:16, h:24, frames:{ down:[b,b,b], up:[b,b,b], left:[b,b,b], right:[b,b,b] } }
        // frame 0 = standing, 1 = left-foot step, 2 = right-foot step. right may be mirrored-left but must be provided.
NP.art.human.front(lookId)     -> Bitmap 64×64  // trainer battle sprite / portrait, facing viewer
NP.art.human.back(lookId)      -> Bitmap 64×64  // back view (required for hero_m / hero_f)
NP.art.human.has(id) / .ids() / .looks / .make(spec) // make(spec) builds the same API object from an ad-hoc spec (quick NPCs)
```
Look ids are listed in BIBLE §4. Same art style as the Kigu (chibi, same outline logic) so humans and Kigu match.

### 4C. World tiles — `NP.terrain`, `NP.stamps`, `NP.art.tiles` (owner: Tile artist; dir `src/art/tiles/`)
A map is a grid of **terrain** tiles (one char = one terrain id per map legend) plus placed **stamps** (multi-tile objects).

```js
NP.terrain[id] = {
  id, solid:false, encounter:null /* 'grass'|'water'|'cave' */, ledge:null /* 'down'|'left'|'right' */,
  water:false,          // needs the Paddle field move to enter (engine handles)
  autotile:false,       // true -> draw() gets the 8-neighbour mask
  group: id,            // terrains sharing a group count as "same" when computing the mask
  variants:1,           // how many deterministic visual variants the engine may choose between (by tile position hash)
  frames:1, animSpeed:16,   // animation frames, ticks per frame (engine advances a global clock)
  step: 'step',         // footstep sfx class: 'step'|'grass'|'sand'|'water'|'wood'|'stone'|'snow'
  hasOverlay:false,     // drawn OVER the actor standing on it (tall grass blades)
  draw(mask, frame, variant) -> Bitmap 16×16,
  drawOverlay(frame) -> Bitmap 16×16 | null
}
// mask bits: N=1 NE=2 E=4 SE=8 S=16 SW=32 W=64 NW=128; bit set = that neighbour is in the SAME group.
// Out-of-map neighbours count as the same group (so edges don't draw borders).

NP.stamps[id] = {
  id, w, h,                         // size in tiles
  solid: ['####','#..#', ...],      // h strings of w chars: '#' blocked, '.' walkable, 'D' door (walkable; maps put a warp there)
  over: 0,                          // number of TOP rows (of h) drawn ABOVE actors (tree canopy, eaves). Rest is below/solid.
  layer: 'obj',                     // 'obj' (default: sorted with actors) | 'floor' (decor directly above terrain, below actors, walkable)
  variants: ['default'],            // named variants (roof colours etc.)
  frames:1, animSpeed:16,
  draw(variant, frame) -> Bitmap (w*16 × h*16)
}

NP.art.tiles.terrain(id, mask, frame, variant) -> Bitmap 16×16   // cached wrapper around NP.terrain[id].draw
NP.art.tiles.stamp(id, variant, frame)         -> Bitmap          // cached wrapper
NP.art.tiles.overlay(id, frame)                -> Bitmap | null
NP.art.tiles.battleBg(id) -> { bg: Bitmap 240×112, enemyBase:{x,y}, playerBase:{x,y} }   // ground discs are part of bg
```
The full list of required terrains/stamps/backgrounds (with priorities P1/P2/P3) is BIBLE §5. Anything you add beyond the list
must be documented in `docs/tiles.md` (id, size, solid rows, variants) so level designers can use it.

### 4D. Icons, FX & UI art — `NP.art.icons` (owner: Icon artist; dir `src/art/icons/`)
```js
NP.art.icons.type(id)        -> Bitmap  // type "pill" 32×12 with the type name (BIBLE §2 colours)
NP.art.icons.status(id)      -> Bitmap  // status tag 24×12: 'brn','psn','tox','par','slp','frz','fnt'
NP.art.icons.item(id)        -> Bitmap 24×24   // BIBLE §6 (plus disc_<typeid> and pin_<typeid> families)
NP.art.icons.badge(n, big?)  -> Bitmap  // "Button" #1–8: 16×16, or 32×32 when big; n=0 -> empty slot silhouette
NP.art.icons.emote(name)     -> Bitmap 16×16    // 'exclaim','question','heart','sweat','note','anger','sparkle','zzz'
NP.art.icons.spool(kind, frame) -> Bitmap 16×16  // thrown Bond Spool (kind: 'bond','silk','gold','master'), frames 0..3 spinning
NP.art.icons.fx(name, frame) -> Bitmap          // particle/effect frames for move animations (BIBLE §7), frame 0..n-1; also .fxFrames(name) -> n
NP.art.icons.logo()          -> Bitmap          // title logo "KIGU QUEST" (≤ 200×56)
NP.art.icons.titleScene()    -> Bitmap 240×160  // title-screen backdrop (no text)
NP.art.icons.has(kind,id) / lists...
```

### 4E. Audio — `NP.audio` (owner: Composer; dir `src/audio/`)
Real-time WebAudio chiptune (2 pulse channels with selectable duty, 1 triangle, 1 noise, optional wave channel), scheduled with a
look-ahead scheduler. Everything must be a **safe no-op when `AudioContext` is missing** (Node tests, headless).
```js
NP.audio.init()                        // create/resume the AudioContext; call from a user gesture; idempotent
NP.audio.playSong(id, {fadeMs, restart})   // same id already playing + !restart => no-op
NP.audio.stopSong(fadeMs)  NP.audio.pauseSong()  NP.audio.resumeSong()  NP.audio.current() -> id|null
NP.audio.playJingle(id, onDone)        // one-shot fanfare: music ducks/pauses, resumes after it ends
NP.audio.sfx(id)                       // one-shot effect (ids in BIBLE §8)
NP.audio.cry(speciesId)                // short synthesized "voice" blip derived deterministically from the species id (pitch/contour)
NP.audio.setVolume({ music, sfx })     // 0..1
NP.audio.songs() / NP.audio.sfxs()     // id lists;  NP.audio.info(id) -> { kind, seconds, loops }
NP.data.songs[id], NP.data.sfx[id]     // the raw data (your own compact text/array notation — document it in docs/audio.md)
```
All music must be **original compositions** (no quotes or near-quotes of existing game music). Each track needs a clear melody,
bassline, harmony (arpeggios) and percussion, a real structure (A/B sections, a proper loop point) and a distinct mood.

---

## 5. Ownership of files (don't edit others' areas)

| Area | Files |
|---|---|
| core (lead) | `src/core/*`, `index.html`, `serve.mjs`, `tools/load.mjs`, `tools/png.mjs`, `tools/build-index.mjs` |
| Kigu art | `src/art/kigu/**`, `tests/kigu-art.test.mjs`, `docs/art-kigu.md` |
| Human art | `src/art/human/**`, `tests/human-art.test.mjs`, `docs/art-human.md` |
| Tile art | `src/art/tiles/**`, `tests/tiles-art.test.mjs`, `docs/tiles.md` |
| Icon art | `src/art/icons/**`, `tests/icons-art.test.mjs`, `docs/art-icons.md` |
| Audio | `src/audio/**`, `tests/audio.test.mjs`, `docs/audio.md` |
| engine / data / maps / game (lead + later teams) | `src/engine/**`, `src/data/**`, `src/maps/**`, `src/game/**` |

Extra helper scripts are fine under `tools/` if prefixed with your area (e.g. `tools/preview-kigu.mjs`).

## 6. Reporting
When done, reply with: what you built, the final file list (and that your `files.json` is correct), the public API exactly as
implemented (note any deviation from this doc), known gaps, and the path of your best preview PNGs.
