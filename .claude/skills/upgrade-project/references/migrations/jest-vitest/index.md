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

- 新增 Vitest、Vite 和项目需要的覆盖率依赖；默认不要把 SWC 当作 TS 编译底座引入。
- 新增或更新 `vitest.config.ts`，并在根级显式配置 `oxc.target`。
- `oxc.target` 必须结合 `package.json` 的 `engines.node` 选择；如果项目没有声明 Node 版本，使用当前 Vite/OXC 支持的最高 `nodeXX` target，并通过 Vitest 验证。
- 将现有测试脚本迁移到 Vitest，并将 `package.json` 的 `test` / `test:watch` / `test:cov` 固定到 `test` project；e2e 仍使用独立 project 或项目已有独立入口。
- 删除 Jest 配置文件、`package.json` 的 `jest` 配置字段和 Jest 相关直接依赖。
- 将测试代码里的 Jest API 改为 Vitest API。
- 同步 lint-staged、husky、CI 或文档中直接调用 Jest 的命令。
- 按项目测试分层要求保留单元测试、集成测试、e2e 测试的语义和位置。

默认不要顺手做这些事：

- 不迁移 ESLint / Oxlint。
- 不迁移 Prettier / Oxfmt。
- 不处理 CJS / ESM 迁移，除非 Vitest 配置运行所必需且用户同意扩大范围。
- 不改业务逻辑来适配测试；优先修测试框架 API、测试启动配置和测试隔离问题。
- 不改变目标项目已经约定的单元、集成和 e2e 测试语义。
- 不新增目标项目规则未允许的外部访问、mock 或没有清理策略的数据写入。
- 不把 `test/debug/*.debug.ts` 纳入常规自动化测试。

## 测试分层要求

迁移前先读取目标项目 `AGENTS.md` 的测试要求，并原样保留其测试语义。NestJS 项目读取 `../../profiles/nestjs-backend/AGENTS.md`，其他 Node.js 后台项目读取 `../../profiles/nodejs-backend/AGENTS.md`。

本 migration 只负责文件收集范围、Vitest projects、测试 API 和运行器命令，不重新规定集成测试是否允许 mock、是否必须访问真实外部依赖、e2e 使用哪些数据，或新增模块应补哪类测试。目标项目规则与这里的示例文件布局不一致时，以目标项目规则为准。

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

- `test` project：运行 `src/**/*.spec.ts` 和 `src/**/*.integration-spec.ts`，也是 `package.json` 中 `test` / `test:watch` / `test:cov` 的目标。
- `e2e` project：运行 `src/**/*.spec.ts`、`src/**/*.integration-spec.ts` 和 `test/**/*.e2e-spec.ts`，用于统计普通测试与 e2e 共同产生的覆盖率；同时关闭文件级并行，避免多个 e2e 同时抢占共享应用、数据库或端口资源。
- 顶层 `test.include` 设置为 `[]`，避免 root suite 和 project suite 重复收集测试文件。
- 覆盖率排除测试文件本身，例如 `src/**/*.spec.ts`、`src/**/*.integration-spec.ts`。

配置模板见同目录 `vitest-config.md`，脚本模板见 `package.md`，验证命令见 `commands.md`，测试 API 迁移模板见 `vitest-api.md`。如项目确实需要 SWC fallback，参考同目录 `swcrc.md`，但不要作为默认 TS 编译底座。

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
安装 Vitest、Vite 及覆盖率依赖
        │
        ▼
运行 `pnpm exec vitest --help`，确认 CLI 参数
        │
        ▼
新增或更新 `vitest.config.ts`，配置根级 `oxc.target` 与 `test` / `e2e` projects
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
   - `package.json` 的 `scripts.test`、`test:watch`、`test:cov` 是否使用目标 Vitest 命令，以及是否还有旧的 `test:e2e` 或 Jest 命令需要迁移。
   - `package.json` 的 `engines.node`；存在时用它选择 `oxc.target`，例如 `>=24.14.0` 对应 `node24`。不存在时使用当前 Vite/OXC 支持的最高 `nodeXX` target，并通过 Vitest 验证。
   - `package.json` 的 `lint-staged` 字段、`.lintstagedrc*`、`lint-staged.config.*`；如果需要保留或迁移独立配置文件，目标文件名统一为 `lint-staged.config.js`；husky hook、CI 文件中是否直接调用 Jest。
   - `devDependencies` 中的 Jest 相关依赖。
   - `jest.config.*`、`test/jest-e2e.json`、`package.json` 的 `jest` 字段。
   - 如果 Jest 配置写在 `package.json` 中，先读取其中的 `testMatch` / `testRegex`、`testEnvironment`、`moduleNameMapper`、`setupFiles` / `setupFilesAfterEnv`、`collectCoverageFrom`、`coverageDirectory`、`coveragePathIgnorePatterns`、`testPathIgnorePatterns` 等语义，再迁移到 `vitest.config.ts`，不要只删除字段。
   - 测试文件是否按 `*.spec.ts`、`*.integration-spec.ts`、`test/**/*.e2e-spec.ts` 分层。
   - 当前工作区是否已有未提交改动。
