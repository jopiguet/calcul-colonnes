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
| `quantum.ts`, `atoms.ts`, `spectroscopy.ts`, `statistical.ts`, `kinetics.ts` | Physical chemistry, Focuses 7–8, 11–13 and 17–18: quantum theory, atoms, spectroscopy and magnetic resonance, statistical thermodynamics, kinetics and reaction dynamics |
| `sql.ts`, `sql/*.ts`, `sql-output.ts` | SQL: the written questions (the language, PostgreSQL, SQLite, MySQL, good practice), and what a query returns on two generated tables |
| `rust.ts`, `rust/*.ts`, `rust-output.ts` | Rust: the written questions of the four levels, and what a short program prints |
| `typescript.ts`, `ts/*.ts`, `ts-output.ts` | TypeScript: the written questions of the four levels, and what a short program logs |
| `econ.ts`, `econ-output.ts`, `econ-model.ts` | Public economics: the kinds by topic and level, the generated questions drawn as charts, and their models |
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
*Statistical thermodynamics*: `statistical` (Focus 13), and *Kinetics*: `kinetics` and `dynamics` (Focuses 17–18).
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

Focus 13 came as one more topic (6.17.0), its own group *Statistical
thermodynamics* (`statistical.ts`: `statistical`). Five mistake types came
with it: `degeneracyIgnored` (levels counted as states), `symmetryIgnored`
(σ left out), `rotationsMiscounted` (a wrong symmetry number),
`zeroPointConfused` (the zero-point energy counted where it is the zero) and
`classicalLimit` (kT, T/θ or R used where the levels are quantized). The
temperatures are drawn so that βhcν̃ stays between 0.1 and 4: the populations,
partition functions and heat capacities are then neither 1.00 nor vanishing,
and the slips stay apart. Partition functions of 10²⁵ are multiple choice only.

| Id | Asks for | Typical wrong options |
|---|---|---|
| `statistical.boltzmannRatio` | (g₁/g₀)e^(−hcΔν̃/kT) | g dropped, °C for K, inverted, 10ˣ |
| `statistical.populationTemperature` | T = hcΔν̃/k ln(N₀/N₁) | log₁₀, °C, 2π, inverted |
| `statistical.thermalWavelength` | Λ = h/(2πmkT)^½, in pm | g for kg, °C for K, ħ for h, 2π dropped |
| `statistical.translationalPartition` | q = V/Λ³ | cm³ or dm³ as m³, g for kg, ħ for h |
| `statistical.rotationalPartition` | kT/σhcB̃ | σ dropped, °C for K, m⁻¹ for cm⁻¹, inverted |
| `statistical.symmetryNumber` | σ of 12 molecules, H₂O to SF₆ | 1, the principal axis only, reflections counted |
| `statistical.vibrationalPartition` | 1/(1 − e^(−x)) | T/θᵛ, sign, zero point, 10ˣ |
| `statistical.electronicPartition` | g₀ + g₁e^(−x) | g dropped, g₀ alone, 10ˣ, 2π |
| `statistical.meanVibrationalEnergy` | ν̃/(eˣ − 1), in cm⁻¹ | kT/hc, + ½ν̃, eˣ + 1, ν̃e^(−x) |
| `statistical.twoLevelEnergy` | ε/(eˣ + 1) | eˣ − 1, εe^(−x), ε/2, ε − ⟨ε⟩ |
| `statistical.vibrationalHeatCapacity` | R x²eˣ/(eˣ − 1)² | R, eˣ dropped, x for x² |
| `statistical.sackurTetrode` | R ln(kTe^(5/2)/pΛ³) | g for kg, e^(3/2), bar as Pa, log₁₀ |
| `statistical.residualEntropy` | R ln W (CO, N₂O, CH₃D, FClO₃, CH₂D₂, ice) | log₁₀, RW, k for R |

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
answers or more, all different, the same number of code runs in the three languages,
and a `since` the app has reached. The written SQL, Rust and TypeScript questions get the same checks.

**Adding a written question.** Append it to its list with `since: N`, where
N is the new `QUIZ_VERSION`, and bump the version: a list's length is part of
what a seed draws, so a seed from an older test must still see the old list.
`written(list)` keeps the questions whose `since` is at most the test's
version. Rewording a question, or fixing a translation, needs no bump. The
level came after version 2, with no saved test, so the first 167 questions
have no `since`.

## Rust

The Rust test (6.21.0), *🦀 Rust* in the home page's *Informatique* group,
has four levels, `rustBeginner`, `rustIntermediate`, `rustAdvanced` and
`rustExpert` (*Débutant* to *Expert*, chosen like the maths levels), and
eight topics in two groups. *Le langage*: `rustBasics`, `rustOwnership`,
`rustTypes`, `rustErrors`, `rustCollections`. *Concurrence, Cargo, unsafe*:
`rustConcurrency`, `rustCargo`, `rustUnsafe`. A topic has its own kinds at
each level where it makes sense, so each level offers only some topics
(`topicsFor`):

