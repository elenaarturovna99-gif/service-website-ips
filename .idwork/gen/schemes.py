import sys; sys.path.insert(0,'/app/webapp/.idwork/gen')
from draw import *
from regions import R
from data import *
OUT='/app/webapp/.idwork/out'
import os; os.makedirs(OUT+'/pdf',exist_ok=True); os.makedirs(OUT+'/dxf',exist_ok=True)
PKL='/app/webapp/.idwork/pg11.pkl'
BOX={'МО1':(60,820,960,1665),'МО2':(960,560,1720,1500),'ГУ1':(1720,840,2130,1660),'МО3':(1450,220,2370,1270),'МО4':(60,40,1300,730),
     'ДР1':(1130,560,1500,760),'ДР2':(2100,420,2240,600)}
REG=dict(R)
REG['ДР1']=[(1130,560),(1500,560),(1500,760),(1130,760)]
REG['ДР2']=[(2100,420),(2240,420),(2240,600),(2100,600)]
# balloon targets (rd coords) and offsets(mm)
TGT={
 'МО1':{'valve':[(793,1047),(761,1060)],'duct':(560,1160),'ins':(771,1400)},
 'МО2':{'valve':[(1140,822),(1190,793)],'nerpa':(1619,1010),'duct':(1400,985),'ins':(1160,1250)},
 'МО3':{'valve':[(2182,676),(2147,657)],'nerpa':(1976,546),'duct':(1700,500),'ins':(2222,950)},
 'МО4':{'valve':[(1023,390),(1076,415)],'nerpa':(743,630),'duct':(990,570)},
 'ГУ1':{'valve':[(1876,981)],'duct':(1920,1300)},
}

def materials(sysn,kind):
    rows=[]
    ks=KS[sysn]
    if kind=='duct':
        n=1
        for pos,name,u,q,k in ks:
            if k=='valve':
                rows.append((str(n),name,u,q,CERT_VALVE,AVK2)); n+=1
        dq=[q for pos,name,u,q,k in ks if k=='duct'][0]
        rows.append((str(n),DUCT_SPEC[sysn],'м²',dq,CERT_DUCT,AVK1)); n+=1
        rows.append((str(n),'Металлоконструкции креплений воздуховодов (по альбому креплений)','компл.','1',CERT_FIX,AVK1))
    elif kind=='ins':
        m3=[q for pos,name,u,q,k in ks if k=='ins'][0]
        m2=str(round(float(m3.replace(',','.'))/0.05)).replace('.',',')
        rows.append(('1','Рулонный теплоизоляционный материал K-FLEX 50x1000-04 ST, s=50 мм (объём '+m3+' м³)','м²',m2,CERT_KFLEX,AVK3))
        rows.append(('2','Покрытие для теплоизоляции IN CLAD, защита от УФ-лучей, Г1','м²',m2,CERT_INCLAD,AVK3))
    elif kind=='pipe':
        rows.append(('1','Труба стальная водогазопроводная по ГОСТ 3262-75, ⌀32х3,2','м','12',CERT_VGP,AVK3))
        rows.append(('2','Антикоррозийное покрытие грунт-эмаль «2в1» СБЭ-111 «УНИПОЛ», в 2 слоя','м²','1,5',CERT_PAINT,AVK3))
        rows.append(('3','Металлоконструкции креплений','кг','10',CERT_FIX,AVK1))
    elif kind=='pins':
        rows.append(('1','Трубка теплоизоляционная из вспененного каучука K-FLEX ST 06x035, с рассечкой, s=6 мм, для трубы ⌀32х3,2','м','12',CERT_TUBE,AVK3))
    return rows

TITLE={'duct':'Исполнительная схема монтажа воздуховодов {s}','ins':'Исполнительная схема теплоизоляции воздуховодов {s}','pipe':'Исполнительная схема монтажа дренажного трубопровода ⌀32','pins':'Исполнительная схема теплоизоляции дренажного трубопровода ⌀32'}

