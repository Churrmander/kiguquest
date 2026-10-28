"""Hue-shift the costume of a house AutoSprite sprite so it can seed img2img for a new Kigu.

Usage: python recolour_ref.py in.png out.png --from 30 55 --to 140 [--sat 1.0]
Pixels whose hue (degrees) is in the --from band move to --to; skin (reddish, bright) and dark outline stay put.
"""
import argparse, colorsys
import numpy as np
from PIL import Image

ap = argparse.ArgumentParser()
ap.add_argument("src"); ap.add_argument("dst")
ap.add_argument("--from", dest="band", type=float, nargs=2, default=(30, 55))
ap.add_argument("--to", type=float, required=True)
ap.add_argument("--grey", type=float, default=0, help="also tint grey costume pixels (saturation < 0.15) to --to with this saturation")
ap.add_argument("--sat", type=float, default=1.0, help="saturation multiplier for moved pixels")
ap.add_argument("--keep-skin", action="store_true", help="leave pale bright pixels (skin, glints) alone")
ap.add_argument("--val", type=float, default=1.0, help="brightness multiplier for moved pixels")
a = ap.parse_args()

im = np.array(Image.open(a.src).convert("RGB")).astype(float) / 255
out = im.copy()
h, w, _ = im.shape
for y in range(h):
    for x in range(w):
        r, g, b = im[y, x]
        if min(r, g, b) > 0.94:
            continue
        hh, ss, vv = colorsys.rgb_to_hsv(r, g, b)
        deg = hh * 360
        if a.grey and ss < 0.15 and 0.3 < vv < 0.93:
            out[y, x] = colorsys.hsv_to_rgb(a.to / 360, a.grey, vv)
            continue
        if a.keep_skin and ss < 0.38 and vv > 0.85:
            continue
        if a.band[0] <= deg <= a.band[1] and vv > 0.3 and ss > 0.08:
            nh = ((a.to + (deg - sum(a.band) / 2)) % 360) / 360
            out[y, x] = colorsys.hsv_to_rgb(nh, min(1, ss * a.sat), min(1, vv * a.val))
Image.fromarray((out * 255).round().astype(np.uint8)).save(a.dst)
print(a.dst)
