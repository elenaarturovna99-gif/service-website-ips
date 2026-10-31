import sys,os,copy,re
sys.path.insert(0,'/app/webapp/.idwork/gen')
from data import *
from schemes import materials
from docx import Document
from docx.shared import Pt,Mm
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml.ns import qn
from docx.oxml import OxmlElement
import openpyxl
from openpyxl.styles import Font,Alignment,Border,Side
OUT='/app/webapp/.idwork/out'
for d in ['АОСР','Реестры материалов','АВК']: os.makedirs(f'{OUT}/{d}',exist_ok=True)
SRC='/tmp/id/s'
CERT_VALVE_ALL=CERT_VALVE

def base_doc():
    d=Document()
    s=d.sections[0]; s.page_width=Mm(210); s.page_height=Mm(297)
    s.left_margin=Mm(20); s.right_margin=Mm(10); s.top_margin=Mm(10); s.bottom_margin=Mm(10)
    st=d.styles['Normal']; st.font.name='Times New Roman'; st.font.size=Pt(10)
    st.element.rPr.rFonts.set(qn('w:eastAsia'),'Times New Roman')
    st.paragraph_format.space_after=Pt(0); st.paragraph_format.space_before=Pt(0)
    return d
def P(d,text='',bold=False,size=None,align=None,italic=False,under=False,after=0):
    p=d.add_paragraph(); r=p.add_run(text); r.bold=bold; r.italic=italic; r.underline=under
    if size: r.font.size=Pt(size)
    if align=='c': p.alignment=WD_ALIGN_PARAGRAPH.CENTER
    if align=='r': p.alignment=WD_ALIGN_PARAGRAPH.RIGHT
    if align=='j': p.alignment=WD_ALIGN_PARAGRAPH.JUSTIFY
    p.paragraph_format.space_after=Pt(after)
    return p
def field(d,text,hint):
    p=P(d,text,under=True,align='j'); 
    P(d,hint,size=7,align='c',italic=True)

ZAK='АО «Полюс Красноярск», ОГРН 1022401504740, ИНН 2434000335, 663282, РФ, Красноярский край, Северо-Енисейский район, г.п. Северо-Енисейский, ул. Белинского, д. 2б. Ассоциация «Саморегулируемая корпорация строителей Красноярского края», ОГРН 1082400002156, ИНН 2465117654. Тел/факс 7 (391) 290-61-03'
GEN='ООО «Лидер», ОГРН 1152468006734, ИНН 2460087639, 660048, РФ, Красноярский край, г. Красноярск, ул. Калинина, д. 64, офис 1-01, тел./факс: 7 (391) 296-59-67. СРО-С-210-24032010 СС СРО «ПромЖилСтрой», ОГРН 1092400002155, ИНН 2460086292'
PRJ='ООО «Полюс Проект», ОГРН 1102468035064, ИНН 2463222090, 660075, РФ, Красноярский край, г. Красноярск, ул. Маерчака, д. 10, тел.: 8 (391) 290-67-03, факс: 8 (391) 290-67-88, СРО АСП Союз «Проекты Сибири», ОГРН 1082400002387, ИНН 2461002003'
REP=[('Представитель застройщика, технического заказчика, лица, ответственного за эксплуатацию здания, сооружения, или регионального оператора по вопросам строительного контроля','Начальник ОСК АО «Полюс Красноярск» Шуваев М.А., ид. № С-38-146064, распоряжение № 142-р от 17.12.2021 г.','Шуваев М.А.'),
 ('Представитель лица, осуществляющего строительство, реконструкцию, капитальный ремонт','Директор по строительству ООО «Лидер» Давыдов А.В., приказ № 67 от 24.05.2024 г.','Давыдов А.В.'),
 ('Представитель лица, осуществляющего строительство, реконструкцию, капитальный ремонт, по вопросам строительного контроля','Инженер СК ООО «Лидер» Филаретов А.В., ид. № С-58-262982, приказ № 4 от 01.05.2025 г.','Филаретов А.В.'),
 ('Представитель лица, осуществляющего подготовку проектной документации','Ведущий инженер ГАН ООО «Полюс Проект» Хамин П.А., приказ № 29 от 29.02.2024 г.','Хамин П.А.'),
 ('Представитель лица, выполнившего работы, подлежащие освидетельствованию','—',None),
 ('Представители иных лиц','Руководитель СГО ЗИФ-5 АО «Полюс Красноярск» Котельников А.А., распоряжение № 80-р от 30.07.2021 г.','Котельников А.А.')]

