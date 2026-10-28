# Hand pixel fixes from art-critic round 5, applied to the 1x torso frames after bwthrow.py.
import sys
from PIL import Image
import numpy as np
from collections import Counter
d = sys.argv[1]
OUT = None
def load(n): return np.array(Image.open(f'{d}/{n}.png').convert('RGBA'))
def save(n, a): Image.fromarray(a).save(f'{d}/{n}.png')
def outline_of(a): px = a[a[..., 3] > 0][:, :3]; return px[px.astype(int).sum(1).argmin()]
def neighbour_fill(a, box, pick):
    """repaint pixels in box for which pick(rgb) is true with the most common neighbouring colour that isn't picked/outline"""
    x0, y0, x1, y1 = box; ol = outline_of(a)
    for _ in range(6):
        changed = False
        for y in range(y0, y1):
            for x in range(x0, x1):
                if a[y, x, 3] == 0 or not pick(a[y, x, :3]): continue
                c = Counter()
                for dy in (-1, 0, 1):
                    for dx in (-1, 0, 1):
                        yy, xx = y + dy, x + dx
                        if 0 <= yy < a.shape[0] and 0 <= xx < a.shape[1] and a[yy, xx, 3] and not pick(a[yy, xx, :3]) \
                           and tuple(a[yy, xx, :3]) != tuple(ol):
                            c[tuple(a[yy, xx, :3])] += 1
                if c: a[y, x, :3] = c.most_common(1)[0][0]; changed = True
        if not changed: break
def shade_whites(a, mid=(225, 225, 232)):
    """keep pure white for the top-left of each white area, cool mid tone on the lower/right side (2 tones per material)"""
    w = (a[..., :3] == 255).all(-1) & (a[..., 3] > 0)
    from scipy import ndimage as ndi
    lab, n = ndi.label(w)
    for i in range(1, n + 1):
        ys, xs = np.where(lab == i)
        if len(ys) < 4: continue
        cy, cx = ys.mean(), xs.mean()
        m = (ys - cy) + (xs - cx) > 0.5
        a[ys[m], xs[m], :3] = mid
white = lambda c: (c == 255).all()
skin = np.array([199, 171, 145], np.uint8)

# --- Draco
t3 = load('draco-torso-t3'); ol = outline_of(t3)
for y in range(50, 62):
    for x in range(59, min(74, t3.shape[1])):
        c = t3[y, x, :3].astype(int)
        if t3[y, x, 3] and tuple(c) != tuple(ol) and c[0] > c[2] + 40 and c[0] < 200:   # leather browns in the hand box
            t3[y, x, :3] = skin
save('draco-torso-t3', t3)
t2 = load('draco-torso-t2')
for y in range(53, 60):
    for x in range(6, 13):
        if t2[y, x, 3] and (white(t2[y, x, :3]) or tuple(t2[y, x, :3]) == tuple(outline_of(t2)) and 8 <= x <= 11 and 55 <= y <= 57):
            t2[y, x, :3] = skin
save('draco-torso-t2', t2)
# --- Dahlia
a = load('dahlia-torso-t3'); neighbour_fill(a, (20, 22, 31, 29), white); save('dahlia-torso-t3', a)
a = load('dahlia-torso-t2'); neighbour_fill(a, (29, 44, 38, 61), white); save('dahlia-torso-t2', a)
for k in ('t1', 't2', 't3'):
    a = load(f'dahlia-torso-{k}'); shade_whites(a); save(f'dahlia-torso-{k}', a)
# rebuild preview strips
for h in ('draco', 'dahlia'):
    fr = [Image.open(f'{d}/{h}-torso-{k}.png') for k in ('t1', 't2', 't3')]
    CW = max(f.width for f in fr) + 20; CH = max(f.height for f in fr) + 20
    s = Image.new('RGB', (CW * 3, CH), (143, 160, 184))
    for i, f in enumerate(fr): s.paste(f.convert('RGB'), (i * CW + (CW - f.width) // 2, CH - f.height), f.split()[3])
    s.resize((s.width * 3, s.height * 3), Image.NEAREST).save(f'{d}/{h}-bwthrow.png')
print('ok')
