/**
 * Vocabulary: storage, import, sessions and answers.
 *
 * The content (lessons, sections, entries) is shared by every account of the
 * server. Progress is per player: one Leitner box per entry and direction.
 */
import { Hono } from "hono";
import type { Database, Row } from "./db/index.ts";
import type { AppEnv } from "./auth/middleware.ts";
import type { Repository, Scope } from "./repository.ts";
import { COUNTS_AS_RIGHT, display, grade, normalise } from "../shared/vocab/grade.ts";
import type { VocabFile } from "../shared/vocab/format.ts";
import { entryStatus, nextState, type CardState, type Direction, type ModePreference } from "../shared/vocab/schedule.ts";
import { buildSession, progressKey, sides, type ProgressMap, type SessionEntry, type SessionPurpose } from "../shared/vocab/session.ts";
import type {
  VocabAnswer,
  VocabAnswerResult,
  VocabLessonInfo,
  VocabProgress,
  VocabSectionProgress,
} from "../shared/types.ts";

const n = (value: unknown): number => Number(value);

function toEntry(row: Row): SessionEntry {
  return {
    id: n(row.id),
    sectionId: n(row.section_id),
    position: n(row.position),
    en: String(row.en),
    es: String(row.es),
    group: String(row.grp ?? ""),
    feminine: n(row.feminine) === 1,
  };
}

export interface ImportReport {
  lessons: number;
  sections: number;
  entries: number;
  added: number;
  removed: number;
}

export class VocabStore {
  constructor(private readonly db: Database) {}

  async isEmpty(): Promise<boolean> {
    const rows = await this.db.query("SELECT COUNT(*) AS n FROM vocab_entries");
    return n(rows[0]?.n) === 0;
  }

  /**
   * Replaces the content with the file's, keeping the ids (and so the
   * players' progress) of entries that are unchanged: same lesson and section
   * position, same English and Spanish text. Entries no longer in the file are
   * removed with their progress. All in one transaction.
   */
  async import(file: VocabFile): Promise<ImportReport> {
    return this.db.transaction(async (tx) => {
      const report: ImportReport = { lessons: 0, sections: 0, entries: 0, added: 0, removed: 0 };
      const lessonIds: number[] = [];
      for (const [l, lesson] of file.lessons.entries()) {
        const found = await tx.query("SELECT id FROM vocab_lessons WHERE position = $1", [l]);
        let lessonId: number;
        if (found[0]) {
          lessonId = n(found[0].id);
          await tx.query("UPDATE vocab_lessons SET title_en = $1, title_es = $2 WHERE id = $3", [
            lesson.title.en, lesson.title.es, lessonId,
          ]);
        } else {
          const inserted = await tx.query(
            "INSERT INTO vocab_lessons (position, title_en, title_es) VALUES ($1, $2, $3) RETURNING id",
            [l, lesson.title.en, lesson.title.es],
          );
          lessonId = n(inserted[0]!.id);
        }
        lessonIds.push(lessonId);
        report.lessons++;

        for (const [s, section] of lesson.sections.entries()) {
          const existing = await tx.query("SELECT id FROM vocab_sections WHERE lesson_id = $1 AND position = $2", [lessonId, s]);
          let sectionId: number;
          if (existing[0]) {
            sectionId = n(existing[0].id);
            await tx.query("UPDATE vocab_sections SET title_en = $1, title_es = $2 WHERE id = $3", [
              section.title.en, section.title.es, sectionId,
            ]);
          } else {
            const inserted = await tx.query(
              "INSERT INTO vocab_sections (lesson_id, position, title_en, title_es) VALUES ($1, $2, $3, $4) RETURNING id",
              [lessonId, s, section.title.en, section.title.es],
            );
            sectionId = n(inserted[0]!.id);
          }
          report.sections++;

          // Entries matched by their text; the first match wins for duplicates.
          const rows = await tx.query(
            "SELECT id, en, es, position, grp, feminine FROM vocab_entries WHERE section_id = $1 ORDER BY position",
            [sectionId],
          );
          const free = new Map<string, Row[]>();
          for (const row of rows) {
            const key = `${row.en}\u0000${row.es}`;
            free.set(key, [...(free.get(key) ?? []), row]);
          }
          // New entries go in one statement per section: a few hundred round
          // trips for a whole book, which matters on a remote database (Neon).
          const fresh: (string | number)[][] = [];
          for (const [e, entry] of section.entries.entries()) {
            const key = `${entry.en}\u0000${entry.es}`;
            const row = free.get(key)?.shift();
            const values = [e, entry.group ?? "", entry.feminine ? 1 : 0] as const;
            if (row) {
              const same = n(row.position) === values[0] && String(row.grp) === values[1] && n(row.feminine) === values[2];
              if (!same) {
                await tx.query("UPDATE vocab_entries SET position = $1, grp = $2, feminine = $3 WHERE id = $4", [...values, n(row.id)]);
              }
            } else {
              fresh.push([sectionId, e, entry.en, entry.es, values[1], values[2]]);
            }
            report.entries++;
          }
          if (fresh.length > 0) {
            const placeholders = fresh.map((_, i) => `($${i * 6 + 1}, $${i * 6 + 2}, $${i * 6 + 3}, $${i * 6 + 4}, $${i * 6 + 5}, $${i * 6 + 6})`);
            await tx.query(
              `INSERT INTO vocab_entries (section_id, position, en, es, grp, feminine) VALUES ${placeholders.join(", ")}`,
              fresh.flat(),
            );
            report.added += fresh.length;
          }
          for (const left of free.values()) {
            for (const row of left) {
              await tx.query("DELETE FROM vocab_entries WHERE id = $1", [n(row.id)]);
              report.removed++;
            }
          }
        }
        const gone = await tx.query("SELECT COUNT(*) AS n FROM vocab_entries WHERE section_id IN (SELECT id FROM vocab_sections WHERE lesson_id = $1 AND position >= $2)", [lessonId, lesson.sections.length]);
        report.removed += n(gone[0]?.n);
        await tx.query("DELETE FROM vocab_sections WHERE lesson_id = $1 AND position >= $2", [lessonId, lesson.sections.length]);
      }
      const gone = await tx.query(
        "SELECT COUNT(*) AS n FROM vocab_entries WHERE section_id IN (SELECT s.id FROM vocab_sections s JOIN vocab_lessons l ON l.id = s.lesson_id WHERE l.position >= $1)",
        [file.lessons.length],
      );
      report.removed += n(gone[0]?.n);
      await tx.query("DELETE FROM vocab_lessons WHERE position >= $1", [file.lessons.length]);
      return report;
    });
  }

