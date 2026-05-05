import { defineConfig } from "rolldown";

export default defineConfig({
  input: {
    core: "./src/index.ts",
  },
  output: {
    dir: "dist",
    entryFileNames: "[name].js",
    format: "esm",
    sourcemap: true,
  },
});
