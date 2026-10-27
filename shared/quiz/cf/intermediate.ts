/**
 * Cloudflare, Intermédiaire: setting a zone up (flattening, TTL, mail,
 * DNSSEC), certificates, cache keys and TTLs, the order of WAF rules,
 * Wrangler's configuration, choosing a store, Access and Tunnel, AI Gateway.
 */
import type { LinuxQuestion as CfQuestion } from "../linux/types";

const dnsSetup: CfQuestion[] = [
  {
    id: "cf-dns-05",
    q: ["You put a CNAME on the zone apex, `example.com`. What does Cloudflare answer?", "Tu mets un CNAME sur l'apex de la zone, `example.com`. Que répond Cloudflare ?", "Pones un CNAME en el ápex de la zona, `example.com`. ¿Qué responde Cloudflare?"],
    a: ["The final A and AAAA addresses: it follows the CNAME chain itself (CNAME flattening)", "Les adresses A et AAAA finales : il suit lui-même la chaîne de CNAME (aplatissement)", "Las direcciones A y AAAA finales: sigue él mismo la cadena de CNAME (aplanamiento)"],
    w: [["Nothing: a CNAME at the apex is refused", "Rien : un CNAME à l'apex est refusé", "Nada: se rechaza un CNAME en el ápex"], ["The CNAME itself, against the standard", "Le CNAME lui-même, contre la norme", "El propio CNAME, contra la norma"], ["An HTTP redirect to the CNAME's target", "Une redirection HTTP vers la cible du CNAME", "Una redirección HTTP al destino del CNAME"]],
    e: [
      "The DNS standard forbids a CNAME next to the apex's SOA and NS records. Cloudflare resolves the chain and returns addresses instead, which resolvers accept. If the target resolves to no address, the answer is empty (NODATA), which can look like a propagation problem.",
      "La norme DNS interdit un CNAME à côté des enregistrements SOA et NS de l'apex. Cloudflare résout la chaîne et renvoie des adresses à la place, ce que les résolveurs acceptent. Si la cible ne mène à aucune adresse, la réponse est vide (NODATA), ce qui peut ressembler à un problème de propagation.",
      "La norma DNS prohíbe un CNAME junto a los registros SOA y NS del ápex. Cloudflare resuelve la cadena y devuelve direcciones en su lugar, que los resolvedores aceptan. Si el destino no lleva a ninguna dirección, la respuesta está vacía (NODATA), lo que puede parecer un problema de propagación.",
    ],
  },
  {
    id: "cf-dns-06",
    q: ["What is the TTL of a proxied record?", "Quel est le TTL d'un enregistrement proxifié ?", "¿Cuál es el TTL de un registro proxificado?"],
    a: ["Auto, fixed at 300 seconds", "Auto, fixé à 300 secondes", "Auto, fijo en 300 segundos"],
    w: [["One day, to protect the origin", "Un jour, pour protéger l'origine", "Un día, para proteger el origen"], ["Whatever you choose, from 60 seconds", "Ce que tu choisis, à partir de 60 secondes", "El que elijas, desde 60 segundos"], ["30 seconds, the shortest possible", "30 secondes, le plus court possible", "30 segundos, lo más corto posible"]],
    e: [
      "Since a proxied record answers with Cloudflare's addresses, its TTL hardly matters: changing your origin's IP behind it takes effect at once. DNS-only records can be set from 60 seconds (30 on Enterprise) to one day.",
      "Comme un enregistrement proxifié répond avec les adresses de Cloudflare, son TTL compte peu : changer l'IP de ton origine derrière lui prend effet tout de suite. Les enregistrements en DNS seulement se règlent de 60 secondes (30 en Enterprise) à un jour.",
      "Como un registro proxificado responde con las direcciones de Cloudflare, su TTL importa poco: cambiar la IP de tu origen detrás de él surte efecto al instante. Los registros solo DNS se ajustan de 60 segundos (30 en Enterprise) a un día.",
    ],
  },
  {
    id: "cf-dns-07",
    q: ["The MX record points to `mail.example.com`, which is proxied. What happens to mail?", "L'enregistrement MX pointe vers `mail.example.com`, qui est proxifié. Qu'arrive-t-il au courrier ?", "El registro MX apunta a `mail.example.com`, que está proxificado. ¿Qué le pasa al correo?"],
    a: ["It breaks: SMTP cannot go through the HTTP proxy; `mail` must be DNS-only", "Il ne passe plus : SMTP ne traverse pas le proxy HTTP ; `mail` doit être en DNS seulement", "Deja de funcionar: SMTP no atraviesa el proxy HTTP; `mail` debe ser solo DNS"],
    w: [["Nothing: Cloudflare relays SMTP too", "Rien : Cloudflare relaie aussi SMTP", "Nada: Cloudflare también retransmite SMTP"], ["Mail is delivered faster, through the cache", "Le courrier arrive plus vite, par le cache", "El correo llega más rápido, por la caché"], ["The MX record itself becomes proxied", "L'enregistrement MX lui-même devient proxifié", "El propio registro MX pasa a estar proxificado"]],
    e: [
      "The proxy carries HTTP and HTTPS on a list of ports (80, 443, 8080, 8443 and a few more). A mail server's name must resolve to its real address. Note that this reveals that address: put mail on a different server from the website.",
      "Le proxy transporte HTTP et HTTPS sur une liste de ports (80, 443, 8080, 8443 et quelques autres). Le nom d'un serveur de messagerie doit résoudre vers sa vraie adresse. Cela révèle cette adresse : mets la messagerie sur un autre serveur que le site.",
      "El proxy transporta HTTP y HTTPS en una lista de puertos (80, 443, 8080, 8443 y algunos más). El nombre de un servidor de correo debe resolver a su dirección real. Eso revela la dirección: pon el correo en un servidor distinto del sitio web.",
    ],
  },
  {
    id: "cf-dns-08",
    q: ["How is DNSSEC turned on for a zone on Cloudflare?", "Comment active-t-on DNSSEC pour une zone chez Cloudflare ?", "¿Cómo se activa DNSSEC para una zona en Cloudflare?"],
    a: ["Turn it on in the dashboard, then add the DS record Cloudflare shows at the registrar", "L'activer dans le tableau de bord, puis ajouter chez le registraire l'enregistrement DS que Cloudflare affiche", "Activarlo en el panel y luego añadir en el registrador el registro DS que muestra Cloudflare"],
    w: [["One switch in the dashboard is enough", "Un interrupteur dans le tableau de bord suffit", "Basta un interruptor en el panel"], ["Add a TXT record with the zone's key", "Ajouter un enregistrement TXT avec la clé de la zone", "Añadir un registro TXT con la clave de la zona"], ["Nothing: every zone is signed and trusted automatically", "Rien : chaque zone est signée et reconnue automatiquement", "Nada: cada zona se firma y se reconoce automáticamente"]],
    e: [
      "Cloudflare signs the zone, but resolvers only trust the signatures once the parent zone (`.com`, `.ch`) holds the DS record that links to your key, and that is set at the registrar. When moving a zone away, remove the DS record first, or validating resolvers will reject every answer.",
      "Cloudflare signe la zone, mais les résolveurs ne font confiance aux signatures qu'une fois que la zone parente (`.com`, `.ch`) contient l'enregistrement DS qui renvoie à ta clé, et c'est chez le registraire qu'il se pose. En quittant Cloudflare, retire d'abord l'enregistrement DS, sinon les résolveurs qui valident rejetteront toutes les réponses.",
      "Cloudflare firma la zona, pero los resolvedores solo confían en las firmas cuando la zona padre (`.com`, `.ch`) contiene el registro DS que enlaza con tu clave, y eso se pone en el registrador. Al llevarte la zona, quita primero el registro DS, o los resolvedores que validan rechazarán todas las respuestas.",
    ],
  },
];

