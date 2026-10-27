/**
 * The Mandelbrot set, in five steps.
 *
 *   1. Predict   where c = −1 goes; what the edge looks like close up
 *   2. Try       zoom into the edge; follow a point's numbers, step by step
 *   3. Compare   the escape at 2; the points followed; an endless edge; the predictions
 *   4. Explain   one rule; the colours; small copies; an edge as rich as a surface
 *   5. Check     c = 1 is not in the set
 *
 * The arithmetic is in shared/discover/fractals.ts; `npm run check:math`
 * checks the points taught, the escape at 2, the symmetry and the area.
 */
import { MANDELBROT_HOME, MANDELBROT_POINTS, escapeTime, fate, iterationsFor, orbit } from "../../shared/discover/fractals";
import { el } from "../dom";
import type { User } from "../store";
import { checkPanel, choiceSet, control, explainPanel, mountLab, panel, reducedMotion, step } from "./lab";
import { mt } from "./math-i18n";
import { num, pt } from "./physics-i18n";
import { formula, gatedButton, mineLine, physicsHead, restartPanel, table, verdict } from "./physics-ui";

/** Magnification needed before comparing, and points followed. */
export const ZOOM_NEEDED = 64;
export const POINTS_NEEDED = 2;
/** Each zoom: ×4. */
const ZOOM = 4;

type OrbitAnswer = "escape" | "bounce" | "settle";
type EdgeAnswer = "smooth" | "detailed" | "blurry";
type CheckAnswer = "inside" | "outside" | "unknown";

interface C {
  re: number;
  im: number;
}

interface Lab {
  userId: number;
  step: "predict" | "lab";
  orbit: OrbitAnswer | null;
  edge: EdgeAnswer | null;
  view: { cx: number; cy: number; scale: number };
  deepest: number;
  mode: "zoom" | "follow";
  followed: C[];
  current: C | null;
  revealed: boolean;
  check: CheckAnswer | null;
}

let lab: Lab | null = null;
const startLab = (userId: number): Lab => ({
  userId,
  step: "predict",
  orbit: null,
  edge: null,
  view: { ...MANDELBROT_HOME },
  deepest: 1,
  mode: "zoom",
  followed: [],
  current: null,
  revealed: false,
  check: null,
});

export const mandelbrotBusy = (): boolean => lab !== null && lab.step === "lab" && lab.check === null && (lab.deepest > 1 || lab.followed.length > 0);

const orbitLabel = (a: OrbitAnswer): string => mt(a === "escape" ? "mbOrbitEscape" : a === "bounce" ? "mbOrbitBounce" : "mbOrbitSettle");
const edgeLabel = (a: EdgeAnswer): string => mt(a === "smooth" ? "mbEdgeSmooth" : a === "detailed" ? "mbEdgeDetailed" : "mbEdgeBlurry");

/** A decimal without its trailing zeros, with a true minus sign: "−0,75", "1". */
const short = (x: number, digits: number): string =>
  num(Math.abs(x) < 0.5 * 10 ** -digits ? 0 : x, digits)
    .replace(/([.,]\d*?)0+$/, "$1")
    .replace(/[.,]$/, "")
    .replace(/^-/, "−");

/** A complex number as read: "−0,75 + 0,1 i". */
export function complex(c: C, digits = 2): string {
  const re = short(c.re, digits);
  const im = short(Math.abs(c.im), digits);
  if (im === "0") return re;
  const i = im === "1" ? "i" : `${im} i`;
  if (re === "0") return `${c.im < 0 ? "−" : ""}${i}`;
  return `${re} ${c.im < 0 ? "−" : "+"} ${i}`;
}

/** What a point does, in words. */
function fateText(c: C): string {
  const f = fate(c.re, c.im);
  if (f.kind === "escapes") return mt("mbFateEscapes", { steps: f.steps });
  if (f.kind === "cycle") return f.period === 1 ? mt("mbFateSettles") : mt("mbFateCycle", { period: f.period });
  return mt("mbFateBounded");
}

export function mandelbrotView(ctx: { user: User }): HTMLElement {
  if (!lab || lab.userId !== ctx.user.id) lab = startLab(ctx.user.id);
  return mountLab("is-mandelbrot", (draw) => {
    const state = lab!;
    const head = physicsHead(mt("mandelbrotTitle"));
    return state.step === "predict" ? [head, predictPanel(state, draw)] : [head, ...labPanels(state, draw)];
  });
}

