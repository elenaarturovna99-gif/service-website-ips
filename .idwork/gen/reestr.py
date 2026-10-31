import sys,pickle,openpyxl; sys.path.insert(0,'/app/webapp/.idwork/gen')
from openpyxl.styles import Font,Alignment,Border,Side
from data import *
OUT='/app/webapp/.idwork/out'
acts=pickle.load(open(OUT+'/_acts.pkl','rb'))
thin=Side(style='thin'); B=Border(left=thin,right=thin,top=thin,bottom=thin)
rows=[]
for s,k,fa,fr,m in acts:
    nm={'duct':f'АОСР: монтаж воздуховодов и установка клапанов {SYSNAME[s]}' if s in SYSNAME else '', 'ins':f'АОСР: тепловая изоляция воздуховодов {SYSNAME.get(s,"")}','pipe':'АОСР: монтаж дренажного трубопровода Ø32','pins':'АОСР: тепловая изоляция дренажного трубопровода Ø32'}[k]
    kss=', '.join('п.'+str(r[0]) for r in m['ks'])
    rows.append((nm+f' (КС-6а {kss})',f'{m["aosr"]} от {m["date"]} г.',2))
    rows.append(('Реестр применённых материалов',f'№{m["num"]} к АОСР {m["aosr"]} от {m["date"]} г.',1))
    rows.append(('Исполнительная схема (аксонометрическая)',f'{m["isn"]} от {m["date"]} г.',1))
rows+= [('Акт входного контроля (воздуховоды, фасонные изделия, крепёж)','№1-02.021-О.ОВ3 от 30.04.2025 г.',1),
 ('Сертификат соответствия (копия)','№ РОСС.RU.НЕ06.Н09413 с 08.06.2023 г.',3),
 ('Сертификат соответствия (копия)','№ РОСС.RU.32001.04ИБФ1.ОСП28.48330 с 01.03.2024 г.',4),
 ('Сертификат соответствия (копия)','№ РОСС.RU.32001.04ИБФ1.ОСП28.48270 с 01.03.2024 г.',4),
 ('Акт входного контроля (воздушные клапаны КЕДР, КЕДР-С, НЕРПА)','№2-02.021-О.ОВ3 от 02.05.2025 г.',1),
 ('Сертификат соответствия (копия)','№ ЕАЭС RU C-BY.НВ63.В.02472/21 от 26.06.2021 г.',1),
 ('Паспорта на воздушные клапаны (копии)','КЕДР-С, КЕДР, НЕРПА',None),
 ('Акт входного контроля (теплоизоляция K-FLEX ST, IN CLAD, труба ВГП, трубки, грунт-эмаль)','№3-02.021-О.ОВ3 от 30.05.2025 г.',1),
 ('Сертификаты / паспорта качества (копии) на K-FLEX ST, IN CLAD, трубу ВГП, трубки, грунт-эмаль','№ ________',None),
]
wb=openpyxl.Workbook()
for ex in (1,2):
    ws=wb.active if ex==1 else wb.create_sheet()
    ws.title=f'Экземпляр {ex}'
    for col,w in zip('ABCDEF',[6,62,40,18,9,9]): ws.column_dimensions[col].width=w
    head=[('Генподрядчик: ООО «Лидер»',),('Объект: '+OBJ,),('Шифр: '+CODE+' (в объёме журнала КС-6а)',),('РЕЕСТР ИСПОЛНИТЕЛЬНОЙ ДОКУМЕНТАЦИИ',),(f'Папка №01, {ex}-й экземпляр',)]
    for i,(h,) in enumerate(head,1):
        ws.merge_cells(start_row=i,start_column=1,end_row=i,end_column=6); c=ws.cell(i,1,h); c.alignment=Alignment(horizontal='center' if i>3 else 'left',wrap_text=True); c.font=Font(name='Times New Roman',size=12 if i==4 else 10,bold=i>=4)
    ws.row_dimensions[2].height=42
    r=7
    for j,h in enumerate(['№ п/п','Наименование документа','№ чертежа, акта, документа','Организация','Кол-во листов','Лист по списку'],1):
        c=ws.cell(r,j,h); c.font=Font(name='Times New Roman',size=10,bold=True); c.alignment=Alignment(horizontal='center',vertical='center',wrap_text=True); c.border=B
    first=r+1
    for i,(a,b,n) in enumerate(rows,1):
        r+=1
        vals=[i,a,b,'ООО «Лидер»' if 'Сертификат' not in a and 'Паспорт' not in a else 'Изготовитель',n if n else '',f'=SUM($E${first}:E{r})-E{r}+1']
        for j,v in enumerate(vals,1):
            c=ws.cell(r,j,v); c.font=Font(name='Times New Roman',size=10); c.border=B; c.alignment=Alignment(wrap_text=True,vertical='center',horizontal='left' if j in (2,3) else 'center')
    r+=2
    for t in ['Сдал: Инженер ПТО ООО «Лидер» Колесниченко Е.А.    ____________   «____» __________ 2026 г.','Проверил: представитель строительного контроля АО «Полюс Красноярск»  ____________   «____» __________ 2026 г.','Принял: представитель Заказчика  ____________   «____» __________ 2026 г.']:
        ws.cell(r,2,t); r+=2
    ws.page_setup.paperSize=9; ws.sheet_properties.pageSetUpPr.fitToPage=True; ws.page_setup.fitToHeight=0
wb.save(OUT+'/Реестр ИД '+CODE+'.xlsx'); print(len(rows))
