/**
 * Cloudflare, Avancé: leaking the origin, protecting it (mTLS, Tunnel),
 * tiered caching and Cache Reserve, bots and the OWASP scoring, the Workers
 * runtime, Durable Objects' design, Gateway's order, and retrieval.
 */
import type { LinuxQuestion as CfQuestion } from "../linux/types";

const dnsAdvanced: CfQuestion[] = [
  {
    id: "cf-dns-09",
    q: ["`www` is proxied; `direct.example.com` is DNS-only and points to the same server. What is the risk?", "`www` est proxifié ; `direct.example.com` est en DNS seulement et pointe vers le même serveur. Quel est le risque ?", "`www` está proxificado; `direct.example.com` es solo DNS y apunta al mismo servidor. ¿Qué riesgo hay?"],
    a: ["Anyone can read the server's real address and attack it directly, bypassing the WAF and DDoS protection", "N'importe qui peut lire la vraie adresse du serveur et l'attaquer directement, en contournant le WAF et la protection DDoS", "Cualquiera puede leer la dirección real del servidor y atacarlo directamente, saltándose el WAF y la protección DDoS"],
    w: [["None: the proxied record hides it", "Aucun : l'enregistrement proxifié la cache", "Ninguno: el registro proxificado la oculta"], ["Only that `direct` is not cached", "Seulement que `direct` n'est pas mis en cache", "Solo que `direct` no se guarda en caché"], ["Cloudflare refuses two records for one server", "Cloudflare refuse deux enregistrements pour un même serveur", "Cloudflare rechaza dos registros para un mismo servidor"]],
    e: [
      "A DNS-only record publishes its address. Old records, mail servers and services on the same machine are classic leaks. Lock the origin: allow only Cloudflare's IP ranges, require Authenticated Origin Pulls, or better, reach it only through a Tunnel.",
      "Un enregistrement en DNS seulement publie son adresse. Les vieux enregistrements, la messagerie et les services sur la même machine sont des fuites classiques. Verrouille l'origine : n'autorise que les plages d'IP de Cloudflare, exige l'Authenticated Origin Pulls, ou mieux, n'y accède que par un Tunnel.",
      "Un registro solo DNS publica su dirección. Los registros antiguos, el correo y los servicios en la misma máquina son fugas clásicas. Cierra el origen: permite solo los rangos de IP de Cloudflare, exige Authenticated Origin Pulls o, mejor, llega a él solo por un Tunnel.",
    ],
  },
  {
    id: "cf-dns-10",
    q: ["`api.example.com` has two A records; you proxy one of them. What happens to the other?", "`api.example.com` a deux enregistrements A ; tu en proxifies un. Qu'arrive-t-il à l'autre ?", "`api.example.com` tiene dos registros A; proxificas uno. ¿Qué pasa con el otro?"],
    a: ["It is treated as proxied too: on one name, all A and AAAA records share the proxy status", "Il est aussi traité comme proxifié : sur un même nom, tous les A et AAAA partagent l'état du proxy", "También se trata como proxificado: en un mismo nombre, todos los A y AAAA comparten el estado del proxy"],
    w: [["It stays DNS-only and answers half of the queries", "Il reste en DNS seulement et répond à la moitié des requêtes", "Sigue solo DNS y responde a la mitad de las consultas"], ["It is deleted", "Il est supprimé", "Se borra"], ["It becomes the fallback if Cloudflare is down", "Il devient le secours si Cloudflare tombe", "Se convierte en el respaldo si Cloudflare cae"]],
    e: [
      "Cloudflare cannot answer one name with both its own addresses and an origin's. With several origin addresses, the proxy balances between them; for health checks and failover, use Load Balancing.",
      "Cloudflare ne peut pas répondre pour un même nom avec ses propres adresses et celles d'une origine. Avec plusieurs adresses d'origine, le proxy répartit entre elles ; pour des contrôles de santé et la bascule, utilise Load Balancing.",
      "Cloudflare no puede responder para un mismo nombre con sus propias direcciones y las de un origen. Con varias direcciones de origen, el proxy reparte entre ellas; para comprobaciones de salud y conmutación, usa Load Balancing.",
    ],
  },
  {
    id: "cf-dns-11",
    q: ["You move a DNSSEC-signed zone from Cloudflare to another provider. What must you do first?", "Tu déplaces une zone signée DNSSEC de Cloudflare vers un autre fournisseur. Que faut-il faire d'abord ?", "Mueves una zona firmada con DNSSEC de Cloudflare a otro proveedor. ¿Qué debes hacer primero?"],
    a: ["Remove the DS record at the registrar and wait for it to expire from caches", "Retirer l'enregistrement DS chez le registraire et attendre qu'il expire des caches", "Quitar el registro DS en el registrador y esperar a que caduque de las cachés"],
    w: [["Nothing: DNSSEC follows the zone", "Rien : DNSSEC suit la zone", "Nada: DNSSEC sigue a la zona"], ["Delete the zone on Cloudflare first", "Supprimer d'abord la zone chez Cloudflare", "Borrar primero la zona en Cloudflare"], ["Lower every TTL to 30 seconds", "Baisser tous les TTL à 30 secondes", "Bajar todos los TTL a 30 segundos"]],
    e: [
      "The DS record says which key signs the zone. The new provider signs with another key, or not at all, so validating resolvers would reject every answer: the domain disappears for a large share of users. Remove the DS, wait, move, then sign again at the new provider.",
      "L'enregistrement DS dit quelle clé signe la zone. Le nouveau fournisseur signe avec une autre clé, ou pas du tout : les résolveurs qui valident rejetteraient toutes les réponses, et le domaine disparaîtrait pour une grande part des utilisateurs. Retire le DS, attends, déménage, puis signe à nouveau chez le nouveau fournisseur.",
      "El registro DS indica qué clave firma la zona. El nuevo proveedor firma con otra clave, o no firma: los resolvedores que validan rechazarían todas las respuestas y el dominio desaparecería para buena parte de los usuarios. Quita el DS, espera, muda la zona y vuelve a firmar en el nuevo proveedor.",
    ],
  },
  {
    id: "cf-dns-12",
    q: ["You want SSH to a server behind Cloudflare, on port 22. What works?", "Tu veux du SSH vers un serveur derrière Cloudflare, sur le port 22. Qu'est-ce qui marche ?", "Quieres SSH a un servidor detrás de Cloudflare, en el puerto 22. ¿Qué funciona?"],
    a: ["A Tunnel with an Access application (or Spectrum); the HTTP proxy does not carry port 22", "Un Tunnel avec une application Access (ou Spectrum) ; le proxy HTTP ne transporte pas le port 22", "Un Tunnel con una aplicación de Access (o Spectrum); el proxy HTTP no lleva el puerto 22"],
    w: [["Proxying the record: Cloudflare forwards every port", "Proxifier l'enregistrement : Cloudflare relaie tous les ports", "Proxificar el registro: Cloudflare reenvía todos los puertos"], ["A Page Rule on port 22", "Une Page Rule sur le port 22", "Una Page Rule en el puerto 22"], ["A Cache Rule that bypasses the cache", "Une Cache Rule qui contourne le cache", "Una Cache Rule que se salta la caché"]],
    e: [
      "The proxy handles HTTP on 80, 8080, 8880, 2052, 2082, 2086, 2095 and HTTPS on 443, 2053, 2083, 2087, 2096, 8443. A DNS-only record works but exposes the server. A Tunnel publishes SSH with Access in front and no open port; Spectrum proxies arbitrary TCP and UDP ports.",
      "Le proxy prend HTTP sur 80, 8080, 8880, 2052, 2082, 2086, 2095 et HTTPS sur 443, 2053, 2083, 2087, 2096, 8443. Un enregistrement en DNS seulement marche mais expose le serveur. Un Tunnel publie SSH avec Access devant et aucun port ouvert ; Spectrum proxifie des ports TCP et UDP quelconques.",
      "El proxy lleva HTTP en 80, 8080, 8880, 2052, 2082, 2086, 2095 y HTTPS en 443, 2053, 2083, 2087, 2096, 8443. Un registro solo DNS funciona pero expone el servidor. Un Tunnel publica SSH con Access delante y sin puertos abiertos; Spectrum proxifica puertos TCP y UDP cualesquiera.",
    ],
  },
];

