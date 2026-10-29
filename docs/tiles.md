# World tile notes (level-designer cheat sheet)

Every id in BIBLE §5 marked P1 exists, plus the chapter-2 additions at the bottom of the table (55 stamps, 31 terrains in total). What follows are the
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
| `shrine` | 5x4 | `#####` `#####` `#####` `..D..` | 1 | `default pressed`. The Spindle Shrine: red-roofed hall, giant silk spool on a stone plinth with steps and an arched doorway, lanterns, ribbons. `D` = bottom centre (the approach row either side of it is walkable). `pressed` = drained white/pale blue-grey, threads dead straight, ribbons flat |
| `arcade_cab` | 1x2 | `#` `#` | 0 | `moth button steam hop off` = the game on its screen (`off` = dark, the Shibuyarn brownout); 2 frames. Top row sits on a wall row like `fridge` |
| `claw_machine` | 2x2 | all `#` | 0 | `default off`; 2 frames (chasing lights, the claw swings). Place with its top row on a wall row |
| `prize_shelf` | 2x2 | all `#` | 0 | wall shelving of prizes (plushes, boxed toys, thread, a trophy); place on the two wall rows (y = 0) like `cloth_shelf` |
| `neon_sign` | 2x1 | `##` | 0 | `default off`; 2 frames. Wall decor (a neon spool and thread) for a wall row |
| `gate_house` | 5x3 | `##.##` `##.##` `##.##` | 2 | `default pressed`. Stone-and-timber gatehouse: the centre column is an open arch you walk straight through north-south (all three rows walkable); roof, tie-beam and arch (rows 0-1) draw above actors. `default` has a hanging sign, a shuttered window and a red pennant; `pressed` adds the Starch Society banner (white, blue piping, flat stripes, collar crest) over the window and a white-and-blue pennant. No `D`: do not give it `to`/`name` |

