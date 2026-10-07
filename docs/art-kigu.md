# Kigu art (`NP.art.kigu`)

Files (load order in `src/art/kigu/files.json`): `canvas.js` (KCanvas layered material canvas, Palette, colour budget),
`parts.js` (layout + part library), `render.js` (renderer + public API), `looks-starters.js`, `looks-meadow.js`,
`looks-gingham.js`, `looks-p2.js` (58 species = the whole BIBLE §3 roster). Preview: `node tools/preview-kigu.mjs <outDir> [ids]`
(env `SC` = upscale). Test: `node tests/kigu-art.test.mjs` (<=16 colours per sprite, <=12 per icon, no edge clipping, determinism).

## API
`front(id,{alt})`, `back(id,{alt})` -> 64x64; `icon(id,frame,{alt})` -> 32x32 (frame 1 = 1px hop); `has`, `ids`, `looks[id]`;
`define(id, spec)` adds a species. Results are cached; clone() before mutating. `clearCache()` exists.

## Look spec
```js
K.define('konko', {
  name, stage, size /* total px height */, rise /* px reserved above head for ears/hats */,
  pal: { main, sub, hair, skin, eye, mitt, foot, inner, ...any extra material }, // '#hex' -> auto hue-shifted 5-tone ramp
  alt: {..overrides} | degrees,           // alt colourway; default = hue-rotate costume colours by 150
  hood: { type:'up'|'band'|'none', mat, ears:{kind:'tri|round|long|floppy|leaf|horn|ball',h,w,lean,dy,over,inner,mat}, pattern(cv,L) },
  hair: { style:'short|bob|long|twin|pony|side|braid', bangs:'part|spiky|long|short', mat, len, drop, bare },
  eyes: { style:'round|sleepy|closed|happy|dot|slit|tall', w,h }, mouth:'smile|flat|o|cat|fang|pout|yawn|nom',
  face: ['freckles','glasses','nose','whiskers','brow','eyespots'],
  arms: { mat, mittMat, mittR, pose:'down|out|front|up', type:'wing', extraArms }, footMat, cocoon, headW, bodyW, bodyH,
  parts: [ [name, opts], ... ]
})
```
Parts: `tail` (fox, fluff, cat, otter, dragon, puff, bolt; n/fan for multi-tail; tip, flame), `wings` (moth, insect, bat, feather,
angel), `cape`, `skirt`, `belly` (oval, apron, bib, v, poncho, jacket), `stripes`, `spots`, `scarf`, `collar`, `bowtie`, `bell`,
`ring`, `hat` (tophat, chef, hard, mortar, nightcap, crown, flowers, thimble, beret, rainhat, halo, goggles, headband, antennae,
domino, tuft, sprout, bow, buns, bun, stars) and `shapes` (tiny DSL: e/r/l/p/c/d/s/o ops, offsets from an anchor such as
head, handL, handR, chest, waist, feet, in 44px units; `m:true` mirrors; `stage` picks the layer).
Shading, inner lines, outline (hue-shifted dark of main) and the colour budget are automatic (canvas.js).

## Known gaps
Icons are the front sprite re-rendered smaller (small props fade out); some multi-tail/cape silhouettes could use hand polish;
back views share the front art direction (hoods/hair, tails, wings) with no face.
