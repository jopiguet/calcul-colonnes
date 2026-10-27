/**
 * The chaos game, in five steps.
 *
 *   1. Predict   what random jumps towards a triangle's corners draw; and with a square
 *   2. Play      jumps by 1, 10, 100, 1,000, 10,000; four shapes; the dots in the middle hole
 *   3. Compare   three half-size copies; the hole never reached; the square's four copies tile it; the predictions
 *   4. Explain   the rule, not the dice, makes the shape; self-similar; a dimension of 1.58
 *   5. Check     wherever the dot starts, it ends on the pattern
 *
 * The game is in shared/discover/fractals.ts, from the experiment's number:
 * `npm run check:math` checks the hole, the fair corners and the dimensions.
 */
import { CHAOS_START, SIERPINSKI_DIMENSION, chaosCorners, filledShare, inMiddleHole, playChaos, type ChaosShape } from "../../shared/discover/fractals";
import { freshSeed } from "../../shared/discover/experiment";
import { el } from "../dom";
import type { User } from "../store";
import { againPanel, checkPanel, choiceSet, control, explainPanel, labHead, mountLab, reducedMotion, step } from "./lab";
import { mt } from "./math-i18n";
import { num, pct, pt } from "./physics-i18n";
import { formula, gatedButton, mineLine, table, verdict } from "./physics-ui";

export const DOTS_NEEDED = 5000;
const MAX_DOTS = 100_000;
const BATCHES = [1, 10, 100, 1000, 10_000];
const SHAPES: ChaosShape[] = ["triangle", "square", "squareNoRepeat", "pentagon"];

type TriangleAnswer = "even" | "blur" | "pattern";
type SquareAnswer = "pattern" | "even" | "hole";
type CheckAnswer = "outside" | "pattern" | "anywhere";

interface Lab {
  userId: number;
  seed: number;
  step: "predict" | "lab";
  triangle: TriangleAnswer | null;
  square: SquareAnswer | null;
  shape: ChaosShape;
  dots: Record<ChaosShape, number>;
  revealed: boolean;
  check: CheckAnswer | null;
}

let lab: Lab | null = null;
const startLab = (userId: number, seed = freshSeed()): Lab => ({
  userId,
  seed,
  step: "predict",
  triangle: null,
  square: null,
  shape: "triangle",
  dots: { triangle: 0, square: 0, squareNoRepeat: 0, pentagon: 0 },
  revealed: false,
  check: null,
});

export const chaosBusy = (): boolean => lab !== null && Object.values(lab.dots).some((n) => n > 0) && lab.check === null;

const triangleLabel = (a: TriangleAnswer): string => mt(a === "even" ? "cgTriangleEven" : a === "blur" ? "cgTriangleBlur" : "cgTrianglePattern");
const squareLabel = (a: SquareAnswer): string => mt(a === "pattern" ? "cgSquarePattern" : a === "even" ? "cgSquareEven" : "cgSquareHole");
const shapeLabel = (s: ChaosShape): string => mt(s === "triangle" ? "cgShapeTriangle" : s === "square" ? "cgShapeSquare" : s === "squareNoRepeat" ? "cgShapeNoRepeat" : "cgShapePentagon");

export function chaosGameView(ctx: { user: User }): HTMLElement {
  if (!lab || lab.userId !== ctx.user.id) lab = startLab(ctx.user.id);
  return mountLab("is-chaosgame", (draw) => {
    const state = lab!;
    const head = labHead(mt("chaosTitle"), state.seed);
    return state.step === "predict" ? [head, predictPanel(state, draw)] : [head, ...labPanels(state, draw)];
  });
}

// ---------------------------------------------------------------- 1. predict

function predictPanel(state: Lab, draw: () => void): HTMLElement {
  const box = step(pt("stepPredict"));
  box.append(el("p", "discover-intro", mt("cgIntro")));
  box.append(
    choiceSet<TriangleAnswer>({
      cls: "discover-choices",
      legend: mt("cgPredictTriangle"),
      options: (["even", "blur", "pattern"] as const).map((v) => ({ value: v, label: triangleLabel(v) })),
      chosen: state.triangle,
      key: "triangle",
      onPick: (v) => ((state.triangle = v), draw()),
    }),
    choiceSet<SquareAnswer>({
      cls: "discover-choices",
      legend: mt("cgPredictSquare"),
      options: (["pattern", "even", "hole"] as const).map((v) => ({ value: v, label: squareLabel(v) })),
      chosen: state.square,
      key: "square",
      onPick: (v) => ((state.square = v), draw()),
    }),
  );
  box.append(
    ...gatedButton(mt("cgPredictDone"), "predict-done", state.triangle !== null && state.square !== null, mt("predictNeeded"), () => {
      state.step = "lab";
      draw();
    }),
  );
  return box;
}

