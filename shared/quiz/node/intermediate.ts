/**
 * Node.js and npm, Intermédiaire: the release schedule, `engines` and
 * `node --run`, exit codes, `import.meta.dirname`, `require(esm)`, JSON
 * imports, the order of microtasks, rejections and `pipeline`, `--env-file`,
 * the test runner and `fetch`, ranges on 0.x, hooks and peers, `npm ci`,
 * overrides and workspaces, `npm version`, `exports`, types and dist-tags,
 * tokens after 2025, `audit fix --force` and integrity hashes.
 * Code between backticks is the same in the three languages.
 */
import type { LinuxQuestion as NodeQuestion } from "../linux/types";

const runtimePractice: NodeQuestion[] = [
  {
    id: "nd-runtime-05",
    q: ["How does the Node.js release schedule work from Node 27 on?", "Comment fonctionne le calendrier de Node.js à partir de Node 27 ?", "¿Cómo funciona el calendario de Node.js a partir de Node 27?"],
    a: ["One major a year, released in April after six months of alphas, which becomes LTS in October; every line becomes LTS", "Une version majeure par an, publiée en avril après six mois d'alphas, qui devient LTS en octobre ; chaque ligne devient LTS", "Una versión mayor al año, publicada en abril tras seis meses de alphas, que pasa a LTS en octubre; todas las líneas pasan a LTS"],
    w: [["Two majors a year, and only even numbers become LTS", "Deux majeures par an, et seuls les numéros pairs deviennent LTS", "Dos mayores al año, y solo los números pares pasan a LTS"], ["A new major every month, with no LTS", "Une nouvelle majeure chaque mois, sans LTS", "Una mayor nueva cada mes, sin LTS"], ["Majors only when the V8 engine changes its own major", "Des majeures seulement quand le moteur V8 change de majeure", "Mayores solo cuando el motor V8 cambia de mayor"]],
    e: [
      "Node 26 is the last line of the old model (two majors a year, even ones becoming LTS). From 27, published in April 2027, each line is Current for six months, then LTS for thirty, and its number matches the year. Alphas, from October, are for testing, not production.",
      "Node 26 est la dernière ligne de l'ancien modèle (deux majeures par an, les paires devenant LTS). À partir de 27, publiée en avril 2027, chaque ligne est Current six mois, puis LTS trente mois, et son numéro correspond à l'année. Les alphas, dès octobre, servent aux tests, pas à la production.",
      "Node 26 es la última línea del modelo anterior (dos mayores al año, las pares pasaban a LTS). Desde la 27, publicada en abril de 2027, cada línea es Current seis meses y luego LTS treinta, y su número coincide con el año. Las alphas, desde octubre, son para pruebas, no para producción.",
    ],
  },
  {
    id: "nd-runtime-06",
    q: ["`package.json` has `\"engines\": { \"node\": \">=22\" }` and someone installs with Node 20. What does npm do by default?", "`package.json` a `\"engines\": { \"node\": \">=22\" }` et quelqu'un installe avec Node 20. Que fait npm par défaut ?", "`package.json` tiene `\"engines\": { \"node\": \">=22\" }` y alguien instala con Node 20. ¿Qué hace npm por defecto?"],
    a: ["It prints an `EBADENGINE` warning and installs anyway, unless `engine-strict` is set", "Il affiche un avertissement `EBADENGINE` et installe quand même, sauf si `engine-strict` est activé", "Muestra un aviso `EBADENGINE` e instala de todos modos, salvo que esté activado `engine-strict`"],
    w: [["It downloads Node 22 automatically", "Il télécharge Node 22 automatiquement", "Descarga Node 22 automáticamente"], ["It refuses to install, always", "Il refuse d'installer, toujours", "Se niega a instalar, siempre"], ["Nothing: the field is only documentation for humans", "Rien : le champ n'est qu'une documentation pour les humains", "Nada: el campo es solo documentación para personas"]],
    e: [
      "`engines` states which Node versions the code supports. npm warns; `engine-strict=true` in `.npmrc` makes it an error. Pair it with `.nvmrc` for developers and the same version in CI and the container image.",
      "`engines` indique les versions de Node que le code prend en charge. npm avertit ; `engine-strict=true` dans `.npmrc` en fait une erreur. Associez-le à `.nvmrc` pour les développeurs et à la même version en CI et dans l'image de conteneur.",
      "`engines` indica qué versiones de Node admite el código. npm avisa; `engine-strict=true` en `.npmrc` lo convierte en error. Combínalo con `.nvmrc` para el equipo y la misma versión en la CI y en la imagen del contenedor.",
    ],
  },
  {
    id: "nd-runtime-07",
    q: ["What does `node --run build` do?", "Que fait `node --run build` ?", "¿Qué hace `node --run build`?"],
    a: ["It runs the `build` script of `package.json` directly, faster than `npm run` and without its pre and post hooks", "Il lance directement le script `build` de `package.json`, plus vite que `npm run` et sans ses hooks pre et post", "Ejecuta directamente el script `build` de `package.json`, más rápido que `npm run` y sin sus hooks pre y post"],
    w: [["It compiles the project with a built-in bundler", "Il compile le projet avec un bundler intégré", "Compila el proyecto con un bundler integrado"], ["It runs a file named `build.js`", "Il lance un fichier nommé `build.js`", "Ejecuta un archivo llamado `build.js`"], ["It installs the dependencies listed under `build`", "Il installe les dépendances listées sous `build`", "Instala las dependencias listadas bajo `build`"]],
    e: [
      "Node 22 added a script runner: it adds `node_modules/.bin` to the `PATH` like npm, but skips npm's startup and lifecycle hooks such as `prebuild`. Useful for short scripts run often; keep `npm run` when you rely on the hooks.",
      "Node 22 a ajouté un lanceur de scripts : il met `node_modules/.bin` dans le `PATH` comme npm, mais saute le démarrage de npm et les hooks de cycle de vie comme `prebuild`. Utile pour des scripts courts lancés souvent ; gardez `npm run` si vous comptez sur les hooks.",
      "Node 22 añadió un lanzador de scripts: añade `node_modules/.bin` al `PATH` como npm, pero se salta el arranque de npm y los hooks de ciclo de vida como `prebuild`. Útil para scripts cortos que se ejecutan a menudo; usa `npm run` si dependes de los hooks.",
    ],
  },
  {
    id: "nd-runtime-08",
    q: ["A CLI must exit with an error code after printing a long report. Why prefer `process.exitCode = 1` to `process.exit(1)`?", "Un outil en ligne de commande doit sortir avec un code d'erreur après avoir affiché un long rapport. Pourquoi préférer `process.exitCode = 1` à `process.exit(1)` ?", "Una herramienta de línea de comandos debe salir con código de error tras mostrar un informe largo. ¿Por qué preferir `process.exitCode = 1` a `process.exit(1)`?"],
    a: ["`process.exit` stops at once and can cut off output still being written; `exitCode` lets Node finish, then exit with that code", "`process.exit` arrête tout de suite et peut couper une sortie en cours d'écriture ; `exitCode` laisse Node finir, puis sortir avec ce code", "`process.exit` para de inmediato y puede cortar la salida que aún se escribe; `exitCode` deja que Node termine y luego salga con ese código"],
    w: [["`process.exit(1)` is deprecated", "`process.exit(1)` est déprécié", "`process.exit(1)` está obsoleto"], ["`exitCode` also restarts the process", "`exitCode` relance aussi le processus", "`exitCode` también reinicia el proceso"], ["There is no difference", "Il n'y a aucune différence", "No hay diferencia"]],
    e: [
      "Writes to a pipe can be asynchronous, so an abrupt exit may lose the end of the report. Setting `exitCode` and returning lets pending work drain. Exit codes matter: CI and shell scripts read them, 0 meaning success.",
      "Les écritures vers un pipe peuvent être asynchrones : une sortie brutale peut perdre la fin du rapport. Fixer `exitCode` et revenir laisse le travail en attente se vider. Les codes de sortie comptent : la CI et les scripts shell les lisent, 0 voulant dire succès.",
      "Las escrituras a un pipe pueden ser asíncronas, así que una salida brusca puede perder el final del informe. Fijar `exitCode` y volver deja que termine el trabajo pendiente. Los códigos de salida importan: la CI y los scripts de shell los leen, y 0 significa éxito.",
    ],
  },
];

