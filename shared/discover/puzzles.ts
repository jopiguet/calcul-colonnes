/**
 * Logic puzzles: grids of n × n where every row and every column holds the
 * numbers 1 to n once (a Latin square), with either some numbers given or
 * cages: groups of squares whose numbers, combined by an operation, make a
 * target ("7+", "2÷").
 *
 * Two promises, kept by construction and verified by `npm run check:discover`:
 *
 *   - every grid has exactly one solution (a brute-force count says so);
 *   - every grid can be solved by reasoning alone, never by guessing: the
 *     generator keeps a grid only if `solveLogically`, which uses the moves a
 *     person uses, finishes it.
 *
 * The same moves make the hints (`nextStep`): the next square that can be
 * deduced from the grid as the child has filled it, and why.
 *
 * A grid is its seed and level: the same number gives the same grid.
 */
import { createRng, type Rng } from "../quiz/rng";

export type Op = "+" | "−" | "×" | "÷" | "=";

export interface Cage {
  cells: number[];
  op: Op;
  target: number;
}

export interface Level {
  id: 1 | 2 | 3 | 4;
  size: number;
  /** Operations used by cages; none: a grid with given numbers instead. */
  ops: Exclude<Op, "=">[];
  /** Moves the logical solver may use; what the hints may explain. */
  pairs: boolean;
  /**
   * Steps that need several clues combined, at most: the hints for those are
   * the least concrete, so a grid keeps few of them.
   */
  maxCombined: number;
}

export const LEVELS: readonly Level[] = [
  { id: 1, size: 4, ops: [], pairs: false, maxCombined: 0 },
  { id: 2, size: 4, ops: ["+"], pairs: false, maxCombined: 0 },
  { id: 3, size: 5, ops: ["+", "−"], pairs: true, maxCombined: 1 },
  { id: 4, size: 6, ops: ["+", "−", "×", "÷"], pairs: true, maxCombined: 2 },
];

export const levelOf = (id: number): Level => LEVELS.find((l) => l.id === id) ?? LEVELS[0]!;

export interface Puzzle {
  seed: number;
  level: Level;
  size: number;
  /** The solution, row by row: cell i is row ⌊i / n⌋, column i mod n. */
  solution: number[];
  /** Cages (cage levels), or none (level 1). */
  cages: Cage[];
  /** Cell → its cage's index; −1 when there are no cages. */
  cageOf: number[];
  /** Cells whose number is given: level 1's clues, and one-square cages. */
  givens: number[];
}

// ------------------------------------------------------------------ helpers

export const rowOf = (cell: number, n: number): number => Math.floor(cell / n);
export const colOf = (cell: number, n: number): number => cell % n;
const bit = (v: number): number => 1 << v;
const has = (mask: number, v: number): boolean => (mask & bit(v)) !== 0;
const valuesOf = (mask: number, n: number): number[] => {
  const out: number[] = [];
  for (let v = 1; v <= n; v++) if (has(mask, v)) out.push(v);
  return out;
};
const count = (mask: number): number => {
  let c = 0;
  for (let m = mask; m; m &= m - 1) c++;
  return c;
};
const full = (n: number): number => ((1 << (n + 1)) - 1) & ~1;

/** The cells of row r, or of column c. */
export const rowCells = (r: number, n: number): number[] => Array.from({ length: n }, (_, c) => r * n + c);
export const colCells = (c: number, n: number): number[] => Array.from({ length: n }, (_, r) => r * n + c);

/** Does a cage hold for these values (in the order of its cells)? */
export function cageHolds(cage: Cage, values: number[]): boolean {
  switch (cage.op) {
    case "=":
      return values[0] === cage.target;
    case "+":
      return values.reduce((a, b) => a + b, 0) === cage.target;
    case "×":
      return values.reduce((a, b) => a * b, 1) === cage.target;
    case "−":
      return Math.abs(values[0]! - values[1]!) === cage.target;
    case "÷": {
      const [a, b] = [Math.max(values[0]!, values[1]!), Math.min(values[0]!, values[1]!)];
      return a % b === 0 && a / b === cage.target;
    }
  }
}

