# Three torso frames for the throw rig (wind-up, upright, follow-through), arms removed so the rig's arm pieces drive them.
# usage: python torso.py <dir> <hero>
# reads <hero>-windup-small.png, <hero>-base-small.png, <hero>-throw-small.png (170x170 art pixels) and pieces/<hero>-*.png
# writes pieces/<hero>-torso1/2/3.png, <hero>-rig.json (torso frames + per-frame shoulder pivots), <hero>-throw-frames.png
import sys, json
from PIL import Image
import numpy as np

d, h = sys.argv[1], sys.argv[2]
CUT = {  # boxes (x0, y0, x1, y1) where arm pixels are removed; 'all' boxes drop everything (spool + thread trail)
  'draco': {'windup': [(38, 58, 76, 100), (93, 52, 125, 70)], 'windup_all': [(36, 82, 58, 104), (110, 55, 130, 70)],
            'upright': [(96, 40, 125, 101), (40, 42, 74, 79)],
            'follow': [(78, 30, 125, 58), (12, 60, 62, 90)], 'follow_all': [(105, 0, 170, 45), (10, 62, 33, 90)]},
  'dahlia': {'windup': [(38, 60, 72, 96), (92, 42, 132, 60)], 'windup_all': [(36, 74, 58, 96), (112, 40, 135, 58)],
             'upright': [(96, 46, 125, 99), (40, 48, 71, 76)],
             'follow': [(78, 36, 122, 58), (18, 70, 62, 92)], 'follow_all': [(108, 0, 170, 45), (15, 72, 36, 92)]},
}[h]
SHOULDER = {  # (throwing/right shoulder, left shoulder) per torso frame, art pixels
  'draco': {'windup': ((92, 60), (78, 60)), 'upright': ((98, 46), (74, 46)), 'follow': ((80, 50), (66, 56))},
  'dahlia': {'windup': ((90, 55), (72, 57)), 'upright': ((98, 49), (72, 49)), 'follow': ((82, 55), (70, 58))},
}[h]
SRC = {'windup': f'{h}-windup-small.png', 'upright': f'{h}-base-small.png', 'follow': f'{h}-throw-small.png'}

def armcut(name):
    s = np.array(Image.open(f'{d}/{SRC[name]}').convert('RGB')).astype(int)
    ink = s.min(-1) < 240
    r, g, b = s[..., 0], s[..., 1], s[..., 2]
    skin = (r > 170) & (r >= g) & (g >= b) & (r - b > 40) & (g > 110)
    light = (s.min(-1) > 195) | ((s.max(-1) - s.min(-1) < 28) & (s.min(-1) > 115))   # white sleeves and their grey shading
    dark = s.max(-1) < 70
    cut = np.zeros(ink.shape, bool)
    for x0, y0, x1, y1 in CUT[name]:
        box = np.zeros_like(cut); box[y0:y1, x0:x1] = True
        core = box & ink & (skin | light)
        pad = np.pad(core, 1); near = pad[:-2, 1:-1] | pad[2:, 1:-1] | pad[1:-1, :-2] | pad[1:-1, 2:]
        cut |= core | (box & ink & dark & near)
    inbox = np.zeros_like(cut)
    for x0, y0, x1, y1 in CUT[name]: inbox[y0:y1, x0:x1] = True
    for _ in range(3):   # grow the cut into the arm's outline / shading (dark or mid-dark pixels) inside the boxes
        pad = np.pad(cut, 1); near = pad[:-2, 1:-1] | pad[2:, 1:-1] | pad[1:-1, :-2] | pad[1:-1, 2:]
        cut |= near & inbox & ink & (s.max(-1) < 120)
    for x0, y0, x1, y1 in CUT.get(name + '_all', []): cut[y0:y1, x0:x1] = ink[y0:y1, x0:x1]
    keep = ink & ~cut
    for _ in range(3):                                        # drop stray pixels
        pad = np.pad(keep, 1).astype(int); n = pad[:-2, 1:-1] + pad[2:, 1:-1] + pad[1:-1, :-2] + pad[1:-1, 2:]
        keep &= n >= 2
    outline = s[ink].reshape(-1, 3)[s[ink].reshape(-1, 3).sum(1).argmin()]
    out = np.zeros((170, 170, 4), np.uint8); out[keep, :3] = s[keep]; out[keep, 3] = 255
    pad = np.pad(keep, 1); edge = keep & ~(pad[:-2, 1:-1] & pad[2:, 1:-1] & pad[1:-1, :-2] & pad[1:-1, 2:])
    out[edge & ~(s.max(-1) < 70), :3] = outline                # re-close the silhouette where arms were removed
    return out

