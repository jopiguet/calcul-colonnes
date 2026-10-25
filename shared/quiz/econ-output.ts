/**
 * Economics, generated: questions on diagrams and small models of public and
 * labour economics, each drawn as an economic chart (`Chart` in types.ts).
 * Tax incidence and deadweight loss, the lettered areas of a tax diagram, the
 * Pigouvian tax, the Samuelson rule, Lorenz curves and the Gini coefficient,
 * a benefit's withdrawal, a tax schedule, the median voter, social welfare
 * functions, Ramsey and Saez rules, monopsony and the minimum wage, and the
 * price of insurance. Each wrong option is what a misconception predicts.
 *
 * The model of each question (`econ-model.ts`) goes with it; `check:quiz`
 * computes the answer again with an evaluator of its own.
 */
import type { Rng } from "./rng";
import type { Chart, Draft, Generator, Localized, MistakeKey, Option } from "./types";
import type { L3 } from "./linux/types";
import type { EconModel } from "./econ-model";

const L = (t: L3): Localized => ({ en: t[0], fr: t[1], es: t[2] });
const same = (s: string): Localized => ({ en: s, fr: s, es: s });

/** A number with at most `digits` decimals, trailing zeros dropped; French and Spanish with a comma. */
export function show(x: number, digits: number, lang: "en" | "fr" | "es" = "en"): string {
  const fixed = Number(x.toFixed(digits)).toString();
  const grouped = Math.abs(x) >= 10000 ? fixed.replace(/\B(?=(\d{3})+(?!\d))/g, lang === "en" ? "," : " ") : fixed;
  return lang === "en" ? grouped : grouped.replace(".", ",");
}

/** A numeric option: its formula is the number with fixed decimals; its text, localized, with a unit. */
function numOpt(x: number, digits: number, unit: "" | "%" = "", mistake?: MistakeKey): Option {
  const text: Localized = {
    en: `${show(x, digits, "en")}${unit}`,
    fr: `${show(x, digits, "fr")}${unit ? ` ${unit}` : ""}`,
    es: `${show(x, digits, "es")}${unit ? ` ${unit}` : ""}`,
  };
  return { tex: x.toFixed(digits), text, ...(mistake ? { mistake } : {}) };
}

const textOpt = (tex: string, text: Localized, mistake?: MistakeKey): Option => ({ tex, text, ...(mistake ? { mistake } : {}) });

function draft(id: string, question: L3, graph: Chart | undefined, model: EconModel, correct: Option, wrong: Option[], explanation: L3, code?: string): Draft {
  const seen = new Set([correct.tex]);
  return {
    prompt: { key: "concept", tex: "", id, text: L(question), ...(graph ? { graph } : {}), ...(code ? { code } : {}) },
    correct,
    wrong: wrong.filter((o) => Number.isFinite(Number(o.tex)) || !/NaN|Infinity/.test(o.tex)).filter((o) => !seen.has(o.tex) && seen.add(o.tex)),
    explanation: { key: "concept", tex: "", text: L(explanation) },
    verify: { kind: "econ", model },
  };
}

const line = (a: number, slope: number) => (q: number): number => a + slope * q;
const nice = (v: number): number => {
  const step = v > 40 ? 10 : v > 16 ? 5 : v > 8 ? 2 : 1;
  return Math.ceil(v / step) * step;
};

// ------------------------------------------------------------- the market

/** A linear market with a whole-number equilibrium and a tax that moves it by whole units. */
function market(rng: Rng): { a: number; b: number; c: number; d: number; t: number; q0: number; p0: number; k: number } {
  for (;;) {
    const b = rng.int(1, 4);
    const d = rng.int(1, 4);
    const q0 = rng.int(4, 8);
    // Supply starts low and the tax moves the quantity by a quarter to a half: the areas stay readable.
    const c = rng.int(2, 8);
    const p0 = c + d * q0;
    const k = rng.int(Math.ceil(q0 / 4), Math.floor(q0 / 2));
    const a = p0 + b * q0;
    const t = k * (b + d);
    if (a > 60 || Math.abs(b - d) > 2) continue;
    return { a, b, c, d, t, q0, p0, k };
  }
}

function marketChart(m: ReturnType<typeof market>, on: "sellers" | "buyers", ticks: boolean): Chart {
  const { a, b, c, d, t, q0, p0, k } = m;
  const qt = q0 - k;
  const pb = p0 + b * k;
  const ps = p0 - d * k;
  const xMax = nice(Math.max(Math.min(a / b, 2 * q0), q0 + 3));
  return {
    type: "chart",
    x: [0, xMax],
    y: [0, nice(a * 1.05)],
    xLabel: "Q",
    yLabel: "P",
    ...(ticks ? { xTicks: [qt, q0], yTicks: [ps, p0, pb] } : {}),
    curves: [
      { fn: line(a, -b), label: "D", style: "main" },
      { fn: line(c, d), label: "S", style: "alt" },
      on === "sellers" ? { fn: line(c + t, d), label: "S + t", style: "guide" } : { fn: line(a - t, -b), label: "D − t", style: "guide" },
    ],
  };
}

/** Who bears a per-unit tax: the buyers' share is the demand slope over the sum of slopes. */
export const taxIncidence: Generator = (rng: Rng) => {
  const m = market(rng);
  const { a, b, c, d, t, k, p0 } = m;
  const on = rng.pick(["sellers", "buyers"] as const);
  const ask = rng.int(0, 2) === 0 ? "dwl" : "buyerShare";
  const graph = marketChart(m, on, true);
  const model: EconModel = { type: "incidence", a, b, c, d, t, on, ask };
  const pb = p0 + b * k;
  const qt = m.q0 - k;
  const who: L3 = on === "sellers" ? ["sellers", "vendeurs", "vendedores"] : ["buyers", "acheteurs", "compradores"];
  if (ask === "buyerShare") {
    const share = (100 * b) / (b + d);
    return draft(
      `inc ${a} ${b} ${c} ${d} ${t} ${on}`,
      [
        `A tax of ${t} per unit is levied on the ${who[0]}. What share of the tax do buyers bear?`,
        `Une taxe de ${t} par unité est prélevée sur les ${who[1]}. Quelle part de la taxe les acheteurs supportent-ils ?`,
        `Se cobra a los ${who[2]} un impuesto de ${t} por unidad. ¿Qué parte del impuesto soportan los compradores?`,
      ],
      graph,
      model,
      numOpt(share, 1, "%"),
      [
        numOpt(100 - share, 1, "%", "econIncidenceInverted"),
        numOpt(on === "sellers" ? 0 : 100, 1, "%", "econStatutoryIncidence"),
        numOpt(50, 1, "%", "econEqualSplit"),
        numOpt(on === "sellers" ? 100 : 0, 1, "%", "econStatutoryIncidence"),
      ],
      [
        `Whoever pays the tax to the state, the market settles at the quantity where buyers' price minus sellers' price equals the tax: ${qt} here. Buyers pay ${pb} instead of ${p0}, so they bear ${pb - p0} of the ${t}. With linear curves their share is the demand slope over the sum of slopes, ${b}/(${b} + ${d}): the less elastic side bears more. Statutory incidence does not matter.`,
        `Quel que soit celui qui verse la taxe à l'État, le marché s'établit à la quantité où le prix payé par les acheteurs moins le prix reçu par les vendeurs égale la taxe : ici ${qt}. Les acheteurs paient ${pb} au lieu de ${p0} : ils supportent ${pb - p0} des ${t}. Avec des droites, leur part est la pente de la demande sur la somme des pentes, ${b}/(${b} + ${d}) : le côté le moins élastique supporte davantage. L'incidence légale ne compte pas.`,
        `Pague quien pague el impuesto al Estado, el mercado se sitúa en la cantidad en que el precio de los compradores menos el de los vendedores iguala el impuesto: aquí ${qt}. Los compradores pagan ${pb} en lugar de ${p0}, así que soportan ${pb - p0} de los ${t}. Con rectas, su parte es la pendiente de la demanda sobre la suma de pendientes, ${b}/(${b} + ${d}): el lado menos elástico soporta más. La incidencia legal no cuenta.`,
      ],
    );
  }
  const dwl = (t * k) / 2;
  return draft(
    `dwl ${a} ${b} ${c} ${d} ${t} ${on}`,
    [
      `A tax of ${t} per unit is levied on the ${who[0]}. What is the deadweight loss?`,
      `Une taxe de ${t} par unité est prélevée sur les ${who[1]}. Quelle est la perte sèche ?`,
      `Se cobra a los ${who[2]} un impuesto de ${t} por unidad. ¿Cuál es la pérdida irrecuperable de eficiencia?`,
    ],
    graph,
    model,
    numOpt(dwl, 2),
    [numOpt(t * k, 2, "", "econDwlRectangle"), numOpt(t * qt, 2, "", "econDwlRevenue"), numOpt((t * qt) / 2, 2, "", "econDwlRevenue"), numOpt(t * m.q0, 2, "", "econDwlRevenue")],
    [
      `The tax cuts the quantity from ${m.q0} to ${qt}. The units no longer traded were worth more to buyers than they cost sellers: the loss is the triangle between demand and supply over those ${k} units, ½ × ${t} × ${k} = ${show(dwl, 2)}. The rectangle ${t} × ${qt} is the revenue, a transfer, not a loss. The loss grows with the square of the tax.`,
      `La taxe fait passer la quantité de ${m.q0} à ${qt}. Les unités qui ne s'échangent plus valaient plus pour les acheteurs qu'elles ne coûtaient aux vendeurs : la perte est le triangle entre demande et offre sur ces ${k} unités, ½ × ${t} × ${k} = ${show(dwl, 2, "fr")}. Le rectangle ${t} × ${qt} est la recette, un transfert, pas une perte. La perte croît comme le carré de la taxe.`,
      `El impuesto reduce la cantidad de ${m.q0} a ${qt}. Las unidades que ya no se intercambian valían más para los compradores de lo que costaban a los vendedores: la pérdida es el triángulo entre demanda y oferta sobre esas ${k} unidades, ½ × ${t} × ${k} = ${show(dwl, 2, "es")}. El rectángulo ${t} × ${qt} es la recaudación, una transferencia, no una pérdida. La pérdida crece con el cuadrado del impuesto.`,
    ],
  );
};

