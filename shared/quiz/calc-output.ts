/**
 * Calculus, generated: questions read on a graph or a small computation, in
 * the order of Stewart's chapters. Limits read on a graph with its holes, an
 * ε–δ band, secants and tangents, extrema from the graph of f′, Newton's
 * method, Riemann sums and areas, the area function, half-lives, l'Hospital,
 * the trapezoid and Simpson rules, improper integrals, Euler's method, slope
 * fields, a harvested logistic model, polar roses, parametric slopes,
 * geometric series, Taylor polynomials (the options are graphs), angles
 * between vectors, cross products, directional derivatives on a contour map,
 * the second-derivative test on contours, Green's theorem, Brownian motion,
 * Itô's formula and geometric Brownian motion.
 *
 * Each wrong option is what a misconception predicts. The model of each
 * question (`calc-model.ts`) goes with it; `check:quiz` computes the answer
 * again with an evaluator of its own (`server/check-calc.ts`).
 */
import type { Rng } from "./rng";
import type { Chart, Draft, Generator, Localized, MistakeKey, Option } from "./types";
import type { L3 } from "./linux/types";
import type { CalcModel, Corners, EulerEquation, FieldEquation } from "./calc-model";
import { show } from "./econ-output";

type Lang = "en" | "fr" | "es";
const LANGS: Lang[] = ["en", "fr", "es"];
const L = (t: L3): Localized => ({ en: t[0], fr: t[1], es: t[2] });
const same = (s: string): Localized => ({ en: s, fr: s, es: s });
/** A number inside TeX: French and Spanish with a decimal comma that KaTeX does not space ("2{,}5"). */
const tn = (x: number, digits: number, lang: Lang): string => show(x, digits, lang).replace(",", "{,}");
/** The same sentence in three languages, numbers written in each. */
const per = (f: (lang: Lang, n: (x: number, d?: number) => string) => string): L3 =>
  LANGS.map((lang) => f(lang, (x, d = 2) => tn(x, d, lang))) as unknown as L3;

/** A numeric option: its formula the number with fixed decimals; its text, localized. */
function numOpt(x: number, digits: number, mistake?: MistakeKey, unit = ""): Option {
  const text: Localized = {
    en: `${show(x, digits, "en")}${unit}`,
    fr: `${show(x, digits, "fr")}${unit}`,
    es: `${show(x, digits, "es")}${unit}`,
  };
  return { tex: x.toFixed(digits), text, ...(mistake ? { mistake } : {}) };
}
const textOpt = (tex: string, text: Localized, mistake?: MistakeKey): Option => ({ tex, text, ...(mistake ? { mistake } : {}) });

function draft(id: string, question: L3, graph: Chart | undefined, model: CalcModel, correct: Option, wrong: Option[], explanation: L3): Draft {
  const seen = new Set([correct.tex]);
  return {
    prompt: { key: "concept", tex: "", id, text: L(question), ...(graph ? { graph } : {}) },
    correct,
    wrong: wrong.filter((o) => !/NaN|Infinity/.test(o.tex) && !seen.has(o.tex) && seen.add(o.tex)),
    explanation: { key: "concept", tex: "", text: L(explanation) },
    verify: { kind: "calc", model },
  };
}

const polyAt = (p: number[], x: number): number => p.reduce((s, c, i) => s + c * x ** i, 0);
const polyD = (p: number[]): number[] => p.slice(1).map((c, i) => c * (i + 1));
/** A polynomial in TeX, highest degree first: "x^{2} - 3x + 1". */
function polyTex(p: number[], v = "x", lang: Lang = "en"): string {
  let out = "";
  for (let i = p.length - 1; i >= 0; i--) {
    const c = p[i]!;
    if (c === 0) continue;
    const abs = Math.abs(c);
    const coef = i === 0 ? tn(abs, 3, lang) : abs === 1 ? "" : tn(abs, 3, lang);
    const power = i === 0 ? "" : i === 1 ? v : `${v}^{${i}}`;
    out += out ? (c < 0 ? " - " : " + ") : c < 0 ? "-" : "";
    out += coef + power;
  }
  return out || "0";
}
const nice = (v: number): number => {
  const step = v > 40 ? 10 : v > 16 ? 5 : v > 8 ? 2 : 1;
  return Math.ceil(v / step) * step;
};
const range = (from: number, to: number, step = 1): number[] => {
  const out: number[] = [];
  for (let v = from; v <= to + 1e-9; v += step) out.push(Math.round(v * 1e6) / 1e6);
  return out;
};

// ------------------------------------------------------------------ limits

const DNE: L3 = ["The limit does not exist", "La limite n'existe pas", "El límite no existe"];
const UNDEFINED: L3 = ["f(a) is not defined", "f(a) n'est pas défini", "f(a) no está definido"];

/** A limit read on a graph: two pieces meeting or not at a, a hole, a dot elsewhere. */
export const limitGraph: Generator = (rng: Rng) => {
  const a = rng.int(-1, 2);
  const m1 = rng.pick([-1, -0.5, 0.5, 1]);
  const m2 = rng.pick([-1, -0.5, 0.5, 1]);
  const Lv = rng.int(-1, 3);
  const jump = rng.int(0, 4) < 3;
  const Rv = jump ? rng.pick([-2, -1, 0, 1, 2, 3, 4].filter((v) => v !== Lv)) : Lv;
  const value = rng.pick([null, Lv, Rv, rng.pick([-2, -1, 0, 1, 2, 3, 4].filter((v) => v !== Lv && v !== Rv))] as (number | null)[]);
  const ask = rng.pick(["left", "right", "two", "value"] as const);
  const left: [number, number] = [m1, Lv - m1 * a];
  const right: [number, number] = [m2, Rv - m2 * a];
  const x0 = a - 3;
  const x1 = a + 3;
  const graph: Chart = {
    type: "chart",
    x: [x0, x1],
    y: [-3, 5],
    xLabel: "x",
    yLabel: "y",
    axes: "origin",
    grid: 1,
    // At 0 the axis itself marks a, and a "0" would sit on the hollow point.
    xTicks: a === 0 ? [] : [a],
    yTicks: [-2, 2, 4],
    curves: [
      { points: [[x0, m1 * x0 + left[1]], [a, Lv]], style: "main" },
      { points: [[a, Rv], [x1, m2 * x1 + right[1]]], style: "main" },
    ],
    points: [
      ...(value !== Lv ? [{ x: a, y: Lv, open: true }] : []),
      ...(value !== Rv && Rv !== Lv ? [{ x: a, y: Rv, open: true }] : []),
      ...(value !== null ? [{ x: a, y: value }] : []),
    ],
  };
  const model: CalcModel = { type: "limitGraph", a, left, right, value, ask };
  const dne = textOpt("dne", L(DNE), "calcLimitExists");
  const undef = textOpt("undef", L(UNDEFINED), "calcValueIsLimit");
  const asked: Record<typeof ask, L3> = {
    left: per(() => `$\\lim_{x \\to ${a}^-} f(x)$`),
    right: per(() => `$\\lim_{x \\to ${a}^+} f(x)$`),
    two: per(() => `$\\lim_{x \\to ${a}} f(x)$`),
    value: per(() => `$f(${a})$`),
  };
  const two = Lv === Rv ? numOpt(Lv, 2) : textOpt("dne", L(DNE));
  const correct =
    ask === "left" ? numOpt(Lv, 2) : ask === "right" ? numOpt(Rv, 2) : ask === "two" ? two : value === null ? textOpt("undef", L(UNDEFINED)) : numOpt(value, 2);
  const wrong: Option[] = [
    numOpt(Lv, 2, ask === "value" || ask === "two" ? "calcValueIsLimit" : "calcOneSided"),
    numOpt(Rv, 2, ask === "value" || ask === "two" ? "calcValueIsLimit" : "calcOneSided"),
    ...(value !== null ? [numOpt(value, 2, "calcLimitIsValue")] : []),
    numOpt((Lv + Rv) / 2, 2, "calcLimitExists"),
    ask === "value" ? dne : undef,
    ...(ask !== "two" ? [dne] : []),
  ];
  return draft(
    `limit ${a} ${m1} ${m2} ${Lv} ${Rv} ${value} ${ask}`,
    [
      `The graph of f is drawn (an open dot: a value not taken). What is ${asked[ask][0]}?`,
      `Le graphe de f est tracé (un point creux : une valeur non prise). Que vaut ${asked[ask][1]} ?`,
      `Se dibuja la gráfica de f (un punto hueco: un valor no tomado). ¿Cuánto vale ${asked[ask][2]}?`,
    ],
    graph,
    model,
    correct,
    wrong,
    [
      `From the left the graph approaches ${Lv}, from the right ${Rv}${Lv === Rv ? ": the two agree, so the limit exists and is " + Lv : ": they differ, so the two-sided limit does not exist"}. The value f(${a}) is the filled dot${value === null ? ", and there is none: f(" + a + ") is not defined" : ", " + value}. A limit looks at the values near a, never at f(a) itself.`,
      `Par la gauche, le graphe s'approche de ${Lv}, par la droite de ${Rv}${Lv === Rv ? " : les deux coïncident, la limite existe et vaut " + Lv : " : elles diffèrent, la limite (bilatérale) n'existe pas"}. La valeur f(${a}) est le point plein${value === null ? ", et il n'y en a pas : f(" + a + ") n'est pas défini" : ", " + value}. Une limite regarde les valeurs près de a, jamais f(a) lui-même.`,
      `Por la izquierda la gráfica se acerca a ${Lv}, por la derecha a ${Rv}${Lv === Rv ? ": coinciden, así que el límite existe y vale " + Lv : ": difieren, así que el límite bilateral no existe"}. El valor f(${a}) es el punto lleno${value === null ? ", y no hay ninguno: f(" + a + ") no está definido" : ", " + value}. Un límite mira los valores cerca de a, nunca f(a) en sí.`,
    ],
  );
};

/** The precise definition: for a line, δ = ε/|m|. */
export const epsilonDelta: Generator = (rng: Rng) => {
  const m = rng.pick([1.5, 2, 3, 4, -2, -3]);
  const a = rng.int(1, 3);
  const c = rng.int(-2, 2);
  const eps = rng.pick([0.2, 0.3, 0.5, 0.6]);
  const Lv = m * a + c;
  const delta = eps / Math.abs(m);
  const graph: Chart = {
    type: "chart",
    x: [a - 1.5, a + 1.5],
    y: [Lv - 2.5, Lv + 2.5],
    xLabel: "x",
    yLabel: "y",
    xTicks: [a],
    yTicks: [Lv],
    curves: [
      { fn: (x) => m * x + c, label: "f", style: "main" },
      { fn: () => Lv + eps, label: "L + ε", style: "guide" },
      { fn: () => Lv - eps, label: "L − ε", style: "guide" },
    ],
    points: [{ x: a, y: Lv }],
  };
  return draft(
    `epsdelta ${m} ${a} ${c} ${eps}`,
    per((lang, n) => [
      `For $f(x) = ${polyTex([c, m], "x", lang)}$ and $\\varepsilon = ${n(eps, 1)}$, what is the largest $\\delta$ such that $|x - ${a}| < \\delta$ implies $|f(x) - ${n(Lv, 1)}| < \\varepsilon$?`,
      `Pour $f(x) = ${polyTex([c, m], "x", lang)}$ et $\\varepsilon = ${n(eps, 1)}$, quel est le plus grand $\\delta$ tel que $|x - ${a}| < \\delta$ entraîne $|f(x) - ${n(Lv, 1)}| < \\varepsilon$ ?`,
      `Para $f(x) = ${polyTex([c, m], "x", lang)}$ y $\\varepsilon = ${n(eps, 1)}$, ¿cuál es el mayor $\\delta$ tal que $|x - ${a}| < \\delta$ implica $|f(x) - ${n(Lv, 1)}| < \\varepsilon$?`,
    ][LANGS.indexOf(lang)]!),
    graph,
    { type: "epsilonDelta", m, c, a, eps },
    numOpt(delta, 3),
    [numOpt(eps * Math.abs(m), 3, "calcDeltaTimes"), numOpt(eps, 3, "calcDeltaSlope"), numOpt(delta / 2, 3, "calcDeltaHalf"), numOpt(2 * delta, 3, "calcDeltaHalf")],
    per((lang, n) => [
      `$|f(x) - f(${a})| = ${n(Math.abs(m), 1)}\\,|x - ${a}|$, so the distance is multiplied by the slope. It stays below ε exactly when $|x - ${a}| < \\varepsilon / ${n(Math.abs(m), 1)} = ${n(delta, 3)}$. The steeper the line, the narrower the band of x for the same ε.`,
      `$|f(x) - f(${a})| = ${n(Math.abs(m), 1)}\\,|x - ${a}|$ : l'écart est multiplié par la pente. Il reste sous ε exactement quand $|x - ${a}| < \\varepsilon / ${n(Math.abs(m), 1)} = ${n(delta, 3)}$. Plus la droite est raide, plus la bande des x est étroite pour un même ε.`,
      `$|f(x) - f(${a})| = ${n(Math.abs(m), 1)}\\,|x - ${a}|$: la distancia se multiplica por la pendiente. Queda por debajo de ε exactamente cuando $|x - ${a}| < \\varepsilon / ${n(Math.abs(m), 1)} = ${n(delta, 3)}$. Cuanto más empinada la recta, más estrecha la banda de x para el mismo ε.`,
    ][LANGS.indexOf(lang)]!),
  );
};

// -------------------------------------------------------------- derivatives

function quadratic(rng: Rng): number[] {
  return [rng.int(-2, 2), rng.int(-2, 2), rng.pick([-1, -0.5, 0.5, 1])];
}

