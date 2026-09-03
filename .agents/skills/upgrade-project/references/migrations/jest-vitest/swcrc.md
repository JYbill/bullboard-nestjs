# Vitest SWC fallback `.swcrc` 模板

Jest 到 Vitest 迁移默认不使用 SWC 作为 TS 编译底座。Vitest 4.1 + Vite 8 的默认策略是根级显式启用 OXC，并按 `package.json.engines.node` 设置 `oxc.target`。

只有项目确实依赖 OXC 当前不支持的装饰器降级、装饰器元数据，或已有不可替代的 SWC/Vite 转换链路时，才参考本文件。使用本文件时必须在迁移报告中说明为什么偏离 OXC 默认策略。

```json
{
  "$schema": "https://swc.rs/schema.json",
  "jsc": {
    "target": "esnext",
    "baseUrl": ".",
    "externalHelpers": true,
    "parser": {
      "syntax": "typescript",
      "decorators": true
    },
    "transform": {
      "decoratorMetadata": true,
      "legacyDecorator": true
    },
    "keepClassNames": true
  },
  "module": {
    "type": "nodenext",
    "ignoreDynamic": true
  },
  "sourceMaps": true,
  "minify": false,
  "exclude": [".*\\.d\\.[cm]?ts$"]
}
```

说明：

- 这不是默认 Vitest 配置的一部分，只是 SWC fallback。
- `module.type: "nodenext"` 是 SWC 模块转换语义，不是 OXC target；不要把它迁移成 `oxc.target: "nodenext"`。
- `module.ignoreDynamic: true` 用于保留动态 `import()`，避免模块转换阶段改写。
- 非 NestJS 项目如果不使用装饰器或装饰器元数据，通常不需要这份配置。
- `externalHelpers: true` 需要按项目运行方式确认 `@swc/helpers` 的依赖分区。
