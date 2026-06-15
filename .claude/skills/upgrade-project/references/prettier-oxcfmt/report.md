已完成 Prettier 到 Oxfmt 的迁移。

变更：
- 删除 Prettier 配置，新增 `oxfmt.config.ts`。
- `format` 脚本改为 `oxfmt ...`。
- lint-staged 中的 Prettier 命令已同步改为 `oxfmt`，或确认不适用。
- 移除直接依赖 `prettier`，新增 `oxfmt`。
- 更新锁文件。

验证：
- `pnpm exec oxfmt --help` 通过。
- `pnpm format` 连续运行稳定。
- `pnpm build` 通过。

注意：计划中的 `oxc format` 在当前 npm 生态中不可用，已改用官方命令行工具 `oxfmt`。
