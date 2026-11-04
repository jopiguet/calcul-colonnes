/**
 * Language courses (docs/language-courses.md): a course's lessons, and a
 * lesson read and worked through: its explanations and tables, its exercises
 * filled in on the page and checked one by one by the server, its summary and
 * its words. Answers are kept with their results; a free answer the key did
 * not foresee can be marked right by the player.
 */
import { button, el } from "./dom";
import { inline, parseMarkdown, renderBlock } from "./markdown";
import { lessons, type User } from "./store";
import { lt } from "./lessons-i18n";
import { infoLabel } from "./vocab-i18n";
import type { CourseInfo, ExerciseState, LessonView } from "../shared/lessons/api";
import type { PublicExercise, Segment } from "../shared/lessons/format";

export interface LessonsContext {
  user: User;
  course: string;
  lesson: string | null;
  openLesson: (lesson: string | null) => void;
  /** Opens the course's vocabulary book (its slug). */
  openVocab: (slug: string) => void;
  rerender: () => void;
}

export async function lessonsView(ctx: LessonsContext): Promise<HTMLElement> {
  return ctx.lesson === null ? coursePage(ctx) : lessonPage(ctx, ctx.lesson);
}

/** A course's card on the home page. */
export function courseStatus(c: CourseInfo): { text: string; waiting: boolean } {
  return { text: c.done > 0 ? lt("homeStatus", { done: c.done, exercises: c.exercises }) : lt("homeText", { lessons: c.lessons, exercises: c.exercises }), waiting: false };
}

async function coursePage(ctx: LessonsContext): Promise<HTMLElement> {
  const view = await lessons.course(ctx.user.id, ctx.course);
  const c = view.course;
  const wrap = el("section", "sheet lessons-home");
  wrap.append(el("h1", "title", `${c.icon} ${c.title}`), el("p", "lessons-description", c.description));
  wrap.append(el("p", "lessons-progress", lt("lessonsDone", { done: c.done, exercises: c.exercises })));
  const next = view.lessons.find((l) => l.done < l.exercises) ?? view.lessons[0];
  const actions = el("div", "actions wrap");
  if (next) actions.append(button("primary lessons-continue", next.checked === 0 && next.n === 1 ? lt("start") : lt("continue", { n: next.n }), () => ctx.openLesson(next.slug)));
  if (c.vocabBook) actions.append(button("ghost lessons-practise", lt("practise"), () => ctx.openVocab(c.vocabBook!)));
  wrap.append(actions);
  const list = el("ol", "lessons-list");
  for (const l of view.lessons) {
    const item = el("li");
    const b = button("lessons-item", "", () => ctx.openLesson(l.slug));
    b.dataset.lesson = l.slug;
    const done = l.exercises > 0 && l.done === l.exercises;
    b.append(
      el("span", "lessons-item-title", l.title),
      el("span", `lessons-item-status${done ? " done" : ""}`, l.checked > 0 ? lt("lessonStatus", { done: l.done, exercises: l.exercises }) : lt("lessonTodo", { exercises: l.exercises })),
    );
    item.append(b);
    list.append(item);
  }
  wrap.append(list);
  return wrap;
}

async function lessonPage(ctx: LessonsContext, slug: string): Promise<HTMLElement> {
  const view = await lessons.lesson(ctx.user.id, ctx.course, slug);
  const wrap = el("article", "sheet lesson-page");
  wrap.lang = document.documentElement.lang;

  const nav = el("nav", "lesson-nav");
  nav.append(button("ghost small", lt("backToCourse", { course: `${view.course.icon} ${view.course.title}` }), () => ctx.openLesson(null)));
  const steps = el("span", "lesson-steps");
  if (view.previous) steps.append(button("ghost small", lt("previous", { n: view.previous.n }), () => ctx.openLesson(view.previous!.slug)));
  if (view.next) steps.append(button("ghost small", lt("next", { n: view.next.n }), () => ctx.openLesson(view.next!.slug)));
  nav.append(steps);
  wrap.append(nav, el("h1", "title lesson-title", view.lesson.title));

  let number = 0;
  for (const part of view.lesson.parts) {
    if (part.kind === "text") {
      const box = el("div", "lesson-text");
      for (const block of parseMarkdown(part.markdown)) box.append(renderBlock(block));
      wrap.append(box);
    } else if (part.kind === "summary") {
      const box = el("aside", "lesson-summary");
      box.append(el("h2", "lesson-summary-title", lt("summary")));
      for (const block of parseMarkdown(part.markdown)) box.append(renderBlock(block));
      wrap.append(box);
    } else {
      number++;
      wrap.append(exerciseCard(ctx, view, part.exercise, number, view.exercises[part.exercise.id] ?? { given: [] }));
    }
  }

  if (view.lesson.vocab.length > 0) wrap.append(vocabTable(ctx, view));

  const end = el("div", "actions wrap lesson-end");
  if (view.next) end.append(button("primary", lt("next", { n: view.next.n }), () => ctx.openLesson(view.next!.slug)));
  if (Object.keys(view.exercises).length > 0) {
    end.append(
      button("ghost lesson-restart", lt("restart"), async () => {
        if (!window.confirm(lt("restartConfirm"))) return;
        await lessons.reset(ctx.user.id, ctx.course, slug);
        ctx.rerender();
      }),
    );
  }
  wrap.append(end);
  return wrap;
}

