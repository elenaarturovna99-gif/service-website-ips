import sys, os, zipfile, importlib
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
TPL_ZIP = os.path.join(HERE, "..", "..", "public", "files", "ppr-shkola-13-razdelov.zip")
TPL_DIR = "/tmp/ppr_tpl"
OUT = sys.argv[1] if len(sys.argv) > 1 and not sys.argv[1].isdigit() else "/tmp/ppr_out"
only = [a for a in sys.argv[1:] if a.isdigit()]
z = zipfile.ZipFile(TPL_ZIP)
TPL = {}
for i in z.infolist():
    if i.filename.endswith(".docx"):
        p = os.path.join(TPL_DIR, os.path.basename(i.filename))
        os.makedirs(TPL_DIR, exist_ok=True)
        open(p, "wb").write(z.read(i))
        TPL[os.path.basename(i.filename)[4:6]] = p
from common import build
os.makedirs(OUT, exist_ok=True)
for m in ["cfg_ss", "cfg_ss2", "cfg_eo"]:
    for k, c in importlib.import_module(m).CFG.items():
        if only and k not in only:
            continue
        c["key"] = k
        build(TPL[c["tpl"]], c, os.path.join(OUT, c["file"] + ".docx"))
        print(k, "OK")
