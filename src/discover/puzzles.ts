/**
 * Logic grids: place 1 to n so that every row and column holds each once,
 * with given numbers (level 1) or cages (levels 2 to 4). The engine is
 * shared/discover/puzzles.ts.
 *
 * The puzzles follow the Discover shape in their own way: the rules, then the
 * grid to work out, and hints that explain rather than tell. A hint has two
 * stages: first the square to look at and the kind of reasoning, then the
 * reasoning in full with the number. Hints come from the grid as the child
 * has filled it; a wrong number is pointed out first.
 *
 * Help without giving answers away: two numbers in a row or column, or a
 * full cage that does not make its target, are shown at once (the rules);
 * whether a number is the solution's is shown only on "Check".
 *
 * One grid per level, kept while the page is open. Nothing is saved.
 */
import { freshSeed } from "../../shared/discover/experiment";
import {
  LEVELS,
  cageHolds,
  cageLabel,
  colOf,
  generatePuzzle,
  nextStep,
  rowOf,
  type Cage,
  type Puzzle,
  type Step,
} from "../../shared/discover/puzzles";
import { el } from "../dom";
import type { User } from "../store";
import { alternatives, dt, list } from "./i18n";
import { againPanel, choiceSet, control, labHead, mountLab, step } from "./lab";

interface Game {
  puzzle: Puzzle;
  /** The number in each square, 0 if empty; the givens are filled. */
  entries: number[];
  /** Small numbers noted in each square, as a bit mask (bit v for v). */
  notes: number[];
  selected: number;
  notesMode: boolean;
  /** The hint shown: a square, its reason, and how far it has been explained. */
  hint: { step: Step | null; cell: number; wrong: boolean; stage: 1 | 2 } | null;
  hints: number;
  /** Squares found wrong by "Check", shown until changed. */
  wrong: Set<number> | null;
  startedAt: number | null;
  solvedAt: number | null;
}

interface State {
  userId: number;
  level: number;
  games: Map<number, Game>;
}

let state: State | null = null;

function newGame(level: number, seed = freshSeed()): Game {
  const puzzle = generatePuzzle(seed, level);
  const entries = Array<number>(puzzle.size * puzzle.size).fill(0);
  for (const cell of puzzle.givens) entries[cell] = puzzle.solution[cell]!;
  const firstEmpty = entries.findIndex((v) => v === 0);
  return {
    puzzle,
    entries,
    notes: Array<number>(entries.length).fill(0),
    selected: Math.max(0, firstEmpty),
    notesMode: false,
    hint: null,
    hints: 0,
    wrong: null,
    startedAt: null,
    solvedAt: null,
  };
}

function game(s: State): Game {
  let g = s.games.get(s.level);
  if (!g) {
    g = newGame(s.level);
    s.games.set(s.level, g);
  }
  return g;
}

/** A grid started and not finished: the update watcher does not reload then. */
export function puzzlesBusy(): boolean {
  if (!state) return false;
  return [...state.games.values()].some((g) => g.solvedAt === null && g.entries.some((v, i) => v !== 0 && !g.puzzle.givens.includes(i)));
}

export function puzzlesView(ctx: { user: User }): HTMLElement {
  if (!state || state.userId !== ctx.user.id) state = { userId: ctx.user.id, level: 1, games: new Map() };
  const s = state;
  return mountLab("is-puzzles", (draw) => {
    const g = game(s);
    return [
      labHead(dt("puzzlesTitle"), g.puzzle.seed, dt("gridNumber", { seed: g.puzzle.seed })),
      levelPanel(s, draw),
      rulesPanel(g),
      gridPanel(g, draw),
      ...(g.solvedAt !== null ? [solvedPanel(g)] : []),
      againPanel({
        checked: g.solvedAt !== null,
        onNew: () => {
          s.games.set(s.level, newGame(s.level));
          draw();
          focusCell(game(s));
        },
        onReplay: (seed) => {
          s.games.set(s.level, newGame(s.level, seed));
          draw();
        },
        labels: { again: dt("nextGrid"), replay: dt("replayGrid"), hint: dt("replayGridHint") },
      }),
    ];
  });
}

// ------------------------------------------------------------------ levels

const OPS_SHOWN: Record<number, string> = { 1: "", 2: "+", 3: "+ −", 4: "+ − × ÷" };

