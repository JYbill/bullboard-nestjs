# Docker 构建与部署参考

## 适用场景

当用户要求整理、迁移或统一后台项目的 Docker 构建、镜像发布、部署脚本或容器构建流程时，使用这份参考。

常见触发信号：

- 项目存在 `docker-build.sh`、`*.Dockerfile`、`pm2.config.js`。
- 用户提到 Docker 构建、镜像发布、部署脚本、`deploy:docker`、`docker build`、`docker push`、`images.tar`。
- 用户要求把 Dockerfile 或部署流程沉淀成项目标准。

## 核心约定

本项目将 `x86-debian.Dockerfile` 视为默认 Dockerfile。不要因为文件名不是 `Dockerfile` 就另建一份重复配置。

`docker-build.sh` 是统一的 Docker 构建与部署入口。具体命令模板见同目录 `template.md`。

如果项目保留 `package.json` 脚本，`deploy:docker` 应指向同一个入口，脚本模板见同目录 `template.md`。

## docker-build.sh 行为

脚本参数：

- `-p <platform>`：选择平台，默认 `x86-debian`，并使用 `${platform}.Dockerfile`。
- `-s`：不推送镜像，改为 `docker save` 到 `images.tar`。

默认行为：

1. 根据 Git 信息生成镜像 tag，tag 格式见同目录 `template.md`。
2. 服务镜像名固定为 `backend-rag`。
3. 先构建 `install` target。
4. 并行执行两组校验：
   - 第一组：先构建 `format` target，再构建 `lint` target；
   - 第二组：构建 `test` target。
5. 只要 format / lint / test 任一失败，脚本直接失败，不继续构建 production 镜像。
6. 直接构建 `production` target，并给本地镜像打 `backend-rag` 标签；`production` 阶段通过 `COPY --from=build` 自动触发 `build` 阶段。
7. 默认推送到脚本中定义的 registry；使用 `-s` 时导出 `images.tar`。

注意：`git describe --tags --abbrev=0` 依赖仓库已有 tag。没有任何 Git tag 时，脚本会在生成镜像 tag 阶段失败；不要把这种失败误判为 Docker 构建失败。

## x86-debian.Dockerfile 阶段

`x86-debian.Dockerfile` 是多阶段构建文件，默认平台为 `linux/amd64`。

### `base`

- 基于 `node:24.15.0-slim`。
- 使用 Debian bookworm 阿里云镜像源。
- 安装 `openssl`、`build-essential`、`python3`。
- 全局安装 `pnpm`。

### `install`

- 复制 `package.json`、`.npmrc`、`patches`、`pnpm-lock.yaml`、`pnpm-workspace.yaml`、`vendor`。
- 执行 `pnpm install --frozen-lockfile`。
- 复制 `prisma.config.ts`、`env`、`prisma`，执行 `pnpm prisma:generate`。
- 最后复制完整源码。

这个顺序用于复用依赖安装缓存。调整 Dockerfile 时不要随意把 `COPY . .` 提前到依赖安装前，否则会降低缓存命中率。

### `format` / `lint` / `test`

这些阶段分别运行项目统一脚本：`pnpm format`、`pnpm lint`、`pnpm test`。

因此本地 `package.json` 中的 `format`、`lint`、`test` 脚本就是 Docker 构建校验的一部分。迁移格式化器、代码检查器或测试框架时，要同步确认这些脚本仍适合容器内构建。

### `build`

运行 `pnpm build`，该阶段产出 `dist`，供 production 阶段复制。

### `production`

- 基于 `node:24.15.0-slim`。
- 安装 `openssl`、`build-essential`、`python3`、`bash`、`vim`、`curl`、`ffmpeg`。
- 设置 `NODE_ENV=production`。
- 全局安装 `pm2` 和 `pnpm`。
- 安装并配置 `pm2-logrotate`。
- 只安装生产依赖：`pnpm install --prod --frozen-lockfile`。
- 复制 `pm2.config.js` 和 `dist`。
- 暴露 `3000`。
- 使用 `pm2-runtime pm2.config.js` 启动。

## 修改原则

1. **统一入口。** 部署和正式镜像构建走 `docker-build.sh`，不要在文档或脚本中分散维护多套 `docker build` 命令。
2. **平台映射清楚。** `-p x86-debian` 对应 `x86-debian.Dockerfile`。新增平台时，新增 `<platform>.Dockerfile`，并确保脚本无需额外分支即可找到。
3. **先验证再发布。** `format`、`lint`、`test` 是 production 镜像前置校验；`production` 会自动依赖 `build` 阶段产出 `dist`，不要为了加快发布绕过这些 target。
4. **保持缓存友好。** 依赖清单先复制、安装依赖后再复制源码，避免每次源码改动都重新安装依赖。
5. **不要复制 registry 密码到文档。** `docker-build.sh` 里已有 registry 登录逻辑。迁移或泛化这套流程时，优先改为环境变量或 CI secret，不要把账号密码复制进 skill、AGENTS.md 或公开文档。
6. **本地导出用 `-s`。** 需要离线交付镜像时使用 `-s` 生成 `images.tar`，不要手写另一套 save 命令。
7. **构建失败按阶段定位。** install / format / lint / test / production（含其依赖的 build）任一阶段失败时，先看失败阶段日志，不要直接改 production 阶段掩盖前置问题。

## 推荐执行流程

```text
确认目标：发布 registry 还是本地导出 images.tar
        │
        ▼
确认平台：默认 x86-debian，对应 x86-debian.Dockerfile
        │
        ▼
检查 docker-build.sh、package.json 的 deploy:docker、format/lint/test/build 脚本
        │
        ▼
确认 Git 分支、commit 和 tag 可用于生成镜像 tag
        │
        ▼
执行 docker-build.sh
        │
        ├─ 默认：推送 registry
        │
        └─ -s：导出 images.tar
        │
        ▼
按阶段汇报构建、校验、发布或导出结果
```

## 验收标准

调整 Docker 构建或部署流程后至少确认：

- `x86-debian.Dockerfile` 仍是默认 Dockerfile，没有新增重复的 `Dockerfile`。
- `docker-build.sh -p x86-debian` 能找到 `x86-debian.Dockerfile`。
- `deploy:docker` 如存在，指向统一的 `docker-build.sh` 入口。
- `install` target 使用 `pnpm install --frozen-lockfile`。
- `format`、`lint`、`test`、`build` target 仍调用项目统一脚本。
- `production` target 只安装生产依赖，并通过 `pm2-runtime pm2.config.js` 启动。
- 默认发布流程和 `-s` 本地导出流程语义清楚。
- 没有在新增文档中复制 registry 账号密码。

## 模板文件

构建命令模板、`package.json` 脚本模板、镜像 tag 模板、多阶段顺序模板和汇报模板见同目录 `template.md`。