/** The lettered areas of a tax diagram: which make the deadweight loss, the revenue, each side's loss. */
export const surplusAreas: Generator = (rng: Rng) => {
  const m = market(rng);
  const { a, b, c, d, t, q0, p0, k } = m;
  const qt = q0 - k;
  const pb = p0 + b * k;
  const ps = p0 - d * k;
  const polygons: { label: string; points: [number, number][] }[] = [
    { label: "A", points: [[0, pb], [0, a], [qt, pb]] },
    { label: "B", points: [[0, p0], [0, pb], [qt, pb], [qt, p0]] },
    { label: "C", points: [[qt, pb], [qt, p0], [q0, p0]] },
    { label: "D", points: [[0, ps], [0, p0], [qt, p0], [qt, ps]] },
    { label: "E", points: [[qt, p0], [qt, ps], [q0, p0]] },
    { label: "F", points: [[0, c], [0, ps], [qt, ps]] },
  ];
  const ask = rng.pick(["dwl", "revenue", "consumerLoss", "producerLoss"] as const);
  const answers = { dwl: "C+E", revenue: "B+D", consumerLoss: "B+C", producerLoss: "D+E" };
  const graph: Chart = {
    type: "chart",
    x: [0, nice(Math.max(Math.min(a / b, 2 * q0), q0 + 3))],
    y: [0, nice(a * 1.05)],
    xLabel: "Q",
    yLabel: "P",
    xTicks: [qt, q0],
    curves: [
      { fn: line(a, -b), label: "D", style: "main" },
      { fn: line(c, d), label: "S", style: "alt" },
    ],
    areas: polygons.map((p) => ({ points: p.points, style: "plain" as const, label: p.label })),
    drops: [{ x: qt, y: pb }, { x: qt, y: ps }, { x: q0, y: p0 }],
  };
  const area = (pts: [number, number][]): number => Math.abs(pts.reduce((s, [x1, y1], i) => { const [x2, y2] = pts[(i + 1) % pts.length]!; return s + x1 * y2 - x2 * y1; }, 0)) / 2;
  const sizeOf = (letters: string): number => letters.split("+").reduce((s, l) => s + area(polygons.find((p) => p.label === l)!.points), 0);
  const target = sizeOf(answers[ask]);
  const option = (letters: string, mistake?: MistakeKey): Option => textOpt(letters, same(letters.replace(/\+/g, " + ")), mistake);
  const pool: Option[] = [
    option("B+D", "econAreaRevenue"),
    option("C+E", "econAreaDwl"),
    option("B+C", "econAreaSurplus"),
    option("D+E", "econAreaSurplus"),
    option(ask === "dwl" ? "C" : ask === "revenue" ? "B" : ask === "consumerLoss" ? "B" : "D", "econAreaPart"),
    option("A+B+C", "econAreaSurplus"),
  ].filter((o) => o.tex !== answers[ask] && Math.abs(sizeOf(o.tex) - target) > 1e-9);
  const asked: Record<typeof ask, L3> = {
    dwl: ["the deadweight loss", "la perte sèche", "la pérdida irrecuperable de eficiencia"],
    revenue: ["the tax revenue", "la recette fiscale", "la recaudación"],
    consumerLoss: ["the loss of consumer surplus", "la perte de surplus des consommateurs", "la pérdida de excedente del consumidor"],
    producerLoss: ["the loss of producer surplus", "la perte de surplus des producteurs", "la pérdida de excedente del productor"],
  };
  return draft(
    `areas ${a} ${b} ${c} ${d} ${t} ${ask}`,
    [
      `A per-unit tax drives a wedge between the price buyers pay and the price sellers receive. Which areas make up ${asked[ask][0]}?`,
      `Une taxe unitaire crée un écart entre le prix payé par les acheteurs et le prix reçu par les vendeurs. Quelles aires forment ${asked[ask][1]} ?`,
      `Un impuesto por unidad abre una brecha entre el precio que pagan los compradores y el que reciben los vendedores. ¿Qué áreas forman ${asked[ask][2]}?`,
    ],
    graph,
    { type: "areas", a, b, c, d, t, ask, polygons },
    option(answers[ask]),
    pool,
    [
      "Before the tax, consumer surplus is A + B + C and producer surplus D + E + F. With the tax, buyers keep A and sellers keep F; B + D goes to the state as revenue (the tax times the quantity still traded); C + E is lost to everyone, the deadweight loss of the units no longer traded. Consumers lose B + C, producers D + E.",
      "Avant la taxe, le surplus des consommateurs vaut A + B + C et celui des producteurs D + E + F. Avec la taxe, les acheteurs gardent A et les vendeurs F ; B + D va à l'État comme recette (la taxe fois la quantité encore échangée) ; C + E est perdu pour tous, la perte sèche des unités qui ne s'échangent plus. Les consommateurs perdent B + C, les producteurs D + E.",
      "Antes del impuesto, el excedente del consumidor es A + B + C y el del productor D + E + F. Con el impuesto, los compradores conservan A y los vendedores F; B + D va al Estado como recaudación (el impuesto por la cantidad que se sigue intercambiando); C + E se pierde para todos, la pérdida irrecuperable de las unidades que ya no se intercambian. Los consumidores pierden B + C, los productores D + E.",
    ],
  );
};

// ------------------------------------------------------- market failure

