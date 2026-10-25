import { REACT_TOPICS, TS_TOPICS, RUST_TOPICS, SQL_TOPICS, CHEMBIO_TOPICS, CHEMISTRY_TOPICS, LINUX_TOPICS, TOPICS, type AnswerMode, type Level, type QuizSpec, type SkillStatus, type Subject, type Topic } from "../shared/quiz";
import type { Profile, SkillProgress } from "../shared/types";
import { button, el } from "./dom";
import { bookTitle, statusBar } from "./vocab";
import { vocabBooks } from "./home";
import { prt } from "./progress-i18n";
import { pastTestView, testDate } from "./quiz";
import { levelName, mistakeName, qt, skillName, statusName, topicName } from "./quiz-i18n";
import { store, vocab, type PastTest, type User, type VocabBookInfo, type VocabProgress } from "./store";

/**
 * Progress pages. The overview shows every activity of a player at a glance,
 * each with a link to its own page; each activity opens its own page from
 * inside it: the kinds of question of one subject with its frequent
 * mistakes, or the column arithmetic by operation. A vocabulary book's
 * page is its statistics (vocab-stats.ts).
 */

/** What a progress page covers. */
export type ProgressScope = "all" | "columns" | Subject;

const STATUS_ORDER: SkillStatus[] = ["review", "learning", "mastered"];
/** Most frequent mistakes listed on the page. */
const MISTAKES_SHOWN = 6;

const percent = (correct: number, total: number): string => (total === 0 ? "—" : `${Math.round((100 * correct) / total)} %`);

/** The subject of a test topic. */
export const subjectOfTopic = (topic: Topic | string): Subject =>
  (CHEMISTRY_TOPICS as string[]).includes(topic)
    ? "chemistry"
    : (LINUX_TOPICS as string[]).includes(topic)
      ? "linux"
      : (CHEMBIO_TOPICS as string[]).includes(topic)
        ? "chembio"
        : (SQL_TOPICS as string[]).includes(topic)
          ? "sql"
          : (RUST_TOPICS as string[]).includes(topic)
            ? "rust"
            : (TS_TOPICS as string[]).includes(topic)
              ? "ts"
              : (REACT_TOPICS as string[]).includes(topic)
                ? "react"
                : "maths";

const SUBJECT_TITLES: Record<Subject, () => string> = {
  maths: () => qt("modeQuiz"),
  chemistry: () => qt("modeChemistry"),
  linux: () => qt("modeLinux"),
  chembio: () => qt("modeChemBio"),
  sql: () => qt("modeSql"),
  rust: () => qt("modeRust"),
  ts: () => qt("modeTs"),
  react: () => qt("modeReact"),
};
const SUBJECT_ACTIVITY: Record<Subject, string> = { maths: "quiz", chemistry: "chemistry", linux: "linux", chembio: "chembio", sql: "sql", rust: "rust", ts: "ts", react: "react" };

function dots(recent: boolean[]): HTMLElement {
  const line = el("span", "dots");
  line.setAttribute("aria-label", qt("lastAnswers"));
  line.title = qt("lastAnswers");
  // Oldest on the left, newest on the right.
  for (const ok of [...recent].reverse()) line.append(el("span", ok ? "dot good" : "dot bad", ok ? "✓" : "✗"));
  return line;
}

function skillRow(s: SkillProgress): HTMLElement {
  const row = el("li", `skill is-${s.status}`);
  const name = el("div", "skill-name");
  name.append(el("span", undefined, skillName(s.skill)), el("span", `badge is-${s.status}`, statusName(s.status)));
  const detail = el("div", "skill-detail");
  detail.append(dots(s.recent), el("span", "skill-count", `${s.correct}/${s.total}`));
  row.append(name, detail);
  return row;
}

/** A thin bar of kinds of question: mastered, learning, to review. */
function skillBar(skills: SkillProgress[]): HTMLElement {
  const total = skills.length || 1;
  const bar = el("span", "progress-skill-bar");
  bar.setAttribute("role", "img");
  bar.setAttribute("aria-label", STATUS_ORDER.map((s) => `${statusName(s)} ${skills.filter((k) => k.status === s).length}`).join(", "));
  for (const status of ["mastered", "learning", "review"] as const) {
    const seg = el("span", `is-${status}`);
    seg.style.width = `${(100 * skills.filter((k) => k.status === status).length) / total}%`;
    bar.append(seg);
  }
  return bar;
}

