# Paper-doll idle study

Prototype battle idles for Kyuubelle, Konko and Jerbi. The approved battle sprite is cut into parts (tail groups, flame/tuft
tips, ears, floating wisps, upper body vs legs). Each of the 24 frames (12 fps) moves those parts with integer offsets and small
RotSprite-style rotations (scale2x x3, then nearest). No pixels are drawn: gaps are filled from the nearest existing pixel. Frame 0 is
exactly the approved sprite, every frame stays inside the 96x96 cell and uses only the sprite's own palette.

* `rig.py` is the engine, `kigu.py` holds the per-Kigu part polygons and keyframe tables, and `render.py` writes frames and GIFs (left = the current 1px bob, right = the rig).
* Art critic: all three fronts and all three backs scored 8/10 (pass). Backs use the 128x128 cell; Kyuubelle's overlapping back tails lift as one piece.
