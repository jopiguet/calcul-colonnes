import { el } from "./dom";
import {
  columnCount,
  divisionBoxes,
  parseAnswer,
  toColumns,
  type Exercise,
  type Limits,
} from "./exercise";
import { columnName, t, type Key } from "./i18n";

/**
 * A board shows one exercise and collects the answer.
 *   - columnBoard: +, − and × set out in columns, written from the units leftwards,
 *     with an optional carry row;
 *   - divisionBoard: Euclidean division, quotient and remainder written from the left.
 */
export type BoardAnswer =
  | { kind: "value"; value: number; remainder: number | null }
  | { kind: "problem"; message: Key; focus: () => void };

export interface Board {
  node: HTMLElement;
  read(): BoardAnswer;
  /** Freezes the inputs once the answer is checked. */
  lock(): void;
  /** Puts the cursor where the answer starts. */
  focus(): void;
}

export interface BoardEvents {
  onEnter(): void;
  onEdit(): void;
}

function selectBox(box: HTMLInputElement | null | undefined): void {
  box?.focus();
  box?.select();
}

function digitInput(className: string, label: string): HTMLInputElement {
  const box = el("input", className);
  box.type = "text";
  box.inputMode = "numeric";
  box.autocomplete = "off";
  box.setAttribute("aria-label", label);
  box.addEventListener("focus", () => box.select());
  return box;
}

/** Keeps only the last digit typed; anything else is ignored. */
function lastDigit(box: HTMLInputElement): string {
  box.value = box.value.replace(/\D/g, "").slice(-1);
  return box.value;
}

interface DigitRow {
  boxes: HTMLInputElement[];
  values(): string[];
  focus(index?: number): void;
  lock(): void;
}

/**
 * A row of one-digit boxes. `flow` is the writing direction: "leftward" starts
 * on the last box (the units) and moves left, "rightward" starts on the first.
 * `vertical` handles ↑ / ↓ for the caller; it returns true when it used the key.
 */
function digitRow(
  count: number,
  flow: "leftward" | "rightward",
  label: (index: number) => string,
  events: BoardEvents,
  vertical: (key: "ArrowUp" | "ArrowDown", index: number) => boolean = () => false,
): DigitRow {
  const boxes = Array.from({ length: count }, (_, i) => digitInput("cell box", label(i)));
  const start = flow === "leftward" ? count - 1 : 0;
  const forward = flow === "leftward" ? -1 : 1;
  const focus = (index = start): void =>
    selectBox(boxes[Math.max(0, Math.min(count - 1, index))]);

  boxes.forEach((box, i) => {
    box.addEventListener("input", () => {
      events.onEdit();
      if (lastDigit(box) && boxes[i + forward]) focus(i + forward);
    });
    box.addEventListener("keydown", (event) => {
      switch (event.key) {
        case "Enter":
          event.preventDefault();
          events.onEnter();
          break;
        case "Backspace": {
          // On an empty box, go back to the previous digit written and erase it.
          const previous = boxes[i - forward];
          if (box.value === "" && previous) {
            event.preventDefault();
            previous.value = "";
            focus(i - forward);
          }
          break;
        }
        case "ArrowLeft":
          event.preventDefault();
          focus(i - 1);
          break;
        case "ArrowRight":
          event.preventDefault();
          focus(i + 1);
          break;
        case "ArrowUp":
        case "ArrowDown":
          if (vertical(event.key, i)) event.preventDefault();
          break;
      }
    });
  });

  return {
    boxes,
    values: () => boxes.map((box) => box.value),
    focus,
    lock: () => boxes.forEach((box) => (box.disabled = true)),
  };
}

function describe(node: HTMLElement, exercise: Exercise): void {
  node.dataset.operator = exercise.operator;
  node.dataset.top = String(exercise.top);
  node.dataset.bottom = String(exercise.bottom);
}

