/**
 * Node.js and npm, Avancé: worker threads, graceful shutdown, the inspector,
 * event-loop delay, the dual package hazard, conditional exports, resolution
 * and subpath imports, abort signals, the loop's phases, backpressure and
 * AsyncLocalStorage, type stripping, `parseArgs`, `execFile` and
 * `timingSafeEqual`, `bin`, platform packages, `npm explain`, prereleases,
 * phantom dependencies, lockfile conflicts, pnpm's store, Corepack, trusted
 * publishing and provenance, unpublishing, the 2025 worm, release-age
 * gates, the permission model and pnpm's script approval.
 * Code between backticks is the same in the three languages.
 */
import type { LinuxQuestion as NodeQuestion } from "../linux/types";

const runtimeAdvanced: NodeQuestion[] = [
  {
    id: "nd-runtime-09",
    q: ["An API must resize images, a CPU-heavy task, without slowing other requests. What fits best in Node?", "Une API doit redimensionner des images, une tâche lourde pour le CPU, sans ralentir les autres requêtes. Qu'est-ce qui convient le mieux dans Node ?", "Una API debe redimensionar imágenes, una tarea pesada para la CPU, sin frenar otras peticiones. ¿Qué encaja mejor en Node?"],
    a: ["A pool of worker threads (`node:worker_threads`), or a native library that works off the main thread", "Un pool de worker threads (`node:worker_threads`), ou une bibliothèque native qui travaille hors du fil principal", "Un pool de worker threads (`node:worker_threads`), o una biblioteca nativa que trabaje fuera del hilo principal"],
    w: [["Wrap the computation in a promise, which runs it in parallel", "Envelopper le calcul dans une promesse, qui l'exécute en parallèle", "Envolver el cálculo en una promesa, que lo ejecuta en paralelo"], ["Add `async` to the function", "Ajouter `async` à la fonction", "Añadir `async` a la función"], ["Split it with `setTimeout(fn, 0)` calls and let the loop do it in parallel", "Le découper avec des appels `setTimeout(fn, 0)` et laisser la boucle le faire en parallèle", "Trocearlo con llamadas a `setTimeout(fn, 0)` y dejar que el bucle lo haga en paralelo"]],
    e: [
      "A promise does not create a thread: JavaScript inside it still runs on the main one. Workers have their own event loop and heap and talk by messages; a pool (Piscina, for instance) reuses them. For many cores and isolation, run several processes behind a load balancer.",
      "Une promesse ne crée pas de fil : le JavaScript qu'elle contient tourne toujours sur le principal. Les workers ont leur propre boucle d'événements et leur propre tas, et communiquent par messages ; un pool (Piscina, par exemple) les réutilise. Pour exploiter beaucoup de cœurs avec isolation, lancez plusieurs processus derrière un répartiteur de charge.",
      "Una promesa no crea un hilo: el JavaScript que contiene sigue corriendo en el principal. Los workers tienen su propio bucle de eventos y su propio heap y se comunican por mensajes; un pool (Piscina, por ejemplo) los reutiliza. Para aprovechar muchos núcleos con aislamiento, ejecuta varios procesos detrás de un balanceador de carga.",
    ],
  },
  {
    id: "nd-runtime-10",
    q: ["The platform sends `SIGTERM` before stopping a container. What should a Node server do?", "La plateforme envoie `SIGTERM` avant d'arrêter un conteneur. Que doit faire un serveur Node ?", "La plataforma envía `SIGTERM` antes de parar un contenedor. ¿Qué debe hacer un servidor Node?"],
    a: ["Stop accepting connections with `server.close()`, finish the requests in flight, close pools, then exit before the grace period ends", "Cesser d'accepter des connexions avec `server.close()`, finir les requêtes en cours, fermer les pools, puis sortir avant la fin du délai de grâce", "Dejar de aceptar conexiones con `server.close()`, terminar las peticiones en curso, cerrar los pools y salir antes de que acabe el periodo de gracia"],
    w: [["Ignore it: the platform waits as long as needed", "L'ignorer : la plateforme attend autant qu'il faut", "Ignorarla: la plataforma espera lo que haga falta"], ["Call `process.exit(0)` at once", "Appeler `process.exit(0)` tout de suite", "Llamar a `process.exit(0)` de inmediato"], ["Restart itself to stay alive", "Se relancer pour rester en vie", "Reiniciarse para seguir vivo"]],
    e: [
      "After the grace period (often 10 to 30 seconds) comes `SIGKILL`, which cannot be caught. A clean shutdown avoids dropped requests during deployments. `server.closeIdleConnections()` frees keep-alive sockets; a timer guards against hanging work.",
      "Après le délai de grâce (souvent 10 à 30 secondes) vient `SIGKILL`, qu'on ne peut pas intercepter. Un arrêt propre évite de perdre des requêtes pendant les déploiements. `server.closeIdleConnections()` libère les sockets keep-alive ; un minuteur protège contre un travail qui s'éternise.",
      "Tras el periodo de gracia (a menudo de 10 a 30 segundos) llega `SIGKILL`, que no se puede capturar. Un apagado limpio evita perder peticiones durante los despliegues. `server.closeIdleConnections()` libera los sockets keep-alive; un temporizador protege contra trabajo que se eterniza.",
    ],
  },
  {
    id: "nd-runtime-11",
    q: ["What does `node --inspect app.js` open, and what must you avoid?", "Qu'ouvre `node --inspect app.js`, et qu'est-ce qu'il faut éviter ?", "¿Qué abre `node --inspect app.js` y qué hay que evitar?"],
    a: ["A debugger port (127.0.0.1:9229) for Chrome DevTools or an editor; never bind it to a public address, since it allows running any code", "Un port de débogage (127.0.0.1:9229) pour Chrome DevTools ou un éditeur ; ne jamais le lier à une adresse publique, car il permet d'exécuter n'importe quel code", "Un puerto de depuración (127.0.0.1:9229) para Chrome DevTools o un editor; nunca enlazarlo a una dirección pública, porque permite ejecutar cualquier código"],
    w: [["A web page with the app's logs; it is safe to expose", "Une page web avec les journaux de l'application ; on peut l'exposer sans risque", "Una página web con los registros de la app; se puede exponer sin riesgo"], ["A read-only view of memory usage", "Une vue en lecture seule de l'usage mémoire", "Una vista de solo lectura del uso de memoria"], ["Nothing in production, where the flag is ignored", "Rien en production, où l'option est ignorée", "Nada en producción, donde la opción se ignora"]],
    e: [
      "The inspector gives breakpoints, CPU profiles and heap snapshots. Anyone who reaches the port controls the process. Use `--inspect-brk` to stop on the first line, and reach a remote one through an SSH tunnel.",
      "L'inspecteur donne des points d'arrêt, des profils CPU et des instantanés du tas. Qui atteint le port contrôle le processus. Utilisez `--inspect-brk` pour s'arrêter à la première ligne, et passez par un tunnel SSH pour un processus distant.",
      "El inspector da puntos de interrupción, perfiles de CPU e instantáneas del heap. Quien llega al puerto controla el proceso. Usa `--inspect-brk` para parar en la primera línea y un túnel SSH para un proceso remoto.",
    ],
  },
  {
    id: "nd-runtime-12",
    q: ["Latency rises at random under load though CPU and memory look fine. What measures whether the event loop is being blocked?", "La latence monte au hasard sous charge alors que CPU et mémoire semblent normaux. Qu'est-ce qui mesure si la boucle d'événements est bloquée ?", "La latencia sube al azar con carga aunque CPU y memoria parecen normales. ¿Qué mide si el bucle de eventos se está bloqueando?"],
    a: ["Event-loop delay, with `monitorEventLoopDelay` from `node:perf_hooks`, then a CPU profile to find the long task", "Le délai de la boucle d'événements, avec `monitorEventLoopDelay` de `node:perf_hooks`, puis un profil CPU pour trouver la tâche longue", "El retraso del bucle de eventos, con `monitorEventLoopDelay` de `node:perf_hooks`, y luego un perfil de CPU para encontrar la tarea larga"],
    w: [["The number of open files", "Le nombre de fichiers ouverts", "El número de archivos abiertos"], ["The size of `node_modules`", "La taille de `node_modules`", "El tamaño de `node_modules`"], ["`process.uptime()`", "`process.uptime()`", "`process.uptime()`"]],
    e: [
      "Delay measures how late timers fire: tens of milliseconds means some callback holds the thread (a big `JSON.parse`, a regex, a sync call). `node --cpu-prof` writes a profile to open in DevTools. Export the delay as a metric.",
      "Le délai mesure le retard des minuteurs : des dizaines de millisecondes signifient qu'un callback garde le fil (un gros `JSON.parse`, une regex, un appel synchrone). `node --cpu-prof` écrit un profil à ouvrir dans DevTools. Exportez le délai comme métrique.",
      "El retraso mide cuánto tardan los temporizadores en dispararse: decenas de milisegundos significan que algún callback retiene el hilo (un `JSON.parse` grande, una regex, una llamada síncrona). `node --cpu-prof` escribe un perfil para abrir en DevTools. Exporta el retraso como métrica.",
    ],
  },
];