def prev_day(date,n):
    import datetime
    dd=datetime.datetime.strptime(date,'%d.%m.%Y')-datetime.timedelta(days=n); return dd.strftime('%d.%m.%Y')

def act_meta(sysn,kind):
    num,date=DOCS[(kind,sysn)]
    aosr=f'№{num}-О.ОВ3-{sysn}'
    isn=f'№{num}-{sysn}-О.ОВ3'
    ks=[r for r in KS[sysn] if (kind=='duct' and r[4] in ('work','valve','duct')) or (kind=='ins' and r[4]=='ins') or (kind==r[4])]
    ksref=', '.join('п.'+str(r[0]) for r in ks)
    S=SYSNAME.get(sysn,'')
    if kind=='duct':
        work=f'Монтаж воздуховодов и установка воздушных клапанов {S} в КПФР ЗИФ-5 в осях {AXES[sysn]}'
        isname=f'Исполнительная схема {isn} монтажа воздуховодов {S} от {date} г.'
        nxt={'МО1':'Монтаж теплоизоляции воздуховодов системы МО1','МО2':'Монтаж теплоизоляции воздуховодов системы МО2','МО3':'Монтаж теплоизоляции воздуховодов системы МО3','МО4':'Пусконаладочные работы системы МО4','ГУ1':'Пусконаладочные работы системы ГУ1'}[sysn]
        avk=[AVK1,AVK2]
        start=prev_day(date,6)
    elif kind=='ins':
        work=f'Тепловая изоляция воздуховодов {S} рулонным материалом K-FLEX ST s=50 мм с покрытием IN CLAD в КПФР ЗИФ-5 в осях {AXES[sysn]}'
        isname=f'Исполнительная схема {isn} теплоизоляции воздуховодов {S} от {date} г.'
        nxt=f'Пусконаладочные работы системы {sysn}'
        avk=[AVK3]; start=prev_day(date,3)
    elif kind=='pipe':
        work=f'Монтаж дренажного трубопровода ⌀32х3,2 из стальной трубы ВГП по ГОСТ 3262-75 с антикоррозийным покрытием в КПФР ЗИФ-5 в осях {AXES[sysn]}'
        isname=f'Исполнительная схема {isn} монтажа дренажного трубопровода от {date} г.'
        nxt='Тепловая изоляция дренажного трубопровода'; avk=[AVK3,AVK1]; start=prev_day(date,4)
    else:
        work=f'Тепловая изоляция дренажного трубопровода ⌀32 трубками из вспененного каучука s=6 мм в КПФР ЗИФ-5 в осях {AXES[sysn]}'
        isname=f'Исполнительная схема {isn} теплоизоляции дренажного трубопровода от {date} г.'
        nxt='Пусконаладочные работы систем МО2, МО3'; avk=[AVK3]; start=prev_day(date,2)
    return dict(num=num,date=date,aosr=aosr,isn=isn,isname=isname,work=work,next=nxt,avk=avk,start=start,ks=ks)

