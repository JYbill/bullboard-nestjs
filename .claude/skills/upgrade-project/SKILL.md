---
name: upgrade-project
description: 当用户要求升级、现代化、迁移或替换项目工具链和框架时使用这个技能，尤其是把旧的 JavaScript/TypeScript 工具迁移到新工具，或把项目约定、Docker 构建与部署流程沉淀成可复用规范。适用范围包括格式化器、代码检查器、测试框架、构建工具、包管理器、运行时、模块系统、框架、配置迁移、Dockerfile / docker-build.sh 部署流程和 AGENTS.md / CLAUDE.md 项目提示词提取，例如 Prettier 到 Oxfmt、ESLint 到 Oxlint、Jest 到 Vitest、CommonJS/CJS 到 ESM、旧 Node 版本到新 Node 版本、Docker 多阶段构建和镜像发布。用户提到“升级项目”“迁移技术栈”“替换旧工具”“refactor format”“refactor-lint”“prettier”“oxfmt”“oxc format”“eslint”“oxlint”“oxlint.config.ts”“cjs-esm”“CommonJS 转 ESM”“type module”“verbatimModuleSyntax”“Dockerfile”“docker-build.sh”“deploy:docker”“docker build”“docker push”“镜像发布”“AGENTS.md”“CLAUDE.md”“项目提示词”“后台项目提示词”“通用 agent 提示词”，或者要求把一次升级经验沉淀成可复用流程时，应优先使用这个技能。
metadata:
  tags: 升级, 迁移, 重构, 工具链, javascript, typescript
---

## 目的

帮助把项目从旧技术迁移到新技术，同时避免把不相关的重构混进同一次改动。

核心目标是让迁移保持小范围、可验证、可复用：先确认源技术和目标技术，再检查项目现状，读取对应引用资料，做最小必要改动，最后使用项目已有命令验证结果。

## 总体迁移流程

迁移不是“直接改配置”。先确认事实，再做改动。复杂迁移按下面的 ASCII 图推进：

```text
用户需求 / 迁移计划
        │
        ▼
确认旧技术、新技术和本次范围
        │
        ▼
检查项目现状：脚本、依赖、锁文件、配置、lint-staged 配置、未提交改动
        │
        ▼
是否已有对应引用资料？
        │
        ├─ 是：读取 references/<迁移名>/index.md
        │
        └─ 否：先小范围调研目标工具的真实命令和配置
        │
        ▼
验证目标命令是否真实可用
        │
        ├─ 不可用：停下并说明命令、依赖或计划不匹配
        │
        └─ 可用：继续最小改动
        │
        ▼
修改依赖、脚本、配置、lint-staged 配置和锁文件
        │
        ▼
运行迁移命令，并只接受迁移范围内的差异
        │
        ▼
重复运行幂等命令，确认结果稳定
        │
        ▼
运行项目已有验证命令
        │
        ▼
汇报改动、验证结果和必要偏差
```

## 执行原则

1. **先明确迁移目标。** 确认旧工具、新工具和精确范围。用户给了计划文件时优先遵循计划；如果计划和当前项目事实冲突，以项目事实为准，并说明偏差。
2. **编辑前先检查。** 检查包脚本、依赖、锁文件、配置文件、lint-staged 配置、本地说明文档和已有未提交改动。不要假设包名或命令一定存在。
3. **读取匹配引用。** 已知迁移必须先读 `references/<迁移名>/index.md`，再改文件。
4. **尽早验证命令。** 替换脚本前先运行目标工具的帮助或版本命令。请求中的命令如果不是依赖生态真实提供的命令，应停下说明，而不是临时编造绕法。
5. **保持差异窄。** 只修改属于本次迁移的文件。不要把代码检查、测试框架、ESM、Docker、CI、IDE 或业务代码改动混进来，除非用户明确要求。
6. **使用项目已有包管理器。** 根据 `pnpm-lock.yaml`、`package-lock.json`、`yarn.lock`、`bun.lockb` 判断使用哪个安装和移除命令。
7. **同步 lint-staged 配置。** 迁移会影响格式化、代码检查、测试或其他提交前检查命令时，检查 `package.json` 的 `lint-staged` 字段、`.lintstagedrc*`、`lint-staged.config.*` 等配置；如果仍引用旧工具或旧命令，按同一迁移目标同步更新，只改本次迁移涉及的规则，不扩大匹配范围。
8. **运行迁移命令。** 格式化器迁移只接受纯格式化差异。如果格式化改动很多文件，应和业务逻辑改动分开。
9. **检查稳定性。** 对格式化器等幂等命令连续运行两次，确认第二次不会产生新的差异。
10. **使用现有验证。** 优先运行项目已有的构建、类型检查或冒烟验证命令。已知会自动修改文件的命令，运行前先确认项目说明和用户意图。
11. **清楚说明偏差。** 如果最终做法和计划不同，比如生态中命令不可用或包名不同，要说明具体原因。

## 引用目录

- `references/prettier-oxcfmt/index.md`：Prettier 到 Oxfmt 的格式化器迁移。任务提到 Prettier、Oxfmt、`oxfmt`、`oxc format`、`.prettierrc`、`prettier --write`，或要求替换项目格式化命令时，先读取这个文件；配置和汇报模板见同目录 `template.md`。
- `references/eslint-oxlint/index.md`：ESLint 到 Oxlint 的代码检查器迁移。任务提到 ESLint、Oxlint、`oxlint.config.ts`、`refactor-lint`、`eslint.config.*`、`typescript-eslint`，或要求替换项目 lint 命令时，先读取这个文件；配置和汇报模板见同目录 `template.md`。
- `references/jest-vitest/index.md`：Jest 到 Vitest 的测试框架迁移。任务提到 Jest、Vitest、`vitest.config.*`、`jest.config.*`、`ts-jest`、`@types/jest`、`*.spec.ts`、`*.integration-spec.ts`、`*.e2e-spec.ts`、测试分层，或要求替换项目测试命令时，先读取这个文件；配置、脚本和汇报模板见同目录 `template.md`。
- `references/global-agent/index.md`：通用后台项目提示词提取。任务提到 AGENTS.md、CLAUDE.md、项目提示词、后台项目提示词、通用 agent 提示词，或要求从项目约定中提取常用命令、测试要求、标准文档、反模式时，先读取这个文件；项目提示词模板见同目录 `template.md`。
- `references/docker-build/index.md`：Docker 构建与部署流程。任务提到 Dockerfile、`x86-debian.Dockerfile`、`docker-build.sh`、`deploy:docker`、`docker build`、`docker push`、镜像发布、`images.tar`，或要求统一后台项目 Docker 构建和部署入口时，先读取这个文件；构建命令和汇报模板见同目录 `template.md`。
- `references/cjs-esm/index.md`：TypeScript 项目的 CommonJS/CJS 到 ESM 迁移。任务提到 `"type": "module"`、`verbatimModuleSyntax`、`import type`、CJS 转 ESM、模块系统迁移，或迁移后需要修复类型导入错误时，先读取这个文件；配置、类型导入和汇报模板见同目录 `template.md`。

## 汇报要求

迁移完成后只汇报用户关心的内容：

- 改了哪些文件；
- 依赖、脚本和配置如何变化；
- lint-staged 或提交前检查配置是否同步更新；
- 运行了哪些验证命令，结果是什么；
- 哪些地方有意偏离原计划，以及为什么；
- 哪些已有的无关工作区改动被保留未处理。

验证命令失败或跳过时，不要声称完全成功。命令不可用时，说明执行的具体命令和观察到的失败结果。
