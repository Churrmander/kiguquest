import sys; sys.path.insert(0, '.')
from pixedit import *
base = load('study/glowgrub/glowgrub-base-1x.png')
a = load('out/gg4-pose-s61_00001_-px.png')
CREAM, CREAM2 = (246, 236, 196), (222, 206, 160)
belly = (40, 60, 62, 93)
a = replace(a, {(205, 228, 144): CREAM, (165, 214, 105): CREAM, (125, 190, 83): CREAM2, (232, 250, 119): CREAM, (162, 219, 151): CREAM,
                (49, 166, 73): CREAM2, (82, 198, 96): CREAM2, (45, 187, 28): CREAM2, (21, 125, 34): CREAM2, (10, 95, 2): CREAM2}, box=(44, 62, 58, 91))
a = replace(a, {(205, 228, 144): CREAM, (165, 214, 105): CREAM, (125, 190, 83): CREAM2, (232, 250, 119): CREAM}, box=belly)
a = replace(a, {(250, 250, 181): (225, 231, 26), (232, 250, 119): (237, 243, 98)})      # bulbs: the base's yellow
a = rect(a, 94, 36, 108, 55, WHITE)                                                    # the detached second bulb
a = replace(a, {(44, 52, 50): (116, 194, 142)}, box=(40, 55, 60, 66))                  # collar button
a = replace(a, {(250, 204, 162): (116, 194, 142), (226, 176, 128): (74, 123, 86)}, box=(72, 60, 84, 76))  # skin on the mitt
a = replace(a, {(116, 194, 142): (142, 215, 163), (102, 155, 113): (104, 199, 134), (74, 123, 86): (104, 199, 134)})  # suit tones = base
face = (30, 26, 74, 56)
pal = palette(base)
keep = a.copy()
a = nearest(a, pal)
import colorsys
for y in range(face[1], face[3]):                                                      # face keeps its own skin, hair and eyes
    for x in range(face[0], face[2]):
        h, s_, v = colorsys.rgb_to_hsv(*(keep[y, x] / 255))
        if h * 360 < 50 or s_ < 0.2:
            a[y, x] = keep[y, x]
a = unspeckle(a, protect=[(32, 36, 66, 54)])
a = reoutline(a)
put(a, [(97, 58), (98, 58), (97, 59)], (237, 243, 98)); put(a, [(98, 59)], (250, 250, 250))  # glint on the tail bulb
rect(a, 26, 4, 76, 17, WHITE)                                          # old antennae
L = {17: 44, 18: 42, 19: 41, 20: 40, 21: 39, 22: 38, 23: 37}
R = {17: 58, 18: 60, 19: 62, 20: 63, 21: 64, 22: 65, 23: 67}
dome(a, L, R, (142, 215, 163), kill={(56, 94, 74), (48, 143, 58), (9, 88, 44), (225, 231, 26), (44, 52, 50), (237, 243, 98), (250, 250, 250)})
a = reoutline(a)
a = inner_ink(a, (34, 17, 72, 24), (142, 215, 163))
a = relight(a, (142, 215, 163), (104, 199, 134), (189, 234, 160), box=(30, 16, 76, 26), depth=2)
eyes = a[38:46, 38:62].copy()
a = replace(a, {(44, 52, 50): (80, 63, 30), (132, 128, 133): (119, 75, 49), (161, 175, 164): (119, 75, 49)}, box=(33, 24, 64, 48))  # slate specks -> hair browns
a[38:46, 38:62] = eyes
a = replace(a, {(222, 206, 160): (246, 236, 196)}, box=(46, 62, 54, 92))   # zip stripe
a = replace(a, {(56, 94, 74): (48, 143, 58), (44, 52, 50): (48, 143, 58), (80, 63, 30): (48, 143, 58), (96, 180, 88): (104, 199, 134)}, box=(58, 64, 77, 79))
import colorsys
HAIR = [(119, 75, 49), (80, 63, 30), (58, 40, 16)]
for y in range(24, 48):
    for x in range(33, 66):
        if 38 <= y < 46 and (38 <= x < 46 or 54 <= x < 62):
            continue
        c = tuple(int(v) for v in a[y, x])
        if c in (INK, WHITE) or c in HAIR: continue
        h, s_, v = colorsys.rgb_to_hsv(*(np.array(c) / 255))
        if (60 < h * 360 < 240 or s_ < 0.15) and v < 0.75:
            a[y, x] = min(HAIR, key=lambda q: sum((np.array(q) - c) ** 2))
a = replace(a, {(222, 206, 160): (246, 236, 196), (174, 121, 78): (246, 236, 196), (226, 176, 128): (246, 236, 196)}, box=(43, 62, 48, 71))
a = unspeckle(a, protect=[(0, 0, 128, 58), (0, 80, 128, 128), (0, 0, 60, 128)], passes=2)  # right forearm only
put(a, [(98, 59)], (237, 243, 98)); put(a, [(78, 77)], (142, 215, 163)) if tuple(a[77, 78]) != INK else None
antenna4(a, 43, 18, 2)
antenna4(a, 59, 18, 2)
save(a, 'study/glowgrub/glowgrub-pose-1x.png', 'study/glowgrub/glowgrub-pose.png')
