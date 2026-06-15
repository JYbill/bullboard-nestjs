# Gitignore 模板参考

## 适用场景

当用户要求新增、整理、统一或迁移项目的 `.gitignore` 时，使用这份参考。

常见触发信号：

- 用户提到 `.gitignore`、gitignore、忽略文件、提交忽略规则。
- 项目缺少 `.gitignore`，或现有忽略规则没有覆盖本地配置、缓存、日志、上传目录和环境文件。
- 用户要求把当前后台项目的忽略规则沉淀成通用模板。

## 核心约定

默认模板以当前项目根目录 `.gitignore` 为基础，覆盖 Node.js/TypeScript 后台项目常见的 IDE 配置、依赖目录、构建产物、运行日志、覆盖率、上传目录、临时目录、环境变量文件、AI/agent 本地工作目录和项目过程性目录。

落地到其他项目时，先检查项目真实目录结构和需要保留的占位文件。`public/*/.gitkeep`、`tmp/.gitkeep`、`logs/.gitkeep` 这类例外规则只在项目确实使用对应空目录占位时保留。

`.gitignore` 只负责本地仓库忽略规则；Docker 构建上下文排除规则应使用 `references/docker-build/index.md` 中的 `.dockerignore` 模板，不要把 `.dockerignore` 和 `.gitignore` 混成一份文件。

## 修改原则

1. **先看现有规则。** 修改前检查当前 `.gitignore`，避免删除项目已经依赖的忽略项或例外项。
2. **按真实目录裁剪。** 模板中不存在于当前项目的目录可以删除；项目存在但模板未覆盖的本地缓存、日志、运行产物应补充。
3. **环境文件默认忽略。** `env/.env`、开发/生产环境变量、本地 TLS 文件等默认不入库；如果某个环境样例需要提交，应使用 `.example`、`.sample` 等明确命名。
4. **保留占位文件例外。** 忽略目录内容时，如果项目依赖空目录存在，使用 `!<dir>/.gitkeep` 这类例外规则保留占位文件。
5. **不要忽略源码和规范文件。** 不要为了减少噪音忽略 `src/`、`docs/spec/`、`AGENTS.md`、`CLAUDE.md`、`.github/` 等应被版本管理的项目资产；除非项目明确把某类过程性文档视为本地工作区，如当前模板中的 `docs/plan/`。GitHub Actions 工作流和仓库配置通常需要入库，不要默认使用 `.github` 或 `.github/*` 忽略整个目录。
6. **AI/agent 本地目录默认忽略。** `.ai`、`.aiassistant`、`.sisyphus`、`.opencode`、`.claude/settings.local.json`、`.claude/worktree` 等本地工作状态不应入库。
7. **不要隐藏锁文件差异。** 当前模板忽略 `package-lock.json` 是因为项目使用 pnpm；迁移到 npm 项目时不要保留这一项，应改为保留 `package-lock.json` 并按实际包管理器忽略无关锁文件。

## 推荐执行流程

```text
检查当前包管理器、目录结构和已有 .gitignore
        │
        ▼
读取 references/gitignore/gitignore.md
        │
        ▼
按项目事实裁剪模板项、保留必要 .gitkeep 例外
        │
        ▼
检查 git status，确认没有把应提交文件误忽略
        │
        ▼
汇报新增或调整的忽略范围，以及有意保留/删除的项目差异
```

## 验收标准

调整 `.gitignore` 后至少确认：

- 本地 IDE 配置、系统文件、依赖目录、缓存、日志、覆盖率和临时目录已被忽略。
- 环境变量文件、TLS 文件和本地运行状态不会被提交。
- 上传目录、日志目录和临时目录如果需要占位，保留了 `.gitkeep` 例外规则。
- 当前项目使用的包管理器锁文件不会被错误忽略。
- 没有把源码、标准文档、配置样例或需要入库的规范文件误加入忽略规则。
- `.dockerignore` 需求没有混入 `.gitignore`，需要 Docker 构建排除时读取 Docker reference。

## 模板文件

`.gitignore` 模板见同目录 `gitignore.md`，汇报模板见 `report.md`。
