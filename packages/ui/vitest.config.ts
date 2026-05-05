import vue from "@vitejs/plugin-vue";

import { withVitestConfig } from "../../vitest.shared";
import { workspaceAliases } from "../../vite.shared";

export default withVitestConfig({
  plugins: [vue()],
  resolve: {
    alias: workspaceAliases,
  },
  test: {
    environment: "jsdom",
    include: ["test/**/*.test.ts"],
    passWithNoTests: true,
  },
});
