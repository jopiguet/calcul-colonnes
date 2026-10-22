/**
 * Throw a ball: the anchor of the physics playground, in five steps.
 *
 *   1. Predict   the angle that goes farthest; where a throw at 30° lands (a flag)
 *   2. Throw     angle, speed and height; the flight drawn as it happens; every throw in a table
 *   3. Compare   distance against angle, the formulas, the simulation against them, the predictions
 *   4. Explain   two motions in one; 45°; mass
 *   5. Check     a dropped marble and a pushed one: which lands first? A multi-flash picture
 *
 * The flight is integrated step by step (shared/discover/projectile.ts) and
 * checked against the exact formulas by `npm run check:physics`.
 */
import { G, bestAngle, dropAndThrow, exactFlight, groundRange, simulate, type Launch } from "../../shared/discover/projectile";
import { el } from "../dom";
import type { User } from "../store";
import { checkPanel, choiceSet, control, createAnimator, explainPanel, mountLab, panel, reducedMotion, step } from "./lab";
import { deg, num, pt } from "./physics-i18n";
import { drawing, formula, gatedButton, mineLine, physicsHead, points, restartPanel, shape, slider, table, verdict } from "./physics-ui";

/** The throw of the predictions. */
export const SCENARIO: Launch = { speed: 15, angle: 30, height: 0 };
export const ANGLE_CHOICES = [15, 30, 45, 60, 75];
/** Throws before the comparison is offered. */
export const REVEAL_AFTER = 3;

type CheckAnswer = "dropped" | "thrown" | "same";

interface Throw extends Launch {
  range: number;
  time: number;
  apex: number;
  /** The flight, sampled for drawing: [x, y]. */
  path: [number, number][];
}

interface Lab {
  userId: number;
  step: "predict" | "lab";
  best: number | null;
  flag: number;
  launch: Launch;
  throws: Throw[];
  revealed: boolean;
  check: CheckAnswer | null;
}

let lab: Lab | null = null;
const animator = createAnimator();

const startLab = (userId: number): Lab => ({ userId, step: "predict", best: null, flag: 10, launch: { ...SCENARIO }, throws: [], revealed: false, check: null });

export const throwBusy = (): boolean => lab !== null && lab.throws.length > 0 && lab.check === null;

export function throwView(ctx: { user: User }): HTMLElement {
  if (!lab || lab.userId !== ctx.user.id) lab = startLab(ctx.user.id);
  return mountLab("is-throw", (draw) => {
    const state = lab!;
    const head = physicsHead(pt("throwTitle"));
    return state.step === "predict" ? [head, predictPanel(state, draw)] : [head, ...labPanels(state, draw)];
  });
}

const metres = (d: number): string => `${num(d)} m`;
const isScenario = (l: Launch): boolean => l.speed === SCENARIO.speed && l.angle === SCENARIO.angle && l.height === SCENARIO.height;

// ---------------------------------------------------------------- 1. predict

function predictPanel(state: Lab, draw: () => void): HTMLElement {
  const box = step(pt("stepPredict"));
  box.append(el("p", "discover-intro", pt("tIntro")));
  box.append(
    choiceSet<number>({
      cls: "discover-choices physics-angles",
      legend: pt("tPredictBest"),
      options: ANGLE_CHOICES.map((a) => ({ value: a, label: deg(a) })),
      chosen: state.best,
      key: "best",
      onPick: (value) => {
        state.best = value;
        draw();
      },
    }),
  );
  box.append(
    slider({
      label: pt("tPredictFlag"),
      key: "flag",
      min: 0,
      max: 40,
      step: 0.5,
      value: state.flag,
      format: (d) => pt("tFlagValue", { d: num(d) }),
      onInput: (d) => {
        state.flag = d;
      },
    }),
  );
  box.append(
    ...gatedButton(pt("tPredictDone"), "predict-done", state.best !== null, pt("tPredictNeeded"), () => {
      state.step = "lab";
      draw();
    }),
  );
  return box;
}

