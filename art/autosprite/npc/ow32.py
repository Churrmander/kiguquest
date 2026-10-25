# Cleaner 32x32 overworld conversion.
# usage: python ow32.py <dir> <sheet.png> id1 id2 ...   needs <id>-ow-{down,up,left}-px.png (128-grid art at 1024)
# Per character: one ~12-colour palette shared by all facings, area-averaged downscale (no blur halos),
# alpha threshold for a hard silhouette, then a 1px dark outline like BW overworld sprites.
import sys
from PIL import Image
import numpy as np

d, sheet, ids = sys.argv[1], sys.argv[2], sys.argv[3:]
VIEWS = ('down', 'up', 'left')
H = 30  # sprite height inside the 32px cell

def to128(p): return np.array(Image.open(p).convert('RGB').resize((128, 128), Image.NEAREST)).astype(float)

tiles = []
for i in ids:
    arts = {v: to128(f'{d}/{i}-ow-{v}-px.png') for v in VIEWS}
    masks = {v: arts[v].min(-1) < 240 for v in VIEWS}
    ys, xs = np.where(masks['down']); top, bot = ys.min(), ys.max() + 1
    scale = H / (bot - top)
    # shared palette from all facings' foreground pixels
    fg = np.concatenate([arts[v][masks[v]] for v in VIEWS])
    side = int(np.ceil(np.sqrt(len(fg)))); buf = np.zeros((side * side, 3)); buf[:len(fg)] = fg; buf[len(fg):] = fg[0]
    pal = np.array([c for _, c in Image.fromarray(buf.reshape(side, side, 3).astype(np.uint8))
                    .quantize(12, method=Image.MAXCOVERAGE).convert('RGB').getcolors(1 << 20)]).astype(float)
    outline = pal[pal.sum(1).argmin()]
    row = Image.new('RGB', (96, 32), 'white')
    for k, v in enumerate(VIEWS):
        a, m = arts[v], masks[v]
        ys, xs = np.where(m); x0, x1 = xs.min(), xs.max() + 1
        crop = a[top:bot, x0:x1]; cm = m[top:bot, x0:x1].astype(float)
        w = max(1, round((x1 - x0) * scale))
        # premultiplied area average so the white background never bleeds into edge colours
        rgb = np.array(Image.fromarray((crop * cm[..., None]).astype(np.uint8)).resize((w, H), Image.BOX)).astype(float)
        al = np.array(Image.fromarray((cm * 255).astype(np.uint8)).resize((w, H), Image.BOX)).astype(float) / 255
        solid = al > 0.45
        col = rgb / np.maximum(al[..., None], 1e-3)
        idx = ((col.reshape(-1, 3)[:, None] - pal[None]) ** 2).sum(-1).argmin(1)
        out = np.where(solid[..., None], pal[idx].reshape(H, w, 3), 255)
        # 1px outline: solid pixels touching the background become the darkest colour
        pad = np.pad(solid, 1)
        edge = solid & ~(pad[:-2, 1:-1] & pad[2:, 1:-1] & pad[1:-1, :-2] & pad[1:-1, 2:])
        out[edge] = outline
        cell = Image.new('RGB', (32, 32), 'white'); cell.paste(Image.fromarray(out.astype(np.uint8)), ((32 - w) // 2, 1))
        row.paste(cell, (k * 32, 0))
    row.save(f'{d}/{i}-ow32.png'); tiles.append(row.resize((384, 128), Image.NEAREST))
cols = 4; rows = (len(tiles) + cols - 1) // cols
s = Image.new('RGB', (cols * 384, rows * 128), 'white')
for k, t in enumerate(tiles): s.paste(t, ((k % cols) * 384, (k // cols) * 128))
s.save(f'{d}/{sheet}'); print('ok', len(tiles))
