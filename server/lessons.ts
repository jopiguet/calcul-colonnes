/**
 * Language courses (docs/language-courses.md): the courses written for the
 * app (content/courses/<id>/), their lessons in French, Spanish and English,
 * the players' answers to their exercises, marked here, and each course's
 * vocabulary book, imported by the maintenance whenever it changes.
 *
 * The courses are the app's own content, seen by every account.
 */
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { Hono } from "hono";
import type { Database } from "./db/index.ts";
import type { AppEnv } from "./auth/middleware.ts";
import type { Repository, Scope } from "./repository.ts";
import { exercisesOf, parseLesson, publicExercise, type Lesson } from "../shared/lessons/format.ts";
import { expectedOf, FOLDS, markExercise, type BlankResult, type Fold } from "../shared/lessons/grade.ts";
import { parseVocabFile, TRANSLATION_LANGS, type TranslationLang, type VocabFile, type VocabFileEntry } from "../shared/vocab/format.ts";
import type { CourseInfo, CourseLessonInfo, CourseView, LessonView, ExerciseState } from "../shared/lessons/api.ts";
export type { BlankResult };

type Lang = TranslationLang;
const LANGS = TRANSLATION_LANGS;

export interface CourseMeta {
  id: string;
  /** The language taught ("la"). */
  language: string;
  icon: string;
  folds: Fold[];
  title: Record<Lang, string>;
  description: Record<Lang, string>;
  /** The title of a lesson in the course's vocabulary book: "Lectio {n}". */
  vocabLesson: string;
  /** The lessons' folders, in order. */
  lessons: string[];
}

export interface LoadedLesson {
  slug: string;
  n: number;
  byLang: Record<Lang, Lesson>;
  vocab: VocabFileEntry[];
}

export interface LoadedCourse {
  meta: CourseMeta;
  lessons: LoadedLesson[];
}

/** content/courses beside the sources, or beside the bundle (dist-server/content/courses). */
export function contentDir(): string {
  const candidates = [new URL("../content/courses", import.meta.url), new URL("./content/courses", import.meta.url)].map((u) => fileURLToPath(u));
  return candidates.find((d) => existsSync(d)) ?? candidates[0]!;
}

const text = (v: unknown): v is string => typeof v === "string" && v.trim() !== "";
const byLang = (v: unknown, what: string): Record<Lang, string> => {
  const o = (v ?? {}) as Record<string, unknown>;
  for (const l of LANGS) if (!text(o[l])) throw new Error(`${what}: "${l}" is missing`);
  return o as Record<Lang, string>;
};

/** A course's folder read and checked: its lessons in the three languages, its vocabulary. Throws on the first problem. */
export function loadCourse(dir: string): LoadedCourse {
  const raw = JSON.parse(readFileSync(join(dir, "course.json"), "utf8")) as Record<string, unknown>;
  const id = String(raw.id ?? "");
  if (!/^[a-z][a-z0-9-]{1,30}$/.test(id)) throw new Error(`${dir}: course id`);
  const folds = (Array.isArray(raw.folds) ? raw.folds : []) as Fold[];
  if (!folds.every((f) => FOLDS.includes(f))) throw new Error(`${id}: folds are ${FOLDS.join(", ")}`);
  const lessonsList = raw.lessons;
  if (!Array.isArray(lessonsList) || lessonsList.length === 0 || !lessonsList.every((l) => typeof l === "string" && /^[a-z0-9][a-z0-9-]{1,60}$/.test(l))) {
    throw new Error(`${id}: "lessons" lists the lessons' folders`);
  }
  const meta: CourseMeta = {
    id,
    language: String(raw.language ?? ""),
    icon: String(raw.icon ?? "📘"),
    folds,
    title: byLang(raw.title, `${id}: title`),
    description: byLang(raw.description, `${id}: description`),
    vocabLesson: text(raw.vocabLesson) ? raw.vocabLesson : "{n}",
    lessons: lessonsList as string[],
  };
  if (!/^[a-z]{2,3}$/.test(meta.language)) throw new Error(`${id}: "language" is a language code`);
  const lessons = meta.lessons.map((slug, i): LoadedLesson => {
    const folder = join(dir, slug);
    const parsed = {} as Record<Lang, Lesson>;
    for (const l of LANGS) parsed[l] = parseLesson(readFileSync(join(folder, `${l}.md`), "utf8"), `${id}/${slug}/${l}.md`);
    const vocabPath = join(folder, "vocab.json");
    // The lesson's words, read as a format-3 file would be: the same checks, the same fields.
    const rawVocab = existsSync(vocabPath) ? ((JSON.parse(readFileSync(vocabPath, "utf8")) as { entries?: unknown[] }).entries ?? []) : [];
    const vocab = rawVocab.length
      ? parseVocabFile({
          format: 3,
          book: { id: "lesson", title: "lesson", kind: "translation", term: meta.language, meaning: "en" },
          lessons: [{ title: slug, sections: [{ title: slug, entries: rawVocab }] }],
        }).lessons[0]!.sections[0]!.entries
      : [];
    for (const v of vocab) {
      for (const l of ["fr", "es"] as const) if (!v.translations?.[l]) throw new Error(`${id}/${slug}/vocab.json: "${v.term}" has no "${l}" translation`);
    }
    return { slug, n: i + 1, byLang: parsed, vocab };
  });
  return { meta, lessons };
}

