/**
 * Cloudflare, Débutant: the proxy and anycast, the SSL/TLS modes, what the
 * cache keeps, the first security products, what a Worker is, the storage
 * products, Zero Trust's parts and the AI products. Code between backticks
 * is the same in the three languages; prices are written "USD 5" (a dollar
 * sign would start a formula).
 */
import type { LinuxQuestion as CfQuestion } from "../linux/types";

const dnsBasics: CfQuestion[] = [
  {
    id: "cf-dns-01",
    q: ["A DNS record is proxied (orange cloud). What does that change?", "Un enregistrement DNS est proxifié (nuage orange). Qu'est-ce que cela change ?", "Un registro DNS está proxificado (nube naranja). ¿Qué cambia eso?"],
    a: ["DNS answers with Cloudflare's addresses, and HTTP traffic goes through Cloudflare, where cache, WAF and rules apply", "Le DNS répond avec les adresses de Cloudflare, et le trafic HTTP passe par Cloudflare, où s'appliquent cache, WAF et règles", "El DNS responde con las direcciones de Cloudflare y el tráfico HTTP pasa por Cloudflare, donde se aplican caché, WAF y reglas"],
    w: [["Only that the record is signed with DNSSEC", "Seulement que l'enregistrement est signé avec DNSSEC", "Solo que el registro se firma con DNSSEC"], ["DNS answers with your server's address, but cached longer", "Le DNS répond avec l'adresse de ton serveur, mais la garde plus longtemps en cache", "El DNS responde con la dirección de tu servidor, pero la guarda más tiempo"], ["Cloudflare copies your whole site once a day", "Cloudflare copie tout ton site une fois par jour", "Cloudflare copia todo tu sitio una vez al día"]],
    e: [
      "A proxied record hides your origin: resolvers get Cloudflare's anycast addresses, visitors connect to Cloudflare, and every product (cache, WAF, redirects, Workers) acts on the request before it reaches your server. A DNS-only (grey cloud) record answers with your real address, and none of those products apply.",
      "Un enregistrement proxifié cache ton origine : les résolveurs reçoivent les adresses anycast de Cloudflare, les visiteurs se connectent à Cloudflare, et chaque produit (cache, WAF, redirections, Workers) agit sur la requête avant qu'elle atteigne ton serveur. Un enregistrement DNS seulement (nuage gris) répond avec ta vraie adresse, et aucun de ces produits ne s'applique.",
      "Un registro proxificado oculta tu origen: los resolvedores reciben las direcciones anycast de Cloudflare, los visitantes se conectan a Cloudflare y cada producto (caché, WAF, redirecciones, Workers) actúa sobre la petición antes de que llegue a tu servidor. Un registro solo DNS (nube gris) responde con tu dirección real, y no se aplica ninguno de esos productos.",
    ],
  },
  {
    id: "cf-dns-02",
    q: ["Which DNS record types can be proxied?", "Quels types d'enregistrements DNS peuvent être proxifiés ?", "¿Qué tipos de registros DNS se pueden proxificar?"],
    a: ["`A`, `AAAA` and `CNAME` only", "`A`, `AAAA` et `CNAME` seulement", "Solo `A`, `AAAA` y `CNAME`"],
    w: [["`A`, `AAAA`, `CNAME` and `MX`", "`A`, `AAAA`, `CNAME` et `MX`", "`A`, `AAAA`, `CNAME` y `MX`"], ["Every type, `TXT` included", "Tous les types, `TXT` compris", "Todos los tipos, `TXT` incluido"], ["Only `A`", "Seulement `A`", "Solo `A`"]],
    e: [
      "Only the records that resolve a name to an address can send traffic through the proxy. `MX`, `TXT` and the others are always DNS-only. That is also why a mail server's hostname must stay DNS-only: SMTP does not go through Cloudflare's HTTP proxy.",
      "Seuls les enregistrements qui associent un nom à une adresse peuvent faire passer du trafic par le proxy. `MX`, `TXT` et les autres sont toujours en DNS seulement. C'est aussi pourquoi le nom d'un serveur de messagerie doit rester en DNS seulement : SMTP ne passe pas par le proxy HTTP de Cloudflare.",
      "Solo los registros que asocian un nombre a una dirección pueden enviar tráfico por el proxy. `MX`, `TXT` y los demás son siempre solo DNS. Por eso también el nombre de un servidor de correo debe quedarse en solo DNS: SMTP no pasa por el proxy HTTP de Cloudflare.",
    ],
  },
  {
    id: "cf-dns-03",
    q: ["Cloudflare's network uses anycast. What does that mean?", "Le réseau de Cloudflare utilise l'anycast. Qu'est-ce que cela veut dire ?", "La red de Cloudflare usa anycast. ¿Qué significa eso?"],
    a: ["The same IP addresses are announced from every location, and routing takes each visitor to the nearest one", "Les mêmes adresses IP sont annoncées depuis chaque site, et le routage mène chaque visiteur au plus proche", "Las mismas direcciones IP se anuncian desde cada ubicación, y el enrutamiento lleva a cada visitante a la más cercana"],
    w: [["DNS gives each country a different address", "Le DNS donne une adresse différente à chaque pays", "El DNS da una dirección distinta a cada país"], ["All traffic goes to one central data center, with backups", "Tout le trafic va vers un centre de données central, avec des secours", "Todo el tráfico va a un centro de datos central, con respaldos"], ["Requests are spread round-robin over your servers", "Les requêtes sont réparties à tour de rôle entre tes serveurs", "Las peticiones se reparten por turnos entre tus servidores"]],
    e: [
      "With anycast, ordinary internet routing (BGP) does the geography: a visitor in Lausanne reaches a nearby Cloudflare data center, one in Tokyo another, with the same address. If a location fails, its routes are withdrawn and traffic flows to the next one. Every server runs every service, so the request is handled where it arrives.",
      "Avec l'anycast, le routage ordinaire d'internet (BGP) fait la géographie : un visiteur à Lausanne atteint un centre de données Cloudflare proche, un autre à Tokyo un autre, avec la même adresse. Si un site tombe, ses routes sont retirées et le trafic va au suivant. Chaque serveur fait tourner tous les services, donc la requête est traitée là où elle arrive.",
      "Con anycast, el enrutamiento normal de internet (BGP) hace la geografía: un visitante en Lausana llega a un centro de datos cercano de Cloudflare, otro en Tokio a otro, con la misma dirección. Si una ubicación falla, se retiran sus rutas y el tráfico va a la siguiente. Cada servidor ejecuta todos los servicios, así que la petición se atiende donde llega.",
    ],
  },
  {
    id: "cf-dns-04",
    q: ["What does a full setup of a domain on Cloudflare require?", "Que demande la configuration complète (full setup) d'un domaine sur Cloudflare ?", "¿Qué requiere la configuración completa (full setup) de un dominio en Cloudflare?"],
    a: ["Replacing the nameservers at your registrar with the two Cloudflare assigns to the zone", "Remplacer les serveurs de noms chez ton registraire par les deux que Cloudflare attribue à la zone", "Sustituir los servidores de nombres en tu registrador por los dos que Cloudflare asigna a la zona"],
    w: [["A CNAME to `cdn.cloudflare.net` for each hostname", "Un CNAME vers `cdn.cloudflare.net` pour chaque nom d'hôte", "Un CNAME a `cdn.cloudflare.net` para cada nombre de host"], ["Installing a Cloudflare agent on your server", "Installer un agent Cloudflare sur ton serveur", "Instalar un agente de Cloudflare en tu servidor"], ["Transferring the domain's registration to Cloudflare", "Transférer l'enregistrement du domaine chez Cloudflare", "Transferir el registro del dominio a Cloudflare"]],
    e: [
      "In a full (primary) setup, Cloudflare becomes the authoritative DNS for the whole domain, on every plan. The CNAME to `<hostname>.cdn.cloudflare.net` is the partial setup, where another provider stays authoritative; it needs the Business or Enterprise plan. The domain can stay at any registrar.",
      "Dans une configuration complète (primaire), Cloudflare devient le DNS faisant autorité pour tout le domaine, sur tous les plans. Le CNAME vers `<hostname>.cdn.cloudflare.net` est la configuration partielle, où un autre fournisseur garde l'autorité ; elle demande le plan Business ou Enterprise. Le domaine peut rester chez n'importe quel registraire.",
      "En una configuración completa (primaria), Cloudflare pasa a ser el DNS autoritativo de todo el dominio, en todos los planes. El CNAME a `<hostname>.cdn.cloudflare.net` es la configuración parcial, en la que otro proveedor sigue siendo autoritativo; requiere el plan Business o Enterprise. El dominio puede quedarse en cualquier registrador.",
    ],
  },
];