// ---------------------------------------------------------------- 2. play

const SIZE = 420;
const PAD = 24;

function board(state: Lab): HTMLElement {
  const wrap = el("figure", "math-canvas-wrap");
  const canvas = el("canvas", "math-canvas math-chaos");
  canvas.width = SIZE;
  canvas.height = SIZE;
  const count = state.dots[state.shape];
  const game = playChaos(state.shape, state.seed, count);
  const { corners } = chaosCorners(state.shape);
  canvas.setAttribute("role", "img");
  canvas.setAttribute("aria-label", mt("cgAria", { shape: shapeLabel(state.shape), dots: num(count, 0) }));
  const ctx = canvas.getContext("2d");
  const map = (x: number, y: number): [number, number] => [PAD + x * (SIZE - 2 * PAD), PAD + y * (SIZE - 2 * PAD)];
  if (ctx) {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, SIZE, SIZE);
    // The dots: the smaller, the more of them.
    const r = count > 20_000 ? 0.7 : count > 2000 ? 1 : 1.6;
    ctx.fillStyle = "#2445c4";
    for (let i = 0; i < game.xs.length; i++) {
      const [x, y] = map(game.xs[i]!, game.ys[i]!);
      ctx.fillRect(x - r, y - r, 2 * r, 2 * r);
    }
    // The first jumps, as lines: how the rule moves the dot.
    if (count <= 12) {
      ctx.strokeStyle = "#d9541e";
      ctx.lineWidth = 1.5;
      let [px, py] = map(...CHAOS_START);
      ctx.beginPath();
      ctx.moveTo(px, py);
      for (let i = 0; i < game.xs.length; i++) {
        [px, py] = map(game.xs[i]!, game.ys[i]!);
        ctx.lineTo(px, py);
      }
      ctx.stroke();
      const [sx, sy] = map(...CHAOS_START);
      ctx.fillStyle = "#d9541e";
      ctx.beginPath();
      ctx.arc(sx, sy, 4, 0, 2 * Math.PI);
      ctx.fill();
    }
    ctx.fillStyle = "#172447";
    corners.forEach(([x, y], i) => {
      const [cx, cy] = map(x, y);
      ctx.beginPath();
      ctx.arc(cx, cy, 5, 0, 2 * Math.PI);
      ctx.fill();
      // The letter just outside the corner, away from the centre.
      const d = Math.hypot(x - 0.5, y - 0.5) || 1;
      ctx.font = "bold 14px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("ABCDE"[i]!, cx + (14 * (x - 0.5)) / d, cy + (14 * (y - 0.5)) / d);
    });
  }
  wrap.append(canvas);
  return wrap;
}

