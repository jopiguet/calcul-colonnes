/**
 * The planets' orbits, in five steps.
 *
 *   1. Predict   where a planet is fastest; how long a Mars year is
 *   2. Try       an orbit's size and stretch, in slices of equal time; Mars seen from the Earth
 *   3. Compare   Kepler's three laws; the planets; the predictions; the retrograde loop
 *   4. Explain   ellipses; equal areas; the third law; point of view
 *   5. Check     Mars goes backwards because the Earth overtakes it
 *
 * The orbits are in shared/discover/orbits.ts; `npm run check:astronomy`
 * checks them against Newton's gravity, integrated step by step.
 */
import { PLANETS, marsFromEarth, marsTrack, period, planet, planetAt, positionAt, retrogradeSpells, sectors, speedAt, type Planet } from "../../shared/discover/orbits";
import { el } from "../dom";
import type { User } from "../store";
import { checkPanel, choiceSet, control, explainPanel, mountLab, panel, reducedMotion, step } from "./lab";
import { at } from "./astro-i18n";
import { deg, num, pt } from "./physics-i18n";
import { drawing, formula, gatedButton, mineLine, physicsHead, points, restartPanel, shape, slider, table, verdict } from "./physics-ui";

export const REVEAL_AFTER = 3;
/** AU per year in km/s. */
const KM_S = 4.740_47;
export const MARS_DAYS = 800;

type FastAnswer = "near" | "far" | "same";
type MarsAnswer = "1.5" | "1.9" | "2.25" | "3.4";
type CheckAnswer = "overtake" | "reverse" | "wobble";

interface Orbit {
  a: number;
  e: number;
}

interface Lab {
  userId: number;
  step: "predict" | "lab";
  fast: FastAnswer | null;
  mars: MarsAnswer | null;
  orbit: Orbit;
  kept: Orbit[];
  day: number;
  revealed: boolean;
  check: CheckAnswer | null;
}

let lab: Lab | null = null;

const startLab = (userId: number): Lab => ({
  userId,
  step: "predict",
  fast: null,
  mars: null,
  orbit: { a: 1, e: 0.3 },
  kept: [],
  day: 420,
  revealed: false,
  check: null,
});

export const planetsBusy = (): boolean => lab !== null && lab.kept.length > 0 && lab.check === null;

const fastLabel = (a: FastAnswer): string => at(a === "near" ? "kFastNear" : a === "far" ? "kFastFar" : "kFastSame");
const marsLabel = (a: MarsAnswer): string => at(a === "1.5" ? "kMars15" : a === "1.9" ? "kMars19" : a === "2.25" ? "kMars225" : "kMars34");
const yearsText = (t: number): string => at(t < 2 ? "year1" : "years", { n: num(t, t < 10 ? 2 : 1) });
const auText = (a: number): string => at("au", { a: num(a, a < 1 ? 2 : 1) });

export function planetsView(ctx: { user: User }): HTMLElement {
  if (!lab || lab.userId !== ctx.user.id) lab = startLab(ctx.user.id);
  return mountLab("is-planets", (draw) => {
    const state = lab!;
    const head = physicsHead(at("planetsTitle"));
    return state.step === "predict" ? [head, predictPanel(state, draw)] : [head, ...labPanels(state, draw)];
  });
}

// ---------------------------------------------------------------- 1. predict

function predictPanel(state: Lab, draw: () => void): HTMLElement {
  const box = step(pt("stepPredict"));
  box.append(el("p", "discover-intro", at("kIntro")));
  box.append(
    choiceSet<FastAnswer>({
      cls: "discover-choices",
      legend: at("kPredictFast"),
      options: (["near", "far", "same"] as const).map((v) => ({ value: v, label: fastLabel(v) })),
      chosen: state.fast,
      key: "fast",
      onPick: (v) => ((state.fast = v), draw()),
    }),
    choiceSet<MarsAnswer>({
      cls: "discover-choices",
      legend: at("kPredictMars"),
      options: (["1.5", "1.9", "2.25", "3.4"] as const).map((v) => ({ value: v, label: marsLabel(v) })),
      chosen: state.mars,
      key: "mars",
      onPick: (v) => ((state.mars = v), draw()),
    }),
  );
  box.append(
    ...gatedButton(at("kPredictDone"), "predict-done", state.fast !== null && state.mars !== null, at("kPredictNeeded"), () => {
      state.step = "lab";
      draw();
    }),
  );
  return box;
}

