# Node.js and npm — a complete course

## How to use this course

This course explains Node.js and the npm ecosystem: the runtime and its versions, modules, the event loop, the built-in APIs, `package.json` and semantic versioning, installing and lockfiles, publishing packages, and the security of the supply chain. It describes the tools as they are in late 2026 (Node 24 and 26, npm 11, pnpm 10 and 11) and favours what will still hold when they change.

**Who it is for.** Developers who write JavaScript or TypeScript for servers, tools or build pipelines, and anyone who maintains a `package.json`. You should know the JavaScript language; the later parts assume you have used a terminal and Git.

**How it is organised.** Eight parts in two blocks:

| Block | Parts | What you can do after it |
|---|---|---|
| The platform | 1 The runtime · 2 Modules · 3 Asynchrony · 4 Built-in APIs | Write, run, debug and operate Node programs without surprises |
| npm and the ecosystem | 5 package.json and semver · 6 Installing · 7 Publishing · 8 Security | Manage dependencies, ship packages and keep the supply chain under control |

Each part ends with what to remember. The exercises at the end give one task per part, with answers.

**With Luma.** The *📦 Node.js et npm* test in Luma's *Informatique* group follows the same topics at four levels (Débutant to Expert), with 128 written questions; a wrong answer links to its part. Luma itself is a Node and TypeScript application built with npm, which this course uses for examples.

**What you need.** Node 24 or later, installed with a version manager (Part 1), and a terminal. Part 7 assumes a GitHub account if you want to try trusted publishing.

## Part 1 — The runtime

### What Node is

Node.js runs JavaScript outside the browser. It is made of the **V8** engine (from Chrome), **libuv** for asynchronous input and output, and a standard library: `fs`, `http`, `crypto`, `stream`, `worker_threads` and more. There is no DOM; there are files, sockets, processes and environment variables.

```sh
node --version          # v24.11.0, for instance
node                    # the REPL: type expressions, .exit to leave
node app.js             # run a file
node --watch app.js     # restart when an imported file changes
```

### Versions and support

Every Node line has a life: **Current** for months, then **LTS** (Long Term Support) with fixes for about two and a half years, then end of life. Production runs an LTS line.

| Line | Status in November 2026 | End of life |
|---|---|---|
| 22 | Maintenance LTS | April 2027 |
| 24 | Maintenance LTS | April 2028 |
| 26 | Active LTS | April 2029 |
| 27 | Alpha, released as Current in April 2027 | April 2030 |

Node 26 is the last line of the old model, with two majors a year and only even ones becoming LTS. From Node 27, there is **one major a year**: alphas from October, a Current release in April, LTS in October, thirty months of support, and the number matches the year. Check the schedule on nodejs.org; dates can move.

### One version per project

A **version manager** (nvm, fnm, Volta, or mise) installs several versions side by side and switches per folder. Write the major in `.nvmrc` (or `.node-version`), state it in `package.json`, and use the same one in CI and in the container image:

```json
{
  "engines": { "node": ">=24" }
}
```

npm only warns when `engines` does not match, unless `engine-strict=true` is set in `.npmrc`.

### Running in production

- **Exit codes**: 0 is success. Set `process.exitCode = 1` and let the program end, rather than `process.exit(1)`, which can cut off output still being written.
- **Signals**: platforms send `SIGTERM`, then `SIGKILL` after a grace period. Close the server, finish requests, close pools, exit.
- **PID 1**: in a container, start Node directly with the exec form `CMD ["node", "server.js"]`. `npm start` or a shell as PID 1 may not forward signals, and Node as PID 1 ignores `SIGTERM` unless you handle it.

```js
process.on("SIGTERM", () => {
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(1), 10_000).unref();
});
```

### Using every core

JavaScript runs on one thread per process. CPU-heavy work (image processing, parsing huge files) blocks every request on that thread. Options:

