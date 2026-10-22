/**
 * The seasons, in five steps.
 *
 *   1. Predict   why summer is warm; when the Earth is closest to the Sun
 *   2. Try       date, latitude and the axis's tilt: the orbit, the noon Sun, a year's sunlight
 *   3. Compare   the Sun's height and the day's length; June against December; the predictions
 *   4. Explain   the axis keeps its direction; height spreads the light; long days; distance
 *   5. Check     summer in Spain is winter in Argentina
 *
 * The model is in shared/discover/seasons.ts; `npm run check:astronomy`
 * checks its dates, its sunlight formula against a minute-by-minute sum, and
 * that the seasons disappear with an upright axis.
 */
import { MONTH_STARTS, TILT, dailyInsolation, day21, dayLength, noonHeight, sky } from "../../shared/discover/seasons";
import { el } from "../dom";
import type { User } from "../store";
import { checkPanel, choiceSet, control, explainPanel, mountLab, panel, reducedMotion, step } from "./lab";
import { at } from "./astro-i18n";
import { deg, locale, num, pt } from "./physics-i18n";
import { drawing, formula, gatedButton, mineLine, physicsHead, points, restartPanel, shape, slider, table, toggle, verdict } from "./physics-ui";

export const REVEAL_AFTER = 3;
const AU_MKM = 149.6;

type CauseAnswer = "closer" | "tilt" | "hotter";
type ClosestAnswer = "january" | "july" | "never";
type CheckAnswer = "summer" | "winter" | "spring";

interface Reading {
  day: number;
  latitude: number;
  tilted: boolean;
}

interface Lab {
  userId: number;
  step: "predict" | "lab";
  cause: CauseAnswer | null;
  closest: ClosestAnswer | null;
  day: number;
  latitude: number;
  tilted: boolean;
  readings: Reading[];
  revealed: boolean;
  check: CheckAnswer | null;
}

let lab: Lab | null = null;

const startLab = (userId: number): Lab => ({
  userId,
  step: "predict",
  cause: null,
  closest: null,
  day: day21(5),
  latitude: 46,
  tilted: true,
  readings: [],
  revealed: false,
  check: null,
});

export const seasonsBusy = (): boolean => lab !== null && lab.readings.length > 0 && lab.check === null;

const causeLabel = (a: CauseAnswer): string => at(a === "closer" ? "sCauseCloser" : a === "tilt" ? "sCauseTilt" : "sCauseHotter");
const closestLabel = (a: ClosestAnswer): string => at(a === "january" ? "sClosestJanuary" : a === "july" ? "sClosestJuly" : "sClosestNever");

/** A day of the year as a date: "21 juin", "21 de junio", "21 June". */
export function dateText(day: number): string {
  return new Intl.DateTimeFormat(locale(), { day: "numeric", month: "long", timeZone: "UTC" }).format(new Date(Date.UTC(2025, 0, 1 + Math.round(day))));
}
const shortMonth = (month: number): string => new Intl.DateTimeFormat(locale(), { month: "short", timeZone: "UTC" }).format(new Date(Date.UTC(2025, month, 15)));
const monthText = (month: number): string => new Intl.DateTimeFormat(locale(), { month: "long", timeZone: "UTC" }).format(new Date(Date.UTC(2025, month, 15)));
export const latitudeText = (l: number): string => (l === 0 ? "0°" : `${Math.abs(l)}° ${at(l > 0 ? "sNorth" : "sSouth")}`);
const duration = (hours: number): string => {
  const minutes = Math.round(hours * 60);
  return at("hours", { h: String(Math.floor(minutes / 60)), m: String(minutes % 60).padStart(2, "0") });
};
/** Sunlight over a day, kWh per m². */
export const kwh = (day: number, latitude: number, tilted: boolean): number => (dailyInsolation(latitude, sky(day, tilted ? TILT : 0)) * 24) / 1000;

