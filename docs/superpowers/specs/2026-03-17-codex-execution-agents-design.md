# Codex Execution Agents for Trellis

## Background

The repository now has a Codex planning agent at `.agents/agents/trellis-plan.md`
and the planning launcher can inject that agent into `codex exec`.

What is still missing is the execution side of the Trellis multi-agent flow for
Codex: dispatch, implement, check, and debug.

The existing Claude flow already defines these roles in `.claude/agents/`, but
that structure assumes Claude-specific agent orchestration. This design keeps
the same Trellis concepts while adapting the execution flow to how Codex is
actually launched in this repository.

## Goal

Add a Codex-first execution pipeline for Trellis so a planned task can be
started from `start.py` and executed through project-local agent prompts using
Codex CLI.

## Scope

### In Scope

- Add Codex agent definitions at:
  - `.agents/agents/dispatch.md`
  - `.agents/agents/implement.md`
  - `.agents/agents/check.md`
  - `.agents/agents/debug.md`
- Add a Codex-oriented launcher helper:
  - `.trellis/scripts/multi_agent/run_agent.py`
- Update `.trellis/scripts/multi_agent/start.py` so it supports `--platform codex`
- Keep the existing Trellis task directory contract
- Keep `create-pr` on the script side instead of moving it into agent prompts

### Out of Scope

- Supporting OpenCode in this round
- Reworking task schema
- Replacing the current Claude pipeline
- Large refactors to unrelated Trellis scripts

## Recommended Architecture

Use a Codex hybrid architecture:

1. Python scripts handle process orchestration
2. Agent markdown files define role behavior and local workflow rules
3. Codex CLI receives an injected prompt built from:
   - the selected project agent file
   - the runtime task instruction

This is preferred over copying Claude's agent-to-agent orchestration because
Codex does not use the same built-in subagent calling model.

## Files To Add Or Change

### 1. `.agents/agents/dispatch.md`

Codex dispatch agent prompt.

Responsibilities:

- read `.trellis/.current-task`
- inspect `task.json`
- determine the next pending phase
- invoke the local runner script for `implement`, `check`, or `debug`
- hand off `create-pr` to the existing Trellis script

It should stay a pure dispatcher and should not implement feature code itself.

### 2. `.agents/agents/implement.md`

Codex implementation agent prompt.

Responsibilities:

- read `prd.md`
- read context files from `implement.jsonl`
- follow Trellis specs and local patterns
- implement only the scoped requirement
- run relevant verification for the changes it makes

It must not commit or push.

### 3. `.agents/agents/check.md`

Codex self-fixing review agent prompt.

Responsibilities:

- inspect changed files and `check.jsonl`
- compare changes against relevant specs
- fix issues directly when safe
- run required checks
- clearly report fixed and unresolved items

It should be written for Codex and not depend on Claude-only loop markers unless
the current Codex execution chain proves they are still required.

### 4. `.agents/agents/debug.md`

Codex debugging agent prompt.

Responsibilities:

- read explicit issue context
- apply targeted fixes
- avoid unrelated refactors
- re-run focused verification

### 5. `.trellis/scripts/multi_agent/run_agent.py`

New helper script for launching project-local execution agents with Codex.

Responsibilities:

- accept the agent name and runtime prompt
- resolve the project agent file path
- inject that file into a Codex prompt
- start `codex exec` with the correct working directory and env
- write logs in a predictable location
- exit with a useful status for the caller

This script becomes the stable boundary between Trellis orchestration and Codex
CLI execution.

### 6. `.trellis/scripts/multi_agent/start.py`

Update this launcher so Codex can start the execution chain.

Required changes:

- support `--platform codex`
- resolve the Codex dispatch agent path
- start dispatch through `run_agent.py` instead of inlining all Codex prompt
  assembly in `start.py`
- keep current worktree creation and registry behavior unchanged

## Runtime Flow

### Start Phase

`start.py` should:

1. validate task directory and branch data
2. create or reuse the worktree
3. copy task data into the worktree
4. set `.trellis/.current-task`
5. call `run_agent.py dispatch`

### Dispatch Phase

`dispatch` should:

1. read current task path
2. load `task.json`
3. pick the next unfinished action from `next_action`
4. route to:
   - `run_agent.py implement`
   - `run_agent.py check`
   - `run_agent.py debug`
   - existing `create_pr.py` for PR creation

### Worker Phases

The worker agents should be role-specific:

- `implement`: build the requested change
- `check`: self-review and fix
- `debug`: targeted repairs

They should rely on Trellis task files for context instead of ad-hoc discovery.

## Prompt Design Principles

All Codex agent prompts should:

- use direct, execution-oriented wording
- say exactly what to read first
- say what is forbidden
- say what verification is required
- say what a finished report should include

They should avoid pretending Codex has Claude's built-in `Task(...)` dispatch
API.

## Validation Strategy

### Unit-Level

Add Python tests for:

- agent-path resolution
- Codex prompt injection
- dispatch launcher command building
- start launcher Codex branch selection

### Smoke-Level

In a temporary copy of the repo:

- run `start.py` with a planned task on `--platform codex`
- confirm the dispatch chain can start and log the injected dispatch prompt

Because Codex CLI on this machine currently has independent environment issues,
the smoke requirement for this task is:

- successful launcher setup
- correct agent prompt injection
- correct log creation

not full remote-model completion.

## Risks

- Codex CLI may fail after launch for machine-local reasons unrelated to these
  repository changes
- dispatch may accidentally gain too much orchestration logic
- worker prompts may be too vague and produce weak execution behavior

## Risk Mitigation

- keep process orchestration in Python, not in markdown prompts
- keep agent prompts role-specific and narrow
- verify prompt injection and launcher behavior separately from remote-model
  execution

## Acceptance Criteria

- Codex execution agents exist under `.agents/agents/`
- `start.py --platform codex` is supported
- `run_agent.py` can launch a named Codex execution agent using project-local
  prompt injection
- dispatch stays orchestration-only
- implement/check/debug prompts are specialized and Codex-oriented
- validation covers command building and Codex launcher setup