def aosr(sysn,kind):
    m=act_meta(sysn,kind)
    d=base_doc()
    P(d,'Приложение № 3 к составу исполнительной документации при строительстве, реконструкции, капитальном ремонте объектов капитального строительства, утверждённому приказом Минстроя России от 16.05.2023 № 344/пр',size=7,align='r',italic=True,after=4)
    P(d,'Объект капитального строительства',bold=True)
    field(d,'«'+OBJ+'». '+CODE+'. РФ, Красноярский край, Северо-Енисейский район','(наименование объекта капитального строительства в соответствии с проектной документацией, почтовый или строительный адрес)')
    P(d,'Застройщик (технический заказчик, лицо, ответственное за эксплуатацию здания, сооружения, или региональный оператор)',bold=True)
    field(d,ZAK,'(наименование, ОГРН, ИНН, адрес, телефон, СРО)')
    P(d,'Лицо, осуществляющее строительство, реконструкцию, капитальный ремонт',bold=True)
    field(d,GEN,'(наименование, ОГРН, ИНН, адрес, телефон, СРО)')
    P(d,'Лицо, осуществляющее подготовку проектной документации',bold=True)
    field(d,PRJ,'(наименование, ОГРН, ИНН, адрес, телефон, СРО)')
    P(d,'Лицо, выполнившее работы, подлежащие освидетельствованию',bold=True)
    field(d,GEN,'(наименование, ОГРН, ИНН, адрес, телефон, СРО)')
    P(d,'',after=2)
    t=d.add_table(rows=1,cols=2); t.autofit=True
    c=t.rows[0].cells; c[0].text=f'АКТ\nосвидетельствования скрытых работ {m["aosr"]}'; c[1].text=f'{m["date"]} г.\n(дата составления акта)'
    for cc,al in zip(c,[WD_ALIGN_PARAGRAPH.LEFT,WD_ALIGN_PARAGRAPH.RIGHT]):
        for p in cc.paragraphs:
            p.alignment=al
            for r in p.runs: r.bold=True; r.font.size=Pt(11)
    P(d,'',after=2)
    for role,who,_ in REP:
        P(d,role,size=9)
        field(d,who,'(должность, фамилия, инициалы, идентификационный номер в НРС, реквизиты распорядительного документа)')
    P(d,'произвели осмотр работ, выполненных: ООО «Лидер»',after=0)
    P(d,'и составили настоящий акт о нижеследующем:',after=2)
    P(d,'1. К освидетельствованию предъявлены следующие работы:',bold=True); field(d,m['work'],'(наименование скрытых работ)')
    P(d,'2. Работы выполнены по проектной документации:',bold=True); field(d,f'{CODE}, изм. 2 (листы ЧТЖ07, СП01); ООО «Полюс Проект», ГИП Смелых С.А.','(номер, реквизиты чертежа, наименование проектной документации)')
    P(d,'3. При выполнении работ применены:',bold=True); field(d,f'Материалы согласно реестру применённых материалов №{m["num"]} к АОСР {m["aosr"]} от {m["date"]} г.','(наименования материалов, реквизиты сертификатов)')
    P(d,'4. Предъявлены документы, подтверждающие соответствие работ предъявляемым к ним требованиям:',bold=True); field(d,m['isname']+'; '+'; '.join(m['avk'])+'.','(исполнительные схемы и чертежи, результаты экспертиз, испытаний)')
    P(d,'5. Даты:',bold=True)
    P(d,f'начала работ   {m["start"]} г.'); P(d,f'окончания работ   {m["date"]} г.')
    P(d,'6. Работы выполнены в соответствии с:',bold=True); field(d,f'{CODE}, изм. 2; СП 73.13330.2016 «Внутренние санитарно-технические системы зданий»; СП 60.13330.2020; СП 61.13330.2012 «Тепловая изоляция оборудования и трубопроводов»' if kind in ('ins','pins') else f'{CODE}, изм. 2; СП 73.13330.2016 «Внутренние санитарно-технические системы зданий»; СП 60.13330.2020','(наименования и структурные единицы технических регламентов, НД, разделы ПД)')
    P(d,'7. Разрешается производство последующих работ:',bold=True); field(d,m['next'],'(наименование работ, конструкций, участков сетей)')
    P(d,'Дополнительные сведения: —')
    P(d,'Акт составлен в 3 (трёх) экземплярах.')
    P(d,'Приложения: '+m['isname']+f'; Реестр №{m["num"]} применённых материалов к АОСР {m["aosr"]} от {m["date"]} г.; '+'; '.join(m['avk'])+'.',align='j',after=4)
    for role,who,fio in REP:
        if not fio: continue
        P(d,role,size=8)
        p=P(d,f'{fio}  ______________________',align='r',after=2)
    fn=f'АОСР {m["aosr"]} от {m["date"]}.docx'
    d.save(f'{OUT}/АОСР/{fn}'); return fn,m

