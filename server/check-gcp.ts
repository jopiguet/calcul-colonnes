/**
 * The answers to generated Google Cloud questions, computed again for
 * `check:quiz` without the generator's code: subnets with BigInt arithmetic
 * and Node's `net.BlockList`, firewall decisions by sorting every rule, IAM by
 * building the set of principals and permissions, Cloud Run and availability
 * by their formulas. The rules follow Google's documentation:
 *
 * - subnets: the primary range reserves the first two and last two addresses;
 *   /29 is the smallest; ranges may not overlap within a VPC network; some
 *   ranges are prohibited (0.0.0.0/8, 127.0.0.0/8, 169.254.0.0/16,
 *   224.0.0.0/4, 255.255.255.255/32);
 * - firewalls: hierarchical policies, then VPC rules, then network policies
 *   (default order); in a step the lowest priority number decides, `goto_next`
 *   or no match passes on; in VPC rules a deny beats an allow of the same
 *   priority; at the end ingress is denied;
 * - IAM: allow policies are inherited and add up; deny policies, checked
 *   first, remove permissions from their principals except the exceptions.
 */
import { BlockList } from "node:net";
import type { GcpModel } from "../shared/quiz/index.ts";

const ipToBig = (ip: string): bigint => ip.split(".").reduce((acc, part) => (acc << 8n) | BigInt(Number(part)), 0n);
const bigToIp = (n: bigint): string => [24n, 16n, 8n, 0n].map((s) => String((n >> s) & 255n)).join(".");

function range(cidr: string): { first: bigint; last: bigint; prefix: number; ip: string } {
  const [ip, p] = cidr.split("/");
  const prefix = Number(p);
  const size = 1n << BigInt(32 - prefix);
  const first = ipToBig(ip!);
  return { first, last: first + size - 1n, prefix, ip: ip! };
}

function blockOf(cidr: string): BlockList {
  const list = new BlockList();
  const { ip, prefix } = range(cidr);
  list.addSubnet(ip, prefix, "ipv4");
  return list;
}

const PROHIBITED = ["0.0.0.0/8", "127.0.0.0/8", "169.254.0.0/16", "224.0.0.0/4", "255.255.255.255/32"];

/** Whether `candidate` can be the primary range of a new subnet beside `existing`. */
export function validNewSubnet(existing: string[], candidate: string): boolean {
  const c = range(candidate);
  if (c.prefix > 29) return false;
  // The address must be the range's network address.
  if ((c.first & ((1n << BigInt(32 - c.prefix)) - 1n)) !== 0n) return false;
  const overlaps = (a: string, b: string): boolean => blockOf(a).check(range(b).ip, "ipv4") || blockOf(b).check(range(a).ip, "ipv4");
  if (PROHIBITED.some((p) => overlaps(p, candidate))) return false;
  return !existing.some((e) => overlaps(e, candidate));
}

type Rule = Extract<GcpModel, { type: "firewall" }>["steps"][number]["rules"][number];

function matches(rule: Rule, packet: Extract<GcpModel, { type: "firewall" }>["packet"]): boolean {
  const fromSource = rule.sources.some((s) => blockOf(s).check(packet.source, "ipv4"));
  const m = /^(all|tcp)(?::(\d+))?$/.exec(rule.ports);
  if (!m) throw new Error(`ports not understood: ${rule.ports}`);
  const port = m[1] === "all" || m[2] === undefined || Number(m[2]) === packet.port;
  const target = rule.tags === undefined || rule.tags.length === 0 || rule.tags.some((t) => packet.tags.includes(t));
  return fromSource && port && target;
}

function firewall(m: Extract<GcpModel, { type: "firewall" }>): string {
  // The steps come in evaluation order: hierarchical (organisation, folder), VPC rules, network policies.
  for (const step of m.steps) {
    const sorted = [...step.rules]
      .filter((r) => matches(r, m.packet))
      .sort((a, b) => a.priority - b.priority || (step.vpc ? (a.action === "deny" ? -1 : 0) - (b.action === "deny" ? -1 : 0) : 0));
    const decisive = sorted[0];
    if (!decisive || decisive.action === "goto_next") continue;
    return `${decisive.action}:${decisive.name}`;
  }
  return "deny:implied";
}

/** The four permissions on objects each role grants (Cloud Storage's predefined roles). */
const ROLE_PERMISSIONS: Record<string, string[]> = {
  "roles/storage.objectViewer": ["storage.objects.get", "storage.objects.list"],
  "roles/storage.objectCreator": ["storage.objects.create"],
  "roles/storage.objectUser": ["storage.objects.get", "storage.objects.list", "storage.objects.create", "storage.objects.delete"],
  "roles/storage.objectAdmin": ["storage.objects.get", "storage.objects.list", "storage.objects.create", "storage.objects.delete"],
};

function iam(m: Extract<GcpModel, { type: "iam" }>): string {
  const principals = new Set([`user:${m.user}`, ...m.groups.map((g) => `group:${g}`)]);
  const granted = new Set<string>();
  for (const binding of m.allows) {
    if (!principals.has(binding.member)) continue;
    const perms = ROLE_PERMISSIONS[binding.role];
    if (!perms) throw new Error(`unknown role ${binding.role}`);
    for (const p of perms) granted.add(p);
  }
  for (const rule of m.denies) {
    const denied = rule.principals.some((p) => p === "principalSet:all" || principals.has(p));
    const excepted = rule.exceptions.some((p) => principals.has(p));
    if (denied && !excepted) for (const p of rule.permissions) granted.delete(`storage.objects.${p}`);
  }
  const order = ["get", "list", "create", "delete"];
  const result = order.filter((p) => granted.has(`storage.objects.${p}`));
  return result.length === 0 ? "none" : result.join(" ");
}

/** The right option's formula for every model except `subnetNew` (see validNewSubnet). */
export function gcpAnswer(m: GcpModel): string {
  switch (m.type) {
    case "subnetUsable": {
      const r = range(m.cidr);
      return String(r.last - r.first + 1n - 4n);
    }
    case "subnetRange": {
      const r = range(m.cidr);
      return `${bigToIp(r.first + 2n)}-${bigToIp(r.last - 2n)}`;
    }
    case "subnetNew":
      throw new Error("subnetNew is checked option by option");
    case "firewall":
      return firewall(m);
    case "iam":
      return iam(m);
    case "runInstances":
      return String(Math.max(m.minInstances, Math.floor((m.requests + m.concurrency - 1) / m.concurrency)));
    case "runCapacity":
      return String(m.maxInstances * m.concurrency);
    case "availability": {
      const value = m.layout === "series" ? m.parts.reduce((a, p) => a * p, 1) : 1 - m.parts.reduce((a, p) => a * (1 - p), 1);
      return `${(value * 100).toFixed(4)}%`;
    }
  }
}
