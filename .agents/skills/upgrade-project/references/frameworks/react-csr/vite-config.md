# vite.config.ts 模板

这是普通 CSR React 应用配置。不要复制来源项目的 `build.lib`、业务入口、库名、文件名前缀、业务版本常量或全局业务变量。

```ts
import { fileURLToPath, URL } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
```