/** A rising marginal external cost: the Pigouvian tax is the external cost at the efficient quantity. */
export const pigou: Generator = (rng: Rng) => {
  for (;;) {
    const b = rng.int(1, 3);
    const d = rng.int(1, 3);
    const e = rng.int(1, 3);
    const qs = rng.int(2, 5);
    const c = rng.int(1, 6);
    const a = c + qs * (b + d + e);
    if (a > 60) continue;
    const qm = (a - c) / (b + d);
    const ask = rng.int(0, 1) === 0 ? "tax" : "quantity";
    const graph: Chart = {
      type: "chart",
      x: [0, nice((a / b) * 1.02)],
      y: [0, nice(a * 1.05)],
      xLabel: "Q",
      yLabel: "P",
      ...(ask === "tax" ? { xTicks: [qs] } : {}),
      yTicks: [c],
      curves: [
        { fn: line(a, -b), label: "MB", style: "main" },
        { fn: line(c, d), label: "MPC", style: "alt" },
        { fn: line(c, d + e), label: "MSC", style: "alt" },
        { fn: line(0, e), label: "MEC", style: "guide" },
      ],
    };
    const model: EconModel = { type: "pigou", a, b, c, d, e, ask };
    const shown = `MB = ${a} − ${b}Q, MPC = ${c} + ${d}Q, MEC = ${e}Q`;
    if (ask === "tax") {
      return draft(
        `pigou ${a} ${b} ${c} ${d} ${e} tax`,
        [
          `Production pollutes: ${shown}. Which per-unit tax brings the market to the efficient quantity?`,
          `La production pollue : ${shown}. Quelle taxe par unité amène le marché à la quantité efficace ?`,
          `La producción contamina: ${shown}. ¿Qué impuesto por unidad lleva el mercado a la cantidad eficiente?`,
        ],
        graph,
        model,
        numOpt(e * qs, 2),
        [numOpt(e * qm, 2, "", "econPigouAtMarket"), numOpt(c + (d + e) * qs, 2, "", "econPigouPrice"), numOpt(e * (qm - qs), 2, "", "econPigouAtMarket"), numOpt(d * qs, 2, "", "econMarginalCurves")],
        [
          `The efficient quantity sets marginal benefit equal to marginal social cost, MPC + MEC: ${a} − ${b}Q = ${c} + ${d + e}Q, so Q* = ${qs}. A tax equal to the marginal external cost at Q*, ${e} × ${qs} = ${e * qs}, makes producers face the social cost there. Taxing the external cost at the market quantity (${show(qm, 2)}) overshoots when the external cost rises with output.`,
          `La quantité efficace égalise bénéfice marginal et coût social marginal, MPC + MEC : ${a} − ${b}Q = ${c} + ${d + e}Q, d'où Q* = ${qs}. Une taxe égale au coût externe marginal en Q*, ${e} × ${qs} = ${e * qs}, fait supporter le coût social aux producteurs à ce point. Taxer le coût externe à la quantité du marché (${show(qm, 2, "fr")}) va trop loin quand le coût externe croît avec la production.`,
          `La cantidad eficiente iguala beneficio marginal y coste social marginal, MPC + MEC: ${a} − ${b}Q = ${c} + ${d + e}Q, así que Q* = ${qs}. Un impuesto igual al coste externo marginal en Q*, ${e} × ${qs} = ${e * qs}, hace que los productores afronten el coste social en ese punto. Gravar el coste externo en la cantidad de mercado (${show(qm, 2, "es")}) se pasa cuando el coste externo crece con la producción.`,
        ],
      );
    }
    const wrongA = a / (b + e);
    const wrongB = (a - c) / (b + e);
    return draft(
      `pigou ${a} ${b} ${c} ${d} ${e} q`,
      [
        `Production pollutes: ${shown}. What is the efficient quantity?`,
        `La production pollue : ${shown}. Quelle est la quantité efficace ?`,
        `La producción contamina: ${shown}. ¿Cuál es la cantidad eficiente?`,
      ],
      graph,
      model,
      numOpt(qs, 2),
      [numOpt(qm, 2, "", "econExternalityIgnored"), numOpt(wrongA, 2, "", "econMarginalCurves"), numOpt(wrongB, 2, "", "econMarginalCurves")],
      [
        `Efficiency needs marginal benefit = marginal social cost, MSC = MPC + MEC = ${c} + ${d + e}Q. ${a} − ${b}Q = ${c} + ${d + e}Q gives Q* = ${qs}. The market stops where MB = MPC, at ${show(qm, 2)}: too much, because producers ignore the external cost.`,
        `L'efficacité demande bénéfice marginal = coût social marginal, MSC = MPC + MEC = ${c} + ${d + e}Q. ${a} − ${b}Q = ${c} + ${d + e}Q donne Q* = ${qs}. Le marché s'arrête là où MB = MPC, à ${show(qm, 2, "fr")} : trop, car les producteurs ignorent le coût externe.`,
        `La eficiencia exige beneficio marginal = coste social marginal, MSC = MPC + MEC = ${c} + ${d + e}Q. ${a} − ${b}Q = ${c} + ${d + e}Q da Q* = ${qs}. El mercado se detiene donde MB = MPC, en ${show(qm, 2, "es")}: demasiado, porque los productores ignoran el coste externo.`,
      ],
    );
  }
};

/** A public good: marginal benefits add vertically (Samuelson); summing quantities is the private-good rule. */
export const samuelson: Generator = (rng: Rng) => {
  for (;;) {
    const gs = rng.int(3, 6);
    const b1 = rng.int(1, 2);
    const b2 = rng.int(1, 2);
    const m1 = rng.int(1, 6);
    const m2 = rng.int(1, 6);
    const a1 = m1 + b1 * gs;
    const a2 = m2 + b2 * gs;
    const mc = m1 + m2;
    const solo = Math.max(0, (a1 - mc) / b1, (a2 - mc) / b2);
    const horizontal = Math.max(0, (a1 - mc) / b1) + Math.max(0, (a2 - mc) / b2);
    const half = (a1 - mc / 2) / b1;
    const wrong = [numOpt(horizontal, 2, "", "econHorizontalSum"), numOpt(solo, 2, "", "econFreeRider"), ...(half > 0 ? [numOpt(half, 2, "", "econLindahlShare")] : []), numOpt(gs + (mc > a1 ? 1 : 2), 2, "", "econHorizontalSum")];
    if (new Set(wrong.map((o) => o.tex).filter((t) => t !== gs.toFixed(2))).size < 3) continue;
    const xMax = nice(Math.max(a1 / b1, a2 / b2) * 1.05);
    const graph: Chart = {
      type: "chart",
      x: [0, xMax],
      y: [0, nice(Math.max(a1, a2, mc) * 1.1)],
      xLabel: "G",
      yLabel: "€",
      yTicks: [mc],
      curves: [
        { points: [[0, a1], [a1 / b1, 0]], label: "MB₁", style: "main" },
        { points: [[0, a2], [a2 / b2, 0]], label: "MB₂", style: "alt" },
        { fn: () => mc, label: "MC", style: "guide" },
      ],
    };
    return draft(
      `sam ${a1} ${b1} ${a2} ${b2} ${mc}`,
      [
        `Two people share a public good G: MB₁ = ${a1} − ${b1}G, MB₂ = ${a2} − ${b2}G, and each unit costs ${mc}. What is the efficient quantity?`,
        `Deux personnes partagent un bien public G : MB₁ = ${a1} − ${b1}G, MB₂ = ${a2} − ${b2}G, et chaque unité coûte ${mc}. Quelle est la quantité efficace ?`,
        `Dos personas comparten un bien público G: MB₁ = ${a1} − ${b1}G, MB₂ = ${a2} − ${b2}G, y cada unidad cuesta ${mc}. ¿Cuál es la cantidad eficiente?`,
      ],
      graph,
      { type: "samuelson", people: [{ a: a1, b: b1 }, { a: a2, b: b2 }], mc },
      numOpt(gs, 2),
      wrong,
      [
        `Both enjoy every unit, so the benefit of one more unit is the sum of their marginal benefits: add the curves vertically. ${a1 + a2} − ${b1 + b2}G = ${mc} gives G = ${gs} (the Samuelson rule, ΣMB = MC). Adding quantities at a price, as for a private good, is wrong here; left to themselves, each would buy only up to where their own MB = MC, and the other would free-ride.`,
        `Les deux profitent de chaque unité : le bénéfice d'une unité de plus est la somme de leurs bénéfices marginaux, on additionne les courbes verticalement. ${a1 + a2} − ${b1 + b2}G = ${mc} donne G = ${gs} (la règle de Samuelson, ΣMB = MC). Additionner les quantités à un prix, comme pour un bien privé, est faux ici ; livrés à eux-mêmes, chacun n'achèterait que jusqu'à son propre MB = MC, et l'autre resterait passager clandestin.`,
        `Los dos disfrutan de cada unidad, así que el beneficio de una unidad más es la suma de sus beneficios marginales: se suman las curvas en vertical. ${a1 + a2} − ${b1 + b2}G = ${mc} da G = ${gs} (la regla de Samuelson, ΣMB = MC). Sumar cantidades a un precio, como en un bien privado, es un error aquí; por su cuenta, cada uno solo compraría hasta su propio MB = MC, y el otro viajaría gratis.`,
      ],
    );
  }
};

// --------------------------------------------------------- distribution

const cumulative = (shares: number[]): number[] => shares.reduce<number[]>((acc, s) => [...acc, (acc[acc.length - 1] ?? 0) + s], []);
/** Gini from quintile shares: one minus twice the area under the Lorenz curve (trapezoids). */
const giniOf = (shares: number[]): number => {
  const cum = [0, ...cumulative(shares)];
  let under = 0;
  for (let i = 1; i < cum.length; i++) under += (0.2 * (cum[i]! + cum[i - 1]!)) / 2;
  return 1 - 2 * under;
};

