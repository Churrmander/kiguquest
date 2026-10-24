# AutoSprite art studies

Approved concept sprites made with AutoSprite (October 2026). The Kigu views are **wired into battles**: `node tools/import-autosprite.mjs` turns them into `src/art/autosprite/data.js` (battle-size, palette-indexed), `NP.art.autosprite` serves them with the `NP.art.kigu` cells and anchors, and `NP.assets` prefers them, falling back to the generated art for any missing view. Re-run the tool after adding or fixing a PNG. Heroes are not wired in yet.

In battle the foe shows `-base` (idle bob made in-engine) and switches to `-pose` while she attacks; the player's Kigu shows `-back`. Kigu in the game with no back view yet use the generated back sprite: Ribbelle, Molli, Molluna, Sparkin, Voltessa, Kumi, Kumara, Kumazen. Move, item and status animations are made in-engine in `src/game/battlefx.js`; `node tools/preview-battle.mjs OUTDIR` records a scripted battle to PNG frames.

## What is here

| Folder | Contents |
|---|---|
| `kigu/` | Every Kigu in `docs/BIBLE.md`. `<id>-base.png` is the standing sprite, `<id>-pose.png` the dynamic battle pose, `<id>-back.png` the view from behind for player-owned Kigu (26 so far). |
| `heroes/` | Draco and Dahlia: `-base` standing, `-ready` front battle stance, `-throw` the battle-start spool throw from behind. The throw poses are pinned for animation. |
| `sheets/` | The contact sheets that were reviewed. |
| `manifest.tsv` | Kigu/hero id to AutoSprite character id, needed to make more poses or animations of the same character. |
| `snap.py` | The clean-up script (see below). |

All images are 1024x1024 on white, drawn on an 8px grid (128x128 sprites scaled up 8x). Heroes use a 6px grid.

## How they were made

* **Kigu:** `create_character` with `pixelArt: true` (3 credits), then `generate_pose` (3 credits) for each extra view.
* **Heroes:** `create_character` with `quality: "pro"` (not pixel mode, which comes out chibi), prompted for about 5 heads tall, long limbs and small eyes. Then poses, then the snap.
* **Snap:** the pose tool returns soft images with thousands of colours. `snap.py` takes the median of each 8x8 block and maps it to the nearest colour in that character's own base sprite, so every view keeps the same grid and palette.

## Rules

* **Everything stays inside the frame**, effects included (fire, lightning, threads, wings), with at least 16px of empty margin at 1024px. Say so in every prompt. Before posing anything with big effects, run `pad_character` to about 65-70% (1 credit). `snap.py` prints `EDGE <name>` when something gets too close.
* Back views use the BW player-sprite angle: seen from behind, three-quarters, facing the upper right.

## Open queue

* Back views still missing: Ribbelle, Molli, Molluna. The credits ran out; these cost 3 credits each.
* Ottelia's back view was hand-fixed: her striped tail was repainted teal and her backwards foot cut to a heel. The heel is blunt, so a reroll is optional.
* Mittsy's back view was hand-fixed: the paw pads were painted out.
* Possible rerolls: Molli (reads as a bear), Sheetie (pose barely changed), Warpa (pupil-less eyes; maybe intended).
* Back views for the Phase 2 families and the legendaries are not made yet.
* Drakonia, Voltessa and Webbi poses were rerolled to keep their effects in frame; `pose.png` is the fixed version.