const tlsOrigin: CfQuestion[] = [
  {
    id: "cf-tls-09",
    q: ["Authenticated Origin Pulls with Cloudflare's global certificate: what does the origin learn?", "Authenticated Origin Pulls avec le certificat global de Cloudflare : qu'apprend l'origine ?", "Authenticated Origin Pulls con el certificado global de Cloudflare: ¿qué sabe el origen?"],
    a: ["That the request came through Cloudflare, but not that it came through your own zone", "Que la requête vient de Cloudflare, mais pas qu'elle vient de ta propre zone", "Que la petición viene de Cloudflare, pero no que venga de tu propia zona"],
    w: [["That it came through your zone, and only yours", "Qu'elle vient de ta zone, et seulement de la tienne", "Que viene de tu zona, y solo de la tuya"], ["The visitor's identity", "L'identité du visiteur", "La identidad del visitante"], ["Nothing: global certificates are not checked", "Rien : les certificats globaux ne sont pas vérifiés", "Nada: los certificados globales no se comprueban"]],
    e: [
      "Authenticated Origin Pulls is mTLS: Cloudflare presents a client certificate, and the origin refuses connections without it. The global certificate is shared by all Cloudflare customers; a zone-level or per-hostname certificate of your own proves the request went through your zone and its rules.",
      "Authenticated Origin Pulls, c'est du mTLS : Cloudflare présente un certificat client, et l'origine refuse les connexions sans lui. Le certificat global est commun à tous les clients de Cloudflare ; un certificat à toi, par zone ou par nom d'hôte, prouve que la requête est passée par ta zone et ses règles.",
      "Authenticated Origin Pulls es mTLS: Cloudflare presenta un certificado de cliente y el origen rechaza las conexiones sin él. El certificado global lo comparten todos los clientes de Cloudflare; uno propio, por zona o por nombre de host, prueba que la petición pasó por tu zona y sus reglas.",
    ],
  },
  {
    id: "cf-tls-10",
    q: ["Visitors get error 526. What does it mean?", "Les visiteurs ont l'erreur 526. Qu'est-ce que cela veut dire ?", "Los visitantes reciben el error 526. ¿Qué significa?"],
    a: ["With Full (strict), Cloudflare could not validate the origin's certificate (expired, self-signed, wrong name)", "En Full (strict), Cloudflare n'a pas pu valider le certificat de l'origine (expiré, auto-signé, mauvais nom)", "Con Full (strict), Cloudflare no pudo validar el certificado del origen (caducado, autofirmado, nombre incorrecto)"],
    w: [["The visitor's browser does not support TLS 1.2", "Le navigateur du visiteur ne gère pas TLS 1.2", "El navegador del visitante no admite TLS 1.2"], ["The origin redirected too many times", "L'origine a redirigé trop de fois", "El origen redirigió demasiadas veces"], ["The edge certificate has expired", "Le certificat de bordure a expiré", "El certificado de borde ha caducado"]],
    e: [
      "Renew or replace the origin's certificate (an Origin CA certificate lasts up to 15 years). Switching to Full would hide the error by no longer checking, which is exactly the protection you want to keep.",
      "Renouvelle ou remplace le certificat de l'origine (un certificat Origin CA dure jusqu'à 15 ans). Passer en Full masquerait l'erreur en ne vérifiant plus, ce qui est justement la protection à garder.",
      "Renueva o sustituye el certificado del origen (uno de Origin CA dura hasta 15 años). Pasar a Full ocultaría el error dejando de comprobar, que es justo la protección que quieres conservar.",
    ],
  },
  {
    id: "cf-tls-11",
    q: ["A zone uses Automatic SSL/TLS. Can it move the zone to a weaker mode?", "Une zone utilise Automatic SSL/TLS. Peut-il passer la zone à un mode plus faible ?", "Una zona usa Automatic SSL/TLS. ¿Puede pasar la zona a un modo más débil?"],
    a: ["No: it picks the most secure mode the origin supports, and never lowers it", "Non : il choisit le mode le plus sûr que l'origine accepte, et ne l'abaisse jamais", "No: elige el modo más seguro que admite el origen y nunca lo rebaja"],
    w: [["Yes, to Flexible whenever the origin is slow", "Oui, vers Flexible dès que l'origine est lente", "Sí, a Flexible cuando el origen va lento"], ["Yes, every night, to test the origin", "Oui, chaque nuit, pour tester l'origine", "Sí, cada noche, para probar el origen"], ["It only works for Enterprise zones", "Il ne marche que pour les zones Enterprise", "Solo funciona para zonas Enterprise"]],
    e: [
      "Automatic SSL/TLS, the default for new zones, probes the origin and raises the mode when it can, rolling the change out gradually. You can still pick a mode by hand, and Configuration Rules can set one per path.",
      "Automatic SSL/TLS, par défaut sur les nouvelles zones, sonde l'origine et relève le mode quand c'est possible, en déployant le changement progressivement. On peut toujours choisir un mode à la main, et les Configuration Rules peuvent en fixer un par chemin.",
      "Automatic SSL/TLS, por defecto en las zonas nuevas, sondea el origen y sube el modo cuando puede, aplicando el cambio de forma gradual. Se puede seguir eligiendo el modo a mano, y las Configuration Rules pueden fijar uno por ruta.",
    ],
  },
  {
    id: "cf-tls-12",
    q: ["Which makes an origin unreachable except through Cloudflare, with no open port at all?", "Qu'est-ce qui rend une origine injoignable autrement que par Cloudflare, sans aucun port ouvert ?", "¿Qué hace que un origen sea inalcanzable salvo a través de Cloudflare, sin ningún puerto abierto?"],
    a: ["Cloudflare Tunnel: `cloudflared` only connects outbound", "Cloudflare Tunnel : `cloudflared` ne se connecte qu'en sortie", "Cloudflare Tunnel: `cloudflared` solo se conecta hacia fuera"],
    w: [["Allowing only Cloudflare's IP ranges on port 443", "N'autoriser que les plages d'IP de Cloudflare sur le port 443", "Permitir solo los rangos de IP de Cloudflare en el puerto 443"], ["Full (strict) with an Origin CA certificate", "Full (strict) avec un certificat Origin CA", "Full (strict) con un certificado Origin CA"], ["Hiding the record behind the orange cloud", "Cacher l'enregistrement derrière le nuage orange", "Ocultar el registro detrás de la nube naranja"]],
    e: [
      "Firewalling to Cloudflare's ranges still leaves port 443 open, and any Cloudflare customer's traffic comes from those ranges. Full (strict) authenticates the origin to Cloudflare, not the other way round. With a Tunnel there is nothing to scan or reach.",
      "Filtrer sur les plages de Cloudflare laisse le port 443 ouvert, et le trafic de n'importe quel client Cloudflare vient de ces plages. Full (strict) authentifie l'origine auprès de Cloudflare, pas l'inverse. Avec un Tunnel, il n'y a rien à scanner ni à joindre.",
      "Filtrar por los rangos de Cloudflare deja abierto el puerto 443, y el tráfico de cualquier cliente de Cloudflare sale de esos rangos. Full (strict) autentica el origen ante Cloudflare, no al revés. Con un Tunnel no hay nada que escanear ni que alcanzar.",
    ],
  },
];

