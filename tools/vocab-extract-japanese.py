#!/usr/bin/env python3
"""
Extracts "Japanese vocabulary for English speakers — 5000 words" (T&P Books)
from its EPUB into the JSON format read by `npm run vocab:import` (format 2,
see docs/vocabulary.md). Standard library only.

    python3 tools/vocab-extract-japanese.py book.epub > data/vocab-japanese.json

Run it on your own copy of the book. The result is for your own use: keep it
out of version control (data/ is ignored) and the app behind its sign-in.

What is read, and how:

- One chapter file per theme ("FOOD. NUTRICION" in an <h2>): a lesson.
- Numbered headings ("35. Food" in an <h3>): sections, without the number.
- Each entry: the English (class "base"), the Japanese (class "word") and its
  rōmaji (class "trl"). The rōmaji is the entry's reading: shown with the
  Japanese, and accepted as a written answer.
- English labels in brackets ("(vt)", "(adj)", "(fam.)") are kept: they tell
  apart entries that would otherwise read the same, and are optional in an
  answer.
- Synonyms separated by commas ("digit, figure", "to reserve, to book") are
  written with the app's "/", so either is accepted. Commas inside brackets
  ("to order (meal, etc.)") stay as they are.
- The book's small blank-line groups inside a section are not kept: the
  sections (3 to 80 words) are the unit for wrong options.
"""
import html
import json
import re
import sys
import zipfile

ENTRY = re.compile(
    r'<p class="base">(?P<en>.*?)</p>\s*</div>\s*<div class="word">\s*<p class="word">(?P<ja>.*?)</p>\s*</div>'
    r'\s*<div class="trl">\s*<p class="trl">(?P<trl>.*?)</p>',
    re.S,
)
TOKEN = re.compile(r'<h2>(?P<h2>.*?)</h2>|<h3>(?P<h3>.*?)</h3>|' + ENTRY.pattern, re.S)


def text(fragment: str) -> str:
    return re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", "", fragment))).strip()


def synonyms(meaning: str) -> str:
    """'digit, figure' → 'digit / figure'; commas inside brackets, or in a longer phrase, stay."""
    parts, depth, current = [], 0, ""
    for c in meaning:
        depth += c == "("
        depth -= c == ")"
        if c == "," and depth == 0:
            parts.append(current.strip())
            current = ""
        else:
            current += c
    parts.append(current.strip())
    if len(parts) < 2 or any(not re.search(r"[A-Za-z]", p) or len(re.sub(r"\([^)]*\)", "", p).split()) > 3 or "?" in p for p in parts):
        return meaning
    return " / ".join(parts)


def title_case(heading: str) -> str:
    """'FOOD. NUTRICION' → 'Food. Nutricion'; 'HUMAN BEING. THE BODY' → 'Human being. The body'."""
    parts = [p.strip() for p in heading.split(".")]
    return ". ".join(p[:1].upper() + p[1:].lower() for p in parts if p)


def chapter_files(book: zipfile.ZipFile) -> list[str]:
    """Chapter files in reading order, from the package's spine."""
    opf_name = next(n for n in book.namelist() if n.endswith(".opf"))
    opf = book.read(opf_name).decode("utf-8")
    base = opf_name.rsplit("/", 1)[0] + "/" if "/" in opf_name else ""
    items = dict(re.findall(r'<item[^>]*?id="([^"]+)"[^>]*?href="([^"]+)"', opf))
    items.update({i: h for h, i in re.findall(r'<item[^>]*?href="([^"]+)"[^>]*?id="([^"]+)"', opf)})
    spine = re.findall(r'<itemref[^>]*idref="([^"]+)"', opf)
    files = [base + items[i] for i in spine if i in items]
    return [f for f in files if re.search(r"Chapter-\d+", f)]


def extract(path: str) -> dict:
    lessons: list[dict] = []
    with zipfile.ZipFile(path) as book:
        for name in chapter_files(book):
            page = book.read(name).decode("utf-8")
            lesson = None
            section = None
            for m in TOKEN.finditer(page):
                if m.group("h2") is not None:
                    lesson = {"title": title_case(text(m.group("h2"))), "sections": []}
                    lessons.append(lesson)
                elif m.group("h3") is not None:
                    heading = re.sub(r"^\d+\.\s*", "", text(m.group("h3")))
                    section = {"title": heading, "entries": []}
                    if lesson is None:  # a chapter without its own heading
                        lesson = {"title": heading, "sections": []}
                        lessons.append(lesson)
                    lesson["sections"].append(section)
                elif section is not None:
                    term, meaning, reading = text(m.group("ja")), text(m.group("en")), text(m.group("trl"))
                    if not term or not meaning:
                        continue
                    entry = {"term": term, "meaning": synonyms(meaning)}
                    if reading:
                        entry["reading"] = reading
                    section["entries"].append(entry)
    for lesson in lessons:
        lesson["sections"] = [s for s in lesson["sections"] if s["entries"]]
    lessons = [l for l in lessons if l["sections"]]
    total = sum(len(s["entries"]) for l in lessons for s in l["sections"])
    print(f"{len(lessons)} lessons, {sum(len(l['sections']) for l in lessons)} sections, {total} entries", file=sys.stderr)
    return {
        "format": 2,
        "book": {"id": "japanese-5000", "title": "Themed vocabulary", "kind": "translation", "term": "ja", "meaning": "en"},
        "lessons": lessons,
    }


if __name__ == "__main__":
    if len(sys.argv) != 2:
        sys.exit("usage: python3 tools/vocab-extract-japanese.py book.epub > data/vocab-japanese.json")
    json.dump(extract(sys.argv[1]), sys.stdout, ensure_ascii=False, indent=1)
    sys.stdout.write("\n")
