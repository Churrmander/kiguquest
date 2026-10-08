# Kigu Quest — Human Cast Brief

Brief for generating character reference sheets (pixel art) for every human in the game.

- **Looks** (colours, outfits, accessories, build) follow `src/art/human/looks.js`, which is the current in-game design.
- **Personality, age and role** follow `docs/STORY.md`.
- **Human looks list** is `docs/BIBLE.md` §4. Where sources disagree, see *Known conflicts* at the end.
- Entries marked **PROPOSED** are story characters with no `looks.js` id yet. Their looks are suggestions and need approval before they go into the game.
- Priority: **P1** = needed in chapters 1–3. **P2** = later. **P1\*** = P1 here but P2 in BIBLE §4 (see conflicts).

Coverage: all 47 ids in `looks.js` (2 DONE, 45 described, excl. 2 Kigu stand-ins, see section 8), 12 PROPOSED characters, and 3 PROPOSED Pleat variants.

---

## How to use this brief

Fill the prompt template once per character. Make one sheet per character and never put two characters on one sheet. Reject any output with anti-aliasing, a missing direction, extra expressions, a battle pose, or a changed outline colour.

**Template** (fill the `{...}` fields from the entry; copy hook lines verbatim):

```
Single character reference sheet. 32-bit DS-era pixel art: crisp square pixels, NO anti-aliasing, no blur, no soft gradients.
DS/DSi-era look (not Game Boy): rich saturated colour, soft 3-4 tone shading, soft selective outline in a darkened version of each material's colour (never pure black).
CAMERA: seen from a raised, slightly top-down angle (about 55-60 degrees): the top of the hair/hat is clearly visible, shoulders and torso a little foreshortened, short legs, large head, bold simple shapes. Limited rich palette, roughly 16-24 colours for the character.
2-3 tone cel shading, light from the top-left. Original design only: nothing copied from any existing game, franchise or show.
Plain flat magenta background (#ff00ff). No ground, no shadow, no scenery, no props outside the character.

CHARACTER: {NAME}, {ROLE IN ONE PHRASE}. Personality: {WORD}, {WORD}.
BODY: {apparent age}, {build}, about 4 heads tall. Skin: {skin tone}.
HAIR: {hair style}, {hair colour}. EYES: {eye colour}. FACE: {default expression}.
OUTFIT: {top with colours and materials}; {bottom with colours and materials}; {shoes with colour}.
ACCESSORIES: {item with colour}; {item with colour}.
SILHOUETTE MUST KEEP: 1) {hook}; 2) {hook}; 3) {hook}.

LAYOUT: one image made of a regular grid of equal-size square cells with even padding between cells. ONE character only.
Rows = directions: Down (front), Up (back), Left, Right.
Columns = walk frames: stand, step A, stand, step B.
That is 4 x 4 = 16 walk cells, all the same size.
Plus one large front-facing portrait (bust-up), placed to the right of the grid, same design.
NO battle poses. NO 8 directions. NO extra expressions. NO other characters.
Keep the same design, colours and proportions in every cell. Text labels are optional and small.
```

**Fill-in rules**
- Use the colour names from the entry. Hex values are in *Consistency checklist → Palette hints*.
- Use the entry's hooks as the silhouette line, word for word.
- Do not name any existing game, franchise or show anywhere in the prompt.
- Do not invent new hair styles, skin tones or outfit pieces. Use the entry.

---

## 1. Protagonists

### DONE: `hero_m` — Hero (boy) · P1
Done. Teen boy, fair skin, messy light-brown hair, blue eyes. Dark grey flat cap, white shirt, navy overalls, brown boots, satchel, belt with spool pouch.

### DONE: `hero_f` — Hero (girl) · P1
Done. Teen girl, fair skin, blonde ponytail, blue eyes. Red beret with gold button, white tee, denim overall-shorts, brown lace-up boots, satchel, belt with spool pouch and scissors.

---

## 2. Rival & friends