/** The slope of a secant: an average rate of change. */
export const secantSlope: Generator = (rng: Rng) => {
  for (;;) {
    const p = quadratic(rng);
    const a = rng.int(-2, 1);
    const b = a + rng.int(1, 3);
    const fa = polyAt(p, a);
    const fb = polyAt(p, b);
    const slope = (fb - fa) / (b - a);
    const d = polyD(p);
    if (Math.max(Math.abs(fa), Math.abs(fb)) > 6) continue;
    const graph: Chart = {
      type: "chart",
      x: [-4, 4],
      y: [-6, 6],
      xLabel: "x",
      yLabel: "y",
      axes: "origin",
      grid: 1,
      xTicks: [a, b],
      curves: [
        { fn: (x) => polyAt(p, x), label: "f", style: "main" },
        { fn: (x) => fa + slope * (x - a), style: "guide" },
      ],
      points: [{ x: a, y: fa, label: "P" }, { x: b, y: fb, label: "Q" }],
    };
    return draft(
      `secant ${p.join(" ")} ${a} ${b}`,
      per((lang) => [
        `$f(x) = ${polyTex(p, "x", lang)}$. What is the average rate of change of f between $x = ${a}$ and $x = ${b}$ (the slope of PQ)?`,
        `$f(x) = ${polyTex(p, "x", lang)}$. Quel est le taux de variation moyen de f entre $x = ${a}$ et $x = ${b}$ (la pente de PQ) ?`,
        `$f(x) = ${polyTex(p, "x", lang)}$. ¿Cuál es la tasa de variación media de f entre $x = ${a}$ y $x = ${b}$ (la pendiente de PQ)?`,
      ][LANGS.indexOf(lang)]!),
      graph,
      { type: "secant", poly: p, a, b },
      numOpt(slope, 2),
      [
        numOpt(polyAt(d, a), 2, "calcSecantTangent"),
        numOpt(polyAt(d, b), 2, "calcSecantTangent"),
        numOpt(fb - fa, 2, "calcSecantRun"),
        ...(fb !== fa ? [numOpt((b - a) / (fb - fa), 2, "calcSecantInverted")] : []),
      ],
      per((lang, n) => [
        `The average rate is the rise over the run: $\\frac{f(${b}) - f(${a})}{${b} - (${a})} = \\frac{${n(fb)} - (${n(fa)})}{${b - a}} = ${n(slope)}$. The tangent's slope at one end, f′(a), is the instantaneous rate, the limit of such slopes as Q slides to P.`,
        `Le taux moyen est la variation de y sur celle de x : $\\frac{f(${b}) - f(${a})}{${b} - (${a})} = \\frac{${n(fb)} - (${n(fa)})}{${b - a}} = ${n(slope)}$. La pente de la tangente en un bout, f′(a), est le taux instantané, la limite de ces pentes quand Q glisse vers P.`,
        `La tasa media es el incremento de y sobre el de x: $\\frac{f(${b}) - f(${a})}{${b} - (${a})} = \\frac{${n(fb)} - (${n(fa)})}{${b - a}} = ${n(slope)}$. La pendiente de la tangente en un extremo, f′(a), es la tasa instantánea, el límite de esas pendientes cuando Q se desliza hacia P.`,
      ][LANGS.indexOf(lang)]!),
    );
  }
};

/** y = mx + k in TeX, with numbers in the language. */
function lineTex(m: number, k: number, lang: Lang): string {
  const slope = m === 0 ? "" : m === 1 ? "x" : m === -1 ? "-x" : `${tn(m, 2, lang)}x`;
  const constant = k === 0 ? (m === 0 ? "0" : "") : `${slope && k > 0 ? " + " : slope ? " - " : k < 0 ? "-" : ""}${tn(Math.abs(k), 2, lang)}`;
  return `y = ${slope}${constant}`;
}
const lineOpt = (m: number, k: number, mistake?: MistakeKey): Option => ({
  tex: `${m.toFixed(2)},${k.toFixed(2)}`,
  text: { en: `$${lineTex(m, k, "en")}$`, fr: `$${lineTex(m, k, "fr")}$`, es: `$${lineTex(m, k, "es")}$` },
  ...(mistake ? { mistake } : {}),
});

/** The tangent line at a point: slope f′(a) through (a, f(a)). */
export const tangentLine: Generator = (rng: Rng) => {
  for (;;) {
    const p = rng.int(0, 2) === 0 ? [rng.int(-1, 1), rng.int(-2, 2), 0, rng.pick([-0.5, 0.5])] : quadratic(rng);
    const a = rng.int(-2, 2);
    const fa = polyAt(p, a);
    const m = polyAt(polyD(p), a);
    const k = fa - m * a;
    if (Math.abs(fa) > 5 || a === 0) continue;
    const graph: Chart = {
      type: "chart",
      x: [-4, 4],
      y: [-6, 6],
      xLabel: "x",
      yLabel: "y",
      axes: "origin",
      grid: 1,
      xTicks: [a],
      curves: [{ fn: (x) => polyAt(p, x), label: "f", style: "main" }, { fn: (x) => m * x + k, style: "guide" }],
      points: [{ x: a, y: fa }],
    };
    return draft(
      `tangent ${p.join(" ")} ${a}`,
      per((lang) => [
        `$f(x) = ${polyTex(p, "x", lang)}$. What is the tangent line to the graph at $x = ${a}$?`,
        `$f(x) = ${polyTex(p, "x", lang)}$. Quelle est la tangente au graphe en $x = ${a}$ ?`,
        `$f(x) = ${polyTex(p, "x", lang)}$. ¿Cuál es la recta tangente a la gráfica en $x = ${a}$?`,
      ][LANGS.indexOf(lang)]!),
      graph,
      { type: "tangent", poly: p, a },
      lineOpt(m, k),
      [lineOpt(m, fa, "calcTangentIntercept"), lineOpt(m, fa + m * a, "calcTangentSign"), lineOpt(fa, fa - fa * a, "calcTangentSlopeValue"), lineOpt(-m, fa + m * a, "calcTangentSign")],
      per((lang, n) => [
        `The slope is $f'(${a}) = ${n(m)}$ and the line passes through $(${a}, ${n(fa)})$: $y = ${n(fa)} + ${n(m)}(x - (${a}))$, that is $${lineTex(m, k, lang)}$. The intercept is not f(a), unless a = 0.`,
        `La pente est $f'(${a}) = ${n(m)}$ et la droite passe par $(${a}\\,;\\,${n(fa)})$ : $y = ${n(fa)} + ${n(m)}(x - (${a}))$, soit $${lineTex(m, k, lang)}$. L'ordonnée à l'origine n'est pas f(a), sauf si a = 0.`,
        `La pendiente es $f'(${a}) = ${n(m)}$ y la recta pasa por $(${a}, ${n(fa)})$: $y = ${n(fa)} + ${n(m)}(x - (${a}))$, es decir $${lineTex(m, k, lang)}$. La ordenada en el origen no es f(a), salvo si a = 0.`,
      ][LANGS.indexOf(lang)]!),
    );
  }
};

// ------------------------------------------------- applications of the derivative

/** Where f has its maximum or minimum, read on the graph of f′. */
export const extremaFromDerivative: Generator = (rng: Rng) => {
  for (;;) {
    const cubic = rng.int(0, 1) === 0;
    const roots = rng.shuffle([-3, -2, -1, 0, 1, 2, 3]).slice(0, cubic ? 3 : 2).sort((x, y) => x - y);
    // Roots at least 2 apart, so each bump of f′ is tall enough to read its sign.
    if (roots.some((r, i) => i > 0 && r - roots[i - 1]! < 2)) continue;
    const lead = rng.pick([1, -1] as const);
    const scale = cubic ? 0.25 : 0.5;
    const fp = (x: number): number => scale * lead * roots.reduce((s, r) => s * (x - r), 1);
    let ask: "max" | "min";
    let answer: number;
    if (cubic) {
      ask = lead > 0 ? "max" : "min";
      answer = roots[1]!;
    } else {
      ask = rng.pick(["max", "min"] as const);
      // f′ = lead (x − r1)(x − r2): +, −, + for lead > 0.
      answer = (ask === "max") === lead > 0 ? roots[0]! : roots[1]!;
    }
    // Where f′ itself turns: f's inflection points.
    const turns = cubic
      ? (() => {
          const [r1, r2, r3] = roots as [number, number, number];
          const A = 3;
          const B = -2 * (r1 + r2 + r3);
          const C = r1 * r2 + r1 * r3 + r2 * r3;
          const disc = Math.sqrt(B * B - 4 * A * C);
          return [(-B - disc) / (2 * A), (-B + disc) / (2 * A)];
        })()
      : [(roots[0]! + roots[1]!) / 2];
    const others = roots.filter((r) => r !== answer);
    const wrong = [...others.map((r) => numOpt(r, 2, "calcMaxMin")), ...turns.map((t) => numOpt(t, 2, "calcInflection"))];
    if (new Set(wrong.map((o) => o.tex)).size < 3) continue;
    const graph: Chart = {
      type: "chart",
      x: [-4, 4],
      y: [-4, 4],
      xLabel: "x",
      yLabel: "y",
      axes: "origin",
      grid: 1,
      xTicks: [-3, -2, -1, 1, 2, 3],
      curves: [{ fn: fp, label: "f′", style: "alt" }],
    };
    const word: Record<typeof ask, L3> = { max: ["maximum", "maximum", "máximo"], min: ["minimum", "minimum", "mínimo"] };
    return draft(
      `extrema ${roots.join(" ")} ${lead} ${ask}`,
      [
        `This is the graph of the derivative f′, not of f. At which x does f have a local ${word[ask][0]}?`,
        `Voici le graphe de la dérivée f′, pas de f. En quel x f a-t-elle un ${word[ask][1]} local ?`,
        `Esta es la gráfica de la derivada f′, no de f. ¿En qué x tiene f un ${word[ask][2]} local?`,
      ],
      graph,
      { type: "extrema", roots, lead, ask },
      numOpt(answer, 2),
      wrong,
      [
        `f rises where f′ > 0 and falls where f′ < 0. A local maximum is where f′ changes from + to −, a minimum from − to +: here at x = ${answer}. Where f′ only touches its own turning points, f changes concavity: those are inflection points, not extrema.`,
        `f croît là où f′ > 0 et décroît là où f′ < 0. Un maximum local est là où f′ passe de + à −, un minimum de − à + : ici en x = ${answer}. Là où f′ atteint ses propres extrema, f change de concavité : ce sont des points d'inflexion, pas des extrema.`,
        `f crece donde f′ > 0 y decrece donde f′ < 0. Un máximo local está donde f′ pasa de + a −, un mínimo de − a +: aquí en x = ${answer}. Donde f′ alcanza sus propios extremos, f cambia de concavidad: son puntos de inflexión, no extremos.`,
      ],
    );
  }
};

/** Newton's method on x² − c or x³ − c. */
export const newtonMethod: Generator = (rng: Rng) => {
  const power = rng.pick([2, 2, 3] as const);
  const c = power === 2 ? rng.pick([2, 3, 5, 7, 10]) : rng.pick([2, 5, 10]);
  const x0 = Math.max(1, Math.round(c ** (1 / power)) + rng.pick([0, 1]));
  const steps = rng.pick([1, 2]);
  const f = (x: number): number => x ** power - c;
  const df = (x: number): number => power * x ** (power - 1);
  const iterate = (x: number, n: number, step: (x: number) => number): number => (n === 0 ? x : iterate(step(x), n - 1, step));
  const right = iterate(x0, steps, (x) => x - f(x) / df(x));
  const x1 = x0 - f(x0) / df(x0);
  const graph: Chart = {
    type: "chart",
    x: [0, x0 + 1.5],
    y: [-c - 1, nice(f(x0 + 1.5))],
    xLabel: "x",
    yLabel: "y",
    axes: "origin",
    xTicks: [x0],
    curves: [{ fn: f, label: "f", style: "main" }, { fn: (x) => f(x0) + df(x0) * (x - x0), style: "guide" }],
    points: [{ x: x0, y: f(x0) }, { x: x1, y: 0 }],
  };
  return draft(
    `newton ${power} ${c} ${x0} ${steps}`,
    per((lang) => [
      `Newton's method for $x^{${power}} - ${c} = 0$ from $x_0 = ${x0}$. What is $x_{${steps}}$?`,
      `Méthode de Newton pour $x^{${power}} - ${c} = 0$ à partir de $x_0 = ${x0}$. Que vaut $x_{${steps}}$ ?`,
      `Método de Newton para $x^{${power}} - ${c} = 0$ desde $x_0 = ${x0}$. ¿Cuánto vale $x_{${steps}}$?`,
    ][LANGS.indexOf(lang)]!),
    graph,
    { type: "newton", power, c, x0, steps },
    numOpt(right, 4),
    [
      numOpt(iterate(x0, steps, (x) => x + f(x) / df(x)), 4, "calcNewtonSign"),
      numOpt(iterate(x0, steps, (x) => x - df(x) / f(x)), 4, "calcNewtonInverted"),
      numOpt(steps === 1 ? iterate(x0, 2, (x) => x - f(x) / df(x)) : x1, 4, "calcNewtonSteps"),
      numOpt(c ** (1 / power), 4, "calcNewtonExact"),
    ],
    per((lang, n) => [
      `Each step follows the tangent down to the axis: $x_{n+1} = x_n - \\frac{f(x_n)}{f'(x_n)}$, with $f'(x) = ${power}x^{${power - 1}}$. From ${x0}: $x_1 = ${n(x1, 4)}$${steps === 2 ? `, then $x_2 = ${n(right, 4)}$` : ""}. The root itself, $\\sqrt[${power}]{${c}} = ${n(c ** (1 / power), 4)}$, is approached quickly but not reached in a step or two.`,
      `Chaque pas suit la tangente jusqu'à l'axe : $x_{n+1} = x_n - \\frac{f(x_n)}{f'(x_n)}$, avec $f'(x) = ${power}x^{${power - 1}}$. Depuis ${x0} : $x_1 = ${n(x1, 4)}$${steps === 2 ? `, puis $x_2 = ${n(right, 4)}$` : ""}. La racine elle-même, $\\sqrt[${power}]{${c}} = ${n(c ** (1 / power), 4)}$, est approchée vite mais pas atteinte en un ou deux pas.`,
      `Cada paso sigue la tangente hasta el eje: $x_{n+1} = x_n - \\frac{f(x_n)}{f'(x_n)}$, con $f'(x) = ${power}x^{${power - 1}}$. Desde ${x0}: $x_1 = ${n(x1, 4)}$${steps === 2 ? `, luego $x_2 = ${n(right, 4)}$` : ""}. La raíz misma, $\\sqrt[${power}]{${c}} = ${n(c ** (1 / power), 4)}$, se aproxima rápido pero no se alcanza en uno o dos pasos.`,
    ][LANGS.indexOf(lang)]!),
  );
};

// ---------------------------------------------------------------- integrals

