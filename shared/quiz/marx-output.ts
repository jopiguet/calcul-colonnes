/**
 * Marx's Capital, generated: the computations of the three volumes. The
 * value of a commodity, money in circulation, the value of a day's product,
 * the rates of surplus value and profit, the working day, relative surplus
 * value, hourly wages, accumulation, turnover, the reproduction schemes,
 * prices of production, the falling rate of profit, differential rent and
 * capitalised income. Each wrong option is what a misreading predicts.
 *
 * The model of each question (`marx-model.ts`) goes with it; `check:quiz`
 * computes the answer again with an evaluator of its own
 * (`server/check-marx.ts`). Capitals are shown in Marx's notation
 * (`80c + 20v`), the same in every language.
 */
import type { Rng } from "./rng";
import type { Draft, Generator, Localized, MistakeKey, Option } from "./types";
import type { L3 } from "./linux/types";
import type { MarxModel } from "./marx-model";

const L = (t: L3): Localized => ({ en: t[0], fr: t[1], es: t[2] });

/** One decimal, as every option's `tex`. */
export const marxRound = (x: number, places = 1): string => {
  const f = 10 ** places;
  const r = Math.round(x * f) / f;
  return Object.is(r, -0) ? "0" : String(r);
};

/** A number as each language writes it: 1,234.5 in English, 1 234,5 in French and Spanish. */
function shown(x: number, lang: "en" | "fr" | "es", places = 1): string {
  const r = Number(marxRound(x, places));
  const [whole, decimals] = Math.abs(r).toFixed(places).replace(/\.?0+$/, "").split(".");
  const grouped = whole!.replace(/\B(?=(\d{3})+(?!\d))/g, lang === "en" ? "," : " ");
  return `${r < 0 ? "−" : ""}${grouped}${decimals ? (lang === "en" ? "." : ",") + decimals : ""}`;
}
const n3 = (x: number, places = 1): L3 => [shown(x, "en", places), shown(x, "fr", places), shown(x, "es", places)];

const opt = (tex: string, text: Localized, mistake?: MistakeKey): Option => ({ tex, text, ...(mistake ? { mistake } : {}) });
const hours = (x: number, mistake?: MistakeKey): Option => {
  const [en, fr, es] = n3(x);
  return opt(marxRound(x), { en: `${en} hours`, fr: `${fr} heures`, es: `${es} horas` }, mistake);
};
const percent = (x: number, mistake?: MistakeKey): Option => {
  const [en, fr, es] = n3(x);
  return opt(marxRound(x), { en: `${en}%`, fr: `${fr} %`, es: `${es} %` }, mistake);
};
const amount = (x: number, mistake?: MistakeKey, places = 1): Option => {
  const [en, fr, es] = n3(x, places);
  return opt(marxRound(x, places), { en, fr, es }, mistake);
};
const workers = (x: number, mistake?: MistakeKey): Option => {
  const [en, fr, es] = n3(x);
  return opt(marxRound(x), { en: `${en} workers`, fr: `${fr} ouvriers`, es: `${es} obreros` }, mistake);
};

function draft(id: string, question: L3, block: string | undefined, model: MarxModel, correct: Option, wrong: Option[], explanation: L3): Draft {
  const seen = new Set([correct.tex]);
  return {
    prompt: { key: "concept", tex: "", id, text: L(question), ...(block ? { code: block } : {}) },
    correct,
    wrong: wrong.filter((o) => !seen.has(o.tex) && seen.add(o.tex)),
    explanation: { key: "concept", tex: "", text: L(explanation) },
    verify: { kind: "marx", model },
  };
}

/** At least three wrong options that differ from the answer and from each other. */
const enough = (real: Option, wrong: Option[]): boolean => new Set(wrong.filter((o) => o.tex !== real.tex).map((o) => o.tex)).size >= 3;

const capitalLine = (c: number, v: number): string => `${c}c + ${v}v`;

// ------------------------------------------------------------- Volume I

export const socialValue: Generator = (rng: Rng) => {
  for (;;) {
    const shares = rng.pick([[20, 60, 20], [25, 50, 25], [10, 70, 20], [30, 50, 20], [15, 60, 25], [20, 70, 10]]);
    const hoursPer = rng.pick([[3, 4, 6], [2, 4, 5], [4, 5, 8], [3, 5, 6], [2, 3, 5], [4, 6, 9]]);
    const asked = 2;
    const value = shares.reduce((sum, s, i) => sum + (s * hoursPer[i]!) / 100, 0);
    const real = hours(value);
    const wrong = [
      hours(hoursPer[asked]!, "marxIndividualTime"),
      hours(hoursPer.reduce((a, b) => a + b, 0) / 3, "marxUnweightedTime"),
      hours(hoursPer[0]!, "marxBestTime"),
      hours(hoursPer[1]!, "marxModalTime"),
    ];
    if (!enough(real, wrong)) continue;
    const [a, b, c] = shares as [number, number, number];
    const [ha, hb, hc] = hoursPer as [number, number, number];
    const [ven, vfr, ves] = n3(value);
    return draft(
      `social ${shares.join(",")} ${hoursPer.join(",")}`,
      [
        `Three groups of producers make the same commodity. Group A makes ${a}% of the output at ${ha} hours per unit, group B ${b}% at ${hb} hours, group C ${c}% at ${hc} hours. How much value does one unit made by group C contain?`,
        `Trois groupes de producteurs fabriquent la même marchandise. Le groupe A en fait ${a} % à ${ha} heures par unité, le groupe B ${b} % à ${hb} heures, le groupe C ${c} % à ${hc} heures. Combien de valeur contient une unité faite par le groupe C ?`,
        `Tres grupos de productores fabrican la misma mercancía. El grupo A hace el ${a} % a ${ha} horas por unidad, el grupo B el ${b} % a ${hb} horas, el grupo C el ${c} % a ${hc} horas. ¿Cuánto valor contiene una unidad hecha por el grupo C?`,
      ],
      undefined,
      { type: "socialValue", shares, hours: hoursPer, asked },
      real,
      wrong,
      [
        `Value is the socially necessary labour time: the time per unit averaged over the whole output, ${a}% × ${ha} + ${b}% × ${hb} + ${c}% × ${hc} = ${ven} hours. Every unit has that value, whoever made it: group C's extra time creates no value, and group A pockets an extra surplus value (Volume I, chapter 1).`,
        `La valeur est le temps de travail socialement nécessaire : le temps par unité en moyenne sur toute la production, ${a} % × ${ha} + ${b} % × ${hb} + ${c} % × ${hc} = ${vfr} heures. Chaque unité a cette valeur, quel que soit son producteur : le temps en trop du groupe C ne crée pas de valeur, et le groupe A empoche une plus-value extra (Livre I, chapitre 1).`,
        `El valor es el tiempo de trabajo socialmente necesario: el tiempo por unidad promediado sobre toda la producción, ${a} % × ${ha} + ${b} % × ${hb} + ${c} % × ${hc} = ${ves} horas. Cada unidad tiene ese valor, la haga quien la haga: el tiempo de más del grupo C no crea valor, y el grupo A se embolsa un plusvalor extraordinario (Libro I, capítulo 1).`,
      ],
    );
  }
};

