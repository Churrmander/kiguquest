# usage:
#   python process.py trainer <dir> <sheet.png> id1 id2 ...     needs <id>-battle.png  -> <id>-battle-px.png (6px grid, 31 colours)
#   python process.py ow <dir> <sheet.png> id1 id2 ...          needs <id>-ow-down/up/left.png -> -px.png (8px grid, base palette) + <id>-ow32.png
# Prints "EDGE <file> <px>" when content is within 16px of the 1024 frame edge.
import sys
from PIL import Image
import numpy as np

mode, d, sheet, ids = sys.argv[1], sys.argv[2], sys.argv[3], sys.argv[4:]

def load(p): return np.array(Image.open(p).convert('RGB')).astype(float)

def edge(a, name):
    ink = a.min(-1) < 240
    ys, xs = np.where(ink)
    if not len(xs): return
    H, W = ink.shape
    m = min(xs.min(), ys.min(), W - 1 - xs.max(), H - 1 - ys.max())
    if m < 16: print('EDGE', name, int(m))

def blocks(a, g):
    H = a.shape[0] // g * g; W = a.shape[1] // g * g
    return np.median(a[:H, :W].reshape(H // g, g, W // g, g, 3), axis=(1, 3))

def fit_palette(arrs, n):
    px = np.concatenate([b.reshape(-1, 3) for b in arrs]); fg = px[px.min(1) < 235]
    side = int(np.ceil(np.sqrt(len(fg)))); buf = np.zeros((side * side, 3)); buf[:len(fg)] = fg; buf[len(fg):] = fg[0]
    q = Image.fromarray(buf.reshape(side, side, 3).astype(np.uint8)).quantize(n, method=Image.MAXCOVERAGE).convert('RGB')
    return np.array([c for _, c in q.getcolors(1 << 20)] + [(255, 255, 255)]).astype(float)

def mapto(b, pal):
    f = b.reshape(-1, 3); idx = ((f[:, None] - pal[None]) ** 2).sum(-1).argmin(1)
    return pal[idx].reshape(b.shape).astype(np.uint8)

tiles = []
if mode == 'trainer':
    g = 6
    for i in ids:
        a = load(f'{d}/{i}-battle.png'); edge(a, i + '-battle')
        b = blocks(a, g); small = mapto(b, fit_palette([b], 31))
        im = Image.fromarray(small).resize((small.shape[1] * g, small.shape[0] * g), Image.NEAREST)
        im.save(f'{d}/{i}-battle-px.png'); tiles.append(im.resize((512, 512), Image.NEAREST))
    cols = 5
else:
    g = 8
    for i in ids:
        pal = np.array([c for _, c in Image.open(f'{d}/{i}-ow-down.png').convert('RGB').getcolors(1 << 24) or []]).astype(float)
        raw = {v: load(f'{d}/{i}-ow-{v}.png') for v in ('down', 'up', 'left')}
        for v in raw: edge(raw[v], f'{i}-ow-{v}')
        # the pose tool often draws up/left smaller: rescale each view so its height and baseline match 'down'
        def bbox(a):
            ys, xs = np.where(a.min(-1) < 240); return xs.min(), ys.min(), xs.max() + 1, ys.max() + 1
        dx0, dy0, dx1, dy1 = bbox(raw['down']); hd = dy1 - dy0; cx = (dx0 + dx1) // 2
        for v in ('up', 'left'):
            x0, y0, x1, y1 = bbox(raw[v]); crop = Image.fromarray(raw[v][y0:y1, x0:x1].astype(np.uint8))
            w = max(1, round(crop.width * hd / crop.height)); crop = crop.resize((w, hd), Image.LANCZOS)
            can = Image.new('RGB', (1024, 1024), 'white'); can.paste(crop, (cx - w // 2, dy1 - hd)); raw[v] = np.array(can).astype(float)
        if len(pal) == 0 or len(pal) > 64:   # base not palette-clean: fit one palette across all three views
            pal = fit_palette([blocks(raw[v], g) for v in raw], 31)
        row = []
        smalls = {v: mapto(blocks(raw[v], g), pal) for v in raw}
        sy0 = dy0 // g; sy1 = -(-dy1 // g); scale = 30 / (sy1 - sy0)          # fit 'down' to 30px tall in a 32px cell
        for v in ('down', 'up', 'left'):
            small = smalls[v]
            Image.fromarray(small).resize((small.shape[1] * g, small.shape[0] * g), Image.NEAREST).save(f'{d}/{i}-ow-{v}-px.png')
            ys, xs = np.where(small.min(-1) < 240); x0, x1 = xs.min(), xs.max() + 1
            part = Image.fromarray(small[sy0:sy1, x0:x1])
            pw = max(1, round(part.width * scale)); part = part.resize((pw, 30), Image.BOX)
            part = Image.fromarray(mapto(np.array(part).astype(float), pal))
            cell = Image.new('RGB', (32, 32), 'white'); cell.paste(part, ((32 - pw) // 2, 1))
            row.append(cell)
        strip = Image.new('RGB', (96, 32), 'white')
        for k, im in enumerate(row): strip.paste(im, (k * 32, 0))
        strip.save(f'{d}/{i}-ow32.png')
        tiles.append(strip.resize((384, 128), Image.NEAREST))
    cols = 4
rows = (len(tiles) + cols - 1) // cols
tw, th = tiles[0].size
s = Image.new('RGB', (cols * tw, rows * th), 'white')
for k, t in enumerate(tiles): s.paste(t, ((k % cols) * tw, (k // cols) * th))
s.save(f'{d}/{sheet}'); print('ok', len(tiles))