/** Left, right or midpoint Riemann sum, rectangles drawn. */
export const riemannSum: Generator = (rng: Rng) => {
  const p = [rng.int(0, 2), rng.pick([0, 0.5, 1]), rng.pick([0.25, 0.5, 1])];
  const [a, b] = rng.pick([[0, 2], [1, 3], [0, 4], [1, 5]] as [number, number][]);
  const n = rng.pick([2, 4]);
  const method = rng.pick(["left", "right", "mid"] as const);
  const dx = (b - a) / n;
  const sum = (m: "left" | "right" | "mid"): number =>
    Array.from({ length: n }, (_, i) => polyAt(p, a + (i + (m === "left" ? 0 : m === "right" ? 1 : 0.5)) * dx)).reduce((s, v) => s + v, 0) * dx;
  const exact = p.reduce((s, c, i) => s + (c * (b ** (i + 1) - a ** (i + 1))) / (i + 1), 0);
  const top = polyAt(p, b + 0.5);
  const graph: Chart = {
    type: "chart",
    x: [0, b + 0.5],
    y: [0, nice(top * 1.1)],
    xLabel: "x",
    yLabel: "y",
    xTicks: range(a, b, dx),
    curves: [{ fn: (x) => polyAt(p, x), label: "f", style: "main" }],
    areas: Array.from({ length: n }, (_, i) => {
      const xl = a + i * dx;
      const h = polyAt(p, xl + (method === "left" ? 0 : method === "right" ? dx : dx / 2));
      return { points: [[xl, 0], [xl + dx, 0], [xl + dx, h], [xl, h]] as [number, number][], style: "plain" as const };
    }),
  };
  const name: Record<typeof method, L3> = { left: ["left", "à gauche", "por la izquierda"], right: ["right", "à droite", "por la derecha"], mid: ["midpoint", "au point milieu", "del punto medio"] };
  const where: Record<typeof method, L3> = {
    left: ["at its left end", "à son extrémité gauche", "en su extremo izquierdo"],
    right: ["at its right end", "à son extrémité droite", "en su extremo derecho"],
    mid: ["at its midpoint", "en son milieu", "en su punto medio"],
  };
  return draft(
    `riemann ${p.join(" ")} ${a} ${b} ${n} ${method}`,
    per((lang) => [
      `$f(x) = ${polyTex(p, "x", lang)}$ on $[${a}, ${b}]$, ${n} rectangles drawn. What is the ${name[method][0]} Riemann sum?`,
      `$f(x) = ${polyTex(p, "x", lang)}$ sur $[${a}\\,;\\,${b}]$, ${n} rectangles tracés. Que vaut la somme de Riemann ${name[method][1]} ?`,
      `$f(x) = ${polyTex(p, "x", lang)}$ en $[${a}, ${b}]$, ${n} rectángulos dibujados. ¿Cuánto vale la suma de Riemann ${name[method][2]}?`,
    ][LANGS.indexOf(lang)]!),
    graph,
    { type: "riemann", poly: p, a, b, n, method },
    numOpt(sum(method), 3),
    [
      ...(["left", "right", "mid"] as const).filter((m) => m !== method).map((m) => numOpt(sum(m), 3, "calcRiemannMethod")),
      numOpt(exact, 3, "calcRiemannExact"),
      numOpt(sum(method) / dx, 3, "calcRiemannWidth"),
    ],
    per((lang, n2) => [
      `Each rectangle has width $\\Delta x = ${n2(dx)}$ and the height of f ${where[method][0]}; the sum is $\\Delta x$ times the sum of those heights: ${n2(sum(method), 3)}. The integral itself is ${n2(exact, 3)}: the sums approach it as the rectangles narrow.`,
      `Chaque rectangle a pour largeur $\\Delta x = ${n2(dx)}$ et pour hauteur f ${where[method][1]} ; la somme vaut $\\Delta x$ fois la somme de ces hauteurs : ${n2(sum(method), 3)}. L'intégrale vaut ${n2(exact, 3)} : les sommes s'en approchent quand les rectangles s'affinent.`,
      `Cada rectángulo tiene anchura $\\Delta x = ${n2(dx)}$ y como altura f ${where[method][2]}; la suma es $\\Delta x$ por la suma de esas alturas: ${n2(sum(method), 3)}. La integral vale ${n2(exact, 3)}: las sumas se acercan a ella al estrecharse los rectángulos.`,
    ][LANGS.indexOf(lang)]!),
  );
};

/** A function through corners on [0, 6], some of it below the axis. */
function corners(rng: Rng): Corners {
  for (;;) {
    const ys = Array.from({ length: 7 }, () => rng.int(-2, 3));
    if (!ys.some((y) => y < 0) || !ys.some((y) => y > 0)) continue;
    return ys.map((y, i) => [i, y] as [number, number]);
  }
}
/** ∫ over a straight piece from (x1, y1) to (x2, y2): net, and absolute (split where it crosses zero). */
function pieceArea([x1, y1]: [number, number], [x2, y2]: [number, number]): { net: number; abs: number; pos: number } {
  const net = ((y1 + y2) / 2) * (x2 - x1);
  if (y1 * y2 >= 0) return { net, abs: Math.abs(net), pos: Math.max(0, net) };
  const xz = x1 + ((x2 - x1) * y1) / (y1 - y2);
  const a1 = (y1 / 2) * (xz - x1);
  const a2 = (y2 / 2) * (x2 - xz);
  return { net, abs: Math.abs(a1) + Math.abs(a2), pos: Math.max(0, a1) + Math.max(0, a2) };
}
function areasOf(c: Corners, upTo = Infinity): { net: number; abs: number; pos: number } {
  let net = 0, abs = 0, pos = 0;
  for (let i = 1; i < c.length; i++) {
    const [xa, ya] = c[i - 1]!;
    let [xb, yb] = c[i]!;
    if (xa >= upTo) break;
    if (xb > upTo) {
      yb = ya + ((yb - ya) * (upTo - xa)) / (xb - xa);
      xb = upTo;
    }
    const p = pieceArea([xa, ya], [xb, yb]);
    net += p.net;
    abs += p.abs;
    pos += p.pos;
  }
  return { net, abs, pos };
}
function cornerChart(c: Corners, shade: boolean, upTo = 6): Chart {
  const areas: NonNullable<Chart["areas"]> = [];
  if (shade) {
    for (let i = 1; i < c.length; i++) {
      const [xa, ya] = c[i - 1]!;
      const [xb, yb] = c[i]!;
      if (xa >= upTo) break;
      const pieces: [number, number][][] =
        ya * yb >= 0
          ? [[[xa, 0], [xa, ya], [xb, yb], [xb, 0]]]
          : (() => {
              const xz = xa + ((xb - xa) * ya) / (ya - yb);
              return [[[xa, 0], [xa, ya], [xz, 0]], [[xz, 0], [xb, yb], [xb, 0]]] as [number, number][][];
            })();
      for (const piece of pieces) {
        const mid = piece.reduce((s, [, y]) => s + y, 0);
        if (mid !== 0) areas.push({ points: piece, style: mid > 0 ? "gain" : "loss" });
      }
    }
  }
  return {
    type: "chart",
    x: [0, 6.5],
    y: [-3, 4],
    xLabel: "x",
    yLabel: "y",
    axes: "origin",
    grid: 1,
    xTicks: [1, 2, 3, 4, 5, 6],
    yTicks: [-2, -1, 1, 2, 3],
    curves: [{ points: c, label: "f", style: "main" }],
    areas,
  };
}

/** The integral of a function drawn, from its areas: net or total. */
export const netArea: Generator = (rng: Rng) => {
  for (;;) {
    const c = corners(rng);
    const ask = rng.pick(["net", "total"] as const);
    const { net, abs, pos } = areasOf(c);
    if (Math.abs(net - abs) < 0.5) continue;
    return draft(
      `net ${c.map(([, y]) => y).join(" ")} ${ask}`,
      ask === "net"
        ? ["What is $\\int_0^6 f(x)\\,dx$ for the function drawn?", "Que vaut $\\int_0^6 f(x)\\,dx$ pour la fonction tracée ?", "¿Cuánto vale $\\int_0^6 f(x)\\,dx$ para la función dibujada?"]
        : ["What is the total area between the graph drawn and the x-axis, from 0 to 6, that is $\\int_0^6 |f(x)|\\,dx$?", "Quelle est l'aire totale entre le graphe tracé et l'axe des x, de 0 à 6, c'est-à-dire $\\int_0^6 |f(x)|\\,dx$ ?", "¿Cuál es el área total entre la gráfica dibujada y el eje x, de 0 a 6, es decir $\\int_0^6 |f(x)|\\,dx$?"],
      cornerChart(c, true),
      { type: "netArea", corners: c, ask },
      numOpt(ask === "net" ? net : abs, 2),
      [numOpt(ask === "net" ? abs : net, 2, "calcNetTotal"), numOpt(pos, 2, "calcAreaBelow"), numOpt(ask === "net" ? -net : -abs, 2, "signError"), numOpt(pos - (abs - pos) / 2, 2, "calcAreaBelow")],
      per((lang, n) => [
        `Count each triangle and trapezoid between the graph and the axis: above the axis ${n(pos)}, below ${n(abs - pos)}. The integral subtracts the part below: ${n(pos)} − ${n(abs - pos)} = ${n(net)}. The total area adds them: ${n(abs)}.`,
        `On compte chaque triangle et trapèze entre le graphe et l'axe : au-dessus ${n(pos)}, en dessous ${n(abs - pos)}. L'intégrale retranche la partie sous l'axe : ${n(pos)} − ${n(abs - pos)} = ${n(net)}. L'aire totale les additionne : ${n(abs)}.`,
        `Se cuenta cada triángulo y trapecio entre la gráfica y el eje: por encima ${n(pos)}, por debajo ${n(abs - pos)}. La integral resta la parte de abajo: ${n(pos)} − ${n(abs - pos)} = ${n(net)}. El área total las suma: ${n(abs)}.`,
      ][LANGS.indexOf(lang)]!),
    );
  }
};

/** g(x) = ∫₀ˣ f(t) dt, f drawn: g(c) is an area, g′(c) = f(c). */
export const areaFunction: Generator = (rng: Rng) => {
  for (;;) {
    const c = corners(rng);
    const at = rng.int(2, 6);
    const ask = rng.pick(["g", "gprime"] as const);
    const g = areasOf(c, at).net;
    const fc = c[at]![1];
    const slope = c[at]![1] - c[at - 1]![1];
    const right = ask === "g" ? g : fc;
    const wrong = ask === "g"
      ? [numOpt(fc, 2, "calcFtcConfused"), numOpt(areasOf(c, at).abs, 2, "calcNetTotal"), numOpt(areasOf(c, at - 1).net, 2, "calcFtcBounds"), numOpt(areasOf(c).net, 2, "calcFtcBounds")]
      : [numOpt(g, 2, "calcFtcConfused"), numOpt(slope, 2, "calcFtcDerivative"), numOpt(0, 2, "calcFtcConstant"), numOpt(c[at - 1]![1], 2, "calcFtcBounds")];
    if (new Set(wrong.map((o) => o.tex).filter((t) => t !== right.toFixed(2))).size < 3) continue;
    return draft(
      `areafn ${c.map(([, y]) => y).join(" ")} ${at} ${ask}`,
      ask === "g"
        ? [`The graph of f is drawn, and $g(x) = \\int_0^x f(t)\\,dt$. What is $g(${at})$?`, `Le graphe de f est tracé, et $g(x) = \\int_0^x f(t)\\,dt$. Que vaut $g(${at})$ ?`, `Se dibuja la gráfica de f, y $g(x) = \\int_0^x f(t)\\,dt$. ¿Cuánto vale $g(${at})$?`]
        : [`The graph of f is drawn, and $g(x) = \\int_0^x f(t)\\,dt$. What is $g'(${at})$?`, `Le graphe de f est tracé, et $g(x) = \\int_0^x f(t)\\,dt$. Que vaut $g'(${at})$ ?`, `Se dibuja la gráfica de f, y $g(x) = \\int_0^x f(t)\\,dt$. ¿Cuánto vale $g'(${at})$?`],
      cornerChart(c, ask === "g", at),
      { type: "areaFunction", corners: c, c: at, ask },
      numOpt(right, 2),
      wrong,
      per((lang, n) => [
        ask === "g"
          ? `g(${at}) is the signed area under f from 0 to ${at}, the parts below the axis counted negative: ${n(g)}. Its derivative is f itself (the Fundamental Theorem, part 1), so g′(${at}) = f(${at}) = ${fc}.`
          : `By the Fundamental Theorem (part 1), g′(x) = f(x): g′(${at}) is the height of the graph at ${at}, ${fc}. The area so far, g(${at}) = ${n(g)}, is another thing; the slope of f there is f′, not g′.`,
        ask === "g"
          ? `g(${at}) est l'aire signée sous f de 0 à ${at}, les parties sous l'axe comptées négatives : ${n(g)}. Sa dérivée est f elle-même (théorème fondamental, première partie), donc g′(${at}) = f(${at}) = ${fc}.`
          : `D'après le théorème fondamental (première partie), g′(x) = f(x) : g′(${at}) est la hauteur du graphe en ${at}, ${fc}. L'aire accumulée, g(${at}) = ${n(g)}, est autre chose ; la pente de f à cet endroit est f′, pas g′.`,
        ask === "g"
          ? `g(${at}) es el área con signo bajo f de 0 a ${at}, las partes bajo el eje contadas negativas: ${n(g)}. Su derivada es la propia f (teorema fundamental, primera parte), así que g′(${at}) = f(${at}) = ${fc}.`
          : `Por el teorema fundamental (primera parte), g′(x) = f(x): g′(${at}) es la altura de la gráfica en ${at}, ${fc}. El área acumulada, g(${at}) = ${n(g)}, es otra cosa; la pendiente de f allí es f′, no g′.`,
      ][LANGS.indexOf(lang)]!),
    );
  }
};

// --------------------------------------------------- inverse functions, exp, log

/** Exponential decay: the half-life is ln 2 / k. */
export const halfLife: Generator = (rng: Rng) => {
  const k = rng.pick([0.05, 0.1, 0.2, 0.25, 0.35, 0.5]);
  const y0 = rng.pick([50, 80, 100]);
  const half = Math.log(2) / k;
  const graph: Chart = {
    type: "chart",
    x: [0, nice(3 * half)],
    y: [0, y0 * 1.15],
    xLabel: "t",
    yLabel: "y",
    yTicks: [y0 / 2, y0],
    curves: [{ fn: (t) => y0 * Math.exp(-k * t), label: "y", style: "main" }, { fn: () => y0 / 2, style: "guide" }],
  };
  return draft(
    `half ${k} ${y0}`,
    per((lang, n) => [
      `$y(t) = ${y0}\\,e^{-${n(k)}t}$. After what time is half of it left?`,
      `$y(t) = ${y0}\\,e^{-${n(k)}t}$. Au bout de combien de temps en reste-t-il la moitié ?`,
      `$y(t) = ${y0}\\,e^{-${n(k)}t}$. ¿Al cabo de cuánto tiempo queda la mitad?`,
    ][LANGS.indexOf(lang)]!),
    graph,
    { type: "halfLife", k, y0 },
    numOpt(half, 2),
    [numOpt(1 / k, 2, "calcHalfLifeMean"), numOpt(0.5 / k, 2, "calcHalfLifeLinear"), numOpt(k * Math.log(2), 2, "calcHalfLifeInverted"), numOpt(y0 / 2 / (k * y0), 2, "calcHalfLifeLinear")],
    per((lang, n) => [
      `Solve $e^{-kt} = \\tfrac12$: $-kt = \\ln\\tfrac12 = -\\ln 2$, so $t = \\frac{\\ln 2}{k} = \\frac{${n(Math.log(2), 4)}}{${n(k)}} = ${n(half)}$, whatever $y_0$. $\\frac1k = ${n(1 / k)}$ is the mean lifetime, the time to fall to $\\frac1e$.`,
      `On résout $e^{-kt} = \\tfrac12$ : $-kt = \\ln\\tfrac12 = -\\ln 2$, donc $t = \\frac{\\ln 2}{k} = \\frac{${n(Math.log(2), 4)}}{${n(k)}} = ${n(half)}$, quel que soit $y_0$. $\\frac1k = ${n(1 / k)}$ est la durée de vie moyenne, le temps pour tomber à $\\frac1e$.`,
      `Se resuelve $e^{-kt} = \\tfrac12$: $-kt = \\ln\\tfrac12 = -\\ln 2$, así que $t = \\frac{\\ln 2}{k} = \\frac{${n(Math.log(2), 4)}}{${n(k)}} = ${n(half)}$, sea cual sea $y_0$. $\\frac1k = ${n(1 / k)}$ es la vida media, el tiempo para caer a $\\frac1e$.`,
    ][LANGS.indexOf(lang)]!),
  );
};

