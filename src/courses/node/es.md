# Node.js y npm — un curso completo

## Cómo usar este curso

Este curso explica Node.js y el ecosistema npm: el runtime y sus versiones, los módulos, el bucle de eventos, las APIs integradas, `package.json` y el versionado semántico, la instalación y los lockfiles, la publicación de paquetes y la seguridad de la cadena de suministro. Describe las herramientas tal como están a finales de 2026 (Node 24 y 26, npm 11, pnpm 10 y 11) y da prioridad a lo que seguirá valiendo cuando cambien.

**Para quién.** Quienes escriben JavaScript o TypeScript para servidores, herramientas o cadenas de build, y cualquiera que mantenga un `package.json`. Hay que conocer el lenguaje JavaScript; las últimas partes suponen el uso de una terminal y de Git.

**Organización.** Ocho partes en dos bloques:

| Bloque | Partes | Lo que sabrás hacer después |
|---|---|---|
| La plataforma | 1 El runtime · 2 Los módulos · 3 La asincronía · 4 Las APIs integradas | Escribir, ejecutar, depurar y operar programas Node sin sorpresas |
| npm y el ecosistema | 5 package.json y semver · 6 Instalar · 7 Publicar · 8 Seguridad | Gestionar dependencias, publicar paquetes y mantener bajo control la cadena de suministro |

Cada parte termina con lo que hay que recordar. Los ejercicios del final dan una tarea por parte, con las respuestas.

**Con Luma.** El test *📦 Node.js et npm* del grupo *Informatique* de Luma sigue los mismos temas en cuatro niveles (Débutant a Expert), con 128 preguntas redactadas; una respuesta incorrecta enlaza con su parte. Luma misma es una aplicación Node y TypeScript construida con npm, de la que este curso saca ejemplos.

**Qué necesitas.** Node 24 o posterior, instalado con un gestor de versiones (parte 1), y una terminal. La parte 7 supone una cuenta de GitHub si quieres probar la publicación de confianza.

## Parte 1 — El runtime

### Qué es Node

Node.js ejecuta JavaScript fuera del navegador. Está hecho del motor **V8** (el de Chrome), de **libuv** para la entrada y salida asíncronas, y de una biblioteca estándar: `fs`, `http`, `crypto`, `stream`, `worker_threads` y otras. No hay DOM; hay archivos, sockets, procesos y variables de entorno.

```sh
node --version          # v24.11.0, por ejemplo
node                    # el REPL: escribe expresiones, .exit para salir
node app.js             # ejecutar un archivo
node --watch app.js     # reiniciar cuando cambia un archivo importado
```

### Versiones y soporte

Cada línea de Node tiene una vida: **Current** durante meses, luego **LTS** (soporte a largo plazo) con correcciones durante unos dos años y medio, y luego el fin de vida. Producción usa una línea LTS.

| Línea | Estado en noviembre de 2026 | Fin de vida |
|---|---|---|
| 22 | LTS de mantenimiento | abril de 2027 |
| 24 | LTS de mantenimiento | abril de 2028 |
| 26 | LTS activa | abril de 2029 |
| 27 | Alpha, publicada como Current en abril de 2027 | abril de 2030 |

Node 26 es la última línea del modelo anterior, con dos mayores al año de las que solo las pares pasaban a LTS. Desde Node 27 hay **una mayor al año**: alphas desde octubre, una versión Current en abril, LTS en octubre, treinta meses de soporte, y el número coincide con el año. Comprueba el calendario en nodejs.org; las fechas pueden moverse.

### Una versión por proyecto

Un **gestor de versiones** (nvm, fnm, Volta o mise) instala varias versiones a la vez y cambia según la carpeta. Escribe la mayor en `.nvmrc` (o `.node-version`), decláralo en `package.json` y usa la misma en la CI y en la imagen del contenedor:

```json
{
  "engines": { "node": ">=24" }
}
```

npm solo avisa cuando `engines` no coincide, salvo que `engine-strict=true` esté definido en `.npmrc`.

### Operar en producción

- **Códigos de salida**: 0 significa éxito. Fija `process.exitCode = 1` y deja que el programa termine, en lugar de `process.exit(1)`, que puede cortar la salida que aún se escribe.
- **Señales**: las plataformas envían `SIGTERM` y luego `SIGKILL` tras un periodo de gracia. Cierra el servidor, termina las peticiones, cierra los pools, sal.
- **PID 1**: en un contenedor, arranca Node directamente con la forma exec `CMD ["node", "server.js"]`. `npm start` o una shell como PID 1 pueden no reenviar las señales, y Node como PID 1 ignora `SIGTERM` si no lo gestionas.

