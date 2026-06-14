# Jest 到 Vitest 迁移参考

## 适用场景

当项目仍使用 Jest 做测试，并希望迁移到 Vitest 时，使用这份参考。

常见触发信号：

- `package.json` 里有 `jest`、`jest --runInBand`、`jest --coverage`、`test:e2e` 指向 Jest 配置。
- 根目录或 `test/` 目录存在 `jest.config.*`、`test/jest-e2e.json`，或 `package.json` 中存在 `jest` 配置字段。
- 依赖中存在 `jest`、`@types/jest`、`ts-jest`、`babel-jest`、`jest-environment-node` 等 Jest 专用依赖。
- 测试代码使用 `jest.fn`、`jest.spyOn`、`jest.mock`、`jest.clearAllMocks`、`jest.setTimeout` 或 Jest 全局类型。
- 用户提到 `jest -> vitest`、`Jest 到 Vitest`、`vitest.config.ts`、`--project test`、`--project e2e`、测试框架迁移、`*.spec.ts`、`*.integration-spec.ts`、`*.e2e-spec.ts` 或测试分层要求。

## 迁移边界

默认只做测试框架替换：

- 新增 Vitest 及项目需要的转换、覆盖率依赖。
- 新增或更新 `vitest.config.ts`。
- 将现有测试脚本迁移到 Vitest，并优先使用 Vitest project 区分普通测试和 e2e。
- 删除 Jest 配置文件、`package.json` 的 `jest` 配置字段和 Jest 相关直接依赖。
- 将测试代码里的 Jest API 改为 Vitest API。
- 同步 lint-staged、husky、CI 或文档中直接调用 Jest 的命令。
- 按项目测试分层要求保留单元测试、集成测试、e2e 测试的语义和位置。

默认不要顺手做这些事：

- 不迁移 ESLint / Oxlint。
- 不迁移 Prettier / Oxfmt。
- 不处理 CJS / ESM 迁移，除非 Vitest 配置运行所必需且用户同意扩大范围。
- 不改业务逻辑来适配测试；优先修测试框架 API、测试启动配置和测试隔离问题。
- 不把集成测试或 e2e 测试改成 mock 版单元测试。
- 不给 `*.spec.ts` 增加真实数据库、Redis、网络或外部服务访问。
- 不新增没有清理策略的 e2e 数据写入。
- 不把 `test/debug/*.debug.ts` 纳入常规自动化测试。

## 测试分层要求

迁移时要按项目 `AGENTS.md` 的“测试要求”保留测试语义，不要只按文件名机械搬运。

### `*.spec.ts`

- 单元测试。
- 只测试纯代码逻辑、DTO、工具函数、service 分支。
- 不访问真实数据库，不访问外部服务。
- 可以使用 Vitest mock 隔离依赖，但不要用 `any`、`unknown` 或类型断言绕过类型问题。

### `*.integration-spec.ts`

- 集成测试。
- 允许依赖环境变量访问真实外部服务。
- 默认只读，避免污染共享环境。
- 适合测试数据库、Redis、网络请求等。
- 禁止对外部依赖进行 mock，必须使用真实数据。
- 新增模块、文件时，对应的 `*.integration-spec.ts` 放在源码同级目录。

### `*.e2e-spec.ts`

- 端到端测试。
- 通过 HTTP 接口测试完整链路。
- 使用专门的测试数据库或测试 schema。
- 每轮测试前准备 seed 数据，测试后清理或重建。
- 可以测试 CRUD，但重点是关键业务流程，而不是所有 CRUD 细节。
- e2e 测试文件专门放在 `test/` 目录内。

如果当前项目还没有可复用的 e2e seed 基础设施，不要为了迁移 Vitest 临时扩大 e2e 覆盖面。新增模块、文件默认补同级 `*.spec.ts` 和 `*.integration-spec.ts`，等测试数据库和 seed 机制明确后再补充 e2e。

## 推荐文件布局和 Vitest projects

Vitest 配置要覆盖项目约定的三类自动化测试，并把普通测试和 e2e 分成不同 project：

```text
src/modules/example/example.service.ts
src/modules/example/example.service.spec.ts
src/modules/example/example.service.integration-spec.ts
test/app.e2e-spec.ts
test/debug/*.debug.ts        # 手动调试脚本，不纳入常规自动化测试
```

推荐 project 划分：

- `test` project：运行 `src/**/*.spec.ts` 和 `src/**/*.integration-spec.ts`。
- `e2e` project：运行 `test/**/*.e2e-spec.ts`，并关闭文件级并行，避免多个 e2e 同时抢占共享应用、数据库或端口资源。
- 顶层 `test.include` 设置为 `[]`，避免 root suite 和 project suite 重复收集测试文件。
- 覆盖率排除测试文件本身，例如 `src/**/*.spec.ts`、`src/**/*.integration-spec.ts`。

具体配置、脚本和汇报模板见同目录 `template.md`。

