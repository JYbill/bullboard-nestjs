```text
install
  ├─ format → lint（由 docker-build.sh 顺序触发）
  └─ test（与 format → lint 并行）
全部通过
  └─ production
       └─ build（具体项目需要编译时，由 production 传递依赖）

可选：test → coverage-report（具体项目需要导出覆盖率时独立提供）
```