export function columnBoard(exercise: Exercise, limits: Limits, events: BoardEvents): Board {
  const columns = columnCount(exercise.operator, limits);
  const nameOf = (index: number): string => columnName(columns - 1 - index);
  // A multiplication by a number of several digits gets one partial product per digit,
  // each shifted one column to the left, then the total.
  const partials = exercise.operator === "×" ? String(exercise.bottom).length : 1;
  const multiLine = partials > 1;

  const grid = el("div", "board grid");
  grid.style.setProperty("--columns", String(columns));
  describe(grid, exercise);

  // Carry row: a small optional box above every column except the units.
  // Carries are scratch work, they are not checked.
  const carries: (HTMLInputElement | null)[] = [];
  grid.append(el("span", "carry-cell"));
  for (let i = 0; i < columns; i++) {
    const holder = el("span", "carry-cell");
    const carry = i === columns - 1 ? null : digitInput("carry", t("carryOf", { column: nameOf(i) }));
    if (carry) {
      carry.tabIndex = -1; // reached with ↑ or a tap, so Tab stays on the answer
      holder.append(carry);
    }
    carries.push(carry);
    grid.append(holder);
  }

  const row = (kind: string, operator: string, digits: string[]): void => {
    grid.append(el("span", "cell operator", operator));
    for (const digit of digits) grid.append(el("span", `cell ${kind}`, digit));
  };
  row("top", "", toColumns(exercise.top, columns));
  row("bottom", exercise.operator, toColumns(exercise.bottom, columns));
  grid.append(el("div", "rule"));

  // Answer rows, top to bottom: the partial products (if any), then the total.
  // Every row is indexed from the left, so box i of any row sits in column i.
  const rows: DigitRow[] = [];
  const vertical = (r: number) => (key: "ArrowUp" | "ArrowDown", i: number): boolean => {
    if (key === "ArrowUp" && r === 0) {
      if (!carries[i]) return false;
      selectBox(carries[i]);
      return true;
    }
    const target = rows[key === "ArrowUp" ? r - 1 : r + 1];
    if (!target || !target.boxes[i]) return false;
    target.focus(i);
    return true;
  };

  if (multiLine) {
    for (let p = 0; p < partials; p++) {
      const r = p;
      // Enter on a partial product goes to the next line; the last one leads to the total.
      const rowEvents = { onEdit: events.onEdit, onEnter: () => rows[r + 1]?.focus() };
      const partial = digitRow(
        columns - p,
        "leftward",
        (i) => t("partialRow", { n: p + 1, column: nameOf(i) }),
        rowEvents,
        vertical(r),
      );
      for (const box of partial.boxes) box.classList.add("partial");
      rows.push(partial);
      grid.append(el("span", "cell operator"), ...partial.boxes);
      for (let k = 0; k < p; k++) grid.append(el("span", "cell shift"));
    }
    grid.append(el("div", "rule thin"));
  }

  const total = digitRow(columns, "leftward", nameOf, events, vertical(rows.length));
  rows.push(total);
  grid.append(el("span", "cell operator", "="), ...total.boxes);

  const first = rows[0]!;
  const focusCarry = (from: number, step: -1 | 1): void => {
    for (let i = from + step; i >= 0 && i < columns; i += step) {
      if (carries[i]) return selectBox(carries[i]);
    }
  };
  carries.forEach((carry, i) => {
    if (!carry) return;
    carry.addEventListener("input", () => {
      if (lastDigit(carry)) first.focus(i); // carry written: back down to this column
    });
    carry.addEventListener("keydown", (event) => {
      switch (event.key) {
        case "Enter":
          event.preventDefault();
          events.onEnter();
          break;
        case "ArrowDown":
          event.preventDefault();
          first.focus(i);
          break;
        case "ArrowLeft":
          event.preventDefault();
          focusCarry(i, -1);
          break;
        case "ArrowRight":
          event.preventDefault();
          focusCarry(i, 1);
          break;
      }
    });
  });

  return {
    node: grid,
    // Only the total is checked; the partial products are the child's working.
    read(): BoardAnswer {
      const parsed = parseAnswer(total.values());
      if (parsed.kind === "empty") {
        return { kind: "problem", message: "needDigits", focus: () => total.focus() };
      }
      if (parsed.kind === "gap") {
        return { kind: "problem", message: "missingDigit", focus: () => total.focus(parsed.index) };
      }
      return { kind: "value", value: parsed.value, remainder: null };
    },
    lock(): void {
      for (const line of rows) line.lock();
      for (const carry of carries) if (carry) carry.disabled = true;
    },
    focus: () => first.focus(), // start on the units of the first line
  };
}

/**
 * Euclidean division as written on paper:
 *
 *     1 2 8 │ 4
 *           ├─────
 *     ▢ ▢ ▢ │ ▢ ▢     ← working line 1 | quotient
 *     ▢ ▢ ▢ │         ← working line 2
 *     Reste ▢ │
 *
 * One working line per step (that is, per digit of the quotient), where the
 * child writes partial dividends and remainders; they are not checked. The
 * remainder, on the last line, is checked with the quotient.
 */
