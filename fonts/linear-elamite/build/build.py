"""Build the Linear Elamite font from traced outlines: LE001 to LE348 at U+E001 to U+E15C (Private Use Area)."""
import sys, os, json
from fontTools.fontBuilder import FontBuilder
from fontTools.pens.t2CharStringPen import T2CharStringPen
from fontTools.pens.boundsPen import BoundsPen
from fontTools.pens.recordingPen import RecordingPen
from fontTools.ttLib import TTFont

SRC, OUT = sys.argv[1], sys.argv[2]
BASE = 0xE000                 # LEnnn -> U+E000 + nnn
ASC, DESC, SIDE = 880, -120, 60
FAMILY = "Luma Linear Elamite"

def record(curves):
    """Outlines in font units, y up (an SVG y of 0 is the ascender, 1000 the descender)."""
    pen = RecordingPen()
    f = lambda p: (p[0], ASC - p[1])
    for c in curves:
        pen.moveTo(f(c["start"]))
        for seg in c["segs"]:
            if seg[0] == "L":
                pen.lineTo(f(seg[1])); pen.lineTo(f(seg[2]))
            else:
                pen.curveTo(f(seg[1]), f(seg[2]), f(seg[3]))
        pen.closePath()
    return pen

files = sorted(f for f in os.listdir(SRC) if f.endswith(".json"))
order, cmap, charstrings, metrics = [".notdef", "space"], {0x20: "space"}, {}, {}

def blank(width):
    p = T2CharStringPen(width, None); return p.getCharString()

nd = T2CharStringPen(600, None)
for (x0, y0, x1, y1) in [(60, 0, 540, 700), (110, 50, 490, 650)]:
    pts = [(x0, y0), (x1, y0), (x1, y1), (x0, y1)] if x0 == 60 else [(x0, y0), (x0, y1), (x1, y1), (x1, y0)]
    nd.moveTo(pts[0]); [nd.lineTo(p) for p in pts[1:]]; nd.closePath()
charstrings[".notdef"] = nd.getCharString(); metrics[".notdef"] = (600, 60)
charstrings["space"] = blank(400); metrics["space"] = (400, 0)

for fn in files:
    n = int(fn[2:5]); name = f"LE{n:03d}"
    rec = record(json.load(open(os.path.join(SRC, fn))))
    bp = BoundsPen(None); rec.replay(bp)
    xmin, ymin, xmax, ymax = bp.bounds
    dx = SIDE - xmin
    width = round(xmax - xmin + 2 * SIDE)
    pen = T2CharStringPen(width, None)
    class Shift:
        def moveTo(s, p): pen.moveTo((p[0] + dx, p[1]))
        def lineTo(s, p): pen.lineTo((p[0] + dx, p[1]))
        def curveTo(s, *ps): pen.curveTo(*[(p[0] + dx, p[1]) for p in ps])
        def closePath(s): pen.closePath()
    rec.replay(Shift())
    charstrings[name] = pen.getCharString()
    metrics[name] = (width, SIDE)
    order.append(name); cmap[BASE + n] = name

fb = FontBuilder(1000, isTTF=False)
fb.setupGlyphOrder(order)
fb.setupCharacterMap(cmap)
fb.setupCFF(FAMILY.replace(" ", ""), {"FullName": FAMILY}, charstrings, {})
fb.setupHorizontalMetrics(metrics)
fb.setupHorizontalHeader(ascent=ASC, descent=DESC)
fb.setupNameTable({
    "familyName": FAMILY, "styleName": "Regular",
    "copyright": "Copyright 2026 Joachim Piguet. Sign drawings after the sign list of Desset et al. 2022.",
    "version": "Version 1.000", "psName": FAMILY.replace(" ", "") + "-Regular",
    "licenseDescription": "This Font Software is licensed under the SIL Open Font License, Version 1.1.",
    "licenseInfoURL": "https://openfontlicense.org",
    "description": "Linear Elamite signs LE001-LE348, numbered after Desset et al. 2022, encoded at U+E001-U+E15C in the Private Use Area until Unicode encodes the script.",
})
fb.setupOS2(sTypoAscender=ASC, sTypoDescender=DESC, sTypoLineGap=0, usWinAscent=ASC, usWinDescent=-DESC, achVendID="LUMA", fsType=0)
fb.setupPost()
fb.save(OUT + ".otf")
f = TTFont(OUT + ".otf"); f.flavor = "woff2"; f.save(OUT + ".woff2")
print(len(order) - 2, "signs;", os.path.getsize(OUT + ".otf"), "bytes otf,", os.path.getsize(OUT + ".woff2"), "bytes woff2")