const tlsBasics: CfQuestion[] = [
  {
    id: "cf-tls-01",
    q: ["Which SSL/TLS encryption mode encrypts both connections and checks the origin's certificate?", "Quel mode de chiffrement SSL/TLS chiffre les deux connexions et vérifie le certificat de l'origine ?", "¿Qué modo de cifrado SSL/TLS cifra las dos conexiones y comprueba el certificado del origen?"],
    a: ["Full (strict)", "Full (strict)", "Full (strict)"],
    w: [["Flexible", "Flexible", "Flexible"], ["Full", "Full", "Full"], ["Off", "Off", "Off"]],
    e: [
      "Flexible encrypts only visitor to Cloudflare; Full also encrypts Cloudflare to origin but accepts any certificate, even self-signed or expired; Full (strict) requires a valid certificate from a public CA or Cloudflare's Origin CA, matching the hostname. Cloudflare recommends Full or Full (strict).",
      "Flexible ne chiffre que visiteur → Cloudflare ; Full chiffre aussi Cloudflare → origine mais accepte n'importe quel certificat, même auto-signé ou expiré ; Full (strict) exige un certificat valide d'une autorité publique ou de l'Origin CA de Cloudflare, correspondant au nom d'hôte. Cloudflare recommande Full ou Full (strict).",
      "Flexible solo cifra visitante → Cloudflare; Full también cifra Cloudflare → origen pero acepta cualquier certificado, aunque sea autofirmado o caducado; Full (strict) exige un certificado válido de una autoridad pública o del Origin CA de Cloudflare, que corresponda al nombre de host. Cloudflare recomienda Full o Full (strict).",
    ],
  },
  {
    id: "cf-tls-02",
    q: ["With the Flexible mode, what is encrypted?", "Avec le mode Flexible, qu'est-ce qui est chiffré ?", "Con el modo Flexible, ¿qué va cifrado?"],
    a: ["Only the connection from the visitor to Cloudflare; Cloudflare reaches the origin over plain HTTP", "Seulement la connexion du visiteur à Cloudflare ; Cloudflare joint l'origine en HTTP non chiffré", "Solo la conexión del visitante a Cloudflare; Cloudflare llega al origen por HTTP sin cifrar"],
    w: [["Both connections, end to end", "Les deux connexions, de bout en bout", "Las dos conexiones, de extremo a extremo"], ["Only the connection from Cloudflare to the origin", "Seulement la connexion de Cloudflare à l'origine", "Solo la conexión de Cloudflare al origen"], ["Nothing: Flexible is HTTP only", "Rien : Flexible, c'est seulement du HTTP", "Nada: Flexible es solo HTTP"]],
    e: [
      "The visitor sees a padlock, but the request crosses the internet in clear text between Cloudflare and your server. Flexible is for origins that cannot serve HTTPS at all; give the origin a certificate (an Origin CA certificate is free) and use Full (strict).",
      "Le visiteur voit un cadenas, mais la requête traverse internet en clair entre Cloudflare et ton serveur. Flexible est pour les origines qui ne savent pas du tout servir HTTPS ; donne un certificat à l'origine (un certificat Origin CA est gratuit) et passe en Full (strict).",
      "El visitante ve un candado, pero la petición cruza internet en claro entre Cloudflare y tu servidor. Flexible es para orígenes que no pueden servir HTTPS en absoluto; dale un certificado al origen (uno de Origin CA es gratis) y usa Full (strict).",
    ],
  },
  {
    id: "cf-tls-03",
    q: ["Which hostnames does the free Universal SSL certificate cover in a full setup?", "Quels noms d'hôte le certificat gratuit Universal SSL couvre-t-il dans une configuration complète ?", "¿Qué nombres de host cubre el certificado gratuito Universal SSL en una configuración completa?"],
    a: ["The apex and first-level subdomains: `example.com` and `*.example.com`", "L'apex et les sous-domaines de premier niveau : `example.com` et `*.example.com`", "El ápex y los subdominios de primer nivel: `example.com` y `*.example.com`"],
    w: [["Every subdomain at any depth, `a.b.example.com` included", "Tous les sous-domaines à toute profondeur, `a.b.example.com` compris", "Todos los subdominios a cualquier profundidad, `a.b.example.com` incluido"], ["Only `www.example.com`", "Seulement `www.example.com`", "Solo `www.example.com`"], ["Only `example.com`", "Seulement `example.com`", "Solo `example.com`"]],
    e: [
      "A wildcard covers one level, so `dev.www.example.com` gets no valid certificate from Universal SSL. Advanced Certificate Manager (an advanced certificate, or Total TLS for every proxied hostname) or a custom certificate covers deeper names.",
      "Un joker couvre un seul niveau : `dev.www.example.com` n'obtient pas de certificat valide d'Universal SSL. Advanced Certificate Manager (un certificat avancé, ou Total TLS pour chaque nom proxifié) ou un certificat personnalisé couvre les noms plus profonds.",
      "Un comodín cubre un solo nivel, así que `dev.www.example.com` no recibe un certificado válido de Universal SSL. Advanced Certificate Manager (un certificado avanzado, o Total TLS para cada nombre proxificado) o un certificado propio cubre los nombres más profundos.",
    ],
  },
  {
    id: "cf-tls-04",
    q: ["What does the setting Always Use HTTPS do?", "Que fait le réglage Always Use HTTPS ?", "¿Qué hace el ajuste Always Use HTTPS?"],
    a: ["Cloudflare redirects every `http://` request to `https://` at the edge", "Cloudflare redirige chaque requête `http://` vers `https://` en bordure", "Cloudflare redirige cada petición `http://` a `https://` en el borde"],
    w: [["It makes the origin listen only on port 443", "Il fait écouter l'origine seulement sur le port 443", "Hace que el origen solo escuche en el puerto 443"], ["It adds the site to the browsers' HSTS preload list", "Il ajoute le site à la liste de préchargement HSTS des navigateurs", "Añade el sitio a la lista de precarga HSTS de los navegadores"], ["It answers 403 to visitors who use HTTP", "Il répond 403 aux visiteurs qui utilisent HTTP", "Responde 403 a los visitantes que usan HTTP"]],
    e: [
      "The redirect happens on Cloudflare, so the origin never sees the HTTP request. HSTS is a separate setting: it tells browsers to use HTTPS only for a while, and is best turned on once HTTPS works on every hostname.",
      "La redirection se fait chez Cloudflare : l'origine ne voit jamais la requête HTTP. HSTS est un réglage distinct : il dit aux navigateurs de n'utiliser que HTTPS pendant un temps, et se met en place une fois HTTPS opérationnel sur chaque nom d'hôte.",
      "La redirección ocurre en Cloudflare, así que el origen nunca ve la petición HTTP. HSTS es un ajuste aparte: indica a los navegadores que usen solo HTTPS durante un tiempo, y conviene activarlo cuando HTTPS funciona en todos los nombres de host.",
    ],
  },
];