/** The label of a cage: "7+", "2÷", "3" for a one-square cage. */
export const cageLabel = (cage: Cage): string => (cage.op === "=" ? String(cage.target) : `${cage.target}${cage.op}`);

// --------------------------------------------------------------- generation

/** A Latin square from the seed: shifted rows, then rows, columns and numbers shuffled. */
function latinSquare(n: number, rng: Rng): number[] {
  const rows = rng.shuffle([...Array(n).keys()]);
  const cols = rng.shuffle([...Array(n).keys()]);
  const symbols = rng.shuffle(Array.from({ length: n }, (_, i) => i + 1));
  const grid: number[] = [];
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) grid.push(symbols[(rows[r]! + cols[c]!) % n]!);
  return grid;
}

/** Cages of 1 to 4 connected squares, with an operation each. */
function makeCages(solution: number[], level: Level, rng: Rng): Cage[] {
  const n = level.size;
  const owner = Array<number>(n * n).fill(-1);
  const cages: Cage[] = [];
  // Mostly pairs and triples; a few singles (given numbers) and, on 6 × 6, some fours.
  const sizes = n === 4 ? [1, 2, 2, 2, 2, 3, 3, 3] : n === 5 ? [1, 2, 2, 2, 2, 3, 3, 3, 3] : [1, 2, 2, 2, 3, 3, 3, 3, 4];
  for (const start of rng.shuffle([...Array(n * n).keys()])) {
    if (owner[start] !== -1) continue;
    const wanted = rng.pick(sizes);
    const cells = [start];
    owner[start] = cages.length;
    while (cells.length < wanted) {
      const options: number[] = [];
      for (const cell of cells) {
        const r = rowOf(cell, n);
        const c = colOf(cell, n);
        for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]] as const) {
          const rr = r + dr;
          const cc = c + dc;
          if (rr >= 0 && rr < n && cc >= 0 && cc < n && owner[rr * n + cc] === -1) options.push(rr * n + cc);
        }
      }
      if (options.length === 0) break;
      const next = rng.pick(options);
      owner[next] = cages.length;
      cells.push(next);
    }
    cells.sort((a, b) => a - b);
    const values = cells.map((c) => solution[c]!);
    cages.push(chooseOp(cells, values, level, rng));
  }
  return cages;
}

function chooseOp(cells: number[], values: number[], level: Level, rng: Rng): Cage {
  if (cells.length === 1) return { cells, op: "=", target: values[0]! };
  const sum = values.reduce((a, b) => a + b, 0);
  const product = values.reduce((a, b) => a * b, 1);
  const options: Cage[] = [];
  if (level.ops.includes("+")) options.push({ cells, op: "+", target: sum });
  if (level.ops.includes("×")) options.push({ cells, op: "×", target: product });
  if (cells.length === 2) {
    const [a, b] = [Math.max(...values), Math.min(...values)];
    // − and ÷ are offered twice: on two squares they make better puzzles than + and ×.
    if (level.ops.includes("−")) options.push({ cells, op: "−", target: a - b }, { cells, op: "−", target: a - b });
    if (level.ops.includes("÷") && a % b === 0) options.push({ cells, op: "÷", target: a / b }, { cells, op: "÷", target: a / b });
  }
  return rng.pick(options);
}

/**
 * The grid for a seed and a level. Candidates are drawn until the logical
 * solver finishes one with few steps that need several clues combined
 * (`maxCombined`); for level 1, given numbers are then removed one by one
 * while it still can, keeping at least half the grid minus one.
 */
