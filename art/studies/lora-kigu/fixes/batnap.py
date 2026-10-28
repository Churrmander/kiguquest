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
    for y in range(y0, y1):                                                          # lighter membrane lines every 4 px
        for x in range(x0, x1):
            if tuple(b[y, x]) == PL and (x - x0) % 5 == 2:
                b[y, x] = PL2
wing = b.copy()                                                                      # back: the front's spread wings, behind the body
for y in range(60, 108):
    for x in list(range(16, 56)) + list(range(80, 112)):
        if tuple(k[y, x]) == WHITE and tuple(wing[y, x]) != WHITE and tuple(wing[y, x]) not in cols_where(b, (0, 0, 128, 128), lambda h, s, v: h < 40 and s > 0.15):
            k[y, x] = wing[y, x]
k = reoutline(k)
k = replace(k, {(118, 78, 153): (67, 43, 101), (97, 62, 142): (80, 50, 121)}, box=(56, 60, 82, 92))   # lilac patch on the back -> plum
for a in (b, p, k):
    relight(a, PL, PL3, PL2, box=(0, 0, 128, 128), depth=2)
p = mode_filter(p, protect=[(0, 0, 128, 66), (0, 98, 128, 128)], need=4)             # belly speckle
for v, a in (('base', b), ('pose', p), ('back', k)):
    save(a, f'study/batnap/batnap-{v}-1x.png', f'study/batnap/batnap-{v}.png')
