# Docker 构建与部署参考

## 适用场景

当用户要求整理、迁移或统一后台项目的 Docker 构建、镜像发布、部署脚本或容器构建流程时，使用这份参考。

常见触发信号：

- 项目存在 `docker-build.sh`、`*.Dockerfile`、`.dockerignore`、`pm2.config.cjs` / `pm2.config.js`。
- 用户提到 Docker 构建、镜像发布、部署脚本、`deploy:docker`、`.dockerignore`、`docker build`、`docker push`、`images.tar`。
- 用户要求把 Dockerfile 或部署流程沉淀成项目标准。

## 第一原则：只改本次任务要求的 Docker 构建阶段

`docker-build.sh` 通常同时包含三类逻辑：

1. 参数解析、Git 信息、镜像名和 tag 生成；
2. Docker 构建与校验阶段；
3. push / save / registry 登录 / 发布输出。

如果本次任务只是按 build-docker 模板整理 `fmt` / `lint` / `test` / `build` 阶段，只允许修改第 2 类逻辑。不要因为“顺手整理脚本”去碰第 1 类和第 3 类逻辑。

### 绝对禁止的误改

除非用户在本轮明确要求，否则不要修改 `docker-build.sh` 中这些内容：

- `push_to_aliyun` 默认值和 `getopts` 参数解析；
- 错误文案、拼写、缩进、shell 风格、反引号写法；
- `branch_name`、`version_id`、`tag_id`、`clean_branch_name`、`docker_tag` 生成逻辑；
- `service_name` 的值；
- `image_id` 的取值方式；
- `docker login`、`docker tag`、`docker push` 代码；
- registry 地址、账号、密码来源、环境变量校验；
- `docker save` 的文件名和输出文案，例如不要把项目原有的 `image.tar` 改成 `images.tar`；
- 脚本权限，例如不要因为编辑脚本就 `chmod +x`；
- `set -euo pipefail`、统一加引号、shellcheck 风格改写等脚本风格化改造。

如果 diff 里出现 `if [ "$push_to_aliyun" = "true" ]` 以下 push / save 区域的改动，默认就是错误，必须先撤回。

## build-docker 阶段执行契约

模板要求的阶段关系是串行和并行混合，不是简单串行执行四个 target。

```text
install
  ├─ format -> lint
  └─ test
production
```

含义：

1. 先构建 `install` target，验证依赖安装和复用构建缓存。
2. 然后并行执行两组校验：
   - 第一组内部串行：先构建 `format` target，再构建 `lint` target；
   - 第二组独立构建 `test` target。
3. `format` / `lint` / `test` 任一失败，都必须停止，不能继续构建 `production`。
4. 三个前置校验都通过后，才构建 `production` target。
5. 后续 image id、tag、push、save 逻辑保持项目原样。

### `docker-build.sh` 最小替换模板

当项目原来只有一行正式构建：

```bash
docker build --progress=plain -f "${platform}.Dockerfile" -t ${service_name} .
```

只把这一行替换为下面的阶段块。块前后的代码不要动。

```bash
docker build --progress=plain -f "${platform}.Dockerfile" --target install -t ${service_name}:install . || exit 1
(
  docker build --progress=plain -f "${platform}.Dockerfile" --target format -t ${service_name}:format . || exit 1
  docker build --progress=plain -f "${platform}.Dockerfile" --target lint -t ${service_name}:lint . || exit 1
) &
check_pid=$!
docker build --progress=plain -f "${platform}.Dockerfile" --target test -t ${service_name}:test . &
test_pid=$!
check_status=0
test_status=0
wait "$check_pid" || check_status=$?
wait "$test_pid" || test_status=$?
if [ "$check_status" -ne 0 ] || [ "$test_status" -ne 0 ]; then
  echo "docker check fail!"
  exit 1
fi
docker build --progress=plain -f "${platform}.Dockerfile" --target production -t ${service_name} . || exit 1
```

注意：

- 不要把 `format`、`lint`、`test` 改成全串行。
- 不要让 `lint` 和 `format` 并行；`lint` 必须在 `format` 后执行。
- 不要把 `production` 和任何校验 target 并行。
- 不要为了“更好看”引入数组、函数、`set -euo pipefail` 或重写 push 区域。
- 如果项目原来的构建命令参数不同，只在这一个构建块里沿用原参数；不要扩大到其他区域。

## Dockerfile 阶段约定

默认模板以 `x86-debian.Dockerfile` 作为 Dockerfile；如果当前项目已有其他平台文件或命名约定，以项目事实为准，不要因为文件名不是 `Dockerfile` 就另建重复配置。

`x86-debian.Dockerfile` 是多阶段构建文件，默认平台为 `linux/amd64`。

### `base`

- 基于项目真实运行需求选择基础镜像。模板中的 `node:26-slim` 只是示例；如果项目依赖 Puppeteer、Chromium、PM2 或特定系统库，必须按项目事实保留。
- 可以配置 Debian 镜像源。
- 可以安装项目构建和运行所需系统包。
- 全局安装 `pnpm`。

### `install`

- 复制 `package.json`、`.npmrc`、`pnpm-lock.yaml`、`pnpm-workspace.yaml` 等依赖清单。
- 执行 `pnpm install --frozen-lockfile`。
- 最后复制完整源码。
- 如项目使用 Prisma，可按项目事实复制 `prisma.config.ts`、`prisma` 等生成所需文件并执行 `pnpm prisma:generate`；不要为了让生成通过而编造 `ARG DATABASE_URL=mysql://prisma:prisma@localhost:3306/prisma`，也不要添加模板没有要求的 `ENV PRISMA_SKIP_POSTINSTALL_GENERATE=true`。
- 默认不要复制 `env`，除非已确认 `.dockerignore` 中允许且不含敏感信息。

