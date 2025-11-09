import { builtinModules } from "module";
import { resolve } from "path";
import { defineConfig } from "vite";

const builtin = [...builtinModules, ...builtinModules.map((m) => `node:${m}`)];

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      formats: ["es"],
      fileName: "index",
    },
    target: "node20",
    rollupOptions: {
      external: builtin,
    },
  },
});
