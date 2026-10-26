/**
 * What a generated calculus question is about, as data: the generator
 * (`calc-output.ts`) computes the answer from it, and `check:quiz` computes it
 * again with its own evaluator (`server/check-calc.ts`), by another route
 * where it can (numerical limits, derivatives and integrals, iterations run
 * again, sign changes scanned).
 *
 * Each option's formula (`tex`) is the answer in a canonical form: a number
 * written with a point and fixed decimals ("2.50"), "dne" for a limit that
 * does not exist, "div" for a divergent integral or series, a reduced fraction
 * "3/2", a pair "m,k" (a line y = mx + k), a list of coefficients "1,1,0.5",
 * or a name ("max", "saddle", "x+y", "cos3").
 *
 * Polynomials are lists of coefficients, constant term first: [c0, c1, c2].
 */

/** A function on [x0, x1] given by its graph's corners: straight between them. */
export type Corners = [number, number][];

export type CalcModel =
  /** Two lines meeting (or not) at a; f(a) = value, or undefined (null). The limit asked, two decimals, or "dne". */
  | { type: "limitGraph"; a: number; left: [number, number]; right: [number, number]; value: number | null; ask: "left" | "right" | "two" | "value" }
  /** f(x) = mx + c near a: the largest δ for which |x − a| < δ gives |f(x) − f(a)| < ε (three decimals). */
  | { type: "epsilonDelta"; m: number; c: number; a: number; eps: number }
  /** Average rate of change of a polynomial over [a, b] (two decimals). */
  | { type: "secant"; poly: number[]; a: number; b: number }
  /** The tangent to a polynomial at a: "m,k" for y = mx + k (two decimals each). */
  | { type: "tangent"; poly: number[]; a: number }
  /** f′ = lead·Π(x − rᵢ): where f has its (only) local maximum or minimum (two decimals). */
  | { type: "extrema"; roots: number[]; lead: 1 | -1; ask: "max" | "min" }
  /** Newton's method on x² − c or x³ − c from x0: the iterate after `steps` steps (four decimals). */
  | { type: "newton"; power: 2 | 3; c: number; x0: number; steps: number }
  /** A Riemann sum of a polynomial on [a, b] with n rectangles (three decimals). */
  | { type: "riemann"; poly: number[]; a: number; b: number; n: number; method: "left" | "right" | "mid" }
  /** A function through these corners: its net (signed) or total area from the first corner to the last (two decimals). */
  | { type: "netArea"; corners: Corners; ask: "net" | "total" }
  /** g(x) = ∫₀ˣ f, f through these corners from x = 0: g(c) or g′(c) (two decimals). */
  | { type: "areaFunction"; corners: Corners; c: number; ask: "g" | "gprime" }
  /** y = y0·e^(−kt): the half-life (two decimals). */
  | { type: "halfLife"; k: number; y0: number }
  /** lim x→0 of (e^(ax) − 1)/(bx), sin(ax)/(bx) or ln(1 + ax)/(bx): a reduced fraction "p/q" (or an integer). */
  | { type: "lhopital"; kind: "exp" | "sin" | "log"; a: number; b: number }
  /** The trapezoid or Simpson approximation with n intervals of ∫ₐᵇ f, f named (three decimals). */
  | { type: "numeric"; fn: "inv" | "sqrt" | "gauss" | "cube"; a: number; b: number; n: number; method: "trapezoid" | "simpson" }
  /** ∫₁^∞ x^(−p) dx, p = num/den: its value as a reduced fraction, or "div". */
  | { type: "improper"; num: number; den: number }
  /** Euler's method for y′ = F(x, y) from (x0, y0) with step h, n steps: y_n (four decimals). */
  | { type: "euler"; eq: EulerEquation; x0: number; y0: number; h: number; n: number }
  /** The slope field drawn: the equation's name ("x+y", "y(1-y)"…). */
  | { type: "slopeField"; eq: FieldEquation }
  /** dN/dt = rN(1 − N/K) − H: the stable equilibrium (two decimals). */
  | { type: "logistic"; r: number; K: number; H: number }
  /** The polar curve r = cos(kθ) or sin(kθ) drawn: its name ("cos3", "sin2"). */
  | { type: "polar"; trig: "cos" | "sin"; k: number }
  /** x(t), y(t) polynomials: dy/dx at t0 (two decimals). */
  | { type: "paramSlope"; x: number[]; y: number[]; t0: number }
  /** Σ a·rⁿ from n = 0: the sum (two decimals), or "div". */
  | { type: "geometric"; a: number; r: number }
  /** The Taylor polynomial of degree n at 0 of a named function: its coefficients, constant first ("1,1,0.5"; three decimals each, trailing zeros dropped). */
  | { type: "taylor"; fn: "exp" | "sin" | "cos" | "log1p" | "inv1m"; n: number }
  /** The angle between two plane vectors, in degrees (one decimal). */
  | { type: "vectorAngle"; u: [number, number]; v: [number, number] }
  /** The area of the parallelogram (or triangle) on two space vectors (two decimals). */
  | { type: "crossArea"; u: [number, number, number]; v: [number, number, number]; shape: "parallelogram" | "triangle" }
  /** f = ax² + by²: the derivative at p in the direction of u (not a unit vector), two decimals. */
  | { type: "directional"; a: number; b: number; p: [number, number]; u: [number, number] }
  /** f = ax² + bxy + cy²: what (0, 0) is, "min", "max" or "saddle". */
  | { type: "classify"; a: number; b: number; c: number }
  /** F = (−ay, bx) around the circle of radius R, anticlockwise: the circulation (two decimals). */
  | { type: "green"; a: number; b: number; R: number }
  /** Brownian motion W: E[W_s W_t], Var(W_t − W_s), E[W_t²] or E[e^(σW_t)] (three decimals). */
  | { type: "brownian"; s: number; t: number; sigma: number; ask: "cov" | "increment" | "second" | "exponential" }
  /** d(W_tⁿ): the dt coefficient, "c,p" for c·W_t^p. */
  | { type: "ito"; n: number }
  /** dS = μS dt + σS dW from S0: the mean or the median of S_T (two decimals). */
  | { type: "gbm"; mu: number; sigma: number; S0: number; T: number; ask: "mean" | "median" };

/** Euler's method: y′ = F(x, y). */
export type EulerEquation = "x+y" | "x-y" | "y" | "xy" | "x";
/** Slope fields offered: y′ = F(x, y). */
export type FieldEquation = "x" | "y" | "-y" | "x+y" | "x-y" | "-x/y" | "y(1-y)" | "xy";
