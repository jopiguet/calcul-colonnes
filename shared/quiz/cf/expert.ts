/**
 * Cloudflare, Expert: flattening and zone transfers, origin certificates and
 * HSTS at scale, purges and Cache Reserve, the WAF's edges, Workers in
 * production, D1, Workflows and Hyperdrive, Access tokens and Gateway's
 * order, agents.
 */
import type { LinuxQuestion as CfQuestion } from "../linux/types";

const dnsExpert: CfQuestion[] = [
  {
    id: "cf-dns-13",
    q: ["You turn on CNAME flattening for every record, not only the apex. What can break?", "Tu actives l'aplatissement des CNAME pour tous les enregistrements, pas seulement l'apex. Qu'est-ce qui peut casser ?", "Activas el aplanamiento de CNAME para todos los registros, no solo el ápex. ¿Qué puede romperse?"],
    a: ["Third-party domain verification that expects to see the CNAME itself", "Les vérifications de domaine par des tiers qui s'attendent à voir le CNAME lui-même", "Las verificaciones de dominio de terceros que esperan ver el propio CNAME"],
    w: [["Nothing: answers are identical", "Rien : les réponses sont identiques", "Nada: las respuestas son idénticas"], ["The proxy stops working for those records", "Le proxy cesse de fonctionner pour ces enregistrements", "El proxy deja de funcionar para esos registros"], ["DNSSEC must be turned off", "DNSSEC doit être désactivé", "DNSSEC debe desactivarse"]],
    e: [
      "Flattened records answer with the final addresses, so a service that checks `_verify.example.com CNAME verify.vendor.com` never sees the CNAME. Keep flattening at the apex only unless you need it, or flatten selectively.",
      "Les enregistrements aplatis répondent avec les adresses finales : un service qui vérifie `_verify.example.com CNAME verify.vendor.com` ne voit jamais le CNAME. Garde l'aplatissement à l'apex sauf besoin, ou aplatis de façon sélective.",
      "Los registros aplanados responden con las direcciones finales, así que un servicio que comprueba `_verify.example.com CNAME verify.vendor.com` nunca ve el CNAME. Deja el aplanamiento solo en el ápex salvo que lo necesites, o aplana de forma selectiva.",
    ],
  },
  {
    id: "cf-dns-14",
    q: ["A company wants Cloudflare and another provider to serve the same zone, kept in sync by zone transfers. What does that need?", "Une entreprise veut que Cloudflare et un autre fournisseur servent la même zone, synchronisée par transferts de zone. Que faut-il ?", "Una empresa quiere que Cloudflare y otro proveedor sirvan la misma zona, sincronizada por transferencias de zona. ¿Qué hace falta?"],
    a: ["The Enterprise plan: zone transfers (Cloudflare as primary or secondary) are an Enterprise setup", "Le plan Enterprise : les transferts de zone (Cloudflare en primaire ou secondaire) sont une configuration Enterprise", "El plan Enterprise: las transferencias de zona (Cloudflare como primario o secundario) son una configuración de Enterprise"],
    w: [["Any plan, with a TXT record", "N'importe quel plan, avec un enregistrement TXT", "Cualquier plan, con un registro TXT"], ["The Business plan's partial setup", "La configuration partielle du plan Business", "La configuración parcial del plan Business"], ["Nothing: it is not possible with Cloudflare", "Rien : ce n'est pas possible avec Cloudflare", "Nada: no es posible con Cloudflare"]],
    e: [
      "Free and Pro offer the full setup only; Business adds the partial (CNAME) setup; Enterprise adds zone transfers (AXFR, IXFR) and subdomain setups. Multi-provider DNS improves resilience; with DNSSEC it needs multi-signer configuration.",
      "Free et Pro n'offrent que la configuration complète ; Business ajoute la partielle (CNAME) ; Enterprise ajoute les transferts de zone (AXFR, IXFR) et les configurations de sous-domaines. Un DNS chez plusieurs fournisseurs améliore la résilience ; avec DNSSEC, il demande une configuration multi-signataire.",
      "Free y Pro solo ofrecen la configuración completa; Business añade la parcial (CNAME); Enterprise añade las transferencias de zona (AXFR, IXFR) y las configuraciones de subdominios. Un DNS en varios proveedores mejora la resiliencia; con DNSSEC requiere una configuración multifirmante.",
    ],
  },
  {
    id: "cf-dns-15",
    q: ["A partial (CNAME) setup proxies `www`. What does it not get compared with a full setup?", "Une configuration partielle (CNAME) proxifie `www`. Que n'obtient-elle pas par rapport à une configuration complète ?", "Una configuración parcial (CNAME) proxifica `www`. ¿Qué no obtiene frente a una configuración completa?"],
    a: ["DDoS protection of the DNS itself, since Cloudflare's nameservers do not answer for the zone", "La protection DDoS du DNS lui-même, puisque les serveurs de noms de Cloudflare ne répondent pas pour la zone", "La protección DDoS del propio DNS, ya que los servidores de nombres de Cloudflare no responden por la zona"],
    w: [["The WAF on `www`", "Le WAF sur `www`", "El WAF en `www`"], ["The cache on `www`", "Le cache sur `www`", "La caché en `www`"], ["An edge certificate for `www`", "Un certificat de bordure pour `www`", "Un certificado de borde para `www`"]],
    e: [
      "Proxied hostnames get the application products as in a full setup, and each gets its own Universal SSL certificate. But the zone's DNS stays at the other provider, with its own resilience, and the apex can be proxied only if that provider flattens CNAMEs.",
      "Les noms proxifiés ont les produits applicatifs comme en configuration complète, et chacun a son propre certificat Universal SSL. Mais le DNS de la zone reste chez l'autre fournisseur, avec sa propre résilience, et l'apex ne peut être proxifié que si ce fournisseur aplatit les CNAME.",
      "Los nombres proxificados tienen los productos de aplicación como en la configuración completa, y cada uno recibe su propio certificado Universal SSL. Pero el DNS de la zona sigue en el otro proveedor, con su propia resiliencia, y el ápex solo se puede proxificar si ese proveedor aplana los CNAME.",
    ],
  },
];

