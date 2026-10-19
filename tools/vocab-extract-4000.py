#!/usr/bin/env python3
"""
Extracts "Vocabulary 4000 — The 4000 Words Essential for an Educated
Vocabulary" (Jeff Kolby) into the JSON format read by `npm run vocab:import`
(format 2, see docs/vocabulary.md).

    pip install pdfplumber
    python3 tools/vocab-extract-4000.py book.pdf > data/vocab-english.json

Run it on your own copy of the book. The result is for your own use: keep it
out of version control (data/ is ignored) and the app behind its sign-in.

What is read, and how:

- "The Words": a word in bold, its definition in roman, in two columns; a
  definition may wrap onto the next line. Each letter (A, B…, in bold 24 pt)
  becomes a lesson, cut into sections of about 25 words named after their
  first and last word ("abase – abode"). The quizzes between the words (in
  roman only, under a bold 12 pt "Quiz" title) are skipped.
- "Word Analysis": numbered tables of prefixes, roots and suffixes (term,
  meaning, example). They become one lesson with three sections; the example
  is kept as a note shown after the answer. "ad—also ac, af" becomes
  "ad / ac / af": any of them is accepted.
- "Idiom & Usage" (grammar explanations and drills) is not vocabulary and is
  not read.
"""
import json
import math
import re
import sys

import pdfplumber

SECTION_SIZE = 25


def clean(text: str) -> str:
    return re.sub(r"\s+", " ", text).strip()


def style(word) -> tuple[str, float]:
    return word["fontname"].split("+")[-1], round(word["size"], 1)


def page_words(page):
    return page.extract_words(extra_attrs=["fontname", "size"], keep_blank_chars=True, x_tolerance=1.5, y_tolerance=2)


def right_column(words) -> float:
    """Left edge of the right column: where bold words start, well right of the left ones."""
    starts = sorted(w["x0"] for w in words if style(w)[0] == "Times-Bold" and style(w)[1] in (10.0, 24.0) and w["text"].strip())
    if not starts:
        return 1e9
    left = starts[0]
    right = [x for x in starts if x > left + 100]
    return (min(right) - 8) if right else 1e9


def lines_of(words, page_width):
    """Fragments grouped into lines: same column, tops within 2 pt."""
    split = right_column(words)
    column = lambda w: 0 if w["x0"] < split else 1
    ordered = sorted(words, key=lambda w: (column(w), w["top"], w["x0"]))
    out: list[dict] = []
    for w in ordered:
        col = column(w)
        if out and out[-1]["col"] == col and abs(w["top"] - out[-1]["top"]) <= 2:
            out[-1]["words"].append(w)
        else:
            out.append({"col": col, "top": w["top"], "words": [w]})
    for line in out:
        line["words"].sort(key=lambda w: w["x0"])
        line["x0"] = line["words"][0]["x0"]
    return out


# ------------------------------------------------------------------ the words

def the_words(pdf) -> list[dict]:
    letters: list[dict] = []
    for page in pdf.pages:
        words = page_words(page)
        texts = [(style(w), w["text"]) for w in words]
        if any(s == ("Times-Bold", 16.0) and "Answers to Quizzes" in t for s, t in texts):
            break  # end of the word list
        if not letters and not any(s == ("Times-Bold", 24.0) for s, _ in texts):
            continue  # before letter A
        body = [w for w in words if w["top"] > 60]  # running head and page number
        current = None  # entry being read, for definitions that wrap
        last_top = None
        for line in lines_of(body, page.width):
            first = line["words"][0]
            s = style(first)
            if s == ("Times-Bold", 24.0):
                letters.append({"letter": clean(first["text"]), "entries": []})
                current = None
                continue
            if s == ("Times-Bold", 12.0) or s[1] != 10.0:
                current = None  # quiz title, or anything not in the list's type
                continue
            bold = [w for w in line["words"] if style(w) == ("Times-Bold", 10.0)]
            if s == ("Times-Bold", 10.0) and clean(first["text"]):
                # A new word: the bold run at the start, then the definition.
                term_parts, rest = [], []
                in_term = True
                for w in line["words"]:
                    if in_term and style(w)[0] == "Times-Bold":
                        term_parts.append(w["text"])
                    else:
                        in_term = False
                        rest.append(w["text"])
                term, definition = clean(" ".join(term_parts)), clean(" ".join(rest))
                if letters and term and definition and not term.isupper():
                    current = {"term": term, "meaning": definition}
                    letters[-1]["entries"].append(current)
                else:
                    current = None
                last_top = line["top"]
                continue
            # A roman line: the definition goes on, if it follows its word closely.
            if current is not None and last_top is not None and 0 < line["top"] - last_top <= 14 and not bold:
                current["meaning"] = clean(current["meaning"] + " " + " ".join(w["text"] for w in line["words"]))
                last_top = line["top"]
            else:
                current = None
    return letters


