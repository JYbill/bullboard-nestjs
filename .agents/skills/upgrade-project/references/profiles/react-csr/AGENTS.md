# 目录描述

```text
.
├── docs/
│   ├── spec/        项目标准流程文档；不了解上下文时先看对应模块主流程
│   └── plan/        临时方案、迁移计划和阶段性设计记录
├── src/
│   ├── api/         接口调用封装
│   ├── components/  通用组件
│   ├── context/     跨页面或跨组件共享的 React Context、Provider 和 hooks
│   ├── enum/        跨模块复用的枚举、常量映射和稳定字面量集合
│   ├── pages/       页面入口和页面私有逻辑
│   ├── types/       全局类型和全局变量声明
│   └── utils/       跨模块复用的纯工具函数或基础工具封装
├── public/          静态资源
├── .agents/         Codex 本地技能与代理资源
├── .claude/         Claude 本地技能与代理资源
├── .apifox/         Apifox 本地项目配置
└── .husky/          Git hooks
```

# 开发要求

## 开发流程

```text
收到开发任务
        │
        ▼
判断是否涉及业务流程或模块实现
        │
        ▼
涉及则读取相关 docs/spec/ 模块 index.md 和 流程/ 主流程上下文
        │
        ▼
理解用户需求并开始编码
        │
        ▼
编码完成后收集本次任务修改的 .ts / .tsx 文件
        │
        ▼
依次使用 react-ddt skill -> notes skill 检查这些文件
        │
        ▼
使用 oxlint、oxfmt 对未提交文件进行格式化与 lint 检测
        │
        ▼
结合本次代码改动，将最新业务流程和模块实现整理到对应 docs/spec/ 文档
        │
        └──────────────→ 下一次任务读取最新 docs/spec/，继续上述流程
```

## 页面浏览与视觉验证

- 需要查看页面、截图、浏览器日志、网络请求、React tree、组件 props/hooks 或运行时错误时，优先使用 `next-browser` CLI。
- 使用 `next-browser` 时，尽可能复用已经打开的 Chrome testing app；不要在已有可用会话时重复新开浏览器。
- 如果缺少开发服务 URL 或登录态 cookie 文件路径，只询问缺失项；不要为了探测地址主动运行 `next-browser project`。
- 视觉或交互相关改动完成后，用 `next-browser screenshot "<caption>"` 留一次截图；判断按钮、文本和可点击目标时优先用 `next-browser snapshot`。
- 需要登录态时，只接收用户提供的 cookie 文件路径，不在聊天、命令输出或截图 caption 中暴露 cookie、token、authorization header。

## 编码规范

- 禁止过度封装、过度抽象、提前拆分或新增不必要的中间层。
- 不确定是否需要拆分、抽象或复用时，默认按当前业务耦合处理，把逻辑留在真实使用处。
- 只有用户明确要求拆分、抽象、封装或复用时，才进行对应拆分。
- 禁止替用户预设未来步骤、未来需求或未来扩展路径，并据此新增结构、文件或流程。
- 必须使用支持 tree shaking 的导入方式，优先具名导入或默认导入；禁止使用 `import * as xxx` 全量导入，除非第三方包不支持按需导入。
- `util` 文件中存在明确主从调用关系的紧密相关方法时，必须使用同一个静态 class 组织为静态方法，不得平铺为多个顶层函数。例如：

```ts
export class CopilotDisplayMessageUtil {
  static buildCopilotDisplayMessages(messages: Message[]) {
    // ...
    return this.buildDisplayTurn(messages)
  }

  private static buildDisplayTurn(turnMessages: Message[]) {
    // ...
  }
}
```

## 测试规范

- 测试文件必须使用 `{源文件名}.spec.ts` 命名。
- 只生成有意义且必要的测试用例与测试逻辑，禁止生成无意义或无实际作用的测试用例与测试逻辑。

## 类型要求

- 类型必须按照 `.d.ts` 定义到原逻辑文件的同级目录。
- 类型文件命名为对应源逻辑文件名加 `.d.ts`，例如 `mount.ts` 的类型文件为 `mount.d.ts`。
- 只有 `src/types` 目录下的 `.d.ts` 允许定义全局类型或全局变量。
- 其他位置的 `.d.ts` 必须使用模块化导出，不允许写全局声明。

## 文件名规范

- 原文件专属的校验文件使用 `{原文件}.schema.ts`，并与原文件放在同级目录。
- 源文件专属的枚举、常量映射和稳定字面量集合使用 `{源文件}.enum.ts`；目录级稳定枚举允许使用 `enum.ts`。
- 源文件专属工具函数使用 `{源文件}.util.ts`；目录级工具函数允许使用 `util.ts`。
- 组件目录内禁止在一个文件中塞多个组件；`index.tsx` 作为主组件入口，其余子组件必须抽到同级子组件文件，文件名使用首字母大写的驼峰命名方式，且子组件文件名和组件名不重复父目录或主组件前缀。
- 子组件继续拆分孙组件时，若孙组件除自身组件文件外还需要专属 `util`、`enum` 等配套文件（不包含 `.d.ts`），必须放入当前目录的 `components/{组件名}/` 目录，并以该目录的 `index.tsx` 作为入口。
- 所有 `components/` 目录下的组件文件名和组件目录名必须以大写字母开头。
- 跨模块复用的全局类型放到 `src/types/`。
- 跨模块复用的全局枚举、常量映射和稳定字面量集合放到 `src/enum/`。
- 跨模块复用的全局工具函数放到 `src/utils/`。

## 文件目录规范

- `src/api/` 只放接口调用封装，不放页面逻辑、组件或状态管理。
- 通用组件必须放到 `src/components/` 目录。
- `src/context/` 只放跨页面或跨组件共享的 React Context、Provider、配套 hooks 和上下文工具。
- `src/enum/` 只放跨模块复用的枚举、常量映射和稳定字面量集合。
- 页面业务组件必须放到 `src/pages/*/components/` 目录。
- `src/pages/` 只放页面入口和页面私有逻辑。
- `src/utils/` 只放跨模块复用的纯工具函数或基础工具封装。

## 文档要求

- `docs/spec/` 目录是项目标准流程文档，是不了解上下文时首要查看的内容，也是理解项目核心的关键入口。
- `docs/spec/` 目录下的每个目录都是一个模块。
- 每个模块必须包含 `index.md`。
- 模块内子目录过多时，子目录也必须创建 `index.md` 作为索引文件。
- 每个模块必须包含 `流程/` 目录，用于表示模块主流程。

## 子AGENTS.md规则

- 子目录内的 `AGENTS.md` 作为文件索引时，只允许围绕 `.ts`、`.tsx` 文件描述对应文件作用。
- 子目录索引不得定义 `AGENTS.md`、`CLAUDE.md`、`.d.ts`、`.d.tsx` 文件的作用。

## 格式化与校验

- TS / TSX / JS / JSX 文件改完后，可用 `oxlint` 修复：

```sh
pnpm exec oxlint --fix --config oxlint.config.ts <files>
```

- TS / TSX / JS / JSX 文件改完后，可用 `oxlint` 校验：

```sh
pnpm exec oxlint --config oxlint.config.ts <files>
```

- 任意受支持文件改完后，可用 `oxfmt` 格式化：

```sh
pnpm exec oxfmt --config oxfmt.config.ts <files>
```

- 任意受支持文件改完后，可用 `oxfmt` 校验：

```sh
pnpm exec oxfmt --check --config oxfmt.config.ts <files>
```

- 编码完全完成后必须跑一次类型检查：

```sh
pnpm typecheck
```
