已完成 Jest 到 Vitest 的迁移。

变更：
- 新增或更新 `vitest.config.ts`，使用 `test` / `e2e` projects 区分普通测试和 e2e。
- `test` project 覆盖 `*.spec.ts` 和 `*.integration-spec.ts`。
- `e2e` project 覆盖 `*.spec.ts`、`*.integration-spec.ts` 和 `test/**/*.e2e-spec.ts`，并关闭文件级并行。
- 测试脚本改为 `test` / `test:watch` / `test:cov`，均指向 `test` project（单元测试和集成测试）。
- 测试代码从 Jest API 改为 Vitest API。
- 移除 Jest 配置文件、`package.json` 的 `jest` 配置字段和 Jest 相关直接依赖。
- lint-staged / husky / CI 中的 Jest 命令已同步，或确认不适用。

验证：
- `pnpm exec vitest --help` 通过。
- 已运行本次修改相关的测试文件：`<实际命令>`。
- 已运行单元测试/集成测试整组命令：`<实际命令或说明未运行>`。
- 已运行 e2e project：`<实际命令或说明不适用>`。
- `pnpm typecheck` / `pnpm build` 通过，或说明失败原因。

注意：
- `*.spec.ts`、`*.integration-spec.ts`、`*.e2e-spec.ts` 的测试分层按 AGENTS.md 保留。
- 未迁移 lint、format、ESM 或业务逻辑。
- 保留未处理的既有无关工作区改动。