// ---------------------------------------------------------------- 1. predict

function predictPanel(state: Lab, draw: () => void): HTMLElement {
  const box = step(pt("stepPredict"));
  box.append(el("p", "discover-intro", mt("mbIntro")), formula(`z_{n+1} = z_n^2 + c,\\qquad z_0 = 0`));
  box.append(
    choiceSet<OrbitAnswer>({
      cls: "discover-choices",
      legend: mt("mbPredictOrbit"),
      options: (["escape", "bounce", "settle"] as const).map((v) => ({ value: v, label: orbitLabel(v) })),
      chosen: state.orbit,
      key: "orbit",
      onPick: (v) => ((state.orbit = v), draw()),
    }),
    choiceSet<EdgeAnswer>({
      cls: "discover-choices",
      legend: mt("mbPredictEdge"),
      options: (["smooth", "detailed", "blurry"] as const).map((v) => ({ value: v, label: edgeLabel(v) })),
      chosen: state.edge,
      key: "edge",
      onPick: (v) => ((state.edge = v), draw()),
    }),
  );
  box.append(
    ...gatedButton(mt("mbPredictDone"), "predict-done", state.orbit !== null && state.edge !== null, mt("predictNeeded"), () => {
      state.step = "lab";
      draw();
    }),
  );
  return box;
}

// ---------------------------------------------------------------- 2. try

const W = 540;
const H = 360;

/** The last picture drawn, kept: a redraw for another reason does not compute it again. */
let cache: { key: string; image: ImageData } | null = null;

/** The palette the escaping points cycle through: deep blue, light, gold, back to dark. */
const PALETTE: [number, number, number][] = [
  [0, 7, 100],
  [32, 107, 203],
  [237, 255, 255],
  [255, 170, 0],
  [0, 2, 0],
  [0, 7, 100],
];

/** The colour of a point that escapes after n steps: along the palette, by the logarithm of n, so it stays even as one zooms in. */
function colour(n: number): [number, number, number] {
  const t = ((Math.log(n + 1) * 0.42) % 1) * (PALETTE.length - 1);
  const i = Math.floor(t);
  const f = t - i;
  const a = PALETTE[i]!;
  const b = PALETTE[i + 1]!;
  return [Math.round(a[0] + (b[0] - a[0]) * f), Math.round(a[1] + (b[1] - a[1]) * f), Math.round(a[2] + (b[2] - a[2]) * f)];
}

function render(view: Lab["view"]): ImageData {
  const key = `${view.cx}|${view.cy}|${view.scale}`;
  if (cache?.key === key) return cache.image;
  const image = new ImageData(W, H);
  const max = iterationsFor(view.scale);
  const step = view.scale / W;
  const x0 = view.cx - view.scale / 2;
  const y0 = view.cy + (step * H) / 2;
  for (let py = 0; py < H; py++) {
    const ci = y0 - py * step;
    for (let px = 0; px < W; px++) {
      const n = escapeTime(x0 + px * step, ci, max);
      const o = 4 * (py * W + px);
      const [r, g, b] = n >= max ? [0, 0, 0] : colour(n);
      image.data[o] = r;
      image.data[o + 1] = g;
      image.data[o + 2] = b;
      image.data[o + 3] = 255;
    }
  }
  cache = { key, image };
  return image;
}

/** The plane's point under a pixel of the picture. */
function pointAt(view: Lab["view"], px: number, py: number): C {
  const step = view.scale / W;
  return { re: view.cx - view.scale / 2 + px * step, im: view.cy + (step * H) / 2 - py * step };
}

function toPixel(view: Lab["view"], c: C): [number, number] {
  const step = view.scale / W;
  return [(c.re - (view.cx - view.scale / 2)) / step, ((view.cy + (step * H) / 2) - c.im) / step];
}

