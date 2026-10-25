/**
 * TypeScript, at four levels: Débutant, Intermédiaire, Avancé, Expert. A
 * topic has its own kinds at each level where it makes sense; `topicsFor`
 * offers a level the topics it has.
 *
 * - **Written** kinds: lists in `ts/<level>.ts`, in the Linux format.
 * - **Generated** kinds: a short program, and what it logs (`ts-output.ts`,
 *   type-checked with `tsc --strict` and run by `check:quiz`).
 *
 * A written list only grows: a new question gets `since: <new QUIZ_VERSION>`.
 */
import type { Generator } from "./types";
import type { LinuxQuestion as TsQuestion } from "./linux/types";
import { written } from "./linux";
import * as beginner from "./ts/beginner";
import * as intermediate from "./ts/intermediate";
import * as advanced from "./ts/advanced";
import * as expert from "./ts/expert";
import { arrayMethods, asyncOrder, closureLoop, copies, eventLoop, initOrder, nullish, numbers, typeofValues } from "./ts-output";

export type { TsQuestion };

const kinds = (lists: Record<string, readonly TsQuestion[]>): Record<string, Generator> =>
  Object.fromEntries(Object.entries(lists).map(([name, list]) => [name, written(list)]));

const all = (level: Record<string, Record<string, readonly TsQuestion[]>>): Record<string, readonly TsQuestion[]> => Object.assign({}, ...Object.values(level));

/** Every written TypeScript question, by level, for the checks. */
export const TS_QUESTIONS: Record<string, Record<string, readonly TsQuestion[]>> = {
  beginner: all(beginner),
  intermediate: all(intermediate),
  advanced: all(advanced),
  expert: all(expert),
};

export const tsBasics = {
  tsBeginner: { ...kinds(beginner.basics), arrayMethods },
  tsIntermediate: kinds(intermediate.basics),
};
export const tsFunctions = {
  tsBeginner: kinds(beginner.functionsTopic),
  tsIntermediate: kinds(intermediate.functionsTopic),
  tsAdvanced: { ...kinds(advanced.functionsTopic), closureLoop },
};
export const tsObjects = {
  tsBeginner: kinds(beginner.objects),
  tsIntermediate: kinds(intermediate.objects),
  tsAdvanced: kinds(advanced.objects),
  tsExpert: { ...kinds(expert.objects), initOrder },
};
export const tsNarrowing = {
  tsBeginner: kinds(beginner.narrowing),
  tsIntermediate: { ...kinds(intermediate.narrowing), typeofValues },
  tsAdvanced: kinds(advanced.narrowing),
};
export const tsGenerics = {
  tsIntermediate: kinds(intermediate.generics),
  tsAdvanced: kinds(advanced.generics),
};
export const tsTypeLevel = {
  tsAdvanced: kinds(advanced.typeLevel),
  tsExpert: kinds(expert.typeLevel),
};
export const tsRuntime = {
  tsBeginner: { ...kinds(beginner.runtime), nullish },
  tsIntermediate: { ...kinds(intermediate.runtime), eventLoop },
  tsAdvanced: { ...kinds(advanced.runtime), numbers, copies },
  tsExpert: { ...kinds(expert.runtime), asyncOrder },
};
export const tsTooling = {
  tsBeginner: kinds(beginner.tooling),
  tsIntermediate: kinds(intermediate.tooling),
  tsAdvanced: kinds(advanced.tooling),
  tsExpert: kinds(expert.tooling),
};
