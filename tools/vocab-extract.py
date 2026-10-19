#!/usr/bin/env python3
"""
Extracts the vocabulary of a Collins "3000 words and phrases" PDF into the
JSON format read by `npm run vocab:import` (format 2, see docs/vocabulary.md).

    pip install pdfplumber
    python3 tools/vocab-extract.py book.pdf > data/vocab.json

Run it on your own copy of the book. The result is for your own use: keep it
out of version control (data/ is ignored) and the app behind its sign-in.

How the book is laid out, and how this script reads it:

- A chapter starts on a picture page whose title is in small capitals, 12 pt:
  "TRANSPORT | LOS MEDIOS DE TRANSPORTE". It becomes a lesson. The words
  labelling the picture become the lesson's first section.
- A section starts with a banner in small capitals, 10 pt: "CAR | EL COCHE".
- Inside a section, small headings (small capitals, bold, 7.5 pt) such as
  "VOCABULARY" or "INTERIOR" become groups.
- An entry is one or more lines in the regular font (English), followed by one
  or more lines in the bold font (Spanish), in the same column.

Only fonts and positions are used, so the script should also read the other
languages of the same series. Lines it cannot pair (notes, captions) are
counted on stderr.
"""
import json
import re
import sys
from dataclasses import dataclass, field

import pdfplumber


@dataclass
class Line:
    page: int
    x0: float
    top: float
    kind: str  # en, es, chapter, section, group
    text: str
    feminine: bool = False


@dataclass
class Section:
    title_en: str
    title_es: str
    entries: list = field(default_factory=list)


@dataclass
class Lesson:
    title_en: str
    title_es: str
    sections: list = field(default_factory=list)


def kind_of(font: str, size: float) -> str | None:
    font = font.split("+")[-1]
    size = round(size, 1)
    if font.startswith("FrescoSansSC"):
        if size == 12.0:
            return "chapter"
        if size == 10.0:
            return "section"
        if size == 7.5 and "Bold" in font:
            return "group"
        return None
    if size != 7.5:
        return None  # page numbers, credits
    if font == "FrescoSans-Normal":
        return "en"
    if font == "FrescoSans-Bold":
        return "es"
    if font == "FrescoSans-NormalItalic":
        return "italic"  # gender marks such as "f" after a Spanish noun
    return None


def clean(text: str) -> str:
    return re.sub(r"\s+", " ", text).strip()


def page_lines(page, number: int) -> list[Line]:
    """Words grouped into lines of one style, at one position."""
    words = page.extract_words(
        extra_attrs=["fontname", "size"], keep_blank_chars=True, x_tolerance=1.5, y_tolerance=2
    )
    raw: list[Line] = []
    for w in words:
        kind = kind_of(w["fontname"], w["size"])
        if kind is None or w["x0"] < 0 or w["x0"] > page.width:
            continue  # printer's marks of the facing page lie outside this one
        raw.append(Line(number, w["x0"], w["top"], kind, w["text"]))

    # Headings: the English part (bold) and the Spanish part (normal) sit on
    # one line, separated by "|". Merge everything on that line.
    lines: list[Line] = []
    headings: dict[tuple[str, int], list[Line]] = {}
    for line in raw:
        if line.kind in ("chapter", "section"):
            headings.setdefault((line.kind, round(line.top)), []).append(line)
        else:
            lines.append(line)
    merged: list[Line] = []
    for (kind, top), parts in sorted(headings.items(), key=lambda h: h[0][1]):
        parts.sort(key=lambda p: p.x0)
        text = clean(" ".join(p.text for p in parts))
        # A long title wraps: "flowers, plants, and trees |" then the Spanish
        # half on the next line.
        prev = merged[-1] if merged else None
        if prev and prev.kind == kind and 0 < top - prev.top <= 14 and prev.text.endswith("|"):
            prev.text = f"{prev.text} {text}"
            continue
        merged.append(Line(number, parts[0].x0, top, kind, text))
    lines.extend(merged)

    # An italic mark ("f") belongs to the Spanish line it follows.
    marks = [l for l in lines if l.kind == "italic"]
    lines = [l for l in lines if l.kind != "italic"]
    for mark in marks:
        if clean(mark.text) != "f":
            continue
        owner = min(
            (l for l in lines if l.kind == "es" and abs(l.top - mark.top) < 2 and l.x0 < mark.x0),
            key=lambda l: mark.x0 - l.x0,
            default=None,
        )
        if owner:
            owner.feminine = True
    return lines


ACRONYMS = {"diy": "DIY", "gps": "GPS", "tv": "TV", "dvd": "DVD"}


