/**
 * Hares and lynxes, in five steps.
 *
 *   1. Predict   which peaks first; what happens in the long run
 *   2. Try       starting numbers; 40 years over time and as a loop
 *   3. Compare   the Lotka–Volterra equations; the equilibrium and the averages; Euler's drift; the predictions
 *   4. Explain   the cycle; the delay; the averages; the Hudson's Bay furs
 *   5. Check     hunting lynxes does not change the averages
 *
 * The model is in shared/discover/ecology.ts; `npm run check:biology` checks
 * the invariant, the averages and the delay.
 */
import { HARES_LYNXES, equilibrium, euler, peaks, run, smallPeriod, type Run, type State } from "../../shared/discover/ecology";
import { el } from "../dom";
import type { User } from "../store";
import { checkPanel, choiceSet, control, explainPanel, mountLab, panel, reducedMotion, step } from "./lab";
import { bt } from "./bio-i18n";
import { num, pt } from "./physics-i18n";
import { drawing, formula, gatedButton, mineLine, physicsHead, points, restartPanel, shape, slider, table, verdict } from "./physics-ui";

export const REVEAL_AFTER = 2;
export const YEARS = 40;
const E = HARES_LYNXES;

type FirstAnswer = "prey" | "predators" | "same";
type LongAnswer = "die" | "settle" | "cycle";
type CheckAnswer = "moreHares" | "same" | "noLynx";

interface Lab {
  userId: number;
  step: "predict" | "lab";
  first: FirstAnswer | null;
  long: LongAnswer | null;
  start: State;
  runs: State[];
  revealed: boolean;
  check: CheckAnswer | null;
}

let lab: Lab | null = null;

const startLab = (userId: number): Lab => ({ userId, step: "predict", first: null, long: null, start: [40, 10], runs: [], revealed: false, check: null });

export const ecologyBusy = (): boolean => lab !== null && lab.runs.length > 0 && lab.check === null;

const firstLabel = (a: FirstAnswer): string => bt(a === "prey" ? "eFirstPrey" : a === "predators" ? "eFirstPredators" : "eFirstSame");
const longLabel = (a: LongAnswer): string => bt(a === "die" ? "eLongDie" : a === "settle" ? "eLongSettle" : "eLongCycle");

export interface Summary {
  period: number;
  lag: number;
  meanPrey: number;
  meanPredators: number;
}

/** A run's cycle: its period, the predators' delay, the averages over whole cycles. */
export function summarize(r: Run): Summary {
  const p = peaks(r.t, r.prey);
  const q = peaks(r.t, r.predators);
  // At (or next to) the equilibrium nothing cycles: the small cycles' period, no delay to measure.
  if (p.length < 2 || !q.some((t) => t > p[0]!)) {
    const [x, y] = equilibrium(E);
    return { period: smallPeriod(E), lag: smallPeriod(E) / 4, meanPrey: x, meanPredators: y };
  }
  const from = r.t.indexOf(p[0]!);
  const to = r.t.indexOf(p.at(-1)!);
  let sx = 0;
  let sy = 0;
  for (let i = from; i < to; i++) {
    sx += r.prey[i]!;
    sy += r.predators[i]!;
  }
  return { period: (p.at(-1)! - p[0]!) / (p.length - 1), lag: q.find((t) => t > p[0]!)! - p[0]!, meanPrey: sx / (to - from), meanPredators: sy / (to - from) };
}

const runOf = (start: State): Run => run(E, start, YEARS, 0.05, 0.005);

export function ecologyView(ctx: { user: User }): HTMLElement {
  if (!lab || lab.userId !== ctx.user.id) lab = startLab(ctx.user.id);
  return mountLab("is-ecology", (draw) => {
    const state = lab!;
    const head = physicsHead(bt("ecologyTitle"));
    return state.step === "predict" ? [head, predictPanel(state, draw)] : [head, ...labPanels(state, draw)];
  });
}

// ---------------------------------------------------------------- 1. predict

function predictPanel(state: Lab, draw: () => void): HTMLElement {
  const box = step(pt("stepPredict"));
  box.append(el("p", "discover-intro", bt("eIntro")));
  box.append(
    choiceSet<FirstAnswer>({
      cls: "discover-choices",
      legend: bt("ePredictFirst"),
      options: (["prey", "predators", "same"] as const).map((v) => ({ value: v, label: firstLabel(v) })),
      chosen: state.first,
      key: "first",
      onPick: (v) => ((state.first = v), draw()),
    }),
    choiceSet<LongAnswer>({
      cls: "discover-choices",
      legend: bt("ePredictLong"),
      options: (["die", "settle", "cycle"] as const).map((v) => ({ value: v, label: longLabel(v) })),
      chosen: state.long,
      key: "long",
      onPick: (v) => ((state.long = v), draw()),
    }),
  );
  box.append(
    ...gatedButton(bt("ePredictDone"), "predict-done", state.first !== null && state.long !== null, bt("ePredictNeeded"), () => {
      state.step = "lab";
      draw();
    }),
  );
  return box;
}

