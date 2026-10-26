import docx,sys,re
from docx.oxml.ns import qn
d=docx.Document(sys.argv[1])
for el in d.element.body.iterchildren():
    if el.tag==qn('w:p'):
        p=docx.text.paragraph.Paragraph(el,d); hl=any(r.font.highlight_color for r in p.runs)
        if p.text.strip(): print(f"{'*' if hl else ''}{p.text}")
    elif el.tag==qn('w:tbl'):
        t=docx.table.Table(el,d)
        for r in t.rows: print("   | "+" | ".join(c.text.replace("\n"," / ") for c in r.cells))
