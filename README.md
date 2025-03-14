# bullboard-nestjs
- 功能：bullmq dashboard(仅适配了bullmq)

## 构建
1. 将x86-debian.Dockerfile中的`http://192.168.88.115:8081/repository/npm-proxy/`替换成npm镜像源
```ts
// 比如淘宝镜像源: https://registry.npmmirror.com
```
2. 运行构建
```shell
pnpm deploy:docker
```
