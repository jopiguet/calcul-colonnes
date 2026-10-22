/**
 * Circuits, in five steps.
 *
 *   1. Predict   two bulbs in series, two in parallel: brighter, the same, dimmer?
 *   2. Connect   six circuits; bulbs that glow by their power; ammeters; unscrew a bulb
 *   3. Compare   every circuit, the series and parallel formulas, the predictions
 *   4. Explain   current is not used up; one path or several; the home
 *   5. Check     the current out of the second bulb
 *
 * The circuits are solved by nodal analysis (shared/discover/circuits.ts),
 * which `npm run check:physics` compares with the formulas and with
 * Kirchhoff's laws.
 */
import { CIRCUITS, VOLTAGE, solve, type BulbName, type CircuitId, type Solution } from "../../shared/discover/circuits";
import { el } from "../dom";
import type { User } from "../store";
import { checkPanel, choiceSet, explainPanel, mountLab, panel, reducedMotion, step } from "./lab";
import { andList, num, pct, pt, type PhysicsKey } from "./physics-i18n";
import { drawing, formula, gatedButton, mineLine, physicsHead, restartPanel, shape, table, verdict } from "./physics-ui";

type Brightness = "brighter" | "same" | "dimmer";
type CheckAnswer = "less" | "same" | "zero";

interface Lab {
  userId: number;
  step: "predict" | "lab";
  series: Brightness | null;
  parallel: Brightness | null;
  circuit: CircuitId;
  removed: BulbName[];
  visited: CircuitId[];
  revealed: boolean;
  check: CheckAnswer | null;
}

let lab: Lab | null = null;

const startLab = (userId: number): Lab => ({ userId, step: "predict", series: null, parallel: null, circuit: "one", removed: [], visited: ["one"], revealed: false, check: null });

export const circuitsBusy = (): boolean => lab !== null && lab.visited.length > 1 && lab.check === null;

const NAMES: Record<CircuitId, PhysicsKey> = { one: "cOne", series2: "cSeries2", series3: "cSeries3", parallel2: "cParallel2", parallel3: "cParallel3", mixed: "cMixed" };
const brightLabel = (b: Brightness): string => pt(b === "brighter" ? "cBrighter" : b === "same" ? "cSameBright" : "cDimmer");
const amps = (i: number): string => num(i, 3);
const isSeries = (c: CircuitId): boolean => c === "series2" || c === "series3";
const isParallel = (c: CircuitId): boolean => c === "parallel2" || c === "parallel3";

export function circuitsView(ctx: { user: User }): HTMLElement {
  if (!lab || lab.userId !== ctx.user.id) lab = startLab(ctx.user.id);
  return mountLab("is-circuits", (draw) => {
    const state = lab!;
    const head = physicsHead(pt("circuitsTitle"));
    return state.step === "predict" ? [head, predictPanel(state, draw)] : [head, ...labPanels(state, draw)];
  });
}

// ---------------------------------------------------------------- 1. predict

function predictPanel(state: Lab, draw: () => void): HTMLElement {
  const box = step(pt("stepPredict"));
  box.append(el("p", "discover-intro", pt("cIntro", { volts: VOLTAGE })));
  const choices = (legend: string, key: string, chosen: Brightness | null, pick: (b: Brightness) => void): HTMLElement =>
    choiceSet<Brightness>({
      cls: "discover-choices",
      legend,
      options: (["brighter", "same", "dimmer"] as const).map((v) => ({ value: v, label: brightLabel(v) })),
      chosen,
      key,
      onPick: (v) => (pick(v), draw()),
    });
  box.append(
    choices(pt("cPredictSeries"), "series", state.series, (v) => (state.series = v)),
    choices(pt("cPredictParallel"), "parallel", state.parallel, (v) => (state.parallel = v)),
  );
  box.append(
    ...gatedButton(pt("cPredictDone"), "predict-done", state.series !== null && state.parallel !== null, pt("cPredictNeeded"), () => {
      state.step = "lab";
      draw();
    }),
  );
  return box;
}

