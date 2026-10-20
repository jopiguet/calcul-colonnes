/**
 * The Probability Lab: two dice, in five steps.
 *
 *   1. Predict   which sum comes up most often; how many 7s in 100 rolls
 *   2. Roll      1, 10, 100 or 1,000 at a time; counts, series of 10, the share of 7s
 *   3. Compare   the 36 ways to land, the theory, the predictions against the results
 *   4. Explain   chance varies, large numbers settle, dice have no memory
 *   5. Check     one question on the gambler's fallacy
 *
 * The engine is shared/discover/dice.ts. An experiment is its seed, shown as
 * "Experiment no. 4821": the same number replays the same rolls.
 *
 * The lab lives here, outside the app's render, so a language change keeps
 * it; it redraws only its own container, so rolling does not rebuild the page
 * nor lose the keyboard focus. Nothing is saved: an experiment lasts as long
 * as the page.
 */
import katex from "katex";
import "katex/dist/katex.min.css";
import {
  FACES,
  MAX_SEED,
  OUTCOMES,
  SUMS,
  TARGET,
  expected,
  freshSeed,
  newExperiment,
  rollBatch,
  ways,
  type Experiment,
  type Roll,
} from "../../shared/discover/dice";
import { button, el } from "../dom";
import type { User } from "../store";
import { count, dt, percent } from "./i18n";

type Prediction = number | "same";
type CheckAnswer = "less" | "same" | "more";

interface Lab {
  userId: number;
  experiment: Experiment;
  step: "predict" | "lab";
  most: Prediction | null;
  sevens: number;
  revealed: boolean;
  check: CheckAnswer | null;
}

/** Rolls before the comparison is offered: fewer say too little. */
export const REVEAL_AFTER = 100;
const BATCHES = [1, 10, 100, 1000];

let lab: Lab | null = null;

function startLab(userId: number, seed = freshSeed()): Lab {
  return { userId, experiment: newExperiment(seed), step: "predict", most: null, sevens: 50, revealed: false, check: null };
}

/** An experiment under way that a reload would lose (the update watcher asks). */
export function discoverBusy(): boolean {
  return lab !== null && lab.experiment.rolls > 0 && lab.check === null;
}

export interface DiceContext {
  user: User;
}

const reducedMotion = (): boolean => window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;

export function diceView(ctx: DiceContext): HTMLElement {
  if (!lab || lab.userId !== ctx.user.id) lab = startLab(ctx.user.id);
  const wrap = el("section", "sheet discover-lab");
  const draw = (): void => {
    // Keep the focus on the same control across a redraw.
    const focused = (document.activeElement as HTMLElement | null)?.dataset?.focus;
    wrap.replaceChildren(...content(lab!, draw));
    if (focused) wrap.querySelector<HTMLElement>(`[data-focus="${focused}"]`)?.focus();
  };
  draw();
  return wrap;
}

function content(state: Lab, draw: () => void): HTMLElement[] {
  const head = el("div", "discover-head");
  head.append(el("h1", "title", dt("diceTitle")), el("p", "discover-seed", dt("experiment", { seed: state.experiment.seed })));
  return state.step === "predict" ? [head, predictPanel(state, draw)] : [head, ...labPanels(state, draw)];
}

/** A button that keeps the focus across redraws. */
function control(cls: string, label: string, key: string, onClick: () => void): HTMLButtonElement {
  const b = button(cls, label, onClick);
  b.dataset.focus = key;
  return b;
}

// ---------------------------------------------------------------- 1. predict