2. 安装 Vitest 相关依赖。常见组合是 `vitest`、`vite`、`@vitest/coverage-v8`。默认不要引入 `unplugin-swc` 作为 TS 编译底座；Vitest 4.1 + Vite 8 的 JS/TS transform 应显式走 OXC。只有项目确实依赖 OXC 当前不支持的装饰器降级或装饰器元数据时，才按项目事实增加 Babel / SWC workaround，并记录偏离原因。
3. 运行 `pnpm exec vitest --help` 验证 CLI 能力，并确认目标 Vitest/Vite 版本支持模板中的 `projects`、`extends`、`fileParallelism`、`resolve.tsconfigPaths`、根级 `oxc` 等字段；不支持时按当前版本的真实配置能力调整，不要照抄模板。
4. 新增或更新 `vitest.config.ts`。推荐配置见同目录 `vitest-config.md`。
5. 修改 `package.json` 脚本。推荐脚本见同目录 `package.md`。
6. 更新项目提示词或文档中的常用命令。编辑代码后优先运行本次修改相关的少量文件；需要验证单元测试和集成测试整组时运行 `pnpm test` 或 `pnpm test:cov`，需要 e2e 时单独运行 `--project e2e` 或项目已有独立入口。
7. 迁移测试代码 API。常见 API 替换见同目录 `vitest-api.md`。
8. NestJS e2e 测试通常只需要替换测试框架 API，`@nestjs/testing` 和 `supertest` 不是 Jest 专用依赖，不要误删。保留应用关闭逻辑。
9. 删除 Jest 配置和直接依赖，只删除项目直接依赖且确实属于 Jest 链路的包。不要删除 `@nestjs/testing`、`supertest`、`@types/supertest`。
10. 搜索 Jest 残留，例如 `jest`、`Jest`、`ts-jest`、`@types/jest`、`jest-e2e`、`.jest`、`jest.`。如果残留是 `package.json` 的 `jest` 字段，按 Jest 配置处理：迁移必要语义后删除该字段。锁文件里的传递依赖名不一定要消失；非本次迁移的历史文档是否更新，按用户要求和项目约定判断。
11. 运行验证命令：优先运行本次修改相关的测试文件；需要验证单元测试和集成测试整组时运行 `pnpm test`，需要覆盖率时运行 `pnpm test:cov`；e2e 使用 `pnpm exec vitest run --project e2e` 或项目已有独立入口，并运行项目类型检查或构建命令。

如果当前仓库还没有 `*.integration-spec.ts`，说明对应单文件命令不适用，不要虚报执行通过。

## 常见问题处理

### 1. `oxc.target` 选择错误或没有显式设置

Vitest 4.1 + Vite 8 下，TS/JS transform 应显式走 OXC。处理顺序：

1. 在 `vitest.config.ts` 根级配置 `oxc`，不要写到 `test` 下。
2. 读取 `package.json.engines.node`，按 Node 主版本选择 target，例如 `>=24.14.0` → `node24`。
3. 如果没有 `engines.node`，使用当前 Vite/OXC 支持的最高 `nodeXX` target，并运行 Vitest 验证配置可用。
4. 不要用 `nodenext` 作为 `oxc.target`；它是 TypeScript 模块解析语义。
5. 不要把 Node 后端项目默认设为 `esnext`。`nodeXX` 已经表示尽量保留该 Node 版本支持的 ECMAScript 语法。
6. 不要写 `oxc: false`，除非项目明确采用其他 transformer 且已说明偏离原因。

### 2. `package.json` 中存在 `jest` 配置字段

`package.json` 的 `jest` 字段等同于 Jest 配置文件，迁移时不能只检查 `jest.config.*`。处理顺序：

1. 先读取 `package.json.jest`，确认它是否仍被 `npm test`、`pnpm test`、`jest` 默认配置或 `--config package.json` 间接使用。
2. 把仍有用的语义迁移到 `vitest.config.ts`：
   - `testMatch` / `testRegex` / `testPathIgnorePatterns` → Vitest project 的 `include` / `exclude`，并保留 `*.spec.ts`、`*.integration-spec.ts`、`test/**/*.e2e-spec.ts` 的分层语义。
   - `testEnvironment: "node"` → `test.environment: "node"`。
   - `moduleNameMapper` → Vite `resolve.alias` 或 `resolve.tsconfigPaths`；如果只是复用 `tsconfig` path alias，优先使用 `resolve.tsconfigPaths: true`。
   - `setupFiles` / `setupFilesAfterEnv` → `test.setupFiles`，并把其中依赖 Jest 全局 API 的代码同步改为 Vitest API。
   - `collectCoverageFrom`、`coverageDirectory`、`coveragePathIgnorePatterns` → `coverage.include`、`coverage.reportsDirectory`、`coverage.exclude`。
3. 迁移完成后删除 `package.json` 的 `jest` 字段，避免后续误判项目仍使用 Jest。

### 3. `*.integration-spec.ts` 没有被执行

