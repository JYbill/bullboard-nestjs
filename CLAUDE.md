## 面向编码 Agent 的仓库说明

这个仓库是一个基于 NestJS 11 的小型服务，用来暴露 `bullmq` 的 Bull Board 面板。
项目不大，但不少行为直接写在模块配置里，所以修改时要偏保守，优先小改、精改。

### 1. 技术栈与目录

- 运行时：Node.js 22（`README.md` 提到本地开发环境为 v22）
- 包管理器：`pnpm@9.15.2`
- 框架：NestJS 11
- 语言：TypeScript
- 构建：Nest CLI + SWC（`nest-cli.json`、`.swcrc`）
- 测试：Jest + `ts-jest`
- 源码：`src/`
- E2E：`test/`
- 类型：`types/`
- 环境文件：`env/`

关键文件：

- `src/main.ts`：Nest 启动入口
- `src/app.module.ts`：根模块与 Bull Board 接线
- `src/config/config.validate.ts`：环境变量校验
- `src/middleware/base-auth.middleware.ts`：基础认证中间件
- `src/app.d.ts`：全局环境类型
- `test/app.e2e-spec.ts`：当前唯一已提交的 E2E 测试

### 2. 常用命令

统一使用 `pnpm`，不要默认改成 `npm` 或 `yarn`。

```bash
pnpm install

# run
pnpm dev
pnpm start
pnpm start:debug
pnpm start:prod

# build / format / lint
pnpm build
pnpm format
pnpm lint

# test
pnpm test
pnpm test:watch
pnpm test:cov
pnpm test:debug
pnpm test:e2e
```

补充：

- `pnpm format` 实际执行 `prettier --write "src/**/*.ts" "test/**/*.ts"`
- `pnpm lint` 带 `--fix`，会直接改文件，执行后要重新检查 diff
- 改了 TypeScript 源码，至少跑一次 `pnpm build`
- 不要声称“命令应该能过”；只有真的跑过才能写进结论

### 3. 单个测试怎么跑

当前仓库的 Jest 配置分两套：

- 单元测试配置写在 `package.json`，`rootDir` 是 `src`，只匹配 `*.spec.ts`
- E2E 配置写在 `test/jest-e2e.json`，匹配 `*.e2e-spec.ts`

```bash
# 单个 E2E 文件
pnpm exec jest --config ./test/jest-e2e.json --runTestsByPath ./test/app.e2e-spec.ts

# 单个 E2E 用例
pnpm exec jest --config ./test/jest-e2e.json --runTestsByPath ./test/app.e2e-spec.ts -t "/ \(GET\)"

# 单个单元测试文件（未来 src 下新增 *.spec.ts 后使用）
pnpm exec jest --runTestsByPath ./src/path/to/file.spec.ts

# 列出当前可发现的测试
pnpm exec jest --listTests
pnpm exec jest --config ./test/jest-e2e.json --listTests
```

当前测试现状要特别注意：

- 仓库里目前没有已提交的 `src/**/*.spec.ts`
- 当前唯一的 `test/app.e2e-spec.ts` 很像 Nest 初始模板测试
- 它断言 `GET /` 返回 `Hello World!`，但真实应用代码已经接入 Bull Board 和 BasicAuth
- 所以这个 E2E 测试很可能已经过时；不要因为它存在，就假设它准确反映当前行为

### 4. 代码风格与约定

格式化：

- 缩进 2 空格（`.editorconfig`）
- 使用 LF 换行
- 文件末尾保留换行
- 使用双引号（`.prettierrc`）
- 保留 Prettier 默认加上的尾逗号
- 目标行宽 120（`printWidth: 120`）

导入规范：

- 先外部依赖，再内部模块
- 同一路径的 `import` / `import type` 尽量合并成一条
- 类型导入优先使用 `import type`
- 可用别名：`@/* -> src/*`、`@type/* -> types/*`
- 现有代码里别名导入和相对路径导入混用；修改时优先跟随附近文件

TypeScript 与命名：

- 保持 NestJS 装饰器风格，不要无故改成另一套架构
- `strictNullChecks` 已开启，代码要保持空值安全
- 仓库配置里 `noImplicitAny` 是关闭的，但不要因此新增 `any`
- 禁止使用 `as any`、`@ts-ignore`、`@ts-expect-error`
- 类名使用 PascalCase；变量、函数、方法使用 camelCase；文件名使用 kebab-case
- 保持 NestJS 后缀约定：`*.module.ts`、`*.middleware.ts`、`*.validate.ts`、`*.spec.ts`、`*.e2e-spec.ts`
- 新增环境变量时，要同时更新校验逻辑和类型声明；涉及全局环境类型时同步 `src/app.d.ts`

### 5. 仓库里的实现习惯

- 环境变量加载集中在 `ConfigModule.forRoot(...)`
- 环境校验集中在 `src/config/config.validate.ts`
- 读取配置优先使用 `ConfigService`，不要在业务代码里到处读 `process.env`
- `AppModule` 里直接完成 Bull Board 适配器和路由接线，改这里要格外谨慎
- 非显而易见的逻辑，仓库里会配简短行内注释，新增代码时请保持这个习惯

### 6. 错误处理与附加规则

- 不要写空的 `catch` 块
- 发现非法状态时要抛出明确错误，不要静默吞掉
- 尽量走框架友好的错误流，不要新增随手 `console.log`
- 修 bug 时优先做外科手术式修复，不要混入无关清理
- 所有导出函数、所有 class 的 `static` 方法，上方都要补 `/** ... */` JSDoc
- 非显而易见的业务逻辑，要加简短行内注释
- 禁止新增业务魔法数字；优先提成语义化常量或枚举
- 不要用 `any`、`unknown`、`as any`、`as unknown as ...` 掩盖类型问题
- 避免过度封装：只有 4 行左右、且没有复用价值的小函数，通常不要强行抽出去
- 如果后续代码体量变大，写操作放 `*-modify.ts`，读操作放 `*-query.ts`

### 7. 仓库现状里的坑

- `package.json` 的 `name` / `description` 目前看起来和这个 Bull Board 服务不完全一致；描述项目时优先相信源码结构与运行逻辑
- 仓库根目录里存在 `dist/` 和 `node_modules/`；修改时只动源码，不要编辑生成产物
- `.lintstagedrc` 当前直接执行 `eslint --ext ts,cts,mts --concurrency auto` 和 `prettier --write`；不要再按旧的 `npm run ...` 假设处理

### 8. Cursor / Copilot 规则文件

在编写本说明时，仓库内没有发现以下文件：

- `.cursorrules`
- `.cursor/rules/`
- `.github/copilot-instructions.md`

不要假设这些规则存在；如果以后新增了，先重新读取，再决定是否覆盖本文件。

### 9. 建议的工作方式

1. 先读目标文件和相邻文件，再动手。
2. 优先匹配现有 NestJS 结构和命名方式。
3. 尽量做最小可行修改。
4. 修改后跑贴近改动的验证命令。
5. 如果命令会自动改文件，记得重新看 diff。
