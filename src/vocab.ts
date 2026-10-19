/**
 * Vocabulary tab: lessons and sections of the book, practice sessions with
 * multiple-choice and written answers, spaced repetition by Leitner boxes.
 *
 * The session in progress lives here, outside the render, so a language
 * change or another re-render does not lose it.
 */
import { COUNTS_AS_RIGHT, type Verdict } from "../shared/vocab/grade";
import { DAY, TOP_BOX, type ModePreference } from "../shared/vocab/schedule";
import { button, el } from "./dom";
import {
  SignedOutError,
  vocab,
  type User,
  type VocabAnswerResult,
  type VocabCard,
  type VocabLessonInfo,
  type VocabProgress,
} from "./store";
import { vt, type VocabKey } from "./vocab-i18n";

// ------------------------------------------------------------ preferences

interface Preferences {
  mode: ModePreference;
  /** Lesson unfolded on the home screen. */
  open: number | null;
}

const PREFERENCES_KEY = "calcul-colonnes.vocab";
const SESSION_SIZE = 15;

function loadPreferences(): Preferences {
  try {
    const saved = JSON.parse(localStorage.getItem(PREFERENCES_KEY) ?? "{}") as Partial<Preferences>;
    return {
      mode: saved.mode === "choice" || saved.mode === "written" ? saved.mode : "mixed",
      open: typeof saved.open === "number" ? saved.open : null,
    };
  } catch {
    return { mode: "mixed", open: null };
  }
}

function savePreferences(): void {
  try {
    localStorage.setItem(PREFERENCES_KEY, JSON.stringify(prefs));
  } catch {
    // not remembered: defaults next time
  }
}

const prefs = loadPreferences();

// ---------------------------------------------------------------- session

type Target = { kind: "section" | "lesson" | "due"; id: number; label: string };

interface Session {
  userId: number;
  target: Target;
  cards: VocabCard[];
  index: number;
  /** Cards answered wrong, asked again once at the end. */
  retried: Set<number>;
  result: (VocabAnswerResult & { given: string }) | null;
  right: number;
  answered: number;
  missed: Map<number, { prompt: string; expected: string }>;
  saveFailed: boolean;
}

let session: Session | null = null;
let finished: Session | null = null;
let lessonsCache: VocabLessonInfo[] | null = null;

export interface VocabContext {
  user: User;
  rerender(): void;
}

export async function vocabView(ctx: VocabContext): Promise<HTMLElement> {
  // Another player: their own sessions, not the previous player's.
  if (session && session.userId !== ctx.user.id) session = null;
  if (finished && finished.userId !== ctx.user.id) finished = null;
  if (session) return cardView(ctx, session);
  if (finished) return doneView(ctx, finished);
  return homeView(ctx);
}

async function start(ctx: VocabContext, target: Target): Promise<void> {
  const cards = await vocab.session(ctx.user.id, target, SESSION_SIZE, prefs.mode);
  finished = null;
  if (cards.length === 0) {
    // Nothing left to practise there: show the summary's "nothing to review".
    finished = { userId: ctx.user.id, target, cards, index: 0, retried: new Set(), result: null, right: 0, answered: 0, missed: new Map(), saveFailed: false };
  } else {
    session = { userId: ctx.user.id, target, cards, index: 0, retried: new Set(), result: null, right: 0, answered: 0, missed: new Map(), saveFailed: false };
  }
  ctx.rerender();
}

// ------------------------------------------------------------ home screen

/** Lesson and section titles: Spanish first, the language being learnt. */
function titleBlock(title: { en: string; es: string }, cls: string): HTMLElement {
  const block = el("span", cls);
  block.append(el("span", `${cls}-es`, title.es));
  if (title.en.toLowerCase() !== title.es.toLowerCase()) block.append(el("span", `${cls}-en`, title.en));
  return block;
}

/** A thin bar: mastered, known, learning, new. */
function statusBar(p: { new: number; learning: number; known: number; mastered: number }): HTMLElement {
  const total = p.new + p.learning + p.known + p.mastered || 1;
  const bar = el("span", "vocab-bar");
  bar.setAttribute("role", "img");
  bar.setAttribute("aria-label", vt("progressLabel", p));
  for (const part of ["mastered", "known", "learning"] as const) {
    const seg = el("span", `vocab-bar-${part}`);
    seg.style.width = `${(100 * p[part]) / total}%`;
    bar.append(seg);
  }
  return bar;
}

