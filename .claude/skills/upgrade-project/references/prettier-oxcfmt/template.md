# Prettier 到 Oxfmt 模板

## `oxfmt.config.ts` 模板

将下面内容复制到目标项目根目录的 `oxfmt.config.ts`。不要在 skill/reference 目录中保存真实的 `oxfmt.config.*` 文件，避免 Oxfmt 的嵌套配置搜索误加载。

```ts
export default {
  // 对应 Prettier 的 singleQuote。
  // false 表示字符串优先使用双引号；如果原项目是 singleQuote: true，就改成 true。
  singleQuote: false,

  // 对应 Prettier 的 trailingComma。
  // "all" 表示多行对象、数组、参数等位置尽量保留尾逗号，迁移时应按原项目取值设置。
  trailingComma: "all",

  // 对应 Prettier 的 printWidth。
  // 显式设置项目原来的最大行宽，避免迁移后因为工具默认值不同产生额外换行 diff。
  printWidth: 120,
};
```

## 汇报模板

```markdown
已完成 Prettier 到 Oxfmt 的迁移。

变更：
- 删除 Prettier 配置，新增 `oxfmt.config.ts`。
- `format` 脚本改为 `oxfmt ...`。
- lint-staged 中的 Prettier 命令已同步改为 `oxfmt`，或确认不适用。
- 移除直接依赖 `prettier`，新增 `oxfmt`。
- 更新锁文件。

验证：
- `pnpm exec oxfmt --help` 通过。
- `pnpm format` 连续运行稳定。
- `pnpm build` 通过。

注意：计划中的 `oxc format` 在当前 npm 生态中不可用，已改用官方命令行工具 `oxfmt`。
```
