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


def drop_floating(a, keep_min=60):
    """Remove pieces not joined to the figure (stray sparkles, specks): every 8-connected non-background part smaller than
    keep_min pixels goes, except the largest part."""
    fg = ~is_col(a, WHITE)
    H, W = fg.shape
    seen = np.zeros_like(fg)
    parts = []
    for y0, x0 in zip(*np.where(fg)):
        if seen[y0, x0]:
            continue
        stack, comp = [(y0, x0)], []
        seen[y0, x0] = True
        while stack:
            y, x = stack.pop(); comp.append((y, x))
            for dy in (-1, 0, 1):
                for dx in (-1, 0, 1):
                    ny, nx = y + dy, x + dx
                    if 0 <= ny < H and 0 <= nx < W and fg[ny, nx] and not seen[ny, nx]:
                        seen[ny, nx] = True; stack.append((ny, nx))
        parts.append(comp)
    parts.sort(key=len, reverse=True)
    for comp in parts[1:]:
        if len(comp) < keep_min:
            for y, x in comp:
                a[y, x] = WHITE
    return a


def requantize(a, n=16):
    """Cut the figure to n colours (plus ink and background) to calm speckled pastel noise; run unspeckle() after."""
    fig = ~(is_col(a, WHITE) | is_col(a, INK))
    px = a[fig]
    side = int(np.ceil(np.sqrt(len(px))))
    buf = np.resize(px, (side * side, 3)).reshape(side, side, 3).astype(np.uint8)
    q = Image.fromarray(buf).quantize(n, method=Image.MEDIANCUT, kmeans=3)
    pal = np.array(q.getpalette()[:n * 3]).reshape(-1, 3)
    idx = ((px[:, None].astype(int) - pal[None]) ** 2).sum(-1).argmin(1)
    out = a.copy()
    out[fig] = pal[idx]
    return out


def mode_filter(a, protect=(), need=5, passes=1):
    """Each figure pixel takes the commonest colour of its 3x3 window when that colour fills at least `need` of the 9 cells
    (ink and background never spread). Smooths blotchy 2x2 noise that unspeckle() leaves."""
    H, W, _ = a.shape
    keepm = is_col(a, INK) | is_col(a, WHITE)
    for x0, y0, x1, y1 in protect:
        keepm[y0:y1, x0:x1] = True
    for _ in range(passes):
        b = a.copy()
        for y in range(1, H - 1):
            for x in range(1, W - 1):
                if keepm[y, x]:
                    continue
                win = [tuple(a[y + dy, x + dx]) for dy in (-1, 0, 1) for dx in (-1, 0, 1)]
                win = [c for c in win if c not in (INK, WHITE)]
                if win:
                    c = max(set(win), key=win.count)
                    if win.count(c) >= need:
                        b[y, x] = c
        a = b
    return a


GLOW = ((200, 240, 255), (140, 210, 245), (250, 250, 250))  # pale-blue glow drop: fill, shade, glint


def drop_at(a, x, y, glow=GLOW):
    """A glowing drop hanging from (x, y) (its top pixel), 1-2-3-2 wide, inked all round."""
    cells = {(x, y): glow[0], (x, y + 1): glow[2], (x + 1, y + 1): glow[0],
             (x - 1, y + 2): glow[0], (x, y + 2): glow[0], (x + 1, y + 2): glow[1], (x, y + 3): glow[1], (x + 1, y + 3): glow[1]}
    for (cx, cy) in list(cells):
        for dx, dy in ((-1, 0), (1, 0), (0, -1), (0, 1)):
            n = (cx + dx, cy + dy)
            if n not in cells and is_col(a[n[1]:n[1] + 1, n[0]:n[0] + 1], WHITE).all():
                a[n[1], n[0]] = INK
    for (cx, cy), c in cells.items():
        a[cy, cx] = c
    return a


def hem_drops(a, xs, glow=GLOW, max_y=128):
    """Hang a drop under the lowest figure pixel (above max_y) of each column in xs."""
    for x in xs:
        col = np.where(~is_col(a[:max_y, x:x + 1], WHITE)[:, 0])[0]
        if len(col):
            drop_at(a, x, col.max() + 1, glow)
    return a


def skin_like(a, box, skin, tol=60):
    """Pull orange-ish skin pixels in box toward the face's skin colour."""
    x0, y0, x1, y1 = box
    for y in range(y0, y1):
        for x in range(x0, x1):
            c = a[y, x].astype(int)
            if c[0] > 150 and c[0] > c[2] + 40 and abs(c - np.array(skin)).sum() < 3 * tol + 120:
                a[y, x] = skin
    return a


def rope(a, pts, cols=((150, 150, 162), (98, 98, 110)), tassel=None):
    """A 2 px rope through the points (light left column, dark right), inked on both sides, with an optional tassel
    (a 4x4 block in the light colour) at the end."""
    cells = {}
    for (x0, y0), (x1, y1) in zip(pts, pts[1:]):
        n = max(abs(x1 - x0), abs(y1 - y0))
        for i in range(n + 1):
            x = round(x0 + (x1 - x0) * i / n); y = round(y0 + (y1 - y0) * i / n)
            cells[(x, y)] = cols[0]; cells[(x + 1, y)] = cols[1]
    if tassel:
        tx, ty = tassel
        for yy in range(ty, ty + 4):
            for xx in range(tx, tx + 4):
                cells[(xx, yy)] = cols[0] if (xx + yy) % 2 else cols[1]
    for (x, y) in cells:
        for dx, dy in ((-1, 0), (1, 0), (0, 1), (0, -1)):
            if (x + dx, y + dy) not in cells:
                a[y + dy, x + dx] = INK
    for (x, y), c in cells.items():
        a[y, x] = c
    return a


def drip_stripes(a, stripes, main, dark, width=1):
    """Vertical drip stripes: for each (x, y0, y1), pixels of the main suit colour on that column turn dark, ending in a
    2 px rounded tip at y1. `main` may be one colour or a set of suit colours."""
    mains = {tuple(c) for c in main} if isinstance(main, (set, list)) else {tuple(main)}
    for x, y0, y1 in stripes:
        for y in range(y0, y1 + 1):
            for xx in range(x, x + width):
                if tuple(a[y, xx]) in mains:
                    a[y, xx] = dark
        for yy, xs in ((y1 + 1, range(x - 1, x + width + 1)), (y1 + 2, range(x, x + width))):   # rounded drop at the end
            for xx in xs:
                if tuple(a[yy, xx]) in mains:
                    a[yy, xx] = dark
    return a


def stone_points(a, xs, y, light, mid, length=4, glint=None, outline=True):
    """Little stalactite points hanging from row y: 2 px wide for half the length, then 1 px, inked around."""
    for x in xs:
        cells = {}
        for i in range(length):
            cells[(x, y + i)] = light if i < length // 2 else mid
            if i < length // 2:
                cells[(x + 1, y + i)] = mid
        for (cx, cy) in cells if outline else ():
            for dx, dy in ((-1, 0), (1, 0), (0, 1)):
                if (cx + dx, cy + dy) not in cells:
                    a[cy + dy, cx + dx] = INK
        for (cx, cy), c in cells.items():
            a[cy, cx] = c
        if glint:
            a[y, x] = glint
    return a