const cacheTiers: CfQuestion[] = [
  {
    id: "cf-cache-09",
    q: ["What does Tiered Cache change?", "Que change le Tiered Cache ?", "¿Qué cambia Tiered Cache?"],
    a: ["A data center that misses asks an upper-tier data center before the origin, so few locations ever contact the origin", "Un centre de données qui rate demande à un centre de niveau supérieur avant l'origine : peu de sites contactent jamais l'origine", "Un centro de datos que falla pregunta a uno de nivel superior antes que al origen, así que pocas ubicaciones contactan con el origen"],
    w: [["It stores the cache on your origin's disk", "Il stocke le cache sur le disque de ton origine", "Guarda la caché en el disco de tu origen"], ["It caches HTML by default", "Il met le HTML en cache par défaut", "Guarda HTML en caché por defecto"], ["It keeps objects forever", "Il garde les objets pour toujours", "Guarda los objetos para siempre"]],
    e: [
      "Smart Tiered Cache, free on every plan, picks the upper tier closest to your origin from latency measurements. It raises the hit ratio and reduces origin load. Generic, regional and custom topologies are Enterprise options.",
      "Le Smart Tiered Cache, gratuit sur tous les plans, choisit le niveau supérieur le plus proche de ton origine d'après des mesures de latence. Il relève le taux de succès et allège l'origine. Les topologies générique, régionale et personnalisée sont des options Enterprise.",
      "Smart Tiered Cache, gratis en todos los planes, elige el nivel superior más cercano a tu origen según mediciones de latencia. Sube la tasa de aciertos y descarga el origen. Las topologías genérica, regional y personalizada son opciones de Enterprise.",
    ],
  },
  {
    id: "cf-cache-10",
    q: ["Which objects can Cache Reserve keep?", "Quels objets Cache Reserve peut-il garder ?", "¿Qué objetos puede guardar Cache Reserve?"],
    a: ["Cacheable ones with a TTL of at least 10 hours and a `Content-Length` header", "Ceux qui sont cachables, avec un TTL d'au moins 10 heures et un en-tête `Content-Length`", "Los que se pueden guardar en caché, con un TTL de al menos 10 horas y una cabecera `Content-Length`"],
    w: [["Any response, cacheable or not", "N'importe quelle réponse, cachable ou non", "Cualquier respuesta, apta o no"], ["Only HTML pages", "Seulement les pages HTML", "Solo las páginas HTML"], ["Only objects under 1 MB", "Seulement les objets de moins de 1 Mo", "Solo objetos de menos de 1 MB"]],
    e: [
      "Cache Reserve is a persistent cache built on R2, above the upper tier: objects stay 30 days after their last request. It costs USD 0.015 per GB-month plus operations; pair it with Tiered Cache, otherwise every data center writes to it and operations add up.",
      "Cache Reserve est un cache persistant bâti sur R2, au-dessus du niveau supérieur : les objets y restent 30 jours après leur dernière demande. Il coûte 0,015 USD par Go-mois plus les opérations ; associe-le au Tiered Cache, sinon chaque centre y écrit et les opérations s'accumulent.",
      "Cache Reserve es una caché persistente basada en R2, por encima del nivel superior: los objetos se quedan 30 días tras su última petición. Cuesta 0,015 USD por GB-mes más las operaciones; combínalo con Tiered Cache, o cada centro escribirá en ella y las operaciones se acumularán.",
    ],
  },
  {
    id: "cf-cache-11",
    q: ["A Worker calls `caches.default.put()`. Where is the object stored?", "Un Worker appelle `caches.default.put()`. Où l'objet est-il stocké ?", "Un Worker llama a `caches.default.put()`. ¿Dónde se guarda el objeto?"],
    a: ["Only in the data center where the Worker ran; the Cache API does not use Tiered Cache", "Seulement dans le centre de données où le Worker s'est exécuté ; la Cache API n'utilise pas le Tiered Cache", "Solo en el centro de datos donde se ejecutó el Worker; la Cache API no usa Tiered Cache"],
    w: [["In every data center at once", "Dans tous les centres de données à la fois", "En todos los centros de datos a la vez"], ["In the zone's upper tier", "Dans le niveau supérieur de la zone", "En el nivel superior de la zona"], ["In KV, replicated globally", "Dans KV, répliqué partout", "En KV, replicado en todas partes"]],
    e: [
      "The Cache API is local, which suits per-location memoisation. To use the whole cache hierarchy, let `fetch()` go through the cache: a Worker's subrequests read through the zone's cache, with Cache Rules and tiers.",
      "La Cache API est locale, ce qui convient à une mémorisation par site. Pour profiter de toute la hiérarchie du cache, laisse `fetch()` passer par le cache : les sous-requêtes d'un Worker lisent le cache de la zone, avec ses Cache Rules et ses niveaux.",
      "La Cache API es local, lo que sirve para memorizar por ubicación. Para usar toda la jerarquía de caché, deja que `fetch()` pase por la caché: las subpeticiones de un Worker leen la caché de la zona, con sus Cache Rules y sus niveles.",
    ],
  },
  {
    id: "cf-cache-12",
    q: ["A Worker runs on a route of a zone with Cache Rules. Where is it in the request's path?", "Un Worker s'exécute sur une route d'une zone avec des Cache Rules. Où se trouve-t-il sur le chemin de la requête ?", "Un Worker se ejecuta en una ruta de una zona con Cache Rules. ¿Dónde está en el camino de la petición?"],
    a: ["In front of the cache: it runs on every request, and its `fetch()` subrequests go through the cache", "Devant le cache : il s'exécute à chaque requête, et ses sous-requêtes `fetch()` passent par le cache", "Delante de la caché: se ejecuta en cada petición, y sus subpeticiones `fetch()` pasan por la caché"],
    w: [["Behind the cache: it runs only on misses", "Derrière le cache : il ne s'exécute qu'en cas d'échec du cache", "Detrás de la caché: solo se ejecuta en los fallos"], ["Instead of the cache: a route turns caching off", "À la place du cache : une route désactive le cache", "En lugar de la caché: una ruta desactiva la caché"], ["After the origin, on the response only", "Après l'origine, sur la réponse seulement", "Tras el origen, solo sobre la respuesta"]],
    e: [
      "A Worker is invoked, and billed, even when the content is cached. If it calls `fetch(request)`, that subrequest is answered from cache when possible, and the Worker can still change the response afterwards.",
      "Un Worker est invoqué, et facturé, même si le contenu est en cache. S'il appelle `fetch(request)`, cette sous-requête est servie depuis le cache si possible, et le Worker peut encore modifier la réponse ensuite.",
      "Un Worker se invoca, y se factura, aunque el contenido esté en caché. Si llama a `fetch(request)`, esa subpetición se sirve desde la caché cuando es posible, y el Worker aún puede cambiar la respuesta después.",
    ],
  },
];

