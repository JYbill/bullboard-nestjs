module.exports = {
  apps: [
    {
      name: 'bullboard', // 名称
      script: './dist/main.js', // nest入口文件
      cwd: './', // 工作目录
      instances: 1, // 默认 -1：cup - 1
      exec_mode: 'cluster',
      autorestart: true, // 发生异常自动重启
      watch: false, // 不启用监听
      max_restarts: 1, // 最大重启次数
      max_memory_restart: '2G', // 超出内存即重启

      // 日志相关
      error_file: 'logs/err.log',
      out_file: 'logs/out.log',
      merge_logs: true,
      log_date_format: 'YYYY-MM-DD HH:mm Z',

      // 环境变量
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};
