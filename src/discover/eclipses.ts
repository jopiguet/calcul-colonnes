/**
 * Eclipses, in five steps.
 *
 *   1. Predict   why not every month; at which phase a solar eclipse happens
 *   2. Try       follow the Moon a year at a time, with or without the tilt; the Moon's distance
 *   3. Compare   the limits and the nodes; the years seen; the predictions
 *   4. Explain   the tilted orbit; eclipse seasons; the same apparent size; small shadow
 *   5. Check     why a total solar eclipse is seen only from a narrow strip
 *
 * The geometry is in shared/discover/eclipses.ts; `npm run check:astronomy`
 * checks over centuries of simulated years that it gives 2 to 5 solar
 * eclipses a year, and one at every new moon without the tilt.
 */
import { MOON_ECCENTRICITY, MOON_SEMI_AXIS, lunarLimit, moonRadius, solarLimit, sunRadius, syzygies, umbraWidth, type Syzygy } from "../../shared/discover/eclipses";
import { EARTH_RADIUS } from "../../shared/discover/moon";
import { YEAR } from "../../shared/discover/seasons";
import { el } from "../dom";
import type { User } from "../store";
import { checkPanel, choiceSet, explainPanel, mountLab, panel, reducedMotion, step } from "./lab";
import { at } from "./astro-i18n";
import { num, pt } from "./physics-i18n";
import { drawing, gatedButton, mineLine, physicsHead, restartPanel, shape, slider, table, toggle, verdict } from "./physics-ui";

export const REVEAL_AFTER = 3;
export const YEARS = 18;
/** Where the run starts: the Moon 30° past its node at the first new moon. */
const NODE = 30;
const ANOMALY = 60;
/** The distance slider's ends, km: about perigee and apogee, on its 500 km steps. */
const NEAREST = Math.ceil((MOON_SEMI_AXIS * (1 - MOON_ECCENTRICITY)) / 500) * 500;
const FARTHEST = Math.floor((MOON_SEMI_AXIS * (1 + MOON_ECCENTRICITY)) / 500) * 500;

type WhyAnswer = "tilted" | "small" | "every";
type WhenAnswer = "new" | "full" | "any";
type CheckAnswer = "strip" | "clouds" | "far";

interface Lab {
  userId: number;
  step: "predict" | "lab";
  why: WhyAnswer | null;
  when: WhenAnswer | null;
  year: number;
  tilted: boolean;
  seen: { year: number; tilted: boolean }[];
  distance: number;
  revealed: boolean;
  check: CheckAnswer | null;
}

let lab: Lab | null = null;

const startLab = (userId: number): Lab => ({
  userId,
  step: "predict",
  why: null,
  when: null,
  year: 1,
  tilted: true,
  seen: [],
  distance: NEAREST,
  revealed: false,
  check: null,
});

export const eclipsesBusy = (): boolean => lab !== null && lab.seen.length > 0 && lab.check === null;

const whyLabel = (a: WhyAnswer): string => at(a === "tilted" ? "eWhyTilted" : a === "small" ? "eWhySmall" : "eWhyEvery");
const whenLabel = (a: WhenAnswer): string => at(a === "new" ? "eWhenNew" : a === "full" ? "eWhenFull" : "eWhenAny");

const runs: Partial<Record<"tilted" | "flat", Syzygy[]>> = {};
/** The syzygies of one year of the run. */
export function yearOf(year: number, tilted: boolean): Syzygy[] {
  const key = tilted ? "tilted" : "flat";
  runs[key] ??= syzygies(YEAR * YEARS, NODE, ANOMALY, tilted ? undefined : 0);
  return runs[key]!.filter((s) => s.day >= (year - 1) * YEAR && s.day < year * YEAR);
}
const counts = (list: Syzygy[]): { solar: number; lunar: number } => ({
  solar: list.filter((s) => s.eclipse?.kind === "solar").length,
  lunar: list.filter((s) => s.eclipse?.kind === "lunar").length,
});

