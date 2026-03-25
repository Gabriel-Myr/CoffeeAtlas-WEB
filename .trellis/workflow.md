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
cat .trellis/spec/web/frontend/index.md
cat .trellis/spec/web/backend/index.md
```

`get_context.py --mode packages` 会标出当前默认 package 和哪些 package 目前 `out of scope`。
当前仓库默认 package 是 `miniprogram`，所以如果这轮只改小程序，先从 `miniprogram/frontend` 开始读。

### Step 3: Read Task-Specific Specs

**Miniprogram UI work**
```bash
cat .trellis/spec/miniprogram/frontend/component-guidelines.md
cat .trellis/spec/miniprogram/frontend/hook-guidelines.md
cat .trellis/spec/miniprogram/frontend/state-management.md
cat .trellis/spec/miniprogram/frontend/type-safety.md
cat .trellis/spec/miniprogram/frontend/quality-guidelines.md
```

**Frontend work**
```bash
cat .trellis/spec/web/frontend/component-guidelines.md
cat .trellis/spec/web/frontend/hook-guidelines.md
cat .trellis/spec/web/frontend/state-management.md
cat .trellis/spec/web/frontend/type-safety.md
cat .trellis/spec/web/frontend/quality-guidelines.md
```

**Backend work**
```bash
cat .trellis/spec/web/backend/database-guidelines.md
cat .trellis/spec/web/backend/error-handling.md
cat .trellis/spec/web/backend/type-safety.md
cat .trellis/spec/web/backend/logging-guidelines.md
cat .trellis/spec/web/backend/quality-guidelines.md
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
|   |-- web/
|   |   |-- frontend/
|   |   +-- backend/
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
- Web UI -> `spec/web/frontend/`
- Web backend / API -> `spec/web/backend/`
- Shared contracts -> `spec/shared-types/backend/` 或 `spec/shared-types/frontend/`
- Cross-layer change -> `spec/guides/cross-layer-thinking-guide.md`
- 测试 / regression / helper change -> `spec/unit-test/conventions.md`

### Step 3: Create Or Select A Task

```bash
python3 ./.trellis/scripts/task.py list
python3 ./.trellis/scripts/task.py create "<title>" --slug <task-name>
python3 ./.trellis/scripts/task.py init-context .trellis/tasks/<dir> <frontend|backend|fullstack|test|docs> --package <web|miniprogram|shared-types|api-client|domain>
python3 ./.trellis/scripts/task.py start .trellis/tasks/<dir>
```

### Step 4: Write Or Update `prd.md`

至少写清：

- Goal
- Requirements
- Acceptance Criteria
- Technical Notes / risks

---

## Development Process

### Task Development Flow

```
1. Create/select task
2. Read relevant specs
3. Update PRD
4. Implement
5. Run checks
6. Sync Trellis docs if new patterns were learned
7. Hand off for human testing / commit
```

### Required Commands

按改动范围运行真实命令：

```bash
pnpm lint
pnpm typecheck
pnpm --filter @coffeeatlas/miniprogram typecheck
```

Additional checks when relevant:

```bash
pnpm --filter @coffeeatlas/web test
cd apps/web && API_BASE_URL=http://127.0.0.1:3000 pnpm smoke:api
```

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
- `web/frontend/` - Web UI conventions
- `web/backend/` - Web API, DB, auth, error handling, scripts
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
| Web Frontend | `spec/web/frontend/index.md` + relevant topic docs |
| Web Backend | `spec/web/backend/index.md` + relevant topic docs |
| API / contracts | `spec/web/backend/error-handling.md`, `spec/web/backend/type-safety.md` |
| Query / schema | `spec/web/backend/database-guidelines.md` |
| Tests / regressions | `spec/unit-test/conventions.md` |
| Cross-layer | `spec/guides/cross-layer-thinking-guide.md` |

默认先从 `get_context.py --mode packages` 标记的 package 开始读，不要一上来把所有层都读一遍。

**Core Philosophy**: Read before write, document current reality, and keep Trellis in sync with the codebase.
