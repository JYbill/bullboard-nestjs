# React CSR 目标配置参考

## 适用场景

当任务需要初始化或同步 React CSR + Vite 项目的依赖、构建、类型检查、测试和代码质量配置时，使用这份参考。这里只保存可落地的目标配置，不维护 Agent 行为和项目代码组织规则。

## 所有权说明

- React CSR 项目规则以 `../../profiles/react-csr/AGENTS.md` 为唯一正文；其中包含前端项目默认加载的 `react-ddt` 等 skill 约定。
- Jest 到 Vitest 的迁移步骤见 `../../migrations/jest-vitest/index.md`；本目录只描述 React CSR 项目的 Vitest 目标配置。
- 本目录默认面向 React CSR、Vite、Tailwind CSS、Vitest、Testing Library、TypeScript、tsgo、Oxlint、Oxfmt、lint-staged 和 Husky 组合，不代表 Next.js、Remix 或所有 React 项目。

## 配置文件

- `package.md`：`package.json` 基础脚本和直接依赖模板。
- `dependencies.md`：依赖分组和安装命令。
- `tsconfig.md`：React CSR + Vite + tsgo 类型检查模板。
- `vite-config.md`：Vite React、Tailwind CSS 和 `@` alias 模板。
- `vitest-config.md`：React + jsdom 测试配置模板。
- `vitest-setup.md`：Testing Library matcher 初始化模板。
- `oxlint-config.md`：React、TypeScript 和 import 规则模板。
- `oxfmt-config.md`：Oxfmt 配置模板。
- `lint-staged.md`：提交前 Oxlint/Oxfmt 配置模板。

## 落地原则

1. 检查目标项目实际使用的包管理器、React、Vite、Vitest、Tailwind CSS 和 TypeScript 配置。
2. 删除来源项目名、版本常量、库模式打包入口、文件名前缀、全局业务变量、私有脚本和技能同步脚本。
3. 如果目标项目不用 Vitest、Testing Library、Tailwind CSS、Husky 或路径别名，连同对应依赖、插件、脚本和配置一起删除，不留下空配置。
4. `package.json` 的 `name` 必须替换为目标项目自己的包名。
5. 默认使用 Vite 应用构建，不复制 `build.lib`、`formats`、`fileName`、`cssFileName` 或业务入口。
6. 更新依赖后运行目标项目已有的 typecheck、test、lint、format 和 build 命令；命令名称以项目事实为准。

## 验收标准

- `package.json` 不包含来源项目的业务包名、技能同步脚本、库打包字段或业务常量。
- `vite.config.ts` 是普通 CSR 应用配置，不包含来源项目的 `build.lib` 配置。
- `vitest.config.ts` 使用 jsdom，并加载项目实际的测试 setup 文件。
- `tsconfig.json`、`vite.config.ts`、`vitest.config.ts` 和源码路径别名一致。
- `oxlint.config.ts` 不包含来源项目的全局变量白名单。
- lint-staged 同步调用目标项目采用的代码检查和格式化工具。
