import { defineConfig } from "rolldown";
import vue from "unplugin-vue/rolldown";

export default defineConfig({
  external: ["vue"],
  input: {
    ui: "./src/index.ts",
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
