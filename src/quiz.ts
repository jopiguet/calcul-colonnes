import katex from "katex";
import "katex/dist/katex.min.css";
import {
  ANSWER_MODES,
  CHEMISTRY_TOPICS,
  MATH_LEVELS,
  OPTION_COUNT,
  QUIZ_COUNTS,
  QUIZ_VERSION,
  TOPICS,
  TYPED_MAX,
  bankRevision,
  localized,
  registerBank,
  TOPIC_GROUPS,
  generateQuiz,
  gradeQuiz,
  readNumber,
  resolveAnswers,
  skillsFor,
  topicsFor,
  typeable,
  type AnswerMode,
  type GivenAnswer,
  type Level,
  type Localized,
  type Option,
  type Question,
  type QuizSpec,
  type Topic,
} from "../shared/quiz";
import { button, el } from "./dom";
import { drawGraph } from "./graph";
import { currentLang } from "./i18n";
import { explanationText, groupName, levelName, mistakeName, promptText, qt, topicName } from "./quiz-i18n";
import { saveSettings, type Settings } from "./settings";
import { quizBank, store, type User } from "./store";

/**
 * Multiple-choice tests. Three screens: settings, one question at a time,
 * results with corrections. The test in progress survives a re-render (for
 * example a change of language), not a reload.
 */

interface Run {
  spec: QuizSpec;
  /** In a typed test, questions whose answer is a number are answered by typing it. */
  mode: AnswerMode;
  questions: Question[];
  /** Option index (−1 blank), or the text typed. */
  answers: GivenAnswer[];
  index: number;
}

const answered = (a: GivenAnswer): boolean => (typeof a === "string" ? a.trim() !== "" : a >= 0);
/** Whether this question of this run is answered by typing. */
const typedHere = (current: Run, q: Question): boolean => current.mode === "typed" && typeable(q);

/** A number as the player's language writes it: 1,0472 in French and Spanish. */
function decimal(value: number): string {
  const text = String(Number(value.toPrecision(6)));
  return currentLang() === "en" ? text : text.replace(".", ",");
}

interface Result {
  run: Run;
  correct: number;
  status: "saving" | "saved" | "unsaved";
}

let run: Run | null = null;
let result: Result | null = null;

/** True while a test is being answered: the app must not reload under it. */
export const quizBusy = (): boolean => run !== null;

export interface QuizContext {
  user: User;
  /** Mathematics, or physical chemistry (its own topics, written questions from the bank). */
  subject: "maths" | "chemistry";
  settings: Settings;
  rerender(): void;
  /** Opens the player's progress page. */
  showProgress(): void;
}

/**
 * Kinds of question the player got wrong recently and that fit this test,
 * most recent mistakes first. An unreachable server just means no review.
 */
async function reviewFocus(user: User, level: Level, topics: Topic[]): Promise<string[]> {
  try {
    const allowed = new Set(skillsFor(level, topics));
    const profile = await store.profile(user.id);
    return profile.skills
      .filter((s) => s.status === "review" && allowed.has(s.skill))
      .sort((a, b) => b.lastAt - a.lastAt)
      .map((s) => s.skill);
  } catch {
    return [];
  }
}

const LETTERS = ["A", "B", "C", "D"];

let bankLoadedAt = 0;
/** The bank changes only on an import: asked again after a few minutes. */
const BANK_FOR = 5 * 60_000;

/**
 * Loads the question bank for the physical chemistry tests. A failure keeps
 * the bank already loaded (or none): the tests then have only calculations.
 */
export async function loadBank(): Promise<void> {
  if (Date.now() - bankLoadedAt < BANK_FOR) return;
  try {
    registerBank(await quizBank.load());
    bankLoadedAt = Date.now();
  } catch {
    // offline: generated questions only
  }
}

/** A written text with its inline $…$ formulas, in the interface's language (English otherwise). */
function rich(text: Localized, cls: string, tag: "p" | "span" | "div" = "span"): HTMLElement {
  const node = el(tag, cls);
  const shown = localized(text, currentLang());
  shown.split(/(\$[^$]+\$)/).forEach((part) => {
    if (part.startsWith("$") && part.endsWith("$") && part.length > 1) node.append(math(part.slice(1, -1)));
    else if (part) node.append(part);
  });
  if (shown !== text[currentLang() as keyof Localized] && currentLang() !== "en") node.lang = "en";
  return node;
}

