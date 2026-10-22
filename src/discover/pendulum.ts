/**
 * The pendulum, in five steps.
 *
 *   1. Predict   heavy or light ball; a string 4 times longer
 *   2. Try       length, mass and release angle; the pendulum swings; time 10 swings
 *   3. Compare   time against length, 2π√(L/g), the exact period at large angles, the predictions
 *   4. Explain   mass cancels; √L; amplitude
 *   5. Check     a child and an adult on the same swing
 *
 * The motion is integrated with the full sin θ (shared/discover/pendulum.ts);
 * `npm run check:physics` compares its period with the exact one and checks
 * that its energy does not drift.
 */
import { G } from "../../shared/discover/projectile";
import { exactPeriod, measuredPeriod, release, rk4, smallAnglePeriod, type Pendulum, type State } from "../../shared/discover/pendulum";
import { el } from "../dom";
import type { User } from "../store";
import { checkPanel, choiceSet, control, explainPanel, mountLab, panel, reducedMotion, step } from "./lab";
import { andList, deg, num, pct, pt } from "./physics-i18n";
import { drawing, formula, gatedButton, mineLine, physicsHead, points, restartPanel, shape, slider, table, verdict } from "./physics-ui";

export const MASSES = [0.05, 0.2, 1, 5];
export const REVEAL_AFTER = 3;

type MassAnswer = "heavy" | "light" | "same";
type LengthAnswer = "same" | "x2" | "x4" | "x16";
type CheckAnswer = "child" | "adult" | "same";

interface Measurement extends Pendulum {
  period: number;
}

interface Lab {
  userId: number;
  step: "predict" | "lab";
  mass: MassAnswer | null;
  longer: LengthAnswer | null;
  pendulum: Pendulum;
  measures: Measurement[];
  revealed: boolean;
  check: CheckAnswer | null;
}

let lab: Lab | null = null;

const startLab = (userId: number): Lab => ({
  userId,
  step: "predict",
  mass: null,
  longer: null,
  pendulum: { length: 1, mass: 0.2, angle: 15 },
  measures: [],
  revealed: false,
  check: null,
});

export const pendulumBusy = (): boolean => lab !== null && lab.measures.length > 0 && lab.check === null;

export const massText = (m: number): string => (m < 1 ? `${Math.round(m * 1000)} g` : `${num(m, 0)} kg`);
const metres = (d: number): string => `${num(d, 2)} m`;
const seconds = (t: number, digits = 2): string => `${num(t, digits)} s`;

const massLabel = (a: MassAnswer): string => pt(a === "heavy" ? "pHeavy" : a === "light" ? "pLight" : "pSameMass");
const lengthLabel = (a: LengthAnswer): string => pt(a === "same" ? "pLengthSame" : a === "x2" ? "pLength2" : a === "x4" ? "pLength4" : "pLength16");

export function pendulumView(ctx: { user: User }): HTMLElement {
  if (!lab || lab.userId !== ctx.user.id) lab = startLab(ctx.user.id);
  const view = mountLab("is-pendulum", (draw) => {
    const state = lab!;
    const head = physicsHead(pt("pendulumTitle"));
    return state.step === "predict" ? [head, predictPanel(state, draw)] : [head, ...labPanels(state, draw)];
  });
  startSwinging();
  return view;
}

// ---------------------------------------------------------------- 1. predict

function predictPanel(state: Lab, draw: () => void): HTMLElement {
  const box = step(pt("stepPredict"));
  box.append(el("p", "discover-intro", pt("pIntro")));
  box.append(
    choiceSet<MassAnswer>({
      cls: "discover-choices",
      legend: pt("pPredictMass"),
      options: (["heavy", "light", "same"] as const).map((v) => ({ value: v, label: massLabel(v) })),
      chosen: state.mass,
      key: "mass",
      onPick: (v) => ((state.mass = v), draw()),
    }),
    choiceSet<LengthAnswer>({
      cls: "discover-choices",
      legend: pt("pPredictLength"),
      options: (["same", "x2", "x4", "x16"] as const).map((v) => ({ value: v, label: lengthLabel(v) })),
      chosen: state.longer,
      key: "longer",
      onPick: (v) => ((state.longer = v), draw()),
    }),
  );
  box.append(
    ...gatedButton(pt("pPredictDone"), "predict-done", state.mass !== null && state.longer !== null, pt("pPredictNeeded"), () => {
      state.step = "lab";
      draw();
      startSwinging();
    }),
  );
  return box;
}

