import sys; sys.path.insert(0, '.')
from pixedit import *
a = load('out/gg3-base-d80-s53_00001_-px.png')
a = replace(a, {(212, 213, 215): (246, 236, 196), (166, 168, 173): (222, 206, 160)})  # grey belly -> cream
a = unspeckle(a, protect=[(38, 30, 66, 48), (84, 44, 97, 58)])
TAIL = [(40, 188, 107), (48, 143, 58), (9, 88, 44)]
MINT = [(189, 234, 160), (142, 215, 163), (104, 199, 134)]
a = nearest(a, TAIL, box=(72, 60, 96, 95))           # tail: drop the brown/grey Stingle leftovers
a = nearest(a, MINT, box=(66, 50, 78, 60))           # yellow speck on the right shoulder
a = nearest(a, [(94, 134, 107), (56, 94, 74)], box=(36, 108, 50, 121))   # boots in 2 greens
a = nearest(a, [(94, 134, 107), (56, 94, 74)], box=(56, 108, 72, 122))
a = nearest(a, [(9, 88, 44), (48, 143, 58)], box=(34, 9, 44, 19))        # antenna sockets: no amber
a = nearest(a, [(9, 88, 44), (48, 143, 58)], box=(58, 8, 70, 19))
rect(a, 30, 0, 75, 10, WHITE)                                         # old antennae
L = {10: 46, 11: 44, 12: 42, 13: 41, 14: 40, 15: 39, 16: 39, 17: 38, 18: 38, 19: 37, 20: 37}
R = {10: 57, 11: 60, 12: 62, 13: 64, 14: 65, 15: 66, 16: 67, 17: 68, 18: 69, 19: 70, 20: 71}
dome(a, L, R, (142, 215, 163), kill={(9, 88, 44), (48, 143, 58), (56, 94, 74), (40, 188, 107), (94, 134, 107)})
a = reoutline(a)
a = inner_ink(a, (34, 11, 74, 22), (142, 215, 163))
a = replace(a, {(189, 234, 160): (142, 215, 163)}, box=(60, 18, 76, 52))   # highlight belongs on the left, not the right
a = unspeckle(a, protect=[(38, 30, 66, 48), (84, 44, 97, 58)], passes=1)
a = relight(a, (142, 215, 163), (104, 199, 134), (189, 234, 160), box=(30, 10, 80, 30), depth=2)
antenna4(a, 44, 11, 2)
antenna4(a, 59, 11, 2)
a = nearest(a, [(94, 134, 107), (56, 94, 74)], box=(36, 110, 50, 121)); a = unspeckle(a, protect=[(0, 0, 128, 110)], passes=2)
a = replace(a, {(9, 88, 44): (104, 199, 134), (56, 94, 74): (104, 199, 134), (48, 143, 58): (104, 199, 134)}, box=(71, 62, 77, 68))
a = replace(a, {(141, 106, 59): (225, 231, 26), (193, 170, 76): (225, 231, 26), (165, 123, 97): (225, 231, 26)}, box=(84, 56, 92, 64))
a = shift(a, dy=3)
save(a, 'study/glowgrub/glowgrub-base-1x.png', 'study/glowgrub/glowgrub-base.png')