export const moneyQuantity: Generator = (rng: Rng) => {
  for (;;) {
    const velocity = rng.pick([2, 3, 4, 5]);
    const needed = rng.pick([200, 250, 300, 350, 400, 450, 500]);
    const credit = rng.pick([100, 200, 300]);
    const due = rng.pick([200, 300, 400, 600]);
    const offset = rng.pick([50, 100, 150]);
    if (offset >= due) continue;
    const prices = needed * velocity + credit - due + offset;
    if (prices <= credit + 100) continue;
    const real = amount(needed);
    const wrong = [
      amount(prices / velocity, "marxMeansOfPaymentIgnored"),
      amount((prices - credit) / velocity, "marxPaymentsIgnored"),
      amount((prices - credit + due) / velocity, "marxOffsetIgnored"),
      amount(prices - credit + due - offset, "marxVelocityIgnored"),
    ];
    if (!enough(real, wrong)) continue;
    const p = n3(prices);
    const k = n3(credit);
    const d = n3(due);
    const x = n3(offset);
    const sum = n3(prices - credit + due - offset);
    return draft(
      `money ${prices} ${credit} ${due} ${offset} ${velocity}`,
      [
        `In a month, commodities with prices totalling ${p[0]} are sold, ${k[0]} of them on credit. Earlier debts of ${d[0]} fall due, of which ${x[0]} cancel each other out. Each unit of money changes hands ${velocity} times in the month. How much money must circulate?`,
        `En un mois, des marchandises dont les prix totalisent ${p[1]} sont vendues, dont ${k[1]} à crédit. Des dettes antérieures de ${d[1]} arrivent à échéance, dont ${x[1]} se compensent. Chaque unité de monnaie change de mains ${velocity} fois dans le mois. Combien de monnaie doit circuler ?`,
        `En un mes se venden mercancías cuyos precios suman ${p[2]}, de ellas ${k[2]} a crédito. Vencen deudas anteriores por ${d[2]}, de las que ${x[2]} se compensan entre sí. Cada unidad de dinero cambia de manos ${velocity} veces en el mes. ¿Cuánto dinero debe circular?`,
      ],
      undefined,
      { type: "moneyQuantity", prices, credit, due, offset, velocity },
      real,
      wrong,
      [
        `Money as means of payment changes the sum to be realised: prices, less sales on credit, plus payments falling due, less those that cancel out, ${p[0]} − ${k[0]} + ${d[0]} − ${x[0]} = ${sum[0]}, divided by the velocity ${velocity}: ${needed}. Prices determine the quantity of money, not the reverse (Volume I, chapter 3).`,
        `La monnaie comme moyen de paiement change la somme à réaliser : les prix, moins les ventes à crédit, plus les paiements échus, moins ceux qui se compensent, ${p[1]} − ${k[1]} + ${d[1]} − ${x[1]} = ${sum[1]}, divisé par la vitesse ${velocity} : ${needed}. Les prix déterminent la quantité de monnaie, et non l'inverse (Livre I, chapitre 3).`,
        `El dinero como medio de pago cambia la suma por realizar: los precios, menos las ventas a crédito, más los pagos que vencen, menos los que se compensan, ${p[2]} − ${k[2]} + ${d[2]} − ${x[2]} = ${sum[2]}, dividido por la velocidad ${velocity}: ${needed}. Los precios determinan la cantidad de dinero, y no al revés (Libro I, capítulo 3).`,
      ],
    );
  }
};

export const productValue: Generator = (rng: Rng) => {
  for (;;) {
    const materials = rng.pick([20, 30, 40, 60]);
    const [machine, life] = rng.pick([[100, 50], [200, 100], [300, 100], [500, 250], [1000, 250], [600, 200]] as const);
    const worked = rng.pick([8, 10, 12]);
    const labourPower = rng.pick([4, 5, 6]);
    const wear = machine / life;
    const value = materials + wear + worked;
    const real = hours(value);
    const wrong = [
      hours(materials + machine + worked, "marxWholeMachine"),
      hours(value + labourPower, "marxWagesAdded"),
      hours(materials + wear + labourPower, "marxPaidLabourOnly"),
      hours(materials + worked, "marxWearIgnored"),
    ];
    if (!enough(real, wrong)) continue;
    return draft(
      `product ${materials} ${machine} ${life} ${worked} ${labourPower}`,
      [
        `In a day, a worker works up materials worth ${materials} hours of labour on a machine worth ${machine} hours that lasts ${life} working days. The worker works ${worked} hours; the day's labour-power is worth ${labourPower} hours. What is the value of the day's product?`,
        `En une journée, un ouvrier transforme des matières valant ${materials} heures de travail sur une machine valant ${machine} heures, qui dure ${life} journées de travail. L'ouvrier travaille ${worked} heures ; la force de travail d'une journée vaut ${labourPower} heures. Quelle est la valeur du produit de la journée ?`,
        `En un día, un obrero transforma materiales que valen ${materials} horas de trabajo con una máquina que vale ${machine} horas y dura ${life} jornadas de trabajo. El obrero trabaja ${worked} horas; la fuerza de trabajo de un día vale ${labourPower} horas. ¿Cuál es el valor del producto del día?`,
      ],
      undefined,
      { type: "productValue", materials, machine, life, hours: worked, labourPower },
      real,
      wrong,
      [
        `Constant capital transfers its value: the materials whole (${materials}), the machine only by its wear, ${machine} / ${life} = ${wear} a day. Living labour adds new value, one hour per hour worked (${worked}), whatever labour-power cost. ${materials} + ${wear} + ${worked} = ${marxRound(value)} hours. The ${labourPower} hours of labour-power are part of the new value, not added to it: the other ${worked - labourPower} are surplus value (Volume I, chapters 7–8).`,
        `Le capital constant transmet sa valeur : les matières entièrement (${materials}), la machine seulement par son usure, ${machine} / ${life} = ${wear} par jour. Le travail vivant ajoute une valeur nouvelle, une heure par heure travaillée (${worked}), quel qu'ait été le prix de la force de travail. ${materials} + ${wear} + ${worked} = ${marxRound(value)} heures. Les ${labourPower} heures de la force de travail font partie de la valeur nouvelle, elles ne s'y ajoutent pas : les ${worked - labourPower} autres sont de la plus-value (Livre I, chapitres 7–8).`,
        `El capital constante transfiere su valor: los materiales enteros (${materials}), la máquina solo por su desgaste, ${machine} / ${life} = ${wear} al día. El trabajo vivo añade valor nuevo, una hora por hora trabajada (${worked}), costara lo que costara la fuerza de trabajo. ${materials} + ${wear} + ${worked} = ${marxRound(value)} horas. Las ${labourPower} horas de la fuerza de trabajo forman parte del valor nuevo, no se suman a él: las ${worked - labourPower} restantes son plusvalor (Libro I, capítulos 7–8).`,
      ],
    );
  }
};

