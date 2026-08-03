import { defineConfig, loadEnv, build as viteBuild } from "vite";
import { resolve } from "path";
import { copyFileSync, mkdirSync } from "fs";
import type { Plugin } from "vite";

/**
 * After the main SDK bundle is written, build the iframe offerwall bundle
 * as a self-contained IIFE and copy the static HTML alongside it.
 *
 * Both builds share this single vite.config.ts and run from one `npm run build`.
 * A separate sub-build is required because Rollup disallows
 * `inlineDynamicImports: true` when multiple entry points are present,
 * which would break the single-file sdk.js publisher integration.
 */
function buildOfferwallPlugin(apiBase: string): Plugin {
  return {
    name: "build-offerwall",
    apply: "build",
    enforce: "post",
    async closeBundle() {
      await viteBuild({
        configFile: false,
        root: process.cwd(),
        define: {
          __GROWBOLT_API_BASE_URL__: JSON.stringify(apiBase),
          "process.env.NODE_ENV": JSON.stringify("production"),
        },
        build: {
          lib: {
            entry: resolve(process.cwd(), "src/iframe-host/index.tsx"),
            name: "__GBOfferwall",
            formats: ["iife"],
            fileName: () => "offerwall.js",
          },
          outDir: resolve(process.cwd(), "dist/offerwall"),
          emptyOutDir: true,
          minify: true,
          rollupOptions: {
            output: {
              inlineDynamicImports: true,
              extend: false,
              exports: "auto",
            },
          },
        },
      });

      mkdirSync(resolve(process.cwd(), "dist/offerwall"), { recursive: true });
      copyFileSync(
        resolve(process.cwd(), "src/iframe-host/offerwall.html"),
        resolve(process.cwd(), "dist/offerwall/offerwall.html"),
      );
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const apiBase = env.VITE_API_BASE_URL || "https://admin.growbolt.ai";
  // Never bake placeholder hosts into the published bundle
  const safeApiBase = apiBase.includes("example.com")
    ? "https://admin.growbolt.ai"
    : apiBase;

  return {
    define: {
      __GROWBOLT_API_BASE_URL__: JSON.stringify(safeApiBase),
      "process.env.NODE_ENV": JSON.stringify(mode),
    },
    plugins: [buildOfferwallPlugin(safeApiBase)],
    build: {
      lib: {
        entry: "src/index.ts",
        name: "GrowBolt",
        formats: ["iife"],
        fileName: () => "sdk.js",
      },
      rollupOptions: {
        output: {
          inlineDynamicImports: true,
          exports: "default",
          extend: true,
        },
      },
      emptyOutDir: true,
      minify: true,
    },
  };
});
