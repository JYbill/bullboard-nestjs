# Prisma 7 ESM TypeScript Client 目标配置

## 适用场景

NestJS 项目满足下面条件时处理：

- 使用 Prisma 7，并希望 NestJS 的 SWC / TypeScript 把生成的 Client 随项目源码编译到 `dist`；
- 项目是 ESM / NodeNext；
- 仍使用 `prisma-client-js` 并把 Client 生成到 `node_modules/.prisma/client`；
- 源码从 `.prisma/client` 私有路径导入，生产运行时报 `ERR_INVALID_MODULE_SPECIFIER`；
- 已使用 `prisma-client`，但生成源码的内部 import 仍指向 `.ts`，生产运行时报 `ERR_MODULE_NOT_FOUND`；
- `@prisma/adapter-mariadb` 直接接收不匹配的 URL 协议，运行时出现连接字符串解析错误。

## 目标配置

将旧的 `prisma-client-js` 私有生成目录迁移为源码目录内的 `prisma-client` TypeScript 产物。`output` 相对于当前 `schema.prisma` 所在目录解析；标准路径 `prisma/schema.prisma` 使用一个 `..`：

```prisma
generator client {
  provider               = "prisma-client"
  output                 = "../src/library/prisma/generate"
  moduleFormat           = "esm"
  generatedFileExtension = "ts"
  importFileExtension    = "js"
}
```

如果 schema 位于 `prisma/rag/schema.prisma`，对应路径才是 `../../src/library/prisma/generate`。不要复制固定的 `../` 层数；生成后确认实际输出目录。

含义：

- `moduleFormat = "esm"`：生成 ESM Client，匹配 NodeNext / ESM NestJS 项目。
- `generatedFileExtension = "ts"`：生成源文件仍是 TypeScript。
- `importFileExtension = "js"`：生成源码中的相对 import 指向编译后的 `.js` 文件，避免 Node ESM 在 `dist` 中查找 `.ts`。

## 应用导入

源码从生成目录的公开文件做相对导入，并保留 Node ESM 运行时 `.js` 后缀：

```ts
import { PrismaClient, Prisma } from './generate/client.js'
import type { Prisma as PrismaTypes } from './generate/client.js'
```

不要从 `.prisma/client`、`node_modules/.prisma/client` 等私有目录导入。生成目录改变后必须同步所有运行时导入和类型导入。

## Prisma CLI 与 adapter

私有化项目允许环境目录进入构建阶段时，在执行 `prisma generate` 前复制 `env/`，并由项目脚本显式加载对应环境文件。`prisma.config.ts` 使用 `env()` 严格检查变量，避免真正需要数据库的命令拿到空 URL：

```ts
import { defineConfig, env } from 'prisma/config'

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    url: env('DATABASE_URL'),
  },
})
```

```dockerfile
COPY prisma.config.ts .
COPY prisma prisma
COPY env env
RUN pnpm prisma:generate
```

如果项目明确不允许环境目录进入构建上下文，才把 `DATABASE_URL` 改为可选值或使用其他注入方式；不要把宽松配置作为默认模板。

运行时 adapter 按当前安装版本的构造参数类型配置。`@prisma/adapter-mariadb` 使用对象配置时，复用项目已经校验的数据库字段，不把 `mysql:` URL 直接当成 `mariadb:` URL 传入：

```ts
const adapter = new PrismaMariaDb({
  host,
  port,
  user,
  password,
  database,
})
const clientOptions = { ...prismaOptions, adapter } satisfies Prisma.PrismaClientOptionsWithAdapter
const client = new PrismaClient<typeof clientOptions>(clientOptions)
```

其他 adapter 先核对其真实构造参数，不把 MariaDB 的配置方式机械套用过去。

## 处理规则

- 旧项目使用 `prisma-client-js` 时，要把 provider、output 和源码导入作为一次完整迁移；不能只把新选项硬加到旧 provider。
- 不修改 datasource、model、migration，也不手动编辑 `src/library/prisma/generate/` 下的生成产物。
- 已经使用合法源码输出目录时保留项目原值，只补齐 ESM 和扩展名配置。
- 生成目录必须参与 TypeScript / SWC 编译，但应加入 `.gitignore`、`.dockerignore`、Oxlint、Oxfmt 和 Vitest coverage 排除项，避免提交、重复复制或统计自动生成代码。
- 不忽略 `prisma/migrations`，也不忽略当前包管理器的锁文件。
- Docker 构建在编译前运行 `prisma generate`；production 只复制 `dist` 和生产依赖，不再复制 `node_modules/.prisma`。
- 不通过复制 `.ts` 文件到 `dist`、改启动参数或生成后脚本替换来掩盖生成器配置问题。

## 验证

优先运行：

```bash
pnpm prisma:generate
pnpm typecheck
pnpm build
```

然后确认生成源文件或编译产物中 Prisma Client 内部 import 使用 `.js` 后缀：

```text
import * as $Class from "./internal/class.js"
import * as Prisma from "./internal/prismaNamespace.js"
```

再直接导入编译产物，确认 Node ESM 可以解析 Prisma 模块：

```bash
node --input-type=module -e 'import("./dist/library/prisma/prisma.js")'
```

存在生产镜像时，继续完成 `docker build`、`docker run` 和 HTTP smoke；只构建成功不能证明生产依赖和运行时导入正确。如果仍出现 `.ts` 后缀或私有 `.prisma/client` 导入，先检查实际 schema 路径、多个 generator、源码导入和旧产物，不直接修补生成文件。
