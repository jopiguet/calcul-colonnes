/**
 * Cloudflare, generated: which requests a rules-language expression matches,
 * which product of the request phases decides first, the SSL/TLS mode
 * against the origin, how long the cache keeps a response, which ingress rule
 * of a tunnel serves a request, which Access policy decides, and the bills of
 * Workers and Workers AI. Each wrong option is what a misconception predicts.
 *
 * The model of each question (`cf-model.ts`) goes with it; `check:quiz`
 * computes the answer again with an evaluator of its own
 * (`server/check-cf.ts`). Rules and policies are shown as a block of short
 * lines (36 characters at most), so that they fit a phone.
 */
import type { Rng } from "./rng";
import type { Draft, Generator, Localized, MistakeKey, Option } from "./types";
import type { L3 } from "./linux/types";
import type { CfIngress, CfModel, CfOrigin, CfPhaseRule, CfPolicy, CfRequest, CfSelector, CfUser } from "./cf-model";

const L = (t: L3): Localized => ({ en: t[0], fr: t[1], es: t[2] });
const same = (s: string): Localized => ({ en: s, fr: s, es: s });

/** The longest line of a rule or policy shown. */
export const CF_LINE_MAX = 36;

const opt = (tex: string, text: Localized, mistake?: MistakeKey): Option => ({ tex, text, ...(mistake ? { mistake } : {}) });

function draft(id: string, question: L3, block: string | undefined, model: CfModel, correct: Option, wrong: Option[], explanation: L3): Draft {
  const seen = new Set([correct.tex]);
  return {
    prompt: { key: "concept", tex: "", id, text: L(question), ...(block ? { code: block } : {}) },
    correct,
    wrong: wrong.filter((o) => !seen.has(o.tex) && seen.add(o.tex)),
    explanation: { key: "concept", tex: "", text: L(explanation) },
    verify: { kind: "cf", model },
  };
}

/** At least three wrong options that differ from the answer and from each other. */
const enough = (real: string, wrong: Option[]): boolean => new Set(wrong.filter((o) => o.tex !== real).map((o) => o.tex)).size >= 3;

// ----------------------------------------------------------- rules language

type Field = "path" | "method" | "country";
type Op = "eq" | "ne" | "wildcard" | "contains" | "in" | "starts_with";
interface Atom {
  field: Field;
  op: Op;
  value: string | string[];
}

const FIELD_NAMES: Record<Field, string> = { path: "http.request.uri.path", method: "http.request.method", country: "ip.src.country" };

const ATOMS: Atom[] = [
  { field: "path", op: "eq", value: "/admin" },
  { field: "path", op: "eq", value: "/login" },
  { field: "path", op: "wildcard", value: "/admin*" },
  { field: "path", op: "wildcard", value: "/admin/*" },
  { field: "path", op: "contains", value: "/api" },
  { field: "path", op: "starts_with", value: "/api/" },
  { field: "method", op: "eq", value: "POST" },
  { field: "method", op: "ne", value: "GET" },
  { field: "method", op: "in", value: ["PUT", "POST"] },
  { field: "country", op: "eq", value: "CH" },
  { field: "country", op: "ne", value: "US" },
  { field: "country", op: "in", value: ["CH", "FR"] },
];

const PATHS = ["/admin", "/Admin", "/admin/users", "/ADMIN/users", "/api/v1/orders", "/static/api-docs.png", "/static/admin.css", "/login", "/Login", "/API/v1/cart"];
const METHODS = ["GET", "POST", "PUT"];
const COUNTRIES = ["CH", "FR", "US", "DE"];

const quoted = (s: string): string => `"${s}"`;
const valueText = (v: string | string[]): string => (Array.isArray(v) ? `{${v.map(quoted).join(" ")}}` : quoted(v));
const atomText = (a: Atom): string => (a.op === "starts_with" ? `starts_with(${FIELD_NAMES[a.field]}, ${valueText(a.value)})` : `${FIELD_NAMES[a.field]} ${a.op} ${valueText(a.value)}`);

/** An atom over lines of at most CF_LINE_MAX characters. */
function atomLines(a: Atom, prefix = ""): string[] {
  const one = `${prefix}${atomText(a)}`;
  if (one.length <= CF_LINE_MAX) return [one];
  if (a.op === "starts_with") return [`${prefix}starts_with(`, `  ${FIELD_NAMES[a.field]},`, `  ${valueText(a.value)})`];
  return [`${prefix}${FIELD_NAMES[a.field]}`, `  ${a.op} ${valueText(a.value)}`];
}

interface Slips {
  caseInsensitive?: boolean;
  wildcardStrict?: boolean;
  wildcardPartial?: boolean;
  containsPrefix?: boolean;
}