const modulesAdvanced: NodeQuestion[] = [
  {
    id: "nd-modules-09",
    q: ["A package ships both a CommonJS and an ESM build. One file `require`s it and another `import`s it. What can go wrong?", "Un paquet publie une version CommonJS et une version ESM. Un fichier le charge par `require`, un autre par `import`. Que peut-il se passer ?", "Un paquete publica una versión CommonJS y otra ESM. Un archivo lo carga con `require` y otro con `import`. ¿Qué puede salir mal?"],
    a: ["Two copies load, with separate state: a singleton exists twice and `instanceof` fails across them", "Deux copies se chargent, avec des états séparés : un singleton existe deux fois et `instanceof` échoue entre elles", "Se cargan dos copias, con estado separado: un singleton existe dos veces e `instanceof` falla entre ellas"],
    w: [["Node merges them into one module automatically", "Node les fusionne automatiquement en un seul module", "Node las fusiona en un solo módulo automáticamente"], ["The second load throws `ERR_DUPLICATE_MODULE`", "Le second chargement lève `ERR_DUPLICATE_MODULE`", "La segunda carga lanza `ERR_DUPLICATE_MODULE`"], ["Nothing: both builds share their variables", "Rien : les deux versions partagent leurs variables", "Nada: las dos versiones comparten sus variables"]],
    e: [
      "This is the dual package hazard. Packages avoid it by keeping state in one build and wrapping it in the other, or now by shipping ESM only, since `require(esm)` lets CommonJS users load it.",
      "C'est le risque du double paquet. Les paquets l'évitent en gardant l'état dans une seule version et en l'enveloppant dans l'autre, ou désormais en ne publiant que de l'ESM, puisque `require(esm)` permet aux utilisateurs de CommonJS de le charger.",
      "Es el riesgo del paquete doble. Los paquetes lo evitan guardando el estado en una sola versión y envolviéndola en la otra, o ahora publicando solo ESM, ya que `require(esm)` permite cargarlo desde CommonJS.",
    ],
  },
  {
    id: "nd-modules-10",
    q: ["In `\"exports\": { \".\": { \"default\": \"./index.js\", \"import\": \"./index.mjs\" } }`, which file does `import` load?", "Dans `\"exports\": { \".\": { \"default\": \"./index.js\", \"import\": \"./index.mjs\" } }`, quel fichier `import` charge-t-il ?", "En `\"exports\": { \".\": { \"default\": \"./index.js\", \"import\": \"./index.mjs\" } }`, ¿qué archivo carga `import`?"],
    a: ["`./index.js`: conditions are tried in order and `default` matches everything, so it must come last", "`./index.js` : les conditions sont essayées dans l'ordre et `default` correspond à tout, il doit donc venir en dernier", "`./index.js`: las condiciones se prueban en orden y `default` encaja con todo, así que debe ir al final"],
    w: [["`./index.mjs`, since `import` is more specific", "`./index.mjs`, puisque `import` est plus précis", "`./index.mjs`, porque `import` es más específico"], ["Both, merged", "Les deux, fusionnés", "Los dos, combinados"], ["Neither: the field is invalid and ignored", "Aucun : le champ est invalide et ignoré", "Ninguno: el campo no es válido y se ignora"]],
    e: [
      "Object key order is significant in `exports`: the first matching condition wins. The usual order is `types`, then `import` or `require` (or `node`, `browser`), then `default`. Tools like publint and Are the Types Wrong catch such mistakes.",
      "L'ordre des clés compte dans `exports` : la première condition qui correspond l'emporte. L'ordre habituel est `types`, puis `import` ou `require` (ou `node`, `browser`), puis `default`. Des outils comme publint et Are the Types Wrong repèrent ces erreurs.",
      "El orden de las claves importa en `exports`: gana la primera condición que encaja. El orden habitual es `types`, luego `import` o `require` (o `node`, `browser`) y luego `default`. Herramientas como publint y Are the Types Wrong detectan estos errores.",
    ],
  },
  {
    id: "nd-modules-11",
    q: ["`/app/src/server.js` imports `\"lodash\"`. Where does Node look?", "`/app/src/server.js` importe `\"lodash\"`. Où Node cherche-t-il ?", "`/app/src/server.js` importa `\"lodash\"`. ¿Dónde busca Node?"],
    a: ["In `/app/src/node_modules`, then `/app/node_modules`, then `/node_modules`, walking up the folders", "Dans `/app/src/node_modules`, puis `/app/node_modules`, puis `/node_modules`, en remontant les dossiers", "En `/app/src/node_modules`, luego `/app/node_modules`, luego `/node_modules`, subiendo por las carpetas"],
    w: [["Only in the global npm folder", "Seulement dans le dossier global de npm", "Solo en la carpeta global de npm"], ["On the npm registry, downloading it if needed", "Sur le registre npm, en le téléchargeant au besoin", "En el registro de npm, descargándolo si hace falta"], ["Only in the `node_modules` next to `package.json`, nowhere else", "Seulement dans le `node_modules` voisin de `package.json`, nulle part ailleurs", "Solo en el `node_modules` junto a `package.json`, en ningún otro sitio"]],
    e: [
      "Bare specifiers resolve by climbing `node_modules` folders; in the package found, `exports` (or `main`) picks the file. This walk is why a package can sometimes import something it never declared, and why stray `node_modules` higher up cause surprises.",
      "Les noms nus se résolvent en remontant les dossiers `node_modules` ; dans le paquet trouvé, `exports` (ou `main`) choisit le fichier. Cette remontée explique qu'un paquet puisse parfois importer ce qu'il n'a jamais déclaré, et que des `node_modules` égarés plus haut créent des surprises.",
      "Los nombres sin ruta se resuelven subiendo por las carpetas `node_modules`; en el paquete encontrado, `exports` (o `main`) elige el archivo. Este recorrido explica que un paquete a veces pueda importar algo que nunca declaró, y que unos `node_modules` perdidos más arriba den sorpresas.",
    ],
  },
  {
    id: "nd-modules-12",
    q: ["How can an app write `import db from \"#db\"` instead of `\"../../../lib/db.js\"`, with plain Node?", "Comment une application peut-elle écrire `import db from \"#db\"` au lieu de `\"../../../lib/db.js\"`, avec Node seul ?", "¿Cómo puede una app escribir `import db from \"#db\"` en lugar de `\"../../../lib/db.js\"`, con Node solo?"],
    a: ["With subpath imports: `\"imports\": { \"#db\": \"./src/lib/db.js\" }` in its `package.json`", "Avec les imports de sous-chemins : `\"imports\": { \"#db\": \"./src/lib/db.js\" }` dans son `package.json`", "Con las importaciones de subrutas: `\"imports\": { \"#db\": \"./src/lib/db.js\" }` en su `package.json`"],
    w: [["Only with a bundler alias; Node has nothing for it", "Seulement avec un alias de bundler ; Node n'a rien pour cela", "Solo con un alias del bundler; Node no tiene nada para ello"], ["By publishing `db` as a package", "En publiant `db` comme paquet", "Publicando `db` como paquete"], ["With `paths` in `tsconfig.json`, which Node reads", "Avec `paths` dans `tsconfig.json`, que Node lit", "Con `paths` en `tsconfig.json`, que Node lee"]],
    e: [
      "`imports` entries start with `#` and are private to the package. They support conditions too, for example a different file for tests or browsers. TypeScript understands them with `moduleResolution` set to `nodenext` or `bundler`; `tsconfig` `paths` are not read by Node.",
      "Les entrées de `imports` commencent par `#` et sont privées au paquet. Elles acceptent aussi des conditions, par exemple un autre fichier pour les tests ou les navigateurs. TypeScript les comprend avec `moduleResolution` à `nodenext` ou `bundler` ; Node ne lit pas les `paths` de `tsconfig`.",
      "Las entradas de `imports` empiezan por `#` y son privadas del paquete. También admiten condiciones, por ejemplo otro archivo para pruebas o navegadores. TypeScript las entiende con `moduleResolution` en `nodenext` o `bundler`; Node no lee los `paths` de `tsconfig`.",
    ],
  },
];

