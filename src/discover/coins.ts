/**
 * Heads or tails: a coin and its streaks, in five steps.
 *
 *   1. Predict   the longest streak in 100 flips; which of two sequences of 6 is likelier
 *   2. Flip      1, 10, 100 or 1,000 at a time; the last 100 flips, what follows a
 *                streak of 3, streaks by length, the share of heads
 *   3. Compare   the longest streak against its exact distribution; the 64
 *                sequences of 6; what followed the streaks
 *   4. Explain   no memory, long streaks are normal, every sequence is as likely
 *   5. Check     an invented list against a real one: which has a streak of 4?
 *
 * The engine is shared/discover/coins.ts; what the labs share is ./lab.ts.
 */
import katex from "katex";
import "katex/dist/katex.min.css";
import { freshSeed } from "../../shared/discover/experiment";
import {
  RUN_BUCKETS,
  SERIES,
  expectedRunBuckets,
  flipBatch,
  longestRunDistribution,
  newCoinExperiment,
  runAtLeast,
  runCounts,
  type CoinExperiment,
  type Side,
} from "../../shared/discover/coins";
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

type SequenceGuess = "all" | "mixed" | "equal";
type CheckAnswer = "invented" | "real" | "both";

interface Lab {
  userId: number;
  experiment: CoinExperiment;
  step: "predict" | "lab";
  /** Longest streak predicted for 100 flips; 9 means "9 or more". */
  run: number | null;
  sequence: SequenceGuess | null;
  revealed: boolean;
  check: CheckAnswer | null;
}

/** Flips before the comparison: the longest streak is compared on the first 100. */
export const REVEAL_AFTER = SERIES;
/** Streaks this long or longer are circled in the ribbon. */
const CIRCLED = 5;
const RUN_GUESSES = [2, 3, 4, 5, 6, 7, 8, 9];
/** The two sequences of the prediction: all heads, and a mixed one. */
const ALL_HEADS: Side[] = ["heads", "heads", "heads", "heads", "heads", "heads"];
const MIXED: Side[] = ["heads", "tails", "tails", "heads", "tails", "heads"];

let lab: Lab | null = null;
const animator = createAnimator();

function startLab(userId: number, seed = freshSeed()): Lab {
  return { userId, experiment: newCoinExperiment(seed), step: "predict", run: null, sequence: null, revealed: false, check: null };
}

/** An experiment under way that a reload would lose (the update watcher asks). */
export function coinsBusy(): boolean {
  return lab !== null && lab.experiment.flips > 0 && lab.check === null;
}

export function coinsView(ctx: { user: User }): HTMLElement {
  if (!lab || lab.userId !== ctx.user.id) lab = startLab(ctx.user.id);
  return mountLab("is-coins", (draw) => {
    const state = lab!;
    const head = labHead(dt("coinsTitle"), state.experiment.seed);
    return state.step === "predict" ? [head, predictPanel(state, draw)] : [head, ...labPanels(state, draw)];
  });
}

const sideName = (side: Side): string => dt(side === "heads" ? "heads" : "tails");
const runLabel = (n: number): string => (n >= 9 ? dt("cRunPlus") : String(n));

/** A coin, heads filled, tails outlined, with the side's initial: readable without colour. */
function coin(side: Side, cls = ""): HTMLElement {
  return el("span", `coin is-${side}${cls ? ` ${cls}` : ""}`, dt(side === "heads" ? "headsShort" : "tailsShort"));
}

function sequence(sides: Side[]): HTMLElement {
  const row = el("span", "coin-seq");
  for (const side of sides) row.append(coin(side, "small"));
  return row;
}

// ---------------------------------------------------------------- 1. predict

