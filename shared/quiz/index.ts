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
import { probability } from "./probability";
import { sequences } from "./sequences";
import { complex } from "./complex";
import { odes } from "./odes";
import { linear } from "./linear";
import { functions } from "./functions";
import { geometry } from "./geometry";
import { graphs } from "./graphs";
import { multivariable } from "./multivariable";
import { series } from "./series";
import { gases } from "./gases";
import { linuxFiles, linuxText, linuxShell, linuxProcesses, linuxSystem, linuxNetwork, linuxTools } from "./linux";
import { firstLaw } from "./firstlaw";
import { secondLaw } from "./secondlaw";
import { phases } from "./phases";
import { mixtures } from "./mixtures";
import { equilibrium } from "./equilibrium";
import { EMPTY_BANK, bankLevelOf, bankSkills, type Bank, type BankLevel } from "./bank";
import { TOPICS, type Draft, type Generator, type Level, type Option, type Question, type Topic, type Verify } from "./types";

export * from "./types";
export * from "./progress";
export * from "./typed";
export * from "./bank";
export * from "./rich";

const GENERATORS: Record<Topic, Partial<Record<Level, Record<string, Generator>>>> = {
  derivatives,
  integrals,
  trigonometry,
  limits,
  explog,
  probability,
  sequences,
  complex,
  odes,
  linear,
  functions,
  geometry,
  series,
  multivariable,
  graphs,
  gases,
  firstLaw,
  secondLaw,
  phases,
  mixtures,
  equilibrium,
  linuxFiles,
  linuxText,
  linuxShell,
  linuxProcesses,
  linuxSystem,
  linuxNetwork,
  linuxTools,
};