const tlsCertificates: CfQuestion[] = [
  {
    id: "cf-tls-05",
    q: ["Who trusts a Cloudflare Origin CA certificate?", "Qui fait confiance à un certificat Cloudflare Origin CA ?", "¿Quién confía en un certificado Cloudflare Origin CA?"],
    a: ["Only Cloudflare: it secures the Cloudflare-to-origin connection behind the proxy, with Full (strict)", "Seulement Cloudflare : il sécurise la connexion Cloudflare → origine derrière le proxy, avec Full (strict)", "Solo Cloudflare: protege la conexión Cloudflare → origen detrás del proxy, con Full (strict)"],
    w: [["Every browser, like a public certificate", "Tous les navigateurs, comme un certificat public", "Todos los navegadores, como un certificado público"], ["Let's Encrypt, which cross-signs it", "Let's Encrypt, qui le contresigne", "Let's Encrypt, que lo firma de forma cruzada"], ["Nobody: it only works with the Full mode", "Personne : il ne marche qu'avec le mode Full", "Nadie: solo funciona con el modo Full"]],
    e: [
      "Origin CA certificates are free, last up to 15 years, and are valid for Full (strict). If you turn the proxy off for a hostname that uses one, browsers see an untrusted certificate. A public certificate (Let's Encrypt) keeps working with or without the proxy.",
      "Les certificats Origin CA sont gratuits, durent jusqu'à 15 ans et sont valables pour Full (strict). Si tu coupes le proxy d'un nom qui en utilise un, les navigateurs voient un certificat non reconnu. Un certificat public (Let's Encrypt) marche avec ou sans proxy.",
      "Los certificados Origin CA son gratuitos, duran hasta 15 años y valen para Full (strict). Si quitas el proxy de un nombre que usa uno, los navegadores ven un certificado no reconocido. Un certificado público (Let's Encrypt) funciona con o sin proxy.",
    ],
  },
  {
    id: "cf-tls-06",
    q: ["Visitors get a certificate error on `dev.www.example.com`, a proxied hostname. What fixes it?", "Les visiteurs ont une erreur de certificat sur `dev.www.example.com`, un nom proxifié. Qu'est-ce qui la corrige ?", "Los visitantes reciben un error de certificado en `dev.www.example.com`, un nombre proxificado. ¿Qué lo arregla?"],
    a: ["An advanced certificate or Total TLS (Advanced Certificate Manager), or a custom certificate", "Un certificat avancé ou Total TLS (Advanced Certificate Manager), ou un certificat personnalisé", "Un certificado avanzado o Total TLS (Advanced Certificate Manager), o un certificado propio"],
    w: [["Waiting: Universal SSL will cover it in a day", "Attendre : Universal SSL le couvrira dans un jour", "Esperar: Universal SSL lo cubrirá en un día"], ["Switching the zone to Full (strict)", "Passer la zone en Full (strict)", "Pasar la zona a Full (strict)"], ["An Origin CA certificate on the server", "Un certificat Origin CA sur le serveur", "Un certificado Origin CA en el servidor"]],
    e: [
      "Universal SSL covers `example.com` and `*.example.com`, and a wildcard covers one level only. The error comes from the edge certificate, the one visitors see, so changing the origin's certificate or the encryption mode does not help.",
      "Universal SSL couvre `example.com` et `*.example.com`, et un joker ne couvre qu'un niveau. L'erreur vient du certificat de bordure, celui que voient les visiteurs : changer le certificat de l'origine ou le mode de chiffrement n'y fait rien.",
      "Universal SSL cubre `example.com` y `*.example.com`, y un comodín solo cubre un nivel. El error viene del certificado de borde, el que ven los visitantes, así que cambiar el certificado del origen o el modo de cifrado no ayuda.",
    ],
  },
  {
    id: "cf-tls-07",
    q: ["What is the risk of turning HSTS on too early?", "Quel est le risque d'activer HSTS trop tôt ?", "¿Qué riesgo tiene activar HSTS demasiado pronto?"],
    a: ["Browsers that saw it refuse plain HTTP to the site until it expires, so a hostname without working HTTPS becomes unreachable", "Les navigateurs qui l'ont vu refusent le HTTP simple vers le site jusqu'à son expiration : un nom sans HTTPS fonctionnel devient inaccessible", "Los navegadores que lo vieron rechazan el HTTP simple hacia el sitio hasta que caduca, así que un nombre sin HTTPS funcional queda inaccesible"],
    w: [["None: it can be turned off at any time with immediate effect", "Aucun : on peut le désactiver à tout moment, avec effet immédiat", "Ninguno: se puede desactivar en cualquier momento con efecto inmediato"], ["It disables caching for HTML", "Il désactive le cache du HTML", "Desactiva la caché del HTML"], ["It slows down every TLS handshake", "Il ralentit chaque négociation TLS", "Ralentiza cada negociación TLS"]],
    e: [
      "HSTS is a promise kept by browsers for `max-age` seconds; `includeSubDomains` extends it to every subdomain. Turn it on once HTTPS works everywhere, starting with a short `max-age`.",
      "HSTS est une promesse gardée par les navigateurs pendant `max-age` secondes ; `includeSubDomains` l'étend à chaque sous-domaine. Active-le une fois HTTPS opérationnel partout, en commençant par un `max-age` court.",
      "HSTS es una promesa que los navegadores guardan `max-age` segundos; `includeSubDomains` la extiende a cada subdominio. Actívalo cuando HTTPS funcione en todas partes, empezando con un `max-age` corto.",
    ],
  },
  {
    id: "cf-tls-08",
    q: ["Which minimum TLS version suits most sites today?", "Quelle version minimale de TLS convient à la plupart des sites aujourd'hui ?", "¿Qué versión mínima de TLS conviene hoy a la mayoría de los sitios?"],
    a: ["TLS 1.2", "TLS 1.2", "TLS 1.2"],
    w: [["TLS 1.0, for old browsers", "TLS 1.0, pour les vieux navigateurs", "TLS 1.0, para navegadores antiguos"], ["SSL 3.0", "SSL 3.0", "SSL 3.0"], ["TLS 1.3 only, for every visitor and every client", "TLS 1.3 seulement, pour tous les visiteurs et clients", "Solo TLS 1.3, para todos los visitantes y clientes"]],
    e: [
      "TLS 1.0 and 1.1 are obsolete and refused by modern browsers. Turn TLS 1.3 on as well; requiring 1.3 alone can lock out older API clients and devices, so it is a choice for controlled audiences.",
      "TLS 1.0 et 1.1 sont obsolètes et refusés par les navigateurs modernes. Active aussi TLS 1.3 ; n'exiger que 1.3 peut exclure d'anciens clients d'API et appareils : c'est un choix pour des publics maîtrisés.",
      "TLS 1.0 y 1.1 están obsoletos y los navegadores modernos los rechazan. Activa también TLS 1.3; exigir solo 1.3 puede dejar fuera clientes de API y dispositivos antiguos, así que es una opción para públicos controlados.",
    ],
  },
];

