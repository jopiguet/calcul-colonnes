/**
 * The logistic map: from order to chaos, in five steps.
 *
 *   1. Predict   a population at r = 3.2; at r = 3.9
 *   2. Try       r from 1 to 4: the years, the long run, the bifurcation diagram
 *   3. Compare   the doublings at 3, 3.45, 3.54…; chaos from 3.57; Feigenbaum's 4.669; the predictions
 *   4. Explain   one line of arithmetic; period doubling; windows of order; the same ratio everywhere
 *   5. Check     at r = 3.83 the population repeats every 3 years
 *
 * The map is in shared/discover/chaos.ts; `npm run check:math` checks the
 * regimes, the doublings, the period-3 window and Feigenbaum's ratio.
 */
import { CHAOS_ONSET, DOUBLINGS, FEIGENBAUM, PERIOD_THREE, bifurcation, longRun, series } from "../../shared/discover/chaos";
import { el } from "../dom";
import type { User } from "../store";
import { checkPanel, choiceSet, control, explainPanel, mountLab, reducedMotion, step } from "./lab";
import { mt } from "./math-i18n";
import { num, pt } from "./physics-i18n";
import { drawing, formula, gatedButton, mineLine, physicsHead, points, restartPanel, shape, slider, table, verdict } from "./physics-ui";

export const VALUES_NEEDED = 4;
const YEARS = 60;
const X0 = 0.2;
const PRESETS = [2.8, 3.2, 3.5, 3.83, 3.9];

type LowAnswer = "settle" | "two" | "grow";
type HighAnswer = "settle" | "cycle" | "never";
type CheckAnswer = "chaos" | "three" | "extinct";

interface Lab {
  userId: number;
  step: "predict" | "lab";
  low: LowAnswer | null;
  high: HighAnswer | null;
  r: number;
  tried: number[];
  revealed: boolean;
  check: CheckAnswer | null;
}

let lab: Lab | null = null;
const startLab = (userId: number): Lab => ({ userId, step: "predict", low: null, high: null, r: 2.8, tried: [2.8], revealed: false, check: null });

export const logisticBusy = (): boolean => lab !== null && lab.step === "lab" && lab.check === null && lab.tried.length > 1;

const lowLabel = (a: LowAnswer): string => mt(a === "settle" ? "lgLowSettle" : a === "two" ? "lgLowTwo" : "lgLowGrow");
const highLabel = (a: HighAnswer): string => mt(a === "settle" ? "lgHighSettle" : a === "cycle" ? "lgHighCycle" : "lgHighNever");

/** What the population does in the long run, in words. */
export function regime(r: number): string {
  const run = longRun(r, X0);
  if (run.kind === "extinct" || (run.kind === "fixed" && run.value < 1e-3)) return mt("lgExtinct");
  if (run.kind === "fixed") return mt("lgFixed", { value: num(run.value, 3) });
  if (run.kind === "cycle") return mt("lgCycle", { period: run.period, values: run.values.map((v) => num(v, 3)).join(" · ") });
  // Right on a doubling the population hesitates for ever, too slowly to look settled: not chaos.
  return r < CHAOS_ONSET ? mt("lgSlow") : mt("lgChaos");
}

export function logisticView(ctx: { user: User }): HTMLElement {
  if (!lab || lab.userId !== ctx.user.id) lab = startLab(ctx.user.id);
  return mountLab("is-logistic", (draw) => {
    const state = lab!;
    const head = physicsHead(mt("logisticTitle"));
    return state.step === "predict" ? [head, predictPanel(state, draw)] : [head, ...labPanels(state, draw)];
  });
}

// ---------------------------------------------------------------- 1. predict

function predictPanel(state: Lab, draw: () => void): HTMLElement {
  const box = step(pt("stepPredict"));
  box.append(el("p", "discover-intro", mt("lgIntro")), formula(`x_{n+1} = r\\,x_n\\,(1 - x_n)`));
  box.append(
    choiceSet<LowAnswer>({
      cls: "discover-choices",
      legend: mt("lgPredictLow"),
      options: (["settle", "two", "grow"] as const).map((v) => ({ value: v, label: lowLabel(v) })),
      chosen: state.low,
      key: "low",
      onPick: (v) => ((state.low = v), draw()),
    }),
    choiceSet<HighAnswer>({
      cls: "discover-choices",
      legend: mt("lgPredictHigh"),
      options: (["settle", "cycle", "never"] as const).map((v) => ({ value: v, label: highLabel(v) })),
      chosen: state.high,
      key: "high",
      onPick: (v) => ((state.high = v), draw()),
    }),
  );
  box.append(
    ...gatedButton(mt("lgPredictDone"), "predict-done", state.low !== null && state.high !== null, mt("predictNeeded"), () => {
      state.step = "lab";
      draw();
    }),
  );
  return box;
}

// ---------------------------------------------------------------- 2. try

const CW = 540;
const CH = 200;

