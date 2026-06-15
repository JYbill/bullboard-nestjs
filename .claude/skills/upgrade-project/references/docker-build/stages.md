install
  ├─ format → lint（由 docker-build.sh 顺序触发）
  ├─ test（运行 pnpm test:cov）→ coverage-report（从 test 阶段导出 coverage 产物）
  └─ build
production
