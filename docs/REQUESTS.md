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
  - NPCs with a custom `script:` (Prof. Bobbin, Mom, Mimi, the rival) are not overridable yet; ask here if you want keys for them.

## Audio
