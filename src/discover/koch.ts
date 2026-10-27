/**
 * The Koch snowflake, in five steps.
 *
 *   1. Predict   the perimeter after many steps; the area
 *   2. Try       the steps one by one; measuring the edge with smaller and smaller rulers
 *   3. Compare   the perimeter times 4/3, the area to 8/5, the dimension log 4 / log 3; the predictions
 *   4. Explain   unbounded and bounded; a series; between a line and a surface; coastlines
 *   5. Check     a coastline is longer with a shorter ruler
 *
 * The geometry is in shared/discover/fractals.ts; `npm run check:math` checks
 * the perimeter and area by summing the drawn polygon, and the dimension by
 * counting boxes.
 */
import { KOCH_AREA_LIMIT, KOCH_DIMENSION, kochFacts, kochSnowflake, rulerLength } from "../../shared/discover/fractals";
import { el } from "../dom";
import type { User } from "../store";
import { checkPanel, choiceSet, control, explainPanel, mountLab, panel, reducedMotion, step } from "./lab";
import { mt } from "./math-i18n";
import { num, pt } from "./physics-i18n";
import { drawing, formula, gatedButton, mineLine, physicsHead, points, restartPanel, shape, slider, table, verdict } from "./physics-ui";

export const MAX_STEP = 6;
export const STEPS_NEEDED = 4;
export const RULERS_NEEDED = 3;

type PerimeterAnswer = "limit" | "grows" | "shrinks";
type AreaAnswer = "grows" | "limit" | "shrinks";
type CheckAnswer = "same" | "longer" | "shorter";

interface Lab {
  userId: number;
  step: "predict" | "lab";
  perimeter: PerimeterAnswer | null;
  area: AreaAnswer | null;
  n: number;
  seen: number[];
  rulers: number[];
  revealed: boolean;
  check: CheckAnswer | null;
}

let lab: Lab | null = null;
const startLab = (userId: number): Lab => ({ userId, step: "predict", perimeter: null, area: null, n: 0, seen: [0], rulers: [], revealed: false, check: null });

export const kochBusy = (): boolean => lab !== null && lab.step === "lab" && lab.check === null && lab.seen.length > 1;

const perimeterLabel = (a: PerimeterAnswer): string => mt(a === "limit" ? "kPerimLimit" : a === "grows" ? "kPerimGrows" : "kPerimShrinks");
const areaLabel = (a: AreaAnswer): string => mt(a === "grows" ? "kAreaGrows" : a === "limit" ? "kAreaLimit" : "kAreaShrinks");

/** "1/27", "1". */
const third = (k: number): string => (k === 0 ? "1" : `1/${3 ** k}`);

export function kochView(ctx: { user: User }): HTMLElement {
  if (!lab || lab.userId !== ctx.user.id) lab = startLab(ctx.user.id);
  return mountLab("is-koch", (draw) => {
    const state = lab!;
    const head = physicsHead(mt("kochTitle"));
    return state.step === "predict" ? [head, predictPanel(state, draw)] : [head, ...labPanels(state, draw)];
  });
}

// ---------------------------------------------------------------- 1. predict

function predictPanel(state: Lab, draw: () => void): HTMLElement {
  const box = step(pt("stepPredict"));
  box.append(el("p", "discover-intro", mt("kIntro")), snowflake(1, mt("kIntroAria")));
  box.append(
    choiceSet<PerimeterAnswer>({
      cls: "discover-choices",
      legend: mt("kPredictPerimeter"),
      options: (["limit", "grows", "shrinks"] as const).map((v) => ({ value: v, label: perimeterLabel(v) })),
      chosen: state.perimeter,
      key: "perimeter",
      onPick: (v) => ((state.perimeter = v), draw()),
    }),
    choiceSet<AreaAnswer>({
      cls: "discover-choices",
      legend: mt("kPredictArea"),
      options: (["grows", "limit", "shrinks"] as const).map((v) => ({ value: v, label: areaLabel(v) })),
      chosen: state.area,
      key: "area",
      onPick: (v) => ((state.area = v), draw()),
    }),
  );
  box.append(
    ...gatedButton(mt("kPredictDone"), "predict-done", state.perimeter !== null && state.area !== null, mt("predictNeeded"), () => {
      state.step = "lab";
      draw();
    }),
  );
  return box;
}

// ---------------------------------------------------------------- 2. try

const SIZE = 320;

/** The snowflake at step n, with the triangle it started from dashed. */
function snowflake(n: number, aria: string): SVGSVGElement {
  const svg = drawing("math-drawing math-koch", SIZE, SIZE, aria);
  const h = Math.sqrt(3) / 2;
  // The limit spans x 0…1 and y −h/3…h: centred.
  const scale = 240;
  const ox = (SIZE - scale) / 2;
  const oy = (SIZE - scale * (h + h / 3)) / 2 + (scale * h) / 3;
  const map = ([x, y]: [number, number]): [number, number] => [ox + x * scale, oy + y * scale];
  shape(svg, "polygon", { points: points(kochSnowflake(n).map(map)), class: "math-flake" });
  if (n > 0) shape(svg, "polygon", { points: points(kochSnowflake(0).map(map)), class: "math-flake-start" });
  return svg;
}