// ---------------------------------------------------------------- 2. connect

const W = 420;
const H = 260;
const TOP = 40;
const BOTTOM = 220;
const BAT_X = 50;

/** Where each bulb sits, how the wires run, and where the ammeters read. */
interface Plan {
  bulbs: Partial<Record<BulbName, [number, number, "h" | "v"]>>;
  wires: [number, number][][];
  meters: { at: [number, number]; of: "battery" | BulbName }[];
}

const PLANS: Record<CircuitId, Plan> = {
  one: {
    bulbs: { A: [360, 130, "v"] },
    wires: [[[BAT_X, TOP], [360, TOP], [360, BOTTOM], [BAT_X, BOTTOM]]],
    meters: [{ at: [200, TOP], of: "battery" }, { at: [200, BOTTOM], of: "A" }],
  },
  series2: {
    bulbs: { A: [160, TOP, "h"], B: [270, TOP, "h"] },
    wires: [[[BAT_X, TOP], [360, TOP], [360, BOTTOM], [BAT_X, BOTTOM]]],
    meters: [{ at: [105, TOP], of: "A" }, { at: [215, TOP], of: "A" }, { at: [360, 130], of: "B" }],
  },
  series3: {
    bulbs: { A: [130, TOP, "h"], B: [220, TOP, "h"], C: [310, TOP, "h"] },
    wires: [[[BAT_X, TOP], [375, TOP], [375, BOTTOM], [BAT_X, BOTTOM]]],
    meters: [{ at: [88, TOP], of: "A" }, { at: [175, TOP], of: "A" }, { at: [265, TOP], of: "B" }, { at: [375, 130], of: "C" }],
  },
  parallel2: {
    bulbs: { A: [210, 120, "v"], B: [340, 120, "v"] },
    wires: [
      [[BAT_X, TOP], [340, TOP], [340, BOTTOM], [BAT_X, BOTTOM]],
      [[210, TOP], [210, BOTTOM]],
    ],
    meters: [{ at: [120, TOP], of: "battery" }, { at: [210, 185], of: "A" }, { at: [340, 185], of: "B" }],
  },
  parallel3: {
    bulbs: { A: [170, 120, "v"], B: [265, 120, "v"], C: [360, 120, "v"] },
    wires: [
      [[BAT_X, TOP], [360, TOP], [360, BOTTOM], [BAT_X, BOTTOM]],
      [[170, TOP], [170, BOTTOM]],
      [[265, TOP], [265, BOTTOM]],
    ],
    meters: [{ at: [105, TOP], of: "battery" }, { at: [170, 185], of: "A" }, { at: [265, 185], of: "B" }, { at: [360, 185], of: "C" }],
  },
  mixed: {
    bulbs: { A: [140, TOP, "h"], B: [255, 120, "v"], C: [355, 120, "v"] },
    wires: [
      [[BAT_X, TOP], [355, TOP], [355, BOTTOM], [BAT_X, BOTTOM]],
      [[255, TOP], [255, BOTTOM]],
    ],
    meters: [{ at: [92, TOP], of: "A" }, { at: [200, TOP], of: "A" }, { at: [255, 185], of: "B" }, { at: [355, 185], of: "C" }],
  },
};

function currentOf(s: Solution, of: "battery" | BulbName): number {
  return of === "battery" ? s.battery : s.bulbs.find((b) => b.bulb === of)!.current;
}