export const surplusRate: Generator = (rng: Rng) => {
  for (;;) {
    const c = rng.pick([200, 300, 400, 410, 500, 600, 800]);
    const v = rng.pick([50, 60, 80, 90, 100, 120, 150, 200]);
    const rate = rng.pick([50, 75, 100, 120, 150, 200, 250, 300]);
    const s = (v * rate) / 100;
    if (!Number.isInteger(s)) continue;
    const value = c + v + s;
    const real = percent(rate);
    const wrong = [
      percent((100 * s) / (c + v), "marxRateOnTotal"),
      percent((100 * (v + s)) / v, "marxNewValueOverV"),
      percent((100 * s) / value, "marxRateOnValue"),
      percent((100 * v) / s, "marxInverted"),
    ];
    if (!enough(real, wrong)) continue;
    return draft(
      `surplus ${c} ${v} ${value}`,
      [
        `A capital advances ${c} as constant capital and ${v} as variable capital. The product is worth ${value}. What is the rate of surplus value?`,
        `Un capital avance ${c} en capital constant et ${v} en capital variable. Le produit vaut ${value}. Quel est le taux de plus-value ?`,
        `Un capital adelanta ${c} como capital constante y ${v} como capital variable. El producto vale ${value}. ¿Cuál es la tasa de plusvalor?`,
      ],
      undefined,
      { type: "surplusRate", c, v, value },
      real,
      wrong,
      [
        `The surplus value is what the product is worth beyond the capital advanced: ${value} − ${c} − ${v} = ${s}. Only variable capital produces new value, so the rate is computed on it: s′ = s/v = ${s}/${v} = ${rate}%. Related to the whole capital, ${s}/${c + v}, it would be the rate of profit (Volume I, chapter 9).`,
        `La plus-value est ce que vaut le produit au-delà du capital avancé : ${value} − ${c} − ${v} = ${s}. Seul le capital variable produit de la valeur nouvelle, donc le taux se calcule sur lui : s′ = s/v = ${s}/${v} = ${rate} %. Rapportée à tout le capital, ${s}/${c + v}, ce serait le taux de profit (Livre I, chapitre 9).`,
        `El plusvalor es lo que vale el producto por encima del capital adelantado: ${value} − ${c} − ${v} = ${s}. Solo el capital variable produce valor nuevo, así que la tasa se calcula sobre él: s′ = s/v = ${s}/${v} = ${rate} %. Referido a todo el capital, ${s}/${c + v}, sería la tasa de ganancia (Libro I, capítulo 9).`,
      ],
    );
  }
};

export const workingDay: Generator = (rng: Rng) => {
  for (;;) {
    const day = rng.pick([8, 9, 10]);
    const necessary = rng.pick([4, 5, 6]);
    const newDay = day + rng.pick([1, 2, 3, 4]);
    if (necessary >= day || newDay > 14) continue;
    const rate = (100 * (newDay - necessary)) / necessary;
    const real = percent(rate);
    const wrong = [
      percent((100 * (day - necessary)) / necessary, "marxOldRate"),
      percent((100 * (newDay - necessary)) / newDay, "marxRateOnDay"),
      percent((100 * (newDay - day)) / necessary, "marxOnlyExtra"),
      percent((100 * necessary) / (newDay - necessary), "marxInverted"),
    ];
    if (!enough(real, wrong)) continue;
    const [en, fr, es] = n3(rate);
    return draft(
      `day ${day} ${necessary} ${newDay}`,
      [
        `In a working day of ${day} hours, the worker reproduces the value of their labour-power in ${necessary} hours. The employer lengthens the day to ${newDay} hours, with the same daily wage. What is the new rate of surplus value?`,
        `Dans une journée de travail de ${day} heures, l'ouvrier reproduit la valeur de sa force de travail en ${necessary} heures. L'employeur allonge la journée à ${newDay} heures, pour le même salaire journalier. Quel est le nouveau taux de plus-value ?`,
        `En una jornada de trabajo de ${day} horas, el obrero reproduce el valor de su fuerza de trabajo en ${necessary} horas. El patrón alarga la jornada a ${newDay} horas, con el mismo salario diario. ¿Cuál es la nueva tasa de plusvalor?`,
      ],
      undefined,
      { type: "workingDay", day, necessary, newDay },
      real,
      wrong,
      [
        `Necessary labour stays ${necessary} hours; surplus labour becomes ${newDay} − ${necessary} = ${newDay - necessary} hours. s′ = surplus labour / necessary labour = ${newDay - necessary}/${necessary} = ${en}%, up from ${marxRound((100 * (day - necessary)) / necessary)}%: absolute surplus value, from a longer day (Volume I, chapter 10).`,
        `Le travail nécessaire reste de ${necessary} heures ; le surtravail passe à ${newDay} − ${necessary} = ${newDay - necessary} heures. s′ = surtravail / travail nécessaire = ${newDay - necessary}/${necessary} = ${fr} %, au lieu de ${shown((100 * (day - necessary)) / necessary, "fr")} % : c'est la plus-value absolue, tirée d'une journée plus longue (Livre I, chapitre 10).`,
        `El trabajo necesario sigue siendo de ${necessary} horas; el plustrabajo pasa a ${newDay} − ${necessary} = ${newDay - necessary} horas. s′ = plustrabajo / trabajo necesario = ${newDay - necessary}/${necessary} = ${es} %, frente al ${shown((100 * (day - necessary)) / necessary, "es")} % de antes: es plusvalor absoluto, sacado de una jornada más larga (Libro I, capítulo 10).`,
      ],
    );
  }
};

