import type { Operator } from "../shared/types";
import { columnCount, randomExercise, toColumns, type Exercise, type Limits } from "./exercise";
import { t } from "./i18n";

/**
 * Printable worksheet: 20 operations on one A4 page.
 *
 * The PDF is written by hand (three standard fonts, text and lines only), so
 * there is no dependency and the file is produced instantly in the browser.
 */

const PAGE = { width: 595.28, height: 841.89 }; // A4 in points
const MARGIN = 42;
const HEADER = 96;
const PER_ROW = 4;
export const WORKSHEET_COUNT = 20;

const num = (value: number): string => value.toFixed(2);

/** PDF literal string in WinAnsi encoding; keeps the file pure ASCII. */
function pdfString(text: string): string {
  let out = "";
  for (const char of text) {
    const code = char.codePointAt(0) ?? 63;
    if (char === "−") out += "\\226"; // en dash, used as the minus sign
    else if (char === "(" || char === ")" || char === "\\") out += `\\${char}`;
    else if (code >= 32 && code < 127) out += char;
    else if (code >= 160 && code <= 255) out += `\\${code.toString(8)}`; // é, ñ, ¿, ×…
    else out += "?";
  }
  return `(${out})`;
}

type Font = "F1" | "F2" | "F3"; // Courier-Bold, Helvetica, Helvetica-Bold

function text(font: Font, size: number, x: number, y: number, value: string, gray = 0): string {
  return `BT ${gray} g /${font} ${num(size)} Tf ${num(x)} ${num(y)} Td ${pdfString(value)} Tj ET\n`;
}

function line(x1: number, y1: number, x2: number, y2: number, width: number, gray = 0): string {
  return `${gray} G ${num(width)} w ${num(x1)} ${num(y1)} m ${num(x2)} ${num(y2)} l S\n`;
}

/** Approximate width of a Helvetica label, to place the line that follows it. */
const labelWidth = (label: string, size: number): number => label.length * size * 0.5;

function pageContent(exercises: Exercise[], operators: Operator[], limits: Limits): string {
  let out = "";

  // Header: title, then name and date to fill in by hand.
  const titleY = PAGE.height - MARGIN - 16;
  out += text("F3", 18, MARGIN, titleY, t("appTitle"));
  const fieldY = titleY - 34;
  const name = t("pdfName");
  const date = t("pdfDate");
  const nameEnd = MARGIN + 250;
  out += text("F2", 11, MARGIN, fieldY, name);
  out += line(MARGIN + labelWidth(name, 11) + 6, fieldY - 2, nameEnd, fieldY - 2, 0.6, 0.4);
  out += text("F2", 11, nameEnd + 40, fieldY, date);
  out += line(nameEnd + 40 + labelWidth(date, 11) + 6, fieldY - 2, PAGE.width - MARGIN, fieldY - 2, 0.6, 0.4);

  const rows = Math.ceil(exercises.length / PER_ROW);
  const areaTop = PAGE.height - MARGIN - HEADER;
  const slotWidth = (PAGE.width - 2 * MARGIN) / PER_ROW;
  const slotHeight = (areaTop - MARGIN) / rows;

  // Column operations: one cell per digit column, plus one on the left for the sign.
  const columns = Math.max(
    0,
    ...operators.filter((operator) => operator !== "÷").map((operator) => columnCount(operator, limits)),
  );
  // Division: dividend, then the bracket with the divisor above the quotient.
  const dividendCells = String(limits.maximum).length;
  const bracketCells = Math.max(2, String(limits.smallLimit).length) + 1;
  const widest = Math.max(
    columns > 0 ? columns + 1 : 0,
    operators.includes("÷") ? dividendCells + bracketCells : 0,
  );

  const cell = Math.min(22, (slotWidth - 16) / widest);
  const size = cell * 1.15;
  const glyph = size * 0.6; // Courier advance width

  exercises.forEach((exercise, index) => {
    const slotX = MARGIN + (index % PER_ROW) * slotWidth;
    const slotTop = areaTop - Math.floor(index / PER_ROW) * slotHeight;
    out += text("F2", 8, slotX + 2, slotTop - 10, `${index + 1}.`, 0.5);

    // Room is left above the first line for hand-written carries.
    const topY = slotTop - 22 - size;

    if (exercise.operator === "÷") {
      const blockWidth = cell * (dividendCells + bracketCells);
      const x0 = slotX + (slotWidth - blockWidth) / 2;
      const cellX = (column: number): number => x0 + column * cell + (cell - glyph) / 2;
      toColumns(exercise.top, dividendCells).forEach((digit, i) => {
        if (digit) out += text("F1", size, cellX(i), topY, digit);
      });
      const barX = x0 + (dividendCells + 0.4) * cell;
      String(exercise.bottom)
        .split("")
        .forEach((digit, i) => {
          out += text("F1", size, barX + cell * 0.3 + i * cell + (cell - glyph) / 2, topY, digit);
        });
      const underY = topY - size * 0.4;
      out += line(barX, topY + size * 0.85, barX, underY - size * 1.6, 1.2); // vertical bar
      out += line(barX, underY, x0 + blockWidth, underY, 1.2); // under the divisor
      return;
    }

    const blockWidth = cell * (columns + 1);
    const x0 = slotX + (slotWidth - blockWidth) / 2;
    const cellX = (column: number): number => x0 + column * cell + (cell - glyph) / 2;
    const bottomY = topY - size * 1.25;
    const ruleY = bottomY - size * 0.4;

    toColumns(exercise.top, columns).forEach((digit, i) => {
      if (digit) out += text("F1", size, cellX(i + 1), topY, digit);
    });
    out += text("F1", size, cellX(0), bottomY, exercise.operator);
    toColumns(exercise.bottom, columns).forEach((digit, i) => {
      if (digit) out += text("F1", size, cellX(i + 1), bottomY, digit);
    });
    out += line(x0, ruleY, x0 + blockWidth, ruleY, 1.2);
  });

  return out;
}

export function buildWorksheetPdf(exercises: Exercise[], operators: Operator[], limits: Limits): Blob {
  const content = pageContent(exercises, operators, limits);
  const font = (name: string): string =>
    `<< /Type /Font /Subtype /Type1 /BaseFont /${name} /Encoding /WinAnsiEncoding >>`;

  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGE.width} ${PAGE.height}] /Contents 4 0 R ` +
      "/Resources << /Font << /F1 5 0 R /F2 6 0 R /F3 7 0 R >> >> >>",
    `<< /Length ${content.length} >>\nstream\n${content}endstream`,
    font("Courier-Bold"),
    font("Helvetica"),
    font("Helvetica-Bold"),
  ];

  // Everything is ASCII, so string offsets are byte offsets.
  let pdf = "%PDF-1.4\n";
  const offsets: number[] = [];
  objects.forEach((body, i) => {
    offsets.push(pdf.length);
    pdf += `${i + 1} 0 obj\n${body}\nendobj\n`;
  });
  const xref = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (const offset of offsets) pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;

  return new Blob([pdf], { type: "application/pdf" });
}

/** Draws 20 new operations among the selected ones and opens the PDF in a new tab. */
export function openWorksheet(operators: Operator[], limits: Limits): void {
  const exercises = Array.from({ length: WORKSHEET_COUNT }, () => randomExercise(operators, limits));
  const url = URL.createObjectURL(buildWorksheetPdf(exercises, operators, limits));

  if (!window.open(url, "_blank")) {
    // Pop-up blocked: fall back to a download.
    const link = document.createElement("a");
    link.href = url;
    link.download = `${t("appTitle")}.pdf`;
    link.click();
  }
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}