// ---------------------------------------------------------------- 2. try

const CW = 420;
const CH = 220;

function timeChart(r: Run, s: Summary): SVGSVGElement {
  const pad = { left: 40, right: 12, top: 12, bottom: 34 };
  const max = Math.max(...r.prey, ...r.predators) * 1.05;
  const x = (t: number): number => pad.left + ((CW - pad.left - pad.right) * t) / YEARS;
  const y = (v: number): number => pad.top + (CH - pad.top - pad.bottom) * (1 - v / max);
  const svg = drawing(
    "discover-path physics-curve bio-time",
    CW,
    CH,
    bt("eTimeAria", {
      preyMin: num(Math.min(...r.prey), 0),
      preyMax: num(Math.max(...r.prey), 0),
      predMin: num(Math.min(...r.predators), 0),
      predMax: num(Math.max(...r.predators), 0),
      period: num(s.period, 1),
    }),
  );
  const step = max > 200 ? 100 : 50;
  for (let v = 0; v <= max; v += step) {
    shape(svg, "line", { x1: pad.left, x2: CW - pad.right, y1: y(v), y2: y(v), class: "grid-line" });
    shape(svg, "text", { x: pad.left - 6, y: y(v) + 4, class: "axis-label", "text-anchor": "end" }, String(v));
  }
  for (let t = 0; t <= YEARS; t += 10) shape(svg, "text", { x: x(t), y: CH - pad.bottom + 16, class: "axis-label", "text-anchor": "middle" }, String(t));
  shape(svg, "text", { x: (pad.left + CW - pad.right) / 2, y: CH - 4, class: "axis-title", "text-anchor": "middle" }, bt("eYears"));
  shape(svg, "polyline", { points: points(r.t.map((t, i) => [x(t), y(r.prey[i]!)])), class: "bio-prey" });
  shape(svg, "polyline", { points: points(r.t.map((t, i) => [x(t), y(r.predators[i]!)])), class: "bio-predators" });
  return svg;
}

function phaseChart(r: Run, withEuler: boolean, start: State): SVGSVGElement {
  const w = 300;
  const h = 240;
  const pad = { left: 40, right: 12, top: 12, bottom: 34 };
  const naive = withEuler ? run(E, start, YEARS, 0.05, 0.05, euler) : null;
  const xs = [...r.prey, ...(naive?.prey ?? [])];
  const ys = [...r.predators, ...(naive?.predators ?? [])];
  const xMax = Math.max(...xs) * 1.05;
  const yMax = Math.max(...ys) * 1.05;
  const x = (v: number): number => pad.left + ((w - pad.left - pad.right) * v) / xMax;
  const y = (v: number): number => pad.top + (h - pad.top - pad.bottom) * (1 - v / yMax);
  const [ex, ey] = equilibrium(E);
  const svg = drawing("discover-path physics-curve bio-phase", w, h, bt("ePhaseAria", { x: num(ex, 0), y: num(ey, 0) }));
  shape(svg, "line", { x1: pad.left, x2: w - pad.right, y1: h - pad.bottom, y2: h - pad.bottom, class: "grid-line" });
  shape(svg, "line", { x1: pad.left, x2: pad.left, y1: pad.top, y2: h - pad.bottom, class: "grid-line" });
  shape(svg, "text", { x: (pad.left + w - pad.right) / 2, y: h - 4, class: "axis-title", "text-anchor": "middle" }, bt("eLegendPrey"));
  shape(svg, "text", { x: 12, y: pad.top + 10, class: "axis-title" }, bt("eLegendPredators"));
  if (naive) shape(svg, "polyline", { points: points(naive.t.map((_, i) => [x(naive.prey[i]!), y(naive.predators[i]!)])), class: "bio-euler" });
  shape(svg, "polyline", { points: points(r.t.map((_, i) => [x(r.prey[i]!), y(r.predators[i]!)])), class: "theory-curve" });
  shape(svg, "circle", { cx: x(ex), cy: y(ey), r: 4, class: "share-dot" });
  return svg;
}

function legend(): HTMLElement {
  const box = el("ul", "astro-legend");
  for (const [cls, text] of [
    ["bio-key-prey", bt("eLegendPrey")],
    ["bio-key-predators", bt("eLegendPredators")],
  ] as const) {
    const li = el("li");
    li.append(el("span", `astro-key ${cls}`), document.createTextNode(text));
    box.append(li);
  }
  return box;
}

