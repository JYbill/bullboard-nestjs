# nest-cli.json 模板

NestJS latest 项目要求构建前清理旧输出目录。项目使用 SWC builder 时，`nest-cli.json` 还应通过 `swcrcPath: ".swcrc"` 指向根目录 `.swcrc`：

```json
{
  "$schema": "https://json.schemastore.org/nest-cli",
  "collection": "@nestjs/schematics",
  "sourceRoot": "src",
  "compilerOptions": {
    "deleteOutDir": true,
    "assets": ["assets/*", "setting/*"],
    "watchAssets": true,
    "typeCheck": true,
    "builder": {
      "type": "swc",
      "options": {
        "swcrcPath": ".swcrc"
      }
    }
  }
}
```

迁移时强制 `compilerOptions.deleteOutDir: true`。如果项目已使用或用户要求启用 SWC builder，同步 `compilerOptions.builder.type: "swc"` 和 `options.swcrcPath: ".swcrc"`；其他字段按项目事实保留，不为了套模板重排或重写。