const cacheRules: CfQuestion[] = [
  {
    id: "cf-cache-05",
    q: ["`/logo.png?utm_source=mail` and `/logo.png?utm_source=ad`: how many cache entries by default?", "`/logo.png?utm_source=mail` et `/logo.png?utm_source=ad` : combien d'entrées de cache par défaut ?", "`/logo.png?utm_source=mail` y `/logo.png?utm_source=ad`: ¿cuántas entradas de caché por defecto?"],
    a: ["Two: the full query string is part of the default cache key", "Deux : la chaîne de requête entière fait partie de la clé de cache par défaut", "Dos: la cadena de consulta completa forma parte de la clave de caché por defecto"],
    w: [["One: query strings are ignored", "Une : les chaînes de requête sont ignorées", "Una: las cadenas de consulta se ignoran"], ["One: `utm_` parameters are removed automatically", "Une : les paramètres `utm_` sont retirés automatiquement", "Una: los parámetros `utm_` se quitan automáticamente"], ["None: URLs with a query string are never cached", "Aucune : les URL avec une chaîne de requête ne sont jamais mises en cache", "Ninguna: las URL con cadena de consulta nunca se guardan"]],
    e: [
      "The default key is the scheme, host, path and full query string, plus the `Origin` header and a few forwarding headers. Every plan can ignore or sort the query string in a Cache Rule; choosing individual parameters, headers or cookies for the key is Enterprise.",
      "La clé par défaut est le schéma, l'hôte, le chemin et toute la chaîne de requête, plus l'en-tête `Origin` et quelques en-têtes de transfert. Tous les plans peuvent ignorer ou trier la chaîne de requête dans une Cache Rule ; choisir des paramètres, en-têtes ou cookies précis pour la clé est réservé à Enterprise.",
      "La clave por defecto es el esquema, el host, la ruta y toda la cadena de consulta, más la cabecera `Origin` y algunas de reenvío. Todos los planes pueden ignorar u ordenar la cadena de consulta en una Cache Rule; elegir parámetros, cabeceras o cookies concretos para la clave es de Enterprise.",
    ],
  },
  {
    id: "cf-cache-06",
    q: ["What is the difference between the Edge Cache TTL and the Browser Cache TTL?", "Quelle différence entre l'Edge Cache TTL et le Browser Cache TTL ?", "¿Qué diferencia hay entre el Edge Cache TTL y el Browser Cache TTL?"],
    a: ["The edge TTL is how long Cloudflare keeps the object; the browser TTL is what Cloudflare tells the visitor's browser", "L'edge TTL est la durée pendant laquelle Cloudflare garde l'objet ; le browser TTL est ce que Cloudflare dit au navigateur du visiteur", "El TTL de borde es cuánto guarda Cloudflare el objeto; el TTL de navegador es lo que Cloudflare le dice al navegador del visitante"],
    w: [["They are two names for the same setting", "Ce sont deux noms du même réglage", "Son dos nombres del mismo ajuste"], ["The edge TTL is for HTML, the browser TTL for images", "L'edge TTL est pour le HTML, le browser TTL pour les images", "El TTL de borde es para HTML, el de navegador para imágenes"], ["The browser TTL must always be longer than the edge TTL", "Le browser TTL doit toujours être plus long que l'edge TTL", "El TTL de navegador siempre debe ser más largo que el de borde"]],
    e: [
      "They are separate clocks. By default the edge follows the origin's `Cache-Control` (`s-maxage`, then `max-age`); the browser is told the origin's value, raised to 4 hours when shorter or missing. A short edge TTL with a long browser TTL means a purge cannot reach visitors who already have the file.",
      "Ce sont deux horloges distinctes. Par défaut, la bordure suit le `Cache-Control` de l'origine (`s-maxage`, puis `max-age`) ; le navigateur reçoit la valeur de l'origine, relevée à 4 heures si elle est plus courte ou absente. Un edge TTL court avec un browser TTL long veut dire qu'une purge n'atteint pas les visiteurs qui ont déjà le fichier.",
      "Son dos relojes distintos. Por defecto, el borde sigue el `Cache-Control` del origen (`s-maxage`, luego `max-age`); al navegador se le da el valor del origen, subido a 4 horas si es más corto o falta. Un TTL de borde corto con uno de navegador largo significa que una purga no llega a los visitantes que ya tienen el archivo.",
    ],
  },
  {
    id: "cf-cache-07",
    q: ["What is `CDN-Cache-Control` for?", "À quoi sert `CDN-Cache-Control` ?", "¿Para qué sirve `CDN-Cache-Control`?"],
    a: ["To give the CDN a different lifetime from the browser's", "À donner au CDN une durée différente de celle du navigateur", "Para dar a la CDN una duración distinta de la del navegador"],
    w: [["To turn caching off on the whole zone", "À désactiver le cache sur toute la zone", "Para desactivar la caché en toda la zona"], ["It is an older spelling of `Cache-Control`, read the same way", "C'est une ancienne graphie de `Cache-Control`, lue de la même façon", "Es una forma antigua de `Cache-Control`, leída igual"], ["To set the browser's lifetime only", "À régler seulement la durée du navigateur", "Para fijar solo la duración del navegador"]],
    e: [
      "With `Cache-Control: max-age=60` and `CDN-Cache-Control: max-age=86400`, browsers keep the page a minute while Cloudflare keeps it a day, and a purge refreshes it at once. `Cloudflare-CDN-Cache-Control` does the same for Cloudflare alone, when other CDNs sit in the chain.",
      "Avec `Cache-Control: max-age=60` et `CDN-Cache-Control: max-age=86400`, les navigateurs gardent la page une minute et Cloudflare un jour, et une purge la rafraîchit aussitôt. `Cloudflare-CDN-Cache-Control` fait la même chose pour Cloudflare seul, quand d'autres CDN sont dans la chaîne.",
      "Con `Cache-Control: max-age=60` y `CDN-Cache-Control: max-age=86400`, los navegadores guardan la página un minuto y Cloudflare un día, y una purga la refresca al instante. `Cloudflare-CDN-Cache-Control` hace lo mismo solo para Cloudflare, cuando hay otras CDN en la cadena.",
    ],
  },
  {
    id: "cf-cache-08",
    q: ["On the Free plan, which purge methods can you use?", "Avec le plan Free, quelles méthodes de purge peux-tu utiliser ?", "Con el plan Free, ¿qué métodos de purga puedes usar?"],
    a: ["All of them: by URL, everything, cache tag, hostname and prefix, with lower rate limits than paid plans", "Toutes : par URL, tout, étiquette de cache, nom d'hôte et préfixe, avec des limites de débit plus basses que les plans payants", "Todos: por URL, todo, etiqueta de caché, nombre de host y prefijo, con límites de velocidad más bajos que los planes de pago"],
    w: [["Only single URLs", "Seulement des URL une à une", "Solo URL sueltas"], ["Only purge everything", "Seulement tout purger", "Solo purgarlo todo"], ["URLs and everything; tags and prefixes need Enterprise", "Les URL et tout ; étiquettes et préfixes demandent Enterprise", "URL y todo; etiquetas y prefijos requieren Enterprise"]],
    e: [
      "Every purge method has been available on every plan since 2025. On Free, purges by tag, hostname, prefix or everything are limited to 5 requests a minute; single-URL purges to 800 URLs a second. A 200 answer means the purge was accepted: check that `CF-Cache-Status` is no longer `HIT`.",
      "Toutes les méthodes de purge sont disponibles sur tous les plans depuis 2025. En Free, les purges par étiquette, nom d'hôte, préfixe ou totales sont limitées à 5 requêtes par minute ; les purges d'URL à 800 URL par seconde. Une réponse 200 veut dire que la purge est acceptée : vérifie que `CF-Cache-Status` n'est plus `HIT`.",
      "Todos los métodos de purga están disponibles en todos los planes desde 2025. En Free, las purgas por etiqueta, nombre de host, prefijo o totales se limitan a 5 peticiones por minuto; las de URL, a 800 URL por segundo. Una respuesta 200 significa que la purga se aceptó: comprueba que `CF-Cache-Status` ya no es `HIT`.",
    ],
  },
];

