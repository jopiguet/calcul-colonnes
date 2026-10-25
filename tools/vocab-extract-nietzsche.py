#!/usr/bin/env python3
"""
Builds the Nietzsche German–English book from its cumulative word list, a
CSV kept by hand (the .xlsx beside it holds the same rows; the CSV is read).
Standard library only. Writes the JSON read by `npm run vocab:import`
(format 2, see docs/vocabulary.md).

    python3 tools/vocab-extract-nietzsche.py nietzsche_vocabulary_cumulative.csv > data/vocab-nietzsche.json

The list grows: add rows or correct them, and run the two commands again. The
import keeps every player's progress on the words that are still there.

Columns read (by their header, in any order):

- "Topic" ("4. Psychology, drives and character"): the lesson, without its
  number; lessons follow the numbers.
- "German", "English equivalent(s)": the entry; English synonyms separated by
  ";" are written with the app's "/", so either is accepted.
- "Grammatical / lexical type": the section inside the lesson: nouns by gender
  (der, die, das), verbs, adjectives and adverbs, expressions. Sections do not
  move as rows are added.
- "Corpus example / fragment" and "Study note": the note shown after the
  answer: the study note when it says something of its own (not the list's
  standard caution), then the fragment from the works, cut at a word.
- "Exact-form occurrences (all 6 works)": in the note ("74× in the works").

The other columns (works, source basis) are not used.
"""
import csv
import json
import re
import sys

SECTIONS = [
    ("der", "Maskulina (der)", "Masculine nouns"),
    ("die", "Feminina (die)", "Feminine nouns"),
    ("das", "Neutra (das)", "Neuter nouns"),
    ("nouns", "Substantive", "Other nouns"),
    ("verbs", "Verben", "Verbs"),
    ("adjectives", "Adjektive und Adverbien", "Adjectives and adverbs"),
    ("expressions", "Wendungen", "Expressions"),
]
STANDARD = ("Context-sensitive:", "Learning gloss;")
NOTE_MAX = 300


def section_of(kind, german):
    k = kind.lower()
    article = re.match(r"^(der|die|das)\s", german)
    if "noun" in k or (article and len(german.split()) == 2):
        # By gender: wrong options then share the article, and the gender is what is learnt.
        return article.group(1) if article and "plural" not in k else "nouns"
    if "verb" in k and "adverb" not in k:
        return "verbs"
    if "adjective" in k or "adverb" in k or "conjunction" in k or "discourse" in k:
        return "adjectives"
    return "expressions"


def fragment(text, room):
    # The fragment is cut out of the text, mid-word at both ends: whole words only.
    words = re.sub(r"\s+", " ", text).strip().strip("…").split(" ")[1:-1]
    text = " ".join(words).strip(" -,;")
    if room < 40 or not text:
        return ""
    if len(text) > room:
        text = text[: room - 1].rsplit(" ", 1)[0]
    return f"…{text}…"


def note_of(row):
    parts = []
    study = (row.get("Study note") or "").strip()
    if study and not study.startswith(STANDARD):
        # The fragment is given apart: only the note's own words.
        study = re.split(r"\s*Example fragment", study)[0].strip()
        if study:
            parts.append(study)
    count = (row.get("Exact-form occurrences (all 6 works)") or "").strip()
    if count.isdigit() and int(count) > 0:
        parts.append(f"{count}× in the works.")
    head = " ".join(parts)
    example = fragment(row.get("Corpus example / fragment") or "", NOTE_MAX - len(head) - 3)
    return " — ".join(p for p in [head, example] if p)[:NOTE_MAX]


def extract(path):
    with open(path, encoding="utf-8-sig", newline="") as handle:
        rows = list(csv.DictReader(handle))
    for column in ("Topic", "German", "English equivalent(s)"):
        if rows and column not in rows[0]:
            sys.exit(f'column "{column}" not found in {path}')
    topics = {}
    for row in rows:
        german = (row.get("German") or "").strip()
        english = (row.get("English equivalent(s)") or "").strip()
        topic = (row.get("Topic") or "").strip()
        if not german or not english or not topic:
            continue
        number = re.match(r"^\s*(\d+)\.?\s*", topic)
        key = int(number.group(1)) if number else 999
        title = topic[number.end():].strip() if number else topic
        lesson = topics.setdefault((key, title), {s: [] for s, _, _ in SECTIONS})
        entry = {"term": german, "meaning": " / ".join(p.strip() for p in english.split(";") if p.strip())}
        note = note_of(row)
        if note:
            entry["note"] = note
        lesson[section_of(row.get("Grammatical / lexical type") or "", german)].append(entry)
    lessons = []
    for (_, title), sections in sorted(topics.items()):
        lessons.append({
            "title": title,
            "sections": [
                {"title": de, "subtitle": en, "entries": sorted(sections[s], key=lambda e: e["term"].lower())}
                for s, de, en in SECTIONS if sections[s]
            ],
        })
    book = {
        "id": "nietzsche",
        "title": "Nietzsche: the vocabulary of six works",
        "kind": "translation",
        "term": "de",
        "meaning": "en",
        "credit": "Home-made list, checked against the German texts of six works; the English are learner glosses.",
    }
    return {"format": 2, "book": book, "lessons": lessons}


if __name__ == "__main__":
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    json.dump(extract(sys.argv[1]), sys.stdout, ensure_ascii=False, indent=1)
