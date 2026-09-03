# NestJS Standard Schema 与 Zod

Standard Schema 是 NestJS 12 提供的新能力，不是升级到 v12 的强制条件。只有用户明确授权迁移校验体系后才执行下面的变更；用户选择保留现状时继续使用 `ValidationPipe` 和 class DTO，并在最终报告中记录原因。

## 请求校验

用户确认迁移后，用全局 `StandardSchemaValidationPipe` 替代 `ValidationPipe`。所有需要校验的 `@Body()`、`@Query()`、`@Param()` 和 `@RawBody()` 参数必须显式传入 `{ schema }`；没有 schema metadata 的参数不会被自动校验。

- Schema 放在业务模块的 `*.schema.ts`，类型用 `z.infer<typeof schema>` 推导。
- 类型转换显式使用 `z.coerce.*` 或 `z.preprocess()`。
- `z.object()` 默认剔除未知字段；必须拒绝未知字段时使用 `z.strictObject()`。
- 测试至少覆盖 body、query、param 的合法输入与转换、未知字段剔除、strict object 的 400 和项目统一错误结构。

## 环境变量

环境变量使用 Zod Schema，并通过 `ConfigModule.forRoot({ validationSchema })` 在启动时验证。必填变量缺失必须失败；默认值、枚举和数字转换由 Schema 明确表达。导出 `z.infer` 类型供 `ConfigService` 使用，不再重复维护全局环境变量 interface。

## 响应

只有接口响应确实需要运行时裁剪或校验时，才使用 `StandardSchemaSerializerInterceptor` 和 `@SerializeOptions({ schema })`。普通内部对象不为形式统一强制添加响应 Schema。

## 清理条件

先确认源码和测试无旧 DTO、decorator、`plainToInstance()`、`validateSync()` 或 mapped types 引用，再移除旧依赖。NestJS 依赖注入仍使用装饰器元数据，不得连带删除 TypeScript / SWC 的 decorator 配置。
