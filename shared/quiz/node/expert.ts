/**
 * Node.js and npm, Expert: the libuv thread pool, memory leaks, PID 1 in a
 * container, Node-API, `require(esm)` and top-level `await`, the module
 * cache, live bindings, customization hooks, `error` events, starved
 * loops, transferring buffers, late handlers, keep-alive behind a load
 * balancer, unconsumed bodies, `vm`, preloaded instrumentation, `types`
 * first, `sideEffects`, `--legacy-peer-deps`, type changes, dedupe and
 * reproducibility, private registries, Plug'n'Play, ESM-only packages,
 * `prepare`, bundled dependencies, dependency confusion, lockfile
 * injection, tokens in `.npmrc` and `pull_request_target`.
 * Code between backticks is the same in the three languages.
 */
import type { LinuxQuestion as NodeQuestion } from "../linux/types";

const runtimeExpert: NodeQuestion[] = [
  {
    id: "nd-runtime-13",
    q: ["A server hashes passwords with async `crypto.scrypt` and reads many files. Under load both slow down together, while network I/O stays fast. Why?", "Un serveur hache des mots de passe avec `crypto.scrypt` asynchrone et lit beaucoup de fichiers. Sous charge, les deux ralentissent ensemble, alors que le réseau reste rapide. Pourquoi ?", "Un servidor calcula hashes de contraseñas con `crypto.scrypt` asíncrono y lee muchos archivos. Con carga, los dos se frenan a la vez, mientras la red sigue rápida. ¿Por qué?"],
    a: ["Both run on libuv's thread pool, four threads by default (`UV_THREADPOOL_SIZE`); sockets do not use it", "Les deux tournent sur le pool de threads de libuv, quatre par défaut (`UV_THREADPOOL_SIZE`) ; les sockets ne l'utilisent pas", "Los dos corren en el pool de hilos de libuv, cuatro por defecto (`UV_THREADPOOL_SIZE`); los sockets no lo usan"],
    w: [["Async functions run on the main thread one after another", "Les fonctions async tournent l'une après l'autre sur le fil principal", "Las funciones async corren una tras otra en el hilo principal"], ["The disk and the CPU share one cable", "Le disque et le CPU partagent un câble", "El disco y la CPU comparten un cable"], ["Node limits each process to four open files", "Node limite chaque processus à quatre fichiers ouverts", "Node limita cada proceso a cuatro archivos abiertos"]],
    e: [
      "File system calls, `dns.lookup`, async crypto such as `scrypt` and `pbkdf2`, and zlib queue on the same small pool. Raising `UV_THREADPOOL_SIZE` (set before startup) helps up to the core count; moving hashing to worker threads or another service isolates it.",
      "Les appels au système de fichiers, `dns.lookup`, la crypto asynchrone comme `scrypt` et `pbkdf2`, et zlib font la queue sur le même petit pool. Relever `UV_THREADPOOL_SIZE` (fixé avant le démarrage) aide jusqu'au nombre de cœurs ; déplacer le hachage dans des worker threads ou un autre service l'isole.",
      "Las llamadas al sistema de archivos, `dns.lookup`, la criptografía asíncrona como `scrypt` y `pbkdf2`, y zlib hacen cola en el mismo pool pequeño. Subir `UV_THREADPOOL_SIZE` (fijado antes de arrancar) ayuda hasta el número de núcleos; mover el hashing a worker threads o a otro servicio lo aísla.",
    ],
  },
  {
    id: "nd-runtime-14",
    q: ["A service's memory grows for hours until the container is killed. How do you find the leak?", "La mémoire d'un service grossit pendant des heures jusqu'à ce que le conteneur soit tué. Comment trouver la fuite ?", "La memoria de un servicio crece durante horas hasta que matan el contenedor. ¿Cómo encuentras la fuga?"],
    a: ["Take heap snapshots some time apart (or with `--heapsnapshot-near-heap-limit`) and compare which objects grow and what retains them", "Prendre des instantanés du tas à quelque temps d'écart (ou avec `--heapsnapshot-near-heap-limit`) et comparer quels objets grossissent et ce qui les retient", "Tomar instantáneas del heap con un tiempo de separación (o con `--heapsnapshot-near-heap-limit`) y comparar qué objetos crecen y qué los retiene"],
    w: [["Raise `--max-old-space-size` until it stops", "Relever `--max-old-space-size` jusqu'à ce que cela cesse", "Subir `--max-old-space-size` hasta que pare"], ["Call `global.gc()` every minute", "Appeler `global.gc()` chaque minute", "Llamar a `global.gc()` cada minuto"], ["Restart the service nightly and call it fixed", "Redémarrer le service chaque nuit et considérer que c'est réglé", "Reiniciar el servicio cada noche y darlo por resuelto"]],
    e: [
      "Typical leaks are caches without bounds, listeners added per request, closures kept by timers and maps keyed by request. The comparison view in DevTools shows the retaining path. A bigger heap only delays the crash.",
      "Les fuites typiques sont des caches sans limite, des écouteurs ajoutés à chaque requête, des closures gardées par des minuteurs et des maps indexées par requête. La vue de comparaison de DevTools montre le chemin de rétention. Un tas plus grand ne fait que retarder le plantage.",
      "Las fugas típicas son cachés sin límite, listeners añadidos en cada petición, closures retenidas por temporizadores y maps indexados por petición. La vista de comparación de DevTools muestra la ruta de retención. Un heap más grande solo retrasa la caída.",
    ],
  },
  {
    id: "nd-runtime-15",
    q: ["A container runs `CMD npm start` and takes the full 30-second grace period to stop on every deploy. What is the likely cause?", "Un conteneur lance `CMD npm start` et met tout le délai de grâce de 30 secondes à s'arrêter à chaque déploiement. Quelle est la cause probable ?", "Un contenedor ejecuta `CMD npm start` y tarda todo el periodo de gracia de 30 segundos en parar en cada despliegue. ¿Cuál es la causa probable?"],
    a: ["`SIGTERM` reaches npm or a shell as PID 1, not Node, or Node as PID 1 has no handler; run `CMD [\"node\", \"server.js\"]` and handle the signal, or use an init such as `--init`", "`SIGTERM` atteint npm ou un shell en PID 1, pas Node, ou Node en PID 1 n'a pas de gestionnaire ; lancer `CMD [\"node\", \"server.js\"]` et gérer le signal, ou utiliser un init comme `--init`", "`SIGTERM` llega a npm o a una shell como PID 1, no a Node, o Node como PID 1 no tiene manejador; ejecutar `CMD [\"node\", \"server.js\"]` y gestionar la señal, o usar un init como `--init`"],
    w: [["Node always needs 30 seconds to free memory", "Node a toujours besoin de 30 secondes pour libérer la mémoire", "Node siempre necesita 30 segundos para liberar memoria"], ["The image is too large", "L'image est trop grosse", "La imagen es demasiado grande"], ["`npm start` is deprecated in containers", "`npm start` est déprécié dans les conteneurs", "`npm start` está obsoleto en los contenedores"]],
    e: [
      "The kernel gives PID 1 no default signal actions: without a handler, `SIGTERM` does nothing and the platform waits for `SIGKILL`. A wrapper process may also not forward signals. The exec form with Node directly, plus a shutdown handler, fixes both.",
      "Le noyau ne donne au PID 1 aucune action par défaut pour les signaux : sans gestionnaire, `SIGTERM` ne fait rien et la plateforme attend `SIGKILL`. Un processus intermédiaire peut aussi ne pas transmettre les signaux. La forme exec avec Node directement, plus un gestionnaire d'arrêt, règle les deux.",
      "El kernel no da al PID 1 acciones por defecto para las señales: sin manejador, `SIGTERM` no hace nada y la plataforma espera a `SIGKILL`. Un proceso intermedio puede además no reenviar las señales. La forma exec con Node directamente, más un manejador de apagado, resuelve ambas cosas.",
    ],
  },
  {
    id: "nd-runtime-16",
    q: ["Why do native addons written against Node-API keep working across Node majors, unlike older addons?", "Pourquoi les modules natifs écrits avec Node-API continuent-ils de marcher d'une majeure de Node à l'autre, contrairement aux anciens ?", "¿Por qué los módulos nativos escritos con Node-API siguen funcionando entre versiones mayores de Node, a diferencia de los antiguos?"],
    a: ["Node-API is a stable ABI independent of V8's internals, so one compiled binary runs on later versions", "Node-API est une ABI stable, indépendante des détails internes de V8 : un même binaire compilé tourne sur les versions suivantes", "Node-API es una ABI estable, independiente de los detalles internos de V8, así que un mismo binario compilado funciona en versiones posteriores"],
    w: [["They are recompiled automatically on every start", "Ils sont recompilés automatiquement à chaque démarrage", "Se recompilan automáticamente en cada arranque"], ["They are written in JavaScript, not C++", "Ils sont écrits en JavaScript, pas en C++", "Están escritos en JavaScript, no en C++"], ["Node never changes V8 between majors", "Node ne change jamais de V8 entre majeures", "Node nunca cambia de V8 entre versiones mayores"]],
    e: [
      "Addons using V8 and nan directly break when V8's C++ API changes, which happens with most Node majors, and need a rebuild per version. With Node-API, prebuilt binaries per platform suffice, which also removes the need for an install-time compile.",
      "Les modules qui utilisent V8 et nan directement cassent quand l'API C++ de V8 change, ce qui arrive avec la plupart des majeures de Node, et demandent une recompilation par version. Avec Node-API, des binaires précompilés par plateforme suffisent, ce qui évite aussi une compilation à l'installation.",
      "Los módulos que usan V8 y nan directamente se rompen cuando cambia la API C++ de V8, lo que pasa con la mayoría de las versiones mayores de Node, y necesitan recompilarse por versión. Con Node-API bastan binarios precompilados por plataforma, lo que además evita compilar al instalar.",
    ],
  },
];

