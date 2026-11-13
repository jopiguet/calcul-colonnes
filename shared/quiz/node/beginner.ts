/**
 * Node.js and npm, Débutant: what Node is and which version to run, the REPL
 * and version managers, `import` and `require`, the event loop in one
 * picture, reading files and the environment, package.json and semver,
 * installing and the lockfile, the registry and publishing, and the first
 * habits of safety. Code between backticks is the same in the three languages.
 */
import type { LinuxQuestion as NodeQuestion } from "../linux/types";

const runtimeBasics: NodeQuestion[] = [
  {
    id: "nd-runtime-01",
    q: ["What is Node.js?", "Qu'est-ce que Node.js ?", "¿Qué es Node.js?"],
    a: ["A JavaScript runtime built on the V8 engine, which runs JavaScript outside the browser with access to files, network and processes", "Un environnement d'exécution JavaScript bâti sur le moteur V8, qui exécute du JavaScript hors du navigateur avec accès aux fichiers, au réseau et aux processus", "Un entorno de ejecución de JavaScript construido sobre el motor V8, que ejecuta JavaScript fuera del navegador con acceso a archivos, red y procesos"],
    w: [["A JavaScript framework for building web pages, like React", "Un framework JavaScript pour construire des pages web, comme React", "Un framework de JavaScript para construir páginas web, como React"], ["A programming language derived from Java", "Un langage de programmation dérivé de Java", "Un lenguaje de programación derivado de Java"], ["A database that stores JSON documents", "Une base de données qui stocke des documents JSON", "Una base de datos que guarda documentos JSON"]],
    e: [
      "Node.js takes Chrome's V8 engine, adds libuv for asynchronous I/O and a standard library (`fs`, `http`, `crypto`…), and runs scripts from the command line. The language is the same JavaScript; what changes is the environment: no DOM, but files, sockets and processes.",
      "Node.js prend le moteur V8 de Chrome, ajoute libuv pour les entrées-sorties asynchrones et une bibliothèque standard (`fs`, `http`, `crypto`…), et lance des scripts depuis la ligne de commande. Le langage est le même JavaScript ; ce qui change, c'est l'environnement : pas de DOM, mais des fichiers, des sockets et des processus.",
      "Node.js toma el motor V8 de Chrome, añade libuv para la entrada y salida asíncronas y una biblioteca estándar (`fs`, `http`, `crypto`…), y ejecuta scripts desde la línea de comandos. El lenguaje es el mismo JavaScript; lo que cambia es el entorno: sin DOM, pero con archivos, sockets y procesos.",
    ],
  },
  {
    id: "nd-runtime-02",
    q: ["Which Node.js release line should a production server run?", "Quelle ligne de versions de Node.js un serveur de production doit-il utiliser ?", "¿Qué línea de versiones de Node.js debe usar un servidor de producción?"],
    a: ["A release line in Long Term Support (LTS), such as Node 24 or 26 in late 2026", "Une ligne en support à long terme (LTS), comme Node 24 ou 26 fin 2026", "Una línea con soporte a largo plazo (LTS), como Node 24 o 26 a finales de 2026"],
    w: [["Always the newest Current release, for the latest features", "Toujours la dernière version Current, pour les dernières fonctionnalités", "Siempre la última versión Current, por las últimas funciones"], ["Any release, since they all get security fixes forever", "N'importe laquelle, puisqu'elles reçoivent toutes des correctifs de sécurité pour toujours", "Cualquiera, porque todas reciben correcciones de seguridad para siempre"], ["The version that was installed when the project began, never updated", "La version installée au début du projet, jamais mise à jour", "La versión instalada al empezar el proyecto, nunca actualizada"]],
    e: [
      "Current releases change fast and are supported for months; LTS lines get bug and security fixes for about two and a half years. Every line has an end-of-life date, after which no fixes arrive: plan upgrades before it. The schedule is on nodejs.org.",
      "Les versions Current changent vite et sont soutenues quelques mois ; les lignes LTS reçoivent correctifs et mises à jour de sécurité pendant environ deux ans et demi. Chaque ligne a une date de fin de vie, après laquelle plus aucun correctif n'arrive : prévoir la mise à jour avant. Le calendrier est sur nodejs.org.",
      "Las versiones Current cambian rápido y tienen soporte durante meses; las líneas LTS reciben correcciones y parches de seguridad durante unos dos años y medio. Cada línea tiene una fecha de fin de vida, después de la cual no llega ninguna corrección: hay que planear la actualización antes. El calendario está en nodejs.org.",
    ],
  },
  {
    id: "nd-runtime-03",
    q: ["What happens when you type `node` alone in a terminal?", "Que se passe-t-il quand on tape `node` seul dans un terminal ?", "¿Qué pasa al escribir `node` solo en una terminal?"],
    a: ["The REPL opens: you type JavaScript and see each result at once", "Le REPL s'ouvre : on tape du JavaScript et on voit chaque résultat aussitôt", "Se abre el REPL: se escribe JavaScript y se ve cada resultado al instante"],
    w: [["Node prints its version and exits", "Node affiche sa version et s'arrête", "Node muestra su versión y termina"], ["Node runs the `index.js` of the current folder", "Node lance le `index.js` du dossier courant", "Node ejecuta el `index.js` de la carpeta actual"], ["Node starts a web server on port 3000", "Node démarre un serveur web sur le port 3000", "Node arranca un servidor web en el puerto 3000"]],
    e: [
      "The Read-Eval-Print Loop is handy to try an expression or an API. `.help` lists its commands and `.exit` or Ctrl+D leaves. To run a file, pass it: `node app.js`; `node --version` prints the version.",
      "La boucle Read-Eval-Print sert à essayer une expression ou une API. `.help` liste ses commandes, et `.exit` ou Ctrl+D en sort. Pour lancer un fichier, on le passe : `node app.js` ; `node --version` affiche la version.",
      "El bucle Read-Eval-Print sirve para probar una expresión o una API. `.help` lista sus comandos y `.exit` o Ctrl+D sale. Para ejecutar un archivo se pasa como argumento: `node app.js`; `node --version` muestra la versión.",
    ],
  },
  {
    id: "nd-runtime-04",
    q: ["Two projects need Node 22 and Node 26 on the same laptop. What is the usual answer?", "Deux projets ont besoin de Node 22 et de Node 26 sur le même portable. Quelle est la réponse habituelle ?", "Dos proyectos necesitan Node 22 y Node 26 en el mismo portátil. ¿Cuál es la respuesta habitual?"],
    a: ["A version manager such as nvm, fnm or Volta, with the version written in a file like `.nvmrc`", "Un gestionnaire de versions comme nvm, fnm ou Volta, avec la version écrite dans un fichier comme `.nvmrc`", "Un gestor de versiones como nvm, fnm o Volta, con la versión escrita en un archivo como `.nvmrc`"],
    w: [["Install both and rename one binary by hand", "Installer les deux et renommer un binaire à la main", "Instalar las dos y renombrar un binario a mano"], ["Use Node 26 for both: newer versions run all old code", "Utiliser Node 26 pour les deux : les versions récentes font tourner tout l'ancien code", "Usar Node 26 para los dos: las versiones nuevas ejecutan todo el código antiguo"], ["It is impossible: one machine, one Node version", "C'est impossible : une machine, une version de Node", "Es imposible: una máquina, una versión de Node"]],
    e: [
      "A version manager installs several versions side by side and switches per shell or per folder. A `.nvmrc` (or `.node-version`) containing `22` lets the team and CI pick the same major. Majors can remove APIs, so newer is not always compatible.",
      "Un gestionnaire de versions installe plusieurs versions côte à côte et change par terminal ou par dossier. Un `.nvmrc` (ou `.node-version`) contenant `22` permet à l'équipe et à la CI de prendre la même version majeure. Une version majeure peut retirer des API : plus récent n'est pas toujours compatible.",
      "Un gestor de versiones instala varias versiones a la vez y cambia por terminal o por carpeta. Un `.nvmrc` (o `.node-version`) con `22` deja que el equipo y la CI usen la misma versión mayor. Una versión mayor puede quitar APIs: más nueva no siempre es compatible.",
    ],
  },
];

