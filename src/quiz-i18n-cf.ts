/** Texts of the Cloudflare test, in French, Spanish and English; merged into quiz-i18n.ts. */
import type { CfTopic } from "../shared/quiz";

type Lang = "fr" | "es" | "en";
type Tri = Record<Lang, string>;

export const CF_TEXTS = {
  fr: { modeCf: "🔶 Cloudflare", cfSetupTitle: "QCM : Cloudflare" },
  es: { modeCf: "🔶 Cloudflare", cfSetupTitle: "Test: Cloudflare" },
  en: { modeCf: "🔶 Cloudflare", cfSetupTitle: "Test: Cloudflare" },
} satisfies Record<Lang, Record<string, string>>;

export const CF_LEVEL_NAMES: Record<"cfBeginner" | "cfIntermediate" | "cfAdvanced" | "cfExpert", Tri> = {
  cfBeginner: { fr: "Débutant", es: "Principiante", en: "Beginner" },
  cfIntermediate: { fr: "Intermédiaire", es: "Intermedio", en: "Intermediate" },
  cfAdvanced: { fr: "Avancé", es: "Avanzado", en: "Advanced" },
  cfExpert: { fr: "Expert", es: "Experto", en: "Expert" },
};

export const CF_GROUPS: Record<Lang, { cfNetwork: string; cfDeveloper: string; cfOneAi: string }> = {
  fr: { cfNetwork: "Réseau et sécurité", cfDeveloper: "Plateforme développeur", cfOneAi: "Zero Trust et IA" },
  es: { cfNetwork: "Red y seguridad", cfDeveloper: "Plataforma para desarrolladores", cfOneAi: "Zero Trust e IA" },
  en: { cfNetwork: "Network and security", cfDeveloper: "Developer platform", cfOneAi: "Zero Trust and AI" },
};

export const CF_TOPIC_NAMES: Record<Lang, Record<CfTopic, string>> = {
  fr: {
    cfDns: "DNS, proxy et anycast",
    cfTls: "SSL/TLS et certificats",
    cfCache: "Cache et performance",
    cfSecurity: "WAF, règles, bots",
    cfWorkers: "Workers",
    cfStorage: "KV, R2, D1, Durable Objects",
    cfZeroTrust: "Access, Tunnel, Gateway",
    cfAi: "Workers AI, AI Gateway, RAG",
  },
  es: {
    cfDns: "DNS, proxy y anycast",
    cfTls: "SSL/TLS y certificados",
    cfCache: "Caché y rendimiento",
    cfSecurity: "WAF, reglas, bots",
    cfWorkers: "Workers",
    cfStorage: "KV, R2, D1, Durable Objects",
    cfZeroTrust: "Access, Tunnel, Gateway",
    cfAi: "Workers AI, AI Gateway, RAG",
  },
  en: {
    cfDns: "DNS, proxy and anycast",
    cfTls: "SSL/TLS and certificates",
    cfCache: "Cache and performance",
    cfSecurity: "WAF, rules, bots",
    cfWorkers: "Workers",
    cfStorage: "KV, R2, D1, Durable Objects",
    cfZeroTrust: "Access, Tunnel, Gateway",
    cfAi: "Workers AI, AI Gateway, RAG",
  },
};