const gcd = (a: number, b: number): number => (b === 0 ? Math.abs(a) : gcd(b, a % b));
/** p/q reduced, as "p/q" or "p"; TeX "\frac{p}{q}". */
function fracOpt(p: number, q: number, mistake?: MistakeKey): Option {
  const g = gcd(p, q) || 1;
  let [n, d] = [p / g, q / g];
  if (d < 0) [n, d] = [-n, -d];
  const tex = d === 1 ? String(n) : `${n}/${d}`;
  const shown = d === 1 ? String(n) : `${n < 0 ? "-" : ""}\\frac{${Math.abs(n)}}{${d}}`;
  return { tex, text: same(`$${shown}$`), ...(mistake ? { mistake } : {}) };
}

/** 0/0 at 0: l'Hospital, or the standard limits. */
export const lhopital: Generator = (rng: Rng) => {
  for (;;) {
    const kind = rng.pick(["exp", "sin", "log"] as const);
    const a = rng.pick([-3, -2, 1, 2, 3, 4, 5]);
    const b = rng.pick([1, 2, 3, 4, 6]);
    if (a === b || Math.abs(a) === b) continue;
    const ax = a === 1 ? "x" : `${a}x`;
    const top = { exp: `e^{${ax}} - 1`, sin: `\\sin(${ax})`, log: `\\ln(1 + ${ax})` }[kind].replace("1 + -", "1 - ");
    const name = { exp: `e^{${ax}}`, sin: `\\sin(${ax})`, log: `\\ln(1 + ${ax})` }[kind];
    return draft(
      `lhop ${kind} ${a} ${b}`,
      [
        `What is $\\lim_{x \\to 0} \\dfrac{${top}}{${b}x}$?`,
        `Que vaut $\\lim_{x \\to 0} \\dfrac{${top}}{${b}x}$ ?`,
        `¿Cuánto vale $\\lim_{x \\to 0} \\dfrac{${top}}{${b}x}$?`,
      ],
      undefined,
      { type: "lhopital", kind, a, b },
      fracOpt(a, b),
      [fracOpt(b, a, "calcLhopitalInverted"), fracOpt(0, 1, "calcLimitZeroOverZero"), fracOpt(1, 1, "calcLimitZeroOverZero"), fracOpt(a * b, 1, "calcLhopitalQuotient")],
      [
        `At 0 both top and bottom are 0: an indeterminate form. l'Hospital's rule takes the ratio of the derivatives: the derivative of $${name}$ at 0 is ${a}, that of $${b}x$ is ${b}, so the limit is ${a}/${b}. Neither 0 nor 1: 0/0 can be anything.`,
        `En 0, le numérateur et le dénominateur valent 0 : une forme indéterminée. La règle de l'Hospital prend le quotient des dérivées : celle de $${name}$ vaut ${a} en 0, celle de $${b}x$ vaut ${b}, donc la limite vaut ${a}/${b}. Ni 0 ni 1 : 0/0 peut valoir n'importe quoi.`,
        `En 0, numerador y denominador valen 0: una forma indeterminada. La regla de l'Hôpital toma el cociente de las derivadas: la de $${name}$ vale ${a} en 0, la de $${b}x$ vale ${b}, así que el límite es ${a}/${b}. Ni 0 ni 1: 0/0 puede valer cualquier cosa.`,
      ],
    );
  }
};

// ------------------------------------------------------ techniques of integration

const NUMERIC: Record<"inv" | "sqrt" | "gauss" | "cube", { f: (x: number) => number; tex: string; a: number; b: number; exact: number }> = {
  inv: { f: (x) => 1 / x, tex: "\\frac{1}{x}", a: 1, b: 3, exact: Math.log(3) },
  sqrt: { f: (x) => Math.sqrt(x), tex: "\\sqrt{x}", a: 0, b: 4, exact: 16 / 3 },
  gauss: { f: (x) => Math.exp(-x * x), tex: "e^{-x^2}", a: 0, b: 2, exact: 0.882081390762422 },
  cube: { f: (x) => x ** 3, tex: "x^3", a: 0, b: 2, exact: 4 },
};

function approximate(f: (x: number) => number, a: number, b: number, n: number, method: "trapezoid" | "simpson" | "mid"): number {
  const h = (b - a) / n;
  if (method === "mid") return h * Array.from({ length: n }, (_, i) => f(a + (i + 0.5) * h)).reduce((s, v) => s + v, 0);
  const ys = Array.from({ length: n + 1 }, (_, i) => f(a + i * h));
  if (method === "trapezoid") return (h / 2) * ys.reduce((s, y, i) => s + (i === 0 || i === n ? y : 2 * y), 0);
  return (h / 3) * ys.reduce((s, y, i) => s + (i === 0 || i === n ? y : i % 2 === 1 ? 4 * y : 2 * y), 0);
}

/** The trapezoid and Simpson rules. */
export const numericIntegral: Generator = (rng: Rng) => {
  const fn = rng.pick(["inv", "sqrt", "gauss", "cube"] as const);
  const { f, tex, a, b, exact } = NUMERIC[fn];
  const n = 4;
  const method = rng.pick(["trapezoid", "simpson"] as const);
  const h = (b - a) / n;
  const value = approximate(f, a, b, n, method);
  const graph: Chart = {
    type: "chart",
    x: [0, b + 0.3],
    y: [0, nice(f(fn === "inv" ? a : b) * 1.15) || 1.2],
    xLabel: "x",
    yLabel: "y",
    xTicks: range(a, b, h),
    curves: [{ fn: (x) => (x > 0 || fn !== "inv" ? f(x) : Number.NaN), label: "f", style: "main" }],
    areas:
      method === "trapezoid"
        ? Array.from({ length: n }, (_, i) => {
            const x1 = a + i * h;
            return { points: [[x1, 0], [x1 + h, 0], [x1 + h, f(x1 + h)], [x1, f(x1)]] as [number, number][], style: "plain" as const };
          })
        : [],
    points: method === "simpson" ? Array.from({ length: n + 1 }, (_, i) => ({ x: a + i * h, y: f(a + i * h) })) : [],
  };
  const name: L3 = method === "trapezoid" ? ["trapezoid rule", "méthode des trapèzes", "regla del trapecio"] : ["Simpson's rule", "méthode de Simpson", "regla de Simpson"];
  return draft(
    `numeric ${fn} ${method}`,
    [
      `What does the ${name[0]} with $n = ${n}$ give for $\\int_{${a}}^{${b}} ${tex}\\,dx$?`,
      `Que donne la ${name[1]} avec $n = ${n}$ pour $\\int_{${a}}^{${b}} ${tex}\\,dx$ ?`,
      `¿Qué da la ${name[2]} con $n = ${n}$ para $\\int_{${a}}^{${b}} ${tex}\\,dx$?`,
    ],
    graph,
    { type: "numeric", fn, a, b, n, method },
    numOpt(value, 3),
    [
      numOpt(approximate(f, a, b, n, method === "trapezoid" ? "simpson" : "trapezoid"), 3, "calcNumericRule"),
      numOpt(approximate(f, a, b, n, "mid"), 3, "calcNumericRule"),
      numOpt(exact, 3, "calcRiemannExact"),
      numOpt(method === "trapezoid" ? value * 2 : value * 1.5, 3, "calcNumericWeights"),
    ],
    per((lang, n2) => [
      method === "trapezoid"
        ? `$T_{${n}} = \\frac{h}{2}\\,[y_0 + 2y_1 + 2y_2 + 2y_3 + y_4]$ with $h = ${n2(h)}$: ${n2(value, 3)}. The exact value is ${n2(exact, 3)}; Simpson's rule, which fits parabolas, is usually much closer.`
        : `$S_{${n}} = \\frac{h}{3}\\,[y_0 + 4y_1 + 2y_2 + 4y_3 + y_4]$ with $h = ${n2(h)}$: ${n2(value, 3)}. The exact value is ${n2(exact, 3)}. Simpson fits a parabola on each pair of intervals: its error falls like $h^4$, the trapezoids' like $h^2$.`,
      method === "trapezoid"
        ? `$T_{${n}} = \\frac{h}{2}\\,[y_0 + 2y_1 + 2y_2 + 2y_3 + y_4]$ avec $h = ${n2(h)}$ : ${n2(value, 3)}. La valeur exacte est ${n2(exact, 3)} ; la méthode de Simpson, qui ajuste des paraboles, en est d'ordinaire bien plus proche.`
        : `$S_{${n}} = \\frac{h}{3}\\,[y_0 + 4y_1 + 2y_2 + 4y_3 + y_4]$ avec $h = ${n2(h)}$ : ${n2(value, 3)}. La valeur exacte est ${n2(exact, 3)}. Simpson ajuste une parabole sur chaque paire d'intervalles : son erreur décroît comme $h^4$, celle des trapèzes comme $h^2$.`,
      method === "trapezoid"
        ? `$T_{${n}} = \\frac{h}{2}\\,[y_0 + 2y_1 + 2y_2 + 2y_3 + y_4]$ con $h = ${n2(h)}$: ${n2(value, 3)}. El valor exacto es ${n2(exact, 3)}; la regla de Simpson, que ajusta parábolas, suele quedar mucho más cerca.`
        : `$S_{${n}} = \\frac{h}{3}\\,[y_0 + 4y_1 + 2y_2 + 4y_3 + y_4]$ con $h = ${n2(h)}$: ${n2(value, 3)}. El valor exacto es ${n2(exact, 3)}. Simpson ajusta una parábola en cada par de intervalos: su error baja como $h^4$, el de los trapecios como $h^2$.`,
    ][LANGS.indexOf(lang)]!),
  );
};

const DIV: L3 = ["It diverges", "Elle diverge", "Diverge"];

/** ∫₁^∞ x^(−p): converges for p > 1, to 1/(p − 1). */
export const improperIntegral: Generator = (rng: Rng) => {
  const [num, den] = rng.pick([[1, 2], [1, 1], [3, 2], [2, 1], [3, 1], [4, 1], [5, 4], [5, 2]] as [number, number][]);
  const p = num / den;
  const ptex = den === 1 ? String(num) : `\\frac{${num}}{${den}}`;
  const div = textOpt("div", L(DIV));
  const right = p > 1 ? fracOpt(den, num - den) : div;
  const graph: Chart = {
    type: "chart",
    x: [0, 6],
    y: [0, 1.3],
    xLabel: "x",
    yLabel: "y",
    xTicks: [1],
    yTicks: [1],
    curves: [{ fn: (x) => (x > 0.2 ? x ** -p : Number.NaN), style: "main" }],
    areas: [{ points: [[1, 0], ...range(1, 6, 0.25).map((x) => [x, x ** -p] as [number, number]), [6, 0]], style: "gain" }],
  };
  return draft(
    `improper ${num} ${den}`,
    [
      `What is $\\int_1^{\\infty} x^{-${ptex}}\\,dx$?`,
      `Que vaut $\\int_1^{\\infty} x^{-${ptex}}\\,dx$ ?`,
      `¿Cuánto vale $\\int_1^{\\infty} x^{-${ptex}}\\,dx$?`,
    ],
    graph,
    { type: "improper", num, den },
    right,
    [
      p > 1 ? { ...div, mistake: "calcImproperP" as MistakeKey } : fracOpt(den, Math.abs(num - den) || 1, "calcImproperP"),
      fracOpt(den, num + den, "calcImproperPower"),
      fracOpt(den, num, "calcImproperPower"),
      ...(p > 1 ? [fracOpt(1, 1, "calcImproperP")] : [fracOpt(0, 1, "calcImproperTail")]),
    ],
    [
      `$\\int_1^t x^{-p}\\,dx = \\frac{t^{1-p} - 1}{1 - p}$ (and $\\ln t$ for p = 1). As $t \\to \\infty$, $t^{1-p} \\to 0$ only if $p > 1$; the integral is then $\\frac{1}{p - 1}$. For $p \\le 1$ it grows without bound, even though $x^{-p} \\to 0$: a function tending to 0 is not enough.`,
      `$\\int_1^t x^{-p}\\,dx = \\frac{t^{1-p} - 1}{1 - p}$ (et $\\ln t$ pour p = 1). Quand $t \\to \\infty$, $t^{1-p} \\to 0$ seulement si $p > 1$ ; l'intégrale vaut alors $\\frac{1}{p - 1}$. Pour $p \\le 1$, elle croît sans borne, bien que $x^{-p} \\to 0$ : tendre vers 0 ne suffit pas.`,
      `$\\int_1^t x^{-p}\\,dx = \\frac{t^{1-p} - 1}{1 - p}$ (y $\\ln t$ para p = 1). Cuando $t \\to \\infty$, $t^{1-p} \\to 0$ solo si $p > 1$; la integral vale entonces $\\frac{1}{p - 1}$. Para $p \\le 1$ crece sin límite, aunque $x^{-p} \\to 0$: tender a 0 no basta.`,
    ],
  );
};

// ------------------------------------------------------ differential equations

const EULER: Record<EulerEquation, { F: (x: number, y: number) => number; tex: string; exact: (x: number, y0: number) => number }> = {
  "x+y": { F: (x, y) => x + y, tex: "x + y", exact: (x, y0) => (y0 + 1) * Math.exp(x) - x - 1 },
  "x-y": { F: (x, y) => x - y, tex: "x - y", exact: (x, y0) => x - 1 + (y0 + 1) * Math.exp(-x) },
  y: { F: (_, y) => y, tex: "y", exact: (x, y0) => y0 * Math.exp(x) },
  xy: { F: (x, y) => x * y, tex: "xy", exact: (x, y0) => y0 * Math.exp((x * x) / 2) },
  x: { F: (x) => x, tex: "x", exact: (x, y0) => y0 + (x * x) / 2 },
};