/** The words of the lesson: the word, its forms, its meaning in the interface's language. */
function vocabTable(ctx: LessonsContext, view: LessonView): HTMLElement {
  const box = el("section", "lesson-vocab");
  box.append(el("h2", "course-h2", lt("vocabulary")));
  const table = el("table", "lesson-vocab-table");
  const head = el("tr");
  head.append(el("th", "", lt("vocabTerm")), el("th", "", lt("vocabForms")), el("th", "", lt("vocabMeaning")));
  table.append(head);
  for (const w of view.lesson.vocab) {
    const row = el("tr");
    const term = el("td", "lesson-vocab-term");
    const sign = el("span", "lesson-vocab-sign", w.term);
    sign.lang = view.course.language;
    term.append(sign);
    if (w.reading) term.append(el("span", "lesson-vocab-reading", w.reading));
    const i = w.info;
    const forms = [
      i?.genitive ? lt("genitive", { form: i.genitive }) : "",
      i?.gender ? infoLabel(i.gender) : "",
      i?.principalParts?.join(", ") ?? "",
      ...(i?.forms ?? []).map((f) => `${infoLabel(f.label)} ${f.value}`),
      i?.readings?.map((r) => r.value).join(", ") ?? "",
    ].filter(Boolean).join(" · ") || (i?.type ? infoLabel(i.type) : "");
    row.append(term, el("td", "lesson-vocab-forms", forms), el("td", "", w.meaning));
    table.append(row);
  }
  box.append(table);
  if (view.course.vocabBook) box.append(button("ghost lessons-practise", lt("practiseLesson"), () => ctx.openVocab(view.course.vocabBook!)));
  return box;
}

/** The letters a keyboard lacks (ꜣ ꜥ ḥ ḫ…): each button writes its letter at the cursor of the field last used. */
function keyRow(keys: string[], target: () => HTMLInputElement): HTMLElement {
  const row = el("div", "lesson-keys");
  row.setAttribute("aria-label", lt("keysAria"));
  for (const k of keys) {
    const b = button("ghost small lesson-key", k, () => {
      const input = target();
      const start = input.selectionStart ?? input.value.length;
      const end = input.selectionEnd ?? start;
      input.value = input.value.slice(0, start) + k + input.value.slice(end);
      input.focus();
      input.setSelectionRange(start + k.length, start + k.length);
      input.dispatchEvent(new Event("input"));
    });
    // The field keeps its focus and its cursor.
    b.addEventListener("mousedown", (event) => event.preventDefault());
    row.append(b);
  }
  return row;
}

