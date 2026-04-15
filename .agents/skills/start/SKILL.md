---
name: start
description: Initialize a Trellis session in this project with the minimum context needed to begin work: read workflow, load current context, inspect relevant spec indexes, then either answer, plan briefly, or implement.
---

This is the Codex entry for the Trellis `start` workflow in this repository.
Use it as the project-specific default operating procedure.

# Start Session

目标：先读最少但足够的上下文，再决定是直接回答、做一个轻量 `think`，还是直接进入任务执行。

默认分工：

- 通用能力型 skill，如 `think`、`hunt`、`design`、`read`、`write`、`health`，优先复用你当前 Codex 全局 skill（本仓库按 `Waza` 风格兼容）
- 本仓库 Trellis skill 只负责项目流程和项目特有约束，如 `start`、`before-dev`、`check`、`finish-work`、`record-session`
- 如果要做通用方案推演或排错，不需要在仓库里再找一套同名 skill

## 1. Session Init

先读工作流和当前上下文：

```bash
cat .trellis/workflow.md
python3 ./.trellis/scripts/get_context.py
python3 ./.trellis/scripts/get_context.py --mode packages
cat .trellis/spec/guides/index.md
cat .trellis/spec/unit-test/index.md
```

然后只读和当前任务真正相关的 package index。

如果这轮只改小程序，先读：

```bash
cat .trellis/spec/miniprogram/frontend/index.md
```

如果主要是微信小程序联调，建议另开终端运行：

```bash
pnpm dev:miniprogram:auto
```

只有在任务确实跨层时，才补读：

```bash
cat .trellis/spec/api/backend/index.md
cat .trellis/spec/shared-types/backend/index.md
cat .trellis/spec/shared-types/frontend/index.md
```

注意：`index.md` 只是导航。真正开始写代码前，还要回到 index 里列出的具体规范文件。

## 2. Decide The Path

按下面的简单规则处理：

- 用户只是提问：直接回答，必要时引用代码或 spec
- 改动非常小：直接改
- 目标清楚、范围可控：做一个简短确认，然后直接建 task 并执行
- 目标不清楚、方案分歧明显、跨层风险高：先用全局 `think` 做一次轻量规划

不要把大型 `brainstorm` 当默认入口。
只有在需求还在持续变化、确实需要多轮澄清时，才进入 `brainstorm`。

## 3. Default Build Path

对大多数开发任务，使用这条短路径：

1. 明确目标和范围
2. 创建 task 目录
3. 写一个短而具体的 `prd.md`
4. 研究最小必要代码和 spec
5. 初始化 context
6. 开始实现
7. 跑 `check`
8. 用 `finish-work` 做收尾

创建 task：

```bash
TASK_DIR=$(python3 ./.trellis/scripts/task.py create "<title>" --slug <name>)
```

初始化 context：

```bash
python3 ./.trellis/scripts/task.py init-context "$TASK_DIR" <frontend|backend|fullstack|test|docs> --package <api|miniprogram|shared-types|api-client|domain>
python3 ./.trellis/scripts/task.py start "$TASK_DIR"
```

## 4. PRD Minimum Shape

`prd.md` 至少写清楚这些内容：

```markdown
# <Task Title>

## Goal
<要解决什么问题>

## Requirements
- <必须满足的点>

## Acceptance Criteria
- [ ] <可验证的结果>

## Out of Scope
- <这次不做什么>

## Technical Notes
<约束、风险、关键文件>
```

## 5. Decision Rules

- 先读，再改
- 只读必要上下文，不做泛化研究
- 不清楚就先短规划，默认复用全局 `think`，不默认开复杂流程
- 改完立刻验证，不要把 `check` 放到最后才想起来
- 如果改动涉及真实约束或新规则，记得同步 `.trellis/spec/`

## 6. Continue Existing Work

如果当前已经有 task：

1. 读这个 task 的 `prd.md`
2. 看 `task.json` 里的状态和阶段
3. 根据当前阶段继续做，不要重复开新流程

核心原则：

> Trellis 默认是轻量、直接、可执行的工作流，不是层层前置的复杂流程。