const modulesPractice: NodeQuestion[] = [
  {
    id: "nd-modules-05",
    q: ["In an ES module, `__dirname` is not defined. What replaces it?", "Dans un module ES, `__dirname` n'est pas défini. Qu'est-ce qui le remplace ?", "En un módulo ES, `__dirname` no está definido. ¿Qué lo sustituye?"],
    a: ["`import.meta.dirname`, and `import.meta.filename` for the file", "`import.meta.dirname`, et `import.meta.filename` pour le fichier", "`import.meta.dirname`, e `import.meta.filename` para el archivo"],
    w: [["`process.cwd()`, which is the same thing", "`process.cwd()`, qui est la même chose", "`process.cwd()`, que es lo mismo"], ["`require.main.path`", "`require.main.path`", "`require.main.path`"], ["Nothing: ESM cannot know its own location", "Rien : l'ESM ne peut pas connaître son propre emplacement", "Nada: ESM no puede conocer su propia ubicación"]],
    e: [
      "`import.meta.url` gives the module's `file:` URL; since Node 20.11, `dirname` and `filename` give paths directly. `process.cwd()` is where the process was started, which differs as soon as you run from another folder.",
      "`import.meta.url` donne l'URL `file:` du module ; depuis Node 20.11, `dirname` et `filename` donnent directement les chemins. `process.cwd()` est le dossier où le processus a été lancé, différent dès qu'on lance depuis un autre dossier.",
      "`import.meta.url` da la URL `file:` del módulo; desde Node 20.11, `dirname` y `filename` dan las rutas directamente. `process.cwd()` es la carpeta desde la que se lanzó el proceso, distinta en cuanto se ejecuta desde otra carpeta.",
    ],
  },
  {
    id: "nd-modules-06",
    q: ["A CommonJS app needs a package that ships only ESM. On Node 22.12 or later, what works?", "Une application CommonJS a besoin d'un paquet publié uniquement en ESM. Sur Node 22.12 ou plus récent, qu'est-ce qui marche ?", "Una app CommonJS necesita un paquete que solo se publica como ESM. En Node 22.12 o posterior, ¿qué funciona?"],
    a: ["`require()` it directly, as long as the module has no top-level `await`", "Le charger directement avec `require()`, tant que le module n'a pas d'`await` au niveau supérieur", "Cargarlo directamente con `require()`, siempre que el módulo no tenga `await` en el nivel superior"],
    w: [["Nothing: CommonJS can never load ESM", "Rien : CommonJS ne peut jamais charger de l'ESM", "Nada: CommonJS nunca puede cargar ESM"], ["Only by converting the whole app to TypeScript", "Seulement en convertissant toute l'application en TypeScript", "Solo convirtiendo toda la app a TypeScript"], ["Only `require()` with the `--experimental-vm-modules` flag", "Seulement `require()` avec l'option `--experimental-vm-modules`", "Solo `require()` con la opción `--experimental-vm-modules`"]],
    e: [
      "`require(esm)` is enabled by default since Node 22.12 and 20.19. It returns the module namespace. A module with top-level `await` cannot load synchronously; use `await import()` for it. This removed the main reason to publish packages twice.",
      "`require(esm)` est activé par défaut depuis Node 22.12 et 20.19. Il renvoie l'espace de noms du module. Un module avec `await` au niveau supérieur ne peut pas se charger de façon synchrone ; utilisez `await import()` pour lui. Cela a supprimé la raison principale de publier les paquets en double.",
      "`require(esm)` está activado por defecto desde Node 22.12 y 20.19. Devuelve el espacio de nombres del módulo. Un módulo con `await` en el nivel superior no puede cargarse de forma síncrona; para él, usa `await import()`. Esto eliminó el motivo principal de publicar los paquetes por duplicado.",
    ],
  },
  {
    id: "nd-modules-07",
    q: ["How do you import a JSON file in an ES module?", "Comment importer un fichier JSON dans un module ES ?", "¿Cómo se importa un archivo JSON en un módulo ES?"],
    a: ["`import config from \"./config.json\" with { type: \"json\" }`", "`import config from \"./config.json\" with { type: \"json\" }`", "`import config from \"./config.json\" with { type: \"json\" }`"],
    w: [["`import config from \"./config.json\"`, with nothing more", "`import config from \"./config.json\"`, sans rien de plus", "`import config from \"./config.json\"`, sin nada más"], ["`import json \"./config.json\"`", "`import json \"./config.json\"`", "`import json \"./config.json\"`"], ["`const config = import.json(\"./config.json\")`", "`const config = import.json(\"./config.json\")`", "`const config = import.json(\"./config.json\")`"]],
    e: [
      "Import attributes tell the loader what kind of resource to expect, so a server cannot slip executable code in place of data. Reading the file with `readFile` and `JSON.parse` remains a fine choice, especially for files that change at run time.",
      "Les attributs d'import disent au chargeur quel type de ressource attendre, pour qu'un serveur ne puisse pas glisser du code exécutable à la place de données. Lire le fichier avec `readFile` et `JSON.parse` reste un bon choix, surtout pour des fichiers qui changent à l'exécution.",
      "Los atributos de importación dicen al cargador qué tipo de recurso esperar, para que un servidor no pueda colar código ejecutable en lugar de datos. Leer el archivo con `readFile` y `JSON.parse` sigue siendo buena opción, sobre todo para archivos que cambian en ejecución.",
    ],
  },
  {
    id: "nd-modules-08",
    q: ["What does `const { parse } = await import(\"./parser.js\")` give that a static `import` does not?", "Qu'apporte `const { parse } = await import(\"./parser.js\")` qu'un `import` statique ne donne pas ?", "¿Qué aporta `const { parse } = await import(\"./parser.js\")` que un `import` estático no da?"],
    a: ["The module is loaded only when that line runs, and the path can be computed; it also works from CommonJS", "Le module n'est chargé que quand cette ligne s'exécute, et le chemin peut être calculé ; cela marche aussi depuis CommonJS", "El módulo solo se carga cuando se ejecuta esa línea y la ruta puede calcularse; también funciona desde CommonJS"],
    w: [["It loads the module synchronously, faster", "Il charge le module de façon synchrone, plus vite", "Carga el módulo de forma síncrona, más rápido"], ["It copies the module so changes are not shared", "Il copie le module pour que les changements ne soient pas partagés", "Copia el módulo para que los cambios no se compartan"], ["Nothing: it is older syntax for the same thing", "Rien : c'est une syntaxe plus ancienne pour la même chose", "Nada: es una sintaxis más antigua para lo mismo"]],
    e: [
      "Dynamic `import()` returns a promise for the module namespace. It suits optional features, plugins chosen at run time and heavy modules needed rarely, and shortens startup. Static imports stay better for tools that analyse the graph.",
      "L'`import()` dynamique renvoie une promesse de l'espace de noms du module. Il convient aux fonctionnalités optionnelles, aux plugins choisis à l'exécution et aux modules lourds rarement utiles, et raccourcit le démarrage. Les imports statiques restent meilleurs pour les outils qui analysent le graphe.",
      "El `import()` dinámico devuelve una promesa del espacio de nombres del módulo. Encaja con funciones opcionales, plugins elegidos en ejecución y módulos pesados poco usados, y acorta el arranque. Los imports estáticos siguen siendo mejores para las herramientas que analizan el grafo.",
    ],
  },
];