export function eclipsesView(ctx: { user: User }): HTMLElement {
  if (!lab || lab.userId !== ctx.user.id) lab = startLab(ctx.user.id);
  return mountLab("is-eclipses", (draw) => {
    const state = lab!;
    const head = physicsHead(at("eclipsesTitle"));
    return state.step === "predict" ? [head, predictPanel(state, draw)] : [head, ...labPanels(state, draw)];
  });
}

// ---------------------------------------------------------------- 1. predict

function predictPanel(state: Lab, draw: () => void): HTMLElement {
  const box = step(pt("stepPredict"));
  box.append(el("p", "discover-intro", at("eIntro")));
  box.append(
    choiceSet<WhyAnswer>({
      cls: "discover-choices",
      legend: at("ePredictWhy"),
      options: (["tilted", "small", "every"] as const).map((v) => ({ value: v, label: whyLabel(v) })),
      chosen: state.why,
      key: "why",
      onPick: (v) => ((state.why = v), draw()),
    }),
    choiceSet<WhenAnswer>({
      cls: "discover-choices",
      legend: at("ePredictWhen"),
      options: (["new", "full", "any"] as const).map((v) => ({ value: v, label: whenLabel(v) })),
      chosen: state.when,
      key: "when",
      onPick: (v) => ((state.when = v), draw()),
    }),
  );
  box.append(
    ...gatedButton(at("ePredictDone"), "predict-done", state.why !== null && state.when !== null, at("ePredictNeeded"), () => {
      state.step = "lab";
      see(state);
      draw();
    }),
  );
  return box;
}

// ---------------------------------------------------------------- 2. try

function see(state: Lab): void {
  if (!state.seen.some((s) => s.year === state.year && s.tilted === state.tilted)) state.seen = [...state.seen, { year: state.year, tilted: state.tilted }];
}

const CW = 420;
const CH = 250;
const BETA_MAX = 6;

function yearChart(year: number, tilted: boolean): SVGSVGElement {
  const list = yearOf(year, tilted);
  const { solar, lunar } = counts(list);
  const pad = { left: 34, right: 12, top: 14, bottom: 34 };
  const x = (day: number): number => pad.left + ((CW - pad.left - pad.right) * (day - (year - 1) * YEAR)) / YEAR;
  const y = (beta: number): number => pad.top + ((CH - pad.top - pad.bottom) * (BETA_MAX - beta)) / (2 * BETA_MAX);
  const svg = drawing("discover-path physics-curve astro-eclipse-chart", CW, CH, at("eChartAria", { year, solar, lunar }));
  const band = (limit: number, cls: string): void => {
    shape(svg, "rect", { x: pad.left, y: y(limit), width: CW - pad.left - pad.right, height: y(-limit) - y(limit), class: cls });
  };
  band(solarLimit(), "astro-band-solar");
  band(lunarLimit(), "astro-band-lunar");
  for (const b of [-6, -3, 0, 3, 6]) {
    shape(svg, "line", { x1: pad.left, x2: CW - pad.right, y1: y(b), y2: y(b), class: b === 0 ? "astro-ecliptic" : "grid-line" });
    shape(svg, "text", { x: pad.left - 5, y: y(b) + 4, class: "axis-label", "text-anchor": "end" }, `${b}°`);
  }
  for (let m = 0; m <= 12; m += 3) shape(svg, "text", { x: pad.left + ((CW - pad.left - pad.right) * m) / 12, y: CH - pad.bottom + 16, class: "axis-label", "text-anchor": "middle" }, String(m));
  shape(svg, "text", { x: (pad.left + CW - pad.right) / 2, y: CH - 4, class: "axis-title", "text-anchor": "middle" }, at("eChartAxis"));
  for (const s of list) {
    const cx = x(s.day);
    const cy = y(Math.max(-BETA_MAX, Math.min(BETA_MAX, s.beta)));
    if (s.eclipse) shape(svg, "circle", { cx, cy, r: 9, class: "astro-eclipse-ring" });
    shape(svg, "circle", { cx, cy, r: 4.5, class: s.kind === "new" ? "astro-new" : "astro-full" });
  }
  return svg;
}