- **Worker threads** (`node:worker_threads`), each with its own event loop and heap, communicating by messages; a pool such as Piscina reuses them.
- **Several processes** behind a load balancer, which also isolates failures; on a platform such as Cloud Run or Kubernetes, simply run more instances.
- **libuv's thread pool** already runs file system calls, `dns.lookup`, async crypto (`scrypt`, `pbkdf2`) and zlib, four threads by default (`UV_THREADPOOL_SIZE`). Network sockets do not use it.

### Debugging and diagnosis

- `node --inspect app.js` opens a debugger on 127.0.0.1:9229 for Chrome DevTools or an editor. Never expose it publicly: it allows running any code.
- `node --cpu-prof` writes a CPU profile; `monitorEventLoopDelay` from `node:perf_hooks` measures how late the loop runs.
- Memory leaks: take **heap snapshots** some time apart and compare them, or use `--heapsnapshot-near-heap-limit`. Typical causes are unbounded caches, listeners added per request and timers holding closures.
- **Native addons** written against **Node-API** keep working across majors; older ones built against V8 directly need rebuilding.

**What to remember.** Run an LTS line, pin it per project, exit and shut down cleanly, keep CPU-heavy work off the main thread, and measure the loop before guessing.

## Part 2 — Modules

### Two systems

| | CommonJS | ES modules (ESM) |
|---|---|---|
| Syntax | `require`, `module.exports` | `import`, `export` |
| Loading | Synchronous | Asynchronous, top-level `await` allowed |
| File | `.cjs`, or `.js` without `"type"` | `.mjs`, or `.js` with `"type": "module"` |
| Own path | `__dirname`, `__filename` | `import.meta.dirname`, `import.meta.filename` |
| Exports | A copied value | Live bindings |

New code is written as ESM. Set `"type": "module"` in `package.json`; `.cjs` and `.mjs` override it per file.

```js
import { readFile } from "node:fs/promises";
import { parse } from "./parser.js";          // the extension is required
import config from "./config.json" with { type: "json" };

export function load(path) {
  return readFile(path, "utf8").then(parse);
}
```

- The **`node:` prefix** always means a built-in module and is required for some (`node:test`, `node:sqlite`).
- Relative imports in ESM need the **full file name**; bundlers and TypeScript sometimes accept less, plain Node does not.
- **Dynamic `import()`** loads a module when the line runs, from ESM or CommonJS; useful for plugins and rarely used features.

### Mixing them

Since Node 22.12 and 20.19, **`require(esm)`** works: CommonJS can `require()` an ES module, unless the module graph uses top-level `await` (then `ERR_REQUIRE_ASYNC_MODULE`; use `await import()`). ESM has always been able to import CommonJS.

**Live bindings**: an ESM importer sees later changes to an exported `let`; `const { count } = require("./counter")` copies the value once.

### How a package is found

A bare specifier such as `"lodash"` is looked up in `node_modules` folders, walking up from the importing file. In the package found, `exports` (or the older `main`) picks the file.

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

- `exports` is the **public surface**: other paths fail with `ERR_PACKAGE_PATH_NOT_EXPORTED`.
- **Conditions are tried in order**, first match wins: `types` first, `default` last.
- **`imports`** entries start with `#` and give private aliases inside the package, with no bundler.

### Pitfalls

- **Dual package hazard**: a package shipping both a CommonJS and an ESM build can load twice, with two copies of its state. Shipping ESM only avoids it now that `require(esm)` exists.
- **The ESM cache** is keyed by URL and never shrinks: `import("./x.js?v=" + Date.now())` reloads but leaks memory.
- **Customization hooks** (`resolve` and `load`, registered with `module.register` or `module.registerHooks` from a file passed to `--import`) let tools transform modules as they load, for TypeScript, mocks or coverage.

**What to remember.** Write ESM with explicit extensions and `node:` built-ins, define `exports` with `types` first, keep top-level `await` out of entry points, and remember that `require(esm)` closed most of the gap.

## Part 3 — Asynchrony and the event loop

### One thread, many connections

Node starts an I/O operation, keeps running other code, and runs a callback when the result is ready. That is why one process serves thousands of connections; it is also why one long computation makes every request wait. Functions ending in `Sync` block the thread: fine at startup or in a script, not in a request handler.

