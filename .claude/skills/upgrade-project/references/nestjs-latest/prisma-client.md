# Prisma 7 prisma-client 生成器配置

## 适用场景

项目满足下面条件时处理：

- 使用 Prisma 7 的 `provider = "prisma-client"` 生成器；
- 生成的 Client 输出到项目源码目录，例如 `src/library/prisma/generate`；
- NestJS 使用 SWC / TypeScript 把生成的 `.ts` Client 编译到 `dist`；
- Docker 镜像或生产运行时报 `ERR_MODULE_NOT_FOUND`，错误路径类似 `dist/.../generate/internal/class.ts`，但实际产物是 `class.js`。

## 目标配置

只调整 `schema.prisma` 的 `generator client`，保留项目真实的 `output` 和已有字段：

```prisma
generator client {
  provider               = "prisma-client"
  output                 = "../../src/library/prisma/generate"
  moduleFormat           = "esm"
  generatedFileExtension = "ts"
  importFileExtension    = "js"
}
```

含义：

- `moduleFormat = "esm"`：生成 ESM Client，匹配 NodeNext / ESM NestJS 项目。
- `generatedFileExtension = "ts"`：生成源文件仍是 TypeScript。
- `importFileExtension = "js"`：生成源码中的相对 import 指向编译后的 `.js` 文件，避免 Node ESM 在 `dist` 中查找 `.ts`。

## 处理规则

- 先确认 `schema.prisma` 中确实是 `provider = "prisma-client"`，不要把这些选项硬加到旧的 `prisma-client-js` 生成器。
- 不修改 datasource、model、migration，也不手动编辑 `src/library/prisma/generate/` 下的生成产物。
- 如果 `output` 不是模板路径，保留项目原值。
- 不通过复制 `.ts` 文件到 `dist`、改 Dockerfile、改启动参数或生成后脚本替换来掩盖这个问题。
- 修改后运行项目已有生成命令，例如 `pnpm prisma:generate`。

## 验证

优先运行：

```bash
pnpm prisma:generate
pnpm build
```

然后确认生成源文件或编译产物中 Prisma Client 内部 import 使用 `.js` 后缀：

```text
import * as $Class from "./internal/class.js"
import * as Prisma from "./internal/prismaNamespace.js"
```

如果仍出现 `.ts` 后缀，先检查是否改的是实际被 `prisma.config.ts` 使用的 schema 目录，再检查是否存在多个 generator 或多个 schema。不要直接修补生成文件。
