已整理并执行 TypeScript 项目的 CJS 到 ESM 迁移。

变更：
- `package.json` 增加或更新 `"type": "module"`。
- `tsconfig.json` 增加或更新 `"verbatimModuleSyntax": true`。
- 修复类型导入和类型导出，按需使用 `import type` / `export type`。

验证：
- 已运行 `<实际类型检查命令>`。
- 类型检查结果：<通过 / 仍有非本范围错误>。

注意：
- 未迁移测试框架、ESLint、构建工具或发布字段。
- 如使用子代理并行修复，说明分片方式和剩余问题。