export const CF_SKILLS: Record<Lang, Record<string, string>> = {
  fr: {
    "cfDns.dnsBasics": "Proxy, anycast, mise en place d'une zone",
    "cfDns.dnsSetup": "Aplatissement, TTL, messagerie, DNSSEC",
    "cfDns.dnsAdvanced": "Fuites d'origine, ports, déménagement",
    "cfDns.dnsExpert": "Configurations partielle et secondaire",
    "cfTls.tlsBasics": "Modes de chiffrement, Universal SSL",
    "cfTls.tlsMode": "Ce que donne un mode face à l'origine",
    "cfTls.tlsCertificates": "Origin CA, certificats avancés, HSTS",
    "cfTls.tlsOrigin": "mTLS, erreur 526, verrouiller l'origine",
    "cfTls.tlsExpert": "Validités, SSL-only origin pull, HSTS",
    "cfCache.cacheBasics": "Ce qui est mis en cache, CF-Cache-Status",
    "cfCache.cacheRules": "Clés de cache, TTL, purges",
    "cfCache.cacheTtl": "Combien de temps une réponse est gardée",
    "cfCache.cacheTiers": "Tiered Cache, Cache Reserve, Workers",
    "cfCache.cacheExpert": "Purges, coûts, clés personnalisées",
    "cfSecurity.securityBasics": "DDoS, défis, règles, Turnstile",
    "cfSecurity.wafRules": "Ordre du WAF, Skip, limitation de débit",
    "cfSecurity.ruleMatch": "Ce que sélectionne une expression",
    "cfSecurity.botsApi": "Bots, OWASP, API Shield",
    "cfSecurity.phaseOrder": "L'ordre des phases",
    "cfSecurity.securityExpert": "Exceptions, redirections, Advanced Rate Limiting",
    "cfWorkers.workersBasics": "Isolats, limites, liaisons, secrets",
    "cfWorkers.workersConfig": "Configuration, environnements, routes",
    "cfWorkers.workersCost": "La facture de Workers",
    "cfWorkers.workersRuntime": "État global, CPU, Smart Placement",
    "cfWorkers.workersExpert": "Sous-requêtes, déploiements, Tail Workers, cf",
    "cfStorage.storageBasics": "R2, KV, D1, Durable Objects",
    "cfStorage.storageChoice": "Choisir un stockage, Queues, D1",
    "cfStorage.durableObjects": "Concevoir avec des Durable Objects",
    "cfStorage.storageExpert": "D1, Workflows, Hyperdrive, Queues",
    "cfZeroTrust.ztBasics": "Access, Tunnel, le client",
    "cfZeroTrust.accessTunnel": "Stratégies Access, jetons, tunnels",
    "cfZeroTrust.tunnelIngress": "Quelle règle d'entrée sert une requête",
    "cfZeroTrust.gateway": "Gateway, inspection, réseaux privés",
    "cfZeroTrust.accessPolicy": "Quelle stratégie Access décide",
    "cfZeroTrust.ztExpert": "JWT, ordre de Gateway, modes du client",
    "cfAi.aiBasics": "Workers AI, AI Gateway, Vectorize, RAG",
    "cfAi.aiGateway": "Cache, bascules, choix du modèle",
    "cfAi.aiCost": "La facture de Workers AI",
    "cfAi.rag": "Vectorize et AI Search",
    "cfAi.agents": "Agents et facturation unifiée",
  },
  es: {
    "cfDns.dnsBasics": "Proxy, anycast, alta de una zona",
    "cfDns.dnsSetup": "Aplanamiento, TTL, correo, DNSSEC",
    "cfDns.dnsAdvanced": "Fugas del origen, puertos, mudanza",
    "cfDns.dnsExpert": "Configuraciones parcial y secundaria",
    "cfTls.tlsBasics": "Modos de cifrado, Universal SSL",
    "cfTls.tlsMode": "Qué da un modo frente al origen",
    "cfTls.tlsCertificates": "Origin CA, certificados avanzados, HSTS",
    "cfTls.tlsOrigin": "mTLS, error 526, cerrar el origen",
    "cfTls.tlsExpert": "Validez, SSL-only origin pull, HSTS",
    "cfCache.cacheBasics": "Qué se guarda en caché, CF-Cache-Status",
    "cfCache.cacheRules": "Claves de caché, TTL, purgas",
    "cfCache.cacheTtl": "Cuánto tiempo se guarda una respuesta",
    "cfCache.cacheTiers": "Tiered Cache, Cache Reserve, Workers",
    "cfCache.cacheExpert": "Purgas, costes, claves personalizadas",
    "cfSecurity.securityBasics": "DDoS, desafíos, reglas, Turnstile",
    "cfSecurity.wafRules": "Orden del WAF, Skip, limitación de velocidad",
    "cfSecurity.ruleMatch": "Qué selecciona una expresión",
    "cfSecurity.botsApi": "Bots, OWASP, API Shield",
    "cfSecurity.phaseOrder": "El orden de las fases",
    "cfSecurity.securityExpert": "Excepciones, redirecciones, Advanced Rate Limiting",
    "cfWorkers.workersBasics": "Aislados, límites, enlaces, secretos",
    "cfWorkers.workersConfig": "Configuración, entornos, rutas",
    "cfWorkers.workersCost": "La factura de Workers",
    "cfWorkers.workersRuntime": "Estado global, CPU, Smart Placement",
    "cfWorkers.workersExpert": "Subpeticiones, despliegues, Tail Workers, cf",
    "cfStorage.storageBasics": "R2, KV, D1, Durable Objects",
    "cfStorage.storageChoice": "Elegir almacenamiento, Queues, D1",
    "cfStorage.durableObjects": "Diseñar con Durable Objects",
    "cfStorage.storageExpert": "D1, Workflows, Hyperdrive, Queues",
    "cfZeroTrust.ztBasics": "Access, Tunnel, el cliente",
    "cfZeroTrust.accessTunnel": "Políticas de Access, tokens, túneles",
    "cfZeroTrust.tunnelIngress": "Qué regla de entrada atiende una petición",
    "cfZeroTrust.gateway": "Gateway, inspección, redes privadas",
    "cfZeroTrust.accessPolicy": "Qué política de Access decide",
    "cfZeroTrust.ztExpert": "JWT, orden de Gateway, modos del cliente",
    "cfAi.aiBasics": "Workers AI, AI Gateway, Vectorize, RAG",
    "cfAi.aiGateway": "Caché, cambios de modelo, elegir modelo",
    "cfAi.aiCost": "La factura de Workers AI",
    "cfAi.rag": "Vectorize y AI Search",
    "cfAi.agents": "Agentes y facturación unificada",
  },
  en: {
    "cfDns.dnsBasics": "Proxy, anycast, adding a zone",
    "cfDns.dnsSetup": "Flattening, TTL, mail, DNSSEC",
    "cfDns.dnsAdvanced": "Origin leaks, ports, moving away",
    "cfDns.dnsExpert": "Partial and secondary setups",
    "cfTls.tlsBasics": "Encryption modes, Universal SSL",
    "cfTls.tlsMode": "What a mode gives against the origin",
    "cfTls.tlsCertificates": "Origin CA, advanced certificates, HSTS",
    "cfTls.tlsOrigin": "mTLS, error 526, locking the origin",
    "cfTls.tlsExpert": "Validity, SSL-only origin pull, HSTS",
    "cfCache.cacheBasics": "What is cached, CF-Cache-Status",
    "cfCache.cacheRules": "Cache keys, TTLs, purges",
    "cfCache.cacheTtl": "How long a response is kept",
    "cfCache.cacheTiers": "Tiered Cache, Cache Reserve, Workers",
    "cfCache.cacheExpert": "Purges, costs, custom keys",
    "cfSecurity.securityBasics": "DDoS, challenges, rules, Turnstile",
    "cfSecurity.wafRules": "WAF order, Skip, rate limiting",
    "cfSecurity.ruleMatch": "What an expression matches",
    "cfSecurity.botsApi": "Bots, OWASP, API Shield",
    "cfSecurity.phaseOrder": "The order of the phases",
    "cfSecurity.securityExpert": "Exceptions, redirects, Advanced Rate Limiting",
    "cfWorkers.workersBasics": "Isolates, limits, bindings, secrets",
    "cfWorkers.workersConfig": "Configuration, environments, routes",
    "cfWorkers.workersCost": "The Workers bill",
    "cfWorkers.workersRuntime": "Global state, CPU, Smart Placement",
    "cfWorkers.workersExpert": "Subrequests, deployments, Tail Workers, cf",
    "cfStorage.storageBasics": "R2, KV, D1, Durable Objects",
    "cfStorage.storageChoice": "Choosing a store, Queues, D1",
    "cfStorage.durableObjects": "Designing with Durable Objects",
    "cfStorage.storageExpert": "D1, Workflows, Hyperdrive, Queues",
    "cfZeroTrust.ztBasics": "Access, Tunnel, the client",
    "cfZeroTrust.accessTunnel": "Access policies, tokens, tunnels",
    "cfZeroTrust.tunnelIngress": "Which ingress rule serves a request",
    "cfZeroTrust.gateway": "Gateway, inspection, private networks",
    "cfZeroTrust.accessPolicy": "Which Access policy decides",
    "cfZeroTrust.ztExpert": "JWTs, Gateway's order, client modes",
    "cfAi.aiBasics": "Workers AI, AI Gateway, Vectorize, RAG",
    "cfAi.aiGateway": "Caching, fallbacks, choosing a model",
    "cfAi.aiCost": "The Workers AI bill",
    "cfAi.rag": "Vectorize and AI Search",
    "cfAi.agents": "Agents and Unified Billing",
  },
};

