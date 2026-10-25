# BW-style throw torso frames: crop at mid-thigh, pixelize on a 6px grid with one shared palette, align, preview.
# usage: python bwthrow.py <dir> <hero>    needs <hero>-t1.png, -t2.png, -t3.png (t3 is mirrored so the lean faces the opponent)
import sys, os
from PIL import Image
import numpy as np
d, h = sys.argv[1], sys.argv[2]
G = 6
def load(n, mirror=False):
    im = Image.open(f'{d}/{h}-{n}.png').convert('RGB')
    if mirror: im = im.transpose(Image.FLIP_LEFT_RIGHT)
    a = np.array(im).astype(float)
    from scipy import ndimage as ndi
    lab, n = ndi.label(a.min(-1) < 240, structure=np.ones((3, 3)))
    if n > 1:
        sizes = ndi.sum(np.ones_like(lab), lab, range(1, n + 1)); keep = 1 + int(np.argmax(sizes))
        a[(lab > 0) & (lab != keep)] = 255
    return a
MIRROR = set(sys.argv[3:])                      # frame names to mirror so the throw faces the opponent
raw = {k: load(k, k in MIRROR) for k in ('t1', 't2', 't3')}
def bbox(a):
    ys, xs = np.where(a.min(-1) < 240); return xs.min(), ys.min(), xs.max() + 1, ys.max() + 1
def head_w(a):  # width of the cap, found by its colour: the same object in every pose, so it sets the scale
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    if h == 'dahlia': cap = (r > 150) & (g < 95) & (b < 95)                                   # red beret
    else: cap = (abs(r - g) < 18) & (abs(g - b) < 18) & (r > 40) & (r < 125)                 # dark grey flat cap
    x0, y0, x1, y1 = bbox(a); cap[int(y0 + (y1 - y0) * 0.35):] = False                    # top of the figure only
    rows = np.where(cap.sum(1) >= 3)[0]; top = rows.min()
    ink = a.min(-1) < 240; hgt = y1 - top
    band = ink[top + int(hgt * 0.02):top + int(hgt * 0.08)]          # cap + head band, measured down from the cap top
    xs = np.where(band.any(0))[0]
    # ignore a raised arm beside the head: keep the run of columns around the cap's centre
    cc = int(np.where(cap[top:top + int(hgt * 0.08)].any(0))[0].mean())
    l = cc; r = cc
    while l - 1 in set(xs): l -= 1
    while r + 1 in set(xs): r += 1
    return r - l + 1, top, y1
def standing_h(a):  # cap top to feet, ignoring a hand raised above the head
    _, top, feet = head_w(a); return feet - top
ref_w = head_w(raw['t2'])[0]; ref_h = standing_h(raw['t2'])
for k in ('t1', 't3'):
    # t1 is upright but side-on (cap looks wider): match standing height. t3 is the same back view as t2: match cap width.
    import os
    s = float(os.environ.get(k.upper() + 'SCALE', ref_w / head_w(raw[k])[0])); im = Image.fromarray(raw[k].astype(np.uint8))
    im = im.resize((round(im.width * s), round(im.height * s)), Image.LANCZOS)
    can = Image.new('RGB', (max(1024, im.width), max(1024, im.height)), 'white'); can.paste(im, (0, 0)); raw[k] = np.array(can).astype(float)
_, _, _, sy1 = bbox(raw['t2']); sy0 = head_w(raw['t2'])[1]; stand = sy1 - sy0   # cap top to feet (a raised hand doesn't count)
cut = {}
feet_cut = sy1 - (sy0 + int(stand * 0.58))
for k, a in raw.items():
    x0, y0, x1, y1 = bbox(a); y0c = head_w(a)[1]      # window measured from the cap top
    # upright frames: fixed window from the cap; the bent-over t3: cut the same leg length off the feet as t2
    line = (y0c + int(stand * float(os.environ.get('T3FRAC', 0.58)))) if (k == 't3' and os.environ.get('T3WINDOW') == 'cap') else (y0c + int(stand * 0.58) if k != 't3' else y1 - feet_cut)
    cut[k] = a[y0:line, x0:x1]
