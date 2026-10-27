/**
 * What a generated Cloudflare question is about, as data: the generator
 * (`cf-output.ts`) computes the answer from it, and `check:quiz` computes it
 * again with its own evaluator (`server/check-cf.ts`). Each option's `tex`
 * is the answer in a canonical form.
 */

/** A request in a rules-language question: the host is always the same. */
export interface CfRequest {
  label: string;
  method: string;
  path: string;
  country: string;
}

/** A product of the request phases that is configured on the zone, and whether it acts on this request. */
export interface CfPhaseRule {
  product: "singleRedirect" | "customRule" | "rateLimit" | "managedRules" | "superBotFightMode" | "access" | "bulkRedirect" | "cacheRule";
  /** Whether the rule's expression matches the request. */
  matches: boolean;
}

export type CfOrigin = "publicCert" | "originCa" | "selfSigned" | "expired" | "httpOnly";

export interface CfIngress {
  hostname?: string;
  /** A regular expression on the path, as cloudflared takes it. */
  path?: string;
  service: string;
}

export type CfSelector =
  | { kind: "emailDomain"; value: string }
  | { kind: "email"; value: string }
  | { kind: "group"; value: string }
  | { kind: "country"; value: string }
  | { kind: "posture"; value: "encrypted" }
  | { kind: "everyone" };

export interface CfPolicy {
  name: string;
  action: "allow" | "block" | "bypass";
  include: CfSelector[];
  require: CfSelector[];
  exclude: CfSelector[];
}

export interface CfUser {
  email: string;
  groups: string[];
  country: string;
  encrypted: boolean;
}

export type CfModel =
  /** Option: the labels of the requests the expression matches, "A C", or "none". */
  | { type: "ruleMatch"; expression: string; requests: CfRequest[] }
  /** Option: the product that decides the request's fate, or "origin" if none stops it. */
  | { type: "phaseOrder"; rules: CfPhaseRule[] }
  /** Option: "loop", "plain", "unchecked", "strict", "526". */
  | { type: "tlsMode"; mode: "flexible" | "full" | "strict"; origin: CfOrigin; redirects: boolean }
  /** Option: "none", or "e<edge seconds> b<browser seconds>". */
  | { type: "cacheTtl"; extension: string; cacheControl: string; setCookie: boolean; cacheRule: boolean }
  /** Option: the service of the first matching ingress rule. */
  | { type: "tunnelIngress"; rules: CfIngress[]; host: string; path: string }
  /** Option: "allow:<policy>", "block:<policy>", "bypass:<policy>" or "deny:default". */
  | { type: "accessPolicy"; policies: CfPolicy[]; user: CfUser }
  /** Option: the month's bill in dollars, two decimals. */
  | { type: "workersCost"; millionRequests: number; cpuMs: number; wallMs: number }
  /** Option: the month's bill in dollars, two decimals. */
  | { type: "aiCost"; neuronsPerDay: number; days: number };