const asyncAdvanced: NodeQuestion[] = [
  {
    id: "nd-async-09",
    q: ["How do you give a `fetch` call a 5-second limit and let the user cancel it too?", "Comment donner à un appel `fetch` une limite de 5 secondes tout en laissant l'utilisateur l'annuler ?", "¿Cómo se da a una llamada `fetch` un límite de 5 segundos y se deja que el usuario también la cancele?"],
    a: ["`fetch(url, { signal: AbortSignal.any([userSignal, AbortSignal.timeout(5000)]) })`", "`fetch(url, { signal: AbortSignal.any([userSignal, AbortSignal.timeout(5000)]) })`", "`fetch(url, { signal: AbortSignal.any([userSignal, AbortSignal.timeout(5000)]) })`"],
    w: [["`await Promise.race([fetch(url), sleep(5000)])`, which also stops the request", "`await Promise.race([fetch(url), sleep(5000)])`, qui arrête aussi la requête", "`await Promise.race([fetch(url), sleep(5000)])`, que también detiene la petición"], ["`fetch(url, { timeout: 5000 })`", "`fetch(url, { timeout: 5000 })`", "`fetch(url, { timeout: 5000 })`"], ["`setTimeout(() => fetch.cancel(), 5000)`", "`setTimeout(() => fetch.cancel(), 5000)`", "`setTimeout(() => fetch.cancel(), 5000)`"]],
    e: [
      "Signals are Node's common cancellation mechanism: `fetch`, `fs/promises`, streams, timers and `events.once` accept one. A race only stops waiting; the request keeps its socket. Pass the signal down so each layer can stop its work.",
      "Les signaux sont le mécanisme d'annulation commun de Node : `fetch`, `fs/promises`, les flux, les minuteurs et `events.once` en acceptent un. Une course arrête seulement l'attente ; la requête garde son socket. Transmettez le signal vers le bas pour que chaque couche arrête son travail.",
      "Las señales son el mecanismo común de cancelación de Node: `fetch`, `fs/promises`, los streams, los temporizadores y `events.once` aceptan una. Una carrera solo deja de esperar; la petición conserva su socket. Pasa la señal hacia abajo para que cada capa detenga su trabajo.",
    ],
  },
  {
    id: "nd-async-10",
    q: ["Inside an I/O callback (after `readFile` completes), `setTimeout(a, 0)` and `setImmediate(b)` are scheduled. Which runs first?", "Dans un callback d'entrée-sortie (après la fin d'un `readFile`), on planifie `setTimeout(a, 0)` et `setImmediate(b)`. Lequel passe en premier ?", "Dentro de un callback de entrada y salida (tras terminar un `readFile`), se programan `setTimeout(a, 0)` y `setImmediate(b)`. ¿Cuál se ejecuta primero?"],
    a: ["`b`: after the poll phase comes the check phase, which runs immediates, before the loop returns to timers", "`b` : après la phase poll vient la phase check, qui exécute les immediates, avant que la boucle ne revienne aux minuteurs", "`b`: tras la fase poll viene la fase check, que ejecuta los immediates, antes de que el bucle vuelva a los temporizadores"],
    w: [["`a`: timers always come first", "`a` : les minuteurs passent toujours en premier", "`a`: los temporizadores siempre van primero"], ["They run at the same time", "Ils s'exécutent en même temps", "Se ejecutan a la vez"], ["It is random, even inside an I/O callback", "C'est aléatoire, même dans un callback d'entrée-sortie", "Es aleatorio, incluso dentro de un callback de entrada y salida"]],
    e: [
      "The loop cycles through timers, pending callbacks, poll (I/O), check (`setImmediate`) and close callbacks. From the main script the order of the two is not guaranteed; from an I/O callback, the immediate always wins.",
      "La boucle parcourt les minuteurs, les callbacks en attente, poll (entrées-sorties), check (`setImmediate`) et les callbacks de fermeture. Depuis le script principal, l'ordre des deux n'est pas garanti ; depuis un callback d'entrée-sortie, l'immediate gagne toujours.",
      "El bucle recorre temporizadores, callbacks pendientes, poll (entrada y salida), check (`setImmediate`) y callbacks de cierre. Desde el script principal el orden de los dos no está garantizado; desde un callback de entrada y salida, el immediate siempre gana.",
    ],
  },
  {
    id: "nd-async-11",
    q: ["A loop calls `stream.write(chunk)` for a million rows and memory grows without limit. What is ignored?", "Une boucle appelle `stream.write(chunk)` pour un million de lignes et la mémoire grossit sans limite. Qu'est-ce qui est ignoré ?", "Un bucle llama a `stream.write(chunk)` para un millón de filas y la memoria crece sin límite. ¿Qué se está ignorando?"],
    a: ["Backpressure: `write` returns `false` when the buffer is full, and the loop should wait for the `drain` event", "La contre-pression : `write` renvoie `false` quand le tampon est plein, et la boucle devrait attendre l'événement `drain`", "La contrapresión: `write` devuelve `false` cuando el búfer está lleno y el bucle debería esperar al evento `drain`"],
    w: [["The stream's encoding", "L'encodage du flux", "La codificación del stream"], ["The `end` event", "L'événement `end`", "El evento `end`"], ["Nothing: streams never buffer", "Rien : les flux ne mettent jamais en tampon", "Nada: los streams nunca usan búfer"]],
    e: [
      "`write` never refuses data; it queues it and signals with `false` that the consumer is behind. `await once(stream, \"drain\")` respects that. Simpler still: produce the rows with an async generator and hand it to `pipeline`, which handles backpressure.",
      "`write` ne refuse jamais de données ; il les met en file et signale par `false` que le consommateur est en retard. `await once(stream, \"drain\")` en tient compte. Plus simple encore : produire les lignes avec un générateur asynchrone et le passer à `pipeline`, qui gère la contre-pression.",
      "`write` nunca rechaza datos; los encola e indica con `false` que el consumidor va con retraso. `await once(stream, \"drain\")` lo respeta. Más sencillo aún: generar las filas con un generador asíncrono y pasárselo a `pipeline`, que gestiona la contrapresión.",
    ],
  },
  {
    id: "nd-async-12",
    q: ["Every log line must carry the current request's id, without passing it through every function. What does Node offer?", "Chaque ligne de journal doit porter l'identifiant de la requête en cours, sans le passer à chaque fonction. Que propose Node ?", "Cada línea de registro debe llevar el id de la petición actual, sin pasarlo por todas las funciones. ¿Qué ofrece Node?"],
    a: ["`AsyncLocalStorage` from `node:async_hooks`, whose store follows the request across `await` and callbacks", "`AsyncLocalStorage` de `node:async_hooks`, dont le stockage suit la requête à travers les `await` et les callbacks", "`AsyncLocalStorage` de `node:async_hooks`, cuyo almacén sigue a la petición a través de los `await` y los callbacks"],
    w: [["A global variable set at the start of each request", "Une variable globale définie au début de chaque requête", "Una variable global fijada al principio de cada petición"], ["`process.env.REQUEST_ID`", "`process.env.REQUEST_ID`", "`process.env.REQUEST_ID`"], ["Thread-local storage, one thread per request", "Un stockage local au fil, un fil par requête", "Almacenamiento local por hilo, un hilo por petición"]],
    e: [
      "A global would be overwritten as soon as two requests interleave on the one thread. `als.run(store, handler)` gives each request its own store, read with `als.getStore()` anywhere below. Tracing tools such as OpenTelemetry rely on it.",
      "Une variable globale serait écrasée dès que deux requêtes s'entrelacent sur l'unique fil. `als.run(store, handler)` donne à chaque requête son propre stockage, lu avec `als.getStore()` n'importe où en dessous. Les outils de traçage comme OpenTelemetry reposent dessus.",
      "Una variable global se sobrescribiría en cuanto dos peticiones se intercalan en el único hilo. `als.run(store, handler)` da a cada petición su propio almacén, que se lee con `als.getStore()` en cualquier punto por debajo. Herramientas de trazas como OpenTelemetry se apoyan en ello.",
    ],
  },
];

