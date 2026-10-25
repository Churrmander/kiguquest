# paint a thread spool over the ball the pose tool drew in the t2 hand (rebuild the frame with bwthrow.py first)
import sys
from PIL import Image
import numpy as np
d = sys.argv[1]
OUT = (6, 5, 5)
WOOD, WOODD = (200, 154, 90), (122, 82, 48)
WOOD_H = {'draco': ((150, 100, 60), (95, 60, 35))}
THREAD = {'draco': ((52, 72, 128), (30, 40, 84), (96, 116, 170)), 'dahlia': ((192, 48, 48), (120, 28, 28), (240, 130, 120))}
BOX = {'draco': (55, 12, 63, 22), 'dahlia': (49, 12, 58, 21)}     # where the generated ball was, 1x t2 coords
# 7 wide x 8 tall spool: F = flange, C = core (striped), . = keep (transparent where the ball was)
SPOOL = ['OOOOOOO',
         'OFFFFFO',
         '.OCCCO.',
         '.OCSCO.',
         '.OCCCO.',
         '.OCSCO.',
         'OFFFFFO',
         'OOOOOOO']
for h in ('draco', 'dahlia'):
    a = np.array(Image.open(f'{d}/{h}-torso-t2.png').convert('RGBA'))
    x0, y0, x1, y1 = BOX[h]
    skin = None
    sk = a[y0:y1 + 12, x1 - 2:x1 + 9].reshape(-1, 4); sk = sk[(sk[:, 3] > 0) & (sk[:, 0] > 170) & (sk[:, 0] > sk[:, 2] + 30)]
    if len(sk): vals, cnt = np.unique(sk[:, :3], axis=0, return_counts=True); skin = tuple(vals[cnt.argmax()])
    a[y0:y1, x0:x1] = 0                                   # clear the ball
    base, dark, hi = THREAD[h]
    ox = x0 + (x1 - x0 - 7) // 2 + (2 if h == 'draco' else 1); oy = y1 - 6          # sits down in the hand: bottom flange overlaps the fingers
    for r, row in enumerate(SPOOL):
        for c, ch in enumerate(row):
            if ch == '.': continue
            wl, wd = WOOD_H.get(h, (WOOD, WOODD))
            col = {'O': OUT, 'F': wl if c < 5 else wd, 'S': dark}.get(ch)
            if ch == 'C': col = (hi if (c == 2 and r == 2) else (dark if c == 4 else base))   # single top-left highlight
            a[oy + r, ox + c] = (*col, 255)
    if skin is not None:                                  # fingers wrapped across the lower front of the core
        for c in (2, 3, 4, 5): a[oy + 5, ox + c] = (*skin, 255)        # fingers across the front of the core
        for c in (3, 4, 5): a[oy + 4, ox + c + 1] = (*skin, 255) if c == 5 else a[oy + 4, ox + c + 1]
        a[oy + 6, ox + 6] = (*skin, 255)
    # drop leftover outline fragments of the old ball around the box (dark pixels with < 2 opaque neighbours)
    for _ in range(3):
        for y in range(max(0, y0 - 4), y1):
            for x in range(max(0, x0 - 4), min(a.shape[1], x1 + 4)):
                if a[y, x, 3] and a[y, x, :3].astype(int).sum() < 90:
                    n = sum(1 for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1))
                            if 0 <= y + dy < a.shape[0] and 0 <= x + dx < a.shape[1] and a[y + dy, x + dx, 3])
                    if n < 2: a[y, x] = 0
    Image.fromarray(a).save(f'{d}/{h}-torso-t2.png')
    fr = [Image.open(f'{d}/{h}-torso-{k}.png') for k in ('t1', 't2', 't3')]
    CW = max(f.width for f in fr) + 20; CH = max(f.height for f in fr) + 20
    s = Image.new('RGB', (CW * 3, CH), (143, 160, 184))
    for i, f in enumerate(fr): s.paste(f.convert('RGB'), (i * CW + (CW - f.width) // 2, CH - f.height), f.split()[3])
    s.resize((s.width * 3, s.height * 3), Image.NEAREST).save(f'{d}/{h}-bwthrow.png')
print('ok')
