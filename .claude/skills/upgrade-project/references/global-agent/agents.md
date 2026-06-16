# 运行环境与工具链

- 运行时：<Node.js 版本或其他运行时>。
- 包管理器：<pnpm / npm / yarn / bun>。
- 服务框架：<NestJS / Express / Fastify / 其他>。
- 数据与基础设施：<Prisma / 数据库 / Redis / 队列 / 向量库等>。
- 代码质量工具：<TypeScript / Oxlint / Oxfmt / Vitest 等>。

# 常用命令

```bash
# 代码检查 / 格式化
# 编辑代码后，优先只对本次修改的几个文件执行检查。
<包管理器命令> exec <lint 工具> path/to/file.ts path/to/other-file.ts --fix

# 编辑代码后，优先只对本次修改的几个文件执行格式化。
<包管理器命令> exec <format 工具> "path/to/file.ts" "path/to/other-file.ts"

# 测试
# 编辑代码后，优先只运行本次修改相关的几个测试文件。
<包管理器命令> exec <test 工具> run path/to/file.spec.ts path/to/other-file.integration-spec.ts
<包管理器命令> exec <test 工具> run test/app.e2e-spec.ts
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

如果当前项目还没有可复用的 e2e seed 基础设施，不要新增会污染共享环境的 e2e 用例；新增模块是否必须同时补单元测试和集成测试，按项目真实约定写清楚。

# 标准文档

`docs/spec/` 用于存放项目标准文档。新增或调整标准文档时，需要同步维护 `docs/spec/index.md`。

# 整体架构

```text
<project>/
├── docs/                 # 项目文档与标准文档
├── env/                  # 环境变量配置文件，如项目没有则删除本行
├── prisma/               # Prisma 数据模型与迁移，如项目没有则删除本行
├── src/                  # 应用源码
│   ├── main.ts           # 应用启动入口
│   ├── common/           # 通用装饰器、过滤器、守卫等
│   ├── enum/             # 枚举定义，如项目没有则删除本行
│   ├── library/          # 基础设施封装
│   ├── modules/          # 业务模块
│   ├── types/            # 全局通用类型
│   └── util/             # 工具函数
├── test/                 # e2e 测试或手动调试脚本
└── package.json          # 脚本、依赖与包管理器声明
```

# 类型声明

- 全局通用类型放在 `src/types/` 下。
- 源码相关的 `type` / `interface` 放到源码同层的 `源码名.d.ts` 文件中，例如 `auth.service.ts` 对应 `auth.service.d.ts`。
- 不使用 `*.types.d.ts` 这类额外命名；类型文件名要直接跟随对应源码文件名。

# 反模式

后续修改代码时保持下面的组织方式，避免把不同职责混在同一处：

- 查询操作优先放在 `*-query.ts`。
- 新增、更新、删除操作优先放在 `*-modify.ts`。
- 如果项目已有统一响应工具，例如 `<ResponseUtil>`，接口返回优先使用统一响应结构，不要在各处手写不一致的返回格式。