function predictPanel(state: Lab, draw: () => void): HTMLElement {
  const panel = el("div", "discover-step");
  panel.append(el("h2", "discover-step-title", dt("stepPredict")), el("p", "discover-intro", dt("predictIntro")));

  const most = el("fieldset", "discover-sums");
  most.append(el("legend", "field-label", dt("predictMost")));
  const options: Prediction[] = [...SUMS, "same"];
  for (const option of options) {
    const on = state.most === option;
    const b = control(`segment${on ? " on" : ""}${option === "same" ? " is-same" : ""}`, option === "same" ? dt("allSame") : String(option), `most-${option}`, () => {
      state.most = option;
      draw();
    });
    b.setAttribute("aria-pressed", String(on));
    most.append(b);
  }
  panel.append(most);

  const sevens = el("label", "field discover-slider");
  sevens.append(el("span", "field-label", dt("predictSevens")));
  const row = el("span", "discover-slider-row");
  const input = el("input", "discover-range");
  input.type = "range";
  input.min = "0";
  input.max = "100";
  input.step = "1";
  input.value = String(state.sevens);
  input.dataset.focus = "sevens";
  const output = el("output", "discover-range-value", dt("sevensValue", { count: state.sevens }));
  input.addEventListener("input", () => {
    state.sevens = Number(input.value);
    output.textContent = dt("sevensValue", { count: state.sevens });
  });
  row.append(input, output);
  sevens.append(row);
  panel.append(sevens);

  const go = control("primary", dt("predictDone"), "predict-done", () => {
    if (state.most === null) return;
    state.step = "lab";
    draw();
  });
  go.disabled = state.most === null;
  panel.append(go);
  if (state.most === null) panel.append(el("p", "hint", dt("predictNeeded")));
  return panel;
}

// -------------------------------------------------------------- 2. roll

/** One die: its face drawn with dots, in a 3 × 3 grid. */
const DOTS: Record<number, number[]> = { 1: [4], 2: [0, 8], 3: [0, 4, 8], 4: [0, 2, 6, 8], 5: [0, 2, 4, 6, 8], 6: [0, 2, 3, 5, 6, 8] };

function die(face: number): HTMLElement {
  const d = el("span", "die");
  d.dataset.face = String(face);
  for (let i = 0; i < 9; i++) d.append(el("span", DOTS[face]!.includes(i) ? "pip on" : "pip"));
  return d;
}

function diceShown(roll: Roll | null): HTMLElement {
  const box = el("div", "discover-dice");
  box.setAttribute("role", "img");
  if (!roll) {
    box.append(die(1), die(1));
    box.classList.add("is-idle");
    box.setAttribute("aria-label", dt("noRollYet"));
    return box;
  }
  box.append(die(roll.a), die(roll.b), el("span", "discover-sum", dt("sumIs", { sum: roll.a + roll.b })));
  box.setAttribute("aria-label", dt("diceLabel", { a: roll.a, b: roll.b, sum: roll.a + roll.b }));
  return box;
}

/** The animation running; a newer roll stops it. */
let animation = 0;

/**
 * Rolls a batch. One roll tumbles for a moment; ten are shown one after the
 * other; more are counted at once. With reduced motion, always at once.
 *
 * The rolls are counted at the click; the animation only shows them. A click
 * while the dice move stops that animation and rolls at once, so a quick
 * child loses no roll, and the buttons stay enabled, so the keyboard focus
 * stays where it is.
 */
async function rollAndShow(state: Lab, size: number, draw: () => void): Promise<void> {
  const mine = ++animation;
  const shown = rollBatch(state.experiment, size);
  if (shown.length > 0 && !reducedMotion()) {
    const pause = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
    // Faces while the die tumbles: decoration only, not part of the experiment.
    const tumble = (): Roll => ({ a: 1 + Math.floor(Math.random() * FACES), b: 1 + Math.floor(Math.random() * FACES) });
    const frames = size === 1 ? [tumble(), tumble(), tumble(), tumble(), ...shown] : shown;
    let box = document.querySelector<HTMLElement>(".discover-dice");
    for (const [i, frame] of frames.entries()) {
      if (mine !== animation) return; // a newer roll took over, and will draw
      const next = diceShown(frame);
      if (i < frames.length - 1) next.classList.add("is-rolling");
      box?.replaceWith(next);
      box = next;
      await pause(size === 1 ? 70 : 120);
    }
  }
  if (mine === animation) draw();
}