| Topic | Débutant | Intermédiaire | Avancé | Expert |
|---|---|---|---|---|
| `rustBasics` | `variables` 5, `types` 5, `control` 5, `integerOps`, `shadowing` | `strings` 5, `numbers` 5, `stringLength` | | |
| `rustOwnership` | `moves` 5 | `borrowing` 5 | `lifetimes` 5, `smartPointers` 5 | `interior` 5, `dropOrder` |
| `rustTypes` | `structsEnums` 5 | `traits` 5, `matchArms` | `traitObjects` 5, `optionCombinators` | `advancedTraits` 5 |
| `rustErrors` | `panics` 5 | `propagation` 5 | `errorDesign` 5 | |
| `rustCollections` | `vectors` 5 | `iterators` 5, `hashmaps` 5, `iteratorChain` | `closures` 5, `sortDedup` | |
| `rustConcurrency` | | `threads` 5 | `sharing` 5 | `async` 6 |
| `rustCargo` | `cargoBasics` 5 | `modules` 5, `testing` 5 | `features` 5 | `buildTooling` 5 |
| `rustUnsafe` | | | `macros` 5 | `unsafeRust` 5, `ffi` 5 |

161 written questions in `shared/quiz/rust/beginner.ts`, `intermediate.ts`,
`advanced.ts` and `expert.ts`, ids `rs-…`, in the Linux format. Facts that
changed with a release name it (scoped threads 1.63, GATs 1.65, `async fn`
in traits 1.75, aborting on a panic out of `extern "C"` 1.81); the 2024
edition's rules are the ones described (`unsafe extern`,
`#[unsafe(no_mangle)]`, `static_mut_refs`).

Eight kinds are generated (`rust-output.ts`): a short program, *Qu'affiche
ce programme ?*, shown as a block of code (`prompt.code`, drawn in a
`pre.quiz-code` under the sentence and in the corrections). Each wrong
output is what a misconception predicts, computed by modelling it: the drop
order is simulated under the real rules and under each misconception.

| Id | Level | Asks for | Typical wrong options | Typed |
|---|---|---|---|---|
| `rustBasics.integerOps` | Débutant | `a / b` and `a % b` for a negative `a`; `as u8` from an integer and a float; `wrapping_add`, `saturating_add`, `checked_add` | division rounded down, `%` Euclidean, `as` clamping integers, wrapping floats, the three additions swapped | |
| `rustBasics.shadowing` | Débutant | a `let` shadow inside a block, or an assignment to a `mut` | the shadow outliving the block, the assignment ending with it, a `let` skipped | |
| `rustBasics.stringLength` | Intermédiaire | `s.len()` and `s.chars().count()` for café, 日本, 🦀rust… | one byte per character, two (UTF-16), a terminating zero | |
| `rustTypes.matchArms` | Intermédiaire | which arm a `match` with a guard and a range takes | the most specific arm, the last one, `1..=n` read as excluding `n` | |
| `rustCollections.iteratorChain` | Intermédiaire | `filter`/`map`/`sum`, `skip`/`take`, `rev`/`step_by` | `a..b` including `b`, adapters in another order, `filter` inverted | ✓ (sums) |
| `rustTypes.optionCombinators` | Avancé | `map`, `filter`, `unwrap_or`, `ok_or` on an `Option` | `filter` inverted, the default used when it should not be, `Some` kept | |
| `rustCollections.sortDedup` | Avancé | `dedup` then `sort`; a stable `sort_by_key` | every duplicate removed, ties reordered | |
| `rustOwnership.dropOrder` | Expert | the order in which values with a printing `Drop` go: locals, a block, `let _`, a shadow, a struct's fields, `drop(v)` | declaration order, fields reversed, `let _` kept, the shadowed value dropped at once | |

