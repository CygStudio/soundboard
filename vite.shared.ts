import { fileURLToPath, URL } from "node:url";

export const workspaceAliases = {
  "@soundboard/core": fileURLToPath(
    new URL("./packages/core/src/index.ts", import.meta.url),
  ),
  "@soundboard/ui": fileURLToPath(
    new URL("./packages/ui/src/index.ts", import.meta.url),
  ),
  "@soundboard/widget": fileURLToPath(
    new URL("./packages/widget/src/index.ts", import.meta.url),
  ),
};
