export type Operator = "+" | "−";

export interface Exercise {
  top: number;
  bottom: number;
  operator: Operator;
  answer: number;
}

/** Random integer in [min, max], both inclusive (same contract as Python's randint). */
function randint(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}

function operands(maximum: number): { top: number; bottom: number } {
  const top = randint(10, maximum);
  const bottom = randint(1, top);
  return { top, bottom };
}

export function adding(maximum: number): Exercise {
  const { top, bottom } = operands(maximum);
  return { top, bottom, operator: "+", answer: top + bottom };
}

export function subtracting(maximum: number): Exercise {
  const { top, bottom } = operands(maximum);
  return { top, bottom, operator: "−", answer: top - bottom };
}

const operations = [adding, subtracting] as const;

export function randomExercise(maximum: number): Exercise {
  const pick = operations[randint(0, operations.length - 1)] ?? adding;
  return pick(maximum);
}

/** Number of digit columns needed for any answer at this maximum (largest sum is 2 × maximum). */
export function columnCount(maximum: number): number {
  return String(2 * maximum).length;
}

/** Digits of n right-aligned on `columns` cells; unused cells on the left are empty strings. */
export function toColumns(n: number, columns: number): string[] {
  return String(n).padStart(columns, " ").split("").map((c) => c.trim());
}

export type ParsedAnswer =
  | { kind: "empty" }
  | { kind: "gap" }
  | { kind: "value"; value: number };

/** Reads the answer cells (left to right). Leading empty cells are allowed, holes are not. */
export function parseAnswer(cells: string[]): ParsedAnswer {
  const first = cells.findIndex((c) => c !== "");
  if (first === -1) return { kind: "empty" };
  const digits = cells.slice(first);
  if (digits.some((c) => c === "")) return { kind: "gap" };
  return { kind: "value", value: Number(digits.join("")) };
}
