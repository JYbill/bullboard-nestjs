优先运行：

```bash
pnpm typecheck
pnpm build
```

如果本次从 `prisma-client-js` 私有目录迁移到 Prisma 7 `prisma-client`，或调整了 ESM 生成器配置，先运行项目已有校验与生成命令，再构建：

```bash
pnpm prisma:validate
pnpm prisma:generate
pnpm typecheck
pnpm build
```

然后按项目实际产物路径直接执行一次 Node ESM 导入；存在生产镜像时继续运行容器和 HTTP smoke，不能只验证 Docker build：

```bash
node --input-type=module -e 'import("./dist/library/prisma/prisma.js")'
```

如果本次影响了 SWC / Vitest / Vite 配置或测试依赖，再运行相关测试：

```bash
pnpm exec vitest run path/to/file.spec.ts
pnpm exec vitest run --project test
```

选择 Standard Schema + Zod 时，最后搜索旧校验体系残留，并确认所有原本需要校验的 Controller 参数都带 schema metadata：

```bash
rg "class-validator|class-transformer|@nestjs/mapped-types|ValidationPipe|plainToInstance|validateSync" src test
```

测试还应覆盖环境变量缺失时启动失败、body / query / param 转换、未知字段策略、400 响应和实际启用的响应 serializer。

没有 Vitest 或没有对应测试时，不要虚报执行。命令失败时保留关键错误输出，并说明是否属于本次 NestJS latest 迁移范围。