function predictPanel(state: Lab, draw: () => void): HTMLElement {
  const box = step(dt("stepPredict"));
  box.append(el("p", "discover-intro", dt("cPredictIntro")));
  box.append(
    choiceSet<number>({
      cls: "discover-sums discover-run-guess",
      legend: dt("cPredictRun"),
      options: RUN_GUESSES.map((n) => ({ value: n, label: runLabel(n), cls: n >= 9 ? "is-same" : "" })),
      chosen: state.run,
      key: "run",
      onPick: (value) => {
        state.run = value;
        draw();
      },
    }),
    choiceSet<SequenceGuess>({
      cls: "discover-seq",
      legend: dt("cPredictSeq"),
      options: [
        { value: "all", label: sequence(ALL_HEADS), aria: dt("cSeqAll") },
        { value: "mixed", label: sequence(MIXED), aria: dt("cSeqMixed") },
        { value: "equal", label: dt("cSeqEqual"), cls: "is-same" },
      ],
      chosen: state.sequence,
      key: "seq",
      onPick: (value) => {
        state.sequence = value;
        draw();
      },
    }),
  );
  const ready = state.run !== null && state.sequence !== null;
  const go = control("primary", dt("cPredictDone"), "predict-done", () => {
    if (state.run === null || state.sequence === null) return;
    state.step = "lab";
    draw();
  });
  go.disabled = !ready;
  box.append(go);
  if (!ready) box.append(el("p", "hint", dt("cPredictNeeded")));
  return box;
}

// -------------------------------------------------------------- 2. flip

function coinShown(side: Side | null): HTMLElement {
  const box = el("div", "discover-coin");
  box.setAttribute("role", "img");
  if (!side) {
    box.classList.add("is-idle");
    box.append(coin("heads", "large"));
    box.setAttribute("aria-label", dt("noFlipYet"));
    return box;
  }
  box.append(coin(side, "large"), el("span", "discover-coin-name", sideName(side)));
  box.setAttribute("aria-label", dt("coinIs", { side: sideName(side) }));
  return box;
}

/** One flip spins for a moment; ten are shown one after the other; more are counted at once. */
async function flipAndShow(state: Lab, size: number, draw: () => void): Promise<void> {
  const shown = flipBatch(state.experiment, size);
  // Sides while the coin spins: decoration only, not part of the experiment.
  const frames: Side[] = size === 1 ? ["heads", "tails", "heads", "tails", ...shown] : shown;
  const finished = await animator.run(
    frames,
    (side, last) => {
      const next = coinShown(side);
      if (!last) next.classList.add("is-flipping");
      document.querySelector(".discover-coin")?.replaceWith(next);
    },
    size === 1 ? 70 : 120,
  );
  if (finished) draw();
}

