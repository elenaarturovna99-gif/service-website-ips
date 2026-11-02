import xlrd,re,collections
from xlutils.copy import copy
from xlutils.filter import process,XLRDReader,XLWTWriter
b=xlrd.open_workbook('src.xls',formatting_info=True);s=b.sheet_by_index(0)
rows=[]
for r in range(17,s.nrows):
    v=s.row_values(r)
    if isinstance(v[0],float) and v[0]>0: rows.append((r,v[1].strip(),str(v[5]).strip(),str(v[4]).strip()))
taken=collections.defaultdict(set)
for r,c,o,k in rows:
    m=re.match(r'^Книга\s*№?\s*(\d+)',k)
    if m: taken[(c,o)].add(int(m.group(1)))
fills={}
for r,c,o,k in rows:
    if k: continue
    t=taken[(c,o)];n=1
    while n in t: n+=1
    t.add(n);fills[r]=f'Книга {n}'
w=XLWTWriter();process(XLRDReader(b,'src.xls'),w)
wb,styles=w.output[0][1],w.style_list
ws=wb.get_sheet(0)
for r,val in fills.items():
    ws.write(r,4,val,styles[s.cell_xf_index(r,4)])
wb.save('/app/webapp/public/files/reestr-reestrov-zif5.xls')
print(len(fills),collections.Counter(fills.values()))
for r in [17,18,22,23,46,47,87,88,89,90]: print(r,s.cell_value(r,1),s.cell_value(r,5),fills.get(r))
