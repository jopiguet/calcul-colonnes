/**
 * Workbook exercises (docs/exercises.md): a book's units, then a unit's
 * exercises as the book prints them, to fill in on the page itself — each
 * dotted line is a field — or under it. Answers are kept as they are typed;
 * the whole unit is corrected at the end, by the server, against the key.
 */
import { button, el } from "./dom";
import { workbook, type User } from "./store";
import { wt } from "./workbook-i18n";
import type { ExerciseBookInfo, ExerciseView } from "../shared/exercises/api";

export interface WorkbookContext {
  user: User;
  book: string;
  unit: number | null;
  openUnit: (unit: number | null) => void;
  rerender: () => void;
}

const percent = (score: number, total: number): number => (total > 0 ? Math.round((100 * score) / total) : 0);

/** The book's page, or a unit's. */
export async function workbookView(ctx: WorkbookContext): Promise<HTMLElement> {
  return ctx.unit === null ? bookPage(ctx) : unitPage(ctx, ctx.unit);
}

/** A book's card on the home page: its progress. */
export function workbookStatus(b: ExerciseBookInfo): { text: string; waiting: boolean } {
  return b.checked > 0
    ? { text: wt("unitStatus", { checked: b.checked, total: b.exercises, percent: percent(b.score, b.total) }), waiting: false }
    : { text: wt("exercises", { count: b.exercises }), waiting: false };
}

async function bookPage(ctx: WorkbookContext): Promise<HTMLElement> {
  const view = await workbook.book(ctx.user.id, ctx.book);
  const wrap = el("section", "workbook-home");
  wrap.append(el("h1", "title", view.book.title));
  const b = view.book;
  wrap.append(el("p", "workbook-meta", [b.level, wt("units", { count: b.units }), wt("exercises", { count: b.exercises })].filter(Boolean).join(" · ")));
  wrap.append(el("p", "workbook-progress", b.checked > 0 ? wt("progress", { checked: b.checked, total: b.exercises, percent: percent(b.score, b.total) }) : wt("notStarted")));
  const next = view.units.find((u) => u.checked < u.exercises) ?? view.units[0];
  if (next) wrap.append(button("primary workbook-continue", wt("continue", { n: next.n }), () => ctx.openUnit(next.n)));
  const list = el("div", "workbook-units");
  for (const u of view.units) {
    const item = button("workbook-unit", "", () => ctx.openUnit(u.n));
    item.dataset.unit = String(u.n);
    item.append(el("span", "workbook-unit-n", String(u.n)), el("span", "workbook-unit-title", u.title || wt("unitLabel", { n: u.n })));
    const done = u.checked > 0;
    const status = el("span", `workbook-unit-status${done && u.checked === u.exercises ? " done" : ""}`, done ? wt("unitStatus", { checked: u.checked, total: u.exercises, percent: percent(u.score, u.total) }) : wt("unitTodo", { total: u.exercises }));
    item.append(status);
    list.append(item);
  }
  wrap.append(list);
  return wrap;
}

/** Answers of the unit as typed, by exercise and item: one string per gap. */
type Answers = Record<string, Record<string, string[]>>;