const cacheBasics: CfQuestion[] = [
  {
    id: "cf-cache-01",
    q: ["Does Cloudflare cache HTML pages by default?", "Cloudflare met-il les pages HTML en cache par défaut ?", "¿Guarda Cloudflare las páginas HTML en caché por defecto?"],
    a: ["No: by default it caches by file extension (images, CSS, JS, fonts…), never HTML or JSON; a Cache Rule can make them eligible", "Non : par défaut, il met en cache selon l'extension (images, CSS, JS, polices…), jamais le HTML ni le JSON ; une Cache Rule peut les rendre éligibles", "No: por defecto guarda según la extensión (imágenes, CSS, JS, fuentes…), nunca HTML ni JSON; una Cache Rule puede hacerlos aptos"],
    w: [["Yes, every response is cached", "Oui, toute réponse est mise en cache", "Sí, se guarda toda respuesta"], ["Yes, if the page is smaller than 512 MB", "Oui, si la page fait moins de 512 Mo", "Sí, si la página pesa menos de 512 MB"], ["Only on the Pro plan and above", "Seulement à partir du plan Pro", "Solo a partir del plan Pro"]],
    e: [
      "HTML is often personal (a cart, an account), so Cloudflare does not cache it unless told to. A response marked `DYNAMIC` in `CF-Cache-Status` is the default behaviour, not an error. Caching is decided by the extension, not by the MIME type.",
      "Le HTML est souvent personnel (un panier, un compte) : Cloudflare ne le met pas en cache sans qu'on le lui dise. Une réponse marquée `DYNAMIC` dans `CF-Cache-Status` est le comportement par défaut, pas une erreur. La mise en cache se décide selon l'extension, pas le type MIME.",
      "El HTML suele ser personal (un carrito, una cuenta), así que Cloudflare no lo guarda si no se le indica. Una respuesta marcada `DYNAMIC` en `CF-Cache-Status` es el comportamiento por defecto, no un error. La caché se decide por la extensión, no por el tipo MIME.",
    ],
  },
  {
    id: "cf-cache-02",
    q: ["A response carries `CF-Cache-Status: HIT`. What does it mean?", "Une réponse porte `CF-Cache-Status: HIT`. Qu'est-ce que cela veut dire ?", "Una respuesta lleva `CF-Cache-Status: HIT`. ¿Qué significa?"],
    a: ["Cloudflare served it from its cache, without asking the origin", "Cloudflare l'a servie depuis son cache, sans interroger l'origine", "Cloudflare la sirvió desde su caché, sin preguntar al origen"],
    w: [["The origin was reached and the response was stored", "L'origine a été jointe et la réponse stockée", "Se llegó al origen y se guardó la respuesta"], ["A WAF rule matched the request", "Une règle du WAF a correspondu à la requête", "Una regla del WAF coincidió con la petición"], ["The browser served it from its own cache", "Le navigateur l'a servie depuis son propre cache", "El navegador la sirvió desde su propia caché"]],
    e: [
      "`MISS` means fetched from the origin (and stored if cacheable), `EXPIRED` a stale copy fetched again, `BYPASS` that a header or rule prevented caching, `DYNAMIC` that the resource is not eligible by default. A browser cache hit never reaches Cloudflare at all, so it carries no new header.",
      "`MISS` veut dire allé chercher chez l'origine (et stocké si possible), `EXPIRED` une copie périmée récupérée à nouveau, `BYPASS` qu'un en-tête ou une règle a empêché la mise en cache, `DYNAMIC` que la ressource n'est pas éligible par défaut. Un succès du cache du navigateur n'atteint jamais Cloudflare : il ne porte aucun nouvel en-tête.",
      "`MISS` significa traída del origen (y guardada si se puede), `EXPIRED` una copia caducada traída de nuevo, `BYPASS` que una cabecera o regla impidió guardarla, `DYNAMIC` que el recurso no es apto por defecto. Un acierto de la caché del navegador ni siquiera llega a Cloudflare, así que no lleva cabecera nueva.",
    ],
  },
  {
    id: "cf-cache-03",
    q: ["You purge a file from Cloudflare's cache. Do visitors' browsers drop their copy too?", "Tu purges un fichier du cache de Cloudflare. Les navigateurs des visiteurs jettent-ils aussi leur copie ?", "Purgas un archivo de la caché de Cloudflare. ¿Los navegadores de los visitantes descartan también su copia?"],
    a: ["No: browsers keep it until their own TTL expires", "Non : les navigateurs la gardent jusqu'à l'expiration de leur propre TTL", "No: los navegadores la conservan hasta que caduca su propio TTL"],
    w: [["Yes, Cloudflare tells every browser", "Oui, Cloudflare prévient chaque navigateur", "Sí, Cloudflare avisa a cada navegador"], ["Only on the Enterprise plan", "Seulement avec le plan Enterprise", "Solo con el plan Enterprise"], ["Yes, if HSTS is on", "Oui, si HSTS est activé", "Sí, si HSTS está activado"]],
    e: [
      "Purging clears Cloudflare's copies only. A long Browser Cache TTL on a file that may change is a promise you cannot take back: give such files versioned names (`app.3f9a1c.js`) with long lifetimes, and keep the HTML that refers to them short-lived.",
      "La purge ne vide que les copies de Cloudflare. Un long Browser Cache TTL sur un fichier qui peut changer est une promesse qu'on ne peut pas reprendre : donne à ces fichiers des noms versionnés (`app.3f9a1c.js`) avec de longues durées, et garde courte la durée du HTML qui les référence.",
      "Purgar solo vacía las copias de Cloudflare. Un Browser Cache TTL largo en un archivo que puede cambiar es una promesa que no se puede retirar: da a esos archivos nombres con versión (`app.3f9a1c.js`) y duraciones largas, y mantén corta la del HTML que los referencia.",
    ],
  },
  {
    id: "cf-cache-04",
    q: ["Which of these responses does Cloudflare not cache by default?", "Laquelle de ces réponses Cloudflare ne met-il pas en cache par défaut ?", "¿Cuál de estas respuestas no guarda Cloudflare por defecto?"],
    a: ["An image whose response sets a cookie with `Set-Cookie`", "Une image dont la réponse pose un cookie avec `Set-Cookie`", "Una imagen cuya respuesta fija una cookie con `Set-Cookie`"],
    w: [["A JPG with `Cache-Control: max-age=600`", "Un JPG avec `Cache-Control: max-age=600`", "Un JPG con `Cache-Control: max-age=600`"], ["A CSS file with no cache headers", "Un fichier CSS sans en-tête de cache", "Un archivo CSS sin cabeceras de caché"], ["`robots.txt`", "`robots.txt`", "`robots.txt`"]],
    e: [
      "A response that sets a cookie may be personal, so it is not cached; neither is one with `Cache-Control: private`, `no-store`, `no-cache` or `max-age=0`, or a request other than GET. A CSS file without headers is cached with the default edge TTL (2 hours for a 200), and `robots.txt` is cached by default.",
      "Une réponse qui pose un cookie peut être personnelle : elle n'est pas mise en cache ; ni celle qui porte `Cache-Control: private`, `no-store`, `no-cache` ou `max-age=0`, ni une requête autre que GET. Un CSS sans en-tête est mis en cache avec la durée par défaut (2 heures pour un 200), et `robots.txt` est mis en cache par défaut.",
      "Una respuesta que fija una cookie puede ser personal, así que no se guarda; tampoco una con `Cache-Control: private`, `no-store`, `no-cache` o `max-age=0`, ni una petición que no sea GET. Un CSS sin cabeceras se guarda con el TTL por defecto (2 horas para un 200), y `robots.txt` se guarda por defecto.",
    ],
  },
];

