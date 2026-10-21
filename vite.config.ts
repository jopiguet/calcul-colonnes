import { readFileSync } from "node:fs";
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

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const port = Number(env.PORT) || 8787;
  return {
    define: { __BUILD_ID__: JSON.stringify(mode === "production" ? buildId : "dev") },
    plugins: [versionFile()],
    server: {
      // `npm run dev`: the app is served by Vite, /api goes to the API server.
      // changeOrigin false keeps the browser's Host header (localhost:5173):
      // the server's origin check compares it with the request's Origin.
      proxy: { "/api": { target: `http://localhost:${port}`, changeOrigin: false } },
    },
  };
});