/** Euler's method, the polygon drawn on the slope field. */
export const eulerMethod: Generator = (rng: Rng) => {
  const eq = rng.pick(["x+y", "x-y", "y", "xy", "x"] as const);
  const y0 = rng.pick([1, 2, 0.5]);
  const h = rng.pick([0.1, 0.2, 0.5]);
  const n = rng.pick([2, 3]);
  const { F, tex, exact } = EULER[eq];
  const run = (steps: number, slope: (x: number, y: number, h: number) => number): number[] => {
    const ys = [y0];
    for (let i = 0; i < steps; i++) ys.push(ys[i]! + h * slope(i * h, ys[i]!, h));
    return ys;
  };
  const ys = run(n, (x, y) => F(x, y));
  const right = ys[n]!;
  const top = Math.max(...ys, exact(n * h, y0));
  const graph: Chart = {
    type: "chart",
    x: [0, n * h * 1.25],
    y: [Math.min(0, ...ys) , nice(top * 1.3) || 1],
    xLabel: "x",
    yLabel: "y",
    xTicks: range(0, n * h, h),
    field: { fn: (x, y) => [1, F(x, y)], count: 8 },
    curves: [
      { fn: (x) => exact(x, y0), style: "guide" },
      { points: ys.map((y, i) => [i * h, y] as [number, number]), style: "main" },
    ],
    points: ys.map((y, i) => ({ x: i * h, y })),
  };
  return draft(
    `euler ${eq} ${y0} ${h} ${n}`,
    per((lang, nm) => [
      `$y' = ${tex}$, $y(0) = ${nm(y0, 1)}$. Euler's method with step $h = ${nm(h, 1)}$: what is the approximation of $y(${nm(n * h, 1)})$?`,
      `$y' = ${tex}$, $y(0) = ${nm(y0, 1)}$. Méthode d'Euler avec un pas $h = ${nm(h, 1)}$ : quelle est l'approximation de $y(${nm(n * h, 1)})$ ?`,
      `$y' = ${tex}$, $y(0) = ${nm(y0, 1)}$. Método de Euler con paso $h = ${nm(h, 1)}$: ¿cuál es la aproximación de $y(${nm(n * h, 1)})$?`,
    ][LANGS.indexOf(lang)]!),
    graph,
    { type: "euler", eq, x0: 0, y0, h, n },
    numOpt(right, 4),
    [
      numOpt(ys[n - 1]!, 4, "calcEulerSteps"),
      numOpt(exact(n * h, y0), 4, "calcEulerExact"),
      numOpt(run(n, (x, y, step) => F(x + step, y))[n]!, 4, "calcEulerSlope"),
      numOpt(y0 + n * h * F(0, y0), 4, "calcEulerSlope"),
    ],
    per((lang, nm) => [
      `Each step: $y_{k+1} = y_k + h\\,F(x_k, y_k)$, the slope taken where you are. ${ys.map((y, i) => `$y_${i} = ${nm(y, 4)}$`).join(", ")}. The exact solution gives ${nm(exact(n * h, y0), 4)}: Euler follows the field in straight steps and drifts from the curve, less so as h shrinks.`,
      `À chaque pas : $y_{k+1} = y_k + h\\,F(x_k, y_k)$, la pente prise là où l'on est. ${ys.map((y, i) => `$y_${i} = ${nm(y, 4)}$`).join(", ")}. La solution exacte donne ${nm(exact(n * h, y0), 4)} : Euler suit le champ par segments et s'écarte de la courbe, d'autant moins que h est petit.`,
      `En cada paso: $y_{k+1} = y_k + h\\,F(x_k, y_k)$, la pendiente tomada donde se está. ${ys.map((y, i) => `$y_${i} = ${nm(y, 4)}$`).join(", ")}. La solución exacta da ${nm(exact(n * h, y0), 4)}: Euler sigue el campo a tramos rectos y se aparta de la curva, menos cuanto menor es h.`,
    ][LANGS.indexOf(lang)]!),
  );
};

const FIELDS: Record<FieldEquation, { F: (x: number, y: number) => number; tex: string }> = {
  x: { F: (x) => x, tex: "x" },
  y: { F: (_, y) => y, tex: "y" },
  "-y": { F: (_, y) => -y, tex: "-y" },
  "x+y": { F: (x, y) => x + y, tex: "x + y" },
  "x-y": { F: (x, y) => x - y, tex: "x - y" },
  "-x/y": { F: (x, y) => -x / y, tex: "-\\frac{x}{y}" },
  "y(1-y)": { F: (_, y) => y * (1 - y), tex: "y(1 - y)" },
  xy: { F: (x, y) => x * y, tex: "xy" },
};

/** Which equation has this slope field? */
export const slopeField: Generator = (rng: Rng) => {
  const all = Object.keys(FIELDS) as FieldEquation[];
  const eq = rng.pick(all);
  const others = rng.shuffle(all.filter((e) => e !== eq)).slice(0, 4);
  const opt = (e: FieldEquation, mistake?: MistakeKey): Option => textOpt(e, same(`$y' = ${FIELDS[e].tex}$`), mistake);
  const graph: Chart = {
    type: "chart",
    x: [-3, 3],
    y: [-3, 3],
    xLabel: "x",
    yLabel: "y",
    axes: "origin",
    square: true,
    xTicks: [-2, 2],
    yTicks: [-2, 2],
    field: { fn: (x, y) => [1, FIELDS[eq].F(x, y)], count: 9 },
    curves: [],
  };
  return draft(
    `field ${eq}`,
    [
      "Which differential equation has this slope field?",
      "Quelle équation différentielle a ce champ des pentes ?",
      "¿Qué ecuación diferencial tiene este campo de pendientes?",
    ],
    graph,
    { type: "slopeField", eq },
    opt(eq),
    others.map((e) => opt(e, "calcFieldReading")),
    [
      `Read the slopes where they are simple: along the axes (x = 0, y = 0), where they are flat (the isocline F = 0), and how they change with x and with y. For $y' = ${FIELDS[eq].tex}$, the slope at a point is ${FIELDS[eq].tex} there; each segment is tangent to the solution curve through it.`,
      `On lit les pentes là où elles sont simples : sur les axes (x = 0, y = 0), là où elles sont horizontales (l'isocline F = 0), et comment elles varient avec x et avec y. Pour $y' = ${FIELDS[eq].tex}$, la pente en un point vaut ${FIELDS[eq].tex} en ce point ; chaque segment est tangent à la solution qui y passe.`,
      `Se leen las pendientes donde son simples: sobre los ejes (x = 0, y = 0), donde son horizontales (la isoclina F = 0), y cómo cambian con x y con y. Para $y' = ${FIELDS[eq].tex}$, la pendiente en un punto vale ${FIELDS[eq].tex} allí; cada segmento es tangente a la solución que pasa por él.`,
    ],
  );
};

/** dN/dt = rN(1 − N/K) − H: where the population settles. */
export const logisticHarvest: Generator = (rng: Rng) => {
  const r = rng.pick([0.5, 1]);
  const K = rng.pick([100, 200, 1000]);
  const s = rng.pick([0.6, 0.8, 0.5]);
  const H = (1 - s * s) * (r * K) / 4;
  const high = (K / 2) * (1 + s);
  const low = (K / 2) * (1 - s);
  const f = (N: number): number => r * N * (1 - N / K) - H;
  const graph: Chart = {
    type: "chart",
    x: [0, K * 1.1],
    y: [-H * 1.2, (r * K) / 4 * 1.2],
    xLabel: "N",
    yLabel: "dN/dt",
    axes: "origin",
    xTicks: [K / 2, K],
    curves: [{ fn: f, label: "f(N)", style: "main" }],
    points: [{ x: low, y: 0 }, { x: high, y: 0 }],
  };
  return draft(
    `logistic ${r} ${K} ${s}`,
    per((lang, n) => [
      `A fish population grows logistically and is harvested at a constant rate: $\\frac{dN}{dt} = ${n(r, 1)}N\\left(1 - \\frac{N}{${K}}\\right) - ${n(H, 1)}$. Which equilibrium is stable?`,
      `Une population de poissons croît de façon logistique et est pêchée à taux constant : $\\frac{dN}{dt} = ${n(r, 1)}N\\left(1 - \\frac{N}{${K}}\\right) - ${n(H, 1)}$. Quel équilibre est stable ?`,
      `Una población de peces crece de forma logística y se pesca a tasa constante: $\\frac{dN}{dt} = ${n(r, 1)}N\\left(1 - \\frac{N}{${K}}\\right) - ${n(H, 1)}$. ¿Qué equilibrio es estable?`,
    ][LANGS.indexOf(lang)]!),
    graph,
    { type: "logistic", r, K, H },
    numOpt(high, 2),
    [numOpt(low, 2, "calcStabilityUnstable"), numOpt(K, 2, "calcHarvestIgnored"), numOpt(K / 2, 2, "calcMaxGrowth")],
    per((lang, n) => [
      `Equilibria are where dN/dt = 0: N = ${n(low)} and N = ${n(high)}. Above ${n(high)} the rate is negative and below it positive (down to ${n(low)}), so populations move towards ${n(high)}: stable. Below ${n(low)} the rate is negative and the population collapses: ${n(low)} is unstable, a threshold. Harvesting lowers the equilibrium below K.`,
      `Les équilibres sont là où dN/dt = 0 : N = ${n(low)} et N = ${n(high)}. Au-dessus de ${n(high)} le taux est négatif, en dessous positif (jusqu'à ${n(low)}) : les populations vont vers ${n(high)}, stable. Sous ${n(low)} le taux est négatif et la population s'effondre : ${n(low)} est instable, un seuil. La pêche abaisse l'équilibre sous K.`,
      `Los equilibrios están donde dN/dt = 0: N = ${n(low)} y N = ${n(high)}. Por encima de ${n(high)} la tasa es negativa y por debajo positiva (hasta ${n(low)}): las poblaciones van hacia ${n(high)}, estable. Por debajo de ${n(low)} la tasa es negativa y la población se hunde: ${n(low)} es inestable, un umbral. La pesca baja el equilibrio por debajo de K.`,
    ][LANGS.indexOf(lang)]!),
  );
};

// ------------------------------------------------- parametric and polar curves

/** A rose r = cos(kθ) or sin(kθ), drawn: which equation? */
export const polarRose: Generator = (rng: Rng) => {
  const trig = rng.pick(["cos", "sin"] as const);
  const k = rng.pick([2, 3, 4, 5]);
  const r = (t: number): number => (trig === "cos" ? Math.cos(k * t) : Math.sin(k * t));
  const points = range(0, 2 * Math.PI, Math.PI / 180).map((t) => [r(t) * Math.cos(t), r(t) * Math.sin(t)] as [number, number]);
  const opt = (tr: "cos" | "sin", kk: number, mistake?: MistakeKey): Option => textOpt(`${tr}${kk}`, same(`$r = \\${tr}(${kk}\\theta)$`), mistake);
  const other = trig === "cos" ? "sin" : "cos";
  const petals = k % 2 === 0 ? 2 * k : k;
  return draft(
    `rose ${trig} ${k}`,
    ["Which polar equation draws this curve?", "Quelle équation polaire trace cette courbe ?", "¿Qué ecuación polar dibuja esta curva?"],
    { type: "chart", x: [-1.2, 1.2], y: [-1.2, 1.2], xLabel: "x", yLabel: "y", axes: "origin", square: true, curves: [{ points, style: "main" }] },
    { type: "polar", trig, k },
    opt(trig, k),
    [
      opt(other, k, "calcPolarSinCos"),
      ...(k % 2 === 0 ? [opt(trig, 2 * k, "calcPetals")] : [opt(trig, k + 1, "calcPetals")]),
      ...(k % 2 === 0 && k / 2 >= 2 ? [opt(trig, k / 2, "calcPetals")] : [opt(trig, k === 2 ? 3 : k - 1, "calcPetals")]),
      opt(other, k % 2 === 0 ? 2 * k : k + 1, "calcPetals"),
    ],
    [
      `The curve has ${petals} petals: $r = \\${trig}(k\\theta)$ has k petals when k is odd and 2k when k is even, so k = ${k}. With cos, a petal lies along the positive x-axis (r = 1 at θ = 0); with sin, the petals are turned by half a petal.`,
      `La courbe a ${petals} pétales : $r = \\${trig}(k\\theta)$ en a k quand k est impair et 2k quand k est pair, donc k = ${k}. Avec cos, un pétale est sur l'axe des x positifs (r = 1 en θ = 0) ; avec sin, les pétales sont tournés d'un demi-pétale.`,
      `La curva tiene ${petals} pétalos: $r = \\${trig}(k\\theta)$ tiene k pétalos cuando k es impar y 2k cuando k es par, así que k = ${k}. Con cos, un pétalo está sobre el eje x positivo (r = 1 en θ = 0); con sin, los pétalos están girados medio pétalo.`,
    ],
  );
};

/** dy/dx = (dy/dt)/(dx/dt) on a parametric curve. */
export const parametricSlope: Generator = (rng: Rng) => {
  for (;;) {
    const a = rng.int(-1, 1);
    const b = rng.pick([1, 3]);
    const t0 = rng.pick([-2, -1, 1, 2]);
    const x = [0, a, 1];
    const y = [0, -b, 0, 1];
    const dx = polyAt(polyD(x), t0);
    const dy = polyAt(polyD(y), t0);
    if (dx === 0 || dy === 0) continue;
    const slope = dy / dx;
    const [px, py] = [polyAt(x, t0), polyAt(y, t0)];
    const points = range(-2.3, 2.3, 0.05).map((t) => [polyAt(x, t), polyAt(y, t)] as [number, number]);
    return draft(
      `param ${a} ${b} ${t0}`,
      per((lang) => [
        `The curve $x = ${polyTex(x, "t", lang)}$, $y = ${polyTex(y, "t", lang)}$ is drawn. What is the slope $\\frac{dy}{dx}$ at $t = ${t0}$?`,
        `La courbe $x = ${polyTex(x, "t", lang)}$, $y = ${polyTex(y, "t", lang)}$ est tracée. Quelle est la pente $\\frac{dy}{dx}$ en $t = ${t0}$ ?`,
        `Se dibuja la curva $x = ${polyTex(x, "t", lang)}$, $y = ${polyTex(y, "t", lang)}$. ¿Cuál es la pendiente $\\frac{dy}{dx}$ en $t = ${t0}$?`,
      ][LANGS.indexOf(lang)]!),
      {
        type: "chart",
        x: [-2, 7],
        y: [-8, 8],
        xLabel: "x",
        yLabel: "y",
        axes: "origin",
        curves: [{ points, style: "main" }, { fn: (X) => py + slope * (X - px), style: "guide" }],
        points: [{ x: px, y: py, label: `t = ${t0}` }],
      },
      { type: "paramSlope", x, y, t0 },
      numOpt(slope, 2),
      [numOpt(dx / dy, 2, "calcParamInverted"), numOpt(dy, 2, "calcParamDt"), ...(px !== 0 ? [numOpt(py / px, 2, "calcParamRatio")] : []), numOpt(dx, 2, "calcParamDt")],
      per((lang, n) => [
        `$\\frac{dy}{dx} = \\frac{dy/dt}{dx/dt}$. At t = ${t0}: $\\frac{dy}{dt} = ${n(dy)}$ and $\\frac{dx}{dt} = ${n(dx)}$, so the slope is ${n(slope)}. Each derivative alone is a speed along one axis, not the slope of the curve.`,
        `$\\frac{dy}{dx} = \\frac{dy/dt}{dx/dt}$. En t = ${t0} : $\\frac{dy}{dt} = ${n(dy)}$ et $\\frac{dx}{dt} = ${n(dx)}$, donc la pente vaut ${n(slope)}. Chaque dérivée seule est une vitesse selon un axe, pas la pente de la courbe.`,
        `$\\frac{dy}{dx} = \\frac{dy/dt}{dx/dt}$. En t = ${t0}: $\\frac{dy}{dt} = ${n(dy)}$ y $\\frac{dx}{dt} = ${n(dx)}$, así que la pendiente es ${n(slope)}. Cada derivada sola es una velocidad según un eje, no la pendiente de la curva.`,
      ][LANGS.indexOf(lang)]!),
    );
  }
};