// ---------------------------------------------------------------- 2. try

const OW = 300;
const OH = 260;

function orbitView(o: Orbit): SVGSVGElement {
  const svg = drawing("astro-kepler", OW, OH, at("kOrbitAria", { a: num(o.a, 1), e: num(o.e, 2) }));
  // The Sun at the focus; the whole ellipse fits, whatever its size.
  const width = 2 * o.a;
  const height = 2 * o.a * Math.sqrt(1 - o.e * o.e);
  const scale = Math.min((OW - 24) / width, (OH - 24) / height);
  const cx = OW / 2 + o.a * o.e * scale; // the Sun, right of the ellipse's centre: perihelion on the right
  const cy = OH / 2;
  const at2 = (p: { x: number; y: number }): [number, number] => [cx + p.x * scale, cy - p.y * scale];
  sectors(o.a, o.e, 12, 16).forEach((arc, k) => {
    shape(svg, "polygon", { points: points([[cx, cy], ...arc.map(at2)]), class: k % 2 === 0 ? "astro-sector" : "astro-sector is-alt" });
  });
  const ring: [number, number][] = [];
  for (let i = 0; i <= 120; i++) ring.push(at2(positionAt(o.a, o.e, (period(o.a) * i) / 120)));
  shape(svg, "polyline", { points: points(ring), class: "astro-orbit" });
  shape(svg, "circle", { cx, cy, r: 8, class: "astro-sun" });
  for (let k = 0; k < 12; k++) {
    const [x, y] = at2(positionAt(o.a, o.e, (period(o.a) * k) / 12));
    shape(svg, "circle", { cx: x, cy: y, r: 4, class: "astro-planet-dot" });
  }
  return svg;
}

const speeds = (o: Orbit): { fast: number; slow: number } => ({
  fast: speedAt(o.a, o.a * (1 - o.e)) * KM_S,
  slow: speedAt(o.a, o.a * (1 + o.e)) * KM_S,
});

const MW = 300;
const MH = 300;
const MARS_SCALE = 82;

function marsView(day: number): SVGSVGElement {
  const t = day / 365.25;
  const svg = drawing("astro-mars", MW, MH, at("kMarsAria", { day, longitude: deg(marsFromEarth(t)) }));
  const c: [number, number] = [MW / 2, MH / 2];
  const to = (p: { x: number; y: number }): [number, number] => [c[0] + p.x * MARS_SCALE, c[1] - p.y * MARS_SCALE];
  shape(svg, "circle", { cx: c[0], cy: c[1], r: 142, class: "astro-stars" });
  for (const p of [planet("earth"), planet("mars")]) {
    const ring: [number, number][] = [];
    for (let i = 0; i <= 90; i++) ring.push(to(planetAt(p, (period(p.a) * i) / 90)));
    shape(svg, "polyline", { points: points(ring), class: "astro-orbit" });
  }
  shape(svg, "circle", { cx: c[0], cy: c[1], r: 9, class: "astro-sun" });
  // The last 60 days of sight lines: they swing back during the loop.
  for (let back = 60; back >= 0; back -= 10) {
    const tt = Math.max(0, day - back) / 365.25;
    const [ex, ey] = to(planetAt(planet("earth"), tt));
    const [mx, my] = to(planetAt(planet("mars"), tt));
    const len = Math.hypot(mx - ex, my - ey);
    // Out to the circle of stars.
    const k = (() => {
      const dx = (mx - ex) / len;
      const dy = (my - ey) / len;
      const bx = ex - c[0];
      const by = ey - c[1];
      const b = bx * dx + by * dy;
      return -b + Math.sqrt(b * b - (bx * bx + by * by - 142 * 142));
    })();
    shape(svg, "line", { x1: ex, y1: ey, x2: ex + ((mx - ex) / len) * k, y2: ey + ((my - ey) / len) * k, class: back === 0 ? "astro-sight" : "astro-sight is-past" });
  }
  const [ex, ey] = to(planetAt(planet("earth"), t));
  const [mx, my] = to(planetAt(planet("mars"), t));
  shape(svg, "circle", { cx: ex, cy: ey, r: 6, class: "astro-earth astro-planet" });
  shape(svg, "circle", { cx: mx, cy: my, r: 5, class: "astro-mars-dot" });
  return svg;
}