blocks = {}
for k, a in cut.items():
    H = a.shape[0] // G * G; W = a.shape[1] // G * G
    blocks[k] = np.median(a[:H, :W].reshape(H // G, G, W // G, G, 3), axis=(1, 3))
fg = np.concatenate([b[b.min(-1) < 235] for b in blocks.values()])
side = int(np.ceil(np.sqrt(len(fg)))); buf = np.zeros((side * side, 3)); buf[:len(fg)] = fg; buf[len(fg):] = fg[0]
pal = np.array([c for _, c in Image.fromarray(buf.reshape(side, side, 3).astype(np.uint8)).quantize(17, method=Image.MEDIANCUT)
                .convert('RGB').getcolors(1 << 20)] + [(255, 255, 255)]).astype(float)
out = {}
for k, b in blocks.items():
    f = b.reshape(-1, 3); s = pal[((f[:, None] - pal[None]) ** 2).sum(-1).argmin(1)].reshape(b.shape).astype(np.uint8)
    from collections import deque
    white = s.min(-1) >= 235; Hh, Ww = white.shape; bg = np.zeros_like(white); q = deque()
    for y in range(Hh): q.extend([(y, 0), (y, Ww - 1)])
    for x in range(Ww): q.extend([(0, x), (Hh - 1, x)])
    while q:
        y, x = q.popleft()
        if 0 <= y < Hh and 0 <= x < Ww and white[y, x] and not bg[y, x]:
            bg[y, x] = True; q.extend([(y + 1, x), (y - 1, x), (y, x + 1), (y, x - 1)])
    # enclosed pure-white pockets (e.g. between a raised arm and the head) are background too
    from scipy import ndimage as ndi
    pure = (b.min(-1) >= 250) & ~bg
    lab, n = ndi.label(pure)
    for i in range(1, n + 1):
        m = lab == i
        if m.sum() >= 12: bg |= m
    solid = ~bg
    for _ in range(2):   # strip the pale fringe left where edge blocks mixed with the white background
        pad = np.pad(solid, 1); inner = pad[:-2, 1:-1] & pad[2:, 1:-1] & pad[1:-1, :-2] & pad[1:-1, 2:]
        solid &= ~(~inner & (s.min(-1) > 200))
    for _ in range(3):   # drop 1px streaks and orphans (thread trails, speckle)
        pad = np.pad(solid, 1).astype(int); n = pad[:-2, 1:-1] + pad[2:, 1:-1] + pad[1:-1, :-2] + pad[1:-1, 2:]
        solid &= n >= 2
    darkest = pal[:-1][pal[:-1].sum(1).argmin()].astype(np.uint8)
    s = s.copy(); s[s.astype(int).sum(-1) < 90] = darkest
    pad = np.pad(solid, 1); edge = solid & ~(pad[:-2, 1:-1] & pad[2:, 1:-1] & pad[1:-1, :-2] & pad[1:-1, 2:])
    s[edge] = darkest                    # continuous 1px dark outline, as in BW sprites
    rgba = np.dstack([s, (solid * 255).astype(np.uint8)])
    out[k] = rgba
    Image.fromarray(rgba).save(f'{d}/{h}-torso-{k}.png')
# preview: frames bottom-aligned (the text box hides everything below the crop), centred, on one strip
CW = max(o.shape[1] for o in out.values()) + 20; CH = max(o.shape[0] for o in out.values()) + 20
strip = Image.new('RGB', (CW * 3, CH), (143, 160, 184))
for i, k in enumerate(('t1', 't2', 't3')):
    im = Image.fromarray(out[k]); x = i * CW + (CW - im.width) // 2; y = CH - im.height
    strip.paste(im.convert('RGB'), (x, y), im.split()[3])
strip.resize((strip.width * 3, strip.height * 3), Image.NEAREST).save(f'{d}/{h}-bwthrow.png')
print('ok', h, {k: o.shape[:2] for k, o in out.items()})
