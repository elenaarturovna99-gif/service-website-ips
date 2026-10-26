import copy, re, math
import docx
from docx.oxml.ns import qn
from lxml import etree

W = "http://schemas.openxmlformats.org/wordprocessingml/2006/main"
BR = re.compile(r"(\[[^\]]*\])")

KEEP = {
    "[Должность]", "[Заказчик / технический заказчик]", "[Подрядная организация]", "[И.О. Фамилия]",
    "[Наименование подрядной организации]", "[Должность, И.О. Фамилия]", "[Главный инженер, И.О. Фамилия]",
    "[Организация, И.О. Фамилия]", "[Специалист по охране труда, И.О. Фамилия]", "[дата]", "[№]",
    "[дд.мм]", "[И.О. Фамилия, должность]",
}


def w(tag):
    return "{%s}%s" % (W, tag)


def ptext(p):
    out = []
    for el in p.iter():
        if el.tag == w("t"):
            out.append(el.text or "")
        elif el.tag == w("tab") and el.getparent().tag == w("r"):
            out.append("\t")
    return "".join(out)


def base_rpr(p):
    for r in p.findall(w("r")):
        if r.find(w("t")) is not None and (r.find(w("t")).text or "").strip():
            rp = r.find(w("rPr"))
            if rp is not None:
                rp = copy.deepcopy(rp)
                for h in rp.findall(w("highlight")):
                    rp.remove(h)
                return rp
    rp = p.find(".//" + w("rPr"))
    if rp is not None and rp.getparent().tag == w("r"):
        rp = copy.deepcopy(rp)
        for h in rp.findall(w("highlight")):
            rp.remove(h)
        return rp
    return None


def _run(rpr, text, hl=False, bold=None):
    r = etree.SubElement(etree.Element(w("dummy")), w("r"))
    r = etree.Element(w("r"))
    if rpr is not None or hl or bold is not None:
        rp = copy.deepcopy(rpr) if rpr is not None else etree.Element(w("rPr"))
        if bold is not None:
            for b in rp.findall(w("b")):
                rp.remove(b)
            b = etree.Element(w("b"))
            if not bold:
                b.set(w("val"), "0")
            rp.insert(0, b)
        if hl:
            h = etree.SubElement(rp, w("highlight"))
            h.set(w("val"), "yellow")
        r.append(rp)
    parts = text.split("\t")
    for i, part in enumerate(parts):
        if i:
            etree.SubElement(r, w("tab"))
        if part:
            t = etree.SubElement(r, w("t"))
            t.text = part
            t.set("{http://www.w3.org/XML/1998/namespace}space", "preserve")
    return r


def set_text(p, text, rpr=None, bold=None):
    if rpr is None:
        rpr = base_rpr(p)
    for ch in list(p):
        if ch.tag != w("pPr"):
            p.remove(ch)
    for seg in BR.split(text):
        if not seg:
            continue
        hl = seg in KEEP
        p.append(_run(rpr, seg, hl, bold))
    return p


def body_children(doc):
    return [c for c in doc.element.body if c.tag in (w("p"), w("tbl"))]


def find_p(doc, pred, start=None):
    els = body_children(doc)
    i0 = els.index(start) + 1 if start is not None else 0
    for el in els[i0:]:
        if el.tag == w("p") and pred(ptext(el)):
            return el
    raise KeyError("paragraph not found")


def find_p_prefix(doc, prefix, start=None):
    return find_p(doc, lambda t: t.startswith(prefix), start)


def next_el(el):
    n = el.getnext()
    while n is not None and n.tag not in (w("p"), w("tbl")):
        n = n.getnext()
    return n


def pstyle(p):
    ps = p.find(w("pPr"))
    if ps is None:
        return None
    s = ps.find(w("pStyle"))
    return s.get(w("val")) if s is not None else None


def is_bullet(el):
    return el is not None and el.tag == w("p") and pstyle(el) == "ListBullet"


def is_numbered(el):
    if el is None or el.tag != w("p"):
        return False
    ind = el.find(w("pPr") + "/" + w("ind"))
    return ind is not None and ind.get(w("hanging")) is not None


def replace_run_of(anchor, items, test):
    """Replace consecutive paragraphs after anchor matching test() with items."""
    cur = next_el(anchor)
    olds = []
    while test(cur):
        olds.append(cur)
        cur = next_el(cur)
    if not olds:
        raise ValueError("no items after anchor: " + ptext(anchor)[:60])
    proto = copy.deepcopy(olds[0])
    rpr = base_rpr(olds[0])
    last = anchor
    for o in olds:
        o.getparent().remove(o)
    for it in items:
        np_ = copy.deepcopy(proto)
        set_text(np_, it, rpr)
        last.addnext(np_)
        last = np_
    return last


def replace_bullets(anchor, items):
    return replace_run_of(anchor, items, is_bullet)


def replace_numbered(anchor, items):
    items = ["%d.\t%s" % (i + 1, t) for i, t in enumerate(items)]
    return replace_run_of(anchor, items, is_numbered)


def replace_normals_between(doc, start_p, end_pred, items):
    """Paragraphs strictly after start_p up to (not incl.) the one where end_pred(text)."""
    cur = next_el(start_p)
    olds = []
    while cur is not None and not (cur.tag == w("p") and end_pred(ptext(cur))):
        olds.append(cur)
        cur = next_el(cur)
    proto = copy.deepcopy([o for o in olds if o.tag == w("p")][0])
    rpr = base_rpr(proto)
    for o in olds:
        o.getparent().remove(o)
    last = start_p
    for it in items:
        np_ = copy.deepcopy(proto)
        set_text(np_, it, rpr)
        last.addnext(np_)
        last = np_
    return last