function picture(state: Lab, onPick: (c: C) => void): HTMLElement {
  const wrap = el("figure", "math-canvas-wrap");
  const canvas = el("canvas", "math-canvas math-mandelbrot");
  canvas.width = W;
  canvas.height = H;
  const magnification = MANDELBROT_HOME.scale / state.view.scale;
  canvas.setAttribute("role", "img");
  canvas.setAttribute("aria-label", mt("mbAria", { zoom: num(magnification, 0), centre: complex({ re: state.view.cx, im: state.view.cy }, 4) }));
  const ctx = canvas.getContext("2d");
  if (ctx) {
    ctx.putImageData(render(state.view), 0, 0);
    // The point followed, and its first steps.
    if (state.current) {
      const path = orbit(state.current.re, state.current.im, 24).map((z) => toPixel(state.view, { re: z[0], im: z[1] }));
      ctx.strokeStyle = "rgba(255,255,255,0.85)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      path.forEach(([x, y], i) => (i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)));
      ctx.stroke();
      ctx.fillStyle = "#ff4d6d";
      for (const [x, y] of path.slice(1)) ctx.fillRect(x - 2.5, y - 2.5, 5, 5);
      const [cx, cy] = toPixel(state.view, state.current);
      ctx.strokeStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(cx, cy, 6, 0, 2 * Math.PI);
      ctx.stroke();
    }
  }
  canvas.addEventListener("click", (event) => {
    const box = canvas.getBoundingClientRect();
    const px = ((event.clientX - box.left) / box.width) * W;
    const py = ((event.clientY - box.top) / box.height) * H;
    onPick(pointAt(state.view, px, py));
  });
  wrap.append(canvas);
  return wrap;
}

