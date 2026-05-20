import { fileURLToPath, URL } from "node:url";

import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vite";

import { workspaceAliases } from "../../vite.shared";

function normalizeBasePath(basePath: string): string {
  if (basePath.length === 0 || basePath === "/") {
    return "/";
  }

  return `/${basePath.replace(/^\/+|\/+$/g, "")}/`;
}

const repositoryName = process.env.GITHUB_REPOSITORY?.split("/")[1];
const derivedBasePath =
  process.env.GITHUB_ACTIONS === "true" && repositoryName !== void 0
    ? `/${repositoryName}/`
    : "/";
const basePath = normalizeBasePath(process.env.VITE_BASE_PATH ?? derivedBasePath);

export default defineConfig({
  base: basePath,
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