/** One exercise: its instruction, its items or table with a field (or a choice) for each blank, Check, the result. */
function exerciseCard(ctx: LessonsContext, view: LessonView, e: PublicExercise, number: number, initial: ExerciseState): HTMLElement {
  let state = initial;
  /** The blank last focused, where a key of the key row writes. */
  let lastField = -1;
  const given: string[] = e.blanks.map((_, i) => state.given[i] ?? "");
  const card = el("section", "lesson-exercise");
  card.dataset.exercise = e.id;

  const draw = (): void => {
    card.replaceChildren();
    const head = el("header", "lesson-exercise-head");
    head.append(el("span", "lesson-exercise-n", lt("exercise", { n: number })));
    if (state.results) {
      head.append(el("span", `lesson-exercise-score${state.score === state.total ? " full" : ""}`, lt("score", { score: state.score ?? 0, total: state.total ?? 0 })));
    }
    card.append(head);
    if (e.prompt) for (const block of parseMarkdown(e.prompt)) card.append(renderBlock(block));

    const fields: HTMLInputElement[] = [];
    const segments = (parts: Segment[], target: HTMLElement): HTMLElement => {
      for (const s of parts) {
        if (typeof s === "string") inline(s, target);
        else target.append(blankField(s.blank));
      }
      return target;
    };
    const blankField = (i: number): HTMLElement => {
      const blank = e.blanks[i]!;
      const result = state.results?.[i];
      const box = el("span", `lesson-blank lb-${blank.kind}${result ? ` lb-${result}` : ""}`);
      if (blank.kind === "choice") {
        const group = el("span", "lesson-choice");
        group.setAttribute("role", "radiogroup");
        group.setAttribute("aria-label", lt("choiceAria", { n: number, i: i + 1 }));
        blank.options!.forEach((option, k) => {
          const on = given[i] === String(k);
          const b = button(`lesson-option${on ? " on" : ""}`, "", () => {
            given[i] = String(k);
            draw();
          });
          inline(option, b);
          b.setAttribute("role", "radio");
          b.setAttribute("aria-checked", String(on));
          group.append(b);
        });
        box.append(group);
      } else {
        const input = el("input", "lesson-input");
        input.type = "text";
        input.value = given[i] ?? "";
        input.size = blank.size;
        input.autocomplete = "off";
        input.spellcheck = false;
        input.setAttribute("autocapitalize", "off");
        input.setAttribute("aria-label", lt("blankAria", { n: number, i: i + 1 }));
        input.dataset.blank = String(i);
        input.addEventListener("input", () => {
          given[i] = input.value;
          box.classList.remove("lb-right", "lb-wrong", "lb-check", "lb-blank");
        });
        input.addEventListener("keydown", (event) => {
          if (event.key !== "Enter") return;
          event.preventDefault();
          const next = fields[fields.indexOf(input) + 1];
          if (next) next.focus();
          else void check();
        });
        input.addEventListener("focus", () => (lastField = i));
        fields.push(input);
        box.append(input);
      }
      // After the check: the key under a blank not right, and the player's own mark.
      if (state.results && result !== "right" && state.expected?.[i]) {
        box.append(el("span", "lesson-expected", lt(blank.kind === "free" ? "model" : "expected", { answer: state.expected[i]! })));
        if ((result === "wrong" || result === "check") && blank.kind !== "choice") {
          box.append(button("ghost small lesson-mark", lt("markRight"), () => void mark(i, true)));
        }
      }
      if (state.overridden?.includes(i)) box.append(button("ghost small lesson-unmark", lt("unmark"), () => void mark(i, null)));
      return box;
    };

    if (e.items.length) {
      const list = el("ol", "lesson-items");
      for (const item of e.items) list.append(segments(item.segments, el("li", "lesson-item")));
      card.append(list);
    }
    if (e.table) {
      const scroll = el("div", "course-table lesson-table");
      const table = el("table");
      const head = el("tr");
      for (const cell of e.table.header) head.append(segments(cell, el("th")));
      table.append(head);
      for (const row of e.table.rows) {
        const tr = el("tr");
        for (const cell of row) tr.append(segments(cell, el("td")));
        table.append(tr);
      }
      scroll.append(table);
      card.append(scroll);
    }
    if (fields.length && view.course.keys.length) card.append(keyRow(view.course.keys, () => fields.find((f) => f.dataset.blank === String(lastField)) ?? fields[0]!));
    if (state.results?.includes("check")) card.append(el("p", "lesson-compare hint", lt("compare")));
    const status = el("p", "lesson-status");
    status.setAttribute("role", "status");
    const go = button("primary lesson-check", state.results ? lt("checkAgain") : lt("check"), () => void check());
    const actions = el("div", "actions");
    actions.append(go);
    card.append(actions, status);

    async function check(): Promise<void> {
      go.disabled = true;
      go.textContent = lt("checking");
      try {
        state = await lessons.check(ctx.user.id, ctx.course, view.lesson.slug, e.id, given);
        draw();
      } catch {
        go.disabled = false;
        go.textContent = lt("check");
        status.textContent = lt("failed");
      }
    }
  };

  async function mark(i: number, right: boolean | null): Promise<void> {
    try {
      state = await lessons.override(ctx.user.id, ctx.course, view.lesson.slug, e.id, i, right);
      draw();
    } catch {
      /* the next check says it */
    }
  }

  draw();
  return card;
}
