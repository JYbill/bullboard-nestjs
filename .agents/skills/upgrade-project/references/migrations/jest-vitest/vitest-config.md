```ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
  // 显式启用 Vite 8 的 OXC transform；target 必须按 package.json 的 engines.node 选择。
  // 示例："node": ">=24.14.0" -> target: "node24"。
  // 如果项目没有声明 engines.node，使用当前 Vite/OXC 支持的最高 nodeXX target，并通过 Vitest 验证。
  oxc: {
    target: 'node24',
  },
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    environment: 'node',
    globals: false,
    include: [],
    projects: [
      {
        extends: true,
        test: {
          name: 'test',
          include: ['src/**/*.spec.ts', 'src/**/*.integration-spec.ts'],
        },
      },
      {
        extends: true,
        test: {
          name: 'e2e',
          include: ['src/**/*.spec.ts', 'src/**/*.integration-spec.ts', 'test/**/*.e2e-spec.ts'],
          fileParallelism: false,
        },
      },
    ],
    coverage: {
      provider: 'v8',
      reportsDirectory: 'coverage',
      include: ['src/**/*.ts'],
      exclude: [
        'src/**/*.d.ts',
        'src/**/*.spec.ts',
        'src/**/*.integration-spec.ts',
        'src/library/prisma/generate/**',
      ],
    },
  },
})
```

说明：

- `oxc` 是根级 Vite 配置，不是 `test` 配置；不要写成 `test.oxc`。
- 不要写 `oxc: false`，这会关闭 OXC transform。
- 不要使用 `nodenext` 作为 `oxc.target`；`nodenext` 是 TypeScript module / moduleResolution 语义，不是 OXC target。
- Node 后端项目优先使用 `nodeXX`，不要为了“最高语法”改成 `esnext`。例如 Node 24 项目用 `node24`，它已经表示只降级 Node 24 不支持的语法。
- Jest 到 Vitest 迁移默认不引入 SWC 作为 TS 编译底座。只有项目确实依赖 OXC 当前不支持的装饰器降级或装饰器元数据时，才按项目事实增加 Babel / SWC workaround，并在报告中说明原因。