// ---------------------------------------------------------------- 2. throw

/** The field's scale: metres to pixels, the same on both axes so the path has its true shape. */
interface Scale {
  width: number;
  height: number;
  x: (m: number) => number;
  y: (m: number) => number;
  maxX: number;
}

const W = 420;
const PAD = { left: 16, right: 16, top: 14, bottom: 30 };

function scaleFor(state: Lab): Scale {
  const now = exactFlight(state.launch);
  const far = Math.max(30, state.flag + 2, now.range + 2, ...state.throws.slice(-5).map((t) => t.range + 2));
  const maxX = Math.ceil(far / 5) * 5;
  const high = Math.max(6, state.launch.height + 1, now.apex + 1, ...state.throws.slice(-5).map((t) => t.apex + 1));
  const k = Math.min((W - PAD.left - PAD.right) / maxX, 300 / high);
  const height = PAD.top + high * k + PAD.bottom;
  return { width: W, height, maxX, x: (m) => PAD.left + m * k, y: (m) => height - PAD.bottom - m * k };
}

/** The field: ground, distances, the flag, earlier flights, the thrower and the aim. */
function field(state: Lab, scale?: Scale): SVGSVGElement {
  const s = scale ?? scaleFor(state);
  const last = state.throws.at(-1);
  const status = last ? pt("tFieldLanded", { d: num(last.range), flag: num(state.flag) }) : pt("tFieldIdle", { flag: num(state.flag) });
  const svg = drawing("physics-field", s.width, s.height, pt("tFieldAria", { status }));
  shape(svg, "rect", { x: 0, y: s.y(0), width: s.width, height: PAD.bottom, class: "field-ground" });
  const every = s.maxX > 60 ? 10 : 5;
  for (let m = 0; m <= s.maxX; m += every) {
    shape(svg, "line", { x1: s.x(m), x2: s.x(m), y1: s.y(0), y2: s.y(0) + 6, class: "field-tick" });
    shape(svg, "text", { x: s.x(m), y: s.y(0) + 20, class: "axis-label", "text-anchor": m === 0 ? "start" : "middle" }, `${m} m`);
  }
  // The flag of the prediction.
  const fx = s.x(state.flag);
  shape(svg, "line", { x1: fx, x2: fx, y1: s.y(0), y2: s.y(0) - 34, class: "field-pole" });
  shape(svg, "path", { d: `M${fx},${s.y(0) - 34} l18,6 l-18,6 z`, class: "field-flag" });
  // Earlier flights, faded; the last one marked where it landed.
  const shown = state.throws.slice(-5);
  shown.forEach((t, i) => {
    const latest = i === shown.length - 1;
    shape(svg, "polyline", { points: points(t.path.map(([x, y]) => [s.x(x), s.y(y)])), class: latest ? "field-path is-last" : "field-path" });
    shape(svg, "circle", { cx: s.x(t.range), cy: s.y(0), r: latest ? 4 : 3, class: latest ? "field-landing is-last" : "field-landing" });
    if (latest) shape(svg, "text", { x: s.x(t.range), y: s.y(0) - 8, class: "field-distance", "text-anchor": "middle" }, metres(t.range));
  });
  // The thrower's stand, and the aim: direction and speed.
  const l = state.launch;
  if (l.height > 0) shape(svg, "rect", { x: s.x(0) - 6, y: s.y(l.height), width: 12, height: s.y(0) - s.y(l.height), class: "field-stand" });
  const r = (l.angle * Math.PI) / 180;
  const len = 1.6 * l.speed;
  shape(svg, "line", { x1: s.x(0), y1: s.y(l.height), x2: s.x(0) + len * Math.cos(r), y2: s.y(l.height) - len * Math.sin(r), class: "field-aim" });
  shape(svg, "polyline", { points: "", class: "field-path is-live" });
  shape(svg, "circle", { cx: s.x(0), cy: s.y(l.height) - 5, r: 5, class: "field-ball" });
  return svg;
}

