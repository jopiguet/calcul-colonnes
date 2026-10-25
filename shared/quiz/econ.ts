/**
 * Public and labour economics, at two levels: Fondamentaux (core) and Avancé
 * (advanced), in nine topics. The concept questions come from the question
 * bank (one unit per book chapter, `bank.ts`); the generated kinds here
 * (`econ-output.ts`) put numbers on the classic diagrams, and `check:quiz`
 * recomputes each answer with its own evaluator (`server/check-econ.ts`).
 */
import type { Generator } from "./types";
import { benefitTrap, giniLorenz, insurancePremium, medianVoter, monopsony, pigou, ramsey, saezTopRate, samuelson, surplusAreas, swfChoice, taxIncidence, taxSchedule } from "./econ-output";

type ByLevel = { econ: Record<string, Generator>; econAdvanced: Record<string, Generator> };
const both = (kinds: Record<string, Generator>, advanced: Record<string, Generator> = kinds): ByLevel => ({ econ: kinds, econAdvanced: advanced });

export const econWelfare = both({ swfChoice });
export const econMarketFailure = both({ pigou, samuelson });
export const econPublicChoice = both({ medianVoter });
export const econIncidence = both({ taxIncidence, surplusAreas }, { taxIncidence });
export const econOptimalTax = both({ ramsey }, { ramsey, saezTopRate });
export const econTaxDesign = both({ taxSchedule });
export const econSocialInsurance = both({ insurancePremium });
export const econRedistribution = both({ giniLorenz, benefitTrap });
export const econLabour = both({ monopsony });