let cache: Map<string, LoadedCourse> | null = null;

/** Every course of content/courses (listed in its index.json), read once. */
export function courses(dir = contentDir()): Map<string, LoadedCourse> {
  if (cache) return cache;
  const out = new Map<string, LoadedCourse>();
  const index = join(dir, "index.json");
  if (existsSync(index)) {
    for (const id of JSON.parse(readFileSync(index, "utf8")) as string[]) out.set(id, loadCourse(join(dir, id)));
  }
  cache = out;
  return out;
}

/** The course's vocabulary book (format 3): a lesson per course lesson, meanings in English with French and Spanish. */
export function vocabBookOf(course: LoadedCourse): VocabFile | null {
  const lessons = course.lessons.filter((l) => l.vocab.length > 0);
  if (lessons.length === 0) return null;
  return {
    book: {
      id: vocabBookId(course.meta.id),
      title: course.meta.title.en,
      kind: "translation",
      term: course.meta.language,
      meaning: "en",
      order: "book",
      credit: "Written for Luma's course (docs/language-courses.md)",
    },
    lessons: lessons.map((l) => ({
      title: course.meta.vocabLesson.replace("{n}", String(l.n)),
      subtitle: l.byLang.en.title,
      sections: [{ title: l.byLang.en.title, subtitle: "", entries: l.vocab }],
    })),
  };
}

export const vocabBookId = (course: string): string => `course-${course}`;

/** A course's vocabulary book, imported when it changed since the last start (its hash in app_settings), shared with every account. */
export async function importCourseVocab(db: Database, importBook: (file: VocabFile) => Promise<unknown>, setShared: (slug: string) => Promise<void>): Promise<string[]> {
  const done: string[] = [];
  for (const course of courses().values()) {
    const file = vocabBookOf(course);
    if (!file) continue;
    const hash = createHash("sha256").update(JSON.stringify(file)).digest("hex");
    const key = `course-vocab:${course.meta.id}`;
    const known = (await db.query("SELECT value FROM app_settings WHERE key = $1", [key]))[0]?.value;
    if (known === hash) continue;
    await importBook(file);
    await setShared(file.book.id);
    await db.query("DELETE FROM app_settings WHERE key = $1", [key]);
    await db.query("INSERT INTO app_settings (key, value) VALUES ($1, $2)", [key, hash]);
    done.push(file.book.id);
  }
  return done;
}

interface SavedRow {
  lesson: string;
  exercise: string;
  answers: string;
  results: string;
  overrides: string;
  score: number;
  total: number;
}

