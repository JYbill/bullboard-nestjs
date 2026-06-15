编辑代码后优先运行本次修改相关的测试文件：

```bash
pnpm exec vitest run path/to/file.spec.ts path/to/other-file.integration-spec.ts
pnpm exec vitest run test/app.e2e-spec.ts
```

需要验证单元测试和集成测试整组时，使用 `package.json` 中的脚本：

```bash
pnpm test
pnpm test:cov
```

需要本地监听单元测试和集成测试时使用：

```bash
pnpm test:watch
```

需要验证 e2e 时仍直接运行 e2e project，或按项目既有约定使用独立 e2e 脚本：

```bash
pnpm exec vitest run --project e2e
```
