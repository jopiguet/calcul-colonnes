/**
 * The Probability Lab: two dice, in five steps.
 *
 *   1. Predict   which sum comes up most often; how many 7s in 100 rolls
 *   2. Roll      1, 10, 100 or 1,000 at a time; counts, series of 10, the share of 7s
 *   3. Compare   the 36 ways to land, the theory, the predictions against the results
 *   4. Explain   chance varies, large numbers settle, dice have no memory
 *   5. Check     one question on the gambler's fallacy
 *
 * The engine is shared/discover/dice.ts; what the labs share is ./lab.ts. An
 * experiment is its seed, shown as "Experiment no. 4821": the same number
 * replays the same rolls. The lab lives here, outside the app's render, so a
 * language change keeps it. Nothing is saved.
 */
import katex from "katex";
import "katex/dist/katex.min.css";
import { freshSeed } from "../../shared/discover/experiment";
import { FACES, OUTCOMES, SUMS, TARGET, expected, newExperiment, rollBatch, ways, type Experiment, type Roll } from "../../shared/discover/dice";
import { el } from "../dom";
import type { User } from "../store";
import { count, dt, percent } from "./i18n";
import {
  againPanel,
  batchButtons,
  checkPanel,
  choiceSet,
  control,
  countsChart,
  createAnimator,
  explainPanel,
  labHead,
  measuredLegend,
  mountLab,
  panel,
  revealBlock,
  shareChart,
  step,
} from "./lab";

type Prediction = number | "same";
type CheckAnswer = "less" | "same" | "more";

interface Lab {
  userId: number;
  experiment: Experiment;
  step: "predict" | "lab";
  most: Prediction | null;
  sevens: number;
  revealed: boolean;
  check: CheckAnswer | null;
}

/** Rolls before the comparison is offered: fewer say too little. */
export const REVEAL_AFTER = 100;

let lab: Lab | null = null;
const animator = createAnimator();

function startLab(userId: number, seed = freshSeed()): Lab {
  return { userId, experiment: newExperiment(seed), step: "predict", most: null, sevens: 50, revealed: false, check: null };
}

/** An experiment under way that a reload would lose (the update watcher asks). */
export function diceBusy(): boolean {
  return lab !== null && lab.experiment.rolls > 0 && lab.check === null;
}

export function diceView(ctx: { user: User }): HTMLElement {
  if (!lab || lab.userId !== ctx.user.id) lab = startLab(ctx.user.id);
  return mountLab("is-dice", (draw) => {
    const state = lab!;
    const head = labHead(dt("diceTitle"), state.experiment.seed);
    return state.step === "predict" ? [head, predictPanel(state, draw)] : [head, ...labPanels(state, draw)];
  });
}

// ---------------------------------------------------------------- 1. predict

function predictPanel(state: Lab, draw: () => void): HTMLElement {
  const box = step(dt("stepPredict"));
  box.append(el("p", "discover-intro", dt("predictIntro")));
  box.append(
    choiceSet<Prediction>({
      cls: "discover-sums",
      legend: dt("predictMost"),
      options: [...SUMS.map((s) => ({ value: s as Prediction, label: String(s) })), { value: "same", label: dt("allSame"), cls: "is-same" }],
      chosen: state.most,
      key: "most",
      onPick: (value) => {
        state.most = value;
        draw();
      },
    }),
  );

  const sevens = el("label", "field discover-slider");
  sevens.append(el("span", "field-label", dt("predictSevens")));
  const row = el("span", "discover-slider-row");
  const input = el("input", "discover-range");
  input.type = "range";
  input.min = "0";
  input.max = "100";
  input.step = "1";
  input.value = String(state.sevens);
  input.dataset.focus = "sevens";
  const output = el("output", "discover-range-value", dt("sevensValue", { count: state.sevens }));
  input.addEventListener("input", () => {
    state.sevens = Number(input.value);
    output.textContent = dt("sevensValue", { count: state.sevens });
  });
  row.append(input, output);
  sevens.append(row);
  box.append(sevens);

  const go = control("primary", dt("predictDone"), "predict-done", () => {
    if (state.most === null) return;
    state.step = "lab";
    draw();
  });
  go.disabled = state.most === null;
  box.append(go);
  if (state.most === null) box.append(el("p", "hint", dt("predictNeeded")));
  return box;
}

// -------------------------------------------------------------- 2. roll

/** One die: its face drawn with dots, in a 3 × 3 grid. */
const DOTS: Record<number, number[]> = { 1: [4], 2: [0, 8], 3: [0, 4, 8], 4: [0, 2, 6, 8], 5: [0, 2, 4, 6, 8], 6: [0, 2, 3, 5, 6, 8] };

function die(face: number): HTMLElement {
  const d = el("span", "die");
  d.dataset.face = String(face);
  for (let i = 0; i < 9; i++) d.append(el("span", DOTS[face]!.includes(i) ? "pip on" : "pip"));
  return d;
}

