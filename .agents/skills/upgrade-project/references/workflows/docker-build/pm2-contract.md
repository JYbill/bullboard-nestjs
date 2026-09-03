# PM2 启动契约

PM2 配置不是 Docker workflow 的统一模板。服务名、`script`、工作目录、实例数、执行模式、内存限制和日志格式都由具体框架与项目决定。

跨项目只共享一条运行约束：PM2 启动编译后的 Node.js 产物时，应包含下面的参数，让线上错误栈映射回源码：

```js
{
  node_args: '--enable-source-maps',
}
```

如果项目直接运行源码、使用其他运行时或已有等价 Node 参数，先按实际启动链路判断，不机械添加。NestJS 编译产物的当前具体模板见 `../../frameworks/nestjs/pm2.md`。