const parse = <T>(v: unknown, fallback: T): T => {
  try {
    return typeof v === "string" && v ? (JSON.parse(v) as T) : fallback;
  } catch {
    return fallback;
  }
};

export class LessonStore {
  constructor(private readonly db: Database) {}

  private async saved(userId: number, course: string, lesson?: string): Promise<SavedRow[]> {
    const rows = await this.db.query(
      `SELECT lesson, exercise, answers, results, overrides, score, total FROM lesson_answers WHERE user_id = $1 AND course = $2 ${lesson ? "AND lesson = $3" : ""}`,
      lesson ? [userId, course, lesson] : [userId, course],
    );
    return rows.map((r) => ({ ...(r as unknown as SavedRow), score: Number(r.score), total: Number(r.total) }));
  }

  private lessonInfo(l: LoadedLesson, lang: Lang, saved: SavedRow[]): CourseLessonInfo {
    const exercises = exercisesOf(l.byLang[lang]);
    const mine = saved.filter((s) => s.lesson === l.slug && s.results !== "");
    return {
      n: l.n,
      slug: l.slug,
      title: l.byLang[lang].title,
      exercises: exercises.length,
      checked: mine.length,
      done: mine.filter((s) => s.total > 0 && s.score === s.total).length,
      score: mine.reduce((t, s) => t + s.score, 0),
      total: mine.reduce((t, s) => t + s.total, 0),
      words: l.vocab.length,
    };
  }

  async list(userId: number, lang: Lang): Promise<CourseInfo[]> {
    const out: CourseInfo[] = [];
    for (const c of courses().values()) {
      const saved = await this.saved(userId, c.meta.id);
      const lessons = c.lessons.map((l) => this.lessonInfo(l, lang, saved));
      out.push({
        id: c.meta.id,
        icon: c.meta.icon,
        language: c.meta.language,
        title: c.meta.title[lang],
        description: c.meta.description[lang],
        lessons: lessons.length,
        exercises: lessons.reduce((t, l) => t + l.exercises, 0),
        done: lessons.reduce((t, l) => t + l.done, 0),
        vocabBook: vocabBookOf(c) ? vocabBookId(c.meta.id) : null,
      });
    }
    return out;
  }

  async course(userId: number, id: string, lang: Lang): Promise<CourseView | null> {
    const c = courses().get(id);
    if (!c) return null;
    const info = (await this.list(userId, lang)).find((x) => x.id === id)!;
    const saved = await this.saved(userId, id);
    return { course: info, lessons: c.lessons.map((l) => this.lessonInfo(l, lang, saved)) };
  }

  async lesson(userId: number, id: string, slug: string, lang: Lang): Promise<LessonView | null> {
    const c = courses().get(id);
    const index = c?.lessons.findIndex((l) => l.slug === slug) ?? -1;
    if (!c || index < 0) return null;
    const l = c.lessons[index]!;
    const lesson = l.byLang[lang];
    const saved = new Map((await this.saved(userId, id, slug)).map((s) => [s.exercise, s]));
    const exercises: Record<string, ExerciseState> = {};
    for (const e of exercisesOf(lesson)) {
      const s = saved.get(e.id);
      if (s) exercises[e.id] = this.state(e.blanks, s, c.meta.folds);
    }
    const around = (i: number) => (c.lessons[i] ? { slug: c.lessons[i]!.slug, n: c.lessons[i]!.n, title: c.lessons[i]!.byLang[lang].title } : null);
    return {
      course: { id, title: c.meta.title[lang], language: c.meta.language, icon: c.meta.icon, vocabBook: vocabBookOf(c) ? vocabBookId(id) : null },
      lesson: {
        n: l.n,
        slug,
        title: lesson.title,
        parts: lesson.parts.map((p) => (p.kind === "exercise" ? { kind: "exercise" as const, exercise: publicExercise(p.exercise) } : p)),
        vocab: l.vocab.map((v) => ({ term: v.term, meaning: lang === "en" ? v.meaning : (v.translations?.[lang] ?? v.meaning), ...(v.info ? { info: v.info } : {}), ...(v.note ? { note: v.note } : {}) })),
      },
      previous: around(index - 1),
      next: around(index + 1),
      exercises,
    };
  }