const modulesBasics: NodeQuestion[] = [
  {
    id: "nd-modules-01",
    q: ["Which syntax belongs to ECMAScript modules (ESM), the standard module system?", "Quelle syntaxe appartient aux modules ECMAScript (ESM), le système de modules standard ?", "¿Qué sintaxis pertenece a los módulos ECMAScript (ESM), el sistema de módulos estándar?"],
    a: ["`import { readFile } from \"node:fs/promises\"` and `export function f() {}`", "`import { readFile } from \"node:fs/promises\"` et `export function f() {}`", "`import { readFile } from \"node:fs/promises\"` y `export function f() {}`"],
    w: [["`const fs = require(\"fs\")` and `module.exports = f`", "`const fs = require(\"fs\")` et `module.exports = f`", "`const fs = require(\"fs\")` y `module.exports = f`"], ["`include \"fs\"` and `public function f() {}`", "`include \"fs\"` et `public function f() {}`", "`include \"fs\"` y `public function f() {}`"], ["`using fs` and `export default class` only", "`using fs` et `export default class` seulement", "`using fs` y `export default class` solamente"]],
    e: [
      "`require` and `module.exports` are CommonJS, Node's original system, still everywhere in older code. `import` and `export` are the language's own modules, shared with browsers and bundlers; new code is usually written as ESM.",
      "`require` et `module.exports` sont CommonJS, le système d'origine de Node, encore partout dans le code ancien. `import` et `export` sont les modules du langage lui-même, communs aux navigateurs et aux bundlers ; le code neuf s'écrit en général en ESM.",
      "`require` y `module.exports` son CommonJS, el sistema original de Node, todavía presente en todo el código antiguo. `import` y `export` son los módulos del propio lenguaje, compartidos con navegadores y bundlers; el código nuevo suele escribirse como ESM.",
    ],
  },
  {
    id: "nd-modules-02",
    q: ["How does Node know that a `.js` file is an ES module?", "Comment Node sait-il qu'un fichier `.js` est un module ES ?", "¿Cómo sabe Node que un archivo `.js` es un módulo ES?"],
    a: ["The nearest `package.json` has `\"type\": \"module\"`; a `.mjs` file is always ESM", "Le `package.json` le plus proche a `\"type\": \"module\"` ; un fichier `.mjs` est toujours ESM", "El `package.json` más cercano tiene `\"type\": \"module\"`; un archivo `.mjs` siempre es ESM"],
    w: [["Node reads a comment at the top of the file", "Node lit un commentaire en haut du fichier", "Node lee un comentario al principio del archivo"], ["Every `.js` file is ESM since Node 12", "Tout fichier `.js` est ESM depuis Node 12", "Todo archivo `.js` es ESM desde Node 12"], ["It depends on the folder name", "Cela dépend du nom du dossier", "Depende del nombre de la carpeta"]],
    e: [
      "Without `\"type\"`, `.js` means CommonJS; `\"type\": \"module\"` flips it. `.mjs` and `.cjs` force one system whatever the field says. Recent Node versions also detect ESM syntax in an ambiguous file, but stating the type keeps tools in agreement.",
      "Sans `\"type\"`, `.js` veut dire CommonJS ; `\"type\": \"module\"` inverse cela. `.mjs` et `.cjs` imposent un système quel que soit le champ. Les versions récentes de Node détectent aussi la syntaxe ESM dans un fichier ambigu, mais déclarer le type met les outils d'accord.",
      "Sin `\"type\"`, `.js` significa CommonJS; `\"type\": \"module\"` lo invierte. `.mjs` y `.cjs` imponen un sistema diga lo que diga el campo. Las versiones recientes de Node también detectan sintaxis ESM en un archivo ambiguo, pero declarar el tipo pone de acuerdo a las herramientas.",
    ],
  },
  {
    id: "nd-modules-03",
    q: ["Why write `import fs from \"node:fs\"` rather than `\"fs\"`?", "Pourquoi écrire `import fs from \"node:fs\"` plutôt que `\"fs\"` ?", "¿Por qué escribir `import fs from \"node:fs\"` en lugar de `\"fs\"`?"],
    a: ["The `node:` prefix always means the built-in module, never a package of the same name", "Le préfixe `node:` désigne toujours le module intégré, jamais un paquet du même nom", "El prefijo `node:` siempre designa el módulo integrado, nunca un paquete con el mismo nombre"],
    w: [["It downloads the module from the internet", "Il télécharge le module depuis Internet", "Descarga el módulo de internet"], ["It is required, or the import fails", "Il est obligatoire, sinon l'import échoue", "Es obligatorio, o la importación falla"], ["It loads a faster version of the module", "Il charge une version plus rapide du module", "Carga una versión más rápida del módulo"]],
    e: [
      "Both forms load the built-in `fs` today, but `node:` makes the intent explicit to readers and tools, and some newer modules exist only with the prefix (`node:test`, `node:sqlite`). It is the recommended style.",
      "Les deux formes chargent aujourd'hui le `fs` intégré, mais `node:` rend l'intention explicite pour les lecteurs et les outils, et certains modules récents n'existent qu'avec le préfixe (`node:test`, `node:sqlite`). C'est le style recommandé.",
      "Las dos formas cargan hoy el `fs` integrado, pero `node:` hace explícita la intención para quien lee y para las herramientas, y algunos módulos nuevos solo existen con el prefijo (`node:test`, `node:sqlite`). Es el estilo recomendado.",
    ],
  },
  {
    id: "nd-modules-04",
    q: ["In an ES module, `import { add } from \"./math\"` fails. What is missing?", "Dans un module ES, `import { add } from \"./math\"` échoue. Que manque-t-il ?", "En un módulo ES, `import { add } from \"./math\"` falla. ¿Qué falta?"],
    a: ["The file extension: `\"./math.js\"`", "L'extension du fichier : `\"./math.js\"`", "La extensión del archivo: `\"./math.js\"`"],
    w: [["A `require` before the `import`", "Un `require` avant l'`import`", "Un `require` antes del `import`"], ["The absolute path from the disk's root", "Le chemin absolu depuis la racine du disque", "La ruta absoluta desde la raíz del disco"], ["Curly braces are not allowed in imports", "Les accolades ne sont pas permises dans les imports", "Las llaves no están permitidas en las importaciones"]],
    e: [
      "ESM resolves relative specifiers like URLs: no guessing of `.js` or `index.js` as CommonJS did. Write the full file name. Bundlers and TypeScript may accept the short form, which is why code can work there and fail in plain Node.",
      "L'ESM résout les chemins relatifs comme des URL : il ne devine pas `.js` ni `index.js` comme le faisait CommonJS. On écrit le nom de fichier complet. Les bundlers et TypeScript peuvent accepter la forme courte, d'où du code qui marche chez eux et échoue dans Node seul.",
      "ESM resuelve las rutas relativas como URLs: no adivina `.js` ni `index.js` como hacía CommonJS. Hay que escribir el nombre completo del archivo. Los bundlers y TypeScript pueden aceptar la forma corta, y por eso hay código que funciona allí y falla en Node solo.",
    ],
  },
];

