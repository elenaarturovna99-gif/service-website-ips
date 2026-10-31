import sys,pickle,openpyxl,copy; sys.path.insert(0,'/app/webapp/.idwork/gen')
from openpyxl.utils import get_column_letter
from data import *
OUT='/app/webapp/.idwork/out'
SRC='/tmp/id/s/реестр О.ОВ3 архив.xlsx'
acts=pickle.load(open(OUT+'/_acts.pkl','rb'))
WHERE='в КПФР ЗИФ-5'
rows=[]
for s,k,fa,fr,m in acts:
    S=SYSNAME.get(s,'')
    nm={'duct':(f'АОСР Монтаж воздуховодов {S} {WHERE} (оригинал)',f'Исполнительная схема смонтированных воздуховодов {S} (оригинал)'),
        'ins':(f'АОСР Тепловая изоляция воздуховодов {S} {WHERE} (оригинал)',f'Исполнительная схема теплоизоляции воздуховодов {S} (оригинал)'),
        'pipe':(f'АОСР Монтаж дренажного трубопровода Ø32 {WHERE} (оригинал)','Исполнительная схема смонтированного дренажного трубопровода Ø32 (оригинал)'),
        'pins':(f'АОСР Тепловая изоляция дренажного трубопровода Ø32 {WHERE} (оригинал)','Исполнительная схема теплоизоляции дренажного трубопровода Ø32 (оригинал)')}[k]
    rows.append((nm[0],f'{m["aosr"]} от {m["date"]} г.','ООО "Лидер"',2))
    rows.append(('Реестр применяемых материалов к акту освидетельствования скрытых работ (оригинал)',f'№{m["num"]} к АОСР {m["aosr"]} от {m["date"]} г.','ООО "Лидер"',1))
    rows.append((nm[1],f'{m["isn"]} от {m["date"]} г.','ООО "Лидер"',1))
rows+=[('Акт входного контроля (оригинал)','№1-02.021-О.ОВ3 от 30.04.2025 г.','ООО "Лидер"',1),
 ('Сертификат соответствия (копия)','№ РОСС.RU.НЕ06.Н09413 с 08.06.2023 г.','ООО "Лидер"',3),
 ('Сертификат соответствия (копия)','№ РОСС.RU.32001.04ИБФ1.ОСП28.48330 с 01.03.2024 г.','ООО "Лидер"',4),
 ('Сертификат соответствия (копия)','№ РОСС.RU.32001.04ИБФ1.ОСП28.48270 с 01.03.2024 г.','ООО "Лидер"',4),
 ('Акт входного контроля (оригинал)','№2-02.021-О.ОВ3 от 02.05.2025 г.','ООО "Лидер"',1),
 ('Сертификат соответствия (копия)','№ ЕАЭС RU C-BY.НВ63.В.02472/21 от 26.06.2021 г.','ООО "Лидер"',1),
 ('Акт входного контроля (оригинал)','№3-02.021-О.ОВ3 от 30.05.2025 г.','ООО "Лидер"',1),
 ('Сертификат соответствия (копия)','№ RU C-RU.ПБ09.В.00637/25 с 13.03.2025 г.','ООО "Лидер"',2),
 ('Экспертное заключение (копия)','№ 77.01.12.П.002501.07.17 от 07.07.2017 г.','ООО "Лидер"',3),
 ('Декларация о соответствии (копия)','№ RU Д-RU.ПБ37.В.00313/20 от 22.05.2020 г.','ООО "Лидер"',1),
 ('Экспертное заключение (копия)','на покрытие IN CLAD','ООО "Лидер"',2),
 ('Документ о качестве на трубу ВГП Ø32х3,2 (копия)','№ ____ от ____','ООО "Лидер"',1),
 ('Паспорт качества на грунт-эмаль СБЭ-111 «УНИПОЛ» (копия)','№ ____ от ____','ООО "Лидер"',1)]

wb=openpyxl.load_workbook(SRC)
def cp_style(src,dst):
    dst.font=copy.copy(src.font); dst.border=copy.copy(src.border); dst.alignment=copy.copy(src.alignment); dst.number_format=src.number_format; dst.fill=copy.copy(src.fill)
for ex,ws in enumerate(wb.worksheets,1):
    # save footer block (rows 31..47) values/styles/merges/heights
    FS,FE=31,ws.max_row
    foot={}
    for r in range(FS,FE+1):
        foot[r]=[(c.value,copy.copy(c.font),copy.copy(c.border),copy.copy(c.alignment)) for c in ws[r][:6]]
    fh={r:ws.row_dimensions[r].height for r in range(FS,FE+1)}
    fm=[mr for mr in list(ws.merged_cells.ranges) if mr.min_row>=FS]
    for mr in fm: ws.unmerge_cells(str(mr))
    tmpl=[ws.cell(9,j) for j in range(1,7)]
    tmpl_st=[(copy.copy(c.font),copy.copy(c.border),copy.copy(c.alignment)) for c in tmpl]
    h9=ws.row_dimensions[9].height
    for r in range(9,FE+40):
        for j in range(1,7):
            c=ws.cell(r,j); c.value=None; c.border=openpyxl.styles.Border(); 
    r=9
    for i,(a,b,org,n) in enumerate(rows,1):
        vals=[str(i),a,b,org,str(n),f'=SUM($E$9:E{r})-E{r}+1']
        for j,v in enumerate(vals,1):
            c=ws.cell(r,j,v); c.font,c.border,c.alignment=[copy.copy(x) for x in tmpl_st[j-1]]
        ws.cell(r,5).value=n
        ws.row_dimensions[r].height=h9 if len(a)<80 else 52
        r+=1
    off=(r+1)-FS
    for rr,cells in foot.items():
        for j,(v,f,bd,al) in enumerate(cells,1):
            c=ws.cell(rr+off,j)
            if isinstance(v,str) and v.startswith('=E'): v='=E'+str(int(v[2:])+off)
            c.value=v; c.font=f; c.border=bd; c.alignment=al
        ws.row_dimensions[rr+off].height=fh[rr]
    for mr in fm:
        ws.merge_cells(start_row=mr.min_row+off,start_column=mr.min_col,end_row=mr.max_row+off,end_column=mr.max_col)
    ws['A6']=f'Папка №01\n{ex}-й экземпляр'
    ws.print_area=f'A1:F{FE+off}'
wb.save(OUT+'/Реестр ИД (на папку) '+CODE+'.xlsx'); print(len(rows))
