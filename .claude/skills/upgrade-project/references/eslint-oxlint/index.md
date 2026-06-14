# ESLint 到 Oxlint 迁移参考

## 适用场景

当项目仍使用 ESLint 做代码检查，并希望迁移到 Oxlint 时，使用这份参考。

常见触发信号：

- `package.json` 里有 `eslint ...`、`eslint --fix`、`eslint --cache`。
- 根目录存在 `eslint.config.*`、`.eslintrc*` 或 `.eslintignore`。
- 依赖中存在 `eslint`、`@eslint/js`、`@eslint/eslintrc`、`typescript-eslint`、`eslint-config-prettier`、`globals` 等 ESLint 专用依赖。
- lint-staged 配置中直接调用 `eslint`，或间接调用项目的 `lint` 脚本。
- 用户提到 `eslint -> oxlint`、`ESLint 到 Oxlint`、`oxlint.config.ts`、`refactor-lint`。

## 迁移边界

默认只做代码检查工具替换：

- 新增 `oxlint` 和 `oxlint-tsgolint`。
- 新增 `oxlint.config.ts`。
- 将现有 `lint` 脚本迁移到 Oxlint，并保留安全的 `--fix`。
- 删除 ESLint 配置文件。
- 删除 ESLint 相关直接依赖。
- 更新锁文件。
- 同步 lint-staged 中仍指向 ESLint 的配置。
- 运行 `pnpm lint` 和项目已有构建或类型检查命令。

默认不要顺手做这些事：

- 不迁移 Prettier / Oxfmt。
- 不迁移 Jest / Vitest。
- 不修改测试文件、测试脚本或测试框架依赖。
- 不处理 ESM / 运行时模块系统。
- 不重写 Docker、PM2、CI 或运行时启动配置。
- 不在同一次迁移中开启 `all`、`style`、`perf`、`pedantic` 等更大范围规则。

## 配置模板位置

配置模板见同目录的 `template.md`。模板中包含 `oxlint.config.ts` 的完整内容，并逐项解释 `env`、`plugins`、`categories`、`ignorePatterns`、`typeAware`、严格检查原则和 `no-unused-vars` 修复策略。

不要在 reference 目录中保存真实的 `oxlint.config.ts` 文件，避免 Oxlint 的嵌套配置搜索误加载。

## 推荐执行流程

以 pnpm 项目为例，其他包管理器按锁文件替换命令。

```text
读取当前 lint 脚本、ESLint 配置、依赖和 lint-staged
        │
        ▼
确认迁移范围：只替换 lint，不迁移格式化器、测试框架或 ESM
        │
        ▼
安装 Oxlint 和 type-aware 依赖
        │
        ▼
运行 `pnpm exec oxlint --help`，确认 CLI 参数
        │
        ▼
新增 `oxlint.config.ts`，启用 typeAware
        │
        ▼
替换现有 `lint` 脚本，按项目真实目录设置检查范围
        │
        ▼
删除 ESLint 配置和 ESLint 直接依赖，更新锁文件
        │
        ▼
搜索 ESLint 残留引用和禁用注释，必要时改成 Oxlint 语法
        │
        ▼
运行 `pnpm lint`，逐项处理新增诊断
        │
        ▼
运行 `pnpm build` / `pnpm typecheck`
```

具体步骤：

1. 检查当前项目状态：
   - `package.json` 的 `scripts.lint`。
   - `package.json` 的 `lint-staged` 字段、`.lintstagedrc*`、`lint-staged.config.*`。
   - `devDependencies` 中的 ESLint 相关依赖。
   - `eslint.config.*`、`.eslintrc*`、`.eslintignore`。
   - 已跟踪的 ESLint 缓存文件，例如 `.cache/.eslintcache`。
   - 当前工作区是否已有未提交改动。
2. 安装 Oxlint：
   ```bash
   pnpm add -D oxlint oxlint-tsgolint
   ```
3. 验证 CLI 能力：
   ```bash
   pnpm exec oxlint --help
   ```
   重点确认：
   - `--fix` 存在，应作为默认修复参数。
   - 当前版本没有稳定的 ESLint `--cache` / `--cache-location` 等价参数时，不迁移缓存参数。
   - `--threads=INT` 可控制线程数，但第一版优先使用 Oxlint 默认并行策略。
4. 新增 `oxlint.config.ts`。参考 `template.md`，并根据项目原 ESLint 规则调整。
5. 修改 `package.json` 中已有的 `lint` 脚本。
   - 不要照搬不存在的目录。比如当前项目只有 `src` 和 `test`，就写：
     ```json
     {
       "lint": "oxlint --config oxlint.config.ts src test --fix"
     }
     ```
   - 如果原脚本是 `"{src,apps,libs,test}/**/*.ts"`，但 `apps` / `libs` 不存在，迁移时按当前项目真实目录收敛。
   - 如果带引号的 brace glob 在当前 Oxlint 下报 `No files found to lint`，优先改成目录参数，而不是继续复刻 ESLint glob。
