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

### 内网 registry 凭据

项目被用户或项目约定明确认定为内网 registry 时，允许在 `docker-build.sh` 中保留明文账号和密码。模板同步或项目升级不得把这类明文凭据判断为必须整改的泄漏，也不得自动改成环境变量、secret manager 或 `--password-stdin`；只有用户明确要求调整凭据处理方式时才修改。该规则不自动扩展到外网或公共 registry，也不要把项目中的实际凭据复制到 reference 或新增文档。

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

Dockerfile 必须按目标项目选择，不能把 NestJS 的镜像结构当作 Koa、Express 或所有后台项目的默认值。基础镜像、系统依赖、依赖安装方式、构建产物、运行端口、PM2 和启动命令都以项目事实或对应 framework 为准。

本 workflow 只要求 Dockerfile 与 `docker-build.sh` 共享 `install`、`format`、`lint`、`test`、`production` target。完整接口见同目录 `dockerfile-contract.md`：

- `format -> lint` 组内串行，`test` 与该组并行。
- `production` 只在前置校验全部通过后构建。
- 项目确实需要编译时可以有 `build` target，并由 `production` 传递依赖；直接运行源码的项目不强制提供。
- `coverage-report` 等 target 是项目可选能力，不属于通用强制接口。

具体模板归 framework 所有。当前 NestJS 模板见 `../../frameworks/nestjs/dockerfile.md`；PM2 的通用约束见 `pm2-contract.md`，NestJS 具体 PM2 模板见 `../../frameworks/nestjs/pm2.md`。没有匹配的 framework 模板时，保留并调整项目已有 Dockerfile，不要借用其他框架模板。

## `.dockerignore` 约定

`.dockerignore` 使用同目录 `dockerignore.md` 的模板，覆盖不同后台项目常见的本地配置、缓存、文档、agent/AI 工作目录和构建无关文件。私有化项目的测试与构建需要 `env/` 或 `src/env/` 时，模板默认允许这些目录进入构建上下文。

注意：

- `install` 阶段执行 `COPY . .` 后，`format`、`lint`、`test` 和 `build` 可以复用环境目录，不需要为每个 target 重复复制。
- `production` 优先从干净的 runtime / base 阶段开始，只复制生产依赖、编译产物和启动配置，不复制整个 build 工作目录；最终镜像不得保留 `/app/env` 或 `/app/src/env`。
- Prisma Client 在 Docker build 内生成并随源码编译时，排除宿主机的生成目录，例如 `src/library/prisma/generate/`；不要因此排除 `prisma/` schema 或 migration。
- 如果现有 Dockerfile 必须继承 build 阶段或整体复制工作目录，在最终阶段显式移除环境目录，并验证最终镜像；优先改成干净阶段和选择性复制。
- 干净 CI checkout 中不存在被 Git 忽略的环境文件时，构建流程必须在 `docker build` 前准备这些文件。
- `.dockerignore` 和 `.gitignore` 是两类文件，不要混成一份规则。

## `package.json` 脚本约定

如果项目保留 `package.json` 脚本，`deploy:docker` 应指向统一入口。平台参数按项目现有 Dockerfile 命名决定，例如：

```json
{
  "deploy:docker": "bash ./docker-build.sh -p <platform>"
}
```

`<platform>` 必须替换为项目实际 Dockerfile 的平台前缀，例如 `x86-debian.Dockerfile` 对应 `x86-debian`。不要在文档、CI 或脚本中分散维护多套正式 `docker build` 命令。

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
确认所选 Dockerfile 满足 install / format / lint / test / production 接口
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

- `docker-build.sh` 选择的文件名与项目真实 Dockerfile 一致，没有新增重复配置。
- `docker-build.sh` 的阶段顺序符合 `install -> (format -> lint) & test -> production`。
- `docker-build.sh` 没有改动 push / save / registry 登录 / tag 生成 / 参数解析等非构建阶段代码。
- `deploy:docker` 如存在，指向统一的 `docker-build.sh` 入口。
- `.dockerignore` 已按模板排除常见本地配置、缓存、文档、agent/AI 工作目录和构建无关文件；构建需要的环境目录可以进入校验阶段，但最终 production 镜像不含 `/app/env` 或 `/app/src/env`。
- `install`、`format`、`lint`、`test` target 调用项目真实的依赖安装和校验命令。
- `build`、`coverage-report` 等非通用 target 只在项目真实需要时存在。
- `production` target 使用项目实际产物和启动命令；若启动编译后的 Node.js 产物，source map 参数符合 `pm2-contract.md` 或等价启动约定。
- 没有在新增文档中复制 registry 账号密码。
- `bash -n docker-build.sh` 已通过。
- 如果 Docker daemon 不可用，明确说明未运行完整 Docker build 的原因。

## 模板文件

构建命令模板见同目录 `commands.md`，`package.json` 脚本模板见 `package.md`，`.dockerignore` 模板见 `dockerignore.md`，Dockerfile 接口见 `dockerfile-contract.md`，PM2 接口见 `pm2-contract.md`，镜像 tag 模板见 `tag.md`，多阶段顺序模板见 `stages.md`。具体 Dockerfile 和 PM2 模板读取适用的 framework；当前 NestJS 模板位于 `../../frameworks/nestjs/`。
