# pm2.config.cjs 模板

PM2 启动 Node.js 编译产物时也必须启用原生 source map，否则线上日志只能定位到 dist 行号。

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

迁移时按项目事实保留 `name`、`instances`、日志路径等字段，但 `node_args: "--enable-source-maps"` 必须同步到实际 PM2 配置。