async function unitPage(ctx: WorkbookContext, unit: number): Promise<HTMLElement> {
  let view = await workbook.unit(ctx.user.id, ctx.book, unit);
  const answers: Answers = Object.fromEntries(view.exercises.map((e) => [e.id, structuredClone(e.answers)]));
  const wrap = el("section", "workbook-unit-page");

  const nav = el("nav", "workbook-nav");
  nav.append(button("ghost small", wt("backToBook", { title: view.book.source }), () => ctx.openUnit(null)));
  const steps = el("span", "workbook-steps");
  if (view.previous !== null) steps.append(button("ghost small", wt("previous", { n: view.previous }), () => ctx.openUnit(view.previous)));
  if (view.next !== null) steps.append(button("ghost small", wt("next", { n: view.next }), () => ctx.openUnit(view.next)));
  nav.append(steps);
  wrap.append(nav);
  wrap.append(el("h1", "title workbook-title", `${wt("unitLabel", { n: view.unit.n })}${view.unit.title ? ` · ${view.unit.title}` : ""}`));
  wrap.append(el("p", "workbook-hint", wt("checkHint")));

  const status = el("p", "workbook-save");
  status.setAttribute("role", "status");
  const list = el("div", "workbook-exercises");
  const summary = el("div", "workbook-summary");
  const actions = el("div", "workbook-actions");
  wrap.append(list, summary, actions, status);

  // Drafts: saved a moment after the last key, exercise by exercise.
  const timers = new Map<string, number>();
  const saveSoon = (id: string): void => {
    window.clearTimeout(timers.get(id));
    timers.set(
      id,
      window.setTimeout(() => {
        timers.delete(id);
        workbook.save(ctx.user.id, ctx.book, id, answers[id]!).then(
          () => (status.textContent = wt("saved")),
          () => (status.textContent = wt("saveFailed")),
        );
      }, 700),
    );
  };

  const draw = (): void => {
    list.replaceChildren(...view.exercises.map((e) => exerciseCard(e, answers[e.id]!, (item, slot, value) => {
      const a = answers[e.id]!;
      const slots = a[item] ?? [];
      slots[slot] = value;
      a[item] = slots;
      saveSoon(e.id);
    }, async (item, right) => {
      await workbook.override(ctx.user.id, ctx.book, e.id, item, right);
      view = await workbook.unit(ctx.user.id, ctx.book, unit);
      draw();
    })));
    const checked = view.exercises.filter((e) => e.result);
    summary.replaceChildren();
    if (checked.length > 0) {
      const score = checked.reduce((s, e) => s + e.result!.score, 0);
      const total = checked.reduce((s, e) => s + e.result!.total, 0);
      summary.append(el("p", "workbook-unit-score", wt("unitScore", { score, total, percent: percent(score, total) })));
    }
    actions.replaceChildren();
    const check = button("primary workbook-check", checked.length > 0 ? wt("checkAgain") : wt("check"), () => {
      check.disabled = true;
      check.textContent = wt("checking");
      for (const t of timers.values()) window.clearTimeout(t);
      timers.clear();
      void workbook.check(ctx.user.id, ctx.book, unit, answers).then(
        (v) => {
          view = v;
          draw();
          summary.scrollIntoView({ block: "center", behavior: "smooth" });
        },
        () => {
          check.disabled = false;
          check.textContent = wt("check");
          status.textContent = wt("saveFailed");
        },
      );
    });
    actions.append(check);
    if (checked.length > 0) {
      actions.append(
        button("ghost workbook-restart", wt("restart"), () => {
          if (!window.confirm(wt("restartConfirm"))) return;
          void workbook.reset(ctx.user.id, ctx.book, unit).then(() => ctx.rerender());
        }),
      );
      if (view.next !== null) actions.append(button("ghost", wt("next", { n: view.next }), () => ctx.openUnit(view.next)));
    }
  };
  draw();
  return wrap;
}

type OnType = (item: string, slot: number, value: string) => void;
type OnMark = (item: string, right: boolean | null) => Promise<void>;

