/**
 * What a generated question on Marx's Capital is about, as data: the
 * generator (`marx-output.ts`) computes the answer from it, and `check:quiz`
 * computes it again with its own evaluator (`server/check-marx.ts`). Each
 * option's `tex` is the answer as a number, rounded to one decimal; rates
 * are in per cent.
 *
 * Values are in hours of labour unless a question says money.
 */

/** One capital: its constant and variable parts. */
export interface MarxCapital {
  c: number;
  v: number;
}

export type MarxModel =
  /** Volume I, ch. 1. Groups of producers: their share of output (%) and hours per unit. Option: the hours of value in one unit. */
  | { type: "socialValue"; shares: number[]; hours: number[]; asked: number }
  /** Volume I, ch. 3. Option: the money needed in circulation. */
  | { type: "moneyQuantity"; prices: number; credit: number; due: number; offset: number; velocity: number }
  /** Volume I, ch. 7–8. One day: materials, a machine's value and life in days, hours worked, the day's value of labour-power. Option: the value of the day's product. */
  | { type: "productValue"; materials: number; machine: number; life: number; hours: number; labourPower: number }
  /** Volume I, ch. 9. Option: the rate of surplus value, %. */
  | { type: "surplusRate"; c: number; v: number; value: number }
  /** Volume I, ch. 10. A working day lengthened. Option: the new rate of surplus value, %. */
  | { type: "workingDay"; day: number; necessary: number; newDay: number }
  /** Volume I, ch. 12. Wage goods cheaper by `cheaper` %, the day unchanged. Option: the new rate of surplus value, %. */
  | { type: "relativeSurplus"; day: number; necessary: number; cheaper: number }
  /** Volume I, ch. 20. The day and the daily wage change. Option: the new price of an hour, in money. */
  | { type: "hourlyWage"; wage: number; day: number; newWage: number; newDay: number }
  /** Volume I, ch. 25. Accumulation at an unchanged composition c/v. Option: the workers added. */
  | { type: "accumulationSplit"; composition: number; added: number; wage: number }
  /** Volume II, ch. 16. Option: the surplus value produced in a year. */
  | { type: "turnover"; variable: number; turnovers: number; rate: number }
  /**
   * Volume II, ch. 20–21. `simple`: option, the constant capital Department II
   * must have for simple reproduction. `surplus`: option, the means of
   * production left for accumulation, I(v+s) − IIc.
   */
  | { type: "reproduction"; variant: "simple" | "surplus"; one: { c: number; v: number; s: number }; twoC: number }
  /** Volume III, ch. 2–3. Option: the rate of profit, %. */
  | { type: "profitRate"; c: number; v: number; rate: number }
  /** Volume III, ch. 9. Capitals (all constant capital used up), one rate of surplus value. Option: the price of production of capital `asked`. */
  | { type: "pricesOfProduction"; capitals: MarxCapital[]; rate: number; asked: number }
  /** Volume III, ch. 13. The composition c/v and the rate of surplus value change. Option: the new rate of profit, %. */
  | { type: "fallingRate"; composition: number; newComposition: number; rate: number; newRate: number }
  /** Volume III, ch. 39. Lands taking the same capital, at the general rate of profit (%), with their yields. Option: the rent of land `asked`. */
  | { type: "differentialRent"; capital: number; profit: number; yields: number[]; asked: number }
  /** Volume III, ch. 29 and 46. A yearly income capitalised at the rate of interest (%). Option: the price. */
  | { type: "capitalised"; income: number; interest: number };
