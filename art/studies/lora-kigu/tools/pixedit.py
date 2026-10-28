"""Small pixel-edit toolkit for 128px Kigu sprites (white background, warm dark outline).

Load with load(path) -> HxWx3 uint8 array at 1x; save(a, path) writes the 1x copy and an x8 1024 copy.
"""
import numpy as np
from PIL import Image

INK = (50, 29, 10)
WHITE = (255, 255, 255)


def load(path):
    im = Image.open(path).convert('RGB')
    if im.width != 128:
        im = im.resize((128, 128), Image.NEAREST)
    return np.array(im)


def save(a, path1x, path1024=None):
    Image.fromarray(a).save(path1x)
    if path1024:
        Image.fromarray(a).resize((1024, 1024), Image.NEAREST).save(path1024)


def is_col(a, c):
    return (a == np.array(c)).all(-1)


def unspeckle(a, protect=(), passes=2, keep=(INK, WHITE)):
    """A pixel that shares its colour with at most one of its 8 neighbours takes the commonest neighbour colour.
    Outline and background never change or spread; protect = list of (x0, y0, x1, y1) boxes (faces, eyes) left alone."""
    H, W, _ = a.shape
    keepm = np.zeros((H, W), bool)
    for c in keep:
        keepm |= is_col(a, c)
    for x0, y0, x1, y1 in protect:
        keepm[y0:y1, x0:x1] = True
    for _ in range(passes):
        b = a.copy()
        for y in range(1, H - 1):
            for x in range(1, W - 1):
                if keepm[y, x]:
                    continue
                nb = [tuple(a[y + dy, x + dx]) for dy in (-1, 0, 1) for dx in (-1, 0, 1) if dy or dx]
                me = tuple(a[y, x])
                if nb.count(me) <= 1:
                    cand = [c for c in nb if c not in (INK, WHITE)]
                    if cand:
                        b[y, x] = max(set(cand), key=cand.count)
        a = b
    return a


def nearest(a, palette, box=None, only=None):
    """Snap pixels (inside box, optionally only those whose colour is in `only`) to the nearest colour in palette."""
    pal = np.array(palette, float)
    x0, y0, x1, y1 = box or (0, 0, a.shape[1], a.shape[0])
    reg = a[y0:y1, x0:x1].astype(float)
    m = ~(is_col(a[y0:y1, x0:x1], INK) | is_col(a[y0:y1, x0:x1], WHITE))
    if only is not None:
        m &= np.isin(a[y0:y1, x0:x1].view([('', a.dtype)] * 3).ravel(),
                     np.array(only, a.dtype).view([('', a.dtype)] * 3).ravel()).reshape(m.shape)
    idx = ((reg[..., None, :] - pal) ** 2).sum(-1).argmin(-1)
    out = a.copy()
    out[y0:y1, x0:x1][m] = pal[idx][m].astype(np.uint8)
    return out


def replace(a, mapping, box=None):
    """Swap exact colours {old: new} inside box (whole sprite by default)."""
    x0, y0, x1, y1 = box or (0, 0, a.shape[1], a.shape[0])
    out = a.copy()
    reg = out[y0:y1, x0:x1]
    src = a[y0:y1, x0:x1]
    for old, new in mapping.items():
        reg[is_col(src, old)] = new
    return out


def put(a, pts, c):
    for x, y in pts:
        a[y, x] = c
    return a


def rect(a, x0, y0, x1, y1, c):
    a[y0:y1, x0:x1] = c
    return a


def reoutline(a):
    """Figure pixels touching background become ink; ink with no figure neighbour (floating) becomes background."""
    bg = is_col(a, WHITE)
    p = np.pad(bg, 1, constant_values=True)
    edge = ~bg & (p[:-2, 1:-1] | p[2:, 1:-1] | p[1:-1, :-2] | p[1:-1, 2:])
    a = a.copy()
    a[edge] = INK
    return a


def palette(a):
    cs = Image.fromarray(a).getcolors(1 << 16)
    return sorted([c for n, c in cs if c not in (WHITE,)], key=lambda c: -sum(c))


def relight(a, main, shade, light, box=None, depth=3):
    """Top-left lighting for a flat colour: main-colour pixels within `depth` px of the outline to their right or below take the
    shade tone, and those right under/after the outline to their top-left take the light tone."""
    x0, y0, x1, y1 = box or (0, 0, a.shape[1], a.shape[0])
    src = a.copy()
    edge = is_col(src, INK) | is_col(src, WHITE)
    m = is_col(src, main)
    H, W = edge.shape
    for y in range(y0, y1):
        for x in range(x0, x1):
            if not m[y, x]:
                continue
            right = any(edge[y, min(W - 1, x + k)] for k in range(1, depth + 1))
            below = any(edge[min(H - 1, y + k), x] for k in range(1, depth))
            if right or below:
                a[y, x] = shade
            elif edge[max(0, y - 1), x] and edge[y, max(0, x - 1)] or edge[max(0, y - 1), max(0, x - 1)] and (edge[max(0, y - 1), x] or edge[y, max(0, x - 1)]):
                a[y, x] = light
    return a


BULB = ((225, 231, 26), (237, 243, 98), (250, 250, 250), (190, 196, 20))  # fill, light, glint, shade


def antenna4(a, sx, foot, stalk=1, bulb=BULB):
    """Glowing antenna: a 1 px ink stalk rising from row `foot` (the hood outline row) for `stalk` px, topped by a 4x4 bulb
    in a rounded ink ring. sx is the stalk column; the bulb sits centred on it (columns sx-1..sx+2)."""
    for i in range(1, stalk + 1):
        a[foot - i, sx] = INK
    bot = foot - stalk - 1                       # ring bottom row
    top = bot - 5
    for y in range(top, bot + 1):
        for x in range(sx - 2, sx + 4):
            edge_r = y in (top, bot); edge_c = x in (sx - 2, sx + 3)
            if edge_r != edge_c:
                a[y, x] = INK
            elif not edge_r:
                a[y, x] = bulb[0]
    for x in range(sx - 1, sx + 3):
        a[bot - 1, x] = bulb[3]
    a[top + 1, sx - 1] = bulb[1]; a[top + 1, sx] = bulb[1]; a[top + 2, sx - 1] = bulb[2]
    return a


def dome(a, left, right, fill, kill=()):
    """Rebuild a hood edge: per row y, pixels left of left[y] or right of right[y] become background; pixels inside whose
    colour is in `kill` (leftover nubs) become `fill`. Run reoutline() afterwards."""
    for y in left:
        L, R = left[y], right[y]
        for x in range(a.shape[1]):
            if x < L or x > R:
                if not is_col(a[y:y + 1, x:x + 1], WHITE).all() and y in left:
                    a[y, x] = WHITE
            elif tuple(a[y, x]) in kill:
                a[y, x] = fill
    return a


def shift(a, dx=0, dy=0):
    out = np.full_like(a, 255)
    H, W, _ = a.shape
    out[max(0, dy):H + min(0, dy), max(0, dx):W + min(0, dx)] = a[max(0, -dy):H - max(0, dy), max(0, -dx):W - max(0, dx)]
    return out


def inner_ink(a, box, fill):
    """Ink pixels inside box that touch no background (leftover lines inside a shape) become `fill`."""
    x0, y0, x1, y1 = box
    bg = is_col(a, WHITE)
    src = a.copy()
    for y in range(y0, y1):
        for x in range(x0, x1):
            if tuple(src[y, x]) == INK and not bg[y - 1:y + 2, x - 1:x + 2].any():
                a[y, x] = fill
    return a