thin=Side(style='thin'); B=Border(left=thin,right=thin,top=thin,bottom=thin)
def reg_xlsx(sysn,kind,m):
    wb=openpyxl.Workbook(); ws=wb.active; ws.title='Реестр'
    ws.column_dimensions['A'].width=6; ws.column_dimensions['B'].width=55; ws.column_dimensions['C'].width=8; ws.column_dimensions['D'].width=9; ws.column_dimensions['E'].width=42; ws.column_dimensions['F'].width=26
    lines=['ООО «Лидер»','«'+OBJ+'». '+CODE,'Застройщик (технический заказчик): АО «Полюс Красноярск»','Представитель службы строительного контроля технического заказчика: АО «Полюс Красноярск»','Генподрядчик: ООО «Лидер»','',f'РЕЕСТР №{m["num"]} применённых материалов',f'к акту освидетельствования скрытых работ {m["aosr"]} от {m["date"]} г.']
    for i,l in enumerate(lines,1):
        ws.merge_cells(start_row=i,start_column=1,end_row=i,end_column=6); c=ws.cell(i,1,l); c.alignment=Alignment(horizontal='center',wrap_text=True); c.font=Font(name='Times New Roman',size=11,bold=i in (7,8))
    ws.row_dimensions[2].height=45
    r=10; hd=['№ п/п','Наименование материалов','Ед. изм.','Кол-во','Сертификат или другие документы, подтверждающие качество','Акт входного контроля']
    for j,h in enumerate(hd,1):
        c=ws.cell(r,j,h); c.font=Font(name='Times New Roman',size=10,bold=True); c.alignment=Alignment(horizontal='center',vertical='center',wrap_text=True); c.border=B
    rows=materials(sysn,kind)
    for row in rows:
        r+=1
        vals=list(row)
        if 'ЕАЭС' in vals[4]: vals[4]=CERT_VALVE_ALL
        for j,v in enumerate(vals,1):
            c=ws.cell(r,j,v.replace('⌀','Ø')); c.font=Font(name='Times New Roman',size=10); c.alignment=Alignment(vertical='center',wrap_text=True,horizontal='center' if j in (1,3,4) else 'left'); c.border=B
        ws.row_dimensions[r].height=48
    r+=2
    ws.cell(r,1,'Инженер ПТО ООО «Лидер» Колесниченко Е.А.'); ws.cell(r,5,'_______________ (подпись)')
    ws.page_setup.orientation='landscape'; ws.page_setup.paperSize=9; ws.page_setup.fitToWidth=1; ws.sheet_properties.pageSetUpPr.fitToPage=True; ws.page_setup.fitToHeight=0
    fn=f'Реестр №{m["num"]} к АОСР {m["aosr"]} от {m["date"]}.xlsx'
    wb.save(f'{OUT}/Реестры материалов/{fn}'); return fn

JOBS=[('МО1','duct'),('МО1','ins'),('МО2','duct'),('МО2','ins'),('МО3','duct'),('МО3','ins'),('ДР','pipe'),('ДР','pins'),('МО4','duct'),('ГУ1','duct')]
if __name__=='__main__':
    res=[]
    for s,k in JOBS:
        fa,m=aosr(s,k); fr=reg_xlsx(s,k,m); res.append((s,k,fa,fr,m)); print(fa,'|',fr)
    import pickle; pickle.dump([(s,k,fa,fr,{kk:v for kk,v in m.items()}) for s,k,fa,fr,m in res],open(OUT+'/_acts.pkl','wb'))
