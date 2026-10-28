import sys; sys.path.insert(0, '.')
from pixedit import *
picks = {'base': 'out/m-batnap-base-s214_00001_-px.png', 'pose': 'out/m-batnap-pose-s234_00001_-px.png', 'back': 'out/m-batnap-back-s231_00001_-px.png'}
out = {}
for v, f in picks.items():
    a = drop_floating(load(f), keep_min=150)
    a = unspeckle(a, protect=[(44, 20, 86, 56)] if v != 'back' else [], passes=1)
    out[v] = reoutline(a)
for v, a in out.items():
    save(a, f'study/batnap/batnap-{v}-1x.png', f'study/batnap/batnap-{v}.png')

# master-front round fixes
b = load('study/batnap/batnap-base-1x.png'); p = load('study/batnap/batnap-pose-1x.png'); k = load('study/batnap/batnap-back-1x.png')
PL, PL2, PL3 = (78, 44, 103), (112, 70, 140), (52, 28, 70)
for box in ((20, 64, 54, 106), (82, 64, 108, 106)):                                  # solid-ink wings -> plum membrane
    b = inner_ink(b, box, PL)
    x0, y0, x1, y1 = box
wing = b.copy()                                                                      # back: the front's spread wings, behind the body
for y in range(60, 108):
    for x in list(range(16, 56)) + list(range(80, 112)):
        if tuple(k[y, x]) == WHITE and tuple(wing[y, x]) != WHITE and tuple(wing[y, x]) not in cols_where(b, (0, 0, 128, 128), lambda h, s, v: h < 40 and s > 0.15):
            k[y, x] = wing[y, x]
k = reoutline(k)
k = replace(k, {(118, 78, 153): (67, 43, 101), (97, 62, 142): (80, 50, 121)}, box=(56, 60, 82, 92))   # lilac patch on the back -> plum
LW = ((46, 72), [(24, 77), (28, 90), (36, 100), (44, 102)])
RW = ((82, 72), [(104, 77), (100, 90), (92, 100), (84, 100)])
p = replace(p, {(61, 25, 80): PL, (84, 40, 108): PL2}, box=(16, 60, 48, 96)); p = replace(p, {(61, 25, 80): PL, (84, 40, 108): PL2}, box=(80, 60, 112, 96))
for box in ((18, 62, 46, 94), (82, 62, 110, 94)):
    p = inner_ink(p, box, PL)
k = replace(k, {(118, 78, 153): PL, (97, 62, 142): PL}, box=(32, 58, 52, 82)); k = inner_ink(k, (32, 58, 52, 82), PL)
for a, wings in ((b, (LW, RW)), (k, (LW, RW)), (p, (((44, 68), [(20, 72), (24, 84), (32, 92)]), ((84, 68), [(106, 72), (102, 84), (94, 92)])))):
    for anchor, tips in wings:
        fan_ribs(a, anchor, tips, PL3, {PL, PL2})
relight(k, (67, 43, 101), PL3, PL2, depth=4)                                         # back: shadow down the far side
for a in (b, p, k):
    relight(a, PL, PL3, PL2, box=(0, 0, 128, 128), depth=2)
p = mode_filter(p, protect=[(0, 0, 128, 66), (0, 98, 128, 128)], need=4)             # belly speckle
for v, a in (('base', b), ('pose', p), ('back', k)):
    save(a, f'study/batnap/batnap-{v}-1x.png', f'study/batnap/batnap-{v}.png')