/** Every kind of question, by id ("topic.name"). */
const SKILLS = new Map<string, { topic: Topic; generator: Generator; levels: Level[] }>();
for (const [topic, byLevel] of Object.entries(GENERATORS) as [Topic, Partial<Record<Level, Record<string, Generator>>>][]) {
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

/** The question bank registered here (the browser fetches it, the server loads it). */
let bank: Bank = EMPTY_BANK;

/** Makes a bank's questions part of the tests: call before generating one that uses it. */
export function registerBank(next: Bank): void {
  bank = next;
}

export const bankRevision = (): number => bank.revision;
/** The registered bank (its units name the bank's kinds of question). */
export const currentBank = (): Bank => bank;

/** The bank's kinds of question at a revision (and level), by id. */
function bankKinds(revision: number, level?: BankLevel): Map<string, { topic: Topic; generator: Generator }> {
  return new Map(bankSkills(bank, revision, level).map((k) => [k.id, { topic: k.topic, generator: k.draw }]));
}

export const isSkill = (id: string): boolean => SKILLS.has(id) || bankKinds(bank.revision).has(id);
export const skillTopic = (id: string): Topic | undefined => SKILLS.get(id)?.topic ?? bankKinds(bank.revision).get(id)?.topic;

/** Topics with at least one kind of question at this level (some exist at one level only). */
export function topicsFor(level: Level, version = QUIZ_VERSION): Topic[] {
  return TOPICS.filter((topic) => skillsFor(level, [topic], version).length > 0);
}

/** Kinds of question a test with this level and these topics can contain (the bank's at its current revision). */
export function skillsFor(level: Level, topics: Topic[], version = QUIZ_VERSION, revision = bank.revision): string[] {
  const generated = SKILL_IDS.filter((id) => {
    const skill = SKILLS.get(id)!;
    return topics.includes(skill.topic) && skill.levels.includes(level) && available(id, version);
  });
  const tier = bankLevelOf(level);
  if (tier === null) return generated;
  return [...generated, ...[...bankKinds(revision, tier)].filter(([, k]) => topics.includes(k.topic)).map(([id]) => id)];
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
    case "ode":
    case "tangent":
    case "asymptote":
      return SAMPLES.every((x) => close(a.fn!(x), b.fn!(x), version));
    case "primitive": {
      // Primitives are equal up to a constant.
      const offset = a.fn!(SAMPLES[0]!) - b.fn!(SAMPLES[0]!);
      return SAMPLES.every((x) => close(a.fn!(x) - b.fn!(x), offset, version));
    }
    case "solutions":
      return a.set!.length === b.set!.length && a.set!.every((v, i) => close(v, b.set![i]!, version));
    case "complex":
    case "complexRoot":
      return close(a.z![0], b.z![0], version) && close(a.z![1], b.z![1], version);
    case "crossProduct":
    case "plane":
    case "gradient":
    case "critical":
    case "matrixProduct":
    case "matrixInverse":
    case "linearSolution":
    case "eigenvalues":
      return a.set!.length === b.set!.length && a.set!.every((v, i) => close(v, b.set![i]!, version));
    case "complexRoots":
      return (
        a.zs!.length === b.zs!.length &&
        a.zs!.every((z) => b.zs!.some((w) => close(z[0], w[0], version) && close(z[1], w[1], version)))
      );
    case "choice":
    case "mode":
    case "umask":
      return false; // written answers and permission modes: told apart by their identity (tex), checked above
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
  /** Revision of the question bank the test draws from (the registered bank's when omitted). */
  bank?: number;
}

/** How many review questions a test of `count` questions gets for these kinds. */
export function reviewCount(count: number, focus: string[]): number {
  if (focus.length === 0) return 0;
  return Math.min(Math.max(1, Math.round(count * REVIEW_SHARE)), focus.length * REVIEW_PER_SKILL, count);
}

/** What makes two questions the same: the formula, and for a graph its id (a formula alone is unchanged). */
const promptKey = (prompt: Draft["prompt"]): string => (prompt.id === undefined ? prompt.tex : `${prompt.tex}#${prompt.id}`);

export function generateQuiz({ seed, level, topics: asked, count, focus = [], version = QUIZ_VERSION, bank: revision = bank.revision }: QuizSpec): Question[] {
  const rng = createRng(seed);
  if (revision > bank.revision) throw new Error(`question bank revision ${revision} is not loaded (${bank.revision} is)`);
  const tier = bankLevelOf(level);
  const fromBank = tier !== null ? bankKinds(revision, tier) : new Map<string, { topic: Topic; generator: Generator }>();
  // Topics without a kind of question at this level are left out (every topic
  // of version 2 and before has both levels, so no saved test changes).
  const topics = asked.filter((topic) => skillsFor(level, [topic], version, revision).length > 0);
  if (topics.length === 0) throw new Error(`no topic with questions at level ${level}`);
  // Topics in turn, so that a test covers all the chosen ones evenly.
  const order = rng.shuffle(topics);
  const seen = new Set<string>();
  const questions: Question[] = [];

  const make = (topic: Topic, review: boolean, pick: () => [string, Generator]): Question => {
    let question: Question | null = null;
    for (let attempt = 0; attempt < 50 && !question; attempt++) {
      const [skill, generator] = pick();
      const draft = generator(rng, version);
      if (seen.has(promptKey(draft.prompt)) && attempt < 49) continue; // no repeated question
      question = finalize(rng, version, topic, skill, review, draft);
    }
    if (!question) throw new Error(`could not generate a ${topic} question`);
    seen.add(promptKey(question.prompt));
    return question;
  };

  // Review questions first (only when there is something to review: without focus,
  // the random draws are exactly those of a plain test).
  const kinds = focus.filter((id) => (SKILLS.has(id) && available(id, version)) || fromBank.has(id));
  const reviews = reviewCount(count, kinds);
  const reviewOrder = reviews > 0 ? rng.shuffle(kinds) : [];
  for (let i = 0; i < reviews; i++) {
    const id = reviewOrder[i % reviewOrder.length]!;
    const skill = SKILLS.get(id) ?? fromBank.get(id)!;
    questions.push(make(skill.topic, true, () => [id, skill.generator]));
  }

  for (let i = 0; i < count - reviews; i++) {
    const topic = order[i % order.length]!;
    const entries: [string, Generator][] = [
      ...Object.entries(GENERATORS[topic][level] ?? {})
        .filter(([name]) => available(`${topic}.${name}`, version))
        .map(([name, generator]): [string, Generator] => [`${topic}.${name}`, generator]),
      ...[...fromBank].filter(([, k]) => k.topic === topic).map(([id, k]): [string, Generator] => [id, k.generator]),
    ];
    questions.push(make(topic, false, () => rng.pick(entries)));
  }
  return rng.shuffle(questions);
}

/** Number of right answers; an answer is an option index, or -1 when left blank. */
export function gradeQuiz(questions: Question[], answers: number[]): number {
  return questions.reduce((n, q, i) => n + (answers[i] === q.correct ? 1 : 0), 0);
}
export { LINUX_QUESTIONS, symbolic, triplet } from "./linux";
export type { LinuxQuestion } from "./linux/types";