function statusSummary(skills: SkillProgress[]): HTMLElement {
  const summary = el("div", "status-summary");
  for (const status of STATUS_ORDER) {
    const n = skills.filter((s) => s.status === status).length;
    summary.append(el("span", `badge is-${status}`, `${statusName(status)} · ${n}`));
  }
  return summary;
}

// ----------------------------------------------------------- one activity

function subjectSection(profile: Profile, subject: Subject): HTMLElement[] {
  const out: HTMLElement[] = [];
  const skills = profile.skills.filter((s) => subjectOfTopic(s.topic) === subject);
  if (skills.length === 0) return [el("p", "empty", qt("noQuiz"))];
  out.push(statusSummary(skills));
  for (const topic of TOPICS) {
    const mine = skills
      .filter((s) => s.topic === topic)
      .sort((a, b) => STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status) || skillName(a.skill).localeCompare(skillName(b.skill)));
    if (mine.length === 0) continue;
    const block = el("div", "topic-block");
    block.append(el("h3", "topic-title", topicName(topic)));
    const list = el("ul", "skills");
    list.append(...mine.map(skillRow));
    block.append(list);
    out.push(block);
  }
  out.push(el("p", "hint", qt("progressRule")));

  // Frequent mistakes in this subject's kinds of question.
  const kinds = new Set(skills.map((s) => s.skill));
  const mistakes = profile.mistakes
    .map((m) => ({ ...m, skills: m.skills.filter((s) => kinds.has(s)) }))
    .filter((m) => m.skills.length > 0);
  out.push(el("h2", "subtitle", qt("frequentMistakes")));
  if (mistakes.length === 0) {
    out.push(el("p", "empty", qt("noMistakes")));
  } else {
    const list = el("ul", "mistakes");
    for (const m of mistakes.slice(0, MISTAKES_SHOWN)) {
      const item = el("li", "mistake-item");
      const head = el("div", "mistake-head");
      head.append(el("span", "mistake-name", mistakeName(m.mistake)), el("span", "mistake-count", qt("mistakeTimes", { n: m.count })));
      item.append(head, el("span", "mistake-where", m.skills.slice(0, 3).map(skillName).join(" · ")));
      list.append(item);
    }
    out.push(list, el("p", "hint", qt("mistakesRule")));
  }
  return out;
}

function columnsSection(profile: Profile): HTMLElement[] {
  if (profile.operators.length === 0) return [el("p", "empty", qt("noArithmetic"))];
  const table = el("table", "scores");
  const head = el("tr");
  for (const label of [qt("operation"), qt("today"), qt("total"), qt("rate")]) head.append(el("th", undefined, label));
  table.append(head);
  for (const o of profile.operators) {
    const row = el("tr");
    row.append(
      el("td", "name operator-symbol", o.operator),
      el("td", undefined, `${o.todayCorrect}/${o.todayTotal}`),
      el("td", undefined, `${o.correct}/${o.total}`),
      el("td", undefined, percent(o.correct, o.total)),
    );
    table.append(row);
  }
  return [table];
}

// ----------------------------------------------------------- the overview

export interface ProgressContext {
  user: User;
  scope: ProgressScope;
  onBack(): void;
  /** Opens one activity's page from the overview. */
  onScope(scope: ProgressScope): void;
  /** Opens a vocabulary book's statistics; absent when it is another player's progress. */
  onBook?(book: VocabBookInfo): void;
  /** The overview the page was opened from: its Back button then says so. */
  fromOverview: boolean;
  /** Takes a past test again; absent when it is another player's progress. */
  onReplay?(spec: QuizSpec, mode: AnswerMode): void;
  /** Draws the page again (a past test opened or closed). */
  rerender(): void;
}

/** The past test open on a subject's page, and whether the whole list is shown. */
let openTest: { userId: number; subject: Subject; test: PastTest } | null = null;
let allTests = false;

/** Tests shown before "Show the others". */
const TESTS_SHOWN = 5;

