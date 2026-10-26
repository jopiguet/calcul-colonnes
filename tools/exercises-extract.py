#!/usr/bin/env python3
"""
Extract the exercises of an English workbook (Grammar in Use, Vocabulary in
Use, Idioms in Use…) into an exercise book for Luma: one cropped image per
exercise, the gaps found on it, and the answer key, item by item.

    python3 tools/exercises-extract.py <profile> <book.pdf> [--out data/exercises] [--units 1-20] [--report]

The output, data/exercises/<book id>/ (book.json and images/), is the book's
content: it stays in data/, which is never committed nor shipped, and is
imported with `npm run exercises:import -- data/exercises/<book id>`.

Three kinds of PDF are handled, each by its profile's `mode`:
  vector      text and dotted gaps drawn as vectors (gaps = dashed lines)
  background  text over a page image that holds the dotted lines
  scan        a scanned page: words by Tesseract OCR, gaps as rows of dots

Needs: python3 -m pip install pymupdf opencv-python-headless pillow pytesseract
and the tesseract program for scans. See docs/exercises.md.
"""
from __future__ import annotations

import argparse
import json
import os
import re
import sys
from dataclasses import dataclass, field

import cv2
import numpy as np
import pymupdf
from PIL import Image

# --------------------------------------------------------------------------- profiles

PROFILES: dict[str, dict] = {
    "grammar-in-use-5": {
        "title": "Murphy, English Grammar in Use (5th edition)", "source": "Grammar in Use", "level": "B1–B2", "mode": "vector",
        "kind": "grammar",
        "exercise_pages": [14, 302], "key_pages": [347, 378],
    },
    "grammar-in-use-intermediate": {
        "title": "Murphy, Grammar in Use Intermediate", "source": "Grammar in Use Intermediate", "level": "B1–B2", "mode": "scan",
        "kind": "grammar",
        "exercise_pages": [11, 294], "key_pages": [320, 349],
    },
    "vocabulary-in-use-elementary": {
        "title": "Vocabulary in Use Elementary (3rd edition)", "source": "Vocabulary Elementary", "level": "A1–A2", "mode": "background",
        "kind": "vocabulary",
        "exercise_pages": [9, 127], "key_pages": [128, 157],
    },
    "vocabulary-in-use-pre-intermediate": {
        "title": "English Vocabulary in Use Pre-intermediate and Intermediate", "source": "Vocabulary Pre-intermediate", "level": "A2–B1", "mode": "background",
        "kind": "vocabulary",
        "exercise_pages": [11, 207], "key_pages": [208, 244],
    },
    "vocabulary-in-use-upper-intermediate": {
        "title": "English Vocabulary in Use Upper-intermediate", "source": "Vocabulary Upper-intermediate", "level": "B2", "mode": "background",
        "kind": "vocabulary",
        "exercise_pages": [9, 209], "key_pages": [210, 256],
    },
    "vocabulary-in-use-advanced": {
        "title": "English Vocabulary in Use Advanced (3rd edition)", "source": "Vocabulary Advanced", "level": "C1–C2", "mode": "vector",
        "kind": "vocabulary",
        "exercise_pages": [10, 210], "key_pages": [211, 276],
    },
    "academic-vocabulary-in-use": {
        "title": "McCarthy and O'Dell, Academic Vocabulary in Use", "source": "Academic Vocabulary", "level": "B2–C1", "mode": "vector",
        "kind": "vocabulary",
        "exercise_pages": [10, 110], "key_pages": [133, 159],
    },
    "idioms-in-use-intermediate": {
        "title": "English Idioms in Use Intermediate", "source": "Idioms Intermediate", "level": "B1–B2", "mode": "scan",
        "kind": "idioms",
        "exercise_pages": [5, 131], "key_pages": [132, 166],
    },
    "idioms-in-use-advanced": {
        "title": "English Idioms in Use Advanced", "source": "Idioms Advanced", "level": "C1–C2", "mode": "scan",
        "kind": "idioms",
        "exercise_pages": [9, 127], "key_pages": [128, 163],
    },
}
# A profile may also set: "exercise_pages": [first, last] and "key_pages": [first, last]
# (0-based, inclusive) when the automatic search gets them wrong; "ocr_dpi"; "target_width".

# --------------------------------------------------------------------------- words


@dataclass
class Word:
    x0: float
    y0: float
    x1: float
    y1: float
    text: str