export function divisionBoard(exercise: Exercise, limits: Limits, events: BoardEvents): Board {
  const boxes = divisionBoxes(limits);
  const dividend = String(exercise.top).split("");
  const divisor = String(exercise.bottom).split("");
  // Steps of the division = digits of the quotient; this follows from the dividend and divisor shown.
  const steps = String(exercise.answer).length;

  const left = Math.max(dividend.length, boxes.remainder); // columns under the dividend
  const right = Math.max(divisor.length, boxes.quotient); // columns under the divisor
  const LABEL = 1;
  const FIRST = 2; // first column under the dividend
  const BAR = FIRST + left;
  const RIGHT = BAR + 1;
  const lastRow = 2 + steps;

  const wrap = el("div", "board division");
  wrap.style.setProperty("--columns", String(left + right + 2));
  wrap.style.gridTemplateColumns = `auto repeat(${left}, var(--cell)) 0.4rem repeat(${right}, var(--cell))`;
  describe(wrap, exercise);

  const place = <T extends HTMLElement>(node: T, row: number, column: number): T => {
    node.style.gridRow = String(row);
    node.style.gridColumn = String(column);
    return node;
  };

  // Lines first, so the digits are drawn over them.
  const vbar = el("div", "vbar");
  vbar.style.gridRow = `1 / ${lastRow + 1}`;
  vbar.style.gridColumn = String(BAR);
  const hbar = el("div", "hbar");
  hbar.style.gridRow = "1";
  hbar.style.gridColumn = `${BAR} / ${RIGHT + right}`;
  wrap.append(vbar, hbar);

  dividend.forEach((digit, i) =>
    wrap.append(place(el("span", "cell top", digit), 1, FIRST + left - dividend.length + i)),
  );
  divisor.forEach((digit, i) => wrap.append(place(el("span", "cell bottom", digit), 1, RIGHT + i)));

  const numbered = (what: Key) => (index: number): string =>
    t("digitOf", { what: t(what), n: index + 1 });

  // DOM order = Tab order: quotient, working lines, remainder.
  const quotient: DigitRow = digitRow(boxes.quotient, "rightward", numbered("quotient"), events, (key) => {
    if (key !== "ArrowDown") return false;
    remainder.focus();
    return true;
  });
  quotient.boxes.forEach((box, i) => wrap.append(place(box, 2, RIGHT + i)));

  const working: DigitRow[] = [];
  for (let r = 0; r < steps; r++) {
    const line = digitRow(
      left,
      "rightward",
      (i) => t("workingLine", { n: r + 1, m: i + 1 }),
      events,
      (key, i) => {
        const target = working[key === "ArrowUp" ? r - 1 : r + 1];
        if (!target) return false;
        target.focus(i);
        return true;
      },
    );
    line.boxes.forEach((box, i) => {
      box.classList.add("scratch");
      wrap.append(place(box, 2 + r, FIRST + i));
    });
    working.push(line);
  }

  const remainder: DigitRow = digitRow(boxes.remainder, "rightward", numbered("remainder"), events, (key) => {
    if (key !== "ArrowUp") return false;
    quotient.focus();
    return true;
  });
  wrap.append(place(el("span", "remainder-label", t("remainder")), lastRow, LABEL));
  remainder.boxes.forEach((box, i) =>
    wrap.append(place(box, lastRow, FIRST + left - boxes.remainder + i)),
  );

  return {
    node: wrap,
    read(): BoardAnswer {
      const q = parseAnswer(quotient.values(), true);
      if (q.kind === "empty") {
        return { kind: "problem", message: "needDigits", focus: () => quotient.focus() };
      }
      if (q.kind === "gap") {
        return { kind: "problem", message: "missingDigit", focus: () => quotient.focus(q.index) };
      }
      const r = parseAnswer(remainder.values(), true);
      if (r.kind === "empty") {
        return { kind: "problem", message: "needRemainder", focus: () => remainder.focus() };
      }
      if (r.kind === "gap") {
        return { kind: "problem", message: "missingDigit", focus: () => remainder.focus(r.index) };
      }
      return { kind: "value", value: q.value, remainder: r.value };
    },
    lock(): void {
      quotient.lock();
      remainder.lock();
      for (const line of working) line.lock();
    },
    focus: () => quotient.focus(),
  };
}
