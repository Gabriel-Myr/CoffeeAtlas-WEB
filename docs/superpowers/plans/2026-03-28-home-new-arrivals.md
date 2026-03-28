# Home New Arrivals Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the miniprogram home page atlas experience with a lightweight new-arrivals page that keeps search, filter, pagination, and bean cards.

**Architecture:** Keep the change local to `pages/index`. Reuse existing new-arrival API helpers and UI components, and add one small pure helper module so the page orchestration stays testable.

**Tech Stack:** Taro, React 18, TypeScript, Node test runner

---

### Task 1: Lock the lightweight new-arrivals behavior with tests

**Files:**
- Modify: `apps/miniprogram/tests/home-new-arrivals-page.test.ts`
- Create: `apps/miniprogram/src/pages/index/new-arrivals-page.ts`

- [ ] **Step 1: Write the failing test**

Add tests for:
- new-arrivals helper should always build `isNewArrival: true` and `sort: 'updated_desc'`
- helper should detect whether any search/filter is active
- helper should return different empty-state text for filtered vs default state
- home page title should be `新品`

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @coffeeatlas/miniprogram exec node --test --experimental-strip-types tests/home-new-arrivals-page.test.ts`
Expected: FAIL because the helper file does not exist yet and the title is still `咖啡豆探索`

### Task 2: Implement the home new-arrivals page

**Files:**
- Modify: `apps/miniprogram/src/pages/index/index.tsx`
- Modify: `apps/miniprogram/src/pages/index/index.scss`
- Modify: `apps/miniprogram/src/pages/index/index.config.ts`
- Create: `apps/miniprogram/src/pages/index/new-arrivals-page.ts`

- [ ] **Step 1: Write minimal implementation**

Implement a lightweight page that:
- loads new-arrival filters from the existing API
- loads new-arrival beans with search and filters
- renders `SearchBar`, `NewArrivalFilterBar`, `BeanCard`, `EmptyState`
- supports pagination with `useReachBottom`

- [ ] **Step 2: Run test to verify it passes**

Run: `pnpm --filter @coffeeatlas/miniprogram exec node --test --experimental-strip-types tests/home-new-arrivals-page.test.ts`
Expected: PASS

### Task 3: Run targeted verification

**Files:**
- Verify only

- [ ] **Step 1: Run miniprogram typecheck**

Run: `pnpm --filter @coffeeatlas/miniprogram typecheck`
Expected: PASS

- [ ] **Step 2: Report manual verification note**

Call out that the user should open the miniprogram home tab and confirm it now shows only the lightweight new-arrivals experience.
