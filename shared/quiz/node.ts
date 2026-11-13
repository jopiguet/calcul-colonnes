/**
 * Node.js and npm, at four levels: Débutant, Intermédiaire, Avancé, Expert,
 * in two groups: the platform (the runtime and its versions, modules, the
 * event loop and asynchrony, the built-in APIs) and the ecosystem
 * (package.json and semver, installing and lockfiles, publishing, security
 * and the supply chain).
 *
 * Written kinds only: lists in `node/<level>.ts`, in the Linux format, one
 * list per topic and level. A written list only grows: a new question gets
 * `since: <new QUIZ_VERSION>`.
 */
import type { Generator } from "./types";
import type { LinuxQuestion as NodeQuestion } from "./linux/types";
import { written } from "./linux";
import * as beginner from "./node/beginner";
import * as intermediate from "./node/intermediate";
import * as advanced from "./node/advanced";
import * as expert from "./node/expert";

export type { NodeQuestion };

const kinds = (lists: Record<string, readonly NodeQuestion[]>): Record<string, Generator> =>
  Object.fromEntries(Object.entries(lists).map(([name, list]) => [name, written(list)]));

const all = (level: Record<string, Record<string, readonly NodeQuestion[]>>): Record<string, readonly NodeQuestion[]> => Object.assign({}, ...Object.values(level));

/** Every written Node.js and npm question, by level, for the checks. */
export const NODE_QUESTIONS: Record<string, Record<string, readonly NodeQuestion[]>> = {
  beginner: all(beginner),
  intermediate: all(intermediate),
  advanced: all(advanced),
  expert: all(expert),
};

type Topic = "runtime" | "modules" | "async" | "apis" | "packages" | "deps" | "publish" | "security";

const byLevel = (topic: Topic) => ({
  nodeBeginner: kinds(beginner[topic]),
  nodeIntermediate: kinds(intermediate[topic]),
  nodeAdvanced: kinds(advanced[topic]),
  nodeExpert: kinds(expert[topic]),
});

export const ndRuntime = byLevel("runtime");
export const ndModules = byLevel("modules");
export const ndAsync = byLevel("async");
export const ndApis = byLevel("apis");
export const ndPackages = byLevel("packages");
export const ndDeps = byLevel("deps");
export const ndPublish = byLevel("publish");
export const ndSecurity = byLevel("security");
