# NestJS 升级到 latest 参考

## 适用场景

当用户要求把 NestJS 后台项目升级到最新版本，或明确提到以下内容时，使用这份参考：

- NestJS 升级、`nestjs latest`、`@nestjs/*` 升级；
- `source-map-support`、`--enable-source-maps`、Node.js source map；
- `package.json` 的 `start`、`start:prod`、`typecheck` 脚本；
- `pm2.config.cjs` 的 Node.js 启动参数；
- `.swcrc`、`@swc/core`、`@swc/cli`、`@swc/helpers`、`compilerOptions.builder.type: "swc"`、`swcrcPath`；
- `x86-debian.Dockerfile`、NestJS latest 对应 Dockerfile 模板；
- Vitest 项目中清理 `tsconfig-paths`；
- 将一次 NestJS 升级经验沉淀成可复用流程。

这份参考默认面向 TypeScript NestJS 服务端项目。默认只升级 NestJS 相关直接依赖、NestJS 构建配置（含 SWC builder / `.swcrc`）和本文件列出的运行脚本、类型检查、测试路径插件清理；Dockerfile 只在用户明确要求时按 `x86-debian.Dockerfile` 模板同步。不顺手迁移 lint、format、ESM 或业务代码。

## 迁移目标

默认目标：

1. 将项目中已有的 NestJS 直接依赖升级到 latest，依赖分区保持原样。
2. 移除 `source-map-support` 及其注册代码，改用 Node.js 原生 source map 能力。
3. 将 `package.json` 中直接用 `node` 运行编译产物的脚本加上 `--enable-source-maps`，默认 `scripts.start` 和 `scripts.start:prod` 都使用 `node --enable-source-maps dist/src/main.js`。
4. 确保 `pm2.config.cjs` 中启动编译产物的应用配置包含 `node_args: "--enable-source-maps"`。
5. 确保 `package.json` 存在并使用精确的 `scripts.typecheck: "tsc --noEmit"`。
6. 确保 `nest-cli.json` 的 `compilerOptions.deleteOutDir` 为 `true`。
7. NestJS 项目使用 SWC builder 时，确保 `nest-cli.json` 通过 `swcrcPath: ".swcrc"` 指向根目录 `.swcrc`，并按 `swcrc.md` 同步 NestJS `.swcrc` 模板。
8. 如果项目已经是 Vitest，移除 `tsconfig-paths` 直接依赖以及只服务于 Jest/ts-node 测试链路的残留引用。
9. 更新锁文件，并运行项目已有验证命令。
10. 如果用户明确要求同步 Dockerfile，以 `x86-debian.Dockerfile` 作为 NestJS 服务镜像模板。

脚本模板见同目录 `package.md`，`tsconfig.json` 模板见 `tsconfig.md`，`nest-cli.json` 模板见 `nest-cli.md`，`.swcrc` 模板见 `swcrc.md`，`pm2.config.cjs` 模板见 `pm2.md`，依赖命令见 `dependencies.md`，清理示例见 `source-map-support.md` / `tsconfig-paths.md`，Dockerfile 模板见 `dockerfile.md`，验证命令见 `commands.md`，汇报模板见 `report.md`。

## 默认迁移边界

默认要做：

