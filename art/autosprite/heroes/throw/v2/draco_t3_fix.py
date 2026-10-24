# Fill the two shirt-sleeve upper arms in Draco's frame 3 that the white-background cut punched out.
import sys
from PIL import Image
import numpy as np
from matplotlib.path import Path
d = sys.argv[1]
a = np.array(Image.open(f'{d}/draco-torso-t3.png').convert('RGBA'))
W, S, O = (255, 255, 255), (227, 221, 214), (5, 4, 4)
polys = [[(57, 23), (64, 20), (72, 18), (75, 23), (76, 27), (70, 30), (59, 31), (56, 30)],   # throwing upper arm
         [(36, 22), (28, 24), (21, 27), (25, 30), (30, 32), (35, 31), (37, 26)]]   # trailing upper arm
yy, xx = np.mgrid[:a.shape[0], :a.shape[1]]; pts = np.c_[xx.ravel() + .5, yy.ravel() + .5]
for poly in polys:
    m = Path(poly).contains_points(pts).reshape(a.shape[:2]) & (a[..., 3] == 0)
    ys, xs = np.where(m); cy = ys.mean()
    for y, x in zip(ys, xs): a[y, x] = (*(W if y < cy else S), 255)
# re-close the outline around the filled sleeves
solid = a[..., 3] > 0; pad = np.pad(solid, 1)
edge = solid & ~(pad[:-2, 1:-1] & pad[2:, 1:-1] & pad[1:-1, :-2] & pad[1:-1, 2:])
for y, x in zip(*np.where(edge)):
    if tuple(a[y, x, :3]) in (W, S): a[y, x, :3] = O
Image.fromarray(a).save(f'{d}/draco-torso-t3.png')
print('ok')
# old outline strokes left inside the sleeves: recolour interior outline pixels to the sleeve shade
a = np.array(Image.open(f'{d}/draco-torso-t3.png').convert('RGBA'))
for poly in polys:
    inside = Path(poly).contains_points(pts).reshape(a.shape[:2])
    solid = a[..., 3] > 0; pad = np.pad(solid, 1)
    interior = pad[:-2, 1:-1] & pad[2:, 1:-1] & pad[1:-1, :-2] & pad[1:-1, 2:]
    for y, x in zip(*np.where(inside & interior)):
        if tuple(a[y, x, :3]) in (O, (120, 115, 110), (40, 38, 41)): a[y, x, :3] = S
Image.fromarray(a).save(f'{d}/draco-torso-t3.png')
