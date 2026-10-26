# Kigu Quest — Game Bible

## 1. World & glossary

**Setting.** The region of **Tsumugi** ("spun thread"): a patchwork land stitched together from eight towns joined by "seam
roads". Warm, cosy, a little magical — festival lanterns, sewing-shop signs, patchwork fields, cloth-bolt windmills.

| Term | Meaning |
|---|---|
| **Kigu** | Spirit-girls who wear *living costumes* (kigurumi onesies shaped like animals, plants, objects). Each has a type and personality. Cute, wholesome, ageless. Their costume is part of them — it grows more elaborate as they evolve. |
| **Tailor** | A person who forms Stitch Bonds with Kigu and battles with them. The player is an apprentice Tailor. |
| **Stitch Bond** | The friendship between a Tailor and a Kigu. Kigu *choose* to join — never captured. |
| **Bond Spool** | The "catch" item. You offer a spool of bond-thread; a weakened / curious Kigu may accept it (shakes = her deciding). Kinds: Bond (std), Silk (great), Gold (ultra), Master (always). |
| **Sketchbook** | The Kigu encyclopedia (registry of seen/befriended Kigu). |
| **Nap** | What "fainting" is. A Kigu who runs out of HP is "too sleepy to go on". |
| **Tea House** | The heal station in every town (Kigu nap + cocoa). Has the storage terminal. |
| **General Store** | Shops. |
| **Salon** / **Master Tailor** | The eight gyms / gym leaders. Win a **Button** (badge). |
| **Global Tailor's Association** | The authority over all Tailors, led by the Needles. The Tailors' Guild is its Tsumugi branch (proposed). |
| **The Four Needles** | The Elite Four, and the leaders of the Global Tailor's Association. They vanished because of Datod's activity, which left a power vacuum the Starch Society filled (STORY §7b). **The Weave Guardian** = Champion. The final hall is **the Grand Atelier**. |
| **The Starch Society** | The villain team. Believes the world should be *pressed flat and uniform*: no wild Kigu, no wrinkles. Grunts wear stiff white uniforms with blue starch collars ("Pressers"); admins are "Pleats". Leader: **Madame Damask**, an ex-Needle (which is how the Society has a piece of the Everspool). Mantra: *"Flat is fair."* Motto: *"Perfection is just the beginning."* Began as the **Order of Ribbons**, a respected Tailor organisation; its leader was tricked by the entity and reorganised it into the Society. Members think they are tidying the world; the real plan is to press Tsumugi flat and merge it with the tapestry to free him. |
| **Datod the Weave-Eater** (owner, 2026-10-26; "DAH-tod", Welsh for "to undo") | The big bad, bound in a **magic tapestry**; the antithesis of the legendary Kigu seamstresses; he once threatened to consume the universe. **Not a Kigu**: it cannot be bonded with, and the Everspool cannot sway it. Name and look still open (STORY §7a). |
| **Astara & Anwela** (owner names 2026-10-26, from Welsh *ystof* warp / *anwe* weft; were Warpa & Weftie; code ids still `warpa` / `weftie`) | The Goddesses of Order and Nature, twin guardian Kigu. They wove the magic tapestry to contain Datod, then wove the land as its opposite (warp = vertical threads, weft = horizontal). The legendary Kigu seamstresses; they speak through Kigu, which is how they talk to the player in the end-game. The Society wants them. Player bonds with one; the leader's ace is the other. |
| **Paddle / Snip / Shove / Glide / Climb** | Field moves (HM-style): cross water / cut small trees / push boulders / fast-travel / climb waterfalls. |

Species cry = a short sound-word shown in battle ("Kon!").

## 2. Types (17, Gen-5 rules with our names)

| id | name | colour | (classic analogue for rules) |
|---|---|---|---|
| `fluff` | Fluff | #b8b09a | Normal |
| `ember` | Ember | #ef7d3c | Fire |
| `tide` | Tide | #4f8fe8 | Water |
| `volt` | Volt | #f2cf3a | Electric |
| `sprout` | Sprout | #6cbf4a | Grass |
| `frost` | Frost | #8fdcdc | Ice |
| `brawl` | Brawl | #c4453a | Fighting |
| `nettle` | Nettle | #a055b0 | Poison |
| `terra` | Terra | #d9b25f | Ground |
| `gale` | Gale | #9db3f0 | Flying |
| `dream` | Dream | #f0609c | Psychic |
| `buzz` | Buzz | #a6b92e | Bug |
| `pebble` | Pebble | #b09a4a | Rock |
| `spook` | Spook | #6a5a9e | Ghost |
| `drake` | Drake | #5b3fd6 | Dragon |
| `shade` | Shade | #5a4a42 | Dark |
| `iron` | Iron | #aab4c8 | Steel |

