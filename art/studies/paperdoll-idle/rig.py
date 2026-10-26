"""Paper-doll idle rig for battle-size Kigu sprites (1 image px = 1 game px).
Parts are cut from the approved sprite with polygons, moved with integer offsets and small RotSprite-style rotations,
and composited back to front. No pixel is invented: holes a moving part leaves are filled from the nearest pixel of the
layer underneath (inside `fill` polygons only)."""
import math
import numpy as np
from PIL import Image, ImageDraw

def poly_mask(w, h, polys):
    m = Image.new('L', (w, h), 0); d = ImageDraw.Draw(m)
    for p in polys: d.polygon(p, fill=1, outline=1)
    return np.array(m, bool)

def scale2x(a):
    h, w = a.shape[:2]
    p = np.pad(a, ((1, 1), (1, 1), (0, 0)), mode='edge')
    B, D, E, F, H = p[:-2, 1:-1], p[1:-1, :-2], p[1:-1, 1:-1], p[1:-1, 2:], p[2:, 1:-1]
    eq = lambda x, y: np.all(x == y, axis=2)
    o = np.zeros((h * 2, w * 2, a.shape[2]), a.dtype)
    c = ~eq(B, H) & ~eq(D, F)
    o[0::2, 0::2] = np.where((c & eq(D, B))[..., None], D, E)
    o[0::2, 1::2] = np.where((c & eq(B, F))[..., None], F, E)
    o[1::2, 0::2] = np.where((c & eq(D, H))[..., None], D, E)
    o[1::2, 1::2] = np.where((c & eq(H, F))[..., None], F, E)
    return o

def transform(layer, chain, W, H):
    """layer: HxWx4 uint8 (alpha 0/255). chain: [(pivot, ang, dx, dy), ...] child first, then each parent: every step
    rotates ang degrees (+ = clockwise on screen) about its pivot and then shifts. A chain with no rotation is a pure copy."""
    out = np.zeros((H, W, 4), np.uint8)
    if all(abs(c[1]) < 1e-6 for c in chain):
        dx = sum(c[2] for c in chain); dy = sum(c[3] for c in chain)
        ys, xs = np.nonzero(layer[..., 3])
        X, Y = xs + dx, ys + dy
        ok = (X >= 0) & (X < W) & (Y >= 0) & (Y < H)
        out[Y[ok], X[ok]] = layer[ys[ok], xs[ok]]
        return out
    big = layer
    for _ in range(3): big = scale2x(big)
    S = 8
    yy, xx = np.mgrid[0:H, 0:W]
    px, py = xx + 0.5, yy + 0.5
    for (pv, ang, dx, dy) in reversed(chain):  # undo the outermost (parent) step first
        a = math.radians(-ang); cx, cy = px - dx - pv[0], py - dy - pv[1]
        px = cx * math.cos(a) - cy * math.sin(a) + pv[0]
        py = cx * math.sin(a) + cy * math.cos(a) + pv[1]
    ix, iy = np.floor(px * S).astype(int), np.floor(py * S).astype(int)
    ok = (ix >= 0) & (iy >= 0) & (ix < big.shape[1]) & (iy < big.shape[0])
    out[ok] = big[iy[ok], ix[ok]]
    return out

def nearest_fill(img, region, src_mask, max_r=6):
    """Fill pixels of `region` from the nearest pixel of src_mask (grows ring by ring)."""
    img = img.copy(); have = src_mask.copy(); todo = region & ~have
    for _ in range(max_r):
        if not todo.any(): break
        new = np.zeros_like(have); col = np.zeros_like(img)
        for ddy, ddx in ((0, 1), (0, -1), (1, 0), (-1, 0)):
            sh = np.roll(np.roll(have, ddy, 0), ddx, 1); sc = np.roll(np.roll(img, ddy, 0), ddx, 1)
            take = todo & sh & ~new
            col[take] = sc[take]; new |= take
        img[new] = col[new]; have |= new; todo &= ~new
    return img

def holes(a):
    """Transparent pixels the cell border can't reach (pinholes inside the silhouette)."""
    from collections import deque
    t = a[..., 3] == 0; h, w = t.shape; seen = np.zeros_like(t); q = deque()
    for x in range(w): q += [(0, x), (h - 1, x)]
    for y in range(h): q += [(y, 0), (y, w - 1)]
    while q:
        y, x = q.popleft()
        if 0 <= y < h and 0 <= x < w and t[y, x] and not seen[y, x]:
            seen[y, x] = 1; q += [(y + 1, x), (y - 1, x), (y, x + 1), (y, x - 1)]
    return t & ~seen

