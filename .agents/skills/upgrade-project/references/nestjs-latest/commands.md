优先运行：

```bash
pnpm typecheck
pnpm build
```

如果本次影响了 SWC / Vitest / Vite 配置或测试依赖，再运行相关测试：

```bash
pnpm exec vitest run path/to/file.spec.ts
pnpm exec vitest run --project test
```

没有 Vitest 或没有对应测试时，不要虚报执行。命令失败时保留关键错误输出，并说明是否属于本次 NestJS latest 迁移范围。
