# Node.js et npm — un cours complet

## Comment utiliser ce cours

Ce cours explique Node.js et l'écosystème npm : le runtime et ses versions, les modules, la boucle d'événements, les API intégrées, `package.json` et le versionnage sémantique, l'installation et les lockfiles, la publication de paquets, et la sécurité de la chaîne d'approvisionnement. Il décrit les outils tels qu'ils sont fin 2026 (Node 24 et 26, npm 11, pnpm 10 et 11) et privilégie ce qui restera vrai quand ils changeront.

**Pour qui.** Les développeurs qui écrivent du JavaScript ou du TypeScript pour des serveurs, des outils ou des chaînes de build, et quiconque maintient un `package.json`. Il faut connaître le langage JavaScript ; les dernières parties supposent l'usage d'un terminal et de Git.

**Organisation.** Huit parties en deux blocs :

| Bloc | Parties | Ce que vous saurez faire ensuite |
|---|---|---|
| La plateforme | 1 Le runtime · 2 Les modules · 3 L'asynchronisme · 4 Les API intégrées | Écrire, lancer, déboguer et exploiter des programmes Node sans surprise |
| npm et l'écosystème | 5 package.json et semver · 6 Installer · 7 Publier · 8 Sécurité | Gérer les dépendances, livrer des paquets et garder la chaîne d'approvisionnement sous contrôle |

Chaque partie se termine par ce qu'il faut retenir. Les exercices à la fin donnent une tâche par partie, avec les réponses.

**Avec Luma.** Le QCM *📦 Node.js et npm* du groupe *Informatique* de Luma suit les mêmes thèmes sur quatre niveaux (Débutant à Expert), avec 128 questions rédigées ; une mauvaise réponse renvoie à sa partie. Luma elle-même est une application Node et TypeScript construite avec npm, dont ce cours tire des exemples.

**Ce qu'il vous faut.** Node 24 ou plus, installé avec un gestionnaire de versions (partie 1), et un terminal. La partie 7 suppose un compte GitHub si vous voulez essayer la publication de confiance.

## Partie 1 — Le runtime

### Ce qu'est Node

Node.js exécute du JavaScript hors du navigateur. Il est fait du moteur **V8** (celui de Chrome), de **libuv** pour les entrées-sorties asynchrones, et d'une bibliothèque standard : `fs`, `http`, `crypto`, `stream`, `worker_threads` et d'autres. Il n'y a pas de DOM ; il y a des fichiers, des sockets, des processus et des variables d'environnement.

```sh
node --version          # v24.11.0, par exemple
node                    # le REPL : tapez des expressions, .exit pour sortir
node app.js             # lancer un fichier
node --watch app.js     # relancer quand un fichier importé change
```

### Versions et support

Chaque ligne de Node a une vie : **Current** pendant des mois, puis **LTS** (support à long terme) avec des correctifs pendant environ deux ans et demi, puis la fin de vie. La production tourne sur une ligne LTS.

| Ligne | Statut en novembre 2026 | Fin de vie |
|---|---|---|
| 22 | LTS de maintenance | avril 2027 |
| 24 | LTS de maintenance | avril 2028 |
| 26 | LTS active | avril 2029 |
| 27 | Alpha, publiée en Current en avril 2027 | avril 2030 |

Node 26 est la dernière ligne de l'ancien modèle, avec deux majeures par an dont seules les paires devenaient LTS. À partir de Node 27, il y a **une majeure par an** : des alphas dès octobre, une version Current en avril, la LTS en octobre, trente mois de support, et le numéro correspond à l'année. Vérifiez le calendrier sur nodejs.org ; les dates peuvent bouger.

### Une version par projet

Un **gestionnaire de versions** (nvm, fnm, Volta ou mise) installe plusieurs versions côte à côte et change selon le dossier. Écrivez la majeure dans `.nvmrc` (ou `.node-version`), déclarez-la dans `package.json`, et utilisez la même en CI et dans l'image de conteneur :

```json
{
  "engines": { "node": ">=24" }
}
```

npm se contente d'avertir quand `engines` ne correspond pas, sauf si `engine-strict=true` est défini dans `.npmrc`.

### Exploiter en production