const modulesExpert: NodeQuestion[] = [
  {
    id: "nd-modules-13",
    q: ["`require(\"./config.mjs\")` throws `ERR_REQUIRE_ASYNC_MODULE`. Why?", "`require(\"./config.mjs\")` lève `ERR_REQUIRE_ASYNC_MODULE`. Pourquoi ?", "`require(\"./config.mjs\")` lanza `ERR_REQUIRE_ASYNC_MODULE`. ¿Por qué?"],
    a: ["The module, or one it imports, uses top-level `await`, so it cannot be evaluated synchronously", "Le module, ou un module qu'il importe, utilise `await` au niveau supérieur : il ne peut pas être évalué de façon synchrone", "El módulo, o uno que importa, usa `await` en el nivel superior, así que no puede evaluarse de forma síncrona"],
    w: [["`.mjs` files can never be loaded with `require`", "Les fichiers `.mjs` ne peuvent jamais être chargés par `require`", "Los archivos `.mjs` nunca pueden cargarse con `require`"], ["The file is too large", "Le fichier est trop gros", "El archivo es demasiado grande"], ["It has a default export", "Il a un export par défaut", "Tiene una exportación por defecto"]],
    e: [
      "`require` must return at once; a graph containing top-level `await` would need to wait. Use `await import()` there, or move the `await` into an exported function. Library authors keep top-level `await` out of entry points so CommonJS users can load them.",
      "`require` doit rendre la main tout de suite ; un graphe contenant un `await` au niveau supérieur devrait attendre. Utilisez alors `await import()`, ou déplacez l'`await` dans une fonction exportée. Les auteurs de bibliothèques gardent l'`await` au niveau supérieur hors des points d'entrée pour que les utilisateurs de CommonJS puissent les charger.",
      "`require` debe devolver el control de inmediato; un grafo con `await` en el nivel superior tendría que esperar. Usa entonces `await import()` o mueve el `await` a una función exportada. Quienes escriben bibliotecas dejan el `await` de nivel superior fuera de los puntos de entrada para que se puedan cargar desde CommonJS.",
    ],
  },
  {
    id: "nd-modules-14",
    q: ["A dev server reloads plugins with `await import(\"./plugin.js?v=\" + Date.now())`. What happens over a long session?", "Un serveur de développement recharge des plugins avec `await import(\"./plugin.js?v=\" + Date.now())`. Que se passe-t-il au fil d'une longue session ?", "Un servidor de desarrollo recarga plugins con `await import(\"./plugin.js?v=\" + Date.now())`. ¿Qué pasa a lo largo de una sesión larga?"],
    a: ["Memory grows: each URL is a new module in the ESM cache, and ES modules are never unloaded", "La mémoire grossit : chaque URL est un nouveau module dans le cache ESM, et les modules ES ne sont jamais déchargés", "La memoria crece: cada URL es un módulo nuevo en la caché ESM, y los módulos ES nunca se descargan"],
    w: [["Nothing: Node replaces the old module in place", "Rien : Node remplace l'ancien module sur place", "Nada: Node sustituye el módulo antiguo en su sitio"], ["The second import returns the cached first version", "Le second import renvoie la première version en cache", "La segunda importación devuelve la primera versión en caché"], ["Query strings are not allowed in specifiers", "Les chaînes de requête ne sont pas permises dans les chemins", "Las cadenas de consulta no se permiten en las rutas"]],
    e: [
      "The ESM cache is keyed by full URL and has no delete. The trick works for development but leaks. Tools reload by restarting the process (`--watch`) or by running plugins in a worker or a `vm` context that can be thrown away.",
      "Le cache ESM est indexé par URL complète et n'a pas de suppression. L'astuce marche en développement mais fuit. Les outils rechargent en relançant le processus (`--watch`) ou en exécutant les plugins dans un worker ou un contexte `vm` jetable.",
      "La caché ESM se indexa por URL completa y no permite borrar. El truco sirve en desarrollo pero tiene fugas. Las herramientas recargan reiniciando el proceso (`--watch`) o ejecutando los plugins en un worker o un contexto `vm` desechable.",
    ],
  },
  {
    id: "nd-modules-15",
    q: ["`counter.js` has `export let count = 0; export function inc() { count++; }`. Another module imports both, calls `inc()`, then reads `count`. What does it see?", "`counter.js` contient `export let count = 0; export function inc() { count++; }`. Un autre module importe les deux, appelle `inc()`, puis lit `count`. Que voit-il ?", "`counter.js` tiene `export let count = 0; export function inc() { count++; }`. Otro módulo importa ambos, llama a `inc()` y luego lee `count`. ¿Qué ve?"],
    a: ["1: ES module imports are live bindings to the exporting module's variable", "1 : les imports de modules ES sont des liaisons vivantes vers la variable du module qui exporte", "1: las importaciones de módulos ES son enlaces vivos a la variable del módulo que exporta"],
    w: [["0: the import copied the value", "0 : l'import a copié la valeur", "0: la importación copió el valor"], ["An error: imported variables are constants and cannot change", "Une erreur : les variables importées sont des constantes et ne peuvent pas changer", "Un error: las variables importadas son constantes y no pueden cambiar"], ["`undefined`", "`undefined`", "`undefined`"]],
    e: [
      "The importer cannot assign to `count`, but sees every change the exporter makes. CommonJS differs: `const { count } = require(\"./counter\")` copies the value at that moment. This matters when converting code between the two systems.",
      "L'importateur ne peut pas affecter `count`, mais voit chaque changement fait par le module exportateur. CommonJS diffère : `const { count } = require(\"./counter\")` copie la valeur à cet instant. Cela compte quand on convertit du code d'un système à l'autre.",
      "Quien importa no puede asignar a `count`, pero ve cada cambio que hace el módulo que exporta. CommonJS es distinto: `const { count } = require(\"./counter\")` copia el valor en ese momento. Importa al convertir código entre los dos sistemas.",
    ],
  },
  {
    id: "nd-modules-16",
    q: ["A tool must transform every module as Node loads it, for coverage or a custom file type. What is the supported way?", "Un outil doit transformer chaque module au moment où Node le charge, pour la couverture ou un type de fichier maison. Quelle est la manière prise en charge ?", "Una herramienta debe transformar cada módulo cuando Node lo carga, para cobertura o un tipo de archivo propio. ¿Cuál es la forma admitida?"],
    a: ["Module customization hooks (`resolve` and `load`), registered with `module.register` or `module.registerHooks` from a file passed to `--import`", "Les hooks de personnalisation des modules (`resolve` et `load`), enregistrés avec `module.register` ou `module.registerHooks` depuis un fichier passé à `--import`", "Los hooks de personalización de módulos (`resolve` y `load`), registrados con `module.register` o `module.registerHooks` desde un archivo pasado a `--import`"],
    w: [["Patching `require.extensions`, which also covers ESM", "Modifier `require.extensions`, qui couvre aussi l'ESM", "Modificar `require.extensions`, que también cubre ESM"], ["Editing the files in `node_modules` before each run", "Modifier les fichiers de `node_modules` avant chaque exécution", "Editar los archivos de `node_modules` antes de cada ejecución"], ["Overriding the global `import` function", "Redéfinir la fonction globale `import`", "Redefinir la función global `import`"]],
    e: [
      "`resolve` maps a specifier to a URL and `load` returns its source and format, for both module systems. `register` runs hooks off-thread, `registerHooks` in-thread and synchronously. Loaders for TypeScript, mocks and instrumentation are built on them.",
      "`resolve` associe un chemin à une URL et `load` en renvoie le source et le format, pour les deux systèmes de modules. `register` exécute les hooks sur un autre fil, `registerHooks` sur le même fil et de façon synchrone. Les chargeurs pour TypeScript, les mocks et l'instrumentation reposent dessus.",
      "`resolve` asocia una ruta a una URL y `load` devuelve su código y su formato, para los dos sistemas de módulos. `register` ejecuta los hooks en otro hilo, `registerHooks` en el mismo hilo y de forma síncrona. Los cargadores de TypeScript, los mocks y la instrumentación se basan en ellos.",
    ],
  },
];

