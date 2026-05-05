import { defineConfig } from "rolldown";
import vue from "unplugin-vue/rolldown";

export default defineConfig({
  external: ["vue", "@soundboard/core", "@soundboard/ui"],
  input: {
    widget: "./src/index.ts",
  },
  output: {
    assetFileNames: "[name][extname]",
    dir: "dist",
    entryFileNames: "[name].js",
    format: "esm",
    sourcemap: true,
  },
  plugins: [vue()],
});
