/**
 * Building molecules, in five steps.
 *
 *   1. Predict   the shape of water; of carbon dioxide
 *   2. Try       pick a molecule, set each bond single, double or triple until every valence holds; its shape
 *   3. Compare   electron groups and lone pairs (VSEPR); the molecules built; the predictions
 *   4. Explain   valence; multiple bonds; shapes; lone pairs
 *   5. Check     why water is bent and CO₂ straight
 *
 * The rules are in shared/discover/molecules.ts; `npm run check:biology`
 * checks that each skeleton has exactly one valid set of bonds.
 */
import { MOLECULES, VALENCE, bondsOf, molecule, satisfied, shapeAt, type Molecule } from "../../shared/discover/molecules";
import { el } from "../dom";
import type { User } from "../store";
import { checkPanel, choiceSet, control, explainPanel, mountLab, panel, reducedMotion, step } from "./lab";
import { bt } from "./bio-i18n";
import { andList, num, pt } from "./physics-i18n";
import { drawing, gatedButton, mineLine, physicsHead, restartPanel, shape, table, verdict } from "./physics-ui";

export const REVEAL_AFTER = 3;

type WaterAnswer = "straight" | "bent" | "flat";
type Co2Answer = "straight" | "bent";
type CheckAnswer = "pairs" | "light" | "stiff";

interface Lab {
  userId: number;
  step: "predict" | "lab";
  water: WaterAnswer | null;
  co2: Co2Answer | null;
  current: string;
  orders: Record<string, number[]>;
  solved: string[];
  revealed: boolean;
  check: CheckAnswer | null;
}

let lab: Lab | null = null;

const startLab = (userId: number): Lab => ({
  userId,
  step: "predict",
  water: null,
  co2: null,
  current: "water",
  orders: Object.fromEntries(MOLECULES.map((m) => [m.id, m.links.map(() => 1)])),
  solved: [],
  revealed: false,
  check: null,
});

export const moleculesBusy = (): boolean => lab !== null && lab.solved.length > 0 && lab.check === null;

const waterLabel = (a: WaterAnswer): string => bt(a === "straight" ? "mWaterStraight" : a === "bent" ? "mWaterBent" : "mWaterFlat");
const co2Label = (a: Co2Answer): string => bt(a === "straight" ? "mCo2Straight" : "mCo2Bent");
const bondName = (order: number): string => bt(order === 1 ? "bond1" : order === 2 ? "bond2" : "bond3");
/** A formula with subscripts: H₂O. */
export const formulaText = (f: string): string => f.replace(/\d/g, (d) => "₀₁₂₃₄₅₆₇₈₉"[Number(d)]!);
const moleculeName = (m: Molecule): string => `${formulaText(m.formula)} (${bt(`mol_${m.id}` as never)})`;
const angleText = (a: number): string => `${num(a, a % 1 === 0 ? 0 : 1)}°`;

export function moleculesView(ctx: { user: User }): HTMLElement {
  if (!lab || lab.userId !== ctx.user.id) lab = startLab(ctx.user.id);
  return mountLab("is-molecules", (draw) => {
    const state = lab!;
    const head = physicsHead(bt("moleculesTitle"));
    return state.step === "predict" ? [head, predictPanel(state, draw)] : [head, ...labPanels(state, draw)];
  });
}

// ---------------------------------------------------------------- 1. predict

function predictPanel(state: Lab, draw: () => void): HTMLElement {
  const box = step(pt("stepPredict"));
  box.append(el("p", "discover-intro", bt("mIntro")));
  box.append(
    choiceSet<WaterAnswer>({
      cls: "discover-choices",
      legend: bt("mPredictWater"),
      options: (["straight", "bent", "flat"] as const).map((v) => ({ value: v, label: waterLabel(v) })),
      chosen: state.water,
      key: "water",
      onPick: (v) => ((state.water = v), draw()),
    }),
    choiceSet<Co2Answer>({
      cls: "discover-choices",
      legend: bt("mPredictCo2"),
      options: (["straight", "bent"] as const).map((v) => ({ value: v, label: co2Label(v) })),
      chosen: state.co2,
      key: "co2",
      onPick: (v) => ((state.co2 = v), draw()),
    }),
  );
  box.append(
    ...gatedButton(bt("mPredictDone"), "predict-done", state.water !== null && state.co2 !== null, bt("mPredictNeeded"), () => {
      state.step = "lab";
      draw();
    }),
  );
  return box;
}

