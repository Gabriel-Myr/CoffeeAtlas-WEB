---
name: brainstorm
description: Optional deep-requirement workflow for tasks that are still unclear after a lightweight planning pass. Use only when a short `think` pass is not enough.
---

这是 Trellis 里的“深度澄清模式”，不是默认入口。

# Brainstorm

只有在下面这些情况同时出现时再用：

- 做过一次轻量 `think` 之后，需求还是不清楚
- 存在 2 个以上都合理的方案
- 用户需要在取舍之间做决定
- 不先澄清就容易把任务做偏

## 1. 先建 task，别让讨论漂着

```bash
TASK_DIR=$(python3 ./.trellis/scripts/task.py create "brainstorm: <short goal>" --slug <auto>)
```

先把已知信息写进 `prd.md`，至少包括：

- Goal
- What we know
- Assumptions
- Open Questions
- Requirements
- Acceptance Criteria
- Out of Scope

## 2. 先自己查，再问用户

优先从这些地方补上下文：

- 仓库代码和现有模式
- `.trellis/spec/`
- 相关脚本、配置、已有 task / PRD
- 必要时再做外部研究

能自己得出的，不问用户。

## 3. 只问高价值问题

每次只问一个问题，并且只问两类：

- 阻塞问题：没有答案就无法继续
- 偏好问题：有多种可行方案，需要用户决定

问题尽量给 2 到 3 个具体选项，而不是泛问。

## 4. 让 PRD 收敛

每拿到一个明确答案，就立刻更新 `prd.md`：

- 已确认内容移进 `Requirements`
- 能验证的结果写进 `Acceptance Criteria`
- 这次不做的内容写进 `Out of Scope`

## 5. 结束标准

`brainstorm` 的目标不是“继续聊”，而是把任务收敛到一个可执行的 `prd.md`。

结束时至少给出：

1. 目标
2. 已确认的要求
3. 推荐方案
4. 明确的 out-of-scope
5. 下一步实现动作

核心原则：

> 只有轻量 `think` 不够时，才进入 `brainstorm`。能短决策，就不要长流程。