/** The question's sentence: its own text for a written question, the sentence of its kind otherwise. */
const promptView = (q: Question): HTMLElement =>
  q.prompt.text ? rich(q.prompt.text, "quiz-prompt", "p") : el("p", "quiz-prompt", promptText(q.prompt.key));

/** The level of this subject's tests. */
const levelOf = (ctx: QuizContext): Level => (ctx.subject === "chemistry" ? "chemistry" : ctx.settings.quizLevel);

/** Spanish writes sen and arcsen. */
const macros = (): Record<string, string> =>
  currentLang() === "es" ? { "\\sin": "\\operatorname{sen}", "\\arcsin": "\\operatorname{arcsen}" } : {};

function math(tex: string, display = false): HTMLElement {
  const node = el(display ? "div" : "span", display ? "math display" : "math");
  node.innerHTML = katex.renderToString(tex, { throwOnError: false, displayMode: display, macros: macros() });
  return node;
}

/** The givens of a question: its graph, then its formula (empty when the graph says it all). */
function givens(q: Question): HTMLElement[] {
  const shown: HTMLElement[] = [];
  if (q.prompt.graph) {
    const box = el("div", "quiz-graph");
    box.append(drawGraph(q.prompt.graph, qt("graphPrompt")));
    shown.push(box);
  }
  if (q.prompt.tex !== "") shown.push(math(q.prompt.tex, true));
  return shown;
}

/** A typed answer in the corrections: as typed, and what it was read as. */
function typedView(text: string): HTMLElement {
  const read = readNumber(text);
  const box = el("span", "typed-given", text);
  if (read) box.append(el("span", "typed-reading", ` ${qt("typedValue", { value: decimal(read.value) })}`));
  return box;
}

/** An option in the corrections: its text, its graph and formula, or its formula. */
function optionView(option: Option): HTMLElement {
  if (option.text) return rich(option.text, "option-text");
  const formula = math(`\\displaystyle ${option.tex}`);
  if (!option.graph) return formula;
  const box = el("span", "option-graph");
  box.append(drawGraph(option.graph, option.tex, "small"), formula);
  return box;
}

function newSeed(): number {
  const buffer = new Uint32Array(1);
  crypto.getRandomValues(buffer);
  return buffer[0]!;
}

function start(spec: QuizSpec, mode: AnswerMode): void {
  run = { spec, mode, questions: generateQuiz(spec), answers: Array<GivenAnswer>(spec.count).fill(-1), index: 0 };
  result = null;
}

export function quizView(ctx: QuizContext): HTMLElement {
  // A test of the other subject (opened from the home page) is not shown here.
  const level = levelOf(ctx);
  const mine = (spec: QuizSpec): boolean => (spec.level === "chemistry") === (level === "chemistry");
  if (result && mine(result.run.spec)) return resultView(ctx, result);
  if (run && mine(run.spec)) return questionView(ctx, run);
  return setupView(ctx);
}

// ------------------------------------------------------------------ settings

/**
 * The topics a test will use: those chosen that exist at the level, or every
 * topic of the level when none of those chosen does (a choice made at the
 * other level, or before a topic existed).
 */
function chosenTopics(ctx: QuizContext): Topic[] {
  const available = topicsFor(levelOf(ctx));
  const saved = ctx.subject === "chemistry" ? ctx.settings.chemTopics : ctx.settings.quizTopics;
  const chosen = saved.filter((t) => available.includes(t));
  return chosen.length > 0 ? chosen : available;
}

