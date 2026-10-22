/**
 * Why cells are small, in five steps.
 *
 *   1. Predict   the surface-to-volume ratio of a cell twice as wide; diffusion over 100 times the distance
 *   2. Try       a cube-shaped cell from 1 µm to 1 mm, cut into smaller cubes; surface, volume, oxygen's time to the centre
 *   3. Compare   6/s and x²/2D; the readings; the predictions
 *   4. Explain   the ratio; diffusion; dividing; big organisms
 *   5. Check     an elephant's cells and a mouse's
 *
 * The formulas are in shared/discover/cells.ts; `npm run check:biology`
 * checks them by counting faces and with seeded random walks.
 */
import { diffusionTime, duration, ratio, splitSurface, surface, volume } from "../../shared/discover/cells";
import { el } from "../dom";
import type { User } from "../store";
import { checkPanel, choiceSet, control, explainPanel, mountLab, panel, reducedMotion, step } from "./lab";
import { bt } from "./bio-i18n";
import { locale, pt } from "./physics-i18n";
import { drawing, formula, gatedButton, mineLine, physicsHead, points, restartPanel, shape, slider, table, verdict } from "./physics-ui";

export const REVEAL_AFTER = 3;

type RatioAnswer = "double" | "same" | "half";
type TimeAnswer = "100" | "10000" | "same";
type CheckAnswer = "same" | "thousand" | "bigger";

interface Reading {
  exponent: number;
  split: number;
}

interface Lab {
  userId: number;
  step: "predict" | "lab";
  ratio: RatioAnswer | null;
  time: TimeAnswer | null;
  exponent: number;
  split: number;
  readings: Reading[];
  revealed: boolean;
  check: CheckAnswer | null;
}

let lab: Lab | null = null;

const startLab = (userId: number): Lab => ({ userId, step: "predict", ratio: null, time: null, exponent: -5, split: 1, readings: [], revealed: false, check: null });

export const cellsBusy = (): boolean => lab !== null && lab.readings.length > 0 && lab.check === null;

const ratioLabel = (a: RatioAnswer): string => bt(a === "double" ? "cRatioDouble" : a === "same" ? "cRatioSame" : "cRatioHalf");
const timeLabel = (a: TimeAnswer): string => bt(a === "100" ? "cTime100" : a === "10000" ? "cTime10000" : "cTimeSame");

/** Three significant figures, in the interface's language. */
export const sig3 = (x: number): string => new Intl.NumberFormat(locale(), { maximumSignificantDigits: 3 }).format(x);
/** The side, from the slider's power of ten (metres). */
export const sideOf = (exponent: number): number => 10 ** exponent;
/** A length in µm, or mm from 1 mm. */
export const lengthText = (m: number): string => (m >= 1e-3 - 1e-12 ? `${sig3(m * 1e3)} mm` : `${sig3(m * 1e6)} µm`);
export const timeText = (seconds: number): string => {
  const [v, unit] = duration(seconds);
  return bt(`unit_${unit}` as never, { v: sig3(v) });
};

export function cellsView(ctx: { user: User }): HTMLElement {
  if (!lab || lab.userId !== ctx.user.id) lab = startLab(ctx.user.id);
  return mountLab("is-cells", (draw) => {
    const state = lab!;
    const head = physicsHead(bt("cellsTitle"));
    return state.step === "predict" ? [head, predictPanel(state, draw)] : [head, ...labPanels(state, draw)];
  });
}

// ---------------------------------------------------------------- 1. predict

