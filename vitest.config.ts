import { defineConfig } from "vitest/config";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  test: {
    globals: true,
    projects: [
      {
        extends: true,
        test: {
          name: "logic",
          include: ["src/**/*.test.ts"],
          environment: "node",
          setupFiles: ["./vitest.setup.ts"],
        },
      },
      {
        extends: true,
        test: {
          name: "components",
          include: ["src/**/*.test.tsx"],
          environment: "jsdom",
          setupFiles: ["./vitest.setup.ts"],
        },
      },
    ],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
