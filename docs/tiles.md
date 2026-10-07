# World tile notes (level-designer cheat sheet)

Every id in BIBLE §5 marked P1 exists (53 stamps, 29 terrains in total). No ids were added beyond that list; what follows are the
decisions BIBLE left open (sizes, solid rows, variants). `solid` rows are written top to bottom: `#` blocked, `.` walkable, `D` door.

| id | size | solid rows | over | variants / notes |
|---|---|---|---|---|
| `house_s` / `house_m` / `house_l` | 4x3 / 5x4 / 6x4 | all `#`, `D` in the bottom row at column `w>>1` (2, 2, 3) | 0 | roofs `red blue green yellow pink gray` (default `red`) |
| `lab` / `tea_house` / `general_store` | 7x5 / 5x4 / 5x4 | all `#`, `D` bottom row column `w>>1` (3, 2, 2) | 0 | none |
| `salon` | 7x5 | all `#`, `D` at column 3 | 0 | 17 variants = the type ids of BIBLE §2 in that order (roof + banner use the type colour) |
| `windmill` | 3x4 | all `#` | 0 | 4 frames, `animSpeed` 10 (sails turn 22.5 degrees per frame) |
| `tree` / `pine` | 1x2 | `.` over `#` | 1 | canopy tile is walkable and drawn above actors |
| `tree_big` | 2x3 | `..` `..` `##` | 2 | canopy tiles walkable, trunk row solid |
| `bush` `boulder` `rock` `stump` `sign` `mailbox` `barrel` `crate` | 1x1 | `#` | 0 | none |
| `haystack` / `well` | 2x2 | all `#` | 0 | none |
| `flowerbed` | 2x1 | `##` (a planter, not walkable) | 0 | `mixed pink yellow red blue` |
| `bench` / `cloth_line` | 2x1 | `##` | 0 | `cloth_line`: 4 frames, `animSpeed` 14 |
| `lamp` | 1x2 | `#` `#` | 1 | none |
| `window` `clock` `poster` | 1x1 | `#` | 0 | wall decor on a transparent tile: place on a wall tile row |
| `bookshelf` / `cloth_shelf` | 2x2 | all `#` | 0 | place on the two wall rows (y = 0) so it covers the wall |
| `shop_shelf` `mannequin` `fridge` `pc_terminal` `bed` `pillar` `ladder` | 1x2 | `#` `#` | 0 | top row sits on a wall row for `fridge`/`ladder`; others stand on the floor |
| `table_s` `tea_healer` `display_case` | 2x1 | `##` | 0 | none |
| `table_l` | 3x2 | all `#` | 0 | none |
| `chair` | 1x1 | `#` | 0 | `up down left right` = the way the chair faces; **default (first) is `up`** (back to the viewer, for a chair south of a table) |
| `tv` `plant` `sewing_machine` `stove` `sink` | 1x1 | `#` | 0 | none |
| `counter_l/m/r/c` | 1x1 | `#` | 0 | l/m/r tile into one bar; `c` = middle piece with a cash register |
| `rug_a` / `rug_b` | 3x2 / 2x2 | all `.` | 0 | `layer: 'floor'` (drawn under actors, walkable) |

Terrains (all from the BIBLE list): `floor_wood` `floor_tile` `floor_stone` plain floors (no autotile); `carpet_red/blue/green` and
`mat` are autotiles with their own group (a border is drawn on every side not touching the same id); `wall_wood/plaster/stone` are
solid autotiles in the shared group `wall` (the tile with floor to its south shows the skirting; wall tiles beside floor or in an
inside corner show the flat wall top); `void` is solid black; `stairs_up/down` are walkable and visual only (a map warp does the work).

Caveat for map authors: `tilemap.js` unblocks the default door tile of any stamp that has a `name` or `to` but no `D` in `solid`,
so a named 1x1 stamp (e.g. a `sign` with `name:`) becomes walkable. Use `to`/`name` only on door stamps.

## How to add a stamp
1. Pick the file by theme in `src/art/tiles/` (`stamp_buildings.js`, `stamp_nature.js`, `stamp_props.js`, `stamp_indoor.js`).
2. Call `K.stamp(id, { w, h, solid, over, layer, variants, frames, animSpeed, paint(variant, frame) })`; `paint` returns a Bitmap of exactly `w*16 x h*16`.
3. Build it from `K.S.house` (cottages), `K.lobe/blob/cyl/roof` (draw.js) and the palette `K.P`; outline with `K.outer(b, S.omap([[tones, outlineColour]], fallback))`, then `K.shadow` last.
4. `solid` is `h` strings of `w` chars; omit it for fully solid. Doors: put `D` in the bottom row; trees/canopies: `over` = number of top rows.
5. Register the file in `src/art/tiles/files.json`, run `node tools/build-index.mjs`, then `node tests/run.mjs` (tiles-art.test.mjs checks size, determinism, collision rows and map coverage).
