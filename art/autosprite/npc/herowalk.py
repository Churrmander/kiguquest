# Hero walk sheets from AutoSprite frames.
# usage: python herowalk.py <dir> <hero>
# inputs: <hero>-ow-down.png (stand), <hero>-ow-downstep.png, <hero>-ow-up-v1.png (stand), <hero>-ow-up.png (step),
#         <hero>-ow-left-v1.png (stand), <hero>-ow-left.png (step A), <hero>-ow-leftstepb.png (step B)
# output: <hero>-walk32.png 96x96 (rows down/up/left; cols stand, step1, step2; down/up step2 = mirror of step1)
#         and <hero>-walk128.png (same layout at 128px cells, for review)
import sys
from PIL import Image
import numpy as np
d, h = sys.argv[1], sys.argv[2]
src = {'down': ['ow-down', 'ow-downstep', None], 'up': ['ow-up-v1', 'ow-up', None], 'left': ['ow-left-v1', 'ow-left', 'ow-leftstepb']}
load = lambda n: np.array(Image.open(f'{d}/{h}-{n}.png').convert('RGB')).astype(float)
def bbox(a):
    ys, xs = np.where(a.min(-1) < 240); return xs.min(), ys.min(), xs.max() + 1, ys.max() + 1
ref = load('ow-down'); rx0, ry0, rx1, ry1 = bbox(ref); RH = ry1 - ry0
def norm(a):  # same height and baseline as the standing down frame
    x0, y0, x1, y1 = bbox(a); c = Image.fromarray(a[y0:y1, x0:x1].astype(np.uint8))
    w = round(c.width * RH / c.height); c = c.resize((w, RH), Image.LANCZOS)
    can = Image.new('RGB', (1024, 1024), 'white'); can.paste(c, (512 - w // 2, ry1 - RH)); return np.array(can).astype(float)
frames = {v: [norm(load(n)) if n else None for n in src[v]] for v in src}
# one palette for every frame
def blocks(a, g=8):
    return np.median(a.reshape(128, g, 128, g, 3), axis=(1, 3))
smalls = {v: [blocks(f) if f is not None else None for f in frames[v]] for v in frames}
fg = np.concatenate([s[s.min(-1) < 235] for v in smalls for s in smalls[v] if s is not None])
side = int(np.ceil(np.sqrt(len(fg)))); buf = np.zeros((side * side, 3)); buf[:len(fg)] = fg; buf[len(fg):] = fg[0]
pal12 = np.array([c for _, c in Image.fromarray(buf.reshape(side, side, 3).astype(np.uint8)).quantize(12, method=Image.MAXCOVERAGE).convert('RGB').getcolors(1 << 20)]).astype(float)
pal31 = np.array([c for _, c in Image.fromarray(buf.reshape(side, side, 3).astype(np.uint8)).quantize(31, method=Image.MAXCOVERAGE).convert('RGB').getcolors(1 << 20)] + [(255, 255, 255)]).astype(float)
def mapto(a, pal):
    f = a.reshape(-1, 3); return pal[((f[:, None] - pal[None]) ** 2).sum(-1).argmin(1)].reshape(a.shape)
outline = pal12[pal12.sum(1).argmin()]
top = ry0 // 8; bot = -(-ry1 // 8); H = 30; scale = H / (bot - top)
def to32(s):
    m = s.min(-1) < 240; ys, xs = np.where(m); x0, x1 = xs.min(), xs.max() + 1
    crop = s[top:bot, x0:x1]; cm = m[top:bot, x0:x1].astype(float); w = max(1, round((x1 - x0) * scale))
    rgb = np.array(Image.fromarray((crop * cm[..., None]).astype(np.uint8)).resize((w, H), Image.BOX)).astype(float)
    al = np.array(Image.fromarray((cm * 255).astype(np.uint8)).resize((w, H), Image.BOX)).astype(float) / 255
    solid = al > 0.45; col = mapto(rgb / np.maximum(al[..., None], 1e-3), pal12)
    out = np.where(solid[..., None], col, 255); pad = np.pad(solid, 1)
    out[solid & ~(pad[:-2, 1:-1] & pad[2:, 1:-1] & pad[1:-1, :-2] & pad[1:-1, 2:])] = outline
    cell = np.full((32, 32, 3), 255.0); x = (32 - w) // 2; cell[1:1 + H, x:x + w] = out; return cell
sheet32 = np.full((96, 96, 3), 255.0); sheet128 = np.full((384, 384, 3), 255.0)
for r, v in enumerate(('down', 'up', 'left')):
    s = [mapto(x, pal31) if x is not None else None for x in smalls[v]]
    if s[2] is None: s[2] = s[1][:, ::-1]          # opposite step = mirror for front/back views
    for c in range(3):
        sheet32[r * 32:(r + 1) * 32, c * 32:(c + 1) * 32] = to32(s[c])
        sheet128[r * 128:(r + 1) * 128, c * 128:(c + 1) * 128] = s[c]
Image.fromarray(sheet32.astype(np.uint8)).save(f'{d}/{h}-walk32.png')
Image.fromarray(sheet128.astype(np.uint8)).save(f'{d}/{h}-walk128.png'); print('ok', h)
