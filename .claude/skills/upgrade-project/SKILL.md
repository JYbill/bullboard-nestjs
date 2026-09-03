---
name: upgrade-project
description: 当用户要求评估或实施 JavaScript/TypeScript 项目升级、现代化、技术迁移、模板同步或项目标准化时使用。覆盖 Prettier/Oxfmt、ESLint/Oxlint、Jest/Vitest、CJS/ESM、pnpm latest、NestJS latest、SWC、Prisma Client、Docker 构建、.gitignore、AGENTS.md/CLAUDE.md 等内容，包含只评估项目差距和实际修改两种模式。
metadata:
  tags: 升级, 迁移, 重构, 工具链, javascript, typescript
---

## 目的

帮助评估或实施 JavaScript/TypeScript 项目的技术迁移、目标配置、项目规则和通用 workflow，同时避免把不相关的重构混入任务。先确认用户允许的操作范围和项目事实，再组合适用 references；只评估时不修改文件，允许执行时只做可验证的必要改动。

## 任务路由与执行流程

四类 references 可以组合使用。先确定任务模式和目标状态，再决定是否实施修改：

```text
用户请求
    │
    ▼
确认任务模式与范围：只评估 / 执行修改
    │
    ▼
检查项目事实、用户约束和未提交改动
    │
    ▼
选择并读取 references（可以组合）
    ├─ 技术从当前状态迁到目标状态 ─ migrations
    ├─ 项目应遵守的规则 ───────── profiles
    ├─ 具体框架的目标配置 ─────── frameworks
    ├─ 跨框架执行流程 ─────────── workflows
    └─ 没有匹配资料 ───────────── 小范围调研真实能力
    │
    ▼
组合目标状态和本次操作范围
    │
    ▼
references 是否与用户要求或项目事实冲突？
    ├─ 是：以用户要求和项目事实为准，记录必要偏差
    └─ 否：继续
    │
    ▼
是否只评估？
    ├─ 是：输出差距、风险和合理例外，停止
    └─ 否
        │
        ▼
      验证目标命令或配置真实可用
        │
        ▼
      实施最小改动，并同步受影响调用方
        │
        ▼
      局部验证；必要时再运行全量验证
        │
        ▼
      复查任务范围、旧技术残留和需幂等的命令
```

## 执行原则

1. **尊重任务模式。** 用户只要求评估时，只读取和比较，不修改文件、依赖、锁文件或 Git 状态。允许执行时也不得扩大到用户未授权的迁移或重构。
2. **以项目事实为准。** 编辑前检查脚本、直接依赖、锁文件、配置、提交前检查、项目说明和未提交改动。reference 提供目标基线，不覆盖用户要求或已经验证的项目差异。
3. **按职责组合 references。** 只读取本次任务匹配的入口；涉及多类资料时分别读取。多项迁移先确定执行顺序和每步验收点，避免前一项误删后一项仍需要的内容。
4. **先验证能力。** 修改命令或配置前，使用目标工具的帮助、版本或最小验证确认真实能力。命令、包名或配置字段不可用时，不编造替代方案。
5. **保持改动必要且集中。** 不混入无关的 lint、format、测试框架、模块系统、Docker、CI、IDE 或业务代码重构。
6. **追踪受影响调用方。** 脚本、配置或产物路径变化时，同步检查 Dockerfile、部署脚本、CI、husky、lint-staged、启动入口和项目文档中的实际引用。
7. **沿用项目工具链。** 根据锁文件使用现有包管理器；依赖、脚本或配置变化时同步维护锁文件和相关提交前检查。
8. **按风险验证。** 优先运行本次修改相关的局部检查，再按影响范围运行项目已有的类型检查、构建或测试。会修改文件的验证命令和需要幂等的操作按适用 reference 处理。

## 引用目录

引用资料按所有权分为四类：`migrations` 只描述从旧状态到新状态的转换；`profiles` 负责项目级规则；`frameworks` 负责可直接落地的框架目标配置；`workflows` 负责跨框架复用的执行流程和接口契约。不要在多个分类重复维护同一规则或具体模板。

### Migrations：技术迁移

- `references/migrations/prettier-oxfmt/index.md`：Prettier 到 Oxfmt。
- `references/migrations/eslint-oxlint/index.md`：ESLint 到 Oxlint。
- `references/migrations/jest-vitest/index.md`：Jest 到 Vitest；测试语义仍以目标项目的 `AGENTS.md` 或适用 profile 为准。
- `references/migrations/cjs-esm/index.md`：TypeScript 项目的 CommonJS/CJS 到 ESM。
- `references/migrations/pnpm-latest/index.md`：pnpm 自身升级到最新稳定版；包含版本选择、项目版本声明、依赖构建许可和锁文件兼容处理。
- `references/migrations/nestjs-latest/index.md`：NestJS 升级的唯一入口；先盘点现有校验方式并处理用户确认，再在同一目录读取依赖、Standard Schema 和验证资料。

### Profiles：项目规则

- `references/profiles/nodejs-backend/index.md`：普通 Node.js 后台项目 profile。任务涉及框架无关的 `AGENTS.md`、`CLAUDE.md`、测试分层或代码组织规则时读取。
- `references/profiles/nestjs-backend/index.md`：NestJS 后台项目 profile。维护 NestJS 项目的完整规则模板，包括用户采用 Standard Schema 后的长期 Schema 约定。
- `references/profiles/react-csr/index.md`：CSR React 项目规则 profile，只维护 `AGENTS.md`、`CLAUDE.md` 和前端项目需要的 skill 约定。

### Frameworks：目标配置

- `references/frameworks/nestjs/index.md`：NestJS 的 `package.json`、`tsconfig.json`、`nest-cli.json`、`.swcrc`、Prisma Client、PM2 和 Dockerfile 目标模板。
- `references/frameworks/react-csr/index.md`：React CSR + Vite 的依赖、构建、类型检查、测试、Oxlint、Oxfmt 和 lint-staged 目标模板。

### Workflows：通用流程

- `references/workflows/docker-build/index.md`：Docker 构建、校验、镜像发布和部署脚本流程。这里只维护通用阶段契约，具体 Dockerfile 由项目或 framework 决定。
- `references/workflows/gitignore/index.md`：Git 忽略规则模板。
- `references/workflows/dependencies-latest/index.md`：升级全部直接依赖；包含最新稳定版本、peer dependency 和锁文件检查，pnpm 自身升级另行组合 pnpm migration。
