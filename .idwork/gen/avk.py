import sys,copy; sys.path.insert(0,'/app/webapp/.idwork/gen')
from docx import Document
from data import *
SRC='/tmp/id/s/АВК/'
OUT='/app/webapp/.idwork/out/АВК/'
def set_cell(cell,text):
    ps=cell.paragraphs
    first=ps[0]; run0=first.runs[0] if first.runs else None
    for p in ps[1:]: p._element.getparent().remove(p._element)
    for r in first.runs[1:]: r._element.getparent().remove(r._element)
    lines=text.split('\n')
    if run0 is None: run0=first.add_run('')
    run0.text=lines[0]
    for l in lines[1:]:
        np_=copy.deepcopy(first._element); first._element.addnext(np_) if False else cell._element.append(np_)
        from docx.text.paragraph import Paragraph
        pp=Paragraph(np_,cell); 
        for r in pp.runs[1:]: r._element.getparent().remove(r._element)
        pp.runs[0].text=l
def title(d,text):
    p=d.paragraphs[0]
    for r in p.runs[1:]: r._element.getparent().remove(r._element)
    p.runs[0].text=text
# АВК1
d=Document(SRC+'АВК №1-02.21-О.ОВ3 (воздуховоды).docx')
title(d,'АКТ ВХОДНОГО КОНТРОЛЯ №1-02.021-О.ОВ3 от 30.04.2025 г.')
t=d.tables[0]
txt=t.rows[12].cells[0].text
txt=txt.replace('Отвод сборный','Отвод сварной')
set_cell(t.rows[12].cells[0],txt)
d.save(OUT+'АВК №1-02.021-О.ОВ3 от 30.04.2025 (воздуховоды).docx')
# АВК2
d=Document(SRC+'АВК №2-02.21-О.ОВ3 (клапаны).docx')
title(d,'АКТ ВХОДНОГО КОНТРОЛЯ №2-02.021-О.ОВ3 от 02.05.2025 г.')
t=d.tables[0]
set_cell(t.rows[12].cells[0],'\n'.join([
 'Воздушный клапан повышенной плотности КЕДР-С-300*200-1*NF230-S2-V-K-УХЛ2-0 - 3 шт. (МО1 - 2 шт., ГУ1 - 1 шт.)',
 'Воздушный клапан НЕРПА-400-1*ЭПВ-NF230-S2-V-КВ-1000-У3-0 - 2 шт. (МО2 - 1 шт., МО3 - 1 шт.)',
 'Воздушный клапан повышенной плотности КЕДР-С-450*350-1*ЭПВ-NF230-S2-V-KB-УХЛ2-0 - 4 шт. (МО2 - 2 шт., МО3 - 2 шт.)',
 'Воздушный клапан НЕРПА-355-1*NF230-S2-V-К-1000-У3-0 - 1 шт. (МО4)',
 'Воздушный клапан повышенной плотности КЕДР-С-400*400-1*NF230-S2-V-K-УХЛ2-0 - 2 шт. (МО4)']))
set_cell(t.rows[16].cells[0],'Сертификат соответствия № ЕАЭС RU C-BY.НВ63.В.02472/21 с 26.06.2021 по 25.06.2026 (клапаны КЕДР, КЕДР-С, НЕРПА), паспорта изделий')
d.save(OUT+'АВК №2-02.021-О.ОВ3 от 02.05.2025 (клапаны).docx')
# АВК3 - новый, на базе №2
d=Document(SRC+'АВК №2-02.21-О.ОВ3 (клапаны).docx')
title(d,'АКТ ВХОДНОГО КОНТРОЛЯ №3-02.021-О.ОВ3 от 30.05.2025 г.')
t=d.tables[0]
set_cell(t.rows[12].cells[0],'\n'.join([
 'Рулонный теплоизоляционный материал K-FLEX 50x1000-04 ST, s=50 мм - 75 м² (МО1 - 15 м², МО2 - 32 м², МО3 - 28 м²)',
 'Покрытие для теплоизоляции IN CLAD, защита от УФ-лучей, -60°С/+100°С, Г1 - 75 м²',
 'Труба стальная водогазопроводная по ГОСТ 3262-75, Ø32х3,2 - 12 м',
 'Теплоизоляционные трубки из вспененного каучука с рассечкой, s=6 мм, для трубы Ø32х3,2 - 12 м',
 'Грунт-эмаль «2в1» СБЭ-111 «УНИПОЛ» - 1,5 м² (в 2 слоя)']))
set_cell(t.rows[14].cells[0],'ООО «К-ФЛЕКС»; поставщик трубы ВГП - ________')
set_cell(t.rows[16].cells[0],'Сертификат соответствия / паспорт качества на K-FLEX ST № ________; на IN CLAD № ________; сертификат качества на трубу ВГП № ________; паспорт на грунт-эмаль № ________')
set_cell(t.rows[18].cells[0],'30.05.2025')
for ri in (22,24,26):
    c=t.rows[ri].cells[-1]; set_cell(c,'30.05.2025')
d.save(OUT+'АВК №3-02.021-О.ОВ3 от 30.05.2025 (теплоизоляция, трубы).docx')
print('ok')