- 检查 `package.json`、锁文件、`nest-cli.json`、`.swcrc`、NestJS 配置、测试框架配置和启动入口。
- 升级已经存在的 `@nestjs/*` 直接依赖，例如 `@nestjs/common`、`@nestjs/core`、`@nestjs/platform-*`、`@nestjs/config`、`@nestjs/swagger`、`@nestjs/testing`、`@nestjs/cli`、`@nestjs/schematics` 等。
- 移除 `source-map-support`、`@types/source-map-support` 直接依赖，以及 `import "source-map-support/register"`、`require("source-map-support/register")`、`sourceMapSupport.install()` 等注册代码。
- 修改所有直接用 `node` 运行编译产物的脚本，确保带 `--enable-source-maps`；默认包括 `scripts.start` 和 `scripts.start:prod`。
- 同步 `pm2.config.cjs` 的 `node_args: "--enable-source-maps"`。
- 修改 `scripts.typecheck` 到 `tsc --noEmit`。
- 将 `nest-cli.json` 的 `compilerOptions.deleteOutDir` 设置为 `true`。
- NestJS 项目使用 SWC builder 时，同步 `.swcrc`、`swcrcPath: ".swcrc"` 和 `@swc/helpers` 运行时依赖判断。
- Vitest 项目移除 `tsconfig-paths` 直接依赖。
- 用户明确要求 Dockerfile 模板时，使用同目录 `dockerfile.md` 中的 `x86-debian.Dockerfile` 模板。

默认不要做：

- 不新增项目原本没有的 NestJS 扩展包，除非最新 NestJS peer dependency 或用户需求明确要求。
- 不把 Jest 到 Vitest、CJS 到 ESM、ESLint 到 Oxlint、Prettier 到 Oxfmt 混入本次迁移；这些属于其他 references。
- 不把通用 Vitest SWC 配置混入 NestJS latest；通用模板放在 `references/jest-vitest/swcrc.md`。
- 不默认重写 Docker 构建或部署流程；只有用户明确要求 Dockerfile 模板时，才按 `x86-debian.Dockerfile` 模板同步。
- 不为了通过类型检查使用 `any`、`unknown`、`as any` 或 `as unknown as ...`。
- 不修改业务逻辑来掩盖框架升级问题；先判断是否是依赖、类型或配置问题。

## 复杂判断方式

涉及是否删除依赖、是否扩大范围、是否保留旧脚本时，先用 ASCII 图表达判断路径，再用简短描述说明结论。图用于确认分支，描述用于说明为什么这样处理。

```text
读取 package.json / 锁文件 / 测试配置 / 启动入口
        │
        ▼
确认已有 @nestjs/* 直接依赖
        │
        ▼
按 dependencies / devDependencies 原分区升级到 latest
        │
        ▼
是否存在 source-map-support？
        │
        ├─ 是：删除依赖和注册代码，并给所有 node 运行编译产物的脚本加 --enable-source-maps
        │
        └─ 否：仍检查所有 node 运行编译产物的脚本是否已启用 Node source map
        │
        ▼
检查 pm2.config.cjs
        │
        ├─ 启动编译产物：确保 node_args 为 "--enable-source-maps"
        └─ 不存在或不启动编译产物：不新增 PM2 配置
        │
        ▼
检查 scripts.typecheck
        │
        ├─ 缺失：新增 "tsc --noEmit"
        ├─ 一致：保留
        └─ 不一致：改为 "tsc --noEmit"，并在汇报说明
        │
        ▼
检查 nest-cli.json 的 compilerOptions.deleteOutDir
        │
        ├─ 已是 true：保留
        └─ 缺失或不是 true：改为 true
        │
        ▼
检查 NestJS SWC builder / .swcrc
        │
        ├─ 使用 SWC builder：确保 swcrcPath 为 ".swcrc"，并按 swcrc.md 同步 .swcrc
        └─ 未使用 SWC builder：不强行切换构建器，除非用户明确要求
        │
        ▼
当前测试框架是否是 Vitest？
        │
        ├─ 是：移除 tsconfig-paths 直接依赖和 Jest/ts-node 测试残留引用
        └─ 否：不把测试框架迁移混进本次 NestJS latest 升级
        │
        ▼
安装 / 更新锁文件
        │
        ▼
运行 typecheck、build 和必要测试
        │
        ▼
汇报改动、验证结果和偏差
```

描述要求：如果分支判断很简单，一两句话即可。比如“当前项目已经使用 Vitest，`tsconfig-paths` 只属于 Jest/ts-node 旧链路，因此本次升级一并移除；未迁移测试框架本身。”不要只贴图不解释。

## 推荐执行流程

