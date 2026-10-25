/**
 * Google Cloud, generated: a subnet's addresses, a new subnet's range, a
 * packet against firewall rules and policies, a principal's access through
 * the resource hierarchy with deny policies, Cloud Run's instances, and the
 * availability of components in series or in parallel. Each wrong option is
 * what a misconception predicts.
 *
 * The model of each question (`gcp-model.ts`) goes with it; `check:quiz`
 * computes the answer again with an evaluator of its own. Policies and rules
 * are shown as a block of short lines (36 characters at most).
 */
import type { Rng } from "./rng";
import type { Draft, Generator, Localized, MistakeKey, Option } from "./types";
import type { L3 } from "./linux/types";
import { IAM_LEVELS, OBJECT_PERMISSIONS, type Cidr, type FwPacket, type FwRule, type FwStep, type GcpModel, type IamAllow, type IamDeny, type IamLevel, type ObjectPermission } from "./gcp-model";

const L = (t: L3): Localized => ({ en: t[0], fr: t[1], es: t[2] });
const same = (s: string): Localized => ({ en: s, fr: s, es: s });

/** The longest line of a policy or rule list shown: it must fit a phone. */
export const GCP_LINE_MAX = 36;

const opt = (tex: string, text: Localized, mistake?: MistakeKey): Option => ({ tex, text, ...(mistake ? { mistake } : {}) });
const code = (s: string): Localized => same(`\`${s}\``);

function draft(id: string, question: L3, block: string | undefined, model: GcpModel, correct: Option, wrong: Option[], explanation: L3): Draft {
  const seen = new Set([correct.tex]);
  return {
    prompt: { key: "concept", tex: "", id, text: L(question), ...(block ? { code: block } : {}) },
    correct,
    wrong: wrong.filter((o) => !seen.has(o.tex) && seen.add(o.tex)),
    explanation: { key: "concept", tex: "", text: L(explanation) },
    verify: { kind: "gcp", model },
  };
}

// ---------------------------------------------------------------- addresses

const toInt = (ip: string): number => ip.split(".").reduce((a, b) => a * 256 + Number(b), 0);
const toIp = (n: number): string => [24, 16, 8, 0].map((s) => Math.floor(n / 2 ** s) % 256).join(".");
const parse = (cidr: Cidr): { base: number; prefix: number; size: number } => {
  const [ip, p] = cidr.split("/");
  const prefix = Number(p);
  return { base: toInt(ip!), prefix, size: 2 ** (32 - prefix) };
};

/** A random aligned range of this prefix inside 10.0.0.0/8. */
function randomRange(rng: Rng, prefix: number): Cidr {
  const size = 2 ** (32 - prefix);
  const slots = 2 ** 24 / size;
  return `${toIp(toInt("10.0.0.0") + rng.int(0, slots - 1) * size)}/${prefix}`;
}

/** How many addresses VMs can use; first and last. */
export const subnetAddresses: Generator = (rng: Rng) => {
  const prefix = rng.int(20, 29);
  const cidr = randomRange(rng, prefix);
  const { base, size } = parse(cidr);
  if (rng.int(0, 1) === 0) {
    const n = (x: number): Option => opt(String(x), same(String(x).replace(/\B(?=(\d{3})+$)/g, " ")));
    return draft(
      `usable ${cidr}`,
      [
        `A subnet's primary range is \`${cidr}\`. How many addresses can VMs use in it?`,
        `La plage principale d'un sous-réseau est \`${cidr}\`. Combien d'adresses les VM peuvent-elles y utiliser ?`,
        `El rango principal de una subred es \`${cidr}\`. ¿Cuántas direcciones pueden usar las VM en él?`,
      ],
      undefined,
      { type: "subnetUsable", cidr },
      n(size - 4),
      [
        { ...n(size - 2), mistake: "gcpReservedAddresses" },
        { ...n(size), mistake: "gcpReservedAddresses" },
        { ...n(size / 2 - 4), mistake: "gcpPrefixSize" },
        { ...n(size * 2 - 4), mistake: "gcpPrefixSize" },
      ],
      [
        `A /${prefix} holds 2^${32 - prefix} = ${size} addresses. Google Cloud reserves four in a subnet's primary range: the network address, the default gateway (the second), the second-to-last (for future use) and the broadcast address. ${size} − 4 = ${size - 4}. Secondary ranges, used for alias IPs and GKE pods, reserve none.`,
        `Un /${prefix} contient 2^${32 - prefix} = ${size} adresses. Google Cloud en réserve quatre dans la plage principale d'un sous-réseau : l'adresse du réseau, la passerelle par défaut (la deuxième), l'avant-dernière (pour un usage futur) et l'adresse de diffusion. ${size} − 4 = ${size - 4}. Les plages secondaires, pour les IP d'alias et les pods GKE, n'en réservent aucune.`,
        `Un /${prefix} contiene 2^${32 - prefix} = ${size} direcciones. Google Cloud reserva cuatro en el rango principal de una subred: la dirección de red, la puerta de enlace predeterminada (la segunda), la penúltima (para uso futuro) y la de difusión. ${size} − 4 = ${size - 4}. Los rangos secundarios, para IP de alias y pods de GKE, no reservan ninguna.`,
      ],
    );
  }
  const range = (a: number, b: number): Option => opt(`${toIp(base + a)}-${toIp(base + size - 1 - b)}`, same(`\`${toIp(base + a)}\` – \`${toIp(base + size - 1 - b)}\``));
  return draft(
    `range ${cidr}`,
    [
      `A subnet's primary range is \`${cidr}\`. Which addresses can be given to VMs?`,
      `La plage principale d'un sous-réseau est \`${cidr}\`. Quelles adresses peuvent être attribuées aux VM ?`,
      `El rango principal de una subred es \`${cidr}\`. ¿Qué direcciones se pueden asignar a las VM?`,
    ],
    undefined,
    { type: "subnetRange", cidr },
    range(2, 2),
    [{ ...range(1, 1), mistake: "gcpReservedAddresses" }, { ...range(1, 2), mistake: "gcpReservedAddresses" }, { ...range(2, 1), mistake: "gcpReservedAddresses" }, { ...range(0, 0), mistake: "gcpReservedAddresses" }],
    [
      `The first address (${toIp(base)}) is the network and the second (${toIp(base + 1)}) the default gateway; the last (${toIp(base + size - 1)}) is broadcast and the one before (${toIp(base + size - 2)}) is reserved by Google Cloud. VMs get ${toIp(base + 2)} to ${toIp(base + size - 3)}.`,
      `La première adresse (${toIp(base)}) est le réseau et la deuxième (${toIp(base + 1)}) la passerelle par défaut ; la dernière (${toIp(base + size - 1)}) est la diffusion et l'avant-dernière (${toIp(base + size - 2)}) est réservée par Google Cloud. Les VM reçoivent ${toIp(base + 2)} à ${toIp(base + size - 3)}.`,
      `La primera dirección (${toIp(base)}) es la red y la segunda (${toIp(base + 1)}) la puerta de enlace predeterminada; la última (${toIp(base + size - 1)}) es la difusión y la penúltima (${toIp(base + size - 2)}) la reserva Google Cloud. Las VM reciben de ${toIp(base + 2)} a ${toIp(base + size - 3)}.`,
    ],
  );
};

