/**
 * The Moon's phases, in five steps.
 *
 *   1. Predict   what makes the phases; where the full moon is
 *   2. Try       move the Moon round: the top view, with the Earth's shadow, and the Moon seen from the Earth
 *   3. Compare   the lit fraction (1 − cos φ)/2; the month in a table; the predictions
 *   4. Explain   half lit; the angle; rising times; the shadow is an eclipse
 *   5. Check     a lunar eclipse happens only at full moon
 *
 * The geometry is in shared/discover/moon.ts; `npm run check:astronomy`
 * checks the lit fraction against an integration over the Moon's surface,
 * and the Earth's shadow against the Moon's orbit.
 */
import { PHASES, SYNODIC, elongation, illuminated, inShadow, phaseOf, riseHour, type Phase } from "../../shared/discover/moon";
import { el } from "../dom";
import type { User } from "../store";
import { checkPanel, choiceSet, explainPanel, mountLab, panel, reducedMotion, step } from "./lab";
import { at } from "./astro-i18n";
import { andList, deg, num, pct, pt } from "./physics-i18n";
import { drawing, formula, gatedButton, mineLine, physicsHead, restartPanel, shape, slider, table, verdict } from "./physics-ui";

export const REVEAL_AFTER = 4;

type CauseAnswer = "shadow" | "side" | "distance";
type FullAnswer = "between" | "opposite" | "side";
type CheckAnswer = "new" | "quarter" | "full" | "any";

interface Lab {
  userId: number;
  step: "predict" | "lab";
  cause: CauseAnswer | null;
  full: FullAnswer | null;
  day: number;
  visited: Phase[];
  revealed: boolean;
  check: CheckAnswer | null;
}

let lab: Lab | null = null;

const startLab = (userId: number): Lab => ({ userId, step: "predict", cause: null, full: null, day: 0, visited: [], revealed: false, check: null });

export const moonBusy = (): boolean => lab !== null && lab.visited.length > 0 && lab.check === null;

export const phaseName = (p: Phase): string => at(`phase_${p}`);
const causeLabel = (a: CauseAnswer): string => at(a === "shadow" ? "mCauseShadow" : a === "side" ? "mCauseSide" : "mCauseDistance");
const fullLabel = (a: FullAnswer): string => at(a === "between" ? "mFullBetween" : a === "opposite" ? "mFullOpposite" : "mFullSide");

/** An hour of the day, "18 h 00", "18:00". */
export function clock(hours: number): string {
  // Rounded to a quarter of an hour: the rising time is "about".
  const total = Math.round((((hours % 24) + 24) % 24) * 4) * 15;
  return at("hours", { h: String(Math.floor(total / 60) % 24), m: String(total % 60).padStart(2, "0") });
}

export function moonView(ctx: { user: User }): HTMLElement {
  if (!lab || lab.userId !== ctx.user.id) lab = startLab(ctx.user.id);
  return mountLab("is-moon", (draw) => {
    const state = lab!;
    const head = physicsHead(at("moonTitle"));
    return state.step === "predict" ? [head, predictPanel(state, draw)] : [head, ...labPanels(state, draw)];
  });
}

// ---------------------------------------------------------------- 1. predict

function predictPanel(state: Lab, draw: () => void): HTMLElement {
  const box = step(pt("stepPredict"));
  box.append(el("p", "discover-intro", at("mIntro")));
  box.append(
    choiceSet<CauseAnswer>({
      cls: "discover-choices",
      legend: at("mPredictCause"),
      options: (["shadow", "side", "distance"] as const).map((v) => ({ value: v, label: causeLabel(v) })),
      chosen: state.cause,
      key: "cause",
      onPick: (v) => ((state.cause = v), draw()),
    }),
    choiceSet<FullAnswer>({
      cls: "discover-choices",
      legend: at("mPredictFull"),
      options: (["between", "opposite", "side"] as const).map((v) => ({ value: v, label: fullLabel(v) })),
      chosen: state.full,
      key: "full",
      onPick: (v) => ((state.full = v), draw()),
    }),
  );
  box.append(
    ...gatedButton(at("mPredictDone"), "predict-done", state.cause !== null && state.full !== null, at("mPredictNeeded"), () => {
      state.step = "lab";
      visit(state);
      draw();
    }),
  );
  return box;
}

// ---------------------------------------------------------------- 2. try

const W = 420;
const H = 280;
const EARTH: [number, number] = [250, 140];
const ORBIT = 105;
const EARTH_R = 20;
const MOON_R = 9;

const moonAt = (phi: number): [number, number] => {
  const a = (phi * Math.PI) / 180;
  return [EARTH[0] - ORBIT * Math.cos(a), EARTH[1] + ORBIT * Math.sin(a)];
};

