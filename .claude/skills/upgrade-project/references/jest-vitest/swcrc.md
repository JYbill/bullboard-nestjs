# 通用 Vitest SWC `.swcrc` 模板

供 `vitest.config.ts` 中 `unplugin-swc` 的 `configFile: "./.swcrc"` 使用。当前模板与 `../nestjs-latest/swcrc.md` 保持一致，方便 NestJS 项目测试和构建共用同一份 SWC 配置；迁移到非 NestJS 项目时，先按项目事实删减装饰器元数据配置。

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

- `module.ignoreDynamic: true` 用于保留动态 `import()`，避免模块转换阶段改写。
- 不再显式配置 `jsc.parser.dynamicImport`；当前 SWC 已能解析标准动态导入语法。
- 非 NestJS 项目如果不使用装饰器或装饰器元数据，可以移除 `parser.decorators` 和 `transform` 中的装饰器配置。
- `externalHelpers: true` 需要按项目运行方式确认 `@swc/helpers` 的依赖分区。