export function seasonsView(ctx: { user: User }): HTMLElement {
  if (!lab || lab.userId !== ctx.user.id) lab = startLab(ctx.user.id);
  return mountLab("is-seasons", (draw) => {
    const state = lab!;
    const head = physicsHead(at("seasonsTitle"));
    return state.step === "predict" ? [head, predictPanel(state, draw)] : [head, ...labPanels(state, draw)];
  });
}

// ---------------------------------------------------------------- 1. predict

function predictPanel(state: Lab, draw: () => void): HTMLElement {
  const box = step(pt("stepPredict"));
  box.append(el("p", "discover-intro", at("sIntro")));
  box.append(
    choiceSet<CauseAnswer>({
      cls: "discover-choices",
      legend: at("sPredictCause"),
      options: (["closer", "tilt", "hotter"] as const).map((v) => ({ value: v, label: causeLabel(v) })),
      chosen: state.cause,
      key: "cause",
      onPick: (v) => ((state.cause = v), draw()),
    }),
    choiceSet<ClosestAnswer>({
      cls: "discover-choices",
      legend: at("sPredictClosest"),
      options: (["january", "july", "never"] as const).map((v) => ({ value: v, label: closestLabel(v) })),
      chosen: state.closest,
      key: "closest",
      onPick: (v) => ((state.closest = v), draw()),
    }),
  );
  box.append(
    ...gatedButton(at("sPredictDone"), "predict-done", state.cause !== null && state.closest !== null, at("sPredictNeeded"), () => {
      state.step = "lab";
      draw();
    }),
  );
  return box;
}

// ---------------------------------------------------------------- 2. try

const OW = 260;
const OH = 260;
const SUN: [number, number] = [OW / 2, OH / 2];
const ORBIT_PX = 95;

function orbitView(day: number, tilted: boolean): SVGSVGElement {
  const s = sky(day, tilted ? TILT : 0);
  const svg = drawing("astro-orbit-view", OW, OH, at("sOrbitAria", { date: dateText(day), distance: num(s.distance * AU_MKM, 1) }));
  // The orbit, its real shape: the eccentricity barely shows.
  const ring: [number, number][] = [];
  for (let d = 0; d <= 365; d += 5) {
    const p = sky(d);
    const a = ((p.longitude + 180) * Math.PI) / 180;
    ring.push([SUN[0] + ORBIT_PX * p.distance * Math.cos(a), SUN[1] - ORBIT_PX * p.distance * Math.sin(a)]);
  }
  shape(svg, "polyline", { points: points(ring), class: "astro-orbit" });
  shape(svg, "circle", { cx: SUN[0], cy: SUN[1], r: 16, class: "astro-sun" });
  for (let m = 0; m < 12; m += 3) {
    const p = sky(MONTH_STARTS[m]! + 14);
    const a = ((p.longitude + 180) * Math.PI) / 180;
    shape(svg, "text", { x: SUN[0] + (ORBIT_PX + 22) * Math.cos(a), y: SUN[1] - (ORBIT_PX + 22) * Math.sin(a) + 4, class: "axis-label", "text-anchor": "middle" }, shortMonth(m));
  }
  const a = ((s.longitude + 180) * Math.PI) / 180;
  const ex = SUN[0] + ORBIT_PX * s.distance * Math.cos(a);
  const ey = SUN[1] - ORBIT_PX * s.distance * Math.sin(a);
  shape(svg, "line", { x1: SUN[0], y1: SUN[1], x2: ex, y2: ey, class: "astro-sight" });
  shape(svg, "circle", { cx: ex, cy: ey, r: 9, class: "astro-earth astro-planet" });
  // The North Pole leans the same way all year: towards the Sun in June.
  const lean = tilted ? 9 * Math.sin((TILT * Math.PI) / 180) * 2 : 0;
  shape(svg, "circle", { cx: ex, cy: ey - lean, r: 2.5, class: "astro-pole" });
  return svg;
}

const SW = 300;
const SH = 170;