以 pnpm 项目为例，其他包管理器按锁文件替换命令。

1. 检查当前工作区是否有未提交改动，避免覆盖用户已有修改。
2. 读取 `package.json`、`nest-cli.json`、`.swcrc` 和 `pm2.config.cjs`：
   - `dependencies` / `devDependencies` 中的 `@nestjs/*`、`source-map-support`、`@types/source-map-support`、`tsconfig-paths`、`@swc/core`、`@swc/cli`、`@swc/helpers`；
   - `scripts.start`、`scripts.start:prod`、`scripts.typecheck`、`scripts.build`、`scripts.test`；
   - 所有直接使用 `node` 运行 `dist` 编译产物的脚本；
   - `pm2.config.cjs` 中启动编译产物的应用配置；
   - `compilerOptions.deleteOutDir`、`compilerOptions.builder` 和 `swcrcPath`；
   - `.swcrc` 的 NestJS 装饰器元数据配置、`module.type`、`module.ignoreDynamic`、`jsc.externalHelpers`；
   - 是否有 `jest` 字段或测试相关脚本。
3. 判断包管理器：优先按 `pnpm-lock.yaml`、`package-lock.json`、`yarn.lock`、`bun.lockb`。
4. 升级已有 NestJS 直接依赖到 latest，保持 dependencies / devDependencies 分区，不随意新增不在项目中的 NestJS 包。
5. 移除 `source-map-support` 直接依赖和注册代码。
6. 将所有直接使用 `node` 运行 `dist` 编译产物的脚本加上 `--enable-source-maps`；默认 `scripts.start` 和 `scripts.start:prod` 都使用 `node --enable-source-maps dist/src/main.js`。
7. 如果存在 `pm2.config.cjs` 且应用通过 PM2 启动编译产物，确保对应应用配置包含 `node_args: "--enable-source-maps"`。
8. 确保 `scripts.typecheck` 为 `tsc --noEmit`。如果已有但不一致，改到目标值并在汇报里说明原值。
9. 确保 `nest-cli.json` 的 `compilerOptions.deleteOutDir` 为 `true`。
10. 如果项目使用 SWC builder，确保 `nest-cli.json` 的 `compilerOptions.builder.type` 为 `"swc"`，`options.swcrcPath` 为 `".swcrc"`，并按 `swcrc.md` 同步根目录 `.swcrc`。如果 `.swcrc` 使用 `externalHelpers: true`，确认 `@swc/helpers` 运行时依赖可用。
11. 判断当前项目是否是 Vitest：
   - `package.json` 有 `vitest` 依赖或脚本；
   - 存在 `vitest.config.*`；
   - 测试代码从 `vitest` 导入 API。
12. 如果是 Vitest，移除 `tsconfig-paths` 直接依赖，并清理只属于 Jest/ts-node 测试链路的引用。Vitest / Vite 的路径别名应使用项目已有的 `resolve.tsconfigPaths` 或 Vite 配置方式。
13. 更新锁文件。
14. 如果用户明确要求同步 Dockerfile，按 `dockerfile.md` 的 `x86-debian.Dockerfile` 模板更新项目 Dockerfile；不要把 registry、推送脚本或部署流程混入本阶段。
15. 运行验证命令：优先 `typecheck`、`build`，再运行本次影响相关的测试。命令失败时，保留失败输出并判断是否属于本次迁移范围。

## source-map-support 处理

现代 Node.js 已支持 source map。NestJS latest 项目不再需要通过 `source-map-support` 注册栈追踪映射。

处理规则：

- 删除 `source-map-support` 和 `@types/source-map-support` 直接依赖。
- 删除源码中的 `source-map-support/register` 注册和 `sourceMapSupport.install()`。
- 将 `package.json` 中所有直接使用 `node` 运行 `dist` 编译产物的脚本加上 `--enable-source-maps`。
- 默认 `scripts.start` 和 `scripts.start:prod` 都设置为 `node --enable-source-maps dist/src/main.js`。
- 如果存在 `pm2.config.cjs` 且应用通过 PM2 启动编译产物，同步加入 `node_args: "--enable-source-maps"`。
- 如果项目的构建输出入口不是 `dist/src/main.js`，先核对实际 NestJS 构建配置；没有明确证据时按本迁移目标设置，并在汇报里说明。