const wafRules: CfQuestion[] = [
  {
    id: "cf-sec-05",
    q: ["Which run first on a request, WAF custom rules or WAF Managed Rules?", "Lesquelles passent en premier sur une requête, les règles personnalisées du WAF ou les règles gérées ?", "¿Cuáles se aplican primero a una petición, las reglas personalizadas del WAF o las gestionadas?"],
    a: ["The custom rules, then rate limiting, then the managed rules", "Les règles personnalisées, puis la limitation de débit, puis les règles gérées", "Las reglas personalizadas, luego la limitación de velocidad y luego las gestionadas"],
    w: [["The managed rules, then the custom rules", "Les règles gérées, puis les personnalisées", "Las gestionadas, luego las personalizadas"], ["Both at once; the strictest action wins", "Les deux à la fois ; l'action la plus stricte l'emporte", "Las dos a la vez; gana la acción más estricta"], ["Whichever was created first", "Celles qui ont été créées en premier", "Las que se crearon primero"]],
    e: [
      "Each product is a phase of the Ruleset Engine, run in a fixed order. A custom rule that blocks, challenges or skips decides before the managed rulesets see the request; that is why exceptions for managed rules are written as skip rules.",
      "Chaque produit est une phase du Ruleset Engine, exécutée dans un ordre fixe. Une règle personnalisée qui bloque, défie ou fait sauter décide avant que les règles gérées voient la requête ; c'est pourquoi les exceptions aux règles gérées s'écrivent comme des règles de saut (skip).",
      "Cada producto es una fase del Ruleset Engine, ejecutada en un orden fijo. Una regla personalizada que bloquea, desafía u omite decide antes de que las reglas gestionadas vean la petición; por eso las excepciones a las reglas gestionadas se escriben como reglas de omisión (skip).",
    ],
  },
  {
    id: "cf-sec-06",
    q: ["Which plan do you need for the `matches` operator (regular expressions) in rules?", "Quel plan faut-il pour l'opérateur `matches` (expressions régulières) dans les règles ?", "¿Qué plan hace falta para el operador `matches` (expresiones regulares) en las reglas?"],
    a: ["Business or Enterprise", "Business ou Enterprise", "Business o Enterprise"],
    w: [["Any plan, Free included", "N'importe lequel, Free compris", "Cualquiera, Free incluido"], ["Pro or above", "Pro ou plus", "Pro o superior"], ["Enterprise only", "Enterprise seulement", "Solo Enterprise"]],
    e: [
      "On Free and Pro, `wildcard`, `starts_with()`, `contains` and `in` cover most needs. Note that `wildcard` is case-insensitive, while `eq` and `contains` are case-sensitive.",
      "En Free et Pro, `wildcard`, `starts_with()`, `contains` et `in` couvrent la plupart des besoins. Note que `wildcard` ignore la casse, alors que `eq` et `contains` la respectent.",
      "En Free y Pro, `wildcard`, `starts_with()`, `contains` e `in` cubren la mayoría de las necesidades. Ojo: `wildcard` no distingue mayúsculas, mientras que `eq` y `contains` sí.",
    ],
  },
  {
    id: "cf-sec-07",
    q: ["What does the Skip action of a custom rule do?", "Que fait l'action Skip d'une règle personnalisée ?", "¿Qué hace la acción Skip de una regla personalizada?"],
    a: ["The matching request skips the remaining custom rules, or chosen products such as managed rules or rate limiting", "La requête correspondante saute les règles personnalisées restantes, ou des produits choisis comme les règles gérées ou la limitation de débit", "La petición que coincide se salta las reglas personalizadas restantes, o productos elegidos como las reglas gestionadas o la limitación de velocidad"],
    w: [["It blocks the request silently", "Elle bloque la requête en silence", "Bloquea la petición en silencio"], ["It only writes the request to the logs", "Elle n'écrit la requête que dans les journaux", "Solo escribe la petición en los registros"], ["It delays the request by a few seconds", "Elle retarde la requête de quelques secondes", "Retrasa la petición unos segundos"]],
    e: [
      "Skip lets trusted traffic through: a partner's health checks, your own monitoring. Since custom rules run before rate limiting and managed rules, a skip there can exempt the request from them. Keep its expression narrow.",
      "Skip laisse passer un trafic de confiance : les contrôles de santé d'un partenaire, ta propre surveillance. Comme les règles personnalisées passent avant la limitation de débit et les règles gérées, un skip à cet endroit peut l'en exempter. Garde son expression étroite.",
      "Skip deja pasar tráfico de confianza: las comprobaciones de salud de un socio, tu propia monitorización. Como las reglas personalizadas van antes de la limitación de velocidad y de las reglas gestionadas, un skip ahí puede eximir a la petición de ellas. Mantén su expresión estrecha.",
    ],
  },
  {
    id: "cf-sec-08",
    q: ["Where are rate limiting counters kept?", "Où sont tenus les compteurs de la limitation de débit ?", "¿Dónde se llevan los contadores de la limitación de velocidad?"],
    a: ["In each data center: Cloudflare has no global counter across its network", "Dans chaque centre de données : Cloudflare n'a pas de compteur global sur tout son réseau", "En cada centro de datos: Cloudflare no tiene un contador global en toda su red"],
    w: [["In one global counter per rule", "Dans un compteur global par règle", "En un contador global por regla"], ["In one counter per account", "Dans un compteur par compte", "En un contador por cuenta"], ["In the visitor's browser, in a cookie", "Dans le navigateur du visiteur, dans un cookie", "En el navegador del visitante, en una cookie"]],
    e: [
      "Each rule counts per data center and per characteristic (the IP by default). A client whose requests land in one place is counted exactly; a botnet spread over many cities can stay under a per-IP limit everywhere, which is the job of bot detection and challenges.",
      "Chaque règle compte par centre de données et par caractéristique (l'IP par défaut). Un client dont les requêtes arrivent au même endroit est compté exactement ; un botnet réparti sur de nombreuses villes peut rester sous une limite par IP partout, ce qui relève de la détection des bots et des défis.",
      "Cada regla cuenta por centro de datos y por característica (la IP por defecto). Un cliente cuyas peticiones llegan al mismo sitio se cuenta exactamente; una botnet repartida por muchas ciudades puede quedarse bajo un límite por IP en todas partes, y eso es trabajo de la detección de bots y los desafíos.",
    ],
  },
];

