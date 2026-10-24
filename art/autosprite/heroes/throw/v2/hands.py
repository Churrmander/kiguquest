# Frame 3 hands, back to the generated art: Draco keeps his original hand; Dahlia's original hand is mirrored
# across the line of her arm so the thumb sits on the correct side.
import math, sys
from PIL import Image
import numpy as np
d = sys.argv[1]
Image.open(f'{d}/draco-torso-t3-gen.png').save(f'{d}/draco-torso-t3.png')
a = np.array(Image.open(f'{d}/dahlia-torso-t3-gen.png').convert('RGBA'))
PAD = 4; a = np.pad(a, ((PAD, PAD), (0, PAD), (0, 0)))
cx, cy = 81.5, 35.0 + PAD; th = math.radians(-34); ux, uy = math.cos(th), math.sin(th)
def in_hand(x, y): return (x + .5 - cx) * ux + (y + .5 - cy) * uy > -2.2 and math.hypot(x + .5 - cx, y + .5 - cy) < 9
src = a.copy(); out = a.copy()
for y in range(a.shape[0]):
    for x in range(a.shape[1]):
        if in_hand(x, y): out[y, x] = 0
for y in range(a.shape[0]):
    for x in range(a.shape[1]):
        dx, dy = x + .5 - cx, y + .5 - cy; al = dx * ux + dy * uy
        rx, ry = cx + 2 * al * ux - dx, cy + 2 * al * uy - dy          # reflection across the arm axis
        sx, sy = int(math.floor(rx)), int(math.floor(ry))
        if 0 <= sx < a.shape[1] and 0 <= sy < a.shape[0] and in_hand(sx, sy) and src[sy, sx, 3]:
            if out[y, x, 3] == 0 or in_hand(x, y): out[y, x] = src[sy, sx]
# close the silhouette: transparent pixels touching the flipped hand become outline
zone = np.zeros(out.shape[:2], bool)
for y in range(out.shape[0]):
    for x in range(out.shape[1]): zone[y, x] = math.hypot(x + .5 - cx, y + .5 - cy) < 10.5
skin = zone & (out[..., 3] > 0) & (out[..., :3].sum(-1) > 60)
pad = np.pad(skin, 1); near = pad[:-2, 1:-1] | pad[2:, 1:-1] | pad[1:-1, :-2] | pad[1:-1, 2:]
out[near & (out[..., 3] == 0)] = (7, 6, 6, 255)
ys, xs = np.where(out[..., 3] > 0); out = out[ys.min():ys.max() + 1, :xs.max() + 1]
Image.fromarray(out).save(f'{d}/dahlia-torso-t3.png')
print('ok')