| `house_home` | 5x5 | `#####` x4, `##DD#` | 0 | two storeys, double front door on both `D` cells (every `D` cell is a door warp; the door name points at the first). Roofs `red blue green yellow pink gray` (default `red`). Has a 3D `vol`. `rise` 16 |
| `house_tall` | 5x5 | `#####` x4, `##D##` | 0 | steep roof with a dormer, three rows of windows. Roofs `blue red green yellow pink gray` (default `blue`). 3D `vol`, `rise` 24 |
| `rowhouse` | 2x3 | `##` `##` `D#` | 0 | one terraced house, door in the west column. Side walls and roof run to the stamp edge so a row of them reads as one terrace. 3D `vol` (flush walls) |
| `rowhouse_shop` | 2x3 | `##` `##` `.#` | 0 | `post bakery tackle haberdashery`: shopfront with awning and trade sign; the bottom-left cell is a recessed doorway (walkable, no warp) for the shopkeeper to stand in. 3D `vol` with `setback: 8`, so whoever stands in the doorway stays in front of the face |
| `treehouse` | 3x3 | `###` `###` `#D#` | 0 | plank hut on a platform in an oak; the ladder in the bottom middle is the door |
| `statue` | 4x4 | all `#` | 1 | `wrapped ribbons`: Astara (west, crimson sash) and Anwela (east, leaning, blue ribbons) holding the Everspool on a grey plinth with a bronze plaque (south face, read from below). `wrapped` = under a folded white sheet tied with string, with a tag |
| `boat_fishing` / `boat_cargo` | 2x2 / 5x3 | all `.` | 0 | walk-over boats for the `sea` (the sea blocks), 2 frames of bob. Fishing boat: bow north. Cargo boat: bow east, wheelhouse, crates |
| `kite_snag` / `kite` | 1x2 | `.` `.` | 2 | walk-over. `kite_snag`: a kite caught in the treeline with its string hanging into the tile below. `kite`: flying, 4 frames, string runs to the bottom of the stamp (the kid stands below it) |
| `winch` `lobster_pots` `mooring_post` `firewood` `tyre_swing` `spring_rider` `herb_planter` `storage_kiosk` `patio_table` `picnic_bench` `fountain_s` `leaf_heap` `notice_board` `hay_bale` `watering_can` `scarecrow` `wheelbarrow` `birdbath` `yarn_basket` | 1x1 | `#` | 0 | `spring_rider`: `konko ottopi sprubun`. `herb_planter`: `herbs tomato flowers`. `fountain_s`: 4 frames. `wheelbarrow`: `carrots`. `yarn_basket`: `napping` (a tuxedo Kittabra asleep on it, 2 frames). Most have a small `rise` so they stand up past their tile |
| `net_rack` `swing_set` `picnic_table` `market_cart` `bunting` | 2x1 | `##` | 0 | `market_cart`: `food spool sundries peddler`. `bunting`: 4 frames, the crooked string sags lower at the east post |
| `slide` | 1x2 | `#` `#` | 0 | ladder north, chute south |
| `obstacle_course` `grotto` `big_thimble` `crop_plot` | 2x2 | all `#` (`grotto`: `##` `.#`) | 0 | `grotto` (`west`): mossy rock with a cave mouth in its bottom-left cell. `big_thimble`: the Thimble fountain, 4 frames of water. `crop_plot`: `wheat corn potato carrot cabbage` |
| `crop_row` | 2x1 | `##` | 0 | `tomato onion` |
| `tea_stall` | 3x1 | `###` | 0 | the outdoor tea counter under a striped canopy (Basting Green) |
| `picnic_blanket` | 2x2 | all `.` | 0 | `layer: 'floor'`, `red blue` |
| House pieces (`stamp_home.js`) | | | | `kitchen_counter` 1x1 `plain cakes crumbs`; `table_sq` 2x2; `pet_bed` 1x1 floor + `pet_bed_front` 1x1 walk-over `over 1` (place both on the same tile: the front lip is drawn over whoever stands in the bed); `door_inner` 1x2 (wall); `window_edge` 1x1 `w e s s_tincan` (side and front wall windows); `side_table` 1x1; `grandfather_clock` 1x1; `tv_wide` 2x1 `plain console`; `bookshelf_narrow` 1x2 `cookbooks comics`; `sofa` 4x1; `sewing_basket` `armchair` 1x1; `coat_rack` 2x1 `satchel empty` (wall); `pc_desk` 2x1; `wall_map` 3x1 `pins0`..`pins8`; `calendar` 1x1; `kigu_poster` 2x1; `laundry_basket` 1x1 `overflow folded`; `beanbag` 2x2; `trophy_shelf` 1x1 `<item>[_n|_s|_ns]`, item `empty plush card trophy figure medal` (lay one per tile down a column; `_n`/`_s` mark the run's north and south ends, `_ns` a lone shelf, so a run is one continuous board; 3D: `prism3d`); `bed_double` 2x3 (pillows south) `sleeping unmade made`; `bed_blanket` 2x2 `..` `..` over 2 (the quilt drawn over the sleeping hero; `goneIf`); `toy_chest` 1x1; `nightstand` 1x1 `lamp alarm`; `floor_clutter` 1x1 floor `clothes socks controller figures plushies comic sneakers pebbles petals tuft`. Also new variants: `fridge` `drawings`, `bench` `back`, `bush` `hedge_tree` (still snippable), `shove_rock` `grass` |

Chapter 1 terrains (`terrain_ch1.js`): `worn_grass` (grass group, a trampled trail), `boardwalk` (planks, `step:'wood'`), `grotto_floor` (dark rock floor),
`mulch` (wood chips, autotile with a grass lip), `treeline_secret` (paints exactly like `treeline` and joins it, but is walkable and drawn
again **above** actors (`overActors: true`), so the hero vanishes under the canopy; the 3D view treats it as treeline).

Map options added for Chapter 1:
- `edgeWalls: [{ h: N, x0, x1 }, { v: N, y0, y1 }]`: thin partition walls on tile edges (indoors). `h: N` is the edge between rows N-1 and N
  (x0..x1); `v: N` is the edge between columns N-1 and N (y0..y1). Movement, NPC wandering, sight lines and pathfinding stop at them.
  Art: `edgeWallTerrain` = `wall_wood` (default) / `wall_plaster` / `wall_stone`. `TileMap#edgeBlocked(x, y, dir)`.
- `windowLight: [{ x, y, w, h, from: 'n'|'s'|'e'|'w' }]` and `nightGlow: [{ x, y, w }]` on an indoor map: stepped pools of light on the
  floor that follow the clock (peach morning, pale yellow day, orange evening, blue moonlight with the room dimmed at night).
  `lightPhase()` returns a phase to override the clock (the hero's first morning).
- A building placed with `boxes: true` gets flower boxes under its door-side windows (2D and 3D).
- `town: true` marks a town (no tree shaking). `treeShake: [{ sp, min, max, w, time? }]` is the map's bird table for tree shaking.
- A prop with `glint: true` sparkles every few seconds.
- 3D-only stamp options: `prism3d(variant)` builds the stamp from a few textured quads instead of a billboard (faces
  `{ tex, pts: [[x,y,z] x4] in footprint px, n, noCull?, shade? }`, e.g. the side-on `bench_v`); `art3d: true` gives the billboard
  its own picture (`paint(v, f, '3d')`); `anchor3d: 'back'` stands the billboard at the back edge of the footprint so the footprint's
  ground is in front of it (`grotto_arch`); `clear3d` takes one `[dx, dy, w, h]` rect or a list of them.

Terrains (all from the BIBLE list): `floor_wood` `floor_tile` `floor_stone` plain floors (no autotile); `carpet_red/blue/green` and
`mat` are autotiles with their own group (a border is drawn on every side not touching the same id); `wall_wood/plaster/stone` are
solid autotiles in the shared group `wall` (the tile with floor to its south shows the skirting; wall tiles beside floor or in an
inside corner show the flat wall top); `void` is solid black; `stairs_up/down` are walkable and visual only (a map warp does the work).

`arcade_carpet` (4 position-picked variants, not an autotile): dark navy arcade carpet with small pink zigzags, blue rings and yellow
stars, each motif inside its own tile so any variant sits beside any other. Used as the floor of the Lucky Spool arcade (`src/maps/shibuyarn_arcade.js`).
All five arcade pieces live in `src/art/tiles/stamp_arcade.js`.

`bridge_h` / `bridge_v` (not autotiles, 3 position-picked variants each: plain, red cloth patch, ribbon bow): walkable plank bridge over water
(`water:false`, `step:'wood'`, no encounter). `bridge_h` has rails on the top/bottom edges and planks running left-right; `bridge_v` has rails
left/right and planks top-bottom. They repeat seamlessly end to end (a 1-wide span of any length), animate in step with `water`
(same 8 frames / speed) and live in the `water` autotile group, so neighbouring water draws no bank against them. Lay a bridge from
land to land; the end tiles just butt up against the grass.

Caveat for map authors: `tilemap.js` unblocks the default door tile of any stamp that has a `name` or `to` but no `D` in `solid`,
so a named 1x1 stamp (e.g. a `sign` with `name:`) becomes walkable. Use `to`/`name` only on door stamps.

## Town layout rules (owner's, 2026-10-25): get these right in every new town
These came from fixing the existing towns by hand. Build new towns to them from the start.

**Doors and lanes.** Every building has a 1-tile door (`D` in the bottom row of its `solid`), and the door art is centred on that tile.
A lane leading to a door must be **centred on the door tile**, so the lane needs an **odd width**: use **3 tiles** (door column -1 to +1).
A 2-wide lane is always half a tile off, and that was the bug in 7 doors. A wide street running straight across under the door is fine.
`tests/doors.test.mjs` checks every door in every map and fails if a lane is off-centre.

| Building | Footprint | Door column (from the stamp's x) | Door art | Lane to the door |
|---|---|---|---|---|
| `house_s` | 4x3 | 2 | 18 px | x+1 to x+3, 3 wide |
| `house_m` | 5x4 | 2 | 18 px | x+1 to x+3 |
| `house_l` | 6x4 | 3 | 20 px | x+2 to x+4 |
| `tea_house`, `general_store` | 5x4 | 2 | 18 / 20 px | x+1 to x+3 |
| `lab`, `salon` | 7x5 | 3 | 22 px | x+2 to x+4 |
| `dept_store` | 9x6 | 4 | 30 px (double door) | x+3 to x+5 |

For example, `M.building('tea_house', 4, 6, ...)` has its door at x6, so the lane is `M.rect(5, 10, 3, n, 'c')`.

**Other rules:**
- **Lampposts** stand on the grass at the corners where two roads meet, never mid-verge.
- **Benches** run parallel to the road beside them. Use `bench` (2x1) beside an east-west road and `bench_v` (1x2) beside a north-south one.
- **Plaza features** (fountain, `well`) sit dead centre of the plaza, lined up with the lanes that meet there.
- **Gates** (`gate_house`) are centred on their road, and the road runs straight through the 2-tile arch.
- **Nothing on a path:** no tree, bench, sign or NPC stands on a road tile or in a fence gap.
- **Each town shows its story** (e.g. Hemline's skeps, Buzzlets and honey stall), so add props that fit the town's theme.

## How to add a stamp
1. Pick the file by theme in `src/art/tiles/` (`stamp_buildings.js`, `stamp_nature.js`, `stamp_props.js`, `stamp_indoor.js`; Chapter 1's own pieces are in `stamp_home.js`, `stamp_ch1.js`, `stamp_ch1b.js`).
2. Call `K.stamp(id, { w, h, solid, over, layer, variants, frames, animSpeed, paint(variant, frame) })`; `paint` returns a Bitmap of exactly `w*16 x h*16`.
3. Build it from `K.S.house` (cottages), `K.lobe/blob/cyl/roof` (draw.js) and the palette `K.P`; outline with `K.outer(b, S.omap([[tones, outlineColour]], fallback))`, then `K.shadow` last.
4. `solid` is `h` strings of `w` chars; omit it for fully solid. Doors: put `D` in the bottom row; trees/canopies: `over` = number of top rows.
5. Register the file in `src/art/tiles/files.json`, run `node tools/build-index.mjs`, then `node tests/run.mjs` (tiles-art.test.mjs checks size, determinism, collision rows and map coverage).

## Field-move flags (engine contract)

* Terrain `paddle: true` (set on `water` only, not `sea`): with Disc: Paddle in the bag, the player can face it, press A and paddle over it. `water: true` alone still blocks.
* The `bush` stamp is snippable (Disc: Snip): A on it removes it and its collision; the cut is stored as flag `snip:<map>:<x>,<y>`. Any other stamp is a plain obstacle.
* Props with `gate: 'paddle' | 'snip'` (see `tests/maps.test.mjs`) must be unreachable on foot but reachable once those moves are allowed.
* Fishing (`src/game/fishing.js`): a rod casts at any tile with `water: true` or `fishable: true` in front of the player, if the map has a `def.fishing` table. `sea` is the fast, unpaddleable water (Hemline Riverside uses it so the river can't be used to skip trainers).
* `puddle` (cave floor with a shallow pool): walkable, `encounter: 'puddle'`, the cave's tall grass (Ryukoi's cave). `cave_pool`: deep cave water with rock banks, `water: true` + `fishable: true`, not paddleable.

## Battle backgrounds (`NP.art.tiles.battleBg(id)`)

Nine stages, all painted by `src/art/tiles/battle_*.js` on one shared "late-DS stage" layout (see `docs/ART-TARGET.md` §2): a high-key sky (or
back wall) with a bright haze band at the horizon (y 60; rooms put the wall foot at y 67), a smooth softly lit ground plane, and ONE big oval platform per side. Painted in float
colour with soft alpha blends and finished with an ordered dither into the 15-bit palette (so they are NOT limited to a tiny palette: roughly
200-1000 colours each, but no hard pixel noise; `tests/tiles-art.test.mjs` guards both ends).

| id | where | look |
|---|---|---|
| `grass` | routes, towns | blue sky + cloud bands, patchwork hills, cloth-bolt windmill, lime trees, mown-stripe meadow, sparse flowers |
| `forest` | Gingham Woods, Spindle Shrine | leafy canopy with light shafts, hazy tree-lines, strung festival lanterns, mossy floor, framing trunk |
| `indoor` | houses, shops, Tea House (the `room()` default) | cream wallpaper, wood wainscot, arched window with patchwork curtains, honey plank floor |
| `cave` | caves (no cave map yet) | violet cavern, stalactites, hazy stalagmites, glowing crystals, misty tunnel glow |
| `city` | Seamstead streets | pastel shopfronts with striped awnings, lime trees, bunting, pale cobbled plaza with a kerb |
| `gym` | the three Salons | wine-rose hall, gold-trimmed button banners, warm spotlights, patchwork harlequin quilt floor |
| `water` | (any sea/lake map) | sea gradient with swell lines, island lighthouse, patchwork-sail boat, foam rings round both platforms |
| `night` | (any night map) | indigo sky, stars, moon, lit cottages, strung lanterns, fireflies |
| `society` | Crisp & Co. interiors | cold white-blue pressed-pleat wall, blue frieze, ceiling light panels, flat-iron banner, steam, tiled floor |

Contract: `battleBg(id)` -> `{ id, bg, enemyBase, playerBase, layers, enemyDisc, playerDisc }` (unknown ids fall back to `grass`).
* `bg` is the finished 256x144 composite (`NP.W` x `NP.BOX_Y`, painted natively, no resampling), opaque, platforms included.
  `NP.assets.battleBg` passes the whole object through (its flat fallback is also 256x144 with the same anchors).
* Anchors are the FEET of the battling Kigu and trainers (`src/game/battlescene.js` stands sprites on them): `enemyBase` = (188, 92),
  `playerBase` = (66, 148) in every stage. Front Kigu are 96x96 (anchor (48,94)), the player's back view 128x128 (anchor (64,126)),
  trainers 80x80 (anchor (40,78)); the player's feet lie just below the command box top, as on the DS.
* Platforms (`BB.STAGE`): foe oval 121x23 centred (188, 88) (ends at y 99, just above the player's HP box at y 100); player oval 185x37
  centred (66, 142), cut off by the command box at y 144. Each has a dark steel-blue interior tinted per stage, a lit rim ring, a soft halo
  and a contact shadow.
* Optional extras for a camera sway / intro pan: `layers.sky` (opaque, everything behind the ground), `layers.ground` (transparent above the
  horizon; the `forest` trunk is the one foreground object on it), `enemyDisc` / `playerDisc` = `{ bmp, x, y }` (translucent platform bitmaps,
  x/y = top-left in bg coordinates). `bg` = sky, then ground, then enemyDisc, then playerDisc.
* HUD zones to keep calm: foe HP box (0,10)-(118,38), player HP box (132,100)-(256,140), foe sprite column x 146-230 above y 94,
  command box y >= 144. `K.bb.free(x, y, margin)` tells decor
  scatter code where nothing important stands.

To add a stage: write `BB.define(id, { ...BB.stage(tint), sky(b), ground(b) })` in `battle_nature.js` / `battle_places.js` (helpers: `BB.ramp`,
`vgrad`, `glow`, `shaft`, `streak`, `puff`, `ridge`, `tree`, `lobe`, `poly`, `plane` for perspective floors, `scatter`), then name the id in a map
def as `battleBg`. Keep the haze band bright, the middle (behind the foe sprite, x 146-230) calm, and put identity in the top-right quadrant and along
the horizon band (the foe HP box hides most of the top-left).

## 3D overworld view (`NP.view3d`: `src/engine/persp.js`, `persp_raster.js`, `persp_scene.js`)

Outdoor maps are drawn through a tilted perspective camera (see `docs/ART-TARGET.md` §1): sky and haze at the far end, a perspective ground, billboard
tree clusters, real building volumes, depth-tested sprites. Rooms stay flat. The browser runs it in `auto` mode (3D outdoors, flat indoors); `?flat` in the
URL forces the old flat renderer everywhere and the `V` key flips between the two. Headless code (tests, tools) stays flat unless it sets
`NP.view3d.mode = 'auto' | 'on'` or `NP.view3d.on = true`. A map picks its camera with one line, `view: 'street' | 'town' | 'flat-ish'` (street = low camera
with the horizon and sky in frame; town = higher camera, horizon above the frame; flat-ish = gentle tilt, used if 3D is forced indoors).

What is built from what (all of it is derived from the existing maps; no map data changes, collision is untouched):

| in the map | in 3D |
|---|---|
| terrain `treeline` (and the border outside the map), `hedge` | billboard trees (`tiles.tree3d(kind, variant)`: `round` `big` `pine` `bush` `hedge` in `w3d_trees.js`, lime lobes, no outlines) on a dark forest floor; deep forest shows canopy tops (`tiles.floor3d`) |
| stamps `tree` `tree_big` `pine` `bush` | the same billboards, anchored at the trunk |
| building stamps (`house_*` `rowhouse` `rowhouse_shop` `lab` `tea_house` `general_store` `salon` via `vol(variant)`, which may set `setback` px to move the front face back; `gate_house` `shrine` via `EXTRA` in `w3d_volumes.js`) | a prism: the flat facade art on the front face (painted with `paint(variant, frame, '3d')`, so shop awnings are left out), west / east walls with windows, two roof slopes, a flat cap and a back, plus real slanted awnings (`tiles.volume(id, variant)`); lit from the west, shaded on the east |
| terrain `fence` | posts and rails as geometry (`tiles.fence3d`) |
| every other stamp, every actor | upright sprites with soft contact shadows |

To give a new building a volume: add `vol: (variant) => S.houseVol(options)` to its `K.stamp` (see `stamp_buildings.js`: the options are shared by the flat and 3D
paint) or an entry in `EXTRA` in `w3d_volumes.js`. The hero is never hidden: anything nearer than him gets a keyhole round his sprite, trees and buildings that sit
between the camera and him in the middle of the screen fade out, and big foreground objects dissolve right at the lens (`persp.js` header). Previews:
`node tools/preview-world3d.mjs set | maps | <map> <x> <y> [dir] [--preset=town] [--q=1]`; tests: `tests/view3d.test.mjs`, `tests/world3d.test.mjs`.