const asyncPractice: NodeQuestion[] = [
  {
    id: "nd-async-05",
    q: ["In a CommonJS script, what does this print? `setTimeout(() => log(\"timeout\")); Promise.resolve().then(() => log(\"promise\")); process.nextTick(() => log(\"tick\"));`", "Dans un script CommonJS, qu'affiche ceci ? `setTimeout(() => log(\"timeout\")); Promise.resolve().then(() => log(\"promise\")); process.nextTick(() => log(\"tick\"));`", "En un script CommonJS, ¿qué muestra esto? `setTimeout(() => log(\"timeout\")); Promise.resolve().then(() => log(\"promise\")); process.nextTick(() => log(\"tick\"));`"],
    a: ["tick, promise, timeout", "tick, promise, timeout", "tick, promise, timeout"],
    w: [["timeout, promise, tick", "timeout, promise, tick", "timeout, promise, tick"], ["promise, tick, timeout", "promise, tick, timeout", "promise, tick, timeout"], ["The order changes on every run", "L'ordre change à chaque exécution", "El orden cambia en cada ejecución"]],
    e: [
      "After the current script, Node empties the `nextTick` queue, then the promise microtasks, and only then moves on to timers. In an ES module the script itself runs as a microtask, so promise callbacks may come before `nextTick`: one more reason not to depend on this order.",
      "Après le script en cours, Node vide la file `nextTick`, puis les microtâches des promesses, et seulement ensuite passe aux minuteurs. Dans un module ES, le script lui-même s'exécute comme une microtâche, si bien que les callbacks de promesses peuvent passer avant `nextTick` : une raison de plus de ne pas dépendre de cet ordre.",
      "Tras el script actual, Node vacía la cola de `nextTick`, luego las microtareas de las promesas y solo después pasa a los temporizadores. En un módulo ES el propio script corre como microtarea, así que los callbacks de promesas pueden ir antes que `nextTick`: un motivo más para no depender de este orden.",
    ],
  },
  {
    id: "nd-async-06",
    q: ["`await Promise.all([a(), b(), c()])`: `b()` rejects. What happens?", "`await Promise.all([a(), b(), c()])` : `b()` est rejetée. Que se passe-t-il ?", "`await Promise.all([a(), b(), c()])`: `b()` se rechaza. ¿Qué pasa?"],
    a: ["The `await` throws `b`'s error at once; `a` and `c` keep running but their results are lost", "L'`await` lève aussitôt l'erreur de `b` ; `a` et `c` continuent de tourner mais leurs résultats sont perdus", "El `await` lanza de inmediato el error de `b`; `a` y `c` siguen ejecutándose pero sus resultados se pierden"],
    w: [["`a` and `c` are cancelled automatically", "`a` et `c` sont annulées automatiquement", "`a` y `c` se cancelan automáticamente"], ["The `await` returns the two results that succeeded", "L'`await` renvoie les deux résultats réussis", "El `await` devuelve los dos resultados que salieron bien"], ["Node retries `b` three times", "Node relance `b` trois fois", "Node reintenta `b` tres veces"]],
    e: [
      "Promises are not cancellable by themselves: the other operations go on. `Promise.allSettled` waits for all and reports each outcome; to stop the others, pass them an `AbortSignal` and abort it on the first failure.",
      "Les promesses ne s'annulent pas d'elles-mêmes : les autres opérations continuent. `Promise.allSettled` attend tout et donne chaque issue ; pour arrêter les autres, passez-leur un `AbortSignal` et annulez-le au premier échec.",
      "Las promesas no se cancelan solas: las demás operaciones siguen. `Promise.allSettled` espera a todas e informa de cada resultado; para parar las demás, pásales un `AbortSignal` y abórtalo al primer fallo.",
    ],
  },
  {
    id: "nd-async-07",
    q: ["A promise rejects and nothing catches it. What does current Node do by default?", "Une promesse est rejetée et rien ne l'attrape. Que fait Node par défaut aujourd'hui ?", "Una promesa se rechaza y nada la captura. ¿Qué hace Node por defecto hoy?"],
    a: ["It prints the error and ends the process with a non-zero exit code", "Il affiche l'erreur et termine le processus avec un code de sortie non nul", "Muestra el error y termina el proceso con un código de salida distinto de cero"],
    w: [["It ignores it silently", "Il l'ignore en silence", "La ignora en silencio"], ["It prints a warning and continues", "Il affiche un avertissement et continue", "Muestra un aviso y continúa"], ["It retries the promise", "Il relance la promesse", "Reintenta la promesa"]],
    e: [
      "Since Node 15, an unhandled rejection is treated like an uncaught exception. A forgotten `await` or a missing `.catch` therefore crashes a server, which is safer than continuing in an unknown state; a supervisor restarts it.",
      "Depuis Node 15, un rejet non géré est traité comme une exception non attrapée. Un `await` oublié ou un `.catch` manquant fait donc tomber un serveur, ce qui est plus sûr que de continuer dans un état inconnu ; un superviseur le relance.",
      "Desde Node 15, un rechazo no gestionado se trata como una excepción no capturada. Un `await` olvidado o un `.catch` que falta hacen caer un servidor, lo que es más seguro que seguir en un estado desconocido; un supervisor lo reinicia.",
    ],
  },
  {
    id: "nd-async-08",
    q: ["How do you copy a large file through gzip, handling errors and memory correctly?", "Comment copier un gros fichier à travers gzip, en gérant correctement les erreurs et la mémoire ?", "¿Cómo copias un archivo grande a través de gzip, gestionando bien los errores y la memoria?"],
    a: ["`await pipeline(createReadStream(src), createGzip(), createWriteStream(dst))`, with `pipeline` from `node:stream/promises`", "`await pipeline(createReadStream(src), createGzip(), createWriteStream(dst))`, avec `pipeline` de `node:stream/promises`", "`await pipeline(createReadStream(src), createGzip(), createWriteStream(dst))`, con `pipeline` de `node:stream/promises`"],
    w: [["Read the whole file with `readFile`, compress the buffer, write it", "Lire tout le fichier avec `readFile`, compresser le buffer, l'écrire", "Leer todo el archivo con `readFile`, comprimir el buffer y escribirlo"], ["Chain `.pipe()` calls and ignore errors", "Enchaîner des appels `.pipe()` et ignorer les erreurs", "Encadenar llamadas a `.pipe()` e ignorar los errores"], ["Loop on `readSync` with a 1-byte buffer", "Boucler sur `readSync` avec un buffer d'un octet", "Iterar sobre `readSync` con un buffer de 1 byte"]],
    e: [
      "Streams process data in chunks, so memory stays flat whatever the file size, and backpressure slows the reader when the writer lags. `pipeline` forwards an error from any stage, destroys all streams and rejects; bare `.pipe()` leaks streams on error.",
      "Les flux traitent les données par morceaux : la mémoire reste stable quelle que soit la taille du fichier, et la contre-pression ralentit la lecture quand l'écriture prend du retard. `pipeline` transmet l'erreur de n'importe quelle étape, détruit tous les flux et rejette ; un `.pipe()` seul laisse fuir des flux en cas d'erreur.",
      "Los streams procesan los datos por trozos, así que la memoria se mantiene estable sea cual sea el tamaño, y la contrapresión frena la lectura cuando la escritura se retrasa. `pipeline` propaga el error de cualquier etapa, destruye todos los streams y rechaza; un `.pipe()` solo deja streams abiertos cuando hay error.",
    ],
  },
];

