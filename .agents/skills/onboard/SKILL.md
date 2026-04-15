---
name: onboard
description: Onboard a developer to this project's current Trellis workflow, with emphasis on the simplified final-skill model, task flow, and spec maintenance.
---

This is the Codex entry for the Trellis `onboard` workflow in this repository.
Use it as the current onboarding guide, not a generic training lecture.

# Onboard

目标：让新成员快速理解这套 Trellis 现在怎么用，尤其是它已经改成了更精简的最终 skill 模型。

## 1. 先讲清核心思路

这套流程现在的默认路径是：

1. `/trellis:start` 读当前上下文
2. `/trellis:before-dev` 读最小必要 spec
3. 如果不清楚，先做短 `think`
4. 直接实现
5. `/trellis:check` 做验证
6. `/trellis:finish-work` 做最终交接
7. `/trellis:record-session` 记录结果

但要额外讲清楚一个前提：

- `record-session` 只在**人类已经测试并提交代码之后**才执行
- 它不是“刚改完代码马上顺手跑”的一步

重点说明三件事：

- Trellis 不是为了制造复杂流程，而是为了让 AI 每次都读到对的上下文
- `brainstorm` 现在不是默认入口，只在需求真的不清楚时才用
- `check` 和 `finish-work` 不是一回事，前者做验证，后者做交接

还要补第四件事：

- 通用能力型 skill 默认复用用户当前 Codex 全局 skill；本仓库 Trellis skill 只补项目流程

## 2. 解释目录结构

至少要讲清这些目录：

- `.trellis/workspace/`：会话记录，给后续会话补上下文
- `.trellis/tasks/`：任务目录，放 `task.json`、`prd.md`、`*.jsonl`
- `.trellis/spec/`：项目规范，告诉 AI 这个仓库真正怎么写
- `.trellis/scripts/`：流程脚本

需要强调：

- `miniprogram/frontend/` 是当前默认入口
- `api/backend/` 和 `shared-types/*` 只有在任务涉及它们时再进入
- `guides/` 是补充思考，不是每次都强制全读

## 3. 解释关键命令

### `/trellis:start`

作用：

- 读取当前仓库状态
- 找回正在进行的 task
- 让 AI 先知道当前上下文再动手

### `/trellis:before-dev`

作用：

- 读取当前任务最相关的 spec
- 防止 AI 直接按通用经验写代码

### `/trellis:check`

作用：

- 补充这个仓库自己的验证命令和 package 规则
- 看是否漏改、漏测、漏同步 spec
- 它不是为了替代用户全局的通用 `check`

### `/trellis:check-cross-layer`

作用：

- 只在跨层、共享契约、复用/配置敏感时补跑
- 不是每个任务都要跑

### `/trellis:finish-work`

作用：

- 做最后的完成度确认
- 说明哪些验证已跑、哪些没跑
- 交代 spec 是否需要同步

### `/trellis:record-session`

作用：

- 把这次做了什么、学到了什么记下来
- 方便下次会话继续
- 前提是：代码已经由人类测试并提交

## 3.5 讲清全局 skill 与仓库 skill 的分工

当前仓库默认兼容用户现有的 `Waza` 风格全局 skill。

分工是：

- **全局通用能力 skill**：`think`、`hunt`、`design`、`read`、`write`、`health`
- **仓库流程 skill**：`start`、`before-dev`、`check`、`check-cross-layer`、`finish-work`、`record-session`

要明确告诉新成员：

- 不要在仓库里再重复造一套同名通用能力 skill
- `think`、`hunt` 这类动作，默认走全局 skill
- Trellis 负责 task、PRD、spec、交接、记录
- 如果同时用了全局 `check` 和仓库 `check`，仓库 `check` 负责项目补充验证

## 4. 用真实工作流举例

### 小改动

1. `/trellis:start`
2. `/trellis:before-dev`
3. 直接修改
4. `/trellis:check`
5. `/trellis:finish-work`

### 需求明确的正常开发

1. `/trellis:start`
2. 建 task，写短 `prd.md`
3. `/trellis:before-dev`
4. 实现
5. `/trellis:check`
6. `/trellis:finish-work`
7. 人类测试并提交
8. `/trellis:record-session`

### 需求不清楚

1. `/trellis:start`
2. 先做一次短 `think`
3. 如果还是不清楚，再进入 `brainstorm`
4. 明确后按正常开发流程继续

### 排错

1. `/trellis:start`
2. `/trellis:before-dev`
3. 先定位原因，不要直接补丁
4. 改完后 `/trellis:check`
5. 需要时 `/trellis:finish-work`

## 5. 强调几条规则

必须讲清楚：

1. 先读 spec，再改代码
2. 默认走轻量流程，不默认走大流程
3. `brainstorm` 是可选深度流程，不是默认入口
4. `check` 是质量闸门
5. `finish-work` 是最终交接
6. 学到新规则时要同步 `.trellis/spec/`
7. 通用能力默认复用全局 `Waza` 风格 skill，仓库内只保留项目流程补充

## 6. 检查 spec 是否还是空模板

先运行：

```bash
rg -l "To be filled by the team" .trellis/spec
```

如果当前任务相关 spec 还是空模板，就直接告诉对方：

- 这套 Trellis 还没完全准备好
- 应该先把当前 package 的规范补起来
- 先从正在改的那一层开始，不要一次补全全仓库

如果当前任务相关 spec 已经有真实内容，就说明这套流程已经可用，并建议先熟悉当前 package 的 index 和关键规范文件。

## 7. 结束方式

完成 onboarding 后，最后只问一个问题：

`你现在要处理的第一个任务是什么？`
