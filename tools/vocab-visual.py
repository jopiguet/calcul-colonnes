#!/usr/bin/env python3
"""
Picture dictionary → vocabulary file (format 2) with its pictures.
See docs/vocabulary.md#pictures.

Input: the folder written by tools/vocab-extract-visual.py,

    data/dictionary_export/
        vocabulary.json   [{"english": "1. rotor", "german": "der Rotor",
                            "image": "images/page_0047_image_01.png", "page": 47}, …]
        images/page_0047_image_01.png …

Output: a folder to import with npm run vocab:import,

    data/german-visual/
        vocab.json        format 2: term German, meaning English, each entry its "image"
        images/…          the pictures, once each (shrunk to WebP when Pillow is installed)

Usage:
    python3 tools/vocab-visual.py data/dictionary_export data/german-visual
    python3 tools/vocab-visual.py data/dictionary_export data/german-visual --chapters data/visual-chapters.json
    npm run vocab:import -- data/german-visual/vocab.json

What it does with the extraction:
- "1. rotor": a numbered part of a labelled diagram: "part": 1, the number off the word;
- running text caught as pairs (the book's culture notes): left out;
- "die Nudeln fpl": the plural marks (mpl, fpl, ntpl, pl) and ® taken off;
- the same pair twice on a page: once;
- lessons: one per chapter (--chapters, {"13": "Colours", "40": "Transport"}, by
  first page), or one per 25 pages; sections: pages put together, about 12
  words each (--words).

Both the input and the output are book content: they stay in data/, never in
the project or its zip.
"""

from __future__ import annotations

import argparse
import hashlib
import io
import json
import re
import sys
from pathlib import Path

# Words that never begin or make up a German caption: a pair holding them is running English text.
ENGLISH = re.compile(r"(?<![\w-])(the|you|your|and|is|are|of|for|when|must|that|with|be|it|or|as|this|by|an|if)(?![\w-])", re.I)
PART = re.compile(r"^\s*(\d{1,3})\s*[.)]\s*")
PLURAL = re.compile(r"\s+(?:ntpl|fpl|mpl|pl)\.?$")
LANGUAGES = re.compile(r"^[a-z]{2,3}$")


def clean(text: str) -> str:
    return re.sub(r"\s+", " ", text.replace("®", "").replace("™", "")).strip()


def running_text(english: str, german: str) -> bool:
    """A culture note split into lines: long, or English on the German side."""
    return len(english.split()) > 7 or len(german.split()) > 7 or bool(ENGLISH.search(german))


def load_chapters(path: Path | None) -> list[tuple[int, str]]:
    if path is None:
        return []
    raw = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(raw, dict):
        sys.exit("--chapters: an object {\"first page\": \"title\"}")
    return sorted((int(page), str(title)) for page, title in raw.items())