  /** A saved exercise as the browser sees it: the answers, and once checked, the results and the key. */
  private state(blanks: ReturnType<typeof exercisesOf>[number]["blanks"], s: SavedRow, folds: Fold[]): ExerciseState {
    const given = parse<string[]>(s.answers, []);
    if (s.results === "") return { given };
    const overrides = parse<Record<number, boolean>>(s.overrides, {});
    const marked = markExercise(blanks, given, folds, overrides);
    return {
      given,
      results: marked.results,
      expected: blanks.map(expectedOf),
      overridden: Object.keys(overrides).map(Number),
      score: marked.score,
      total: marked.total,
    };
  }

  /** Marks an exercise and keeps it, with what was typed. */
  async check(userId: number, id: string, slug: string, exerciseId: string, given: string[], lang: Lang, now: number): Promise<ExerciseState | null> {
    const c = courses().get(id);
    const l = c?.lessons.find((x) => x.slug === slug);
    const e = l && exercisesOf(l.byLang[lang]).find((x) => x.id === exerciseId);
    if (!c || !l || !e || given.length > e.blanks.length) return null;
    const answers = e.blanks.map((_, i) => given[i] ?? "");
    const marked = markExercise(e.blanks, answers, c.meta.folds);
    // A new answer starts without the player's marks.
    await this.db.transaction(async (tx) => {
      await tx.query("DELETE FROM lesson_answers WHERE user_id = $1 AND course = $2 AND lesson = $3 AND exercise = $4", [userId, id, slug, exerciseId]);
      await tx.query(
        `INSERT INTO lesson_answers (user_id, course, lesson, exercise, answers, results, overrides, score, total, checked_at)
         VALUES ($1, $2, $3, $4, $5, $6, '{}', $7, $8, $9)`,
        [userId, id, slug, exerciseId, JSON.stringify(answers), JSON.stringify(marked.results), marked.score, marked.total, now],
      );
    });
    return this.state(e.blanks, { lesson: slug, exercise: exerciseId, answers: JSON.stringify(answers), results: JSON.stringify(marked.results), overrides: "{}", score: marked.score, total: marked.total }, c.meta.folds);
  }

  /** The player's own mark on a blank the key did not foresee (a free answer, or a strict one): right, or back to the key. */
  async override(userId: number, id: string, slug: string, exerciseId: string, blank: number, right: boolean | null, lang: Lang): Promise<ExerciseState | null> {
    const c = courses().get(id);
    const l = c?.lessons.find((x) => x.slug === slug);
    const e = l && exercisesOf(l.byLang[lang]).find((x) => x.id === exerciseId);
    const s = (await this.saved(userId, id, slug)).find((x) => x.exercise === exerciseId);
    if (!c || !e || !s || s.results === "" || !Number.isInteger(blank) || blank < 0 || blank >= e.blanks.length || e.blanks[blank]!.kind === "choice") return null;
    const overrides = parse<Record<number, boolean>>(s.overrides, {});
    if (right === true) overrides[blank] = true;
    else delete overrides[blank];
    const marked = markExercise(e.blanks, parse<string[]>(s.answers, []), c.meta.folds, overrides);
    await this.db.query(
      "UPDATE lesson_answers SET overrides = $1, results = $2, score = $3 WHERE user_id = $4 AND course = $5 AND lesson = $6 AND exercise = $7",
      [JSON.stringify(overrides), JSON.stringify(marked.results), marked.score, userId, id, slug, exerciseId],
    );
    return this.state(e.blanks, { ...s, overrides: JSON.stringify(overrides) }, c.meta.folds);
  }

  async reset(userId: number, id: string, slug: string): Promise<void> {
    await this.db.query("DELETE FROM lesson_answers WHERE user_id = $1 AND course = $2 AND lesson = $3", [userId, id, slug]);
  }
}