/** A new subnet's primary range: no overlap with the VPC's subnets, a permitted range, /29 or larger. */
export const subnetNew: Generator = (rng: Rng) => {
  // Three subnets in one /16, at random offsets of /20, /22 and /24 slots.
  const second = rng.int(0, 200);
  const net = (third: number, prefix: number): Cidr => `10.${second}.${third}.0/${prefix}`;
  const a = rng.pick([0, 16, 32]);
  const existing = [net(a, 20), net(a + 16, 22), net(a + 20, 24)];
  const regions = ["europe-west1", "us-central1", "asia-east1"];
  const free = net(a + 24, rng.pick([22, 23, 24, 26]));
  const overlapInside = net(a + rng.int(1, 14), 24); // inside the /20
  const overlapAround = net(a + 16, 21); // covers the /22 and the /24
  const tooSmall = `10.${second}.${a + 28}.0/30`;
  const prohibited = rng.pick(["169.254.10.0/24", "127.10.0.0/24"]);
  const block = existing.map((c, i) => `subnet-${i + 1} ${c}\n  ${regions[i]}`).join("\n");
  return draft(
    `new ${existing.join(" ")} ${free}`,
    [
      "A VPC network has these subnets. Which range can be the primary range of a new subnet in it?",
      "Un réseau VPC a ces sous-réseaux. Quelle plage peut être la plage principale d'un nouveau sous-réseau ?",
      "Una red VPC tiene estas subredes. ¿Qué rango puede ser el rango principal de una subred nueva en ella?",
    ],
    block,
    { type: "subnetNew", existing },
    opt(free, code(free)),
    [opt(overlapInside, code(overlapInside), "gcpCidrOverlap"), opt(overlapAround, code(overlapAround), "gcpCidrOverlap"), opt(tooSmall, code(tooSmall), "gcpSubnetTooSmall"), opt(prohibited, code(prohibited), "gcpCidrProhibited")],
    [
      `A VPC network is global and its subnets are regional, but their ranges may not overlap anywhere in the network, whatever the region. ${free} lies after ${existing[2]} and outside ${existing[0]}. The smallest IPv4 subnet is a /29; 127.0.0.0/8 (loopback) and 169.254.0.0/16 (link-local) are among the prohibited ranges. A primary range can later be expanded, never shrunk.`,
      `Un réseau VPC est global et ses sous-réseaux sont régionaux, mais leurs plages ne peuvent se chevaucher nulle part dans le réseau, quelle que soit la région. ${free} se trouve après ${existing[2]} et hors de ${existing[0]}. Le plus petit sous-réseau IPv4 est un /29 ; 127.0.0.0/8 (boucle locale) et 169.254.0.0/16 (lien local) font partie des plages interdites. Une plage principale peut ensuite être agrandie, jamais réduite.`,
      `Una red VPC es global y sus subredes son regionales, pero sus rangos no pueden solaparse en ningún punto de la red, sea cual sea la región. ${free} está después de ${existing[2]} y fuera de ${existing[0]}. La subred IPv4 más pequeña es un /29; 127.0.0.0/8 (loopback) y 169.254.0.0/16 (enlace local) están entre los rangos prohibidos. Un rango principal se puede ampliar después, nunca reducir.`,
    ],
  );
};

// ----------------------------------------------------------------- firewall