async function homeView(ctx: VocabContext): Promise<HTMLElement> {
  const wrap = el("section", "sheet vocab-home");
  wrap.append(el("h1", "title", vt("title")));

  lessonsCache ??= await vocab.lessons();
  const lessons = lessonsCache;
  if (lessons.length === 0) {
    lessonsCache = null; // look again next time: it may be imported meanwhile
    wrap.append(el("p", "empty", vt("empty")));
    return wrap;
  }
  const progress: VocabProgress = await vocab.progress(ctx.user.id);

  // Reviews due: the main action when there are any.
  const due = el("div", "vocab-due");
  if (progress.due > 0) {
    due.append(
      el("p", "vocab-due-count", progress.due === 1 ? vt("dueOne") : vt("dueNow", { count: progress.due })),
      button("primary", vt("reviewNow"), () => void start(ctx, { kind: "due", id: 0, label: vt("reviewNow") })),
    );
  } else {
    due.append(el("p", "vocab-due-count quiet", vt("nothingDue")));
  }
  if (progress.today.answers > 0) due.append(el("p", "hint", vt("today", progress.today)));
  wrap.append(due);

  // How questions are asked.
  const how = el("fieldset", "segmented vocab-how");
  how.append(el("legend", "field-label", vt("howTitle")));
  for (const [mode, key] of [["mixed", "howMixed"], ["choice", "howChoice"], ["written", "howWritten"]] as const) {
    const on = prefs.mode === mode;
    const option = button(on ? "segment on" : "segment", vt(key), () => {
      prefs.mode = mode;
      savePreferences();
      ctx.rerender();
    });
    option.setAttribute("aria-pressed", String(on));
    how.append(option);
  }
  wrap.append(how, el("p", "hint left", vt("howHint")));

  // Lessons, one open at a time.
  const list = el("div", "vocab-lessons");
  for (const lesson of lessons) {
    const sum = { new: 0, learning: 0, known: 0, mastered: 0, due: 0 };
    for (const s of lesson.sections) {
      const p = progress.sections[s.id];
      if (p) for (const k of Object.keys(sum) as (keyof typeof sum)[]) sum[k] += p[k];
    }
    const details = el("details", "vocab-lesson");
    details.open = prefs.open === lesson.id;
    details.addEventListener("toggle", () => {
      if (details.open) {
        prefs.open = lesson.id;
        for (const other of list.querySelectorAll<HTMLDetailsElement>("details")) if (other !== details) other.open = false;
      } else if (prefs.open === lesson.id) prefs.open = null;
      savePreferences();
    });
    const summary = el("summary", "vocab-lesson-head");
    summary.append(titleBlock(lesson.title, "vocab-lesson-title"), statusBar(sum));
    if (sum.due > 0) summary.append(el("span", "vocab-badge", String(sum.due)));
    details.append(summary);

    const sections = el("ul", "vocab-sections");
    for (const section of lesson.sections) {
      const p = progress.sections[section.id] ?? { new: section.entries, learning: 0, known: 0, mastered: 0, due: 0 };
      const item = el("li", "vocab-section");
      const text = el("div", "vocab-section-text");
      text.append(titleBlock(section.title, "vocab-section-title"));
      const meta = el("span", "vocab-section-meta", vt("words", { count: section.entries }));
      if (p.due > 0) meta.append(" · ", el("span", "vocab-section-due", vt("sectionDue", { count: p.due })));
      text.append(meta, statusBar(p));
      const started = p.new < section.entries;
      const go = button(started ? "ghost small" : "primary small", vt(started ? "continue" : "learn"), () =>
        void start(ctx, { kind: "section", id: section.id, label: section.title.es }),
      );
      go.setAttribute("aria-label", `${vt(started ? "continue" : "learn")} : ${section.title.es}`);
      item.append(text, go);
      sections.append(item);
    }
    details.append(
      sections,
      button("ghost small vocab-whole", vt("wholeLesson"), () =>
        void start(ctx, { kind: "lesson", id: lesson.id, label: lesson.title.es }),
      ),
    );
    list.append(details);
  }
  wrap.append(list);
  return wrap;
}

// ------------------------------------------------------------------ cards

/** The view is built before it is placed in the page: focus on the next frame. */
const afterRender = (fn: () => void): void => void requestAnimationFrame(fn);