function circuitDrawing(state: Lab, draw: () => void): SVGSVGElement {
  const s = solve(state.circuit, state.removed);
  const plan = PLANS[state.circuit];
  const list = s.bulbs.map((b) => (b.in ? pt("cBulbOn", { name: b.bulb, pct: pct(b.brightness, 0), amps: amps(b.current) }) : pt("cBulbOff", { name: b.bulb })));
  const svg = drawing("physics-circuit", W, H, pt("cDiagramAria", { name: pt(NAMES[state.circuit]), list: list.join(". "), amps: amps(s.battery) }));
  for (const wire of plan.wires) shape(svg, "polyline", { points: wire.map(([x, y]) => `${x},${y}`).join(" "), class: "circuit-wire" });
  shape(svg, "line", { x1: BAT_X, x2: BAT_X, y1: TOP, y2: 105, class: "circuit-wire" });
  shape(svg, "line", { x1: BAT_X, x2: BAT_X, y1: 155, y2: BOTTOM, class: "circuit-wire" });
  // The battery: long plate +, short plate −.
  shape(svg, "rect", { x: BAT_X - 20, y: 102, width: 40, height: 56, rx: 6, class: "circuit-battery-case" });
  shape(svg, "line", { x1: BAT_X - 14, x2: BAT_X + 14, y1: 120, y2: 120, class: "circuit-plate" });
  shape(svg, "line", { x1: BAT_X - 10, x2: BAT_X + 10, y1: 138, y2: 138, class: "circuit-plate is-short" });
  shape(svg, "text", { x: BAT_X + 24, y: 118, class: "axis-label" }, "+");
  shape(svg, "text", { x: BAT_X + 24, y: 146, class: "axis-label" }, "−");
  shape(svg, "text", { x: BAT_X - 24, y: 134, class: "axis-label", "text-anchor": "end" }, `${VOLTAGE} V`);

  for (const reading of s.bulbs) {
    const [x, y, along] = plan.bulbs[reading.bulb]!;
    const g = shape(svg, "g", { class: `circuit-bulb${reading.in ? "" : " is-out"}`, tabindex: 0, role: "button" });
    g.setAttribute("aria-label", reading.in ? pt("cBulbOn", { name: reading.bulb, pct: pct(reading.brightness, 0), amps: amps(reading.current) }) : pt("cBulbOff", { name: reading.bulb }));
    g.dataset.focus = `bulb-${reading.bulb}`;
    g.dataset.bulb = reading.bulb;
    if (reading.in && reading.brightness > 0.001) {
      shape(g, "circle", { cx: x, cy: y, r: 17 + 24 * Math.sqrt(reading.brightness), class: "circuit-glow", opacity: (0.2 + 0.6 * reading.brightness).toFixed(2) });
    }
    shape(g, "circle", { cx: x, cy: y, r: 16, class: "circuit-glass", "fill-opacity": reading.in ? (0.15 + 0.85 * Math.min(1, reading.brightness)).toFixed(2) : 0 });
    if (reading.in) shape(g, "path", { d: `M${x - 8},${y + 4} q4,-12 8,0 q4,-12 8,0`, class: "circuit-filament" });
    // The bulb's name beside it, off the wire.
    if (along === "h") shape(g, "text", { x, y: y - 22, class: "axis-label circuit-name", "text-anchor": "middle" }, reading.bulb);
    else shape(g, "text", { x: x + 22, y: y + 5, class: "axis-label circuit-name" }, reading.bulb);
    const toggleBulb = (): void => {
      const name = reading.bulb;
      state.removed = state.removed.includes(name) ? state.removed.filter((n) => n !== name) : [...state.removed, name];
      draw();
    };
    g.addEventListener("click", toggleBulb);
    g.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        toggleBulb();
      }
    });
  }
  for (const m of plan.meters) {
    const [x, y] = m.at;
    shape(svg, "circle", { cx: x, cy: y, r: 10, class: "circuit-meter" });
    shape(svg, "text", { x, y: y + 4, class: "circuit-meter-a", "text-anchor": "middle" }, "A");
    // The reading under a meter on a horizontal wire, to the left of one on a vertical wire.
    const flat = y === TOP || y === BOTTOM;
    shape(svg, "text", { x: flat ? x : x - 14, y: flat ? y + 26 : y + 4, class: "circuit-reading", "text-anchor": flat ? "middle" : "end" }, pt("cMeter", { amps: amps(Math.abs(currentOf(s, m.of))) }));
  }
  return svg;
}

