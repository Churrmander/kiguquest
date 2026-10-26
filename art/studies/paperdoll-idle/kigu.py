"""Idle rigs for the prototype: parts (polygons in battle-sprite px) and 24-frame keyframe tables. Every table is 0 on
frame 0, so frame 0 is exactly the approved sprite."""
import sys, math
sys.path.insert(0, '/tmp/claude-0/pd/tools')
from rig import Rig
from PIL import Image
D = '/tmp/claude-0/pd/'
N = 24
BOB = [0] * 6 + [-1] * 12 + [0] * 6                     # body: up for half the loop
SWAY = [0, 0, 1, 1, 2, 2, 2, 2, 1, 1, 0, 0, 0, 0, -1, -1, -2, -2, -2, -2, -1, -1, 0, 0]
OPEN = [0, 0, 0, 0, 1, 1, 2, 2, 2, 2, 2, 2, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]   # fans open on the in-breath
FLICK = [0, 1, 2, 2, 1, 0, 0, -1, -2, -2, -1, 0] * 2
at = lambda tab, i, lag=0: tab[(i - lag) % N]
def twitch(i, start):
    k = (i - start) % N
    return [1, 1, 0.5][k] if k < 3 else 0
def bobber(i, ph, amp=1.4):  # floating wisps: a sine shifted so frame 0 sits at rest
    v = lambda j: round(amp * math.sin(2 * math.pi * j / N + ph))
    return v(i) - v(0)

def kyuubelle():
    body = [(28,0),(54,0),(56,22),(55,32),(58,44),(57,59),(51,61),(51,87),(24,87),(24,80),(26,79),(26,61),(21,59),(20,45),(25,35),(25,19),(27,19)]
    r = Rig(Image.open(D + 'kyuubelle-front.png'))
    wisp = lambda n, box, comp='floater': r.part(n, [box], z=5, comp=comp)
    wisp('w1', [(10,5),(24,5),(24,22),(10,22)]); wisp('w2', [(58,5),(70,5),(70,22),(58,22)])
    wisp('w3', [(0,62),(12,62),(12,80),(0,80)]); wisp('w4', [(52,77),(61,77),(61,86),(52,86)], comp=None)
    r.part('earL', [[(28,0),(37,0),(37,10),(28,10)]], z=3, pivot=(33, 11), parent='upper', comp='main')
    r.part('lower', [[(p[0], p[1]) for p in body if p[1] >= 59] + [(21,59),(57,59)]], z=1, comp='main')
    r.part('upper', [body], z=2, pivot=(39, 58), comp='main', fill=('lower', [[(0,55),(96,55),(96,59),(0,59)]]))
    side = lambda x0, x1, y0, y1: [[(x0,y0),(x1,y0),(x1,y1),(x0,y1)]]
    # three tail groups per fan; the middle group sits behind and runs on under its neighbours, so no seam opens
    r.part('L1', side(0, 39, 0, 49), z=0.5, pivot=(36, 56), comp='main', extend=[body])
    r.part('L3', side(0, 39, 61, 96), z=0.5, pivot=(36, 56), comp='main', extend=[body])
    r.part('L2', side(0, 39, 49, 61), z=0, pivot=(36, 56), comp='main', extend=[body] + side(0, 39, 40, 70))
    r.part('R1', side(39, 96, 0, 50), z=0.5, pivot=(42, 56), comp='main', extend=[body])
    r.part('R3', side(39, 96, 60, 96), z=0.5, pivot=(42, 56), comp='main', extend=[body])
    r.part('R2', side(39, 96, 50, 60), z=0, pivot=(42, 56), comp='main', extend=[body] + side(39, 96, 41, 69))
    r.build()
    frames = []
    for i in range(N):
        pose = {'upper': (0, BOB[i], 0), 'earL': (0, 0, -8 * twitch(i, 13))}
        for k, (lag, sgn) in {'L1': (0, -1), 'L2': (1, -1), 'L3': (2, -1), 'R1': (0, 1), 'R2': (1, 1), 'R3': (2, 1)}.items():
            pose[k] = (0, 0, sgn * 1.25 * at(OPEN, i, lag))
        for k, ph in zip(['w1', 'w2', 'w3', 'w4'], [0.5, 2.1, 4.2, 1.0]):
            pose[k] = (0, bobber(i, ph), 0)
        pose['w2'] = (0, min(0, pose['w2'][1]), 0)  # keep air between it and the tail tip below
        frames.append(r.frame(pose))
    return r, frames

