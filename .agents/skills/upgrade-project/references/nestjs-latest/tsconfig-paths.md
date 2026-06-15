Vitest 项目移除 `tsconfig-paths` 前后，检查这些残留：

```text
tsconfig-paths
-tsconfig-paths/register
-r tsconfig-paths/register
require("tsconfig-paths")
require("tsconfig-paths/register")
```

如果残留位于 Jest 配置、`ts-jest` 配置或旧 `test:e2e` Jest 命令中，应随本次清理删除或同步到 Vitest 配置。

如果残留位于非测试启动脚本，例如 `ts-node -r tsconfig-paths/register ...`，先说明这已经超出“Vitest 项目清理 Jest 插件”的默认范围，需要同步处理该脚本后再删除依赖。
