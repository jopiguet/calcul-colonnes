/**
 * The Lorenz attractor and the butterfly effect, in five steps.
 *
 *   1. Predict   two weathers started a hair apart; ten times more precision
 *   2. Try       the starting gap from 10⁻¹ to 10⁻¹²; time from 0 to 40
 *   3. Compare   the gap grows like e^{λt}; each factor 10 buys the same time; the predictions
 *   4. Explain   deterministic yet unpredictable; the butterfly; a strange attractor; why forecasts stop at ~10 days
 *   5. Check     forecasting twice as far needs the precision squared
 *
 * The equations are in shared/discover/chaos.ts; `npm run check:math` checks
 * the integration, the attractor's bounds, λ and the time per factor 10.
 */
import { LORENZ, LOST, LYAPUNOV, divergenceTime, twins, type Twins } from "../../shared/discover/chaos";
import { el } from "../dom";
import type { User } from "../store";
import { checkPanel, choiceSet, explainPanel, mountLab, reducedMotion, step } from "./lab";
import { mt } from "./math-i18n";
import { num, pt } from "./physics-i18n";
import { drawing, formula, gatedButton, mineLine, physicsHead, points, restartPanel, shape, slider, table, verdict } from "./physics-ui";

export const RUNS_NEEDED = 3;
export const UNTIL = 40;

type SameAnswer = "same" | "drift" | "different";
type TenfoldAnswer = "tenfold" | "bit" | "same";
type CheckAnswer = "double" | "squared" | "impossible";

interface Lab {
  userId: number;
  step: "predict" | "lab";
  same: SameAnswer | null;
  tenfold: TenfoldAnswer | null;
  /** The starting gap is 10^−k. */
  k: number;
  t: number;
  runs: number[];
  revealed: boolean;
  check: CheckAnswer | null;
}

let lab: Lab | null = null;
const startLab = (userId: number): Lab => ({ userId, step: "predict", same: null, tenfold: null, k: 3, t: 20, runs: [3], revealed: false, check: null });

export const lorenzBusy = (): boolean => lab !== null && lab.step === "lab" && lab.check === null && lab.runs.length > 1;

const sameLabel = (a: SameAnswer): string => mt(a === "same" ? "lzSameSame" : a === "drift" ? "lzSameDrift" : "lzSameDifferent");
const tenfoldLabel = (a: TenfoldAnswer): string => mt(a === "tenfold" ? "lzTenfoldTenfold" : a === "bit" ? "lzTenfoldBit" : "lzTenfoldSame");

/** "10⁻⁶". */
const SUP: Record<string, string> = { "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴", "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹" };
export const power = (k: number): string => `10⁻${String(k).replace(/\d/g, (d) => SUP[d]!)}`;

/** The runs, kept: dragging the time slider does not integrate again. */
const runs = new Map<number, Twins>();
function runFor(k: number): Twins {
  let r = runs.get(k);
  if (!r) {
    r = twins(10 ** -k, UNTIL);
    runs.set(k, r);
  }
  return r;
}

export function lorenzView(ctx: { user: User }): HTMLElement {
  if (!lab || lab.userId !== ctx.user.id) lab = startLab(ctx.user.id);
  return mountLab("is-lorenz", (draw) => {
    const state = lab!;
    const head = physicsHead(mt("lorenzTitle"));
    return state.step === "predict" ? [head, predictPanel(state, draw)] : [head, ...labPanels(state, draw)];
  });
}

// ---------------------------------------------------------------- 1. predict

function predictPanel(state: Lab, draw: () => void): HTMLElement {
  const box = step(pt("stepPredict"));
  box.append(el("p", "discover-intro", mt("lzIntro")));
  box.append(formula(`\\dot x = ${LORENZ.sigma}(y - x),\\quad \\dot y = x(${LORENZ.rho} - z) - y,\\quad \\dot z = xy - \\tfrac{8}{3}z`));
  box.append(
    choiceSet<SameAnswer>({
      cls: "discover-choices",
      legend: mt("lzPredictSame"),
      options: (["same", "drift", "different"] as const).map((v) => ({ value: v, label: sameLabel(v) })),
      chosen: state.same,
      key: "same",
      onPick: (v) => ((state.same = v), draw()),
    }),
    choiceSet<TenfoldAnswer>({
      cls: "discover-choices",
      legend: mt("lzPredictTenfold"),
      options: (["tenfold", "bit", "same"] as const).map((v) => ({ value: v, label: tenfoldLabel(v) })),
      chosen: state.tenfold,
      key: "tenfold",
      onPick: (v) => ((state.tenfold = v), draw()),
    }),
  );
  box.append(
    ...gatedButton(mt("lzPredictDone"), "predict-done", state.same !== null && state.tenfold !== null, mt("predictNeeded"), () => {
      state.step = "lab";
      draw();
    }),
  );
  return box;
}

// ---------------------------------------------------------------- 2. try

const BW = 340;
const BH = 300;