## typecheck 脚本处理

`package.json` 应使用统一类型检查入口：

```json
{
  "scripts": {
    "typecheck": "tsc --noEmit"
  }
}
```

处理规则：

- 没有 `typecheck`：新增。
- 已有且完全等于 `tsc --noEmit`：保留。
- 已有但不一致：改为 `tsc --noEmit`，并在汇报中写明原命令和新命令。

## nest-cli.json 处理

NestJS latest 模板要求构建前清理旧输出目录，避免历史 dist 文件残留影响 Docker 镜像和本地构建结果。

目标配置：

```json
{
  "compilerOptions": {
    "deleteOutDir": true
  }
}
```

处理规则：

- `deleteOutDir` 已是 `true`：保留。
- `deleteOutDir` 为 `false` 或缺失：改为 `true`。
- 处理 `deleteOutDir` 时不顺手重排 `nest-cli.json`，也不改 assets / sourceRoot；SWC builder 只按下一节规则处理。

## NestJS SWC 配置处理

NestJS 项目使用 SWC builder 时，`.swcrc` 需要保留 NestJS 装饰器和元数据配置。模板见同目录 `swcrc.md`。

处理规则：

- `nest-cli.json` 已使用 SWC builder：保留 builder，并确保 `options.swcrcPath` 为 `".swcrc"`。
- 用户明确要求启用 NestJS SWC builder：设置 `compilerOptions.builder.type: "swc"`，并写入 `options.swcrcPath: ".swcrc"`。
- `.swcrc` 使用 `parser.syntax: "typescript"`、`parser.decorators: true`、`transform.legacyDecorator: true`、`transform.decoratorMetadata: true`。
- `.swcrc` 的 `module.ignoreDynamic` 设置为 `true`，保留动态 `import()`；不要再显式配置 `jsc.parser.dynamicImport`。
- `.swcrc` 使用 `jsc.externalHelpers: true` 时，确认 `@swc/helpers` 在运行时可用。服务端项目通常放在 `dependencies`。
- `module.type: "nodenext"` 适合 ESM / NodeNext 项目；迁移到非 NodeNext 项目时先读取 `tsconfig` 和 `package.json.type`，不要借 SWC 配置整理顺手做 ESM 迁移。

## Vitest 项目的 tsconfig-paths 清理

在这个迁移约定中，`tsconfig-paths` 视为 Jest/ts-node 测试链路的 tsconfig 路径插件。项目已经迁移到 Vitest 时，应移除该直接依赖。

判断流程：

```text
项目是否使用 Vitest？
        │
        ├─ 否：不处理 tsconfig-paths，避免扩大到测试框架迁移
        │
        └─ 是
            │
            ▼
           package.json 是否直接依赖 tsconfig-paths？
            │
            ├─ 否：无需移除
            │
            └─ 是
                │
                ▼
               是否只被 Jest/ts-node 测试配置引用？
                │
                ├─ 是：删除引用并移除依赖
                └─ 否：移除直接依赖前先说明仍有非测试链路引用，需要同步处理
```

描述要求：如果发现 `tsconfig-paths/register` 仍被非测试命令直接使用，不要静默删除后留下坏脚本；应把这视为项目事实和默认迁移边界的冲突，先说明需要同步调整对应脚本或扩大范围。

## Dockerfile 模板处理

当用户明确要求 NestJS latest reference 同步 Dockerfile 模板时，使用同目录 `dockerfile.md` 的 `x86-debian.Dockerfile` 模板。这个模板来自当前项目的 `x86-debian.Dockerfile`，用于 Node.js 26 / pnpm / NestJS 服务端项目。

