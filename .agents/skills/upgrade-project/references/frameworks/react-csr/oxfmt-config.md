# oxfmt.config.ts 模板

```ts
import { defineConfig } from 'oxfmt'

export default defineConfig({
  semi: false,
  singleQuote: true,
  printWidth: 100,
  trailingComma: 'all',
  arrowParens: 'always',
  sortTailwindcss: true,
  ignorePatterns: ['dist/**', 'coverage/**', 'node_modules/**', 'pnpm-lock.yaml'],
})
```
