/**
 * The courses read next to a test: one Markdown file per language in
 * `src/courses/<id>/<lang>.md`, loaded on demand (each its own chunk), so the
 * app's first load does not carry them. `npm run check:courses` checks that
 * the three languages have the same headings, code, links and tables.
 *
 * A course's sections are its `##` headings, counted from 0. A question
 * points to the section that teaches it: by its skill when one is listed,
 * else by its topic.
 */
import type { Lang } from "../i18n";
export { sectionOf } from "./sections";

/** One course per test subject, named like it. */
export type CourseId = "maths" | "chemistry" | "linux" | "chembio" | "sql" | "rust" | "ts" | "react" | "gcp" | "econ" | "calc" | "cf" | "marx" | "github" | "deploy";

export const COURSE_IDS: CourseId[] = ["maths", "chemistry", "linux", "chembio", "sql", "rust", "ts", "react", "gcp", "econ", "calc", "cf", "marx", "github", "deploy"];

const loaders = import.meta.glob<string>("./*/*.md", { query: "?raw", import: "default" });
const cache = new Map<string, Promise<string>>();

/** The course's Markdown in that language (English when a file is missing). */
export function loadCourse(id: CourseId, lang: Lang): Promise<string> {
  const key = `${id}/${lang}`;
  let text = cache.get(key);
  if (!text) {
    const load = loaders[`./${id}/${lang}.md`] ?? loaders[`./${id}/en.md`];
    text = load ? load() : Promise.reject(new Error(`no course ${id}`));
    cache.set(key, text);
  }
  return text;
}

/** The test subject a course belongs to: the subjects whose course is written. */
export const COURSE_OF_SUBJECT: Record<string, CourseId> = Object.fromEntries(
  COURSE_IDS.filter((id) => loaders[`./${id}/en.md`]).map((id) => [id, id]),
);

