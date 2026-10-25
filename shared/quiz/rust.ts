/**
 * Rust, at four levels: Débutant, Intermédiaire, Avancé, Expert. A topic has
 * its own kinds at each level where it makes sense (async and FFI only at
 * Expert, the basics only at the first two levels); `topicsFor` offers a
 * level the topics it has.
 *
 * - **Written** kinds: lists in `rust/<level>.ts`, in the Linux format.
 * - **Generated** kinds: a short program, and what it prints
 *   (`rust-output.ts`, compiled and run by `check:quiz` with `rustc`).
 *
 * A written list only grows: a new question gets `since: <new QUIZ_VERSION>`.
 */
import type { Generator } from "./types";
import type { LinuxQuestion as RustQuestion } from "./linux/types";
import { written } from "./linux";
import * as beginner from "./rust/beginner";
import * as intermediate from "./rust/intermediate";
import * as advanced from "./rust/advanced";
import * as expert from "./rust/expert";
import { dropOrderKind, integerOps, iteratorChain, matchArms, optionCombinators, shadowing, sortDedup, stringLength } from "./rust-output";

export type { RustQuestion };

const kinds = (lists: Record<string, readonly RustQuestion[]>): Record<string, Generator> =>
  Object.fromEntries(Object.entries(lists).map(([name, list]) => [name, written(list)]));

/** Every list of a level's file, by name. */
const all = (level: Record<string, Record<string, readonly RustQuestion[]>>): Record<string, readonly RustQuestion[]> => Object.assign({}, ...Object.values(level));

/** Every written Rust question, by level, for the checks. */
export const RUST_QUESTIONS: Record<string, Record<string, readonly RustQuestion[]>> = {
  beginner: all(beginner),
  intermediate: all(intermediate),
  advanced: all(advanced),
  expert: all(expert),
};

export const rustBasics = {
  rustBeginner: { ...kinds(beginner.basics), integerOps, shadowing },
  rustIntermediate: { ...kinds(intermediate.basics), stringLength },
};
export const rustOwnership = {
  rustBeginner: kinds(beginner.ownership),
  rustIntermediate: kinds(intermediate.ownership),
  rustAdvanced: kinds(advanced.ownership),
  rustExpert: { ...kinds(expert.ownership), dropOrder: dropOrderKind },
};
export const rustTypes = {
  rustBeginner: kinds(beginner.typesTopic),
  rustIntermediate: { ...kinds(intermediate.typesTopic), matchArms },
  rustAdvanced: { ...kinds(advanced.typesTopic), optionCombinators },
  rustExpert: kinds(expert.typesTopic),
};
export const rustErrors = {
  rustBeginner: kinds(beginner.errors),
  rustIntermediate: kinds(intermediate.errors),
  rustAdvanced: kinds(advanced.errors),
};
export const rustCollections = {
  rustBeginner: kinds(beginner.collections),
  rustIntermediate: { ...kinds(intermediate.collections), iteratorChain },
  rustAdvanced: { ...kinds(advanced.collections), sortDedup },
};
export const rustConcurrency = {
  rustIntermediate: kinds(intermediate.concurrency),
  rustAdvanced: kinds(advanced.concurrency),
  rustExpert: kinds(expert.concurrency),
};
export const rustCargo = {
  rustBeginner: kinds(beginner.cargo),
  rustIntermediate: kinds(intermediate.cargo),
  rustAdvanced: kinds(advanced.cargo),
  rustExpert: kinds(expert.cargo),
};
export const rustUnsafe = {
  rustAdvanced: kinds(advanced.unsafeTopic),
  rustExpert: kinds(expert.unsafeTopic),
};
