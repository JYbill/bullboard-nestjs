# Jest 到 Vitest 迁移模板

## `vitest.config.ts` 模板

NestJS / SWC 项目可参考下面配置。落地时按项目真实目录、覆盖率排除项和 project 名调整。

```ts
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
          include: ["test/**/*.e2e-spec.ts"],
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
```

## `package.json` 测试脚本模板

```json
{
  "test": "vitest run --coverage --project test --passWithNoTests",
  "test:e2e": "vitest run --coverage --project e2e --passWithNoTests"
}
```

## `package.json` 内置 Jest 配置处理模板

如果 `package.json` 中存在 `jest` 字段，把它当作 Jest 配置文件处理。迁移必要语义后删除整个 `jest` 字段，不要留下空对象。

常见迁移对应关系：

- `testMatch` / `testRegex` / `testPathIgnorePatterns` → `vitest.config.ts` 中对应 project 的 `include` / `exclude`。
- `testEnvironment` → `test.environment`。
- `moduleNameMapper` → Vite `resolve.alias` 或 `resolve.tsconfigPaths`。
- `setupFiles` / `setupFilesAfterEnv` → `test.setupFiles`。
- `collectCoverageFrom` → `coverage.include`。
- `coverageDirectory` → `coverage.reportsDirectory`。
- `coveragePathIgnorePatterns` → `coverage.exclude`。

迁移后 `package.json` 应只保留脚本、依赖和项目元信息，不再保留 `jest` 配置字段。

## 常用验证命令模板

编辑代码后优先运行本次修改相关的测试文件：

```bash
pnpm exec vitest run path/to/file.spec.ts path/to/other-file.integration-spec.ts
pnpm exec vitest run test/app.e2e-spec.ts
```

需要整组验证时再运行 project：

```bash
pnpm exec vitest run --project test
pnpm exec vitest run --project e2e
```

## 测试 API 迁移模板

```ts
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
```

常见替换：

- `jest.fn()` → `vi.fn()`。
- `jest.spyOn()` → `vi.spyOn()`。
- `jest.mock()` → `vi.mock()`。
- `jest.clearAllMocks()` / `resetAllMocks()` / `restoreAllMocks()` → `vi.clearAllMocks()` / `vi.resetAllMocks()` / `vi.restoreAllMocks()`。
- `jest.useFakeTimers()` / `useRealTimers()` → `vi.useFakeTimers()` / `vi.useRealTimers()`。
- `jest.Mocked<T>` 等 Jest 类型改成从 `vitest` 导入的 `Mocked<T>`、`MockInstance` 等类型。

NestJS e2e 应保留应用关闭逻辑：

```ts
afterEach(async () => {
  await app?.close();
  app = undefined;
});
```

## 汇报模板

```markdown
已完成 Jest 到 Vitest 的迁移。

变更：
- 新增或更新 `vitest.config.ts`，使用 `test` / `e2e` projects 区分普通测试和 e2e。
- `test` project 覆盖 `*.spec.ts` 和 `*.integration-spec.ts`。
- `e2e` project 覆盖 `test/**/*.e2e-spec.ts`，并关闭文件级并行。
- 测试脚本改为 Vitest project 命令。
- 测试代码从 Jest API 改为 Vitest API。
- 移除 Jest 配置文件、`package.json` 的 `jest` 配置字段和 Jest 相关直接依赖。
- lint-staged / husky / CI 中的 Jest 命令已同步，或确认不适用。

验证：
- `pnpm exec vitest --help` 通过。
- 已运行本次修改相关的测试文件：`<实际命令>`。
- 已运行整组测试 project：`<实际命令或说明未运行>`。
- `pnpm typecheck` / `pnpm build` 通过，或说明失败原因。

注意：
- `*.spec.ts`、`*.integration-spec.ts`、`*.e2e-spec.ts` 的测试分层按 AGENTS.md 保留。
- 未迁移 lint、format、ESM 或业务逻辑。
- 保留未处理的既有无关工作区改动。
```
