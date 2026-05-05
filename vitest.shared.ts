import { defineConfig, mergeConfig, type UserConfig } from "vitest/config";

const baseConfig = defineConfig({
  test: {
    globals: true,
    passWithNoTests: false,
  },
});

export function withVitestConfig(overrides: UserConfig = {}) {
  return mergeConfig(baseConfig, defineConfig(overrides));
}
