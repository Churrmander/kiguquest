import sys, numpy as np
sys.path.insert(0, '/tmp/claude-0/pd/tools')
from kigu import KIGU, N
from PIL import Image
D = '/tmp/claude-0/pd/out/'; import os; os.makedirs(D, exist_ok=True)
S = 4; BG = (214, 232, 206, 255)
def old_bob(src, i, C=96):  # the current in-game idle: upper body up 1px on frames 2-4 of 6, seam doubled
    BOB = [0, 0, 1, 1, 1, 0]; b = BOB[(i // 4) % 6]
    h, w = src.shape[:2]; out = np.zeros((C, C, 4), np.uint8); ox = (C - w) // 2; oy = C - 2 - h; seam = round(h * 0.55)
    out[oy + seam:oy + h, ox:ox + w] = src[seam:]
    up = src[:seam]; m = up[..., 3] > 0; reg = out[oy - b:oy + seam - b, ox:ox + w]; reg[m] = up[m]
    for k in range(b):
        row = src[seam]; m = row[..., 3] > 0; out[oy + seam - b + k, ox:ox + w][m] = row[m]
    return Image.fromarray(out)
for name in sys.argv[1:] or KIGU:
    r, frames = KIGU[name]()
    r.debug().resize((r.w * 6, r.h * 6), Image.NEAREST).save(D + name + '-parts.png')
    fn = name if name.endswith('-back') else name + '-front'; C = r.cell[0]
    src = np.array(Image.open('/tmp/claude-0/pd/' + fn + '.png').convert('RGBA'))
    gif = []
    for i, f in enumerate(frames):
        a = np.array(f); assert not a[0].any() and not a[:, 0].any() and not a[:, -1].any(), name + ' leaves the cell'
        pair = Image.new('RGBA', (2 * C + 8, C), BG)
        pair.alpha_composite(old_bob(src, i, C), (0, 0)); pair.alpha_composite(f, (C + 8, 0))
        gif.append(pair.resize((pair.width * S, pair.height * S), Image.NEAREST).convert('RGB'))
        f.save(D + f'{name}-f{i:02d}.png')
    gif[0].save(D + name + '-idle.gif', save_all=True, append_images=gif[1:], duration=83, loop=0, disposal=1)
    # contact strip of 8 frames for the critic
    strip = Image.new('RGBA', (C * 8, C), BG)
    for k in range(8): strip.alpha_composite(frames[k * 3], (C * k, 0))
    strip.resize((strip.width * 3, strip.height * 3), Image.NEAREST).save(D + name + '-strip.png')
    print(name, 'ok')