const apisAdvanced: NodeQuestion[] = [
  {
    id: "nd-apis-09",
    q: ["`node server.ts` runs on Node 24 without a build step. What are the limits?", "`node server.ts` tourne sur Node 24 sans étape de build. Quelles sont les limites ?", "`node server.ts` corre en Node 24 sin paso de build. ¿Cuáles son los límites?"],
    a: ["Node only strips type annotations: no type checking, no `tsconfig`, and syntax that generates code, such as `enum`, needs a flag", "Node retire seulement les annotations de type : pas de vérification de types, pas de `tsconfig`, et une syntaxe qui génère du code, comme `enum`, demande une option", "Node solo quita las anotaciones de tipo: no comprueba tipos, no lee `tsconfig`, y la sintaxis que genera código, como `enum`, necesita una opción"],
    w: [["None: Node includes the full TypeScript compiler", "Aucune : Node inclut le compilateur TypeScript complet", "Ninguno: Node incluye el compilador completo de TypeScript"], ["It works only for files under 1,000 lines", "Cela ne marche que pour les fichiers de moins de 1 000 lignes", "Solo funciona con archivos de menos de 1.000 líneas"], ["It type-checks but cannot import other `.ts` files", "Il vérifie les types mais ne peut pas importer d'autres fichiers `.ts`", "Comprueba tipos pero no puede importar otros archivos `.ts`"]],
    e: [
      "Type stripping replaces types with spaces and runs the rest; it is on by default since Node 23.6 and 22.18 and stable in Node 24. Run `tsc --noEmit` in CI for checking. Write imports with `.ts`, use `import type`, and turn on `erasableSyntaxOnly` in TypeScript to stay within what Node accepts.",
      "Le retrait des types remplace les types par des espaces et exécute le reste ; il est actif par défaut depuis Node 23.6 et 22.18, et stable dans Node 24. Lancez `tsc --noEmit` en CI pour la vérification. Écrivez les imports avec `.ts`, utilisez `import type`, et activez `erasableSyntaxOnly` dans TypeScript pour rester dans ce que Node accepte.",
      "La eliminación de tipos sustituye los tipos por espacios y ejecuta el resto; está activa por defecto desde Node 23.6 y 22.18 y es estable en Node 24. Ejecuta `tsc --noEmit` en la CI para comprobar los tipos. Escribe los imports con `.ts`, usa `import type` y activa `erasableSyntaxOnly` en TypeScript para quedarte en lo que Node acepta.",
    ],
  },
  {
    id: "nd-apis-10",
    q: ["A small CLI needs `--port 8080 --verbose`. What does Node provide?", "Un petit outil en ligne de commande a besoin de `--port 8080 --verbose`. Que fournit Node ?", "Una pequeña herramienta de línea de comandos necesita `--port 8080 --verbose`. ¿Qué ofrece Node?"],
    a: ["`parseArgs` from `node:util`, which parses `process.argv` against declared options", "`parseArgs` de `node:util`, qui analyse `process.argv` d'après des options déclarées", "`parseArgs` de `node:util`, que analiza `process.argv` según opciones declaradas"],
    w: [["Nothing: a package such as yargs is required", "Rien : un paquet comme yargs est obligatoire", "Nada: hace falta un paquete como yargs"], ["`process.flags`, filled automatically", "`process.flags`, rempli automatiquement", "`process.flags`, que se rellena solo"], ["`process.env.ARGS`", "`process.env.ARGS`", "`process.env.ARGS`"]],
    e: [
      "`parseArgs({ options: { port: { type: \"string\" }, verbose: { type: \"boolean\" } } })` returns `values` and `positionals`, and throws on unknown options by default. Larger CLIs still benefit from help generation and subcommands in libraries.",
      "`parseArgs({ options: { port: { type: \"string\" }, verbose: { type: \"boolean\" } } })` renvoie `values` et `positionals`, et lève une erreur sur les options inconnues par défaut. Les outils plus gros gagnent encore à la génération d'aide et aux sous-commandes des bibliothèques.",
      "`parseArgs({ options: { port: { type: \"string\" }, verbose: { type: \"boolean\" } } })` devuelve `values` y `positionals`, y lanza un error con opciones desconocidas por defecto. Las herramientas más grandes siguen beneficiándose de la ayuda generada y los subcomandos de las bibliotecas.",
    ],
  },
  {
    id: "nd-apis-11",
    q: ["Why is `exec(\"convert \" + userFile + \" out.png\")` dangerous, and what is safer?", "Pourquoi `exec(\"convert \" + userFile + \" out.png\")` est-il dangereux, et qu'est-ce qui est plus sûr ?", "¿Por qué es peligroso `exec(\"convert \" + userFile + \" out.png\")` y qué es más seguro?"],
    a: ["`exec` runs a shell, so a name like `a; rm -rf ~` injects commands; `execFile(\"convert\", [userFile, \"out.png\"])` passes arguments without a shell", "`exec` lance un shell : un nom comme `a; rm -rf ~` injecte des commandes ; `execFile(\"convert\", [userFile, \"out.png\"])` passe les arguments sans shell", "`exec` lanza una shell, así que un nombre como `a; rm -rf ~` inyecta comandos; `execFile(\"convert\", [userFile, \"out.png\"])` pasa los argumentos sin shell"],
    w: [["It is slow; `execSync` is safer", "C'est lent ; `execSync` est plus sûr", "Es lento; `execSync` es más seguro"], ["It is fine if the string is trimmed", "Cela va si la chaîne est nettoyée des espaces", "No pasa nada si se recortan los espacios"], ["`exec` cannot run external programs", "`exec` ne peut pas lancer de programmes externes", "`exec` no puede ejecutar programas externos"]],
    e: [
      "With `execFile` or `spawn` and an argument array, the program receives the name as one argument, whatever characters it holds. Still validate inputs, and beware of arguments starting with `-` that the program may read as options.",
      "Avec `execFile` ou `spawn` et un tableau d'arguments, le programme reçoit le nom comme un seul argument, quels que soient ses caractères. Validez quand même les entrées, et méfiez-vous des arguments commençant par `-` que le programme peut lire comme des options.",
      "Con `execFile` o `spawn` y un array de argumentos, el programa recibe el nombre como un solo argumento, tenga los caracteres que tenga. Aun así valida las entradas y desconfía de argumentos que empiezan por `-` que el programa puede leer como opciones.",
    ],
  },
  {
    id: "nd-apis-12",
    q: ["A webhook handler compares the received signature with the expected one. Which comparison should it use?", "Un gestionnaire de webhook compare la signature reçue à celle attendue. Quelle comparaison doit-il utiliser ?", "Un manejador de webhook compara la firma recibida con la esperada. ¿Qué comparación debe usar?"],
    a: ["`timingSafeEqual` from `node:crypto`, on two buffers of the same length", "`timingSafeEqual` de `node:crypto`, sur deux buffers de même longueur", "`timingSafeEqual` de `node:crypto`, sobre dos buffers de la misma longitud"],
    w: [["`===`, which is exact", "`===`, qui est exact", "`===`, que es exacto"], ["`received.includes(expected)`", "`received.includes(expected)`", "`received.includes(expected)`"], ["`localeCompare`, to ignore case", "`localeCompare`, pour ignorer la casse", "`localeCompare`, para ignorar mayúsculas"]],
    e: [
      "`===` stops at the first differing character, and that timing difference can leak the signature byte by byte. `timingSafeEqual` takes the same time whatever the content; check the lengths first, as it throws when they differ.",
      "`===` s'arrête au premier caractère différent, et cette différence de temps peut révéler la signature octet par octet. `timingSafeEqual` prend le même temps quel que soit le contenu ; vérifiez d'abord les longueurs, car il lève une erreur quand elles diffèrent.",
      "`===` se detiene en el primer carácter distinto, y esa diferencia de tiempo puede revelar la firma byte a byte. `timingSafeEqual` tarda lo mismo sea cual sea el contenido; comprueba antes las longitudes, porque lanza un error si difieren.",
    ],
  },
];