function predictPanel(state: Lab, draw: () => void): HTMLElement {
  const box = step(pt("stepPredict"));
  box.append(el("p", "discover-intro", bt("cIntro")));
  box.append(
    choiceSet<RatioAnswer>({
      cls: "discover-choices",
      legend: bt("cPredictRatio"),
      options: (["double", "same", "half"] as const).map((v) => ({ value: v, label: ratioLabel(v) })),
      chosen: state.ratio,
      key: "ratio",
      onPick: (v) => ((state.ratio = v), draw()),
    }),
    choiceSet<TimeAnswer>({
      cls: "discover-choices",
      legend: bt("cPredictTime"),
      options: (["100", "10000", "same"] as const).map((v) => ({ value: v, label: timeLabel(v) })),
      chosen: state.time,
      key: "time",
      onPick: (v) => ((state.time = v), draw()),
    }),
  );
  box.append(
    ...gatedButton(bt("cPredictDone"), "predict-done", state.ratio !== null && state.time !== null, bt("cPredictNeeded"), () => {
      state.step = "lab";
      draw();
    }),
  );
  return box;
}

// ---------------------------------------------------------------- 2. try

const W = 240;
const H = 220;

/** An isometric cube, its three visible faces cut into n × n squares. */
function cubeDrawing(side: number, n: number): SVGSVGElement {
  const svg = drawing("bio-cube", W, H, bt("cCubeAria", { side: lengthText(side), count: n ** 3 }));
  const a = 78; // edge on screen
  // The front bottom corner: the cube rises two edges above it on screen.
  const o: [number, number] = [W / 2, H - 28];
  const ex: [number, number] = [a * Math.cos(Math.PI / 6), a * Math.sin(Math.PI / 6)];
  const ey: [number, number] = [-a * Math.cos(Math.PI / 6), a * Math.sin(Math.PI / 6)];
  const ez: [number, number] = [0, -a];
  const p = (x: number, y: number, z: number): [number, number] => [o[0] + x * ex[0] + y * ey[0] + z * ez[0], o[1] + x * ex[1] + y * ey[1] + z * ez[1]];
  // Top (z = 1), left (y = 1), right (x = 1), seen from the front corner (0, 0).
  const faces: { cls: string; at: (u: number, v: number) => [number, number] }[] = [
    { cls: "is-top", at: (u, v) => p(-u, -v, 1) },
    { cls: "is-left", at: (u, v) => p(-u, 0, v) },
    { cls: "is-right", at: (u, v) => p(0, -u, v) },
  ];
  for (const f of faces) {
    shape(svg, "polygon", { points: points([f.at(0, 0), f.at(1, 0), f.at(1, 1), f.at(0, 1)]), class: `bio-face ${f.cls}` });
    for (let k = 1; k < n; k++) {
      const t = k / n;
      shape(svg, "line", { x1: f.at(t, 0)[0], y1: f.at(t, 0)[1], x2: f.at(t, 1)[0], y2: f.at(t, 1)[1], class: "bio-cut" });
      shape(svg, "line", { x1: f.at(0, t)[0], y1: f.at(0, t)[1], x2: f.at(1, t)[0], y2: f.at(1, t)[1], class: "bio-cut" });
    }
  }
  shape(svg, "text", { x: W / 2, y: H - 6, class: "axis-label", "text-anchor": "middle" }, lengthText(side));
  return svg;
}

function readingsText(side: number, n: number): { main: string; time: string; split: string | null } {
  const um = side * 1e6;
  const small = side / n;
  return {
    main: bt("cReadings", {
      surface: `${sig3(splitSurface(um, n))} µm²`,
      volume: `${sig3(volume(um))} µm³`,
      ratio: `${sig3((n * surface(um)) / volume(um))} µm⁻¹`,
    }),
    time: bt("cDiffusion", { time: timeText(diffusionTime(small / 2)) }),
    split: n > 1 ? bt("cSplitNote", { count: n ** 3, times: n }) : null,
  };
}