@dataclass
class Segment:
    """Words on one row with no wide space between them."""
    words: list[Word]
    x0: float = 0
    y0: float = 0
    x1: float = 0
    y1: float = 0

    def __post_init__(self) -> None:
        self.x0 = min(w.x0 for w in self.words)
        self.x1 = max(w.x1 for w in self.words)
        self.y0 = min(w.y0 for w in self.words)
        self.y1 = max(w.y1 for w in self.words)

    @property
    def text(self) -> str:
        return " ".join(w.text for w in self.words)

    @property
    def mid(self) -> float:
        return (self.y0 + self.y1) / 2


def ocr_words(page: pymupdf.Page, dpi: int, cache: str, psm: int = 4) -> list[Word]:
    """Tesseract's words, in points, cached per page."""
    if psm != 4:
        cache = cache.replace(".json", f".psm{psm}.json")
    if os.path.exists(cache):
        return [Word(*w) for w in json.load(open(cache))]
    import pytesseract

    pix = page.get_pixmap(dpi=dpi, colorspace=pymupdf.csGRAY)
    img = Image.frombytes("L", (pix.w, pix.h), pix.samples)
    data = pytesseract.image_to_data(img, lang="eng", config=f"--psm {psm}", output_type=pytesseract.Output.DICT)
    s = 72 / dpi
    words = []
    for i, t in enumerate(data["text"]):
        t = t.strip()
        if not t or float(data["conf"][i]) < 0 and len(t) < 2:
            continue
        x, y, w, h = data["left"][i], data["top"][i], data["width"][i], data["height"][i]
        words.append([x * s, y * s, (x + w) * s, (y + h) * s, t])
    os.makedirs(os.path.dirname(cache), exist_ok=True)
    json.dump(words, open(cache, "w"))
    return [Word(*w) for w in words]


def page_words(page: pymupdf.Page, mode: str, dpi: int, cache: str, psm: int = 4) -> list[Word]:
    if mode == "scan":
        return ocr_words(page, dpi, cache, psm)
    return [Word(w[0], w[1], w[2], w[3], w[4]) for w in page.get_text("words") if w[4].strip()]


def rows_of(words: list[Word]) -> list[list[Word]]:
    """Words grouped by line: overlapping vertical extents."""
    rows: list[list[Word]] = []
    for w in sorted(words, key=lambda w: ((w.y0 + w.y1) / 2, w.x0)):
        mid = (w.y0 + w.y1) / 2
        for r in rows[-4:]:
            ry0 = sum(x.y0 for x in r) / len(r)
            ry1 = sum(x.y1 for x in r) / len(r)
            overlap = min(ry1, w.y1) - max(ry0, w.y0)
            if overlap >= 0.5 * min(ry1 - ry0, w.y1 - w.y0) or abs(mid - (ry0 + ry1) / 2) < 2.5:
                r.append(w)
                break
        else:
            rows.append([w])
    for r in rows:
        r.sort(key=lambda w: w.x0)
    rows.sort(key=lambda r: sum((w.y0 + w.y1) / 2 for w in r) / len(r))
    return rows


def segments_of(words: list[Word], gap: float = 9.0) -> list[Segment]:
    segs = []
    for r in rows_of(words):
        cur = [r[0]]
        for w in r[1:]:
            h = max(4.0, cur[-1].y1 - cur[-1].y0)
            if w.x0 - cur[-1].x1 > max(gap, h * 1.1):
                segs.append(Segment(cur))
                cur = [w]
            else:
                cur.append(w)
        segs.append(Segment(cur))
    return segs


# --------------------------------------------------------------------------- gaps


def gray_page(page: pymupdf.Page, mode: str, dpi: int) -> tuple[np.ndarray, float]:
    """A grey image of the page and its pixels per point. For `background`, the page's own image."""
    if mode == "background":
        imgs = page.get_images()
        if len(imgs) >= 1:
            pix = pymupdf.Pixmap(page.parent, imgs[0][0])
            if pix.n - pix.alpha > 3 or pix.colorspace is None or pix.colorspace.n not in (1, 3):
                pix = pymupdf.Pixmap(pymupdf.csRGB, pix)
            a = np.frombuffer(pix.samples, np.uint8).reshape(pix.h, pix.w, pix.n)
            g = a[:, :, :3].mean(axis=2).astype(np.uint8) if pix.n >= 3 else a[:, :, 0].copy()
            return g, pix.w / page.rect.width
    pix = page.get_pixmap(dpi=dpi, colorspace=pymupdf.csGRAY)
    return np.frombuffer(pix.samples, np.uint8).reshape(pix.h, pix.w).copy(), dpi / 72