export const relativeSurplus: Generator = (rng: Rng) => {
  for (;;) {
    const day = rng.pick([8, 10, 12]);
    const necessary = rng.pick([4, 5, 6]);
    const cheaper = rng.pick([20, 25, 40, 50]);
    const newNecessary = (necessary * (100 - cheaper)) / 100;
    if (necessary >= day) continue;
    const old = (100 * (day - necessary)) / necessary;
    const rate = (100 * (day - newNecessary)) / newNecessary;
    const real = percent(rate);
    const wrong = [
      percent(old, "marxOldRate"),
      percent((old * (100 + cheaper)) / 100, "marxProportional"),
      percent((100 * (day - newNecessary)) / day, "marxRateOnDay"),
      percent((100 * (day - newNecessary)) / necessary, "marxOldNecessary"),
    ];
    if (!enough(real, wrong)) continue;
    const nn = n3(newNecessary);
    const r = n3(rate);
    return draft(
      `relative ${day} ${necessary} ${cheaper}`,
      [
        `The working day is ${day} hours, of which ${necessary} hours are necessary labour. Higher productivity in the industries making wage goods makes the worker's means of subsistence ${cheaper}% cheaper. The day and the real wage are unchanged. What is the new rate of surplus value?`,
        `La journée de travail est de ${day} heures, dont ${necessary} heures de travail nécessaire. Une productivité accrue dans les branches qui produisent les biens salariaux rend les moyens de subsistance de l'ouvrier ${cheaper} % moins chers. La journée et le salaire réel ne changent pas. Quel est le nouveau taux de plus-value ?`,
        `La jornada de trabajo es de ${day} horas, de las que ${necessary} son de trabajo necesario. Una mayor productividad en las ramas que producen bienes salariales abarata un ${cheaper} % los medios de subsistencia del obrero. La jornada y el salario real no cambian. ¿Cuál es la nueva tasa de plusvalor?`,
      ],
      undefined,
      { type: "relativeSurplus", day, necessary, cheaper },
      real,
      wrong,
      [
        `The same subsistence now takes ${100 - cheaper}% of the time to produce: necessary labour falls to ${necessary} × ${(100 - cheaper) / 100} = ${nn[0]} hours, and surplus labour rises to ${shown(day - newNecessary, "en")}. s′ = ${shown(day - newNecessary, "en")}/${nn[0]} = ${r[0]}%. This is relative surplus value: the day is no longer, the worker consumes as much, and yet exploitation rises (Volume I, chapter 12).`,
        `La même subsistance demande maintenant ${100 - cheaper} % du temps : le travail nécessaire tombe à ${necessary} × ${shown((100 - cheaper) / 100, "fr", 2)} = ${nn[1]} heures, et le surtravail monte à ${shown(day - newNecessary, "fr")}. s′ = ${shown(day - newNecessary, "fr")}/${nn[1]} = ${r[1]} %. C'est la plus-value relative : la journée n'est pas plus longue, l'ouvrier consomme autant, et pourtant l'exploitation augmente (Livre I, chapitre 12).`,
        `La misma subsistencia requiere ahora el ${100 - cheaper} % del tiempo: el trabajo necesario baja a ${necessary} × ${shown((100 - cheaper) / 100, "es", 2)} = ${nn[2]} horas, y el plustrabajo sube a ${shown(day - newNecessary, "es")}. s′ = ${shown(day - newNecessary, "es")}/${nn[2]} = ${r[2]} %. Es plusvalor relativo: la jornada no es más larga, el obrero consume lo mismo y, sin embargo, la explotación aumenta (Libro I, capítulo 12).`,
      ],
    );
  }
};

export const hourlyWage: Generator = (rng: Rng) => {
  for (;;) {
    const wage = rng.pick([40, 48, 60, 72, 80]);
    const day = rng.pick([8, 10]);
    const newDay = rng.pick([10, 11, 12]);
    const raise = rng.pick([10, 20, 25]);
    const newWage = (wage * (100 + raise)) / 100;
    if (newDay <= day || newWage / newDay >= wage / day || !Number.isInteger(newWage)) continue;
    const real = amount(newWage / newDay, undefined, 2);
    const wrong = [
      amount(newWage / day, "marxOldDay", 2),
      amount(wage / newDay, "marxOldWage", 2),
      amount(wage / day, "marxHourUnchanged", 2),
      amount((newWage - wage) / (newDay - day), "marxMarginalHour", 2),
    ];
    if (!enough(real, wrong)) continue;
    const old = n3(wage / day, 2);
    const now = n3(newWage / newDay, 2);
    return draft(
      `hourly ${wage} ${day} ${newWage} ${newDay}`,
      [
        `A worker is paid ${wage} for a day of ${day} hours. The employer lengthens the day to ${newDay} hours and raises the daily wage by ${raise}%, to ${newWage}. What is the new price of an hour of labour?`,
        `Un ouvrier est payé ${wage} pour une journée de ${day} heures. L'employeur allonge la journée à ${newDay} heures et augmente le salaire journalier de ${raise} %, à ${newWage}. Quel est le nouveau prix d'une heure de travail ?`,
        `A un obrero se le pagan ${wage} por una jornada de ${day} horas. El patrón alarga la jornada a ${newDay} horas y sube el salario diario un ${raise} %, a ${newWage}. ¿Cuál es el nuevo precio de una hora de trabajo?`,
      ],
      undefined,
      { type: "hourlyWage", wage, day, newWage, newDay },
      real,
      wrong,
      [
        `With time wages, the price of an hour is the daily wage divided by the length of the day: before, ${wage}/${day} = ${old[0]}; now ${newWage}/${newDay} = ${now[0]}. The daily wage rose, but the price of labour fell, and the longer day uses up more labour-power: a rise in the daily wage can hide a fall in the price of labour (Volume I, chapter 20).`,
        `Au salaire au temps, le prix d'une heure est le salaire journalier divisé par la durée de la journée : avant, ${wage}/${day} = ${old[1]} ; maintenant ${newWage}/${newDay} = ${now[1]}. Le salaire journalier a monté, mais le prix du travail a baissé, et la journée plus longue use davantage la force de travail : une hausse du salaire journalier peut cacher une baisse du prix du travail (Livre I, chapitre 20).`,
        `Con el salario por tiempo, el precio de una hora es el salario diario dividido por la duración de la jornada: antes, ${wage}/${day} = ${old[2]}; ahora ${newWage}/${newDay} = ${now[2]}. El salario diario subió, pero el precio del trabajo bajó, y la jornada más larga desgasta más la fuerza de trabajo: una subida del salario diario puede ocultar una bajada del precio del trabajo (Libro I, capítulo 20).`,
      ],
    );
  }
};