/** The population, year by year. */
function yearsChart(r: number): SVGSVGElement {
  const pad = { left: 40, right: 12, top: 10, bottom: 34 };
  const xs = series(r, X0, YEARS);
  const x = (n: number): number => pad.left + ((CW - pad.left - pad.right) * n) / YEARS;
  const y = (v: number): number => pad.top + (CH - pad.top - pad.bottom) * (1 - v);
  const svg = drawing("discover-path physics-curve math-years", CW, CH, mt("lgYearsAria", { r: num(r, 2), regime: regime(r) }));
  for (const v of [0, 0.5, 1]) {
    shape(svg, "line", { x1: pad.left, x2: CW - pad.right, y1: y(v), y2: y(v), class: "grid-line" });
    shape(svg, "text", { x: pad.left - 6, y: y(v) + 4, class: "axis-label", "text-anchor": "end" }, num(v, 1));
  }
  for (let n = 0; n <= YEARS; n += 10) shape(svg, "text", { x: x(n), y: CH - pad.bottom + 16, class: "axis-label", "text-anchor": "middle" }, String(n));
  shape(svg, "text", { x: (pad.left + CW - pad.right) / 2, y: CH - 4, class: "axis-title", "text-anchor": "middle" }, mt("lgYears"));
  shape(svg, "polyline", { points: points(xs.map((v, n) => [x(n), y(v)])), class: "math-years-line" });
  for (let n = 0; n < xs.length; n++) shape(svg, "circle", { cx: x(n), cy: y(xs[n]!), r: 2.2, class: "math-years-dot" });
  return svg;
}

const BW = 540;
const BH = 280;
const R_MIN = 2.5;
const R_MAX = 4;
const BPAD = { left: 40, right: 12, top: 10, bottom: 34 };

/** The diagram's dots, computed once. */
let diagram: ImageData | null = null;
function diagramImage(): ImageData {
  if (diagram) return diagram;
  const image = new ImageData(BW, BH);
  const w = BW - BPAD.left - BPAD.right;
  const h = BH - BPAD.top - BPAD.bottom;
  for (const { r, xs } of bifurcation(R_MIN, R_MAX, w, 200, 800)) {
    const px = Math.floor(BPAD.left + ((r - R_MIN) / (R_MAX - R_MIN)) * w);
    for (const v of xs) {
      const py = Math.floor(BPAD.top + h * (1 - v));
      const o = 4 * (py * BW + px);
      image.data[o] = 36;
      image.data[o + 1] = 69;
      image.data[o + 2] = 196;
      image.data[o + 3] = Math.min(255, image.data[o + 3]! + 110);
    }
  }
  diagram = image;
  return image;
}

function diagramCanvas(r: number, marks: boolean): HTMLElement {
  const wrap = el("figure", "math-canvas-wrap math-diagram-wrap");
  const canvas = el("canvas", "math-canvas math-diagram");
  canvas.width = BW;
  canvas.height = BH;
  canvas.setAttribute("role", "img");
  canvas.setAttribute("aria-label", mt("lgDiagramAria", { r: num(r, 2) }));
  const ctx = canvas.getContext("2d");
  const w = BW - BPAD.left - BPAD.right;
  const h = BH - BPAD.top - BPAD.bottom;
  const x = (v: number): number => BPAD.left + ((v - R_MIN) / (R_MAX - R_MIN)) * w;
  if (ctx) {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, BW, BH);
    // putImageData would erase the white: draw through a second canvas.
    const dots = document.createElement("canvas");
    dots.width = BW;
    dots.height = BH;
    dots.getContext("2d")?.putImageData(diagramImage(), 0, 0);
    ctx.drawImage(dots, 0, 0);
    ctx.fillStyle = "#4a5578";
    ctx.font = "12px sans-serif";
    ctx.textAlign = "center";
    for (let v = 2.5; v <= 4.001; v += 0.5) ctx.fillText(num(v, 1), x(v), BH - BPAD.bottom + 16);
    ctx.fillText("r", BPAD.left + w / 2, BH - 4);
    ctx.textAlign = "right";
    for (const v of [0, 0.5, 1]) ctx.fillText(num(v, 1), BPAD.left - 6, BPAD.top + h * (1 - v) + 4);
    if (marks) {
      ctx.strokeStyle = "rgba(217,84,30,0.7)";
      ctx.setLineDash([4, 4]);
      for (const d of [...DOUBLINGS.slice(0, 3), CHAOS_ONSET, PERIOD_THREE]) {
        ctx.beginPath();
        ctx.moveTo(x(d), BPAD.top);
        ctx.lineTo(x(d), BPAD.top + h);
        ctx.stroke();
      }
      ctx.setLineDash([]);
    }
    if (r >= R_MIN) {
      ctx.strokeStyle = "#d9541e";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x(r), BPAD.top);
      ctx.lineTo(x(r), BPAD.top + h);
      ctx.stroke();
    }
  }
  wrap.append(canvas);
  return wrap;
}

