/**
 * Multiple-choice tests in mathematics, generated from a seed.
 *
 * The same code runs in the browser (to show the test) and on the server (to
 * grade it): given the seed, level, topics and number of questions, both get
 * exactly the same questions and options in the same order.
 */
import { derivatives } from "./derivatives";
import { explog } from "./explog";
import { integrals } from "./integrals";
import { limits } from "./limits";
import { createRng, type Rng } from "./rng";
import { trigonometry } from "./trigonometry";
import type { Draft, Generator, Level, Option, Question, Topic, Verify } from "./types";

export * from "./types";
export * from "./progress";

const GENERATORS: Record<Topic, Record<Level, Record<string, Generator>>> = {
  derivatives,
  integrals,
  trigonometry,
  limits,
  explog,
};

/** Every kind of question, by id ("topic.name"). */
const SKILLS = new Map<string, { topic: Topic; generator: Generator; levels: Level[] }>();
for (const [topic, byLevel] of Object.entries(GENERATORS) as [Topic, Record<Level, Record<string, Generator>>][]) {
  for (const [level, generators] of Object.entries(byLevel) as [Level, Record<string, Generator>][]) {
    for (const [name, generator] of Object.entries(generators)) {
      const id = `${topic}.${name}`;
      const known = SKILLS.get(id);
      if (known) known.levels.push(level);
      else SKILLS.set(id, { topic, generator, levels: [level] });
    }
  }
}

/**
 * Kinds of question added or retired after version 1. Old versions must keep
 * drawing from exactly the list they had, so a new kind gets `from: <new version>`
 * and a kind whose behaviour changes is retired (`until`) and replaced by a new id.
 * See docs/question-generators.md#versioning.
 */
const AVAILABILITY: Record<string, { from?: number; until?: number }> = {};

function available(id: string, version: number): boolean {
  const a = AVAILABILITY[id];
  return (a?.from ?? 1) <= version && (a?.until === undefined || version < a.until);
}

export const SKILL_IDS: string[] = [...SKILLS.keys()];
export const isSkill = (id: string): boolean => SKILLS.has(id);
export const skillTopic = (id: string): Topic | undefined => SKILLS.get(id)?.topic;

/** Kinds of question a test with this level and these topics can contain. */
export function skillsFor(level: Level, topics: Topic[], version = QUIZ_VERSION): string[] {
  return SKILL_IDS.filter((id) => {
    const skill = SKILLS.get(id)!;
    return topics.includes(skill.topic) && skill.levels.includes(level) && available(id, version);
  });
}

/** Share of a test given to review questions, and how often one kind may come back in a test. */
export const REVIEW_SHARE = 0.4;
const REVIEW_PER_SKILL = 2;

export const OPTION_COUNT = 4;
export const QUIZ_COUNTS = [5, 10, 15, 20];
export const MAX_QUESTIONS = 30;

const SAMPLES = [0.37, 0.81, 1.3, 1.9, 2.6];

/**
 * Version of the generator. A test is stored as a seed, so anything that changes
 * the questions a seed gives must bump the version, and older versions must
 * keep producing what they produced: saved tests are rebuilt from their seed.
 *   1 — first release (its option comparison took ±∞ as equal to every number,
 *       so questions whose answer is infinite were never kept);
 *   2 — ±∞ compared correctly.
 */
export const QUIZ_VERSION = 2;

const close = (a: number, b: number, version: number): boolean => {
  if (version >= 2 && (!Number.isFinite(a) || !Number.isFinite(b))) return a === b;
  return a === b || Math.abs(a - b) <= 1e-9 * Math.max(1, Math.abs(a), Math.abs(b));
};