const packagesAdvanced: NodeQuestion[] = [
  {
    id: "nd-packages-09",
    q: ["How does a package provide a command, so that users can run `mytool` after installing it?", "Comment un paquet fournit-il une commande, pour qu'on puisse lancer `mytool` après l'avoir installé ?", "¿Cómo ofrece un paquete un comando, para que se pueda ejecutar `mytool` tras instalarlo?"],
    a: ["With `\"bin\": { \"mytool\": \"./cli.js\" }` and a first line `#!/usr/bin/env node` in that file", "Avec `\"bin\": { \"mytool\": \"./cli.js\" }` et une première ligne `#!/usr/bin/env node` dans ce fichier", "Con `\"bin\": { \"mytool\": \"./cli.js\" }` y una primera línea `#!/usr/bin/env node` en ese archivo"],
    w: [["With a `\"main\"` field named `mytool`", "Avec un champ `\"main\"` nommé `mytool`", "Con un campo `\"main\"` llamado `mytool`"], ["With a `postinstall` script that edits the user's `PATH`", "Avec un script `postinstall` qui modifie le `PATH` de l'utilisateur", "Con un script `postinstall` que edita el `PATH` del usuario"], ["Only by publishing a separate binary", "Seulement en publiant un binaire séparé", "Solo publicando un binario aparte"]],
    e: [
      "npm links each `bin` entry into `node_modules/.bin` (or the global bin folder with `-g`) and, on Windows, writes a wrapper. The shebang tells Unix systems to run the file with Node. `npx mytool` then works too.",
      "npm lie chaque entrée de `bin` dans `node_modules/.bin` (ou le dossier bin global avec `-g`) et, sous Windows, écrit un lanceur. Le shebang dit aux systèmes Unix d'exécuter le fichier avec Node. `npx mytool` marche alors aussi.",
      "npm enlaza cada entrada de `bin` en `node_modules/.bin` (o en la carpeta bin global con `-g`) y, en Windows, escribe un lanzador. El shebang indica a los sistemas Unix que ejecuten el archivo con Node. Entonces `npx mytool` también funciona.",
    ],
  },
  {
    id: "nd-packages-10",
    q: ["How do tools such as esbuild ship a native binary for each platform without downloading all of them?", "Comment des outils comme esbuild publient-ils un binaire natif par plateforme sans tous les télécharger ?", "¿Cómo publican herramientas como esbuild un binario nativo por plataforma sin descargarlos todos?"],
    a: ["One package per platform with `os` and `cpu` fields, listed in `optionalDependencies`; npm installs only the one that matches", "Un paquet par plateforme avec des champs `os` et `cpu`, listés dans `optionalDependencies` ; npm n'installe que celui qui correspond", "Un paquete por plataforma con campos `os` y `cpu`, listados en `optionalDependencies`; npm instala solo el que coincide"],
    w: [["A `postinstall` script that compiles from source every time", "Un script `postinstall` qui compile depuis les sources à chaque fois", "Un script `postinstall` que compila desde el código fuente cada vez"], ["One package containing every binary", "Un seul paquet contenant tous les binaires", "Un solo paquete con todos los binarios"], ["They ask the user to download the right binary by hand", "Ils demandent à l'utilisateur de télécharger le bon binaire à la main", "Piden al usuario que descargue el binario correcto a mano"]],
    e: [
      "Optional dependencies whose `os` or `cpu` do not match are skipped without error. This avoids install scripts, which matters as more teams disable them. A lockfile made on macOS still records the Linux packages, so CI gets its binary.",
      "Les dépendances optionnelles dont `os` ou `cpu` ne correspondent pas sont sautées sans erreur. Cela évite les scripts d'installation, ce qui compte à mesure que les équipes les désactivent. Un lockfile fait sous macOS note quand même les paquets Linux : la CI obtient son binaire.",
      "Las dependencias opcionales cuyo `os` o `cpu` no coinciden se omiten sin error. Así se evitan los scripts de instalación, lo que importa ahora que cada vez más equipos los desactivan. Un lockfile hecho en macOS registra igualmente los paquetes de Linux, así que la CI obtiene su binario.",
    ],
  },
  {
    id: "nd-packages-11",
    q: ["`node_modules` contains `ms`, which you never installed. How do you find out why it is there?", "`node_modules` contient `ms`, que vous n'avez jamais installé. Comment savoir pourquoi il est là ?", "`node_modules` contiene `ms`, que nunca instalaste. ¿Cómo averiguas por qué está ahí?"],
    a: ["`npm explain ms`, which prints the chain of packages that depend on it", "`npm explain ms`, qui affiche la chaîne de paquets qui en dépendent", "`npm explain ms`, que muestra la cadena de paquetes que dependen de él"],
    w: [["`npm info ms`", "`npm info ms`", "`npm info ms`"], ["`npm audit ms`", "`npm audit ms`", "`npm audit ms`"], ["Open `package.json`, where every package is listed", "Ouvrir `package.json`, où chaque paquet est listé", "Abrir `package.json`, donde están todos los paquetes"]],
    e: [
      "`npm explain` (alias `why`) and `npm ls ms --all` show the paths through the tree. That tells you which direct dependency to upgrade to fix or remove a transitive one. `npm info` describes the package on the registry instead.",
      "`npm explain` (alias `why`) et `npm ls ms --all` montrent les chemins dans l'arbre. On sait alors quelle dépendance directe mettre à jour pour corriger ou retirer une dépendance transitive. `npm info`, lui, décrit le paquet sur le registre.",
      "`npm explain` (alias `why`) y `npm ls ms --all` muestran los caminos en el árbol. Así sabes qué dependencia directa actualizar para corregir o quitar una transitiva. `npm info`, en cambio, describe el paquete en el registro.",
    ],
  },
  {
    id: "nd-packages-12",
    q: ["`\"^1.2.0\"` is in `package.json`, and 1.3.0-beta.1 is the newest version. Will it be installed?", "`\"^1.2.0\"` est dans `package.json`, et 1.3.0-beta.1 est la version la plus récente. Sera-t-elle installée ?", "`\"^1.2.0\"` está en `package.json` y 1.3.0-beta.1 es la versión más reciente. ¿Se instalará?"],
    a: ["No: a range matches prereleases only when it names one on the same major.minor.patch", "Non : une plage ne correspond à des préversions que si elle en nomme une sur le même majeure.mineure.correctif", "No: un rango solo encaja con preversiones si nombra una en el mismo mayor.menor.parche"],
    w: [["Yes: 1.3.0-beta.1 is above 1.2.0", "Oui : 1.3.0-beta.1 est au-dessus de 1.2.0", "Sí: 1.3.0-beta.1 está por encima de 1.2.0"], ["Yes, if it was published under `latest`", "Oui, si elle a été publiée sous `latest`", "Sí, si se publicó con `latest`"], ["Only on Tuesdays, when npm resolves betas", "Seulement le mardi, quand npm résout les bêtas", "Solo los martes, cuando npm resuelve las betas"]],
    e: [
      "Semver keeps prereleases out of ordinary ranges so that users do not get betas by accident. `^1.3.0-beta.0` would accept later 1.3.0 betas and the final 1.3.x. Testers opt in with `npm install pkg@next`.",
      "Le semver tient les préversions hors des plages ordinaires pour que les utilisateurs ne reçoivent pas de bêtas par accident. `^1.3.0-beta.0` accepterait les bêtas suivantes de 1.3.0 et les 1.3.x finales. Les testeurs choisissent avec `npm install pkg@next`.",
      "Semver deja las preversiones fuera de los rangos normales para que nadie reciba betas por accidente. `^1.3.0-beta.0` aceptaría las betas siguientes de 1.3.0 y las 1.3.x finales. Quien prueba lo elige con `npm install pkg@next`.",
    ],
  },
];