### The order of things

After the current code, Node runs the **microtasks**: the `process.nextTick` queue, then promise callbacks. Then the loop goes through its phases:

| Phase | Runs |
|---|---|
| Timers | `setTimeout`, `setInterval` callbacks that are due |
| Pending | Some deferred system callbacks |
| Poll | I/O: new connections, data, file results |
| Check | `setImmediate` callbacks |
| Close | `close` events |

```js
setTimeout(() => console.log("timeout"));
Promise.resolve().then(() => console.log("promise"));
process.nextTick(() => console.log("tick"));
console.log("sync");
// In CommonJS: sync, tick, promise, timeout
```

In an ES module the script itself runs as a microtask, so promise callbacks can come before `nextTick`. Inside an I/O callback, `setImmediate` always runs before a 0 ms timer. Do not build logic on these details.

A chain of `nextTick` or promise callbacks that keeps refilling itself **starves** the loop: I/O never runs. Yield with `setImmediate` or work in bounded batches.

### Promises and errors

- `await Promise.all([...])` rejects on the first failure; the others keep running. `Promise.allSettled` reports each outcome.
- An **unhandled rejection** crashes the process (since Node 15). A promise started early and awaited late can trigger it: `const p = a(); await b(); await p;` crashes if `p` rejects during `b()`. Use `Promise.all([a(), b()])`.
- An `EventEmitter` that emits `error` with no listener **throws**. Every stream and socket needs an error handler, or wrapping with `pipeline` or `events.once`.

### Cancellation

`AbortSignal` is the common way to cancel: `fetch`, `fs/promises`, streams, timers and `events.once` accept one.

```js
const signal = AbortSignal.any([userSignal, AbortSignal.timeout(5000)]);
const res = await fetch(url, { signal });
```

`Promise.race` with a timer only stops waiting; the request goes on.

### Streams and backpressure

Streams process data in chunks, so memory stays flat. When a consumer is slow, `write()` returns `false` and the producer should wait for `drain`. `pipeline` does that, forwards errors from any stage and closes everything:

```js
import { pipeline } from "node:stream/promises";
import { createReadStream, createWriteStream } from "node:fs";
import { createGzip } from "node:zlib";

await pipeline(createReadStream("big.log"), createGzip(), createWriteStream("big.log.gz"));
```

An async generator can be a stage, and `for await (const chunk of stream)` reads one.

### Context and threads

- **`AsyncLocalStorage`** (`node:async_hooks`) carries a value, such as a request id, through `await` and callbacks without passing it around; tracing tools rely on it.
- **Workers** receive messages by structured clone, a copy. A large `ArrayBuffer` can be **transferred** instead (`postMessage(buf, [buf])`), or shared as a `SharedArrayBuffer` with `Atomics`.

**What to remember.** Never block the thread, handle every rejection and every `error` event, pass signals for cancellation, use `pipeline` for streams, and do not rely on the fine order of callbacks.

## Part 4 — Built-in APIs

### Files, environment, paths

```js
import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";

const port = Number(process.env.PORT ?? 3000);
const dataDir = path.join(import.meta.dirname, "data");
await mkdir(dataDir, { recursive: true });
const text = await readFile(path.join(dataDir, "notes.txt"), "utf8");
```

- `process.env` values are strings or `undefined`.
- `path.resolve` builds an absolute path from the working directory; `path.join` only joins. For files next to a module, start from `import.meta.dirname`.
- `node --env-file=.env app.js` loads a `.env` file (since 20.6); variables already in the environment win. Keep `.env` out of Git and commit a `.env.example`.

### HTTP, in and out

```js
import { createServer } from "node:http";

const server = createServer((req, res) => {
  res.writeHead(200, { "content-type": "text/plain" });
  res.end("ok");
});
server.listen(8080);
```

