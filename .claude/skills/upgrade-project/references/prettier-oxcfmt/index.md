# Prettier 到 Oxfmt 迁移参考

## 适用场景

当项目仍使用 Prettier 做格式化，并希望迁移到 Oxc 项目的格式化器时，使用这份参考。

常见触发信号：

- `package.json` 里有 `prettier --write ...`。
- 根目录存在 `.prettierrc`、`prettier.config.*` 或 `.prettierignore`。
- lint-staged 配置中调用 `prettier` 或 `prettier --write`。
- 用户提到 `prettier -> oxfmt`、`prettier -> oxcfmt`、`oxc format`、`oxfmt`、`refactor-format`。

## 名称说明

实际官方格式化器包和命令行工具叫 **`oxfmt`**，不是 `oxcfmt`。

这份引用目录使用 `prettier-oxcfmt` 是为了兼容用户常见口误和历史命名，但落地文件和命令应以真实工具为准：

- npm 包：`oxfmt`
- 命令行工具：`oxfmt`
- 常用配置文件：`oxfmt.config.ts`

## 迁移边界

默认只做格式化工具替换：

- 移除直接依赖 `prettier`。
- 新增 `oxfmt`。
- 将现有 `format` 脚本迁移到 `oxfmt`。
- 如果 lint-staged 配置中调用 Prettier，同步改为 `oxfmt`，保持原匹配范围不变。
- 将 Prettier 配置迁移到 `oxfmt.config.ts`。
- 删除 Prettier 配置文件。
- 更新锁文件。
- 运行格式化并接受纯格式化差异。

默认不要顺手做这些事：

- 不迁移 ESLint 到 Oxlint。
- 不修改 ESLint 配置。
- 不删除 `eslint-config-prettier`。它属于 ESLint 配置链路，不等于 Prettier 格式化器本体。
- 不迁移 Jest 到 Vitest。
- 不改 Jest 配置、测试文件或测试脚本。
- 不处理 ESM / `"type": "module"` 迁移。
- 不新增 `format:check`、`lint`、`test` 等额外脚本，除非用户明确要求。

## Prettier 配置映射

先读取项目真实配置，再迁移。常见 `.prettierrc` 映射如下：

| Prettier 配置 | Oxfmt 配置 | 说明 |
| --- | --- | --- |
| `singleQuote: false` | `singleQuote: false` | 使用双引号。显式保留，避免依赖默认值。 |
| `singleQuote: true` | `singleQuote: true` | 使用单引号。按项目现状迁移。 |
| `trailingComma: "all"` | `trailingComma: "all"` | 多行结构尽可能保留尾逗号。 |
| `printWidth: 120` | `printWidth: 120` | 最大行宽。应显式迁移，避免和工具默认值不一致。 |

参考模板见同目录的 `template.md`。不要在 skill/reference 目录中保存真实的 `oxfmt.config.*` 文件，避免被 Oxfmt 的嵌套配置搜索误加载。

## 推荐执行流程

以 pnpm 项目为例，其他包管理器按锁文件替换命令。复杂判断按下面的 ASCII 图走：

```text
读取项目当前格式化配置
        │
        ▼
确认 format 脚本、lint-staged 配置和格式化范围
        │
        ▼
计划是否要求 `oxc format`？
        │
        ├─ 是
        │   │
        │   ▼
        │  运行 `pnpm exec oxc format --help`
        │   │
        │   ├─ 可用：按计划继续
        │   │
        │   └─ 不可用：说明 npm 的 `oxc` 不是 Oxfmt，改用 `oxfmt` 需用户认可
        │
        └─ 否
            │
            ▼
           使用官方 `oxfmt`
        │
        ▼
移除直接依赖 `prettier`，新增 `oxfmt`
        │
        ▼
新增 `oxfmt.config.ts`，迁移原 Prettier 配置
        │
        ▼
只替换已有 `format` 脚本，不扩大格式化范围
        │
        ▼
同步 format / lint-staged 配置，删除 Prettier 配置并更新锁文件
        │
        ▼
连续运行两次格式化，确认稳定
        │
        ▼
运行构建或类型检查
```

具体步骤：

1. 检查当前脚本和配置：
   - `package.json` 的 `scripts.format`。
   - `package.json` 的 `lint-staged` 字段、`.lintstagedrc*`、`lint-staged.config.*`。
   - `devDependencies.prettier`。
   - `.prettierrc` / `prettier.config.*` / `.prettierignore`。
   - 锁文件类型。
2. 先验证计划里的命令行工具是否真实可用。
   - 如果计划要求 `oxc format`，先运行 `pnpm exec oxc format --help`。
   - 如果失败，不要继续假装可用；见“踩过的坑”。
3. 移除 Prettier 格式化器本体：
   ```bash
   pnpm remove -D prettier
   ```