const depsAdvanced: NodeQuestion[] = [
  {
    id: "nd-deps-09",
    q: ["Code imports `debug`, which is not in its `package.json`, and it works with npm. Why, and why is it a problem?", "Du code importe `debug`, absent de son `package.json`, et cela marche avec npm. Pourquoi, et pourquoi est-ce un problème ?", "Un código importa `debug`, que no está en su `package.json`, y funciona con npm. ¿Por qué, y por qué es un problema?"],
    a: ["npm hoists transitive dependencies to the top of `node_modules`; a phantom dependency breaks when the package that brought it changes", "npm remonte les dépendances transitives en haut de `node_modules` ; une dépendance fantôme casse quand le paquet qui l'apportait change", "npm sube las dependencias transitivas a la raíz de `node_modules`; una dependencia fantasma se rompe cuando cambia el paquete que la traía"],
    w: [["Node includes `debug` as a built-in module", "Node inclut `debug` comme module intégré", "Node incluye `debug` como módulo integrado"], ["npm adds every imported package to `package.json` silently", "npm ajoute en silence chaque paquet importé à `package.json`", "npm añade en silencio cada paquete importado a `package.json`"], ["It is not a problem: hoisting is guaranteed", "Ce n'est pas un problème : la remontée est garantie", "No es un problema: la subida está garantizada"]],
    e: [
      "The flat layout makes undeclared packages reachable. pnpm's default layout exposes only declared dependencies at the top, so such imports fail early. A lint rule such as `import/no-extraneous-dependencies` catches them with npm.",
      "La disposition à plat rend accessibles des paquets non déclarés. La disposition par défaut de pnpm n'expose en haut que les dépendances déclarées : ces imports échouent tôt. Une règle de lint comme `import/no-extraneous-dependencies` les attrape avec npm.",
      "La disposición plana deja accesibles paquetes no declarados. La disposición por defecto de pnpm solo expone arriba las dependencias declaradas, así que esos imports fallan pronto. Una regla de lint como `import/no-extraneous-dependencies` los detecta con npm.",
    ],
  },
  {
    id: "nd-deps-10",
    q: ["Two branches each added a dependency, and `package-lock.json` has a merge conflict. What is the usual fix?", "Deux branches ont chacune ajouté une dépendance, et `package-lock.json` est en conflit de fusion. Quelle est la correction habituelle ?", "Dos ramas añadieron cada una una dependencia y `package-lock.json` tiene un conflicto de fusión. ¿Cuál es la solución habitual?"],
    a: ["Resolve `package.json` by hand, then run `npm install`, which rebuilds a consistent lockfile, and commit it", "Résoudre `package.json` à la main, puis lancer `npm install`, qui reconstruit un lockfile cohérent, et le commiter", "Resolver `package.json` a mano, luego ejecutar `npm install`, que reconstruye un lockfile coherente, y hacer commit"],
    w: [["Edit the lockfile's conflict markers by hand, line by line", "Corriger à la main les marqueurs de conflit du lockfile, ligne par ligne", "Editar a mano los marcadores de conflicto del lockfile, línea a línea"], ["Delete the lockfile for good", "Supprimer le lockfile pour de bon", "Borrar el lockfile para siempre"], ["Keep either side: the lockfile is not used", "Garder l'un ou l'autre côté : le lockfile ne sert pas", "Quedarse con cualquiera de los lados: el lockfile no se usa"]],
    e: [
      "npm can read a lockfile with conflict markers and resolve it against `package.json`. Deleting it and reinstalling also works, but re-resolves every range and may upgrade unrelated packages; avoid that in a merge.",
      "npm sait lire un lockfile avec des marqueurs de conflit et le résoudre d'après `package.json`. Le supprimer et réinstaller marche aussi, mais résout à nouveau toutes les plages et peut mettre à jour des paquets sans rapport : à éviter lors d'une fusion.",
      "npm sabe leer un lockfile con marcadores de conflicto y resolverlo según `package.json`. Borrarlo y reinstalar también funciona, pero vuelve a resolver todos los rangos y puede actualizar paquetes que no tienen nada que ver: mejor evitarlo en una fusión.",
    ],
  },
  {
    id: "nd-deps-11",
    q: ["Why does pnpm use far less disk than npm across ten projects with similar dependencies?", "Pourquoi pnpm utilise-t-il bien moins de disque que npm sur dix projets aux dépendances semblables ?", "¿Por qué pnpm usa mucho menos disco que npm en diez proyectos con dependencias parecidas?"],
    a: ["Files live once in a content-addressable store and are hard-linked into each project", "Les fichiers vivent une seule fois dans un stockage adressé par contenu et sont liés en dur dans chaque projet", "Los archivos están una sola vez en un almacén direccionado por contenido y se enlazan con enlaces duros en cada proyecto"],
    w: [["It compresses `node_modules` with gzip", "Il compresse `node_modules` avec gzip", "Comprime `node_modules` con gzip"], ["It installs only the packages that are imported", "Il n'installe que les paquets importés", "Solo instala los paquetes que se importan"], ["It downloads packages at run time instead", "Il télécharge plutôt les paquets à l'exécution", "Descarga los paquetes en tiempo de ejecución"]],
    e: [
      "Each file version is stored once by its hash; projects link to it. Installs are faster too, since most files are already there. Bun uses a similar global cache; Yarn Plug'n'Play goes further and drops `node_modules` altogether.",
      "Chaque version de fichier est stockée une fois sous son empreinte ; les projets y pointent par des liens. Les installations sont aussi plus rapides, car la plupart des fichiers sont déjà là. Bun utilise un cache global semblable ; le Plug'n'Play de Yarn va plus loin et supprime tout `node_modules`.",
      "Cada versión de archivo se guarda una vez según su hash; los proyectos enlazan a ella. Las instalaciones también son más rápidas, porque la mayoría de los archivos ya están. Bun usa una caché global parecida; el Plug'n'Play de Yarn va más allá y elimina `node_modules` del todo.",
    ],
  },
  {
    id: "nd-deps-12",
    q: ["A project declares `\"packageManager\": \"pnpm@10.18.0\"`. What reads that field, and what changed with Node 25?", "Un projet déclare `\"packageManager\": \"pnpm@10.18.0\"`. Qu'est-ce qui lit ce champ, et qu'a changé Node 25 ?", "Un proyecto declara `\"packageManager\": \"pnpm@10.18.0\"`. ¿Qué lee ese campo y qué cambió con Node 25?"],
    a: ["Corepack, which fetches that exact pnpm; Node 25 and later no longer ship Corepack, so it is installed separately", "Corepack, qui récupère exactement ce pnpm ; Node 25 et plus ne livrent plus Corepack, il s'installe donc à part", "Corepack, que obtiene exactamente ese pnpm; Node 25 y posteriores ya no incluyen Corepack, así que se instala aparte"],
    w: [["npm, which refuses to run in that project", "npm, qui refuse de tourner dans ce projet", "npm, que se niega a funcionar en ese proyecto"], ["Node itself, which bundles every package manager since 25", "Node lui-même, qui intègre tous les gestionnaires de paquets depuis 25", "Node mismo, que incluye todos los gestores de paquetes desde la 25"], ["Nothing: the field is only for humans", "Rien : le champ n'est que pour les humains", "Nada: el campo es solo para personas"]],
    e: [
      "The field pins the package manager per project, like the lockfile pins packages. Corepack shipped experimentally with Node 16 to 24; the project decided to stop distributing it from Node 25. `npm install -g corepack` brings it back; pnpm and Yarn also read the field themselves.",
      "Le champ fige le gestionnaire de paquets par projet, comme le lockfile fige les paquets. Corepack était livré à titre expérimental avec Node 16 à 24 ; le projet a décidé de ne plus le distribuer à partir de Node 25. `npm install -g corepack` le ramène ; pnpm et Yarn lisent aussi le champ eux-mêmes.",
      "El campo fija el gestor de paquetes por proyecto, como el lockfile fija los paquetes. Corepack venía de forma experimental con Node 16 a 24; el proyecto decidió dejar de distribuirlo desde Node 25. `npm install -g corepack` lo trae de vuelta; pnpm y Yarn también leen el campo por sí mismos.",
    ],
  },
];

