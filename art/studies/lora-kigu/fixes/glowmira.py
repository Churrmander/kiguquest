import sys; sys.path.insert(0, '.')
from pixedit import *
picks = {'base': 'out/gm3-base-s101_00001_-px.png', 'pose': 'out/gm4-pose-s122_00001_-px.png', 'back': 'out/gm4-back-s122_00001_-px.png'}
for v, f in picks.items():
    a = drop_floating(load(f), keep_min=150)
    a = requantize(a, 16)
    a = mode_filter(a, protect=[(44, 18, 86, 48)] if v != 'back' else [], need=4, passes=2)
    a = unspeckle(a, protect=[(40, 14, 90, 50)] if v != 'back' else [], passes=2)
    a = reoutline(a)
    save(a, f'study/glowmira/glowmira-{v}-1x.png', f'study/glowmira/glowmira-{v}.png')
