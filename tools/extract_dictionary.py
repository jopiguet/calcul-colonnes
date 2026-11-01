#!/usr/bin/env python3
"""
Extract illustrations and English/German vocabulary pairs from a visual-dictionary PDF.

Requirements:
    python -m pip install pymupdf

Usage:
    python extract_dictionary.py "Collins German Visual Dictionary.pdf"
    python extract_dictionary.py input.pdf --output dictionary_export

Output:
    dictionary_export/
        vocabulary.json
        images/
            page_0013_image_01.png
            ...

The script extracts the visible image area from each PDF image placement. Vocabulary
pairs are associated with the image immediately above them. Multiple entries can
therefore refer to the same image (for example, numbered parts of a diagram).
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from dataclasses import dataclass
from pathlib import Path
from typing import Optional

try:
    import fitz  # PyMuPDF
except ImportError:
    sys.exit(
        "PyMuPDF is required. Install it with:\n"
        "    python -m pip install pymupdf"
    )


@dataclass
class ImagePlacement:
    page_number: int
    image_number: int
    rect: fitz.Rect
    filename: str


@dataclass
class TextLine:
    y: float
    text: str


def clean_text(text: str) -> str:
    """Normalize whitespace while preserving German characters and punctuation."""
    return re.sub(r"\s+", " ", text).strip()


def get_page_lines(page: fitz.Page) -> list[TextLine]:
    """Extract text lines with their vertical positions, preserving line structure."""
    result: list[TextLine] = []

    data = page.get_text("dict", sort=True)
    for block in data.get("blocks", []):
        if block.get("type") != 0:
            continue

        for line in block.get("lines", []):
            spans = line.get("spans", [])
            text = clean_text("".join(span.get("text", "") for span in spans))
            if not text:
                continue

            y = min(span["bbox"][1] for span in spans)
            result.append(TextLine(y=y, text=text))

    result.sort(key=lambda item: item.y)
    return result


def find_vocabulary_pairs(
    lines: list[TextLine],
    top: float,
    bottom: float,
    min_gap: float = 8.0,
    max_gap: float = 27.0,
) -> list[tuple[float, str, str]]:
    """
    Find adjacent English/German lines in a vertical region.

    In this book, an English entry is normally followed by its German translation
    on the next printed line. The vertical-gap check avoids pairing unrelated text.
    """
    region = [line for line in lines if top <= line.y < bottom]
    pairs: list[tuple[float, str, str]] = []

    i = 0
    while i < len(region) - 1:
        english = region[i]
        german = region[i + 1]
        gap = german.y - english.y

        if min_gap <= gap <= max_gap:
            # Exclude obvious section headings and isolated page furniture.
            is_heading = (
                english.text.upper() == english.text
                and any(char.isalpha() for char in english.text)
            )
            if not is_heading and not re.fullmatch(r"[\d\s./|—–-]+", english.text):
                pairs.append((english.y, english.text, german.text))
                i += 2
                continue

        i += 1

    return pairs


def save_image_crop(
    page: fitz.Page,
    rect: fitz.Rect,
    destination: Path,
    scale: float = 2.0,
) -> None:
    """Render the image placement as a PNG crop, preserving its visible appearance."""
    # A tiny inset avoids including adjacent page elements due to PDF rounding.
    inset = 0.2
    crop = fitz.Rect(
        rect.x0 + inset,
        rect.y0 + inset,
        rect.x1 - inset,
        rect.y1 - inset,
    )
    pixmap = page.get_pixmap(
        matrix=fitz.Matrix(scale, scale),
        clip=crop,
        alpha=False,
        annots=False,
    )
    pixmap.save(destination)


def extract(pdf_path: Path, output_dir: Path, scale: float = 2.0) -> list[dict]:
    images_dir = output_dir / "images"
    images_dir.mkdir(parents=True, exist_ok=True)

    document = fitz.open(pdf_path)
    vocabulary: list[dict] = []
    previous_page_last_image: Optional[ImagePlacement] = None

    for page_index, page in enumerate(document):
        page_number = page_index + 1
        lines = get_page_lines(page)

        # A PDF image may have more than one placement on a page. Keep each
        # placement separately because each can have a different caption.
        placements: list[ImagePlacement] = []
        for xref, *_ in page.get_images(full=True):
            rects = page.get_image_rects(xref)
            for rect in rects:
                if rect.is_empty or rect.width < 8 or rect.height < 8:
                    continue
                placements.append(
                    ImagePlacement(
                        page_number=page_number,
                        image_number=0,
                        rect=rect,
                        filename="",
                    )
                )

        placements.sort(key=lambda item: (item.rect.y0, item.rect.x0))

        for image_index, placement in enumerate(placements, start=1):
            placement.image_number = image_index
            filename = f"page_{page_number:04d}_image_{image_index:02d}.png"
            placement.filename = filename
            save_image_crop(
                page,
                placement.rect,
                images_dir / filename,
                scale=scale,
            )

        # Text below an image belongs to that image until the next image begins.
        for image_index, placement in enumerate(placements):
            region_top = placement.rect.y1
            region_bottom = (
                placements[image_index + 1].rect.y0
                if image_index + 1 < len(placements)
                else page.rect.height + 1
            )

            pairs = find_vocabulary_pairs(
                lines,
                top=region_top,
                bottom=region_bottom,
            )

            for y, english, german in pairs:
                vocabulary.append(
                    {
                        "english": english,
                        "german": german,
                        "image": f"images/{placement.filename}",
                        "page": page_number,
                    }
                )

        # Some entries appear above an illustration rather than below it.
        # Normally they belong to the first image on this page. Numbered labels
        # can continue a diagram from the preceding page (e.g. items 7 and 8
        # following items 1-6), so route those to the previous image.
        if placements:
            first_image_top = placements[0].rect.y0
            preceding_pairs = find_vocabulary_pairs(
                lines,
                top=0,
                bottom=first_image_top,
            )
            for y, english, german in preceding_pairs:
                is_numbered_label = bool(re.match(r"^\s*\d+[.)]\s*", english))
                target = (
                    previous_page_last_image
                    if is_numbered_label and previous_page_last_image is not None
                    else placements[0]
                )
                vocabulary.append(
                    {
                        "english": english,
                        "german": german,
                        "image": f"images/{target.filename}",
                        "page": page_number,
                    }
                )

        # Carryover is only valid from the immediately preceding page. Do not
        # let an old image absorb captions after pages without illustrations.
        previous_page_last_image = placements[-1] if placements else None

    page_count = len(document)
    document.close()

    # Preserve document order (page, then vertical position) while removing
    # accidental duplicate pairs that can occur in unusual PDF layouts.
    seen = set()
    unique_vocabulary = []
    for item in vocabulary:
        key = (
            item["page"],
            item["english"],
            item["german"],
            item["image"],
        )
        if key not in seen:
            seen.add(key)
            unique_vocabulary.append(item)

    output_dir.mkdir(parents=True, exist_ok=True)
    json_path = output_dir / "vocabulary.json"
    json_path.write_text(
        json.dumps(unique_vocabulary, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )

    print(f"PDF pages processed: {page_count}")
    print(f"Vocabulary entries:  {len(unique_vocabulary)}")
    print(f"Images extracted:    {sum(1 for _ in images_dir.glob('*.png'))}")
    print(f"JSON written to:     {json_path}")
    print(f"Images written to:   {images_dir}")

    return unique_vocabulary


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Extract images and English/German vocabulary from a PDF."
    )
    parser.add_argument("pdf", type=Path, help="Input PDF file")
    parser.add_argument(
        "--output",
        "-o",
        type=Path,
        default=Path("dictionary_export"),
        help="Output directory (default: dictionary_export)",
    )
    parser.add_argument(
        "--scale",
        type=float,
        default=2.0,
        help="Image rendering scale (default: 2.0; higher means larger PNGs)",
    )
    args = parser.parse_args()

    if not args.pdf.is_file():
        parser.error(f"PDF not found: {args.pdf}")
    if args.scale <= 0:
        parser.error("--scale must be greater than zero")

    extract(args.pdf, args.output, scale=args.scale)


if __name__ == "__main__":
    main()