function quintiles(rng: Rng): number[] {
  for (;;) {
    const s1 = rng.int(3, 9);
    const s2 = rng.int(s1 + 2, s1 + 6);
    const s3 = rng.int(s2 + 2, s2 + 6);
    const s4 = rng.int(s3 + 3, s3 + 9);
    const s5 = 100 - s1 - s2 - s3 - s4;
    if (s5 <= s4 + 2 || s5 > 60) continue;
    return [s1, s2, s3, s4, s5].map((s) => s / 100);
  }
}

function lorenzChart(shares: number[], areas: boolean): Chart {
  const cum = [0, ...cumulative(shares)];
  const pts: [number, number][] = cum.map((c, i) => [i * 0.2, c]);
  return {
    type: "chart",
    x: [0, 1],
    y: [0, 1],
    xLabel: "p",
    yLabel: "L(p)",
    xTicks: [0.2, 0.4, 0.6, 0.8, 1],
    yTicks: [0.2, 0.4, 0.6, 0.8, 1],
    curves: [
      { points: [[0, 0], [1, 1]], style: "guide" },
      { points: pts, style: "main" },
    ],
    ...(areas
      ? {
          areas: [
            { points: pts, style: "revenue" as const, label: "A" },
            { points: [...pts, [1, 0]], style: "plain" as const, label: "B" },
          ],
        }
      : {}),
    points: pts.slice(1, -1).map(([x, y]) => ({ x, y })),
  };
}

/** The Gini coefficient of a Lorenz curve by quintiles; or which of four curves is the most equal. */
export const giniLorenz: Generator = (rng: Rng) => {
  if (rng.int(0, 2) > 0) {
    const shares = quintiles(rng);
    const g = giniOf(shares);
    const pct = shares.map((s) => Math.round(s * 100));
    return draft(
      `gini ${pct.join(" ")}`,
      [
        `The quintiles of the population, poorest first, receive ${pct.join(", ")} % of income. What is the Gini coefficient?`,
        `Les quintiles de la population, des plus pauvres aux plus riches, reçoivent ${pct.join(", ")} % du revenu. Quel est le coefficient de Gini ?`,
        `Los quintiles de la población, de los más pobres a los más ricos, reciben el ${pct.join(", ")} % de la renta. ¿Cuál es el coeficiente de Gini?`,
      ],
      lorenzChart(shares, true),
      { type: "gini", shares },
      numOpt(g, 3),
      [numOpt(g / 2, 3, "", "econGiniHalf"), numOpt(0.5 - g / 2, 3, "", "econGiniArea"), numOpt(shares[4]!, 3, "", "econGiniTopShare"), numOpt(1 - g, 3, "", "econGiniArea")],
      [
        `The Gini coefficient is the area A between the line of equality and the Lorenz curve, divided by the whole triangle under that line: G = A/(A + B) = 1 − 2B. The area B under the curve is a sum of trapezoids of width 0.2; here G = ${show(g, 3)}. 0 is perfect equality, 1 one person holding everything.`,
        `Le coefficient de Gini est l'aire A entre la droite d'égalité et la courbe de Lorenz, divisée par tout le triangle sous cette droite : G = A/(A + B) = 1 − 2B. L'aire B sous la courbe est une somme de trapèzes de largeur 0,2 ; ici G = ${show(g, 3, "fr")}. 0 est l'égalité parfaite, 1 une seule personne qui détient tout.`,
        `El coeficiente de Gini es el área A entre la recta de igualdad y la curva de Lorenz, dividida por todo el triángulo bajo esa recta: G = A/(A + B) = 1 − 2B. El área B bajo la curva es una suma de trapecios de anchura 0,2; aquí G = ${show(g, 3, "es")}. 0 es la igualdad perfecta, 1 que una sola persona lo tenga todo.`,
      ],
    );
  }
  // Four curves, each a mix of equality and the same unequal base: they never cross.
  const base = quintiles(rng);
  const lambdas = rng.shuffle([0.25, 0.5, 0.75, 1]);
  const sets = lambdas.map((l) => base.map((s) => (1 - l) * 0.2 + l * s));
  const best = lambdas.indexOf(0.25);
  const options = sets.map((set, i): Option => ({
    tex: `G = ${giniOf(set).toFixed(3)}`,
    text: { en: `G = ${show(giniOf(set), 3)}`, fr: `G = ${show(giniOf(set), 3, "fr")}`, es: `G = ${show(giniOf(set), 3, "es")}` },
    graph: lorenzChart(set, false),
    ...(i === best ? {} : { mistake: "econLorenzReading" as MistakeKey }),
  }));
  return draft(
    `lorenz ${base.join(" ")}`,
    [
      "Which Lorenz curve shows the most equal distribution of income?",
      "Quelle courbe de Lorenz montre la répartition du revenu la plus égale ?",
      "¿Qué curva de Lorenz muestra el reparto de la renta más igualitario?",
    ],
    undefined,
    { type: "lorenz", sets },
    options[best]!,
    options.filter((_, i) => i !== best),
    [
      "The closer the Lorenz curve to the diagonal, the more equal: at every share p of the population, the poorest p hold a larger share of income. When one curve lies above another everywhere (Lorenz dominance), every inequality measure that respects transfers from rich to poor agrees, the Gini coefficient included.",
      "Plus la courbe de Lorenz est proche de la diagonale, plus la répartition est égale : pour chaque part p de la population, les p plus pauvres détiennent une plus grande part du revenu. Quand une courbe est partout au-dessus d'une autre (dominance de Lorenz), toutes les mesures d'inégalité qui respectent les transferts des riches vers les pauvres s'accordent, coefficient de Gini compris.",
      "Cuanto más cerca esté la curva de Lorenz de la diagonal, más igualitario es el reparto: para cada parte p de la población, el p más pobre tiene una parte mayor de la renta. Cuando una curva está por encima de otra en todas partes (dominancia de Lorenz), todas las medidas de desigualdad que respetan las transferencias de ricos a pobres coinciden, incluido el coeficiente de Gini.",
    ],
  );
};

