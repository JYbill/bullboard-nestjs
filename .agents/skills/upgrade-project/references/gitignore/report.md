已更新 `.gitignore` 模板。

变更：
- 新增或整理 `.gitignore`，覆盖 IDE 配置、依赖目录、缓存、日志、覆盖率、上传目录、临时目录、环境文件和 AI/agent 本地目录。
- 保留需要入库的占位文件例外规则：`public/*/.gitkeep`、`tmp/.gitkeep`、`logs/.gitkeep`（按项目实际情况调整）。
- 按项目实际包管理器处理锁文件忽略规则。

验证：
- 已检查 `git status --short`，确认没有把应提交文件误忽略。
- 已确认 `.github/`、文档或配置样例等需要入库的仓库资产未被模板误忽略。

注意：
- Docker 构建上下文排除规则不在 `.gitignore` 中处理，应读取 `references/docker-build/index.md` 的 `.dockerignore` 模板。