const asyncBasics: NodeQuestion[] = [
  {
    id: "nd-async-01",
    q: ["Node runs your JavaScript on one thread. How can one process serve thousands of connections?", "Node exécute votre JavaScript sur un seul fil. Comment un processus peut-il servir des milliers de connexions ?", "Node ejecuta tu JavaScript en un solo hilo. ¿Cómo puede un proceso atender miles de conexiones?"],
    a: ["I/O is non-blocking: Node starts the operation, keeps running other code, and the event loop calls back when the result is ready", "Les entrées-sorties ne bloquent pas : Node lance l'opération, continue d'exécuter d'autre code, et la boucle d'événements rappelle quand le résultat est prêt", "La entrada y salida no bloquea: Node lanza la operación, sigue ejecutando otro código y el bucle de eventos llama de vuelta cuando el resultado está listo"],
    w: [["It starts one thread per connection", "Il démarre un fil par connexion", "Arranca un hilo por conexión"], ["It cannot: Node handles one request at a time from start to end", "Il ne le peut pas : Node traite une requête à la fois du début à la fin", "No puede: Node atiende una petición cada vez de principio a fin"], ["The operating system runs JavaScript in parallel on every core", "Le système d'exploitation exécute le JavaScript en parallèle sur chaque cœur", "El sistema operativo ejecuta el JavaScript en paralelo en cada núcleo"]],
    e: [
      "Most of a server's time is spent waiting on the network, disks or databases. While one request waits, the loop runs callbacks for others. The flip side: a long computation on that thread makes every request wait.",
      "Un serveur passe l'essentiel de son temps à attendre le réseau, les disques ou les bases de données. Pendant qu'une requête attend, la boucle exécute les callbacks des autres. Le revers : un long calcul sur ce fil fait attendre toutes les requêtes.",
      "Un servidor pasa la mayor parte del tiempo esperando a la red, los discos o las bases de datos. Mientras una petición espera, el bucle ejecuta los callbacks de las demás. La otra cara: un cálculo largo en ese hilo hace esperar a todas las peticiones.",
    ],
  },
  {
    id: "nd-async-02",
    q: ["What does this print? `console.log(\"a\"); setTimeout(() => console.log(\"b\"), 0); console.log(\"c\");`", "Qu'affiche ceci ? `console.log(\"a\"); setTimeout(() => console.log(\"b\"), 0); console.log(\"c\");`", "¿Qué muestra esto? `console.log(\"a\"); setTimeout(() => console.log(\"b\"), 0); console.log(\"c\");`"],
    a: ["a, c, b", "a, c, b", "a, c, b"],
    w: [["a, b, c", "a, b, c", "a, b, c"], ["b, a, c", "b, a, c", "b, a, c"], ["a, c, and never b", "a, c, et jamais b", "a, c, y nunca b"]],
    e: [
      "A timer callback, even with 0 ms, runs only after the current code has finished and the event loop reaches the timers. The synchronous lines always run first, in order.",
      "Le callback d'un minuteur, même à 0 ms, ne s'exécute qu'une fois le code en cours terminé, quand la boucle d'événements arrive aux minuteurs. Les lignes synchrones passent toujours d'abord, dans l'ordre.",
      "El callback de un temporizador, incluso con 0 ms, solo se ejecuta cuando el código actual ha terminado y el bucle de eventos llega a los temporizadores. Las líneas síncronas siempre van primero, en orden.",
    ],
  },
  {
    id: "nd-async-03",
    q: ["An HTTP handler calls `fs.readFileSync` on a 200 MB file. What happens to the other requests?", "Un gestionnaire HTTP appelle `fs.readFileSync` sur un fichier de 200 Mo. Qu'arrive-t-il aux autres requêtes ?", "Un manejador HTTP llama a `fs.readFileSync` sobre un archivo de 200 MB. ¿Qué les pasa a las demás peticiones?"],
    a: ["They all wait until the read finishes, since the one JavaScript thread is blocked", "Elles attendent toutes la fin de la lecture, puisque l'unique fil JavaScript est bloqué", "Todas esperan a que termine la lectura, porque el único hilo de JavaScript está bloqueado"],
    w: [["Nothing: Node moves the read to another thread automatically", "Rien : Node déplace la lecture sur un autre fil automatiquement", "Nada: Node pasa la lectura a otro hilo automáticamente"], ["They are rejected with a 503 error", "Elles sont rejetées avec une erreur 503", "Se rechazan con un error 503"], ["Only requests for the same file wait", "Seules les requêtes pour le même fichier attendent", "Solo esperan las peticiones del mismo archivo"]],
    e: [
      "`Sync` functions block the thread until done. They are fine in a script or at startup, not in a server's request path. Use `fs/promises` or a stream, which let the loop serve others meanwhile.",
      "Les fonctions `Sync` bloquent le fil jusqu'à la fin. Elles conviennent dans un script ou au démarrage, pas sur le chemin d'une requête dans un serveur. Utilisez `fs/promises` ou un flux, qui laissent la boucle servir les autres pendant ce temps.",
      "Las funciones `Sync` bloquean el hilo hasta terminar. Sirven en un script o al arrancar, no en el camino de una petición de un servidor. Usa `fs/promises` o un stream, que dejan al bucle atender a los demás mientras tanto.",
    ],
  },
  {
    id: "nd-async-04",
    q: ["Where can `await` be used in Node?", "Où peut-on utiliser `await` dans Node ?", "¿Dónde se puede usar `await` en Node?"],
    a: ["Inside an `async` function, and at the top level of an ES module", "Dans une fonction `async`, et au niveau supérieur d'un module ES", "Dentro de una función `async` y en el nivel superior de un módulo ES"],
    w: [["Anywhere, including the top level of a CommonJS file", "Partout, y compris au niveau supérieur d'un fichier CommonJS", "En cualquier sitio, incluido el nivel superior de un archivo CommonJS"], ["Only inside callbacks passed to `setTimeout`", "Seulement dans les callbacks passés à `setTimeout`", "Solo dentro de los callbacks pasados a `setTimeout`"], ["Only in the REPL", "Seulement dans le REPL", "Solo en el REPL"]],
    e: [
      "`await` pauses the async function until the promise settles, without blocking the thread. ESM allows top-level `await`, handy for loading configuration; CommonJS does not, and wraps code in an `async` function instead.",
      "`await` suspend la fonction async jusqu'à ce que la promesse se règle, sans bloquer le fil. L'ESM permet `await` au niveau supérieur, pratique pour charger une configuration ; CommonJS ne le permet pas et enveloppe le code dans une fonction `async`.",
      "`await` suspende la función async hasta que la promesa se resuelve, sin bloquear el hilo. ESM permite `await` en el nivel superior, útil para cargar configuración; CommonJS no, y envuelve el código en una función `async`.",
    ],
  },
];