```js
process.on("SIGTERM", () => {
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(1), 10_000).unref();
});
```

### Usar todos los núcleos

JavaScript corre en un solo hilo por proceso. Un trabajo pesado para la CPU (procesar imágenes, analizar archivos enormes) bloquea todas las peticiones de ese hilo. Opciones:

- Los **worker threads** (`node:worker_threads`), cada uno con su propio bucle de eventos y su heap, que se comunican por mensajes; un pool como Piscina los reutiliza.
- **Varios procesos** detrás de un balanceador de carga, lo que además aísla los fallos; en una plataforma como Cloud Run o Kubernetes, basta con ejecutar más instancias.
- **El pool de hilos de libuv** ya ejecuta las llamadas al sistema de archivos, `dns.lookup`, la criptografía asíncrona (`scrypt`, `pbkdf2`) y zlib, con cuatro hilos por defecto (`UV_THREADPOOL_SIZE`). Los sockets de red no lo usan.

### Depurar y diagnosticar

- `node --inspect app.js` abre un depurador en 127.0.0.1:9229 para Chrome DevTools o un editor. Nunca lo expongas públicamente: permite ejecutar cualquier código.
- `node --cpu-prof` escribe un perfil de CPU; `monitorEventLoopDelay` de `node:perf_hooks` mide el retraso del bucle.
- Fugas de memoria: toma **instantáneas del heap** con un tiempo de separación y compáralas, o usa `--heapsnapshot-near-heap-limit`. Las causas típicas son cachés sin límite, listeners añadidos en cada petición y temporizadores que retienen closures.
- Los **módulos nativos** escritos con **Node-API** siguen funcionando entre versiones mayores; los antiguos, ligados directamente a V8, deben recompilarse.

**Para recordar.** Usa una línea LTS, fíjala por proyecto, sal y apaga limpiamente, deja el trabajo pesado fuera del hilo principal, y mide el bucle antes de adivinar.

## Parte 2 — Los módulos

### Dos sistemas

| | CommonJS | Módulos ES (ESM) |
|---|---|---|
| Sintaxis | `require`, `module.exports` | `import`, `export` |
| Carga | Síncrona | Asíncrona, `await` de nivel superior permitido |
| Archivo | `.cjs`, o `.js` sin `"type"` | `.mjs`, o `.js` con `"type": "module"` |
| Su ruta | `__dirname`, `__filename` | `import.meta.dirname`, `import.meta.filename` |
| Exportaciones | Un valor copiado | Enlaces vivos |

El código nuevo se escribe como ESM. Pon `"type": "module"` en `package.json`; `.cjs` y `.mjs` lo sustituyen archivo por archivo.

```js
import { readFile } from "node:fs/promises";
import { parse } from "./parser.js";          // la extensión es obligatoria
import config from "./config.json" with { type: "json" };

export function load(path) {
  return readFile(path, "utf8").then(parse);
}
```

- El **prefijo `node:`** siempre designa un módulo integrado y es obligatorio en algunos (`node:test`, `node:sqlite`).
- En ESM, los imports relativos necesitan el **nombre completo del archivo**; los bundlers y TypeScript a veces aceptan menos, Node solo no.
- El **`import()` dinámico** carga un módulo cuando se ejecuta la línea, desde ESM o CommonJS; útil para plugins y funciones poco usadas.

### Mezclarlos

Desde Node 22.12 y 20.19 funciona **`require(esm)`**: CommonJS puede cargar un módulo ES con `require()`, salvo que el grafo de módulos use `await` de nivel superior (entonces `ERR_REQUIRE_ASYNC_MODULE`; usa `await import()`). ESM siempre ha podido importar CommonJS.

**Enlaces vivos**: quien importa en ESM ve los cambios posteriores de un `let` exportado; `const { count } = require("./counter")` copia el valor una vez.

### Cómo se encuentra un paquete

Un nombre sin ruta como `"lodash"` se busca en las carpetas `node_modules`, subiendo desde el archivo que importa. En el paquete encontrado, `exports` (o el antiguo `main`) elige el archivo.

```json
{
  "name": "@acme/logger",
  "type": "module",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js",
      "default": "./dist/index.js"
    },
    "./format": "./dist/format.js"
  },
  "imports": {
    "#internal/*": "./src/internal/*.js"
  }
}
```

