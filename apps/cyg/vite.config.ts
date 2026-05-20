import { fileURLToPath, URL } from "node:url";

import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vite";

import { workspaceAliases } from "../../vite.shared";

export default defineConfig({
  plugins: [vue()],
  publicDir: fileURLToPath(new URL("../../assets", import.meta.url)),
  resolve: {
    alias: workspaceAliases,
  },
  server: {
    fs: {
      allow: [fileURLToPath(new URL("../../", import.meta.url))],
    },
  },
});