const apisPractice: NodeQuestion[] = [
  {
    id: "nd-apis-05",
    q: ["How do you load a `.env` file without installing a package?", "Comment charger un fichier `.env` sans installer de paquet ?", "¿Cómo se carga un archivo `.env` sin instalar ningún paquete?"],
    a: ["`node --env-file=.env app.js`, which fills `process.env` before the code runs", "`node --env-file=.env app.js`, qui remplit `process.env` avant que le code s'exécute", "`node --env-file=.env app.js`, que rellena `process.env` antes de que se ejecute el código"],
    w: [["`import \".env\"` at the top of the app", "`import \".env\"` en haut de l'application", "`import \".env\"` al principio de la app"], ["Node reads `.env` automatically in every folder", "Node lit `.env` automatiquement dans chaque dossier", "Node lee `.env` automáticamente en cada carpeta"], ["`npm install .env`", "`npm install .env`", "`npm install .env`"]],
    e: [
      "Since Node 20.6, `--env-file` reads `KEY=value` lines; `--env-file-if-exists` does not fail when the file is missing, and `process.loadEnvFile()` does it from code. Variables already set in the environment win, which lets production override the file.",
      "Depuis Node 20.6, `--env-file` lit des lignes `CLE=valeur` ; `--env-file-if-exists` n'échoue pas quand le fichier manque, et `process.loadEnvFile()` le fait depuis le code. Les variables déjà présentes dans l'environnement l'emportent, ce qui permet à la production de remplacer le fichier.",
      "Desde Node 20.6, `--env-file` lee líneas `CLAVE=valor`; `--env-file-if-exists` no falla si el archivo no existe, y `process.loadEnvFile()` lo hace desde el código. Las variables ya presentes en el entorno ganan, lo que permite a producción sustituir el archivo.",
    ],
  },
  {
    id: "nd-apis-06",
    q: ["Which tests run with `node --test`, and with what?", "Quels tests tourne `node --test`, et avec quoi ?", "¿Qué pruebas ejecuta `node --test`, y con qué?"],
    a: ["Files named like `*.test.js`, written with `test` from `node:test` and `assert` from `node:assert`, with no package to install", "Les fichiers nommés comme `*.test.js`, écrits avec `test` de `node:test` et `assert` de `node:assert`, sans paquet à installer", "Los archivos con nombres como `*.test.js`, escritos con `test` de `node:test` y `assert` de `node:assert`, sin paquetes que instalar"],
    w: [["Only Jest tests, which it downloads on first use", "Seulement des tests Jest, qu'il télécharge à la première utilisation", "Solo pruebas de Jest, que descarga la primera vez"], ["Every `.js` file in the project, as a test", "Chaque fichier `.js` du projet, comme un test", "Cada archivo `.js` del proyecto, como una prueba"], ["Only tests written in a `test` folder in Python", "Seulement des tests écrits dans un dossier `test` en Python", "Solo pruebas escritas en una carpeta `test` en Python"]],
    e: [
      "The built-in runner is stable since Node 20: `describe`, `it`, hooks, mocks, snapshots, watch mode and coverage with `--experimental-test-coverage`. Vitest or Jest add more, but small libraries and tools often need nothing else.",
      "Le lanceur intégré est stable depuis Node 20 : `describe`, `it`, hooks, mocks, snapshots, mode watch et couverture avec `--experimental-test-coverage`. Vitest ou Jest en ajoutent davantage, mais les petites bibliothèques et les outils n'ont souvent besoin de rien d'autre.",
      "El ejecutor integrado es estable desde Node 20: `describe`, `it`, hooks, mocks, snapshots, modo watch y cobertura con `--experimental-test-coverage`. Vitest o Jest añaden más, pero las bibliotecas pequeñas y las herramientas a menudo no necesitan nada más.",
    ],
  },
  {
    id: "nd-apis-07",
    q: ["How do you make an HTTP request from current Node without a library?", "Comment faire une requête HTTP depuis Node aujourd'hui sans bibliothèque ?", "¿Cómo se hace una petición HTTP desde Node hoy sin bibliotecas?"],
    a: ["With the global `fetch`, as in a browser: `const res = await fetch(url)`", "Avec le `fetch` global, comme dans un navigateur : `const res = await fetch(url)`", "Con el `fetch` global, como en un navegador: `const res = await fetch(url)`"],
    w: [["Only with the `axios` package", "Seulement avec le paquet `axios`", "Solo con el paquete `axios`"], ["With `XMLHttpRequest`, which Node provides", "Avec `XMLHttpRequest`, que Node fournit", "Con `XMLHttpRequest`, que Node proporciona"], ["With `http.fetch`, after `import http`", "Avec `http.fetch`, après `import http`", "Con `http.fetch`, tras `import http`"]],
    e: [
      "`fetch` is global since Node 18 and stable since 21, built on the undici client. Check `res.ok`: an HTTP 404 or 500 does not reject, only network failures do. Add a timeout with `AbortSignal.timeout(5000)`.",
      "`fetch` est global depuis Node 18 et stable depuis 21, construit sur le client undici. Vérifiez `res.ok` : un HTTP 404 ou 500 ne rejette pas, seules les pannes réseau le font. Ajoutez un délai avec `AbortSignal.timeout(5000)`.",
      "`fetch` es global desde Node 18 y estable desde la 21, construido sobre el cliente undici. Comprueba `res.ok`: un HTTP 404 o 500 no rechaza, solo lo hacen los fallos de red. Añade un tiempo límite con `AbortSignal.timeout(5000)`.",
    ],
  },
  {
    id: "nd-apis-08",
    q: ["What does `path.resolve(\"data\", \"users.json\")` return?", "Que renvoie `path.resolve(\"data\", \"users.json\")` ?", "¿Qué devuelve `path.resolve(\"data\", \"users.json\")`?"],
    a: ["An absolute path: the current working directory, then `data/users.json`", "Un chemin absolu : le dossier de travail courant, puis `data/users.json`", "Una ruta absoluta: el directorio de trabajo actual y luego `data/users.json`"],
    w: [["The relative path `data/users.json`", "Le chemin relatif `data/users.json`", "La ruta relativa `data/users.json`"], ["The content of the file", "Le contenu du fichier", "El contenido del archivo"], ["A path relative to the script's folder, always", "Un chemin relatif au dossier du script, toujours", "Una ruta relativa a la carpeta del script, siempre"]],
    e: [
      "`resolve` builds an absolute path from the right, falling back on `process.cwd()`; `join` only glues segments and normalises them. For files next to the module, start from `import.meta.dirname`, not from the working directory.",
      "`resolve` construit un chemin absolu en partant de la droite, en se rabattant sur `process.cwd()` ; `join` se contente de coller les segments et de les normaliser. Pour des fichiers voisins du module, partez de `import.meta.dirname`, pas du dossier de travail.",
      "`resolve` construye una ruta absoluta desde la derecha, recurriendo a `process.cwd()`; `join` solo une los segmentos y los normaliza. Para archivos junto al módulo, parte de `import.meta.dirname`, no del directorio de trabajo.",
    ],
  },
];