const asyncExpert: NodeQuestion[] = [
  {
    id: "nd-async-13",
    q: ["A socket wrapper extends `EventEmitter` and emits `error` when the connection drops. Nobody listens to `error`. What happens?", "Une classe autour d'un socket étend `EventEmitter` et émet `error` quand la connexion tombe. Personne n'écoute `error`. Que se passe-t-il ?", "Una clase que envuelve un socket extiende `EventEmitter` y emite `error` cuando cae la conexión. Nadie escucha `error`. ¿Qué pasa?"],
    a: ["`emit(\"error\")` throws the error, which usually crashes the process", "`emit(\"error\")` lève l'erreur, ce qui fait en général tomber le processus", "`emit(\"error\")` lanza el error, lo que normalmente hace caer el proceso"],
    w: [["The event is ignored, like any event without listeners", "L'événement est ignoré, comme tout événement sans écouteur", "El evento se ignora, como cualquier evento sin listeners"], ["Node logs a warning and continues", "Node journalise un avertissement et continue", "Node registra un aviso y continúa"], ["The emitter retries the connection", "L'émetteur retente la connexion", "El emisor reintenta la conexión"]],
    e: [
      "`error` is special: with no listener, Node throws. Every stream, socket and emitter that can fail needs an `error` handler, or must be wrapped with `pipeline` or `events.once`, which turn errors into rejections.",
      "`error` est spécial : sans écouteur, Node lève l'erreur. Chaque flux, socket ou émetteur qui peut échouer a besoin d'un gestionnaire `error`, ou doit être enveloppé avec `pipeline` ou `events.once`, qui changent les erreurs en rejets.",
      "`error` es especial: sin listener, Node lanza el error. Cada stream, socket o emisor que pueda fallar necesita un manejador de `error`, o envolverse con `pipeline` o `events.once`, que convierten los errores en rechazos.",
    ],
  },
  {
    id: "nd-async-14",
    q: ["A function reschedules itself with `process.nextTick` until a queue is empty. Under load, the server stops answering. Why?", "Une fonction se replanifie avec `process.nextTick` jusqu'à ce qu'une file soit vide. Sous charge, le serveur cesse de répondre. Pourquoi ?", "Una función se reprograma con `process.nextTick` hasta vaciar una cola. Con carga, el servidor deja de responder. ¿Por qué?"],
    a: ["The `nextTick` queue is emptied before the loop moves on, so as long as it refills, I/O and timers never run", "La file `nextTick` est vidée avant que la boucle n'avance : tant qu'elle se remplit, ni les entrées-sorties ni les minuteurs ne passent", "La cola de `nextTick` se vacía antes de que el bucle avance: mientras se rellene, ni la entrada y salida ni los temporizadores se ejecutan"],
    w: [["`nextTick` has a limit of 1,000 calls", "`nextTick` est limité à 1 000 appels", "`nextTick` tiene un límite de 1.000 llamadas"], ["`nextTick` runs on another thread and takes all CPUs", "`nextTick` tourne sur un autre fil et prend tous les CPU", "`nextTick` corre en otro hilo y ocupa todas las CPU"], ["The garbage collector is disabled during `nextTick`", "Le ramasse-miettes est désactivé pendant `nextTick`", "El recolector de basura se desactiva durante `nextTick`"]],
    e: [
      "Microtasks (`nextTick` and promise callbacks) all run before the next phase; an endless chain starves the loop. Yield with `setImmediate`, which runs once per loop turn, or process the queue in bounded batches.",
      "Les microtâches (`nextTick` et callbacks de promesses) passent toutes avant la phase suivante ; une chaîne sans fin affame la boucle. Rendez la main avec `setImmediate`, qui passe une fois par tour de boucle, ou traitez la file par lots bornés.",
      "Las microtareas (`nextTick` y callbacks de promesas) se ejecutan todas antes de la siguiente fase; una cadena sin fin mata de hambre al bucle. Cede el control con `setImmediate`, que se ejecuta una vez por vuelta del bucle, o procesa la cola en lotes acotados.",
    ],
  },
  {
    id: "nd-async-15",
    q: ["`const p = loadA(); await slowB(); await p;` sometimes crashes with an unhandled rejection although `p` is awaited. Why?", "`const p = loadA(); await slowB(); await p;` plante parfois sur un rejet non géré alors que `p` est attendu. Pourquoi ?", "`const p = loadA(); await slowB(); await p;` a veces cae por un rechazo no gestionado aunque se espera `p`. ¿Por qué?"],
    a: ["If `p` rejects while `slowB` runs, it has no handler yet, and Node reports the rejection before the `await p` line is reached", "Si `p` est rejetée pendant `slowB`, elle n'a encore aucun gestionnaire, et Node signale le rejet avant d'arriver à la ligne `await p`", "Si `p` se rechaza mientras corre `slowB`, aún no tiene manejador, y Node informa del rechazo antes de llegar a la línea `await p`"],
    w: [["`await` cannot be used twice in a function", "`await` ne peut pas servir deux fois dans une fonction", "`await` no puede usarse dos veces en una función"], ["`loadA` runs only at `await p`", "`loadA` ne tourne qu'à `await p`", "`loadA` solo se ejecuta en `await p`"], ["It is a bug in V8", "C'est un bug de V8", "Es un error de V8"]],
    e: [
      "A rejection is unhandled if no handler is attached by the time the microtasks drain. Start both and await them together with `Promise.all([loadA(), slowB()])`, or attach a handler at once. The default crash mode makes this latent bug visible.",
      "Un rejet est non géré si aucun gestionnaire n'est attaché quand les microtâches sont vidées. Lancez les deux et attendez-les ensemble avec `Promise.all([loadA(), slowB()])`, ou attachez tout de suite un gestionnaire. Le mode de plantage par défaut rend visible ce bug latent.",
      "Un rechazo queda sin gestionar si no hay manejador cuando se vacían las microtareas. Lanza las dos y espéralas juntas con `Promise.all([loadA(), slowB()])`, o añade un manejador de inmediato. El modo de caída por defecto hace visible este error latente.",
    ],
  },
  {
    id: "nd-async-16",
    q: ["A 500 MB `ArrayBuffer` must go to a worker thread. How do you avoid copying it?", "Un `ArrayBuffer` de 500 Mo doit aller à un worker thread. Comment éviter de le copier ?", "Un `ArrayBuffer` de 500 MB debe ir a un worker thread. ¿Cómo evitas copiarlo?"],
    a: ["Pass it in the transfer list: `worker.postMessage(buf, [buf])`; ownership moves and the sender can no longer use it", "Le passer dans la liste de transfert : `worker.postMessage(buf, [buf])` ; la propriété change de main et l'expéditeur ne peut plus s'en servir", "Pasarlo en la lista de transferencia: `worker.postMessage(buf, [buf])`; la propiedad cambia de manos y el emisor ya no puede usarlo"],
    w: [["`JSON.stringify` it first, which is faster", "Le passer d'abord par `JSON.stringify`, plus rapide", "Pasarlo antes por `JSON.stringify`, que es más rápido"], ["Workers share every variable with the main thread", "Les workers partagent toutes les variables avec le fil principal", "Los workers comparten todas las variables con el hilo principal"], ["It is impossible: messages are always copied", "C'est impossible : les messages sont toujours copiés", "Es imposible: los mensajes siempre se copian"]],
    e: [
      "`postMessage` uses structured clone, copying by default. Transferring detaches the buffer from the sender at almost no cost. To work on the same memory from both sides, use a `SharedArrayBuffer` and `Atomics` for synchronisation.",
      "`postMessage` utilise le clonage structuré, qui copie par défaut. Le transfert détache le buffer de l'expéditeur presque sans coût. Pour travailler sur la même mémoire des deux côtés, utilisez un `SharedArrayBuffer` et `Atomics` pour la synchronisation.",
      "`postMessage` usa la clonación estructurada, que copia por defecto. Transferir separa el buffer del emisor casi sin coste. Para trabajar sobre la misma memoria desde ambos lados, usa un `SharedArrayBuffer` y `Atomics` para sincronizar.",
    ],
  },
];

