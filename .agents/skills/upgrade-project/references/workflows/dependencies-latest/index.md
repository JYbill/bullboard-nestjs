# 全部直接依赖升级流程

## 适用范围

用户明确要求升级全部包或全部直接依赖时使用。这里只维护跨框架执行流程；框架主版本的具体迁移规则仍读取对应 migration / framework reference。

## pnpm 流程

1. 记录 `package.json`、`pnpm-lock.yaml`、Node/pnpm 版本、`pnpm list --depth 0`、`pnpm outdated --format json` 和现有验证结果。
2. 运行 `pnpm update --latest` 升级 dependencies 与 devDependencies 中已有的全部直接依赖；新增、移除或需要锁定版本的包使用 `pnpm add` / `pnpm remove`，不手改锁文件。
3. 逐项检查安装版本是否为稳定版。`latest` 指向 alpha、beta、RC 等预发布版时，显式选择最新稳定版本，并在报告中记录例外。
4. 成组依赖保持兼容版本，例如框架 core/platform/testing、Prisma CLI/Client/adapter。运行 `pnpm peers check`，不能用 `--force`、忽略 warning 或关闭 strict peer 检查掩盖冲突。
5. 如果同时升级 pnpm 自身，读取 `../../migrations/pnpm-latest/index.md` 处理版本声明、构建脚本许可和锁文件兼容；本流程不重复维护 pnpm 主版本迁移规则。
6. 运行 `pnpm install --frozen-lockfile`，确认唯一锁文件可以复现依赖树。不得新增 npm、yarn 或 bun 锁文件。
7. 依次运行类型检查、构建、规范检查、测试，以及框架或基础设施要求的专项验证。

reference 只记录版本选择规则和已知主版本兼容问题，不长期硬编码所有直接依赖的 patch 版本。每次执行都以当时 registry、官方兼容范围和项目实测为准；需要保留的历史版本快照写在对应的版本 migration 中，并标明日期与重新验证要求。

## 报告要求

报告直接依赖的主要版本变化、移除与新增原因、稳定版例外、peer dependency 结果、frozen lockfile 结果和实际验证。传递依赖的存在不等于项目仍在直接使用某个已移除技术。
