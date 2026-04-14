---
name: claude-init
description: 为 Claude Code 创建、更新或收敛仓库级 `CLAUDE.md`，只保留高信号、不可直接从代码库发现的协作约束、工具坑点、审批边界和项目特有规则。只要用户提到初始化 Claude Code 仓库说明、把 Cursor 或 Copilot 指令迁移为 Claude Code 版本、把 `AGENTS.md` 转成 Claude Code 可用的形式，或者清理一份冗长失真的 `CLAUDE.md`，都应该优先使用这个 skill。
metadata:
  tags: claude-code, claude-md, initialization, migration, repository-guidance
---

## 何时使用

当任务和仓库级 `CLAUDE.md` 的创建、更新、裁剪有关时，使用这个 skill。

尤其适合这些场景：
- 现有 `CLAUDE.md` 太长、太泛、已经过时
- 仓库只有 Cursor、Copilot、Gemini 或 `AGENTS.md` 指令，需要迁移成 Claude Code 专用版本
- Claude 在这个仓库里反复犯同一类可避免错误
- 仓库工作流变了，需要同步清理和收敛 Claude Code 指南

## Instructions

把 `CLAUDE.md` 当成一份活的协作约束清单，而不是代码库说明文档。

### 核心规则：可发现性过滤

每写一条之前，先问一句：

> Claude Code 能不能只靠阅读仓库里的 `README`、代码、配置、脚本和目录结构，就自己发现这条信息？

- 如果能发现，就不要写进 `CLAUDE.md`
- 如果不能发现，而且它会真实影响任务成功率、成本、安全性或审批流程，就应该写进去

### 面向 Claude Code 改写

这个 skill 的主要输出是 `CLAUDE.md`，不是 `.cursor/rules`、`.cursorrules`、`.github/copilot-instructions.md` 或 `GEMINI.md`。

这些文件只能作为迁移输入。要提炼它们背后的真实意图，再改写成适合 Claude Code 使用的规则，不能按文件逐条照搬。

优先保留那些会直接改变 Claude Code 行为的内容，例如：
- 高风险操作的审批边界
- 不直观的命令限制或执行前提
- 模块、目录、子项目之间的路由规则
- 不能随便碰的区域，以及隐藏的生产依赖
- 只在特定任务下生效、但代码里没有明示的约束

如果仓库里已经有 `AGENTS.md`，把它当成输入源来吸收。除非仓库明确要同时维护两套格式，否则应尽量把重叠信息收敛到 `CLAUDE.md`。

如果仓库很大，优先建议按模块拆分层级化的 `CLAUDE.md`，不要把所有内容硬塞进根目录一份总文件里。

### 什么内容值得写进去

只有同时满足下面几点，才值得保留：
1. 不能只靠仓库文件直接发现
2. 会真实影响执行结果、命令选择、成本或安全边界
3. 对 Claude Code 来说足够具体，能直接照着做

常见例子：
- 脚本里看不出来的非标准工具选择
- 需要特殊参数、环境变量或执行顺序的命令
- 涉及删除、发布、推送、外部系统修改时的审批规则
- 已废弃但仍在生产链路中被引用的目录或文件
- 会实质改变 Claude 协作方式的本地团队约定

### 什么内容不要写

下面这些通常不该放进 `CLAUDE.md`：
- 技术栈介绍
- 目录结构概览
- 直接看代码就能理解的架构说明
- 泛泛而谈的最佳实践
- 已经被 lint、typecheck、测试、CI 或其他自动化强制保障的规则
- 不改变实际行为的模板化废话

### 优先检查哪些文件

在写或清理 `CLAUDE.md` 前，优先检查这些来源：
- 现有 `CLAUDE.md`
- 现有 `AGENTS.md`
- `README.md`
- `PROJECT.md`，如果有的话
- `.claude/` 目录下已有的项目文件，如果有的话
- Cursor 规则文件，比如 `.cursor/rules/` 或 `.cursorrules`
- Copilot 指令文件，比如 `.github/copilot-instructions.md`
- `GEMINI.md`
- CI、workflow、包管理器和任务运行器配置，特别是在命令行为和直觉不一致的时候

如果 `CLAUDE.md` 已经存在，优先增量改进，不要上来整份重写。

### 维护心态

`CLAUDE.md` 是临时性的高信号协作约束，不是堆信息的垃圾场。

当同类问题反复出现时：
1. 先想办法把根因修进代码、脚本、测试或自动化里
2. 在根因消失前，只保留最少但必要的说明
3. 过时规则要积极删掉

### 定稿前检查

定稿前，逐条过一遍：
- 这条信息是不是不可直接发现
- 这条信息今天是不是仍然准确
- 这条信息是不是真的能减少错误、浪费或来回沟通

任意一项不成立，就删掉。

## 最小 `CLAUDE.md` 骨架

这里只是起点，不要机械照抄，要按仓库实际情况收敛。

```md
# Scope & routing

# Non-discoverable commands

# Approval boundaries

# Landmines

# Task-specific constraints
```