// ----------------------------------------------------------------- series

/** A geometric series and its partial sums. */
export const geometricSeries: Generator = (rng: Rng) => {
  const a = rng.pick([1, 2, 3, 4, 6]);
  const [rn, rd] = rng.pick([[1, 2], [1, 3], [-1, 2], [2, 3], [1, 4], [-1, 3], [3, 4]] as [number, number][]);
  const r = rn / rd;
  const S = a / (1 - r);
  const partial = Array.from({ length: 11 }, (_, n) => (a * (1 - r ** (n + 1))) / (1 - r));
  const rtex = `${rn < 0 ? "-" : ""}\\frac{${Math.abs(rn)}}{${rd}}`;
  return draft(
    `geom ${a} ${rn} ${rd}`,
    [
      `What is $\\sum_{n=0}^{\\infty} ${a}\\left(${rtex}\\right)^n$? Its partial sums are drawn.`,
      `Que vaut $\\sum_{n=0}^{\\infty} ${a}\\left(${rtex}\\right)^n$ ? Ses sommes partielles sont tracées.`,
      `¿Cuánto vale $\\sum_{n=0}^{\\infty} ${a}\\left(${rtex}\\right)^n$? Se dibujan sus sumas parciales.`,
    ],
    { type: "chart", x: [0, 10.5], y: [0, nice(Math.max(...partial) * 1.2)], xLabel: "n", yLabel: "Sₙ", xTicks: [2, 4, 6, 8, 10], yTicks: [a], curves: [], points: partial.map((v, n) => ({ x: n, y: v })) },
    { type: "geometric", a, r },
    numOpt(S, 2),
    [numOpt(a / (1 + r), 2, "calcGeometricSign"), numOpt((a * r) / (1 - r), 2, "calcGeometricFirst"), numOpt(a / r, 2, "calcGeometricFirst"), textOpt("div", L(DIV), "calcGeometricDiverges")],
    per((lang, n) => [
      `For $|r| < 1$, $\\sum_{n=0}^{\\infty} ar^n = \\frac{a}{1 - r}$: here $\\frac{${a}}{1 - (${n(r, 3)})} = ${n(S)}$. The partial sums $S_n = a\\frac{1 - r^{n+1}}{1 - r}$ settle there${r < 0 ? ", alternately above and below, since r < 0" : ""}.`,
      `Pour $|r| < 1$, $\\sum_{n=0}^{\\infty} ar^n = \\frac{a}{1 - r}$ : ici $\\frac{${a}}{1 - (${n(r, 3)})} = ${n(S)}$. Les sommes partielles $S_n = a\\frac{1 - r^{n+1}}{1 - r}$ s'y stabilisent${r < 0 ? ", tantôt au-dessus, tantôt au-dessous, car r < 0" : ""}.`,
      `Para $|r| < 1$, $\\sum_{n=0}^{\\infty} ar^n = \\frac{a}{1 - r}$: aquí $\\frac{${a}}{1 - (${n(r, 3)})} = ${n(S)}$. Las sumas parciales $S_n = a\\frac{1 - r^{n+1}}{1 - r}$ se estabilizan allí${r < 0 ? ", alternando por encima y por debajo, porque r < 0" : ""}.`,
    ][LANGS.indexOf(lang)]!),
  );
};

/** Taylor coefficients at 0, constant first. */
export const TAYLOR: Record<"exp" | "sin" | "cos" | "log1p" | "inv1m", { f: (x: number) => number; tex: string; coef: (k: number) => number }> = {
  exp: { f: Math.exp, tex: "e^x", coef: (k) => 1 / factorial(k) },
  sin: { f: Math.sin, tex: "\\sin x", coef: (k) => (k % 2 === 0 ? 0 : (k % 4 === 1 ? 1 : -1) / factorial(k)) },
  cos: { f: Math.cos, tex: "\\cos x", coef: (k) => (k % 2 === 1 ? 0 : (k % 4 === 0 ? 1 : -1) / factorial(k)) },
  log1p: { f: (x) => (x > -1 ? Math.log(1 + x) : Number.NaN), tex: "\\ln(1 + x)", coef: (k) => (k === 0 ? 0 : (k % 2 === 1 ? 1 : -1) / k) },
  inv1m: { f: (x) => (x !== 1 ? 1 / (1 - x) : Number.NaN), tex: "\\frac{1}{1 - x}", coef: () => 1 },
};
function factorial(k: number): number {
  return k <= 1 ? 1 : k * factorial(k - 1);
}
/** Coefficients as the canonical formula: three decimals, trailing zeros dropped. */
export function coefKey(c: number[]): string {
  const parts = c.map((v) => Number(v.toFixed(3)));
  while (parts.length > 1 && parts[parts.length - 1] === 0) parts.pop();
  return parts.map((v) => String(v === 0 ? 0 : v)).join(",");
}

/** Which graph is the Taylor polynomial? (the options are graphs) */
export const taylorGraph: Generator = (rng: Rng) => {
  for (;;) {
    const fn = rng.pick(["exp", "sin", "cos", "log1p", "inv1m"] as const);
    const n = rng.pick([2, 3]);
    const { f, tex, coef } = TAYLOR[fn];
    const right = Array.from({ length: n + 1 }, (_, k) => coef(k));
    // Candidates: the right one, a degree short, the signs alternated, the factorials forgotten.
    const short = right.slice(0, n);
    const flipped = right.map((c, k) => (k % 2 === 1 ? -c : c));
    const noFact = right.map((c, k) => c * factorial(k));
    const candidates: [number[], MistakeKey | undefined][] = [[right, undefined], [short, "calcTaylorDegree"], [flipped, "calcTaylorSign"], [noFact, "calcTaylorFactorial"], [right.map((c, k) => (k === 0 ? c + 1 : c)), "calcTaylorConstant"]];
    const keys = candidates.map(([c]) => coefKey(c));
    if (new Set(keys).size < 4) continue;
    const window: Chart = { type: "chart", x: [-2, 2], y: [-3, 4], xLabel: "x", yLabel: "y", axes: "origin", grid: 1, curves: [] };
    const option = (c: number[], mistake?: MistakeKey): Option => ({
      tex: coefKey(c),
      text: { en: `$${polyTex(c, "x", "en")}$`, fr: `$${polyTex(c, "x", "fr")}$`, es: `$${polyTex(c, "x", "es")}$` },
      graph: { ...window, curves: [{ fn: f, style: "guide" }, { fn: (x) => polyAt(c, x), style: "main" }] },
      ...(mistake ? { mistake } : {}),
    });
    const seen = new Set<string>();
    const opts = candidates.filter(([c]) => !seen.has(coefKey(c)) && seen.add(coefKey(c)));
    return draft(
      `taylor ${fn} ${n}`,
      [
        `Which graph shows the Taylor polynomial of degree ${n} of $${tex}$ at 0? The function itself is dashed.`,
        `Quel graphe montre le polynôme de Taylor de degré ${n} de $${tex}$ en 0 ? La fonction elle-même est en pointillé.`,
        `¿Qué gráfica muestra el polinomio de Taylor de grado ${n} de $${tex}$ en 0? La función misma está en trazos.`,
      ],
      undefined,
      { type: "taylor", fn, n },
      option(right),
      opts.slice(1).map(([c, m]) => option(c, m)),
      per((lang) => [
        `$T_${n}(x) = \\sum_{k=0}^{${n}} \\frac{f^{(k)}(0)}{k!}x^k = ${polyTex(right, "x", lang)}$. It touches the function at 0 with the same value, slope${n >= 2 ? " and curvature" : ""}, and stays close nearby; further away the two part.`,
        `$T_${n}(x) = \\sum_{k=0}^{${n}} \\frac{f^{(k)}(0)}{k!}x^k = ${polyTex(right, "x", lang)}$. Il touche la fonction en 0 avec la même valeur, la même pente${n >= 2 ? " et la même courbure" : ""}, et reste proche autour ; plus loin, les deux s'écartent.`,
        `$T_${n}(x) = \\sum_{k=0}^{${n}} \\frac{f^{(k)}(0)}{k!}x^k = ${polyTex(right, "x", lang)}$. Toca la función en 0 con el mismo valor, la misma pendiente${n >= 2 ? " y la misma curvatura" : ""}, y se queda cerca alrededor; más lejos, las dos se separan.`,
      ][LANGS.indexOf(lang)]!),
    );
  }
};

// ----------------------------------------------------------------- vectors

const deg = (rad: number): number => (rad * 180) / Math.PI;

/** The angle between two vectors, drawn. */
export const vectorAngle: Generator = (rng: Rng) => {
  for (;;) {
    const u: [number, number] = [rng.int(-3, 3), rng.int(-3, 3)];
    const v: [number, number] = [rng.int(-3, 3), rng.int(-3, 3)];
    const dot = u[0] * v[0] + u[1] * v[1];
    const cross = u[0] * v[1] - u[1] * v[0];
    const nu = Math.hypot(...u);
    const nv = Math.hypot(...v);
    if (nu === 0 || nv === 0 || cross === 0) continue;
    const theta = deg(Math.acos(dot / (nu * nv)));
    if (Math.abs(theta - 90) < 1) continue;
    return draft(
      `angle ${u.join(" ")} ${v.join(" ")}`,
      [
        `What is the angle between $\\mathbf u = (${u.join(", ")})$ and $\\mathbf v = (${v.join(", ")})$, in degrees?`,
        `Quel est l'angle entre $\\mathbf u = (${u.join("\\,;\\,")})$ et $\\mathbf v = (${v.join("\\,;\\,")})$, en degrés ?`,
        `¿Cuál es el ángulo entre $\\mathbf u = (${u.join(", ")})$ y $\\mathbf v = (${v.join(", ")})$, en grados?`,
      ],
      {
        type: "chart",
        x: [-3.5, 3.5],
        y: [-3.5, 3.5],
        xLabel: "x",
        yLabel: "y",
        axes: "origin",
        square: true,
        grid: 1,
        curves: [],
        vectors: [{ from: [0, 0], to: u, label: "u" }, { from: [0, 0], to: v, label: "v", style: "alt" }],
      },
      { type: "vectorAngle", u, v },
      numOpt(theta, 1, undefined, "°"),
      [numOpt(180 - theta, 1, "calcAngleSupplement", "°"), numOpt(Math.abs(90 - theta), 1, "calcAngleComplement", "°"), numOpt(360 - theta, 1, "calcAngleReflex", "°")],
      per((lang, n) => [
        `$\\cos\\theta = \\frac{\\mathbf u \\cdot \\mathbf v}{|\\mathbf u|\\,|\\mathbf v|} = \\frac{${dot}}{${n(nu, 3)} \\times ${n(nv, 3)}}$, so θ = ${n(theta, 1)}°. The angle between two vectors is between 0° and 180°; a negative dot product means an obtuse angle.`,
        `$\\cos\\theta = \\frac{\\mathbf u \\cdot \\mathbf v}{|\\mathbf u|\\,|\\mathbf v|} = \\frac{${dot}}{${n(nu, 3)} \\times ${n(nv, 3)}}$, donc θ = ${n(theta, 1)}°. L'angle entre deux vecteurs est compris entre 0° et 180° ; un produit scalaire négatif signifie un angle obtus.`,
        `$\\cos\\theta = \\frac{\\mathbf u \\cdot \\mathbf v}{|\\mathbf u|\\,|\\mathbf v|} = \\frac{${dot}}{${n(nu, 3)} \\times ${n(nv, 3)}}$, así que θ = ${n(theta, 1)}°. El ángulo entre dos vectores está entre 0° y 180°; un producto escalar negativo indica un ángulo obtuso.`,
      ][LANGS.indexOf(lang)]!),
    );
  }
};

/** |u × v|: a parallelogram's area, half for the triangle. */
export const crossArea: Generator = (rng: Rng) => {
  for (;;) {
    const u: [number, number, number] = [rng.int(-2, 3), rng.int(-2, 3), rng.int(-2, 3)];
    const v: [number, number, number] = [rng.int(-2, 3), rng.int(-2, 3), rng.int(-2, 3)];
    const c = [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]];
    const area = Math.hypot(...c);
    if (area === 0) continue;
    const shape = rng.pick(["parallelogram", "triangle"] as const);
    const right = shape === "parallelogram" ? area : area / 2;
    const dot = Math.abs(u[0] * v[0] + u[1] * v[1] + u[2] * v[2]);
    const name: L3 = shape === "parallelogram" ? ["parallelogram", "parallélogramme", "paralelogramo"] : ["triangle", "triangle", "triángulo"];
    return draft(
      `cross ${u.join(" ")} ${v.join(" ")} ${shape}`,
      [
        `What is the area of the ${name[0]} built on $\\mathbf u = (${u.join(", ")})$ and $\\mathbf v = (${v.join(", ")})$?`,
        `Quelle est l'aire du ${name[1]} construit sur $\\mathbf u = (${u.join("\\,;\\,")})$ et $\\mathbf v = (${v.join("\\,;\\,")})$ ?`,
        `¿Cuál es el área del ${name[2]} construido sobre $\\mathbf u = (${u.join(", ")})$ y $\\mathbf v = (${v.join(", ")})$?`,
      ],
      undefined,
      { type: "crossArea", u, v, shape },
      numOpt(right, 2),
      [numOpt(shape === "parallelogram" ? area / 2 : area, 2, "calcCrossHalf"), numOpt(dot, 2, "calcCrossDot"), numOpt(Math.hypot(...u) * Math.hypot(...v), 2, "calcCrossNorms"), numOpt(Math.abs(c[0]! + c[1]! + c[2]!), 2, "calcCrossNorms")],
      per((lang, n) => [
        `$\\mathbf u \\times \\mathbf v = (${c.join(", ")})$, of length ${n(area)}: the area of the parallelogram${shape === "triangle" ? `; the triangle is half of it, ${n(area / 2)}` : ""}. $|\\mathbf u||\\mathbf v|$ would be the area only if the vectors were perpendicular: the cross product includes $\\sin\\theta$.`,
        `$\\mathbf u \\times \\mathbf v = (${c.join("\\,;\\,")})$, de norme ${n(area)} : l'aire du parallélogramme${shape === "triangle" ? ` ; le triangle en est la moitié, ${n(area / 2)}` : ""}. $|\\mathbf u||\\mathbf v|$ ne serait l'aire que si les vecteurs étaient perpendiculaires : le produit vectoriel contient $\\sin\\theta$.`,
        `$\\mathbf u \\times \\mathbf v = (${c.join(", ")})$, de norma ${n(area)}: el área del paralelogramo${shape === "triangle" ? `; el triángulo es la mitad, ${n(area / 2)}` : ""}. $|\\mathbf u||\\mathbf v|$ solo sería el área si los vectores fueran perpendiculares: el producto vectorial incluye $\\sin\\theta$.`,
      ][LANGS.indexOf(lang)]!),
    );
  }
};

