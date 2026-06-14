# 通用后台项目提示词模板

## `AGENTS.md` / `CLAUDE.md` 基础模板

下面内容可作为后台项目的项目提示词基础模板。落地到具体项目时，按真实目录、工具和脚本微调。

````markdown
# 项目约定

本文件为 Claude Code 在本仓库中工作时提供项目级约定。

## 常用命令

```bash
# 代码检查 / 格式化
# 编辑代码后，优先只对本次修改的几个 ts 文件执行 lint。
pnpm exec oxlint --config oxlint.config.ts path/to/file.ts path/to/other-file.ts --fix

# 编辑代码后，优先只对本次修改的几个 ts 文件执行格式化。
pnpm exec oxfmt "path/to/file.ts" "path/to/other-file.ts"

# 测试
# 编辑代码后，优先只运行本次修改相关的几个测试文件。
pnpm exec vitest run path/to/file.spec.ts path/to/other-file.integration-spec.ts
pnpm exec vitest run test/app.e2e-spec.ts              # 运行指定 e2e 测试文件
```

## 测试要求

### `*.spec.ts`

- 单元测试。
- 只测试纯代码逻辑、DTO、工具函数、service 分支。
- 不访问真实数据库，不访问外部服务。

### `*.integration-spec.ts`

- 集成测试。
- 允许依赖环境变量访问真实外部服务。
- 默认只读，避免污染共享环境。
- 适合测试数据库、Redis、网络请求等。
- 禁止对外部依赖进行 mock，必须使用真实数据。

### `*.e2e-spec.ts`

- 端到端测试。
- 通过 HTTP 接口测试完整链路。
- 使用专门的测试数据库或测试 schema。
- 每轮测试前准备 seed 数据，测试后清理或重建。
- 可以测试 CRUD，但重点是关键业务流程，而不是所有 CRUD 细节。
- e2e 测试文件专门放在 `test/` 目录内。

由于目前基础设施没有实现种子环境，新增模块、文件都应该有对应的 `*.spec.ts` 和 `*.integration-spec.ts`，这两个文件放在源码同级目录。

## 标准文档

`docs/spec/` 用于存放项目标准文档。新增或调整标准文档时，需要同步维护 `docs/spec/index.md`。

## 反模式

后续修改代码时保持下面的组织方式，避免把不同职责混在同一处：

- 查询操作优先放在 `*-query.ts`。
- 新增、更新、删除操作优先放在 `*-modify.ts`。
- 如果项目已有统一响应工具，例如 `ResponseUtil`，接口返回优先使用统一响应结构，不要在各处手写不一致的返回格式。
````

## Vitest project 模板

如果项目使用 Vitest，推荐按测试语义拆 project：

```ts
test: {
  include: [],
  projects: [
    {
      extends: true,
      test: {
        name: "test",
        include: ["src/**/*.spec.ts", "src/**/*.integration-spec.ts"],
      },
    },
    {
      extends: true,
      test: {
        name: "e2e",
        include: ["test/**/*.e2e-spec.ts"],
        fileParallelism: false,
      },
    },
  ],
}
```

对应整组验证命令：

```bash
pnpm exec vitest run --project test
pnpm exec vitest run --project e2e
```

## 汇报模板

```markdown
已创建通用后台项目提示词。

变更：
- 新增 `<目标文件>`，从项目约定中提取常用命令、测试分层、标准文档和代码组织规则。
- 常用命令优先使用本次修改相关文件的局部验证方式。
- 已去除具体项目名、私有部署命令和重复文档清单。

注意：
- 落地到其他项目时，需要按真实目录、工具链和测试 project 名微调命令。
```