def lesson_of(page: int, chapters: list[tuple[int, str]], first: int, span: int) -> tuple[int, str]:
    if chapters:
        current = chapters[0]
        for chapter in chapters:
            if chapter[0] <= page:
                current = chapter
        return current
    start = first + ((page - first) // span) * span
    return start, f"p. {start}–{start + span - 1}"


def store_picture(source: Path, out: Path, max_width: int, done: dict[str, str]) -> str | None:
    """Copies (or shrinks) one picture into out/images; the same bytes twice are one file. Returns its path in out."""
    key = str(source)
    if key in done:
        return done[key]
    if not source.is_file():
        print(f"  missing picture: {source}", file=sys.stderr)
        return None
    data = source.read_bytes()
    suffix = source.suffix.lower()
    try:
        from PIL import Image  # optional: python3 -m pip install pillow

        with Image.open(io.BytesIO(data)) as image:
            image = image.convert("RGB")
            if image.width > max_width:
                image = image.resize((max_width, round(image.height * max_width / image.width)), Image.LANCZOS)
            buffer = io.BytesIO()
            image.save(buffer, "WEBP", quality=80, method=6)
            data, suffix = buffer.getvalue(), ".webp"
    except ImportError:
        pass
    if len(data) > 2 * 1024 * 1024:
        # The import refuses a picture over 2 MB: shrink it (Pillow does) or lower the extractor's --scale.
        print(f"  over 2 MB, the import will refuse it: {source} (install Pillow to shrink it)", file=sys.stderr)
    name =f"images/{hashlib.sha256(data).hexdigest()[:20]}{suffix}"
    target = out / name
    if not target.exists():
        target.write_bytes(data)
    done[key] = name
    return name


def sections_of(pages: dict[int, list], words: int) -> list[dict]:
    """Pages after pages, a section once it holds about `words` words: "p. 13–15"."""
    out, current, start, last = [], [], None, None
    for page, entries in sorted(pages.items()):
        if start is None:
            start = page
        current.extend(entries)
        last = page
        if len(current) >= words:
            out.append({"title": f"p. {start}" if start == last else f"p. {start}–{last}", "entries": current})
            current, start = [], None
    if current:
        out.append({"title": f"p. {start}" if start == last else f"p. {start}–{last}", "entries": current})
    return out


def convert(source: Path, out: Path, args: argparse.Namespace) -> dict:
    items = json.loads((source / "vocabulary.json").read_text(encoding="utf-8"))
    if not isinstance(items, list):
        sys.exit(f"{source / 'vocabulary.json'}: a list of {{english, german, image, page}}")
    if out.resolve() == source.resolve():
        sys.exit("the output folder must not be the extraction's")
    (out / "images").mkdir(parents=True, exist_ok=True)
    chapters = load_chapters(args.chapters)

    kept, notes, seen = [], 0, set()
    for item in items:
        english, german = clean(str(item.get("english", ""))), clean(str(item.get("german", "")))
        page = int(item.get("page", 0))
        if not english or not german or running_text(english, german):
            notes += 1
            continue
        part = None
        number = PART.match(english)
        if number:
            part, english = int(number.group(1)), english[number.end():].strip()
        german = PLURAL.sub("", german)
        key = (page, german, english)
        if not english or not german or key in seen:
            continue
        seen.add(key)
        kept.append({"page": page, "term": german[:300], "meaning": english[:300], "part": part, "image": item.get("image")})

    if not kept:
        sys.exit("no pairs left: is it a picture dictionary's vocabulary.json?")
    first = min(k["page"] for k in kept)
    lessons: dict[tuple[int, str], dict[int, list]] = {}
    pictures: dict[str, str] = {}
    for k in kept:
        entry = {"term": k["term"], "meaning": k["meaning"]}
        if k["image"]:
            stored = store_picture(source / str(k["image"]), out, args.max_width, pictures)
            if stored:
                entry["image"] = stored
                if k["part"]:
                    entry["part"] = k["part"]
        lessons.setdefault(lesson_of(k["page"], chapters, first, args.pages), {}).setdefault(k["page"], []).append(entry)

    return {
        "format": 2,
        "book": {
            "id": args.id,
            "title": args.title,
            "kind": "translation",
            "term": args.term,
            "meaning": args.meaning,
            **({"credit": args.credit} if args.credit else {}),
        },
        "lessons": [
            {
                "title": title,
                "sections": sections_of(pages, args.words),
            }
            for (_, title), pages in sorted(lessons.items())
        ],
        "_report": {"pairs": len(items), "kept": len(kept), "notes": notes, "pictures": len(set(pictures.values()))},
    }


def main() -> None:
    parser = argparse.ArgumentParser(description="Picture dictionary → vocabulary file with pictures (docs/vocabulary.md#pictures).")
    parser.add_argument("source", type=Path, help="extraction folder: vocabulary.json and images/")
    parser.add_argument("out", type=Path, help="output folder (in data/): vocab.json and images/")
    parser.add_argument("--id", default="german-visual", help="book id (default german-visual)")
    parser.add_argument("--title", default="German visual dictionary", help="book title")
    parser.add_argument("--term", default="de", help="language studied, the extraction's \"german\" (default de)")
    parser.add_argument("--meaning", default="en", help="language of the meanings, the extraction's \"english\" (default en)")
    parser.add_argument("--credit", default="", help="where the book comes from, shown with it")
    parser.add_argument("--chapters", type=Path, help="JSON {\"first page\": \"chapter title\"}: one lesson per chapter")
    parser.add_argument("--pages", type=int, default=25, help="without --chapters: pages per lesson (default 25)")
    parser.add_argument("--words", type=int, default=12, help="words per section, about: pages are put together (default 12)")
    parser.add_argument("--max-width", type=int, default=640, help="with Pillow: pictures shrunk to this width (default 640)")
    args = parser.parse_args()
    if not (args.source / "vocabulary.json").is_file():
        parser.error(f"{args.source}: no vocabulary.json")
    if not re.fullmatch(r"[a-z0-9][a-z0-9-]{0,62}", args.id):
        parser.error("--id: lowercase letters, digits and dashes")
    if not LANGUAGES.match(args.term) or not LANGUAGES.match(args.meaning):
        parser.error("--term and --meaning: language codes (de, en, …)")
    if args.pages < 1 or args.words < 1 or args.max_width < 64:
        parser.error("--pages at least 1, --max-width at least 64")

    book = convert(args.source, args.out, args)
    report = book.pop("_report")
    (args.out / "vocab.json").write_text(json.dumps(book, ensure_ascii=False, indent=1), encoding="utf-8")
    sections = sum(len(lesson["sections"]) for lesson in book["lessons"])
    print(
        f"{report['kept']} words of {report['pairs']} pairs ({report['notes']} lines of running text left out), "
        f"{len(book['lessons'])} lessons, {sections} sections, {report['pictures']} pictures"
    )
    print(f"next: npm run vocab:import -- {args.out / 'vocab.json'}")


if __name__ == "__main__":
    main()