- `exports` es la **superficie pública**: las demás rutas fallan con `ERR_PACKAGE_PATH_NOT_EXPORTED`.
- **Las condiciones se prueban en orden** y gana la primera que encaja: `types` primero, `default` al final.
- Las entradas de **`imports`** empiezan por `#` y dan alias privados dentro del paquete, sin bundler.

### Trampas

- **El riesgo del paquete doble**: un paquete que publica una versión CommonJS y otra ESM puede cargarse dos veces, con dos copias de su estado. Publicar solo ESM lo evita ahora que existe `require(esm)`.
- **La caché ESM** se indexa por URL y nunca se reduce: `import("./x.js?v=" + Date.now())` recarga pero pierde memoria.
- Los **hooks de personalización** (`resolve` y `load`, registrados con `module.register` o `module.registerHooks` desde un archivo pasado a `--import`) permiten a las herramientas transformar los módulos al cargarlos, para TypeScript, mocks o cobertura.

**Para recordar.** Escribe ESM con extensiones explícitas y módulos integrados con `node:`, define `exports` con `types` primero, deja el `await` de nivel superior fuera de los puntos de entrada, y recuerda que `require(esm)` cerró la mayor parte de la brecha.

## Parte 3 — La asincronía y el bucle de eventos

### Un hilo, muchas conexiones

Node lanza una operación de entrada y salida, sigue ejecutando otro código y ejecuta un callback cuando el resultado está listo. Por eso un proceso atiende miles de conexiones; y por eso también un cálculo largo hace esperar a todas las peticiones. Las funciones que terminan en `Sync` bloquean el hilo: bien al arrancar o en un script, no en un manejador de peticiones.

### El orden de las cosas

Tras el código actual, Node ejecuta las **microtareas**: la cola de `process.nextTick` y luego los callbacks de promesas. Después el bucle recorre sus fases:

| Fase | Ejecuta |
|---|---|
| Timers | Los callbacks de `setTimeout` y `setInterval` que han vencido |
| Pending | Algunos callbacks del sistema aplazados |
| Poll | La entrada y salida: conexiones nuevas, datos, resultados de archivos |
| Check | Los callbacks de `setImmediate` |
| Close | Los eventos `close` |

```js
setTimeout(() => console.log("timeout"));
Promise.resolve().then(() => console.log("promise"));
process.nextTick(() => console.log("tick"));
console.log("sync");
// En CommonJS: sync, tick, promise, timeout
```

En un módulo ES, el propio script corre como microtarea, así que los callbacks de promesas pueden ir antes que `nextTick`. Dentro de un callback de entrada y salida, `setImmediate` siempre va antes que un temporizador de 0 ms. No construyas lógica sobre estos detalles.

Una cadena de callbacks de `nextTick` o de promesas que se rellena sin parar **mata de hambre** al bucle: la entrada y salida nunca se ejecuta. Cede el control con `setImmediate` o trabaja en lotes acotados.

### Promesas y errores

- `await Promise.all([...])` rechaza al primer fallo; los demás siguen. `Promise.allSettled` informa de cada resultado.
- Un **rechazo no gestionado** hace caer el proceso (desde Node 15). Una promesa lanzada pronto y esperada tarde puede provocarlo: `const p = a(); await b(); await p;` cae si `p` se rechaza durante `b()`. Usa `Promise.all([a(), b()])`.
- Un `EventEmitter` que emite `error` sin listener **lanza el error**. Cada stream y cada socket necesitan un manejador de errores, o envolverse con `pipeline` o `events.once`.

### Cancelación

`AbortSignal` es la forma común de cancelar: `fetch`, `fs/promises`, los streams, los temporizadores y `events.once` aceptan una.

```js
const signal = AbortSignal.any([userSignal, AbortSignal.timeout(5000)]);
const res = await fetch(url, { signal });
```

`Promise.race` con un temporizador solo deja de esperar; la petición sigue.

### Streams y contrapresión

Los streams procesan los datos por trozos, así que la memoria se mantiene estable. Cuando un consumidor va lento, `write()` devuelve `false` y el productor debería esperar a `drain`. `pipeline` lo hace, propaga los errores de cualquier etapa y lo cierra todo:

```js
import { pipeline } from "node:stream/promises";
import { createReadStream, createWriteStream } from "node:fs";
import { createGzip } from "node:zlib";

await pipeline(createReadStream("big.log"), createGzip(), createWriteStream("big.log.gz"));
```

Un generador asíncrono puede ser una etapa, y `for await (const chunk of stream)` lee un stream.

