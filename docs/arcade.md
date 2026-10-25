# The Lucky Spool arcade (Shibuyarn, Chapter 5)

Everything inside the arcade lives in `src/game/arcade/` (its own manifest, `src/game/arcade/files.json`); the room is
`src/maps/shibuyarn_arcade.js` and its furniture is `src/art/tiles/stamp_arcade.js`.

## Hook-up

* Map `shibuyarn_arcade`: spawn `door`; the exit warp goes to map `shibuyarn`, door `arcade` (the city map and its door belong to the
  Chapter 4-6 work).
* Any map script can open a cabinet or counter with `yield* c.arcade(id, opts)`:
  `cab_1` Moth Patrol, `cab_2` Button Breaker, `cab_3` Steam Chase, `platformer` Rooftop Hop, `claw` Plush Catcher, `coins`, `prizes`.
  `opts.free = n` gives n free goes (the rival's turn at the claw machine). It returns `{ plays, tickets, score }` for cabinets.
* Brownout: until flag `shibuyarn_lights` is set (the Spark Cellar is cleared), only `cab_1` and `claw` work. The other cabinets
  draw as `arcade_cab` variant `off` and say they're out of order.

## Economy

| thing | value |
|---|---|
| coins | $20 each at the coin counter (cups of 10, 50 +5 free, 100 +15 free) |
| a go | 3 coins on the four cabinets, 2 on the claw |
| tickets | Moth Patrol score/30, Button Breaker score/40, Steam Chase score/80, Rooftop Hop score/50 (+30 for clearing all three stages), claw 2 for a miss, 10 for a plush, 25 for a golden plush. A decent go pays about 30-45 |

Prizes (`src/game/arcade/prizes.js`, tickets): Plum Treat 60, Wish Candy 250, Snack Bag 300, Quick Claw 450, Expert Belt 700,
Sturdy Sash 700, Coin Charm 900, any of the 17 type pins 400, Cabbi Lv25 2000 (one only, listed once `NP.data.species.cabbi`
exists), Tailor Card designs 150-1000 (Gingham, Denim, Patchwork, Neon Night, Starry Sky, Gold Thread).

Held items defined here: `expert_belt` (super-effective hits +20%), `sturdy_sash` (survive one KO hit from full HP, used up),
`quick_claw` (1 in 5 to move first in its priority bracket), `coin_charm` (doubles Tailor prize money while any party Kigu holds
it), `pin_<type>` (that type's moves +20% power). Held items are given from the bag (Give) and taken back from the party menu
(Take Item).

## Save data

`NP.state.arcade = { coins, tickets, best: {id: score}, plays: {id: n}, plush: {speciesId | speciesId_gold: n}, cards: {id: 1},
card: id, bought: {cabbi: 1} }`, made on first use, so older saves need nothing.

## Adding a cabinet

`NP.arcade.register(id, { title, cost, lights, create() -> { score, over, lives?, update(), draw(fb, t) }, drawTitle(fb, t),
tickets(score, game), bot(game, frame) -> [buttons] })`. The `bot` drives `tests/arcade.test.mjs` and
`node tools/preview-arcade.mjs OUTDIR [id...]` (screenshots of the title, play and results screens; `room` shows the room).