function labPanels(state: Lab, draw: () => void): HTMLElement[] {
  const panels: HTMLElement[] = [];
  panels.push(mineLine([bt("cMineRatio", { answer: ratioLabel(state.ratio!) }), bt("cMineTime", { answer: timeLabel(state.time!) })]));

  const box = step(bt("cStep"));
  const figure = el("div", "bio-cube-box");
  const status = el("div", "discover-status");
  status.setAttribute("role", "status");
  const show = (): void => {
    const side = sideOf(state.exponent);
    figure.replaceChildren(cubeDrawing(side, state.split));
    const r = readingsText(side, state.split);
    status.replaceChildren(el("p", "", r.main), el("p", "bio-strong", r.time));
    if (r.split) status.append(el("p", "", r.split));
  };
  show();
  box.append(
    figure,
    slider({ label: bt("cSide"), key: "side", min: -6, max: -3, step: 0.1, value: state.exponent, format: (v) => lengthText(sideOf(v)), onInput: (v) => ((state.exponent = Math.round(v * 10) / 10), show()) }),
    slider({ label: bt("cSplit"), key: "split", min: 1, max: 5, step: 1, value: state.split, format: (n) => bt("cSplitValue", { n }), onInput: (n) => ((state.split = n), show()) }),
    status,
    control("primary physics-go", bt("note"), "note", () => {
      state.readings = [...state.readings, { exponent: state.exponent, split: state.split }];
      draw();
    }),
  );
  panels.push(box);

  if (state.readings.length > 0) {
    const notes = panel(bt("cNotesTitle"));
    const rows = state.readings
      .slice(-10)
      .reverse()
      .map((r) => {
        const side = sideOf(r.exponent);
        return [`${lengthText(side)}${r.split > 1 ? ` ÷ ${r.split}` : ""}`, `${sig3(ratio((side * 1e6) / r.split))} µm⁻¹`, timeText(diffusionTime(side / r.split / 2))];
      });
    notes.append(table("bio-cells", [bt("cColSide"), bt("cColRatio"), bt("cColTime")], rows, (i) => i === 0));
    panels.push(notes);
  }

  const sizes = new Set(state.readings.map((r) => `${r.exponent}|${r.split}`)).size;
  if (!state.revealed) {
    const reveal = el("div", "discover-reveal");
    reveal.append(
      ...gatedButton(pt("reveal"), "reveal", sizes >= REVEAL_AFTER, bt("cRevealHint"), () => {
        state.revealed = true;
        draw();
        document.querySelector(".discover-compare")?.scrollIntoView({ behavior: reducedMotion() ? "auto" : "smooth", block: "start" });
      }),
    );
    panels.push(reveal);
  } else {
    panels.push(
      comparePanel(state),
      explainPanel(pt("stepExplain"), [bt("cExplainRatio"), bt("cExplainDiffusion"), bt("cExplainSplit"), bt("cExplainBig")]),
      checkPanel<CheckAnswer>({
        title: pt("stepCheck"),
        question: bt("cCheckQuestion"),
        options: [
          { value: "same", label: bt("cCheckSame") },
          { value: "thousand", label: bt("cCheckThousand") },
          { value: "bigger", label: bt("cCheckBigger") },
        ],
        right: "same",
        chosen: state.check,
        onChoose: (v) => ((state.check = v), draw()),
        rightText: bt("cCheckRight"),
        wrongText: bt("cCheckWrong"),
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
  box.append(el("h3", "discover-panel-title", pt("formulaTitle")), el("p", "discover-intro", bt("cTheoryText")));
  box.append(formula(`\\frac{S}{V} = \\frac{6s^2}{s^3} = \\frac{6}{s},\\qquad t = \\frac{x^2}{2D}`));
  const rows = [1e-5, 2e-5, 1e-4, 1e-3].map((s) => [lengthText(s), `${sig3(ratio(s * 1e6))} µm⁻¹`, timeText(diffusionTime(s / 2))]);
  box.append(table("bio-cells-theory", [bt("cColSide"), bt("cColRatio"), bt("cColTime")], rows));
  box.append(el("h3", "discover-panel-title", pt("youTitle")));
  box.append(
    verdict(state.ratio === "half" ? bt("cRatioRight") : bt("cRatioWrong", { answer: ratioLabel(state.ratio!) }), state.ratio === "half"),
    verdict(state.time === "10000" ? bt("cTimeRight") : bt("cTimeWrong", { answer: timeLabel(state.time!) }), state.time === "10000"),
  );
  return box;
}
