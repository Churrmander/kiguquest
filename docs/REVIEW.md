# Review notes (from the owner)

Open issues spotted while playtesting. Fix, then move the item to Done with the commit.

## Open

- **Kigu back sprites: arms drawn behind the body and over the tail.** Seen on Konko's back view in battle (grass stage, Lv 9):
  the mitts sit on the tail side of the body instead of in front of it / at the sides, and they overlap the tail. Check the
  back-view layer order in `src/art/kigu/render.js` (arms vs body vs tail) for every species, not just Konko.
- **Battle command buttons overflow the text box.** Fight / Bag / Kigu / Run (and the four move buttons) extend past the
  bottom of the 48px command area at `NP.BOX_Y`; the second row is cut off by the screen edge. `src/game/battlescene.js`
  (action menu and move menu layout).

## Done
