/**
 * Workbook exercises (docs/exercises.md): books imported from
 * tools/exercises-extract.py, a unit's exercises, answers saved as typed, and
 * the correction of a whole unit at once, marked here against the key.
 *
 * A book's content is from a book you own: the owner's account sees it,
 * other accounts only once the owner shares it (Account › Owner).
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { Hono } from "hono";
import type { Database, Row } from "./db/index.ts";
import type { AppEnv } from "./auth/middleware.ts";
import type { Repository, Scope } from "./repository.ts";
import { parseExerciseBook, type ExerciseItem } from "../shared/exercises/format.ts";
import { markExercise, type MarkedItem } from "../shared/exercises/grade.ts";
import type { ExerciseBookInfo, ExerciseBookView, ExerciseUnitInfo, ExerciseUnitView, ExerciseView } from "../shared/exercises/api.ts";

const n = (v: unknown): number => Number(v);
const parse = <T>(v: unknown, fallback: T): T => {
  if (typeof v !== "string" || v === "") return fallback;
  try {
    return JSON.parse(v) as T;
  } catch {
    return fallback;
  }
};

export interface ExerciseImportReport {
  book: string;
  units: number;
  exercises: number;
  added: number;
  updated: number;
  removed: number;
  revision: number;
}

interface StoredResult {
  items: MarkedItem[];
  overrides: Record<string, boolean>;
}

const MIME: Record<string, string> = { webp: "image/webp", png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg" };

export class ExerciseStore {
  constructor(private readonly db: Database) {}

  /** Imports a folder made by the extractor: book.json and its images. The players' answers stay. */
  async importFolder(dir: string): Promise<ExerciseImportReport> {
    const file = parseExerciseBook(JSON.parse(readFileSync(join(dir, "book.json"), "utf8")));
    const images = new Map(file.exercises.map((e) => [e.id, readFileSync(join(dir, "images", e.image)).toString("base64")]));
    const now = Date.now();
    return this.db.transaction(async (tx) => {
      const b = file.book;
      const known = (await tx.query("SELECT revision FROM exercise_books WHERE id = $1", [b.id]))[0];
      const revision = known ? n(known.revision) + 1 : 1;
      if (known) {
        await tx.query("UPDATE exercise_books SET title = $1, source = $2, level = $3, kind = $4, revision = $5, imported_at = $6 WHERE id = $7", [
          b.title, b.source, b.level, b.kind, revision, now, b.id,
        ]);
      } else {
        const position = n((await tx.query("SELECT COUNT(*) AS c FROM exercise_books"))[0]?.c);
        await tx.query(
          "INSERT INTO exercise_books (id, title, source, level, kind, position, revision, visibility, imported_at) VALUES ($1, $2, $3, $4, $5, $6, $7, 'private', $8)",
          [b.id, b.title, b.source, b.level, b.kind, position, revision, now],
        );
      }
      await tx.query("DELETE FROM exercise_units WHERE book_id = $1", [b.id]);
      for (const u of file.units) await tx.query("INSERT INTO exercise_units (book_id, n, title) VALUES ($1, $2, $3)", [b.id, u.n, u.title]);
      const existing = new Set((await tx.query("SELECT id FROM exercises WHERE book_id = $1", [b.id])).map((r) => String(r.id)));
      const report: ExerciseImportReport = { book: b.id, units: file.units.length, exercises: file.exercises.length, added: 0, updated: 0, removed: 0, revision };
      for (const [position, e] of file.exercises.entries()) {
        const ext = e.image.split(".").pop()!.toLowerCase();
        const values = [e.unit, position, e.page, e.instruction, images.get(e.id)!, MIME[ext] ?? "image/webp", e.width, e.height, e.open ? 1 : 0, e.note, e.keyText, JSON.stringify(e.items)];
        if (existing.has(e.id)) {
          await tx.query(
            `UPDATE exercises SET unit = $1, position = $2, page = $3, instruction = $4, image = $5, image_type = $6, width = $7, height = $8,
               is_open = $9, note = $10, key_text = $11, items = $12 WHERE book_id = $13 AND id = $14`,
            [...values, b.id, e.id],
          );
          existing.delete(e.id);
          report.updated++;
        } else {
          await tx.query(
            `INSERT INTO exercises (unit, position, page, instruction, image, image_type, width, height, is_open, note, key_text, items, book_id, id)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
            [...values, b.id, e.id],
          );
          report.added++;
        }
      }
      // Exercises no longer in the file go, with the answers given to them.
      for (const id of existing) {
        await tx.query("DELETE FROM exercise_answers WHERE book_id = $1 AND exercise_id = $2", [b.id, id]);
        await tx.query("DELETE FROM exercises WHERE book_id = $1 AND id = $2", [b.id, id]);
        report.removed++;
      }
      return report;
    });
  }

  async visible(bookId: string, owner: boolean): Promise<boolean> {
    const row = (await this.db.query("SELECT visibility FROM exercise_books WHERE id = $1", [bookId]))[0];
    return Boolean(row) && (owner || row!.visibility === "shared");
  }

  async setVisibility(bookId: string, visibility: "private" | "shared"): Promise<boolean> {
    return (await this.db.query("UPDATE exercise_books SET visibility = $1 WHERE id = $2 RETURNING id", [visibility, bookId])).length > 0;
  }

  /** The books an account sees, with a player's progress (or none: userId 0). */
  async books(owner: boolean, userId: number): Promise<ExerciseBookInfo[]> {
    const rows = await this.db.query(
      `SELECT b.id, b.title, b.source, b.level, b.kind, b.visibility,
              (SELECT COUNT(*) FROM exercise_units u WHERE u.book_id = b.id) AS units,
              (SELECT COUNT(*) FROM exercises e WHERE e.book_id = b.id) AS exercises,
              (SELECT COUNT(*) FROM exercise_answers a WHERE a.book_id = b.id AND a.user_id = $1 AND a.checked_at IS NOT NULL) AS checked,
              (SELECT COALESCE(SUM(a.score), 0) FROM exercise_answers a WHERE a.book_id = b.id AND a.user_id = $1 AND a.checked_at IS NOT NULL) AS score,
              (SELECT COALESCE(SUM(a.total), 0) FROM exercise_answers a WHERE a.book_id = b.id AND a.user_id = $1 AND a.checked_at IS NOT NULL) AS total
         FROM exercise_books b ${owner ? "" : "WHERE b.visibility = 'shared'"} ORDER BY b.position, b.id`,
      [userId],
    );
    return rows.map((r) => ({
      id: String(r.id),
      title: String(r.title),
      source: String(r.source),
      level: String(r.level),
      kind: String(r.kind),
      visibility: r.visibility === "shared" ? "shared" : "private",
      units: n(r.units),
      exercises: n(r.exercises),
      checked: n(r.checked),
      score: n(r.score),
      total: n(r.total),
    }));
  }

  async book(bookId: string, owner: boolean, userId: number): Promise<ExerciseBookView | null> {
    const book = (await this.books(owner, userId)).find((b) => b.id === bookId);
    if (!book) return null;
    const rows = await this.db.query(
      `SELECT u.n, u.title,
              (SELECT COUNT(*) FROM exercises e WHERE e.book_id = u.book_id AND e.unit = u.n) AS exercises,
              COUNT(a.exercise_id) AS checked, COALESCE(SUM(a.score), 0) AS score, COALESCE(SUM(a.total), 0) AS total
         FROM exercise_units u
         LEFT JOIN exercises e ON e.book_id = u.book_id AND e.unit = u.n
         LEFT JOIN exercise_answers a ON a.book_id = e.book_id AND a.exercise_id = e.id AND a.user_id = $2 AND a.checked_at IS NOT NULL
        WHERE u.book_id = $1
        GROUP BY u.book_id, u.n, u.title ORDER BY u.n`,
      [bookId, userId],
    );
    const units: ExerciseUnitInfo[] = rows.map((r) => ({ n: n(r.n), title: String(r.title), exercises: n(r.exercises), checked: n(r.checked), score: n(r.score), total: n(r.total) }));
    return { book, units };
  }

  private async exerciseRows(bookId: string, unit: number): Promise<Row[]> {
    return this.db.query(
      "SELECT id, instruction, width, height, is_open, note, key_text, items FROM exercises WHERE book_id = $1 AND unit = $2 ORDER BY position",
      [bookId, unit],
    );
  }

  async unit(bookId: string, unit: number, userId: number): Promise<ExerciseUnitView | null> {
    const b = (await this.db.query("SELECT id, title, source, revision FROM exercise_books WHERE id = $1", [bookId]))[0];
    const u = (await this.db.query("SELECT n, title FROM exercise_units WHERE book_id = $1 AND n = $2", [bookId, unit]))[0];
    if (!b || !u) return null;
    const around = await this.db.query(
      `SELECT (SELECT MAX(n) FROM exercise_units WHERE book_id = $1 AND n < $2) AS prev,
              (SELECT MIN(n) FROM exercise_units WHERE book_id = $1 AND n > $2) AS next`,
      [bookId, unit],
    );
    const answers = new Map(
      (await this.db.query("SELECT exercise_id, answers, results, score, total, checked_at FROM exercise_answers WHERE user_id = $1 AND book_id = $2", [userId, bookId])).map((r) => [
        String(r.exercise_id),
        r,
      ]),
    );
    const exercises = (await this.exerciseRows(bookId, unit)).map((r): ExerciseView => {
      const items = parse<ExerciseItem[]>(r.items, []);
      const saved = answers.get(String(r.id));
      const result = saved && saved.checked_at !== null && saved.checked_at !== undefined ? parse<StoredResult | null>(saved.results, null) : null;
      return {
        id: String(r.id),
        instruction: String(r.instruction),
        image: `/api/exercises/image/${encodeURIComponent(bookId)}/${encodeURIComponent(String(r.id))}?v=${n(b.revision)}`,
        width: n(r.width),
        height: n(r.height),
        open: n(r.is_open) === 1,
        items: items.map((it) => ({ n: it.n, gaps: it.gaps })),
        answers: parse<Record<string, string[]>>(saved?.answers, {}),
        result: result
          ? {
              items: result.items.map((it) => ({ ...it, overridden: result.overrides[it.n] !== undefined })),
              score: n(saved!.score),
              total: n(saved!.total),
              note: String(r.note),
              keyText: String(r.key_text),
              at: n(saved!.checked_at),
            }
          : null,
      };
    });
    return {
      book: { id: String(b.id), title: String(b.title), source: String(b.source) },
      unit: { n: n(u.n), title: String(u.title) },
      previous: around[0]?.prev === null || around[0]?.prev === undefined ? null : n(around[0].prev),
      next: around[0]?.next === null || around[0]?.next === undefined ? null : n(around[0].next),
      exercises,
    };
  }

  /** Saves what was typed, without correcting it (a draft). */
  async saveDraft(userId: number, bookId: string, exerciseId: string, answers: Record<string, string[]>, now: number): Promise<boolean> {
    const known = (await this.db.query("SELECT 1 AS ok FROM exercises WHERE book_id = $1 AND id = $2", [bookId, exerciseId])).length > 0;
    if (!known) return false;
    await this.db.query(
      `INSERT INTO exercise_answers (user_id, book_id, exercise_id, answers, results, score, total, checked_at, updated_at)
       VALUES ($1, $2, $3, $4, NULL, 0, 0, NULL, $5)
       ON CONFLICT (user_id, book_id, exercise_id) DO UPDATE SET answers = $4, updated_at = $5`,
      [userId, bookId, exerciseId, JSON.stringify(answers), now],
    );
    return true;
  }

  /** Corrects the exercises of a unit with the answers given: marked, stored, returned. */
  async check(userId: number, bookId: string, unit: number, given: Record<string, Record<string, string[]>>, now: number): Promise<ExerciseUnitView | null> {
    const rows = await this.exerciseRows(bookId, unit);
    if (rows.length === 0) return null;
    await this.db.transaction(async (tx) => {
      const previous = new Map(
        (await tx.query("SELECT exercise_id, answers, results FROM exercise_answers WHERE user_id = $1 AND book_id = $2", [userId, bookId])).map((r) => [String(r.exercise_id), r]),
      );
      for (const r of rows) {
        const id = String(r.id);
        const answers = given[id] ?? {};
        const before = previous.get(id);
        const overrides = parse<StoredResult | null>(before?.results, null)?.overrides ?? {};
        const typedBefore = parse<Record<string, string[]>>(before?.answers, {});
        // An override is for the answer it was given to: it goes when the answer changes.
        const kept: Record<string, boolean> = {};
        for (const [item, right] of Object.entries(overrides)) {
          if (JSON.stringify(typedBefore[item] ?? []) === JSON.stringify(answers[item] ?? [])) kept[item] = right;
        }
        const final = markExercise({ id, open: n(r.is_open) === 1, items: parse<ExerciseItem[]>(r.items, []) }, answers, kept);
        await tx.query(
          `INSERT INTO exercise_answers (user_id, book_id, exercise_id, answers, results, score, total, checked_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $8)
           ON CONFLICT (user_id, book_id, exercise_id) DO UPDATE SET answers = $4, results = $5, score = $6, total = $7, checked_at = $8, updated_at = $8`,
          [userId, bookId, id, JSON.stringify(answers), JSON.stringify({ items: final.items, overrides: kept } satisfies StoredResult), final.score, final.total, now],
        );
      }
    });
    return this.unit(bookId, unit, userId);
  }

  /** The player marks an item himself: right (his answer is good too), wrong, or back to the key's verdict (null). */
  async override(userId: number, bookId: string, exerciseId: string, item: string, right: boolean | null, now: number): Promise<boolean> {
    const ex = (await this.db.query("SELECT is_open, items FROM exercises WHERE book_id = $1 AND id = $2", [bookId, exerciseId]))[0];
    const saved = (await this.db.query("SELECT answers, results, checked_at FROM exercise_answers WHERE user_id = $1 AND book_id = $2 AND exercise_id = $3", [userId, bookId, exerciseId]))[0];
    if (!ex || !saved || saved.checked_at === null || saved.checked_at === undefined) return false;
    const items = parse<ExerciseItem[]>(ex.items, []);
    if (!items.some((i) => i.n === item)) return false;
    const stored = parse<StoredResult>(saved.results, { items: [], overrides: {} });
    const overrides = { ...stored.overrides };
    if (right === null) delete overrides[item];
    else overrides[item] = right;
    const marked = markExercise({ id: exerciseId, open: n(ex.is_open) === 1, items }, parse<Record<string, string[]>>(saved.answers, {}), overrides);
    await this.db.query("UPDATE exercise_answers SET results = $1, score = $2, total = $3, updated_at = $4 WHERE user_id = $5 AND book_id = $6 AND exercise_id = $7", [
      JSON.stringify({ items: marked.items, overrides } satisfies StoredResult),
      marked.score,
      marked.total,
      now,
      userId,
      bookId,
      exerciseId,
    ]);
    return true;
  }

  /** Starts a unit again: its answers and corrections go. */
  async reset(userId: number, bookId: string, unit: number): Promise<void> {
    await this.db.query("DELETE FROM exercise_answers WHERE user_id = $1 AND book_id = $2 AND exercise_id IN (SELECT id FROM exercises WHERE book_id = $2 AND unit = $3)", [
      userId,
      bookId,
      unit,
    ]);
  }

  async image(bookId: string, exerciseId: string): Promise<{ data: Buffer; type: string } | null> {
    const r = (await this.db.query("SELECT image, image_type FROM exercises WHERE book_id = $1 AND id = $2", [bookId, exerciseId]))[0];
    return r ? { data: Buffer.from(String(r.image), "base64"), type: String(r.image_type) } : null;
  }
}

// ------------------------------------------------------------------- routes

const isId = (v: unknown): v is number => typeof v === "number" && Number.isInteger(v) && v > 0;
const isBook = (v: unknown): v is string => typeof v === "string" && /^[a-z0-9][a-z0-9-]{1,60}$/.test(v);
const isExercise = (v: unknown): v is string => typeof v === "string" && /^\d{1,3}\.\d{1,2}$/.test(v);
const isItem = (v: unknown): v is string => typeof v === "string" && /^\d{1,2}[a-h]?$/.test(v);
const ANSWER_MAX = 500;

/** Answers by item: {"2": ["went"], "4": ["fell", "hurt"]}, within bounds. */
function answersOf(v: unknown): Record<string, string[]> | null {
  if (!v || typeof v !== "object" || Array.isArray(v)) return null;
  const out: Record<string, string[]> = {};
  const entries = Object.entries(v as Record<string, unknown>);
  if (entries.length > 100) return null;
  for (const [item, gaps] of entries) {
    if (!isItem(item) || !Array.isArray(gaps) || gaps.length > 60 || !gaps.every((g) => typeof g === "string" && g.length <= ANSWER_MAX)) return null;
    out[item] = gaps as string[];
  }
  return out;
}

export function exerciseRoutes(store: ExerciseStore, repository: Repository, scope: (c: never) => Scope): Hono<AppEnv> {
  const routes = new Hono<AppEnv>();
  const owner = (c: { get(key: "session"): AppEnv["Variables"]["session"] }): boolean => c.get("session")?.owner === true;
  const allowed = async (c: unknown, userId: number): Promise<boolean> => Boolean(await repository.getUser(userId, scope(c as never)));

  routes.get("/books", async (c) => {
    const userId = Number(c.req.query("userId") ?? 0);
    if (userId !== 0 && (!isId(userId) || !(await allowed(c, userId)))) return c.json({ error: "unknown user" }, 404);
    return c.json(await store.books(owner(c), userId));
  });

  routes.get("/books/:book", async (c) => {
    const book = c.req.param("book");
    const userId = Number(c.req.query("userId"));
    if (!isBook(book) || !isId(userId)) return c.json({ error: "invalid query" }, 400);
    if (!(await allowed(c, userId))) return c.json({ error: "unknown user" }, 404);
    const view = (await store.visible(book, owner(c))) ? await store.book(book, owner(c), userId) : null;
    return view ? c.json(view) : c.json({ error: "unknown book" }, 404);
  });

  routes.get("/books/:book/units/:unit", async (c) => {
    const book = c.req.param("book");
    const unit = Number(c.req.param("unit"));
    const userId = Number(c.req.query("userId"));
    if (!isBook(book) || !Number.isInteger(unit) || unit < 0 || !isId(userId)) return c.json({ error: "invalid query" }, 400);
    if (!(await allowed(c, userId))) return c.json({ error: "unknown user" }, 404);
    if (!(await store.visible(book, owner(c)))) return c.json({ error: "unknown book" }, 404);
    const view = await store.unit(book, unit, userId);
    return view ? c.json(view) : c.json({ error: "unknown unit" }, 404);
  });

  /** The exercise's image; its address carries the book's revision, so it may be kept. */
  routes.get("/image/:book/:exercise", async (c) => {
    const book = c.req.param("book");
    const exercise = c.req.param("exercise");
    if (!isBook(book) || !isExercise(exercise) || !(await store.visible(book, owner(c)))) return c.json({ error: "unknown exercise" }, 404);
    const image = await store.image(book, exercise);
    if (!image) return c.json({ error: "unknown exercise" }, 404);
    return c.body(new Uint8Array(image.data), 200, { "Content-Type": image.type, "Cache-Control": "private, max-age=31536000, immutable" });
  });

  /** What was typed so far: kept as a draft, nothing corrected. */
  routes.put("/answers", async (c) => {
    const body = ((await c.req.json().catch(() => null)) ?? {}) as Record<string, unknown>;
    const { userId, book, exercise } = body;
    const answers = answersOf(body.answers);
    if (!isId(userId) || !isBook(book) || !isExercise(exercise) || !answers) return c.json({ error: "invalid answers" }, 400);
    if (!(await allowed(c, userId))) return c.json({ error: "unknown user" }, 404);
    if (!(await store.visible(book, owner(c)))) return c.json({ error: "unknown book" }, 404);
    return (await store.saveDraft(userId, book, exercise, answers, Date.now())) ? c.body(null, 204) : c.json({ error: "unknown exercise" }, 404);
  });

  /** Corrects the unit: every exercise, with the answers sent. */
  routes.post("/check", async (c) => {
    const body = ((await c.req.json().catch(() => null)) ?? {}) as Record<string, unknown>;
    const { userId, book, unit } = body;
    const raw = body.answers;
    if (!isId(userId) || !isBook(book) || typeof unit !== "number" || !Number.isInteger(unit) || unit < 0 || !raw || typeof raw !== "object") {
      return c.json({ error: "invalid check" }, 400);
    }
    const given: Record<string, Record<string, string[]>> = {};
    for (const [id, a] of Object.entries(raw as Record<string, unknown>).slice(0, 40)) {
      const answers = answersOf(a);
      if (!isExercise(id) || !answers) return c.json({ error: "invalid check" }, 400);
      given[id] = answers;
    }
    if (!(await allowed(c, userId))) return c.json({ error: "unknown user" }, 404);
    if (!(await store.visible(book, owner(c)))) return c.json({ error: "unknown book" }, 404);
    const view = await store.check(userId, book, unit, given, Date.now());
    return view ? c.json(view) : c.json({ error: "unknown unit" }, 404);
  });

  routes.put("/override", async (c) => {
    const body = ((await c.req.json().catch(() => null)) ?? {}) as Record<string, unknown>;
    const { userId, book, exercise, item, right } = body;
    if (!isId(userId) || !isBook(book) || !isExercise(exercise) || !isItem(item) || (right !== null && typeof right !== "boolean")) {
      return c.json({ error: "invalid override" }, 400);
    }
    if (!(await allowed(c, userId))) return c.json({ error: "unknown user" }, 404);
    if (!(await store.visible(book, owner(c)))) return c.json({ error: "unknown book" }, 404);
    return (await store.override(userId, book, exercise, item, right, Date.now())) ? c.body(null, 204) : c.json({ error: "not corrected" }, 404);
  });

  routes.delete("/answers", async (c) => {
    const userId = Number(c.req.query("userId"));
    const book = c.req.query("book");
    const unit = Number(c.req.query("unit"));
    if (!isId(userId) || !isBook(book) || !Number.isInteger(unit) || unit < 0) return c.json({ error: "invalid query" }, 400);
    if (!(await allowed(c, userId))) return c.json({ error: "unknown user" }, 404);
    if (!(await store.visible(book, owner(c)))) return c.json({ error: "unknown book" }, 404);
    await store.reset(userId, book, unit);
    return c.body(null, 204);
  });

  return routes;
}