def gaps_vector(page: pymupdf.Page) -> list[tuple[float, float, float]]:
    """Dashed horizontal lines: (x, y, width) in points."""
    out = []
    for g in page.get_drawings():
        dashes = g.get("dashes")
        if not dashes or dashes.startswith("[] "):
            continue
        for it in g["items"]:
            if it[0] != "l":
                continue
            a, b = it[1], it[2]
            if abs(a.y - b.y) < 0.6 and abs(b.x - a.x) >= 10:
                out.append((min(a.x, b.x), a.y, abs(b.x - a.x)))
    return merge_gaps(out) + boxes_vector(page)


def boxes_vector(page: pymupdf.Page) -> list[tuple[float, float, float]]:
    """Empty square boxes to write a letter in (matching exercises): (x, y_bottom, width)."""
    out = []
    for g in page.get_drawings():
        if g.get("fill") is not None or g["type"] != "s":
            continue
        for it in g["items"]:
            r = None
            if it[0] == "re":
                r = it[1]
            elif it[0] == "qu":
                r = it[1].rect
            if r is not None and 6 <= r.width <= 18 and 6 <= r.height <= 18 and abs(r.width - r.height) < 3:
                out.append((r.x0, r.y1, r.width))
    return out


def gaps_background(gray: np.ndarray, scale: float) -> list[tuple[float, float, float]]:
    """Dotted lines in a background image without text: thin rows of dots."""
    dark = (gray < 225).astype(np.uint8)
    hmax = max(3, int(round(2.2 * scale)))
    close = max(2, int(round(2.5 * scale)))
    tall = cv2.morphologyEx(dark, cv2.MORPH_OPEN, np.ones((hmax + 1, 1), np.uint8))
    flat = dark & (1 - cv2.dilate(tall, np.ones((3, 3), np.uint8)))
    joined = cv2.morphologyEx(flat, cv2.MORPH_CLOSE, np.ones((1, close + 1), np.uint8))
    m, _, st, _ = cv2.connectedComponentsWithStats(joined, connectivity=8)
    out = []
    for i in range(1, m):
        x, y, w, h, _a = st[i]
        if w < 14 * scale or h > hmax + 1:
            continue
        seg = flat[y : y + h, x : x + w].max(axis=0)
        if int((np.diff(seg.astype(np.int8)) == 1).sum()) >= w / (6 * scale):
            out.append((x / scale, (y + h) / scale, w / scale))
    return merge_gaps(out)


def gaps_scan(gray: np.ndarray, scale: float) -> list[tuple[float, float, float]]:
    """Rows of printed dots in a scan: tiny components on one line, joined."""
    dark = (gray < 170).astype(np.uint8)
    n, lab, stats, _ = cv2.connectedComponentsWithStats(dark, connectivity=8)
    dmax = max(2, round(1.6 * scale))
    small = np.zeros(n, np.uint8)
    keep = (stats[:, 2] <= dmax) & (stats[:, 3] <= dmax) & (stats[:, 4] <= dmax * dmax)
    small[keep] = 1
    small[0] = 0
    dots = small[lab]
    k = max(3, round(4.5 * scale))
    joined = cv2.morphologyEx(dots, cv2.MORPH_CLOSE, np.ones((1, k), np.uint8))
    m, _, st2, _ = cv2.connectedComponentsWithStats(joined, connectivity=8)
    out = []
    for i in range(1, m):
        x, y, w, h, _a = st2[i]
        if w >= 18 * scale and h <= dmax + 2:
            seg = dots[y : y + h, x : x + w]
            cols = (seg.sum(axis=0) > 0).astype(np.int8)
            starts = int((np.diff(np.concatenate([[0], cols])) == 1).sum())
            if starts >= w / (k + 1) * 0.5:
                out.append((x / scale, (y + h) / scale, w / scale))
    return merge_gaps(out)


def merge_gaps(gaps: list[tuple[float, float, float]]) -> list[tuple[float, float, float]]:
    """Pieces of one line (same row, touching) become one gap."""
    gaps = sorted(gaps, key=lambda g: (round(g[1]), g[0]))
    out: list[list[float]] = []
    for x, y, w in gaps:
        if out and abs(out[-1][1] - y) < 1.5 and x - (out[-1][0] + out[-1][2]) < 8:
            out[-1][2] = max(out[-1][0] + out[-1][2], x + w) - out[-1][0]
        else:
            out.append([x, y, w])
    return [(a, b, c) for a, b, c in out]


# --------------------------------------------------------------------------- the key



def norm_id(t: str) -> str | None:
    t = t.strip().rstrip(".:")
    t = t.replace(",", ".").replace("·", ".")
    t = re.sub(r"[Il|!\\\]\[]", "1", t)
    t = t.replace("O", "0").replace("o", "0")
    m = re.fullmatch(r"(\d{1,3})\.(\d{1,2})", t)
    return f"{int(m.group(1))}.{int(m.group(2))}" if m else None