这个顺序用于复用依赖安装缓存。调整 Dockerfile 时不要随意把 `COPY . .` 提前到依赖安装前，否则会降低缓存命中率。

### `format` / `lint` / `test`

这些阶段分别运行项目统一脚本：

```dockerfile
FROM install AS format
RUN pnpm format

FROM install AS lint
RUN pnpm lint

FROM install AS test
RUN pnpm test:cov
```

当前模板把覆盖率测试放在 `test` target 中，供 `docker-build.sh` 的测试前置阶段和 `coverage-report` 复用。

因此本地 `package.json` 中的 `format`、`lint`、`test:cov` 脚本就是 Docker 构建校验的一部分。迁移格式化器、代码检查器或测试框架时，要同步确认这些脚本仍适合容器内构建。

### `coverage-report`

如项目需要在 Docker 构建中导出覆盖率，由 `coverage-report` 从 `test` 阶段的 `/app/coverage/` 复制报告。不要再新增单独的 `test-cov` 阶段。

```dockerfile
FROM scratch AS coverage-report
COPY --from=test /app/coverage/ /
```

### `build`

只有项目真实存在构建产物时才新增 `build` target，例如 `pnpm build` 产出 `dist`。如果项目直接运行 TypeScript 源码、没有 `build` 脚本，不要为了套模板虚构 `build` target。

```dockerfile
FROM install AS build
RUN pnpm build
```

### `production`

- 只安装生产依赖：`pnpm install --prod --frozen-lockfile`。
- 复制项目真实运行所需文件，例如 `pm2.config.cjs`、`dist`、`src`、`views`。
- 如果 PM2 启动编译产物，`pm2.config.cjs` 中应包含 `node_args: "--enable-source-maps"`，保证线上日志映射到源码行号。
- 生产阶段可以保留 `procps`，用于线上排查时使用 `ps`、`top`、`free`、`pgrep`、`pkill` 等进程和资源观察命令。
- 生产阶段不要默认安装音视频处理工具；只有项目真实存在转码、抽帧或媒体探测需求时才按项目事实添加。
- 暴露项目真实端口。
- 使用 `pm2-runtime pm2.config.cjs` 或项目实际启动命令启动。

## `.dockerignore` 约定

`.dockerignore` 使用同目录 `dockerignore.md` 的模板，覆盖不同后台项目常见的本地配置、缓存、文档、测试、agent/AI 工作目录和环境目录。

注意：

- 模板默认排除 `env` / `src/env`，不要把环境目录复制进镜像。
- 如果 Dockerfile 明确需要这些目录，先确认不包含敏感信息，再移除对应忽略项并说明原因。
- `.dockerignore` 和 `.gitignore` 是两类文件，不要混成一份规则。

## `package.json` 脚本约定

如果项目保留 `package.json` 脚本，`deploy:docker` 应指向统一入口：

```json
{
  "deploy:docker": "bash ./docker-build.sh -p x86-debian"
}
```

不要在文档、CI 或脚本中分散维护多套正式 `docker build` 命令。

## 修改流程

```text
确认本次任务是否只处理 Docker 构建阶段
        │
        ▼
检查 docker-build.sh、*.Dockerfile、.dockerignore、package.json 脚本
        │
        ▼
先定位 docker-build.sh 中唯一正式 docker build 行
        │
        ▼
只替换这一行所在的构建阶段块
        │
        ▼
确认 Dockerfile 存在 install / format / lint / test / production target
        │
        ▼
运行 bash -n docker-build.sh
        │
        ▼
检查 git diff -- docker-build.sh
        │
        ├─ 只改构建阶段块：继续
        │
        └─ 改到 push/save/tag/参数解析：撤回无关改动
        │
        ▼
按项目条件运行 Docker 构建；Docker daemon 不可用时如实说明
```

## 验收标准

调整 Docker 构建或部署流程后至少确认：

- `x86-debian.Dockerfile` 仍是默认 Dockerfile，没有新增重复的 `Dockerfile`。
- `docker-build.sh -p x86-debian` 能找到 `x86-debian.Dockerfile`。
- `docker-build.sh` 的阶段顺序符合 `install -> (format -> lint) & test -> production`。
- `docker-build.sh` 没有改动 push / save / registry 登录 / tag 生成 / 参数解析等非构建阶段代码。
- `deploy:docker` 如存在，指向统一的 `docker-build.sh` 入口。
- `.dockerignore` 已按模板排除常见本地配置、缓存、文档、测试、agent/AI 工作目录、环境目录和构建无关文件。
- `install` target 使用 `pnpm install --frozen-lockfile`。
- `format`、`lint`、`test` target 仍调用项目统一脚本；当前模板的 `test` target 运行 `pnpm test:cov`，`coverage-report` 从 `test` 阶段复制覆盖率产物，不再使用单独的 `test-cov` target。
- `production` target 只安装生产依赖，并通过项目实际启动命令启动。
- 没有在新增文档中复制 registry 账号密码。
- `bash -n docker-build.sh` 已通过。
- 如果 Docker daemon 不可用，明确说明未运行完整 Docker build 的原因。

## 模板文件

构建命令模板见同目录 `commands.md`，`package.json` 脚本模板见 `package.md`，`.dockerignore` 模板见 `dockerignore.md`，`pm2.config.cjs` 模板见 `pm2.md`，镜像 tag 模板见 `tag.md`，多阶段顺序模板见 `stages.md`，Dockerfile 模板见 `dockerfile.md`，汇报模板见 `report.md`。