/** Throws the ball: the flight is computed at once, then shown in real time. */
async function throwBall(state: Lab, draw: () => void): Promise<void> {
  const l = { ...state.launch };
  const flight = simulate(l);
  // Every 1/30 s of the flight, for the drawing and the animation.
  const path = flight.points.filter((_, i) => i % 8 === 0).map(([, x, y]) => [x, y] as [number, number]);
  path.push([flight.range, 0]);
  const t: Throw = { ...l, range: flight.range, time: flight.time, apex: flight.apex, path };
  // The field is drawn to fit this throw before it flies.
  const before = state.throws;
  const s = scaleFor({ ...state, throws: [...before, t] });
  if (!reducedMotion()) document.querySelector(".physics-field")?.replaceWith(field(state, s));
  state.throws = [...before, t];
  const done = await animator.run(
    path.map((_, i) => i),
    (i) => {
      const live = document.querySelector<SVGPolylineElement>(".physics-field .is-live");
      const ball = document.querySelector<SVGCircleElement>(".physics-field .field-ball");
      if (!live || !ball) return;
      const now = path.slice(0, i + 1).map(([x, y]) => [s.x(x), s.y(y)] as [number, number]);
      live.setAttribute("points", points(now));
      const [bx, by] = now.at(-1)!;
      ball.setAttribute("cx", String(bx));
      ball.setAttribute("cy", String(by - 5));
    },
    1000 / 30,
  );
  if (done) draw();
}