const apisBasics: NodeQuestion[] = [
  {
    id: "nd-apis-01",
    q: ["How do you read a text file without blocking, in an ES module?", "Comment lire un fichier texte sans bloquer, dans un module ES ?", "¿Cómo se lee un archivo de texto sin bloquear, en un módulo ES?"],
    a: ["`const text = await readFile(\"notes.txt\", \"utf8\")` with `readFile` from `node:fs/promises`", "`const text = await readFile(\"notes.txt\", \"utf8\")` avec `readFile` de `node:fs/promises`", "`const text = await readFile(\"notes.txt\", \"utf8\")` con `readFile` de `node:fs/promises`"],
    w: [["`const text = fetch(\"notes.txt\")`", "`const text = fetch(\"notes.txt\")`", "`const text = fetch(\"notes.txt\")`"], ["`const text = document.open(\"notes.txt\")`", "`const text = document.open(\"notes.txt\")`", "`const text = document.open(\"notes.txt\")`"], ["`const text = readFile(\"notes.txt\")` with no `await`, which returns the text", "`const text = readFile(\"notes.txt\")` sans `await`, qui renvoie le texte", "`const text = readFile(\"notes.txt\")` sin `await`, que devuelve el texto"]],
    e: [
      "The promise API returns a promise; `await` gives its value. Without an encoding you get a `Buffer` of bytes; with `\"utf8\"` a string. Errors such as a missing file reject the promise, so wrap it in `try` where it matters.",
      "L'API à promesses renvoie une promesse ; `await` en donne la valeur. Sans encodage on obtient un `Buffer` d'octets ; avec `\"utf8\"`, une chaîne. Les erreurs comme un fichier absent rejettent la promesse : entourez-la d'un `try` là où cela compte.",
      "La API de promesas devuelve una promesa; `await` da su valor. Sin codificación se obtiene un `Buffer` de bytes; con `\"utf8\"`, una cadena. Errores como un archivo inexistente rechazan la promesa, así que conviene un `try` donde importe.",
    ],
  },
  {
    id: "nd-apis-02",
    q: ["The port must come from the environment, with 3000 as default. What do you write?", "Le port doit venir de l'environnement, avec 3000 par défaut. Qu'écrivez-vous ?", "El puerto debe venir del entorno, con 3000 por defecto. ¿Qué escribes?"],
    a: ["`const port = Number(process.env.PORT ?? 3000)`", "`const port = Number(process.env.PORT ?? 3000)`", "`const port = Number(process.env.PORT ?? 3000)`"],
    w: [["`const port = window.PORT || 3000`", "`const port = window.PORT || 3000`", "`const port = window.PORT || 3000`"], ["`const port = process.argv.PORT`", "`const port = process.argv.PORT`", "`const port = process.argv.PORT`"], ["`const port = env(\"PORT\", 3000)`, a global function", "`const port = env(\"PORT\", 3000)`, une fonction globale", "`const port = env(\"PORT\", 3000)`, una función global"]],
    e: [
      "`process.env` holds the environment variables, always as strings or `undefined`, hence `Number`. Configuration from the environment lets the same code run locally, in CI and in production with different values.",
      "`process.env` contient les variables d'environnement, toujours sous forme de chaînes ou `undefined`, d'où `Number`. Une configuration venue de l'environnement permet au même code de tourner en local, en CI et en production avec des valeurs différentes.",
      "`process.env` contiene las variables de entorno, siempre como cadenas o `undefined`, de ahí `Number`. La configuración desde el entorno permite que el mismo código corra en local, en CI y en producción con valores distintos.",
    ],
  },
  {
    id: "nd-apis-03",
    q: ["What does this program do? `createServer((req, res) => res.end(\"ok\")).listen(8080)`, with `createServer` from `node:http`", "Que fait ce programme ? `createServer((req, res) => res.end(\"ok\")).listen(8080)`, avec `createServer` de `node:http`", "¿Qué hace este programa? `createServer((req, res) => res.end(\"ok\")).listen(8080)`, con `createServer` de `node:http`"],
    a: ["It starts an HTTP server on port 8080 that answers every request with `ok`", "Il démarre un serveur HTTP sur le port 8080 qui répond `ok` à chaque requête", "Arranca un servidor HTTP en el puerto 8080 que responde `ok` a cada petición"],
    w: [["It sends one request to port 8080 and prints `ok`", "Il envoie une requête au port 8080 et affiche `ok`", "Envía una petición al puerto 8080 y muestra `ok`"], ["It answers one request, then exits", "Il répond à une requête, puis s'arrête", "Responde a una petición y termina"], ["Nothing until a framework like Express is installed", "Rien tant qu'un framework comme Express n'est pas installé", "Nada hasta instalar un framework como Express"]],
    e: [
      "`node:http` is enough for a server: the callback runs for each request, and the process keeps running while the server listens. Frameworks such as Express or Fastify add routing, parsing and middleware on top.",
      "`node:http` suffit pour un serveur : le callback s'exécute pour chaque requête, et le processus continue de tourner tant que le serveur écoute. Des frameworks comme Express ou Fastify ajoutent par-dessus le routage, l'analyse des corps et les middlewares.",
      "`node:http` basta para un servidor: el callback se ejecuta en cada petición y el proceso sigue vivo mientras el servidor escucha. Frameworks como Express o Fastify añaden encima el enrutado, el análisis de cuerpos y los middlewares.",
    ],
  },
  {
    id: "nd-apis-04",
    q: ["What does `node --watch server.js` do?", "Que fait `node --watch server.js` ?", "¿Qué hace `node --watch server.js`?"],
    a: ["It runs the script and restarts it whenever a file it imports changes", "Il lance le script et le relance chaque fois qu'un fichier qu'il importe change", "Ejecuta el script y lo reinicia cada vez que cambia un archivo que importa"],
    w: [["It prints every line as it runs", "Il affiche chaque ligne pendant l'exécution", "Muestra cada línea mientras se ejecuta"], ["It watches the network and logs requests", "Il surveille le réseau et journalise les requêtes", "Vigila la red y registra las peticiones"], ["It needs the `nodemon` package to work", "Il a besoin du paquet `nodemon` pour fonctionner", "Necesita el paquete `nodemon` para funcionar"]],
    e: [
      "Watch mode is built in and stable since Node 22; for most projects it replaces `nodemon`. Add `--watch-path` to watch a folder. It is for development, not production.",
      "Le mode watch est intégré et stable depuis Node 22 ; pour la plupart des projets, il remplace `nodemon`. Ajoutez `--watch-path` pour surveiller un dossier. C'est pour le développement, pas pour la production.",
      "El modo watch está integrado y es estable desde Node 22; en la mayoría de proyectos sustituye a `nodemon`. Añade `--watch-path` para vigilar una carpeta. Es para desarrollo, no para producción.",
    ],
  },
];