class Rig:
    def __init__(self, sprite, cell=(96, 96)):
        a = np.array(sprite.convert('RGBA')); a[..., 3] = np.where(a[..., 3] > 127, 255, 0)
        self.src = a; self.h, self.w = a.shape[:2]; self.cell = cell
        self.rest_holes = None  # pinholes the approved sprite already has (frame 0 = rest pose)
        self.parts = []  # claimed in list order; drawn by z
    def part(self, name, polys=None, z=0, pivot=(0, 0), parent=None, fill=None, extend=None, comp=None, color=None):
        self.parts.append(dict(name=name, polys=polys, z=z, pivot=pivot, parent=parent, fill=fill, extend=extend, comp=comp, color=color))
        return self
    def build(self):
        op = self.src[..., 3] > 0; free = op.copy()
        # connected components (4-way) for comp='floaters'
        from collections import deque
        lab = np.zeros(op.shape, int); n = 0; sizes = {}
        for y in range(self.h):
            for x in range(self.w):
                if op[y, x] and not lab[y, x]:
                    n += 1; q = deque([(y, x)]); lab[y, x] = n; c = 0
                    while q:
                        cy, cx = q.popleft(); c += 1
                        for ny, nx in ((cy+1,cx),(cy-1,cx),(cy,cx+1),(cy,cx-1)):
                            if 0 <= ny < self.h and 0 <= nx < self.w and op[ny, nx] and not lab[ny, nx]:
                                lab[ny, nx] = n; q.append((ny, nx))
                    sizes[n] = c
        main = max(sizes, key=sizes.get)
        for p in self.parts:
            if p['comp'] == 'floater':
                m = poly_mask(self.w, self.h, p['polys']) & (lab != main) & (lab > 0)
            elif p['polys'] is None:
                m = free.copy()
            else:
                m = poly_mask(self.w, self.h, p['polys']) & free
                if p['comp'] == 'main': m &= lab == main
            p['mask'] = m; free &= ~m
            layer = np.zeros_like(self.src); layer[m] = self.src[m]
            if p['extend']:  # grow this part into pixels hidden behind parts in front of it
                ext = poly_mask(self.w, self.h, p['extend']) & op & ~m
                layer = nearest_fill(layer, ext, m)
            p['layer'] = layer
        # holes: a part's `fill` polygon marks where the layer beneath it continues under it
        for p in self.parts:
            fills = p['fill'] if isinstance(p['fill'], list) else [p['fill']] if p['fill'] else []
            for name, polys in fills:
                tgt = next(q for q in self.parts if q['name'] == name)
                region = poly_mask(self.w, self.h, polys) & p['mask']
                tgt['layer'] = nearest_fill(tgt['layer'], region, tgt['layer'][..., 3] > 0)
        return self
    def frame(self, pose):
        """pose: name -> (dx, dy, ang). A child part moves with its parent: offset and rotation."""
        W, H = self.cell
        ox = (W - self.w) // 2; oy = H - 2 - self.h
        out = np.zeros((H, W, 4), np.uint8)
        def chain(p):
            dx, dy, ang = pose.get(p['name'], (0, 0, 0))
            c = [((p['pivot'][0] + ox, p['pivot'][1] + oy), ang, dx, dy)]
            if p['parent']: c += chain(next(q for q in self.parts if q['name'] == p['parent']))
            return c
        for p in sorted(self.parts, key=lambda q: q['z']):
            L = np.zeros((H, W, 4), np.uint8); L[oy:oy + self.h, ox:ox + self.w] = p['layer']
            T = transform(L, chain(p), W, H)
            o = T[..., 3] > 0; out[o] = T[o]
        hm = holes(out)
        if self.rest_holes is None: self.rest_holes = hm
        else:
            near = self.rest_holes.copy()
            for ddy, ddx in ((0,1),(0,-1),(1,0),(-1,0)): near |= np.roll(np.roll(self.rest_holes, ddy, 0), ddx, 1)
            out = nearest_fill(out, hm & ~near, out[..., 3] > 0)
        return Image.fromarray(out)
    def debug(self):
        cols = [(255,80,80),(80,200,80),(80,80,255),(230,200,0),(200,0,200),(0,200,200),(255,140,0),(120,60,0),(0,0,0),(150,150,150)]
        img = np.zeros((self.h, self.w, 4), np.uint8)
        for i, p in enumerate(self.parts):
            c = cols[i % len(cols)]; img[p['mask']] = c + (255,)
        return Image.fromarray(img)