const publishAdvanced: NodeQuestion[] = [
  {
    id: "nd-publish-09",
    q: ["How can a GitHub Actions workflow publish to npm without any stored npm token?", "Comment un workflow GitHub Actions peut-il publier sur npm sans aucun jeton npm stocké ?", "¿Cómo puede un workflow de GitHub Actions publicar en npm sin ningún token de npm guardado?"],
    a: ["Trusted publishing: the package trusts that repository and workflow on npmjs.com, and the job gets a short-lived credential by OIDC with `id-token: write`", "La publication de confiance : le paquet fait confiance à ce dépôt et à ce workflow sur npmjs.com, et le job obtient un identifiant éphémère par OIDC avec `id-token: write`", "La publicación de confianza: el paquete confía en ese repositorio y ese workflow en npmjs.com, y el job obtiene una credencial efímera por OIDC con `id-token: write`"],
    w: [["It cannot: CI always needs an `NPM_TOKEN` secret", "C'est impossible : la CI a toujours besoin d'un secret `NPM_TOKEN`", "No puede: la CI siempre necesita un secreto `NPM_TOKEN`"], ["By logging in with the maintainer's password in the workflow", "En se connectant avec le mot de passe du mainteneur dans le workflow", "Iniciando sesión con la contraseña del mantenedor en el workflow"], ["By publishing a GitHub release, which npm copies", "En publiant une release GitHub, que npm copie", "Publicando una release de GitHub, que npm copia"]],
    e: [
      "Generally available since mid-2025 for GitHub Actions and GitLab CI, it needs npm 11.5.1 or later. Nothing long-lived can leak, and provenance is generated automatically. Then forbid token publishing in the package settings.",
      "Disponible pour tous depuis mi-2025 pour GitHub Actions et GitLab CI, elle demande npm 11.5.1 ou plus. Rien de durable ne peut fuir, et la provenance est générée automatiquement. Interdisez ensuite la publication par jeton dans les réglages du paquet.",
      "Disponible para todos desde mediados de 2025 en GitHub Actions y GitLab CI, necesita npm 11.5.1 o posterior. No hay nada duradero que pueda filtrarse y la procedencia se genera automáticamente. Después, prohíbe publicar con token en los ajustes del paquete.",
    ],
  },
  {
    id: "nd-publish-10",
    q: ["What does npm provenance on a published version prove?", "Que prouve la provenance npm d'une version publiée ?", "¿Qué demuestra la procedencia de npm de una versión publicada?"],
    a: ["Which repository, commit and CI workflow built the package, signed and recorded in a public transparency log", "Quel dépôt, quel commit et quel workflow de CI ont construit le paquet, signé et inscrit dans un journal de transparence public", "Qué repositorio, commit y workflow de CI construyeron el paquete, firmado y registrado en un registro público de transparencia"],
    w: [["That the code has no vulnerabilities", "Que le code n'a pas de vulnérabilités", "Que el código no tiene vulnerabilidades"], ["That npm staff reviewed the package", "Que l'équipe de npm a relu le paquet", "Que el equipo de npm revisó el paquete"], ["That the author's identity was checked with a passport", "Que l'identité de l'auteur a été vérifiée avec un passeport", "Que se comprobó la identidad del autor con un pasaporte"]],
    e: [
      "Provenance links the tarball to its source and build, using Sigstore. `npm audit signatures` verifies it for installed packages. It shows where code came from, not that it is benign: a compromised workflow still produces valid provenance.",
      "La provenance relie l'archive à son source et à son build, avec Sigstore. `npm audit signatures` la vérifie pour les paquets installés. Elle montre d'où vient le code, pas qu'il est inoffensif : un workflow compromis produit encore une provenance valide.",
      "La procedencia vincula el archivo comprimido con su código fuente y su build, mediante Sigstore. `npm audit signatures` la verifica para los paquetes instalados. Muestra de dónde viene el código, no que sea inofensivo: un workflow comprometido sigue produciendo procedencia válida.",
    ],
  },
  {
    id: "nd-publish-11",
    q: ["Version 4.1.0 of your package, with thousands of dependents, has a serious bug. What do you do?", "La version 4.1.0 de votre paquet, avec des milliers de dépendants, a un bug grave. Que faites-vous ?", "La versión 4.1.0 de tu paquete, con miles de dependientes, tiene un error grave. ¿Qué haces?"],
    a: ["Publish 4.1.1 with the fix and run `npm deprecate` on 4.1.0 with a message; unpublishing is not allowed once others depend on it", "Publier 4.1.1 avec la correction et lancer `npm deprecate` sur 4.1.0 avec un message ; dépublier n'est pas permis dès que d'autres en dépendent", "Publicar 4.1.1 con la corrección y ejecutar `npm deprecate` sobre 4.1.0 con un mensaje; despublicar no está permitido cuando otros dependen de ella"],
    w: [["`npm unpublish pkg@4.1.0`, then republish 4.1.0 fixed", "`npm unpublish pkg@4.1.0`, puis republier 4.1.0 corrigée", "`npm unpublish pkg@4.1.0` y luego volver a publicar 4.1.0 corregida"], ["Delete the package and start under a new name", "Supprimer le paquet et repartir sous un nouveau nom", "Borrar el paquete y empezar con otro nombre"], ["Nothing: the lockfiles of users protect them", "Rien : les lockfiles des utilisateurs les protègent", "Nada: los lockfiles de los usuarios los protegen"]],
    e: [
      "Unpublishing is limited to young or barely used packages since the left-pad incident of 2016 broke builds everywhere. A deprecation shows a warning on install; moving `latest` back with `npm dist-tag` also helps until the fix is out.",
      "La dépublication est limitée aux paquets récents ou peu utilisés depuis que l'incident left-pad de 2016 a cassé des builds partout. Une dépréciation affiche un avertissement à l'installation ; ramener `latest` en arrière avec `npm dist-tag` aide aussi en attendant la correction.",
      "Despublicar está limitado a paquetes recientes o poco usados desde que el incidente de left-pad de 2016 rompió builds por todas partes. Una deprecación muestra un aviso al instalar; devolver `latest` atrás con `npm dist-tag` también ayuda hasta que salga la corrección.",
    ],
  },
  {
    id: "nd-publish-12",
    q: ["A library drops support for Node 20 by raising `engines` to `>=22`. What version change does semver call for?", "Une bibliothèque abandonne Node 20 en relevant `engines` à `>=22`. Quel changement de version le semver demande-t-il ?", "Una biblioteca deja de admitir Node 20 subiendo `engines` a `>=22`. ¿Qué cambio de versión pide semver?"],
    a: ["A major: users on Node 20 who update within their range would break", "Une majeure : les utilisateurs sur Node 20 qui mettent à jour dans leur plage seraient cassés", "Una mayor: los usuarios en Node 20 que actualicen dentro de su rango se romperían"],
    w: [["A patch: no code changed", "Un correctif : aucun code n'a changé", "Un parche: no cambió código"], ["A minor: it is a new requirement, not a removal", "Une mineure : c'est une nouvelle exigence, pas un retrait", "Una menor: es un requisito nuevo, no una eliminación"], ["None: `engines` changes need no version", "Aucun : les changements d'`engines` ne demandent pas de version", "Ninguno: los cambios en `engines` no necesitan versión"]],
    e: [
      "Semver protects users from breaking within a range. Dropping a runtime, changing `exports`, or making types stricter can all break someone, and count as breaking. Many libraries drop a Node line when it reaches end of life, in a major.",
      "Le semver protège les utilisateurs d'une casse dans une plage. Abandonner un runtime, changer `exports` ou durcir les types peut casser quelqu'un, et compte comme cassant. Beaucoup de bibliothèques abandonnent une ligne de Node à sa fin de vie, dans une majeure.",
      "Semver protege a los usuarios de roturas dentro de un rango. Dejar un runtime, cambiar `exports` o endurecer los tipos puede romper a alguien, y cuenta como incompatible. Muchas bibliotecas dejan una línea de Node cuando llega a su fin de vida, en una mayor.",
    ],
  },
];

