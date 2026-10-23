# Question generators

The multiple-choice engine lives entirely in `shared/quiz/`, and runs the same
way in the browser and on the server.

| File | Content |
|---|---|
| `types.ts` | `Level`, `Topic`, `Draft`, `Option`, `Verify`, `Question` |
| `rng.ts` | Seeded random numbers (mulberry32) |
| `tex.ts` | Exact fractions and LaTeX helpers: `frac`, `sum`, `poly`, `piTex`… |
| `derivatives.ts`, `integrals.ts`, `trigonometry.ts`, `limits.ts`, `explog.ts`, `probability.ts`, `sequences.ts`, `complex.ts`, `odes.ts`, `linear.ts`, `functions.ts`, `geometry.ts`, `series.ts`, `multivariable.ts`, `graphs.ts` | The generators, one file per topic |
| `units.ts`, `gases.ts`, `firstlaw.ts`, `secondlaw.ts` | Physical chemistry: quantities with units and significant figures, constants; the generators of Focuses 1–3 |
| `linux.ts`, `linux/*.ts`, `linux-output.ts` | Linux: the written questions by topic, the generated permissions, umask and cron, and what a sed, awk or `${f%.*}` command prints |
| `quantum.ts`, `atoms.ts`, `spectroscopy.ts`, `kinetics.ts` | Physical chemistry, Focuses 7–8, 11–12 and 17–18: quantum theory, atoms, spectroscopy and magnetic resonance, kinetics and reaction dynamics |
| `balancing.ts` | Chemistry basics: formulas, an exact balancing solver, reactions by family, the generators of balancing equations |
| `bank.ts`, `bank-file.ts` | Written questions from a textbook: see [Question bank](question-bank.md) |
| `typed.ts` | Typed answers: reading a number (`readNumber`), the tolerance (`accepts`), which questions can be typed (`typeable`), matching an answer to an option (`matchTyped`) |
| `index.ts` | Registry of kinds of question, `generateQuiz`, `gradeQuiz`, `QUIZ_VERSION` |
| `progress.ts` | Status of a kind of question from the latest answers |

## The 110 kinds of question

A *kind* is one generator; its id is `topic.name`. Ids are stored with every
answer, so **an id must never be renamed**. The name shown to players is in
`src/quiz-i18n.ts` (`SKILL_NAMES`).

### Derivatives

| Id | Asks for | Typical wrong options | Lycée | Univ. |
|---|---|---|:-:|:-:|
| `derivatives.polynomial` | derivative of a·xⁿ + b·xᵐ + c | exponent not lowered, not brought down, constant kept, sign error | ✓ | |
| `derivatives.trig` | derivative of a·sin(bx) or a·cos(bx) | chain rule forgotten, sign of (cos)′, sin/cos swapped | ✓ | |
| `derivatives.exponential` | derivative of e^(ax+b) | chain rule forgotten, (ax+b)·e^(ax+b) | ✓ | |
| `derivatives.logarithm` | derivative of ln(ax+b) | 1/(ax+b), a/x, a·ln(ax+b) | ✓ | ✓ |
| `derivatives.product` | derivative of xⁿ·e^(ax) | u′v′, one term only, sign error | ✓ | ✓ |
| `derivatives.logComposite` | derivative of ln(x²+a) | 1/(x²+a), 2x·ln(x²+a) | | ✓ |
| `derivatives.arctan` | derivative of arctan(ax) | chain factor missing, a instead of a² | | ✓ |
| `derivatives.powerLog` | derivative of xⁿ·ln x | product rule half applied | | ✓ |
| `derivatives.quotient` | derivative of e^(ax)/x | numerator sign errors, a·e^(ax) | | ✓ |

### Integrals

| Id | Asks for | Typical wrong options | Lycée | Univ. |
|---|---|---|:-:|:-:|
| `integrals.powerPrimitive` | primitive of a·xⁿ + b | derivative instead, divided by n, constant term dropped | ✓ | |
| `integrals.definitePolynomial` | ∫₀ᵏ (ax + b) dx | a·k² + bk, constant term dropped | ✓ | |
| `integrals.trigPrimitive` | primitive of cos(ax) or sin(ax) | multiplied by a, sign, sin/cos swapped | ✓ | ✓ |
| `integrals.expPrimitive` | primitive of e^(ax) | multiplied by a, e^(ax) unchanged | ✓ | |
| `integrals.inversePrimitive` | primitive of a/x | −a/x², ln\|ax\| (a primitive of 1/x) | ✓ | |
| `integrals.partsExp` | primitive of x·e^(ax) | sign of the 1/a² term, by parts not finished | | ✓ |
| `integrals.partsCos` | primitive of x·cos(ax) | sign, second term missing | | ✓ |
| `integrals.substitution` | primitive of x/(x²+b) | factor ½ missing or doubled | | ✓ |
| `integrals.logPrimitive` | primitive of ln(ax) | x·ln(ax) without −x, 1/x | | ✓ |
| `integrals.definiteParts` | ∫₀ᵏ x·eˣ dx | sign of the constant, k·eᵏ | | ✓ |

### Trigonometry

| Id | Asks for | Typical wrong options | Lycée | Univ. |
|---|---|---|:-:|:-:|
| `trigonometry.exactValue` | sin, cos or tan of a multiple of π/6 or π/4 | opposite sign, the other function's value | ✓ | |
| `trigonometry.trigEquation` | all solutions of cos x = v or sin x = v in [0, 2π) | one solution only, sine/cosine symmetry confused | ✓ | ✓ |
| `trigonometry.schoolIdentity` | cos 2x, sin 2x, cos(π − x), sin(π/2 − x)… | sign and sin/cos swaps | ✓ | |
| `trigonometry.universityIdentity` | cos²x, sin²x, tan 2x, sin 3x | linearisation signs, 1 ± tan² confused | | ✓ |
| `trigonometry.period` | period of a·sin(bx + c) | π/b, 2bπ, 2π | | ✓ |
| `trigonometry.inverseTrig` | arccos v or arcsin v | value outside the principal range, π − θ | | ✓ |

### Limits

| Id | Asks for | Typical wrong options | Lycée | Univ. |
|---|---|---|:-:|:-:|
| `limits.rationalAtInfinity` | limit at +∞ of (axᵖ + b)/(dx^q + e) | ratio of constants, 0, ±∞ | ✓ | ✓ |
| `limits.sinOverX` | limit at 0 of sin(ax)/(bx) | b/a, 1, 0 | ✓ | |
| `limits.growth` | eˣ/xⁿ, xⁿe⁻ˣ, ln x/xⁿ, xⁿ/ln x at +∞ | 0 and +∞ swapped, 1, n | ✓ | ✓ |
| `limits.factor` | limit at a of (x² − a²)/(x − a) | a, a², 0 | ✓ | |
| `limits.expLimit` | (1 + a/x)ˣ at +∞ | 1, e, +∞ | | ✓ |
| `limits.rateAtZero` | (e^(ax) − 1)/x or ln(1 + ax)/x at 0 | 1, 1/a | | ✓ |
| `limits.taylor` | (1 − cos ax)/x², (sin ax − ax)/x³ at 0 | a/2, sign, a² | | ✓ |

### Exponentials and logarithms

| Id | Asks for | Typical wrong options | Lycée | Univ. |
|---|---|---|:-:|:-:|
| `explog.solveExp` | solution of e^(ax+b) = c | sign of b, division misplaced | ✓ | ✓ |
| `explog.logRules` | ln(aⁿ) − ln(aᵐ) | (n/m)·ln a, ln(n − m) | ✓ | |
| `explog.expOfLogs` | e^(ln a + ln b) | a + b, ln(ab) | ✓ | |
| `explog.solveLn` | solution of ln x = k | e⁻ᵏ, 10ᵏ, k | ✓ | |
| `explog.otherBase` | solution of bˣ = c | ln b/ln c, c/b | | ✓ |
| `explog.quadraticInExp` | solutions of e²ˣ − (a+1)eˣ + a = 0 | {1, a} (X instead of x), one root only | | ✓ |
| `explog.expDerivative` | derivative of aˣ | x·aˣ⁻¹, ln a dropped | | ✓ |

### Probability

Answers are exact fractions where they can be. The givens of a question are
stacked one per line (`lines()` in `tex.ts`), so a phone does not cut them off.

