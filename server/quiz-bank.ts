/**
 * The question bank on the server: import from a bank file, load into the
 * test engine, flags. See shared/quiz/bank.ts and docs/question-bank.md.
 */
import { Hono } from "hono";
import type { Database, Row } from "./db/index.ts";
import type { AppEnv } from "./auth/middleware.ts";
import type { Repository, Scope } from "./repository.ts";
import { bankRevision, registerBank, EMPTY_BANK, isSkill, type Bank, type BankQuestion, type ChemistryTopic, type Localized } from "../shared/quiz/index.ts";
import type { BankFile } from "../shared/quiz/bank-file.ts";

const n = (v: unknown): number => Number(v);
const json = <T>(v: unknown): T => JSON.parse(String(v)) as T;

/** An import that would mix two books, move a unit to another topic or bring back a removed id: nothing changed. */
export class BankImportRefused extends Error {}

export interface BankImportReport {
  book: string;
  revision: number;
  units: number;
  questions: number;
  added: number;
  updated: number;
  removed: number;
}

export class BankStore {
  constructor(private readonly db: Database) {}

  async revision(): Promise<number> {
    const rows = await this.db.query("SELECT value FROM quiz_bank_meta WHERE key = 'revision'");
    return rows[0] ? n(rows[0].value) : 0;
  }

  /** The whole bank, removed questions included (old tests are rebuilt from them). */
  async load(): Promise<Bank> {
    const meta = new Map((await this.db.query("SELECT key, value FROM quiz_bank_meta")).map((r) => [String(r.key), String(r.value)]));
    const revision = Number(meta.get("revision") ?? 0);
    if (revision === 0) return EMPTY_BANK;
    const units = (await this.db.query("SELECT id, topic, title FROM quiz_bank_units ORDER BY position")).map((r) => ({
      id: String(r.id),
      topic: String(r.topic) as ChemistryTopic,
      title: json<Localized>(r.title),
    }));
    const topicOf = new Map(units.map((u) => [u.id, u.topic]));
    const questions = (await this.db.query("SELECT * FROM quiz_bank ORDER BY position")).map(
      (r: Row): BankQuestion => ({
        id: String(r.id),
        unit: String(r.unit),
        topic: topicOf.get(String(r.unit))!,
        level: String(r.level) === "advanced" ? "advanced" : "core",
        section: String(r.section),
        prompt: json(r.prompt),
        correct: json(r.correct),
        wrong: json(r.wrong),
        explanation: json(r.explanation),
        from: n(r.from_revision),
        ...(r.until_revision === null || r.until_revision === undefined ? {} : { until: n(r.until_revision) }),
      }),
    );
    return { revision, source: meta.get("source") ?? "", units, questions };
  }

  /** Registers the bank with the test engine when the database has a newer revision. */
  async refresh(): Promise<void> {
    if ((await this.revision()) !== bankRevision()) registerBank(await this.load());
  }