  async lessons(): Promise<VocabLessonInfo[]> {
    const lessons = await this.db.query("SELECT id, title_en, title_es FROM vocab_lessons ORDER BY position");
    const sections = await this.db.query(
      `SELECT s.id, s.lesson_id, s.title_en, s.title_es, COUNT(e.id) AS entries
         FROM vocab_sections s LEFT JOIN vocab_entries e ON e.section_id = s.id
        GROUP BY s.id, s.lesson_id, s.title_en, s.title_es, s.position
        ORDER BY s.position`,
    );
    return lessons.map((l) => ({
      id: n(l.id),
      title: { en: String(l.title_en), es: String(l.title_es) },
      sections: sections
        .filter((s) => n(s.lesson_id) === n(l.id))
        .map((s) => ({ id: n(s.id), title: { en: String(s.title_en), es: String(s.title_es) }, entries: n(s.entries) })),
    }));
  }

  private async entries(where: string, params: (number | string)[]): Promise<SessionEntry[]> {
    const rows = await this.db.query(
      `SELECT e.id, e.section_id, e.position, e.en, e.es, e.grp, e.feminine
         FROM vocab_entries e JOIN vocab_sections s ON s.id = e.section_id
        WHERE ${where}
        ORDER BY s.position, e.position`,
      params,
    );
    return rows.map(toEntry);
  }

  async getEntry(id: number): Promise<SessionEntry | null> {
    const rows = await this.db.query("SELECT id, section_id, position, en, es, grp, feminine FROM vocab_entries WHERE id = $1", [id]);
    return rows[0] ? toEntry(rows[0]) : null;
  }

