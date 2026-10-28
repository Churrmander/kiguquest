import sys; sys.path.insert(0, '.')
from pixedit import *
picks = {'base': 'out/m-stalaghost-base-s216_00001_-px.png', 'pose': 'out/m-stalaghost-pose-s234_00001_-px.png', 'back': 'out/m-stalaghost-back-s232_00001_-px.png'}
out = {}
for v, f in picks.items():
    a = drop_floating(load(f), keep_min=150)
    a = unspeckle(a, protect=[(44, 20, 86, 56)] if v != 'back' else [], passes=1)
    out[v] = reoutline(a)
for v, a in out.items():
    save(a, f'study/stalaghost/stalaghost-{v}-1x.png', f'study/stalaghost/stalaghost-{v}.png')

# master-front round fixes
b = load('study/stalaghost/stalaghost-base-1x.png'); p = load('study/stalaghost/stalaghost-pose-1x.png'); k = load('study/stalaghost/stalaghost-back-1x.png')
CAPE = [(240, 233, 217), (206, 222, 216), (142, 162, 168), (132, 125, 131)]
skin = cols_where(p, (34, 68, 58, 87), lambda h, s, v: h < 40 and s > 0.25)
p = nearest(p, CAPE, box=(34, 68, 58, 87), only=skin) if skin else p                 # tangled thigh -> cape
for y in range(42, 50):                                                              # stray dark line
    for x in range(74, 97):
        if tuple(p[y, x]) == INK and not is_col(p[y - 1:y + 2, x - 1:x + 2], WHITE).any():
            p[y, x] = p[y - 2, x]
k = replace(k, {(244, 220, 207): (131, 133, 144), (148, 128, 109): (88, 87, 86)}, box=(66, 100, 80, 122))   # bare leg -> grey boot
red = cols_where(b, (52, 95, 76, 110), lambda h, s, v: h < 25 and s > 0.35)
b = nearest(b, [(131, 133, 144), (88, 87, 86)], box=(52, 95, 76, 110), only=red) if red else b
for v, a in (('base', b), ('pose', p), ('back', k)):
    save(a, f'study/stalaghost/stalaghost-{v}-1x.png', f'study/stalaghost/stalaghost-{v}.png')
