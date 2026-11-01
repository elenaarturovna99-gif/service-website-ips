import sys,io,warnings; warnings.filterwarnings('ignore'); sys.path.insert(0,'/tmp/pylibs')
import xlrd,openpyxl
def sheets(path):
    ext=path.lower().rsplit('.',1)[-1]; out=[]
    if ext=='xls':
        try:
            b=xlrd.open_workbook(path,on_demand=True)
            for s in b.sheets():
                if s.visibility: continue
                out.append((s.name,[s.row_values(r) for r in range(s.nrows)]))
            return out
        except xlrd.XLRDError: ext='xlsx'
    if ext in('xlsx','xlsm'):
        b=openpyxl.load_workbook(io.BytesIO(open(path,'rb').read()),data_only=True,read_only=True)
        for s in b.worksheets:
            if getattr(s,'sheet_state','visible')!='visible': continue
            out.append((s.title,[list(r) for r in s.iter_rows(values_only=True)]))
    elif ext=='xlsb':
        from pyxlsb import open_workbook
        with open_workbook(path) as b:
            for n in b.sheets:
                with b.get_sheet(n) as s: out.append((n,[[c.v for c in r] for r in s.rows()]))
    elif ext=='docx':
        import docx
        d=docx.Document(path); rows=[[p.text] for p in d.paragraphs[:30]]
        for t in d.tables:
            for r in t.rows:
                cells=[]; prev=None
                for c in r.cells: cells.append(c.text if c._tc is not prev else ''); prev=c._tc
                rows.append(cells)
        out.append(('docx',rows))
    return out
if __name__=='__main__':
    import os,pickle
    files=sorted(os.path.join(dp,f) for dp,dn,fn in os.walk('/tmp/rr/ex') for f in fn if f.lower().endswith(('xls','xlsx','xlsm','xlsb','docx')))
    data={}
    for f in files:
        try: data[f.replace('/tmp/rr/','')]=sheets(f)
        except Exception as e: print('ERR',f,e)
    pickle.dump(data,open('/tmp/rr/raw.pkl','wb')); print(len(data))