function labPanels(state: Lab, draw: () => void): HTMLElement[] {
  const e = state.experiment;
  const panels: HTMLElement[] = [];

  // Reminder of the predictions.
  const mine = el("p", "discover-mine");
  mine.textContent = `${dt("youTitle")} : ${state.most === "same" ? dt("allSame") : state.most} · ${dt("sevensValue", { count: state.sevens })}`;
  panels.push(mine);

  // The experiment.
  const experiment = el("div", "discover-step");
  experiment.append(el("h2", "discover-step-title", dt("stepExperiment")));
  const bench = el("div", "discover-bench");
  bench.append(diceShown(e.last));
  const buttons = el("div", "discover-roll");
  for (const size of BATCHES) {
    buttons.append(
      control(size === 1 ? "primary" : "ghost", size === 1 ? dt("rollOnce") : dt("rollTimes", { count: count(size) }), `roll-${size}`, () =>
        void rollAndShow(state, size, draw),
      ),
    );
  }
  bench.append(buttons);
  experiment.append(bench);

  const sevens = e.bySum[TARGET]!;
  const status = el("p", "discover-status");
  status.setAttribute("role", "status");
  status.append(el("strong", "", e.rolls === 1 ? dt("rollsOne") : dt("rollsCount", { rolls: count(e.rolls) })));
  if (e.rolls > 0) status.append(" · ", dt("sevensSoFar", { count: count(sevens), pct: percent(sevens / e.rolls) }));
  experiment.append(status);
  panels.push(experiment);

  if (e.rolls > 0) {
    panels.push(histogram(state), seriesPanel(state), pathPanel(state));
  }

  if (!state.revealed) {
    const reveal = el("div", "discover-reveal");
    const b = control("primary", dt("revealReady"), "reveal", () => {
      state.revealed = true;
      draw();
      const target = document.querySelector(".discover-compare");
      target?.scrollIntoView({ behavior: reducedMotion() ? "auto" : "smooth", block: "start" });
    });
    b.disabled = e.rolls < REVEAL_AFTER;
    reveal.append(b);
    if (e.rolls < REVEAL_AFTER) reveal.append(el("p", "hint", dt("revealHint")));
    panels.push(reveal);
  } else {
    panels.push(comparePanel(state), explainPanel(), checkPanel(state, draw));
  }
  panels.push(againPanel(state, draw));
  return panels;
}

/** Counts per sum; after the reveal, a mark at the count the theory expects. */
function histogram(state: Lab): HTMLElement {
  const e = state.experiment;
  const panel = el("div", "discover-panel");
  panel.append(el("h3", "discover-panel-title", dt("histogramTitle")));
  const chart = el("div", "stats-columns discover-histogram");
  chart.setAttribute("role", "img");
  chart.setAttribute("aria-label", dt("histogramAria", { list: SUMS.map((s) => `${s}: ${e.bySum[s]}`).join(", ") }));
  const max = Math.max(1, ...SUMS.map((s) => e.bySum[s]!), ...(state.revealed ? SUMS.map((s) => expected(s, e.rolls)) : []));
  for (const sum of SUMS) {
    const n = e.bySum[sum]!;
    const col = el("div", `stats-col${sum === TARGET ? " is-target" : ""}`);
    const expect = Math.round(expected(sum, e.rolls) * 10) / 10;
    col.title = state.revealed ? dt("sumTipTheory", { sum, count: count(n), expected: count(expect) }) : dt("sumTip", { sum, count: count(n) });
    const area = el("div", "stats-col-area");
    // After the reveal the theory's marks take that place; the counts are in the table below.
    if (!state.revealed) area.append(el("span", "stats-col-top", n ? count(n) : ""));
    const stack = el("div", "stats-stack");
    stack.style.height = `${(100 * n) / max}%`;
    const bar = el("div", "stats-seg is-box");
    bar.style.flexGrow = "1";
    stack.append(bar);
    area.append(stack);
    if (state.revealed) {
      const mark = el("span", "discover-expected");
      mark.style.bottom = `${(100 * expected(sum, e.rolls)) / max}%`;
      area.append(mark);
    }
    col.append(area, el("span", "stats-col-label", String(sum)));
    chart.append(col);
  }
  panel.append(chart);
  if (state.revealed) {
    const legend = el("p", "stats-legend");
    const a = el("span", "stats-legend-item");
    a.append(el("span", "stats-swatch is-box"), dt("tableMeasured"));
    const b = el("span", "stats-legend-item");
    b.append(el("span", "discover-swatch-expected"), dt("tableTheory"));
    legend.append(a, b);
    panel.append(legend);
  }
  return panel;
}