function labPanels(state: Lab, draw: () => void): HTMLElement[] {
  const panels: HTMLElement[] = [];
  panels.push(mineLine([mt("lgMineLow", { answer: lowLabel(state.low!) }), mt("lgMineHigh", { answer: highLabel(state.high!) })]));

  const box = step(mt("lgStep"));
  const years = el("figure", "astro-figure astro-figure-wide math-figure");
  const status = el("p", "discover-status");
  status.setAttribute("role", "status");
  const diagramBox = el("div", "math-diagram-box");
  const triedBox = el("div", "math-tried");
  let gated = state.tried.length >= VALUES_NEEDED;
  const pick = (r: number): void => {
    const v = Math.round(r * 100) / 100;
    state.r = v;
    if (!state.tried.includes(v)) state.tried = [...state.tried, v];
    show();
    if (!gated && state.tried.length >= VALUES_NEEDED) {
      gated = true;
      draw();
    }
  };
  const show = (): void => {
    years.replaceChildren(yearsChart(state.r));
    status.replaceChildren(el("strong", "", `r = ${num(state.r, 2)} : `), el("span", "", regime(state.r)));
    diagramBox.replaceChildren(diagramCanvas(state.r, state.revealed));
    const sorted = [...state.tried].sort((a, b) => a - b);
    triedBox.replaceChildren(table("math-tried-table", ["r", mt("lgColLongRun")], sorted.map((r) => [num(r, 2), regime(r)]), (i) => sorted[i] === state.r));
  };
  show();
  const rSlider = slider({ label: mt("lgSlider"), key: "r", min: 1, max: 4, step: 0.01, value: state.r, format: (v) => num(v, 2), onInput: pick });
  const presets = el("div", "discover-roll math-presets");
  for (const r of PRESETS) {
    presets.append(
      control("ghost", `r = ${num(r, 2)}`, `r-${r}`, () => {
        const input = rSlider.querySelector("input");
        const output = rSlider.querySelector("output");
        if (input) input.value = String(r);
        if (output) output.textContent = num(r, 2);
        pick(r);
      }),
    );
  }
  box.append(el("p", "hint", mt("lgHint")), rSlider, presets, status, years, el("h3", "discover-panel-title", mt("lgDiagramTitle")), el("p", "hint", mt("lgDiagramHint")), diagramBox, triedBox);
  panels.push(box);

  const ready = state.tried.length >= VALUES_NEEDED;
  if (!state.revealed) {
    const reveal = el("div", "discover-reveal");
    reveal.append(
      ...gatedButton(pt("reveal"), "reveal", ready, mt("lgRevealHint", { values: VALUES_NEEDED }), () => {
        state.revealed = true;
        draw();
        document.querySelector(".discover-compare")?.scrollIntoView({ behavior: reducedMotion() ? "auto" : "smooth", block: "start" });
      }),
    );
    panels.push(reveal);
  } else {
    panels.push(
      comparePanel(state),
      explainPanel(pt("stepExplain"), [mt("lgExplainRule"), mt("lgExplainDoubling"), mt("lgExplainWindows"), mt("lgExplainFeigenbaum")]),
      checkPanel<CheckAnswer>({
        title: pt("stepCheck"),
        question: mt("lgCheckQuestion"),
        options: [
          { value: "chaos", label: mt("lgCheckChaos") },
          { value: "three", label: mt("lgCheckThree") },
          { value: "extinct", label: mt("lgCheckExtinct") },
        ],
        right: "three",
        chosen: state.check,
        onChoose: (v) => ((state.check = v), draw()),
        rightText: mt("lgCheckRight"),
        wrongText: mt("lgCheckWrong"),
      }),
    );
  }
  panels.push(
    restartPanel(state.check !== null, () => {
      lab = startLab(state.userId);
      draw();
    }),
  );
  return panels;
}

// ---------------------------------------------------------------- 3. compare

function comparePanel(state: Lab): HTMLElement {
  const box = step(pt("stepCompare"), "discover-compare");
  box.append(el("h3", "discover-panel-title", pt("formulaTitle")), el("p", "discover-intro", mt("lgTheoryDoublings")));
  const periods = [2, 4, 8, 16, 32];
  box.append(
    table(
      "math-doublings",
      [mt("lgColPeriod"), "r"],
      [...DOUBLINGS.map((d, i) => [String(periods[i]), num(d, 4)]), [mt("lgColChaos"), num(CHAOS_ONSET, 4)], ["3", num(PERIOD_THREE, 4)]],
    ),
  );
  box.append(el("p", "discover-intro", mt("lgTheoryFeigenbaum", { delta: num(FEIGENBAUM, 3) })));
  box.append(formula(`\\frac{r_{k} - r_{k-1}}{r_{k+1} - r_{k}} \\;\\to\\; \\delta \\approx ${num(FEIGENBAUM, 4).replace(",", "{,}")}`));
  box.append(el("p", "discover-intro", mt("lgTheoryWindow")));
  box.append(el("h3", "discover-panel-title", pt("youTitle")));
  box.append(
    verdict(state.low === "two" ? mt("lgLowRight") : mt("lgLowWrong", { answer: lowLabel(state.low!) }), state.low === "two"),
    verdict(state.high === "never" ? mt("lgHighRight") : mt("lgHighWrong", { answer: highLabel(state.high!) }), state.high === "never"),
  );
  return box;
}