type CfMistake =
  | "cfRulePrecedence"
  | "cfRuleCase"
  | "cfWildcardCase"
  | "cfWildcardAnchor"
  | "cfContains"
  | "cfRuleMisread"
  | "cfPhaseListed"
  | "cfManagedFirst"
  | "cfBulkFirst"
  | "cfAccessFirst"
  | "cfCacheStops"
  | "cfRedirectLast"
  | "cfRedirectLoop"
  | "cfFlexibleSafe"
  | "cfFullNotStrict"
  | "cfOriginCaUntrusted"
  | "cfHtmlCached"
  | "cfCacheBypass"
  | "cfBrowserTtl"
  | "cfDefaultEdgeTtl"
  | "cfSmaxage"
  | "cfEdgeBrowser"
  | "cfNoHeaders"
  | "cfIngressSpecific"
  | "cfIngressLast"
  | "cfIngressPath"
  | "cfIngressWildcard"
  | "cfRequireOr"
  | "cfExcludeIgnored"
  | "cfAccessOrder"
  | "cfAccessDefault"
  | "cfIncludeAnd"
  | "cfIncludedIgnored"
  | "cfBaseForgotten"
  | "cfWallTime"
  | "cfCpuIgnored"
  | "cfNeuronsMonthly"
  | "cfFreeIgnored"
  | "cfNeuronUnit";

