/**
 * What every Discover lab shares, taken from the dice lab when the coins lab
 * came: the second activity showed what is common.
 *
 *   mountLab        a container that redraws itself, keeping the keyboard focus
 *   labHead         title and experiment number
 *   choiceSet       a prediction among options
 *   batchButtons    × 1, × 10, × 100, × 1,000
 *   createAnimator  a short animation that a newer click interrupts
 *   countsChart     counts per category, with the theory's marks after the reveal
 *   shareChart      a running share on a logarithmic axis, with the theory's line
 *   revealBlock     "compare with the theory", from a number of trials
 *   explainPanel    a few sentences
 *   checkPanel      one question on the misconception
 *   againPanel      a new experiment, or the same again by its number
 *
 * Each lab keeps its own state and its five steps (docs/discover.md); this
 * file has no state of its own.
 */
import { MAX_SEED } from "../../shared/discover/experiment";
import { button, el } from "../dom";
import { count, dt, percent } from "./i18n";

export const reducedMotion = (): boolean => window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;

/** A button that keeps the focus across redraws (`data-focus` names it). */
export function control(cls: string, label: string, key: string, onClick: () => void): HTMLButtonElement {
  const b = button(cls, label, onClick);
  b.dataset.focus = key;
  return b;
}

/**
 * The lab's container. `build` returns its content; `draw` (passed to it)
 * rebuilds that content alone, not the page, and puts the focus back on the
 * same control.
 */
export function mountLab(cls: string, build: (draw: () => void) => HTMLElement[]): HTMLElement {
  const wrap = el("section", `sheet discover-lab ${cls}`);
  const draw = (): void => {
    const focused = (document.activeElement as HTMLElement | null)?.dataset?.focus;
    wrap.replaceChildren(...build(draw));
    if (focused) wrap.querySelector<HTMLElement>(`[data-focus="${focused}"]`)?.focus();
  };
  draw();
  return wrap;
}

export function labHead(title: string, seed: number): HTMLElement {
  const head = el("div", "discover-head");
  head.append(el("h1", "title", title), el("p", "discover-seed", dt("experiment", { seed })));
  return head;
}

/** A step of the sequence: "1. Predict", "2. Roll"… */
export function step(title: string, cls = ""): HTMLElement {
  const box = el("div", `discover-step${cls ? ` ${cls}` : ""}`);
  box.append(el("h2", "discover-step-title", title));
  return box;
}

/** A part of a step, with a small title and an optional hint. */
export function panel(title: string, hint?: string): HTMLElement {
  const box = el("div", "discover-panel");
  box.append(el("h3", "discover-panel-title", title));
  if (hint) box.append(el("p", "stats-hint", hint));
  return box;
}

/** A prediction among options, as toggle buttons. */
export function choiceSet<T extends string | number>(opts: {
  cls: string;
  legend: string;
  options: { value: T; label: string | HTMLElement; cls?: string; aria?: string }[];
  chosen: T | null;
  key: string;
  onPick: (value: T) => void;
}): HTMLElement {
  const set = el("fieldset", opts.cls);
  set.append(el("legend", "field-label", opts.legend));
  for (const option of opts.options) {
    const on = opts.chosen === option.value;
    const b = control(`segment${on ? " on" : ""}${option.cls ? ` ${option.cls}` : ""}`, "", `${opts.key}-${option.value}`, () =>
      opts.onPick(option.value),
    );
    b.append(option.label);
    b.setAttribute("aria-pressed", String(on));
    if (option.aria) b.setAttribute("aria-label", option.aria);
    set.append(b);
  }
  return set;
}

export const BATCHES = [1, 10, 100, 1000];

/** × 1, × 10, × 100, × 1,000: the first is the main action. */
export function batchButtons(label: (size: number) => string, onClick: (size: number) => void): HTMLElement {
  const buttons = el("div", "discover-roll");
  for (const size of BATCHES) buttons.append(control(size === 1 ? "primary" : "ghost", label(size), `roll-${size}`, () => onClick(size)));
  return buttons;
}

/**
 * A short animation: frames shown one after the other. The trials are counted
 * before it starts; the animation only shows them. A newer `run` stops the
 * older one, which then returns false and must not draw: a quick child loses
 * no trial, and the buttons stay enabled, so the focus stays put.
 */
