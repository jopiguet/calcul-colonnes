/**
 * Deployment systems, at four levels: Débutant, Intermédiaire, Avancé,
 * Expert, in two groups: the foundations (pipelines and artifacts,
 * containers, release strategies, operations) and the tools (infrastructure
 * as code, Terraform, Kubernetes, GitOps and managed platforms).
 *
 * Written kinds only: lists in `deploy/<level>.ts`, in the Linux format, one
 * list per topic and level. A written list only grows: a new question gets
 * `since: <new QUIZ_VERSION>`.
 */
import type { Generator } from "./types";
import type { LinuxQuestion as DeployQuestion } from "./linux/types";
import { written } from "./linux";
import * as beginner from "./deploy/beginner";
import * as intermediate from "./deploy/intermediate";
import * as advanced from "./deploy/advanced";
import * as expert from "./deploy/expert";

export type { DeployQuestion };

const kinds = (lists: Record<string, readonly DeployQuestion[]>): Record<string, Generator> =>
  Object.fromEntries(Object.entries(lists).map(([name, list]) => [name, written(list)]));

const all = (level: Record<string, Record<string, readonly DeployQuestion[]>>): Record<string, readonly DeployQuestion[]> => Object.assign({}, ...Object.values(level));

/** Every written deployment question, by level, for the checks. */
export const DEPLOY_QUESTIONS: Record<string, Record<string, readonly DeployQuestion[]>> = {
  beginner: all(beginner),
  intermediate: all(intermediate),
  advanced: all(advanced),
  expert: all(expert),
};

type Topic = "pipeline" | "containers" | "strategies" | "operations" | "iac" | "terraform" | "kubernetes" | "gitops";

const byLevel = (topic: Topic) => ({
  deployBeginner: kinds(beginner[topic]),
  deployIntermediate: kinds(intermediate[topic]),
  deployAdvanced: kinds(advanced[topic]),
  deployExpert: kinds(expert[topic]),
});

export const depBasics = byLevel("pipeline");
export const depContainers = byLevel("containers");
export const depStrategies = byLevel("strategies");
export const depOperations = byLevel("operations");
export const depIac = byLevel("iac");
export const depTerraform = byLevel("terraform");
export const depKubernetes = byLevel("kubernetes");
export const depGitops = byLevel("gitops");