/** A body lit from the left: dark disc, lit left half. */
function litFromLeft(svg: SVGSVGElement, cx: number, cy: number, r: number, cls: string): void {
  shape(svg, "circle", { cx, cy, r, class: `${cls} astro-night` });
  shape(svg, "path", { d: `M ${cx} ${cy - r} A ${r} ${r} 0 0 0 ${cx} ${cy + r} Z`, class: `${cls} astro-day` });
}

function topView(phi: number): SVGSVGElement {
  const shadow = inShadow(phi);
  const away = Math.abs(((phi + 360) % 360) - 180);
  const svg = drawing("astro-top", W, H, at("mTopAria", { angle: deg(phi), shadow: shadow === "none" ? at("mOutOfShadow", { angle: deg(away) }) : at("mInShadow") }));
  // The Sun, far to the left, and its light.
  shape(svg, "circle", { cx: -40, cy: H / 2, r: 70, class: "astro-sun" });
  shape(svg, "text", { x: 6, y: 24, class: "axis-label" }, at("mSun"));
  for (let y = 40; y <= H - 40; y += 50) shape(svg, "line", { x1: 40, y1: y, x2: 80, y2: y, class: "astro-ray" });
  // The Earth's shadow, behind it.
  shape(svg, "polygon", {
    points: `${EARTH[0]},${EARTH[1] - EARTH_R} ${W},${EARTH[1] - EARTH_R * 0.55} ${W},${EARTH[1] + EARTH_R * 0.55} ${EARTH[0]},${EARTH[1] + EARTH_R}`,
    class: "astro-shadow",
  });
  shape(svg, "text", { x: W - 8, y: EARTH[1] - EARTH_R - 6, class: "axis-label", "text-anchor": "end" }, at("mShadow"));
  shape(svg, "circle", { cx: EARTH[0], cy: EARTH[1], r: ORBIT, class: "astro-orbit" });
  for (let k = 0; k < 8; k++) {
    const [x, y] = moonAt(45 * k);
    shape(svg, "circle", { cx: x, cy: y, r: 2.5, class: "astro-mark" });
  }
  litFromLeft(svg, EARTH[0], EARTH[1], EARTH_R, "astro-earth");
  const [mx, my] = moonAt(phi);
  litFromLeft(svg, mx, my, MOON_R, shadow === "none" ? "astro-moon" : "astro-moon is-eclipsed");
  // The line of sight, from the Earth to the Moon.
  shape(svg, "line", { x1: EARTH[0], y1: EARTH[1], x2: mx, y2: my, class: "astro-sight" });
  return svg;
}

/** The lit part of the Moon's disc, seen from the northern hemisphere: waxing on the right. */
export function litPath(cx: number, cy: number, r: number, phi: number): string | null {
  const p = ((phi % 360) + 360) % 360;
  const lit = illuminated(p);
  if (lit < 0.002) return null;
  if (lit > 0.998) return `M ${cx} ${cy - r} A ${r} ${r} 0 1 1 ${cx} ${cy + r} A ${r} ${r} 0 1 1 ${cx} ${cy - r} Z`;
  const k = Math.cos((p * Math.PI) / 180);
  const rx = Math.max(0.01, r * Math.abs(k));
  const crescent = k > 0;
  if (p < 180) return `M ${cx} ${cy - r} A ${r} ${r} 0 0 1 ${cx} ${cy + r} A ${rx} ${r} 0 0 ${crescent ? 0 : 1} ${cx} ${cy - r} Z`;
  return `M ${cx} ${cy - r} A ${r} ${r} 0 0 0 ${cx} ${cy + r} A ${rx} ${r} 0 0 ${crescent ? 1 : 0} ${cx} ${cy - r} Z`;
}

function skyView(phi: number): SVGSVGElement {
  const size = 180;
  const r = 66;
  const svg = drawing("astro-sky", size, size, at("mSkyAria", { phase: phaseName(phaseOf(phi)), lit: pct(illuminated(phi), 0) }));
  shape(svg, "rect", { x: 0, y: 0, width: size, height: size, class: "astro-night-sky" });
  const eclipsed = inShadow(phi) !== "none";
  shape(svg, "circle", { cx: size / 2, cy: size / 2, r, class: eclipsed ? "astro-disc is-eclipsed" : "astro-disc" });
  const d = litPath(size / 2, size / 2, r, phi);
  if (d && !eclipsed) shape(svg, "path", { d, class: "astro-disc-lit" });
  return svg;
}

function visit(state: Lab): void {
  const p = phaseOf(elongation(state.day));
  if (!state.visited.includes(p)) state.visited = [...state.visited, p];
}

