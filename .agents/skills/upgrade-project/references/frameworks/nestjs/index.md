# NestJS 目标配置参考

## 适用场景

当任务需要为 NestJS 项目选择或同步目标配置时，使用这份参考。这里只保存 NestJS 当前目标状态，不描述从旧版本迁移到该状态的完整过程。

## 所有权边界

- NestJS latest 的升级步骤、依赖清理和验收流程见 `../../migrations/nestjs-latest/index.md`。
- NestJS 项目的命令、Schema、测试分层、类型和代码组织规则以 `../../profiles/nestjs-backend/AGENTS.md` 为模板正文。
- Docker 构建阶段、`docker-build.sh`、镜像 tag、push 和 save 流程见 `../../workflows/docker-build/index.md`。
- 本目录拥有 NestJS 的具体 Dockerfile 和 PM2 模板。Koa、Express 或其他后台框架应维护自己的模板，不能直接套用 NestJS 文件。

## 模板文件

- `package.md`：NestJS 生产启动和类型检查脚本片段。
- `tsconfig.md`：NodeNext、装饰器元数据和构建输出相关 TypeScript 配置。
- `nest-cli.md`：Nest CLI 与 SWC builder 配置。
- `swcrc.md`：NestJS 装饰器和元数据所需 SWC 配置。
- `prisma-client.md`：Prisma 7 从 `prisma-client-js` 私有生成目录迁移到源码目录内的 ESM TypeScript Client，并同步合法导入、adapter、忽略规则、Docker 和运行验证。
- `pm2.md`：NestJS 编译产物的 PM2 启动模板。
- `dockerfile.md`：当前 NestJS 服务的具体多阶段 Dockerfile 模板。

落地模板前必须核对项目的 Node.js 版本、包管理器、输出入口、系统依赖、Prisma 使用方式、运行端口和进程管理器。模板是目标基线，不覆盖已经验证过的项目差异。
