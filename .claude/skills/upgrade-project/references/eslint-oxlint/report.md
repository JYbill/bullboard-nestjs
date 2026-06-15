已完成 ESLint 到 Oxlint 的迁移。

变更：
- 新增 `oxlint.config.ts`，启用 type-aware。
- `lint` 脚本改为 `oxlint ... --fix`，检查范围按当前项目真实目录设置。
- 移除 ESLint 配置和 ESLint 相关直接依赖。
- 新增 `oxlint`、`oxlint-tsgolint`，更新锁文件。
- lint-staged 已同步，或确认不适用。

验证：
- `pnpm exec oxlint --help` 通过。
- `pnpm lint` 通过。
- `pnpm build` 通过。

注意：
- 如果原计划中的 glob 在 Oxlint 下不能匹配文件，已改为目录参数。
- 未迁移测试框架、格式化器、ESM 或运行时配置。
- 保留未处理的既有无关工作区改动。