function setupView(ctx: QuizContext): HTMLElement {
  const { settings } = ctx;
  const save = (change: Partial<Settings>): void => {
    Object.assign(settings, change);
    saveSettings(settings);
    ctx.rerender();
  };

  const chemistry = ctx.subject === "chemistry";
  const testLevel = levelOf(ctx);
  const wrap = el("section", "sheet quiz-setup");
  wrap.append(el("h1", "title", qt(chemistry ? "chemSetupTitle" : "setupTitle")));
  if (chemistry && bankRevision() === 0) wrap.append(el("p", "hint", qt("noBank")));

  // Physical chemistry has one level: no choice to make (the fieldset is left out).
  const level = el("fieldset", "segmented");
  level.append(el("legend", "field-label", qt("level")));
  for (const value of MATH_LEVELS) {
    const option = button(value === settings.quizLevel ? "segment on" : "segment", levelName(value), () =>
      save({ quizLevel: value }),
    );
    option.setAttribute("aria-pressed", String(value === settings.quizLevel));
    level.append(option);
  }

  // Topics by group, those of the chosen level only (some exist at one level).
  const available = topicsFor(testLevel);
  const effective = chosenTopics(ctx);
  const topics = el("fieldset", "topics");
  topics.append(el("legend", "field-label", qt("topics")));
  for (const { group, topics: members } of TOPIC_GROUPS) {
    const shown = members.filter((t) => available.includes(t));
    if (shown.length === 0) continue;
    const block = el("div", "topic-group");
    block.append(el("span", "topic-group-name", groupName(group)));
    for (const topic of shown) {
      const label = el("label", "topic");
      const box = el("input");
      box.type = "checkbox";
      box.value = topic;
      box.checked = effective.includes(topic);
      box.addEventListener("change", () => {
        const chosen = (chemistry ? CHEMISTRY_TOPICS : TOPICS).filter((t) => (t === topic ? box.checked : effective.includes(t)));
        if (chosen.length === 0) {
          box.checked = true; // at least one topic stays selected
          return;
        }
        save(chemistry ? { chemTopics: chosen } : { quizTopics: chosen });
      });
      label.append(box, el("span", undefined, topicName(topic)));
      block.append(label);
    }
    topics.append(block);
  }

  const count = el("div", "level count");
  count.setAttribute("role", "group");
  count.setAttribute("aria-label", qt("questionCount"));
  const index = QUIZ_COUNTS.indexOf(settings.quizCount);
  const step = (delta: -1 | 1, symbol: string, name: string): HTMLButtonElement => {
    const target = QUIZ_COUNTS[index + delta];
    const node = button("ghost step", symbol, () => target !== undefined && save({ quizCount: target }));
    node.disabled = target === undefined;
    node.setAttribute("aria-label", name);
    return node;
  };
  count.append(
    el("span", "field-label", qt("questionCount")),
    step(-1, "−", qt("fewer")),
    el("output", "level-value", String(settings.quizCount)),
    step(1, "+", qt("more")),
  );

  // Answers: four options, or the number typed where the answer is one.
  const answerMode = el("fieldset", "segmented answer-mode");
  answerMode.append(el("legend", "field-label", qt("answerMode")));
  for (const value of ANSWER_MODES) {
    const on = value === settings.quizMode;
    const option = button(on ? "segment on" : "segment", qt(value === "typed" ? "modeTyped" : "modeChoices"), () => save({ quizMode: value }));
    option.setAttribute("aria-pressed", String(on));
    answerMode.append(option);
  }
  if (settings.quizMode === "typed") answerMode.append(el("p", "hint mode-hint", qt("modeTypedHint")));

  // Review of recent mistakes: on by default; the number of kinds concerned is shown once known.
  const review = el("div", "review-option");
  const reviewLabel = el("label", "topic");
  const reviewBox = el("input");
  reviewBox.type = "checkbox";
  reviewBox.checked = settings.quizReview;
  reviewBox.addEventListener("change", () => save({ quizReview: reviewBox.checked }));
  reviewLabel.append(reviewBox, el("span", undefined, qt("review")));
  const reviewInfo = el("p", "hint review-info");
  review.append(reviewLabel, reviewInfo);
  if (settings.quizReview) {
    void reviewFocus(ctx.user, testLevel, effective).then((focus) => {
      reviewInfo.textContent = focus.length > 0 ? qt("reviewCount", { n: focus.length }) : qt("reviewNone");
    });
  }

  const go = button("primary", qt("start"), async () => {
    go.disabled = true;
    const topicsChosen = [...effective];
    const focus = settings.quizReview ? await reviewFocus(ctx.user, testLevel, topicsChosen) : [];
    const bank = chemistry ? { bank: bankRevision() } : {};
    start({ seed: newSeed(), level: testLevel, topics: topicsChosen, count: settings.quizCount, focus, ...bank }, settings.quizMode);
    ctx.rerender();
  });

  if (!chemistry) wrap.append(level);
  wrap.append(topics, count, answerMode, review, go, button("ghost small", qt("progress"), ctx.showProgress));
  queueMicrotask(() => go.focus());
  return wrap;
}