function chartLegend(): HTMLElement {
  const legend = el("ul", "astro-legend");
  const item = (cls: string, text: string): HTMLElement => {
    const li = el("li");
    li.append(el("span", `astro-key ${cls}`), document.createTextNode(text));
    return li;
  };
  legend.append(item("is-new", at("eNewMoon")), item("is-full", at("eFullMoon")), item("is-solar", at("eSolarBand")), item("is-lunar", at("eLunarBand")));
  return legend;
}

const typeText = (t: "total" | "annular" | "partial"): string => at(`type_${t}`);

function eclipseList(year: number, tilted: boolean): HTMLElement {
  const box = panel(at("eListTitle"));
  const found = yearOf(year, tilted).filter((s) => s.eclipse);
  if (found.length === 0) {
    box.append(el("p", "empty small", at("eNone")));
    return box;
  }
  const rows = found.map((s) => [
    at("eMonth", { month: num(1 + ((s.day - (year - 1) * YEAR) / YEAR) * 12, 1) }),
    s.eclipse!.kind === "solar" ? at("eSolar") : at("eLunar"),
    typeText(s.eclipse!.type),
    `${num(s.beta, 2)}°`,
  ]);
  box.append(table("astro-eclipses", [at("eColWhen"), at("eColKind"), at("eColType"), at("eColBeta")], rows));
  return box;
}

const DW = 300;
const DH = 160;

function discView(distance: number): SVGSVGElement {
  const total = umbraWidth(distance) >= 0;
  const svg = drawing("astro-discs", DW, DH, at("eDistanceAria", { distance: num(distance, 0), type: typeText(total ? "total" : "annular") }));
  shape(svg, "rect", { x: 0, y: 0, width: DW, height: DH, class: "astro-night-sky" });
  const R = 60;
  const r = (R * moonRadius(distance - EARTH_RADIUS)) / sunRadius();
  if (total) shape(svg, "circle", { cx: DW / 2, cy: DH / 2, r: R * 1.35, class: "astro-corona" });
  shape(svg, "circle", { cx: DW / 2, cy: DH / 2, r: R, class: "astro-sun" });
  shape(svg, "circle", { cx: DW / 2, cy: DH / 2, r, class: "astro-moon-disc" });
  return svg;
}

