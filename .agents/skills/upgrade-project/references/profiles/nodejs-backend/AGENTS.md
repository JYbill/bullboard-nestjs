# 运行环境与工具链

- 运行时：<Node.js 版本或其他运行时>。
- 包管理器：<pnpm / npm / yarn / bun>。
- 服务框架：<Express / Fastify / Koa / 其他 Node.js 框架>。
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
- 可以访问真实数据库、Redis、网络请求等外部依赖，也可以按当前验证目标使用 mock。
- 默认只读，避免污染共享环境。
- 默认优先使用真实请求或真实服务；使用 mock 时必须保留真实框架、序列化或协议转换等当前被验证的边界。
- 开发者指定某个测试文件使用 mock 后，该文件必须持续保持 mock 风格，不能在普通维护中替换为真实外部请求。
- 不得真实调用大模型；需要模型真实生成结果时改用 `*.llm-spec.ts`。

## `*.e2e-spec.ts`

- 端到端测试。
- 只用于明确指定需要端到端验证的模块，不因普通功能改动自动新增。
- 验证指定模块从输入到最终结果的完整业务链路。
- 非常依赖专用外部服务和测试数据，例如影子 MySQL 数据库、Langfuse Dataset。
- 运行前必须确认所需环境变量、外部服务和测试数据均可用。
- 禁止用 mock 替代端到端链路中的核心外部依赖。
- e2e 测试文件专门放在 `test/` 目录内。

新增模块和文件默认按真实依赖边界补 `*.spec.ts` 或 `*.integration-spec.ts`；涉及外部访问时补集成测试，纯本地逻辑补单元测试。只有明确指定的模块才补 `*.e2e-spec.ts`。

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