const securityBasics: CfQuestion[] = [
  {
    id: "cf-sec-01",
    q: ["How is DDoS protection billed on Cloudflare?", "Comment la protection DDoS est-elle facturée chez Cloudflare ?", "¿Cómo se factura la protección DDoS en Cloudflare?"],
    a: ["It is unmetered, on every plan: attack traffic is not billed", "Elle est illimitée, sur tous les plans : le trafic d'attaque n'est pas facturé", "Es ilimitada, en todos los planes: el tráfico de ataque no se factura"],
    w: [["Per gigabyte of attack traffic absorbed", "Par gigaoctet de trafic d'attaque absorbé", "Por gigabyte de tráfico de ataque absorbido"], ["It needs the Pro plan or above", "Il faut le plan Pro ou plus", "Requiere el plan Pro o superior"], ["Only network attacks are covered, never HTTP floods", "Seules les attaques réseau sont couvertes, jamais les floods HTTP", "Solo se cubren los ataques de red, nunca las inundaciones HTTP"]],
    e: [
      "Network-layer (L3/4) and HTTP (L7) DDoS protection are on for every zone and detect attacks automatically with managed rulesets; you can tune their sensitivity, not turn them off. Attacks that look like normal requests (credential stuffing, scraping) are the job of the WAF, rate limiting and bot products.",
      "La protection DDoS réseau (L3/4) et HTTP (L7) est active sur chaque zone et détecte les attaques automatiquement avec des règles gérées ; on peut ajuster leur sensibilité, pas les désactiver. Les attaques qui ressemblent à des requêtes normales (bourrage d'identifiants, aspiration) relèvent du WAF, de la limitation de débit et des produits contre les bots.",
      "La protección DDoS de red (L3/4) y HTTP (L7) está activa en cada zona y detecta ataques automáticamente con reglas gestionadas; se puede ajustar su sensibilidad, no desactivarla. Los ataques que parecen peticiones normales (relleno de credenciales, scraping) son trabajo del WAF, la limitación de velocidad y los productos contra bots.",
    ],
  },
  {
    id: "cf-sec-02",
    q: ["What does the Managed Challenge action do?", "Que fait l'action Managed Challenge ?", "¿Qué hace la acción Managed Challenge?"],
    a: ["Cloudflare chooses the check: often invisible, an interactive challenge only if needed; it is the recommended challenge", "Cloudflare choisit la vérification : souvent invisible, un défi interactif seulement si nécessaire ; c'est le défi recommandé", "Cloudflare elige la comprobación: a menudo invisible, un desafío interactivo solo si hace falta; es el desafío recomendado"],
    w: [["It always shows a CAPTCHA with images", "Il affiche toujours un CAPTCHA avec des images", "Muestra siempre un CAPTCHA con imágenes"], ["It blocks the request with a 403", "Il bloque la requête avec un 403", "Bloquea la petición con un 403"], ["It only records the request in the logs", "Il ne fait qu'enregistrer la requête dans les journaux", "Solo registra la petición en los registros"]],
    e: [
      "Managed Challenge adapts to the visitor's signals, so most humans pass without doing anything while automated clients fail. The older JS Challenge and Interactive Challenge are fixed. Block returns an error page; Log (Enterprise only) records without acting.",
      "Managed Challenge s'adapte aux signaux du visiteur : la plupart des humains passent sans rien faire, les clients automatisés échouent. Les anciens JS Challenge et Interactive Challenge sont fixes. Block renvoie une page d'erreur ; Log (Enterprise seulement) enregistre sans agir.",
      "Managed Challenge se adapta a las señales del visitante, así que la mayoría de las personas pasan sin hacer nada y los clientes automáticos fallan. Los antiguos JS Challenge e Interactive Challenge son fijos. Block devuelve una página de error; Log (solo Enterprise) registra sin actuar.",
    ],
  },
  {
    id: "cf-sec-03",
    q: ["How many WAF custom rules does the Free plan allow per zone?", "Combien de règles personnalisées du WAF le plan Free permet-il par zone ?", "¿Cuántas reglas personalizadas del WAF permite el plan Free por zona?"],
    a: ["5", "5", "5"],
    w: [["1", "1", "1"], ["20", "20", "20"], ["Unlimited", "Illimité", "Ilimitadas"]],
    e: [
      "Free has 5 custom rules, Pro 20, Business 100, Enterprise 1,000. Lists (of IPs, ASNs, hostnames) keep rules short: `ip.src in $office` counts as one rule however long the list.",
      "Free a 5 règles personnalisées, Pro 20, Business 100, Enterprise 1000. Les listes (d'IP, d'ASN, de noms d'hôte) gardent les règles courtes : `ip.src in $office` compte pour une règle, quelle que soit la longueur de la liste.",
      "Free tiene 5 reglas personalizadas, Pro 20, Business 100, Enterprise 1000. Las listas (de IP, ASN, nombres de host) mantienen las reglas cortas: `ip.src in $office` cuenta como una regla, sea cual sea la longitud de la lista.",
    ],
  },
  {
    id: "cf-sec-04",
    q: ["A login form uses Turnstile. What must your server do with the token it receives?", "Un formulaire de connexion utilise Turnstile. Que doit faire ton serveur du jeton qu'il reçoit ?", "Un formulario de inicio de sesión usa Turnstile. ¿Qué debe hacer tu servidor con el token que recibe?"],
    a: ["Validate it with Cloudflare's siteverify API before trusting the form", "Le valider avec l'API siteverify de Cloudflare avant de faire confiance au formulaire", "Validarlo con la API siteverify de Cloudflare antes de fiarse del formulario"],
    w: [["Nothing: the widget on the page is enough", "Rien : le widget sur la page suffit", "Nada: el widget de la página basta"], ["Store it in a cookie for next time", "Le stocker dans un cookie pour la prochaine fois", "Guardarlo en una cookie para la próxima vez"], ["Send it back to the browser to check", "Le renvoyer au navigateur pour vérification", "Devolverlo al navegador para que lo compruebe"]],
    e: [
      "Without server-side validation, a bot can simply post the form with any token, or none. A token is valid for 300 seconds and only once. Turnstile works on any site, even one not proxied by Cloudflare.",
      "Sans validation côté serveur, un bot peut simplement envoyer le formulaire avec n'importe quel jeton, ou aucun. Un jeton est valable 300 secondes et une seule fois. Turnstile fonctionne sur n'importe quel site, même non proxifié par Cloudflare.",
      "Sin validación en el servidor, un bot puede simplemente enviar el formulario con cualquier token, o sin ninguno. Un token es válido 300 segundos y una sola vez. Turnstile funciona en cualquier sitio, aunque no pase por el proxy de Cloudflare.",
    ],
  },
];