/** Sevens in each series of 10: small samples vary. */
function seriesPanel(state: Lab): HTMLElement {
  const panel = el("div", "discover-panel");
  panel.append(el("h3", "discover-panel-title", dt("seriesTitle")), el("p", "stats-hint", dt("seriesHint")));
  const series = state.experiment.series;
  if (series.length === 0) {
    panel.append(el("p", "stats-hint", dt("seriesEmpty")));
    return panel;
  }
  const list = el("ol", "discover-series");
  for (const n of series.slice(-16)) {
    const item = el("li", "discover-series-item");
    item.title = dt("seriesItem", { count: n });
    const bar = el("span", "discover-series-bar");
    for (let i = 0; i < 10; i++) bar.append(el("span", i < n ? "on" : ""));
    item.append(bar, el("span", "discover-series-count", dt("seriesItem", { count: n })));
    list.append(item);
  }
  panel.append(list);
  return panel;
}

/** The share of 7s against the number of rolls, on a logarithmic axis; the 1-in-6 line after the reveal. */
function pathPanel(state: Lab): HTMLElement {
  const e = state.experiment;
  const panel = el("div", "discover-panel");
  panel.append(el("h3", "discover-panel-title", dt("pathTitle")));
  // A narrow drawing, so its labels stay readable when a phone scales it down.
  const W = 420;
  const H = 230;
  const pad = { left: 46, right: 14, top: 12, bottom: 40 };
  const maxX = Math.max(10, 10 ** Math.ceil(Math.log10(Math.max(1, e.rolls))));
  const Y_MAX = 0.5;
  const x = (rolls: number): number => pad.left + ((W - pad.left - pad.right) * Math.log10(rolls)) / Math.log10(maxX);
  const y = (share: number): number => pad.top + (H - pad.top - pad.bottom) * (1 - Math.min(share, Y_MAX) / Y_MAX);
  const ns = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(ns, "svg");
  svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
  svg.setAttribute("class", "discover-path");
  svg.setAttribute("role", "img");
  const share = e.rolls ? e.bySum[TARGET]! / e.rolls : 0;
  svg.setAttribute("aria-label", dt("pathAria", { rolls: count(e.rolls), pct: percent(share) }));
  const add = (tag: string, attrs: Record<string, string | number>, text?: string): SVGElement => {
    const node = document.createElementNS(ns, tag);
    for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, String(v));
    if (text !== undefined) node.textContent = text;
    svg.append(node);
    return node;
  };
  // Grid: 0 to 50 % every 10 %; powers of ten across.
  for (let s = 0; s <= Y_MAX + 1e-9; s += 0.1) {
    add("line", { x1: pad.left, x2: W - pad.right, y1: y(s), y2: y(s), class: "grid-line" });
    add("text", { x: pad.left - 6, y: y(s) + 4, class: "axis-label", "text-anchor": "end" }, percent(s, 0));
  }
  for (let p = 1; p <= maxX; p *= 10) {
    add("line", { x1: x(p), x2: x(p), y1: pad.top, y2: H - pad.bottom, class: "grid-line" });
    // The last label ends at the edge rather than running past it.
    add("text", { x: x(p), y: H - pad.bottom + 18, class: "axis-label", "text-anchor": p === maxX ? "end" : "middle" }, count(p));
  }
  add("text", { x: (pad.left + W - pad.right) / 2, y: H - 4, class: "axis-title", "text-anchor": "middle" }, dt("pathAxis"));
  if (state.revealed) {
    add("line", { x1: pad.left, x2: W - pad.right, y1: y(1 / 6), y2: y(1 / 6), class: "theory-line" });
    add("text", { x: W - pad.right - 4, y: y(1 / 6) - 6, class: "theory-label", "text-anchor": "end" }, dt("pathTheory"));
  }
  if (e.path.length > 0) {
    const points = e.path.map(([rolls, sevens]) => `${x(rolls).toFixed(1)},${y(sevens / rolls).toFixed(1)}`).join(" ");
    add("polyline", { points, class: "share-line" });
    const [lastRolls, lastSevens] = e.path.at(-1)!;
    add("circle", { cx: x(lastRolls), cy: y(lastSevens / lastRolls), r: 4, class: "share-dot" });
  }
  panel.append(svg);
  if (state.revealed) panel.append(el("p", "stats-hint", dt("keepRolling")));
  return panel;
}