### `tomo` — Tomo (rival) · P1
*Story: serious rival, about the hero's age. Clipped and formal. Tidy because his father taught him discipline is love.*
- **Look:** teen boy, slim. Pale skin. Side-parted ink-black hair. Grey eyes.
- **Outfit:** charcoal jacket (#3e4050) with blue starch trim (#4c7ee0) over a white inner shirt. Slate trousers (#5c6478). Black shoes.
- **Accessories:** dark plum glasses (#4a3a58). Blue starch scarf (#4c7ee0).
- **Expression / pose:** flat mouth, stern brows. Arms folded or hands in pockets.
- **Must keep:** glasses; blue scarf; side-parted hair; jacket with white collar.

### `mimi` — Mimi (cheerful friend) · P1
*Story: cheerful friend, talks in exclamation marks, always has a spare snack. Dreams of designing costumes.*
- **Look:** teen girl. Fair skin. Honey bob (#e0a848). Green eyes.
- **Outfit:** pink cardigan (#f28cb4) with white trim, cream (#f4e6c4) under-top. Plum skirt (#6a3066). White legs. Rose shoes (#e0587e).
- **Accessories:** big bow (#f0508a). The bow is drawn at full size every time (running gag: "did my bow get bigger?").
- **Expression / pose:** big grin, happy eyes. Hands clasped or one hand raised.
- **Must keep:** big pink bow; honey bob; pink cardigan; plum skirt.

### `tomo_dad` — Tomo's father · P1 · PROPOSED (no look id yet)
*Story: floor manager at Crisp & Co. Pleasant and empty on the Pressing Floor. Freed at the Starch Works.*
- **Look (proposed):** adult man, average build. Pale skin. Short side-parted ink hair. Grey eyes (family look with Tomo).
- **Outfit (proposed):** white shirt with starch-blue collar (#4c7ee0), navy tie (#2e3c74), charcoal trousers (#3e4050), black shoes.
- **Accessories (proposed):** Crisp & Co. name badge.
- **Expression / pose:** neat and calm. Shirt sleeves rolled once he is freed.
- **Must keep:** blue-collared white shirt; neat parting; name badge.

---

## 3. Professor & family

### `prof_bobbin` — Professor Bobbin · P1
*Story: elderly Kigu researcher. Studies Kigu "because I do not study people". Always searching for the tape measure she is wearing. Younger sister of Madame Damask.*
- **Look:** elder woman, soft and slightly stooped. Pale skin. Silver bun (#c4c8dc). Brown eyes.
- **Outfit:** white lab coat (#f6f4f0) with yellow trim (#f2cc40), lilac (#b494e0) under-top. Slate trousers (#5c6478). Brown shoes.
- **Accessories:** round gold glasses (#c8a020). Tape measure around her neck (the "tape" accessory).
- **Expression / pose:** happy eyes, smile, raised brows, a blush. Hands busy with a notebook or pencil.
- **Must keep:** round gold glasses; tape measure around neck; silver bun; white lab coat with yellow trim.

### `mom` — Mom · P1
*Story: bakes and heals with cocoa. Knows more than she says.*
- **Look:** adult woman. Fair skin. Auburn ponytail (#b0462e). Hazel eyes.
- **Outfit:** teal apron (#2c9294) with white trim, cream (#f4e6c4) under-top. Brown skirt (#7c4e30). Brown shoes.
- **Accessories:** none.
- **Expression / pose:** happy eyes, smile. Hands on the apron or holding a tray.
- **Must keep:** teal apron; auburn ponytail; brown skirt.

### `aide_f` — Lab Aide (girl) · P1
*Story: lab assistant at the professor's lab. Cheerful and steady.*
- **Look:** teen girl. Warm skin. Teal ponytail (#2e9a9c). Teal eyes (#2a8a90).
- **Outfit:** white lab coat (#f6f4f0) with sky-blue trim and inner (#72b0ec). Slate trousers (#5c6478). White shoes.
- **Accessories:** none.
- **Expression / pose:** normal eyes, smile. Holding a clipboard.
- **Must keep:** teal ponytail; sky-blue lab coat; white shoes.

### `aide_m` — Lab Aide (boy) · P1
*Story: lab assistant. Quieter than his colleague.*
- **Look:** teen boy. Tan skin. Messy black hair (#34304a). Dark eyes (#4a3040).
- **Outfit:** white lab coat (#f6f4f0) with sky-blue trim and inner (#72b0ec). Khaki trousers (#c4ac72). Brown shoes.
- **Accessories:** grey-framed glasses (#6a6a7c).
- **Expression / pose:** normal eyes, smile.
- **Must keep:** grey glasses; messy black hair; khaki trousers (differs from aide_f).

---

## 4. Master Tailors

The eight Salons. Each Master is a town leader who gives a Button. Priority follows the chapter order.

### `poppy` — Poppy (Master Tailor, Thimble Village, Fluff) · P1
*Story: 50s, round and warm, mother-hen. Madame Damask's last apprentice. Says "Every stitch counts!"*
- **Look:** adult woman, sturdy and round-faced. Brown skin. Black bun (#34304a). Dark eyes.
- **Outfit:** orange apron (#ec7a2e) with white trim, cream (#f4e6c4) under-top. Denim trousers (#4a64a0). Brown shoes.
- **Accessories:** thread-spool pouches on the apron. Yellow bandana (#f2cc40).
- **Expression / pose:** happy eyes, wide grin. Hand on a spool pouch.
- **Must keep:** orange apron with spool pouches; yellow bandana; black bun.

### `bryn` — Bryn (Master Tailor, Hemline, Buzz) · P1\*
*Story: early 20s, very brave, talks at bee speed. Warden of Gingham Woods. Says "Little threads, big hive!"*
- **Look:** adult, energetic. Brown skin. Curly black hair (#34304a). Dark eyes.
- **Outfit:** teal jacket (#2c9294) with yellow trim (#f2cc40), white inner. Charcoal trousers (#3e4050). Yellow shoes.
- **Accessories:** tape measure. Yellow headband (#f2cc40).
- **Expression / pose:** happy eyes, grin. Mid-stride, one hand out.
- **Must keep:** curly hair with yellow headband; teal jacket with yellow trim; yellow shoes.

### `zip` — Zip (Master Tailor, Seamstead City, Volt) · P1 (chapter 3) · PROPOSED
*Story: 30s showman, stage patter then sincerity. The city's celebrity designer. Says "Plug in and stand out!"*
- **Look (proposed):** adult man. Warm skin. Swept-back platinum quiff (#f0e6c4).
- **Outfit (proposed):** charcoal showman's coat (#3e4050) covered in silver zipper-pull charms (#b8bccc). White shirt. Yellow bow tie (#f2cc40).
- **Accessories (proposed):** sparkle goggles with sky-blue lenses (#72b0ec) pushed up on the forehead.
- **Expression / pose:** big stage grin, arms out wide.
- **Must keep:** coat covered in zipper pulls; sparkle goggles; swept quiff.

### `gusset` — Gusset (Master Tailor, Bobbin Quarry, Terra) · P2 · PROPOSED
*Story: 60, gruff quarry foreman. Barely speaks, hums while working. Says "Solid seams."*
- **Look (proposed):** stout older man, broad and square. Tan skin. Short grey hair (#9c9cac). Brown eyes.
- **Outfit (proposed):** sand-coloured linen work shirt (#c4ac72), sleeves rolled. Olive work trousers (#7c8a3a). Brown tool belt (#7c4e30). Chocolate boots (#5a3424).
- **Accessories (proposed):** yellow hard hat (#f2cc40) with tiny pink and green embroidered flowers.
- **Expression / pose:** flat mouth, unimpressed. Hands in pockets or holding a tool.
- **Must keep:** yellow hard hat with embroidered flowers; broad square build; sand-coloured shirt.

### `dart` — Dart (Master Tailor, Kite Hill, Gale) · P2 · PROPOSED
*Story: 19, mail-balloon pilot. Fearless, competitive, fiercely loyal. Says "Wind's up!"*
- **Look (proposed):** teen woman, lean. Fair skin with freckles. Windswept auburn hair (#b0462e). Sky-blue eyes (#4a9ae0).
- **Outfit (proposed):** brown flight jacket (#7c4e30) covered in mismatched patches (red, yellow, green). Khaki trousers (#c4ac72). Chocolate boots.
- **Accessories (proposed):** amber flying goggles (#d8a030) on the forehead. Sky-blue scarf (#72b0ec).
- **Expression / pose:** bold smirk, hands on hips.
- **Must keep:** windswept auburn hair; sky-blue scarf; patchwork jacket; goggles.

### `purl` — Purl (Master Tailor, Woolen Peak, Frost) · P2 · PROPOSED
*Story: 70s, serene and dry. Knits during battle. Says "Cast on." and "Cast off."*
- **Look (proposed):** elder man, slow and calm. Fair skin. Thin white hair (#ecebf2) and a short white beard. Grey eyes.
- **Outfit (proposed):** enormous hand-knit sweater in icy teal (#2c9294) with cream (#f4e6c4) stripes. Sleeves too long. Charcoal trousers (#3e4050). Brown shoes.
- **Accessories (proposed):** knitting needles tucked into the sweater (silver #c4c8dc).
- **Expression / pose:** calm half-smile, eyes half closed. Hands moving as if knitting.
- **Must keep:** oversized sweater; knitting needles; white hair and beard.

### `rue` — Rue (Master Tailor, Loomhaven, Spook) · P2 · PROPOSED
*Story: 40s, soft voice, deadpan gentle humour. Keeps the Lost & Found. Says "Nothing is ever truly lost."*
- **Look (proposed):** adult woman, slim. Pale skin. Long black hair (#34304a) tied back. Violet eyes (#7a4ac0).
- **Outfit (proposed):** long lantern-keeper's coat in violet mourning silk (#7648b4), grey lining (#9a9aa8), gold buttons (#e8b830). Coat reaches the shins.
- **Accessories (proposed):** brass lantern (#e8b830) held in one hand, lit.
- **Expression / pose:** soft smile, head tilted slightly.
- **Must keep:** long violet coat; brass lantern; long tied-back hair.

### `brocade` — Brocade (Master Tailor, Selvage, Drake) · P2 · PROPOSED
*Story: mid-20s, tall and exacting, secretly kind. Collects teacups mended with gold. Says "Stand tall. Stitch true."*
- **Look (proposed):** tall young woman, perfect posture. Warm skin. Long black braid (#34304a) over one shoulder. Dark eyes (#4a3040).
- **Outfit (proposed):** long brocade coat in indigo (#2e3c74) with gold dragon embroidery (#e8b830) and a high collar. Slate trousers (#3e4050). Black shoes.
- **Accessories (proposed):** a teacup mended with a gold seam (held in one hand).
- **Expression / pose:** composed, unsmiling. Back straight.
- **Must keep:** black braid; gold dragon coat; perfect posture.

---

## 5. The Starch Society

### `madame_damask` — Madame Damask (Society leader) · P1\*
*Story: about 60 (Hester, the sisters' elder). Tall, exquisitely polite, never raises her voice. Pours tea. Her plan: a plain white weave. Says "Do mind the creases, dear."*
- **Look:** tall adult woman, straight-backed. Pale skin. Iron-grey bun (#7c8090). Grey eyes (#6a7088).
- **Outfit:** long gown in slate (#5c6478) with silver trim (#b8bccc). White under-blouse (#f6f4f0). Black shoes.
- **Accessories:** steam-iron brooch at the collar (#c8d0e8).
- **Expression / pose:** sharp eyes, flat mouth, stern brows, long lashes. Hands folded.
- **Must keep:** tall straight silhouette; tight iron bun; silver brooch; plain long gown with no pattern.

### `pleat` — Pleat (Society admin, generic) · P1\* (chapters 2–3 need the named Pleats)
*Story: Society administrators. Each has a human reason for joining and is beaten kindly.*
- **Look:** tall adult man, about 40s. Pale skin. Silver side-parted hair (#c4c8dc). Grey eyes.
- **Outfit:** navy-grey pinstripe suit (#3e4a6e) with a blue starch collar (#4c7ee0) and white under-shirt. Matching trousers. Black shoes.
- **Accessories:** pince-nez (#8a9ac8) and round silver glasses (#c8d0e8).
- **Expression / pose:** sharp eyes, flat mouth, stern brows. Hands neatly at the sides.
- **Must keep:** pince-nez; silver parting; navy suit with blue starch collar.

Named Pleats (all PROPOSED ids, built from `pleat`):

| id | Who | P | Change from `pleat` |
|---|---|---|---|
| `pleat_crease` | Pleat Crease, 20s woman, brisk. "Not one crease out of place!" | P1 (Gingham Woods) | Woman. Hair in a tight dark bun (#282838). Folding ruler in hand. |
| `pleat_serge` | Pleat Serge, 40s salesman. Never stops smiling. "Quality is consistency." | P1 (Crisp & Co.) | Lighter suit with silver pinstripes (#b8bccc). Slicked hair. Permanent smile. |
| `pleat_calender` | Pleat Calender, 50s engineer with a pocket watch. "Right on schedule." | P2 (Starch Works) | Grey hair (#9c9cac). Gold watch chain (#e8b830). |

### `grunt_m` — Presser (male) · P1
*Story: Starch Society grunt. Stiff uniform, says "Flat is fair!" and "Stay in line." Some are homesick.*
- **Look:** adult man. Pale skin. Cropped ink hair (#282838). Grey eyes.
- **Outfit:** white uniform (#f6f4f0) with blue starch collar (#4c7ee0). White trousers. Slate shoes (#5c6478).
- **Accessories:** flat cap (#e8ecf4) with a blue starch band (#4c7ee0).
- **Expression / pose:** serious, flat mouth, stern brows. Stiff upright stance.
- **Must keep:** flat cap; blue starch collar; stiff straight posture.

### `grunt_f` — Presser (female) · P1
*Story: same role as grunt_m.*
- **Look:** adult woman. Pale skin. Ink ponytail (#282838). Grey eyes.
- **Outfit:** white uniform (#f6f4f0) with blue starch collar (#4c7ee0). White skirt. Slate leggings and shoes (#5c6478).
- **Accessories:** flat cap (#e8ecf4) with a blue starch band (#4c7ee0).
- **Expression / pose:** serious, flat mouth, stern brows. Stiff upright stance.
- **Must keep:** flat cap; ink ponytail; white skirt (differs from grunt_m).

---

## 6. Four Needles & Grand Tailor

All P2 except the peddler disguise of Sharps, which is P1. Each Needle is a kind of mending.

### `sharps` — Sharps (Needle, Shade) · P2 · PROPOSED · peddler disguise P1 (`peddler`, PROPOSED)
*Story: masked trickster who is the Guild's scout, and "Mr. Sharp" the peddler in every town. Everyone sees through his disguises. Says "Keep your eyes sharp, friend!"*
- **Look (proposed):** adult man, lean. Tan skin. Slicked black hair (#34304a). Dark sharp eyes (#4a3040).
- **Outfit (proposed, Needle):** charcoal shadow-coat (#3e4050) with plum lining (#6a3066). Black gloves.
- **Accessories (proposed):** black domino mask (#2e2c3a).
- **Peddler disguise (P1, proposed):** cheerful travelling-seller coat in olive (#7c8a3a) with gold buttons (#e8b830). Disguise changes per town. Thimble: false moustache and bowler hat.
- **Expression / pose:** wide grin. Hands rubbing together as a salesman.
- **Must keep:** domino mask (Needle) or false moustache (peddler); grin; the disguise hat.

### `bodkin` — Bodkin (Needle, Brawl) · P2 · PROPOSED
*Story: gentle giant in monk robes, stopped fighting after the Snarl. Speaks in proverbs. Says "Breathe in. Thread through."*
- **Look (proposed):** stout, very tall man. Brown skin. Shaved head. Eyes closed (serene).
- **Outfit (proposed):** monk robes in amber (#eca232) with a brown sash (#7c4e30). Wide sleeves.
- **Accessories (proposed):** wooden prayer beads (#7c4e30).
- **Expression / pose:** calm, closed eyes, hands folded inside the sleeves.
- **Must keep:** closed eyes; broad shoulders; prayer beads; amber robes.

### `darner` — Darner (Needle, Iron) · P2 · PROPOSED
*Story: knightly woman in thimble-plate. Formal and chivalrous, cannot cook. The Guild's auditor. Says "No hole is too small to darn."*
- **Look (proposed):** tall adult woman, upright. Fair skin. Silver braid (#c4c8dc). Grey eyes (#6a7088).
- **Outfit (proposed):** thimble-plate armour in steel (#aab4c8) shaped like a dress. Blue tabard (#3e6ad0) with white trim.
- **Accessories (proposed):** needle lance (silver). Thimble helmet (#aab4c8), optional if readable at small size.
- **Expression / pose:** formal, stiff and upright. Lance held at the side.
- **Must keep:** steel thimble plate; blue tabard; needle lance.

### `tapestry` — Tapestry (Needle, Dream) · P2 · PROPOSED
*Story: ancient, falls asleep mid-sentence. Keeper of the lullaby. The only living person who met the twins as a child. Sex is not stated in STORY; the proposed look is an old woman.*
- **Look (proposed):** elder, small, slightly bent. Pale skin. Long white hair (#ecebf2). Violet eyes (#7a4ac0), half-lidded.
- **Outfit (proposed):** long nightrobe in lilac (#b494e0) with cream trim (#f4e6c4). Soft slippers.
- **Accessories (proposed):** plum nightcap (#6a3066) with a cream pompom (#f4e6c4).
- **Expression / pose:** drowsy, half-lidded eyes, mid-yawn.
- **Must keep:** nightcap with pompom; long nightrobe; half-lidded eyes.

### `sashiko` — Sashiko (Grand Tailor) · P2 · PROPOSED
*Story: old, small and merry. Calls the hero "little stitch". Taught both sisters to sew. Has "retired" four times. Says "Every tear tells a story. Mend it where everyone can see."*
- **Look (proposed):** elder woman, small and round. Warm skin. White hair (#ecebf2) in a bun with silver needles (#c4c8dc) stuck through it. Brown eyes (#7a4a2e), crinkled and merry.
- **Outfit (proposed):** long coat in brown (#7c4e30) covered in hundreds of mismatched patches (red #d8363a, yellow #f2cc40, teal #2c9294, lilac #b494e0, green #4a9a48).
- **Accessories (proposed):** needles in the bun.
- **Expression / pose:** merry, crinkled eyes, hands on hips.
- **Must keep:** patchwork coat; needles in bun; small merry stance.

---

## 7. Townsfolk & generic NPCs

Each row is one look id. Build "adult" is about 4 heads tall. "Stout" means broad, not short.

### Villagers and elders (P1)

| id | Build / sex | Skin, hair, eyes | Outfit (colours) | Accessories / must keep |
|---|---|---|---|---|
| `villager_f1` | adult woman | warm skin; long brown hair; brown eyes | sky-blue dress (#72b0ec) with white trim; brown shoes | long hair; sky-blue dress |
| `villager_f2` | adult woman | pale skin; wavy ginger hair (#e0782e); green eyes | mint cardigan (#7ccaa6), white trim, cream under; forest-green long skirt (#2e6a3e); brown shoes | wavy ginger hair; long green skirt |
| `villager_m1` | adult man | tan skin; short brown hair; brown eyes | olive vest (#7c8a3a), white trim, cream under; brown trousers; chocolate shoes | olive vest |
| `villager_m2` | stout man | warm skin; cropped grey hair; dark eyes; grey moustache | orange tee (#ec7a2e), white trim; denim trousers; brown shoes | moustache; orange tee |
| `elder_m` | elder man | fair skin; bald, white beard (#f6f4f0); dark eyes | forest-green robe (#2e6a3e) with gold trim (#e8b830); brown shoes | white beard; cane; bald head |
| `elder_f` | elder woman | pale skin; white bun; brown eyes; blush | lilac cardigan (#b494e0), white trim, cream under; plum long skirt (#6a3066); brown shoes | cane; white bun |

### Children (P1)

| id | Build / sex | Skin, hair, eyes | Outfit (colours) | Accessories / must keep |
|---|---|---|---|---|
| `child_m` | child boy | warm skin; spiky black hair; brown eyes | yellow tee (#f2cc40), white trim; blue shorts (#3e6ad0); red shoes (#d8363a) | blue cap (#3e6ad0) with white band; spiky hair |
| `child_f` | child girl | fair skin; pink pigtails (#f08cb0); pink eyes (#d0508a) | lilac dress (#b494e0) with white trim; rose shoes (#e0587e) | pink pigtails; lilac dress |

### Shopkeeper and Tea House (P1)

| id | Build / sex | Skin, hair, eyes | Outfit (colours) | Accessories / must keep |
|---|---|---|---|---|
| `shopkeeper` | stout man | warm skin; short chestnut hair (#8e4e2e); brown eyes; moustache | green apron (#4a9a48), white trim, cream under; brown trousers; brown shoes | green apron; moustache |
| `tea_maid` | teen woman | pale skin; plum bob (#6a3a6a); violet eyes (#7a4ac0) | wine maid dress (#8a2a44) with white trim and pink accents (#f28cb4); white legs; black shoes | pink maidcap (#f06a9c); plum bob |

### Trainers (P1)

| id | Build / sex | Skin, hair, eyes | Outfit (colours) | Accessories / must keep |
|---|---|---|---|---|
| `tailor_f` | teen woman | fair skin; copper twin buns (#c8642a); amber eyes (#d08a28) | wine vest (#8a2a44), white trim, cream under; charcoal skirt (#3e4050); slate legs; brown shoes | brown belt and spool pouches; twin buns |
| `tailor_m` | teen man | tan skin; messy brown hair (#6e4630); brown eyes | denim vest (#4a64a0), white trim, cream under; charcoal trousers; brown shoes | brown belt and spool pouches; messy hair |
| `net_kid` | child boy | fair skin; messy blonde hair (#f2cf6a); blue eyes | green hoodie (#4a9a48), white trim; khaki shorts (#c4ac72); brown shoes | amber goggles (#d8a030); red backpack (#d8363a) |
| `picnicker` | teen woman | warm skin; ginger pigtails (#e0782e); green eyes | white tee with red trim (#d8363a); red skirt; white legs; brown shoes | straw hat (#e8c870) with red band; green backpack (#4a9a48) |
| `hiker` | stout man | tan skin; short brown hair; brown eyes; beard | khaki vest (#c4ac72), white trim, red under (#d8363a); olive trousers (#7c8a3a); chocolate shoes | orange backpack (#d06a2a); red headband; beard |

### Other trainers (P2)

| id | Build / sex | Skin, hair, eyes | Outfit (colours) | Accessories / must keep |
|---|---|---|---|---|
| `camper` | teen man | warm skin; spiky ginger hair; green eyes | green vest (#4a9a48), white trim, khaki under; khaki shorts; brown shoes | green cap (#4a9a48) with white band; tan backpack (#c89a64) |
| `skier` | teen woman | pale skin; lavender pigtails (#b09ae0); sky eyes (#4a9ae0) | sky coat (#72b0ec), white trim, white under; navy trousers (#2e3c74); white shoes | pink earmuffs (#f06a9c); pigtails |
| `sailor` | adult man | tan skin; short brown hair; blue eyes; stubble | white sailor top with navy collar (#2e3c74) and red neckerchief (#d8363a); white trousers; navy shoes | navy-and-white cap; stubble |
| `schoolgirl` | teen woman | fair skin; long black hair; dark eyes | navy sailor-collar uniform (#2e3c74), white collar, red tie; navy skirt; white legs; black shoes | long black hair; sailor collar |
| `scientist` | tall man | pale skin; messy platinum hair (#f0e6c4); blue eyes | white lab coat, lilac trim (#b494e0), mint under (#7ccaa6); slate trousers; black shoes | sky-blue goggles (#72b0ec); wide eyes |
| `nurse_aide` | teen woman | fair skin; rose bob (#d8587e); pink eyes (#d0508a) | white dress with pink trim (#f28cb4); white legs; white shoes | pink maidcap; rose bob |
| `rocker` | teen man | pale skin; spiky purple hair (#7a50b0); violet eyes | black jacket with silver trim (#b8bccc), red under; charcoal trousers; red shoes | red sash (#d8363a); purple spiky hair |
| `cook` | stout man | warm skin; bald; brown eyes; moustache | white apron with red trim (#d8363a), white under; slate trousers; black shoes | white chef cap; moustache |
| `fisher` | adult man | tan skin; short grey hair; blue eyes; beard | yellow overalls (#f2cc40), white trim, khaki under; forest-green overall-bottoms (#2e6a3e); chocolate shoes | straw hat with green band; fishing rod |
| `pilot` | adult man | brown skin; cropped black hair; dark eyes | tan jacket (#c89a64), cream trim, white under; khaki trousers; chocolate shoes | amber goggles; white scarf |
| `artist` | teen woman | warm skin; messy mint hair (#72c8a4); teal eyes (#2a8a90) | lilac apron (#b494e0), yellow trim, white under; denim trousers; red shoes | pink flower (#f06a9c); yellow headband |
| `gentleman` | tall man | fair skin; sidepart grey hair; grey eyes; moustache | wine suit (#8a2a44), gold trim (#e8b830), white under; charcoal trousers; black shoes | cane; yellow necktie (#f2cc40) |
| `lady` | adult woman | fair skin; wavy blonde hair; blue eyes; lashes | rose gown (#e0587e), white trim, white under; rose shoes | peach hat (#fbd8b0) with rose band |
| `twins_a` | child girl | fair skin; pink twin buns (#f08cb0); pink eyes | pink dress (#f28cb4), white trim; rose shoes | pink twin buns (mirror of twins_b) |
| `twins_b` | child girl | fair skin; blue twin buns (#4a78d0); sky eyes | sky dress (#72b0ec), white trim; blue shoes | blue twin buns (mirror of twins_a) |
| `old_tailor` | elder man | warm skin; fluffy white hair; brown eyes; white moustache | plum vest (#6a3066), gold trim, cream under; slate trousers; brown shoes | round gold glasses; tape measure. Not Sashiko. |

---

## 8. Kigu stand-ins (NOT human sheets - leave as Kigu)

`cocoona` and `cocoona_pressed` are Kigu (the Spindle Shrine guardian and her Pressed form). They currently use child-built stand-in looks in `looks.js` so they can walk around the overworld. **Do not generate human sheets for them and do not convert them into human characters.** They stay Kigu; their sprites will be done later with the rest of the Kigu art, and the stand-ins stay in the game until then. The same goes for any other Kigu that appears as a map NPC.

## Battle send-out strip (protagonists only)

In battle the hero is seen from behind and throws a Bond Spool to send out a Kigu. For each hero, in addition to the walk sheet, generate ONE extra strip, original design in the same style (do not copy any existing game's pose sheet; the style reference is only for the level of polish):

- Back view only, 5 cells in a row, equal size (about 64x64 each), same character, scale and palette as the walk sheet:
  1. **Ready** - standing, spool in the throwing hand, relaxed.
  2. **Wind-up** - body leaning back, throwing arm drawn back and up.
  3. **Throw** - body leaning forward, arm fully extended, spool leaving the hand.
  4. **Follow-through** - arm across the body, weight on the front foot.
  5. **Step aside** - upright again, one step to the left (she slides off screen after this).
- Same camera as the walk sheet (raised, top of hair/hat visible). Magenta background, no text, no spool in the air (the game draws the spool and sparkle).
- Delivery name: `<id>_battle.png`. Until these exist the game fakes the throw by swaying the back-view portrait.

## Consistency checklist

- **Proportions:** everyone is about 4 heads tall. Children may be about 3.5, tall adults up to 4.5. No huge heads. Stout characters are wider, not shorter.
- **Hands:** clear and readable at 16x24. Two or three finger shapes or a simple mitt. Never a blob.
- **Outline:** one outline colour for every character, #2c1c30. No black outline, no coloured outline, no outline that disappears on dark clothing.
- **Shading:** 2-3 tones per material. Light from the top-left. No anti-aliasing and no blended gradients.
- **Silhouette:** each character has one signature accessory or hair shape that reads at a glance (beret, cap, pigtails, bun, nightcap, braid, patched coat). Pigtails, ponytails and buns must extend outside the head outline.
- **Look-alikes:** aide_f and aide_m share a lab coat; separate them by hair and trousers. grunt_m and grunt_f share a uniform; separate them by hair and skirt. Named Pleats share a suit; separate them by hair and accessory.
- **Starch blue (#4c7ee0):** used for Society collars and Presser caps. Tomo's blue scarf also uses it (per looks.js). Do not use it for anyone else.
- **Modest, all-ages:** no fanservice. Skirts and shorts sit at or below the knee or as in looks.js. No bare midriffs. No gore or weapons pointed at people. Mimi's and tea_maid's pinks are the warmest colours in the cast.
- **Magenta key:** the background is #ff00ff. Do not add magenta or hot neon pink to any costume. Keep pinks at the looks.js values (#f28cb4, #f0508a, #e0587e).
- **Palette hints (hex from `paper.js`):**

| Type | Names → hex |
|---|---|
| Skin | pale #fde5d6, fair #f9d4b6, warm #efbb8e, tan #d9a070, brown #ae744e, deep #83513a |
| Hair | ink #282838, black #34304a, brown #6e4630, chestnut #8e4e2e, auburn #b0462e, ginger #e0782e, copper #c8642a, honey #e0a848, blonde #f2cf6a, platinum #f0e6c4, grey #9c9cac, iron #7c8090, silver #c4c8dc, white #ecebf2, pink #f08cb0, rose #d8587e, blue #4a78d0, teal #2e9a9c, mint #72c8a4, purple #7a50b0, lavender #b09ae0, plum #6a3a6a |
| Cloth | white #f6f4f0, cream #f4e6c4, charcoal #3e4050, slate #5c6478, black #2e2c3a, navy #2e3c74, denim #4a64a0, sky #72b0ec, teal #2c9294, mint #7ccaa6, green #4a9a48, forest #2e6a3e, olive #7c8a3a, khaki #c4ac72, tan #c89a64, brown #7c4e30, chocolate #5a3424, red #d8363a, orange #ec7a2e, yellow #f2cc40, amber #eca232, gold #e8b830, silver #b8bccc, starch #4c7ee0, lilac #b494e0, plum #6a3066, wine #8a2a44, rose #e0587e, pink #f28cb4 |
| Eyes | brown #7a4a2e, dark #4a3040, hazel #8a6a2e, amber #d08a28, green #3e8e4a, teal #2a8a90, blue #3a6ad8, sky #4a9ae0, grey #6a7088, violet #7a4ac0, pink #d0508a, gold #c8a020 |
| Line | #2c1c30 |

---

## Delivery format

- **File:** PNG, lossless, no JPEG. Background is opaque flat magenta #ff00ff; we key it out on import.
- **Cells:** every walk cell is the same size, with even padding between cells. The 4 x 4 walk grid and the portrait sit on the same image.
- **Filename:** `<id>_sheet.png`, using the id from the entry. Examples: `tomo_sheet.png`, `pleat_crease_sheet.png`, `cocoona_pressed_sheet.png`.
- **One character per file.** No text except optional small labels. No watermarks or signatures.
- **Interpolation:** none. Output at the final pixel size, nearest-neighbour if scaled.

---

## Known conflicts

Resolved in this brief as shown. Please confirm the ones marked *decision needed*.

1. **Hero outfit (resolved).** Decision: the new looks win for both heroes (overalls, flat cap / red beret, satchel, spool-pouch belt). BIBLE section 4 and STORY section 4 have been updated to match.
2. **Cocoona is a Kigu (resolved).** Decision: Cocoona and Pressed Cocoona stay Kigu. Their `looks.js` entries are placeholders until the Kigu sprites are updated; no human sheet is needed.
3. **Priorities (P1\*).** BIBLE §4 marks `bryn`, `madame_damask` and `pleat` as P2. STORY places Bryn in chapter 2, Damask in chapter 3 and Pleat Crease and Serge in chapters 2–3. Marked P1\* here.
4. **Bobbin's age.** STORY calls her elderly, but §13 gives about 57 (Hester about 60, Sashiko about 80). Kept the elder build; apparent age is 60s.
5. **Bryn's props.** STORY gives goggles and a pushed-up beekeeper veil. `looks.js` has neither. Kept `looks.js`. Add them only if approved.
6. **Pleat sex.** `looks.js` `pleat` is male. STORY's Pleat Crease is a woman. Added three named variants.
7. **Loomhaven and Selvage.** BIBLE §9 lists Loomhaven as Salon 7 Drake (with a "?") and the final city as Salon 8. STORY ch. 9–10 says Loomhaven is Salon 7 Spook (Rue) and Selvage is Salon 8 Drake (Brocade). Followed STORY.
8. **Grand Tailor.** `looks.js` `old_tailor` (male, moustache) is not Sashiko (old, small, she). Kept `old_tailor` as a generic. Sashiko added as PROPOSED.
9. **Story-only people with no look id.** Zip, Tomo's father and the peddler (Mr. Sharp) appear in chapters 1–3 but have no `looks.js` id. Added as PROPOSED. *Decision needed:* approve them for P1 generation.
10. **Tapestry's sex is unstated** in STORY. The proposed look is an old woman. Pick one and keep it.