- **Codes de sortie** : 0 veut dire succès. Fixez `process.exitCode = 1` et laissez le programme se terminer, plutôt que `process.exit(1)`, qui peut couper une sortie en cours d'écriture.
- **Signaux** : les plateformes envoient `SIGTERM`, puis `SIGKILL` après un délai de grâce. Fermez le serveur, finissez les requêtes, fermez les pools, sortez.
- **PID 1** : dans un conteneur, lancez Node directement avec la forme exec `CMD ["node", "server.js"]`. `npm start` ou un shell en PID 1 peut ne pas transmettre les signaux, et Node en PID 1 ignore `SIGTERM` si vous ne le gérez pas.

```js
process.on("SIGTERM", () => {
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(1), 10_000).unref();
});
```

### Utiliser tous les cœurs

Le JavaScript tourne sur un seul fil par processus. Un travail lourd pour le CPU (traitement d'images, analyse d'énormes fichiers) bloque toutes les requêtes de ce fil. Les options :

- Les **worker threads** (`node:worker_threads`), chacun avec sa boucle d'événements et son tas, qui communiquent par messages ; un pool comme Piscina les réutilise.
- **Plusieurs processus** derrière un répartiteur de charge, ce qui isole aussi les pannes ; sur une plateforme comme Cloud Run ou Kubernetes, lancez simplement plus d'instances.
- **Le pool de threads de libuv** exécute déjà les appels au système de fichiers, `dns.lookup`, la crypto asynchrone (`scrypt`, `pbkdf2`) et zlib, avec quatre threads par défaut (`UV_THREADPOOL_SIZE`). Les sockets réseau ne l'utilisent pas.

### Déboguer et diagnostiquer

- `node --inspect app.js` ouvre un débogueur sur 127.0.0.1:9229 pour Chrome DevTools ou un éditeur. Ne l'exposez jamais publiquement : il permet d'exécuter n'importe quel code.
- `node --cpu-prof` écrit un profil CPU ; `monitorEventLoopDelay` de `node:perf_hooks` mesure le retard de la boucle.
- Fuites de mémoire : prenez des **instantanés du tas** à quelque temps d'écart et comparez-les, ou utilisez `--heapsnapshot-near-heap-limit`. Les causes typiques sont les caches sans limite, les écouteurs ajoutés à chaque requête et les minuteurs qui retiennent des closures.
- Les **modules natifs** écrits avec **Node-API** continuent de marcher d'une majeure à l'autre ; les anciens, liés directement à V8, doivent être recompilés.

**À retenir.** Utilisez une ligne LTS, fixez-la par projet, sortez et arrêtez proprement, gardez le travail lourd hors du fil principal, et mesurez la boucle avant de deviner.

## Partie 2 — Les modules

### Deux systèmes

| | CommonJS | Modules ES (ESM) |
|---|---|---|
| Syntaxe | `require`, `module.exports` | `import`, `export` |
| Chargement | Synchrone | Asynchrone, `await` au niveau supérieur permis |
| Fichier | `.cjs`, ou `.js` sans `"type"` | `.mjs`, ou `.js` avec `"type": "module"` |
| Son chemin | `__dirname`, `__filename` | `import.meta.dirname`, `import.meta.filename` |
| Exports | Une valeur copiée | Des liaisons vivantes |

Le code neuf s'écrit en ESM. Mettez `"type": "module"` dans `package.json` ; `.cjs` et `.mjs` le remplacent fichier par fichier.

```js
import { readFile } from "node:fs/promises";
import { parse } from "./parser.js";          // l'extension est obligatoire
import config from "./config.json" with { type: "json" };

export function load(path) {
  return readFile(path, "utf8").then(parse);
}
```

- Le **préfixe `node:`** désigne toujours un module intégré et il est obligatoire pour certains (`node:test`, `node:sqlite`).
- En ESM, les imports relatifs demandent le **nom de fichier complet** ; les bundlers et TypeScript acceptent parfois moins, Node seul non.
- L'**`import()` dynamique** charge un module quand la ligne s'exécute, depuis l'ESM ou CommonJS ; utile pour les plugins et les fonctionnalités rarement utilisées.

### Les mélanger

Depuis Node 22.12 et 20.19, **`require(esm)`** marche : CommonJS peut charger un module ES par `require()`, sauf si le graphe de modules utilise `await` au niveau supérieur (alors `ERR_REQUIRE_ASYNC_MODULE` ; utilisez `await import()`). L'ESM a toujours pu importer du CommonJS.

**Liaisons vivantes** : un importateur ESM voit les changements ultérieurs d'un `let` exporté ; `const { count } = require("./counter")` copie la valeur une fois.

### Comment un paquet est trouvé

