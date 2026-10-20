/**
 * Vocabulary: books, storage, import, sessions and answers.
 *
 * The content (books, lessons, sections, entries) is shared by every account
 * of the server. Progress is per player: one Leitner box per entry and
 * direction.
 */
import { Hono } from "hono";
import type { Database, Param, Row } from "./db/index.ts";
import type { AppEnv } from "./auth/middleware.ts";
import type { Repository, Scope } from "./repository.ts";
import { COUNTS_AS_RIGHT, display, grade, normalise, type AnswerLang } from "../shared/vocab/grade.ts";
import type { VocabFile } from "../shared/vocab/format.ts";
import { entryStatus, nextState, type CardState, type Direction, type ModePreference } from "../shared/vocab/schedule.ts";
import {
  buildSession,
  progressKey,
  sides,
  type ProgressMap,
  type SessionEntry,
  type NewOrder,
  type SessionPurpose,
} from "../shared/vocab/session.ts";
import type { VocabAnswer, VocabAnswerResult, VocabBookInfo, VocabProgress, VocabSectionProgress, VocabStats } from "../shared/types.ts";
import { computeStats, type StatsAnswer, type StatsInput } from "../shared/vocab/stats.ts";

const n = (value: unknown): number => Number(value);

/** Entries with their book's kind and languages, for grading and sessions. */
const ENTRY_COLUMNS = `e.id, e.section_id, e.position, e.term, e.meaning, e.grp, e.feminine, e.note, e.reading,
  b.kind, b.term_lang, b.meaning_lang, b.ordering`;
const ENTRY_JOINS = `FROM vocab_entries e
  JOIN vocab_sections s ON s.id = e.section_id
  JOIN vocab_lessons l ON l.id = s.lesson_id
  JOIN vocab_books b ON b.id = l.book_id`;

function toEntry(row: Row): SessionEntry {
  return {
    id: n(row.id),
    sectionId: n(row.section_id),
    position: n(row.position),
    term: String(row.term),
    meaning: String(row.meaning),
    group: String(row.grp ?? ""),
    feminine: n(row.feminine) === 1,
    note: String(row.note ?? ""),
    reading: String(row.reading ?? ""),
    book: {
      kind: row.kind === "definition" ? "definition" : "translation",
      termLang: String(row.term_lang),
      meaningLang: String(row.meaning_lang),
      alphabetical: row.ordering === "alphabetical",
    },
  };
}

/** Grading knows Spanish articles, English "the/a/to" and Japanese rōmaji; other languages are graded as plain text. */
const answerLang = (lang: string): AnswerLang => (lang === "es" || lang === "ja" ? lang : "en");