### Contexto e hilos

- **`AsyncLocalStorage`** (`node:async_hooks`) lleva un valor, como un id de petición, a través de los `await` y los callbacks sin pasarlo por todas partes; las herramientas de trazas se apoyan en él.
- Los **workers** reciben los mensajes por clonación estructurada, una copia. Un `ArrayBuffer` grande puede **transferirse** en su lugar (`postMessage(buf, [buf])`), o compartirse como `SharedArrayBuffer` con `Atomics`.

**Para recordar.** No bloquees nunca el hilo, gestiona cada rechazo y cada evento `error`, pasa señales para cancelar, usa `pipeline` para los streams, y no confíes en el orden fino de los callbacks.

## Parte 4 — Las APIs integradas

### Archivos, entorno, rutas

```js
import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";

const port = Number(process.env.PORT ?? 3000);
const dataDir = path.join(import.meta.dirname, "data");
await mkdir(dataDir, { recursive: true });
const text = await readFile(path.join(dataDir, "notes.txt"), "utf8");
```

- Los valores de `process.env` son cadenas o `undefined`.
- `path.resolve` construye una ruta absoluta desde el directorio de trabajo; `path.join` solo une. Para archivos junto a un módulo, parte de `import.meta.dirname`.
- `node --env-file=.env app.js` carga un archivo `.env` (desde 20.6); las variables que ya están en el entorno ganan. Deja `.env` fuera de Git y haz commit de un `.env.example`.

### HTTP, en los dos sentidos

```js
import { createServer } from "node:http";

const server = createServer((req, res) => {
  res.writeHead(200, { "content-type": "text/plain" });
  res.end("ok");
});
server.listen(8080);
```

- El **`fetch` global** (desde 18, estable desde 21) se basa en undici. Comprueba `res.ok`: un 404 no rechaza. **Lee o cancela cada cuerpo** (`await res.text()`, `res.body?.cancel()`): un cuerpo sin leer mantiene ocupada su conexión del pool.
- **Detrás de un balanceador de carga**, fija `server.keepAliveTimeout` por encima del tiempo de inactividad del balanceador (a menudo 60 segundos; el valor por defecto de Node es 5), y `headersTimeout` más alto aún, o el balanceador reutilizará conexiones que Node ya cerró y devolverá errores 502.

### Pruebas, scripts, argumentos

- **`node --test`** ejecuta los archivos `*.test.js` escritos con `node:test` y `node:assert`: `describe`, `it`, hooks, mocks, snapshots, modo watch.
- **`node --run build`** ejecuta un script de `package.json` sin el arranque de npm ni sus hooks `pre` y `post`.
- **`parseArgs`** de `node:util` analiza las opciones de línea de comandos para herramientas pequeñas.

### TypeScript sin build

Node quita los tipos de los archivos `.ts` que ejecuta: activo por defecto desde 23.6 y 22.18, estable en Node 24.

- No comprueba tipos: ejecuta `tsc --noEmit` en la CI.
- No lee `tsconfig`; solo sintaxis borrable. `enum`, los namespaces con código y las propiedades de parámetros necesitan `--experimental-transform-types`; activa `erasableSyntaxOnly` en TypeScript para no salirte de los límites.
- Escribe los imports con `.ts` y usa `import type` para los tipos. No se aplica dentro de `node_modules`: los paquetes publican JavaScript.

### Procesos y criptografía

- **`execFile(cmd, args)`** o `spawn` pasan los argumentos sin shell; `exec` con una cadena construida invita a la inyección de comandos.
- **`timingSafeEqual`** de `node:crypto` compara secretos en tiempo constante; `===` filtra diferencias de tiempo. `randomUUID()` y `randomBytes()` dan aleatoriedad segura.
- **`node:vm`** separa los ámbitos globales pero **no es una barrera de seguridad**. El código no fiable necesita aislamiento a nivel de proceso o de sistema.

### Permisos e instrumentación

- **El modelo de permisos**: `node --permission --allow-fs-read=./data app.js` deniega escrituras, procesos hijos, workers y otras lecturas. Es un cinturón de seguridad contra errores, no un entorno aislado para código hostil.
- La **instrumentación** como OpenTelemetry se precarga con `node --import ./instrumentation.js app.js`, para engancharse a `http` y a los clientes de base de datos antes de que la aplicación los cargue; las bibliotecas publican eventos mediante `diagnostics_channel`.

