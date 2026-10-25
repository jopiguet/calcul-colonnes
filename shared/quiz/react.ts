/**
 * React, at four levels: Débutant, Intermédiaire, Avancé, Expert. Components,
 * state, effects and rendering, then the stack around them: data, types,
 * tooling (Vite, deployment) and tests. A topic has its own kinds at each
 * level where it makes sense; `topicsFor` offers a level the topics it has.
 *
 * - **Written** kinds: lists in `react/<level>.ts`, in the Linux format.
 * - **Generated** kinds: a short component, and what the page or the console
 *   shows (`react-output.ts`, type-checked with `tsc --strict` and rendered
 *   with React DOM by `check:quiz`).
 *
 * A written list only grows: a new question gets `since: <new QUIZ_VERSION>`.
 */
import type { Generator } from "./types";
import type { LinuxQuestion as ReactQuestion } from "./linux/types";
import { written } from "./linux";
import * as beginner from "./react/beginner";
import * as intermediate from "./react/intermediate";
import * as advanced from "./react/advanced";
import * as expert from "./react/expert";
import { batching, cleanupOrder, clickCounter, conditionalRender, defaultProps, effectOrder, keyReset, layoutEffects, memoChild, refCounter, staleLog, strictEffects } from "./react-output";

export type { ReactQuestion };

const kinds = (lists: Record<string, readonly ReactQuestion[]>): Record<string, Generator> =>
  Object.fromEntries(Object.entries(lists).map(([name, list]) => [name, written(list)]));

const all = (level: Record<string, Record<string, readonly ReactQuestion[]>>): Record<string, readonly ReactQuestion[]> => Object.assign({}, ...Object.values(level));

/** Every written React question, by level, for the checks. */
export const REACT_QUESTIONS: Record<string, Record<string, readonly ReactQuestion[]>> = {
  beginner: all(beginner),
  intermediate: all(intermediate),
  advanced: all(advanced),
  expert: all(expert),
};

export const reactComponents = {
  reactBeginner: { ...kinds(beginner.components), conditionalRender, defaultProps },
  reactIntermediate: kinds(intermediate.components),
  reactAdvanced: kinds(advanced.components),
  reactExpert: kinds(expert.components),
};
export const reactState = {
  reactBeginner: { ...kinds(beginner.state), clickCounter },
  reactIntermediate: { ...kinds(intermediate.state), staleLog },
  reactAdvanced: { ...kinds(advanced.state), keyReset },
  reactExpert: kinds(expert.state),
};
export const reactEffects = {
  reactBeginner: kinds(beginner.effects),
  reactIntermediate: { ...kinds(intermediate.effects), effectOrder },
  reactAdvanced: { ...kinds(advanced.effects), cleanupOrder, refCounter },
  reactExpert: { ...kinds(expert.effects), strictEffects, layoutEffects },
};
export const reactRendering = {
  reactBeginner: kinds(beginner.rendering),
  reactIntermediate: { ...kinds(intermediate.rendering), batching },
  reactAdvanced: { ...kinds(advanced.rendering), memoChild },
  reactExpert: kinds(expert.rendering),
};
export const reactData = {
  reactBeginner: kinds(beginner.data),
  reactIntermediate: kinds(intermediate.data),
  reactAdvanced: kinds(advanced.data),
  reactExpert: kinds(expert.data),
};
export const reactTyping = {
  reactBeginner: kinds(beginner.typing),
  reactIntermediate: kinds(intermediate.typing),
  reactAdvanced: kinds(advanced.typing),
  reactExpert: kinds(expert.typing),
};
export const reactTooling = {
  reactBeginner: kinds(beginner.tooling),
  reactIntermediate: kinds(intermediate.tooling),
  reactAdvanced: kinds(advanced.tooling),
  reactExpert: kinds(expert.tooling),
};
export const reactTesting = {
  reactBeginner: kinds(beginner.testing),
  reactIntermediate: kinds(intermediate.testing),
  reactAdvanced: kinds(advanced.testing),
  reactExpert: kinds(expert.testing),
};
