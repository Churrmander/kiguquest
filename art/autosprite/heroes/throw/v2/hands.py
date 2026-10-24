# Frame 3 hands, original generated art. Draco untouched; Dahlia's hand is a plain left-right flip of its own box.
import sys
from PIL import Image, ImageOps
d = sys.argv[1]
Image.open(f'{d}/draco-torso-t3-gen.png').save(f'{d}/draco-torso-t3.png')
im = Image.open(f'{d}/dahlia-torso-t3-gen.png').convert('RGBA')
box = (78, 30, 88, 39)                     # palm + fingers, above the wrist
hand = ImageOps.mirror(im.crop(box))
im.paste((0, 0, 0, 0), box); im.alpha_composite(hand, box[:2])
im.save(f'{d}/dahlia-torso-t3.png')
print('ok')