| Id | Asks for | Typical wrong options | Lycée | Univ. |
|---|---|---|:-:|:-:|
| `probability.binomial` | P(X = k) for X ~ B(n, p) | C(n, k) forgotten, (1 − p)ⁿ⁻ᵏ forgotten, exponents swapped | ✓ | |
| `probability.binomialMean` | E(X) for X ~ B(n, p) | np(1 − p), n(1 − p), n/p | ✓ | |
| `probability.totalProbability` | P(B) from P(A), P(B \| A), P(B \| Ā) | one branch only, unweighted average, P(A) used for both branches | ✓ | |
| `probability.bayes` | P(A \| B) from the same tree | P(B \| A), P(A ∩ B), **P(B\|A) / (P(B\|A) + P(B\|Ā)): the base rate ignored** | ✓ | ✓ |
| `probability.combinations` | choosing k among n, without order | arrangements n!/(n − k)!, nᵏ, n·k | ✓ | ✓ |
| `probability.expectation` | E(X) from a table of values and probabilities | plain mean of the values, a term dropped, a sign dropped | ✓ | |
| `probability.union` | P(A ∪ B) for independent A and B | P(A) + P(B), P(A)P(B), P(Ā)P(B̄) | ✓ | |
| `probability.binomialVariance` | V(X) for X ~ B(n, p) | np, np², √(np(1 − p)) | | ✓ |
| `probability.poisson` | P(X = k) for X ~ P(λ) | k! forgotten, e^(+λ), λᵏ dropped | | ✓ |
| `probability.exponential` | P(X > t) for X ~ E(λ) | 1 − e^(−λt), e^(−t/λ), the density λe^(−λt) | | ✓ |
| `probability.standardize` | z = (x − μ)/σ for X ~ N(μ, σ²) | divided by σ², sign reversed, μ forgotten | | ✓ |

### Sequences

The first index is u₀ or u₁ at random, so the off-by-one mistake is always
possible.

| Id | Asks for | Typical wrong options | Lycée | Univ. |
|---|---|---|:-:|:-:|
| `sequences.arithmeticTerm` | uₙ of an arithmetic sequence | one step too many or too few, r subtracted, the first term left out | ✓ | |
| `sequences.geometricTerm` | uₙ of a geometric sequence | qⁿ⁻¹ for qⁿ (or the reverse), u₀ + nq, u₀·n·q | ✓ | |
| `sequences.arithmeticSum` | u₀ + … + uₙ | n terms instead of n + 1, ÷2 forgotten | ✓ | |
| `sequences.geometricSum` | u₀ + … + uₙ | qⁿ for qⁿ⁺¹, ÷(1 − q) forgotten, sign | ✓ | ✓ |
| `sequences.geometricLimit` | lim u·qⁿ | 0 and ±∞ swapped, u, 1, the sum of the series | ✓ | ✓ |
| `sequences.fixedPoint` | lim uₙ for uₙ₊₁ = auₙ + b, \|a\| < 1 | b/(1 + a), b/a, b, u₀ | ✓ | ✓ |
| `sequences.explicitTerm` | uₙ for uₙ₊₁ = auₙ + b, a > 1 | u₀·aⁿ + ℓ (limit not subtracted first), sign of ℓ, aⁿ⁻¹ | | ✓ |

### Complex numbers

Options are complex numbers (`z`) or sets of them (`zs`). The exact forms use
the angles whose cosine and sine are known: multiples of π/6 and π/4.

| Id | Asks for | Typical wrong options | Lycée | Univ. |
|---|---|---|:-:|:-:|
| `complex.product` | (a + bi)(c + di) | i² = +1, multiplied part by part, sign | ✓ | |
| `complex.quotient` | (a + bi)/(c + di) | a/c + (b/d)i, multiplied by the number instead of its conjugate, c² − d² | ✓ | ✓ |
| `complex.modulus` | \|a + bi\| | a² + b², \|a\| + \|b\|, √\|a² − b²\| | ✓ | |
| `complex.argument` | arg z in ]−π, π] | −θ, θ + π, π − θ, π/2 − θ (cos and sin swapped) | ✓ | ✓ |
| `complex.exponentialForm` | z = re^(iθ) | r², the conjugate's argument, the wrong quadrant | ✓ | ✓ |
| `complex.quadratic` | the two roots of z² + pz + q = 0, Δ < 0 | sign of the real part, β² for β, two real roots, not divided by 2 | ✓ | ✓ |
| `complex.deMoivre` | (re^(iθ))ⁿ in exponential form | modulus not raised, argument not multiplied, n·r, + π | | ✓ |
| `complex.nthRoot` | which number solves zⁿ = w | modulus not rooted, argument not divided, roots spaced by π/n | | ✓ |

### Differential equations

The question gives an initial condition, so the answer is one function. The
check substitutes each option into the equation and checks the initial values
(`ode` in `Verify`).

| Id | Asks for | Typical wrong options | Lycée | Univ. |
|---|---|---|:-:|:-:|
| `odes.homogeneous` | y′ = ay, y(0) given | eᵃˣ + C, e^(−ax), a·y(0)·eᵃˣ, e^(x/a) | ✓ | |
| `odes.affine` | y′ = ay + b, y(0) given | C = y(0) without the constant solution, its sign, e^(−ax) | ✓ | ✓ |
| `odes.separable` | y′ = axy, y(0) given | e^(ax) (not integrated), e^(ax²), sign | | ✓ |
| `odes.distinctRoots` | y″ + py′ + qy = 0, two real roots | roots' signs, A and B swapped, A = y(0) and B = y′(0), a double root's form | | ✓ |
| `odes.doubleRoot` | the same, double root | the x forgotten, B = y′(0), root's sign | | ✓ |
| `odes.complexRoots` | the same, roots α ± iβ | cos and sin swapped, B = y′(0), α and β swapped, sign | | ✓ |

### Matrices and systems

| Id | Asks for | Typical wrong options | Lycée | Univ. |
|---|---|---|:-:|:-:|
| `linear.determinant2` | det of a 2×2 matrix | ps + qr, the wrong diagonals, the opposite | ✓ | |
| `linear.determinant3` | det of a 3×3 matrix (Sarrus) | cofactor signs forgotten, the − products added, the + products only, the main diagonal | ✓ | ✓ |
| `linear.scaledDeterminant` | det(kA) from det A | k·det A, the wrong power of k, det A | ✓ | ✓ |
| `linear.product` | AB | BA, entry by entry, rows times rows, signs | ✓ | ✓ |
| `linear.inverse` | A⁻¹ for a 2×2 matrix | 1/det forgotten, diagonal not swapped, the wrong entries negated | ✓ | ✓ |
| `linear.system` | (x, y) for a 2×2 system | x and y swapped, signs, Cramer's numerators not divided | ✓ | ✓ |
| `linear.eigenvalues` | eigenvalues of a 2×2 matrix | the diagonal, the opposites, trace and determinant | | ✓ |
| `linear.rank` | rank of a 3×3 or 3×4 matrix | the other ranks | | ✓ |

### Function study

| Id | Asks for | Typical wrong options | Lycée | Univ. |
|---|---|---|:-:|:-:|
| `functions.tangent` | tangent line to a cubic at a | y = f′(a)x + f(a), f(a) and f′(a) swapped, sign of a | ✓ | ✓ |
| `functions.vertex` | where a parabola has its extremum | the extremum's value, sign, factor 2 | ✓ | |
| `functions.quadraticRoots` | roots of a trinomial | sum and product taken for the roots, opposites, factor | ✓ | |
| `functions.inflection` | inflection point of a cubic | f′ used instead of f″, sign, factor | ✓ | ✓ |
| `functions.localMaximum` | value of the local maximum of x³ − 3k²x + c | the minimum, the abscissa, c | ✓ | ✓ |
| `functions.obliqueAsymptote` | oblique asymptote of (ax² + bx + c)/(x + d) | division not done (y = ax + b), sign of the remainder term | | ✓ |

### Vectors and geometry in space

Vectors used for norms and distances have whole lengths ((1, 2, 2) has length
3, (2, 3, 6) length 7…), shuffled and with random signs, so the answers stay
exact.

| Id | Asks for | Typical wrong options | Lycée | Univ. |
|---|---|---|:-:|:-:|
| `geometry.dotProduct` | u · v in space | a term dropped, a sign, (Σu)(Σv), coordinates mismatched | ✓ | |
| `geometry.vectorNorm` | ‖u‖ | the sum of squares, Σ\|uᵢ\|, a coordinate dropped | ✓ | |
| `geometry.vectorAngle` | angle between u and v | π − θ, π/2 − θ, θ/2 | ✓ | ✓ |
| `geometry.planeEquation` | plane through A with normal n | sign of d, point and normal swapped, d forgotten | ✓ | ✓ |
| `geometry.pointPlaneDistance` | distance from M to a plane | not divided by ‖n‖, divided by ‖n‖², d dropped, sign of d | ✓ | ✓ |
| `geometry.crossProduct` | u × v | v × u, entry by entry, middle sign, all + | | ✓ |
| `geometry.linePlane` | t where M(t) = A + tu meets the plane | sign, n · u not divided by, d dropped, ratio inverted | | ✓ |