export function generatePuzzle(seed: number, levelId: number): Puzzle {
  const level = levelOf(levelId);
  const n = level.size;
  const rng = createRng(seed * 7 + level.id);
  for (let attempt = 0; ; attempt++) {
    const solution = latinSquare(n, rng);
    if (level.ops.length === 0) {
      const givens = [...Array(n * n).keys()];
      const keep = Math.floor((n * n) / 2) - 1;
      for (const cell of rng.shuffle([...givens])) {
        if (givens.length <= keep) break;
        const fewer = givens.filter((g) => g !== cell);
        const trial: Puzzle = { seed, level, size: n, solution, cages: [], cageOf: Array(n * n).fill(-1), givens: fewer };
        if (solveLogically(trial).solved) givens.splice(givens.indexOf(cell), 1);
      }
      return { seed, level, size: n, solution, cages: [], cageOf: Array(n * n).fill(-1), givens: givens.sort((a, b) => a - b) };
    }
    const cages = makeCages(solution, level, rng);
    const cageOf = Array<number>(n * n).fill(-1);
    cages.forEach((cage, i) => cage.cells.forEach((cell) => (cageOf[cell] = i)));
    const givens = cages.filter((c) => c.op === "=").flatMap((c) => c.cells);
    const puzzle: Puzzle = { seed, level, size: n, solution, cages, cageOf, givens };
    const solved = solveLogically(puzzle);
    if (solved.solved && solved.steps.filter((s) => s.reason.kind === "combined").length <= level.maxCombined) return puzzle;
    if (attempt > 2000) throw new Error(`no puzzle for seed ${seed}, level ${level.id}`);
  }
}

// ------------------------------------------------------------ the reasoning

/** Why a square's number follows. */
export type Reason =
  | { kind: "given" }
  /** Its row and column already hold every other number. */
  | { kind: "single"; inRow: number[]; inCol: number[] }
  /** The only square of its row or column where this number can go. */
  | { kind: "hidden"; unit: "row" | "col" }
  /** Its cage's arithmetic leaves only this number, given its row and column. */
  | { kind: "cage"; cage: number; combos: number[][]; inRow: number[]; inCol: number[] }
  /**
   * Several clues together: the cages around (and, from level 3, two squares
   * of a row or column sharing the same two numbers, which rules them out
   * elsewhere in it).
   */
  | { kind: "combined"; pairs: boolean };

export interface Step {
  cell: number;
  value: number;
  reason: Reason;
}

/**
 * Candidates for every empty cell, from the numbers placed (`placed[i]`, 0 if
 * empty), using the moves the level allows: rows and columns, cage
 * arithmetic, and pairs. Repeated until nothing changes.
 */
function candidates(p: Puzzle, placed: number[]): number[] {
  const n = p.size;
  const cand = placed.map((v) => (v ? bit(v) : full(n)));
  for (let changed = true; changed; ) {
    changed = false;
    const narrow = (cell: number, mask: number): void => {
      const next = cand[cell]! & mask;
      if (next !== cand[cell]) {
        cand[cell] = next;
        changed = true;
      }
    };
    // A settled square rules its number out of its row and column.
    for (let cell = 0; cell < n * n; cell++) {
      if (count(cand[cell]!) !== 1) continue;
      const r = rowOf(cell, n);
      const c = colOf(cell, n);
      for (const other of [...rowCells(r, n), ...colCells(c, n)]) if (other !== cell) narrow(other, ~cand[cell]!);
    }
    // Cage arithmetic: only numbers that appear in some valid filling of the cage.
    for (const cage of p.cages) {
      const possible = cageFillings(cage, cand, n);
      cage.cells.forEach((cell, i) => narrow(cell, possible.reduce((m, f) => m | bit(f[i]!), 0)));
    }
    // Pairs: two squares of a unit with the same two candidates take those two numbers.
    if (p.level.pairs) {
      for (let u = 0; u < n; u++) {
        for (const unit of [rowCells(u, n), colCells(u, n)]) {
          for (let i = 0; i < unit.length; i++) {
            const a = unit[i]!;
            if (count(cand[a]!) !== 2) continue;
            for (let j = i + 1; j < unit.length; j++) {
              const b = unit[j]!;
              if (cand[b] !== cand[a]) continue;
              for (const other of unit) if (other !== a && other !== b) narrow(other, ~cand[a]!);
            }
          }
        }
      }
    }
  }
  return cand;
}

