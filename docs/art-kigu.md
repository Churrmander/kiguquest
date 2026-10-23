# Kigu art (`NP.art.kigu`)

Files (load order in `src/art/kigu/files.json`): `canvas.js` (KCanvas layered material canvas, Palette, colour budget),
`parts.js` (layout + part library), `props.js` (held props, floating effects), `render.js` (renderer + public API),
`looks-starters.js`, `looks-meadow.js`, `looks-gingham.js`, `looks-p2.js` (58 species = the whole BIBLE §3 roster).
Preview: `node tools/preview-kigu.mjs <outDir> [ids]` (contact sheets), `--idle ids` (idle strips, front then back), `--chains`,
`--overview`, `--sleep` (env `SC` = upscale, default 2). Test: `node tests/kigu-art.test.mjs`.

## API
```js
front(id, { alt, frame, pose })  -> Bitmap 96x96,   anchor bottom-centre (48, 94)    // foe side
back(id, { alt, frame })         -> Bitmap 128x128, anchor bottom-centre (64, 126)   // player side
idleFrames(id)                   -> 6        // idle loop; frame 0 = rest pose; frame numbers wrap
icon(id, frame, { alt, pose })   -> Bitmap 32x32  (frame 1 = 1px hop)
has, ids, looks[id], CELL, define(id, spec), clearCache()
```
* **Back view at 4/3.** As in 5th-gen battles, the player's own Kigu is closer to the camera. The back sprite is not scaled at draw
  time: it is painted natively from the same spec with body height x4/3 on a 128 cell, so it stays crisp. Front and back share
  the feet baseline (2px above the cell bottom) and the horizontal centre.
* **Idle animation.** Every frame is re-rendered from the spec with phase offsets (`layout(..., {anim:{t, amp}})`): the head bobs
  (`amp` x unit px; the torso stretches/squashes with it, the feet stay planted, hands follow halfway) and swinging parts read
  `L.sw(offset)` — ears (floppy/long ones more), tails (each of a fan with its own phase), hair tails/long hair/braids, skirt and
  cape hems, wings, scarf ends, antennae, floating twinkles; tail flames flicker. All offsets are 0 at frame 0. Spec override:
  `idle: { n, amp }`; legendaries (`legend: true`) float with amp 2.
* **Palette.** <= 20 colours per battle sprite, <= 12 per icon (enforced in the test). Frame 0 decides the merges; the other frames
  replay them (`resolve({lock})`), so the idle loop never flickers colours.
* **Cost.** Everything is lazy and cached per (id, view, alt, frame); fitting uses an unshaded bbox pass. A battle renders 12
  bitmaps the first time two Kigu meet; the full roster test (58 x front/back x alt + 6 idle loops) runs in ~15s.

## Look spec
```js
K.define('konko', {
  name, stage, size /* total px height of the FRONT sprite in the 96 cell */, rise /* px reserved above head for ears/hats */,
  legend /* single-stage legendary: stage-3 sizing, higher idle float */, idle /* { n, amp } */,
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
Sizes by stage: stage 1 56-68, stage 2 68-80, stage 3 78-92 (the test allows +-2). Parts: `tail` (fox, fluff, cat, otter, dragon,
puff, bolt; n/fan for multi-tail; tip, flame, sway), `wings` (moth, insect, bat, feather, angel), `cape`, `skirt`, `belly` (oval,
apron, bib, v, poncho, jacket), `stripes`, `spots`, `scarf`, `collar`, `bowtie`, `bell`, `ring`, `hat` (tophat, chef, hard, mortar,
nightcap, crown, flowers, thimble, beret, rainhat, halo, goggles, headband, antennae, domino, tuft, sprout, bow, buns, bun, stars,
comb, petals), `prop`, `float` and `shapes` (tiny DSL: e/r/l/p/c/d/s/o ops, offsets from an anchor such as head, handL, handR,
chest, waist, feet, in 44px units; `m:true` mirrors; `stage` picks the layer; `view` limits it to front or back).

## How the pixels are made
* Layout unit `L.u` (1 in icons, ~1.4-2.4 in battle sprites) scales every "1px" constant of a part, so details keep their
  proportions at 96/128px. `L.k` (= body height / 44) scales spec offsets.
* Shading (canvas.js): per group, from its own mask, lit from the top-left. Kernel depths scale with the sprite: a broad shadow
  crescent bottom-right, a thin deep-shadow band hugging that edge (4th tone), a light band one step inside the top-left edge on
  big round forms (hood, body), cast shadows from bangs/hats/collars. Internal lines where a front piece meets one behind; 1px
  outer outline in a hue-shifted very dark colour of the main material; 15-bit quantize; colour merge to the budget.
* Faces in battle sprites: procedural anime eyes (thick upper lid with an outer lash flick, iris dark-to-light, tall pupil, big
  shine top-left + small shine bottom-right; sleepy = half lid; closed/happy arcs), stamped mouths (open smile, fang, cat, o, yawn,
  nom, pout) and a soft blush. Icons keep the original small templates.

## Known gaps
Back views share the front art direction (hoods/hair, tails, wings) with no face; some long-hair backs read as a flat slab. Props
held in a hand do not sway separately from the hand. Icons are the front sprite re-rendered smaller.