// ---------------------------------------------------------------- 2. try

const SIZE = 260;
const scale = (v: number): number => (v / 100) * SIZE;

function moleculeDrawing(m: Molecule, orders: number[]): SVGSVGElement {
  const made = bondsOf(m, orders);
  const list = m.links.map(([a, b], i) => `${m.atoms[a]}–${m.atoms[b]} ${bondName(orders[i]!)}`);
  const svg = drawing("bio-molecule", SIZE, SIZE, bt("mDrawingAria", { formula: formulaText(m.formula), list: list.join(", ") }));
  m.links.forEach(([a, b], i) => {
    const [x1, y1] = m.at[a]!.map(scale) as [number, number];
    const [x2, y2] = m.at[b]!.map(scale) as [number, number];
    const len = Math.hypot(x2 - x1, y2 - y1);
    const nx = -(y2 - y1) / len;
    const ny = (x2 - x1) / len;
    const k = orders[i]!;
    for (let j = 0; j < k; j++) {
      const off = (j - (k - 1) / 2) * 6;
      shape(svg, "line", { x1: x1 + nx * off, y1: y1 + ny * off, x2: x2 + nx * off, y2: y2 + ny * off, class: "bio-bond" });
    }
  });
  m.atoms.forEach((atom, i) => {
    const [x, y] = m.at[i]!.map(scale) as [number, number];
    const ok = made[i] === VALENCE[atom];
    shape(svg, "circle", { cx: x, cy: y, r: atom === "H" ? 15 : 20, class: `bio-atom is-${atom.toLowerCase()}${ok ? " is-ok" : " is-off"}` });
    shape(svg, "text", { x, y: y + 6, class: "bio-atom-label", "text-anchor": "middle" }, atom);
  });
  return svg;
}