/** A benefit withdrawn as earnings rise: the effective marginal rate adds up; the benefit ends at B/(τw) hours. */
export const benefitTrap: Generator = (rng: Rng) => {
  for (;;) {
    const w = rng.pick([8, 10, 12, 15]);
    const t = rng.pick([0, 10, 20]);
    const tau = rng.pick([50, 60, 70, 80, 100]);
    const B = rng.int(5, 15) * 20;
    const h = B / ((tau / 100) * w);
    if (h < 6 || h > 44) continue;
    const ask = t > 0 && rng.int(0, 1) === 0 ? "emtr" : "breakEven";
    const net = (hours: number): number => (1 - t / 100) * w * hours + Math.max(0, B - (tau / 100) * w * hours);
    const graph: Chart = {
      type: "chart",
      x: [0, 50],
      y: [0, nice(net(50) * 1.08)],
      xLabel: "h",
      yLabel: "C",
      xTicks: [10, 20, 30, 40, 50],
      yTicks: [B],
      curves: [
        { fn: (x) => (1 - t / 100) * w * x, label: "", style: "guide" },
        { fn: net, label: "C(h)", style: "main" },
      ],
    };
    const shown = `w = ${w}, t = ${t} %, B = ${B}, τ = ${tau} %`;
    const model: EconModel = { type: "benefit", w, t: t / 100, B, tau: tau / 100, ask };
    if (ask === "emtr") {
      return draft(
        `ben ${w} ${t} ${B} ${tau} emtr`,
        [
          `A worker earns ${w} an hour; earnings are taxed at ${t} %, and a benefit of ${B} is withdrawn at ${tau} % of gross earnings (${shown}). What is the effective marginal tax rate while the benefit is being withdrawn?`,
          `Un salarié gagne ${w} de l'heure ; ses revenus sont imposés à ${t} %, et une prestation de ${B} est retirée à raison de ${tau} % des revenus bruts (${shown}). Quel est le taux marginal effectif d'imposition pendant le retrait de la prestation ?`,
          `Un trabajador gana ${w} por hora; sus ingresos tributan al ${t} %, y una prestación de ${B} se retira al ${tau} % de los ingresos brutos (${shown}). ¿Cuál es el tipo marginal efectivo mientras se retira la prestación?`,
        ],
        graph,
        model,
        numOpt(t + tau, 1, "%"),
        [numOpt(tau, 1, "%", "econEmtrPartial"), numOpt(t, 1, "%", "econEmtrPartial"), numOpt(t + tau - (t * tau) / 100, 1, "%", "econEmtrMultiply"), numOpt((t * tau) / 100, 1, "%", "econEmtrMultiply")],
        [
          `Each extra unit earned pays ${t} % in tax and also loses ${tau} % in benefit, both on gross earnings, so the worker keeps ${100 - t - tau} %: an effective marginal rate of ${t + tau} %. The flat segment of the budget line is that range. Such stacked rates, at times above 100 %, are the poverty trap that integrating taxes and benefits seeks to avoid.`,
          `Chaque unité gagnée en plus paie ${t} % d'impôt et fait aussi perdre ${tau} % de prestation, tous deux sur le revenu brut : le salarié garde ${100 - t - tau} %, soit un taux marginal effectif de ${t + tau} %. Le segment aplati de la contrainte budgétaire est cette zone. Ces taux empilés, parfois au-delà de 100 %, sont la trappe à pauvreté qu'une intégration des impôts et des prestations cherche à éviter.`,
          `Cada unidad extra ganada paga un ${t} % de impuesto y además pierde un ${tau} % de prestación, ambos sobre el ingreso bruto, así que el trabajador conserva un ${100 - t - tau} %: un tipo marginal efectivo del ${t + tau} %. El tramo plano de la restricción presupuestaria es esa zona. Estos tipos acumulados, a veces por encima del 100 %, son la trampa de la pobreza que la integración de impuestos y prestaciones intenta evitar.`,
        ],
      );
    }
    return draft(
      `ben ${w} ${t} ${B} ${tau} h`,
      [
        `A worker earns ${w} an hour; a benefit of ${B} is withdrawn at ${tau} % of gross earnings (${shown}). After how many hours of work is the benefit gone?`,
        `Un salarié gagne ${w} de l'heure ; une prestation de ${B} est retirée à raison de ${tau} % des revenus bruts (${shown}). Au bout de combien d'heures de travail la prestation a-t-elle disparu ?`,
        `Un trabajador gana ${w} por hora; una prestación de ${B} se retira al ${tau} % de los ingresos brutos (${shown}). ¿Con cuántas horas de trabajo desaparece la prestación?`,
      ],
      graph,
      model,
      numOpt(h, 2),
      [numOpt(B / w, 2, "", "econBreakEven"), numOpt((B * (tau / 100)) / w, 2, "", "econBreakEven"), numOpt(tau < 100 ? B / ((1 - tau / 100) * w) : B / (2 * w), 2, "", "econBreakEven")],
      [
        `The benefit falls by ${tau} % of earnings, so it is gone once ${tau / 100} × ${w} × h = ${B}, that is h = ${B}/(${tau / 100} × ${w}) = ${show(h, 2)}. A gentler taper keeps the benefit over more hours: lower marginal rates for many, but more people in the withdrawal range.`,
        `La prestation baisse de ${tau} % des revenus : elle disparaît quand ${show(tau / 100, 2, "fr")} × ${w} × h = ${B}, soit h = ${B}/(${show(tau / 100, 2, "fr")} × ${w}) = ${show(h, 2, "fr")}. Un retrait plus doux garde la prestation sur plus d'heures : des taux marginaux plus bas pour beaucoup, mais plus de monde dans la zone de retrait.`,
        `La prestación baja un ${tau} % de los ingresos, así que desaparece cuando ${show(tau / 100, 2, "es")} × ${w} × h = ${B}, es decir h = ${B}/(${show(tau / 100, 2, "es")} × ${w}) = ${show(h, 2, "es")}. Una retirada más suave mantiene la prestación durante más horas: tipos marginales más bajos para muchos, pero más personas en la zona de retirada.`,
      ],
    );
  }
};

/** A bracket schedule: tax owed band by band, and the average rate below the top marginal rate. */
export const taxSchedule: Generator = (rng: Rng) => {
  const t1 = rng.pick([10000, 12000, 15000]);
  const t2 = rng.pick([40000, 50000, 60000]);
  const r1 = rng.pick([10, 20, 25]);
  const r2 = rng.pick([30, 40, 45]);
  const brackets = [
    { from: 0, rate: 0 },
    { from: t1, rate: r1 },
    { from: t2, rate: r2 },
  ];
  const income = rng.int((t2 + 5000) / 1000, 150) * 1000;
  const tax = (r1 / 100) * (t2 - t1) + (r2 / 100) * (income - t2);
  const ask = rng.int(0, 1) === 0 ? "tax" : "average";
  const g = (n: number): string => n.toLocaleString("en-US").replace(/,/g, " ");
  const code = [`${g(0).padStart(6)} – ${g(t1).padEnd(6)}  ${String(0).padStart(2)} %`, `${g(t1).padStart(6)} – ${g(t2).padEnd(6)}  ${String(r1).padStart(2)} %`, `${g(t2).padStart(6)} +         ${String(r2).padStart(2)} %`].join("\n");
  const model: EconModel = { type: "schedule", brackets, income, ask };
  const yText = { en: show(income, 0, "en"), fr: show(income, 0, "fr"), es: show(income, 0, "es") };
  if (ask === "tax") {
    return draft(
      `sched ${t1} ${t2} ${r1} ${r2} ${income} tax`,
      [
        `With these marginal rates by band, how much tax is owed on an income of ${yText.en}?`,
        `Avec ces taux marginaux par tranche, quel impôt est dû sur un revenu de ${yText.fr} ?`,
        `Con estos tipos marginales por tramo, ¿cuánto impuesto se debe por una renta de ${yText.es}?`,
      ],
      undefined,
      model,
      numOpt(tax, 0),
      [numOpt((r2 / 100) * income, 0, "", "econMarginalAverage"), numOpt((r2 / 100) * (income - t1), 0, "", "econBracketMisapplied"), numOpt(tax + (r1 / 100) * t1, 0, "", "econBracketMisapplied")],
      [
        `Each rate applies only to the part of income inside its band: 0 on the first ${g(t1)}, ${r1} % on the ${g(t2 - t1)} between ${g(t1)} and ${g(t2)}, and ${r2} % on the ${g(income - t2)} above. Total: ${g(tax)}. The top rate is the marginal rate, not the rate on all income.`,
        `Chaque taux ne s'applique qu'à la part du revenu située dans sa tranche : 0 sur les premiers ${g(t1)}, ${r1} % sur les ${g(t2 - t1)} entre ${g(t1)} et ${g(t2)}, et ${r2} % sur les ${g(income - t2)} au-delà. Total : ${g(tax)}. Le taux le plus haut est le taux marginal, pas le taux sur tout le revenu.`,
        `Cada tipo se aplica solo a la parte de la renta dentro de su tramo: 0 sobre los primeros ${g(t1)}, el ${r1} % sobre los ${g(t2 - t1)} entre ${g(t1)} y ${g(t2)}, y el ${r2} % sobre los ${g(income - t2)} de más. Total: ${g(tax)}. El tipo más alto es el marginal, no el que se aplica a toda la renta.`,
      ],
      code,
    );
  }
  const avg = (100 * tax) / income;
  return draft(
    `sched ${t1} ${t2} ${r1} ${r2} ${income} avg`,
    [
      `With these marginal rates by band, what is the average tax rate on an income of ${yText.en}?`,
      `Avec ces taux marginaux par tranche, quel est le taux moyen d'imposition d'un revenu de ${yText.fr} ?`,
      `Con estos tipos marginales por tramo, ¿cuál es el tipo medio de una renta de ${yText.es}?`,
    ],
    undefined,
    model,
    numOpt(avg, 1, "%"),
    [numOpt(r2, 1, "%", "econMarginalAverage"), numOpt((100 * tax) / (income - t1), 1, "%", "econAverageBase"), numOpt((r1 + r2) / 2, 1, "%", "econMarginalAverage")],
    [
      `Tax owed: ${r1} % × ${g(t2 - t1)} + ${r2} % × ${g(income - t2)} = ${g(tax)}; divided by the whole income, ${g(income)}, that is ${show(avg, 1)} %. With a tax-free band and rising rates, the average rate stays below the marginal rate and approaches it as income grows: the schedule is progressive.`,
      `Impôt dû : ${r1} % × ${g(t2 - t1)} + ${r2} % × ${g(income - t2)} = ${g(tax)} ; divisé par tout le revenu, ${g(income)}, cela fait ${show(avg, 1, "fr")} %. Avec une tranche exonérée et des taux croissants, le taux moyen reste sous le taux marginal et s'en approche quand le revenu augmente : le barème est progressif.`,
      `Impuesto debido: ${r1} % × ${g(t2 - t1)} + ${r2} % × ${g(income - t2)} = ${g(tax)}; dividido por toda la renta, ${g(income)}, da un ${show(avg, 1, "es")} %. Con un tramo exento y tipos crecientes, el tipo medio se queda por debajo del marginal y se acerca a él al crecer la renta: la tarifa es progresiva.`,
    ],
    code,
  );
};