const packagesBasics: NodeQuestion[] = [
  {
    id: "nd-packages-01",
    q: ["What is `package.json`?", "Qu'est-ce que `package.json` ?", "¿Qué es `package.json`?"],
    a: ["The project's manifest: its name and version, its dependencies, its scripts and settings such as `\"type\"`", "Le manifeste du projet : son nom et sa version, ses dépendances, ses scripts et des réglages comme `\"type\"`", "El manifiesto del proyecto: su nombre y versión, sus dependencias, sus scripts y ajustes como `\"type\"`"],
    w: [["A cache of downloaded packages", "Un cache des paquets téléchargés", "Una caché de los paquetes descargados"], ["The compiled version of the code", "La version compilée du code", "La versión compilada del código"], ["A file npm writes and nobody should edit", "Un fichier qu'écrit npm et que personne ne doit modifier", "Un archivo que escribe npm y que nadie debe editar"]],
    e: [
      "`npm init -y` creates one. It is edited by hand and by npm (`npm install` adds dependencies). It describes what the project needs, while `package-lock.json` records exactly what was installed.",
      "`npm init -y` en crée un. On le modifie à la main et npm le modifie aussi (`npm install` ajoute des dépendances). Il décrit ce dont le projet a besoin, tandis que `package-lock.json` note exactement ce qui a été installé.",
      "`npm init -y` crea uno. Se edita a mano y también lo edita npm (`npm install` añade dependencias). Describe lo que necesita el proyecto, mientras que `package-lock.json` registra exactamente lo que se instaló.",
    ],
  },
  {
    id: "nd-packages-02",
    q: ["A test framework is needed only to develop, not to run the app. Where does it go?", "Un framework de test ne sert qu'à développer, pas à faire tourner l'application. Où va-t-il ?", "Un framework de pruebas solo hace falta para desarrollar, no para ejecutar la app. ¿Dónde va?"],
    a: ["In `devDependencies`, with `npm install --save-dev vitest`", "Dans `devDependencies`, avec `npm install --save-dev vitest`", "En `devDependencies`, con `npm install --save-dev vitest`"],
    w: [["In `dependencies`, like everything else", "Dans `dependencies`, comme tout le reste", "En `dependencies`, como todo lo demás"], ["In `scripts`", "Dans `scripts`", "En `scripts`"], ["Nowhere: install it globally only", "Nulle part : on l'installe seulement en global", "En ningún sitio: solo se instala globalmente"]],
    e: [
      "`dependencies` are needed at run time; `devDependencies` only for building, testing and linting. A production install with `npm ci --omit=dev` skips the latter, which makes images smaller.",
      "Les `dependencies` sont nécessaires à l'exécution ; les `devDependencies` seulement pour construire, tester et analyser le code. Une installation de production avec `npm ci --omit=dev` saute ces dernières, ce qui allège les images.",
      "Las `dependencies` hacen falta en ejecución; las `devDependencies` solo para compilar, probar y analizar el código. Una instalación de producción con `npm ci --omit=dev` se salta estas últimas, y las imágenes quedan más pequeñas.",
    ],
  },
  {
    id: "nd-packages-03",
    q: ["`\"express\": \"^5.1.0\"` allows which versions?", "`\"express\": \"^5.1.0\"` autorise quelles versions ?", "`\"express\": \"^5.1.0\"` permite qué versiones?"],
    a: ["5.1.0 and later, below 6.0.0", "5.1.0 et au-delà, en dessous de 6.0.0", "5.1.0 y posteriores, por debajo de 6.0.0"],
    w: [["Exactly 5.1.0", "Exactement 5.1.0", "Exactamente 5.1.0"], ["5.1.x only", "5.1.x seulement", "Solo 5.1.x"], ["Any version from 5.1.0 on, including 6 and 7", "Toute version à partir de 5.1.0, y compris 6 et 7", "Cualquier versión desde 5.1.0, incluidas 6 y 7"]],
    e: [
      "Semantic versioning reads MAJOR.MINOR.PATCH: a major breaks compatibility, a minor adds features, a patch fixes bugs. The caret accepts new minors and patches, not a new major. It is what `npm install` writes by default.",
      "Le versionnage sémantique se lit MAJEURE.MINEURE.CORRECTIF : une majeure casse la compatibilité, une mineure ajoute des fonctionnalités, un correctif répare des bugs. L'accent circonflexe accepte les nouvelles mineures et les correctifs, pas une nouvelle majeure. C'est ce qu'écrit `npm install` par défaut.",
      "El versionado semántico se lee MAYOR.MENOR.PARCHE: una mayor rompe la compatibilidad, una menor añade funciones, un parche corrige errores. El acento circunflejo acepta nuevas menores y parches, no una nueva mayor. Es lo que escribe `npm install` por defecto.",
    ],
  },
  {
    id: "nd-packages-04",
    q: ["`package.json` has `\"scripts\": { \"lint\": \"eslint .\" }`. How do you run it?", "`package.json` contient `\"scripts\": { \"lint\": \"eslint .\" }`. Comment le lancer ?", "`package.json` tiene `\"scripts\": { \"lint\": \"eslint .\" }`. ¿Cómo se ejecuta?"],
    a: ["`npm run lint`, which finds `eslint` in the project's `node_modules/.bin`", "`npm run lint`, qui trouve `eslint` dans le `node_modules/.bin` du projet", "`npm run lint`, que encuentra `eslint` en el `node_modules/.bin` del proyecto"],
    w: [["`npm lint`, the same as for `test`", "`npm lint`, comme pour `test`", "`npm lint`, igual que con `test`"], ["`node lint`", "`node lint`", "`node lint`"], ["Only `eslint .` directly, after installing ESLint globally", "Seulement `eslint .` directement, après avoir installé ESLint en global", "Solo `eslint .` directamente, tras instalar ESLint globalmente"]],
    e: [
      "Scripts put `node_modules/.bin` on the `PATH`, so the project's own tool version runs, with no global install. A few names have shortcuts (`npm test`, `npm start`); the others need `npm run`.",
      "Les scripts mettent `node_modules/.bin` dans le `PATH` : c'est la version de l'outil propre au projet qui tourne, sans installation globale. Quelques noms ont un raccourci (`npm test`, `npm start`) ; les autres demandent `npm run`.",
      "Los scripts ponen `node_modules/.bin` en el `PATH`, así que se ejecuta la versión de la herramienta del proyecto, sin instalación global. Algunos nombres tienen atajo (`npm test`, `npm start`); los demás necesitan `npm run`.",
    ],
  },
];

