/**
 * The question bank: written multiple-choice questions, as opposed to the
 * generated ones. Physical chemistry's and economics' conceptual questions
 * come from it. It holds several books: each unit belongs to one, and a
 * question shows its book's source ("Atkins 1A.2", "Gruber 7.2").
 *
 * A bank is content, like a vocabulary book: written from a book the user
 * owns, imported into the database (`npm run quiz:import`), never part of the
 * project. The browser and the server both register it (`registerBank`) before
 * generating a test, so a seed gives the same test on both sides.
 *
 * Each question belongs to a unit of its book (Atkins' Topic "1A") and to a
 * test topic ("gases"), at a level: "core" (the chemistry or economics test)
 * or "advanced" (reasoning and derivations, the advanced test). The
 * questions of a unit at a level are one kind of question ("gases.concepts1A",
 * "gases.advanced1A"), tracked and reviewed like a generated kind.
 *
 * Revisions: every import that changes the bank gives it a new revision. A
 * question is available from the revision that added it, until the one that
 * removed it. A test records the revision it was made at, and is rebuilt from
 * the questions available then: removing a question never changes an old
 * test. A question corrected in place keeps its place, with its new text.
 */
import type { Rng } from "./rng";
import { CHEMISTRY_TOPICS, ECON_TOPICS, type ChemistryTopic, type Draft, type EconTopic, type Level, type Localized } from "./types";

export type BankLevel = "core" | "advanced";
export const BANK_LEVELS: BankLevel[] = ["core", "advanced"];
/** The bank level a test level draws from; null for the tests without a bank. */
export const bankLevelOf = (level: Level): BankLevel | null =>
  level === "chemistry" || level === "econ" ? "core" : level === "chemistryAdvanced" || level === "econAdvanced" ? "advanced" : null;

/** The bank topics a test level draws from: a chemistry test never gets an economics unit. */
export const bankTopicsOf = (level: Level): readonly BankTopic[] =>
  level === "chemistry" || level === "chemistryAdvanced" ? CHEMISTRY_TOPICS : level === "econ" || level === "econAdvanced" ? ECON_TOPICS : [];

/** The test topics a bank unit may belong to. */
export type BankTopic = ChemistryTopic | EconTopic;
export const BANK_TOPICS: BankTopic[] = [...CHEMISTRY_TOPICS, ...ECON_TOPICS];

/** A book of the bank: its id, title, and the short name shown with its questions ("Gruber"). */
export interface BankBook {
  id: string;
  title: string;
  source: string;
}

export interface BankQuestion {
  /** Stable identifier ("1A-03"): an import matches questions by it. */
  id: string;
  /** Unit of the book ("1A"); with the topic, its kind of question. */
  unit: string;
  topic: BankTopic;
  level: BankLevel;
  /** Section of the book the question rests on ("1A.2"). */
  section: string;
  prompt: Localized;
  correct: Localized;
  /** Exactly three wrong answers. */
  wrong: Localized[];
  explanation: Localized;
  /** Revision that added it; removed at `until` (absent: still there). */
  from: number;
  until?: number;
}

export interface BankUnit {
  id: string;
  /** The book it comes from (BankBook.id). */
  book: string;
  topic: BankTopic;
  title: Localized;
}

export interface Bank {
  /** Current revision: 0 for an empty bank. */
  revision: number;
  /** The books, for the source shown with a question ("Atkins 1A.2"). */
  books: BankBook[];
  units: BankUnit[];
  questions: BankQuestion[];
}

export const EMPTY_BANK: Bank = { revision: 0, books: [], units: [], questions: [] };

const availableAt = (q: BankQuestion, revision: number): boolean => q.from <= revision && (q.until === undefined || revision < q.until);

/** The kind of question of a unit at a level: "gases.concepts1A", "gases.advanced1A". */
export const bankSkill = (topic: BankTopic, unit: string, level: BankLevel = "core"): string =>
  `${topic}.${level === "core" ? "concepts" : "advanced"}${unit}`;

/** The unit and level of a bank kind of question ("gases.advanced1A" → 1A, advanced). */
export function bankSkillParts(skill: string): { unit: string; level: BankLevel } | null {
  const m = /\.(concepts|advanced)(\w+)$/.exec(skill);
  return m ? { unit: m[2]!, level: m[1] === "concepts" ? "core" : "advanced" } : null;
}

/** A bank question as a draft: its options are its texts, identified by the question's id. */
export function bankDraft(q: BankQuestion, source: string): Draft {
  return {
    prompt: { key: "concept", tex: "", id: q.id, text: q.prompt, source: source ? `${source} ${q.section}` : q.section },
    correct: { tex: `${q.id}:0`, text: q.correct },
    wrong: q.wrong.map((text, i) => ({ tex: `${q.id}:${i + 1}`, text })),
    explanation: { key: "concept", tex: "", text: q.explanation },
    verify: { kind: "choice" },
  };
}

/**
 * The bank's kinds of question at a revision and level (both levels when
 * omitted): for each unit with available questions, a generator drawing one
 * of them.
 */
export function bankSkills(bank: Bank, revision: number, level?: BankLevel): { id: string; topic: BankTopic; draw: (rng: Rng) => Draft }[] {
  const sourceOf = new Map(bank.books.map((b) => [b.id, b.source]));
  const unitSource = new Map(bank.units.map((u) => [u.id, sourceOf.get(u.book) ?? ""]));
  const byUnit = new Map<string, BankQuestion[]>();
  for (const q of bank.questions) {
    if (!availableAt(q, revision) || (level !== undefined && q.level !== level)) continue;
    const key = bankSkill(q.topic, q.unit, q.level);
    byUnit.set(key, [...(byUnit.get(key) ?? []), q]);
  }
  // Questions in a fixed order (by id), so the draw does not depend on how the bank was loaded.
  return [...byUnit].map(([id, questions]) => {
    const sorted = [...questions].sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
    const source = unitSource.get(sorted[0]!.unit) ?? "";
    return { id, topic: sorted[0]!.topic, draw: (rng: Rng) => bankDraft(rng.pick(sorted), source) };
  });
}

/** Text in a language, English when it is not written in it. */
export const localized = (text: Localized, lang: string): string => (text as Record<string, string | undefined>)[lang] ?? text.en;