// -------------------------------------------------------- public choice

/** Single-peaked preferences: majority rule picks the median voter's ideal point. */
export const medianVoter: Generator = (rng: Rng) => {
  for (;;) {
    const n = rng.pick([5, 5, 7]);
    const ideals = rng.shuffle(Array.from({ length: 9 }, (_, i) => 10 + i * 10)).slice(0, n).sort((x, y) => x - y);
    const median = ideals[(n - 1) / 2]!;
    const mean = ideals.reduce((s, x) => s + x, 0) / n;
    if (Math.abs(mean - median) < 3) continue;
    const graph: Chart = {
      type: "chart",
      x: [0, 100],
      y: [0, 10],
      xLabel: "G",
      yLabel: "U",
      xTicks: ideals,
      curves: ideals.map((g, i) => {
        const h = 9 - (i % 3) * 1.4;
        return { fn: (x: number) => h - Math.abs(x - g) * 0.12, style: i % 2 === 0 ? ("main" as const) : ("alt" as const) };
      }),
    };
    return draft(
      `median ${ideals.join(" ")}`,
      [
        `${n} voters have single-peaked preferences over spending G; each curve is one voter's utility. Which level wins against every other in pairwise majority votes?`,
        `${n} électeurs ont des préférences unimodales sur la dépense G ; chaque courbe est l'utilité d'un électeur. Quel niveau l'emporte contre tous les autres dans des votes à la majorité deux à deux ?`,
        `${n} votantes tienen preferencias unimodales sobre el gasto G; cada curva es la utilidad de un votante. ¿Qué nivel gana a todos los demás en votaciones por mayoría de dos en dos?`,
      ],
      graph,
      { type: "median", ideals },
      numOpt(median, 2),
      [numOpt(mean, 2, "", "econMedianMean"), numOpt(ideals[n - 1]!, 2, "", "econMedianExtreme"), numOpt(ideals[0]!, 2, "", "econMedianExtreme"), numOpt(ideals[(n - 1) / 2 + 1]!, 2, "", "econMedianExtreme")],
      [
        `With single-peaked preferences, the median voter's ideal point (${median}) beats any other proposal: moving away from it in either direction loses the median voter and everyone on the other side, a majority. The outcome ignores how strongly people feel, so it need not be the efficient level, nor the mean (${show(mean, 2)}).`,
        `Avec des préférences unimodales, le point idéal de l'électeur médian (${median}) bat toute autre proposition : s'en écarter dans un sens ou dans l'autre fait perdre l'électeur médian et tous ceux de l'autre côté, une majorité. Le résultat ignore l'intensité des préférences : il n'est ni forcément le niveau efficace, ni la moyenne (${show(mean, 2, "fr")}).`,
        `Con preferencias unimodales, el punto ideal del votante mediano (${median}) gana a cualquier otra propuesta: alejarse de él en un sentido u otro hace perder al votante mediano y a todos los del otro lado, una mayoría. El resultado ignora la intensidad de las preferencias, así que no tiene por qué ser el nivel eficiente ni la media (${show(mean, 2, "es")}).`,
      ],
    );
  }
};

// ---------------------------------------------------------------- welfare

const LETTERS = ["A", "B", "C", "D"];

/** Which allocation a utilitarian, Rawlsian or Nash social welfare function picks. */
export const swfChoice: Generator = (rng: Rng) => {
  for (;;) {
    const pts: [number, number][] = Array.from({ length: 4 }, () => [rng.int(1, 9), rng.int(1, 9)] as [number, number]);
    const score = { utilitarian: (p: [number, number]) => p[0] + p[1], rawls: (p: [number, number]) => Math.min(p[0], p[1]), nash: (p: [number, number]) => p[0] * p[1] };
    const pick = (f: (p: [number, number]) => number): number => {
      const values = pts.map(f);
      const best = Math.max(...values);
      return values.filter((v) => v === best).length === 1 ? values.indexOf(best) : -1;
    };
    const picks = { utilitarian: pick(score.utilitarian), rawls: pick(score.rawls), nash: pick(score.nash) };
    const criterion = rng.pick(["utilitarian", "rawls", "nash"] as const);
    const right = picks[criterion];
    if (right < 0) continue;
    const others = (Object.keys(picks) as (keyof typeof picks)[]).filter((k) => k !== criterion).map((k) => picks[k]);
    if (!others.some((i) => i >= 0 && i !== right)) continue;
    const dominated = (i: number): boolean => pts.some((q, j) => j !== i && q[0] >= pts[i]![0] && q[1] >= pts[i]![1] && (q[0] > pts[i]![0] || q[1] > pts[i]![1]));
    const options = pts.map((_, i): Option => textOpt(LETTERS[i]!, same(LETTERS[i]!), i === right ? undefined : others.includes(i) ? "econSwfConfused" : dominated(i) ? "econParetoDominated" : "econSwfConfused"));
    const graph: Chart = {
      type: "chart",
      x: [0, 10],
      y: [0, 10],
      xLabel: "u₁",
      yLabel: "u₂",
      xTicks: [2, 4, 6, 8],
      yTicks: [2, 4, 6, 8],
      curves: [{ points: [[0, 0], [10, 10]], style: "guide" }],
      points: pts.map(([x, y], i) => ({ x, y, label: LETTERS[i]! })),
    };
    const name: Record<typeof criterion, L3> = {
      utilitarian: ["utilitarian social welfare function (the sum of utilities)", "fonction de bien-être social utilitariste (la somme des utilités)", "función de bienestar social utilitarista (la suma de utilidades)"],
      rawls: ["Rawlsian social welfare function (the utility of the worst off)", "fonction de bien-être social rawlsienne (l'utilité du plus défavorisé)", "función de bienestar social rawlsiana (la utilidad del peor situado)"],
      nash: ["Nash social welfare function (the product of utilities)", "fonction de bien-être social de Nash (le produit des utilités)", "función de bienestar social de Nash (el producto de utilidades)"],
    };
    return draft(
      `swf ${pts.flat().join(" ")} ${criterion}`,
      [
        `Four allocations of utility between two people. Which one does a ${name[criterion][0]} choose?`,
        `Quatre répartitions de l'utilité entre deux personnes. Laquelle une ${name[criterion][1]} choisit-elle ?`,
        `Cuatro repartos de la utilidad entre dos personas. ¿Cuál elige una ${name[criterion][2]}?`,
      ],
      graph,
      { type: "swf", allocations: pts, criterion },
      options[right]!,
      options.filter((_, i) => i !== right),
      [
        `${pts.map(([x, y], i) => `${LETTERS[i]}: sum ${x + y}, min ${Math.min(x, y)}, product ${x * y}`).join("; ")}. The utilitarian sum ignores how utility is shared; the Rawlsian maximin cares only about the worse off; the Nash product lies between them. Each criterion respects the Pareto principle: a dominated allocation is never chosen.`,
        `${pts.map(([x, y], i) => `${LETTERS[i]} : somme ${x + y}, min ${Math.min(x, y)}, produit ${x * y}`).join(" ; ")}. La somme utilitariste ignore le partage de l'utilité ; le maximin rawlsien ne regarde que le plus défavorisé ; le produit de Nash se situe entre les deux. Chaque critère respecte le principe de Pareto : une répartition dominée n'est jamais choisie.`,
        `${pts.map(([x, y], i) => `${LETTERS[i]}: suma ${x + y}, mín ${Math.min(x, y)}, producto ${x * y}`).join("; ")}. La suma utilitarista ignora cómo se reparte la utilidad; el maximín rawlsiano solo mira al peor situado; el producto de Nash está entre ambos. Cada criterio respeta el principio de Pareto: nunca se elige un reparto dominado.`,
      ],
    );
  }
};

// ----------------------------------------------------- optimal taxation

