import pickle, math, sys
sys.path.insert(0,'/app/webapp/.idwork/gen')
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from matplotlib.collections import LineCollection
from matplotlib.patches import Polygon, Rectangle, Circle
from matplotlib.path import Path
import ezdxf
from ezdxf.enums import TextEntityAlignment

from matplotlib import font_manager as _fm
from matplotlib.textpath import TextPath
from matplotlib.font_manager import FontProperties
CF='/usr/share/fonts/opensans/OpenSans-CondensedLightItalic.ttf'
CFR='/usr/share/fonts/opensans/OpenSans-CondensedRegular.ttf'
CFB='/usr/share/fonts/opensans/OpenSans-CondensedBold.ttf'
_fm.fontManager.addfont(CF); _fm.fontManager.addfont(CFR); _fm.fontManager.addfont(CFB)
FP_R=FontProperties(fname=CFR)
FP_C=FontProperties(fname=CF)
FONT='DejaVu Sans'
plt.rcParams['font.family']=FONT
def tw(s,fp=FP_C):
    return TextPath((0,0),s,size=1,prop=fp).get_extents().width
PT=72/25.4

def cmap(c):
    if c is None: return None
    if c==(255,0,0): return ('ducts','#000000',0.45)
    if c==(160,224,0): return ('insul','#2e7d32',0.18)
    if c in [(63,48,138),(56,62,66),(151,151,247),(99,125,150),(20,99,20),(132,76,130)]: return ('equip','#8a8a8a',0.13)
    if c in [(0,255,255),(0,255,0),(255,255,0),(254,203,0),(173,50,63),(158,65,65)]: return ('valve','#3a3a3a',0.2)
    if c==(242,198,136): return ('valve','#3a3a3a',0.2)
    if c==(0,0,255): return ('pipe','#1f3a93',0.25)
    return ('ann','#000000',0.13)