const tlsExpert: CfQuestion[] = [
  {
    id: "cf-tls-13",
    q: ["What can a Cloudflare Origin CA certificate cover?", "Que peut couvrir un certificat Cloudflare Origin CA ?", "¿Qué puede cubrir un certificado Cloudflare Origin CA?"],
    a: ["Up to 200 names, with wildcards one level deep, for up to 15 years; no IP addresses", "Jusqu'à 200 noms, avec des jokers d'un seul niveau, jusqu'à 15 ans ; pas d'adresses IP", "Hasta 200 nombres, con comodines de un solo nivel, hasta 15 años; sin direcciones IP"],
    w: [["One name, for 90 days", "Un nom, pour 90 jours", "Un nombre, durante 90 días"], ["Any number of names and IP addresses", "N'importe quel nombre de noms et d'adresses IP", "Cualquier número de nombres y direcciones IP"], ["Wildcards at any depth, `*.*.example.com`", "Des jokers à toute profondeur, `*.*.example.com`", "Comodines a cualquier profundidad, `*.*.example.com`"]],
    e: [
      "A long validity means few renewals, but also that a leaked key stays usable for years: revoke it in the dashboard if it leaks. Since only Cloudflare trusts these certificates, they are for proxied hostnames with Full (strict).",
      "Une longue validité veut dire peu de renouvellements, mais aussi qu'une clé divulguée reste utilisable des années : révoque-la dans le tableau de bord en cas de fuite. Comme seul Cloudflare fait confiance à ces certificats, ils sont pour des noms proxifiés en Full (strict).",
      "Una validez larga significa pocas renovaciones, pero también que una clave filtrada sigue siendo útil durante años: revócala en el panel si se filtra. Como solo Cloudflare confía en estos certificados, son para nombres proxificados con Full (strict).",
    ],
  },
  {
    id: "cf-tls-14",
    q: ["What does the mode Strict (SSL-only origin pull) add to Full (strict)?", "Qu'ajoute le mode Strict (SSL-only origin pull) à Full (strict) ?", "¿Qué añade el modo Strict (SSL-only origin pull) a Full (strict)?"],
    a: ["Cloudflare connects to the origin over HTTPS even when the visitor used HTTP", "Cloudflare se connecte à l'origine en HTTPS même quand le visiteur a utilisé HTTP", "Cloudflare se conecta al origen por HTTPS aunque el visitante usara HTTP"],
    w: [["It also checks the visitor's client certificate", "Il vérifie aussi le certificat client du visiteur", "También comprueba el certificado de cliente del visitante"], ["It refuses HTTP visitors with a 403", "Il refuse les visiteurs HTTP avec un 403", "Rechaza a los visitantes HTTP con un 403"], ["It skips the certificate check for speed", "Il saute la vérification du certificat pour aller plus vite", "Se salta la comprobación del certificado para ir más rápido"]],
    e: [
      "Full and Full (strict) follow the visitor's scheme: an `http://` request goes to the origin over HTTP. Strict (SSL-only origin pull) always uses HTTPS with validation, so the origin can close port 80 entirely. Enterprise.",
      "Full et Full (strict) suivent le schéma du visiteur : une requête `http://` va à l'origine en HTTP. Strict (SSL-only origin pull) utilise toujours HTTPS avec validation : l'origine peut fermer complètement le port 80. Enterprise.",
      "Full y Full (strict) siguen el esquema del visitante: una petición `http://` va al origen por HTTP. Strict (SSL-only origin pull) usa siempre HTTPS con validación, así que el origen puede cerrar del todo el puerto 80. Enterprise.",
    ],
  },
  {
    id: "cf-tls-15",
    q: ["HSTS is set with `includeSubDomains` on `example.com`. An internal tool at `intranet.example.com` serves only HTTP. What happens?", "HSTS est posé avec `includeSubDomains` sur `example.com`. Un outil interne à `intranet.example.com` ne sert que du HTTP. Que se passe-t-il ?", "HSTS está puesto con `includeSubDomains` en `example.com`. Una herramienta interna en `intranet.example.com` solo sirve HTTP. ¿Qué pasa?"],
    a: ["Browsers that saw the header refuse to load it over HTTP until `max-age` expires", "Les navigateurs qui ont vu l'en-tête refusent de le charger en HTTP jusqu'à l'expiration de `max-age`", "Los navegadores que vieron la cabecera se niegan a cargarla por HTTP hasta que caduca `max-age`"],
    w: [["Nothing: HSTS applies to `example.com` only", "Rien : HSTS ne vaut que pour `example.com`", "Nada: HSTS solo vale para `example.com`"], ["Cloudflare upgrades it to HTTPS automatically", "Cloudflare le passe automatiquement en HTTPS", "Cloudflare lo pasa a HTTPS automáticamente"], ["The browser shows a warning the user can click through", "Le navigateur affiche un avertissement que l'utilisateur peut ignorer", "El navegador muestra un aviso que el usuario puede saltarse"]],
    e: [
      "`includeSubDomains` extends the promise to every subdomain, even ones Cloudflare does not proxy, and HSTS errors cannot be clicked through. Inventory subdomains first; preload makes it permanent in browsers' lists.",
      "`includeSubDomains` étend la promesse à chaque sous-domaine, même ceux que Cloudflare ne proxifie pas, et les erreurs HSTS ne peuvent pas être ignorées. Inventorie d'abord les sous-domaines ; le préchargement rend cela permanent dans les listes des navigateurs.",
      "`includeSubDomains` extiende la promesa a cada subdominio, incluso los que Cloudflare no proxifica, y los errores HSTS no se pueden saltar. Haz antes un inventario de subdominios; la precarga lo vuelve permanente en las listas de los navegadores.",
    ],
  },
];

