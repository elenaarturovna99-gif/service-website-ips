import pickle,re,collections,os
p=pickle.load(open('/tmp/rr/parsed.pkl','rb')); d=pickle.load(open('/tmp/rr/raw.pkl','rb'))
CODE=re.compile(r'(\d{2})\s*[.,]\s*(\d{2})\s*[.,]\s*(\d{3})\s*[-–. ]\s*([А-ЯЁA-Z]{1,3})\s*[.\-]?\s*([А-ЯЁA-Z]{1,5})\s*(\d{0,2})')
def codes(t,strict=True):
    return [(f'{a}.{b}.{c}',f'{x}.{y}{n}') for a,b,c,x,y,n in CODE.findall(t.upper()) if not strict or a in('01','02','03','04','05','06')]
BOOK=[r'(Блок\s*(?:II|2)\.?\s*Книга\s*№?\s*[\d.,_/\-]+(?:\s*Часть[\s\-№]*\d+)?)',r'(Том\s*[\dА-ЯA-Z]+\.?\s*Книга\s*№?\s*[\d.]+(?:\s*Часть\s*\d+)?)',r'(Папка\s*№?\s*[\d.]+(?:\s*Часть[\s\-№]*\d+)?)',r'(Книга\s*№?\s*[\d.]+(?:\s*Часть[\s\-№]*\d+)?)',r'(Том\s*№?\s*\d+(?:\s*Книга\s*\d+)?)',r'(кн\.?\s*[\d.]+)']
def book(*ts):
    for t in ts:
        for b in BOOK:
            m=re.search(b,t,re.I)
            if m:
                v=re.sub(r'\s+',' ',m.group(1)).strip(' .,_-'); return v[0].upper()+v[1:]
    return ''
ORG={'1. РНГМ+':'РНГМ','10. Эста+':'Эста Констракшн','11. Декор+':'Декор','12. МПС+':'МетПромСтрой','2. ПА+':'Айэс','3. ЗМК+':'ЗМК','3. Полюс-Строй+':'Полюс-Строй','4. Лидер+':'Лидер','5. СПС+':'СПС','6. СТК+':'СТК','7. АЛЬЯНС+':'Альянс-про','8. Норбал+':'Норбал','9. АЙЭС+':'Айэс'}
PRJ=re.compile(r'[РP]\s*-?\s*П\s*[-.]?\s*0*(\d{3})\s*[.,]\s*(\d{2})\s*[-. ]+\s*(\d{2})\s*[.,]\s*(\d{2})\s*[.,]\s*(\d{3})',re.I)
M={}
for f,(sc,sheet,cols,rows,hdr) in p.items():
    fn=os.path.basename(f); org=ORG[f.split('/')[1]]
    allc=codes(fn)+codes(hdr)
    body=collections.Counter(codes(' '.join(r['name']+' '+r['num'] for r in rows)))
    if not allc and body: allc=[body.most_common(1)[0][0]]
    srows=[r for n,r in d[f] if n==sheet][0]
    full=' '.join(str(c) for r in srows for c in r if c is not None)
    if not allc:
        cs=collections.Counter(codes(full,False))
        if cs: allc=[cs.most_common(1)[0][0]]
    ps=collections.Counter(x[1] for x in PRJ.findall(fn+' '+' '.join(str(c) for r in srows[:60] for c in r if c is not None)))
    M[f]=dict(org=org,code=allc[0] if allc else None,book=book(hdr,re.sub(r'\.(xlsx?|xlsb|xlsm|docx)$','',fn),sheet),sheet=sheet,fn=fn,n=len(rows),proj=ps.most_common(1)[0][0] if ps else '25',hdr=hdr)
pickle.dump(M,open('/tmp/rr/meta.pkl','wb'))
print(len(M),sum(1 for m in M.values() if not m['code']))
