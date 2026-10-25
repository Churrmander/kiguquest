# Procedural 3-frame walk cycles from the clean 32px sprites (free; same trick as src/art/human/ow.js:
# step frames drop the body 1px and lift one foot).
# usage: python walk32.py <dir> <sheet.png> id1 id2 ...
#   reads <id>-ow32.png (96x32: down, up, left) and writes <id>-walk32.png (96x96):
#   rows = down, up, left (right = mirror of left in-game); columns = stand, left-foot step, right-foot step.
import sys
from PIL import Image
import numpy as np

d, sheet, ids = sys.argv[1], sys.argv[2], sys.argv[3:]
WHITE = np.array([255, 255, 255])
LEG = 5   # rows at the bottom treated as legs/feet

def step(cell, lift_left):
    m = (cell != 255).any(-1)
    ys, xs = np.where(m)
    if not len(ys): return cell.copy()
    bot = ys.max(); top_leg = bot - LEG + 1
    leg_rows = np.arange(top_leg, bot + 1)
    lx = np.where(m[top_leg:bot + 1].any(0))[0]
    split = int(round(lx.mean())) if len(lx) else 16
    out = np.full_like(cell, 255)
    # legs: planted foot stays on the ground, the stepping foot lifts 1px (2px relative to the dropped body)
    for y in leg_rows:
        for x in range(32):
            if not m[y, x]: continue
            lifted = (x < split) == lift_left
            ny = y - 1 if lifted else y
            out[ny, x] = cell[y, x]
    # body and head drop 1px onto the legs
    for y in range(top_leg - 1, -1, -1):
        for x in range(32):
            if m[y, x] and y + 1 <= bot: out[y + 1, x] = cell[y, x]
    return out

tiles = []
for i in ids:
    strip = np.array(Image.open(f'{d}/{i}-ow32.png').convert('RGB'))
    sheet_img = np.full((96, 96, 3), 255, np.uint8)
    for r in range(3):
        cell = strip[:, r * 32:(r + 1) * 32]
        frames = [cell, step(cell, True), step(cell, False)]
        for c, f in enumerate(frames): sheet_img[r * 32:(r + 1) * 32, c * 32:(c + 1) * 32] = f
    Image.fromarray(sheet_img).save(f'{d}/{i}-walk32.png')
    tiles.append(Image.fromarray(sheet_img).resize((288, 288), Image.NEAREST))
cols = 6; rows = (len(tiles) + cols - 1) // cols
s = Image.new('RGB', (cols * 300, rows * 300), 'white')
for k, t in enumerate(tiles): s.paste(t, ((k % cols) * 300, (k // cols) * 300))
s.save(f'{d}/{sheet}'); print('ok', len(tiles))