- **Global `fetch`** (since 18, stable since 21) is built on undici. Check `res.ok`: a 404 does not reject. **Read or cancel every body** (`await res.text()`, `res.body?.cancel()`): an unread body keeps its pooled connection busy.
- **Behind a load balancer**, set `server.keepAliveTimeout` above the balancer's idle timeout (often 60 seconds; Node's default is 5), and `headersTimeout` higher still, or the balancer will reuse connections Node has closed and return 502 errors.

### Tests, scripts, arguments

- **`node --test`** runs `*.test.js` files written with `node:test` and `node:assert`: `describe`, `it`, hooks, mocks, snapshots, watch mode.
- **`node --run build`** runs a `package.json` script without npm's startup or its `pre` and `post` hooks.
- **`parseArgs`** from `node:util` parses command-line options for small tools.

### TypeScript without a build

Node strips types from `.ts` files it runs: on by default since 23.6 and 22.18, stable in Node 24.

- No type checking: run `tsc --noEmit` in CI.
- No `tsconfig`; only erasable syntax. `enum`, namespaces with code and parameter properties need `--experimental-transform-types`; turn on `erasableSyntaxOnly` in TypeScript to stay within bounds.
- Write imports with `.ts` and use `import type` for types. Not applied inside `node_modules`: packages publish JavaScript.

### Processes and crypto

- **`execFile(cmd, args)`** or `spawn` passes arguments without a shell; `exec` with a built string invites command injection.
- **`timingSafeEqual`** from `node:crypto` compares secrets in constant time; `===` leaks timing. `randomUUID()` and `randomBytes()` give secure randomness.
- **`node:vm`** separates global scopes but is **not a security boundary**. Untrusted code needs process or OS isolation.

### Permissions and instrumentation

- **The permission model**: `node --permission --allow-fs-read=./data app.js` denies writes, child processes, workers and other reads. It is a seat belt against mistakes, not a sandbox for hostile code.
- **Instrumentation** such as OpenTelemetry is preloaded with `node --import ./instrumentation.js app.js`, so it hooks `http` and database clients before the app loads them; libraries publish events through `diagnostics_channel`.

**What to remember.** The standard library now covers files, HTTP clients and servers, tests, `.env`, arguments and TypeScript stripping; read every response body, set keep-alive behind balancers, avoid shells, and do not mistake `vm` or permissions for a sandbox.

## Part 5 — package.json and semantic versioning

### The manifest

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

- **`dependencies`** are needed at run time, **`devDependencies`** only to build and test; `npm ci --omit=dev` skips the latter.
- **`peerDependencies`** are provided by the host: a plugin declares the ESLint or React it works with. npm 7 and later install them and stop with `ERESOLVE` on conflict; `--legacy-peer-deps` only hides it.
- **`optionalDependencies`** with `os` and `cpu` fields let tools such as esbuild ship one binary package per platform, of which only the matching one installs.
- **`bin`** maps command names to files starting with `#!/usr/bin/env node`.

### Scripts

`npm run lint` puts `node_modules/.bin` on the `PATH`, so the project's own ESLint runs. `test`, `start` and a few others have shortcuts. `pretest` and `posttest` run around `test` automatically; many teams prefer explicit chains.

### Semantic versioning

MAJOR.MINOR.PATCH: a major breaks compatibility, a minor adds features, a patch fixes bugs.

| Range | Allows | Note |
|---|---|---|
| `^5.1.0` | 5.1.0 to below 6.0.0 | npm's default |
| `~5.1.0` | 5.1.0 to below 5.2.0 | Patches only |
| `5.1.0` | 5.1.0 | Exact |
| `^0.8.3` | 0.8.3 to below 0.9.0 | On 0.x, a minor may break |
| `^1.3.0-beta.0` | Betas of 1.3.0, then 1.3.x | Prereleases match only when named |

What counts as **breaking** is anything that can break a user within their range: removing an API, changing `exports`, dropping a Node line, or making TypeScript types stricter. Write your policy down.

### Finding out why

`npm ls pkg --all` and `npm explain pkg` show which dependencies bring a package in. `npm outdated` shows "wanted" (newest in range) and "latest" (newest published).

