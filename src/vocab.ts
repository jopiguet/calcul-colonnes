/**
 * A vocabulary book: its lessons and sections, practice sessions with
 * multiple-choice and written answers, spaced repetition by Leitner boxes.
 * One screen per book (Spanish translations, English definitions…).
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
  type VocabBookInfo,
  type VocabCard,
  type VocabProgress,
} from "./store";
import { langName, vt, type VocabKey } from "./vocab-i18n";
import { statsView } from "./vocab-stats";

// ------------------------------------------------------------ preferences

interface Preferences {
  mode: ModePreference;
  /** Cards per session. */
  size: number;
  /** Lesson unfolded on the home screen. */
  open: number | null;
  /** Order of new words, per book id; absent: random for an alphabetical list, the book's order otherwise. */
  order: Record<number, "book" | "random">;
  /** Japanese rōmaji, per book id: shown with the question, or only after the answer. */
  romaji: Record<number, "always" | "after">;
}

const PREFERENCES_KEY = "calcul-colonnes.vocab";
const SIZES = [15, 30, 50];

function loadPreferences(): Preferences {
  try {
    const saved = JSON.parse(localStorage.getItem(PREFERENCES_KEY) ?? "{}") as Partial<Preferences>;
    return {
      mode: saved.mode === "choice" || saved.mode === "written" ? saved.mode : "mixed",
      size: SIZES.includes(saved.size as number) ? (saved.size as number) : SIZES[0]!,
      open: typeof saved.open === "number" ? saved.open : null,
      order: Object.fromEntries(
        Object.entries(typeof saved.order === "object" && saved.order ? saved.order : {}).filter(
          ([, v]) => v === "book" || v === "random",
        ),
      ) as Preferences["order"],
      romaji: Object.fromEntries(
        Object.entries(typeof saved.romaji === "object" && saved.romaji ? saved.romaji : {}).filter(
          ([, v]) => v === "always" || v === "after",
        ),
      ) as Preferences["romaji"],
    };
  } catch {
    return { mode: "mixed", size: SIZES[0]!, open: null, order: {}, romaji: {} };
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

/** What a session covers (a section, a lesson, everything) and what for. */
type Target = { kind: "section" | "lesson" | "all"; id: number; purpose: "learn" | "review" | "due"; label: string };

interface Session {
  userId: number;
  bookId: number;
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
/** The book whose statistics page is open, if any. */
let statsOf: number | null = null;

export interface VocabContext {
  user: User;
  book: VocabBookInfo;
  rerender(): void;
}

/** Order of new words for this book: the player's choice, or the book's default. */
const newOrder = (book: VocabBookInfo): "book" | "random" =>
  prefs.order[book.id] ?? (book.order === "alphabetical" ? "random" : "book");

/** "Vocabulaire espagnol", "Vocabulaire anglais": the book's language studied. */
export const bookTitle = (book: VocabBookInfo): string => vt("title", { lang: langName(book.term) });

export async function vocabView(ctx: VocabContext): Promise<HTMLElement> {
  // Another player or another book: not the previous session.
  const other = (s: Session | null) => s && (s.userId !== ctx.user.id || s.bookId !== ctx.book.id);
  if (other(session)) session = null;
  if (other(finished)) finished = null;
  if (session) return cardView(ctx, session);
  if (finished) return doneView(ctx, finished);
  if (statsOf === ctx.book.id) {
    return statsView({
      user: ctx.user,
      book: ctx.book,
      onBack: () => {
        statsOf = null;
        ctx.rerender();
      },
    });
  }
  return homeView(ctx);
}

/** True while a session is under way: the app must not reload under it. */
export function vocabBusy(): boolean {
  return session !== null;
}

/** Japanese rōmaji with the question, or only after the answer. */
const romajiAlways = (book: VocabBookInfo): boolean => (prefs.romaji[book.id] ?? "always") === "always";

async function start(ctx: VocabContext, target: Target): Promise<void> {
  // The whole book: the server takes the book's id.
  const query = target.kind === "all" ? { ...target, id: ctx.book.id } : target;
  const cards = await vocab.session(ctx.user.id, query, prefs.size, prefs.mode, newOrder(ctx.book));
  finished = null;
  const fresh: Session = {
    userId: ctx.user.id, bookId: ctx.book.id, target, cards, index: 0, retried: new Set(),
    result: null, right: 0, answered: 0, missed: new Map(), saveFailed: false,
  };
  // Nothing left to practise there: the summary says so.
  if (cards.length === 0) finished = fresh;
  else session = fresh;
  ctx.rerender();
}

// ------------------------------------------------------------ home screen

/** Lesson and section titles: in the language studied, the other below when the book has it. */
function titleBlock(title: string, subtitle: string, cls: string): HTMLElement {
  const block = el("span", cls);
  block.append(el("span", `${cls}-es`, title));
  if (subtitle && subtitle.toLowerCase() !== title.toLowerCase()) block.append(el("span", `${cls}-en`, subtitle));
  return block;
}

/** A thin bar: mastered, known, learning, new. */
export function statusBar(p: { new: number; learning: number; known: number; mastered: number }): HTMLElement {
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
  const { book } = ctx;
  const wrap = el("section", "sheet vocab-home");
  wrap.append(
    el("h1", "title", bookTitle(book)),
    el("p", "vocab-source", `${book.title} · ${vt("words", { count: book.entries })}`),
  );
  const statsLink = button("ghost small vocab-stats-link", vt("stats"), () => {
    statsOf = book.id;
    ctx.rerender();
  });
  wrap.append(statsLink);
  const lessons = book.lessons;
  const progress: VocabProgress = await vocab.progress(ctx.user.id);
  const mine = progress.books[book.id] ?? { due: 0, started: 0 };

  // Reviews due: the main action when there are any.
  const due = el("div", "vocab-due");
  if (mine.due > 0) {
    due.append(
      el("p", "vocab-due-count", mine.due === 1 ? vt("dueOne") : vt("dueNow", { count: mine.due })),
      button("primary", vt("reviewNow"), () =>
        void start(ctx, { kind: "all", id: 0, purpose: "due", label: vt("reviewNow") }),
      ),
    );
  } else {
    due.append(el("p", "vocab-due-count quiet", vt("nothingDue")));
  }
  // Every word started, due or not: before a test, or to go further.
  // New words from anywhere in the book: at random, or in the book's order.
  const random = newOrder(book) === "random";
  due.append(
    button(mine.due > 0 || mine.started > 0 ? "ghost" : "primary", vt(random ? "learnRandom" : "learnBook"), () =>
      void start(ctx, { kind: "all", id: 0, purpose: "learn", label: vt("allVocabulary") }),
    ),
  );
  if (mine.started > 0) {
    due.append(
      button(mine.due > 0 ? "ghost" : "primary", vt("reviewAll"), () =>
        void start(ctx, { kind: "all", id: 0, purpose: "review", label: vt("allVocabulary") }),
      ),
    );
  }
  if (progress.today.answers > 0) due.append(el("p", "hint", vt("today", progress.today)));
  wrap.append(due);

  // Cards per session.
  const size = el("fieldset", "segmented vocab-size");
  size.append(el("legend", "field-label", vt("sizeTitle")));
  for (const value of SIZES) {
    const on = prefs.size === value;
    const option = button(on ? "segment on" : "segment", String(value), () => {
      prefs.size = value;
      savePreferences();
      ctx.rerender();
    });
    option.setAttribute("aria-pressed", String(on));
    size.append(option);
  }
  wrap.append(size);

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

  // Which new words come first.
  const order = el("fieldset", "segmented vocab-order");
  order.append(el("legend", "field-label", vt("orderTitle")));
  for (const [value, key] of [["random", "orderRandom"], ["book", "orderBook"]] as const) {
    const on = newOrder(book) === value;
    const option = button(on ? "segment on" : "segment", vt(key), () => {
      prefs.order[book.id] = value;
      savePreferences();
      ctx.rerender();
    });
    option.setAttribute("aria-pressed", String(on));
    order.append(option);
  }
  wrap.append(order);

  // Japanese: rōmaji with the question, or only once answered.
  if (book.term === "ja") {
    const romaji = el("fieldset", "segmented vocab-romaji");
    romaji.append(el("legend", "field-label", vt("romajiTitle")));
    for (const [value, key] of [["always", "romajiShow"], ["after", "romajiHide"]] as const) {
      const on = (prefs.romaji[book.id] ?? "always") === value;
      const option = button(on ? "segment on" : "segment", vt(key), () => {
        prefs.romaji[book.id] = value;
        savePreferences();
        ctx.rerender();
      });
      option.setAttribute("aria-pressed", String(on));
      romaji.append(option);
    }
    wrap.append(romaji, el("p", "hint left", vt("romajiHint")));
  }

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
    summary.append(titleBlock(lesson.title, lesson.subtitle, "vocab-lesson-title"), statusBar(sum));
    if (sum.due > 0) summary.append(el("span", "vocab-badge", String(sum.due)));
    details.append(summary);

    const sections = el("ul", "vocab-sections");
    for (const section of lesson.sections) {
      const p = progress.sections[section.id] ?? { new: section.entries, learning: 0, known: 0, mastered: 0, due: 0 };
      const item = el("li", "vocab-section");
      const text = el("div", "vocab-section-text");
      text.append(titleBlock(section.title, section.subtitle, "vocab-section-title"));
      const meta = el("span", "vocab-section-meta", vt("words", { count: section.entries }));
      if (p.due > 0) meta.append(" · ", el("span", "vocab-section-due", vt("sectionDue", { count: p.due })));
      text.append(meta, statusBar(p));
      const begun = p.new < section.entries;
      const buttons = el("div", "vocab-section-actions");
      const go = button(begun ? "ghost small" : "primary small", vt(begun ? "continue" : "learn"), () =>
        void start(ctx, { kind: "section", id: section.id, purpose: "learn", label: section.title }),
      );
      go.setAttribute("aria-label", `${vt(begun ? "continue" : "learn")} : ${section.title}`);
      buttons.append(go);
      if (begun) {
        const again = button("ghost small", vt("review"), () =>
          void start(ctx, { kind: "section", id: section.id, purpose: "review", label: vt("reviewOf", { name: section.title }) }),
        );
        again.setAttribute("aria-label", `${vt("review")} : ${section.title}`);
        buttons.append(again);
      }
      item.append(text, buttons);
      sections.append(item);
    }
    const whole = el("div", "vocab-whole");
    whole.append(
      button("ghost small", vt("wholeLesson"), () =>
        void start(ctx, { kind: "lesson", id: lesson.id, purpose: "learn", label: lesson.title }),
      ),
    );
    if (sum.learning + sum.known + sum.mastered > 0) {
      whole.append(
        button("ghost small", vt("reviewLesson"), () =>
          void start(ctx, { kind: "lesson", id: lesson.id, purpose: "review", label: vt("reviewOf", { name: lesson.title }) }),
        ),
      );
    }
    details.append(sections, whole);
    list.append(details);
  }
  wrap.append(list);
  return wrap;
}

// ------------------------------------------------------------------ cards

/** The view is built before it is placed in the page: focus on the next frame. */
const afterRender = (fn: () => void): void => void requestAnimationFrame(fn);

/** The card on screen and its keyboard handler (one card at a time). */
let currentCard: { wrap: HTMLElement; keys: (event: KeyboardEvent) => void } | null = null;
let cardKeysInstalled = false;

/**
 * One document listener for the cards' keys, so a key counts whether the
 * card already has the focus, still has not (the focus moves on the next
 * frame), or the page has it. Keys typed into another field, or while the card
 * is no longer on screen, are left alone.
 */
function installCardKeys(): void {
  if (cardKeysInstalled) return;
  cardKeysInstalled = true;
  document.addEventListener("keydown", (event) => {
    const card = currentCard;
    if (!card || !card.wrap.isConnected) return;
    const target = event.target;
    const inCard = target instanceof Node && card.wrap.contains(target);
    const onPage = target === document.body || target === document.documentElement;
    if (!inCard && !onPage) return;
    card.keys(event);
  });
}

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
  const ask = recognise ? vt("askMeaning") : card.promptLang === card.answerLang ? vt("askWord") : vt("askIn", { lang: langName(card.answerLang) });
  const question = el("div", "vocab-question");
  question.append(el("p", "vocab-ask", ask));
  const prompt = el("p", "vocab-prompt", card.prompt);
  prompt.lang = card.promptLang;
  question.append(prompt);
  // Rōmaji: with the question, or once answered, as the player chose.
  const showReading = romajiAlways(ctx.book) || s.result !== null;
  if (card.promptReading && showReading) {
    const reading = el("p", "vocab-reading", card.promptReading);
    reading.lang = `${card.promptLang}-Latn`;
    question.append(reading);
  }
  const notes = el("p", "vocab-notes");
  if (card.feminine) notes.append(el("span", "vocab-fem", `f · ${vt("feminine")}`));
  if (card.group) notes.append(el("span", "vocab-group", card.group));
  notes.append(boxDots(s.result ? s.result.box : card.box));
  question.append(notes);
  wrap.append(question);

  const feedback = el("p", "vocab-feedback");
  feedback.setAttribute("role", "status");
  const answerLang = card.answerLang;

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
        s.missed.set(key, { prompt: card.prompt, expected: !recognise && result.reading ? `${result.expected} (${result.reading})` : result.expected });
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
      const text = el("span", "choice-text", option);
      text.lang = answerLang;
      const reading = card.optionReadings?.[i];
      if (reading && showReading) {
        const r = el("span", "choice-reading", reading);
        r.lang = `${answerLang}-Latn`;
        text.append(r);
      }
      b.append(el("span", "letter", "ABCD"[i] ?? ""), text);
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
    label.append(el("span", "field-label", answerLang === "ja" ? vt("answerJa") : vt("answerIn", { lang: langName(answerLang) })));
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
    if (answerLang === "es" && !s.result) {
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
    // Japanese: the word as printed and how it reads, whatever was typed.
    if (!recognise && r.reading) {
      const reading = el("span", "vocab-verdict-reading", r.verdict === "right" ? `${r.expected} · ${r.reading}` : r.reading);
      reading.lang = "ja";
      feedback.append(reading);
    }
    if (r.feminine) feedback.append(el("span", "vocab-fem", ` (f)`));
    if (r.note) feedback.append(el("span", "vocab-note", vt("example", { note: r.note })));
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

  // Keyboard: 1–4 or A–D to choose; Enter to go on. Read at document level
  // (installCardKeys): the card takes the focus on the next frame, and a key
  // pressed before that goes to the page, not to the card.
  currentCard = { wrap, keys: (event: KeyboardEvent) => {
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
  } };
  installCardKeys();
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