function diceShown(roll: Roll | null): HTMLElement {
  const box = el("div", "discover-dice");
  box.setAttribute("role", "img");
  if (!roll) {
    box.append(die(1), die(1));
    box.classList.add("is-idle");
    box.setAttribute("aria-label", dt("noRollYet"));
    return box;
  }
  box.append(die(roll.a), die(roll.b), el("span", "discover-sum", dt("sumIs", { sum: roll.a + roll.b })));
  box.setAttribute("aria-label", dt("diceLabel", { a: roll.a, b: roll.b, sum: roll.a + roll.b }));
  return box;
}

/** One roll tumbles for a moment; ten are shown one after the other; more are counted at once. */
async function roll(state: Lab, size: number, draw: () => void): Promise<void> {
  const shown = rollBatch(state.experiment, size);
  // Faces while the die tumbles: decoration only, not part of the experiment.
  const tumble = (): Roll => ({ a: 1 + Math.floor(Math.random() * FACES), b: 1 + Math.floor(Math.random() * FACES) });
  const frames = size === 1 ? [tumble(), tumble(), tumble(), tumble(), ...shown] : shown;
  const finished = await animator.run(
    frames,
    (frame, last) => {
      const next = diceShown(frame);
      if (!last) next.classList.add("is-rolling");
      document.querySelector(".discover-dice")?.replaceWith(next);
    },
    size === 1 ? 70 : 120,
  );
  if (finished) draw();
}

function labPanels(state: Lab, draw: () => void): HTMLElement[] {
  const e = state.experiment;
  const panels: HTMLElement[] = [];

  panels.push(el("p", "discover-mine", `${dt("youTitle")} : ${state.most === "same" ? dt("allSame") : state.most} · ${dt("sevensValue", { count: state.sevens })}`));

  const experiment = step(dt("stepExperiment"));
  const bench = el("div", "discover-bench");
  bench.append(
    diceShown(e.last),
    batchButtons(
      (size) => (size === 1 ? dt("rollOnce") : dt("rollTimes", { count: count(size) })),
      (size) => void roll(state, size, draw),
    ),
  );
  experiment.append(bench);
  const sevens = e.bySum[TARGET]!;
  const status = el("p", "discover-status");
  status.setAttribute("role", "status");
  status.append(el("strong", "", e.rolls === 1 ? dt("rollsOne") : dt("rollsCount", { rolls: count(e.rolls) })));
  if (e.rolls > 0) status.append(" · ", dt("sevensSoFar", { count: count(sevens), pct: percent(sevens / e.rolls) }));
  experiment.append(status);
  panels.push(experiment);

  if (e.rolls > 0) panels.push(histogram(state), seriesPanel(state), pathPanel(state));

  if (!state.revealed) {
    panels.push(
      revealBlock({
        ready: e.rolls >= REVEAL_AFTER,
        label: dt("revealReady"),
        hint: dt("revealHint"),
        onReveal: () => {
          state.revealed = true;
          draw();
        },
      }),
    );
  } else {
    panels.push(
      comparePanel(state),
      explainPanel(dt("stepExplain"), [dt("explainVary"), dt("explainLarge"), dt("explainMemory")]),
      checkPanel<CheckAnswer>({
        title: dt("stepCheck"),
        question: dt("checkQuestion"),
        options: [
          { value: "less", label: dt("checkLess") },
          { value: "same", label: dt("checkSame") },
          { value: "more", label: dt("checkMore") },
        ],
        right: "same",
        chosen: state.check,
        onChoose: (value) => {
          state.check = value;
          draw();
        },
        rightText: dt("checkRight"),
        wrongText: dt("checkWrong"),
      }),
    );
  }
  panels.push(
    againPanel({
      checked: state.check !== null,
      onNew: () => {
        lab = startLab(state.userId);
        draw();
      },
      onReplay: (seed) => {
        lab = startLab(state.userId, seed);
        draw();
      },
    }),
  );
  return panels;
}

/** Counts per sum; after the reveal, a mark at the count the theory expects. */
function histogram(state: Lab): HTMLElement {
  const e = state.experiment;
  const box = panel(dt("histogramTitle"));
  box.append(
    countsChart({
      cls: "discover-histogram",
      labels: SUMS.map(String),
      counts: SUMS.map((s) => e.bySum[s]!),
      expected: state.revealed ? SUMS.map((s) => expected(s, e.rolls)) : null,
      highlight: SUMS.indexOf(TARGET),
      aria: dt("histogramAria", { list: SUMS.map((s) => `${s}: ${e.bySum[s]}`).join(", ") }),
      tip: (i) => {
        const sum = SUMS[i]!;
        const n = count(e.bySum[sum]!);
        return state.revealed
          ? dt("sumTipTheory", { sum, count: n, expected: count(Math.round(expected(sum, e.rolls) * 10) / 10) })
          : dt("sumTip", { sum, count: n });
      },
    }),
  );
  if (state.revealed) box.append(measuredLegend());
  return box;
}

