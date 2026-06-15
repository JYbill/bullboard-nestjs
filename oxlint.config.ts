import { defineConfig } from "oxlint";

export default defineConfig({
  env: {
    node: true,
  },
  plugins: ["typescript", "vitest"],
  categories: {
    correctness: "error",
  },
  ignorePatterns: ["**/*.d.ts"],
  options: {
    typeAware: true,
  },
  rules: {
    "no-unused-vars": [
      "error",
      {
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_",
        caughtErrorsIgnorePattern: "^_",
        destructuredArrayIgnorePattern: "^_",
        fix: {
          imports: "safe-fix",
          variables: "safe-fix",
        },
      },
    ],
  },
});