function levelPanel(s: State, draw: () => void): HTMLElement {
  return choiceSet<number>({
    cls: "puzzle-levels",
    legend: dt("levelTitle"),
    options: LEVELS.map((l) => {
      const label = el("span", "puzzle-level");
      label.append(el("strong", "", String(l.id)), el("span", "puzzle-level-size", `${l.size} × ${l.size}${OPS_SHOWN[l.id] ? ` ${OPS_SHOWN[l.id]}` : ""}`));
      return { value: l.id, label, aria: `${dt("level", { level: l.id })}, ${l.size} × ${l.size} ${OPS_SHOWN[l.id]}` };
    }),
    chosen: s.level,
    key: "level",
    onPick: (level) => {
      s.level = level;
      draw();
    },
  });
}

function rulesPanel(g: Game): HTMLElement {
  const box = el("div", "puzzle-rules");
  box.append(el("p", "", dt("rulesLatin", { n: g.puzzle.size })));
  if (g.puzzle.cages.length) box.append(el("p", "", dt("rulesCages")));
  box.append(el("p", "hint left", dt("rulesNoGuess")));
  return box;
}

// -------------------------------------------------------------------- grid

/** Squares breaking a rule now: a number twice in a row or column, or a full cage that misses its target. */
function conflicts(g: Game): Set<number> {
  const { size: n, cages } = g.puzzle;
  const bad = new Set<number>();
  g.entries.forEach((v, cell) => {
    if (!v) return;
    for (let i = 0; i < n; i++) {
      const sameRow = rowOf(cell, n) * n + i;
      const sameCol = i * n + colOf(cell, n);
      if (sameRow !== cell && g.entries[sameRow] === v) bad.add(cell);
      if (sameCol !== cell && g.entries[sameCol] === v) bad.add(cell);
    }
  });
  for (const cage of cages) {
    const values = cage.cells.map((c) => g.entries[c]!);
    if (values.every(Boolean) && !cageHolds(cage, values)) cage.cells.forEach((c) => bad.add(c));
  }
  return bad;
}

const focusCell = (g: Game): void =>
  void requestAnimationFrame(() => document.querySelector<HTMLElement>(`[data-focus="cell-${g.selected}"]`)?.focus());

