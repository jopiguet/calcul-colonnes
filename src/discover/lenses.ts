/**
 * Lenses, in five steps.
 *
 *   1. Predict   a card over half the lens; the arrow brought closer
 *   2. Try       move the arrow and the screen until the image is sharp; the card
 *   3. Compare   the thin lens equation against the positions found; three rays
 *   4. Explain   a cone of light per point; the card dims; closer means farther; inside f
 *   5. Check     a magnifying glass: a virtual image
 *
 * The rays are traced through the lens one by one
 * (shared/discover/lenses.ts); `npm run check:physics` checks that they
 * meet where the thin lens equation puts the image.
 */
import { APERTURE, blurWidth, bundle, heightAt, image, isSharp, onScreen, principalRays, type Bench } from "../../shared/discover/lenses";
import { el } from "../dom";
import type { User } from "../store";
import { checkPanel, choiceSet, control, explainPanel, mountLab, panel, reducedMotion, step } from "./lab";
import { num, pct, pt } from "./physics-i18n";
import { drawing, formula, gatedButton, mineLine, physicsHead, points, restartPanel, shape, slider, table, toggle, verdict } from "./physics-ui";

export const FOCALS = [10, 15, 20];
/** Sharp positions noted, at different arrow distances, before the comparison. */
export const REVEAL_AFTER = 3;
const ARROW = 3;

type CardAnswer = "top" | "bottom" | "whole" | "gone";
type CloserAnswer = "closer" | "farther" | "stay";
type CheckAnswer = "behind" | "front" | "no";

interface Spot {
  focal: number;
  object: number;
  screen: number;
}

interface Lab {
  userId: number;
  step: "predict" | "lab";
  card: CardAnswer | null;
  closer: CloserAnswer | null;
  bench: Bench;
  cardTried: boolean;
  records: Spot[];
  revealed: boolean;
  check: CheckAnswer | null;
}

let lab: Lab | null = null;

const startLab = (userId: number): Lab => ({
  userId,
  step: "predict",
  card: null,
  closer: null,
  bench: { focal: 10, object: 30, height: ARROW, screen: 25, card: false },
  cardTried: false,
  records: [],
  revealed: false,
  check: null,
});

export const lensesBusy = (): boolean => lab !== null && lab.records.length > 0 && lab.check === null;

const cm = (d: number, digits = 1): string => `${num(d, digits)} cm`;
const cardLabel = (a: CardAnswer): string => pt(a === "top" ? "lCardTop" : a === "bottom" ? "lCardBottom" : a === "whole" ? "lCardWhole" : "lCardGone");
const closerLabel = (a: CloserAnswer): string => pt(a === "closer" ? "lCloser" : a === "farther" ? "lFarther" : "lStay");
const distinctObjects = (records: Spot[]): number => new Set(records.map((r) => `${r.focal}|${r.object}`)).size;

export function lensesView(ctx: { user: User }): HTMLElement {
  if (!lab || lab.userId !== ctx.user.id) lab = startLab(ctx.user.id);
  return mountLab("is-lenses", (draw) => {
    const state = lab!;
    const head = physicsHead(pt("lensesTitle"));
    return state.step === "predict" ? [head, predictPanel(state, draw)] : [head, ...labPanels(state, draw)];
  });
}

// ---------------------------------------------------------------- 1. predict

function predictPanel(state: Lab, draw: () => void): HTMLElement {
  const box = step(pt("stepPredict"));
  box.append(el("p", "discover-intro", pt("lIntro")));
  box.append(
    choiceSet<CardAnswer>({
      cls: "discover-choices",
      legend: pt("lPredictCard"),
      options: (["top", "bottom", "whole", "gone"] as const).map((v) => ({ value: v, label: cardLabel(v) })),
      chosen: state.card,
      key: "card",
      onPick: (v) => ((state.card = v), draw()),
    }),
    choiceSet<CloserAnswer>({
      cls: "discover-choices",
      legend: pt("lPredictCloser"),
      options: (["closer", "farther", "stay"] as const).map((v) => ({ value: v, label: closerLabel(v) })),
      chosen: state.closer,
      key: "closer",
      onPick: (v) => ((state.closer = v), draw()),
    }),
  );
  box.append(
    ...gatedButton(pt("lPredictDone"), "predict-done", state.card !== null && state.closer !== null, pt("lPredictNeeded"), () => {
      state.step = "lab";
      draw();
    }),
  );
  return box;
}