const cacheExpert: CfQuestion[] = [
  {
    id: "cf-cache-13",
    q: ["A purge request returns HTTP 200. What does that guarantee?", "Une requête de purge renvoie HTTP 200. Que garantit-elle ?", "Una petición de purga devuelve HTTP 200. ¿Qué garantiza?"],
    a: ["Only that Cloudflare accepted the purge; check that responses are no longer `HIT`", "Seulement que Cloudflare a accepté la purge ; vérifie que les réponses ne sont plus `HIT`", "Solo que Cloudflare aceptó la purga; comprueba que las respuestas ya no son `HIT`"],
    w: [["That every data center has evicted the object", "Que chaque centre de données a retiré l'objet", "Que cada centro de datos ha retirado el objeto"], ["That browsers have dropped their copies", "Que les navigateurs ont jeté leurs copies", "Que los navegadores han descartado sus copias"], ["That the origin has been asked for a new copy", "Que l'origine a été sollicitée pour une nouvelle copie", "Que se ha pedido una copia nueva al origen"]],
    e: [
      "Purges are fast but asynchronous. Rate limits apply per account: single-URL purges by URLs per second, the other methods by requests in a token bucket (5 a minute on Free, 50 a second on Enterprise). Invalidation marks content stale instead, revalidated on the next request.",
      "Les purges sont rapides mais asynchrones. Des limites de débit s'appliquent par compte : les purges d'URL en URL par seconde, les autres méthodes en requêtes dans un seau à jetons (5 par minute en Free, 50 par seconde en Enterprise). L'invalidation marque plutôt le contenu comme périmé, revalidé à la requête suivante.",
      "Las purgas son rápidas pero asíncronas. Hay límites por cuenta: las de URL en URL por segundo, los demás métodos en peticiones en un cubo de fichas (5 por minuto en Free, 50 por segundo en Enterprise). La invalidación, en cambio, marca el contenido como caducado y se revalida en la siguiente petición.",
    ],
  },
  {
    id: "cf-cache-14",
    q: ["Cache Reserve is on, but Tiered Cache is off. What does that cost you?", "Cache Reserve est activé, mais pas le Tiered Cache. Qu'est-ce que cela te coûte ?", "Cache Reserve está activado, pero Tiered Cache no. ¿Qué te cuesta eso?"],
    a: ["More storage operations: every data center reads and writes the reserve instead of one upper tier", "Plus d'opérations de stockage : chaque centre lit et écrit la réserve au lieu d'un seul niveau supérieur", "Más operaciones de almacenamiento: cada centro lee y escribe en la reserva en lugar de un único nivel superior"],
    w: [["Nothing: they are unrelated", "Rien : ils n'ont rien à voir", "Nada: no tienen relación"], ["Cache Reserve refuses to start", "Cache Reserve refuse de démarrer", "Cache Reserve no arranca"], ["Objects expire after 10 hours", "Les objets expirent après 10 heures", "Los objetos caducan tras 10 horas"]],
    e: [
      "Cache Reserve bills Class A writes (USD 4.50 per million) and Class B reads (USD 0.36 per million): a miss usually costs one of each, a hit one read. Tiered Cache funnels misses through few upper tiers, which keeps operations down; Cloudflare recommends pairing them.",
      "Cache Reserve facture les écritures de classe A (4,50 USD par million) et les lectures de classe B (0,36 USD par million) : un échec coûte en général une de chaque, un succès une lecture. Le Tiered Cache fait passer les échecs par peu de niveaux supérieurs, ce qui limite les opérations ; Cloudflare recommande de les associer.",
      "Cache Reserve factura escrituras de clase A (4,50 USD por millón) y lecturas de clase B (0,36 USD por millón): un fallo suele costar una de cada, un acierto una lectura. Tiered Cache canaliza los fallos por pocos niveles superiores, lo que reduce las operaciones; Cloudflare recomienda combinarlos.",
    ],
  },
  {
    id: "cf-cache-15",
    q: ["A site varies its pages by an `Accept-Language` header. On which plan can the cache key include that header?", "Un site fait varier ses pages selon l'en-tête `Accept-Language`. Avec quel plan la clé de cache peut-elle inclure cet en-tête ?", "Un sitio varía sus páginas según la cabecera `Accept-Language`. ¿Con qué plan puede la clave de caché incluir esa cabecera?"],
    a: ["Enterprise: choosing headers, cookies or the host for the key is Enterprise-only", "Enterprise : choisir des en-têtes, cookies ou l'hôte pour la clé est réservé à Enterprise", "Enterprise: elegir cabeceras, cookies o el host para la clave es solo de Enterprise"],
    w: [["Any plan, with a Cache Rule", "N'importe quel plan, avec une Cache Rule", "Cualquier plan, con una Cache Rule"], ["Pro and above", "Pro et plus", "Pro y superiores"], ["None: headers can never be part of the key", "Aucun : les en-têtes ne font jamais partie de la clé", "Ninguno: las cabeceras nunca forman parte de la clave"]],
    e: [
      "Every plan can ignore or sort the query string, split by device type and use cache deception armor. Otherwise, put the language in the URL (`/fr/…`), which is better for search engines anyway, or build the key in a Worker.",
      "Tous les plans peuvent ignorer ou trier la chaîne de requête, séparer par type d'appareil et utiliser cache deception armor. Sinon, mets la langue dans l'URL (`/fr/…`), ce qui vaut mieux pour les moteurs de recherche de toute façon, ou construis la clé dans un Worker.",
      "Todos los planes pueden ignorar u ordenar la cadena de consulta, separar por tipo de dispositivo y usar cache deception armor. Si no, pon el idioma en la URL (`/fr/…`), mejor para los buscadores de todos modos, o construye la clave en un Worker.",
    ],
  },
];