## 推荐执行流程

以 pnpm 项目为例，其他包管理器按锁文件替换命令。

```text
读取当前测试脚本、Jest 配置、依赖、lint-staged / CI 和测试文件分布
        │
        ▼
确认迁移范围：只替换测试框架，不迁移 lint、format、ESM 或业务逻辑
        │
        ▼
按 AGENTS.md 测试要求确认 spec / integration-spec / e2e 的位置和语义
        │
        ▼
安装 Vitest 及必要转换、覆盖率依赖
        │
        ▼
运行 `pnpm exec vitest --help`，确认 CLI 参数
        │
        ▼
新增或更新 `vitest.config.ts`，配置 `test` / `e2e` projects
        │
        ▼
替换 package scripts、lint-staged、CI 中的 Jest 命令
        │
        ▼
迁移测试代码中的 Jest API 到 Vitest API
        │
        ▼
删除 Jest 配置和 Jest 直接依赖，更新锁文件
        │
        ▼
优先运行本次修改相关的测试文件，再按需运行 project
        │
        ▼
汇报改动、验证结果和保留的无关工作区改动
```

具体步骤：

1. 检查当前项目状态：
   - `package.json` 的 `scripts.test`、`test:e2e`，以及是否还有 `test:watch`、`test:cov` 等旧脚本。
   - `package.json` 的 `lint-staged` 字段、`.lintstagedrc*`、`lint-staged.config.*`、husky hook、CI 文件中是否直接调用 Jest。
   - `devDependencies` 中的 Jest 相关依赖。
   - `jest.config.*`、`test/jest-e2e.json`、`package.json` 的 `jest` 字段。
   - 如果 Jest 配置写在 `package.json` 中，先读取其中的 `testMatch` / `testRegex`、`testEnvironment`、`moduleNameMapper`、`setupFiles` / `setupFilesAfterEnv`、`collectCoverageFrom`、`coverageDirectory`、`coveragePathIgnorePatterns`、`testPathIgnorePatterns` 等语义，再迁移到 `vitest.config.ts`，不要只删除字段。
   - 测试文件是否按 `*.spec.ts`、`*.integration-spec.ts`、`test/**/*.e2e-spec.ts` 分层。
   - 当前工作区是否已有未提交改动。
2. 安装 Vitest 相关依赖。NestJS / TypeScript 项目常见组合是 `vitest`、`vite`、`@vitest/coverage-v8`、`unplugin-swc`。如果项目不使用 SWC 或已有其他 Vite 转换方案，按项目事实调整，不要盲目新增无用依赖。
3. 运行 `pnpm exec vitest --help` 验证 CLI 能力。
4. 新增或更新 `vitest.config.ts`。推荐配置见同目录 `template.md`。
5. 修改 `package.json` 脚本。推荐脚本见同目录 `template.md`。
6. 更新项目提示词或文档中的常用命令。编辑代码后优先运行本次修改相关的少量文件；需要整组验证时再运行 `--project test` 或 `--project e2e`。
7. 迁移测试代码 API。常见 API 替换见同目录 `template.md`。
8. NestJS e2e 测试通常只需要替换测试框架 API，`@nestjs/testing` 和 `supertest` 不是 Jest 专用依赖，不要误删。保留应用关闭逻辑。
9. 删除 Jest 配置和直接依赖，只删除项目直接依赖且确实属于 Jest 链路的包。不要删除 `@nestjs/testing`、`supertest`、`@types/supertest`。
10. 搜索 Jest 残留，例如 `jest`、`Jest`、`ts-jest`、`@types/jest`、`jest-e2e`、`.jest`、`jest.`。如果残留是 `package.json` 的 `jest` 字段，按 Jest 配置处理：迁移必要语义后删除该字段。锁文件里的传递依赖名不一定要消失；非本次迁移的历史文档是否更新，按用户要求和项目约定判断。
11. 运行验证命令：优先运行本次修改相关的测试文件；需要整组验证时运行 `pnpm exec vitest run --project test`、`pnpm exec vitest run --project e2e`，并运行项目类型检查或构建命令。

如果当前仓库还没有 `*.integration-spec.ts`，说明对应单文件命令不适用，不要虚报执行通过。

## 常见问题处理

### 1. `package.json` 中存在 `jest` 配置字段

`package.json` 的 `jest` 字段等同于 Jest 配置文件，迁移时不能只检查 `jest.config.*`。处理顺序：

