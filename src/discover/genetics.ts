/**
 * Mendel's peas, in five steps.
 *
 *   1. Predict   the share of green peas from two Aa parents; whether a streak changes the next one
 *   2. Try       pick a cross: its Punnett square; breed offspring, 1 to 1,000 at a time
 *   3. Compare   equally likely cells; chi-square and p-value for each cross; the predictions
 *   4. Explain   alleles; the square; two genes; chance over few and many
 *   5. Check     Aa × aa
 *
 * The crosses and the draws are in shared/discover/genetics.ts, seeded like
 * the probability labs: an experiment number gives the same peas again.
 * `npm run check:biology` checks the squares and the draws.
 */
import { breed, pValue, phenotypeShares, punnett } from "../../shared/discover/genetics";
import { chiSquare, freshSeed } from "../../shared/discover/experiment";
import { el } from "../dom";
import type { User } from "../store";
import { batchButtons, checkPanel, choiceSet, explainPanel, mountLab, panel, reducedMotion, step } from "./lab";
import { bt } from "./bio-i18n";
import { num, pct, pt } from "./physics-i18n";
import { formula, gatedButton, mineLine, restartPanel, table, verdict } from "./physics-ui";

export const REVEAL_AFTER = 100;
export const CROSSES: [string, string][] = [
  ["Aa", "Aa"],
  ["Aa", "aa"],
  ["AA", "aa"],
  ["AaBb", "AaBb"],
];

type ShareAnswer = "0" | "1/4" | "1/2" | "3/4";
type NextAnswer = "more" | "same" | "less";
type CheckAnswer = "quarter" | "half" | "all";

interface Lab {
  userId: number;
  seed: number;
  step: "predict" | "lab";
  share: ShareAnswer | null;
  next: NextAnswer | null;
  cross: number;
  /** Offspring bred so far, per cross, by phenotype. */
  bred: Record<number, Record<string, number>>;
  revealed: boolean;
  check: CheckAnswer | null;
}

let lab: Lab | null = null;

const startLab = (userId: number): Lab => ({ userId, seed: freshSeed(), step: "predict", share: null, next: null, cross: 0, bred: {}, revealed: false, check: null });

export const geneticsBusy = (): boolean => lab !== null && Object.keys(lab.bred).length > 0 && lab.check === null;

const shareLabel = (a: ShareAnswer): string => bt(a === "0" ? "gShare0" : a === "1/4" ? "gShare14" : a === "1/2" ? "gShare12" : "gShare34");
const nextLabel = (a: NextAnswer): string => bt(a === "more" ? "gNextMore" : a === "same" ? "gNextSame" : "gNextLess");
const crossText = (i: number): string => `${CROSSES[i]![0]} × ${CROSSES[i]![1]}`;
const phenoName = (p: string): string => bt(`pheno_${p}` as never);
const totalOf = (counts: Record<string, number> | undefined): number => Object.values(counts ?? {}).reduce((a, b) => a + b, 0);

export function geneticsView(ctx: { user: User }): HTMLElement {
  if (!lab || lab.userId !== ctx.user.id) lab = startLab(ctx.user.id);
  return mountLab("is-genetics", (draw) => {
    const state = lab!;
    const head = el("div", "discover-head");
    head.append(el("h1", "title", bt("geneticsTitle")), el("p", "discover-seed", bt("gExperiment", { seed: state.seed })));
    return state.step === "predict" ? [head, predictPanel(state, draw)] : [head, ...labPanels(state, draw)];
  });
}

// ---------------------------------------------------------------- 1. predict

function predictPanel(state: Lab, draw: () => void): HTMLElement {
  const box = step(pt("stepPredict"));
  box.append(el("p", "discover-intro", bt("gIntro")));
  box.append(
    choiceSet<ShareAnswer>({
      cls: "discover-choices",
      legend: bt("gPredictShare"),
      options: (["0", "1/4", "1/2", "3/4"] as const).map((v) => ({ value: v, label: shareLabel(v) })),
      chosen: state.share,
      key: "share",
      onPick: (v) => ((state.share = v), draw()),
    }),
    choiceSet<NextAnswer>({
      cls: "discover-choices",
      legend: bt("gPredictNext"),
      options: (["more", "same", "less"] as const).map((v) => ({ value: v, label: nextLabel(v) })),
      chosen: state.next,
      key: "next",
      onPick: (v) => ((state.next = v), draw()),
    }),
  );
  box.append(
    ...gatedButton(bt("gPredictDone"), "predict-done", state.share !== null && state.next !== null, bt("gPredictNeeded"), () => {
      state.step = "lab";
      draw();
    }),
  );
  return box;
}

// ---------------------------------------------------------------- 2. try

function square(i: number): HTMLElement {
  const [m, f] = CROSSES[i]!;
  const { rows, cols, cells } = punnett(m, f);
  const box = panel(bt("gSquareTitle"));
  const wrap = table("bio-punnett", ["", ...cols], cells.map((row, r) => [rows[r]!, ...row]));
  wrap.querySelector("table")!.setAttribute("aria-label", bt("gSquareAria", { rows: rows.length, cols: cols.length }));
  box.append(wrap);
  return box;
}