function gridPanel(g: Game, draw: () => void): HTMLElement {
  const { puzzle } = g;
  const n = puzzle.size;
  const box = el("div", "puzzle-play");
  const grid = el("div", `puzzle-grid size-${n}`);
  grid.setAttribute("role", "grid");
  grid.setAttribute("aria-label", dt("gridAria", { n }));
  grid.style.setProperty("--n", String(n));
  const bad = conflicts(g);
  const sel = g.selected;

  // The cage's corner label goes in its first square, in reading order; a one-square cage shows its number instead.
  const labelled = new Map<number, Cage>(puzzle.cages.filter((c) => c.op !== "=").map((c) => [Math.min(...c.cells), c]));
  const sameCage = (a: number, b: number): boolean => puzzle.cageOf[a] !== -1 && puzzle.cageOf[a] === puzzle.cageOf[b];

  for (let r = 0; r < n; r++) {
    const row = el("div", "puzzle-row");
    row.setAttribute("role", "row");
    for (let c = 0; c < n; c++) {
      const cell = r * n + c;
      // Given numbers: level 1's clues, and one-square cages (written in, like a clue).
      const given = puzzle.givens.includes(cell);
      const v = g.entries[cell]!;
      const classes = ["puzzle-cell"];
      if (given) classes.push("is-given");
      if (cell === sel) classes.push("is-selected");
      else if (rowOf(cell, n) === rowOf(sel, n) || colOf(cell, n) === colOf(sel, n)) classes.push("is-peer");
      if (bad.has(cell)) classes.push("is-conflict");
      if (g.wrong?.has(cell)) classes.push("is-wrong");
      if (g.hint?.cell === cell) classes.push("is-hinted");
      // Cage walls: thick where the neighbour is in another cage (the grid's edge has its own border).
      const walls: string[] = [];
      if (puzzle.cages.length) {
        if (r > 0 && !sameCage(cell, cell - n)) walls.push("inset 0 2px 0 var(--ink)");
        if (c < n - 1 && !sameCage(cell, cell + 1)) walls.push("inset -2px 0 0 var(--ink)");
        if (r < n - 1 && !sameCage(cell, cell + n)) walls.push("inset 0 -2px 0 var(--ink)");
        if (c > 0 && !sameCage(cell, cell - 1)) walls.push("inset 2px 0 0 var(--ink)");
      }
      const b = control(classes.join(" "), "", `cell-${cell}`, () => {
        g.selected = cell;
        draw();
        focusCell(g);
      });
      b.setAttribute("role", "gridcell");
      if (walls.length) b.style.boxShadow = walls.join(", ");
      b.tabIndex = cell === sel ? 0 : -1;
      const cage = labelled.get(cell);
      if (cage) b.append(el("span", "cage-label", cageLabel(cage)));
      if (v) b.append(el("span", "cell-value", String(v)));
      else if (g.notes[cell]) {
        const notes = el("span", "cell-notes");
        for (let x = 1; x <= n; x++) notes.append(el("span", "", g.notes[cell]! & (1 << x) ? String(x) : ""));
        b.append(notes);
      }
      const parts = [dt("cellAria", { row: r + 1, col: c + 1 })];
      const k = puzzle.cageOf[cell]!;
      if (k >= 0) parts.push(dt("cellCage", { label: cageLabel(puzzle.cages[k]!) }));
      parts.push(v ? `${v}${given ? ` (${dt("cellGiven")})` : ""}` : g.notes[cell] ? dt("cellNotes", { notes: list(notesOf(g, cell)) }) : dt("cellEmpty"));
      b.setAttribute("aria-label", parts.join(", "));
      row.append(b);
    }
    grid.append(row);
  }
  grid.addEventListener("keydown", (event) => onKey(event, g, draw));
  box.append(grid);

  // The number pad, and the tools.
  const pad = el("div", "puzzle-pad");
  for (let x = 1; x <= n; x++) pad.append(control("ghost puzzle-key", String(x), `key-${x}`, () => write(g, x, draw)));
  pad.append(control("ghost puzzle-key is-erase", dt("erase"), "key-erase", () => write(g, 0, draw)));
  box.append(pad);

  const tools = el("div", "puzzle-tools");
  const notes = control(`ghost small${g.notesMode ? " on" : ""}`, g.notesMode ? dt("notesOn") : dt("notes"), "notes", () => {
    g.notesMode = !g.notesMode;
    draw();
  });
  notes.setAttribute("aria-pressed", String(g.notesMode));
  const solved = g.solvedAt !== null;
  const hintButton = control("ghost small", g.hint && g.hint.stage === 1 && !solved ? dt("explain") : dt("hint"), "hint", () => giveHint(g, draw));
  const checkButton = control("ghost small", dt("gridCheck"), "check", () => {
    g.wrong = new Set(g.entries.map((v, i) => (v && v !== puzzle.solution[i] ? i : -1)).filter((i) => i >= 0));
    draw();
  });
  hintButton.disabled = solved;
  checkButton.disabled = solved;
  tools.append(notes, hintButton, checkButton);
  box.append(tools);

  const message = el("p", "puzzle-message");
  message.setAttribute("role", "status");
  if (g.hint && !solved) message.append(hintText(g));
  else if (g.wrong) {
    message.textContent = g.wrong.size === 0 ? dt("gridAllRight") : g.wrong.size === 1 ? dt("gridWrongOne") : dt("gridWrong", { count: g.wrong.size });
    message.classList.add(g.wrong.size === 0 ? "good" : "bad");
  } else if (g.notesMode) message.textContent = dt("notesHint");
  box.append(message, el("p", "hint", dt("keysHint")));
  return box;
}

const notesOf = (g: Game, cell: number): number[] => [...Array(g.puzzle.size).keys()].map((i) => i + 1).filter((x) => g.notes[cell]! & (1 << x));

/** Writes a number (0 erases) in the selected square, or toggles a note. */
function write(g: Game, x: number, draw: () => void): void {
  const cell = g.selected;
  const { puzzle } = g;
  if (g.solvedAt !== null) return;
  // Given numbers (level 1) and one-square cages stay as they are.
  if (puzzle.givens.includes(cell)) return;
  if (g.notesMode && x !== 0) {
    if (!g.entries[cell]) g.notes[cell] = g.notes[cell]! ^ (1 << x);
  } else {
    g.entries[cell] = x;
    if (x === 0) g.notes[cell] = 0;
    g.startedAt ??= Date.now();
  }
  g.wrong?.delete(cell);
  if (g.hint && g.hint.cell === cell) g.hint = null;
  if (g.entries.every((v, i) => v === puzzle.solution[i])) {
    g.solvedAt = Date.now();
    g.hint = null;
  }
  draw();
  focusCell(g);
}