def item_no(t: str) -> int | None:
    t = t.strip().rstrip(".)")
    if re.fullmatch(r"\d{1,2}", t):
        n = int(t)
        return n if 1 <= n <= 40 else None
    if t in ("I", "l") :
        return 1
    return None


OPEN_HINTS = re.compile(r"(possible|example|suggested|model|sample)\s+answers?|your own answers?|own answers|answers will vary|free answers?", re.I)


@dataclass
class KeyExercise:
    id: str
    items: dict[str, str] = field(default_factory=dict)
    note: str = ""
    text: str = ""


def columns_of(segs: list[Segment], width: float) -> list[tuple[float, float]]:
    """Page-wide columns: x intervals no segment crosses."""
    cover = np.zeros(int(width) + 2, bool)
    for s in segs:
        cover[max(0, int(s.x0)) : min(len(cover), int(s.x1) + 1)] = True
    cols, start = [], None
    for x, c in enumerate(cover):
        if c and start is None:
            start = x
        if not c and start is not None:
            cols.append([start, x])
            start = None
    if start is not None:
        cols.append([start, len(cover)])
    merged: list[list[float]] = []
    for c in cols:
        if merged and c[0] - merged[-1][1] < 12:
            merged[-1][1] = c[1]
        else:
            merged.append(c)
    # a narrow strip (an exercise id in the margin) belongs to the column on its right
    out: list[list[float]] = []
    for c in merged:
        if out and out[-1][1] - out[-1][0] < 40:
            out[-1][1] = c[1]
        else:
            out.append(c)
    if len(out) > 1 and out[-1][1] - out[-1][0] < 40:
        out[-2][1] = out[-1][1]
        out.pop()
    return [(a, b) for a, b in out]


def parse_key(doc: pymupdf.Document, pages: range, mode: str, dpi: int, cache: str) -> dict[str, KeyExercise]:
    key: dict[str, KeyExercise] = {}
    cur: KeyExercise | None = None
    for pno in pages:
        page = doc[pno]
        words = page_words(page, mode, dpi, f"{cache}/{pno}.json")
        h = page.rect.height
        words = [w for w in words if h * 0.04 < w.y0 < h * 0.95]
        segs = segments_of(words, gap=8)
        segs = [s for s in segs if not re.fullmatch(r"(Key to Exercises|Answer key|Key|KEY|\d{1,3}|English .* in Use.*|.*Vocabulary in Use.*)", s.text.strip())]
        for c0, c1 in columns_of(segs, page.rect.width):
            col = sorted([s for s in segs if c0 - 1 <= s.x0 and s.x1 <= c1 + 1], key=lambda s: (round(s.mid / 3), s.x0))
            # rows within a column, in reading order; continuation goes to the item above at the same indent
            last: dict[str, tuple[float, float, float]] = {}  # item -> (x0, x1, y1)
            for s in col:
                ws = s.words
                if re.fullmatch(r"(UNIT|Unit)", ws[0].text) and len(ws) <= 3:
                    continue
                i = 0
                eid = norm_id(ws[0].text)
                if eid and re.fullmatch(r"\d+\.\d\d", eid):
                    # OCR joined the id and the first item number: "2.21" is 2.2, item 1 (no unit has 10 exercises)
                    ws = [Word(ws[0].x0, ws[0].y0, ws[0].x1, ws[0].y1, eid[:-1]), Word(ws[0].x1, ws[0].y0, ws[0].x1 + 4, ws[0].y1, eid[-1])] + ws[1:]
                    eid = eid[:-1]
                if eid:
                    cur = key.setdefault(eid, KeyExercise(eid))
                    last = {}
                    i = 1
                if cur is None or i >= len(ws):
                    continue
                rest = ws[i:]
                n = item_no(rest[0].text) if len(rest) > 1 or eid is None else None
                if n is not None and len(rest) > 1:
                    # several items on one segment: "2 b 3 a 4 c" — split on the next numbers in sequence
                    parts: list[tuple[int, list[Word]]] = [(n, [])]
                    for w in rest[1:]:
                        m = item_no(w.text)
                        if m is not None and m == parts[-1][0] + 1 and len(parts[-1][1]) >= 1:
                            parts.append((m, []))
                        else:
                            parts[-1][1].append(w)
                    for m, pw in parts:
                        cur.items[str(m)] = (cur.items.get(str(m), "") + " " + " ".join(w.text for w in pw)).strip()
                        last[str(m)] = (s.x0, s.x1, s.y1)
                    continue
                text = " ".join(w.text for w in rest)
                if OPEN_HINTS.search(text) and not cur.items:
                    cur.note = (cur.note + " " + text).strip()
                    continue
                # continuation: the item started above, nearest in indent
                best = None
                for k, (x0, x1, y1) in last.items():
                    if x0 - 4 <= s.x0 <= x1 and y1 <= s.y0 + 4:
                        if best is None or y1 > last[best][2] or (y1 == last[best][2] and x0 > last[best][0]):
                            best = k
                if best is not None:
                    cur.items[best] += " " + text
                    x0, x1, _ = last[best]
                    last[best] = (x0, max(x1, s.x1), s.y1)
                elif cur.items:
                    k = list(cur.items)[-1]
                    cur.items[k] += " " + text
                else:
                    cur.text = (cur.text + " " + text).strip()
    return key


