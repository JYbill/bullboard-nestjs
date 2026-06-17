import swc from "unplugin-swc";
import { defineConfig } from "vitest/config";

export default defineConfig({
  oxc: false,
  resolve: {
    tsconfigPaths: true,
  },
  plugins: [
    swc.vite({
      swcrc: true,
      configFile: "./.swcrc",
    }),
  ],
  test: {
    environment: "node",
    globals: false,
    include: [],
    projects: [
      {
        extends: true,
        test: {
          name: "test",
          include: ["src/**/*.spec.ts", "src/**/*.integration-spec.ts"],
        },
      },
      {
        extends: true,
        test: {
          name: "e2e",
          include: ["src/**/*.spec.ts", "src/**/*.integration-spec.ts", "test/**/*.e2e-spec.ts"],
          fileParallelism: false,
        },
      },
    ],
    coverage: {
      provider: "v8",
      reportsDirectory: "coverage",
      include: ["src/**/*.ts"],
      exclude: [
        "src/**/*.d.ts",
        "src/**/*.spec.ts",
        "src/**/*.integration-spec.ts",
        "src/library/prisma/generate/**",
      ],
    },
  },
});
