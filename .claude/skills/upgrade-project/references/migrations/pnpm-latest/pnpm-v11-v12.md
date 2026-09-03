# pnpm 11 升级到 12

pnpm 12 是 Rust 重写版本。官方说明其命令、设置和 lockfile 格式总体兼容 pnpm 11，但仍需检查以下明确差异。

## 安装与版本策略

- 2026-09-02 的官方文档中，pnpm 12 已是稳定版，但 npm `latest` 仍安装 pnpm 11，pnpm 12 通过 `next-12` 或精确版本安装。执行迁移时重新核验当前标签。
- 已使用 pnpm 11.10.0 及以上时，官方提供 `pnpm self-update next-12`；在带 `packageManager` 固定的项目内，该命令只更新项目固定值，不代表全局 CLI 已被替换。
- 项目选择跟随 npm 默认发行渠道时，Docker、CI 和部署脚本可以保留 `npm install -g pnpm`，并以实际输出的版本为准。只有任务明确要求 pnpm 12 或精确版本时，才需使用对应标签或精确版本；未验证实际版本时不宣称已升级到 pnpm 12。
- 核对目标安装方式的 Node.js、libc 和平台要求；不要把 npm 安装方式与 pnpm 12 独立二进制的运行要求混为一谈。

## 必查差异

1. 搜索 `pnpm install --resolution-only`。pnpm 12 已移除该参数，检查 peer dependency 改用 `pnpm peers check`。
2. 如果项目固定了 Node.js / Deno / Bun runtime，核对 pnpm 12 的 project-aware global bins 行为，确认脚本实际运行的 runtime 版本。
3. 检查 Git 依赖。pnpm 12 会规范化 GitHub、GitLab 和 Bitbucket 的依赖解析；旧 lockfile 仍可 frozen install，只有重新解析相关依赖时才接受并审查一次性 lockfile 变化。
4. 含循环依赖图的 workspace 在首次重新解析时可能产生一次性 peer variant lockfile diff；不能把所有大范围 lockfile 变化都归因于这一点。
5. 使用 `engineStrict` 时，核对 optional dependency 子树的兼容性；pnpm 12 对其中常规 dependency 边上的不兼容包检查更严格。
6. 如果脚本依赖 Linux 上 `packageImportMethod: auto` 的 reflink 行为，核对 pnpm 12 改为优先 hardlink 的影响；普通项目不需要为此新增配置。

官方差异说明：[What's different in pnpm 12](https://pnpm.io/blog/whats-different-in-pnpm-12)。
