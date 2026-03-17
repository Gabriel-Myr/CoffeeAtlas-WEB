# Refresh Trellis Specs

## Goal
Bring the Trellis workflow, code-spec docs, and local skill instructions in this repository up to date with the current CoffeeAtlas monorepo so future sessions read accurate context instead of stale bootstrap placeholders.

## Requirements
- Add the missing backend spec tree referenced by workflow and skills.
- Add unit-test guidance that matches the current test setup.
- Replace stale frontend index/bootstrap wording with repo-specific guidance.
- Correct workflow and checklist references that currently point to missing docs or wrong commands.
- Keep examples grounded in the current codebase under `apps/web`, `apps/miniprogram`, and `packages/*`.

## Acceptance Criteria
- [ ] `.trellis/spec/backend/` exists with the files referenced by Trellis skills.
- [ ] `.trellis/spec/unit-test/` exists and describes the current test runner and expectations.
- [ ] `.trellis/spec/frontend/index.md` reflects current repo conventions instead of bootstrap placeholders.
- [ ] `.trellis/workflow.md` and local Trellis skills reference real docs and valid commands.
- [ ] No updated Trellis doc still claims core implemented paths are missing when they already exist.

## Technical Notes
- Treat `@coffee-atlas/shared-types` as the canonical API contract layer.
- Capture both the modern `/api/v1/*` envelope pattern and the legacy `/api/beans` + `/api/roasters` compatibility routes.
- Prefer documenting current reality, including placeholders and incomplete packages, rather than aspirational architecture.