const inRange = (ip: string, cidr: Cidr): boolean => {
  const { base, size } = parse(cidr);
  const n = toInt(ip);
  return n >= base && n < base + size;
};
const ruleMatches = (r: FwRule, p: FwPacket, ignoreTags = false): boolean =>
  r.sources.some((s) => inRange(p.source, s)) &&
  (r.ports === "all" || r.ports === "tcp" || r.ports === `tcp:${p.port}`) &&
  (ignoreTags || !r.tags || r.tags.some((t) => p.tags.includes(t)));

/** The decision, as the docs give it; the variants are the misconceptions. */
function evaluate(steps: FwStep[], p: FwPacket, how: { order?: "listed" | "highNumber"; tie?: "allow"; ignoreTags?: boolean; gotoNext?: "allow"; impliedIngress?: "allow"; stepOrder?: number[] } = {}): string {
  const order = how.stepOrder ?? steps.map((_, i) => i);
  for (const i of order) {
    const step = steps[i]!;
    const matching = step.rules.filter((r) => ruleMatches(r, p, how.ignoreTags));
    if (matching.length === 0) continue;
    let chosen: FwRule;
    if (how.order === "listed") chosen = matching[0]!;
    else {
      const best = how.order === "highNumber" ? Math.max(...matching.map((r) => r.priority)) : Math.min(...matching.map((r) => r.priority));
      const tied = matching.filter((r) => r.priority === best);
      const pick = how.tie === "allow" ? "allow" : "deny";
      chosen = step.vpc ? (tied.find((r) => r.action === pick) ?? tied[0]!) : tied[0]!;
    }
    if (chosen.action === "goto_next") {
      if (how.gotoNext === "allow") return `allow:${chosen.name}`;
      continue;
    }
    return `${chosen.action}:${chosen.name}`;
  }
  return `${how.impliedIngress ?? "deny"}:implied`;
}

const outcome = (tex: string, mistake?: MistakeKey): Option => {
  const [action, name] = tex.split(":") as [string, string];
  const text: L3 =
    name === "implied"
      ? action === "deny"
        ? ["Blocked by the implied ingress rule", "Bloqué par la règle implicite d'entrée", "Bloqueado por la regla implícita de entrada"]
        : ["Allowed by the implied ingress rule", "Autorisé par la règle implicite d'entrée", "Permitido por la regla implícita de entrada"]
      : action === "deny"
        ? [`Blocked by \`${name}\``, `Bloqué par \`${name}\``, `Bloqueado por \`${name}\``]
        : [`Allowed by \`${name}\``, `Autorisé par \`${name}\``, `Permitido por \`${name}\``];
  return opt(tex, L(text), mistake);
};

const SOURCES = ["0.0.0.0/0", "10.0.0.0/8", "35.235.240.0/20", "203.0.113.0/24"];
const PORTS = ["tcp:22", "tcp:443", "tcp:80", "tcp"];
const PACKET_SOURCES: Record<string, string[]> = {
  "0.0.0.0/0": ["198.51.100.7"],
  "10.0.0.0/8": ["10.4.0.12"],
  "35.235.240.0/20": ["35.235.241.9"],
  "203.0.113.0/24": ["203.0.113.40"],
};

function ruleLines(r: FwRule): string[] {
  return [
    `${r.name} ${r.action} prio ${r.priority}`,
    `  from ${r.sources.join(", ")}`,
    `  ${r.ports === "tcp" ? "tcp (all ports)" : r.ports}${r.tags ? ` to tag ${r.tags.join(",")}` : " to all"}`,
  ];
}

function randomRule(rng: Rng, name: string, actions: FwRule["action"][], packet: FwPacket, matchBias: boolean): FwRule {
  const sources = [matchBias ? rng.pick(SOURCES.filter((s) => inRange(packet.source, s))) : rng.pick(SOURCES)];
  const ports = matchBias ? rng.pick(["tcp", `tcp:${packet.port}`]) : rng.pick(PORTS);
  const tags = rng.int(0, 2) === 0 ? undefined : [rng.pick(["web", "db", "bastion"])];
  return { name, priority: rng.pick([100, 500, 900, 1000, 1000, 2000]), action: rng.pick(actions), sources, ports, ...(tags ? { tags } : {}) };
}

