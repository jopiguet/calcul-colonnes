/**
 * The question bank file read by `npm run quiz:import` (docs/question-bank.md):
 *
 * {
 *   "format": 1,
 *   "book": { "id": "atkins-12", "title": "Atkins' Physical Chemistry, 12th edition", "source": "Atkins" },
 *   "units": [ { "id": "1A", "topic": "gases", "title": { "en": "The perfect gas" } } ],
 *   "questions": [
 *     { "id": "1A-01", "unit": "1A", "section": "1A.2",
 *       "prompt": { "en": "…" }, "correct": { "en": "…" },
 *       "wrong": [ { "en": "…" }, { "en": "…" }, { "en": "…" } ],
 *       "explanation": { "en": "…" } } ]
 * }
 *
 * A question may say "level": "advanced" (reasoning and derivations, the
 * advanced test); without it, it is "core".
 *
 * Every text is an object by language: "en" is required, "fr" and "es" may be
 * added later without changing anything else. Inline formulas go between $…$.
 */
import { BANK_LEVELS, type Bank, type BankLevel, type BankQuestion, type BankUnit } from "./bank";
import { CHEMISTRY_TOPICS, type ChemistryTopic, type Localized } from "./types";

export interface BankFile {
  book: { id: string; title: string; source: string };
  units: BankUnit[];
  questions: Omit<BankQuestion, "topic" | "from" | "until">[];
}

const LANGS = ["en", "fr", "es"];

function localizedText(value: unknown, where: string): Localized {
  if (typeof value !== "object" || value === null || Array.isArray(value)) throw new Error(`${where}: a text must be an object {"en": "…"}`);
  const out: Record<string, string> = {};
  for (const [lang, text] of Object.entries(value)) {
    if (!LANGS.includes(lang)) throw new Error(`${where}: unknown language "${lang}" (en, fr, es)`);
    if (typeof text !== "string" || !text.trim() || text.length > 1500) throw new Error(`${where}: "${lang}" must be a text of at most 1500 characters`);
    if ((text.match(/\$/g) ?? []).length % 2 !== 0) throw new Error(`${where}: "${lang}" has an unclosed $…$ formula`);
    out[lang] = text.trim();
  }
  if (!out.en) throw new Error(`${where}: "en" is required`);
  return out as Localized;
}

const text = (value: unknown, max: number): string | null =>
  typeof value === "string" && value.trim() && value.length <= max ? value.trim() : null;

/** Validates a parsed bank file; throws with the place of the first problem. */
export function parseBankFile(data: unknown): BankFile {
  const root = (data ?? {}) as Record<string, unknown>;
  if (root.format !== 1) throw new Error('unsupported file: "format" must be 1');
  const b = (root.book ?? {}) as Record<string, unknown>;
  const id = text(b.id, 60);
  const title = text(b.title, 200);
  const source = text(b.source, 60);
  if (!id || !/^[a-z0-9][a-z0-9-]*$/.test(id)) throw new Error('book: "id" must be lower-case letters, digits and "-"');
  if (!title || !source) throw new Error('book: "title" and "source" are required');
  if (!Array.isArray(root.units) || root.units.length === 0) throw new Error('"units" must be a non-empty list');
  if (!Array.isArray(root.questions) || root.questions.length === 0) throw new Error('"questions" must be a non-empty list');

  const units: BankUnit[] = root.units.map((raw, i) => {
    const u = (raw ?? {}) as Record<string, unknown>;
    const where = `unit ${i + 1}`;
    const unitId = text(u.id, 20);
    if (!unitId || !/^[0-9A-Za-z]+$/.test(unitId)) throw new Error(`${where}: "id" must be letters and digits ("1A")`);
    if (!CHEMISTRY_TOPICS.includes(u.topic as ChemistryTopic)) throw new Error(`${where}: "topic" must be one of ${CHEMISTRY_TOPICS.join(", ")}`);
    return { id: unitId, topic: u.topic as ChemistryTopic, title: localizedText(u.title, where) };
  });
  const unitIds = new Set(units.map((u) => u.id));
  if (unitIds.size !== units.length) throw new Error("two units with the same id");

  const seen = new Set<string>();
  const questions = root.questions.map((raw, i) => {
    const q = (raw ?? {}) as Record<string, unknown>;
    const qid = text(q.id, 40);
    const where = `question ${i + 1}${qid ? ` (${qid})` : ""}`;
    if (!qid || !/^[0-9A-Za-z][0-9A-Za-z.-]*$/.test(qid)) throw new Error(`${where}: "id" must be letters, digits, "." and "-"`);
    if (seen.has(qid)) throw new Error(`${where}: id used twice`);
    seen.add(qid);
    const unit = text(q.unit, 20);
    if (!unit || !unitIds.has(unit)) throw new Error(`${where}: "unit" must be one of the units`);
    const level = q.level ?? "core";
    if (!BANK_LEVELS.includes(level as BankLevel)) throw new Error(`${where}: "level" must be "core" or "advanced"`);
    const section = text(q.section, 30);
    if (!section) throw new Error(`${where}: "section" is required ("1A.2")`);
    if (!Array.isArray(q.wrong) || q.wrong.length !== 3) throw new Error(`${where}: "wrong" must hold exactly three answers`);
    const correct = localizedText(q.correct, `${where}, correct`);
    const wrong = q.wrong.map((w, k) => localizedText(w, `${where}, wrong ${k + 1}`));
    const answers = [correct, ...wrong].map((a) => a.en.toLowerCase());
    if (new Set(answers).size !== 4) throw new Error(`${where}: two answers are the same`);
    return {
      id: qid,
      unit,
      level: level as BankLevel,
      section,
      prompt: localizedText(q.prompt, `${where}, prompt`),
      correct,
      wrong,
      explanation: localizedText(q.explanation, `${where}, explanation`),
    };
  });
  return { book: { id, title, source }, units, questions };
}

/** A file as a bank at one revision, every question available from it (tests and checks). */
export function toBank(file: BankFile, revision: number): Bank {
  const topicOf = new Map(file.units.map((u) => [u.id, u.topic]));
  return {
    revision,
    source: file.book.source,
    units: file.units,
    questions: file.questions.map((q) => ({ ...q, topic: topicOf.get(q.unit)!, from: revision })),
  };
}