const botsApi: CfQuestion[] = [
  {
    id: "cf-sec-09",
    q: ["Bot Management gives each request a bot score. What does it mean?", "Bot Management donne à chaque requête un score de bot. Que signifie-t-il ?", "Bot Management da a cada petición una puntuación de bot. ¿Qué significa?"],
    a: ["From 1, certainly automated, to 99, certainly human; rules can act on it", "De 1, certainement automatisée, à 99, certainement humaine ; les règles peuvent s'en servir", "De 1, seguro que automática, a 99, seguro que humana; las reglas pueden usarla"],
    w: [["From 1, certainly human, to 99, certainly a bot", "De 1, certainement humaine, à 99, certainement un bot", "De 1, seguro que humana, a 99, seguro que un bot"], ["The number of requests the IP made today", "Le nombre de requêtes de l'IP aujourd'hui", "El número de peticiones de la IP hoy"], ["A yes or no, with no scale", "Un oui ou non, sans échelle", "Un sí o no, sin escala"]],
    e: [
      "Bot Management is an Enterprise add-on: `cf.bot_management.score` can be used in custom rules and rate limiting, per endpoint. Verified bots (search engines, monitoring) are flagged separately, so rules can let them through. Free has Bot Fight Mode; Pro and Business, Super Bot Fight Mode.",
      "Bot Management est une option Enterprise : `cf.bot_management.score` s'utilise dans les règles personnalisées et la limitation de débit, par point d'accès. Les bots vérifiés (moteurs de recherche, surveillance) sont signalés à part, pour que les règles les laissent passer. Free a Bot Fight Mode ; Pro et Business, Super Bot Fight Mode.",
      "Bot Management es un complemento de Enterprise: `cf.bot_management.score` se usa en reglas personalizadas y limitación de velocidad, por punto de acceso. Los bots verificados (buscadores, monitorización) se marcan aparte, para que las reglas los dejen pasar. Free tiene Bot Fight Mode; Pro y Business, Super Bot Fight Mode.",
    ],
  },
  {
    id: "cf-sec-10",
    q: ["The OWASP Core Ruleset is set to High sensitivity. When is the request blocked?", "Le Cloudflare OWASP Core Ruleset est réglé sur une sensibilité High. Quand la requête est-elle bloquée ?", "El Cloudflare OWASP Core Ruleset está en sensibilidad High. ¿Cuándo se bloquea la petición?"],
    a: ["When the scores of the matching rules add up to 25 or more", "Quand les scores des règles correspondantes atteignent 25 ou plus", "Cuando las puntuaciones de las reglas que coinciden suman 25 o más"],
    w: [["As soon as any one rule matches", "Dès qu'une seule règle correspond", "En cuanto coincide una sola regla"], ["When the total reaches 60", "Quand le total atteint 60", "Cuando el total llega a 60"], ["When the paranoia level reaches 4", "Quand le niveau de paranoïa atteint 4", "Cuando el nivel de paranoia llega a 4"]],
    e: [
      "Each matching OWASP rule adds points; the total is compared with the threshold: 60 for Low, 40 for Medium (the default), 25 for High. The paranoia level (PL1 to PL4) decides which rules run; higher levels catch more and raise false positives.",
      "Chaque règle OWASP qui correspond ajoute des points ; le total est comparé au seuil : 60 pour Low, 40 pour Medium (par défaut), 25 pour High. Le niveau de paranoïa (PL1 à PL4) décide quelles règles s'exécutent ; les niveaux élevés attrapent davantage et augmentent les faux positifs.",
      "Cada regla OWASP que coincide suma puntos; el total se compara con el umbral: 60 para Low, 40 para Medium (por defecto), 25 para High. El nivel de paranoia (PL1 a PL4) decide qué reglas se ejecutan; los niveles altos atrapan más y aumentan los falsos positivos.",
    ],
  },
  {
    id: "cf-sec-11",
    q: ["What does Super Bot Fight Mode offer over the free Bot Fight Mode?", "Qu'apporte Super Bot Fight Mode par rapport au Bot Fight Mode gratuit ?", "¿Qué aporta Super Bot Fight Mode frente al Bot Fight Mode gratuito?"],
    a: ["An action per category (definitely automated, likely automated, verified bots) and exceptions through custom rules", "Une action par catégorie (certainement automatisé, probablement automatisé, bots vérifiés) et des exceptions par les règles personnalisées", "Una acción por categoría (seguro automático, probablemente automático, bots verificados) y excepciones mediante reglas personalizadas"],
    w: [["A bot score per request, usable in rules", "Un score de bot par requête, utilisable dans les règles", "Una puntuación de bot por petición, usable en reglas"], ["Nothing: it is the same feature renamed", "Rien : c'est la même fonction renommée", "Nada: es la misma función con otro nombre"], ["Unlimited CAPTCHAs", "Des CAPTCHA illimités", "CAPTCHA ilimitados"]],
    e: [
      "Bot Fight Mode is one switch for the whole zone. Super Bot Fight Mode (Pro, Business) lets you choose per category and protect or skip static resources. Per-request scores and JA3/JA4 fingerprints are Bot Management, an Enterprise add-on.",
      "Bot Fight Mode est un interrupteur pour toute la zone. Super Bot Fight Mode (Pro, Business) laisse choisir par catégorie et protéger ou non les ressources statiques. Les scores par requête et les empreintes JA3/JA4 relèvent de Bot Management, une option Enterprise.",
      "Bot Fight Mode es un interruptor para toda la zona. Super Bot Fight Mode (Pro, Business) deja elegir por categoría y proteger o no los recursos estáticos. Las puntuaciones por petición y las huellas JA3/JA4 son de Bot Management, un complemento de Enterprise.",
    ],
  },
  {
    id: "cf-sec-12",
    q: ["What does API Shield's schema validation do?", "Que fait la validation de schéma d'API Shield ?", "¿Qué hace la validación de esquema de API Shield?"],
    a: ["It checks API requests against your OpenAPI schema and blocks those that do not conform", "Elle vérifie les requêtes d'API par rapport à ton schéma OpenAPI et bloque celles qui ne s'y conforment pas", "Comprueba las peticiones de API contra tu esquema OpenAPI y bloquea las que no lo cumplen"],
    w: [["It generates the OpenAPI schema from your code", "Elle génère le schéma OpenAPI à partir de ton code", "Genera el esquema OpenAPI a partir de tu código"], ["It validates the responses' JSON for the browser", "Elle valide le JSON des réponses pour le navigateur", "Valida el JSON de las respuestas para el navegador"], ["It encrypts the API's payloads", "Elle chiffre les contenus de l'API", "Cifra los contenidos de la API"]],
    e: [
      "Unknown endpoints, wrong types and unexpected fields are refused at the edge, before they reach the API. API Shield also discovers endpoints from traffic, validates JWTs, enforces mTLS for clients such as mobile apps, and detects calls out of the expected sequence.",
      "Points d'accès inconnus, types erronés et champs inattendus sont refusés en bordure, avant d'atteindre l'API. API Shield découvre aussi les points d'accès à partir du trafic, valide les JWT, impose le mTLS aux clients comme les applications mobiles, et détecte les appels hors de la séquence attendue.",
      "Los puntos de acceso desconocidos, los tipos erróneos y los campos inesperados se rechazan en el borde, antes de llegar a la API. API Shield también descubre puntos de acceso a partir del tráfico, valida JWT, impone mTLS a clientes como las apps móviles y detecta llamadas fuera de la secuencia esperada.",
    ],
  },
];

