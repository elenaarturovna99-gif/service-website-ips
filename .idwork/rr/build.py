import sys,pickle,re,collections,hashlib; sys.path.insert(0,'/tmp/pylibs')
import openpyxl,xlrd
from openpyxl.styles import Font,Alignment,Border,Side,PatternFill
M,objs=pickle.load(open('/tmp/rr/meta2.pkl','rb')); P=pickle.load(open('/tmp/rr/parsed.pkl','rb'))
s=xlrd.open_workbook('/app/webapp/public/files/svodnyj-reestr-zif5-rns.xls').sheet_by_index(0)
OLD=[]; obj=None
for r in range(15,s.nrows):
    v=s.row_values(r)
    if v[0]=='' and '—' in str(v[1]): obj=str(v[1]).strip()
    elif v[0]!='' and str(v[1]).strip(): OLD.append((obj,str(v[1]).strip(),str(v[4]).strip(),str(v[5]).strip()))
def nat(x): return [int(t) if t.isdigit() else t for t in re.split(r'(\d+)',x or '')]
def norm(c): m=re.search(r'(\d{2}\.\d{2}\.\d{3})[-.]?\s*(\S+)',c.replace(' ','')); return (m.group(1),re.sub(r'IFC.*|_.*','',m.group(2))) if m else None
corder={}
for i,(o,c,b,org) in enumerate(OLD):
    n=norm(c)
    if n and n not in corder: corder[n]=i
# fix invalid / leftover codes
for f,m in M.items():
    if m['code'] and m['code'][0][:2] not in ('01','02','03','04','05','06'): m['code']=None
fam=collections.defaultdict(list)
def bkey(b): 
    t=re.findall(r'\d+',re.sub(r'бло[кк]\s*(2|ii)\b','',b,flags=re.I)); return t[0] if t else ''
for f,m in M.items():
    if m['code']: fam[(m['org'],bkey(m['book']))].append(f)
for f,m in M.items():
    if not m['code'] and m['book']:
        g=fam.get((m['org'],bkey(m['book'])))
        if g: c=collections.Counter((M[x]['proj'],M[x]['code']) for x in g).most_common(1)[0][0]; m['proj'],m['code']=c
    if not m['code'] and 'Книга 145.1' in m['book']: m['proj'],m['code']='25',('01.06.031','С.СТН1')
# keep ZIF-5 only
keep={f:m for f,m in M.items() if m['proj']=='25'}
seen=set(); groups=collections.defaultdict(list)
for f,m in keep.items():
    h=hashlib.md5(repr([(r['name'],r['num']) for r in P[f][3]]).encode()).hexdigest()
    if (m['org'],h) in seen: continue
    seen.add((m['org'],h))
    groups[('25.'+m['code'][0]) if m['code'] else '~'].append(f)
order=[]
for o,*_ in OLD:
    k=re.match(r'(\d{2}\.\d{2}\.\d{2}\.\d{3})',o or '')
    if k and k.group(1) not in order: order.append(k.group(1))
keys=sorted(groups,key=lambda k:(1,) if k=='~' else (0,nat(k)))
th=Side(style='thin'); B=Border(left=th,right=th,top=th,bottom=th); F='Times New Roman'
wb=openpyxl.Workbook(); ws=wb.active; ws.title='Сводный реестр'
for i,w in enumerate([7,62,30,26,8,22,18]): ws.column_dimensions['ABCDEFG'[i]].width=w
def cell(r,c,v,bold=False,size=11,al='left',fill=None,border=True,wrap=True):
    x=ws.cell(r,c,v); x.font=Font(name=F,size=size,bold=bold); x.alignment=Alignment(horizontal=al,vertical='center',wrap_text=wrap)
    if border: x.border=B
    if fill: x.fill=PatternFill('solid',fgColor=fill)
def band(r,text,fill,size=12,h=None):
    ws.merge_cells(start_row=r,start_column=1,end_row=r,end_column=7)
    for j in range(1,8):
        c=ws.cell(r,j); c.border=B; c.fill=PatternFill('solid',fgColor=fill)
    cell(r,1,text,True,size,'left',fill,wrap=True)
    if h: ws.row_dimensions[r].height=h
ws.merge_cells('A1:B1'); cell(1,1,'Заказчик: АО «Полюс Красноярск»',border=False)
ws.merge_cells('C1:G1'); cell(1,3,'Строительство: ЗИФ-5 по переработке руды месторождения «Благодатное» производительностью 8,3 млн т/год',border=False); ws.row_dimensions[1].height=32
ws.merge_cells('A3:G3'); cell(3,1,'СВОДНЫЙ РЕЕСТР',True,14,'center',border=False)
ws.merge_cells('A4:G4'); cell(4,1,'реестров исполнительной документации на папки (книги) по объектам согласно РНС',True,12,'center',border=False)
for j,h in enumerate(['№ п/п','Наименование документа','№ чертежа, акта, разрешения, журнала и др.','Организация, составившая документ','Кол-во листов','№ книги (папки)','Подрядчик'],1): cell(6,j,h,True,10,'center')
ws.row_dimensions[6].height=45
for j in range(1,8): cell(7,j,j,False,9,'center')
ws.freeze_panes='A8'; ws.print_title_rows='6:7'
def tonum(x):
    try: return float(str(x).replace(',','.'))
    except: return None
