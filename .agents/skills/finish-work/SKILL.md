---
name: finish-work
description: Run the Trellis pre-commit completion checklist for this project, including quality, spec sync, test, and cross-layer review items.
---

This is the Codex entry for the Trellis `finish-work` workflow in this repository.
Follow the instructions below as the project-specific operating procedure.

# Finish Work - Pre-Commit Checklist

Before submitting or committing, use this checklist to ensure work completeness.

**Timing**: After code is written and tested, before commit

---

## Checklist

### 1. Code Quality

Run the commands that match the files you changed:

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

- [ ] `pnpm lint` passes?
- [ ] `pnpm typecheck` passes?
- [ ] Web backend/helper changes -> `pnpm --filter @coffeeatlas/web test` passes?
- [ ] Miniprogram changes -> `pnpm --filter @coffeeatlas/miniprogram typecheck` passes?
- [ ] API changes -> smoke/manual verification done?
- [ ] No leftover debug logging?
- [ ] No unnecessary non-null assertions (`x!`) or `any` types?

### 1.5. Test Coverage

Check if your change needs new or updated tests (see `.trellis/spec/unit-test/conventions.md`):

- [ ] New pure function -> unit test added?
- [ ] Bug fix in parser/normalizer/helper -> regression test added?
- [ ] API contract change -> helper test and smoke/manual check updated?
- [ ] No logic change (copy/style only) -> no new test needed?

### 2. Code-Spec Sync

- [ ] Does the relevant `.trellis/spec/<package>/<layer>/` doc need updates?
- [ ] If the change spans web / miniprogram / shared-types, did each affected package spec stay in sync?
- [ ] Does `.trellis/spec/unit-test/` need updates?
- [ ] Does `.trellis/spec/guides/` need updates?

Key question:
> If I changed a real contract, uncovered a trap, or confirmed a repo-specific rule, did I write it down in Trellis?

### 2.5. Code-Spec Hard Block (Infra/Cross-Layer)

If the change touches infra or cross-layer contracts:

- [ ] Spec content is executable, not abstract only
- [ ] File paths / API names / payload fields are documented
- [ ] Validation and error behavior are documented
- [ ] Good/base/bad cases are documented when useful
- [ ] Required verification steps are documented

### 3. API Changes

If you modified API endpoints:

- [ ] Request params/body contract updated?
- [ ] Response envelope and fields updated?
- [ ] Consumer code updated (`apps/miniprogram`, `packages/shared-types`, etc.)?
- [ ] Legacy compatibility considered if touching `/api/beans` or `/api/roasters`?

### 4. Database Changes

If you modified database schema or queries:

- [ ] Migration or SQL update added in the right place?
- [ ] Related query helpers updated?
- [ ] Fallback behavior still correct?
- [ ] Sensitive env usage still server-only?

### 5. Cross-Layer Verification

If the change spans multiple layers:

- [ ] Types are consistent across route/helper/client layers?
- [ ] `packages/shared-types`、`apps/miniprogram/src/types`、实际 API 响应保持一致?
- [ ] Error handling is consistent across boundaries?
- [ ] Pagination/search/filter params stay aligned?
- [ ] Entry intent / route params / page state stay aligned?
- [ ] Required manual path was exercised?

### 6. Manual Testing

- [ ] Feature works in browser / mini-program / script runtime?
- [ ] Error states tested?
- [ ] Empty/loading states checked if UI changed?
- [ ] Works after refresh or re-entry?
- [ ] 如果改了 discover / new arrivals / onboarding / favorites，已验证 storage 与回流路径?

---

## Quick Check Flow

```bash
pnpm lint && pnpm typecheck
pnpm --filter @coffeeatlas/miniprogram typecheck

git status
git diff --name-only
```

Then run the extra package-specific commands that match the changed files.

Only add `pnpm --filter @coffeeatlas/web test` and `smoke:api` when the change actually touches web/API layers.

---

## Core Principle

> Complete work = Code + Verification + Updated Trellis knowledge.
