/**
 * A book's statistics page: what has been learnt, how it went over the last
 * 30 days, what comes back soon, and the words that resist. The numbers come
 * from the server (GET /api/vocab/stats), computed in shared/vocab/stats.ts.
 *
 * Charts are plain HTML: bars sized in %, a tooltip on each (title), and an
 * aria-label giving the figures, so they read without colour or a mouse.
 */
import type { VocabLevelWord, VocabStats } from "../shared/types";
import { TOP_BOX } from "../shared/vocab/schedule";
import { button, el } from "./dom";
import { currentLang } from "./i18n";
import { vocab, type User, type VocabBookInfo } from "./store";
import { bookTitle, statusBar } from "./vocab";
import { vt } from "./vocab-i18n";

export interface StatsContext {
  user: User;
  book: VocabBookInfo;
  onBack(): void;
}

const pct = (right: number, answers: number): number => (answers ? Math.round((100 * right) / answers) : 0);

function dateLabel(day: string, style: "short" | "long"): string {
  const date = new Date(`${day}T12:00:00Z`);
  const locale = { fr: "fr-CH", es: "es-ES", en: "en-GB" }[currentLang()];
  return new Intl.DateTimeFormat(locale, style === "long" ? { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" } : { day: "numeric", month: "numeric", timeZone: "UTC" }).format(date);
}

function panel(title: string, hint?: string): HTMLElement {
  const box = el("section", "stats-panel");
  box.append(el("h2", "stats-title", title));
  if (hint) box.append(el("p", "stats-hint", hint));
  return box;
}

function tile(label: string, value: string, sub: string): HTMLElement {
  const t = el("div", "stats-tile");
  t.append(el("span", "stats-tile-label", label), el("span", "stats-tile-value", value), el("span", "stats-tile-sub", sub));
  return t;
}

function legend(items: [string, string][]): HTMLElement {
  const l = el("p", "stats-legend");
  for (const [cls, text] of items) {
    const item = el("span", "stats-legend-item");
    item.append(el("span", `stats-swatch ${cls}`), text);
    l.append(item);
  }
  return l;
}

/** Vertical bars: one column per value; `parts` are stacked from the bottom. */
function columns(
  values: { parts: { cls: string; value: number }[]; tip: string; label?: string; top?: string }[],
  aria: string,
  cls = "",
  /** Each column a button that shows what it holds. */
  pick?: (index: number, col: HTMLElement) => void,
): HTMLElement {
  const chart = el("div", `stats-columns ${cls}`);
  chart.setAttribute("role", pick ? "group" : "img");
  chart.setAttribute("aria-label", aria);
  const max = Math.max(1, ...values.map((v) => v.parts.reduce((s, p) => s + p.value, 0)));
  values.forEach((v, index) => {
    const col = pick ? button("stats-col is-pick", "", () => pick(index, col)) : el("div", "stats-col");
    col.title = v.tip;
    if (pick) col.setAttribute("aria-label", v.tip);
    const stack = el("div", "stats-stack");
    const total = v.parts.reduce((s, p) => s + p.value, 0);
    stack.style.height = `${(100 * total) / max}%`;
    for (const p of v.parts) {
      if (p.value === 0) continue;
      const seg = el("div", `stats-seg ${p.cls}`);
      seg.style.flexGrow = String(p.value);
      stack.append(seg);
    }
    const area = el("div", "stats-col-area");
    if (v.top) area.append(el("span", "stats-col-top", v.top));
    area.append(stack);
    col.append(area, el("span", "stats-col-label", v.label ?? ""));
    chart.append(col);
  });
  return chart;
}

/** A word in a list: the word (its reading), its meaning, and a figure on the right. */
function wordRow(book: VocabBookInfo, term: string, reading: string, meaning: string, figure: string): HTMLElement {
  const item = el("li", "stats-hard");
  const t = el("span", "stats-hard-term", term);
  t.lang = book.term;
  if (reading) {
    const r = el("span", "stats-hard-reading", reading);
    r.lang = `${book.term}-Latn`;
    t.append(" ", r);
  }
  const m = el("span", "stats-hard-meaning", meaning);
  m.lang = book.meaning;
  item.append(t, m, el("span", "stats-hard-count", figure));
  return item;
}

/**
 * The words behind a level or a box, shown under the chart that was touched: fetched once
 * (GET /api/vocab/books/:id/words), the most missed first. Touching the same thing again hides them.
 */
function levelLister(ctx: StatsContext): { area: HTMLElement; show(key: string, title: (count: number) => string, keep: (w: VocabLevelWord) => boolean, from: HTMLElement): void } {
  const area = el("div", "stats-words");
  area.hidden = true;
  let words: Promise<VocabLevelWord[]> | null = null;
  let shown = "";
  let pressed: HTMLElement | null = null;
  return {
    area,
    show(key, title, keep, from) {
      pressed?.setAttribute("aria-pressed", "false");
      if (shown === key) {
        shown = "";
        area.hidden = true;
        return;
      }
      shown = key;
      pressed = from;
      from.setAttribute("aria-pressed", "true");
      from.parentElement?.closest(".stats-panel")?.append(area);
      area.hidden = false;
      area.replaceChildren(el("p", "stats-hint", "…"));
      words ??= vocab.bookWords(ctx.user.id, ctx.book.id, currentLang());
      words.then(
        (all) => {
          if (shown !== key) return;
          const picked = all.filter(keep).sort((a, b) => b.wrong - a.wrong || a.term.localeCompare(b.term, currentLang()));
          const list = el("ol", "stats-hardest");
          for (const w of picked) list.append(wordRow(ctx.book, w.term, w.reading, w.meaning, w.wrong ? vt("levelWrong", { wrong: w.wrong }) : ""));
          area.replaceChildren(el("h3", "stats-words-title", title(picked.length)), picked.length ? list : el("p", "stats-hint", vt("levelEmpty")));
        },
        () => {
          words = null;
          area.replaceChildren(el("p", "stats-hint", vt("levelEmpty")));
        },
      );
    },
  };
}

export async function statsView(ctx: StatsContext): Promise<HTMLElement> {
  const { book } = ctx;
  const wrap = el("section", "sheet vocab-stats");
  const back = button("ghost small", `← ${vt("backToLessons")}`, ctx.onBack);
  wrap.append(back, el("h1", "title", vt("statsTitle")), el("p", "vocab-source", `${bookTitle(book)} · ${book.title}`));
  const s: VocabStats = await vocab.stats(ctx.user.id, book.id);

  // Headline figures.
  const seen = s.words.total - s.words.new;
  const month = s.days.reduce((t, d) => ({ answers: t.answers + d.answers, right: t.right + d.right }), { answers: 0, right: 0 });
  const tiles = el("div", "stats-tiles");
  tiles.append(
    tile(vt("tileSeen"), String(seen), vt("tileOf", { total: s.words.total })),
    tile(vt("tileMastered"), String(s.words.mastered), vt("tileKnown", { known: s.words.known })),
    tile(vt("tileAccuracy"), month.answers ? vt("accuracy", { pct: pct(month.right, month.answers) }) : "–", vt("tileAnswers", { answers: month.answers })),
    tile(vt("tileStreak"), String(s.streak.current), vt("tileBest", { best: s.streak.best })),
  );
  wrap.append(tiles);

  if (s.all.answers === 0) {
    wrap.append(el("p", "empty", vt("noAnswers")));
    return wrap;
  }

  // The last 30 days: right and wrong answers per day.
  const history = panel(vt("historyTitle"));
  const newWords = s.days.reduce((t, d) => t + d.newWords, 0);
  history.append(
    legend([["is-right", vt("legendRight")], ["is-wrong", vt("legendWrong")]]),
    columns(
      s.days.map((d, i) => ({
        parts: [
          { cls: "is-right", value: d.right },
          { cls: "is-wrong", value: d.answers - d.right },
        ],
        tip: vt("dayTip", { day: dateLabel(d.day, "long"), right: d.right, answers: d.answers, newWords: d.newWords }),
        label: i === 0 || i === 14 || i === s.days.length - 1 ? dateLabel(d.day, "short") : "",
      })),
      s.days.filter((d) => d.answers).map((d) => vt("dayTip", { ...d, day: dateLabel(d.day, "long") })).join(" ; "),
      "is-history",
    ),
    el("p", "stats-hint", vt("historyNew", { count: newWords })),
  );
  wrap.append(history);

  // Where the words stand, overall and per lesson.
  const levels = panel(vt("levelsTitle"));
  const big = statusBar(s.words);
  big.classList.add("is-large");
  const lister = levelLister(ctx);
  const picks = el("p", "stats-legend");
  for (const [status, key] of [["mastered", "statusMastered"], ["known", "statusKnown"], ["learning", "statusLearning"]] as const) {
    const b = button("stats-legend-item is-pick", "", () =>
      lister.show(status, (count) => vt("levelWords", { name: vt(key), count }), (w) => w.status === status, b),
    );
    b.setAttribute("aria-pressed", "false");
    b.append(el("span", `stats-swatch vocab-bar-${status}`), `${vt(key)} ${s.words[status]}`);
    picks.append(b);
  }
  const fresh = el("span", "stats-legend-item");
  fresh.append(el("span", "stats-swatch is-new"), `${vt("statusNew")} ${s.words.new}`);
  picks.append(fresh);
  levels.append(big, picks, el("p", "stats-hint", vt("levelPick")));
  wrap.append(levels);

  // What comes back: today (overdue included) and the next 13 days.
  const forecast = panel(vt("forecastTitle"), vt("forecastHint"));
  const now = new Date();
  const dayAt = (i: number): string => {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i, 12);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  };
  forecast.append(
    columns(
      s.forecast.map((count, i) => ({
        parts: [{ cls: "is-due", value: count }],
        tip: vt("forecastTip", { day: i === 0 ? vt("todayShort") : dateLabel(dayAt(i), "long"), count }),
        label: i === 0 ? vt("todayShort") : i % 2 === 0 ? dateLabel(dayAt(i), "short") : "",
        top: count ? String(count) : "",
      })),
      s.forecast.map((count, i) => vt("forecastTip", { day: i === 0 ? vt("todayShort") : dateLabel(dayAt(i), "long"), count })).join(" ; "),
      "is-forecast",
    ),
  );
  wrap.append(forecast);

  // Leitner boxes, per direction.
  const boxes = panel(vt("boxesTitle"), vt("boxesHint"));
  const grid = el("div", "stats-boxes");
  const directions = [["recognise", "recogniseRow"], ["recall", "recallRow"], ["read", "readRow"]] as const;
  // Reading is a kanji's third direction: shown once there is a card in it.
  for (const [direction, key] of directions.filter(([d]) => d !== "read" || s.boxes.read.some((c) => c > 0))) {
    const counts = s.boxes[direction].slice(1, TOP_BOX + 1);
    const row = el("div", "stats-box-row");
    row.append(
      el("span", "stats-box-name", vt(key)),
      columns(
        counts.map((count, i) => ({
          parts: [{ cls: "is-box", value: count }],
          tip: vt("boxTip", { box: i + 1, count }),
          label: String(i + 1),
          top: count ? String(count) : "",
        })),
        `${vt(key)} : ${counts.map((count, i) => vt("boxTip", { box: i + 1, count })).join(", ")}`,
        "is-boxes",
        (i, col) =>
          lister.show(
            `${direction}-${i + 1}`,
            (count) => vt("levelWordsBox", { direction: vt(key), box: i + 1, count }),
            (w) => w.boxes[direction] === i + 1,
            col,
          ),
      ),
    );
    grid.append(row);
  }
  boxes.append(grid);
  wrap.append(boxes);

  // How each kind of question goes.
  const kinds = panel(vt("kindsTitle"));
  const table = el("div", "stats-rates");
  for (const [label, t] of [
    [vt("howChoice"), s.byMode.choice],
    [vt("howWritten"), s.byMode.written],
    [vt("kindRecognise"), s.byDirection.recognise],
    [vt("kindRecall"), s.byDirection.recall],
    [vt("kindRead"), s.byDirection.read],
  ] as const) {
    if (t.answers === 0) continue;
    const row = el("div", "stats-rate");
    const bar = el("span", "stats-rate-bar");
    const fill = el("span", "stats-rate-fill");
    fill.style.width = `${pct(t.right, t.answers)}%`;
    bar.append(fill);
    row.append(
      el("span", "stats-rate-name", label),
      bar,
      el("span", "stats-rate-value", `${vt("accuracy", { pct: pct(t.right, t.answers) })}`),
      el("span", "stats-rate-of", vt("ofAnswers", { right: t.right, answers: t.answers })),
    );
    table.append(row);
  }
  kinds.append(table);
  if (s.byMode.written.answers > 0) {
    const v = s.verdicts;
    const parts: ["vRight" | "vAccent" | "vTypo" | "vArticle" | "vWrong", number][] = [["vRight", v.right], ["vAccent", v.accent], ["vTypo", v.typo], ["vArticle", v.article], ["vWrong", v.wrong]];
    kinds.append(
      el("p", "stats-hint", `${vt("verdictsTitle")} : ${parts.filter(([, n]) => n > 0).map(([k, n]) => `${n} ${vt(k)}`).join(" · ")}`),
    );
  }
  wrap.append(kinds);

  // Per lesson.
  const lessons = panel(vt("lessonsTitle"));
  const list = el("ul", "stats-lessons");
  for (const lesson of s.lessons) {
    const item = el("li", "stats-lesson");
    // Words seen out of the lesson's words; the bar shows how far they are.
    item.append(
      el("span", "stats-lesson-title", lesson.title),
      statusBar(lesson),
      el("span", "stats-lesson-value", `${lesson.total - lesson.new} / ${lesson.total}`),
    );
    item.title = vt("progressLabel", lesson);
    list.append(item);
  }
  lessons.append(list);
  wrap.append(lessons);

  // The words that resist.
  const hardest = panel(vt("hardestTitle"));
  if (s.hardest.length === 0) hardest.append(el("p", "stats-hint", vt("hardestEmpty")));
  else {
    const rows = el("ol", "stats-hardest");
    for (const h of s.hardest) rows.append(wordRow(book, h.term, h.reading, h.meaning, vt("wrongOf", h)));
    hardest.append(rows);
  }
  wrap.append(hardest);
  return wrap;
}
