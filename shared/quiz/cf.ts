/**
 * Cloudflare, at four levels: Débutant, Intermédiaire, Avancé, Expert, in
 * three groups: the network and security (DNS, SSL/TLS, cache, security),
 * the developer platform (Workers, storage), and Zero Trust and AI. Every
 * topic has written kinds at each level.
 *
 * - **Written** kinds: lists in `cf/<level>.ts`, in the Linux format.
 * - **Generated** kinds (`cf-output.ts`): rules-language matches, the order
 *   of the request phases, SSL/TLS modes, cache lifetimes, tunnel ingress,
 *   Access policies, the Workers and Workers AI bills; `check:quiz`
 *   recomputes each answer with its own evaluator (`server/check-cf.ts`).
 *
 * A written list only grows: a new question gets `since: <new QUIZ_VERSION>`.
 */
import type { Generator } from "./types";
import type { LinuxQuestion as CfQuestion } from "./linux/types";
import { written } from "./linux";
import * as beginner from "./cf/beginner";
import * as intermediate from "./cf/intermediate";
import * as advanced from "./cf/advanced";
import * as expert from "./cf/expert";
import { accessPolicy, aiCost, cacheTtlGen, phaseOrder, ruleMatch, tlsMode, tunnelIngress, workersCost } from "./cf-output";

export type { CfQuestion };

const kinds = (lists: Record<string, readonly CfQuestion[]>): Record<string, Generator> =>
  Object.fromEntries(Object.entries(lists).map(([name, list]) => [name, written(list)]));

const all = (level: Record<string, Record<string, readonly CfQuestion[]>>): Record<string, readonly CfQuestion[]> => Object.assign({}, ...Object.values(level));

/** Every written Cloudflare question, by level, for the checks. */
export const CF_QUESTIONS: Record<string, Record<string, readonly CfQuestion[]>> = {
  beginner: all(beginner),
  intermediate: all(intermediate),
  advanced: all(advanced),
  expert: all(expert),
};

type CfLevel = "cfBeginner" | "cfIntermediate" | "cfAdvanced" | "cfExpert";

const byLevel = (topic: "dns" | "tls" | "cache" | "security" | "workers" | "storage" | "zeroTrust" | "ai", extra: Partial<Record<CfLevel, Record<string, Generator>>> = {}) => ({
  cfBeginner: { ...kinds(beginner[topic]), ...extra.cfBeginner },
  cfIntermediate: { ...kinds(intermediate[topic]), ...extra.cfIntermediate },
  cfAdvanced: { ...kinds(advanced[topic]), ...extra.cfAdvanced },
  cfExpert: { ...kinds(expert[topic]), ...extra.cfExpert },
});

export const cfDns = byLevel("dns");
export const cfTls = byLevel("tls", { cfBeginner: { tlsMode }, cfIntermediate: { tlsMode } });
export const cfCache = byLevel("cache", { cfIntermediate: { cacheTtl: cacheTtlGen }, cfAdvanced: { cacheTtl: cacheTtlGen } });
export const cfSecurity = byLevel("security", { cfIntermediate: { ruleMatch }, cfAdvanced: { ruleMatch, phaseOrder }, cfExpert: { phaseOrder } });
export const cfWorkers = byLevel("workers", { cfIntermediate: { workersCost }, cfAdvanced: { workersCost } });
export const cfStorage = byLevel("storage");
export const cfZeroTrust = byLevel("zeroTrust", { cfIntermediate: { tunnelIngress }, cfAdvanced: { tunnelIngress, accessPolicy }, cfExpert: { accessPolicy } });
export const cfAi = byLevel("ai", { cfIntermediate: { aiCost } });
