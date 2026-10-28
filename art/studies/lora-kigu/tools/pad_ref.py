"""Shrink a reference sprite inside its canvas so img2img leaves a margin (stops ears, capes and tails being cut at the edge).
Usage: python pad_ref.py in.png out.png [--scale 0.82]"""
import sys
from PIL import Image
src, dst = sys.argv[1], sys.argv[2]
k = float(sys.argv[sys.argv.index('--scale') + 1]) if '--scale' in sys.argv else 0.82
im = Image.open(src).convert('RGB')
W, H = im.size
small = im.resize((round(W * k), round(H * k)), Image.NEAREST)
can = Image.new('RGB', (W, H), 'white')
can.paste(small, ((W - small.width) // 2, (H - small.height) // 2))
can.save(dst)