const workersConfig: CfQuestion[] = [
  {
    id: "cf-wk-05",
    q: ["What is the `compatibility_date` of a Worker for?", "À quoi sert la `compatibility_date` d'un Worker ?", "¿Para qué sirve la `compatibility_date` de un Worker?"],
    a: ["It freezes the runtime's behaviour as of that date, so a runtime release never changes your Worker until you move it", "Elle fige le comportement du runtime à cette date : une nouvelle version du runtime ne change jamais ton Worker tant que tu ne la déplaces pas", "Congela el comportamiento del runtime a esa fecha: una nueva versión del runtime nunca cambia tu Worker hasta que la muevas"],
    w: [["It is the date of the last deployment", "C'est la date du dernier déploiement", "Es la fecha del último despliegue"], ["After that date, the Worker stops", "Après cette date, le Worker s'arrête", "Pasada esa fecha, el Worker se detiene"], ["It sets how long responses are cached", "Elle règle la durée de mise en cache des réponses", "Fija cuánto tiempo se guardan las respuestas"]],
    e: [
      "Set today's date on a new project to get the latest behaviour, then update it on purpose and test. `compatibility_flags` turn on single behaviours, such as `nodejs_compat` for Node's APIs.",
      "Mets la date du jour sur un nouveau projet pour avoir le comportement le plus récent, puis mets-la à jour volontairement et teste. Les `compatibility_flags` activent des comportements isolés, comme `nodejs_compat` pour les API de Node.",
      "Pon la fecha de hoy en un proyecto nuevo para tener el comportamiento más reciente, y luego actualízala a propósito y prueba. Las `compatibility_flags` activan comportamientos sueltos, como `nodejs_compat` para las API de Node.",
    ],
  },
  {
    id: "cf-wk-06",
    q: ["`wrangler deploy --env staging` with an `env.staging` section: what is deployed?", "`wrangler deploy --env staging` avec une section `env.staging` : qu'est-ce qui est déployé ?", "`wrangler deploy --env staging` con una sección `env.staging`: ¿qué se despliega?"],
    a: ["A separate Worker, with the name, routes and bindings of that environment", "Un Worker distinct, avec le nom, les routes et les liaisons de cet environnement", "Un Worker distinto, con el nombre, las rutas y los enlaces de ese entorno"],
    w: [["The same Worker, with a variable `ENV=staging`", "Le même Worker, avec une variable `ENV=staging`", "El mismo Worker, con una variable `ENV=staging`"], ["The Git branch called `staging`", "La branche Git appelée `staging`", "La rama de Git llamada `staging`"], ["The Worker in a staging region of Cloudflare's network", "Le Worker dans une région de préproduction du réseau de Cloudflare", "El Worker en una región de preproducción de la red de Cloudflare"]],
    e: [
      "Each environment becomes its own Worker (by default named `<name>-staging`), so staging and production never share routes, KV namespaces or databases unless you say so. Bindings are not inherited from the top level: declare them in each environment.",
      "Chaque environnement devient son propre Worker (par défaut nommé `<name>-staging`) : préproduction et production ne partagent jamais routes, espaces KV ni bases, sauf si tu le demandes. Les liaisons ne sont pas héritées du niveau supérieur : déclare-les dans chaque environnement.",
      "Cada entorno se convierte en su propio Worker (por defecto llamado `<name>-staging`), así que preproducción y producción nunca comparten rutas, espacios KV ni bases salvo que lo indiques. Los enlaces no se heredan del nivel superior: decláralos en cada entorno.",
    ],
  },
  {
    id: "cf-wk-07",
    q: ["What does `ctx.waitUntil(promise)` do in a Worker?", "Que fait `ctx.waitUntil(promise)` dans un Worker ?", "¿Qué hace `ctx.waitUntil(promise)` en un Worker?"],
    a: ["It keeps the Worker alive to finish background work after the response has been sent", "Il garde le Worker en vie pour finir un travail de fond après l'envoi de la réponse", "Mantiene vivo el Worker para terminar un trabajo en segundo plano tras enviar la respuesta"],
    w: [["It delays the response until the promise settles", "Il retarde la réponse jusqu'à ce que la promesse se termine", "Retrasa la respuesta hasta que la promesa termina"], ["It waits for a subrequest with a timeout", "Il attend une sous-requête avec un délai maximal", "Espera una subpetición con un tiempo límite"], ["It schedules the promise for the next request", "Il programme la promesse pour la requête suivante", "Programa la promesa para la siguiente petición"]],
    e: [
      "Logging, analytics or a cache write need not slow the visitor down: hand them to `waitUntil` and return the response. Use it only for work that does not affect the response, and do not destructure `ctx`, which loses the method's binding.",
      "Journalisation, statistiques ou écriture en cache n'ont pas à ralentir le visiteur : confie-les à `waitUntil` et renvoie la réponse. Réserve-le au travail qui n'influe pas sur la réponse, et ne déstructure pas `ctx`, ce qui détache la méthode.",
      "El registro, las estadísticas o una escritura en caché no tienen por qué frenar al visitante: pásalos a `waitUntil` y devuelve la respuesta. Úsalo solo para trabajo que no afecta a la respuesta, y no desestructures `ctx`, que desvincula el método.",
    ],
  },
  {
    id: "cf-wk-08",
    q: ["A Worker on a Custom Domain, or on a route: what is the difference?", "Un Worker sur un Custom Domain ou sur une route : quelle différence ?", "Un Worker en un Custom Domain o en una ruta: ¿qué diferencia hay?"],
    a: ["On a Custom Domain the Worker is the origin of the hostname; on a route it runs in front of an existing origin for a URL pattern", "Sur un Custom Domain, le Worker est l'origine du nom d'hôte ; sur une route, il s'exécute devant une origine existante pour un motif d'URL", "En un Custom Domain el Worker es el origen del nombre de host; en una ruta se ejecuta delante de un origen existente para un patrón de URL"],
    w: [["None: they are two names for the same thing", "Aucune : ce sont deux noms de la même chose", "Ninguna: son dos nombres de lo mismo"], ["A route is only for `workers.dev` addresses", "Une route ne sert qu'aux adresses `workers.dev`", "Una ruta solo sirve para direcciones `workers.dev`"], ["A Custom Domain needs the zone to be DNS-only", "Un Custom Domain exige que la zone soit en DNS seulement", "Un Custom Domain exige que la zona sea solo DNS"]],
    e: [
      "For a Custom Domain, Cloudflare creates the DNS record and the certificate, and the zone must be on Cloudflare. A route such as `example.com/api/*` lets a Worker handle part of a site, passing other requests on with `fetch(request)`.",
      "Pour un Custom Domain, Cloudflare crée l'enregistrement DNS et le certificat, et la zone doit être chez Cloudflare. Une route comme `example.com/api/*` laisse un Worker traiter une partie d'un site et transmettre les autres requêtes avec `fetch(request)`.",
      "Para un Custom Domain, Cloudflare crea el registro DNS y el certificado, y la zona debe estar en Cloudflare. Una ruta como `example.com/api/*` deja que un Worker atienda una parte de un sitio y pase las demás peticiones con `fetch(request)`.",
    ],
  },
];

