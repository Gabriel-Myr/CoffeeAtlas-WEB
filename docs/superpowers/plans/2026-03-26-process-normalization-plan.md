# Process Normalization Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a normalized coffee processing model that stores raw text plus standardized base/style fields, then expose a guided two-step filtering experience for users.

**Architecture:** Add a shared normalization utility for process parsing, store canonical process fields alongside raw text in database-facing models, and update API/service payloads to expose base/style filter groups instead of a flat free-text list. Frontend consumers keep showing a readable process label while discover/filter flows move to "基础处理法 + 处理风格".

**Tech Stack:** Next.js 16, TypeScript, Node test runner, shared-types, Supabase SQL migrations, existing catalog/discover services

---

### Task 1: Lock the new contract with failing tests

**Files:**
- Modify: `packages/shared-types/src/catalog/index.ts`
- Modify: `apps/api/tests/public-bean-discover.test.ts`
- Modify: `apps/api/tests/new-arrival-filters.test.ts`
- Modify: `apps/api/tests/bean-query-params.test.ts`

- [ ] Step 1: Write failing tests for normalized process parsing and grouped discover filters
- [ ] Step 2: Run targeted tests to verify they fail for the expected contract gaps
- [ ] Step 3: Add minimal shared type updates for base/style filter contracts
- [ ] Step 4: Re-run targeted tests and keep them failing only on missing implementation

### Task 2: Implement shared normalization and service-layer mapping

**Files:**
- Create: `apps/api/lib/process.ts`
- Modify: `apps/api/lib/catalog-core.ts`
- Modify: `apps/api/lib/catalog-beans.ts`
- Modify: `apps/api/lib/server/public-beans.ts`
- Modify: `apps/api/lib/server/public-bean-discover.ts`
- Modify: `apps/api/lib/server/new-arrival-filters-helpers.ts`
- Modify: `apps/api/lib/server/new-arrival-filters-service.ts`

- [ ] Step 1: Write failing unit tests for process normalization helpers
- [ ] Step 2: Run the helper test file and confirm expected failures
- [ ] Step 3: Implement the minimal normalization utility and service mappings
- [ ] Step 4: Run the targeted helper/service tests until green

### Task 3: Update route/query contracts for two-step filtering

**Files:**
- Modify: `apps/api/lib/server/bean-query-params.ts`
- Modify: `apps/api/app/api/v1/beans/discover/route.ts`
- Modify: `apps/api/app/api/v1/beans/route.ts`

- [ ] Step 1: Add failing tests for parsing `processBase` and `processStyle`
- [ ] Step 2: Run the parsing tests and confirm failure
- [ ] Step 3: Implement minimal query parsing and route plumbing
- [ ] Step 4: Re-run query parsing and discover tests until green

### Task 4: Standardize import and persistence fields

**Files:**
- Modify: `apps/api/lib/taobao-sync/parsers.ts`
- Modify: `apps/api/lib/taobao-sync/repository.ts`
- Create: `apps/api/db/migrations/006_process_normalization.sql`

- [ ] Step 1: Add failing tests for parser output normalization
- [ ] Step 2: Run parser tests to confirm failure
- [ ] Step 3: Implement parser/repository updates and SQL migration for raw/base/style fields
- [ ] Step 4: Re-run parser-related tests until green

### Task 5: Verify and document the end-to-end behavior

**Files:**
- Modify: any touched files above as needed

- [ ] Step 1: Run `pnpm --filter @coffeeatlas/api test`
- [ ] Step 2: Run `pnpm typecheck`
- [ ] Step 3: Run `pnpm lint` if changed code passes typecheck
- [ ] Step 4: Summarize verification status and any follow-up migration/apply steps for the user
