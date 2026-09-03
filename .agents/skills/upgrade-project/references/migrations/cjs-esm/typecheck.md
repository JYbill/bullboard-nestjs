在 pnpm 项目里，优先使用项目自己的类型检查脚本：

```bash
pnpm typecheck
```

没有 `typecheck` 脚本时，使用当前项目安装的 TypeScript 7：

```bash
pnpm exec tsc --noEmit
```

确认命令实际加载的是项目本地依赖，而不是全局旧版本：

```bash
pnpm exec tsc --version
```
