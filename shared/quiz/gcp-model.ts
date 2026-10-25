/**
 * What a generated Google Cloud question is about, as data: the generator
 * (`gcp-output.ts`) computes the answer from it, and `check:quiz` computes it
 * again with its own evaluator (`server/check-gcp.ts`) to check the options.
 * Each option's formula (`tex`) is the answer in a canonical form.
 */

/** An IPv4 range, "10.0.0.0/24". */
export type Cidr = string;

/** A firewall rule, ingress only. `ports` is "tcp:22", "tcp" (every TCP port) or "all". `tags`: target tags; none means every instance. */
export interface FwRule {
  name: string;
  priority: number;
  action: "allow" | "deny" | "goto_next";
  sources: Cidr[];
  ports: string;
  tags?: string[];
}

/** One step of the evaluation: a hierarchical policy, the VPC firewall rules, a network policy. */
export interface FwStep {
  name: string;
  /** VPC firewall rules: at most one priority wins, and between an allow and a deny of that priority, deny. */
  vpc?: boolean;
  rules: FwRule[];
}

/** A TCP packet arriving at a VM. */
export interface FwPacket {
  source: string;
  port: number;
  tags: string[];
}

/** The four object permissions asked about, in their display order. */
export const OBJECT_PERMISSIONS = ["get", "list", "create", "delete"] as const;
export type ObjectPermission = (typeof OBJECT_PERMISSIONS)[number];

/** The levels of the resource hierarchy, top first. */
export const IAM_LEVELS = ["org", "folder", "project", "bucket"] as const;
export type IamLevel = (typeof IAM_LEVELS)[number];

export interface IamAllow {
  level: IamLevel;
  member: string; // "user:alice", "group:devs"
  role: string; // "roles/storage.objectViewer"
}

export interface IamDeny {
  level: IamLevel;
  principals: string[];
  exceptions: string[];
  permissions: ObjectPermission[];
}

export type GcpModel =
  /** Option: how many addresses VMs can use in the subnet's primary range. */
  | { type: "subnetUsable"; cidr: Cidr }
  /** Option: "first-last", the addresses VMs can get. */
  | { type: "subnetRange"; cidr: Cidr }
  /** Option: a candidate primary range; right if valid and overlapping no existing subnet of the VPC. */
  | { type: "subnetNew"; existing: Cidr[] }
  /** Option: "allow:rule", "deny:rule", or "deny:implied" / "allow:implied". */
  | { type: "firewall"; steps: FwStep[]; packet: FwPacket }
  /** Option: the permissions `user` ends up with on the bucket's objects, in OBJECT_PERMISSIONS order, or "none". */
  | { type: "iam"; user: string; groups: string[]; allows: IamAllow[]; denies: IamDeny[] }
  /** Option: the fewest instances Cloud Run needs. */
  | { type: "runInstances"; requests: number; concurrency: number; minInstances: number }
  /** Option: the most requests served at once. */
  | { type: "runCapacity"; maxInstances: number; concurrency: number }
  /** Option: the availability in percent, four decimals. */
  | { type: "availability"; parts: number[]; layout: "series" | "parallel" };
