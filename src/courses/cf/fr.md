# Cloudflare — un cours complet

## Comment utiliser ce cours

Ce cours vous mène de « que fait le nuage orange ? » jusqu'à construire et sécuriser une application complète sur Cloudflare : services réseau, sécurité, plateforme pour développeurs, Zero Trust et IA. Il suit la documentation actuelle pour développeurs (vérifiée en octobre 2026), et chaque chiffre susceptible de changer, comme les limites et les prix, renvoie à sa page dans les Sources.

**À qui il s'adresse.** Aux ingénieurs qui connaissent HTTP, DNS et TLS au niveau d'un développeur backend, et un peu de JavaScript ou de TypeScript pour les parties sur Workers. Aucune expérience préalable de Cloudflare n'est supposée.

**Comment il est organisé.** Onze parties en quatre blocs :

| Bloc | Parties | Ce que vous saurez faire ensuite |
|---|---|---|
| Fondations | 1 Fonctionnement de Cloudflare · 2 DNS · 3 SSL/TLS | Mettre un domaine sur Cloudflare en toute sécurité, chiffré de bout en bout |
| Services applicatifs | 4 Cache · 5 Règles et trafic · 6 Sécurité | Rendre un site rapide et le protéger avec des règles lisibles et testables |
| Plateforme pour développeurs | 7 Workers · 8 Stockage et état | Construire et déployer des applications full-stack en périphérie (edge) |
| Cloudflare One et IA | 9 Zero Trust · 10 IA · 11 Exploitation | Remplacer un VPN, exécuter des modèles et du RAG, tout gérer sous forme de code |

Chaque partie se termine par ce qu'il faut retenir. Les exercices à la fin proposent un laboratoire pratique par partie, avec un corrigé.

**Avec Luma.** Le QCM *🔶 Cloudflare* du groupe *Informatique* de Luma suit les mêmes parties sur quatre niveaux (Débutant à Expert), avec 124 questions rédigées et huit types de questions calculées (expressions de règles, ordre des phases, modes SSL/TLS, durées de cache, ingress de tunnel, politiques Access, factures Workers et Workers AI). Lisez une partie, puis faites le test correspondant : la revue des erreurs vous renvoie à l'idée manquée.

**Ce qu'il vous faut.**

- Un compte Cloudflare gratuit. La plus grande partie de ce cours fonctionne avec l'offre Free ; les fonctions payantes sont signalées.
- Un domaine que vous contrôlez, pour les parties 2 à 6 (un domaine de test bon marché suffit).
- Node.js 20 ou plus récent et Wrangler, l'outil en ligne de commande de Cloudflare, pour les parties 7, 8 et 10 : `npm create cloudflare@latest` crée un projet et l'installe.
- Pour la partie 9, une machine où installer `cloudflared` et le client WARP.

## Partie 1 — Fonctionnement de Cloudflare

Cloudflare est un proxy inverse réparti sur un seul réseau mondial : quand un nom d'hôte est proxifié, les visiteurs se connectent à Cloudflare et non à votre serveur, et chaque produit (cache, WAF, Workers, Access) est une étape que traverse la requête en route vers votre origine.

### Un seul réseau, tous les services partout

Le réseau est présent dans 348 villes de plus de 100 pays et s'interconnecte avec plus de 13 000 réseaux ; environ 95 % des internautes du monde se trouvent à moins de 50 ms de lui ([Cloudflare network](https://www.cloudflare.com/network/)). Deux choix de conception comptent pour tout ce qui suit :

- **Anycast.** Les mêmes adresses IP sont annoncées depuis chaque site. Les paquets d'un visiteur atteignent le centre de données le plus proche par le routage Internet ordinaire, sans astuce de DNS géographique. Si un site tombe, le routage déplace son trafic vers le suivant.
- **Chaque serveur exécute chaque service.** Il n'y a pas de « boîtiers WAF » ni de « boîtiers cache » : chaque machine exécute toute la pile, si bien qu'un Worker, une règle WAF ou une recherche dans le cache s'exécute dans le centre de données qui a reçu la requête.

### Comptes, zones et nuage orange

