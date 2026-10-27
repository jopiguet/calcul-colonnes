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

export type CourseId = "cf" | "marx";

export const COURSE_IDS: CourseId[] = ["cf", "marx"];

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

/** The test subject a course belongs to. */
export const COURSE_OF_SUBJECT: Record<string, CourseId> = { cf: "cf", marx: "marx" };

