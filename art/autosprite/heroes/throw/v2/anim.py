# BW-style battle-start throw preview: idle hold, wind-up, follow-through, spool flies out, trainer slides off left.
# Frames are anchored on the cap/beret centre and the bottom edge so the body doesn't jump between poses.
import sys, math
from PIL import Image
import numpy as np
d = sys.argv[1]; S = 3; CW, CH = 200, 120; BG = (143, 160, 184)
CUT = {('dahlia', 'wind'): 0.76}
THREAD = {'draco': ((52, 72, 128), (30, 40, 84), (110, 130, 180)), 'dahlia': ((192, 48, 48), (120, 28, 28), (240, 130, 120))}
def cap_cx(a, h):
    r, g, b = a[..., 0].astype(int), a[..., 1].astype(int), a[..., 2].astype(int)
    m = ((r > 150) & (g < 95) & (b < 95)) if h == 'dahlia' else ((abs(r - g) < 20) & (abs(g - b) < 24) & (r > 40) & (r < 130))
    m &= a[..., 3] > 0; m[int(a.shape[0] * 0.35):] = False
    return np.where(m)[1].mean()
def spool(h):
    O, W1, W2 = (6, 5, 5), (176, 128, 74), (110, 72, 40); T, Td, Th = THREAD[h]
    rows = ['OOOOOOO', 'OWWWWWO', '.OTHTO.', '.OTTDO.', '.OTTDO.', 'OWWWWWO', 'OOOOOOO']
    im = Image.new('RGBA', (7, 7))
    for y, row in enumerate(rows):
        for x, ch in enumerate(row):
            if ch != '.': im.putpixel((x, y), (*{'O': O, 'W': W1 if x < 4 else W2, 'T': T, 'H': Th, 'D': Td}[ch], 255))
    return im
for h in ('draco', 'dahlia'):
    fr = {k: Image.open(f'{d}/{h}-{f}.png').convert('RGBA') for k, f in (('idle', 'idle'), ('wind', 'torso-t1'), ('follow', 'torso-t3'))}
    def cap_top(a):
        r, g, b = a[..., 0].astype(int), a[..., 1].astype(int), a[..., 2].astype(int)
        m = ((r > 150) & (g < 95) & (b < 95)) if h == 'dahlia' else ((abs(r - g) < 20) & (abs(g - b) < 24) & (r > 40) & (r < 130))
        m &= a[..., 3] > 0; return np.where(m.sum(1) >= 3)[0].min()
    # one crop for every pose: from the cap top down a fixed length (the idle frame's), like the BW mid-thigh cut
    L = fr['idle'].height - cap_top(np.array(fr['idle']))
    for k in fr:
        t = cap_top(np.array(fr[k])); im = fr[k]
        f = CUT.get((h, k), 1.0)      # Dahlia's wide wind-up stance is short enough that her feet would show
        fr[k] = im.crop((0, 0, im.width, min(im.height, t + round(L * f))))     # bottom-aligned later, like the BW text-box cut
    anchor = {k: cap_cx(np.array(v), h) for k, v in fr.items()}
    X0 = 70   # cap centre x on the canvas
    def place(can, k, dx=0, dy=0):
        im = fr[k]; x = round(X0 - anchor[k] + dx); y = round(CH - im.height + dy)
        can.alpha_composite(im, (x, y)); return x, y
    # hand position in the follow-through (right-most skin pixel near the top) for the spool launch point
    a = np.array(fr['follow']); ys, xs = np.where(a[..., 3] > 0); top = ys < a.shape[0] * 0.4
    hx, hy = xs[top].max(), ys[top][xs[top].argmax()]
    sp = spool(h); seq = []
    def frame(k, ms, dx=0, dy=0, sp_at=None, trail=None):
        can = Image.new('RGBA', (CW, CH), (*BG, 255))
        if trail:
            from PIL import ImageDraw
            dr = ImageDraw.Draw(can); dr.line(trail, fill=(*THREAD[h][0], 255), width=1)
        x, y = place(can, k, dx, dy) if k else (0, 0)
        if sp_at: can.alpha_composite(sp, (round(sp_at[0]), round(sp_at[1])))
        seq.append((can, ms)); return x, y
    def tween(k1, k2, ms, d1=(0, 0), d2=(0, 0)):
        a1 = Image.new('RGBA', (CW, CH)); a2 = Image.new('RGBA', (CW, CH))
        # each pose drawn halfway toward the other's cap position, then mixed on a checkerboard (pixel-art smear)
        mx = (d1[0] + d2[0]) / 2; my = (d1[1] + d2[1]) / 2
        place(a1, k1, mx, my); place(a2, k2, mx, my)
        A1, A2 = np.array(a1), np.array(a2); yy, xx = np.mgrid[:CH, :CW]; chk = (xx + yy) % 2 == 0
        mix = np.where(chk[..., None], np.where(A1[..., 3:] > 0, A1, A2), np.where(A2[..., 3:] > 0, A2, A1))
        can = Image.new('RGBA', (CW, CH), (*BG, 255)); can.alpha_composite(Image.fromarray(mix.astype(np.uint8)))
        seq.append((can, ms))
    for _ in range(2): frame('idle', 250)
    frame('idle', 100, dy=1)                       # small settle before the wind-up
    tween('idle', 'wind', 60, (0, 1), (-2, 1))
    frame('wind', 90, dx=-2, dy=1); frame('wind', 150)
    tween('wind', 'follow', 50, (0, 0), (3, 0))       # one smear frame into the release
    fx, fy = frame('follow', 70, dx=3)
    lx, ly = fx + hx - 3, fy + hy - 3                 # launch point at the open hand
    pts = []
    for i in range(1, 9):                             # spool arcs up-right and off screen, thread trailing
        t = i / 8; px = lx + (CW + 10 - lx) * t; py = ly - 40 * math.sin(t * math.pi * 0.6) - 10 * t
        pts.append((px + 3, py + 3)); frame('follow', 50, dx=3, sp_at=(px, py), trail=[(lx + 3, ly + 3)] + pts)
    frame('follow', 200, dx=3)
    for i in range(1, 7): frame('follow', 50, dx=3 - i * 14)   # trainer slides off to the left, as in BW
    frame(None, 400)
    frames = [f.convert('RGB').resize((CW * S, CH * S), Image.NEAREST) for f, _ in seq]
    frames[0].save(f'{d}/{h}-throw.gif', save_all=True, append_images=frames[1:], duration=[ms for _, ms in seq], loop=0, disposal=2)
    # key-frame strip for the critic
    strip = Image.new('RGBA', (CW * 3, CH), (*BG, 255))
    for i, k in enumerate(('idle', 'wind', 'follow')):
        c = Image.new('RGBA', (CW, CH), (*BG, 255)); place(c, k); strip.alpha_composite(c, (i * CW, 0))
    strip.convert('RGB').resize((CW * 3 * S, CH * S), Image.NEAREST).save(f'{d}/{h}-keys.png')
    print(h, len(seq), 'frames')
