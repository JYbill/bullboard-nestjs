# Node.js 后台项目 Profile

## 适用场景

当用户希望为普通 Node.js 后台项目生成、整理或同步项目级约定，且没有更具体的框架 profile 时，使用这份 profile。默认把正文写入 `AGENTS.md`，并让 `CLAUDE.md` 只通过 `@AGENTS.md` 引用。NestJS 项目改用 `../nestjs-backend/index.md`。

这份 profile 只处理项目规则本身，尤其是：

- 运行环境和工具链；
- 常用命令；
- 测试分层；
- 标准文档维护规则；
- 类型声明放置和命名规则；
- 代码组织习惯和需要避免的反模式。

## 抽取原则

1. **`AGENTS.md` 是唯一模板正文。** 本目录的 `AGENTS.md` 是后台项目规则的最新真相源。`index.md` 只负责说明适用范围和路由，不重复定义测试、类型或代码组织规则；`CLAUDE.md` 只保留一行 `@AGENTS.md`，除非用户或项目已有明确相反约定。
2. **只保留能跨项目复用的规则。** 项目名、业务接口、具体数据库表、私有部署命令、一次性历史说明不要写进通用提示词。
3. **按项目事实替换占位。** 运行时、框架、目录、命令和依赖必须来自目标项目；删除不适用的模板项，不把模板占位符原样落地。
4. **不重新解释正文规则。** 测试依赖是否允许 mock、类型放置方式和代码组织等判断只从 `AGENTS.md` 读取；发现需要更新时先改唯一正文，再让使用方引用它。
5. **不要混入迁移参考。** 项目提示词可以记录当前项目正在使用的工具和命令，但不要放入工具迁移步骤、框架升级步骤、Docker 构建细节或测试框架配置片段。

## 与其他 references 的边界

本 profile 只负责生成或整理后台项目的 `AGENTS.md` 和 `CLAUDE.md`。遇到下面内容时读取对应入口，不要把迁移步骤、框架配置或部署实现写进 profile：

- Prettier 到 Oxfmt：`../../migrations/prettier-oxfmt/index.md`。
- ESLint 到 Oxlint：`../../migrations/eslint-oxlint/index.md`。
- Jest 到 Vitest、Vitest projects、测试运行器配置：`../../migrations/jest-vitest/index.md`。
- CommonJS/CJS 到 ESM：`../../migrations/cjs-esm/index.md`。
- NestJS 项目规则：`../nestjs-backend/index.md`。
- NestJS 升级：`../../migrations/nestjs-latest/index.md`。
- NestJS 目标配置：`../../frameworks/nestjs/index.md`。
- Dockerfile target、`docker-build.sh` 和镜像发布：`../../workflows/docker-build/index.md`。
- `.gitignore`：`../../workflows/gitignore/index.md`。

## 内容组织

`AGENTS.md` 正文模板见同目录 `AGENTS.md`，`CLAUDE.md` 引用写法见 `CLAUDE.md`。`index.md` 只保留抽取原则、目录边界、落地检查和适用说明。

## 落地检查清单

生成或更新后台项目提示词后，至少检查：

- `AGENTS.md` 是项目提示词正文文件；`CLAUDE.md` 只包含一行 `@AGENTS.md`，除非用户明确要求不同结构。
- `AGENTS.md` 正文不保留 `# 项目约定` 标题和“本文件为 Claude Code...”说明，章节从一级标题开始。
- 没有保留具体项目名、私有接口、私有部署命令或一次性说明。
- 目标项目采用的规则与 profile `AGENTS.md` 对照完成，所有不适用项已按项目事实裁剪。
- 没有混入其他 migration 的配置片段、执行流程或验收标准。

## 模板文件

`AGENTS.md` 正文模板见同目录 `AGENTS.md`，`CLAUDE.md` 引用写法见 `CLAUDE.md`。