# --------------------------------------------------------------------------- exercises


@dataclass
class Exercise:
    id: str
    page: int
    top: float
    bottom: float
    left: float
    right: float
    instruction: str = ""
    items: dict[str, dict] = field(default_factory=dict)
    image: str = ""
    width: int = 0
    height: int = 0


def find_pages(doc: pymupdf.Document, mode: str, dpi: int, cache: str, prof: dict) -> tuple[list[int], range]:
    """Exercise pages and key pages, unless the profile gives them."""
    n = len(doc)
    ex: list[int] = []
    if "exercise_pages" in prof and "key_pages" in prof:
        a, b = prof["exercise_pages"]
        return list(range(a, b + 1)), range(prof["key_pages"][0], prof["key_pages"][1] + 1)
    key_start = None
    for pno in range(n):
        page = doc[pno]
        if mode == "scan":
            words = page_words(page, mode, dpi, f"{cache}/{pno}.json")
            top = " ".join(w.text for w in sorted(words, key=lambda w: (w.y0, w.x0)) if w.y0 < page.rect.height * 0.12)
        else:
            top = " ".join(w[4] for w in page.get_text("words") if w[1] < page.rect.height * 0.12)
        if re.search(r"Key to Exercises|Answer key|Answer Key|^Key\b|KEY", top):
            if ex and key_start is None:
                key_start = pno
        elif re.search(r"\bExercises\b|\bEXERCISES\b", top):
            ex.append(pno)
    if "exercise_pages" in prof:
        a, b = prof["exercise_pages"]
        ex = list(range(a, b + 1))
    if "key_pages" in prof:
        kr = range(prof["key_pages"][0], prof["key_pages"][1] + 1)
    else:
        kr = range(key_start or n, n)
    return ex, kr


def exercises_on(page: pymupdf.Page, words: list[Word], known: set[str]) -> list[Exercise]:
    W, H = page.rect.width, page.rect.height
    segs = segments_of([w for w in words if H * 0.03 < w.y0 < H * 0.95])
    heads = []
    for s in segs:
        eid = norm_id(s.words[0].text)
        if eid and s.x0 < W * 0.3 and (eid in known or len(s.words) > 2):
            heads.append((s, eid))
    # one heading per id, the first
    seen = set()
    heads = [(s, e) for s, e in heads if not (e in seen or seen.add(e))]
    heads.sort(key=lambda t: t[0].y0)
    body = [s for s in segs if s.y1 < H * 0.94]
    bottom = max((s.y1 for s in body), default=H * 0.92) + 6
    out = []
    for i, (s, eid) in enumerate(heads):
        top = s.y0 - 5
        end = heads[i + 1][0].y0 - 5 if i + 1 < len(heads) else min(bottom, H - 4)
        e = Exercise(eid, page.number, top, end, W * 0.04, W * 0.97)
        # the instruction: the rest of the heading's row
        row = sorted([t for t in segs if abs(t.mid - s.mid) < 4 and t.x0 >= s.x0], key=lambda t: t.x0)
        e.instruction = " ".join([" ".join(w.text for w in s.words[1:])] + [t.text for t in row if t is not s]).strip()
        # the instruction may run onto the next line, at the same indent
        nxt = [t for t in segs if s.y1 < t.y0 < s.y1 + 14 and abs(t.x0 - s.words[min(1, len(s.words) - 1)].x0) < 4 and item_no(t.words[0].text) is None]
        if nxt and len(e.instruction) > 50:
            e.instruction += " " + nxt[0].text
        out.append(e)
    return out


def item_labels(segs: list[Segment], ex: Exercise, head_y1: float) -> list[tuple[int, float, float]]:
    """Item numbers that start a segment inside the exercise: (n, x, y)."""
    labels = []
    for s in segs:
        if not (ex.top < s.mid < ex.bottom) or s.y0 < head_y1 - 1:
            continue
        n = item_no(s.words[0].text)
        if n is not None and s.words[0].x1 - s.words[0].x0 < 14:
            labels.append((n, s.words[0].x0, s.mid))
    # keep the first of each number in reading order
    seen = set()
    out = []
    for n, x, y in sorted(labels, key=lambda t: (t[2], t[1])):
        if n not in seen:
            seen.add(n)
            out.append((n, x, y))
    return out