// ------------------------------------------------------------------ question

function questionView(ctx: QuizContext, current: Run): HTMLElement {
  const { questions, answers } = current;
  const q = questions[current.index]!;
  const last = current.index === questions.length - 1;

  const wrap = el("section", "sheet quiz");
  wrap.tabIndex = -1;

  const head = el("div", "quiz-head");
  const where = el("span", "quiz-topic", topicName(q.topic));
  if (q.prompt.source) where.append(" · ", el("span", "quiz-source", q.prompt.source));
  if (q.review) where.prepend(el("span", "badge is-review", qt("reviewBadge")), " ");
  head.append(el("span", "quiz-count", qt("questionOf", { n: current.index + 1, count: questions.length })), where);
  const progress = el("div", "progress");
  const bar = el("div", "progress-bar");
  const fill = (): void => {
    bar.style.width = `${(100 * answers.filter(answered).length) / questions.length}%`;
  };
  fill();
  progress.append(bar);

  const prompt = promptView(q);
  const drawn = q.options.some((o) => o.graph);
  const written = q.options.some((o) => o.text);

  const typed = typedHere(current, q);
  const list = el("div", drawn ? "choices graphs" : written ? "choices written" : "choices");
  list.setAttribute("role", "radiogroup");
  list.setAttribute("aria-label", qt("options"));
  const choose = (i: number): void => {
    answers[current.index] = i;
    ctx.rerender();
  };
  q.options.forEach((option, i) => {
    const selected = answers[current.index] === i;
    const choice = el("button", selected ? "choice on" : "choice");
    choice.type = "button";
    choice.setAttribute("role", "radio");
    choice.setAttribute("aria-checked", String(selected));
    choice.append(
      el("span", "letter", LETTERS[i]),
      // A drawn option is named by its letter only: its formula would give the answer away.
      option.text
        ? rich(option.text, "choice-text")
        : option.graph
          ? drawGraph(option.graph, qt("graphOption", { letter: LETTERS[i]! }), "small")
          : math(`\\displaystyle ${option.tex}`),
    );
    choice.addEventListener("click", () => choose(i));
    list.append(choice);
  });

  const go = (index: number): void => {
    current.index = Math.max(0, Math.min(questions.length - 1, index));
    ctx.rerender();
  };
  const finish = (): void => {
    const blank = answers.filter((a) => !answered(a)).length;
    if (blank > 0 && !confirm(qt("confirmBlank", { n: blank }))) return;
    submit(ctx, current);
  };

  const nav = el("div", "actions");
  const previous = button("ghost", qt("previous"), () => go(current.index - 1));
  previous.disabled = current.index === 0;
  const next = last ? button("primary", qt("finish"), finish) : button("primary", qt("next"), () => go(current.index + 1));
  nav.append(previous, next);

  const quit = button("ghost small", qt("quit"), () => {
    if (!confirm(qt("confirmQuit"))) return;
    run = null;
    ctx.rerender();
  });

  wrap.addEventListener("keydown", (event) => {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    if (event.target instanceof HTMLInputElement) return; // typing an answer: the field handles its keys
    const key = event.key.toLowerCase();
    const pick = "1234".indexOf(key) >= 0 ? "1234".indexOf(key) : "abcd".indexOf(key);
    if (pick >= 0 && pick < OPTION_COUNT && !typed) {
      event.preventDefault();
      choose(pick);
    } else if (event.key === "ArrowRight" && !last) {
      event.preventDefault();
      go(current.index + 1);
    } else if (event.key === "ArrowLeft" && current.index > 0) {
      event.preventDefault();
      go(current.index - 1);
    } else if (event.key === "Enter" && !(event.target instanceof HTMLButtonElement)) {
      event.preventDefault();
      if (last) finish();
      else go(current.index + 1);
    }
  });

  if (typed) {
    const field = typedField(current, fill, () => (last ? finish() : go(current.index + 1)));
    wrap.append(head, progress, prompt, ...givens(q), field.box, nav, el("p", "hint", qt("typedHint")), quit);
    queueMicrotask(() => field.input.focus({ preventScroll: true }));
    return wrap;
  }
  wrap.append(head, progress, prompt, ...givens(q), list, nav, el("p", "hint", qt("keyboardHint")), quit);
  queueMicrotask(() => wrap.focus({ preventScroll: true }));
  return wrap;
}

