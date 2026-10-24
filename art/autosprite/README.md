# AutoSprite art studies

Approved concept sprites made with AutoSprite (October 2026). The Kigu views are **wired into battles**: `node tools/import-autosprite.mjs` turns them into `src/art/autosprite/data.js` (battle-size, palette-indexed), `NP.art.autosprite` serves them with the `NP.art.kigu` cells and anchors, and `NP.assets` prefers them, falling back to the generated art for any missing view. Re-run the tool after adding or fixing a PNG. The heroes' `-throw` poses (spool and thread cut off at the fingertips) are the player trainer at battle start; the game throws its own spool from her hand.

In battle the foe shows `-base` (idle bob made in-engine) and switches to `-pose` while she attacks; the player's Kigu shows `-back`. Kigu in the game with no back view yet use the generated back sprite: Sparkin, Voltessa, Kumi, Kumara, Kumazen. Move, item and status animations are made in-engine in `src/game/battlefx.js`; `node tools/preview-battle.mjs OUTDIR` records a scripted battle to PNG frames.

## What is here

| Folder | Contents |
|---|---|
| `kigu/` | Every Kigu in `docs/BIBLE.md`. `<id>-base.png` is the standing sprite, `<id>-pose.png` the dynamic battle pose, `<id>-back.png` the view from behind for player-owned Kigu (all starters, Meadow Lane, Thimble and Gingham Woods: 29). |
| `heroes/` | Draco and Dahlia: `-base` standing, `-ready` front battle stance, `-throw` the battle-start spool throw from behind. The throw poses are pinned for animation. |
| `npc/battle/` | Battle sprites for all 31 trainers (route trainers, Pressers, Pleat, Madame Damask, the 8 Masters, the trainer classes). Pro mode, pixelized on a 6px grid with 31 colours. |
| `npc/overworld/` | Overworld sprites, `<id>-down/up/left.png` (right = mirror of left) for Draco, Dahlia, every trainer and every non-trainer NPC: 50 characters, 128px art on an 8px grid. |
| `npc/overworld32/` | The same three facings shrunk to the game's 32x32 cell (down, up, left side by side). |
| `npc/manifest.tsv`, `npc/process.py` | AutoSprite ids per NPC, and the script that pixelizes battle art and size-matches/snaps the overworld facings. |
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

* Ottelia's back view was hand-fixed: her striped tail was repainted teal and her backwards foot cut to a heel. The heel is blunt, so a reroll is optional.
* Mittsy's back view was hand-fixed: the paw pads were painted out.
* Possible rerolls: Molli (reads as a bear), Sheetie (pose barely changed), Warpa (pupil-less eyes; maybe intended).
* Back views for the Phase 2 families and the legendaries are not made yet.
* NPC nits: Zip's overworld coat is purple/gold (battle is black/gold); the cook's overworld shows hair under his hat (battle is bald); elders' canes barely show; net kid's net is faint in overworld. Bryn is drawn as a woman per docs/STORY.md, while looks.js says male.
* Overworld sprites are single standing frames per facing; walk-cycle frames are not made yet. The rival uses the other hero's sprites.
* Drakonia, Voltessa and Webbi poses were rerolled to keep their effects in frame; `pose.png` is the fixed version.

## Animation (added 2026-10-24)

| Path | Contents |
|---|---|
| `npc/walk32/<id>.png` | 96x96 walk sheets for the game's 32x32 cells: rows down, up, left (right = mirror); columns stand, left-foot step, right-foot step (the order `src/art/human/ow.js` uses). Heroes use AutoSprite step poses; NPCs use free procedural steps (body drops 1px, stepping foot lifts) made by `npc/walk32.py`. |
| `heroes/<hero>-walk128.png` | The heroes' walk frames at 128px for review (`npc/herowalk.py` builds both sizes). |
| `heroes/rig/` | Paper-doll throw rig per hero: `body`, `head`, `larm`, `rupper`, `rfore`, `spool` pieces (art-pixel scale, draw at 6x), `<hero>-rig.json` with piece offsets, pivots (neck, shoulders, elbow) and suggested keyframe angles, and `<hero>-throw-frames.png` as a rough 4-frame preview. Cut by `rig.py` from an arms-down back pose. |

Notes: the rig is cut from an arms-down pose whose stance is narrower than the approved throw art; the preview rotates the whole arm rigidly, so expect small gaps at the shoulder that the engine or a hand pass should cover. Dahlia's up-facing steps are procedural because her ponytail sits to one side. Sprinting, bikes and fishing are shelved.