**Para recordar.** La biblioteca estándar cubre ya archivos, clientes y servidores HTTP, pruebas, `.env`, argumentos y la eliminación de tipos de TypeScript; lee cada cuerpo de respuesta, ajusta el keep-alive detrás de los balanceadores, evita las shells, y no confundas `vm` ni los permisos con un entorno aislado.

## Parte 5 — package.json y el versionado semántico

### El manifiesto

```json
{
  "name": "inventory-api",
  "version": "1.4.0",
  "type": "module",
  "engines": { "node": ">=24" },
  "scripts": {
    "dev": "node --watch src/server.ts",
    "test": "node --test",
    "lint": "eslint .",
    "build": "tsc"
  },
  "dependencies": { "fastify": "^5.6.0", "zod": "^4.1.0" },
  "devDependencies": { "eslint": "^9.38.0", "typescript": "^5.9.0" }
}
```

- Las **`dependencies`** hacen falta en ejecución, las **`devDependencies`** solo para compilar y probar; `npm ci --omit=dev` se salta estas últimas.
- Las **`peerDependencies`** las aporta el anfitrión: un plugin declara el ESLint o el React con el que funciona. npm 7 y posteriores las instalan y se detienen con `ERESOLVE` si hay conflicto; `--legacy-peer-deps` solo lo oculta.
- Las **`optionalDependencies`** con campos `os` y `cpu` permiten a herramientas como esbuild publicar un paquete binario por plataforma, del que solo se instala el que coincide.
- **`bin`** asocia nombres de comandos a archivos que empiezan por `#!/usr/bin/env node`.

### Los scripts

`npm run lint` pone `node_modules/.bin` en el `PATH`, así que se ejecuta el ESLint del proyecto. `test`, `start` y algunos más tienen atajo. `pretest` y `posttest` se ejecutan automáticamente alrededor de `test`; muchos equipos prefieren encadenamientos explícitos.

### El versionado semántico

MAYOR.MENOR.PARCHE: una mayor rompe la compatibilidad, una menor añade funciones, un parche corrige errores.

| Rango | Permite | Nota |
|---|---|---|
| `^5.1.0` | de 5.1.0 a menos de 6.0.0 | El valor por defecto de npm |
| `~5.1.0` | de 5.1.0 a menos de 5.2.0 | Solo parches |
| `5.1.0` | 5.1.0 | Exacta |
| `^0.8.3` | de 0.8.3 a menos de 0.9.0 | En 0.x, una menor puede romper |
| `^1.3.0-beta.0` | Las betas de 1.3.0, luego 1.3.x | Las preversiones solo encajan si se nombran |

Es **incompatible** todo lo que puede romper a un usuario dentro de su rango: quitar una API, cambiar `exports`, dejar una línea de Node o endurecer los tipos de TypeScript. Pon tu política por escrito.

### Averiguar por qué

`npm ls pkg --all` y `npm explain pkg` muestran qué dependencias traen un paquete. `npm outdated` muestra «wanted» (la más nueva dentro del rango) y «latest» (la más nueva publicada).

**Para recordar.** Separa dependencias de ejecución y de desarrollo, declara pares para los plugins, usa rangos con acento circunflejo entendiendo 0.x y las preversiones, y trata los tipos y el runtime como parte de tu API.

## Parte 6 — Instalar y los lockfiles

### Qué hace una instalación

`npm install zod` descarga zod y sus dependencias en `node_modules`, añade un rango en `package.json` y registra las versiones exactas de todo el árbol, con sus URLs `resolved` y sus hashes `integrity`, en `package-lock.json`.

- Haz commit del **lockfile**; nunca de `node_modules`.
- **`npm ci`** instala exactamente el lockfile partiendo de un `node_modules` vacío y falla si no coincide con `package.json`. Úsalo en la CI y en los Dockerfiles.
- **`npm update`** avanza dentro de los rangos; una nueva mayor necesita `npm install pkg@latest`, revisado con su changelog. Dependabot o Renovate programan estas actualizaciones.
- **`npx tool`** (o `npm exec`) ejecuta el comando de un paquete sin instalación global.

### Controlar el árbol

```json
{
  "overrides": { "semver": "^7.6.3" },
  "workspaces": ["packages/*"]
}
```

- Los **`overrides`** imponen una versión en cualquier punto del árbol, por ejemplo para corregir una vulnerabilidad transitiva. Quítalos cuando el padre esté corregido.
- Los **workspaces** crean un monorepo: una instalación, un lockfile, paquetes locales enlazados por su nombre. `npm run build --workspaces` ejecuta en cada uno.
- **`npm dedupe`** reduce los duplicados cuando los rangos lo permiten; dos copias de un singleton como React rompen los hooks.
- Un **conflicto de fusión del lockfile**: resuelve `package.json`, ejecuta `npm install`, haz commit. Borrar el lockfile vuelve a resolverlo todo.

