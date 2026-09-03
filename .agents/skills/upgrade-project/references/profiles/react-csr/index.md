# React CSR 项目 Profile

## 适用场景

当用户要求为 React CSR 项目生成或同步项目级规则时，使用这份 profile。

这份 profile 只负责 Agent 行为、代码组织、前端验证习惯和项目需要加载的 skill。具体依赖及配置模板归 `../../frameworks/react-csr/index.md` 所有；Jest 到 Vitest 的迁移过程仍使用 `../../migrations/jest-vitest/index.md`。

## 唯一正文

- `AGENTS.md`：CSR React 项目规则正文，保留前端项目默认加载的 skill 约定。
- `CLAUDE.md`：通过 `@AGENTS.md` 复用项目规则。

`AGENTS.md` 是本 profile 的唯一规则正文。`index.md` 不重复解释其中的 React 组件职责、测试要求或 `react-ddt` 使用方式；规则需要更新时先修改 `AGENTS.md`。

## 使用原则

1. 读取目标项目现有 `AGENTS.md`、`CLAUDE.md` 和目录结构。
2. 以本目录 `AGENTS.md` 为基线，按项目真实框架、命令和目录裁剪占位内容，不复制来源项目的业务规则。
3. 保留 React 前端项目默认加载的 `react-ddt` 等 skill 约定，不把它误判为来源项目残留。
4. `CLAUDE.md` 默认只保留 `@AGENTS.md`；目标项目已有明确不同约定时按项目事实处理。
5. 任务涉及 `package.json`、Vite、Vitest、TypeScript、Oxlint、Oxfmt 或 lint-staged 配置时，改读 `../../frameworks/react-csr/index.md`，不要把配置模板放回 profile。

## 检查清单

- 项目规则正文位于 `AGENTS.md`，`CLAUDE.md` 正确引用它。
- `AGENTS.md` 已按目标项目事实替换占位内容，没有来源项目名、私有命令或业务说明。
- `react-ddt` 等 React 项目通用 skill 约定仍然保留。
- profile 中没有重复保存 `package.json`、Vite、Vitest、TypeScript 或代码质量工具配置模板。
