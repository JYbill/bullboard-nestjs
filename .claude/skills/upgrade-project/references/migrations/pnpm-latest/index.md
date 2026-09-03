# pnpm 升级到最新稳定版

## 适用范围

用户明确要求升级 pnpm、自身包管理器版本、`packageManager` / `devEngines.packageManager`、`pnpm-workspace.yaml` 版本配置或 pnpm lockfile 格式时使用。

这里只维护 pnpm 自身的版本迁移。升级项目全部直接依赖读取 `../../workflows/dependencies-latest/index.md`；不要因为使用 `pnpm update --latest` 就自动触发本 migration。

## 目标版本判定

1. 先读取 pnpm 官方 Installation、Migration 和目标主版本差异文档，确认当前稳定版本、安装标签、Node.js 要求和目标平台支持。
2. 先确认项目采用哪种版本策略：跟随安装渠道的默认 pnpm，或固定主版本、范围或精确版本。没有明确要求时沿用项目既有策略，不为了版本一致而自动新增固定声明。
3. npm registry 的 `latest` 标签可能不等于 pnpm 的最高稳定版本。2026-09-02 的官方文档中，pnpm 12 已稳定发布，但 npm 的 `latest` 仍指向 pnpm 11；执行时重新核验并记录实际安装版本，不能永久沿用这一快照。
4. 项目明确固定主版本、受 CI / Docker / Node.js 限制，或用户只要求当前主版本最新 patch 时，遵守项目要求并记录没有升级到更高稳定主版本的原因。
5. 只有项目明确要求各环境固定同一 pnpm 版本时，才同步本地、CI、Docker 和部署环境的精确版本。项目选择跟随默认版本时，可以保留 `npm install -g pnpm`，但要在实际构建中输出版本并验证 lockfile 与项目命令可用。

## 迁移前盘点

- 当前 `node --version`、`pnpm --version` 和 pnpm 的实际来源。
- `package.json` 中的 `packageManager`、`devEngines.packageManager`、`engines.pnpm`。
- `pnpm-workspace.yaml`、`.npmrc`、`pnpm-lock.yaml` 和 package.json 旧 `pnpm` 配置字段。
- Dockerfile、CI、部署脚本、开发环境配置中的 pnpm 安装与缓存命令。
- `onlyBuiltDependencies` 等旧构建许可字段、`strictDepBuilds`、`allowBuilds` 和会执行安装脚本的真实依赖。
- `--resolution-only` 等目标版本已移除的 CLI 参数，以及脚本中依赖的 pnpm 输出或副作用。

## 版本声明规则

- 沿用项目已有的版本管理方式，不无故同时引入多个声明来源。项目使用默认发行渠道时，不强制新增 `packageManager`、`devEngines.packageManager` 或精确版本。
- `packageManager` 用于精确固定 pnpm 版本；项目需要完全一致的本地、CI 和 Docker 版本时优先使用精确版本。
- `devEngines.packageManager` 从 pnpm 11 起支持版本范围，并可按 `onFail` 策略下载匹配版本；只有项目明确需要范围策略时使用。
- `engines.pnpm` 表达项目支持范围，不替代可执行文件的安装或精确固定。
- pnpm 11 起不再读取 `package.json` 的 `pnpm` 配置字段；项目配置迁移到 `pnpm-workspace.yaml`，registry 和认证配置按官方要求保留在适用位置。
- 安装命令必须符合项目选定的策略。跟随默认发行渠道时可使用 `npm install -g pnpm`；只有明确要求某个主版本或精确版本时，才使用对应官方标签或精确版本。

## 版本路由

- 从 pnpm 10 或更早版本升级到 11 及以上：读取 [build-permissions.md](build-permissions.md)，迁移被移除的依赖构建许可字段。
- 从 pnpm 11 升级到 12：继续读取 [pnpm-v11-v12.md](pnpm-v11-v12.md)，处理安装方式和明确列出的行为差异。
- 其他主版本组合：先查官方 migration / release 文档，再补版本专题；不能根据报错猜测迁移规则。
- 所有版本组合最终读取 [commands.md](commands.md) 完成锁文件和调用方验证。

## 默认不处理事项

- 不顺带升级全部项目依赖、框架、lint、format、测试框架或模块系统。
- 不删除 `pnpm-lock.yaml` 来掩盖不兼容；先确认目标版本是否支持现有 lockfile，再用目标 pnpm 进行受控更新。
- 不使用 `--force`、关闭严格检查或允许所有依赖执行构建脚本来绕过迁移错误。
- 不修改全局 pnpm 安装，除非用户明确授权；项目迁移优先修改仓库内可复现的版本声明和调用方。

## 官方依据

- [pnpm Installation](https://pnpm.io/installation)
- [pnpm package.json](https://pnpm.io/package_json)
- [pnpm Settings](https://pnpm.io/settings)
- [pnpm Build Settings](https://pnpm.io/settings/build)
- [pnpm install](https://pnpm.io/cli/install)
- [pnpm Migration](https://pnpm.io/migration)
