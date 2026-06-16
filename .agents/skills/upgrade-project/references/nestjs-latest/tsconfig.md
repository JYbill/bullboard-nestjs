{
  "compilerOptions": {
    "tsBuildInfoFile": ".cache/.tsbuildinfo",
    "module": "NodeNext",
    "declaration": true,
    "removeComments": false,
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
    "allowSyntheticDefaultImports": true,
    "target": "ESNext",
    "sourceMap": true,
    "outDir": "./dist",
    "noEmit": true,
    "types": ["node"],
    "incremental": true,
    "skipLibCheck": true,
    "strict": true,
    "strictNullChecks": true,
    "verbatimModuleSyntax": true,
    "paths": {
      "@/*": ["./src/*"],
      "@test/*": ["./test/*"]
    },
    "isolatedModules": true,
    "esModuleInterop": true
  },
  "include": ["src/**/*", "test/**/*", "prisma.config.ts"]
}