const securityExpert: CfQuestion[] = [
  {
    id: "cf-sec-13",
    q: ["A managed rule blocks a legitimate upload on `/api/import`. What is the right fix?", "Une règle gérée bloque un envoi légitime sur `/api/import`. Quelle est la bonne correction ?", "Una regla gestionada bloquea una subida legítima en `/api/import`. ¿Cuál es el arreglo correcto?"],
    a: ["An exception that skips that rule's ID on that path only", "Une exception qui saute l'identifiant de cette règle sur ce chemin seulement", "Una excepción que omite el ID de esa regla solo en esa ruta"],
    w: [["Turn the managed ruleset off", "Désactiver l'ensemble de règles gérées", "Desactivar el conjunto de reglas gestionadas"], ["Lower the OWASP sensitivity for the whole zone", "Baisser la sensibilité OWASP pour toute la zone", "Bajar la sensibilidad OWASP para toda la zona"], ["Allow the uploader's IP for every product", "Autoriser l'IP de l'expéditeur pour tous les produits", "Permitir la IP del usuario para todos los productos"]],
    e: [
      "Security Events show which rule ID acted. An exception scoped to that rule and that path keeps the protection everywhere else. Where you can, deploy new rules with Log first (Enterprise), or watch Security Events before switching to Block.",
      "Les Security Events montrent quel identifiant de règle a agi. Une exception limitée à cette règle et à ce chemin garde la protection partout ailleurs. Quand c'est possible, déploie les nouvelles règles d'abord en Log (Enterprise), ou observe les Security Events avant de passer en Block.",
      "Los Security Events muestran qué ID de regla actuó. Una excepción limitada a esa regla y a esa ruta mantiene la protección en todo lo demás. Cuando puedas, despliega las reglas nuevas primero con Log (Enterprise), u observa los Security Events antes de pasar a Block.",
    ],
  },
  {
    id: "cf-sec-14",
    q: ["A Single Redirect sends `/old/*` to `/new/*`, and a WAF custom rule blocks `/old/admin`. A request for `/old/admin` arrives. What happens?", "Une Single Redirect envoie `/old/*` vers `/new/*`, et une règle personnalisée du WAF bloque `/old/admin`. Une requête pour `/old/admin` arrive. Que se passe-t-il ?", "Una Single Redirect envía `/old/*` a `/new/*`, y una regla personalizada del WAF bloquea `/old/admin`. Llega una petición a `/old/admin`. ¿Qué pasa?"],
    a: ["It is redirected: Single Redirects run first, so the WAF rule never sees it", "Elle est redirigée : les Single Redirects passent en premier, la règle du WAF ne la voit jamais", "Se redirige: las Single Redirects van primero, así que la regla del WAF nunca la ve"],
    w: [["It is blocked: security rules always run first", "Elle est bloquée : les règles de sécurité passent toujours en premier", "Se bloquea: las reglas de seguridad siempre van primero"], ["It is blocked, then redirected", "Elle est bloquée, puis redirigée", "Se bloquea y luego se redirige"], ["It depends on which rule was created first", "Cela dépend de la règle créée en premier", "Depende de qué regla se creó primero"]],
    e: [
      "`http_request_dynamic_redirect` is the first request phase. The redirected visitor then requests `/new/admin`, which the rule on `/old/admin` does not match. Write security rules on the paths that reach the origin, and remember Bulk Redirects run after the WAF.",
      "`http_request_dynamic_redirect` est la première phase de la requête. Le visiteur redirigé demande ensuite `/new/admin`, que la règle sur `/old/admin` ne couvre pas. Écris les règles de sécurité sur les chemins qui atteignent l'origine, et souviens-toi que les Bulk Redirects passent après le WAF.",
      "`http_request_dynamic_redirect` es la primera fase de la petición. El visitante redirigido pide después `/new/admin`, que la regla sobre `/old/admin` no cubre. Escribe las reglas de seguridad sobre las rutas que llegan al origen, y recuerda que las Bulk Redirects van después del WAF.",
    ],
  },
  {
    id: "cf-sec-15",
    q: ["An API is abused by many IPs sharing one stolen API key. Which rate limiting counts it best?", "Une API est abusée par de nombreuses IP partageant une clé d'API volée. Quelle limitation de débit compte le mieux ?", "Una API sufre abusos de muchas IP que comparten una clave de API robada. ¿Qué limitación de velocidad cuenta mejor?"],
    a: ["Advanced Rate Limiting, counting by the `x-api-key` header instead of the IP", "Advanced Rate Limiting, en comptant par l'en-tête `x-api-key` au lieu de l'IP", "Advanced Rate Limiting, contando por la cabecera `x-api-key` en lugar de la IP"],
    w: [["A per-IP rule with a lower threshold", "Une règle par IP avec un seuil plus bas", "Una regla por IP con un umbral más bajo"], ["Bot Fight Mode", "Bot Fight Mode", "Bot Fight Mode"], ["A longer Browser Cache TTL", "Un Browser Cache TTL plus long", "Un Browser Cache TTL más largo"]],
    e: [
      "Counting characteristics beyond the IP (headers, cookies, query, ASN, country, JA3/JA4, JSON body fields) are part of Advanced Rate Limiting, an Enterprise add-on. Counters remain per data center. Revoking the stolen key is still the first step.",
      "Les caractéristiques de comptage au-delà de l'IP (en-têtes, cookies, requête, ASN, pays, JA3/JA4, champs du corps JSON) font partie d'Advanced Rate Limiting, une option Enterprise. Les compteurs restent par centre de données. Révoquer la clé volée reste la première chose à faire.",
      "Las características de conteo más allá de la IP (cabeceras, cookies, consulta, ASN, país, JA3/JA4, campos del cuerpo JSON) forman parte de Advanced Rate Limiting, un complemento de Enterprise. Los contadores siguen siendo por centro de datos. Revocar la clave robada sigue siendo lo primero.",
    ],
  },
];

