# fit t1 and t3 scales so the cap's widest row matches t2's in the finished 1x frames
import subprocess, os, sys
from PIL import Image
import numpy as np
d, h = sys.argv[1], sys.argv[2]
def capw(k):
    a = np.array(Image.open(f'{d}/{h}-torso-{k}.png').convert('RGBA')).astype(int)
    r, g, b, al = a[..., 0], a[..., 1], a[..., 2], a[..., 3] > 0
    cap = al & ((r > 150) & (g < 95) & (b < 95) if h == 'dahlia' else (abs(r - g) < 18) & (abs(g - b) < 18) & (r > 40) & (r < 125))
    cap[a.shape[0] // 3:] = False
    return int(cap.sum(1).max())
sc = {'t1': 1.0, 't3': 1.0}
for it in range(5):
    env = {**os.environ, 'T1SCALE': str(sc['t1']), 'T3SCALE': str(sc['t3'])}
    subprocess.run([sys.executable, f'{d}/bwthrow.py', d, h], env=env, check=True, capture_output=True)
    w = {k: capw(k) for k in ('t1', 't2', 't3')}; print(h, {k: round(v, 3) for k, v in sc.items()}, w)
    if all(abs(w['t2'] - w[k]) <= 1 for k in ('t1', 't3')): break
    for k in ('t1', 't3'): sc[k] *= w['t2'] / max(1, w[k])
print('final', sc)
