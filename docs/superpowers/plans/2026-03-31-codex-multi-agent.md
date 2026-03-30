# Codex Multi-Agent Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make this repo's Trellis multi-agent flow usable from Codex with a stable startup path, clear docs, and project-level shortcuts.

**Architecture:** Keep the existing Trellis scripts and worktree flow. Add a thin Codex-specific adapter layer so `plan.py` and `start.py` can inject role instructions into `codex exec`, then expose the flow through root scripts and one Chinese guide.

**Tech Stack:** Python 3, TOML, Codex CLI, pnpm workspace, Markdown

---

### Task 1: Lock Codex agent prompt injection with a regression test

**Files:**
- Create: `.trellis/tests/test_codex_cli_adapter.py`
- Modify: `.trellis/scripts/common/cli_adapter.py`

- [ ] **Step 1: Write the failing test**

Add a test that verifies:
- `CLIAdapter("codex")` can read `.codex/agents/plan.toml`
- `build_run_command(..., project_root=...)` injects agent instructions into the final prompt
- the generated command includes the sandbox mode from the agent definition

- [ ] **Step 2: Run test to verify it fails**

Run: `pytest .trellis/tests/test_codex_cli_adapter.py -q`
Expected: FAIL because the adapter does not yet read Codex agent TOML or pass prompt/sandbox through.

### Task 2: Make Codex `plan/start` use project agent definitions

**Files:**
- Modify: `.trellis/scripts/common/cli_adapter.py`
- Modify: `.trellis/scripts/multi_agent/plan.py`
- Modify: `.trellis/scripts/multi_agent/start.py`
- Create: `.codex/agents/plan.toml`
- Create: `.codex/agents/dispatch.toml`

- [ ] **Step 1: Implement minimal adapter support**

Update the adapter so Codex runs can:
- read `.codex/agents/<agent>.toml`
- prepend `developer_instructions` to the prompt
- apply `sandbox_mode` to `codex exec`

- [ ] **Step 2: Wire `plan.py` and `start.py` to pass `project_root`**

Make both entry scripts call the adapter with enough context to resolve the agent TOML.

- [ ] **Step 3: Add Codex plan/dispatch agent files**

Create project-local instructions for:
- `plan`: create task config and `prd.md`
- `dispatch`: execute the queued Trellis phases in worktree context

### Task 3: Add easier entry points and user docs

**Files:**
- Modify: `package.json`
- Create: `docs/trellis-codex-multi-agent.md`

- [ ] **Step 1: Add root scripts**

Expose:
- `pnpm trellis:parallel:plan`
- `pnpm trellis:parallel:start`
- `pnpm trellis:parallel:status`
- `pnpm trellis:parallel:cleanup`

- [ ] **Step 2: Write Chinese usage guide**

Document:
- what Trellis multi-agent is in this repo
- how to plan/start/status/cleanup from Codex
- current limits and recommended usage

### Task 4: Run targeted verification

**Files:**
- Verify only

- [ ] **Step 1: Run the new Trellis tests**

Run: `pytest .trellis/tests/test_codex_cli_adapter.py -q`
Expected: PASS

- [ ] **Step 2: Run all Trellis tests**

Run: `pytest .trellis/tests -q`
Expected: PASS

- [ ] **Step 3: Verify command help**

Run:
- `python3 ./.trellis/scripts/multi_agent/plan.py --help`
- `python3 ./.trellis/scripts/multi_agent/start.py --help`
- `pnpm trellis:parallel:status -- --help`

Expected: all commands print help without errors.