**What to remember.** Keep run-time and dev dependencies apart, declare peers for plugins, use caret ranges and understand 0.x and prereleases, and treat type and runtime changes as part of your API.

## Part 6 — Installing and lockfiles

### What install does

`npm install zod` downloads zod and its dependencies into `node_modules`, adds a range to `package.json`, and records the exact versions of the whole tree, with their `resolved` URLs and `integrity` hashes, in `package-lock.json`.

- Commit the **lockfile**; never commit `node_modules`.
- **`npm ci`** installs exactly the lockfile from an empty `node_modules` and fails if it disagrees with `package.json`. Use it in CI and Dockerfiles.
- **`npm update`** moves within ranges; a new major needs `npm install pkg@latest`, reviewed with its changelog. Dependabot or Renovate schedule these updates.
- **`npx tool`** (or `npm exec`) runs a package's command without a global install.

### Controlling the tree

```json
{
  "overrides": { "semver": "^7.6.3" },
  "workspaces": ["packages/*"]
}
```

- **`overrides`** force a version anywhere in the tree, for example to patch a transitive vulnerability. Remove it once the parent is fixed.
- **Workspaces** make a monorepo: one install, one lockfile, local packages linked by name. `npm run build --workspaces` runs in each.
- **`npm dedupe`** collapses duplicates when ranges allow; two copies of a singleton such as React break hooks.
- A **lockfile merge conflict**: resolve `package.json`, run `npm install`, commit. Deleting the lockfile re-resolves everything.

### Other package managers

| Tool | Layout | Notes |
|---|---|---|
| npm | Flat `node_modules`, hoisted | Ships with Node |
| pnpm | Content-addressable store, hard links, symlinked tree | Strict: no phantom dependencies; install scripts need approval since 10 |
| Yarn (Berry) | Plug'n'Play (`.pnp.cjs`) or `node_modules` | No `node_modules` in PnP; tools may need SDKs |
| Bun | Global cache | Also a runtime |

- **Phantom dependencies**: with npm's flat layout, code can import a package it never declared because it was hoisted; it breaks when the tree changes. pnpm prevents it.
- **`packageManager`** in `package.json` pins the manager's version; **Corepack** reads it. Node 25 and later no longer ship Corepack: install it with `npm install -g corepack`, or let pnpm and Yarn read the field themselves.

### Reproducibility and registries

A lockfile pins tarballs, not what happens after: platform-specific optional packages and native addons built by install scripts can differ. Build in the image you run, and prefer prebuilt Node-API binaries.

Many companies install through a **registry proxy** (Artifactory, Verdaccio, GitHub Packages): it caches, hosts internal packages, applies policies, and keeps working when the public registry is slow.

**What to remember.** Commit the lockfile, use `npm ci` in automation, update deliberately, use overrides and workspaces sparingly and knowingly, and know what your package manager does differently.

## Part 7 — Publishing

### The registry and versions

The npm registry stores published packages; anyone can publish and nobody reviews code first. A **published version is immutable**: a fix is a new version.

```sh
npm pack --dry-run       # list the files that would ship
npm version minor        # 1.4.0 -> 1.5.0, commit and tag v1.5.0
npm publish --access public
```

- The **`files`** field is an allowlist of what to ship; safer than `.npmignore`.
- A **scope** (`@acme/logger`) is a namespace; scoped packages are private by default, so the first public publish needs `--access public`.
- **Dist-tags** name versions: installs use `latest`. Publish a prerelease with `npm publish --tag next`.

### Shape of a modern package

- Ship **JavaScript plus `.d.ts`** files; point to them with a `types` condition first in `exports`. Node does not strip types inside `node_modules`.
- **ESM only** is reasonable for a new library: every supported Node line can `require()` it, provided entry points have no top-level `await`.
- **Declare dependencies** rather than bundling them, so users can deduplicate, audit and patch.
- **`prepare`** runs before pack and publish, after a local install, and for Git installs; **`prepublishOnly`** only before publish.
- Check the **packed tarball** with publint and Are the Types Wrong, and import it from a scratch project with both `import` and `require`.