function labPanels(state: Lab, draw: () => void): HTMLElement[] {
  const panels: HTMLElement[] = [];
  panels.push(mineLine([pt("tMineBest", { angle: deg(state.best ?? 45) }), pt("tMineFlag", { d: num(state.flag) })]));

  const box = step(pt("tStep"));
  const fieldBox = el("div", "physics-field-box");
  fieldBox.append(field(state));
  box.append(fieldBox);
  const redrawField = (): void => {
    fieldBox.replaceChildren(field(state));
  };
  const controls = el("div", "physics-controls");
  controls.append(
    slider({ label: pt("tAngle"), key: "angle", min: 5, max: 85, step: 1, value: state.launch.angle, format: deg, onInput: (v) => ((state.launch.angle = v), redrawField()) }),
    slider({ label: pt("tSpeed"), key: "speed", min: 5, max: 25, step: 1, value: state.launch.speed, format: (v) => `${v} m/s`, onInput: (v) => ((state.launch.speed = v), redrawField()) }),
    slider({ label: pt("tHeight"), key: "height", min: 0, max: 20, step: 0.5, value: state.launch.height, format: metres, onInput: (v) => ((state.launch.height = v), redrawField()) }),
  );
  box.append(controls);
  box.append(control("primary physics-go", pt("tThrow"), "throw", () => void throwBall(state, draw)));

  const last = state.throws.at(-1);
  const status = el("p", "discover-status");
  status.setAttribute("role", "status");
  if (last) {
    status.append(el("strong", "", pt("tLanded", { d: num(last.range), t: num(last.time, 2) })));
    if (isScenario(last)) {
      const gap = last.range - state.flag;
      status.append(" ", Math.abs(gap) < 0.25 ? pt("tOnFlag") : gap > 0 ? pt("tVsFlag", { gap: num(gap) }) : pt("tVsFlagShort", { gap: num(-gap) }));
    }
  }
  box.append(status);
  if (!last || !isScenario(last)) box.append(el("p", "hint", pt("tFlagNote")));
  panels.push(box);

  if (state.throws.length > 0) panels.push(throwsTable(state));

  if (!state.revealed) {
    const reveal = el("div", "discover-reveal");
    reveal.append(
      ...gatedButton(pt("reveal"), "reveal", state.throws.length >= REVEAL_AFTER, pt("tRevealHint"), () => {
        state.revealed = true;
        draw();
        document.querySelector(".discover-compare")?.scrollIntoView({ behavior: reducedMotion() ? "auto" : "smooth", block: "start" });
      }),
    );
    panels.push(reveal);
  } else {
    panels.push(
      comparePanel(state),
      explainPanel(pt("stepExplain"), [pt("tExplainSplit"), pt("tExplainSymmetric"), pt("tExplainBest"), pt("tExplainMass")]),
      checkStep(state, draw),
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

function throwsTable(state: Lab): HTMLElement {
  const box = panel(pt("tThrowsTitle"));
  const rows = state.throws
    .slice(-8)
    .reverse()
    .map((t) => [deg(t.angle), `${t.speed} m/s`, metres(t.height), metres(t.range), `${num(t.time, 2)} s`, metres(t.apex)]);
  box.append(table("physics-throws", [pt("tColAngle"), pt("tColSpeed"), pt("tColHeight"), pt("tColRange"), pt("tColTime"), pt("tColApex")], rows, (i) => i === 0));
  return box;
}

// ---------------------------------------------------------------- 3. compare

/** Distance against angle at the current speed and height: the exact curve and the throws made with them. */
function rangeCurve(state: Lab): HTMLElement {
  const { speed, height } = state.launch;
  const best = bestAngle(speed, height);
  const far = exactFlight({ speed, angle: best, height }).range;
  const box = panel(pt("tCurveTitle", { speed, height: num(height) }));
  const w = 420;
  const h = 230;
  const pad = { left: 46, right: 14, top: 14, bottom: 40 };
  const yMax = Math.ceil((far * 1.1) / 5) * 5;
  const x = (a: number): number => pad.left + ((w - pad.left - pad.right) * a) / 90;
  const y = (d: number): number => pad.top + (h - pad.top - pad.bottom) * (1 - d / yMax);
  const svg = drawing("discover-path physics-curve", w, h, pt("tCurveAria", { angle: deg(best), d: num(far) }));
  for (let d = 0; d <= yMax; d += yMax > 40 ? 10 : 5) {
    shape(svg, "line", { x1: pad.left, x2: w - pad.right, y1: y(d), y2: y(d), class: "grid-line" });
    shape(svg, "text", { x: pad.left - 6, y: y(d) + 4, class: "axis-label", "text-anchor": "end" }, `${d} m`);
  }
  for (let a = 0; a <= 90; a += 15) {
    shape(svg, "line", { x1: x(a), x2: x(a), y1: pad.top, y2: h - pad.bottom, class: "grid-line" });
    shape(svg, "text", { x: x(a), y: h - pad.bottom + 18, class: "axis-label", "text-anchor": "middle" }, deg(a));
  }
  shape(svg, "text", { x: (pad.left + w - pad.right) / 2, y: h - 4, class: "axis-title", "text-anchor": "middle" }, pt("tCurveAxis"));
  const curve: [number, number][] = [];
  for (let a = 0; a <= 90; a += 1) curve.push([x(a), y(exactFlight({ speed, angle: a, height }).range)]);
  shape(svg, "polyline", { points: points(curve), class: "theory-curve" });
  shape(svg, "line", { x1: x(best), x2: x(best), y1: y(far), y2: h - pad.bottom, class: "theory-line" });
  shape(svg, "text", { x: x(best) + 6, y: y(far) - 4, class: "theory-label" }, pt("tCurveBest", { angle: deg(best) }));
  for (const t of state.throws) {
    if (t.speed === speed && t.height === height) shape(svg, "circle", { cx: x(t.angle), cy: y(t.range), r: 5, class: "share-dot" });
  }
  box.append(svg);
  return box;
}

function comparePanel(state: Lab): HTMLElement {
  const box = step(pt("stepCompare"), "discover-compare");
  box.append(rangeCurve(state));

  box.append(el("h3", "discover-panel-title", pt("formulaTitle")), el("p", "discover-intro", pt("tTheoryText")));
  box.append(formula(`R = \\frac{v^{2}\\sin 2\\theta}{g},\\qquad g = ${String(G).replace(".", "{.}")}\\ \\mathrm{m\\,s^{-2}}`));
  box.append(formula(`x(t) = v\\cos\\theta\\;t`), formula(`y(t) = h + v\\sin\\theta\\;t - \\tfrac{1}{2}gt^{2}`));
  const rows = state.throws
    .slice(-8)
    .reverse()
    .map((t) => [deg(t.angle), `${t.speed} m/s`, metres(t.height), `${num(t.range, 3)} m`, `${num(exactFlight(t).range, 3)} m`]);
  box.append(table("physics-check", [pt("tColAngle"), pt("tColSpeed"), pt("tColHeight"), pt("simulated"), pt("formula")], rows));
  box.append(el("p", "stats-hint", pt("tCheckSim")));

  box.append(el("h3", "discover-panel-title", pt("youTitle")));
  const best = state.best ?? 45;
  box.append(verdict(best === 45 ? pt("tBestRight") : pt("tBestWrong", { angle: deg(best) }), best === 45));
  // Complementary angles: from the learner's own throws if there is a pair, otherwise 30° and 60°.
  const pair = state.throws.find((a) => a.height === 0 && a.angle < 45 && state.throws.some((b) => b.height === 0 && b.speed === a.speed && b.angle === 90 - a.angle));
  box.append(verdict(pt("tTwins", { a: deg(pair?.angle ?? 30), b: deg(pair ? 90 - pair.angle : 60) })));
  const d = groundRange(SCENARIO.speed, SCENARIO.angle);
  box.append(verdict(pt("tFlagVerdict", { flag: num(state.flag), d: num(d) }), Math.abs(state.flag - d) <= 1.5));
  return box;
}

// ---------------------------------------------------------------- 5. check

/** Two marbles from a table 1.2 m high, one dropped, one pushed at 3 m/s: a flash every 0.05 s. */
function strobe(): HTMLElement {
  const box = panel(pt("tStrobeTitle"));
  const shots = dropAndThrow(1.2, 3, 0.05);
  const range = shots.at(-1)!.thrown[0];
  const w = 420;
  const k = 180 / 1.3;
  const h = 1.3 * k + 30;
  const x = (m: number): number => 40 + m * k;
  const y = (m: number): number => h - 20 - m * k;
  const svg = drawing("physics-strobe", w, h, pt("tStrobeAria"));
  shape(svg, "rect", { x: 0, y: y(1.2), width: x(0) - 7, height: y(0) - y(1.2), class: "field-stand" });
  shape(svg, "line", { x1: 0, x2: w, y1: y(0), y2: y(0), class: "field-tick" });
  for (const shot of shots.slice(0, -1)) {
    shape(svg, "line", { x1: x(0), x2: x(shot.thrown[0]), y1: y(shot.thrown[1]), y2: y(shot.thrown[1]), class: "strobe-level" });
    shape(svg, "circle", { cx: x(0), cy: y(shot.dropped[1]), r: 5, class: "strobe-dropped" });
    shape(svg, "circle", { cx: x(shot.thrown[0]), cy: y(shot.thrown[1]), r: 5, class: "strobe-thrown" });
  }
  shape(svg, "circle", { cx: x(0), cy: y(0) - 5, r: 5, class: "strobe-dropped" });
  shape(svg, "circle", { cx: x(range), cy: y(0) - 5, r: 5, class: "strobe-thrown" });
  box.append(svg, el("p", "stats-hint", pt("tStrobeNote")));
  return box;
}

function checkStep(state: Lab, draw: () => void): HTMLElement {
  const box = checkPanel<CheckAnswer>({
    title: pt("stepCheck"),
    question: pt("tCheckQuestion"),
    options: [
      { value: "dropped", label: pt("tCheckDropped") },
      { value: "thrown", label: pt("tCheckThrown") },
      { value: "same", label: pt("tCheckSame") },
    ],
    right: "same",
    chosen: state.check,
    onChoose: (value) => {
      state.check = value;
      draw();
    },
    rightText: pt("tCheckRight"),
    wrongText: pt("tCheckWrong"),
  });
  if (state.check !== null) box.append(strobe());
  return box;
}
