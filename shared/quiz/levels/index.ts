/**
 * Written questions added with the four levels (QUIZ_VERSION 5), by topic and
 * level step (0 Débutant, 1 Intermédiaire, 2 Avancé, 3 Expert), each list a
 * kind of question: `basics` at Débutant, `expert` at Expert. See standard.ts.
 */
import type { LinuxQuestion } from "../linux/types";
import type { Topic } from "../types";
import { LINUX_EXPERT } from "./linux";
import { SQL_EXPERT } from "./sql";
import { ECON_LEVEL_LISTS } from "./econ";
import { CALC_LEVEL_LISTS } from "./calc";
import { MARX_LEVEL_LISTS } from "./marx";
import { CHEMBIO_LEVEL_LISTS } from "./chembio";

export type LevelLists = Partial<Record<Topic, Partial<Record<0 | 1 | 2 | 3, Record<string, readonly LinuxQuestion[]>>>>>;

const expertOnly = (lists: Record<string, Record<string, readonly LinuxQuestion[]>>): LevelLists =>
  Object.fromEntries(Object.entries(lists).map(([topic, named]) => [topic, { 3: named }]));

export const LEVEL_LISTS: LevelLists = {
  ...expertOnly(LINUX_EXPERT),
  ...expertOnly(SQL_EXPERT),
  ...ECON_LEVEL_LISTS,
  ...CALC_LEVEL_LISTS,
  ...MARX_LEVEL_LISTS,
  ...CHEMBIO_LEVEL_LISTS,
};

/** Every list, for the checks: subject prefix → topic → kind → questions. */
export const LEVEL_QUESTIONS: Record<string, readonly LinuxQuestion[]> = Object.fromEntries(
  Object.entries(LEVEL_LISTS).flatMap(([topic, steps]) =>
    Object.values(steps ?? {}).flatMap((named) => Object.entries(named ?? {}).map(([kind, list]) => [`${topic}.${kind}`, list] as const)),
  ),
);
