# pm2.config.cjs 模板

Docker production 镜像通过 PM2 启动 NestJS 编译产物时，需要给 Node.js 加 `--enable-source-maps`，保证线上日志能映射到源码行号。

```js
module.exports = {
  apps: [
    {
      name: "rag",
      script: "./dist/src/main.js",
      node_args: "--enable-source-maps",
      cwd: "./",
      instances: 1,
      exec_mode: "cluster",
      autorestart: true,
      watch: false,
      max_restarts: 1,
      max_memory_restart: "2G",
      error_file: "logs/err.log",
      out_file: "logs/out.log",
      merge_logs: true,
      log_date_format: "YYYY-MM-DD HH:mm Z",
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
```

迁移 Dockerfile 或 PM2 配置时，按项目事实保留服务名、实例数和日志路径，但不要漏掉 `node_args: "--enable-source-maps"`。