function labPanels(state: Lab, draw: () => void): HTMLElement[] {
  const panels: HTMLElement[] = [];
  panels.push(mineLine([mt("kMinePerimeter", { answer: perimeterLabel(state.perimeter!) }), mt("kMineArea", { answer: areaLabel(state.area!) })]));

  const box = step(mt("kStep"));
  const figure = el("figure", "astro-figure math-figure");
  const status = el("p", "discover-status");
  status.setAttribute("role", "status");
  const seenTable = el("div", "math-seen");
  const show = (): void => {
    const f = kochFacts(state.n);
    figure.replaceChildren(snowflake(state.n, mt("kAria", { n: state.n, sides: num(f.segments, 0) })));
    status.replaceChildren(
      el("strong", "", mt("kStatus", { n: state.n, sides: num(f.segments, 0), side: third(state.n) })),
      el("span", "", ` ${mt("kStatusMeasures", { perimeter: num(f.perimeter, 2), area: num(f.areaRatio, 3) })}`),
    );
    const rows = [...state.seen].sort((a, b) => a - b).map((k) => {
      const g = kochFacts(k);
      return [String(k), num(g.segments, 0), third(k), num(g.perimeter, 2), num(g.areaRatio, 3)];
    });
    seenTable.replaceChildren(table("math-koch-table", [mt("kColStep"), mt("kColSides"), mt("kColSide"), mt("kColPerimeter"), mt("kColArea")], rows, (i) => [...state.seen].sort((a, b) => a - b)[i] === state.n));
  };
  show();
  let gated = state.seen.length >= STEPS_NEEDED;
  box.append(
    figure,
    slider({
      label: mt("kSlider"),
      key: "n",
      min: 0,
      max: MAX_STEP,
      step: 1,
      value: state.n,
      format: (v) => String(v),
      onInput: (v) => {
        state.n = v;
        if (!state.seen.includes(v)) state.seen = [...state.seen, v];
        show();
        if (!gated && state.seen.length >= STEPS_NEEDED) {
          gated = true;
          draw();
        }
      },
    }),
    status,
    el("p", "hint", mt("kTableHint")),
    seenTable,
  );
  panels.push(box);

  // Measuring the edge: the shorter the ruler, the longer the edge.
  const ruler = panel(mt("kRulerTitle"), mt("kRulerHint"));
  const buttons = el("div", "discover-roll math-rulers");
  for (let k = 0; k <= 5; k++) {
    buttons.append(
      control(state.rulers.includes(k) ? "segment on" : "segment", mt("kRulerButton", { ruler: third(k) }), `ruler-${k}`, () => {
        if (!state.rulers.includes(k)) state.rulers = [...state.rulers, k];
        draw();
      }),
    );
  }
  ruler.append(buttons);
  if (state.rulers.length > 0) {
    const rows = [...state.rulers].sort((a, b) => a - b).map((k) => {
      const r = rulerLength(k);
      return [third(k), num(r.steps, 0), num(r.length, 2)];
    });
    ruler.append(table("math-ruler-table", [mt("kColRuler"), mt("kColSteps"), mt("kColLength")], rows));
  }
  panels.push(ruler);

  const ready = state.seen.length >= STEPS_NEEDED && state.rulers.length >= RULERS_NEEDED;
  if (!state.revealed) {
    const reveal = el("div", "discover-reveal");
    reveal.append(
      ...gatedButton(pt("reveal"), "reveal", ready, mt("kRevealHint", { steps: STEPS_NEEDED, rulers: RULERS_NEEDED }), () => {
        state.revealed = true;
        draw();
        document.querySelector(".discover-compare")?.scrollIntoView({ behavior: reducedMotion() ? "auto" : "smooth", block: "start" });
      }),
    );
    panels.push(reveal);
  } else {
    panels.push(
      comparePanel(state),
      explainPanel(pt("stepExplain"), [mt("kExplainPerimeter"), mt("kExplainArea"), mt("kExplainDimension"), mt("kExplainCoast")]),
      checkPanel<CheckAnswer>({
        title: pt("stepCheck"),
        question: mt("kCheckQuestion"),
        options: [
          { value: "same", label: mt("kCheckSame") },
          { value: "longer", label: mt("kCheckLonger") },
          { value: "shorter", label: mt("kCheckShorter") },
        ],
        right: "longer",
        chosen: state.check,
        onChoose: (v) => ((state.check = v), draw()),
        rightText: mt("kCheckRight"),
        wrongText: mt("kCheckWrong"),
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
  box.append(el("h3", "discover-panel-title", pt("formulaTitle")), el("p", "discover-intro", mt("kTheoryPerimeter")));
  box.append(formula(`P_n = 3\\left(\\tfrac{4}{3}\\right)^n \\xrightarrow[n\\to\\infty]{} \\infty`));
  box.append(el("p", "discover-intro", mt("kTheoryArea")));
  box.append(formula(`A_n = A_0\\left(\\tfrac{8}{5} - \\tfrac{3}{5}\\left(\\tfrac{4}{9}\\right)^{n}\\right) \\to \\tfrac{8}{5}A_0`));
  box.append(el("p", "discover-intro", mt("kTheoryDimension", { d: num(KOCH_DIMENSION, 2) })));
  box.append(formula(`D = \\frac{\\log 4}{\\log 3} \\approx ${num(KOCH_DIMENSION, 4).replace(",", "{,}")}`));
  box.append(el("p", "discover-intro", mt("kTheoryHundred", { area: num(KOCH_AREA_LIMIT, 1) })));
  box.append(el("h3", "discover-panel-title", pt("youTitle")));
  box.append(
    verdict(state.perimeter === "grows" ? mt("kPerimRight") : mt("kPerimWrong", { answer: perimeterLabel(state.perimeter!) }), state.perimeter === "grows"),
    verdict(state.area === "limit" ? mt("kAreaRight") : mt("kAreaWrong", { answer: areaLabel(state.area!) }), state.area === "limit"),
  );
  return box;
}
