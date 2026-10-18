import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const port = Number(env.PORT) || 8787;
  return {
    server: {
      // `npm run dev`: the app is served by Vite, /api goes to the API server.
      // changeOrigin false keeps the browser's Host header (localhost:5173):
      // the server's origin check compares it with the request's Origin.
      proxy: { "/api": { target: `http://localhost:${port}`, changeOrigin: false } },
    },
  };
});
