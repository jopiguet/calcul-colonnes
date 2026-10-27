# Cloudflare — un curso completo

## Cómo usar este curso

Este curso le lleva de «¿qué hace la nube naranja?» a construir y proteger una aplicación completa en Cloudflare: servicios de red, seguridad, la plataforma para desarrolladores, Zero Trust e IA. Sigue la documentación actual para desarrolladores (comprobada en octubre de 2026), y cada cifra que puede cambiar, como los límites y los precios, enlaza con su página en las Fuentes.

**A quién va dirigido.** A ingenieros que conocen HTTP, DNS y TLS al nivel de un desarrollador backend, y algo de JavaScript o TypeScript para las partes de Workers. No se presupone experiencia previa con Cloudflare.

**Cómo está organizado.** Once partes en cuatro bloques:

| Bloque | Partes | Lo que sabrá hacer después |
|---|---|---|
| Fundamentos | 1 Cómo funciona Cloudflare · 2 DNS · 3 SSL/TLS | Poner un dominio en Cloudflare de forma segura, cifrado de extremo a extremo |
| Servicios de aplicación | 4 Caché · 5 Reglas y tráfico · 6 Seguridad | Hacer rápido un sitio y protegerlo con reglas que se pueden leer y probar |
| Plataforma para desarrolladores | 7 Workers · 8 Almacenamiento y estado | Construir y desplegar aplicaciones full-stack en el borde (edge) |
| Cloudflare One e IA | 9 Zero Trust · 10 IA · 11 Operación | Sustituir una VPN, ejecutar modelos y RAG, gestionarlo todo como código |

Cada parte termina con lo que hay que recordar. Los ejercicios del final proponen un laboratorio práctico por parte, con soluciones.

**Con Luma.** El test *🔶 Cloudflare* del grupo *Informática* de Luma sigue las mismas partes en cuatro niveles (Principiante a Experto), con 124 preguntas redactadas y ocho tipos de preguntas calculadas (expresiones de reglas, el orden de las fases, modos SSL/TLS, duraciones de caché, ingress de túnel, políticas de Access, las facturas de Workers y Workers AI). Lea una parte y haga el test sobre ella: la revisión de errores le devuelve a la idea que se le escapó.

**Qué necesita.**

- Una cuenta gratuita de Cloudflare. La mayor parte de este curso funciona con el plan Free; las funciones de pago están señaladas.
- Un dominio que controle, para las partes 2 a 6 (basta con un dominio de prueba barato).
- Node.js 20 o posterior y Wrangler, la herramienta de línea de comandos de Cloudflare, para las partes 7, 8 y 10: `npm create cloudflare@latest` crea un proyecto y la instala.
- Para la parte 9, una máquina en la que pueda instalar `cloudflared` y el cliente WARP.

## Parte 1 — Cómo funciona Cloudflare

Cloudflare es un proxy inverso repartido por una única red mundial: cuando un nombre de host está en proxy, los visitantes se conectan a Cloudflare y no a su servidor, y cada producto (caché, WAF, Workers, Access) es una etapa por la que pasa la petición camino de su origen.

### Una sola red, todos los servicios en todas partes

