# Frame 3 hands, original generated art. Draco untouched. Dahlia: only her thumb moves, from the right side of the
# hand to the left side, reusing the thumb's own skin colour; the rest of the hand is the original pixels.
import sys
from PIL import Image
d = sys.argv[1]
Image.open(f'{d}/draco-torso-t3-gen.png').save(f'{d}/draco-torso-t3.png')
im = Image.open(f'{d}/dahlia-torso-t3-gen.png').convert('RGBA'); px = im.load()
O = (7, 6, 6, 255); L = px[85, 35]; CLEAR = (0, 0, 0, 0)
# take the thumb off the right side and close the edge
for p in ((86, 34), (87, 34), (87, 35), (86, 36)): px[p] = CLEAR
px[86, 35] = O
# put it on the left side, pointing left
for p in ((79, 32), (80, 32), (78, 33), (79, 34)): px[p] = O
for p in ((79, 33), (80, 33), (81, 33), (80, 34)): px[p] = L
im.save(f'{d}/dahlia-torso-t3.png')
print('ok')
