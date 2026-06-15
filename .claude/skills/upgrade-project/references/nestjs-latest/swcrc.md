# NestJS `.swcrc` 模板

用于 NestJS 项目的 SWC builder。这里只保留 NestJS 构建需要的 SWC 配置；Vitest / 通用 TypeScript 项目的 SWC 配置放在 `../jest-vitest/swcrc.md`。

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

- `parser.decorators`、`transform.legacyDecorator`、`transform.decoratorMetadata` 是 NestJS 依赖注入和装饰器元数据需要的配置。
- `module.type: "nodenext"` 适合当前 ESM / NodeNext 风格的 NestJS 项目；迁移到 CommonJS 项目前先读取 `package.json.type` 和 `tsconfig`，不要顺手做模块系统迁移。
- `module.ignoreDynamic: true` 用于保留动态 `import()`，避免模块转换阶段把它改写掉。
- 不再显式配置 `jsc.parser.dynamicImport`；当前 SWC 已能解析标准动态导入语法。
- `externalHelpers: true` 需要确认 `@swc/helpers` 在运行时可用。服务端项目通常放在 `dependencies`。