/** Every filling of a cage from the cells' candidates that keeps rows and columns distinct and makes the target. */
export function cageFillings(cage: Cage, cand: number[], n: number): number[][] {
  const out: number[][] = [];
  const values: number[] = [];
  const walk = (i: number): void => {
    if (i === cage.cells.length) {
      if (cageHolds(cage, values)) out.push([...values]);
      return;
    }
    const cell = cage.cells[i]!;
    for (const v of valuesOf(cand[cell]!, n)) {
      const clash = cage.cells.slice(0, i).some((other, j) => values[j] === v && (rowOf(other, n) === rowOf(cell, n) || colOf(other, n) === colOf(cell, n)));
      if (clash) continue;
      values.push(v);
      walk(i + 1);
      values.pop();
    }
  };
  walk(0);
  return out;
}

/**
 * The next square that can be deduced from the numbers placed, and why;
 * null when none can (which a generated grid never reaches before its end).
 * Easiest reasons first: a given, a square with one number left by its row
 * and column, a number with one place left, then the cage, then pairs.
 */
export function nextStep(p: Puzzle, placed: number[]): Step | null {
  const n = p.size;
  for (const cell of p.givens) if (!placed[cell]) return { cell, value: p.solution[cell]!, reason: { kind: "given" } };
  // What each row and column already holds, once per step.
  const rowMask = Array<number>(n).fill(0);
  const colMask = Array<number>(n).fill(0);
  placed.forEach((v, c) => {
    if (!v) return;
    rowMask[rowOf(c, n)]! |= bit(v);
    colMask[colOf(c, n)]! |= bit(v);
  });
  const rowValues = (cell: number): number[] => valuesOf(rowMask[rowOf(cell, n)]!, n);
  const colValues = (cell: number): number[] => valuesOf(colMask[colOf(cell, n)]!, n);
  /** Numbers a square may hold, from its row and column only. */
  const basic = placed.map((v, c) => (v ? bit(v) : full(n) & ~(rowMask[rowOf(c, n)]! | colMask[colOf(c, n)]!)));
  const empty = [...Array(n * n).keys()].filter((c) => !placed[c]);

  // 1. Its row and column leave one number.
  for (const cell of empty) {
    if (count(basic[cell]!) === 1) {
      return { cell, value: valuesOf(basic[cell]!, n)[0]!, reason: { kind: "single", inRow: rowValues(cell), inCol: colValues(cell) } };
    }
  }
  // 2. A number with one place left in a row or column (rows and columns only).
  for (let u = 0; u < n; u++) {
    for (const [unit, kind] of [[rowCells(u, n), "row"], [colCells(u, n), "col"]] as const) {
      for (let v = 1; v <= n; v++) {
        if (unit.some((c) => placed[c] === v)) continue;
        const places = unit.filter((c) => !placed[c] && has(basic[c]!, v));
        if (places.length === 1) return { cell: places[0]!, value: v, reason: { kind: "hidden", unit: kind } };
      }
    }
  }
  // 3. The cage, with its row and column: one look per cage.
  for (const [k, cage] of p.cages.entries()) {
    if (cage.cells.every((c) => placed[c])) continue;
    const fillings = cageFillings(cage, basic, n);
    for (const [i, cell] of cage.cells.entries()) {
      if (placed[cell]) continue;
      const left = new Set(fillings.map((f) => f[i]!));
      if (left.size === 1) return { cell, value: [...left][0]!, reason: { kind: "cage", cage: k, combos: cageCombos(cage, n), inRow: rowValues(cell), inCol: colValues(cell) } };
    }
  }
  // 4. Everything the level allows together: cages around, and pairs from level 3.
  // The full candidates are costly; most steps are found before this point.
  const cand = candidates(p, placed);
  const combined: Reason = { kind: "combined", pairs: p.level.pairs };
  for (const cell of empty) {
    if (count(cand[cell]!) === 1) return { cell, value: valuesOf(cand[cell]!, n)[0]!, reason: combined };
  }
  for (let u = 0; u < n; u++) {
    for (const unit of [rowCells(u, n), colCells(u, n)]) {
      for (let v = 1; v <= n; v++) {
        if (unit.some((c) => placed[c] === v)) continue;
        const places = unit.filter((c) => !placed[c] && has(cand[c]!, v));
        if (places.length === 1) return { cell: places[0]!, value: v, reason: combined };
      }
    }
  }
  return null;
}

