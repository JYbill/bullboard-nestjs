# Docker 构建与部署模板

## 统一构建入口模板

正式构建并推送 registry：

```bash
bash ./docker-build.sh -p x86-debian
```

本地导出镜像，不推送 registry：

```bash
bash ./docker-build.sh -p x86-debian -s
```

## `package.json` 脚本模板

如果项目保留 `package.json` 脚本，`deploy:docker` 应指向统一入口：

```json
{
  "deploy:docker": "bash ./docker-build.sh -p x86-debian"
}
```

## 镜像 tag 模板

`docker-build.sh` 根据 Git 信息生成镜像 tag：

```text
<platform>_<branch_name>_<commit_id>_<latest_git_tag>
```

其中分支名里的 `/` 会替换成 `_`。

## 多阶段构建顺序模板

```text
install
  ├─ format → lint
  └─ test
production
  └─ 自动依赖 build
```

`format`、`lint`、`test` 任一失败时，不继续构建 `production`。构建 `--target production` 时，Docker 会因为 `COPY --from=build` 自动构建 `build` 阶段，不需要单独执行 `--target build`。

## 汇报模板

```markdown
已更新 Docker 构建与部署约定。

变更：
- 明确 `x86-debian.Dockerfile` 是默认 Dockerfile。
- 明确 `docker-build.sh -p x86-debian` 是统一构建与部署入口。
- 记录 Docker 多阶段构建顺序：install → (format → lint) 与 test 并行 → production 自动依赖 build。
- 记录默认推送 registry 和 `-s` 导出 `images.tar` 的区别。

验证：
- 已检查 `docker-build.sh` 与 `x86-debian.Dockerfile` 的 target 对应关系。
- `<实际执行的 docker 构建命令>`：<结果>。

注意：
- 未在文档中复制 registry 账号密码。
- 如未实际执行 Docker 构建，说明原因。
```