### Otros gestores de paquetes

| Herramienta | Disposición | Notas |
|---|---|---|
| npm | `node_modules` plano, con subida | Viene con Node |
| pnpm | Almacén direccionado por contenido, enlaces duros, árbol de enlaces simbólicos | Estricto: sin dependencias fantasma; los scripts de instalación necesitan aprobación desde la 10 |
| Yarn (Berry) | Plug'n'Play (`.pnp.cjs`) o `node_modules` | Sin `node_modules` en PnP; las herramientas pueden necesitar SDK |
| Bun | Caché global | También es un runtime |

- **Dependencias fantasma**: con la disposición plana de npm, el código puede importar un paquete que nunca declaró porque se subió a la raíz; se rompe cuando cambia el árbol. pnpm lo impide.
- **`packageManager`** en `package.json` fija la versión del gestor; **Corepack** lo lee. Node 25 y posteriores ya no incluyen Corepack: instálalo con `npm install -g corepack`, o deja que pnpm y Yarn lean el campo por sí mismos.

### Reproducibilidad y registros

Un lockfile fija los archivos comprimidos, no lo que pasa después: los paquetes opcionales de cada plataforma y los módulos nativos compilados por scripts de instalación pueden diferir. Compila en la imagen en la que ejecutas y prefiere binarios Node-API precompilados.

Muchas empresas instalan a través de un **proxy de registro** (Artifactory, Verdaccio, GitHub Packages): guarda en caché, aloja los paquetes internos, aplica políticas y sigue funcionando cuando el registro público va lento.

**Para recordar.** Haz commit del lockfile, usa `npm ci` en la automatización, actualiza de forma deliberada, usa overrides y workspaces con moderación y sabiendo lo que haces, y conoce lo que tu gestor de paquetes hace distinto.

## Parte 7 — Publicar

### El registro y las versiones

El registro de npm guarda los paquetes publicados; cualquiera puede publicar y nadie revisa el código antes. Una **versión publicada es inmutable**: una corrección es una versión nueva.

```sh
npm pack --dry-run       # listar los archivos que se publicarían
npm version minor        # 1.4.0 -> 1.5.0, commit y etiqueta v1.5.0
npm publish --access public
```

- El campo **`files`** es una lista blanca de lo que se publica; más seguro que `.npmignore`.
- Un **ámbito** (`@acme/logger`) es un espacio de nombres; los paquetes con ámbito son privados por defecto, así que la primera publicación pública necesita `--access public`.
- Las **dist-tags** dan nombre a versiones: las instalaciones usan `latest`. Publica una preversión con `npm publish --tag next`.

### La forma de un paquete moderno

- Publica **JavaScript más archivos `.d.ts`**; indícalos con una condición `types` al principio de `exports`. Node no quita los tipos dentro de `node_modules`.
- **Solo ESM** es razonable para una biblioteca nueva: todas las líneas de Node con soporte pueden cargarla con `require()`, siempre que los puntos de entrada no tengan `await` de nivel superior.
- **Declara las dependencias** en lugar de empaquetarlas, para que los usuarios puedan deduplicarlas, auditarlas y parchearlas.
- **`prepare`** se ejecuta antes de pack y publish, tras una instalación local y en las instalaciones desde Git; **`prepublishOnly`** solo antes de publish.
- Comprueba el **archivo empaquetado** con publint y Are the Types Wrong, e impórtalo desde un proyecto vacío con `import` y `require`.

### Publicación de confianza y procedencia

La **publicación de confianza** permite a un workflow de CI publicar sin ningún token guardado: en npmjs.com, el paquete confía en un repositorio y un workflow, y el job obtiene una credencial efímera por OIDC. Necesita npm 11.5.1 o posterior y funciona con GitHub Actions y GitLab CI.

```yaml
permissions:
  contents: read
  id-token: write
steps:
  - uses: actions/checkout@v5
  - uses: actions/setup-node@v5
    with:
      node-version: 24
      registry-url: https://registry.npmjs.org
  - run: npm ci
  - run: npm test
  - run: npm publish
```

La **procedencia**, generada automáticamente con la publicación de confianza, vincula cada versión con su repositorio, su commit y su workflow, firmada con Sigstore; `npm audit signatures` la verifica. Demuestra dónde se construyó un paquete, no que su código sea seguro.