Effectiveness is the classic Gen-2→5 chart under these names (implemented in `src/data/types.js`).

## 3. Kigu roster (Phase 1 = art priority order)

`id — Name — types — stage, evolution — concept`. Every Kigu is a girl in a living costume. Costume = species theme; hood ears /
tail / accessories carry it. Distinct silhouette + palette per family. Stage 2 adds accessories and maturity; stage 3 is the full
"festival" version. Suggested cry in quotes.

### Naming rule (LAW, owner's decision 2026-10-26)

Every new or changed Kigu name must pass all of these, and **the owner approves every new name before it goes into the game**
(code, maps, text, art keys) or the roster notes.

1. **Ending budget.** No ending is shared by more than 3 family base names. The "ee" ending (-i, -ie, -y) is closed for new
   families unless it is a real word or a clear reference that earns it (Musubi, Chirpadee). Stage 2 and 3 names follow the
   same cap for endings like -ora, -ina, -ika, -ara, -essa.
2. **No chop-and-add.** Never an English word cut short plus a cute ending (the old Cactli, Slatli, Glowli). Blend two ideas:
   the creature plus her costume, her habit or a pun (Rockabye, Hedgehug, Aviatrix). Words from other languages are welcome
   and need no explanation (Lumipom, Kuurlace, Tomibou).