const workersRuntime: CfQuestion[] = [
  {
    id: "cf-wk-09",
    q: ["A Worker keeps the current user's ID in a module-level variable. What can go wrong?", "Un Worker garde l'identifiant de l'utilisateur courant dans une variable de module. Que peut-il arriver ?", "Un Worker guarda el ID del usuario actual en una variable de módulo. ¿Qué puede salir mal?"],
    a: ["An isolate serves many requests, so another user's request can read or overwrite it", "Un isolat sert de nombreuses requêtes : la requête d'un autre utilisateur peut la lire ou l'écraser", "Un aislado atiende muchas peticiones, así que la petición de otro usuario puede leerla o sobrescribirla"],
    w: [["Nothing: each request gets a fresh isolate", "Rien : chaque requête a un isolat neuf", "Nada: cada petición recibe un aislado nuevo"], ["The variable is lost after 10 ms", "La variable est perdue après 10 ms", "La variable se pierde tras 10 ms"], ["The Worker fails to deploy", "Le Worker ne se déploie pas", "El Worker no se despliega"]],
    e: [
      "Isolates are reused across requests, and concurrent requests can interleave at every `await`. Keep per-request data in local variables and arguments; keep shared state in storage. Module-level values are fine for caches of immutable data.",
      "Les isolats sont réutilisés d'une requête à l'autre, et des requêtes simultanées peuvent s'entremêler à chaque `await`. Garde les données d'une requête dans des variables locales et des arguments ; l'état partagé, dans un stockage. Les valeurs de module conviennent aux caches de données immuables.",
      "Los aislados se reutilizan entre peticiones, y las peticiones simultáneas pueden intercalarse en cada `await`. Guarda los datos de una petición en variables locales y argumentos; el estado compartido, en un almacenamiento. Los valores de módulo sirven para cachés de datos inmutables.",
    ],
  },
  {
    id: "cf-wk-10",
    q: ["A Worker waits 2 seconds for a slow API and uses 3 ms of CPU. What counts against its limit and its bill?", "Un Worker attend 2 secondes une API lente et utilise 3 ms de CPU. Qu'est-ce qui compte pour sa limite et sa facture ?", "Un Worker espera 2 segundos a una API lenta y usa 3 ms de CPU. ¿Qué cuenta para su límite y su factura?"],
    a: ["The 3 ms of CPU; time spent waiting is neither limited nor billed", "Les 3 ms de CPU ; le temps d'attente n'est ni limité ni facturé", "Los 3 ms de CPU; el tiempo de espera no se limita ni se factura"],
    w: [["The 2 seconds of wall time", "Les 2 secondes de temps réel", "Los 2 segundos de tiempo real"], ["Both, added", "Les deux, additionnés", "Los dos, sumados"], ["Neither: only requests are billed", "Ni l'un ni l'autre : seules les requêtes sont facturées", "Ninguno: solo se facturan las peticiones"]],
    e: [
      "Workers bill requests and CPU time; duration is not charged. That makes I/O-heavy Workers cheap. Set `limits.cpu_ms` on a Worker so a bug that loops cannot run up the bill.",
      "Workers facture les requêtes et le temps CPU ; la durée n'est pas comptée. Les Workers qui attendent beaucoup d'E/S sont donc bon marché. Fixe `limits.cpu_ms` sur un Worker pour qu'un bug qui boucle ne fasse pas grimper la facture.",
      "Workers factura peticiones y tiempo de CPU; la duración no se cobra. Eso abarata los Workers que esperan mucho a la E/S. Fija `limits.cpu_ms` en un Worker para que un error que entra en bucle no dispare la factura.",
    ],
  },
  {
    id: "cf-wk-11",
    q: ["When does Smart Placement help?", "Quand Smart Placement aide-t-il ?", "¿Cuándo ayuda Smart Placement?"],
    a: ["When a Worker makes several round trips to a backend in one region: it runs the Worker near that backend", "Quand un Worker fait plusieurs allers-retours vers un backend dans une région : il exécute le Worker près de ce backend", "Cuando un Worker hace varios viajes de ida y vuelta a un backend en una región: ejecuta el Worker cerca de ese backend"],
    w: [["When a Worker serves only static assets", "Quand un Worker ne sert que des fichiers statiques", "Cuando un Worker solo sirve archivos estáticos"], ["When visitors are spread all over the world, with no backend", "Quand les visiteurs sont répartis dans le monde, sans backend", "Cuando los visitantes están por todo el mundo, sin backend"], ["When the Worker exceeds 128 MB of memory", "Quand le Worker dépasse 128 Mo de mémoire", "Cuando el Worker supera 128 MB de memoria"]],
    e: [
      "Five queries to a database in Frankfurt from a Worker in Sydney cost five long round trips; run near Frankfurt, they cost one long trip for the visitor's request and five short ones. Without such a backend, the default (where the request arrives) is best.",
      "Cinq requêtes vers une base à Francfort depuis un Worker à Sydney coûtent cinq longs allers-retours ; exécutées près de Francfort, elles coûtent un long trajet pour la requête du visiteur et cinq courts. Sans un tel backend, le comportement par défaut (là où arrive la requête) est le meilleur.",
      "Cinco consultas a una base en Fráncfort desde un Worker en Sídney cuestan cinco viajes largos; ejecutadas cerca de Fráncfort, cuestan un viaje largo para la petición del visitante y cinco cortos. Sin un backend así, lo mejor es lo predeterminado (donde llega la petición).",
    ],
  },
  {
    id: "cf-wk-12",
    q: ["A Worker has an `assets` directory. When is its code run for `/logo.png`, a file in that directory?", "Un Worker a un répertoire `assets`. Quand son code s'exécute-t-il pour `/logo.png`, un fichier de ce répertoire ?", "Un Worker tiene un directorio `assets`. ¿Cuándo se ejecuta su código para `/logo.png`, un archivo de ese directorio?"],
    a: ["Never by default: matching static assets are served first, free; `run_worker_first` changes that", "Jamais par défaut : les fichiers statiques correspondants sont servis d'abord, gratuitement ; `run_worker_first` change cela", "Nunca por defecto: los archivos estáticos que coinciden se sirven primero, gratis; `run_worker_first` lo cambia"],
    w: [["Always, before the file is served", "Toujours, avant de servir le fichier", "Siempre, antes de servir el archivo"], ["Only on the first request, to cache it", "Seulement à la première requête, pour le mettre en cache", "Solo en la primera petición, para guardarlo en caché"], ["Only on the Free plan", "Seulement avec le plan Free", "Solo con el plan Free"]],
    e: [
      "Requests for static assets are free and unlimited. Your code handles what no asset matches (an API, server rendering), or everything when `run_worker_first` is set, for example to check a session before serving files. Cloudflare recommends Workers with static assets over Pages for new projects.",
      "Les requêtes de fichiers statiques sont gratuites et illimitées. Ton code traite ce qu'aucun fichier ne couvre (une API, le rendu serveur), ou tout quand `run_worker_first` est posé, par exemple pour vérifier une session avant de servir des fichiers. Cloudflare recommande Workers avec fichiers statiques plutôt que Pages pour les nouveaux projets.",
      "Las peticiones de archivos estáticos son gratis e ilimitadas. Tu código atiende lo que ningún archivo cubre (una API, el renderizado en servidor), o todo cuando se fija `run_worker_first`, por ejemplo para comprobar una sesión antes de servir archivos. Cloudflare recomienda Workers con archivos estáticos en lugar de Pages para proyectos nuevos.",
    ],
  },
];

