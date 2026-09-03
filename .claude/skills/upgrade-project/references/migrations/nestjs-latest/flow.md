当需要解释为什么删除或保留某个依赖时，使用 ASCII 图 + 描述。

```text
盘点全局 Pipe、DTO、校验依赖和 Controller 参数
        │
        ▼
是否检测到全局 ValidationPipe？
        ├─ 否：按目标版本继续升级
        └─ 是
            │
            ▼
           用户是否已明确授权迁移到 Standard Schema + Zod？
            ├─ 否：报告影响并询问；确认前保留原校验体系
            ├─ 选择保留：只做 NestJS / 依赖兼容升级并记录原因
            └─ 选择迁移：同步全局 Pipe、路由 Schema、环境变量、依赖和测试
```

Standard Schema 是 NestJS 12 提供的新能力，不是强制迁移项。不能仅替换全局 Pipe，因为没有提供 `schema` metadata 的 Controller 参数不会因此自动获得 Zod 校验。

```text
发现 tsconfig-paths
        │
        ▼
项目是否是 Vitest？
        │
        ├─ 否：本次不处理
        │
        └─ 是
            │
            ▼
           是否仍有非测试脚本引用？
            │
            ├─ 否：移除依赖
            └─ 是：先同步对应脚本，再移除或说明冲突
```

描述示例：

```markdown
当前项目已经使用 Vitest，`tsconfig-paths` 只在旧 Jest/ts-node 测试链路中出现，所以本次随 NestJS latest 升级移除该直接依赖。未做测试框架迁移，因为项目已经完成 Vitest 切换。
```

```text
发现 Prisma 7 Client
        │
        ▼
是否仍使用 prisma-client-js、node_modules/.prisma 输出或 .prisma/client 私有导入？
        │
        ├─ 是：按 framework 完整迁移 provider、源码 output 和应用导入
        └─ 否：检查现有 prisma-client
            │
            ▼
           生成的 TS Client 是否会被编译到 dist，且已显式配置 ESM / .js import？
            │
            ├─ 否：按项目事实保留
            └─ 是：同步 adapter、生成目录排除项、Docker 和运行 smoke
```

描述示例：

```markdown
当前项目仍把 Prisma Client 生成到 `node_modules/.prisma/client` 并从私有路径导入。按照 NestJS Prisma framework，将它完整迁移为源码目录中的 ESM TypeScript Client，同步应用导入、MariaDB adapter、生成目录排除项和 production 镜像；不修改 datasource model 或 migration。
```
