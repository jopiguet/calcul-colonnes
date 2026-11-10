/**
 * GitHub, at four levels: Débutant, Intermédiaire, Avancé, Expert, in two
 * groups: working together (repositories, issues and projects, pull
 * requests, organisations and process) and automation and safety (branch
 * protection and rulesets, Actions, the security of workflows, the supply
 * chain: Dependabot, code scanning, secret scanning).
 *
 * Written kinds only: lists in `github/<level>.ts`, in the Linux format, one
 * list per topic and level. A written list only grows: a new question gets
 * `since: <new QUIZ_VERSION>`.
 */
import type { Generator } from "./types";
import type { LinuxQuestion as GithubQuestion } from "./linux/types";
import { written } from "./linux";
import * as beginner from "./github/beginner";
import * as intermediate from "./github/intermediate";
import * as advanced from "./github/advanced";
import * as expert from "./github/expert";

export type { GithubQuestion };

const kinds = (lists: Record<string, readonly GithubQuestion[]>): Record<string, Generator> =>
  Object.fromEntries(Object.entries(lists).map(([name, list]) => [name, written(list)]));

const all = (level: Record<string, Record<string, readonly GithubQuestion[]>>): Record<string, readonly GithubQuestion[]> => Object.assign({}, ...Object.values(level));

/** Every written GitHub question, by level, for the checks. */
export const GITHUB_QUESTIONS: Record<string, Record<string, readonly GithubQuestion[]>> = {
  beginner: all(beginner),
  intermediate: all(intermediate),
  advanced: all(advanced),
  expert: all(expert),
};

type Topic = "repos" | "issues" | "pulls" | "teams" | "protection" | "actions" | "security" | "supply";

const byLevel = (topic: Topic) => ({
  githubBeginner: kinds(beginner[topic]),
  githubIntermediate: kinds(intermediate[topic]),
  githubAdvanced: kinds(advanced[topic]),
  githubExpert: kinds(expert[topic]),
});

export const ghRepos = byLevel("repos");
export const ghIssues = byLevel("issues");
export const ghPulls = byLevel("pulls");
export const ghTeams = byLevel("teams");
export const ghProtection = byLevel("protection");
export const ghActions = byLevel("actions");
export const ghSecurity = byLevel("security");
export const ghSupply = byLevel("supply");