class Sheet:
    """A3 landscape, mm"""
    def __init__(self,W=420,H=297):
        self.W,self.H=W,H
        self.fig=plt.figure(figsize=(W/25.4,H/25.4))
        self.ax=self.fig.add_axes([0,0,1,1]); self.ax.set_xlim(0,W); self.ax.set_ylim(0,H); self.ax.axis('off')
        self.doc=ezdxf.new('R2010',setup=True); self.msp=self.doc.modelspace()
        st=self.doc.styles.get('Standard') if 'Standard' in self.doc.styles else None
        if 'GOST' not in self.doc.styles: self.doc.styles.add('GOST',font='isocpeur.ttf')
        for n,c in [('РАМКА',7),('ВОЗДУХОВОДЫ',7),('ИЗОЛЯЦИЯ',3),('ОБОРУДОВАНИЕ',8),('АРМАТУРА',8),('ТРУБОПРОВОД',5),('ОБОЗНАЧЕНИЯ',7),('КС-6а',30),('ПОЗИЦИИ',1),('ТЕКСТ',7)]:
            if n not in self.doc.layers: self.doc.layers.add(n,color=c)
    LMAP={'ducts':'ВОЗДУХОВОДЫ','insul':'ИЗОЛЯЦИЯ','equip':'ОБОРУДОВАНИЕ','valve':'АРМАТУРА','pipe':'ТРУБОПРОВОД','ann':'ОБОЗНАЧЕНИЯ'}
    def line(self,pts,lw=0.25,color='k',layer='РАМКА',ls='-',z=3,dxf=True):
        xs=[p[0] for p in pts]; ys=[p[1] for p in pts]
        self.ax.plot(xs,ys,color=color,lw=lw*PT,ls=ls,solid_capstyle='butt',zorder=z)
        if dxf: self.msp.add_lwpolyline(pts,dxfattribs={'layer':layer,'lineweight':int(round(lw*100/5))*5 if lw>=0.13 else 13})
    def rect(self,x,y,w,h,lw=0.25,layer='РАМКА',fill=None,z=3):
        if fill: self.ax.add_patch(Rectangle((x,y),w,h,facecolor=fill,edgecolor='none',zorder=z-1))
        self.line([(x,y),(x+w,y),(x+w,y+h),(x,y+h),(x,y)],lw,layer=layer,z=z)
    def text(self,x,y,s,h=2.5,ha='left',va='baseline',rot=0,layer='ТЕКСТ',bold=False,italic=False,color='k',z=5,wrap=None):
        s=s.replace('⌀','Ø')
        fp=FontProperties(fname=CFB if bold else CFR,size=h*PT/0.72)
        self.ax.text(x,y,s,fontproperties=fp,ha=ha,va=va,rotation=rot,color=color,zorder=z,linespacing=1.3)
        lines=s.split('\n')
        for i,l in enumerate(lines):
            if not l: continue
            dy=-i*h*1.6
            if va=='center': dy+= (len(lines)-1)*h*0.8 - h/2
            elif va=='top': dy-=h
            if rot==90:
                px,py=x-dy,y
            else: px,py=x,y+dy
            al={'left':TextEntityAlignment.LEFT,'center':TextEntityAlignment.CENTER,'right':TextEntityAlignment.RIGHT}[ha]
            t=self.msp.add_text(l.replace('⌀','%%c').replace('Ø','%%c'),height=h,rotation=rot,dxfattribs={'layer':layer,'style':'GOST','width':0.8})
            t.set_placement((px,py),align=al)
    def import_rd(self,pkl,region,box,dest,keep_text=True,drop_text=()):
        """region: list of polygon pts in rd coords; box rd bbox (x0,y0,x1,y1); dest (X,Y,W,H) mm. returns transform"""
        d=pickle.load(open(pkl,'rb'))
        P=Path(region)
        x0,y0,x1,y1=box; X,Y,W,H=dest
        k=min(W/(x1-x0),H/(y1-y0))
        ox=X+(W-(x1-x0)*k)/2; oy=Y+(H-(y1-y0)*k)/2
        T=lambda x,y:(ox+(x-x0)*k, oy+(y-y0)*k)
        self.T=T; self.k=k
        groups={}
        n_before=len(self.ax.patches)+len(self.ax.collections)+len(self.ax.texts)
        clip=Rectangle((X,Y),W,H,transform=self.ax.transData,fill=False,edgecolor='none')
        self.ax.add_patch(clip)
        inside=lambda q:X<=q[0]<=X+W and Y<=q[1]<=Y+H
        self.rd_text_boxes=[]
        from glyph_labels import GL
        tb=[t['bb'] for t in d['texts'] if t['s'].strip()]+[(g[0]-6,g[1]-2,g[2]+2,g[3]+2) for g in GL]
        def in_text(c):
            for l,b,r,tp in tb:
                if l-1.5<=c[0]<=r+1.5 and b-2<=c[1]<=tp+3: return True
            return False
        # diameter glyphs drawn as filled shapes left of numeric texts
        dia_txt=set()
        fills=[]
        for p in d['paths']:
            if p['fill'] and not p['stroke'] and cmap(p['sc'] if p['stroke'] else p['fc']) and cmap(p['fc'])[0]=='ann':
                xs=[x for s_ in p['p'] for x,y in s_]; ys=[y for s_ in p['p'] for x,y in s_]
                if xs: fills.append(((min(xs)+max(xs))/2,(min(ys)+max(ys))/2))
        dia_pts=set()
        for i,t in enumerate(d['texts']):
            st=t['s'].strip()
            if not st or not st[0].isdigit() or round(t['ang'])!=0: continue
            l,b,r_,tp=t['bb']; hh=max(tp-b,4)
            if any(o is not t and o['s'].strip() and abs(o['y']-t['y'])<1.5 and -1<t['bb'][0]-o['bb'][2]<hh*1.8 for o in d['texts']): continue
            for f in fills:
                if l-1.6*hh<=f[0]<=l+0.3 and b-0.4*hh<=f[1]<=tp+0.4*hh:
                    dia_txt.add(i); dia_pts.add(f)
        self._dia=dia_txt
        for p in d['paths']:
            subs=[s for s in p['p'] if len(s)>1]
            if not subs: continue
            xs=[x for s in subs for x,y in s]; ys=[y for s in subs for x,y in s]
            c=((min(xs)+max(xs))/2,(min(ys)+max(ys))/2)
            if not P.contains_point(c): continue
            if max(xs)-min(xs)>400 or max(ys)-min(ys)>700: continue
            col=p['sc'] if p['stroke'] else p['fc']
            if p['fill'] and not p['stroke'] and p['fc']==(0,0,0) and max(xs)-min(xs)<9 and max(ys)-min(ys)<9:
                if keep_text and (in_text(c) or c in dia_pts): continue
                for s_ in subs:
                    if len(s_)>2: groups.setdefault(('ann','#000000',0.1),[]).append([T(*q) for q in s_])
                continue
            m=cmap(col)
            if m and m[0]=='ann' and keep_text and max(xs)-min(xs)<8 and max(ys)-min(ys)<8 and in_text(c): continue
            if m is None: continue
            key,color,lw=m
            if p['fill'] and not p['stroke']:
                if key=='ann':
                    if keep_text and (in_text(c) or c in dia_pts): continue
                    for s_ in subs:
                        if len(s_)>2: groups.setdefault(('ann','#000000',0.1),[]).append([T(*q) for q in s_])
                    continue
                for s in subs:
                    if len(s)>2:
                        pg=Polygon([T(*q) for q in s],closed=True,facecolor=color,edgecolor='none',zorder=2,alpha=0.85)
                        self.ax.add_patch(pg); pg.set_clip_path(clip)
                continue
            for s in subs:
                groups.setdefault((key,color,lw),[]).append([T(*q) for q in s])
        for (key,color,lw),segs in groups.items():
            lc=LineCollection(segs,colors=color,linewidths=lw*PT,zorder=3 if key=='ducts' else 2,linestyles='-')
            self.ax.add_collection(lc); lc.set_clip_path(clip)
            for s in segs:
                s2=[q for q in s if inside(q)]
                if len(s2)>1: self.msp.add_lwpolyline(s2,dxfattribs={'layer':self.LMAP[key]})
        if keep_text:
            for g in GL:
                gx0,gy0,gx1,gy1,lab=g
                if not P.contains_point(((gx0+gx1)/2,(gy0+gy1)/2)): continue
                X1,Y1=T(gx0,gy0+0.3)
                if not inside((X1,Y1)): continue
                fs_mm=min((gx1-gx0)*k/(tw(lab) or 1),(gy1-gy0)*k*1.25,3.2)
                self.ax.text(X1,Y1,lab,fontproperties=FontProperties(fname=CF,size=fs_mm*PT),zorder=6,ha='left',va='baseline')
                tt=self.msp.add_text(lab.replace('Ø','%%c'),height=fs_mm*0.7,dxfattribs={'layer':'ОБОЗНАЧЕНИЯ','style':'GOST','width':0.8}); tt.set_placement((X1,Y1))
            seen=[]
            for ti,t in enumerate(d['texts']):
                s=t['s'].strip()
                if any(s==a and abs(t['x']-x)<1.5 and abs(t['y']-y)<1.5 for a,x,y in seen): continue
                seen.append((s,t['x'],t['y']))
                if ti in self._dia: s='Ø'+s
                if not s or not P.contains_point((t['x'],t['y'])): continue
                if any(dt in s for dt in drop_text): continue
                st=s.replace('⌀','Ø')
                bw=(t['bb'][2]-t['bb'][0]) if round(t['ang'])==0 else (t['bb'][3]-t['bb'][1])
                X1,Y1=T(t['x'],t['y'])
                if ti in self._dia:
                    hh=t['bb'][3]-t['bb'][1]; X1-=hh*0.95*k; bw+=hh*0.95
                w1=tw(st) or 1
                fs_mm=min(bw*k/w1, t['h']*k*1.25, 3.2)
                if not inside((X1,Y1)): continue
                self.ax.text(X1,Y1,st,fontproperties=FontProperties(fname=CF,size=fs_mm*PT),rotation=round(t['ang']),zorder=6,ha='left',va='baseline')
                tt=self.msp.add_text(st.replace('Ø','%%c'),height=fs_mm*0.7,rotation=round(t['ang']),dxfattribs={'layer':'ОБОЗНАЧЕНИЯ','style':'GOST','width':0.8})
                tt.set_placement((X1,Y1))
                self.rd_text_boxes.append(t['bb'])
        return T
    def highlight(self,pts_rd,width=2.6,color='#ff9800',alpha=0.45,label=None):
        pts=[self.T(*p) for p in pts_rd]
        self.ax.plot([p[0] for p in pts],[p[1] for p in pts],color=color,lw=width*PT,alpha=alpha,solid_capstyle='round',solid_joinstyle='round',zorder=1)
        self.msp.add_lwpolyline(pts,dxfattribs={'layer':'КС-6а','const_width':width})
    def balloon(self,n,target_rd,offset,r=2.6):
        tx,ty=self.T(*target_rd); bx,by=tx+offset[0],ty+offset[1]
        d=math.hypot(bx-tx,by-ty) or 1
        ex,ey=bx-(bx-tx)/d*r, by-(by-ty)/d*r
        self.line([(tx,ty),(ex,ey)],lw=0.18,layer='ПОЗИЦИИ',z=7)
        self.ax.add_patch(Circle((tx,ty),0.45,color='k',zorder=7))
        self.ax.add_patch(Circle((bx,by),r,facecolor='white',edgecolor='k',lw=0.25*PT,zorder=7))
        self.msp.add_circle((bx,by),r,dxfattribs={'layer':'ПОЗИЦИИ'})
        self.text(bx,by-1.25,str(n),h=2.5,ha='center',layer='ПОЗИЦИИ',z=8)
    def save(self,pdf,dxf):
        self.fig.savefig(pdf); plt.close(self.fig)
        self.doc.saveas(dxf)

