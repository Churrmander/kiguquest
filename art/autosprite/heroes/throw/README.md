# Battle-start throw, BW style

Three torso frames per hero, cropped at about mid-thigh like the Pokemon Black/White player back sprite, as the owner described them:

1. `t1` wind-up: right arm pulled back low with the spool, torso twisted so the chest shows.
2. `t2` mid wind-up: back to the camera, right arm up and bent, spool held by the head.
3. `t3` release: bent forward, right arm extended forward, left arm slightly back.

1 image pixel = 1 art pixel. Each hero's frames share a palette and a 1px outline black; bottom-align them when swapping.
Art-critic gate: Draco 8/10 PASS, Dahlia 8/10 PASS.
Rebuild: `T1SCALE=0.962 T3SCALE=1.136 python bwthrow.py . draco`, `T1SCALE=0.86 T3SCALE=1.0 T3WINDOW=cap T3FRAC=0.47 python bwthrow.py . dahlia`,
then `python spool.py .` (paints the thread spool over the ball the pose generator drew in t2).
