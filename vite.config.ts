import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const port = Number(env.PORT) || 8787;
  return {
    server: {
      // `npm run dev`: the app is served by Vite, /api goes to the API server.
      proxy: { "/api": `http://localhost:${port}` },
    },
  };
});