const depsBasics: NodeQuestion[] = [
  {
    id: "nd-deps-01",
    q: ["What does `npm install zod` do in a project?", "Que fait `npm install zod` dans un projet ?", "¿Qué hace `npm install zod` en un proyecto?"],
    a: ["It downloads zod and its dependencies into `node_modules`, adds it to `dependencies` and updates `package-lock.json`", "Il télécharge zod et ses dépendances dans `node_modules`, l'ajoute à `dependencies` et met à jour `package-lock.json`", "Descarga zod y sus dependencias en `node_modules`, lo añade a `dependencies` y actualiza `package-lock.json`"],
    w: [["It installs zod for every project on the machine", "Il installe zod pour tous les projets de la machine", "Instala zod para todos los proyectos de la máquina"], ["It only adds a line to `package.json`, downloading nothing", "Il ajoute seulement une ligne à `package.json`, sans rien télécharger", "Solo añade una línea a `package.json`, sin descargar nada"], ["It copies zod's source into the project's `src` folder", "Il copie le source de zod dans le dossier `src` du projet", "Copia el código de zod en la carpeta `src` del proyecto"]],
    e: [
      "Packages are local to the project by default. The range goes into `package.json`; the exact versions and integrity hashes of the whole tree go into the lockfile. `-g` installs a command-line tool globally instead.",
      "Les paquets sont locaux au projet par défaut. La plage va dans `package.json` ; les versions exactes et les empreintes d'intégrité de tout l'arbre vont dans le lockfile. `-g` installe à la place un outil en ligne de commande en global.",
      "Los paquetes son locales al proyecto por defecto. El rango va a `package.json`; las versiones exactas y los hashes de integridad de todo el árbol van al lockfile. `-g` instala en cambio una herramienta de línea de comandos globalmente.",
    ],
  },
  {
    id: "nd-deps-02",
    q: ["What goes into Git: `node_modules`, `package-lock.json`, or both?", "Qu'est-ce qui va dans Git : `node_modules`, `package-lock.json`, ou les deux ?", "¿Qué va a Git: `node_modules`, `package-lock.json` o los dos?"],
    a: ["`package-lock.json` yes; `node_modules` no, it is listed in `.gitignore`", "`package-lock.json` oui ; `node_modules` non, il est listé dans `.gitignore`", "`package-lock.json` sí; `node_modules` no, va en `.gitignore`"],
    w: [["Both, so that nobody has to install", "Les deux, pour que personne n'ait à installer", "Los dos, para que nadie tenga que instalar"], ["Neither: both are generated", "Ni l'un ni l'autre : les deux sont générés", "Ninguno: los dos se generan"], ["`node_modules` only", "`node_modules` seulement", "Solo `node_modules`"]],
    e: [
      "`node_modules` is large, platform-specific (native binaries) and rebuilt from the lockfile in seconds. The lockfile is small and is what makes every machine and CI install the same versions; commit it with every dependency change.",
      "`node_modules` est gros, propre à la plateforme (binaires natifs) et reconstruit depuis le lockfile en quelques secondes. Le lockfile est petit, et c'est lui qui fait installer les mêmes versions sur chaque machine et en CI ; on le commite avec chaque changement de dépendance.",
      "`node_modules` es grande, depende de la plataforma (binarios nativos) y se reconstruye desde el lockfile en segundos. El lockfile es pequeño y es lo que hace que cada máquina y la CI instalen las mismas versiones; se hace commit con cada cambio de dependencias.",
    ],
  },
  {
    id: "nd-deps-03",
    q: ["`package.json` says `^5.1.0`. Why can two developers still get the same express version?", "`package.json` dit `^5.1.0`. Pourquoi deux développeurs obtiennent-ils quand même la même version d'express ?", "`package.json` dice `^5.1.0`. ¿Por qué dos desarrolladores obtienen aun así la misma versión de express?"],
    a: ["The lockfile records the exact version resolved, and installs follow it", "Le lockfile note la version exacte résolue, et les installations la suivent", "El lockfile registra la versión exacta resuelta, y las instalaciones la siguen"],
    w: [["npm always picks the lowest version of the range", "npm prend toujours la version la plus basse de la plage", "npm siempre elige la versión más baja del rango"], ["The registry publishes one version per month", "Le registre publie une version par mois", "El registro publica una versión al mes"], ["They cannot: each install takes the newest match", "Ils ne le peuvent pas : chaque installation prend la plus récente qui convient", "No pueden: cada instalación toma la más reciente que encaja"]],
    e: [
      "The range says what is acceptable; the lockfile says what was chosen, for direct and indirect dependencies alike. Updating is a deliberate step (`npm update`, a Dependabot pull request), reviewed like any change.",
      "La plage dit ce qui est acceptable ; le lockfile dit ce qui a été choisi, pour les dépendances directes comme indirectes. Mettre à jour est une étape voulue (`npm update`, une pull request de Dependabot), relue comme tout changement.",
      "El rango dice lo que es aceptable; el lockfile dice lo que se eligió, para dependencias directas e indirectas por igual. Actualizar es un paso deliberado (`npm update`, un pull request de Dependabot), revisado como cualquier cambio.",
    ],
  },
  {
    id: "nd-deps-04",
    q: ["What does `npx cowsay hello` do?", "Que fait `npx cowsay hello` ?", "¿Qué hace `npx cowsay hello`?"],
    a: ["It runs the `cowsay` command, from the project if installed there, otherwise from a temporary download", "Il lance la commande `cowsay`, depuis le projet s'il y est installé, sinon depuis un téléchargement temporaire", "Ejecuta el comando `cowsay`, desde el proyecto si está instalado allí, si no desde una descarga temporal"],
    w: [["It publishes a package called cowsay", "Il publie un paquet nommé cowsay", "Publica un paquete llamado cowsay"], ["It adds cowsay to `dependencies`", "Il ajoute cowsay aux `dependencies`", "Añade cowsay a `dependencies`"], ["It runs `cowsay.js` from the current folder", "Il lance `cowsay.js` depuis le dossier courant", "Ejecuta `cowsay.js` desde la carpeta actual"]],
    e: [
      "`npx` (an alias of `npm exec`) avoids global installs for one-off tools such as generators. It asks before downloading something new; check the name, since running a package executes its code.",
      "`npx` (alias de `npm exec`) évite les installations globales pour des outils ponctuels comme les générateurs. Il demande avant de télécharger quelque chose de nouveau ; vérifiez le nom, car lancer un paquet exécute son code.",
      "`npx` (alias de `npm exec`) evita instalaciones globales para herramientas puntuales como los generadores. Pregunta antes de descargar algo nuevo; comprueba el nombre, porque ejecutar un paquete ejecuta su código.",
    ],
  },
];

