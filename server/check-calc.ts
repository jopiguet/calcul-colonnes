/**
 * The answers to generated calculus questions, computed again for
 * `check:quiz` without the generator's code, and by another route where it
 * can: limits by evaluating just beside the point, derivatives by central
 * differences, integrals by fine numerical quadrature (and the areas of a
 * broken line by adaptive splitting where it crosses zero), extrema by
 * scanning the sign of f′, Newton and Euler by running the iterations again,
 * equilibria by bisection and their stability by the sign of f nearby, Taylor
 * coefficients from each function's own series, the second-derivative test
 * from the Hessian's eigenvalues, Green's theorem by the line integral itself,
 * and Brownian moments from their definitions by Gaussian quadrature.
 */
import type { CalcModel } from "../shared/quiz/index.ts";

/** The option is `value` written with `digits` decimals (either rounding of a tie accepted). */
function is(option: string, value: number, digits: number): boolean {
  if (!Number.isFinite(value)) return false;
  if (!new RegExp(digits === 0 ? "^-?\\d+$" : `^-?\\d+\\.\\d{${digits}}$`).test(option)) return false;
  // Numerical integration: a relative error too, for large values.
  return Math.abs(Number(option) - value) <= 0.5 * 10 ** -digits + 1e-7 + 1e-7 * Math.abs(value);
}

/** "p/q" or "p" is this number. */
function isFraction(option: string, value: number): boolean {
  const m = /^(-?\d+)(?:\/(\d+))?$/.exec(option);
  if (!m) return false;
  const p = Number(m[1]);
  const q = m[2] ? Number(m[2]) : 1;
  // Reduced: no common factor, denominator positive and not 1 when written.
  const gcd = (a: number, b: number): number => (b === 0 ? Math.abs(a) : gcd(b, a % b));
  if (m[2] && (q === 1 || gcd(p, q) !== 1)) return false;
  return Math.abs(p / q - value) < 1e-9;
}

/** Simpson's rule with many intervals: the integral, to plenty of digits. */
function integrate(f: (x: number) => number, a: number, b: number, n = 4000): number {
  const h = (b - a) / n;
  let s = f(a) + f(b);
  for (let i = 1; i < n; i++) s += f(a + i * h) * (i % 2 === 1 ? 4 : 2);
  return (s * h) / 3;
}

const derivative = (f: (x: number) => number, x: number): number => (f(x + 1e-5) - f(x - 1e-5)) / 2e-5;
const poly = (p: number[]) => (x: number): number => p.reduce((s, c, i) => s + c * x ** i, 0);

/** A root of f on [lo, hi] where it changes sign. */
function bisect(f: (x: number) => number, lo: number, hi: number): number {
  let flo = f(lo);
  for (let i = 0; i < 200; i++) {
    const mid = (lo + hi) / 2;
    const fm = f(mid);
    if (Math.sign(fm) === Math.sign(flo)) {
      lo = mid;
      flo = fm;
    } else hi = mid;
  }
  return (lo + hi) / 2;
}

/** The broken line through the corners, as a function. */
function broken(corners: [number, number][]) {
  return (x: number): number => {
    for (let i = 1; i < corners.length; i++) {
      const [x1, y1] = corners[i - 1]!;
      const [x2, y2] = corners[i]!;
      if (x >= x1 && x <= x2) return y1 + ((y2 - y1) * (x - x1)) / (x2 - x1);
    }
    return Number.NaN;
  };
}

/** ∫ over each piece of a broken line, exactly enough: many small pieces, each a trapezoid of |f|. */
function brokenIntegral(corners: [number, number][], upTo: number, absolute: boolean): number {
  const f = broken(corners);
  const a = corners[0]![0];
  const n = 60000;
  const h = (upTo - a) / n;
  let s = 0;
  for (let i = 0; i < n; i++) {
    const y1 = f(a + i * h);
    const y2 = f(a + (i + 1) * h);
    s += absolute ? ((Math.abs(y1) + Math.abs(y2)) / 2) * h : ((y1 + y2) / 2) * h;
  }
  return s;
}

const factorial = (k: number): number => (k <= 1 ? 1 : k * factorial(k - 1));