def owner(gx: float, gy: float, labels: list[tuple[int, float, float]]) -> int | None:
    best, bd = None, 1e9
    for n, x, y in labels:
        dy = gy - y
        dx = gx - x
        if dy < -6 or dx < -12:
            continue
        d = max(0.0, dy) + 0.5 * max(0.0, dx)
        if d < bd:
            best, bd = n, d
    return best


def render_crop(page: pymupdf.Page, ex: Exercise, out_dir: str, target_width: int) -> None:
    clip = pymupdf.Rect(ex.left, max(0, ex.top), ex.right, min(page.rect.height, ex.bottom))
    dpi = int(max(90, min(220, 72 * target_width / clip.width)))
    pix = page.get_pixmap(clip=clip, dpi=dpi)
    img = Image.frombytes("RGB" if pix.n == 3 else "RGBA", (pix.w, pix.h), pix.samples).convert("RGB")
    name = f"{ex.id}.webp"
    img.save(os.path.join(out_dir, name), "WEBP", quality=62, method=5)
    ex.image, ex.width, ex.height = name, pix.w, pix.h


def unit_title(doc: pymupdf.Document, pno: int, unit: int, mode: str, dpi: int, cache: str) -> str:
    """The unit's title: the largest line at the top of the page before its exercises."""
    for p in (pno - 1, pno):
        if p < 0:
            continue
        page = doc[p]
        if mode == "scan":
            words = page_words(page, mode, dpi, f"{cache}/{p}.json")
            rows = [r for r in rows_of(words) if r[0].y0 < page.rect.height * 0.2]
            if not rows:
                continue
            r = max(rows, key=lambda r: max(w.y1 - w.y0 for w in r))
            text = " ".join(w.text for w in r)
        else:
            best, size = "", 0.0
            for b in page.get_text("dict")["blocks"]:
                for line in b.get("lines", []):
                    if line["bbox"][1] > page.rect.height * 0.2:
                        continue
                    sz = max((sp["size"] for sp in line["spans"]), default=0)
                    t = "".join(sp["text"] for sp in line["spans"]).strip()
                    if t and sz > size and not re.fullmatch(r"(Unit|UNIT)?\s*\d*", t) and t != "Exercises":
                        best, size = t, sz
            text = best
        text = re.sub(rf"^(Unit|UNIT)?\s*{unit}\b\s*", "", text).strip(" –-")
        if len(text) > 3 and not re.search(r"Exercises|EXERCISES", text):
            return text
    return ""


def split_letters(answer: str) -> list[tuple[str, str]] | None:
    """ "a covers b is covered" → [("a", "covers"), ("b", "is covered")]: lettered sub-items, in order."""
    marks = [m for m in re.finditer(r"(?:^|(?<=\s))([a-h])\s+(?=\S)", answer)]
    if not marks or marks[0].start() != 0 or marks[0].group(1) not in "ab":
        return None
    chosen = [marks[0]]
    for m in marks[1:]:
        if ord(m.group(1)) == ord(chosen[-1].group(1)) + 1:
            chosen.append(m)
    if len(chosen) < 2:
        return None
    out = []
    for i, m in enumerate(chosen):
        end = chosen[i + 1].start() if i + 1 < len(chosen) else len(answer)
        part = answer[m.end():end].strip()
        if not part:
            return None
        out.append((m.group(1), part))
    return out


