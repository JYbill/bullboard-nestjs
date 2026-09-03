# pnpm 自身升级命令与验收

## 迁移前记录

```bash
node --version
pnpm --version
pnpm config list
git status --short
```

同时搜索仓库内的版本声明、安装调用方和已移除配置：

```bash
rg -n 'packageManager|devEngines|engines|npm install -g pnpm|corepack|pnpm self-update|resolution-only' . --glob 'package.json' --glob 'pnpm-workspace.yaml' --glob '*Dockerfile*' --glob '.github/**' --glob '.gitlab-ci.yml'
rg -n 'onlyBuiltDependencies|onlyBuiltDependenciesFile|neverBuiltDependencies|ignoredBuiltDependencies|ignoreDepScripts|allowBuilds|strictDepBuilds|dangerouslyAllowAllBuilds' . --glob '!node_modules/**'
```

命令中的路径按项目事实裁剪；缺少某个 CI 目录不算失败。

## 更新与验证

1. 先按 `index.md` 确定跟随默认发行渠道还是固定目标版本，再使用该策略取得的 pnpm 执行配置迁移。
2. pnpm 10→11 可以选择运行 `pnpx codemod run pnpm-v10-to-v11`，但运行前确认用户允许修改，运行后审查全部 diff。
3. pnpm 11→12 只有在官方标签仍适用时才使用 `pnpm self-update next-12`；项目固定版本时确认它实际更新的是项目声明还是全局 CLI。
4. 使用按选定策略取得的 pnpm 运行普通安装，受控更新 `pnpm-lock.yaml`。不要手工编辑 lockfile，也不要先删除 lockfile。
5. 执行以下最低验证：

```bash
pnpm --version
pnpm install --frozen-lockfile
pnpm peers check
```

6. 再运行项目已有的类型检查、构建和测试。存在 Docker / CI 调用方时，还要在对应环境输出 `pnpm --version` 并验证 frozen install；只有项目选择固定版本时，才要求实际版本与声明完全一致。

## 验收标准

- 本地、CI、Docker 和部署脚本符合项目选定的 pnpm 版本策略：可以统一固定版本，也可以跟随各自安装渠道的默认版本。
- 不再存在目标版本已移除的配置字段或 CLI 参数。
- `allowBuilds` 只包含经核对的依赖，严格构建检查没有被关闭。
- `pnpm-lock.yaml` 由实际使用的 pnpm 受控更新，且 `pnpm install --frozen-lockfile` 通过。
- 没有新增 npm、yarn 或 bun 锁文件。
- 报告区分“已执行并通过”“未执行”和“因项目限制保留旧主版本”，不把仅写入配置当作迁移完成。
