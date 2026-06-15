在 pnpm 项目里，优先使用项目自己的类型检查脚本：

```bash
pnpm typecheck
```

没有 `typecheck` 脚本时再尝试：

```bash
pnpm exec tsgo --noEmit
```

如果没有 `tsgo`，使用：

```bash
pnpm exec tsc --noEmit
```
