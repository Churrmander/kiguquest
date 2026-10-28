import sys; sys.path.insert(0, '.')
from pixedit import *
picks = {'base': 'out/m-stalaghost-base-s216_00001_-px.png', 'pose': 'out/m3-stalaghost-pose-s264_00001_-px.png', 'back': 'out/m-stalaghost-back-s232_00001_-px.png'}
out = {}
for v, f in picks.items():
    a = drop_floating(load(f), keep_min=150)
    a = unspeckle(a, protect=[(44, 20, 86, 56)] if v != 'back' else [], passes=1)
    out[v] = reoutline(a)
b, p, k = out['base'], out['pose'], out['back']
k = replace(k, {(244, 220, 207): (131, 133, 144), (148, 128, 109): (88, 87, 86)}, box=(66, 100, 80, 122))   # bare leg -> grey boot
red = cols_where(b, (52, 95, 76, 110), lambda h, s, v: h < 25 and s > 0.35)
b = nearest(b, [(131, 133, 144), (88, 87, 86)], box=(52, 95, 76, 110), only=red) if red else b
face = p[36:54, 54:76].copy()                                                          # hair and face share a beige: recolour hair outside the face box
p = replace(p, {(239, 215, 200): (214, 216, 222), (208, 189, 175): (178, 180, 190), (136, 118, 132): (128, 130, 142)}, box=(20, 10, 108, 80))
p[36:54, 54:76] = face
for v, a in (('base', b), ('pose', p), ('back', k)):
    save(a, f'study/stalaghost/stalaghost-{v}-1x.png', f'study/stalaghost/stalaghost-{v}.png')

# fresh-critic fixes on the pose: off-palette hands, bare thighs, the lost crystal crown
p = load('study/stalaghost/stalaghost-pose-1x.png')
SK = (239, 215, 200)
p = replace(p, {(158, 57, 44): (198, 151, 128), (212, 113, 82): SK, (250, 180, 153): SK}, box=(22, 30, 34, 42))
p = replace(p, {(212, 113, 82): SK, (198, 151, 128): SK}, box=(80, 54, 94, 68))
p = replace(p, {(239, 215, 200): (152, 154, 152), (208, 189, 175): (131, 133, 144), (198, 151, 128): (110, 112, 122)}, box=(46, 82, 66, 102))   # thighs -> boot greys
HAIRS = {(214, 216, 222), (178, 180, 190), (128, 130, 142), (103, 99, 111), (250, 250, 250)}
for x in range(50, 83):                                                                # silver headband
    if tuple(p[20, x]) in HAIRS:
        p[20, x] = (196, 204, 216)
for x, n in ((52, 3), (57, 4), (63, 3), (69, 4), (75, 3), (80, 2)):                   # icicle crystals hanging from it
    for i in range(n):
        if tuple(p[21 + i, x]) in HAIRS:
            p[21 + i, x] = (170, 225, 245) if i < n - 1 else (90, 180, 225)
save(p, 'study/stalaghost/stalaghost-pose-1x.png', 'study/stalaghost/stalaghost-pose.png')