const packagesPractice: NodeQuestion[] = [
  {
    id: "nd-packages-05",
    q: ["What does the tilde in `\"~4.2.1\"` allow?", "Qu'autorise le tilde dans `\"~4.2.1\"` ?", "¿Qué permite la virgulilla en `\"~4.2.1\"`?"],
    a: ["Patch updates only: 4.2.1 and later, below 4.3.0", "Seulement les correctifs : 4.2.1 et au-delà, en dessous de 4.3.0", "Solo parches: 4.2.1 y posteriores, por debajo de 4.3.0"],
    w: [["Any 4.x version from 4.2.1", "Toute version 4.x à partir de 4.2.1", "Cualquier versión 4.x desde 4.2.1"], ["About 4.2.1, give or take one version", "Environ 4.2.1, à une version près", "Aproximadamente 4.2.1, una versión arriba o abajo"], ["Exactly 4.2.1", "Exactement 4.2.1", "Exactamente 4.2.1"]],
    e: [
      "`~` accepts bug fixes, `^` also new features, an exact version nothing else. Ranges matter mostly for libraries, whose users share dependencies; an application's lockfile pins the real versions anyway.",
      "`~` accepte les corrections de bugs, `^` aussi les nouvelles fonctionnalités, une version exacte rien d'autre. Les plages comptent surtout pour les bibliothèques, dont les utilisateurs partagent les dépendances ; le lockfile d'une application fixe de toute façon les vraies versions.",
      "`~` acepta correcciones, `^` también funciones nuevas, una versión exacta nada más. Los rangos importan sobre todo en las bibliotecas, cuyos usuarios comparten dependencias; el lockfile de una aplicación fija de todos modos las versiones reales.",
    ],
  },
  {
    id: "nd-packages-06",
    q: ["A dependency is at `\"^0.8.3\"`. Will `npm update` move it to 0.9.0?", "Une dépendance est à `\"^0.8.3\"`. `npm update` la passera-t-il à 0.9.0 ?", "Una dependencia está en `\"^0.8.3\"`. ¿La pasará `npm update` a 0.9.0?"],
    a: ["No: below 1.0.0 the caret allows only 0.8.x, since a 0.x minor may break things", "Non : en dessous de 1.0.0, l'accent circonflexe n'autorise que 0.8.x, car une mineure 0.x peut casser des choses", "No: por debajo de 1.0.0 el acento circunflejo solo permite 0.8.x, porque una menor 0.x puede romper cosas"],
    w: [["Yes: the caret allows every minor", "Oui : l'accent circonflexe autorise toutes les mineures", "Sí: el acento circunflejo permite todas las menores"], ["Yes, and even 1.0.0", "Oui, et même 1.0.0", "Sí, e incluso 1.0.0"], ["No: 0.x versions are never updated", "Non : les versions 0.x ne sont jamais mises à jour", "No: las versiones 0.x nunca se actualizan"]],
    e: [
      "Semver treats 0.x as unstable: the caret keeps the leftmost non-zero part fixed, so `^0.8.3` means below 0.9.0, and `^0.0.3` means exactly 0.0.3. Moving to 0.9 is a deliberate `npm install pkg@0.9`.",
      "Le semver traite 0.x comme instable : l'accent circonflexe fige la première partie non nulle, donc `^0.8.3` veut dire en dessous de 0.9.0, et `^0.0.3` exactement 0.0.3. Passer à 0.9 se fait volontairement avec `npm install pkg@0.9`.",
      "Semver trata 0.x como inestable: el acento circunflejo fija la primera parte distinta de cero, así que `^0.8.3` significa por debajo de 0.9.0 y `^0.0.3` exactamente 0.0.3. Pasar a 0.9 es un `npm install pkg@0.9` deliberado.",
    ],
  },
  {
    id: "nd-packages-07",
    q: ["`package.json` defines `pretest`, `test` and `posttest`. What does `npm test` run?", "`package.json` définit `pretest`, `test` et `posttest`. Que lance `npm test` ?", "`package.json` define `pretest`, `test` y `posttest`. ¿Qué ejecuta `npm test`?"],
    a: ["`pretest`, then `test`, then `posttest`, stopping at the first failure", "`pretest`, puis `test`, puis `posttest`, en s'arrêtant au premier échec", "`pretest`, luego `test`, luego `posttest`, parando en el primer fallo"],
    w: [["Only `test`: the others must be run by hand", "Seulement `test` : les autres se lancent à la main", "Solo `test`: los demás se ejecutan a mano"], ["All three in parallel", "Les trois en parallèle", "Los tres en paralelo"], ["`posttest` first, as a cleanup", "`posttest` d'abord, pour nettoyer", "`posttest` primero, como limpieza"]],
    e: [
      "npm runs `pre` and `post` scripts around any script of the same name. It is convenient but implicit; many teams prefer one explicit script such as `\"test\": \"npm run lint && vitest\"`. `node --run` does not run them.",
      "npm lance les scripts `pre` et `post` autour de tout script de même nom. C'est pratique mais implicite ; beaucoup d'équipes préfèrent un script explicite comme `\"test\": \"npm run lint && vitest\"`. `node --run` ne les lance pas.",
      "npm ejecuta los scripts `pre` y `post` alrededor de cualquier script con el mismo nombre. Es cómodo pero implícito; muchos equipos prefieren un script explícito como `\"test\": \"npm run lint && vitest\"`. `node --run` no los ejecuta.",
    ],
  },
  {
    id: "nd-packages-08",
    q: ["An ESLint plugin needs ESLint, but the app must choose which ESLint. How does the plugin declare it?", "Un plugin ESLint a besoin d'ESLint, mais c'est l'application qui doit choisir lequel. Comment le plugin le déclare-t-il ?", "Un plugin de ESLint necesita ESLint, pero la app debe elegir cuál. ¿Cómo lo declara el plugin?"],
    a: ["In `peerDependencies`, with the range of ESLint versions it supports", "Dans `peerDependencies`, avec la plage de versions d'ESLint qu'il prend en charge", "En `peerDependencies`, con el rango de versiones de ESLint que admite"],
    w: [["In `dependencies`, so it gets its own copy", "Dans `dependencies`, pour avoir sa propre copie", "En `dependencies`, para tener su propia copia"], ["In `devDependencies` only", "Dans `devDependencies` seulement", "Solo en `devDependencies`"], ["It does not: plugins cannot depend on anything", "Il ne le fait pas : les plugins ne peuvent dépendre de rien", "No lo hace: los plugins no pueden depender de nada"]],
    e: [
      "A peer dependency must be shared with the host: one ESLint, one React. npm 7 and later install peers automatically and stop with `ERESOLVE` when ranges conflict. The plugin usually also lists the host in `devDependencies` for its own tests.",
      "Une dépendance pair doit être partagée avec l'hôte : un seul ESLint, un seul React. npm 7 et plus installent les pairs automatiquement et s'arrêtent avec `ERESOLVE` quand les plages se contredisent. Le plugin met en général aussi l'hôte dans ses `devDependencies` pour ses propres tests.",
      "Una dependencia par debe compartirse con el anfitrión: un solo ESLint, un solo React. npm 7 y posteriores instalan los pares automáticamente y se detienen con `ERESOLVE` cuando los rangos chocan. El plugin suele poner también el anfitrión en `devDependencies` para sus propias pruebas.",
    ],
  },
];