### Trusted publishing and provenance

**Trusted publishing** lets a CI workflow publish without any stored token: on npmjs.com the package trusts one repository and workflow, and the job gets a short-lived credential through OIDC. It needs npm 11.5.1 or later and works with GitHub Actions and GitLab CI.

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

**Provenance**, generated automatically with trusted publishing, links each version to its repository, commit and workflow, signed with Sigstore; `npm audit signatures` verifies it. It proves where a package was built, not that its code is safe.

### When something goes wrong

- Unpublishing is allowed only for young or barely used packages, since left-pad (2016). Publish a fix and `npm deprecate pkg@4.1.0 "message"`; move `latest` back with `npm dist-tag` if needed.
- Dropping a Node line is a **major**.

**What to remember.** Ship what you mean (`files`, `npm pack`), JavaScript with types, `exports` with `types` first, dist-tags for prereleases, publish from CI with trusted publishing, and fix forward.

## Part 8 — Security and the supply chain

### What can go wrong

| Threat | Example | Defence |
|---|---|---|
| Known vulnerabilities | An advisory on a dependency | `npm audit`, Dependabot, targeted upgrades and overrides |
| Malicious install scripts | `postinstall` steals tokens | `ignore-scripts=true`, pnpm's approval list |
| Compromised maintainer | A worm republishes packages | Release-age delay, provenance, short-lived credentials |
| Typosquatting | `expresss` | Check names, downloads and repositories |
| Dependency confusion | Public `billing-utils@99.0.0` | Scopes mapped to the private registry |
| Lockfile injection | A `resolved` URL to an unknown host | lockfile-lint, review lockfile diffs |
| Workflow injection | `pull_request_target` running fork code | Never run untrusted code with secrets; trusted publishing |

### 2025, the year of the worms

In September 2025, phishing gave attackers control of widely used packages, and the **Shai-Hulud** worm spread by itself: install scripts stole npm and GitHub credentials and published infected versions of the victims' other packages, hundreds within days, with a second wave in November. Weeks earlier, a GitHub workflow using `pull_request_target` had leaked the publish token of a popular monorepo.

npm's response, completed in December 2025:

- **Classic tokens revoked**; granular write tokens last at most 90 days.
- **`npm login`** gives a two-hour session, with 2FA to publish; 2FA is on by default for new packages.
- **Trusted publishing** recommended for CI.

### Habits that work

- **Delay new versions**: most malicious releases are caught within hours or days.

```ini
# .npmrc
min-release-age=3
ignore-scripts=true
@acme:registry=https://npm.acme.dev/
//npm.acme.dev/:_authToken=${NPM_TOKEN}
```

`min-release-age` is in days (npm 11.10 and later); pnpm 11 sets `minimumReleaseAge` to one day by default, and Yarn has `npmMinimalAgeGate`.

- **Turn off install scripts** and rebuild the few native packages explicitly (`npm rebuild sharp`); pnpm 10 asks you to approve them with `pnpm approve-builds`.
- **Read `npm audit` by reachability**, not only severity; `npm audit fix --force` may jump majors.
- **Keep secrets out of code and files**: tokens through environment variables, `.npmrc` with `${NPM_TOKEN}`, `.env` ignored by Git.
- **The `integrity` hashes** in the lockfile pin bytes, not safety: a malicious version locked today stays malicious, and an attacker who edits `resolved` can supply a matching hash.

**What to remember.** Assume any dependency can turn hostile: few dependencies, install scripts off, new versions delayed, scopes for internal names, lockfile diffs reviewed, and no long-lived tokens anywhere.

## Exercises

