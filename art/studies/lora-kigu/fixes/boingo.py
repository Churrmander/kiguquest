import sys; sys.path.insert(0, '.')
from pixedit import *
picks = {'base': 'out/bo2-base-s182_00001_-px.png', 'pose': 'out/bo3-pose-s191_00001_-px.png', 'back': 'out/bo4-back-s221_00001_-px.png'}
out = {}
for v, f in picks.items():
    a = drop_floating(load(f), keep_min=150)
    a = unspeckle(a, protect=[(44, 20, 86, 56)] if v != 'back' else [], passes=1)
    out[v] = a
OR, OR2, OR3, DK = (245, 115, 2), (250, 140, 73), (213, 100, 37), (132, 37, 1)
SUIT = {OR, OR2, OR3}


def coils(a, box, y0, suit=SUIT):
    """Regular coil bands: 2 dark rows every 4 on the suit oranges."""
    x0, _, x1, y1 = box
    for y in range(y0, y1):
        if (y - y0) % 4 < 2:
            for x in range(x0, x1):
                if tuple(int(c) for c in a[y, x]) in suit:
                    a[y, x] = DK if (y - y0) % 4 == 0 else (199, 62, 1)
    return a


b = out['base']
b = replace(b, {(250, 250, 250): OR, (224, 219, 228): OR2}, box=(58, 33, 72, 43))   # the ringed curl that read as a third eye
b = mode_filter(b, protect=[(44, 40, 86, 62)], need=5, passes=1)
coils(b, (44, 70, 86, 118), 72)
out['base'] = b
p = out['pose']
p = replace(p, {(174, 186, 191): (250, 250, 250), (152, 153, 150): (224, 219, 228)}, box=(40, 12, 92, 46))   # hood = base white
p = mode_filter(p, protect=[(0, 0, 128, 94)], need=5, passes=1)                      # mottled legs
coils(p, (48, 70, 82, 96), 72, SUIT | {(241, 133, 8), (249, 163, 45)})
out['pose'] = p
coils(out['back'], (40, 66, 90, 118), 68)
for v, a in out.items():
    a = reoutline(a)
    save(a, f'study/boingo/boingo-{v}-1x.png', f'study/boingo/boingo-{v}.png')
