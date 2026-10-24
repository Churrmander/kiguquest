# Cut the arms-down throw base into paper-doll pieces and preview a throw.
# usage: python rig.py <dir> <hero>
# reads <hero>-base-small.png (1 cell = 1 art pixel; shown at 6x) and ../heroes3/<hero>-throw-px.png (for the spool)
# writes pieces/<hero>-<piece>.png (RGBA, art-pixel scale), <hero>-rig.json (offsets + pivots), <hero>-throw-frames.png
import sys, json, os, math
from PIL import Image
import numpy as np

d, h = sys.argv[1], sys.argv[2]
# piece regions in art-pixel coords (x0, y0, x1, y1), pivots (x, y). Measured on the gridded base.
P = {
  'draco':  dict(neck=(88, 38), head=(60, 0, 125, 38), rsh=(98, 46), rel=(103, 64), rarm=(96, 40, 125, 64), rfore=(96, 64, 125, 101),
                 lsh=(74, 46), larm=(40, 42, 74, 79)),
  'dahlia': dict(neck=(85, 46), head=(55, 0, 125, 46), rsh=(98, 49), rel=(101, 70), rarm=(96, 46, 125, 70), rfore=(96, 70, 125, 99),
                 lsh=(72, 49), larm=(40, 48, 71, 76)),
}[h]
src = np.array(Image.open(f'{d}/{h}-base-small.png').convert('RGB'))
ink = src.min(-1) < 240
rgba = np.dstack([src, (ink * 255).astype(np.uint8)])
outline = src[ink].reshape(-1, 3)[src[ink].reshape(-1, 3).sum(1).argmin()]

cols = src.astype(int)
blueish = (cols[..., 2] > cols[..., 0] + 15) & (cols[..., 2] >= cols[..., 1])   # trousers/overalls, never arm
dark = src.max(-1) < 70
def take(box, arm=False):
    x0, y0, x1, y1 = box
    m = np.zeros(ink.shape, bool); m[y0:y1, x0:x1] = ink[y0:y1, x0:x1]
    if arm:
        core = m & ~blueish & ~dark
        pad = np.pad(core, 1); near = pad[:-2, 1:-1] | pad[2:, 1:-1] | pad[1:-1, :-2] | pad[1:-1, 2:]
        m = core | (m & dark & near)
    piece = np.zeros_like(rgba); piece[m] = rgba[m]
    return piece
pieces = {'head': take(P['head']), 'rupper': take(P['rarm'], True), 'rfore': take(P['rfore'], True), 'larm': take(P['larm'], True)}
body = rgba.copy()
for k in ('head', 'rupper', 'rfore', 'larm'): body[pieces[k][..., 3] > 0] = 0
# re-outline the body where the arms/head were removed
a = body[..., 3] > 0; pad = np.pad(a, 1)
edge = a & ~(pad[:-2, 1:-1] & pad[2:, 1:-1] & pad[1:-1, :-2] & pad[1:-1, 2:])
body[edge, :3] = outline
def despeckle(pc):  # drop stray pixels left at the cut lines (fewer than 2 opaque neighbours)
    for _ in range(2):
        a = pc[..., 3] > 0; pad = np.pad(a, 1).astype(int)
        n = pad[:-2, 1:-1] + pad[2:, 1:-1] + pad[1:-1, :-2] + pad[1:-1, 2:]
        pc[a & (n < 2)] = 0
    return pc
