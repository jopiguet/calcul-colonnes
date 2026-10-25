#!/usr/bin/env python3
"""
Builds the *Lernwortschatz* German–French book from its word lists: one file
per section, a two-column Markdown table (German | Français), as exported for
the quiz apps. Standard library only. Writes the JSON read by
`npm run vocab:import` (format 2, see docs/vocabulary.md).

    python3 tools/vocab-extract-lernwortschatz.py Lernwortschatz/ > data/vocab-lernwortschatz.json
    python3 tools/vocab-extract-lernwortschatz.py Lernwortschatz.zip > data/vocab-lernwortschatz.json

The lists change: add a file, correct a line, and run the two commands again.
The import keeps every player's progress on the words that are still there.

What is read, and how:

- A file's name gives its place: "…-01-3.txt" is section 1.3, in lesson 1;
  "…-16-1--16-6.txt" one section covering 16.1 to 16.6. Files are sorted by
  those numbers, whatever their prefix (Lernwortschaft-, Lernwortschatz-…).
  Files ending in .txt or .md, in the folder or the zip, subfolders included.
- Titles: lesson "Kapitel 1" and section "1.3", with the section's first word
  as subtitle. A file named titles.txt beside the lists can name them, one per
  line: "1 = Der Mensch", "1.3 = Charakter und Temperament".
- Table rows, header and separator skipped. A "## Heading" inside a file
  becomes the group of the words under it (wrong options come from the group).
  Other lines (a legend of abbreviations) are skipped. The header says which
  column is the German: "Deutsch", "German" or "Allemand", first or second.
- Example sentences stay cards of their own, in the group "Beispiele": a row
  ending in . ! ?, or a lower-case phrase of four words or more that is
  neither a noun with its plural nor a verb with its forms.
- German: the markers (1), (2) of paired synonyms are dropped; a separable
  verb's "an/sehen" is written "an|sehen" (the app reads "/" as a choice).
  The plural ("die Ehre, -n") and the forms of a verb ("finden, findet, fand,
  hat gefunden") stay on the card; the grading accepts the word alone.
- French: synonyms separated by "," or ";" ("patient, patiente", "1. cher ;
  2. gentil") are written with the app's "/", so either is accepted. Commas
  inside brackets stay.
"""
import io
import json
import os
import re
import sys
import zipfile

NAME = re.compile(r"(\d+)-(\d+)(?:--?(\d+)-(\d+))?\.(?:txt|md)$", re.I)
MARKER = re.compile(r"\s*\((?:1|2|3)\)")
SEPARATOR = re.compile(r"^[\s|:\-]+$")


def files(source):
    """(name, text) of every list in a folder or a zip."""
    out = []
    if os.path.isdir(source):
        for root, _, names in os.walk(source):
            for name in names:
                with open(os.path.join(root, name), encoding="utf-8-sig") as handle:
                    out.append((name, handle.read()))
    else:
        with zipfile.ZipFile(source) as archive:
            for info in archive.infolist():
                if info.is_dir():
                    continue
                out.append((os.path.basename(info.filename), io.TextIOWrapper(archive.open(info), encoding="utf-8-sig").read()))
    return out


def titles(listed):
    """titles.txt: "1 = Der Mensch", "1.3 = Charakter"."""
    names = {}
    for name, text in listed:
        if name.lower() != "titles.txt":
            continue
        for line in text.splitlines():
            if "=" in line:
                key, _, value = line.partition("=")
                if key.strip() and value.strip():
                    names[key.strip()] = value.strip()
    return names


def clean_german(text):
    text = MARKER.sub("", text).strip()
    # Separable verbs: "an/sehen" → "an|sehen" (a slash with spaces is a choice: "der Täter, - / die Täterin").
    return re.sub(r"(?<=[a-zäöüß])/(?=[a-zäöüß])", "|", text)


def outside_brackets(text, separators):
    """Splits on separators that are not inside brackets."""
    parts, depth, current = [], 0, ""
    i = 0
    while i < len(text):
        ch = text[i]
        depth += ch == "("
        depth -= ch == ")"
        hit = next((s for s in separators if depth == 0 and text.startswith(s, i)), None)
        if hit:
            parts.append(current)
            current = ""
            i += len(hit)
            continue
        current += ch
        i += 1
    parts.append(current)
    return [p.strip() for p in parts if p.strip()]