export const accumulationSplit: Generator = (rng: Rng) => {
  for (;;) {
    const composition = rng.pick([2, 3, 4, 5, 9]);
    const wage = rng.pick([2, 4, 5, 10]);
    const hired = rng.pick([5, 10, 20, 25]);
    const added = (composition + 1) * wage * hired;
    const real = workers(hired);
    // A fractional number of workers would give itself away: only whole numbers are offered.
    const wrong = [
      workers(added / wage, "marxAllToLabour"),
      workers((added * composition) / (composition + 1) / wage, "marxSplitInverted"),
      workers(added / composition / wage, "marxRatioMisread"),
      workers(added / 2 / wage, "marxEvenSplit"),
    ].filter((o) => Number.isInteger(Number(o.tex)));
    if (!enough(real, wrong)) continue;
    const dv = added / (composition + 1);
    return draft(
      `accumulate ${composition} ${wage} ${added}`,
      [
        `A capital has a composition c/v = ${composition}. Its owner turns ${added} of surplus value into capital, keeping the same composition. A worker costs ${wage} a week. How many more workers are employed?`,
        `Un capital a une composition c/v = ${composition}. Son propriétaire transforme ${added} de plus-value en capital, en gardant la même composition. Un ouvrier coûte ${wage} par semaine. Combien d'ouvriers de plus sont employés ?`,
        `Un capital tiene una composición c/v = ${composition}. Su dueño convierte ${added} de plusvalor en capital, manteniendo la misma composición. Un obrero cuesta ${wage} a la semana. ¿Cuántos obreros más se emplean?`,
      ],
      undefined,
      { type: "accumulationSplit", composition, added, wage },
      real,
      wrong,
      [
        `At c/v = ${composition}, each ${composition + 1} of capital is ${composition} of means of production and 1 of labour-power: of the ${added}, ${added - dv} go to c and ${dv} to v, which buys ${dv}/${wage} = ${hired} workers. The higher the composition, the fewer workers the same accumulation employs: the root of the reserve army (Volume I, chapter 25).`,
        `À c/v = ${composition}, chaque ${composition + 1} de capital se compose de ${composition} de moyens de production et de 1 de force de travail : sur les ${added}, ${added - dv} vont à c et ${dv} à v, qui paie ${dv}/${wage} = ${hired} ouvriers. Plus la composition est élevée, moins la même accumulation emploie d'ouvriers : c'est la racine de l'armée de réserve (Livre I, chapitre 25).`,
        `Con c/v = ${composition}, cada ${composition + 1} de capital son ${composition} de medios de producción y 1 de fuerza de trabajo: de los ${added}, ${added - dv} van a c y ${dv} a v, que paga ${dv}/${wage} = ${hired} obreros. Cuanto mayor es la composición, menos obreros emplea la misma acumulación: es la raíz del ejército de reserva (Libro I, capítulo 25).`,
      ],
    );
  }
};

// ------------------------------------------------------------ Volume II

export const turnover: Generator = (rng: Rng) => {
  for (;;) {
    const variable = rng.pick([500, 1000, 2000, 2500]);
    const turnovers = rng.pick([2, 4, 5, 10, 12]);
    const rate = rng.pick([50, 100, 150, 200]);
    const annual = (rate / 100) * variable * turnovers;
    const real = amount(annual);
    const wrong = [
      amount((rate / 100) * variable, "marxTurnoverIgnored"),
      amount(((rate / 100) * variable) / turnovers, "marxTurnoverDivided"),
      amount(variable * turnovers, "marxRateIgnored"),
    ];
    if (!enough(real, wrong)) continue;
    const a = n3(annual);
    const v = n3(variable);
    return draft(
      `turnover ${variable} ${turnovers} ${rate}`,
      [
        `A capitalist advances a variable capital of ${v[0]}, which turns over ${turnovers} times a year. The rate of surplus value is ${rate}%. How much surplus value is produced in a year?`,
        `Un capitaliste avance un capital variable de ${v[1]}, qui fait ${turnovers} rotations par an. Le taux de plus-value est de ${rate} %. Combien de plus-value est produite en un an ?`,
        `Un capitalista adelanta un capital variable de ${v[2]}, que rota ${turnovers} veces al año. La tasa de plusvalor es del ${rate} %. ¿Cuánto plusvalor se produce en un año?`,
      ],
      undefined,
      { type: "turnover", variable, turnovers, rate },
      real,
      wrong,
      [
        `The same advance pays wages ${turnovers} times a year: it employs labour-power worth ${v[0]} × ${turnovers} over the year, which produces ${rate}% of that as surplus value, ${a[0]}. The annual rate of surplus value is ${rate}% × ${turnovers} = ${shown(rate * turnovers, "en")}%: faster turnover means less capital advanced for the same exploitation (Volume II, chapter 16).`,
        `La même avance paie les salaires ${turnovers} fois par an : elle emploie sur l'année une force de travail valant ${v[1]} × ${turnovers}, qui produit ${rate} % de cette valeur en plus-value, ${a[1]}. Le taux annuel de plus-value est de ${rate} % × ${turnovers} = ${shown(rate * turnovers, "fr")} % : une rotation plus rapide demande moins de capital avancé pour la même exploitation (Livre II, chapitre 16).`,
        `El mismo adelanto paga los salarios ${turnovers} veces al año: emplea en el año una fuerza de trabajo que vale ${v[2]} × ${turnovers}, que produce un ${rate} % de ese valor como plusvalor, ${a[2]}. La tasa anual de plusvalor es ${rate} % × ${turnovers} = ${shown(rate * turnovers, "es")} %: una rotación más rápida requiere menos capital adelantado para la misma explotación (Libro II, capítulo 16).`,
      ],
    );
  }
};

/** Department I's scheme as Marx writes it. */
const departmentOne = (one: { c: number; v: number; s: number }): string => `I:  ${one.c}c + ${one.v}v + ${one.s}s`;

export const reproductionSimple: Generator = (rng: Rng) => {
  for (;;) {
    const c = rng.pick([3000, 4000, 5000, 6000]);
    const v = c / rng.pick([4, 5]);
    const s = v * rng.pick([1, 1.5]);
    const one = { c, v, s };
    const real = amount(v + s);
    const wrong = [amount(c, "marxWrongDepartment"), amount(v, "marxSurplusForgotten"), amount(c + v + s, "marxWholeProduct"), amount(s, "marxWagesForgotten")];
    if (!enough(real, wrong) || !Number.isInteger(s)) continue;
    const t = n3(v + s);
    const ic = n3(c);
    return draft(
      `simple ${c} ${v} ${s}`,
      [
        "Department I produces means of production, Department II means of consumption. For simple reproduction, what must the constant capital of Department II be?",
        "Le secteur I produit des moyens de production, le secteur II des moyens de consommation. Pour une reproduction simple, que doit valoir le capital constant du secteur II ?",
        "El sector I produce medios de producción, el sector II medios de consumo. Para la reproducción simple, ¿cuánto debe valer el capital constante del sector II?",
      ],
      departmentOne(one),
      { type: "reproduction", variant: "simple", one, twoC: 0 },
      real,
      wrong,
      [
        `Department I keeps ${ic[0]} of its own product to replace its constant capital. The rest, I(v + s) = ${t[0]}, is means of production its workers and capitalists cannot consume: they exchange it for consumer goods from Department II, which needs exactly that to replace its own constant capital. Simple reproduction requires I(v + s) = IIc = ${t[0]} (Volume II, chapter 20).`,
        `Le secteur I garde ${ic[1]} de son propre produit pour remplacer son capital constant. Le reste, I(v + s) = ${t[1]}, est fait de moyens de production que ses ouvriers et ses capitalistes ne peuvent pas consommer : ils l'échangent contre des biens de consommation du secteur II, qui en a besoin exactement pour remplacer son propre capital constant. La reproduction simple exige I(v + s) = IIc = ${t[1]} (Livre II, chapitre 20).`,
        `El sector I se queda con ${ic[2]} de su propio producto para reponer su capital constante. El resto, I(v + s) = ${t[2]}, son medios de producción que sus obreros y capitalistas no pueden consumir: lo cambian por bienes de consumo del sector II, que lo necesita exactamente para reponer su propio capital constante. La reproducción simple exige I(v + s) = IIc = ${t[2]} (Libro II, capítulo 20).`,
      ],
    );
  }
};