function labPanels(state: Lab, draw: () => void): HTMLElement[] {
  const panels: HTMLElement[] = [];
  panels.push(mineLine([mt("mbMineOrbit", { answer: orbitLabel(state.orbit!) }), mt("mbMineEdge", { answer: edgeLabel(state.edge!) })]));

  const box = step(mt("mbStep"));
  const zoomTo = (cx: number, cy: number, scale: number): void => {
    state.view = { cx, cy, scale };
    state.deepest = Math.max(state.deepest, MANDELBROT_HOME.scale / scale);
    draw();
  };
  const follow = (c: C): void => {
    state.current = c;
    if (!state.followed.some((f) => Math.abs(f.re - c.re) < 1e-9 && Math.abs(f.im - c.im) < 1e-9)) state.followed = [...state.followed, c];
    draw();
  };

  const modes = el("div", "segmented compact math-modes");
  modes.append(
    control(state.mode === "zoom" ? "segment on" : "segment", mt("mbModeZoom"), "mode-zoom", () => ((state.mode = "zoom"), draw())),
    control(state.mode === "follow" ? "segment on" : "segment", mt("mbModeFollow"), "mode-follow", () => ((state.mode = "follow"), draw())),
  );
  box.append(el("p", "hint", state.mode === "zoom" ? mt("mbZoomHint") : mt("mbFollowHint")), modes);
  box.append(
    picture(state, (c) => {
      if (state.mode === "zoom") zoomTo(c.re, c.im, state.view.scale / ZOOM);
      else follow(c);
    }),
  );

  // The same moves by buttons: the keyboard, and a phone's thumb.
  const v = state.view;
  const nav = el("div", "discover-roll math-nav");
  nav.append(
    control("primary", mt("mbZoomIn"), "zoom-in", () => zoomTo(v.cx, v.cy, v.scale / ZOOM)),
    control("ghost", mt("mbZoomOut"), "zoom-out", () => zoomTo(v.cx, v.cy, Math.min(MANDELBROT_HOME.scale, v.scale * ZOOM))),
    control("ghost", "←", "pan-left", () => zoomTo(v.cx - v.scale / 4, v.cy, v.scale)),
    control("ghost", "→", "pan-right", () => zoomTo(v.cx + v.scale / 4, v.cy, v.scale)),
    control("ghost", "↑", "pan-up", () => zoomTo(v.cx, v.cy + v.scale / 6, v.scale)),
    control("ghost", "↓", "pan-down", () => zoomTo(v.cx, v.cy - v.scale / 6, v.scale)),
    control("ghost", mt("mbReset"), "reset", () => zoomTo(MANDELBROT_HOME.cx, MANDELBROT_HOME.cy, MANDELBROT_HOME.scale)),
  );
  // A famous place to zoom into: the "seahorse valley".
  nav.append(control("ghost", mt("mbSeahorse"), "seahorse", () => zoomTo(-0.7453, 0.1127, 3.2 / 256)));
  box.append(nav);
  const status = el("p", "discover-status");
  status.setAttribute("role", "status");
  status.append(
    el("strong", "", mt("mbStatus", { zoom: num(MANDELBROT_HOME.scale / v.scale, 0), centre: complex({ re: v.cx, im: v.cy }, 4) })),
    el("span", "", ` ${mt("mbDeepest", { zoom: num(state.deepest, 0) })}`),
  );
  box.append(status);
  panels.push(box);

  // Following one point: its numbers.
  const points = panel(mt("mbPointsTitle"), mt("mbPointsHint"));
  const presets = el("div", "discover-roll math-presets");
  for (const c of MANDELBROT_POINTS) {
    presets.append(control("ghost", `c = ${complex(c)}`, `c-${c.re}-${c.im}`, () => follow(c)));
  }
  points.append(presets);
  if (state.current) {
    const c = state.current;
    const zs = orbit(c.re, c.im, 10);
    points.append(el("p", "discover-status math-fate", `c = ${complex(c, 4)} : ${fateText(c)}`));
    points.append(
      table(
        "math-orbit",
        [mt("mbColStep"), "z", "|z|"],
        zs.map((z, i) => [String(i), complex({ re: z[0], im: z[1] }, 3), num(Math.hypot(z[0], z[1]), 3)]),
        (i) => Math.hypot(zs[i]![0], zs[i]![1]) > 2,
      ),
    );
  }
  if (state.followed.length > 0) {
    points.append(el("p", "hint", mt("mbFollowed", { list: state.followed.map((c) => complex(c, 3)).join(" · ") })));
  }
  panels.push(points);

  const ready = state.deepest >= ZOOM_NEEDED && state.followed.length >= POINTS_NEEDED;
  if (!state.revealed) {
    const reveal = el("div", "discover-reveal");
    reveal.append(
      ...gatedButton(pt("reveal"), "reveal", ready, mt("mbRevealHint", { zoom: ZOOM_NEEDED, points: POINTS_NEEDED }), () => {
        state.revealed = true;
        draw();
        document.querySelector(".discover-compare")?.scrollIntoView({ behavior: reducedMotion() ? "auto" : "smooth", block: "start" });
      }),
    );
    panels.push(reveal);
  } else {
    panels.push(
      comparePanel(state),
      explainPanel(pt("stepExplain"), [mt("mbExplainRule"), mt("mbExplainColours"), mt("mbExplainCopies"), mt("mbExplainEdge")]),
      checkPanel<CheckAnswer>({
        title: pt("stepCheck"),
        question: mt("mbCheckQuestion"),
        options: [
          { value: "inside", label: mt("mbCheckInside") },
          { value: "outside", label: mt("mbCheckOutside") },
          { value: "unknown", label: mt("mbCheckUnknown") },
        ],
        right: "outside",
        chosen: state.check,
        onChoose: (v) => ((state.check = v), draw()),
        rightText: mt("mbCheckRight"),
        wrongText: mt("mbCheckWrong"),
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
  box.append(el("h3", "discover-panel-title", pt("formulaTitle")), el("p", "discover-intro", mt("mbTheoryEscape")));
  box.append(formula(`|z_n| > 2 \\;\\Rightarrow\\; |z_n| \\to \\infty`));
  box.append(el("p", "discover-intro", mt("mbTheoryPoints")));
  box.append(
    table(
      "math-points",
      [mt("mbColPoint"), mt("mbColFate")],
      MANDELBROT_POINTS.map((c) => [`c = ${complex(c)}`, fateText(c)]),
      (i) => state.followed.some((f) => f.re === MANDELBROT_POINTS[i]!.re && f.im === MANDELBROT_POINTS[i]!.im),
    ),
  );
  box.append(el("p", "discover-intro", mt("mbTheoryEdge")));
  box.append(el("h3", "discover-panel-title", pt("youTitle")));
  box.append(
    verdict(state.orbit === "bounce" ? mt("mbOrbitRight") : mt("mbOrbitWrong", { answer: orbitLabel(state.orbit!) }), state.orbit === "bounce"),
    verdict(state.edge === "detailed" ? mt("mbEdgeRight", { zoom: num(state.deepest, 0) }) : mt("mbEdgeWrong", { answer: edgeLabel(state.edge!), zoom: num(state.deepest, 0) }), state.edge === "detailed"),
  );
  return box;
}