function onKey(event: KeyboardEvent, g: Game, draw: () => void): void {
  if (event.altKey || event.ctrlKey || event.metaKey) return;
  const n = g.puzzle.size;
  const r = rowOf(g.selected, n);
  const c = colOf(g.selected, n);
  const move = (rr: number, cc: number): void => {
    g.selected = Math.min(n - 1, Math.max(0, rr)) * n + Math.min(n - 1, Math.max(0, cc));
    draw();
    focusCell(g);
  };
  const digit = Number(event.key);
  if (event.key === "ArrowUp") move(r - 1, c);
  else if (event.key === "ArrowDown") move(r + 1, c);
  else if (event.key === "ArrowLeft") move(r, c - 1);
  else if (event.key === "ArrowRight") move(r, c + 1);
  else if (Number.isInteger(digit) && digit >= 1 && digit <= n) write(g, digit, draw);
  else if (event.key === "Backspace" || event.key === "Delete" || event.key === "0") write(g, 0, draw);
  else if (event.key === "n" || event.key === "N") {
    g.notesMode = !g.notesMode;
    draw();
    focusCell(g);
  } else return;
  event.preventDefault();
}

// ------------------------------------------------------------------- hints

/**
 * First press: the square to look at, and the kind of reasoning. Second press
 * on the same hint: the reasoning in full, with the number. A wrong number is
 * pointed out before anything else.
 */
function giveHint(g: Game, draw: () => void): void {
  const { puzzle } = g;
  if (g.hint && g.hint.stage === 1) {
    g.hint.stage = 2;
    draw();
    return;
  }
  const wrong = g.entries.findIndex((v, i) => v !== 0 && v !== puzzle.solution[i]);
  if (wrong >= 0) {
    g.hint = { step: null, cell: wrong, wrong: true, stage: 1 };
  } else {
    const step = nextStep(puzzle, g.entries);
    if (!step) return;
    g.hint = { step, cell: step.cell, wrong: false, stage: 1 };
  }
  g.hints++;
  g.selected = g.hint.cell;
  draw();
}

function hintText(g: Game): string {
  const hint = g.hint!;
  if (hint.wrong) return hint.stage === 1 ? dt("hintWrong1") : dt("hintWrong2");
  const { value, reason } = hint.step!;
  const values = (xs: number[]): string => (xs.length ? list(xs) : dt("nothing"));
  switch (reason.kind) {
    case "given":
    case "single":
      return hint.stage === 1
        ? dt("hintSingle1")
        : dt("hintSingle2", { row: values(reason.kind === "single" ? reason.inRow : []), col: values(reason.kind === "single" ? reason.inCol : []), value });
    case "hidden":
      return hint.stage === 1
        ? dt(reason.unit === "row" ? "hintHiddenRow1" : "hintHiddenCol1")
        : dt(reason.unit === "row" ? "hintHiddenRow2" : "hintHiddenCol2", { value });
    case "cage": {
      const cage = g.puzzle.cages[reason.cage]!;
      if (hint.stage === 1) return dt("hintCage1", { label: cageLabel(cage) });
      const shown = reason.combos.map((combo) => formatCombo(cage, combo));
      return dt("hintCage2", { size: cage.cells.length, label: cageLabel(cage), combos: alternatives(shown), row: values(reason.inRow), col: values(reason.inCol), value });
    }
    case "combined":
      return hint.stage === 1 ? dt("hintCombined1") : dt(reason.pairs ? "hintPairs2" : "hintCombined2", { value });
  }
}

/** "3 + 4", "6 ÷ 2", "4 − 1": the larger first for − and ÷. */
function formatCombo(cage: Cage, combo: number[]): string {
  const ordered = cage.op === "−" || cage.op === "÷" ? [...combo].sort((a, b) => b - a) : combo;
  return ordered.join(` ${cage.op} `);
}

// ------------------------------------------------------------------ solved

function solvedPanel(g: Game): HTMLElement {
  const box = step("🎉");
  box.classList.add("puzzle-solved");
  const seconds = Math.max(1, Math.round(((g.solvedAt ?? 0) - (g.startedAt ?? g.solvedAt ?? 0)) / 1000));
  const time = seconds >= 60 ? dt("minutes", { m: Math.floor(seconds / 60), s: seconds % 60 }) : dt("seconds", { s: seconds });
  const hints = g.hints === 0 ? dt("solvedNoHint") : g.hints === 1 ? dt("solvedOneHint") : dt("solvedHints", { count: g.hints });
  const text = el("p", "puzzle-solved-text", dt("solved", { time, hints }));
  text.setAttribute("role", "status");
  box.append(text);
  return box;
}
