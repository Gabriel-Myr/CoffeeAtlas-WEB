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
cat .trellis/spec/frontend/index.md
cat .trellis/spec/backend/index.md
cat .trellis/spec/guides/index.md
cat .trellis/spec/unit-test/index.md
```

### Step 3: Read Task-Specific Specs

**Frontend work**
```bash
cat .trellis/spec/frontend/component-guidelines.md
cat .trellis/spec/frontend/hook-guidelines.md
cat .trellis/spec/frontend/state-management.md
cat .trellis/spec/frontend/type-safety.md
cat .trellis/spec/frontend/quality-guidelines.md
```

**Backend work**
```bash
cat .trellis/spec/backend/database-guidelines.md
cat .trellis/spec/backend/error-handling.md
cat .trellis/spec/backend/type-safety.md
cat .trellis/spec/backend/logging-guidelines.md
cat .trellis/spec/backend/quality-guidelines.md
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
|   |-- frontend/
|   |-- backend/
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

- Frontend change -> `spec/frontend/`
- Backend change -> `spec/backend/`
- Cross-layer change -> `spec/guides/cross-layer-thinking-guide.md`
- 测试 / regression / helper change -> `spec/unit-test/conventions.md`

### Step 3: Create Or Select A Task

```bash
python3 ./.trellis/scripts/task.py list
python3 ./.trellis/scripts/task.py create "<title>" --slug <task-name>
python3 ./.trellis/scripts/task.py init-context .trellis/tasks/<dir> <frontend|backend|fullstack|test|docs>
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
pnpm --filter coffeestories-webdb test
```

Additional checks when relevant:

```bash
pnpm --filter @coffeeatlas/miniprogram typecheck
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

- `frontend/` - Web + miniprogram UI conventions
- `backend/` - API, DB, auth, error handling, scripts
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
| Frontend | `spec/frontend/index.md` + relevant topic docs |
| Backend | `spec/backend/index.md` + relevant topic docs |
| API / contracts | `spec/backend/error-handling.md`, `spec/backend/type-safety.md` |
| Query / schema | `spec/backend/database-guidelines.md` |
| Tests / regressions | `spec/unit-test/conventions.md` |
| Cross-layer | `spec/guides/cross-layer-thinking-guide.md` |

**Core Philosophy**: Read before write, document current reality, and keep Trellis in sync with the codebase.
