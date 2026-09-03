# NestJS latest 依赖与兼容处理

## 版本与兼容规则

- 将项目已有的 `@nestjs/common`、`@nestjs/core`、HTTP platform、`@nestjs/config`、`@nestjs/testing`、CLI 和 schematics 升到相互兼容的最新稳定版本，保持原有 dependencies / devDependencies 分区。
- 从 NestJS 11 升级到 12 时，确认项目运行时和构建产物支持 ESM；若项目仍是 CommonJS，把模块系统迁移列为独立风险，不在依赖报错后临时混改。
- 检查 Redis、CLS、Prisma、Swagger 等 Nest 扩展包的 peer 范围。模板或脚手架中已经注册的预置能力即使当前没有消费者也必须保留并验证；普通业务项目只有在用户授权清理、确认没有消费者且不承担模板职责时才可移除。存在消费者时应升级、替换或适配。
- 上游尚未声明目标 NestJS 或基础依赖版本，但模板明确要求保留且类型检查、构建和应用初始化均通过时，可以使用 pnpm 按父包限定的 `peerDependencyRules.allowedVersions` 记录兼容例外。例外必须精确到产生旧 peer 范围的包，不使用全局 `allowAny`，上游发布兼容版本后应删除例外。
- TypeScript 主版本必须通过 Nest CLI 的真实 build 验证。2026-09-03 的组合中，Nest CLI 12.0.0 依赖 TypeScript `~6.0.2`，TypeScript 7.0 只提供 `tsc` 可执行文件、暂不暴露 CLI 需要的编程式编译 API，预计 7.1 恢复；因此使用 TypeScript 6.0.3。这是技术兼容限制，不是风格建议，后续升级时必须重新实测，不能永久锁死该快照。
- Prisma 7 的 ESM 项目若仍使用 `prisma-client-js` 并从 `.prisma/client` 私有路径导入，按 `../../frameworks/nestjs/prisma-client.md` 改为源码目录中的 `prisma-client` TypeScript 产物，由 Nest/SWC 一起编译；同步合法源码导入、adapter、生成目录排除项和 Docker，生产镜像不再复制 `.prisma` 目录。
- Standard Schema + Zod 是 NestJS 12 的可选迁移。只有用户确认后才新增 Zod，并在无引用后移除 `class-validator`、`class-transformer`、`@nestjs/mapped-types`；具体规则读取 `standard-schema.md`。
- 预发布版不算默认目标。Prisma CLI、Client 和 adapter 等成组包必须保持同一稳定版本。
- 升级全部直接依赖的通用流程读取 `../../workflows/dependencies-latest/index.md`。

## 模板预置能力兼容例外

截至 2026-09-03，当前 NestJS 12 模板保留以下最新稳定依赖：

- `@liaoliaots/nestjs-redis@10.0.0`；其 peer 仍声明 NestJS 10 和 ioredis 5。
- `nestjs-cls@6.2.2`、`@nestjs-cls/transactional@3.2.2`；其 peer 仍声明 NestJS `< 12`。
- `@nestjs-cls/transactional-adapter-prisma@1.3.6`；其 peer 已覆盖 Prisma 7。

当前模板已经用 NestJS 12.0.1、ioredis 6.0.0、Prisma 7.10.0 完成类型检查、SWC 构建和 `AppModule` 初始化。保留这些预置能力时，在 `pnpm-workspace.yaml` 使用按父包和主版本限定的兼容例外：

```yaml
peerDependencyRules:
  allowedVersions:
    "@liaoliaots/nestjs-redis@10>@nestjs/common": "12"
    "@liaoliaots/nestjs-redis@10>@nestjs/core": "12"
    "@liaoliaots/nestjs-redis@10>ioredis": "6"
    "nestjs-cls@6>@nestjs/common": "12"
    "nestjs-cls@6>@nestjs/core": "12"
    "@nestjs-cls/transactional@3>@nestjs/common": "12"
    "@nestjs-cls/transactional@3>@nestjs/core": "12"
```

这个例外只表示当前模板组合通过了已有验证，不代表上游正式声明兼容。迁移到其他项目时重新检查最新 peer 范围和实际消费者；上游发布正式兼容版本后升级并删除对应规则。

## 依赖升级命令模板

以 pnpm 为例。先从 `package.json` 读取项目已有的 NestJS 直接依赖，再按原分区升级，不要盲目复制下面的完整列表。

生产依赖示例：

```bash
pnpm add @nestjs/common@latest @nestjs/core@latest @nestjs/platform-express@latest
```

开发依赖示例：

```bash
pnpm add -D @nestjs/cli@latest @nestjs/schematics@latest @nestjs/testing@latest
```

NestJS SWC builder 依赖示例。项目已使用或用户要求启用 SWC builder 时再处理，不要给非 SWC 项目盲目新增：

```bash
pnpm add -D @swc/core @swc/cli
```

如果 `.swcrc` 使用 `externalHelpers: true`，服务端运行时通常需要：

```bash
pnpm add @swc/helpers
```

如果项目只在测试转换中使用 SWC，或已有构建工具间接提供 helper，先按项目事实判断依赖分区，并在汇报中说明。

如果项目使用 npm、yarn 或 bun，按锁文件替换为对应命令，并保持 dependencies / devDependencies 分区。

## 移除依赖命令模板

pnpm：

```bash
pnpm remove source-map-support @types/source-map-support
```

Vitest 项目还需要移除：

```bash
pnpm remove tsconfig-paths
```

npm：

```bash
npm uninstall source-map-support @types/source-map-support
npm uninstall tsconfig-paths
```

yarn：

```bash
yarn remove source-map-support @types/source-map-support
yarn remove tsconfig-paths
```

bun：

```bash
bun remove source-map-support @types/source-map-support
bun remove tsconfig-paths
```

只运行和当前项目事实匹配的命令。没有安装的包不要强行移除；已由其他包传递依赖带入的包不需要从锁文件里手工删除。