export const reproductionSurplus: Generator = (rng: Rng) => {
  for (;;) {
    const c = rng.pick([4000, 5000, 6000]);
    const v = c / rng.pick([4, 5]);
    const s = v * rng.pick([1, 1.5]);
    const twoC = rng.pick([0.6, 0.7, 0.75, 0.8]) * (v + s);
    const one = { c, v, s };
    if (!Number.isInteger(s) || !Number.isInteger(twoC)) continue;
    const real = amount(v + s - twoC);
    const wrong = [amount(s, "marxSurplusOnly"), amount(c + v + s - twoC, "marxWholeProduct"), amount(v + s, "marxIIcIgnored"), amount(c - twoC, "marxWrongDepartment")];
    if (!enough(real, wrong)) continue;
    const t = n3(v + s);
    const r = n3(v + s - twoC);
    return draft(
      `surplusmp ${c} ${v} ${s} ${twoC}`,
      [
        `In the scheme below, Department II's constant capital is ${n3(twoC)[0]}. How much of Department I's product is left as additional means of production, available for accumulation?`,
        `Dans le schéma ci-dessous, le capital constant du secteur II vaut ${n3(twoC)[1]}. Combien du produit du secteur I reste disponible comme moyens de production supplémentaires, pour l'accumulation ?`,
        `En el esquema de abajo, el capital constante del sector II vale ${n3(twoC)[2]}. ¿Cuánto del producto del sector I queda como medios de producción adicionales, disponibles para la acumulación?`,
      ],
      departmentOne(one),
      { type: "reproduction", variant: "surplus", one, twoC },
      real,
      wrong,
      [
        `Department I's product beyond its own replacement is I(v + s) = ${t[0]} of means of production. Department II takes ${n3(twoC)[0]} to replace its constant capital; ${r[0]} remain to expand production in either department. Expanded reproduction needs I(v + s) > IIc (Volume II, chapter 21).`,
        `Le produit du secteur I au-delà de son propre remplacement est I(v + s) = ${t[1]} de moyens de production. Le secteur II en prend ${n3(twoC)[1]} pour remplacer son capital constant ; il en reste ${r[1]} pour élargir la production dans l'un ou l'autre secteur. La reproduction élargie exige I(v + s) > IIc (Livre II, chapitre 21).`,
        `El producto del sector I por encima de su propia reposición es I(v + s) = ${t[2]} en medios de producción. El sector II toma ${n3(twoC)[2]} para reponer su capital constante; quedan ${r[2]} para ampliar la producción en uno u otro sector. La reproducción ampliada exige I(v + s) > IIc (Libro II, capítulo 21).`,
      ],
    );
  }
};

// ----------------------------------------------------------- Volume III

export const profitRate: Generator = (rng: Rng) => {
  for (;;) {
    const [c, v] = rng.pick([[80, 20], [70, 30], [60, 40], [85, 15], [90, 10], [410, 90], [300, 100], [400, 100], [240, 60]] as const);
    const rate = rng.pick([50, 100, 150, 200]);
    const s = (v * rate) / 100;
    const real = percent((100 * s) / (c + v));
    const wrong = [percent(rate, "marxProfitIsSurplus"), percent((100 * s) / c, "marxOnConstant"), percent((100 * s) / (c + v + s), "marxRateOnValue")];
    if (!enough(real, wrong)) continue;
    const p = n3((100 * s) / (c + v));
    return draft(
      `profit ${c} ${v} ${rate}`,
      [
        `A capital of ${capitalLine(c, v)} works at a rate of surplus value of ${rate}%. What is its rate of profit?`,
        `Un capital de ${capitalLine(c, v)} travaille à un taux de plus-value de ${rate} %. Quel est son taux de profit ?`,
        `Un capital de ${capitalLine(c, v)} trabaja con una tasa de plusvalor del ${rate} %. ¿Cuál es su tasa de ganancia?`,
      ],
      undefined,
      { type: "profitRate", c, v, rate },
      real,
      wrong,
      [
        `The surplus value is ${rate}% of v: s = ${shown(s, "en")}. Profit relates it to the whole capital advanced: p′ = s/(c + v) = ${shown(s, "en")}/${c + v} = ${p[0]}%. Since c > 0, the rate of profit is always below the rate of surplus value (Volume III, chapters 2–3).`,
        `La plus-value vaut ${rate} % de v : s = ${shown(s, "fr")}. Le profit la rapporte à tout le capital avancé : p′ = s/(c + v) = ${shown(s, "fr")}/${c + v} = ${p[1]} %. Comme c > 0, le taux de profit est toujours inférieur au taux de plus-value (Livre III, chapitres 2–3).`,
        `El plusvalor es el ${rate} % de v: s = ${shown(s, "es")}. La ganancia lo refiere a todo el capital adelantado: p′ = s/(c + v) = ${shown(s, "es")}/${c + v} = ${p[2]} %. Como c > 0, la tasa de ganancia es siempre inferior a la tasa de plusvalor (Libro III, capítulos 2–3).`,
      ],
    );
  }
};

const COMPOSITIONS: [number, number][] = [[80, 20], [70, 30], [60, 40], [85, 15], [90, 10], [75, 25], [95, 5]];