/** A packet against VPC firewall rules: the lowest priority number wins, deny on a tie, implied deny for ingress. */
export const firewallRules: Generator = (rng: Rng) => {
  for (;;) {
    const port = rng.pick([22, 443, 80]);
    const srcRange = rng.pick(SOURCES);
    const packet: FwPacket = { source: rng.pick(PACKET_SOURCES[srcRange]!), port, tags: [rng.pick(["web", "db", "bastion"])] };
    const names = rng.shuffle(["allow-ssh", "deny-all", "allow-web", "allow-iap", "block-ext", "allow-int"]).slice(0, rng.int(3, 4));
    const rules = names.map((n) => randomRule(rng, n, ["allow", "deny"], packet, rng.int(0, 2) > 0));
    const steps: FwStep[] = [{ name: "vpc", vpc: true, rules }];
    const real = evaluate(steps, packet);
    const wrong = [
      outcome(evaluate(steps, packet, { order: "listed" }), "gcpFirewallOrder"),
      outcome(evaluate(steps, packet, { order: "highNumber" }), "gcpFirewallOrder"),
      outcome(evaluate(steps, packet, { tie: "allow" }), "gcpFirewallTie"),
      outcome(evaluate(steps, packet, { ignoreTags: true }), "gcpFirewallTargets"),
      outcome(evaluate(steps, packet, { impliedIngress: "allow" }), "gcpFirewallImplied"),
    ].filter((o) => o.tex !== real);
    if (new Set(wrong.map((o) => o.tex)).size < 3) continue;
    return draft(
      `fw ${JSON.stringify([rules, packet])}`,
      [
        `A TCP packet from \`${packet.source}\` reaches port ${port} of a VM tagged \`${packet.tags[0]}\`. These are the VPC network's firewall rules (ingress); no firewall policy applies. What happens?`,
        `Un paquet TCP venant de \`${packet.source}\` arrive sur le port ${port} d'une VM étiquetée \`${packet.tags[0]}\`. Voici les règles de pare-feu du réseau VPC (entrée) ; aucune stratégie de pare-feu ne s'applique. Que se passe-t-il ?`,
        `Un paquete TCP desde \`${packet.source}\` llega al puerto ${port} de una VM con la etiqueta \`${packet.tags[0]}\`. Estas son las reglas de firewall de la red VPC (entrada); no se aplica ninguna política de firewall. ¿Qué pasa?`,
      ],
      rules.flatMap(ruleLines).join("\n"),
      { type: "firewall", steps, packet },
      outcome(real),
      wrong,
      [
        "Rules that do not apply to the VM (target tags) or do not match the packet (source range, protocol and port) are skipped. Among the rest, the lowest priority number wins, whatever the order in which they are listed; 0 is the highest priority, 65535 the lowest, 1000 the default. If an allow and a deny match at that priority, the deny wins. If nothing matches, the implied rule denies ingress (and allows egress).",
        "Les règles qui ne s'appliquent pas à la VM (tags cibles) ou ne correspondent pas au paquet (plage source, protocole et port) sont ignorées. Parmi les autres, le plus petit numéro de priorité l'emporte, quel que soit l'ordre d'affichage ; 0 est la priorité la plus haute, 65535 la plus basse, 1000 la valeur par défaut. Si un allow et un deny correspondent à cette priorité, le deny l'emporte. Si rien ne correspond, la règle implicite refuse l'entrée (et autorise la sortie).",
        "Las reglas que no se aplican a la VM (etiquetas de destino) o no coinciden con el paquete (rango de origen, protocolo y puerto) se ignoran. Entre las demás gana el número de prioridad más bajo, sea cual sea el orden en que se listan; 0 es la prioridad más alta, 65535 la más baja, 1000 la predeterminada. Si coinciden un allow y un deny con esa prioridad, gana el deny. Si nada coincide, la regla implícita deniega la entrada (y permite la salida).",
      ],
    );
  }
};

/** Hierarchical policies (organisation, then folder), VPC rules, then the global network policy, with goto_next. */
export const firewallPolicies: Generator = (rng: Rng) => {
  for (;;) {
    const port = rng.pick([22, 443, 80]);
    const srcRange = rng.pick(SOURCES);
    const packet: FwPacket = { source: rng.pick(PACKET_SOURCES[srcRange]!), port, tags: [rng.pick(["web", "db"])] };
    // Policies' rules here target every VM, and have distinct priorities, as a policy requires.
    const named = (prefix: string, n: number, actions: FwRule["action"][], vpc = false): FwRule[] => {
      const priorities = rng.shuffle([100, 200, 500, 1000, 2000]);
      return Array.from({ length: n }, (_, i) => {
        const { tags, ...rule } = randomRule(rng, `${prefix}-${i + 1}`, actions, packet, rng.int(0, 2) > 0);
        return vpc ? { ...rule, ...(tags ? { tags } : {}) } : { ...rule, priority: priorities[i]! };
      });
    };
    const steps: FwStep[] = [
      { name: "org", rules: named("org", rng.int(1, 2), ["goto_next", "goto_next", "deny", "allow"]) },
      { name: "folder", rules: named("fld", 1, ["goto_next", "deny", "allow"]) },
      { name: "vpc", vpc: true, rules: named("vpc", rng.int(1, 2), ["allow", "deny"], true) },
      { name: "global", rules: named("net", 1, ["allow", "deny"]) },
    ];
    const real = evaluate(steps, packet);
    const wrong = [
      outcome(evaluate(steps, packet, { stepOrder: [2, 3, 0, 1] }), "gcpFirewallHierarchy"),
      outcome(evaluate(steps, packet, { stepOrder: [1, 0, 2, 3] }), "gcpFirewallHierarchy"),
      outcome(evaluate(steps, packet, { stepOrder: [0, 1, 3, 2] }), "gcpFirewallHierarchy"),
      outcome(evaluate(steps, packet, { gotoNext: "allow" }), "gcpGotoNext"),
      outcome(evaluate(steps, packet, { impliedIngress: "allow" }), "gcpFirewallImplied"),
      outcome(evaluate(steps, packet, { order: "highNumber" }), "gcpFirewallOrder"),
      outcome(evaluate(steps, packet, { ignoreTags: true }), "gcpFirewallTargets"),
      outcome(evaluate(steps, packet, { tie: "allow" }), "gcpFirewallTie"),
    ].filter((o) => o.tex !== real);
    if (new Set(wrong.map((o) => o.tex)).size < 3) continue;
    const titles = ["org policy", "folder policy", "VPC rules", "global network policy"];
    const block = steps.flatMap((s, i) => [`# ${titles[i]}`, ...s.rules.flatMap(ruleLines)]).join("\n");
    return draft(
      `fwp ${JSON.stringify([steps, packet])}`,
      [
        `A TCP packet from \`${packet.source}\` reaches port ${port} of a VM tagged \`${packet.tags[0]}\`. The VPC network keeps the default enforcement order. What happens?`,
        `Un paquet TCP venant de \`${packet.source}\` arrive sur le port ${port} d'une VM étiquetée \`${packet.tags[0]}\`. Le réseau VPC garde l'ordre d'application par défaut. Que se passe-t-il ?`,
        `Un paquete TCP desde \`${packet.source}\` llega al puerto ${port} de una VM con la etiqueta \`${packet.tags[0]}\`. La red VPC mantiene el orden de aplicación predeterminado. ¿Qué pasa?`,
      ],
      block,
      { type: "firewall", steps, packet },
      outcome(real),
      wrong,
      [
        "Hierarchical firewall policies come first, the organisation's, then each folder's down to the project; then, in the default order (`AFTER_CLASSIC_FIREWALL`), the VPC firewall rules, then the global and regional network firewall policies, and last the implied rules. In each step the matching rule with the lowest priority number decides: `allow` or `deny` stops evaluation, `goto_next` passes to the next step, and a step with no match passes too. With `BEFORE_CLASSIC_FIREWALL`, network policies come before the VPC rules.",
        "Les stratégies de pare-feu hiérarchiques passent d'abord, celle de l'organisation puis celle de chaque dossier jusqu'au projet ; ensuite, dans l'ordre par défaut (`AFTER_CLASSIC_FIREWALL`), les règles de pare-feu VPC, puis les stratégies de pare-feu réseau globales et régionales, et enfin les règles implicites. À chaque étape, la règle correspondante au plus petit numéro de priorité décide : `allow` ou `deny` arrêtent l'évaluation, `goto_next` passe à l'étape suivante, et une étape sans correspondance passe aussi. Avec `BEFORE_CLASSIC_FIREWALL`, les stratégies réseau viennent avant les règles VPC.",
        "Primero van las políticas de firewall jerárquicas, la de la organización y luego la de cada carpeta hasta el proyecto; después, en el orden predeterminado (`AFTER_CLASSIC_FIREWALL`), las reglas de firewall de VPC, luego las políticas de firewall de red globales y regionales, y por último las reglas implícitas. En cada paso decide la regla coincidente con el número de prioridad más bajo: `allow` o `deny` detienen la evaluación, `goto_next` pasa al paso siguiente, y un paso sin coincidencias también pasa. Con `BEFORE_CLASSIC_FIREWALL`, las políticas de red van antes que las reglas de VPC.",
      ],
    );
  }
};