const workersExpert: CfQuestion[] = [
  {
    id: "cf-wk-13",
    q: ["How many subrequests can one Worker invocation make by default on Workers Paid?", "Combien de sous-requêtes une invocation de Worker peut-elle faire par défaut avec Workers Paid ?", "¿Cuántas subpeticiones puede hacer por defecto una invocación de Worker con Workers Paid?"],
    a: ["10,000 (50 on Workers Free)", "10 000 (50 avec Workers Free)", "10 000 (50 con Workers Free)"],
    w: [["6", "6", "6"], ["1,000 on both plans", "1 000 sur les deux plans", "1000 en ambos planes"], ["Unlimited", "Illimité", "Ilimitadas"]],
    e: [
      "Six is the number of outgoing connections that can wait for response headers at the same time; more `fetch()` calls queue. Memory is 128 MB per isolate on both plans, and startup must finish within 1 second.",
      "Six est le nombre de connexions sortantes qui peuvent attendre des en-têtes de réponse en même temps ; les autres appels `fetch()` font la queue. La mémoire est de 128 Mo par isolat sur les deux plans, et le démarrage doit finir en 1 seconde.",
      "Seis es el número de conexiones salientes que pueden esperar cabeceras de respuesta a la vez; las demás llamadas `fetch()` esperan en cola. La memoria es de 128 MB por aislado en ambos planes, y el arranque debe acabar en 1 segundo.",
    ],
  },
  {
    id: "cf-wk-14",
    q: ["How do you release a new Worker version to 10 % of traffic first?", "Comment publier une nouvelle version d'un Worker d'abord sur 10 % du trafic ?", "¿Cómo publicar una nueva versión de un Worker primero al 10 % del tráfico?"],
    a: ["A gradual deployment: upload a version, deploy it at 10 % beside the current one, then raise it", "Un déploiement progressif : téléverser une version, la déployer à 10 % à côté de l'actuelle, puis augmenter", "Un despliegue gradual: subir una versión, desplegarla al 10 % junto a la actual y luego subir"],
    w: [["Deploy a second Worker on the same route", "Déployer un second Worker sur la même route", "Desplegar un segundo Worker en la misma ruta"], ["Use `Math.random()` in the code", "Utiliser `Math.random()` dans le code", "Usar `Math.random()` en el código"], ["It is not possible on Workers", "Ce n'est pas possible avec Workers", "No es posible con Workers"]],
    e: [
      "Versions and deployments are separate: a deployment says which versions get what share of traffic, and rolling back is deploying the previous version at 100 %. Watch errors in Workers Logs between steps.",
      "Versions et déploiements sont distincts : un déploiement dit quelles versions reçoivent quelle part du trafic, et revenir en arrière, c'est déployer la version précédente à 100 %. Surveille les erreurs dans les Workers Logs entre les étapes.",
      "Versiones y despliegues son distintos: un despliegue dice qué versiones reciben qué parte del tráfico, y volver atrás es desplegar la versión anterior al 100 %. Vigila los errores en Workers Logs entre pasos.",
    ],
  },
  {
    id: "cf-wk-15",
    q: ["What does a Tail Worker receive?", "Que reçoit un Tail Worker ?", "¿Qué recibe un Tail Worker?"],
    a: ["The logs, exceptions and outcome of each invocation of the Workers it is attached to, to forward or process them", "Les journaux, exceptions et le résultat de chaque invocation des Workers auxquels il est attaché, pour les transmettre ou les traiter", "Los registros, excepciones y el resultado de cada invocación de los Workers a los que está asociado, para reenviarlos o procesarlos"],
    w: [["The last bytes of each response body", "Les derniers octets de chaque corps de réponse", "Los últimos bytes de cada cuerpo de respuesta"], ["Requests that no route matched", "Les requêtes qu'aucune route n'a captées", "Las peticiones que ninguna ruta captó"], ["Messages left in a queue", "Les messages restés dans une file", "Los mensajes que quedan en una cola"]],
    e: [
      "Tail Workers run after the producer Worker has finished, so they do not slow it down. `wrangler tail` streams the same data live to a terminal; Workers Logs keep it searchable; Logpush exports it.",
      "Les Tail Workers s'exécutent après la fin du Worker producteur : ils ne le ralentissent pas. `wrangler tail` diffuse les mêmes données en direct vers un terminal ; les Workers Logs les gardent consultables ; Logpush les exporte.",
      "Los Tail Workers se ejecutan cuando el Worker productor ha terminado, así que no lo frenan. `wrangler tail` emite los mismos datos en directo a un terminal; Workers Logs los guarda consultables; Logpush los exporta.",
    ],
  },
  {
    id: "cf-wk-16",
    q: ["What is `cf`, next to Wrangler?", "Qu'est-ce que `cf`, à côté de Wrangler ?", "¿Qué es `cf`, junto a Wrangler?"],
    a: ["Cloudflare's newer CLI, in beta, with a TypeScript configuration and `cf migrate` for Wrangler projects; some commands still need Wrangler", "La nouvelle CLI de Cloudflare, en bêta, avec une configuration en TypeScript et `cf migrate` pour les projets Wrangler ; certaines commandes demandent encore Wrangler", "La nueva CLI de Cloudflare, en beta, con configuración en TypeScript y `cf migrate` para proyectos de Wrangler; algunas órdenes aún necesitan Wrangler"],
    w: [["An alias of `wrangler`, identical in every way", "Un alias de `wrangler`, identique en tout", "Un alias de `wrangler`, idéntico en todo"], ["The Terraform provider's command", "La commande du fournisseur Terraform", "La orden del proveedor de Terraform"], ["A tool for DNS records only", "Un outil pour les enregistrements DNS seulement", "Una herramienta solo para registros DNS"]],
    e: [
      "`cf` reads `cloudflare.config.ts` (`worker.name`, `worker.compatibilityDate`, `triggers.scheduled(…)`) and uses `--mode` where Wrangler uses `--env`. Commands not yet supported, such as `tail` and `secret put`, go through `npx wrangler`.",
      "`cf` lit `cloudflare.config.ts` (`worker.name`, `worker.compatibilityDate`, `triggers.scheduled(…)`) et utilise `--mode` là où Wrangler utilise `--env`. Les commandes pas encore prises en charge, comme `tail` et `secret put`, passent par `npx wrangler`.",
      "`cf` lee `cloudflare.config.ts` (`worker.name`, `worker.compatibilityDate`, `triggers.scheduled(…)`) y usa `--mode` donde Wrangler usa `--env`. Las órdenes aún no admitidas, como `tail` y `secret put`, pasan por `npx wrangler`.",
    ],
  },
];

