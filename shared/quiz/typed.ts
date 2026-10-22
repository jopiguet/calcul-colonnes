/**
 * Typed answers: for a question whose answer is a number, the player may type
 * it instead of picking one of four options. Shared by the browser (preview)
 * and the server (grading), so both read an answer the same way.
 *
 * What is accepted:
 *   - an exact value: 7/45, 2π/3, √2, sqrt(2)/2, e^2 - 1, ln 3 ("e" is
 *     always Euler's number; scientific notation is not read);
 *   - a decimal rounding, right to its last digit: 1.05 or 1,05 for π/3
 *     (|x − v| ≤ half a unit of the last digit typed), and never looser than
 *     0.6 % of the answer, so "1" is not taken for π/3.
 *
 * A typed value that matches a wrong option counts as that option: its mistake
 * is recorded as if it had been picked. A question is offered typed only when
 * no wrong option is close enough to the answer to be confused with it.
 */
import type { Question } from "./types";

export type AnswerMode = "choices" | "typed";
export const ANSWER_MODES: AnswerMode[] = ["choices", "typed"];

/** What a typed answer means: its value, and how precisely it was written. */
export interface Reading {
  value: number;
  /** An expression (7/45, 2π/3…): compared exactly. A plain decimal is not. */
  exact: boolean;
  /** For a plain decimal: half a unit of its last digit (0.005 for "1.05"). */
  halfUnit: number;
}

/** Longest answer accepted. */
export const TYPED_MAX = 40;

/** Relative cap on the tolerance of a rounding: 0.6 % of the answer (at least of 0.1). */
const CAP = 0.006;
const cap = (v: number): number => CAP * Math.max(Math.abs(v), 0.1);

type Token = { kind: "num"; value: number } | { kind: "name"; name: string } | { kind: "op"; op: string };

function tokenize(text: string): Token[] | null {
  const s = text
    .replace(/(\d),(\d)/g, "$1.$2")
    .replace(/[−–]/g, "-")
    .replace(/[×·]/g, "*")
    .replace(/÷/g, "/")
    .replace(/π/g, " pi ")
    .replace(/√/g, " sqrt ")
    .replace(/²/g, "^2")
    .replace(/³/g, "^3")
    .toLowerCase();
  const tokens: Token[] = [];
  let i = 0;
  while (i < s.length) {
    const c = s[i]!;
    if (c === " ") {
      i++;
      continue;
    }
    const num = /^(\d+(\.\d*)?|\.\d+)/.exec(s.slice(i));
    if (num) {
      tokens.push({ kind: "num", value: Number(num[0]) });
      i += num[0].length;
      continue;
    }
    const name = /^(pi|sqrt|ln|exp|e)/.exec(s.slice(i));
    if (name) {
      tokens.push({ kind: "name", name: name[0] });
      i += name[0].length;
      continue;
    }
    if ("+-*/^()".includes(c)) {
      tokens.push({ kind: "op", op: c });
      i++;
      continue;
    }
    return null;
  }
  return tokens;
}

/** Recursive descent over + − × / ^, with implicit products (2π, 3√2, 2(1+x)). */
function evaluate(tokens: Token[]): number | null {
  let at = 0;
  const peek = (): Token | undefined => tokens[at];
  const isOp = (op: string): boolean => {
    const t = peek();
    return t?.kind === "op" && t.op === op;
  };
  const startsAtom = (): boolean => {
    const t = peek();
    return t !== undefined && (t.kind === "num" || t.kind === "name" || (t.kind === "op" && t.op === "("));
  };

  function expr(): number {
    let v = term();
    while (isOp("+") || isOp("-")) {
      const op = (tokens[at++] as { op: string }).op;
      const r = term();
      v = op === "+" ? v + r : v - r;
    }
    return v;
  }
  function term(): number {
    let v = unary();
    for (;;) {
      if (isOp("*") || isOp("/")) {
        const op = (tokens[at++] as { op: string }).op;
        const r = unary();
        v = op === "*" ? v * r : v / r;
      } else if (startsAtom()) {
        v *= power(); // implicit product
      } else return v;
    }
  }
  function unary(): number {
    if (isOp("-")) {
      at++;
      return -unary();
    }
    if (isOp("+")) {
      at++;
      return unary();
    }
    return power();
  }
  function power(): number {
    const base = atom();
    if (isOp("^")) {
      at++;
      return base ** unary();
    }
    return base;
  }
  function atom(): number {
    const t = tokens[at++];
    if (!t) throw new Error("end");
    if (t.kind === "num") return t.value;
    if (t.kind === "name") {
      if (t.name === "pi") return Math.PI;
      if (t.name === "e") return Math.E;
      const arg = power();
      if (t.name === "sqrt") return Math.sqrt(arg);
      if (t.name === "ln") return Math.log(arg);
      return Math.exp(arg);
    }
    if (t.op === "(") {
      const v = expr();
      if (!isOp(")")) throw new Error("unclosed");
      at++;
      return v;
    }
    throw new Error("unexpected");
  }

  try {
    const v = expr();
    return at === tokens.length && Number.isFinite(v) ? v : null;
  } catch {
    return null;
  }
}

