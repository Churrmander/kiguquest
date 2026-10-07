# Kigu Quest

*Befriend Kigu. Stitch your story.*

A cosy, all-ages monster-collecting RPG in the look of a late-era 16-bit handheld game (240×160 pixels), written in plain
JavaScript with no dependencies and no build step.

You are an apprentice **Tailor** in **Tsumugi**, a patchwork land stitched together from eight towns. The creatures here
are **Kigu**: spirit-girls who wear living costumes, kigurumi-style onesies shaped like foxes, otters, bunnies, moths and
more. Kigu *choose* to join you by accepting a spool of bond-thread. Along the way you win Buttons from the Master Tailors
of the eight Salons, and you meet the **Starch Society**, who believe the world should be pressed flat and uniform.

The mechanics follow the classic creature-collecting formula (17 types, abilities, natures, IVs and EVs, trainer battles,
eight gyms to an Elite Four and a Champion). The **names, story, characters, art and music are all original.**

## Play it

You need [Node.js](https://nodejs.org) (developed on v26). There is nothing to install.

```bash
git clone https://github.com/Churrmander/kiguquest.git
cd kiguquest
node serve.mjs
```

Then open **http://localhost:4517/** in a browser. Press any key to unlock the audio.

| Key | Action |
|---|---|
| Arrow keys | Move |
| Z or Space | A (talk, confirm) |
| X or Esc | B (cancel; hold to run) |
| Enter | Start (menu) |
| Backspace | Select |
| A / S | L / R |
| M | Mute |
| F | Fullscreen |

Handy URL options: `?quick` skips the title and starts in the Professor's lab (add `&name=Ren&gender=f` to choose who you
are). Saves live in the browser's `localStorage`, so keep using the same address to find your game again.

## Status

Chapters 1 and 2 are playable and tested: Button Town, Route 1, Thimble Village (Salon 1), Route 2, Gingham Woods, the
Spindle Shrine and Hemline (Salon 2), with the first Starch Society scenes and the Paddle and Snip field moves.
Chapter 3 (Seamstead City) is next. The remaining chapters are outlined in `docs/BIBLE.md` and `docs/STORY.md`.

What exists so far: 58 Kigu designs (34 with full game data), 60 moves, 15 abilities, 29 items, 47 human character looks,
37 songs and jingles, 39 sound effects, 31 terrains, 55 map objects and 21 maps. The title screen is still a placeholder.

## How it is built

* **Plain scripts, one global namespace.** Every file is an IIFE that hangs things off a global `NP`. There are no
  modules and no bundler, so it works from a static file server.
* **Everything draws into an in-memory bitmap**, which the browser shell blits to a canvas. That means the whole game, art
  included, also runs **headless in Node**, which is how it is tested and how the art is previewed.
* **Art and music are generated in code** from compact specs: Kigu and human sprites, terrain, buildings, and chiptune
  songs scheduled on the Web Audio API.

```
src/core       bitmap, colour, RNG, bitmap font
src/art        kigu, human, tiles (terrain + stamps), icons
src/audio      chiptune engine, notation, songs, sound effects
src/data       species, moves, abilities, items, types, text hooks
src/engine     scenes, input, UI, tile map
src/game       overworld, battle rules and AI, menus, save state
src/maps       the maps, scripted scenes and shared level helpers
src/platform   the only file that touches the DOM
tests          headless tests (15 files)
tools          dev tools: index builder, art previews, balance bot
docs           design contracts, the world bible, the story bible
```

Run the whole test suite with:

```bash
node tests/run.mjs
```

`index.html` is generated from the per-area `src/*/files.json` manifests. After adding or removing a script, run
`node tools/build-index.mjs`. A few other helpers: `tools/balance-bot.mjs` replays the trainer battles thousands of times
to check difficulty, and the `tools/preview-*.mjs` scripts render art to PNG without a browser.

## Documentation

* [`docs/DESIGN.md`](docs/DESIGN.md): technical rules and the contracts between areas
* [`docs/BIBLE.md`](docs/BIBLE.md): the world, the types, the Kigu roster, tiles, audio lists, the region outline
* [`docs/STORY.md`](docs/STORY.md): the story bible. **Contains spoilers.**
* [`docs/monsters.md`](docs/monsters.md), [`docs/tiles.md`](docs/tiles.md), [`docs/audio.md`](docs/audio.md),
  [`docs/art-kigu.md`](docs/art-kigu.md), [`docs/art-human.md`](docs/art-human.md): per-area notes
