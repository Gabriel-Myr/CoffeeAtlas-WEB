# Trellis Plan Agent Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a project-local planning agent specialized for Trellis task setup, and make the launcher give clearer feedback for operator use.

**Architecture:** Add a dedicated planning agent definition that matches the repository's Trellis planning contract, then tighten the launcher so it resolves the right agent path and explains setup failures and next steps clearly. Keep task schema and downstream workflow unchanged.

**Tech Stack:** Markdown agent definitions, Python 3 launcher scripts, Trellis task utilities

---

### Task 1: Confirm runtime-specific agent locations

**Files:**
- Modify: `docs/superpowers/specs/2026-03-17-trellis-plan-agent-design.md`
- Test: `/.trellis/scripts/common/cli_adapter.py`

- [ ] **Step 1: Inspect the adapter and runtime docs**

Check how OpenCode and Codex resolve agent files and whether both support project-local agents.

- [ ] **Step 2: Record any path correction needed in the design doc**

If implementation reality differs from the draft spec, update the spec to reflect the actual supported path and launcher behavior.

- [ ] **Step 3: Re-read the updated spec before coding**

Make sure the implementation follows the corrected contract rather than the earlier assumption.

### Task 2: Add the planning agent definition

**Files:**
- Create: `.opencode/agents/trellis-plan.md`
- Create: `.agents/agents/trellis-plan.md`
- Test: `.claude/agents/plan.md`

- [ ] **Step 1: Draft the OpenCode agent frontmatter and body**

Base the workflow on the existing Claude `plan` agent, but rewrite it for this repository and for planning-only behavior.

- [ ] **Step 2: Add the Codex-side mirror definition**

Keep the responsibility and workflow aligned so repository-local references stay consistent across runtimes. The Codex launcher should be able to inject this file into `codex exec`.

- [ ] **Step 3: Review both files against the accepted design**

Verify required inputs, rejection rules, planning steps, and output expectations are all present.

### Task 3: Improve the launcher experience

**Files:**
- Modify: `.trellis/scripts/common/cli_adapter.py`
- Modify: `.trellis/scripts/multi_agent/plan.py`
- Test: `.trellis/scripts/tests/test_cli_adapter.py`
- Test: `.trellis/scripts/tests/test_plan_launcher.py`

- [ ] **Step 1: Tighten missing-agent error output**

Show the exact platform, expected path, and a clear hint about what file is missing.

- [ ] **Step 2: Add Codex agent-name resolution and prompt injection**

Resolve `plan` to `trellis-plan` for Codex too, then have the launcher inject the project agent file into the `codex exec` prompt.

- [ ] **Step 3: Improve start/success messaging**

Make the log path, task directory, and next command easier to spot.

- [ ] **Step 4: Improve rejection discoverability**

When planning ends in rejection, make it obvious where `REJECTED.md` and `.plan-log` live.

### Task 4: Sync related guidance

**Files:**
- Modify: `.agents/skills/parallel/SKILL.md`

- [ ] **Step 1: Check whether Codex/OpenCode agent naming needs a note**

Only edit if the current wording would confuse a user about `trellis-plan`.

- [ ] **Step 2: Keep any guidance update minimal**

Avoid unrelated wording changes.

### Task 5: Validate both happy-path and rejection-path behavior

**Files:**
- Test: `.trellis/scripts/multi_agent/plan.py`

- [ ] **Step 1: Run a representative planning command**

Run a concrete requirement through the launcher and confirm the agent file resolves and a task directory is created.

- [ ] **Step 2: Run a vague requirement through the launcher**

Confirm rejection output is readable and points to the correct files.

- [ ] **Step 3: Review git diff for scope**

Make sure only the intended agent, script, and doc files changed.