- Un **compte** regroupe vos utilisateurs, la facturation et les produits de niveau compte : Workers, stockage (R2, D1, KV), Zero Trust, IA.
- Une **zone** est un domaine sur Cloudflare (`example.com`) avec ses enregistrements DNS et ses réglages applicatifs. Chaque zone a sa propre offre : Free, Pro (20 USD par mois en facturation annuelle), Business (200 USD) ou un contrat (Enterprise) ([Plans](https://www.cloudflare.com/plans/)).
- Un enregistrement DNS est soit **proxifié** (nuage orange), soit **DNS seulement** (nuage gris). Proxifié : l'enregistrement répond avec les adresses anycast de Cloudflare, et le trafic HTTP passe par le proxy, avec tous les produits appliqués. DNS seulement : Cloudflare se contente de répondre au DNS avec votre adresse réelle, et aucun produit applicatif ne s'applique.

Cette dernière distinction explique la plupart des surprises des débutants : une règle WAF, une règle de cache ou une redirection n'a aucun effet sur un nom d'hôte en nuage gris, parce que le trafic ne touche jamais Cloudflare.

### La vie d'une requête

Une requête pour `https://www.example.com/shop?id=3` sur un nom d'hôte proxifié passe par ces étapes :

1. **DNS.** Le résolveur du visiteur interroge le DNS faisant autorité de Cloudflare et obtient une adresse anycast.
2. **Connexion.** Le visiteur se connecte au centre de données le plus proche. La protection DDoS au niveau réseau élimine le trafic d'attaque avant qu'il n'atteigne quoi que ce soit d'autre.
3. **TLS.** Cloudflare termine le TLS avec le certificat edge de la zone (partie 3).
4. **Les phases de règles.** La requête traverse les phases du Ruleset Engine, dans un ordre fixe (ci-dessous).
5. **Workers.** Si une route de Worker correspond, le Worker s'exécute. Les Workers s'exécutent devant le cache ; leurs sous-requêtes `fetch()` passent par lui ([How the cache works](https://developers.cloudflare.com/workers/reference/how-the-cache-works/)).
6. **Cache.** Une ressource cachable est servie depuis le cache si elle s'y trouve (un HIT) ; sinon Cloudflare la récupère auprès de l'origine (un MISS) et peut la stocker (partie 4).
7. **Origine.** Cloudflare se connecte à votre serveur, chiffré selon le mode SSL/TLS (partie 3).
8. **Phases de réponse.** Erreurs personnalisées, transformations des en-têtes de réponse, compression, puis journalisation.

Une requête peut s'arrêter tôt à deux endroits : une règle de sécurité qui la bloque ou la soumet à un défi, ou un HIT du cache. Seul ce qui passe les deux atteint votre origine.

### Le Ruleset Engine : un seul ordre pour toutes les règles

Presque chaque produit à base de règles (redirections, transformations, WAF, limitation de débit, règles de cache) est une **phase** d'un même moteur, avec le même langage de règles (partie 5). Les phases s'exécutent dans une séquence fixe ; la connaître répond à des questions comme « ma redirection passe-t-elle avant ma règle WAF ? » ([Phases list](https://developers.cloudflare.com/ruleset-engine/reference/phases-list/)). Côté requête, dans l'ordre :

| # | Phase | Produit |
|---|---|---|
| 1 | `http_request_dynamic_redirect` | Single Redirects |
| 2 | `http_request_sanitize` | Normalisation d'URL |
| 3 | `http_request_transform` | URL Rewrite Rules |
| 4 | interne | Waiting Room |
| 5 | `http_config_settings` | Configuration Rules |
| 6 | `http_request_origin` | Origin Rules |
| 7 | `http_request_firewall_custom` | Règles personnalisées du WAF |
| 8 | `http_ratelimit` | Règles de limitation de débit |
| 9 | `http_request_firewall_managed` | WAF Managed Rules |
| 10 | `http_request_sbfm` | Super Bot Fight Mode |
| 11 | interne | Contrôle Cloudflare Access |
| 12 | `http_request_redirect` | Bulk Redirects |
| 13 | `http_request_late_transform` | Request Header Transform Rules |
| 14 | `http_request_cache_settings` | Cache Rules |
| 15 | `http_request_snippets` | Snippets |
| 16 | `http_request_cloud_connector` | Cloud Connector |

API Shield et la protection DDoS HTTP s'insèrent aussi dans cette séquence (API Shield détecte tôt et atténue après la limitation de débit). Trois conséquences à retenir :

- Une **Single Redirect** s'exécute en premier, avant toute phase de sécurité : une requête redirigée n'est jamais vue par le WAF.
- Les **règles personnalisées** passent avant les **règles gérées** : une règle personnalisée qui saute ou bloque décide avant que les jeux de règles gérés ne s'exécutent.
- Les **Cache Rules** arrivent vers la fin, après la sécurité : une requête bloquée n'atteint jamais le cache.

**À retenir.** Proxifié signifie que chaque produit s'applique ; DNS seulement, qu'aucun ne s'applique. Anycast envoie chaque visiteur vers la plus proche des 348 villes, où chaque service s'exécute. Les règles s'exécutent dans un ordre de phases fixe, les redirections en premier et les réglages de cache en dernier.

## Partie 2 — DNS

Le DNS de Cloudflare est l'interrupteur qui décide quel trafic atteint le proxy : seuls les enregistrements A, AAAA et CNAME peuvent être proxifiés, et seuls les enregistrements proxifiés bénéficient des produits applicatifs.

### Configurer une zone

| Configuration | Fonctionnement | Offres |
|---|---|---|
| Complète (primaire) | Vous remplacez les serveurs de noms de votre registraire par les deux que Cloudflare attribue à la zone. Cloudflare fait autorité pour tout le domaine. | Toutes |
| CNAME (partielle) | Votre fournisseur DNS reste faisant autorité ; chaque nom d'hôte à proxifier est un CNAME vers `<hostname>.cdn.cloudflare.net`. | Business, Enterprise |
| Secondaire | Cloudflare sert des copies d'une zone tenue par un autre fournisseur (transferts de zone). | Enterprise |

La configuration complète est le cas normal et celui que suppose ce cours. Une configuration partielle ne peut pas proxifier l'apex à moins que votre fournisseur n'aplatisse les CNAME, et elle ne bénéficie pas de la protection DDoS au niveau DNS, puisque ce ne sont pas les serveurs de noms de Cloudflare qui répondent ([CNAME setup](https://developers.cloudflare.com/dns/zone-setups/partial-setup/)).

### Enregistrements et statut du proxy

- **Proxifié** (nuage orange) : la réponse est une adresse anycast de Cloudflare ; l'adresse de votre origine reste cachée. Seuls les enregistrements **A, AAAA et CNAME** peuvent être proxifiés ; MX, TXT et les autres sont toujours en DNS seulement ([Proxy status](https://developers.cloudflare.com/dns/proxy-status/)).
- **DNS seulement** (nuage gris) : la réponse est votre adresse réelle. À utiliser pour les services que le proxy HTTP ne peut pas transporter : SSH sur le port 22, un serveur de messagerie, un serveur de jeu.
- Si un enregistrement A ou AAAA d'un nom est proxifié, tous les enregistrements A et AAAA de ce nom sont traités comme proxifiés.
- Le proxy transporte HTTP sur les ports 80, 8080, 8880, 2052, 2082, 2086, 2095 et HTTPS sur 443, 2053, 2083, 2087, 2096, 8443. Les autres ports demandent Spectrum, ou un enregistrement DNS seulement ([Network ports](https://developers.cloudflare.com/fundamentals/reference/network-ports/)).

**Une erreur classique.** `mail.example.com` proxifié, avec l'enregistrement MX qui pointe vers lui : la messagerie tombe en panne, parce que SMTP ne peut pas traverser le proxy HTTP. Le nom d'hôte de messagerie doit être en DNS seulement.

**Une autre.** Cacher votre origine derrière le nuage orange alors qu'un enregistrement DNS seulement comme `direct.example.com` pointe vers le même serveur : n'importe qui peut lire son adresse et attaquer l'origine directement, en contournant le WAF. Les parties 6 et 9 montrent comment verrouiller l'origine.

### TTL

Les enregistrements proxifiés ont toujours le TTL **Auto**, fixé à 300 secondes. Les enregistrements DNS seulement peuvent aller de 60 secondes (30 sur Enterprise) à un jour ([TTL](https://developers.cloudflare.com/dns/manage-dns-records/reference/ttl/)). Comme un enregistrement proxifié répond avec les adresses de Cloudflare, changer l'IP de votre origine derrière lui prend effet immédiatement : les résolveurs des visiteurs continuent de pointer vers Cloudflare.

### Aplatissement des CNAME

La norme DNS interdit un CNAME à l'apex de la zone (`example.com`), parce que l'apex contient déjà les enregistrements SOA et NS. Cloudflare le permet par **aplatissement** (flattening) : il suit lui-même la chaîne de CNAME et répond avec les adresses A et AAAA finales. Une option aplatit tous les CNAME de la zone, pas seulement l'apex ; elle peut casser la vérification de domaine de tiers qui s'attendent à voir le CNAME lui-même. Une cible qui ne se résout en aucune adresse donne une réponse vide (NODATA) ([CNAME flattening](https://developers.cloudflare.com/dns/cname-flattening/)).

### DNSSEC

DNSSEC signe les réponses de la zone pour que les résolveurs puissent détecter les réponses falsifiées. Sur Cloudflare, cela se fait en deux étapes : l'activer dans le tableau de bord, ce qui signe la zone ; puis ajouter chez votre registraire l'**enregistrement DS** que Cloudflare affiche, ce qui relie la zone à la chaîne de confiance du parent. Si vous déplacez une zone ailleurs, retirez d'abord l'enregistrement DS, sinon les résolveurs qui valident rejetteront toutes les réponses.

### Exemple commenté

Une petite entreprise déplace `example.com` vers Cloudflare :

| Nom | Type | Contenu | Proxy |
|---|---|---|---|
| `example.com` | A | 203.0.113.10 | Proxifié |
| `www` | CNAME | `example.com` | Proxifié |
| `api` | A | 203.0.113.20 | Proxifié |
| `ssh` | A | 203.0.113.10 | DNS seulement |
| `example.com` | MX | `mail.example.com` (priorité 10) | DNS seulement (toujours) |
| `mail` | A | 198.51.100.5 | DNS seulement |
| `example.com` | TXT | `v=spf1 mx -all` | DNS seulement (toujours) |

L'enregistrement `ssh` expose 203.0.113.10, l'adresse de l'origine web. Mieux : placer SSH derrière Cloudflare Tunnel et Access (partie 9) et supprimer l'enregistrement.

**À retenir.** Seuls A, AAAA et CNAME peuvent être proxifiés, sur les ports HTTP et HTTPS listés. Les enregistrements proxifiés ont un TTL fixe de 300 secondes. Un enregistrement DNS seulement sur le même serveur qu'un enregistrement proxifié révèle votre origine.

## Partie 3 — SSL/TLS

Une requête proxifiée comporte deux connexions TLS, du visiteur à Cloudflare et de Cloudflare à l'origine ; le mode de chiffrement décide comment la seconde est établie, et **Full (strict)** est le seul mode à la fois chiffré et authentifié de bout en bout.

### Les modes de chiffrement

| Mode | Visiteur → Cloudflare | Cloudflare → origine | Certificat de l'origine vérifié |
|---|---|---|---|
| Off | HTTP uniquement | HTTP | — |
| Flexible | HTTP ou HTTPS | HTTP, toujours | — |
| Full | HTTP ou HTTPS | Même schéma que le visiteur | Non : n'importe quel certificat, même autosigné ou expiré |
| Full (strict) | HTTP ou HTTPS | Même schéma que le visiteur | Oui : une AC publique ou l'Origin CA de Cloudflare, valide, correspondant au nom d'hôte |
| Strict (SSL-only origin pull) | HTTP ou HTTPS | HTTPS, toujours | Oui |

Les nouvelles zones utilisent **Automatic SSL/TLS** : Cloudflare sonde l'origine et choisit le mode le plus sûr qu'elle prend en charge, sans jamais faire passer une zone à un mode plus faible. Cloudflare recommande Full ou Full (strict) ([Encryption modes](https://developers.cloudflare.com/ssl/origin-configuration/ssl-modes/)).

Pourquoi Flexible est dangereux : le visiteur voit un cadenas, mais la requête traverse Internet en clair de Cloudflare jusqu'à votre serveur. Pourquoi Full ne suffit pas : sans vérification du certificat, quiconque peut détourner la route vers votre origine peut se faire passer pour elle.

### La boucle de redirection

Le problème SSL le plus courant sur Cloudflare : la zone est en **Flexible**, et l'origine redirige HTTP vers HTTPS. Le visiteur demande `https://` ; Cloudflare interroge l'origine en HTTP ; l'origine répond « 301, allez en https » ; le navigateur redemande `https://`, et ainsi de suite (`ERR_TOO_MANY_REDIRECTS`). La solution est de donner un certificat à l'origine et de passer en Full (strict), pas de supprimer la redirection.

### Certificats edge : ce que voient les visiteurs

- **Universal SSL** (gratuit, automatique) : couvre l'apex et les sous-domaines de premier niveau, `example.com` et `*.example.com`. Il ne couvre **pas** `dev.www.example.com` ([Universal SSL limitations](https://developers.cloudflare.com/ssl/edge-certificates/universal-ssl/limitations/)).
- **Advanced Certificate Manager** (payant) : certificats pour des noms d'hôte choisis, choix de l'AC et de la validité, et **Total TLS**, qui émet un certificat pour chaque nom d'hôte proxifié, quelle que soit sa profondeur.
- **Certificats personnalisés** (Business et Enterprise) : téléversez les vôtres.

Réglages edge à faire sur chaque zone :

- **Always Use HTTPS** : redirige chaque requête `http://` vers `https://` en périphérie.
- **Version TLS minimale** : 1.2 pour la plupart des sites ; TLS 1.0 et 1.1 sont obsolètes.
- **TLS 1.3** : activé.
- **HSTS** : indique aux navigateurs de n'utiliser que HTTPS, pendant `max-age` secondes. Activez-le une fois que HTTPS fonctionne partout : un navigateur qui a vu HSTS refusera HTTP vers votre site jusqu'à son expiration, et `includeSubDomains` étend cela à tous les sous-domaines.

### Certificats d'origine : ce que voit Cloudflare

- **Cloudflare Origin CA** émet des certificats gratuits pour votre origine, jusqu'à 15 ans, avec des jokers sur un niveau et jusqu'à 200 noms. Seul Cloudflare leur fait confiance : ils fonctionnent derrière le nuage orange avec Full (strict), et les navigateurs les rejettent si un nom d'hôte passe en DNS seulement ([Origin CA](https://developers.cloudflare.com/ssl/origin-configuration/origin-ca/)).
- Un certificat public (Let's Encrypt, par exemple) fonctionne aussi avec Full (strict), et continue de fonctionner si vous désactivez un jour le proxy.

### Verrouiller l'origine sur Cloudflare

Une origine qui répond à tout le monde rend le WAF inutile : les attaquants trouvent son adresse et contournent Cloudflare. Trois façons de la fermer, de la plus faible à la plus forte :

1. **Filtrer l'origine sur les plages IP publiées de Cloudflare.** Simple, mais le trafic de n'importe quel client de Cloudflare provient aussi de ces plages.
2. **Authenticated Origin Pulls** (mTLS) : Cloudflare présente un certificat client et l'origine refuse les connexions sans lui. Le certificat global prouve seulement que la requête est passée par Cloudflare ; un certificat à vous, au niveau de la zone ou par nom d'hôte, prouve qu'elle est passée par **votre** zone ([Authenticated Origin Pulls](https://developers.cloudflare.com/ssl/origin-configuration/authenticated-origin-pull/explanation/)).
3. **Cloudflare Tunnel** (partie 9) : l'origine n'établit que des connexions sortantes vers Cloudflare et n'accepte aucun trafic entrant. Aucun port ouvert, rien à trouver.

**À retenir.** Utilisez Full (strict) avec un certificat Origin CA ou public. Flexible plus une redirection HTTPS à l'origine, c'est une boucle. Universal SSL couvre un niveau de sous-domaine. Verrouillez l'origine avec mTLS ou un tunnel.
## Partie 4 — Cache et performance

Par défaut, Cloudflare met en cache les fichiers statiques selon leur extension, et jamais le HTML ni le JSON ; tout le reste du travail sur le cache consiste à décider, avec les Cache Rules et les en-têtes, quoi stocker d'autre, pour combien de temps et sous quelle clé.

### Ce qui est mis en cache par défaut

- La mise en cache se décide par **extension de fichier**, pas par type MIME : images, vidéo, audio, polices, archives, PDF, CSS, JS et `robots.txt` sont mis en cache ; **le HTML et le JSON ne le sont pas** ([Default cache behavior](https://developers.cloudflare.com/cache/concepts/default-cache-behavior/)).
- Une réponse n'est **pas** mise en cache si elle porte `Cache-Control: private`, `no-store`, `no-cache` ou `max-age=0`, si elle pose un cookie (`Set-Cookie`), ou si la requête n'est pas un GET.
- Plus gros fichier cachable : 512 Mo sur Free, Pro et Business ; 5 Go sur Enterprise.
- Les ports 2052, 2053, 2082, 2083, 2086, 2087, 2095, 2096, 8880 et 8443 sont proxifiés mais pas mis en cache.

### Combien de temps : Edge TTL et Browser TTL

Deux horloges différentes :

- **Edge Cache TTL** : combien de temps Cloudflare garde l'objet. Par défaut, il suit le `Cache-Control` de l'origine (`s-maxage`, puis `max-age`) ou `Expires`. Sans en-têtes de cache, Cloudflare applique des valeurs par défaut selon le code de statut : **200, 206 et 301 pendant 120 minutes ; 302 et 303 pendant 20 minutes ; 404 et 410 pendant 3 minutes** ; rien d'autre n'est mis en cache.
- **Browser Cache TTL** : ce que Cloudflare indique au navigateur du visiteur. Par défaut **4 heures**. Cloudflare relève à cette valeur une valeur d'origine plus courte, et l'ajoute quand l'origine n'envoie pas d'en-tête ; « Respect existing headers » désactive ce comportement ([Edge and Browser TTL](https://developers.cloudflare.com/cache/how-to/edge-browser-cache-ttl/)).

L'Edge TTL le plus court que vous pouvez régler est de 2 heures sur Free, 1 heure sur Pro, 1 seconde sur Business et Enterprise. Purger le cache n'efface pas ce que les navigateurs ont déjà : un long Browser TTL sur un fichier que vous pourriez modifier est une promesse que vous ne pouvez pas reprendre. Utilisez des noms de fichiers versionnés (`app.3f9a1c.js`) avec de longs TTL, et des TTL courts sur le HTML qui les référence.

**`CDN-Cache-Control`** (et `Cloudflare-CDN-Cache-Control`) permet à l'origine de donner au CDN une durée de vie différente de celle du navigateur : `Cache-Control: max-age=60` pour les navigateurs, `CDN-Cache-Control: max-age=86400` pour la périphérie.

### Lire CF-Cache-Status

| Valeur | Signification |
|---|---|
| `HIT` | Servi depuis le cache de Cloudflare |
| `MISS` | Absent du cache ; récupéré auprès de l'origine (et stocké s'il est cachable) |
| `EXPIRED` | Était en cache mais périmé ; récupéré à nouveau auprès de l'origine |
| `REVALIDATED` | Copie périmée confirmée inchangée par l'origine (304) et servie |
| `STALE` / `UPDATING` | Copie périmée servie pendant que Cloudflare la rafraîchit |
| `BYPASS` | L'origine ou une règle a demandé à Cloudflare de ne pas mettre en cache (cookie, `no-cache`, règle de contournement) |
| `DYNAMIC` | Non éligible au cache par défaut (HTML, réponse d'API) |

Un site dont le HTML affiche `DYNAMIC` fait ce qu'il doit faire par défaut. Pour le mettre en cache, écrivez une Cache Rule.

### Cache Rules

Une Cache Rule est une expression (partie 5) plus des réglages : **Eligible for cache** (« tout mettre en cache ») ou **Bypass**, Edge TTL (respecter l'origine, remplacer, ou par code de statut), Browser TTL, clé de cache, servir du périmé, et d'autres. Les règles remplacent les anciennes Page Rules. Exemple : mettre en cache le HTML du blog pendant une heure en périphérie, mais jamais pour les utilisateurs connectés.

```
Expression: (http.host eq "www.example.com" and starts_with(http.request.uri.path, "/blog/") and not http.cookie contains "session=")
Then:       Eligible for cache; Edge TTL: override origin, 1 hour; Browser TTL: respect origin
```

### Clés de cache

La clé de cache décide quelles requêtes partagent un objet en cache. Par défaut, c'est le schéma, l'hôte, le chemin **et toute la chaîne de requête**, plus l'en-tête `Origin` et quelques en-têtes de transfert ([Cache keys](https://developers.cloudflare.com/cache/how-to/cache-keys/)). Ainsi `/logo.png?utm_source=mail` et `/logo.png?utm_source=ad` sont deux objets, deux MISS. Toutes les offres peuvent ignorer ou trier la chaîne de requête et séparer par type d'appareil dans une Cache Rule ; choisir des paramètres de requête, des en-têtes, des cookies ou l'hôte pour la clé est réservé à Enterprise.

### Purger

Toutes les offres peuvent purger par URL unique, tout, cache tag, nom d'hôte et préfixe. Les purges par URL unique sont les moins coûteuses : 800 URL par seconde sur Free. Les autres méthodes sont limitées à 5 requêtes par minute sur Free, 5 par seconde sur Pro, 10 sur Business, 50 sur Enterprise ([Purge cache](https://developers.cloudflare.com/cache/how-to/purge-cache/)). Une réponse 200 signifie que la purge a été acceptée, pas qu'elle est terminée ; vérifiez que la réponse suivante n'est plus un `HIT`.

### Moins d'allers-retours vers l'origine

- **Tiered Cache** : les centres de données en MISS interrogent un centre de données de **niveau supérieur** avant l'origine, si bien que seuls quelques sites la contactent. **Smart Tiered Cache** choisit le niveau supérieur le plus proche de votre origine et il est gratuit sur toutes les offres ([Tiered Cache](https://developers.cloudflare.com/cache/how-to/tiered-cache/)).
- **Cache Reserve** : un cache persistant construit sur R2, au-dessus du niveau supérieur. Les objets doivent avoir un TTL d'au moins 10 heures et un `Content-Length` ; ils restent 30 jours après leur dernière requête. 0,015 USD par Go-mois, 4,50 USD par million d'écritures, 0,36 USD par million de lectures ([Cache Reserve](https://developers.cloudflare.com/cache/advanced-configuration/cache-reserve/)).
- **Argo Smart Routing** : pour ce qui ne peut pas être mis en cache, achemine le trafic vers l'origine par les chemins les plus rapides de Cloudflare plutôt que par les chemins par défaut de l'Internet public.

### Exemple commenté

Une origine renvoie `/products` (HTML, sans `Cache-Control`) et `/img/shoe.jpg` (`Cache-Control: max-age=600`), sur l'offre Free avec les réglages par défaut.

- `/products` : `DYNAMIC`, jamais mis en cache ; chaque requête va à l'origine.
- `/img/shoe.jpg` : mis en cache en périphérie pendant 600 secondes, d'après l'en-tête de l'origine. Le navigateur reçoit 4 heures, parce que Cloudflare relève une valeur d'origine plus courte au Browser TTL par défaut.
- `/img/shoe.jpg?size=2` : une autre clé de cache, un MISS distinct.

**À retenir.** Les extensions décident du comportement par défaut ; le HTML et le JSON demandent une Cache Rule. Edge TTL et Browser TTL sont distincts. La chaîne de requête fait partie de la clé. Smart Tiered Cache est gratuit : activez-le.

## Partie 5 — Règles et trafic

Chaque produit de règles est la même paire, une **expression** qui sélectionne des requêtes et une **action** avec ses réglages ; apprendre une fois le langage de règles vous permet d'écrire aussi bien des redirections que des réécritures, des règles de cache ou des règles WAF.

### Le langage de règles

Une expression compare des **champs** de la requête à des **valeurs** au moyen d'**opérateurs**, dans une syntaxe inspirée de celle de Wireshark :

```
(http.host eq "shop.example.com" and http.request.uri.path wildcard "/admin/*") or ip.src in {192.0.2.0/24}
```

Les champs que vous utiliserez le plus :

| Champ | Exemple de valeur |
|---|---|
| `http.host` | `shop.example.com` |
| `http.request.uri.path` | `/admin/users` |
| `http.request.uri.query` | `page=2&sort=asc` |
| `http.request.full_uri` | `https://shop.example.com/admin/users?page=2` |
| `http.request.method` | `POST` |
| `ip.src` | `198.51.100.7` |
| `ip.src.country` | `CH` |
| `ip.src.asnum` | `13335` |
| `http.user_agent` | `Mozilla/5.0 …` |
| `http.cookie` | `session=abc; theme=dark` |
| `http.request.headers["x-api-key"]` | un tableau des valeurs de l'en-tête |
| `cf.bot_management.score` | 1 (bot) à 99 (humain) ; Bot Management |
| `cf.threat_score` | ancien score de réputation |

Opérateurs ([Operators](https://developers.cloudflare.com/ruleset-engine/rules-language/operators/)) :

| Opérateur | Signification | Remarque |
|---|---|---|
| `eq`, `ne` (`==`, `!=`) | égal, différent | sensible à la casse sur les chaînes |
| `lt`, `le`, `gt`, `ge` | comparaisons numériques |  |
| `contains` | sous-chaîne | sensible à la casse |
| `wildcard` | la valeur entière correspond à un motif avec `*` | **insensible à la casse** |
| `strict wildcard` | idem, sensible à la casse |  |
| `matches` (`~`) | expression régulière (regex Rust) | **Business et Enterprise uniquement** |
| `in` | dans un ensemble ou une liste : `{"GET" "HEAD"}`, `{10.0.0.0/8}`, `$my_list` |  |

Opérateurs logiques, du plus prioritaire au moins prioritaire : `not`, `and`, `xor`, `or`. Ainsi `a or b and c` signifie `a or (b and c)` : utilisez des parenthèses.

Les fonctions transforment des valeurs : `lower()`, `starts_with()`, `ends_with()`, `len()`, `concat()`, `url_decode()`, `regex_replace()`, `wildcard_replace()`, et `any()` / `all()` sur des tableaux, comme `any(http.request.headers["accept"][*] contains "json")`.

Trois pièges :

- `http.request.uri.path eq "/Admin"` ne correspond pas à `/admin` : la comparaison de chaînes est sensible à la casse. Utilisez `lower(http.request.uri.path) eq "/admin"`, ou `wildcard`.
- `http.request.uri.path contains "/api"` correspond aussi à `/static/api-docs.png`. Préférez `starts_with(http.request.uri.path, "/api/")`.
- Les noms d'en-têtes dans `http.request.headers` sont en minuscules.

### Redirections

- **Single Redirects** : une règle par motif, avec une cible statique ou dynamique construite par une expression, comme `concat("https://www.example.com", http.request.uri.path)`. Statut 301, 302, 303, 307 ou 308 ; option pour conserver la chaîne de requête. Elles s'exécutent en premier de toutes les phases.
- **Bulk Redirects** : listes de niveau compte de milliers d'URL source → cible, pour les migrations. Elles s'exécutent après les phases de sécurité.

301 et 308 sont permanents et mis en cache par les navigateurs ; 307 et 308 conservent la méthode et le corps d'un POST, 301 et 302 peuvent le changer en GET.

### Transformations, origines, configuration

| Produit | Ce qu'il change | Exemple |
|---|---|---|
| URL Rewrite Rules | Le chemin et la requête que voit l'origine ; l'URL du visiteur ne change pas | `/blog/42` servi depuis `/index.php?p=42` |
| Request Header Transform Rules | Les en-têtes envoyés à l'origine | ajouter `X-Client-Country: ${ip.src.country}` |
| Response Header Transform Rules | Les en-têtes envoyés au visiteur | ajouter `Strict-Transport-Security`, retirer `X-Powered-By` |
| Managed Transforms | Jeux d'en-têtes prêts à l'emploi | ajouter les en-têtes de localisation du visiteur ; retirer `X-Powered-By` |
| Origin Rules | Où va la requête : en-tête Host, SNI, enregistrement DNS (resolve override), port de destination | `/docs/*` vers une autre origine sur le port 8443 |
| Configuration Rules | Réglages de zone par requête : mode SSL, niveau de sécurité, Rocket Loader, Polish, et d'autres | désactiver Rocket Loader sur `/checkout` |
| Compression Rules | Gzip, Brotli, Zstandard par type de contenu | Zstandard pour `text/html` |
| Custom Errors | Votre page pour les erreurs de l'origine ou de Cloudflare | une page 502 à vos couleurs |

Une réécriture n'est pas une redirection : une redirection envoie au visiteur une nouvelle URL (un 3xx) ; une réécriture change seulement ce que reçoit l'origine, de façon invisible ([Rules overview](https://developers.cloudflare.com/rules/)). Ces produits remplacent les anciennes **Page Rules**, un motif avec plusieurs réglages ; le guide de migration de Cloudflare fait correspondre chaque réglage de Page Rule à sa règle moderne.

### Snippets : du code dans les règles

Les Snippets sont de courtes fonctions JavaScript attachées à une règle, pour une logique que les règles ne savent pas exprimer : poser un cookie, répartir un test A/B, signer un en-tête. Ils s'exécutent après les Cache Rules, en 5 ms et 2 Mo de mémoire au plus, avec au plus 32 Ko de code et 2 à 5 sous-requêtes ; 25 snippets sur Pro, 50 sur Business, 300 sur Enterprise, aucun sur Free ([Snippets](https://developers.cloudflare.com/rules/snippets/)). Tout ce qui est plus gros, avec état ou utilisant des bindings est un Worker (partie 7).

### Répartition de charge

Load Balancing répartit le trafic sur plusieurs origines et bascule quand l'une tombe. Le modèle a trois niveaux :

1. Un **load balancer** répond pour un nom d'hôte, comme `app.example.com`, et ordonne ses **pools**.
2. Un **pool** regroupe des **endpoints** (vos serveurs), souvent un pool par région ou par cloud, avec un minimum d'endpoints en bonne santé.
3. Un **monitor** sonde chaque endpoint (HTTP, HTTPS, TCP ; un chemin, un code attendu, un intervalle) et le marque en bonne santé ou non.

La **steering policy** choisit un pool parmi ceux en bonne santé : Standard (off/failover : le premier pool sain dans l'ordre ; ou aléatoire avec poids), Geo (pools par région ou pays), Dynamic (latence mesurée la plus faible), Proximity (le plus proche par coordonnées), et Least Outstanding Requests ([Steering policies](https://developers.cloudflare.com/load-balancing/understand-basics/traffic-steering/steering-policies/)). À l'intérieur d'un pool, l'**endpoint steering** choisit le serveur : aléatoire pondéré, hachage (collant par IP) ou least outstanding requests. Un load balancer proxifié ajoute l'affinité de session par cookie ; un load balancer DNS seulement se contente de répondre au DNS avec une adresse en bonne santé.

**À retenir.** `and` lie avant `or` ; `eq` et `contains` sont sensibles à la casse, `wildcard` ne l'est pas ; `matches` demande Business. Une redirection change l'URL, une réécriture non. Load balancer → pools → endpoints, avec des monitors qui décident de la santé.

## Partie 6 — Sécurité

La sécurité applicative sur Cloudflare est en couches : la protection DDoS est automatique, puis vos règles personnalisées, vos limites de débit, les jeux de règles gérés et la détection des bots s'exécutent dans cet ordre sur chaque requête proxifiée, et chaque couche peut arrêter la requête avant que la suivante ne la voie.

### Protection DDoS

La protection DDoS de couche réseau (L3/4) et HTTP (L7) est active pour chaque zone, sur chaque offre, et **sans limite de volume** : le trafic d'attaque ne vous est pas facturé. Les jeux de règles DDoS gérés détectent les attaques automatiquement ; vous pouvez ajuster leur sensibilité ou leur action, mais pas les désactiver. Le reste de cette partie traite des attaques qui ressemblent à des requêtes normales : injections, credential stuffing, scraping, abus.

### Règles personnalisées du WAF

Une règle personnalisée est une expression (partie 5) et une **action** :

| Action | Effet |
|---|---|
| Block | Renvoie 403 (ou votre réponse personnalisée) |
| Managed Challenge | Cloudflare choisit : un contrôle invisible, ou un défi si nécessaire. Le défi recommandé |
| JS Challenge / Interactive Challenge | Défis plus anciens, fixes |
| Skip | Fait sauter à la requête les règles personnalisées restantes, ou d'autres produits (règles gérées, limitation de débit, bots) |
| Log | Enregistre seulement ; Enterprise |

Les règles sont évaluées dans l'ordre ; la première action **terminale** (Block, un défi) met fin à l'évaluation. Free a 5 règles personnalisées, Pro 20, Business 100, Enterprise 1000 ; `matches` (regex) demande Business ([Custom rules](https://developers.cloudflare.com/waf/custom-rules/)). Les listes (listes d'IP, d'ASN, de noms d'hôte) gardent les règles courtes : `ip.src in $office_ips`.

Trois règles que veulent la plupart des sites :

```
# 1. Administration uniquement depuis le bureau
(starts_with(http.request.uri.path, "/wp-admin") and not ip.src in $office_ips)  →  Block

# 2. Défi sur les connexions depuis les pays que vous ne servez pas
(http.request.uri.path eq "/login" and not ip.src.country in {"CH" "FR" "DE" "IT" "ES"})  →  Managed Challenge

# 3. Laisser passer intacts les contrôles de santé d'un partenaire
(ip.src in $partner_ips and http.request.uri.path eq "/health")  →  Skip: all remaining custom rules, rate limiting, managed rules
```

### Règles de limitation de débit

Une règle de limitation de débit compte les requêtes qui correspondent à une expression, groupées par **caractéristiques** (l'IP par défaut), sur une **période** ; au-delà du seuil, elle applique une action pendant un **délai d'atténuation**.

| Offre | Règles | Comptage par | Période | Délai |
|---|---|---|---|---|
| Free | 1 | IP | 10 s | 10 s |
| Pro | 2 | IP | jusqu'à 1 min | jusqu'à 1 h |
| Business | 5 | IP, IP avec prise en charge du NAT | jusqu'à 10 min | jusqu'à 1 jour |
| Enterprise (Advanced Rate Limiting) | 100 | aussi en-têtes, cookies, requête, ASN, pays, JA3/JA4, champs du corps JSON, et plus | jusqu'à 65 535 s | jusqu'à 1 jour |

Les compteurs sont tenus **par centre de données**, pas globalement ([Request rate](https://developers.cloudflare.com/waf/rate-limiting-rules/request-rate/)) : un botnet réparti sur de nombreuses villes peut rester partout sous une limite par IP. La limitation de débit arrête les déluges venant de peu de sources ; les bots et les défis gérés traitent les attaques distribuées ([Rate limiting rules](https://developers.cloudflare.com/waf/rate-limiting-rules/)).

Exemple : au plus 5 POST vers `/login` par IP en 1 minute, puis blocage pendant 10 minutes. Requêtes comptées : `(http.request.uri.path eq "/login" and http.request.method eq "POST")` ; caractéristiques : IP ; période 60 s ; requêtes 5 ; action Block ; durée 600 s (Business, pour le délai de 10 minutes).

### Jeux de règles gérés

- **Cloudflare Free Managed Ruleset** : sur toutes les offres, vulnérabilités à fort impact (de la classe de Log4Shell).
- **Cloudflare Managed Ruleset** (Pro et au-delà) : les règles de Cloudflare contre les attaques courantes et les exploits propres aux CMS, mises à jour par l'équipe de Cloudflare.
- **Cloudflare OWASP Core Ruleset** : la version Cloudflare de l'OWASP CRS, qui fonctionne par **score**. Chaque règle qui correspond ajoute des points ; le total de la requête est comparé à un seuil : **60 pour Low, 40 pour Medium (par défaut), 25 pour High**. Le **niveau de paranoïa** (PL1 à PL4) choisit les règles qui s'exécutent : PL2 exécute les règles PL1 et PL2, et ainsi de suite ([OWASP concepts](https://developers.cloudflare.com/waf/managed-rules/reference/owasp-core-ruleset/concepts/)).
- **Détection des identifiants exposés / divulgués** : signale les connexions qui utilisent un nom d'utilisateur et un mot de passe connus par des fuites.

Les faux positifs se corrigent par une **exception** (une règle skip pour cet identifiant de règle sur ce chemin), pas en désactivant tout le jeu de règles. Déployez les nouvelles règles d'abord en Log quand vous le pouvez, puis passez en Block.

### Bots

| Produit | Offre | Ce qu'il apporte |
|---|---|---|
| Bot Fight Mode | Free | Un interrupteur : défi pour les bots détectés sur toute la zone |
| Super Bot Fight Mode | Pro, Business | Une action par catégorie : définitivement automatisé, probablement automatisé, bots vérifiés ; ressources statiques protégées ou non |
| Bot Management | Option Enterprise | Un **bot score** par requête, de 1 (certainement un bot) à 99 (certainement un humain), utilisable dans n'importe quelle règle ; empreintes JA3/JA4 ; identifiants de détection |

([Bot solutions](https://developers.cloudflare.com/bots/)). Les **bots vérifiés** (moteurs de recherche, supervision) sont des bons bots connus, que les règles laissent généralement passer : `cf.bot_management.verified_bot`. Les robots d'exploration d'IA peuvent être bloqués d'un interrupteur, ou gérés robot par robot avec AI Crawl Control.

**Turnstile** remplace les CAPTCHA sur vos formulaires, sur Cloudflare ou non : un widget (Managed, Non-interactive ou Invisible) donne un jeton au navigateur, et **votre serveur doit le valider** avec l'API siteverify avant de faire confiance au formulaire. Un jeton est valable 300 secondes et une seule fois ([Turnstile](https://developers.cloudflare.com/turnstile/)).

### API

**API Shield** protège les API JSON : découverte des endpoints, **validation de schéma** d'après votre fichier OpenAPI (mauvais types et champs inconnus bloqués), **validation des JWT**, **mTLS** pour des clients comme les applications mobiles ou les appareils, et règles de séquence qui détectent les appels hors de l'ordre attendu. Associez-le à une limitation de débit par clé d'API : `http.request.headers["x-api-key"]` comme caractéristique demande Advanced Rate Limiting.

### Exemple commenté : assembler les couches

Un endpoint de connexion attaqué par credential stuffing, offre Business :

1. Règle personnalisée : Managed Challenge sur `/login` pour un `cf.threat_score` élevé ou les pays que vous ne servez pas.
2. Limitation de débit : 5 POST par IP et par minute sur `/login`, blocage 10 minutes.
3. Règles gérées : Cloudflare Managed Ruleset et OWASP en Medium, avec détection des identifiants divulgués ; ajoutez un en-tête de requête pour que l'application impose un changement de mot de passe quand une paire divulguée est utilisée.
4. Super Bot Fight Mode : « définitivement automatisé » bloqué, « probablement automatisé » soumis à un défi.
5. Turnstile sur le formulaire de connexion lui-même, validé côté serveur.

**À retenir.** Règles personnalisées → limitation de débit → règles gérées → bots, dans cet ordre. Managed Challenge est le défi par défaut. Les compteurs de limitation de débit sont par centre de données. OWASP bloque sur un score cumulé, pas sur une seule règle. Validez les jetons Turnstile sur votre serveur.
## Partie 7 — Workers

Un Worker est du JavaScript, du TypeScript ou du WebAssembly qui s'exécute dans un isolat V8 dans chaque centre de données de Cloudflare, démarre en quelques millisecondes et atteint le stockage, les files d'attente et l'IA par des **bindings** plutôt que par des appels réseau ; c'est le centre de la plateforme pour développeurs.

### Le modèle d'exécution

- **Des isolats, pas des conteneurs.** Chaque Worker s'exécute dans un isolat V8, à plusieurs par processus. Pas de démarrage à froid au sens des conteneurs : le démarrage est limité à 1 seconde et prend en général quelques millisecondes.
- **API standard du Web.** `fetch`, `Request`, `Response`, `URL`, Streams, Web Crypto ; avec le drapeau `nodejs_compat`, la plupart des API de Node (`node:crypto`, `node:buffer`, `node:stream`…).
- **Sans état entre les requêtes.** Un isolat peut servir de nombreuses requêtes, ou être jeté à tout moment. Ne gardez jamais de données propres à une requête dans des variables de module : la requête suivante, peut-être celle d'un autre utilisateur, les verra. L'état vit dans le stockage (partie 8).
- **Où il s'exécute.** Par défaut, dans le centre de données qui a reçu la requête. **Smart Placement** déplace un Worker qui fait de nombreux allers-retours vers un même backend (une base de données dans une région) près de ce backend.

### Un premier Worker

```ts
export interface Env {
  GREETINGS: KVNamespace;      // un binding KV
  API_TOKEN: string;           // un secret
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname === "/hello") {
      const name = url.searchParams.get("name") ?? "world";
      const greeting = (await env.GREETINGS.get("greeting")) ?? "Hello";
      ctx.waitUntil(logVisit(env, name));            // après la réponse, sans la retarder
      return Response.json({ message: `${greeting}, ${name}!` });
    }
    return new Response("Not found", { status: 404 });
  },
};
```

Le module exporte des **handlers** : `fetch` pour HTTP, `scheduled` pour les Cron Triggers, `queue` pour les consommateurs de Queues, `email` pour Email Routing. `env` porte les bindings, les variables et les secrets ; `ctx.waitUntil()` garde le Worker en vie pour un travail de fond après la réponse.

### Wrangler et le fichier de configuration

```jsonc
// wrangler.jsonc
{
  "name": "hello-api",
  "main": "src/index.ts",
  "compatibility_date": "2026-10-27",
  "compatibility_flags": ["nodejs_compat"],
  "observability": { "enabled": true },
  "placement": { "mode": "smart" },
  "assets": { "directory": "./public" },
  "kv_namespaces": [{ "binding": "GREETINGS", "id": "<namespace id>" }],
  "triggers": { "crons": ["0 3 * * *"] },
  "env": {
    "staging": { "name": "hello-api-staging", "routes": ["staging.example.com/*"] }
  }
}
```

- **`compatibility_date`** fige le comportement du runtime à une date : une nouvelle version du runtime ne change jamais votre Worker tant que vous ne déplacez pas la date. Mettez la date du jour sur un nouveau projet, et mettez-la à jour délibérément.
- Les **secrets** ne vont jamais dans ce fichier ni dans le code : `wrangler secret put API_TOKEN` les stocke chiffrés. Les `vars` simples servent aux réglages non secrets.
- Les **environnements** (`env.staging`) déploient le même code comme un Worker séparé, avec son propre nom, ses routes et ses bindings : `wrangler deploy --env staging`.
- Commandes à connaître : `wrangler dev` (local, port 8787, avec des simulations locales de KV, D1, R2), `wrangler deploy`, `wrangler tail` (journaux en direct), `wrangler versions` et les déploiements progressifs (envoyer 10 % du trafic vers une nouvelle version, puis 100 %).

Cloudflare a aussi un CLI plus récent, `cf`, en bêta, avec un fichier de configuration TypeScript (`cloudflare.config.ts`) et `cf migrate` pour convertir un projet Wrangler ; certaines commandes, comme `tail` et `secret put`, passent encore par Wrangler ([cf CLI](https://developers.cloudflare.com/cf/wrangler/reference/)). Ce cours utilise Wrangler.

### Comment un Worker reçoit du trafic

- **workers.dev** : `hello-api.<your-subdomain>.workers.dev`, pour le développement.
- **Custom Domain** : le Worker *est* l'origine de `api.example.com` ; Cloudflare crée l'enregistrement DNS et le certificat. La zone doit être sur Cloudflare.
- **Route** : le Worker s'exécute devant une origine existante pour un motif comme `example.com/api/*`, et peut appeler `fetch(request)` pour transmettre la requête.

### Ressources statiques et applications full-stack

Les Workers servent directement des fichiers statiques : placez-les dans le répertoire `assets` et ils sont servis depuis la périphérie, gratuitement et sans limite, avant l'exécution de votre code (ou après, avec `run_worker_first`). Cloudflare recommande désormais **Workers avec ressources statiques** plutôt que Pages pour les nouveaux sites, les applications monopages et les frameworks full-stack (React Router, Next.js via OpenNext, Astro, SvelteKit) ([Best practices](https://developers.cloudflare.com/workers/best-practices/workers-best-practices/)). Les Workers ont des fonctions que Pages n'a pas : Cron Triggers, consommateurs de Queues, Durable Objects, déploiements progressifs, Workers Logs ([Migrate from Pages](https://developers.cloudflare.com/workers/static-assets/migration-guides/migrate-from-pages/)).

### Limites et tarifs

|  | Workers Free | Workers Paid (5 USD par mois minimum) |
|---|---|---|
| Requêtes | 100 000 par jour | 10 millions par mois inclus, puis 0,30 USD par million |
| Temps CPU par requête | 10 ms | 30 s par défaut, jusqu'à 5 min ; 30 millions de ms CPU par mois inclus, puis 0,02 USD par million |
| Mémoire | 128 Mo par isolat | 128 Mo par isolat |
| Sous-requêtes par invocation | 50 | 10 000 par défaut |
| Taille du Worker | 64 Mio non compressé | 64 Mio non compressé |
| Workers par compte | 100 | 500 |

**C'est le temps CPU qui est facturé, pas le temps écoulé** : un Worker qui attend 2 secondes une API lente n'utilise presque pas de CPU. Le trafic sortant n'est pas facturé, et les requêtes de ressources statiques sont gratuites ([Pricing](https://developers.cloudflare.com/workers/platform/pricing/), [Limits](https://developers.cloudflare.com/workers/platform/limits/)).

### Observabilité

Activez **Workers Logs** (`observability.enabled`) et journalisez en JSON structuré ; ajoutez les Traces avant la production. `wrangler tail` diffuse les journaux en direct ; les **Tail Workers** reçoivent les journaux et exceptions de chaque invocation pour les transmettre ailleurs ; **Logpush** les exporte vers un stockage.

**À retenir.** Des isolats, pas des conteneurs ; pas d'état par requête dans des globales. Des bindings, pas des appels REST. Les secrets avec `wrangler secret put`. C'est le temps CPU qui est limité et facturé. Nouveaux sites : Workers avec ressources statiques.

## Partie 8 — Stockage et état

Les Workers sont sans état, donc chaque application choisit où vit son état ; le choix porte surtout sur la **cohérence** : KV est rapide et à cohérence éventuelle, R2 et D1 sont des stockages fortement cohérents, et les Durable Objects donnent à chaque élément d'état un seul propriétaire à fil unique.

### Choisir

| Produit | Ce que c'est | Cohérence | À utiliser pour | À éviter pour |
|---|---|---|---|---|
| Workers KV | Stockage clé-valeur global, mis en cache en périphérie | Éventuelle : jusqu'à 60 s ou plus pour être vue ailleurs | Configuration, feature flags, sessions bien plus lues qu'écrites | Compteurs, tout ce qui est écrit souvent ou demande une lecture après écriture |
| R2 | Stockage d'objets compatible S3, sans frais de sortie | Forte, par objet | Fichiers, images, sauvegardes, jeux de données, journaux | Petites valeurs lues et écrites à chaque requête |
| D1 | Bases SQLite serverless, jusqu'à 10 Go chacune | Forte (un primaire) ; réplicas de lecture en option | Données relationnelles : utilisateurs, commandes, catalogues | Bases très grosses ou très chargées en écriture |
| Durable Objects | Un objet nommé de façon unique, avec du code et un stockage SQLite privé | Forte, transactionnelle, à fil unique | Coordination : salons de discussion, compteurs, limiteurs de débit, sessions de jeu, état par utilisateur, WebSockets | Grosses requêtes analytiques sur tous les objets |
| Queues | File de messages entre Workers | Livraison au moins une fois | Tâches de fond, mise en tampon, diffusion (fan-out) | Travail requête/réponse |
| Workflows | Programmes durables en plusieurs étapes, avec reprises et pauses | Résultat de chaque étape persisté | Chaînes de commandes, séquences d'accueil, tâches d'IA, tout ce qui attend des heures ou des jours | Traitement de requêtes en moins d'une seconde |
| Hyperdrive | Pool de connexions et cache vers votre propre Postgres ou MySQL | Celle de votre base ; les lectures en cache peuvent être périmées | Garder une base existante | Nouveaux projets sans base existante |

([Storage options](https://developers.cloudflare.com/workers/platform/storage-options/))

### Workers KV

Les écritures vont vers des stockages centraux ; les lectures sont servies depuis des caches dans chaque site. Un changement « peut prendre jusqu'à 60 secondes ou plus » pour être visible ailleurs, et même relire sa propre écriture n'est pas garanti ([How KV works](https://developers.cloudflare.com/kv/concepts/how-kv-works/)). Au plus **une écriture par seconde sur une même clé** ; valeurs jusqu'à 25 Mio, clés jusqu'à 512 octets ([KV limits](https://developers.cloudflare.com/kv/platform/limits/)).

```ts
await env.FLAGS.put("checkout-v2", "on", { expirationTtl: 3600 });
const flag = await env.FLAGS.get("checkout-v2", { cacheTtl: 300 });   // lecture, en cache local 5 min
```

Le piège : un compteur de pages vues dans KV. Deux sites lisent 41 et écrivent tous deux 42, et la limite d'une écriture par seconde est atteinte aussitôt. Un compteur est un Durable Object.

### R2

Des objets dans des buckets, via le binding ou l'API S3, **sans frais de sortie**. Le stockage Standard coûte 0,015 USD par Go-mois, 4,50 USD par million d'écritures (Classe A), 0,36 USD par million de lectures (Classe B) ; les 10 premiers Go, 1 million d'opérations de Classe A et 10 millions de Classe B sont gratuits chaque mois. Le stockage Infrequent Access coûte 0,01 USD par Go-mois mais facture 0,01 USD par Go récupéré ([R2 pricing](https://developers.cloudflare.com/r2/pricing/)). Un bucket peut être public via un domaine personnalisé, ce qui place le cache de Cloudflare devant lui ; les URL présignées donnent un accès limité dans le temps aux objets privés.

### D1

SQLite avec des migrations et un binding :

```ts
const { results } = await env.DB
  .prepare("SELECT id, total FROM orders WHERE customer_id = ? ORDER BY created_at DESC LIMIT 10")
  .bind(customerId)
  .all();
```

Liez toujours les paramètres (`?`), ne concaténez jamais de chaînes : c'est ainsi que naissent les injections SQL. Une base fait jusqu'à 10 Go sur Workers Paid (500 Mo sur Free), et vous pouvez en avoir des milliers, par exemple une par client. Chaque base exécute **une requête à la fois** : avec des requêtes de 1 ms, elle en sert au plus environ 1000 par seconde, avec des requêtes de 100 ms, 10 ([D1 limits](https://developers.cloudflare.com/d1/platform/limits/)). Indexez ce sur quoi vous filtrez, et regroupez les instructions avec `db.batch()`. La réplication en lecture ajoute des copies en lecture seule près des utilisateurs, utilisées par l'API Sessions pour qu'un utilisateur relise toujours ses propres écritures.

### Durable Objects

Une classe de Durable Object est du code ; chaque **instance** a un nom unique au monde et vit en un seul endroit à la fois. Toutes les requêtes pour `room:lobby` atteignent la même instance, qui les traite une à la fois, avec son propre stockage SQLite transactionnel ([What are Durable Objects](https://developers.cloudflare.com/durable-objects/concepts/what-are-durable-objects/)).

```ts
export class Counter extends DurableObject {
  async increment(): Promise<number> {
    const value = ((await this.ctx.storage.get<number>("value")) ?? 0) + 1;
    await this.ctx.storage.put("value", value);
    return value;
  }
}

// dans le Worker
const stub = env.COUNTER.get(env.COUNTER.idFromName("page:/home"));
const views = await stub.increment();       // RPC vers l'unique instance de ce nom
```

Pas de course : deux incréments ne peuvent pas s'entrelacer, parce qu'une seule instance les exécute à tour de rôle. Autres capacités : les **alarmes** réveillent un objet à une heure donnée ; les **WebSockets** avec l'API Hibernation gardent des milliers de clients connectés à un objet à faible coût. La règle de conception : un objet par unité de coordination (un salon, un document, un utilisateur), jamais un objet pour toute l'application, ce qui en ferait un goulet d'étranglement à fil unique.

### Queues

Un producteur appelle `env.JOBS.send({ orderId })` ; le handler `queue()` du Worker consommateur reçoit des **lots** (jusqu'à 100 messages, ou après une attente d'au plus 60 secondes). La livraison est **au moins une fois** : rendez les consommateurs idempotents. Un message qui échoue est retenté (jusqu'à 100 fois), puis envoyé dans une **dead letter queue** si elle est configurée. Messages jusqu'à 128 Ko, 5000 par seconde par file, conservés jusqu'à 14 jours ([Queues limits](https://developers.cloudflare.com/queues/platform/limits/)).

### Workflows

Un Workflow est un programme dont les étapes survivent aux pannes : le résultat de chaque `step.do()` est enregistré, si bien qu'après un plantage l'instance reprend après la dernière étape terminée au lieu de recommencer.

```ts
export class Onboarding extends WorkflowEntrypoint<Env, { userId: string }> {
  async run(event: WorkflowEvent<{ userId: string }>, step: WorkflowStep) {
    const user = await step.do("load user", () => loadUser(this.env, event.payload.userId));
    await step.do("send welcome", { retries: { limit: 3, delay: "30 seconds", backoff: "exponential" } },
      () => sendEmail(user, "welcome"));
    await step.sleep("wait a week", "7 days");
    await step.do("send tips", () => sendEmail(user, "tips"));
  }
}
```

Par défaut, une étape est retentée 5 fois, à 10 secondes d'intervalle avec un recul exponentiel, chaque tentative expirant au bout de 10 minutes ; levez `NonRetryableError` pour échouer immédiatement ([Sleeping and retrying](https://developers.cloudflare.com/workflows/build/sleeping-and-retrying/)). Un Workflow en pause ne coûte rien.

### Hyperdrive

Un Worker qui se connecte directement à une base située dans une région paie plusieurs allers-retours pour établir chaque connexion. Hyperdrive établit la connexion près du Worker, garde un **pool** de connexions chaudes près de la base, et peut mettre en **cache** les requêtes de lecture. Il n'invalide pas le cache quand vous écrivez : utilisez une seconde configuration Hyperdrive, sans cache, pour les lectures qui doivent être fraîches ([How Hyperdrive works](https://developers.cloudflare.com/hyperdrive/concepts/how-hyperdrive-works/)). Combinez-le avec Smart Placement pour que le Worker lui-même s'exécute près de la base.

**À retenir.** KV : éventuelle, une écriture par seconde et par clé. R2 : des objets, sans frais de sortie. D1 : SQLite, une requête à la fois par base. Durable Objects : un propriétaire à fil unique par nom, pour tout ce qui ne doit pas subir de course. Queues : au moins une fois, donc des consommateurs idempotents. Workflows : des étapes qui survivent aux plantages.

## Partie 9 — Zero Trust

Cloudflare One remplace le VPN et le pare-feu du bureau par des contrôles dans le réseau de Cloudflare : **Access** décide qui peut atteindre vos applications, **Tunnel** les connecte sans ouvrir de port, et **Gateway** filtre ce que vos utilisateurs atteignent sur Internet, le **Cloudflare One Client** (anciennement WARP) y acheminant le trafic d'un appareil.

Zero Trust signifie qu'aucune requête n'est digne de confiance du fait de sa provenance (le réseau du bureau, le VPN) : chacune est contrôlée sur l'identité, l'appareil et le contexte. Jusqu'à 50 utilisateurs c'est gratuit ; au-delà, le paiement à l'usage coûte 7 USD par utilisateur et par mois, en facturation annuelle ([Access](https://www.cloudflare.com/sase/products/access/)).

### Les briques

| Composant | Sens | Ce qu'il fait |
|---|---|---|
| Fournisseurs d'identité | — | Qui est l'utilisateur : Google, Microsoft Entra ID, Okta, GitHub, tout fournisseur SAML ou OIDC, ou un code à usage unique par courriel |
| Access | Utilisateurs → vos applications | Une connexion et un contrôle de politique devant chaque application, web ou non (SSH, RDP, bases de données) |
| Tunnel (`cloudflared`) | Vos applications → Cloudflare | Connexion sortante uniquement depuis votre réseau ; pas de port entrant, pas d'IP publique |
| Cloudflare One Client | Appareil → Cloudflare | Envoie le DNS et le trafic d'un appareil vers Gateway ; rend compte de la posture de l'appareil |
| Gateway | Utilisateurs → Internet et réseau privé | Filtrage DNS, réseau et HTTP : bloquer les logiciels malveillants, des catégories, l'exfiltration de données |
| Posture de l'appareil | — | Contrôle un appareil : chiffrement du disque, version de l'OS, client actif, EDR présent |

Les utilisateurs, avec ou sans le client, n'atteignent les applications internes qu'à travers Access ; les appareils enrôlés envoient leur propre trafic via Gateway, qui achemine aussi les IP privées dans le tunnel.

### Access

Une **application Access** protège un nom d'hôte (`grafana.example.com`) ou un chemin. Chacune a des **politiques** ; chaque politique a une action et des règles :

- **Actions** : **Allow**, **Block**, **Bypass** (aucun contrôle Access, rien n'est journalisé : seulement pour des ressources publiques comme un contrôle de santé), **Service Auth** (pour les machines : jetons de service ou mTLS, sans connexion).
- **Règles** : **Include** (OU : une seule suffit), **Require** (ET : toutes doivent correspondre), **Exclude** (NON : la moindre correspondance refuse). Chaque politique demande au moins un Include.
- **Ordre** : les politiques Bypass et Service Auth sont évaluées en premier, puis Allow et Block, chacune de haut en bas ; la première Allow ou Block qui correspond décide. Ce qui ne correspond à rien est **refusé par défaut** ([Access policies](https://developers.cloudflare.com/cloudflare-one/access-controls/policies/)).

Exemple : les ingénieurs peuvent atteindre le panneau d'administration depuis un portable géré, les prestataires jamais.

```
Policy "Engineers", Allow
  Include:  Emails ending in @example.com
  Require:  Login method is Okta;  Device posture: disk encrypted
  Exclude:  Group "contractors"

Policy "Deploy bot", Service Auth
  Include:  Service token "ci-deployer"
```

La tâche de CI envoie deux en-têtes, `CF-Access-Client-Id` et `CF-Access-Client-Secret`, et passe sans connexion.

Après la connexion, Access envoie à l'application un JWT signé dans l'en-tête `Cf-Access-Jwt-Assertion`. **Votre application doit le valider** : récupérez les clés sur `https://<team>.cloudflareaccess.com/cdn-cgi/access/certs` et vérifiez la revendication `aud` par rapport à l'étiquette AUD de l'application ([Validate JWTs](https://developers.cloudflare.com/cloudflare-one/access-controls/applications/http-apps/authorization-cookie/validating-json/)). Sinon, quiconque atteint l'origine par un autre chemin est considéré comme fiable.

### Tunnel

`cloudflared` s'exécute à côté de vos services et ouvre des connexions **sortantes** vers deux centres de données de Cloudflare ; les requêtes redescendent par ces connexions. L'origine n'a besoin ni d'IP publique ni de port entrant ouvert, et personne ne peut contourner Cloudflare pour l'atteindre. Les tunnels gérés à distance se configurent dans le tableau de bord ou par API ; les tunnels gérés localement lisent un fichier :

```yaml
tunnel: 6ff42ae2-765d-4adf-8112-31c55c1551ef
credentials-file: /etc/cloudflared/6ff42ae2.json
ingress:
  - hostname: app.example.com
    service: http://localhost:8080
  - hostname: app.example.com
    path: ^/api/
    service: http://localhost:9000      # jamais atteinte : la règle du dessus a correspondu d'abord
  - hostname: ssh.example.com
    service: ssh://localhost:22
  - service: http_status:404             # règle fourre-tout obligatoire, en dernier
```

Les règles sont comparées **de haut en bas, la première qui correspond l'emporte**, et le fichier **doit se terminer par une règle fourre-tout** sans nom d'hôte ([Configuration file](https://developers.cloudflare.com/tunnel/advanced/local-management/configuration-file/)). Dans l'exemple, la règle `/api/` est morte : placez les règles les plus précises en premier. Exécutez deux répliques `cloudflared` ou plus du même tunnel pour la disponibilité. Un tunnel peut aussi transporter des routes de **réseau privé** (`10.0.0.0/16`), si bien que les appareils enrôlés atteignent les IP internes comme avec un VPN, sous les politiques réseau de Gateway.

### Gateway

Gateway filtre les requêtes DNS, le trafic réseau et les requêtes HTTP des appareils qui exécutent le client, ou des bureaux qui lui envoient leur DNS ou leur trafic. Les types de politiques s'appliquent dans cet ordre : DNS (avant la résolution, puis politiques de résolveur, puis DNS après la résolution), egress, **réseau**, puis **HTTP** ; à l'intérieur d'un type, la première politique qui correspond dans l'ordre de priorité l'emporte ([Order of enforcement](https://developers.cloudflare.com/cloudflare-one/traffic-controls/order-of-enforcement/)).

- **Politiques DNS** : bloquer par domaine, catégorie (logiciels malveillants, hameçonnage, contenu pour adultes), application ; les moins coûteuses à déployer, un réglage DNS suffit.
- **Politiques réseau** : par IP, port, protocole, SNI ; pour les réseaux privés derrière des tunnels.
- **Politiques HTTP** : par URL, type de fichier, application, avec analyse antivirus et prévention des pertes de données. Inspecter HTTPS demande le **déchiffrement TLS** et le certificat racine de Cloudflare installé sur les appareils ; les politiques « Do Not Inspect » exemptent les banques, les sites de santé et les applications qui épinglent leurs certificats.
- **Browser Isolation** exécute les sites risqués dans un navigateur distant et n'envoie à l'appareil que le rendu.

### Le Cloudflare One Client

Le client (anciennement WARP) enrôle un appareil dans votre organisation et fonctionne dans l'un de plusieurs modes : **Traffic and DNS** (par défaut : tout vers Gateway), **DNS only**, **Traffic only**, **Posture only** (aucun trafic, seulement des contrôles d'appareil pour Access) et **Local proxy** ([Client modes](https://developers.cloudflare.com/cloudflare-one/team-and-resources/devices/cloudflare-one-client/configure/modes/)). Le **split tunneling** choisit quelles destinations passent par Cloudflare (listes d'inclusion ou d'exclusion).

### Exemple commenté : remplacer un VPN

1. Installer `cloudflared` dans le centre de données ; acheminer `10.20.0.0/16` par le tunnel et publier `wiki.example.com` et `grafana.example.com` comme noms d'hôte.
2. Connecter Okta comme fournisseur d'identité.
3. Créer une application Access par application web, avec une politique Allow pour le bon groupe et un contrôle de posture.
4. Déployer le Cloudflare One Client par MDM en mode Traffic and DNS ; politique réseau Gateway : seul le groupe `engineering` atteint `10.20.0.0/16` sur les ports 22 et 5432.
5. Politique DNS Gateway : bloquer les menaces de sécurité pour tout le monde.
6. Fermer le port entrant du VPN et les règles de pare-feu qui le servaient.

**À retenir.** Access : Include = OU, Require = ET, Exclude = NON ; refus par défaut ; Bypass saute tout. Validez le JWT d'Access dans l'application. Tunnel : sortant uniquement, la première correspondance l'emporte, fourre-tout en dernier. Gateway : DNS, puis réseau, puis HTTP ; l'inspection HTTPS demande le certificat racine.
## Partie 10 — IA

La pile IA de Cloudflare, c'est la plateforme pour développeurs plus quatre pièces : **Workers AI** exécute des modèles ouverts sur les GPU de Cloudflare, **AI Gateway** se place devant n'importe quel fournisseur de modèles pour mettre en cache, limiter et journaliser, **Vectorize** et **AI Search** s'occupent de la recherche de passages (retrieval), et le **Agents SDK** donne à chaque agent un état durable sur un Durable Object.

### Les pièces

| Produit | Ce qu'il fait | Comment l'atteindre |
|---|---|---|
| Workers AI | Inférence sur GPU serverless : LLM, embeddings, image, parole, traduction | `env.AI.run(model, input)` |
| AI Gateway | Un proxy vers Workers AI, OpenAI, Anthropic, Google et d'autres : cache, limites de débit et de dépense, reprises et solutions de repli, garde-fous, DLP, journaux | Une URL de passerelle, ou les options `gateway` de `env.AI.run` |
| Vectorize | Base vectorielle : stocker des embeddings, chercher les plus proches voisins avec des filtres de métadonnées | `env.VECTORS.upsert()`, `.query()` |
| AI Search | Retrieval géré (RAG) : indexe vos données en continu, recherche hybride, génération de réponse en option | `env.AI_SEARCH`, API REST ou MCP |
| Agents SDK | Des agents sous forme de Durable Objects : état, WebSockets, planification, outils, MCP | `class MyAgent extends Agent` |
| Browser Rendering | Navigateurs sans interface pour les agents : captures d'écran, PDF, scraping | binding ou API REST |
| AI Crawl Control | Voir et contrôler quels robots d'IA lisent votre site | tableau de bord, WAF |

([Cloudflare AI](https://developers.cloudflare.com/ai/))

### Workers AI

```ts
const answer = await env.AI.run("@cf/meta/llama-3.3-70b-instruct-fp8-fast", {
  messages: [
    { role: "system", content: "Answer in one sentence." },
    { role: "user", content: "What is anycast?" },
  ],
});
```

L'usage se mesure en **Neurons** : 10 000 par jour sont gratuits sur toutes les offres ; au-delà, Workers Paid coûte 0,011 USD pour 1000 Neurons. Les prix par modèle sont aussi donnés par million de tokens : par exemple 0,045 USD en entrée et 0,384 USD en sortie pour Llama 3.1 8B (fp8, fast), 0,293 USD en entrée et 2,253 USD en sortie pour Llama 3.3 70B ([Workers AI pricing](https://developers.cloudflare.com/workers-ai/platform/pricing/)). Choisissez le plus petit modèle qui fait le travail : l'entrée du modèle 8B est environ 6,5 fois moins chère que celle du 70B.

### AI Gateway

Placez une passerelle entre votre application et chaque fournisseur, même quand le modèle n'est pas sur Cloudflare. Ses fonctions de base sont gratuites ([AI Gateway pricing](https://developers.cloudflare.com/ai-gateway/reference/pricing/)) :

- **Cache** des requêtes identiques : la clé est un hachage du fournisseur, de l'endpoint, du modèle, de l'en-tête d'authentification et du corps entier, si bien qu'un seul caractère changé donne un MISS. Par requête, `cf-aig-cache-ttl` fixe la durée de vie (60 secondes à un mois), `cf-aig-skip-cache` contourne le cache, `cf-aig-cache-key` fixe votre propre clé ; `cf-aig-cache-status` indique `HIT` ou `MISS` ([Caching](https://developers.cloudflare.com/ai-gateway/features/caching/)).
- **Limitation de débit** (fenêtre fixe ou glissante) et **limites de dépense** par modèle, fournisseur ou métadonnée.
- **Routage dynamique** : reprises et solutions de repli, comme « essayer le modèle A, en cas d'erreur ou de délai dépassé utiliser le modèle B », configurées sans code ; **Auto Router** envoie chaque requête au modèle le moins cher capable de la traiter.
- **Guardrails** et **DLP** : modérer les invites et les réponses, repérer des données personnelles ou financières.
- **BYOK** : les clés des fournisseurs stockées par Cloudflare, pas dans votre code ; **Unified Billing** paie les fournisseurs avec des crédits Cloudflare (5 % de frais sur les crédits).
- **Journaux et statistiques** : requêtes, tokens, coût, erreurs par fournisseur ([Features](https://developers.cloudflare.com/ai-gateway/features/)).

### Retrieval : Vectorize et AI Search

La génération augmentée par récupération (RAG) répond à partir de vos documents : on les transforme en embeddings, on trouve les passages les plus proches de la question, et on les donne au modèle.

**Le faire soi-même** avec Workers AI et Vectorize. Un index a une dimension fixe (jusqu'à 1536) et une métrique (cosinus, euclidienne, produit scalaire), contient jusqu'à 20 millions de vecteurs, 10 Kio de métadonnées chacun, avec jusqu'à 10 champs de métadonnées indexés pour les filtres ; une requête renvoie au plus 50 résultats avec métadonnées, 100 sans ([Vectorize limits](https://developers.cloudflare.com/vectorize/platform/limits/)).

```ts
// indexer un passage
const { data } = await env.AI.run("@cf/baai/bge-base-en-v1.5", { text: [passage] });   // 768 dimensions
await env.VECTORS.upsert([{ id: docId, values: data[0], metadata: { url, lang: "en" } }]);

// répondre à une question
const q = await env.AI.run("@cf/baai/bge-base-en-v1.5", { text: [question] });
const { matches } = await env.VECTORS.query(q.data[0], { topK: 5, returnMetadata: "all", filter: { lang: "en" } });
const context = await loadPassages(matches.map((m) => m.id));
const reply = await env.AI.run("@cf/meta/llama-3.3-70b-instruct-fp8-fast", {
  messages: [
    { role: "system", content: `Answer only from these passages:\n${context}` },
    { role: "user", content: question },
  ],
});
```

La dimension de l'index doit être égale à celle du modèle d'embeddings : 768 pour ce modèle. Un écart est l'erreur Vectorize la plus fréquente.

**Ou laisser faire AI Search** : faites pointer une instance vers vos données, et elle découpe, calcule les embeddings et réindexe en continu, avec une recherche hybride (sémantique et par mots-clés), des filtres de métadonnées et l'OCR pour les PDF numérisés ([AI Search](https://developers.cloudflare.com/ai-search/)) :

```ts
const docs = env.AI_SEARCH.get("handbook");
const hits = await docs.search({ messages: [{ role: "user", content: "How many vacation days?" }] });
const answer = await docs.chatCompletions({
  model: "@cf/meta/llama-3.3-70b-instruct-fp8-fast",
  messages: [{ role: "user", content: "How many vacation days?" }],
  ai_search_options: { retrieval: { max_num_results: 5 }, query_rewrite: { enabled: true } },
});
```

([Workers binding](https://developers.cloudflare.com/ai-search/api/search/workers-binding/)). Choisissez AI Search pour obtenir vite des réponses ; choisissez Vectorize quand vous voulez maîtriser le découpage, les modèles ou le classement.

### Agents

Un **agent** est un Durable Object : chaque utilisateur ou conversation a sa propre instance, avec un état qui survit aux redémarrages, des connexions WebSocket vers ses clients et du travail planifié ([Agent class](https://developers.cloudflare.com/agents/runtime/lifecycle/agent-class/)).

```ts
export class Support extends Agent<Env, { tickets: number }> {
  initialState = { tickets: 0 };

  @callable()
  async openTicket(text: string) {
    this.sql`INSERT INTO tickets (text, at) VALUES (${text}, ${Date.now()})`;
    this.setState({ tickets: this.state.tickets + 1 });     // enregistré, et poussé aux clients connectés
    await this.schedule(86400, "followUp", { text });        // dans 24 heures
  }

  async followUp({ text }: { text: string }) { /* demander au modèle un courriel de suivi */ }
}
```

`setState` enregistre et diffuse ; `this.sql` interroge le SQLite propre à l'agent ; `schedule` exécute une méthode après un délai, à une date ou selon un cron ; `@callable()` expose une méthode aux clients par RPC sur WebSocket. Les agents peuvent appeler des modèles (via AI Gateway), des outils, d'autres agents et des serveurs MCP, et confier les longues tâches à des Workflows. Cloudflare héberge aussi des **serveurs MCP** sur Workers, avec Access ou OAuth devant, pour que des clients d'IA externes utilisent vos outils en toute sécurité.

**À retenir.** Workers AI est facturé en Neurons, 10 000 gratuits par jour. AI Gateway devant chaque fournisseur : mettre en cache, limiter, basculer, journaliser. Dimension Vectorize = dimension des embeddings. AI Search est un RAG géré. Un agent est un Durable Object avec un état, des sockets et des planifications.

## Partie 11 — Exploitation

Une fois qu'une configuration fonctionne, gardez-la sous forme de code : tout ce qui est dans le tableau de bord a une API, Terraform la gère avec des changements relus, des jetons d'API à portée restreinte limitent ce que chaque outil peut toucher, et les journaux et statistiques vous disent ce qui s'est passé.

### Jetons d'API

- Utilisez des **jetons d'API**, jamais l'ancienne Global API Key, qui peut faire tout ce que peut votre utilisateur.
- Donnez à chaque jeton seulement les **permissions** nécessaires (« Zone → DNS → Edit », « Account → Workers Scripts → Edit ») sur seulement les **ressources** nécessaires (une zone, un compte).
- Restreignez-le aux **plages IP** de votre CI et donnez-lui une **date d'expiration** : par défaut, un jeton n'expire jamais ([Restrict tokens](https://developers.cloudflare.com/fundamentals/api/how-to/restrict-tokens/)).
- Préférez des **jetons détenus par le compte** pour l'automatisation, afin qu'une chaîne de déploiement ne s'arrête pas quand la personne qui a créé son jeton s'en va.

```sh
curl https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records \
  -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN"
```

### Terraform

Le provider Cloudflare (version 5, publié toutes les deux à trois semaines) couvre les zones, le DNS, les rulesets, les Workers, Access, les tunnels et la plupart des autres produits ([Terraform v5.20.0](https://developers.cloudflare.com/changelog/post/2026-06-12-terraform-v5.20.0-provider/)). `cf-terraforming` génère la configuration et les commandes d'import pour ce qui existe déjà.

```hcl
resource "cloudflare_dns_record" "www" {
  zone_id = var.zone_id
  name    = "www"
  type    = "CNAME"
  content = "example.com"
  proxied = true
  ttl     = 1            # 1 = automatique
}

resource "cloudflare_ruleset" "custom_waf" {
  zone_id = var.zone_id
  name    = "Custom rules"
  kind    = "zone"
  phase   = "http_request_firewall_custom"
  rules = [{
    description = "Admin only from the office"
    expression  = "(starts_with(http.request.uri.path, \"/admin\") and not ip.src in $office_ips)"
    action      = "block"
  }]
}
```

Notez qu'un ruleset possède **toutes** les règles de sa phase pour cette zone : une règle ajoutée à la main dans le tableau de bord est supprimée au prochain `terraform apply`. Décidez phase par phase si elle est gérée par Terraform ou par des personnes, pas les deux.

Les Workers sont en général déployés par Wrangler depuis la CI (`wrangler deploy` avec `CLOUDFLARE_API_TOKEN` et `CLOUDFLARE_ACCOUNT_ID` définis), ou par Workers Builds, qui déploie à chaque push vers un dépôt Git connecté.

### Journaux et statistiques

| Outil | Ce qu'il donne | Quand |
|---|---|---|
| Statistiques du tableau de bord | Trafic, taux de cache, menaces, par zone | Coup d'œil quotidien |
| Security Events | Chaque requête sur laquelle une règle de sécurité a agi, avec l'identifiant de la règle | Réglage des règles WAF, faux positifs |
| GraphQL Analytics API | Les mêmes données, interrogeables | Vos propres tableaux de bord |
| Instant Logs | Flux en direct des requêtes HTTP | Déboguer maintenant |
| Logpush | Journaux de requêtes, événements de pare-feu, traces de Workers et plus, poussés vers R2, S3, un SIEM… | Conservation et enquête |
| Workers Logs, Traces | Les journaux et durées de vos Workers | Déboguer les Workers |

Depuis le 30 septembre 2026, Logpush est disponible sur toutes les offres avec une tarification à l'usage : 25 Go par mois inclus, puis 0,03 USD par Go vers R2 et Pipelines, 0,10 USD par Go vers des destinations externes ([Logpush changelog](https://developers.cloudflare.com/changelog/post/2026-09-30-logpush-usage-based-pricing/)).

### Coûts : d'où vient la facture

- **Zones** : l'offre de chaque zone (Free, Pro, Business) et les options (Advanced Certificate Manager, Load Balancing, Argo, Cache Reserve).
- **Plateforme pour développeurs** : Workers Paid (5 USD par mois) couvre l'usage inclus de Workers, KV, D1, Durable Objects et Queues ; au-delà, l'usage est facturé à la requête, à la ms CPU, à la ligne ou au Go. R2 n'a pas de frais de sortie.
- **Zero Trust** : par utilisateur au-delà de 50.
- **IA** : les Neurons au-delà de 10 000 par jour ; les tokens des fournisseurs via AI Gateway.

Configurez des **notifications de facturation** et, pour les Workers, une limite CPU par Worker (`limits.cpu_ms`), pour qu'un bogue ne puisse pas faire exploser la facture.

### Architecture de référence

Une application SaaS entièrement construite sur Cloudflare : les visiteurs atteignent `app.example.com` à travers les couches de sécurité et de cache ; un Worker sert le front-end depuis des ressources statiques et l'API depuis D1, R2 et des Durable Objects ; les tâches de fond passent par Queues et Workflows ; les fonctions d'IA appellent Workers AI ou des modèles externes via AI Gateway ; l'équipe atteint les outils internes par Access et un Tunnel, jamais par un port public.

**À retenir.** Des jetons d'API à portée restreinte, qui expirent, détenus par le compte. Terraform par phase, sans mélange avec le tableau de bord. Logpush est désormais sur toutes les offres. Configurez des notifications de facturation.

## Exercices

Un laboratoire par partie, sur un domaine de test et un compte gratuit, puis des questions pour vous contrôler. Les réponses suivent.

### Laboratoires

- [ ] **Labo 1 (parties 1–2).** Ajoutez un domaine de test en configuration complète. Créez `www` proxifié et `direct` en DNS seulement vers le même serveur. Lancez `dig www.<domain>` et `dig direct.<domain>` : notez quelle réponse montre l'adresse de votre serveur.
- [ ] **Labo 2 (partie 3).** Installez un certificat Origin CA sur l'origine, passez en Full (strict), activez Always Use HTTPS et un TLS minimal de 1.2. Puis réglez Flexible avec une redirection HTTP vers HTTPS à l'origine et observez la boucle ; revenez en arrière.
- [ ] **Labo 3 (partie 4).** Demandez une image trois fois avec `curl -sI` et lisez `CF-Cache-Status`. Écrivez une Cache Rule qui met en cache le HTML de `/blog/*` pendant une heure sauf si un cookie `session` est présent ; vérifiez `MISS`, puis `HIT`, puis `BYPASS` avec le cookie.
- [ ] **Labo 4 (partie 5).** Écrivez une Single Redirect de `example.com/*` vers `https://www.example.com/*` qui conserve le chemin et la requête, et une Response Header Transform Rule qui retire `X-Powered-By`.
- [ ] **Labo 5 (partie 6).** Créez une règle personnalisée qui bloque `/admin` hors d'une liste d'IP, et une règle de limitation de débit sur `/login`. Déclenchez les deux ; retrouvez-les dans Security Events avec leurs identifiants de règle.
- [ ] **Labo 6 (partie 7).** `npm create cloudflare@latest`, écrivez un Worker avec un handler `fetch` et un répertoire statique `public/`, déployez-le sur un Custom Domain, et lancez `wrangler tail` pendant que vous l'appelez.
- [ ] **Labo 7 (partie 8).** Ajoutez une base D1 avec une table `orders` et une migration, un compteur de pages vues en Durable Object, et une Queue dont le consommateur écrit dans R2. Faites échouer le consommateur une fois et observez la reprise.
- [ ] **Labo 8 (partie 9).** Lancez `cloudflared` dans Docker devant une application web locale, sans port ouvert ; protégez-la par une application Access qui n'autorise que votre adresse, et validez `Cf-Access-Jwt-Assertion` dans l'application.
- [ ] **Labo 9 (partie 10).** Créez un index Vectorize de 768 dimensions, calculez les embeddings de dix paragraphes avec `@cf/baai/bge-base-en-v1.5`, et répondez à des questions à partir d'eux ; faites passer l'appel au modèle par une AI Gateway avec cache et comparez `cf-aig-cache-status` sur une question répétée.
- [ ] **Labo 10 (partie 11).** Créez un jeton d'API à portée restreinte et qui expire ; importez le DNS de la zone avec `cf-terraforming` ; modifiez un enregistrement par un plan Terraform et appliquez-le.

### Contrôlez-vous

1. Une règle personnalisée du WAF bloque `/admin`, mais les requêtes vers `admin.example.com/admin` atteignent toujours le serveur. Que vérifiez-vous d'abord ?
2. Le mode SSL est Full et le certificat de l'origine a expiré hier. Les visiteurs voient-ils une erreur ?
3. Pourquoi le HTML n'est-il pas mis en cache par défaut, et qu'est-ce qui rend une page cachable ?
4. `http.request.uri.path eq "/Login"` ne correspond jamais. Pourquoi ?
5. Qu'est-ce qui s'exécute en premier, une Single Redirect ou une règle personnalisée du WAF ? Une Bulk Redirect ou une règle personnalisée du WAF ?
6. Une règle de limitation de débit autorise 100 requêtes par minute et par IP, mais un botnet de 10 000 IP en envoie 50 chacune. Qu'est-ce qui aide ?
7. Où gardez-vous un compteur de pages vues, et pourquoi pas dans KV ?
8. Un consommateur de Queue débite la carte d'un client. Quelle propriété doit-il avoir ?
9. Une politique Access a Include `@example.com` et Require pays `CH`. `ana@example.com` peut-elle se connecter depuis la France ?
10. L'ingress d'un tunnel a une règle fourre-tout en premier. Que se passe-t-il ?
11. Vous interrogez un index Vectorize de 1024 dimensions avec un embedding de 768 dimensions. Que se passe-t-il ?
12. Un ruleset géré par Terraform perd une règle qu'un collègue a ajoutée dans le tableau de bord. Pourquoi ?

### Réponses

1. Si `admin.example.com` est **proxifié**. Un enregistrement DNS seulement contourne tous les produits de Cloudflare. Ensuite, vérifiez l'hôte dans l'expression.
2. **Non** : Full ne valide pas le certificat de l'origine. C'est pourquoi il ne suffit pas ; Full (strict) renverrait une erreur 526.
3. Parce que le HTML est souvent personnel (panier, compte). Une Cache Rule avec *Eligible for cache*, et pas de `Set-Cookie` ni de `private` dans la réponse, ou un contournement pour les utilisateurs connectés.
4. `eq` est sensible à la casse : `/login` n'est pas `/Login`. Utilisez `lower(...)` ou `wildcard`.
5. La Single Redirect s'exécute en premier de toutes les phases ; la règle personnalisée du WAF s'exécute avant la Bulk Redirect.
6. Pas la limitation par IP : un défi géré ou Super Bot Fight Mode, les scores de Bot Management, ou un comptage par une autre caractéristique (un cookie de session, une clé d'API) avec Advanced Rate Limiting.
7. Dans un **Durable Object** : une seule instance traite les incréments à tour de rôle. KV est à cohérence éventuelle et accepte une écriture par seconde et par clé.
8. L'**idempotence** : Queues livre au moins une fois, donc le même message peut arriver deux fois. Enregistrez un identifiant de paiement et refusez les doublons.
9. **Non** : Require est un ET, donc le domaine de l'adresse et le pays doivent tous deux correspondre.
10. Toutes les requêtes y correspondent ; les règles suivantes ne servent jamais. Le fourre-tout doit être en dernier.
11. La requête échoue : la dimension du vecteur doit correspondre à celle de l'index. Créez l'index avec la dimension du modèle d'embeddings.
12. La ressource ruleset possède toutes les règles de cette phase ; `apply` rétablit l'état déclaré. Gérez une phase à un seul endroit.

## Sources

Toutes les pages ont été ouvertes le 27 octobre 2026. Les limites et les prix changent : vérifiez la page avant de vous fier à un chiffre.

| Partie | Pages |
|---|---|
| 1 | [Cloudflare network](https://www.cloudflare.com/network/) · [Plans](https://www.cloudflare.com/plans/) · [Ruleset Engine phases list](https://developers.cloudflare.com/ruleset-engine/reference/phases-list/) · [How the cache works (Workers)](https://developers.cloudflare.com/workers/reference/how-the-cache-works/) |
| 2 | [DNS setups](https://developers.cloudflare.com/dns/zone-setups/) · [CNAME setup](https://developers.cloudflare.com/dns/zone-setups/partial-setup/) · [Proxy status](https://developers.cloudflare.com/dns/proxy-status/) · [TTL](https://developers.cloudflare.com/dns/manage-dns-records/reference/ttl/) · [CNAME flattening](https://developers.cloudflare.com/dns/cname-flattening/) · [Network ports](https://developers.cloudflare.com/fundamentals/reference/network-ports/) |
| 3 | [Encryption modes](https://developers.cloudflare.com/ssl/origin-configuration/ssl-modes/) · [Universal SSL limitations](https://developers.cloudflare.com/ssl/edge-certificates/universal-ssl/limitations/) · [Origin CA](https://developers.cloudflare.com/ssl/origin-configuration/origin-ca/) · [Authenticated Origin Pulls](https://developers.cloudflare.com/ssl/origin-configuration/authenticated-origin-pull/explanation/) |
| 4 | [Default cache behavior](https://developers.cloudflare.com/cache/concepts/default-cache-behavior/) · [Edge and Browser TTL](https://developers.cloudflare.com/cache/how-to/edge-browser-cache-ttl/) · [Cache keys](https://developers.cloudflare.com/cache/how-to/cache-keys/) · [Purge cache](https://developers.cloudflare.com/cache/how-to/purge-cache/) · [Tiered Cache](https://developers.cloudflare.com/cache/how-to/tiered-cache/) · [Cache Reserve](https://developers.cloudflare.com/cache/advanced-configuration/cache-reserve/) |
| 5 | [Operators](https://developers.cloudflare.com/ruleset-engine/rules-language/operators/) · [Rules overview](https://developers.cloudflare.com/rules/) · [Origin Rules settings](https://developers.cloudflare.com/rules/origin-rules/features/) · [Snippets](https://developers.cloudflare.com/rules/snippets/) · [Steering policies](https://developers.cloudflare.com/load-balancing/understand-basics/traffic-steering/steering-policies/) |
| 6 | [Custom rules](https://developers.cloudflare.com/waf/custom-rules/) · [Rate limiting rules](https://developers.cloudflare.com/waf/rate-limiting-rules/) · [Request rate](https://developers.cloudflare.com/waf/rate-limiting-rules/request-rate/) · [OWASP concepts](https://developers.cloudflare.com/waf/managed-rules/reference/owasp-core-ruleset/concepts/) · [Bot solutions](https://developers.cloudflare.com/bots/) · [Turnstile](https://developers.cloudflare.com/turnstile/) |
| 7 | [Workers pricing](https://developers.cloudflare.com/workers/platform/pricing/) · [Workers limits](https://developers.cloudflare.com/workers/platform/limits/) · [Best practices](https://developers.cloudflare.com/workers/best-practices/workers-best-practices/) · [Migrate from Pages](https://developers.cloudflare.com/workers/static-assets/migration-guides/migrate-from-pages/) · [cf CLI](https://developers.cloudflare.com/cf/wrangler/reference/) |
| 8 | [Storage options](https://developers.cloudflare.com/workers/platform/storage-options/) · [How KV works](https://developers.cloudflare.com/kv/concepts/how-kv-works/) · [KV limits](https://developers.cloudflare.com/kv/platform/limits/) · [R2 pricing](https://developers.cloudflare.com/r2/pricing/) · [D1 limits](https://developers.cloudflare.com/d1/platform/limits/) · [Durable Objects](https://developers.cloudflare.com/durable-objects/concepts/what-are-durable-objects/) · [Queues limits](https://developers.cloudflare.com/queues/platform/limits/) · [Workflows retries](https://developers.cloudflare.com/workflows/build/sleeping-and-retrying/) · [Hyperdrive](https://developers.cloudflare.com/hyperdrive/concepts/how-hyperdrive-works/) |
| 9 | [Access (pricing)](https://www.cloudflare.com/sase/products/access/) · [Access policies](https://developers.cloudflare.com/cloudflare-one/access-controls/policies/) · [Validate JWTs](https://developers.cloudflare.com/cloudflare-one/access-controls/applications/http-apps/authorization-cookie/validating-json/) · [Tunnel configuration file](https://developers.cloudflare.com/tunnel/advanced/local-management/configuration-file/) · [Gateway order of enforcement](https://developers.cloudflare.com/cloudflare-one/traffic-controls/order-of-enforcement/) · [Client modes](https://developers.cloudflare.com/cloudflare-one/team-and-resources/devices/cloudflare-one-client/configure/modes/) |
| 10 | [Cloudflare AI](https://developers.cloudflare.com/ai/) · [Workers AI pricing](https://developers.cloudflare.com/workers-ai/platform/pricing/) · [AI Gateway features](https://developers.cloudflare.com/ai-gateway/features/) · [AI Gateway caching](https://developers.cloudflare.com/ai-gateway/features/caching/) · [AI Gateway pricing](https://developers.cloudflare.com/ai-gateway/reference/pricing/) · [Vectorize limits](https://developers.cloudflare.com/vectorize/platform/limits/) · [AI Search](https://developers.cloudflare.com/ai-search/) · [AI Search binding](https://developers.cloudflare.com/ai-search/api/search/workers-binding/) · [Agent class](https://developers.cloudflare.com/agents/runtime/lifecycle/agent-class/) |
| 11 | [Restrict tokens](https://developers.cloudflare.com/fundamentals/api/how-to/restrict-tokens/) · [Terraform v5.20.0](https://developers.cloudflare.com/changelog/post/2026-06-12-terraform-v5.20.0-provider/) · [Logpush on all plans](https://developers.cloudflare.com/changelog/post/2026-09-30-logpush-usage-based-pricing/) |