A program's lines are at most 36 characters (`RUST_LINE_MAX`), so it fits a
360 px screen without scrolling; the browser test checks it. `check:quiz`
checks the line length, that the program shown is the one checked, and runs
them: every distinct program becomes a module of one crate, compiled once
with `rustc --edition 2024` and run once, each case under `catch_unwind`.
The right option must be exactly what is printed, no wrong one may be. About
2,400 programs take some 30 seconds. `rustc` must be on the path (it is on
GitHub's runners; `RUSTC` names another one).

Eighteen mistake types, `rustIntegerDivision` to `rustShadowDrop`.

## TypeScript

The TypeScript test (6.22.0), *🔷 TypeScript* in the home page's
*Informatique* group, has four levels, `tsBeginner`, `tsIntermediate`,
`tsAdvanced` and `tsExpert`, and eight topics in two groups. *Le langage et
ses types*: `tsBasics`, `tsFunctions`, `tsObjects`, `tsNarrowing`,
`tsGenerics`, `tsTypeLevel`. *Exécution et outillage*: `tsRuntime` (the
JavaScript that actually runs) and `tsTooling`.

| Topic | Débutant | Intermédiaire | Avancé | Expert |
|---|---|---|---|---|
| `tsBasics` | `primitives` 5, `collections` 5, `arrayMethods` | `literals` 5 | | |
| `tsFunctions` | `functions` 5 | `signatures` 5 | `closures` 5, `closureLoop` | |
| `tsObjects` | `interfaces` 5 | `classes` 5 | `structural` 5 | `classSemantics` 5, `initOrder` |
| `tsNarrowing` | `unions` 5 | `guards` 5, `typeofValues` | `controlFlow` 5 | |
| `tsGenerics` | | `genericsBasics` 5 | `utility` 5 | |
| `tsTypeLevel` | | | `mapped` 5, `conditional` 5 | `advancedTypes` 5, `soundness` 5 |
| `tsRuntime` | `jsBasics` 5, `nullish` | `async` 5, `eventLoop` | `pitfalls` 5, `numbers`, `copies` | `engine` 5, `asyncOrder` |
| `tsTooling` | `setup` 5 | `modules` 5 | `strictness` 5 | `ecosystem` 5 |

135 written questions in `shared/quiz/ts/beginner.ts` to `expert.ts`, ids
`ts-…`. Versions are named where they matter (`satisfies` 4.9, `const` type
parameters and standard decorators 5.0, `using` 5.2, `NoInfer` 5.4,
`isolatedDeclarations` and inferred type predicates 5.5,
`erasableSyntaxOnly` 5.8), up to TypeScript 7, the compiler ported to Go,
and Node's type stripping.

Nine kinds are generated (`ts-output.ts`): a short program, *Qu'affiche ce
programme ?*, shown as a block of code like the Rust ones. Most are about
what the types do not change: the JavaScript underneath.

| Id | Level | Asks for | Typical wrong options |
|---|---|---|---|
| `tsBasics.arrayMethods` | Débutant | `sort()` without a comparator; what `push` returns; `slice` against `splice` | numeric order, `sort` not in place, `push` returning the item, `slice`'s end included, `splice`'s count read as an end |
| `tsRuntime.nullish` | Débutant | `??` against `\|\|` on 0 and the empty string; `?.` on a missing object | `\|\|` for `??`, `?.` throwing or giving `null` |
| `tsNarrowing.typeofValues` | Intermédiaire | `typeof` of `null`, an array, NaN, a function, a class, a bigint | "null", "array", "NaN", "class" |
| `tsRuntime.eventLoop` | Intermédiaire | the order of logs from sync code, promise callbacks and timers | timers before promises, source order |
| `tsFunctions.closureLoop` | Avancé | closures created in a `for` over `var` or `let` | each closure keeping its own `var`, the reverse |
| `tsRuntime.numbers` | Avancé | `0.1 + 0.2` and `toFixed`; `parseInt` against `Number`; `Math.round`, `floor`, `trunc` on negatives | exact floats, `Number` reading digits, halves rounded away from zero |
| `tsRuntime.copies` | Avancé | a spread or `Object.assign`, `structuredClone`, `===` on a nested object | deep spread, shared clone, `===` comparing contents |
| `tsRuntime.asyncOrder` | Expert | two async calls interleaving at `await`; an `await` continuation against a `then` and a timer | `await` blocking the caller, async bodies deferred |
| `tsObjects.initOrder` | Expert | a base constructor calling an override that reads a subclass field | the field already set, the base method called |

No program logs a lone integer, so none is typed. Lines are at most 36
characters (`TS_LINE_MAX`). `check:quiz` checks every distinct program
twice: it **type-checks** them all with the project's `tsc` in strict mode
(one file each, `export {}` appended, one project, `lib: ES2023, DOM`), so
no question shows code that does not compile; then it **runs** each one,
its types stripped by esbuild, in a fresh `vm` context whose
`console.log` is captured, waiting 5 ms for its promise callbacks and
timers. The right option must be exactly what is logged (lines joined by
spaces), no wrong one may be. About 2,700 programs take some 20 seconds.

Sixteen mistake types, `tsSortStrings` to `tsFieldInitOrder`.

## Google Cloud

The Google Cloud test (6.25.0), *☁️ Google Cloud* in the home page's
*Informatique* group, has four levels, `gcpBeginner`, `gcpIntermediate`,
`gcpAdvanced` and `gcpExpert`, and eight topics in two groups, with identity
and access first. *Identité et accès*: `gcpHierarchy` (the resource
hierarchy, organisation policies), `gcpIam`, `gcpServiceAccounts`,
`gcpSecurity`. *Infrastructure*: `gcpNetworking`, `gcpCompute`, `gcpStorage`,
`gcpOperations` (gcloud, Terraform, reliability, costs).

| Topic | Débutant | Intermédiaire | Avancé | Expert |
|---|---|---|---|---|
| `gcpHierarchy` | `resourceBasics` 5 | `orgPolicies` 4 | `landingZone` 4 | `governance` 3 |
| `gcpIam` | `iamBasics` 6 | `iamPractice` 6, `iamInheritance` | `iamAdvanced` 5, `iamDeny` | `iamExpert` 4, `iamDeny` |
| `gcpServiceAccounts` | `saBasics` 4 | `impersonation` 5 | `federation` 5 | `saExpert` 3 |
| `gcpSecurity` | `securityBasics` 3 | `audit` 4 | `perimeters` 4 | `securityExpert` 3 |
| `gcpNetworking` | `vpcBasics` 5, `subnetAddresses` | `connectivity` 5, `subnetNew`, `firewallRules` | `loadBalancing` 5, `firewallRules` | `networkingExpert` 4, `firewallPolicies` |
| `gcpCompute` | `computeBasics` 4, `runScaling` | `computeOps` 4, `runScaling` | `gke` 4 | `computeExpert` 3 |
| `gcpStorage` | `storageBasics` 3 | `storageAccess` 4 | `dataProtection` 3 | `storageExpert` 3 |
| `gcpOperations` | `toolsBasics` 4 | `terraform` 4 | `reliability` 4, `availability` | `operationsExpert` 3 |

130 written questions in `shared/quiz/gcp/beginner.ts` to `expert.ts`, ids
`gc-…`. Facts that change were checked against Google's documentation in
October 2026: the order of principal access boundary, deny and allow
policies; the firewall evaluation order (hierarchical policies, VPC rules,
network policies, `AFTER_CLASSIC_FIREWALL`); a subnet's four reserved
addresses and the /29 minimum; the constraints enforced on secure-by-default
organisations (May 2024); audit log types; the roles for attaching and
impersonating service accounts; Deployment Manager's end of support (2026);
the new basic roles in Preview; GitHub providers needing an attribute
condition.

Eight kinds are generated (`gcp-output.ts`). Policies and rules are shown as
a block of lines of 36 characters at most (`GCP_LINE_MAX`).

| Id | Level | Asks for | Typical wrong options |
|---|---|---|---|
| `gcpNetworking.subnetAddresses` | Débutant | usable addresses in a primary range, or the first and last a VM can get | two reserved (as on premises), none, a prefix one bit off |
| `gcpCompute.runScaling` | Débutant, Intermédiaire | instances for a load (concurrency, minimum instances), or requests served at the maximum | rounding down, one request per instance, minimum instances added on top |
| `gcpNetworking.subnetNew` | Intermédiaire | which range can be a new subnet in a VPC with three subnets in three regions | a range overlapping another region's subnet, a /30, link-local or loopback |
| `gcpNetworking.firewallRules` | Intermédiaire, Avancé | a packet against VPC firewall rules with priorities, sources, ports and target tags | listed order, highest number first, allow winning a tie, tags ignored, ingress allowed by default |
| `gcpIam.iamInheritance` | Intermédiaire | which of `get`, `list`, `create`, `delete` Alice has on a bucket's objects, with roles granted at the organisation, folder, project and bucket, to her or her group | no inheritance, the lowest grant replacing the others, group grants ignored |
| `gcpIam.iamDeny` | Avancé, Expert | the same with a deny policy (v2 permissions, a group or everyone, exception principals) | the deny ignored, an allow below it winning, exceptions ignored |
| `gcpOperations.availability` | Avancé | two components in series, or two independent zones | series and parallel swapped, the weakest part, the average, two zones halving downtime |
| `gcpNetworking.firewallPolicies` | Expert | a packet through an organisation policy, a folder policy, VPC rules and a global network policy, with `goto_next` | the wrong order of steps, `goto_next` as allow, implied allow |

Each question carries its model (`gcp-model.ts`), and `check:quiz` computes
the answer again with an evaluator of its own (`server/check-gcp.ts`):
subnets with BigInt arithmetic and Node's `net.BlockList`, firewalls by
sorting every matching rule, IAM by building the principal's set of
permissions. The right option must equal it and no wrong one may.

Twenty mistake types, `gcpReservedAddresses` to `gcpAvailabilityMin`.

## Economics

The public economics test (6.26.0), *🏛️ Économie publique* in the home
page's *Économie* group, has two levels, `econ` (*Fondamentaux*) and
`econAdvanced` (*Avancé*), and nine topics in three groups. *Théorie du
bien-être et choix publics*: `econWelfare`, `econMarketFailure`,
`econPublicChoice`. *Fiscalité*: `econIncidence`, `econOptimalTax`,
`econTaxDesign`. *État-providence et travail*: `econSocialInsurance`,
`econRedistribution`, `econLabour`.

Like physical chemistry, it mixes two sources: concept questions from the
[question bank](question-bank.md), written from eight textbooks (one unit
per chapter, never shipped), and thirteen generated kinds (`econ-output.ts`)
that put numbers on the classic diagrams. Most are drawn as an economic chart
(`Chart` in `types.ts`, drawn by `src/graph.ts`): labelled axes from the
origin, named curves, lettered and shaded areas, points and dashed drops. In
French and Spanish, numbers in the text and options take a decimal comma.

| Id | Levels | Asks for | Typical wrong options |
|---|---|---|---|
| `econIncidence.taxIncidence` | both | buyers' share of a per-unit tax levied on sellers or buyers, or its deadweight loss (chart: D, S, S + t or D − t) | statutory incidence, the shares inverted, half each; the rectangle t × ΔQ, the revenue |
| `econIncidence.surplusAreas` | Fondamentaux | which lettered areas A–F make the deadweight loss, the revenue, or each side's loss | another side's areas, part of the area |
| `econMarketFailure.pigou` | both | the Pigouvian tax, or the efficient quantity, with a rising marginal external cost (MB, MPC, MSC, MEC) | external cost taxed at the market quantity, the efficient price, the market quantity |
| `econMarketFailure.samuelson` | both | efficient level of a public good for two people (MB₁, MB₂, MC) | horizontal sum, one person alone, a cost share |
| `econPublicChoice.medianVoter` | both | the majority winner among single-peaked voters (their utility curves) | the mean, an extreme, the voter next to the median |
| `econWelfare.swfChoice` | both | the allocation a utilitarian, Rawlsian or Nash function picks (points in utility space) | another criterion's choice, a Pareto-dominated point |
| `econRedistribution.giniLorenz` | both | the Gini of quintile shares (Lorenz curve, areas A and B), or **which of four Lorenz curves is most equal** (the options are charts) | A alone, 1 − 2A, the top share; a curve further from the diagonal |
| `econRedistribution.benefitTrap` | both | effective marginal rate while a benefit is withdrawn, or the hours where it ends (budget line) | the tax or the taper alone, rates multiplied; the taper or the wage forgotten |
| `econTaxDesign.taxSchedule` | both | tax owed or average rate under a bracket schedule (shown as a block) | top rate on all income, a band's rate outside it |
| `econLabour.monopsony` | both | a monopsonist's employment and wage (MRP, S, MRC), or employment under a minimum wage | wage = MRP, the competitive outcome, employment read on demand |
| `econSocialInsurance.insurancePremium` | both | most a log-utility person pays for full insurance (utility curve, chord) | the expected loss, the whole loss, the risk premium alone |
| `econOptimalTax.ramsey` | both | the Ramsey rate on a second good with independent demands | the rule inverted, uniform rates, one elasticity |
| `econOptimalTax.saezTopRate` | Avancé | revenue-maximising top rate 1/(1 + a·e) | without a, the formula turned around |

Each question carries its model (`econ-model.ts`), and `check:quiz` computes
the answer again with an evaluator of its own (`server/check-econ.ts`): the
equilibria by bisection on the curves, the lettered areas by the shoelace
formula (and checked to tile the surpluses before the tax), the Gini by the
mean absolute difference instead of trapezoids, a monopsonist's choice by
searching its profit, the median voter as the Condorcet winner, the tax
band by band, the certainty equivalent by bisection. The right option must
match within its rounding, and no wrong one may. Charts are checked to stay
in their window, and option charts to share it.

Forty-two mistake types, `econStatutoryIncidence` to `econRiskPremiumOnly`.

## React

The React test (6.24.0), *⚛️ React* in the home page's *Informatique* group,
has four levels, `reactBeginner`, `reactIntermediate`, `reactAdvanced` and
`reactExpert`, and eight topics in two groups. *Composants, état et rendu*:
`reactComponents`, `reactState`, `reactEffects`, `reactRendering`. *La pile :
données, types, outils, tests*: `reactData` (loading data, forms and Actions,
server components, streaming), `reactTyping` (React with TypeScript),
`reactTooling` (Vite, builds, deployment) and `reactTesting` (Vitest, Testing
Library, Playwright). The stack is the one Luma itself is built with, minus
React: Vite, TypeScript, a Hono API, SQLite and PostgreSQL, Playwright,
Cloud Run.

| Topic | Débutant | Intermédiaire | Avancé | Expert |
|---|---|---|---|---|
| `reactComponents` | `jsx` 6, `conditionalRender`, `defaultProps` | `composition` 4 | `patterns` 4 | `internals` 3 |
| `reactState` | `useStateBasics` 5, `clickCounter` | `stateDesign` 5, `staleLog` | `externalState` 4, `keyReset` | `concurrency` 3 |
| `reactEffects` | `effectsIntro` 3 | `effectsInPractice` 5, `effectOrder` | `effectsAdvanced` 4, `cleanupOrder`, `refCounter` | `effectsExpert` 3, `strictEffects`, `layoutEffects` |
| `reactRendering` | `listsKeys` 3 | `renderRules` 4, `batching` | `performance` 5, `memoChild` | `reconciliation` 4 |
| `reactData` | `fetching` 3 | `formsActions` 5 | `serverData` 5 | `streaming` 4 |
| `reactTyping` | `propsTypes` 4 | `eventsHooks` 4 | `advancedTypes` 4 | `typesExpert` 3 |
| `reactTooling` | `viteSetup` 5 | `devWorkflow` 4 | `buildDeploy` 4 | `platform` 3 |
| `reactTesting` | `testingIntro` 3 | `componentTests` 4 | `e2eTests` 4 | `testStrategy` 3 |

127 written questions in `shared/quiz/react/beginner.ts` to `expert.ts`, ids
`re-…`. They follow React 19: `ref` as a prop, Actions (`<form action>`,
`useActionState`, `useFormStatus`, `useOptimistic`), `use`, document
metadata, ref cleanups, the types' `React.JSX`; and 19.2: `<Activity>`,
`useEffectEvent`, `cacheSignal`, partial pre-rendering, the `_r_` format of
`useId`. Also the React Compiler 1.0, Create React App's end, Vite 8 and
Rolldown, TanStack Query, Hono's typed client, MSW.

Twelve kinds are generated (`react-output.ts`): a short component, shown as a
block of code, and *Qu'affiche la page ?* (its text) or *Qu'affiche la
console ?* (its `console.log` lines joined by spaces), once `App` is
rendered, sometimes after clicks on its button. The hooks and `memo` are used
without imports (`REACT_IMPORTS`, added by the checks).

| Id | Level | Asks for | Typical wrong options |
|---|---|---|---|
| `reactState.clickCounter` | Débutant | the count after clicks, with `setN(n + k)` or `setN(v => v + k)` called several times | every call adding, updaters reading the render's value, the screen one step off |
| `reactComponents.conditionalRender` | Débutant | `{n && "x"}`, `{ok && "y"}`, `{name}` with 0, `false`, `null` | nothing for 0, `false` or `null` as text, JSX line breaks dropped |
| `reactComponents.defaultProps` | Débutant | a default prop with the prop missing, `undefined`, `null` or `""` | the default replacing `null` or `""`, or not `undefined` |
| `reactState.staleLog` | Intermédiaire | what a handler logs after `setN` | the new value, always 0, two `setN(n + 1)` adding 2 |
| `reactEffects.effectOrder` | Intermédiaire | the order of renders and effects of a parent and its children | parent's effect first, effects right after each render, children rendered first |
| `reactRendering.batching` | Intermédiaire | renders logged after clicks setting two states | one render per setter |
| `reactState.keyReset` | Avancé | `useState(p.v)` in a child with a changing key, a constant key or none | the initial value following props, a new key keeping state |
| `reactEffects.refCounter` | Avancé | a ref incremented in a handler, with or without a state change | the ref rendering, or lagging |
| `reactEffects.cleanupOrder` | Avancé | start and stop logs of an effect with `[n]`, `[]` or no list, after clicks | cleanup after the new effect, with the new value, `[]` re-running |
| `reactRendering.memoChild` | Avancé | renders of a child with or without `memo`, given a string, a new object, a `useMemo` object or a new function | `memo` skipping a new object, children before their parent |
| `reactEffects.strictEffects` | Expert | `<StrictMode>` in development: initialisers, renders, mount and cleanup | one render, one effect, cleanup forgotten |
| `reactEffects.layoutEffects` | Expert | `useLayoutEffect` and `useEffect` in a parent and a child | effects before layout effects, source order, parent first |

No answer is typed. Lines are at most 36 characters (`REACT_LINE_MAX`).
`check:quiz` checks every distinct program twice: it **type-checks** them
all with the project's `tsc` (strict, `jsx: react-jsx`, `@types/react`), in
`.tsx` files written next to `node_modules` so the types resolve; then it
**renders** each case with React DOM 19 in one jsdom window, in development
(so StrictMode does what the question says), `IS_REACT_ACT_ENVIRONMENT` set
and every step in `act`: render, then as many clicks on the first `button` as
the question says. The page's text (whitespace collapsed) or the captured
`console.log` lines must equal the right option, and no wrong one; any React
warning fails the check. About 500 renders take a few seconds. React, React
DOM and jsdom are development dependencies, used by the checks only: the app
itself does not use React.

Eighteen mistake types, `reactUpdaterQueue` to `reactLayoutOrder`.

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

## SQL

The SQL test (6.20.0), *🗄️ SQL* in the home page's *Informatique* group,
has its own level, `sql`, and eight topics in two groups. *Le langage SQL*:
`sqlSelect`, `sqlAggregate`, `sqlJoins`, `sqlModify`. *PostgreSQL, SQLite,
MySQL*: `sqlPostgres`, `sqlSqlite`, `sqlMysql`, `sqlPractice`.

It works like Linux. 131 written questions in `shared/quiz/sql/*.ts`
(`language.ts`, `engines.ts`, `practice.ts`), ids `sq-…`, in the Linux
format (`LinuxQuestion`, drawn by `written(list)` from `linux.ts`). Where
PostgreSQL, SQLite and MySQL differ, the question or its explanation says
how, with versions where it matters (`RETURNING` in SQLite 3.35, windows in
MySQL 8.0). Every question of an engine's topic carries its client to
install: `postgresql-client`, `sqlite3`, `default-mysql-client` (Debian's
MariaDB client), with the Fedora and Homebrew names: 42 questions.

| Topic | Kinds (questions) |
|---|---|
| `sqlSelect` | `filtering` 5, `nulls` 5, `sorting` 5, `expressions` 5, `filterRows`, `nullRows`, `orderLimit` |
| `sqlAggregate` | `aggregates` 5, `grouping` 5, `windows` 5, `countValues`, `averageAge`, `groupCount` |
| `sqlJoins` | `joins` 5, `subqueries` 5, `sets` 4, `joinRows` |
| `sqlModify` | `changes` 5, `schema` 5, `transactions` 5, `indexes` 5 |
| `sqlPostgres` | `psql` 5, `pgFeatures` 6, `pgAdmin` 5 |
| `sqlSqlite` | `sqliteShell` 5, `sqliteTypes` 5, `sqliteRuntime` 5 |
| `sqlMysql` | `mysqlClient` 5, `mysqlSpecifics` 6 |
| `sqlPractice` | `design` 5, `safety` 5, `performance` 5, `operations` 5 |

Seven kinds are generated (`sql-output.ts`): two small tables drawn from
the seed, `owners (id, name)` and `pets (name, kind, age, owner)`, and a
query; *Que renvoie cette requête ?* Three owners, one without a pet; five
or six pets, with one NULL kind, one NULL age and one pet without an owner;
ages all different, so no `ORDER BY` has ties. The tables are shown in
KaTeX, small (`\footnotesize`), and stacked for a join: at 360 px the pets
table only just fits, which is why pet names have four letters at
most and the column is `owner`, not `owner_id` (the browser test checks the
width). A result is written as the options show it (`formatRows`): one
value; rows as `a | b, c | d`; *(aucune ligne)* for none.

| Id | Asks for | Typical wrong options | Typed |
|---|---|---|---|
| `sqlSelect.filterRows` | `WHERE age > k` with a pet exactly at k; `a OR b AND c`; `NOT IN` with a NULL | `>` read as `>=`, NULL kept, OR before AND | |
| `sqlSelect.nullRows` | `= NULL`, `IS NULL`, `<>` | NULL compared as a value | |
| `sqlSelect.orderLimit` | `ORDER BY age [DESC] LIMIT n OFFSET m` | OFFSET ignored or swapped with LIMIT, ASC for DESC | |
| `sqlAggregate.countValues` | `COUNT(*)`, `COUNT(kind)`, `COUNT(DISTINCT kind)` | NULLs counted or not, DISTINCT applied or not | ✓ |
| `sqlAggregate.averageAge` | `AVG(age)`; `SUM(age), COUNT(age)` | NULL counted as 0, SUM for AVG, a NULL sum | ✓ (AVG) |
| `sqlAggregate.groupCount` | `GROUP BY kind` with `HAVING`, or with `WHERE` first | HAVING ignored, the NULL group kept, `>` read as `>=` | |
| `sqlJoins.joinRows` | how many rows an inner or LEFT JOIN gives; owners without a pet (`LEFT JOIN … WHERE p.name IS NULL`) | inner for outer, the Cartesian product, only the owners | ✓ |

Only portable SQL is generated: no NULL in an `ORDER BY` (engines sort it
differently), no integer division, no `LIKE` (case rules differ). For these
kinds (verify kind `sql`, with the setup and the query), `check:quiz` creates
the tables on an in-memory SQLite database (`better-sqlite3`), runs the
query and compares its `formatRows` with the options: the right one must
match, no wrong one may. With `CHECK_SQL_POSTGRES` set to a database URL,
it runs every query again on PostgreSQL, in a schema it rolls back, and
fails if the result differs:

```sh
CHECK_SQL_POSTGRES="postgresql://postgres@localhost:5433/postgres?host=/tmp/pg" npm run check:quiz
```

Thirteen mistake types, `sqlBoundary` to `sqlCrossProduct`. The written
lists grow like Linux's: a new question gets `since: N` with a version bump.

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
| `sqlBoundary` | `>` read as `>=`: the row on the boundary on the wrong side | sqlSelect, sqlAggregate |
| `sqlNullCompared` | NULL compared with `=`, `<>` or `NOT IN` as a value | sqlSelect |
| `sqlPrecedence` | OR taken before AND | sqlSelect |
| `sqlLimitOffset` | LIMIT and OFFSET swapped, or OFFSET ignored | sqlSelect |
| `sqlSortDirection` | ASC and DESC confused | sqlSelect |
| `sqlCountNulls` | `COUNT(*)` and `COUNT(column)` confused | sqlAggregate |
| `sqlDistinct` | DISTINCT applied or forgotten | sqlAggregate |
| `sqlAvgNulls` | AVG or SUM counting NULL as 0, or becoming NULL | sqlAggregate |
| `sqlAggregateConfused` | SUM, AVG and COUNT confused | sqlAggregate |
| `sqlHavingIgnored` | HAVING (or WHERE) not applied | sqlAggregate |
| `sqlNullGroup` | The NULL group kept or lost wrongly | sqlAggregate |
| `sqlJoinKind` | Inner and outer joins confused | sqlJoins |
| `sqlCrossProduct` | Every row with every row | sqlJoins |
| `rustIntegerDivision` | Integer division rounded down, not toward zero | rustBasics |
| `rustRemainderSign` | `%` taken as Euclidean | rustBasics |
| `rustCastSaturates` | An integer `as` cast taken to clamp | rustBasics |
| `rustCastWraps` | A float `as` cast taken to wrap or round | rustBasics |
| `rustWrapping` | `wrapping_`, `saturating_`, `checked_` confused | rustBasics |
| `rustShadowScope` | Shadowing and assignment confused around a block | rustBasics |
| `rustShadowIgnored` | A shadowing `let` skipped | rustBasics |
| `rustBytesChars` | Bytes and characters confused | rustBasics |
| `rustRangeEnd` | A range's end included or left out wrongly | rustCollections, rustTypes |
| `rustIteratorOrder` | Adapters applied in another order | rustCollections, rustTypes |
| `rustFilterInverted` | `filter` taken to drop what passes | rustCollections, rustTypes |
| `rustMatchOrder` | The most specific arm instead of the first | rustTypes |
| `rustUnwrapOr` | `unwrap_or`'s default at the wrong time | rustTypes |
| `rustDedupConsecutive` | `dedup` taken to remove every duplicate | rustCollections |
| `rustSortStable` | `sort_by_key` taken to reorder ties | rustCollections |
| `rustDropOrder` | Dropped in declaration order, or fields reversed | rustOwnership |
| `rustLetUnderscore` | `let _ =` taken to keep the value | rustOwnership |
| `rustShadowDrop` | A shadowed value taken to be dropped at once | rustOwnership |
| `tsSortStrings` | `sort()` without a comparator taken to sort numbers | tsBasics |
| `tsMutatingMethod` | What `sort`, `push`, `splice`, `slice` change or return | tsBasics |
| `tsSliceEnd` | `slice`'s end included, or `splice`'s count as an end | tsBasics |
| `tsNullishOr` | `??` and `\|\|` confused | tsRuntime |
| `tsOptionalChain` | `?.` taken to throw or give `null` | tsRuntime |
| `tsTypeof` | `typeof` misremembered | tsNarrowing |
| `tsMicrotaskOrder` | A timer before a promise callback | tsRuntime |
| `tsAsyncSync` | Async code in the order written | tsRuntime |
| `tsAwaitOrder` | `await` blocking the caller | tsRuntime |
| `tsVarCapture` | `var` and `let` confused in a loop | tsFunctions |
| `tsFloat` | Floating point or `toFixed` misread | tsRuntime |
| `tsParseNumber` | `Number()` and `parseInt()` confused | tsRuntime |
| `tsRounding` | Rounding of halves or negatives | tsRuntime |
| `tsShallowCopy` | Shallow and deep copies confused | tsRuntime |
| `tsReferenceEquality` | Identity and contents confused | tsRuntime |
| `tsFieldInitOrder` | Fields set before the base constructor | tsObjects |
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
npm run check:quiz          # 400 seeds per level: 184,000 questions, about two minutes
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
- **TypeScript:** every program shown type-checked with `tsc` in strict mode and run, its output compared with the options (see [TypeScript](#typescript)); every written TypeScript question checked like the Linux ones.
- **React:** every component shown type-checked with `tsc` (JSX for React 19) and rendered with React DOM in jsdom, its page or console compared with the options, any React warning a failure (see [React](#react)); every written React question checked like the Linux ones.
- **Economics:** every generated answer computed again by `server/check-econ.ts` (see [Economics](#economics)); every chart inside its window.
- **Google Cloud:** every generated answer computed again by `server/check-gcp.ts` (see [Google Cloud](#google-cloud)), policy lines at most 36 characters; every written Google Cloud question checked like the Linux ones.
- **Rust:** every program shown compiled with `rustc` and run, its output compared with the options; lines at most 36 characters (see [Rust](#rust)); every written Rust question checked like the Linux ones.
- **SQL:** every generated query run on a real SQLite database, and with `CHECK_SQL_POSTGRES` on PostgreSQL too (see [SQL](#sql)); every written SQL question checked like the Linux ones.
- **Chemical equations:** every option read back from its TeX, its atoms counted element by element, its coefficients in lowest terms, and the balance unique (see [Balancing equations](#balancing-equations)).
- **Graphs:** every drawn curve is at least 30 % inside its window (25 % for an option); option curves differ by half a grid square somewhere; all options of a question share their window or axes; plane intercepts are non-zero and distinct.
- **Typed answers:** for every question that can be typed, each option's value written to 4 and 10 decimals (and with a comma) is read as that option, and a blank as a blank.
- **Determinism:** the same seed gives the same test twice.
- **Review questions:** their number and kinds match the focus.

It exits with status 1 and lists the first failures if anything is wrong. Run
it after any change to `shared/quiz/`.

The verification tests mathematical correctness, not pedagogy: whether a
wrong option is a *plausible* mistake is a matter of review.
