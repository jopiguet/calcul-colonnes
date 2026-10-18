# Question generators

The multiple-choice engine lives entirely in `shared/quiz/`, and runs the same
way in the browser and on the server.

| File | Content |
|---|---|
| `types.ts` | `Level`, `Topic`, `Draft`, `Option`, `Verify`, `Question` |
| `rng.ts` | Seeded random numbers (mulberry32) |
| `tex.ts` | Exact fractions and LaTeX helpers: `frac`, `sum`, `poly`, `piTex`… |
| `derivatives.ts`, `integrals.ts`, `trigonometry.ts`, `limits.ts`, `explog.ts` | The generators, one file per topic |
| `index.ts` | Registry of kinds of question, `generateQuiz`, `gradeQuiz`, `QUIZ_VERSION` |
| `progress.ts` | Status of a kind of question from the latest answers |

## The 39 kinds of question

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

## Anatomy of a generator

A generator is a function `(rng) => Draft`:

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
      fromPoly(poly([[n * a, n], [m * b, m]])),               // exponent not lowered
      fromPoly(poly([[a, n - 1], [b, m - 1]])),               // exponent not brought down
      fromPoly(poly([[n * a, n - 1], [m * b, m - 1], [c, 0]])), // constant kept
      fromPoly(poly([[n * a, n - 1], [-m * b, m - 1]])),       // sign error
    ],
    explanation: { key: "powerRule", tex: "(x^{n})' = n\\,x^{n-1}" },
    verify: { kind: "derivative", f: f.fn },
  };
};
```

| Field | Content |
|---|---|
| `prompt` | A sentence key (translated by the app) and the LaTeX of the question |
| `correct` | The right answer: its LaTeX, plus what it stands for, as `fn` (a function), `num` (a number, possibly ±∞) or `set` (a sorted set of numbers) |
| `wrong` | Candidate wrong answers, ideally real mistakes. Give more than three, because duplicates are removed. |
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
2. **Register it** at the end of the `school` and/or `university` object at the bottom of the file.
3. **Bump the version:**
   - Increment `QUIZ_VERSION` in `index.ts` and note the change in the comment above it.
   - Declare the kind in `AVAILABILITY` with `from: <new version>`, so tests of older versions keep drawing from their original list.
4. **Name it:** add the name in both languages in `SKILL_NAMES` (`src/quiz-i18n.ts`). If you introduce a new prompt or explanation key, add it to `PromptKey` / `ExplanationKey` in `types.ts` and to both dictionaries.
5. **Run the checks:** `npm run check:quiz` and `npm run build`.

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
| **Text only** (an explanation or a translation, a name in `SKILL_NAMES`) | No bump: seeds produce the same questions. |

The server refuses a test submitted with a version other than its own (a
browser still running an old build); reloading the page fixes it.

A quick way to confirm that a change leaves older versions untouched is to
hash the tests produced by a few hundred seeds at each old version before and
after the change. The hashes must match.

| Version | Change |
|---|---|
| 1 | First release |
| 2 | ±∞ compared correctly when removing duplicate options. In version 1 every number counted as equal to ±∞, so questions with an infinite answer were always discarded, and `limits.growth` never appeared. |

## Verification

```sh
npm run check:quiz          # 400 seeds per level: 16,000 questions, about a minute
npm run check:quiz -- 1500  # 60,000 questions
```

For each seed and level, the script generates a 20-question test on all
topics. Every other test also brings back three kinds, as for a player with
mistakes to review. It then checks:

- **Correct answer:** the marked answer is right, computed **without the generator's arithmetic**: central-difference derivative, Simpson integral, function evaluated near the limit point, root finding by sign changes on a 200,000-point grid followed by bisection.
- **Wrong options:** none of them is also right.
- **Options:** exactly four, with distinct LaTeX.
- **Rendering:** the question, the options and the explanation all render in KaTeX with `throwOnError`.
- **Determinism:** the same seed gives the same test twice.
- **Review questions:** their number and kinds match the focus.

It exits with status 1 and lists the first failures if anything is wrong. Run
it after any change to `shared/quiz/`.

The verification tests mathematical correctness, not pedagogy: whether a
wrong option is a *plausible* mistake is a matter of review.