const durableObjects: CfQuestion[] = [
  {
    id: "cf-st-09",
    q: ["Two requests call `increment()` on the same Durable Object at the same moment. What happens?", "Deux requêtes appellent `increment()` sur le même Durable Object au même moment. Que se passe-t-il ?", "Dos peticiones llaman a `increment()` en el mismo Durable Object en el mismo momento. ¿Qué pasa?"],
    a: ["The object handles them one after the other: no lost update", "L'objet les traite l'une après l'autre : aucune mise à jour perdue", "El objeto las atiende una tras otra: no se pierde ninguna actualización"],
    w: [["They run in parallel and one update may be lost", "Elles s'exécutent en parallèle et une mise à jour peut se perdre", "Se ejecutan en paralelo y puede perderse una actualización"], ["The second one fails with a conflict error", "La seconde échoue avec une erreur de conflit", "La segunda falla con un error de conflicto"], ["Two copies of the object are created", "Deux copies de l'objet sont créées", "Se crean dos copias del objeto"]],
    e: [
      "A Durable Object instance is single-threaded and lives in one place at a time; its storage is transactional. That is why it is the tool for counters, rate limiters and anything that must not race.",
      "Une instance de Durable Object est monothread et vit en un seul endroit à la fois ; son stockage est transactionnel. C'est pourquoi c'est l'outil des compteurs, limiteurs de débit et de tout ce qui ne doit pas se marcher dessus.",
      "Una instancia de Durable Object es de un solo hilo y vive en un único lugar a la vez; su almacenamiento es transaccional. Por eso es la herramienta para contadores, limitadores de velocidad y todo lo que no debe pisarse.",
    ],
  },
  {
    id: "cf-st-10",
    q: ["A chat app puts every room in one Durable Object called `global`. What is wrong?", "Une application de discussion met tous les salons dans un seul Durable Object appelé `global`. Qu'est-ce qui ne va pas ?", "Una app de chat pone todas las salas en un único Durable Object llamado `global`. ¿Qué falla?"],
    a: ["One single-threaded object becomes the bottleneck; use one object per room", "Un seul objet monothread devient le goulet d'étranglement ; il faut un objet par salon", "Un único objeto de un solo hilo se convierte en el cuello de botella; usa un objeto por sala"],
    w: [["Nothing: one object scales automatically", "Rien : un objet monte en charge tout seul", "Nada: un objeto escala solo"], ["Durable Object names cannot be words", "Les noms de Durable Object ne peuvent pas être des mots", "Los nombres de Durable Object no pueden ser palabras"], ["Rooms must be stored in KV instead", "Les salons doivent plutôt aller dans KV", "Las salas deben ir en KV"]],
    e: [
      "Design one object per unit of coordination: a room, a document, a user, a game. `idFromName(\"room:lobby\")` addresses it from any Worker. Many small objects spread over the network scale; one global object does not.",
      "Conçois un objet par unité de coordination : un salon, un document, un utilisateur, une partie. `idFromName(\"room:lobby\")` l'adresse depuis n'importe quel Worker. Beaucoup de petits objets répartis sur le réseau montent en charge ; un seul objet global, non.",
      "Diseña un objeto por unidad de coordinación: una sala, un documento, un usuario, una partida. `idFromName(\"room:lobby\")` lo direcciona desde cualquier Worker. Muchos objetos pequeños repartidos por la red escalan; un único objeto global, no.",
    ],
  },
  {
    id: "cf-st-11",
    q: ["How does a Durable Object run work later, say in an hour, without a request?", "Comment un Durable Object fait-il un travail plus tard, disons dans une heure, sans requête ?", "¿Cómo hace un Durable Object un trabajo más tarde, digamos en una hora, sin petición?"],
    a: ["With an alarm: `setAlarm()` wakes the object, which runs its `alarm()` handler", "Avec une alarme : `setAlarm()` réveille l'objet, qui exécute son gestionnaire `alarm()`", "Con una alarma: `setAlarm()` despierta al objeto, que ejecuta su manejador `alarm()`"],
    w: [["With `setTimeout()` of one hour", "Avec un `setTimeout()` d'une heure", "Con un `setTimeout()` de una hora"], ["It cannot: an object only runs on requests", "Il ne peut pas : un objet ne s'exécute que sur requête", "No puede: un objeto solo se ejecuta con peticiones"], ["With a KV key that expires", "Avec une clé KV qui expire", "Con una clave KV que caduca"]],
    e: [
      "An object can be evicted from memory when idle, so a timer would be lost; an alarm is stored and fires even after eviction. The Agents SDK builds its `schedule()` on a single alarm per agent.",
      "Un objet peut être retiré de la mémoire quand il est inactif : un minuteur serait perdu ; une alarme est enregistrée et se déclenche même après ce retrait. L'Agents SDK construit son `schedule()` sur une seule alarme par agent.",
      "Un objeto puede salir de la memoria cuando está inactivo, así que un temporizador se perdería; una alarma se guarda y salta incluso después. El Agents SDK construye su `schedule()` sobre una única alarma por agente.",
    ],
  },
  {
    id: "cf-st-12",
    q: ["Why use the WebSocket Hibernation API in a Durable Object?", "Pourquoi utiliser l'API WebSocket Hibernation dans un Durable Object ?", "¿Por qué usar la API WebSocket Hibernation en un Durable Object?"],
    a: ["The object can leave memory while connections stay open, so idle sockets cost almost nothing", "L'objet peut quitter la mémoire pendant que les connexions restent ouvertes : des sockets inactifs ne coûtent presque rien", "El objeto puede salir de la memoria mientras las conexiones siguen abiertas, así que los sockets inactivos casi no cuestan"],
    w: [["It encrypts WebSocket messages", "Elle chiffre les messages WebSocket", "Cifra los mensajes WebSocket"], ["It lets a Worker accept WebSockets without a Durable Object", "Elle permet à un Worker d'accepter des WebSockets sans Durable Object", "Permite a un Worker aceptar WebSockets sin Durable Object"], ["It keeps the object in memory forever", "Elle garde l'objet en mémoire pour toujours", "Mantiene el objeto en memoria para siempre"]],
    e: [
      "Durable Objects are billed for duration while in memory. With hibernation, Cloudflare holds the connections; a message wakes the object and calls its handler. A room with thousands of quiet clients becomes cheap.",
      "Les Durable Objects sont facturés à la durée tant qu'ils sont en mémoire. Avec l'hibernation, Cloudflare garde les connexions ; un message réveille l'objet et appelle son gestionnaire. Un salon de milliers de clients silencieux devient bon marché.",
      "Los Durable Objects se facturan por duración mientras están en memoria. Con la hibernación, Cloudflare mantiene las conexiones; un mensaje despierta al objeto y llama a su manejador. Una sala con miles de clientes callados sale barata.",
    ],
  },
];

