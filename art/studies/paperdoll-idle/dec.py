import json,base64
from PIL import Image
def decode(s):
    pal=[tuple(int(s['pal'][i+k:i+k+2],16) for k in (0,2,4)) for i in range(0,len(s['pal']),6)]
    runs=base64.b64decode(s['rle']); im=Image.new('RGBA',(s['w'],s['h'])); px=im.load(); p=0
    for i in range(0,len(runs),2):
        c,n=runs[i],runs[i+1]
        for k in range(n):
            if c: px[(p+k)%s['w'],(p+k)//s['w']]=pal[c-1]+(255,)
        p+=n
    return im
if __name__=='__main__':
    D=json.load(open('/tmp/claude-0/pd/sprites.json'))
    for k in ['kyuubelle','konko','jerbi']:
        for v in ['front','back']:
            im=decode(D[k][v]); im.save(f'/tmp/claude-0/pd/{k}-{v}.png')
            bg=Image.new('RGBA',im.size,(200,230,200,255)); bg.alpha_composite(im)
            # grid overlay every 10 px
            big=bg.resize((im.width*8,im.height*8),Image.NEAREST)
            from PIL import ImageDraw; d=ImageDraw.Draw(big)
            for x in range(0,im.width,10): d.line([(x*8,0),(x*8,big.height)],fill=(255,0,0,255))
            for y in range(0,im.height,10): d.line([(0,y*8),(big.width,y*8)],fill=(255,0,0,255))
            big.save(f'/tmp/claude-0/pd/{k}-{v}-grid.png')