def lessons_from_letters(letters: list[dict]) -> list[dict]:
    lessons = []
    for item in letters:
        entries = item["entries"]
        if not entries:
            continue
        parts = math.ceil(len(entries) / SECTION_SIZE)
        size = math.ceil(len(entries) / parts)
        sections = []
        for i in range(0, len(entries), size):
            chunk = entries[i : i + size]
            sections.append({"title": f"{chunk[0]['term']} – {chunk[-1]['term']}", "entries": chunk})
        lessons.append({"title": item["letter"], "sections": sections})
    return lessons


# -------------------------------------------------------------- word analysis

def word_analysis(pdf) -> dict | None:
    sections: list[dict] = []
    started = False
    for page in pdf.pages:
        words = page_words(page)
        texts = [(style(w), clean(w["text"])) for w in words]
        if any(s[0] == "Impact" and t == "Word Analysis" for s, t in texts):
            started = True
        if not started:
            continue
        if any(s == ("Times-Bold", 12.0) and t.startswith("Exercise") for s, t in texts):
            break  # the exercise after the suffixes
        # Rows start with "N." in roman; the term is bold, then meaning and example columns.
        rows: list[dict] = []
        heads = [(w["top"], clean(w["text"])) for w in words if style(w) == ("Times-Bold", 14.0)]
        numbers = [w for w in words if style(w)[0] == "Times-Roman" and re.fullmatch(r"\d+\.", clean(w["text"]))]
        for n in numbers:
            rows.append({"top": n["top"], "x": n["x0"], "words": []})
        rows.sort(key=lambda r: r["top"])
        for w in words:
            if w in numbers or style(w)[1] != 10.0 or w["top"] < 60:
                continue
            owner = None
            for r in rows:
                if r["top"] - 2 <= w["top"]:
                    owner = r
            if owner and w["top"] - owner["top"] < 14:
                owner["words"].append(w)
        for r in rows:
            # Which table: the last heading above the row.
            above = [h for h in heads if h[0] < r["top"]]
            if above:
                name = above[-1][1]
                if not sections or sections[-1]["title"] != name:
                    sections.append({"title": name, "entries": []})
            if not sections:
                continue
            x = r["x"]
            term = [w for w in r["words"] if w["x0"] < x + 125]
            meaning = [w for w in r["words"] if x + 125 <= w["x0"] < x + 235]
            example = [w for w in r["words"] if w["x0"] >= x + 235]
            names = clean(" ".join(w["text"] for w in sorted(term, key=lambda w: (round(w["top"]), w["x0"]))))
            # "ad—also ac, af, ag" → "ad / ac / af / ag"
            variants = [clean(v) for v in re.split(r"—\s*also|,", names) if clean(v)]
            # The group keeps prefixes with prefixes for the wrong options.
            entry = {"term": " / ".join(variants), "meaning": clean(" ".join(w["text"] for w in meaning)), "group": sections[-1]["title"]}
            note = clean(" ".join(w["text"] for w in example))
            if note:
                entry["note"] = note
            if entry["term"] and entry["meaning"]:
                sections[-1]["entries"].append(entry)
    sections = [s for s in sections if s["entries"]]
    return {"title": "Word analysis", "sections": sections} if sections else None


def extract(path: str) -> dict:
    with pdfplumber.open(path) as pdf:
        letters = the_words(pdf)
        lessons = lessons_from_letters(letters)
        analysis = word_analysis(pdf)
    if analysis:
        lessons.append(analysis)
    total = sum(len(s["entries"]) for l in lessons for s in l["sections"])
    print(
        f"{len(lessons)} lessons, {sum(len(l['sections']) for l in lessons)} sections, {total} entries",
        file=sys.stderr,
    )
    return {
        "format": 2,
        "book": {
            "id": "english-4000",
            "title": "Vocabulary 4000",
            "kind": "definition",
            "term": "en",
            "meaning": "en",
            # A word list: new words come at random by default, and wrong
            # options are not taken from the alphabetical neighbours.
            "order": "alphabetical",
        },
        "lessons": lessons,
    }


if __name__ == "__main__":
    if len(sys.argv) != 2:
        sys.exit("usage: python3 tools/vocab-extract-4000.py book.pdf > data/vocab-english.json")
    json.dump(extract(sys.argv[1]), sys.stdout, ensure_ascii=False, indent=1)
    sys.stdout.write("\n")
