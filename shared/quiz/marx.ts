/**
 * Marx's Capital, at three levels: Débutant, Intermédiaire, Avancé, in
 * twelve topics that follow the twelve parts of the course (src/courses/marx)
 * and three groups: Volume I's value and surplus value, Volume I's
 * production and accumulation, Volumes II and III.
 *
 * - **Written** kinds: lists in `marx/<level>.ts`, in the Linux format.
 * - **Generated** kinds (`marx-output.ts`): the computations of the three
 *   volumes; `check:quiz` recomputes each answer with its own evaluator
 *   (`server/check-marx.ts`).
 *
 * A written list only grows: a new question gets `since: <new QUIZ_VERSION>`.
 */
import type { Generator } from "./types";
import type { LinuxQuestion as MarxQuestion } from "./linux/types";
import { written } from "./linux";
import * as beginner from "./marx/beginner";
import * as intermediate from "./marx/intermediate";
import * as advanced from "./marx/advanced";
import {
  accumulationSplit,
  capitalised,
  differentialRent,
  fallingRate,
  hourlyWage,
  moneyQuantity,
  pricesOfProduction,
  productValue,
  profitRate,
  relativeSurplus,
  reproductionSimple,
  reproductionSurplus,
  socialValue,
  surplusRate,
  turnover,
  workingDay,
} from "./marx-output";

export type { MarxQuestion };

const kinds = (lists: Record<string, readonly MarxQuestion[]>): Record<string, Generator> =>
  Object.fromEntries(Object.entries(lists).map(([name, list]) => [name, written(list)]));

const all = (level: Record<string, Record<string, readonly MarxQuestion[]>>): Record<string, readonly MarxQuestion[]> => Object.assign({}, ...Object.values(level));

/** Every written question on Capital, by level, for the checks. */
export const MARX_QUESTIONS: Record<string, Record<string, readonly MarxQuestion[]>> = {
  beginner: all(beginner),
  intermediate: all(intermediate),
  advanced: all(advanced),
};

type MarxLevel = "marxBeginner" | "marxIntermediate" | "marxAdvanced";
type Part = keyof typeof beginner;

const byLevel = (part: Part, extra: Partial<Record<MarxLevel, Record<string, Generator>>> = {}) => ({
  marxBeginner: { ...kinds(beginner[part]), ...extra.marxBeginner },
  marxIntermediate: { ...kinds(intermediate[part]), ...extra.marxIntermediate },
  marxAdvanced: { ...kinds(advanced[part]), ...extra.marxAdvanced },
});

export const marxCommodity = byLevel("commodity", { marxIntermediate: { socialValue }, marxAdvanced: { socialValue } });
export const marxMoney = byLevel("money", { marxIntermediate: { moneyQuantity }, marxAdvanced: { moneyQuantity } });
export const marxSurplus = byLevel("surplus", {
  marxBeginner: { productValue, surplusRate },
  marxIntermediate: { productValue, surplusRate },
  marxAdvanced: { productValue },
});
export const marxWorkingDay = byLevel("workingDay", { marxBeginner: { workingDay }, marxIntermediate: { workingDay } });
export const marxRelative = byLevel("relative", { marxIntermediate: { relativeSurplus }, marxAdvanced: { relativeSurplus } });
export const marxWages = byLevel("wages", { marxIntermediate: { hourlyWage }, marxAdvanced: { hourlyWage } });
export const marxAccumulation = byLevel("accumulation", { marxIntermediate: { accumulationSplit }, marxAdvanced: { accumulationSplit } });
export const marxPrimitive = byLevel("primitive");
export const marxCirculation = byLevel("circulation", { marxIntermediate: { turnover }, marxAdvanced: { turnover } });
export const marxReproduction = byLevel("reproduction", {
  marxBeginner: { reproductionSimple },
  marxIntermediate: { reproductionSimple, reproductionSurplus },
  marxAdvanced: { reproductionSurplus },
});
export const marxProfit = byLevel("profit", {
  marxBeginner: { profitRate },
  marxIntermediate: { profitRate, pricesOfProduction },
  marxAdvanced: { pricesOfProduction, fallingRate },
});
export const marxCredit = byLevel("credit", { marxIntermediate: { capitalised, differentialRent }, marxAdvanced: { differentialRent, capitalised } });