function labPanels(state: Lab, draw: () => void): HTMLElement[] {
  const panels: HTMLElement[] = [];
  panels.push(mineLine([at("eMineWhy", { answer: whyLabel(state.why!) }), at("eMineWhen", { answer: whenLabel(state.when!) })]));

  const box = step(at("eStep"));
  const chart = el("figure", "astro-figure astro-figure-wide");
  const status = el("p", "discover-status");
  status.setAttribute("role", "status");
  const list = el("div", "astro-list-box");
  const show = (): void => {
    chart.replaceChildren(el("figcaption", "discover-panel-title", at("eChartTitle")), yearChart(state.year, state.tilted), chartLegend());
    const { solar, lunar } = counts(yearOf(state.year, state.tilted));
    status.replaceChildren(el("strong", "", at("eYearStatus", { year: state.year, solar, lunar })));
    list.replaceChildren(eclipseList(state.year, state.tilted));
  };
  show();
  const toggles = el("div", "physics-toggles");
  toggles.append(
    toggle(at("eTiltReal"), "tilt-real", state.tilted, () => ((state.tilted = true), see(state), draw())),
    toggle(at("eTiltNone"), "tilt-none", !state.tilted, () => ((state.tilted = false), see(state), draw())),
  );
  const tiltField = el("div", "field");
  tiltField.append(el("span", "field-label", at("eTilt")), toggles);
  let ready = state.seen.filter((s) => s.tilted).length >= REVEAL_AFTER;
  const controls = el("div", "physics-controls");
  controls.append(
    slider({
      label: at("eYear"),
      key: "year",
      min: 1,
      max: YEARS,
      step: 1,
      value: state.year,
      format: (y) => at("eYearValue", { year: y }),
      onInput: (y) => {
        state.year = y;
        see(state);
        show();
        if (!ready && state.seen.filter((s) => s.tilted).length >= REVEAL_AFTER) {
          ready = true;
          draw();
        }
      },
    }),
    tiltField,
  );
  box.append(chart, controls, status, list);
  panels.push(box);

  // The Moon's distance: total or annular.
  const sizes = panel(at("eDistanceTitle"));
  const discs = el("div", "astro-discs-box");
  const sizeStatus = el("p", "discover-status astro-size-status");
  const showDiscs = (): void => {
    discs.replaceChildren(discView(state.distance));
    const width = umbraWidth(state.distance);
    sizeStatus.textContent = width >= 0 ? at("eDistanceTotal", { width: num(Math.max(1, Math.round(width / 10) * 10), 0) }) : at("eDistanceAnnular");
  };
  showDiscs();
  sizes.append(
    discs,
    slider({
      label: at("eDistance"),
      key: "distance",
      min: NEAREST,
      max: FARTHEST,
      step: 500,
      value: state.distance,
      format: (d) => `${num(d, 0)} km`,
      onInput: (d) => ((state.distance = d), showDiscs()),
    }),
    sizeStatus,
  );
  panels.push(sizes);

  if (!state.revealed) {
    const reveal = el("div", "discover-reveal");
    reveal.append(
      ...gatedButton(pt("reveal"), "reveal", state.seen.filter((s) => s.tilted).length >= REVEAL_AFTER, at("eRevealHint"), () => {
        state.revealed = true;
        draw();
        document.querySelector(".discover-compare")?.scrollIntoView({ behavior: reducedMotion() ? "auto" : "smooth", block: "start" });
      }),
    );
    panels.push(reveal);
  } else {
    panels.push(
      comparePanel(state),
      explainPanel(pt("stepExplain"), [at("eExplainTilt"), at("eExplainNodes"), at("eExplainSize"), at("eExplainShadow")]),
      checkPanel<CheckAnswer>({
        title: pt("stepCheck"),
        question: at("eCheckQuestion"),
        options: [
          { value: "strip", label: at("eCheckStrip") },
          { value: "clouds", label: at("eCheckClouds") },
          { value: "far", label: at("eCheckFar") },
        ],
        right: "strip",
        chosen: state.check,
        onChoose: (v) => ((state.check = v), draw()),
        rightText: at("eCheckRight"),
        wrongText: at("eCheckWrong"),
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
  box.append(
    el("h3", "discover-panel-title", pt("formulaTitle")),
    el("p", "discover-intro", at("eTheoryText", { solar: `${num(solarLimit(), 1)}°`, lunar: `${num(lunarLimit(), 1)}°` })),
    el("p", "discover-intro", at("eSeasons")),
  );
  const years = [...new Set(state.seen.map((s) => s.year))].sort((a, b) => a - b);
  const yearsBox = panel(at("eCountTitle"));
  yearsBox.append(
    table(
      "astro-years",
      [at("eColYear"), at("eColSolar"), at("eColLunar"), at("eColFlat")],
      years.map((y) => {
        const real = counts(yearOf(y, true));
        const flat = counts(yearOf(y, false));
        return [String(y), String(real.solar), String(real.lunar), `${flat.solar} + ${flat.lunar}`];
      }),
    ),
  );
  box.append(yearsBox);
  box.append(el("h3", "discover-panel-title", pt("youTitle")));
  box.append(
    verdict(state.why === "tilted" ? at("eWhyRight") : state.why === "small" ? at("eWhySmallWrong") : at("eWhyEveryWrong"), state.why === "tilted"),
    verdict(state.when === "new" ? at("eWhenRight") : at("eWhenWrong", { answer: whenLabel(state.when!) }), state.when === "new"),
    verdict(state.seen.some((s) => !s.tilted) ? at("eFlatShown") : at("eFlatTry")),
  );
  return box;
}