/** Whether two options say the same thing, so that only one of them may be shown. */
function same(verify: Verify, a: Option, b: Option, version: number): boolean {
  if (a.tex === b.tex) return true;
  switch (verify.kind) {
    case "derivative":
    case "identity":
      return SAMPLES.every((x) => close(a.fn!(x), b.fn!(x), version));
    case "primitive": {
      // Primitives are equal up to a constant.
      const offset = a.fn!(SAMPLES[0]!) - b.fn!(SAMPLES[0]!);
      return SAMPLES.every((x) => close(a.fn!(x) - b.fn!(x), offset, version));
    }
    case "solutions":
      return a.set!.length === b.set!.length && a.set!.every((v, i) => close(v, b.set![i]!, version));
    default:
      return close(a.num!, b.num!, version);
  }
}

function finalize(
  rng: Rng,
  version: number,
  topic: Topic,
  skill: string,
  review: boolean,
  draft: Draft,
): Question | null {
  const chosen: Option[] = [];
  for (const candidate of rng.shuffle(draft.wrong)) {
    if (chosen.length === OPTION_COUNT - 1) break;
    if (same(draft.verify, candidate, draft.correct, version)) continue;
    if (chosen.some((other) => same(draft.verify, candidate, other, version))) continue;
    chosen.push(candidate);
  }
  if (chosen.length < OPTION_COUNT - 1) return null;
  const options = rng.shuffle([draft.correct, ...chosen]);
  return {
    topic,
    skill,
    review,
    prompt: draft.prompt,
    options,
    correct: options.indexOf(draft.correct),
    explanation: draft.explanation,
    verify: draft.verify,
  };
}

export interface QuizSpec {
  seed: number;
  level: Level;
  topics: Topic[];
  count: number;
  /** Kinds of question to bring back (the player's recent mistakes); part of what defines the test. */
  focus?: string[];
  /** Generator version (QUIZ_VERSION when omitted). */
  version?: number;
}

/** How many review questions a test of `count` questions gets for these kinds. */
export function reviewCount(count: number, focus: string[]): number {
  if (focus.length === 0) return 0;
  return Math.min(Math.max(1, Math.round(count * REVIEW_SHARE)), focus.length * REVIEW_PER_SKILL, count);
}

export function generateQuiz({ seed, level, topics, count, focus = [], version = QUIZ_VERSION }: QuizSpec): Question[] {
  const rng = createRng(seed);
  // Topics in turn, so that a test covers all the chosen ones evenly.
  const order = rng.shuffle(topics);
  const seen = new Set<string>();
  const questions: Question[] = [];

  const make = (topic: Topic, review: boolean, pick: () => [string, Generator]): Question => {
    let question: Question | null = null;
    for (let attempt = 0; attempt < 50 && !question; attempt++) {
      const [skill, generator] = pick();
      const draft = generator(rng);
      if (seen.has(draft.prompt.tex) && attempt < 49) continue; // no repeated question
      question = finalize(rng, version, topic, skill, review, draft);
    }
    if (!question) throw new Error(`could not generate a ${topic} question`);
    seen.add(question.prompt.tex);
    return question;
  };

  // Review questions first (only when there is something to review: without focus,
  // the random draws are exactly those of a plain test).
  const kinds = focus.filter((id) => isSkill(id) && available(id, version));
  const reviews = reviewCount(count, kinds);
  const reviewOrder = reviews > 0 ? rng.shuffle(kinds) : [];
  for (let i = 0; i < reviews; i++) {
    const id = reviewOrder[i % reviewOrder.length]!;
    const skill = SKILLS.get(id)!;
    questions.push(make(skill.topic, true, () => [id, skill.generator]));
  }

  for (let i = 0; i < count - reviews; i++) {
    const topic = order[i % order.length]!;
    const entries = Object.entries(GENERATORS[topic][level]).filter(([name]) => available(`${topic}.${name}`, version));
    questions.push(make(topic, false, () => {
      const [name, generator] = rng.pick(entries);
      return [`${topic}.${name}`, generator];
    }));
  }
  return rng.shuffle(questions);
}

/** Number of right answers; an answer is an option index, or -1 when left blank. */
export function gradeQuiz(questions: Question[], answers: number[]): number {
  return questions.reduce((n, q, i) => n + (answers[i] === q.correct ? 1 : 0), 0);
}