/** Symbols that phone keyboards hide, inserted where the cursor is. */
const SYMBOLS = ["π", "√", "/", "^", "−", "e", "(", ")"];

/**
 * The field for a typed answer, with what the app reads in it as the player
 * types (≈ 1,0472), and a row of symbols. Typing does not redraw the screen,
 * so the keyboard stays open.
 */
function typedField(current: Run, changed: () => void, submit: () => void): { box: HTMLElement; input: HTMLInputElement } {
  const box = el("div", "typed");
  const input = el("input", "typed-input");
  input.type = "text";
  input.autocomplete = "off";
  input.spellcheck = false;
  input.maxLength = TYPED_MAX;
  input.setAttribute("autocapitalize", "off");
  input.setAttribute("autocorrect", "off");
  input.placeholder = qt("typedPlaceholder");
  input.setAttribute("aria-label", qt("typedPlaceholder"));
  const before = current.answers[current.index];
  input.value = typeof before === "string" ? before : "";

  const reading = el("p", "typed-reading");
  reading.setAttribute("aria-live", "polite");
  const update = (): void => {
    const text = input.value;
    current.answers[current.index] = text.trim() === "" ? -1 : text;
    const read = text.trim() === "" ? null : readNumber(text);
    reading.textContent = text.trim() === "" ? "" : read ? qt("typedValue", { value: decimal(read.value) }) : qt("typedInvalid");
    reading.classList.toggle("bad", text.trim() !== "" && !read);
    changed();
  };
  input.addEventListener("input", update);
  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      submit();
    }
  });

  const keys = el("div", "typed-keys");
  for (const symbol of SYMBOLS) {
    const key = button("ghost small typed-key", symbol, () => {
      const start = input.selectionStart ?? input.value.length;
      const end = input.selectionEnd ?? input.value.length;
      input.setRangeText(symbol, start, end, "end");
      input.focus();
      update();
    });
    // Keep the field focused (and a phone's keyboard open) while a symbol is tapped.
    key.addEventListener("mousedown", (event) => event.preventDefault());
    keys.append(key);
  }
  box.append(input, reading, keys);
  update();
  return { box, input };
}

function submit(ctx: QuizContext, done: Run): void {
  // The server grades again from the seed and the text typed; this is only for the screen.
  const correct = gradeQuiz(done.questions, resolveAnswers(done.questions, done.answers, done.mode));
  const current: Result = { run: done, correct, status: "saving" };
  result = current;
  run = null;
  ctx.rerender();
  const { seed, level, topics, count, focus = [], bank } = done.spec;
  store
    .addQuiz({ userId: ctx.user.id, seed, level, topics, count, focus, version: QUIZ_VERSION, answers: done.answers, mode: done.mode, ...(bank === undefined ? {} : { bank }) })
    .then(() => (current.status = "saved"))
    .catch(() => (current.status = "unsaved"))
    .finally(() => {
      const status = document.querySelector("#quiz-status");
      if (status && result === current) status.textContent = qt(current.status);
    });
}

// ------------------------------------------------------------------- results

/**
 * "Report this question": a wrong answer, an unclear text. Sent with an
 * optional note; the author reads them with `npm run quiz:flags`.
 */
