/**
 * The answers to generated questions on Marx's Capital, computed again for
 * `check:quiz` without the generator's code, from the definitions in the
 * course (src/courses/marx):
 *
 * - value: output-weighted average of the hours per unit (Volume I, ch. 1);
 * - money: (prices − credit + payments due − offsets) / velocity (ch. 3);
 * - a day's product: materials + machine/life + hours worked (ch. 7–8);
 * - s′ = s/v; with a day and necessary labour, (day − necessary)/necessary;
 *   cheaper wage goods shrink necessary labour (ch. 9–12);
 * - hourly wage = daily wage / hours (ch. 20); accumulation at c/v = k puts
 *   1/(k + 1) into v (ch. 25);
 * - annual surplus value = s′ · v · turnovers (Volume II, ch. 16);
 * - simple reproduction IIc = I(v + s); surplus means of production
 *   I(v + s) − IIc (ch. 20–21);
 * - p′ = s/(c + v); price of production = capital × (1 + Σs/ΣC);
 *   p′ = s′/(c/v + 1) (Volume III, ch. 2–13);
 * - differential rent: the worst land sets the price (ch. 39); capitalised
 *   income = income / rate of interest (ch. 29, 46).
 */
import type { MarxModel } from "../shared/quiz/index.ts";

/** The form of every option: a number with at most `places` decimals, no trailing zeros. */
function canonical(x: number, places = 1): string {
  const scaled = Math.round(x * 10 ** places);
  const text = (scaled / 10 ** places).toString();
  return text === "-0" ? "0" : text;
}

export function marxAnswer(m: MarxModel): string {
  switch (m.type) {
    case "socialValue": {
      let hours = 0;
      let share = 0;
      m.shares.forEach((s, i) => {
        hours += s * m.hours[i]!;
        share += s;
      });
      return canonical(hours / share);
    }
    case "moneyQuantity":
      return canonical((m.prices - m.credit + m.due - m.offset) / m.velocity);
    case "productValue":
      return canonical(m.materials + m.machine / m.life + m.hours);
    case "surplusRate": {
      const s = m.value - m.c - m.v;
      return canonical((s / m.v) * 100);
    }
    case "workingDay": {
      const surplusLabour = m.newDay - m.necessary;
      return canonical((surplusLabour / m.necessary) * 100);
    }
    case "relativeSurplus": {
      const necessary = m.necessary * (1 - m.cheaper / 100);
      return canonical(((m.day - necessary) / necessary) * 100);
    }
    case "hourlyWage":
      return canonical(m.newWage / m.newDay, 2);
    case "accumulationSplit": {
      const toWages = m.added / (m.composition + 1);
      return canonical(toWages / m.wage);
    }
    case "turnover":
      return canonical(m.variable * m.turnovers * (m.rate / 100));
    case "reproduction": {
      const oneVS = m.one.v + m.one.s;
      return canonical(m.variant === "simple" ? oneVS : oneVS - m.twoC);
    }
    case "profitRate": {
      const s = (m.v * m.rate) / 100;
      return canonical((s / (m.c + m.v)) * 100);
    }
    case "pricesOfProduction": {
      let surplus = 0;
      let capital = 0;
      for (const k of m.capitals) {
        surplus += (k.v * m.rate) / 100;
        capital += k.c + k.v;
      }
      const mine = m.capitals[m.asked]!;
      return canonical((mine.c + mine.v) * (1 + surplus / capital));
    }
    case "fallingRate":
      return canonical(m.newRate / (m.newComposition + 1));
    case "differentialRent": {
      const pricePerLand = m.capital + (m.capital * m.profit) / 100;
      const regulating = pricePerLand / Math.min(...m.yields);
      return canonical(m.yields[m.asked]! * regulating - pricePerLand);
    }
    case "capitalised":
      return canonical((m.income * 100) / m.interest);
  }
}
