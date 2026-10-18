import katex from "katex";
import "katex/dist/katex.min.css";
import {
  LEVELS,
  OPTION_COUNT,
  QUIZ_COUNTS,
  QUIZ_VERSION,
  TOPICS,
  generateQuiz,
  gradeQuiz,
  skillsFor,
  type Level,
  type Question,
  type QuizSpec,
  type Topic,
} from "../shared/quiz";
import { button, el } from "./dom";
import { currentLang } from "./i18n";
import { explanationText, levelName, mistakeName, promptText, qt, topicName } from "./quiz-i18n";
import { saveSettings, type Settings } from "./settings";
import { store, type User } from "./store";

/**
 * Multiple-choice tests. Three screens: settings, one question at a time,
 * results with corrections. The test in progress survives a re-render (for
 * example a change of language), not a reload.
 */

interface Run {
  spec: QuizSpec;
  questions: Question[];
  answers: number[];
  index: number;
}

interface Result {
  run: Run;
  correct: number;
  status: "saving" | "saved" | "unsaved";
}

let run: Run | null = null;
let result: Result | null = null;

export interface QuizContext {
  user: User;
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

/** Spanish writes sen and arcsen. */
const macros = (): Record<string, string> =>
  currentLang() === "es" ? { "\\sin": "\\operatorname{sen}", "\\arcsin": "\\operatorname{arcsen}" } : {};

function math(tex: string, display = false): HTMLElement {
  const node = el(display ? "div" : "span", display ? "math display" : "math");
  node.innerHTML = katex.renderToString(tex, { throwOnError: false, displayMode: display, macros: macros() });
  return node;
}

function newSeed(): number {
  const buffer = new Uint32Array(1);
  crypto.getRandomValues(buffer);
  return buffer[0]!;
}

function start(spec: QuizSpec): void {
  run = { spec, questions: generateQuiz(spec), answers: Array(spec.count).fill(-1), index: 0 };
  result = null;
}

export function quizView(ctx: QuizContext): HTMLElement {
  if (result) return resultView(ctx, result);
  if (run) return questionView(ctx, run);
  return setupView(ctx);
}

// ------------------------------------------------------------------ settings

function setupView(ctx: QuizContext): HTMLElement {
  const { settings } = ctx;
  const save = (change: Partial<Settings>): void => {
    Object.assign(settings, change);
    saveSettings(settings);
    ctx.rerender();
  };

  const wrap = el("section", "sheet quiz-setup");
  wrap.append(el("h1", "title", qt("setupTitle")));

  const level = el("fieldset", "segmented");
  level.append(el("legend", "field-label", qt("level")));
  for (const value of LEVELS) {
    const option = button(value === settings.quizLevel ? "segment on" : "segment", levelName(value), () =>
      save({ quizLevel: value }),
    );
    option.setAttribute("aria-pressed", String(value === settings.quizLevel));
    level.append(option);
  }

  const topics = el("fieldset", "topics");
  topics.append(el("legend", "field-label", qt("topics")));
  for (const topic of TOPICS) {
    const label = el("label", "topic");
    const box = el("input");
    box.type = "checkbox";
    box.value = topic;
    box.checked = settings.quizTopics.includes(topic);
    box.addEventListener("change", () => {
      const chosen = TOPICS.filter((t) => (t === topic ? box.checked : settings.quizTopics.includes(t)));
      if (chosen.length === 0) {
        box.checked = true; // at least one topic stays selected
        return;
      }
      save({ quizTopics: chosen });
    });
    label.append(box, el("span", undefined, topicName(topic)));
    topics.append(label);
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
    void reviewFocus(ctx.user, settings.quizLevel, settings.quizTopics).then((focus) => {
      reviewInfo.textContent = focus.length > 0 ? qt("reviewCount", { n: focus.length }) : qt("reviewNone");
    });
  }

  const go = button("primary", qt("start"), async () => {
    go.disabled = true;
    const topicsChosen = [...settings.quizTopics];
    const focus = settings.quizReview ? await reviewFocus(ctx.user, settings.quizLevel, topicsChosen) : [];
    start({ seed: newSeed(), level: settings.quizLevel, topics: topicsChosen, count: settings.quizCount, focus });
    ctx.rerender();
  });

  wrap.append(level, topics, count, review, go, button("ghost small", qt("progress"), ctx.showProgress));
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
  if (q.review) where.prepend(el("span", "badge is-review", qt("reviewBadge")), " ");
  head.append(el("span", "quiz-count", qt("questionOf", { n: current.index + 1, count: questions.length })), where);
  const progress = el("div", "progress");
  const bar = el("div", "progress-bar");
  bar.style.width = `${(100 * answers.filter((a) => a >= 0).length) / questions.length}%`;
  progress.append(bar);

  const prompt = el("p", "quiz-prompt", promptText(q.prompt.key));
  const formula = math(q.prompt.tex, true);

  const list = el("div", "choices");
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
    choice.append(el("span", "letter", LETTERS[i]), math(`\\displaystyle ${option.tex}`));
    choice.addEventListener("click", () => choose(i));
    list.append(choice);
  });

  const go = (index: number): void => {
    current.index = Math.max(0, Math.min(questions.length - 1, index));
    ctx.rerender();
  };
  const finish = (): void => {
    const blank = answers.filter((a) => a < 0).length;
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
    const key = event.key.toLowerCase();
    const pick = "1234".indexOf(key) >= 0 ? "1234".indexOf(key) : "abcd".indexOf(key);
    if (pick >= 0 && pick < OPTION_COUNT) {
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

  wrap.append(head, progress, prompt, formula, list, nav, el("p", "hint", qt("keyboardHint")), quit);
  queueMicrotask(() => wrap.focus({ preventScroll: true }));
  return wrap;
}

function submit(ctx: QuizContext, done: Run): void {
  const correct = gradeQuiz(done.questions, done.answers);
  const current: Result = { run: done, correct, status: "saving" };
  result = current;
  run = null;
  ctx.rerender();
  const { seed, level, topics, count, focus = [] } = done.spec;
  store
    .addQuiz({ userId: ctx.user.id, seed, level, topics, count, focus, version: QUIZ_VERSION, answers: done.answers })
    .then(() => (current.status = "saved"))
    .catch(() => (current.status = "unsaved"))
    .finally(() => {
      const status = document.querySelector("#quiz-status");
      if (status && result === current) status.textContent = qt(current.status);
    });
}

// ------------------------------------------------------------------- results

function resultView(ctx: QuizContext, done: Result): HTMLElement {
  const { questions, answers, spec } = done.run;
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
      start({ ...spec, seed: newSeed(), focus });
      ctx.rerender();
    }),
    button("ghost", qt("retry"), () => {
      start(spec);
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
    const given = answers[i]!;
    const ok = given === q.correct;
    const item = el("li", ok ? "review-item good" : "review-item bad");
    const head = el("div", "review-head");
    head.append(el("span", "review-mark", ok ? "✅" : "❌"), el("span", "quiz-topic", topicName(q.topic)));
    if (q.review) head.append(el("span", "badge is-review", qt("reviewBadge")));
    item.append(head, el("p", "quiz-prompt", promptText(q.prompt.key)), math(q.prompt.tex, true));

    const line = (label: string, content: HTMLElement | string, kind: string): HTMLElement => {
      const row = el("p", `review-line ${kind}`);
      row.append(el("span", "review-label", `${label} :`.replace(" :", currentLang() === "fr" ? " :" : ":")), content);
      return row;
    };
    if (!ok) {
      item.append(
        line(qt("yourAnswer"), given < 0 ? qt("blank") : math(`\\displaystyle ${q.options[given]!.tex}`), "given"),
      );
      // The typical mistake behind the option chosen.
      const mistake = given >= 0 ? q.options[given]!.mistake : undefined;
      if (mistake) item.append(line(qt("mistake"), mistakeName(mistake), "mistake"));
    }
    item.append(line(qt("rightAnswer"), math(`\\displaystyle ${q.options[q.correct]!.tex}`), "right"));
    const why = el("div", "explanation");
    why.append(el("p", undefined, explanationText(q.explanation.key)), math(q.explanation.tex, true));
    item.append(why);
    list.append(item);
  });
  wrap.append(list);
  return wrap;
}
