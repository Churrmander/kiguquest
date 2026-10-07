# Human art (`NP.art.human`)

Files (load order, `src/art/human/files.json`): `paper.js` (palettes, ramps, Paper canvas + auto outline + colour budget),
`spec.js` (spec normalisation), `ow.js` (16x24 overworld engine), `ow-parts.js` (overworld hair/outfits/accessories),
`portrait.js` (64x64 front/back), `looks.js` (all look specs), `api.js` (public API).

## API
```js
NP.art.human.overworld(id) -> { w:16, h:24, frames:{ down:[b,b,b], up:[..], left:[..], right:[..] } }  // 0 stand, 1 left-foot, 2 right-foot
NP.art.human.front(id) / .back(id) -> Bitmap 64x64   // feet on row 61, bottom-centre anchor (32,62); every look has both
NP.art.human.has(id) / .ids() / .looks / .spec(id)    // spec(id) = normalised spec
NP.art.human.make(spec) -> { overworld(), front(), back(), has, ids, spec }   // ad-hoc look; id argument optional
```
Results are cached: `clone()` before mutating. All sprites <= 16 colours incl. outline (tested), 15-bit, opaque alpha only.

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
Accessories: glasses roundglasses goggles scarf tape satchel backpack bow ribbon cap flatcap hat headband bandana maidcap
belt spools brooch badge sash necktie earmuffs flower cane bag pince fishingrod.
Colour names: see `L.CLOTH`, `L.HAIR`, `L.EYES` in paper.js, or any hex.

Quick NPC: `NP.art.human.make({ build:'adult', sex:'f', hair:{style:'bob',color:'mint'}, outfit:{type:'dress',main:'sky'} })`.

## Adding a look
Add `def('id', {...})` in `looks.js` (about 4 lines). Add a hair style: entry in `STY` (ow-parts.js) and `HS` (portrait.js).
Preview: `node tools/preview-human.mjs [ow|portrait|all] [outdir] [idRegex]`.
