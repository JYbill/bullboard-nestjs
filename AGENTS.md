# 技术栈

- 运行时与语言：Node.js、TypeScript 5、NestJS 11，TypeScript 模块配置遵循 `tsconfig.json` 的 `NodeNext`。
- HTTP 与管理界面：`@nestjs/platform-express`、Express、`@bull-board/api`、`@bull-board/express`。
- 队列与缓存连接：BullMQ 5、ioredis，Redis 连接和队列定义通过配置装配。
- 配置与校验：`@nestjs/config`、`class-validator`、`class-transformer`。
- 测试与质量工具：Vitest、unplugin-swc、Supertest、Oxlint、Oxfmt。
- 包管理与构建：pnpm、Nest CLI，Docker 构建入口只在明确要求时使用。

# 常用命令

编辑代码后优先做局部验证，只检查、格式化、测试本次修改相关的少量文件；需要整组验证时再运行全量命令。

```bash
# 代码检查 / 格式化
pnpm exec oxlint --config oxlint.config.ts "src/path/to/file.ts" --fix
pnpm exec oxfmt "src/path/to/file.ts"

# 测试
pnpm exec vitest run src/path/to/file.spec.ts
pnpm exec vitest run src/path/to/file.integration-spec.ts
pnpm exec vitest run test/app.e2e-spec.ts

# 全量或整组验证
pnpm build
pnpm lint
pnpm format
pnpm test
pnpm test:e2e
```

# 测试要求

## `*.spec.ts`

- 单元测试。
- 只测试纯代码逻辑、DTO、工具函数、service 分支。
- 不访问真实数据库，不访问外部服务。

## `*.integration-spec.ts`

- 集成测试。
- 允许依赖环境变量访问真实外部服务。
- 默认只读，避免污染共享环境。
- 适合测试数据库、Redis、网络请求等。
- 禁止对外部依赖进行 mock，必须使用真实数据。

## `*.e2e-spec.ts`

- 端到端测试。
- 通过 HTTP 接口测试完整链路。
- 使用专门的测试数据库或测试 schema。
- 每轮测试前准备 seed 数据，测试后清理或重建。
- 可以测试 CRUD，但重点是关键业务流程，而不是所有 CRUD 细节。
- e2e 测试文件专门放在 `test/` 目录内。

由于目前基础设施没有实现种子环境，新增模块、文件都应该有对应的 `*.spec.ts` 和 `*.integration-spec.ts`，这两个文件放在源码同级目录。

# 代码组织与 NestJS 约定

- Controller 保持薄层，只负责参数接收、鉴权入口和响应组装；业务判断放在 service 或明确的逻辑层。
- 写操作放在 `*-modify.ts`，读操作放在 `*-query.ts`，共享可复用能力保留在 common service 文件中；只有编排逻辑确实 substantial 时才移入 `logic/`。
- DTO 负责请求结构和校验语义，不要把业务流程塞进 DTO。
- 配置项必须经过配置校验和类型声明；涉及环境变量时同步更新校验文件和类型声明文件。
- 导出的函数和每个 `static` 类方法上方都要添加 `/** ... */` JSDoc。
- 对不明显的业务逻辑添加简短行内注释；不要解释语法本身。
- 禁止新增业务魔法数字。状态值、类型值、开关值、任务值等先抽到语义明确的 `enum/**` 后再使用。
- 同层文件或同层目录内导入允许使用 `./xxx`；跨上层或下层目录导入必须使用 `tsconfig.json` 中已配置的路径别名：`@/*` 对应 `src/*`，`@type/*` 对应 `types/*`，`@test/*` 对应 `test/*`。
- 合并来自同一路径的 `import` 和 `import type`，不要拆成两条导入。
- 避免过度封装。不要为了形式整洁抽取只有四行左右、没有复用价值或业务语义的小函数。
- SQL 别名使用完整或清晰有意义的单词，不要新增 `stc`、`ct` 这类难读缩写。
- 精确修复 TypeScript 类型问题。不要使用 `any`、`unknown`、`as any`、`as unknown as ...` 掩盖类型问题；通过补齐参数类型、返回值类型、配置类型、请求/响应类型、类型守卫或更准确的类型定义解决。

# 标准文档

`docs/spec/` 用于存放项目标准文档。新增或调整标准文档时，需要同步维护 `docs/spec/index.md`。
