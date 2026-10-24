# Hand fixes from the art-critic pass on the Phase 2 backs. Works on the 128x128 art grid (1 cell = 8px block).
import sys
from PIL import Image
import numpy as np
from scipy import ndimage as ndi
d = sys.argv[1]
W = np.array((255, 255, 255))
def load(n): return np.array(Image.open(f'{d}/{n}-back-px-gen.png').convert('RGB').resize((128, 128), Image.NEAREST)).astype(int)
def save(n, a): Image.fromarray(a.astype(np.uint8)).resize((1024, 1024), Image.NEAREST).save(f'{d}/{n}-back-px.png')
def outline_of(a):
    ink = a.min(-1) < 250; px = a[ink]; return px[px.sum(1).argmin()]
def reoutline(a, region):
    # cells inside region that now touch white get the sprite's outline colour
    O = outline_of(a); ink = a.min(-1) < 250; pad = np.pad(~ink, 1)
    touch = pad[:-2, 1:-1] | pad[2:, 1:-1] | pad[1:-1, :-2] | pad[1:-1, 2:]
    m = ink & touch & region; a[m] = O
# Pebbi: no tail in her design; erase the tail sticking out at the lower left
a = load('pebbi'); r = np.zeros((128, 128), bool); r[86:101, 26:39] = True
a[r] = W; band = np.zeros_like(r); band[86:101, 36:42] = True; reoutline(a, band)
# her hood is a smooth dome with no ears: clear everything above a dome over the head, then close the outline
yy, xx = np.mgrid[:128, :128]; dome = ((xx - 63) / 23.0) ** 2 + ((yy - 42) / 23.0) ** 2 <= 1
ears = (yy < 32) & (xx >= 38) & (xx <= 90) & ~dome; a[ears] = W
band = (yy < 34) & (xx >= 38) & (xx <= 90); reoutline(a, band); save('pebbi', a)
# Shroomelle: shave the pointed ear tufts on the hair and the lilac tail tuft under the skirt
a = load('shroomelle'); lil = (a[..., 2] > a[..., 1] + 10) & (a[..., 0] > 90) & (a[..., 0] < 215)   # lilac hair/tuft shades
r = np.zeros((128, 128), bool); r[33:41, 79:88] = True; a[r & lil] = W            # right ear tip, against background
r = np.zeros((128, 128), bool); r[32:39, 54:61] = True; a[r & lil] = a[36, 50]    # left ear tip, against the cap underside
r = np.zeros((128, 128), bool); r[79:92, 40:57] = True
dark = a.sum(-1) < 60; a[r & (lil | dark)] = (243, 210, 169)                     # tail tuft and its outline -> skirt ruffle colour
band = np.zeros((128, 128), bool); band[77:94, 38:59] = True; reoutline(a, band)
# stray outline strokes left floating where the right ear tip was removed
for _ in range(2):
    wh = a.min(-1) >= 250; pad = np.pad(wh, 1).astype(int)
    nw = pad[:-2, 1:-1] + pad[2:, 1:-1] + pad[1:-1, :-2] + pad[1:-1, 2:]
    stray = np.zeros_like(wh); stray[30:44, 74:92] = True
    a[stray & ~wh & (nw >= 3)] = W
band = np.zeros((128, 128), bool); band[30:44, 74:92] = True; reoutline(a, band); save('shroomelle', a)
# Voltessa: generated small; scale the sprite up 1.25x on the art grid, keep feet on the same baseline, centred
a = load('voltessa'); ink = a.min(-1) < 250; ys, xs = np.where(ink)
crop = Image.fromarray(a[ys.min():ys.max() + 1, xs.min():xs.max() + 1].astype(np.uint8))
big = np.array(crop.resize((round(crop.width * 1.25), round(crop.height * 1.25)), Image.NEAREST)).astype(int)
out = np.full((128, 128, 3), 255); bh, bw = big.shape[:2]; y1 = ys.max() + 1; x0 = 64 - bw // 2
out[y1 - bh:y1, x0:x0 + bw] = big; save('voltessa', out)
print('ok')