如果只配置了 `src/**/*.spec.ts`，通常会漏掉集成测试。使用 project 时应放在 `test` project 中。这属于项目测试分层要求，不是额外扩大测试范围。

### 4. e2e 并发导致共享资源冲突

e2e 测试高度依赖专用外部服务和测试数据，可能共用影子 MySQL 数据库、Langfuse Dataset、应用实例或端口。优先在 `e2e` project 中关闭文件级并行，不要把这个设置扩大到所有普通单元测试，除非普通测试也确实存在共享资源问题。

### 5. 顶层 include 导致测试重复运行

使用 Vitest projects 后，顶层 `test.include` 可以设置为 `[]`，让测试文件只由 project 收集。否则 root suite 和 project suite 可能重复匹配同一批测试文件。

### 6. 覆盖率把测试文件算进 src 覆盖范围

覆盖率通常只看源码，不看测试文件本身。配置 coverage 时排除 `src/**/*.spec.ts` 和 `src/**/*.integration-spec.ts`。

### 7. Jest 全局类型消失后报错

如果使用 `globals: false`，测试文件需要显式从 `vitest` 导入测试 API。不要为了让旧 Jest 全局类型继续存在而保留 `@types/jest`。

### 8. mock 提升语义差异

Vitest 的 `vi.mock` 也有提升行为，但和 Jest 不是逐字节兼容。遇到模块 mock 失败时，优先按 Vitest 的 hoisted mock 写法调整测试，不要改业务代码绕过测试。

### 9. 不要在运行器迁移中改写测试语义

现有 `*.integration-spec.ts` 使用真实依赖还是 mock，由目标项目 `AGENTS.md` 决定。Jest 到 Vitest 迁移只替换对应 API；不要因为 migration 自己的偏好改名测试、移除 mock、改成真实外部请求或反向把真实集成改成 mock。

### 10. e2e 迁移后资源没有关闭

运行器切换后保留现有应用、数据库连接、服务容器和端口的关闭逻辑。依赖类型与测试数据仍由目标项目规则决定；本 migration 只确保 Vitest 能等待并执行已有 teardown，避免测试完成后进程悬挂。

## 验收标准

迁移完成后至少确认：

- `package.json` 的测试脚本使用 Vitest，并包含以下三个命令：`"test": "vitest run --project test --passWithNoTests"`、`"test:watch": "vitest --project test"`、`"test:cov": "vitest run --coverage --project test --passWithNoTests"`。
- `devDependencies` 中包含 `vitest`，覆盖率脚本需要时包含 `@vitest/coverage-v8`。
- `devDependencies` 中不再包含 Jest 相关直接依赖。
- 根目录存在 `vitest.config.ts`，且在根级显式配置 `oxc.target`：
  - 如果 `package.json.engines.node` 存在，target 与 Node 主版本对齐，例如 `>=24.14.0` → `node24`。
  - 如果项目没有声明 Node 版本，使用当前 Vite/OXC 支持的最高 `nodeXX` target，并已通过 Vitest 验证。
  - 没有使用 `nodenext`、`esnext` 或 `oxc: false` 作为默认迁移结果。
- `vitest.config.ts` 使用 Vitest projects 区分：
  - `test` project：`src/**/*.spec.ts`、`src/**/*.integration-spec.ts`
  - `e2e` project：`src/**/*.spec.ts`、`src/**/*.integration-spec.ts`、`test/**/*.e2e-spec.ts`
- 如果项目为了装饰器降级或装饰器元数据显式使用 Babel / SWC workaround，已说明原因；否则没有默认引入 SWC 替代 OXC。
- 顶层 `test.include` 为 `[]`，避免重复收集测试文件。
- `e2e` project 设置 `fileParallelism: false`。
- coverage 排除 `src/**/*.spec.ts` 和 `src/**/*.integration-spec.ts`。
- Jest 配置文件、`test/jest-e2e.json` 和 `package.json` 的 `jest` 字段已删除，或有明确理由保留且已确认不再由当前测试链路读取。
- 测试代码不再依赖 Jest 全局 API 或 `@types/jest`。
- `@nestjs/testing`、`supertest` 等非 Jest 专用依赖被保留。
- `*.spec.ts`、`*.integration-spec.ts`、`*.e2e-spec.ts` 的语义、依赖边界和位置符合目标项目 `AGENTS.md` 或适用 profile；migration 没有自行覆盖这些规则。
- 已优先运行本次修改相关的测试文件；需要整组验证时已运行 `pnpm test` / `pnpm test:cov`；e2e 按需单独运行 `--project e2e` 或项目已有独立入口。
- 已运行 `pnpm typecheck` / `pnpm build`，或说明为什么本次未运行。
- 未混入 ESLint / Oxlint、Prettier / Oxfmt、ESM、业务逻辑等非本阶段改动。

## 模板文件

配置模板见同目录 `vitest-config.md`，脚本模板见 `package.md`，验证命令见 `commands.md`，测试 API 迁移模板见 `vitest-api.md`。如项目确实需要 SWC fallback，参考同目录 `swcrc.md`，但不要作为默认 TS 编译底座。
