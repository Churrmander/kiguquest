# Human art (`NP.art.human`)

DS 5th-generation look: 32×32 overworld cells (figure ≈ 1.5 tiles, head ≈ a third of the height, raised camera so the crown
shows) and 80×80 full-body trainer sprites (≈ 4 heads tall). Dark 1px outline (`L.LINE` #2c1c30), 2–3 tone cel shading lit
from the top-left, 15-bit colour. Everything is generated in code from short look specs; one spec gives the same person and
palette at both sizes.

Files (load order, `src/art/human/files.json`):

| file | what |
|---|---|
| `paper.js` | palettes, hue-shifted ramps, the Paper ink canvas (`limb`, `run`, `cel` shading, `edgeLine`), auto outline, colour budget |
| `spec.js` | look-spec normalisation |
| `rig.js` | proportions per target (`ow` 32×32, `tr` 80×80) and build: skull rows, torso widths, leg/arm sizes |
| `head.js` | skull, face, facial hair, 15 hair styles (`STY`), head accessories |
| `body.js` | legs/shoes, torso, arms, skirts, 16 outfits (`L.OUT`), body accessories |
| `ow.js` | `L.compose` (paint order + shading for any target/view) and the overworld sprite set |
| `trainer.js` | 80×80 front / back / send-out poses |
| `looks.js` | every look spec |
| `api.js` | public API |

## API
```js
NP.art.human.overworld(id) -> { w:32, h:32, frames:{ down:[b,b,b], up:[..], left:[..], right:[..] } }
    // 0 stand, 1 left-foot step, 2 right-foot step. Feet on the bottom row (outline row 31), figure centred:
    // the engine draws the cell at (tile x - 8, tile y - 16). Step frames lift a foot 2px, drop the body 1px, swing the other arm.
    // right = mirrored left with the step frames swapped.
NP.art.human.front(id) / .back(id) -> Bitmap 80x80    // feet on row 77, outline row 78: bottom-centre anchor (40, 78)
NP.art.human.backPose(id, pose) -> Bitmap 80x80       // 'ready' (the back() bitmap) | 'windup' | 'throw' | 'follow' (right arm throws)
NP.art.human.has(id) / .ids() / .looks / .spec(id)    // spec(id) = normalised spec
NP.art.human.make(spec) -> { overworld(), front(), back(), backPose(_, pose), has, ids, spec }   // ad-hoc look; id argument optional
```
Results are cached: `clone()` before mutating. Budgets (tested): ≤ 16 colours per overworld cell, ≤ 32 per trainer sprite,
outline included; opaque alpha only; nothing may touch the top edge.

## Look spec
```js
{ id, name, build: 'child|teen|adult|tall|elder|stout', sex: 'm|f', skin: 'pale|fair|warm|tan|brown|deep'|0..5|hex,
  hair: { style, color }, eyes: colourName|hex,
  face: { eyes: 'normal|happy|serious|sharp|wide|sleepy|closed', mouth: 'smile|grin|flat|o|smirk|frown|cat',
          brows: 'normal|stern|worried|raised', blush: bool, lashes: bool },
  outfit: { type, main, trim, under },          // type: tee jacket hoodie vest dress apron labcoat uniform cardigan coat overalls robe maid suit sailor gown
  bottom: { type: 'pants|shorts|skirt|longskirt|none|overall', color }, legs: sockColour, shoes: colour,
  facial: 'beard|mustache|stubble', facialColor,
  acc: ['type', 'type:colour', 'type:colour/colour2'] }
```
Hair styles: short spiky messy bob long ponytail pigtails bun twinbun fluff sidepart curly bald cropped wavy.
Accessories: glasses roundglasses goggles cap flatcap beret hat headband bandana maidcap bow ribbon earmuffs flower (head);
scarf tape satchel backpack bag belt spools brooch badge sash necktie cane fishingrod pince (pinstripes) (body); easel whiskers (no-ops).
Outfit material roles: `main` = the garment (shirt/jacket/dress/coat), `trim` = collars, cuffs, buttons, hems, `under` = what shows
underneath (shirt under a vest/coat/cardigan/apron/overalls). Overalls use the bottom colour for the bib.
Colour names: see `L.CLOTH`, `L.HAIR`, `L.EYES` in paper.js, or any hex.

Quick NPC: `NP.art.human.make({ build:'adult', sex:'f', hair:{style:'bob',color:'mint'}, outfit:{type:'dress',main:'sky'} })`.

## How a sprite is built
`L.compose(S, target, view, frame, pose)` paints back to front on a Paper: hair behind (front view) → back accessories → legs and
shoes → torso (the bottom garment owns the hip rows) → skirts → outfit details → arms → body/hand accessories → skull → face → hair
→ hair behind (back/side views) → glasses → hats. Then: separation lines (arms against torso, chin against collar), cel shading per
part (shadow band right/bottom, light rim top-left on trainer sprites, face shadow under the fringe, hair highlight arc), the flat
dark outline, 15-bit quantisation and the colour budget.

## Adding things
* A look: `def('id', {...})` in `looks.js` (about 4 lines).
* A hair style: one entry in `STY` (head.js): crown rise, side volume, fringe shape, fringe depth, side-lock and nape length,
  plus optional `back` (bob/long/wave/pony/pig) or `top` (spikes/tuft/bun/twinbun/fluff/curly) extras. Works at both sizes.
* An outfit: `L.OUT.type = { body, sleeve, sleeveLen, cuff, deco(P, R) }` in body.js and a default bottom in `L.OUTFITS` (spec.js).
* An accessory: `reg('name', (P, R, acc, phase) => ...)` in head.js (phases 'face' / 'head') or body.js ('back' / 'body' / 'hand').
  Draw relative to the rig (`R.cx`, `R.hy`, `R.hh`, `R.shY`, `R.hipY`, `R.tw[]`, `R.U(px)`), and check `R.t` ('ow' | 'tr') and
  `R.view` ('down' | 'up' | 'left').

Preview: `node tools/preview-human.mjs [ow|walk|portrait|all] <outdir> [idRegex]` writes `ow.png`, `ow-walk.png`, `front.png`, `back.png`.