function labPanels(state: Lab, draw: () => void): HTMLElement[] {
  const panels: HTMLElement[] = [];
  panels.push(mineLine([at("mMineCause", { answer: causeLabel(state.cause!) }), at("mMineFull", { answer: fullLabel(state.full!) })]));

  const box = step(at("mStep"));
  const views = el("div", "astro-views");
  const top = el("figure", "astro-figure");
  const sky = el("figure", "astro-figure astro-figure-sky");
  const status = el("p", "discover-status");
  status.setAttribute("role", "status");
  const visited = el("p", "hint astro-visited");
  const show = (): void => {
    const phi = elongation(state.day);
    top.replaceChildren(el("figcaption", "discover-panel-title", at("mTopTitle")), topView(phi));
    sky.replaceChildren(el("figcaption", "discover-panel-title", at("mSkyTitle")), skyView(phi));
    const shadow = inShadow(phi);
    status.replaceChildren(el("strong", "", at("mStatus", { phase: phaseName(phaseOf(phi)), lit: pct(illuminated(phi), 0), hour: clock(riseHour(phi)) })));
    if (shadow !== "none") status.append(el("span", "astro-eclipse-note", ` ${at("mInShadow")}`));
    visited.textContent = at("mVisited", { list: andList(PHASES.filter((p) => state.visited.includes(p)).map(phaseName)) });
  };
  show();
  views.append(top, sky);
  box.append(views, el("p", "hint", at("notToScale")));
  let gated = state.visited.length >= REVEAL_AFTER;
  box.append(
    slider({
      label: at("mDay"),
      key: "day",
      min: 0,
      max: 29.5,
      step: 0.25,
      value: state.day,
      format: (d) => at("mDayValue", { day: num(d, d % 1 === 0 ? 0 : 2) }),
      onInput: (d) => {
        state.day = d;
        visit(state);
        show();
        // The reveal button appears once enough phases have been seen.
        if (!gated && state.visited.length >= REVEAL_AFTER) {
          gated = true;
          draw();
        }
      },
    }),
    status,
    visited,
  );
  panels.push(box);

  if (!state.revealed) {
    const reveal = el("div", "discover-reveal");
    reveal.append(
      ...gatedButton(pt("reveal"), "reveal", state.visited.length >= REVEAL_AFTER, at("mRevealHint"), () => {
        state.revealed = true;
        draw();
        document.querySelector(".discover-compare")?.scrollIntoView({ behavior: reducedMotion() ? "auto" : "smooth", block: "start" });
      }),
    );
    panels.push(reveal);
  } else {
    panels.push(
      comparePanel(state),
      explainPanel(pt("stepExplain"), [at("mExplainHalf"), at("mExplainAngle"), at("mExplainRise"), at("mExplainShadow")]),
      checkPanel<CheckAnswer>({
        title: pt("stepCheck"),
        question: at("mCheckQuestion"),
        options: [
          { value: "new", label: at("mCheckNew") },
          { value: "quarter", label: at("mCheckQuarter") },
          { value: "full", label: at("mCheckFull") },
          { value: "any", label: at("mCheckAny") },
        ],
        right: "full",
        chosen: state.check,
        onChoose: (v) => ((state.check = v), draw()),
        rightText: at("mCheckRight"),
        wrongText: at("mCheckWrong"),
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
  box.append(el("h3", "discover-panel-title", pt("formulaTitle")), el("p", "discover-intro", at("mTheoryText")));
  box.append(formula(`\\text{${at("mColLit").replace(/[{}\\]/g, "")}} = \\frac{1 - \\cos\\varphi}{2}`));
  const month = panel(at("mTableTitle"));
  const rows = PHASES.map((p, k) => {
    const phi = 45 * k;
    return [phaseName(p), num((k * SYNODIC) / 8, 1), deg(phi), pct(illuminated(phi), 0), clock(riseHour(phi))];
  });
  month.append(
    table("astro-month", [at("mColPhase"), at("mColDay"), at("mColAngle"), at("mColLit"), at("mColRise")], rows, (i) => state.visited.includes(PHASES[i]!)),
  );
  box.append(month);

  box.append(el("h3", "discover-panel-title", pt("youTitle")));
  box.append(
    verdict(
      state.cause === "side" ? at("mCauseRight") : state.cause === "shadow" ? at("mCauseShadowWrong") : at("mCauseDistanceWrong"),
      state.cause === "side",
    ),
    verdict(state.full === "opposite" ? at("mFullRight") : at("mFullWrong", { answer: fullLabel(state.full!) }), state.full === "opposite"),
  );
  return box;
}
