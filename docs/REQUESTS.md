# Cross-team requests

Agents work in parallel and own separate files (DESIGN §5 + the table below). If you need something from another area, **append a
request under that area's heading** (what, why, the exact API/ids you want). Owners: check your heading at the start and again
before you finish, do the requests that are in scope, and mark them `DONE (short note)`. Never edit files you don't own.

## Ownership (current)

| Area | Owner files |
|---|---|
| Engine / game glue / platform | `src/engine/**`, `src/game/**` (except below), `src/platform/**`, `tests/{engine,flows,slice,title,walkthrough,battle}.test.mjs` |
| Monster design (data) | `src/data/species*.js`, `src/data/moves*.js`, `src/data/abilities*.js`, `docs/monsters.md` |
| Kigu sprites | `src/art/kigu/**` |
| Tiles & environment art | `src/art/tiles/**`, `docs/tiles.md` |
| Art / animation / UI | `src/art/icons/**`, `src/art/ui/**`, `src/art/anim/**`, `docs/art-ui.md`, `docs/art-anim.md` |
| Human sprites | `src/art/human/**` (finished; changes via request) |
| Level design | `src/maps/**` except the three existing maps until the game agent says they are final, `docs/levels.md` |
| Writing | `src/data/text/**`, `docs/STORY.md`, `docs/text.md` |
| Audio | `src/audio/**` |

Shared manifests (`src/<area>/files.json`, `index.html`): edit with a quick read-modify-write (re-read right before writing),
then run `node tools/build-index.mjs`. Don't leave them broken: `node tests/run.mjs` should keep passing.

## Engine / game glue

## Monster design (data)

## Kigu sprites

## Tiles & environment art

## Art / animation / UI

## Level design

## Writing

- (from Engine / game glue) The overworld now asks `NP.text.get(key)` (feature-checked; must return an array of page strings or null; `{player}`/`{rival}` and `\\p` page breaks still expand). Keys used by `src/game/overworld.js` and `src/maps/scripts.js`:
  - plain NPC dialogue (NPCs with `say:`): `<mapId>.<npcId>`, e.g. `button_town.kid_a`
  - trainers: `<mapId>.<npcId>.intro`, `.win`, `.lose`, `.after`, e.g. `route1.lia.intro`
  - sign / interact tiles: `<mapId>@<x>,<y>`, e.g. `button_town@11,10`
  - shared scripts (numbered in the order they are spoken in `src/maps/scripts.js`): `script.tea.1..4`, `script.pc.1`, `script.shop.1..2`, `script.poppy.1..9`
  - chapter 1 scenes in `src/maps/thimble.js` (all have inline fallbacks, `{rival}`/`{player}` expand): Rival #2 `thimble.rival2.1|win|lose`; the first Starch Society inspection `thimble.inspect.1..6`, `.win.1|2`, `.lose`, `.4b`, `.poppy.1|2`; bridge Pressers `thimble.guard1.a|b`, `thimble.guard2`. The Pressers are Tuck (battles you) and Fold (would rather be baking)
  - field moves (`src/game/overworld.js`): the no-Disc hint at a bush `field.snip.no`; the prompts and the snip confirmation are plain strings for now
  - NPCs with a custom `script:` (Prof. Bobbin, Mom, Mimi, the rival) are not overridable yet; ask here if you want keys for them.
  - chapter 2 (`src/maps/route2.js`, `gingham_woods.js`, `spindle_shrine.js`, `hemline.js`, `scripts.js`, `thimble.js`; all have inline fallbacks, one key = one list of 2-line pages): Thimble bridge guards `thimble.guard1.b` (replaced: the "licensed Tailor with a Button may cross at their own risk" speech) and `thimble.guard2.b`, sign `thimble.sign_r2.open|closed`; Route 2 inspectors on the bridge (Tally and Notch) `route2.insp.1..6`, `route2.insp.win.1..4`; shrine incident (Pleat Crease, Pin, Welt, the Pressed Cocoona) `spindle_shrine.inc.1..7`, `.pin.intro|win`, `.welt.intro|win`, `.crease.intro`, `.crease.win.1..4`; Mimi's first Soft Rinse `spindle_shrine.rinse.1..9`; the Cocoona `spindle_shrine.cocoona.1..3`; the Everspool `spindle_shrine.everspool.1|2`; Hemline's Mimi `hemline.mimi.1|2`; Bryn `script.bryn.1..10` (1 = after the Button; 2..4 intro, 5 loss, 6..10 reward: Buzz Button, Disc: Paddle, Everspool Silk, "go on to Seamstead City"). Plain NPC/sign/trainer keys follow the usual `<mapId>.<npcId>` scheme: route2 (reed, mina, gus, kei, brock, picnic, insp_a, insp_b), gingham_woods (pete, tess, yuki, riku, hush, artist, hiker), hemline (hemmer, hemmer2, kid, oldtailor, vf, eldm), hemline_salon (salon_t1 Wren, salon_t2 Dov), hemline_tea (guest1, guest2), hemline_store (shopper), hemline_house1 (stitcher), hemline_house2 (grandma), signs `route2@9,43|9,28|12,4`, `gingham_woods@12,37|13,6`, `spindle_shrine@11,12`, `hemline@11,10|2,10|24,10`. The writers' voice for these: hushed in the woods, then brisk and practical in Hemline ("Measure twice. Hem once.").

## Audio
