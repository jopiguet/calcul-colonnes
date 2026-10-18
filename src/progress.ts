import { TOPICS, type SkillStatus } from "../shared/quiz";
import type { SkillProgress } from "../shared/types";
import { button, el } from "./dom";
import { qt, skillName, statusName, topicName } from "./quiz-i18n";
import { store, type User } from "./store";

/**
 * Progress page of one player: every kind of question met in the tests, with
 * its latest answers and its status, and the column arithmetic by operation.
 */

const STATUS_ORDER: SkillStatus[] = ["review", "learning", "mastered"];

const percent = (correct: number, total: number): string =>
  total === 0 ? "—" : `${Math.round((100 * correct) / total)} %`;

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

export async function progressView(user: User, onBack: () => void): Promise<HTMLElement> {
  const profile = await store.profile(user.id);
  const wrap = el("section", "sheet progress-page");
  wrap.append(el("h1", "title", `📈 ${qt("progressOf", { name: user.name })}`));

  // ---- multiple-choice tests
  wrap.append(el("h2", "subtitle", `📐 ${qt("quizScores")}`));
  if (profile.skills.length === 0) {
    wrap.append(el("p", "empty", qt("noQuiz")));
  } else {
    const summary = el("div", "status-summary");
    for (const status of STATUS_ORDER) {
      const n = profile.skills.filter((s) => s.status === status).length;
      summary.append(el("span", `badge is-${status}`, `${statusName(status)} · ${n}`));
    }
    wrap.append(summary);

    for (const topic of TOPICS) {
      const skills = profile.skills
        .filter((s) => s.topic === topic)
        .sort(
          (a, b) =>
            STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status) ||
            skillName(a.skill).localeCompare(skillName(b.skill)),
        );
      if (skills.length === 0) continue;
      const block = el("div", "topic-block");
      block.append(el("h3", "topic-title", topicName(topic)));
      const list = el("ul", "skills");
      list.append(...skills.map(skillRow));
      block.append(list);
      wrap.append(block);
    }
    wrap.append(el("p", "hint", qt("progressRule")));
  }

  // ---- column arithmetic
  wrap.append(el("h2", "subtitle", qt("arithmetic")));
  if (profile.operators.length === 0) {
    wrap.append(el("p", "empty", qt("noArithmetic")));
  } else {
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
    wrap.append(table);
  }

  const back = button("primary", qt("back"), onBack);
  wrap.append(back);
  return wrap;
}
