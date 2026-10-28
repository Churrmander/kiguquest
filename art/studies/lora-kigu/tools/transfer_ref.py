"""Carry a new Kigu's front colours onto a house Kigu's other view, to seed that view's img2img.

img2img keeps the house layout, so the new front (raw 768 render) lines up pixel for pixel with the house front it came from.
For each house front colour we take the median new colour at the same pixels; the house pose/back is then repainted with
that map (each pixel via its nearest house front colour). The result is a pose/back reference that already wears the new design.

Usage: python transfer_ref.py house_base.png new_base_raw.png house_view.png out.png [--colours 24]
"""
import sys
import numpy as np
from PIL import Image

hb, nb, hv, out = sys.argv[1:5]
k = int(sys.argv[sys.argv.index('--colours') + 1]) if '--colours' in sys.argv else 24
H = Image.open(hb).convert('RGB')
pal_img = H.quantize(k, method=Image.MEDIANCUT)
pal = np.array(pal_img.getpalette()[:k * 3]).reshape(-1, 3).astype(float)
hidx = np.array(pal_img)
N = np.array(Image.open(nb).convert('RGB').resize(H.size, Image.NEAREST)).astype(float)
cmap = pal.copy()
for i in range(k):
    m = hidx == i
    if m.sum() > 20 and pal[i].min() < 240:  # leave white background alone
        cmap[i] = np.median(N[m], axis=0)
V = np.array(Image.open(hv).convert('RGB')).astype(float)
flat = V.reshape(-1, 3)
idx = ((flat[:, None] - pal[None]) ** 2).sum(-1).argmin(1)
res = cmap[idx].reshape(V.shape)
res[V.min(-1) > 240] = 255
Image.fromarray(res.astype(np.uint8)).save(out)
print(out)