La red está en 348 ciudades de más de 100 países y se interconecta con más de 13 000 redes; alrededor del 95 % de los internautas del mundo están a menos de 50 ms de ella ([Cloudflare network](https://www.cloudflare.com/network/)). Dos decisiones de diseño importan para todo lo que sigue:

- **Anycast.** Las mismas direcciones IP se anuncian desde cada ubicación. Los paquetes de un visitante llegan al centro de datos más cercano mediante el enrutamiento ordinario de Internet, sin trucos de DNS geográfico. Si una ubicación falla, el enrutamiento lleva su tráfico a la siguiente.
- **Cada servidor ejecuta cada servicio.** No hay «cajas WAF» ni «cajas de caché»: cada máquina ejecuta toda la pila, de modo que un Worker, una regla WAF o una consulta a la caché se ejecutan en el centro de datos que recibió la petición.

### Cuentas, zonas y la nube naranja

- Una **cuenta** agrupa sus usuarios, la facturación y los productos de nivel de cuenta: Workers, almacenamiento (R2, D1, KV), Zero Trust, IA.
- Una **zona** es un dominio en Cloudflare (`example.com`) con sus registros DNS y sus ajustes de aplicación. Cada zona tiene su propio plan: Free, Pro (20 USD al mes con facturación anual), Business (200 USD) o un contrato (Enterprise) ([Plans](https://www.cloudflare.com/plans/)).
- Un registro DNS está **en proxy** (nube naranja) o es **solo DNS** (nube gris). En proxy: el registro responde con las direcciones anycast de Cloudflare y el tráfico HTTP pasa por el proxy, con todos los productos aplicados. Solo DNS: Cloudflare solo responde al DNS con su dirección real, y no se aplica ningún producto de aplicación.

Esta última distinción explica la mayoría de las sorpresas de los principiantes: una regla WAF, una regla de caché o una redirección no tienen ningún efecto en un nombre de host con nube gris, porque el tráfico nunca toca Cloudflare.

### La vida de una petición

Una petición a `https://www.example.com/shop?id=3` en un nombre de host en proxy pasa por estas etapas:

1. **DNS.** El resolvedor del visitante pregunta al DNS autoritativo de Cloudflare y obtiene una dirección anycast.
2. **Conexión.** El visitante se conecta al centro de datos más cercano. La protección DDoS a nivel de red descarta el tráfico de ataque antes de que llegue a cualquier otra cosa.
3. **TLS.** Cloudflare termina el TLS con el certificado edge de la zona (parte 3).
4. **Las fases de reglas.** La petición recorre las fases del Ruleset Engine, en un orden fijo (abajo).
5. **Workers.** Si coincide una ruta de Worker, el Worker se ejecuta. Los Workers se ejecutan delante de la caché; sus subpeticiones `fetch()` pasan por ella ([How the cache works](https://developers.cloudflare.com/workers/reference/how-the-cache-works/)).
6. **Caché.** Un recurso almacenable en caché se sirve desde la caché si está (un HIT); si no, Cloudflare lo obtiene del origen (un MISS) y puede guardarlo (parte 4).
7. **Origen.** Cloudflare se conecta a su servidor, cifrado según el modo SSL/TLS (parte 3).
8. **Fases de respuesta.** Errores personalizados, transformaciones de cabeceras de respuesta, compresión y, por último, registro.

Una petición puede terminar antes en dos puntos: una regla de seguridad que la bloquea o la somete a un desafío, o un HIT de la caché. Solo lo que supera ambos llega a su origen.

### El Ruleset Engine: un solo orden para todas las reglas

Casi todos los productos basados en reglas (redirecciones, transformaciones, WAF, limitación de velocidad, reglas de caché) son una **fase** de un mismo motor, con el mismo lenguaje de reglas (parte 5). Las fases se ejecutan en una secuencia fija; conocerla responde a preguntas como «¿mi redirección se ejecuta antes que mi regla WAF?» ([Phases list](https://developers.cloudflare.com/ruleset-engine/reference/phases-list/)). En la petición, por orden:

| # | Fase | Producto |
|---|---|---|
| 1 | `http_request_dynamic_redirect` | Single Redirects |
| 2 | `http_request_sanitize` | Normalización de URL |
| 3 | `http_request_transform` | URL Rewrite Rules |
| 4 | interna | Waiting Room |
| 5 | `http_config_settings` | Configuration Rules |
| 6 | `http_request_origin` | Origin Rules |
| 7 | `http_request_firewall_custom` | Reglas personalizadas del WAF |
| 8 | `http_ratelimit` | Reglas de limitación de velocidad |
| 9 | `http_request_firewall_managed` | WAF Managed Rules |
| 10 | `http_request_sbfm` | Super Bot Fight Mode |
| 11 | interna | Comprobación de Cloudflare Access |
| 12 | `http_request_redirect` | Bulk Redirects |
| 13 | `http_request_late_transform` | Request Header Transform Rules |
| 14 | `http_request_cache_settings` | Cache Rules |
| 15 | `http_request_snippets` | Snippets |
| 16 | `http_request_cloud_connector` | Cloud Connector |

API Shield y la protección DDoS HTTP también están en esta secuencia (API Shield detecta pronto y mitiga después de la limitación de velocidad). Tres consecuencias que conviene recordar:

- Una **Single Redirect** se ejecuta en primer lugar, antes de cualquier fase de seguridad: el WAF nunca ve una petición redirigida.
- Las **reglas personalizadas** van antes que las **reglas gestionadas**: una regla personalizada que salta o bloquea decide antes de que se ejecuten los conjuntos de reglas gestionados.
- Las **Cache Rules** llegan casi al final, después de la seguridad: una petición bloqueada nunca llega a la caché.

**Para recordar.** En proxy significa que se aplica cada producto; solo DNS, que no se aplica ninguno. Anycast envía a cada visitante a la más cercana de 348 ciudades, donde se ejecuta cada servicio. Las reglas siguen un orden de fases fijo, con las redirecciones primero y los ajustes de caché al final.

## Parte 2 — DNS

El DNS de Cloudflare es el interruptor que decide qué tráfico llega al proxy: solo los registros A, AAAA y CNAME pueden ir en proxy, y solo los registros en proxy reciben los productos de aplicación.

### Configurar una zona

| Configuración | Cómo funciona | Planes |
|---|---|---|
| Completa (primaria) | Sustituye los servidores de nombres de su registrador por los dos que Cloudflare asigna a la zona. Cloudflare es autoritativo para todo el dominio. | Todos |
| CNAME (parcial) | Su proveedor de DNS sigue siendo autoritativo; cada nombre de host que quiera en proxy es un CNAME a `<hostname>.cdn.cloudflare.net`. | Business, Enterprise |
| Secundaria | Cloudflare sirve copias de una zona que mantiene otro proveedor (transferencias de zona). | Enterprise |

La configuración completa es el caso normal y la que supone este curso. Una configuración parcial no puede poner en proxy el ápice salvo que su proveedor aplane los CNAME, y no recibe la protección DDoS a nivel de DNS, ya que no son los servidores de nombres de Cloudflare los que responden ([CNAME setup](https://developers.cloudflare.com/dns/zone-setups/partial-setup/)).

### Registros y estado del proxy

- **En proxy** (nube naranja): la respuesta es una dirección anycast de Cloudflare; la dirección de su origen queda oculta. Solo los registros **A, AAAA y CNAME** pueden ir en proxy; MX, TXT y los demás son siempre solo DNS ([Proxy status](https://developers.cloudflare.com/dns/proxy-status/)).
- **Solo DNS** (nube gris): la respuesta es su dirección real. Úselo para los servicios que el proxy HTTP no puede transportar: SSH en el puerto 22, un servidor de correo, un servidor de juegos.
- Si un registro A o AAAA de un nombre está en proxy, todos los registros A y AAAA de ese nombre se tratan como en proxy.
- El proxy transporta HTTP en los puertos 80, 8080, 8880, 2052, 2082, 2086, 2095 y HTTPS en 443, 2053, 2083, 2087, 2096, 8443. Los demás puertos necesitan Spectrum o un registro solo DNS ([Network ports](https://developers.cloudflare.com/fundamentals/reference/network-ports/)).

**Un error clásico.** `mail.example.com` en proxy, con el registro MX apuntando a él: el correo deja de funcionar, porque SMTP no puede pasar por el proxy HTTP. El nombre de host del correo debe ser solo DNS.

**Otro.** Ocultar su origen tras la nube naranja mientras un registro solo DNS como `direct.example.com` apunta al mismo servidor: cualquiera puede leer su dirección y atacar el origen directamente, saltándose el WAF. Las partes 6 y 9 muestran cómo cerrar el origen.

### TTL

Los registros en proxy tienen siempre el TTL **Auto**, fijado en 300 segundos. Los registros solo DNS pueden ir de 60 segundos (30 en Enterprise) a un día ([TTL](https://developers.cloudflare.com/dns/manage-dns-records/reference/ttl/)). Como un registro en proxy responde con las direcciones de Cloudflare, cambiar la IP de su origen detrás de él surte efecto de inmediato: los resolvedores de los visitantes siguen apuntando a Cloudflare.

### Aplanamiento de CNAME

El estándar DNS prohíbe un CNAME en el ápice de la zona (`example.com`), porque el ápice ya contiene los registros SOA y NS. Cloudflare lo permite mediante el **aplanamiento** (flattening): sigue él mismo la cadena de CNAME y responde con las direcciones A y AAAA finales. Una opción aplana todos los CNAME de la zona, no solo el ápice; puede romper la verificación de dominio de terceros que esperan ver el propio CNAME. Un destino que no se resuelve en ninguna dirección da una respuesta vacía (NODATA) ([CNAME flattening](https://developers.cloudflare.com/dns/cname-flattening/)).

### DNSSEC

DNSSEC firma las respuestas de la zona para que los resolvedores puedan detectar las falsificadas. En Cloudflare son dos pasos: activarlo en el panel, lo que firma la zona; y añadir en su registrador el **registro DS** que muestra Cloudflare, lo que enlaza la zona con la cadena de confianza del padre. Si traslada una zona a otro sitio, quite primero el registro DS, o los resolvedores que validan rechazarán todas las respuestas.

### Ejemplo resuelto

Una pequeña empresa traslada `example.com` a Cloudflare:

| Nombre | Tipo | Contenido | Proxy |
|---|---|---|---|
| `example.com` | A | 203.0.113.10 | En proxy |
| `www` | CNAME | `example.com` | En proxy |
| `api` | A | 203.0.113.20 | En proxy |
| `ssh` | A | 203.0.113.10 | Solo DNS |
| `example.com` | MX | `mail.example.com` (prioridad 10) | Solo DNS (siempre) |
| `mail` | A | 198.51.100.5 | Solo DNS |
| `example.com` | TXT | `v=spf1 mx -all` | Solo DNS (siempre) |

El registro `ssh` expone 203.0.113.10, la dirección del origen web. Mejor: poner SSH detrás de Cloudflare Tunnel y Access (parte 9) y borrar el registro.

**Para recordar.** Solo A, AAAA y CNAME pueden ir en proxy, en los puertos HTTP y HTTPS de la lista. Los registros en proxy tienen un TTL fijo de 300 segundos. Un registro solo DNS en el mismo servidor que uno en proxy delata su origen.

## Parte 3 — SSL/TLS

Una petición en proxy tiene dos conexiones TLS, del visitante a Cloudflare y de Cloudflare al origen; el modo de cifrado decide cómo se hace la segunda, y **Full (strict)** es el único modo cifrado y autenticado de extremo a extremo.

### Los modos de cifrado

| Modo | Visitante → Cloudflare | Cloudflare → origen | Certificado del origen comprobado |
|---|---|---|---|
| Off | Solo HTTP | HTTP | — |
| Flexible | HTTP o HTTPS | HTTP, siempre | — |
| Full | HTTP o HTTPS | El mismo esquema que el visitante | No: cualquier certificado, incluso autofirmado o caducado |
| Full (strict) | HTTP o HTTPS | El mismo esquema que el visitante | Sí: una CA pública o la Origin CA de Cloudflare, válido y que coincida con el nombre de host |
| Strict (SSL-only origin pull) | HTTP o HTTPS | HTTPS, siempre | Sí |

Las zonas nuevas usan **Automatic SSL/TLS**: Cloudflare sondea el origen y elige el modo más seguro que admite, y nunca pasa una zona a uno más débil. Cloudflare recomienda Full o Full (strict) ([Encryption modes](https://developers.cloudflare.com/ssl/origin-configuration/ssl-modes/)).

Por qué Flexible es peligroso: el visitante ve un candado, pero la petición cruza Internet en claro de Cloudflare a su servidor. Por qué Full no basta: sin comprobar el certificado, cualquiera que pueda secuestrar la ruta hacia su origen puede hacerse pasar por él.

### El bucle de redirección

El problema SSL más común en Cloudflare: la zona está en **Flexible** y el origen redirige HTTP a HTTPS. El visitante pide `https://`; Cloudflare pregunta al origen por HTTP; el origen responde «301, vaya a https»; el navegador vuelve a pedir `https://`, y así sucesivamente (`ERR_TOO_MANY_REDIRECTS`). La solución es dar un certificado al origen y pasar a Full (strict), no quitar la redirección.

### Certificados edge: lo que ven los visitantes

- **Universal SSL** (gratuito, automático): cubre el ápice y los subdominios de primer nivel, `example.com` y `*.example.com`. **No** cubre `dev.www.example.com` ([Universal SSL limitations](https://developers.cloudflare.com/ssl/edge-certificates/universal-ssl/limitations/)).
- **Advanced Certificate Manager** (de pago): certificados para los nombres de host elegidos, elección de CA y de validez, y **Total TLS**, que emite un certificado para cada nombre de host en proxy, por profundo que sea.
- **Certificados personalizados** (Business y Enterprise): suba los suyos.

Ajustes edge para cada zona:

- **Always Use HTTPS**: redirige cada petición `http://` a `https://` en el borde.
- **Versión mínima de TLS**: 1.2 para la mayoría de los sitios; TLS 1.0 y 1.1 están obsoletos.
- **TLS 1.3**: activado.
- **HSTS**: indica a los navegadores que usen solo HTTPS durante `max-age` segundos. Actívelo cuando HTTPS funcione en todas partes: un navegador que ha visto HSTS rechazará HTTP hacia su sitio hasta que caduque, e `includeSubDomains` lo extiende a todos los subdominios.

### Certificados de origen: lo que ve Cloudflare

- **Cloudflare Origin CA** emite certificados gratuitos para su origen, de hasta 15 años, con comodines de un nivel y hasta 200 nombres. Solo Cloudflare confía en ellos: funcionan tras la nube naranja con Full (strict), y los navegadores los rechazan si un nombre de host pasa a solo DNS ([Origin CA](https://developers.cloudflare.com/ssl/origin-configuration/origin-ca/)).
- Un certificado público (Let's Encrypt, por ejemplo) también funciona con Full (strict), y sigue funcionando si algún día desactiva el proxy.

### Cerrar el origen a todo salvo Cloudflare

Un origen que responde a cualquiera anula el WAF: los atacantes encuentran su dirección y rodean Cloudflare. Tres formas de cerrarlo, de la más débil a la más fuerte:

1. **Limitar el origen por cortafuegos a los rangos IP publicados de Cloudflare.** Sencillo, pero el tráfico de cualquier cliente de Cloudflare también viene de esos rangos.
2. **Authenticated Origin Pulls** (mTLS): Cloudflare presenta un certificado de cliente y el origen rechaza las conexiones sin él. El certificado global solo demuestra que la petición pasó por Cloudflare; un certificado propio, de zona o por nombre de host, demuestra que pasó por **su** zona ([Authenticated Origin Pulls](https://developers.cloudflare.com/ssl/origin-configuration/authenticated-origin-pull/explanation/)).
3. **Cloudflare Tunnel** (parte 9): el origen solo abre conexiones salientes hacia Cloudflare y no acepta ningún tráfico entrante. Ningún puerto abierto, nada que encontrar.

**Para recordar.** Use Full (strict) con un certificado de Origin CA o público. Flexible más una redirección HTTPS en el origen es un bucle. Universal SSL cubre un nivel de subdominio. Cierre el origen con mTLS o un túnel.
## Parte 4 — Caché y rendimiento

Por defecto, Cloudflare guarda en caché los archivos estáticos según su extensión, y nunca el HTML ni el JSON; todo lo demás sobre la caché consiste en decidir, con Cache Rules y cabeceras, qué más guardar, durante cuánto tiempo y con qué clave.

### Qué se guarda en caché por defecto

- La caché se decide por **extensión de archivo**, no por tipo MIME: imágenes, vídeo, audio, fuentes, archivos comprimidos, PDF, CSS, JS y `robots.txt` se guardan; **el HTML y el JSON no** ([Default cache behavior](https://developers.cloudflare.com/cache/concepts/default-cache-behavior/)).
- Una respuesta **no** se guarda si lleva `Cache-Control: private`, `no-store`, `no-cache` o `max-age=0`, si establece una cookie (`Set-Cookie`), o si la petición no es un GET.
- Archivo más grande que se puede guardar: 512 MB en Free, Pro y Business; 5 GB en Enterprise.
- Los puertos 2052, 2053, 2082, 2083, 2086, 2087, 2095, 2096, 8880 y 8443 van en proxy pero no se guardan en caché.

### Durante cuánto tiempo: Edge TTL y Browser TTL

Dos relojes distintos:

- **Edge Cache TTL**: cuánto tiempo guarda Cloudflare el objeto. Por defecto sigue el `Cache-Control` del origen (`s-maxage` y luego `max-age`) o `Expires`. Sin cabeceras de caché, Cloudflare aplica valores por defecto según el código de estado: **200, 206 y 301 durante 120 minutos; 302 y 303 durante 20 minutos; 404 y 410 durante 3 minutos**; nada más se guarda.
- **Browser Cache TTL**: lo que Cloudflare indica al navegador del visitante. Por defecto **4 horas**. Cloudflare eleva a este valor un valor de origen más corto, y lo añade cuando el origen no envía cabecera; «Respect existing headers» desactiva este comportamiento ([Edge and Browser TTL](https://developers.cloudflare.com/cache/how-to/edge-browser-cache-ttl/)).

El Edge TTL más corto que puede fijar es de 2 horas en Free, 1 hora en Pro y 1 segundo en Business y Enterprise. Purgar la caché no borra lo que ya tienen los navegadores: un Browser TTL largo en un archivo que podría cambiar es una promesa que no puede retirar. Use nombres de archivo versionados (`app.3f9a1c.js`) con TTL largos, y TTL cortos en el HTML que los referencia.

**`CDN-Cache-Control`** (y `Cloudflare-CDN-Cache-Control`) permite al origen dar a la CDN una duración distinta de la del navegador: `Cache-Control: max-age=60` para los navegadores, `CDN-Cache-Control: max-age=86400` para el borde.

### Leer CF-Cache-Status

| Valor | Significado |
|---|---|
| `HIT` | Servido desde la caché de Cloudflare |
| `MISS` | No estaba en caché; obtenido del origen (y guardado si se puede) |
| `EXPIRED` | Estaba en caché pero caducado; obtenido de nuevo del origen |
| `REVALIDATED` | Copia caducada que el origen confirma sin cambios (304) y que se sirve |
| `STALE` / `UPDATING` | Copia caducada servida mientras Cloudflare la actualiza |
| `BYPASS` | El origen o una regla indicó a Cloudflare que no guardara (cookie, `no-cache`, regla de bypass) |
| `DYNAMIC` | No apto para caché por defecto (HTML, una respuesta de API) |

Un sitio cuyo HTML muestra `DYNAMIC` hace lo que debe por defecto. Para guardarlo, escriba una Cache Rule.

### Cache Rules

Una Cache Rule es una expresión (parte 5) más unos ajustes: **Eligible for cache** («guardarlo todo») o **Bypass**, Edge TTL (respetar el origen, sustituirlo o por código de estado), Browser TTL, clave de caché, servir contenido caducado y otros. Las reglas sustituyen a las antiguas Page Rules. Ejemplo: guardar el HTML del blog durante una hora en el borde, pero nunca para los usuarios con sesión iniciada.

```
Expression: (http.host eq "www.example.com" and starts_with(http.request.uri.path, "/blog/") and not http.cookie contains "session=")
Then:       Eligible for cache; Edge TTL: override origin, 1 hour; Browser TTL: respect origin
```

### Claves de caché

La clave de caché decide qué peticiones comparten un objeto guardado. Por defecto es el esquema, el host, la ruta **y toda la cadena de consulta**, más la cabecera `Origin` y algunas cabeceras de reenvío ([Cache keys](https://developers.cloudflare.com/cache/how-to/cache-keys/)). Así, `/logo.png?utm_source=mail` y `/logo.png?utm_source=ad` son dos objetos, dos MISS. Todos los planes pueden ignorar u ordenar la cadena de consulta y separar por tipo de dispositivo en una Cache Rule; elegir parámetros de consulta, cabeceras, cookies o el host para la clave es de Enterprise.

### Purgar

Todos los planes pueden purgar por URL única, todo, cache tag, nombre de host y prefijo. Las purgas por URL única son las más baratas: 800 URL por segundo en Free. Los demás métodos están limitados a 5 peticiones por minuto en Free, 5 por segundo en Pro, 10 en Business y 50 en Enterprise ([Purge cache](https://developers.cloudflare.com/cache/how-to/purge-cache/)). Una respuesta 200 significa que la purga se ha aceptado, no que haya terminado; compruebe que la respuesta siguiente ya no es un `HIT`.

### Menos viajes al origen

- **Tiered Cache**: los centros de datos con MISS preguntan a un centro de datos de **nivel superior** antes que al origen, de modo que solo unas pocas ubicaciones lo contactan. **Smart Tiered Cache** elige el nivel superior más cercano a su origen y es gratuito en todos los planes ([Tiered Cache](https://developers.cloudflare.com/cache/how-to/tiered-cache/)).
- **Cache Reserve**: una caché persistente construida sobre R2, por encima del nivel superior. Los objetos necesitan un TTL de al menos 10 horas y un `Content-Length`; permanecen 30 días después de su última petición. 0,015 USD por GB-mes, 4,50 USD por millón de escrituras, 0,36 USD por millón de lecturas ([Cache Reserve](https://developers.cloudflare.com/cache/advanced-configuration/cache-reserve/)).
- **Argo Smart Routing**: para lo que no se puede guardar, encamina el tráfico hacia el origen por las rutas más rápidas de Cloudflare en lugar de las rutas por defecto de la Internet pública.

### Ejemplo resuelto

Un origen devuelve `/products` (HTML, sin `Cache-Control`) y `/img/shoe.jpg` (`Cache-Control: max-age=600`), en el plan Free con los ajustes por defecto.

- `/products`: `DYNAMIC`, nunca se guarda; cada petición va al origen.
- `/img/shoe.jpg`: guardado en el borde durante 600 segundos, según la cabecera del origen. Al navegador se le indican 4 horas, porque Cloudflare eleva un valor de origen más corto al Browser TTL por defecto.
- `/img/shoe.jpg?size=2`: otra clave de caché, otro MISS.

**Para recordar.** Las extensiones deciden el comportamiento por defecto; el HTML y el JSON necesitan una Cache Rule. Edge TTL y Browser TTL son independientes. La cadena de consulta forma parte de la clave. Smart Tiered Cache es gratuito: actívelo.

## Parte 5 — Reglas y tráfico

Cada producto de reglas es el mismo par, una **expresión** que selecciona peticiones y una **acción** con sus ajustes; aprender una vez el lenguaje de reglas le permite escribir igual redirecciones, reescrituras, reglas de caché y reglas WAF.

### El lenguaje de reglas

Una expresión compara **campos** de la petición con **valores** mediante **operadores**, con una sintaxis inspirada en la de Wireshark:

```
(http.host eq "shop.example.com" and http.request.uri.path wildcard "/admin/*") or ip.src in {192.0.2.0/24}
```

Los campos que más usará:

| Campo | Valor de ejemplo |
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
| `http.request.headers["x-api-key"]` | una matriz con los valores de la cabecera |
| `cf.bot_management.score` | 1 (bot) a 99 (humano); Bot Management |
| `cf.threat_score` | antigua puntuación de reputación |

Operadores ([Operators](https://developers.cloudflare.com/ruleset-engine/rules-language/operators/)):

| Operador | Significado | Nota |
|---|---|---|
| `eq`, `ne` (`==`, `!=`) | igual, distinto | distingue mayúsculas en cadenas |
| `lt`, `le`, `gt`, `ge` | comparaciones numéricas |  |
| `contains` | subcadena | distingue mayúsculas |
| `wildcard` | el valor entero coincide con un patrón con `*` | **no distingue mayúsculas** |
| `strict wildcard` | igual, distinguiendo mayúsculas |  |
| `matches` (`~`) | expresión regular (regex de Rust) | **solo Business y Enterprise** |
| `in` | en un conjunto o lista: `{"GET" "HEAD"}`, `{10.0.0.0/8}`, `$my_list` |  |

Operadores lógicos, de mayor a menor precedencia: `not`, `and`, `xor`, `or`. Así, `a or b and c` significa `a or (b and c)`: use paréntesis.

Las funciones transforman valores: `lower()`, `starts_with()`, `ends_with()`, `len()`, `concat()`, `url_decode()`, `regex_replace()`, `wildcard_replace()`, y `any()` / `all()` sobre matrices, como `any(http.request.headers["accept"][*] contains "json")`.

Tres trampas:

- `http.request.uri.path eq "/Admin"` no coincide con `/admin`: la comparación de cadenas distingue mayúsculas. Use `lower(http.request.uri.path) eq "/admin"`, o `wildcard`.
- `http.request.uri.path contains "/api"` también coincide con `/static/api-docs.png`. Mejor `starts_with(http.request.uri.path, "/api/")`.
- Los nombres de cabecera en `http.request.headers` van en minúsculas.

### Redirecciones

- **Single Redirects**: una regla por patrón, con un destino estático o dinámico construido por una expresión, como `concat("https://www.example.com", http.request.uri.path)`. Estado 301, 302, 303, 307 o 308; opción de conservar la cadena de consulta. Se ejecutan antes que todas las demás fases.
- **Bulk Redirects**: listas de nivel de cuenta con miles de URL origen → destino, para migraciones. Se ejecutan después de las fases de seguridad.

301 y 308 son permanentes y los navegadores los guardan; 307 y 308 conservan el método y el cuerpo de un POST, 301 y 302 pueden cambiarlo a GET.

### Transformaciones, orígenes, configuración

| Producto | Qué cambia | Ejemplo |
|---|---|---|
| URL Rewrite Rules | La ruta y la consulta que ve el origen; la URL del visitante no cambia | `/blog/42` servido desde `/index.php?p=42` |
| Request Header Transform Rules | Las cabeceras enviadas al origen | añadir `X-Client-Country: ${ip.src.country}` |
| Response Header Transform Rules | Las cabeceras enviadas al visitante | añadir `Strict-Transport-Security`, quitar `X-Powered-By` |
| Managed Transforms | Conjuntos de cabeceras ya preparados | añadir cabeceras de ubicación del visitante; quitar `X-Powered-By` |
| Origin Rules | Adónde va la petición: cabecera Host, SNI, registro DNS (resolve override), puerto de destino | `/docs/*` a otro origen en el puerto 8443 |
| Configuration Rules | Ajustes de zona por petición: modo SSL, nivel de seguridad, Rocket Loader, Polish y otros | desactivar Rocket Loader en `/checkout` |
| Compression Rules | Gzip, Brotli, Zstandard por tipo de contenido | Zstandard para `text/html` |
| Custom Errors | Su página para los errores del origen o de Cloudflare | una página 502 con su marca |

Una reescritura no es una redirección: una redirección envía al visitante una URL nueva (un 3xx); una reescritura solo cambia lo que recibe el origen, de forma invisible ([Rules overview](https://developers.cloudflare.com/rules/)). Estos productos sustituyen a las antiguas **Page Rules**, un patrón con varios ajustes; la guía de migración de Cloudflare asigna cada ajuste de Page Rule a su regla moderna.

### Snippets: código dentro de las reglas

Los Snippets son funciones JavaScript cortas asociadas a una regla, para la lógica que las reglas no pueden expresar: poner una cookie, repartir un test A/B, firmar una cabecera. Se ejecutan después de las Cache Rules, en 5 ms y 2 MB de memoria como máximo, con un máximo de 32 KB de código y de 2 a 5 subpeticiones; 25 snippets en Pro, 50 en Business, 300 en Enterprise, ninguno en Free ([Snippets](https://developers.cloudflare.com/rules/snippets/)). Cualquier cosa más grande, con estado o que use bindings es un Worker (parte 7).

### Balanceo de carga

Load Balancing reparte el tráfico entre varios orígenes y conmuta cuando uno cae. El modelo tiene tres niveles:

1. Un **load balancer** responde para un nombre de host, como `app.example.com`, y ordena sus **pools**.
2. Un **pool** agrupa **endpoints** (sus servidores), a menudo un pool por región o por nube, con un mínimo de endpoints sanos.
3. Un **monitor** sondea cada endpoint (HTTP, HTTPS, TCP; una ruta, un código esperado, un intervalo) y lo marca como sano o no.

La **steering policy** elige un pool entre los sanos: Standard (off/failover: el primer pool sano por orden; o aleatorio con pesos), Geo (pools por región o país), Dynamic (la menor latencia medida), Proximity (el más cercano por coordenadas) y Least Outstanding Requests ([Steering policies](https://developers.cloudflare.com/load-balancing/understand-basics/traffic-steering/steering-policies/)). Dentro de un pool, el **endpoint steering** elige el servidor: aleatorio con pesos, hash (fijo por IP) o least outstanding requests. Un load balancer en proxy añade afinidad de sesión por cookie; uno solo DNS se limita a responder al DNS con una dirección sana.

**Para recordar.** `and` se evalúa antes que `or`; `eq` y `contains` distinguen mayúsculas, `wildcard` no; `matches` necesita Business. Una redirección cambia la URL, una reescritura no. Load balancer → pools → endpoints, con monitores que deciden la salud.

## Parte 6 — Seguridad

La seguridad de aplicaciones en Cloudflare va por capas: la protección DDoS es automática, y después sus reglas personalizadas, los límites de velocidad, los conjuntos de reglas gestionados y la detección de bots se ejecutan en ese orden en cada petición en proxy; cada capa puede detener la petición antes de que la vea la siguiente.

### Protección DDoS

La protección DDoS de capa de red (L3/4) y HTTP (L7) está activa en cada zona, en cada plan, y **sin límite de volumen**: no se le factura el tráfico de ataque. Los conjuntos de reglas DDoS gestionados detectan los ataques automáticamente; puede ajustar su sensibilidad o su acción, pero no desactivarlos. El resto de esta parte trata de los ataques que parecen peticiones normales: inyecciones, credential stuffing, scraping, abusos.

### Reglas personalizadas del WAF

Una regla personalizada es una expresión (parte 5) y una **acción**:

| Acción | Efecto |
|---|---|
| Block | Devuelve 403 (o su respuesta personalizada) |
| Managed Challenge | Cloudflare elige: una comprobación invisible o un desafío si hace falta. El desafío recomendado |
| JS Challenge / Interactive Challenge | Desafíos más antiguos y fijos |
| Skip | Hace que la petición se salte las reglas personalizadas restantes u otros productos (reglas gestionadas, limitación de velocidad, bots) |
| Log | Solo registra; Enterprise |

Las reglas se evalúan por orden; la primera acción **terminal** (Block, un desafío) pone fin a la evaluación. Free tiene 5 reglas personalizadas, Pro 20, Business 100, Enterprise 1000; `matches` (regex) necesita Business ([Custom rules](https://developers.cloudflare.com/waf/custom-rules/)). Las listas (de IP, de ASN, de nombres de host) mantienen cortas las reglas: `ip.src in $office_ips`.

Tres reglas que quieren casi todos los sitios:

```
# 1. Administración solo desde la oficina
(starts_with(http.request.uri.path, "/wp-admin") and not ip.src in $office_ips)  →  Block

# 2. Desafío a los inicios de sesión desde países a los que no da servicio
(http.request.uri.path eq "/login" and not ip.src.country in {"CH" "FR" "DE" "IT" "ES"})  →  Managed Challenge

# 3. Dejar pasar intactas las comprobaciones de salud de un socio
(ip.src in $partner_ips and http.request.uri.path eq "/health")  →  Skip: all remaining custom rules, rate limiting, managed rules
```

### Reglas de limitación de velocidad

Una regla de limitación de velocidad cuenta las peticiones que coinciden con una expresión, agrupadas por **características** (la IP por defecto), durante un **periodo**; por encima del umbral aplica una acción durante un **tiempo de mitigación**.

| Plan | Reglas | Cuenta por | Periodo | Tiempo |
|---|---|---|---|---|
| Free | 1 | IP | 10 s | 10 s |
| Pro | 2 | IP | hasta 1 min | hasta 1 h |
| Business | 5 | IP, IP con soporte de NAT | hasta 10 min | hasta 1 día |
| Enterprise (Advanced Rate Limiting) | 100 | también cabeceras, cookies, consulta, ASN, país, JA3/JA4, campos del cuerpo JSON y más | hasta 65 535 s | hasta 1 día |

Los contadores se llevan **por centro de datos**, no a escala global ([Request rate](https://developers.cloudflare.com/waf/rate-limiting-rules/request-rate/)): una botnet repartida por muchas ciudades puede quedar en todas partes por debajo de un límite por IP. La limitación de velocidad frena las avalanchas de pocas fuentes; los bots y los desafíos gestionados se ocupan de las distribuidas ([Rate limiting rules](https://developers.cloudflare.com/waf/rate-limiting-rules/)).

Ejemplo: como máximo 5 POST a `/login` por IP en 1 minuto, y después bloqueo durante 10 minutos. Peticiones contadas: `(http.request.uri.path eq "/login" and http.request.method eq "POST")`; características: IP; periodo 60 s; peticiones 5; acción Block; duración 600 s (Business, por el tiempo de 10 minutos).

### Conjuntos de reglas gestionados

- **Cloudflare Free Managed Ruleset**: en todos los planes, vulnerabilidades de gran impacto (del tipo Log4Shell).
- **Cloudflare Managed Ruleset** (Pro y superiores): las reglas de Cloudflare contra ataques comunes y exploits propios de los CMS, actualizadas por el equipo de Cloudflare.
- **Cloudflare OWASP Core Ruleset**: la versión de Cloudflare del OWASP CRS, que funciona por **puntuación**. Cada regla que coincide suma puntos; el total de la petición se compara con un umbral: **60 para Low, 40 para Medium (por defecto), 25 para High**. El **nivel de paranoia** (PL1 a PL4) elige qué reglas se ejecutan: PL2 ejecuta las reglas PL1 y PL2, y así sucesivamente ([OWASP concepts](https://developers.cloudflare.com/waf/managed-rules/reference/owasp-core-ruleset/concepts/)).
- **Detección de credenciales expuestas / filtradas**: señala los inicios de sesión que usan un usuario y una contraseña conocidos por filtraciones.

Los falsos positivos se corrigen con una **excepción** (una regla skip para ese ID de regla en esa ruta), no desactivando todo el conjunto. Despliegue las reglas nuevas primero en Log cuando pueda, y después pase a Block.

### Bots

| Producto | Plan | Qué ofrece |
|---|---|---|
| Bot Fight Mode | Free | Un interruptor: desafío a los bots detectados en toda la zona |
| Super Bot Fight Mode | Pro, Business | Una acción por categoría: definitivamente automatizado, probablemente automatizado, bots verificados; recursos estáticos protegidos o no |
| Bot Management | Complemento Enterprise | Una **bot score** por petición, de 1 (seguro que es un bot) a 99 (seguro que es humano), utilizable en cualquier regla; huellas JA3/JA4; ID de detección |

([Bot solutions](https://developers.cloudflare.com/bots/)). Los **bots verificados** (buscadores, monitorización) son bots buenos conocidos, así que las reglas suelen dejarlos pasar: `cf.bot_management.verified_bot`. Los rastreadores de IA se pueden bloquear con un interruptor, o gestionar uno a uno con AI Crawl Control.

**Turnstile** sustituye a los CAPTCHA en sus formularios, estén o no en Cloudflare: un widget (Managed, Non-interactive o Invisible) da un token al navegador, y **su servidor debe validarlo** con la API siteverify antes de fiarse del formulario. Un token es válido durante 300 segundos y una sola vez ([Turnstile](https://developers.cloudflare.com/turnstile/)).

### API

**API Shield** protege las API JSON: descubrimiento de endpoints, **validación de esquema** según su archivo OpenAPI (tipos erróneos y campos desconocidos bloqueados), **validación de JWT**, **mTLS** para clientes como aplicaciones móviles o dispositivos, y reglas de secuencia que detectan llamadas fuera del orden esperado. Combínelo con una limitación de velocidad por clave de API: `http.request.headers["x-api-key"]` como característica necesita Advanced Rate Limiting.

### Ejemplo resuelto: juntar las capas

Un endpoint de inicio de sesión bajo un ataque de credential stuffing, plan Business:

1. Regla personalizada: Managed Challenge en `/login` para un `cf.threat_score` alto o para países a los que no da servicio.
2. Limitación de velocidad: 5 POST por IP y minuto en `/login`, bloqueo de 10 minutos.
3. Reglas gestionadas: Cloudflare Managed Ruleset y OWASP en Medium, con detección de credenciales filtradas; añada una cabecera de petición para que la aplicación obligue a cambiar la contraseña cuando se use un par filtrado.
4. Super Bot Fight Mode: «definitivamente automatizado» bloqueado, «probablemente automatizado» con desafío.
5. Turnstile en el propio formulario de inicio de sesión, validado en el servidor.

**Para recordar.** Reglas personalizadas → limitación de velocidad → reglas gestionadas → bots, en ese orden. Managed Challenge es el desafío por defecto. Los contadores de limitación de velocidad son por centro de datos. OWASP bloquea por una puntuación sumada, no por una sola regla. Valide los tokens de Turnstile en su servidor.
## Parte 7 — Workers

Un Worker es JavaScript, TypeScript o WebAssembly que se ejecuta en un isolate de V8 en cada centro de datos de Cloudflare, arranca en milisegundos y llega al almacenamiento, a las colas y a la IA mediante **bindings** en lugar de llamadas de red; es el centro de la plataforma para desarrolladores.

### El modelo de ejecución

- **Isolates, no contenedores.** Cada Worker se ejecuta en un isolate de V8, varios por proceso. No hay arranque en frío en el sentido de los contenedores: el arranque está limitado a 1 segundo y suele durar unos milisegundos.
- **API estándar de la web.** `fetch`, `Request`, `Response`, `URL`, Streams, Web Crypto; con el indicador `nodejs_compat`, la mayoría de las API de Node (`node:crypto`, `node:buffer`, `node:stream`…).
- **Sin estado entre peticiones.** Un isolate puede servir muchas peticiones, o desecharse en cualquier momento. No guarde nunca datos de una petición en variables de módulo: la petición siguiente, quizá de otro usuario, los verá. El estado vive en el almacenamiento (parte 8).
- **Dónde se ejecuta.** Por defecto, en el centro de datos que recibió la petición. **Smart Placement** traslada un Worker que hace muchos viajes de ida y vuelta a un mismo backend (una base de datos en una región) cerca de ese backend.

### Un primer Worker

```ts
export interface Env {
  GREETINGS: KVNamespace;      // un binding de KV
  API_TOKEN: string;           // un secreto
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname === "/hello") {
      const name = url.searchParams.get("name") ?? "world";
      const greeting = (await env.GREETINGS.get("greeting")) ?? "Hello";
      ctx.waitUntil(logVisit(env, name));            // después de la respuesta, sin retrasarla
      return Response.json({ message: `${greeting}, ${name}!` });
    }
    return new Response("Not found", { status: 404 });
  },
};
```

El módulo exporta **handlers**: `fetch` para HTTP, `scheduled` para los Cron Triggers, `queue` para los consumidores de Queues, `email` para Email Routing. `env` lleva los bindings, las variables y los secretos; `ctx.waitUntil()` mantiene vivo el Worker para trabajo en segundo plano después de la respuesta.

### Wrangler y el archivo de configuración

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

- **`compatibility_date`** congela el comportamiento del runtime en una fecha: una nueva versión del runtime nunca cambia su Worker hasta que usted mueva la fecha. Ponga la fecha de hoy en un proyecto nuevo y actualícela a propósito.
- Los **secretos** nunca van en este archivo ni en el código: `wrangler secret put API_TOKEN` los guarda cifrados. Las `vars` sencillas son para ajustes no secretos.
- Los **entornos** (`env.staging`) despliegan el mismo código como un Worker aparte, con su propio nombre, rutas y bindings: `wrangler deploy --env staging`.
- Comandos que conviene conocer: `wrangler dev` (local, puerto 8787, con simulaciones locales de KV, D1, R2), `wrangler deploy`, `wrangler tail` (registros en directo), `wrangler versions` y los despliegues graduales (enviar el 10 % del tráfico a una versión nueva y luego el 100 %).

Cloudflare tiene también una CLI más reciente, `cf`, en beta, con un archivo de configuración en TypeScript (`cloudflare.config.ts`) y `cf migrate` para convertir un proyecto de Wrangler; algunos comandos, como `tail` y `secret put`, siguen pasando por Wrangler ([cf CLI](https://developers.cloudflare.com/cf/wrangler/reference/)). Este curso usa Wrangler.

### Cómo recibe tráfico un Worker

- **workers.dev**: `hello-api.<your-subdomain>.workers.dev`, para desarrollo.
- **Custom Domain**: el Worker *es* el origen de `api.example.com`; Cloudflare crea el registro DNS y el certificado. La zona debe estar en Cloudflare.
- **Route**: el Worker se ejecuta delante de un origen existente para un patrón como `example.com/api/*`, y puede llamar a `fetch(request)` para pasar la petición.

### Recursos estáticos y aplicaciones full-stack

Los Workers sirven archivos estáticos directamente: colóquelos en el directorio `assets` y se sirven desde el borde, gratis y sin límite, antes de que se ejecute su código (o después, con `run_worker_first`). Cloudflare recomienda ahora **Workers con recursos estáticos** en lugar de Pages para sitios nuevos, aplicaciones de una sola página y frameworks full-stack (React Router, Next.js mediante OpenNext, Astro, SvelteKit) ([Best practices](https://developers.cloudflare.com/workers/best-practices/workers-best-practices/)). Los Workers tienen funciones que Pages no tiene: Cron Triggers, consumidores de Queues, Durable Objects, despliegues graduales, Workers Logs ([Migrate from Pages](https://developers.cloudflare.com/workers/static-assets/migration-guides/migrate-from-pages/)).

### Límites y precios

|  | Workers Free | Workers Paid (mínimo 5 USD al mes) |
|---|---|---|
| Peticiones | 100 000 al día | 10 millones al mes incluidos, después 0,30 USD por millón |
| Tiempo de CPU por petición | 10 ms | 30 s por defecto, hasta 5 min; 30 millones de ms de CPU al mes incluidos, después 0,02 USD por millón |
| Memoria | 128 MB por isolate | 128 MB por isolate |
| Subpeticiones por invocación | 50 | 10 000 por defecto |
| Tamaño del Worker | 64 MiB sin comprimir | 64 MiB sin comprimir |
| Workers por cuenta | 100 | 500 |

**Se factura el tiempo de CPU, no el tiempo transcurrido**: un Worker que espera 2 segundos a una API lenta casi no usa CPU. No se cobra el tráfico de salida, y las peticiones de recursos estáticos son gratuitas ([Pricing](https://developers.cloudflare.com/workers/platform/pricing/), [Limits](https://developers.cloudflare.com/workers/platform/limits/)).

### Observabilidad

Active **Workers Logs** (`observability.enabled`) y registre en JSON estructurado; añada Traces antes de producción. `wrangler tail` emite los registros en directo; los **Tail Workers** reciben los registros y excepciones de cada invocación para reenviarlos a otro sitio; **Logpush** los exporta a un almacenamiento.

**Para recordar.** Isolates, no contenedores; nada de estado por petición en variables globales. Bindings, no llamadas REST. Secretos con `wrangler secret put`. Lo que se limita y se factura es el tiempo de CPU. Sitios nuevos: Workers con recursos estáticos.

## Parte 8 — Almacenamiento y estado

Los Workers no tienen estado, así que cada aplicación elige dónde vive el suyo; la elección trata sobre todo de **consistencia**: KV es rápido y de consistencia eventual, R2 y D1 son almacenes de consistencia fuerte, y los Durable Objects dan a cada pieza de estado un único propietario de un solo hilo.

### Elegir

| Producto | Qué es | Consistencia | Úselo para | Evítelo para |
|---|---|---|---|---|
| Workers KV | Almacén clave-valor global, en caché en el borde | Eventual: hasta 60 s o más para verse en otro lugar | Configuración, feature flags, sesiones que se leen mucho más de lo que se escriben | Contadores, todo lo que se escribe a menudo o necesita leer tras escribir |
| R2 | Almacenamiento de objetos compatible con S3, sin tarifas de salida | Fuerte, por objeto | Archivos, imágenes, copias de seguridad, conjuntos de datos, registros | Valores pequeños leídos y escritos en cada petición |
| D1 | Bases de datos SQLite serverless, de hasta 10 GB cada una | Fuerte (un primario); réplicas de lectura opcionales | Datos relacionales: usuarios, pedidos, catálogos | Bases muy grandes o con muchísimas escrituras |
| Durable Objects | Un objeto con un nombre único, con código y almacenamiento SQLite privado | Fuerte, transaccional, de un solo hilo | Coordinación: salas de chat, contadores, limitadores de velocidad, partidas, estado por usuario, WebSockets | Grandes consultas analíticas sobre todos los objetos |
| Queues | Cola de mensajes entre Workers | Entrega al menos una vez | Tareas en segundo plano, búfer, reparto (fan-out) | Trabajo de petición/respuesta |
| Workflows | Programas duraderos de varios pasos con reintentos y pausas | El resultado de cada paso se guarda | Flujos de pedidos, secuencias de bienvenida, tareas de IA, todo lo que espera horas o días | Atender peticiones en menos de un segundo |
| Hyperdrive | Pool de conexiones y caché hacia su propio Postgres o MySQL | La de su base de datos; las lecturas en caché pueden estar desfasadas | Conservar una base de datos existente | Proyectos nuevos sin base de datos previa |

([Storage options](https://developers.cloudflare.com/workers/platform/storage-options/))

### Workers KV

Las escrituras van a almacenes centrales; las lecturas se sirven desde cachés en cada ubicación. Un cambio «puede tardar hasta 60 segundos o más» en verse en otro sitio, y ni siquiera leer la propia escritura está garantizado ([How KV works](https://developers.cloudflare.com/kv/concepts/how-kv-works/)). Como máximo **una escritura por segundo en la misma clave**; valores de hasta 25 MiB, claves de hasta 512 bytes ([KV limits](https://developers.cloudflare.com/kv/platform/limits/)).

```ts
await env.FLAGS.put("checkout-v2", "on", { expirationTtl: 3600 });
const flag = await env.FLAGS.get("checkout-v2", { cacheTtl: 300 });   // lectura, en caché local 5 min
```

La trampa: un contador de visitas en KV. Dos ubicaciones leen 41 y ambas escriben 42, y se alcanza enseguida el límite de una escritura por segundo. Un contador es un Durable Object.

### R2

Objetos en buckets, mediante el binding o la API de S3, **sin coste de salida**. El almacenamiento Standard cuesta 0,015 USD por GB-mes, 4,50 USD por millón de escrituras (Clase A) y 0,36 USD por millón de lecturas (Clase B); los primeros 10 GB, 1 millón de operaciones de Clase A y 10 millones de Clase B son gratuitos cada mes. El almacenamiento Infrequent Access cuesta 0,01 USD por GB-mes pero cobra 0,01 USD por GB recuperado ([R2 pricing](https://developers.cloudflare.com/r2/pricing/)). Un bucket puede ser público mediante un dominio personalizado, lo que pone la caché de Cloudflare delante; las URL prefirmadas dan acceso temporal a objetos privados.

### D1

SQLite con migraciones y un binding:

```ts
const { results } = await env.DB
  .prepare("SELECT id, total FROM orders WHERE customer_id = ? ORDER BY created_at DESC LIMIT 10")
  .bind(customerId)
  .all();
```

Vincule siempre los parámetros (`?`), no concatene nunca cadenas: así es como se producen las inyecciones SQL. Una base de datos puede tener hasta 10 GB en Workers Paid (500 MB en Free), y puede tener miles, por ejemplo una por cliente. Cada base ejecuta **una consulta a la vez**: con consultas de 1 ms atiende como mucho unas 1000 por segundo, con consultas de 100 ms, 10 ([D1 limits](https://developers.cloudflare.com/d1/platform/limits/)). Indexe aquello por lo que filtra y agrupe las sentencias con `db.batch()`. La replicación de lectura añade copias de solo lectura cerca de los usuarios, usadas mediante la API Sessions para que un usuario siga leyendo sus propias escrituras.

### Durable Objects

Una clase de Durable Object es código; cada **instancia** tiene un nombre único en el mundo y vive en un solo lugar a la vez. Todas las peticiones a `room:lobby` llegan a la misma instancia, que las atiende de una en una, con su propio almacenamiento SQLite transaccional ([What are Durable Objects](https://developers.cloudflare.com/durable-objects/concepts/what-are-durable-objects/)).

```ts
export class Counter extends DurableObject {
  async increment(): Promise<number> {
    const value = ((await this.ctx.storage.get<number>("value")) ?? 0) + 1;
    await this.ctx.storage.put("value", value);
    return value;
  }
}

// en el Worker
const stub = env.COUNTER.get(env.COUNTER.idFromName("page:/home"));
const views = await stub.increment();       // RPC a la única instancia con ese nombre
```

Sin carreras: dos incrementos no pueden entrelazarse, porque una única instancia los ejecuta por turnos. Otras capacidades: las **alarmas** despiertan un objeto a una hora fijada; los **WebSockets** con la API Hibernation mantienen miles de clientes conectados a un objeto a bajo coste. La regla de diseño: un objeto por unidad de coordinación (una sala, un documento, un usuario), nunca un objeto para toda la aplicación, que lo convertiría en un cuello de botella de un solo hilo.

### Queues

Un productor llama a `env.JOBS.send({ orderId })`; el handler `queue()` del Worker consumidor recibe **lotes** (hasta 100 mensajes, o tras una espera de hasta 60 segundos). La entrega es **al menos una vez**: haga idempotentes a los consumidores. Un mensaje que falla se reintenta (hasta 100 veces) y después va a una **dead letter queue** si está configurada. Mensajes de hasta 128 KB, 5000 por segundo por cola, conservados hasta 14 días ([Queues limits](https://developers.cloudflare.com/queues/platform/limits/)).

### Workflows

Un Workflow es un programa cuyos pasos sobreviven a los fallos: el resultado de cada `step.do()` se guarda, de modo que tras un fallo la instancia continúa después del último paso terminado en lugar de empezar de nuevo.

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

Por defecto, un paso se reintenta 5 veces, con 10 segundos de separación y espera exponencial, y cada intento caduca a los 10 minutos; lance `NonRetryableError` para fallar de inmediato ([Sleeping and retrying](https://developers.cloudflare.com/workflows/build/sleeping-and-retrying/)). Un Workflow en pausa no cuesta nada.

### Hyperdrive

Un Worker que se conecta directamente a una base de datos situada en una región paga varios viajes de ida y vuelta para establecer cada conexión. Hyperdrive establece la conexión cerca del Worker, mantiene un **pool** de conexiones abiertas cerca de la base y puede guardar en **caché** las consultas de lectura. No invalida la caché cuando usted escribe: use una segunda configuración de Hyperdrive, sin caché, para las lecturas que deben ser frescas ([How Hyperdrive works](https://developers.cloudflare.com/hyperdrive/concepts/how-hyperdrive-works/)). Combínelo con Smart Placement para que el propio Worker se ejecute cerca de la base.

**Para recordar.** KV: eventual, una escritura por segundo y clave. R2: objetos, sin tarifas de salida. D1: SQLite, una consulta a la vez por base. Durable Objects: un propietario de un solo hilo por nombre, para todo lo que no admite carreras. Queues: al menos una vez, así que consumidores idempotentes. Workflows: pasos que sobreviven a los fallos.

## Parte 9 — Zero Trust

Cloudflare One sustituye la VPN y el cortafuegos de la oficina por comprobaciones en la red de Cloudflare: **Access** decide quién puede llegar a sus aplicaciones, **Tunnel** las conecta sin abrir ningún puerto y **Gateway** filtra lo que sus usuarios alcanzan en Internet, con el **Cloudflare One Client** (antes WARP) llevando allí el tráfico de un dispositivo.

Zero Trust significa que ninguna petición es de confianza por su procedencia (la red de la oficina, la VPN): cada una se comprueba por identidad, dispositivo y contexto. Hasta 50 usuarios es gratuito; a partir de ahí, el pago por uso cuesta 7 USD por usuario y mes, con facturación anual ([Access](https://www.cloudflare.com/sase/products/access/)).

### Las piezas

| Componente | Sentido | Qué hace |
|---|---|---|
| Proveedores de identidad | — | Quién es el usuario: Google, Microsoft Entra ID, Okta, GitHub, cualquier proveedor SAML u OIDC, o un código de un solo uso por correo |
| Access | Usuarios → sus aplicaciones | Un inicio de sesión y una comprobación de política delante de cada aplicación, web o no (SSH, RDP, bases de datos) |
| Tunnel (`cloudflared`) | Sus aplicaciones → Cloudflare | Conexión solo saliente desde su red; sin puerto de entrada ni IP pública |
| Cloudflare One Client | Dispositivo → Cloudflare | Envía el DNS y el tráfico de un dispositivo a Gateway; informa de la postura del dispositivo |
| Gateway | Usuarios → Internet y red privada | Filtrado DNS, de red y HTTP: bloquear malware, categorías, exfiltración de datos |
| Postura del dispositivo | — | Comprueba un dispositivo: cifrado de disco, versión del sistema, cliente activo, EDR presente |

Los usuarios, con o sin el cliente, solo llegan a las aplicaciones internas a través de Access; los dispositivos inscritos envían su propio tráfico por Gateway, que además encamina las IP privadas por el túnel.

### Access

Una **aplicación de Access** protege un nombre de host (`grafana.example.com`) o una ruta. Cada una tiene **políticas**; cada política tiene una acción y reglas:

- **Acciones**: **Allow**, **Block**, **Bypass** (ninguna comprobación de Access, sin registro: solo para recursos públicos como una comprobación de salud), **Service Auth** (para máquinas: tokens de servicio o mTLS, sin inicio de sesión).
- **Reglas**: **Include** (O: basta con que coincida una), **Require** (Y: deben coincidir todas), **Exclude** (NO: cualquier coincidencia deniega). Cada política necesita al menos un Include.
- **Orden**: primero se evalúan las políticas Bypass y Service Auth, después Allow y Block, cada una de arriba abajo; la primera Allow o Block que coincide decide. Lo que no coincide con nada queda **denegado por defecto** ([Access policies](https://developers.cloudflare.com/cloudflare-one/access-controls/policies/)).

Ejemplo: los ingenieros pueden llegar al panel de administración desde un portátil gestionado; los contratistas, nunca.

```
Policy "Engineers", Allow
  Include:  Emails ending in @example.com
  Require:  Login method is Okta;  Device posture: disk encrypted
  Exclude:  Group "contractors"

Policy "Deploy bot", Service Auth
  Include:  Service token "ci-deployer"
```

El trabajo de CI envía dos cabeceras, `CF-Access-Client-Id` y `CF-Access-Client-Secret`, y pasa sin inicio de sesión.

Tras el inicio de sesión, Access envía a la aplicación un JWT firmado en la cabecera `Cf-Access-Jwt-Assertion`. **Su aplicación debe validarlo**: obtenga las claves de `https://<team>.cloudflareaccess.com/cdn-cgi/access/certs` y compruebe la reclamación `aud` con la etiqueta AUD de la aplicación ([Validate JWTs](https://developers.cloudflare.com/cloudflare-one/access-controls/applications/http-apps/authorization-cookie/validating-json/)). Si no, cualquiera que llegue al origen por otro camino será considerado de confianza.

### Tunnel

`cloudflared` se ejecuta junto a sus servicios y abre conexiones **salientes** hacia dos centros de datos de Cloudflare; las peticiones vuelven por esas conexiones. El origen no necesita IP pública ni puertos de entrada abiertos, y nadie puede rodear Cloudflare para llegar a él. Los túneles gestionados de forma remota se configuran en el panel o por API; los gestionados localmente leen un archivo:

```yaml
tunnel: 6ff42ae2-765d-4adf-8112-31c55c1551ef
credentials-file: /etc/cloudflared/6ff42ae2.json
ingress:
  - hostname: app.example.com
    service: http://localhost:8080
  - hostname: app.example.com
    path: ^/api/
    service: http://localhost:9000      # nunca se alcanza: la regla de arriba coincidió antes
  - hostname: ssh.example.com
    service: ssh://localhost:22
  - service: http_status:404             # regla comodín obligatoria, al final
```

Las reglas se comparan **de arriba abajo, gana la primera que coincide**, y el archivo **debe terminar con una regla comodín** sin nombre de host ([Configuration file](https://developers.cloudflare.com/tunnel/advanced/local-management/configuration-file/)). En el ejemplo, la regla `/api/` está muerta: ponga primero las reglas más específicas. Ejecute dos o más réplicas de `cloudflared` del mismo túnel para la disponibilidad. Un túnel también puede llevar rutas de **red privada** (`10.0.0.0/16`), de modo que los dispositivos inscritos lleguen a las IP internas como con una VPN, bajo las políticas de red de Gateway.

### Gateway

Gateway filtra las consultas DNS, el tráfico de red y las peticiones HTTP de los dispositivos que ejecutan el cliente, o de las oficinas que le envían su DNS o su tráfico. Los tipos de política se aplican en este orden: DNS (antes de la resolución, después las políticas de resolvedor, después DNS tras la resolución), egress, **red** y por último **HTTP**; dentro de un tipo, gana la primera política que coincide según su precedencia ([Order of enforcement](https://developers.cloudflare.com/cloudflare-one/traffic-controls/order-of-enforcement/)).

- **Políticas DNS**: bloquear por dominio, categoría (malware, phishing, contenido para adultos) o aplicación; las más baratas de desplegar, basta un ajuste de DNS.
- **Políticas de red**: por IP, puerto, protocolo, SNI; para redes privadas detrás de túneles.
- **Políticas HTTP**: por URL, tipo de archivo o aplicación, con análisis antivirus y prevención de pérdida de datos. Inspeccionar HTTPS requiere el **descifrado TLS** y el certificado raíz de Cloudflare instalado en los dispositivos; las políticas «Do Not Inspect» eximen a bancos, sitios de salud y aplicaciones que fijan sus certificados.
- **Browser Isolation** ejecuta los sitios de riesgo en un navegador remoto y envía al dispositivo solo la representación.

### El Cloudflare One Client

El cliente (antes WARP) inscribe un dispositivo en su organización y funciona en uno de varios modos: **Traffic and DNS** (por defecto: todo a Gateway), **DNS only**, **Traffic only**, **Posture only** (sin tráfico, solo comprobaciones del dispositivo para Access) y **Local proxy** ([Client modes](https://developers.cloudflare.com/cloudflare-one/team-and-resources/devices/cloudflare-one-client/configure/modes/)). El **split tunneling** elige qué destinos pasan por Cloudflare (listas de inclusión o exclusión).

### Ejemplo resuelto: sustituir una VPN

1. Instalar `cloudflared` en el centro de datos; encaminar `10.20.0.0/16` por el túnel y publicar `wiki.example.com` y `grafana.example.com` como nombres de host.
2. Conectar Okta como proveedor de identidad.
3. Crear una aplicación de Access por aplicación web, con una política Allow para el grupo adecuado y una comprobación de postura.
4. Desplegar el Cloudflare One Client por MDM en modo Traffic and DNS; política de red de Gateway: solo el grupo `engineering` llega a `10.20.0.0/16` en los puertos 22 y 5432.
5. Política DNS de Gateway: bloquear las amenazas de seguridad para todos.
6. Cerrar el puerto de entrada de la VPN y las reglas de cortafuegos que la servían.

**Para recordar.** Access: Include = O, Require = Y, Exclude = NO; denegación por defecto; Bypass se salta todo. Valide el JWT de Access en la aplicación. Tunnel: solo saliente, gana la primera coincidencia, comodín al final. Gateway: DNS, luego red, luego HTTP; inspeccionar HTTPS requiere el certificado raíz.
## Parte 10 — IA

La pila de IA de Cloudflare es la plataforma para desarrolladores más cuatro piezas: **Workers AI** ejecuta modelos abiertos en las GPU de Cloudflare, **AI Gateway** se sitúa delante de cualquier proveedor de modelos para guardar en caché, limitar y registrar, **Vectorize** y **AI Search** se ocupan de la recuperación (retrieval), y el **Agents SDK** da a cada agente un estado duradero sobre un Durable Object.

### Las piezas

| Producto | Qué hace | Cómo se usa |
|---|---|---|
| Workers AI | Inferencia en GPU serverless: LLM, embeddings, imagen, voz, traducción | `env.AI.run(model, input)` |
| AI Gateway | Un proxy hacia Workers AI, OpenAI, Anthropic, Google y otros: caché, límites de velocidad y de gasto, reintentos y alternativas, guardrails, DLP, registros | Una URL de gateway, o las opciones `gateway` de `env.AI.run` |
| Vectorize | Base de datos vectorial: guardar embeddings, buscar los vecinos más cercanos con filtros de metadatos | `env.VECTORS.upsert()`, `.query()` |
| AI Search | Recuperación gestionada (RAG): indexa sus datos de forma continua, búsqueda híbrida, generación de respuestas opcional | `env.AI_SEARCH`, API REST o MCP |
| Agents SDK | Agentes como Durable Objects: estado, WebSockets, planificación, herramientas, MCP | `class MyAgent extends Agent` |
| Browser Rendering | Navegadores sin interfaz para agentes: capturas, PDF, scraping | binding o API REST |
| AI Crawl Control | Ver y controlar qué rastreadores de IA leen su sitio | panel, WAF |

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

El uso se mide en **Neurons**: 10 000 al día son gratuitos en todos los planes; por encima, Workers Paid cuesta 0,011 USD por cada 1000 Neurons. Los precios por modelo se dan también por millón de tokens: por ejemplo, 0,045 USD de entrada y 0,384 USD de salida para Llama 3.1 8B (fp8, fast), 0,293 USD de entrada y 2,253 USD de salida para Llama 3.3 70B ([Workers AI pricing](https://developers.cloudflare.com/workers-ai/platform/pricing/)). Elija el modelo más pequeño que haga el trabajo: la entrada del modelo 8B es unas 6,5 veces más barata que la del 70B.

### AI Gateway

Ponga un gateway entre su aplicación y cada proveedor, aunque el modelo no esté en Cloudflare. Sus funciones básicas son gratuitas ([AI Gateway pricing](https://developers.cloudflare.com/ai-gateway/reference/pricing/)):

- **Caché** de peticiones idénticas: la clave es un hash del proveedor, el endpoint, el modelo, la cabecera de autenticación y todo el cuerpo, así que un solo carácter distinto es un MISS. Por petición, `cf-aig-cache-ttl` fija la duración (de 60 segundos a un mes), `cf-aig-skip-cache` se salta la caché, `cf-aig-cache-key` fija su propia clave; `cf-aig-cache-status` indica `HIT` o `MISS` ([Caching](https://developers.cloudflare.com/ai-gateway/features/caching/)).
- **Limitación de velocidad** (ventana fija o deslizante) y **límites de gasto** por modelo, proveedor o metadato.
- **Enrutamiento dinámico**: reintentos y alternativas, como «probar el modelo A y, si hay error o se agota el tiempo, usar el B», configurados sin código; **Auto Router** envía cada petición al modelo más barato capaz de atenderla.
- **Guardrails** y **DLP**: moderar indicaciones y respuestas, detectar datos personales o financieros.
- **BYOK**: Cloudflare guarda las claves de los proveedores, no su código; **Unified Billing** paga a los proveedores con créditos de Cloudflare (comisión del 5 % sobre los créditos).
- **Registros y estadísticas**: peticiones, tokens, coste y errores por proveedor ([Features](https://developers.cloudflare.com/ai-gateway/features/)).

### Recuperación: Vectorize y AI Search

La generación aumentada por recuperación (RAG) responde a partir de sus documentos: se calculan sus embeddings, se buscan los pasajes más cercanos a la pregunta y se entregan al modelo.

**Hágalo usted mismo** con Workers AI y Vectorize. Un índice tiene una dimensión fija (hasta 1536) y una métrica (coseno, euclídea, producto escalar), contiene hasta 20 millones de vectores con 10 KiB de metadatos cada uno, y hasta 10 campos de metadatos indexados para filtrar; una consulta devuelve como máximo 50 resultados con metadatos y 100 sin ellos ([Vectorize limits](https://developers.cloudflare.com/vectorize/platform/limits/)).

```ts
// indexar un pasaje
const { data } = await env.AI.run("@cf/baai/bge-base-en-v1.5", { text: [passage] });   // 768 dimensiones
await env.VECTORS.upsert([{ id: docId, values: data[0], metadata: { url, lang: "en" } }]);

// responder a una pregunta
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

La dimensión del índice debe ser igual a la del modelo de embeddings: 768 para este modelo. Una discrepancia es el error más común de Vectorize.

**O deje que lo haga AI Search**: apunte una instancia a sus datos y esta los trocea, calcula los embeddings y reindexa de forma continua, con búsqueda híbrida (semántica y por palabras clave), filtros de metadatos y OCR para PDF escaneados ([AI Search](https://developers.cloudflare.com/ai-search/)):

```ts
const docs = env.AI_SEARCH.get("handbook");
const hits = await docs.search({ messages: [{ role: "user", content: "How many vacation days?" }] });
const answer = await docs.chatCompletions({
  model: "@cf/meta/llama-3.3-70b-instruct-fp8-fast",
  messages: [{ role: "user", content: "How many vacation days?" }],
  ai_search_options: { retrieval: { max_num_results: 5 }, query_rewrite: { enabled: true } },
});
```

([Workers binding](https://developers.cloudflare.com/ai-search/api/search/workers-binding/)). Elija AI Search para tener respuestas rápido; elija Vectorize cuando necesite controlar el troceado, los modelos o la ordenación.

### Agentes

Un **agente** es un Durable Object: cada usuario o conversación tiene su propia instancia, con un estado que sobrevive a los reinicios, conexiones WebSocket con sus clientes y trabajo planificado ([Agent class](https://developers.cloudflare.com/agents/runtime/lifecycle/agent-class/)).

```ts
export class Support extends Agent<Env, { tickets: number }> {
  initialState = { tickets: 0 };

  @callable()
  async openTicket(text: string) {
    this.sql`INSERT INTO tickets (text, at) VALUES (${text}, ${Date.now()})`;
    this.setState({ tickets: this.state.tickets + 1 });     // guardado y enviado a los clientes conectados
    await this.schedule(86400, "followUp", { text });        // dentro de 24 horas
  }

  async followUp({ text }: { text: string }) { /* pedir al modelo un correo de seguimiento */ }
}
```

`setState` guarda y difunde; `this.sql` consulta el SQLite propio del agente; `schedule` ejecuta un método tras un retraso, en una fecha o según un cron; `@callable()` expone un método a los clientes por RPC sobre WebSocket. Los agentes pueden llamar a modelos (mediante AI Gateway), herramientas, otros agentes y servidores MCP, y pasar los trabajos largos a Workflows. Cloudflare también aloja **servidores MCP** en Workers, con Access u OAuth delante, para que clientes de IA externos usen sus herramientas de forma segura.

**Para recordar.** Workers AI se factura en Neurons, 10 000 gratuitos al día. AI Gateway delante de cada proveedor: caché, límites, alternativas, registros. Dimensión de Vectorize = dimensión del embedding. AI Search es un RAG gestionado. Un agente es un Durable Object con estado, sockets y tareas planificadas.

## Parte 11 — Operación

Cuando una configuración funciona, manténgala como código: todo lo que hay en el panel tiene una API, Terraform la gestiona con cambios revisados, los tokens de API con alcance limitado restringen lo que cada herramienta puede tocar, y los registros y estadísticas le dicen qué ha pasado.

### Tokens de API

- Use **tokens de API**, nunca la antigua Global API Key, que puede hacer todo lo que puede hacer su usuario.
- Dé a cada token solo los **permisos** que necesita («Zone → DNS → Edit», «Account → Workers Scripts → Edit») y solo sobre los **recursos** que necesita (una zona, una cuenta).
- Restrínjalo a los **rangos IP** de su CI y póngale una **fecha de caducidad**: por defecto, un token nunca caduca ([Restrict tokens](https://developers.cloudflare.com/fundamentals/api/how-to/restrict-tokens/)).
- Prefiera **tokens propiedad de la cuenta** para la automatización, para que un pipeline no se detenga cuando se marche la persona que creó su token.

```sh
curl https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records \
  -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN"
```

### Terraform

El provider de Cloudflare (versión 5, publicado cada dos o tres semanas) cubre zonas, DNS, rulesets, Workers, Access, túneles y la mayoría de los demás productos ([Terraform v5.20.0](https://developers.cloudflare.com/changelog/post/2026-06-12-terraform-v5.20.0-provider/)). `cf-terraforming` genera la configuración y los comandos de importación de lo que ya existe.

```hcl
resource "cloudflare_dns_record" "www" {
  zone_id = var.zone_id
  name    = "www"
  type    = "CNAME"
  content = "example.com"
  proxied = true
  ttl     = 1            # 1 = automático
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

Tenga en cuenta que un ruleset es dueño de **todas** las reglas de su fase en esa zona: una regla añadida a mano en el panel desaparece en el siguiente `terraform apply`. Decida fase por fase si la gestiona Terraform o las personas, no ambos.

Los Workers suelen desplegarse con Wrangler desde la CI (`wrangler deploy` con `CLOUDFLARE_API_TOKEN` y `CLOUDFLARE_ACCOUNT_ID` definidos), o con Workers Builds, que despliega en cada push a un repositorio Git conectado.

### Registros y estadísticas

| Herramienta | Qué ofrece | Cuándo |
|---|---|---|
| Estadísticas del panel | Tráfico, ratio de caché, amenazas, por zona | Vistazo diario |
| Security Events | Cada petición sobre la que actuó una regla de seguridad, con el ID de la regla | Ajustar reglas WAF, falsos positivos |
| GraphQL Analytics API | Los mismos datos, consultables | Sus propios paneles |
| Instant Logs | Flujo en directo de peticiones HTTP | Depurar ahora |
| Logpush | Registros de peticiones, eventos de cortafuegos, trazas de Workers y más, enviados a R2, S3, un SIEM… | Conservación e investigación |
| Workers Logs, Traces | Los registros y tiempos de sus Workers | Depurar Workers |

Desde el 30 de septiembre de 2026, Logpush está disponible en todos los planes con precios por uso: 25 GB al mes incluidos, después 0,03 USD por GB hacia R2 y Pipelines y 0,10 USD por GB hacia destinos externos ([Logpush changelog](https://developers.cloudflare.com/changelog/post/2026-09-30-logpush-usage-based-pricing/)).

### Costes: de dónde sale la factura

- **Zonas**: el plan de cada zona (Free, Pro, Business) y los complementos (Advanced Certificate Manager, Load Balancing, Argo, Cache Reserve).
- **Plataforma para desarrolladores**: Workers Paid (5 USD al mes) cubre el uso incluido de Workers, KV, D1, Durable Objects y Queues; por encima, el uso se factura por petición, ms de CPU, fila o GB. R2 no tiene tarifas de salida.
- **Zero Trust**: por usuario a partir de 50.
- **IA**: los Neurons por encima de 10 000 al día; los tokens de los proveedores a través de AI Gateway.

Configure **notificaciones de facturación** y, para los Workers, un límite de CPU por Worker (`limits.cpu_ms`), para que un error no dispare la factura.

### Arquitectura de referencia

Una aplicación SaaS construida enteramente sobre Cloudflare: los visitantes llegan a `app.example.com` a través de las capas de seguridad y caché; un Worker sirve el front-end desde recursos estáticos y la API desde D1, R2 y Durable Objects; los trabajos en segundo plano pasan por Queues y Workflows; las funciones de IA llaman a Workers AI o a modelos externos a través de AI Gateway; el equipo llega a las herramientas internas mediante Access y un Tunnel, nunca por un puerto público.

**Para recordar.** Tokens de API con alcance limitado, con caducidad y propiedad de la cuenta. Terraform por fase, sin mezclarlo con el panel. Logpush está ya en todos los planes. Configure notificaciones de facturación.

## Ejercicios

Un laboratorio por parte, con un dominio de prueba y una cuenta gratuita, y después preguntas para comprobar lo aprendido. Las respuestas vienen a continuación.

### Laboratorios

- [ ] **Lab 1 (partes 1–2).** Añada un dominio de prueba con configuración completa. Cree `www` en proxy y `direct` solo DNS hacia el mismo servidor. Ejecute `dig www.<domain>` y `dig direct.<domain>`: anote qué respuesta muestra la dirección de su servidor.
- [ ] **Lab 2 (parte 3).** Instale un certificado de Origin CA en el origen, pase a Full (strict), active Always Use HTTPS y un TLS mínimo de 1.2. Después ponga Flexible con una redirección de HTTP a HTTPS en el origen y observe el bucle; vuelva atrás.
- [ ] **Lab 3 (parte 4).** Pida una imagen tres veces con `curl -sI` y lea `CF-Cache-Status`. Escriba una Cache Rule que guarde el HTML de `/blog/*` durante una hora salvo que haya una cookie `session`; compruebe `MISS`, luego `HIT` y luego `BYPASS` con la cookie.
- [ ] **Lab 4 (parte 5).** Escriba una Single Redirect de `example.com/*` a `https://www.example.com/*` que conserve la ruta y la consulta, y una Response Header Transform Rule que quite `X-Powered-By`.
- [ ] **Lab 5 (parte 6).** Cree una regla personalizada que bloquee `/admin` fuera de una lista de IP, y una regla de limitación de velocidad en `/login`. Dispare ambas; encuéntrelas en Security Events con sus ID de regla.
- [ ] **Lab 6 (parte 7).** `npm create cloudflare@latest`, escriba un Worker con un handler `fetch` y un directorio estático `public/`, despliéguelo en un Custom Domain y ejecute `wrangler tail` mientras lo llama.
- [ ] **Lab 7 (parte 8).** Añada una base D1 con una tabla `orders` y una migración, un contador de visitas en un Durable Object y una Queue cuyo consumidor escriba en R2. Haga que el consumidor falle una vez y observe el reintento.
- [ ] **Lab 8 (parte 9).** Ejecute `cloudflared` en Docker delante de una aplicación web local, sin puertos abiertos; protéjala con una aplicación de Access que solo permita su correo, y valide `Cf-Access-Jwt-Assertion` en la aplicación.
- [ ] **Lab 9 (parte 10).** Cree un índice de Vectorize de 768 dimensiones, calcule los embeddings de diez párrafos con `@cf/baai/bge-base-en-v1.5` y responda preguntas a partir de ellos; haga pasar la llamada al modelo por un AI Gateway con caché y compare `cf-aig-cache-status` en una pregunta repetida.
- [ ] **Lab 10 (parte 11).** Cree un token de API con alcance limitado y caducidad; importe el DNS de la zona con `cf-terraforming`; cambie un registro mediante un plan de Terraform y aplíquelo.

### Compruebe lo aprendido

1. Una regla personalizada del WAF bloquea `/admin`, pero las peticiones a `admin.example.com/admin` siguen llegando al servidor. ¿Qué comprueba primero?
2. El modo SSL es Full y el certificado del origen caducó ayer. ¿Ven los visitantes un error?
3. ¿Por qué no se guarda el HTML en caché por defecto, y qué hace que una página se pueda guardar?
4. `http.request.uri.path eq "/Login"` no coincide nunca. ¿Por qué?
5. ¿Qué se ejecuta antes, una Single Redirect o una regla personalizada del WAF? ¿Una Bulk Redirect o una regla personalizada del WAF?
6. Una regla de limitación de velocidad permite 100 peticiones por minuto e IP, pero una botnet de 10 000 IP envía 50 cada una. ¿Qué ayuda?
7. ¿Dónde guarda un contador de visitas, y por qué no en KV?
8. Un consumidor de Queue cobra en la tarjeta de un cliente. ¿Qué propiedad debe tener?
9. Una política de Access tiene Include `@example.com` y Require país `CH`. ¿Puede `ana@example.com` conectarse desde Francia?
10. El ingress de un túnel tiene una regla comodín en primer lugar. ¿Qué ocurre?
11. Consulta un índice de Vectorize de 1024 dimensiones con un embedding de 768 dimensiones. ¿Qué ocurre?
12. Un ruleset gestionado con Terraform pierde una regla que un compañero añadió en el panel. ¿Por qué?

### Respuestas

1. Si `admin.example.com` está **en proxy**. Un registro solo DNS se salta todos los productos de Cloudflare. Después, compruebe el host de la expresión.
2. **No**: Full no valida el certificado del origen. Por eso no basta; Full (strict) devolvería un error 526.
3. Porque el HTML suele ser personal (carrito, cuenta). Una Cache Rule con *Eligible for cache*, y sin `Set-Cookie` ni `private` en la respuesta, o un bypass para los usuarios con sesión iniciada.
4. `eq` distingue mayúsculas: `/login` no es `/Login`. Use `lower(...)` o `wildcard`.
5. La Single Redirect se ejecuta antes que todas las fases; la regla personalizada del WAF se ejecuta antes que la Bulk Redirect.
6. No la limitación por IP: un desafío gestionado o Super Bot Fight Mode, las puntuaciones de Bot Management, o contar por otra característica (una cookie de sesión, una clave de API) con Advanced Rate Limiting.
7. En un **Durable Object**: una única instancia atiende los incrementos por turnos. KV es de consistencia eventual y acepta una escritura por segundo y clave.
8. **Idempotencia**: Queues entrega al menos una vez, así que el mismo mensaje puede llegar dos veces. Guarde un ID de pago y rechace los duplicados.
9. **No**: Require es un Y, así que deben coincidir tanto el dominio del correo como el país.
10. Todas las peticiones coinciden con ella; las reglas siguientes no se usan nunca. El comodín debe ir al final.
11. La consulta falla: la dimensión del vector debe coincidir con la del índice. Cree el índice con la dimensión del modelo de embeddings.
12. El recurso ruleset es dueño de todas las reglas de esa fase; `apply` restablece el estado declarado. Gestione cada fase en un solo lugar.

## Fuentes

Todas las páginas se consultaron el 27 de octubre de 2026. Los límites y los precios cambian: compruebe la página antes de fiarse de una cifra.

| Parte | Páginas |
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