/** The butterfly: x across, z up, both runs up to time t. */
function butterfly(r: Twins, t: number, k: number): SVGSVGElement {
  const n = Math.max(1, r.t.findIndex((s) => s >= t - 1e-9) + 1 || r.t.length);
  const x = (v: number): number => BW / 2 + v * 7.4;
  const y = (v: number): number => BH - 12 - v * 5.4;
  const gap = r.gap[n - 1]!;
  const svg = drawing("discover-path math-drawing math-butterfly", BW, BH, mt("lzButterflyAria", { t: num(t, 0), gap: num(gap, gap < 0.01 ? 6 : 2) }));
  const keep = (list: Twins["a"]): [number, number][] => list.slice(0, n).map((p) => [x(p[0]), y(p[2])]);
  shape(svg, "polyline", { points: points(keep(r.a)), class: "math-run-a" });
  shape(svg, "polyline", { points: points(keep(r.b)), class: "math-run-b" });
  const a = r.a[n - 1]!;
  const b = r.b[n - 1]!;
  shape(svg, "circle", { cx: x(a[0]), cy: y(a[2]), r: 5, class: "math-dot-a" });
  shape(svg, "circle", { cx: x(b[0]), cy: y(b[2]), r: 5, class: "math-dot-b" });
  shape(svg, "text", { x: 8, y: 16, class: "axis-label" }, `δ = ${power(k)}`);
  return svg;
}

const GW = 540;
const GH = 220;
const LOG_MIN = -13;
const LOG_MAX = 2;

/** The gap between the two runs, on a log scale, against time. */
function gapChart(r: Twins, t: number, k: number, theory: boolean): SVGSVGElement {
  const pad = { left: 46, right: 12, top: 10, bottom: 34 };
  const x = (s: number): number => pad.left + ((GW - pad.left - pad.right) * s) / UNTIL;
  const y = (lg: number): number => pad.top + (GH - pad.top - pad.bottom) * (1 - (Math.max(LOG_MIN, Math.min(LOG_MAX, lg)) - LOG_MIN) / (LOG_MAX - LOG_MIN));
  const lost = divergenceTime(r);
  const svg = drawing("discover-path physics-curve math-gap", GW, GH, mt("lzGapAria", { delta: power(k), time: lost === null ? "—" : num(lost, 1) }));
  for (let lg = -12; lg <= 0; lg += 3) {
    shape(svg, "line", { x1: pad.left, x2: GW - pad.right, y1: y(lg), y2: y(lg), class: "grid-line" });
    shape(svg, "text", { x: pad.left - 6, y: y(lg) + 4, class: "axis-label", "text-anchor": "end" }, lg === 0 ? "1" : power(-lg));
  }
  for (let s = 0; s <= UNTIL; s += 10) shape(svg, "text", { x: x(s), y: GH - pad.bottom + 16, class: "axis-label", "text-anchor": "middle" }, String(s));
  shape(svg, "text", { x: (pad.left + GW - pad.right) / 2, y: GH - 4, class: "axis-title", "text-anchor": "middle" }, mt("lzTime"));
  shape(svg, "line", { x1: pad.left, x2: GW - pad.right, y1: y(Math.log10(LOST)), y2: y(Math.log10(LOST)), class: "math-lost" });
  shape(svg, "text", { x: GW - pad.right - 4, y: y(Math.log10(LOST)) - 5, class: "axis-label", "text-anchor": "end" }, mt("lzLostLine"));
  if (theory) {
    // e^{λt}: a straight line on this scale, until the gap is as wide as the attractor.
    const end = Math.min(UNTIL, ((LOG_MAX + k) * Math.LN10) / LYAPUNOV);
    shape(svg, "line", { x1: x(0), y1: y(-k), x2: x(end), y2: y(-k + (LYAPUNOV * end) / Math.LN10), class: "theory-curve math-theory" });
  }
  shape(svg, "polyline", { points: points(r.t.map((s, i) => [x(s), y(Math.log10(Math.max(1e-14, r.gap[i]!)))])), class: "math-gap-line" });
  shape(svg, "line", { x1: x(t), x2: x(t), y1: pad.top, y2: GH - pad.bottom, class: "math-now" });
  return svg;
}

