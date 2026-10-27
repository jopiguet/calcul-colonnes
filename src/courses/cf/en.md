# Cloudflare — a complete course

## How to use this course

This course takes you from "what does the orange cloud do" to building and securing a full application on Cloudflare: network services, security, the developer platform, Zero Trust and AI. It follows the current developer documentation (checked October 2026), and every figure that can change, such as limits and prices, links to its page in Sources.

**Who it is for.** Engineers who know HTTP, DNS and TLS at the level of a backend developer, and some JavaScript or TypeScript for the Workers parts. No prior Cloudflare experience is assumed.

**How it is organised.** Eleven parts in four blocks:

| Block | Parts | What you can do after it |
|---|---|---|
| Foundations | 1 How Cloudflare works · 2 DNS · 3 SSL/TLS | Put a domain on Cloudflare safely, end to end encrypted |
| Application services | 4 Cache · 5 Rules and traffic · 6 Security | Make a site fast and protect it with rules you can read and test |
| Developer platform | 7 Workers · 8 Storage and state | Build and deploy full-stack applications at the edge |
| Cloudflare One and AI | 9 Zero Trust · 10 AI · 11 Operating it | Replace a VPN, run models and RAG, manage it all as code |

Each part ends with what to remember. The exercises at the end give one hands-on lab per part, with an answer key.

**With Luma.** The *🔶 Cloudflare* test in Luma's *Informatique* group follows the same parts at four levels (Débutant to Expert), with 124 written questions and eight kinds of computed ones (rule expressions, the phase order, SSL/TLS modes, cache lifetimes, tunnel ingress, Access policies, the Workers and Workers AI bills). Read a part, then take the test on it: the review of mistakes points back to the idea you missed.

**What you need.**

- A free Cloudflare account. Most of this course works on the Free plan; the paid features are marked.
- A domain you control, for Parts 2 to 6 (a cheap test domain is enough).
- Node.js 20 or later and Wrangler, Cloudflare's command-line tool, for Parts 7, 8 and 10: `npm create cloudflare@latest` scaffolds a project and installs it.
- For Part 9, a machine where you can install `cloudflared` and the WARP client.

## Part 1 — How Cloudflare works

Cloudflare is a reverse proxy spread over one global network: when a hostname is proxied, visitors connect to Cloudflare, not to your server, and every product (cache, WAF, Workers, Access) is a step that request passes through on the way to your origin.

### One network, every service everywhere

The network runs in 348 cities in more than 100 countries and interconnects with over 13,000 networks; about 95 % of the world's Internet users are within 50 ms of it ([Cloudflare network](https://www.cloudflare.com/network/)). Two design choices matter for everything that follows:

- **Anycast.** The same IP addresses are announced from every location. A visitor's packets reach the nearest data center by ordinary internet routing, with no geographic DNS tricks. If a location fails, routing moves its traffic to the next one.
- **Every server runs every service.** There are no "WAF boxes" or "cache boxes": each machine runs the full stack, so a Worker, a WAF rule or a cache lookup runs in the data center that received the request.

### Accounts, zones and the orange cloud

