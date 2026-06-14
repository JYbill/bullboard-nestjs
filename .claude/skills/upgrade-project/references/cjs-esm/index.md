# TypeScript 项目 CJS 到 ESM 迁移参考

## 适用场景

当用户要求把 TypeScript 项目从 CommonJS/CJS 迁移到 ESM，或明确提到以下内容时，使用这份参考：

- `"type": "module"`
- `verbatimModuleSyntax`
- `import type`
- CJS 转 ESM
- CommonJS 转 ESM
- 模块系统迁移
- 迁移后出现类型导入相关的 TypeScript 错误

这份参考只考虑 TypeScript 项目。纯 JavaScript 项目、Babel 项目、打包器专用迁移、测试框架 ESM 迁移、发布包 `exports` 设计，不属于默认范围。

## 迁移目标

默认目标很明确：

1. 在 `package.json` 中将 `type` 设置为 `module`。
2. 在 TypeScript 配置的 `compilerOptions` 中将 `verbatimModuleSyntax` 设置为 `true`。
3. 让所有只作为类型使用的导入都使用 `import type` 或内联 `type` 标记。
4. 迁移后运行一次类型检查。
5. 如果类型检查暴露大量 `import type` 相关错误，按文件或目录分片，安排尽可能多的子代理并行修复。

配置片段、类型导入示例、子代理任务和汇报模板见同目录 `template.md`。

## 默认迁移边界

默认只做 TypeScript ESM 基础迁移和类型导入修复。

默认要做：

- 修改 `package.json` 的 `type` 为 `module`。
- 修改 TypeScript 配置，加入或更新 `compilerOptions.verbatimModuleSyntax` 为 `true`。
- 修复类型导入：`import type`、`export type`、`import { type Foo }`。
- 运行类型检查并根据错误继续修复。

默认不要顺手做：

- 不迁移 Jest、Vitest 或其他测试框架配置。
- 不迁移 ESLint 或代码格式化器配置。
- 不主动重写构建工具、Docker、CI、PM2 配置。
- 不主动设计 npm 包的 `exports`、`main`、`types` 发布字段，除非用户明确要求。
- 不为了通过类型检查使用 `any`、`unknown`、`as any` 或 `as unknown as ...` 掩盖问题。
- 不把运行时值导入误改成 `import type`。

## 总体流程

复杂迁移按下面的 ASCII 图推进：

```text
确认是 TypeScript 项目
        │
        ▼
读取 package.json 和 tsconfig.json
        │
        ▼
写入 package.json: "type": "module"
        │
        ▼
写入 tsconfig.json: compilerOptions.verbatimModuleSyntax = true
        │
        ▼
运行类型检查
        │
        ├─ 通过
        │   │
        │   ▼
        │  汇报完成
        │
        └─ 失败
            │
            ▼
           是否主要是 import type / verbatimModuleSyntax 错误？
            │
            ├─ 否：记录错误，判断是否超出本次迁移范围
            │
            └─ 是
                │
                ▼
               按文件或目录分片
                │
                ▼
               并行启动尽可能多的子代理修复
                │
                ▼
               汇总改动后再次运行类型检查
                │
                ▼
               循环直到通过，或剩余错误不属于本次范围
```

## 配置修改

### package.json

如果没有 `type` 字段，新增 `"type": "module"`。如果已有 `"type": "commonjs"`，改成 `"type": "module"`。具体片段见同目录 `template.md`。

不要因为本步骤顺手改脚本、依赖或发布字段。除非用户明确要求，本迁移只关心模块类型声明。

### tsconfig.json

在 `compilerOptions` 中设置 `verbatimModuleSyntax: true`。具体片段见同目录 `template.md`。

如果项目使用 `extends` 继承多个 TypeScript 配置，先确认当前项目实际执行类型检查时使用哪一个配置文件。优先修改项目自己的主 `tsconfig.json`；如果仓库约定使用 `tsconfig.build.json` 或类似文件做类型检查，则按实际命令涉及的配置处理，并在汇报里说明。

