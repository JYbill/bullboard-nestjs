# tsconfig.json 模板

这个模板面向 Node.js 26 原生运行 TypeScript、TypeScript 7 只做类型检查的 ESM 项目。`noEmit` 与 `allowImportingTsExtensions` 配套，因此源码中的相对导入可以显式写 `.ts` 扩展名。

`customConditions`、路径别名和宽松检查项属于具体项目配置，不放进通用模板；迁移时按目标项目事实保留。

```json
{
  "compilerOptions": {
    "rootDir": ".",
    "incremental": true,
    "tsBuildInfoFile": ".cache/.tsbuildinfo",
    "strict": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "target": "ESNext",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "allowImportingTsExtensions": true,
    "noEmit": true,
    "types": ["node"],
    "erasableSyntaxOnly": true,
    "verbatimModuleSyntax": true
  },
  "include": ["./src/**/*.ts", "./test/**/*.ts"],
  "exclude": ["node_modules"]
}
```
