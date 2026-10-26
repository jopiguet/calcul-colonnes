/**
 * Calculus, at two levels: Fondamentaux (core) and Avancé (advanced), in
 * thirteen topics following Stewart's chapters. The concept questions come
 * from the question bank (one unit per chapter of each book, `bank.ts`); the
 * generated kinds here (`calc-output.ts`) are read on graphs or computed, and
 * `check:quiz` recomputes each answer with its own evaluator
 * (`server/check-calc.ts`).
 */
import type { Generator } from "./types";
import {
  areaFunction, brownianMoments, classifyCritical, crossArea, directionalDerivative, epsilonDelta, eulerMethod, extremaFromDerivative,
  geometricBrownian, geometricSeries, greenCirculation, halfLife, improperIntegral, itoFormula, lhopital, limitGraph, logisticHarvest,
  netArea, newtonMethod, numericIntegral, parametricSlope, polarRose, riemannSum, secantSlope, slopeField, tangentLine, taylorGraph, vectorAngle,
} from "./calc-output";

type ByLevel = { calc: Record<string, Generator>; calcAdvanced: Record<string, Generator> };
const both = (kinds: Record<string, Generator>, advanced: Record<string, Generator> = kinds): ByLevel => ({ calc: kinds, calcAdvanced: advanced });

export const calcLimits = both({ limitGraph }, { limitGraph, epsilonDelta });
export const calcDerivatives = both({ secantSlope, tangentLine });
export const calcApplications = both({ extremaFromDerivative, newtonMethod });
export const calcIntegrals = both({ riemannSum, netArea, areaFunction });
export const calcTranscendental = both({ halfLife, lhopital });
export const calcTechniques = both({ numericIntegral, improperIntegral });
export const calcOde = both({ eulerMethod, slopeField, logisticHarvest });
export const calcParametric = both({ polarRose, parametricSlope });
export const calcSeries = both({ geometricSeries, taylorGraph });
export const calcVectors = both({ vectorAngle, crossArea });
export const calcMultivariable = both({ directionalDerivative, classifyCritical });
export const calcVectorCalculus = both({ greenCirculation });
export const calcStochastic = both({ brownianMoments }, { brownianMoments, itoFormula, geometricBrownian });