const depsPractice: NodeQuestion[] = [
  {
    id: "nd-deps-05",
    q: ["Why use `npm ci` rather than `npm install` in a CI pipeline?", "Pourquoi utiliser `npm ci` plutôt que `npm install` dans un pipeline de CI ?", "¿Por qué usar `npm ci` en lugar de `npm install` en un pipeline de CI?"],
    a: ["It installs exactly the lockfile, starts from an empty `node_modules`, and fails if the lockfile and `package.json` disagree", "Il installe exactement le lockfile, part d'un `node_modules` vide, et échoue si le lockfile et `package.json` ne concordent pas", "Instala exactamente el lockfile, parte de un `node_modules` vacío y falla si el lockfile y `package.json` no coinciden"],
    w: [["It installs the newest versions allowed by the ranges", "Il installe les versions les plus récentes autorisées par les plages", "Instala las versiones más nuevas que permiten los rangos"], ["It skips installing and uses a global cache only", "Il saute l'installation et utilise seulement un cache global", "Se salta la instalación y usa solo una caché global"], ["It is the same command with a shorter name", "C'est la même commande avec un nom plus court", "Es el mismo comando con un nombre más corto"]],
    e: [
      "`npm install` may update the lockfile to satisfy `package.json`; `npm ci` never writes it. That makes builds reproducible and surfaces a forgotten lockfile commit as a failure instead of a silent difference.",
      "`npm install` peut mettre à jour le lockfile pour satisfaire `package.json` ; `npm ci` ne l'écrit jamais. Les builds deviennent reproductibles, et un commit de lockfile oublié apparaît comme un échec au lieu d'une différence silencieuse.",
      "`npm install` puede actualizar el lockfile para cumplir con `package.json`; `npm ci` nunca lo escribe. Así los builds son reproducibles y un commit del lockfile olvidado aparece como fallo en lugar de una diferencia silenciosa.",
    ],
  },
  {
    id: "nd-deps-06",
    q: ["A vulnerable version of `semver` comes in through a dependency of a dependency. How do you force a fixed version?", "Une version vulnérable de `semver` arrive par une dépendance d'une dépendance. Comment imposer une version corrigée ?", "Una versión vulnerable de `semver` llega a través de una dependencia de una dependencia. ¿Cómo se impone una versión corregida?"],
    a: ["With `overrides` in `package.json`, for example `\"overrides\": { \"semver\": \"^7.6.3\" }`", "Avec `overrides` dans `package.json`, par exemple `\"overrides\": { \"semver\": \"^7.6.3\" }`", "Con `overrides` en `package.json`, por ejemplo `\"overrides\": { \"semver\": \"^7.6.3\" }`"],
    w: [["By editing the file inside `node_modules`", "En modifiant le fichier dans `node_modules`", "Editando el archivo dentro de `node_modules`"], ["By adding `semver` to `devDependencies`", "En ajoutant `semver` aux `devDependencies`", "Añadiendo `semver` a `devDependencies`"], ["It cannot be done: wait for every maintainer", "C'est impossible : attendre chaque mainteneur", "No se puede: hay que esperar a cada mantenedor"]],
    e: [
      "`overrides` (npm 8.3 and later; `resolutions` in Yarn, `pnpm.overrides` in pnpm) replaces a package anywhere in the tree. It can break the parent if versions are incompatible, so run the tests and remove the override once the parent is fixed.",
      "`overrides` (npm 8.3 et plus ; `resolutions` dans Yarn, `pnpm.overrides` dans pnpm) remplace un paquet partout dans l'arbre. Il peut casser le parent si les versions sont incompatibles : lancez les tests et retirez l'override une fois le parent corrigé.",
      "`overrides` (npm 8.3 y posteriores; `resolutions` en Yarn, `pnpm.overrides` en pnpm) sustituye un paquete en cualquier punto del árbol. Puede romper al padre si las versiones son incompatibles, así que ejecuta las pruebas y quita el override cuando el padre esté corregido.",
    ],
  },
  {
    id: "nd-deps-07",
    q: ["A repository holds an app and two internal libraries in `packages/`. What do npm workspaces give?", "Un dépôt contient une application et deux bibliothèques internes dans `packages/`. Qu'apportent les workspaces npm ?", "Un repositorio contiene una app y dos bibliotecas internas en `packages/`. ¿Qué aportan los workspaces de npm?"],
    a: ["One install and one lockfile for all, with the local packages linked into `node_modules` so they import each other by name", "Une seule installation et un seul lockfile pour tout, avec les paquets locaux liés dans `node_modules` pour qu'ils s'importent par leur nom", "Una sola instalación y un solo lockfile para todo, con los paquetes locales enlazados en `node_modules` para que se importen por su nombre"],
    w: [["Each package published separately before the app can use it", "Chaque paquet publié séparément avant que l'application puisse l'utiliser", "Cada paquete publicado por separado antes de que la app pueda usarlo"], ["A separate Git repository per package", "Un dépôt Git séparé par paquet", "Un repositorio Git separado por paquete"], ["Nothing: workspaces are a Yarn feature only", "Rien : les workspaces n'existent que dans Yarn", "Nada: los workspaces solo existen en Yarn"]],
    e: [
      "`\"workspaces\": [\"packages/*\"]` in the root `package.json` makes a monorepo. `npm run build --workspaces` runs a script in each, `-w packages/api` in one. pnpm and Yarn have the same idea with stricter isolation.",
      "`\"workspaces\": [\"packages/*\"]` dans le `package.json` racine fait un monorepo. `npm run build --workspaces` lance un script dans chacun, `-w packages/api` dans un seul. pnpm et Yarn ont la même idée avec une isolation plus stricte.",
      "`\"workspaces\": [\"packages/*\"]` en el `package.json` raíz crea un monorepo. `npm run build --workspaces` ejecuta un script en cada uno, `-w packages/api` en uno solo. pnpm y Yarn tienen la misma idea con un aislamiento más estricto.",
    ],
  },
  {
    id: "nd-deps-08",
    q: ["`npm outdated` shows `vite` at 6.3 wanted, 7.1 latest. What does `npm update` do?", "`npm outdated` montre `vite` en 6.3 souhaitée, 7.1 la plus récente. Que fait `npm update` ?", "`npm outdated` muestra `vite` con 6.3 deseada y 7.1 la más reciente. ¿Qué hace `npm update`?"],
    a: ["It moves to 6.3, the newest within the range; 7.1 needs `npm install vite@7`", "Il passe à 6.3, la plus récente dans la plage ; 7.1 demande `npm install vite@7`", "Pasa a 6.3, la más nueva dentro del rango; 7.1 necesita `npm install vite@7`"],
    w: [["It moves to 7.1 and rewrites the range", "Il passe à 7.1 et réécrit la plage", "Pasa a 7.1 y reescribe el rango"], ["Nothing until the lockfile is deleted", "Rien tant que le lockfile n'est pas supprimé", "Nada hasta borrar el lockfile"], ["It removes vite, which is outdated", "Il retire vite, qui est périmé", "Elimina vite, que está desactualizado"]],
    e: [
      "\"Wanted\" is the newest version in your range, \"latest\" the newest published. A major upgrade may break things, so it is a separate, reviewed step with the changelog in hand. Dependabot or Renovate open such pull requests on a schedule.",
      "« Wanted » est la version la plus récente dans votre plage, « latest » la plus récente publiée. Une montée de majeure peut casser des choses : c'est une étape à part, relue, changelog en main. Dependabot ou Renovate ouvrent ce genre de pull requests à intervalles réguliers.",
      "«Wanted» es la versión más nueva dentro de tu rango y «latest» la más nueva publicada. Subir de mayor puede romper cosas, así que es un paso aparte, revisado, con el changelog delante. Dependabot o Renovate abren esos pull requests periódicamente.",
    ],
  },
];

