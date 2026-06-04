import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const apiBase =
    env.VITE_API_BASE_URL || "https://admin.growbolt.ai";
  // Never bake placeholder hosts into the published bundle
  const safeApiBase = apiBase.includes("example.com")
    ? "https://admin.growbolt.ai"
    : apiBase;

  return {
  define: {
    __GROWBOLT_API_BASE_URL__: JSON.stringify(safeApiBase),
  },
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
