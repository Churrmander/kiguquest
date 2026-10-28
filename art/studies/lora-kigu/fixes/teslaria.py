import sys; sys.path.insert(0, '.')
from pixedit import *
picks = {'base': 'out/m-teslaria-base-s215_00001_-px.png', 'pose': 'out/m-teslaria-pose-s233_00001_-px.png', 'back': 'out/m-teslaria-back-s234_00001_-px.png'}
out = {}
for v, f in picks.items():
    a = drop_floating(load(f), keep_min=150)
    a = unspeckle(a, protect=[(44, 20, 86, 56)] if v != 'back' else [], passes=1)
    out[v] = reoutline(a)
for v, a in out.items():
    save(a, f'study/teslaria/teslaria-{v}-1x.png', f'study/teslaria/teslaria-{v}.png')