const publishPractice: NodeQuestion[] = [
  {
    id: "nd-publish-05",
    q: ["What does `npm version minor` do in a Git repository at 2.3.4?", "Que fait `npm version minor` dans un dépôt Git en 2.3.4 ?", "¿Qué hace `npm version minor` en un repositorio Git en 2.3.4?"],
    a: ["It sets the version to 2.4.0 in `package.json` and the lockfile, commits, and creates the tag `v2.4.0`", "Il met la version à 2.4.0 dans `package.json` et le lockfile, commite, et crée le tag `v2.4.0`", "Pone la versión 2.4.0 en `package.json` y el lockfile, hace commit y crea la etiqueta `v2.4.0`"],
    w: [["It publishes 2.4.0 to the registry", "Il publie 2.4.0 sur le registre", "Publica 2.4.0 en el registro"], ["It sets the version to 2.3.5", "Il met la version à 2.3.5", "Pone la versión 2.3.5"], ["It prints the minor number, 3", "Il affiche le numéro mineur, 3", "Muestra el número menor, 3"]],
    e: [
      "`patch`, `minor` and `major` follow semver; `prerelease --preid beta` gives `2.4.0-beta.0`. Pushing the tag can then trigger a publish workflow. Tools such as Changesets or release-please do the same from commit messages or notes.",
      "`patch`, `minor` et `major` suivent le semver ; `prerelease --preid beta` donne `2.4.0-beta.0`. Pousser le tag peut ensuite déclencher un workflow de publication. Des outils comme Changesets ou release-please font la même chose à partir des messages de commit ou de notes.",
      "`patch`, `minor` y `major` siguen semver; `prerelease --preid beta` da `2.4.0-beta.0`. Hacer push de la etiqueta puede disparar luego un workflow de publicación. Herramientas como Changesets o release-please hacen lo mismo a partir de los mensajes de commit o de notas.",
    ],
  },
  {
    id: "nd-publish-06",
    q: ["A package's `package.json` has `\"exports\": { \".\": \"./dist/index.js\" }`. A user writes `import x from \"pkg/dist/utils.js\"`. What happens?", "Le `package.json` d'un paquet a `\"exports\": { \".\": \"./dist/index.js\" }`. Un utilisateur écrit `import x from \"pkg/dist/utils.js\"`. Que se passe-t-il ?", "El `package.json` de un paquete tiene `\"exports\": { \".\": \"./dist/index.js\" }`. Un usuario escribe `import x from \"pkg/dist/utils.js\"`. ¿Qué pasa?"],
    a: ["It fails with `ERR_PACKAGE_PATH_NOT_EXPORTED`: only the listed entry points can be imported", "Il échoue avec `ERR_PACKAGE_PATH_NOT_EXPORTED` : seuls les points d'entrée listés peuvent être importés", "Falla con `ERR_PACKAGE_PATH_NOT_EXPORTED`: solo pueden importarse los puntos de entrada listados"],
    w: [["It works: `exports` is only a hint", "Il marche : `exports` n'est qu'une indication", "Funciona: `exports` es solo una indicación"], ["Node loads `dist/index.js` instead", "Node charge `dist/index.js` à la place", "Node carga `dist/index.js` en su lugar"], ["npm refuses to install the package", "npm refuse d'installer le paquet", "npm se niega a instalar el paquete"]],
    e: [
      "`exports` is the package's public surface: internal files can move without breaking users. To allow a subpath, list it (`\"./utils\": \"./dist/utils.js\"`). Adding `exports` to an existing package can therefore be a breaking change.",
      "`exports` est la surface publique du paquet : les fichiers internes peuvent bouger sans casser les utilisateurs. Pour permettre un sous-chemin, listez-le (`\"./utils\": \"./dist/utils.js\"`). Ajouter `exports` à un paquet existant peut donc être un changement cassant.",
      "`exports` es la superficie pública del paquete: los archivos internos pueden moverse sin romper a los usuarios. Para permitir una subruta, lístala (`\"./utils\": \"./dist/utils.js\"`). Por eso añadir `exports` a un paquete existente puede ser un cambio incompatible.",
    ],
  },
  {
    id: "nd-publish-07",
    q: ["A library is written in TypeScript. What should it publish so TypeScript users get types?", "Une bibliothèque est écrite en TypeScript. Que doit-elle publier pour que les utilisateurs de TypeScript aient les types ?", "Una biblioteca está escrita en TypeScript. ¿Qué debe publicar para que quienes usan TypeScript tengan los tipos?"],
    a: ["Compiled JavaScript plus `.d.ts` declaration files, pointed to by a `types` condition in `exports`", "Le JavaScript compilé plus des fichiers de déclaration `.d.ts`, désignés par une condition `types` dans `exports`", "El JavaScript compilado más archivos de declaración `.d.ts`, indicados con una condición `types` en `exports`"],
    w: [["Only the `.ts` sources, which every user compiles", "Seulement les sources `.ts`, que chaque utilisateur compile", "Solo los fuentes `.ts`, que cada usuario compila"], ["Nothing: types are always downloaded from DefinitelyTyped", "Rien : les types sont toujours téléchargés de DefinitelyTyped", "Nada: los tipos siempre se descargan de DefinitelyTyped"], ["A `types.json` file at the root", "Un fichier `types.json` à la racine", "Un archivo `types.json` en la raíz"]],
    e: [
      "`tsc` with `declaration: true` emits the `.d.ts` files. In `exports`, `\"types\"` goes first in each condition block so TypeScript finds it. Node can strip types from `.ts` files it runs, but not inside `node_modules`: publish JavaScript.",
      "`tsc` avec `declaration: true` produit les fichiers `.d.ts`. Dans `exports`, `\"types\"` vient en premier dans chaque bloc de conditions pour que TypeScript le trouve. Node sait retirer les types des fichiers `.ts` qu'il exécute, mais pas dans `node_modules` : publiez du JavaScript.",
      "`tsc` con `declaration: true` genera los archivos `.d.ts`. En `exports`, `\"types\"` va primero en cada bloque de condiciones para que TypeScript lo encuentre. Node sabe quitar los tipos de los `.ts` que ejecuta, pero no dentro de `node_modules`: publica JavaScript.",
    ],
  },
  {
    id: "nd-publish-08",
    q: ["How do you publish 3.0.0-beta.1 so that a plain `npm install pkg` still gets 2.x?", "Comment publier 3.0.0-beta.1 pour qu'un simple `npm install pkg` donne encore 2.x ?", "¿Cómo publicas 3.0.0-beta.1 para que un simple `npm install pkg` siga dando 2.x?"],
    a: ["`npm publish --tag next`, so the `latest` dist-tag stays on 2.x", "`npm publish --tag next`, pour que la dist-tag `latest` reste sur 2.x", "`npm publish --tag next`, para que la dist-tag `latest` siga en 2.x"],
    w: [["Publish it as 2.99.0", "La publier en 2.99.0", "Publicarla como 2.99.0"], ["Publish to a second account", "Publier depuis un second compte", "Publicar desde una segunda cuenta"], ["It is automatic for any version above the current one", "C'est automatique pour toute version au-dessus de l'actuelle", "Es automático para cualquier versión por encima de la actual"]],
    e: [
      "Dist-tags are named pointers to versions; installs use `latest` unless told otherwise (`npm install pkg@next`). Recent npm versions require an explicit tag when publishing a prerelease, which avoids moving `latest` by mistake.",
      "Les dist-tags sont des pointeurs nommés vers des versions ; les installations utilisent `latest` sauf indication contraire (`npm install pkg@next`). Les versions récentes de npm exigent un tag explicite pour publier une préversion, ce qui évite de déplacer `latest` par erreur.",
      "Las dist-tags son punteros con nombre a versiones; las instalaciones usan `latest` salvo que se indique otra (`npm install pkg@next`). Las versiones recientes de npm exigen una etiqueta explícita al publicar una preversión, lo que evita mover `latest` por error.",
    ],
  },
];

