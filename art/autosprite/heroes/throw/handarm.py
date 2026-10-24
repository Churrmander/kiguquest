# Hand-build the raised throwing arm in t2 (throwref2): upper arm up-and-out to an elbow beside the head, forearm folding
# back in over the hat at ~45 deg, a fist wrapping the lower half of the spool above the back of the hat.
# reads <hero>-torso-t2-gen.png (generated frame, 1x) and writes <hero>-torso-t2.png. Coordinates are generated-frame pixels.
import sys
from PIL import Image
import numpy as np
d = sys.argv[1]
G = {
  'draco':  dict(cut_x=29, cut_y=44, cut2=(30, 44, 36, 53), S=(29, 46), E=(40, 18), W=(27, 12), F=(26, 12), spool=(23, 5),
                 sleeve=0.40, skin=(231, 196, 160), skind=(196, 150, 116), cuff=(246, 244, 240), cuffd=(196, 196, 204),
                 thread=((52, 72, 128), (30, 40, 84), (96, 116, 170))),
  'dahlia': dict(cut_x=34, cut_y=44, cut2=(34, 44, 40, 54), S=(33, 48), E=(45, 18), W=(30, 11), F=(29, 11), spool=(26, 4),
                 sleeve=0.30, skin=(250, 206, 166), skind=(222, 160, 120), cuff=(252, 252, 252), cuffd=(214, 214, 224),
                 thread=((192, 48, 48), (120, 28, 28), (240, 130, 120))),
}
OUT = (6, 5, 5); WOOD, WOODD = (176, 128, 74), (110, 72, 40)
P = 8   # rows of headroom added on top (generated coords shift down by P)

def seg(px, py, a, b):
    ax, ay = a; bx, by = b; vx, vy = bx - ax, by - ay
    t = max(0.0, min(1.0, ((px - ax) * vx + (py - ay) * vy) / (vx * vx + vy * vy)))
    cx, cy = ax + t * vx, ay + t * vy
    return ((px - cx) ** 2 + (py - cy) ** 2) ** 0.5, t, (px - cx) * vy - (py - cy) * vx

for h, g in G.items():
    src = np.array(Image.open(f'{d}/{h}-torso-t2-gen.png').convert('RGBA'))
    H, W0 = src.shape[:2]
    a = np.zeros((H + P, W0 + 14, 4), np.uint8); a[P:, :W0] = src
    # 1. remove the generated pole arm and its spool
    a[:g['cut_y'] + P, g['cut_x']:] = 0
    x0, y0, x1, y1 = g['cut2']; a[y0 + P:y1 + P, x0:x1] = 0
    sh = lambda p: (p[0], p[1] + P)
    S, E, Wr, F = sh(g['S']), sh(g['E']), sh(g['W']), sh(g['F'])
    # 2. spool first (the fist goes over its lower half)
    sx, sy = g['spool'][0], g['spool'][1] + P
    base, dark, hi = g['thread']
    SP = ['OOOOOOO', 'OFFFFFO', '.OCCCO.', '.OCSCO.', '.OCCCO.', '.OCSCO.', 'OFFFFFO', 'OOOOOOO']
    for r, row in enumerate(SP):
        for c, ch in enumerate(row):
            if ch == '.': continue
            v = {'O': OUT, 'F': WOOD if c < 5 else WOODD, 'S': dark}.get(ch)
            if ch == 'C': v = hi if (c == 2 and r == 2) else (dark if c == 4 else base)
            a[sy + r, sx + c] = (*v, 255)
    # 3. arm: upper arm (sleeve cuff at the shoulder), tapered forearm, fist
    arm = np.zeros(a.shape[:2], bool); col = np.zeros(a.shape[:2] + (3,), np.uint8)
    for y in range(a.shape[0]):
        for x in range(a.shape[1]):
            du, tu, su = seg(x, y, S, E)
            df, tf, sf = seg(x, y, E, Wr)
            dh = ((x - F[0]) ** 2 + (y - F[1]) ** 2) ** 0.5
            rf = 3.0 - 1.0 * tf                                   # forearm tapers from the elbow to the wrist
            if du <= 3.4 or df <= rf or dh <= 3.0:
                arm[y, x] = True
                if dh <= 3.0 and df > rf and du > 3.4:            # fist: darker knuckle row on top, lit left side
                    col[y, x] = g['skind'] if (y < F[1] - 1 or x > F[0] + 1) else g['skin']
                elif du <= 3.4 and du <= df:
                    shadow = su > 1.2
                    col[y, x] = (g['cuffd'] if shadow else g['cuff']) if tu < g['sleeve'] else (g['skind'] if shadow else g['skin'])
                else:
                    col[y, x] = g['skind'] if sf > 0.9 else g['skin']
    a[arm, :3] = col[arm]; a[arm, 3] = 255
    # 4. clean orphans and redo the silhouette outline
    for _ in range(3):
        m = a[..., 3] > 0; pad = np.pad(m, 1).astype(int)
        n = pad[:-2, 1:-1] + pad[2:, 1:-1] + pad[1:-1, :-2] + pad[1:-1, 2:]
        a[m & (n < 2)] = 0
    m = a[..., 3] > 0; pad = np.pad(m, 1)
    a[m & ~(pad[:-2, 1:-1] & pad[2:, 1:-1] & pad[1:-1, :-2] & pad[1:-1, 2:]), :3] = OUT
    # crop to content, keeping 2 rows of headroom
    ys, xs = np.where(a[..., 3] > 0); a = a[max(0, ys.min() - 2):, xs.min():xs.max() + 1]
    Image.fromarray(a).save(f'{d}/{h}-torso-t2.png')
    fr = [Image.open(f'{d}/{h}-torso-{k}.png') for k in ('t1', 't2', 't3')]
    CW = max(f.width for f in fr) + 20; CH = max(f.height for f in fr) + 20
    s = Image.new('RGB', (CW * 3, CH), (143, 160, 184))
    for i, f in enumerate(fr): s.paste(f.convert('RGB'), (i * CW + (CW - f.width) // 2, CH - f.height), f.split()[3])
    s.resize((s.width * 3, s.height * 3), Image.NEAREST).save(f'{d}/{h}-bwthrow.png')
print('ok')