/** Sevens in each series of 10: small samples vary. */
function seriesPanel(state: Lab): HTMLElement {
  const box = panel(dt("seriesTitle"), dt("seriesHint"));
  const series = state.experiment.series;
  if (series.length === 0) {
    box.append(el("p", "stats-hint", dt("seriesEmpty")));
    return box;
  }
  const list = el("ol", "discover-series");
  for (const n of series.slice(-16)) {
    const item = el("li", "discover-series-item");
    item.title = dt("seriesItem", { count: n });
    const bar = el("span", "discover-series-bar");
    for (let i = 0; i < 10; i++) bar.append(el("span", i < n ? "on" : ""));
    item.append(bar, el("span", "discover-series-count", dt("seriesItem", { count: n })));
    list.append(item);
  }
  box.append(list);
  return box;
}

function pathPanel(state: Lab): HTMLElement {
  const e = state.experiment;
  const box = panel(dt("pathTitle"));
  box.append(
    shareChart({
      path: e.path,
      trials: e.rolls,
      yMax: 0.5,
      yStep: 0.1,
      theory: 1 / 6,
      theoryLabel: dt("pathTheory"),
      revealed: state.revealed,
      aria: dt("pathAria", { rolls: count(e.rolls), pct: percent(e.rolls ? e.bySum[TARGET]! / e.rolls : 0) }),
      axisTitle: dt("pathAxis"),
    }),
  );
  if (state.revealed) box.append(el("p", "stats-hint", dt("keepRolling")));
  return box;
}

// -------------------------------------------------------------- 3. compare

function comparePanel(state: Lab): HTMLElement {
  const e = state.experiment;
  const box = step(dt("stepCompare"), "discover-compare");

  // The 36 ways to land.
  box.append(el("h3", "discover-panel-title", dt("gridTitle")), el("p", "discover-intro", dt("gridIntro")));
  const table = el("table", "dice-grid");
  const head = el("tr");
  const corner = el("th", "dice-grid-corner");
  corner.append(el("span", "dice-grid-die1", dt("die1")), el("span", "dice-grid-die2", dt("die2")));
  head.append(corner);
  for (let a = 1; a <= FACES; a++) {
    const th = el("th");
    th.scope = "col";
    th.append(die(a));
    th.setAttribute("aria-label", `${dt("die1")} ${a}`);
    head.append(th);
  }
  const thead = el("thead");
  thead.append(head);
  const body = el("tbody");
  for (let b = 1; b <= FACES; b++) {
    const row = el("tr");
    const th = el("th");
    th.scope = "row";
    th.append(die(b));
    th.setAttribute("aria-label", `${dt("die2")} ${b}`);
    row.append(th);
    for (let a = 1; a <= FACES; a++) {
      const sum = a + b;
      const predicted = typeof state.most === "number" && state.most !== TARGET && sum === state.most;
      const cell = el("td", `dice-grid-cell${sum === TARGET ? " is-target" : ""}${predicted ? " is-predicted" : ""}`, String(sum));
      cell.title = `${a} + ${b} = ${sum}`;
      row.append(cell);
    }
    body.append(row);
  }
  table.append(thead, body);
  box.append(table, el("p", "discover-intro", dt("gridSeven")), el("p", "discover-intro", dt("gridEdges")));

  // The theory, and the measured shares.
  box.append(el("h3", "discover-panel-title", dt("theoryTitle")));
  const formula = el("p", "discover-formula");
  katex.render(`P(7) = \\frac{6}{${OUTCOMES}} = \\frac{1}{6}`, formula, { throwOnError: false, displayMode: true });
  box.append(formula, el("p", "discover-intro", dt("theoryLine", { pct: percent(1 / 6) })));
  const shares = el("table", "discover-table");
  const hr = el("tr");
  for (const key of ["tableSum", "tableWays", "tableTheory", "tableMeasured"] as const) {
    const th = el("th", "", dt(key));
    th.scope = "col";
    hr.append(th);
  }
  const sh = el("thead");
  sh.append(hr);
  const sb = el("tbody");
  for (const sum of SUMS) {
    const tr = el("tr", sum === TARGET ? "is-target" : "");
    tr.append(
      el("th", "", String(sum)),
      el("td", "", `${ways(sum)} / ${OUTCOMES}`),
      el("td", "", percent(ways(sum) / OUTCOMES)),
      el("td", "", percent(e.bySum[sum]! / Math.max(1, e.rolls))),
    );
    sb.append(tr);
  }
  shares.append(sh, sb);
  box.append(shares);

  // The predictions against the results.
  box.append(el("h3", "discover-panel-title", dt("youTitle")));
  const most =
    state.most === TARGET
      ? dt("youMostRight")
      : state.most === "same"
        ? dt("youMostSame")
        : dt("youMostOther", { sum: state.most ?? "", ways: ways(Number(state.most)) });
  const measured = Math.round((100 * e.bySum[TARGET]!) / Math.max(1, e.rolls));
  box.append(
    el("p", `discover-verdict ${state.most === TARGET ? "good" : "bad"}`, most),
    el("p", "discover-verdict", dt("youSevens", { guess: state.sevens, measured })),
  );
  return box;
}
