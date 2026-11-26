import { readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { brotliCompressSync, constants, gzipSync } from "node:zlib";
import { defineConfig, loadEnv, type Plugin } from "vite";

/**
 * Each build has its own id, compiled into the app and published as
 * /version.json. The app compares the two (src/update.ts): a window left
 * open, such as the installed desktop app, learns that a new version is out.
 */
const version = (JSON.parse(readFileSync("package.json", "utf8")) as { version: string }).version;
// A release sets BUILD_ID (the git tag, e.g. v6.1.0), so the smoke test can
// check that /version.json is the build it just deployed.
const buildId = process.env.BUILD_ID?.trim() || `${version}+${Date.now().toString(36)}`;

function versionFile(): Plugin {
  return {
    name: "luma-version",
    apply: "build",
    generateBundle() {
      this.emitFile({ type: "asset", fileName: "version.json", source: JSON.stringify({ version, build: buildId }) + "\n" });
    },
  };
}

/**
 * Every text file of the build is also written compressed (.br and .gz): the
 * server sends the one the browser accepts (serveStatic's precompressed), with
 * no work per request. The code shrinks to about a quarter.
 */
function precompress(): Plugin {
  let outDir = "dist";
  return {
    name: "luma-precompress",
    apply: "build",
    configResolved(config) {
      outDir = config.build.outDir;
    },
    closeBundle() {
      const walk = (dir: string): string[] =>
        readdirSync(dir).flatMap((name) => {
          const path = join(dir, name);
          return statSync(path).isDirectory() ? walk(path) : [path];
        });
      for (const path of walk(outDir)) {
        if (!/\.(js|css|html|svg|json|webmanifest|txt|map)$/.test(path)) continue;
        const data = readFileSync(path);
        if (data.length < 1024) continue;
        writeFileSync(`${path}.br`, brotliCompressSync(data, { params: { [constants.BROTLI_PARAM_QUALITY]: 11, [constants.BROTLI_PARAM_SIZE_HINT]: data.length } }));
        writeFileSync(`${path}.gz`, gzipSync(data, { level: 9 }));
      }
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const port = Number(env.PORT) || 8787;
  return {
    define: { __BUILD_ID__: JSON.stringify(mode === "production" ? buildId : "dev"), __APP_VERSION__: JSON.stringify(version) },
    plugins: [versionFile(), precompress()],
    server: {
      // `npm run dev`: the app is served by Vite, /api goes to the API server.
      // changeOrigin false keeps the browser's Host header (localhost:5173):
      // the server's origin check compares it with the request's Origin.
      proxy: { "/api": { target: `http://localhost:${port}`, changeOrigin: false } },
    },
  };
});