let cached: { t: number; longitude: number }[] | null = null;
const track = (): { t: number; longitude: number }[] => (cached ??= marsTrack(MARS_DAYS / 365.25));

function trackChart(day: number): SVGSVGElement {
  const list = track();
  const spells = retrogradeSpells(list);
  const w = 420;
  const h = 200;
  const pad = { left: 40, right: 12, top: 12, bottom: 34 };
  const lo = Math.min(...list.map((p) => p.longitude));
  const hi = Math.max(...list.map((p) => p.longitude));
  const x = (d: number): number => pad.left + ((w - pad.left - pad.right) * d) / MARS_DAYS;
  const y = (l: number): number => pad.top + ((h - pad.top - pad.bottom) * (hi - l)) / (hi - lo);
  const svg = drawing("discover-path physics-curve astro-track", w, h, at("kTrackAria", { spells: spells.map((s) => at("days", { n: Math.round(s.days) })).join(", ") }));
  for (const s of spells) shape(svg, "rect", { x: x(s.start), y: pad.top, width: x(s.start + s.days) - x(s.start), height: h - pad.top - pad.bottom, class: "astro-band-solar" });
  for (let d = 0; d <= MARS_DAYS; d += 200) shape(svg, "text", { x: x(d), y: h - pad.bottom + 16, class: "axis-label", "text-anchor": "middle" }, String(d));
  shape(svg, "text", { x: (pad.left + w - pad.right) / 2, y: h - 4, class: "axis-title", "text-anchor": "middle" }, at("kTrackAxis"));
  shape(svg, "polyline", { points: points(list.map((p) => [x(p.t * 365.25), y(p.longitude)])), class: "theory-curve" });
  const now = list[Math.min(list.length - 1, Math.round(day))]!;
  shape(svg, "circle", { cx: x(day), cy: y(now.longitude), r: 5, class: "share-dot" });
  return svg;
}

const backwards = (day: number): boolean => {
  const list = track();
  const i = Math.max(1, Math.min(list.length - 1, Math.round(day)));
  return list[i]!.longitude < list[i - 1]!.longitude;
};

