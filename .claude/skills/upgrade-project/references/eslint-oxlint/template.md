# Oxlint 配置模板

将下面内容复制到目标项目根目录的 `oxlint.config.ts`。不要在 skill/reference 目录中保存真实的 `oxlint.config.ts` 文件，避免 Oxlint 的嵌套配置搜索误加载。

```ts
import { defineConfig } from "oxlint";

export default defineConfig({
  env: {
    node: true,
    jest: true,
  },
  plugins: ["typescript"],
  categories: {
    correctness: "error",
  },
  ignorePatterns: ["**/*.d.ts"],
  options: {
    typeAware: true,
  },
  rules: {
    "no-unused-vars": [
      "error",
      {
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_",
        caughtErrorsIgnorePattern: "^_",
        destructuredArrayIgnorePattern: "^_",
        fix: {
          imports: "safe-fix",
          variables: "safe-fix",
        },
      },
    ],
  },
});
```

## 配置说明

### `defineConfig`

用于获得 Oxlint 配置的类型提示和字段校验。`oxlint.config.ts` 当前仍属于 Oxlint 的 experimental 配置加载能力，因此后续应通过项目本地依赖执行，例如 `pnpm exec oxlint ...` 或 `pnpm lint`。

### `env.node`

开启 Node.js 全局变量和运行环境识别，适用于 NestJS、CLI、服务端脚本等 Node 项目。

### `env.jest`

开启 Jest 测试环境全局变量。ESLint 到 Oxlint 迁移阶段不要顺手迁移 Jest 到 Vitest；只有测试框架迁移完成后，再单独调整这里。

### `plugins: ["typescript"]`

显式启用 TypeScript 插件规则。设置 `plugins` 会覆盖 Oxlint 默认插件集合，所以这里刻意保留 TypeScript 插件，确保 TypeScript correctness 规则能参与检查。

不要在模板里批量关闭 `typescript/no-explicit-any`、`typescript/no-floating-promises`、`typescript/no-unsafe-*`、`typescript/ban-ts-comment` 等规则。迁移后的默认目标是开启严格检查；只有遇到明确误报、阶段外旧债，或用户要求保留旧宽松策略时，才针对具体规则做显式例外。

### `categories.correctness: "error"`

开启 correctness 类规则，并作为 error 处理。它覆盖明显错误或无效代码，也会启用 Oxlint 当前版本归入 correctness 的 TypeScript 规则，例如 type-aware 场景下的 `typescript/no-floating-promises`。

这里不打开 `all`、`style`、`perf`、`pedantic` 等更大范围规则，因为这些通常会把迁移扩大成风格整顿；但 correctness 应保持严格，不再为了迁移方便降成 warn 或 off。

### `ignorePatterns: ["**/*.d.ts"]`

忽略声明文件。声明文件通常是生成物、外部类型补丁或兼容声明，不应在 ESLint 到 Oxlint 迁移时成为主要修复对象。

### `options.typeAware: true`

启用需要类型信息的规则能力。使用这个选项时必须安装 `oxlint-tsgolint`，否则 type-aware 规则能力不完整。

这项是严格检查的关键配置；不要为了减少迁移诊断把它关掉。

### `rules`

模板只显式配置项目需要覆盖默认行为的规则。严格检查应主要依赖 `plugins`、`categories.correctness` 和 `options.typeAware`，不要把大量规则写成 `off` 来复刻旧 ESLint 的宽松状态。

### `no-unused-vars`

这组配置用于严格发现未使用变量和未使用导入，并保留下划线前缀作为“有意不用”的约定。

- 规则级别 `"error"`：发现未使用变量或导入时让 lint 失败。
- `argsIgnorePattern: "^_"`：忽略以下划线开头的函数参数，例如 `(_event) => {}`、`([_, data]) => data`。
- `varsIgnorePattern: "^_"`：忽略以下划线开头的普通变量，例如 `const _unused = ...`。
- `caughtErrorsIgnorePattern: "^_"`：忽略以下划线开头的 catch 变量，例如 `catch (_error) {}`。
- `destructuredArrayIgnorePattern: "^_"`：忽略数组解构里的下划线变量，例如 `const [_, value] = list`。
- `fix.imports: "safe-fix"`：未使用导入可被普通 `--fix` 自动删除。
- `fix.variables: "safe-fix"`：表达项目希望自动清理未使用变量的意图；但普通变量删除可能改变副作用行为，Oxlint 不一定会用普通 `--fix` 删除所有未使用变量。若确实需要自动删除普通变量，先评估风险，再考虑 `--fix-dangerously`。

## 严格迁移原则

这个模板不再是“尽量贴近旧 ESLint 宽松配置”的模板，而是当前项目采用的严格检查模板：

1. 保留 `typeAware: true`。
2. correctness 规则按 error 执行。
3. 未使用变量和未使用导入按 error 执行。
4. 下划线前缀表示明确有意不用。
5. 只显式配置项目确实需要覆盖默认行为的规则。
6. 不批量关闭 `no-explicit-any`、`no-floating-promises`、`no-unsafe-*` 或 `ban-ts-comment` 规则。

如果迁移时出现大量历史旧债，优先把它们作为迁移产生的真实诊断逐项处理；确实超出本次范围时，只对具体规则、具体目录或具体代码点做说明和例外，不要把模板整体降级成宽松配置。

## 汇报模板

```markdown
已完成 ESLint 到 Oxlint 的迁移。

变更：
- 新增 `oxlint.config.ts`，启用 type-aware。
- `lint` 脚本改为 `oxlint ... --fix`，检查范围按当前项目真实目录设置。
- 移除 ESLint 配置和 ESLint 相关直接依赖。
- 新增 `oxlint`、`oxlint-tsgolint`，更新锁文件。
- lint-staged 已同步，或确认不适用。

验证：
- `pnpm exec oxlint --help` 通过。
- `pnpm lint` 通过。
- `pnpm build` 通过。

注意：
- 如果原计划中的 glob 在 Oxlint 下不能匹配文件，已改为目录参数。
- 未迁移测试框架、格式化器、ESM 或运行时配置。
- 保留未处理的既有无关工作区改动。
```
