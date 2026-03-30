# Refresh Trellis Specs

## Goal
Bring the Trellis workflow, code-spec docs, and local skill instructions in this repository up to date with the current CoffeeAtlas monorepo so future sessions read accurate context instead of stale bootstrap placeholders.

## Requirements
- Add or refresh the package-scoped spec trees referenced by workflow and skills.
- Add unit-test guidance that matches the current test setup.
- Replace stale bootstrap wording and flat-spec references with repo-specific, package-scoped guidance.
- Correct workflow and checklist references that currently point to missing docs or wrong commands.
- Keep examples grounded in the current codebase under `apps/api`, `apps/miniprogram`, and `packages/*`.

## Acceptance Criteria
- [ ] `.trellis/spec/api/`, `.trellis/spec/miniprogram/`, and `.trellis/spec/shared-types/` match the docs and skill references they expose.
- [ ] `.trellis/spec/unit-test/` exists and describes the current test runner and expectations.
- [ ] Entry docs and local Trellis skills reference package-scoped docs and valid commands.
- [ ] No updated Trellis doc still claims core implemented paths are missing when they already exist.

## Technical Notes
- Treat `@coffee-atlas/shared-types` as the canonical API contract layer.
- Capture both the modern `/api/v1/*` envelope pattern and the legacy `/api/beans` + `/api/roasters` compatibility routes.
- Prefer documenting current reality, including placeholders and incomplete packages, rather than aspirational architecture.