Un nom nu comme `"lodash"` se cherche dans les dossiers `node_modules`, en remontant depuis le fichier qui importe. Dans le paquet trouvé, `exports` (ou l'ancien `main`) choisit le fichier.

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

- `exports` est la **surface publique** : les autres chemins échouent avec `ERR_PACKAGE_PATH_NOT_EXPORTED`.
- **Les conditions sont essayées dans l'ordre**, la première qui correspond gagne : `types` d'abord, `default` en dernier.
- Les entrées de **`imports`** commencent par `#` et donnent des alias privés au paquet, sans bundler.

### Pièges

- **Le risque du double paquet** : un paquet qui publie une version CommonJS et une version ESM peut se charger deux fois, avec deux copies de son état. Ne publier que de l'ESM l'évite maintenant que `require(esm)` existe.
- **Le cache ESM** est indexé par URL et ne rétrécit jamais : `import("./x.js?v=" + Date.now())` recharge mais fait fuir la mémoire.
- Les **hooks de personnalisation** (`resolve` et `load`, enregistrés avec `module.register` ou `module.registerHooks` depuis un fichier passé à `--import`) permettent aux outils de transformer les modules au chargement, pour TypeScript, les mocks ou la couverture.

**À retenir.** Écrivez de l'ESM avec des extensions explicites et des modules intégrés en `node:`, définissez `exports` avec `types` en premier, gardez l'`await` au niveau supérieur hors des points d'entrée, et souvenez-vous que `require(esm)` a comblé l'essentiel de l'écart.

## Partie 3 — L'asynchronisme et la boucle d'événements

### Un fil, beaucoup de connexions

Node lance une opération d'entrée-sortie, continue d'exécuter d'autre code, et lance un callback quand le résultat est prêt. C'est pourquoi un processus sert des milliers de connexions ; c'est aussi pourquoi un long calcul fait attendre toutes les requêtes. Les fonctions qui finissent par `Sync` bloquent le fil : bien au démarrage ou dans un script, pas dans un gestionnaire de requêtes.

### L'ordre des choses

Après le code en cours, Node exécute les **microtâches** : la file `process.nextTick`, puis les callbacks de promesses. Ensuite la boucle parcourt ses phases :

| Phase | Exécute |
|---|---|
| Timers | Les callbacks de `setTimeout` et `setInterval` arrivés à échéance |
| Pending | Certains callbacks système différés |
| Poll | Les entrées-sorties : nouvelles connexions, données, résultats de fichiers |
| Check | Les callbacks de `setImmediate` |
| Close | Les événements `close` |

```js
setTimeout(() => console.log("timeout"));
Promise.resolve().then(() => console.log("promise"));
process.nextTick(() => console.log("tick"));
console.log("sync");
// En CommonJS : sync, tick, promise, timeout
```

Dans un module ES, le script lui-même s'exécute comme une microtâche, si bien que les callbacks de promesses peuvent passer avant `nextTick`. Dans un callback d'entrée-sortie, `setImmediate` passe toujours avant un minuteur à 0 ms. Ne bâtissez pas de logique sur ces détails.

Une chaîne de callbacks `nextTick` ou de promesses qui se remplit sans cesse **affame** la boucle : les entrées-sorties ne passent jamais. Rendez la main avec `setImmediate` ou travaillez par lots bornés.

### Promesses et erreurs

- `await Promise.all([...])` rejette au premier échec ; les autres continuent. `Promise.allSettled` donne chaque issue.
- Un **rejet non géré** fait tomber le processus (depuis Node 15). Une promesse lancée tôt et attendue tard peut le déclencher : `const p = a(); await b(); await p;` plante si `p` est rejetée pendant `b()`. Utilisez `Promise.all([a(), b()])`.
- Un `EventEmitter` qui émet `error` sans écouteur **lève l'erreur**. Chaque flux et chaque socket a besoin d'un gestionnaire d'erreur, ou d'être enveloppé avec `pipeline` ou `events.once`.

### Annulation

`AbortSignal` est la manière commune d'annuler : `fetch`, `fs/promises`, les flux, les minuteurs et `events.once` en acceptent un.

```js
const signal = AbortSignal.any([userSignal, AbortSignal.timeout(5000)]);
const res = await fetch(url, { signal });
```

`Promise.race` avec un minuteur arrête seulement l'attente ; la requête continue.

### Flux et contre-pression

Les flux traitent les données par morceaux : la mémoire reste stable. Quand un consommateur est lent, `write()` renvoie `false` et le producteur devrait attendre `drain`. `pipeline` le fait, transmet les erreurs de n'importe quelle étape et ferme tout :

```js
import { pipeline } from "node:stream/promises";
import { createReadStream, createWriteStream } from "node:fs";
import { createGzip } from "node:zlib";

await pipeline(createReadStream("big.log"), createGzip(), createWriteStream("big.log.gz"));
```

Un générateur asynchrone peut être une étape, et `for await (const chunk of stream)` lit un flux.

### Contexte et threads

- **`AsyncLocalStorage`** (`node:async_hooks`) transporte une valeur, comme un identifiant de requête, à travers les `await` et les callbacks sans la passer partout ; les outils de traçage reposent dessus.
- Les **workers** reçoivent les messages par clonage structuré, une copie. Un gros `ArrayBuffer` peut plutôt être **transféré** (`postMessage(buf, [buf])`), ou partagé en `SharedArrayBuffer` avec `Atomics`.

**À retenir.** Ne bloquez jamais le fil, gérez chaque rejet et chaque événement `error`, passez des signaux pour annuler, utilisez `pipeline` pour les flux, et ne comptez pas sur l'ordre fin des callbacks.

## Partie 4 — Les API intégrées

### Fichiers, environnement, chemins

```js
import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";

const port = Number(process.env.PORT ?? 3000);
const dataDir = path.join(import.meta.dirname, "data");
await mkdir(dataDir, { recursive: true });
const text = await readFile(path.join(dataDir, "notes.txt"), "utf8");
```

- Les valeurs de `process.env` sont des chaînes ou `undefined`.
- `path.resolve` construit un chemin absolu depuis le dossier de travail ; `path.join` se contente de joindre. Pour des fichiers voisins d'un module, partez de `import.meta.dirname`.
- `node --env-file=.env app.js` charge un fichier `.env` (depuis 20.6) ; les variables déjà présentes dans l'environnement l'emportent. Gardez `.env` hors de Git et commitez un `.env.example`.

### HTTP, dans les deux sens

```js
import { createServer } from "node:http";

const server = createServer((req, res) => {
  res.writeHead(200, { "content-type": "text/plain" });
  res.end("ok");
});
server.listen(8080);
```

- Le **`fetch` global** (depuis 18, stable depuis 21) repose sur undici. Vérifiez `res.ok` : un 404 ne rejette pas. **Lisez ou annulez chaque corps** (`await res.text()`, `res.body?.cancel()`) : un corps non lu garde occupée sa connexion du pool.
- **Derrière un répartiteur de charge**, réglez `server.keepAliveTimeout` au-dessus du délai d'inactivité du répartiteur (souvent 60 secondes ; le défaut de Node est 5), et `headersTimeout` encore plus haut, sinon le répartiteur réutilisera des connexions que Node a fermées et renverra des erreurs 502.

### Tests, scripts, arguments

- **`node --test`** lance les fichiers `*.test.js` écrits avec `node:test` et `node:assert` : `describe`, `it`, hooks, mocks, snapshots, mode watch.
- **`node --run build`** lance un script de `package.json` sans le démarrage de npm ni ses hooks `pre` et `post`.
- **`parseArgs`** de `node:util` analyse les options de la ligne de commande pour les petits outils.

### TypeScript sans build

Node retire les types des fichiers `.ts` qu'il exécute : actif par défaut depuis 23.6 et 22.18, stable dans Node 24.

- Pas de vérification de types : lancez `tsc --noEmit` en CI.
- Pas de `tsconfig` ; seulement une syntaxe effaçable. `enum`, les namespaces avec du code et les propriétés de paramètres demandent `--experimental-transform-types` ; activez `erasableSyntaxOnly` dans TypeScript pour rester dans les limites.
- Écrivez les imports avec `.ts` et utilisez `import type` pour les types. Ne s'applique pas dans `node_modules` : les paquets publient du JavaScript.

### Processus et crypto

- **`execFile(cmd, args)`** ou `spawn` passe les arguments sans shell ; `exec` avec une chaîne construite appelle l'injection de commandes.
- **`timingSafeEqual`** de `node:crypto` compare des secrets en temps constant ; `===` révèle des écarts de temps. `randomUUID()` et `randomBytes()` donnent un aléa sûr.
- **`node:vm`** sépare les portées globales mais **n'est pas une frontière de sécurité**. Le code non fiable demande une isolation au niveau du processus ou du système.

### Permissions et instrumentation

- **Le modèle de permissions** : `node --permission --allow-fs-read=./data app.js` refuse les écritures, les processus enfants, les workers et les autres lectures. C'est une ceinture de sécurité contre les erreurs, pas un bac à sable pour du code hostile.
- L'**instrumentation** comme OpenTelemetry se précharge avec `node --import ./instrumentation.js app.js`, pour s'accrocher à `http` et aux clients de base de données avant que l'application ne les charge ; les bibliothèques publient des événements via `diagnostics_channel`.

**À retenir.** La bibliothèque standard couvre désormais les fichiers, les clients et serveurs HTTP, les tests, `.env`, les arguments et le retrait des types TypeScript ; lisez chaque corps de réponse, réglez le keep-alive derrière les répartiteurs, évitez les shells, et ne prenez ni `vm` ni les permissions pour un bac à sable.

## Partie 5 — package.json et le versionnage sémantique

### Le manifeste

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

- Les **`dependencies`** servent à l'exécution, les **`devDependencies`** seulement à construire et tester ; `npm ci --omit=dev` saute ces dernières.
- Les **`peerDependencies`** sont fournies par l'hôte : un plugin déclare l'ESLint ou le React avec lequel il marche. npm 7 et plus les installent et s'arrêtent avec `ERESOLVE` en cas de conflit ; `--legacy-peer-deps` ne fait que le cacher.
- Les **`optionalDependencies`** avec des champs `os` et `cpu` permettent à des outils comme esbuild de publier un paquet binaire par plateforme, dont seul celui qui correspond s'installe.
- **`bin`** associe des noms de commandes à des fichiers commençant par `#!/usr/bin/env node`.

### Les scripts

`npm run lint` met `node_modules/.bin` dans le `PATH` : c'est l'ESLint du projet qui tourne. `test`, `start` et quelques autres ont des raccourcis. `pretest` et `posttest` tournent automatiquement autour de `test` ; beaucoup d'équipes préfèrent des enchaînements explicites.

### Le versionnage sémantique

MAJEURE.MINEURE.CORRECTIF : une majeure casse la compatibilité, une mineure ajoute des fonctionnalités, un correctif répare des bugs.

| Plage | Autorise | Remarque |
|---|---|---|
| `^5.1.0` | de 5.1.0 à moins de 6.0.0 | Le défaut de npm |
| `~5.1.0` | de 5.1.0 à moins de 5.2.0 | Correctifs seulement |
| `5.1.0` | 5.1.0 | Exacte |
| `^0.8.3` | de 0.8.3 à moins de 0.9.0 | Sur 0.x, une mineure peut casser |
| `^1.3.0-beta.0` | Les bêtas de 1.3.0, puis 1.3.x | Les préversions ne correspondent que si on les nomme |

Est **cassant** tout ce qui peut casser un utilisateur dans sa plage : retirer une API, changer `exports`, abandonner une ligne de Node, ou durcir les types TypeScript. Écrivez votre politique.

### Savoir pourquoi

`npm ls pkg --all` et `npm explain pkg` montrent quelles dépendances amènent un paquet. `npm outdated` montre « wanted » (la plus récente dans la plage) et « latest » (la plus récente publiée).

**À retenir.** Séparez dépendances d'exécution et de développement, déclarez des pairs pour les plugins, utilisez des plages en accent circonflexe en comprenant 0.x et les préversions, et traitez les types et le runtime comme une partie de votre API.

## Partie 6 — Installer et les lockfiles

### Ce que fait une installation

`npm install zod` télécharge zod et ses dépendances dans `node_modules`, ajoute une plage dans `package.json`, et note les versions exactes de tout l'arbre, avec leurs URL `resolved` et leurs empreintes `integrity`, dans `package-lock.json`.

- Commitez le **lockfile** ; ne commitez jamais `node_modules`.
- **`npm ci`** installe exactement le lockfile à partir d'un `node_modules` vide et échoue s'il ne concorde pas avec `package.json`. Utilisez-le en CI et dans les Dockerfiles.
- **`npm update`** avance dans les plages ; une nouvelle majeure demande `npm install pkg@latest`, relu avec son changelog. Dependabot ou Renovate planifient ces mises à jour.
- **`npx tool`** (ou `npm exec`) lance la commande d'un paquet sans installation globale.

### Maîtriser l'arbre

```json
{
  "overrides": { "semver": "^7.6.3" },
  "workspaces": ["packages/*"]
}
```

- Les **`overrides`** imposent une version partout dans l'arbre, par exemple pour corriger une vulnérabilité transitive. Retirez-les une fois le parent corrigé.
- Les **workspaces** font un monorepo : une installation, un lockfile, des paquets locaux liés par leur nom. `npm run build --workspaces` lance dans chacun.
- **`npm dedupe`** réduit les doublons quand les plages le permettent ; deux copies d'un singleton comme React cassent les hooks.
- Un **conflit de fusion du lockfile** : résolvez `package.json`, lancez `npm install`, commitez. Supprimer le lockfile résout tout à nouveau.

### Les autres gestionnaires de paquets

| Outil | Disposition | Remarques |
|---|---|---|
| npm | `node_modules` à plat, remonté | Livré avec Node |
| pnpm | Stockage adressé par contenu, liens en dur, arbre de liens symboliques | Strict : pas de dépendances fantômes ; les scripts d'installation demandent une approbation depuis la 10 |
| Yarn (Berry) | Plug'n'Play (`.pnp.cjs`) ou `node_modules` | Pas de `node_modules` en PnP ; les outils peuvent demander des SDK |
| Bun | Cache global | Aussi un runtime |

- **Dépendances fantômes** : avec la disposition à plat de npm, du code peut importer un paquet qu'il n'a jamais déclaré parce qu'il a été remonté ; cela casse quand l'arbre change. pnpm l'empêche.
- **`packageManager`** dans `package.json` fixe la version du gestionnaire ; **Corepack** le lit. Node 25 et plus ne livrent plus Corepack : installez-le avec `npm install -g corepack`, ou laissez pnpm et Yarn lire le champ eux-mêmes.

### Reproductibilité et registres

Un lockfile fige les archives, pas ce qui se passe ensuite : les paquets optionnels propres à la plateforme et les modules natifs compilés par des scripts d'installation peuvent différer. Construisez dans l'image où vous exécutez, et préférez les binaires Node-API précompilés.

Beaucoup d'entreprises installent via un **proxy de registre** (Artifactory, Verdaccio, GitHub Packages) : il met en cache, héberge les paquets internes, applique des règles et continue de marcher quand le registre public est lent.

**À retenir.** Commitez le lockfile, utilisez `npm ci` dans l'automatisation, mettez à jour volontairement, utilisez overrides et workspaces avec parcimonie et en connaissance de cause, et sachez ce que votre gestionnaire de paquets fait différemment.

## Partie 7 — Publier

### Le registre et les versions

Le registre npm stocke les paquets publiés ; tout le monde peut publier et personne ne relit le code avant. Une **version publiée est immuable** : une correction est une nouvelle version.

```sh
npm pack --dry-run       # lister les fichiers qui seraient livrés
npm version minor        # 1.4.0 -> 1.5.0, commit et tag v1.5.0
npm publish --access public
```

- Le champ **`files`** est une liste blanche de ce qu'il faut livrer ; plus sûr que `.npmignore`.
- Une **portée** (`@acme/logger`) est un espace de noms ; les paquets à portée sont privés par défaut, la première publication publique demande donc `--access public`.
- Les **dist-tags** nomment des versions : les installations utilisent `latest`. Publiez une préversion avec `npm publish --tag next`.

### La forme d'un paquet moderne

- Livrez du **JavaScript plus des fichiers `.d.ts`** ; désignez-les par une condition `types` en tête de `exports`. Node ne retire pas les types dans `node_modules`.
- **Uniquement de l'ESM** est raisonnable pour une nouvelle bibliothèque : toutes les lignes de Node soutenues peuvent la charger par `require()`, à condition que les points d'entrée n'aient pas d'`await` au niveau supérieur.
- **Déclarez les dépendances** plutôt que de les regrouper, pour que les utilisateurs puissent dédoublonner, auditer et corriger.
- **`prepare`** tourne avant pack et publish, après une installation locale, et pour les installations depuis Git ; **`prepublishOnly`** seulement avant publish.
- Vérifiez l'**archive empaquetée** avec publint et Are the Types Wrong, et importez-la depuis un projet vierge avec `import` et `require`.

### Publication de confiance et provenance

La **publication de confiance** permet à un workflow de CI de publier sans aucun jeton stocké : sur npmjs.com, le paquet fait confiance à un dépôt et à un workflow, et le job obtient un identifiant éphémère par OIDC. Elle demande npm 11.5.1 ou plus et marche avec GitHub Actions et GitLab CI.

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

La **provenance**, générée automatiquement avec la publication de confiance, relie chaque version à son dépôt, son commit et son workflow, signée avec Sigstore ; `npm audit signatures` la vérifie. Elle prouve où un paquet a été construit, pas que son code est sûr.

### Quand quelque chose tourne mal

- La dépublication n'est permise que pour les paquets récents ou peu utilisés, depuis left-pad (2016). Publiez une correction et `npm deprecate pkg@4.1.0 "message"` ; ramenez `latest` en arrière avec `npm dist-tag` au besoin.
- Abandonner une ligne de Node est une **majeure**.

**À retenir.** Livrez ce que vous voulez (`files`, `npm pack`), du JavaScript avec ses types, `exports` avec `types` en premier, des dist-tags pour les préversions, publiez depuis la CI avec la publication de confiance, et corrigez vers l'avant.

## Partie 8 — Sécurité et chaîne d'approvisionnement

### Ce qui peut mal tourner

| Menace | Exemple | Défense |
|---|---|---|
| Vulnérabilités connues | Un avis sur une dépendance | `npm audit`, Dependabot, montées de version ciblées et overrides |
| Scripts d'installation malveillants | Un `postinstall` vole des jetons | `ignore-scripts=true`, la liste d'approbation de pnpm |
| Mainteneur compromis | Un ver republie des paquets | Délai avant adoption, provenance, identifiants éphémères |
| Typosquatting | `expresss` | Vérifier noms, téléchargements et dépôts |
| Confusion de dépendances | `billing-utils@99.0.0` public | Portées liées au registre privé |
| Injection de lockfile | Une URL `resolved` vers un hôte inconnu | lockfile-lint, relire les diffs de lockfile |
| Injection de workflow | `pull_request_target` qui lance le code d'un fork | Ne jamais exécuter de code non fiable avec des secrets ; publication de confiance |

### 2025, l'année des vers

En septembre 2025, un hameçonnage a donné à des attaquants le contrôle de paquets très utilisés, et le ver **Shai-Hulud** s'est propagé seul : des scripts d'installation volaient les identifiants npm et GitHub et publiaient des versions infectées des autres paquets des victimes, des centaines en quelques jours, avec une seconde vague en novembre. Quelques semaines plus tôt, un workflow GitHub utilisant `pull_request_target` avait laissé fuir le jeton de publication d'un monorepo populaire.

La réponse de npm, achevée en décembre 2025 :

- **Jetons classiques révoqués** ; les jetons granulaires d'écriture durent au plus 90 jours.
- **`npm login`** donne une session de deux heures, avec 2FA pour publier ; la 2FA est active par défaut pour les nouveaux paquets.
- **Publication de confiance** recommandée pour la CI.

### Les habitudes qui marchent

- **Retarder les nouvelles versions** : la plupart des versions malveillantes sont repérées en quelques heures ou jours.

```ini
# .npmrc
min-release-age=3
ignore-scripts=true
@acme:registry=https://npm.acme.dev/
//npm.acme.dev/:_authToken=${NPM_TOKEN}
```

`min-release-age` se compte en jours (npm 11.10 et plus) ; pnpm 11 règle `minimumReleaseAge` à un jour par défaut, et Yarn a `npmMinimalAgeGate`.

- **Désactivez les scripts d'installation** et reconstruisez explicitement les quelques paquets natifs (`npm rebuild sharp`) ; pnpm 10 vous demande de les approuver avec `pnpm approve-builds`.
- **Lisez `npm audit` selon l'atteignabilité**, pas seulement la gravité ; `npm audit fix --force` peut sauter des majeures.
- **Gardez les secrets hors du code et des fichiers** : jetons par variables d'environnement, `.npmrc` avec `${NPM_TOKEN}`, `.env` ignoré par Git.
- **Les empreintes `integrity`** du lockfile figent des octets, pas la sûreté : une version malveillante verrouillée aujourd'hui reste malveillante, et un attaquant qui modifie `resolved` peut fournir une empreinte assortie.

**À retenir.** Partez du principe que toute dépendance peut devenir hostile : peu de dépendances, scripts d'installation désactivés, nouvelles versions retardées, portées pour les noms internes, diffs de lockfile relus, et aucun jeton durable nulle part.

## Exercices

1. Le service d'un collègue tourne sur Node 20 en production. Que lui dites-vous, et que changez-vous dans le dépôt ?
2. Convertissez ce fichier CommonJS en ESM : `const fs = require("fs"); const p = require("path").join(__dirname, "a.txt"); module.exports = () => fs.readFileSync(p, "utf8");`
3. Qu'affiche ceci dans un script CommonJS, et pourquoi ? `setTimeout(() => log(1)); setImmediate(() => log(2)); Promise.resolve().then(() => log(3)); process.nextTick(() => log(4)); log(5);`
4. Un service Node derrière un répartiteur avec un délai d'inactivité de 60 secondes renvoie de rares erreurs 502, et ses appels `fetch` sortants se mettent peu à peu à faire la queue. Donnez une cause pour chacun.
5. Une bibliothèque dépend de `"^0.4.2"` d'un analyseur. La version 0.5.0 est sortie. Les utilisateurs l'auront-ils à leur prochaine installation ? Et 0.4.9 ?
6. Votre CI lance `npm install` et modifie parfois le lockfile. Que changez-vous, et pourquoi ?
7. Écrivez le champ `exports` d'un paquet uniquement ESM dont l'entrée est `dist/index.js`, les types `dist/index.d.ts`, avec un sous-chemin public `./cli`.
8. Citez quatre réglages ou pratiques qui auraient limité les dégâts d'un ver comme Shai-Hulud sur le portable d'un développeur et en CI.

### Réponses

1. Node 20 a atteint sa fin de vie en avril 2026 et ne reçoit plus de correctifs de sécurité. Passez à Node 24 ou 26 : mettez à jour `.nvmrc`, `engines`, la matrice de CI et l'image de base, lancez les tests, et lisez les changements cassants de chaque majeure.
2. `import { readFileSync } from "node:fs"; import path from "node:path"; const p = path.join(import.meta.dirname, "a.txt"); export default () => readFileSync(p, "utf8");` avec `"type": "module"` ou une extension `.mjs`.
3. 5, 4, 3, puis 1 et 2 dans un ordre non garanti depuis le script principal : le code synchrone d'abord, puis `nextTick`, puis les callbacks de promesses, puis les phases timers et check de la boucle.
4. Les 502 : le `keepAliveTimeout` de Node (5 secondes) est plus court que le délai d'inactivité du répartiteur ; réglez-le au-dessus de 60 secondes. La file d'attente : des corps de réponse jamais lus gardent occupées les connexions du pool ; lisez ou annulez chaque corps.
5. Pas 0.5.0 : sur 0.x, l'accent circonflexe n'autorise que 0.4.x. Oui pour 0.4.9.
6. Utilisez `npm ci` : il installe exactement le lockfile et échoue quand `package.json` et le lockfile ne concordent pas, au lieu de le réécrire en silence.
7. `"exports": { ".": { "types": "./dist/index.d.ts", "default": "./dist/index.js" }, "./cli": "./dist/cli.js" }`, avec `"type": "module"`.
8. `ignore-scripts=true` (ou la liste d'approbation de pnpm), `min-release-age` ou `minimumReleaseAge`, aucun jeton npm durable (publication de confiance en CI, sessions courtes en local), des secrets hors des fichiers lisibles par les scripts, et `npm ci` depuis un lockfile relu.

## Sources

Pages de référence pour chaque partie. Les outils et les dates changent : vérifiez la page avant de vous fier à un détail.

| Partie | Pages |
|---|---|
| 1 | [Node.js releases](https://nodejs.org/en/about/previous-releases) · [Evolving the Node.js release schedule](https://nodejs.org/en/blog/announcements/evolving-the-nodejs-release-schedule) |
| 2 | [Node.js modules: packages](https://nodejs.org/api/packages.html) · [ECMAScript modules](https://nodejs.org/api/esm.html) |
| 3 | [The Node.js event loop](https://nodejs.org/en/learn/asynchronous-work/event-loop-timers-and-nexttick) · [Streams](https://nodejs.org/api/stream.html) |
| 4 | [Node.js API documentation](https://nodejs.org/api/) · [Running TypeScript natively](https://nodejs.org/en/learn/typescript/run-natively) |
| 5 | [package.json](https://docs.npmjs.com/cli/configuring-npm/package-json) · [Semantic Versioning](https://semver.org/) |
| 6 | [npm ci](https://docs.npmjs.com/cli/commands/npm-ci) · [pnpm](https://pnpm.io/) · [Yarn](https://yarnpkg.com/) |
| 7 | [Trusted publishing for npm packages](https://docs.npmjs.com/trusted-publishers) · [Generating provenance statements](https://docs.npmjs.com/generating-provenance-statements) |
| 8 | [npm classic tokens revoked](https://github.blog/changelog/2025-12-09-npm-classic-tokens-revoked-session-based-auth-and-cli-token-management-now-available/) · [Our plan for a more secure npm supply chain](https://github.blog/security/npm/our-plan-for-a-more-secure-npm-supply-chain/) |