/**
 * The player's last tests in this subject, newest first: date, level,
 * topics, score. Each opens its corrections, rebuilt exactly.
 */
async function testsSection(ctx: ProgressContext, subject: Subject, mine: boolean): Promise<HTMLElement> {
  const box = el("section", "past-tests");
  box.append(el("h2", "subtitle", mine ? qt("pastTests") : qt("pastTestsOf", { name: ctx.user.name })));
  const tests = await store.pastTests(ctx.user.id, subject).catch(() => null);
  if (!tests || tests.length === 0) {
    box.append(el("p", "empty", qt("pastNone")));
    return box;
  }
  const list = el("ul", "past-list");
  for (const test of allTests ? tests : tests.slice(0, TESTS_SHOWN)) {
    const item = el("li", "past-item");
    const open = button("past-open", "", () => {
      openTest = { userId: ctx.user.id, subject, test };
      ctx.rerender();
    });
    open.dataset.test = String(test.id);
    open.setAttribute("aria-label", `${qt("pastOpen")} · ${testDate(test.at)}`);
    const topics = test.topics.length === 1 ? topicName(test.topics[0] as Topic) : qt("pastTopics", { count: test.topics.length });
    const what = el("span", "past-what");
    what.append(el("span", "past-date", testDate(test.at)), el("span", "past-detail", `${levelName(test.level as Level)} · ${topics}${test.mode === "typed" ? ` · ${qt("modeTyped")}` : ""}`));
    const good = test.correct * 2 >= test.count;
    open.append(what, el("span", `past-score ${good ? "good" : "bad"}`, `${test.correct}/${test.count}`));
    item.append(open);
    list.append(item);
  }
  box.append(list);
  if (!allTests && tests.length > TESTS_SHOWN) {
    box.append(
      button("ghost small", qt("pastMore", { count: tests.length - TESTS_SHOWN }), () => {
        allTests = true;
        ctx.rerender();
      }),
    );
  }
  return box;
}

/** One activity in the overview: its name, a bar, a line, and its details. */
function overviewCard(opts: { activity: string; title: string; bar: HTMLElement | null; lines: string[]; onDetails?: () => void; detailsLabel?: string }): HTMLElement {
  const card = el("div", "progress-card");
  card.dataset.activity = opts.activity;
  card.append(el("h3", "progress-card-title", opts.title));
  if (opts.bar) card.append(opts.bar);
  for (const line of opts.lines) card.append(el("p", "progress-card-line", line));
  if (opts.onDetails) card.append(button("ghost small", opts.detailsLabel ?? prt("details"), opts.onDetails));
  return card;
}