// -------------------------------------------------------------- 3. compare

function comparePanel(state: Lab): HTMLElement {
  const e = state.experiment;
  const panel = el("div", "discover-step discover-compare");
  panel.append(el("h2", "discover-step-title", dt("stepCompare")));

  // The 36 ways to land.
  panel.append(el("h3", "discover-panel-title", dt("gridTitle")), el("p", "discover-intro", dt("gridIntro")));
  const table = el("table", "dice-grid");
  const head = el("tr");
  const corner = el("th", "dice-grid-corner");
  corner.append(el("span", "dice-grid-die1", dt("die1")), el("span", "dice-grid-die2", dt("die2")));
  head.append(corner);
  for (let a = 1; a <= FACES; a++) {
    const th = el("th");
    th.scope = "col";
    th.append(die(a));
    th.setAttribute("aria-label", `${dt("die1")} ${a}`);
    head.append(th);
  }
  const thead = el("thead");
  thead.append(head);
  const body = el("tbody");
  for (let b = 1; b <= FACES; b++) {
    const row = el("tr");
    const th = el("th");
    th.scope = "row";
    th.append(die(b));
    th.setAttribute("aria-label", `${dt("die2")} ${b}`);
    row.append(th);
    for (let a = 1; a <= FACES; a++) {
      const sum = a + b;
      const predicted = typeof state.most === "number" && state.most !== TARGET && sum === state.most;
      const cell = el("td", `dice-grid-cell${sum === TARGET ? " is-target" : ""}${predicted ? " is-predicted" : ""}`, String(sum));
      cell.title = `${a} + ${b} = ${sum}`;
      row.append(cell);
    }
    body.append(row);
  }
  table.append(thead, body);
  panel.append(table, el("p", "discover-intro", dt("gridSeven")), el("p", "discover-intro", dt("gridEdges")));

  // The theory, and the measured shares.
  panel.append(el("h3", "discover-panel-title", dt("theoryTitle")));
  const formula = el("p", "discover-formula");
  katex.render(`P(7) = \\frac{6}{${OUTCOMES}} = \\frac{1}{6}`, formula, { throwOnError: false, displayMode: true });
  panel.append(formula, el("p", "discover-intro", dt("theoryLine", { pct: percent(1 / 6) })));
  const shares = el("table", "discover-table");
  const hr = el("tr");
  for (const key of ["tableSum", "tableWays", "tableTheory", "tableMeasured"] as const) {
    const th = el("th", "", dt(key));
    th.scope = "col";
    hr.append(th);
  }
  const sh = el("thead");
  sh.append(hr);
  const sb = el("tbody");
  for (const sum of SUMS) {
    const tr = el("tr", sum === TARGET ? "is-target" : "");
    tr.append(
      el("th", "", String(sum)),
      el("td", "", `${ways(sum)} / ${OUTCOMES}`),
      el("td", "", percent(ways(sum) / OUTCOMES)),
      el("td", "", percent(e.bySum[sum]! / Math.max(1, e.rolls))),
    );
    sb.append(tr);
  }
  shares.append(sh, sb);
  panel.append(shares);

  // The predictions against the results.
  panel.append(el("h3", "discover-panel-title", dt("youTitle")));
  const most =
    state.most === TARGET
      ? dt("youMostRight")
      : state.most === "same"
        ? dt("youMostSame")
        : dt("youMostOther", { sum: state.most ?? "", ways: ways(Number(state.most)) });
  const measured = Math.round((100 * e.bySum[TARGET]!) / Math.max(1, e.rolls));
  panel.append(
    el("p", `discover-verdict ${state.most === TARGET ? "good" : "bad"}`, most),
    el("p", "discover-verdict", dt("youSevens", { guess: state.sevens, measured })),
  );
  return panel;
}