const isId = (v: unknown): v is number => typeof v === "number" && Number.isInteger(v) && v > 0;
const isSlug = (v: unknown): v is string => typeof v === "string" && /^[a-z0-9][a-z0-9-]{1,60}$/.test(v);
const langOf = (v: unknown): Lang => (LANGS.includes(v as Lang) ? (v as Lang) : "en");

export function lessonRoutes(store: LessonStore, repository: Repository, scope: (c: never) => Scope): Hono<AppEnv> {
  const routes = new Hono<AppEnv>();
  const allowed = async (c: unknown, userId: number): Promise<boolean> => Boolean(await repository.getUser(userId, scope(c as never)));

  routes.get("/", async (c) => {
    const userId = Number(c.req.query("userId"));
    if (!isId(userId)) return c.json({ error: "invalid query" }, 400);
    if (!(await allowed(c, userId))) return c.json({ error: "unknown user" }, 404);
    return c.json(await store.list(userId, langOf(c.req.query("lang"))));
  });

  routes.get("/:course", async (c) => {
    const userId = Number(c.req.query("userId"));
    const course = c.req.param("course");
    if (!isId(userId) || !isSlug(course)) return c.json({ error: "invalid query" }, 400);
    if (!(await allowed(c, userId))) return c.json({ error: "unknown user" }, 404);
    const view = await store.course(userId, course, langOf(c.req.query("lang")));
    return view ? c.json(view) : c.json({ error: "unknown course" }, 404);
  });

  routes.get("/:course/:lesson", async (c) => {
    const userId = Number(c.req.query("userId"));
    const { course, lesson } = c.req.param();
    if (!isId(userId) || !isSlug(course) || !isSlug(lesson)) return c.json({ error: "invalid query" }, 400);
    if (!(await allowed(c, userId))) return c.json({ error: "unknown user" }, 404);
    const view = await store.lesson(userId, course, lesson, langOf(c.req.query("lang")));
    return view ? c.json(view) : c.json({ error: "unknown lesson" }, 404);
  });

  routes.post("/check", async (c) => {
    const b = ((await c.req.json().catch(() => null)) ?? {}) as Record<string, unknown>;
    const given = b.given;
    if (
      !isId(b.userId) || !isSlug(b.course) || !isSlug(b.lesson) || typeof b.exercise !== "string" ||
      !Array.isArray(given) || given.length > 120 || !given.every((g) => typeof g === "string" && g.length <= 500)
    ) {
      return c.json({ error: "invalid answers" }, 400);
    }
    if (!(await allowed(c, b.userId))) return c.json({ error: "unknown user" }, 404);
    const state = await store.check(b.userId, b.course, b.lesson, b.exercise, given as string[], langOf(b.lang), Date.now());
    return state ? c.json(state) : c.json({ error: "unknown exercise" }, 404);
  });

  routes.put("/override", async (c) => {
    const b = ((await c.req.json().catch(() => null)) ?? {}) as Record<string, unknown>;
    if (!isId(b.userId) || !isSlug(b.course) || !isSlug(b.lesson) || typeof b.exercise !== "string" || typeof b.blank !== "number" || (b.right !== null && typeof b.right !== "boolean")) {
      return c.json({ error: "invalid override" }, 400);
    }
    if (!(await allowed(c, b.userId))) return c.json({ error: "unknown user" }, 404);
    const state = await store.override(b.userId, b.course, b.lesson, b.exercise, b.blank, b.right as boolean | null, langOf(b.lang));
    return state ? c.json(state) : c.json({ error: "not checked" }, 404);
  });

  routes.delete("/answers", async (c) => {
    const userId = Number(c.req.query("userId"));
    const course = c.req.query("course");
    const lesson = c.req.query("lesson");
    if (!isId(userId) || !isSlug(course) || !isSlug(lesson)) return c.json({ error: "invalid query" }, 400);
    if (!(await allowed(c, userId))) return c.json({ error: "unknown user" }, 404);
    await store.reset(userId, course, lesson);
    return c.body(null, 204);
  });

  return routes;
}
