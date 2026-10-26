#!/usr/bin/env python3
"""
Makes tests/e2e/fixtures/exercise-book/: an invented workbook (two units,
four exercises) in the format of tools/exercises-extract.py, its pages drawn
here with dotted lines where the answers go. Nothing in it comes from a book.

    python3 tests/e2e/fixtures/make-exercise-book.py
"""
import json
import os

from PIL import Image, ImageDraw, ImageFont

OUT = os.path.join(os.path.dirname(__file__), "exercise-book")
FONT = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
BOLD = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
W = 900


def page(exercise_id: str, instruction: str, lines: list[list[object]]):
    """Lines of text and gaps: str is printed, ("gap", item, width) is a dotted line. Returns the image and gaps by item."""
    font = ImageFont.truetype(FONT, 22)
    bold = ImageFont.truetype(BOLD, 22)
    height = 90 + 44 * len(lines)
    img = Image.new("RGB", (W, height), "white")
    d = ImageDraw.Draw(img)
    d.rectangle((10, 14, 80, 46), fill=(70, 160, 170))
    d.text((18, 16), exercise_id, font=bold, fill="white")
    d.text((96, 16), instruction, font=bold, fill=(20, 30, 60))
    gaps: dict[str, list[list[float]]] = {}
    y = 70
    for line in lines:
        x = 96.0
        for part in line:
            if isinstance(part, str):
                d.text((x, y), part, font=font, fill=(20, 30, 60))
                x += d.textlength(part, font=font) + 6
            else:
                _, item, width, *written = part
                base = y + 26
                for dx in range(0, width, 5):
                    d.ellipse((x + dx, base - 1, x + dx + 2, base + 1), fill=(90, 90, 90))
                if written:
                    d.text((x + 8, y - 2), written[0], font=ImageFont.truetype(FONT, 21), fill=(40, 70, 200))
                else:
                    gaps.setdefault(item, []).append([round(x / W, 4), round(base / height, 4), round(width / W, 4)])
                x += width + 8
        y += 44
    return img, gaps


def main() -> None:
    os.makedirs(os.path.join(OUT, "images"), exist_ok=True)
    exercises = []

    def add(eid: str, instruction: str, lines, answers: dict[str, str], *, open_=False, note="", key_text=""):
        img, gaps = page(eid, instruction, lines)
        name = f"{eid}.webp"
        img.save(os.path.join(OUT, "images", name), "WEBP", quality=70)
        items = [{"n": n, "answer": a, "gaps": gaps.get(n, [])} for n, a in answers.items()]
        exercises.append({
            "id": eid, "unit": int(eid.split(".")[0]), "page": 1, "instruction": instruction,
            "image": name, "width": img.width, "height": img.height,
            "open": open_, "note": note, "keyText": key_text, "items": items,
        })

    add("1.1", "Put the verb into the past simple.", [
        ["1  On Monday we", ("gap", "1", 140, "walked"), "(walk) to the lake."],
        ["2  The cat", ("gap", "2", 160), "(jump) onto the roof."],
        ["3  Tom", ("gap", "3", 130), "(cook) and Ann", ("gap", "3", 130), "(clean)."],
        ["4  The trains", ("gap", "4", 150), "(be) late again."],
    ], {"2": "jumped", "3": "cooked … cleaned", "4": "were"})
    add("1.2", "Which is right? Write a, b or c.", [
        ["1  The bus arrives at a) eight  b) the eight  c) eights"],
        ["2  She is a) at home  b) in home  c) to home"],
        ["3  Rewrite: 'I live here since May.'"],
    ], {"1": "a", "2": "a", "3": "I have lived here since May. / I’ve lived here since May."})
    add("1.3", "Over to you. Write about your week.", [
        ["1  What did you do on Monday?"],
        ["2  What will you do on Sunday?"],
    ], {"1": "I went to the pool.", "2": "I will visit my aunt."}, open_=True, note="Example answers:")
    add("2.1", "Write the plural.", [
        ["1  a fox", ("gap", "1", 120, "foxes"), "   2  a mouse", ("gap", "2", 120)],
        ["3  a leaf", ("gap", "3", 120), "   4  a sheep", ("gap", "4", 120)],
    ], {"2": "mice", "3": "leaves", "4": "sheep"})

    book = {
        "format": 1,
        "book": {"id": "test-workbook", "title": "A workbook written for the tests", "source": "Test Workbook", "level": "A2", "kind": "grammar", "language": "en"},
        "units": [{"n": 1, "title": "Past and present"}, {"n": 2, "title": "Plurals"}],
        "exercises": exercises,
    }
    with open(os.path.join(OUT, "book.json"), "w") as f:
        json.dump(book, f, ensure_ascii=False, indent=1)


if __name__ == "__main__":
    main()