/** Ramsey: with independent demands, tax rates in inverse proportion to elasticities. */
export const ramsey: Generator = (rng: Rng) => {
  for (;;) {
    const e1 = rng.pick([0.2, 0.25, 0.4, 0.5, 0.8, 1, 1.2, 1.5, 2]);
    const e2 = rng.pick([0.2, 0.25, 0.4, 0.5, 0.8, 1, 1.2, 1.5, 2]);
    if (e1 === e2) continue;
    const t1 = rng.pick([5, 8, 10, 12, 15, 20]);
    const t2 = (t1 * e1) / e2;
    if (t2 > 80) continue;
    return draft(
      `ramsey ${e1} ${e2} ${t1}`,
      [
        `Two goods with independent demands have price elasticities ${show(e1, 2)} and ${show(e2, 2)}. Good 1 is taxed at ${t1} %. At what rate should good 2 be taxed, by the Ramsey rule?`,
        `Deux biens à demandes indépendantes ont des élasticités-prix de ${show(e1, 2, "fr")} et ${show(e2, 2, "fr")}. Le bien 1 est taxé à ${t1} %. À quel taux taxer le bien 2, selon la règle de Ramsey ?`,
        `Dos bienes con demandas independientes tienen elasticidades precio de ${show(e1, 2, "es")} y ${show(e2, 2, "es")}. El bien 1 tributa al ${t1} %. ¿A qué tipo debe tributar el bien 2, según la regla de Ramsey?`,
      ],
      undefined,
      { type: "ramsey", e1, e2, t1 },
      numOpt(t2, 1, "%"),
      [numOpt((t1 * e2) / e1, 1, "%", "econRamseyInverted"), numOpt(t1, 1, "%", "econRamseyUniform"), numOpt(t1 * e1, 1, "%", "econRamseyPartial"), numOpt(t1 * e2, 1, "%", "econRamseyPartial")],
      [
        `To raise revenue with the least excess burden, every taxed good's demand should fall by the same proportion. With independent demands that gives the inverse elasticity rule, t₁/t₂ = ε₂/ε₁, so t₂ = ${t1} % × ${show(e1, 2)}/${show(e2, 2)} = ${show(t2, 1)} %. Inelastic goods are taxed more, which often means necessities: hence the tension with equity.`,
        `Pour lever une recette avec la moindre charge excédentaire, la demande de chaque bien taxé doit baisser dans la même proportion. Avec des demandes indépendantes, cela donne la règle de l'inverse des élasticités, t₁/t₂ = ε₂/ε₁, d'où t₂ = ${t1} % × ${show(e1, 2, "fr")}/${show(e2, 2, "fr")} = ${show(t2, 1, "fr")} %. Les biens inélastiques sont plus taxés, souvent des biens de première nécessité : d'où la tension avec l'équité.`,
        `Para recaudar con el menor exceso de gravamen, la demanda de cada bien gravado debe caer en la misma proporción. Con demandas independientes, eso da la regla de la elasticidad inversa, t₁/t₂ = ε₂/ε₁, así que t₂ = ${t1} % × ${show(e1, 2, "es")}/${show(e2, 2, "es")} = ${show(t2, 1, "es")} %. Los bienes inelásticos tributan más, a menudo bienes de primera necesidad: de ahí la tensión con la equidad.`,
      ],
    );
  }
};

/** The revenue-maximising top rate 1/(1 + a·e), with a Pareto tail a and elasticity e. */
export const saezTopRate: Generator = (rng: Rng) => {
  const a = rng.pick([1.5, 2, 2.5, 3]);
  const e = rng.pick([0.1, 0.2, 0.25, 0.3, 0.5, 0.8]);
  const tau = 100 / (1 + a * e);
  return draft(
    `saez ${a} ${e}`,
    [
      `Top incomes follow a Pareto distribution with parameter a = ${show(a, 2)}, and the elasticity of taxable income is e = ${show(e, 2)}. What top marginal rate maximises revenue, if the government puts no weight on top earners?`,
      `Les hauts revenus suivent une loi de Pareto de paramètre a = ${show(a, 2, "fr")}, et l'élasticité du revenu imposable vaut e = ${show(e, 2, "fr")}. Quel taux marginal supérieur maximise la recette, si l'État n'accorde aucun poids aux plus hauts revenus ?`,
      `Las rentas altas siguen una distribución de Pareto de parámetro a = ${show(a, 2, "es")}, y la elasticidad de la renta imponible es e = ${show(e, 2, "es")}. ¿Qué tipo marginal máximo maximiza la recaudación, si el Estado no da ningún peso a las rentas más altas?`,
    ],
    undefined,
    { type: "saez", a, e },
    numOpt(tau, 1, "%"),
    [numOpt(100 / (1 + e), 1, "%", "econSaezNoPareto"), numOpt((100 * a * e) / (1 + a * e), 1, "%", "econSaezInverted"), numOpt(100 / (1 + e / a), 1, "%", "econSaezInverted"), numOpt(100 / (1 + a), 1, "%", "econSaezNoPareto")],
    [
      `Raising the top rate gains revenue on all income above the threshold (mechanical effect) and loses some as top earners reduce taxable income (behavioural effect, proportional to e and to the thickness of the tail, a). Balancing them gives τ = 1/(1 + a·e) = 1/(1 + ${show(a, 2)} × ${show(e, 2)}) = ${show(tau, 1)} %. A thinner tail or a larger elasticity lowers it.`,
      `Relever le taux supérieur rapporte sur tout le revenu au-dessus du seuil (effet mécanique) et fait perdre une partie quand les hauts revenus réduisent leur revenu imposable (effet de comportement, proportionnel à e et à l'épaisseur de la queue, a). L'équilibre donne τ = 1/(1 + a·e) = 1/(1 + ${show(a, 2, "fr")} × ${show(e, 2, "fr")}) = ${show(tau, 1, "fr")} %. Une queue plus mince ou une élasticité plus forte l'abaissent.`,
      `Subir el tipo máximo recauda sobre toda la renta por encima del umbral (efecto mecánico) y pierde una parte cuando las rentas altas reducen su renta imponible (efecto de comportamiento, proporcional a e y al grosor de la cola, a). El equilibrio da τ = 1/(1 + a·e) = 1/(1 + ${show(a, 2, "es")} × ${show(e, 2, "es")}) = ${show(tau, 1, "es")} %. Una cola más fina o una elasticidad mayor lo reducen.`,
    ],
  );
};

// -------------------------------------------------------------- labour

const pair = (l: number, w: number, mistake?: MistakeKey): Option => ({
  tex: `${l.toFixed(2)},${w.toFixed(2)}`,
  text: { en: `L = ${show(l, 2)}, w = ${show(w, 2)}`, fr: `L = ${show(l, 2, "fr")}, w = ${show(w, 2, "fr")}`, es: `L = ${show(l, 2, "es")}, w = ${show(w, 2, "es")}` },
  ...(mistake ? { mistake } : {}),
});