1. 先读取 `package.json.jest`，确认它是否仍被 `npm test`、`pnpm test`、`jest` 默认配置或 `--config package.json` 间接使用。
2. 把仍有用的语义迁移到 `vitest.config.ts`：
   - `testMatch` / `testRegex` / `testPathIgnorePatterns` → Vitest project 的 `include` / `exclude`，并保留 `*.spec.ts`、`*.integration-spec.ts`、`test/**/*.e2e-spec.ts` 的分层语义。
   - `testEnvironment: "node"` → `test.environment: "node"`。
   - `moduleNameMapper` → Vite `resolve.alias` 或 `resolve.tsconfigPaths`；如果只是复用 `tsconfig` path alias，优先使用 `resolve.tsconfigPaths: true`。
   - `setupFiles` / `setupFilesAfterEnv` → `test.setupFiles`，并把其中依赖 Jest 全局 API 的代码同步改为 Vitest API。
   - `collectCoverageFrom`、`coverageDirectory`、`coveragePathIgnorePatterns` → `coverage.include`、`coverage.reportsDirectory`、`coverage.exclude`。
3. 迁移完成后删除 `package.json` 的 `jest` 字段，避免后续误判项目仍使用 Jest。

### 2. `*.integration-spec.ts` 没有被执行

如果只配置了 `src/**/*.spec.ts`，通常会漏掉集成测试。使用 project 时应放在 `test` project 中。这属于项目测试分层要求，不是额外扩大测试范围。

### 3. e2e 并发导致共享资源冲突

e2e 测试通过 HTTP 接口测试完整链路，常会共用应用实例、测试数据库或端口。优先在 `e2e` project 中关闭文件级并行，不要把这个设置扩大到所有普通单元测试，除非普通测试也确实存在共享资源问题。

### 4. 顶层 include 导致测试重复运行

使用 Vitest projects 后，顶层 `test.include` 可以设置为 `[]`，让测试文件只由 project 收集。否则 root suite 和 project suite 可能重复匹配同一批测试文件。

### 5. 覆盖率把测试文件算进 src 覆盖范围

覆盖率通常只看源码，不看测试文件本身。配置 coverage 时排除 `src/**/*.spec.ts` 和 `src/**/*.integration-spec.ts`。

### 6. Jest 全局类型消失后报错

如果使用 `globals: false`，测试文件需要显式从 `vitest` 导入测试 API。不要为了让旧 Jest 全局类型继续存在而保留 `@types/jest`。

### 7. mock 提升语义差异

Vitest 的 `vi.mock` 也有提升行为，但和 Jest 不是逐字节兼容。遇到模块 mock 失败时，优先按 Vitest 的 hoisted mock 写法调整测试，不要改业务代码绕过测试。

### 8. 集成测试不应 mock 外部依赖

`*.integration-spec.ts` 的目标是验证真实数据库、Redis、网络请求等集成点。迁移时如果原测试靠 Jest mock 外部依赖，先判断它本质上是不是单元测试：

- 如果是单元测试，改名或留在 `*.spec.ts`，继续用 `vi.mock`。
- 如果是集成测试，移除 mock，改用环境变量和真实只读数据，并确保不会污染共享环境。

### 9. e2e 需要测试数据库和 seed

`test/**/*.e2e-spec.ts` 应通过 HTTP 测完整链路。没有专门测试库、schema、seed 和清理策略时，不要新增会写入共享环境的 e2e 用例。迁移现有 e2e 时只保证运行器切换和资源关闭正确。

## 验收标准

迁移完成后至少确认：

- `package.json` 的测试脚本使用 `vitest`。
- `devDependencies` 中包含 `vitest`，覆盖率脚本需要时包含 `@vitest/coverage-v8`。
- `devDependencies` 中不再包含 Jest 相关直接依赖。
- 根目录存在 `vitest.config.ts`，并使用 Vitest projects 区分：
  - `test` project：`src/**/*.spec.ts`、`src/**/*.integration-spec.ts`
  - `e2e` project：`test/**/*.e2e-spec.ts`
- 顶层 `test.include` 为 `[]`，避免重复收集测试文件。
- `e2e` project 设置 `fileParallelism: false`。
- coverage 排除 `src/**/*.spec.ts` 和 `src/**/*.integration-spec.ts`。
- Jest 配置文件、`test/jest-e2e.json` 和 `package.json` 的 `jest` 字段已删除，或有明确理由保留且已确认不再由当前测试链路读取。
- 测试代码不再依赖 Jest 全局 API 或 `@types/jest`。
- `@nestjs/testing`、`supertest` 等非 Jest 专用依赖被保留。
- `*.spec.ts` 没有真实数据库或外部服务访问。
- `*.integration-spec.ts` 使用真实外部依赖且默认只读，不使用 mock 替代外部依赖。
- `test/**/*.e2e-spec.ts` 仍只放在 `test/` 目录内，并保留 HTTP 完整链路语义。
- 已优先运行本次修改相关的测试文件；需要整组验证时已运行 `--project test` / `--project e2e`。
- 已运行 `pnpm typecheck` / `pnpm build`，或说明为什么本次未运行。
- 未混入 ESLint / Oxlint、Prettier / Oxfmt、ESM、业务逻辑等非本阶段改动。

## 模板文件

配置模板、脚本模板、测试 API 迁移模板和汇报模板见同目录 `template.md`。
