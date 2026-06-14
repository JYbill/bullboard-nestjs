# TypeScript CJS 到 ESM 迁移模板

## `package.json` 模板

如果没有 `type` 字段，新增：

```json
{
  "type": "module"
}
```

如果已有 `"type": "commonjs"`，改成：

```json
{
  "type": "module"
}
```

## `tsconfig.json` 模板

在 `compilerOptions` 中设置：

```json
{
  "compilerOptions": {
    "verbatimModuleSyntax": true
  }
}
```

## 类型导入模板

只作为类型使用时：

```ts
import type { UserDto } from "./user.dto";
```

默认导入只作为类型使用时：

```ts
import type UserConfig from "./user-config";
```

命名空间类型导入：

```ts
import type * as PrismaTypes from "./generated";
```

同一个模块同时导入类型和值时，可使用内联 `type`：

```ts
import { createUser, type UserDto } from "./user";
```

如果周围代码习惯拆分导入，也可以拆成两条：

```ts
import { createUser } from "./user";
import type { UserDto } from "./user";
```

## 类型导出模板

只导出类型时：

```ts
export type { UserDto } from "./user.dto";
```

同时导出类型和值时：

```ts
export { createUser, type UserDto } from "./user";
```

## 类型检查命令模板

在 pnpm 项目里，优先使用项目自己的类型检查脚本：

```bash
pnpm typecheck
```

没有 `typecheck` 脚本时再尝试：

```bash
pnpm exec tsgo --noEmit
```

如果没有 `tsgo`，使用：

```bash
pnpm exec tsc --noEmit
```

## 子代理任务模板

```text
修复这些文件中的 TypeScript verbatimModuleSyntax / import type 错误：
- src/modules/user/user.service.ts
- src/modules/user/user.controller.ts

要求：
1. 只处理这些文件。
2. 只修复类型导入、类型导出和值导入误判问题。
3. 不使用 any、unknown、as any、as unknown as ...。
4. 不做业务逻辑重构。
5. 判断不清楚时优先用 LSP 查看引用和定义。
```

## 汇报模板

```markdown
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
```
