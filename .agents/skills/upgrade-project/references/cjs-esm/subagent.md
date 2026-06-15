修复这些文件中的 TypeScript verbatimModuleSyntax / import type 错误：
- src/modules/user/user.service.ts
- src/modules/user/user.controller.ts

要求：
1. 只处理这些文件。
2. 只修复类型导入、类型导出和值导入误判问题。
3. 不使用 any、unknown、as any、as unknown as ...。
4. 不做业务逻辑重构。
5. 判断不清楚时优先用 LSP 查看引用和定义。
