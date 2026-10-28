"""Snap a 1024 render to the Kigu sprite grid: median per 8x8 block, fit a 32-colour palette, scale back up x8.

Same idea as kiguquest/art/autosprite/npc/process.py. Usage: python snap.py image.png [--grid 8] [--colours 32]
"""
import pathlib, sys
import numpy as np
from PIL import Image


def keep_figure(a, height=0.88):
    """Drop any frame the model drew, then scale the figure to a set share of the canvas height, centred, feet on a fixed line."""
    ink = a.min(-1) < 235
    # a drawn frame is a near-solid dark line close to the edge: blank everything from it outward
    H, W = ink.shape
    for axis in (0, 1):
        share = ink.mean(axis=1 - axis)
        n = len(share)
        for i in range(n // 6):
            if share[i] > 0.6:
                sl = [slice(None)] * 2; sl[axis] = slice(0, i + 3); a[tuple(sl)] = 255
            if share[n - 1 - i] > 0.6:
                sl = [slice(None)] * 2; sl[axis] = slice(n - 4 - i, n); a[tuple(sl)] = 255
    ys, xs = np.where(a.min(-1) < 235)
    if not len(xs):
        return a
    crop = Image.fromarray(a[ys.min():ys.max() + 1, xs.min():xs.max() + 1].astype(np.uint8))
    s = min(H * height / crop.height, W * 0.9 / crop.width)
    crop = crop.resize((max(1, round(crop.width * s)), max(1, round(crop.height * s))), Image.LANCZOS)
    can = Image.new("RGB", (W, H), "white")
    can.paste(crop, ((W - crop.width) // 2, int(H * 0.95) - crop.height))
    return np.array(can).astype(float)


def despeckle(idx, passes=2):
    """A pixel that matches none of its 4 neighbours takes the most common neighbour colour (kills noise on tails and faces)."""
    for _ in range(passes):
        p = np.pad(idx, 1, mode="edge")
        nb = np.stack([p[:-2, 1:-1], p[2:, 1:-1], p[1:-1, :-2], p[1:-1, 2:]])
        lonely = (nb != idx).all(0)
        for y, x in zip(*np.where(lonely)):
            vals, counts = np.unique(nb[:, y, x], return_counts=True)
            if counts.max() >= 2:
                idx[y, x] = vals[counts.argmax()]
    return idx


def drop_specks(small, max_cells=3):
    """Tiny islands floating off the figure (stray dots around flames, wings and hair) become background."""
    fg = small.min(-1) < 255
    seen = np.zeros_like(fg)
    H, W = fg.shape
    for y0, x0 in zip(*np.where(fg)):
        if seen[y0, x0]:
            continue
        stack, comp = [(y0, x0)], []
        seen[y0, x0] = True
        while stack:
            y, x = stack.pop()
            comp.append((y, x))
            for dy in (-1, 0, 1):
                for dx in (-1, 0, 1):
                    ny, nx = y + dy, x + dx
                    if 0 <= ny < H and 0 <= nx < W and fg[ny, nx] and not seen[ny, nx]:
                        seen[ny, nx] = True
                        stack.append((ny, nx))
        if len(comp) <= max_cells:
            for y, x in comp:
                small[y, x] = 255
    return small


INK = np.array([50, 29, 10])  # the AutoSprite Kigu outline is a warm dark brown, about (47,31,9)-(53,23,4), never pure black


def outline(small):
    """1px dark outline around the silhouette, like the AutoSprite Kigu: figure pixels touching white become warm dark ink,
    and near-black inner lines take the same ink."""
    bg = small.min(-1) == 255
    lum = small.astype(float) @ [0.3, 0.59, 0.11]
    ink = INK.astype(small.dtype)
    small = small.copy()
    small[~bg & (lum < 40)] = ink
    p = np.pad(bg, 1, constant_values=True)
    edge = ~bg & (p[:-2, 1:-1] | p[2:, 1:-1] | p[1:-1, :-2] | p[1:-1, 2:])
    out = small.copy()
    out[edge] = ink
    return out


def grid_phase(a, grid):
    """The model draws its pixel blocks on a grid that needn't start at (0, 0): pick the offset with the least spread inside blocks."""
    best = None
    for oy in range(grid):
        for ox in range(grid):
            H, W = (a.shape[0] - oy) // grid * grid, (a.shape[1] - ox) // grid * grid
            blk = a[oy:oy + H, ox:ox + W].reshape(H // grid, grid, W // grid, grid, 3)
            spread = blk.std(axis=(1, 3)).mean()
            if best is None or spread < best[0]:
                best = (spread, oy, ox)
    return best[1], best[2]


def background(b):
    """Background = near-white cells joined to the border. White inside the figure (glints, glowing bulbs) stays figure."""
    light = b.min(-1) > 235
    bg = np.zeros_like(light)
    H, W = light.shape
    stack = [(y, x) for y in range(H) for x in (0, W - 1)] + [(y, x) for x in range(W) for y in (0, H - 1)]
    while stack:
        y, x = stack.pop()
        if 0 <= y < H and 0 <= x < W and light[y, x] and not bg[y, x]:
            bg[y, x] = True
            stack += [(y + 1, x), (y - 1, x), (y, x + 1), (y, x - 1)]
    return bg


def snap(path, grid=8, colours=24):
    path = pathlib.Path(path)
    a = keep_figure(np.array(Image.open(path).convert("RGB")).astype(float))
    oy, ox = grid_phase(a, grid)
    a = np.pad(a, ((oy and grid - oy, 0), (ox and grid - ox, 0), (0, 0)), constant_values=255) if (oy or ox) else a
    H, W = a.shape[0] // grid * grid, a.shape[1] // grid * grid
    b = np.median(a[:H, :W].reshape(H // grid, grid, W // grid, grid, 3), axis=(1, 3))
    # background goes pure white so it never spends a palette slot; inner whites are capped just below it
    bg = background(b)
    b[bg] = 255
    b[~bg] = np.minimum(b[~bg], 250)
    fg = b.reshape(-1, 3)[b.reshape(-1, 3).min(1) < 255]
    side = int(np.ceil(np.sqrt(len(fg))))
    buf = np.resize(fg, (side * side, 3))
    pal = Image.fromarray(buf.reshape(side, side, 3).astype(np.uint8)).quantize(colours - 1, method=Image.MAXCOVERAGE)
    pal = np.array([c for _, c in pal.convert("RGB").getcolors(1 << 20)] + [(255, 255, 255)]).astype(float)
    f = b.reshape(-1, 3)
    idx = ((f[:, None] - pal[None]) ** 2).sum(-1).argmin(1).reshape(b.shape[:2])
    idx = despeckle(idx)
    small = pal[idx].astype(np.uint8)
    small = drop_specks(small)
    small = outline(small)
    out = path.with_name(path.stem + "-px.png")
    Image.fromarray(small).resize((W, H), Image.NEAREST).save(out)
    return out


if __name__ == "__main__":
    args = sys.argv[1:]
    grid = int(args[args.index("--grid") + 1]) if "--grid" in args else 8
    colours = int(args[args.index("--colours") + 1]) if "--colours" in args else 24
    print(snap(args[0], grid, colours))