处理规则：

- 默认文件名是 `x86-debian.Dockerfile`。
- 不添加模板没有要求的 `ENV PRISMA_SKIP_POSTINSTALL_GENERATE=true`。
- 不添加伪造的 `ARG DATABASE_URL=mysql://prisma:prisma@localhost:3306/prisma`；不要为了让 Prisma generate 通过而编造数据库连接串。
- 保留多阶段结构：`base` → `install` → `format` / `lint` / `test` / `coverage-report` / `build` → `production`。
- `test` 阶段运行 `pnpm test:cov`；不要再新增单独的 `test-cov` 阶段。
- `coverage-report` 从 `test` 阶段复制 `/app/coverage/`。
- `production` 阶段的 `ENV NODE_ENV=production`、`ENV LANG=C.utf8`、`ENV LC_ALL=C.utf8` 放在一起。
- `production` 阶段可以保留 `procps`，用于线上排查进程和资源状态；不要默认安装音视频处理工具，除非项目真实存在相关需求。
- 保留 `RUN npm pkg delete scripts.prepare`，避免容器安装依赖时触发本地 prepare 钩子。
- 构建入口、镜像 tag、registry 推送和 `docker-build.sh` 细节仍属于 `references/docker-build/index.md`；不要把部署流程混进 NestJS latest 升级，除非用户同时要求。

## 验收标准

迁移完成后至少确认：

- 已有 `@nestjs/*` 直接依赖已升级到 latest，依赖分区未被无故改变。
- `package.json` 不再直接依赖 `source-map-support` 和 `@types/source-map-support`。
- 源码不再注册 `source-map-support`。
- `package.json` 中直接使用 `node` 运行 `dist` 编译产物的脚本都包含 `--enable-source-maps`，默认 `scripts.start` 和 `scripts.start:prod` 为 `node --enable-source-maps dist/src/main.js`。
- 如果存在 `pm2.config.cjs` 且通过 PM2 启动编译产物，应用配置包含 `node_args: "--enable-source-maps"`。
- `scripts.typecheck` 为 `tsc --noEmit`。
- `nest-cli.json` 的 `compilerOptions.deleteOutDir` 为 `true`。
- NestJS 项目使用 SWC builder 时，根目录 `.swcrc` 已按 `swcrc.md` 同步，`nest-cli.json` 通过 `swcrcPath: ".swcrc"` 指向它，并且 `module.ignoreDynamic` 为 `true`。
- 如果项目是 Vitest，`package.json` 不再直接依赖 `tsconfig-paths`，也没有 Jest/ts-node 测试链路残留引用。
- 锁文件已随包管理器命令更新。
- 如果用户要求同步 Dockerfile，`x86-debian.Dockerfile` 已按模板更新：不含 `PRISMA_SKIP_POSTINSTALL_GENERATE` 和伪造的 `DATABASE_URL`，`test` 阶段运行 `pnpm test:cov`，`coverage-report` 从 `test` 阶段复制覆盖率产物，生产环境 ENV 连续放置。
- 已运行 `typecheck`、`build` 和必要测试，或明确说明跳过原因 / 失败原因。
- 未混入 lint、format、ESM、Docker 或业务逻辑重构等非本阶段改动。

## 模板文件

`package.json` 脚本模板见同目录 `package.md`，`tsconfig.json` 模板见 `tsconfig.md`，`nest-cli.json` 模板见 `nest-cli.md`，`.swcrc` 模板见 `swcrc.md`，`pm2.config.cjs` 模板见 `pm2.md`，依赖命令见 `dependencies.md`，source-map-support 清理示例见 `source-map-support.md`，tsconfig-paths 搜索模式见 `tsconfig-paths.md`，复杂判断表达模板见 `flow.md`，`x86-debian.Dockerfile` 模板见 `dockerfile.md`，验证命令见 `commands.md`，汇报模板见 `report.md`。
