# Trellis Plan Agent for Codex/OpenCode

## Background

The repository already has a Claude planning agent at `.claude/agents/plan.md`.
The Trellis launcher at `.trellis/scripts/multi_agent/plan.py` already maps the
logical `plan` agent name to `trellis-plan` when running on OpenCode/Codex.

What is missing is the Codex-side agent definition that matches this mapping and
guides planning work in a way that fits this repository and this runtime.

## Goal

Add a Codex/OpenCode planning agent that is strong at turning a clear feature
request into a validated Trellis task directory, while keeping the existing
multi-agent pipeline contract unchanged.

## Scope

### In Scope

- Add an OpenCode agent definition at `.opencode/agents/trellis-plan.md`
- Add a Codex-side agent prompt file at `.agents/agents/trellis-plan.md`
- Keep the current input contract based on environment variables:
  - `PLAN_TASK_NAME`
  - `PLAN_DEV_TYPE`
  - `PLAN_REQUIREMENT`
  - `PLAN_TASK_DIR`
- Keep the current output contract based on Trellis task files:
  - `task.json`
  - `prd.md`
  - `implement.jsonl`
  - `check.jsonl`
  - `debug.jsonl`
- Tune the planning instructions for Codex/OpenCode and this monorepo
- Improve `.trellis/scripts/multi_agent/plan.py` messaging so Codex users get
  clearer success and failure output

### Out of Scope

- Starting the follow-up execution agent automatically
- Changing task directory schema
- Refactoring `.trellis/scripts/multi_agent/start.py`
- Changing the Claude agent contract unless compatibility requires it

## Design Principles

1. Preserve the current Trellis pipeline interface
2. Keep the planning agent focused on planning only
3. Prefer repository-specific instructions over generic agent wording
4. Fail early when requirements are vague, unsafe, or too large
5. Make success and failure states obvious from terminal output

## Files To Change

### 1. `.opencode/agents/trellis-plan.md`

Add a new OpenCode agent definition using the runtime's project agent path.

### 2. `.agents/agents/trellis-plan.md`

Add a Codex-side planning prompt file.

Planned structure:

- Frontmatter with agent name and short description
- Role and boundary statement
- Required inputs and expected outputs
- Acceptance and rejection rules
- Step-by-step planning workflow
- Output formatting requirements for logs and terminal visibility

These prompts should be based on the existing Claude planning logic, but
rewritten for Codex/OpenCode so they:

- speaks in terms of Codex behavior instead of Claude-specific behavior
- emphasizes reading Trellis specs and current code patterns
- stresses path validation and minimal, accurate context injection
- explicitly avoid implementation work and follow-up agent startup

For Codex specifically, the launcher should load this file and inject it into
the `codex exec` prompt, because the current Codex CLI adapter does not pass a
project agent name through the command line.

### 3. `.trellis/scripts/multi_agent/plan.py`

Keep the command-line interface unchanged:

- `--name`
- `--type`
- `--requirement`
- `--platform`

Planned refinements:

- clearer error when the mapped planning agent file is missing
- clearer success summary after the background plan agent starts
- clearer next-step hint for the user
- clearer visibility when a task is rejected and where to inspect the reason

These changes should improve usability without changing the workflow contract.

### 4. `.agents/skills/parallel/SKILL.md` (optional, only if needed)

Only update this file if the current wording is too vague for Codex users.
If changed, the update should be minimal and explain that the Codex planning
agent is resolved through the `trellis-plan` mapping.

## Agent Behavior

## Input Phase

The agent reads and echoes:

- task name
- development type
- requirement text
- task directory

It should treat these values as the authoritative planning input.

## Requirement Evaluation

The agent should reject requests that are:

- too vague to define done-ness
- missing critical information
- outside this repository's scope
- harmful or unsafe
- too broad and better split into smaller tasks

On rejection it should:

- set `task.json.status` to `rejected`
- write `REJECTED.md` with reason, details, and retry guidance
- print a short terminal-visible rejection summary

## Planning Phase

If the requirement is acceptable, the agent should:

1. initialize Trellis context files
2. inspect relevant Trellis specs and existing implementation patterns
3. identify useful context for:
   - `implement.jsonl`
   - `check.jsonl`
   - `debug.jsonl`
4. write a concrete `prd.md`
5. set branch, scope, and development type metadata
6. validate the final task directory

## PRD Expectations

The generated `prd.md` should include:

- clear overview
- explicit requirements
- checkable acceptance criteria
- technical notes and constraints
- out-of-scope items when useful

The PRD should be specific enough that a later implement/check agent can act on
it without guessing the basic contract.

## Context File Expectations

The planning agent should add only relevant files to the JSONL context lists.
It should prefer:

- Trellis spec files that match the task type
- existing production code patterns near the affected area
- shared contract files for cross-layer work

It should avoid noisy or weakly related context.

## Terminal Output Contract

### Success Output

The final output should make these items easy to find:

- task directory
- files created or updated
- context summary
- next command to start the follow-up pipeline

### Failure Output

The final output should clearly show:

- whether the failure came from invalid input or runtime setup
- the path the launcher expected for the planning agent definition
- the location of `REJECTED.md` or `.plan-log` when relevant

## Implementation Notes

### Compatibility

The new agent must remain compatible with the current adapter behavior in
`.trellis/scripts/common/cli_adapter.py`, which maps OpenCode `plan` to
`trellis-plan`. For Codex, the adapter naming should also resolve to
`trellis-plan` so the same logical plan agent name finds the project-local
prompt file consistently.

### Minimal-Risk Strategy

- add the OpenCode/Codex agent files instead of replacing existing Claude files
- avoid schema changes in task files
- keep launcher parameters stable
- limit script edits to messaging and operator clarity

## Validation Plan

After implementation, validate with a representative command such as:

```bash
python3 ./.trellis/scripts/multi_agent/plan.py \
  --name sample-task \
  --type fullstack \
  --requirement "Add a searchable coffee roaster filter to the public atlas page."
```

Validation should confirm:

- the launcher finds the correct agent file for the selected platform
- a task directory is created successfully
- the agent writes `prd.md` and JSONL context files
- success output gives a usable next step
- rejection output is readable when given a vague requirement

## Risks

- The Codex agent format may differ from what the local launcher expects
- A prompt that is too generic may produce weak PRDs or noisy context files
- Over-editing `plan.py` could unintentionally change the current workflow

## Risk Mitigation

- keep the first version close to the proven Claude workflow shape
- only tune wording and operator feedback where Codex needs it
- verify both a success case and a rejection case

## Acceptance Criteria

- `.opencode/agents/trellis-plan.md` exists for OpenCode use
- `.agents/agents/trellis-plan.md` exists for Codex launcher prompt injection
- Codex/OpenCode planning flow works without changing command arguments
- the planning agent only prepares the task directory and does not auto-start
  the next execution agent
- `plan.py` gives clearer success and failure feedback than before
- no existing Claude-based workflow is broken by the change