const storageExpert: CfQuestion[] = [
  {
    id: "cf-st-13",
    q: ["A D1 database's queries take 10 ms on average. About how many queries per second can it serve?", "Les requêtes d'une base D1 prennent 10 ms en moyenne. À peu près combien de requêtes par seconde peut-elle servir ?", "Las consultas de una base D1 tardan 10 ms de media. ¿Cuántas consultas por segundo puede atender, más o menos?"],
    a: ["About 100: a D1 database runs one query at a time", "Environ 100 : une base D1 exécute une requête à la fois", "Unas 100: una base D1 ejecuta una consulta a la vez"],
    w: [["About 1,000, on ten threads", "Environ 1 000, sur dix threads", "Unas 1000, en diez hilos"], ["Unlimited: D1 scales automatically", "Illimité : D1 monte en charge tout seul", "Ilimitadas: D1 escala solo"], ["About 10", "Environ 10", "Unas 10"]],
    e: [
      "Throughput is roughly 1 / query time: 1 ms queries give about 1,000 per second, 100 ms queries 10. Indexes, batching and read replicas help; for very high write loads, split the data over several databases, one per tenant for example.",
      "Le débit vaut à peu près 1 / durée d'une requête : des requêtes de 1 ms donnent environ 1 000 par seconde, de 100 ms 10. Les index, le regroupement et les répliques de lecture aident ; pour de très fortes charges d'écriture, répartis les données sur plusieurs bases, une par client par exemple.",
      "El rendimiento es más o menos 1 / duración de una consulta: consultas de 1 ms dan unas 1000 por segundo, de 100 ms unas 10. Los índices, el agrupado y las réplicas de lectura ayudan; para cargas de escritura muy altas, reparte los datos en varias bases, una por cliente por ejemplo.",
    ],
  },
  {
    id: "cf-st-14",
    q: ["A Workflow step has no retry configuration and its call fails. What happens by default?", "Une étape de Workflow n'a pas de configuration de nouvelles tentatives et son appel échoue. Que se passe-t-il par défaut ?", "Un paso de un Workflow no tiene configuración de reintentos y su llamada falla. ¿Qué pasa por defecto?"],
    a: ["It is retried 5 times, 10 seconds apart with exponential backoff, each attempt timing out after 10 minutes", "Elle est réessayée 5 fois, à 10 secondes d'écart avec un délai exponentiel, chaque tentative expirant après 10 minutes", "Se reintenta 5 veces, con 10 segundos de separación y espera exponencial, y cada intento expira a los 10 minutos"],
    w: [["The whole Workflow starts over from the first step", "Tout le Workflow recommence depuis la première étape", "Todo el Workflow vuelve a empezar desde el primer paso"], ["It fails at once; there are no retries without configuration", "Elle échoue aussitôt ; pas de nouvelles tentatives sans configuration", "Falla al instante; sin configuración no hay reintentos"], ["It is retried forever, once a minute", "Elle est réessayée indéfiniment, une fois par minute", "Se reintenta para siempre, una vez por minuto"]],
    e: [
      "Completed steps are saved, so only the failing step is retried. Throw `NonRetryableError` to fail the instance at once, for an error no retry can fix (an invalid card, say).",
      "Les étapes terminées sont enregistrées : seule l'étape en échec est réessayée. Lance `NonRetryableError` pour faire échouer l'instance tout de suite, pour une erreur qu'aucune nouvelle tentative ne corrigera (une carte invalide, par exemple).",
      "Los pasos terminados se guardan, así que solo se reintenta el que falla. Lanza `NonRetryableError` para hacer fallar la instancia al instante, ante un error que ningún reintento arreglará (una tarjeta no válida, por ejemplo).",
    ],
  },
  {
    id: "cf-st-15",
    q: ["Hyperdrive caches read queries. A user saves their profile and reloads it at once. What can they see?", "Hyperdrive met en cache les requêtes de lecture. Un utilisateur enregistre son profil et le recharge aussitôt. Que peut-il voir ?", "Hyperdrive guarda en caché las consultas de lectura. Un usuario guarda su perfil y lo recarga al instante. ¿Qué puede ver?"],
    a: ["The old profile: Hyperdrive does not invalidate cached reads when you write", "L'ancien profil : Hyperdrive n'invalide pas les lectures en cache quand on écrit", "El perfil antiguo: Hyperdrive no invalida las lecturas en caché al escribir"],
    w: [["Always the new one: writes clear the cache", "Toujours le nouveau : les écritures vident le cache", "Siempre el nuevo: las escrituras vacían la caché"], ["An error until the cache expires", "Une erreur jusqu'à l'expiration du cache", "Un error hasta que caduca la caché"], ["Nothing: Hyperdrive never caches", "Rien : Hyperdrive ne met jamais en cache", "Nada: Hyperdrive nunca guarda en caché"]],
    e: [
      "For reads that must be fresh, use a second Hyperdrive configuration with caching disabled, or lower the cache's max age. Hyperdrive's other gain, the pool of warm connections near the database, applies either way.",
      "Pour les lectures qui doivent être fraîches, utilise une seconde configuration Hyperdrive sans cache, ou baisse la durée maximale du cache. L'autre gain d'Hyperdrive, le réservoir de connexions prêtes près de la base, vaut dans les deux cas.",
      "Para las lecturas que deben estar al día, usa una segunda configuración de Hyperdrive sin caché, o baja la duración máxima de la caché. La otra ventaja de Hyperdrive, el grupo de conexiones listas cerca de la base, vale en ambos casos.",
    ],
  },
  {
    id: "cf-st-16",
    q: ["A queue's consumer keeps failing on one message. Where does it end up?", "Le consommateur d'une file échoue sans cesse sur un message. Où finit-il ?", "El consumidor de una cola falla una y otra vez con un mensaje. ¿Dónde acaba?"],
    a: ["After the configured number of retries (at most 100), in the dead letter queue if one is set, or it is dropped", "Après le nombre de tentatives réglé (100 au plus), dans la file des lettres mortes s'il y en a une, sinon il est abandonné", "Tras el número de reintentos fijado (como mucho 100), en la cola de mensajes fallidos si existe, o se descarta"],
    w: [["It blocks the queue until it succeeds", "Il bloque la file jusqu'à ce qu'il réussisse", "Bloquea la cola hasta que funciona"], ["It is retried forever", "Il est réessayé pour toujours", "Se reintenta para siempre"], ["It is sent back to the producer", "Il est renvoyé au producteur", "Se devuelve al productor"]],
    e: [
      "A dead letter queue keeps failed messages for inspection and replay. Messages are kept up to 14 days (24 hours on Free); retries and sends can be delayed up to 24 hours with `delaySeconds`.",
      "Une file des lettres mortes garde les messages en échec pour examen et rejeu. Les messages sont gardés jusqu'à 14 jours (24 heures en Free) ; nouvelles tentatives et envois peuvent être retardés jusqu'à 24 heures avec `delaySeconds`.",
      "Una cola de mensajes fallidos guarda los mensajes que fallaron para revisarlos y reenviarlos. Los mensajes se guardan hasta 14 días (24 horas en Free); reintentos y envíos se pueden retrasar hasta 24 horas con `delaySeconds`.",
    ],
  },
];