export function createAnimator(): { run<F>(frames: F[], show: (frame: F, last: boolean) => void, ms: number): Promise<boolean> } {
  let current = 0;
  return {
    async run(frames, show, ms) {
      const mine = ++current;
      if (frames.length === 0 || reducedMotion()) return mine === current;
      for (const [i, frame] of frames.entries()) {
        if (mine !== current) return false;
        show(frame, i === frames.length - 1);
        await new Promise((resolve) => setTimeout(resolve, ms));
      }
      return mine === current;
    },
  };
}

/** Counts per category as columns; after the reveal, a mark at what the theory expects. */
export function countsChart(opts: {
  cls: string;
  labels: string[];
  counts: number[];
  expected: number[] | null;
  highlight?: number;
  aria: string;
  tip: (i: number) => string;
}): HTMLElement {
  const chart = el("div", `stats-columns ${opts.cls}`);
  chart.setAttribute("role", "img");
  chart.setAttribute("aria-label", opts.aria);
  const max = Math.max(1, ...opts.counts, ...(opts.expected ?? []));
  opts.labels.forEach((label, i) => {
    const n = opts.counts[i]!;
    const col = el("div", `stats-col${i === opts.highlight ? " is-target" : ""}`);
    col.title = opts.tip(i);
    const area = el("div", "stats-col-area");
    // After the reveal the theory's marks take that place; the counts are in a table or a tooltip.
    if (!opts.expected) area.append(el("span", "stats-col-top", n ? count(n) : ""));
    const stack = el("div", "stats-stack");
    stack.style.height = `${(100 * n) / max}%`;
    const bar = el("div", "stats-seg is-box");
    bar.style.flexGrow = "1";
    stack.append(bar);
    area.append(stack);
    if (opts.expected) {
      const mark = el("span", "discover-expected");
      mark.style.bottom = `${(100 * opts.expected[i]!) / max}%`;
      area.append(mark);
    }
    col.append(area, el("span", "stats-col-label", label));
    chart.append(col);
  });
  return chart;
}

/** Legend under a counts chart after the reveal: measured bars, theory marks. */
export function measuredLegend(): HTMLElement {
  const legend = el("p", "stats-legend");
  const a = el("span", "stats-legend-item");
  a.append(el("span", "stats-swatch is-box"), dt("tableMeasured"));
  const b = el("span", "stats-legend-item");
  b.append(el("span", "discover-swatch-expected"), dt("tableTheory"));
  legend.append(a, b);
  return legend;
}

/**
 * A running share against the number of trials, on a logarithmic axis from 1
 * to the next power of ten; the theory's line once revealed. Values above
 * `yMax` are drawn at the top edge.
 */