// -------------------------------------------------------- several variables

/** Level curves a·x² + b·y² = c, as polylines. */
function ellipses(a: number, b: number, levels: number[]): Chart["curves"] {
  return levels.map((c) => ({
    points: range(0, 2 * Math.PI, Math.PI / 60).map((t) => [Math.sqrt(c / a) * Math.cos(t), Math.sqrt(c / b) * Math.sin(t)] as [number, number]),
    style: "guide" as const,
  }));
}

/** The directional derivative on a contour map: ∇f · u / |u|. */
export const directionalDerivative: Generator = (rng: Rng) => {
  for (;;) {
    const a = rng.pick([0.5, 1, 2]);
    const b = rng.pick([0.5, 1, 2]);
    const p: [number, number] = [rng.int(-2, 2), rng.int(-2, 2)];
    const u: [number, number] = rng.pick([[3, 4], [1, 1], [1, 2], [-1, 1], [2, -1], [0, 1], [1, 0]] as [number, number][]);
    const g: [number, number] = [2 * a * p[0], 2 * b * p[1]];
    if (g[0] === 0 && g[1] === 0) continue;
    const nu = Math.hypot(...u);
    const D = (g[0] * u[0] + g[1] * u[1]) / nu;
    const level = a * p[0] ** 2 + b * p[1] ** 2;
    return draft(
      `dirderiv ${a} ${b} ${p.join(" ")} ${u.join(" ")}`,
      per((lang) => [
        `$f(x, y) = ${polyTex([0, 0, a], "x", lang)} + ${polyTex([0, 0, b], "y", lang)}$, level curves drawn. What is the derivative of f at $P(${p.join(", ")})$ in the direction of $\\mathbf v = (${u.join(", ")})$?`,
        `$f(x, y) = ${polyTex([0, 0, a], "x", lang)} + ${polyTex([0, 0, b], "y", lang)}$, courbes de niveau tracées. Quelle est la dérivée de f en $P(${p.join("\\,;\\,")})$ dans la direction de $\\mathbf v = (${u.join("\\,;\\,")})$ ?`,
        `$f(x, y) = ${polyTex([0, 0, a], "x", lang)} + ${polyTex([0, 0, b], "y", lang)}$, curvas de nivel dibujadas. ¿Cuál es la derivada de f en $P(${p.join(", ")})$ en la dirección de $\\mathbf v = (${u.join(", ")})$?`,
      ][LANGS.indexOf(lang)]!),
      {
        type: "chart",
        x: [-3.5, 3.5],
        y: [-3.5, 3.5],
        xLabel: "x",
        yLabel: "y",
        axes: "origin",
        square: true,
        curves: ellipses(a, b, [...new Set([1, 2, 4, 8, level].filter((c) => c > 0))].sort((x, y) => x - y)),
        points: [{ x: p[0], y: p[1], label: "P" }],
        vectors: [{ from: p, to: [p[0] + u[0] / nu, p[1] + u[1] / nu], label: "v", style: "alt" }],
      },
      { type: "directional", a, b, p, u },
      numOpt(D, 2),
      [numOpt(D * nu, 2, "calcDirectionalUnit"), numOpt(Math.hypot(...g), 2, "calcDirectionalGradient"), numOpt(g[0], 2, "calcDirectionalPartial"), numOpt(g[1], 2, "calcDirectionalPartial")],
      per((lang, n) => [
        `$\\nabla f = (${n(2 * a, 1)}x,\\ ${n(2 * b, 1)}y) = (${n(g[0])}, ${n(g[1])})$ at P. The direction must be a unit vector: $\\mathbf v/|\\mathbf v|$, $|\\mathbf v| = ${n(nu, 3)}$. $D_{\\mathbf u}f = \\nabla f \\cdot \\mathbf u = ${n(D)}$. The largest rate, $|\\nabla f| = ${n(Math.hypot(...g))}$, is across the level curves.`,
        `$\\nabla f = (${n(2 * a, 1)}x\\,;\\,${n(2 * b, 1)}y) = (${n(g[0])}\\,;\\,${n(g[1])})$ en P. La direction doit être un vecteur unitaire : $\\mathbf v/|\\mathbf v|$, $|\\mathbf v| = ${n(nu, 3)}$. $D_{\\mathbf u}f = \\nabla f \\cdot \\mathbf u = ${n(D)}$. Le plus grand taux, $|\\nabla f| = ${n(Math.hypot(...g))}$, est perpendiculaire aux courbes de niveau.`,
        `$\\nabla f = (${n(2 * a, 1)}x,\\ ${n(2 * b, 1)}y) = (${n(g[0])}, ${n(g[1])})$ en P. La dirección debe ser un vector unitario: $\\mathbf v/|\\mathbf v|$, $|\\mathbf v| = ${n(nu, 3)}$. $D_{\\mathbf u}f = \\nabla f \\cdot \\mathbf u = ${n(D)}$. La mayor tasa, $|\\nabla f| = ${n(Math.hypot(...g))}$, es perpendicular a las curvas de nivel.`,
      ][LANGS.indexOf(lang)]!),
    );
  }
};

const KIND: Record<"min" | "max" | "saddle" | "none", L3> = {
  min: ["A local minimum", "Un minimum local", "Un mínimo local"],
  max: ["A local maximum", "Un maximum local", "Un máximo local"],
  saddle: ["A saddle point", "Un point selle", "Un punto de silla"],
  none: ["The test says nothing", "Le test ne conclut pas", "El criterio no concluye"],
};

/** The second-derivative test, with the level curves drawn. */
export const classifyCritical: Generator = (rng: Rng) => {
  for (;;) {
    const a = rng.pick([-2, -1, 1, 2]);
    const c = rng.pick([-2, -1, 1, 2]);
    const b = rng.pick([-4, -3, -2, 0, 2, 3, 4]);
    const D = 4 * a * c - b * b;
    if (D === 0) continue;
    const kind = D < 0 ? "saddle" : a > 0 ? "min" : "max";
    // Level curves: in the eigenbasis of the form, λ1 X² + λ2 Y² = level.
    const tr = a + c;
    const disc = Math.sqrt((a - c) ** 2 + b * b);
    const l1 = (tr + disc) / 2;
    const l2 = (tr - disc) / 2;
    const angle = b === 0 ? (a >= c ? 0 : Math.PI / 2) : Math.atan2(l1 - a, b / 2);
    const rot = ([X, Y]: [number, number]): [number, number] => [X * Math.cos(angle) - Y * Math.sin(angle), X * Math.sin(angle) + Y * Math.cos(angle)];
    const curves: Chart["curves"] = [];
    for (const level of [-4, -1, 1, 4]) {
      if (l1 * l2 > 0) {
        if (level * l1 <= 0) continue;
        curves.push({ points: range(0, 2 * Math.PI, Math.PI / 60).map((t) => rot([Math.sqrt(level / l1) * Math.cos(t), Math.sqrt(level / l2) * Math.sin(t)])), style: "guide" });
      } else {
        // Hyperbolas: along X when level has λ1's sign, along Y otherwise.
        const [lp, ln] = level * l1 > 0 ? [l1, l2] : [l2, l1];
        for (const side of [1, -1]) {
          const pts = range(-2.5, 2.5, 0.1).map((s) => {
            const main = side * Math.sqrt(level / lp) * Math.cosh(s);
            const other = Math.sqrt(-level / ln) * Math.sinh(s);
            return rot(level * l1 > 0 ? [main, other] : [other, main]);
          });
          curves.push({ points: pts, style: "guide" });
        }
      }
    }
    const opt = (k: keyof typeof KIND, mistake?: MistakeKey): Option => textOpt(k, L(KIND[k]), mistake);
    const formula = per((lang) => `${polyTex([0, 0, a], "x", lang)}${b === 0 ? "" : b > 0 ? ` + ${b === 1 ? "" : b}xy` : ` - ${b === -1 ? "" : -b}xy`}${c > 0 ? " + " : " - "}${Math.abs(c) === 1 ? "" : Math.abs(c)}y^{2}`);
    return draft(
      `classify ${a} ${b} ${c}`,
      [
        `$f(x, y) = ${formula[0]}$; its level curves are drawn. What is the critical point (0, 0)?`,
        `$f(x, y) = ${formula[1]}$ ; ses courbes de niveau sont tracées. Qu'est le point critique (0, 0) ?`,
        `$f(x, y) = ${formula[2]}$; se dibujan sus curvas de nivel. ¿Qué es el punto crítico (0, 0)?`,
      ],
      {
        type: "chart",
        x: [-3, 3],
        y: [-3, 3],
        xLabel: "x",
        yLabel: "y",
        axes: "origin",
        square: true,
        curves,
        points: [{ x: 0, y: 0 }],
      },
      { type: "classify", a, b, c },
      opt(kind),
      [
        ...(["min", "max", "saddle"] as const).filter((k) => k !== kind).map((k) => opt(k, a * c > 0 && k !== "saddle" ? "calcSecondTestCross" : "calcSecondTestSign")),
        opt("none", "calcSecondTestCross"),
      ],
      [
        `$f_{xx} = ${2 * a}$, $f_{yy} = ${2 * c}$, $f_{xy} = ${b}$: $D = f_{xx}f_{yy} - f_{xy}^2 = ${4 * a * c} - ${b * b} = ${D}$. ${D < 0 ? "D < 0: a saddle, whatever the signs of f_xx and f_yy; the level curves are hyperbolas crossing at the point." : `D > 0 and f_xx ${a > 0 ? "> 0: a minimum" : "< 0: a maximum"}; the level curves are ellipses around it.`}`,
        `$f_{xx} = ${2 * a}$, $f_{yy} = ${2 * c}$, $f_{xy} = ${b}$ : $D = f_{xx}f_{yy} - f_{xy}^2 = ${4 * a * c} - ${b * b} = ${D}$. ${D < 0 ? "D < 0 : un point selle, quels que soient les signes de f_xx et f_yy ; les courbes de niveau sont des hyperboles qui se croisent au point." : `D > 0 et f_xx ${a > 0 ? "> 0 : un minimum" : "< 0 : un maximum"} ; les courbes de niveau sont des ellipses autour.`}`,
        `$f_{xx} = ${2 * a}$, $f_{yy} = ${2 * c}$, $f_{xy} = ${b}$: $D = f_{xx}f_{yy} - f_{xy}^2 = ${4 * a * c} - ${b * b} = ${D}$. ${D < 0 ? "D < 0: un punto de silla, sean cuales sean los signos de f_xx y f_yy; las curvas de nivel son hipérbolas que se cruzan en el punto." : `D > 0 y f_xx ${a > 0 ? "> 0: un mínimo" : "< 0: un máximo"}; las curvas de nivel son elipses a su alrededor.`}`,
      ],
    );
  }
};

/** Green's theorem: the circulation of F = (−ay, bx) round a circle. */
export const greenCirculation: Generator = (rng: Rng) => {
  const a = rng.int(1, 3);
  const b = rng.int(1, 3);
  const R = rng.int(1, 3);
  const value = (a + b) * Math.PI * R * R;
  const reach = R + 1;
  const P = `-${a === 1 ? "" : a}y`;
  const Q = `${b === 1 ? "" : b}x`;
  return draft(
    `green ${a} ${b} ${R}`,
    [
      `What is $\\oint_C \\mathbf F \\cdot d\\mathbf r$ for $\\mathbf F = (${P},\\ ${Q})$ around the circle of radius ${R} centred at the origin, anticlockwise?`,
      `Que vaut $\\oint_C \\mathbf F \\cdot d\\mathbf r$ pour $\\mathbf F = (${P}\\,;\\,${Q})$ sur le cercle de rayon ${R} centré à l'origine, parcouru dans le sens direct ?`,
      `¿Cuánto vale $\\oint_C \\mathbf F \\cdot d\\mathbf r$ para $\\mathbf F = (${P},\\ ${Q})$ sobre la circunferencia de radio ${R} centrada en el origen, en sentido antihorario?`,
    ],
    {
      type: "chart",
      x: [-reach, reach],
      y: [-reach, reach],
      xLabel: "x",
      yLabel: "y",
      axes: "origin",
      square: true,
      field: { fn: (x, y) => [-a * y, b * x], arrows: true, count: 7 },
      curves: [{ points: range(0, 2 * Math.PI, Math.PI / 60).map((t) => [R * Math.cos(t), R * Math.sin(t)] as [number, number]), style: "main" }],
    },
    { type: "green", a, b, R },
    numOpt(value, 2),
    [numOpt(Math.abs(b - a) * Math.PI * R * R, 2, "calcGreenCurl"), numOpt(2 * Math.PI * R * (a + b), 2, "calcGreenPerimeter"), numOpt((a + b) * Math.PI * R, 2, "calcGreenRadius"), numOpt((a + b) * Math.PI * R * R / 2, 2, "calcGreenCurl")],
    per((lang, n) => [
      `Green's theorem turns the circulation into a double integral: $\\oint_C P\\,dx + Q\\,dy = \\iint_D \\left(\\frac{\\partial Q}{\\partial x} - \\frac{\\partial P}{\\partial y}\\right)dA = \\iint_D (${b} + ${a})\\,dA = ${a + b} \\cdot \\pi \\cdot ${R}^2 = ${n(value)}$. The integrand is constant, so only the disc's area counts.`,
      `Le théorème de Green transforme la circulation en intégrale double : $\\oint_C P\\,dx + Q\\,dy = \\iint_D \\left(\\frac{\\partial Q}{\\partial x} - \\frac{\\partial P}{\\partial y}\\right)dA = \\iint_D (${b} + ${a})\\,dA = ${a + b} \\cdot \\pi \\cdot ${R}^2 = ${n(value)}$. L'intégrande est constante : seule compte l'aire du disque.`,
      `El teorema de Green convierte la circulación en una integral doble: $\\oint_C P\\,dx + Q\\,dy = \\iint_D \\left(\\frac{\\partial Q}{\\partial x} - \\frac{\\partial P}{\\partial y}\\right)dA = \\iint_D (${b} + ${a})\\,dA = ${a + b} \\cdot \\pi \\cdot ${R}^2 = ${n(value)}$. El integrando es constante: solo cuenta el área del disco.`,
    ][LANGS.indexOf(lang)]!),
  );
};