function labPanels(state: Lab, draw: () => void): HTMLElement[] {
  const panels: HTMLElement[] = [];
  panels.push(mineLine([bt("mMineWater", { answer: waterLabel(state.water!) }), bt("mMineCo2", { answer: co2Label(state.co2!) })]));

  const m = molecule(state.current);
  const orders = state.orders[m.id]!;
  // A molecule counts as built once it is seen with every valence satisfied.
  if (satisfied(m, orders) && !state.solved.includes(m.id)) state.solved = [...state.solved, m.id];
  const box = step(bt("mStep"));
  box.append(
    choiceSet<string>({
      cls: "discover-choices bio-picker",
      legend: bt("mPick"),
      options: MOLECULES.map((x) => ({ value: x.id, label: formulaText(x.formula), aria: moleculeName(x), cls: state.solved.includes(x.id) ? "is-done" : "" })),
      chosen: state.current,
      key: "molecule",
      onPick: (id) => ((state.current = id), draw()),
    }),
  );
  const figure = el("figure", "bio-figure");
  figure.append(el("figcaption", "discover-panel-title", moleculeName(m)), moleculeDrawing(m, orders));
  box.append(figure, el("p", "hint", bt("mHint")));
  const bonds = el("div", "bio-bonds");
  m.links.forEach(([a, b], i) => {
    bonds.append(
      control("segment bio-bond-button", bt("mBondButton", { a: m.atoms[a]!, b: m.atoms[b]!, order: bondName(orders[i]!) }), `bond-${i}`, () => {
        orders[i] = (orders[i]! % 3) + 1;
        draw();
      }),
    );
  });
  box.append(bonds);
  const made = bondsOf(m, orders);
  const atoms = el("ul", "bio-atoms");
  m.atoms.forEach((atom, i) => {
    const ok = made[i] === VALENCE[atom];
    atoms.append(el("li", ok ? "good" : "bad", bt(ok ? "mAtomOk" : "mAtomOff", { atom, made: made[i]!, valence: VALENCE[atom] })));
  });
  box.append(atoms);
  const status = el("div", "discover-status bio-status");
  status.setAttribute("role", "status");
  if (satisfied(m, orders)) {
    status.append(el("p", "good", bt("mValid")));
    if (m.centres.length === 0) status.append(el("p", "", bt("mShapeNone")));
    for (const c of m.centres) {
      const s = shapeAt(m, orders, c);
      status.append(el("p", "", bt("mShape", { atom: m.atoms[c]!, bonded: s.bonded, pairs: s.lonePairs, shape: bt(`shape_${s.name}`), angle: angleText(s.angle) })));
    }
  } else status.append(el("p", "", bt("mInvalid")));
  box.append(status);
  if (state.solved.length > 0) box.append(el("p", "hint", bt("mSolved", { list: andList(state.solved.map((id) => formulaText(molecule(id).formula))) })));
  panels.push(box);

  if (!state.revealed) {
    const reveal = el("div", "discover-reveal");
    reveal.append(
      ...gatedButton(pt("reveal"), "reveal", state.solved.length >= REVEAL_AFTER, bt("mRevealHint"), () => {
        state.revealed = true;
        draw();
        document.querySelector(".discover-compare")?.scrollIntoView({ behavior: reducedMotion() ? "auto" : "smooth", block: "start" });
      }),
    );
    panels.push(reveal);
  } else {
    panels.push(
      comparePanel(state),
      explainPanel(pt("stepExplain"), [bt("mExplainValence"), bt("mExplainMultiple"), bt("mExplainShape"), bt("mExplainPairs")]),
      checkPanel<CheckAnswer>({
        title: pt("stepCheck"),
        question: bt("mCheckQuestion"),
        options: [
          { value: "pairs", label: bt("mCheckPairs") },
          { value: "light", label: bt("mCheckLight") },
          { value: "stiff", label: bt("mCheckStiff") },
        ],
        right: "pairs",
        chosen: state.check,
        onChoose: (v) => ((state.check = v), draw()),
        rightText: bt("mCheckRight"),
        wrongText: bt("mCheckWrong"),
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

function comparePanel(state: Lab): HTMLElement {
  const box = step(pt("stepCompare"), "discover-compare");
  box.append(el("h3", "discover-panel-title", pt("formulaTitle")), el("p", "discover-intro", bt("mTheoryText")), el("p", "discover-formula bio-rule", bt("mTheoryGroups")));
  const built = panel(bt("mTableTitle"));
  const rows = state.solved.map((id) => {
    const m = molecule(id);
    const orders = state.orders[id]!;
    const centre = m.centres[0];
    const s = centre === undefined ? null : shapeAt(m, orders, centre);
    return [
      formulaText(m.formula),
      m.links.map(([a, b], i) => `${m.atoms[a]}${["–", "=", "≡"][orders[i]! - 1]}${m.atoms[b]}`).filter((v, i, all) => all.indexOf(v) === i).join(" "),
      s ? String(s.lonePairs) : "—",
      s ? bt(`shape_${s.name}`) : bt("shape_linear"),
      s ? angleText(s.angle) : "180°",
    ];
  });
  built.append(table("bio-built", [bt("mColMolecule"), bt("mColBonds"), bt("mColPairs"), bt("mColShape"), bt("mColAngle")], rows));
  box.append(built);
  box.append(el("h3", "discover-panel-title", pt("youTitle")));
  box.append(
    verdict(state.water === "bent" ? bt("mWaterRight") : bt("mWaterWrong", { answer: waterLabel(state.water!) }), state.water === "bent"),
    verdict(state.co2 === "straight" ? bt("mCo2Right") : bt("mCo2Wrong", { answer: co2Label(state.co2!) }), state.co2 === "straight"),
  );
  return box;
}