def frame(S):
    S.rect(20,5,395,287,lw=0.6)
    S.rect(5,5,415-5+0,287,lw=0) if False else None

def table(S,x,ytop,cols,rows,head,h=2.0,rowh=4.2,headh=8):
    """cols: list widths. rows: list of tuples(str). returns bottom y"""
    W=sum(cols)
    def wrap(s,w):
        out=[]
        sc=h/0.72
        for para in str(s).replace('⌀','Ø').split('\n'):
            cur=''
            for word in para.split(' '):
                t=(cur+' '+word).strip()
                if tw(t,FP_R)*sc<=w-1.2 or not cur: cur=t
                else: out.append(cur); cur=word
            out.append(cur)
        return out
    y=ytop
    S.rect(x,y-headh,W,headh,lw=0.5)
    cx=x
    for w,hd in zip(cols,head):
        S.line([(cx,y),(cx,y-headh)],lw=0.5)
        L=wrap(hd,w)
        for i,l in enumerate(L):
            S.text(cx+w/2,y-headh/2+(len(L)-1)*h*0.75-i*h*1.5-h/2,l,h=h,ha='center')
        cx+=w
    y-=headh
    for r in rows:
        if r and r[0]=='__section__':
            rh=rowh
            S.rect(x,y-rh,W,rh,lw=0.25)
            S.text(x+W/2,y-rh/2-h/2,r[1],h=h,ha='center',bold=True)
            y-=rh; continue
        wr=[wrap(v,w-1.5) for v,w in zip(r,cols)]
        n=max(len(a) for a in wr)
        rh=max(rowh,n*h*1.5+1.4)
        cx=x
        for i,(w,L) in enumerate(zip(cols,wr)):
            S.line([(cx,y),(cx,y-rh)],lw=0.25)
            for j,l in enumerate(L):
                if i in (0,2,3) and len(L)==1:
                    S.text(cx+w/2,y-rh/2-h/2,l,h=h,ha='center')
                else:
                    S.text(cx+0.8,y-1.0-h-j*h*1.5,l,h=h)
            cx+=w
        S.line([(cx,y),(cx,y-rh)],lw=0.25)
        S.line([(x,y-rh),(x+W,y-rh)],lw=0.25)
        y-=rh
    S.line([(x,ytop),(x,y)],lw=0.5); S.line([(x+W,ytop),(x+W,y)],lw=0.5)
    S.line([(x,y),(x+W,y)],lw=0.5)
    return y