export const pricesOfProduction: Generator = (rng: Rng) => {
  for (;;) {
    const picked = rng.shuffle(COMPOSITIONS).slice(0, 3);
    const sizes = [rng.pick([1, 2]), rng.pick([1, 2, 3]), rng.pick([2, 3, 4])].map((k) => k * 100);
    if (new Set(sizes).size === 1) continue;
    const rate = rng.pick([100, 50, 200]);
    const capitals = picked.map(([c, v], i) => ({ c: (c * sizes[i]!) / 100, v: (v * sizes[i]!) / 100 }));
    const asked = rng.int(0, 2);
    const total = capitals.reduce((sum, k) => sum + k.c + k.v, 0);
    const surplus = capitals.reduce((sum, k) => sum + (k.v * rate) / 100, 0);
    const general = surplus / total;
    const me = capitals[asked]!;
    const size = me.c + me.v;
    const real = amount(size * (1 + general));
    const unweighted = capitals.reduce((sum, k) => sum + (k.v * rate) / 100 / (k.c + k.v), 0) / 3;
    const wrong = [
      amount(size + (me.v * rate) / 100, "marxValueNotPrice"),
      amount(size * (1 + unweighted), "marxUnweightedAverage"),
      amount(size * (1 + rate / 100), "marxSurplusRateAsProfit"),
      amount(size + general * me.v, "marxProfitOnWages"),
    ];
    if (!enough(real, wrong)) continue;
    const name = ["A", "B", "C"][asked]!;
    const block = [...capitals.map((k, i) => `${"ABC"[i]}:  ${capitalLine(k.c, k.v)}`), `s′ = ${rate} %`].join("\n");
    const g = n3(100 * general);
    const p = n3(size * (1 + general));
    return draft(
      `prices ${capitals.map((k) => `${k.c}+${k.v}`).join(" ")} ${rate} ${asked}`,
      [
        `Three branches have the capitals below, with the same rate of surplus value; each uses up all its constant capital in a year. Competition equalises the rate of profit. What is the price of production of branch ${name}'s product?`,
        `Trois branches ont les capitaux ci-dessous, avec le même taux de plus-value ; chacune use tout son capital constant en un an. La concurrence égalise le taux de profit. Quel est le prix de production du produit de la branche ${name} ?`,
        `Tres ramas tienen los capitales de abajo, con la misma tasa de plusvalor; cada una consume todo su capital constante en un año. La competencia iguala la tasa de ganancia. ¿Cuál es el precio de producción del producto de la rama ${name}?`,
      ],
      block,
      { type: "pricesOfProduction", capitals, rate, asked },
      real,
      wrong,
      [
        `The general rate of profit is total surplus value over total capital: ${shown(surplus, "en")}/${total} = ${g[0]}%, an average weighted by the size of each capital. Branch ${name} sells at its cost price plus that rate on its capital: ${size} × (1 + ${g[0]}%) = ${p[0]}, not at its value ${shown(size + (me.v * rate) / 100, "en")} (Volume III, chapter 9).`,
        `Le taux général de profit est la plus-value totale sur le capital total : ${shown(surplus, "fr")}/${total} = ${g[1]} %, une moyenne pondérée par la taille de chaque capital. La branche ${name} vend à son prix de revient plus ce taux sur son capital : ${size} × (1 + ${g[1]} %) = ${p[1]}, et non à sa valeur, ${shown(size + (me.v * rate) / 100, "fr")} (Livre III, chapitre 9).`,
        `La tasa general de ganancia es el plusvalor total sobre el capital total: ${shown(surplus, "es")}/${total} = ${g[2]} %, una media ponderada por el tamaño de cada capital. La rama ${name} vende a su precio de coste más esa tasa sobre su capital: ${size} × (1 + ${g[2]} %) = ${p[2]}, y no a su valor, ${shown(size + (me.v * rate) / 100, "es")} (Libro III, capítulo 9).`,
      ],
    );
  }
};

export const fallingRate: Generator = (rng: Rng) => {
  for (;;) {
    const composition = rng.pick([2, 3, 4]);
    const newComposition = rng.pick([5, 6, 7, 9]);
    const rate = 100;
    const newRate = rng.pick([100, 100, 120, 150, 200]);
    const before = rate / (composition + 1);
    const real = percent(newRate / (newComposition + 1));
    const wrong = [
      percent((before * composition) / newComposition, "marxProportional"),
      percent(newRate / newComposition, "marxOnConstant"),
      percent(rate / (newComposition + 1), "marxCounterIgnored"),
      percent(before, "marxOldRate"),
    ];
    if (!enough(real, wrong)) continue;
    const r = n3(newRate / (newComposition + 1));
    const b = n3(before);
    const raised: L3 =
      newRate === rate
        ? ["The rate of surplus value stays at 100%.", "Le taux de plus-value reste de 100 %.", "La tasa de plusvalor sigue en el 100 %."]
        : [`Meanwhile the rate of surplus value rises to ${newRate}%.`, `Dans le même temps, le taux de plus-value monte à ${newRate} %.`, `Al mismo tiempo, la tasa de plusvalor sube al ${newRate} %.`];
    return draft(
      `falling ${composition} ${newComposition} ${newRate}`,
      [
        `A capital's organic composition c/v rises from ${composition} to ${newComposition}, with a rate of surplus value of ${rate}% at the start. ${raised[0]} What is the new rate of profit?`,
        `La composition organique c/v d'un capital passe de ${composition} à ${newComposition}, avec un taux de plus-value de ${rate} % au départ. ${raised[1]} Quel est le nouveau taux de profit ?`,
        `La composición orgánica c/v de un capital pasa de ${composition} a ${newComposition}, con una tasa de plusvalor del ${rate} % al principio. ${raised[2]} ¿Cuál es la nueva tasa de ganancia?`,
      ],
      undefined,
      { type: "fallingRate", composition, newComposition, rate, newRate },
      real,
      wrong,
      [
        `Dividing by v: p′ = s/(c + v) = s′/(c/v + 1). Before, ${rate}%/${composition + 1} = ${b[0]}%; after, ${newRate}%/${newComposition + 1} = ${r[0]}%. A rising composition lowers the rate of profit unless the rate of surplus value rises enough to offset it: a tendency, with counteracting influences (Volume III, chapters 13–14).`,
        `En divisant par v : p′ = s/(c + v) = s′/(c/v + 1). Avant, ${rate} %/${composition + 1} = ${b[1]} % ; après, ${newRate} %/${newComposition + 1} = ${r[1]} %. Une composition qui monte fait baisser le taux de profit, sauf si le taux de plus-value monte assez pour compenser : c'est une tendance, avec des causes qui la contrarient (Livre III, chapitres 13–14).`,
        `Dividiendo por v: p′ = s/(c + v) = s′/(c/v + 1). Antes, ${rate} %/${composition + 1} = ${b[2]} %; después, ${newRate} %/${newComposition + 1} = ${r[2]} %. Una composición creciente hace bajar la tasa de ganancia, salvo que la tasa de plusvalor suba lo bastante para compensarlo: es una tendencia, con causas contrarrestantes (Libro III, capítulos 13–14).`,
      ],
    );
  }
};