function noonView(latitude: number, declination: number): SVGSVGElement {
  const h = noonHeight(latitude, declination);
  const svg = drawing("astro-noon", SW, SH, at("sSunAria", { height: deg(h) }));
  const ground = SH - 30;
  const foot = SW / 2 + 40;
  shape(svg, "rect", { x: 0, y: ground, width: SW, height: SH - ground, class: "astro-ground" });
  if (h <= 0) {
    shape(svg, "text", { x: SW / 2, y: ground / 2, class: "axis-label", "text-anchor": "middle" }, at("sNoSun"));
    return svg;
  }
  // A beam of sunlight 30 px wide, from the Sun's direction; it lands on 30/sin h of ground.
  const a = (h * Math.PI) / 180;
  const dir: [number, number] = [-Math.cos(a), -Math.sin(a)]; // towards the Sun
  const spread = 30 / Math.sin(a);
  const left = foot - spread / 2;
  const right = foot + spread / 2;
  const far = 220;
  shape(svg, "polygon", {
    points: points([
      [left, ground],
      [right, ground],
      [right + dir[0] * far, ground + dir[1] * far],
      [left + dir[0] * far, ground + dir[1] * far],
    ]),
    class: "astro-beam",
  });
  shape(svg, "line", { x1: Math.max(0, left), y1: ground, x2: Math.min(SW, right), y2: ground, class: "astro-lit-ground" });
  shape(svg, "circle", { cx: foot + dir[0] * 120, cy: ground + dir[1] * 120, r: 12, class: "astro-sun" });
  // The angle, at the foot of the beam.
  const arc: [number, number][] = [];
  for (let k = 0; k <= 16; k++) {
    const t = Math.PI - (a * k) / 16;
    arc.push([foot + 34 * Math.cos(t), ground - 34 * Math.sin(t)]);
  }
  shape(svg, "polyline", { points: points(arc), class: "astro-angle" });
  shape(svg, "text", { x: foot - 44, y: ground - 8, class: "axis-label", "text-anchor": "end" }, deg(h));
  return svg;
}

const CW = 420;
const CH = 220;
const KWH_MAX = 13;

function yearChart(state: Lab): SVGSVGElement {
  const pad = { left: 36, right: 12, top: 14, bottom: 34 };
  const x = (d: number): number => pad.left + ((CW - pad.left - pad.right) * d) / 365;
  const y = (k: number): number => pad.top + (CH - pad.top - pad.bottom) * (1 - k / KWH_MAX);
  const values = Array.from({ length: 73 }, (_, i) => kwh(i * 5, state.latitude, state.tilted));
  const max = values.indexOf(Math.max(...values));
  const min = values.indexOf(Math.min(...values));
  const svg = drawing("discover-path physics-curve astro-year", CW, CH, at("sChartAria", { lat: latitudeText(state.latitude), max: monthText(monthOf(max * 5)), min: monthText(monthOf(min * 5)) }));
  for (let k = 0; k <= KWH_MAX; k += 3) {
    shape(svg, "line", { x1: pad.left, x2: CW - pad.right, y1: y(k), y2: y(k), class: "grid-line" });
    shape(svg, "text", { x: pad.left - 6, y: y(k) + 4, class: "axis-label", "text-anchor": "end" }, String(k));
  }
  for (let m = 0; m < 12; m += 2) shape(svg, "text", { x: x(MONTH_STARTS[m]! + 14), y: CH - pad.bottom + 16, class: "axis-label", "text-anchor": "middle" }, shortMonth(m));
  const curve = (tilted: boolean): string => points(Array.from({ length: 74 }, (_, i) => [x(Math.min(365, i * 5)), y(kwh(Math.min(365, i * 5), state.latitude, tilted))]));
  const both = state.revealed || state.readings.some((r) => !r.tilted);
  if (both || state.tilted) shape(svg, "polyline", { points: curve(true), class: "theory-curve" });
  if (both || !state.tilted) shape(svg, "polyline", { points: curve(false), class: "theory-curve astro-flat" });
  if (both) {
    shape(svg, "text", { x: CW - pad.right - 4, y: y(kwh(1, state.latitude, false)) - 6, class: "theory-label", "text-anchor": "end" }, at("sChartNone"));
    shape(svg, "text", { x: x(day21(5)), y: y(kwh(day21(5), state.latitude, true)) - 8, class: "theory-label", "text-anchor": "middle" }, at("sChartReal"));
  }
  for (const r of state.readings.filter((r) => r.latitude === state.latitude)) {
    shape(svg, "circle", { cx: x(r.day), cy: y(kwh(r.day, r.latitude, r.tilted)), r: 4, class: "share-dot" });
  }
  shape(svg, "line", { x1: x(state.day), x2: x(state.day), y1: pad.top, y2: CH - pad.bottom, class: "astro-today" });
  return svg;
}