function labPanels(state: Lab, draw: () => void): HTMLElement[] {
  const panels: HTMLElement[] = [];
  panels.push(mineLine([at("kMineFast", { answer: fastLabel(state.fast!) }), at("kMineMars", { answer: marsLabel(state.mars!) })]));

  const box = step(at("kStep"));
  const figure = el("figure", "astro-figure");
  const note = el("p", "hint");
  const status = el("p", "discover-status");
  status.setAttribute("role", "status");
  const show = (): void => {
    const o = state.orbit;
    figure.replaceChildren(el("figcaption", "discover-panel-title", at("kOrbitTitle")), orbitView(o));
    const T = period(o.a);
    note.textContent = at("kOrbitNote", { step: T / 12 < 1 ? at("days", { n: Math.round((T * 365.25) / 12) }) : yearsText(T / 12) });
    const v = speeds(o);
    status.replaceChildren(el("strong", "", at("kReadings", { period: yearsText(T), fast: num(v.fast, 1), slow: num(v.slow, 1) })));
  };
  show();
  const controls = el("div", "physics-controls");
  controls.append(
    slider({ label: at("kAxis"), key: "axis", min: 0.4, max: 10, step: 0.1, value: state.orbit.a, format: auText, onInput: (a) => ((state.orbit.a = a), show()) }),
    slider({ label: at("kEccentricity"), key: "eccentricity", min: 0, max: 0.8, step: 0.05, value: state.orbit.e, format: (e) => num(e, 2), onInput: (e) => ((state.orbit.e = e), show()) }),
  );
  box.append(figure, note, controls, status);
  box.append(
    control("primary physics-go", at("kKeep"), "keep", () => {
      state.kept = [...state.kept, { ...state.orbit }];
      draw();
    }),
  );
  panels.push(box);

  if (state.kept.length > 0) {
    const kept = panel(at("kOrbitsTitle"));
    const rows = state.kept
      .slice(-10)
      .reverse()
      .map((o) => {
        const v = speeds(o);
        return [auText(o.a), num(o.e, 2), yearsText(period(o.a)), `${num(v.fast, 1)} km/s`, `${num(v.slow, 1)} km/s`];
      });
    kept.append(table("astro-orbits", [at("kColAxis"), at("kColE"), at("kColPeriod"), at("kColFast"), at("kColSlow")], rows, (i) => i === 0));
    panels.push(kept);
  }

  // Mars, seen from the Earth.
  const mars = panel(at("kMarsTitle"));
  const marsFigure = el("div", "astro-views");
  const marsStatus = el("p", "discover-status astro-mars-status");
  marsStatus.setAttribute("role", "status");
  const showMars = (): void => {
    marsFigure.replaceChildren(marsView(state.day), trackChart(state.day));
    marsStatus.textContent = backwards(state.day) ? at("kBackwards") : at("kForwards");
  };
  showMars();
  mars.append(
    marsFigure,
    slider({ label: at("kMarsDay"), key: "mars-day", min: 0, max: MARS_DAYS, step: 5, value: state.day, format: (d) => at("days", { n: d }), onInput: (d) => ((state.day = d), showMars()) }),
    marsStatus,
  );
  panels.push(mars);

  const distinct = new Set(state.kept.map((o) => `${o.a}|${o.e}`)).size;
  if (!state.revealed) {
    const reveal = el("div", "discover-reveal");
    reveal.append(
      ...gatedButton(pt("reveal"), "reveal", distinct >= REVEAL_AFTER, at("kRevealHint"), () => {
        state.revealed = true;
        draw();
        document.querySelector(".discover-compare")?.scrollIntoView({ behavior: reducedMotion() ? "auto" : "smooth", block: "start" });
      }),
    );
    panels.push(reveal);
  } else {
    panels.push(
      comparePanel(state),
      explainPanel(pt("stepExplain"), [at("kExplainEllipse"), at("kExplainAreas"), at("kExplainThird"), at("kExplainRetro")]),
      checkPanel<CheckAnswer>({
        title: pt("stepCheck"),
        question: at("kCheckQuestion"),
        options: [
          { value: "overtake", label: at("kCheckOvertake") },
          { value: "reverse", label: at("kCheckReverse") },
          { value: "wobble", label: at("kCheckWobble") },
        ],
        right: "overtake",
        chosen: state.check,
        onChoose: (v) => ((state.check = v), draw()),
        rightText: at("kCheckRight"),
        wrongText: at("kCheckWrong"),
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

const planetName = (p: Planet): string => at(`planet_${p.name}`);

function comparePanel(state: Lab): HTMLElement {
  const box = step(pt("stepCompare"), "discover-compare");
  box.append(el("h3", "discover-panel-title", pt("formulaTitle")), el("p", "discover-intro", at("kTheoryText")));
  box.append(el("p", "discover-intro", at("kLaw1")), el("p", "discover-intro", at("kLaw2")), el("p", "discover-intro", at("kLaw3")), formula(`T^2 = a^3 \\quad\\Longleftrightarrow\\quad T = a^{3/2}`));
  const list = panel(at("kPlanetsTitle"));
  list.append(
    table(
      "astro-planets",
      [at("kColPlanet"), at("kColAxis"), at("kColE"), at("kColPeriod")],
      PLANETS.map((p) => [planetName(p), auText(p.a), num(p.e, 3), yearsText(period(p.a))]),
      (i) => PLANETS[i]!.name === "mars",
    ),
  );
  box.append(list);
  box.append(el("h3", "discover-panel-title", pt("youTitle")));
  const spell = retrogradeSpells(track())[0];
  box.append(
    verdict(state.fast === "near" ? at("kFastRight") : at("kFastWrong", { answer: fastLabel(state.fast!) }), state.fast === "near"),
    verdict(state.mars === "1.9" ? at("kMarsRight") : at("kMarsWrong", { answer: marsLabel(state.mars!) }), state.mars === "1.9"),
    verdict(at("kRetroText", { days: Math.round(spell?.days ?? 70) })),
  );
  return box;
}
