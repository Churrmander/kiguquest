# Battle-start throw, BW style (supersedes heroes/rig torso frames)

Three torso frames per hero, cropped at mid-thigh like the Pokemon Black/White player back sprite (the text box hides the rest):

1. `t1` upright, shoulders turned almost side-on toward the opponent, arms down (Dahlia: spool at the hip).
2. `t2` back to the camera, throwing hand raised by/above the cap holding the spool.
3. `t3` follow-through: leaning forward, throwing arm swept forward to about belt height, other arm tucked back.

1 image pixel = 1 art pixel; draw at the battle scale. Frames share each hero's palette (16-18 colours), a 1px outline-black edge and the same window height, so they can be swapped in place (bottom-aligned).
Art-critic gate (`.claude/agents/art-critic.md`): Draco 8/10 PASS (round 6), Dahlia 8/10 PASS (round 7).
Built by `bwthrow.py` (crop/pixelize), `fit3.py` (matches t3 scale to cap size; Draco uses T3SCALE=1.125) and `postfix.py` (hand pixel fixes).
