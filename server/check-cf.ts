/**
 * The answers to generated Cloudflare questions, computed again for
 * `check:quiz` without the generator's code. The rules follow Cloudflare's
 * documentation (docs/question-generators.md#cloudflare):
 *
 * - rules language: the expression is parsed from its text with the
 *   documented precedence (not, and, xor, or); `eq`, `ne`, `contains`, `in`
 *   are case-sensitive, `wildcard` is case-insensitive and anchored;
 * - phases: Single Redirects, custom rules, rate limiting, managed rules,
 *   Super Bot Fight Mode, Access, Bulk Redirects, Cache Rules;
 * - SSL/TLS: Flexible fetches over HTTP, Full does not validate, Full
 *   (strict) needs a public or Origin CA certificate (else 526);
 * - cache: by extension; `Set-Cookie`, `private`, `no-store` bypass;
 *   s-maxage, max-age, else 2 hours; browser TTL raised to 4 hours;
 * - tunnels: the first matching ingress rule; Access: Bypass first, then
 *   Allow and Block in order, Include OR, Require AND, Exclude NOT;
 * - Workers Paid and Workers AI bills from the published prices.
 */
import type { CfModel } from "../shared/quiz/index.ts";

type Request = Extract<CfModel, { type: "ruleMatch" }>["requests"][number];

// ------------------------------------------------------------ expressions

type Token = { t: "word"; v: string } | { t: "str"; v: string } | { t: "set"; v: string[] } | { t: "punct"; v: string };