### Series (university)

| Id | Asks for | Typical wrong options | Lycée | Univ. |
|---|---|---|:-:|:-:|
| `series.geometricSeries` | Σ a·qⁿ from n = 0 or 1 | the other start, a/(1 + q), a forgotten, ÷(1 − q)² | | ✓ |
| `series.telescoping` | Σ c/(n(n + k)) | c/k (one partial fraction only), the 1/k forgotten, one term too many or too few | | ✓ |
| `series.exponentialSeries` | Σ kⁿ/n! from n = 0 or 1 | e^k ± 1, e^(−k), k·e^k, 1/(1 − k) | | ✓ |
| `series.radius` | radius of Σ nᵖxⁿ/rⁿ, Σ rⁿxⁿ/nᵖ, Σ nᵖx²ⁿ/rⁿ | inverted, 1 (nᵖ taken as deciding), √ forgotten, r² | | ✓ |

### Functions of several variables (university)

f is a polynomial in x and y with a mixed term, an x-only and a y-only term,
so each mistake gives a different value.

| Id | Asks for | Typical wrong options | Lycée | Univ. |
|---|---|---|:-:|:-:|
| `multivariable.partialDerivative` | ∂f/∂x or ∂f/∂y at a point | the other variable, terms without it kept, exponent not brought down, f itself | | ✓ |
| `multivariable.gradient` | ∇f at a point | components swapped, the point swapped, terms kept, exponent not brought down | | ✓ |
| `multivariable.criticalPoint` | the critical point of a quadratic | opposite, swapped, the xy term ignored, factor 2 | | ✓ |
| `multivariable.doubleIntegral` | ∫∫ over [0, A] × [0, B] of a polynomial | no divisors, one divisor, the y integration skipped, bounds swapped | | ✓ |

### Reading graphs

The app draws the curves (SVG, `src/graph.ts`); a generator gives functions
and a window. All the options of a question share one window, so they can be
compared by eye. Where the options are drawn, they are named by their letter
only on screen; their formula appears in the corrections.

| Id | Asks for | Typical wrong options | Lycée | Univ. |
|---|---|---|:-:|:-:|
| `graphs.derivativeCurve` | the graph of f′, given the graph of a cubic f | −f′, f itself, a primitive of f, f″ | ✓ | ✓ |
| `graphs.primitiveCurve` | the graph of f, given the graph of f′ and f(0) | f′ itself, f″, −f, the wrong constant | | ✓ |
| `graphs.formulaToCurve` | the graph of a(x − h)² + k | shifted the wrong way, upside down, h and k swapped, sign of k | ✓ | |
| `graphs.formulaToCurveAdvanced` | the graph of e^(x−h) + k or 1/(x − h) + k | the same mistakes | | ✓ |
| `graphs.curveToFormula` | the equation of a drawn line (two grid points marked) | −m, sign of p, m and p swapped, 1/m | ✓ | |
| `graphs.transformCurve` | the graph of f(x − c), f(x) + c, −f(x) or f(−x), given f's | shifted the wrong way, along the other axis, the other reflection | ✓ | |
| `graphs.transformCurveAdvanced` | the same, and f(2x), 2f(x), \|f(x)\| | f(x/2) for f(2x), stretched along the other axis, f(\|x\|) | | ✓ |
| `graphs.tangentSlope` | f′(a), read on a drawn tangent | −m, f(a), the tangent's intercept, 1/m | ✓ | ✓ |
| `graphs.solutionCount` | the number of solutions of f(x) = k on [−4, 4] | one more, one fewer, the solutions of f(x) = 0 | ✓ | ✓ |
| `graphs.planeFromEquation` | the plane ax + by + cz = d, drawn through its intercepts | the coefficients taken for the intercepts, two intercepts swapped, a sign | ✓ | ✓ |

`solutionCount` keeps the level away from the turning values and the ends of
the interval, so the count never hangs on a tangency.

## Physical chemistry

Physical chemistry has its own topics, grouped as *Thermodynamics*:
`gases`, `firstLaw`, `secondLaw`, `phases`, `mixtures` and `equilibrium`
(Atkins, Focuses 1–6), then *Quantum and structure*: `quantum` and `atoms`
(Focuses 7–8), *Spectroscopy*: `spectroscopy` and `resonance` (Focuses 11–12),
and *Kinetics*: `kinetics` and `dynamics` (Focuses 17–18).
Two levels.
At `chemistry` (*Fondamental*), each topic mixes the calculations below with
the core questions of the [question bank](question-bank.md), one kind per
unit of the book (`gases.concepts1A`). At `chemistryAdvanced` (*Avancé*), it
has only the bank's advanced questions (`gases.advanced1A`): no generator is
registered at that level, and a bank without advanced questions gives no
advanced test.