const workersBasics: CfQuestion[] = [
  {
    id: "cf-wk-01",
    q: ["What does a Cloudflare Worker run in?", "Dans quoi un Worker Cloudflare s'exécute-t-il ?", "¿En qué se ejecuta un Worker de Cloudflare?"],
    a: ["A V8 isolate, in every Cloudflare data center", "Un isolat V8, dans chaque centre de données de Cloudflare", "Un aislado de V8, en cada centro de datos de Cloudflare"],
    w: [["A container in one region you choose", "Un conteneur dans une région que tu choisis", "Un contenedor en una región que eliges"], ["A virtual machine per customer", "Une machine virtuelle par client", "Una máquina virtual por cliente"], ["A Node.js process on your own server", "Un processus Node.js sur ton propre serveur", "Un proceso de Node.js en tu propio servidor"]],
    e: [
      "Isolates share one process, so a Worker starts in milliseconds and runs where the request arrives. They offer web standard APIs (`fetch`, `Request`, `Response`, streams, Web Crypto) and, with the `nodejs_compat` flag, most of Node's.",
      "Les isolats partagent un même processus : un Worker démarre en quelques millisecondes et s'exécute là où la requête arrive. Ils offrent les API standard du web (`fetch`, `Request`, `Response`, flux, Web Crypto) et, avec le drapeau `nodejs_compat`, la plupart de celles de Node.",
      "Los aislados comparten un proceso, así que un Worker arranca en milisegundos y se ejecuta donde llega la petición. Ofrecen las API estándar de la web (`fetch`, `Request`, `Response`, flujos, Web Crypto) y, con la marca `nodejs_compat`, la mayoría de las de Node.",
    ],
  },
  {
    id: "cf-wk-02",
    q: ["What does the Workers Free plan allow?", "Que permet le plan Workers Free ?", "¿Qué permite el plan Workers Free?"],
    a: ["100,000 requests a day, with 10 ms of CPU time per request", "100 000 requêtes par jour, avec 10 ms de temps CPU par requête", "100 000 peticiones al día, con 10 ms de CPU por petición"],
    w: [["1 million requests a month, with 50 ms of CPU", "1 million de requêtes par mois, avec 50 ms de CPU", "1 millón de peticiones al mes, con 50 ms de CPU"], ["Unlimited requests, with 1 second of CPU", "Des requêtes illimitées, avec 1 seconde de CPU", "Peticiones ilimitadas, con 1 segundo de CPU"], ["10,000 requests a day, with 30 seconds of CPU", "10 000 requêtes par jour, avec 30 secondes de CPU", "10 000 peticiones al día, con 30 segundos de CPU"]],
    e: [
      "Workers Paid (USD 5 a month minimum) includes 10 million requests and 30 million CPU-ms a month, with 30 seconds of CPU per request by default and up to 5 minutes. Only CPU time counts, never time spent waiting on the network, and there is no charge for egress.",
      "Workers Paid (5 USD par mois minimum) inclut 10 millions de requêtes et 30 millions de ms de CPU par mois, avec 30 secondes de CPU par requête par défaut et jusqu'à 5 minutes. Seul le temps CPU compte, jamais l'attente du réseau, et le trafic sortant n'est pas facturé.",
      "Workers Paid (5 USD al mes como mínimo) incluye 10 millones de peticiones y 30 millones de ms de CPU al mes, con 30 segundos de CPU por petición por defecto y hasta 5 minutos. Solo cuenta el tiempo de CPU, nunca la espera de la red, y el tráfico saliente no se factura.",
    ],
  },
  {
    id: "cf-wk-03",
    q: ["How does a Worker reach a KV namespace?", "Comment un Worker accède-t-il à un espace de noms KV ?", "¿Cómo accede un Worker a un espacio de nombres KV?"],
    a: ["Through a binding declared in the Wrangler configuration, read as `env.NAME`", "Par une liaison (binding) déclarée dans la configuration Wrangler, lue comme `env.NAME`", "Mediante un enlace (binding) declarado en la configuración de Wrangler, leído como `env.NAME`"],
    w: [["Through the REST API, with an API token in the code", "Par l'API REST, avec un jeton d'API dans le code", "Mediante la API REST, con un token de API en el código"], ["By importing a package from npm", "En important un paquet depuis npm", "Importando un paquete de npm"], ["Through a global variable set by Cloudflare", "Par une variable globale posée par Cloudflare", "Mediante una variable global que pone Cloudflare"]],
    e: [
      "Bindings connect a Worker to KV, R2, D1, Durable Objects, Queues, Workers AI and more, with no network hop, no token and no extra latency. They arrive in the `env` argument of each handler. Prefer them to REST calls.",
      "Les liaisons relient un Worker à KV, R2, D1, Durable Objects, Queues, Workers AI et d'autres, sans saut réseau, sans jeton et sans latence supplémentaire. Elles arrivent dans l'argument `env` de chaque gestionnaire. Préfère-les aux appels REST.",
      "Los enlaces conectan un Worker con KV, R2, D1, Durable Objects, Queues, Workers AI y más, sin salto de red, sin token y sin latencia extra. Llegan en el argumento `env` de cada manejador. Prefiérelos a las llamadas REST.",
    ],
  },
  {
    id: "cf-wk-04",
    q: ["Where should a Worker's API key for a payment provider be kept?", "Où garder la clé d'API d'un prestataire de paiement utilisée par un Worker ?", "¿Dónde guardar la clave de API de un proveedor de pagos que usa un Worker?"],
    a: ["As a secret, set with `wrangler secret put`", "Comme secret, posé avec `wrangler secret put`", "Como secreto, con `wrangler secret put`"],
    w: [["In `vars` in the Wrangler configuration file", "Dans `vars` du fichier de configuration Wrangler", "En `vars` del archivo de configuración de Wrangler"], ["In a `.env` file committed with the code", "Dans un fichier `.env` versionné avec le code", "En un archivo `.env` subido con el código"], ["As a constant in the source code", "Comme constante dans le code source", "Como constante en el código fuente"]],
    e: [
      "Secrets are stored encrypted and arrive in `env` like other bindings, but never appear in the configuration or the dashboard after being set. `vars` are for settings that are not secret; anything committed to the repository should be considered public.",
      "Les secrets sont stockés chiffrés et arrivent dans `env` comme les autres liaisons, mais n'apparaissent jamais dans la configuration ni dans le tableau de bord une fois posés. Les `vars` sont pour les réglages non secrets ; tout ce qui est versionné doit être considéré comme public.",
      "Los secretos se guardan cifrados y llegan en `env` como los demás enlaces, pero nunca aparecen en la configuración ni en el panel una vez puestos. Las `vars` son para ajustes no secretos; todo lo que se sube al repositorio debe considerarse público.",
    ],
  },
];