const securityAdvanced: NodeQuestion[] = [
  {
    id: "nd-security-09",
    q: ["How did the Shai-Hulud worm of 2025 spread through npm?", "Comment le ver Shai-Hulud de 2025 s'est-il propagé sur npm ?", "¿Cómo se propagó el gusano Shai-Hulud de 2025 por npm?"],
    a: ["Install scripts in compromised packages stole maintainers' npm and GitHub credentials, then published infected versions of their other packages", "Des scripts d'installation dans des paquets compromis volaient les identifiants npm et GitHub des mainteneurs, puis publiaient des versions infectées de leurs autres paquets", "Scripts de instalación en paquetes comprometidos robaban las credenciales de npm y GitHub de los mantenedores y luego publicaban versiones infectadas de sus otros paquetes"],
    w: [["Through a bug in Node's HTTP server", "Par un bug du serveur HTTP de Node", "Por un error del servidor HTTP de Node"], ["Through emails sent by the npm registry", "Par des e-mails envoyés par le registre npm", "Por correos enviados por el registro de npm"], ["Only through packages with typos in their names", "Seulement par des paquets aux noms mal orthographiés", "Solo por paquetes con nombres mal escritos"]],
    e: [
      "It was self-replicating: each stolen token let it infect more packages, hundreds in days, with a second wave in November. The response: revoking classic tokens, short sessions, trusted publishing, and on the user side disabling install scripts and delaying new versions.",
      "Il se répliquait seul : chaque jeton volé lui permettait d'infecter d'autres paquets, des centaines en quelques jours, avec une seconde vague en novembre. La réponse : révocation des jetons classiques, sessions courtes, publication de confiance, et côté utilisateurs, désactivation des scripts d'installation et délai avant d'adopter une nouvelle version.",
      "Se replicaba solo: cada token robado le permitía infectar más paquetes, cientos en pocos días, con una segunda ola en noviembre. La respuesta: revocar los tokens clásicos, sesiones cortas, publicación de confianza y, del lado de los usuarios, desactivar los scripts de instalación y esperar antes de adoptar versiones nuevas.",
    ],
  },
  {
    id: "nd-security-10",
    q: ["What does `min-release-age=3` in `.npmrc` do (npm 11.10 and later)?", "Que fait `min-release-age=3` dans `.npmrc` (npm 11.10 et plus) ?", "¿Qué hace `min-release-age=3` en `.npmrc` (npm 11.10 y posteriores)?"],
    a: ["npm ignores versions published less than three days ago when it resolves ranges", "npm ignore les versions publiées il y a moins de trois jours quand il résout les plages", "npm ignora las versiones publicadas hace menos de tres días al resolver los rangos"],
    w: [["It deletes packages older than three days from the cache", "Il supprime du cache les paquets de plus de trois jours", "Borra de la caché los paquetes de más de tres días"], ["It installs only packages with at least three maintainers", "Il n'installe que des paquets ayant au moins trois mainteneurs", "Solo instala paquetes con al menos tres mantenedores"], ["It runs `npm audit` every three days", "Il lance `npm audit` tous les trois jours", "Ejecuta `npm audit` cada tres días"]],
    e: [
      "Most malicious versions are found and removed within hours or days. A cooldown means you rarely install one. pnpm 11 sets `minimumReleaseAge` to one day by default, and Yarn has `npmMinimalAgeGate`; urgent security fixes can be allowed explicitly.",
      "La plupart des versions malveillantes sont trouvées et retirées en quelques heures ou jours. Un délai de carence fait qu'on en installe rarement une. pnpm 11 règle `minimumReleaseAge` à un jour par défaut, et Yarn a `npmMinimalAgeGate` ; les correctifs de sécurité urgents peuvent être permis explicitement.",
      "La mayoría de las versiones maliciosas se detectan y retiran en horas o días. Con un periodo de espera, rara vez instalas una. pnpm 11 fija `minimumReleaseAge` en un día por defecto, y Yarn tiene `npmMinimalAgeGate`; las correcciones de seguridad urgentes pueden permitirse explícitamente.",
    ],
  },
  {
    id: "nd-security-11",
    q: ["`node --permission --allow-fs-read=./data app.js`: what does it do, and what is its limit?", "`node --permission --allow-fs-read=./data app.js` : que fait-il, et quelle est sa limite ?", "`node --permission --allow-fs-read=./data app.js`: ¿qué hace y cuál es su límite?"],
    a: ["It denies file writes, child processes, workers and other reads outside `./data`; it guards against mistakes, not against deliberately malicious code", "Il refuse les écritures de fichiers, les processus enfants, les workers et les autres lectures hors de `./data` ; il protège des erreurs, pas d'un code délibérément malveillant", "Deniega escrituras de archivos, procesos hijos, workers y otras lecturas fuera de `./data`; protege de errores, no de código deliberadamente malicioso"],
    w: [["It encrypts the files in `./data`", "Il chiffre les fichiers de `./data`", "Cifra los archivos de `./data`"], ["It is a full sandbox, safe for running untrusted code", "C'est un bac à sable complet, sûr pour exécuter du code non fiable", "Es un entorno aislado completo, seguro para ejecutar código no fiable"], ["It limits network access only", "Il limite seulement l'accès réseau", "Solo limita el acceso a la red"]],
    e: [
      "The permission model restricts what the process may do; `process.permission.has()` checks at run time. Node's documentation calls it a seat belt: native addons and some paths escape it. For untrusted code, use OS isolation: containers, separate users, gVisor.",
      "Le modèle de permissions restreint ce que le processus peut faire ; `process.permission.has()` vérifie à l'exécution. La documentation de Node le présente comme une ceinture de sécurité : les modules natifs et certains chemins y échappent. Pour du code non fiable, isolez au niveau du système : conteneurs, utilisateurs séparés, gVisor.",
      "El modelo de permisos restringe lo que el proceso puede hacer; `process.permission.has()` lo comprueba en ejecución. La documentación de Node lo presenta como un cinturón de seguridad: los módulos nativos y algunas rutas se le escapan. Para código no fiable, aísla en el sistema: contenedores, usuarios separados, gVisor.",
    ],
  },
  {
    id: "nd-security-12",
    q: ["After `pnpm install`, pnpm 10 reports that `esbuild` has an ignored build script. Why, and what do you do?", "Après `pnpm install`, pnpm 10 signale que `esbuild` a un script de build ignoré. Pourquoi, et que faites-vous ?", "Tras `pnpm install`, pnpm 10 avisa de que `esbuild` tiene un script de build ignorado. ¿Por qué y qué haces?"],
    a: ["pnpm 10 runs no dependency lifecycle scripts by default; approve the trusted ones with `pnpm approve-builds`, which records them in the project", "pnpm 10 n'exécute par défaut aucun script de cycle de vie des dépendances ; approuvez ceux de confiance avec `pnpm approve-builds`, qui les inscrit dans le projet", "pnpm 10 no ejecuta por defecto ningún script de ciclo de vida de las dependencias; aprueba los de confianza con `pnpm approve-builds`, que los registra en el proyecto"],
    w: [["The package is broken; replace it", "Le paquet est cassé ; remplacez-le", "El paquete está roto; sustitúyelo"], ["Run pnpm with `sudo`", "Lancer pnpm avec `sudo`", "Ejecutar pnpm con `sudo`"], ["Downgrade to pnpm 9, which is safer", "Revenir à pnpm 9, plus sûr", "Volver a pnpm 9, que es más seguro"]],
    e: [
      "The approved list lives in the project's configuration and is reviewed like code. A new dependency asking to run a script then stands out. With npm, the equivalent is `ignore-scripts=true` plus explicit rebuilds.",
      "La liste approuvée vit dans la configuration du projet et se relit comme du code. Une nouvelle dépendance qui demande à lancer un script se remarque alors. Avec npm, l'équivalent est `ignore-scripts=true` plus des reconstructions explicites.",
      "La lista aprobada está en la configuración del proyecto y se revisa como el código. Así destaca una dependencia nueva que pide ejecutar un script. Con npm, lo equivalente es `ignore-scripts=true` más recompilaciones explícitas.",
    ],
  },
];

export const runtime = { runtimeAdvanced };
export const modules = { modulesAdvanced };
export const async = { asyncAdvanced };
export const apis = { apisAdvanced };
export const packages = { packagesAdvanced };
export const deps = { depsAdvanced };
export const publish = { publishAdvanced };
export const security = { securityAdvanced };