r=8; last=None; n=0; LIST=[]
def fkey(f):
    m=M[f]; c=(m['code'][0],m['code'][1]) if m['code'] else None
    return (corder.get(c,10**6), m['code'][1] if m['code'] else '', nat(m['book'] or m['fn']))
for k in keys:
    if k=='~': grp,title='Общая документация','Общая документация подрядчика (без шифра РД)'
    else: grp,title=k[:8],objs.get(k,k)
    if grp!=last: band(r,grp,'BDD7EE',h=20); r+=1; last=grp
    band(r,title,'DDEBF7',h=20); r+=1
    for f in sorted(groups[k],key=fkey):
        m=M[f]; rows=P[f][3]; n+=1
        code=f"Р-П-00148.25-{m['code'][0]}-{m['code'][1]}" if m['code'] else ''
        bk=m['book'] or re.sub(r'\.(xlsx?|xlsm|xlsb|docx)$','',m['fn'])
        band(r,f"Реестр ИД на папку {n}: {bk}"+(f" — {code}" if code else ''),'FFF2CC',11,h=20); r+=1
        sh_tot=0
        for x in rows:
            sh=tonum(x['sh']); sh_tot+=sh or 0
            vals=[x['pp'],x['name'],x['num'],x['org'],(int(sh) if sh is not None and sh==int(sh) else (sh if sh is not None else x['sh'])),bk,m['org']]
            for j,v in enumerate(vals,1): cell(r,j,v,False,10,'left' if j in(2,3,4) else 'center')
            r+=1
        LIST.append((n,title,code,bk,m['org'],len(rows),int(sh_tot),f[3:]))
r+=1
for lab,role in [('Сдал:','Представитель подрядчика:'),('Проверил:','Представитель СК:'),('Проверил:','Представитель ИТДО:'),('Принял:','Представитель Заказчика:')]:
    cell(r,1,lab,True,border=False); r+=1
    ws.merge_cells(start_row=r,start_column=1,end_row=r,end_column=2); cell(r,1,role,border=False)
    for j in (3,4): ws.cell(r,j).border=Border(bottom=th)
    cell(r,6,'«____»__________ 2026 г.',border=False,al='center'); r+=1
    cell(r,3,'(должность, фамилия, инициалы)',size=8,border=False,al='center'); cell(r,6,'(дата)',size=8,border=False,al='center'); r+=2
ws.page_setup.paperSize=9; ws.page_setup.orientation='landscape'; ws.page_setup.fitToWidth=1; ws.page_setup.fitToHeight=0; ws.sheet_properties.pageSetUpPr.fitToPage=True
w2=wb.create_sheet('Перечень реестров')
for j,(h,wd) in enumerate(zip(['№','Объект (РНС)','Шифр РД','№ книги (папки)','Подрядчик','Позиций','Листов','Файл в архиве'],[6,40,36,28,22,9,9,70]),1):
    c=w2.cell(1,j,h); c.font=Font(name=F,bold=True); c.border=B; c.alignment=Alignment(horizontal='center',vertical='center',wrap_text=True); w2.column_dimensions['ABCDEFGH'[j-1]].width=wd
for i,row in enumerate(LIST,2):
    for j,v in enumerate(row,1): c=w2.cell(i,j,v); c.font=Font(name=F,size=10); c.border=B
w2.auto_filter.ref=f'A1:H{len(LIST)+1}'; w2.freeze_panes='A2'
w3=wb.create_sheet('Итоги по подрядчикам'); agg=collections.defaultdict(lambda:[0,0,0])
for x in LIST: a=agg[x[4]]; a[0]+=1; a[1]+=x[5]; a[2]+=x[6]
for j,h in enumerate(['Подрядчик','Реестров (папок)','Позиций','Листов'],1): c=w3.cell(1,j,h); c.font=Font(name=F,bold=True); c.border=B
for i,(o,a) in enumerate(sorted(agg.items()),2):
    for j,v in enumerate([o]+a,1): c=w3.cell(i,j,v); c.font=Font(name=F); c.border=B
w3.column_dimensions['A'].width=30
wb.save('/app/webapp/public/files/svodnyj-reestr-papok-zif5-rns.xlsx')
print('registries',n,'rows',r,dict(agg)); print('objects',len(keys),'not in RNS',[k for k in keys if k not in objs])
print('excluded non-25',sum(1 for m in M.values() if m['proj']!='25'))