/** One exercise: the page's image with a field on each gap, fields for the other items, and its correction. */
function exerciseCard(e: ExerciseView, typed: Record<string, string[]>, onType: OnType, onMark: OnMark): HTMLElement {
  const card = el("article", "workbook-exercise");
  card.dataset.exercise = e.id;
  const result = new Map((e.result?.items ?? []).map((r) => [r.n, r]));
  // The exercise's number is on its image; the head holds its score once corrected.
  if (e.result && e.result.total > 0) {
    const head = el("header", "workbook-exercise-head");
    head.append(el("span", "workbook-exercise-id", e.id), el("span", `workbook-exercise-score${e.result.score === e.result.total ? " full" : ""}`, wt("score", { score: e.result.score, total: e.result.total })));
    card.append(head);
  }

  const field = (item: string, slot: number, className: string, label: string): HTMLInputElement => {
    const input = el("input", className);
    input.type = "text";
    input.autocomplete = "off";
    input.spellcheck = false;
    input.setAttribute("autocapitalize", "off");
    input.setAttribute("aria-label", label);
    input.value = typed[item]?.[slot] ?? "";
    input.dataset.item = item;
    const r = result.get(item);
    if (r) input.classList.add(`wb-${r.result}`);
    input.addEventListener("input", () => {
      onType(item, slot, input.value);
      input.classList.remove("wb-right", "wb-wrong", "wb-blank", "wb-open");
    });
    return input;
  };

  // The page, with the gaps as fields.
  const sheet = el("div", "workbook-sheet");
  const img = el("img");
  img.src = e.image;
  img.alt = wt("imageAlt", { id: e.id });
  img.width = e.width;
  img.height = e.height;
  img.loading = "lazy";
  img.decoding = "async";
  sheet.append(img);
  const loose: { n: string }[] = [];
  for (const item of e.items) {
    if (item.gaps.length === 0) {
      loose.push(item);
      continue;
    }
    item.gaps.forEach(([x, y, w], slot) => {
      const input = field(item.n, slot, "workbook-gap", wt("gapAria", { id: e.id, n: item.n }));
      input.style.left = `${(x * 100).toFixed(2)}%`;
      input.style.top = `${(y * 100).toFixed(2)}%`;
      input.style.width = `${Math.max(w * 100, 4).toFixed(2)}%`;
      sheet.append(input);
    });
  }
  const scroller = el("div", "workbook-sheet-scroll");
  scroller.append(sheet);
  card.append(scroller);

  // Items without a gap on the page (circle, match, rewrite…), and free answers.
  if (loose.length > 0 || e.items.length === 0) {
    const answers = el("div", "workbook-fields");
    answers.append(el("h3", "workbook-fields-title", wt("answersTitle")));
    if (e.items.length === 0) {
      const area = el("textarea", "workbook-free");
      area.rows = 3;
      area.setAttribute("aria-label", wt("freeAnswer"));
      area.placeholder = wt("freeAnswer");
      area.value = typed["0"]?.[0] ?? "";
      area.addEventListener("input", () => onType("0", 0, area.value));
      answers.append(area);
    }
    for (const item of loose) {
      const row = el("label", "workbook-field");
      row.append(el("span", "workbook-field-n", item.n), field(item.n, 0, "workbook-input", wt("gapAria", { id: e.id, n: item.n })));
      answers.append(row);
    }
    card.append(answers);
  }

  // The correction: each item with the key, and the player's say.
  if (e.result) {
    const key = el("div", "workbook-key");
    key.append(el("h3", "workbook-fields-title", wt("key")));
    if (e.result.note) key.append(el("p", "workbook-key-note", e.result.note));
    if (e.open) key.append(el("p", "workbook-key-note", wt("openNote")));
    if (e.result.keyText) key.append(el("p", "workbook-key-text", e.result.keyText));
    const rows = el("ol", "workbook-key-items");
    for (const r of e.result.items) {
      const li = el("li", `workbook-key-item wb-${r.result}`);
      li.dataset.item = r.n;
      const mark = r.result === "right" ? "✓" : r.result === "wrong" ? "✗" : r.result === "blank" ? "–" : "?";
      li.append(el("span", "workbook-key-mark", mark), el("span", "workbook-key-n", r.n));
      const body = el("span", "workbook-key-body");
      body.append(el("span", "workbook-key-answer", r.expected || "—"));
      const given = (typed[r.n] ?? []).filter((t) => t.trim()).join(" … ");
      if ((r.result !== "right" && r.result !== "blank") || r.overridden) body.append(el("span", "workbook-key-given", wt("yourAnswer", { text: given || wt("empty") })));
      if (r.overridden) body.append(el("span", "workbook-key-by-you", wt("markedByYou")));
      li.append(body);
      const say = el("span", "workbook-key-say");
      if (r.overridden) say.append(button("ghost tiny", wt("undo"), () => void onMark(r.n, null)));
      else if (r.result === "wrong") say.append(button("ghost tiny workbook-i-was-right", wt("iWasRight"), () => void onMark(r.n, true)));
      else if (r.result === "open") {
        say.append(button("ghost tiny workbook-mark-right", wt("markRight"), () => void onMark(r.n, true)), button("ghost tiny", wt("markWrong"), () => void onMark(r.n, false)));
      }
      li.append(say);
      rows.append(li);
    }
    key.append(rows);
    card.append(key);
  }
  return card;
}