// ---------------------------------------------------------------------- IAM

/** What each storage role grants on objects (the four permissions asked about). */
export const STORAGE_ROLES: Record<string, ObjectPermission[]> = {
  "roles/storage.objectViewer": ["get", "list"],
  "roles/storage.objectCreator": ["create"],
  "roles/storage.objectUser": ["get", "list", "create", "delete"],
  "roles/storage.objectAdmin": ["get", "list", "create", "delete"],
};

const LEVEL_NAMES: Record<IamLevel, string> = { org: "org example.com", folder: "folder prod", project: "project shop-prod", bucket: "bucket invoices" };

function access(m: Extract<GcpModel, { type: "iam" }>, how: { inherit?: false; lowestOnly?: true; groups?: false; deny?: false; exceptions?: false; allowBeatsDeny?: true } = {}): ObjectPermission[] {
  const who = new Set([`user:${m.user}`, ...(how.groups === false ? [] : m.groups.map((g) => `group:${g}`))]);
  let allows = m.allows.filter((a) => who.has(a.member) && (how.inherit !== false || a.level === "bucket"));
  if (how.lowestOnly && allows.length > 0) {
    const lowest = Math.max(...allows.map((a) => IAM_LEVELS.indexOf(a.level)));
    allows = allows.filter((a) => IAM_LEVELS.indexOf(a.level) === lowest);
  }
  const granted = new Set(allows.flatMap((a) => STORAGE_ROLES[a.role] ?? []));
  if (how.deny !== false) {
    for (const d of m.denies) {
      const hit = d.principals.some((p) => who.has(p)) && !(how.exceptions !== false && d.exceptions.some((p) => who.has(p)));
      if (!hit) continue;
      for (const p of d.permissions) {
        // The slip: an allow granted below the deny taken to win.
        if (how.allowBeatsDeny && allows.some((a) => IAM_LEVELS.indexOf(a.level) > IAM_LEVELS.indexOf(d.level) && (STORAGE_ROLES[a.role] ?? []).includes(p))) continue;
        granted.delete(p);
      }
    }
  }
  return OBJECT_PERMISSIONS.filter((p) => granted.has(p));
}

const perms = (ps: ObjectPermission[], mistake?: MistakeKey): Option =>
  ps.length === 0 ? opt("none", L(["None of them", "Aucune", "Ninguna"]), mistake) : opt(ps.join(" "), same(ps.map((p) => `\`${p}\``).join(", ")), mistake);