// -------------------------------------------------------------- 4. explain, 5. check

function explainPanel(): HTMLElement {
  const panel = el("div", "discover-step");
  panel.append(el("h2", "discover-step-title", dt("stepExplain")));
  const list = el("ul", "discover-explain");
  for (const key of ["explainVary", "explainLarge", "explainMemory"] as const) list.append(el("li", "", dt(key)));
  panel.append(list);
  return panel;
}

function checkPanel(state: Lab, draw: () => void): HTMLElement {
  const panel = el("div", "discover-step discover-check");
  panel.append(el("h2", "discover-step-title", dt("stepCheck")), el("p", "discover-question", dt("checkQuestion")));
  const choices = el("div", "choices");
  const options: [CheckAnswer, "checkLess" | "checkSame" | "checkMore"][] = [["less", "checkLess"], ["same", "checkSame"], ["more", "checkMore"]];
  options.forEach(([value, key], i) => {
    const b = control("choice", "", `check-${value}`, () => {
      if (state.check) return;
      state.check = value;
      draw();
    });
    b.append(el("span", "letter", "ABC"[i]!), el("span", "choice-text", dt(key)));
    if (state.check) {
      b.disabled = true;
      if (value === "same") b.classList.add("is-right");
      else if (value === state.check) b.classList.add("is-wrong");
    }
    choices.append(b);
  });
  panel.append(choices);
  if (state.check) {
    const feedback = el("p", `vocab-feedback ${state.check === "same" ? "good" : "bad"}`, state.check === "same" ? dt("checkRight") : dt("checkWrong"));
    feedback.setAttribute("role", "status");
    panel.append(feedback);
  }
  return panel;
}

/** A new experiment, or the same one again by its number. */
function againPanel(state: Lab, draw: () => void): HTMLElement {
  const panel = el("div", "discover-again");
  panel.append(
    control(state.check ? "primary" : "ghost", dt("again"), "again", () => {
      lab = startLab(state.userId);
      draw();
    }),
  );
  const form = el("form", "discover-replay");
  const label = el("label", "discover-replay-label");
  label.append(el("span", "", dt("replay")));
  const input = el("input", "discover-replay-input");
  input.type = "number";
  input.min = "1";
  input.max = String(MAX_SEED);
  input.inputMode = "numeric";
  input.required = true;
  label.append(input);
  const go = el("button", "ghost small", dt("replayGo"));
  go.type = "submit";
  form.append(label, go);
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const seed = Number(input.value);
    if (!Number.isInteger(seed) || seed < 1 || seed > MAX_SEED) return;
    lab = startLab(state.userId, seed);
    draw();
  });
  panel.append(form, el("p", "hint", dt("replayHint")));
  return panel;
}
