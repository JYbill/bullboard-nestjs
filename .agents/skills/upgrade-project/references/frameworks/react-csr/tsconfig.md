# tsconfig.json 模板

CSR React + Vite 项目默认使用一个 `tsconfig.json`。如果目标项目拆分 app/node/test 多个配置，按项目事实裁剪，不要机械复制。

```json
{
  "compilerOptions": {
    "tsBuildInfoFile": "./.cache/tsconfig.tsbuildinfo",
    "target": "esnext",
    "lib": ["esnext", "DOM"],
    "module": "esnext",
    "types": ["vite/client", "node"],
    "skipLibCheck": true,

    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "verbatimModuleSyntax": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",

    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "erasableSyntaxOnly": true,
    "noFallthroughCasesInSwitch": true,
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": [
    "src",
    "vite.config.ts",
    "vitest.config.ts",
    "test",
    "oxlint.config.ts",
    "oxfmt.config.ts"
  ]
}
```