def scheme(sysn,kind):
    num,date=DOCS[(kind,sysn)]
    code=f'ИС №{num}-{sysn}-О.ОВ3'
    S=Sheet()
    S.rect(20,5,395,287,lw=0.6)
    if sysn=='ДР':
        T=S.import_rd(PKL,REG['ДР1'],BOX['ДР1'],(24,112,230,165))
        n=3 if kind=='pipe' else 1
        for i in range(n): S.balloon(i+1,(1300,640),(-30+i*9,22))

        S.text(26,283,'Участок 1 (МО2): дренажный трубопровод ⌀32 в технологический приямок',h=2.8,bold=True)
        S.import_rd(PKL,REG['ДР2'],BOX['ДР2'],(262,112,148,165))
        for i in range(n): S.balloon(i+1,(2160,520),(10+i*9,22))
        S.text(262,283,'Участок 2 (МО3): дренажный трубопровод',h=2.8,bold=True)
        S.line([(258,110),(258,285)],lw=0.25,ls='--')
    else:
        T=S.import_rd(PKL,REG[sysn],BOX[sysn],(24,112,387,176))
        tg=TGT[sysn]
        if kind=='duct':
            i=1
            if 'nerpa' in tg: S.balloon(i,tg['nerpa'],(-14,14)); i+=1
            for v in tg['valve']: S.balloon(i,v,(-16,-12) if v==tg['valve'][0] else (14,-14))
            i+=1
            S.balloon(i,tg['duct'],(10,16)); i+=1
            S.balloon(i,tg['duct'],(-12,-18))
        else:
            S.balloon(1,tg['ins'],(14,6)); S.balloon(2,tg['ins'],(14,-6))
    rows=materials(sysn,kind)
    # positions for valve rows: if MO2/3/4 with nerpa first then kedr - fix numbering order
    S.text(23,106,'Ведомость применённых материалов (объём согласно КС-6а)',h=2.6,bold=True)
    yb=table(S,22,104,[8,62,9,11,70,44],[r for r in rows],['Поз.','Наименование материала','Ед. изм.','Кол-во','Документ о качестве','Акт входного контроля'],h=1.8,rowh=5,headh=6)
    # KS-6a block
    ks=[r for r in KS[sysn] if (kind=='duct' and r[4] in ('work','valve','duct')) or (kind=='ins' and r[4]=='ins') or (kind==r[4])]
    nx=230; ny=104
    S.text(nx+1,106,'Объём работ по журналу КС-6а',h=2.6,bold=True)
    yy=table(S,nx,ny,[13,140,12,20],[(f'п.{p}',n,u,q) for p,n,u,q,k in ks],['№ по КС-6а','Наименование работ','Ед.','Кол-во'],h=1.8,rowh=4.6,headh=6)
    notes=['1. Схема выполнена на основании рабочей документации '+CODE+'-ЧТЖ07 (аксонометрия систем), изм. 2.',
           '2. Объёмы работ и материалов приняты согласно журналу учёта выполненных работ КС-6а.',
           '3. Отметки даны в метрах от уровня чистого пола (0,000). Размеры в мм.']
    if kind=='duct' and sysn in ('МО2','МО3','МО4'):
        notes.append('4. Отводы круглого сечения, обозначенные в РД как сварные, выполнены сварными (по РД).')
    if kind=='duct' and sysn=='МО4':
        notes.append('5. Переход концентрический ⌀560/⌀355 исключён согласно РД (изм.) и не монтировался.')
    if kind=='duct':
        notes.append(f'{len(notes)+1}. Участки в теплоизоляции K-FLEX ST s=50 мм показаны зелёным пунктиром.')
    import textwrap
    yN=yb-4
    S.text(23,yN,'Примечания:',h=2.2,bold=True); yN-=3.6
    for n in notes:
        for j,l in enumerate(textwrap.wrap(n,150)):
            S.text(23 if j==0 else 26,yN,l,h=1.8); yN-=3.0
    sysfull=SYSNAME.get(sysn,'дренажного трубопровода')
    title=TITLE[kind].format(s=sysn)
    stamp(S,f'{CODE}-ИС{num}-{sysn}',f'Корпус приготовления флотореагентов. Местная вентиляция\nв осях {AXES[sysn]}',f'{title}\n{code} от {date} г.','ООО «Лидер»',signers=[(a,b,date) for a,b in SIGN]+[('СК Зак.','Марьин С.В.',date)])
    fn=f'ИС_{num}-{sysn}-О.ОВ3_{ {"duct":"воздуховоды","ins":"теплоизоляция","pipe":"трубопровод","pins":"изоляция_трубопровода"}[kind]}'
    S.save(f'{OUT}/pdf/{fn}.pdf',f'{OUT}/dxf/{fn}.dxf')
    return fn

if __name__=='__main__':
    jobs=[('МО1','duct'),('МО2','duct'),('МО3','duct'),('МО4','duct'),('ГУ1','duct'),('МО1','ins'),('МО2','ins'),('МО3','ins'),('ДР','pipe'),('ДР','pins')]
    only=sys.argv[1:]
    for s,k in jobs:
        if only and f'{s}:{k}' not in only: continue
        print(scheme(s,k))