1. A colleague's service runs on Node 20 in production. What do you tell them, and what do you change in the repository?
2. Convert this CommonJS file to ESM: `const fs = require("fs"); const p = require("path").join(__dirname, "a.txt"); module.exports = () => fs.readFileSync(p, "utf8");`
3. What does this print in a CommonJS script, and why? `setTimeout(() => log(1)); setImmediate(() => log(2)); Promise.resolve().then(() => log(3)); process.nextTick(() => log(4)); log(5);`
4. A Node service behind a load balancer with a 60-second idle timeout returns rare 502 errors, and its outgoing `fetch` calls slowly start to queue. Name one cause of each.
5. A library depends on `"^0.4.2"` of a parser. Version 0.5.0 is out. Will users get it on their next install? What about 0.4.9?
6. Your CI runs `npm install` and sometimes changes the lockfile. What do you change, and why?
7. Write the `exports` field for an ESM-only package with its entry at `dist/index.js`, types at `dist/index.d.ts`, and a public subpath `./cli`.
8. List four settings or practices that would have limited the damage of a worm like Shai-Hulud on a developer's laptop and in CI.

### Answers

1. Node 20 reached end of life in April 2026 and receives no security fixes. Move to Node 24 or 26: update `.nvmrc`, `engines`, the CI matrix and the base image, run the tests, and read the breaking changes of each major.
2. `import { readFileSync } from "node:fs"; import path from "node:path"; const p = path.join(import.meta.dirname, "a.txt"); export default () => readFileSync(p, "utf8");` with `"type": "module"` or a `.mjs` extension.
3. 5, 4, 3, then 1 and 2 in an order not guaranteed from the main script: synchronous code first, then `nextTick`, then promise callbacks, then the loop's timers and check phases.
4. The 502s: Node's `keepAliveTimeout` (5 seconds) is shorter than the balancer's idle timeout, so set it above 60 seconds. The queueing: response bodies that are never read keep pooled connections busy; read or cancel every body.
5. Not 0.5.0: on 0.x the caret allows only 0.4.x. Yes for 0.4.9.
6. Use `npm ci`: it installs exactly the lockfile and fails when `package.json` and the lockfile disagree, instead of silently rewriting it.
7. `"exports": { ".": { "types": "./dist/index.d.ts", "default": "./dist/index.js" }, "./cli": "./dist/cli.js" }`, with `"type": "module"`.
8. `ignore-scripts=true` (or pnpm's approval list), `min-release-age` or `minimumReleaseAge`, no long-lived npm tokens (trusted publishing in CI, short sessions locally), secrets out of files readable by scripts, and `npm ci` from a reviewed lockfile.

## Sources

Reference pages for each part. Tools and dates change: check the page before relying on a detail.

| Part | Pages |
|---|---|
| 1 | [Node.js releases](https://nodejs.org/en/about/previous-releases) · [Evolving the Node.js release schedule](https://nodejs.org/en/blog/announcements/evolving-the-nodejs-release-schedule) |
| 2 | [Node.js modules: packages](https://nodejs.org/api/packages.html) · [ECMAScript modules](https://nodejs.org/api/esm.html) |
| 3 | [The Node.js event loop](https://nodejs.org/en/learn/asynchronous-work/event-loop-timers-and-nexttick) · [Streams](https://nodejs.org/api/stream.html) |
| 4 | [Node.js API documentation](https://nodejs.org/api/) · [Running TypeScript natively](https://nodejs.org/en/learn/typescript/run-natively) |
| 5 | [package.json](https://docs.npmjs.com/cli/configuring-npm/package-json) · [Semantic Versioning](https://semver.org/) |
| 6 | [npm ci](https://docs.npmjs.com/cli/commands/npm-ci) · [pnpm](https://pnpm.io/) · [Yarn](https://yarnpkg.com/) |
| 7 | [Trusted publishing for npm packages](https://docs.npmjs.com/trusted-publishers) · [Generating provenance statements](https://docs.npmjs.com/generating-provenance-statements) |
| 8 | [npm classic tokens revoked](https://github.blog/changelog/2025-12-09-npm-classic-tokens-revoked-session-based-auth-and-cli-token-management-now-available/) · [Our plan for a more secure npm supply chain](https://github.blog/security/npm/our-plan-for-a-more-secure-npm-supply-chain/) |