const storageChoice: CfQuestion[] = [
  {
    id: "cf-st-05",
    q: ["Where do you keep an exact page-view counter?", "Où garder un compteur exact de pages vues ?", "¿Dónde guardar un contador exacto de visitas a una página?"],
    a: ["In a Durable Object: one instance per page handles the increments in turn", "Dans un Durable Object : une instance par page traite les incréments l'un après l'autre", "En un Durable Object: una instancia por página atiende los incrementos de uno en uno"],
    w: [["In KV, reading then writing the value", "Dans KV, en lisant puis écrivant la valeur", "En KV, leyendo y luego escribiendo el valor"], ["In R2, one object per page", "Dans R2, un objet par page", "En R2, un objeto por página"], ["In the Cache API", "Dans la Cache API", "En la Cache API"]],
    e: [
      "With KV, two locations can both read 41 and write 42, and a key accepts one write per second. A Durable Object serialises the increments, with transactional storage. For approximate analytics at scale, Analytics Engine is another option.",
      "Avec KV, deux sites peuvent tous deux lire 41 et écrire 42, et une clé n'accepte qu'une écriture par seconde. Un Durable Object met les incréments en file, avec un stockage transactionnel. Pour des statistiques approximatives à grande échelle, Analytics Engine est une autre option.",
      "Con KV, dos ubicaciones pueden leer 41 y escribir 42, y una clave solo acepta una escritura por segundo. Un Durable Object pone los incrementos en fila, con almacenamiento transaccional. Para estadísticas aproximadas a gran escala, Analytics Engine es otra opción.",
    ],
  },
  {
    id: "cf-st-06",
    q: ["How often can one KV key be written?", "À quelle fréquence peut-on écrire une même clé KV ?", "¿Con qué frecuencia se puede escribir una misma clave KV?"],
    a: ["At most once per second", "Au plus une fois par seconde", "Como mucho una vez por segundo"],
    w: [["Up to 100 times per second", "Jusqu'à 100 fois par seconde", "Hasta 100 veces por segundo"], ["Without limit", "Sans limite", "Sin límite"], ["Once per minute", "Une fois par minute", "Una vez por minuto"]],
    e: [
      "The limit is per key, on every plan; different keys can be written in parallel. Values hold up to 25 MiB and keys up to 512 bytes. Frequent writes to one key mean the data belongs in a Durable Object or D1.",
      "La limite vaut par clé, sur tous les plans ; des clés différentes s'écrivent en parallèle. Les valeurs vont jusqu'à 25 Mio et les clés jusqu'à 512 octets. Des écritures fréquentes sur une clé veulent dire que la donnée a sa place dans un Durable Object ou D1.",
      "El límite es por clave, en todos los planes; claves distintas se escriben en paralelo. Los valores llegan a 25 MiB y las claves a 512 bytes. Escrituras frecuentes en una clave indican que el dato va en un Durable Object o en D1.",
    ],
  },
  {
    id: "cf-st-07",
    q: ["Cloudflare Queues delivers messages at least once. What must a consumer therefore be?", "Cloudflare Queues livre les messages au moins une fois. Que doit donc être un consommateur ?", "Cloudflare Queues entrega los mensajes al menos una vez. ¿Qué debe ser, por tanto, un consumidor?"],
    a: ["Idempotent: handling the same message twice must do no harm", "Idempotent : traiter deux fois le même message ne doit pas faire de dégât", "Idempotente: procesar dos veces el mismo mensaje no debe causar daños"],
    w: [["Fast: messages expire after one second", "Rapide : les messages expirent après une seconde", "Rápido: los mensajes caducan tras un segundo"], ["Single-threaded, like a Durable Object", "Monothread, comme un Durable Object", "De un solo hilo, como un Durable Object"], ["Nothing special: each message arrives exactly once", "Rien de spécial : chaque message arrive exactement une fois", "Nada especial: cada mensaje llega exactamente una vez"]],
    e: [
      "A retry after a timeout can deliver a message that was in fact processed. Store an ID of what was done (a payment ID) and skip duplicates. Failed messages are retried, up to 100 times, then sent to a dead letter queue if one is configured.",
      "Une nouvelle tentative après un délai dépassé peut livrer un message déjà traité. Garde un identifiant de ce qui a été fait (un ID de paiement) et ignore les doublons. Les messages en échec sont réessayés, jusqu'à 100 fois, puis envoyés dans une file des lettres mortes si elle existe.",
      "Un reintento tras un tiempo de espera puede entregar un mensaje que ya se procesó. Guarda un identificador de lo hecho (un ID de pago) y omite los duplicados. Los mensajes fallidos se reintentan, hasta 100 veces, y luego van a una cola de mensajes fallidos si existe.",
    ],
  },
  {
    id: "cf-st-08",
    q: ["How should a Worker pass a customer ID to a D1 query?", "Comment un Worker doit-il passer un identifiant client à une requête D1 ?", "¿Cómo debe pasar un Worker el ID de un cliente a una consulta D1?"],
    a: ["With a placeholder and `bind()`: `prepare(\"… WHERE id = ?\").bind(id)`", "Avec un paramètre et `bind()` : `prepare(\"… WHERE id = ?\").bind(id)`", "Con un parámetro y `bind()`: `prepare(\"… WHERE id = ?\").bind(id)`"],
    w: [["By concatenating it into the SQL string", "En le concaténant dans la chaîne SQL", "Concatenándolo en la cadena SQL"], ["Inside a template literal in the SQL", "Dans un gabarit de chaîne (template literal) en SQL", "Dentro de una plantilla de cadena (template literal) en el SQL"], ["After escaping the quotes by hand", "Après avoir échappé les guillemets à la main", "Tras escapar las comillas a mano"]],
    e: [
      "Bound parameters are sent apart from the SQL text, so a value can never change the query: that is what prevents SQL injection. A query can bind up to 100 parameters; `db.batch()` sends several statements in one round trip.",
      "Les paramètres liés partent à côté du texte SQL : une valeur ne peut jamais changer la requête, et c'est ce qui empêche l'injection SQL. Une requête peut lier jusqu'à 100 paramètres ; `db.batch()` envoie plusieurs instructions en un aller-retour.",
      "Los parámetros enlazados viajan aparte del texto SQL, así que un valor nunca puede cambiar la consulta: eso es lo que impide la inyección SQL. Una consulta puede enlazar hasta 100 parámetros; `db.batch()` envía varias sentencias en un solo viaje.",
    ],
  },
];