  private async progress(userId: number): Promise<ProgressMap> {
    const rows = await this.db.query("SELECT entry_id, direction, box, due_at, last_at FROM vocab_progress WHERE user_id = $1", [userId]);
    const map: ProgressMap = new Map();
    for (const row of rows) {
      map.set(progressKey(n(row.entry_id), row.direction as Direction), {
        box: n(row.box),
        dueAt: n(row.due_at),
        lastAt: n(row.last_at),
      });
    }
    return map;
  }

  async summary(userId: number, now: number, since: number): Promise<VocabProgress> {
    const progress = await this.progress(userId);
    const rows = await this.db.query("SELECT id, section_id FROM vocab_entries");
    const sections: Record<number, VocabSectionProgress> = {};
    let due = 0;
    for (const row of rows) {
      const id = n(row.id);
      const section = (sections[n(row.section_id)] ??= { new: 0, learning: 0, known: 0, mastered: 0, due: 0 });
      const recognise = progress.get(progressKey(id, "recognise"));
      const recall = progress.get(progressKey(id, "recall"));
      section[entryStatus(recognise?.box ?? 0, recall?.box ?? 0)]++;
      for (const card of [recognise, recall]) {
        if (card && card.dueAt <= now) {
          section.due++;
          due++;
        }
      }
    }
    const today = await this.db.query(
      "SELECT COUNT(*) AS answers, COALESCE(SUM(correct), 0) AS right_answers FROM vocab_answers WHERE user_id = $1 AND at >= $2",
      [userId, since],
    );
    return { sections, due, today: { answers: n(today[0]?.answers), right: n(today[0]?.right_answers) } };
  }

  async session(
    userId: number,
    target: { kind: "section" | "lesson" | "all"; id: number },
    purpose: SessionPurpose,
    size: number,
    preference: ModePreference,
    now: number,
  ) {
    // The whole vocabulary: only the entries the session can use, not all 3,000.
    const entries =
      target.kind === "section"
        ? await this.entries("e.section_id = $1", [target.id])
        : target.kind === "lesson"
          ? await this.entries("s.lesson_id = $1", [target.id])
          : purpose === "due"
            ? await this.entries("e.id IN (SELECT entry_id FROM vocab_progress WHERE user_id = $1 AND due_at <= $2)", [userId, now])
            : purpose === "review"
              ? await this.entries("e.id IN (SELECT entry_id FROM vocab_progress WHERE user_id = $1)", [userId])
              : await this.entries("1 = 1", []);
    // Wrong options come from the same lessons.
    const lessonIds = [...new Set((await this.db.query(
      "SELECT DISTINCT s.lesson_id FROM vocab_sections s WHERE s.id IN (" +
        ([...new Set(entries.map((e) => e.sectionId))].join(",") || "0") + ")",
    )).map((r) => n(r.lesson_id)))];
    const pool = lessonIds.length
      ? await this.entries(`s.lesson_id IN (${lessonIds.map((id) => Number(id)).join(",")})`, [])
      : [];
    return buildSession({
      entries,
      pool,
      progress: await this.progress(userId),
      now,
      size,
      preference,
      purpose,
      random: Math.random,
    });
  }

