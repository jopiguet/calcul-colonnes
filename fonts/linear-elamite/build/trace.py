"""Trace each cleaned sign SVG into font outlines (units: 1000 per em, y up)."""
import sys, os, json, subprocess, time
import numpy as np
from PIL import Image
import potrace

SRC, OUT = sys.argv[1], sys.argv[2]
RES = 2000                     # render size in px; 2 px per font unit
os.makedirs(OUT, exist_ok=True)
names = sorted(f for f in os.listdir(SRC) if f.endswith(".svg"))
if len(sys.argv) > 3: names = [n for n in names if n[:-4] in sys.argv[3:]]
for name in names:
    t = time.time()
    png = os.path.join(OUT, name[:-4] + ".png")
    subprocess.run(["rsvg-convert", "-w", str(RES), "-h", str(RES), "-b", "white", os.path.join(SRC, name), "-o", png], check=True)
    a = np.asarray(Image.open(png).convert("L")) >= 128   # potracer inverts: pass the white mask
    bmp = potrace.Bitmap(a)
    path = bmp.trace(turdsize=8, turnpolicy=potrace.POTRACE_TURNPOLICY_MINORITY, alphamax=1.0, opticurve=True, opttolerance=0.2)
    s = 1000 / RES
    P = lambda p: [round(p.x * s, 1), round(p.y * s, 1)]
    curves = []
    for c in path:
        segs = []
        for seg in c.segments:
            if seg.is_corner: segs.append(["L", P(seg.c), P(seg.end_point)])
            else: segs.append(["C", P(seg.c1), P(seg.c2), P(seg.end_point)])
        curves.append({"start": P(c.start_point), "segs": segs})
    json.dump(curves, open(os.path.join(OUT, name[:-4] + ".json"), "w"))
    os.remove(png)
    print(name, len(curves), f"{time.time()-t:.1f}s", flush=True)
