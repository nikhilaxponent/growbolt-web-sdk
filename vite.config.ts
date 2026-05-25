import { defineConfig } from "vite";

export default defineConfig({
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
});