const accessTunnel: CfQuestion[] = [
  {
    id: "cf-zt-05",
    q: ["In an Access policy, how do Include, Require and Exclude combine?", "Dans une stratégie Access, comment Include, Require et Exclude se combinent-ils ?", "En una política de Access, ¿cómo se combinan Include, Require y Exclude?"],
    a: ["Include is OR (one is enough), Require is AND (all must match), Exclude is NOT (any match denies)", "Include est un OU (un seul suffit), Require un ET (tous doivent correspondre), Exclude un NON (une correspondance refuse)", "Include es un O (basta uno), Require un Y (todos deben coincidir), Exclude un NO (cualquier coincidencia deniega)"],
    w: [["Include is AND, Require is OR, Exclude is NOT", "Include est un ET, Require un OU, Exclude un NON", "Include es un Y, Require un O, Exclude un NO"], ["All three are OR", "Les trois sont des OU", "Los tres son O"], ["All three are AND", "Les trois sont des ET", "Los tres son Y"]],
    e: [
      "Include `@example.com`, Require country `CH` and disk encryption, Exclude group `contractors`: an employee with an encrypted laptop in Switzerland gets in, from France they do not, and a contractor never does. Every policy needs at least one Include.",
      "Include `@example.com`, Require pays `CH` et disque chiffré, Exclude groupe `contractors` : un employé avec un portable chiffré en Suisse entre, depuis la France non, et un prestataire jamais. Chaque stratégie a besoin d'au moins un Include.",
      "Include `@example.com`, Require país `CH` y disco cifrado, Exclude grupo `contractors`: un empleado con un portátil cifrado en Suiza entra, desde Francia no, y un contratista nunca. Toda política necesita al menos un Include.",
    ],
  },
  {
    id: "cf-zt-06",
    q: ["What does an Access policy with the Bypass action do?", "Que fait une stratégie Access avec l'action Bypass ?", "¿Qué hace una política de Access con la acción Bypass?"],
    a: ["It turns Access off for matching requests: no login, no checks, and no logging", "Elle désactive Access pour les requêtes correspondantes : pas de connexion, pas de contrôle, et pas de journalisation", "Desactiva Access para las peticiones que coinciden: sin inicio de sesión, sin controles y sin registro"],
    w: [["It makes the login faster for trusted users", "Elle accélère la connexion des utilisateurs de confiance", "Acelera el inicio de sesión de los usuarios de confianza"], ["It logs the request without deciding", "Elle journalise la requête sans décider", "Registra la petición sin decidir"], ["It requires a second factor", "Elle exige un second facteur", "Exige un segundo factor"]],
    e: [
      "Bypass is for public paths of a protected application, such as a health check or static assets. It cannot use identity selectors, and it is evaluated before Allow and Block policies. For machines, use Service Auth with a service token or mTLS instead.",
      "Bypass sert aux chemins publics d'une application protégée, comme un contrôle de santé ou des fichiers statiques. Il ne peut pas utiliser de sélecteurs d'identité, et il est évalué avant les stratégies Allow et Block. Pour des machines, utilise plutôt Service Auth avec un jeton de service ou mTLS.",
      "Bypass sirve para rutas públicas de una aplicación protegida, como una comprobación de salud o archivos estáticos. No puede usar selectores de identidad y se evalúa antes que las políticas Allow y Block. Para máquinas, usa mejor Service Auth con un token de servicio o mTLS.",
    ],
  },
  {
    id: "cf-zt-07",
    q: ["How does a CI job pass an Access application protected by a Service Auth policy?", "Comment un job de CI passe-t-il une application Access protégée par une stratégie Service Auth ?", "¿Cómo pasa un trabajo de CI una aplicación de Access protegida por una política Service Auth?"],
    a: ["It sends a service token in the headers `CF-Access-Client-Id` and `CF-Access-Client-Secret`", "Il envoie un jeton de service dans les en-têtes `CF-Access-Client-Id` et `CF-Access-Client-Secret`", "Envía un token de servicio en las cabeceras `CF-Access-Client-Id` y `CF-Access-Client-Secret`"],
    w: [["It logs in with a user's password", "Il se connecte avec le mot de passe d'un utilisateur", "Inicia sesión con la contraseña de un usuario"], ["It puts an API key in the URL", "Il met une clé d'API dans l'URL", "Pone una clave de API en la URL"], ["It calls from an IP on the allow list, with no header", "Il appelle depuis une IP de la liste autorisée, sans en-tête", "Llama desde una IP de la lista permitida, sin cabecera"]],
    e: [
      "Service tokens are credentials for machines, created in Zero Trust and matched by a Service Auth policy, which runs before Allow and Block policies. Give each token an expiry and one purpose, so it can be revoked alone.",
      "Les jetons de service sont des identifiants pour machines, créés dans Zero Trust et reconnus par une stratégie Service Auth, évaluée avant les Allow et Block. Donne à chaque jeton une expiration et un seul usage, pour pouvoir le révoquer seul.",
      "Los tokens de servicio son credenciales para máquinas, creados en Zero Trust y reconocidos por una política Service Auth, que se evalúa antes que Allow y Block. Da a cada token una caducidad y un único uso, para poder revocarlo solo.",
    ],
  },
  {
    id: "cf-zt-08",
    q: ["Which rule must end a locally managed tunnel's ingress list?", "Quelle règle doit terminer la liste d'entrée d'un tunnel géré localement ?", "¿Qué regla debe cerrar la lista de entrada de un túnel gestionado localmente?"],
    a: ["A catch-all rule with no hostname or path, such as `service: http_status:404`", "Une règle fourre-tout sans nom d'hôte ni chemin, comme `service: http_status:404`", "Una regla comodín sin nombre de host ni ruta, como `service: http_status:404`"],
    w: [["None: the last rule is optional", "Aucune : la dernière règle est facultative", "Ninguna: la última regla es opcional"], ["A rule for the zone apex", "Une règle pour l'apex de la zone", "Una regla para el ápex de la zona"], ["A rule per hostname, in alphabetical order", "Une règle par nom d'hôte, dans l'ordre alphabétique", "Una regla por nombre de host, en orden alfabético"]],
    e: [
      "`cloudflared` checks the rules from the top and uses the first that matches, so the catch-all must be last, and specific rules (a hostname with a path) must come before general ones.",
      "`cloudflared` lit les règles depuis le haut et prend la première qui correspond : le fourre-tout doit être en dernier, et les règles précises (un nom d'hôte avec un chemin) avant les générales.",
      "`cloudflared` lee las reglas desde arriba y usa la primera que coincide, así que el comodín debe ir al final, y las reglas precisas (un nombre de host con una ruta) antes que las generales.",
    ],
  },
];

