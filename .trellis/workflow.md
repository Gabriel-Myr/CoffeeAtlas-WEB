# Development Workflow

> Based on [Effective Harnesses for Long-Running Agents](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents)

---

## Table of Contents

1. [Quick Start (Do This First)](#quick-start-do-this-first)
2. [Workflow Overview](#workflow-overview)
3. [Session Start Process](#session-start-process)
4. [Development Process](#development-process)
5. [Session End](#session-end)
6. [File Descriptions](#file-descriptions)
7. [Best Practices](#best-practices)

---

## Quick Start (Do This First)

### Step 0: Initialize Developer Identity (First Time Only)

```bash
python3 ./.trellis/scripts/get_developer.py
python3 ./.trellis/scripts/init_developer.py <your-name>
```

This creates:
- `.trellis/.developer`
- `.trellis/workspace/<your-name>/`

### Step 1: Understand Current Context

```bash
python3 ./.trellis/scripts/get_context.py
python3 ./.trellis/scripts/task.py list
git status && git log --oneline -10
```

### Step 2: Read Project Guidelines [MANDATORY]

```bash
python3 ./.trellis/scripts/get_context.py --mode packages
cat .trellis/spec/guides/index.md
cat .trellis/spec/unit-test/index.md
```

根据你要改的 package，继续读取对应 index，例如：

```bash
cat .trellis/spec/miniprogram/frontend/index.md
cat .trellis/spec/api/backend/index.md
cat .trellis/spec/shared-types/frontend/index.md
cat .trellis/spec/shared-types/backend/index.md
```

`get_context.py --mode packages` 会标出当前默认 package 和哪些 package 目前 `out of scope`。
当前仓库默认 package 是 `miniprogram`，所以如果这轮只改小程序，先从 `miniprogram/frontend` 开始读。

原则：只读当前任务真正需要的 index 和规范文件，不做大范围预读。

### Step 3: Read Task-Specific Specs

**Miniprogram UI work**
```bash
cat .trellis/spec/miniprogram/frontend/component-guidelines.md
cat .trellis/spec/miniprogram/frontend/hook-guidelines.md
cat .trellis/spec/miniprogram/frontend/state-management.md
cat .trellis/spec/miniprogram/frontend/type-safety.md
cat .trellis/spec/miniprogram/frontend/quality-guidelines.md
```

**Shared contract work**
```bash
cat .trellis/spec/shared-types/frontend/index.md
cat .trellis/spec/shared-types/backend/index.md
```

**API backend work**
```bash
cat .trellis/spec/api/backend/index.md
```

**Test-sensitive work**
```bash
cat .trellis/spec/unit-test/conventions.md
```

---

## Workflow Overview

### Core Principles

1. **Read Before Write** - 先读 spec，再动代码
2. **Document Reality** - spec 写当前仓库真实状态，不写理想状态
3. **One Task At A Time** - 每次聚焦单一任务目录
4. **Code-Spec Sync** - 学到新规则时及时更新 `.trellis/spec/`
5. **Keep Work Traceable** - 任务、PRD、journal 尽量可追踪
6. **Prefer Final Skills** - 默认用轻量 `think`、直接实现、`check` 收尾；不要默认进入大而复杂的前置流程
7. **Separate Flow From Capability** - Trellis 管任务流程与项目上下文；通用能力型 skill 默认复用你当前 Codex 全局技能（本仓库按 `Waza` 风格使用）

### File System

```
.trellis/
|-- .developer
|-- scripts/
|-- workspace/
|   |-- index.md
|   +-- {developer}/
|       |-- index.md
|       +-- journal-N.md
|-- tasks/
|   +-- {MM}-{DD}-{slug}/
|       |-- task.json
|       |-- prd.md
|       |-- implement.jsonl
|       |-- check.jsonl
|       +-- debug.jsonl
|-- spec/
|   |-- miniprogram/
|   |   +-- frontend/
|   |-- shared-types/
|   |   |-- frontend/
|   |   +-- backend/
|   |-- unit-test/
|   +-- guides/
+-- workflow.md
```

---

## Session Start Process

### Step 1: Get Context

```bash
python3 ./.trellis/scripts/get_context.py
```

### Step 2: Read Relevant Specs

- 先运行 `python3 ./.trellis/scripts/get_context.py --mode packages`
- 先看当前 `default` package；本仓库默认通常先落到 `spec/miniprogram/frontend/`
- Miniprogram UI -> `spec/miniprogram/frontend/`
- API backend / route handlers -> `spec/api/backend/`
- Shared contracts -> `spec/shared-types/backend/` 或 `spec/shared-types/frontend/`
- Cross-layer change -> `spec/guides/cross-layer-thinking-guide.md`
- 测试 / regression / helper change -> `spec/unit-test/conventions.md`

### Step 3: Create Or Select A Task

```bash
python3 ./.trellis/scripts/task.py list
python3 ./.trellis/scripts/task.py create "<title>" --slug <task-name>
python3 ./.trellis/scripts/task.py init-context .trellis/tasks/<dir> <frontend|backend|fullstack|test|docs> --package <api|miniprogram|shared-types|api-client|domain>
python3 ./.trellis/scripts/task.py start .trellis/tasks/<dir>
```

### Step 4: Write Or Update `prd.md`

至少写清：

- Goal
- Requirements
- Acceptance Criteria
- Out of Scope
- Technical Notes / risks

---

## Development Process

### Task Development Flow

```
1. Create/select task
2. Read the minimum relevant specs
3. Update PRD
4. If unclear, do a short planning pass
5. Implement
6. Run checks
7. Sync Trellis docs if new patterns were learned
8. Hand off for human testing / commit
```

默认对应关系：

- 不清楚怎么做：先短 `think`
- 出现异常或失败：先定位原因，再修
- 改完代码：跑 `check`
- 准备交接或提交：跑 `finish-work`

只有在需求持续变化、确实需要多轮澄清时，才使用 `brainstorm`。

### Global Skills vs Project Skills

本仓库默认把 skill 分成两类：

- **Trellis 项目流程 skill**：`start`、`before-dev`、`check`、`check-cross-layer`、`finish-work`、`record-session`
- **全局通用能力 skill**：`think`、`hunt`、`design`、`read`、`write`、`health`

约定如下：

- 通用能力优先复用你当前 Codex 全局 skill；本仓库不重复发明一套同名通用技能
- Trellis 只负责项目特有流程、spec 读取、任务状态、交接与记录
- 本仓库的 `check` 是**项目补充检查规则**，不是替代全局通用 `check`
- 如果同时用到全局 `check` 和项目 `check`，顺序默认是：先按通用 `check` 做审查，再按项目 `check` 补跑本仓库验证命令

### Required Commands

按改动范围运行真实命令：

```bash
pnpm lint
pnpm typecheck
pnpm --filter @coffeeatlas/miniprogram typecheck
```

如果当前主要在做小程序联调，开发时优先开一个单独终端运行：

```bash
pnpm dev:miniprogram:auto
```

它会监听小程序和共享包改动，并自动重启 `dev:weapp`。

### Commit Convention

```bash
git commit -m "type(scope): description"
```

Types used in this repo:
- `feat`
- `fix`
- `docs`
- `refactor`
- `test`
- `chore`

---

## Session End

### Pre-end Checklist

Use `/trellis:finish-work` before handoff.

Minimum expectations:
1. Relevant checks ran and results are known
2. `.trellis/spec/` updated if the task changed conventions/contracts
3. Working tree is understandable
4. Human reviewer/tester has enough context to validate the change
5. If the task was cross-layer, that fact is documented instead of implied

### Post-Commit Recording

After human testing and commit:

1. Archive completed task if it is actually done
2. Record the session into Trellis workspace journals

```bash
python3 ./.trellis/scripts/task.py archive <task-name>
python3 ./.trellis/scripts/add_session.py \
  --title "Session Title" \
  --commit "abc1234" \
  --summary "Brief summary"
```

只有在代码已经由人类确认并提交后，才进入这一步。

### Optional Session Recording

After the work is committed, record it with:

```bash
python3 ./.trellis/scripts/add_session.py \
  --title "Session Title" \
  --commit "abc1234" \
  --summary "Brief summary"
```

---

## File Descriptions

### `spec/`

Project-specific executable guidance.

- `miniprogram/frontend/` - 小程序前端规范，也是当前默认入口
- `api/backend/` - API 路由、服务端逻辑、SQL、脚本
- `shared-types/*` - 跨端契约层规范
- `unit-test/` - Current test setup and expectations
- `guides/` - Thinking checklists for cross-layer / reuse problems

### `tasks/`

Each task directory stores:
- `task.json` - lifecycle metadata
- `prd.md` - agreed scope
- `*.jsonl` - context injection lists for implement/check/debug agents

### `workspace/`

Per-developer journals for session history.

---

## Best Practices

### Do

- Read the spec index before coding
- Read the specific topic docs before editing that layer
- Keep route handlers thin and move logic into helpers/services
- Update Trellis docs when you discover a new repo-specific rule
- Prefer small, verifiable steps over big rewrites without checkpoints

### Don't

- Don’t treat bootstrap placeholders as truth
- Don’t leave missing-doc references in workflow/skills
- Don’t introduce a new API envelope style casually
- Don’t silently mock successful writes/auth when env is missing
- Don’t leave temporary debug logs in request code

---

## Quick Reference

| Task Type | Must-read |
|-----------|-----------|
| Miniprogram Frontend | `spec/miniprogram/frontend/index.md` + relevant topic docs |
| API Backend | `spec/api/backend/index.md` + relevant topic docs |
| Shared contracts | `spec/shared-types/backend/index.md` or `spec/shared-types/frontend/index.md` |
| Tests / regressions | `spec/unit-test/conventions.md` |
| Cross-layer | `spec/guides/cross-layer-thinking-guide.md` |

默认先从 `get_context.py --mode packages` 标记的 package 开始读，不要一上来把所有层都读一遍。

**Core Philosophy**: Read before write, document current reality, and keep Trellis in sync with the codebase.
