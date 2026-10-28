import sys; sys.path.insert(0, '.')
from pixedit import *
picks = {'base': 'out/m2-noctura-base-s243_00001_-px.png', 'pose': 'out/m2-noctura-pose-s251_00001_-px.png', 'back': 'out/m2-noctura-back-s251_00001_-px.png'}
out = {}
for v, f in picks.items():
    a = drop_floating(load(f), keep_min=150)
    a = unspeckle(a, protect=[(44, 20, 86, 56)] if v != 'back' else [], passes=1)
    out[v] = reoutline(a)
for v, a in out.items():
    save(a, f'study/noctura/noctura-{v}-1x.png', f'study/noctura/noctura-{v}.png')

# lift the near-black cloak to navy and stitch gold stars on it (critic: ink-heavy cloak, too few stars)
NV, NV2, NV3 = (40, 44, 92), (64, 70, 128), (26, 28, 62)
for v in ('base', 'pose', 'back'):
    a = load(f'study/noctura/noctura-{v}-1x.png')
    a = replace(a, {(46, 45, 44): NV, (55, 45, 35): NV, (56, 63, 64): NV}, box=(0, 56, 128, 128))
    a = inner_ink(a, (0, 62, 128, 128), NV)
    relight(a, NV, NV3, NV2, box=(0, 56, 128, 128), depth=2)
    import random
    rnd = random.Random(81)
    cand = [(x, y) for y in range(64, 118) for x in range(18, 110)
            if tuple(a[y, x]) == NV and all(tuple(a[y + dy, x + dx]) in (NV, NV2, NV3) for dx in (-2, -1, 0, 1, 2) for dy in (-2, -1, 0, 1, 2))]
    pts = []
    for p_ in rnd.sample(cand, len(cand)):                                           # 9 scattered stars, at least 9 px apart
        if all(abs(p_[0] - q[0]) + abs(p_[1] - q[1]) > 12 for q in pts):
            pts.append(p_)
        if len(pts) == 9:
            break
    stars(a, pts, (240, 200, 60), on={NV, NV2, NV3})
    save(a, f'study/noctura/noctura-{v}-1x.png', f'study/noctura/noctura-{v}.png')

b = load('study/noctura/noctura-base-1x.png')                                        # lantern-yellow face -> skin like the pose
b = replace(b, {(250, 250, 159): (250, 221, 184)}, box=(40, 34, 88, 64))
save(b, 'study/noctura/noctura-base-1x.png', 'study/noctura/noctura-base.png')
