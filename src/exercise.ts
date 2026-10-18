import type { Operator } from "../shared/types";

export type { Operator };

/** For a division: top = dividend, bottom = divisor, answer = quotient. */
export interface Exercise {
  operator: Operator;
  top: number;
  bottom: number;
  answer: number;
  /** Remainder of a division; null for the other operations. */
  remainder: number | null;
}

export interface Limits {
  /** Maximum of the big number: top number, or dividend. */
  maximum: number;
  /** Maximum of the multiplier and of the divisor. */
  smallLimit: number;
}

/** Random integer in [min, max], both inclusive (same contract as Python's randint). */
function randint(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}

export function adding({ maximum }: Limits): Exercise {
  const top = randint(10, maximum);
  const bottom = randint(1, top);
  return { operator: "+", top, bottom, answer: top + bottom, remainder: null };
}

export function subtracting({ maximum }: Limits): Exercise {
  const top = randint(10, maximum);
  const bottom = randint(1, top);
  return { operator: "−", top, bottom, answer: top - bottom, remainder: null };
}

/** The lower number is drawn first, from its own limit. */
export function multiplying({ maximum, smallLimit }: Limits): Exercise {
  const bottom = randint(2, smallLimit);
  const top = randint(10, maximum);
  return { operator: "×", top, bottom, answer: top * bottom, remainder: null };
}

/**
 * Euclidean division, built from its solution: a divisor within its limit and a
 * whole quotient, plus a remainder smaller than the divisor. The dividend
 * (divisor × quotient + remainder) never exceeds the maximum.
 */
export function dividing({ maximum, smallLimit }: Limits): Exercise {
  const divisor = randint(2, smallLimit);
  const quotient = randint(1, Math.floor(maximum / divisor));
  const remainder = randint(0, Math.min(divisor - 1, maximum - divisor * quotient));
  return {
    operator: "÷",
    top: divisor * quotient + remainder,
    bottom: divisor,
    answer: quotient,
    remainder,
  };
}

const generators: Record<Operator, (limits: Limits) => Exercise> = {
  "+": adding,
  "−": subtracting,
  "×": multiplying,
  "÷": dividing,
};

export function randomExercise(operators: Operator[], limits: Limits): Exercise {
  const operator = operators[randint(0, operators.length - 1)] ?? "+";
  return generators[operator](limits);
}

const digits = (n: number): number => String(n).length;

/** Digit columns of a column operation (+, −, ×): enough for its largest possible answer. */
export function columnCount(operator: Operator, { maximum, smallLimit }: Limits): number {
  return digits(operator === "×" ? maximum * smallLimit : 2 * maximum);
}

/** Boxes needed for the largest quotient and the largest remainder of a division. */
export function divisionBoxes({ maximum, smallLimit }: Limits): { quotient: number; remainder: number } {
  return { quotient: digits(Math.floor(maximum / 2)), remainder: digits(smallLimit - 1) };
}

/** Digits of n right-aligned on `columns` cells; unused cells on the left are empty strings. */
export function toColumns(n: number, columns: number): string[] {
  return String(n).padStart(columns, " ").split("").map((c) => c.trim());
}

export type ParsedAnswer =
  | { kind: "empty" }
  | { kind: "gap"; index: number }
  | { kind: "value"; value: number };

/**
 * Reads a row of digit boxes (left to right). Empty boxes are allowed on the
 * left, and also on the right when `trailing` is true (numbers written from
 * the left, as in a division). A hole between two digits is reported.
 */
export function parseAnswer(cells: string[], trailing = false): ParsedAnswer {
  const first = cells.findIndex((c) => c !== "");
  if (first === -1) return { kind: "empty" };
  let last = cells.length - 1;
  if (trailing) while (cells[last] === "") last -= 1;
  const gap = cells.findIndex((c, i) => i > first && i <= last && c === "");
  if (gap !== -1) return { kind: "gap", index: gap };
  return { kind: "value", value: Number(cells.slice(first, last + 1).join("")) };
}
