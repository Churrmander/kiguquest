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
| **The Four Needles** | The Elite Four. **The Grand Tailor** = Champion. The final hall is **the Grand Atelier**. |
| **The Starch Society** | The villain team. Believes the world should be *pressed flat and uniform*: no wild Kigu, no wrinkles. Grunts wear stiff white uniforms with blue starch collars ("Pressers"); admins are "Pleats". Leader: **Madame Damask**. |
| **Warpa & Weftie** | Twin guardian Kigu who "wove" the land (warp = vertical threads, weft = horizontal). The Society wants them. Player bonds with one; the leader's ace is the other. |
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

**Starters (P1)**
1. `konko` Konko — Ember — 1/3, →Lv16 `kitsuri` — orange fox onesie, cream tummy, dark paw-mittens, fox-ear hood; short copper bob, amber eyes; her tail tip burns like a candle. "Kon!"
2. `kitsuri` Kitsuri — Ember — 2/3, →Lv36 `kyuubelle` — hood pushed back into a headband with ears; long copper hair with a side-tail; red scarf; two flame-tipped tails; tiny shrine bell.
3. `kyuubelle` Kyuubelle — Ember/Dream — 3/3 — festival-jacket over the onesie, fox mask on the side of her head, nine fluffy tails fanned like a peacock, floating blue fox-fire.
4. `ottopi` Ottopi — Tide — 1/3, →Lv17 `ottelia` — teal otter onesie with round-ear hood, cream belly hugging a pink shell; wavy brown hair, freckles, webbed mitts. "Pii!"
5. `ottelia` Ottelia — Tide — 2/3, →Lv36 `ottomarine` — yellow rain-poncho with sailor collar, bubble hair-clips, otter tail worn like a scarf, swim-ring.
6. `ottomarine` Ottomarine — Tide/Brawl — 3/3 — captain's coat and cap, twin buns, big paddle tail, life-ring shield.
7. `sprubun` Sprubun — Sprout — 1/3, →Lv17 `lapinlily` — mint bunny onesie, long floppy ears with a sprout growing between them, clover print, pink cheeks. "Pyu!"
8. `lapinlily` Lapinlily — Sprout — 2/3, →Lv36 `lapinelle` — lily-petal hood, leaf-tipped ears, apron dress, pale-green braid.
9. `lapinelle` Lapinelle — Sprout — 3/3 — flower crown, ears flowing like a blossoming cape, petal skirt, watering-can wand, floating petals.

**Meadow Lane / Thimble Village (P1)**
10. `mittsy` Mittsy — Fluff — 1/2, →Lv18 `meowvelle` — kitten: white-and-grey cat onesie with oversized mitten paws, sleepy eyes, bell on the hood. "Mya"
11. `meowvelle` Meowvelle — Fluff — 2/2 — dapper tuxedo cat: bow tie, little top hat with ears poking out, cane, ribboned tail.
12. `nibbi` Nibbi — Fluff — 1/2, →Lv15 `nibblenna` — hamster in cream-caramel onesie, puffed seed-stuffed cheeks, tiny round ears, rust twin tails. "Nom!"
13. `nibblenna` Nibblenna — Fluff — 2/2 — baker hamster: apron, chef hat with ears, basket of buns.
14. `peepi` Peepi — Fluff/Gale — 1/3, →Lv14 `larkette` — sparrow chick: yellow-brown feather onesie, wing-sleeves, feather-tuft hair. "Pip!"
15. `larkette` Larkette — Fluff/Gale — 2/3, →Lv32 `larkessa` — songbird: feather crest headband, wing cape, tail-feather skirt, songbook.
16. `larkessa` Larkessa — Fluff/Gale — 3/3 — elegant lark: long wing-cape, tail-feather train, feather crown, note motifs.

**Gingham Woods / Seamstead (P1–P2)**
17. `silkie` Silkie — Buzz — 1/3, →Lv10 `cocoona` — silkworm: white fuzzy segmented onesie, stubby nub antennae hood, pale lavender hair, sleepy.
18. `cocoona` Cocoona — Buzz — 2/3, →Lv30 `mothelia` — girl curled in a pale-green cocoon sleeping bag (only head + hands out), half-lidded.
19. `mothelia` Mothelia — Buzz/Gale — 3/3 — moth-wing dress-cape with big patterned wings, feathery antenna headband, sparkle scales.
20. `buzzlet` Buzzlet — Buzz — 1/2, →Lv20 `honeybelle` — bee: yellow-black striped onesie, tiny antennae, honey pot, blonde bobbles.
21. `honeybelle` Honeybelle — Buzz/Sprout — 2/2 — honeycomb dress, flower crown, translucent wings, honey-dipper wand.
22. `webbi` Webbi — Buzz — 1/2, →Lv22 `webelle` — spider: dark-purple hoodie with four extra small sleeve-arms for knitting, eight tiny red eye-spots on the hood, yarn ball; shy.
23. `webelle` Webelle — Buzz/Spook — 2/2 — weaver: web-lace shawl, knitting needles, long black hair with silver threads.
24. `daisip` Daisip — Sprout — 1/2, →Lv21 `daisia` — daisy: white petal hood framing her face, yellow onesie.
25. `daisia` Daisia — Sprout — 2/2 — bouquet dress, petal halo, petal skirt.
26. `ribbi` Ribbi — Tide — 1/2, →Lv25 `ribbelle` — frog: green raincoat, big round eyes on the hood, lily-pad umbrella.
27. `ribbelle` Ribbelle — Tide/Terra — 2/2 — overalls + boots, lily-pad skirt, wide rain hat.
28. `molli` Molli — Terra — 1/2, →Lv24 `molluna` — mole: brown-grey onesie, giant digging mitts, goggles on forehead, squinty.
29. `molluna` Molluna — Terra/Iron — 2/2 — miner: hard-hat with lamp, steel-toe boots, drill-pick.

