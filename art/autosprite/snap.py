# usage: python snapsheet2.py <dir> <out.png> <suffix> name1 name2 ...
# needs <name>.png (base, palette source) and <name>-<suffix>.png; writes <name>-<suffix>-px.png, a sheet, and an edge report
import sys
from PIL import Image
import numpy as np
d,out,suf,names=sys.argv[1],sys.argv[2],sys.argv[3],sys.argv[4:]
g=8; tiles=[]
for n in names:
  pal=np.array([c for _,c in Image.open(f'{d}/{n}.png').convert('RGB').getcolors(1<<20)]).astype(float)
  p=np.array(Image.open(f'{d}/{n}-{suf}.png').convert('RGB')).astype(float)
  ink=p.min(-1)<240; ys,xs=np.where(ink); H0,W0=ink.shape
  m=min(xs.min(),ys.min(),W0-1-xs.max(),H0-1-ys.max()) if len(xs) else 999
  if m<16: print('EDGE',n,int(m))
  H=p.shape[0]//g*g;W=p.shape[1]//g*g
  blk=np.median(p[:H,:W].reshape(H//g,g,W//g,g,3),axis=(1,3))
  f=blk.reshape(-1,3); idx=((f[:,None]-pal[None])**2).sum(-1).argmin(1)
  im=Image.fromarray(pal[idx].reshape(blk.shape).astype(np.uint8)).resize((W,H),Image.NEAREST)
  im.save(f'{d}/{n}-{suf}-px.png'); tiles.append(im.resize((512,512),Image.NEAREST))
cols=min(len(tiles),5); rows=(len(tiles)+cols-1)//cols
s=Image.new('RGB',(cols*512,rows*512),'white')
for i,t in enumerate(tiles): s.paste(t,((i%cols)*512,(i//cols)*512))
s.save(f'{d}/{out}'); print('ok',len(tiles))
