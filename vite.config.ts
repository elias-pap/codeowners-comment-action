import { resolve } from "path";
import { defineConfig } from "vite";

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      formats: ["es"],
      fileName: "index",
    },
    target: "node20",
    rollupOptions: {
      external: ["@actions/core", "@actions/github"],
    },
  },
});