export function shareChart(opts: {
  path: [number, number][];
  trials: number;
  yMax: number;
  yStep: number;
  theory: number;
  theoryLabel: string;
  revealed: boolean;
  aria: string;
  axisTitle: string;
}): SVGSVGElement {
  // A narrow drawing, so its labels stay readable when a phone scales it down.
  const W = 420;
  const H = 230;
  const pad = { left: 46, right: 14, top: 12, bottom: 40 };
  const maxX = Math.max(10, 10 ** Math.ceil(Math.log10(Math.max(1, opts.trials))));
  const x = (n: number): number => pad.left + ((W - pad.left - pad.right) * Math.log10(n)) / Math.log10(maxX);
  const y = (share: number): number => pad.top + (H - pad.top - pad.bottom) * (1 - Math.min(share, opts.yMax) / opts.yMax);
  const ns = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(ns, "svg");
  svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
  svg.setAttribute("class", "discover-path");
  svg.setAttribute("role", "img");
  svg.setAttribute("aria-label", opts.aria);
  const add = (tag: string, attrs: Record<string, string | number>, text?: string): void => {
    const node = document.createElementNS(ns, tag);
    for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, String(v));
    if (text !== undefined) node.textContent = text;
    svg.append(node);
  };
  for (let s = 0; s <= opts.yMax + 1e-9; s += opts.yStep) {
    add("line", { x1: pad.left, x2: W - pad.right, y1: y(s), y2: y(s), class: "grid-line" });
    add("text", { x: pad.left - 6, y: y(s) + 4, class: "axis-label", "text-anchor": "end" }, percent(s, 0));
  }
  for (let p = 1; p <= maxX; p *= 10) {
    add("line", { x1: x(p), x2: x(p), y1: pad.top, y2: H - pad.bottom, class: "grid-line" });
    // The last label ends at the edge rather than running past it.
    add("text", { x: x(p), y: H - pad.bottom + 18, class: "axis-label", "text-anchor": p === maxX ? "end" : "middle" }, count(p));
  }
  add("text", { x: (pad.left + W - pad.right) / 2, y: H - 4, class: "axis-title", "text-anchor": "middle" }, opts.axisTitle);
  if (opts.revealed) {
    add("line", { x1: pad.left, x2: W - pad.right, y1: y(opts.theory), y2: y(opts.theory), class: "theory-line" });
    add("text", { x: W - pad.right - 4, y: y(opts.theory) - 6, class: "theory-label", "text-anchor": "end" }, opts.theoryLabel);
  }
  if (opts.path.length > 0) {
    const points = opts.path.map(([n, k]) => `${x(n).toFixed(1)},${y(k / n).toFixed(1)}`).join(" ");
    add("polyline", { points, class: "share-line" });
    const [n, k] = opts.path.at(-1)!;
    add("circle", { cx: x(n), cy: y(k / n), r: 4, class: "share-dot" });
  }
  return svg;
}

/** "Compare with the theory", enabled from `after` trials. */
export function revealBlock(opts: { ready: boolean; label: string; hint: string; onReveal: () => void }): HTMLElement {
  const box = el("div", "discover-reveal");
  const b = control("primary", opts.label, "reveal", () => {
    opts.onReveal();
    document.querySelector(".discover-compare")?.scrollIntoView({ behavior: reducedMotion() ? "auto" : "smooth", block: "start" });
  });
  b.disabled = !opts.ready;
  box.append(b);
  if (!opts.ready) box.append(el("p", "hint", opts.hint));
  return box;
}

export function explainPanel(title: string, items: string[]): HTMLElement {
  const box = step(title);
  const list = el("ul", "discover-explain");
  for (const item of items) list.append(el("li", "", item));
  box.append(list);
  return box;
}

/** One question on the misconception; once answered, the right option and an explanation. */
export function checkPanel<T extends string>(opts: {
  title: string;
  question: string;
  options: { value: T; label: string }[];
  right: T;
  chosen: T | null;
  onChoose: (value: T) => void;
  rightText: string;
  wrongText: string;
}): HTMLElement {
  const box = step(opts.title, "discover-check");
  box.append(el("p", "discover-question", opts.question));
  const choices = el("div", "choices");
  opts.options.forEach((option, i) => {
    const b = control("choice", "", `check-${option.value}`, () => {
      if (opts.chosen === null) opts.onChoose(option.value);
    });
    b.append(el("span", "letter", "ABCD"[i]!), el("span", "choice-text", option.label));
    if (opts.chosen !== null) {
      b.disabled = true;
      if (option.value === opts.right) b.classList.add("is-right");
      else if (option.value === opts.chosen) b.classList.add("is-wrong");
    }
    choices.append(b);
  });
  box.append(choices);
  if (opts.chosen !== null) {
    const right = opts.chosen === opts.right;
    const feedback = el("p", `vocab-feedback ${right ? "good" : "bad"}`, right ? opts.rightText : opts.wrongText);
    feedback.setAttribute("role", "status");
    box.append(feedback);
  }
  return box;
}

/** A new experiment, or the same one again by its number. */
export function againPanel(opts: { checked: boolean; onNew: () => void; onReplay: (seed: number) => void }): HTMLElement {
  const box = el("div", "discover-again");
  box.append(control(opts.checked ? "primary" : "ghost", dt("again"), "again", opts.onNew));
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
    if (Number.isInteger(seed) && seed >= 1 && seed <= MAX_SEED) opts.onReplay(seed);
  });
  box.append(form, el("p", "hint", dt("replayHint")));
  return box;
}
