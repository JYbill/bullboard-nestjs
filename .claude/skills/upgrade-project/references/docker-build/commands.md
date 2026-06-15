正式构建并推送 registry：

```bash
bash ./docker-build.sh -p x86-debian
```

本地导出镜像，不推送 registry：

```bash
bash ./docker-build.sh -p x86-debian -s
```