function iamQuestion(rng: Rng, withDeny: boolean): Draft {
  for (;;) {
    const members = ["user:alice", "group:devs", "group:devs", "user:bob"];
    const roles = Object.keys(STORAGE_ROLES);
    const allows: IamAllow[] = Array.from({ length: rng.int(2, 3) }, () => ({ level: rng.pick(IAM_LEVELS), member: rng.pick(members), role: rng.pick(roles) }));
    const denies: IamDeny[] = withDeny
      ? [
          {
            level: rng.pick(["org", "folder", "project"] as const),
            principals: [rng.pick(["group:devs", "user:alice", "principalSet:all"])],
            exceptions: rng.int(0, 1) === 0 ? [] : [rng.pick(["user:alice", "group:admins"])],
            permissions: rng.shuffle(["delete", "create", "list"] as ObjectPermission[]).slice(0, rng.int(1, 2)),
          },
        ]
      : [];
    const m: Extract<GcpModel, { type: "iam" }> = { type: "iam", user: "alice", groups: ["devs"], allows, denies };
    // "principalSet:all" stands for every principal.
    const forAll = (d: IamDeny): IamDeny => (d.principals.includes("principalSet:all") ? { ...d, principals: ["user:alice", "group:devs", "user:bob", "group:admins"] } : d);
    const mm = { ...m, denies: m.denies.map(forAll) };
    const real = access(mm);
    const wrong = [
      perms(access(mm, { inherit: false }), "gcpIamInheritance"),
      perms(access(mm, { lowestOnly: true }), "gcpIamInheritance"),
      perms(access(mm, { groups: false }), "gcpIamGroups"),
      ...(withDeny
        ? [perms(access(mm, { deny: false }), "gcpDenyOrder"), perms(access(mm, { allowBeatsDeny: true }), "gcpDenyOrder"), perms(access(mm, { exceptions: false }), "gcpDenyExceptions")]
        : []),
    ].filter((o) => o.tex !== perms(real).tex);
    if (new Set(wrong.map((o) => o.tex)).size < 3) continue;
    if (!allows.some((a) => a.member !== "user:bob")) continue;
    const lines: string[] = [];
    for (const level of IAM_LEVELS) {
      const here = allows.filter((a) => a.level === level);
      const deny = denies.filter((d) => d.level === level);
      if (here.length === 0 && deny.length === 0 && level !== "bucket") continue;
      lines.push(LEVEL_NAMES[level]);
      for (const a of here) lines.push(`  allow ${a.member}`, `    ${a.role}`);
      for (const d of deny) {
        if (d.principals[0] === "principalSet:all") lines.push("  deny principalSet://goog/", "    public:all");
        else lines.push(`  deny ${d.principals.join(", ")}`);
        for (const p of d.permissions) lines.push(`    storage.googleapis.com/`, `      objects.${p}`);
        if (d.exceptions.length > 0) lines.push(`    except ${d.exceptions.join(", ")}`);
      }
    }
    return draft(
      `iam ${JSON.stringify(m)}`,
      [
        `Alice is a member of the group \`devs\`. With these policies, which of \`get\`, \`list\`, \`create\`, \`delete\` on the objects of bucket \`invoices\` can she use?`,
        `Alice est membre du groupe \`devs\`. Avec ces stratégies, lesquelles de \`get\`, \`list\`, \`create\`, \`delete\` sur les objets du bucket \`invoices\` peut-elle utiliser ?`,
        `Alice es miembro del grupo \`devs\`. Con estas políticas, ¿cuáles de \`get\`, \`list\`, \`create\`, \`delete\` sobre los objetos del bucket \`invoices\` puede usar?`,
      ],
      lines.join("\n"),
      m,
      perms(real),
      wrong,
      withDeny
        ? [
            "Allow policies are inherited down the hierarchy and add up: a role granted on the organisation, a folder or the project applies to the bucket, as does a role granted to a group Alice belongs to. Deny policies are inherited too and are checked before allow policies: a denied permission is refused whatever role grants it, at any level, unless the principal is in the rule's exception principals. In deny policies, permissions use the v2 form, `storage.googleapis.com/objects.delete`; `principalSet://goog/public:all` means everyone.",
            "Les stratégies d'autorisation sont héritées vers le bas et s'additionnent : un rôle accordé sur l'organisation, un dossier ou le projet s'applique au bucket, de même qu'un rôle accordé à un groupe dont Alice fait partie. Les stratégies de refus sont aussi héritées et sont évaluées avant les autorisations : une permission refusée l'est quel que soit le rôle qui l'accorde, à n'importe quel niveau, sauf si le principal figure dans les exceptions de la règle. Dans les stratégies de refus, les permissions ont la forme v2, `storage.googleapis.com/objects.delete` ; `principalSet://goog/public:all` désigne tout le monde.",
            "Las políticas de permiso se heredan hacia abajo y se suman: un rol concedido en la organización, una carpeta o el proyecto se aplica al bucket, igual que un rol concedido a un grupo del que Alice es miembro. Las políticas de denegación también se heredan y se evalúan antes que los permisos: un permiso denegado se rechaza sea cual sea el rol que lo conceda, en cualquier nivel, salvo que el principal esté en las excepciones de la regla. En las políticas de denegación, los permisos usan la forma v2, `storage.googleapis.com/objects.delete`; `principalSet://goog/public:all` significa todo el mundo.",
          ]
        : [
            "Allow policies are inherited down the hierarchy and add up, they never take away: a role granted on the organisation, a folder or the project applies to every bucket below, and a lower, narrower grant does not replace it. A role granted to a group applies to its members. `objectViewer` gives `get` and `list`; `objectCreator` only `create`; `objectUser` and `objectAdmin` all four. Bob's grants do not matter for Alice.",
            "Les stratégies d'autorisation sont héritées vers le bas et s'additionnent, elles ne retirent jamais rien : un rôle accordé sur l'organisation, un dossier ou le projet s'applique à chaque bucket en dessous, et une autorisation plus basse et plus étroite ne le remplace pas. Un rôle accordé à un groupe s'applique à ses membres. `objectViewer` donne `get` et `list` ; `objectCreator` seulement `create` ; `objectUser` et `objectAdmin` les quatre. Les autorisations de Bob ne comptent pas pour Alice.",
            "Las políticas de permiso se heredan hacia abajo y se suman, nunca quitan nada: un rol concedido en la organización, una carpeta o el proyecto se aplica a cada bucket por debajo, y una concesión más baja y más estrecha no lo sustituye. Un rol concedido a un grupo se aplica a sus miembros. `objectViewer` da `get` y `list`; `objectCreator` solo `create`; `objectUser` y `objectAdmin` los cuatro. Las concesiones de Bob no cuentan para Alice.",
          ],
    );
  }
}