const SPANISH_LETTERS = ["á", "é", "í", "ó", "ú", "ü", "ñ", "¿", "¡"];

function boxDots(box: number): HTMLElement {
  const dots = el("span", "vocab-box");
  dots.setAttribute("role", "img");
  dots.setAttribute("aria-label", vt("boxLabel", { box: Math.max(box, 0) }));
  for (let i = 1; i <= TOP_BOX; i++) dots.append(el("span", i <= box ? "on" : ""));
  return dots;
}

function verdictText(verdict: Verdict, expected: string): string {
  return vt(verdict as VocabKey, { expected });
}

function whenBack(result: VocabAnswerResult): string {
  const days = Math.round((result.dueAt - Date.now()) / DAY);
  if (days <= 0) return vt("backSoon");
  if (days === 1) return vt("backTomorrow");
  return vt("backIn", { days });
}

function cardView(ctx: VocabContext, s: Session): HTMLElement {
  const card = s.cards[s.index]!;
  const wrap = el("section", "sheet vocab-card");
  wrap.tabIndex = -1;

  const head = el("div", "quiz-head");
  head.append(
    el("span", "quiz-count", vt("progress", { index: s.index + 1, total: s.cards.length })),
    el("span", "quiz-topic", s.target.label),
  );
  const bar = el("div", "progress");
  const fill = el("div", "progress-bar");
  fill.style.width = `${(100 * s.index) / s.cards.length}%`;
  bar.append(fill);
  wrap.append(head, bar);

  const recognise = card.direction === "recognise";
  const question = el("div", "vocab-question");
  question.append(el("p", "vocab-ask", vt(recognise ? "askMeaning" : "askSpanish")));
  const prompt = el("p", "vocab-prompt", card.prompt);
  prompt.lang = recognise ? "es" : "en";
  question.append(prompt);
  const notes = el("p", "vocab-notes");
  if (card.feminine) notes.append(el("span", "vocab-fem", `f · ${vt("feminine")}`));
  if (card.group) notes.append(el("span", "vocab-group", card.group));
  notes.append(boxDots(s.result ? s.result.box : card.box));
  question.append(notes);
  wrap.append(question);

  const feedback = el("p", "vocab-feedback");
  feedback.setAttribute("role", "status");
  const answerLang = recognise ? "en" : "es";

  const submit = async (given: string): Promise<void> => {
    if (s.result) return;
    // The server grades (shared/vocab/grade.ts) and moves the card between boxes.
    try {
      const result = await vocab.answer({ userId: s.userId, entryId: card.entryId, direction: card.direction, mode: card.mode, given });
      s.result = { ...result, given };
      s.answered++;
      if (result.correct) s.right++;
      else {
        const key = card.entryId * 2 + (recognise ? 0 : 1);
        s.missed.set(key, { prompt: card.prompt, expected: result.expected });
        // Asked again at the end, once: the box has gone back to 1.
        if (!s.retried.has(key)) {
          s.retried.add(key);
          s.cards.push({ ...card, box: result.box });
        }
      }
    } catch (error) {
      if (error instanceof SignedOutError) {
        // The home screen's next request reports it, and the app goes back to sign-in.
        session = null;
        ctx.rerender();
        return;
      }
      s.saveFailed = true;
      feedback.className = "vocab-feedback bad";
      feedback.textContent = vt("offline");
      return;
    }
    ctx.rerender();
  };

  const advance = (): void => {
    s.result = null;
    if (s.index + 1 >= s.cards.length) {
      finished = s;
      session = null;
    } else s.index++;
    ctx.rerender();
  };

  if (card.mode === "choice") {
    const choices = el("div", "choices");
    (card.options ?? []).forEach((option, i) => {
      const b = button("choice", "", () => void submit(option));
      b.append(el("span", "letter", "ABCD"[i] ?? ""), el("span", "choice-text", option));
      b.lang = answerLang;
      if (s.result) {
        b.disabled = true;
        if (option === s.result.expected) b.classList.add("is-right");
        else if (option === s.result.given) b.classList.add("is-wrong");
      }
      choices.append(b);
    });
    wrap.append(choices);
  } else {
    const form = el("form", "vocab-write");
    const label = el("label", "field");
    label.append(el("span", "field-label", vt(recognise ? "writeEnglish" : "writeSpanish")));
    const input = el("input", "vocab-input");
    input.type = "text";
    input.lang = answerLang;
    input.autocomplete = "off";
    input.spellcheck = false;
    input.setAttribute("autocapitalize", "off");
    input.setAttribute("autocorrect", "off");
    if (s.result) {
      input.value = s.result.given;
      input.disabled = true;
      input.classList.add(s.result.correct ? "is-right" : "is-wrong");
    }
    label.append(input);
    form.append(label);
    if (!recognise && !s.result) {
      // Letters missing from most keyboards outside Spain.
      const letters = el("div", "vocab-letters");
      letters.setAttribute("aria-label", vt("accents"));
      for (const letter of SPANISH_LETTERS) {
        const key = button("ghost vocab-letter", letter, () => {
          const at = input.selectionStart ?? input.value.length;
          input.setRangeText(letter, at, input.selectionEnd ?? at, "end");
          input.focus();
        });
        key.type = "button";
        key.tabIndex = -1;
        letters.append(key);
      }
      form.append(letters);
    }
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      if (s.result) advance();
      else if (input.value.trim()) void submit(input.value);
    });
    const check = el("button", "primary", vt("check"));
    check.type = "submit";
    if (!s.result) form.append(check);
    wrap.append(form);
    if (!s.result) afterRender(() => input.focus());
  }

  if (s.result) {
    const r = s.result;
    feedback.className = `vocab-feedback ${COUNTS_AS_RIGHT.has(r.verdict) ? "good" : "bad"}`;
    const line = el("span", "vocab-verdict", r.verdict === "right" ? vt("right") : verdictText(r.verdict, r.expected));
    feedback.append(line);
    if (r.feminine) feedback.append(el("span", "vocab-fem", ` (f)`));
    feedback.append(el("span", "vocab-when", r.correct ? whenBack(r) : vt("again")));
  }
  wrap.append(feedback);

  const actions = el("div", "actions wrap");
  if (s.result) {
    const next = button("primary", s.index + 1 >= s.cards.length ? vt("finish") : vt("next"), advance);
    actions.append(next);
    afterRender(() => next.focus());
  }
  actions.append(
    button("ghost small", vt("quit"), () => {
      finished = s.answered > 0 ? s : null;
      session = null;
      ctx.rerender();
    }),
  );
  wrap.append(actions);

  // Keyboard: 1–4 or A–D to choose; Enter to go on.
  wrap.addEventListener("keydown", (event) => {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    if (event.key === "Enter" && s.result && !(event.target instanceof HTMLButtonElement) && !(event.target instanceof HTMLInputElement)) {
      event.preventDefault();
      advance();
      return;
    }
    if (card.mode === "choice" && !s.result) {
      const key = event.key.toLowerCase();
      const pick = "1234".includes(key) ? "1234".indexOf(key) : "abcd".indexOf(key);
      const option = card.options?.[pick];
      if (pick >= 0 && option !== undefined) {
        event.preventDefault();
        void submit(option);
      }
    }
  });
  if (card.mode === "choice" && !s.result) afterRender(() => wrap.focus());
  return wrap;
}

// ---------------------------------------------------------------- summary

function doneView(ctx: VocabContext, s: Session): HTMLElement {
  const wrap = el("section", "sheet vocab-done");
  wrap.append(el("h1", "title", vt("doneTitle")));
  if (s.answered === 0) {
    wrap.append(el("p", "empty", vt("doneNothing")));
  } else {
    wrap.append(el("p", "big-score", vt("doneScore", { right: s.right, total: s.answered })));
    if (s.missed.size > 0) {
      wrap.append(el("h2", "subtitle", vt("doneMissed")));
      const list = el("ul", "vocab-missed");
      for (const m of s.missed.values()) {
        const item = el("li");
        item.append(el("span", "vocab-missed-prompt", m.prompt), el("span", "vocab-missed-answer", m.expected));
        list.append(item);
      }
      wrap.append(list);
    }
  }
  const actions = el("div", "actions wrap");
  if (s.answered > 0) actions.append(button("primary", vt("anotherSession"), () => void start(ctx, s.target)));
  actions.append(
    button(s.answered > 0 ? "ghost" : "primary", vt("backToLessons"), () => {
      finished = null;
      ctx.rerender();
    }),
  );
  wrap.append(actions);
  return wrap;
}