const aiGateway: CfQuestion[] = [
  {
    id: "cf-ai-05",
    q: ["Which requests does AI Gateway's cache serve?", "Quelles requêtes le cache d'AI Gateway sert-il ?", "¿Qué peticiones sirve la caché de AI Gateway?"],
    a: ["Identical ones: the key is a hash of the provider, model, endpoint, auth header and whole body", "Les requêtes identiques : la clé est une empreinte du fournisseur, du modèle, de l'URL, de l'en-tête d'authentification et de tout le corps", "Las idénticas: la clave es un hash del proveedor, el modelo, la URL, la cabecera de autenticación y todo el cuerpo"],
    w: [["Questions with a similar meaning", "Les questions de sens proche", "Las preguntas de significado parecido"], ["Every request of the same user", "Toutes les requêtes d'un même utilisateur", "Todas las peticiones de un mismo usuario"], ["Every request to the same model", "Toutes les requêtes vers un même modèle", "Todas las peticiones al mismo modelo"]],
    e: [
      "One changed character in the prompt is a different request, a miss. Caching suits repeated prompts: a fixed classification, an FAQ, tests. `cf-aig-cache-key` lets you choose your own key when two requests should share an answer.",
      "Un caractère changé dans le prompt fait une autre requête, un échec du cache. Le cache convient aux prompts répétés : une classification fixe, une FAQ, des tests. `cf-aig-cache-key` permet de choisir sa propre clé quand deux requêtes doivent partager une réponse.",
      "Un carácter cambiado en el prompt es otra petición, un fallo de caché. La caché sirve para prompts repetidos: una clasificación fija, unas preguntas frecuentes, pruebas. `cf-aig-cache-key` permite elegir tu propia clave cuando dos peticiones deben compartir respuesta.",
    ],
  },
  {
    id: "cf-ai-06",
    q: ["Which header sets how long AI Gateway keeps one cached response?", "Quel en-tête règle la durée de conservation d'une réponse dans le cache d'AI Gateway ?", "¿Qué cabecera fija cuánto guarda AI Gateway una respuesta en caché?"],
    a: ["`cf-aig-cache-ttl`, from 60 seconds to one month", "`cf-aig-cache-ttl`, de 60 secondes à un mois", "`cf-aig-cache-ttl`, de 60 segundos a un mes"],
    w: [["`Cache-Control: max-age`", "`Cache-Control: max-age`", "`Cache-Control: max-age`"], ["`CF-Cache-Status`", "`CF-Cache-Status`", "`CF-Cache-Status`"], ["`cf-aig-skip-cache`", "`cf-aig-skip-cache`", "`cf-aig-skip-cache`"]],
    e: [
      "`cf-aig-skip-cache` bypasses the cache for one request, and the response header `cf-aig-cache-status` says `HIT` or `MISS`. Caching is off until enabled for the gateway, where a default TTL can be set.",
      "`cf-aig-skip-cache` contourne le cache pour une requête, et l'en-tête de réponse `cf-aig-cache-status` dit `HIT` ou `MISS`. Le cache est désactivé tant qu'il n'est pas activé pour la passerelle, où une durée par défaut peut être fixée.",
      "`cf-aig-skip-cache` se salta la caché en una petición, y la cabecera de respuesta `cf-aig-cache-status` dice `HIT` o `MISS`. La caché está desactivada hasta que se activa para la pasarela, donde se puede fijar un TTL por defecto.",
    ],
  },
  {
    id: "cf-ai-07",
    q: ["Your main model's provider is down. What can AI Gateway do without code changes?", "Le fournisseur de ton modèle principal est en panne. Que peut faire AI Gateway sans changer le code ?", "El proveedor de tu modelo principal está caído. ¿Qué puede hacer AI Gateway sin cambiar el código?"],
    a: ["Retry, then fall back to another model or provider, configured as a route in the gateway", "Réessayer, puis basculer vers un autre modèle ou fournisseur, configuré comme un parcours dans la passerelle", "Reintentar y luego pasar a otro modelo o proveedor, configurado como una ruta en la pasarela"],
    w: [["Nothing: fallbacks must be written in the Worker", "Rien : les bascules doivent être écrites dans le Worker", "Nada: los cambios de modelo deben escribirse en el Worker"], ["Serve every request from its cache, even new ones", "Servir chaque requête depuis son cache, même les nouvelles", "Servir cada petición desde su caché, incluso las nuevas"], ["Only fall back between Workers AI models", "Basculer seulement entre modèles de Workers AI", "Cambiar solo entre modelos de Workers AI"]],
    e: [
      "Dynamic routing describes flows (retries, fallbacks, splits by percentage or metadata) in the gateway's configuration, so the application keeps calling one endpoint. The same layer applies rate and spend limits, guardrails and logging.",
      "Le routage dynamique décrit des parcours (nouvelles tentatives, bascules, répartitions par pourcentage ou métadonnées) dans la configuration de la passerelle : l'application appelle toujours une seule adresse. La même couche applique les limites de débit et de dépenses, les garde-fous et la journalisation.",
      "El enrutamiento dinámico describe flujos (reintentos, cambios de modelo, repartos por porcentaje o metadatos) en la configuración de la pasarela, así que la aplicación sigue llamando a un único punto. La misma capa aplica límites de velocidad y gasto, salvaguardas y registro.",
    ],
  },
  {
    id: "cf-ai-08",
    q: ["Two Workers AI models both handle a task well. How do you lower the bill?", "Deux modèles de Workers AI font bien la tâche. Comment baisser la facture ?", "Dos modelos de Workers AI hacen bien la tarea. ¿Cómo bajar la factura?"],
    a: ["Use the smaller one: an 8-billion-parameter model costs several times less per token than a 70-billion one", "Utiliser le plus petit : un modèle de 8 milliards de paramètres coûte plusieurs fois moins par token qu'un de 70 milliards", "Usar el más pequeño: un modelo de 8 mil millones de parámetros cuesta varias veces menos por token que uno de 70 mil millones"],
    w: [["Use the larger one: it needs fewer tokens", "Utiliser le plus grand : il lui faut moins de tokens", "Usar el más grande: necesita menos tokens"], ["Nothing: every model costs the same", "Rien : tous les modèles coûtent pareil", "Nada: todos los modelos cuestan lo mismo"], ["Call both and keep the cheaper answer", "Appeler les deux et garder la réponse la moins chère", "Llamar a los dos y quedarse con la respuesta más barata"]],
    e: [
      "Prices are per model: for example USD 0.045 per million input tokens for Llama 3.1 8B (fp8, fast) against USD 0.293 for Llama 3.3 70B. Measure quality on your own examples, then pick the smallest that passes; AI Gateway's Auto Router can do this per request.",
      "Les prix sont par modèle : par exemple 0,045 USD par million de tokens d'entrée pour Llama 3.1 8B (fp8, fast) contre 0,293 USD pour Llama 3.3 70B. Mesure la qualité sur tes propres exemples, puis prends le plus petit qui réussit ; l'Auto Router d'AI Gateway peut le faire requête par requête.",
      "Los precios son por modelo: por ejemplo 0,045 USD por millón de tokens de entrada para Llama 3.1 8B (fp8, fast) frente a 0,293 USD para Llama 3.3 70B. Mide la calidad con tus propios ejemplos y elige el más pequeño que la cumpla; el Auto Router de AI Gateway puede hacerlo petición a petición.",
    ],
  },
];

export const dns = { dnsSetup };
export const tls = { tlsCertificates };
export const cache = { cacheRules };
export const security = { wafRules };
export const workers = { workersConfig };
export const storage = { storageChoice };
export const zeroTrust = { accessTunnel };
export const ai = { aiGateway };
