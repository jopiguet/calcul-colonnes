/**
 * Checks the question generators over many seeds:
 *   - the marked answer is right, computed independently (numerical derivative,
 *     integral, limit, roots…), and no wrong option is also right;
 *   - four options with distinct LaTeX; every formula renders with KaTeX;
 *   - the same seed always gives the same test.
 *
 *   npm run check:quiz [-- seeds]
 */
import katex from "katex";
import { generateQuiz, LEVELS, MISTAKES, reviewCount, skillsFor, TOPICS, type Option, type Question } from "../shared/quiz/index.ts";

const SAMPLES = [0.37, 0.81, 1.3, 1.9, 2.6];
const near = (a: number, b: number, tol: number): boolean =>
  a === b || (Number.isFinite(a) && Number.isFinite(b) && Math.abs(a - b) <= tol * Math.max(1, Math.abs(a), Math.abs(b)));

function derivative(f: (x: number) => number, x: number): number {
  const h = 1e-5 * Math.max(1, Math.abs(x));
  return (f(x + h) - f(x - h)) / (2 * h);
}

function simpson(f: (x: number) => number, a: number, b: number, n = 2000): number {
  const h = (b - a) / n;
  let s = f(a) + f(b);
  for (let i = 1; i < n; i++) s += f(a + i * h) * (i % 2 ? 4 : 2);
  return (s * h) / 3;
}

/** Whether an option is a right answer to the question, computed without the generator. */
function isRight(q: Question, o: Option): boolean {
  const v = q.verify;
  switch (v.kind) {
    case "derivative":
      return SAMPLES.every((x) => near(o.fn!(x), derivative(v.f, x), 1e-5));
    case "primitive":
      return SAMPLES.every((x) => near(derivative(o.fn!, x), v.f(x), 1e-5));
    case "identity":
      return SAMPLES.every((x) => near(o.fn!(x), v.f(x), 1e-9));
    case "integral":
      return near(o.num!, simpson(v.f, v.a, v.b), 1e-8);
    case "value":
      return near(o.num!, v.value, 1e-9);
    case "root":
      return Number.isFinite(o.num!) && Math.abs(v.f(o.num!)) < 1e-9;
    case "limit": {
      const y = v.f(v.probe);
      if (o.num === Infinity) return y > 1e5;
      if (o.num === -Infinity) return y < -1e5;
      return Math.abs(y - o.num!) <= 1e-3 * Math.max(1, Math.abs(o.num!));
    }
    case "solutions": {
      // All roots of f in [lo, hi[ by sign changes on a fine grid, refined by bisection.
      const roots: number[] = [];
      const n = 200_000;
      const step = (v.hi - v.lo) / n;
      for (let i = 0; i < n; i++) {
        let a = v.lo + i * step;
        let b = a + step;
        let fa = v.f(a);
        if (Math.abs(fa) < 1e-12) {
          roots.push(a);
          continue;
        }
        if (fa * v.f(b) >= 0) continue;
        for (let k = 0; k < 80; k++) {
          const m = (a + b) / 2;
          if (fa * v.f(m) <= 0) b = m;
          else [a, fa] = [m, v.f(m)];
        }
        roots.push((a + b) / 2);
      }
      // A root on a grid point is also seen by the next interval: merge near-duplicates.
      const unique = roots.filter((r, i) => i === 0 || Math.abs(r - roots[i - 1]!) > 1e-6);
      return unique.length === o.set!.length && unique.every((r, i) => near(r, o.set![i]!, 1e-7));
    }
  }
}

function render(tex: string, where: string): void {
  try {
    katex.renderToString(tex, { throwOnError: true });
  } catch (error) {
    throw new Error(`${where}: KaTeX cannot render ${JSON.stringify(tex)}: ${(error as Error).message}`);
  }
}

const seeds = Number(process.argv[2] ?? 400);
const failures: string[] = [];
const prompts = new Map<string, number>();
const mistakesSeen = new Map<string, number>();
let checked = 0;

for (const level of LEVELS) {
  for (let seed = 1; seed <= seeds; seed++) {
    // Every other test brings back three kinds of question, as for a player with mistakes to review.
    const kinds = skillsFor(level, TOPICS);
    const focus = seed % 2 === 0 ? [0, 1, 2].map((k) => kinds[(seed * 7 + k * 13) % kinds.length]!) : [];
    const spec = { seed, level, topics: TOPICS, count: 20, focus: [...new Set(focus)] };
    const quiz = generateQuiz(spec);
    const reviews = quiz.filter((q) => q.review);
    if (reviews.length !== reviewCount(20, spec.focus) || reviews.some((q) => !spec.focus.includes(q.skill))) {
      failures.push(`${level} seed ${seed}: review questions do not match the focus`);
    }
    const again = generateQuiz(spec);
    if (JSON.stringify(quiz.map((q) => q.options.map((o) => o.tex))) !== JSON.stringify(again.map((q) => q.options.map((o) => o.tex)))) {
      failures.push(`${level} seed ${seed}: not deterministic`);
    }
    for (const q of quiz) {
      checked += 1;
      const where = `${level} seed ${seed} ${q.topic} ${q.prompt.tex}`;
      prompts.set(`${level}/${q.topic}/${q.prompt.key}`, (prompts.get(`${level}/${q.topic}/${q.prompt.key}`) ?? 0) + 1);
      try {
        if (q.options.length !== 4) throw new Error("not 4 options");
        if (new Set(q.options.map((o) => o.tex)).size !== 4) throw new Error("repeated option");
        render(q.prompt.tex, where);
        render(q.explanation.tex, where);
        q.options.forEach((o) => render(o.tex, where));
        q.options.forEach((o, i) => {
          const right = isRight(q, o);
          if (i === q.correct && !right) throw new Error(`marked answer is wrong: ${o.tex}`);
          if (i !== q.correct && right) throw new Error(`wrong option is also right: ${o.tex}`);
          if (i !== q.correct && !(MISTAKES as readonly string[]).includes(o.mistake ?? "")) {
            throw new Error(`wrong option without a mistake label: ${o.tex}`);
          }
          if (i !== q.correct) mistakesSeen.set(o.mistake!, (mistakesSeen.get(o.mistake!) ?? 0) + 1);
        });
      } catch (error) {
        failures.push(`${where}: ${(error as Error).message}`);
      }
    }
  }
}

for (const [key, n] of [...prompts].sort()) console.log(`${key.padEnd(40)} ${n}`);
const unused = MISTAKES.filter((m) => !mistakesSeen.has(m));
if (unused.length > 0) failures.push(`mistake types never shown: ${unused.join(", ")}`);
console.log(`\n${mistakesSeen.size} of ${MISTAKES.length} mistake types shown`);
console.log(`${checked} questions checked, ${failures.length} failures`);
for (const f of [...new Set(failures)].slice(0, 25)) console.log("  ✗", f);
process.exit(failures.length === 0 ? 0 : 1);