**Phase 2 (art after P1)**
30. `pebbi` Pebbi — Pebble — 1/3, →Lv25 `boulderina` — pebble-patterned grey onesie, rock hair-clips, stoic.
31. `boulderina` Boulderina — Pebble — 2/3, →Lv40 `craggelle` — boulder shoulder-guards, crystal chips in hair.
32. `craggelle` Craggelle — Pebble — 3/3 — crystal-crowned gem queen with boulder gauntlets.
33. `sparkin` Sparkin — Volt — 1/2, →Lv26 `voltessa` — squirrel: yellow onesie, zigzag-stripe tail, static-fluffed hair. "Zip!"
34. `voltessa` Voltessa — Volt — 2/2 — bolt-shaped tail cape, tesla-coil hair buns, goggles, fingerless gloves.
35. `kumi` Kumi — Brawl — 1/3, →Lv25 `kumara` — bear cub: brown onesie, bandage-wrapped mitt paws, determined pout.
36. `kumara` Kumara — Brawl — 2/3, →Lv40 `kumazen` — boxing gloves, headband, braid.
37. `kumazen` Kumazen — Brawl — 3/3 — monk robes over onesie, prayer beads, closed calm eyes, huge mitts.
38. `hootie` Hootie — Dream/Gale — 1/2, →Lv28 `hootelle` — owl: brown-feather onesie, big round glasses, tiny book.
39. `hootelle` Hootelle — Dream/Gale — 2/2 — mortarboard with ear tufts, feather shawl, scroll.
40. `dozey` Dozey — Dream — 1/3, →Lv26 `slumbelle` — koala: grey onesie, clutches a pillow, half-closed eyes, yawning.
41. `slumbelle` Slumbelle — Dream — 2/3, →Lv44 `somnia` — nightgown + nightcap, dream bubble, teddy.
42. `somnia` Somnia — Dream — 3/3 — moon queen of dreams: starry robe, star blanket, floating dream orbs.
43. `sheetie` Sheetie — Spook — 1/2, →Lv30 `spectrina` — bedsheet-ghost costume with big eyes peeking out of the eyeholes; shy.
44. `spectrina` Spectrina — Spook — 2/2 — lace ghost dress, lantern, long translucent veil.
45. `yukimi` Yukimi — Frost — 1/2, →Lv30 `yukiara` — snow bunny: white fluffy onesie with pompoms, scarf, pale-blue hair.
46. `yukiara` Yukiara — Frost — 2/2 — snowflake crown, fur-trim frost cape, icicle wand.
47. `pinny` Pinny — Sprout/Iron — 1/3, →Lv30 `needlette` — pincushion-tomato hat-hood, pins as hairpins, prickly.
48. `needlette` Needlette — Sprout/Iron — 2/3, →Lv45 `thimbelle` — sewing-kit knight: thimble helmet, needle lance.
49. `thimbelle` Thimbelle — Sprout/Iron — 3/3 — full thimble-plate armour dress, long thread cape.
50. `shroomi` Shroomi — Nettle/Sprout — 1/2, →Lv28 `shroomelle` — mushroom: red-spotted cap hood, brown onesie, spore puffs.
51. `shroomelle` Shroomelle — Nettle/Sprout — 2/2 — parasol cap, frilly gill skirt.
52. `purrlie` Purrlie — Shade — 1/2, →Lv20 `prowlette` — black cat burglar: domino mask, striped socks, stolen scarf; cheeky.
53. `prowlette` Prowlette — Shade — 2/2 — phantom thief: top hat, cape, ribbon-lock tail.
54. `draki` Draki — Drake — 1/3, →Lv50 `drakessa` — little dragon onesie (crimson/black), tiny horns hood, stubby tail.
55. `drakessa` Drakessa — Drake — 2/3, →Lv64 `drakonia` — dragon hoodie with wings and horns, long tail.
56. `drakonia` Drakonia — Drake/Shade — 3/3 — dragon empress: three-horn crown, huge wing-cape, flowing gown.
57. `warpa` Warpa — Dream/Ember — legendary, single stage — tall weaver-spirit in a white-and-crimson ceremonial robe, vertical threads streaming from her sleeves, a loom-comb crown.
58. `weftie` Weftie — Dream/Tide — legendary, single stage — her twin, in white-and-blue, horizontal threads swirling around her like ribbons.

More families (Desert, Harbor, Airfield, Snow, League) get added as chapters are built — the generator must make adding a
species a ~10-line look spec.

## 4. Humans (look ids)

**P1:** `hero_m` (boy, red-and-white jacket, satchel), `hero_f` (girl, same palette family), `tomo` (rival: serious boy, glasses,
blue scarf), `mimi` (cheerful friend girl, pink cardigan, big bow), `prof_bobbin` (elderly woman professor: round glasses,
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

**Battle backgrounds (P1: grass, forest, indoor, cave; P2: water, city, gym, night).** 240×112, ground discs included;
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
(Four Needles + Grand Tailor). Rival battles at roughly: Route 1 exit, Thimble, Seamstead, Quarry, Kite Hill, Loomhaven, Victory Road.