function flagControl(ctx: QuizContext, q: Question): HTMLElement {
  const box = el("div", "flag");
  const open = button("ghost small flag-open", qt("flagQuestion"), () => {
    open.hidden = true;
    form.hidden = false;
    note.focus();
  });
  const form = el("form", "flag-form");
  form.hidden = true;
  const note = el("input", "flag-note");
  note.type = "text";
  note.maxLength = 500;
  note.placeholder = qt("flagNote");
  note.setAttribute("aria-label", qt("flagNote"));
  const send = el("button", "ghost small", qt("flagSend"));
  send.type = "submit";
  const status = el("span", "flag-status");
  status.setAttribute("role", "status");
  form.append(note, send);
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    send.disabled = true;
    // A written question by its id; a generated one by its formula.
    const question = q.prompt.id && q.verify.kind === "choice" ? q.prompt.id : q.prompt.tex || q.prompt.id || q.skill;
    quizBank
      .flag({ userId: ctx.user.id, skill: q.skill, question: question.slice(0, 2000), note: note.value.trim() })
      .then(() => {
        form.hidden = true;
        status.textContent = qt("flagThanks");
      })
      .catch(() => {
        send.disabled = false;
        status.textContent = qt("flagFailed");
      });
  });
  box.append(open, form, status);
  return box;
}

function resultView(ctx: QuizContext, done: Result): HTMLElement {
  const { questions, answers, spec, mode } = done.run;
  const resolved = resolveAnswers(questions, answers, mode);
  const wrap = el("section", "sheet quiz-result");

  const percent = Math.round((100 * done.correct) / questions.length);
  wrap.append(
    el("h1", "title", qt("resultTitle")),
    el("p", "big-score", `${done.correct} / ${questions.length}`),
    el("p", "percent", `${percent} %`),
  );
  const status = el("p", done.status === "unsaved" ? "note" : "status", qt(done.status));
  status.id = "quiz-status";
  status.setAttribute("role", "status");
  wrap.append(status);

  const actions = el("div", "actions wrap");
  actions.append(
    button("primary", qt("newTest"), async () => {
      const focus = ctx.settings.quizReview ? await reviewFocus(ctx.user, spec.level, spec.topics) : [];
      const bank = spec.level === "chemistry" ? { bank: bankRevision() } : {};
      start({ ...spec, seed: newSeed(), focus, ...bank }, mode);
      ctx.rerender();
    }),
    button("ghost", qt("retry"), () => {
      start(spec, mode);
      ctx.rerender();
    }),
    button("ghost", qt("settings"), () => {
      result = null;
      ctx.rerender();
    }),
    button("ghost", qt("progress"), ctx.showProgress),
  );
  wrap.append(actions);

  const list = el("ol", "review");
  questions.forEach((q, i) => {
    const given = resolved[i]!;
    const raw = answers[i]!;
    const ok = given === q.correct;
    const item = el("li", ok ? "review-item good" : "review-item bad");
    const head = el("div", "review-head");
    head.append(el("span", "review-mark", ok ? "✅" : "❌"), el("span", "quiz-topic", topicName(q.topic)));
    if (q.prompt.source) head.append(el("span", "quiz-source", q.prompt.source));
    if (q.review) head.append(el("span", "badge is-review", qt("reviewBadge")));
    if (mode === "typed" && typeable(q)) head.append(el("span", "badge is-typed", qt("typedBadge")));
    item.append(head, promptView(q), ...givens(q));

    const line = (label: string, content: HTMLElement | string, kind: string): HTMLElement => {
      const row = el("p", `review-line ${kind}`);
      row.append(el("span", "review-label", `${label} :`.replace(" :", currentLang() === "fr" ? " :" : ":")), content);
      return row;
    };
    if (!ok) {
      item.append(
        line(
          qt("yourAnswer"),
          typeof raw === "string" ? typedView(raw) : given < 0 ? qt("blank") : optionView(q.options[given]!),
          "given",
        ),
      );
      // The typical mistake behind the option chosen.
      const mistake = given >= 0 ? q.options[given]!.mistake : undefined;
      if (mistake) item.append(line(qt("mistake"), mistakeName(mistake), "mistake"));
    }
    item.append(line(qt("rightAnswer"), optionView(q.options[q.correct]!), "right"));
    const why = el("div", "explanation");
    if (q.explanation.text) why.append(rich(q.explanation.text, "", "p"));
    else why.append(el("p", undefined, explanationText(q.explanation.key)), math(q.explanation.tex, true));
    item.append(why, flagControl(ctx, q));
    list.append(item);
  });
  wrap.append(list);
  return wrap;
}