4. 新增 Oxfmt：
   ```bash
   pnpm add -D oxfmt
   ```
5. 验证命令行工具：
   ```bash
   pnpm exec oxfmt --help
   ```
6. 新增 `oxfmt.config.ts`，从 Prettier 配置迁移必要项。
7. 修改 `package.json` 里已有的 `format` 脚本。
   ```json
   {
     "format": "oxfmt --disable-nested-config \"src/**/*.ts\" \"test/**/*.ts\""
   }
   ```
   保持原格式化范围，不要擅自扩大到全仓库。`--disable-nested-config` 表示只使用根配置，避免仓库里的示例目录、文档目录或 fixture 目录中的 `oxfmt.config.*` 被误加载。
8. 如果项目存在 lint-staged 配置，并且其中调用了 `prettier` 或 `prettier --write`，同步改为 Oxfmt。不要把 `format` 脚本里的全量 glob 复制到 lint-staged 命令里；lint-staged 会把暂存文件路径追加给命令。通常只保留必要命令和参数，例如 `oxfmt --disable-nested-config`，并保持原文件匹配规则和提交前检查范围不变。
9. 删除 Prettier 配置文件。
10. 运行格式化：
    ```bash
    pnpm format
    ```
11. 再运行一次格式化，确认稳定：
    ```bash
    pnpm format
    ```
12. 运行项目已有验证命令，例如：
    ```bash
    pnpm build
    ```

## 踩过的坑

### 1. npm 上的 `oxc` 不是格式化器命令行工具

曾验证过：npm 包 `oxc@1.0.1` 是打开 Xcode 的工具，不是 Oxc 格式化器。

常见失败现象：

- `pnpm exec oxc format --help` 报 `The file .../format does not exist.`
- `pnpm exec oxc --help` 进入 macOS `open` 命令语义，或尝试打开 Xcode。

处理方式：

- 不要安装 npm 包 `oxc` 来实现 `oxc format`。
- 优先使用官方格式化器包 `oxfmt`。
- 如果用户或计划强制要求脚本必须叫 `oxc format`，先把这个不匹配告诉用户。只有用户明确同意时，才考虑包装脚本方案；包装脚本会超出“只替换格式化器”的最小迁移范围。

### 2. `oxfmt.config.ts` 推荐使用 ESM 默认导出

Oxfmt 加载 `.ts` 配置时使用 Node 的原生 `import()`。因此模板统一使用 ESM 写法：

```ts
export default {
  singleQuote: false,
  trailingComma: "all",
  printWidth: 120,
};
```

处理方式：

- 不要在 `.ts` 配置模板里写 `module.exports = { ... }`。
- 如果项目已经是 ESM，`module.exports` 会在运行时报 `ReferenceError: module is not defined in ES module scope`。
- 如果 CommonJS 项目出现 `MODULE_TYPELESS_PACKAGE_JSON` 警告，优先接受这个配置文件的局部 ESM 解析；不要为了消除警告顺手迁移整个项目到 ESM。

### 3. Oxfmt 不是 Prettier 的逐字节兼容实现

迁移后可能出现一次格式化差异，常见区域包括：

- 长链式调用；
- 复杂泛型；
- 注释附近换行；
- 多行对象；
- 多行函数参数。

处理方式：

- 接受纯格式化差异。
- 不在同一次差异中混入业务逻辑改动。
- 连续运行两次格式化器，确认第二次没有新增变化。

### 4. 不要误删 `eslint-config-prettier`

`eslint-config-prettier` 名字里有 `prettier`，但它是 ESLint 配置链路的一部分。

处理方式：

- 本阶段只移除直接的 `prettier` 格式化器依赖。
- 是否移除 `eslint-config-prettier` 应留到 ESLint/Oxlint 迁移阶段单独判断。

### 5. 注意会修改文件的验证命令

有些项目的 `lint` 脚本带 `--fix`，会修改文件。

处理方式：

- 迁移格式化器后优先运行 `format` 和 `build` / `typecheck`。
- 运行会自动修复的 `lint` 前，先确认项目说明和用户意图。

## 验收标准

迁移完成后至少确认：

- `package.json` 不再直接依赖 `prettier`。
- `package.json` 的 `format` 脚本使用真实可用的格式化命令。
- 项目根目录存在 `oxfmt.config.ts`。
- 旧 Prettier 配置已删除或不再参与格式化。
- 如果 lint-staged 配置原本调用 Prettier，已同步改为 `oxfmt`；如果不存在或未调用 Prettier，汇报时说明不适用。
- 锁文件已更新。
- `pnpm format` 可执行。
- 连续运行 `pnpm format` 后没有新增格式化差异。
- 项目已有构建或类型检查通过。
- 未修改 ESLint、Jest、ESM 等非本阶段范围的配置。

## 模板文件

配置模板和汇报模板见同目录 `template.md`。