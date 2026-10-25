# iterate the t3 scale until its cap's widest row matches t2's in the finished 1x frames
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
s = 1.0
for it in range(6):
    subprocess.run([sys.executable, f'{d}/bwthrow.py', d, h], env={**os.environ, 'T3SCALE': str(s)}, check=True, capture_output=True)
    w2, w3 = capw('t2'), capw('t3'); print(h, 'scale', round(s, 3), 'cap t2', w2, 't3', w3)
    if abs(w2 - w3) <= 1: break
    s *= w2 / w3