const gateway: CfQuestion[] = [
  {
    id: "cf-zt-09",
    q: ["In which order does Gateway apply its policy types?", "Dans quel ordre Gateway applique-t-il ses types de stratégies ?", "¿En qué orden aplica Gateway sus tipos de políticas?"],
    a: ["DNS, then network, then HTTP", "DNS, puis réseau, puis HTTP", "DNS, luego red, luego HTTP"],
    w: [["HTTP, then network, then DNS", "HTTP, puis réseau, puis DNS", "HTTP, luego red, luego DNS"], ["Network, then DNS, then HTTP", "Réseau, puis DNS, puis HTTP", "Red, luego DNS, luego HTTP"], ["All at once; the strictest wins", "Toutes à la fois ; la plus stricte l'emporte", "Todas a la vez; gana la más estricta"]],
    e: [
      "DNS policies act at resolution (before, then after it), egress policies next, then network policies on IPs, ports and SNI, then HTTP policies on URLs and content. Within one type, the first matching policy in order of precedence decides. Since July 2025 network policies are evaluated before HTTP policies.",
      "Les stratégies DNS agissent à la résolution (avant, puis après), ensuite les stratégies de sortie, puis les stratégies réseau sur IP, ports et SNI, puis les stratégies HTTP sur les URL et le contenu. Dans un même type, la première stratégie qui correspond dans l'ordre de priorité décide. Depuis juillet 2025, les stratégies réseau sont évaluées avant les HTTP.",
      "Las políticas DNS actúan en la resolución (antes y después), luego las de salida, luego las de red sobre IP, puertos y SNI, y luego las HTTP sobre URL y contenido. Dentro de un tipo decide la primera política que coincide en orden de precedencia. Desde julio de 2025, las políticas de red se evalúan antes que las HTTP.",
    ],
  },
  {
    id: "cf-zt-10",
    q: ["What do Gateway HTTP policies need to inspect HTTPS traffic?", "De quoi les stratégies HTTP de Gateway ont-elles besoin pour inspecter le trafic HTTPS ?", "¿Qué necesitan las políticas HTTP de Gateway para inspeccionar el tráfico HTTPS?"],
    a: ["TLS decryption turned on, and Cloudflare's root certificate installed on the devices", "Le déchiffrement TLS activé, et le certificat racine de Cloudflare installé sur les appareils", "El descifrado TLS activado y el certificado raíz de Cloudflare instalado en los dispositivos"],
    w: [["Nothing: HTTPS URLs are visible anyway", "Rien : les URL HTTPS sont visibles de toute façon", "Nada: las URL HTTPS se ven de todos modos"], ["The site owners' private keys", "Les clés privées des propriétaires des sites", "Las claves privadas de los dueños de los sitios"], ["The client in Posture only mode", "Le client en mode Posture only", "El cliente en modo Posture only"]],
    e: [
      "Without decryption, Gateway sees only the hostname (SNI), not paths or content. With it, it can filter URLs, scan files and apply data loss prevention. Do Not Inspect policies exempt banks, health sites and apps that pin their certificates.",
      "Sans déchiffrement, Gateway ne voit que le nom d'hôte (SNI), ni les chemins ni le contenu. Avec, il peut filtrer les URL, analyser les fichiers et appliquer la prévention des fuites de données. Les stratégies Do Not Inspect exemptent banques, sites de santé et applications qui épinglent leurs certificats.",
      "Sin descifrado, Gateway solo ve el nombre de host (SNI), no las rutas ni el contenido. Con él puede filtrar URL, analizar archivos y aplicar prevención de fugas de datos. Las políticas Do Not Inspect eximen a bancos, sitios de salud y apps que fijan sus certificados.",
    ],
  },
  {
    id: "cf-zt-11",
    q: ["A banking app on managed laptops breaks once HTTPS inspection is on. What is the usual fix?", "Une application bancaire sur les portables gérés ne marche plus depuis l'inspection HTTPS. Quelle est la correction habituelle ?", "Una app bancaria en los portátiles gestionados falla desde que se activó la inspección HTTPS. ¿Cuál es el arreglo habitual?"],
    a: ["A Do Not Inspect policy for its hostnames: the app pins its certificate", "Une stratégie Do Not Inspect pour ses noms d'hôte : l'application épingle son certificat", "Una política Do Not Inspect para sus nombres de host: la app fija su certificado"],
    w: [["Turn off Gateway for everyone", "Désactiver Gateway pour tout le monde", "Desactivar Gateway para todos"], ["Install the bank's root certificate", "Installer le certificat racine de la banque", "Instalar el certificado raíz del banco"], ["Allow the app with a DNS policy", "Autoriser l'application avec une stratégie DNS", "Permitir la app con una política DNS"]],
    e: [
      "An app that pins its certificate refuses Cloudflare's, since it expects its own. Do Not Inspect policies are evaluated first among HTTP policies, so the traffic passes encrypted end to end while the rest stays inspected.",
      "Une application qui épingle son certificat refuse celui de Cloudflare, puisqu'elle attend le sien. Les stratégies Do Not Inspect sont évaluées en premier parmi les HTTP : ce trafic passe chiffré de bout en bout, le reste restant inspecté.",
      "Una app que fija su certificado rechaza el de Cloudflare, porque espera el suyo. Las políticas Do Not Inspect se evalúan primero entre las HTTP, así que ese tráfico pasa cifrado de extremo a extremo y el resto sigue inspeccionado.",
    ],
  },
  {
    id: "cf-zt-12",
    q: ["How do enrolled laptops reach `10.20.0.0/16`, a private network behind a tunnel?", "Comment des portables inscrits atteignent-ils `10.20.0.0/16`, un réseau privé derrière un tunnel ?", "¿Cómo llegan los portátiles inscritos a `10.20.0.0/16`, una red privada detrás de un túnel?"],
    a: ["The tunnel routes the range, the client sends that traffic to Cloudflare, and Gateway network policies decide who reaches it", "Le tunnel route la plage, le client envoie ce trafic à Cloudflare, et les stratégies réseau de Gateway décident qui l'atteint", "El túnel enruta el rango, el cliente envía ese tráfico a Cloudflare y las políticas de red de Gateway deciden quién llega"],
    w: [["Each IP gets a public DNS record", "Chaque IP reçoit un enregistrement DNS public", "Cada IP recibe un registro DNS público"], ["Through a Bypass policy in Access", "Par une stratégie Bypass dans Access", "Mediante una política Bypass en Access"], ["The laptops must be on the office network", "Les portables doivent être sur le réseau du bureau", "Los portátiles deben estar en la red de la oficina"]],
    e: [
      "This replaces a VPN: `cloudflared` announces the private routes, devices running the Cloudflare One Client send matching traffic (check the split-tunnel settings), and network policies by group, port and device posture control access.",
      "Cela remplace un VPN : `cloudflared` annonce les routes privées, les appareils qui font tourner le Cloudflare One Client envoient le trafic correspondant (vérifie les réglages de split tunnel), et les stratégies réseau par groupe, port et état de l'appareil contrôlent l'accès.",
      "Esto sustituye a una VPN: `cloudflared` anuncia las rutas privadas, los dispositivos con el Cloudflare One Client envían el tráfico correspondiente (revisa los ajustes de split tunnel) y las políticas de red por grupo, puerto y estado del dispositivo controlan el acceso.",
    ],
  },
];