const apisExpert: NodeQuestion[] = [
  {
    id: "nd-apis-13",
    q: ["Behind a load balancer with a 60-second idle timeout, a Node server returns occasional 502 errors. What is a classic cause?", "Derrière un répartiteur de charge avec un délai d'inactivité de 60 secondes, un serveur Node renvoie de temps en temps des erreurs 502. Quelle est une cause classique ?", "Detrás de un balanceador con un tiempo de inactividad de 60 segundos, un servidor Node devuelve errores 502 de vez en cuando. ¿Cuál es una causa clásica?"],
    a: ["Node's `keepAliveTimeout` (5 seconds by default) is shorter, so Node closes idle connections the balancer still reuses; set it above 60 seconds", "Le `keepAliveTimeout` de Node (5 secondes par défaut) est plus court : Node ferme des connexions inactives que le répartiteur réutilise encore ; le régler au-dessus de 60 secondes", "El `keepAliveTimeout` de Node (5 segundos por defecto) es más corto, así que Node cierra conexiones inactivas que el balanceador aún reutiliza; fijarlo por encima de 60 segundos"],
    w: [["Node cannot handle more than 60 connections", "Node ne peut pas gérer plus de 60 connexions", "Node no puede gestionar más de 60 conexiones"], ["The balancer needs HTTP/1.0", "Le répartiteur a besoin de HTTP/1.0", "El balanceador necesita HTTP/1.0"], ["502 always means a bug in the application code", "Un 502 signifie toujours un bug dans le code de l'application", "Un 502 siempre significa un error en el código de la aplicación"]],
    e: [
      "The side that closes an idle connection should be the client, here the balancer. If the server closes first, a request sent at that moment hits a dead socket. Set `server.keepAliveTimeout` above the balancer's idle timeout, and `headersTimeout` a bit higher still.",
      "C'est le client, ici le répartiteur, qui devrait fermer une connexion inactive. Si le serveur ferme d'abord, une requête envoyée à cet instant tombe sur un socket mort. Réglez `server.keepAliveTimeout` au-dessus du délai d'inactivité du répartiteur, et `headersTimeout` encore un peu plus haut.",
      "Quien cierra una conexión inactiva debería ser el cliente, aquí el balanceador. Si el servidor cierra antes, una petición enviada en ese momento cae en un socket muerto. Fija `server.keepAliveTimeout` por encima del tiempo de inactividad del balanceador, y `headersTimeout` un poco más alto aún.",
    ],
  },
  {
    id: "nd-apis-14",
    q: ["A service calls `fetch` and checks only `res.status`, never reading the body. Over time, requests start waiting for connections. Why?", "Un service appelle `fetch` et ne vérifie que `res.status`, sans jamais lire le corps. Avec le temps, les requêtes attendent des connexions. Pourquoi ?", "Un servicio llama a `fetch` y solo mira `res.status`, sin leer nunca el cuerpo. Con el tiempo, las peticiones esperan conexiones. ¿Por qué?"],
    a: ["An unread body keeps its connection busy until it is garbage-collected; read it or call `res.body?.cancel()`", "Un corps non lu garde sa connexion occupée jusqu'à son ramassage par le ramasse-miettes ; le lire ou appeler `res.body?.cancel()`", "Un cuerpo no leído mantiene ocupada su conexión hasta que lo recoge el recolector de basura; léelo o llama a `res.body?.cancel()`"],
    w: [["`fetch` opens one connection per process only", "`fetch` n'ouvre qu'une connexion par processus", "`fetch` solo abre una conexión por proceso"], ["Status codes must be read twice", "Les codes de statut doivent être lus deux fois", "Los códigos de estado deben leerse dos veces"], ["The server limits clients that skip `Accept` headers", "Le serveur limite les clients qui omettent les en-têtes `Accept`", "El servidor limita a los clientes que omiten las cabeceras `Accept`"]],
    e: [
      "Node's `fetch` (undici) pools connections; a response's connection returns to the pool only when its body is consumed or cancelled. Unlike browsers, Node does not free it quickly. Under load the pool runs dry and calls queue.",
      "Le `fetch` de Node (undici) met les connexions en pool ; la connexion d'une réponse ne revient au pool que quand son corps est consommé ou annulé. Contrairement aux navigateurs, Node ne la libère pas vite. Sous charge, le pool se vide et les appels font la queue.",
      "El `fetch` de Node (undici) agrupa las conexiones en un pool; la conexión de una respuesta solo vuelve al pool cuando su cuerpo se consume o se cancela. A diferencia de los navegadores, Node no la libera pronto. Con carga, el pool se agota y las llamadas hacen cola.",
    ],
  },
  {
    id: "nd-apis-15",
    q: ["Can `node:vm` safely run JavaScript uploaded by users?", "`node:vm` peut-il exécuter sans danger du JavaScript envoyé par des utilisateurs ?", "¿Puede `node:vm` ejecutar sin peligro JavaScript enviado por usuarios?"],
    a: ["No: `vm` separates global scopes but is not a security boundary; use process or OS isolation for untrusted code", "Non : `vm` sépare les portées globales mais n'est pas une frontière de sécurité ; pour du code non fiable, isolez au niveau du processus ou du système", "No: `vm` separa los ámbitos globales pero no es una barrera de seguridad; para código no fiable, aísla a nivel de proceso o de sistema"],
    w: [["Yes, with `runInNewContext`", "Oui, avec `runInNewContext`", "Sí, con `runInNewContext`"], ["Yes, if a `timeout` is set", "Oui, si un `timeout` est fixé", "Sí, si se fija un `timeout`"], ["Yes, `vm` is how browsers isolate tabs", "Oui, `vm` est la manière dont les navigateurs isolent les onglets", "Sí, `vm` es como los navegadores aíslan las pestañas"]],
    e: [
      "Code in a context can climb the prototype chain to the host's `Function` and escape; Node's documentation says so plainly. Real isolation means a separate process with few rights, a container or microVM, or an engine built for it such as V8 isolates.",
      "Le code d'un contexte peut remonter la chaîne de prototypes jusqu'au `Function` de l'hôte et s'échapper ; la documentation de Node le dit clairement. Une vraie isolation passe par un processus séparé aux droits réduits, un conteneur ou une microVM, ou un moteur conçu pour cela comme les isolats V8.",
      "El código de un contexto puede subir por la cadena de prototipos hasta el `Function` del anfitrión y escapar; la documentación de Node lo dice claramente. El aislamiento real pasa por un proceso aparte con pocos permisos, un contenedor o una microVM, o un motor pensado para ello como los isolates de V8.",
    ],
  },
  {
    id: "nd-apis-16",
    q: ["Why is OpenTelemetry for Node started with `node --import ./instrumentation.js app.js` rather than imported in `app.js`?", "Pourquoi OpenTelemetry pour Node se démarre-t-il avec `node --import ./instrumentation.js app.js` plutôt qu'en l'important dans `app.js` ?", "¿Por qué OpenTelemetry para Node se arranca con `node --import ./instrumentation.js app.js` en lugar de importarlo en `app.js`?"],
    a: ["It must hook into modules such as `http` and database clients before the application loads them; a preload runs first", "Il doit s'accrocher à des modules comme `http` et aux clients de base de données avant que l'application ne les charge ; un préchargement passe en premier", "Debe engancharse a módulos como `http` y a los clientes de base de datos antes de que la aplicación los cargue; una precarga va primero"],
    w: [["`--import` makes the app faster", "`--import` rend l'application plus rapide", "`--import` hace la aplicación más rápida"], ["Telemetry is not allowed inside application code", "La télémétrie n'est pas permise dans le code de l'application", "La telemetría no está permitida en el código de la aplicación"], ["It must run in a separate process", "Elle doit tourner dans un processus séparé", "Debe correr en un proceso aparte"]],
    e: [
      "Static imports are hoisted and evaluated before the module's own code, so an import placed first in `app.js` may still come too late. Preloading registers hooks and `diagnostics_channel` subscribers before anything else; libraries publish events there that tracers consume.",
      "Les imports statiques sont remontés et évalués avant le code du module lui-même : un import placé en tête d'`app.js` peut encore arriver trop tard. Le préchargement enregistre les hooks et les abonnés de `diagnostics_channel` avant tout le reste ; les bibliothèques y publient des événements que les traceurs consomment.",
      "Los imports estáticos se elevan y se evalúan antes que el código del propio módulo, así que un import al principio de `app.js` puede llegar tarde igualmente. La precarga registra los hooks y los suscriptores de `diagnostics_channel` antes que nada; las bibliotecas publican ahí eventos que consumen los trazadores.",
    ],
  },
];

