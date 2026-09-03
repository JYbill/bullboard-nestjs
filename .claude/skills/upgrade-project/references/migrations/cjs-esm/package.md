# package.json 模板

下面的 Node.js 与 TypeScript 版本和当前项目保持一致。迁移其他项目时，先核对目标项目的运行时版本；不要只更新 `@types/node` 而保留不匹配的 `engines.node`。

```json
{
  "type": "module",
  "scripts": {
    "typecheck": "tsc --noEmit",
    "typecheck:watch": "tsc --noEmit --watch"
  },
  "devDependencies": {
    "@types/node": "^26.1.2",
    "typescript": "^7.0.2"
  },
  "engines": {
    "node": ">=26.0.0"
  }
}
```
