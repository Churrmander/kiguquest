import sys; sys.path.insert(0, '.')
from pixedit import *
picks = {'base': 'out/sg2-base-s112_00001_-px.png', 'pose': 'out/sg2-pose-s115_00001_-px.png', 'back': 'out/sg2-back-s112_00001_-px.png'}
out = {}
for v, f in picks.items():
    a = drop_floating(load(f), keep_min=150)
    a = unspeckle(a, protect=[(44, 20, 86, 52)] if v != 'back' else [], passes=1)
    out[v] = a
WG = [(250, 250, 250), (220, 222, 230), (180, 184, 196), (130, 136, 150)]   # cape whites and greys
b = out['base']
hair = palette(b[30:60, 40:52].copy())
b = nearest(b, [c for c in palette(b[20:40, 44:56]) if abs(int(c[0]) - int(c[2])) < 30] or WG, box=(46, 50, 53, 57))   # orange specks at the face sides
b = nearest(b, [c for c in palette(b[20:40, 44:56]) if abs(int(c[0]) - int(c[2])) < 30] or WG, box=(72, 45, 80, 54))
pinks = [c for c in palette(b) if c[0] > c[1] + 25 and c[0] > c[2] + 10 and c[1] > 150]
b = nearest(b, WG, box=(40, 60, 90, 100), only=pinks) if pinks else b
out['base'] = b
p = out['pose']
pinks = [c for c in palette(p) if c[0] > c[1] + 25 and c[0] > c[2] + 10 and c[1] > 120]
p = nearest(p, WG, box=(50, 80, 70, 92), only=pinks) if pinks else p
greys = [c for c in palette(p[62:96, 36:42]) if abs(int(c[0]) - int(c[2])) < 25 and c != INK]
p = replace(p, {c: (170, 225, 245) for c in greys}, box=(36, 62, 42, 96))   # the grey staff becomes a pale crystal wand
skin = tuple(int(v) for v in p[44, 62])
p = skin_like(p, (50, 86, 74, 108), skin)
out['pose'] = p
for v, a in out.items():
    a = reoutline(a)
    out[v] = a
hem_drops(out['base'], (44, 49, 78, 83), max_y=106)
hem_drops(out['pose'], (39, 50, 84), max_y=104)
hem_drops(out['back'], (42, 50, 80), max_y=104)
for v, a in out.items():
    save(a, f'study/stalaghost/stalaghost-{v}-1x.png', f'study/stalaghost/stalaghost-{v}.png')