/** Taylor coefficients at 0, from each function's own series. */
const SERIES: Record<"exp" | "sin" | "cos" | "log1p" | "inv1m", (k: number) => number> = {
  // e^x = Σ x^k/k!
  exp: (k) => 1 / factorial(k),
  // sin x = x − x³/3! + x⁵/5! …
  sin: (k) => (k % 2 === 0 ? 0 : (-1) ** ((k - 1) / 2) / factorial(k)),
  // cos x = 1 − x²/2! + x⁴/4! …
  cos: (k) => (k % 2 === 1 ? 0 : (-1) ** (k / 2) / factorial(k)),
  // ln(1 + x) = x − x²/2 + x³/3 …
  log1p: (k) => (k === 0 ? 0 : (-1) ** (k + 1) / k),
  // 1/(1 − x) = 1 + x + x² …
  inv1m: () => 1,
};

/** Gauss–Hermite-free expectation of g(Z√v), Z standard normal: quadrature on [−10, 10]. */
function gaussian(g: (x: number) => number, variance: number): number {
  const sd = Math.sqrt(variance);
  return integrate((z) => (g(z * sd) * Math.exp(-(z * z) / 2)) / Math.sqrt(2 * Math.PI), -10, 10, 20000);
}

const FIELDS: Record<string, (x: number, y: number) => number> = {
  x: (x) => x,
  y: (_, y) => y,
  "-y": (_, y) => -y,
  "x+y": (x, y) => x + y,
  "x-y": (x, y) => x - y,
  "-x/y": (x, y) => -x / y,
  "y(1-y)": (_, y) => y * (1 - y),
  xy: (x, y) => x * y,
};

