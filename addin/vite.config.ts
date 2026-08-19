import react from "@vitejs/plugin-react";
import path from "node:path";
import { defineConfig } from "vite";

/**
 * Word add-in task pane build.
 *
 * Production output lands in dist/public/addin, so the existing Express
 * static handler serves the pane at /addin/taskpane.html on the same origin
 * as /api/trpc — zero server changes, no CORS.
 *
 * Dev: `pnpm dev:addin` serves https://localhost:3100/addin/taskpane.html
 * (Office requires HTTPS) and proxies /api to the local API on :3000.
 */
export default defineConfig(async ({ command }) => {
  let https: unknown;
  if (command === "serve") {
    // Trusted localhost certs from office-addin-dev-certs (run
    // `pnpm addin:certs` once first). Only loaded for the dev server so
    // production builds never touch certificate tooling.
    const devCerts = await import("office-addin-dev-certs");
    https = await devCerts.getHttpsServerOptions();
  }

  return {
    plugins: [react()],
    root: path.resolve(import.meta.dirname),
    base: "/addin/",
    build: {
      outDir: path.resolve(import.meta.dirname, "..", "dist", "public", "addin"),
      emptyOutDir: true,
      rollupOptions: {
        input: path.resolve(import.meta.dirname, "taskpane.html"),
      },
    },
    server: {
      port: 3100,
      https: https as never,
      proxy: {
        "/api": {
          target: "http://localhost:3000",
          changeOrigin: true,
        },
      },
    },
  };
});