export interface ImportReport {
  book: string;
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
   * Replaces one book's content with the file's. The book is the one with the
   * file's id, created if new. Entries that did not change (same lesson and
   * section position, same term and meaning) keep their ids, and so the
   * players' progress; entries no longer in the file are removed with their
   * progress. Other books are not touched. All in one transaction.
   */
  async import(file: VocabFile): Promise<ImportReport> {
    return this.db.transaction(async (tx) => {
      const { book } = file;
      const report: ImportReport = { book: book.id, lessons: 0, sections: 0, entries: 0, added: 0, removed: 0 };

      const found = await tx.query("SELECT id FROM vocab_books WHERE slug = $1", [book.id]);
      let bookId: number;
      if (found[0]) {
        bookId = n(found[0].id);
        await tx.query("UPDATE vocab_books SET title = $1, kind = $2, term_lang = $3, meaning_lang = $4, ordering = $5 WHERE id = $6", [
          book.title, book.kind, book.term, book.meaning, book.order ?? "book", bookId,
        ]);
      } else {
        const last = await tx.query("SELECT COALESCE(MAX(position), -1) AS p FROM vocab_books");
        const inserted = await tx.query(
          "INSERT INTO vocab_books (slug, position, title, kind, term_lang, meaning_lang, ordering) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id",
          [book.id, n(last[0]?.p) + 1, book.title, book.kind, book.term, book.meaning, book.order ?? "book"],
        );
        bookId = n(inserted[0]!.id);
      }

      for (const [l, lesson] of file.lessons.entries()) {
        const existing = await tx.query("SELECT id FROM vocab_lessons WHERE book_id = $1 AND position = $2", [bookId, l]);
        let lessonId: number;
        if (existing[0]) {
          lessonId = n(existing[0].id);
          await tx.query("UPDATE vocab_lessons SET title = $1, subtitle = $2 WHERE id = $3", [lesson.title, lesson.subtitle, lessonId]);
        } else {
          const inserted = await tx.query(
            "INSERT INTO vocab_lessons (book_id, position, title, subtitle) VALUES ($1, $2, $3, $4) RETURNING id",
            [bookId, l, lesson.title, lesson.subtitle],
          );
          lessonId = n(inserted[0]!.id);
        }
        report.lessons++;

        for (const [s, section] of lesson.sections.entries()) {
          const present = await tx.query("SELECT id FROM vocab_sections WHERE lesson_id = $1 AND position = $2", [lessonId, s]);
          let sectionId: number;
          if (present[0]) {
            sectionId = n(present[0].id);
            await tx.query("UPDATE vocab_sections SET title = $1, subtitle = $2 WHERE id = $3", [section.title, section.subtitle, sectionId]);
          } else {
            const inserted = await tx.query(
              "INSERT INTO vocab_sections (lesson_id, position, title, subtitle) VALUES ($1, $2, $3, $4) RETURNING id",
              [lessonId, s, section.title, section.subtitle],
            );
            sectionId = n(inserted[0]!.id);
          }
          report.sections++;

          // Entries matched by their text; the first match wins for duplicates.
          const rows = await tx.query(
            "SELECT id, term, meaning, position, grp, feminine, note, reading FROM vocab_entries WHERE section_id = $1 ORDER BY position",
            [sectionId],
          );
          const free = new Map<string, Row[]>();
          for (const row of rows) {
            const key = `${row.term}\u0000${row.meaning}`;
            free.set(key, [...(free.get(key) ?? []), row]);
          }
          // New entries go in one statement per section: a few hundred round
          // trips for a whole book, which matters on a remote database (Neon).
          const fresh: Param[][] = [];
          for (const [e, entry] of section.entries.entries()) {
            const row = free.get(`${entry.term}\u0000${entry.meaning}`)?.shift();
            const values = [e, entry.group ?? "", entry.feminine ? 1 : 0, entry.note ?? "", entry.reading ?? ""] as const;
            if (row) {
              const same =
                n(row.position) === values[0] &&
                String(row.grp) === values[1] &&
                n(row.feminine) === values[2] &&
                String(row.note ?? "") === values[3] &&
                String(row.reading ?? "") === values[4];
              if (!same) {
                await tx.query("UPDATE vocab_entries SET position = $1, grp = $2, feminine = $3, note = $4, reading = $5 WHERE id = $6", [
                  ...values, n(row.id),
                ]);
              }
            } else {
              fresh.push([sectionId, e, entry.term, entry.meaning, values[1], values[2], values[3], values[4]]);
            }
            report.entries++;
          }
          if (fresh.length > 0) {
            const width = 8;
            const placeholders = fresh.map((_, i) => `(${Array.from({ length: width }, (_, k) => `$${i * width + k + 1}`).join(", ")})`);
            await tx.query(
              `INSERT INTO vocab_entries (section_id, position, term, meaning, grp, feminine, note, reading) VALUES ${placeholders.join(", ")}`,
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
        const gone = await tx.query(
          "SELECT COUNT(*) AS n FROM vocab_entries WHERE section_id IN (SELECT id FROM vocab_sections WHERE lesson_id = $1 AND position >= $2)",
          [lessonId, lesson.sections.length],
        );
        report.removed += n(gone[0]?.n);
        await tx.query("DELETE FROM vocab_sections WHERE lesson_id = $1 AND position >= $2", [lessonId, lesson.sections.length]);
      }
      const gone = await tx.query(
        `SELECT COUNT(*) AS n FROM vocab_entries WHERE section_id IN (
           SELECT s.id FROM vocab_sections s JOIN vocab_lessons l ON l.id = s.lesson_id WHERE l.book_id = $1 AND l.position >= $2)`,
        [bookId, file.lessons.length],
      );
      report.removed += n(gone[0]?.n);
      await tx.query("DELETE FROM vocab_lessons WHERE book_id = $1 AND position >= $2", [bookId, file.lessons.length]);
      return report;
    });
  }

  async books(): Promise<VocabBookInfo[]> {
    const books = await this.db.query("SELECT id, slug, title, kind, term_lang, meaning_lang, ordering FROM vocab_books ORDER BY position");
    const lessons = await this.db.query("SELECT id, book_id, title, subtitle FROM vocab_lessons ORDER BY position");
    const sections = await this.db.query(
      `SELECT s.id, s.lesson_id, s.title, s.subtitle, COUNT(e.id) AS entries
         FROM vocab_sections s LEFT JOIN vocab_entries e ON e.section_id = s.id
        GROUP BY s.id, s.lesson_id, s.title, s.subtitle, s.position
        ORDER BY s.position`,
    );
    return books
      .map((b) => {
        const own = lessons
          .filter((l) => n(l.book_id) === n(b.id))
          .map((l) => ({
            id: n(l.id),
            title: String(l.title),
            subtitle: String(l.subtitle ?? ""),
            sections: sections
              .filter((s) => n(s.lesson_id) === n(l.id))
              .map((s) => ({ id: n(s.id), title: String(s.title), subtitle: String(s.subtitle ?? ""), entries: n(s.entries) })),
          }));
        return {
          id: n(b.id),
          slug: String(b.slug),
          title: String(b.title),
          kind: (b.kind === "definition" ? "definition" : "translation") as VocabBookInfo["kind"],
          term: String(b.term_lang),
          meaning: String(b.meaning_lang),
          order: (b.ordering === "alphabetical" ? "alphabetical" : "book") as VocabBookInfo["order"],
          entries: own.reduce((sum, l) => sum + l.sections.reduce((t, s) => t + s.entries, 0), 0),
          lessons: own,
        };
      })
      .filter((b) => b.entries > 0);
  }

  private async entries(where: string, params: Param[]): Promise<SessionEntry[]> {
    const rows = await this.db.query(`SELECT ${ENTRY_COLUMNS} ${ENTRY_JOINS} WHERE ${where} ORDER BY l.position, s.position, e.position`, params);
    return rows.map(toEntry);
  }

  async getEntry(id: number): Promise<(SessionEntry & { bookId: number }) | null> {
    const rows = await this.db.query(`SELECT ${ENTRY_COLUMNS}, b.id AS book_id ${ENTRY_JOINS} WHERE e.id = $1`, [id]);
    return rows[0] ? { ...toEntry(rows[0]), bookId: n(rows[0].book_id) } : null;
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
    const rows = await this.db.query(
      "SELECT e.id, e.section_id, l.book_id FROM vocab_entries e JOIN vocab_sections s ON s.id = e.section_id JOIN vocab_lessons l ON l.id = s.lesson_id",
    );
    const sections: Record<number, VocabSectionProgress> = {};
    const books: Record<number, { due: number; started: number }> = {};
    let due = 0;
    for (const row of rows) {
      const id = n(row.id);
      const section = (sections[n(row.section_id)] ??= { new: 0, learning: 0, known: 0, mastered: 0, due: 0 });
      const book = (books[n(row.book_id)] ??= { due: 0, started: 0 });
      const recognise = progress.get(progressKey(id, "recognise"));
      const recall = progress.get(progressKey(id, "recall"));
      const status = entryStatus(recognise?.box ?? 0, recall?.box ?? 0);
      section[status]++;
      if (status !== "new") book.started++;
      for (const card of [recognise, recall]) {
        if (card && card.dueAt <= now) {
          section.due++;
          book.due++;
          due++;
        }
      }
    }
    const today = await this.db.query(
      "SELECT COUNT(*) AS answers, COALESCE(SUM(correct), 0) AS right_answers FROM vocab_answers WHERE user_id = $1 AND at >= $2",
      [userId, since],
    );
    return { sections, books, due, today: { answers: n(today[0]?.answers), right: n(today[0]?.right_answers) } };
  }

  /** A player's statistics on one book; null for an unknown book. */
  async stats(userId: number, bookId: number, now: number, offsetMinutes: number): Promise<VocabStats | null> {
    const lessons = await this.db.query("SELECT id, title FROM vocab_lessons WHERE book_id = $1 ORDER BY position", [bookId]);
    if (lessons.length === 0) return null;
    const entries = await this.db.query(
      `SELECT e.id, e.term, e.meaning, e.reading, l.id AS lesson_id ${ENTRY_JOINS} WHERE l.book_id = $1 ORDER BY l.position, s.position, e.position`,
      [bookId],
    );
    const cards = await this.db.query(
      `SELECT p.entry_id, p.direction, p.box, p.due_at, p.last_at, p.wrong_count
         FROM vocab_progress p JOIN vocab_entries e ON e.id = p.entry_id
         JOIN vocab_sections s ON s.id = e.section_id JOIN vocab_lessons l ON l.id = s.lesson_id
        WHERE p.user_id = $1 AND l.book_id = $2`,
      [userId, bookId],
    );
    const answers = await this.db.query(
      `SELECT a.entry_id, a.direction, a.mode, a.at, a.verdict, a.correct
         FROM vocab_answers a JOIN vocab_entries e ON e.id = a.entry_id
         JOIN vocab_sections s ON s.id = e.section_id JOIN vocab_lessons l ON l.id = s.lesson_id
        WHERE a.user_id = $1 AND l.book_id = $2`,
      [userId, bookId],
    );
    const progress: StatsInput["progress"] = new Map();
    for (const row of cards) {
      const own = progress.get(n(row.entry_id)) ?? {};
      own[row.direction as Direction] = { box: n(row.box), dueAt: n(row.due_at), lastAt: n(row.last_at), wrong: n(row.wrong_count) };
      progress.set(n(row.entry_id), own);
    }
    return computeStats({
      entries: entries.map((row) => ({
        id: n(row.id),
        lessonId: n(row.lesson_id),
        term: display(String(row.term)),
        meaning: display(String(row.meaning)),
        reading: String(row.reading ?? ""),
      })),
      lessons: lessons.map((row) => ({ id: n(row.id), title: String(row.title) })),
      progress,
      answers: answers.map(
        (row): StatsAnswer => ({
          entryId: n(row.entry_id),
          direction: row.direction === "recall" ? "recall" : "recognise",
          mode: row.mode === "written" ? "written" : "choice",
          at: n(row.at),
          verdict: String(row.verdict),
          correct: n(row.correct) === 1,
        }),
      ),
      now,
      offsetMinutes,
    });
  }

  async session(
    userId: number,
    target: { kind: "section" | "lesson" | "all"; id: number },
    purpose: SessionPurpose,
    size: number,
    preference: ModePreference,
    now: number,
    newOrder: NewOrder = "book",
  ) {
    // The whole book: only the entries the session can use, not all 4,000.
    const entries =
      target.kind === "section"
        ? await this.entries("e.section_id = $1", [target.id])
        : target.kind === "lesson"
          ? await this.entries("l.id = $1", [target.id])
          : purpose === "learn"
            ? await this.entries("l.book_id = $1", [target.id])
            : await this.entries(
                `l.book_id = $1 AND e.id IN (SELECT entry_id FROM vocab_progress WHERE user_id = $2${purpose === "due" ? " AND due_at <= $3" : ""})`,
                purpose === "due" ? [target.id, userId, now] : [target.id, userId],
              );
    // Wrong options come from the same lessons; for an alphabetical list, from
    // the whole book (neighbouring words look alike but mean unrelated things).
    const alphabetical = [...new Set(
      (await this.db.query(
        `SELECT DISTINCT l.book_id FROM vocab_sections s JOIN vocab_lessons l ON l.id = s.lesson_id JOIN vocab_books b ON b.id = l.book_id
          WHERE b.ordering = 'alphabetical' AND s.id IN (${[...new Set(entries.map((e) => e.sectionId))].map(Number).join(",") || "0"})`,
      )).map((r) => n(r.book_id)),
    )];
    const lessonIds = [
      ...new Set(
        (
          await this.db.query(
            `SELECT DISTINCT lesson_id FROM vocab_sections WHERE id IN (${[...new Set(entries.map((e) => e.sectionId))].map(Number).join(",") || "0"})`,
          )
        ).map((r) => n(r.lesson_id)),
      ),
    ];
    const pool = alphabetical.length
      ? await this.entries(`l.book_id IN (${alphabetical.join(",")}) OR l.id IN (${lessonIds.map(Number).join(",") || "0"})`, [])
      : lessonIds.length
        ? await this.entries(`l.id IN (${lessonIds.map(Number).join(",")})`, [])
        : [];
    return buildSession({
      entries,
      pool,
      progress: await this.progress(userId),
      now,
      size,
      preference,
      purpose,
      newOrder,
      random: Math.random,
    });
  }

  async answer(answer: VocabAnswer, now: number): Promise<VocabAnswerResult | null> {
    const entry = await this.getEntry(answer.entryId);
    if (!entry) return null;
    const { answer: expected, lang } = sides(entry, answer.direction);
    // A multiple-choice answer is one of the printed options: compare as printed.
    let verdict =
      answer.mode === "choice"
        ? normalise(answer.given) === normalise(display(expected)) ? "right" : "wrong"
        : grade(answer.given, expected, answerLang(lang), answer.direction === "recall" ? entry.reading : "");
    if (verdict === "wrong" && answer.mode === "written") {
      // Another entry of the book with the same prompt is just as right
      // ("large": macro or magn; two Spanish words for one English one).
      const twins = await this.db.query(
        `SELECT e.term, e.meaning, e.reading ${ENTRY_JOINS} WHERE l.book_id = $1 AND e.id <> $2 AND ${answer.direction === "recall" ? "e.meaning" : "e.term"} = $3`,
        [entry.bookId, entry.id, answer.direction === "recall" ? entry.meaning : entry.term],
      );
      for (const twin of twins) {
        const other = answer.direction === "recall" ? String(twin.term) : String(twin.meaning);
        const v = grade(answer.given, other, answerLang(lang), answer.direction === "recall" ? String(twin.reading ?? "") : "");
        if (COUNTS_AS_RIGHT.has(v)) {
          verdict = v;
          break;
        }
      }
    }
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
      verdict: verdict as VocabAnswerResult["verdict"],
      correct,
      expected: display(expected),
      feminine: answer.direction === "recall" && entry.feminine,
      reading: entry.reading,
      note: entry.note,
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

  routes.get("/books", async (c) => c.json(await store.books()));

  routes.get("/progress", async (c) => {
    const userId = Number(c.req.query("userId"));
    const since = Number(c.req.query("since") ?? 0);
    if (!isId(userId) || !Number.isFinite(since) || since < 0) return c.json({ error: "invalid query" }, 400);
    if (!(await allowed(c, userId))) return c.json({ error: "unknown user" }, 404);
    return c.json(await store.summary(userId, Date.now(), Math.trunc(since)));
  });

  routes.get("/stats", async (c) => {
    const userId = Number(c.req.query("userId"));
    const bookId = Number(c.req.query("book"));
    // The browser's offset from UTC in minutes, so days end at the player's midnight.
    const tz = Number(c.req.query("tz") ?? 0);
    if (!isId(userId) || !isId(bookId) || !Number.isInteger(tz) || Math.abs(tz) > 14 * 60) {
      return c.json({ error: "invalid query" }, 400);
    }
    if (!(await allowed(c, userId))) return c.json({ error: "unknown user" }, 404);
    const stats = await store.stats(userId, bookId, Date.now(), tz);
    return stats ? c.json(stats) : c.json({ error: "unknown book" }, 404);
  });

  routes.get("/session", async (c) => {
    const userId = Number(c.req.query("userId"));
    const kind = c.req.query("kind");
    const purpose = (c.req.query("purpose") ?? "learn") as SessionPurpose;
    // section or lesson id; for "all", the book id.
    const id = Number(c.req.query("id") ?? 0);
    const size = Number(c.req.query("size") ?? 20);
    const mode = (c.req.query("mode") ?? "mixed") as ModePreference;
    const order = (c.req.query("order") ?? "book") as NewOrder;
    if (
      !isId(userId) ||
      (order !== "book" && order !== "random") ||
      (kind !== "section" && kind !== "lesson" && kind !== "all") ||
      !isId(id) ||
      !PURPOSES.includes(purpose) ||
      !Number.isInteger(size) || size < 1 || size > MAX_SESSION ||
      !PREFERENCES.includes(mode)
    ) {
      return c.json({ error: "invalid session" }, 400);
    }
    if (!(await allowed(c, userId))) return c.json({ error: "unknown user" }, 404);
    return c.json(await store.session(userId, { kind, id }, purpose, size, mode, Date.now(), order));
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