/** Reads a typed answer, or null when it is not a number the app understands. */
export function readNumber(text: string): Reading | null {
  const trimmed = text.trim();
  if (trimmed === "" || trimmed.length > TYPED_MAX) return null;
  // A plain decimal: its precision is what was typed.
  const plain = /^([+\-−]?)(\d+)(?:[.,](\d+))?$/.exec(trimmed);
  if (plain) {
    const digits = plain[3]?.length ?? 0;
    const value = Number(`${plain[1] === "" || plain[1] === "+" ? "" : "-"}${plain[2]}.${plain[3] ?? "0"}`);
    return { value, exact: false, halfUnit: 0.5 * 10 ** -digits };
  }
  const tokens = tokenize(trimmed);
  if (!tokens || tokens.length === 0) return null;
  const value = evaluate(tokens);
  return value === null ? null : { value, exact: true, halfUnit: 0 };
}

/** Whether a reading stands for the value v. */
export function accepts(reading: Reading, v: number): boolean {
  if (reading.exact) return Math.abs(reading.value - v) <= 1e-9 * Math.max(1, Math.abs(v));
  // An integer typed for an integer answer is exact; a rounding is good to its last digit, within the cap.
  // The margin is relative: a half unit at the limit stays accepted for large values despite floating-point error.
  return Math.abs(reading.value - v) <= Math.min(reading.halfUnit, cap(v)) + 1e-12 * Math.max(1, Math.abs(v));
}

/**
 * Whether a question can be answered by typing: every option is a number
 * below a million, and no wrong option is near enough to the answer that the same
 * rounding could stand for both.
 */
export function typeable(q: Question): boolean {
  // Numbers someone can type: no infinities, nothing beyond a million, no constant spread over powers of ten.
  if (!q.options.every((o) => o.num !== undefined && Math.abs(o.num) < 1e6 && !o.graph && !o.choiceOnly)) return false;
  const right = q.options[q.correct]!.num!;
  return q.options.every((o, i) => i === q.correct || Math.abs(o.num! - right) > cap(right) + cap(o.num!));
}

/**
 * The option a typed answer stands for: the right one, a wrong one (its mistake
 * is then known), −2 when it matches none, −1 when blank.
 */
export function matchTyped(q: Question, text: string): number {
  if (text.trim() === "") return -1;
  const reading = readNumber(text);
  if (!reading) return -2;
  if (accepts(reading, q.options[q.correct]!.num!)) return q.correct;
  const wrong = q.options.findIndex((o, i) => i !== q.correct && accepts(reading, o.num!));
  return wrong >= 0 ? wrong : -2;
}

/** An answer as sent by the browser: an option index (−1 blank), or typed text. */
export type GivenAnswer = number | string;

/**
 * Each answer as an option index: typed text is matched when the test was
 * typed and the question typeable, and is a blank otherwise.
 */
export function resolveAnswers(questions: Question[], answers: GivenAnswer[], mode: AnswerMode): number[] {
  return questions.map((q, i) => {
    const a = answers[i] ?? -1;
    if (typeof a === "number") return a;
    return mode === "typed" && typeable(q) ? matchTyped(q, a) : -1;
  });
}