def clean_french(text, sentence):
    text = MARKER.sub("", text).strip()
    if sentence:
        return text
    text = re.sub(r"(^|[;,]\s*)\d\.\s*", r"\1", text)  # "1. cher ; 2. gentil"
    return " / ".join(outside_brackets(text, [";", ","]))


VERB_FORMS = re.compile(r",\s*(?:\(?sich\)?\s*)?(?:hat|ist)\s")
NOUN = re.compile(r"^(?:der|die|das)\s+[A-ZÄÖÜ]")
CASE = re.compile(r"\+\s*[DAG]\b")


def is_example(german):
    if re.search(r"[.!?]$", german):
        return True
    words = german.split()
    return (
        german[:1].islower()
        and len(words) >= 4
        and "…" not in german
        and not VERB_FORMS.search(german)
        and not NOUN.match(german)
        and not CASE.search(german)
    )


def rows(text):
    """(group, german, french) of a file's tables."""
    group = ""
    french_first = False
    lines = text.splitlines()
    for i, line in enumerate(lines):
        stripped = line.strip()
        if stripped.startswith("#"):
            group = stripped.lstrip("#").strip()
            continue
        if not stripped.startswith("|") or SEPARATOR.match(stripped):
            continue
        # A header: the row just before a separator.
        following = lines[i + 1].strip() if i + 1 < len(lines) else ""
        if following.startswith("|") and SEPARATOR.match(following):
            # The header names the columns: some lists put the French first.
            first = stripped.strip("|").split("|")[0].strip().lower()
            french_first = first.startswith(("fran", "french"))
            continue
        cells = [c.strip() for c in stripped.strip("|").split("|")]
        if len(cells) < 2 or not cells[0] or not cells[1]:
            print(f"skipped: {stripped[:80]}", file=sys.stderr)
            continue
        if french_first:
            yield group, cells[-1], " ".join(cells[:-1])
        else:
            yield group, " ".join(cells[:-1]), cells[-1]


def extract(source):
    listed = files(source)
    names = titles(listed)
    found = []
    for name, text in listed:
        match = NAME.search(name)
        if not match:
            continue
        a, b, c, d = (int(x) if x else None for x in match.groups())
        found.append(((a, b), (c, d) if c else None, text))
    if not found:
        sys.exit("no word lists found (files named …-01-3.txt)")
    found.sort(key=lambda f: f[0])
    lessons = {}
    for (chapter, section), last, text in found:
        number = f"{chapter}.{section}" if not last else f"{chapter}.{section}–{last[0]}.{last[1]}"
        entries = []
        for group, german, french in rows(text):
            example = is_example(german)
            entry = {"term": clean_german(german), "meaning": clean_french(french, example)}
            if example:
                entry["group"] = "Beispiele"
            elif group:
                entry["group"] = group
            entries.append(entry)
        if not entries:
            print(f"no entries in section {number}", file=sys.stderr)
            continue
        first = next((e["term"] for e in entries if e.get("group") != "Beispiele"), entries[0]["term"])
        lesson = lessons.setdefault(chapter, {
            "title": names.get(str(chapter), f"Kapitel {chapter}"),
            "subtitle": "" if str(chapter) in names else f"Chapitre {chapter}",
            "sections": [],
        })
        lesson["sections"].append({
            "title": f"{number} {names[number]}" if number in names else number,
            "subtitle": CASE.sub("", re.sub(r"\([^)]*\)", "", first).split(",")[0]).strip().replace("|", ""),
            "entries": entries,
        })
    book = {
        "id": "lernwortschatz",
        "title": "Lernwortschatz",
        "kind": "translation",
        "term": "de",
        "meaning": "fr",
    }
    return {"format": 2, "book": book, "lessons": [lessons[k] for k in sorted(lessons)]}


if __name__ == "__main__":
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    json.dump(extract(sys.argv[1]), sys.stdout, ensure_ascii=False, indent=1)