/** A monopsonist hires where MRC = MRP and pays the supply price; a minimum wage between can raise employment. */
export const monopsony: Generator = (rng: Rng) => {
  for (;;) {
    const d = rng.int(1, 2);
    const k = rng.int(1, 2);
    const lm = rng.int(3, 6);
    const c = rng.int(2, 6);
    const m = c + (2 * d + k) * lm;
    const wm = c + d * lm;
    const lc = (m - c) / (d + k);
    const wc = c + d * lc;
    if (wc - wm < 2) continue;
    const ask = rng.int(0, 1) === 0 ? "choice" : "minWage";
    const minWage = ask === "minWage" ? rng.int(Math.floor(wm) + 1, Math.ceil(wc) - 1) : undefined;
    const graph: Chart = {
      type: "chart",
      x: [0, nice((m / k) * 1.02)],
      y: [0, nice(m * 1.1)],
      xLabel: "L",
      yLabel: "w",
      curves: [
        { fn: line(m, -k), label: "MRP", style: "main" },
        { fn: line(c, d), label: "S", style: "alt" },
        { fn: line(c, 2 * d), label: "MRC", style: "guide" },
        ...(minWage !== undefined ? [{ fn: () => minWage, label: "w̄", style: "guide" as const }] : []),
      ],
    };
    const shown = `S: w = ${c} + ${d}L, MRP = ${m} − ${k}L`;
    if (ask === "choice") {
      return draft(
        `mono ${c} ${d} ${m} ${k}`,
        [
          `A single employer faces the labour supply and marginal revenue product shown (${shown}). What employment and wage does it choose?`,
          `Un employeur unique fait face à l'offre de travail et à la productivité marginale en valeur indiquées (${shown}). Quel emploi et quel salaire choisit-il ?`,
          `Un único empleador se enfrenta a la oferta de trabajo y al ingreso del producto marginal indicados (${shown}). ¿Qué empleo y qué salario elige?`,
        ],
        graph,
        { type: "monopsony", c, d, m, k, ask: "choice" },
        pair(lm, wm),
        [pair(lm, m - k * lm, "econMonopsonyWage"), pair(lc, wc, "econMonopsonyCompetitive"), pair(lc, wm, "econMonopsonyCompetitive")],
        [
          `Hiring one more worker means paying the higher wage to everyone, so the marginal cost of labour, MRC = ${c} + ${2 * d}L, lies above supply. The firm hires where MRC = MRP: ${c} + ${2 * d}L = ${m} − ${k}L, L = ${lm}, and pays the lowest wage that brings that many, read on supply: ${wm}. Wages are below the marginal revenue product, and employment below the competitive ${show(lc, 2)}.`,
          `Embaucher un salarié de plus oblige à payer le salaire plus élevé à tous : le coût marginal du travail, MRC = ${c} + ${2 * d}L, est au-dessus de l'offre. L'entreprise embauche là où MRC = MRP : ${c} + ${2 * d}L = ${m} − ${k}L, L = ${lm}, et paie le plus bas salaire qui attire ce nombre, lu sur l'offre : ${wm}. Le salaire est inférieur à la productivité marginale en valeur, et l'emploi au niveau concurrentiel de ${show(lc, 2, "fr")}.`,
          `Contratar a un trabajador más obliga a pagar el salario más alto a todos, así que el coste marginal del trabajo, MRC = ${c} + ${2 * d}L, está por encima de la oferta. La empresa contrata donde MRC = MRP: ${c} + ${2 * d}L = ${m} − ${k}L, L = ${lm}, y paga el salario más bajo que atrae a ese número, leído en la oferta: ${wm}. El salario queda por debajo del ingreso del producto marginal, y el empleo por debajo del competitivo, ${show(lc, 2, "es")}.`,
        ],
      );
    }
    const l = (minWage! - c) / d;
    return draft(
      `mono ${c} ${d} ${m} ${k} ${minWage}`,
      [
        `A single employer faces the labour supply and marginal revenue product shown (${shown}). A minimum wage of ${minWage} is set. How many workers are employed?`,
        `Un employeur unique fait face à l'offre de travail et à la productivité marginale en valeur indiquées (${shown}). Un salaire minimum de ${minWage} est fixé. Combien de salariés sont employés ?`,
        `Un único empleador se enfrenta a la oferta de trabajo y al ingreso del producto marginal indicados (${shown}). Se fija un salario mínimo de ${minWage}. ¿Cuántos trabajadores se emplean?`,
      ],
      graph,
      { type: "monopsony", c, d, m, k, ask: "minWage", minWage: minWage! },
      numOpt(l, 2),
      [numOpt((m - minWage!) / k, 2, "", "econMinWageCompetitive"), numOpt(lm, 2, "", "econMinWageNoEffect"), numOpt(lc, 2, "", "econMonopsonyCompetitive")],
      [
        `With the minimum wage, the wage no longer rises with hiring up to the number willing to work at ${minWage}: the marginal cost of labour is flat at ${minWage}, below MRP there. The firm hires everyone supplied at that wage, (${minWage} − ${c})/${d} = ${show(l, 2)}, more than the ${lm} it hired before. Under monopsony a moderate minimum wage can raise both pay and employment.`,
        `Avec le salaire minimum, le salaire ne monte plus avec l'embauche tant qu'on ne dépasse pas le nombre de personnes prêtes à travailler à ${minWage} : le coût marginal du travail est plat à ${minWage}, sous la MRP à cet endroit. L'entreprise embauche tous ceux qui s'offrent à ce salaire, (${minWage} − ${c})/${d} = ${show(l, 2, "fr")}, plus que les ${lm} d'avant. En monopsone, un salaire minimum modéré peut augmenter à la fois la paie et l'emploi.`,
        `Con el salario mínimo, el salario ya no sube al contratar mientras no se supere el número de personas dispuestas a trabajar a ${minWage}: el coste marginal del trabajo es plano en ${minWage}, por debajo del MRP en ese tramo. La empresa contrata a todos los que se ofrecen a ese salario, (${minWage} − ${c})/${d} = ${show(l, 2, "es")}, más que los ${lm} de antes. En monopsonio, un salario mínimo moderado puede subir a la vez la paga y el empleo.`,
      ],
    );
  }
};

// ------------------------------------------------------- social insurance

/** The most a risk-averse person (log utility) pays for full insurance: wealth minus the certainty equivalent. */
export const insurancePremium: Generator = (rng: Rng) => {
  const W = 100;
  const Lo = rng.pick([36, 51, 64, 75, 84, 91]);
  const p = rng.pick([0.1, 0.2, 0.25, 0.5]);
  const ce = Math.exp((1 - p) * Math.log(W) + p * Math.log(W - Lo));
  const wtp = W - ce;
  return draft(
    `ins ${Lo} ${p}`,
    [
      `With wealth ${W} and utility ln(wealth), a person faces a loss of ${Lo} with probability ${show(p, 2)}. What is the most they would pay for full insurance?`,
      `Avec une richesse de ${W} et une utilité ln(richesse), une personne risque une perte de ${Lo} avec une probabilité de ${show(p, 2, "fr")}. Combien paierait-elle au plus pour une assurance complète ?`,
      `Con una riqueza de ${W} y utilidad ln(riqueza), una persona afronta una pérdida de ${Lo} con probabilidad ${show(p, 2, "es")}. ¿Cuánto pagaría como máximo por un seguro completo?`,
    ],
    {
      type: "chart",
      x: [0, 110],
      y: [0, 5.2],
      xLabel: "W",
      yLabel: "U",
      xTicks: [W - Lo, W],
      curves: [
        { fn: (x) => (x > 0.5 ? Math.log(x) : Number.NaN), label: "ln W", style: "main" },
        { points: [[W - Lo, Math.log(W - Lo)], [W, Math.log(W)]], style: "guide" },
      ],
      points: [{ x: W - Lo, y: Math.log(W - Lo) }, { x: W, y: Math.log(W) }, { x: W - p * Lo, y: (1 - p) * Math.log(W) + p * Math.log(W - Lo) }],
    },
    { type: "insurance", W, L: Lo, p },
    numOpt(wtp, 1),
    [numOpt(p * Lo, 1, "", "econRiskNeutral"), numOpt(Lo, 1, "", "econRiskWhole"), numOpt(wtp - p * Lo, 1, "", "econRiskPremiumOnly")],
    [
      `Expected utility is ${show(1 - p, 2)} ln ${W} + ${show(p, 2)} ln ${W - Lo}; the certain wealth giving the same utility is ${show(ce, 1)}. The person would pay up to ${W} − ${show(ce, 1)} = ${show(wtp, 1)}: the expected loss ${show(p * Lo, 1)} plus a risk premium of ${show(wtp - p * Lo, 1)}. That gap is why insurance raises welfare, and why markets for it are worth having when they can work.`,
      `L'utilité espérée vaut ${show(1 - p, 2, "fr")} ln ${W} + ${show(p, 2, "fr")} ln ${W - Lo} ; la richesse certaine qui donne la même utilité est ${show(ce, 1, "fr")}. La personne paierait jusqu'à ${W} − ${show(ce, 1, "fr")} = ${show(wtp, 1, "fr")} : la perte espérée ${show(p * Lo, 1, "fr")} plus une prime de risque de ${show(wtp - p * Lo, 1, "fr")}. Cet écart explique pourquoi l'assurance augmente le bien-être, et pourquoi ses marchés valent la peine quand ils peuvent fonctionner.`,
      `La utilidad esperada es ${show(1 - p, 2, "es")} ln ${W} + ${show(p, 2, "es")} ln ${W - Lo}; la riqueza cierta que da la misma utilidad es ${show(ce, 1, "es")}. La persona pagaría hasta ${W} − ${show(ce, 1, "es")} = ${show(wtp, 1, "es")}: la pérdida esperada ${show(p * Lo, 1, "es")} más una prima de riesgo de ${show(wtp - p * Lo, 1, "es")}. Esa diferencia explica por qué el seguro aumenta el bienestar, y por qué sus mercados merecen existir cuando pueden funcionar.`,
    ],
  );
};