async function overview(ctx: ProgressContext, profile: Profile): Promise<HTMLElement[]> {
  const [books, progress] = await Promise.all([
    vocabBooks().catch(() => [] as VocabBookInfo[]),
    vocab.progress(ctx.user.id).catch(() => null as VocabProgress | null),
  ]);
  const hidden = new Set(ctx.user.hidden ?? []);
  const out: HTMLElement[] = [];

  // Today, every activity together.
  const today = el("div", "progress-today");
  today.append(el("h2", "subtitle", prt("today")));
  const sums = profile.operators.reduce((t, o) => ({ right: t.right + o.todayCorrect, total: t.total + o.todayTotal }), { right: 0, total: 0 });
  const lines: string[] = [];
  if (sums.total > 0) lines.push(prt("todayColumns", sums));
  if (profile.quizToday?.answers > 0) lines.push(prt("todayQuiz", profile.quizToday));
  if (progress && progress.today.answers > 0) lines.push(prt("todayVocab", progress.today));
  if (lines.length === 0) lines.push(prt("todayNothing"));
  for (const line of lines) today.append(el("p", "progress-today-line", line));
  out.push(today);

  out.push(el("h2", "subtitle", prt("activities")));
  const grid = el("div", "progress-grid");
  if (!hidden.has("columns")) {
    const all = profile.operators.reduce((t, o) => ({ right: t.right + o.correct, total: t.total + o.total }), { right: 0, total: 0 });
    grid.append(
      overviewCard({
        activity: "columns",
        title: qt("arithmetic"),
        bar: null,
        lines: [all.total > 0 ? prt("columnsLine", { right: all.right, total: all.total, rate: percent(all.right, all.total) }) : prt("notStarted")],
        onDetails: all.total > 0 ? () => ctx.onScope("columns") : undefined,
      }),
    );
  }
  for (const subject of ["maths", "chemistry", "linux", "chembio", "sql", "rust", "ts", "react"] as const) {
    if (hidden.has(SUBJECT_ACTIVITY[subject])) continue;
    const skills = profile.skills.filter((s) => subjectOfTopic(s.topic) === subject);
    grid.append(
      overviewCard({
        activity: SUBJECT_ACTIVITY[subject],
        title: SUBJECT_TITLES[subject](),
        bar: skills.length ? skillBar(skills) : null,
        lines: skills.length
          ? [prt("skillsLine", { count: skills.length }), STATUS_ORDER.map((s) => `${statusName(s)} ${skills.filter((k) => k.status === s).length}`).join(" · ")]
          : [prt("notStarted")],
        onDetails: skills.length ? () => ctx.onScope(subject) : undefined,
      }),
    );
  }
  for (const book of books) {
    if (hidden.has(`vocab-${book.slug}`)) continue;
    const sum = { new: 0, learning: 0, known: 0, mastered: 0, due: 0, skipped: 0 };
    for (const lesson of book.lessons) {
      for (const section of lesson.sections) {
        const p = progress?.sections[section.id];
        if (!p) sum.new += section.entries;
        else for (const k of Object.keys(sum) as (keyof typeof sum)[]) sum[k] += p[k] ?? 0;
      }
    }
    const mine = progress?.books[book.id] ?? { due: 0, started: 0 };
    const chars = book.kind === "characters";
    const cardLines = mine.started > 0 ? [prt(chars ? "charsLine" : "wordsLine", { started: mine.started, total: book.entries })] : [prt("notStarted")];
    if (mine.due > 0) cardLines.push(prt("wordsDue", { count: mine.due }));
    if (sum.skipped > 0) cardLines.push(prt("skipped", { count: sum.skipped }));
    grid.append(
      overviewCard({
        activity: `vocab-${book.slug}`,
        title: `${chars ? "✍️" : "💬"} ${bookTitle(book)}`,
        bar: mine.started > 0 ? statusBar(sum) : null,
        lines: cardLines,
        onDetails: mine.started > 0 && ctx.onBook ? () => ctx.onBook!(book) : undefined,
        detailsLabel: prt("bookStats"),
      }),
    );
  }
  if (grid.childElementCount === 0) out.push(el("p", "empty", prt("nothingShown")));
  else out.push(grid);
  return out;
}

export async function progressView(ctx: ProgressContext): Promise<HTMLElement> {
  // A past test opened from this page: its corrections, with a way back to the list.
  if (openTest && (openTest.userId !== ctx.user.id || openTest.subject !== ctx.scope)) openTest = null;
  if (openTest) {
    const replay = ctx.onReplay;
    return pastTestView({
      viewer: ctx.user,
      test: openTest.test,
      onBack: () => {
        openTest = null;
        ctx.rerender();
      },
      onReplay: replay
        ? (spec, mode) => {
            openTest = null;
            replay(spec, mode);
          }
        : undefined,
    });
  }
  if (ctx.scope === "all" || ctx.scope === "columns") allTests = false;
  const profile = await store.profile(ctx.user.id);
  const wrap = el("section", `sheet progress-page is-${ctx.scope}`);
  wrap.append(el("h1", "title", `📈 ${qt("progressOf", { name: ctx.user.name })}`));
  if (ctx.scope === "all") {
    wrap.append(...(await overview(ctx, profile)));
  } else if (ctx.scope === "columns") {
    wrap.append(el("h2", "subtitle", qt("arithmetic")), ...columnsSection(profile));
  } else {
    wrap.append(el("h2", "subtitle", SUBJECT_TITLES[ctx.scope]()), await testsSection(ctx, ctx.scope, Boolean(ctx.onReplay)), ...subjectSection(profile, ctx.scope));
  }
  wrap.append(button("primary", ctx.fromOverview ? prt("backOverview") : qt("back"), ctx.onBack));
  return wrap;
}
