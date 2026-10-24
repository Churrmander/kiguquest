# Redraw the open throwing hand in frame 3 (follow-through): palm + spread fingers pointing along the arm, BW-style shading.
import math, sys
from PIL import Image
import numpy as np
d = sys.argv[1]
PAD = 4
H = {  # palm centre, arm direction (deg, screen coords), skin light/mid/dark, outline
  'draco':  dict(c=(95.5, 9.5), ang=-32, L=(237, 201, 158), M=(217, 187, 155), D=(187, 140, 101), O=(5, 4, 4)),
  'dahlia': dict(c=(81.5, 35.0), ang=-34, L=(251, 202, 158), M=(240, 190, 112), D=(229, 168, 91), O=(7, 6, 6)),
}
def seg(px, py, a, b):
    ax, ay = a; bx, by = b; vx, vy = bx - ax, by - ay
    t = max(0.0, min(1.0, ((px - ax) * vx + (py - ay) * vy) / (vx * vx + vy * vy)))
    return math.hypot(px - ax - t * vx, py - ay - t * vy)
for h, g in H.items():
    a = np.array(Image.open(f'{d}/{h}-torso-t3-gen.png').convert('RGBA'))
    a = np.pad(a, ((PAD, 0), (0, PAD), (0, 0)))             # room for the fingers at the top/right edges
    cx, cy = g['c']; cy += PAD; th = math.radians(g['ang']); ux, uy = math.cos(th), math.sin(th)
    # 1. clear the old hand: everything past the wrist line within reach of the palm
    for y in range(a.shape[0]):
        for x in range(a.shape[1]):
            along = (x - cx) * ux + (y - cy) * uy
            if along > -2.2 and math.hypot(x - cx, y - cy) < 9: a[y, x] = 0
    # 2. shapes: palm, four fingers fanning around the arm direction, thumb on the upper side
    fingers = [(-38, 4.6), (-14, 5.2), (8, 5.0), (30, 4.0)]
    caps = []
    for off, ln in fingers:
        t = th + math.radians(off); bx, by = cx + 1.6 * math.cos(t), cy + 1.6 * math.sin(t)
        caps.append(((bx, by), (bx + ln * math.cos(t), by + ln * math.sin(t)), 0.75))
    t = th - math.radians(80); caps.append(((cx, cy), (cx + 3.4 * math.cos(t), cy + 3.4 * math.sin(t)), 0.8))
    wrist = (cx - 3.0 * ux, cy - 3.0 * uy)
    m = np.zeros(a.shape[:2], bool); shade = np.zeros(a.shape[:2])
    for y in range(a.shape[0]):
        for x in range(a.shape[1]):
            px, py = x + 0.5, y + 0.5
            inside = math.hypot(px - cx, py - cy) <= 2.4 or seg(px, py, wrist, (cx, cy)) <= 1.9
            for p0, p1, r in caps: inside |= seg(px, py, p0, p1) <= r
            if inside: m[y, x] = True; shade[y, x] = (px - cx) * -uy + (py - cy) * ux   # + = lower side of the arm
    for y, x in zip(*np.where(m)):
        s = shade[y, x]; col = g['L'] if s < 0.2 else (g['M'] if s < 1.6 else g['D'])
        a[y, x] = (*col, 255)
    # 3. outline: transparent pixels touching the new hand become outline
    pad = np.pad(m, 1); near = pad[:-2, 1:-1] | pad[2:, 1:-1] | pad[1:-1, :-2] | pad[1:-1, 2:]
    a[near & ~m & (a[..., 3] == 0)] = (*g['O'], 255)
    # finger separations: a darker line between neighbouring fingers, past the palm
    for y, x in zip(*np.where(m)):
        r = math.hypot(x + 0.5 - cx, y + 0.5 - cy)
        if r < 2.7: continue
        rel = math.degrees(math.atan2(y + 0.5 - cy, x + 0.5 - cx)) - g['ang']
        rel = (rel + 180) % 360 - 180
        if any(abs(rel - mid) < 6 for mid in (-26, -3, 19)): a[y, x] = (*g['D'], 255)
    ys, xs = np.where(a[..., 3] > 0); a = a[ys.min():, :xs.max() + 2]
    Image.fromarray(a).save(f'{d}/{h}-torso-t3.png')
print('ok')
