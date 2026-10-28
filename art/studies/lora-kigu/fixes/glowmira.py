import sys; sys.path.insert(0, '.')
from pixedit import *
picks = {'base': 'out/m-glowmira-base-s215_00001_-px.png', 'pose': 'out/m-glowmira-pose-s231_00001_-px.png', 'back': 'out/m-glowmira-back-s232_00001_-px.png'}
out = {}
for v, f in picks.items():
    a = drop_floating(load(f), keep_min=150)
    a = unspeckle(a, protect=[(44, 20, 86, 56)] if v != 'back' else [], passes=1)
    out[v] = reoutline(a)
for v, a in out.items():
    save(a, f'study/glowmira/glowmira-{v}-1x.png', f'study/glowmira/glowmira-{v}.png')

# critic batch round fixes
b = load('study/glowmira/glowmira-base-1x.png'); p = load('study/glowmira/glowmira-pose-1x.png'); k = load('study/glowmira/glowmira-back-1x.png')
Y, L, Wt = (225, 231, 26), (237, 243, 98), (250, 250, 250)
for bx in ((42, 8, 51, 17), (75, 8, 84, 17)):                                        # antenna bulbs glow yellow like Glowgrub's
    b = replace(b, {(250, 250, 250): Y, (247, 223, 112): L, (250, 223, 185): L}, box=bx)
stars(b, [(46, 112), (55, 115), (64, 111), (73, 115), (82, 112)], on={(200, 250, 211), (96, 191, 139), (159, 224, 144)})
p = replace(p, {(192, 167, 156): (227, 221, 222), (123, 134, 156): (186, 194, 191)}, box=(70, 44, 92, 80))   # beige hair -> white
olive = cols_where(p, (26, 86, 40, 110), lambda h, s, v: 40 < h < 110 and s > 0.2)
p = nearest(p, [(200, 250, 211), (96, 191, 139), (37, 48, 105)], box=(26, 86, 40, 110), only=olive) if olive else p
pinkish = cols_where(k, (38, 26, 68, 79), lambda h, s, v: (h < 40 or h > 330) and v > 0.55)
k = nearest(k, [(250, 250, 250), (227, 221, 222), (182, 181, 182), (163, 154, 155)], box=(38, 26, 68, 79), only=pinkish) if pinkish else k
k = mode_filter(k, protect=[(0, 0, 128, 26), (0, 79, 128, 128), (68, 0, 128, 128)], need=5)
for v, a in (('base', b), ('pose', p), ('back', k)):
    save(a, f'study/glowmira/glowmira-{v}-1x.png', f'study/glowmira/glowmira-{v}.png')
