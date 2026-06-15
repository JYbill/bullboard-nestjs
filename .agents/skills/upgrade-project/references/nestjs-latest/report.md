已完成 NestJS latest 升级相关整理。

变更：
- 已将项目现有 `@nestjs/*` 直接依赖升级到 latest，并保持原 dependencies / devDependencies 分区。
- 已移除 `source-map-support` / `@types/source-map-support` 及注册代码。
- `package.json` 中直接用 `node` 运行编译产物的脚本已加 `--enable-source-maps`，默认 `start` / `start:prod` 为 `node --enable-source-maps dist/src/main.js`。
- `pm2.config.cjs` 已同步 `node_args: "--enable-source-maps"`。
- `package.json` 的 `typecheck` 已设置为 `tsc --noEmit`。
- `nest-cli.json` 的 `compilerOptions.deleteOutDir` 已设置为 `true`。
- NestJS SWC builder 已通过 `swcrcPath: ".swcrc"` 指向根目录 `.swcrc`，`.swcrc` 已保留装饰器元数据并设置 `module.ignoreDynamic: true`。
- 当前项目使用 Vitest，已移除 `tsconfig-paths` 直接依赖及相关旧测试链路残留。
- 如用户要求同步 Dockerfile，`x86-debian.Dockerfile` 已按模板更新；如未要求，说明未处理 Dockerfile。

验证：
- 已运行 `<实际类型检查命令>`：<结果>。
- 已运行 `<实际构建命令>`：<结果>。
- 已运行 `<实际测试命令或说明未运行>`：<结果>。

注意：
- 未迁移 lint、format、ESM 或业务逻辑；Dockerfile 只在用户明确要求时按 `x86-debian.Dockerfile` 模板同步。
- 如有命令失败，说明失败原因和是否属于本次迁移范围。
- 保留未处理的既有无关工作区改动。