def extract(prof_id: str, pdf: str, out_root: str, units: tuple[int, int] | None, report: bool) -> None:
    prof = PROFILES[prof_id]
    mode = prof["mode"]
    dpi = prof.get("ocr_dpi", 200)
    doc = pymupdf.open(pdf)
    out = os.path.join(out_root, prof_id)
    img_dir = os.path.join(out, "images")
    cache = os.path.join(out, "ocr")
    os.makedirs(img_dir, exist_ok=True)
    ex_pages, key_pages = find_pages(doc, mode, dpi, cache, prof)
    print(f"{prof_id}: {len(ex_pages)} exercise pages, key on pages {key_pages.start + 1}–{key_pages.stop}", file=sys.stderr)
    key = parse_key(doc, key_pages, mode, dpi, cache)
    known = set(key)

    exercises: list[Exercise] = []
    first_page: dict[int, int] = {}
    for pno in ex_pages:
        page = doc[pno]
        words = page_words(page, mode, dpi, f"{cache}/{pno}.json")
        found = exercises_on(page, words, known)
        if not found:
            continue
        # one unit per page: an id with another unit lost a digit to the OCR ("2.4" among 32.x)
        units_here = [int(e.id.split(".")[0]) for e in found]
        page_unit = max(set(units_here), key=units_here.count)
        if units_here.count(page_unit) > 1:
            for e in found:
                if int(e.id.split(".")[0]) != page_unit:
                    e.id = f"{page_unit}.{e.id.split('.')[1]}"
        taken = {x.id for x in exercises}
        found = [e for e in found if e.id not in taken]
        if units:
            found = [e for e in found if units[0] <= int(e.id.split(".")[0]) <= units[1]]
            if not found:
                continue
        segs = segments_of(words)
        if mode == "vector":
            gaps = gaps_vector(page)
        else:
            gray, scale = gray_page(page, mode, dpi)
            gaps = gaps_background(gray, scale) if mode == "background" else gaps_scan(gray, scale)
        for e in found:
            unit = int(e.id.split(".")[0])
            first_page.setdefault(unit, pno)
            head = next((s for s in segs if norm_id(s.words[0].text) == e.id), None)
            labels = item_labels(segs, e, head.y1 if head else e.top)
            k = key.get(e.id)
            keyed = set(k.items) if k else set()
            # numbers written just before a gap, inside a text: "… a (3) ........ of …", "¹w ........"
            def inline_owner(gx: float, gy: float) -> int | None:
                left = sorted([w for w in words if abs((w.y0 + w.y1) / 2 - (gy - 4)) < 8 and w.x1 <= gx + 2 and gx - w.x1 < 16], key=lambda w: -w.x1)
                if not left:
                    return None
                w = left[0]
                m = re.fullmatch(r"\(?(\d{1,2})\)?[a-zA-Z]?", w.text)
                if m is None and re.fullmatch(r"[a-zA-Z]", w.text):
                    before = [v for v in words if abs((v.y0 + v.y1) / 2 - (w.y0 + w.y1) / 2) < 6 and v.x1 <= w.x0 + 1 and w.x0 - v.x1 < 4]
                    if before:
                        m = re.fullmatch(r"\(?(\d{1,2})\)?", max(before, key=lambda v: v.x1).text)
                if m is None:
                    return None
                k = int(m.group(1))
                return k if (not keyed or str(k) in keyed) else None
            for gx, gy, gw in gaps:
                if not (e.top < gy < e.bottom):
                    continue
                n = owner(gx, gy, labels)
                near = inline_owner(gx, gy)
                if near is not None:
                    n = near
                name = str(n) if n is not None else "1"
                if keyed and name not in keyed:
                    continue  # the worked example
                it = e.items.setdefault(name, {"n": name, "gaps": []})
                it["gaps"].append([gx, gy, gw])
            for name in keyed:
                e.items.setdefault(name, {"n": name, "gaps": []})
            render_crop(page, e, img_dir, prof.get("target_width", 1000))
            exercises.append(e)

    # OCR misreads: an exercise found without a key takes the unit's missing key id, in order
    by_unit_missing: dict[int, list[str]] = {}
    found_ids = {e.id for e in exercises}
    for kid in sorted(set(key) - found_ids, key=lambda s: [int(x) for x in s.split(".")]):
        by_unit_missing.setdefault(int(kid.split(".")[0]), []).append(kid)
    for e in sorted(exercises, key=lambda e: (e.page, e.top)):
        if e.id not in key:
            u = int(e.id.split(".")[0])
            if by_unit_missing.get(u):
                e.id = by_unit_missing[u].pop(0)
                old_image = os.path.join(img_dir, e.image)
                e.image = f"{e.id}.webp"
                os.replace(old_image, os.path.join(img_dir, e.image))
                k = key[e.id]
                for name in k.items:
                    e.items.setdefault(name, {"n": name, "gaps": []})

    # write
    units_out = {}
    book_exercises = []
    for e in exercises:
        u = int(e.id.split(".")[0])
        if u not in units_out:
            units_out[u] = {"n": u, "title": unit_title(doc, first_page.get(u, e.page), u, mode, dpi, cache)}
        k = key.get(e.id)
        ew, eh = e.right - e.left, e.bottom - e.top
        items = []
        for name in sorted(e.items, key=lambda s: int(s) if s.isdigit() else 99):
            it = e.items[name]
            gaps = [[round((x - e.left) / ew, 4), round((y - e.top) / eh, 4), round(w / ew, 4)] for x, y, w in sorted(it["gaps"], key=lambda g: (round(g[1] / 4), g[0]))]
            answer = (k.items.get(name, "") if k else "").strip()
            parts = split_letters(answer) if not gaps else None
            if parts:
                items.extend({"n": f"{name}{letter}", "answer": part, "gaps": []} for letter, part in parts)
            else:
                items.append({"n": name, "answer": answer, "gaps": gaps})
        open_ = bool(k and (k.note or not k.items)) or not k
        book_exercises.append({
            "id": e.id, "unit": u, "page": e.page + 1, "instruction": e.instruction,
            "image": e.image, "width": e.width, "height": e.height,
            "open": open_, "note": (k.note if k else "") or "", "keyText": (k.text if k and not k.items else "") or "",
            "items": items,
        })
    book = {
        "format": 1,
        "book": {"id": prof_id, "title": prof["title"], "source": prof["source"], "level": prof["level"], "kind": prof["kind"], "language": "en"},
        "units": [units_out[u] for u in sorted(units_out)],
        "exercises": book_exercises,
    }
    json.dump(book, open(os.path.join(out, "book.json"), "w"), ensure_ascii=False, indent=1)
    # report
    with_gaps = sum(1 for e in book_exercises if any(i["gaps"] for i in e["items"]))
    missing = sorted(set(key) - {e["id"] for e in book_exercises}, key=lambda s: [int(x) for x in s.split(".")])
    keyless = [e["id"] for e in book_exercises if e["id"] not in key]
    n_items = sum(len(e["items"]) for e in book_exercises)
    n_gapped = sum(1 for e in book_exercises for i in e["items"] if i["gaps"])
    print(f"{len(book['units'])} units, {len(book_exercises)} exercises ({with_gaps} with gaps), {n_items} items ({n_gapped} filled in place)", file=sys.stderr)
    print(f"key: {len(key)} exercises; not found on the pages: {len(missing)}; found without a key: {len(keyless)}", file=sys.stderr)
    if report:
        print("missing:", " ".join(missing[:80]), file=sys.stderr)
        print("keyless:", " ".join(keyless[:80]), file=sys.stderr)


