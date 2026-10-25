/**
 * Google Cloud, at four levels: Débutant, Intermédiaire, Avancé, Expert, with
 * identity and access first (the resource hierarchy, IAM, service accounts,
 * security), then the infrastructure (networking, compute, storage,
 * operations). A topic has its own kinds at each level where it makes sense;
 * `topicsFor` offers a level the topics it has.
 *
 * - **Written** kinds: lists in `gcp/<level>.ts`, in the Linux format.
 * - **Generated** kinds (`gcp-output.ts`): IAM through the hierarchy with deny
 *   policies, firewall rules and policies, subnets, Cloud Run's scaling,
 *   availability; `check:quiz` recomputes each answer with its own evaluator.
 *
 * A written list only grows: a new question gets `since: <new QUIZ_VERSION>`.
 */
import type { Generator } from "./types";
import type { LinuxQuestion as GcpQuestion } from "./linux/types";
import { written } from "./linux";
import * as beginner from "./gcp/beginner";
import * as intermediate from "./gcp/intermediate";
import * as advanced from "./gcp/advanced";
import * as expert from "./gcp/expert";
import { availability, firewallPolicies, firewallRules, iamDeny, iamInheritance, runScaling, subnetAddresses, subnetNew } from "./gcp-output";

export type { GcpQuestion };

const kinds = (lists: Record<string, readonly GcpQuestion[]>): Record<string, Generator> =>
  Object.fromEntries(Object.entries(lists).map(([name, list]) => [name, written(list)]));

const all = (level: Record<string, Record<string, readonly GcpQuestion[]>>): Record<string, readonly GcpQuestion[]> => Object.assign({}, ...Object.values(level));

/** Every written Google Cloud question, by level, for the checks. */
export const GCP_QUESTIONS: Record<string, Record<string, readonly GcpQuestion[]>> = {
  beginner: all(beginner),
  intermediate: all(intermediate),
  advanced: all(advanced),
  expert: all(expert),
};

const byLevel = (topic: "hierarchy" | "iam" | "serviceAccounts" | "security" | "networking" | "compute" | "storage" | "operations", extra: Partial<Record<"gcpBeginner" | "gcpIntermediate" | "gcpAdvanced" | "gcpExpert", Record<string, Generator>>> = {}) => ({
  gcpBeginner: { ...kinds(beginner[topic]), ...extra.gcpBeginner },
  gcpIntermediate: { ...kinds(intermediate[topic]), ...extra.gcpIntermediate },
  gcpAdvanced: { ...kinds(advanced[topic]), ...extra.gcpAdvanced },
  gcpExpert: { ...kinds(expert[topic]), ...extra.gcpExpert },
});

export const gcpHierarchy = byLevel("hierarchy");
export const gcpIam = byLevel("iam", { gcpIntermediate: { iamInheritance }, gcpAdvanced: { iamDeny }, gcpExpert: { iamDeny } });
export const gcpServiceAccounts = byLevel("serviceAccounts");
export const gcpSecurity = byLevel("security");
export const gcpNetworking = byLevel("networking", {
  gcpBeginner: { subnetAddresses },
  gcpIntermediate: { subnetNew, firewallRules },
  gcpAdvanced: { firewallRules },
  gcpExpert: { firewallPolicies },
});
export const gcpCompute = byLevel("compute", { gcpBeginner: { runScaling }, gcpIntermediate: { runScaling } });
export const gcpStorage = byLevel("storage");
export const gcpOperations = byLevel("operations", { gcpAdvanced: { availability } });