export const iamInheritance: Generator = (rng: Rng) => iamQuestion(rng, false);
export const iamDeny: Generator = (rng: Rng) => iamQuestion(rng, true);

// ---------------------------------------------------------------- Cloud Run

/** Instances for a load: requests divided by concurrency, rounded up, at least the minimum; or the most served at once. */
export const runScaling: Generator = (rng: Rng) => {
  const concurrency = rng.pick([1, 10, 40, 80, 80, 250]);
  if (rng.int(0, 2) > 0) {
    const requests = rng.int(2, 60) * (concurrency === 1 ? 1 : rng.int(3, 9)) + rng.int(1, Math.max(1, concurrency - 1));
    const minInstances = rng.pick([0, 0, 1, 2, rng.int(3, 8)]);
    const needed = Math.ceil(requests / concurrency);
    const real = Math.max(minInstances, needed);
    const n = (x: number, mistake?: MistakeKey): Option => opt(String(x), same(String(x)), mistake);
    return draft(
      `run ${requests} ${concurrency} ${minInstances}`,
      [
        `A Cloud Run service has a maximum concurrency of ${concurrency} requests per instance and ${minInstances} minimum instances. ${requests} requests are in flight at once. How many instances does it need at least?`,
        `Un service Cloud Run a une concurrence maximale de ${concurrency} requêtes par instance et ${minInstances} instances minimum. ${requests} requêtes sont en cours en même temps. Combien d'instances lui faut-il au moins ?`,
        `Un servicio de Cloud Run tiene una concurrencia máxima de ${concurrency} peticiones por instancia y ${minInstances} instancias mínimas. Hay ${requests} peticiones en curso a la vez. ¿Cuántas instancias necesita como mínimo?`,
      ],
      undefined,
      { type: "runInstances", requests, concurrency, minInstances },
      n(real),
      [
        n(Math.max(minInstances, Math.floor(requests / concurrency)), "gcpRoundDown"),
        n(requests, "gcpConcurrencyIgnored"),
        n(needed + minInstances, "gcpMinInstancesAdded"),
        n(real + 1, "gcpRoundDown"),
        n(Math.max(1, real - 1), "gcpRoundDown"),
      ],
      [
        `Each instance serves up to ${concurrency} requests at once (the default is 80, the maximum 1000; 1 makes each request run alone). ${requests} ÷ ${concurrency} = ${(requests / concurrency).toFixed(2)}, rounded up to ${needed}: a part-filled instance is still an instance. Minimum instances are kept warm and count among them; they are not added on top.`,
        `Chaque instance sert jusqu'à ${concurrency} requêtes à la fois (80 par défaut, 1000 au maximum ; 1 fait passer chaque requête seule). ${requests} ÷ ${concurrency} = ${(requests / concurrency).toFixed(2)}, arrondi au-dessus : ${needed}, car une instance à moitié pleine reste une instance. Les instances minimum restent chaudes et comptent parmi elles ; elles ne s'ajoutent pas.`,
        `Cada instancia atiende hasta ${concurrency} peticiones a la vez (80 por defecto, 1000 como máximo; 1 hace que cada petición vaya sola). ${requests} ÷ ${concurrency} = ${(requests / concurrency).toFixed(2)}, redondeado hacia arriba: ${needed}, porque una instancia a medio llenar sigue siendo una instancia. Las instancias mínimas se mantienen activas y cuentan entre ellas; no se suman.`,
      ],
    );
  }
  const maxInstances = rng.pick([3, 5, 10, 20, 100]);
  const n = (x: number, mistake?: MistakeKey): Option => opt(String(x), same(String(x)), mistake);
  return draft(
    `cap ${maxInstances} ${concurrency}`,
    [
      `A Cloud Run service is limited to ${maxInstances} instances, with a maximum concurrency of ${concurrency}. How many requests can it serve at the same moment?`,
      `Un service Cloud Run est limité à ${maxInstances} instances, avec une concurrence maximale de ${concurrency}. Combien de requêtes peut-il servir au même moment ?`,
      `Un servicio de Cloud Run está limitado a ${maxInstances} instancias, con una concurrencia máxima de ${concurrency}. ¿Cuántas peticiones puede atender en el mismo momento?`,
    ],
    undefined,
    { type: "runCapacity", maxInstances, concurrency },
    n(maxInstances * concurrency),
    [n(maxInstances, "gcpConcurrencyIgnored"), n(maxInstances + concurrency, "gcpConcurrencyIgnored"), n(concurrency, "gcpConcurrencyIgnored"), n(maxInstances * concurrency * 2, "gcpConcurrencyIgnored")],
    [
      `${maxInstances} instances × ${concurrency} requests each = ${maxInstances * concurrency}. Beyond that, requests wait in a queue for a while and then fail (HTTP 429). Raising concurrency suits I/O-bound code; CPU-bound code may need a lower value.`,
      `${maxInstances} instances × ${concurrency} requêtes chacune = ${maxInstances * concurrency}. Au-delà, les requêtes attendent un moment en file puis échouent (HTTP 429). Une concurrence élevée convient au code qui attend des E/S ; un code gourmand en CPU peut demander une valeur plus basse.`,
      `${maxInstances} instancias × ${concurrency} peticiones cada una = ${maxInstances * concurrency}. Más allá, las peticiones esperan un tiempo en cola y luego fallan (HTTP 429). Una concurrencia alta conviene al código que espera E/S; el código que consume CPU puede necesitar un valor menor.`,
    ],
  );
};