  async answer(answer: VocabAnswer, now: number): Promise<VocabAnswerResult | null> {
    const entry = await this.getEntry(answer.entryId);
    if (!entry) return null;
    const { answer: expected } = sides(entry, answer.direction);
    const lang = answer.direction === "recognise" ? "en" : "es";
    // A multiple-choice answer is one of the printed options: compare as printed.
    const verdict =
      answer.mode === "choice"
        ? normalise(answer.given) === normalise(display(expected)) ? "right" : "wrong"
        : grade(answer.given, expected, lang);
    const correct = COUNTS_AS_RIGHT.has(verdict);

    const rows = await this.db.query(
      "SELECT box, due_at FROM vocab_progress WHERE user_id = $1 AND entry_id = $2 AND direction = $3",
      [answer.userId, entry.id, answer.direction],
    );
    const previous: CardState | null = rows[0] ? { box: n(rows[0].box), dueAt: n(rows[0].due_at) } : null;
    const next = nextState(previous, correct, now);
    if (previous) {
      await this.db.query(
        `UPDATE vocab_progress SET box = $1, due_at = $2, last_at = $3,
                right_count = right_count + $4, wrong_count = wrong_count + $5
          WHERE user_id = $6 AND entry_id = $7 AND direction = $8`,
        [next.box, next.dueAt, now, correct ? 1 : 0, correct ? 0 : 1, answer.userId, entry.id, answer.direction],
      );
    } else {
      await this.db.query(
        `INSERT INTO vocab_progress (user_id, entry_id, direction, box, due_at, last_at, right_count, wrong_count)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [answer.userId, entry.id, answer.direction, next.box, next.dueAt, now, correct ? 1 : 0, correct ? 0 : 1],
      );
    }
    await this.db.query(
      "INSERT INTO vocab_answers (user_id, entry_id, direction, mode, at, given, verdict, correct) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)",
      [answer.userId, entry.id, answer.direction, answer.mode, now, answer.given.slice(0, 300), verdict, correct ? 1 : 0],
    );
    return {
      verdict,
      correct,
      expected: display(expected),
      feminine: answer.direction === "recall" && entry.feminine,
      box: next.box,
      dueAt: next.dueAt,
    };
  }
}

// ------------------------------------------------------------------- routes

const isId = (v: unknown): v is number => typeof v === "number" && Number.isInteger(v) && v > 0;
const PREFERENCES: ModePreference[] = ["mixed", "choice", "written"];
export const MAX_SESSION = 60;
const PURPOSES: SessionPurpose[] = ["learn", "review", "due"];

export function vocabRoutes(store: VocabStore, repository: Repository, scope: (c: never) => Scope): Hono<AppEnv> {
  const routes = new Hono<AppEnv>();
  const allowed = async (c: unknown, userId: number): Promise<boolean> =>
    Boolean(await repository.getUser(userId, scope(c as never)));

  routes.get("/lessons", async (c) => c.json(await store.lessons()));

  routes.get("/progress", async (c) => {
    const userId = Number(c.req.query("userId"));
    const since = Number(c.req.query("since") ?? 0);
    if (!isId(userId) || !Number.isFinite(since) || since < 0) return c.json({ error: "invalid query" }, 400);
    if (!(await allowed(c, userId))) return c.json({ error: "unknown user" }, 404);
    return c.json(await store.summary(userId, Date.now(), Math.trunc(since)));
  });

  routes.get("/session", async (c) => {
    const userId = Number(c.req.query("userId"));
    // kind=due, from 4.2: the whole vocabulary, cards due.
    const legacyDue = c.req.query("kind") === "due";
    const kind = legacyDue ? "all" : c.req.query("kind");
    const purpose = (legacyDue ? "due" : (c.req.query("purpose") ?? "learn")) as SessionPurpose;
    const id = Number(c.req.query("id") ?? 0);
    const size = Number(c.req.query("size") ?? 20);
    const mode = (c.req.query("mode") ?? "mixed") as ModePreference;
    if (
      !isId(userId) ||
      (kind !== "section" && kind !== "lesson" && kind !== "all") ||
      (kind !== "all" && !isId(id)) ||
      !PURPOSES.includes(purpose) ||
      !Number.isInteger(size) || size < 1 || size > MAX_SESSION ||
      !PREFERENCES.includes(mode)
    ) {
      return c.json({ error: "invalid session" }, 400);
    }
    if (!(await allowed(c, userId))) return c.json({ error: "unknown user" }, 404);
    return c.json(await store.session(userId, { kind, id }, purpose, size, mode, Date.now()));
  });

  routes.post("/answers", async (c) => {
    const body = ((await c.req.json().catch(() => null)) ?? {}) as Record<string, unknown>;
    const answer: VocabAnswer = {
      userId: body.userId as number,
      entryId: body.entryId as number,
      direction: body.direction as VocabAnswer["direction"],
      mode: body.mode as VocabAnswer["mode"],
      given: typeof body.given === "string" ? body.given : "",
    };
    if (
      !isId(answer.userId) || !isId(answer.entryId) ||
      (answer.direction !== "recognise" && answer.direction !== "recall") ||
      (answer.mode !== "choice" && answer.mode !== "written") ||
      answer.given.length > 300
    ) {
      return c.json({ error: "invalid answer" }, 400);
    }
    if (!(await allowed(c, answer.userId))) return c.json({ error: "unknown user" }, 404);
    const result = await store.answer(answer, Date.now());
    return result ? c.json(result, 201) : c.json({ error: "unknown entry" }, 404);
  });

  return routes;
}