def stamp(S,code,obj,title,org,sheet='1',sheets='1',signers=(),stage='Р'):
    x0,y0=230,5; W=185
    S.rect(x0,y0,W,55,lw=0.6)
    xs=[x0,x0+7,x0+17,x0+27,x0+42,x0+57,x0+65]
    for i in range(1,11):
        yy=y0+5*i
        S.line([(x0,yy),(x0+65,yy)],lw=0.6 if i in (5,6) else 0.18)
    for xx in xs[1:]: S.line([(xx,y0+25),(xx,y0+55)],lw=0.6)
    for xx in [x0+17,x0+42,x0+57]: S.line([(xx,y0),(xx,y0+25)],lw=0.6)
    for a,b,hd in zip(xs[:-1],xs[1:],['Изм.','Кол.уч','Лист','№ док.','Подп.','Дата']):
        S.text((a+b)/2,y0+26.3,hd,h=1.7,ha='center')
    for i,(role,name,date) in enumerate(signers[:5]):
        yy=y0+25-5*(i+1)+1.4
        S.text(x0+0.7,yy,role,h=1.7); S.text(x0+17.7,yy,name,h=1.7); S.text(x0+57.4,yy,date,h=1.25)
    S.line([(x0+65,y0),(x0+65,y0+55)],lw=0.6)
    S.line([(x0+65,y0+40),(x0+W,y0+40)],lw=0.6)
    S.line([(x0+65,y0+25),(x0+W,y0+25)],lw=0.6)
    S.line([(x0+135,y0+15),(x0+W,y0+15)],lw=0.6)
    S.line([(x0+135,y0),(x0+135,y0+25)],lw=0.6)
    S.line([(x0+135,y0+20),(x0+W,y0+20)],lw=0.6)
    for xx in [x0+150,x0+165]: S.line([(xx,y0+15),(xx,y0+25)],lw=0.6)
    S.text(x0+125,y0+46,code,h=3.6,ha='center')
    S.text(x0+125,y0+32.5,obj,h=2.0,ha='center',va='center')
    S.text(x0+100,y0+12.5,title,h=2.1,ha='center',va='center')
    S.text(x0+142.5,y0+21.3,'Стадия',h=1.7,ha='center'); S.text(x0+157.5,y0+21.3,'Лист',h=1.7,ha='center'); S.text(x0+175,y0+21.3,'Листов',h=1.7,ha='center')
    S.text(x0+142.5,y0+16.2,stage,h=2.5,ha='center'); S.text(x0+157.5,y0+16.2,sheet,h=2.5,ha='center'); S.text(x0+175,y0+16.2,sheets,h=2.5,ha='center')
    S.text(x0+160,y0+7.5,org,h=2.8,ha='center',va='center',bold=True)
