import sys; sys.path.insert(0, '.')
from pixedit import *
picks = {'base': 'out/dp5-base-s201_00001_-px.png', 'pose': 'out/dp3-pose-s154_00001_-px.png', 'back': 'out/dp5-back-s201_00001_-px.png'}
out = {}
for v, f in picks.items():
    a = drop_floating(load(f), keep_min=150)
    a = unspeckle(a, protect=[(44, 20, 86, 52)] if v != 'back' else [], passes=1)
    out[v] = a
pal = palette(out['base'])
face = (40, 24, 90, 60)
keep = out['pose'].copy()
out['pose'] = nearest(out['pose'], pal)
import colorsys
for y in range(face[1], face[3]):                                 # pose keeps its own skin and hair
    for x in range(face[0], face[2]):
        h, s_, v_ = colorsys.rgb_to_hsv(*(keep[y, x] / 255))
        if s_ > 0.25 and h * 360 < 50:
            out['pose'][y, x] = keep[y, x]
for v in out:
    out[v] = reoutline(out[v])

save_all = [(v, a) for v, a in out.items()]
for v, a in save_all:
    save(a, f'study/dripstone/dripstone-{v}-1x.png', f'study/dripstone/dripstone-{v}.png')

# critic round 2 fixes: stalactite points on the brim, vertical drip stripes, one hood colour
b = load('study/dripstone/dripstone-base-1x.png'); p = load('study/dripstone/dripstone-pose-1x.png'); k = load('study/dripstone/dripstone-back-1x.png')
S1, S2, S3 = (165, 164, 158), (141, 147, 148), (110, 106, 105)
from collections import Counter
hairc = Counter(tuple(int(v) for v in b[y, x]) for y in range(35, 42) for x in range(46, 76) if tuple(b[y, x]) not in (INK, WHITE) and int(b[y, x].astype(int).sum()) < 200).most_common(1)[0][0]
for y in range(31, 34):                                            # the old goggle-like zigzag under the brim
    for x in range(44, 79):
        if tuple(b[y, x]) == INK or int(b[y, x].astype(int).sum()) < 200:
            b[y, x] = hairc
stone_points(b, (50, 61, 71), 31, S2, S3, length=5, glint=S1, outline=False)
drip_stripes(b, [(45, 66, 86), (54, 68, 92), (66, 66, 84), (76, 68, 90)], {S2, (120, 122, 127), S1}, (89, 89, 99), width=2)
p = replace(p, {(179, 181, 180): S2, (202, 201, 196): S1}, box=(30, 8, 100, 66))
drip_stripes(p, [(48, 64, 82), (56, 66, 88), (72, 64, 84), (78, 66, 80)], {S2, (179, 181, 180), (120, 122, 127)}, S3, width=2)
p = mode_filter(p, protect=[(0, 36, 128, 128)], need=4, passes=2)   # calm the hood top
k = replace(k, {(143, 145, 139): (129, 127, 125)}, box=(40, 38, 98, 54))
for y in range(47, 51):                                            # light row under the back brim
    for x in range(46, 92):
        if sum(int(v) for v in k[y, x]) > 360 and tuple(k[y, x]) != WHITE:
            k[y, x] = (63, 62, 54)
for x, n in ((47, 3), (55, 5), (64, 4), (73, 5), (83, 3)):
    stone_points(k, (x,), 49, (143, 145, 139), (109, 110, 108), length=n, outline=False)
drip_stripes(k, [(52, 62, 84), (64, 64, 92), (73, 62, 86), (81, 64, 84)], {(129, 127, 125), (143, 145, 139), (109, 110, 108)}, (81, 74, 73), width=2)
for v, a in (('base', b), ('pose', p), ('back', k)):
    save(a, f'study/dripstone/dripstone-{v}-1x.png', f'study/dripstone/dripstone-{v}.png')
