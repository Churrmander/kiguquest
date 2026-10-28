import sys; sys.path.insert(0, '.')
from pixedit import *
picks = {'base': 'out/nc2-base-s94_00001_-px.png', 'pose': 'out/nc3-pose-s132_00001_-px.png', 'back': 'out/nc3-back-s132_00001_-px.png'}
for v, f in picks.items():
    a = drop_floating(load(f), keep_min=150)
    a = unspeckle(a, protect=[(44, 20, 86, 52)] if v != 'back' else [], passes=1)
    a = reoutline(a)
    save(a, f'study/noctura/noctura-{v}-1x.png', f'study/noctura/noctura-{v}.png')