// ---------------------------------------------------------------- 2. try

const W = 420;
const H = 230;
const KY = 8;
/** The stretch of bench drawn, in cm: fitted to what is on it before each drawing. */
let LEFT = -40;
let RIGHT = 60;
let KX = (W - 12) / (RIGHT - LEFT);
function fit(left: number, right: number): void {
  LEFT = left;
  RIGHT = right;
  KX = (W - 12) / (RIGHT - LEFT);
}
const X = (cm: number): number => 6 + (cm - LEFT) * KX;
const Y = (cm: number): number => H / 2 - cm * KY;
const clip = (v: number): number => Math.max(-13, Math.min(13, v));

function arrow(svg: SVGSVGElement, x: number, h: number, cls: string): void {
  const top = clip(h);
  shape(svg, "line", { x1: X(x), x2: X(x), y1: Y(0), y2: Y(top), class: cls });
  if (Math.abs(top) === Math.abs(h)) {
    const dir = h >= 0 ? 1 : -1;
    shape(svg, "path", { d: `M${X(x)},${Y(top)} l-5,${dir * 8} h10 z`, class: `${cls} is-head` });
  }
}

/** Lens, focal points, card, the axis. */
function benchFrame(b: Bench, aria: string, cls = "physics-bench"): SVGSVGElement {
  const svg = drawing(cls, W, H, aria);
  shape(svg, "line", { x1: 0, x2: W, y1: Y(0), y2: Y(0), class: "bench-axis" });
  for (const [x, label] of [
    [-b.focal, "F"],
    [b.focal, "F′"],
  ] as const) {
    shape(svg, "circle", { cx: X(x), cy: Y(0), r: 3, class: "bench-focus" });
    shape(svg, "text", { x: X(x), y: Y(0) + 16, class: "axis-label", "text-anchor": "middle" }, label);
  }
  shape(svg, "ellipse", { cx: X(0), cy: Y(0), rx: 5, ry: APERTURE * KY, class: "bench-lens" });
  if (b.card) shape(svg, "rect", { x: X(0) - 6, y: Y(APERTURE + 0.6), width: 12, height: (APERTURE + 0.6) * KY, class: "bench-card" });
  return svg;
}

function benchDrawing(b: Bench): SVGSVGElement {
  fit(-(b.object + 6), Math.max(b.screen, 2 * b.focal) + 6);
  const svg = benchFrame(b, pt("lBenchAria", { object: num(b.object, 0), screen: num(b.screen, 1), card: b.card ? pt("lBenchCard") : "" }));
  // The light from the arrow's tip: a cone to the lens, then bent towards the image, up to the screen.
  for (const r of bundle(b, 9)) {
    shape(svg, "line", { x1: X(-b.object), y1: Y(b.height), x2: X(0), y2: Y(r.at), class: "bench-ray" });
    shape(svg, "line", { x1: X(0), y1: Y(r.at), x2: X(b.screen), y2: Y(clip(heightAt(r.after, b.screen))), class: "bench-ray" });
  }
  if (b.card) for (const at of [APERTURE / 2, APERTURE]) shape(svg, "line", { x1: X(-b.object), y1: Y(b.height), x2: X(0) - 6, y2: Y(at), class: "bench-ray is-stopped" });
  arrow(svg, -b.object, b.height, "bench-object");
  shape(svg, "rect", { x: X(b.screen) - 3, y: Y(12), width: 6, height: 24 * KY, class: "bench-screen" });
  return svg;
}

