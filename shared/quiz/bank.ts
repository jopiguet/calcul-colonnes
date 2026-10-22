/**
 * The question bank: written multiple-choice questions, as opposed to the
 * generated ones. Physical chemistry's conceptual questions come from it.
 *
 * A bank is content, like a vocabulary book: written from a book the user
 * owns, imported into the database (`npm run quiz:import`), never part of the
 * project. The browser and the server both register it (`registerBank`) before
 * generating a test, so a seed gives the same test on both sides.
 *
 * Each question belongs to a unit of its book (Atkins' Topic "1A") and to a
 * test topic ("gases"); the questions of a unit are one kind of question
 * ("gases.concepts1A"), tracked and reviewed like a generated kind.
 *
 * Revisions: every import that changes the bank gives it a new revision. A
 * question is available from the revision that added it, until the one that
 * removed it. A test records the revision it was made at, and is rebuilt from
 * the questions available then: removing a question never changes an old
 * test. A question corrected in place keeps its place, with its new text.
 */
import type { Rng } from "./rng";
import type { ChemistryTopic, Draft, Localized } from "./types";

export interface BankQuestion {
  /** Stable identifier ("1A-03"): an import matches questions by it. */
  id: string;
  /** Unit of the book ("1A"); with the topic, its kind of question. */
  unit: string;
  topic: ChemistryTopic;
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
  topic: ChemistryTopic;
  title: Localized;
}

export interface Bank {
  /** Current revision: 0 for an empty bank. */
  revision: number;
  /** The book, for the source shown with a question ("Atkins 1A.2"). */
  source: string;
  units: BankUnit[];
  questions: BankQuestion[];
}

export const EMPTY_BANK: Bank = { revision: 0, source: "", units: [], questions: [] };

const availableAt = (q: BankQuestion, revision: number): boolean => q.from <= revision && (q.until === undefined || revision < q.until);

/** The kind of question of a unit: "gases.concepts1A". */
export const bankSkill = (topic: ChemistryTopic, unit: string): string => `${topic}.concepts${unit}`;

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
 * The bank's kinds of question at a revision: for each unit with available
 * questions, a generator drawing one of them.
 */
export function bankSkills(bank: Bank, revision: number): { id: string; topic: ChemistryTopic; draw: (rng: Rng) => Draft }[] {
  const byUnit = new Map<string, BankQuestion[]>();
  for (const q of bank.questions) {
    if (!availableAt(q, revision)) continue;
    const key = bankSkill(q.topic, q.unit);
    byUnit.set(key, [...(byUnit.get(key) ?? []), q]);
  }
  // Questions in a fixed order (by id), so the draw does not depend on how the bank was loaded.
  return [...byUnit].map(([id, questions]) => {
    const sorted = [...questions].sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
    return { id, topic: sorted[0]!.topic, draw: (rng: Rng) => bankDraft(rng.pick(sorted), bank.source) };
  });
}

/** Text in a language, English when it is not written in it. */
export const localized = (text: Localized, lang: string): string => (text as Record<string, string | undefined>)[lang] ?? text.en;
