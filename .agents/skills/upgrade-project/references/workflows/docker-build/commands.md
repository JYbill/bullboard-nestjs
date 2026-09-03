先把 `<platform>` 替换为项目实际 Dockerfile 的平台前缀。正式构建并按项目现有逻辑发布：

```bash
bash ./docker-build.sh -p <platform>
```

本地导出镜像，不推送 registry：

```bash
bash ./docker-build.sh -p <platform> -s
```