// ------------------------------------------------------------- availability

const pct = (x: number): string => `${(x * 100).toFixed(4)}%`;

/** Components in series multiply their availabilities; redundant ones multiply their unavailabilities. */
export const availability: Generator = (rng: Rng) => {
  const layout = rng.pick(["series", "parallel"] as const);
  const choices = [0.99, 0.995, 0.999, 0.9995, 0.9999];
  const parts = layout === "series" ? [rng.pick(choices), rng.pick(choices)] : (() => { const a = rng.pick([0.99, 0.995, 0.999]); return [a, a]; })();
  if (parts[0] === parts[1] && layout === "series") return availability(rng);
  const series = parts.reduce((x, y) => x * y, 1);
  const parallel = 1 - parts.reduce((x, y) => x * (1 - y), 1);
  const real = layout === "series" ? series : parallel;
  const o = (x: number, mistake?: MistakeKey): Option => opt(pct(x), same(pct(x).replace("%", " %")), mistake);
  const shown = parts.map((p) => `${(p * 100).toFixed(2).replace(/\.?0+$/, "")} %`);
  return draft(
    `avail ${layout} ${parts.join(" ")}`,
    layout === "series"
      ? [
          `A request needs two independent components, available ${shown[0]} and ${shown[1]} of the time. What is the availability of the whole?`,
          `Une requête a besoin de deux composants indépendants, disponibles ${shown[0]} et ${shown[1]} du temps. Quelle est la disponibilité de l'ensemble ?`,
          `Una petición necesita dos componentes independientes, disponibles el ${shown[0]} y el ${shown[1]} del tiempo. ¿Cuál es la disponibilidad del conjunto?`,
        ]
      : [
          `A service runs in two zones, each available ${shown[0]} of the time, failing independently; one zone is enough. What is the availability of the whole?`,
          `Un service tourne dans deux zones, chacune disponible ${shown[0]} du temps, avec des pannes indépendantes ; une zone suffit. Quelle est la disponibilité de l'ensemble ?`,
          `Un servicio funciona en dos zonas, cada una disponible el ${shown[0]} del tiempo, con fallos independientes; basta una zona. ¿Cuál es la disponibilidad del conjunto?`,
        ],
    undefined,
    { type: "availability", parts, layout },
    o(real),
    [
      o(layout === "series" ? parallel : series, "gcpAvailabilityLayout"),
      // Two zones taken to halve the downtime.
      ...(layout === "parallel" ? [o(1 - (1 - parts[0]!) / 2, "gcpAvailabilityLayout")] : []),
      o(Math.min(...parts), "gcpAvailabilityMin"),
      o(parts.reduce((x, y) => x + y, 0) / parts.length, "gcpAvailabilityMin"),
      o(Math.max(...parts), "gcpAvailabilityMin"),
    ],
    layout === "series"
      ? [
          `In series both must be up, so the probabilities multiply: ${parts.map((p) => p.toString()).join(" × ")} = ${real.toFixed(6)}. The whole is less available than its weakest part; each dependency added in series lowers it.`,
          `En série, les deux doivent fonctionner, donc les probabilités se multiplient : ${parts.map((p) => p.toString()).join(" × ")} = ${real.toFixed(6)}. L'ensemble est moins disponible que sa partie la plus faible ; chaque dépendance ajoutée en série l'abaisse.`,
          `En serie, ambos deben funcionar, así que las probabilidades se multiplican: ${parts.map((p) => p.toString()).join(" × ")} = ${real.toFixed(6)}. El conjunto está menos disponible que su parte más débil; cada dependencia añadida en serie lo reduce.`,
        ]
      : [
          `The whole is down only when both zones are down at once: (1 − ${parts[0]})² = ${(1 - real).toExponential(2)}, so the availability is ${pct(real)}. This holds only if failures are independent; a shared dependency (a region, a configuration push) breaks the assumption.`,
          `L'ensemble n'est en panne que si les deux zones le sont en même temps : (1 − ${parts[0]})² = ${(1 - real).toExponential(2)}, d'où une disponibilité de ${pct(real)}. Cela ne vaut que si les pannes sont indépendantes ; une dépendance commune (une région, un déploiement de configuration) casse l'hypothèse.`,
          `El conjunto solo cae cuando las dos zonas caen a la vez: (1 − ${parts[0]})² = ${(1 - real).toExponential(2)}, así que la disponibilidad es ${pct(real)}. Solo vale si los fallos son independientes; una dependencia común (una región, un despliegue de configuración) rompe la hipótesis.`,
        ],
  );
};