const packagesExpert: NodeQuestion[] = [
  {
    id: "nd-packages-13",
    q: ["TypeScript users of your package get `any` for every import, though `.d.ts` files are published. Their config uses `\"moduleResolution\": \"nodenext\"`. What is the likely mistake?", "Les utilisateurs TypeScript de votre paquet obtiennent `any` pour chaque import, bien que des fichiers `.d.ts` soient publiés. Leur config utilise `\"moduleResolution\": \"nodenext\"`. Quelle est l'erreur probable ?", "Quienes usan tu paquete con TypeScript obtienen `any` en cada import, aunque se publican archivos `.d.ts`. Su configuración usa `\"moduleResolution\": \"nodenext\"`. ¿Cuál es el error probable?"],
    a: ["`exports` has no `types` condition, or lists it after `default`; with `exports` present, the top-level `types` field is ignored", "`exports` n'a pas de condition `types`, ou la place après `default` ; quand `exports` existe, le champ `types` de premier niveau est ignoré", "`exports` no tiene condición `types`, o la pone después de `default`; cuando existe `exports`, el campo `types` de primer nivel se ignora"],
    w: [["`.d.ts` files must be in the root folder", "Les fichiers `.d.ts` doivent être dans le dossier racine", "Los archivos `.d.ts` deben estar en la carpeta raíz"], ["TypeScript cannot read packages published as ESM", "TypeScript ne sait pas lire les paquets publiés en ESM", "TypeScript no sabe leer paquetes publicados como ESM"], ["The package must also be published to DefinitelyTyped", "Le paquet doit aussi être publié sur DefinitelyTyped", "El paquete también debe publicarse en DefinitelyTyped"]],
    e: [
      "Modern resolution follows `exports` like Node does; each entry needs `types` first, and separate declarations for `import` and `require` when the builds differ. Are the Types Wrong checks every resolution mode before you publish.",
      "La résolution moderne suit `exports` comme le fait Node ; chaque entrée a besoin de `types` en premier, et de déclarations séparées pour `import` et `require` quand les builds diffèrent. Are the Types Wrong vérifie chaque mode de résolution avant publication.",
      "La resolución moderna sigue `exports` como hace Node; cada entrada necesita `types` en primer lugar, y declaraciones separadas para `import` y `require` cuando los builds difieren. Are the Types Wrong comprueba cada modo de resolución antes de publicar.",
    ],
  },
  {
    id: "nd-packages-14",
    q: ["What does `\"sideEffects\": false` in a library's `package.json` tell a bundler?", "Que dit `\"sideEffects\": false` dans le `package.json` d'une bibliothèque à un bundler ?", "¿Qué le dice `\"sideEffects\": false` en el `package.json` de una biblioteca a un bundler?"],
    a: ["That importing a module does nothing beyond its exports, so unused modules can be dropped from the bundle", "Qu'importer un module ne fait rien d'autre que fournir ses exports : les modules inutilisés peuvent être retirés du bundle", "Que importar un módulo no hace nada más que dar sus exportaciones, así que los módulos no usados pueden quitarse del bundle"],
    w: [["That the code has no bugs", "Que le code n'a pas de bugs", "Que el código no tiene errores"], ["That Node must load the package lazily", "Que Node doit charger le paquet à la demande", "Que Node debe cargar el paquete bajo demanda"], ["That the package has no dependencies", "Que le paquet n'a pas de dépendances", "Que el paquete no tiene dependencias"]],
    e: [
      "Tree shaking can only remove an unused import if evaluating it has no effect. Files that do have effects, such as CSS imports or polyfills, are listed instead: `\"sideEffects\": [\"*.css\"]`. A wrong `false` silently drops code that was needed.",
      "Le tree shaking ne peut retirer un import inutilisé que si son évaluation n'a aucun effet. Les fichiers qui en ont, comme les imports CSS ou les polyfills, sont listés à la place : `\"sideEffects\": [\"*.css\"]`. Un `false` erroné supprime en silence du code nécessaire.",
      "El tree shaking solo puede quitar un import no usado si evaluarlo no tiene efectos. Los archivos que sí los tienen, como los imports de CSS o los polyfills, se listan en su lugar: `\"sideEffects\": [\"*.css\"]`. Un `false` erróneo elimina en silencio código necesario.",
    ],
  },
  {
    id: "nd-packages-15",
    q: ["`npm install` fails with `ERESOLVE` and someone suggests `--legacy-peer-deps`. What does that flag really do?", "`npm install` échoue avec `ERESOLVE` et quelqu'un suggère `--legacy-peer-deps`. Que fait vraiment cette option ?", "`npm install` falla con `ERESOLVE` y alguien sugiere `--legacy-peer-deps`. ¿Qué hace de verdad esa opción?"],
    a: ["It ignores peer dependencies entirely, as npm 6 did, so the conflict is hidden and may surface as a run-time error", "Il ignore entièrement les dépendances pairs, comme npm 6 : le conflit est caché et peut ressortir en erreur à l'exécution", "Ignora por completo las dependencias pares, como npm 6, así que el conflicto se oculta y puede aparecer como error en ejecución"],
    w: [["It installs the newest compatible peers", "Il installe les pairs compatibles les plus récents", "Instala los pares compatibles más nuevos"], ["It downgrades npm for this project", "Il rétrograde npm pour ce projet", "Baja la versión de npm para este proyecto"], ["It fixes the conflict by editing the plugins' ranges", "Il règle le conflit en modifiant les plages des plugins", "Resuelve el conflicto editando los rangos de los plugins"]],
    e: [
      "`ERESOLVE` says two packages want incompatible versions of a shared peer, such as two React majors. Read which ones, then upgrade the plugin or the host, or use an override if you have checked compatibility. Leaving the flag in `.npmrc` hides the next conflict too.",
      "`ERESOLVE` dit que deux paquets veulent des versions incompatibles d'un pair partagé, comme deux majeures de React. Lisez lesquels, puis mettez à jour le plugin ou l'hôte, ou utilisez un override si vous avez vérifié la compatibilité. Laisser l'option dans `.npmrc` cache aussi le conflit suivant.",
      "`ERESOLVE` indica que dos paquetes quieren versiones incompatibles de un par compartido, como dos mayores de React. Mira cuáles, y luego actualiza el plugin o el anfitrión, o usa un override si comprobaste la compatibilidad. Dejar la opción en `.npmrc` oculta también el siguiente conflicto.",
    ],
  },
  {
    id: "nd-packages-16",
    q: ["A library makes an exported type stricter, for example a parameter from `string` to `\"a\" | \"b\"`, without changing JavaScript behaviour. Is it a breaking change?", "Une bibliothèque durcit un type exporté, par exemple un paramètre de `string` à `\"a\" | \"b\"`, sans changer le comportement JavaScript. Est-ce un changement cassant ?", "Una biblioteca endurece un tipo exportado, por ejemplo un parámetro de `string` a `\"a\" | \"b\"`, sin cambiar el comportamiento JavaScript. ¿Es un cambio incompatible?"],
    a: ["Yes for TypeScript users: their builds can fail after an update in range, so many libraries treat it as major", "Oui pour les utilisateurs de TypeScript : leurs builds peuvent échouer après une mise à jour dans la plage, et beaucoup de bibliothèques le traitent comme une majeure", "Sí para quienes usan TypeScript: sus builds pueden fallar tras una actualización dentro del rango, y muchas bibliotecas lo tratan como mayor"],
    w: [["No: types are erased at run time, so nothing can break", "Non : les types sont effacés à l'exécution, rien ne peut casser", "No: los tipos se borran en ejecución, nada puede romperse"], ["Only if the package is written in JavaScript", "Seulement si le paquet est écrit en JavaScript", "Solo si el paquete está escrito en JavaScript"], ["Semver does not apply to packages with types", "Le semver ne s'applique pas aux paquets avec des types", "Semver no se aplica a paquetes con tipos"]],
    e: [
      "A type is part of the public API for typed users. Some projects document a policy, such as following the TypeScript versions they support and allowing type fixes in minors. Whatever the choice, write it down so users can pin accordingly.",
      "Un type fait partie de l'API publique pour les utilisateurs typés. Certains projets écrivent une politique, comme suivre les versions de TypeScript prises en charge et permettre des corrections de types dans les mineures. Quel que soit le choix, écrivez-le pour que les utilisateurs fixent leurs versions en conséquence.",
      "Un tipo forma parte de la API pública para quien usa tipos. Algunos proyectos documentan una política, como seguir las versiones de TypeScript que admiten y permitir correcciones de tipos en las menores. Sea cual sea la elección, ponla por escrito para que los usuarios fijen sus versiones en consecuencia.",
    ],
  },
];

