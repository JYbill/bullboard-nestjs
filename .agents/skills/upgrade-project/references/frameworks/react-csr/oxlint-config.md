# oxlint.config.ts 模板

不要复制来源项目的业务全局变量白名单。React 版本按目标项目 `package.json` 的实际版本同步。

```ts
import { defineConfig } from 'oxlint'

export default defineConfig({
  env: {
    browser: true,
    es2023: true,
    node: true,
  },
  plugins: ['react', 'typescript', 'oxc', 'import'],
  ignorePatterns: ['dist/**', 'coverage/**'],
  options: {
    typeAware: true,
    reportUnusedDisableDirectives: 'warn',
  },
  settings: {
    react: {
      version: '19.2.7',
    },
  },
  categories: {
    correctness: 'error',
    suspicious: 'error',
    perf: 'warn',
  },
  rules: {
    'import/no-unassigned-import': 'off',
    'react/react-in-jsx-scope': 'off',
    'react/rules-of-hooks': 'error',
    'react/only-export-components': ['warn', { allowConstantExport: true }],
    'typescript/consistent-type-imports': [
      'error',
      {
        prefer: 'type-imports',
        fixStyle: 'inline-type-imports',
      },
    ],
    'typescript/no-unused-vars': [
      'error',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
      },
    ],
  },
})
```
