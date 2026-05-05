import { withVitestConfig } from "../../vitest.shared";

export default withVitestConfig({
  test: {
    environment: "node",
    include: ["test/**/*.test.ts"],
  },
});
