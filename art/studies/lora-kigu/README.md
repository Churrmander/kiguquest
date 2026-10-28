# New Kigu with the Kigu LoRA (ComfyUI)

Study for drawing the undrawn Kigu (76-151) locally with the retrained Kigu LoRA (`kigustyle_zimage_v2`, Z-Image Turbo) instead of AutoSprite. Each Kigu gets a front (battle), a dynamic pose (Sketchbook) and a back sprite. Nothing here is in the game yet.

## Pipeline

1. **Pick a house Kigu with a similar silhouette** (an approved AutoSprite Kigu in `art/autosprite/kigu/`), e.g. Stingle for Glowgrub (plain onesie, segmented tail).
2. **Recolour its costume** toward the new Kigu's colours: `tools/recolour_ref.py in.png out.png --from 30 50 --to 140 --keep-skin`.
3. **img2img each view from the matching house view** at denoise 0.8 (`tools/make_kigu.py "<caption-style look>" --ref refs/<id>-<view>.png --denoise 0.8 --view "..."`). Starting from the house art carries over its warm outline, 3-tone shading and eye size, and because base, pose and back all come from the same house Kigu, the three views line up. Plain txt2img scored only 5-6/10 (black outline, flat fill, big eyes, views that didn't match).
4. **Snap to the 128px grid** (`tools/snap.py`, run by `--snap`): detects the grid phase, keeps white inside the figure (glints), warm ink (50,29,10) outline.
5. **Pixel fixes from the art-critic list** with `tools/pixedit.py` (unspeckle, lock pose/back to the base palette, rebuild a hood edge, draw antennae, top-left relight). Each Kigu's fixes are a script in `fixes/`, so they can be re-run.
6. **Art critic** until every view scores 8/10.

`tools/spark_cellar.sh` makes first drafts (4 seeds x 3 views) for the rest of the Spark Cellar group.

## Results

| Kigu | Front | Pose | Back | Notes |
|---|---|---|---|---|
| 76 Glowgrub | 8 | 8 | 8 | from Stingle; 6 critic rounds (5-6 → 7 → 8) |
