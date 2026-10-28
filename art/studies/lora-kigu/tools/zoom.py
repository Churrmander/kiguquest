"""Zoom a 128px sprite region with a coordinate grid, for pixel edits. Usage: python zoom.py in.png out.png x0 y0 x1 y1 [scale]"""
import sys
from PIL import Image, ImageDraw
src, dst = sys.argv[1], sys.argv[2]
x0, y0, x1, y1 = map(int, sys.argv[3:7]); k = int(sys.argv[7]) if len(sys.argv) > 7 else 12
im = Image.open(src).convert('RGB')
if im.width != 128: im = im.resize((128, 128), Image.NEAREST)
c = im.crop((x0, y0, x1, y1)).resize(((x1 - x0) * k, (y1 - y0) * k), Image.NEAREST)
out = Image.new('RGB', (c.width + 30, c.height + 16), 'white'); out.paste(c, (30, 16)); d = ImageDraw.Draw(out)
for x in range(x0, x1 + 1):
    X = 30 + (x - x0) * k; d.line([(X, 16), (X, out.height)], fill=(255, 0, 0) if x % 4 == 0 else (200, 200, 200))
    if x % 4 == 0: d.text((X + 1, 2), str(x), fill='red')
for y in range(y0, y1 + 1):
    Y = 16 + (y - y0) * k; d.line([(30, Y), (out.width, Y)], fill=(255, 0, 0) if y % 4 == 0 else (200, 200, 200))
    if y % 4 == 0: d.text((2, Y + 1), str(y), fill='red')
out.save(dst)