function tokenize(s: string): Token[] {
  const out: Token[] = [];
  let i = 0;
  while (i < s.length) {
    const c = s[i]!;
    if (c === " ") i++;
    else if (c === '"') {
      const j = s.indexOf('"', i + 1);
      out.push({ t: "str", v: s.slice(i + 1, j) });
      i = j + 1;
    } else if (c === "{") {
      const j = s.indexOf("}", i);
      out.push({ t: "set", v: [...s.slice(i + 1, j).matchAll(/"([^"]*)"/g)].map((m) => m[1]!) });
      i = j + 1;
    } else if (c === "(" || c === ")" || c === ",") {
      out.push({ t: "punct", v: c });
      i++;
    } else {
      const m = /^[A-Za-z_.]+/.exec(s.slice(i));
      if (!m) throw new Error(`cannot read ${s.slice(i)}`);
      out.push({ t: "word", v: m[0] });
      i += m[0].length;
    }
  }
  return out;
}

function fieldValue(name: string, r: Request): string {
  if (name === "http.request.uri.path") return r.path;
  if (name === "http.request.method") return r.method;
  if (name === "ip.src.country") return r.country;
  throw new Error(`unknown field ${name}`);
}

/** Recursive descent: or < xor < and < not < comparison. */
export function evaluateExpression(expression: string, r: Request): boolean {
  const tokens = tokenize(expression);
  let pos = 0;
  const peekWord = (w: string): boolean => tokens[pos]?.t === "word" && tokens[pos]!.v === w;
  const take = (): Token => tokens[pos++]!;
  const orExpr = (): boolean => {
    let v = andExpr();
    while (peekWord("or")) {
      take();
      const rhs = andExpr();
      v = v || rhs;
    }
    return v;
  };
  const andExpr = (): boolean => {
    let v = notExpr();
    while (peekWord("and")) {
      take();
      const rhs = notExpr();
      v = v && rhs;
    }
    return v;
  };
  const notExpr = (): boolean => {
    if (peekWord("not")) {
      take();
      return !notExpr();
    }
    return comparison();
  };
  const comparison = (): boolean => {
    const first = take();
    if (first.t !== "word") throw new Error("expected a field or a function");
    if (first.v === "starts_with") {
      take(); // (
      const field = take() as { t: "word"; v: string };
      take(); // ,
      const prefix = take() as { t: "str"; v: string };
      take(); // )
      return fieldValue(field.v, r).startsWith(prefix.v);
    }
    const value = fieldValue(first.v, r);
    const op = take() as { t: "word"; v: string };
    const arg = take();
    switch (op.v) {
      case "eq":
        return value === (arg as { v: string }).v;
      case "ne":
        return value !== (arg as { v: string }).v;
      case "contains":
        return value.includes((arg as { v: string }).v);
      case "in":
        return (arg as { v: string[] }).v.includes(value);
      case "wildcard": {
        const pattern = (arg as { v: string }).v.toLowerCase();
        const parts = pattern.split("*");
        const v = value.toLowerCase();
        if (!v.startsWith(parts[0]!) || !v.endsWith(parts.at(-1)!)) return false;
        let at = parts[0]!.length;
        for (const part of parts.slice(1, -1)) {
          const found = v.indexOf(part, at);
          if (found < 0) return false;
          at = found + part.length;
        }
        return parts.length === 1 ? v === parts[0] : at <= v.length - parts.at(-1)!.length;
      }
      default:
        throw new Error(`unknown operator ${op.v}`);
    }
  };
  const result = orExpr();
  if (pos !== tokens.length) throw new Error(`unread tokens in ${expression}`);
  return result;
}

// ------------------------------------------------------------------ others

const ORDER = ["singleRedirect", "customRule", "rateLimit", "managedRules", "superBotFightMode", "access", "bulkRedirect"];

function cache(m: Extract<CfModel, { type: "cacheTtl" }>): string {
  const byDefault = new Set(["jpg", "png", "css", "js", "woff2", "gif", "svg", "pdf"]);
  if (!m.cacheRule && !byDefault.has(m.extension)) return "none";
  const directives = new Map(
    m.cacheControl
      .split(",")
      .map((d) => d.trim())
      .filter(Boolean)
      .map((d) => {
        const [k, v] = d.split("=");
        return [k!.toLowerCase(), v === undefined ? true : Number(v)] as const;
      }),
  );
  if (m.setCookie || directives.has("private") || directives.has("no-store") || directives.has("no-cache")) return "none";
  const maxAge = directives.get("max-age");
  const sMaxAge = directives.get("s-maxage");
  const edge = typeof sMaxAge === "number" ? sMaxAge : typeof maxAge === "number" ? maxAge : 120 * 60;
  const browser = typeof maxAge === "number" && maxAge > 4 * 3600 ? maxAge : 4 * 3600;
  return `e${edge} b${browser}`;
}

function ingress(m: Extract<CfModel, { type: "tunnelIngress" }>): string {
  for (const rule of m.rules) {
    if (rule.hostname) {
      const ok = rule.hostname.startsWith("*.") ? m.host.endsWith(rule.hostname.slice(1)) && m.host !== rule.hostname.slice(2) : m.host === rule.hostname;
      if (!ok) continue;
    }
    if (rule.path && !new RegExp(rule.path).test(m.path)) continue;
    return rule.service;
  }
  throw new Error("no catch-all rule");
}

function access(m: Extract<CfModel, { type: "accessPolicy" }>): string {
  const holds = (s: Extract<CfModel, { type: "accessPolicy" }>["policies"][number]["include"][number]): boolean => {
    const u = m.user;
    if (s.kind === "everyone") return true;
    if (s.kind === "emailDomain") return u.email.split("@")[1] === s.value.slice(1);
    if (s.kind === "email") return u.email === s.value;
    if (s.kind === "group") return u.groups.includes(s.value);
    if (s.kind === "country") return u.country === s.value;
    return u.encrypted;
  };
  const ranked = [...m.policies.entries()].sort(([i, a], [j, b]) => (a.action === "bypass" ? 0 : 1) - (b.action === "bypass" ? 0 : 1) || i - j).map(([, p]) => p);
  for (const p of ranked) {
    if (p.include.some(holds) && p.require.every(holds) && !p.exclude.some(holds)) return `${p.action}:${p.name}`;
  }
  return "deny:default";
}

const cents = (x: number): string => (Math.round(x * 100) / 100).toFixed(2);

/** The right option's formula. */
export function cfAnswer(m: CfModel): string {
  switch (m.type) {
    case "ruleMatch": {
      const hit = m.requests.filter((r) => evaluateExpression(m.expression, r)).map((r) => r.label);
      return hit.length === 0 ? "none" : hit.join(" ");
    }
    case "phaseOrder":
      return ORDER.find((p) => m.rules.some((r) => r.product === p && r.matches)) ?? "origin";
    case "tlsMode":
      if (m.mode === "flexible") return m.redirects ? "loop" : "plain";
      if (m.mode === "full") return "unchecked";
      return ["publicCert", "originCa"].includes(m.origin) ? "strict" : "526";
    case "cacheTtl":
      return cache(m);
    case "tunnelIngress":
      return ingress(m);
    case "accessPolicy":
      return access(m);
    case "workersCost": {
      const extraRequests = Math.max(0, m.millionRequests * 1e6 - 10e6);
      const extraCpu = Math.max(0, m.millionRequests * 1e6 * m.cpuMs - 30e6);
      return cents(5 + (extraRequests / 1e6) * 0.3 + (extraCpu / 1e6) * 0.02);
    }
    case "aiCost": {
      let total = 0;
      for (let day = 0; day < m.days; day++) total += (Math.max(0, m.neuronsPerDay - 10_000) / 1000) * 0.011;
      return cents(total);
    }
  }
}