/** What the screen shows: the arrow's image, upside down, blurred by how far the screen is from it. */
function screenView(b: Bench): SVGSVGElement {
  const sharp = isSharp(b);
  const i = image(b);
  const seen = onScreen(b);
  const state = !i || !i.real ? pt("lNoImage") : sharp ? `${pt("lSharp")}, ${pt("lUpside", { size: num(Math.abs(i.magnification), 1) })}` : pt("lBlurry");
  const w = 200;
  const h = 200;
  const k = 7;
  const svg = drawing("physics-screen-view", w, h, pt("lScreenAria", { state }));
  const defs = shape(svg, "defs", {});
  const blur = Math.min(30, (blurWidth(b) * k) / 3);
  const filter = shape(defs, "filter", { id: "screen-blur", x: "-50%", y: "-50%", width: "200%", height: "200%" });
  shape(filter, "feGaussianBlur", { stdDeviation: blur.toFixed(2) });
  shape(svg, "rect", { x: 0, y: 0, width: w, height: h, rx: 8, class: "screen-face" });
  const tip = Math.max(-13, Math.min(13, seen.centre));
  const g = shape(svg, "g", { filter: "url(#screen-blur)", opacity: (0.25 + 0.75 * seen.light).toFixed(2) });
  const cx = w / 2;
  const base = h / 2;
  shape(g, "line", { x1: cx, x2: cx, y1: base, y2: base - tip * k, class: "screen-image" });
  if (Math.abs(tip) > 0.5) {
    const dir = tip >= 0 ? 1 : -1;
    shape(g, "path", { d: `M${cx},${base - tip * k} l-6,${dir * 10} h12 z`, class: "screen-image is-head" });
  }
  return svg;
}

function screenStatus(b: Bench): HTMLElement {
  const i = image(b);
  const p = el("p", "discover-status physics-screen-status");
  p.setAttribute("role", "status");
  if (!i || !i.real) p.append(el("strong", "", pt("lNoImage")));
  else if (isSharp(b)) p.append(el("strong", "good", pt("lSharp")), " · ", pt("lUpside", { size: num(Math.abs(i.magnification), 1) }));
  else p.append(el("strong", "", pt("lBlurry")));
  p.append(" · ", pt("lLight", { pct: pct(onScreen(b).light, 0) }));
  return p;
}