const YIELDS = [[1, 2, 3, 4], [2, 3, 5, 6], [2, 4, 5, 8], [3, 4, 6, 9], [2, 3, 4, 6]];

export const differentialRent: Generator = (rng: Rng) => {
  for (;;) {
    const capital = rng.pick([50, 100, 200]);
    const profit = rng.pick([10, 20, 25]);
    const yields = rng.shuffle(rng.pick(YIELDS));
    const worst = Math.min(...yields);
    const asked = rng.int(0, 3);
    if (yields[asked] === worst) continue;
    const pp = capital * (1 + profit / 100);
    const price = pp / worst;
    const y = yields[asked]!;
    const real = amount(y * price - pp);
    const average = yields.reduce((a, b) => a + b, 0) / yields.length;
    const wrong = [
      amount(price - pp / y, "marxRentPerTonne"),
      amount(y * (pp / average) - pp, "marxAverageLand"),
      amount(y * price, "marxRentIsRevenue"),
      amount(y - worst, "marxRentInKind"),
    ].filter((o) => Number(o.tex) > 0);
    if (!enough(real, wrong)) continue;
    const name = "ABCD"[asked]!;
    const block = yields.map((t, i) => `${"ABCD"[i]}:  ${t} t`).join("\n");
    const pr = n3(price);
    const rr = n3(y * price - pp);
    const ppn = n3(pp);
    return draft(
      `rent ${capital} ${profit} ${yields.join(",")} ${asked}`,
      [
        `Four plots of land each take a capital of ${capital} a year; the general rate of profit is ${profit}%. Their yields of wheat, in tonnes, are below. All four are cultivated. What rent does the tenant of land ${name} pay?`,
        `Quatre terres demandent chacune un capital de ${capital} par an ; le taux général de profit est de ${profit} %. Leurs récoltes de blé, en tonnes, sont ci-dessous. Les quatre sont cultivées. Quelle rente le fermier de la terre ${name} paie-t-il ?`,
        `Cuatro tierras requieren cada una un capital de ${capital} al año; la tasa general de ganancia es del ${profit} %. Sus cosechas de trigo, en toneladas, están abajo. Las cuatro se cultivan. ¿Qué renta paga el arrendatario de la tierra ${name}?`,
      ],
      block,
      { type: "differentialRent", capital, profit, yields, asked },
      real,
      wrong,
      [
        `Each land's price of production is ${capital} + ${profit}% = ${ppn[0]}. The worst land in use, yielding ${worst} t, must cover it, so it sets the price: ${ppn[0]}/${worst} = ${pr[0]} a tonne. Land ${name} sells ${y} t for ${shown(y * price, "en")}; what it gets beyond its price of production, ${rr[0]}, goes to the landowner as differential rent (Volume III, chapter 39).`,
        `Le prix de production de chaque terre est ${capital} + ${profit} % = ${ppn[1]}. La plus mauvaise terre cultivée, qui donne ${worst} t, doit le couvrir, donc elle fixe le prix : ${ppn[1]}/${worst} = ${pr[1]} la tonne. La terre ${name} vend ${y} t pour ${shown(y * price, "fr")} ; ce qu'elle obtient au-delà de son prix de production, ${rr[1]}, va au propriétaire foncier comme rente différentielle (Livre III, chapitre 39).`,
        `El precio de producción de cada tierra es ${capital} + ${profit} % = ${ppn[2]}. La peor tierra cultivada, que da ${worst} t, debe cubrirlo, así que fija el precio: ${ppn[2]}/${worst} = ${pr[2]} la tonelada. La tierra ${name} vende ${y} t por ${shown(y * price, "es")}; lo que obtiene por encima de su precio de producción, ${rr[2]}, va al terrateniente como renta diferencial (Libro III, capítulo 39).`,
      ],
    );
  }
};

export const capitalised: Generator = (rng: Rng) => {
  for (;;) {
    const income = rng.pick([50, 120, 200, 300, 500]);
    const interest = rng.pick([2, 4, 5, 8]);
    const land = rng.pick([true, false]);
    const real = amount(income / (interest / 100));
    const wrong = [
      amount((income * interest) / 100, "marxRateMultiplied"),
      amount(income / interest, "marxPercentAsUnit"),
      amount(income * (1 + interest / 100), "marxIncomePlusInterest"),
    ];
    if (!enough(real, wrong)) continue;
    const p = n3(income / (interest / 100));
    const q: L3 = land
      ? [
          `A plot of land yields a ground rent of ${income} a year. The rate of interest is ${interest}%. At what price does the land sell?`,
          `Une terre rapporte une rente foncière de ${income} par an. Le taux d'intérêt est de ${interest} %. À quel prix la terre se vend-elle ?`,
          `Una tierra rinde una renta del suelo de ${income} al año. El tipo de interés es del ${interest} %. ¿A qué precio se vende la tierra?`,
        ]
      : [
          `A government bond pays ${income} a year. The rate of interest is ${interest}%. What is the bond's price on the market?`,
          `Une obligation d'État rapporte ${income} par an. Le taux d'intérêt est de ${interest} %. Quel est le prix de l'obligation sur le marché ?`,
          `Un bono del Estado paga ${income} al año. El tipo de interés es del ${interest} %. ¿Cuál es el precio del bono en el mercado?`,
        ];
    return draft(
      `capitalised ${income} ${interest} ${land ? "land" : "bond"}`,
      q,
      undefined,
      { type: "capitalised", income, interest },
      real,
      wrong,
      [
        `A regular income is priced as the capital that would yield it at the rate of interest: ${income} / ${interest}% = ${p[0]}. Neither land nor a bond's claim on taxes is a product of labour; their price is capitalised income, "fictitious capital" whose value rises when the rate of interest falls (Volume III, chapters 29 and 46).`,
        `Un revenu régulier vaut le capital qui le rapporterait au taux d'intérêt : ${income} / ${interest} % = ${p[1]}. Ni la terre ni la créance d'une obligation sur les impôts ne sont des produits du travail ; leur prix est un revenu capitalisé, un « capital fictif » qui monte quand le taux d'intérêt baisse (Livre III, chapitres 29 et 46).`,
        `Un ingreso regular vale el capital que lo rendiría al tipo de interés: ${income} / ${interest} % = ${p[2]}. Ni la tierra ni el derecho de un bono sobre los impuestos son productos del trabajo; su precio es un ingreso capitalizado, un «capital ficticio» que sube cuando baja el tipo de interés (Libro III, capítulos 29 y 46).`,
      ],
    );
  }
};