function countsTable(i: number, counts: Record<string, number> | undefined): HTMLElement {
  const [m, f] = CROSSES[i]!;
  const total = totalOf(counts);
  const box = panel(bt("gCountsTitle", { total }));
  if (total === 0) {
    box.append(el("p", "empty small", bt("gNone")));
    return box;
  }
  const rows = phenotypeShares(m, f).map((s) => {
    const n = counts?.[s.phenotype] ?? 0;
    return [phenoName(s.phenotype), String(n), pct(n / total), pct(s.share)];
  });
  box.append(table("bio-counts", [bt("gColPhenotype"), bt("gColCount"), bt("gColShare"), bt("gColExpected")], rows));
  return box;
}

function labPanels(state: Lab, draw: () => void): HTMLElement[] {
  const panels: HTMLElement[] = [];
  panels.push(mineLine([bt("gMineShare", { answer: shareLabel(state.share!) }), bt("gMineNext", { answer: nextLabel(state.next!) })]));

  const box = step(bt("gStep"));
  box.append(
    choiceSet<number>({
      cls: "discover-choices bio-crosses",
      legend: bt("gCross"),
      options: CROSSES.map((_, i) => ({ value: i, label: crossText(i) })),
      chosen: state.cross,
      key: "cross",
      onPick: (i) => ((state.cross = i), draw()),
    }),
    square(state.cross),
  );
  const batches = batchButtons(
    (n) => (n === 1 ? bt("gBreedOne") : bt("gBreed", { n })),
    (n) => {
      const [m, f] = CROSSES[state.cross]!;
      const counts = { ...(state.bred[state.cross] ?? {}) };
      const before = totalOf(counts);
      // The same experiment number gives the same peas: each cross continues its own sequence.
      for (const [p, k] of breed(state.seed * 10 + state.cross, m, f, n, before)) counts[p] = (counts[p] ?? 0) + k;
      state.bred = { ...state.bred, [state.cross]: counts };
      draw();
    },
  );
  box.append(batches, countsTable(state.cross, state.bred[state.cross]));
  panels.push(box);

  const enough = Object.values(state.bred).some((c) => totalOf(c) >= REVEAL_AFTER);
  if (!state.revealed) {
    const reveal = el("div", "discover-reveal");
    reveal.append(
      ...gatedButton(pt("reveal"), "reveal", enough, bt("gRevealHint"), () => {
        state.revealed = true;
        draw();
        document.querySelector(".discover-compare")?.scrollIntoView({ behavior: reducedMotion() ? "auto" : "smooth", block: "start" });
      }),
    );
    panels.push(reveal);
  } else {
    panels.push(
      comparePanel(state),
      explainPanel(pt("stepExplain"), [bt("gExplainAlleles"), bt("gExplainSquare"), bt("gExplainTwo"), bt("gExplainChance")]),
      checkPanel<CheckAnswer>({
        title: pt("stepCheck"),
        question: bt("gCheckQuestion"),
        options: [
          { value: "quarter", label: bt("gCheckQuarter") },
          { value: "half", label: bt("gCheckHalf") },
          { value: "all", label: bt("gCheckAll") },
        ],
        right: "half",
        chosen: state.check,
        onChoose: (v) => ((state.check = v), draw()),
        rightText: bt("gCheckRight"),
        wrongText: bt("gCheckWrong"),
      }),
    );
  }
  panels.push(
    restartPanel(state.check !== null, () => {
      lab = startLab(state.userId);
      draw();
    }),
  );
  return panels;
}

// ---------------------------------------------------------------- 3. compare

/** The chi-square of a cross's offspring against its ratios, with its p-value. */
export function chiOf(i: number, counts: Record<string, number>): { chi: number; p: number } | null {
  const [m, f] = CROSSES[i]!;
  const shares = phenotypeShares(m, f);
  const total = totalOf(counts);
  if (shares.length < 2 || total < 20) return null;
  const chi = chiSquare(
    shares.map((s) => counts[s.phenotype] ?? 0),
    shares.map((s) => s.share * total),
  );
  return { chi, p: pValue(chi, shares.length - 1) };
}

function comparePanel(state: Lab): HTMLElement {
  const box = step(pt("stepCompare"), "discover-compare");
  box.append(el("h3", "discover-panel-title", pt("formulaTitle")), el("p", "discover-intro", bt("gTheoryText")));
  box.append(el("p", "discover-intro", bt("gChiText")), formula(`\\chi^2 = \\sum \\frac{(O - E)^2}{E}`));
  for (const [key, counts] of Object.entries(state.bred)) {
    const i = Number(key);
    const result = chiOf(i, counts);
    if (!result) continue;
    box.append(
      verdict(
        bt("gChi", { cross: crossText(i), chi: num(result.chi, 2), p: num(result.p, 2), verdict: bt(result.p < 0.05 ? "gChiOdd" : "gChiFine") }),
      ),
    );
  }
  box.append(el("h3", "discover-panel-title", pt("youTitle")));
  box.append(
    verdict(state.share === "1/4" ? bt("gShareRight") : bt("gShareWrong", { answer: shareLabel(state.share!) }), state.share === "1/4"),
    verdict(state.next === "same" ? bt("gNextRight") : bt("gNextWrong", { answer: nextLabel(state.next!) }), state.next === "same"),
  );
  return box;
}