function labPanels(state: Lab, draw: () => void): HTMLElement[] {
  const e = state.experiment;
  const panels: HTMLElement[] = [];
  const seqText = state.sequence === "all" ? dt("cSeqAll") : state.sequence === "mixed" ? dt("cSeqMixed") : dt("cSeqEqual");
  panels.push(el("p", "discover-mine", `${dt("youTitle")} : ${dt("cMineRun", { run: runLabel(state.run ?? 0) })} · ${seqText}`));

  const flip = step(dt("stepExperiment"));
  const bench = el("div", "discover-bench");
  bench.append(
    coinShown(e.last),
    batchButtons(
      (size) => (size === 1 ? dt("flipOnce") : dt("flipTimes", { count: count(size) })),
      (size) => void flipAndShow(state, size, draw),
    ),
  );
  flip.append(bench);
  const status = el("p", "discover-status");
  status.setAttribute("role", "status");
  status.append(el("strong", "", e.flips === 1 ? dt("flipsOne") : dt("flipsCount", { flips: count(e.flips) })));
  if (e.flips > 0 && e.current.side) {
    status.append(
      " · ",
      dt("cHeadsShare", { pct: percent(e.heads / e.flips) }),
      " · ",
      dt("cCurrentRun", { run: e.current.length, side: sideName(e.current.side) }),
      " · ",
      dt("cLongest", { longest: e.longest }),
    );
  }
  flip.append(status);
  panels.push(flip);

  if (e.flips > 0) panels.push(ribbonPanel(e), streakPanel(state), runsPanel(state), pathPanel(state));

  if (!state.revealed) {
    panels.push(
      revealBlock({
        ready: e.flips >= REVEAL_AFTER,
        label: dt("revealReady"),
        hint: dt("cRevealHint"),
        onReveal: () => {
          state.revealed = true;
          draw();
        },
      }),
    );
  } else {
    panels.push(
      comparePanel(state),
      explainPanel(dt("stepExplain"), [dt("cExplainMemory"), dt("cExplainRuns"), dt("cExplainSequences")]),
      checkPanel<CheckAnswer>({
        title: dt("stepCheck"),
        question: dt("cCheckQuestion"),
        options: [
          { value: "invented", label: dt("cCheckInvented") },
          { value: "real", label: dt("cCheckReal") },
          { value: "both", label: dt("cCheckBoth") },
        ],
        right: "real",
        chosen: state.check,
        onChoose: (value) => {
          state.check = value;
          draw();
        },
        rightText: dt("cCheckRight", { pct: percent(runAtLeast(20, 4), 0) }),
        wrongText: dt("cCheckWrong", { pct: percent(runAtLeast(20, 4), 0) }),
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

/** The latest 100 flips; streaks of 5 or more circled. */
function ribbonPanel(e: CoinExperiment): HTMLElement {
  const box = panel(dt("ribbonTitle"), dt("ribbonHint"));
  const ribbon = el("div", "coin-ribbon");
  const flips = e.recent;
  let longest = 0;
  for (let i = 0; i < flips.length; ) {
    let j = i;
    while (j < flips.length && flips[j] === flips[i]) j++;
    const length = j - i;
    longest = Math.max(longest, length);
    const group = el("span", length >= CIRCLED ? "ribbon-run is-long" : "ribbon-run");
    if (length >= CIRCLED) group.title = `${length} × ${sideName(flips[i]!)}`;
    for (let k = i; k < j; k++) group.append(coin(flips[k]!, "dot"));
    ribbon.append(group);
    i = j;
  }
  const heads = flips.filter((s) => s === "heads").length;
  ribbon.setAttribute("role", "img");
  ribbon.setAttribute("aria-label", dt("ribbonAria", { heads, tails: flips.length - heads, longest }));
  box.append(ribbon);
  return box;
}

/** After a streak of 3 or more: continued or broken; after the reveal, the 1-in-2 mark. */
function streakPanel(state: Lab): HTMLElement {
  const { same, other } = state.experiment.afterStreak;
  const box = panel(dt("streakTitle"), dt("streakHint"));
  const total = same + other;
  if (total === 0) {
    box.append(el("p", "stats-hint", dt("streakEmpty")));
    return box;
  }
  const rates = el("div", "stats-rates coin-streaks");
  rates.setAttribute("role", "img");
  rates.setAttribute("aria-label", dt("streakAria", { same, other }));
  for (const [label, n] of [[dt("streakSame"), same], [dt("streakOther"), other]] as const) {
    const row = el("div", "stats-rate");
    const bar = el("span", "stats-rate-bar");
    const fill = el("span", "stats-rate-fill is-box");
    fill.style.width = `${(100 * n) / total}%`;
    bar.append(fill);
    if (state.revealed) bar.append(el("span", "coin-half"));
    row.append(el("span", "stats-rate-name", label), bar, el("span", "stats-rate-value", percent(n / total, 0)), el("span", "stats-rate-of", count(n)));
    rates.append(row);
  }
  box.append(rates);
  return box;
}

/** Streaks by length; after the reveal, the expected number of each. */
function runsPanel(state: Lab): HTMLElement {
  const e = state.experiment;
  const counts = runCounts(e).slice(1);
  const labels = counts.map((_, i) => (i + 1 === RUN_BUCKETS ? `${RUN_BUCKETS}+` : String(i + 1)));
  const expected = state.revealed ? expectedRunBuckets(e.flips).slice(1) : null;
  const box = panel(dt("runsTitle"), dt("runsHint"));
  box.append(
    countsChart({
      cls: "discover-histogram discover-runs",
      labels,
      counts,
      expected,
      aria: dt("runsAria", { list: labels.map((l, i) => `${l}: ${counts[i]}`).join(", ") }),
      tip: (i) =>
        expected
          ? dt("runTipTheory", { len: labels[i]!, count: count(counts[i]!), expected: count(Math.round(expected[i]! * 10) / 10) })
          : dt("runTip", { len: labels[i]!, count: count(counts[i]!) }),
    }),
  );
  if (state.revealed) box.append(measuredLegend(), el("p", "stats-hint", dt("cRunsHalving")));
  return box;
}

function pathPanel(state: Lab): HTMLElement {
  const e = state.experiment;
  const box = panel(dt("cPathTitle"));
  box.append(
    shareChart({
      path: e.path,
      trials: e.flips,
      yMax: 1,
      yStep: 0.25,
      theory: 0.5,
      theoryLabel: dt("cPathTheory"),
      revealed: state.revealed,
      aria: dt("cPathAria", { flips: count(e.flips), pct: percent(e.flips ? e.heads / e.flips : 0) }),
      axisTitle: dt("pathAxis"),
    }),
  );
  if (state.revealed) box.append(el("p", "stats-hint", dt("keepFlipping")));
  return box;
}

// -------------------------------------------------------------- 3. compare

function comparePanel(state: Lab): HTMLElement {
  const e = state.experiment;
  const box = step(dt("stepCompare"), "discover-compare");

  // The longest streak in 100 flips: theirs, their guess, the exact chances.
  box.append(el("h3", "discover-panel-title", dt("cLongestTitle")));
  const actual = e.longestInSeries ?? e.longest;
  const guess = state.run ?? 0;
  box.append(el("p", `discover-verdict ${guess <= 4 ? "bad" : "good"}`, dt("cLongestYours", { n: actual, guess: runLabel(guess) })));
  const exact = longestRunDistribution(SERIES);
  const sum = (from: number, to: number): number => exact.slice(from, to + 1).reduce((a, b) => a + b, 0);
  box.append(
    el("p", "discover-intro", dt("cLongestTheory", { pct: percent(runAtLeast(SERIES, 6), 0), low: percent(sum(1, 4), 1) })),
  );
  const rows: { label: string; p: number; has: (n: number) => boolean }[] = [
    { label: dt("cOrLess", { n: 4 }), p: sum(1, 4), has: (n) => n <= 4 },
    ...[5, 6, 7, 8, 9, 10].map((k) => ({ label: String(k), p: exact[k]!, has: (n: number) => n === k })),
    { label: dt("cOrMore", { n: 11 }), p: sum(11, SERIES), has: (n) => n >= 11 },
  ];
  const table = el("table", "discover-table coin-longest");
  const hr = el("tr");
  for (const key of ["cTableLongest", "cTableChance"] as const) {
    const th = el("th", "", dt(key));
    th.scope = "col";
    hr.append(th);
  }
  const thead = el("thead");
  thead.append(hr);
  const tbody = el("tbody");
  for (const row of rows) {
    const tr = el("tr", row.has(actual) ? "is-target" : "");
    tr.append(el("th", "", row.label), el("td", "", percent(row.p)));
    tbody.append(tr);
  }
  table.append(thead, tbody);
  box.append(table);

  // Sequences of 6: 64 of them, each 1 in 64.
  box.append(el("h3", "discover-panel-title", dt("cSeqTitle")));
  const pair = el("p", "coin-pair");
  pair.append(sequence(ALL_HEADS), sequence(MIXED));
  const formula = el("p", "discover-formula");
  katex.render("P = \\left(\\tfrac{1}{2}\\right)^{6} = \\frac{1}{64}", formula, { throwOnError: false, displayMode: true });
  box.append(
    el("p", "discover-intro", dt("cSeqText")),
    pair,
    formula,
    el("p", "discover-intro", dt("cSeqWhy")),
    el("p", `discover-verdict ${state.sequence === "equal" ? "good" : "bad"}`, state.sequence === "equal" ? dt("cSeqYouRight") : dt("cSeqYouWrong")),
  );

  // What followed the streaks.
  box.append(el("h3", "discover-panel-title", dt("cAfterTitle")));
  const { same, other } = e.afterStreak;
  box.append(
    el(
      "p",
      "discover-intro",
      same + other > 0 ? dt("cAfterText", { same, other, pct: percent(same / (same + other), 0) }) : dt("cAfterNone"),
    ),
  );
  return box;
}