// --------------------------------------------------------- stochastic calculus

/** A Brownian path for the picture (a random walk, scaled). */
function brownianPath(rng: Rng, T: number): [number, number][] {
  const steps = 200;
  const dt = T / steps;
  const pts: [number, number][] = [[0, 0]];
  let w = 0;
  for (let i = 1; i <= steps; i++) {
    // Sum of uniforms, centred: close enough to a normal step for a picture.
    const z = (rng.next() + rng.next() + rng.next() - 1.5) * 2;
    w += z * Math.sqrt(dt);
    pts.push([i * dt, w]);
  }
  return pts;
}

/** Moments of Brownian motion. */
export const brownianMoments: Generator = (rng: Rng) => {
  for (;;) {
    const s = rng.pick([0.5, 1, 2, 3]);
    const t = rng.pick([1, 2, 4, 5].filter((v) => v > s));
    if (t === undefined) continue;
    const sigma = rng.pick([0.5, 1, 2]);
    const ask = rng.pick(["cov", "increment", "second", "exponential"] as const);
    // E[e^(σW_t)] = e^(σ²t/2): kept to a size one can check by hand.
    if (ask === "exponential" && sigma * sigma * t > 6) continue;
    const path = brownianPath(rng, t * 1.2);
    const right = { cov: s, increment: t - s, second: t, exponential: Math.exp((sigma * sigma * t) / 2) }[ask];
    const wrong = {
      cov: [numOpt(s * t, 3, "calcBrownianProduct"), numOpt(t, 3, "calcBrownianMax"), numOpt(Math.sqrt(s * t), 3, "calcBrownianProduct"), numOpt(0, 3, "calcBrownianIndependent")],
      increment: [numOpt(t + s, 3, "calcBrownianIncrement"), numOpt(Math.sqrt(t - s), 3, "calcBrownianSd"), numOpt(t, 3, "calcBrownianIncrement"), numOpt((t - s) ** 2, 3, "calcBrownianSd")],
      second: [numOpt(t * t, 3, "calcBrownianSd"), numOpt(0, 3, "calcBrownianIndependent"), numOpt(Math.sqrt(t), 3, "calcBrownianSd")],
      exponential: [numOpt(1, 3, "calcItoJensen"), numOpt(Math.exp(sigma * sigma * t), 3, "calcItoHalf"), numOpt(Math.exp(sigma * t), 3, "calcBrownianSd"), numOpt(Math.exp((sigma * t) / 2), 3, "calcBrownianSd")],
    }[ask];
    const q = per((_lang, n) => ({
      cov: `$\\mathbb E[W_{${n(s, 1)}}\\,W_{${n(t, 1)}}]$`,
      increment: `$\\operatorname{Var}(W_{${n(t, 1)}} - W_{${n(s, 1)}})$`,
      second: `$\\mathbb E[W_{${n(t, 1)}}^2]$`,
      exponential: `$\\mathbb E[e^{${n(sigma, 1)}W_{${n(t, 1)}}}]$`,
    })[ask]);
    return draft(
      `brown ${s} ${t} ${sigma} ${ask}`,
      [
        `W is a standard Brownian motion (one path drawn). What is ${q[0]}?`,
        `W est un mouvement brownien standard (une trajectoire tracée). Que vaut ${q[1]} ?`,
        `W es un movimiento browniano estándar (una trayectoria dibujada). ¿Cuánto vale ${q[2]}?`,
      ],
      {
        type: "chart",
        x: [0, t * 1.2],
        y: [-3 * Math.sqrt(t * 1.2), 3 * Math.sqrt(t * 1.2)],
        xLabel: "t",
        yLabel: "W",
        axes: "origin",
        xTicks: ask === "second" || ask === "exponential" ? [t] : [s, t],
        curves: [{ points: path, style: "main" }],
      },
      { type: "brownian", s, t, sigma, ask },
      numOpt(right, 3),
      wrong,
      per((lang, n) => [
        {
          cov: `Write $W_t = W_s + (W_t - W_s)$: the increment is independent of $W_s$ with mean 0, so $\\mathbb E[W_sW_t] = \\mathbb E[W_s^2] = s = ${n(s, 1)}$, that is $\\min(s, t)$.`,
          increment: `Increments are Gaussian with variance equal to the elapsed time: $W_t - W_s \\sim N(0, t - s)$, variance ${n(t - s, 1)}. The variance grows with time, the standard deviation like its square root.`,
          second: `$W_t \\sim N(0, t)$: $\\mathbb E[W_t^2] = \\operatorname{Var}(W_t) = t = ${n(t, 1)}$. This is why $(dW)^2 = dt$ in Itô's calculus.`,
          exponential: `For $X \\sim N(0, v)$, $\\mathbb E[e^X] = e^{v/2}$. With $v = \\sigma^2 t$: $e^{${n((sigma * sigma * t) / 2, 2)}} = ${n(right, 3)}$. Not $e^{\\mathbb E[X]} = 1$: the exponential is convex (Jensen).`,
        }[ask],
        {
          cov: `On écrit $W_t = W_s + (W_t - W_s)$ : l'accroissement est indépendant de $W_s$ et de moyenne nulle, donc $\\mathbb E[W_sW_t] = \\mathbb E[W_s^2] = s = ${n(s, 1)}$, c'est-à-dire $\\min(s, t)$.`,
          increment: `Les accroissements sont gaussiens, de variance égale au temps écoulé : $W_t - W_s \\sim N(0, t - s)$, variance ${n(t - s, 1)}. La variance croît avec le temps, l'écart type comme sa racine.`,
          second: `$W_t \\sim N(0, t)$ : $\\mathbb E[W_t^2] = \\operatorname{Var}(W_t) = t = ${n(t, 1)}$. C'est pourquoi $(dW)^2 = dt$ en calcul d'Itô.`,
          exponential: `Pour $X \\sim N(0, v)$, $\\mathbb E[e^X] = e^{v/2}$. Avec $v = \\sigma^2 t$ : $e^{${n((sigma * sigma * t) / 2, 2)}} = ${n(right, 3)}$. Pas $e^{\\mathbb E[X]} = 1$ : l'exponentielle est convexe (Jensen).`,
        }[ask],
        {
          cov: `Se escribe $W_t = W_s + (W_t - W_s)$: el incremento es independiente de $W_s$ y de media 0, así que $\\mathbb E[W_sW_t] = \\mathbb E[W_s^2] = s = ${n(s, 1)}$, es decir $\\min(s, t)$.`,
          increment: `Los incrementos son gaussianos con varianza igual al tiempo transcurrido: $W_t - W_s \\sim N(0, t - s)$, varianza ${n(t - s, 1)}. La varianza crece con el tiempo, la desviación típica como su raíz.`,
          second: `$W_t \\sim N(0, t)$: $\\mathbb E[W_t^2] = \\operatorname{Var}(W_t) = t = ${n(t, 1)}$. Por eso $(dW)^2 = dt$ en el cálculo de Itô.`,
          exponential: `Para $X \\sim N(0, v)$, $\\mathbb E[e^X] = e^{v/2}$. Con $v = \\sigma^2 t$: $e^{${n((sigma * sigma * t) / 2, 2)}} = ${n(right, 3)}$. No $e^{\\mathbb E[X]} = 1$: la exponencial es convexa (Jensen).`,
        }[ask],
      ][LANGS.indexOf(lang)]!),
    );
  }
};

/** Itô's formula for Wⁿ: the dt term ½n(n − 1)W^(n−2). */
export const itoFormula: Generator = (rng: Rng) => {
  const n = rng.pick([2, 3, 4, 5]);
  const term = (c: number, p: number, mistake?: MistakeKey): Option => ({
    tex: `${c},${p}`,
    text: same(c === 0 ? "$0$" : `$${c === 1 && p !== 0 ? "" : c}${p === 0 ? "" : p === 1 ? "W_t" : `W_t^{${p}}`}\\,dt$`),
    ...(mistake ? { mistake } : {}),
  });
  const c = (n * (n - 1)) / 2;
  return draft(
    `ito ${n}`,
    [
      `W is a Brownian motion. In $d(W_t^{${n}}) = ${n}W_t^{${n - 1}}\\,dW_t + \\dots$, what is the $dt$ term?`,
      `W est un mouvement brownien. Dans $d(W_t^{${n}}) = ${n}W_t^{${n - 1}}\\,dW_t + \\dots$, quel est le terme en $dt$ ?`,
      `W es un movimiento browniano. En $d(W_t^{${n}}) = ${n}W_t^{${n - 1}}\\,dW_t + \\dots$, ¿cuál es el término en $dt$?`,
    ].map((t) => t.replace("W_t^{1}", "W_t")) as [string, string, string],
    undefined,
    { type: "ito", n },
    term(c, n - 2),
    [term(0, 0, "calcItoNoDrift"), term(2 * c, n - 2, "calcItoHalf"), term(c, n - 1, "calcItoPower"), term(n, n - 1, "calcItoPower")],
    [
      `Itô's formula: $df(W_t) = f'(W_t)\\,dW_t + \\tfrac12 f''(W_t)\\,dt$, because $(dW_t)^2 = dt$. With $f(x) = x^{${n}}$, $f''(x) = ${n * (n - 1)}x^{${n - 2}}$: the dt term is $${c}W_t^{${n - 2}}\\,dt$. The ordinary chain rule would miss it.`.replace("x^{0}", "").replace("W_t^{0}", "").replace("W_t^{1}", "W_t").replace("x^{1}", "x"),
      `Formule d'Itô : $df(W_t) = f'(W_t)\\,dW_t + \\tfrac12 f''(W_t)\\,dt$, car $(dW_t)^2 = dt$. Avec $f(x) = x^{${n}}$, $f''(x) = ${n * (n - 1)}x^{${n - 2}}$ : le terme en dt est $${c}W_t^{${n - 2}}\\,dt$. La dérivation composée ordinaire l'oublierait.`.replace("x^{0}", "").replace("W_t^{0}", "").replace("W_t^{1}", "W_t").replace("x^{1}", "x"),
      `Fórmula de Itô: $df(W_t) = f'(W_t)\\,dW_t + \\tfrac12 f''(W_t)\\,dt$, porque $(dW_t)^2 = dt$. Con $f(x) = x^{${n}}$, $f''(x) = ${n * (n - 1)}x^{${n - 2}}$: el término en dt es $${c}W_t^{${n - 2}}\\,dt$. La regla de la cadena ordinaria lo omitiría.`.replace("x^{0}", "").replace("W_t^{0}", "").replace("W_t^{1}", "W_t").replace("x^{1}", "x"),
    ],
  );
};

/** Geometric Brownian motion: mean S0·e^(μT), median S0·e^((μ − σ²/2)T). */
export const geometricBrownian: Generator = (rng: Rng) => {
  const mu = rng.pick([0.05, 0.08, 0.1]);
  const sigma = rng.pick([0.2, 0.3, 0.4]);
  const T = rng.pick([1, 2, 5]);
  const S0 = 100;
  const ask = rng.pick(["mean", "median"] as const);
  const mean = S0 * Math.exp(mu * T);
  const median = S0 * Math.exp((mu - (sigma * sigma) / 2) * T);
  const path = brownianPath(rng, T).map(([t, w]) => [t, S0 * Math.exp((mu - (sigma * sigma) / 2) * t + sigma * w)] as [number, number]);
  const top = Math.max(...path.map(([, s]) => s), mean);
  return draft(
    `gbm ${mu} ${sigma} ${T} ${ask}`,
    per((lang, n) => [
      `$dS_t = ${n(mu)}\\,S_t\\,dt + ${n(sigma, 1)}\\,S_t\\,dW_t$, $S_0 = ${S0}$ (one path drawn). What is the ${ask === "mean" ? "mean" : "median"} of $S_{${T}}$?`,
      `$dS_t = ${n(mu)}\\,S_t\\,dt + ${n(sigma, 1)}\\,S_t\\,dW_t$, $S_0 = ${S0}$ (une trajectoire tracée). Quelle est la ${ask === "mean" ? "moyenne" : "médiane"} de $S_{${T}}$ ?`,
      `$dS_t = ${n(mu)}\\,S_t\\,dt + ${n(sigma, 1)}\\,S_t\\,dW_t$, $S_0 = ${S0}$ (una trayectoria dibujada). ¿Cuál es la ${ask === "mean" ? "media" : "mediana"} de $S_{${T}}$?`,
    ][LANGS.indexOf(lang)]!),
    { type: "chart", x: [0, T], y: [0, nice(top * 1.2)], xLabel: "t", yLabel: "S", yTicks: [S0], curves: [{ points: path, style: "main" }, { fn: (t) => S0 * Math.exp(mu * t), style: "guide" }] },
    { type: "gbm", mu, sigma, S0, T, ask },
    numOpt(ask === "mean" ? mean : median, 2),
    [
      numOpt(ask === "mean" ? median : mean, 2, "calcGbmMedianMean"),
      numOpt(S0 * Math.exp((mu + (sigma * sigma) / 2) * T), 2, "calcGbmDrift"),
      numOpt(S0 * (1 + mu * T), 2, "calcGbmLinear"),
    ],
    per((lang, n) => [
      `By Itô, $S_T = S_0\\exp\\big((\\mu - \\tfrac{\\sigma^2}{2})T + \\sigma W_T\\big)$. The median puts $W_T$ at 0: $${S0}e^{${n((mu - (sigma * sigma) / 2) * T, 3)}} = ${n(median)}$. The mean adds $\\tfrac{\\sigma^2}{2}T$ back (lognormal): $${S0}e^{${n(mu * T, 3)}} = ${n(mean)}$. The gap grows with σ: most paths end below the mean.`,
      `Par Itô, $S_T = S_0\\exp\\big((\\mu - \\tfrac{\\sigma^2}{2})T + \\sigma W_T\\big)$. La médiane place $W_T$ en 0 : $${S0}e^{${n((mu - (sigma * sigma) / 2) * T, 3)}} = ${n(median)}$. La moyenne rajoute $\\tfrac{\\sigma^2}{2}T$ (loi lognormale) : $${S0}e^{${n(mu * T, 3)}} = ${n(mean)}$. L'écart croît avec σ : la plupart des trajectoires finissent sous la moyenne.`,
      `Por Itô, $S_T = S_0\\exp\\big((\\mu - \\tfrac{\\sigma^2}{2})T + \\sigma W_T\\big)$. La mediana pone $W_T$ en 0: $${S0}e^{${n((mu - (sigma * sigma) / 2) * T, 3)}} = ${n(median)}$. La media vuelve a sumar $\\tfrac{\\sigma^2}{2}T$ (lognormal): $${S0}e^{${n(mu * T, 3)}} = ${n(mean)}$. La diferencia crece con σ: la mayoría de las trayectorias acaban por debajo de la media.`,
    ][LANGS.indexOf(lang)]!),
  );
};