/**
 * The sets of numbers a cage can hold in a grid of n, without order and
 * before any row or column is considered: "3 + 4" for 7+ on a 4 × 4 grid.
 * Squares of a cage in different rows and columns may repeat a number.
 */
export function cageCombos(cage: Cage, n: number): number[][] {
  const all = Array<number>(n * n).fill(full(n));
  const sets = new Map<string, number[]>();
  for (const filling of cageFillings(cage, all, n)) {
    const sorted = [...filling].sort((a, b) => a - b);
    sets.set(sorted.join(","), sorted);
  }
  // In reading order: [1, 1, 4] before [1, 2, 3].
  return [...sets.values()].sort((a, b) => {
    for (let i = 0; i < Math.min(a.length, b.length); i++) if (a[i] !== b[i]) return a[i]! - b[i]!;
    return a.length - b.length;
  });
}

/** Solves by reasoning alone, step by step, from the givens. */
export function solveLogically(p: Puzzle): { solved: boolean; steps: Step[] } {
  const placed = Array<number>(p.size * p.size).fill(0);
  const steps: Step[] = [];
  for (;;) {
    const step = nextStep(p, placed);
    if (!step) break;
    // A deduction that contradicts the solution would be a bug: stop there.
    if (step.value !== p.solution[step.cell]) return { solved: false, steps };
    placed[step.cell] = step.value;
    steps.push(step);
  }
  return { solved: placed.every(Boolean), steps };
}

/** Counts solutions by trying every number, up to `limit`: the independent check of uniqueness. */
export function countSolutions(p: Puzzle, limit = 2): number {
  const n = p.size;
  const grid = Array<number>(n * n).fill(0);
  for (const cell of p.cages.length ? [] : p.givens) grid[cell] = p.solution[cell]!;
  let found = 0;
  const fits = (cell: number, v: number): boolean => {
    const r = rowOf(cell, n);
    const c = colOf(cell, n);
    for (let i = 0; i < n; i++) if (grid[r * n + i] === v || grid[i * n + c] === v) return false;
    const k = p.cageOf[cell]!;
    if (k < 0) return true;
    const cage = p.cages[k]!;
    grid[cell] = v;
    const values = cage.cells.map((x) => grid[x]!);
    grid[cell] = 0;
    if (values.some((x) => !x)) {
      // Partial cage: + and × must leave room for the squares still empty (each at least 1).
      const known = values.filter(Boolean);
      const missing = values.length - known.length;
      if (cage.op === "+" && known.reduce((a, b) => a + b, 0) + missing > cage.target) return false;
      if (cage.op === "×" && cage.target % known.reduce((a, b) => a * b, 1) !== 0) return false;
      return true;
    }
    return cageHolds(cage, values);
  };
  const walk = (cell: number): void => {
    if (found >= limit) return;
    if (cell === n * n) {
      found++;
      return;
    }
    if (grid[cell]) return walk(cell + 1);
    for (let v = 1; v <= n; v++) {
      if (!fits(cell, v)) continue;
      grid[cell] = v;
      walk(cell + 1);
      grid[cell] = 0;
    }
  };
  walk(0);
  return found;
}