function labPanels(state: Lab, draw: () => void): HTMLElement[] {
  const panels: HTMLElement[] = [];
  panels.push(mineLine([pt("lMineCard", { answer: cardLabel(state.card!) }), pt("lMineCloser", { answer: closerLabel(state.closer!) })]));
  const box = step(pt("lStep"));
  const benchBox = el("div", "physics-bench-box");
  const screenBox = el("div", "physics-screen-box");
  const refresh = (): void => {
    benchBox.replaceChildren(benchDrawing(state.bench));
    screenBox.replaceChildren(el("h3", "discover-panel-title", pt("lScreenTitle")), screenView(state.bench), screenStatus(state.bench));
    const record = document.querySelector<HTMLButtonElement>('[data-focus="record"]');
    if (record) record.disabled = !isSharp(state.bench);
    const hint = document.querySelector<HTMLElement>(".physics-record-hint");
    if (hint) hint.hidden = isSharp(state.bench);
  };
  refresh();
  box.append(benchBox, screenBox);
  const b = state.bench;
  const controls = el("div", "physics-controls");
  controls.append(
    slider({ label: pt("lObject"), key: "object", min: 5, max: 60, step: 1, value: b.object, format: (v) => cm(v, 0), onInput: (v) => ((b.object = v), refresh()) }),
    slider({ label: pt("lScreen"), key: "screen", min: 5, max: 120, step: 0.5, value: b.screen, format: (v) => cm(v), onInput: (v) => ((b.screen = v), refresh()) }),
    choiceSet<number>({
      cls: "discover-choices physics-focals",
      legend: pt("lFocal"),
      options: FOCALS.map((f) => ({ value: f, label: cm(f, 0) })),
      chosen: b.focal,
      key: "focal",
      onPick: (f) => ((b.focal = f), draw()),
    }),
  );
  const toggles = el("div", "physics-toggles");
  toggles.append(
    toggle(pt("lCardToggle"), "card", b.card, () => {
      b.card = !b.card;
      if (b.card) state.cardTried = true;
      draw();
    }),
  );
  controls.append(toggles);
  box.append(controls);
  const record = control("primary physics-go", pt("lRecord"), "record", () => {
    if (!isSharp(b)) return;
    state.records = [...state.records, { focal: b.focal, object: b.object, screen: b.screen }];
    draw();
  });
  record.disabled = !isSharp(b);
  const hint = el("p", "hint physics-record-hint", pt("lRecordNeeded"));
  hint.hidden = isSharp(b);
  box.append(record, hint);
  panels.push(box);

  if (state.records.length > 0) {
    const list = panel(pt("lRecordsTitle"));
    const rows = state.records
      .slice(-8)
      .reverse()
      .map((r) => [cm(r.focal, 0), cm(r.object, 0), cm(r.screen), `× ${num(r.screen / r.object, 1)}`]);
    list.append(table("physics-records", [pt("lColFocal"), pt("lColObject"), pt("lColScreen"), pt("lColSize")], rows, (i) => i === 0));
    panels.push(list);
  }

  if (!state.revealed) {
    const reveal = el("div", "discover-reveal");
    reveal.append(
      ...gatedButton(pt("reveal"), "reveal", distinctObjects(state.records) >= REVEAL_AFTER, pt("lRevealHint"), () => {
        state.revealed = true;
        draw();
        document.querySelector(".discover-compare")?.scrollIntoView({ behavior: reducedMotion() ? "auto" : "smooth", block: "start" });
      }),
    );
    panels.push(reveal);
  } else {
    panels.push(
      comparePanel(state),
      explainPanel(pt("stepExplain"), [pt("lExplainCone"), pt("lExplainCard"), pt("lExplainCloser"), pt("lExplainInside")]),
      checkPanel<CheckAnswer>({
        title: pt("stepCheck"),
        question: pt("lCheckQuestion"),
        options: [
          { value: "behind", label: pt("lCheckBehind") },
          { value: "front", label: pt("lCheckFront") },
          { value: "no", label: pt("lCheckNo") },
        ],
        right: "no",
        chosen: state.check,
        onChoose: (v) => ((state.check = v), draw()),
        rightText: pt("lCheckRight"),
        wrongText: pt("lCheckWrong"),
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

/** The three principal rays from the arrow's tip, and the image where they cross (or seem to). */
function rayDiagram(b: Bench): SVGSVGElement {
  const i = image(b);
  const right = i && i.real ? Math.min(Math.max(i.distance, 2 * b.focal) + 10, 150) : 2 * b.focal + 10;
  const left = -(Math.max(b.object, i && !i.real ? -i.distance : 0) + 8);
  fit(left, right);
  const svg = benchFrame({ ...b, card: false }, pt("lRaysAria"), "physics-bench physics-rays");
  const end = RIGHT;
  for (const ray of principalRays(b, end)) {
    const clipped = ray.map(([x, y]) => [X(x), Y(clip(y))] as [number, number]);
    shape(svg, "polyline", { points: points(clipped), class: "bench-principal" });
    if (i && !i.real) {
      // A virtual image: the rays leaving the lens, traced back to where they seem to come from.
      const [x1, y1] = ray[1]!;
      const [x2, y2] = ray[2]!;
      const back = y1 + ((y2 - y1) / (x2 - x1)) * (i.distance - x1);
      shape(svg, "line", { x1: X(x1), y1: Y(y1), x2: X(i.distance), y2: Y(clip(back)), class: "bench-principal is-virtual" });
    }
  }
  arrow(svg, -b.object, b.height, "bench-object");
  if (i && i.distance > LEFT && i.distance < RIGHT) arrow(svg, i.distance, b.height * i.magnification, i.real ? "bench-image" : "bench-image is-virtual");
  return svg;
}

function comparePanel(state: Lab): HTMLElement {
  const box = step(pt("stepCompare"), "discover-compare");
  box.append(el("h3", "discover-panel-title", pt("formulaTitle")), el("p", "discover-intro", pt("lTheoryText")));
  box.append(formula("\\frac{1}{d} + \\frac{1}{d'} = \\frac{1}{f}"));
  const rows = state.records
    .slice(-8)
    .reverse()
    .map((r) => [cm(r.focal, 0), cm(r.object, 0), cm(r.screen), cm(image({ focal: r.focal, object: r.object })!.distance)]);
  box.append(table("physics-check", [pt("lColFocal"), pt("lColObject"), pt("lColScreen"), pt("lColFormula")], rows));

  box.append(el("h3", "discover-panel-title", pt("lRaysTitle")), el("p", "discover-intro", pt("lRaysText")));
  box.append(rayDiagram({ ...state.bench, card: false }));

  box.append(el("h3", "discover-panel-title", pt("youTitle")));
  box.append(verdict(state.card === "whole" ? pt("lCardRight") : pt("lCardWrong", { answer: cardLabel(state.card!) }), state.card === "whole"));
  box.append(verdict(state.cardTried ? pt("lCardTried") : pt("lCardTry")));
  box.append(verdict(state.closer === "farther" ? pt("lCloserRight") : pt("lCloserWrong", { answer: closerLabel(state.closer!) }), state.closer === "farther"));
  return box;
}
