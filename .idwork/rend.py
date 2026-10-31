import pickle,sys
from PIL import Image, ImageDraw
def render(pg,box,out,s=2.0,grid=50,filt=None):
    d=pickle.load(open(f'/app/webapp/.idwork/pg{pg}.pkl','rb'))
    x0,y0,x1,y1=box
    im=Image.new('RGB',(int((x1-x0)*s),int((y1-y0)*s)),'white'); dr=ImageDraw.Draw(im)
    T=lambda x,y:((x-x0)*s,(y1-y)*s)
    if grid:
        for x in range(int(x0//grid*grid),int(x1)+1,grid):
            dr.line([T(x,y0),T(x,y1)],fill=(225,225,225)); dr.text((T(x,y1)[0]+2,2),str(x),fill=(150,0,150))
        for y in range(int(y0//grid*grid),int(y1)+1,grid):
            dr.line([T(x0,y),T(x1,y)],fill=(225,225,225)); dr.text((2,T(x0,y)[1]+2),str(y),fill=(150,0,150))
    for p in d['paths']:
        if filt and not filt(p): continue
        c=p['sc'] if p['stroke'] else p['fc']
        if c is None: continue
        for sub in p['p']:
            if len(sub)>1: dr.line([T(x,y) for x,y in sub],fill=c,width=1)
    im.save(out)
if __name__=='__main__':
    pg=int(sys.argv[1]); box=list(map(float,sys.argv[2:6])); render(pg,box,sys.argv[6],float(sys.argv[7]) if len(sys.argv)>7 else 2)