def konko():
    r = Rig(Image.open(D + 'konko-front.png'))
    r.part('flame', [[(31,20),(44,20),(44,42),(31,42)]], z=1, pivot=(37, 42), parent='tail')
    r.part('tail', [[(26,38),(44,38),(44,56),(26,56)], [(24,44),(27,44),(27,55),(24,55)]], z=0, pivot=(25, 48), comp='main',
           extend=[[(18,42),(26,42),(26,55),(18,55)], [(31,36),(44,36),(44,42),(31,42)]])
    r.part('earR', [[(18,0),(26,0),(26,7),(18,7)]], z=4, pivot=(21, 8), parent='upper', comp='main', fill=('upper', [[(18,5),(26,5),(26,8),(18,8)]]))
    r.part('earL', [[(2,0),(10,0),(10,7),(2,7)]], z=4, pivot=(7, 8), parent='upper', comp='main', fill=('upper', [[(2,5),(10,5),(10,8),(2,8)]]))
    r.part('lower', [[(0,46),(44,46),(44,67),(0,67)]], z=2, comp='main')
    r.part('upper', None, z=3, pivot=(14, 46), fill=('lower', [[(0,43),(44,43),(44,46),(0,46)]]))
    r.build()
    frames = []
    for i in range(N):
        pose = {'upper': (0, BOB[i], 0), 'tail': (0, 0, -2 * at(SWAY, i)), 'flame': (0, 0, -1.5 * at(SWAY, i, 2)),
                'earR': (0, 0, 10 * twitch(i, 9)), 'earL': (0, 0, -10 * twitch(i, 20))}
        frames.append(r.frame(pose))
    return r, frames

def jerbi():
    r = Rig(Image.open(D + 'jerbi-front.png'))
    r.part('tuft', [[(31,43),(38,43),(38,55),(31,55)]], z=1, pivot=(33, 44), parent='tail', comp='main')
    r.part('tail', [[(24,38),(38,38),(38,46),(24,46)]], z=0, pivot=(23, 43), comp='main',
           extend=[[(19,40),(24,40),(24,46),(19,46)], [(31,43),(38,43),(38,48),(31,48)]])
    r.part('earL', [[(0,0),(9,0),(9,9),(7,13),(0,13)]], z=4, pivot=(5, 13), parent='upper', comp='main', fill=('upper', [[(0,9),(10,9),(10,14),(0,14)]]))
    r.part('earR', [[(21,0),(30,0),(30,13),(23,13),(21,9)]], z=4, pivot=(25, 13), parent='upper', comp='main', fill=('upper', [[(20,9),(30,9),(30,14),(20,14)]]))
    r.part('lower', [[(0,40),(38,40),(38,60),(0,60)]], z=2, comp='main')
    r.part('upper', None, z=3, pivot=(14, 40), fill=('lower', [[(0,37),(38,37),(38,40),(0,40)]]))
    r.build()
    frames = []
    for i in range(N):
        pose = {'upper': (0, BOB[i], 0), 'tail': (0, 0, 1.5 * at(FLICK, i)),
                'tuft': (0, 0, 0), 'earL': (0, 0, -7 * twitch(i, 10)), 'earR': (0, 0, 7 * twitch(i, 11))}
        frames.append(r.frame(pose))
    return r, frames

KIGU = {'kyuubelle': kyuubelle, 'konko': konko, 'jerbi': jerbi}
