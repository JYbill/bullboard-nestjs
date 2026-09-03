# NestJS 后台项目 Profile

## 适用场景

当用户希望为 NestJS 后台项目生成、整理或同步项目级约定时，使用这份 profile。默认把正文写入 `AGENTS.md`，并让 `CLAUDE.md` 只通过 `@AGENTS.md` 引用。

这份 profile 在普通 Node.js 后台规则之上，固定 NestJS 项目需要长期遵守的规则，包括：

- Nest CLI、构建产物和常用验证命令；
- Standard Schema 与 Zod 的请求、环境变量和响应 Schema 约定；
- Vitest 单元、集成和 e2e 测试分层；
- NestJS 项目目录、类型声明和 ESM 导入规则；
- Controller、Service、配置和基础设施代码的职责。

## Schema 规则的采用条件

本 profile 的 `AGENTS.md` 默认面向已经采用 Zod Standard Schema 的新项目或升级后项目。已有项目仍使用 `ValidationPipe` 和 class DTO 时，先读取 `../../migrations/nestjs-latest/index.md`：

- 用户尚未决定是否迁移时，不把本 profile 的 Schema 章节写入目标项目；
- 用户选择保留现有校验体系时，按项目事实保留对应规则；
- 用户明确采用 Standard Schema 后，才同步 Schema 章节，并确认项目规则不再要求新增 class-validator DTO。

## 抽取原则

1. **`AGENTS.md` 是唯一模板正文。** 本目录的 `AGENTS.md` 是 NestJS 项目规则的模板；`CLAUDE.md` 默认只保留一行 `@AGENTS.md`。
2. **按项目事实替换占位。** Node.js、NestJS、TypeScript、包管理器、数据库、测试工具和目录必须来自目标项目，不把占位符原样写入。
3. **保留 NestJS 专属规则。** Schema、Controller/Service 职责、配置读取、ESM 导入和测试分层只在目标项目实际采用对应方案时写入。
4. **不复制一次性项目事实。** 私有地址、业务模块、环境变量值、镜像名称、具体数据库表和升级历史不进入通用模板。
5. **不混入迁移步骤或配置正文。** 本 profile 描述升级完成后长期遵守的项目规则；迁移过程和具体配置由对应 migration、framework 或 workflow 维护。

## 与其他 references 的职责划分

- 普通 Node.js 后台规则：`../nodejs-backend/index.md`。
- NestJS 升级与 Standard Schema 迁移：`../../migrations/nestjs-latest/index.md`。
- NestJS 的 package、TypeScript、SWC、Prisma、PM2 和 Dockerfile 目标配置：`../../frameworks/nestjs/index.md`。
- Jest 到 Vitest：`../../migrations/jest-vitest/index.md`。
- CommonJS/CJS 到 ESM：`../../migrations/cjs-esm/index.md`。
- Docker 构建和发布流程：`../../workflows/docker-build/index.md`。
- `.gitignore`：`../../workflows/gitignore/index.md`。

## 落地检查清单

生成或更新 NestJS 项目提示词后，至少检查：

- `AGENTS.md` 中的框架、版本、命令、目录和测试配置与项目事实一致；
- Standard Schema 章节只在用户已经采用或明确选择该方案时存在；
- 需要校验的参数明确传入 Schema，输入类型由 Schema 推导；
- 环境变量通过配置模块集中校验，业务代码不散落读取 `process.env`；
- ESM 后缀、类型导入、Controller/Service 职责和类型声明位置与项目规则一致；
- 没有复制私有环境值、一次性升级说明或不适用的基础设施配置。

## 模板文件

`AGENTS.md` 正文模板见同目录 `AGENTS.md`，`CLAUDE.md` 引用写法见 `CLAUDE.md`。
