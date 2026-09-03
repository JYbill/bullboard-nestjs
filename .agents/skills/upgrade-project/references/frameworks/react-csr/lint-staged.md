# lint-staged.config.js 模板

ESM 项目使用 `export default`。如果目标项目没有 Husky 或 lint-staged，不要为了套模板强行新增提交前检查。

```js
export default {
  '*.{ts,tsx,js,jsx}': [
    'oxlint --fix --deny-warnings --no-error-on-unmatched-pattern --config oxlint.config.ts',
    'oxfmt --no-error-on-unmatched-pattern --config oxfmt.config.ts',
  ],
  '*.{css,html,json,jsonc,md,mdx,yml,yaml}': [
    'oxfmt --no-error-on-unmatched-pattern --config oxfmt.config.ts',
  ],
}
```
