import sys; sys.path.insert(0, '.')
from pixedit import *
picks = {'base': 'out/bo2-base-s182_00001_-px.png', 'pose': 'out/bo3-pose-s191_00001_-px.png', 'back': 'out/bo5-back-s276_00001_-px.png'}
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
for y in range(33, 42):                                              # open the curl's ring on the right into a C
    for x in range(66, 71):
        if tuple(b[y, x]) == INK and 35 <= y <= 40:
            b[y, x] = OR
HAIR3 = [OR, (199, 62, 1), DK]
b = replace(b, {(250, 250, 250): OR, (224, 219, 228): OR2, (250, 205, 138): OR2}, box=(42, 42, 52, 48)); b = replace(b, {(250, 250, 250): OR, (224, 219, 228): OR2, (250, 205, 138): OR2}, box=(78, 46, 88, 52))   # white specks in the hair
b = nearest(b, HAIR3, box=(38, 28, 92, 62), only=[(213, 100, 37), (250, 140, 73), (93, 52, 13), (245, 115, 2), (199, 62, 1), (132, 37, 1)])
coils(b, (44, 70, 86, 118), 72)
out['base'] = b
p = out['pose']
p = replace(p, {(174, 186, 191): (250, 250, 250), (152, 153, 150): (224, 219, 228)}, box=(40, 12, 92, 46))   # hood = base white
p = replace(p, {(58, 63, 60): (224, 219, 228)}, box=(44, 28, 58, 56))                 # hood inner side = white
for y in range(26, 50):                                              # stray outline arc off the hood's right edge
    for x in range(78, 94):
        if tuple(p[y, x]) == INK and not any(tuple(p[y + dy, x + dx]) not in (INK, WHITE) for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1))):
            p[y, x] = WHITE
p = nearest(p, [(241, 133, 8), (195, 145, 29), (139, 34, 3), (92, 56, 22)], box=(44, 94, 68, 122), only=[(126, 101, 13), (249, 163, 45), (195, 145, 29)])
p = replace(p, {(106, 124, 133): (224, 219, 228), (112, 96, 76): (224, 219, 228)}, box=(44, 34, 54, 56))   # hood inner side white
p = replace(p, {(195, 145, 29): (241, 133, 8), (250, 245, 159): (241, 133, 8), (216, 162, 79): (241, 133, 8), (245, 182, 126): (241, 133, 8), (198, 84, 5): (139, 34, 3)}, box=(44, 94, 68, 122))
p = mode_filter(p, protect=[(0, 0, 128, 94)], need=4, passes=2)                      # mottled legs
coils(p, (48, 70, 82, 96), 72, SUIT | {(241, 133, 8), (249, 163, 45)})
out['pose'] = p
k = out['back']
k = replace(k, {(193, 169, 160): (250, 250, 250), (139, 138, 136): (224, 219, 228), (95, 100, 102): (187, 200, 209)}, box=(44, 14, 86, 56))
k = replace(k, {c: (250, 250, 250) if sum(c) > 560 else (224, 219, 228) if sum(c) > 420 else (187, 200, 209) for c in cols_where(k, (44, 14, 86, 56), lambda h, s, v: s < 0.12 and v > 0.45)}, box=(44, 14, 86, 56))   # hood = base white
out['back'] = k
for v, a in out.items():
    a = reoutline(a)
    save(a, f'study/boingo/boingo-{v}-1x.png', f'study/boingo/boingo-{v}.png')