def sentence_case(text: str) -> str:
    """Small capitals come out lower-case: capitalise the first letter only."""
    words = [ACRONYMS.get(w, w) for w in clean(text).split(" ")]
    out = " ".join(words)
    return out[:1].upper() + out[1:]


def split_heading(text: str) -> tuple[str, str]:
    en, _, es = text.partition("|")
    return sentence_case(en), sentence_case(es)


def extract(path: str) -> dict:
    lessons: list[Lesson] = []
    orphans = 0
    started = False
    with pdfplumber.open(path) as pdf:
        for number, page in enumerate(pdf.pages, start=1):
            lines = page_lines(page, number)
            if any(l.kind == "chapter" for l in lines):
                started = True
            if not started:
                continue  # cover, credits, contents, introduction

            # Headings cut the page into bands; inside a band, read column by
            # column (same left edge), top to bottom.
            heads = sorted((l for l in lines if l.kind in ("chapter", "section", "group")), key=lambda l: l.top)
            body = [l for l in lines if l.kind in ("en", "es")]
            cuts = [h.top for h in heads]

            def band(line: Line) -> int:
                return sum(1 for c in cuts if c <= line.top)

            # Columns: left edges within 3 pt of each other.
            edges: list[float] = []
            for x in sorted(l.x0 for l in body):
                if not edges or x - edges[-1] > 3:
                    edges.append(x)

            def column(line: Line) -> int:
                return min(range(len(edges)), key=lambda i: abs(edges[i] - line.x0))

            events: list[tuple] = [(i + 1, -1, 0, h) for i, h in enumerate(heads)]
            events += [(band(l), column(l), l.top, l) for l in body]
            events.sort(key=lambda e: (e[0], e[1], e[2]))

            entry_en: list[str] = []
            entry_es: list[str] = []
            feminine = False
            group = ""
            last: tuple | None = None

            def flush() -> None:
                nonlocal entry_en, entry_es, feminine, orphans
                if entry_en and entry_es and lessons and lessons[-1].sections:
                    lessons[-1].sections[-1].entries.append(
                        {
                            "en": clean(" ".join(entry_en)),
                            "es": clean(" ".join(entry_es)),
                            **({"feminine": True} if feminine else {}),
                            **({"group": group} if group else {}),
                        }
                    )
                elif entry_en or entry_es:
                    orphans += 1
                entry_en, entry_es, feminine = [], [], False

            for b, col, top, line in events:
                where = (b, col)
                if line.kind in ("chapter", "section", "group"):
                    flush()
                    if line.kind == "chapter":
                        en, es = split_heading(line.text)
                        lessons.append(Lesson(en, es, [Section(en, es)]))
                        group = ""
                    elif line.kind == "section":
                        en, es = split_heading(line.text)
                        if lessons:
                            current = lessons[-1].sections
                            # A banner repeated on the next page continues its section.
                            if not (current and current[-1].title_en == en and current[-1].entries):
                                current.append(Section(en, es))
                        group = ""
                    else:
                        group = sentence_case(line.text)
                    last = None
                    continue
                if where != last or (line.kind == "en" and entry_es):
                    flush()  # new column, or English after Spanish: a new entry
                last = where
                if line.kind == "en":
                    entry_en.append(line.text)
                else:
                    entry_es.append(line.text)
                    feminine = feminine or line.feminine
            flush()

    # Repeated page banners can leave empty sections behind.
    for lesson in lessons:
        lesson.sections = [s for s in lesson.sections if s.entries]
    lessons = [l for l in lessons if l.sections]

    total = sum(len(s.entries) for l in lessons for s in l.sections)
    print(
        f"{len(lessons)} lessons, {sum(len(l.sections) for l in lessons)} sections, "
        f"{total} entries; {orphans} unpaired blocks skipped",
        file=sys.stderr,
    )
    # Format 2: the Spanish title first (the language studied), English as subtitle.
    def entry(e: dict) -> dict:
        out = {"term": e["es"], "meaning": e["en"]}
        for key in ("group", "feminine"):
            if key in e:
                out[key] = e[key]
        return out

    return {
        "format": 2,
        "book": {"id": "collins-spanish", "title": "Collins Spanish", "kind": "translation", "term": "es", "meaning": "en"},
        "lessons": [
            {
                "title": l.title_es,
                "subtitle": l.title_en,
                "sections": [
                    {"title": s.title_es, "subtitle": s.title_en, "entries": [entry(e) for e in s.entries]}
                    for s in l.sections
                ],
            }
            for l in lessons
        ],
    }


if __name__ == "__main__":
    if len(sys.argv) != 2:
        sys.exit("usage: python3 tools/vocab-extract.py book.pdf > data/vocab.json")
    json.dump(extract(sys.argv[1]), sys.stdout, ensure_ascii=False, indent=1)
    sys.stdout.write("\n")
