import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vite";

import { workspaceAliases } from "../../vite.shared";

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: workspaceAliases,
  },
});