function labPanels(state: Lab, draw: () => void): HTMLElement[] {
  const panels: HTMLElement[] = [];
  panels.push(mineLine([mt("lzMineSame", { answer: sameLabel(state.same!) }), mt("lzMineTenfold", { answer: tenfoldLabel(state.tenfold!) })]));

  const box = step(mt("lzStep"));
  const fly = el("figure", "astro-figure math-figure");
  const chart = el("figure", "astro-figure astro-figure-wide math-figure");
  const status = el("p", "discover-status");
  status.setAttribute("role", "status");
  const runsBox = el("div", "math-runs");
  const show = (): void => {
    const r = runFor(state.k);
    const n = Math.max(1, r.t.findIndex((s) => s >= state.t - 1e-9) + 1 || r.t.length);
    const gap = r.gap[n - 1]!;
    const lost = divergenceTime(r);
    fly.replaceChildren(butterfly(r, state.t, state.k));
    chart.replaceChildren(gapChart(r, state.t, state.k, state.revealed));
    status.replaceChildren(
      el("strong", "", mt("lzStatus", { t: num(state.t, 0), gap: gap < 0.01 ? gap.toExponential(1).replace("e", " × 10^") : num(gap, 2) })),
      el("span", "", ` ${lost === null ? mt("lzStillTogether") : mt("lzLostAt", { time: num(lost, 1) })}`),
    );
    const rows = [...state.runs].sort((a, b) => a - b).map((k) => {
      const lt = divergenceTime(runFor(k));
      return [power(k), lt === null ? "—" : num(lt, 1)];
    });
    runsBox.replaceChildren(table("math-runs-table", [mt("lzColDelta"), mt("lzColLost")], rows, (i) => [...state.runs].sort((a, b) => a - b)[i] === state.k));
  };
  show();
  let gated = state.runs.length >= RUNS_NEEDED;
  box.append(
    el("p", "hint", mt("lzHint")),
    fly,
    slider({
      label: mt("lzSliderDelta"),
      key: "delta",
      min: 1,
      max: 12,
      step: 1,
      value: state.k,
      format: (v) => power(v),
      onInput: (v) => {
        state.k = v;
        if (!state.runs.includes(v)) state.runs = [...state.runs, v];
        show();
        if (!gated && state.runs.length >= RUNS_NEEDED) {
          gated = true;
          draw();
        }
      },
    }),
    slider({
      label: mt("lzSliderTime"),
      key: "time",
      min: 0,
      max: UNTIL,
      step: 0.5,
      value: state.t,
      format: (v) => num(v, 1),
      onInput: (v) => {
        state.t = v;
        show();
      },
    }),
    status,
    chart,
    el("p", "hint", mt("lzRunsHint")),
    runsBox,
  );
  panels.push(box);

  const ready = state.runs.length >= RUNS_NEEDED;
  if (!state.revealed) {
    const reveal = el("div", "discover-reveal");
    reveal.append(
      ...gatedButton(pt("reveal"), "reveal", ready, mt("lzRevealHint", { runs: RUNS_NEEDED }), () => {
        state.revealed = true;
        draw();
        document.querySelector(".discover-compare")?.scrollIntoView({ behavior: reducedMotion() ? "auto" : "smooth", block: "start" });
      }),
    );
    panels.push(reveal);
  } else {
    panels.push(
      comparePanel(state),
      explainPanel(pt("stepExplain"), [mt("lzExplainDeterministic"), mt("lzExplainButterfly"), mt("lzExplainAttractor"), mt("lzExplainWeather")]),
      checkPanel<CheckAnswer>({
        title: pt("stepCheck"),
        question: mt("lzCheckQuestion"),
        options: [
          { value: "double", label: mt("lzCheckDouble") },
          { value: "squared", label: mt("lzCheckSquared") },
          { value: "impossible", label: mt("lzCheckImpossible") },
        ],
        right: "squared",
        chosen: state.check,
        onChoose: (v) => ((state.check = v), draw()),
        rightText: mt("lzCheckRight"),
        wrongText: mt("lzCheckWrong"),
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
  const perTen = Math.LN10 / LYAPUNOV;
  box.append(el("h3", "discover-panel-title", pt("formulaTitle")), el("p", "discover-intro", mt("lzTheoryGrowth", { lambda: num(LYAPUNOV, 2) })));
  box.append(formula(`|\\delta(t)| \\approx |\\delta_0|\\, e^{\\lambda t},\\qquad \\lambda \\approx ${num(LYAPUNOV, 2).replace(",", "{,}")}`));
  box.append(el("p", "discover-intro", mt("lzTheoryPerTen", { time: num(perTen, 1) })));
  box.append(formula(`t_{\\text{perdu}} \\approx \\frac{1}{\\lambda}\\ln\\frac{${LOST}}{|\\delta_0|}`.replace("perdu", mt("lzLostWord"))));
  const sorted = [...state.runs].sort((a, b) => a - b);
  box.append(
    table(
      "math-runs-compare",
      [mt("lzColDelta"), mt("lzColLost"), mt("lzColTheory")],
      sorted.map((k) => {
        const lt = divergenceTime(runFor(k));
        return [power(k), lt === null ? "—" : num(lt, 1), num(Math.log(LOST * 10 ** k) / LYAPUNOV, 1)];
      }),
    ),
    el("p", "hint", mt("lzTheoryHint")),
  );
  box.append(el("h3", "discover-panel-title", pt("youTitle")));
  box.append(
    verdict(state.same === "different" ? mt("lzSameRight") : mt("lzSameWrong", { answer: sameLabel(state.same!) }), state.same === "different"),
    verdict(state.tenfold === "bit" ? mt("lzTenfoldRight", { time: num(perTen, 1) }) : mt("lzTenfoldWrong", { answer: tenfoldLabel(state.tenfold!), time: num(perTen, 1) }), state.tenfold === "bit"),
  );
  return box;
}