### Cuando algo sale mal

- Despublicar solo se permite en paquetes recientes o poco usados, desde left-pad (2016). Publica una corrección y `npm deprecate pkg@4.1.0 "message"`; devuelve `latest` atrás con `npm dist-tag` si hace falta.
- Dejar una línea de Node es una **mayor**.

**Para recordar.** Publica lo que quieres (`files`, `npm pack`), JavaScript con sus tipos, `exports` con `types` primero, dist-tags para las preversiones, publica desde la CI con la publicación de confianza, y corrige hacia delante.

## Parte 8 — Seguridad y cadena de suministro

### Qué puede salir mal

| Amenaza | Ejemplo | Defensa |
|---|---|---|
| Vulnerabilidades conocidas | Un aviso sobre una dependencia | `npm audit`, Dependabot, actualizaciones concretas y overrides |
| Scripts de instalación maliciosos | Un `postinstall` roba tokens | `ignore-scripts=true`, la lista de aprobación de pnpm |
| Mantenedor comprometido | Un gusano republica paquetes | Espera antes de adoptar, procedencia, credenciales efímeras |
| Typosquatting | `expresss` | Revisar nombres, descargas y repositorios |
| Confusión de dependencias | `billing-utils@99.0.0` público | Ámbitos asociados al registro privado |
| Inyección en el lockfile | Una URL `resolved` hacia un host desconocido | lockfile-lint, revisar los diffs del lockfile |
| Inyección en workflows | `pull_request_target` que ejecuta código de un fork | No ejecutar nunca código no fiable con secretos; publicación de confianza |

### 2025, el año de los gusanos

En septiembre de 2025, un phishing dio a unos atacantes el control de paquetes muy usados, y el gusano **Shai-Hulud** se propagó solo: scripts de instalación robaban las credenciales de npm y GitHub y publicaban versiones infectadas de los otros paquetes de las víctimas, cientos en pocos días, con una segunda ola en noviembre. Unas semanas antes, un workflow de GitHub que usaba `pull_request_target` había filtrado el token de publicación de un monorepo popular.

La respuesta de npm, completada en diciembre de 2025:

- **Tokens clásicos revocados**; los tokens granulares de escritura duran como máximo 90 días.
- **`npm login`** da una sesión de dos horas, con 2FA para publicar; la 2FA está activa por defecto en los paquetes nuevos.
- **Publicación de confianza** recomendada para la CI.

### Hábitos que funcionan

- **Retrasa las versiones nuevas**: la mayoría de las versiones maliciosas se detectan en horas o días.

```ini
# .npmrc
min-release-age=3
ignore-scripts=true
@acme:registry=https://npm.acme.dev/
//npm.acme.dev/:_authToken=${NPM_TOKEN}
```

`min-release-age` se cuenta en días (npm 11.10 y posteriores); pnpm 11 fija `minimumReleaseAge` en un día por defecto, y Yarn tiene `npmMinimalAgeGate`.

- **Desactiva los scripts de instalación** y recompila explícitamente los pocos paquetes nativos (`npm rebuild sharp`); pnpm 10 te pide aprobarlos con `pnpm approve-builds`.
- **Lee `npm audit` según la alcanzabilidad**, no solo la gravedad; `npm audit fix --force` puede saltar versiones mayores.
- **Mantén los secretos fuera del código y de los archivos**: tokens por variables de entorno, `.npmrc` con `${NPM_TOKEN}`, `.env` ignorado por Git.
- **Los hashes `integrity`** del lockfile fijan bytes, no seguridad: una versión maliciosa fijada hoy sigue siendo maliciosa, y un atacante que edita `resolved` puede aportar un hash a juego.

**Para recordar.** Parte de la idea de que cualquier dependencia puede volverse hostil: pocas dependencias, scripts de instalación desactivados, versiones nuevas retrasadas, ámbitos para los nombres internos, diffs del lockfile revisados, y ningún token duradero en ninguna parte.

## Ejercicios