const rag: CfQuestion[] = [
  {
    id: "cf-ai-09",
    q: ["A Vectorize index was created with 1,024 dimensions; the embedding model gives 768. What happens on insert?", "Un index Vectorize a été créé avec 1 024 dimensions ; le modèle d'embedding en donne 768. Que se passe-t-il à l'insertion ?", "Un índice de Vectorize se creó con 1024 dimensiones; el modelo de embedding da 768. ¿Qué pasa al insertar?"],
    a: ["It fails: the vectors' dimension must equal the index's", "Elle échoue : la dimension des vecteurs doit égaler celle de l'index", "Falla: la dimensión de los vectores debe ser igual a la del índice"],
    w: [["The vectors are padded with zeros", "Les vecteurs sont complétés par des zéros", "Los vectores se rellenan con ceros"], ["The index adapts to 768", "L'index s'adapte à 768", "El índice se adapta a 768"], ["It works, with lower accuracy", "Ça marche, avec moins de précision", "Funciona, con menos precisión"]],
    e: [
      "An index's dimension and distance metric are fixed at creation: create it with the embedding model's dimension (768 for `bge-base-en-v1.5`). Up to 1,536 dimensions and 20 million vectors per index.",
      "La dimension et la métrique de distance d'un index sont fixées à sa création : crée-le avec la dimension du modèle d'embedding (768 pour `bge-base-en-v1.5`). Jusqu'à 1 536 dimensions et 20 millions de vecteurs par index.",
      "La dimensión y la métrica de distancia de un índice se fijan al crearlo: créalo con la dimensión del modelo de embedding (768 para `bge-base-en-v1.5`). Hasta 1536 dimensiones y 20 millones de vectores por índice.",
    ],
  },
  {
    id: "cf-ai-10",
    q: ["What does AI Search do that a hand-built Vectorize pipeline does not?", "Que fait AI Search qu'une chaîne Vectorize construite à la main ne fait pas ?", "¿Qué hace AI Search que una cadena de Vectorize hecha a mano no hace?"],
    a: ["It indexes your data continuously by itself, with hybrid semantic and keyword search, and can generate the answer", "Il indexe tes données en continu tout seul, avec une recherche hybride sémantique et par mots-clés, et peut générer la réponse", "Indexa tus datos de forma continua por sí solo, con búsqueda híbrida semántica y por palabras clave, y puede generar la respuesta"],
    w: [["It trains a model on your documents", "Il entraîne un modèle sur tes documents", "Entrena un modelo con tus documentos"], ["It stores vectors without any limit", "Il stocke des vecteurs sans aucune limite", "Guarda vectores sin ningún límite"], ["Nothing: it is another name for Vectorize", "Rien : c'est un autre nom de Vectorize", "Nada: es otro nombre de Vectorize"]],
    e: [
      "AI Search is managed RAG: chunking, embedding, re-indexing, hybrid search, metadata filters and OCR for scanned PDFs, queried through a binding, the REST API or MCP. Build with Vectorize when you need control over chunking, models or ranking.",
      "AI Search est un RAG géré : découpage, embedding, réindexation, recherche hybride, filtres de métadonnées et OCR des PDF scannés, interrogé par une liaison, l'API REST ou MCP. Construis avec Vectorize quand tu veux maîtriser le découpage, les modèles ou le classement.",
      "AI Search es RAG gestionado: troceado, embedding, reindexación, búsqueda híbrida, filtros por metadatos y OCR de PDF escaneados, consultado mediante un enlace, la API REST o MCP. Construye con Vectorize cuando quieras controlar el troceado, los modelos o la clasificación.",
    ],
  },
  {
    id: "cf-ai-11",
    q: ["You want Vectorize queries filtered by `lang`. What is needed?", "Tu veux filtrer les requêtes Vectorize par `lang`. Que faut-il ?", "Quieres filtrar las consultas de Vectorize por `lang`. ¿Qué hace falta?"],
    a: ["A metadata index on `lang` (up to 10 per index), created before inserting the vectors", "Un index de métadonnées sur `lang` (jusqu'à 10 par index), créé avant d'insérer les vecteurs", "Un índice de metadatos sobre `lang` (hasta 10 por índice), creado antes de insertar los vectores"],
    w: [["Nothing: every metadata field can be filtered", "Rien : chaque champ de métadonnées est filtrable", "Nada: todo campo de metadatos se puede filtrar"], ["A separate index per language", "Un index séparé par langue", "Un índice distinto por idioma"], ["A D1 table joined at query time", "Une table D1 jointe au moment de la requête", "Una tabla D1 unida al consultar"]],
    e: [
      "Vectors inserted before the metadata index exists are not filterable on that field until upserted again. Each vector holds up to 10 KiB of metadata; a query returns at most 50 results with metadata or values, 100 without.",
      "Les vecteurs insérés avant la création de l'index de métadonnées ne sont pas filtrables sur ce champ tant qu'ils ne sont pas réinsérés. Chaque vecteur porte jusqu'à 10 Kio de métadonnées ; une requête renvoie au plus 50 résultats avec métadonnées ou valeurs, 100 sans.",
      "Los vectores insertados antes de crear el índice de metadatos no se pueden filtrar por ese campo hasta reinsertarlos. Cada vector lleva hasta 10 KiB de metadatos; una consulta devuelve como mucho 50 resultados con metadatos o valores, 100 sin ellos.",
    ],
  },
  {
    id: "cf-ai-12",
    q: ["Your RAG answers sometimes invent facts not in the documents. What helps first?", "Tes réponses RAG inventent parfois des faits absents des documents. Qu'est-ce qui aide d'abord ?", "Tus respuestas RAG a veces inventan hechos que no están en los documentos. ¿Qué ayuda primero?"],
    a: ["Tell the model to answer only from the retrieved passages, and to say so when they do not contain the answer", "Dire au modèle de ne répondre qu'à partir des passages retrouvés, et de le dire quand ils ne contiennent pas la réponse", "Indicar al modelo que responda solo a partir de los pasajes recuperados, y que lo diga cuando no contienen la respuesta"],
    w: [["Raise `topK` to 100", "Monter `topK` à 100", "Subir `topK` a 100"], ["Turn on AI Gateway caching", "Activer le cache d'AI Gateway", "Activar la caché de AI Gateway"], ["Use a smaller embedding dimension", "Utiliser une dimension d'embedding plus petite", "Usar una dimensión de embedding menor"]],
    e: [
      "Grounding instructions and showing the sources are the first defence. Then check retrieval itself: are the right passages found? Chunk size, metadata filters and query rewriting (an option of AI Search) matter more than sending ever more passages, which dilutes the prompt.",
      "Les consignes d'ancrage et l'affichage des sources sont la première défense. Vérifie ensuite la recherche elle-même : trouve-t-elle les bons passages ? La taille des morceaux, les filtres de métadonnées et la réécriture de la requête (une option d'AI Search) comptent plus qu'envoyer toujours plus de passages, ce qui dilue le prompt.",
      "Las instrucciones de anclaje y mostrar las fuentes son la primera defensa. Luego revisa la propia búsqueda: ¿encuentra los pasajes correctos? El tamaño de los fragmentos, los filtros de metadatos y la reescritura de la consulta (una opción de AI Search) importan más que enviar cada vez más pasajes, que diluyen el prompt.",
    ],
  },
];

export const dns = { dnsAdvanced };
export const tls = { tlsOrigin };
export const cache = { cacheTiers };
export const security = { botsApi };
export const workers = { workersRuntime };
export const storage = { durableObjects };
export const zeroTrust = { gateway };
export const ai = { rag };
