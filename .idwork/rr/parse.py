import re,pickle,collections,os
d=pickle.load(open('/tmp/rr/raw.pkl','rb'))
def s(x):
    if x is None: return ''
    if isinstance(x,float) and x.is_integer(): x=int(x)
    if hasattr(x,'strftime'): return x.strftime('%d.%m.%Y')
    return re.sub(r'\s+',' ',str(x)).strip()
STOP=re.compile(r'^(сдал|проверил|принял|представитель (подряд|заказ|генпод|ск|стро|техн|ооо|ао)|передал|итого)',re.I)
def header(rows):
    for i,r in enumerate(rows[:70]):
        cells=[s(c).lower() for c in r]
        nm=[j for j,c in enumerate(cells) if (('наименование' in c and 'объект' not in c) or 'состав документ' in c) and len(c)<120]
        if not nm or sum(1 for c in cells if c)<3: continue
        cols={'name':nm[0]}
        for j,c in enumerate(cells):
            if j==nm[0] or not c: continue
            if 'org' not in cols and re.search(r'организац|кем выдан|составивш|выдавш',c): cols['org']=j
            elif 'sh' not in cols and re.search(r'кол.*лист|листов|кол-во|количество',c): cols['sh']=j
            elif 'num' not in cols and j>nm[0] and re.search(r'№|номер|реквизит|шифр|обозначен|дата',c) and 'п/п' not in c and 'по списку' not in c: cols['num']=j
        for j in range(nm[0]):
            if cells[j] and ('№' in cells[j] or 'п/п' in cells[j] or 'раз' in cells[j]): cols['pp']=j
        return i,cols
    return None,None
def rowsof(rows,i,cols):
    out=[]
    for r in rows[i+1:]:
        g=lambda k: s(r[cols[k]]) if k in cols and cols[k]<len(r) else ''
        name=g('name')
        if not name:
            lo=cols.get('pp',-1)+1; hi=cols.get('num',cols.get('org',len(r)))
            for j in range(lo,min(hi,len(r))):
                if s(r[j]): name=s(r[j]); break
        first=' '.join(s(c) for c in r[:4] if s(c))
        if STOP.match(first) or STOP.match(name): break
        if not name: continue
        if re.fullmatch(r'[\d\s.,]+',name) and (not g('num') or re.fullmatch(r'\d+',g('num'))): continue
        if name.lower().startswith('наименование'): continue
        out.append(dict(pp=g('pp'),name=name,num=g('num'),org=g('org'),sh=g('sh')))
    return out
SKIP=re.compile(r'данные|титул|^исх|проверк|копия|стар|\(\d\)|экз(емпляр)? ?[2-9]|[2-9] ?экз|^ф\d|спека|каб\.? ?жур|^акт|^аоср|^вип|протокол|журнал|ведомост|^ос-|^ф\.',re.I)
res={}; bad=[]
for f,shs in d.items():
    cands=[]
    for pas in (0,1):
      if cands: break
      for n,rows in shs:
        if pas==0 and len(shs)>1 and SKIP.search(n): continue
        i,cols=header(rows)
        if i is None and n=='docx':
            i,cols=-1,{'pp':0,'name':1,'num':2,'org':3,'sh':4}; rows=[r for r in rows if len(r)>=5]
        if i is None: continue
        rr=rowsof(rows,i,cols)
        if not rr: continue
        hdr=' | '.join(s(c) for r in rows[:max(i,0)] for c in r if s(c))
        cands.append((len(rr)+(1000 if re.search(r'реестр',n,re.I) else 0),n,cols,rr,hdr))
    if not cands: bad.append(f); continue
    cands.sort(key=lambda c:-c[0]); res[f]=cands[0]
pickle.dump(res,open('/tmp/rr/parsed.pkl','wb'))
print(len(res),len(bad))
