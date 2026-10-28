# Kigu Quest — Art targets (from the owner)

Two reference screenshots from a commercial late-DS RPG define the target *look*. They are **style references only**: use them
for composition, lighting and rendering feel, never trace or recreate their characters, tiles, layouts or text (the game stays
fully original, see DESIGN "Originality rule"). The files live locally in `.preview/reference/` (git-ignored, not in the repo):

* `.preview/reference/world-street.png` — **"how the world should look."**
* `.preview/reference/battle-trainer.png` (+ `.webp` original, an animated frame) — **"how battles should look."**

If the files are missing (fresh clone), ask the owner to re-share them.

## 1. The world (`world-street.png`)

What the reference shows:

* A **tilted camera with real perspective**: a long street narrows toward a hazy sky; characters are 2D sprites that scale with
  depth (far ones small, the hero large in the foreground).
* **Buildings are 3D volumes**: you see receding side walls with window grids, awnings with depth (a pink-and-white striped shop
  canopy), display counters, railings along the pavement, a lamp post with a coloured cap.
* **Trees are chunky low-poly-looking lobes** in bright lime/yellow-green with dark-green undersides and a visible trunk, rising
  above the street; they overlap the buildings.
* **Ground**: cool grey-blue cobblestones, lighter at the kerb, soft shadows from the buildings; the far end fades into haze.
* Overall: high-key, saturated but soft, clean, polished; small selective outlines on characters, none on environment.

Where the game stands (2026-10-15): `NP.view3d` (`src/engine/persp.js`) already renders a tilted ground plane (mode-7 style)
with upright billboards, but it is **off by default** and still has gaps against the reference:

1. It must become the default look outdoors (per-map presets: `street`, `town`, `flat-ish`), with indoors staying flat or gently tilted.
2. `treeline` terrain is stretched as a ground texture; it should be billboard tree clusters with volumetric lime canopies.
3. Buildings are single flat billboards; they need visible side walls / roof depth (or a second billboard for the side).
4. No sky: the ground fades to a fog colour but there is no sky gradient, cloud band or haze at the horizon.
5. Needed props: striped awnings, railings, lamp posts, kerbs, soft contact shadows under every object and character.
6. Palette: lime foliage, pastel shopfronts, cool cobbles (see tiles/terrain palettes).

## 2. Battles (`battle-trainer.png`)

What the reference shows:

* A **wide panoramic stage** seen from a low-ish camera: vertical sky gradient with soft cloud bands, bright haze at the horizon,
  smooth softly lit ground (gentle gradient, very sparse detail).
* **One big oval platform per side**: dark desaturated steel-blue with a subtle centre-to-rim gradient, a lighter rim ring and a
  soft halo. The foe's platform is far and large-ish (upper right); the player's is **closer, bigger, lower-left and partly cut off
  by the text box**.
* The foe (trainer or Kigu) stands on the platform in a dynamic 3/4 pose, ~45% of the screen height.
* HUD: a thin dark bar across the top-left with **six party-ball pips** (trainer battles: lit = remaining), and a **dark
  translucent text panel with a rounded top edge** along the bottom with crisp white text.
* A slow camera move on intro (sweep, then settle) and a gentle idle sway.

Mapping to the game:

| Piece | Where | Status |
|---|---|---|
| Panoramic backgrounds + platform discs (`NP.art.tiles.battleBg(id)`; optional `layers`, `enemyDisc`, `playerDisc`) | `src/art/tiles` | in progress (art agent, Oct 15) |
| Camera sway / intro pan using the layers | `src/game/battlescene.js` | todo |
| Player-side sprite scale (closer to camera, ~1.25-1.5x) | `src/game/battlescene.js` | todo |
| Party-ball pips + translucent rounded text panel + sleek info boxes (`NP.art.ui`) | `src/art/ui`, `src/engine/ui.js` | todo |
| Trainer intro: slide-in, "You are challenged by ..." | `src/game/battlescene.js` | partly (send-out animation exists) |