const securityPractice: NodeQuestion[] = [
  {
    id: "nd-security-05",
    q: ["Since December 2025, which statement about npm authentication is true?", "Depuis décembre 2025, quelle affirmation sur l'authentification npm est vraie ?", "Desde diciembre de 2025, ¿qué afirmación sobre la autenticación de npm es cierta?"],
    a: ["Classic tokens are revoked, `npm login` gives a two-hour session, and granular write tokens last at most 90 days", "Les jetons classiques sont révoqués, `npm login` donne une session de deux heures, et les jetons granulaires d'écriture durent au plus 90 jours", "Los tokens clásicos están revocados, `npm login` da una sesión de dos horas y los tokens granulares de escritura duran como máximo 90 días"],
    w: [["Tokens never expire unless you revoke them", "Les jetons n'expirent jamais sauf si on les révoque", "Los tokens nunca caducan salvo que los revoques"], ["Publishing needs a password typed into `package.json`", "Publier demande un mot de passe saisi dans `package.json`", "Publicar necesita una contraseña escrita en `package.json`"], ["Only organisations can publish packages", "Seules les organisations peuvent publier des paquets", "Solo las organizaciones pueden publicar paquetes"]],
    e: [
      "After the 2025 supply-chain attacks, npm cut the lifetime of credentials: no more classic tokens, short sessions with 2FA for publishing, and limited granular tokens. For CI, trusted publishing with OIDC needs no stored token at all.",
      "Après les attaques de la chaîne d'approvisionnement de 2025, npm a raccourci la durée des identifiants : plus de jetons classiques, des sessions courtes avec 2FA pour publier, et des jetons granulaires limités. En CI, la publication de confiance par OIDC ne demande aucun jeton stocké.",
      "Tras los ataques a la cadena de suministro de 2025, npm acortó la vida de las credenciales: se acabaron los tokens clásicos, hay sesiones cortas con 2FA para publicar y tokens granulares limitados. En la CI, la publicación de confianza con OIDC no necesita ningún token guardado.",
    ],
  },
  {
    id: "nd-security-06",
    q: ["`npm audit fix` cannot fix everything and suggests `npm audit fix --force`. What is the risk?", "`npm audit fix` ne peut pas tout corriger et suggère `npm audit fix --force`. Quel est le risque ?", "`npm audit fix` no puede corregirlo todo y sugiere `npm audit fix --force`. ¿Cuál es el riesgo?"],
    a: ["It may install new major versions outside your ranges, which can break the app", "Il peut installer de nouvelles versions majeures hors de vos plages, ce qui peut casser l'application", "Puede instalar nuevas versiones mayores fuera de tus rangos, lo que puede romper la app"],
    w: [["None: it only changes the lockfile", "Aucun : il ne change que le lockfile", "Ninguno: solo cambia el lockfile"], ["It deletes the vulnerable packages' code", "Il supprime le code des paquets vulnérables", "Borra el código de los paquetes vulnerables"], ["It disables `npm audit` for the project", "Il désactive `npm audit` pour le projet", "Desactiva `npm audit` para el proyecto"]],
    e: [
      "Without `--force`, fixes stay within semver ranges. With it, npm jumps majors, sometimes even downgrades. Read what it plans (`--dry-run`), check whether the advisory affects your use, and prefer a targeted upgrade or an override.",
      "Sans `--force`, les corrections restent dans les plages semver. Avec, npm saute des majeures, parfois même rétrograde. Lisez ce qu'il prévoit (`--dry-run`), vérifiez si l'avis touche votre usage, et préférez une montée de version ciblée ou un override.",
      "Sin `--force`, las correcciones se quedan dentro de los rangos semver. Con él, npm salta versiones mayores, a veces incluso baja de versión. Lee lo que planea (`--dry-run`), comprueba si el aviso afecta a tu uso y prefiere una actualización concreta o un override.",
    ],
  },
  {
    id: "nd-security-07",
    q: ["How do you stop dependencies' install scripts from running on every `npm ci`?", "Comment empêcher les scripts d'installation des dépendances de tourner à chaque `npm ci` ?", "¿Cómo se evita que los scripts de instalación de las dependencias se ejecuten en cada `npm ci`?"],
    a: ["Set `ignore-scripts=true` in the project's `.npmrc`, and rebuild the few packages that need it explicitly", "Mettre `ignore-scripts=true` dans le `.npmrc` du projet, et reconstruire explicitement les quelques paquets qui en ont besoin", "Poner `ignore-scripts=true` en el `.npmrc` del proyecto y recompilar explícitamente los pocos paquetes que lo necesiten"],
    w: [["Delete `node_modules/.bin`", "Supprimer `node_modules/.bin`", "Borrar `node_modules/.bin`"], ["Run npm as root", "Lancer npm en root", "Ejecutar npm como root"], ["Remove the `scripts` field from your own `package.json`", "Retirer le champ `scripts` de votre propre `package.json`", "Quitar el campo `scripts` de tu propio `package.json`"]],
    e: [
      "Most packages need no install script; those that do are usually native addons (`npm rebuild sharp`). The setting also skips your own lifecycle scripts, so call them by name. pnpm 10 inverts the default: scripts run only for packages you approve.",
      "La plupart des paquets n'ont besoin d'aucun script d'installation ; ceux qui en ont sont en général des modules natifs (`npm rebuild sharp`). Le réglage saute aussi vos propres scripts de cycle de vie : appelez-les par leur nom. pnpm 10 inverse le défaut : les scripts ne tournent que pour les paquets approuvés.",
      "La mayoría de los paquetes no necesitan script de instalación; los que sí suelen ser módulos nativos (`npm rebuild sharp`). El ajuste también se salta tus propios scripts de ciclo de vida, así que llámalos por su nombre. pnpm 10 invierte el valor por defecto: los scripts solo corren para los paquetes que apruebas.",
    ],
  },
  {
    id: "nd-security-08",
    q: ["Each package in `package-lock.json` has an `integrity` field such as `sha512-…`. What does it protect against?", "Chaque paquet de `package-lock.json` a un champ `integrity` comme `sha512-…`. Contre quoi protège-t-il ?", "Cada paquete de `package-lock.json` tiene un campo `integrity` como `sha512-…`. ¿Contra qué protege?"],
    a: ["A tarball whose content differs from the one first resolved: npm refuses it if the hash does not match", "Une archive dont le contenu diffère de celle résolue la première fois : npm la refuse si l'empreinte ne correspond pas", "Un archivo comprimido cuyo contenido difiere del resuelto la primera vez: npm lo rechaza si el hash no coincide"],
    w: [["A malicious package published under a new version", "Un paquet malveillant publié sous une nouvelle version", "Un paquete malicioso publicado con una versión nueva"], ["Typos in package names", "Les fautes de frappe dans les noms de paquets", "Las erratas en los nombres de paquetes"], ["Vulnerabilities in the code", "Les vulnérabilités du code", "Las vulnerabilidades del código"]],
    e: [
      "The hash pins the bytes of each tarball, so a tampered mirror or cache cannot substitute content. It says nothing about whether those bytes were safe in the first place: a malicious version locked today stays malicious.",
      "L'empreinte fige les octets de chaque archive : un miroir ou un cache altéré ne peut pas substituer de contenu. Elle ne dit rien de la sûreté de ces octets au départ : une version malveillante verrouillée aujourd'hui reste malveillante.",
      "El hash fija los bytes de cada archivo comprimido, así que un espejo o una caché alterados no pueden sustituir el contenido. No dice nada de si esos bytes eran seguros desde el principio: una versión maliciosa fijada hoy sigue siendo maliciosa.",
    ],
  },
];

export const runtime = { runtimePractice };
export const modules = { modulesPractice };
export const async = { asyncPractice };
export const apis = { apisPractice };
export const packages = { packagesPractice };
export const deps = { depsPractice };
export const publish = { publishPractice };
export const security = { securityPractice };