- An **account** holds your users, billing, and the account-level products: Workers, storage (R2, D1, KV), Zero Trust, AI.
- A **zone** is a domain on Cloudflare (`example.com`) with its DNS records and its application settings. Each zone has its own plan: Free, Pro (USD 20 a month billed yearly), Business (USD 200) or a contract (Enterprise) ([Plans](https://www.cloudflare.com/plans/)).
- A DNS record is either **proxied** (orange cloud) or **DNS-only** (grey cloud). Proxied: the record answers with Cloudflare's anycast addresses and HTTP traffic goes through the proxy, with every product applied. DNS-only: Cloudflare only answers DNS with your real address, and none of the application products apply.

That last distinction explains most beginner surprises: a WAF rule, a cache rule or a redirect has no effect on a grey-cloud hostname, because the traffic never touches Cloudflare.

### The life of a request

A request for `https://www.example.com/shop?id=3` on a proxied hostname goes through these stages:

1. **DNS.** The visitor's resolver asks Cloudflare's authoritative DNS and gets an anycast address.
2. **Connection.** The visitor connects to the nearest data center. Network-level DDoS protection drops attack traffic before it reaches anything else.
3. **TLS.** Cloudflare terminates TLS with the zone's edge certificate (Part 3).
4. **The rules phases.** The request runs through the Ruleset Engine's phases, in a fixed order (below).
5. **Workers.** If a Worker route matches, the Worker runs. Workers run in front of the cache; their `fetch()` subrequests go through it ([How the cache works](https://developers.cloudflare.com/workers/reference/how-the-cache-works/)).
6. **Cache.** A cacheable resource is served from cache if present (a HIT); otherwise Cloudflare fetches it from the origin (a MISS) and may store it (Part 4).
7. **Origin.** Cloudflare connects to your server, encrypted according to the SSL/TLS mode (Part 3).
8. **Response phases.** Custom errors, response header transforms, compression, then logging.

A request can end early at two points: a security rule that blocks or challenges it, or a cache HIT. Only what passes both reaches your origin.

### The Ruleset Engine: one order for all rules

Almost every rule-based product (redirects, transforms, WAF, rate limiting, cache rules) is a **phase** of one engine, with the same rules language (Part 5). The phases run in a fixed sequence, so knowing it answers questions like "does my redirect run before my WAF rule?" ([Phases list](https://developers.cloudflare.com/ruleset-engine/reference/phases-list/)). On the request, in order:

| # | Phase | Product |
|---|---|---|
| 1 | `http_request_dynamic_redirect` | Single Redirects |
| 2 | `http_request_sanitize` | URL normalization |
| 3 | `http_request_transform` | URL Rewrite Rules |
| 4 | internal | Waiting Room |
| 5 | `http_config_settings` | Configuration Rules |
| 6 | `http_request_origin` | Origin Rules |
| 7 | `http_request_firewall_custom` | WAF custom rules |
| 8 | `http_ratelimit` | Rate limiting rules |
| 9 | `http_request_firewall_managed` | WAF Managed Rules |
| 10 | `http_request_sbfm` | Super Bot Fight Mode |
| 11 | internal | Cloudflare Access check |
| 12 | `http_request_redirect` | Bulk Redirects |
| 13 | `http_request_late_transform` | Request Header Transform Rules |
| 14 | `http_request_cache_settings` | Cache Rules |
| 15 | `http_request_snippets` | Snippets |
| 16 | `http_request_cloud_connector` | Cloud Connector |

API Shield and HTTP DDoS protection also sit in this sequence (API Shield detects early and mitigates after rate limiting). Three consequences worth remembering:

- A **Single Redirect** runs first, before any security phase: a redirected request is never seen by the WAF.
- **Custom rules** run before **managed rules**: a custom rule that skips or blocks decides before the managed rulesets run.
- **Cache Rules** come near the end, after security: a blocked request never reaches the cache.

**What to remember.** Proxied means every product applies; DNS-only means none does. Anycast sends each visitor to the nearest of 348 cities, where every service runs. Rules run in one fixed phase order, with redirects first and cache settings last.

## Part 2 — DNS

Cloudflare's DNS is the switch that decides which traffic reaches the proxy: only A, AAAA and CNAME records can be proxied, and only proxied records get any of the application products.

### Setting up a zone

| Setup | How it works | Plans |
|---|---|---|
| Full (primary) | You replace your registrar's nameservers by the two Cloudflare assigns to the zone. Cloudflare is authoritative for the whole domain. | All |
| CNAME (partial) | Your DNS provider stays authoritative; each hostname you want proxied is a CNAME to `<hostname>.cdn.cloudflare.net`. | Business, Enterprise |
| Secondary | Cloudflare serves copies of a zone kept by another provider (zone transfers). | Enterprise |

A full setup is the normal case and the one this course assumes. A partial setup cannot proxy the apex unless your provider flattens CNAMEs, and it does not get DNS-level DDoS protection, since Cloudflare's nameservers are not the ones answering ([CNAME setup](https://developers.cloudflare.com/dns/zone-setups/partial-setup/)).

### Records and proxy status

- **Proxied** (orange cloud): the answer is a Cloudflare anycast address; your origin's address stays hidden. Only **A, AAAA and CNAME** records can be proxied; MX, TXT and the others are always DNS-only ([Proxy status](https://developers.cloudflare.com/dns/proxy-status/)).
- **DNS-only** (grey cloud): the answer is your real address. Use it for services the HTTP proxy cannot carry: SSH on port 22, a mail server, a game server.
- If one A or AAAA record on a name is proxied, all A and AAAA records on that name are treated as proxied.
- The proxy carries HTTP on ports 80, 8080, 8880, 2052, 2082, 2086, 2095 and HTTPS on 443, 2053, 2083, 2087, 2096, 8443. Other ports need Spectrum, or a DNS-only record ([Network ports](https://developers.cloudflare.com/fundamentals/reference/network-ports/)).

**A classic mistake.** `mail.example.com` proxied, with the MX record pointing to it: mail breaks, because SMTP cannot go through the HTTP proxy. The mail hostname must be DNS-only.

**Another one.** Hiding your origin behind the orange cloud while a DNS-only record such as `direct.example.com` points to the same server: anyone can read its address and attack the origin directly, bypassing the WAF. Part 6 and Part 9 show how to lock the origin down.

### TTL

Proxied records always have the TTL **Auto**, fixed at 300 seconds. DNS-only records can be set from 60 seconds (30 on Enterprise) to one day ([TTL](https://developers.cloudflare.com/dns/manage-dns-records/reference/ttl/)). Since a proxied record answers with Cloudflare's addresses, changing your origin's IP behind it takes effect at once: visitors' resolvers keep pointing to Cloudflare.

### CNAME flattening

The DNS standard forbids a CNAME at the zone apex (`example.com`), because the apex already holds SOA and NS records. Cloudflare allows it by **flattening**: it follows the CNAME chain itself and answers with the final A and AAAA addresses. An option flattens every CNAME in the zone, not only the apex; it can break third-party domain verification that expects to see the CNAME itself. A target that resolves to no address gives an empty answer (NODATA) ([CNAME flattening](https://developers.cloudflare.com/dns/cname-flattening/)).

### DNSSEC

DNSSEC signs the zone's answers so resolvers can detect forged ones. On Cloudflare it takes two steps: turn it on in the dashboard, which signs the zone; then add the **DS record** Cloudflare shows at your registrar, which links the zone to the parent's chain of trust. If you move a zone away, remove the DS record first, or validating resolvers will reject every answer.

### Worked example

A small company moves `example.com` to Cloudflare:

| Name | Type | Content | Proxy |
|---|---|---|---|
| `example.com` | A | 203.0.113.10 | Proxied |
| `www` | CNAME | `example.com` | Proxied |
| `api` | A | 203.0.113.20 | Proxied |
| `ssh` | A | 203.0.113.10 | DNS-only |
| `example.com` | MX | `mail.example.com` (priority 10) | DNS-only (always) |
| `mail` | A | 198.51.100.5 | DNS-only |
| `example.com` | TXT | `v=spf1 mx -all` | DNS-only (always) |

The `ssh` record exposes 203.0.113.10, the web origin's address. Better: put SSH behind Cloudflare Tunnel and Access (Part 9) and delete the record.

**What to remember.** Only A, AAAA and CNAME can be proxied, on the listed HTTP and HTTPS ports. Proxied records have a fixed 300-second TTL. A DNS-only record on the same server as a proxied one leaks your origin.

## Part 3 — SSL/TLS

A proxied request has two TLS connections, visitor to Cloudflare and Cloudflare to origin; the encryption mode decides how the second one is made, and **Full (strict)** is the only mode that is both encrypted and authenticated end to end.

### The encryption modes

| Mode | Visitor → Cloudflare | Cloudflare → origin | Origin certificate checked |
|---|---|---|---|
| Off | HTTP only | HTTP | — |
| Flexible | HTTP or HTTPS | HTTP, always | — |
| Full | HTTP or HTTPS | Same scheme as the visitor | No: any certificate, even self-signed or expired |
| Full (strict) | HTTP or HTTPS | Same scheme as the visitor | Yes: a public CA or Cloudflare's Origin CA, valid, matching the hostname |
| Strict (SSL-only origin pull) | HTTP or HTTPS | HTTPS, always | Yes |

New zones use **Automatic SSL/TLS**: Cloudflare probes the origin and picks the most secure mode it supports, and never moves a zone to a weaker one. Cloudflare recommends Full or Full (strict) ([Encryption modes](https://developers.cloudflare.com/ssl/origin-configuration/ssl-modes/)).

Why Flexible is dangerous: the visitor sees a padlock, but the request crosses the internet in clear text from Cloudflare to your server. Why Full is not enough: without checking the certificate, anyone who can hijack the route to your origin can impersonate it.

### The redirect loop

The most common SSL problem on Cloudflare: the zone is on **Flexible**, and the origin redirects HTTP to HTTPS. The visitor asks for `https://`; Cloudflare asks the origin over HTTP; the origin answers "301, go to https"; the browser asks for `https://` again, and so on (`ERR_TOO_MANY_REDIRECTS`). The fix is to give the origin a certificate and switch to Full (strict), not to remove the redirect.

### Edge certificates: what visitors see

- **Universal SSL** (free, automatic): covers the apex and first-level subdomains, `example.com` and `*.example.com`. It does **not** cover `dev.www.example.com` ([Universal SSL limitations](https://developers.cloudflare.com/ssl/edge-certificates/universal-ssl/limitations/)).
- **Advanced Certificate Manager** (paid): certificates for chosen hostnames, choice of CA and validity, and **Total TLS**, which issues a certificate for every proxied hostname, however deep.
- **Custom certificates** (Business and Enterprise): upload your own.

Edge settings to set on every zone:

- **Always Use HTTPS**: redirects every `http://` request to `https://` at the edge.
- **Minimum TLS version**: 1.2 for most sites; TLS 1.0 and 1.1 are obsolete.
- **TLS 1.3**: on.
- **HSTS**: tells browsers to use HTTPS only, for `max-age` seconds. Turn it on once HTTPS works everywhere: a browser that has seen HSTS will refuse HTTP to your site until it expires, and `includeSubDomains` extends that to every subdomain.

### Origin certificates: what Cloudflare sees

- **Cloudflare Origin CA** issues free certificates for your origin, up to 15 years, with wildcards one level deep and up to 200 names. Only Cloudflare trusts them: they work behind the orange cloud with Full (strict), and browsers reject them if a hostname goes DNS-only ([Origin CA](https://developers.cloudflare.com/ssl/origin-configuration/origin-ca/)).
- A public certificate (Let's Encrypt, for example) also works with Full (strict), and keeps working if you ever turn the proxy off.

### Locking the origin to Cloudflare

An origin that answers anyone defeats the WAF: attackers find its address and go around Cloudflare. Three ways to close it, from weakest to strongest:

1. **Firewall the origin to Cloudflare's published IP ranges.** Simple, but any Cloudflare customer's traffic also comes from those ranges.
2. **Authenticated Origin Pulls** (mTLS): Cloudflare presents a client certificate and the origin refuses connections without it. The global certificate proves only that the request came through Cloudflare; a zone-level or per-hostname certificate of your own proves it came through **your** zone ([Authenticated Origin Pulls](https://developers.cloudflare.com/ssl/origin-configuration/authenticated-origin-pull/explanation/)).
3. **Cloudflare Tunnel** (Part 9): the origin makes only outbound connections to Cloudflare and accepts no inbound traffic at all. No open port, nothing to find.

**What to remember.** Use Full (strict) with an Origin CA or public certificate. Flexible plus an origin HTTPS redirect is a loop. Universal SSL covers one level of subdomain. Lock the origin with mTLS or a tunnel.

## Part 4 — Cache and performance

By default Cloudflare caches static files by extension and never HTML or JSON; everything else about caching is deciding, with Cache Rules and headers, what else to store, for how long, and under which key.

### What is cached by default

- Caching is decided by **file extension**, not MIME type: images, video, audio, fonts, archives, PDF, CSS, JS and `robots.txt` are cached; **HTML and JSON are not** ([Default cache behavior](https://developers.cloudflare.com/cache/concepts/default-cache-behavior/)).
- A response is **not** cached if it has `Cache-Control: private`, `no-store`, `no-cache` or `max-age=0`, if it sets a cookie (`Set-Cookie`), or if the request is not a GET.
- Largest cacheable file: 512 MB on Free, Pro and Business; 5 GB on Enterprise.
- Ports 2052, 2053, 2082, 2083, 2086, 2087, 2095, 2096, 8880 and 8443 are proxied but not cached.

### How long: Edge TTL and Browser TTL

Two different clocks:

- **Edge Cache TTL**: how long Cloudflare keeps the object. By default it follows the origin's `Cache-Control` (`s-maxage`, then `max-age`) or `Expires`. With no cache headers, Cloudflare uses defaults by status code: **200, 206 and 301 for 120 minutes; 302 and 303 for 20 minutes; 404 and 410 for 3 minutes**; nothing else is cached.
- **Browser Cache TTL**: what Cloudflare tells the visitor's browser. Default **4 hours**. Cloudflare raises a shorter origin value to it, and adds it when the origin sends no header; "Respect existing headers" turns that off ([Edge and Browser TTL](https://developers.cloudflare.com/cache/how-to/edge-browser-cache-ttl/)).

The shortest Edge TTL you can set is 2 hours on Free, 1 hour on Pro, 1 second on Business and Enterprise. Purging the cache does not clear what browsers already hold: a long Browser TTL on a file you may change is a promise you cannot take back. Use versioned file names (`app.3f9a1c.js`) with long TTLs, and short TTLs on the HTML that references them.

**`CDN-Cache-Control`** (and `Cloudflare-CDN-Cache-Control`) lets the origin give the CDN a different lifetime from the browser's: `Cache-Control: max-age=60` for browsers, `CDN-Cache-Control: max-age=86400` for the edge.

### Reading CF-Cache-Status

| Value | Meaning |
|---|---|
| `HIT` | Served from Cloudflare's cache |
| `MISS` | Not in cache; fetched from the origin (and stored if cacheable) |
| `EXPIRED` | Was in cache but stale; fetched again from the origin |
| `REVALIDATED` | Stale copy confirmed unchanged by the origin (304) and served |
| `STALE` / `UPDATING` | Stale copy served while Cloudflare refreshes it |
| `BYPASS` | The origin or a rule told Cloudflare not to cache (cookie, `no-cache`, bypass rule) |
| `DYNAMIC` | Not eligible for cache by default (HTML, an API response) |

A site whose HTML shows `DYNAMIC` is doing what it should by default. To cache it, write a Cache Rule.

### Cache Rules

A Cache Rule is an expression (Part 5) plus settings: **Eligible for cache** ("cache everything") or **Bypass**, Edge TTL (respect origin, override, or per status code), Browser TTL, cache key, serve stale, and others. Rules replace the old Page Rules. Example: cache the blog's HTML for an hour at the edge, but never for logged-in users.

```
Expression: (http.host eq "www.example.com" and starts_with(http.request.uri.path, "/blog/") and not http.cookie contains "session=")
Then:       Eligible for cache; Edge TTL: override origin, 1 hour; Browser TTL: respect origin
```

### Cache keys

The cache key decides which requests share a cached object. By default it is the scheme, host, path **and full query string**, plus the `Origin` header and a few forwarding headers ([Cache keys](https://developers.cloudflare.com/cache/how-to/cache-keys/)). So `/logo.png?utm_source=mail` and `/logo.png?utm_source=ad` are two objects, two misses. Every plan can ignore or sort the query string and split by device type in a Cache Rule; choosing individual query parameters, headers, cookies or the host for the key is Enterprise.

### Purging

Every plan can purge by single URL, everything, cache tag, hostname and prefix. Single-URL purges are the cheapest: 800 URLs per second on Free. The other methods are limited to 5 requests a minute on Free, 5 a second on Pro, 10 on Business, 50 on Enterprise ([Purge cache](https://developers.cloudflare.com/cache/how-to/purge-cache/)). A 200 answer means the purge was accepted, not that it is done; check that the next response is no longer a `HIT`.

### Fewer trips to the origin

- **Tiered Cache**: data centers that miss ask an **upper-tier** data center before the origin, so only a few locations ever contact it. **Smart Tiered Cache** picks the upper tier closest to your origin and is free on every plan ([Tiered Cache](https://developers.cloudflare.com/cache/how-to/tiered-cache/)).
- **Cache Reserve**: a persistent cache built on R2, above the upper tier. Objects need a TTL of at least 10 hours and a `Content-Length`; they stay 30 days after their last request. USD 0.015 per GB-month, USD 4.50 per million writes, USD 0.36 per million reads ([Cache Reserve](https://developers.cloudflare.com/cache/advanced-configuration/cache-reserve/)).
- **Argo Smart Routing**: for what cannot be cached, routes origin traffic over Cloudflare's fastest paths instead of the public internet's default ones.

### Worked example

An origin returns `/products` (HTML, no `Cache-Control`) and `/img/shoe.jpg` (`Cache-Control: max-age=600`), on the Free plan with default settings.

- `/products`: `DYNAMIC`, never cached; every request goes to the origin.
- `/img/shoe.jpg`: cached at the edge for 600 seconds, from the origin's header. The browser is told 4 hours, because Cloudflare raises a shorter origin value to the default Browser TTL.
- `/img/shoe.jpg?size=2`: a different cache key, a separate miss.

**What to remember.** Extensions decide the default; HTML and JSON need a Cache Rule. Edge TTL and Browser TTL are separate. The query string is part of the key. Smart Tiered Cache is free: turn it on.

## Part 5 — Rules and traffic

Every rules product is the same pair, an **expression** that selects requests and an **action** with its settings, so learning the rules language once lets you write redirects, rewrites, cache rules and WAF rules alike.

### The rules language

An expression compares **fields** of the request with **values** using **operators**, in a syntax modelled on Wireshark's:

```
(http.host eq "shop.example.com" and http.request.uri.path wildcard "/admin/*") or ip.src in {192.0.2.0/24}
```

The fields you will use most:

| Field | Example value |
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
| `http.request.headers["x-api-key"]` | an array of the header's values |
| `cf.bot_management.score` | 1 (bot) to 99 (human); Bot Management |
| `cf.threat_score` | legacy reputation score |

Operators ([Operators](https://developers.cloudflare.com/ruleset-engine/rules-language/operators/)):

| Operator | Meaning | Note |
|---|---|---|
| `eq`, `ne` (`==`, `!=`) | equal, not equal | case-sensitive on strings |
| `lt`, `le`, `gt`, `ge` | numeric comparisons |  |
| `contains` | substring | case-sensitive |
| `wildcard` | whole value matches a pattern with `*` | **case-insensitive** |
| `strict wildcard` | same, case-sensitive |  |
| `matches` (`~`) | regular expression (Rust regex) | **Business and Enterprise only** |
| `in` | in a set or list: `{"GET" "HEAD"}`, `{10.0.0.0/8}`, `$my_list` |  |

Logical operators, from the strongest binding: `not`, `and`, `xor`, `or`. So `a or b and c` means `a or (b and c)`: use parentheses.

Functions transform values: `lower()`, `starts_with()`, `ends_with()`, `len()`, `concat()`, `url_decode()`, `regex_replace()`, `wildcard_replace()`, and `any()` / `all()` over arrays, such as `any(http.request.headers["accept"][*] contains "json")`.

Three traps:

- `http.request.uri.path eq "/Admin"` does not match `/admin`: string comparison is case-sensitive. Use `lower(http.request.uri.path) eq "/admin"`, or `wildcard`.
- `http.request.uri.path contains "/api"` also matches `/static/api-docs.png`. Prefer `starts_with(http.request.uri.path, "/api/")`.
- Header names in `http.request.headers` are lowercase.

### Redirects

- **Single Redirects**: one rule per pattern, with a static target or a dynamic one built by an expression, such as `concat("https://www.example.com", http.request.uri.path)`. Status 301, 302, 303, 307 or 308; option to keep the query string. They run first of all phases.
- **Bulk Redirects**: account-level lists of thousands of source → target URLs, for migrations. They run after the security phases.

301 and 308 are permanent and cached by browsers; 307 and 308 keep the method and body of a POST, 301 and 302 may change it to GET.

### Transforms, origins, configuration

| Product | What it changes | Example |
|---|---|---|
| URL Rewrite Rules | The path and query the origin sees; the visitor's URL does not change | `/blog/42` served from `/index.php?p=42` |
| Request Header Transform Rules | Headers sent to the origin | add `X-Client-Country: ${ip.src.country}` |
| Response Header Transform Rules | Headers sent to the visitor | add `Strict-Transport-Security`, remove `X-Powered-By` |
| Managed Transforms | Ready-made header sets | add visitor location headers; remove `X-Powered-By` |
| Origin Rules | Where the request goes: Host header, SNI, DNS record (resolve override), destination port | `/docs/*` to another origin on port 8443 |
| Configuration Rules | Zone settings per request: SSL mode, security level, Rocket Loader, Polish, and others | disable Rocket Loader on `/checkout` |
| Compression Rules | Gzip, Brotli, Zstandard per content type | Zstandard for `text/html` |
| Custom Errors | Your page for errors from the origin or from Cloudflare | a branded 502 page |

A rewrite is not a redirect: a redirect sends the visitor a new URL (a 3xx); a rewrite changes only what the origin receives, invisibly ([Rules overview](https://developers.cloudflare.com/rules/)). These products replace the legacy **Page Rules**, one pattern with several settings; Cloudflare's migration guide maps each Page Rule setting to its modern rule.

### Snippets: code inside the rules

Snippets are short JavaScript functions attached to a rule, for logic rules cannot express: set a cookie, A/B split, sign a header. They run after Cache Rules, within 5 ms and 2 MB of memory, at most 32 KB of code, with 2 to 5 subrequests; 25 snippets on Pro, 50 on Business, 300 on Enterprise, none on Free ([Snippets](https://developers.cloudflare.com/rules/snippets/)). Anything larger, stateful or using bindings is a Worker (Part 7).

### Load balancing

Load Balancing spreads traffic over several origins and fails over when one dies. The model has three levels:

1. A **load balancer** answers for a hostname, such as `app.example.com`, and orders its **pools**.
2. A **pool** groups **endpoints** (your servers), often one pool per region or cloud, with a minimum of healthy endpoints.
3. A **monitor** probes each endpoint (HTTP, HTTPS, TCP; a path, an expected code, an interval) and marks it healthy or not.

The **steering policy** picks a pool among the healthy ones: Standard (off/failover: the first healthy pool in order; or random with weights), Geo (pools per region or country), Dynamic (lowest measured latency), Proximity (closest by coordinates), and Least Outstanding Requests ([Steering policies](https://developers.cloudflare.com/load-balancing/understand-basics/traffic-steering/steering-policies/)). Inside a pool, **endpoint steering** picks the server: random by weight, hash (sticky by IP), or least outstanding requests. A proxied load balancer adds session affinity by cookie; a DNS-only one just answers DNS with a healthy address.

**What to remember.** `and` binds before `or`; `eq` and `contains` are case-sensitive, `wildcard` is not; `matches` needs Business. A redirect changes the URL, a rewrite does not. Load balancer → pools → endpoints, with monitors deciding health.

## Part 6 — Security

Application security on Cloudflare is layered: DDoS protection is automatic, then your custom rules, rate limits, managed rulesets and bot detection run in that order on every proxied request, and each layer can stop the request before the next one sees it.

### DDoS protection

Network-layer (L3/4) and HTTP (L7) DDoS protection are on for every zone, on every plan, and are **unmetered**: you are not billed for attack traffic. Managed DDoS rulesets detect attacks automatically; you can adjust their sensitivity or action, but not turn them off. The rest of this part is about attacks that look like normal requests: injections, credential stuffing, scraping, abuse.

### WAF custom rules

A custom rule is an expression (Part 5) and an **action**:

| Action | Effect |
|---|---|
| Block | Returns 403 (or your custom response) |
| Managed Challenge | Cloudflare chooses: an invisible check, or a challenge if needed. The recommended challenge |
| JS Challenge / Interactive Challenge | Older, fixed challenges |
| Skip | Lets the request skip the remaining custom rules, or other products (managed rules, rate limiting, bots) |
| Log | Records only; Enterprise |

Rules are evaluated in order; the first **terminating** action (Block, a challenge) ends evaluation. Free has 5 custom rules, Pro 20, Business 100, Enterprise 1,000; `matches` (regex) needs Business ([Custom rules](https://developers.cloudflare.com/waf/custom-rules/)). Lists (IP lists, ASN lists, hostname lists) keep rules short: `ip.src in $office_ips`.

Three rules most sites want:

```
# 1. Admin only from the office
(starts_with(http.request.uri.path, "/wp-admin") and not ip.src in $office_ips)  →  Block

# 2. Challenge logins from countries you do not serve
(http.request.uri.path eq "/login" and not ip.src.country in {"CH" "FR" "DE" "IT" "ES"})  →  Managed Challenge

# 3. Let a partner's health checks through untouched
(ip.src in $partner_ips and http.request.uri.path eq "/health")  →  Skip: all remaining custom rules, rate limiting, managed rules
```

### Rate limiting rules

A rate limiting rule counts requests matching an expression, grouped by **characteristics** (the IP by default), over a **period**; above the threshold it applies an action for a **mitigation timeout**.

| Plan | Rules | Counted by | Period | Timeout |
|---|---|---|---|---|
| Free | 1 | IP | 10 s | 10 s |
| Pro | 2 | IP | up to 1 min | up to 1 h |
| Business | 5 | IP, IP with NAT support | up to 10 min | up to 1 day |
| Enterprise (Advanced Rate Limiting) | 100 | also headers, cookies, query, ASN, country, JA3/JA4, JSON body fields, and more | up to 65,535 s | up to 1 day |

Counters are kept **per data center**, not globally ([Request rate](https://developers.cloudflare.com/waf/rate-limiting-rules/request-rate/)): a botnet spread over many cities can stay under a per-IP limit everywhere. Rate limiting stops floods from few sources; bots and managed challenges handle the distributed ones ([Rate limiting rules](https://developers.cloudflare.com/waf/rate-limiting-rules/)).

Example: at most 5 POSTs to `/login` per IP in 1 minute, then block for 10 minutes. Requests counted: `(http.request.uri.path eq "/login" and http.request.method eq "POST")`; characteristics: IP; period 60 s; requests 5; action Block; duration 600 s (Business, for the 10-minute timeout).

### Managed rulesets

- **Cloudflare Free Managed Ruleset**: on every plan, high-impact vulnerabilities (Log4Shell-class).
- **Cloudflare Managed Ruleset** (Pro and above): Cloudflare's rules for common attacks and CMS-specific exploits, updated by Cloudflare's team.
- **Cloudflare OWASP Core Ruleset**: Cloudflare's version of the OWASP CRS, which works by **scoring**. Each matching rule adds points; the request's total is compared with a threshold: **60 for Low, 40 for Medium (default), 25 for High** sensitivity. The **paranoia level** (PL1 to PL4) chooses which rules run: PL2 runs PL1 and PL2 rules, and so on ([OWASP concepts](https://developers.cloudflare.com/waf/managed-rules/reference/owasp-core-ruleset/concepts/)).
- **Exposed credentials / leaked credentials detection**: flags logins that use a username and password known from breaches.

False positives are fixed with an **exception** (a skip rule for that rule ID on that path), not by turning the whole ruleset off. Deploy new rules with Log first where you can, then switch to Block.

### Bots

| Product | Plan | What it gives |
|---|---|---|
| Bot Fight Mode | Free | One switch: challenge detected bots on the whole zone |
| Super Bot Fight Mode | Pro, Business | An action per category: definitely automated, likely automated, verified bots; static resources protected or not |
| Bot Management | Enterprise add-on | A **bot score** per request, 1 (certainly a bot) to 99 (certainly human), usable in any rule; JA3/JA4 fingerprints; detection IDs |

([Bot solutions](https://developers.cloudflare.com/bots/)). **Verified bots** (search engines, monitoring) are known good bots, so rules usually let them through: `cf.bot_management.verified_bot`. AI crawlers can be blocked with one switch, or managed per crawler with AI Crawl Control.

**Turnstile** replaces CAPTCHAs on your forms, on or off Cloudflare: a widget (Managed, Non-interactive or Invisible) gives the browser a token, and **your server must validate it** with the siteverify API before trusting the form. A token is valid for 300 seconds and only once ([Turnstile](https://developers.cloudflare.com/turnstile/)).

### APIs

**API Shield** protects JSON APIs: endpoint discovery, **schema validation** against your OpenAPI file (wrong types, unknown fields blocked), **JWT validation**, **mTLS** for clients such as mobile apps or devices, and sequence rules that catch calls out of the expected order. Pair it with rate limiting per API key: `http.request.headers["x-api-key"]` as a characteristic needs Advanced Rate Limiting.

### Worked example: putting the layers together

A login endpoint under credential-stuffing attack, Business plan:

1. Custom rule: Managed Challenge on `/login` for `cf.threat_score` high or countries you don't serve.
2. Rate limiting: 5 POSTs per IP per minute on `/login`, block 10 minutes.
3. Managed rules: Cloudflare Managed Ruleset and OWASP at Medium, with leaked credentials detection; add a request header so the app forces a password reset when a leaked pair is used.
4. Super Bot Fight Mode: "definitely automated" blocked, "likely automated" challenged.
5. Turnstile on the login form itself, validated server-side.

**What to remember.** Custom rules → rate limiting → managed rules → bots, in that order. Managed Challenge is the default challenge. Rate limit counters are per data center. OWASP blocks on a summed score, not a single rule. Validate Turnstile tokens on your server.

## Part 7 — Workers

A Worker is JavaScript, TypeScript or WebAssembly that runs in a V8 isolate in every Cloudflare data center, starts in milliseconds, and reaches storage, queues and AI through **bindings** rather than network calls; it is the centre of the developer platform.

### The runtime model

- **Isolates, not containers.** Each Worker runs in a V8 isolate, many per process. No cold start in the container sense: startup is limited to 1 second and usually takes a few milliseconds.
- **Web standard APIs.** `fetch`, `Request`, `Response`, `URL`, Streams, Web Crypto; with the `nodejs_compat` flag, most of Node's APIs (`node:crypto`, `node:buffer`, `node:stream`…).
- **Stateless between requests.** An isolate may serve many requests, or be thrown away at any time. Never keep per-request data in module-level variables: the next request, perhaps another user's, will see it. State lives in storage (Part 8).
- **Where it runs.** By default, in the data center that received the request. **Smart Placement** moves a Worker that makes many round-trips to one backend (a database in one region) close to that backend instead.

### A first Worker

```ts
export interface Env {
  GREETINGS: KVNamespace;      // a KV binding
  API_TOKEN: string;           // a secret
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname === "/hello") {
      const name = url.searchParams.get("name") ?? "world";
      const greeting = (await env.GREETINGS.get("greeting")) ?? "Hello";
      ctx.waitUntil(logVisit(env, name));            // after the response, without delaying it
      return Response.json({ message: `${greeting}, ${name}!` });
    }
    return new Response("Not found", { status: 404 });
  },
};
```

The module exports **handlers**: `fetch` for HTTP, `scheduled` for Cron Triggers, `queue` for Queue consumers, `email` for Email Routing. `env` carries the bindings, variables and secrets; `ctx.waitUntil()` keeps the Worker alive for background work after the response.

### Wrangler and the configuration file

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

- **`compatibility_date`** freezes runtime behaviour at a date: a new release of the runtime never changes your Worker until you move the date. Set today's date on a new project, and update it on purpose.
- **Secrets** never go in this file or the code: `wrangler secret put API_TOKEN` stores them encrypted. Plain `vars` are for non-secret settings.
- **Environments** (`env.staging`) deploy the same code as a separate Worker with its own name, routes and bindings: `wrangler deploy --env staging`.
- Commands to know: `wrangler dev` (local, port 8787, with local simulations of KV, D1, R2), `wrangler deploy`, `wrangler tail` (live logs), `wrangler versions` and gradual deployments (send 10 % of traffic to a new version, then 100 %).

Cloudflare also has a newer CLI, `cf`, in beta, with a TypeScript configuration file (`cloudflare.config.ts`) and `cf migrate` to convert a Wrangler project; some commands, such as `tail` and `secret put`, still go through Wrangler ([cf CLI](https://developers.cloudflare.com/cf/wrangler/reference/)). This course uses Wrangler.

### How a Worker receives traffic

- **workers.dev**: `hello-api.<your-subdomain>.workers.dev`, for development.
- **Custom Domain**: the Worker *is* the origin for `api.example.com`; Cloudflare creates the DNS record and certificate. The zone must be on Cloudflare.
- **Route**: the Worker runs in front of an existing origin for a pattern such as `example.com/api/*`, and may call `fetch(request)` to pass the request on.

### Static assets and full-stack apps

Workers serve static files directly: put them in the `assets` directory and they are served from the edge, free and unlimited, before your code runs (or after, with `run_worker_first`). Cloudflare now recommends **Workers with static assets** rather than Pages for new sites, single-page apps and full-stack frameworks (React Router, Next.js through OpenNext, Astro, SvelteKit) ([Best practices](https://developers.cloudflare.com/workers/best-practices/workers-best-practices/)). Workers have features Pages lacks: Cron Triggers, Queue consumers, Durable Objects, gradual deployments, Workers Logs ([Migrate from Pages](https://developers.cloudflare.com/workers/static-assets/migration-guides/migrate-from-pages/)).

### Limits and pricing

|  | Workers Free | Workers Paid (USD 5 a month minimum) |
|---|---|---|
| Requests | 100,000 a day | 10 million a month included, then USD 0.30 per million |
| CPU time per request | 10 ms | 30 s by default, up to 5 min; 30 million CPU-ms a month included, then USD 0.02 per million |
| Memory | 128 MB per isolate | 128 MB per isolate |
| Subrequests per invocation | 50 | 10,000 by default |
| Worker size | 64 MiB uncompressed | 64 MiB uncompressed |
| Workers per account | 100 | 500 |

**CPU time, not wall time, is billed**: a Worker waiting 2 seconds for a slow API uses almost no CPU. There is no charge for egress, and static asset requests are free ([Pricing](https://developers.cloudflare.com/workers/platform/pricing/), [Limits](https://developers.cloudflare.com/workers/platform/limits/)).

### Observability

Turn on **Workers Logs** (`observability.enabled`) and log structured JSON; add Traces before production. `wrangler tail` streams logs live; **Tail Workers** receive every invocation's logs and exceptions to forward them elsewhere; **Logpush** exports them to storage.

**What to remember.** Isolates, not containers; no per-request state in globals. Bindings, not REST calls. Secrets with `wrangler secret put`. CPU time is what is limited and billed. New sites: Workers with static assets.

## Part 8 — Storage and state

Workers are stateless, so every application chooses where its state lives; the choice is mostly about **consistency**: KV is fast and eventually consistent, R2 and D1 are strongly consistent stores, and Durable Objects give one single-threaded owner to each piece of state.

### Choosing

| Product | What it is | Consistency | Use it for | Avoid it for |
|---|---|---|---|---|
| Workers KV | Global key-value store, cached at the edge | Eventual: up to 60 s or more to be seen elsewhere | Configuration, feature flags, sessions read far more than written | Counters, anything written often or needing read-after-write |
| R2 | S3-compatible object storage, no egress fees | Strong, per object | Files, images, backups, datasets, logs | Small values read and written per request |
| D1 | Serverless SQLite databases, up to 10 GB each | Strong (one primary); optional read replicas | Relational data: users, orders, catalogues | Very large or very write-heavy databases |
| Durable Objects | A uniquely named object with code and private SQLite storage | Strong, transactional, single-threaded | Coordination: chat rooms, counters, rate limiters, game sessions, per-user state, WebSockets | Large analytical queries across all objects |
| Queues | Message queue between Workers | At-least-once delivery | Background jobs, buffering, fan-out | Request/response work |
| Workflows | Durable multi-step programs with retries and sleeps | Each step's result persisted | Order pipelines, onboarding sequences, AI jobs, anything waiting hours or days | Sub-second request handling |
| Hyperdrive | Connection pooling and caching to your own Postgres or MySQL | Your database's; cached reads may be stale | Keeping an existing database | New projects without an existing database |

([Storage options](https://developers.cloudflare.com/workers/platform/storage-options/))

### Workers KV

Writes go to central stores; reads are served from caches in each location. A change "may take up to 60 seconds or more" to be visible elsewhere, and even read-your-own-write is not guaranteed ([How KV works](https://developers.cloudflare.com/kv/concepts/how-kv-works/)). At most **one write per second to the same key**; values up to 25 MiB, keys up to 512 bytes ([KV limits](https://developers.cloudflare.com/kv/platform/limits/)).

```ts
await env.FLAGS.put("checkout-v2", "on", { expirationTtl: 3600 });
const flag = await env.FLAGS.get("checkout-v2", { cacheTtl: 300 });   // read, cached 5 min locally
```

The trap: a page-view counter in KV. Two locations read 41 and both write 42, and the one-write-per-second limit is hit at once. A counter is a Durable Object.

### R2

Objects in buckets, through the binding or the S3 API, with **no charge for egress**. Standard storage costs USD 0.015 per GB-month, USD 4.50 per million writes (Class A), USD 0.36 per million reads (Class B); the first 10 GB, 1 million Class A and 10 million Class B operations each month are free. Infrequent Access storage costs USD 0.01 per GB-month but charges USD 0.01 per GB retrieved ([R2 pricing](https://developers.cloudflare.com/r2/pricing/)). A bucket can be public through a custom domain, which puts Cloudflare's cache in front of it; presigned URLs give time-limited access to private objects.

### D1

SQLite with migrations and a binding:

```ts
const { results } = await env.DB
  .prepare("SELECT id, total FROM orders WHERE customer_id = ? ORDER BY created_at DESC LIMIT 10")
  .bind(customerId)
  .all();
```

Always bind parameters (`?`), never concatenate strings: that is how SQL injection happens. A database is up to 10 GB on Workers Paid (500 MB on Free), and you can have thousands, for example one per tenant. Each database runs **one query at a time**: with 1 ms queries it serves at most about 1,000 queries per second, with 100 ms queries 10 ([D1 limits](https://developers.cloudflare.com/d1/platform/limits/)). Index what you filter on, and batch statements with `db.batch()`. Read replication adds read-only copies near users, used through the Sessions API so a user still reads their own writes.

### Durable Objects

A Durable Object class is code; each **instance** has a globally unique name and lives in one place at a time. All requests for `room:lobby` reach the same instance, which handles them one at a time, with its own transactional SQLite storage ([What are Durable Objects](https://developers.cloudflare.com/durable-objects/concepts/what-are-durable-objects/)).

```ts
export class Counter extends DurableObject {
  async increment(): Promise<number> {
    const value = ((await this.ctx.storage.get<number>("value")) ?? 0) + 1;
    await this.ctx.storage.put("value", value);
    return value;
  }
}

// in the Worker
const stub = env.COUNTER.get(env.COUNTER.idFromName("page:/home"));
const views = await stub.increment();       // RPC to the one instance for that name
```

No race: two increments cannot interleave, because one instance runs them in turn. Other powers: **alarms** wake an object at a set time; **WebSockets** with the Hibernation API keep thousands of clients connected to one object at low cost. The design rule: one object per unit of coordination (a room, a document, a user), never one object for the whole application, which would make it a single-threaded bottleneck.

### Queues

A producer calls `env.JOBS.send({ orderId })`; the consumer Worker's `queue()` handler receives **batches** (up to 100 messages, or after a wait of up to 60 seconds). Delivery is **at least once**: make consumers idempotent. A message that fails is retried (up to 100 times), then sent to a **dead letter queue** if one is configured. Messages up to 128 KB, 5,000 per second per queue, kept up to 14 days ([Queues limits](https://developers.cloudflare.com/queues/platform/limits/)).

### Workflows

A Workflow is a program whose steps survive failures: each `step.do()` result is saved, so after a crash the instance resumes after the last finished step instead of starting over.

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

By default a step is retried 5 times, 10 seconds apart with exponential backoff, each attempt timing out after 10 minutes; throw `NonRetryableError` to fail at once ([Sleeping and retrying](https://developers.cloudflare.com/workflows/build/sleeping-and-retrying/)). A sleeping Workflow costs nothing.

### Hyperdrive

A Worker connecting directly to a database in one region pays several round-trips to set up each connection. Hyperdrive sets the connection up close to the Worker, keeps a **pool** of warm connections near the database, and can **cache** read queries. It does not invalidate the cache when you write: use a second, uncached Hyperdrive configuration for reads that must be fresh ([How Hyperdrive works](https://developers.cloudflare.com/hyperdrive/concepts/how-hyperdrive-works/)). Combine it with Smart Placement so the Worker itself runs near the database.

**What to remember.** KV: eventual, one write per second per key. R2: objects, no egress fees. D1: SQLite, one query at a time per database. Durable Objects: one single-threaded owner per name, for anything that must not race. Queues: at least once, so idempotent consumers. Workflows: steps that survive crashes.

## Part 9 — Zero Trust

Cloudflare One replaces the VPN and the office firewall with checks in Cloudflare's network: **Access** decides who may reach your applications, **Tunnel** connects them without opening a port, and **Gateway** filters what your users reach on the internet, with the **Cloudflare One Client** (formerly WARP) carrying a device's traffic there.

Zero Trust means no request is trusted for where it comes from (the office network, the VPN): each one is checked for identity, device and context. Up to 50 users are free; beyond that, pay-as-you-go is USD 7 per user per month, billed yearly ([Access](https://www.cloudflare.com/sase/products/access/)).

### The building blocks

| Component | Direction | What it does |
|---|---|---|
| Identity providers | — | Who the user is: Google, Microsoft Entra ID, Okta, GitHub, any SAML or OIDC provider, or a one-time PIN by email |
| Access | Users → your apps | A login and policy check in front of each application, web or not (SSH, RDP, databases) |
| Tunnel (`cloudflared`) | Your apps → Cloudflare | Outbound-only connection from your network; no inbound port, no public IP |
| Cloudflare One Client | Device → Cloudflare | Sends a device's DNS and traffic to Gateway; reports device posture |
| Gateway | Users → internet and private network | DNS, network and HTTP filtering: block malware, categories, data exfiltration |
| Device posture | — | Checks a device: disk encryption, OS version, client running, EDR present |

Users with or without the client reach internal apps only through Access; enrolled devices send their own traffic through Gateway, which also routes private IPs down the tunnel.

### Access

An **Access application** protects a hostname (`grafana.example.com`) or a path. Each has **policies**; each policy has one action and rules:

- **Actions**: **Allow**, **Block**, **Bypass** (no Access check at all, not logged: only for public assets such as a health check), **Service Auth** (for machines: service tokens or mTLS, no login).
- **Rules**: **Include** (OR: any one matches), **Require** (AND: all must match), **Exclude** (NOT: any match denies). Every policy needs at least one Include.
- **Order**: Bypass and Service Auth policies are evaluated first, then Allow and Block, each top to bottom; the first Allow or Block that matches decides. Anything that matches nothing is **denied by default** ([Access policies](https://developers.cloudflare.com/cloudflare-one/access-controls/policies/)).

Example: engineers may reach the admin panel from a managed laptop, contractors never.

```
Policy "Engineers", Allow
  Include:  Emails ending in @example.com
  Require:  Login method is Okta;  Device posture: disk encrypted
  Exclude:  Group "contractors"

Policy "Deploy bot", Service Auth
  Include:  Service token "ci-deployer"
```

The CI job sends two headers, `CF-Access-Client-Id` and `CF-Access-Client-Secret`, and is let through without a login.

After login, Access sends the application a signed JWT in the `Cf-Access-Jwt-Assertion` header. **Your application should validate it**: fetch the keys from `https://<team>.cloudflareaccess.com/cdn-cgi/access/certs` and check the `aud` claim against the application's AUD tag ([Validate JWTs](https://developers.cloudflare.com/cloudflare-one/access-controls/applications/http-apps/authorization-cookie/validating-json/)). Otherwise, anyone who reaches the origin some other way is trusted.

### Tunnel

`cloudflared` runs next to your services and opens **outbound** connections to two Cloudflare data centers; requests come back down those connections. The origin needs no public IP and no open inbound port, and nobody can bypass Cloudflare to reach it. Remotely managed tunnels are configured in the dashboard or by API; locally managed ones read a file:

```yaml
tunnel: 6ff42ae2-765d-4adf-8112-31c55c1551ef
credentials-file: /etc/cloudflared/6ff42ae2.json
ingress:
  - hostname: app.example.com
    service: http://localhost:8080
  - hostname: app.example.com
    path: ^/api/
    service: http://localhost:9000      # never reached: the rule above matched first
  - hostname: ssh.example.com
    service: ssh://localhost:22
  - service: http_status:404             # required catch-all, last
```

Rules are matched **top to bottom, first match wins**, and the file **must end with a catch-all** rule that has no hostname ([Configuration file](https://developers.cloudflare.com/tunnel/advanced/local-management/configuration-file/)). In the example the `/api/` rule is dead: put more specific rules first. Run two or more `cloudflared` replicas of the same tunnel for availability. A tunnel can also carry **private network** routes (`10.0.0.0/16`), so enrolled devices reach internal IPs as with a VPN, under Gateway network policies.

### Gateway

Gateway filters DNS queries, network traffic and HTTP requests from devices running the client, or from offices sending DNS or traffic to it. Policy types are applied in this order: DNS (before resolution, then resolver policies, then DNS after resolution), egress, **network**, then **HTTP**; within a type, the first matching policy in precedence order wins ([Order of enforcement](https://developers.cloudflare.com/cloudflare-one/traffic-controls/order-of-enforcement/)).

- **DNS policies**: block by domain, category (malware, phishing, adult content), application; cheapest to deploy, a DNS setting is enough.
- **Network policies**: by IP, port, protocol, SNI; for private networks behind tunnels.
- **HTTP policies**: by URL, file type, application, with antivirus scanning and data loss prevention. Inspecting HTTPS requires **TLS decryption** and Cloudflare's root certificate installed on devices; "Do Not Inspect" policies exempt banks, health sites and apps that pin certificates.
- **Browser Isolation** runs risky sites in a remote browser and sends the device only the rendering.

### The Cloudflare One Client

The client (formerly WARP) enrols a device in your organisation and runs in one of several modes: **Traffic and DNS** (the default: everything to Gateway), **DNS only**, **Traffic only**, **Posture only** (no traffic, only device checks for Access) and **Local proxy** ([Client modes](https://developers.cloudflare.com/cloudflare-one/team-and-resources/devices/cloudflare-one-client/configure/modes/)). **Split tunnels** choose which destinations go through Cloudflare (include or exclude lists).

### Worked example: replacing a VPN

1. Install `cloudflared` in the data center; route `10.20.0.0/16` through the tunnel and publish `wiki.example.com` and `grafana.example.com` as hostnames.
2. Connect Okta as identity provider.
3. Create an Access application per web app, with an Allow policy for the right group and a posture check.
4. Deploy the Cloudflare One Client by MDM in Traffic and DNS mode; Gateway network policy: only the `engineering` group reaches `10.20.0.0/16` on port 22 and 5432.
5. Gateway DNS policy: block security threats for everyone.
6. Close the VPN's inbound port and the firewall rules that served it.

**What to remember.** Access: Include = OR, Require = AND, Exclude = NOT; deny by default; Bypass skips everything. Validate the Access JWT in the app. Tunnel: outbound only, first match wins, catch-all last. Gateway: DNS, then network, then HTTP; HTTPS inspection needs the root certificate.

## Part 10 — AI

Cloudflare's AI stack is the developer platform plus four pieces: **Workers AI** runs open models on Cloudflare's GPUs, **AI Gateway** sits in front of any model provider to cache, limit and log, **Vectorize** and **AI Search** handle retrieval, and the **Agents SDK** gives each agent durable state on a Durable Object.

### The pieces

| Product | What it does | Reach it with |
|---|---|---|
| Workers AI | Inference on serverless GPUs: LLMs, embeddings, image, speech, translation | `env.AI.run(model, input)` |
| AI Gateway | A proxy to Workers AI, OpenAI, Anthropic, Google and others: caching, rate and spend limits, retries and fallbacks, guardrails, DLP, logs | A gateway URL, or `gateway` options on `env.AI.run` |
| Vectorize | Vector database: store embeddings, query nearest neighbours with metadata filters | `env.VECTORS.upsert()`, `.query()` |
| AI Search | Managed retrieval (RAG): indexes your data continuously, hybrid search, optional answer generation | `env.AI_SEARCH`, REST API or MCP |
| Agents SDK | Agents as Durable Objects: state, WebSockets, scheduling, tools, MCP | `class MyAgent extends Agent` |
| Browser Rendering | Headless browsers for agents: screenshots, PDFs, scraping | binding or REST API |
| AI Crawl Control | See and control which AI crawlers read your site | dashboard, WAF |

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

Usage is measured in **Neurons**: 10,000 a day are free on every plan; beyond that, Workers Paid costs USD 0.011 per 1,000 Neurons. Prices per model are also given per million tokens: for example USD 0.045 in and USD 0.384 out for Llama 3.1 8B (fp8, fast), USD 0.293 in and USD 2.253 out for Llama 3.3 70B ([Workers AI pricing](https://developers.cloudflare.com/workers-ai/platform/pricing/)). Pick the smallest model that does the job: the 8B model's input is about 6.5 times cheaper than the 70B's.

### AI Gateway

Put a gateway between your app and every provider, even when the model is not on Cloudflare. Its core features are free ([AI Gateway pricing](https://developers.cloudflare.com/ai-gateway/reference/pricing/)):

- **Caching** of identical requests: the key is a hash of provider, endpoint, model, auth header and the whole body, so one changed character is a miss. Per request, `cf-aig-cache-ttl` sets the lifetime (60 seconds to one month), `cf-aig-skip-cache` bypasses it, `cf-aig-cache-key` sets your own key; `cf-aig-cache-status` says `HIT` or `MISS` ([Caching](https://developers.cloudflare.com/ai-gateway/features/caching/)).
- **Rate limiting** (fixed or sliding window) and **spend limits** per model, provider or metadata.
- **Dynamic routing**: retries and fallbacks, such as "try model A, on error or timeout use model B", configured without code; **Auto Router** sends each request to the cheapest model able to handle it.
- **Guardrails** and **DLP**: moderate prompts and responses, find personal or financial data.
- **BYOK**: provider keys stored by Cloudflare, not in your code; **Unified Billing** pays providers through Cloudflare credits (5 % fee on credits).
- **Logs and analytics**: requests, tokens, cost, errors per provider ([Features](https://developers.cloudflare.com/ai-gateway/features/)).

### Retrieval: Vectorize and AI Search

Retrieval-augmented generation (RAG) answers from your documents: embed them, find the passages closest to the question, and give those to the model.

**Do it yourself** with Workers AI and Vectorize. An index has a fixed dimension (up to 1,536) and metric (cosine, euclidean, dot product), holds up to 20 million vectors, 10 KiB of metadata each, with up to 10 indexed metadata fields for filters; a query returns at most 50 results with metadata, 100 without ([Vectorize limits](https://developers.cloudflare.com/vectorize/platform/limits/)).

```ts
// index a passage
const { data } = await env.AI.run("@cf/baai/bge-base-en-v1.5", { text: [passage] });   // 768 dimensions
await env.VECTORS.upsert([{ id: docId, values: data[0], metadata: { url, lang: "en" } }]);

// answer a question
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

The index's dimension must equal the embedding model's: 768 for this model. A mismatch is the most common Vectorize error.

**Or let AI Search do it**: point an instance at your data, and it chunks, embeds and re-indexes continuously, with hybrid (semantic and keyword) search, metadata filters and OCR for scanned PDFs ([AI Search](https://developers.cloudflare.com/ai-search/)):

```ts
const docs = env.AI_SEARCH.get("handbook");
const hits = await docs.search({ messages: [{ role: "user", content: "How many vacation days?" }] });
const answer = await docs.chatCompletions({
  model: "@cf/meta/llama-3.3-70b-instruct-fp8-fast",
  messages: [{ role: "user", content: "How many vacation days?" }],
  ai_search_options: { retrieval: { max_num_results: 5 }, query_rewrite: { enabled: true } },
});
```

([Workers binding](https://developers.cloudflare.com/ai-search/api/search/workers-binding/)). Choose AI Search to get answers quickly; choose Vectorize when you need control over chunking, models or ranking.

### Agents

An **agent** is a Durable Object: each user or conversation gets its own instance, with state that survives restarts, WebSocket connections to its clients, and scheduled work ([Agent class](https://developers.cloudflare.com/agents/runtime/lifecycle/agent-class/)).

```ts
export class Support extends Agent<Env, { tickets: number }> {
  initialState = { tickets: 0 };

  @callable()
  async openTicket(text: string) {
    this.sql`INSERT INTO tickets (text, at) VALUES (${text}, ${Date.now()})`;
    this.setState({ tickets: this.state.tickets + 1 });     // saved, and pushed to connected clients
    await this.schedule(86400, "followUp", { text });        // in 24 hours
  }

  async followUp({ text }: { text: string }) { /* ask the model for a status mail */ }
}
```

`setState` saves and broadcasts; `this.sql` queries the agent's own SQLite; `schedule` runs a method after a delay, at a date or on a cron; `@callable()` exposes a method to clients over WebSocket RPC. Agents can call models (through AI Gateway), tools, other agents and MCP servers, and hand long jobs to Workflows. Cloudflare also hosts **MCP servers** on Workers, with Access or OAuth in front, so external AI clients can use your tools securely.

**What to remember.** Workers AI is billed in Neurons, 10,000 free a day. AI Gateway in front of every provider: cache, limit, fall back, log. Vectorize dimension = embedding dimension. AI Search is managed RAG. An agent is a Durable Object with state, sockets and schedules.

## Part 11 — Operating it

Once a setup works, keep it as code: everything in the dashboard has an API, Terraform manages it with reviewed changes, scoped API tokens limit what each tool may touch, and logs and analytics tell you what happened.

### API tokens

- Use **API tokens**, never the legacy Global API Key, which can do everything your user can.
- Give each token only the **permissions** it needs ("Zone → DNS → Edit", "Account → Workers Scripts → Edit") on only the **resources** it needs (one zone, one account).
- Restrict it to your CI's **IP ranges** and give it an **expiry date**: by default a token never expires ([Restrict tokens](https://developers.cloudflare.com/fundamentals/api/how-to/restrict-tokens/)).
- Prefer **account-owned tokens** for automation, so a pipeline does not stop when the person who created its token leaves.

```sh
curl https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records \
  -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN"
```

### Terraform

The Cloudflare provider (version 5, released every two to three weeks) covers zones, DNS, rulesets, Workers, Access, tunnels and most other products ([Terraform v5.20.0](https://developers.cloudflare.com/changelog/post/2026-06-12-terraform-v5.20.0-provider/)). `cf-terraforming` generates configuration and import commands for what already exists.

```hcl
resource "cloudflare_dns_record" "www" {
  zone_id = var.zone_id
  name    = "www"
  type    = "CNAME"
  content = "example.com"
  proxied = true
  ttl     = 1            # 1 = automatic
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

Note that a ruleset owns **all** the rules of its phase for that zone: a rule added by hand in the dashboard is removed at the next `terraform apply`. Decide per phase whether it is managed by Terraform or by people, not both.

Workers are usually deployed by Wrangler from CI (`wrangler deploy` with `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` set), or by Workers Builds, which deploys on every push to a connected Git repository.

### Logs and analytics

| Tool | What it gives | When |
|---|---|---|
| Dashboard analytics | Traffic, cache ratio, threats, by zone | Daily look |
| Security Events | Every request a security rule acted on, with the rule ID | Tuning WAF rules, false positives |
| GraphQL Analytics API | The same data, queried | Your own dashboards |
| Instant Logs | Live stream of HTTP requests | Debugging now |
| Logpush | Request logs, firewall events, Workers traces and more, pushed to R2, S3, a SIEM… | Retention and investigation |
| Workers Logs, Traces | Your Workers' logs and timings | Debugging Workers |

Since 30 September 2026, Logpush is available on every plan with usage-based pricing: 25 GB a month included, then USD 0.03 per GB to R2 and Pipelines, USD 0.10 per GB to external destinations ([Logpush changelog](https://developers.cloudflare.com/changelog/post/2026-09-30-logpush-usage-based-pricing/)).

### Costs: where the bill comes from

- **Zones**: the plan per zone (Free, Pro, Business) and add-ons (Advanced Certificate Manager, Load Balancing, Argo, Cache Reserve).
- **Developer platform**: Workers Paid (USD 5 a month) covers the included usage of Workers, KV, D1, Durable Objects and Queues; beyond it, usage is billed per request, CPU-ms, row or GB. R2 has no egress fees.
- **Zero Trust**: per user above 50.
- **AI**: Neurons beyond 10,000 a day; providers' tokens through AI Gateway.

Set **billing notifications** and, for Workers, a CPU limit per Worker (`limits.cpu_ms`), so a bug cannot run up a bill.

### Reference architecture

A SaaS application built entirely on Cloudflare: visitors reach `app.example.com` through the security and cache layers; a Worker serves the front end from static assets and the API from D1, R2 and Durable Objects; background jobs go through Queues and Workflows; AI features call Workers AI or external models through AI Gateway; the team reaches internal tools through Access and a Tunnel, never through a public port.

**What to remember.** Scoped, expiring, account-owned API tokens. Terraform per phase, not mixed with the dashboard. Logpush is now on every plan. Set billing notifications.

## Exercises

One lab per part, on a test domain and a free account, then questions to check yourself. Answers follow.

### Labs

- [ ] **Lab 1 (Parts 1–2).** Add a test domain with a full setup. Create `www` proxied and `direct` DNS-only to the same server. Run `dig www.<domain>` and `dig direct.<domain>`: note which answer shows your server's address.
- [ ] **Lab 2 (Part 3).** Install an Origin CA certificate on the origin, switch to Full (strict), turn on Always Use HTTPS and a minimum TLS of 1.2. Then set Flexible with an origin HTTP-to-HTTPS redirect and watch the loop; switch back.
- [ ] **Lab 3 (Part 4).** Request an image three times with `curl -sI` and read `CF-Cache-Status`. Write a Cache Rule that caches `/blog/*` HTML for an hour unless a `session` cookie is present; check `MISS`, then `HIT`, then `BYPASS` with the cookie.
- [ ] **Lab 4 (Part 5).** Write a Single Redirect from `example.com/*` to `https://www.example.com/*` keeping the path and query, and a Response Header Transform Rule that removes `X-Powered-By`.
- [ ] **Lab 5 (Part 6).** Create a custom rule that blocks `/admin` outside an IP list, and a rate limiting rule on `/login`. Trigger both; find them in Security Events with their rule IDs.
- [ ] **Lab 6 (Part 7).** `npm create cloudflare@latest`, write a Worker with a `fetch` handler and a static `public/` directory, deploy it to a Custom Domain, and run `wrangler tail` while you call it.
- [ ] **Lab 7 (Part 8).** Add a D1 database with an `orders` table and a migration, a Durable Object counter of page views, and a Queue whose consumer writes to R2. Make the consumer fail once and watch the retry.
- [ ] **Lab 8 (Part 9).** Run `cloudflared` in Docker in front of a local web app, with no open port; protect it with an Access application allowing only your email, and validate `Cf-Access-Jwt-Assertion` in the app.
- [ ] **Lab 9 (Part 10).** Create a Vectorize index of 768 dimensions, embed ten paragraphs with `@cf/baai/bge-base-en-v1.5`, and answer questions from them; route the model call through an AI Gateway with caching and compare `cf-aig-cache-status` on a repeated question.
- [ ] **Lab 10 (Part 11).** Create a scoped, expiring API token; import the zone's DNS with `cf-terraforming`; change a record through a Terraform plan and apply.

### Check yourself

1. A WAF custom rule blocks `/admin`, but requests to `admin.example.com/admin` still reach the server. What do you check first?
2. The SSL mode is Full and the origin's certificate expired yesterday. Do visitors see an error?
3. Why is HTML not cached by default, and what makes a page cacheable?
4. `http.request.uri.path eq "/Login"` never matches. Why?
5. Which runs first, a Single Redirect or a WAF custom rule? A Bulk Redirect or a WAF custom rule?
6. A rate limiting rule allows 100 requests a minute per IP, but a botnet of 10,000 IPs sends 50 each. What helps?
7. Where do you keep a page-view counter, and why not KV?
8. A Queue consumer charges a customer's card. What property must it have?
9. An Access policy has Include `@example.com` and Require country `CH`. Can `ana@example.com` connect from France?
10. A tunnel's ingress has a catch-all rule first. What happens?
11. You query a Vectorize index of 1,024 dimensions with a 768-dimension embedding. What happens?
12. A Terraform-managed ruleset loses a rule a colleague added in the dashboard. Why?

### Answers

1. Whether `admin.example.com` is **proxied**. A DNS-only record bypasses every Cloudflare product. Then check the expression's host.
2. **No**: Full does not validate the origin certificate. That is why it is not enough; Full (strict) would return a 526 error.
3. Because HTML is often personal (cart, account). A Cache Rule with *Eligible for cache*, and no `Set-Cookie` or `private` in the response, or a bypass for logged-in users.
4. `eq` is case-sensitive: `/login` is not `/Login`. Use `lower(...)` or `wildcard`.
5. The Single Redirect runs first of all phases; the WAF custom rule runs before the Bulk Redirect.
6. Not per-IP rate limiting: a managed challenge or Super Bot Fight Mode, Bot Management scores, or counting by another characteristic (a session cookie, an API key) with Advanced Rate Limiting.
7. A **Durable Object**: one instance handles the increments in turn. KV is eventually consistent and accepts one write per second per key.
8. **Idempotence**: Queues deliver at least once, so the same message can arrive twice. Store a payment ID and refuse duplicates.
9. **No**: Require is AND, so both the email domain and the country must match.
10. Every request matches it; the rules after it are never used. The catch-all must be last.
11. The query fails: the vector's dimension must match the index's. Create the index with the embedding model's dimension.
12. The ruleset resource owns every rule of that phase; `apply` restores the declared state. Manage a phase in one place only.

## Sources

All pages opened on 27 October 2026. Limits and prices change: check the page before relying on a figure.

| Part | Pages |
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