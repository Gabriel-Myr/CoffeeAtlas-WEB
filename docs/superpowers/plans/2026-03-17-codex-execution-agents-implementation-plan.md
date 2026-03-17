# Codex Execution Agents Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a Codex-first Trellis execution chain with dispatch, implement, check, and debug agents, plus the script support needed to launch them from `start.py`.

**Architecture:** Keep orchestration in Python and keep role behavior in project-local agent markdown files. `start.py` launches Codex dispatch through a new `run_agent.py` helper, and dispatch routes later phases through the same helper instead of assuming Claude-style built-in agent orchestration.

**Tech Stack:** Python 3 launcher scripts, markdown agent prompts, Codex CLI, Trellis task utilities

---

### Task 1: Review and lock the execution contract

**Files:**
- Modify: `docs/superpowers/specs/2026-03-17-codex-execution-agents-design.md`
- Modify: `docs/superpowers/plans/2026-03-17-codex-execution-agents-implementation-plan.md`

- [ ] **Step 1: Re-read the spec and current Trellis launchers**

Confirm the Codex-only scope, script responsibilities, and existing launcher assumptions before coding.

- [ ] **Step 2: Record any runtime correction in the spec**

If the real launcher constraints differ from the drafted spec, update the spec before changing code.

### Task 2: Write failing tests for the Codex execution chain

**Files:**
- Create: `.trellis/scripts/tests/test_run_agent.py`
- Modify: `.trellis/scripts/tests/test_cli_adapter.py`
- Create: `.trellis/scripts/tests/test_start_launcher.py`

- [ ] **Step 1: Add a failing test for Codex execution agent name resolution**

Verify the adapter resolves execution agent paths under `.agents/agents/`.

- [ ] **Step 2: Add a failing test for Codex prompt injection**

Verify the runner can embed a project agent file and runtime prompt into a Codex command payload.

- [ ] **Step 3: Add a failing test for start-launcher Codex dispatch setup**

Verify `start.py` can build the correct Codex dispatch handoff without requiring the full remote run to succeed.

- [ ] **Step 4: Run the tests and confirm they fail for the expected missing behavior**

### Task 3: Implement the reusable Codex agent runner

**Files:**
- Create: `.trellis/scripts/multi_agent/run_agent.py`
- Modify: `.trellis/scripts/common/cli_adapter.py`

- [ ] **Step 1: Add the minimal runner helpers**

Implement agent-path resolution, Codex prompt construction, and command assembly.

- [ ] **Step 2: Add a script entry point**

Make the runner accept agent name, worktree path, log target, and runtime prompt.

- [ ] **Step 3: Re-run the targeted tests and confirm they pass**

### Task 4: Wire Codex dispatch launch into `start.py`

**Files:**
- Modify: `.trellis/scripts/multi_agent/start.py`
- Test: `.trellis/scripts/tests/test_start_launcher.py`

- [ ] **Step 1: Add `codex` to the accepted platform list**

- [ ] **Step 2: Route Codex startup through `run_agent.py dispatch`**

Keep worktree creation, task copying, session handling, and registry behavior intact.

- [ ] **Step 3: Improve operator output where needed**

Make it obvious which agent file, log file, and next command are relevant.

- [ ] **Step 4: Re-run start-launcher tests**

### Task 5: Add the Codex execution agent prompts

**Files:**
- Create: `.agents/agents/dispatch.md`
- Create: `.agents/agents/implement.md`
- Create: `.agents/agents/check.md`
- Create: `.agents/agents/debug.md`

- [ ] **Step 1: Draft the dispatch prompt**

Keep it orchestration-only and make it call the local runner script for later phases.

- [ ] **Step 2: Draft implement, check, and debug prompts**

Make each one read the right Trellis files first, stay in role, and report clearly.

- [ ] **Step 3: Review all prompts against the accepted spec**

### Task 6: Validate the Codex execution setup

**Files:**
- Test: `.trellis/scripts/tests/test_run_agent.py`
- Test: `.trellis/scripts/tests/test_start_launcher.py`
- Test: `.trellis/scripts/multi_agent/start.py`
- Test: `.trellis/scripts/multi_agent/run_agent.py`

- [ ] **Step 1: Run the Python unit tests**

- [ ] **Step 2: Run Python syntax compilation on the changed scripts**

- [ ] **Step 3: Run a smoke test in a temporary repo copy**

Confirm the launcher creates logs and injects the Codex dispatch prompt even if the local Codex CLI environment fails after startup.

- [ ] **Step 4: Review git diff for scope**

Make sure only the intended scripts, tests, agent files, and docs changed.
