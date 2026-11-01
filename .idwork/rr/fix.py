import sys,pickle,re,collections; sys.path.insert(0,'/tmp/pylibs')
import xlrd
M=pickle.load(open('/tmp/rr/meta.pkl','rb'))
s=xlrd.open_workbook('/app/webapp/public/files/svodnyj-reestr-zif5-rns.xls').sheet_by_index(0)
OLD=[];grp=obj=None
for r in range(15,s.nrows):
    v=s.row_values(r)
    if v[0]=='' and str(v[1]).strip():
        t=str(v[1]).strip(); obj=t if '—' in t else obj; grp=t if '—' not in t else grp
    elif v[0]!='' and str(v[1]).strip(): OLD.append(dict(obj=obj,code=str(v[1]).strip(),book=str(v[4]).strip(),org=str(v[5]).strip()))
objs={}
for o in OLD:
    m=re.match(r'(\d{2}\.\d{2}\.\d{2}\.\d{3})',o['obj'] or '')
    if m: objs[m.group(1)]=o['obj']
def key(b):
    b=re.sub(r'бло[кк]\s*(2|ii)\b','',str(b),flags=re.I); b=re.sub(r'\d{2}\.\d{2}\.\d{3}\S*','',b)
    t=re.findall(r'\d+[А-ЯA-Z]?',b.replace(',','.').replace('_','.').replace('-','.').replace('/','.'))
    return '.'.join(x.lstrip('0') or '0' for x in t)
idx={}
for o in OLD:
    if o['book']: idx.setdefault((o['org'],key(o['book'])),o)
by_base=collections.defaultdict(list)
for f,m in M.items():
    if m['code']: by_base[(m['org'],key(m['book']).split('.')[0])].append(f)
src=collections.Counter()
for f,m in M.items():
    if m['code']: continue
    k=key(m['book'])
    o=idx.get((m['org'],k))
    if o:
        cc=re.search(r'00148\.(\d{2})[-.](\d{2}\.\d{2}\.\d{3})-(\S+)',o['code'].replace(' ',''))
        if cc: m['proj'],m['code']=cc.group(1),(cc.group(2),cc.group(3)); src['old']+=1; continue
    fam=by_base.get((m['org'],k.split('.')[0])) if k else None
    if fam:
        c=collections.Counter((M[g]['proj'],M[g]['code']) for g in fam).most_common(1)[0][0]
        m['proj'],m['code']=c; src['family']+=1
print(src, 'left', collections.Counter(m['org'] for m in M.values() if not m['code']))
pickle.dump((M,objs),open('/tmp/rr/meta2.pkl','wb'))
