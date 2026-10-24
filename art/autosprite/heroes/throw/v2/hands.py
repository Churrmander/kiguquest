# Frame 3 hands. Draco: original. Dahlia: the owner's own hand edit (.preview/reference/dahlia-hand.png, the right
# panel of a 10x before/after sheet of sprite box (60,22)-(95,48)), read back one pixel per 10x10 cell and snapped to
# her frame's existing palette; background cells become transparent. Nothing is redrawn.
import sys
from PIL import Image
import numpy as np
d = sys.argv[1]
Image.open(f'{d}/draco-torso-t3-gen.png').save(f'{d}/draco-torso-t3.png')
BG = np.array((143, 160, 184)); X0, Y0, W, H, S, PX = 60, 22, 35, 26, 10, 380
sheet = np.array(Image.open(f'{d}/dahlia-hand-owner.png').convert('RGB')).astype(int)
a = np.array(Image.open(f'{d}/dahlia-torso-t3-gen.png').convert('RGBA'))
pal = np.unique(a[a[..., 3] > 0][:, :3], axis=0).astype(int)
cand = np.vstack([pal, BG])
changed = 0
for j in range(H):
    for i in range(W):
        # the edit has pasted blocks off the 10px grid and soft brush strokes, so vote over the whole cell:
        # every pixel snaps to the palette (selection halos, near-white, are ignored), the most common colour wins, background only on a majority
        cell = sheet[j * S:(j + 1) * S, PX + i * S:PX + (i + 1) * S].reshape(-1, 3)
        cell = cell[~((cell.min(1) > 200) & (np.abs(cell - BG).sum(1) > 60))]
        ks = ((cell[:, None] - cand[None]) ** 2).sum(-1).argmin(1)
        votes = np.bincount(ks, minlength=len(cand))
        k = len(pal) if votes[len(pal)] > 0.5 * len(ks) else votes[:len(pal)].argmax()   # plurality colour
        y, x = Y0 + j, X0 + i
        new = (0, 0, 0, 0) if k == len(pal) else (*cand[k], 255)
        if tuple(a[y, x]) != new and not (a[y, x, 3] == 0 and new[3] == 0): changed += 1
        a[y, x] = new
Image.fromarray(a.astype(np.uint8)).save(f'{d}/dahlia-torso-t3.png')
print('ok, pixels changed vs original:', changed)
