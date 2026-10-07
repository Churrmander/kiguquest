# Text & dialogue — `NP.text` (owner: Writer)

All player-facing words that are not hard-wired in a script can live in `src/data/text/**` and are looked up by **key**.
A key that has an entry **overrides** the inline string in the map file; a key without an entry falls back to the inline string
(so a map can ship before its text exists, and text can ship before its map). Nothing here can throw: missing = `null`.

Story context (who is who, tone, chapter beats): `docs/STORY.md`. Branding rules and forbidden words: the last section here.

## API (`src/data/text/_api.js`, loaded before every other text file)

```js
NP.text.add({ 'route1.hiker': ['Page one.', 'Page two.'], 'route1@14,37': 'One page.' })   // authoring (string | string[])
NP.text.addBank({ 'class.hiker.intro': ['variant A', ['variant B p1', 'variant B p2']] })   // alternatives (see "Class banks")
NP.text.get(key)            // -> string[] (pages) | null        used by src/game/overworld.js (sayT, NPC dialogue, signs)
NP.text.t(key, vars, dflt)  // -> ONE formatted string, pages joined by '\\p'. For system lines: msgWait(NP.text.t('sys.battle.go', {kigu}))
NP.text.pages(key, vars)    // -> formatted string[] | null
NP.text.fmt(str, vars)      // {var} substitution: vars first, then NP.fmtVars (player, rival); unknown {names} stay as written
NP.text.has(key) keys() bankKeys() variants(key) isBank(key) budget(key)
NP.text.VARS                // the list of known variables (tests reject any other {name})
```

Every array element is **one message** (one `say`, shown as one box). Keep each element to **2 lines**; if you need a third line,
start a new element. (`\\p` inside a string also starts a new box and is still accepted, but arrays read better.)

## Keys (the contract with the maps and scripts)

| kind | key | used by |
|---|---|---|
| plain NPC (`say:`) | `<mapId>.<npcId>` | overworld `interact()`; e.g. `thimble.vf` |
| trainer, before the fight | `<mapId>.<npcId>.intro` | `trainerEncounter` |
| trainer, after the player wins | `<mapId>.<npcId>.win` | said in the overworld after the fight |
| trainer, when the player **loses** | `<mapId>.<npcId>.lose` | shown in the battle ("the trainer's victory line"); keep it short, pages are joined with a space |
| trainer, chatting afterwards | `<mapId>.<npcId>.after` | talking to a beaten trainer |
| sign / interact tile | `<mapId>@<x>,<y>` | overworld `interact()` (e.g. `route1@14,37`) |
| shared scripts | `script.<name>.<n>` | `scripts.js` (`tea`, `pc`, `shop`, `poppy`) via `c.sayT(key, dflt)` |
| story scenes | `story.<scene>.<n>` | cutscene scripts, `c.sayT('story.lab_intro.1', dflt)`; `<n>` = order of speaking |
| system / battle / menu strings | `sys.<area>.<name>` | engine glue (request filed in `docs/REQUESTS.md`) |
| trainer class banks | `class.<class>.<intro\|win\|lose\|after>` | automatic fall-back, see below |

`c.sayT(key, dflt)` = "say the writer's text for `key` if it exists, else `dflt`" (`dflt` = string or array of pages).

### Class banks (reusable trainer lines)
`class.<class>.<intro|win|lose|after>` are **banks**: `NP.text.variants(key)` is a list of alternatives; variant *i* of `intro`,
`win`, `lose` and `after` belong together (one little personality). The class key is the trainer's `cls` lower-cased with
non-letters turned into `_` (`'Net Kid'` -> `net_kid`). **Level designers: just leave `intro`, `win`, `lose` and/or `after` out of a
trainer object** (keep `cls`) and `NP.text.get('<mapId>.<npcId>.intro')` automatically returns a class-bank line; trainers of the
same class on the same map get different variants. Inline text or an explicit `<mapId>.<npcId>.intro` key always wins. To add
a class, add `addBank` entries in `src/data/text/classes.js` (ask the Writer). Available classes are listed at the end of this file.

## Variables

`{player}`, `{rival}` work everywhere (`NP.fmtVars`). The rest are supplied by the code that speaks the line
(`NP.text.t(key, {kigu:'Konko'})`) and only appear in `sys.*` keys, `story.*` keys the script fills in, and a few trainer lines.

| var | meaning | var | meaning |
|---|---|---|---|
| `{player}` `{rival}` | names (default rival *Tomo*) | `{kigu}` | a Kigu's display name |
| `{mon}` | battle label: "Konko", "Wild Mittsy", "Foe Peepi" | `{foe}` | the opposing Kigu's label |
| `{trainer}` `{cls}` `{name}` | "Tailor Lia" / "Tailor" / "Lia" | `{item}` `{move}` `{old}` | item / move / forgotten-move name |
| `{stat}` | Attack, Sp. Def, Speed, accuracy... | `{n}` `{lv}` `{hp}` `{exp}` `{money}` `{count}` | numbers (write `$` in the text) |
| `{to}` `{from}` | evolution target / source species | `{place}` | a place name |
| `{status}` | burned / poisoned / paralyzed / asleep / frozen | `{starter}` `{rstarter}` | player's / rival's starter species |
| `{twin}` `{twin2}` | the twin you befriended / the other (Warpa, Weftie) | | |

Rules: a `{var}` not in this table fails the test. Do not put a variable at the very start of a sentence if it could be
"Wild Mittsy" vs "Konko" and read oddly; the `sys.*` lines are written so both forms work ("{mon} used {move}!").

## Width budget (the box the text is shown in)

* Message box: 240 px wide, text area **216 px**, **2 lines per box**, small proportional font (`NP.Font`, ~5.4 px per
  character on average, so about **38-40 characters per line, 75 per box**). Wrapping is greedy by words (`Font.wrap`), `\\n` forces a
  line break, `\\p` a new box.
* The test (`tests/text.test.mjs`) formats every line with worst-case variable values (an 8-letter `{player}`, a 10-letter `{kigu}`...),
  wraps it exactly like `NP.ui.Message.paginate`, and fails if any message is over 2 lines. Keys starting with `sys.ui.` are
  single-line notes drawn directly on a panel (<= 224 px). `sys.battle.prompt` is the half-width "What will X do?" box (112 px x 2).
* Speaker prefix: only in scenes where the speaker is not obvious (2+ speakers, off-screen voices): `Mimi: Hi!`, `{rival}: Hmph.`
  Plain NPCs never need a name prefix.
* Typography: straight quotes and apostrophes, `...` (three dots), `-` for a dash. Available glyphs include `♥ ★ ♪ …`; avoid anything else.
  No ALL CAPS shouting except signs, which use a first line in capitals (`THIMBLE VILLAGE`) then a line break.

## Branding / originality / all-ages (enforced by the test)

Say **Kigu** (never monster/creature), **Tailor** (never trainer), **Salon** (gym), **Button** (badge), **Master Tailor** (gym leader),
**the Four Needles / the Grand Tailor** (Elite Four / champion), **Sketchbook**, **Tea House**, **General Store**, **Bond Spool**,
**Stitch Bond** / **befriend** (never catch/capture/tame). Kigu "fall asleep" ("too sleepy to go on"), nobody is hurt, nothing dies.
Never use real-franchise names or terms (see the glossary in `docs/STORY.md` §14). Wholesome: no fanservice, no insults at the
player, no swearing ("darn" and "drat" are the strongest words in Tsumugi).