1. El servicio de un compañero corre con Node 20 en producción. ¿Qué le dices y qué cambias en el repositorio?
2. Convierte este archivo CommonJS a ESM: `const fs = require("fs"); const p = require("path").join(__dirname, "a.txt"); module.exports = () => fs.readFileSync(p, "utf8");`
3. ¿Qué muestra esto en un script CommonJS, y por qué? `setTimeout(() => log(1)); setImmediate(() => log(2)); Promise.resolve().then(() => log(3)); process.nextTick(() => log(4)); log(5);`
4. Un servicio Node detrás de un balanceador con un tiempo de inactividad de 60 segundos devuelve errores 502 esporádicos, y sus llamadas `fetch` salientes empiezan poco a poco a hacer cola. Da una causa de cada cosa.
5. Una biblioteca depende de `"^0.4.2"` de un analizador. Ha salido la versión 0.5.0. ¿La tendrán los usuarios en su próxima instalación? ¿Y la 0.4.9?
6. Tu CI ejecuta `npm install` y a veces cambia el lockfile. ¿Qué cambias y por qué?
7. Escribe el campo `exports` de un paquete solo ESM con su entrada en `dist/index.js`, los tipos en `dist/index.d.ts` y una subruta pública `./cli`.
8. Enumera cuatro ajustes o prácticas que habrían limitado los daños de un gusano como Shai-Hulud en el portátil de un desarrollador y en la CI.

### Respuestas

1. Node 20 llegó al fin de su vida en abril de 2026 y ya no recibe correcciones de seguridad. Pasa a Node 24 o 26: actualiza `.nvmrc`, `engines`, la matriz de la CI y la imagen base, ejecuta las pruebas y lee los cambios incompatibles de cada mayor.
2. `import { readFileSync } from "node:fs"; import path from "node:path"; const p = path.join(import.meta.dirname, "a.txt"); export default () => readFileSync(p, "utf8");` con `"type": "module"` o una extensión `.mjs`.
3. 5, 4, 3, y luego 1 y 2 en un orden no garantizado desde el script principal: primero el código síncrono, luego `nextTick`, luego los callbacks de promesas y luego las fases timers y check del bucle.
4. Los 502: el `keepAliveTimeout` de Node (5 segundos) es más corto que el tiempo de inactividad del balanceador; fíjalo por encima de 60 segundos. La cola: cuerpos de respuesta que nunca se leen mantienen ocupadas las conexiones del pool; lee o cancela cada cuerpo.
5. La 0.5.0 no: en 0.x el acento circunflejo solo permite 0.4.x. La 0.4.9 sí.
6. Usa `npm ci`: instala exactamente el lockfile y falla cuando `package.json` y el lockfile no coinciden, en lugar de reescribirlo en silencio.
7. `"exports": { ".": { "types": "./dist/index.d.ts", "default": "./dist/index.js" }, "./cli": "./dist/cli.js" }`, con `"type": "module"`.
8. `ignore-scripts=true` (o la lista de aprobación de pnpm), `min-release-age` o `minimumReleaseAge`, ningún token de npm duradero (publicación de confianza en la CI, sesiones cortas en local), secretos fuera de los archivos que pueden leer los scripts, y `npm ci` desde un lockfile revisado.

## Fuentes

Páginas de referencia para cada parte. Las herramientas y las fechas cambian: comprueba la página antes de fiarte de un detalle.

| Parte | Páginas |
|---|---|
| 1 | [Node.js releases](https://nodejs.org/en/about/previous-releases) · [Evolving the Node.js release schedule](https://nodejs.org/en/blog/announcements/evolving-the-nodejs-release-schedule) |
| 2 | [Node.js modules: packages](https://nodejs.org/api/packages.html) · [ECMAScript modules](https://nodejs.org/api/esm.html) |
| 3 | [The Node.js event loop](https://nodejs.org/en/learn/asynchronous-work/event-loop-timers-and-nexttick) · [Streams](https://nodejs.org/api/stream.html) |
| 4 | [Node.js API documentation](https://nodejs.org/api/) · [Running TypeScript natively](https://nodejs.org/en/learn/typescript/run-natively) |
| 5 | [package.json](https://docs.npmjs.com/cli/configuring-npm/package-json) · [Semantic Versioning](https://semver.org/) |
| 6 | [npm ci](https://docs.npmjs.com/cli/commands/npm-ci) · [pnpm](https://pnpm.io/) · [Yarn](https://yarnpkg.com/) |
| 7 | [Trusted publishing for npm packages](https://docs.npmjs.com/trusted-publishers) · [Generating provenance statements](https://docs.npmjs.com/generating-provenance-statements) |
| 8 | [npm classic tokens revoked](https://github.blog/changelog/2025-12-09-npm-classic-tokens-revoked-session-based-auth-and-cli-token-management-now-available/) · [Our plan for a more secure npm supply chain](https://github.blog/security/npm/our-plan-for-a-more-secure-npm-supply-chain/) |