export const CF_MISTAKES: Record<Lang, Record<CfMistake, string>> = {
  fr: {
    cfRulePrecedence: "or pris avant and, ou not sur le tout",
    cfRuleCase: "eq, contains ou in pris pour insensibles à la casse",
    cfWildcardCase: "wildcard pris pour sensible à la casse",
    cfWildcardAnchor: "wildcard pris pour une partie de la valeur",
    cfContains: "contains pris pour « commence par »",
    cfRuleMisread: "Expression mal lue",
    cfPhaseListed: "Règles prises dans l'ordre affiché, pas celui des phases",
    cfManagedFirst: "Règles gérées prises avant les règles personnalisées",
    cfBulkFirst: "Bulk Redirects prises en premier, comme les Single Redirects",
    cfAccessFirst: "Contrôle d'Access pris avant le WAF",
    cfCacheStops: "Cache Rule prise pour arrêter la requête",
    cfRedirectLast: "Redirections prises après les phases de sécurité",
    cfRedirectLoop: "Boucle de redirection de Flexible manquée ou imaginée",
    cfFlexibleSafe: "Flexible pris pour chiffrer jusqu'à l'origine",
    cfFullNotStrict: "Full et Full (strict) confondus",
    cfOriginCaUntrusted: "Certificat Origin CA pris pour refusé en Full (strict)",
    cfHtmlCached: "HTML ou JSON pris pour mis en cache par défaut",
    cfCacheBypass: "Cookie ou private, no-store pris pour sans effet sur le cache",
    cfBrowserTtl: "TTL du navigateur pris pour celui de l'origine même sous 4 h",
    cfDefaultEdgeTtl: "TTL par défaut de Cloudflare pris pour 4 heures",
    cfSmaxage: "s-maxage ignoré par Cloudflare",
    cfEdgeBrowser: "TTL de Cloudflare et du navigateur confondus",
    cfNoHeaders: "Réponse sans en-tête de cache prise pour non mise en cache",
    cfIngressSpecific: "Règle d'entrée la plus précise prise pour gagnante, pas la première",
    cfIngressLast: "Dernière règle d'entrée correspondante prise pour gagnante",
    cfIngressPath: "Chemin d'une règle d'entrée ignoré",
    cfIngressWildcard: "*.example.com pris pour couvrant example.com",
    cfRequireOr: "Require pris pour un OU",
    cfExcludeIgnored: "Exclude ignoré",
    cfAccessOrder: "Bypass pas évalué en premier, ou mauvaise stratégie",
    cfAccessDefault: "Utilisateur sans stratégie pris pour autorisé",
    cfIncludeAnd: "Include pris pour un ET",
    cfIncludedIgnored: "Quantités incluses de Workers Paid non déduites",
    cfBaseForgotten: "Abonnement de 5 USD oublié",
    cfWallTime: "Temps réel facturé au lieu du temps CPU",
    cfCpuIgnored: "Temps CPU oublié dans la facture",
    cfNeuronsMonthly: "Neurons gratuits pris par mois, pas par jour",
    cfFreeIgnored: "Neurons gratuits non déduits",
    cfNeuronUnit: "Prix par 1 000 Neurons mal lu",
  },
  es: {
    cfRulePrecedence: "or tomado antes que and, o not sobre todo",
    cfRuleCase: "eq, contains o in tomados como sin mayúsculas",
    cfWildcardCase: "wildcard tomado como sensible a mayúsculas",
    cfWildcardAnchor: "wildcard tomado como parte del valor",
    cfContains: "contains tomado como «empieza por»",
    cfRuleMisread: "Expresión mal leída",
    cfPhaseListed: "Reglas tomadas en el orden mostrado, no el de las fases",
    cfManagedFirst: "Reglas gestionadas tomadas antes que las personalizadas",
    cfBulkFirst: "Bulk Redirects tomadas primero, como las Single Redirects",
    cfAccessFirst: "Comprobación de Access tomada antes que el WAF",
    cfCacheStops: "Cache Rule tomada como si detuviera la petición",
    cfRedirectLast: "Redirecciones tomadas tras las fases de seguridad",
    cfRedirectLoop: "Bucle de redirección de Flexible omitido o inventado",
    cfFlexibleSafe: "Flexible tomado como si cifrara hasta el origen",
    cfFullNotStrict: "Full y Full (strict) confundidos",
    cfOriginCaUntrusted: "Certificado Origin CA tomado como rechazado en Full (strict)",
    cfHtmlCached: "HTML o JSON tomados como guardados por defecto",
    cfCacheBypass: "Cookie o private, no-store tomados como sin efecto en la caché",
    cfBrowserTtl: "TTL del navegador tomado como el del origen aun bajo 4 h",
    cfDefaultEdgeTtl: "TTL por defecto de Cloudflare tomado como 4 horas",
    cfSmaxage: "s-maxage ignorado por Cloudflare",
    cfEdgeBrowser: "TTL de Cloudflare y del navegador confundidos",
    cfNoHeaders: "Respuesta sin cabeceras de caché tomada como no guardada",
    cfIngressSpecific: "Regla de entrada más precisa tomada como ganadora, no la primera",
    cfIngressLast: "Última regla de entrada que coincide tomada como ganadora",
    cfIngressPath: "Ruta de una regla de entrada ignorada",
    cfIngressWildcard: "*.example.com tomado como si cubriera example.com",
    cfRequireOr: "Require tomado como O",
    cfExcludeIgnored: "Exclude ignorado",
    cfAccessOrder: "Bypass no evaluado primero, o política equivocada",
    cfAccessDefault: "Usuario sin política tomado como permitido",
    cfIncludeAnd: "Include tomado como Y",
    cfIncludedIgnored: "Lo incluido en Workers Paid no descontado",
    cfBaseForgotten: "Suscripción de 5 USD olvidada",
    cfWallTime: "Tiempo real facturado en lugar del de CPU",
    cfCpuIgnored: "Tiempo de CPU olvidado en la factura",
    cfNeuronsMonthly: "Neurons gratis tomados por mes, no por día",
    cfFreeIgnored: "Neurons gratis no descontados",
    cfNeuronUnit: "Precio por 1000 Neurons mal leído",
  },
  en: {
    cfRulePrecedence: "or taken before and, or not over the whole",
    cfRuleCase: "eq, contains or in taken to ignore case",
    cfWildcardCase: "wildcard taken to be case-sensitive",
    cfWildcardAnchor: "wildcard taken to match part of the value",
    cfContains: "contains taken as “starts with”",
    cfRuleMisread: "The expression misread",
    cfPhaseListed: "Rules taken in listed order, not the phases'",
    cfManagedFirst: "Managed rules taken to run before custom rules",
    cfBulkFirst: "Bulk Redirects taken to run first, like Single Redirects",
    cfAccessFirst: "The Access check taken to run before the WAF",
    cfCacheStops: "A Cache Rule taken to stop the request",
    cfRedirectLast: "Redirects taken to run after the security phases",
    cfRedirectLoop: "Flexible's redirect loop missed or imagined",
    cfFlexibleSafe: "Flexible taken to encrypt up to the origin",
    cfFullNotStrict: "Full and Full (strict) confused",
    cfOriginCaUntrusted: "An Origin CA certificate taken to fail Full (strict)",
    cfHtmlCached: "HTML or JSON taken to be cached by default",
    cfCacheBypass: "A cookie or private, no-store taken not to stop caching",
    cfBrowserTtl: "Browser TTL taken as the origin's even under 4 hours",
    cfDefaultEdgeTtl: "Cloudflare's default TTL taken as 4 hours",
    cfSmaxage: "s-maxage ignored by Cloudflare",
    cfEdgeBrowser: "Cloudflare's and the browser's TTLs confused",
    cfNoHeaders: "A response without cache headers taken as not cached",
    cfIngressSpecific: "The most specific ingress rule taken to win, not the first",
    cfIngressLast: "The last matching ingress rule taken to win",
    cfIngressPath: "An ingress rule's path ignored",
    cfIngressWildcard: "*.example.com taken to cover example.com",
    cfRequireOr: "Require taken as OR",
    cfExcludeIgnored: "Exclude ignored",
    cfAccessOrder: "Bypass not evaluated first, or the wrong policy",
    cfAccessDefault: "A user matching no policy taken to be allowed",
    cfIncludeAnd: "Include taken as AND",
    cfIncludedIgnored: "Workers Paid's included usage not subtracted",
    cfBaseForgotten: "The USD 5 subscription forgotten",
    cfWallTime: "Wall time billed instead of CPU time",
    cfCpuIgnored: "CPU time left out of the bill",
    cfNeuronsMonthly: "Free Neurons taken per month, not per day",
    cfFreeIgnored: "Free Neurons not subtracted",
    cfNeuronUnit: "The price per 1,000 Neurons misread",
  },
};