def table_after(p):
    n = next_el(p)
    while n is not None and n.tag != w("tbl"):
        n = next_el(n)
    return n


def cell_set(tc, text, bold=None):
    ps = tc.findall(w("p"))
    for extra in ps[1:]:
        tc.remove(extra)
    set_text(ps[0], text, bold=bold)


def fill_table(tbl, rows, header_rows=1):
    trs = tbl.findall(w("tr"))
    proto = copy.deepcopy(trs[header_rows] if len(trs) > header_rows else trs[-1])
    for tr in trs[header_rows:]:
        tbl.remove(tr)
    for row in rows:
        tr = copy.deepcopy(proto)
        tcs = tr.findall(w("tc"))
        bold = None
        if isinstance(row, dict):
            bold = row.get("bold")
            row = row["cells"]
        for tc, val in zip(tcs, row):
            cell_set(tc, str(val), bold=bold)
        tbl.append(tr)


def table_rows(tbl):
    return [[ptext(p) for p in []] for _ in []]


def delete(el):
    el.getparent().remove(el)


def strip_brackets_everywhere(doc, subst):
    """Apply substitution map; any leftover [x] not in KEEP -> x (brackets removed)."""
    leftovers = set()
    for p in doc.element.body.iter(w("p")):
        t = ptext(p)
        has_hl = p.find(".//" + w("highlight")) is not None
        nt = t
        for a, b in subst:
            nt = nt.replace(a, b)
        if "[" not in nt and not has_hl and nt == t:
            continue

        def fix(m):
            s = m.group(1)
            if s in KEEP:
                return s
            leftovers.add(s)
            return s[1:-1]
        nt = BR.sub(fix, nt)
        if nt != t or has_hl:
            set_text(p, nt)
    return leftovers


def set_footer(doc, code):
    for sec in doc.sections:
        for p in sec.footer.paragraphs:
            for r in p.runs:
                if "ППР-" in r.text:
                    r.text = re.sub(r"ППР-.*?(\s+Лист)", "ППР-%s\\1" % code, r.text)


def toc_static(doc, headings):
    """Replace TOC field result with static list of headings (field stays updatable)."""
    tocp = find_p(doc, lambda t: t.startswith("Чтобы увидеть содержание"))
    runs = tocp.findall(w("r"))
    r = runs[0]
    # remove result text inside the field run
    for t in r.findall(w("t")):
        r.remove(t)
    # split: begin+instr+separate stay in r; end fldChar moved to last paragraph
    end = [fc for fc in r.findall(w("fldChar")) if fc.get(w("fldCharType")) == "end"][0]
    r.remove(end)
    rpr = etree.Element(w("rPr"))
    etree.SubElement(rpr, w("b")).set(w("val"), "0")
    etree.SubElement(rpr, w("i")).set(w("val"), "0")
    first = True
    last = tocp
    for lvl, text in headings:
        if first:
            tgt = tocp
            first = False
        else:
            tgt = copy.deepcopy(tocp)
            for ch in list(tgt):
                if ch.tag != w("pPr"):
                    tgt.remove(ch)
            last.addnext(tgt)
        ppr = tgt.find(w("pPr"))
        if ppr is None:
            ppr = etree.Element(w("pPr"))
            tgt.insert(0, ppr)
        for ch in list(ppr):
            ppr.remove(ch)
        sp = etree.SubElement(ppr, w("spacing"))
        sp.set(w("after"), "40")
        ind = etree.SubElement(ppr, w("ind"))
        ind.set(w("left"), "0" if lvl == 1 else "397")
        ind.set(w("firstLine"), "0")
        tgt.append(_run(rpr, text))
        last = tgt
    endrun = etree.SubElement(last, w("r"))
    endrun.append(end)


def enable_update_fields(doc):
    st = doc.settings.element
    if st.find(w("updateFields")) is None:
        u = etree.SubElement(st, w("updateFields"))
        u.set(w("val"), "true")


def collect_headings(doc):
    hs = []
    for p in body_children(doc):
        if p.tag != w("p"):
            continue
        s = pstyle(p)
        t = ptext(p)
        if s == "Heading1" and t != "Содержание":
            hs.append((1, t))
        elif s == "Heading2":
            hs.append((2, t))
    return hs


def labor_rows(stages):
    """stages: list of (name, unit, vol, zone, prod_per_mday or None, mdays_fixed, crew)."""
    plan, cal = [], []
    total = 0
    for i, st in enumerate(stages, 1):
        name, unit, vol, zone, prod, fixed, crew = st
        if prod:
            md = max(1, math.ceil(float(str(vol).replace(" ", "").replace(",", ".")) / prod))
        else:
            md = fixed
        dur = max(1, math.ceil(md / crew))
        total += dur
        plan.append([str(i), name, unit, fmt(vol), zone])
        cal.append([str(i), name, str(md), str(crew), "[дд.мм]", "[дд.мм]", str(dur)])
    return plan, cal, total


def fmt(v):
    if isinstance(v, (int,)):
        return "{:,}".format(v).replace(",", " ")
    if isinstance(v, float):
        s = ("%.1f" % v).replace(".", ",")
        return s
    return str(v)
