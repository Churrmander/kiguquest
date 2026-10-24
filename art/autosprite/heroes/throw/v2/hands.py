# Replace the open throwing hand in frame 3 (follow-through) with a hand-drawn BW-style open hand
# pointing up-right along the arm: thumb on the upper-left, fingers together, simple two-tone shading.
import math, sys
from PIL import Image
import numpy as np
d = sys.argv[1]
PAD = 4
HANDS = {   # per hero: open hand pointing up-right, separate thumb on the upper-left, finger splits, narrow wrist
  'draco': (['......OOOO.',
             '.OO..OLLLLO',
             'OLLO.OLLMLO',
             'OLLLOLLLLMO',
             '.OLLLLLLLO.',
             '..OLLLLLMO.',
             '..OLLLLMO..',
             '.OLLLMMO...',
             'OLLMMOO....',
             '.OOO.......'], (1, 8)),
  'dahlia': (['.OO..OOO.',
              'OLLO.OLLO',
              'OLLO.OLMO',
              'OLLLOLLLO',
              '.OLLLLLO.',
              'OLLLLLMO.',
              'OLLLMMO..',
              '.OOOO....'], (1, 6)),
}
H = {  # palm centre, arm direction (deg), skin light/mid, outline
  'draco':  dict(c=(95.5, 9.5), ang=-32, L=(237, 201, 158), M=(187, 140, 101), O=(5, 4, 4)),
  'dahlia': dict(c=(81.5, 35.0), ang=-34, L=(251, 202, 158), M=(229, 168, 91), O=(7, 6, 6)),
}
for h, g in H.items():
    a = np.array(Image.open(f'{d}/{h}-torso-t3-gen.png').convert('RGBA'))
    a = np.pad(a, ((PAD, 0), (0, PAD), (0, 0)))
    cx, cy = g['c']; cy += PAD; th = math.radians(g['ang']); ux, uy = math.cos(th), math.sin(th)
    for y in range(a.shape[0]):                       # clear the old hand past the wrist
        for x in range(a.shape[1]):
            if (x - cx) * ux + (y - cy) * uy > -2.2 and math.hypot(x - cx, y - cy) < 9: a[y, x] = 0
    wx, wy = round(cx - 2.6 * ux), round(cy - 2.6 * uy)   # end of the remaining forearm
    HAND, WRIST = HANDS[h]
    ox, oy = wx - WRIST[0], wy - WRIST[1]
    for r, row in enumerate(HAND):
        for c, ch in enumerate(row):
            if ch == '.': continue
            y, x = oy + r, ox + c
            if ch == 'O' and a[y, x, 3] and tuple(a[y, x, :3]) != g['O']: continue   # don't outline over the arm
            a[y, x] = (*{'O': g['O'], 'L': g['L'], 'M': g['M']}[ch], 255)
    # close the silhouette around the hand: any transparent pixel touching hand skin becomes outline
    hb = np.zeros(a.shape[:2], bool); hb[max(0, oy - 1):oy + len(HAND) + 2, max(0, ox - 1):ox + len(HAND[0]) + 2] = True
    skin = hb & (a[..., 3] > 0) & ~np.all(a[..., :3] == g['O'], -1)
    pad = np.pad(skin, 1); near = pad[:-2, 1:-1] | pad[2:, 1:-1] | pad[1:-1, :-2] | pad[1:-1, 2:]
    a[near & (a[..., 3] == 0)] = (*g['O'], 255)
    ys, xs = np.where(a[..., 3] > 0); a = a[ys.min():, :xs.max() + 2]
    Image.fromarray(a).save(f'{d}/{h}-torso-t3.png')
print('ok')