const storageBasics: CfQuestion[] = [
  {
    id: "cf-st-01",
    q: ["What makes R2's pricing different from most object storage?", "Qu'est-ce qui distingue la tarification de R2 de la plupart des stockages objet ?", "¿Qué distingue el precio de R2 del de la mayoría del almacenamiento de objetos?"],
    a: ["There is no charge for egress: reading data out is free; you pay storage and operations", "Le trafic sortant n'est pas facturé : lire les données est gratuit ; on paie le stockage et les opérations", "El tráfico de salida no se cobra: leer los datos es gratis; se paga el almacenamiento y las operaciones"],
    w: [["Storage is free; only egress is billed", "Le stockage est gratuit ; seul le trafic sortant est facturé", "El almacenamiento es gratis; solo se cobra la salida"], ["Writes are free, reads are expensive", "Les écritures sont gratuites, les lectures coûteuses", "Las escrituras son gratis, las lecturas caras"], ["Only one price per bucket, whatever its size", "Un seul prix par bucket, quelle que soit sa taille", "Un solo precio por bucket, sea cual sea su tamaño"]],
    e: [
      "Standard storage costs USD 0.015 per GB-month, USD 4.50 per million writes (Class A) and USD 0.36 per million reads (Class B), with 10 GB, 1 million Class A and 10 million Class B operations free each month. R2 speaks the S3 API, so existing tools work.",
      "Le stockage standard coûte 0,015 USD par Go-mois, 4,50 USD par million d'écritures (classe A) et 0,36 USD par million de lectures (classe B), avec 10 Go, 1 million d'opérations A et 10 millions B gratuits chaque mois. R2 parle l'API S3 : les outils existants fonctionnent.",
      "El almacenamiento estándar cuesta 0,015 USD por GB-mes, 4,50 USD por millón de escrituras (clase A) y 0,36 USD por millón de lecturas (clase B), con 10 GB, 1 millón de operaciones A y 10 millones B gratis cada mes. R2 habla la API de S3, así que las herramientas existentes funcionan.",
    ],
  },
  {
    id: "cf-st-02",
    q: ["How consistent is Workers KV?", "Quelle est la cohérence de Workers KV ?", "¿Qué consistencia tiene Workers KV?"],
    a: ["Eventually consistent: a change can take 60 seconds or more to be seen in other locations", "Cohérence à terme : un changement peut mettre 60 secondes ou plus à être vu ailleurs", "Consistencia eventual: un cambio puede tardar 60 segundos o más en verse en otras ubicaciones"],
    w: [["Strongly consistent everywhere, at once", "Forte, partout, immédiatement", "Fuerte, en todas partes, al instante"], ["Consistent within a country, eventual between countries", "Cohérente dans un pays, à terme entre pays", "Consistente dentro de un país, eventual entre países"], ["Consistent only for values under 1 KB", "Cohérente seulement pour les valeurs de moins de 1 Ko", "Consistente solo para valores de menos de 1 KB"]],
    e: [
      "Writes go to central stores; reads are served from caches in each location, which refresh as their copies expire. KV suits data read far more often than written: configuration, flags, routing tables. For anything that must not race, use a Durable Object.",
      "Les écritures vont dans des stockages centraux ; les lectures sont servies par des caches dans chaque site, qui se rafraîchissent quand leurs copies expirent. KV convient aux données lues bien plus souvent qu'écrites : configuration, drapeaux, tables de routage. Pour ce qui ne doit pas se marcher dessus, utilise un Durable Object.",
      "Las escrituras van a almacenes centrales; las lecturas se sirven desde cachés en cada ubicación, que se refrescan cuando caducan sus copias. KV conviene a datos que se leen mucho más de lo que se escriben: configuración, banderas, tablas de rutas. Para lo que no debe pisarse, usa un Durable Object.",
    ],
  },
  {
    id: "cf-st-03",
    q: ["What is D1?", "Qu'est-ce que D1 ?", "¿Qué es D1?"],
    a: ["Cloudflare's serverless SQL database, built on SQLite", "La base de données SQL serverless de Cloudflare, bâtie sur SQLite", "La base de datos SQL serverless de Cloudflare, basada en SQLite"],
    w: [["A managed PostgreSQL cluster", "Une grappe PostgreSQL gérée", "Un clúster de PostgreSQL gestionado"], ["A key-value store for configuration", "Un stockage clé-valeur pour la configuration", "Un almacén clave-valor para la configuración"], ["A data warehouse for logs", "Un entrepôt de données pour les journaux", "Un almacén de datos para registros"]],
    e: [
      "A D1 database is SQLite, reached from a Worker through a binding, with migrations managed by Wrangler. Each database holds up to 10 GB on Workers Paid; you can create thousands, for example one per customer. To keep an existing PostgreSQL or MySQL database, use Hyperdrive.",
      "Une base D1 est du SQLite, atteint depuis un Worker par une liaison, avec des migrations gérées par Wrangler. Chaque base contient jusqu'à 10 Go avec Workers Paid ; on peut en créer des milliers, par exemple une par client. Pour garder une base PostgreSQL ou MySQL existante, utilise Hyperdrive.",
      "Una base D1 es SQLite, accesible desde un Worker mediante un enlace, con migraciones gestionadas por Wrangler. Cada base guarda hasta 10 GB con Workers Paid; se pueden crear miles, por ejemplo una por cliente. Para conservar una base PostgreSQL o MySQL existente, usa Hyperdrive.",
    ],
  },
  {
    id: "cf-st-04",
    q: ["What is a Durable Object?", "Qu'est-ce qu'un Durable Object ?", "¿Qué es un Durable Object?"],
    a: ["An object with a globally unique name, its own storage, and code that handles its requests one at a time", "Un objet au nom unique au monde, avec son propre stockage, et du code qui traite ses requêtes une à une", "Un objeto con un nombre único en todo el mundo, su propio almacenamiento y código que atiende sus peticiones de una en una"],
    w: [["A backup copy of a Worker", "Une copie de sauvegarde d'un Worker", "Una copia de seguridad de un Worker"], ["A KV namespace whose keys never expire", "Un espace KV dont les clés n'expirent jamais", "Un espacio KV cuyas claves nunca caducan"], ["A virtual machine that is never shut down", "Une machine virtuelle jamais arrêtée", "Una máquina virtual que nunca se apaga"]],
    e: [
      "All requests for one name reach the same instance, which runs them one after another with strongly consistent, transactional storage. That makes it the tool for coordination: chat rooms, counters, collaborative documents, game sessions, WebSocket servers.",
      "Toutes les requêtes pour un même nom arrivent à la même instance, qui les exécute l'une après l'autre avec un stockage fortement cohérent et transactionnel. C'est l'outil de la coordination : salons de discussion, compteurs, documents collaboratifs, parties de jeu, serveurs WebSocket.",
      "Todas las peticiones para un mismo nombre llegan a la misma instancia, que las ejecuta una tras otra con un almacenamiento fuertemente consistente y transaccional. Es la herramienta de la coordinación: salas de chat, contadores, documentos colaborativos, partidas, servidores WebSocket.",
    ],
  },
];