The data are drawn on grids (`draw`) and written to three significant figures
(`sig`, `qty`); options are compared by value, so two mistakes giving the same
number are one option. The calculations can be answered by typing the number,
in the unit shown, under the usual rule (see [Typed answers](#typed-answers)):
no value of a million or more, options far enough apart.

| Id | Asks for | Typical wrong options |
|---|---|---|
| `gases.perfectGasPressure` | p from n, V, T | °C for K, dm³ as m³, R in L atm, formula inverted |
| `gases.perfectGasAmount` | n from p, V, T | same |
| `gases.partialPressure` | Dalton's law: partial pressure from a mole fraction | wrong mole fraction, the other gas's pressure, formula inverted |
| `gases.rmsSpeed` | √(3RT/M) | °C for K, M in g mol⁻¹, mean or most probable speed, square root forgotten |
| `gases.speedRatio` | ratio of mean speeds of two gases | ratio inverted, square root forgotten, wrong power |
| `gases.meanFreePath` | λ = kT/σp | °C for K, pressure units, formula inverted |
| `gases.compressionFactor` | Z = pV_m/RT | °C for K, R in L atm, 1 (perfect gas), inverted |
| `gases.vdwPressure` | van der Waals pressure | attraction added, a/V_m not squared, perfect gas, n forgotten |
| `gases.criticalTemperature` | T_c = 8a/27Rb | °C for K, R units, ratio inverted |
| `firstLaw.expansionWork` | −p_ex ΔV | sign, volume units |
| `firstLaw.reversibleWork` | −nRT ln(V_f/V_i) | sign, log₁₀, linear for log, kJ/J |
| `firstLaw.internalEnergyChange` | n C_V,m ΔT | C_p for C_V, sign, n forgotten, kJ/J |
| `firstLaw.enthalpyFromEnergy` | ΔH = ΔU + Δn_g RT | sign, Δn_g forgotten, RT in J with ΔU in kJ |
| `firstLaw.hessLaw` | a reaction enthalpy from two others | reaction reversed without sign change, coefficient forgotten |
| `firstLaw.reactionEnthalpy` | Σν Δ_fH | reactants minus products, coefficient forgotten, a term dropped |
| `firstLaw.kirchhoff` | ΔH at another temperature | ΔC_p term dropped or with the wrong sign, J/kJ |
| `firstLaw.adiabaticTemperature` | T_f = T_i(V_i/V_f)^(1/c) | isothermal, ratio inverted, γ for 1/c |
| `firstLaw.adiabaticPressure` | p_f = p_i(V_i/V_f)^γ | isothermal, ratio inverted, wrong exponent |
| `secondLaw.entropyExpansion` | nR ln(V_f/V_i) | log₁₀, linear for log, ratio inverted, n forgotten |
| `secondLaw.entropyHeating` | C ln(T_f/T_i) | °C for K, C_V for C_p, log₁₀, linear |
| `secondLaw.transitionEntropy` | Δ_trsH/T_trs | °C for K, kJ/J, inverted, sign |
| `secondLaw.trouton` | Δ_vapH ≈ 85 J K⁻¹ mol⁻¹ × T_b | °C for K, J/kJ, inverted |
| `secondLaw.carnot` | 1 − T_c/T_h | °C for K, T_c/T_h itself, ratio inverted |
| `secondLaw.reactionEntropy` | Σν S_m | elements taken as zero, reversed, coefficient forgotten |
| `secondLaw.gibbsEnergy` | ΔH − TΔS | °C for K, J/kJ mixed, sign |
| `secondLaw.crossoverTemperature` | T = ΔH/ΔS | °C for K, J/kJ, inverted |
| `secondLaw.gibbsPressure` | RT ln(p_f/p_i) | °C for K, log₁₀, ratio inverted |
| `secondLaw.debyeEntropy` | S = C_p/3 at low T | C_p itself, 3C_p, ln |

These kinds came with the level, so `QUIZ_VERSION` stayed at 2: no saved
test could contain them.

Focuses 4–6 came as three new topics (6.9.0). A saved test only draws from
the topics it names, so the new kinds cannot change an older test either:
`QUIZ_VERSION` stays at 2.

| Id | Asks for | Typical wrong options |
|---|---|---|
| `phases.phaseRule` | F = C − P + 2 | the 2 dropped, P − C + 2, signs |
| `phases.clapeyronSlope` | dp/dT = ΔfusH/(TΔfusV), melting point in °C | °C for K, kJ/J, ΔV in m³ unconverted, answer in Pa, sign |
| `phases.vapourPressure` | p* at θ from the normal boiling point (Clausius–Clapeyron) | exponent's sign, kJ/J, 10ˣ for eˣ, °C for K |
| `phases.vaporizationEnthalpy` | ΔvapH from p* at two temperatures | sign, log₁₀, °C for K, kJ/J, R in dm³ bar |
| `phases.boilingTemperature` | the boiling temperature at another pressure | sign, log₁₀, answer left in K, kJ/J |
| `phases.condensedPotential` | Δμ = V_mΔp for a liquid or solid | RT ln(p_f/p_i) as for a gas, cm³/dm³, ρ/M for M/ρ, kJ/J, bar as Pa |
| `mixtures.gibbsMixing` | ΔmixG = nRTΣx ln x, θ in °C | sign, log₁₀, n_A/n_B for x_A, °C for K, kJ/J |
| `mixtures.entropyMixing` | ΔmixS = −nRΣx ln x | sign, log₁₀, per mole, n_A/n_B for x_A |
| `mixtures.raoultPressure` | x_Ap_A* + x_Bp_B* | fractions swapped, n_A/n_B for x_A, one term |
| `mixtures.vapourComposition` | y_A = x_Ap_A*/p | x_A itself, y_B, p_B* for p_A*, x_A forgotten |
| `mixtures.henrySolubility` | b = yp/K, in mmol kg⁻¹ | total pressure for partial, K/p, kPa as Pa, mmol/mol |
| `mixtures.freezingDepression`, `mixtures.boilingElevation` | ΔT = iKb | ions of a salt forgotten, solvent in g, molality without the solvent, K/b |
| `mixtures.osmoticMolarMass` | M = cRT/Π | °C for K, Π/cRT, g/kg, dm³/m³, R in L atm |
| `mixtures.leverRule` | the fraction of the amount in the liquid | the complement, the ratio n_l/n_v, its inverse, the overall composition |
| `mixtures.activityCoefficient` | γ_A = p_A/(x_Ap_A*) | the activity a_A, the inverse, x_B for x_A |
| `mixtures.ionicStrength` | I = ½Σz²b for two salts | ½ forgotten, \|z\| for z², ions per formula unit forgotten, molalities added |
| `mixtures.debyeHuckel` | log γ± = −A\|z₊z₋\|√I | eˣ for 10ˣ, I for √I, sign, charges dropped, b for I |
| `equilibrium.constantFromGibbs` | K = exp(−ΔrG°/RT), θ in °C | 1/K, kJ/J, 10ˣ, °C for K |
| `equilibrium.gibbsFromK` | −RT ln K | sign, log₁₀, kJ/J, °C for K |
| `equilibrium.reactionGibbs` | ΔrG° + RT ln Q from partial pressures | Q inverted, exponents dropped, J added to kJ, ΔrG° alone |
| `equilibrium.vantHoff` | K at another temperature | sign, kJ/J, 10ˣ, °C for K |
| `equilibrium.vantHoffEnthalpy` | ΔrH° from K at two temperatures | sign, log₁₀, kJ/J, °C for K |
| `equilibrium.dissociationDegree` | α = (1 + 4p/Kp°)^(−1/2) | p and K swapped, square root forgotten, 4 dropped, kPa as bar |
| `equilibrium.cellGibbs` | −νFE° | ν forgotten, sign, kJ/J, divided by ν |
| `equilibrium.cellEquilibrium` | K = exp(νFE°/RT) | 1/K, 10ˣ, ν forgotten, °C for K |
| `equilibrium.nernst` | E° − (RT/νF) ln Q | sign, log₁₀, E° alone, ν forgotten or multiplied |
| `equilibrium.cellPotential` | E°(R) − E°(L) for two metal electrodes | L − R, R + L, E°(R) alone, potentials multiplied by electrons |
| `equilibrium.combinedPotential` | ν_cE°(c) = ν_aE°(a) − ν_bE°(b), from tabulated couples | potentials subtracted or added without ν, sign, not divided by ν_c |

Equilibrium constants span powers of ten: their options carry `choiceOnly`,
so those three kinds are never offered typed (`typeable`). Constants and
tabulated data (vapour pressures, Henry's law constants, cryoscopic
constants, standard potentials) are the usual textbook values, written in
the generators.

Focuses 7–8 came as two more topics (6.13.0), grouped as *Quantum and
structure* (`quantum.ts`, `atoms.ts`). Five mistake types came with them:
`lengthUnits` (nm, pm or cm taken for m), `hbarForH` (a factor 2π),
`reducedMass` (the total mass, or one atom's, for μ), `nodesConfused`
(radial, angular and total nodes) and `averagesConfused` (⟨r⟩ and r*).

| Id | Asks for | Typical wrong options |
|---|---|---|
| `quantum.photonCount` | N = PΔtλ/hc | nm as m, ħ for h, inverted |
| `quantum.wienPeak` | λ_max = hc/4.965kT | factor 5 or 2.82, nm as m, ħ for h |
| `quantum.photoelectronSpeed` | v = √(2(hν − Φ)/m_e) for a tabulated metal | Φ added, factor 2, Φ forgotten |
| `quantum.deBroglie` | λ = h/√(2m eV) | √2 dropped, ħ for h, eV as J |
| `quantum.uncertaintySpeed` | Δv ≥ ħ/2mΔx for a proton or an electron | h for ħ, ½ dropped, pm as m |
| `quantum.boxTransition` | λ = 8mL²/((n₂² − n₁²)h)·c | n₂ − n₁ for squares, one level, nm as m |
| `quantum.vibrationWavenumber` | ṽ = (1/2πc)√(k/μ) for a diatomic | total mass for μ, 2π, u as kg, cm as m |
| `quantum.zeroPointEnergy` | E₀ = ½ħω | ½ dropped, ħ for h, total mass |
| `quantum.rotationalFrequency` | ν = 2B(J + 1) from μR² | J for J + 1, total mass, pm as m |
| `atoms.hydrogenLine` | λ of n₂ → n₁ for H, He⁺, Li²⁺ | one term, 1/n for 1/n², Z for Z², nm |
| `atoms.ionizationEnergy` | I = hcZ²R̃/n² in eV | 1/n, sign, Z for Z², from n = 1 |
| `atoms.orbitalNodes` | n − l − 1 radial nodes | angular or total nodes, n − l |
| `atoms.orbitalRadius` | r* = a₀/Z or ⟨r⟩ = 3a₀/2Z, 1s | the other average, Z², a₀Z |
| `atoms.spinOrbitSplitting` | Δṽ = Ã(l + ½) | Ãl, Ã(l + 1), ½ twice |

Focuses 17–18 came as two more topics (6.15.0), grouped as *Kinetics*
(`kinetics.ts`: `kinetics` and `dynamics`). Four mistake types came with
them: `orderConfused` (the integrated law or half-life of another order),
`halfLifeForTau` (t½ for τ = 1/k, a factor ln 2), `timeUnits` (seconds left
unconverted) and `distancePower` (the wrong power of a distance). Options
that a slip makes overflow or vanish (a temperature in °C near 0) are left
out. The explanations are written one equality per row, so that every
calculation and its correction fit a 360-pixel phone.

| Id | Asks for | Typical wrong options |
|---|---|---|
| `kinetics.firstOrderConcentration` | [A]₀e^(−kt) | 10ˣ for eˣ, second-order law, linear decay, t½ for τ |
| `kinetics.firstOrderHalfLife` | ln 2/k, in minutes | 1/k, log₁₀ 2, left in seconds |
| `kinetics.secondOrderConcentration` | [A]₀/(1 + kt[A]₀) | exponential, [A]₀ dropped, 2k, linear |
| `kinetics.secondOrderHalfLife` | 1/(k[A]₀) | ln 2/k, [A]₀/k, factor 2 |
| `kinetics.arrheniusRatio` | k₂/k₁ from Eₐ, θ in °C | °C for K, kJ/J, inverted, 10ˣ |
| `kinetics.activationEnergy` | Eₐ from two rate constants | °C for K, log₁₀, kJ/J, R dropped |
| `kinetics.relaxation` | k = K/{(1 + K)τ} | k′ for k, 1/τ, Kτ |
| `kinetics.michaelisMenten` | v_max[S]₀/(K_M + [S]₀) | K_M term dropped, inverted, v_max/2 |
| `kinetics.polymerization` | ⟨N⟩ = 1/(1 − p) | p/(1 − p), 1/p, square, square root |
| `kinetics.quantumYield` | moles reacted per mole of photons absorbed | fraction absorbed forgotten or doubled, inverted, nm as m |
| `kinetics.fretEfficiency` | R₀⁶/(R₀⁶ + R⁶) | R⁶ on top, first or third power |
| `kinetics.sternVolmer` | k_Q = (1/τ − 1/τ₀)/[Q] | 1/τ₀ dropped, τ₀ dropped, dm³/m³ |
| `dynamics.collisionFactor` | σ(8kT/πμ)^½ N_A | m³ for dm³, one mass for μ, g for kg, N_A dropped |
| `dynamics.diffusionLimit` | 8RT/3η | m³ for dm³, 3 dropped, °C for K, k for R |
| `dynamics.activationEnthalpy` | Eₐ − RT | Eₐ, + RT, − 2RT, °C for K |
| `dynamics.eyringRate` | (kT/h)e^(−Δ‡G/RT) | 10ˣ, ħ for h, °C for K, kJ/J |
| `dynamics.saltEffect` | log k = log k° + 2Az_Az_B√I | eˣ for 10ˣ, I for √I, sign, 2 dropped |
| `dynamics.isotopeEffect` | e^(−ζ), ζ from the C–H zero-point energy | masses for reduced masses, sign, 2ζ, 2π |
| `dynamics.marcusBarrier` | (ΔrG° + ΔE_R)²/4ΔE_R | sign, factor 2, ΔE_R/4, cross term dropped |

Focuses 11–12 came as two more topics (6.16.0), grouped as *Spectroscopy*
(`spectroscopy.ts`: `spectroscopy` and `resonance`). Six mistake types came
with them: `selectionRuleConfused` (ΔJ = ±1 and ±2), `linearityConfused`
(3N − 5 and 3N − 6), `ppmConfused` (ppm as per cent, or 10⁶ applied twice),
`equivalenceIgnored` ((2I + 1)ᴺ lines for equivalent nuclei),
`nuclearSpinIgnored` (N + 1 lines for spin-1 nuclei) and `fieldUnits` (mT
for T). Counts (a J_max, a number of modes or lines) are whole numbers.

| Id | Asks for | Typical wrong options |
|---|---|---|
| `spectroscopy.beerLambert` | T = 10^(−ε[J]L), in per cent | eˣ for 10ˣ, 1 − T, mmol or cm slips |
| `spectroscopy.rotationalLine` | ν = 2cB̃(J + 1), in GHz | cm for m, J for J + 1, Raman ΔJ = 2 |
| `spectroscopy.bondLength` | R from B̃ = ħ/4πcμR² | total mass, h for ħ, square root forgotten |
| `spectroscopy.ramanShift` | 4B̃(J + 3/2), Stokes | ΔJ = 1, 3/2 dropped, factor 2 |
| `spectroscopy.mostPopulatedJ` | (kT/2hcB̃)^½ − ½, rounded | factor 2, square root forgotten |
| `spectroscopy.anharmonicLine` | ν̃ − 2xₑν̃ or 2ν̃ − 6xₑν̃ | harmonic value, factor, sign |
| `spectroscopy.dissociationEnergy` | D̃₀ = ν̃/4xₑ − G(0) | D̃ₑ, sign of G(0), factor 2, inverted |
| `spectroscopy.normalModes` | 3N − 5 or 3N − 6 | the other one, 3N, the translations only |
| `spectroscopy.dopplerWidth` | (2ν/c)(2kT ln 2/m)^½ | g for kg, °C for K, ln 2 dropped, factor 2 |
| `spectroscopy.lifetimeWidth` | 1/2πcτ | h for ħ, cm for m, inverted, ps left |
| `resonance.larmorFrequency` | γ𝓑₀/2π, in MHz | ω for ν, factor, inverted |
| `resonance.shiftInHertz` | Δδ × ν₀ | ppm slips, inverted, sum for difference |
| `resonance.multiplet` | 2NI + 1 lines (NMR or EPR) | (2I + 1)ᴺ, spin ½ for spin 1, N |
| `resonance.populationExcess` | γħ𝓑₀/2kT, in ppm | h for ħ, factor 2, °C for K |
| `resonance.gValue` | hν/μ_B𝓑 | mT for T, ħ for h, inverted |
| `resonance.spinDensity` | ρ = a/Q (McConnell) | inverted, factor, mT slips |
| `resonance.coalescence` | τ = 2^½/πδν | 2^½ or π dropped, ms for s |
| `resonance.t2Linewidth` | 1/πT₂ | π dropped, factor 2, ms for s, inverted |
| `resonance.inversionRecovery` | T₁ = τ/ln 2 | τ itself, ×ln 2, log₁₀, factor 2 |

## Linux

The Linux quiz has its own level, `linux`, and ten topics in three groups.
*La ligne de commande*: `linuxFiles`, `linuxText`, `linuxShell`,
`linuxProcesses`, `linuxSystem`, `linuxNetwork`. *Scripts, git et vim*
(6.14.0): `linuxScripting`, `linuxGit`, `linuxVim`. *Outils à installer*:
`linuxTools`.

Most questions are written, not generated: 254 questions in
`shared/quiz/linux/*.ts`, each in French, Spanish and English
(`L3 = [en, fr, es]`), with one right
answer, at least three wrong ones and an explanation. A kind is a short list
of them; the generator draws one with the seed's `rng` and shuffles the
options. Text in backticks is code: `richParts` splits a string into text,
`$math$` and `` `code` `` runs, code first, so `$HOME` stays code.
`check:quiz` checks that every language of a question has the same number
of code runs.

A question about a command missing from a default install carries
`install: { apt, dnf?, brew? }`. It shows a *📦 apt-name* badge, and its
explanation ends with the install commands for Debian and Ubuntu, Fedora and
macOS. 55 questions have one: `plocate`, `unzip`, `at`, `netcat-openbsd`,
`dnsutils` among the commands, every question of `linuxTools`, and every
question of `linuxGit` (git is missing from minimal Debian and Fedora). Vim
has none: the small `vi` (vim-tiny) is always there.

| Topic | Kinds (questions) |
|---|---|
| `linuxFiles` | `navigation` 7, `links` 5, `find` 6, `permissions` 7, `archives` 6, `chmodToSymbolic`, `chmodToOctal`, `umask` |
| `linuxText` | `grep` 6, `sed` 11, `awk` 11, `columns` 6, `pipelines` 5, `sedSubstitute`, `awkFields` |
| `linuxShell` | `redirection` 5, `expansion` 6, `control` 7, `environment` 5 |
| `linuxProcesses` | `listing` 6, `signals` 4, `jobs` 3, `services` 5, `scheduling` 4, `cron` |
| `linuxSystem` | `storage` 5, `users` 5, `packages` 5, `info` 5 |
| `linuxNetwork` | `interfaces` 5, `transfer` 5, `ssh` 5, `dns` 3 |
| `linuxTools` | `search` 5, `viewers` 4, `json` 3, `monitoring` 4, `workflow` 7, `diagnostics` 4 |
| `linuxScripting` | `tests` 6, `loops` 6, `functions` 5, `arguments` 5, `arrays` 5, `paramExpansion` |
| `linuxGit` | `commits` 6, `branches` 6, `undo` 5, `remotes` 6 |
| `linuxVim` | `modes` 6, `motions` 6, `editing` 6, `search` 6 |

Seven kinds are generated:

| Id | Asks for | Typical wrong options | Typed |
|---|---|---|---|
| `linuxFiles.chmodToSymbolic` | `chmod 754` as `rwxr-xr--` | user and other swapped, group and other swapped, bits read in reverse | |
| `linuxFiles.chmodToOctal` | `rwxr-x---` as 750 | the same three slips | ✓ |
| `linuxFiles.umask` | the modes of a new file and a new directory under a umask | mask added instead of removed, execute kept on files | |
| `linuxProcesses.cron` | when a crontab line runs | minute and hour swapped, `*/15` read as "at 15", day of month taken for day of week | |
| `linuxText.sedSubstitute` | what `echo '…' \| sed 's/…/…/…'` prints: no flag, `g`, `2`, `&`, a greedy `.*`, `-E` groups | the `g` or number flag misread, `&` or `\1` taken literally, `.*` stopped early, only the match kept | |
| `linuxText.awkFields` | what `echo '…' \| awk '…'` prints: `$n`, `-F:` on a passwd line, `NF`, `$NF`, `$1 $3`, `$1, $3` | fields counted from 0 or the neighbour, `NF` for `$NF`, the separator ignored, joined for comma-separated | |
| `linuxScripting.paramExpansion` | what `${f%.*}`, `${f%%.*}`, `${f#*.}` or `${f##*.}` gives for a file name | shortest for longest, front for back | |

`check:quiz` reads the modes itself (`modeOf`) rather than trusting the
generator, and checks that the right option is the only right one. For the
three output kinds (`linux-output.ts`, verify kind `shell`), the option's
identity is the text printed, and `check:quiz` runs the command shown with
the real `bash` (and its `sed` and `awk`) and compares. It also checks every
written Linux question directly, drawn or not: unique ids, three wrong
answers or more, all different, the same code runs in the three languages,
and a `since` the app has reached.

**Adding a written question.** Append it to its list with `since: N`, where
N is the new `QUIZ_VERSION`, and bump the version: a list's length is part of
what a seed draws, so a seed from an older test must still see the old list.
`written(list)` keeps the questions whose `since` is at most the test's
version. Rewording a question, or fixing a translation, needs no bump. The
level came after version 2, with no saved test, so the first 167 questions
have no `since`.

## Balancing equations

The test *⚗️ Équations chimiques*, in the home page's *Chimie et biologie*
group, has its own level, `chembio`, and one topic, `balancing`, in the group
*Réactions chimiques* (`reactions`). Phase 4 of the roadmap: the
generator-and-grader pattern applied to chemistry.

**Reactions** come from five families, drawn with the seed's `rng`:

| Kind | Reactions | Example |
|---|---|---|
| `balancing.combustion` | Alkanes C1–C8, alkenes C2–C6, alcohols C1–C5, glucose, sucrose, acetylene, benzene, acetic acid, in O₂ | C₃H₈ + 5 O₂ → 3 CO₂ + 4 H₂O |
| `balancing.synthesis` | A metal with O₂ or Cl₂ (the formula built from the ions' charges), and eight non-metal syntheses | 4 Al + 3 O₂ → 2 Al₂O₃ |
| `balancing.neutralization` | Four acids by six hydroxides, the salt built from the charges | 2 H₃PO₄ + 3 Ca(OH)₂ → Ca₃(PO₄)₂ + 6 H₂O |
| `balancing.displacement` | A metal in an acid (hydrogen given off), or a metal taking another's place in its salt | 2 Al + 3 CuSO₄ → Al₂(SO₄)₃ + 3 Cu |
| `balancing.decomposition` | Ten decompositions and reductions | 2 KClO₃ → 2 KCl + 3 O₂ |
| `balancing.coefficient` | Any family; one coefficient asked, shown as “?” | ? = 3 in Fe₂O₃ + C … |

Reactions balanced with all coefficients 1, or with one above 30, are drawn
again.

**Balancing** is exact: one equation per element (atoms on the left minus
atoms on the right), one unknown per substance, reduced with exact fractions;
a reaction must have exactly one free unknown, and the solution is scaled to
the smallest whole numbers. Formulas are parsed with parentheses
(`Ca(OH)2`, `Pb(NO3)2`).

**The question** shows the unbalanced equation (broken after the arrow when
it would not fit a phone) and asks which one is balanced with the smallest
whole numbers; the options are whole equations. The explanation gives the
balanced equation and the atom count of each element on each side.

**Wrong options** are the mistakes learners make:

| Mistake | What it looks like |
|---|---|
| `subscriptChanged` | A coefficient folded into the formula: 2 H₂O written H₄O₂. The atoms balance, but it is another substance. One option per coefficient above 1. |
| `notLowestTerms` | Every coefficient doubled: balanced, not in the smallest numbers. |
| `elementUnbalanced` | One coefficient one too many or too few. |
| `diatomicForgotten` | O₂, H₂, N₂ or Cl₂ written as a single atom, then balanced. |

`balancing.coefficient` asks for one coefficient above 1, as a number, so
it can be typed; its wrong options are the doubled value, ±1, +2, and with a
diatomic element the single-atom value.

**Verification.** `check:quiz` reads every option back from its TeX, the
way the player sees it, with its own formula parser (a stack of counts per
parenthesis), and checks that it has the question's substances, every
element balanced, coefficients without a common factor, and that the
element-by-substance matrix has rank one less than the number of substances
(only one way to balance). A coefficient question's coefficients pass the
same checks before the option is compared with them.

## Anatomy of a generator

A generator is a function `(rng, version?) => Draft`:

```ts
const polynomial: Generator = (rng) => {
  const n = rng.int(2, 5);
  const m = rng.int(1, n - 1);
  const a = rng.nonZero(-6, 6);
  const b = rng.nonZero(-9, 9);
  const c = rng.nonZero(-9, 9);
  const f = poly([[a, n], [b, m], [c, 0]]);
  return {
    prompt: { key: "derivative", tex: `f(x) = ${f.tex}` },
    correct: fromPoly(poly([[n * a, n - 1], [m * b, m - 1]])),
    wrong: [
      tag(fromPoly(poly([[n * a, n], [m * b, m]])), "exponentKept"),
      tag(fromPoly(poly([[a, n - 1], [b, m - 1]])), "coefficientMissing"),
      tag(fromPoly(poly([[n * a, n - 1], [m * b, m - 1], [c, 0]])), "constantKept"),
      tag(fromPoly(poly([[n * a, n - 1], [-m * b, m - 1]])), "signError"),
      tag(fromPoly(poly([[n * a, n - 1]])), "termDropped"),
    ],
    explanation: { key: "powerRule", tex: "(x^{n})' = n\\,x^{n-1}" },
    verify: { kind: "derivative", f: f.fn },
  };
};
```

| Field | Content |
|---|---|
| `prompt` | A sentence key (translated by the app) and the LaTeX of the question (may be empty when a graph says it all); optionally a `graph`, and then an `id` that tells two questions apart as the LaTeX does otherwise |
| `correct` | The right answer: its LaTeX, plus what it stands for, as `fn` (a function), `num` (a number, possibly ±∞) or `set` (a sorted set of numbers); optionally a `graph` to show instead of the LaTeX |
| `wrong` | Candidate wrong answers, each labelled with the mistake it stands for (`tag(option, mistake)`). Give more than three, because duplicates are removed. |
| `explanation` | A sentence key and a formula shown in the corrections |
| `verify` | What the right answer must satisfy; used to remove duplicates and by the check script |

`verify` kinds:

| Kind | Options are | The right one satisfies |
|---|---|---|
| `derivative` | functions | equals f′ (numerical derivative) |
| `primitive` | functions | its derivative equals f; options equal up to a constant count as the same |
| `identity` | functions | equals f |
| `integral` | numbers | equals ∫ₐᵇ f (Simpson's rule) |
| `limit` | numbers or ±∞ | close to f(probe), or f(probe) beyond ±10⁵ for ±∞ |
| `value` | numbers | equals a value computed independently |
| `root` | numbers | f(x) = 0 |
| `solutions` | sets | exactly the roots of f on [lo, hi) |
| `complex` | complex numbers | equals re + i·im |
| `complexRoots` | sets of complex numbers | exactly the roots of the polynomial (Horner) |
| `complexRoot` | complex numbers | zⁿ = re + i·im |
| `ode` | functions | the equation's residual vanishes (central differences) and the initial values hold |
| `determinant`, `rank` | numbers | equals det a or rank a (Gaussian elimination) |
| `matrixProduct`, `matrixInverse`, `linearSolution` | matrices or vectors | equals ab; a times it is I; a times it is b |
| `eigenvalues` | sets | the roots of det(a − λI) |
| `tangent`, `asymptote` | lines | f(a) + f′(a)(x − a); f − ℓ → 0 at ±∞ |
| `crossProduct` | vectors | equals u × v |
| `plane` | a, b, c, d | (a, b, c) parallel to the normal, and the point on the plane |
| `series` | numbers | the partial sums S(N), S(2N), extrapolated as 2S(2N) − S(N) |
| `radius` | numbers | (1/\|aₙ\|^(1/n))^(1/power) at n = 10⁷ |
| `partial`, `gradient` | numbers, vectors | central differences in x and y |
| `critical` | points | both central differences vanish |
| `doubleIntegral` | numbers | nested Simpson's rule |
| `slope` | numbers | f′(a) by central difference |
| `count` | numbers | sign changes of f − k on a 20,000-step grid |

A `graph` is either `{ type: "curves", x, y, curves, points }` (curves are
`main` or dashed `guide` lines, such as a tangent or a level y = k) or
`{ type: "plane", intercepts, extent }`.

## Typed answers

In a test set to *Au clavier*, a question whose four options are all numbers
below a million is answered by typing the number. Other questions keep their
four options.

- **Accepted:** an exact value (`7/45`, `2π/3`, `2pi/3`, `√2`, `sqrt(2)/2`, `e^2 − 1`, `ln 3`, implicit products like `3√2`), or a decimal rounding with a point or a comma.
- **Tolerance of a rounding:** half a unit of its last digit (`1.05` stands for anything in [1.045, 1.055]), and never more than 0.6 % of the value (at least 0.1 × 0.6 %). So `1,05` is π/3 but `1` is not, and `0.1` is not 12/121 = 0.0992.
- **Exact values** are compared to 10⁻⁹.
- **Which questions:** `typeable(q)` refuses a question where a wrong option is close enough to the answer that one rounding could stand for both, and one whose options are marked `choiceOnly` (equilibrium constants, spread over powers of ten).
- **Mistakes still count:** a typed value is matched against the right option first, then the wrong ones. Typing a wrong option's value records its mistake, as if it had been picked. A value matching nothing is wrong without a mistake (`given = −2`).

The browser shows what it reads as the player types (≈ 2,0944), but grading
is the server's: it regenerates the test and reads the text with the same
code.

## Mistake types

Every wrong option carries a mistake type from `MISTAKES` in `types.ts`. When
a player picks it, the type is stored with the answer (`quiz_answers.mistake`).
It is then named in the corrections and counted on the progress page.

Labels do not take part in generation, so adding or correcting one never
changes what a seed produces and needs no version bump. Answers already saved
keep the label they were stored with.

| Type | Meaning | Topics |
|---|---|---|
| `exponentKept` | Exponent not lowered | derivatives |
| `coefficientMissing` | Exponent not brought down as a factor | derivatives, multivariable |
| `constantKept` | Derivative of a constant not zero | derivatives, multivariable |
| `termDropped` | Term left out | complex, derivatives, functions, geometry, linear, multivariable, odes, probability, sequences, series |
| `chainRuleForgotten` | Inner derivative forgotten | derivatives, explog |
| `wrongInnerFactor` | Wrong factor from the inner function | derivatives, explog, limits |
| `productRule` | Product rule misapplied | derivatives |
| `quotientRule` | Quotient rule misapplied | derivatives |
| `logDerivative` | Derivative of ln misapplied | derivatives |
| `powerRuleOnExponential` | Power rule applied to an exponential | derivatives, explog, integrals |
| `derivedInstead` | Derivative instead of an antiderivative | graphs, integrals |
| `wrongPowerDivisor` | Wrong divisor: n + 1 expected | integrals, multivariable |
| `constantNotIntegrated` | Constant term not integrated | integrals |
| `multipliedInsteadOfDivided` | Multiplied by a instead of dividing | integrals |
| `wrongFactor` | Constant factor missing or extra | complex, functions, geometry, graphs, integrals, linear, multivariable, odes, probability, sequences, series |
| `logPrimitiveError` | Antiderivative of 1/x not known | integrals |
| `byParts` | Integration by parts unfinished | integrals |
| `substitutionError` | Change of variable misapplied | explog, integrals |
| `boundsError` | F(b) − F(a) miscalculated | integrals, multivariable |
| `sinCosSwapped` | sin and cos swapped | complex, derivatives, geometry, integrals, odes, trigonometry |
| `exactValueError` | Wrong exact value | geometry, trigonometry |
| `missingSolution` | Solution missed | explog, graphs, trigonometry |
| `wrongSymmetry` | Wrong symmetry (π − x, 2π − x, π + x) | trigonometry |
| `outOfRange` | Value outside the interval | trigonometry |
| `trigFormula` | Trigonometric identity misremembered | trigonometry |
| `periodError` | Period miscalculated | trigonometry |
| `dominantTerms` | Dominant terms misidentified | functions, limits, series |
| `growthReversed` | Growth rates compared the wrong way | limits |
| `indeterminateGuess` | Indeterminate form taken for a value | limits, sequences |
| `invertedRatio` | Ratio inverted | explog, geometry, graphs, limits, odes, probability, sequences, series |
| `taylorError` | Wrong Taylor coefficient | limits |
| `factorisationError` | Wrong factorisation | limits |
| `logRules` | Log rule misapplied | explog |
| `expLogInverse` | exp and ln combined wrongly | explog, limits |
| `solvingError` | Equation solved in the wrong order | explog, graphs |
| `binomialCoefficient` | Binomial coefficient forgotten | probability |
| `complementForgotten` | (1 − p) or P(Ā) left out | probability |
| `powersSwapped` | Exponents swapped: pⁿ⁻ᵏ(1 − p)ᵏ | probability |
| `meanVarianceConfused` | Mean and variance confused | probability |
| `complementTaken` | 1 − P, or (1 − p), taken instead | probability |
| `branchForgotten` | One branch of the tree left out | probability |
| `notWeighted` | Conditional probabilities added without their weights | probability |
| `conditionalReversed` | P(B \| A) given for P(A \| B) | probability |
| `jointForConditional` | P(A ∩ B) or P(B) given for P(A \| B) | probability |
| `baseRateIgnored` | P(A) left out of Bayes' formula | probability |
| `orderCounted` | Arrangements counted instead of combinations | probability |
| `withReplacement` | nᵏ: counted as drawing with replacement | probability |
| `countingError` | Counting error | graphs, probability |
| `unweightedMean` | Plain mean of the values | probability |
| `unionNotSubtracted` | P(A ∩ B) not subtracted | probability |
| `sdVarianceConfused` | σ and σ² confused | probability |
| `factorialForgotten` | k! left out | probability |
| `rateMeanConfused` | λ and 1/λ confused | probability |
| `densityForProbability` | The density's value taken for a probability | probability |
| `offByOne` | An index or a number of terms off by one | sequences, series |
| `arithmeticGeometricConfused` | The other kind of sequence's formula | sequences, series |
| `firstTermKept` | The first term left out, or given as the answer | sequences |
| `convergenceMisjudged` | Limit of qⁿ decided the wrong way | sequences |
| `fixedPointForgotten` | The limit not subtracted: uₙ − ℓ not formed | sequences |
| `iSquared` | i² taken as +1 | complex |
| `componentwise` | Computed part by part | complex, geometry, linear |
| `conjugateForgotten` | A quotient not multiplied by the conjugate | complex |
| `sqrtForgotten` | Square root forgotten | complex, geometry, series |
| `argumentQuadrant` | Argument in the wrong quadrant | complex |
| `argumentSign` | Argument of the conjugate | complex |
| `discriminantSign` | Negative discriminant treated as positive | complex |
| `powerMisapplied` | Modulus or argument not raised (or not rooted) | complex, series |
| `rootSpacing` | n-th roots not spaced by 2π/n | complex |
| `initialConditionMisapplied` | Constant set to y(0) without the rest, or constants swapped | graphs, odes |
| `characteristicRoots` | Wrong roots of the characteristic equation | odes |
| `doubleRootFactor` | The x of a double root forgotten | odes |
| `separationError` | Variables not separated: ax not integrated | odes |
| `determinantPattern` | The wrong products taken | linear |
| `cofactorSign` | Cofactor signs forgotten | geometry, linear |
| `scalarPower` | det(kA) = k·det A | linear |
| `orderSwapped` | BA for AB, or x and y swapped | geometry, graphs, linear, multivariable |
| `rowByRow` | Rows multiplied by rows | linear |
| `adjugateError` | Diagonal not swapped, or the wrong entries negated | linear |
| `diagonalTaken` | The diagonal taken for the eigenvalues | linear |
| `traceDeterminantConfused` | Trace and determinant taken for the eigenvalues | linear |
| `rankMiscounted` | Rank miscounted | linear |
| `tangentPointForgotten` | y = f′(a)x + f(a) | functions |
| `tangentRolesSwapped` | f(a) and f′(a) swapped | functions, graphs |
| `valueAbscissaConfused` | Abscissa and value confused | functions |
| `vietaConfused` | Sum and product taken for the roots | functions |
| `derivativeOrder` | f′ used where f″ is needed | functions, graphs |
| `maxMinConfused` | The minimum given for the maximum | functions |
| `asymptoteDivision` | The division not done | functions |
| `componentsMismatched` | Coordinates paired wrongly | geometry |
| `supplementaryAngle` | π − θ for θ | geometry |
| `normalPointSwapped` | Point and normal swapped | geometry |
| `normForgotten` | Distance not divided by the normal's length | geometry |
| `denominatorForgotten` | A quotient's denominator left out | geometry |
| `telescopingTerms` | Only one partial fraction summed, or 1/k left out | series |
| `variableConfused` | Differentiated in the other variable | multivariable |
| `givenCurveChosen` | The curve already given (f for f′, f′ for f) | graphs |
| `primitiveForDerivative` | A primitive taken for the derivative | graphs |
| `shiftDirection` | f(x − c) moved left, or f(x + c) right | graphs |
| `axisConfused` | Transformation along the other axis | graphs |
| `interceptForSlope` | The intercept read as the slope | graphs |
| `coefficientsAsIntercepts` | The equation's coefficients taken for the intercepts | graphs |
| `subscriptChanged` | A subscript changed instead of a coefficient | balancing |
| `notLowestTerms` | Balanced, not in the smallest whole numbers | balancing |
| `elementUnbalanced` | An element left unbalanced | balancing |
| `diatomicForgotten` | O₂, H₂, N₂ or Cl₂ written as one atom | balancing |
| `signError` | Sign error | complex, derivatives, explog, functions, geometry, graphs, integrals, limits, linear, multivariable, odes, probability, sequences, series, trigonometry |

Names shown to players are in `MISTAKE_NAMES` (`src/quiz-i18n.ts`), in the
three languages.

## How a test is assembled

`generateQuiz({ seed, level, topics, count, focus, version })`:

1. **Topic order:** the topics are shuffled with the seeded generator, then taken in turn.
2. **Review questions first:** with `focus`, `reviewCount(count, focus)` questions are drawn from those kinds, in shuffled order. That is round(40% of count), at least 1, at most 2 per kind.
3. **Other questions:** each remaining question picks a random kind from its topic and level.
4. **Finalising each draft:**
   - Wrong options identical to the right one or to each other are removed. Functions are compared at five sample points; primitives up to a constant.
   - Three wrong options are kept.
   - The four options are shuffled.
   - If fewer than three distinct wrong options remain, or the prompt already appeared in the test, another draft is made (up to 50 tries).
5. **Final shuffle:** the question order is shuffled.

`gradeQuiz(questions, answers)` counts the matching option indexes; `-1` is a
blank.

## Adding a kind of question

1. **Write the generator** in the topic's file:
   - Use only `rng` for randomness (never `Math.random`), and `tex.ts` for formatting.
   - Keep parameters in ranges where every option is defined at the sample points 0.37 to 2.6 (watch logarithms and divisions).
2. **Label the wrong options** with `tag(option, mistake)`, reusing a type from `MISTAKES` when one fits. A new type goes in `MISTAKES` and in `MISTAKE_NAMES` in the three languages.
3. **Register it** at the end of the `school` and/or `university` object at the bottom of the file.
4. **Bump the version:**
   - Increment `QUIZ_VERSION` in `index.ts` and note the change in the comment above it.
   - Declare the kind in `AVAILABILITY` with `from: <new version>`, so tests of older versions keep drawing from their original list.
5. **Name it:** add the name in the three languages in `SKILL_NAMES` (`src/quiz-i18n.ts`). If you introduce a new prompt or explanation key, add it to `PromptKey` / `ExplanationKey` in `types.ts` and to the three dictionaries.
6. **Run the checks:** `npm run check:quiz`, `npm run build` and `npm run test:e2e`.

## Adding a topic

A new topic needs **no version bump**. A saved test draws only from the topics
it was made with, so a topic that did not exist cannot change it.

1. **Write its file** in `shared/quiz/`, with its `school` and `university` objects. A topic may exist at one level only: leave the other object empty.
2. **Register it:**
   - add it to `Topic` and at the end of `TOPICS` in `types.ts`, and to one group of `TOPIC_GROUPS`;
   - add it to `GENERATORS` in `index.ts`.
3. **Name it:**
   - its name in `TOPIC_NAMES`;
   - the kinds' names in `SKILL_NAMES`;
   - any new prompt, explanation or mistake key in the three dictionaries.

   The type checker refuses a table that misses a language or a key.
4. **Run the checks** as for a kind of question. `check:quiz` uses every topic of each level (`topicsFor`).

A new kind of answer needs a field on `Option` and a `Verify` kind, with three things:
- its comparison in `same()` (`index.ts`), only for the new kind;
- its independent check in `isRight()` (`server/check-quiz.ts`).

Complex numbers (`z`, `zs`), differential equations (`ode`), matrices, planes, series and functions of two variables were added this way.

The settings of a test show only the topics of the chosen level, by group.
`generateQuiz` leaves out a topic without questions at the level, and the
server refuses a test whose topics have none.

## Versioning

A saved test is only a seed, so a seed must produce exactly the same questions
forever within its version. Old tests are rebuilt at startup for progress
tracking, and their marks are tied to the questions they had.

Each test stores its version (`quiz_results.version`), and
`generateQuiz({ …, version })` reproduces the behaviour of that version:

| Change | What to do |
|---|---|
| **New kind of question** | Bump `QUIZ_VERSION`; add the kind with `AVAILABILITY[id] = { from: N }` (N = new version). |
| **Changed kind** (ranges, wrong options, wording of the LaTeX, draw order inside the generator) | Do not edit it in place. Copy it under a new id, retire the old one with `until: N`, add the new one with `from: N`, and bump `QUIZ_VERSION`. The old code stays, unused by new tests. |
| **Change in test assembly** (`generateQuiz`, `finalize`, option comparison) | Bump `QUIZ_VERSION` and keep the old behaviour behind a `version` condition, as `close()` does for version 1. |
| **Text only** (an explanation or a translation, a name in `SKILL_NAMES`, a mistake label) | No bump: seeds produce the same questions. |

The server refuses a test submitted with a version other than its own (a
browser still running an old build); reloading the page fixes it.

A quick way to confirm that a change leaves older versions untouched is to
hash the tests produced by a few hundred seeds at each old version before and
after the change. The hashes must match.

| Version | Change |
|---|---|
| 1 | First release |
| 2 | ±∞ compared correctly when removing duplicate options. In version 1 every number counted as equal to ±∞, so questions with an infinite answer were always discarded, and `limits.growth` never appeared. |
| 3 | No option that is not a number. `gases.rmsSpeed` offered √(3R(T − 273.15)/M) as the °C-for-K slip, which below 0 °C has no square root and showed as −∞. From version 3 that option is left out when T ≤ 273.15 K; earlier versions keep it, so their tests are unchanged. `check:quiz` now fails on any NaN option. |
| 4 | Linux: six more `sed` and seven more `awk` questions (`since: 4`), and the kinds `linuxText.sedSubstitute` and `linuxText.awkFields` (`from: 4`). The new topics `linuxScripting`, `linuxGit` and `linuxVim` need no version: no older test names them. |

## Verification

```sh
npm run check:quiz          # 400 seeds per level: 16,000 questions, about a minute
npm run check:quiz -- 1500  # 60,000 questions
npm run check:quiz -- --bank data/atkins-12-concepts.json  # with a real question bank
```

For each seed and level, the script generates a 20-question test on all
topics. Every other test also brings back three kinds, as for a player with
mistakes to review. It then checks:

- **Correct answer:** the marked answer is right, computed **without the generator's arithmetic**: central-difference derivative, Simpson integral, function evaluated near the limit point, root finding by sign changes on a 200,000-point grid followed by bisection.
- **Wrong options:** none of them is also right.
- **Options:** exactly four, with distinct LaTeX; every wrong option carries a known mistake type, and every type in `MISTAKES` occurs somewhere.
- **Rendering:** the question, the options and the explanation all render in KaTeX with `throwOnError`.
- **Chemical equations:** every option read back from its TeX, its atoms counted element by element, its coefficients in lowest terms, and the balance unique (see [Balancing equations](#balancing-equations)).
- **Graphs:** every drawn curve is at least 30 % inside its window (25 % for an option); option curves differ by half a grid square somewhere; all options of a question share their window or axes; plane intercepts are non-zero and distinct.
- **Typed answers:** for every question that can be typed, each option's value written to 4 and 10 decimals (and with a comma) is read as that option, and a blank as a blank.
- **Determinism:** the same seed gives the same test twice.
- **Review questions:** their number and kinds match the focus.

It exits with status 1 and lists the first failures if anything is wrong. Run
it after any change to `shared/quiz/`.

The verification tests mathematical correctness, not pedagogy: whether a
wrong option is a *plausible* mistake is a matter of review.