function wildcardMatch(pattern: string, value: string, caseSensitive: boolean, partial = false): boolean {
  const p = caseSensitive ? pattern : pattern.toLowerCase();
  const v = caseSensitive ? value : value.toLowerCase();
  const body = p.split("*").map((s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join(".*");
  const re = new RegExp(partial ? body : `^${body}$`);
  return re.test(v);
}

function atomHolds(a: Atom, r: CfRequest, slips: Slips): boolean {
  const field = a.field === "path" ? r.path : a.field === "method" ? r.method : r.country;
  const fold = (s: string): string => (slips.caseInsensitive ? s.toLowerCase() : s);
  switch (a.op) {
    case "eq":
      return fold(field) === fold(a.value as string);
    case "ne":
      return fold(field) !== fold(a.value as string);
    case "contains":
      return slips.containsPrefix ? fold(field).startsWith(fold(a.value as string)) : fold(field).includes(fold(a.value as string));
    case "starts_with":
      return fold(field).startsWith(fold(a.value as string));
    case "in":
      return (a.value as string[]).some((v) => fold(v) === fold(field));
    case "wildcard":
      return wildcardMatch(a.value as string, field, slips.wildcardStrict === true, slips.wildcardPartial === true);
  }
}

/** The three shapes: "a and b or c", "a or b and c", "not a and b". */
type Shape = "andOr" | "orAnd" | "notAnd";

function holds(shape: Shape, atoms: Atom[], r: CfRequest, slips: Slips = {}, precedenceSlip = false): boolean {
  const [a, b, c] = atoms.map((x) => atomHolds(x, r, slips)) as [boolean, boolean, boolean];
  switch (shape) {
    case "andOr":
      return precedenceSlip ? a && (b || c) : (a && b) || c;
    case "orAnd":
      return precedenceSlip ? (a || b) && c : a || (b && c);
    case "notAnd":
      return precedenceSlip ? !(a && b) : !a && b;
  }
}

const labelsOf = (requests: CfRequest[], test: (r: CfRequest) => boolean): string => {
  const hit = requests.filter(test).map((r) => r.label);
  return hit.length === 0 ? "none" : hit.join(" ");
};

const matchOption = (tex: string, mistake?: MistakeKey): Option =>
  tex === "none" ? opt(tex, L(["None of them", "Aucune", "Ninguna"]), mistake) : opt(tex, same(tex.split(" ").join(", ")), mistake);

/** Which requests an expression matches: precedence, case sensitivity, wildcard, contains. */
export const ruleMatch: Generator = (rng: Rng) => {
  for (;;) {
    const shape = rng.pick(["andOr", "orAnd", "notAnd"] as const);
    const pathAtom = rng.pick(ATOMS.filter((a) => a.field === "path"));
    const others = rng.shuffle(ATOMS.filter((a) => a.field !== "path")).slice(0, 2);
    const atoms = rng.shuffle([pathAtom, ...others]).slice(0, shape === "notAnd" ? 2 : 3);
    if (shape === "notAnd" && !atoms.includes(pathAtom)) continue;
    const requests: CfRequest[] = ["A", "B", "C", "D"].map((label) => ({ label, method: rng.pick(METHODS), path: rng.pick(PATHS), country: rng.pick(COUNTRIES) }));
    const real = labelsOf(requests, (r) => holds(shape, atoms, r));
    const wrong = [
      matchOption(labelsOf(requests, (r) => holds(shape, atoms, r, { wildcardStrict: true })), "cfWildcardCase"),
      matchOption(labelsOf(requests, (r) => holds(shape, atoms, r, { containsPrefix: true })), "cfContains"),
      matchOption(labelsOf(requests, (r) => holds(shape, atoms, r, { caseInsensitive: true })), "cfRuleCase"),
      matchOption(labelsOf(requests, (r) => holds(shape, atoms, r, {}, true)), "cfRulePrecedence"),
      matchOption(labelsOf(requests, (r) => holds(shape, atoms, r, { wildcardPartial: true })), "cfWildcardAnchor"),
      matchOption(labelsOf(requests, (r) => holds(shape, atoms, r, { caseInsensitive: true }, true)), "cfRuleCase"),
    ];
    if (new Set(wrong.filter((o) => o.tex !== real).map((o) => o.tex)).size < 2) continue;
    // Two misconceptions at least; the rest of the options from the other readings of the list.
    const everyone = requests.map((r) => r.label).join(" ");
    const complement = labelsOf(requests, (r) => !holds(shape, atoms, r));
    wrong.push(matchOption(everyone, "cfRuleMisread"), matchOption("none", "cfRuleMisread"), matchOption(complement, "cfRuleMisread"));
    const joiners = shape === "andOr" ? ["", "and", "or"] : shape === "orAnd" ? ["", "or", "and"] : ["not", "and"];
    const exprLines: string[] = [];
    const exprParts: string[] = [];
    atoms.forEach((a, i) => {
      if (shape === "notAnd") {
        if (i === 0) {
          exprLines.push(...atomLines(a, "not "));
          exprParts.push(`not ${atomText(a)}`);
        } else {
          exprLines.push("and", ...atomLines(a));
          exprParts.push(`and ${atomText(a)}`);
        }
        return;
      }
      if (i > 0) exprLines.push(joiners[i]!);
      exprLines.push(...atomLines(a));
      exprParts.push(i === 0 ? atomText(a) : `${joiners[i]} ${atomText(a)}`);
    });
    const expression = exprParts.join(" ");
    const block = [...exprLines, "", ...requests.map((r) => `${r.label}  ${r.method} ${r.path}  ${r.country}`)].join("\n");
    return draft(
      `rule ${expression} ${JSON.stringify(requests)}`,
      [
        "All four requests are for `shop.example.com`; the last column is the visitor's country. Which of them does this expression match?",
        "Les quatre requêtes visent `shop.example.com` ; la dernière colonne est le pays du visiteur. Lesquelles cette expression sélectionne-t-elle ?",
        "Las cuatro peticiones son para `shop.example.com`; la última columna es el país del visitante. ¿Cuáles selecciona esta expresión?",
      ],
      block,
      { type: "ruleMatch", expression, requests },
      matchOption(real),
      wrong,
      [
        "In the rules language, `not` binds first, then `and`, then `or`: `a and b or c` means `(a and b) or c`, and `not a and b` means `(not a) and b`. String comparisons with `eq`, `ne`, `contains` and `in` are case-sensitive, so `/Admin` is not `/admin`; `wildcard` is case-insensitive (`strict wildcard` is not) and must match the whole value, `*` standing for any characters. `contains` finds the text anywhere: `/static/api-docs.png` contains `/api`. When in doubt, add parentheses.",
        "Dans le langage des règles, `not` s'applique d'abord, puis `and`, puis `or` : `a and b or c` se lit `(a and b) or c`, et `not a and b` se lit `(not a) and b`. Les comparaisons de chaînes avec `eq`, `ne`, `contains` et `in` respectent la casse : `/Admin` n'est pas `/admin` ; `wildcard` l'ignore (`strict wildcard` la respecte) et doit couvrir toute la valeur, `*` remplaçant n'importe quels caractères. `contains` trouve le texte n'importe où : `/static/api-docs.png` contient `/api`. Dans le doute, ajoute des parenthèses.",
        "En el lenguaje de reglas, `not` se aplica primero, luego `and` y luego `or`: `a and b or c` se lee `(a and b) or c`, y `not a and b` se lee `(not a) and b`. Las comparaciones de cadenas con `eq`, `ne`, `contains` e `in` distinguen mayúsculas: `/Admin` no es `/admin`; `wildcard` no las distingue (`strict wildcard` sí) y debe cubrir todo el valor, con `*` en lugar de cualquier carácter. `contains` encuentra el texto en cualquier sitio: `/static/api-docs.png` contiene `/api`. En caso de duda, añade paréntesis.",
      ],
    );
  }
};

// ------------------------------------------------------------- phase order

/** The request phases, in the order Cloudflare runs them; a cache rule never stops a request. */
export const PHASES: CfPhaseRule["product"][] = ["singleRedirect", "customRule", "rateLimit", "managedRules", "superBotFightMode", "access", "bulkRedirect", "cacheRule"];

const PRODUCT_LINES: Record<CfPhaseRule["product"], string> = {
  singleRedirect: "Single Redirect (301)",
  customRule: "WAF custom rule (Block)",
  rateLimit: "Rate limiting rule (Block)",
  managedRules: "WAF Managed Rules (Block)",
  superBotFightMode: "Super Bot Fight Mode (Block)",
  access: "Access application (login)",
  bulkRedirect: "Bulk Redirect (301)",
  cacheRule: "Cache Rule (eligible)",
};

const PRODUCT_TEXT: Record<CfPhaseRule["product"] | "origin", L3> = {
  singleRedirect: ["The Single Redirect: a 301", "La Single Redirect : un 301", "La Single Redirect: un 301"],
  customRule: ["The WAF custom rule: blocked", "La règle personnalisée du WAF : bloquée", "La regla personalizada del WAF: bloqueada"],
  rateLimit: ["The rate limiting rule: blocked", "La règle de limitation de débit : bloquée", "La regla de limitación de velocidad: bloqueada"],
  managedRules: ["The WAF Managed Rules: blocked", "Les règles gérées du WAF : bloquée", "Las reglas gestionadas del WAF: bloqueada"],
  superBotFightMode: ["Super Bot Fight Mode: blocked", "Super Bot Fight Mode : bloquée", "Super Bot Fight Mode: bloqueada"],
  access: ["Access: the login page", "Access : la page de connexion", "Access: la página de inicio de sesión"],
  bulkRedirect: ["The Bulk Redirect: a 301", "La Bulk Redirect : un 301", "La Bulk Redirect: un 301"],
  cacheRule: ["The Cache Rule: served from cache", "La Cache Rule : servie depuis le cache", "La Cache Rule: servida desde la caché"],
  origin: ["Nothing stops it: it reaches the cache or the origin", "Rien ne l'arrête : elle atteint le cache ou l'origine", "Nada la detiene: llega a la caché o al origen"],
};

const productOption = (tex: CfPhaseRule["product"] | "origin", mistake?: MistakeKey): Option => opt(tex, L(PRODUCT_TEXT[tex]), mistake);

function firstStop(rules: CfPhaseRule[], order: CfPhaseRule["product"][], cacheStops = false): CfPhaseRule["product"] | "origin" {
  for (const p of order) {
    const rule = rules.find((r) => r.product === p);
    if (rule?.matches && (p !== "cacheRule" || cacheStops)) return p;
  }
  return "origin";
}

/** Several products match one request: the first terminating phase decides. */
export const phaseOrder: Generator = (rng: Rng) => {
  for (;;) {
    const chosen = rng.shuffle(PHASES).slice(0, rng.int(4, 5));
    const rules: CfPhaseRule[] = chosen.map((product) => ({ product, matches: rng.int(0, 2) === 0 }));
    const real = firstStop(rules, PHASES);
    const swap = (a: CfPhaseRule["product"], b: CfPhaseRule["product"]): CfPhaseRule["product"][] => PHASES.map((p) => (p === a ? b : p === b ? a : p));
    const wrong = [
      productOption(firstStop(rules, PHASES, true), "cfCacheStops"),
      productOption(firstStop(rules, rules.map((r) => r.product)), "cfPhaseListed"),
      productOption(firstStop(rules, swap("customRule", "managedRules")), "cfManagedFirst"),
      productOption(firstStop(rules, ["bulkRedirect", ...PHASES.filter((p) => p !== "bulkRedirect")]), "cfBulkFirst"),
      productOption(firstStop(rules, [...PHASES].reverse()), "cfPhaseListed"),
      productOption(firstStop(rules, ["access", ...PHASES.filter((p) => p !== "access")]), "cfAccessFirst"),
      productOption(firstStop(rules, [...PHASES.filter((p) => p !== "singleRedirect"), "singleRedirect"]), "cfRedirectLast"),
    ];
    if (wrong.every((o) => o.tex === real)) continue;
    // One misconception at least; the other configured products complete the options.
    wrong.push(...rules.map((r) => productOption(r.product, "cfPhaseListed")), productOption("origin", "cfPhaseListed"));
    if (!enough(real, wrong)) continue;
    const block = rules.flatMap((r) => [PRODUCT_LINES[r.product], `  matches: ${r.matches ? "yes" : "no"}`]).join("\n");
    return draft(
      `phase ${JSON.stringify(rules)}`,
      [
        "These products are configured on a zone, listed in no particular order; \"matches\" says whether each one's expression matches a request (for rate limiting: whether the client is over the limit). What decides the request's fate?",
        "Ces produits sont configurés sur une zone, dans le désordre ; « matches » dit si l'expression de chacun correspond à une requête (pour la limitation de débit : si le client dépasse la limite). Qu'est-ce qui décide du sort de la requête ?",
        "Estos productos están configurados en una zona, sin un orden particular; «matches» indica si la expresión de cada uno coincide con una petición (para la limitación de velocidad: si el cliente supera el límite). ¿Qué decide la suerte de la petición?",
      ],
      block,
      { type: "phaseOrder", rules },
      productOption(real),
      wrong,
      [
        "The Ruleset Engine runs its phases in a fixed order, whatever the order rules were created or listed in: Single Redirects first, then (after rewrites, configuration and origin rules) WAF custom rules, rate limiting rules, WAF Managed Rules, Super Bot Fight Mode, the Access check, Bulk Redirects, and Cache Rules near the end. The first phase whose rule matches with a terminating action (a redirect, a block, a login page) ends the request. A Cache Rule only changes how the cache behaves; it never stops the request.",
        "Le Ruleset Engine exécute ses phases dans un ordre fixe, quel que soit l'ordre de création ou d'affichage des règles : les Single Redirects d'abord, puis (après les réécritures, les règles de configuration et d'origine) les règles personnalisées du WAF, la limitation de débit, les règles gérées du WAF, Super Bot Fight Mode, le contrôle d'Access, les Bulk Redirects, et les Cache Rules vers la fin. La première phase dont une règle correspond avec une action terminale (une redirection, un blocage, une page de connexion) termine la requête. Une Cache Rule change seulement le comportement du cache ; elle n'arrête jamais la requête.",
        "El Ruleset Engine ejecuta sus fases en un orden fijo, sea cual sea el orden en que se crearon o listan las reglas: primero las Single Redirects, luego (tras las reescrituras, las reglas de configuración y de origen) las reglas personalizadas del WAF, la limitación de velocidad, las reglas gestionadas del WAF, Super Bot Fight Mode, la comprobación de Access, las Bulk Redirects y las Cache Rules casi al final. La primera fase cuya regla coincide con una acción terminal (una redirección, un bloqueo, una página de inicio de sesión) termina la petición. Una Cache Rule solo cambia el comportamiento de la caché; nunca detiene la petición.",
      ],
    );
  }
};

// ---------------------------------------------------------------- SSL/TLS

const TLS_TEXT: Record<string, L3> = {
  loop: ["Too many redirects: the browser gives up", "Trop de redirections : le navigateur abandonne", "Demasiadas redirecciones: el navegador se rinde"],
  plain: ["It works, but Cloudflare → origin is unencrypted", "Ça marche, mais Cloudflare → origine n'est pas chiffré", "Funciona, pero Cloudflare → origen no está cifrado"],
  unchecked: ["It works, encrypted, but the origin's certificate is not checked", "Ça marche, chiffré, mais le certificat de l'origine n'est pas vérifié", "Funciona, cifrado, pero el certificado del origen no se comprueba"],
  strict: ["It works, encrypted, with the origin authenticated", "Ça marche, chiffré, avec l'origine authentifiée", "Funciona, cifrado, con el origen autenticado"],
  "526": ["Error 526: invalid SSL certificate", "Erreur 526 : certificat SSL invalide", "Error 526: certificado SSL no válido"],
};

const ORIGIN_TEXT: Record<CfOrigin, L3> = {
  publicCert: ["a valid certificate from a public CA", "un certificat valide d'une autorité publique", "un certificado válido de una autoridad pública"],
  originCa: ["a valid Cloudflare Origin CA certificate", "un certificat Cloudflare Origin CA valide", "un certificado Cloudflare Origin CA válido"],
  selfSigned: ["a self-signed certificate", "un certificat auto-signé", "un certificado autofirmado"],
  expired: ["a certificate that expired last week", "un certificat expiré la semaine dernière", "un certificado que caducó la semana pasada"],
  httpOnly: ["no certificate: it serves HTTP only", "aucun certificat : elle ne sert que du HTTP", "ningún certificado: solo sirve HTTP"],
};

const MODE_TEXT: Record<"flexible" | "full" | "strict", string> = { flexible: "Flexible", full: "Full", strict: "Full (strict)" };

/** What a visitor gets over HTTPS. */
export function tlsOutcome(mode: "flexible" | "full" | "strict", origin: CfOrigin, redirects: boolean): string {
  if (mode === "flexible") return redirects ? "loop" : "plain";
  if (mode === "full") return "unchecked";
  return origin === "publicCert" || origin === "originCa" ? "strict" : "526";
}

export const tlsMode: Generator = (rng: Rng) => {
  const mode = rng.pick(["flexible", "flexible", "full", "strict", "strict"] as const);
  const origin: CfOrigin = mode === "flexible" ? rng.pick(["httpOnly", "selfSigned", "publicCert"] as const) : rng.pick(["publicCert", "originCa", "selfSigned", "expired"] as const);
  const redirects = mode === "flexible" ? rng.int(0, 1) === 1 : rng.int(0, 2) === 0;
  const real = tlsOutcome(mode, origin, redirects);
  const mistakeFor = (o: string): MistakeKey => {
    if (o === "loop" || (mode === "flexible" && o === "plain")) return "cfRedirectLoop";
    if (mode === "flexible") return "cfFlexibleSafe";
    if (o === "plain") return "cfFlexibleSafe";
    if (mode === "strict" && origin === "originCa" && o === "526") return "cfOriginCaUntrusted";
    return "cfFullNotStrict";
  };
  const wrong = ["loop", "plain", "unchecked", "strict", "526"].filter((o) => o !== real).map((o) => opt(o, L(TLS_TEXT[o]!), mistakeFor(o)));
  const redirect: L3 = redirects
    ? [" The origin redirects every HTTP request to HTTPS.", " L'origine redirige toute requête HTTP vers HTTPS.", " El origen redirige toda petición HTTP a HTTPS."]
    : ["", "", ""];
  return draft(
    `tls ${mode} ${origin} ${redirects}`,
    [
      `A zone's SSL/TLS encryption mode is ${MODE_TEXT[mode]}. The proxied origin has ${ORIGIN_TEXT[origin][0]}.${redirect[0]} What does a visitor get on \`https://www.example.com\`?`,
      `Le mode de chiffrement SSL/TLS d'une zone est ${MODE_TEXT[mode]}. L'origine, derrière le proxy, a ${ORIGIN_TEXT[origin][1]}.${redirect[1]} Qu'obtient un visiteur sur \`https://www.example.com\` ?`,
      `El modo de cifrado SSL/TLS de una zona es ${MODE_TEXT[mode]}. El origen, detrás del proxy, tiene ${ORIGIN_TEXT[origin][2]}.${redirect[2]} ¿Qué obtiene un visitante en \`https://www.example.com\`?`,
    ],
    undefined,
    { type: "tlsMode", mode, origin, redirects },
    opt(real, L(TLS_TEXT[real]!)),
    wrong,
    [
      "Flexible always fetches from the origin over HTTP: if the origin answers HTTP with a redirect to HTTPS, the browser asks again over HTTPS, Cloudflare asks again over HTTP, and so on until the browser gives up; without that redirect it works, but unencrypted behind Cloudflare. Full connects over HTTPS without checking the certificate: self-signed or expired, it works. Full (strict) requires a valid certificate from a public CA or Cloudflare's Origin CA, matching the hostname; otherwise error 526.",
      "Flexible va toujours chercher la page chez l'origine en HTTP : si l'origine répond par une redirection vers HTTPS, le navigateur redemande en HTTPS, Cloudflare redemande en HTTP, et ainsi de suite jusqu'à ce que le navigateur abandonne ; sans cette redirection ça marche, mais sans chiffrement derrière Cloudflare. Full se connecte en HTTPS sans vérifier le certificat : auto-signé ou expiré, ça marche. Full (strict) exige un certificat valide d'une autorité publique ou de l'Origin CA de Cloudflare, correspondant au nom d'hôte ; sinon erreur 526.",
      "Flexible siempre pide la página al origen por HTTP: si el origen responde con una redirección a HTTPS, el navegador vuelve a pedirla por HTTPS, Cloudflare vuelve a pedirla por HTTP, y así hasta que el navegador se rinde; sin esa redirección funciona, pero sin cifrar detrás de Cloudflare. Full se conecta por HTTPS sin comprobar el certificado: autofirmado o caducado, funciona. Full (strict) exige un certificado válido de una autoridad pública o del Origin CA de Cloudflare, que corresponda al nombre de host; si no, error 526.",
    ],
  );
};

// ------------------------------------------------------------------ cache

const STATIC = ["jpg", "png", "css", "js", "woff2"];
const CONTENT_TYPES: Record<string, string> = { jpg: "image/jpeg", png: "image/png", css: "text/css", js: "text/javascript", woff2: "font/woff2", html: "text/html", json: "application/json" };
const CACHE_CONTROLS = ["", "max-age=60", "max-age=600", "max-age=86400", "public, s-maxage=3600, max-age=60", "private, max-age=600", "no-store"];

/** "4 h", "10 min", "1 day". */
export function duration(s: number): string {
  if (s % 86400 === 0) return s === 86400 ? "1 day" : `${s / 86400} days`;
  if (s % 3600 === 0) return `${s / 3600} h`;
  if (s % 60 === 0) return `${s / 60} min`;
  return `${s} s`;
}

const DURATION_WORDS: Record<"fr" | "es", (s: string) => string> = {
  fr: (s) => s.replace("1 day", "1 jour").replace(/(\d+) days/, "$1 jours"),
  es: (s) => s.replace("1 day", "1 día").replace(/(\d+) days/, "$1 días"),
};

interface CacheSlips {
  htmlCached?: boolean;
  cookieIgnored?: boolean;
  browserRespected?: boolean;
  defaultEdge?: number;
  smaxageIgnored?: boolean;
  edgeIsBrowser?: boolean;
  browserIsEdge?: boolean;
  noHeadersNoCache?: boolean;
}

/** "none", or "e<edge> b<browser>" in seconds. */
function cacheTtl(m: Extract<CfModel, { type: "cacheTtl" }>, slips: CacheSlips = {}): string {
  const eligible = m.cacheRule || STATIC.includes(m.extension) || slips.htmlCached === true;
  if (!eligible) return "none";
  const cc = m.cacheControl;
  if (slips.noHeadersNoCache && !/max-age/.test(cc)) return "none";
  if (!slips.cookieIgnored && (m.setCookie || /private|no-store|no-cache/.test(cc))) return "none";
  const maxAge = /(?:^|[ ,])max-age=(\d+)/.exec(cc);
  const sMaxAge = /s-maxage=(\d+)/.exec(cc);
  const maxAgeValue = maxAge ? Number(maxAge[1]) : undefined;
  const edge = !slips.smaxageIgnored && sMaxAge ? Number(sMaxAge[1]) : (maxAgeValue ?? slips.defaultEdge ?? 7200);
  const browser = slips.browserRespected && maxAgeValue !== undefined ? maxAgeValue : Math.max(maxAgeValue ?? 0, 14400);
  return `e${slips.edgeIsBrowser ? browser : edge} b${slips.browserIsEdge ? edge : browser}`;
}

function cacheOption(tex: string, mistake?: MistakeKey): Option {
  if (tex === "none") return opt(tex, L(["Not cached at the edge", "Pas mis en cache par Cloudflare", "No se guarda en la caché de Cloudflare"]), mistake);
  const [edge, browser] = tex.slice(1).split(" b").map(Number) as [number, number];
  const en = `Edge: ${duration(edge)} · browser: ${duration(browser)}`;
  return opt(tex, { en, fr: DURATION_WORDS.fr(`Cloudflare : ${duration(edge)} · navigateur : ${duration(browser)}`), es: DURATION_WORDS.es(`Cloudflare: ${duration(edge)} · navegador: ${duration(browser)}`) }, mistake);
}

/** Default caching by extension, Cache-Control and cookies, the default edge TTL and the 4-hour browser TTL. */
export const cacheTtlGen: Generator = (rng: Rng) => {
  for (;;) {
    const extension = rng.pick([...STATIC, "html", "html", "json"]);
    const m: Extract<CfModel, { type: "cacheTtl" }> = {
      type: "cacheTtl",
      extension,
      cacheControl: rng.pick(CACHE_CONTROLS),
      setCookie: rng.int(0, 4) === 0,
      cacheRule: (extension === "html" || extension === "json") && rng.int(0, 1) === 0,
    };
    const real = cacheTtl(m);
    const ttlSlips: [CacheSlips, MistakeKey][] = [
      [{ browserRespected: true }, "cfBrowserTtl"],
      [{ defaultEdge: 14400 }, "cfDefaultEdgeTtl"],
      [{ smaxageIgnored: true }, "cfSmaxage"],
      [{ edgeIsBrowser: true }, "cfEdgeBrowser"],
      [{ browserIsEdge: true }, "cfEdgeBrowser"],
      [{ noHeadersNoCache: true }, "cfNoHeaders"],
    ];
    const bases: [CacheSlips, MistakeKey | null][] = [
      [{}, null],
      [{ htmlCached: true }, "cfHtmlCached"],
      [{ cookieIgnored: true }, "cfCacheBypass"],
      [{ htmlCached: true, cookieIgnored: true }, "cfCacheBypass"],
    ];
    const wrong = bases.flatMap(([base, baseMistake]) => [
      ...(baseMistake ? [cacheOption(cacheTtl(m, base), baseMistake)] : []),
      ...ttlSlips.map(([slip, mistake]) => cacheOption(cacheTtl(m, { ...base, ...slip }), baseMistake ?? mistake)),
    ]);
    if (!enough(real, wrong)) continue;
    const headers = [`HTTP/1.1 200 OK`, `Content-Type: ${CONTENT_TYPES[extension]}`, ...(m.cacheControl ? (`Cache-Control: ${m.cacheControl}`.length > CF_LINE_MAX ? ["Cache-Control:", `  ${m.cacheControl}`] : [`Cache-Control: ${m.cacheControl}`]) : []), ...(m.setCookie ? ["Set-Cookie: sid=8f3a; Path=/"] : [])];
    const rule: L3 = m.cacheRule
      ? [" A Cache Rule makes the path eligible for cache, respecting the origin's headers.", " Une Cache Rule rend le chemin éligible au cache, en respectant les en-têtes de l'origine.", " Una Cache Rule hace la ruta apta para la caché, respetando las cabeceras del origen."]
      : [" No Cache Rule applies.", " Aucune Cache Rule ne s'applique.", " No se aplica ninguna Cache Rule."];
    return draft(
      `cache ${JSON.stringify(m)}`,
      [
        `On a zone with default cache settings (Browser Cache TTL: 4 hours), the origin answers \`GET /page.${extension}\` with these headers.${rule[0]} How long does Cloudflare keep it, and what does it tell the browser?`,
        `Sur une zone aux réglages de cache par défaut (Browser Cache TTL : 4 heures), l'origine répond à \`GET /page.${extension}\` avec ces en-têtes.${rule[1]} Combien de temps Cloudflare la garde-t-il, et que dit-il au navigateur ?`,
        `En una zona con la caché por defecto (Browser Cache TTL: 4 horas), el origen responde a \`GET /page.${extension}\` con estas cabeceras.${rule[2]} ¿Cuánto tiempo la guarda Cloudflare y qué le dice al navegador?`,
      ],
      headers.join("\n"),
      m,
      cacheOption(real),
      wrong,
      [
        "Cloudflare caches by file extension: images, CSS, JS and fonts by default, never HTML or JSON unless a Cache Rule makes them eligible. A response with `Set-Cookie`, or `Cache-Control: private`, `no-store` or `no-cache`, is not cached. The edge keeps it for `s-maxage` if given, else `max-age`, else a default by status code (2 hours for a 200). The browser is told the origin's `max-age`, raised to the Browser Cache TTL (4 hours by default) when shorter or missing.",
        "Cloudflare met en cache selon l'extension : images, CSS, JS et polices par défaut, jamais le HTML ni le JSON sauf si une Cache Rule les rend éligibles. Une réponse avec `Set-Cookie`, ou `Cache-Control: private`, `no-store` ou `no-cache`, n'est pas mise en cache. Cloudflare la garde `s-maxage` s'il est donné, sinon `max-age`, sinon une durée par défaut selon le code (2 heures pour un 200). Le navigateur reçoit le `max-age` de l'origine, relevé au Browser Cache TTL (4 heures par défaut) s'il est plus court ou absent.",
        "Cloudflare guarda en caché según la extensión: imágenes, CSS, JS y fuentes por defecto, nunca HTML ni JSON salvo que una Cache Rule los haga aptos. Una respuesta con `Set-Cookie`, o `Cache-Control: private`, `no-store` o `no-cache`, no se guarda. Cloudflare la conserva `s-maxage` si viene, si no `max-age`, y si no un valor por defecto según el código (2 horas para un 200). Al navegador se le da el `max-age` del origen, subido al Browser Cache TTL (4 horas por defecto) si es más corto o falta.",
      ],
    );
  }
};

// ------------------------------------------------------------------ tunnel

const INGRESS_POOL: CfIngress[] = [
  { hostname: "app.example.com", service: "http://localhost:8080" },
  { hostname: "app.example.com", path: "^/api/", service: "http://localhost:9000" },
  { hostname: "*.example.com", service: "http://localhost:3000" },
  { hostname: "ssh.example.com", service: "ssh://localhost:22" },
  { path: "^/health$", service: "http_status:200" },
];
const CATCH_ALL: CfIngress = { service: "http_status:404" };

interface IngressSlips {
  ignorePath?: boolean;
  wildcardApex?: boolean;
}

function ingressMatches(r: CfIngress, host: string, path: string, slips: IngressSlips = {}): boolean {
  if (r.hostname !== undefined) {
    if (r.hostname.startsWith("*.")) {
      const base = r.hostname.slice(2);
      if (!(host.endsWith(`.${base}`) || (slips.wildcardApex && host === base))) return false;
    } else if (r.hostname !== host) return false;
  }
  if (r.path !== undefined && !slips.ignorePath && !new RegExp(r.path).test(path)) return false;
  return true;
}

function ingressFirst(rules: CfIngress[], host: string, path: string, slips: IngressSlips = {}): string {
  return rules.find((r) => ingressMatches(r, host, path, slips))!.service;
}

const specificity = (r: CfIngress): number => (r.hostname && !r.hostname.startsWith("*") ? 4 : r.hostname ? 2 : 0) + (r.path ? 1 : 0) + (r.hostname === undefined && r.path === undefined ? -10 : 0);

export const tunnelIngress: Generator = (rng: Rng) => {
  for (;;) {
    const rules = [...rng.shuffle(INGRESS_POOL).slice(0, rng.int(3, 4)), CATCH_ALL];
    const host = rng.pick(["app.example.com", "ssh.example.com", "docs.example.com", "example.com"]);
    const path = rng.pick(["/", "/api/orders", "/health", "/login"]);
    const real = ingressFirst(rules, host, path);
    const service = (s: string, mistake?: MistakeKey): Option => opt(s, same(`\`${s}\``), mistake);
    const nonCatch = rules.slice(0, -1);
    const lastMatch = [...nonCatch].reverse().find((r) => ingressMatches(r, host, path))?.service ?? CATCH_ALL.service;
    const mostSpecific = [...nonCatch].sort((a, b) => specificity(b) - specificity(a)).find((r) => ingressMatches(r, host, path))?.service ?? CATCH_ALL.service;
    const wrong = [
      service(mostSpecific, "cfIngressSpecific"),
      service(lastMatch, "cfIngressLast"),
      service(ingressFirst(rules, host, path, { ignorePath: true }), "cfIngressPath"),
      service(ingressFirst(rules, host, path, { wildcardApex: true }), "cfIngressWildcard"),
      service(CATCH_ALL.service, "cfIngressSpecific"),
      ...nonCatch.filter((r) => r.service !== real).map((r) => service(r.service, "cfIngressSpecific")),
    ];
    const misconceptions = wrong.slice(0, 4).filter((o) => o.tex !== real);
    if (new Set(misconceptions.map((o) => o.tex)).size < 1 || !enough(real, wrong)) continue;
    const block = ["ingress:", ...rules.flatMap((r) => [`- ${r.hostname !== undefined ? `hostname: ${r.hostname}` : r.path !== undefined ? `path: ${r.path}` : `service: ${r.service}`}`, ...(r.hostname !== undefined && r.path !== undefined ? [`  path: ${r.path}`] : []), ...(r.hostname !== undefined || r.path !== undefined ? [`  service: ${r.service}`] : [])])].join("\n");
    return draft(
      `ingress ${JSON.stringify(rules)} ${host} ${path}`,
      [
        `A tunnel's \`cloudflared\` has these ingress rules. Which service receives a request for \`https://${host}${path}\`?`,
        `Le \`cloudflared\` d'un tunnel a ces règles d'entrée. Quel service reçoit une requête pour \`https://${host}${path}\` ?`,
        `El \`cloudflared\` de un túnel tiene estas reglas de entrada. ¿Qué servicio recibe una petición para \`https://${host}${path}\`?`,
      ],
      block,
      { type: "tunnelIngress", rules, host, path },
      service(real),
      wrong,
      [
        "`cloudflared` reads the ingress rules from top to bottom and uses the first one that matches; a more specific rule further down is never reached. A rule matches when its hostname matches (`*.example.com` covers subdomains, not `example.com` itself) and its path regular expression matches the path; a missing hostname or path matches everything. The list must end with a catch-all rule with no hostname or path, here `http_status:404`. Put specific rules first.",
        "`cloudflared` lit les règles d'entrée de haut en bas et prend la première qui correspond ; une règle plus précise placée plus bas n'est jamais atteinte. Une règle correspond si son nom d'hôte correspond (`*.example.com` couvre les sous-domaines, pas `example.com` lui-même) et si son expression régulière de chemin correspond au chemin ; un nom d'hôte ou un chemin absent correspond à tout. La liste doit finir par une règle fourre-tout, sans nom d'hôte ni chemin, ici `http_status:404`. Mets les règles précises en premier.",
        "`cloudflared` lee las reglas de entrada de arriba abajo y usa la primera que coincide; una regla más precisa situada más abajo nunca se alcanza. Una regla coincide si su nombre de host coincide (`*.example.com` cubre los subdominios, no `example.com`) y su expresión regular de ruta coincide con la ruta; un nombre de host o una ruta ausentes coinciden con todo. La lista debe terminar con una regla comodín, sin nombre de host ni ruta, aquí `http_status:404`. Pon primero las reglas precisas.",
      ],
    );
  }
};

// ------------------------------------------------------------------ Access

const selectorText = (s: CfSelector): string =>
  s.kind === "emailDomain" ? `emails ending ${s.value}` : s.kind === "email" ? s.value : s.kind === "group" ? `group ${s.value}` : s.kind === "country" ? `country ${s.value}` : s.kind === "posture" ? "disk encrypted" : "everyone";

function selectorHolds(s: CfSelector, u: CfUser): boolean {
  switch (s.kind) {
    case "emailDomain":
      return u.email.endsWith(s.value);
    case "email":
      return u.email === s.value;
    case "group":
      return u.groups.includes(s.value);
    case "country":
      return u.country === s.value;
    case "posture":
      return u.encrypted;
    case "everyone":
      return true;
  }
}

interface AccessSlips {
  requireOr?: boolean;
  excludeIgnored?: boolean;
  listedOrder?: boolean;
  defaultAllow?: boolean;
  includeAnd?: boolean;
}

function policyHolds(p: CfPolicy, u: CfUser, slips: AccessSlips): boolean {
  const include = slips.includeAnd ? p.include.every((s) => selectorHolds(s, u)) : p.include.some((s) => selectorHolds(s, u));
  const require = p.require.length === 0 || (slips.requireOr ? p.require.some((s) => selectorHolds(s, u)) : p.require.every((s) => selectorHolds(s, u)));
  const exclude = !slips.excludeIgnored && p.exclude.some((s) => selectorHolds(s, u));
  return include && require && !exclude;
}

export function accessDecision(policies: CfPolicy[], u: CfUser, slips: AccessSlips = {}): string {
  const order = slips.listedOrder ? policies : [...policies.filter((p) => p.action === "bypass"), ...policies.filter((p) => p.action !== "bypass")];
  for (const p of order) if (policyHolds(p, u, slips)) return `${p.action}:${p.name}`;
  return slips.defaultAllow ? "allow:default" : "deny:default";
}

function accessOption(tex: string, mistake?: MistakeKey): Option {
  const [action, name] = tex.split(":") as [string, string];
  const text: L3 =
    name === "default"
      ? action === "deny"
        ? ["Denied: no policy matches", "Refusé : aucune stratégie ne correspond", "Denegado: ninguna política coincide"]
        : ["Allowed: nothing forbids it", "Autorisé : rien ne l'interdit", "Permitido: nada lo prohíbe"]
      : action === "allow"
        ? [`Allowed by \`${name}\``, `Autorisé par \`${name}\``, `Permitido por \`${name}\``]
        : action === "block"
          ? [`Blocked by \`${name}\``, `Bloqué par \`${name}\``, `Bloqueado por \`${name}\``]
          : [`Let through without login by \`${name}\``, `Laissé passer sans connexion par \`${name}\``, `Dejado pasar sin inicio de sesión por \`${name}\``];
  return opt(tex, L(text), mistake);
}

export const accessPolicy: Generator = (rng: Rng) => {
  for (;;) {
    const user: CfUser = {
      email: rng.pick(["ana@example.com", "li@example.com", "marc@partner.com"]),
      groups: rng.shuffle(["engineering", "contractors", "finance"]).slice(0, rng.int(0, 2)),
      country: rng.pick(["CH", "FR", "US"]),
      encrypted: rng.int(0, 2) > 0,
    };
    const identity = (): CfSelector =>
      rng.pick<CfSelector>([
        { kind: "emailDomain", value: "@example.com" },
        { kind: "emailDomain", value: "@partner.com" },
        { kind: "group", value: rng.pick(["engineering", "finance"]) },
        { kind: "email", value: rng.pick(["ana@example.com", "marc@partner.com"]) },
      ]);
    const condition = (): CfSelector => rng.pick<CfSelector>([{ kind: "country", value: rng.pick(["CH", "FR"]) }, { kind: "posture", value: "encrypted" }, { kind: "group", value: "engineering" }]);
    const names = ["alpha", "bravo", "charlie"];
    const count = rng.int(2, 3);
    const policies: CfPolicy[] = [];
    for (let i = 0; i < count; i++) {
      const action = i === count - 1 && rng.int(0, 2) === 0 ? "bypass" : rng.pick(["allow", "allow", "block"] as const);
      if (action === "bypass") {
        // Bypass takes no identity selectors.
        policies.push({ name: names[i]!, action, include: [{ kind: "country", value: rng.pick(["CH", "US"]) }], require: [], exclude: [] });
        continue;
      }
      const include = action === "block" ? [rng.pick<CfSelector>([{ kind: "country", value: "US" }, { kind: "group", value: "contractors" }, identity()])] : rng.shuffle([identity(), identity()]).slice(0, rng.int(1, 2));
      const require = action === "allow" ? rng.shuffle([condition(), condition()]).slice(0, rng.int(0, 2)) : [];
      const exclude = action === "allow" && rng.int(0, 1) === 0 ? [{ kind: "group", value: "contractors" } as CfSelector] : [];
      policies.push({ name: names[i]!, action, include, require: require.filter((s, j) => require.findIndex((t) => selectorText(t) === selectorText(s)) === j), exclude });
    }
    const real = accessDecision(policies, user);
    const wrong = [
      accessOption(accessDecision(policies, user, { includeAnd: true }), "cfIncludeAnd"),
      accessOption(accessDecision(policies, user, { requireOr: true }), "cfRequireOr"),
      accessOption(accessDecision(policies, user, { excludeIgnored: true }), "cfExcludeIgnored"),
      accessOption(accessDecision(policies, user, { listedOrder: true }), "cfAccessOrder"),
      accessOption(accessDecision(policies, user, { defaultAllow: true }), "cfAccessDefault"),
      ...policies.map((p) => accessOption(`${p.action}:${p.name}`, "cfAccessOrder")),
      accessOption("deny:default", "cfAccessDefault"),
    ];
    const misconceptions = wrong.slice(0, 5).filter((o) => o.tex !== real);
    if (new Set(misconceptions.map((o) => o.tex)).size < 2 || !enough(real, wrong)) continue;
    const list = (head: string, joiner: string, items: CfSelector[]): string[] => items.map((x, j) => (j === 0 ? `   ${head}: ${selectorText(x)}` : `      ${joiner} ${selectorText(x)}`));
    const lines = policies.flatMap((p, i) => [
      `${i + 1}. ${p.name}: ${p.action === "allow" ? "Allow" : p.action === "block" ? "Block" : "Bypass"}`,
      ...list("include", "or", p.include),
      ...list("require", "and", p.require),
      ...list("exclude", "or", p.exclude),
    ]);
    if (lines.some((l) => l.length > CF_LINE_MAX)) continue;
    const who: L3 = [
      `\`${user.email}\`, ${user.groups.length > 0 ? `in the group${user.groups.length > 1 ? "s" : ""} ${user.groups.map((g) => `\`${g}\``).join(" and ")}` : "in no group"}, connects from ${user.country} on a laptop ${user.encrypted ? "with" : "without"} disk encryption.`,
      `\`${user.email}\`, ${user.groups.length > 0 ? `membre ${user.groups.length > 1 ? "des groupes" : "du groupe"} ${user.groups.map((g) => `\`${g}\``).join(" et ")}` : "membre d'aucun groupe"}, se connecte depuis ${user.country} avec un portable ${user.encrypted ? "au disque chiffré" : "au disque non chiffré"}.`,
      `\`${user.email}\`, ${user.groups.length > 0 ? `miembro ${user.groups.length > 1 ? "de los grupos" : "del grupo"} ${user.groups.map((g) => `\`${g}\``).join(" y ")}` : "sin grupo"}, se conecta desde ${user.country} con un portátil ${user.encrypted ? "con el disco cifrado" : "sin cifrar el disco"}.`,
    ];
    return draft(
      `access ${JSON.stringify([policies, user])}`,
      [
        `An Access application has these policies, in this order. ${who[0]} What happens?`,
        `Une application Access a ces stratégies, dans cet ordre. ${who[1]} Que se passe-t-il ?`,
        `Una aplicación de Access tiene estas políticas, en este orden. ${who[2]} ¿Qué pasa?`,
      ],
      lines.join("\n"),
      { type: "accessPolicy", policies, user },
      accessOption(real),
      wrong,
      [
        "Access evaluates Bypass (and Service Auth) policies first, then Allow and Block policies from top to bottom; the first policy that matches decides, and a user who matches none is denied. A policy matches when at least one Include rule matches (OR), every Require rule matches (AND), and no Exclude rule matches (NOT). Bypass skips Access entirely and is not logged.",
        "Access évalue d'abord les stratégies Bypass (et Service Auth), puis les Allow et Block de haut en bas ; la première stratégie qui correspond décide, et un utilisateur qui n'en remplit aucune est refusé. Une stratégie correspond si au moins une règle Include correspond (OU), si toutes les règles Require correspondent (ET) et si aucune règle Exclude ne correspond (NON). Bypass saute Access entièrement et n'est pas journalisé.",
        "Access evalúa primero las políticas Bypass (y Service Auth), luego las Allow y Block de arriba abajo; decide la primera política que coincide, y un usuario que no cumple ninguna queda denegado. Una política coincide si al menos una regla Include coincide (O), todas las reglas Require coinciden (Y) y ninguna regla Exclude coincide (NO). Bypass se salta Access por completo y no queda registrado.",
      ],
    );
  }
};

// ------------------------------------------------------------------- bills

const dollars = (x: number): string => (Math.round(x * 100) / 100).toFixed(2);
const money = (x: number, mistake?: MistakeKey): Option => {
  const s = dollars(x);
  return opt(s, { en: `USD ${s}`, fr: `${s.replace(".", ",")} USD`, es: `${s.replace(".", ",")} USD` }, mistake);
};

/** Workers Paid: $5, 10 million requests and 30 million CPU-ms included; $0.30 per million requests and $0.02 per million CPU-ms beyond. */
export function workersBill(millionRequests: number, cpuMs: number, how: { included?: false; base?: false; ms?: number } = {}): number {
  const ms = how.ms ?? cpuMs;
  const requests = how.included === false ? millionRequests : Math.max(0, millionRequests - 10);
  const cpu = how.included === false ? millionRequests * ms : Math.max(0, millionRequests * ms - 30);
  return (how.base === false ? 0 : 5) + requests * 0.3 + cpu * 0.02;
}

export const workersCost: Generator = (rng: Rng) => {
  for (;;) {
    const millionRequests = rng.pick([12, 25, 40, 80, 150]);
    const cpuMs = rng.pick([2, 5, 7, 12, 20]);
    const wallMs = rng.pick([150, 300, 800]);
    const real = dollars(workersBill(millionRequests, cpuMs));
    const wrong = [
      money(workersBill(millionRequests, cpuMs, { included: false }), "cfIncludedIgnored"),
      money(workersBill(millionRequests, cpuMs, { base: false }), "cfBaseForgotten"),
      money(workersBill(millionRequests, cpuMs, { ms: wallMs }), "cfWallTime"),
      money(workersBill(millionRequests, cpuMs, { ms: 0 }), "cfCpuIgnored"),
    ];
    if (!enough(real, wrong)) continue;
    return draft(
      `workers ${millionRequests} ${cpuMs} ${wallMs}`,
      [
        `On Workers Paid (USD 5 a month, 10 million requests and 30 million CPU-ms included; then USD 0.30 per million requests and USD 0.02 per million CPU-ms), a Worker serves ${millionRequests} million requests in a month. Each uses ${cpuMs} ms of CPU and lasts ${wallMs} ms, mostly waiting for an API. What is the month's bill?`,
        `Avec Workers Paid (5 USD par mois, 10 millions de requêtes et 30 millions de ms de CPU inclus ; puis 0,30 USD par million de requêtes et 0,02 USD par million de ms de CPU), un Worker sert ${millionRequests} millions de requêtes en un mois. Chacune utilise ${cpuMs} ms de CPU et dure ${wallMs} ms, surtout à attendre une API. Quelle est la facture du mois ?`,
        `Con Workers Paid (5 USD al mes, 10 millones de peticiones y 30 millones de ms de CPU incluidos; después 0,30 USD por millón de peticiones y 0,02 USD por millón de ms de CPU), un Worker atiende ${millionRequests} millones de peticiones en un mes. Cada una usa ${cpuMs} ms de CPU y dura ${wallMs} ms, sobre todo esperando a una API. ¿Cuál es la factura del mes?`,
      ],
      undefined,
      { type: "workersCost", millionRequests, cpuMs, wallMs },
      money(Number(real)),
      wrong,
      [
        `Only CPU time is billed, never the time spent waiting: ${millionRequests} million × ${cpuMs} ms = ${millionRequests * cpuMs} million CPU-ms. Beyond the included amounts: ${Math.max(0, millionRequests - 10)} million requests × USD 0.30 and ${Math.max(0, millionRequests * cpuMs - 30)} million CPU-ms × USD 0.02, plus the USD 5 subscription: USD ${real}. There is no charge for egress.`,
        `Seul le temps CPU est facturé, jamais le temps d'attente : ${millionRequests} millions × ${cpuMs} ms = ${millionRequests * cpuMs} millions de ms de CPU. Au-delà des quantités incluses : ${Math.max(0, millionRequests - 10)} millions de requêtes × 0,30 USD et ${Math.max(0, millionRequests * cpuMs - 30)} millions de ms de CPU × 0,02 USD, plus l'abonnement de 5 USD : ${real.replace(".", ",")} USD. Le trafic sortant n'est pas facturé.`,
        `Solo se factura el tiempo de CPU, nunca el tiempo de espera: ${millionRequests} millones × ${cpuMs} ms = ${millionRequests * cpuMs} millones de ms de CPU. Por encima de lo incluido: ${Math.max(0, millionRequests - 10)} millones de peticiones × 0,30 USD y ${Math.max(0, millionRequests * cpuMs - 30)} millones de ms de CPU × 0,02 USD, más la suscripción de 5 USD: ${real.replace(".", ",")} USD. El tráfico saliente no se factura.`,
      ],
    );
  }
};

/** Workers AI: 10,000 Neurons free each day, then $0.011 per 1,000 Neurons. */
export function aiBill(neuronsPerDay: number, days: number, how: { monthly?: true; free?: false; perMillion?: true } = {}): number {
  const unit = how.perMillion ? 0.011 / 1_000_000 : 0.011 / 1000;
  if (how.free === false) return neuronsPerDay * days * unit;
  if (how.monthly) return Math.max(0, neuronsPerDay * days - 10_000) * unit;
  return Math.max(0, neuronsPerDay - 10_000) * days * unit;
}

export const aiCost: Generator = (rng: Rng) => {
  for (;;) {
    const neuronsPerDay = rng.pick([25_000, 40_000, 60_000, 120_000, 500_000]);
    const days = 30;
    const real = dollars(aiBill(neuronsPerDay, days));
    const wrong = [
      money(aiBill(neuronsPerDay, days, { monthly: true }), "cfNeuronsMonthly"),
      money(aiBill(neuronsPerDay, days, { free: false }), "cfFreeIgnored"),
      money(aiBill(neuronsPerDay, days, { perMillion: true }), "cfNeuronUnit"),
      money(aiBill(neuronsPerDay, days) * 1000, "cfNeuronUnit"),
    ];
    if (!enough(real, wrong)) continue;
    const n = neuronsPerDay.toLocaleString("en-US");
    const nf = neuronsPerDay.toLocaleString("fr-CH").replace(/ |’/g, " ");
    return draft(
      `ai ${neuronsPerDay} ${days}`,
      [
        `An app on Workers Paid uses ${n} Neurons of Workers AI every day for ${days} days. The first 10,000 Neurons each day are free, then they cost USD 0.011 per 1,000. What does the month's inference cost?`,
        `Une application sur Workers Paid utilise ${nf} Neurons de Workers AI chaque jour pendant ${days} jours. Les 10 000 premiers Neurons de chaque jour sont gratuits, puis ils coûtent 0,011 USD les 1 000. Combien coûte l'inférence du mois ?`,
        `Una aplicación en Workers Paid usa ${nf} Neurons de Workers AI cada día durante ${days} días. Los primeros 10 000 Neurons de cada día son gratis; después cuestan 0,011 USD cada 1000. ¿Cuánto cuesta la inferencia del mes?`,
      ],
      undefined,
      { type: "aiCost", neuronsPerDay, days },
      money(Number(real)),
      wrong,
      [
        `The free allocation is daily and resets at 00:00 UTC: each day ${n} − 10,000 = ${(neuronsPerDay - 10_000).toLocaleString("en-US")} Neurons are billed, × USD 0.011 / 1,000, × ${days} days = USD ${real}. Neurons measure GPU work; each model's page also gives its price per million input and output tokens.`,
        `L'allocation gratuite est quotidienne et repart à 00:00 UTC : chaque jour, ${nf} − 10 000 Neurons sont facturés, × 0,011 USD / 1 000, × ${days} jours = ${real.replace(".", ",")} USD. Les Neurons mesurent le travail des GPU ; la page de chaque modèle donne aussi son prix par million de tokens d'entrée et de sortie.`,
        `La asignación gratuita es diaria y se reinicia a las 00:00 UTC: cada día se facturan ${nf} − 10 000 Neurons, × 0,011 USD / 1000, × ${days} días = ${real.replace(".", ",")} USD. Los Neurons miden el trabajo de las GPU; la página de cada modelo da también su precio por millón de tokens de entrada y de salida.`,
      ],
    );
  }
};
