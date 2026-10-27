/**
 * A course, read inside its test (src/courses): opened from the test's
 * settings or from a corrected question, which jumps to the section that
 * teaches it. The page keeps its section when the language changes; Back
 * returns to where it was opened from.
 */
import { button, el } from "./dom";
import { currentLang, type Lang } from "./i18n";
import { COURSE_OF_SUBJECT, loadCourse, sectionOf, type CourseId } from "./courses/index";
import { parseMarkdown, renderBlock, inline, type Block } from "./markdown";

const TEXTS = {
  fr: { open: "📖 Lire le cours", back: "← Retour au test", contents: "Sommaire", loading: "Chargement du cours…", failed: "Le cours n'a pas pu être chargé.", top: "↑ Sommaire", link: "📖 Dans le cours : {section}", linkShort: "📖 Dans le cours" },
  es: { open: "📖 Leer el curso", back: "← Volver al test", contents: "Índice", loading: "Cargando el curso…", failed: "No se pudo cargar el curso.", top: "↑ Índice", link: "📖 En el curso: {section}", linkShort: "📖 En el curso" },
  en: { open: "📖 Read the course", back: "← Back to the test", contents: "Contents", loading: "Loading the course…", failed: "The course could not be loaded.", top: "↑ Contents", link: "📖 In the course: {section}", linkShort: "📖 In the course" },
} satisfies Record<Lang, Record<string, string>>;

type CourseKey = keyof (typeof TEXTS)["en"];
export const ct = (key: CourseKey, section = ""): string => TEXTS[currentLang()][key].replace("{section}", section);

/** The course being read, if any, and the section to show. */
let reading: { id: CourseId; section: number | null } | null = null;

export const courseOf = (subject: string): CourseId | null => COURSE_OF_SUBJECT[subject] ?? null;
export const readingCourse = (subject: string): boolean => reading !== null && reading.id === courseOf(subject);

export function openCourse(id: CourseId, section: number | null, rerender: () => void): void {
  reading = { id, section };
  rerender();
  window.scrollTo({ top: 0 });
}

export function closeCourse(): void {
  reading = null;
}

/** The `##` sections of a course: each heading with the blocks that follow it. */
interface Parsed {
  title: string;
  intro: Block[];
  sections: { heading: string; blocks: Block[] }[];
}

const parsed = new Map<string, Parsed>();

function parse(source: string): Parsed {
  const result: Parsed = { title: "", intro: [], sections: [] };
  for (const block of parseMarkdown(source)) {
    if (block.kind === "heading" && block.level === 1 && !result.title) result.title = block.text;
    else if (block.kind === "heading" && block.level === 2) result.sections.push({ heading: block.text, blocks: [] });
    else (result.sections.at(-1)?.blocks ?? result.intro).push(block);
  }
  return result;
}

export async function courseText(id: CourseId, lang: Lang = currentLang()): Promise<Parsed> {
  const key = `${id}/${lang}`;
  const known = parsed.get(key);
  if (known) return known;
  const result = parse(await loadCourse(id, lang));
  parsed.set(key, result);
  return result;
}

const sectionId = (i: number): string => `course-s${i}`;

/** The course page, filled once its text has loaded. */
export function courseView(subject: string, rerender: () => void): HTMLElement {
  const id = courseOf(subject)!;
  const wrap = el("section", "sheet course");
  wrap.dataset.course = id;
  const bar = el("div", "course-bar");
  bar.append(
    button("ghost small", ct("back"), () => {
      closeCourse();
      rerender();
    }),
  );
  const body = el("div", "course-body");
  body.append(el("p", "hint", ct("loading")));
  wrap.append(bar, body);

  const lang = currentLang();
  courseText(id, lang).then(
    (course) => {
      body.replaceChildren();
      const title = el("h1", "title course-title");
      inline(course.title, title);
      const contents = el("nav", "course-contents");
      contents.setAttribute("aria-label", ct("contents"));
      contents.id = "course-contents";
      contents.append(el("h2", "course-contents-title", ct("contents")));
      const list = el("ol", "course-toc");
      course.sections.forEach((s, i) => {
        const item = el("li");
        const link = el("a");
        link.href = `#${sectionId(i)}`;
        inline(s.heading, link);
        link.addEventListener("click", (event) => {
          event.preventDefault();
          if (reading) reading.section = i;
          document.getElementById(sectionId(i))?.scrollIntoView({ block: "start" });
        });
        item.append(link);
        list.append(item);
      });
      contents.append(list);
      body.append(title, ...course.intro.map((b) => renderBlock(b)), contents);
      course.sections.forEach((s, i) => {
        const section = el("section", "course-section");
        section.append(renderBlock({ kind: "heading", level: 2, text: s.heading }, sectionId(i)), ...s.blocks.map((b) => renderBlock(b)));
        const up = el("a", "course-top", ct("top"));
        up.href = "#course-contents";
        up.addEventListener("click", (event) => {
          event.preventDefault();
          contents.scrollIntoView({ block: "start" });
        });
        section.append(up);
        body.append(section);
      });
      const target = reading?.section;
      if (target !== null && target !== undefined) requestAnimationFrame(() => document.getElementById(sectionId(target))?.scrollIntoView({ block: "start" }));
    },
    () => body.replaceChildren(el("p", "note", ct("failed"))),
  );
  return wrap;
}

/** The button of a corrected question: opens the section that teaches it, named once the course has loaded. */
export function courseLink(subject: string, topic: string, skill: string, rerender: () => void): HTMLElement | null {
  const id = courseOf(subject);
  const section = sectionOf(topic, skill);
  if (!id || section === null) return null;
  const link = button("ghost small course-link", ct("linkShort"), () => openCourse(id, section, rerender));
  void courseText(id).then((course) => {
    const heading = course.sections[section]?.heading;
    if (heading) link.textContent = ct("link", heading.replace(/[*`]/g, ""));
  }, () => undefined);
  return link;
}