const ztBasics: CfQuestion[] = [
  {
    id: "cf-zt-01",
    q: ["What does Cloudflare Access do?", "Que fait Cloudflare Access ?", "¿Qué hace Cloudflare Access?"],
    a: ["It checks who the user is (and their device) before letting them reach an application", "Il vérifie qui est l'utilisateur (et son appareil) avant de le laisser atteindre une application", "Comprueba quién es el usuario (y su dispositivo) antes de dejarle llegar a una aplicación"],
    w: [["It is a VPN that opens your whole network", "C'est un VPN qui ouvre tout ton réseau", "Es una VPN que abre toda tu red"], ["It caches internal applications", "Il met en cache les applications internes", "Guarda en caché las aplicaciones internas"], ["It is a firewall installed on your server", "C'est un pare-feu installé sur ton serveur", "Es un firewall instalado en tu servidor"]],
    e: [
      "Each application gets its own login and policies, checked by Cloudflare against your identity provider on every request: no user is trusted for being on the office network. Up to 50 users are free.",
      "Chaque application a sa propre connexion et ses stratégies, vérifiées par Cloudflare auprès de ton fournisseur d'identité à chaque requête : aucun utilisateur n'est cru parce qu'il est sur le réseau du bureau. Jusqu'à 50 utilisateurs, c'est gratuit.",
      "Cada aplicación tiene su propio inicio de sesión y sus políticas, comprobadas por Cloudflare con tu proveedor de identidad en cada petición: no se confía en nadie por estar en la red de la oficina. Hasta 50 usuarios es gratis.",
    ],
  },
  {
    id: "cf-zt-02",
    q: ["How does Cloudflare Tunnel connect a private server?", "Comment Cloudflare Tunnel relie-t-il un serveur privé ?", "¿Cómo conecta Cloudflare Tunnel un servidor privado?"],
    a: ["`cloudflared` opens outbound connections to Cloudflare; no inbound port or public IP is needed", "`cloudflared` ouvre des connexions sortantes vers Cloudflare ; aucun port entrant ni IP publique n'est nécessaire", "`cloudflared` abre conexiones salientes hacia Cloudflare; no hace falta ningún puerto entrante ni IP pública"],
    w: [["It opens port 443 inbound on the server", "Il ouvre le port 443 en entrée sur le serveur", "Abre el puerto 443 de entrada en el servidor"], ["It needs a site-to-site IPsec VPN", "Il lui faut un VPN IPsec de site à site", "Necesita una VPN IPsec de sitio a sitio"], ["It requires a static public IP address", "Il exige une adresse IP publique fixe", "Exige una dirección IP pública fija"]],
    e: [
      "Requests come back down the connections `cloudflared` opened, so the server can stay behind a firewall that refuses all inbound traffic. Nobody can reach the origin without going through Cloudflare and its policies.",
      "Les requêtes redescendent par les connexions que `cloudflared` a ouvertes : le serveur peut rester derrière un pare-feu qui refuse tout trafic entrant. Personne ne peut atteindre l'origine sans passer par Cloudflare et ses stratégies.",
      "Las peticiones vuelven por las conexiones que abrió `cloudflared`, así que el servidor puede quedarse tras un firewall que rechaza todo tráfico entrante. Nadie puede llegar al origen sin pasar por Cloudflare y sus políticas.",
    ],
  },
  {
    id: "cf-zt-03",
    q: ["Up to how many users is Cloudflare Zero Trust free?", "Jusqu'à combien d'utilisateurs Cloudflare Zero Trust est-il gratuit ?", "¿Hasta cuántos usuarios es gratis Cloudflare Zero Trust?"],
    a: ["50", "50", "50"],
    w: [["5", "5", "5"], ["10", "10", "10"], ["Unlimited", "Illimité", "Ilimitados"]],
    e: [
      "The free plan suits teams under 50 users or a proof of concept. Beyond that, pay-as-you-go costs USD 7 per user per month, billed yearly, and larger organisations sign a contract.",
      "Le plan gratuit convient aux équipes de moins de 50 personnes ou à une preuve de concept. Au-delà, le paiement à l'usage coûte 7 USD par utilisateur et par mois, facturé à l'année, et les grandes organisations signent un contrat.",
      "El plan gratuito sirve para equipos de menos de 50 personas o una prueba de concepto. Por encima, el pago por uso cuesta 7 USD por usuario y mes, facturado al año, y las organizaciones grandes firman un contrato.",
    ],
  },
  {
    id: "cf-zt-04",
    q: ["What was the Cloudflare One Client called before?", "Comment s'appelait le Cloudflare One Client auparavant ?", "¿Cómo se llamaba antes el Cloudflare One Client?"],
    a: ["WARP", "WARP", "WARP"],
    w: [["Spectrum", "Spectrum", "Spectrum"], ["Argo", "Argo", "Argo"], ["Magic WAN", "Magic WAN", "Magic WAN"]],
    e: [
      "The client enrols a device in your organisation, sends its DNS and traffic to Gateway, and reports its posture (disk encryption, OS version) for Access policies. Spectrum proxies other TCP and UDP ports; Argo speeds up routing to origins; Magic WAN connects whole networks.",
      "Le client inscrit un appareil dans ton organisation, envoie son DNS et son trafic à Gateway, et rapporte son état (chiffrement du disque, version du système) pour les stratégies d'Access. Spectrum proxifie d'autres ports TCP et UDP ; Argo accélère le routage vers les origines ; Magic WAN relie des réseaux entiers.",
      "El cliente inscribe un dispositivo en tu organización, envía su DNS y su tráfico a Gateway e informa de su estado (cifrado del disco, versión del sistema) para las políticas de Access. Spectrum proxifica otros puertos TCP y UDP; Argo acelera el enrutamiento hacia los orígenes; Magic WAN conecta redes enteras.",
    ],
  },
];