function labPanels(state: Lab, draw: () => void): HTMLElement[] {
  const panels: HTMLElement[] = [];
  panels.push(mineLine([mt("cgMineTriangle", { answer: triangleLabel(state.triangle!) }), mt("cgMineSquare", { answer: squareLabel(state.square!) })]));

  const box = step(mt("cgStep"));
  box.append(
    choiceSet<ChaosShape>({
      cls: "discover-choices math-shapes",
      legend: mt("cgShape"),
      options: SHAPES.map((s) => ({ value: s, label: shapeLabel(s) })),
      chosen: state.shape,
      key: "shape",
      onPick: (s) => ((state.shape = s), draw()),
    }),
  );
  box.append(el("p", "hint", state.shape === "squareNoRepeat" ? mt("cgRuleNoRepeat") : state.shape === "pentagon" ? mt("cgRulePentagon") : mt("cgRule")));
  box.append(board(state));
  const buttons = el("div", "discover-roll");
  for (const size of BATCHES) {
    const b = control(size === 1 ? "primary" : "ghost", mt("cgJumps", { count: num(size, 0) }), `jump-${size}`, () => {
      state.dots = { ...state.dots, [state.shape]: Math.min(MAX_DOTS, state.dots[state.shape] + size) };
      draw();
    });
    b.disabled = state.dots[state.shape] >= MAX_DOTS;
    buttons.append(b);
  }
  box.append(buttons);
  const count = state.dots[state.shape];
  const status = el("p", "discover-status");
  status.setAttribute("role", "status");
  status.append(el("strong", "", mt("cgStatus", { dots: num(count, 0), shape: shapeLabel(state.shape) })));
  if (state.shape === "triangle" && count > 20) {
    const game = playChaos("triangle", state.seed, count);
    const later = game.xs.slice(20).filter((x, i) => inMiddleHole(x, game.ys[i + 20]!)).length;
    status.append(el("span", "math-hole", ` ${mt("cgHole", { count: num(later, 0) })}`));
  }
  box.append(status);
  box.append(
    table(
      "math-chaos-table",
      [mt("cgColShape"), mt("cgColDots"), mt("cgColFilled")],
      SHAPES.filter((s) => state.dots[s] > 0).map((s) => [shapeLabel(s), num(state.dots[s], 0), state.dots[s] >= 1000 ? pct(filledShare(playChaos(s, state.seed, state.dots[s]), 32), 0) : "—"]),
    ),
    el("p", "hint", mt("cgFilledHint")),
  );
  panels.push(box);

  const ready = state.dots.triangle >= DOTS_NEEDED && state.dots.square >= DOTS_NEEDED;
  if (!state.revealed) {
    const reveal = el("div", "discover-reveal");
    reveal.append(
      ...gatedButton(pt("reveal"), "reveal", ready, mt("cgRevealHint", { dots: num(DOTS_NEEDED, 0) }), () => {
        state.revealed = true;
        draw();
        document.querySelector(".discover-compare")?.scrollIntoView({ behavior: reducedMotion() ? "auto" : "smooth", block: "start" });
      }),
    );
    panels.push(reveal);
  } else {
    panels.push(
      comparePanel(state),
      explainPanel(pt("stepExplain"), [mt("cgExplainRule"), mt("cgExplainCopies"), mt("cgExplainDimension"), mt("cgExplainNature")]),
      checkPanel<CheckAnswer>({
        title: pt("stepCheck"),
        question: mt("cgCheckQuestion"),
        options: [
          { value: "outside", label: mt("cgCheckOutside") },
          { value: "pattern", label: mt("cgCheckPattern") },
          { value: "anywhere", label: mt("cgCheckAnywhere") },
        ],
        right: "pattern",
        chosen: state.check,
        onChoose: (v) => ((state.check = v), draw()),
        rightText: mt("cgCheckRight"),
        wrongText: mt("cgCheckWrong"),
      }),
    );
  }
  panels.push(
    againPanel({
      checked: state.check !== null,
      onNew: () => {
        lab = startLab(state.userId);
        draw();
      },
      onReplay: (seed) => {
        lab = startLab(state.userId, seed);
        draw();
      },
    }),
  );
  return panels;
}

// ---------------------------------------------------------------- 3. compare

function comparePanel(state: Lab): HTMLElement {
  const box = step(pt("stepCompare"), "discover-compare");
  box.append(el("h3", "discover-panel-title", pt("formulaTitle")), el("p", "discover-intro", mt("cgTheoryCopies")));
  box.append(formula(`D = \\frac{\\log 3}{\\log 2} \\approx ${num(SIERPINSKI_DIMENSION, 3).replace(",", "{,}")}`));
  box.append(el("p", "discover-intro", mt("cgTheoryHole")), el("p", "discover-intro", mt("cgTheorySquare")));
  box.append(el("h3", "discover-panel-title", pt("youTitle")));
  box.append(
    verdict(state.triangle === "pattern" ? mt("cgTriangleRight") : mt("cgTriangleWrong", { answer: triangleLabel(state.triangle!) }), state.triangle === "pattern"),
    verdict(state.square === "even" ? mt("cgSquareRight") : mt("cgSquareWrong", { answer: squareLabel(state.square!) }), state.square === "even"),
  );
  return box;
}