3. **Mix the shapes.** Consonant endings, compounds, real words with a twist.
4. **Lines may share a root, families may not.** No two families share a stem of 4 letters or more.
5. **Box test.** Read it aloud in a column of eight roster names. Two rhymes in a row, or a look-alike, means rename.
6. **No real Pokemon names and no other well-known character names** (Smolder was dropped for a League of Legends dragon;
   Keropon for Sanrio's Keroppi). A sound echo is fine when the creature looks different (Dozala and Komala). Nothing that
   could be misread as a rude word (Pricklepot, not Prickpot; Peepi was renamed).
7. **One obvious reading.** A player who has never heard it said should stress it the way we mean (Pomisno was dropped).
8. **10 letters or fewer**, so it fits the battle HP box and menus.

**Owner's note on rule 4 (2026-10-26):** a stem only counts when it carries the same idea. Letters that line up by
coincidence are fine (Astara has nothing to do with stars, so Amethystar is no clash).

Old ids from the round 2 rename live in `src/data/renames.js` (saves migrate on load; cries keep their old sound).

**Starters (P1)**
1. `konko` Konko — Ember — 1/3, →Lv16 `kitsuri` — orange fox onesie, cream tummy, dark paw-mittens, fox-ear hood; short copper bob, amber eyes; her tail tip burns like a candle. "Kon!"
2. `kitsuri` Kitsuri — Ember — 2/3, →Lv36 `kyuubelle` — hood pushed back into a headband with ears; long copper hair with a side-tail; red scarf; two flame-tipped tails; tiny shrine bell.
3. `kyuubelle` Kyuubelle — Ember/Dream — 3/3 — festival-jacket over the onesie, fox mask on the side of her head, nine fluffy tails fanned like a peacock, floating blue fox-fire.
4. `ottopi` Ottopi — Tide — 1/3, →Lv17 `ottelia` — teal otter onesie with round-ear hood, cream belly hugging a pink shell; wavy brown hair, freckles, webbed mitts. "Pii!"
5. `ottelia` Ottelia — Tide — 2/3, →Lv36 `ottomarine` — yellow rain-poncho with sailor collar, bubble hair-clips, otter tail worn like a scarf, swim-ring.
6. `ottomarine` Ottomarine — Tide/Brawl — 3/3 — captain's coat and cap, twin buns, big paddle tail, life-ring shield.
7. `sprubun` Sprubun — Sprout — 1/3, →Lv17 `lapinlily` — mint bunny onesie, long floppy ears with a sprout growing between them, clover print, pink cheeks. "Pyu!"
8. `lapinlily` Lapinlily — Sprout — 2/3, →Lv36 `lapinade` — lily-petal hood, leaf-tipped ears, apron dress, pale-green braid.
9. `lapinade` Lapinade — Sprout — 3/3 — flower crown, ears flowing like a blossoming cape, petal skirt, watering-can wand, floating petals.

**Meadow Lane / Thimble Village (P1)**
10. `kittabra` Kittabra — Fluff — 1/2, →Lv18 `wiskedabra` — playful kitten: tuxedo-cat onesie (black body and hood, white bib, white blaze down the nose, white mitten paws, black tail, yellow-green eyes), bell on the hood. Bats at yarn and hides things in her big mittens, so she visibly grows into the stage magician. "Mya" *(Recolour from white-and-grey is still to do.)*
11. `wiskedabra` Wiskedabra — Fluff — 2/2 — tuxedo stage magician: bow tie, little top hat with ears poking out, cane, ribboned tail; pulls ribbons out of her hat.
12. `nibblit` Nibblit — Fluff — 1/2, →Lv15 `nibblenna` — hamster in cream-caramel onesie, puffed seed-stuffed cheeks, tiny round ears, rust twin tails. "Nom!"
13. `nibblenna` Nibblenna — Fluff — 2/2 — baker hamster: apron, chef hat with ears, basket of buns.
14. `chirpadee` Chirpadee — Fluff/Gale — 1/3, →Lv14 `lyripip` — sparrow chick (the name nods to the chickadee): yellow-brown feather onesie, wing-sleeves, feather-tuft hair; practises flapping every sunrise. "Pip!"
15. `lyripip` Lyripip — Fluff/Gale — 2/3, →Lv32 `larkestra` — songwriter songbird: feather crest headband, wing cape, tail-feather skirt, a songbook of tunes she wrote herself.
16. `larkestra` Larkestra — Fluff/Gale — 3/3 — famous singer lark: long wing-cape, tail-feather train, feather crown, note motifs; her song carries across three towns.

**Gingham Woods / Seamstead (P1–P2)**
17. `silkie` **Acolarva** (was Silkie; owner 2026-10-26, acolyte + larva; id renames later) — Buzz — 1/3, →Lv10 `cocoona` — shrine initiate silkworm: white fuzzy segmented onesie, stubby nub antennae hood, pale lavender hair, sleepy; a little red shrine cord tied around her middle.
18. `cocoona` **Vowspun** (was Cocoona; owner 2026-10-26, she takes her vows and spins her cocoon; id renames later) — Buzz — 2/3, →Lv30 `mothelia` — shrine trainee: girl curled in a pale-green cocoon sleeping bag (only head + hands out), half-lidded.
19. `mothelia` **Mikoga** (was Mothelia; owner 2026-10-26, Japanese *miko* shrine maiden + *ga* moth, say MEE-ko-ga; id renames later) — Buzz/Gale — 3/3 — full shrine maiden: moth-wing dress-cape in shrine-maiden white and red with big patterned wings, feathery antenna headband, sparkle scales.
20. `buzzlet` Buzzlet — Buzz — 1/2, →Lv20 `hunnibloom` — bee: yellow-black striped onesie, tiny antennae, honey pot, blonde bobbles.
21. `hunnibloom` Hunnibloom — Buzz/Sprout — 2/2 — honeycomb dress, flower crown, translucent wings, honey-dipper wand.
22. `spinnet` Spinnet — Buzz — 1/2, →Lv22 `spindra` — spider: dark-purple hoodie with four extra small sleeve-arms for knitting, eight tiny red eye-spots on the hood, yarn ball; shy.
23. `spindra` Spindra — Buzz/Spook — 2/2 — weaver: web-lace shawl, knitting needles, long black hair with silver threads.
24. `daisip` Daisip — Sprout — 1/2, →Lv21 `daisia` — daisy: white petal hood framing her face, yellow onesie.
25. `daisia` Daisia — Sprout — 2/2 — bouquet dress, petal halo, petal skirt.
26. `kerochapu` Kerochapu — Tide — 1/2, →Lv25 `lilyrana` — happy rain frog: green raincoat, big round eyes on the hood, lily-pad umbrella; splashes in puddles and ribbits (kero-kero plus chappu).
27. `lilyrana` Lilyrana — Tide/Terra — 2/2 — overalls + boots, lily-pad skirt, wide rain hat.
28. `molli` Molli — Terra — 1/2, →Lv24 `molluna` — mole: brown-grey onesie, giant digging mitts, goggles on forehead, squinty.
29. `molluna` Molluna — Terra/Iron — 2/2 — miner: hard-hat with lamp, steel-toe boots, drill-pick.

**Phase 2 (art after P1)**
30. `pebblump` Pebblump — Pebble — 1/3, →Lv25 `boulderina` — pebble-patterned grey onesie, rock hair-clips, stoic.
31. `boulderina` Boulderina — Pebble — 2/3, →Lv40 `craggoth` — boulder shoulder-guards, crystal chips in hair.
32. `craggoth` Craggoth — Pebble — 3/3 — crystal-crowned gem queen with boulder gauntlets.
33. `scurrent` Scurrent — Volt — 1/2, →Lv26 `arcorn` — red squirrel: copper-gold onesie, long ear tufts, zigzag-stripe tail, static-fluffed hair; zapped so often she twitches, and zaps everything she touches. "Zip!" *(Recolour from yellow and ear tufts still to do.)*
34. `arcorn` Arcorn — Volt — 2/2 — gadget inventor: bolt-shaped tail cape, spark-plug hair clips (not tesla-coil buns, so she does not twin with Teslaria), goggles, fingerless gloves; builds gadgets from acorns and wire. *(Hair clips still to draw.)*
35. `kumi` Kumi — Brawl — 1/3, →Lv25 `kumara` — bear cub: brown onesie, bandage-wrapped mitt paws, determined pout.
36. `kumara` Kumara — Brawl — 2/3, →Lv40 `kumazen` — boxing gloves, headband, braid.
37. `kumazen` Kumazen — Brawl — 3/3 — monk robes over onesie, prayer beads, closed calm eyes, huge mitts.
38. `tomibou` Tomibou — Dream/Gale — 1/2, →Lv28 `hootamo` — bookworm owl (tome plus hibou, French for owl): brown-feather onesie, big round glasses, tiny book.
39. `hootamo` Hootamo — Dream/Gale — 2/2 — mortarboard with ear tufts, feather shawl, scroll.
40. `dozala` Dozala — Dream — 1/3, →Lv26 `slumbrio` — koala: grey onesie, clutches a pillow, half-closed eyes, yawning. Koala ears carry through on Slumbrio's nightcap and Somnia's crown.
41. `slumbrio` Slumbrio — Dream — 2/3, →Lv44 `somnia` — nightgown + nightcap, dream bubble, teddy.
42. `somnia` Somnia — Dream — 3/3 — moon queen of dreams: starry robe, star blanket, floating dream orbs.
43. `hushroud` Hushroud — Spook — 1/2, →Lv30 `spectrina` — bedsheet-ghost costume with big eyes peeking out of the eyeholes; shy but friendly: she sneaks closer when you are not looking and freezes behind her sheet when you turn around. Overworld idea: a wild one inches toward the player while their back is turned.
44. `spectrina` Spectrina — Spook — 2/2 — lace ghost dress, lantern, long translucent veil; brave enough at last to step into the light.
45. `lumipom` Lumipom — Frost — 1/2, →Lv30 `kuurlace` — snow bunny (lumi is Finnish for snow): white fluffy onesie with pompoms, scarf, pale-blue hair.
46. `kuurlace` Kuurlace — Frost — 2/2 — graceful, regal snow-bunny queen (kuura is Finnish for hoarfrost): snowflake crown with bunny ears, fur-trim frost-lace cape, icicle wand.
47. `tomasquire` Tomasquire — Sprout/Iron — 1/3, →Lv30 `needlance` — pincushion-tomato hat-hood, pins as hairpins, prickly.
48. `needlance` Needlance — Sprout/Iron — 2/3, →Lv45 `thimbelot` — sewing-kit knight: thimble helmet, needle lance.
49. `thimbelot` Thimbelot — Sprout/Iron — 3/3 — full thimble-plate armour dress, long thread cape.
50. `myceliquin` Myceliquin — Nettle/Sprout — 1/2, →Lv28 `cordymime` — cute+creepy mushroom harlequin: red-spotted cap hood, brown onesie, purple spore puffs that make other Kigu giggly and sleepy, a too-sweet smile, mycelium threads trailing from her hem. *(Redesign still to do.)*
51. `cordymime` Cordymime — Nettle/Sprout — 2/2 — cute+creepy mushroom mime: parasol cap, frilly gill skirt, mycelium threads on her fingers like gentle puppet strings; mimes pulling invisible ropes. Spooky-cute, never gory. *(Redesign still to do.)*
52. `pilfurr` Pilfurr — Shade — 1/2, →Lv20 `prowlure` — black-cat highwayman: black cat hood, highwayman mask, cape, striped socks, stolen scarf; cheeky. *(Redesign still to do.)*
53. `prowlure` Prowlure — Shade — 2/2 — swashbuckling musketeer thief: highwayman mask, rapier, cape, feathered musketeer cap (no top hat, so she does not twin with Wiskedabra), ribbon-lock tail. *(Redesign still to do.)*
54. `smolava` Smolava — Drake — 1/3, →Lv30 `wyvrant` (owner 2026-10-26, was Lv50) — little dragon onesie (crimson/black), tiny horns hood, stubby tail.
55. `wyvrant` Wyvrant — Drake — 2/3, →Lv55 `empyress` (owner 2026-10-26, was Lv64) — moody teen wyvern with a bad attitude (wyvern plus rant): dragon hoodie with wings and horns, long tail.
56. `empyress` Empyress — Drake/Shade — 3/3 — composed dragon empress (empress plus pyre), grown out of her teen rants: three-horn crown, huge wing-cape, flowing gown.
57. `warpa` **Astara** (was Warpa; id renames later) — Dream/Ember — legendary, single stage — tall weaver-spirit in a white-and-crimson ceremonial robe, vertical threads streaming from her sleeves, a loom-comb crown.
58. `weftie` **Anwela** (was Weftie; id renames later) — Dream/Tide — legendary, single stage — her twin, in white-and-blue, horizontal threads swirling around her like ribbons.

More families (Desert, Harbor, Airfield, Snow, League) get added as chapters are built — the generator must make adding a
species a ~10-line look spec.

## 4. Humans (look ids)

**P1:** `hero_m` = Draco (boy: messy light-brown hair, dark grey flat cap, white shirt, navy overalls, satchel, spool-pouch belt), `hero_f` = Dahlia (girl: blonde ponytail, red beret with gold button, white tee, denim overall-shorts, satchel, spool-pouch belt), the rival (no look of its own: drawn with the other hero's look), `mimi` (cheerful friend girl, pink cardigan, big bow), `prof_bobbin` (elderly woman professor: round glasses,
tape-measure scarf, lab coat), `mom`, `aide_f`, `aide_m` (lab aides), `villager_f1`, `villager_f2`, `villager_m1`, `villager_m2`,
`elder_m`, `elder_f`, `child_m`, `child_f`, `shopkeeper` (apron), `tea_maid` (Tea House healer: maid uniform with pink bow),
`tailor_f`, `tailor_m` (generic trainers: sewing-belt outfits), `net_kid`, `picnicker`, `hiker`, `grunt_m`, `grunt_f` (Starch
Society Pressers: stiff white uniform, blue starch collar, flat cap), `poppy` (Master Tailor #1: warm, apron with pockets of
thread spools).
**P2:** `pleat` (Society admin: pin-striped, stern), `madame_damask` (Society leader: tall elegant woman, iron-grey bun,
steam-iron brooch), `bryn` (Master Tailor #2), `sailor`, `camper`, `schoolgirl`, `scientist`, `nurse_aide`, `rocker`, `cook`,
`fisher`, `pilot`, `skier`, `artist`, `gentleman`, `lady`, `twins_a`, `twins_b`, `old_tailor`.
The generator must also let us define new looks in a few lines (hair style/colour, skin, outfit colours, accessory).

## 5. World tiles

**Terrain (P1 unless noted).** Outdoor: `grass`, `tallgrass` (animated overlay; encounter='grass'), `flowers` (walkable, animated),
`path` (dirt road, autotile vs grass), `cobble` (town paving, autotile), `sand` (autotile; P2), `water` (autotile shore,
animated, water:true, encounter='water'), `treeline` (solid dense trees, 2 variants), `cliff` (solid rock wall face, autotile; P2),
`ledge_d`/`ledge_l`/`ledge_r` (one-way hops), `fence` (solid, autotile connecting N/E/S/W), `hedge` (solid, autotile),
`bridge_h`/`bridge_v` (walkable over water; P2), `snow` (P3), `ice` (P3), `dirt` (bare ground, P2), `rock_path` (P2).
Cave: `cave_floor` (encounter='cave'), `cave_wall` (solid autotile). Indoor: `floor_wood`, `floor_tile`, `floor_stone`,
`carpet_red`, `carpet_blue`, `carpet_green`, `wall_wood`, `wall_plaster`, `wall_stone` (solid wall faces), `mat` (door mat, walkable),
`void` (black, solid), `stairs_up`/`stairs_down` (walkable warp tiles, visual). Gym/special floors: P2/P3 (`floor_checker`, `floor_thread`).

**Stamps (P1 unless noted).** Outdoor: `house_s` (4×3), `house_m` (5×4), `house_l` (6×4) — roof variants red/blue/green/yellow/pink/gray;
`lab` (7×5), `tea_house` (5×4, pink roof, heart flag), `general_store` (5×4, striped awning), `salon` (7×5, scissors-and-button banner;
variants per type: fluff, buzz, volt, terra, gale, frost, spook, drake, etc.), `gate_house` (P2), `shrine` (P2), `cave_mouth` (3×3, P2),
`tree` (1×2, top tile over), `tree_big` (2×3), `pine` (1×2), `bush` (1×1 solid; cuttable), `boulder` (1×1, pushable), `sign` (1×1), `mailbox`,
`lamp` (1×2), `bench` (2×1), `flowerbed` (2×1 variants), `well` (2×2), `fountain` (3×3, animated, P2), `statue` (P2), `windmill` (3×4 animated),
`crate`, `barrel`, `haystack`, `tent` (P2), `rock` (1×1 solid), `stump`, `cloth_line` (2×1, clothesline with cloth, animated).
Indoor: `table_s`(2×1), `table_l`(3×2), `chair` (1×1; variants down/up/left/right), `bed` (1×2), `bookshelf` (2×2), `cloth_shelf`
(2×2 bolts of cloth), `tv`(1×1), `plant`(1×1), `rug_a`/`rug_b` (floor layer, walkable), `counter_l`/`counter_m`/`counter_r`/`counter_c`,
`pc_terminal`(1×2), `tea_healer` (2×1 counter machine with teapots), `shop_shelf`(1×2), `window` (1×1 wall decor), `poster`, `clock`,
`mannequin` (1×2), `sewing_machine`(1×1), `fridge`(1×2), `stove`(1×1), `sink`(1×1), `display_case`(2×1), `pillar`(1×2), `stairs_wall` (P2), `ladder`,
`gym_statue` (P2).

**Battle backgrounds (P1: grass, forest, indoor, cave; P2: water, city, gym, night).** 256×144, elliptical platforms included;
`enemyBase`/`playerBase` anchors per §2 of DESIGN.

## 6. Item icon ids (24×24; P1 = marked *)

Spools: `bond_spool`*, `silk_spool`*, `gold_spool`*, `master_spool`, `quick_spool`, `dusk_spool`, `net_spool`, `heal_spool`.
Healing: `snack_cake`*, `fancy_cake`*, `grand_cake`*, `royal_cake`, `full_tonic`, `revive_tea`*, `max_revive`, `herbal_cocoa`.
Status: `aloe_balm`* (burn), `mint_tea`* (poison), `wake_bell`* (sleep), `thaw_pad`* (frost), `numb_away`* (paralysis), `all_cure`*.
PP: `sugar_cube`*, `sugar_jar`, `sugar_box`, `sugar_feast`. Battle: `pep_atk`, `pep_def`, `pep_spe`, `pep_spa`, `pep_spd`, `pep_acc`, `guard_spec`.
Field: `scent_spray`*, `super_scent`, `max_scent`, `thread_ball`* (escape rope), `dowsing_pin`.
Growth: `wish_candy`* (rare candy), `vit_hp`, `vit_atk`, `vit_def`, `vit_spa`, `vit_spd`, `vit_spe`, `pp_boost`, `pp_max`.
Charms (evolution): `ember_charm`, `tide_charm`, `volt_charm`, `sprout_charm`, `frost_charm`, `moon_charm`, `sun_charm`, `dusk_charm`, `dawn_charm`, `shine_charm`.
Held: `snack_bag` (leftovers), `plum_treat` (oran), `honey_treat` (sitrus), `lemon_treat` (lum), `sturdy_sash`, `sparkle_brooch` (life orb), `choice_band`,
`choice_specs`, `choice_scarf`, `expert_belt`, `cocoon_charm` (eviolite), `thorn_helmet`, `bell_charm` (shell bell), `share_ribbon` (exp share), `lucky_pin`,
`coin_charm`, `stay_button`, `quick_claw`, `focus_band`, `scope_lens`, `lens_glass`, `float_balloon`, `iron_ball`, `toxic_orb`, `flame_orb`, plus the **`pin_<typeid>`** family (17 type-boost pins) and **`disc_<typeid>`** family (17 move discs, colour-coded by type).
Field discs (HM-style): `disc_snip`*, `disc_glide`, `disc_paddle`*, `disc_shove`, `disc_climb`.
Key: `sketchbook`*, `tailor_license`*, `button_case`*, `town_map`*, `bicycle`, `old_rod`, `good_rod`, `super_rod`, `parcel`, `letter`, `key_a`, `key_b`, `cog`.

## 7. Move-animation FX names (`NP.art.icons.fx`)
Type-coloured particles: `flame`, `drop`, `leaf`, `bolt`, `flake`, `rock`, `feather`, `star`, `ring`, `slash`, `heart`, `note`, `zzz`, `bubble`,
`web`, `gust`, `thread`, `shadow`, `sparkle`, `punch` (impact burst), `hit_normal`, `hit_super`, `hit_weak`, `poison`, `confuse` (spinning stars),
`stat_up` (rising arrows), `stat_down`, `heal` (green plus/sparkle), `smoke`, `dust`, `glow`.

## 8. Audio lists

**Songs (P1 first):** `title`, `intro` (professor's lab — warm, curious), `home_town` (Button Town — gentle, nostalgic), `route_meadow`
(Meadow Lane — sunny, walking tempo), `town_thimble` (Thimble Village — cosy, folk), `tea_house` (soft, lullaby-ish), `battle_wild`,
`battle_tailor` (trainer — driving), `battle_master` (salon Master — big, brassy), `battle_rival`, `battle_society` (menacing,
precise, march-like), `forest_gingham` (mysterious, airy), `city_seamstead` (bustling, jazzy), `society_theme` (villain encounter: stiff,
strings-and-snare feel), `cave` (echoing), `sad` (whiteout), `credits`; **P2:** `battle_legend`, `battle_admin`, `battle_damask`, `city_b`…`city_h`,
`route_b`…, `league`, `battle_needle` (Elite Four), `battle_grand` (Champion), `hall_of_fame`, `ending`.
**Jingles:** `j_win_wild`, `j_win_tailor`, `j_win_master`, `j_levelup`, `j_heal`, `j_item`, `j_key_item`, `j_evolve`, `j_caught`, `j_button` (badge get), `j_encounter_society`,
`j_encounter_tailor`, `j_shop`.
**SFX ids:** `cursor`, `select`, `cancel`, `error`, `menu_open`, `text`, `bump`, `step_grass`, `door`, `warp`, `ledge`, `battle_start`, `hit`, `hit_super`,
`hit_weak`, `stat_up`, `stat_down`, `faint`, `low_hp`, `exp`, `throw`, `shake`, `caught`, `heal_tick`, `levelup`, `pickup`, `save`, `poison`, `status`,
`flee`, `evolve`, `sparkle`, `whoosh`, `zap`, `splash`, `flame`, `leaf`, `rock`, `cry_generic`.

## 9. Region outline (for level design; first three chapters are the playable slice)

Button Town (start, Prof. Bobbin's lab) → **Route 1 Meadow Lane** → **Thimble Village** (Salon 1, Fluff, Master Poppy) → Route 2 → **Gingham Woods**
(Buzz/Sprout forest; Society shrine incident) → **Hemline** (town; Salon 2, Buzz) → **Seamstead City** (big city; Salon 3, Volt; Society "Crisp & Co." front)
→ Route 4 + **Dust Bowl Desert** → **Bobbin Quarry** (Salon 4, Terra) → Route 5/6 + Chargestone-style cave → **Kite Hill** (airfield; Salon 5, Gale) →
**Woolen Peak** (snow town; Salon 6, Frost) → Society Starch Works base → **Loomhaven** (Salon 7, Drake? / final city, Salon 8) → Victory Road → **Grand Atelier**
(Four Needles + Weave Guardian). Rival battles at roughly: Route 1 exit, Thimble, Seamstead, Quarry, Kite Hill, Loomhaven, Victory Road.