const aiBasics: CfQuestion[] = [
  {
    id: "cf-ai-01",
    q: ["How is Workers AI billed?", "Comment Workers AI est-il facturé ?", "¿Cómo se factura Workers AI?"],
    a: ["In Neurons: 10,000 free each day, then USD 0.011 per 1,000 on Workers Paid", "En Neurons : 10 000 gratuits chaque jour, puis 0,011 USD les 1 000 avec Workers Paid", "En Neurons: 10 000 gratis cada día, luego 0,011 USD cada 1000 con Workers Paid"],
    w: [["By the GPU-hour, reserved in advance", "À l'heure de GPU, réservée à l'avance", "Por hora de GPU, reservada de antemano"], ["A flat USD 5 a month for unlimited inference", "Un forfait de 5 USD par mois pour une inférence illimitée", "Una tarifa plana de 5 USD al mes por inferencia ilimitada"], ["Per token, with no free allocation", "Au token, sans allocation gratuite", "Por token, sin asignación gratuita"]],
    e: [
      "Neurons measure the GPU work of a request; each model's page also gives its price per million input and output tokens. The free allocation is daily and resets at 00:00 UTC; on Workers Free, usage stops there.",
      "Les Neurons mesurent le travail GPU d'une requête ; la page de chaque modèle donne aussi son prix par million de tokens d'entrée et de sortie. L'allocation gratuite est quotidienne et repart à 00:00 UTC ; avec Workers Free, l'usage s'arrête là.",
      "Los Neurons miden el trabajo de GPU de una petición; la página de cada modelo da también su precio por millón de tokens de entrada y de salida. La asignación gratuita es diaria y se reinicia a las 00:00 UTC; con Workers Free, el uso se detiene ahí.",
    ],
  },
  {
    id: "cf-ai-02",
    q: ["Which models can AI Gateway sit in front of?", "Devant quels modèles AI Gateway peut-il se placer ?", "¿Delante de qué modelos puede ponerse AI Gateway?"],
    a: ["Workers AI and outside providers such as OpenAI, Anthropic or Google", "Workers AI et des fournisseurs externes comme OpenAI, Anthropic ou Google", "Workers AI y proveedores externos como OpenAI, Anthropic o Google"],
    w: [["Only Workers AI", "Seulement Workers AI", "Solo Workers AI"], ["Only models stored in Vectorize", "Seulement les modèles stockés dans Vectorize", "Solo los modelos guardados en Vectorize"], ["Only OpenAI", "Seulement OpenAI", "Solo OpenAI"]],
    e: [
      "AI Gateway is a proxy for model calls: it caches identical requests, limits rate and spend, retries and falls back to other models, applies guardrails and data loss prevention, and logs requests, tokens and costs, whatever the provider. Its core features are free.",
      "AI Gateway est un proxy pour les appels aux modèles : il met en cache les requêtes identiques, limite le débit et les dépenses, réessaie et bascule vers d'autres modèles, applique des garde-fous et la prévention des fuites de données, et journalise requêtes, tokens et coûts, quel que soit le fournisseur. Ses fonctions de base sont gratuites.",
      "AI Gateway es un proxy para las llamadas a modelos: guarda en caché peticiones idénticas, limita velocidad y gasto, reintenta y cambia a otros modelos, aplica salvaguardas y prevención de fugas de datos, y registra peticiones, tokens y costes, sea cual sea el proveedor. Sus funciones básicas son gratis.",
    ],
  },
  {
    id: "cf-ai-03",
    q: ["What does Vectorize store?", "Que stocke Vectorize ?", "¿Qué guarda Vectorize?"],
    a: ["Vectors (embeddings), to find the nearest ones to a query", "Des vecteurs (embeddings), pour trouver les plus proches d'une requête", "Vectores (embeddings), para encontrar los más cercanos a una consulta"],
    w: [["Images and videos", "Des images et des vidéos", "Imágenes y vídeos"], ["SQL tables", "Des tables SQL", "Tablas SQL"], ["The weights of AI models", "Les poids des modèles d'IA", "Los pesos de los modelos de IA"]],
    e: [
      "An embedding model turns a text into a vector; texts with similar meaning get nearby vectors. Vectorize returns the stored vectors closest to a query's, with optional metadata filters. That is the retrieval step of RAG.",
      "Un modèle d'embedding transforme un texte en vecteur ; des textes de sens proche ont des vecteurs proches. Vectorize renvoie les vecteurs stockés les plus proches de celui d'une requête, avec des filtres facultatifs sur les métadonnées. C'est l'étape de recherche du RAG.",
      "Un modelo de embedding convierte un texto en un vector; textos de significado parecido tienen vectores cercanos. Vectorize devuelve los vectores guardados más cercanos al de una consulta, con filtros opcionales por metadatos. Es el paso de búsqueda del RAG.",
    ],
  },
  {
    id: "cf-ai-04",
    q: ["What does retrieval-augmented generation (RAG) do?", "Que fait la génération augmentée par la recherche (RAG) ?", "¿Qué hace la generación aumentada por recuperación (RAG)?"],
    a: ["It finds the passages of your documents closest to the question and gives them to the model to answer from", "Elle trouve les passages de tes documents les plus proches de la question et les donne au modèle pour qu'il réponde à partir d'eux", "Encuentra los pasajes de tus documentos más cercanos a la pregunta y se los da al modelo para que responda a partir de ellos"],
    w: [["It retrains the model on your documents", "Elle réentraîne le modèle sur tes documents", "Reentrena el modelo con tus documentos"], ["It adds random noise to make answers varied", "Elle ajoute du bruit aléatoire pour varier les réponses", "Añade ruido aleatorio para variar las respuestas"], ["It caches the model's previous answers", "Elle met en cache les réponses précédentes du modèle", "Guarda en caché las respuestas anteriores del modelo"]],
    e: [
      "RAG keeps the model unchanged: documents are split and embedded once; at question time the closest passages are retrieved and put in the prompt. On Cloudflare, you build it with Workers AI and Vectorize, or let AI Search manage the whole pipeline.",
      "Le RAG ne change pas le modèle : les documents sont découpés et transformés en vecteurs une fois ; au moment de la question, les passages les plus proches sont retrouvés et mis dans le prompt. Chez Cloudflare, on le construit avec Workers AI et Vectorize, ou on laisse AI Search gérer toute la chaîne.",
      "El RAG no cambia el modelo: los documentos se dividen y se convierten en vectores una vez; al llegar la pregunta se recuperan los pasajes más cercanos y se ponen en el prompt. En Cloudflare se construye con Workers AI y Vectorize, o se deja que AI Search gestione toda la cadena.",
    ],
  },
];

export const dns = { dnsBasics };
export const tls = { tlsBasics };
export const cache = { cacheBasics };
export const security = { securityBasics };
export const workers = { workersBasics };
export const storage = { storageBasics };
export const zeroTrust = { ztBasics };
export const ai = { aiBasics };