body = despeckle(body)
for k in ('rupper', 'rfore', 'larm'): pieces[k] = despeckle(pieces[k])
pieces['body'] = body
# spool from the approved throw art (the bright spool near the top right)
t = np.array(Image.open(f'{d}/../heroes3/{h}-throw-px.png').convert('RGB').resize((1024 // 6, 1024 // 6), Image.NEAREST))
tm = t.min(-1) < 170                      # solid spool pixels, not the pale glow/thread trail
ys, xs = np.where(tm[:50, 120:]); cy, cx = int(np.median(ys)), int(np.median(xs)) + 120
sp = t[cy - 7:cy + 7, cx - 7:cx + 7]; spm = sp.min(-1) < 200
spool = np.dstack([sp, (spm * 255).astype(np.uint8)])

os.makedirs(f'{d}/pieces', exist_ok=True)
meta = {'scale_note': 'art pixels; draw at 6x for the 1024 battle frame', 'pieces': {}}
for k, p in list(pieces.items()) + [("spool", spool)]:
    print(k, int((p[..., 3] > 0).sum()))
    al = p[..., 3] > 0; ys, xs = np.where(al)
    x0, y0, x1, y1 = xs.min(), ys.min(), xs.max() + 1, ys.max() + 1
    Image.fromarray(p[y0:y1, x0:x1]).save(f'{d}/pieces/{h}-{k}.png')
    meta['pieces'][k] = {'x': int(x0), 'y': int(y0), 'w': int(x1 - x0), 'h': int(y1 - y0)}
meta['pivots'] = {'neck': P['neck'], 'right_shoulder': P['rsh'], 'right_elbow': P['rel'], 'left_shoulder': P['lsh']}
meta['draw_order'] = ['larm', 'body', 'head', 'rupper', 'rfore', 'spool']

def rot(img, ang, piv):
    return np.array(Image.fromarray(img).rotate(ang, resample=Image.NEAREST, center=piv))
def over(dst, srcp):
    m = srcp[..., 3] > 0; dst[m] = srcp[m]
arm = pieces['rupper'].copy(); over(arm, pieces['rfore'])
HEAD = 30
padp = lambda a: np.vstack([np.zeros((HEAD,) + a.shape[1:], a.dtype), a])
sh_p = (P['rsh'][0], P['rsh'][1] + HEAD); lsh_p = (P['lsh'][0], P['lsh'][1] + HEAD)
def frame(sh, larm, spool_at):
    can = padp(np.zeros_like(rgba))
    over(can, rot(padp(pieces['larm']), larm, lsh_p)); over(can, padp(pieces['body'])); over(can, padp(pieces['head']))
    ra = rot(padp(arm), sh, sh_p); over(can, ra)
    if spool_at == 'hand':
        ys, xs = np.where(ra[..., 3] > 0); dx = xs - sh_p[0]; dy = ys - sh_p[1]; k = (dx * dx + dy * dy).argmax()
        hy, hx = ys[k], xs[k]
    else: hy, hx = spool_at
    sc = np.zeros_like(can); y0, x0 = max(0, hy - 7), max(0, hx - 7); sc[y0:y0 + 14, x0:x0 + 14] = spool[:14, :14]; over(can, sc)
    return can
# shoulder angles (PIL: positive = counter-clockwise on screen): idle, wind back, arm up, release up-right
keys = [(0, 0, 'hand'), (-30, 10, 'hand'), (175, 20, 'hand'), (125, -15, (30, 150))]
meta['frames'] = [{'right_shoulder_deg': a, 'left_shoulder_deg': b, 'spool': 'in hand' if s == 'hand' else 'flying'} for a, b, s in keys]
meta['note'] = 'Pivots are in base coordinates; the raised-arm frames need ~30 art pixels of headroom above the head.'
json.dump(meta, open(f'{d}/{h}-rig.json', 'w'), indent=1)
strip = Image.new('RGB', (170 * 4, 170 + HEAD), 'white')
for i, k in enumerate(keys):
    im = Image.fromarray(np.vstack([np.zeros((HEAD, 170, 4), np.uint8), frame(*k)])) if False else None
    big = frame(*k)
    # shift down by HEAD so raised arms stay in frame (re-render with rows padded on top)
    im = Image.fromarray(big); strip.paste(im.convert('RGB'), (i * 170, 0), im.split()[3])
strip.resize((170 * 4 * 3, (170 + HEAD) * 3), Image.NEAREST).save(f'{d}/{h}-throw-frames.png'); print('ok', h)