export function calcAnswer(m: CalcModel, option: string): boolean {
  switch (m.type) {
    case "limitGraph": {
      const f = (x: number): number => (x < m.a ? m.left[0] * x + m.left[1] : m.right[0] * x + m.right[1]);
      const left = f(m.a - 1e-9);
      const right = f(m.a + 1e-9);
      if (m.ask === "left") return is(option, left, 2);
      if (m.ask === "right") return is(option, right, 2);
      if (m.ask === "two") return Math.abs(left - right) < 1e-6 ? is(option, left, 2) : option === "dne";
      return m.value === null ? option === "undef" : is(option, m.value, 2);
    }
    case "epsilonDelta": {
      // The largest δ: bisect on the condition |f(a ± δ) − L| < ε.
      const f = (x: number): number => m.m * x + m.c;
      const L = f(m.a);
      const ok = (d: number): boolean => Math.abs(f(m.a + d) - L) <= m.eps && Math.abs(f(m.a - d) - L) <= m.eps;
      let lo = 0;
      let hi = 10;
      for (let i = 0; i < 100; i++) {
        const mid = (lo + hi) / 2;
        if (ok(mid)) lo = mid;
        else hi = mid;
      }
      return is(option, lo, 3);
    }
    case "secant": {
      const f = poly(m.poly);
      return is(option, (f(m.b) - f(m.a)) / (m.b - m.a), 2);
    }
    case "tangent": {
      const f = poly(m.poly);
      const slope = derivative(f, m.a);
      const [mo, ko] = option.split(",");
      return mo !== undefined && ko !== undefined && is(mo, slope, 2) && is(ko, f(m.a) - slope * m.a, 2);
    }
    case "extrema": {
      // Scan f′'s sign: + to − is a maximum, − to + a minimum. One must be found.
      const fp = (x: number): number => m.lead * m.roots.reduce((s, r) => s * (x - r), 1);
      const found: number[] = [];
      for (let x = -5; x < 5; x += 0.001) {
        const [a, b] = [fp(x), fp(x + 0.001)];
        if (m.ask === "max" ? a > 0 && b <= 0 : a < 0 && b >= 0) found.push(Math.round((x + 0.001) * 100) / 100);
      }
      const unique = [...new Set(found.map((x) => Math.round(x)))];
      if (unique.length !== 1) throw new Error(`extrema: ${unique.length} points of that kind`);
      return is(option, unique[0]!, 2);
    }
    case "newton": {
      let x = m.x0;
      for (let i = 0; i < m.steps; i++) {
        const f = (t: number): number => t ** m.power - m.c;
        x -= f(x) / derivative(f, x);
      }
      return is(option, x, 4);
    }
    case "riemann": {
      const f = poly(m.poly);
      const dx = (m.b - m.a) / m.n;
      const shift = { left: 0, right: 1, mid: 0.5 }[m.method];
      let s = 0;
      for (let i = 0; i < m.n; i++) s += f(m.a + (i + shift) * dx) * dx;
      return is(option, s, 3);
    }
    case "netArea": {
      const last = m.corners[m.corners.length - 1]![0];
      return is(option, brokenIntegral(m.corners, last, m.ask === "total"), 2);
    }
    case "areaFunction": {
      // g′(c): the difference quotient of the area function itself, from the left (c may be the last corner).
      if (m.ask === "gprime") {
        const h = 1e-4;
        return is(option, (brokenIntegral(m.corners, m.c, false) - brokenIntegral(m.corners, m.c - h, false)) / h, 2);
      }
      return is(option, brokenIntegral(m.corners, m.c, false), 2);
    }
    case "halfLife": {
      const y = (t: number): number => m.y0 * Math.exp(-m.k * t);
      return is(option, bisect((t) => y(t) - m.y0 / 2, 0, 1000), 2);
    }
    case "lhopital": {
      const top = { exp: (x: number) => Math.exp(m.a * x) - 1, sin: (x: number) => Math.sin(m.a * x), log: (x: number) => Math.log(1 + m.a * x) }[m.kind];
      const limit = (top(1e-7) / (m.b * 1e-7) + top(-1e-7) / (m.b * -1e-7)) / 2;
      return option !== "" && isFraction(option, eval1(option)) && Math.abs(eval1(option) - limit) < 1e-5;
    }
    case "numeric": {
      const f = { inv: (x: number) => 1 / x, sqrt: (x: number) => Math.sqrt(x), gauss: (x: number) => Math.exp(-x * x), cube: (x: number) => x ** 3 }[m.fn];
      const h = (m.b - m.a) / m.n;
      const ys = Array.from({ length: m.n + 1 }, (_, i) => f(m.a + i * h));
      const value =
        m.method === "trapezoid"
          ? h * (ys.reduce((s, y) => s + y, 0) - (ys[0]! + ys[m.n]!) / 2)
          : (h / 3) * ys.reduce((s, y, i) => s + y * (i === 0 || i === m.n ? 1 : i % 2 === 1 ? 4 : 2), 0);
      return is(option, value, 3);
    }
    case "improper": {
      const p = m.num / m.den;
      if (p <= 1) return option === "div";
      // ∫₁^T x^(−p) for a large T, plus the tail T^(1−p)/(p − 1).
      const T = 1e4;
      const value = integrate((x) => x ** -p, 1, 100, 20000) + integrate((x) => x ** -p, 100, T, 20000) + T ** (1 - p) / (p - 1);
      return option !== "div" && isFraction(option, eval1(option)) && Math.abs(eval1(option) - value) < 1e-4;
    }
    case "euler": {
      const F = FIELDS[m.eq]!;
      let [x, y] = [m.x0, m.y0];
      for (let i = 0; i < m.n; i++) {
        y += m.h * F(x, y);
        x += m.h;
      }
      return is(option, y, 4);
    }
    case "slopeField":
      return option === m.eq && FIELDS[m.eq] !== undefined;
    case "logistic": {
      const f = (N: number): number => m.r * N * (1 - N / m.K) - m.H;
      // The equilibria, and the one where f goes from + to − (stable).
      const top = m.K / 2;
      const high = bisect(f, top, m.K);
      if (!(f(high - 1e-3 * m.K) > 0 && f(high + 1e-3 * m.K) < 0)) throw new Error("logistic: no stable equilibrium found");
      return is(option, high, 2);
    }
    case "polar":
      return option === `${m.trig}${m.k}`;
    case "paramSlope": {
      const x = poly(m.x);
      const y = poly(m.y);
      return is(option, derivative(y, m.t0) / derivative(x, m.t0), 2);
    }
    case "geometric": {
      if (Math.abs(m.r) >= 1) return option === "div";
      let s = 0;
      for (let n = 0; n < 2000; n++) s += m.a * m.r ** n;
      return is(option, s, 2);
    }
    case "taylor": {
      const coefs = Array.from({ length: m.n + 1 }, (_, k) => SERIES[m.fn](k));
      // Trailing zero coefficients are not written: the polynomial, not its nominal degree.
      const parts = option.split(",").map(Number);
      const wanted = [...coefs];
      while (wanted.length > 1 && Math.abs(wanted[wanted.length - 1]!) < 1e-12) wanted.pop();
      return parts.length === wanted.length && parts.every((v, i) => Math.abs(v - wanted[i]!) <= 0.0005 + 1e-9);
    }
    case "vectorAngle": {
      const angle = Math.abs(Math.atan2(m.u[0] * m.v[1] - m.u[1] * m.v[0], m.u[0] * m.v[0] + m.u[1] * m.v[1]));
      return is(option, (angle * 180) / Math.PI, 1);
    }
    case "crossArea": {
      // Area as |u||v| sin θ, θ from the dot product.
      const [u, v] = [m.u, m.v];
      const nu = Math.hypot(...u);
      const nv = Math.hypot(...v);
      const cos = (u[0] * v[0] + u[1] * v[1] + u[2] * v[2]) / (nu * nv);
      const area = nu * nv * Math.sqrt(Math.max(0, 1 - cos * cos));
      return is(option, m.shape === "parallelogram" ? area : area / 2, 2);
    }
    case "directional": {
      const f = (x: number, y: number): number => m.a * x * x + m.b * y * y;
      const n = Math.hypot(...m.u);
      const g = (t: number): number => f(m.p[0] + (t * m.u[0]) / n, m.p[1] + (t * m.u[1]) / n);
      return is(option, derivative(g, 0), 2);
    }
    case "classify": {
      // The Hessian [[2a, b], [b, 2c]]: its eigenvalues' signs.
      const tr = 2 * m.a + 2 * m.c;
      const det = 4 * m.a * m.c - m.b * m.b;
      const disc = Math.sqrt(tr * tr - 4 * det);
      const [l1, l2] = [(tr + disc) / 2, (tr - disc) / 2];
      const kind = l1 > 0 && l2 > 0 ? "min" : l1 < 0 && l2 < 0 ? "max" : l1 * l2 < 0 ? "saddle" : "none";
      return option === kind;
    }
    case "green": {
      // The line integral itself: r(t) = R(cos t, sin t), F·r′.
      const value = integrate((t) => {
        const [x, y] = [m.R * Math.cos(t), m.R * Math.sin(t)];
        const [dx, dy] = [-m.R * Math.sin(t), m.R * Math.cos(t)];
        return -m.a * y * dx + m.b * x * dy;
      }, 0, 2 * Math.PI);
      return is(option, value, 2);
    }
    case "brownian": {
      const value =
        m.ask === "cov"
          ? // E[W_s W_t] = E[W_s²] + E[W_s]·E[W_t − W_s], the increment independent with mean 0.
            gaussian((x) => x * x, Math.min(m.s, m.t)) + gaussian((x) => x, Math.min(m.s, m.t)) * gaussian((x) => x, Math.abs(m.t - m.s))
          : m.ask === "increment"
            ? gaussian((x) => x * x, Math.abs(m.t - m.s))
            : m.ask === "second"
              ? gaussian((x) => x * x, m.t)
              : gaussian((x) => Math.exp(m.sigma * x), m.t);
      return is(option, value, 3);
    }
    case "ito": {
      // ½ f″(x) for f(x) = xⁿ, as "c,p" for c·x^p.
      const c = (m.n * (m.n - 1)) / 2;
      return option === `${c},${m.n - 2}`;
    }
    case "gbm": {
      // S_T = S0·exp((μ − σ²/2)T + σW_T): the median at W_T = 0, the mean by quadrature.
      const drift = (m.mu - (m.sigma * m.sigma) / 2) * m.T;
      const value = m.ask === "median" ? m.S0 * Math.exp(drift) : gaussian((w) => m.S0 * Math.exp(drift + m.sigma * w), m.T);
      return is(option, value, 2);
    }
  }
}

/** "p/q" as a number. */
function eval1(option: string): number {
  const [p, q] = option.split("/").map(Number);
  return p! / (q ?? 1);
}