def _ocr_one(args: tuple[str, int, int, str, int]) -> None:
    pdf, pno, dpi, cache, psm = args
    os.environ["OMP_THREAD_LIMIT"] = "1"
    doc = pymupdf.open(pdf)
    ocr_words(doc[pno], dpi, f"{cache}/{pno}.json", psm)


def ocr_all(prof_id: str, pdf: str, out_root: str, pages: tuple[int, int] | None, psm: int, workers: int) -> None:
    """OCR a scanned book ahead, in parallel; the cache makes later runs fast. Interruptible."""
    from multiprocessing import Pool

    prof = PROFILES[prof_id]
    dpi = prof.get("ocr_dpi", 200)
    n = len(pymupdf.open(pdf))
    a, b = pages or (0, n - 1)
    cache = os.path.join(out_root, prof_id, "ocr")
    os.makedirs(cache, exist_ok=True)
    todo = [(pdf, p, dpi, cache, psm) for p in range(a, b + 1)
            if not os.path.exists(f"{cache}/{p}.json" if psm == 4 else f"{cache}/{p}.psm{psm}.json")]
    print(f"OCR: {len(todo)} pages to do", file=sys.stderr)
    with Pool(workers) as pool:
        for i, _ in enumerate(pool.imap_unordered(_ocr_one, todo), 1):
            if i % 20 == 0:
                print(f"  {i}/{len(todo)}", file=sys.stderr)


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("profile", choices=sorted(PROFILES))
    ap.add_argument("pdf")
    ap.add_argument("--out", default="data/exercises")
    ap.add_argument("--units", help="only these units, e.g. 1-20")
    ap.add_argument("--report", action="store_true", help="list the exercises not matched")
    ap.add_argument("--ocr-only", action="store_true", help="scans: only run the OCR (cached), e.g. --pages 0-99")
    ap.add_argument("--pages", help="with --ocr-only: 0-based page range")
    ap.add_argument("--psm", type=int, default=4, help="with --ocr-only: Tesseract page segmentation mode")
    ap.add_argument("--workers", type=int, default=os.cpu_count() or 2)
    a = ap.parse_args()
    if a.ocr_only:
        pages = tuple(int(x) for x in a.pages.split("-")) if a.pages else None
        ocr_all(a.profile, a.pdf, a.out, pages, a.psm, a.workers)  # type: ignore[arg-type]
        return
    units = tuple(int(x) for x in a.units.split("-")) if a.units else None
    extract(a.profile, a.pdf, a.out, units, a.report)  # type: ignore[arg-type]


if __name__ == "__main__":
    main()
