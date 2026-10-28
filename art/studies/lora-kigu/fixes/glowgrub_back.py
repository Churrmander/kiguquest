import sys; sys.path.insert(0, '.')
from pixedit import *
base = load('study/glowgrub/glowgrub-base-1x.png')
a = load('out/gg4-back-s66_00001_-px.png')
MINT, MINT2, MINT3 = (142, 215, 163), (104, 199, 134), (189, 234, 160)
for box in ((95, 34, 101, 43), (100, 41, 108, 47), (100, 53, 108, 59), (81, 8, 88, 16), (60, 7, 69, 15)):  # sparks, old antenna tips
    rect(a, *box, WHITE)
a = replace(a, {(244, 189, 136): MINT, (195, 130, 83): MINT2}, box=(88, 48, 101, 60))       # bare hand -> mitt
stripe = {(250, 249, 177): MINT, (240, 239, 127): MINT, (250, 246, 81): MINT, (218, 209, 75): MINT2, (246, 241, 33): MINT}
a = replace(a, stripe, box=(60, 54, 86, 68)); a = replace(a, stripe, box=(66, 82, 92, 98))   # front belly colour leaking onto the back
a = replace(a, {(164, 224, 166): (40, 188, 107), (122, 198, 146): (48, 143, 58), (118, 187, 106): (48, 143, 58), (83, 179, 123): (48, 143, 58),
                (96, 142, 108): (9, 88, 44), (51, 138, 95): (9, 88, 44), (61, 92, 71): (9, 88, 44), (24, 86, 83): (9, 88, 44), (17, 125, 71): (9, 88, 44)},
            box=(22, 69, 51, 101))
a = replace(a, {(164, 224, 166): (40, 188, 107), (122, 198, 146): (48, 143, 58), (118, 187, 106): (48, 143, 58), (83, 179, 123): (48, 143, 58),
                (96, 142, 108): (9, 88, 44), (51, 138, 95): (9, 88, 44), (61, 92, 71): (9, 88, 44)}, box=(24, 64, 42, 70))                                                          # tail in the base's darker greens
a = replace(a, {(164, 224, 166): MINT, (122, 198, 146): MINT2, (83, 179, 123): MINT2, (118, 187, 106): MINT2})
a = nearest(a, palette(base))
a = nearest(a, [(94, 134, 107), (56, 94, 74)], box=(54, 110, 92, 123))                       # boots in the base's 2 greens
a = unspeckle(a, protect=[(22, 56, 40, 72)])
a = reoutline(a)
a = replace(a, {(142, 215, 163): (40, 188, 107), (104, 199, 134): (48, 143, 58)}, box=(36, 84, 52, 100))  # tail root
a = relight(a, (142, 215, 163), (104, 199, 134), (189, 234, 160), box=(52, 14, 104, 112))
rect(a, 50, 0, 96, 17, WHITE)                                          # old antennae
L = {17: 65, 18: 61, 19: 59, 20: 58, 21: 57, 22: 56, 23: 56, 24: 55, 25: 55}
R = {17: 76, 18: 78, 19: 80, 20: 82, 21: 83, 22: 84, 23: 85, 24: 86, 25: 87}
dome(a, L, R, (142, 215, 163), kill={(94, 134, 107), (56, 94, 74), (9, 88, 44), (48, 143, 58), (225, 231, 26), (237, 243, 98), (250, 250, 250)})
a = reoutline(a)
a = inner_ink(a, (52, 17, 92, 27), (142, 215, 163))
a = relight(a, (142, 215, 163), (104, 199, 134), (189, 234, 160), box=(50, 16, 92, 30), depth=2)
for x, y in ((59, 61), (74, 65), (65, 90), (65, 91), (65, 92), (65, 93), (76, 93), (95, 65)):
    if not is_col(a[y - 1:y + 2, x - 1:x + 2], WHITE).any():
        a[y, x] = (142, 215, 163)
a = replace(a, {(94, 134, 107): (56, 94, 74)}, box=(54, 110, 92, 123))
a = relight(a, (56, 94, 74), (56, 94, 74), (94, 134, 107), box=(54, 110, 92, 123))
TAILC = {(40, 188, 107), (48, 143, 58)}
for y in (73, 78, 83):
    for x in range(22, 42):
        if tuple(a[y, x]) in TAILC: a[y, x] = (9, 88, 44)
for x in (40, 46):
    for y in range(84, 102):
        if tuple(a[y, x]) in TAILC: a[y, x] = (9, 88, 44)
for x, y in ((64, 90), (77, 93), (93, 65), (94, 65), (93, 66), (94, 66), (94, 67), (60, 61), (74, 65), (59, 61), (75, 65)):
    if not is_col(a[y - 1:y + 2, x - 1:x + 2], WHITE).any() and tuple(a[y, x]) != (142, 215, 163):
        a[y, x] = (142, 215, 163) if x > 52 else a[y, x]
put(a, [(52, y) for y in range(89, 99)], INK)                         # tail root sits on the suit, outlined
put(a, [(95, 51), (95, 52), (95, 53), (95, 54)], INK)                 # thumb
antenna4(a, 66, 17, 2)
antenna4(a, 79, 19, 2)
save(a, 'study/glowgrub/glowgrub-back-1x.png', 'study/glowgrub/glowgrub-back.png')

# the tail root sat on her hip edge; carry it in to the middle of her seat so it comes from the tailbone
k = load('study/glowgrub/glowgrub-back-1x.png')
for y in range(89, 99):
    for x in range(52, 61):
        k[y, x] = (40, 188, 107) if y < 95 else (48, 143, 58)
for x in range(52, 61):
    k[88, x] = INK; k[99, x] = INK
for y in range(90, 98):
    k[y, 61] = INK
k[89, 61] = INK; k[98, 61] = INK
for y in range(89, 99):
    k[y, 56] = (9, 88, 44)                                                              # one more segment seam
save(k, 'study/glowgrub/glowgrub-back-1x.png', 'study/glowgrub/glowgrub-back.png')