const publishBasics: NodeQuestion[] = [
  {
    id: "nd-publish-01",
    q: ["What is the npm registry?", "Qu'est-ce que le registre npm ?", "¿Qué es el registro de npm?"],
    a: ["The public service, at registry.npmjs.org, that stores published packages and serves them to installers", "Le service public, à registry.npmjs.org, qui stocke les paquets publiés et les sert aux installateurs", "El servicio público, en registry.npmjs.org, que guarda los paquetes publicados y los sirve a los instaladores"],
    w: [["The list of packages in a project's `package.json`", "La liste des paquets dans le `package.json` d'un projet", "La lista de paquetes en el `package.json` de un proyecto"], ["A folder on your disk where npm keeps its settings", "Un dossier sur votre disque où npm garde ses réglages", "Una carpeta en tu disco donde npm guarda sus ajustes"], ["A review board that checks every package's code", "Un comité qui vérifie le code de chaque paquet", "Un comité que revisa el código de cada paquete"]],
    e: [
      "npm, owned by GitHub, hosts millions of packages. Anyone with an account can publish; nobody reviews the code first. pnpm, Yarn and Bun install from the same registry, and companies often add a private registry or a mirror.",
      "npm, propriété de GitHub, héberge des millions de paquets. Toute personne ayant un compte peut publier ; personne ne vérifie le code avant. pnpm, Yarn et Bun installent depuis le même registre, et les entreprises ajoutent souvent un registre privé ou un miroir.",
      "npm, propiedad de GitHub, aloja millones de paquetes. Cualquiera con una cuenta puede publicar; nadie revisa el código antes. pnpm, Yarn y Bun instalan desde el mismo registro, y las empresas suelen añadir un registro privado o un espejo.",
    ],
  },
  {
    id: "nd-publish-02",
    q: ["You fix a bug in your published package 1.2.0. Can you publish the fix as 1.2.0 again?", "Vous corrigez un bug dans votre paquet publié 1.2.0. Pouvez-vous publier le correctif à nouveau en 1.2.0 ?", "Corriges un error en tu paquete publicado 1.2.0. ¿Puedes publicar la corrección otra vez como 1.2.0?"],
    a: ["No: a published version can never be reused; publish 1.2.1", "Non : une version publiée ne peut jamais être réutilisée ; publiez 1.2.1", "No: una versión publicada nunca puede reutilizarse; publica 1.2.1"],
    w: [["Yes, `npm publish` overwrites it", "Oui, `npm publish` l'écrase", "Sí, `npm publish` la sobrescribe"], ["Yes, with `--force`", "Oui, avec `--force`", "Sí, con `--force`"], ["Yes, but only within the first week", "Oui, mais seulement la première semaine", "Sí, pero solo la primera semana"]],
    e: [
      "Versions are immutable so that a lockfile always means the same code. A bug fix is a patch release; `npm version patch` bumps the number and tags it in Git.",
      "Les versions sont immuables pour qu'un lockfile désigne toujours le même code. Une correction de bug est une version de correctif ; `npm version patch` incrémente le numéro et pose un tag Git.",
      "Las versiones son inmutables para que un lockfile signifique siempre el mismo código. Una corrección es una versión de parche; `npm version patch` sube el número y crea una etiqueta en Git.",
    ],
  },
  {
    id: "nd-publish-03",
    q: ["What is a scoped package such as `@acme/logger`?", "Qu'est-ce qu'un paquet à portée comme `@acme/logger` ?", "¿Qué es un paquete con ámbito como `@acme/logger`?"],
    a: ["A package in the namespace of a user or organisation; only its members can publish there", "Un paquet dans l'espace de noms d'un utilisateur ou d'une organisation ; seuls ses membres peuvent y publier", "Un paquete en el espacio de nombres de un usuario u organización; solo sus miembros pueden publicar allí"],
    w: [["A package that works only inside one company", "Un paquet qui ne marche qu'à l'intérieur d'une entreprise", "Un paquete que solo funciona dentro de una empresa"], ["A package written in TypeScript", "Un paquet écrit en TypeScript", "Un paquete escrito en TypeScript"], ["A beta version of `logger`", "Une version bêta de `logger`", "Una versión beta de `logger`"]],
    e: [
      "Scopes avoid name clashes and make it clear who publishes. A scoped package is private by default on npm; the first publish of a public one needs `npm publish --access public`.",
      "Les portées évitent les conflits de noms et montrent qui publie. Un paquet à portée est privé par défaut sur npm ; la première publication d'un paquet public demande `npm publish --access public`.",
      "Los ámbitos evitan choques de nombres y dejan claro quién publica. Un paquete con ámbito es privado por defecto en npm; la primera publicación de uno público necesita `npm publish --access public`.",
    ],
  },
  {
    id: "nd-publish-04",
    q: ["Before publishing, how do you see which files will be in the package?", "Avant de publier, comment voir quels fichiers seront dans le paquet ?", "Antes de publicar, ¿cómo ves qué archivos irán en el paquete?"],
    a: ["`npm pack --dry-run`, which lists the files the tarball would contain", "`npm pack --dry-run`, qui liste les fichiers que contiendrait l'archive", "`npm pack --dry-run`, que lista los archivos que contendría el archivo comprimido"],
    w: [["`npm ls`", "`npm ls`", "`npm ls`"], ["`git status`", "`git status`", "`git status`"], ["There is no way: publish and look on the website", "Il n'y a aucun moyen : publier et regarder sur le site", "No hay manera: publicar y mirarlo en la web"]],
    e: [
      "The `files` field in `package.json` lists what to include (an allowlist, safer than `.npmignore`). Checking the list avoids shipping tests, source maps you did not mean to, or worse, a `.env`.",
      "Le champ `files` de `package.json` liste ce qu'il faut inclure (une liste blanche, plus sûre que `.npmignore`). Vérifier la liste évite de publier des tests, des source maps non voulues, ou pire, un `.env`.",
      "El campo `files` de `package.json` lista qué incluir (una lista blanca, más segura que `.npmignore`). Revisar la lista evita publicar pruebas, source maps no deseados o, peor, un `.env`.",
    ],
  },
];