function labPanels(state: Lab, draw: () => void): HTMLElement[] {
  const panels: HTMLElement[] = [];
  panels.push(mineLine([bt("eMineFirst", { answer: firstLabel(state.first!) }), bt("eMineLong", { answer: longLabel(state.long!) })]));

  const box = step(bt("eStep"));
  box.append(
    slider({ label: bt("eHares"), key: "hares", min: 10, max: 200, step: 5, value: state.start[0], format: (v) => num(v, 0), onInput: (v) => (state.start = [v, state.start[1]]) }),
    slider({ label: bt("eLynxes"), key: "lynxes", min: 2, max: 60, step: 1, value: state.start[1], format: (v) => num(v, 0), onInput: (v) => (state.start = [state.start[0], v]) }),
    control("primary physics-go", bt("eRun"), "run", () => {
      state.runs = [...state.runs, [...state.start] as State];
      draw();
    }),
  );
  const last = state.runs.at(-1);
  if (last) {
    const r = runOf(last);
    const s = summarize(r);
    const status = el("p", "discover-status");
    status.setAttribute("role", "status");
    status.append(el("strong", "", bt("eStatus", { period: num(s.period, 1), lag: num(s.lag, 1) })));
    const time = el("figure", "astro-figure astro-figure-wide");
    time.append(el("figcaption", "discover-panel-title", bt("eTimeTitle")), timeChart(r, s), legend());
    const phase = el("figure", "astro-figure");
    phase.append(el("figcaption", "discover-panel-title", bt("ePhaseTitle")), phaseChart(r, state.revealed, last));
    box.append(status, time, phase);
  }
  panels.push(box);

  if (state.runs.length > 0) {
    const runs = panel(bt("eRunsTitle"));
    const rows = state.runs
      .slice(-10)
      .reverse()
      .map((start) => {
        const s = summarize(runOf(start));
        return [`${num(start[0], 0)} / ${num(start[1], 0)}`, `${num(s.period, 1)} ${bt("eYears")}`, `${num(s.lag, 1)} ${bt("eYears")}`, `${num(s.meanPrey, 0)} / ${num(s.meanPredators, 1)}`];
      });
    runs.append(table("bio-runs", [bt("eColStart"), bt("eColPeriod"), bt("eColLag"), bt("eColMean")], rows, (i) => i === 0));
    panels.push(runs);
  }

  const distinct = new Set(state.runs.map((s) => s.join("|"))).size;
  if (!state.revealed) {
    const reveal = el("div", "discover-reveal");
    reveal.append(
      ...gatedButton(pt("reveal"), "reveal", distinct >= REVEAL_AFTER, bt("eRevealHint"), () => {
        state.revealed = true;
        draw();
        document.querySelector(".discover-compare")?.scrollIntoView({ behavior: reducedMotion() ? "auto" : "smooth", block: "start" });
      }),
    );
    panels.push(reveal);
  } else {
    panels.push(
      comparePanel(state),
      explainPanel(pt("stepExplain"), [bt("eExplainCycle"), bt("eExplainLag"), bt("eExplainMean"), bt("eExplainHudson")]),
      checkPanel<CheckAnswer>({
        title: pt("stepCheck"),
        question: bt("eCheckQuestion"),
        options: [
          { value: "moreHares", label: bt("eCheckMoreHares") },
          { value: "same", label: bt("eCheckSame") },
          { value: "noLynx", label: bt("eCheckNoLynx") },
        ],
        right: "same",
        chosen: state.check,
        onChoose: (v) => ((state.check = v), draw()),
        rightText: bt("eCheckRight"),
        wrongText: bt("eCheckWrong"),
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
  box.append(el("h3", "discover-panel-title", pt("formulaTitle")), el("p", "discover-intro", bt("eTheoryText")));
  box.append(formula(`\\frac{dx}{dt} = \\alpha x - \\beta x y,\\qquad \\frac{dy}{dt} = \\delta x y - \\gamma y`));
  const [x, y] = equilibrium(E);
  box.append(el("p", "discover-intro", bt("eEquilibrium", { x: num(x, 0), y: num(y, 1) })), el("p", "discover-intro", bt("eEuler")));
  box.append(el("h3", "discover-panel-title", pt("youTitle")));
  box.append(
    verdict(state.first === "prey" ? bt("eFirstRight") : bt("eFirstWrong", { answer: firstLabel(state.first!) }), state.first === "prey"),
    verdict(state.long === "cycle" ? bt("eLongRight") : bt("eLongWrong", { answer: longLabel(state.long!) }), state.long === "cycle"),
  );
  return box;
}
