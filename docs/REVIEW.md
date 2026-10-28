# Review notes (from the owner)

Open issues spotted while playtesting. Fix, then move the item to Done with the commit.

## Open

- **Kigu back sprites: arms drawn behind the body and over the tail.** Seen on Konko's back view in battle (grass stage, Lv 9):
  the mitts sit on the tail side of the body instead of in front of it / at the sides, and they overlap the tail. Check the
  back-view layer order in `src/art/kigu/render.js` (arms vs body vs tail) for every species, not just Konko.
- **Battle command buttons overflow the text box.** Fight / Bag / Kigu / Run (and the four move buttons) extend past the
  bottom of the 48px command area at `NP.BOX_Y`; the second row is cut off by the screen edge. `src/game/battlescene.js`
  (action menu and move menu layout).
- **Building art is the wrong scale for the new characters.** The house/lab/store/Salon stamps were drawn for 16×24 GBA
  sprites, so doors are shorter than the new 32×32 (≈1.5 tile) people. Redraw the building stamps at BW scale (doors about
  1.3× a character's height, taller walls) so they also read well as 3D volumes (`src/art/tiles/stamp_buildings.js`,
  `w3d_volumes.js`).

## Done
