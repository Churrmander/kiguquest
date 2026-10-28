import sys; sys.path.insert(0, '.')
from pixedit import *
picks = {'base': 'out/m-noctura-base-s212_00001_-px.png', 'pose': 'out/m-noctura-pose-s234_00001_-px.png', 'back': 'out/m-noctura-back-s231_00001_-px.png'}
out = {}
for v, f in picks.items():
    a = drop_floating(load(f), keep_min=150)
    a = unspeckle(a, protect=[(44, 20, 86, 56)] if v != 'back' else [], passes=1)
    out[v] = reoutline(a)
for v, a in out.items():
    save(a, f'study/noctura/noctura-{v}-1x.png', f'study/noctura/noctura-{v}.png')