const depsExpert: NodeQuestion[] = [
  {
    id: "nd-deps-13",
    q: ["`npm ls react` shows two copies of React 19 at slightly different versions. What does `npm dedupe` try, and why does it matter here?", "`npm ls react` montre deux copies de React 19 en versions légèrement différentes. Que tente `npm dedupe`, et pourquoi est-ce important ici ?", "`npm ls react` muestra dos copias de React 19 en versiones algo distintas. ¿Qué intenta `npm dedupe` y por qué importa aquí?"],
    a: ["It moves to one version that satisfies every range; two Reacts in one app break hooks and context", "Il passe à une seule version qui satisfait toutes les plages ; deux React dans une application cassent les hooks et le contexte", "Pasa a una sola versión que cumple todos los rangos; dos React en una app rompen los hooks y el contexto"],
    w: [["It deletes the older copy even if a range forbids it", "Il supprime l'ancienne copie même si une plage l'interdit", "Borra la copia antigua aunque un rango lo prohíba"], ["It only shrinks the download cache", "Il réduit seulement le cache de téléchargement", "Solo reduce la caché de descargas"], ["It merges the two copies into one file", "Il fusionne les deux copies en un seul fichier", "Combina las dos copias en un solo archivo"]],
    e: [
      "Duplicates happen when ranges were resolved at different times. Singletons (React, a GraphQL schema library, a DI container) must exist once. `dedupe` fixes what the ranges allow; otherwise widen a range, declare it as a peer or add an override.",
      "Les doublons apparaissent quand des plages ont été résolues à des moments différents. Les singletons (React, une bibliothèque de schéma GraphQL, un conteneur d'injection) doivent exister une seule fois. `dedupe` corrige ce que les plages permettent ; sinon élargissez une plage, déclarez-le en pair ou ajoutez un override.",
      "Los duplicados aparecen cuando los rangos se resolvieron en momentos distintos. Los singletons (React, una biblioteca de esquemas GraphQL, un contenedor de inyección) deben existir una vez. `dedupe` arregla lo que los rangos permiten; si no, amplía un rango, decláralo como par o añade un override.",
    ],
  },
  {
    id: "nd-deps-14",
    q: ["With the same lockfile, two `npm ci` runs on different machines produce different `node_modules`. What can still differ?", "Avec le même lockfile, deux `npm ci` sur des machines différentes donnent des `node_modules` différents. Qu'est-ce qui peut encore différer ?", "Con el mismo lockfile, dos `npm ci` en máquinas distintas dan `node_modules` distintos. ¿Qué puede seguir siendo diferente?"],
    a: ["Platform-specific optional packages, native addons built by install scripts, and anything those scripts download", "Les paquets optionnels propres à la plateforme, les modules natifs compilés par des scripts d'installation, et tout ce que ces scripts téléchargent", "Los paquetes opcionales propios de cada plataforma, los módulos nativos compilados por scripts de instalación y todo lo que esos scripts descargan"],
    w: [["Nothing: a lockfile guarantees identical bytes on disk", "Rien : un lockfile garantit des octets identiques sur le disque", "Nada: un lockfile garantiza bytes idénticos en disco"], ["The JavaScript of each package, which npm minifies per machine", "Le JavaScript de chaque paquet, que npm minifie selon la machine", "El JavaScript de cada paquete, que npm minifica según la máquina"], ["Only the order of folders", "Seulement l'ordre des dossiers", "Solo el orden de las carpetas"]],
    e: [
      "The lockfile pins tarballs, not what happens after extraction. Build in the same image as you run (same OS, libc and CPU), cache by lockfile hash, and prefer prebuilt Node-API binaries to compiling with node-gyp at install.",
      "Le lockfile fige les archives, pas ce qui se passe après l'extraction. Construisez dans la même image que celle où vous exécutez (même OS, même libc, même CPU), mettez en cache selon l'empreinte du lockfile, et préférez des binaires Node-API précompilés à une compilation node-gyp à l'installation.",
      "El lockfile fija los archivos comprimidos, no lo que pasa tras extraerlos. Compila en la misma imagen en la que ejecutas (mismo SO, misma libc, misma CPU), usa caché según el hash del lockfile y prefiere binarios Node-API precompilados a compilar con node-gyp al instalar.",
    ],
  },
  {
    id: "nd-deps-15",
    q: ["Why do many companies install through a private registry proxy (Artifactory, Verdaccio, GitHub Packages) rather than straight from npmjs.org?", "Pourquoi beaucoup d'entreprises installent-elles via un proxy de registre privé (Artifactory, Verdaccio, GitHub Packages) plutôt que directement depuis npmjs.org ?", "¿Por qué muchas empresas instalan a través de un proxy de registro privado (Artifactory, Verdaccio, GitHub Packages) en lugar de directamente desde npmjs.org?"],
    a: ["It caches what was installed, hosts internal packages, and is a single place to apply policies such as blocking or delaying versions", "Il garde en cache ce qui a été installé, héberge les paquets internes, et offre un seul endroit pour appliquer des règles comme bloquer ou retarder des versions", "Guarda en caché lo instalado, aloja los paquetes internos y es un único sitio donde aplicar políticas como bloquear o retrasar versiones"],
    w: [["npmjs.org forbids companies from installing directly", "npmjs.org interdit aux entreprises d'installer directement", "npmjs.org prohíbe a las empresas instalar directamente"], ["It makes every package free of vulnerabilities", "Il rend chaque paquet exempt de vulnérabilités", "Hace que todos los paquetes estén libres de vulnerabilidades"], ["It is required to use a lockfile", "Il est nécessaire pour utiliser un lockfile", "Es necesario para usar un lockfile"]],
    e: [
      "A proxy keeps builds going when the public registry is slow, keeps a copy of a version even if it is unpublished, and logs who installed what. It must be configured so internal scopes never fall through to the public registry.",
      "Un proxy permet aux builds de continuer quand le registre public est lent, garde une copie d'une version même dépubliée, et journalise qui a installé quoi. Il faut le configurer pour que les portées internes ne retombent jamais sur le registre public.",
      "Un proxy permite que los builds sigan cuando el registro público va lento, guarda una copia de una versión aunque se despublique y registra quién instaló qué. Hay que configurarlo para que los ámbitos internos nunca acaben en el registro público.",
    ],
  },
  {
    id: "nd-deps-16",
    q: ["What does Yarn's Plug'n'Play mode change about how packages are found?", "Que change le mode Plug'n'Play de Yarn à la façon dont les paquets sont trouvés ?", "¿Qué cambia el modo Plug'n'Play de Yarn en cómo se encuentran los paquetes?"],
    a: ["There is no `node_modules`: a generated `.pnp.cjs` map tells Node where each package lives, in zip archives in a cache", "Il n'y a pas de `node_modules` : une table générée `.pnp.cjs` dit à Node où vit chaque paquet, dans des archives zip d'un cache", "No hay `node_modules`: un mapa generado `.pnp.cjs` dice a Node dónde está cada paquete, en archivos zip de una caché"],
    w: [["Packages are downloaded when first imported at run time", "Les paquets sont téléchargés au premier import, à l'exécution", "Los paquetes se descargan al importarlos por primera vez, en ejecución"], ["Every package is merged into one file", "Tous les paquets sont fusionnés en un seul fichier", "Todos los paquetes se combinan en un solo archivo"], ["It only changes the output colours", "Il change seulement les couleurs de l'affichage", "Solo cambia los colores de la salida"]],
    e: [
      "Resolution becomes a lookup in a precise map, so undeclared imports fail and installs are near instant. The cost is compatibility: tools that walk `node_modules` themselves need SDKs or patches, which is why the `node-modules` linker remains an option.",
      "La résolution devient une recherche dans une table précise : les imports non déclarés échouent et les installations sont presque instantanées. Le prix est la compatibilité : les outils qui parcourent `node_modules` eux-mêmes ont besoin de SDK ou de correctifs, d'où le linker `node-modules` qui reste possible.",
      "La resolución pasa a ser una búsqueda en un mapa preciso, así que los imports no declarados fallan y las instalaciones son casi instantáneas. El precio es la compatibilidad: las herramientas que recorren `node_modules` por su cuenta necesitan SDK o parches, por eso el linker `node-modules` sigue disponible.",
    ],
  },
];

