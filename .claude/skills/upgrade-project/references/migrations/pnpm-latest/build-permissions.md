# 依赖构建许可迁移

## pnpm 11 目标配置

pnpm 11 移除了以下旧字段，并统一由 `pnpm-workspace.yaml` 的 `allowBuilds` 表达：

- `onlyBuiltDependencies`
- `onlyBuiltDependenciesFile`
- `neverBuiltDependencies`
- `ignoredBuiltDependencies`
- `ignoreDepScripts`

`allowBuilds` 是包匹配器到布尔值的映射。`true` 表示允许执行安装构建脚本，`false` 表示明确禁止；未列出的构建脚本默认属于未审查状态。

```yaml
allowBuilds:
  esbuild: true
  core-js: false
```

迁移时逐项核对旧字段语义和真实依赖用途，不把旧数组机械地全部改为 `true`。可以先使用官方 `pnpx codemod run pnpm-v10-to-v11` 辅助转换，但必须审查 diff，不能把 codemod 当作依赖可信度判断。

## 严格检查

- `strictDepBuilds` 默认开启；存在未审查的依赖构建脚本时，安装会以 `ERR_PNPM_IGNORED_BUILDS` 失败。
- 保持严格检查。不要为了通过安装设置 `strictDepBuilds: false`，也不要启用 `dangerouslyAllowAllBuilds`。
- 只允许项目运行、构建或生成产物确实需要的包。包出现在错误列表中不等于应当授权。
- 使用 `pnpm approve-builds` 或 `pnpm add --allow-build` 写入配置后，仍要检查生成的 `allowBuilds` 条目；自动写入或占位值不是人工审查的替代。
- Docker 和 CI 必须与本地读取同一份 `pnpm-workspace.yaml`，否则依赖构建结果可能不一致。

迁移完成后重新执行普通安装和 frozen lockfile 安装，确认没有未审查构建脚本，也没有因为错误拒绝必要的二进制或生成步骤。