6. 删除 ESLint 配置文件：
   ```bash
   rm eslint.config.mjs
   ```
   其他 `.eslintrc*` 或 `.eslintignore` 也要先确认确实只属于 ESLint 链路，再删除。
7. 删除 ESLint 相关直接依赖：
   ```bash
   pnpm remove -D eslint @eslint/js @eslint/eslintrc typescript-eslint globals eslint-config-prettier
   ```
   如果项目还有其他只供 ESLint 使用的直接依赖，也应一并删除。不要删除 Jest、Oxfmt、Prettier 或测试框架依赖，除非本次计划明确要求。
8. 同步 lint-staged：
   - 如果 lint-staged 直接调用 `eslint`，改成 `oxlint --config oxlint.config.ts --fix` 或项目约定命令。
   - 如果 lint-staged 调用 `pnpm lint`，确认迁移后仍符合预期。
   - 不要把全量检查范围盲目复制进 lint-staged 命令；lint-staged 会追加暂存文件路径。
9. 搜索 ESLint 残留：
   ```bash
   rg -n "eslint|ESLint|\.eslint|typescript-eslint|@eslint|eslint-config-prettier|globals" .
   ```
   锁文件中的传递依赖名字不一定要消失，例如 `@types/eslint`、`eslint-scope` 可能来自构建或测试工具。
10. 将仍有效的 ESLint 禁用注释改成 Oxlint 语法，例如：
    ```ts
    // eslint-disable-next-line no-control-regex
    ```
    改成：
    ```ts
    // oxlint-disable-next-line no-control-regex
    ```
11. 运行 lint：
    ```bash
    pnpm lint
    ```
    如果 Oxlint 暴露真实问题，优先做小范围修复；如果明显是阶段外规则，显式在配置中关闭对应规则，不要用大范围开关掩盖。
12. 运行项目已有验证命令：
    ```bash
    pnpm build
    ```
    或项目自己的 `typecheck` / 冒烟测试。

## 修复参数选择

默认脚本使用 `--fix`，不要默认使用 `--fix-suggestions` 或 `--fix-dangerously`。

- `--fix`：应用普通修复和 safe-fix，适合默认脚本。
- `--fix-suggestions`：应用 suggestion 类型修复，不等于 safe-fix；不要把它当成 `--fix` 的增强版。
- `--fix-dangerously`：可能改变行为，只在用户明确接受风险时使用。

`no-unused-vars` 的 `fix.imports: "safe-fix"` 可以让未使用导入被普通 `--fix` 自动移除。普通未使用变量可能涉及副作用删除，不能假设都会被普通 `--fix` 安全删除。

## 常见 Oxlint 诊断处理

### `typescript/no-misused-spread`

当代码展开 class 实例时，Oxlint 会提示展开会丢失原型。例如：

```ts
const query = {
  ...dtoInstance,
  vector,
};
```

应改为显式构造普通对象：

```ts
const query = {
  curriculumId: dtoInstance.curriculumId,
  courseId: dtoInstance.courseId,
  vector,
};
```

这样比关闭规则更好，因为它表达了真实数据结构，也避免 class 实例原型被悄悄丢弃。

### `no-control-regex`

如果控制字符正则是有意为之，使用 Oxlint 注释局部关闭：

```ts
// oxlint-disable-next-line no-control-regex
.replace(/[\u0001-\u0008\u000b-\u000c\u000e-\u001f]/g, "")
```

不要保留 `eslint-disable` 注释；迁移后它不再表达当前工具链。

### `no-unused-vars`

如果模板启用了未使用变量检查：

- 未使用导入通常可以由 `--fix` 自动删除。
- 明确保留但暂时不用的变量、参数、catch 变量，用 `_` 前缀表达意图。
- `([_, data]) => data` 这类数组解构参数应被 `argsIgnorePattern` / `destructuredArrayIgnorePattern` 覆盖。
- 不要为了通过 lint 改成 `any`、`unknown` 或类型断言绕过问题。

## 验收标准

迁移完成后至少确认：

- `package.json` 的 `lint` 脚本使用 `oxlint`，并保留 `--fix`。
- 项目根目录存在 `oxlint.config.ts`，并启用 `options.typeAware: true`。
- `devDependencies` 中包含 `oxlint` 和 `oxlint-tsgolint`。
- `devDependencies` 中不再包含 ESLint 相关直接依赖。
- ESLint 配置文件已删除。
- lint-staged 中不再直接调用 ESLint；如果不适用，汇报时说明。
- 非锁文件中没有遗留 ESLint 专用配置或禁用注释。
- `pnpm lint` 通过，或只剩明确接受的 warning。
- `pnpm build` / `pnpm typecheck` 通过。
- 未混入 Jest / Vitest、Oxfmt / Prettier、ESM、Docker、PM2 等非本阶段改动。

## 模板文件

配置模板和汇报模板见同目录 `template.md`。