const publishExpert: NodeQuestion[] = [
  {
    id: "nd-publish-13",
    q: ["In late 2026, is it reasonable for a new library to publish ESM only?", "Fin 2026, est-il raisonnable qu'une nouvelle bibliothèque ne publie qu'en ESM ?", "A finales de 2026, ¿es razonable que una biblioteca nueva publique solo ESM?"],
    a: ["Yes for most: every supported Node line can `require()` ESM without top-level `await`, so CommonJS users can still load it", "Oui pour la plupart : toutes les lignes de Node encore soutenues peuvent charger de l'ESM par `require()` sans `await` au niveau supérieur, donc les utilisateurs de CommonJS peuvent encore la charger", "Sí para la mayoría: todas las líneas de Node con soporte pueden cargar ESM con `require()` si no hay `await` de nivel superior, así que desde CommonJS aún se puede cargar"],
    w: [["No: half of Node users cannot load ESM at all", "Non : la moitié des utilisateurs de Node ne peuvent pas charger d'ESM du tout", "No: la mitad de los usuarios de Node no pueden cargar ESM en absoluto"], ["No: npm refuses ESM-only packages", "Non : npm refuse les paquets uniquement ESM", "No: npm rechaza los paquetes solo ESM"], ["Yes, but only if written in TypeScript", "Oui, mais seulement si elle est écrite en TypeScript", "Sí, pero solo si está escrita en TypeScript"]],
    e: [
      "`require(esm)` shipped in 20.19 and 22.12, and Node 20 reached end of life in April 2026. A single format avoids the dual package hazard and halves the build. Keep entry points free of top-level `await` and test a CommonJS consumer in CI.",
      "`require(esm)` est arrivé dans 20.19 et 22.12, et Node 20 a atteint sa fin de vie en avril 2026. Un seul format évite le risque du double paquet et divise le build par deux. Gardez les points d'entrée sans `await` au niveau supérieur et testez un consommateur CommonJS en CI.",
      "`require(esm)` llegó en 20.19 y 22.12, y Node 20 llegó al fin de su vida en abril de 2026. Un solo formato evita el riesgo del paquete doble y reduce el build a la mitad. Deja los puntos de entrada sin `await` de nivel superior y prueba en la CI un consumidor CommonJS.",
    ],
  },
  {
    id: "nd-publish-14",
    q: ["A package compiles TypeScript in a `prepare` script. When does that script run?", "Un paquet compile son TypeScript dans un script `prepare`. Quand ce script tourne-t-il ?", "Un paquete compila TypeScript en un script `prepare`. ¿Cuándo se ejecuta ese script?"],
    a: ["Before `npm pack` and `npm publish`, after a local `npm install`, and when someone installs the package from a Git URL", "Avant `npm pack` et `npm publish`, après un `npm install` local, et quand quelqu'un installe le paquet depuis une URL Git", "Antes de `npm pack` y `npm publish`, tras un `npm install` local y cuando alguien instala el paquete desde una URL de Git"],
    w: [["Only on `npm publish`", "Seulement à `npm publish`", "Solo en `npm publish`"], ["On every install from the registry, on users' machines", "À chaque installation depuis le registre, sur les machines des utilisateurs", "En cada instalación desde el registro, en las máquinas de los usuarios"], ["Never automatically", "Jamais automatiquement", "Nunca automáticamente"]],
    e: [
      "`prepare` makes Git dependencies usable by building them on install. `prepublishOnly` runs only before `npm publish`, a good place for a final test. Registry installs get the built tarball and run neither, which is what you want.",
      "`prepare` rend les dépendances Git utilisables en les construisant à l'installation. `prepublishOnly` ne tourne qu'avant `npm publish`, bon endroit pour un dernier test. Les installations depuis le registre reçoivent l'archive construite et ne lancent ni l'un ni l'autre, ce qui est voulu.",
      "`prepare` hace utilizables las dependencias de Git compilándolas al instalar. `prepublishOnly` solo se ejecuta antes de `npm publish`, buen sitio para una última prueba. Las instalaciones desde el registro reciben el archivo ya compilado y no ejecutan ninguno de los dos, que es lo que se busca.",
    ],
  },
  {
    id: "nd-publish-15",
    q: ["A library bundles all its dependencies into one `dist/index.js` and declares none. What do its users lose?", "Une bibliothèque regroupe toutes ses dépendances dans un seul `dist/index.js` et n'en déclare aucune. Que perdent ses utilisateurs ?", "Una biblioteca empaqueta todas sus dependencias en un solo `dist/index.js` y no declara ninguna. ¿Qué pierden sus usuarios?"],
    a: ["Audits and updates no longer see those dependencies, shared ones are duplicated, and a vulnerable copy stays until the library republishes", "Les audits et les mises à jour ne voient plus ces dépendances, celles partagées sont dupliquées, et une copie vulnérable reste jusqu'à une nouvelle publication de la bibliothèque", "Las auditorías y actualizaciones ya no ven esas dependencias, las compartidas se duplican y una copia vulnerable se queda hasta que la biblioteca vuelva a publicar"],
    w: [["Nothing: bundling is always better for libraries", "Rien : regrouper est toujours mieux pour les bibliothèques", "Nada: empaquetar siempre es mejor para las bibliotecas"], ["The ability to import the library at all", "La possibilité même d'importer la bibliothèque", "La posibilidad misma de importar la biblioteca"], ["Only some download speed", "Seulement un peu de vitesse de téléchargement", "Solo algo de velocidad de descarga"]],
    e: [
      "Bundling suits applications and CLIs, where one artifact ships. A library should declare its dependencies so the user's package manager can deduplicate, patch and audit them. Small, rarely changing helpers are the usual exception.",
      "Regrouper convient aux applications et aux outils en ligne de commande, où un seul artefact est livré. Une bibliothèque devrait déclarer ses dépendances pour que le gestionnaire de paquets de l'utilisateur puisse les dédoublonner, les corriger et les auditer. Les petits utilitaires qui changent rarement sont l'exception habituelle.",
      "Empaquetar conviene a las aplicaciones y herramientas de línea de comandos, donde se entrega un solo artefacto. Una biblioteca debería declarar sus dependencias para que el gestor de paquetes del usuario pueda deduplicarlas, parchearlas y auditarlas. Las pequeñas utilidades que cambian poco son la excepción habitual.",
    ],
  },
  {
    id: "nd-publish-16",
    q: ["Before a release, which tools check that a package's `exports`, files and types will work for consumers?", "Avant une publication, quels outils vérifient que les `exports`, les fichiers et les types d'un paquet marcheront pour ses utilisateurs ?", "Antes de publicar, ¿qué herramientas comprueban que los `exports`, archivos y tipos de un paquete funcionarán para quienes lo usen?"],
    a: ["`npm pack` to inspect the tarball, then publint and Are the Types Wrong run on it", "`npm pack` pour inspecter l'archive, puis publint et Are the Types Wrong lancés dessus", "`npm pack` para inspeccionar el archivo comprimido y luego publint y Are the Types Wrong sobre él"],
    w: [["`npm audit`", "`npm audit`", "`npm audit`"], ["`npm outdated`", "`npm outdated`", "`npm outdated`"], ["`node --check index.js` alone", "`node --check index.js` seul", "`node --check index.js` solo"]],
    e: [
      "publint lints `package.json` against how Node and bundlers resolve it; Are the Types Wrong resolves types in each TypeScript mode. Testing the packed tarball in a scratch project, with both `import` and `require`, catches what the repository's own tests cannot.",
      "publint vérifie `package.json` d'après la façon dont Node et les bundlers le résolvent ; Are the Types Wrong résout les types dans chaque mode de TypeScript. Tester l'archive empaquetée dans un projet vierge, avec `import` et `require`, attrape ce que les tests du dépôt ne voient pas.",
      "publint revisa `package.json` según cómo lo resuelven Node y los bundlers; Are the Types Wrong resuelve los tipos en cada modo de TypeScript. Probar el archivo empaquetado en un proyecto vacío, con `import` y `require`, detecta lo que las pruebas del propio repositorio no ven.",
    ],
  },
];