function labPanels(state: Lab, draw: () => void): HTMLElement[] {
  const panels: HTMLElement[] = [];
  panels.push(mineLine([pt("cMineSeries", { answer: brightLabel(state.series!) }), pt("cMineParallel", { answer: brightLabel(state.parallel!) })]));
  const box = step(pt("cStep"));
  box.append(
    choiceSet<CircuitId>({
      cls: "discover-choices physics-circuits",
      legend: pt("cChoose"),
      options: CIRCUITS.map((c) => ({ value: c, label: pt(NAMES[c]) })),
      chosen: state.circuit,
      key: "circuit",
      onPick: (c) => {
        state.circuit = c;
        state.removed = [];
        if (!state.visited.includes(c)) state.visited = [...state.visited, c];
        draw();
      },
    }),
  );
  const picture = el("div", "physics-circuit-box");
  picture.append(circuitDrawing(state, draw));
  box.append(picture, el("p", "hint", pt("cUnscrew")));
  const s = solve(state.circuit, state.removed);
  const status = el("p", "discover-status");
  status.setAttribute("role", "status");
  const meters = PLANS[state.circuit].meters.map((m) => pt("cMeter", { amps: amps(Math.abs(currentOf(s, m.of))) }));
  status.append(pt("cReadings", { amps: amps(s.battery), list: andList(meters) }));
  box.append(status);
  panels.push(box);

  if (!state.revealed) {
    const ready = state.visited.some(isSeries) && state.visited.some(isParallel);
    const reveal = el("div", "discover-reveal");
    reveal.append(
      ...gatedButton(pt("reveal"), "reveal", ready, pt("cRevealHint"), () => {
        state.revealed = true;
        draw();
        document.querySelector(".discover-compare")?.scrollIntoView({ behavior: reducedMotion() ? "auto" : "smooth", block: "start" });
      }),
    );
    panels.push(reveal);
  } else {
    panels.push(
      comparePanel(state),
      explainPanel(pt("stepExplain"), [pt("cExplainUsed"), pt("cExplainSeries"), pt("cExplainParallel"), pt("cExplainHome")]),
      checkPanel<CheckAnswer>({
        title: pt("stepCheck"),
        question: pt("cCheckQuestion"),
        options: [
          { value: "less", label: pt("cCheckLess") },
          { value: "same", label: pt("cCheckSame") },
          { value: "zero", label: pt("cCheckZero") },
        ],
        right: "same",
        chosen: state.check,
        onChoose: (v) => ((state.check = v), draw()),
        rightText: pt("cCheckRight"),
        wrongText: pt("cCheckWrong"),
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
  const all = panel(pt("cTableTitle"));
  const rows = CIRCUITS.map((c) => {
    const s = solve(c);
    const shares = [...new Set(s.bulbs.map((b) => pct(b.brightness, 0)))];
    const each = shares.length === 1 ? shares[0]! : s.bulbs.map((b) => `${b.bulb} ${pct(b.brightness, 0)}`).join(", ");
    return [pt(NAMES[c]), each, `${amps(s.battery)} A`];
  });
  all.append(table("physics-circuits-table", [pt("cColCircuit"), pt("cColBulbs"), pt("cColBattery")], rows, (i) => CIRCUITS[i] === state.circuit));
  box.append(all);
  box.append(el("h3", "discover-panel-title", pt("formulaTitle")), el("p", "discover-intro", pt("cTheoryText")));
  box.append(formula("I = \\frac{U}{R},\\qquad P = U\\,I"));
  box.append(el("p", "discover-intro", pt("cSeriesFormula")), el("p", "discover-intro", pt("cParallelFormula")));
  box.append(el("h3", "discover-panel-title", pt("youTitle")));
  box.append(verdict(state.series === "dimmer" ? pt("cSeriesRight") : pt("cSeriesWrong", { answer: brightLabel(state.series!) }), state.series === "dimmer"));
  box.append(verdict(state.parallel === "same" ? pt("cParallelRight") : pt("cParallelWrong", { answer: brightLabel(state.parallel!) }), state.parallel === "same"));
  box.append(el("p", "stats-hint", pt("cFilament")));
  return box;
}