const monthOf = (day: number): number => {
  let m = 0;
  while (m < 11 && MONTH_STARTS[m + 1]! <= day) m++;
  return m;
};

function labPanels(state: Lab, draw: () => void): HTMLElement[] {
  const panels: HTMLElement[] = [];
  panels.push(mineLine([at("sMineCause", { answer: causeLabel(state.cause!) }), at("sMineClosest", { answer: closestLabel(state.closest!) })]));

  const box = step(at("sStep"));
  const views = el("div", "astro-views");
  const orbit = el("figure", "astro-figure");
  const noon = el("figure", "astro-figure");
  const status = el("p", "discover-status");
  status.setAttribute("role", "status");
  const chart = panel(at("sChartTitle", { lat: latitudeText(state.latitude) }));
  const chartBox = el("div", "astro-chart-box");
  chart.append(chartBox);
  const show = (): void => {
    const s = sky(state.day, state.tilted ? TILT : 0);
    orbit.replaceChildren(el("figcaption", "discover-panel-title", at("sOrbitTitle")), orbitView(state.day, state.tilted));
    noon.replaceChildren(el("figcaption", "discover-panel-title", at("sSunTitle", { lat: latitudeText(state.latitude) })), noonView(state.latitude, s.declination));
    status.replaceChildren(
      el("strong", "", at("sReadings", { height: deg(Math.max(0, noonHeight(state.latitude, s.declination))), hours: duration(dayLength(state.latitude, s.declination)), energy: num(kwh(state.day, state.latitude, state.tilted), 1) })),
      el("span", "astro-distance", `${at("sDistance", { distance: num(s.distance * AU_MKM, 1) })}`),
    );
    chart.querySelector(".discover-panel-title")!.textContent = at("sChartTitle", { lat: latitudeText(state.latitude) });
    chartBox.replaceChildren(yearChart(state));
  };
  show();
  views.append(orbit, noon);
  box.append(views);
  const controls = el("div", "physics-controls");
  const toggles = el("div", "physics-toggles");
  toggles.append(
    toggle(at("sTiltReal"), "tilt-real", state.tilted, () => ((state.tilted = true), draw())),
    toggle(at("sTiltNone"), "tilt-none", !state.tilted, () => ((state.tilted = false), draw())),
  );
  const tiltField = el("div", "field");
  tiltField.append(el("span", "field-label", at("sTilt")), toggles);
  controls.append(
    slider({ label: at("sDate"), key: "date", min: 0, max: 364, step: 1, value: state.day, format: dateText, onInput: (d) => ((state.day = d), show()) }),
    slider({ label: at("sLatitude"), key: "latitude", min: -80, max: 80, step: 1, value: state.latitude, format: latitudeText, onInput: (l) => ((state.latitude = l), show()) }),
    tiltField,
  );
  box.append(controls, status);
  box.append(
    control("primary physics-go", at("sNote"), "note", () => {
      state.readings = [...state.readings, { day: state.day, latitude: state.latitude, tilted: state.tilted }];
      draw();
    }),
  );
  panels.push(box, chart);

  if (state.readings.length > 0) {
    const notes = panel(at("sNotesTitle"));
    const rows = state.readings
      .slice(-10)
      .reverse()
      .map((r) => {
        const s = sky(r.day, r.tilted ? TILT : 0);
        return [
          dateText(r.day),
          latitudeText(r.latitude),
          r.tilted ? `${num(TILT, 1)}°` : "0°",
          num(s.distance * AU_MKM, 1),
          deg(Math.max(0, noonHeight(r.latitude, s.declination))),
          duration(dayLength(r.latitude, s.declination)),
          num(kwh(r.day, r.latitude, r.tilted), 1),
        ];
      });
    notes.append(
      table("astro-readings", [at("sColDate"), at("sColLatitude"), at("sColTilt"), at("sColDistance"), at("sColHeight"), at("sColDay"), at("sColEnergy")], rows, (i) => i === 0),
    );
    panels.push(notes);
  }

  const distinctDays = new Set(state.readings.map((r) => r.day)).size;
  if (!state.revealed) {
    const reveal = el("div", "discover-reveal");
    reveal.append(
      ...gatedButton(pt("reveal"), "reveal", distinctDays >= REVEAL_AFTER, at("sRevealHint"), () => {
        state.revealed = true;
        draw();
        document.querySelector(".discover-compare")?.scrollIntoView({ behavior: reducedMotion() ? "auto" : "smooth", block: "start" });
      }),
    );
    panels.push(reveal);
  } else {
    panels.push(
      comparePanel(state),
      explainPanel(pt("stepExplain"), [at("sExplainTilt"), at("sExplainHeight"), at("sExplainDay"), at("sExplainDistance")]),
      checkPanel<CheckAnswer>({
        title: pt("stepCheck"),
        question: at("sCheckQuestion"),
        options: [
          { value: "summer", label: at("sCheckSummer") },
          { value: "winter", label: at("sCheckWinter") },
          { value: "spring", label: at("sCheckSpring") },
        ],
        right: "winter",
        chosen: state.check,
        onChoose: (v) => ((state.check = v), draw()),
        rightText: at("sCheckRight"),
        wrongText: at("sCheckWrong"),
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
  box.append(el("h3", "discover-panel-title", pt("formulaTitle")), el("p", "discover-intro", at("sTheoryText")));
  box.append(formula(`h = 90^\\circ - |\\varphi - \\delta|`));
  box.append(formula(`\\sin\\delta = \\sin ${num(TILT, 1).replace(",", "{,}")}^\\circ \\cdot \\sin\\lambda_\\odot`));
  box.append(formula(`\\cos H_0 = -\\tan\\varphi\\,\\tan\\delta`));
  box.append(el("p", "discover-intro", at("sTheoryDistance")));
  const june = sky(day21(5));
  const december = sky(day21(11));
  const lat = state.latitude;
  const comparison = panel(at("sCompareTable", { lat: latitudeText(lat) }));
  comparison.append(
    table(
      "astro-compare",
      [at("sColQuantity"), at("sJune"), at("sDecember")],
      [
        [at("sRowDistance"), num(june.distance * AU_MKM, 1), num(december.distance * AU_MKM, 1)],
        [at("sRowHeight"), deg(Math.max(0, noonHeight(lat, june.declination))), deg(Math.max(0, noonHeight(lat, december.declination)))],
        [at("sRowDay"), duration(dayLength(lat, june.declination)), duration(dayLength(lat, december.declination))],
        [at("sRowEnergy"), num(kwh(day21(5), lat, true), 1), num(kwh(day21(11), lat, true), 1)],
      ],
    ),
  );
  box.append(comparison);
  box.append(el("h3", "discover-panel-title", pt("youTitle")));
  box.append(
    verdict(state.cause === "tilt" ? at("sCauseRight") : state.cause === "closer" ? at("sCauseCloserWrong") : at("sCauseHotterWrong"), state.cause === "tilt"),
    verdict(state.closest === "january" ? at("sClosestRight") : at("sClosestWrong", { answer: closestLabel(state.closest!) }), state.closest === "january"),
    verdict(state.readings.some((r) => !r.tilted) ? at("sNoTiltShown") : at("sNoTiltTry")),
  );
  return box;
}