const securityExpert: NodeQuestion[] = [
  {
    id: "nd-security-13",
    q: ["Your company uses an internal, unscoped package `billing-utils` from a private registry. An attacker publishes `billing-utils@99.0.0` on npmjs.org. What is the attack, and the fix?", "Votre entreprise utilise un paquet interne sans portée, `billing-utils`, depuis un registre privé. Un attaquant publie `billing-utils@99.0.0` sur npmjs.org. Quelle est l'attaque, et la parade ?", "Tu empresa usa un paquete interno sin ámbito, `billing-utils`, desde un registro privado. Un atacante publica `billing-utils@99.0.0` en npmjs.org. ¿Cuál es el ataque y la solución?"],
    a: ["Dependency confusion: a resolver that checks both registries picks the higher public version; use a scope mapped to the private registry, such as `@acme:registry=…`", "La confusion de dépendances : un résolveur qui consulte les deux registres prend la version publique plus haute ; utiliser une portée liée au registre privé, comme `@acme:registry=…`", "La confusión de dependencias: un resolvedor que consulta los dos registros elige la versión pública más alta; usar un ámbito asociado al registro privado, como `@acme:registry=…`"],
    w: [["Typosquatting; fix it by checking spelling", "Du typosquatting ; on le corrige en vérifiant l'orthographe", "Typosquatting; se arregla revisando la ortografía"], ["A denial of service on the registry", "Un déni de service sur le registre", "Una denegación de servicio sobre el registro"], ["Nothing happens: version 99 is invalid", "Rien ne se passe : la version 99 est invalide", "No pasa nada: la versión 99 no es válida"]],
    e: [
      "Scopes tie names to a registry in `.npmrc`, so internal packages are never fetched from the public one. Owning the scope on npmjs.org too, and a proxy that never forwards internal names, close the gap.",
      "Les portées lient des noms à un registre dans `.npmrc` : les paquets internes ne sont jamais pris sur le registre public. Posséder aussi la portée sur npmjs.org, et un proxy qui ne transmet jamais les noms internes, ferment la brèche.",
      "Los ámbitos asocian nombres a un registro en `.npmrc`, así que los paquetes internos nunca se toman del registro público. Ser también dueño del ámbito en npmjs.org y tener un proxy que nunca reenvíe los nombres internos cierran el hueco.",
    ],
  },
  {
    id: "nd-security-14",
    q: ["A pull request changes only `package-lock.json`: one `resolved` URL now points to an unknown host, with a matching `integrity`. What is the risk?", "Une pull request ne change que `package-lock.json` : une URL `resolved` pointe désormais vers un hôte inconnu, avec un `integrity` assorti. Quel est le risque ?", "Un pull request solo cambia `package-lock.json`: una URL `resolved` apunta ahora a un host desconocido, con un `integrity` a juego. ¿Cuál es el riesgo?"],
    a: ["Lockfile injection: the next `npm ci` installs the attacker's tarball, which the hash matches; lint lockfiles for allowed hosts and review their diffs", "L'injection de lockfile : le prochain `npm ci` installe l'archive de l'attaquant, à laquelle l'empreinte correspond ; vérifier les hôtes permis dans les lockfiles et relire leurs diffs", "La inyección en el lockfile: el próximo `npm ci` instala el archivo del atacante, con el que coincide el hash; validar los hosts permitidos en los lockfiles y revisar sus diffs"],
    w: [["None: the `integrity` field proves the tarball is safe", "Aucun : le champ `integrity` prouve que l'archive est sûre", "Ninguno: el campo `integrity` demuestra que el archivo es seguro"], ["None: npm ignores `resolved`", "Aucun : npm ignore `resolved`", "Ninguno: npm ignora `resolved`"], ["Only a slower install", "Seulement une installation plus lente", "Solo una instalación más lenta"]],
    e: [
      "Hashes prove consistency, not origin: the attacker computed the hash of their own file. Lockfile diffs are long and rarely read. Tools such as lockfile-lint check hosts and schemes in CI, and a registry proxy refuses unknown hosts.",
      "Les empreintes prouvent la cohérence, pas l'origine : l'attaquant a calculé l'empreinte de son propre fichier. Les diffs de lockfile sont longs et rarement lus. Des outils comme lockfile-lint vérifient hôtes et schémas en CI, et un proxy de registre refuse les hôtes inconnus.",
      "Los hashes demuestran coherencia, no origen: el atacante calculó el hash de su propio archivo. Los diffs de lockfile son largos y casi nadie los lee. Herramientas como lockfile-lint comprueban hosts y esquemas en la CI, y un proxy de registro rechaza los hosts desconocidos.",
    ],
  },
  {
    id: "nd-security-15",
    q: ["How should a CI job give npm a token for a private registry?", "Comment un job de CI doit-il donner à npm un jeton pour un registre privé ?", "¿Cómo debe un job de CI dar a npm un token para un registro privado?"],
    a: ["Commit an `.npmrc` with `//npm.acme.dev/:_authToken=${NPM_TOKEN}` and inject `NPM_TOKEN` as a secret at run time", "Commiter un `.npmrc` avec `//npm.acme.dev/:_authToken=${NPM_TOKEN}` et injecter `NPM_TOKEN` comme secret à l'exécution", "Hacer commit de un `.npmrc` con `//npm.acme.dev/:_authToken=${NPM_TOKEN}` e inyectar `NPM_TOKEN` como secreto en ejecución"],
    w: [["Commit the token itself in `.npmrc`, since the repository is private", "Commiter le jeton lui-même dans `.npmrc`, puisque le dépôt est privé", "Hacer commit del propio token en `.npmrc`, ya que el repositorio es privado"], ["Put the token in `package.json` under `publishConfig`", "Mettre le jeton dans `package.json` sous `publishConfig`", "Poner el token en `package.json` bajo `publishConfig`"], ["Pass it as `npm ci --token` so it shows in the logs for debugging", "Le passer en `npm ci --token` pour qu'il apparaisse dans les journaux, pour le débogage", "Pasarlo con `npm ci --token` para que salga en los registros y depurar"]],
    e: [
      "npm expands environment variables in `.npmrc`, so the file holds a reference, not the secret. Give the token read-only scope and a short life, and keep it away from steps that run untrusted code, such as install scripts of dependencies.",
      "npm développe les variables d'environnement dans `.npmrc` : le fichier contient une référence, pas le secret. Donnez au jeton une portée en lecture seule et une courte durée de vie, et tenez-le loin des étapes qui exécutent du code non fiable, comme les scripts d'installation des dépendances.",
      "npm expande las variables de entorno en `.npmrc`, así que el archivo guarda una referencia, no el secreto. Da al token permisos de solo lectura y una vida corta, y mantenlo lejos de los pasos que ejecutan código no fiable, como los scripts de instalación de las dependencias.",
    ],
  },
  {
    id: "nd-security-16",
    q: ["In 2025, attackers stole an npm publish token from a popular monorepo through a GitHub workflow triggered by `pull_request_target`. What made that possible?", "En 2025, des attaquants ont volé un jeton de publication npm d'un monorepo populaire via un workflow GitHub déclenché par `pull_request_target`. Qu'est-ce qui l'a permis ?", "En 2025, unos atacantes robaron un token de publicación de npm de un monorepo popular mediante un workflow de GitHub disparado por `pull_request_target`. ¿Qué lo hizo posible?"],
    a: ["That trigger runs with the base repository's secrets, and the workflow put untrusted pull request content into a shell command", "Ce déclencheur tourne avec les secrets du dépôt de base, et le workflow insérait du contenu non fiable de la pull request dans une commande shell", "Ese disparador se ejecuta con los secretos del repositorio base, y el workflow metía contenido no fiable del pull request en un comando de shell"],
    w: [["A weakness in npm's password hashing", "Une faiblesse du hachage des mots de passe de npm", "Una debilidad en el hash de contraseñas de npm"], ["Dependabot publishing on the maintainers' behalf", "Dependabot qui publiait au nom des mainteneurs", "Dependabot publicando en nombre de los mantenedores"], ["A typo in the package name", "Une faute de frappe dans le nom du paquet", "Una errata en el nombre del paquete"]],
    e: [
      "`pull_request_target` exists to label or comment on forks' pull requests, with write access and secrets; it must never run or interpolate their code. The stolen token published versions that hunted for secrets on developers' machines. Trusted publishing with a protected environment removes the token to steal.",
      "`pull_request_target` sert à étiqueter ou commenter les pull requests venues de forks, avec accès en écriture et secrets ; il ne doit jamais exécuter ni interpoler leur code. Le jeton volé a publié des versions qui cherchaient des secrets sur les machines des développeurs. La publication de confiance avec un environnement protégé supprime le jeton à voler.",
      "`pull_request_target` sirve para etiquetar o comentar pull requests de forks, con acceso de escritura y secretos; nunca debe ejecutar ni interpolar su código. El token robado publicó versiones que buscaban secretos en las máquinas de los desarrolladores. La publicación de confianza con un entorno protegido elimina el token que robar.",
    ],
  },
];

export const runtime = { runtimeExpert };
export const modules = { modulesExpert };
export const async = { asyncExpert };
export const apis = { apisExpert };
export const packages = { packagesExpert };
export const deps = { depsExpert };
export const publish = { publishExpert };
export const security = { securityExpert };