  /**
   * Replaces the bank's content with the file's, in one transaction. New
   * questions are available from the next revision; those no longer in the
   * file are kept, removed from it; changed texts are updated in place. A file
   * identical to the bank changes nothing, not even the revision.
   */
  async import(file: BankFile, options: { replace?: boolean } = {}): Promise<BankImportReport> {
    return this.db.transaction(async (tx) => {
      const meta = new Map((await tx.query("SELECT key, value FROM quiz_bank_meta")).map((r) => [String(r.key), String(r.value)]));
      const current = Number(meta.get("revision") ?? 0);
      const next = current + 1;
      if (meta.get("book") && meta.get("book") !== file.book.id && !options.replace) {
        throw new BankImportRefused(
          `the bank holds the book "${meta.get("book")}", this file is "${file.book.id}": not imported. To replace that book's questions, add --replace.`,
        );
      }
      const units = new Map((await tx.query("SELECT id, topic, title, position FROM quiz_bank_units")).map((r) => [String(r.id), r]));
      for (const u of file.units) {
        const known = units.get(u.id);
        if (known && String(known.topic) !== u.topic && !options.replace) {
          throw new BankImportRefused(`unit ${u.id} is in "${String(known.topic)}", the file puts it in "${u.topic}": not imported (its tests would change).`);
        }
      }
      const rows = new Map((await tx.query("SELECT * FROM quiz_bank")).map((r) => [String(r.id), r]));
      let changed = false;
      const report: BankImportReport = { book: file.book.id, revision: current, units: file.units.length, questions: file.questions.length, added: 0, updated: 0, removed: 0 };

      for (const [position, u] of file.units.entries()) {
        const known = units.get(u.id);
        const title = JSON.stringify(u.title);
        if (!known) {
          await tx.query("INSERT INTO quiz_bank_units (id, topic, position, title) VALUES ($1, $2, $3, $4)", [u.id, u.topic, position, title]);
          changed = true;
        } else if (String(known.title) !== title || n(known.position) !== position || String(known.topic) !== u.topic) {
          await tx.query("UPDATE quiz_bank_units SET topic = $1, position = $2, title = $3 WHERE id = $4", [u.topic, position, title, u.id]);
          changed = true;
        }
      }

      const inFile = new Set<string>();
      for (const [position, q] of file.questions.entries()) {
        inFile.add(q.id);
        const values = [q.unit, q.level, q.section, position, JSON.stringify(q.prompt), JSON.stringify(q.correct), JSON.stringify(q.wrong), JSON.stringify(q.explanation)];
        const row = rows.get(q.id);
        if (!row) {
          await tx.query(
            `INSERT INTO quiz_bank (id, unit, level, section, position, prompt, correct, wrong, explanation, from_revision)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
            [q.id, ...values, next],
          );
          report.added++;
          changed = true;
          continue;
        }
        if (row.until_revision !== null && row.until_revision !== undefined) {
          throw new BankImportRefused(`question ${q.id} was removed in revision ${n(row.until_revision)}: give it a new id to bring it back.`);
        }
        if (String(row.unit) !== q.unit) {
          throw new BankImportRefused(`question ${q.id} moves from unit ${String(row.unit)} to ${q.unit}: give it a new id (its old tests would change).`);
        }
        if (String(row.level) !== q.level) {
          throw new BankImportRefused(`question ${q.id} moves from level ${String(row.level)} to ${q.level}: give it a new id (its old tests would change).`);
        }
        const before = [row.unit, row.level, row.section, n(row.position), row.prompt, row.correct, row.wrong, row.explanation].map(String);
        if (before.join("\u0000") !== values.map(String).join("\u0000")) {
          await tx.query(
            `UPDATE quiz_bank SET unit = $1, level = $2, section = $3, position = $4, prompt = $5, correct = $6, wrong = $7, explanation = $8 WHERE id = $9`,
            [...values, q.id],
          );
          report.updated++;
          changed = true;
        }
      }
      for (const [id, row] of rows) {
        if (inFile.has(id) || (row.until_revision !== null && row.until_revision !== undefined)) continue;
        await tx.query("UPDATE quiz_bank SET until_revision = $1 WHERE id = $2", [next, id]);
        report.removed++;
        changed = true;
      }
      for (const [key, value] of [["book", file.book.id], ["title", file.book.title], ["source", file.book.source]] as const) {
        if (meta.get(key) !== value) changed = true;
      }
      if (!changed) return report;
      for (const [key, value] of [["book", file.book.id], ["title", file.book.title], ["source", file.book.source], ["revision", String(next)]] as const) {
        await tx.query("DELETE FROM quiz_bank_meta WHERE key = $1", [key]);
        await tx.query("INSERT INTO quiz_bank_meta (key, value) VALUES ($1, $2)", [key, value]);
      }
      report.revision = next;
      return report;
    });
  }

  async flag(userId: number, skill: string, question: string, note: string, at: number): Promise<void> {
    await this.db.query("INSERT INTO quiz_flags (user_id, at, skill, question, note) VALUES ($1, $2, $3, $4, $5)", [userId, at, skill, question, note]);
  }

  async openFlags(): Promise<{ id: number; at: number; user: string; skill: string; question: string; note: string }[]> {
    const rows = await this.db.query(
      `SELECT f.id, f.at, u.name, f.skill, f.question, f.note FROM quiz_flags f JOIN users u ON u.id = f.user_id
        WHERE f.resolved = 0 ORDER BY f.at`,
    );
    return rows.map((r) => ({ id: n(r.id), at: n(r.at), user: String(r.name), skill: String(r.skill), question: String(r.question), note: String(r.note) }));
  }

  async resolveFlag(id: number): Promise<boolean> {
    const rows = await this.db.query("UPDATE quiz_flags SET resolved = 1 WHERE id = $1 AND resolved = 0 RETURNING id", [id]);
    return rows.length > 0;
  }
}

// ------------------------------------------------------------------- routes

const isId = (v: unknown): v is number => typeof v === "number" && Number.isInteger(v) && v > 0;
export const FLAG_NOTE_MAX = 500;
export const FLAG_QUESTION_MAX = 2000;

export function bankRoutes(bank: BankStore, repository: Repository, scope: (c: never) => Scope): Hono<AppEnv> {
  const routes = new Hono<AppEnv>();

  /** The bank for the browser: it generates the tests too. */
  routes.get("/bank", async (c) => {
    await bank.refresh();
    return c.json(await bank.load());
  });

  /** A question flagged from the corrections. */
  routes.post("/flags", async (c) => {
    await bank.refresh(); // the bank's kinds of question are known once it is loaded
    const body = ((await c.req.json().catch(() => null)) ?? {}) as Record<string, unknown>;
    const { userId, skill, question } = body;
    const note = typeof body.note === "string" ? body.note.trim() : "";
    if (
      !isId(userId) || typeof skill !== "string" || !isSkill(skill) ||
      typeof question !== "string" || !question || question.length > FLAG_QUESTION_MAX || note.length > FLAG_NOTE_MAX
    ) {
      return c.json({ error: "invalid flag" }, 400);
    }
    if (!(await repository.getUser(userId, scope(c as never)))) return c.json({ error: "unknown user" }, 404);
    await bank.flag(userId, skill, question, note, Date.now());
    return c.body(null, 204);
  });

  return routes;
}