// ---------------------------------------------------------------- 2. try

const W = 420;
const H = 240;
const PIVOT: [number, number] = [W / 2, 18];
const PX_PER_M = 80;

const bobRadius = (mass: number): number => 7 + 3.5 * Math.log10(mass / 0.05) * 1.6;

/** The swing in progress, advanced in real time by one loop for the whole page. */
const swing: { p: Pendulum; s: State; last: number; running: boolean } = { p: { length: 1, mass: 0.2, angle: 15 }, s: [0, 0], last: 0, running: false };

function resetSwing(p: Pendulum): void {
  swing.p = { ...p };
  swing.s = release(p);
  swing.last = 0;
}

function bobAt(p: Pendulum, theta: number): [number, number] {
  const r = p.length * PX_PER_M;
  return [PIVOT[0] + r * Math.sin(theta), PIVOT[1] + r * Math.cos(theta)];
}

function startSwinging(): void {
  if (!lab) return;
  resetSwing(lab.pendulum);
  if (swing.running || reducedMotion()) return;
  swing.running = true;
  const frame = (now: number): void => {
    const svg = document.querySelector<SVGSVGElement>(".physics-pendulum");
    if (!svg) {
      swing.running = false;
      return;
    }
    const elapsed = swing.last ? Math.min(0.05, (now - swing.last) / 1000) : 0;
    swing.last = now;
    const steps = Math.max(1, Math.ceil(elapsed * 600));
    for (let i = 0; i < steps && elapsed > 0; i++) swing.s = rk4(swing.p, swing.s, elapsed / steps);
    const [bx, by] = bobAt(swing.p, swing.s[0]);
    svg.querySelector(".pendulum-string")?.setAttribute("x2", bx.toFixed(1));
    svg.querySelector(".pendulum-string")?.setAttribute("y2", by.toFixed(1));
    svg.querySelector(".pendulum-bob")?.setAttribute("cx", bx.toFixed(1));
    svg.querySelector(".pendulum-bob")?.setAttribute("cy", by.toFixed(1));
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
}

function pendulumDrawing(p: Pendulum): SVGSVGElement {
  const svg = drawing("physics-pendulum", W, H, pt("pAria", { length: num(p.length, 2), mass: massText(p.mass), angle: deg(p.angle) }));
  shape(svg, "rect", { x: PIVOT[0] - 60, y: 6, width: 120, height: 8, class: "pendulum-support" });
  const r = p.length * PX_PER_M;
  shape(svg, "line", { x1: PIVOT[0], y1: PIVOT[1], x2: PIVOT[0], y2: PIVOT[1] + r + 20, class: "pendulum-vertical" });
  const a = (p.angle * Math.PI) / 180;
  // The release angle, as an arc on both sides: the swing stays within it.
  const arc: [number, number][] = [];
  for (let k = -20; k <= 20; k++) arc.push(bobAt(p, (a * k) / 20));
  shape(svg, "polyline", { points: points(arc), class: "pendulum-arc" });
  const [bx, by] = bobAt(p, reducedMotion() ? a : swing.s[0]);
  shape(svg, "line", { x1: PIVOT[0], y1: PIVOT[1], x2: bx, y2: by, class: "pendulum-string" });
  shape(svg, "circle", { cx: bx, cy: by, r: bobRadius(p.mass), class: "pendulum-bob" });
  shape(svg, "circle", { cx: PIVOT[0], cy: PIVOT[1], r: 3, class: "pendulum-pivot" });
  return svg;
}

function labPanels(state: Lab, draw: () => void): HTMLElement[] {
  const panels: HTMLElement[] = [];
  panels.push(mineLine([pt("pMineMass", { answer: massLabel(state.mass!) }), pt("pMineLength", { answer: lengthLabel(state.longer!) })]));

  const box = step(pt("pStep"));
  const picture = el("div", "physics-pendulum-box");
  picture.append(pendulumDrawing(state.pendulum));
  box.append(picture);
  const changed = (): void => {
    resetSwing(state.pendulum);
    picture.replaceChildren(pendulumDrawing(state.pendulum));
  };
  const controls = el("div", "physics-controls");
  controls.append(
    slider({ label: pt("pLengthLabel"), key: "length", min: 0.25, max: 2.5, step: 0.05, value: state.pendulum.length, format: metres, onInput: (v) => ((state.pendulum.length = v), changed()) }),
    choiceSet<number>({
      cls: "discover-choices physics-masses",
      legend: pt("pMassLabel"),
      options: MASSES.map((m) => ({ value: m, label: massText(m) })),
      chosen: state.pendulum.mass,
      key: "mass",
      onPick: (m) => {
        state.pendulum.mass = m;
        resetSwing(state.pendulum);
        draw();
      },
    }),
    slider({ label: pt("pAngleLabel"), key: "angle", min: 5, max: 80, step: 5, value: state.pendulum.angle, format: deg, onInput: (v) => ((state.pendulum.angle = v), changed()) }),
  );
  box.append(controls);
  box.append(
    control("primary physics-go", pt("pMeasure"), "measure", () => {
      const p = { ...state.pendulum };
      state.measures = [...state.measures, { ...p, period: measuredPeriod(p, 10) }];
      draw();
    }),
  );
  const last = state.measures.at(-1);
  const status = el("p", "discover-status");
  status.setAttribute("role", "status");
  if (last) status.append(el("strong", "", pt("pMeasured", { ten: num(10 * last.period, 1), period: num(last.period, 2) })));
  box.append(status);
  panels.push(box);

  if (state.measures.length > 0) panels.push(measuresTable(state), periodChart(state));

  if (!state.revealed) {
    const reveal = el("div", "discover-reveal");
    reveal.append(
      ...gatedButton(pt("reveal"), "reveal", state.measures.length >= REVEAL_AFTER, pt("pRevealHint"), () => {
        state.revealed = true;
        draw();
        document.querySelector(".discover-compare")?.scrollIntoView({ behavior: reducedMotion() ? "auto" : "smooth", block: "start" });
      }),
    );
    panels.push(reveal);
  } else {
    panels.push(
      comparePanel(state),
      explainPanel(pt("stepExplain"), [pt("pExplainMass"), pt("pExplainLength"), pt("pExplainAngle"), pt("pExplainGalileo")]),
      checkPanel<CheckAnswer>({
        title: pt("stepCheck"),
        question: pt("pCheckQuestion"),
        options: [
          { value: "child", label: pt("pCheckChild") },
          { value: "adult", label: pt("pCheckAdult") },
          { value: "same", label: pt("pCheckSame") },
        ],
        right: "same",
        chosen: state.check,
        onChoose: (v) => ((state.check = v), draw()),
        rightText: pt("pCheckRight"),
        wrongText: pt("pCheckWrong"),
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

function measuresTable(state: Lab): HTMLElement {
  const box = panel(pt("pMeasuresTitle"));
  const rows = state.measures
    .slice(-10)
    .reverse()
    .map((m) => [metres(m.length), massText(m.mass), deg(m.angle), seconds(10 * m.period, 1), seconds(m.period)]);
  box.append(table("physics-measures", [pt("pColLength"), pt("pColMass"), pt("pColAngle"), pt("pColTen"), pt("pColPeriod")], rows, (i) => i === 0));
  return box;
}

/** Time of one swing against length: the measurements, and 2π√(L/g) once revealed. */
function periodChart(state: Lab): HTMLElement {
  const box = panel(pt("pChartTitle"));
  const w = 420;
  const h = 230;
  const pad = { left: 46, right: 14, top: 14, bottom: 40 };
  const tMax = 4;
  const x = (l: number): number => pad.left + ((w - pad.left - pad.right) * l) / 2.5;
  const y = (t: number): number => pad.top + (h - pad.top - pad.bottom) * (1 - Math.min(t, tMax) / tMax);
  const list = state.measures.map((m) => `${metres(m.length)} → ${seconds(m.period)}`);
  const svg = drawing("discover-path physics-curve", w, h, pt("pChartAria", { list: list.join(", ") }));
  for (let t = 0; t <= tMax; t += 1) {
    shape(svg, "line", { x1: pad.left, x2: w - pad.right, y1: y(t), y2: y(t), class: "grid-line" });
    shape(svg, "text", { x: pad.left - 6, y: y(t) + 4, class: "axis-label", "text-anchor": "end" }, `${t} s`);
  }
  for (let l = 0; l <= 2.5; l += 0.5) {
    shape(svg, "line", { x1: x(l), x2: x(l), y1: pad.top, y2: h - pad.bottom, class: "grid-line" });
    shape(svg, "text", { x: x(l), y: h - pad.bottom + 18, class: "axis-label", "text-anchor": "middle" }, `${num(l, 1)} m`);
  }
  shape(svg, "text", { x: (pad.left + w - pad.right) / 2, y: h - 4, class: "axis-title", "text-anchor": "middle" }, pt("pChartAxis"));
  if (state.revealed) {
    const curve: [number, number][] = [];
    for (let l = 0; l <= 2.5001; l += 0.05) curve.push([x(l), y(smallAnglePeriod(l))]);
    shape(svg, "polyline", { points: points(curve), class: "theory-curve" });
    shape(svg, "text", { x: x(2.5) - 4, y: y(smallAnglePeriod(2.5)) - 8, class: "theory-label", "text-anchor": "end" }, pt("pChartTheory"));
  }
  for (const m of state.measures) shape(svg, "circle", { cx: x(m.length), cy: y(m.period), r: 3 + bobRadius(m.mass) / 3, class: "share-dot" });
  box.append(svg);
  return box;
}

// ---------------------------------------------------------------- 3. compare

function comparePanel(state: Lab): HTMLElement {
  const box = step(pt("stepCompare"), "discover-compare");
  box.append(el("h3", "discover-panel-title", pt("formulaTitle")), el("p", "discover-intro", pt("pTheoryText")));
  box.append(formula(`T = 2\\pi\\sqrt{\\frac{L}{g}},\\qquad g = ${String(G).replace(".", "{.}")}\\ \\mathrm{m\\,s^{-2}}`));
  box.append(el("p", "discover-intro", pt("pAngleText")));
  const rows = state.measures
    .slice(-10)
    .reverse()
    .map((m) => [metres(m.length), deg(m.angle), seconds(m.period, 3), seconds(smallAnglePeriod(m.length), 3), seconds(exactPeriod(m), 3)]);
  box.append(table("physics-check", [pt("pColLength"), pt("pColAngle"), pt("simulated"), pt("pColSmall"), pt("pColExact")], rows));

  box.append(el("h3", "discover-panel-title", pt("youTitle")));
  box.append(verdict(state.mass === "same" ? pt("pMassRight") : pt("pMassWrong", { answer: massLabel(state.mass!) }), state.mass === "same"));
  // Measurements that differ by the mass alone, if the learner made some.
  const groups = new Map<string, Measurement[]>();
  for (const m of state.measures) {
    const key = `${m.length}|${m.angle}`;
    groups.set(key, [...(groups.get(key) ?? []), m]);
  }
  const twins = [...groups.values()].find((g) => new Set(g.map((m) => m.mass)).size > 1);
  if (twins) {
    const masses = [...new Set(twins.map((m) => m.mass))].sort((a, b) => a - b).map(massText);
    box.append(verdict(pt("pMassShown", { length: num(twins[0]!.length, 2), masses: andList(masses), period: num(twins[0]!.period, 2) })));
  } else box.append(verdict(pt("pMassTry")));
  box.append(verdict(state.longer === "x2" ? pt("pLengthRight") : pt("pLengthWrong", { answer: lengthLabel(state.longer!) }), state.longer === "x2"));
  const wide = [...state.measures].sort((a, b) => b.angle - a.angle)[0]!;
  const extra = exactPeriod(wide) / smallAnglePeriod(wide.length) - 1;
  box.append(verdict(pt("pAngleNote", { angle: deg(wide.angle), pct: pct(extra) })));
  return box;
}