const securityBasics: NodeQuestion[] = [
  {
    id: "nd-security-01",
    q: ["What does `npm audit` do?", "Que fait `npm audit` ?", "¿Qué hace `npm audit`?"],
    a: ["It compares the installed versions with a database of known vulnerabilities and reports the affected packages", "Il compare les versions installées à une base de vulnérabilités connues et signale les paquets touchés", "Compara las versiones instaladas con una base de vulnerabilidades conocidas e informa de los paquetes afectados"],
    w: [["It reads every package's code to find malware", "Il lit le code de chaque paquet pour trouver des logiciels malveillants", "Lee el código de cada paquete para encontrar malware"], ["It checks the project's code style", "Il vérifie le style du code du projet", "Revisa el estilo del código del proyecto"], ["It removes unused packages", "Il retire les paquets inutilisés", "Elimina los paquetes que no se usan"]],
    e: [
      "Audit knows only vulnerabilities that were reported and published as advisories. It does not catch a freshly compromised package. Treat its findings by severity and by whether the vulnerable code is reachable in your use.",
      "L'audit ne connaît que les vulnérabilités signalées et publiées en avis. Il n'attrape pas un paquet compromis tout récemment. Traitez ses résultats selon la gravité et selon que le code vulnérable est atteignable dans votre usage.",
      "La auditoría solo conoce las vulnerabilidades notificadas y publicadas como avisos. No detecta un paquete comprometido hace poco. Trata sus resultados según la gravedad y según si el código vulnerable es alcanzable en tu uso.",
    ],
  },
  {
    id: "nd-security-02",
    q: ["Why is installing a package already a risk, before you import it?", "Pourquoi installer un paquet est-il déjà un risque, avant même de l'importer ?", "¿Por qué instalar un paquete ya es un riesgo, antes de importarlo?"],
    a: ["Its install scripts (`preinstall`, `postinstall`) run code on your machine with your rights", "Ses scripts d'installation (`preinstall`, `postinstall`) exécutent du code sur votre machine avec vos droits", "Sus scripts de instalación (`preinstall`, `postinstall`) ejecutan código en tu máquina con tus permisos"],
    w: [["It is not: code runs only when imported", "Ce n'en est pas un : le code ne s'exécute qu'à l'import", "No lo es: el código solo se ejecuta al importarlo"], ["The download can overheat the disk", "Le téléchargement peut faire surchauffer le disque", "La descarga puede sobrecalentar el disco"], ["npm sends your source code to the registry", "npm envoie votre code source au registre", "npm envía tu código fuente al registro"]],
    e: [
      "Lifecycle scripts exist to build native addons, and attackers use them to steal tokens and keys. `npm install --ignore-scripts` turns them off; pnpm 10 runs a dependency's scripts only if you approve it.",
      "Les scripts de cycle de vie servent à compiler des modules natifs, et les attaquants s'en servent pour voler jetons et clés. `npm install --ignore-scripts` les désactive ; pnpm 10 n'exécute les scripts d'une dépendance que si vous l'approuvez.",
      "Los scripts de ciclo de vida sirven para compilar módulos nativos, y los atacantes los usan para robar tokens y claves. `npm install --ignore-scripts` los desactiva; pnpm 10 solo ejecuta los scripts de una dependencia si los apruebas.",
    ],
  },
  {
    id: "nd-security-03",
    q: ["You meant `npm install express` but typed `expresss`. What is the danger?", "Vous vouliez `npm install express` mais avez tapé `expresss`. Quel est le danger ?", "Querías `npm install express` pero escribiste `expresss`. ¿Cuál es el peligro?"],
    a: ["Typosquatting: an attacker may have published a malicious package under that misspelt name", "Le typosquatting : un attaquant peut avoir publié un paquet malveillant sous ce nom mal orthographié", "El typosquatting: un atacante puede haber publicado un paquete malicioso con ese nombre mal escrito"],
    w: [["None: npm corrects the spelling", "Aucun : npm corrige l'orthographe", "Ninguno: npm corrige la ortografía"], ["The install fails, always", "L'installation échoue, toujours", "La instalación falla, siempre"], ["You get an older version of express", "On obtient une ancienne version d'express", "Obtienes una versión antigua de express"]],
    e: [
      "Look at the package page before adding a dependency: its exact name, downloads, repository, maintainers and age. The registry removes many squatted names, but not before some installs.",
      "Regardez la page du paquet avant d'ajouter une dépendance : son nom exact, ses téléchargements, son dépôt, ses mainteneurs et son âge. Le registre retire beaucoup de noms squattés, mais pas avant quelques installations.",
      "Mira la página del paquete antes de añadir una dependencia: su nombre exacto, descargas, repositorio, mantenedores y antigüedad. El registro elimina muchos nombres ocupados así, pero no antes de algunas instalaciones.",
    ],
  },
  {
    id: "nd-security-04",
    q: ["Where should a database password used by a Node app live?", "Où doit vivre le mot de passe de base de données d'une application Node ?", "¿Dónde debe estar la contraseña de base de datos de una app de Node?"],
    a: ["In the environment or a secret manager, with a local `.env` listed in `.gitignore` and a `.env.example` committed instead", "Dans l'environnement ou un gestionnaire de secrets, avec un `.env` local listé dans `.gitignore` et un `.env.example` commité à la place", "En el entorno o en un gestor de secretos, con un `.env` local en `.gitignore` y un `.env.example` en el repositorio en su lugar"],
    w: [["In a constant in the code, in a private repository", "Dans une constante du code, dans un dépôt privé", "En una constante del código, en un repositorio privado"], ["In `package.json`, under `config`", "Dans `package.json`, sous `config`", "En `package.json`, bajo `config`"], ["In the README, so the team can find it", "Dans le README, pour que l'équipe le trouve", "En el README, para que el equipo lo encuentre"]],
    e: [
      "Code and history get copied, forked and leaked; a password in them is hard to take back. Node reads a `.env` file with `node --env-file=.env app.js`, no package needed. In production, the platform injects secrets.",
      "Le code et l'historique sont copiés, forkés et divulgués ; un mot de passe dedans est difficile à reprendre. Node lit un fichier `.env` avec `node --env-file=.env app.js`, sans paquet. En production, la plateforme injecte les secrets.",
      "El código y el historial se copian, se bifurcan y se filtran; una contraseña ahí es difícil de recuperar. Node lee un archivo `.env` con `node --env-file=.env app.js`, sin paquetes. En producción, la plataforma inyecta los secretos.",
    ],
  },
];

export const runtime = { runtimeBasics };
export const modules = { modulesBasics };
export const async = { asyncBasics };
export const apis = { apisBasics };
export const packages = { packagesBasics };
export const deps = { depsBasics };
export const publish = { publishBasics };
export const security = { securityBasics };