const ztExpert: CfQuestion[] = [
  {
    id: "cf-zt-13",
    q: ["How should an application behind Access check that a request really passed Access?", "Comment une application derrière Access doit-elle vérifier qu'une requête est vraiment passée par Access ?", "¿Cómo debe comprobar una aplicación detrás de Access que una petición pasó de verdad por Access?"],
    a: ["Validate the JWT in `Cf-Access-Jwt-Assertion` with the team's public keys and check its `aud` against the application's AUD tag", "Valider le JWT de `Cf-Access-Jwt-Assertion` avec les clés publiques de l'équipe et vérifier son `aud` par rapport à l'AUD de l'application", "Validar el JWT de `Cf-Access-Jwt-Assertion` con las claves públicas del equipo y comprobar su `aud` frente al AUD de la aplicación"],
    w: [["Trust any request that has the header", "Faire confiance à toute requête qui a l'en-tête", "Fiarse de cualquier petición que tenga la cabecera"], ["Check that the source IP is Cloudflare's", "Vérifier que l'IP source est celle de Cloudflare", "Comprobar que la IP de origen es de Cloudflare"], ["Read the user's email from a query parameter", "Lire l'adresse de l'utilisateur dans un paramètre d'URL", "Leer el correo del usuario en un parámetro de la URL"]],
    e: [
      "The keys are at `https://<team>.cloudflareaccess.com/cdn-cgi/access/certs`; match the token's `kid`. The header is more reliable than the `CF_Authorization` cookie. Validation protects the app if someone reaches the origin another way.",
      "Les clés sont à `https://<team>.cloudflareaccess.com/cdn-cgi/access/certs` ; fais correspondre le `kid` du jeton. L'en-tête est plus fiable que le cookie `CF_Authorization`. La validation protège l'application si quelqu'un atteint l'origine par un autre chemin.",
      "Las claves están en `https://<team>.cloudflareaccess.com/cdn-cgi/access/certs`; haz coincidir el `kid` del token. La cabecera es más fiable que la cookie `CF_Authorization`. La validación protege la aplicación si alguien llega al origen por otro camino.",
    ],
  },
  {
    id: "cf-zt-14",
    q: ["Traffic matches both a Gateway network Block policy and an HTTP Block policy. What does the user see since July 2025?", "Un trafic correspond à la fois à une stratégie réseau Block et à une stratégie HTTP Block de Gateway. Que voit l'utilisateur depuis juillet 2025 ?", "Un tráfico coincide a la vez con una política de red Block y una política HTTP Block de Gateway. ¿Qué ve el usuario desde julio de 2025?"],
    a: ["No block page: the network policy acts first, with its own client notification settings", "Pas de page de blocage : la stratégie réseau agit d'abord, avec ses propres réglages de notification du client", "Ninguna página de bloqueo: la política de red actúa primero, con sus propios ajustes de notificación del cliente"],
    w: [["The HTTP block page, as before", "La page de blocage HTTP, comme avant", "La página de bloqueo HTTP, como antes"], ["Both block pages, one after the other", "Les deux pages de blocage, l'une après l'autre", "Las dos páginas de bloqueo, una tras otra"], ["Nothing: two Block policies cancel each other", "Rien : deux stratégies Block s'annulent", "Nada: dos políticas Block se anulan"]],
    e: [
      "Gateway now evaluates network policies before HTTP policies. For a branded block page on web traffic, block it with an HTTP policy and leave the network policies for non-HTTP traffic and private networks.",
      "Gateway évalue désormais les stratégies réseau avant les HTTP. Pour une page de blocage personnalisée sur le trafic web, bloque-le par une stratégie HTTP et garde les stratégies réseau pour le trafic non HTTP et les réseaux privés.",
      "Gateway evalúa ahora las políticas de red antes que las HTTP. Para una página de bloqueo personalizada en el tráfico web, bloquéalo con una política HTTP y deja las de red para el tráfico no HTTP y las redes privadas.",
    ],
  },
  {
    id: "cf-zt-15",
    q: ["What does the Cloudflare One Client do in Posture only mode?", "Que fait le Cloudflare One Client en mode Posture only ?", "¿Qué hace el Cloudflare One Client en modo Posture only?"],
    a: ["It sends no traffic or DNS to Cloudflare; it only reports the device's state for policies", "Il n'envoie ni trafic ni DNS à Cloudflare ; il ne rapporte que l'état de l'appareil pour les stratégies", "No envía tráfico ni DNS a Cloudflare; solo informa del estado del dispositivo para las políticas"],
    w: [["It sends all traffic and DNS to Gateway", "Il envoie tout le trafic et le DNS à Gateway", "Envía todo el tráfico y el DNS a Gateway"], ["It sends DNS only", "Il n'envoie que le DNS", "Solo envía el DNS"], ["It turns the device into a tunnel connector", "Il transforme l'appareil en connecteur de tunnel", "Convierte el dispositivo en un conector de túnel"]],
    e: [
      "Posture only fits devices that keep another network path but must prove disk encryption, OS version or EDR to Access. The other modes: Traffic and DNS (the default), DNS only, Traffic only, Local proxy.",
      "Posture only convient aux appareils qui gardent un autre chemin réseau mais doivent prouver à Access le chiffrement du disque, la version du système ou l'EDR. Les autres modes : Traffic and DNS (par défaut), DNS only, Traffic only, Local proxy.",
      "Posture only sirve para dispositivos que mantienen otra ruta de red pero deben demostrar a Access el cifrado del disco, la versión del sistema o el EDR. Los demás modos: Traffic and DNS (por defecto), DNS only, Traffic only, Local proxy.",
    ],
  },
  {
    id: "cf-zt-16",
    q: ["An Access policy requires country CH. A user logs in from Zurich, then travels to Paris mid-session. What happens?", "Une stratégie Access exige le pays CH. Un utilisateur se connecte depuis Zurich, puis part à Paris en cours de session. Que se passe-t-il ?", "Una política de Access exige el país CH. Un usuario inicia sesión desde Zúrich y viaja a París a mitad de sesión. ¿Qué pasa?"],
    a: ["His next requests are refused: non-identity selectors such as country are checked on every request", "Ses requêtes suivantes sont refusées : les sélecteurs non liés à l'identité, comme le pays, sont vérifiés à chaque requête", "Sus siguientes peticiones se rechazan: los selectores no ligados a la identidad, como el país, se comprueban en cada petición"],
    w: [["Nothing until the session expires: rules are checked only at login", "Rien jusqu'à l'expiration de la session : les règles ne sont vérifiées qu'à la connexion", "Nada hasta que caduca la sesión: las reglas solo se comprueban al iniciar sesión"], ["He is logged out of every application", "Il est déconnecté de toutes les applications", "Se le cierra la sesión en todas las aplicaciones"], ["Access asks him for a second factor", "Access lui demande un second facteur", "Access le pide un segundo factor"]],
    e: [
      "Identity attributes (email, groups) are checked at login; IP ranges, country and device posture are evaluated with each request. For SaaS applications behind Access, policies are enforced only at sign-on and when the session is reissued.",
      "Les attributs d'identité (adresse, groupes) sont vérifiés à la connexion ; plages d'IP, pays et état de l'appareil sont évalués à chaque requête. Pour les applications SaaS derrière Access, les stratégies ne s'appliquent qu'à la connexion et au renouvellement de la session.",
      "Los atributos de identidad (correo, grupos) se comprueban al iniciar sesión; rangos de IP, país y estado del dispositivo se evalúan en cada petición. Para las aplicaciones SaaS detrás de Access, las políticas solo se aplican al iniciar sesión y al renovar la sesión.",
    ],
  },
];

