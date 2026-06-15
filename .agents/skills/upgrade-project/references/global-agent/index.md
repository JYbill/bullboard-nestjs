# 通用后台项目提示词参考

## 适用场景

当用户希望把某个后台项目的项目约定提取到 `AGENTS.md`，并让 `CLAUDE.md` 只通过 `@AGENTS.md` 引用时，使用这份参考。

这份参考只处理项目提示词本身，适合从具体项目中抽取通用后台约定，尤其是：

- 运行环境和工具链；
- 常用命令；
- 测试分层；
- 标准文档维护规则；
- 类型声明放置和命名规则；
- 代码组织习惯和需要避免的反模式。

## 抽取原则

1. **默认落地到 `AGENTS.md`。** 项目提示词正文写入 `AGENTS.md`；`CLAUDE.md` 只保留一行 `@AGENTS.md`，除非用户或项目已有明确相反约定。
2. **只保留能跨项目复用的规则。** 项目名、业务接口、具体数据库表、私有部署命令、一次性历史说明不要写进通用提示词。
3. **命令写真实入口。** 优先写可直接执行的底层工具命令，例如 `pnpm exec oxlint ...`、`pnpm exec vitest ...`，不要只写包装脚本，避免迁移到新项目时脚本名不一致。
4. **默认局部验证。** 编辑代码后优先只检查、格式化、测试本次修改相关的少量文件；需要整组验证时再运行 project 或全量命令。
5. **测试规则按语义分层。** 不要只按文件名描述测试；要说明单元测试、集成测试、e2e 测试分别允许依赖什么、禁止什么。
6. **文档规则只保留维护入口。** 如果已经约定用 `docs/spec/index.md` 维护标准文档索引，不要再在项目提示词里重复列出每篇文档清单。
7. **类型规则按作用域落位。** 全局通用类型放到 `src/types/`；只服务某个源码文件的类型放到源码同层的 `源码名.d.ts`，例如 `auth.service.ts` 对应 `auth.service.d.ts`，不要写成 `*.types.d.ts`。
8. **反模式写成可执行约束。** 说明“应该放在哪里”和“不要怎么做”，让后续修改代码时可以直接应用。
9. **不要混入迁移参考。** 项目提示词可以记录当前项目正在使用的工具和命令，但不要放入工具迁移步骤、框架升级步骤、Docker 构建细节或测试框架配置片段。

## 与其他 references 的边界

`global-agent` 只负责生成或整理 `AGENTS.md` 正文，以及把 `CLAUDE.md` 简化为 `@AGENTS.md` 引用。遇到下面内容时，读取对应 reference，不要把具体迁移内容写进本目录：

- Prettier 到 Oxfmt：`references/prettier-oxcfmt/index.md`。
- ESLint 到 Oxlint：`references/eslint-oxlint/index.md`。
- Jest 到 Vitest、Vitest projects、测试框架配置：`references/jest-vitest/index.md`。
- Dockerfile、`docker-build.sh`、镜像发布：`references/docker-build/index.md`。
- `.gitignore`、忽略文件、提交忽略规则：`references/gitignore/index.md`。
- CommonJS/CJS 到 ESM：`references/cjs-esm/index.md`。
- NestJS 升级和 NestJS SWC 配置：`references/nestjs-latest/index.md`。
- Vitest 通用 SWC 配置：`references/jest-vitest/swcrc.md`。

## 内容组织

`AGENTS.md` 正文模板见同目录 `agents.md`，`CLAUDE.md` 引用写法见 `claude.md`，汇报模板见 `report.md`。`index.md` 只保留抽取原则、目录边界、落地检查和适用说明。

## 落地检查清单

生成或更新通用项目提示词后，至少检查：

- `AGENTS.md` 是项目提示词正文文件；`CLAUDE.md` 只包含一行 `@AGENTS.md`，除非用户明确要求不同结构。
- `AGENTS.md` 正文不保留 `# 项目约定` 标题和“本文件为 Claude Code...”说明，章节从一级标题开始。
- 没有保留具体项目名、私有接口、私有部署命令或一次性说明。
- 常用命令使用真实工具入口，并优先展示局部文件验证方式。
- 测试章节包含 `*.spec.ts`、`*.integration-spec.ts`、`*.e2e-spec.ts` 三层语义。
- 标准文档章节只要求维护 `docs/spec/index.md`，不重复维护文档表格。
- 类型声明规则区分全局通用类型和源码相关类型：全局放 `src/types/`，源码相关类型放源码同层 `源码名.d.ts`，不使用 `*.types.d.ts`。
- 反模式章节能指导后续代码落位，且没有把业务专属规则误写成通用规则。
- 没有混入其他迁移 reference 的配置片段、执行流程、验收标准或汇报模板。

## 模板文件

`AGENTS.md` 正文模板见同目录 `agents.md`，`CLAUDE.md` 引用写法见 `claude.md`，汇报模板见 `report.md`。