torsos = {k: armcut(k) for k in ('windup', 'upright', 'follow')}
for i, k in enumerate(('windup', 'upright', 'follow'), 1): torsos[f'torso{i}'] = torsos[k]
meta = json.load(open(f'{d}/{h}-rig.json'))
meta['torso_frames'] = {}
for i, k in enumerate(('windup', 'upright', 'follow'), 1):
    t = torsos[k]; ys, xs = np.where(t[..., 3] > 0)
    Image.fromarray(t).save(f'{d}/pieces/{h}-torso{i}.png')
    meta['torso_frames'][f'torso{i}'] = {'pose': k, 'feet_bottom_y': int(ys.max()), 'right_shoulder': SHOULDER[k][0], 'left_shoulder': SHOULDER[k][1]}
meta['frames'] = [
  {'torso': 'torso2', 'right_shoulder_deg': 0, 'left_shoulder_deg': 0, 'spool': 'in hand'},
  {'torso': 'torso1', 'right_shoulder_deg': -40, 'left_shoulder_deg': 60, 'spool': 'in hand'},
  {'torso': 'torso2', 'right_shoulder_deg': 175, 'left_shoulder_deg': 25, 'spool': 'in hand'},
  {'torso': 'torso3', 'right_shoulder_deg': 125, 'left_shoulder_deg': -40, 'spool': 'flying'},
]
meta['note'] = ('Each torso frame is head+body+legs with both arms removed; attach rupper/rfore at the frame right_shoulder and '
                'larm at left_shoulder (arm pieces were cut from the upright pose, pivots in pieces[...] are upright-pose coords). '
                'Raised-arm frames need ~30 art pixels of headroom.')
json.dump(meta, open(f'{d}/{h}-rig.json', 'w'), indent=1)

# preview
P = meta['pivots']; HEAD = 30
def load(n): return np.array(Image.open(f'{d}/pieces/{h}-{n}.png').convert('RGBA'))
def place(can, img, x, y):
    hh, ww = img.shape[:2]; m = img[..., 3] > 0; can[y:y + hh, x:x + ww][m] = img[m]
arm = np.zeros((170, 170, 4), np.uint8); place(arm, load('rupper'), *[meta['pieces']['rupper'][k] for k in ('x', 'y')])
place(arm, load('rfore'), *[meta['pieces']['rfore'][k] for k in ('x', 'y')])
larm = np.zeros((170, 170, 4), np.uint8); place(larm, load('larm'), *[meta['pieces']['larm'][k] for k in ('x', 'y')])
spool = load('spool')
def rot(img, ang, piv): return np.array(Image.fromarray(img).rotate(ang, resample=Image.NEAREST, center=piv))
def shift(img, dx, dy): return np.roll(np.roll(img, dy, 0), dx, 1)
base_feet = meta['torso_frames']['torso2']['feet_bottom_y']
strip = Image.new('RGB', (170 * 4, 170 + HEAD), 'white')
for i, fr in enumerate(meta['frames']):
    tf = meta['torso_frames'][fr['torso']]; dy = base_feet - tf['feet_bottom_y'] + HEAD
    can = np.zeros((170 + HEAD, 170, 4), np.uint8)
    pad = lambda a: np.vstack([np.zeros((HEAD, 170, 4), np.uint8), a])
    rs, ls = tf['right_shoulder'], tf['left_shoulder']
    la = shift(pad(larm), ls[0] - P['left_shoulder'][0], ls[1] - P['left_shoulder'][1] + dy - HEAD)
    la = rot(la, fr['left_shoulder_deg'], (ls[0], ls[1] + dy))
    m = la[..., 3] > 0; can[m] = la[m]
    t = shift(pad(torsos[fr['torso']]), 0, dy - HEAD); m = t[..., 3] > 0; can[m] = t[m]
    ra = shift(pad(arm), rs[0] - P['right_shoulder'][0], rs[1] - P['right_shoulder'][1] + dy - HEAD)
    ra = rot(ra, fr['right_shoulder_deg'], (rs[0], rs[1] + dy)); m = ra[..., 3] > 0; can[m] = ra[m]
    if fr['spool'] == 'in hand':
        ys, xs = np.where(ra[..., 3] > 0); dd = (xs - rs[0]) ** 2 + (ys - rs[1] - dy) ** 2; k = dd.argmax(); hy, hx = ys[k], xs[k]
    else: hy, hx = 20, 150
    sh_, sw_ = spool.shape[:2]; y0, x0 = max(0, hy - sh_ // 2), max(0, min(170 - sw_, hx - sw_ // 2))
    m = spool[..., 3] > 0; can[y0:y0 + sh_, x0:x0 + sw_][m] = spool[m]
    im = Image.fromarray(can); strip.paste(im.convert('RGB'), (i * 170, 0), im.split()[3])
strip.resize((170 * 4 * 3, (170 + HEAD) * 3), Image.NEAREST).save(f'{d}/{h}-throw-frames.png')
t3 = Image.new('RGB', (170 * 3, 170), 'white')
for i in range(3):
    im = Image.fromarray(torsos[('windup', 'upright', 'follow')[i]]); t3.paste(im.convert('RGB'), (i * 170, 0), im.split()[3])
t3.resize((170 * 9, 170 * 3), Image.NEAREST).save(f'{d}/{h}-torso-frames.png'); print('ok', h)