## 类型导入修复规则

开启 `verbatimModuleSyntax` 后，TypeScript 会更严格地区分“运行时值导入”和“类型导入”。修复时要根据真实用法判断，不要机械替换。

### 只作为类型使用

只作为类型使用的普通导入、默认导入、命名空间导入都应改成类型导入。具体写法见同目录 `template.md`。

### 同一个模块同时导入类型和值

可以使用内联 `type`，避免拆成两条导入。如果周围代码已经习惯拆分导入，也可以拆成两条，优先保持项目既有风格。具体写法见同目录 `template.md`。

### 类型导出

只导出类型时使用 `export type`；同时导出类型和值时使用内联 `type`。具体写法见同目录 `template.md`。

### 不要误改运行时值

以下场景通常需要保留普通 `import`，因为它们在运行时要存在：

- 类被 `new`、`extends`、`instanceof` 使用；
- 枚举、常量、函数、对象在运行时代码中被读取；
- 装饰器、依赖注入、元数据反射需要运行时类引用；
- 模块只为了副作用而导入。

判断不清楚时，先用 LSP 查看引用和类型信息，再决定是否改成 `import type`。

## 类型检查命令选择

迁移完成后必须运行一次类型检查。按下面顺序选择命令：

```text
package.json 是否有 scripts.typecheck？
        │
        ├─ 有
        │   │
        │   ▼
        │  使用项目包管理器运行 typecheck
        │
        └─ 没有
            │
            ▼
           当前项目能否执行 tsgo？
            │
            ├─ 能：使用 tsgo --noEmit
            │
            └─ 不能：使用 tsc --noEmit
```

具体命令模板见同目录 `template.md`。

## import type 错误的并行修复策略

当类型检查出现大量类型导入错误时，不要串行手修所有文件。应尽可能并行处理。

常见错误信号包括：

- `is a type and must be imported using a type-only import when 'verbatimModuleSyntax' is enabled`
- `must be imported using a type-only import`
- `cannot be used as a value because it was imported using 'import type'`
- `Re-exporting a type when 'verbatimModuleSyntax' is enabled requires using 'export type'`

并行修复按下面的 ASCII 图执行：

```text
读取类型检查输出
        │
        ▼
筛选 import type / export type 相关错误
        │
        ▼
按文件路径或目录分组
        │
        ▼
每组生成一个清晰任务
        │
        ▼
一次性启动多个子代理并行修复
        │
        ▼
每个子代理只改自己负责的文件
        │
        ▼
主线程汇总结果
        │
        ▼
再次运行类型检查
        │
        ├─ 仍有同类错误：重新分组并继续并行修复
        └─ 只有非本范围错误：停止并汇报
```

子代理任务模板见同目录 `template.md`。

分片建议：

- 错误少于 5 个文件：每个文件一个子代理，或直接在主线程处理。
- 错误较多：按目录分组，例如 `src/modules/chat/`、`src/modules/vector/`。
- 文件之间强相关：同一个模块目录交给同一个子代理，避免互相改同一批导入。
- 当前环境有并发上限时，在上限内一次性发起尽可能多的子代理；不要后台运行看不见结果的子代理。

## 验收标准

迁移完成后至少确认：

- `package.json` 存在 `"type": "module"`。
- 相关 TypeScript 配置存在 `"verbatimModuleSyntax": true`。
- 只作为类型使用的导入已经改为 `import type` 或内联 `type`。
- 类型导出已经按需改为 `export type`。
- 运行时值导入没有被误改成 `import type`。
- 已运行项目自己的 `typecheck`；如果没有，则已运行 `tsgo --noEmit` 或 `tsc --noEmit`。
- 类型检查通过，或剩余错误明确不属于本次 CJS 到 ESM 迁移范围。
- 未混入测试框架、代码检查器、构建系统、发布字段等非本阶段改动。

## 模板文件

配置片段、类型导入示例、类型检查命令、子代理任务和汇报模板见同目录 `template.md`。