const agents: CfQuestion[] = [
  {
    id: "cf-ai-13",
    q: ["What is an agent built with the Agents SDK, underneath?", "Qu'est-ce qu'un agent construit avec l'Agents SDK, en dessous ?", "¿Qué es por debajo un agente construido con el Agents SDK?"],
    a: ["A Durable Object: globally addressable, single-threaded, with its own SQLite storage", "Un Durable Object : adressable partout, monothread, avec son propre stockage SQLite", "Un Durable Object: direccionable en todas partes, de un solo hilo, con su propio almacenamiento SQLite"],
    w: [["A container running a Python process", "Un conteneur qui fait tourner un processus Python", "Un contenedor que ejecuta un proceso de Python"], ["A Workflow that restarts on every message", "Un Workflow qui redémarre à chaque message", "Un Workflow que se reinicia con cada mensaje"], ["A stateless Worker with state in KV", "Un Worker sans état, avec l'état dans KV", "Un Worker sin estado, con el estado en KV"]],
    e: [
      "`Agent` extends a server class built on `DurableObject`, so each user or conversation gets its own instance whose state survives restarts. `this.sql` queries its SQLite; `this.setState()` saves the state and broadcasts it to connected clients.",
      "`Agent` étend une classe de serveur bâtie sur `DurableObject` : chaque utilisateur ou conversation a sa propre instance, dont l'état survit aux redémarrages. `this.sql` interroge son SQLite ; `this.setState()` enregistre l'état et le diffuse aux clients connectés.",
      "`Agent` extiende una clase de servidor construida sobre `DurableObject`, así que cada usuario o conversación tiene su propia instancia, cuyo estado sobrevive a los reinicios. `this.sql` consulta su SQLite; `this.setState()` guarda el estado y lo difunde a los clientes conectados.",
    ],
  },
  {
    id: "cf-ai-14",
    q: ["How does an agent's `this.schedule()` fire, even after the agent has left memory?", "Comment le `this.schedule()` d'un agent se déclenche-t-il, même après que l'agent a quitté la mémoire ?", "¿Cómo salta el `this.schedule()` de un agente, incluso después de que el agente haya salido de la memoria?"],
    a: ["The schedules are stored in SQL, and one Durable Object alarm wakes the agent for the next one", "Les échéances sont stockées en SQL, et une seule alarme de Durable Object réveille l'agent pour la suivante", "Las tareas se guardan en SQL, y una única alarma de Durable Object despierta al agente para la siguiente"],
    w: [["With `setTimeout()` kept alive by Cloudflare", "Avec un `setTimeout()` maintenu en vie par Cloudflare", "Con un `setTimeout()` que Cloudflare mantiene vivo"], ["With a Cron Trigger per schedule", "Avec un Cron Trigger par échéance", "Con un Cron Trigger por tarea"], ["It does not: schedules are lost on eviction", "Il ne se déclenche pas : les échéances sont perdues", "No salta: las tareas se pierden"]],
    e: [
      "`schedule()` takes a delay in seconds, a date or a cron expression, and the name of a method to call. For long multi-step jobs that must survive failures, an agent can start a Workflow instead.",
      "`schedule()` prend un délai en secondes, une date ou une expression cron, et le nom d'une méthode à appeler. Pour de longs travaux en plusieurs étapes qui doivent survivre aux pannes, un agent peut plutôt lancer un Workflow.",
      "`schedule()` acepta un retraso en segundos, una fecha o una expresión cron, y el nombre de un método al que llamar. Para trabajos largos en varios pasos que deben sobrevivir a fallos, un agente puede lanzar un Workflow.",
    ],
  },
  {
    id: "cf-ai-15",
    q: ["What does the `@callable()` decorator do on an agent's method?", "Que fait le décorateur `@callable()` sur une méthode d'agent ?", "¿Qué hace el decorador `@callable()` en un método de un agente?"],
    a: ["It exposes the method to connected clients as a remote call over WebSocket", "Il expose la méthode aux clients connectés comme un appel distant par WebSocket", "Expone el método a los clientes conectados como una llamada remota por WebSocket"],
    w: [["It makes the method run on a GPU", "Il fait tourner la méthode sur un GPU", "Hace que el método se ejecute en una GPU"], ["It schedules the method every minute", "Il planifie la méthode chaque minute", "Programa el método cada minuto"], ["It publishes the method as a public REST endpoint without authentication", "Il publie la méthode comme point d'accès REST public, sans authentification", "Publica el método como punto de acceso REST público, sin autenticación"]],
    e: [
      "A client (a React app, for example) connected to the agent calls the method by name and awaits its result, while state changes from `setState` stream back to it. HTTP requests go to `onRequest`; WebSocket messages to `onMessage`.",
      "Un client (une application React, par exemple) connecté à l'agent appelle la méthode par son nom et attend son résultat, pendant que les changements d'état de `setState` lui reviennent en continu. Les requêtes HTTP vont à `onRequest` ; les messages WebSocket à `onMessage`.",
      "Un cliente (una app React, por ejemplo) conectado al agente llama al método por su nombre y espera su resultado, mientras los cambios de estado de `setState` le llegan en continuo. Las peticiones HTTP van a `onRequest`; los mensajes WebSocket, a `onMessage`.",
    ],
  },
  {
    id: "cf-ai-16",
    q: ["With AI Gateway's Unified Billing, what do you pay?", "Avec la facturation unifiée (Unified Billing) d'AI Gateway, que paies-tu ?", "Con la facturación unificada (Unified Billing) de AI Gateway, ¿qué pagas?"],
    a: ["The providers' prices without markup, through credits that carry a 5 % fee when bought", "Les prix des fournisseurs sans marge, au moyen de crédits qui portent des frais de 5 % à l'achat", "Los precios de los proveedores sin margen, mediante créditos con una comisión del 5 % al comprarlos"],
    w: [["A flat monthly fee for unlimited calls", "Un forfait mensuel pour des appels illimités", "Una cuota mensual fija por llamadas ilimitadas"], ["The providers' prices plus 30 %", "Les prix des fournisseurs plus 30 %", "Los precios de los proveedores más un 30 %"], ["Nothing: Cloudflare pays the providers", "Rien : Cloudflare paie les fournisseurs", "Nada: Cloudflare paga a los proveedores"]],
    e: [
      "Credits of USD 100 cost USD 105; inference then passes through at the providers' prices, so one bill covers several providers. AI Gateway's core features (analytics, caching, rate limiting) stay free.",
      "Des crédits de 100 USD coûtent 105 USD ; l'inférence passe ensuite aux prix des fournisseurs, et une seule facture couvre plusieurs fournisseurs. Les fonctions de base d'AI Gateway (statistiques, cache, limitation de débit) restent gratuites.",
      "Unos créditos de 100 USD cuestan 105 USD; la inferencia se cobra luego a los precios de los proveedores, y una sola factura cubre varios proveedores. Las funciones básicas de AI Gateway (estadísticas, caché, limitación de velocidad) siguen siendo gratis.",
    ],
  },
];

export const dns = { dnsExpert };
export const tls = { tlsExpert };
export const cache = { cacheExpert };
export const security = { securityExpert };
export const workers = { workersExpert };
export const storage = { storageExpert };
export const zeroTrust = { ztExpert };
export const ai = { agents };
